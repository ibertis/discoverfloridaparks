import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(req: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || req.headers.get('x-revalidate-secret') !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let slugs: unknown;
  try {
    ({ slugs } = await req.json());
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!Array.isArray(slugs) || slugs.length === 0) {
    return NextResponse.json({ error: 'Body must contain a non-empty "slugs" array' }, { status: 400 });
  }

  const revalidated: string[] = [];
  const failed: { slug: string; reason: string }[] = [];

  for (const slug of slugs) {
    if (typeof slug !== 'string' || !slug.trim()) {
      failed.push({ slug: String(slug), reason: 'Invalid slug' });
      continue;
    }
    try {
      revalidatePath(`/parks/${slug.trim()}`);
      revalidated.push(slug.trim());
    } catch (err) {
      failed.push({ slug: slug.trim(), reason: err instanceof Error ? err.message : 'Unknown error' });
    }
  }

  return NextResponse.json({ revalidated, failed });
}
