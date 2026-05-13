// validate-park.js — DFP Park Onboarding Validation Script
// Usage:
//   node validate-park.js <slug>          — validate one park
//   node validate-park.js --all           — validate every park, print summary
import 'dotenv/config'
import fetch from 'node-fetch'
import { createClient } from '@supabase/supabase-js'
import { config } from './config.js'

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
const TRACKING_RE = /[?&](utm_[^&=]*|CMP=[^&]*|source=[^&]*)/
const FLORIDA_BOUNDS = { latMin: 24.4, latMax: 31.0, lngMin: -87.6, lngMax: -79.8 }
const GENERIC_CAMPING_URLS = [
  'https://reserve.floridastateparks.org',
  'https://www.recreation.gov',
]
const PARK_FIELDS = `
  id, name, slug, website, short_description, featured_image_url,
  city, county, latitude, longitude, park_types, park_regions,
  managing_agency, camping_url, reservation_url, reservation_required
`
const LINE = '━'.repeat(40)

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

// ─── URL helpers ──────────────────────────────────────────────────────────────

function isBotProtected(url) {
  try {
    const hostname = new URL(url).hostname.replace('www.', '')
    return config.checker.botProtectedDomains.some(d => hostname.endsWith(d))
  } catch {
    return false
  }
}

async function checkURL(url) {
  const result = {
    url,
    isHttps: url.startsWith('https://'),
    hasTracking: TRACKING_RE.test(url),
    protected: isBotProtected(url),
    status: null,
    healthy: false,
    error: null,
  }

  if (result.protected) {
    result.healthy = true
    return result
  }

  const controller = new AbortController()
  const tid = setTimeout(() => controller.abort(), config.checker.timeoutMs)

  try {
    const res = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      redirect: 'follow',
      headers: { 'User-Agent': UA },
    })
    clearTimeout(tid)
    result.status = res.status
    result.healthy = config.checker.healthyCodes.includes(res.status)
  } catch (err) {
    clearTimeout(tid)
    result.error = err.name === 'AbortError' ? 'Timeout' : err.message
  }

  return result
}

// ─── Core validation (no printing, no process.exit) ──────────────────────────

