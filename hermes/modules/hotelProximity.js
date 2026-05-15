// modules/hotelProximity.js — Detect and auto-fix parks with missing/invalid hotel distances
// Flags: distance_from_park_km NULL or >50km (matches the 50km enrichment cap).
// Auto-fixes by re-running Google Places nearbysearch with multi-step radius + quality filter.

import { createClient } from '@supabase/supabase-js'
import { logger } from './logger.js'
import {
  getSearchRadius, placesSearchWithFallback, buildHotelRows,
} from './hotelHelpers.js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)

export async function checkHotelProximity() {
  const { data: affected, error } = await supabase
    .from('park_hotels')
    .select('park_id, parks(id, name, slug, city, latitude, longitude)')
    .or('distance_from_park_km.is.null,distance_from_park_km.gt.50')

  if (error) throw new Error(`Hotel proximity query failed: ${error.message}`)

  if (!affected?.length) {
    logger.info('Hotel proximity: all hotels within range — nothing to fix')
    return { detected: 0, fixed: 0, skipped: 0, affectedParks: [], errors: [] }
  }

  const uniqueParks = [...new Map(affected.map(r => [r.park_id, r.parks])).values()]
    .filter(p => p?.latitude && p?.longitude)

  const result = {
    detected: uniqueParks.length,
    fixed: 0,
    skipped: 0,
    affectedParks: uniqueParks.map(p => p.slug),
    errors: [],
  }

  logger.info(`Hotel proximity: ${uniqueParks.length} park(s) with hotels >50km or missing distance`)

  for (const park of uniqueParks) {
    try {
      const baseRadius = getSearchRadius(park.city)
      const { candidates } = await placesSearchWithFallback(
        park.latitude, park.longitude, baseRadius, process.env.GOOGLE_PLACES_API_KEY,
      )

      if (candidates.length === 0) {
        logger.warn(`Hotel proximity: no qualifying lodging found for ${park.name}`)
        result.skipped++
        continue
      }

      const hotels = buildHotelRows(candidates, park)
      await supabase.from('park_hotels').delete().eq('park_id', park.id)
      const { error: insertErr } = await supabase.from('park_hotels').insert(hotels)
      if (insertErr) throw new Error(`Insert failed: ${insertErr.message}`)

      logger.info(`Hotel proximity: fixed ${park.slug} → ${hotels.length} hotel(s) added`)
      result.fixed++
    } catch (err) {
      logger.warn(`Hotel proximity: error for ${park.slug} — ${err.message}`)
      result.errors.push(`${park.slug}: ${err.message}`)
    }

    await new Promise(r => setTimeout(r, 200))
  }

  return result
}

export function buildHotelProximitySection(result) {
  if (result.detected === 0) return ''

  const lines = [
    `🏨 Hotel Proximity Auto-Fix`,
    `  Detected: ${result.detected} park(s) with missing or out-of-range hotel distances (>50km)`,
    `  Fixed: ${result.fixed}  |  Skipped: ${result.skipped} (no nearby lodging found)`,
    `  Parks: ${result.affectedParks.join(', ')}`,
  ]
  if (result.errors.length) {
    lines.push(`  Errors (${result.errors.length}): ${result.errors.join('; ')}`)
  }
  return lines.join('\n')
}
