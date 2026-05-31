import { NextRequest, NextResponse } from 'next/server';

// Proxies Google Places v1 photo media to avoid exposing the API key client-side.
// Usage: /api/hotel-photo?ref=places%2F{placeId}%2Fphotos%2F{photoId}
//
// Uses skipHttpRedirect=true to get the CDN URI first, then fetches the image.
// This is more reliable than following the 302 redirect in a server environment.

export async function GET(req: NextRequest) {
  const ref = req.nextUrl.searchParams.get('ref');
  if (!ref) {
    return new NextResponse('Missing ref', { status: 400 });
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return new NextResponse('GOOGLE_PLACES_API_KEY not configured', { status: 500 });
  }

  // Step 1: ask Google for the CDN URI (no redirect)
  const metaUrl = `https://places.googleapis.com/v1/${ref}/media?maxWidthPx=600&key=${apiKey}&skipHttpRedirect=true`;
  const metaRes = await fetch(metaUrl);

  if (!metaRes.ok) {
    return new NextResponse(`Places API error ${metaRes.status}`, { status: 502 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const meta = await metaRes.json() as any;
  const photoUri: string | undefined = meta.photoUri;

  if (!photoUri) {
    return new NextResponse('No photoUri in Places response', { status: 502 });
  }

  // Step 2: fetch the actual image from the CDN URI
  const imgRes = await fetch(photoUri);
  if (!imgRes.ok) {
    return new NextResponse('CDN fetch failed', { status: 502 });
  }

  const contentType = imgRes.headers.get('content-type') ?? 'image/jpeg';
  const buffer = await imgRes.arrayBuffer();

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=3600',
    },
  });
}
