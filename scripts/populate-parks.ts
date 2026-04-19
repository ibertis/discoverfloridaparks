/**
 * populate-parks.ts
 *
 * Enriches existing parks and adds new FL state/national parks to Supabase.
 *
 * Usage:
 *   npx tsx scripts/populate-parks.ts --dry-run           # output CSVs only
 *   npx tsx scripts/populate-parks.ts --commit            # apply approved CSVs to DB
 *   npx tsx scripts/populate-parks.ts --dry-run --limit=5 # test against 5 parks
 *   npx tsx scripts/populate-parks.ts --dry-run --source=google
 *   npx tsx scripts/populate-parks.ts --dry-run --source=nps
 *   npx tsx scripts/populate-parks.ts --dry-run --new-only
 *   npx tsx scripts/populate-parks.ts --dry-run --existing-only
 *
 * After --dry-run: review scripts/review/enrichment-diff.csv and scripts/review/new-parks.csv
 * Delete rows you don't want, then re-run with --commit.
 */

import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { supabaseAdmin } from './lib/supabase-admin.js';
import { findPark, getPlaceDetails } from './lib/google-places.js';
import { fetchFloridaNpsParks } from './lib/nps-api.js';
import { fetchFlStateParksList } from './lib/fl-state-parks.js';

// ─── CLI Args ────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const isCommit = args.includes('--commit');
const newOnly = args.includes('--new-only');
const existingOnly = args.includes('--existing-only');
const limitArg = args.find(a => a.startsWith('--limit='));
const limit = limitArg ? parseInt(limitArg.split('=')[1]) : Infinity;
const sourceArg = args.find(a => a.startsWith('--source='));
const sourceFilter = sourceArg ? sourceArg.split('=')[1] : null; // 'google' | 'nps' | 'ai'

if (!isDryRun && !isCommit) {
  console.error('Usage: npx tsx scripts/populate-parks.ts --dry-run | --commit');
  process.exit(1);
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface ParkRow {
  id: string;
  slug: string;
  name: string;
  park_type: string | null;
  park_region: string | null;
  city: string | null;
  address: string | null;
  zip_code: string | null;
  phone: string | null;
  website: string | null;
  google_rating: number | null;
  operating_hours: string | null;
  featured_image_url: string | null;
  latitude: number | null;
  longitude: number | null;
  short_description: string | null;
  full_description: string | null;
  visitor_tips: string | null;
  wildlife_summary: string | null;
  entrance_fee: string | null;
}

interface DiffRow {
  park_name: string;
  slug: string;
  field: string;
  current_value: string;
  proposed_value: string;
  source: string;
}

interface NewParkRow {
  slug: string;
  name: string;
  park_type: string;
  park_region: string;
  city: string;
  address: string;
  zip_code: string;
  phone: string;
  website: string;
  google_rating: string;
  operating_hours: string;
  featured_image_url: string;
  latitude: string;
  longitude: string;
  short_description: string;
  entrance_fee: string;
  source: string;
}

// ─── CSV helpers ─────────────────────────────────────────────────────────────

function escapeCsv(val: unknown): string {
  const s = val == null ? '' : String(val);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function rowToCsv(headers: string[], obj: Record<string, unknown>): string {
  return headers.map(h => escapeCsv(obj[h])).join(',');
}

function writeCsv(filePath: string, headers: string[], rows: Record<string, unknown>[]): void { // eslint-disable-line @typescript-eslint/no-explicit-any
  const lines = [headers.join(','), ...rows.map(r => rowToCsv(headers, r))];
  fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');
}

function readCsv(filePath: string): Record<string, string>[] {
  if (!fs.existsSync(filePath)) return [];
  const lines = fs.readFileSync(filePath, 'utf-8').split('\n').filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',');
  return lines.slice(1).map(line => {
    const values = parseCsvLine(line);
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? '']));
  });
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current); current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

