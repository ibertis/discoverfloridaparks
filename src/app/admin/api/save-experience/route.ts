import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import { getAdminUser } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  function isSafeUrl(url: string | null | undefined): boolean {
    if (!url) return true;
    try { return /^https?:\/\//i.test(new URL(url).href); } catch { return false; }
  }

  const body = await req.json();
  const { id, ...payload } = body;

  if (payload.affiliate_url && !isSafeUrl(payload.affiliate_url)) {
    payload.affiliate_url = null;
  }

  if (id) {
    const { error } = await db.from('experiences').update(payload).eq('id', id);
    if (error) { console.error('save-experience update:', error.message); return NextResponse.json({ error: 'Failed to save experience.' }, { status: 500 }); }
    revalidatePath('/');
    return NextResponse.json({ id });
  } else {
    const { data, error } = await db.from('experiences').insert(payload).select('id').single();
    if (error) { console.error('save-experience insert:', error.message); return NextResponse.json({ error: 'Failed to save experience.' }, { status: 500 }); }
    revalidatePath('/');
    return NextResponse.json({ id: data.id });
  }
}

export async function DELETE(req: NextRequest) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { id } = await req.json();
  const { error } = await db.from('experiences').delete().eq('id', id);
  if (error) { console.error('save-experience delete:', error.message); return NextResponse.json({ error: 'Failed to delete experience.' }, { status: 500 }); }
  return NextResponse.json({ ok: true });
}
