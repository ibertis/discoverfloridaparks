'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useState, useRef, useEffect } from 'react';
import { Search, X, SlidersHorizontal, ChevronDown } from 'lucide-react';

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

type OpenPanel = 'type' | 'region' | 'amenities' | null;

export default function FilterBar({ types, regions, amenities, currentType, currentRegion, currentAmenities, currentQ, parkCount }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openPanel, setOpenPanel] = useState<OpenPanel>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onOutsideClick(e: MouseEvent) {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setOpenPanel(null);
      }
    }
    document.addEventListener('mousedown', onOutsideClick);
    return () => document.removeEventListener('mousedown', onOutsideClick);
  }, []);

  const update = useCallback((key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value); else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  }, [router, pathname, searchParams]);

  const toggleAmenity = useCallback((key: string) => {
    const current = searchParams.get('amenities')?.split(',').filter(Boolean) ?? [];
    const next = current.includes(key) ? current.filter(k => k !== key) : [...current, key];
    const params = new URLSearchParams(searchParams.toString());
    if (next.length) params.set('amenities', next.join(',')); else params.delete('amenities');
    router.push(`${pathname}?${params.toString()}`);
  }, [router, pathname, searchParams]);

  const clearAll = useCallback(() => {
    router.push(pathname);
    setOpenPanel(null);
  }, [router, pathname]);

  const hasFilters = !!(currentType || currentRegion || currentAmenities.length || currentQ);
  const activeCount = [currentType, currentRegion, currentQ, ...currentAmenities].filter(Boolean).length;

  // ── Shared dropdown panel shell ──────────────────────────────────
  const panelStyle: React.CSSProperties = {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    left: 0,
    background: '#fff',
    border: '1.5px solid #eeeeee',
    borderRadius: 16,
    boxShadow: '0 8px 32px rgba(54,47,53,0.12)',
    zIndex: 50,
    overflow: 'hidden',
  };

  // ── Mobile: full filter list (used in drawer) ────────────────────
  const labelStyle: React.CSSProperties = {
    fontFamily: 'Archivo, sans-serif', fontSize: '0.72rem', fontWeight: 600,
    color: '#a6967c', textTransform: 'uppercase', letterSpacing: '0.1em',
    display: 'block', marginBottom: 10,
  };

  const mobileFilterBtn = (active: boolean): React.CSSProperties => ({
    width: '100%', textAlign: 'left', padding: '7px 12px', borderRadius: 8,
    border: 'none', cursor: 'pointer', fontFamily: 'Archivo, sans-serif',
    fontSize: '0.85rem', fontWeight: active ? 700 : 500,
    color: active ? '#ff7044' : '#726d6b',
    background: active ? '#fff3f0' : 'transparent', transition: 'background 0.15s',
  });

  const renderMobileFilters = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div>
        <label style={labelStyle}>Search</label>
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#ff7044' }} />
          <input
            type="text" placeholder="Search Florida parks…" defaultValue={currentQ ?? ''}
            onKeyDown={e => { if (e.key === 'Enter') { update('q', (e.target as HTMLInputElement).value || null); setMobileOpen(false); } }}
            style={{ width: '100%', paddingLeft: 36, paddingRight: 12, paddingTop: 9, paddingBottom: 9, borderRadius: 8, border: '1px solid #eeeeee', fontFamily: 'Glegoo, serif', fontWeight: 700, fontSize: '0.85rem', color: '#413734', outline: 'none', background: '#fff', boxSizing: 'border-box' }}
            className="focus:border-[#ff7044] transition-colors"
          />
        </div>
      </div>

      <div>
        <label style={labelStyle}>Park Type</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <button onClick={() => update('type', null)} style={mobileFilterBtn(!currentType)} className="hover:bg-[#fff3f0] hover:text-[#ff7044]">All Types</button>
          {types.map(t => (
            <button key={t} onClick={() => update('type', currentType === t ? null : t)} style={mobileFilterBtn(currentType === t)} className="hover:bg-[#fff3f0] hover:text-[#ff7044]">{t}</button>
          ))}
        </div>
      </div>

      <div>
        <label style={labelStyle}>Region</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <button onClick={() => update('region', null)} style={mobileFilterBtn(!currentRegion)} className="hover:bg-[#fff3f0] hover:text-[#ff7044]">All Regions</button>
          {regions.map(r => (
            <button key={r} onClick={() => update('region', currentRegion === r ? null : r)} style={mobileFilterBtn(currentRegion === r)} className="hover:bg-[#fff3f0] hover:text-[#ff7044]">{r}</button>
          ))}
        </div>
      </div>

      <div>
        <label style={labelStyle}>Amenities</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {amenities.map(a => {
            const active = currentAmenities.includes(a.key);
            return (
              <button key={a.key} onClick={() => toggleAmenity(a.key)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', background: 'transparent', fontFamily: 'Archivo, sans-serif', fontSize: '0.85rem', fontWeight: 500, color: '#726d6b', textAlign: 'left', width: '100%' }}
                className="hover:bg-[#f9f7f5]">
                <span style={{ width: 16, height: 16, borderRadius: 4, flexShrink: 0, border: `2px solid ${active ? '#ff7044' : '#dfdfdf'}`, background: active ? '#ff7044' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
                  {active && <span style={{ color: '#fff', fontSize: 10, lineHeight: 1, fontWeight: 700 }}>✓</span>}
                </span>
                {a.label}
              </button>
            );
          })}
        </div>
      </div>

      {hasFilters && (
        <button onClick={clearAll} style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Archivo, sans-serif', fontSize: '0.82rem', fontWeight: 700, color: '#ff7044', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }} className="hover:opacity-70 transition-opacity">
          <X size={13} /> Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* ── Desktop: horizontal inline filter bar ────────────────── */}
      <div className="filter-bar-desktop" ref={barRef}>

        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
          <Search size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#ff7044', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Search Florida parks…"
            defaultValue={currentQ ?? ''}
            onKeyDown={e => { if (e.key === 'Enter') update('q', (e.target as HTMLInputElement).value || null); }}
            style={{
              width: '100%', paddingLeft: 46, paddingRight: 16, paddingTop: 11, paddingBottom: 11,
              borderRadius: '2.3em',
              border: `1.5px solid ${currentQ ? '#ff7044' : '#dfdfdf'}`,
              fontFamily: 'Glegoo, serif', fontWeight: 700, fontSize: '0.88rem',
              color: '#413734', outline: 'none', background: '#fff',
              boxShadow: '0 2px 10px rgba(54,47,53,0.07)',
              boxSizing: 'border-box', transition: 'border-color 0.15s',
            }}
            className="focus:border-[#ff7044]"
          />
        </div>

        {/* Park Type dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setOpenPanel(openPanel === 'type' ? null : 'type')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '10px 16px', borderRadius: '2.3em',
              border: `1.5px solid ${currentType || openPanel === 'type' ? '#ff7044' : '#dfdfdf'}`,
              background: currentType ? '#fff3f0' : '#fff',
              fontFamily: 'Archivo, sans-serif', fontWeight: currentType ? 700 : 500,
              fontSize: '0.85rem', color: currentType ? '#ff7044' : openPanel === 'type' ? '#362f35' : '#726d6b',
              cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s',
            }}
          >
            {currentType ?? 'Park Type'}
            <ChevronDown size={13} style={{ transition: 'transform 0.15s', transform: openPanel === 'type' ? 'rotate(180deg)' : 'none' }} />
          </button>
          {openPanel === 'type' && (
            <div style={{ ...panelStyle, minWidth: 220 }}>
              <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                {[{ label: 'All Types', value: null }, ...types.map(t => ({ label: t, value: t }))].map(({ label, value }) => {
                  const active = value === null ? !currentType : currentType === value;
                  return (
                    <button key={label}
                      onClick={() => { update('type', value === null ? null : (currentType === value ? null : value)); setOpenPanel(null); }}
                      style={{ width: '100%', textAlign: 'left', padding: '9px 16px', border: 'none', background: active ? '#fff3f0' : 'transparent', fontFamily: 'Archivo, sans-serif', fontSize: '0.85rem', fontWeight: active ? 700 : 400, color: active ? '#ff7044' : '#413734', cursor: 'pointer' }}
                      className="hover:bg-[#f9f7f5]">
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Region dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setOpenPanel(openPanel === 'region' ? null : 'region')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '10px 16px', borderRadius: '2.3em',
              border: `1.5px solid ${currentRegion || openPanel === 'region' ? '#ff7044' : '#dfdfdf'}`,
              background: currentRegion ? '#fff3f0' : '#fff',
              fontFamily: 'Archivo, sans-serif', fontWeight: currentRegion ? 700 : 500,
              fontSize: '0.85rem', color: currentRegion ? '#ff7044' : openPanel === 'region' ? '#362f35' : '#726d6b',
              cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s',
            }}
          >
            {currentRegion ?? 'Region'}
            <ChevronDown size={13} style={{ transition: 'transform 0.15s', transform: openPanel === 'region' ? 'rotate(180deg)' : 'none' }} />
          </button>
          {openPanel === 'region' && (
            <div style={{ ...panelStyle, minWidth: 220 }}>
              <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                {[{ label: 'All Regions', value: null }, ...regions.map(r => ({ label: r, value: r }))].map(({ label, value }) => {
                  const active = value === null ? !currentRegion : currentRegion === value;
                  return (
                    <button key={label}
                      onClick={() => { update('region', value === null ? null : (currentRegion === value ? null : value)); setOpenPanel(null); }}
                      style={{ width: '100%', textAlign: 'left', padding: '9px 16px', border: 'none', background: active ? '#fff3f0' : 'transparent', fontFamily: 'Archivo, sans-serif', fontSize: '0.85rem', fontWeight: active ? 700 : 400, color: active ? '#ff7044' : '#413734', cursor: 'pointer' }}
                      className="hover:bg-[#f9f7f5]">
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Amenities dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setOpenPanel(openPanel === 'amenities' ? null : 'amenities')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '10px 16px', borderRadius: '2.3em',
              border: `1.5px solid ${currentAmenities.length > 0 || openPanel === 'amenities' ? '#ff7044' : '#dfdfdf'}`,
              background: currentAmenities.length > 0 ? '#fff3f0' : '#fff',
              fontFamily: 'Archivo, sans-serif', fontWeight: currentAmenities.length > 0 ? 700 : 500,
              fontSize: '0.85rem', color: currentAmenities.length > 0 ? '#ff7044' : openPanel === 'amenities' ? '#362f35' : '#726d6b',
              cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s',
            }}
          >
            Amenities
            {currentAmenities.length > 0 && (
              <span style={{ background: '#ff7044', color: '#fff', fontSize: '0.65rem', fontWeight: 700, borderRadius: '50%', width: 17, height: 17, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                {currentAmenities.length}
              </span>
            )}
            <ChevronDown size={13} style={{ transition: 'transform 0.15s', transform: openPanel === 'amenities' ? 'rotate(180deg)' : 'none' }} />
          </button>
          {openPanel === 'amenities' && (
            <div style={{ ...panelStyle, minWidth: 220 }}>
              <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                {amenities.map(a => {
                  const active = currentAmenities.includes(a.key);
                  return (
                    <button key={a.key} onClick={() => toggleAmenity(a.key)}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 16px', border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'Archivo, sans-serif', fontSize: '0.85rem', color: '#413734', textAlign: 'left' }}
                      className="hover:bg-[#f9f7f5]">
                      <span style={{ width: 16, height: 16, borderRadius: 4, flexShrink: 0, border: `2px solid ${active ? '#ff7044' : '#dfdfdf'}`, background: active ? '#ff7044' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
                        {active && <span style={{ color: '#fff', fontSize: 10, lineHeight: 1, fontWeight: 700 }}>✓</span>}
                      </span>
                      {a.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Clear all */}
        {hasFilters && (
          <button onClick={clearAll}
            style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'Archivo, sans-serif', fontSize: '0.82rem', fontWeight: 700, color: '#a6967c', background: 'none', border: 'none', cursor: 'pointer', padding: '10px 4px', whiteSpace: 'nowrap' }}
            className="hover:text-[#ff7044] transition-colors">
            <X size={13} /> Clear
          </button>
        )}
      </div>

      {/* ── Mobile trigger ───────────────────────────────────────── */}
      <div className="filter-mobile-btn" style={{ alignItems: 'center', gap: 10 }}>
        <button
          onClick={() => setMobileOpen(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: hasFilters ? '#fff3f0' : '#f5f3f0',
            border: `1.5px solid ${hasFilters ? '#ff7044' : '#eeeeee'}`,
            borderRadius: '2.3em', padding: '9px 18px',
            fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: '0.85rem',
            color: hasFilters ? '#ff7044' : '#726d6b', cursor: 'pointer',
          }}
        >
          <SlidersHorizontal size={15} />
          Filters
          {activeCount > 0 && (
            <span style={{ background: '#ff7044', color: '#fff', fontSize: '0.68rem', fontWeight: 700, borderRadius: '50%', width: 18, height: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>
              {activeCount}
            </span>
          )}
        </button>
        {hasFilters && (
          <button onClick={clearAll} style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.78rem', fontWeight: 600, color: '#a6967c', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            Clear
          </button>
        )}
      </div>

      {/* ── Mobile drawer ────────────────────────────────────────── */}
      {mobileOpen && (
        <>
          <div onClick={() => setMobileOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 40 }} />
          <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50, background: '#fff', borderRadius: '20px 20px 0 0', maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 -4px 32px rgba(0,0,0,0.12)' }}>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0' }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: '#dfdfdf' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px 16px' }}>
              <span style={{ fontFamily: 'Shrikhand, cursive', fontWeight: 400, fontSize: '1.4rem', color: '#362f35', letterSpacing: '-0.03em' }}>Filter Parks</span>
              <button onClick={() => setMobileOpen(false)} style={{ background: '#f5f3f0', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#726d6b' }}>
                <X size={16} />
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 8px' }}>
              {renderMobileFilters()}
            </div>
            <div style={{ padding: '16px 20px', borderTop: '1px solid #eeeeee' }}>
              <button onClick={() => setMobileOpen(false)} style={{ width: '100%', background: '#ff7044', color: '#fff', border: 'none', borderRadius: '2.3em', padding: '12px', fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }} className="hover:opacity-85 transition-opacity">
                {parkCount != null ? `Show ${parkCount} Park${parkCount !== 1 ? 's' : ''}` : 'Done'}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
