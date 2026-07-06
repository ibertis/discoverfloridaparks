/**
 * fix-hotel-proximity.ts
 *
 * Finds all parks where any hotel has distance_from_park_km > 30 OR
 * distance_from_park_km IS NULL, then re-runs the Google Places nearby
 * lodging search for each affected park.
 *
 * Hotels are deleted and replaced (same logic as enrichHotels in enrich-one-park.ts).
 *
 * Usage:
 *   npx tsx scripts/fix-hotel-proximity.ts
 *   npx tsx scripts/fix-hotel-proximity.ts --dry-run   # show affected parks, no writes
 *   npx tsx scripts/fix-hotel-proximity.ts --slug caladesi-island-state-park  # single park
 */

import * as dotenv from 'dotenv';
import path from 'path';
import { pathToFileURL } from 'url';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { supabaseAdmin } from './lib/supabase-admin.js';
import { haversineDistance, getSearchRadius, MAX_FALLBACK_RADIUS } from './utils/geo.js';
import { buildExpediaHotelUrl } from './utils/expedia.js';
import { getHotelInfo } from './lib/google-places.js';
import { resolveHotelPhoto } from './lib/hotel-photo.js';

// ─── Colors ───────────────────────────────────────────────────────────────────

const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  red: '\x1b[31m',
};

// ─── Types ────────────────────────────────────────────────────────────────────

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

interface HotelInsert {
  park_id: string;
  name: string;
  url: string;
  description: string;
  latitude: number;
  longitude: number;
  distance_from_park_km: number;
  pet_friendly: boolean | null;
  price_level: number | null;
  place_id: string | null;
  photo_reference: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildHotelDescription(place: any, park: ParkRow): string {
  const rating = place.rating ? `Rated ${place.rating}/5` : '';
  const reviews = place.user_ratings_total ? `(${place.user_ratings_total} reviews)` : '';
  const vicinity = place.vicinity || '';
  return `${place.name} — ${vicinity}. ${rating} ${reviews}. Nearby base for visiting ${park.name}.`.trim();
}

// ─── Core hotel enrichment (mirrors enrichHotels in enrich-one-park.ts) ───────

const NOT_A_HOTEL = /\b(airboat|canoe|kayak|outfitter|outfitters|visitor cent(?:er|re)|chamber of commerce|fish camp(?! & rv| resort)|\brides?\b|guided tour|boat tour|nature tour|wildlife tour|group camp|scout(?:s)? (lodge|camp)|bsa\b|campsite|cave dive|tcas camping|swfwmd|water management district|chickee|canoe shelter|glamping(?! resort)|rv park|rv resort|campground|fish camp|mobile home|retirement|senior living|senior community|55\+|residential community|golf academy|golf club|golf center|golf resort|golf links|golf villas?|golf village|golf course|country club|services llc|management group|collection group|realty|real estate)\b|\bcamp$/i;

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
  return (data.results || []).filter((p: any) => (p.rating ?? 0) >= 3.8 && isLikelyHotel(p.name));
}

