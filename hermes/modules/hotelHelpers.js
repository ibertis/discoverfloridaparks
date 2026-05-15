// modules/hotelHelpers.js — Shared hotel enrichment logic
// Used by hotelProximity.js and hotelCoverage.js

import fetch from 'node-fetch'

// ── Geo helpers ───────────────────────────────────────────────────────────────

export const RURAL_CITIES = new Set([
  'Holt', 'Sneads', 'Ponce de Leon', 'Keystone Heights', 'Fort White',
  'High Springs', 'Wimauma', 'Copeland', 'Ochopee', 'Layton', 'Micanopy',
  'Thonotosassa', 'Tierra Verde', 'Niceville', 'Chiefland', 'Chipley',
  'Ponce De Leon', 'Live Oak', 'White Springs',
])

export function getSearchRadius(city) {
  return (city && RURAL_CITIES.has(city)) ? 25000 : 12000
}

export function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// ── Quality filter (mirrors fix-hotels-bulk.ts) ───────────────────────────────

const NOT_A_HOTEL = /\b(airboat|canoe|kayak|outfitter|outfitters|visitor cent(?:er|re)|chamber of commerce|fish camp(?! & rv| resort)|rides?\b|guided tour|boat tour|nature tour|wildlife tour|group camp|scout(?:s)? (lodge|camp)|bsa\b|campsite|cave dive|tcas camping|swfwmd|water management district)\b|\bcamp$/i

export function isLikelyHotel(name) {
  return !NOT_A_HOTEL.test(name)
}

// ── Places search with multi-step radius expansion ────────────────────────────
// Tries base → 25km → 50km, accumulating unique results by place_id until 3 slots filled.

export async function placesSearchWithFallback(lat, lng, baseRadius, apiKey) {
  const radii = [...new Set([baseRadius, 25000, 50000])].filter(r => r >= baseRadius)
  const seen = new Map() // keyed by place_id to avoid duplicates across radii
  let usedRadius = baseRadius

  for (const radius of radii) {
    const url =
      'https://maps.googleapis.com/maps/api/place/nearbysearch/json' +
      `?location=${lat},${lng}&radius=${radius}&type=lodging&key=${apiKey}`
    const res = await fetch(url)
    const data = await res.json()

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Places API: ${data.status}`)
    }

    const filtered = (data.results || []).filter(p => {
      if ((p.rating || 0) < 3.8) return false
      if (!isLikelyHotel(p.name)) return false
      // Allow campgrounds only when Google has a full street address
      if (p.types?.includes('campground') && !/\d/.test(p.vicinity ?? '')) return false
      return true
    })

    for (const p of filtered) if (!seen.has(p.place_id)) seen.set(p.place_id, p)
    usedRadius = radius
    if (seen.size >= 3) break
  }

  return { candidates: [...seen.values()].slice(0, 3), usedRadius }
}

// ── Description + URL builders ────────────────────────────────────────────────

export function buildBookingUrl(hotelName, vicinity, parkSlug) {
  return 'https://www.booking.com/search.html' +
    `?ss=${encodeURIComponent(hotelName + ' ' + (vicinity || ''))}` +
    `&aid=2889331&label=dfp-${parkSlug}`
}

export function buildHotelDescription(place, parkName) {
  const rating = place.rating ? `Rated ${place.rating}/5` : ''
  const reviews = place.user_ratings_total ? `(${place.user_ratings_total} reviews)` : ''
  const vicinity = place.vicinity || ''
  return `${place.name} — ${vicinity}. ${rating} ${reviews}. Nearby base for visiting ${parkName}.`.trim()
}

// ── Build hotel rows ready for Supabase insert ────────────────────────────────

export function buildHotelRows(candidates, park) {
  return candidates.map(h => {
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
}
