/**
 * audit-hotels.ts
 *
 * Scans all park_hotels rows and categorises them into three buckets:
 *
 *   REMOVE   — clearly not lodging (airboat tours, canoe outfitters, visitor
 *               centres, government group camps, generic primitive campsites)
 *   REVIEW   — outdoor accommodation (RV parks, campgrounds, fish camps,
 *               marinas without a hotel brand) — may be the best option for
 *               wilderness parks, so review before deleting
 *   KEEP     — hotels, inns, motels, resorts, named lodges, branded chains
 *
 * Usage:
 *   npx tsx scripts/audit-hotels.ts              # dry-run report only
 *   npx tsx scripts/audit-hotels.ts --delete-remove   # delete REMOVE bucket
 *   npx tsx scripts/audit-hotels.ts --delete-all      # delete REMOVE + REVIEW
 */

import * as dotenv from 'dotenv';
import path from 'path';
import { writeFileSync, mkdirSync } from 'fs';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { supabaseAdmin } from './lib/supabase-admin.js';

const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  magenta: '\x1b[35m',
};

// ─── Classification rules ─────────────────────────────────────────────────────

// If any of these match the name → always KEEP (overrides everything below)
const HOTEL_BRAND = /\b(hotel|inn|motel|suites?|hilton|marriott|hyatt|westin|sheraton|hampton|holiday inn|best western|comfort inn|quality inn|days inn|super 8|ramada|wyndham|radisson|ihg|doubletree|courtyard|residence inn|fairfield|springhill|homewood|embassy suites|renaissance|sheraton|four seasons|ritz|intercontinental|kimpton|omni|autograph|tapestry|curio|tribute|delta hotels|ac hotel|moxy|aloft|element|w hotel|st\. regis|le meridien|design hotel|boutique hotel|manor|chateau|palazzo|villa(?:s)?|bed & breakfast|b&b|airbnb)\b/i;

// Names that are unambiguously NOT lodging → REMOVE
const CLEAR_REMOVE = /\b(airboat|canoe|kayak|outfitter|outfitters|visitor cent(?:er|re)|chamber of commerce|fish camp(?! & rv| resort)|\brides?\b|guided tour|boat tour|nature tour|wildlife tour|group camp\b|scout(?:s)? (lodge|camp|reservation)|bsa\b|(?:primitive|backcountry) camp(?:site|ground)?$|cave dive camp|tcas camping|swfwmd|water management district)\b/i;

// Names that are outdoor accommodation — legitimate but should be reviewed → REVIEW
const OUTDOOR_LODGING = /\b(rv park|rv resort|campground|camp ground|camping|fish camp|(?<!hotel.{0,20})\bmarina\b|retreat(?: and| &) conference|conference cent(?:er|re)|glamp(?:ing)?|bunkhouse|hostel)\b/i;

// ─── Fetch + classify ─────────────────────────────────────────────────────────

type Hotel = { id: string; name: string; park_id: string; distance_from_park_km: number | null };
type Park  = { id: string; name: string; slug: string };
type Bucket = 'KEEP' | 'REVIEW' | 'REMOVE';

function classify(name: string): Bucket {
  if (HOTEL_BRAND.test(name))   return 'KEEP';
  if (CLEAR_REMOVE.test(name))  return 'REMOVE';
  if (OUTDOOR_LODGING.test(name)) return 'REVIEW';
  return 'KEEP';
}

