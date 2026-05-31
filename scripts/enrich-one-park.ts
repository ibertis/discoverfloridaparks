/**
 * enrich-one-park.ts
 *
 * Adds or updates a single park using Google Places, NPS API, and AI content generation.
 * Interactive by default — shows a preview and asks for confirmation before writing.
 * Pass --auto to skip the confirmation prompt (used by onboard-park.ts).
 *
 * Standalone usage:
 *   npx tsx scripts/enrich-one-park.ts "Blue Spring State Park"
 *   npx tsx scripts/enrich-one-park.ts "Everglades National Park" --no-ai
 *   npx tsx scripts/enrich-one-park.ts "Blue Spring State Park" --no-photo
 *   npx tsx scripts/enrich-one-park.ts "Blue Spring State Park" --overwrite
 *   npx tsx scripts/enrich-one-park.ts "Blue Spring State Park" --auto
 *
 * Programmatic usage (from onboard-park.ts):
 *   import { enrichPark } from './enrich-one-park'
 *   await enrichPark(slug, { autoApply: true })
 */

import * as dotenv from 'dotenv';
import path from 'path';
import { pathToFileURL } from 'url';
import * as readline from 'readline';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { supabaseAdmin } from './lib/supabase-admin.js';
import { findPark, getPlaceDetails } from './lib/google-places.js';
import { fetchFloridaNpsParks } from './lib/nps-api.js';
import { haversineDistance, getSearchRadius, MAX_FALLBACK_RADIUS } from './utils/geo.js';
import { getRegionsForCoords, getManagingAgency } from './utils/florida-regions.js';
import { buildExpediaHotelUrl } from './utils/expedia.js';
import { getHotelInfo } from './lib/google-places.js';

// ─── Colors ──────────────────────────────────────────────────────────────────

const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  red: '\x1b[31m',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    rl.question(question, answer => { rl.close(); resolve(answer.trim()); });
  });
}

const PHOTO_BUCKET = 'park-photos';

async function uploadPhotoToStorage(photoUrl: string, slug: string): Promise<string | null> {
  try {
    const res = await fetch(photoUrl);
    if (!res.ok) return null;
    const buffer = await res.arrayBuffer();
    const contentType = res.headers.get('content-type') ?? 'image/jpeg';
    const ext = contentType.includes('png') ? 'png' : 'jpg';
    const fileName = `${slug}-${Date.now()}.${ext}`;

    const { error } = await supabaseAdmin.storage
      .from(PHOTO_BUCKET)
      .upload(fileName, Buffer.from(buffer), { contentType, upsert: true });

    if (error) { console.warn(`  ${c.yellow}Storage upload failed: ${error.message}${c.reset}`); return null; }

    const { data } = supabaseAdmin.storage.from(PHOTO_BUCKET).getPublicUrl(fileName);
    return data.publicUrl;
  } catch (e) {
    console.warn(`  ${c.yellow}Photo upload error: ${(e as Error).message}${c.reset}`);
    return null;
  }
}

interface AiParkContent {
  short_description: string;
  full_description: string;
  visitor_tips: string;
  wildlife_summary: string;
  seo_title: string;
  seo_description: string;
  best_season: string;
  typical_visit_duration: string;
  crowd_level: 'Low' | 'Moderate' | 'High';
  terrain: string;
  activity_types: string[];
  // Core info fields
  park_types: string[] | null;
  park_size_acres: number | null;
  year_established: number | null;
  entrance_fee: string | null;
  parking_info: string | null;
  nearby_cities: string[] | null;
  instagram_hashtag: string | null;
  reservation_url: string | null;
  camping_url: string | null;
  safety_notes: string | null;
  amenities: {
    dog_friendly: boolean;
    camping_available: boolean;
    swimming_allowed: boolean;
    fishing_allowed: boolean;
    boat_launch: boolean;
    picnic_areas: boolean;
    visitor_center: boolean;
    wheelchair_accessible: boolean;
    hiking_available: boolean;
    biking_available: boolean;
    horseback_riding: boolean;
    hunting_allowed: boolean;
    paddling_available: boolean;
    wildlife_viewing: boolean;
    beach_access: boolean;
  };
}

