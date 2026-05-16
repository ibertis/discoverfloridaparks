/**
 * batch-enrich.ts
 *
 * Runs enrichPark() on a list of slugs sequentially.
 * Usage:
 *   npx tsx scripts/batch-enrich.ts                          # parks missing core data (regions, activities, SEO)
 *   npx tsx scripts/batch-enrich.ts --core-info              # parks missing core info (county, size, distances, etc.)
 *   npx tsx scripts/batch-enrich.ts --all                    # all 300 parks (overwrite mode)
 *   npx tsx scripts/batch-enrich.ts --overwrite              # re-enriches all fields for default target set
 *   npx tsx scripts/batch-enrich.ts --slugs a,b,c            # explicit slug list
 *   npx tsx scripts/batch-enrich.ts --no-photo               # skip photo uploads
 */

import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { supabaseAdmin } from './lib/supabase-admin.js';
import { enrichPark } from './enrich-one-park.js';

const args = process.argv.slice(2);
const overwrite = args.includes('--overwrite') || args.includes('--all');
const allParks  = args.includes('--all');
const coreInfo  = args.includes('--core-info');
const slugsArg  = args.find(a => a.startsWith('--slugs='))?.replace('--slugs=', '');
const noPhoto   = args.includes('--no-photo');

async function getIncompleteParks(): Promise<string[]> {
  const since = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabaseAdmin
    .from('parks')
    .select('slug, park_regions, activity_types, seo_title')
    .gte('created_at', since)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`DB query failed: ${error.message}`);
  return (data ?? [])
    .filter(p => !p.park_regions?.length || !p.activity_types?.length || !p.seo_title)
    .map(p => p.slug);
}

async function getCoreInfoParks(): Promise<string[]> {
  // Parks missing any of the key core info fields
  const { data, error } = await supabaseAdmin
    .from('parks')
    .select('slug, county, park_size_acres, year_established, google_maps_link, distance_from_miami, nearby_cities, instagram_hashtag')
    .order('name', { ascending: true });

  if (error) throw new Error(`DB query failed: ${error.message}`);
  return (data ?? [])
    .filter(p =>
      !p.county ||
      !p.park_size_acres ||
      !p.year_established ||
      !p.google_maps_link ||
      !p.distance_from_miami ||
      !p.nearby_cities?.length ||
      !p.instagram_hashtag
    )
    .map(p => p.slug);
}

async function getAllParks(): Promise<string[]> {
  const { data, error } = await supabaseAdmin
    .from('parks')
    .select('slug')
    .order('name', { ascending: true });
  if (error) throw new Error(`DB query failed: ${error.message}`);
  return (data ?? []).map(p => p.slug);
}

async function main() {
  let slugs: string[];

  if (slugsArg) {
    slugs = slugsArg.split(',').map(s => s.trim()).filter(Boolean);
    console.log(`Running on ${slugs.length} explicit slug(s)…\n`);
  } else if (allParks) {
    console.log('Fetching all 300 parks (--all mode, overwrite enabled)…');
    slugs = await getAllParks();
    console.log(`Found ${slugs.length} parks.\n`);
  } else if (coreInfo) {
    console.log('Fetching parks missing core info (county, size, distances, etc.)…');
    slugs = await getCoreInfoParks();
    console.log(`Found ${slugs.length} parks needing core info enrichment.\n`);
  } else {
    console.log('Fetching incomplete parks from last 10 days…');
    slugs = await getIncompleteParks();
    console.log(`Found ${slugs.length} parks needing enrichment.\n`);
  }

  if (slugs.length === 0) {
    console.log('Nothing to do.');
    return;
  }

  let ok = 0;
  let fail = 0;
  const failures: string[] = [];

  for (let i = 0; i < slugs.length; i++) {
    const slug = slugs[i];
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`[${i + 1}/${slugs.length}] ${slug}`);
    console.log('═'.repeat(60));
    try {
      await enrichPark(slug, { autoApply: true, overwrite, noPhoto });
      ok++;
    } catch (e) {
      console.error(`  ❌ Failed: ${(e as Error).message}`);
      fail++;
      failures.push(slug);
    }
    // Brief pause between parks to respect rate limits
    if (i < slugs.length - 1) await new Promise(r => setTimeout(r, 500));
  }

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`Batch complete: ${ok} succeeded, ${fail} failed`);
  if (failures.length) {
    console.log(`\nFailed slugs:\n${failures.map(s => `  - ${s}`).join('\n')}`);
    console.log('\nRe-run with:');
    console.log(`  npx tsx scripts/batch-enrich.ts --slugs=${failures.join(',')}`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
