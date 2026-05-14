// modules/gearLinks.js — Verify all gear recommendation URLs are accessible
// Checks REI category pages + Amazon search links from src/lib/gear.ts
// URL list is hardcoded here (Hermes is plain JS — cannot import TypeScript)

import fetch from 'node-fetch'
import { logger } from './logger.js'

// ── Gear URL list (mirrors src/lib/gear.ts — keep in sync when gear.ts changes) ─

const GEAR_URLS = [
  // ── Universal (Florida Essentials) ────────────────────────────────────────
  { name: 'Sunscreen SPF 50+',              url: 'https://www.rei.com/c/sunscreen' },
  { name: 'Insect Repellent',               url: 'https://www.rei.com/c/insect-repellent' },
  { name: 'Insulated Water Bottle',         url: 'https://www.rei.com/c/water-bottles' },
  { name: 'Lightweight Rain Jacket',        url: 'https://www.rei.com/c/rain-jackets' },
  { name: 'Polarized Sunglasses',           url: 'https://www.rei.com/c/sunglasses' },
  // ── Camping ───────────────────────────────────────────────────────────────
  { name: '2-Person Camping Tent',          url: 'https://www.rei.com/c/tents' },
  { name: 'Sleeping Bag (40°F rated)',      url: 'https://www.rei.com/c/sleeping-bags' },
  { name: 'Sleeping Pad',                   url: 'https://www.rei.com/c/sleeping-pads' },
  { name: 'Camp Stove',                     url: 'https://www.rei.com/c/camp-stoves' },
  { name: 'Headlamp',                       url: 'https://www.rei.com/c/headlamps' },
  // ── Hiking ────────────────────────────────────────────────────────────────
  { name: 'Trail Shoes or Hiking Boots',    url: 'https://www.rei.com/c/hiking-footwear' },
  { name: 'Hydration Pack',                 url: 'https://www.rei.com/c/hydration-packs' },
  { name: 'Trekking Poles',                 url: 'https://www.rei.com/c/trekking-poles' },
  { name: 'Trail GPS',                      url: 'https://www.rei.com/c/gps-devices' },
  // ── Paddling ──────────────────────────────────────────────────────────────
  { name: 'Kayak Paddle',                   url: 'https://www.rei.com/c/kayak-paddles' },
  { name: 'Life Jacket (PFD)',              url: 'https://www.rei.com/c/pfds' },
  { name: 'Dry Bag',                        url: 'https://www.rei.com/c/dry-bags' },
  { name: 'Waterproof Phone Case',          url: 'https://www.rei.com/c/waterproof-cases' },
  // ── Swimming & Snorkeling ─────────────────────────────────────────────────
  { name: 'Snorkel Mask Set',               url: 'https://www.amazon.com/s?k=snorkel+mask+set+anti-fog+wide+view&tag=discoverflo00-20' },
  { name: 'Water Shoes',                    url: 'https://www.rei.com/c/water-shoes' },
  { name: 'Rash Guard',                     url: 'https://www.rei.com/c/rashguards' },
  { name: 'Swim Fins',                      url: 'https://www.amazon.com/s?k=swim+fins+snorkeling+Florida+springs&tag=discoverflo00-20' },
  // ── Fishing ───────────────────────────────────────────────────────────────
  { name: 'Spinning Rod & Reel Combo',      url: 'https://www.amazon.com/s?k=spinning+rod+reel+combo+freshwater+saltwater&tag=discoverflo00-20' },
  { name: 'Tackle & Lure Set',              url: 'https://www.amazon.com/s?k=fishing+tackle+lure+set+bass+snook&tag=discoverflo00-20' },
  { name: 'Polarized Fishing Sunglasses',   url: 'https://www.amazon.com/s?k=polarized+fishing+sunglasses&tag=discoverflo00-20' },
  { name: 'Cooler / Fish Bag',              url: 'https://www.amazon.com/s?k=fishing+cooler+insulated+bag&tag=discoverflo00-20' },
  // ── Biking ────────────────────────────────────────────────────────────────
  { name: 'Bike Helmet',                    url: 'https://www.rei.com/c/bike-helmets' },
  { name: 'Cycling Gloves',                 url: 'https://www.rei.com/c/cycling-gloves' },
  { name: 'Bike Water Bottle & Cage',       url: 'https://www.rei.com/c/bike-water-bottles' },
  { name: 'Bike Repair Kit',                url: 'https://www.rei.com/c/bike-tools' },
  // ── Wildlife & Birding ────────────────────────────────────────────────────
  { name: 'Binoculars',                     url: 'https://www.rei.com/c/binoculars' },
  { name: 'Field Guide: Florida',           url: 'https://www.rei.com/c/southeast-hiking-guidebooks?ir=category%3Acamping-and-hiking-guidebooks&r=category%3Acamping-and-hiking-guidebooks%7Csoutheast-hiking-guidebooks%3Bstate-province%3AFlorida' },
  { name: 'Action Camera',                  url: 'https://www.rei.com/c/action-cameras' },
  { name: 'Quick-Dry Hiking Pants',         url: 'https://www.rei.com/c/mens-hiking-pants' },
  // ── Beach ─────────────────────────────────────────────────────────────────
  { name: 'Beach Umbrella & Shelter',       url: 'https://www.amazon.com/s?k=beach+umbrella+UPF+50+sand+anchor+Florida&tag=discoverflo00-20' },
  { name: 'Packable Beach Chair',           url: 'https://www.rei.com/c/camp-chairs' },
  // ── Boating ───────────────────────────────────────────────────────────────
  { name: 'Marine Cooler',                  url: 'https://www.rei.com/c/coolers' },
  // ── Dog ──────────────────────────────────────────────────────────────────
  { name: 'Dog Harness',                    url: 'https://www.rei.com/c/dog-harnesses' },
  { name: 'Dog Leash',                      url: 'https://www.rei.com/c/dog-leashes' },
  { name: 'Dog Life Jacket',                url: 'https://www.rei.com/c/dog-pfds' },
  { name: 'Dog Gear & Accessories',         url: 'https://www.rei.com/c/dog-gear' },
  // ── Equestrian (Amazon) ───────────────────────────────────────────────────
  { name: 'Riding Helmet',                  url: 'https://www.amazon.com/s?k=equestrian+riding+helmet+ASTM+certified&tag=discoverflo00-20' },
  { name: 'Riding Gloves',                  url: 'https://www.amazon.com/s?k=equestrian+riding+gloves&tag=discoverflo00-20' },
  { name: 'Tall Riding Boots',              url: 'https://www.amazon.com/s?k=tall+equestrian+riding+boots+trail&tag=discoverflo00-20' },
  { name: 'Saddle Bag / Cantle Pack',       url: 'https://www.amazon.com/s?k=horse+saddle+cantle+bag+trail+riding&tag=discoverflo00-20' },
  // ── Hunting (Amazon) ──────────────────────────────────────────────────────
  { name: 'Blaze Orange Vest',              url: 'https://www.amazon.com/s?k=blaze+orange+hunting+vest+safety&tag=discoverflo00-20' },
  { name: 'Waterproof Hunting Boots',       url: 'https://www.amazon.com/s?k=waterproof+hunting+boots+Florida&tag=discoverflo00-20' },
  { name: 'Hunting Binoculars',             url: 'https://www.amazon.com/s?k=hunting+binoculars+10x42&tag=discoverflo00-20' },
  { name: 'Field Dressing Kit',             url: 'https://www.amazon.com/s?k=field+dressing+kit+hunting&tag=discoverflo00-20' },
]

