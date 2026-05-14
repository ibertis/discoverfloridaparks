import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(req: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || req.headers.get('x-revalidate-secret') !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { slugs?: unknown; paths?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const revalidated: string[] = [];
  const failed: { path: string; reason: string }[] = [];

  // `paths` — revalidate arbitrary absolute paths (e.g. /parks/region/florida-keys)
  if (Array.isArray(body.paths)) {
    for (const p of body.paths) {
      if (typeof p !== 'string' || !p.trim()) { failed.push({ path: String(p), reason: 'Invalid path' }); continue; }
      try { revalidatePath(p.trim()); revalidated.push(p.trim()); }
      catch (err) { failed.push({ path: p.trim(), reason: err instanceof Error ? err.message : 'Unknown error' }); }
    }
  }

  // `slugs` — legacy: revalidate /parks/:slug pages
  if (Array.isArray(body.slugs)) {
    for (const slug of body.slugs) {
      if (typeof slug !== 'string' || !slug.trim()) { failed.push({ path: String(slug), reason: 'Invalid slug' }); continue; }
      try { revalidatePath(`/parks/${slug.trim()}`); revalidated.push(`/parks/${slug.trim()}`); }
      catch (err) { failed.push({ path: slug.trim(), reason: err instanceof Error ? err.message : 'Unknown error' }); }
    }
  }

  if (revalidated.length === 0 && failed.length === 0) {
    return NextResponse.json({ error: 'Body must contain a non-empty "slugs" or "paths" array' }, { status: 400 });
  }

  return NextResponse.json({ revalidated, failed });
}
