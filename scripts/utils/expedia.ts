/**
 * Builds Expedia hotel search URLs wrapped in the CJ affiliate click tracker.
 *
 * Set EXPEDIA_CJ_BASE_URL in .env.local (and Vercel env vars) to enable tracking:
 *   EXPEDIA_CJ_BASE_URL=https://www.dpbolvw.net/click-101752120-14078545
 *
 * Falls back to a plain (untracked) Expedia URL when the env var is absent.
 */

const CJ_BASE = process.env.EXPEDIA_CJ_BASE_URL;

function cjDeeplink(expediaUrl: string): string {
  if (CJ_BASE) return `${CJ_BASE}?url=${encodeURIComponent(expediaUrl)}`;
  return expediaUrl;
}

/** Deeplink to an Expedia hotel-search page scoped to a specific hotel name + vicinity. */
export function buildExpediaHotelUrl(hotelName: string, vicinity: string): string {
  const destination = encodeURIComponent(`${hotelName} ${vicinity}`);
  return cjDeeplink(`https://www.expedia.com/Hotel-Search?destination=${destination}`);
}

/** Deeplink to an Expedia hotel-search page scoped to a city (used as CTA fallback). */
export function buildExpediaCityUrl(city: string): string {
  const destination = encodeURIComponent(`${city} FL`);
  return cjDeeplink(`https://www.expedia.com/Hotel-Search?destination=${destination}`);
}