async function enrichHotelsForPark(park: ParkRow, apiKey: string, dryRun = false): Promise<{
  replaced: number;
  added: number;
  skipped: boolean;
  reason?: string;
}> {
  if (!park.latitude || !park.longitude) {
    return { replaced: 0, added: 0, skipped: true, reason: 'no coordinates' };
  }

  // Use gateway coords (departure point) when the park is boat-access / island
  const searchLat = park.gateway_lat ?? park.latitude;
  const searchLng = park.gateway_lng ?? park.longitude;
  const usingGateway = park.gateway_lat != null;

  const baseRadius = getSearchRadius(park.city);
  let candidates: any[] = []; // eslint-disable-line @typescript-eslint/no-explicit-any
  let usedRadius = baseRadius;

  try {
    candidates = await placesSearch(searchLat, searchLng, baseRadius, apiKey);

    // Auto-retry at double the radius (capped at MAX_FALLBACK_RADIUS) when
    // initial search returns nothing — handles truly remote parks
    if (candidates.length === 0 && baseRadius < MAX_FALLBACK_RADIUS) {
      const fallbackRadius = Math.min(baseRadius * 2, MAX_FALLBACK_RADIUS);
      candidates = await placesSearch(searchLat, searchLng, fallbackRadius, apiKey);
      usedRadius = fallbackRadius;
    }
  } catch (e) {
    return { replaced: 0, added: 0, skipped: true, reason: (e as Error).message };
  }

  candidates = candidates.slice(0, 3);

  const searchDesc = usingGateway
    ? `gateway (${park.gateway_note ?? 'departure point'})`
    : `park coords`;

  if (candidates.length === 0) {
    return { replaced: 0, added: 0, skipped: true, reason: `no lodging ≥3.8★ within ${usedRadius / 1000}km of ${searchDesc}` };
  }

  // Count existing hotels before deletion (for reporting)
  const { count: existingCount } = await supabaseAdmin
    .from('park_hotels')
    .select('*', { count: 'exact', head: true })
    .eq('park_id', park.id);

  if (!dryRun) {
    await supabaseAdmin.from('park_hotels').delete().eq('park_id', park.id);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hotels: HotelInsert[] = await Promise.all(candidates.map(async (candidate: any) => {
    const hotelLat = candidate.geometry.location.lat;
    const hotelLng = candidate.geometry.location.lng;
    const distanceKm = haversineDistance(
      Number(park.latitude), Number(park.longitude),
      hotelLat, hotelLng,
    );
    const { website, petFriendly, priceLevel, photoReference } = await getHotelInfo(candidate.place_id);

    return {
      park_id: park.id,
      name: candidate.name,
      url: website ?? buildExpediaHotelUrl(candidate.name, candidate.vicinity || ''),
      description: buildHotelDescription(candidate, park),
      latitude: hotelLat,
      longitude: hotelLng,
      distance_from_park_km: Math.round(distanceKm * 100) / 100,
      pet_friendly: petFriendly,
      price_level: priceLevel,
      place_id: candidate.place_id ?? null,
      photo_reference: await resolveHotelPhoto(photoReference, candidate.place_id ?? candidate.name),
    };
  }));

  if (!dryRun) {
    const { error } = await supabaseAdmin.from('park_hotels').insert(hotels);
    if (error) throw new Error(`Insert failed: ${error.message}`);
  }

  return { replaced: existingCount ?? 0, added: hotels.length, skipped: false };
}

// ─── Find affected parks ──────────────────────────────────────────────────────

async function findAffectedParks(): Promise<ParkRow[]> {
  const { data: hotels, error } = await supabaseAdmin
    .from('park_hotels')
    .select('park_id, distance_from_park_km, parks(id, slug, name, city, latitude, longitude)');

  if (error) throw new Error(`Failed to fetch hotels: ${error.message}`);

  const parkMap = new Map<string, { park: ParkRow; maxDist: number | null; nullCount: number }>();

  for (const h of hotels ?? []) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const park = (h as any).parks as ParkRow | null;
    if (!park) continue;

    if (!parkMap.has(park.id)) {
      parkMap.set(park.id, { park, maxDist: null, nullCount: 0 });
    }
    const entry = parkMap.get(park.id)!;

    if (h.distance_from_park_km === null || h.distance_from_park_km === undefined) {
      entry.nullCount++;
    } else {
      entry.maxDist = Math.max(entry.maxDist ?? 0, h.distance_from_park_km);
    }
  }

  return [...parkMap.values()]
    .filter(e => (e.maxDist !== null && e.maxDist > 30) || e.nullCount > 0)
    .sort((a, b) => {
      if (a.nullCount > 0 && b.nullCount === 0) return -1;
      if (b.nullCount > 0 && a.nullCount === 0) return 1;
      return (b.maxDist ?? 0) - (a.maxDist ?? 0);
    })
    .map(e => e.park);
}

// ─── Exported function (for use by onboard-park.ts) ──────────────────────────

