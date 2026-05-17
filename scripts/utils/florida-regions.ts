/**
 * florida-regions.ts
 *
 * Maps a lat/lng coordinate to one or more Florida region strings matching
 * the park_regions values used throughout the app.
 *
 * Regions (in priority order — more specific checked first):
 *   Florida Keys | South Florida | Southeast Florida | Southwest Florida |
 *   Tampa Bay & West Coast | Central Florida | Northeast Florida |
 *   North Florida | Florida Panhandle
 */

interface RegionBounds {
  name: string
  minLat: number
  maxLat: number
  minLng: number
  maxLng: number
}

// Ordered from most specific/southern to most general/northern.
// A coordinate can match multiple regions (e.g. a park on the west-central border).
const REGION_BOUNDS: RegionBounds[] = [
  { name: 'Florida Keys',           minLat: 24.4,  maxLat: 25.35, minLng: -82.1,  maxLng: -79.8 },
  { name: 'South Florida',          minLat: 25.1,  maxLat: 26.5,  minLng: -82.0,  maxLng: -80.0 },
  { name: 'Southeast Florida',      minLat: 25.7,  maxLat: 27.6,  minLng: -81.2,  maxLng: -79.9 },
  { name: 'Southwest Florida',      minLat: 25.7,  maxLat: 27.4,  minLng: -82.6,  maxLng: -81.0 },
  { name: 'Tampa Bay & West Coast', minLat: 27.0,  maxLat: 29.3,  minLng: -83.2,  maxLng: -81.8 },
  { name: 'Central Florida',        minLat: 27.5,  maxLat: 29.5,  minLng: -82.6,  maxLng: -80.5 },
  { name: 'Northeast Florida',      minLat: 29.0,  maxLat: 31.0,  minLng: -82.6,  maxLng: -80.4 },
  { name: 'North Florida',          minLat: 29.0,  maxLat: 31.0,  minLng: -85.5,  maxLng: -82.6 },
  { name: 'Florida Panhandle',      minLat: 29.5,  maxLat: 31.1,  minLng: -87.7,  maxLng: -85.5 },
]

/**
 * Returns the region(s) a coordinate falls in.
 * Returns the single best match in most cases; may return 2 for border parks.
 */
export function getRegionsForCoords(lat: number, lng: number): string[] {
  const matches = REGION_BOUNDS.filter(
    r => lat >= r.minLat && lat <= r.maxLat && lng >= r.minLng && lng <= r.maxLng
  )

  if (matches.length === 0) return []

  // If only one match or the first two are geographically adjacent, return both.
  // Otherwise return just the most specific (first) match.
  if (matches.length === 1) return [matches[0].name]

  // Return up to 2 regions — handles parks genuinely on a regional border
  return matches.slice(0, 2).map(r => r.name)
}

/**
 * Infers the managing agency from park_types and slug.
 */
export function getManagingAgency(parkTypes: string[] | null, slug: string): string | null {
  const types = parkTypes ?? []

  if (types.includes('National Parks'))              return 'National Park Service (NPS)'
  if (types.includes('National Wildlife Refuge'))    return 'U.S. Fish & Wildlife Service (USFWS)'
  if (types.includes('State Parks'))                return 'Florida State Parks (DEP)'
  if (types.includes('State Forest'))               return 'Florida Forest Service'
  if (types.includes('Wildlife Management Area'))   return 'Florida Fish and Wildlife Conservation Commission (FWC)'
  if (types.includes('County Parks'))               return 'County Parks & Recreation'
  if (types.includes('Community Parks'))            return 'City / Municipal'

  // Infer from slug keywords when type alone isn't enough
  if (/wildlife.management.area/.test(slug))        return 'Florida Fish and Wildlife Conservation Commission (FWC)'
  if (/conservation.area/.test(slug))               return 'Water Management District'
  if (/wildlife.and.environmental.area/.test(slug)) return 'Florida Fish and Wildlife Conservation Commission (FWC)'
  if (/state.forest/.test(slug))                    return 'Florida Forest Service'
  if (/national.forest/.test(slug))                 return 'U.S. Forest Service (USFS)'

  return null
}
