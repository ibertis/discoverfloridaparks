import { NextRequest, NextResponse } from 'next/server';

// Proxies hotel photos to avoid exposing the Google API key client-side.
//
// Supports two modes based on the `ref` query param:
//   1. Google Places reference (starts with "places/"):
//        /api/hotel-photo?ref=places%2F{placeId}%2Fphotos%2F{photoId}
//        Uses skipHttpRedirect=true to get the CDN URI, then streams the image.
//   2. Direct HTTPS URL (user-provided / Supabase Storage):
//        /api/hotel-photo?ref=https%3A%2F%2F...
//        Fetches the URL directly and streams the image.
//
// COST NOTE: mode 1 makes a *billable* Google Places "Place Photo (New)" call.
// Hotels enriched after the storage backfill store an https:// Supabase URL and
// bypass this route entirely (see src/app/parks/[slug]/page.tsx). This route is
// now a hardened fallback: rate-limited, timed out, and negative-cached so stale
// refs and bot crawls can't run up the Google bill or hang the function.

export const runtime = 'nodejs';
export const maxDuration = 10;

const CACHE = 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=3600';
const FETCH_TIMEOUT_MS = 6000;

// In-memory rate limiter: max 60 image requests per IP per minute.
// (A single park page loads at most ~3 hotel photos, so this only bites bots.)
const rateLimitMap = new Map<string, number[]>();
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const window = 60 * 1000;
  const attempts = (rateLimitMap.get(ip) ?? []).filter(t => now - t < window);
  if (attempts.length >= 60) return false;
  rateLimitMap.set(ip, [...attempts, now]);
  return true;
}

// Negative cache: remember refs that just failed so we don't re-hit Google (and
// re-pay) for the same broken photo on every retry within the window.
const failedRefs = new Map<string, number>();
const NEGATIVE_TTL_MS = 10 * 60 * 1000;
function isRecentlyFailed(ref: string): boolean {
  const at = failedRefs.get(ref);
  if (at && Date.now() - at < NEGATIVE_TTL_MS) return true;
  if (at) failedRefs.delete(ref);
  return false;
}
function markFailed(ref: string) {
  failedRefs.set(ref, Date.now());
  // Bound memory: drop oldest entries if the map grows too large.
  if (failedRefs.size > 1000) {
    const oldest = [...failedRefs.entries()].sort((a, b) => a[1] - b[1]).slice(0, 200);
    for (const [k] of oldest) failedRefs.delete(k);
  }
}

async function timedFetch(url: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function streamUrl(url: string): Promise<NextResponse> {
  const res = await timedFetch(url);
  if (!res.ok) return new NextResponse('Image fetch failed', { status: 502 });
  const buffer = await res.arrayBuffer();
  const contentType = res.headers.get('content-type') ?? 'image/jpeg';
  return new NextResponse(buffer, { status: 200, headers: { 'Content-Type': contentType, 'Cache-Control': CACHE } });
}

export async function GET(req: NextRequest) {
  const ref = req.nextUrl.searchParams.get('ref');
  if (!ref) {
    return new NextResponse('Missing ref', { status: 400 });
  }

  const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || '127.0.0.1';
  if (!checkRateLimit(ip)) {
    return new NextResponse('Too many requests', { status: 429 });
  }

  // Skip refs that failed recently — avoids re-billing Google for known-bad photos.
  if (isRecentlyFailed(ref)) {
    return new NextResponse('Image unavailable', { status: 502 });
  }

  try {
    // Direct URL (user-provided photo stored in Supabase Storage or elsewhere)
    if (ref.startsWith('https://')) {
      const out = await streamUrl(ref);
      if (out.status === 502) markFailed(ref);
      return out;
    }

    // Only allow Places photo references — never let this route fetch arbitrary schemes.
    if (!ref.startsWith('places/')) {
      return new NextResponse('Invalid ref', { status: 400 });
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      return new NextResponse('GOOGLE_PLACES_API_KEY not configured', { status: 500 });
    }

    // Step 1: ask Google for the CDN URI (no redirect) — this is the billable call.
    const metaUrl = `https://places.googleapis.com/v1/${ref}/media?maxWidthPx=600&skipHttpRedirect=true`;
    const metaRes = await timedFetch(metaUrl, { headers: { 'X-Goog-Api-Key': apiKey } });

    if (!metaRes.ok) {
      markFailed(ref);
      return new NextResponse(`Places API error ${metaRes.status}`, { status: 502 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const meta = await metaRes.json() as any;
    const photoUri: string | undefined = meta.photoUri;

    if (!photoUri) {
      markFailed(ref);
      return new NextResponse('No photoUri in Places response', { status: 502 });
    }

    // Step 2: fetch the actual image from the CDN URI and stream it.
    const out = await streamUrl(photoUri);
    if (out.status === 502) markFailed(ref);
    return out;
  } catch (err) {
    // Timeout / network error — negative-cache so a hung upstream can't hammer us.
    markFailed(ref);
    console.error('hotel-photo error:', err instanceof Error ? err.message : err);
    return new NextResponse('Upstream error', { status: 502 });
  }
}
