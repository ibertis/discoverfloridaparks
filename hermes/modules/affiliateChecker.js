// modules/affiliateChecker.js — Verify affiliate links are healthy
// Checks Booking.com, Viator, and Amazon affiliate links
// Validates URLs resolve correctly AND affiliate parameters are intact

import fetch from 'node-fetch'
import { createClient } from '@supabase/supabase-js'
import { config } from '../config.js'
import { logger } from './logger.js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

const AFFILIATE_SIGNATURES = {
  viator: ['pid=P00300517', 'mcid=42383'],
  booking: ['aid=', 'label='],
  amazon: ['tag='],
}

async function fetchAffiliateURLs() {
  const urls = []

  const { data: experiences, error: expError } = await supabase
    .from('experiences')
    .select('id, name, affiliate_url, affiliate_source')
    .eq('affiliate_source', 'viator')
    .not('affiliate_url', 'is', null)

  if (expError) {
    logger.warn(`Could not fetch Viator experiences: ${expError.message}`)
  } else {
    for (const exp of experiences) {
      urls.push({ id: exp.id, name: exp.name, url: exp.affiliate_url, program: 'viator', source: 'experiences' })
    }
  }

  const { data: parkExperiences, error: peError } = await supabase
    .from('park_experiences')
    .select('id, name, href')
    .not('href', 'is', null)
    .ilike('href', '%viator.com%')

  if (peError) {
    logger.warn(`Could not fetch park_experiences: ${peError.message}`)
  } else {
    for (const pe of parkExperiences) {
      urls.push({ id: pe.id, name: pe.name, url: pe.href, program: 'viator', source: 'park_experiences' })
    }
  }

  const { data: hotels, error: hotelError } = await supabase
    .from('park_hotels')
    .select('id, name, url')
    .not('url', 'is', null)
    .ilike('url', '%booking.com%')

  if (hotelError) {
    logger.warn(`Could not fetch Booking.com hotels: ${hotelError.message}`)
  } else {
    for (const hotel of hotels) {
      urls.push({ id: hotel.id, name: hotel.name, url: hotel.url, program: 'booking', source: 'park_hotels' })
    }
  }

  logger.info(`Found ${urls.length} affiliate URLs to check (Viator + Booking.com)`)
  return urls
}

async function checkAffiliateURL(entry) {
  const { name, url, program } = entry

  // Check bot-protected domains — skip HTTP check but still verify affiliate params
  const hostname = new URL(url).hostname.replace('www.', '')
  const isProtected = config.checker.botProtectedDomains.some(d => hostname.endsWith(d))

  if (isProtected) {
    const signatures = AFFILIATE_SIGNATURES[program] || []
    const missingParams = signatures.filter(param => !url.includes(param))
    const paramsHealthy = missingParams.length === 0
    return { ...entry, status: 'skipped', healthy: paramsHealthy, httpHealthy: true, paramsHealthy, missingParams, error: null, finalUrl: url }
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 12000)

  try {
    const res = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      redirect: 'follow',
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36' },
    })

    clearTimeout(timeout)
    const httpHealthy = [200, 201, 301, 302, 307, 308].includes(res.status)
    const signatures = AFFILIATE_SIGNATURES[program] || []
    const missingParams = signatures.filter(param => !url.includes(param))
    const paramsHealthy = missingParams.length === 0
    const healthy = httpHealthy && paramsHealthy

    return { ...entry, status: res.status, healthy, httpHealthy, paramsHealthy, missingParams, error: null, finalUrl: res.url }

  } catch (err) {
    clearTimeout(timeout)
    return { ...entry, status: null, healthy: false, httpHealthy: false, paramsHealthy: false, missingParams: [], error: err.name === 'AbortError' ? 'Timeout' : err.message, finalUrl: null }
  }
}

export async function checkAffiliateLinks() {
  const urls = await fetchAffiliateURLs()

  if (urls.length === 0) {
    logger.warn('No affiliate URLs found to check')
    return { healthy: [], failed: [], total: 0 }
  }

  const results = []
  const chunks = chunkArray(urls, 5)

  for (const chunk of chunks) {
    const chunkResults = await Promise.all(chunk.map(entry => checkAffiliateURL(entry)))
    results.push(...chunkResults)
    logger.info(`Affiliate check: ${results.length}/${urls.length}`)
  }

  const healthy = results.filter(r => r.healthy)
  const failed = results.filter(r => !r.healthy)

  for (const f of failed) {
    if (!f.httpHealthy) logger.warn(`AFFILIATE FAILED: ${f.program.toUpperCase()} | ${f.name} | HTTP ${f.status ?? f.error}`)
    if (!f.paramsHealthy) logger.warn(`AFFILIATE PARAMS MISSING: ${f.program.toUpperCase()} | ${f.name} | Missing: ${f.missingParams.join(', ')}`)
  }

  return { healthy, failed, total: urls.length }
}

function chunkArray(arr, size) {
  const chunks = []
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size))
  return chunks
}