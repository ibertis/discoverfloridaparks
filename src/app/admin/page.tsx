import { createSupabaseServerClient, getAdminUser, getUserRole } from '@/lib/supabase-server';
import Link from 'next/link';
import { Trees, Plus } from 'lucide-react';

export const metadata = { title: 'Dashboard' };

export default async function AdminDashboard() {
  const supabase = await createSupabaseServerClient();
  const user = await getAdminUser();
  const role = getUserRole(user);

  const [{ count: total }, { count: noPhoto }, { count: noDesc }, { data: recent }] = await Promise.all([
    supabase.from('parks').select('*', { count: 'exact', head: true }),
    supabase.from('parks').select('*', { count: 'exact', head: true }).is('featured_image_url', null),
    supabase.from('parks').select('*', { count: 'exact', head: true }).is('short_description', null),
    supabase.from('parks').select('id,slug,name,park_type,updated_at').order('updated_at', { ascending: false }).limit(8),
  ]);

  const stats = [
    { label: 'Total Parks', value: total ?? 0, color: '#ff7044' },
    { label: 'Missing Photo', value: noPhoto ?? 0, color: '#f59e0b' },
    { label: 'Missing Description', value: noDesc ?? 0, color: '#f59e0b' },
  ];

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-lg font-bold text-[#362f35]" style={{ fontFamily: 'Shrikhand, cursive', letterSpacing: '-0.04em' }}>
          Dashboard
        </h1>
        {role === 'admin' && (
          <Link
            href="/admin/parks/new"
            className="flex items-center gap-2 bg-[#ff7044] hover:bg-[#e85a2e] text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
          >
            <Plus size={15} />
            Add Park
          </Link>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-[#eeeeee] p-5">
            <p className="text-xs text-[#a6967c] font-medium mb-1">{s.label}</p>
            <p className="text-2xl font-bold" style={{ color: s.color, fontFamily: 'Shrikhand, cursive' }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-[#eeeeee] p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-[#362f35]">Recently Updated</h2>
          <Link href="/admin/parks" className="text-xs text-[#ff7044] hover:underline">View all →</Link>
        </div>
        <div className="space-y-1">
          {(recent ?? []).map(park => (
            <Link
              key={park.id}
              href={`/admin/parks/${park.slug}`}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-[#f7f5f2] transition group"
            >
              <div className="flex items-center gap-3">
                <Trees size={15} className="text-[#a6967c]" />
                <span className="text-sm text-[#413734] font-medium">{park.name}</span>
                <span className="text-xs text-[#a6967c]">{park.park_type}</span>
              </div>
              <span className="text-xs text-[#a6967c] group-hover:text-[#ff7044] transition">Edit →</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
