import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

// Rate limiter: max 30 revalidations per minute per IP (protects against secret compromise)
const rateLimitMap = new Map<string, number[]>();
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const window = 60 * 1000;
  const attempts = (rateLimitMap.get(ip) ?? []).filter(t => now - t < window);
  if (attempts.length >= 30) return false;
  rateLimitMap.set(ip, [...attempts, now]);
  return true;
}

export async function POST(req: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || req.headers.get('x-revalidate-secret') !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || '127.0.0.1';
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  let body: { slugs?: unknown; paths?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const revalidated: string[] = [];
  const failed: { path: string; reason: string }[] = [];

  const ALLOWED_PREFIXES = ['/parks/', '/parks/region/', '/map', '/parks'];
  const MAX_ENTRIES = 100;

  // `paths` — revalidate arbitrary absolute paths (e.g. /parks/region/florida-keys)
  if (Array.isArray(body.paths)) {
    const paths = (body.paths as unknown[]).slice(0, MAX_ENTRIES);
    for (const p of paths) {
      if (typeof p !== 'string' || !p.trim()) { failed.push({ path: String(p), reason: 'Invalid path' }); continue; }
      const trimmed = p.trim();
      if (!ALLOWED_PREFIXES.some(pfx => trimmed.startsWith(pfx))) {
        failed.push({ path: trimmed, reason: 'Path not allowed' }); continue;
      }
      try { revalidatePath(trimmed); revalidated.push(trimmed); }
      catch (err) { failed.push({ path: trimmed, reason: err instanceof Error ? err.message : 'Unknown error' }); }
    }
  }

  // `slugs` — legacy: revalidate /parks/:slug pages
  if (Array.isArray(body.slugs)) {
    const slugs = (body.slugs as unknown[]).slice(0, MAX_ENTRIES);
    for (const slug of slugs) {
      if (typeof slug !== 'string' || !slug.trim()) { failed.push({ path: String(slug), reason: 'Invalid slug' }); continue; }
      const trimmed = slug.trim();
      try { revalidatePath(`/parks/${trimmed}`); revalidated.push(`/parks/${trimmed}`); }
      catch (err) { failed.push({ path: trimmed, reason: err instanceof Error ? err.message : 'Unknown error' }); }
    }
  }

  if (revalidated.length === 0 && failed.length === 0) {
    return NextResponse.json({ error: 'Body must contain a non-empty "slugs" or "paths" array' }, { status: 400 });
  }

  return NextResponse.json({ revalidated, failed });
}