async function generateParkContent(park: {
  name: string;
  park_types?: string[] | null;
  city?: string | null;
  park_regions?: string[] | null;
  slug?: string;
}): Promise<AiParkContent | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.warn(`  ${c.yellow}Skipping AI content — ANTHROPIC_API_KEY not set${c.reset}`);
    return null;
  }

  const VALID_ACTIVITY_TYPES = [
    'Hiking & Walking', 'Camping', 'Swimming', 'Fishing', 'Paddling & Kayaking',
    'Boating', 'Airboat Tours', 'Wildlife & Eco Tours', 'Birding', 'Photography & Birding Tours',
    'Snorkeling & Diving', 'Biking', 'Horseback Riding', 'Hunting',
    'Beach & Water Recreation', 'Picnicking & Day Use', 'Visitor Center & Education',
    'Manatee Encounters', 'Sunset & Scenic Cruises', 'Theme Park Experiences', 'Water Park Experiences',
  ];

  const promptText = `You are a Florida parks expert writing rich, accurate content for discoverfloridaparks.com.

Park: ${park.name}
Type: ${park.park_types?.join(', ') ?? 'Unknown'}
City/Area: ${park.city ?? 'Florida'}
Region: ${park.park_regions?.join(', ') ?? 'Florida'}

Write ALL of the following fields. Be factual, specific, and engaging. Do not invent statistics you are unsure of — use null for unknown numeric fields.

Fields:
- short_description: One sentence max 160 chars. Captures the park's defining character for a card subtitle.
- full_description: 3–4 paragraphs. Cover the park's character, standout features, activities, and why it's worth visiting. Plain text, no markdown.
- visitor_tips: 3–5 practical tips (best time, parking, what to bring, hidden gems). Bullet points starting with "•".
- wildlife_summary: One paragraph on typical wildlife, ecosystems, and natural features.
- seo_title: Max 60 chars. Format: "[Park Name] — [Key Feature] | Florida Parks". No | Discover Florida Parks suffix.
- seo_description: 140–155 chars. Enticing summary for Google search results. Include 1–2 activities and location.
- best_season: One of these exact values (lowercase): "year_round" | "spring" | "fall_winter" | "winter" | "summer" | "spring_fall" | "fall"
- typical_visit_duration: One of these exact values (lowercase): "quick_stop" | "half_day" | "full_day" | "weekend" | "multi_day"
- crowd_level: One of these exact values (lowercase): "low" | "moderate" | "high" | "very_high"
- terrain: Brief description of terrain type (e.g. "Flat pine flatwoods and cypress swamps", "Sandy beaches and coastal dunes")
- activity_types: Array of relevant activities from this list ONLY: ${VALID_ACTIVITY_TYPES.join(', ')}
- park_types: Array of applicable categories from this list ONLY: "National Parks", "State Parks", "National Wildlife Refuge", "Wildlife Management Area", "County Parks", "Community Parks", "Theme Parks", "Water Parks", "Preserve", "State Forest"
- park_size_acres: Integer. Approximate total acreage of the park. Use null if unknown.
- year_established: Integer. Year the park was officially established or dedicated. Use null if unknown.
- entrance_fee: String. E.g. "$6/vehicle", "$4/person (walk-in/bike-in)", "Free". Use null if unknown.
- parking_info: String. Parking availability, cost, overflow lots, or special notes. 1–2 sentences.
- nearby_cities: Array of 3–5 nearest significant cities/towns (closest first).
- instagram_hashtag: The most common/official hashtag for this park without the # symbol (e.g. "HoneymoonIslandSP"). Use null if unsure.
- reservation_url: Full URL for online reservations (camping, cabins, etc.) — typically reserveamerica.com or floridastateparks.reserveamerica.com. Use null if no reservations needed or unknown.
- camping_url: Full URL specifically for camping reservations. Often same as reservation_url for state parks. Use null if no camping.
- safety_notes: 1–2 sentences on park-specific safety (wildlife, water conditions, weather). Be specific to this park.
- amenities: Object with boolean values for each amenity based on what this park realistically offers:
  dog_friendly, camping_available, swimming_allowed, fishing_allowed, boat_launch,
  picnic_areas, visitor_center, wheelchair_accessible, hiking_available, biking_available,
  horseback_riding, hunting_allowed, paddling_available, wildlife_viewing, beach_access

Respond ONLY with valid JSON matching this exact shape (no markdown, no extra keys):
{
  "short_description": "...",
  "full_description": "...",
  "visitor_tips": "...",
  "wildlife_summary": "...",
  "seo_title": "...",
  "seo_description": "...",
  "best_season": "year_round",
  "typical_visit_duration": "full_day",
  "crowd_level": "moderate",
  "terrain": "...",
  "activity_types": [...],
  "park_types": ["State Parks"],
  "park_size_acres": 1234,
  "year_established": 1985,
  "entrance_fee": "$6/vehicle",
  "parking_info": "...",
  "nearby_cities": ["City1", "City2", "City3"],
  "instagram_hashtag": "ParkNameSP",
  "reservation_url": "https://...",
  "camping_url": "https://...",
  "safety_notes": "...",
  "amenities": {
    "dog_friendly": true,
    "camping_available": true,
    "swimming_allowed": true,
    "fishing_allowed": true,
    "boat_launch": true,
    "picnic_areas": true,
    "visitor_center": true,
    "wheelchair_accessible": true,
    "hiking_available": true,
    "biking_available": true,
    "horseback_riding": true,
    "hunting_allowed": true,
    "paddling_available": true,
    "wildlife_viewing": true,
    "beach_access": true
  }
}`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      messages: [{ role: 'user', content: promptText }],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.warn(`  ${c.yellow}AI API error: ${res.status} — ${body}${c.reset}`);
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await res.json() as any;
  const text: string = data.content?.[0]?.text ?? '';

  try {
    // Extract the JSON object from anywhere in the response (handles code fences and preamble)
    const jsonMatch = text.match(/(\{[\s\S]*\})/);
    const clean = jsonMatch ? jsonMatch[1] : text.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim();
    return JSON.parse(clean) as AiParkContent;
  } catch {
    console.warn(`  ${c.yellow}Failed to parse AI response: ${text.slice(0, 200)}${c.reset}`);
    return null;
  }
}

