// modules/checker.js — HTTP health check for each URL
import fetch from 'node-fetch'
import { config } from '../config.js'
import { logger } from './logger.js'

async function checkURL(entry, attempt = 1) {
  const { parkName, slug, url, type } = entry

  // Skip bot-protected domains — confirmed working, just block automated checks
  const hostname = new URL(url).hostname.replace('www.', '')
  const isProtected = config.checker.botProtectedDomains
    .some(d => hostname.endsWith(d))

  if (isProtected) {
    return { parkName, slug, url, type, status: 'skipped', healthy: true, error: null }
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), config.checker.timeoutMs)

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
    const healthy = config.checker.healthyCodes.includes(res.status)

    return { parkName, slug, url, type, status: res.status, healthy, error: null }

  } catch (err) {
    clearTimeout(timeout)

    if (attempt < config.checker.retries) {
      logger.warn(`Retrying ${url} (attempt ${attempt + 1})`)
      await sleep(1500)
      return checkURL(entry, attempt + 1)
    }

    return {
      parkName, slug, url, type,
      status: null,
      healthy: false,
      error: err.name === 'AbortError' ? 'Timeout' : err.message,
    }
  }
}

export async function checkAllURLs(urls) {
  const results = []
  const chunks = chunkArray(urls, config.checker.concurrency)

  for (const chunk of chunks) {
    const chunkResults = await Promise.all(chunk.map(entry => checkURL(entry)))
    results.push(...chunkResults)
    logger.info(`Checked ${results.length}/${urls.length} URLs`)
  }

  return {
    healthy: results.filter(r => r.healthy),
    failed: results.filter(r => !r.healthy),
  }
}

function chunkArray(arr, size) {
  const chunks = []
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size))
  }
  return chunks
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}