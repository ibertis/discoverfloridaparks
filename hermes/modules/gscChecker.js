// modules/gscChecker.js — Google Search Console monitoring
// Detects traffic drops, ranking losses, and CTR changes
// Compares last 7 days vs previous 7 days (GSC has a 3-day data delay)

import { google } from 'googleapis'
import { readFileSync, writeFileSync } from 'fs'
import { logger } from './logger.js'

const CREDENTIALS_PATH = './oauth-credentials.json'
const TOKEN_PATH = './.gsc-token.json'
const SITE_URL = 'sc-domain:discoverfloridaparks.com'

// ── Alert thresholds ──────────────────────────────────────────────────────────
const THRESHOLDS = {
  clickDropPercent: 30,        // Alert if clicks drop >30% week-over-week
  impressionDropPercent: 40,   // Alert if impressions drop >40%
  positionDropPoints: 5,       // Alert if avg position drops >5 spots
  minClicksToMonitor: 3,       // Only monitor pages with ≥3 clicks last period
  topPagesToCheck: 50,         // Check top 50 pages by traffic
}

// ── Auth ──────────────────────────────────────────────────────────────────────

function getAuthClient() {
  try {
    const credentials = JSON.parse(readFileSync(CREDENTIALS_PATH, 'utf8'))
    const tokens = JSON.parse(readFileSync(TOKEN_PATH, 'utf8'))

    const { client_secret, client_id, redirect_uris } = credentials.installed
    const oauth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0])

    oauth2Client.setCredentials(tokens)

    // Auto-save refreshed tokens
    oauth2Client.on('tokens', (newTokens) => {
      if (newTokens.refresh_token) {
        const updated = { ...tokens, ...newTokens }
        writeFileSync(TOKEN_PATH, JSON.stringify(updated, null, 2))
        logger.info('GSC token refreshed and saved')
      }
    })

    return oauth2Client

  } catch (err) {
    logger.warn(`GSC auth failed: ${err.message} — run gsc-auth.js to authenticate`)
    return null
  }
}

// ── Date helpers ──────────────────────────────────────────────────────────────

function getDateRange() {
  const today = new Date()

  // GSC has a 3-day delay — end 3 days ago
  const endDate = new Date(today)
  endDate.setDate(today.getDate() - 3)

  // Current period: last 7 days
  const currentStart = new Date(endDate)
  currentStart.setDate(endDate.getDate() - 6)

  // Previous period: 7 days before that
  const prevEnd = new Date(currentStart)
  prevEnd.setDate(currentStart.getDate() - 1)

  const prevStart = new Date(prevEnd)
  prevStart.setDate(prevEnd.getDate() - 6)

  const fmt = d => d.toISOString().split('T')[0]

  return {
    current: { start: fmt(currentStart), end: fmt(endDate) },
    previous: { start: fmt(prevStart), end: fmt(prevEnd) },
  }
}

// ── Query GSC API ─────────────────────────────────────────────────────────────

async function queryGSC(auth, dateRange, dimensions = ['page']) {
  const searchconsole = google.searchconsole({ version: 'v1', auth })

  const response = await searchconsole.searchanalytics.query({
    siteUrl: SITE_URL,
    requestBody: {
      startDate: dateRange.start,
      endDate: dateRange.end,
      dimensions,
      rowLimit: THRESHOLDS.topPagesToCheck,
      dataState: 'all',
    },
  })

  return response.data.rows || []
}

// ── Process results ───────────────────────────────────────────────────────────

function buildPageMap(rows) {
  const map = {}
  for (const row of rows) {
    const page = row.keys[0]
    map[page] = {
      clicks: row.clicks || 0,
      impressions: row.impressions || 0,
      ctr: row.ctr || 0,
      position: row.position || 0,
    }
  }
  return map
}