function printField(label: string, value: string | null | undefined, color: string) {
  if (!value) return;
  const short = value.length > 120 ? value.slice(0, 117) + '…' : value;
  console.log(`  ${c.gray}${label.padEnd(20)}${c.reset}${color}${short}${c.reset}`);
}

// ─── Hotel enrichment ────────────────────────────────────────────────────────

interface ParkRecord {
  id: string
  name: string
  slug: string
  city: string | null
  latitude: number | null
  longitude: number | null
  gateway_lat: number | null
  gateway_lng: number | null
  gateway_note: string | null
}

async function enrichHotels(park: ParkRecord): Promise<void> {
  if (!park.latitude || !park.longitude) {
    console.warn(`  ${c.yellow}⚠️  No coordinates — skipping hotel enrichment${c.reset}`);
    return;
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) throw new Error('GOOGLE_PLACES_API_KEY not set in .env.local');

  // Use gateway coords (departure point) when the park is boat-access / island
  const searchLat = park.gateway_lat ?? park.latitude;
  const searchLng = park.gateway_lng ?? park.longitude;
  const usingGateway = park.gateway_lat != null;

  const baseRadius = getSearchRadius(park.city);

  async function query(lat: number, lng: number, radius: number) {
    const url = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json');
    url.searchParams.set('location', `${lat},${lng}`);
    url.searchParams.set('radius', String(radius));
    url.searchParams.set('type', 'lodging');
    url.searchParams.set('key', apiKey!);
    const res = await fetch(url.toString());
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await res.json() as any;
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') throw new Error(`Places API: ${data.status}`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const NOT_A_HOTEL = /\b(airboat|canoe|kayak|outfitter|outfitters|visitor cent(?:er|re)|chamber of commerce|fish camp(?! & rv| resort)|\brides?\b|guided tour|boat tour|nature tour|wildlife tour|group camp|scout(?:s)? (lodge|camp)|bsa\b|campsite|cave dive|tcas camping|swfwmd|water management district|chickee|canoe shelter|glamping(?! resort)|rv park|rv resort|campground|fish camp|mobile home|retirement|senior living|senior community|55\+|residential community|golf academy|golf club|golf center|services llc|management group|collection group|realty|real estate)\b|\bcamp$/i;
    return (data.results || []).filter((p: any) => (p.rating ?? 0) >= 3.8 && !NOT_A_HOTEL.test(p.name));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let candidates: any[] = await query(searchLat, searchLng, baseRadius);
  let usedRadius = baseRadius;

  // Retry at 2× radius (capped) when initial search finds nothing
  if (candidates.length === 0 && baseRadius < MAX_FALLBACK_RADIUS) {
    const fallback = Math.min(baseRadius * 2, MAX_FALLBACK_RADIUS);
    candidates = await query(searchLat, searchLng, fallback);
    usedRadius = fallback;
  }

  candidates = candidates.slice(0, 3);

  if (candidates.length === 0) {
    const searchDesc = usingGateway ? `${park.gateway_note ?? 'gateway'}` : park.name;
    console.warn(`  ${c.yellow}No suitable hotels found within ${usedRadius / 1000}km of ${searchDesc}${c.reset}`);
    return;
  }

  await supabaseAdmin.from('park_hotels').delete().eq('park_id', park.id);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hotels = await Promise.all(candidates.map(async (candidate: any) => {
    const hotelLat = candidate.geometry.location.lat;
    const hotelLng = candidate.geometry.location.lng;
    // Distance is always from the park itself, not the gateway
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
      photo_reference: photoReference,
    };
  }));

  const { error } = await supabaseAdmin.from('park_hotels').insert(hotels);
  if (error) {
    console.error(`  ${c.red}Failed to insert hotels: ${error.message}${c.reset}`);
  } else {
    const searchLabel = usingGateway ? `gateway (${usedRadius / 1000}km)` : `${usedRadius / 1000}km`;
    console.log(`  ${c.green}✅ Hotels: ${hotels.length} found within ${searchLabel}${c.reset}`);
    hotels.forEach((h: { name: string; distance_from_park_km: number }) => console.log(`     - ${h.name} (${h.distance_from_park_km}km from park)`));
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildHotelDescription(place: any, park: ParkRecord): string {
  const rating = place.rating ? `Rated ${place.rating}/5` : '';
  const reviews = place.user_ratings_total ? `(${place.user_ratings_total} reviews)` : '';
  const vicinity = place.vicinity || '';
  return `${place.name} — ${vicinity}. ${rating} ${reviews}. Nearby base for visiting ${park.name}.`.trim();
}

// ─── Exported enrichment function ────────────────────────────────────────────

export interface EnrichOptions {
  /** Display name for Google Places search. Defaults to parks.name from DB. */
  displayName?: string;
  noAi?: boolean;
  noPhoto?: boolean;
  overwrite?: boolean;
  /** Skip the y/n confirmation prompt and auto-apply all changes. */
  autoApply?: boolean;
}

export async function enrichPark(slug: string, opts: EnrichOptions = {}): Promise<void> {
  const { noAi = false, noPhoto = false, overwrite = false, autoApply = false } = opts;

  // ── Step 1: Check existing DB record ─────────────────────────────────────
  const { data: existing } = await supabaseAdmin
    .from('parks')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  const isNew = !existing;
  const parkDisplayName = opts.displayName ?? existing?.name ?? slug;

  console.log(`\n${c.bold}${c.cyan}Enriching: ${parkDisplayName}${c.reset}  ${c.gray}(slug: ${slug})${c.reset}\n`);
  console.log(isNew
    ? `${c.green}→ New park (not found in DB)${c.reset}`
    : `${c.yellow}→ Existing park found — will fill empty fields${overwrite ? ' + overwrite all' : ''}${c.reset}`
  );

  // ── Step 2: Google Places ─────────────────────────────────────────────────
  console.log(`\n${c.bold}[1/3] Google Places…${c.reset}`);
  let placeData: Record<string, unknown> = {};

  try {
    const placeId = await findPark(`${parkDisplayName} Florida`);
    if (!placeId) {
      console.log(`  ${c.yellow}No Google Places result found.${c.reset}`);
    } else {
      const details = await getPlaceDetails(placeId);
      if (details) {
        console.log(`  ${c.green}Found: ${details.name}${c.reset}`);
        placeData = {
          address: details.address || null,
          city: details.city || null,
          county: details.county || null,
          zip_code: details.zipCode || null,
          phone: details.phone,
          website: details.website,
          google_rating: details.rating,
          google_review_count: details.reviewCount,
          operating_hours: details.operatingHours,
          latitude: details.lat,
          longitude: details.lng,
        };

        if (!noPhoto && details.photoUrl) {
          console.log(`  Uploading photo…`);
          const photoUrl = await uploadPhotoToStorage(details.photoUrl, slug);
          if (photoUrl) {
            placeData.featured_image_url = photoUrl;
            console.log(`  ${c.green}Photo uploaded${c.reset}`);
          }
        }
      }
    }
  } catch (e) {
    console.warn(`  ${c.yellow}Google Places error: ${(e as Error).message}${c.reset}`);
  }

  // ── Step 3: NPS API ───────────────────────────────────────────────────────
  console.log(`\n${c.bold}[2/3] NPS API…${c.reset}`);
  let npsData: Record<string, unknown> = {};

  if (!process.env.NPS_API_KEY) {
    console.log(`  ${c.gray}NPS_API_KEY not set — skipping${c.reset}`);
  } else {
    try {
      const npsParks = await fetchFloridaNpsParks();
      const match = npsParks.find(p =>
        toSlug(p.fullName) === slug ||
        p.fullName.toLowerCase().includes(parkDisplayName.toLowerCase())
      );
      if (!match) {
        console.log(`  ${c.gray}No NPS match found${c.reset}`);
      } else {
        console.log(`  ${c.green}NPS match: ${match.fullName}${c.reset}`);
        const fee = match.entranceFees?.[0]?.cost
          ? `$${parseFloat(match.entranceFees[0].cost).toFixed(2)}/person`
          : null;
        const hours = match.operatingHours?.[0]?.description ?? null;
        npsData = {
          entrance_fee: fee,
          operating_hours: hours,
          website: match.url || null,
        };
      }
    } catch (e) {
      console.warn(`  ${c.yellow}NPS API error: ${(e as Error).message}${c.reset}`);
    }
  }

  // ── Step 4a: Auto-assign regions and calculate distances from coordinates ─
  const resolvedLat = (placeData.latitude as number | null) ?? existing?.latitude ?? null;
  const resolvedLng = (placeData.longitude as number | null) ?? existing?.longitude ?? null;
  const autoRegions = (resolvedLat && resolvedLng) ? getRegionsForCoords(resolvedLat, resolvedLng) : [];
  const autoAgency = getManagingAgency(existing?.park_types ?? null, slug);

  // Auto-calculate distances to major Florida cities (miles) and google_maps_link
  const MIAMI    = { lat: 25.7617, lng: -80.1918 };
  const ORLANDO  = { lat: 28.5383, lng: -81.3792 };
  const TAMPA    = { lat: 27.9506, lng: -82.4572 };

  let autoDistMiami: number | null = null;
  let autoDistOrlando: number | null = null;
  let autoDistTampa: number | null = null;
  let autoGoogleMapsLink: string | null = null;

  if (resolvedLat && resolvedLng) {
    autoDistMiami   = Math.round(haversineDistance(resolvedLat, resolvedLng, MIAMI.lat,   MIAMI.lng)   * 0.621371);
    autoDistOrlando = Math.round(haversineDistance(resolvedLat, resolvedLng, ORLANDO.lat, ORLANDO.lng) * 0.621371);
    autoDistTampa   = Math.round(haversineDistance(resolvedLat, resolvedLng, TAMPA.lat,   TAMPA.lng)   * 0.621371);
    autoGoogleMapsLink = `https://www.google.com/maps/search/?api=1&query=${resolvedLat},${resolvedLng}`;
    console.log(`  ${c.green}Distances — Miami: ${autoDistMiami}mi, Orlando: ${autoDistOrlando}mi, Tampa: ${autoDistTampa}mi${c.reset}`);
  }

  if (autoRegions.length) {
    console.log(`  ${c.green}Auto-regions: ${autoRegions.join(', ')}${c.reset}`);
  }
  if (autoAgency) {
    console.log(`  ${c.green}Managing agency: ${autoAgency}${c.reset}`);
  }

  // ── Step 4b: AI content ───────────────────────────────────────────────────
  console.log(`\n${c.bold}[3/3] AI content generation (Claude Sonnet)…${c.reset}`);
  let aiData: Record<string, unknown> = {};
  let amenitiesFromAi: AiParkContent['amenities'] | null = null;
  let activityTypesFromAi: string[] | null = null;

  if (noAi) {
    console.log(`  ${c.gray}Skipped (--no-ai)${c.reset}`);
  } else {
    const aiResult = await generateParkContent({
      name: parkDisplayName,
      park_types: existing?.park_types ?? null,
      city: (placeData.city as string) ?? existing?.city ?? null,
      park_regions: autoRegions.length ? autoRegions : (existing?.park_regions ?? null),
      slug,
    });
    if (aiResult) {
      const { amenities, activity_types, park_types: parkTypesFromAi, ...rest } = aiResult;
      aiData = rest;
      amenitiesFromAi = amenities ?? null;
      activityTypesFromAi = activity_types ?? null;
      if (parkTypesFromAi?.length) aiData.park_types = parkTypesFromAi;
      console.log(`  ${c.green}AI content generated${c.reset}`);
      if (activity_types?.length) {
        console.log(`  ${c.gray}Activity types: ${activity_types.join(', ')}${c.reset}`);
      }
      if (parkTypesFromAi?.length) {
        console.log(`  ${c.gray}Park types: ${parkTypesFromAi.join(', ')}${c.reset}`);
      }
      const restAny = rest as Record<string, unknown>;
      const coreInfoFilled = ['park_size_acres','year_established','entrance_fee','nearby_cities','instagram_hashtag']
        .filter(k => restAny[k] !== null && restAny[k] !== undefined && restAny[k] !== '');
      if (coreInfoFilled.length) {
        console.log(`  ${c.gray}Core info: ${coreInfoFilled.join(', ')}${c.reset}`);
      }
    }
  }

  // ── Step 5: Merge & diff ──────────────────────────────────────────────────
  // NPS and Google Places are authoritative over AI for overlapping fields
  const mergedAiData = { ...aiData };
  if (npsData.entrance_fee) delete mergedAiData.entrance_fee;
  if (npsData.operating_hours || placeData.operating_hours) delete mergedAiData.operating_hours;

  const collected: Record<string, unknown> = {
    slug,
    name: parkDisplayName,
    ...mergedAiData,
    ...placeData,
    ...npsData,
    ...(autoRegions.length ? { park_regions: autoRegions } : {}),
    ...(autoAgency ? { managing_agency: autoAgency } : {}),
    ...(activityTypesFromAi?.length ? { activity_types: activityTypesFromAi } : {}),
    ...(autoDistMiami   !== null ? { distance_from_miami:   autoDistMiami }   : {}),
    ...(autoDistOrlando !== null ? { distance_from_orlando: autoDistOrlando } : {}),
    ...(autoDistTampa   !== null ? { distance_from_tampa:   autoDistTampa }   : {}),
    ...(autoGoogleMapsLink      ? { google_maps_link: autoGoogleMapsLink }    : {}),
  };

  const toApply: Record<string, unknown> = {};

  // Always recalculate these deterministic fields from coordinates
  const alwaysOverwrite = new Set(['distance_from_miami', 'distance_from_orlando', 'distance_from_tampa', 'google_maps_link']);

  for (const [key, value] of Object.entries(collected)) {
    if (value === null || value === undefined || value === '') continue;
    if (!isNew && !alwaysOverwrite.has(key)) {
      const currentVal = existing[key];
      const isEmpty = currentVal === null || currentVal === undefined || currentVal === '' ||
        (['latitude', 'longitude'].includes(key) && currentVal === 0);
      if (!isEmpty && !overwrite) continue;
    }
    toApply[key] = value;
  }

  // ── Step 6: Preview & confirm ─────────────────────────────────────────────
  console.log(`\n${c.bold}─── Preview ───────────────────────────────────────────────${c.reset}`);

  if (Object.keys(toApply).length === 0) {
    console.log(`\n${c.green}No changes to apply — park is already fully populated.${c.reset}`);
    console.log(`${c.gray}Use --overwrite to force-update all fields.${c.reset}\n`);
  } else {
    const color = isNew ? c.green : c.yellow;
    for (const [key, value] of Object.entries(toApply)) {
      if (key === 'slug' || key === 'name') continue;
      printField(key, String(value), color);
    }

    const action = isNew ? 'Create park' : `Apply ${Object.keys(toApply).length} changes`;

    let confirmed: boolean;
    if (autoApply) {
      console.log(`\n${c.gray}Auto-applying changes (autoApply mode)${c.reset}`);
      confirmed = true;
    } else {
      const answer = await prompt(`\n${c.bold}${action}? (y/n): ${c.reset}`);
      confirmed = answer.toLowerCase() === 'y';
    }

    if (!confirmed) {
      console.log(`${c.gray}Aborted.${c.reset}\n`);
      return;
    }

    // ── Step 7: Write to DB ─────────────────────────────────────────────────
    if (isNew) {
      const { error } = await supabaseAdmin.from('parks').insert(toApply);
      if (error) {
        console.error(`\n${c.red}Insert failed: ${error.message}${c.reset}\n`);
        process.exit(1);
      }
      console.log(`\n${c.green}✓ Park created: /admin/parks/${slug}${c.reset}\n`);
    } else {
      const { error } = await supabaseAdmin.from('parks').update(toApply).eq('slug', slug);
      if (error) {
        console.error(`\n${c.red}Update failed: ${error.message}${c.reset}\n`);
        process.exit(1);
      }
      console.log(`\n${c.green}✓ Park updated: /admin/parks/${slug}${c.reset}\n`);
    }
  }

  // ── Step 8: Amenities row ─────────────────────────────────────────────────
  if (amenitiesFromAi) {
    console.log(`\n${c.bold}[Amenities]${c.reset}`);
    const { data: parkRecord } = await supabaseAdmin
      .from('parks').select('id').eq('slug', slug).single();
    if (parkRecord) {
      const amenityRow = { park_id: parkRecord.id, ...amenitiesFromAi };
      const { error: upsertErr } = await supabaseAdmin
        .from('park_amenities')
        .upsert(amenityRow, { onConflict: 'park_id' });
      if (upsertErr) {
        console.warn(`  ${c.yellow}Amenities upsert failed: ${upsertErr.message}${c.reset}`);
      } else {
        const trueKeys = Object.entries(amenitiesFromAi)
          .filter(([, v]) => v).map(([k]) => k);
        console.log(`  ${c.green}Amenities saved — ${trueKeys.length} features: ${trueKeys.join(', ')}${c.reset}`);
      }
    }
  }

  // ── Step 9: Hotel enrichment ──────────────────────────────────────────────
  console.log(`\n${c.bold}[Hotel enrichment]${c.reset}`);
  const { data: enrichParkRecord } = await supabaseAdmin
    .from('parks')
    .select('id, name, slug, city, latitude, longitude, gateway_lat, gateway_lng, gateway_note')
    .eq('slug', slug)
    .single();
  if (enrichParkRecord) {
    await enrichHotels(enrichParkRecord);
  } else {
    console.warn(`  ${c.yellow}Could not fetch park record for hotel enrichment${c.reset}`);
  }
}

// ─── CLI entry point ──────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const parkName = args.find(a => !a.startsWith('--'));

  if (!parkName) {
    console.error('Usage: npx tsx scripts/enrich-one-park.ts "Park Name" [--no-ai] [--no-photo] [--overwrite] [--auto]');
    process.exit(1);
  }

  await enrichPark(toSlug(parkName), {
    displayName: parkName,
    noAi: args.includes('--no-ai'),
    noPhoto: args.includes('--no-photo'),
    overwrite: args.includes('--overwrite'),
    autoApply: args.includes('--auto'),
  });
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(e => { console.error(e); process.exit(1); });
}