export async function fixHotelProximityForPark(slug: string): Promise<{
  fixed: boolean;
  skipped: boolean;
  reason?: string;
  error?: string;
}> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) throw new Error('GOOGLE_PLACES_API_KEY not set');

  const { data: park, error } = await supabaseAdmin
    .from('parks')
    .select('id, slug, name, city, latitude, longitude, gateway_lat, gateway_lng, gateway_note')
    .eq('slug', slug)
    .maybeSingle();

  if (error) throw new Error(`DB error: ${error.message}`);
  if (!park) return { fixed: false, skipped: true, reason: 'park not found' };

  try {
    const result = await enrichHotelsForPark(park as ParkRow, apiKey, false);
    if (result.skipped) {
      return { fixed: false, skipped: true, reason: result.reason };
    }
    return { fixed: true, skipped: false };
  } catch (e) {
    return { fixed: false, skipped: false, error: (e as Error).message };
  }
}

// ─── Main (CLI) ───────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const singleSlug = args.find(a => a.startsWith('--slug='))?.split('=')[1]
    ?? (args.includes('--slug') ? args[args.indexOf('--slug') + 1] : null);

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    console.error(`${c.red}GOOGLE_PLACES_API_KEY not set in .env.local${c.reset}`);
    process.exit(1);
  }

  console.log(`\n${c.bold}${c.cyan}Hotel Proximity Fix${c.reset}${dryRun ? ` ${c.yellow}(DRY RUN)${c.reset}` : ''}\n`);

  let parks: ParkRow[];

  if (singleSlug) {
    const { data, error } = await supabaseAdmin
      .from('parks')
      .select('id, slug, name, city, latitude, longitude, gateway_lat, gateway_lng, gateway_note')
      .eq('slug', singleSlug)
      .maybeSingle();
    if (error || !data) {
      console.error(`${c.red}Park not found: ${singleSlug}${c.reset}`);
      process.exit(1);
    }
    parks = [data];
    console.log(`${c.gray}Single park mode: ${data.name}${c.reset}\n`);
  } else {
    console.log(`${c.gray}Scanning hotels for proximity issues…${c.reset}`);
    parks = await findAffectedParks();
    console.log(`Found ${c.bold}${parks.length}${c.reset} parks with null or out-of-range hotel distances.\n`);
  }

  if (parks.length === 0) {
    console.log(`${c.green}✓ All hotel distances look good — nothing to fix.${c.reset}\n`);
    return;
  }

  console.log(`${'#'.padStart(3)}  ${'Slug'.padEnd(52)}  ${'Name'.padEnd(42)}`);
  console.log('─'.repeat(100));
  parks.forEach((p, i) => {
    console.log(`${String(i + 1).padStart(3)}  ${p.slug.padEnd(52)}  ${p.name.padEnd(42)}`);
  });
  console.log();

  if (dryRun) {
    console.log(`${c.yellow}Dry run complete — no changes made.${c.reset}\n`);
    return;
  }

  let successCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (let i = 0; i < parks.length; i++) {
    const park = parks[i];
    const prefix = `${c.gray}[${i + 1}/${parks.length}]${c.reset} ${park.name}`;

    try {
      const result = await enrichHotelsForPark(park, apiKey, dryRun);

      if (result.skipped) {
        console.log(`${prefix} — ${c.yellow}skipped: ${result.reason}${c.reset}`);
        skippedCount++;
      } else {
        console.log(`${prefix} — ${c.green}✓ replaced ${result.replaced} → added ${result.added} hotels${c.reset}`);
        successCount++;
      }
    } catch (e) {
      console.error(`${prefix} — ${c.red}ERROR: ${(e as Error).message}${c.reset}`);
      errorCount++;
    }

    if (i < parks.length - 1) await sleep(200);
  }

  console.log(`\n${c.bold}─── Results ───────────────────────────────────────────────${c.reset}`);
  console.log(`  ${c.green}✓ Fixed:${c.reset}   ${successCount}`);
  console.log(`  ${c.yellow}Skipped:${c.reset}  ${skippedCount}  (no coords or no nearby lodging)`);
  if (errorCount > 0) console.log(`  ${c.red}Errors:${c.reset}   ${errorCount}`);
  console.log();
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(e => { console.error(e); process.exit(1); });
}
