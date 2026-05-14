'use client';

import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useEffect, useRef, useState } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

interface Park {
  id: string;
  slug: string;
  name: string;
  park_types: string[];
  latitude: number;
  longitude: number;
  google_rating?: number;
  featured_image_url?: string;
  short_description?: string;
  park_amenities?: any[] | null;
}

const TYPE_FILTERS = [
  'National Parks',
  'State Parks',
  'State Forest',
  'National Wildlife Refuge',
  'Theme Parks',
  'Water Parks',
  'County Parks',
  'Community Parks',
  'Seasonal Attractions',
  'National Estuarine Research Reserve',
  'Wildlife Preserve',
];

const AMENITY_OPTIONS = [
  { key: 'dog_friendly',       label: 'Dog Friendly'      },
  { key: 'camping_available',  label: 'Camping'           },
  { key: 'swimming_allowed',   label: 'Swimming'          },
  { key: 'fishing_allowed',    label: 'Fishing'           },
  { key: 'hiking_available',   label: 'Hiking'            },
  { key: 'biking_available',   label: 'Biking'            },
  { key: 'horseback_riding',   label: 'Horseback Riding'  },
  { key: 'hunting_allowed',    label: 'Hunting'           },
  { key: 'paddling_available', label: 'Paddling'          },
  { key: 'wildlife_viewing',   label: 'Wildlife Viewing'  },
  { key: 'beach_access',       label: 'Beach Access'      },
  { key: 'boat_launch',        label: 'Boat Launch'       },
  { key: 'picnic_areas',       label: 'Picnic Areas'      },
];

const PIN_SVG = `
  <svg width="26" height="34" viewBox="0 0 26 34" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13 0C5.82 0 0 5.82 0 13C0 22.75 13 34 13 34C13 34 26 22.75 26 13C26 5.82 20.18 0 13 0Z" fill="#ff7044"/>
    <circle cx="13" cy="13" r="5" fill="rgba(255,255,255,0.55)"/>
  </svg>
`;

