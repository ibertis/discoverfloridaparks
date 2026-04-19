import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAdminUser, getUserRole } from '@/lib/supabase-server';

const VALID_ROLES = ['admin', 'editor'] as const;
type Role = typeof VALID_ROLES[number];

export async function POST(request: Request) {
  const user = await getAdminUser();
  const role = getUserRole(user);

  if (!user || role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let email: string;
  let inviteRole: Role;

  try {
    const body = await request.json();
    email = body.email;
    inviteRole = body.role;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!email || !inviteRole || !VALID_ROLES.includes(inviteRole)) {
    return NextResponse.json({ error: 'email and role (admin|editor) are required' }, { status: 400 });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
    data: { role: inviteRole },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
