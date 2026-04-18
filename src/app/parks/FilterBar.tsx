'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { Search, X } from 'lucide-react';

interface AmenityOption { key: string; label: string; }

interface Props {
  types: string[];
  regions: string[];
  amenities: AmenityOption[];
  currentType?: string;
  currentRegion?: string;
  currentAmenities: string[];
  currentQ?: string;
}

export default function FilterBar({ types, regions, amenities, currentType, currentRegion, currentAmenities, currentQ }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const update = useCallback((key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  }, [router, pathname, searchParams]);

  const toggleAmenity = useCallback((key: string) => {
    const current = searchParams.get('amenities')?.split(',').filter(Boolean) ?? [];
    const next = current.includes(key) ? current.filter(k => k !== key) : [...current, key];
    const params = new URLSearchParams(searchParams.toString());
    if (next.length) params.set('amenities', next.join(','));
    else params.delete('amenities');
    router.push(`${pathname}?${params.toString()}`);
  }, [router, pathname, searchParams]);

  const clearAll = useCallback(() => {
    router.push(pathname);
  }, [router, pathname]);

  const hasFilters = !!(currentType || currentRegion || currentAmenities.length || currentQ);

  const labelStyle = {
    fontFamily: 'Archivo, sans-serif',
    fontSize: '0.72rem',
    fontWeight: 600,
    color: '#a6967c',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    display: 'block',
    marginBottom: 10,
  };

  const filterBtn = (active: boolean) => ({
    width: '100%',
    textAlign: 'left' as const,
    padding: '7px 12px',
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'Archivo, sans-serif',
    fontSize: '0.85rem',
    fontWeight: active ? 700 : 500,
    color: active ? '#ff7044' : '#726d6b',
    background: active ? '#fff3f0' : 'transparent',
    transition: 'background 0.15s, color 0.15s',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* Search */}
      <div>
        <label style={labelStyle}>Search</label>
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#a6967c' }} />
          <input
            type="text"
            placeholder="Park name..."
            defaultValue={currentQ ?? ''}
            onKeyDown={e => { if (e.key === 'Enter') update('q', (e.target as HTMLInputElement).value || null); }}
            style={{
              width: '100%',
              paddingLeft: 36,
              paddingRight: 12,
              paddingTop: 9,
              paddingBottom: 9,
              borderRadius: 8,
              border: '1px solid #eeeeee',
              fontFamily: 'Glegoo, serif',
              fontWeight: 700,
              fontSize: '0.85rem',
              color: '#413734',
              outline: 'none',
              background: '#fff',
              boxSizing: 'border-box',
            }}
            className="focus:border-[#ff7044] transition-colors"
          />
        </div>
      </div>

      {/* Park Type */}
      <div>
        <label style={labelStyle}>Park Type</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <button onClick={() => update('type', null)} style={filterBtn(!currentType)}
            className="hover:bg-[#fff3f0] hover:text-[#ff7044]">
            All Types
          </button>
          {types.map(t => (
            <button key={t} onClick={() => update('type', currentType === t ? null : t)}
              style={filterBtn(currentType === t)}
              className="hover:bg-[#fff3f0] hover:text-[#ff7044]">
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Region */}
      <div>
        <label style={labelStyle}>Region</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <button onClick={() => update('region', null)} style={filterBtn(!currentRegion)}
            className="hover:bg-[#fff3f0] hover:text-[#ff7044]">
            All Regions
          </button>
          {regions.map(r => (
            <button key={r} onClick={() => update('region', currentRegion === r ? null : r)}
              style={filterBtn(currentRegion === r)}
              className="hover:bg-[#fff3f0] hover:text-[#ff7044]">
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Amenities */}
      <div>
        <label style={labelStyle}>Amenities</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {amenities.map(a => {
            const active = currentAmenities.includes(a.key);
            return (
              <button key={a.key} onClick={() => toggleAmenity(a.key)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'transparent', fontFamily: 'Archivo, sans-serif', fontSize: '0.85rem', fontWeight: 500, color: '#726d6b', textAlign: 'left', width: '100%' }}
                className="hover:bg-[#f9f7f5]">
                <span style={{
                  width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                  border: `2px solid ${active ? '#ff7044' : '#dfdfdf'}`,
                  background: active ? '#ff7044' : '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s',
                }}>
                  {active && <span style={{ color: '#fff', fontSize: 10, lineHeight: 1, fontWeight: 700 }}>✓</span>}
                </span>
                {a.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Clear all */}
      {hasFilters && (
        <button onClick={clearAll}
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Archivo, sans-serif', fontSize: '0.82rem', fontWeight: 700, color: '#ff7044', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          className="hover:opacity-70 transition-opacity">
          <X size={13} /> Clear all filters
        </button>
      )}
    </div>
  );
}
