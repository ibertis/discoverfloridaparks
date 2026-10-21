import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getAdminUser, getUserRole } from '@/lib/supabase-server';

// Refresh the cached pages a park appears on so admin edits show up immediately
// instead of waiting on the ISR TTL. (Region hub pages refresh on their own TTL.)
function revalidatePark(slug?: string | null) {
  if (slug) revalidatePath(`/parks/${slug}`);
  revalidatePath('/parks');
  revalidatePath('/map');
  revalidatePath('/');
}

type ChildRow = Record<string, unknown> & { id?: string; name?: string };

// Sync a park's child rows by id. `newRowDefaults` apply only to inserted rows.
async function syncChildren(
  db: SupabaseClient, table: string, parkId: string,
  rows: ChildRow[], newRowDefaults: Record<string, unknown> = {},
): Promise<{ message: string } | null> {
  const keep = rows.filter(r => r.id).map(r => r.id as string);
  let del = db.from(table).delete().eq('park_id', parkId);
  if (keep.length) del = del.not('id', 'in', `(${keep.join(',')})`);
  const { error: delErr } = await del;
  if (delErr) return delErr;
  for (const { id, ...fields } of rows) {
    const { error } = id
      ? await db.from(table).update(fields).eq('id', id).eq('park_id', parkId)
      : await db.from(table).insert({ ...fields, ...newRowDefaults, park_id: parkId });
    if (error) return error;
  }
  return null;
}

export async function POST(req: NextRequest) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // Middleware already gates /admin, but this route writes with the service role
  // (bypassing RLS), so check the role here too.
  const role = getUserRole(user);
  if (role !== 'admin' && role !== 'editor') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { park, amenities, trails, facts, events, experiences, hotels } = await req.json();

  function isSafeUrl(url: string | null | undefined): boolean {
    if (!url) return true;
    try { return /^https?:\/\//i.test(new URL(url).href); } catch { return false; }
  }
  const { park_amenities, park_trails, park_fun_facts, park_seasonal_events, park_experiences, park_hotels, ...payload } = park;

  // Reject bad links before writing anything, so a typo can't leave a park half-saved.
  const badHotel = (hotels ?? []).find((h: ChildRow) => !h.url || !isSafeUrl(h.url as string));
  if (badHotel) return NextResponse.json({ error: `Hotel "${badHotel.name || 'untitled'}" needs a link starting with http:// or https://` }, { status: 400 });
  const badExp = (experiences ?? []).find((e: ChildRow) => e.href && !isSafeUrl(e.href as string));
  if (badExp) return NextResponse.json({ error: `Experience "${badExp.name || 'untitled'}" has an invalid link` }, { status: 400 });

  let parkId: string;
  let oldSlug: string | null = null;

  if (park.id) {
    const { data: prev } = await db.from('parks').select('slug').eq('id', park.id).single();
    oldSlug = prev?.slug ?? null;
    const { error } = await db.from('parks').update(payload).eq('id', park.id);
    if (error) { console.error('save-park update:', error.message, error.details, error.hint); return NextResponse.json({ error: error.message }, { status: 500 }); }
    parkId = park.id;
  } else {
    const { data, error } = await db.from('parks').insert(payload).select('id').single();
    if (error) { console.error('save-park insert:', error.message, error.details, error.hint); return NextResponse.json({ error: error.message }, { status: 500 }); }
    parkId = data.id;
  }

  const fail = (step: string, error: { message: string } | null) => {
    console.error(`save-park ${step}:`, error?.message);
    return NextResponse.json({ error: `Park saved, but updating ${step} failed: ${error?.message}` }, { status: 500 });
  };

  // Amenities — upsert
  const { id: _id, park_id: _pid, ...amenityFields } = amenities;
  { const { error } = await db.from('park_amenities').upsert({ park_id: parkId, ...amenityFields }, { onConflict: 'park_id' });
    if (error) return fail('amenities', error); }

  // Simple lists with no hidden data — delete + re-insert
  const lists: [string, string, Record<string, unknown>[]][] = [
    ['park_trails', 'trails', (trails ?? []).map((t: ChildRow, i: number) => ({
      park_id: parkId, name: t.name, difficulty: t.difficulty, length_miles: t.length_miles, description: t.description, sort_order: i }))],
    ['park_fun_facts', 'fun facts', (facts ?? []).map((f: ChildRow, i: number) => ({ park_id: parkId, fact: f.fact, sort_order: i }))],
    ['park_seasonal_events', 'events', (events ?? []).map((e: ChildRow, i: number) => ({
      park_id: parkId, event_name: e.event_name, month: e.month, description: e.description, sort_order: i }))],
  ];
  for (const [table, label, rows] of lists) {
    const del = await db.from(table).delete().eq('park_id', parkId);
    if (del.error) return fail(label, del.error);
    if (rows.length) { const ins = await db.from(table).insert(rows); if (ins.error) return fail(label, ins.error); }
  }

  // Hotels and experiences carry data the form never shows (hotel photos,
  // coordinates, place_id, pet/price info; experience is_active). Update existing
  // rows in place with only the editable fields, insert new ones, and delete the
  // ones removed in the form, so a save never wipes that data.
  const hotelErr = await syncChildren(db, 'park_hotels', parkId, (hotels ?? []).map((h: ChildRow, i: number) => ({
    id: h.id, name: h.name, description: h.description, url: h.url, price_from: h.price_from, sort_order: i })));
  if (hotelErr) return fail('hotels', hotelErr);

  const expErr = await syncChildren(db, 'park_experiences', parkId, (experiences ?? []).map((e: ChildRow, i: number) => ({
    id: e.id, name: e.name, description: e.description, duration: e.duration, price_from: e.price_from,
    href: e.href || null, source: e.source ?? 'viator', business_name: e.business_name, sort_order: i })),
    { is_active: true });
  if (expErr) return fail('experiences', expErr);

  if (oldSlug && oldSlug !== park.slug) revalidatePath(`/parks/${oldSlug}`);
  revalidatePark(park.slug);
  return NextResponse.json({ id: parkId, slug: park.slug });
}

export async function DELETE(req: NextRequest) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (getUserRole(user) !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { id, slug } = await req.json();
  const { error } = await db.from('parks').delete().eq('id', id);
  if (error) { console.error('save-park delete:', error.message); return NextResponse.json({ error: 'Failed to delete park.' }, { status: 500 }); }
  revalidatePark(slug);
  return NextResponse.json({ ok: true });
}
