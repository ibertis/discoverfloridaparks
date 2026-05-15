// modules/feeVerified.js — Persist fee verification state to suppress repeat manual reviews
//
// Keyed by slug. Schema per entry:
//   { hash: string, verifiedAt: ISO string, fee: string }
//
// TTL:  90 days for paid fees  |  180 days for free parks
// Hash: SHA-256(fee.trim().toLowerCase()), first 12 hex chars

import { createHash } from 'crypto'
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { logger } from './logger.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const STORE_PATH = path.resolve(__dirname, '../data/fee-verified.json')

const TTL_FREE_DAYS = 180
const TTL_PAID_DAYS = 90

// ── Helpers ───────────────────────────────────────────────────────────────────

export function feeHash(fee) {
  return createHash('sha256')
    .update((fee ?? '').trim().toLowerCase())
    .digest('hex')
    .slice(0, 12)
}

function ttlDays(fee) {
  return (fee ?? '').trim().toLowerCase() === 'free' ? TTL_FREE_DAYS : TTL_PAID_DAYS
}

// ── Store I/O ─────────────────────────────────────────────────────────────────

export function loadStore() {
  try {
    return JSON.parse(readFileSync(STORE_PATH, 'utf8'))
  } catch {
    return {}
  }
}

export function saveStore(store) {
  mkdirSync(path.dirname(STORE_PATH), { recursive: true })
  writeFileSync(STORE_PATH, JSON.stringify(store, null, 2) + '\n', 'utf8')
}

// ── Suppression check ─────────────────────────────────────────────────────────

export function isSuppressed(store, slug, currentFee, force) {
  if (force) return false
  const entry = store[slug]
  if (!entry) return false
  if (entry.hash !== feeHash(currentFee)) return false
  const ageDays = (Date.now() - new Date(entry.verifiedAt).getTime()) / (1000 * 60 * 60 * 24)
  return ageDays < ttlDays(currentFee)
}

// ── Write verification for a list of parks ────────────────────────────────────

export function verifyParks(parks) {
  const store = loadStore()
  const now = new Date().toISOString()
  for (const park of parks) {
    store[park.slug] = {
      hash: feeHash(park.entrance_fee),
      verifiedAt: now,
      fee: park.entrance_fee,
    }
  }
  saveStore(store)
  logger.info(`Fee verification saved: ${parks.length} park(s) stamped`)
  return store
}

// ── Earliest expiry across a set of parks ────────────────────────────────────

export function earliestExpiry(store, parks) {
  let earliest = null
  for (const park of parks) {
    const entry = store[park.slug]
    if (!entry) continue
    const ttl = ttlDays(park.entrance_fee)
    const expiresAt = new Date(new Date(entry.verifiedAt).getTime() + ttl * 24 * 60 * 60 * 1000)
    if (!earliest || expiresAt < earliest) earliest = expiresAt
  }
  return earliest
}
