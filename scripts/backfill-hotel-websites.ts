/**
 * backfill-hotel-websites.ts
 *
 * For every park_hotels row that doesn't already have a direct hotel website URL,
 * looks up the hotel on Google Places by name + vicinity, fetches the website,
 * and updates park_hotels.url.
 *
 * Falls back to keeping the existing URL (Expedia search) if Google Places
 * returns no website for a property.
 *
 * Usage:
 *   npx tsx scripts/backfill-hotel-websites.ts --dry-run   # preview only
 *   npx tsx scripts/backfill-hotel-websites.ts             # live update
 *   npx tsx scripts/backfill-hotel-websites.ts --limit 50  # process N rows (for testing)
 */

import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { supabaseAdmin } from './lib/supabase-admin.js';

const API_KEY = process.env.GOOGLE_PLACES_API_KEY!;
const BASE = 'https://maps.googleapis.com/maps/api/place';

const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

/** Returns true if the URL is already a direct hotel/property website (not a search page). */
function isDirectUrl(url: string | null): boolean {
  if (!url) return false;
  // Expedia search pages and our CJ deeplinks are not direct property URLs
  if (url.includes('expedia.com/Hotel-Search')) return false;
  if (url.includes('dpbolvw.net')) return false;
  if (url.includes('booking.com/search')) return false;
  return true;
}

/**
 * Parses vicinity from the stored description field.
 * Format: "Hotel Name — vicinity. Rated X/5 …"
 */
function parseVicinity(name: string, description: string | null): string {
  if (!description) return '';
  const prefix = name + ' — ';
  if (description.startsWith(prefix)) {
    const after = description.slice(prefix.length);
    const dotIdx = after.indexOf('.');
    return dotIdx >= 0 ? after.slice(0, dotIdx).trim() : after.split('\n')[0].trim();
  }
  return '';
}

/** Find a place by text query, return place_id. */
async function findPlaceId(query: string): Promise<string | null> {
  await sleep(200);
  const url = `${BASE}/findplacefromtext/json?input=${encodeURIComponent(query)}&inputtype=textquery&fields=place_id&key=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json() as any;
  if (data.status !== 'OK' || !data.candidates?.length) return null;
  return data.candidates[0].place_id as string;
}

/** Fetch just the website field for a place_id. */
async function fetchWebsite(placeId: string): Promise<string | null> {
  await sleep(200);
  const url = `${BASE}/details/json?place_id=${placeId}&fields=website&key=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json() as any;
  if (data.status !== 'OK' || !data.result) return null;
  return data.result.website ?? null;
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const limitArg = process.argv.find(a => a.startsWith('--limit=') || a === '--limit');
  const limit = limitArg ? parseInt(process.argv[process.argv.indexOf('--limit') + 1] || limitArg.split('=')[1]) : Infinity;

  if (!API_KEY) throw new Error('GOOGLE_PLACES_API_KEY not set in .env.local');

  console.log(`\n${c.bold}${c.cyan}Hotel Website Backfill${c.reset}${dryRun ? ` ${c.yellow}(DRY RUN)${c.reset}` : ''}\n`);

  const { data: hotels, error } = await supabaseAdmin
    .from('park_hotels')
    .select('id, name, url, description')
    .order('id');

  if (error) throw new Error(`Fetch failed: ${error.message}`);
  if (!hotels?.length) { console.log('No hotels found.'); return; }

  const toProcess = hotels.filter(h => !isDirectUrl(h.url)).slice(0, limit);
  const alreadyDirect = hotels.length - toProcess.length;

  console.log(`Total rows: ${hotels.length}`);
  console.log(`Already have direct URL: ${alreadyDirect} (skipping)`);
  console.log(`To process: ${toProcess.length}\n`);

  let updated = 0;
  let noWebsite = 0;
  let notFound = 0;

  for (const hotel of toProcess) {
    const vicinity = parseVicinity(hotel.name, hotel.description);
    const query = vicinity ? `${hotel.name} ${vicinity} FL` : `${hotel.name} Florida`;

    const placeId = await findPlaceId(query);
    if (!placeId) {
      notFound++;
      console.log(`${c.gray}  NOT FOUND  ${hotel.name}${c.reset}`);
      continue;
    }

    const website = await fetchWebsite(placeId);
    if (!website) {
      noWebsite++;
      console.log(`${c.yellow}  NO WEBSITE ${hotel.name}${c.reset}`);
      continue;
    }

    console.log(`${c.green}  FOUND      ${hotel.name}${c.reset}`);
    console.log(`             ${website}`);

    if (!dryRun) {
      const { error: updateError } = await supabaseAdmin
        .from('park_hotels')
        .update({ url: website })
        .eq('id', hotel.id);

      if (updateError) {
        console.error(`${c.red}  FAILED: ${updateError.message}${c.reset}`);
        continue;
      }
    }

    updated++;
  }

  console.log(`\n${c.bold}Results${c.reset}`);
  console.log(`  ${c.green}Updated:${c.reset}     ${updated}`);
  console.log(`  ${c.yellow}No website:${c.reset}  ${noWebsite} (kept existing Expedia URL)`);
  console.log(`  ${c.gray}Not found:${c.reset}   ${notFound}`);
  if (dryRun) console.log(`\n${c.yellow}DRY RUN — no changes written${c.reset}`);
  console.log();
}

main().catch(e => { console.error(e); process.exit(1); });
