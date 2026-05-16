/**
 * batch-enrich.ts
 *
 * Runs enrichPark() on a list of slugs sequentially.
 * Usage:
 *   npx tsx scripts/batch-enrich.ts                     # enriches parks with missing data
 *   npx tsx scripts/batch-enrich.ts --overwrite         # re-enriches all fields
 *   npx tsx scripts/batch-enrich.ts --slugs a,b,c       # explicit slug list
 */

import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { supabaseAdmin } from './lib/supabase-admin.js';
import { enrichPark } from './enrich-one-park.js';

const args = process.argv.slice(2);
const overwrite = args.includes('--overwrite');
const slugsArg = args.find(a => a.startsWith('--slugs='))?.replace('--slugs=', '');
const noPhoto = args.includes('--no-photo');

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

async function main() {
  let slugs: string[];

  if (slugsArg) {
    slugs = slugsArg.split(',').map(s => s.trim()).filter(Boolean);
    console.log(`Running on ${slugs.length} explicit slug(s)…\n`);
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