// Deduplicate by URL (some URLs appear in multiple categories — only check once)
const UNIQUE_GEAR_URLS = [...new Map(GEAR_URLS.map(i => [i.url, i])).values()]

// ── Check function ────────────────────────────────────────────────────────────

export async function checkGearLinks() {
  logger.info(`Gear links: checking ${UNIQUE_GEAR_URLS.length} unique URLs`)

  const chunks = chunkArray(UNIQUE_GEAR_URLS, 5)
  const results = []

  for (const chunk of chunks) {
    const chunkResults = await Promise.all(
      chunk.map(async ({ name, url }) => {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 10000)
        try {
          const res = await fetch(url, {
            method: 'GET',
            redirect: 'follow',
            signal: controller.signal,
            headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36' },
          })
          clearTimeout(timeout)
          // Only 404 is a real failure — REI/Amazon block automated requests
          // with 403/429/503/ECONNRESET, which is not actionable. A 404 means
          // the URL slug has changed and gear.ts needs updating.
          const ok = res.status !== 404
          return { name, url, status: res.status, ok }
        } catch (err) {
          clearTimeout(timeout)
          // Network errors (ECONNRESET, abort) = bot-blocked, not actionable
          return { name, url, status: null, ok: true, skipped: true, error: err.name === 'AbortError' ? 'Timeout' : err.message }
        }
      })
    )
    results.push(...chunkResults)
    logger.info(`Gear links: ${results.length}/${UNIQUE_GEAR_URLS.length}`)
    if (results.length < UNIQUE_GEAR_URLS.length) {
      await new Promise(r => setTimeout(r, 500))
    }
  }

  const failures = results.filter(r => !r.ok)

  for (const f of failures) {
    logger.warn(`GEAR LINK 404: ${f.name} | ${f.url}`)
  }

  return {
    passed: results.filter(r => r.ok).length,
    failed: failures.length,
    total: results.length,
    failures,
  }
}

// ── Email section builder ─────────────────────────────────────────────────────

export function buildGearLinksSection(result) {
  if (result.failed === 0) return ''

  const lines = [
    `⚠️ Gear Links — ${result.failed} 404(s) detected`,
    '',
    ...result.failures.map(f => `  ${f.name}\n  ${f.url}`),
    '',
    'Action required: update src/lib/gear.ts with the correct URL slug.',
  ]
  return lines.join('\n')
}

// ── Shared utility ────────────────────────────────────────────────────────────

function chunkArray(arr, size) {
  const chunks = []
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size))
  return chunks
}
