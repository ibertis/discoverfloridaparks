const RURAL_CITIES = new Set([
  'Holt', 'Sneads', 'Ponce de Leon', 'Keystone Heights', 'Fort White',
  'High Springs', 'Wimauma', 'Copeland', 'Ochopee', 'Layton', 'Micanopy',
  'Thonotosassa', 'Tierra Verde', 'Niceville', 'Chiefland', 'Chipley',
  'Ponce De Leon', 'Live Oak', 'White Springs',
])

export const MAX_FALLBACK_RADIUS = 50000  // 50km cap for radius-expansion retries

export function getSearchRadius(city: string | null): number {
  if (city && RURAL_CITIES.has(city)) return 25000
  return 12000
}

export function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number,
): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
