import { NextRequest, NextResponse } from 'next/server';

// Proxies Google Places v1 photo media to avoid exposing the API key client-side.
// Usage: /api/hotel-photo?ref=places%2F{placeId}%2Fphotos%2F{photoId}
// Returns the image bytes with a 24-hour CDN cache header.

export async function GET(req: NextRequest) {
  const ref = req.nextUrl.searchParams.get('ref');
  if (!ref) {
    return new NextResponse('Missing ref', { status: 400 });
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return new NextResponse('Server misconfiguration', { status: 500 });
  }

  const photoUrl = `https://places.googleapis.com/v1/${ref}/media?maxWidthPx=600&key=${apiKey}&skipHttpRedirect=true`;

  let imageUrl: string;
  try {
    const metaRes = await fetch(photoUrl, { redirect: 'follow' });
    if (!metaRes.ok) {
      return new NextResponse('Photo fetch failed', { status: 502 });
    }
    // The API returns JSON with a photoUri field when skipHttpRedirect=true
    const data = await metaRes.json() as { photoUri?: string };
    if (!data.photoUri) {
      return new NextResponse('No photo URI', { status: 502 });
    }
    imageUrl = data.photoUri;
  } catch {
    return new NextResponse('Upstream error', { status: 502 });
  }

  // Fetch the actual image and stream it back
  const imgRes = await fetch(imageUrl);
  if (!imgRes.ok) {
    return new NextResponse('Image fetch failed', { status: 502 });
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
