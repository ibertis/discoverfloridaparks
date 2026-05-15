// modules/feeChecker.js — Detect park entrance fee changes
// Two-part approach:
// 1. Automated check for non-bot-protected parks (fetch page, AI comparison)
// 2. Manual review list for bot-protected parks (floridastateparks.org etc.)

import fetch from 'node-fetch'
import { createClient } from '@supabase/supabase-js'
import { config } from '../config.js'
import { logger } from './logger.js'
import { loadStore, isSuppressed, verifyParks, earliestExpiry } from './feeVerified.js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

// ── Fetch parks with fees ─────────────────────────────────────────────────────

async function fetchParksWithFees() {
  const { data, error } = await supabase
    .from('parks')
    .select('name, slug, website, entrance_fee, park_types')
    .not('entrance_fee', 'is', null)
    .not('website', 'is', null)
    .order('name')

  if (error) throw new Error(`Supabase fetch failed: ${error.message}`)
  return data
}

// ── Check if domain is bot-protected ─────────────────────────────────────────

function isBotProtected(url) {
  try {
    const hostname = new URL(url).hostname.replace('www.', '')
    return config.checker.botProtectedDomains.some(d => hostname.endsWith(d))
  } catch {
    return false
  }
}

// ── Strip HTML tags to extract readable text ──────────────────────────────────

function extractText(html) {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 4000) // Limit to 4000 chars for LM Studio context
}

// ── Extract fee-relevant text snippet ────────────────────────────────────────

function extractFeeContext(text) {
  const feeKeywords = ['fee', 'admission', 'entrance', 'price', 'cost', 'charge', 'rate', 'pay', '$', 'free']
  const words = text.split(' ')

  // Find the best window of text around fee-related words
  let bestStart = 0
  let bestScore = 0

  for (let i = 0; i < words.length - 50; i++) {
    const window = words.slice(i, i + 100).join(' ').toLowerCase()
    const score = feeKeywords.reduce((acc, kw) => acc + (window.includes(kw) ? 1 : 0), 0)
    if (score > bestScore) {
      bestScore = score
      bestStart = i
    }
  }

  return words.slice(bestStart, bestStart + 150).join(' ')
}

// ── Fetch a park's page and extract fee context ───────────────────────────────

async function fetchFeeContext(url) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 12000)

  try {
    const res = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      },
    })

    clearTimeout(timeout)

    if (!res.ok) return null

    const html = await res.text()
    const text = extractText(html)
    return extractFeeContext(text)

  } catch (err) {
    clearTimeout(timeout)
    return null
  }
}

// ── Ask LM Studio to compare fee ──────────────────────────────────────────────

async function checkFeeWithAI(parkName, storedFee, pageContent) {
  try {
    const response = await fetch(`${process.env.LM_STUDIO_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.LM_STUDIO_MODEL,
        messages: [
          {
            role: 'system',
            content: `You are a fee comparison assistant for Discover Florida Parks. 
You extract entrance fee information from webpage text and compare it to a stored value.
Always respond with ONLY a valid JSON object, no other text.`,
          },
          {
            role: 'user',
            content: `Park: ${parkName}
Stored entrance fee: "${storedFee}"
Webpage content excerpt: "${pageContent}"

Based on the webpage content, respond with this exact JSON format:
{
  "fee_found": true or false,
  "detected_fee": "the fee as shown on the page, or null if not found",
  "likely_changed": true or false,
  "confidence": "high", "medium", or "low",
  "notes": "brief explanation"
}`,
          },
        ],
        max_tokens: 200,
        temperature: 0.1,
      }),
    })

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content?.trim()
    if (!content) return null

    // Parse JSON response
    const parsed = JSON.parse(content.replace(/```json|```/g, '').trim())
    return parsed

  } catch (err) {
    return null
  }
}

// ── Main fee check function ───────────────────────────────────────────────────

export async function checkFees({ force = false } = {}) {
  const parks = await fetchParksWithFees()
  logger.info(`Found ${parks.length} parks with entrance fees`)

  const automatable = parks.filter(p => !isBotProtected(p.website))
  const allManual   = parks.filter(p => isBotProtected(p.website))

  // Filter manual review list against verification store
  const store = loadStore()
  const manualReview = allManual.filter(p => !isSuppressed(store, p.slug, p.entrance_fee, force))
  const suppressedCount = allManual.length - manualReview.length
  const nextReview = suppressedCount > 0 ? earliestExpiry(store, allManual) : null

  if (suppressedCount > 0) {
    logger.info(`Fee verification: ${suppressedCount} park(s) suppressed (verified within TTL)${nextReview ? ` — next review ${nextReview.toDateString()}` : ''}`)
  }

  logger.info(`Automated check: ${automatable.length} parks | Manual review: ${manualReview.length} active (${suppressedCount} suppressed)`)

  // ── Automated checks ────────────────────────────────────────────────────────
  const flagged = []
  const checked = []

  for (const park of automatable) {
    logger.info(`Checking fee: ${park.name}`)

    const pageContent = await fetchFeeContext(park.website)

    if (!pageContent) {
      logger.warn(`Could not fetch page for fee check: ${park.name}`)
      continue
    }

    const result = await checkFeeWithAI(park.name, park.entrance_fee, pageContent)

    if (!result) {
      logger.warn(`AI fee check failed for: ${park.name}`)
      continue
    }

    checked.push({ park, result })

    if (result.likely_changed && result.confidence !== 'low') {
      flagged.push({ park, result })
      logger.warn(`FEE CHANGE DETECTED: ${park.name} | Stored: "${park.entrance_fee}" | Detected: "${result.detected_fee}" | Confidence: ${result.confidence}`)
    }
  }

  logger.info(`Automated fee checks complete: ${checked.length} checked, ${flagged.length} flagged`)

  return {
    flagged,
    checked,
    manualReview,
    suppressedCount,
    nextReview,
    automatedTotal: automatable.length,
    manualTotal: allManual.length,
  }
}

// ── Mark all bot-protected parks as verified (called by --verify-fees) ────────

export async function verifyAllFees() {
  const parks = await fetchParksWithFees()
  const allManual = parks.filter(p => isBotProtected(p.website))
  verifyParks(allManual)
  return allManual.length
}

// ── Build manual review section for email ────────────────────────────────────

export function buildManualReviewList(manualReview, suppressedCount = 0, nextReview = null) {
  const hasSuppressed = suppressedCount > 0
  const hasActive = manualReview.length > 0

  if (!hasActive && !hasSuppressed) return ''

  const sections = []

  if (hasActive) {
    const lines = manualReview.map(p => `  ${p.name}: ${p.entrance_fee}`).join('\n')
    sections.push(
      `MANUAL REVIEW REQUIRED (${manualReview.length} parks — fees unverified or TTL expired):\n${lines}`,
      `  Once confirmed correct, run: node hermes/index.js --verify-fees`
    )
  }

  if (hasSuppressed) {
    const nextStr = nextReview
      ? `next re-check ${nextReview.toDateString()}`
      : `90-day TTL active`
    sections.push(`  ✓ ${suppressedCount} park(s) suppressed — verified within TTL (${nextStr})`)
  }

  return '\n\n' + sections.join('\n')
}
