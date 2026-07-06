import { NextRequest, NextResponse } from 'next/server';

// Returns up to 5 Google Places reviews for a given place_id.
// Usage: /api/hotel-reviews?placeId={place_id}
// Response is intentionally not cached — reviews should always be fresh.
//
// COST NOTE: each call is a billable Google Places "Place Details" request.
// It is user-initiated (reviews modal) and cached 5 min, but rate-limited and
// timed out here so bots can't run up the bill or hang the function.

export const runtime = 'nodejs';
export const maxDuration = 10;

const FETCH_TIMEOUT_MS = 6000;

// In-memory rate limiter: max 30 review requests per IP per minute.
const rateLimitMap = new Map<string, number[]>();
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const window = 60 * 1000;
  const attempts = (rateLimitMap.get(ip) ?? []).filter(t => now - t < window);
  if (attempts.length >= 30) return false;
  rateLimitMap.set(ip, [...attempts, now]);
  return true;
}

export interface PlaceReview {
  authorName: string;
  authorPhotoUrl: string | null;
  rating: number;
  text: string;
  relativeTime: string;
}

export async function GET(req: NextRequest) {
  const placeId = req.nextUrl.searchParams.get('placeId');
  if (!placeId) {
    return NextResponse.json({ error: 'Missing placeId' }, { status: 400 });
  }

  const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || '127.0.0.1';
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
  }

  const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?languageCode=en`;

  let res: Response;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    res = await fetch(url, {
      headers: {
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'reviews,displayName',
      },
      // No caching — reviews are fetched on user demand
      cache: 'no-store',
      signal: controller.signal,
    });
  } catch (err) {
    console.error('hotel-reviews error:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Upstream error' }, { status: 502 });
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    return NextResponse.json({ error: 'Places API error' }, { status: 502 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await res.json() as any;
  const raw: any[] = data.reviews ?? []; // eslint-disable-line @typescript-eslint/no-explicit-any

  const reviews: PlaceReview[] = raw.slice(0, 5).map(r => ({
    authorName: r.authorAttribution?.displayName ?? 'Google User',
    authorPhotoUrl: r.authorAttribution?.photoUri ?? null,
    rating: r.rating ?? 0,
    text: r.text?.text ?? '',
    relativeTime: r.relativePublishTimeDescription ?? '',
  }));

  return NextResponse.json(
    { reviews, placeName: data.displayName?.text ?? null },
    {
      headers: {
        // Cache reviews at the edge for 6h — they change rarely, and this collapses
        // repeat views of the same hotel into ONE billable Place Details call
        // (reviews are Google's most expensive SKU). Still "temporary" per Google's
        // caching guidance; served stale for a day while revalidating.
        'Cache-Control': 'public, max-age=21600, s-maxage=21600, stale-while-revalidate=86400',
      },
    }
  );
}
