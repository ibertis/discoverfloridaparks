/**
 * migrate-hotels-to-expedia.ts
 *
 * One-time migration: re-builds every park_hotels.url from the old
 * Booking.com format (aid=2889331, which was never approved) to an
 * Expedia CJ affiliate deeplink.
 *
 * Vicinity is parsed from the stored description field:
 *   "Hotel Name — vicinity. Rated X/5 …"
 * Falls back to just the hotel name if parsing fails.
 *
 * Usage:
 *   npx tsx scripts/migrate-hotels-to-expedia.ts --dry-run   # preview only
 *   npx tsx scripts/migrate-hotels-to-expedia.ts             # live migration
 *
 * Requires EXPEDIA_CJ_BASE_URL in .env.local for tracked links.
 */

import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { supabaseAdmin } from './lib/supabase-admin.js';
import { buildExpediaHotelUrl } from './utils/expedia.js';

const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

/**
 * Parses the vicinity string from a hotel description.
 * Description format: "Hotel Name — vicinity. Rated X/5 …"
 * Returns empty string if the pattern doesn't match.
 */
function parseVicinity(name: string, description: string | null): string {
  if (!description) return '';
  // Strip the "Hotel Name — " prefix, then take everything up to the first period
  const prefix = name + ' — ';
  if (description.startsWith(prefix)) {
    const after = description.slice(prefix.length);
    const dotIdx = after.indexOf('.');
    return dotIdx >= 0 ? after.slice(0, dotIdx).trim() : after.split('\n')[0].trim();
  }
  return '';
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');

  if (!process.env.EXPEDIA_CJ_BASE_URL) {
    console.warn(`${c.yellow}⚠ EXPEDIA_CJ_BASE_URL not set — links will be untracked Expedia URLs${c.reset}`);
  }

  console.log(`\n${c.bold}${c.cyan}Hotel → Expedia Migration${c.reset}${dryRun ? ` ${c.yellow}(DRY RUN)${c.reset}` : ''}\n`);

  const { data: hotels, error } = await supabaseAdmin
    .from('park_hotels')
    .select('id, name, url, description');

  if (error) throw new Error(`Failed to fetch hotels: ${error.message}`);
  if (!hotels || hotels.length === 0) {
    console.log('No hotels found.');
    return;
  }

  console.log(`Found ${hotels.length} hotel records.\n`);

  let updated = 0;
  let alreadyExpedia = 0;

  for (const hotel of hotels) {
    if (hotel.url?.includes('expedia.com') || hotel.url?.includes('dpbolvw.net')) {
      alreadyExpedia++;
      console.log(`${c.gray}  SKIP  ${hotel.name} (already Expedia)${c.reset}`);
      continue;
    }

    const vicinity = parseVicinity(hotel.name, hotel.description);
    const newUrl = buildExpediaHotelUrl(hotel.name, vicinity);

    console.log(`  ${c.green}UPDATE${c.reset} ${hotel.name}`);
    console.log(`         vicinity: ${vicinity || '(none)'}`);
    console.log(`         new url:  ${newUrl}`);

    if (!dryRun) {
      const { error: updateError } = await supabaseAdmin
        .from('park_hotels')
        .update({ url: newUrl })
        .eq('id', hotel.id);

      if (updateError) {
        console.error(`${c.red}  FAILED: ${updateError.message}${c.reset}`);
        continue;
      }
    }

    updated++;
  }

  console.log(`\n${dryRun ? c.yellow + 'DRY RUN — ' : c.green}${updated} records would be updated${dryRun ? '' : ' ✅'}${c.reset}`);
  console.log(`${c.gray}${alreadyExpedia} records already on Expedia (skipped)${c.reset}\n`);
}

main().catch(e => { console.error(e); process.exit(1); });
