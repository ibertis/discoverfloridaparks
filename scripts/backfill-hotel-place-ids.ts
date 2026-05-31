/**
 * backfill-hotel-place-ids.ts
 *
 * Finds every park_hotels row where place_id IS NULL, then uses Google's
 * findplacefromtext API to look up the place_id by hotel name + lat/lng bias.
 * Then calls the Places API v1 to fetch photo_reference (and refreshes
 * pet_friendly + price_level while we're at it).
 *
 * Usage:
 *   npx tsx scripts/backfill-hotel-place-ids.ts
 *   npx tsx scripts/backfill-hotel-place-ids.ts --dry-run   # show matches, no writes
 *   npx tsx scripts/backfill-hotel-place-ids.ts --limit 50  # process first N rows
 */

import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { supabaseAdmin } from './lib/supabase-admin.js';
import { getHotelInfo } from './lib/google-places.js';

const DELAY_MS = 250;
const PRICE_LEVEL_MAP: Record<string, number> = {
  PRICE_LEVEL_INEXPENSIVE: 1,
  PRICE_LEVEL_MODERATE: 2,
  PRICE_LEVEL_EXPENSIVE: 3,
  PRICE_LEVEL_VERY_EXPENSIVE: 4,
};

const c = {
  reset: '\x1b[0m', bold: '\x1b[1m',
  green: '\x1b[32m', yellow: '\x1b[33m', red: '\x1b[31m',
  cyan: '\x1b[36m', gray: '\x1b[90m',
};

interface HotelRow {
  id: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
}

function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

async function findPlaceId(name: string, lat: number | null, lng: number | null, apiKey: string): Promise<string | null> {
  const params = new URLSearchParams({
    input: name,
    inputtype: 'textquery',
    fields: 'place_id',
    key: apiKey,
  });
  if (lat != null && lng != null) {
    params.set('locationbias', `point:${lat},${lng}`);
  }
  const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?${params}`;
  const res = await fetch(url);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await res.json() as any;
  if (data.status !== 'OK' || !data.candidates?.length) return null;
  return data.candidates[0].place_id as string;
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const limitArg = args.find(a => a.startsWith('--limit='))?.split('=')[1]
    ?? (args.includes('--limit') ? args[args.indexOf('--limit') + 1] : null);
  const limit = limitArg ? parseInt(limitArg, 10) : null;

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    console.error(`${c.red}GOOGLE_PLACES_API_KEY not set in .env.local${c.reset}`);
    process.exit(1);
  }

  console.log(`\n${c.bold}${c.cyan}Hotel Place ID Backfill${c.reset}${dryRun ? ` ${c.yellow}(DRY RUN)${c.reset}` : ''}\n`);

  let query = supabaseAdmin
    .from('park_hotels')
    .select('id, name, latitude, longitude')
    .is('place_id', null)
    .order('id');

  if (limit) query = query.limit(limit);

  const { data: hotels, error } = await query;
  if (error) throw new Error(error.message);

  const rows = (hotels ?? []) as HotelRow[];
  console.log(`${c.gray}Hotels without place_id: ${c.bold}${rows.length}${c.reset}\n`);

  if (rows.length === 0) {
    console.log(`${c.green}Nothing to backfill.${c.reset}\n`);
    return;
  }

  let found = 0, notFound = 0, errors = 0;

  for (let i = 0; i < rows.length; i++) {
    const hotel = rows[i];
    const prefix = `  [${String(i + 1).padStart(4)}/${rows.length}] ${hotel.name.slice(0, 55).padEnd(55)}`;
    process.stdout.write(prefix);

    try {
      await sleep(DELAY_MS);
      const placeId = await findPlaceId(hotel.name, hotel.latitude, hotel.longitude, apiKey);

      if (!placeId) {
        process.stdout.write(`${c.yellow}not found${c.reset}\n`);
        notFound++;
        continue;
      }

      await sleep(DELAY_MS);
      const info = await getHotelInfo(placeId);

      if (!dryRun) {
        const { error: updErr } = await supabaseAdmin
          .from('park_hotels')
          .update({
            place_id: placeId,
            photo_reference: info.photoReference,
            ...(info.petFriendly !== null ? { pet_friendly: info.petFriendly } : {}),
            ...(info.priceLevel !== null ? { price_level: info.priceLevel } : {}),
          })
          .eq('id', hotel.id);

        if (updErr) throw new Error(updErr.message);
      }

      const photoTag = info.photoReference ? ` 📷` : '';
      process.stdout.write(`${c.green}✓ ${placeId.slice(0, 28)}…${photoTag}${c.reset}\n`);
      found++;
    } catch (e) {
      process.stdout.write(`${c.red}ERROR: ${(e as Error).message}${c.reset}\n`);
      errors++;
    }
  }

  console.log(`\n${c.bold}── Results ─────────────────────────────────────────────────${c.reset}`);
  console.log(`  ${c.green}Matched & updated :${c.reset} ${found}`);
  console.log(`  ${c.yellow}Not found         :${c.reset} ${notFound}`);
  if (errors > 0) console.log(`  ${c.red}Errors            :${c.reset} ${errors}`);
  console.log();
}

main().catch(e => { console.error(e); process.exit(1); });
