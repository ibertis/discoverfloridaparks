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

const CACHE = 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=3600';

async function streamUrl(url: string): Promise<NextResponse> {
  const res = await fetch(url);
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

  // Direct URL (user-provided photo stored in Supabase Storage or elsewhere)
  if (ref.startsWith('https://')) {
    return streamUrl(ref);
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

  return streamUrl(photoUri);
}
