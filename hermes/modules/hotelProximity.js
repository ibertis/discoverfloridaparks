// modules/hotelProximity.js — Detect and auto-fix parks with missing/invalid hotel distances
// Runs daily: finds parks where distance_from_park_km is NULL or >30km,
// then replaces their hotels using a fresh Google Places nearbysearch.
//
// Requires in hermes/.env:
//   SUPABASE_URL               (already present)
//   SUPABASE_SERVICE_ROLE_KEY  (service role needed to bypass RLS on DELETE)
//   GOOGLE_PLACES_API_KEY      (already present)

import fetch from 'node-fetch'
import { createClient } from '@supabase/supabase-js'
import { logger } from './logger.js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)

// ── Geo helpers (inlined from scripts/utils/geo.ts — no TS support in Hermes) ─

const RURAL_CITIES = new Set([
  'Holt', 'Sneads', 'Ponce de Leon', 'Keystone Heights', 'Fort White',
  'High Springs', 'Wimauma', 'Copeland', 'Ochopee', 'Layton', 'Micanopy',
  'Thonotosassa', 'Tierra Verde', 'Niceville', 'Chiefland', 'Chipley',
  'Ponce De Leon', 'Live Oak', 'White Springs',
])

function getSearchRadius(city) {
  return (city && RURAL_CITIES.has(city)) ? 25000 : 12000
}

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// ── Hotel helpers (mirrors fix-hotel-proximity.ts) ────────────────────────────

function buildBookingUrl(hotelName, vicinity, parkSlug) {
  return 'https://www.booking.com/search.html' +
    `?ss=${encodeURIComponent(hotelName + ' ' + (vicinity || ''))}` +
    `&aid=2889331&label=dfp-${parkSlug}`
}

function buildHotelDescription(place, parkName) {
  const rating = place.rating ? `Rated ${place.rating}/5` : ''
  const reviews = place.user_ratings_total ? `(${place.user_ratings_total} reviews)` : ''
  const vicinity = place.vicinity || ''
  return `${place.name} — ${vicinity}. ${rating} ${reviews}. Nearby base for visiting ${parkName}.`.trim()
}

// ── Core check + auto-fix function ───────────────────────────────────────────

export async function checkHotelProximity() {
  const { data: affected, error } = await supabase
    .from('park_hotels')
    .select('park_id, parks(id, name, slug, city, latitude, longitude)')
    .or('distance_from_park_km.is.null,distance_from_park_km.gt.30')

  if (error) throw new Error(`Hotel proximity query failed: ${error.message}`)

  if (!affected?.length) {
    logger.info('Hotel proximity: all hotels within range — nothing to fix')
    return { detected: 0, fixed: 0, skipped: 0, affectedParks: [], errors: [] }
  }

  // Deduplicate: multiple hotels per park produce multiple rows
  const uniqueParks = [...new Map(affected.map(r => [r.park_id, r.parks])).values()]
    .filter(p => p?.latitude && p?.longitude)

  const result = {
    detected: uniqueParks.length,
    fixed: 0,
    skipped: 0,
    affectedParks: uniqueParks.map(p => p.slug),
    errors: [],
  }

  logger.info(`Hotel proximity: ${uniqueParks.length} park(s) need re-enrichment`)

  for (const park of uniqueParks) {
    try {
      const radius = getSearchRadius(park.city)
      const placesUrl = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json' +
        `?location=${park.latitude},${park.longitude}` +
        `&radius=${radius}` +
        `&type=lodging` +
        `&key=${process.env.GOOGLE_PLACES_API_KEY}`

      const res = await fetch(placesUrl)
      const data = await res.json()

      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        throw new Error(`Places API: ${data.status}`)
      }

      const hotels = (data.results || [])
        .filter(p => (p.rating || 0) >= 3.8)
        .slice(0, 3)
        .map(h => {
          const distKm = haversineDistance(
            park.latitude, park.longitude,
            h.geometry.location.lat, h.geometry.location.lng,
          )
          return {
            park_id: park.id,
            name: h.name,
            url: buildBookingUrl(h.name, h.vicinity, park.slug),
            description: buildHotelDescription(h, park.name),
            latitude: h.geometry.location.lat,
            longitude: h.geometry.location.lng,
            distance_from_park_km: Math.round(distKm * 100) / 100,
          }
        })

      if (hotels.length === 0) {
        logger.warn(`Hotel proximity: no lodging ≥3.8★ within ${radius / 1000}km of ${park.name}`)
        result.skipped++
        continue
      }

      await supabase.from('park_hotels').delete().eq('park_id', park.id)
      const { error: insertErr } = await supabase.from('park_hotels').insert(hotels)
      if (insertErr) throw new Error(`Insert failed: ${insertErr.message}`)

      logger.info(`Hotel proximity: fixed ${park.slug} → ${hotels.length} hotels added`)
      result.fixed++
    } catch (err) {
      logger.warn(`Hotel proximity: error for ${park.slug} — ${err.message}`)
      result.errors.push(`${park.slug}: ${err.message}`)
    }

    await new Promise(r => setTimeout(r, 200))
  }

  return result
}

// ── Email section builder ─────────────────────────────────────────────────────

export function buildHotelProximitySection(result) {
  if (result.detected === 0) return ''

  const lines = [
    `🏨 Hotel Proximity Auto-Fix`,
    `  Detected: ${result.detected} park(s) with missing or out-of-range hotel distances`,
    `  Fixed: ${result.fixed}  |  Skipped: ${result.skipped} (no nearby lodging)`,
    `  Parks: ${result.affectedParks.join(', ')}`,
  ]
  if (result.errors.length) {
    lines.push(`  Errors (${result.errors.length}): ${result.errors.join('; ')}`)
  }
  return lines.join('\n')
}
