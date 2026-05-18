/**
 * backfill-hotel-pet-friendly.ts
 *
 * Backfills the pet_friendly column on existing park_hotels rows using
 * the Google Places API v1 (allowsDogs field).
 *
 * Only processes rows where pet_friendly IS NULL (skips already-filled rows).
 * Rows where Google has no pet-friendly data remain NULL after this run.
 *
 * Usage:
 *   npx tsx scripts/backfill-hotel-pet-friendly.ts
 *   npx tsx scripts/backfill-hotel-pet-friendly.ts --dry-run
 *   npx tsx scripts/backfill-hotel-pet-friendly.ts --limit 50
 */

import * as dotenv from 'dotenv';
import path from 'path';
import { pathToFileURL } from 'url';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { supabaseAdmin } from './lib/supabase-admin.js';
import { getHotelInfo } from './lib/google-places.js';

const DELAY_MS = 250;

const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const limitArg = args.find(a => a.startsWith('--limit='))?.split('=')[1]
    ?? (args.includes('--limit') ? args[args.indexOf('--limit') + 1] : null);
  const limit = limitArg ? parseInt(limitArg, 10) : null;

  console.log(`\n${c.bold}${c.cyan}Hotel Pet-Friendly Backfill${c.reset}${dryRun ? ` ${c.yellow}(DRY RUN)${c.reset}` : ''}\n`);

  // Fetch all hotels that still need pet_friendly filled in
  // We rely on the hotel name to do a findplacefromtext lookup to get the place_id
  // Since park_hotels doesn't store place_id, we fetch name + description to reconstruct vicinity
  let query = supabaseAdmin
    .from('park_hotels')
    .select('id, name, description, latitude, longitude')
    .is('pet_friendly', null)
    .order('id');

  if (limit) query = query.limit(limit);

  const { data: hotels, error } = await query;
  if (error) throw new Error(`Failed to fetch hotels: ${error.message}`);

  const rows = hotels ?? [];
  console.log(`${c.gray}Hotels with pet_friendly = NULL: ${c.bold}${rows.length}${c.reset}\n`);

  if (rows.length === 0) {
    console.log(`${c.green}Nothing to do.${c.reset}\n`);
    return;
  }

  const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
  if (!API_KEY) {
    console.error(`${c.red}GOOGLE_PLACES_API_KEY not set in .env.local${c.reset}`);
    process.exit(1);
  }

  let petFriendlyCount = 0;
  let notPetFriendlyCount = 0;
  let unknownCount = 0;
  let errorCount = 0;

  for (let i = 0; i < rows.length; i++) {
    const hotel = rows[i];

    // Extract vicinity from description: "Hotel Name — vicinity. Rated X/5..."
    const prefix = hotel.name + ' — ';
    let vicinity = '';
    if (hotel.description?.startsWith(prefix)) {
      const rest = hotel.description.slice(prefix.length);
      vicinity = rest.split('.')[0].trim();
    }

    const prefix2 = `  [${String(i + 1).padStart(4)}/${rows.length}] ${hotel.name.slice(0, 40).padEnd(40)}`;
    process.stdout.write(prefix2);

    try {
      // Use lat/lng to find the place via a nearby search isn't possible without place_id.
      // Use findplacefromtext with name + vicinity to get the place_id first.
      const findUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(hotel.name + (vicinity ? ` ${vicinity}` : ''))}&inputtype=textquery&fields=place_id&locationbias=point:${hotel.latitude ?? 0},${hotel.longitude ?? 0}&key=${API_KEY}`;
      await sleep(DELAY_MS);
      const findRes = await fetch(findUrl);
      const findData = await findRes.json() as any;

      if (findData.status !== 'OK' || !findData.candidates?.length) {
        process.stdout.write(`${c.gray}no place_id found${c.reset}\n`);
        unknownCount++;
        continue;
      }

      const placeId = findData.candidates[0].place_id as string;
      const { petFriendly } = await getHotelInfo(placeId);

      if (petFriendly === null) {
        process.stdout.write(`${c.gray}unknown${c.reset}\n`);
        unknownCount++;
        continue;
      }

      if (!dryRun) {
        const { error: updateErr } = await supabaseAdmin
          .from('park_hotels')
          .update({ pet_friendly: petFriendly })
          .eq('id', hotel.id);
        if (updateErr) throw new Error(updateErr.message);
      }

      if (petFriendly) {
        process.stdout.write(`${c.green}🐾 pet-friendly${c.reset}\n`);
        petFriendlyCount++;
      } else {
        process.stdout.write(`no pets\n`);
        notPetFriendlyCount++;
      }
    } catch (e) {
      process.stdout.write(`${c.red}ERROR: ${(e as Error).message}${c.reset}\n`);
      errorCount++;
    }
  }

  console.log(`\n${c.bold}── Results ─────────────────────────────────────────────────${c.reset}`);
  console.log(`  ${c.green}🐾 Pet-friendly :${c.reset} ${petFriendlyCount}`);
  console.log(`  No pets         : ${notPetFriendlyCount}`);
  console.log(`  ${c.gray}Unknown         :${c.reset} ${unknownCount}  (Google has no data)`);
  if (errorCount > 0) console.log(`  ${c.red}Errors          :${c.reset} ${errorCount}`);
  console.log();
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(e => { console.error(e); process.exit(1); });
}
