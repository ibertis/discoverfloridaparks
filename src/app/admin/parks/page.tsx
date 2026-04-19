import { createSupabaseServerClient } from '@/lib/supabase-server';
import Link from 'next/link';
import { Plus, Search } from 'lucide-react';

export const metadata = { title: 'Parks' };

interface Props {
  searchParams: Promise<{ q?: string; type?: string }>;
}

const PARK_TYPES = ['State Parks', 'National Parks', 'County Parks', 'Theme Parks', 'Water Parks'];

export default async function AdminParksPage({ searchParams }: Props) {
  const { q, type } = await searchParams;
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from('parks')
    .select('id,slug,name,park_type,park_region,city,featured_image_url,short_description,updated_at')
    .order('name');

  if (q) query = query.ilike('name', `%${q}%`);
  if (type) query = query.eq('park_type', type);

  const { data: parks } = await query.limit(200);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#362f35]" style={{ fontFamily: 'Shrikhand, cursive', letterSpacing: '-0.04em' }}>
          Parks {parks?.length ? <span className="text-[#a6967c] text-lg">({parks.length})</span> : null}
        </h1>
        <Link
          href="/admin/parks/new"
          className="flex items-center gap-2 bg-[#ff7044] hover:bg-[#e85a2e] text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
        >
          <Plus size={15} />
          Add Park
        </Link>
      </div>

      {/* Search + filter */}
      <form className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a6967c]" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Search parks…"
            className="w-full pl-9 pr-3 py-2.5 text-sm border border-[#dfdfdf] rounded-lg outline-none focus:border-[#ff7044] transition bg-white"
          />
        </div>
        <select
          name="type"
          defaultValue={type ?? ''}
          className="text-sm border border-[#dfdfdf] rounded-lg px-3 py-2.5 bg-white outline-none focus:border-[#ff7044] transition text-[#413734]"
        >
          <option value="">All types</option>
          {PARK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <button
          type="submit"
          className="text-sm font-semibold bg-[#413734] text-white px-4 py-2.5 rounded-lg hover:bg-[#362f35] transition"
        >
          Filter
        </button>
      </form>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#eeeeee] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#eeeeee] bg-[#f7f5f2]">
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#726d6b]">Name</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#726d6b]">Type</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#726d6b]">Region</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#726d6b]">Photo</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#726d6b]">Description</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {(parks ?? []).map((park, i) => (
              <tr key={park.id} className={`border-b border-[#f0f0f0] hover:bg-[#fafaf9] transition ${i % 2 === 0 ? '' : 'bg-[#fdfcfc]'}`}>
                <td className="px-4 py-3 font-medium text-[#362f35]">{park.name}</td>
                <td className="px-4 py-3 text-[#726d6b]">{park.park_type ?? '—'}</td>
                <td className="px-4 py-3 text-[#726d6b]">{park.park_region ?? '—'}</td>
                <td className="px-4 py-3">
                  {park.featured_image_url
                    ? <span className="text-xs text-green-600 font-medium">✓</span>
                    : <span className="text-xs text-amber-500 font-medium">Missing</span>}
                </td>
                <td className="px-4 py-3">
                  {park.short_description
                    ? <span className="text-xs text-green-600 font-medium">✓</span>
                    : <span className="text-xs text-amber-500 font-medium">Missing</span>}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/parks/${park.slug}`}
                    className="text-xs font-semibold text-[#ff7044] hover:underline"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!parks?.length && (
          <div className="text-center py-12 text-[#a6967c] text-sm">No parks found</div>
        )}
      </div>
    </div>
  );
}
