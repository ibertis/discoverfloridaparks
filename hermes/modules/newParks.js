// modules/newParks.js — Detect parks added in the last 24 hours that haven't been fully onboarded
// Runs daily: queries parks created within the last 24 hours and checks for missing enrichment.
// Silent when nothing is found. Appends an actionable section to the daily email when issues exist.
//
// Checks (mirrors validate-park.ts blockers + key warnings):
//   BLOCKER  — missing GPS coordinates (latitude or longitude null)
//   BLOCKER  — missing description (short_description null / shorter than 50 chars)
//   BLOCKER  — missing featured image (featured_image_url null)
//   WARNING  — no row in park_amenities
//   WARNING  — no rows in park_hotels
//
// Requires in hermes/.env:
//   SUPABASE_URL              (already present)
//   SUPABASE_SERVICE_ROLE_KEY (already present)

import { createClient } from '@supabase/supabase-js'
import { logger } from './logger.js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)

// ── Core check ────────────────────────────────────────────────────────────────

export async function checkNewParks() {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const { data: parks, error } = await supabase
    .from('parks')
    .select('id, slug, name, short_description, featured_image_url, latitude, longitude, park_amenities(park_id), park_hotels(id)')
    .gte('created_at', since)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`New parks query failed: ${error.message}`)

  if (!parks?.length) {
    logger.info('New parks: no parks added in the last 24 hours')
    return { total: 0, incomplete: [] }
  }

  logger.info(`New parks: ${parks.length} park(s) added in the last 24 hours — checking onboarding status`)

  const incomplete = []

  for (const park of parks) {
    const issues = []

    if (!park.latitude || !park.longitude) {
      issues.push({ label: 'No GPS coordinates', blocker: true })
    }

    const desc = park.short_description?.trim() ?? ''
    if (!desc || desc.length < 50) {
      issues.push({ label: 'Missing or too-short description', blocker: true })
    }

    if (!park.featured_image_url) {
      issues.push({ label: 'No featured image', blocker: true })
    }

    const amenities = Array.isArray(park.park_amenities) ? park.park_amenities : []
    if (amenities.length === 0) {
      issues.push({ label: 'No amenities row', blocker: false })
    }

    const hotels = Array.isArray(park.park_hotels) ? park.park_hotels : []
    if (hotels.length === 0) {
      issues.push({ label: 'No hotels', blocker: false })
    }

    if (issues.length > 0) {
      incomplete.push({ name: park.name, slug: park.slug, issues })
      logger.warn(`New park incomplete: ${park.slug} — ${issues.map(i => i.label).join(', ')}`)
    } else {
      logger.info(`New park complete: ${park.slug}`)
    }
  }

  return { total: parks.length, incomplete }
}

// ── Email section builder ─────────────────────────────────────────────────────

export function buildNewParksSection(result) {
  if (result.incomplete.length === 0) return ''

  const count = result.incomplete.length
  const noun = count === 1 ? 'park' : 'parks'

  const lines = [
    `🌴 New Parks Need Onboarding`,
    `  ${count} ${noun} added in the last 24 hours ${count === 1 ? 'is' : 'are'} not fully onboarded:`,
    '',
  ]

  for (const park of result.incomplete) {
    lines.push(`  • ${park.name} (${park.slug})`)
    for (const issue of park.issues) {
      const icon = issue.blocker ? '✗' : '⚠'
      lines.push(`    ${icon} ${issue.label}`)
    }
    lines.push(`    Run: npx tsx scripts/onboard-park.ts --slug ${park.slug}`)
    lines.push('')
  }

  return lines.join('\n').trimEnd()
}
