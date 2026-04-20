'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';

interface AmenityOption { key: string; label: string; }

interface Props {
  types: string[];
  regions: string[];
  amenities: AmenityOption[];
  currentType?: string;
  currentRegion?: string;
  currentAmenities: string[];
  currentQ?: string;
  parkCount?: number;
}

export default function FilterBar({ types, regions, amenities, currentType, currentRegion, currentAmenities, currentQ, parkCount }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

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
  const activeCount = [currentType, currentRegion, currentQ, ...currentAmenities].filter(Boolean).length;

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

  const renderFilters = () => (
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

  return (
    <>
      {/* Mobile trigger — shown only on mobile via CSS */}
      <div className="filter-mobile-btn" style={{ alignItems: 'center', gap: 10 }}>
        <button
          onClick={() => setOpen(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: hasFilters ? '#fff3f0' : '#f5f3f0',
            border: `1.5px solid ${hasFilters ? '#ff7044' : '#eeeeee'}`,
            borderRadius: '2.3em',
            padding: '9px 18px',
            fontFamily: 'Archivo, sans-serif',
            fontWeight: 700,
            fontSize: '0.85rem',
            color: hasFilters ? '#ff7044' : '#726d6b',
            cursor: 'pointer',
          }}
        >
          <SlidersHorizontal size={15} />
          Filters
          {activeCount > 0 && (
            <span style={{
              background: '#ff7044', color: '#fff',
              fontSize: '0.68rem', fontWeight: 700,
              borderRadius: '50%', width: 18, height: 18,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              lineHeight: 1,
            }}>
              {activeCount}
            </span>
          )}
        </button>
        {hasFilters && (
          <button
            onClick={clearAll}
            style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.78rem', fontWeight: 600, color: '#a6967c', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Desktop sidebar content — hidden on mobile via CSS */}
      <div className="filter-sidebar-content">
        {renderFilters()}
      </div>

      {/* Mobile drawer */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 40 }}
          />
          {/* Sheet */}
          <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
            background: '#fff', borderRadius: '20px 20px 0 0',
            maxHeight: '85vh',
            display: 'flex', flexDirection: 'column',
            boxShadow: '0 -4px 32px rgba(0,0,0,0.12)',
          }}>
            {/* Handle */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0' }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: '#dfdfdf' }} />
            </div>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px 16px' }}>
              <span style={{ fontFamily: 'Shrikhand, cursive', fontWeight: 400, fontSize: '1.4rem', color: '#362f35', letterSpacing: '-0.03em' }}>
                Filter Parks
              </span>
              <button
                onClick={() => setOpen(false)}
                style={{ background: '#f5f3f0', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#726d6b' }}
              >
                <X size={16} />
              </button>
            </div>
            {/* Scrollable body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 8px' }}>
              {renderFilters()}
            </div>
            {/* Footer */}
            <div style={{ padding: '16px 20px', borderTop: '1px solid #eeeeee' }}>
              <button
                onClick={() => setOpen(false)}
                style={{
                  width: '100%', background: '#ff7044', color: '#fff', border: 'none',
                  borderRadius: '2.3em', padding: '12px',
                  fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
                }}
                className="hover:opacity-85 transition-opacity"
              >
                {parkCount != null ? `Show ${parkCount} Park${parkCount !== 1 ? 's' : ''}` : 'Done'}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
