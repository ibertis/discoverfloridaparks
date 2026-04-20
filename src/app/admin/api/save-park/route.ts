import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAdminUser } from '@/lib/supabase-server';

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { park, amenities, trails, facts, events } = await req.json();
  const { park_amenities, park_trails, park_fun_facts, park_seasonal_events, ...payload } = park;

  let parkId: string;

  if (park.id) {
    const { error } = await db.from('parks').update(payload).eq('id', park.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    parkId = park.id;
  } else {
    const { data, error } = await db.from('parks').insert(payload).select('id').single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
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

  return NextResponse.json({ id: parkId, slug: park.slug });
}

export async function DELETE(req: NextRequest) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await req.json();
  const { error } = await db.from('parks').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
