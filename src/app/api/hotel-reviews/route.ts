import { NextRequest, NextResponse } from 'next/server';

// Returns up to 5 Google Places reviews for a given place_id.
// Usage: /api/hotel-reviews?placeId={place_id}
// Response is intentionally not cached — reviews should always be fresh.

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

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
  }

  const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?languageCode=en`;
  const res = await fetch(url, {
    headers: {
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': 'reviews,displayName',
    },
    // No caching — reviews are fetched on user demand
    cache: 'no-store',
  });

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
        // Short cache so rapid re-opens don't re-hit the API
        'Cache-Control': 'public, max-age=300, s-maxage=300',
      },
    }
  );
}
