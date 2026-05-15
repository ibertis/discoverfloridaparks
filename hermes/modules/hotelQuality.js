// modules/hotelQuality.js — Scan park_hotels for clearly non-hotel entries
// Report-only: flags junk for manual review, does not auto-delete.
// REMOVE bucket = airboat tours, visitor centres, government camps, cave dive camps, etc.
// If this fires, something slipped past the isLikelyHotel() filter in fix-hotels-bulk.ts.

import { createClient } from '@supabase/supabase-js'
import { logger } from './logger.js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)

// Mirrors the CLEAR_REMOVE pattern in scripts/audit-hotels.ts
const REMOVE_PATTERN = /\b(airboat|canoe|kayak|outfitter|outfitters|visitor cent(?:er|re)|chamber of commerce|fish camp(?! & rv| resort)|rides?\b|guided tour|boat tour|nature tour|wildlife tour|group camp\b|scout(?:s)? (lodge|camp)|bsa\b|(?:primitive|backcountry) camp(?:site|ground)?$|cave dive camp|tcas camping|swfwmd|water management district)\b/i

// Hotel brands that are always safe regardless of name content
const HOTEL_BRAND = /\b(hotel|inn|motel|suites?|hilton|marriott|hyatt|westin|sheraton|hampton|holiday inn|best western|comfort inn|quality inn|days inn|super 8|ramada|wyndham|radisson|ihg|doubletree|courtyard|residence inn|fairfield|springhill|homewood|embassy suites|renaissance|four seasons|ritz|intercontinental|omni|autograph|kimpton|aloft|element|moxy|ac hotel)\b/i

export async function checkHotelQuality() {
  const { data: hotels, error } = await supabase
    .from('park_hotels')
    .select('id, name, park_id, parks(name, slug)')

  if (error) throw new Error(`Hotel quality query failed: ${error.message}`)

  const junk = (hotels || []).filter(h => {
    if (HOTEL_BRAND.test(h.name)) return false   // definitely a hotel
    return REMOVE_PATTERN.test(h.name)
  })

  if (junk.length === 0) {
    logger.info('Hotel quality: all entries look clean')
  } else {
    logger.warn(`Hotel quality: ${junk.length} suspect entry/entries detected`)
  }

  return {
    detected: junk.length,
    entries: junk.map(h => ({
      id: h.id,
      name: h.name,
      park: h.parks?.slug ?? h.park_id,
      parkName: h.parks?.name ?? h.park_id,
    })),
  }
}

export function buildHotelQualitySection(result) {
  if (result.detected === 0) return ''

  const lines = [
    `⚠️  Hotel Quality — Junk Entries Detected (${result.detected})`,
    `  These entries matched non-hotel patterns and should be deleted manually`,
    `  (run: npx tsx scripts/audit-hotels.ts --delete-remove from the project root)`,
    '',
    ...result.entries.map(e => `  ✕  ${e.name}  ↳  ${e.park}`),
  ]
  return lines.join('\n')
}