async function runChecks(park, hotels = [], experiences = []) {
  const results = []
  const pass = msg => results.push({ type: 'pass', msg })
  const warn = msg => results.push({ type: 'warn', msg })
  const fail = msg => results.push({ type: 'fail', msg })

  // 1. Park record found (always true here — caller handles not-found)
  pass('Park record found')

  // 2. Required fields
  const REQUIRED = [
    'name', 'slug', 'website', 'short_description', 'featured_image_url',
    'city', 'county', 'latitude', 'longitude', 'park_types', 'park_regions',
    'managing_agency',
  ]
  const missing = REQUIRED.filter(f => {
    const v = park[f]
    if (Array.isArray(v)) return v.length === 0
    return v === null || v === undefined || v === ''
  })
  if (missing.length > 0) {
    warn(`Missing required fields:\n${missing.map(f => `      - ${f}`).join('\n')}`)
  } else {
    pass('All required fields present')
  }

  // 3. Slug length
  if (park.slug.length > 60) {
    fail(`Slug too long: "${park.slug}" (${park.slug.length} chars, max 60)`)
  } else {
    pass(`Slug length: ${park.slug.length} chars (within 60 char limit)`)
  }

  // 4. Website URL health
  if (park.website) {
    const r = await checkURL(park.website)
    const label = r.protected
      ? `${park.website} (bot-protected)`
      : `${park.website} (${r.status ?? r.error})`
    if (!r.isHttps) fail(`website uses HTTP instead of HTTPS: ${park.website}`)
    if (r.hasTracking) warn(`website contains tracking parameters: ${park.website}`)
    if (!r.protected && !r.healthy) {
      fail(`website unreachable: ${label}`)
    } else {
      pass(`website: ${label}`)
    }
  }

  // 5. Camping URL health
  if (park.camping_url) {
    const r = await checkURL(park.camping_url)
    const normalized = park.camping_url.replace(/\/$/, '')
    const isGeneric = GENERIC_CAMPING_URLS.includes(normalized)
    const label = r.protected
      ? `${park.camping_url} (bot-protected)`
      : `${park.camping_url} (${r.status ?? r.error})`
    if (!r.isHttps) fail(`camping_url uses HTTP instead of HTTPS: ${park.camping_url}`)
    if (r.hasTracking) warn(`camping_url contains tracking parameters: ${park.camping_url}`)
    if (isGeneric) fail(`camping_url is a generic homepage — needs a park-specific path: ${park.camping_url}`)
    if (!r.protected && !r.healthy) {
      fail(`camping_url unreachable: ${label}`)
    } else if (!isGeneric) {
      pass(`camping_url: ${label}`)
    }
  }

  // 6. Florida State Parks URL format
  if (park.website?.includes('floridastateparks.org')) {
    if (park.website.includes('/index.php/')) {
      warn(`website uses legacy /index.php/ URL format: ${park.website}`)
    } else if (!park.website.includes('/parks-and-trails/')) {
      warn(
        `website uses old Florida State Parks URL format\n` +
        `      Current:  ${park.website}\n` +
        `      Expected: path should start with /parks-and-trails/`
      )
    }
  }

  // 7. Affiliate link checks
  if (hotels.length > 0) {
    const bookingHotels = hotels.filter(h => h.url?.includes('booking.com'))
    if (bookingHotels.length > 0) {
      const bad = bookingHotels.filter(h => !h.url.includes('aid=') || !h.url.includes('label='))
      if (bad.length > 0) {
        warn(`Hotels missing affiliate params (aid=, label=):\n${bad.map(h => `      - ${h.name}`).join('\n')}`)
      } else {
        pass(`Hotels: ${bookingHotels.length} checked, affiliate params intact`)
      }
    } else {
      pass(`Hotels: ${hotels.length} found (no Booking.com URLs to verify)`)
    }
  }

  if (experiences.length > 0) {
    const viatorExps = experiences.filter(e => e.href?.includes('viator.com'))
    if (viatorExps.length > 0) {
      const bad = viatorExps.filter(e => !e.href.includes('pid=P00300517') || !e.href.includes('mcid=42383'))
      if (bad.length > 0) {
        warn(`Experiences missing affiliate params:\n${bad.map(e => `      - ${e.name}`).join('\n')}`)
      } else {
        pass(`Experiences: ${viatorExps.length} checked, affiliate params intact`)
      }
    } else {
      pass(`Experiences: ${experiences.length} found (no Viator URLs to verify)`)
    }
  }

  // 8. Coordinates sanity
  if (park.latitude != null && park.longitude != null) {
    const { latMin, latMax, lngMin, lngMax } = FLORIDA_BOUNDS
    const inFl = park.latitude >= latMin && park.latitude <= latMax
      && park.longitude >= lngMin && park.longitude <= lngMax
    if (!inFl) {
      fail(`Coordinates ${park.latitude}, ${park.longitude} are outside Florida bounds`)
    } else {
      pass(`Coordinates: ${park.latitude}, ${park.longitude} (within Florida)`)
    }
  }

  return {
    name: park.name,
    slug: park.slug,
    results,
    errorCount:   results.filter(r => r.type === 'fail').length,
    warningCount: results.filter(r => r.type === 'warn').length,
  }
}

// ─── Single-park mode ─────────────────────────────────────────────────────────

async function validateSingle(slug) {
  const { data: park, error } = await supabase
    .from('parks')
    .select(PARK_FIELDS)
    .eq('slug', slug)
    .single()

  if (error || !park) {
    console.error(`❌ No park found with slug: "${slug}"`)
    process.exit(1)
  }

  const [{ data: hotels }, { data: experiences }] = await Promise.all([
    supabase.from('park_hotels').select('id, name, url').eq('park_id', park.id).not('url', 'is', null),
    supabase.from('park_experiences').select('id, name, href').eq('park_id', park.id).not('href', 'is', null),
  ])

  const { results, errorCount, warningCount } = await runChecks(park, hotels ?? [], experiences ?? [])

  console.log(`\n${LINE}`)
  console.log(`DFP Park Validation — ${park.name}`)
  console.log(`Slug: ${park.slug}`)
  console.log(`${LINE}\n`)

  for (const r of results) {
    const sym = r.type === 'pass' ? '✅' : r.type === 'warn' ? '⚠️ ' : '❌'
    console.log(`${sym} ${r.msg}`)
  }

  console.log(`\n${LINE}`)
  if (errorCount > 0) {
    const e = `${errorCount} error${errorCount > 1 ? 's' : ''}`
    const w = warningCount > 0 ? `, ${warningCount} warning${warningCount > 1 ? 's' : ''}` : ''
    console.log(`RESULT: ❌ FAILED — ${e}${w}`)
    console.log('Fix the errors before this park goes live.')
  } else if (warningCount > 0) {
    console.log(`RESULT: ⚠️  PASSED WITH WARNINGS — ${warningCount} warning${warningCount > 1 ? 's' : ''}`)
  } else {
    console.log('RESULT: ✅ PASSED — Park is ready')
  }
  console.log(`${LINE}\n`)

  process.exit(errorCount > 0 ? 1 : warningCount > 0 ? 2 : 0)
}

