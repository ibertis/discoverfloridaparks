'use client';

import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useEffect, useRef, useState } from 'react';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

interface Park {
  id: string;
  slug: string;
  name: string;
  park_type: string;
  latitude: number;
  longitude: number;
  google_rating?: number;
  featured_image_url?: string;
  short_description?: string;
}

const TYPE_FILTERS = [
  'All',
  'National Parks',
  'State Parks',
  'National Wildlife Refuge',
  'Theme Parks',
  'Water Parks',
  'County Parks',
];

const PIN_SVG = `
  <svg width="26" height="34" viewBox="0 0 26 34" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13 0C5.82 0 0 5.82 0 13C0 22.75 13 34 13 34C13 34 26 22.75 26 13C26 5.82 20.18 0 13 0Z" fill="#ff7044"/>
    <circle cx="13" cy="13" r="5" fill="rgba(255,255,255,0.55)"/>
  </svg>
`;

export default function ParkMap({ parks }: { parks: Park[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const activeTypeRef = useRef('All');
  const [activeType, setActiveType] = useState('All');

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
      renderMarkers(map, parks, activeTypeRef.current);
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    activeTypeRef.current = activeType;
    if (!mapRef.current?.loaded()) return;
    renderMarkers(mapRef.current, parks, activeType);
  }, [activeType, parks]);

  function renderMarkers(map: mapboxgl.Map, allParks: Park[], type: string) {
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const filtered = type === 'All' ? allParks : allParks.filter(p => p.park_type === type);

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
              ${park.park_type || 'Park'}
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Filter chips */}
      <div style={{
        background: '#fff', borderBottom: '1px solid #eeeeee',
        padding: '10px 24px', display: 'flex', gap: 8, flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        <span style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.75rem', fontWeight: 600, color: '#a6967c', marginRight: 4 }}>
          Filter:
        </span>
        {TYPE_FILTERS.map(type => (
          <button
            key={type}
            onClick={() => setActiveType(type)}
            style={{
              padding: '5px 14px', borderRadius: '2.3em', border: '1.5px solid',
              borderColor: activeType === type ? '#ff7044' : '#dfdfdf',
              background: activeType === type ? '#ff7044' : '#fff',
              color: activeType === type ? '#fff' : '#726d6b',
              fontFamily: 'Archivo, sans-serif', fontSize: '0.78rem', fontWeight: 700,
              cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            {type}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', fontFamily: 'Archivo, sans-serif', fontSize: '0.78rem', fontWeight: 600, color: '#a6967c', whiteSpace: 'nowrap' }}>
          {parks.length} parks
        </span>
      </div>

      {/* Map container */}
      <div ref={containerRef} style={{ flex: 1, minHeight: 0 }} />
    </div>
  );
}
