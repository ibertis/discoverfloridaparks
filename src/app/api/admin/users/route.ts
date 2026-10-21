import { NextResponse } from 'next/server';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import { isRole, listAllUsers, listUserRows, requireAdmin, roleOf, supabaseAdmin } from '@/lib/supabase-admin';

// GET — all accounts, team members first.
export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  try { return NextResponse.json({ users: await listUserRows() }); }
  catch (e) { return NextResponse.json({ error: (e as Error).message }, { status: 500 }); }
}

// Guard rails shared by PATCH and DELETE: never act on yourself, never remove the last admin.
async function guard(db: SupabaseClient, me: User, targetId: string, removingAdmin: boolean) {
  if (targetId === me.id) return 'You can’t change or remove your own account here.';
  const { data } = await db.auth.admin.getUserById(targetId);
  if (!data.user) return 'User not found.';
  if (removingAdmin && roleOf(data.user) === 'admin') {
    const admins = (await listAllUsers(db)).filter(u => roleOf(u) === 'admin');
    if (admins.length <= 1) return 'At least one admin is required.';
  }
  return null;
}

// PATCH { id, role: 'admin' | 'editor' | null } — null removes admin access but keeps the account.
export async function PATCH(request: Request) {
  const me = await requireAdmin();
  if (!me) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id, role } = await request.json().catch(() => ({}));
  if (!id || !(role === null || isRole(role))) return NextResponse.json({ error: 'id and role (admin|editor|null) are required' }, { status: 400 });

  const db = supabaseAdmin();
  const blocked = await guard(db, me, id, role !== 'admin');
  if (blocked) return NextResponse.json({ error: blocked }, { status: 400 });

  const { error } = await db.auth.admin.updateUserById(id, { app_metadata: { role } });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// DELETE { id } — deletes the account entirely.
export async function DELETE(request: Request) {
  const me = await requireAdmin();
  if (!me) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id } = await request.json().catch(() => ({}));
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

  const db = supabaseAdmin();
  const blocked = await guard(db, me, id, true);
  if (blocked) return NextResponse.json({ error: blocked }, { status: 400 });

  const { error } = await db.auth.admin.deleteUser(id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
