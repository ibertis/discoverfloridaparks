import { redirect } from 'next/navigation';
import { getAdminUser, getUserRole } from '@/lib/supabase-server';
import UsersClient from './UsersClient';
import { listUserRows } from '@/lib/supabase-admin';

export const metadata = { title: 'Users' };
export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  const user = await getAdminUser();
  const role = getUserRole(user);
  if (role !== 'admin') redirect('/admin');
  const users = await listUserRows();

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-lg font-bold text-[#362f35] mb-6" style={{ fontFamily: 'Shrikhand, cursive', letterSpacing: '-0.04em' }}>
        Users
      </h1>
      <UsersClient currentUserId={user!.id} users={users} />
    </div>
  );
}
