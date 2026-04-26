/**
 * enrich-one-park.ts
 *
 * Adds or updates a single park using Google Places, NPS API, and AI content generation.
 * Interactive — shows a preview and asks for confirmation before writing to the database.
 *
 * Usage:
 *   npx tsx scripts/enrich-one-park.ts "Blue Spring State Park"
 *   npx tsx scripts/enrich-one-park.ts "Everglades National Park" --no-ai
 *   npx tsx scripts/enrich-one-park.ts "Blue Spring State Park" --no-photo
 *   npx tsx scripts/enrich-one-park.ts "Blue Spring State Park" --overwrite
 */

import * as dotenv from 'dotenv';
import path from 'path';
import * as readline from 'readline';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { supabaseAdmin } from './lib/supabase-admin.js';
import { findPark, getPlaceDetails } from './lib/google-places.js';
import { fetchFloridaNpsParks } from './lib/nps-api.js';

// ─── CLI Args ────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const parkName = args.find(a => !a.startsWith('--'));
const noAi = args.includes('--no-ai');
const noPhoto = args.includes('--no-photo');
const overwrite = args.includes('--overwrite');

if (!parkName) {
  console.error('Usage: npx tsx scripts/enrich-one-park.ts "Park Name" [--no-ai] [--no-photo] [--overwrite]');
  process.exit(1);
}

// ─── Colors ──────────────────────────────────────────────────────────────────

const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  red: '\x1b[31m',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    rl.question(question, answer => { rl.close(); resolve(answer.trim()); });
  });
}

const PHOTO_BUCKET = 'park-photos';

async function uploadPhotoToStorage(photoUrl: string, slug: string): Promise<string | null> {
  try {
    const res = await fetch(photoUrl);
    if (!res.ok) return null;
    const buffer = await res.arrayBuffer();
    const contentType = res.headers.get('content-type') ?? 'image/jpeg';
    const ext = contentType.includes('png') ? 'png' : 'jpg';
    const fileName = `${slug}-${Date.now()}.${ext}`;

    const { error } = await supabaseAdmin.storage
      .from(PHOTO_BUCKET)
      .upload(fileName, Buffer.from(buffer), { contentType, upsert: true });

    if (error) { console.warn(`  ${c.yellow}Storage upload failed: ${error.message}${c.reset}`); return null; }

    const { data } = supabaseAdmin.storage.from(PHOTO_BUCKET).getPublicUrl(fileName);
    return data.publicUrl;
  } catch (e) {
    console.warn(`  ${c.yellow}Photo upload error: ${(e as Error).message}${c.reset}`);
    return null;
  }
}

async function generateParkContent(park: { name: string; park_type?: string | null; city?: string | null; park_region?: string | null }) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.warn(`  ${c.yellow}Skipping AI content — ANTHROPIC_API_KEY not set${c.reset}`);
    return null;
  }

  const prompt = `You are writing concise, accurate content for a Florida parks directory website.

Park: ${park.name}
Type: ${park.park_type ?? 'Unknown'}
City/Area: ${park.city ?? 'Florida'}
Region: ${park.park_region ?? 'Florida'}

Write the following. Be factual, engaging, and specific to this park. Do not invent specific statistics.

1. short_description: One sentence, max 160 characters, suitable for a card subtitle.
2. full_description: 3–4 paragraphs covering the park's character, highlights, what visitors can do, and why it's worth visiting. Plain text, no markdown.
3. visitor_tips: 3–5 practical tips for visiting (best time, parking, what to bring, etc.). Plain text bullet points starting with "•".
4. wildlife_summary: One paragraph describing typical wildlife and natural features. Plain text.

Respond ONLY with valid JSON in this exact shape:
{
  "short_description": "...",
  "full_description": "...",
  "visitor_tips": "...",
  "wildlife_summary": "..."
}`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.warn(`  ${c.yellow}AI API error: ${res.status} — ${body}${c.reset}`);
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await res.json() as any;
  const text: string = data.content?.[0]?.text ?? '';

  try {
    const clean = text.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim();
    return JSON.parse(clean) as {
      short_description: string;
      full_description: string;
      visitor_tips: string;
      wildlife_summary: string;
    };
  } catch {
    console.warn(`  ${c.yellow}Failed to parse AI response: ${text.slice(0, 120)}${c.reset}`);
    return null;
  }
}