// ─── Slug generation ─────────────────────────────────────────────────────────

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// ─── Photo upload to Supabase Storage ───────────────────────────────────────

const PHOTO_BUCKET = 'park-photos';

async function ensurePhotoBucket() {
  const { error } = await supabaseAdmin.storage.createBucket(PHOTO_BUCKET, { public: true });
  // Ignore "already exists" errors
  if (error && !error.message.includes('already exists')) {
    console.warn(`  Could not create storage bucket: ${error.message}`);
  }
}

async function uploadPhotoToStorage(photoUrl: string, slug: string): Promise<string | null> {
  try {
    const res = await fetch(photoUrl);
    if (!res.ok) return null;
    const buffer = await res.arrayBuffer();
    const contentType = res.headers.get('content-type') ?? 'image/jpeg';
    const ext = contentType.includes('png') ? 'png' : 'jpg';
    const fileName = `${slug}.${ext}`;

    const { error } = await supabaseAdmin.storage
      .from(PHOTO_BUCKET)
      .upload(fileName, Buffer.from(buffer), { contentType, upsert: true });

    if (error) {
      console.warn(`  Storage upload failed for ${slug}: ${error.message}`);
      return null;
    }

    const { data } = supabaseAdmin.storage.from(PHOTO_BUCKET).getPublicUrl(fileName);
    return data.publicUrl;
  } catch (e) {
    console.warn(`  Photo upload error for ${slug}: ${(e as Error).message}`);
    return null;
  }
}

// ─── AI content generation ───────────────────────────────────────────────────

