/**
 * backfill-hotel-photos-to-storage.ts
 *
 * One-time (repeatable) migration: finds every park_hotels row whose
 * photo_reference is still a raw Google Places ref ("places/..."), downloads the
 * image once, uploads it to Supabase Storage (park-photos/hotels/), and rewrites
 * photo_reference to the public https:// URL.
 *
 * After this runs, park pages serve hotel photos straight from Supabase with NO
 * Google call at view time — which zeroes the ongoing Place Photo bill and stops
 * the recurring 502s caused by Google rotating photo references.
 *
 * Safe to re-run: rows already on https:// are skipped. Re-running also acts as a
 * cache refresh (Google permits ≤30-day caching of Places content), so schedule
 * it periodically (e.g. monthly, or via Hermes) to keep images fresh.
 *
 * Usage:
 *   npx tsx scripts/backfill-hotel-photos-to-storage.ts --dry-run   # report only
 *   npx tsx scripts/backfill-hotel-photos-to-storage.ts             # migrate
 *   npx tsx scripts/backfill-hotel-photos-to-storage.ts --limit 50  # first N rows
 *   npx tsx scripts/backfill-hotel-photos-to-storage.ts --refresh   # also re-fetch https rows
 */

import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { supabaseAdmin } from './lib/supabase-admin.js';
import { resolveHotelPhoto } from './lib/hotel-photo.js';

const DELAY_MS = 200;

const c = {
  reset: '\x1b[0m', bold: '\x1b[1m',
  green: '\x1b[32m', yellow: '\x1b[33m', red: '\x1b[31m',
  cyan: '\x1b[36m', gray: '\x1b[90m',
};

interface HotelRow {
  id: string;
  name: string;
  photo_reference: string | null;
}

function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const refresh = args.includes('--refresh');
  const limitArg = args.find(a => a.startsWith('--limit='))?.split('=')[1]
    ?? (args.includes('--limit') ? args[args.indexOf('--limit') + 1] : null);
  const limit = limitArg ? parseInt(limitArg, 10) : null;

  console.log(`\n${c.bold}${c.cyan}Backfill hotel photos → Supabase Storage${c.reset}`);
  console.log(`${c.gray}Mode: ${dryRun ? 'DRY RUN (no writes)' : 'LIVE'}${refresh ? ' · refreshing https rows too' : ''}${c.reset}\n`);

  // Rows still on a raw Google ref (or all rows with any photo, when --refresh).
  let query = supabaseAdmin
    .from('park_hotels')
    .select('id, name, photo_reference')
    .not('photo_reference', 'is', null);
  if (!refresh) query = query.like('photo_reference', 'places/%');

  const { data, error } = await query;
  if (error) { console.error(`${c.red}Query failed: ${error.message}${c.reset}`); process.exit(1); }

  let rows = (data ?? []) as HotelRow[];
  if (limit) rows = rows.slice(0, limit);

  console.log(`${c.gray}Rows to process: ${c.bold}${rows.length}${c.reset}\n`);
  if (rows.length === 0) { console.log(`${c.green}Nothing to migrate.${c.reset}\n`); return; }

  let migrated = 0, skipped = 0, failed = 0;

  for (let i = 0; i < rows.length; i++) {
    const hotel = rows[i];
    const prefix = `  [${String(i + 1).padStart(4)}/${rows.length}] ${hotel.name.slice(0, 50).padEnd(50)}`;
    process.stdout.write(prefix);

    // DRY RUN: make NO Google calls and NO uploads — just report what would run.
    if (dryRun) {
      process.stdout.write(`${c.cyan}would migrate${c.reset}\n`);
      migrated++;
      continue;
    }

    await sleep(DELAY_MS);
    const resolved = await resolveHotelPhoto(hotel.photo_reference, hotel.id);

    // Success = we got a Supabase https URL back that differs from what's stored.
    if (resolved && resolved.startsWith('https://') && resolved !== hotel.photo_reference) {
      const { error: updErr } = await supabaseAdmin
        .from('park_hotels')
        .update({ photo_reference: resolved })
        .eq('id', hotel.id);
      if (updErr) {
        process.stdout.write(`${c.red}update failed: ${updErr.message}${c.reset}\n`);
        failed++;
      } else {
        process.stdout.write(`${c.green}✓ migrated${c.reset}\n`);
        migrated++;
      }
    } else if (resolved && resolved.startsWith('https://')) {
      process.stdout.write(`${c.gray}already migrated${c.reset}\n`);
      skipped++;
    } else {
      // resolveHotelPhoto returned the original ref → Google fetch/upload failed.
      process.stdout.write(`${c.yellow}skipped (photo unavailable)${c.reset}\n`);
      failed++;
    }
  }

  console.log(`\n${c.bold}Done.${c.reset} ${c.green}${migrated} migrated${c.reset}, ${c.gray}${skipped} already done${c.reset}, ${c.yellow}${failed} failed/unavailable${c.reset}\n`);
  if (dryRun && migrated > 0) {
    console.log(`${c.cyan}Re-run without --dry-run to apply.${c.reset}\n`);
  }
}

main().catch(err => { console.error(err); process.exit(1); });
