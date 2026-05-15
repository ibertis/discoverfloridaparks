/**
 * migrate-gateway-coords.ts
 *
 * One-time migration: adds gateway_lat / gateway_lng / gateway_note columns
 * to parks and populates them for boat-access / island parks.
 *
 * Usage:
 *   npx tsx scripts/migrate-gateway-coords.ts
 */

import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function sql(query: string): Promise<void> {
  // Supabase exposes a direct SQL endpoint at /rest/v1/ via the pg role
  // For DDL we send through the PostgREST admin SQL endpoint
  const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'params=single-object',
    },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`SQL failed (${res.status}): ${text}`);
  }
}

// Use the Supabase service-role key to call the pg REST API
// Alternatively, use the Supabase JS client with .rpc() if a helper fn exists
// Falling back to direct HTTP to the pg endpoint

async function runViaFetch(query: string, label: string): Promise<void> {
  process.stdout.write(`  ${label} ... `);
  // PostgREST doesn't support raw DDL via REST API.
  // We use the Supabase database API endpoint instead.
  const projectRef = SUPABASE_URL.replace('https://', '').replace('.supabase.co', '');
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // This requires a personal access token, not service role key
        // So we fall through to the workaround
      },
      body: JSON.stringify({ query }),
    }
  );
  console.log(`status ${res.status}`);
}

// ── Real approach: use supabase-js to upsert via a workaround ────────────────
// Since PostgREST doesn't support DDL, we'll use the service role key
// to call a Postgres function that executes the migration.
// If no such function exists, we output the SQL for manual execution.

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

interface GatewayUpdate {
  slug: string;
  gateway_lat: number;
  gateway_lng: number;
  gateway_note: string;
}

const GATEWAYS: GatewayUpdate[] = [
  { slug: 'dry-tortugas-national-park',                              gateway_lat: 24.5551, gateway_lng: -81.7800, gateway_note: 'Most visitors depart from Key West' },
  { slug: 'caladesi-island-state-park',                             gateway_lat: 28.0194, gateway_lng: -82.7696, gateway_note: 'Ferry departs from Honeymoon Island; guests typically stay in Dunedin or Clearwater' },
  { slug: 'cayo-costa-state-park',                                  gateway_lat: 26.7084, gateway_lng: -82.1524, gateway_note: 'Ferry departs from Pine Island (Bokeelia); guests stay in Cape Coral or Fort Myers' },
  { slug: 'egmont-key-state-park-and-national-wildlife-refuge',     gateway_lat: 27.6178, gateway_lng: -82.7342, gateway_note: 'Boats depart from Fort De Soto; guests stay in St. Pete Beach or Tierra Verde' },
  { slug: 'don-pedro-island-state-park',                            gateway_lat: 26.8681, gateway_lng: -82.2659, gateway_note: 'Boats depart from Placida; guests stay in Englewood or Rotonda' },
  { slug: 'anclote-key-preserve-state-park',                        gateway_lat: 28.1403, gateway_lng: -82.7542, gateway_note: 'Boats depart from Tarpon Springs' },
  { slug: 'indian-key-historic-state-park',                         gateway_lat: 24.9166, gateway_lng: -80.6270, gateway_note: 'Boats depart from Islamorada' },
  { slug: 'lignumvitae-key-botanical-state-park',                   gateway_lat: 24.9166, gateway_lng: -80.6270, gateway_note: 'Boats depart from Islamorada' },
  { slug: 'san-pedro-underwater-archaeological-preserve-state-park',gateway_lat: 24.9166, gateway_lng: -80.6270, gateway_note: 'Boats depart from Islamorada' },
  { slug: 'mound-key-archaeological-state-park',                    gateway_lat: 26.4498, gateway_lng: -81.9443, gateway_note: 'Boats depart from Fort Myers Beach or Bonita Springs' },
];

async function main() {
  console.log('\nGateway coords migration\n');

  // Step 1: try the column update directly — if the column doesn't exist yet
  // the update will fail with "column does not exist". We detect that and
  // print the DDL for manual execution.
  console.log('Checking if gateway_lat column exists...');
  const { error: checkErr } = await supabase
    .from('parks')
    .select('gateway_lat')
    .limit(1);

  if (checkErr && checkErr.message.includes('column')) {
    console.log('\n⚠️  Column does not exist yet.');
    console.log('Run this DDL in the Supabase SQL Editor first:\n');
    console.log('  ALTER TABLE parks');
    console.log('    ADD COLUMN IF NOT EXISTS gateway_lat  float8,');
    console.log('    ADD COLUMN IF NOT EXISTS gateway_lng  float8,');
    console.log('    ADD COLUMN IF NOT EXISTS gateway_note text;\n');
    console.log('Then re-run this script.\n');
    process.exit(1);
  }

  // Step 2: update each gateway park
  let ok = 0;
  let fail = 0;
  for (const g of GATEWAYS) {
    process.stdout.write(`  ${g.slug.padEnd(62)}`);
    const { error } = await supabase
      .from('parks')
      .update({ gateway_lat: g.gateway_lat, gateway_lng: g.gateway_lng, gateway_note: g.gateway_note })
      .eq('slug', g.slug);
    if (error) {
      console.log(`✗ ${error.message}`);
      fail++;
    } else {
      console.log(`✓`);
      ok++;
    }
  }

  console.log(`\nDone: ${ok} updated, ${fail} failed.\n`);
}

main().catch(e => { console.error(e); process.exit(1); });
