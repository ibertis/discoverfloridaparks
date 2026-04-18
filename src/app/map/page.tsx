import type { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import SiteHeader from '../SiteHeader';
import SiteFooter from '../SiteFooter';
import MapLoader from './MapLoader';

export const metadata: Metadata = {
  title: 'Interactive Park Map — Discover Florida Parks',
  description: 'Explore all 49 Florida parks on an interactive map. Click any marker to learn more.',
};

export default async function MapPage() {
  const { data: parks } = await supabase
    .from('parks')
    .select('id, slug, name, park_type, latitude, longitude, google_rating, featured_image_url, short_description')
    .gte('latitude', 24.0)
    .lte('latitude', 31.5)
    .gte('longitude', -88.0)
    .lte('longitude', -79.0)
    .order('name');

  return (
    <div style={{ background: '#fff' }}>

      <SiteHeader />

      {/* Page title bar */}
      <div style={{
        background: '#f9f7f5', borderBottom: '1px solid #eeeeee',
        padding: '20px 24px',
      }}>
        <div style={{ maxWidth: 1278, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.75rem', fontWeight: 600, color: '#a6967c', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px' }}>
              Interactive Map
            </p>
            <h1 style={{ fontFamily: 'Shrikhand, cursive', fontWeight: 400, fontSize: '2rem', color: '#362f35', margin: 0, letterSpacing: '-0.04em', lineHeight: 1 }}>
              Florida Parks Map
            </h1>
          </div>
          <p style={{ fontFamily: 'Glegoo, serif', fontWeight: 700, fontSize: '0.85rem', color: '#a6967c', margin: 0 }}>
            {parks?.length ?? 0} parks — click any marker to explore
          </p>
        </div>
      </div>

      {/* Map — fills viewport below header + title bar */}
      <div style={{ height: 'calc(100dvh - 108px - 81px)', minHeight: 400 }}>
        <MapLoader parks={parks ?? []} />
      </div>

      <SiteFooter />
    </div>
  );
}
