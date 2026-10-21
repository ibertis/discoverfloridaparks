import { createClient, type User } from '@supabase/supabase-js';
import { getAdminUser, getUserRole } from '@/lib/supabase-server';

export const VALID_ROLES = ['admin', 'editor'] as const;
export type Role = typeof VALID_ROLES[number];
export const isRole = (r: unknown): r is Role => VALID_ROLES.includes(r as Role);

// Service-role client for auth admin APIs. Server-only.
export function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

// Returns the signed-in admin, or null if the caller isn't an admin.
export async function requireAdmin() {
  const user = await getAdminUser();
  return user && getUserRole(user) === 'admin' ? user : null;
}

export interface AdminUserRow { id: string; email: string; role: Role | null; status: 'active' | 'invited' | 'never'; last_sign_in_at: string | null }

export async function listAllUsers(db = supabaseAdmin()): Promise<User[]> {
  const users: User[] = [];
  for (let page = 1; ; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    users.push(...data.users);
    if (data.users.length < 1000) return users;
  }
}

export const roleOf = (u: User): Role | null => (isRole(u.app_metadata?.role) ? u.app_metadata.role : null);

// Team members first, then everyone else, alphabetically.
export async function listUserRows(): Promise<AdminUserRow[]> {
  return (await listAllUsers())
    .map(u => ({
      id: u.id,
      email: u.email ?? '(no email)',
      role: roleOf(u),
      status: (u.last_sign_in_at ? 'active' : u.invited_at ? 'invited' : 'never') as AdminUserRow['status'],
      last_sign_in_at: u.last_sign_in_at ?? null,
    }))
    .sort((a, b) => Number(!!b.role) - Number(!!a.role) || a.email.localeCompare(b.email));
}
