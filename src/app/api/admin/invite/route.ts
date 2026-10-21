import { NextResponse } from 'next/server';
import { isRole, requireAdmin, supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  let email: string, role: unknown;
  try { ({ email, role } = await request.json()); }
  catch { return NextResponse.json({ error: 'Invalid request body' }, { status: 400 }); }

  email = (email ?? '').trim().toLowerCase();
  if (!email || !isRole(role)) {
    return NextResponse.json({ error: 'email and role (admin|editor) are required' }, { status: 400 });
  }

  const db = supabaseAdmin();
  const origin = new URL(request.url).origin;
  const { data, error } = await db.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${origin}/admin/reset-password`,
  });
  if (error) {
    const exists = /already (been )?registered|already exists/i.test(error.message);
    return NextResponse.json(
      { error: exists ? 'That email already has an account. Change its role in the list below.' : error.message },
      { status: exists ? 409 : 400 },
    );
  }

  // Roles live in app_metadata (only the service role can write it); the
  // proxy, admin layout and RLS policies all read it from there.
  const { error: roleError } = await db.auth.admin.updateUserById(data.user.id, { app_metadata: { role } });
  if (roleError) return NextResponse.json({ error: `Invite sent, but setting the role failed: ${roleError.message}` }, { status: 500 });

  return NextResponse.json({ ok: true });
}