function printField(label: string, value: string | null | undefined, color: string) {
  if (!value) return;
  const short = value.length > 120 ? value.slice(0, 117) + '…' : value;
  console.log(`  ${c.gray}${label.padEnd(20)}${c.reset}${color}${short}${c.reset}`);
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const slug = toSlug(parkName!);
  console.log(`\n${c.bold}${c.cyan}Enriching: ${parkName}${c.reset}  ${c.gray}(slug: ${slug})${c.reset}\n`);

  // ── Step 1: Check existing DB record ─────────────────────────────────────
  const { data: existing } = await supabaseAdmin
    .from('parks')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  const isNew = !existing;
  console.log(isNew
    ? `${c.green}→ New park (not found in DB)${c.reset}`
    : `${c.yellow}→ Existing park found — will fill empty fields${overwrite ? ' + overwrite all' : ''}${c.reset}`
  );

  // ── Step 2: Google Places ─────────────────────────────────────────────────
  console.log(`\n${c.bold}[1/3] Google Places…${c.reset}`);
  let placeData: Record<string, unknown> = {};

  try {
    const placeId = await findPark(`${parkName} Florida`);
    if (!placeId) {
      console.log(`  ${c.yellow}No Google Places result found.${c.reset}`);
    } else {
      const details = await getPlaceDetails(placeId);
      if (details) {
        console.log(`  ${c.green}Found: ${details.name}${c.reset}`);
        placeData = {
          address: details.address || null,
          city: details.city || null,
          zip_code: details.zipCode || null,
          phone: details.phone,
          website: details.website,
          google_rating: details.rating,
          operating_hours: details.operatingHours,
          latitude: details.lat,
          longitude: details.lng,
        };

        // Photo
        if (!noPhoto && details.photoUrl) {
          console.log(`  Uploading photo…`);
          const photoUrl = await uploadPhotoToStorage(details.photoUrl, slug);
          if (photoUrl) {
            placeData.featured_image_url = photoUrl;
            console.log(`  ${c.green}Photo uploaded${c.reset}`);
          }
        }
      }
    }
  } catch (e) {
    console.warn(`  ${c.yellow}Google Places error: ${(e as Error).message}${c.reset}`);
  }

  // ── Step 3: NPS API ───────────────────────────────────────────────────────
  console.log(`\n${c.bold}[2/3] NPS API…${c.reset}`);
  let npsData: Record<string, unknown> = {};

  if (!process.env.NPS_API_KEY) {
    console.log(`  ${c.gray}NPS_API_KEY not set — skipping${c.reset}`);
  } else {
    try {
      const npsParks = await fetchFloridaNpsParks();
      const match = npsParks.find(p =>
        toSlug(p.fullName) === slug ||
        p.fullName.toLowerCase().includes(parkName!.toLowerCase())
      );
      if (!match) {
        console.log(`  ${c.gray}No NPS match found${c.reset}`);
      } else {
        console.log(`  ${c.green}NPS match: ${match.fullName}${c.reset}`);
        const fee = match.entranceFees?.[0]?.cost
          ? `$${parseFloat(match.entranceFees[0].cost).toFixed(2)}/person`
          : null;
        const hours = match.operatingHours?.[0]?.description ?? null;
        npsData = {
          entrance_fee: fee,
          operating_hours: hours,
          website: match.url || null,
        };
      }
    } catch (e) {
      console.warn(`  ${c.yellow}NPS API error: ${(e as Error).message}${c.reset}`);
    }
  }

  // ── Step 4: AI content ────────────────────────────────────────────────────
  console.log(`\n${c.bold}[3/3] AI content generation…${c.reset}`);
  let aiData: Record<string, unknown> = {};

  if (noAi) {
    console.log(`  ${c.gray}Skipped (--no-ai)${c.reset}`);
  } else {
    const aiResult = await generateParkContent({
      name: parkName!,
      park_type: existing?.park_type ?? null,
      city: (placeData.city as string) ?? existing?.city ?? null,
      park_region: existing?.park_region ?? null,
    });
    if (aiResult) {
      aiData = aiResult;
      console.log(`  ${c.green}AI content generated${c.reset}`);
    }
  }

  // ── Step 5: Merge & diff ──────────────────────────────────────────────────
  const collected: Record<string, unknown> = {
    slug,
    name: parkName,
    ...placeData,
    ...npsData,  // NPS fills gaps in Google data (hours, website)
    ...aiData,
  };

  // For new parks, all collected fields are applied.
  // For existing parks, only apply to null/empty fields (unless --overwrite).
  const toApply: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(collected)) {
    if (value === null || value === undefined || value === '') continue;
    if (!isNew) {
      const currentVal = existing[key];
      const isEmpty = currentVal === null || currentVal === undefined || currentVal === '' ||
        (['latitude', 'longitude'].includes(key) && currentVal === 0);
      if (!isEmpty && !overwrite) continue;
    }
    toApply[key] = value;
  }

  // ── Step 6: Preview ───────────────────────────────────────────────────────
  console.log(`\n${c.bold}─── Preview ───────────────────────────────────────────────${c.reset}`);

  if (Object.keys(toApply).length === 0) {
    console.log(`\n${c.green}No changes to apply — park is already fully populated.${c.reset}`);
    console.log(`${c.gray}Use --overwrite to force-update all fields.${c.reset}\n`);
    return;
  }

  const color = isNew ? c.green : c.yellow;
  for (const [key, value] of Object.entries(toApply)) {
    if (key === 'slug' || key === 'name') continue;
    printField(key, String(value), color);
  }

  const action = isNew ? 'Create park' : `Apply ${Object.keys(toApply).length} changes`;
  const answer = await prompt(`\n${c.bold}${action}? (y/n): ${c.reset}`);

  if (answer.toLowerCase() !== 'y') {
    console.log(`${c.gray}Aborted.${c.reset}\n`);
    return;
  }

  // ── Step 7: Write to DB ───────────────────────────────────────────────────
  if (isNew) {
    const { error } = await supabaseAdmin.from('parks').insert(toApply);
    if (error) {
      console.error(`\n${c.red}Insert failed: ${error.message}${c.reset}\n`);
      process.exit(1);
    }
    console.log(`\n${c.green}✓ Park created: /admin/parks/${slug}${c.reset}\n`);
  } else {
    const { error } = await supabaseAdmin.from('parks').update(toApply).eq('slug', slug);
    if (error) {
      console.error(`\n${c.red}Update failed: ${error.message}${c.reset}\n`);
      process.exit(1);
    }
    console.log(`\n${c.green}✓ Park updated: /admin/parks/${slug}${c.reset}\n`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