function percentChange(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

// ── Main GSC check ────────────────────────────────────────────────────────────

export async function checkGSC() {
  const auth = getAuthClient()

  if (!auth) {
    return {
      available: false,
      message: 'GSC authentication not set up. Run: node gsc-auth.js',
      flagged: [],
      summary: null,
    }
  }

  try {
    const dates = getDateRange()
    logger.info(`GSC check: ${dates.current.start} to ${dates.current.end} vs ${dates.previous.start} to ${dates.previous.end}`)

    // Fetch current and previous periods
    const [currentRows, previousRows] = await Promise.all([
      queryGSC(auth, dates.current),
      queryGSC(auth, dates.previous),
    ])

    const currentMap = buildPageMap(currentRows)
    const previousMap = buildPageMap(previousRows)

    // Site-level totals
    const currentTotals = currentRows.reduce((acc, r) => ({
      clicks: acc.clicks + (r.clicks || 0),
      impressions: acc.impressions + (r.impressions || 0),
    }), { clicks: 0, impressions: 0 })

    const previousTotals = previousRows.reduce((acc, r) => ({
      clicks: acc.clicks + (r.clicks || 0),
      impressions: acc.impressions + (r.impressions || 0),
    }), { clicks: 0, impressions: 0 })

    const siteClickChange = percentChange(currentTotals.clicks, previousTotals.clicks)
    const siteImpressionChange = percentChange(currentTotals.impressions, previousTotals.impressions)

    logger.info(`GSC site totals: ${currentTotals.clicks} clicks (${siteClickChange > 0 ? '+' : ''}${siteClickChange.toFixed(1)}%), ${currentTotals.impressions} impressions`)

    // Page-level analysis
    const flagged = []

    for (const [page, current] of Object.entries(currentMap)) {
      const previous = previousMap[page] || { clicks: 0, impressions: 0, ctr: 0, position: 0 }

      // Skip pages with very low traffic
      if (previous.clicks < THRESHOLDS.minClicksToMonitor) continue

      const clickChange = percentChange(current.clicks, previous.clicks)
      const impressionChange = percentChange(current.impressions, previous.impressions)
      const positionChange = current.position - previous.position // positive = dropped

      const issues = []

      if (clickChange <= -THRESHOLDS.clickDropPercent) {
        issues.push(`clicks dropped ${Math.abs(clickChange).toFixed(0)}% (${previous.clicks} → ${current.clicks})`)
      }
      if (impressionChange <= -THRESHOLDS.impressionDropPercent) {
        issues.push(`impressions dropped ${Math.abs(impressionChange).toFixed(0)}% (${previous.impressions} → ${current.impressions})`)
      }
      if (positionChange >= THRESHOLDS.positionDropPoints) {
        issues.push(`position dropped ${positionChange.toFixed(1)} spots (${previous.position.toFixed(1)} → ${current.position.toFixed(1)})`)
      }

      if (issues.length > 0) {
        flagged.push({ page, issues, current, previous })
        logger.warn(`GSC FLAG: ${page} — ${issues.join(', ')}`)
      }
    }

    logger.info(`GSC check complete: ${Object.keys(currentMap).length} pages checked, ${flagged.length} flagged`)

    return {
      available: true,
      flagged,
      dates,
      siteMetrics: {
        current: currentTotals,
        previous: previousTotals,
        clickChange: siteClickChange,
        impressionChange: siteImpressionChange,
      },
    }

  } catch (err) {
    logger.warn(`GSC check failed: ${err.message}`)
    return {
      available: false,
      message: `GSC API error: ${err.message}`,
      flagged: [],
      summary: null,
    }
  }
}

// ── Build GSC section for email ───────────────────────────────────────────────

export function buildGSCSummary(gscResult) {
  if (!gscResult.available) {
    return `\n\nGSC STATUS: Unavailable — ${gscResult.message}`
  }

  const { siteMetrics, flagged, dates } = gscResult
  const arrow = n => n >= 0 ? `+${n.toFixed(1)}%` : `${n.toFixed(1)}%`

  const lines = [
    `\n\nGSC PERFORMANCE (${dates.current.start} to ${dates.current.end} vs prior week)`,
    `Site: ${siteMetrics.current.clicks} clicks (${arrow(siteMetrics.clickChange)}) · ${siteMetrics.current.impressions} impressions (${arrow(siteMetrics.impressionChange)})`,
  ]

  if (flagged.length === 0) {
    lines.push('✅ No significant traffic drops detected')
  } else {
    lines.push(`⚠️  ${flagged.length} page${flagged.length > 1 ? 's' : ''} flagged:`)
    for (const { page, issues } of flagged) {
      const shortPage = page.replace('https://discoverfloridaparks.com', '')
      lines.push(`  • ${shortPage}: ${issues.join('; ')}`)
    }
  }

  return lines.join('\n')
}
