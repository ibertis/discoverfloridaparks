/**
 * fix-hotels-bulk.ts
 *
 * Finds every park with zero rows in park_hotels, then runs the Google Places
 * nearby-lodging search for each and inserts up to 3 hotels.
 *
 * Usage:
 *   npx tsx scripts/fix-hotels-bulk.ts
 *   npx tsx scripts/fix-hotels-bulk.ts --dry-run
 */

import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { supabaseAdmin } from './lib/supabase-admin.js';
import { haversineDistance, getSearchRadius, MAX_FALLBACK_RADIUS } from './utils/geo.js';

const DELAY_MS = 300;

const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

interface ParkRow {
  id: string;
  slug: string;
  name: string;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  gateway_lat: number | null;
  gateway_lng: number | null;
  gateway_note: string | null;
}

function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildDescription(place: any, park: ParkRow): string {
  const rating = place.rating ? `Rated ${place.rating}/5` : '';
  const reviews = place.user_ratings_total ? `(${place.user_ratings_total} reviews)` : '';
  const vicinity = place.vicinity || '';
  return `${place.name} — ${vicinity}. ${rating} ${reviews}. Nearby base for visiting ${park.name}.`.trim();
}

const NOT_A_HOTEL = /\b(airboat|canoe|kayak|outfitter|outfitters|visitor cent(?:er|re)|chamber of commerce|fish camp(?! & rv| resort)|\brides?\b|guided tour|boat tour|nature tour|wildlife tour|group camp|scout(?:s)? (lodge|camp)|bsa\b|campsite|cave dive|tcas camping|swfwmd|water management district)\b|\bcamp$/i;

function isLikelyHotel(name: string): boolean {
  return !NOT_A_HOTEL.test(name);
}

async function placesSearch(
  lat: number, lng: number, radius: number, apiKey: string
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any[]> {
  const url = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json');
  url.searchParams.set('location', `${lat},${lng}`);
  url.searchParams.set('radius', String(radius));
  url.searchParams.set('type', 'lodging');
  url.searchParams.set('key', apiKey);
  const res = await fetch(url.toString());
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await res.json() as any;
  if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    throw new Error(`Places API: ${data.status}`);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data.results || []).filter((p: any) => {
    if ((p.rating ?? 0) < 3.8) return false;
    if (!isLikelyHotel(p.name)) return false;
    // Allow campgrounds only when Google has a full street address (contains a digit + comma)
    // e.g. "1234 Park Rd, Oviedo" passes; "Christmas" or "Mims" does not
    if (p.types?.includes('campground') && !/\d/.test(p.vicinity ?? '')) return false;
    return true;
  });
}

