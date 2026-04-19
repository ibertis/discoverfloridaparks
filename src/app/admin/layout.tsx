import { redirect } from 'next/navigation';
import { getAdminUser, getUserRole } from '@/lib/supabase-server';
import AdminNav from './AdminNav';

export const metadata = { title: { default: 'Admin', template: '%s — DFP Admin' } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getAdminUser();
  const role = getUserRole(user);

  if (!user || (role !== 'admin' && role !== 'editor')) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen flex bg-[#f7f5f2]" style={{ fontFamily: 'Archivo, sans-serif' }}>
      <AdminNav role={role!} userEmail={user.email ?? ''} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
