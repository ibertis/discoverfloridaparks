import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';

// PNG pixel bounds of the actual Florida shape (measured via alpha channel scan)
const CONTENT_X_MIN = 290, CONTENT_X_MAX = 931;
const CONTENT_Y_MIN = 7,   CONTENT_Y_MAX = 623;

// Geographic bounding box
const LAT_MAX = 31.0, LAT_MIN = 24.4;
const LNG_MIN = -87.6, LNG_MAX = -80.0;
const PNG_W = 1277, PNG_H = 631;

function toSvg(lat: number, lng: number) {
  const x = CONTENT_X_MIN + (lng - LNG_MIN) / (LNG_MAX - LNG_MIN) * (CONTENT_X_MAX - CONTENT_X_MIN);
  const y = CONTENT_Y_MIN + (LAT_MAX - lat) / (LAT_MAX - LAT_MIN) * (CONTENT_Y_MAX - CONTENT_Y_MIN);
  return { x: Math.round(x), y: Math.round(y) };
}

export default async function HomeMapSection({ totalCount }: { totalCount?: number }) {
  const { data: parks } = await supabase
    .from('parks')
    .select('id, slug, name, latitude, longitude')
    .gte('latitude', 24.0)
    .lte('latitude', 31.5)
    .lte('longitude', -79.0)
    .gte('longitude', -88.0)
    .order('name');

  const pins = (parks ?? [])
    .map(p => ({ ...toSvg(p.latitude, p.longitude), slug: p.slug, name: p.name }));

  return (
    <section style={{ background: '#f5f1ec', padding: '80px 24px 0', overflow: 'hidden' }}>
      <div style={{ maxWidth: 1278, margin: '0 auto', position: 'relative', minHeight: 480 }}>

        {/* Text — top left */}
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 320, paddingBottom: 48 }}>
          <p style={{
            fontFamily: 'Archivo, sans-serif', fontSize: '0.82rem', fontWeight: 600,
            color: '#a6967c', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 10px',
          }}>
            Beautiful Florida Parks
          </p>
          <h2 style={{
            fontFamily: 'Shrikhand, cursive', fontWeight: 400,
            fontSize: 'clamp(2.8rem, 4.5vw, 4.8rem)', lineHeight: 0.93,
            color: '#362f35', margin: '0 0 24px', letterSpacing: '-0.04em',
          }}>
            In Our<br />Backyard
          </h2>
          <p style={{
            fontFamily: 'Glegoo, serif', fontWeight: 700, fontSize: '0.88rem',
            color: '#726d6b', lineHeight: 1.65, margin: '0 0 32px', maxWidth: 260,
          }}>
            {totalCount ?? pins.length} parks, preserves, and outdoor gems — all across the Sunshine State.
          </p>
          <Link
            href="/map"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#ff7044', color: '#fff', borderRadius: '2.3em',
              padding: '13px 30px', fontFamily: 'Archivo, sans-serif',
              fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none',
            }}
            className="hover:opacity-90 transition-opacity"
          >
            Explore the Map →
          </Link>
        </div>

        {/* Florida PNG + pin overlay — positioned right, slightly overflowing */}
        <div style={{
          position: 'absolute', right: -40, top: -20,
          width: 936, height: 463, pointerEvents: 'none',
        }}
          className="home-map-hide-mobile"
        >
          {/* PNG silhouette */}
          <Image
            src="/florida-map.png"
            alt=""
            fill
            style={{ objectFit: 'contain', objectPosition: 'center' }}
            aria-hidden
          />

          {/* Pin overlay — viewBox matches PNG pixel dimensions */}
          <svg
            viewBox={`0 0 ${PNG_W} ${PNG_H}`}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <defs>
              <filter id="pin-shadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#00000033" />
              </filter>
            </defs>
            {pins.map((pin, i) => (
              <g key={i} transform={`translate(${pin.x}, ${pin.y})`} filter="url(#pin-shadow)">
                <path d="M 0,13 L -7,1 A 7,7 0 1,1 7,1 Z" fill="#ff7044" />
                <circle cx="0" cy="-1" r="2.8" fill="rgba(255,255,255,0.55)" />
              </g>
            ))}
          </svg>
        </div>

      </div>
    </section>
  );
}
