import { createSupabaseServerClient } from '@/lib/supabase-server';
import Link from 'next/link';
import { Plus, Search } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Experiences' };

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function AdminExperiencesPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from('experiences')
    .select('id,name,placement_type,is_active,sort_order,duration,updated_at')
    .order('sort_order')
    .order('name');

  if (q) query = query.ilike('name', `%${q}%`);

  const { data: experiences } = await query;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold text-[#362f35]" style={{ fontFamily: 'Shrikhand, cursive', letterSpacing: '-0.04em' }}>
          Experiences {experiences?.length ? <span className="text-[#a6967c] text-sm">({experiences.length})</span> : null}
        </h1>
        <Link
          href="/admin/experiences/new"
          className="flex items-center gap-2 bg-[#ff7044] hover:bg-[#e85a2e] text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
        >
          <Plus size={15} />
          Add Experience
        </Link>
      </div>

      <form className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a6967c]" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Search experiences…"
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-[#dfdfdf] rounded-lg outline-none focus:border-[#ff7044] transition bg-white"
          />
        </div>
        <button type="submit" className="bg-[#413734] hover:bg-[#362f35] text-white text-sm font-semibold px-4 py-2 rounded-lg transition">
          Search
        </button>
        {q && (
          <Link href="/admin/experiences" className="text-sm text-[#726d6b] hover:text-[#413734] py-2 transition">
            Clear
          </Link>
        )}
      </form>

      {!experiences?.length ? (
        <div className="text-center py-16 text-[#a6967c] text-sm">
          No experiences found.{' '}
          <Link href="/admin/experiences/new" className="text-[#ff7044] hover:underline">Add one →</Link>
        </div>
      ) : (
        <div className="border border-[#eeeeee] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#f7f5f2] border-b border-[#eeeeee]">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#726d6b] uppercase tracking-wide">Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#726d6b] uppercase tracking-wide">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#726d6b] uppercase tracking-wide">Duration</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#726d6b] uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-[#726d6b] uppercase tracking-wide w-8">Order</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eeeeee]">
              {experiences.map(exp => (
                <tr key={exp.id} className="bg-white hover:bg-[#fafafa] transition">
                  <td className="px-4 py-3 font-medium text-[#362f35]">{exp.name}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${
                      exp.placement_type === 'sponsored'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-[#f5f1ec] text-[#726d6b]'
                    }`}>
                      {exp.placement_type === 'sponsored' ? 'Sponsored' : 'Editorial'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#726d6b]">{exp.duration ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${
                      exp.is_active ? 'bg-green-100 text-green-700' : 'bg-[#f5f1ec] text-[#a6967c]'
                    }`}>
                      {exp.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#a6967c] text-center">{exp.sort_order}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/experiences/${exp.id}`} className="text-[#ff7044] hover:underline text-xs font-semibold">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
