// modules/newParks.js — Detect parks added in the last 24 hours that haven't been fully onboarded
// Runs daily: queries parks created within the last 24 hours and checks for missing enrichment.
// Silent when nothing is found. Appends an actionable section to the daily email when issues exist.
//
// Checks (mirrors validate-park.ts blockers + key warnings):
//   BLOCKER  — missing GPS coordinates (latitude or longitude null)
//   BLOCKER  — missing description (short_description null / shorter than 30 chars)
//   BLOCKER  — missing featured image (featured_image_url null)
//   WARNING  — no row in park_amenities
//   WARNING  — no rows in park_hotels
//
// Requires in hermes/.env:
//   SUPABASE_URL              (already present)
//   SUPABASE_SERVICE_ROLE_KEY (already present)

import { createClient } from '@supabase/supabase-js'
import { spawnSync } from 'child_process'
import { fileURLToPath } from 'url'
import path from 'path'
import { logger } from './logger.js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)

// Project root is two levels up from hermes/modules/
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = path.resolve(__dirname, '../..')

// Resolve npx absolute path so launchd/cron jobs (minimal PATH) can find it.
// Homebrew installs to /opt/homebrew/bin on Apple Silicon, /usr/local/bin on Intel.
const NPX_CANDIDATES = ['/opt/homebrew/bin/npx', '/usr/local/bin/npx', 'npx']
const NPX = NPX_CANDIDATES.find(p => {
  try { spawnSync(p, ['--version'], { timeout: 3000 }); return true } catch { return false }
}) ?? 'npx'

// ── Onboarding subprocess ─────────────────────────────────────────────────────

function onboardPark(slug) {
  const result = spawnSync(
    NPX,
    ['tsx', 'scripts/onboard-park.ts', '--slug', slug],
    {
      cwd: PROJECT_ROOT,
      encoding: 'utf8',
      timeout: 5 * 60 * 1000, // 5 min — enrichment can be slow
      env: {
        ...process.env,
        // Ensure Homebrew bin is in PATH for subprocesses (launchd strips this)
        PATH: ['/opt/homebrew/bin', '/usr/local/bin', process.env.PATH].filter(Boolean).join(':'),
      },
    }
  )

  const spawnErr = result.error ? `spawn: ${result.error.message}` : ''
  return {
    slug,
    success: result.status === 0,
    output: (result.stdout || '').trim(),
    error: (result.stderr || spawnErr || '').trim(),
    timedOut: result.error?.code === 'ETIMEDOUT',
  }
}

// ── Core check (detection only — stays in parallel block) ─────────────────────

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
    if (!desc || desc.length < 30) {
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

// ── Sequential onboarding (runs after parallel block — spawnSync blocks event loop) ──

export async function runOnboarding(parks) {
  const results = []
  for (let i = 0; i < parks.length; i++) {
    const park = parks[i]
    logger.info(`Auto-onboarding [${i + 1}/${parks.length}]: ${park.slug}`)
    const result = onboardPark(park.slug)
    results.push({ ...result, parkName: park.name })
    if (i < parks.length - 1) {
      await new Promise(r => setTimeout(r, 1000))
    }
  }
  return results
}

// ── Email section builder ─────────────────────────────────────────────────────

export function buildNewParksSection(result, onboardResults, dryRun) {
  if (result.incomplete.length === 0) return ''

  const count = result.incomplete.length
  const noun = count === 1 ? 'park' : 'parks'

  const lines = [
    `🌴 New Parks — ${count} ${noun} added in the last 24 hours`,
    '',
  ]

  if (dryRun) {
    result.incomplete.forEach(p => {
      lines.push(`  • ${p.name} (${p.slug})`)
      for (const issue of p.issues) {
        const icon = issue.blocker ? '✗' : '⚠'
        lines.push(`    ${icon} ${issue.label}`)
      }
    })
    lines.push('')
    lines.push('  Dry run — no onboarding attempted.')
    lines.push('  Run manually: npx tsx scripts/onboard-park.ts --slug [slug]')
  } else {
    const succeeded = onboardResults.filter(r => r.success)
    const failed = onboardResults.filter(r => !r.success)

    if (succeeded.length > 0) {
      lines.push(`  ✅ Auto-onboarded (${succeeded.length}):`)
      succeeded.forEach(r => lines.push(`    • ${r.parkName} (${r.slug})`))
      lines.push('')
      lines.push('  ⚠️  Still needs your review for each park above:')
      lines.push('    1. Amenities — verify in Supabase match reality')
      lines.push('    2. Live page — check hero, badges, gear, hotels')
      lines.push('    3. Hermes dry-run — confirm detected: 0')
    }

    if (failed.length > 0) {
      lines.push('')
      lines.push(`  ❌ Failed to onboard (${failed.length}):`)
      failed.forEach(r => {
        const reason = r.timedOut
          ? 'Timed out after 5 minutes'
          : (r.error || r.output || 'Unknown error').split('\n')[0].substring(0, 120)
        lines.push(`    • ${r.parkName} (${r.slug}): ${reason}`)
        lines.push(`      Run manually: npx tsx scripts/onboard-park.ts --slug ${r.slug}`)
      })
    }
  }

  return lines.join('\n').trimEnd()
}
