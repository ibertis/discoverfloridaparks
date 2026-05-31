import { NextRequest, NextResponse } from 'next/server';

// Proxies Google Places v1 photo media to avoid exposing the API key client-side.
// Usage: /api/hotel-photo?ref=places%2F{placeId}%2Fphotos%2F{photoId}
// The Places API redirects to the actual CDN image — we follow and return the bytes.

export async function GET(req: NextRequest) {
  const ref = req.nextUrl.searchParams.get('ref');
  if (!ref) {
    return new NextResponse('Missing ref', { status: 400 });
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return new NextResponse('Server misconfiguration', { status: 500 });
  }

  const photoUrl = `https://places.googleapis.com/v1/${ref}/media?maxWidthPx=600&key=${apiKey}`;

  const res = await fetch(photoUrl, { redirect: 'follow' });
  if (!res.ok) {
    return new NextResponse('Photo fetch failed', { status: 502 });
  }

  const contentType = res.headers.get('content-type') ?? 'image/jpeg';
  const buffer = await res.arrayBuffer();

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=3600',
    },
  });
}