async function main() {
  const deleteRemove = process.argv.includes('--delete-remove');
  const deleteAll    = process.argv.includes('--delete-all');

  console.log(`\n${c.bold}${c.cyan}DFP Hotel Audit${c.reset}\n`);

  // Fetch hotels + parks in parallel
  const [hotelsRes, parksRes] = await Promise.all([
    supabaseAdmin.from('park_hotels').select('id, name, park_id, distance_from_park_km').order('name'),
    supabaseAdmin.from('parks').select('id, name, slug'),
  ]);

  if (hotelsRes.error) throw hotelsRes.error;
  if (parksRes.error)  throw parksRes.error;

  const hotels = hotelsRes.data as Hotel[];
  const parkMap = new Map((parksRes.data as Park[]).map(p => [p.id, p]));

  const buckets: Record<Bucket, Array<Hotel & { park: Park | undefined }>> = {
    KEEP: [], REVIEW: [], REMOVE: [],
  };

  for (const hotel of hotels) {
    const bucket = classify(hotel.name);
    buckets[bucket].push({ ...hotel, park: parkMap.get(hotel.park_id) });
  }

  // ─── Report ───────────────────────────────────────────────────────────────

  const total = hotels.length;
  console.log(`Total hotel rows: ${c.bold}${total}${c.reset}`);
  console.log(`  ${c.green}KEEP  ${c.reset} ${buckets.KEEP.length}`);
  console.log(`  ${c.yellow}REVIEW${c.reset} ${buckets.REVIEW.length}  (outdoor lodging — verify before deleting)`);
  console.log(`  ${c.red}REMOVE${c.reset} ${buckets.REMOVE.length}  (clearly not lodging)\n`);

  if (buckets.REMOVE.length) {
    console.log(`${c.bold}${c.red}── REMOVE (${buckets.REMOVE.length}) ──────────────────────────────────${c.reset}`);
    for (const h of buckets.REMOVE) {
      const park = h.park ? `${h.park.name} (${h.park.slug})` : h.park_id;
      console.log(`  ${c.red}✕${c.reset}  ${h.name}`);
      console.log(`     ${c.gray}↳ ${park}${c.reset}`);
    }
    console.log();
  }

  if (buckets.REVIEW.length) {
    console.log(`${c.bold}${c.yellow}── REVIEW (${buckets.REVIEW.length}) ─────────────────────────────────${c.reset}`);
    for (const h of buckets.REVIEW) {
      const park = h.park ? `${h.park.name} (${h.park.slug})` : h.park_id;
      console.log(`  ${c.yellow}?${c.reset}  ${h.name}`);
      console.log(`     ${c.gray}↳ ${park}${c.reset}`);
    }
    console.log();
  }

  // ─── Save JSON report ─────────────────────────────────────────────────────
  const outDir = path.resolve(process.cwd(), 'scripts/data');
  mkdirSync(outDir, { recursive: true });
  const reportPath = path.join(outDir, 'hotel-audit.json');
  writeFileSync(reportPath, JSON.stringify(
    {
      generated: new Date().toISOString(),
      totals: { total, keep: buckets.KEEP.length, review: buckets.REVIEW.length, remove: buckets.REMOVE.length },
      remove: buckets.REMOVE.map(h => ({ id: h.id, name: h.name, park: h.park?.slug ?? h.park_id })),
      review: buckets.REVIEW.map(h => ({ id: h.id, name: h.name, park: h.park?.slug ?? h.park_id })),
    },
    null, 2,
  ) + '\n');
  console.log(`${c.gray}Report saved → ${reportPath}${c.reset}\n`);

  // ─── Deletions ────────────────────────────────────────────────────────────
  const toDelete: Array<Hotel & { park: Park | undefined }> = [
    ...(deleteRemove || deleteAll ? buckets.REMOVE : []),
    ...(deleteAll ? buckets.REVIEW : []),
  ];

  if (toDelete.length === 0) {
    console.log(`${c.gray}Dry run — pass --delete-remove or --delete-all to delete.${c.reset}\n`);
    return;
  }

  const ids = toDelete.map(h => h.id);
  console.log(`${c.bold}Deleting ${ids.length} rows…${c.reset}`);

  // Delete in batches of 100 (Supabase IN limit)
  let deleted = 0;
  for (let i = 0; i < ids.length; i += 100) {
    const batch = ids.slice(i, i + 100);
    const { error } = await supabaseAdmin.from('park_hotels').delete().in('id', batch);
    if (error) { console.error(`Batch ${i}–${i + 100} failed:`, error.message); continue; }
    deleted += batch.length;
  }

  console.log(`${c.green}✓ Deleted ${deleted} rows.${c.reset}\n`);
}

main().catch(err => { console.error(err); process.exit(1); });
