import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import { getAdminUser, getUserRole } from '@/lib/supabase-server';

// Refresh the cached pages a park appears on so admin edits show up immediately
// instead of waiting on the ISR TTL. (Region hub pages refresh on their own TTL.)
function revalidatePark(slug?: string | null) {
  if (slug) revalidatePath(`/parks/${slug}`);
  revalidatePath('/parks');
  revalidatePath('/map');
  revalidatePath('/');
}

export async function POST(req: NextRequest) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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

  let parkId: string;

  if (park.id) {
    const { error } = await db.from('parks').update(payload).eq('id', park.id);
    if (error) { console.error('save-park update:', error.message, error.details, error.hint); return NextResponse.json({ error: error.message }, { status: 500 }); }
    parkId = park.id;
  } else {
    const { data, error } = await db.from('parks').insert(payload).select('id').single();
    if (error) { console.error('save-park insert:', error.message, error.details, error.hint); return NextResponse.json({ error: error.message }, { status: 500 }); }
    parkId = data.id;
  }

  // Amenities — upsert
  const { id: _id, park_id: _pid, ...amenityFields } = amenities;
  await db.from('park_amenities').upsert({ park_id: parkId, ...amenityFields }, { onConflict: 'park_id' });

  // Trails — delete + re-insert
  await db.from('park_trails').delete().eq('park_id', parkId);
  if (trails.length > 0) {
    await db.from('park_trails').insert(
      trails.map((t: { name: string; difficulty: string; length_miles: number | null; description: string }, i: number) => ({
        park_id: parkId, name: t.name, difficulty: t.difficulty,
        length_miles: t.length_miles, description: t.description, sort_order: i,
      }))
    );
  }

  // Fun facts — delete + re-insert
  await db.from('park_fun_facts').delete().eq('park_id', parkId);
  if (facts.length > 0) {
    await db.from('park_fun_facts').insert(
      facts.map((f: { fact: string }, i: number) => ({ park_id: parkId, fact: f.fact, sort_order: i }))
    );
  }

  // Seasonal events — delete + re-insert
  await db.from('park_seasonal_events').delete().eq('park_id', parkId);
  if (events.length > 0) {
    await db.from('park_seasonal_events').insert(
      events.map((e: { event_name: string; month: string; description: string }, i: number) => ({
        park_id: parkId, event_name: e.event_name, month: e.month,
        description: e.description, sort_order: i,
      }))
    );
  }

  // Per-park experiences (direct/partner) — delete + re-insert
  await db.from('park_experiences').delete().eq('park_id', parkId);
  if (experiences?.length > 0) {
    await db.from('park_experiences').insert(
      experiences.map((e: any, i: number) => ({
        park_id: parkId, name: e.name, description: e.description,
        duration: e.duration, price_from: e.price_from, href: isSafeUrl(e.href) ? e.href : null,
        source: e.source ?? 'viator', business_name: e.business_name,
        sort_order: i, is_active: true,
      }))
    );
  }

  // Hotels — delete + re-insert
  await db.from('park_hotels').delete().eq('park_id', parkId);
  if (hotels?.length > 0) {
    await db.from('park_hotels').insert(
      hotels.map((h: any, i: number) => ({
        park_id: parkId, name: h.name, description: h.description,
        url: isSafeUrl(h.url) ? h.url : null, price_from: h.price_from, sort_order: i,
      }))
    );
  }

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