export default function ParkMap({ parks }: { parks: Park[] }) {
  const containerRef   = useRef<HTMLDivElement>(null);
  const mapRef         = useRef<mapboxgl.Map | null>(null);
  const markersRef     = useRef<mapboxgl.Marker[]>([]);
  const activeTypeRef  = useRef('All');
  const searchRef      = useRef('');
  const amenitiesRef   = useRef<string[]>([]);
  const barRef         = useRef<HTMLDivElement>(null);

  const [activeType,    setActiveType]    = useState('All');
  const [search,        setSearch]        = useState('');
  const [amenities,     setAmenities]     = useState<string[]>([]);
  const [openPanel,     setOpenPanel]     = useState<'type' | 'amenities' | null>(null);
  const [visibleCount,  setVisibleCount]  = useState(parks.length);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setOpenPanel(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/outdoors-v12',
      bounds: [[-87.6, 24.3], [-79.8, 31.1]],
      fitBoundsOptions: { padding: 40 },
    });

    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    mapRef.current = map;

    map.on('load', () => {
      renderMarkers(map, parks, activeTypeRef.current, searchRef.current, amenitiesRef.current);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    activeTypeRef.current = activeType;
    searchRef.current = search;
    amenitiesRef.current = amenities;
    if (!mapRef.current?.loaded()) return;
    renderMarkers(mapRef.current, parks, activeType, search, amenities);
  }, [activeType, search, amenities, parks]);

  function renderMarkers(
    map: mapboxgl.Map,
    allParks: Park[],
    type: string,
    query: string,
    selectedAmenities: string[],
  ) {
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    let filtered = type === 'All' ? allParks : allParks.filter(p => p.park_types?.includes(type));

    if (query.trim()) {
      const q = query.toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(q));
    }

    if (selectedAmenities.length > 0) {
      filtered = filtered.filter(p => {
        const a = (p.park_amenities?.[0] ?? {}) as Record<string, boolean>;
        return selectedAmenities.every(k => a[k] === true);
      });
    }

    setVisibleCount(filtered.length);

    filtered.forEach(park => {
      if (!park.latitude || !park.longitude) return;

      const el = document.createElement('div');
      el.innerHTML = PIN_SVG;
      el.style.cursor = 'pointer';

      const popup = new mapboxgl.Popup({ maxWidth: '240px', offset: 36 })
        .setHTML(`
          <div style="font-family:Archivo,sans-serif;padding:2px">
            ${park.featured_image_url
              ? `<img src="${park.featured_image_url}" alt="${park.name}" style="width:100%;height:110px;object-fit:cover;border-radius:10px;margin-bottom:10px;display:block"/>`
              : ''}
            <span style="background:#ff7044;color:#fff;padding:2px 10px;border-radius:20px;font-size:0.68rem;font-weight:700;font-family:Archivo,sans-serif">
              ${park.park_types?.[0] || 'Park'}
            </span>
            <p style="font-family:Shrikhand,cursive;font-weight:400;font-size:1.1rem;color:#362f35;margin:8px 0 6px;line-height:1">
              ${park.name}
            </p>
            ${park.google_rating
              ? `<p style="font-size:0.75rem;color:#e8a020;font-weight:700;font-family:Archivo,sans-serif;margin:0 0 8px">★ ${park.google_rating}</p>`
              : ''}
            ${park.short_description
              ? `<p style="font-size:0.78rem;color:#726d6b;font-family:Glegoo,serif;line-height:1.5;margin:0 0 10px">${park.short_description.substring(0, 90)}…</p>`
              : ''}
            <a href="/parks/${park.slug}"
              style="display:block;text-align:center;background:#ff7044;color:#fff;padding:9px;border-radius:20px;font-weight:700;font-size:0.82rem;text-decoration:none;font-family:Archivo,sans-serif">
              View Park →
            </a>
          </div>
        `);

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([park.longitude, park.latitude])
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
    });
  }

  function toggleAmenity(key: string) {
    setAmenities(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  }

  const hasFilters = activeType !== 'All' || search.trim() !== '' || amenities.length > 0;

  const dropdownStyle: React.CSSProperties = {
    position: 'absolute', top: 'calc(100% + 8px)', left: 0,
    background: '#fff', border: '1.5px solid #eeeeee',
    borderRadius: 16, boxShadow: '0 8px 32px rgba(54,47,53,0.12)',
    zIndex: 50, minWidth: 230, maxHeight: 320, overflowY: 'auto',
    padding: '8px 0',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Filter bar */}
      <div
        ref={barRef}
        style={{
          background: '#fff', borderBottom: '1px solid #eeeeee',
          padding: '10px 20px', position: 'relative',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, maxWidth: 1278, margin: '0 auto' }}>

          {/* Search */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#fff', borderRadius: '2.3em', padding: '7px 16px',
            border: `1.5px solid ${search ? '#ff7044' : '#dfdfdf'}`,
            boxShadow: '0 2px 10px rgba(54,47,53,0.07)',
            flex: 1, minWidth: 140, maxWidth: 320,
          }}>
            <Search size={14} color="#ff7044" style={{ flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search parks…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                border: 'none', outline: 'none', background: 'transparent',
                fontFamily: 'Archivo, sans-serif', fontSize: '0.82rem',
                color: '#362f35', width: '100%',
              }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
              >
                <X size={13} color="#a6967c" />
              </button>
            )}
          </div>

          {/* Park Type dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setOpenPanel(p => p === 'type' ? null : 'type')}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 14px', borderRadius: '2.3em',
                border: `1.5px solid ${activeType !== 'All' ? '#ff7044' : '#dfdfdf'}`,
                background: activeType !== 'All' ? 'rgba(255,112,68,0.07)' : '#fff',
                color: activeType !== 'All' ? '#ff7044' : '#726d6b',
                fontFamily: 'Archivo, sans-serif', fontSize: '0.82rem', fontWeight: 700,
                cursor: 'pointer', whiteSpace: 'nowrap',
              }}
            >
              {activeType === 'All' ? 'Park Type' : activeType}
              <ChevronDown
                size={13}
                style={{ transition: 'transform 0.15s', transform: openPanel === 'type' ? 'rotate(180deg)' : 'none' }}
              />
            </button>

            {openPanel === 'type' && (
              <div style={dropdownStyle}>
                {['All', ...TYPE_FILTERS].map(type => (
                  <button
                    key={type}
                    onClick={() => { setActiveType(type); setOpenPanel(null); }}
                    style={{
                      display: 'block', width: '100%', textAlign: 'left',
                      padding: '9px 18px',
                      background: activeType === type ? 'rgba(255,112,68,0.07)' : 'transparent',
                      color: activeType === type ? '#ff7044' : '#362f35',
                      fontFamily: 'Archivo, sans-serif', fontSize: '0.85rem',
                      fontWeight: activeType === type ? 700 : 500,
                      border: 'none', cursor: 'pointer',
                    }}
                  >
                    {type === 'All' ? 'All Types' : type}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Amenities dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setOpenPanel(p => p === 'amenities' ? null : 'amenities')}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 14px', borderRadius: '2.3em',
                border: `1.5px solid ${amenities.length > 0 ? '#ff7044' : '#dfdfdf'}`,
                background: amenities.length > 0 ? 'rgba(255,112,68,0.07)' : '#fff',
                color: amenities.length > 0 ? '#ff7044' : '#726d6b',
                fontFamily: 'Archivo, sans-serif', fontSize: '0.82rem', fontWeight: 700,
                cursor: 'pointer', whiteSpace: 'nowrap',
              }}
            >
              Amenities
              {amenities.length > 0 && (
                <span style={{
                  background: '#ff7044', color: '#fff', borderRadius: '50%',
                  width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.65rem', fontWeight: 700, flexShrink: 0,
                }}>
                  {amenities.length}
                </span>
              )}
              <ChevronDown
                size={13}
                style={{ transition: 'transform 0.15s', transform: openPanel === 'amenities' ? 'rotate(180deg)' : 'none' }}
              />
            </button>

            {openPanel === 'amenities' && (
              <div style={dropdownStyle}>
                {AMENITY_OPTIONS.map(({ key, label }) => (
                  <label
                    key={key}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '9px 18px', cursor: 'pointer',
                      background: amenities.includes(key) ? 'rgba(255,112,68,0.07)' : 'transparent',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={amenities.includes(key)}
                      onChange={() => toggleAmenity(key)}
                      style={{ accentColor: '#ff7044', flexShrink: 0 }}
                    />
                    <span style={{
                      fontFamily: 'Archivo, sans-serif', fontSize: '0.85rem',
                      color: amenities.includes(key) ? '#ff7044' : '#362f35',
                      fontWeight: amenities.includes(key) ? 700 : 500,
                    }}>
                      {label}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Clear */}
          {hasFilters && (
            <button
              onClick={() => { setActiveType('All'); setSearch(''); setAmenities([]); setOpenPanel(null); }}
              style={{
                padding: '7px 14px', borderRadius: '2.3em',
                border: '1.5px solid #dfdfdf', background: '#fff',
                color: '#726d6b', fontFamily: 'Archivo, sans-serif',
                fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
              }}
            >
              Clear
            </button>
          )}

          {/* Count */}
          <span style={{
            marginLeft: 'auto', fontFamily: 'Archivo, sans-serif',
            fontSize: '0.78rem', fontWeight: 600, color: '#a6967c', whiteSpace: 'nowrap',
          }}>
            {visibleCount} park{visibleCount !== 1 ? 's' : ''}
          </span>

        </div>
      </div>

      {/* Map */}
      <div ref={containerRef} style={{ flex: 1, minHeight: 0 }} />
    </div>
  );
}