// ─── All-parks mode ───────────────────────────────────────────────────────────

async function validateAll() {
  // Bulk-fetch everything upfront — 3 queries instead of N×3
  const [parksRes, hotelsRes, experiencesRes] = await Promise.all([
    supabase.from('parks').select(PARK_FIELDS).order('name'),
    supabase.from('park_hotels').select('park_id, id, name, url').not('url', 'is', null),
    supabase.from('park_experiences').select('park_id, id, name, href').not('href', 'is', null),
  ])

  if (parksRes.error) {
    console.error(`❌ Failed to fetch parks: ${parksRes.error.message}`)
    process.exit(1)
  }

  const parks = parksRes.data
  const total = parks.length

  // Group hotels and experiences by park_id for O(1) lookup
  const hotelsByPark = new Map()
  for (const h of hotelsRes.data ?? []) {
    if (!hotelsByPark.has(h.park_id)) hotelsByPark.set(h.park_id, [])
    hotelsByPark.get(h.park_id).push(h)
  }
  const expByPark = new Map()
  for (const e of experiencesRes.data ?? []) {
    if (!expByPark.has(e.park_id)) expByPark.set(e.park_id, [])
    expByPark.get(e.park_id).push(e)
  }

  console.log(`\n${LINE}`)
  console.log(`DFP Park Validation — All Parks (${total})`)
  console.log(`${LINE}\n`)

  // Process in batches of 5 to parallelize URL checks without hammering external sites
  const BATCH = 5
  const allResults = []

  for (let i = 0; i < parks.length; i += BATCH) {
    const batch = parks.slice(i, i + BATCH)
    process.stdout.write(`\rChecking parks... ${Math.min(i + BATCH, total)}/${total}`)
    const batchResults = await Promise.all(
      batch.map(p => runChecks(p, hotelsByPark.get(p.id) ?? [], expByPark.get(p.id) ?? []))
    )
    allResults.push(...batchResults)
  }
  process.stdout.write('\n\n')

  const withErrors   = allResults.filter(r => r.errorCount > 0)
  const withWarnings = allResults.filter(r => r.errorCount === 0 && r.warningCount > 0)
  const clean        = allResults.filter(r => r.errorCount === 0 && r.warningCount === 0)

  if (withErrors.length > 0) {
    console.log(`❌ ERRORS (${withErrors.length} park${withErrors.length > 1 ? 's' : ''})`)
    for (const r of withErrors) {
      console.log(`\n  ${r.name}  [${r.slug}]`)
      for (const item of r.results.filter(x => x.type === 'fail')) {
        console.log(`    ❌ ${item.msg}`)
      }
    }
    console.log()
  }

  if (withWarnings.length > 0) {
    console.log(`⚠️  WARNINGS (${withWarnings.length} park${withWarnings.length > 1 ? 's' : ''})`)
    for (const r of withWarnings) {
      console.log(`\n  ${r.name}  [${r.slug}]`)
      for (const item of r.results.filter(x => x.type === 'warn')) {
        console.log(`    ⚠️  ${item.msg}`)
      }
    }
    console.log()
  }

  if (withErrors.length === 0 && withWarnings.length === 0) {
    console.log('✅ All parks passed with no issues.\n')
  }

  const totalErrors   = allResults.reduce((s, r) => s + r.errorCount, 0)
  const totalWarnings = allResults.reduce((s, r) => s + r.warningCount, 0)

  console.log(LINE)
  const parts = [`${total} parks checked`]
  if (totalErrors   > 0) parts.push(`${totalErrors} error${totalErrors > 1 ? 's' : ''}`)
  if (totalWarnings > 0) parts.push(`${totalWarnings} warning${totalWarnings > 1 ? 's' : ''}`)
  parts.push(`${clean.length} clean ✅`)
  console.log(`SUMMARY: ${parts.join(' — ')}`)
  console.log(`${LINE}\n`)

  process.exit(totalErrors > 0 ? 1 : totalWarnings > 0 ? 2 : 0)
}

// ─── Entry point ──────────────────────────────────────────────────────────────

const arg = process.argv[2]

if (arg === '--all') {
  validateAll().catch(err => { console.error('Unexpected error:', err.message); process.exit(1) })
} else if (arg) {
  validateSingle(arg).catch(err => { console.error('Unexpected error:', err.message); process.exit(1) })
} else {
  console.error('Usage:')
  console.error('  node validate-park.js <slug>   — validate one park')
  console.error('  node validate-park.js --all    — validate every park')
  process.exit(1)
}