async function enrichPark(park: ParkRow, apiKey: string, dryRun: boolean): Promise<{
  added: number; skipped: boolean; reason?: string;
}> {
  if (!park.latitude || !park.longitude) {
    return { added: 0, skipped: true, reason: 'no coordinates' };
  }

  // Use gateway coords when the park is boat-access / island
  const searchLat = park.gateway_lat ?? park.latitude;
  const searchLng = park.gateway_lng ?? park.longitude;

  const baseRadius = getSearchRadius(park.city);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let candidates: any[] = [];
  let usedRadius = baseRadius;

  // Expand search in steps until hotels are found or the 50km cap is reached
  const searchRadii = [...new Set([baseRadius, 25000, 50000])].filter(r => r >= baseRadius);

  try {
    for (const radius of searchRadii) {
      candidates = await placesSearch(searchLat, searchLng, radius, apiKey);
      usedRadius = radius;
      if (candidates.length > 0) break;
    }
  } catch (e) {
    return { added: 0, skipped: true, reason: (e as Error).message };
  }

  candidates = candidates.slice(0, 3);

  if (candidates.length === 0) {
    return { added: 0, skipped: true, reason: `no lodging ≥3.8★ within ${usedRadius / 1000}km` };
  }

  if (dryRun) return { added: candidates.length, skipped: false };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hotels = candidates.map((p: any) => {
    const lat = p.geometry.location.lat;
    const lng = p.geometry.location.lng;
    // Distance is always measured from the park itself, not the gateway
    const distKm = haversineDistance(Number(park.latitude), Number(park.longitude), lat, lng);
    return {
      park_id: park.id,
      name: p.name,
      url: `https://www.booking.com/search.html?ss=${encodeURIComponent(p.name + ' ' + (p.vicinity || ''))}&aid=2889331&label=dfp-${park.slug}`,
      description: buildDescription(p, park),
      latitude: lat,
      longitude: lng,
      distance_from_park_km: Math.round(distKm * 100) / 100,
    };
  });

  const { error } = await supabaseAdmin.from('park_hotels').insert(hotels);
  if (error) throw new Error(`Insert failed: ${error.message}`);

  return { added: hotels.length, skipped: false };
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    console.error(`${c.red}GOOGLE_PLACES_API_KEY not set in .env.local${c.reset}`);
    process.exit(1);
  }

  console.log(`\n${c.bold}${c.cyan}Hotel Bulk Fix${c.reset}${dryRun ? ` ${c.yellow}(DRY RUN)${c.reset}` : ''}`);

  // Fetch all park ids that have at least one hotel row
  const { data: hotelRows, error: hotelErr } = await supabaseAdmin
    .from('park_hotels')
    .select('park_id');
  if (hotelErr) throw new Error(hotelErr.message);

  const withHotels = new Set((hotelRows ?? []).map(h => h.park_id as string));

  // Fetch all parks, filter to those without hotels
  const { data: allParks, error: parksErr } = await supabaseAdmin
    .from('parks')
    .select('id, slug, name, city, latitude, longitude, gateway_lat, gateway_lng, gateway_note')
    .order('name');
  if (parksErr) throw new Error(parksErr.message);

  const parks = (allParks ?? []).filter(p => !withHotels.has(p.id)) as ParkRow[];

  console.log(`${c.gray}Parks with no hotels: ${c.bold}${parks.length}${c.reset}\n`);

  if (parks.length === 0) {
    console.log(`${c.green}Nothing to do.${c.reset}\n`);
    return;
  }

  let added = 0;
  let skipped = 0;
  let errors = 0;
  const skipReasons: Record<string, number> = {};

  for (let i = 0; i < parks.length; i++) {
    const park = parks[i];
    const prefix = `  [${String(i + 1).padStart(3)}/${parks.length}] ${park.slug.padEnd(58)}`;
    process.stdout.write(prefix);

    try {
      const result = await enrichPark(park, apiKey, dryRun);
      if (result.skipped) {
        process.stdout.write(`${c.yellow}skipped: ${result.reason}${c.reset}\n`);
        skipped++;
        const key = result.reason ?? 'unknown';
        skipReasons[key] = (skipReasons[key] ?? 0) + 1;
      } else {
        process.stdout.write(`${c.green}✓ +${result.added} hotel(s)${c.reset}\n`);
        added++;
      }
    } catch (e) {
      process.stdout.write(`${c.red}ERROR: ${(e as Error).message}${c.reset}\n`);
      errors++;
    }

    if (i < parks.length - 1) await sleep(DELAY_MS);
  }

  console.log(`\n${c.bold}── Results ─────────────────────────────────────────────────${c.reset}`);
  console.log(`  ${c.green}Hotels added  :${c.reset} ${added}`);
  console.log(`  ${c.yellow}Skipped       :${c.reset} ${skipped}`);
  if (errors > 0) console.log(`  ${c.red}Errors        :${c.reset} ${errors}`);
  if (Object.keys(skipReasons).length > 0) {
    console.log(`\n  Skip reasons:`);
    for (const [reason, count] of Object.entries(skipReasons).sort((a, b) => b[1] - a[1])) {
      console.log(`    ${count}× ${reason}`);
    }
  }
  console.log();
}

main().catch(e => { console.error(e); process.exit(1); });