async function generateParkContent(park: { name: string; park_type: string | null; city: string | null; park_region: string | null }) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.warn(`  Skipping AI content for "${park.name}" — ANTHROPIC_API_KEY not set`);
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
    console.warn(`  AI API error for "${park.name}": ${res.status} — ${body}`);
    return null;
  }

  const data = await res.json() as any;
  const text: string = data.content?.[0]?.text ?? '';

  try {
    // Strip markdown code fences if present
    const clean = text.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim();
    return JSON.parse(clean) as {
      short_description: string;
      full_description: string;
      visitor_tips: string;
      wildlife_summary: string;
    };
  } catch {
    console.warn(`  Failed to parse AI response for "${park.name}": ${text.slice(0, 120)}`);
    return null;
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const reviewDir = path.resolve(process.cwd(), 'scripts/review');
  fs.mkdirSync(reviewDir, { recursive: true });

  const diffPath = path.join(reviewDir, 'enrichment-diff.csv');
  const newParksPath = path.join(reviewDir, 'new-parks.csv');

  // ── COMMIT MODE ───────────────────────────────────────────────────────────
  if (isCommit) {
    console.log('📥 Commit mode — reading approved CSVs...\n');

    // Apply enrichment diffs
    const diffs = readCsv(diffPath);
    if (diffs.length > 0) {
      // Group by slug
      const bySlug = new Map<string, Record<string, string>>();
      for (const row of diffs) {
        if (!bySlug.has(row.slug)) bySlug.set(row.slug, {});
        bySlug.get(row.slug)![row.field] = row.proposed_value;
      }

      console.log(`Applying ${diffs.length} field updates across ${bySlug.size} existing parks...`);
      for (const [slug, updates] of bySlug) {
        const { error } = await supabaseAdmin
          .from('parks')
          .update(updates)
          .eq('slug', slug);
        if (error) console.error(`  ✗ ${slug}: ${error.message}`);
        else console.log(`  ✓ ${slug}`);
      }
    } else {
      console.log('No enrichment-diff.csv rows to apply.');
    }

    // Apply new parks
    const newParks = readCsv(newParksPath);
    if (newParks.length > 0) {
      console.log(`\nInserting ${newParks.length} new parks...`);
      for (const row of newParks) {
        const insert: Record<string, unknown> = {
          slug: row.slug,
          name: row.name,
          park_type: row.park_type || null,
          park_region: row.park_region || null,
          city: row.city || null,
          address: row.address || null,
          zip_code: row.zip_code || null,
          phone: row.phone || null,
          website: row.website || null,
          google_rating: row.google_rating ? parseFloat(row.google_rating) : null,
          operating_hours: row.operating_hours || null,
          featured_image_url: row.featured_image_url || null,
          latitude: row.latitude ? parseFloat(row.latitude) : null,
          longitude: row.longitude ? parseFloat(row.longitude) : null,
          short_description: row.short_description || null,
          entrance_fee: row.entrance_fee || null,
          is_featured: false,
        };
        const { error } = await supabaseAdmin
          .from('parks')
          .upsert(insert, { onConflict: 'slug' });
        if (error) console.error(`  ✗ ${row.name}: ${error.message}`);
        else console.log(`  ✓ ${row.name}`);
      }
    } else {
      console.log('No new-parks.csv rows to apply.');
    }

    console.log('\n✅ Commit complete.');
    return;
  }

  // ── DRY-RUN MODE ──────────────────────────────────────────────────────────
  console.log('🔍 Dry-run mode — fetching data and generating CSVs...\n');
  await ensurePhotoBucket();

  // Fetch existing parks from Supabase
  const { data: existingParks, error: dbError } = await supabaseAdmin
    .from('parks')
    .select('id,slug,name,park_type,park_region,city,address,zip_code,phone,website,google_rating,operating_hours,featured_image_url,latitude,longitude,short_description,full_description,visitor_tips,wildlife_summary,entrance_fee');

  if (dbError) throw new Error(`Supabase error: ${dbError.message}`);
  const parks = (existingParks ?? []) as ParkRow[];
  const existingSlugSet = new Set(parks.map(p => p.slug));
  console.log(`Found ${parks.length} existing parks in DB.\n`);

  // ── Phase 1: Build master list ────────────────────────────────────────────

  let newParkCandidates: { name: string; slug: string; park_type: string; npsData?: any }[] = [];

  if (!existingOnly && (!sourceFilter || sourceFilter === 'nps')) {
    console.log('📡 Fetching NPS Florida parks...');
    const npsParks = await fetchFloridaNpsParks();
    console.log(`  Got ${npsParks.length} NPS parks.`);
    for (const np of npsParks) {
      const slug = toSlug(np.fullName);
      if (!existingSlugSet.has(slug)) {
        newParkCandidates.push({ name: np.fullName, slug, park_type: 'National Parks', npsData: np });
      }
    }
  }

  if (!existingOnly && (!sourceFilter || sourceFilter === 'google')) {
    console.log('🌴 Fetching FL State Parks list...');
    try {
      const flParks = await fetchFlStateParksList();
      console.log(`  Got ${flParks.length} FL state park slugs.`);
      for (const fp of flParks) {
        if (!existingSlugSet.has(fp.slug) && !newParkCandidates.some(c => c.slug === fp.slug)) {
          newParkCandidates.push({ name: fp.name, slug: fp.slug, park_type: 'State Parks' });
        }
      }
    } catch (e) {
      console.warn(`  Could not fetch FL State Parks list: ${(e as Error).message}`);
    }
  }

  if (limit < Infinity) newParkCandidates = newParkCandidates.slice(0, limit);
  console.log(`\n${newParkCandidates.length} new parks identified.\n`);

  // ── Phase 2: Google Places enrichment ────────────────────────────────────

  const diffRows: DiffRow[] = [];
  const newParkRows: NewParkRow[] = [];

  const runGoogle = !sourceFilter || sourceFilter === 'google';

  // Enrich existing parks
  if (!newOnly && runGoogle) {
    const toEnrich = limit < Infinity ? parks.slice(0, limit) : parks;
    console.log(`🔍 Enriching ${toEnrich.length} existing parks via Google Places...`);

    for (const park of toEnrich) {
      process.stdout.write(`  ${park.name}... `);
      const query = `${park.name} ${park.city ?? ''} Florida`;
      let placeId: string | null = null;
      try {
        placeId = await findPark(query);
      } catch (e) {
        console.log(`\n⚠️  Google Places unavailable: ${(e as Error).message}\n   Skipping Google pass.`);
        break;
      }
      if (!placeId) { console.log('not found'); continue; }

      const details = await getPlaceDetails(placeId);
      if (!details) { console.log('no details'); continue; }

      const fieldMap: [keyof ParkRow, string | number | null, string | number | null][] = [
        ['address',         park.address, details.address],
        ['city',            park.city,    details.city],
        ['zip_code',        park.zip_code, details.zipCode],
        ['phone',           park.phone,   details.phone],
        ['website',         park.website, details.website],
        ['google_rating',   park.google_rating, details.rating],
        ['operating_hours', park.operating_hours, details.operatingHours],
        ['latitude',        park.latitude, details.lat],
        ['longitude',       park.longitude, details.lng],
      ];

      if (!park.featured_image_url && details.photoUrl) {
        const storedUrl = await uploadPhotoToStorage(details.photoUrl, park.slug);
        if (storedUrl) fieldMap.push(['featured_image_url', null, storedUrl]);
      }

      let changes = 0;
      for (const [field, current, proposed] of fieldMap) {
        if (current == null && proposed != null) {
          diffRows.push({
            park_name: park.name,
            slug: park.slug,
            field: field as string,
            current_value: '',
            proposed_value: String(proposed),
            source: 'google-places',
          });
          changes++;
        }
      }
      console.log(`${changes} fields queued`);
    }
  }

  // Enrich + collect new parks
  if (!existingOnly && runGoogle) {
    console.log(`\n🆕 Fetching Google Places data for ${newParkCandidates.length} new parks...`);

    for (const candidate of newParkCandidates) {
      process.stdout.write(`  ${candidate.name}... `);

      let details = null;
      if (!sourceFilter || sourceFilter === 'google') {
        try {
          const query = `${candidate.name} Florida`;
          const placeId = await findPark(query);
          if (placeId) details = await getPlaceDetails(placeId);
        } catch (e) {
          console.log(`\n⚠️  Google Places unavailable — skipping Google pass for new parks.`);
          // Still add the park stub using NPS data if available
        }
      }

      // Override with NPS data if available
      const nps = candidate.npsData;
      const npsAddress = nps?.addresses?.[0];
      const npsPhone = nps?.contacts?.phoneNumbers?.[0]?.phoneNumber ?? null;
      const npsFee = nps?.entranceFees?.[0]?.cost ? `$${nps.entranceFees[0].cost}` : null;
      const npsHours = nps?.operatingHours?.[0]?.description ?? null;
      const npsImage = nps?.images?.[0]?.url ?? null;
      const npsShortDesc = nps?.shortDescription ?? null;

      const row: NewParkRow = {
        slug: candidate.slug,
        name: details?.name ?? candidate.name,
        park_type: candidate.park_type,
        park_region: '',
        city: npsAddress?.city ?? details?.city ?? '',
        address: npsAddress?.line1 ?? details?.address ?? '',
        zip_code: npsAddress?.postalCode ?? details?.zipCode ?? '',
        phone: npsPhone ?? details?.phone ?? '',
        website: nps?.url ?? details?.website ?? '',
        google_rating: details?.rating ? String(details.rating) : '',
        operating_hours: npsHours ?? details?.operatingHours ?? '',
        featured_image_url: npsImage ?? (details?.photoUrl ? (await uploadPhotoToStorage(details.photoUrl, candidate.slug)) ?? '' : ''),
        latitude: details?.lat ? String(details.lat) : (nps?.latitude ?? ''),
        longitude: details?.lng ? String(details.lng) : (nps?.longitude ?? ''),
        short_description: npsShortDesc ?? '',
        entrance_fee: npsFee ?? '',
        source: nps ? 'nps+google' : 'google',
      };

      newParkRows.push(row);
      console.log('done');
    }
  }

  // ── Phase 3: NPS-only enrichment pass for existing national parks ─────────

  if (!newOnly && (!sourceFilter || sourceFilter === 'nps')) {
    console.log('\n📡 NPS enrichment pass for existing national parks...');
    const npsParks = await fetchFloridaNpsParks();
    const npsMap = new Map(npsParks.map(p => [toSlug(p.fullName), p]));

    for (const park of parks) {
      if (park.park_type !== 'National Parks') continue;
      const nps = npsMap.get(park.slug);
      if (!nps) continue;

      const candidates: [keyof ParkRow, unknown, string | null][] = [
        ['short_description', park.short_description, nps.shortDescription],
        ['full_description',  park.full_description,  nps.description],
        ['entrance_fee',      park.entrance_fee,       nps.entranceFees?.[0]?.cost ? `$${nps.entranceFees[0].cost}` : null],
        ['operating_hours',   park.operating_hours,    nps.operatingHours?.[0]?.description ?? null],
        ['featured_image_url',park.featured_image_url, nps.images?.[0]?.url ?? null],
      ];

      for (const [field, current, proposed] of candidates) {
        if (current == null && proposed) {
          diffRows.push({
            park_name: park.name,
            slug: park.slug,
            field: field as string,
            current_value: '',
            proposed_value: String(proposed),
            source: 'nps-api',
          });
        }
      }
    }
  }

  // ── Phase 4: AI content generation ───────────────────────────────────────

  if (!sourceFilter || sourceFilter === 'ai') {
    const needsContent = parks.filter(p =>
      !p.short_description || !p.full_description || !p.visitor_tips
    );
    const aiTarget = limit < Infinity ? needsContent.slice(0, limit) : needsContent;

    if (aiTarget.length > 0) {
      console.log(`\n🤖 AI content generation for ${aiTarget.length} parks missing descriptions...`);
      for (const park of aiTarget) {
        process.stdout.write(`  ${park.name}... `);
        const content = await generateParkContent(park);
        if (!content) { console.log('skipped'); continue; }

        const fields: [keyof ParkRow, keyof typeof content][] = [
          ['short_description', 'short_description'],
          ['full_description',  'full_description'],
          ['visitor_tips',      'visitor_tips'],
          ['wildlife_summary',  'wildlife_summary'],
        ];
        for (const [dbField, aiField] of fields) {
          if (!park[dbField] && content[aiField]) {
            diffRows.push({
              park_name: park.name,
              slug: park.slug,
              field: dbField as string,
              current_value: '',
              proposed_value: content[aiField],
              source: 'ai-generated',
            });
          }
        }
        console.log('done');
      }
    }
  }

  // ── Write CSVs ────────────────────────────────────────────────────────────

  console.log('\n📄 Writing review files...');

  const diffHeaders = ['park_name', 'slug', 'field', 'current_value', 'proposed_value', 'source'];
  writeCsv(diffPath, diffHeaders, diffRows as unknown as Record<string, unknown>[]);
  console.log(`  → ${diffPath} (${diffRows.length} rows)`);

  const newParkHeaders = ['slug','name','park_type','park_region','city','address','zip_code','phone','website','google_rating','operating_hours','featured_image_url','latitude','longitude','short_description','entrance_fee','source'];
  writeCsv(newParksPath, newParkHeaders, newParkRows as unknown as Record<string, unknown>[]);
  console.log(`  → ${newParksPath} (${newParkRows.length} rows)`);

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Dry-run complete

  ${diffRows.length} field updates queued for ${new Set(diffRows.map(r => r.slug)).size} existing parks
  ${newParkRows.length} new parks ready to add

Next steps:
  1. Review scripts/review/enrichment-diff.csv in a spreadsheet
  2. Delete rows you don't want
  3. Review scripts/review/new-parks.csv — fill in park_region column
  4. Run: npx tsx scripts/populate-parks.ts --commit
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
}

main().catch(err => { console.error(err); process.exit(1); });
