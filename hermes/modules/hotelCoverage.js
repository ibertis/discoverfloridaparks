// modules/hotelCoverage.js — Detect parks with 0 hotel entries and auto-fix them
// Grace period: parks created within the last 3 days are ignored (newParks.js handles those).

import { createClient } from '@supabase/supabase-js'
import { logger } from './logger.js'
import {
  getSearchRadius, placesSearchWithFallback, buildHotelRows,
} from './hotelHelpers.js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)

const GRACE_PERIOD_DAYS = 3

export async function checkHotelCoverage() {
  const cutoff = new Date(Date.now() - GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000).toISOString()

  // All parks older than the grace period
  const { data: allParks, error: parksErr } = await supabase
    .from('parks')
    .select('id, name, slug, city, latitude, longitude, created_at')
    .lt('created_at', cutoff)
    .not('latitude', 'is', null)

  if (parksErr) throw new Error(`Hotel coverage parks query failed: ${parksErr.message}`)

  // Parks that already have at least one hotel
  const { data: covered, error: covErr } = await supabase
    .from('park_hotels')
    .select('park_id')

  if (covErr) throw new Error(`Hotel coverage hotels query failed: ${covErr.message}`)

  const coveredIds = new Set(covered.map(r => r.park_id))
  const uncovered = (allParks || []).filter(p => !coveredIds.has(p.id))

  const result = {
    detected: uncovered.length,
    fixed: 0,
    skipped: 0,
    affectedParks: uncovered.map(p => p.slug),
    errors: [],
  }

  if (uncovered.length === 0) {
    logger.info('Hotel coverage: all parks have hotel entries — nothing to fix')
    return result
  }

  logger.info(`Hotel coverage: ${uncovered.length} park(s) have no hotel entries`)

  // Report-only by default (same rationale as hotelProximity.js: buildHotelRows
  // inserts hotels with no photo_reference/place_id, and it spends Google $).
  // Opt in with HERMES_HOTEL_AUTOFIX=true; otherwise report and let the user run
  // the photo-preserving script (scripts/fix-hotels-bulk.ts).
  result.autofix = process.env.HERMES_HOTEL_AUTOFIX === 'true'
  if (!result.autofix) {
    logger.info('Hotel coverage: report-only (set HERMES_HOTEL_AUTOFIX=true to auto-enrich)')
    return result
  }

  for (const park of uncovered) {
    try {
      const baseRadius = getSearchRadius(park.city)
      const { candidates, usedRadius } = await placesSearchWithFallback(
        park.latitude, park.longitude, baseRadius, process.env.GOOGLE_PLACES_API_KEY,
      )

      if (candidates.length === 0) {
        logger.warn(`Hotel coverage: no qualifying lodging found within ${usedRadius / 1000}km of ${park.name}`)
        result.skipped++
        continue
      }

      const hotels = buildHotelRows(candidates, park)
      const { error: insertErr } = await supabase.from('park_hotels').insert(hotels)
      if (insertErr) throw new Error(`Insert failed: ${insertErr.message}`)

      logger.info(`Hotel coverage: enriched ${park.slug} → ${hotels.length} hotel(s) added`)
      result.fixed++
    } catch (err) {
      logger.warn(`Hotel coverage: error for ${park.slug} — ${err.message}`)
      result.errors.push(`${park.slug}: ${err.message}`)
    }

    await new Promise(r => setTimeout(r, 200))
  }

  return result
}

export function buildHotelCoverageSection(result) {
  if (result.detected === 0) return ''

  const lines = result.autofix
    ? [
        `🏨 Hotel Coverage`,
        `  Parks with no hotels: ${result.detected}`,
        `  Auto-enriched: ${result.fixed}  |  No lodging found: ${result.skipped}`,
      ]
    : [
        `🏨 Hotel Coverage (report-only)`,
        `  Parks with no hotels: ${result.detected}`,
        `  Enrich (preserves photos): npx tsx scripts/fix-hotels-bulk.ts`,
      ]
  if (result.affectedParks.length) {
    lines.push(`  Parks: ${result.affectedParks.join(', ')}`)
  }
  if (result.errors.length) {
    lines.push(`  Errors (${result.errors.length}): ${result.errors.join('; ')}`)
  }
  return lines.join('\n')
}
