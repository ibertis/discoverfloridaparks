import * as dotenv from 'dotenv';
import path from 'path';
import { supabaseAdmin } from './supabase-admin.js';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;

// Reuse the existing public "park-photos" bucket with a hotels/ key prefix, so
// no new bucket or RLS policy is needed (service role bypasses RLS on write;
// the bucket is already public-read for serving).
const BUCKET = 'park-photos';
const PREFIX = 'hotels';

// GOOGLE TERMS NOTE: Google Maps Platform permits *temporary* caching of Places
// content (up to 30 days), not indefinite storage. Treat these stored images as
// a ≤30-day cache and refresh periodically (e.g. via Hermes) rather than a
// permanent mirror. resolveHotelPhoto() re-fetches whenever it runs.

/**
 * Given a Google Places photo reference ("places/{placeId}/photos/{photoId}"),
 * download the image once and upload it to Supabase Storage. Returns the public
 * https:// URL, which park pages serve directly with NO Google call at view time.
 *
 * Resilient by design: on any failure it returns the original ref unchanged so
 * enrichment never breaks — the /api/hotel-photo proxy remains the fallback.
 *
 * @param photoRef  Google Places photo ref, or an already-https URL, or null.
 * @param keyHint   Stable identifier (hotel id or place id) used for the filename.
 */
export async function resolveHotelPhoto(
  photoRef: string | null | undefined,
  keyHint: string,
): Promise<string | null> {
  if (!photoRef) return null;
  // Already a stored/direct URL — nothing to do.
  if (photoRef.startsWith('https://') || photoRef.startsWith('/')) return photoRef;
  if (!photoRef.startsWith('places/')) return photoRef;
  if (!API_KEY) return photoRef;

  try {
    // Step 1: resolve the CDN URI (billable Place Photo call — happens once).
    const metaUrl = `https://places.googleapis.com/v1/${photoRef}/media?maxWidthPx=800&skipHttpRedirect=true`;
    const metaRes = await fetch(metaUrl, { headers: { 'X-Goog-Api-Key': API_KEY } });
    if (!metaRes.ok) return photoRef;
    const meta = await metaRes.json() as { photoUri?: string };
    if (!meta.photoUri) return photoRef;

    // Step 2: download the actual image bytes.
    const imgRes = await fetch(meta.photoUri);
    if (!imgRes.ok) return photoRef;
    const contentType = imgRes.headers.get('content-type') ?? 'image/jpeg';
    const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg';
    const buffer = Buffer.from(await imgRes.arrayBuffer());

    // Step 3: upload to storage under a stable, sanitized key (upsert = refresh).
    // Key by the placeId embedded in the ref ("places/{placeId}/photos/{photoId}")
    // so every caller writes the SAME object — no duplicates/orphans. Fall back to
    // keyHint only if the ref can't be parsed.
    const placeId = photoRef.split('/')[1] || keyHint;
    const safeKey = String(placeId).replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 80);
    const objectPath = `${PREFIX}/${safeKey}.${ext}`;
    const { error } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(objectPath, buffer, { upsert: true, contentType });
    if (error) {
      console.error(`  resolveHotelPhoto upload failed (${keyHint}): ${error.message}`);
      return photoRef;
    }

    const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(objectPath);
    return data.publicUrl;
  } catch (err) {
    console.error(`  resolveHotelPhoto error (${keyHint}):`, err instanceof Error ? err.message : err);
    return photoRef;
  }
}
