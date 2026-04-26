import type { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import SiteHeader from '../SiteHeader';
import SiteFooter from '../SiteFooter';
import MapLoader from './MapLoader';

async function getParkCount(): Promise<number> {
  const { count } = await supabase
    .from('parks')
    .select('*', { count: 'exact', head: true })
    .neq('latitude', 0)
    .neq('longitude', 0)
    .not('latitude', 'is', null)
    .not('longitude', 'is', null);
  return count ?? 0;
}

export async function generateMetadata(): Promise<Metadata> {
  const count = await getParkCount();
  return {
    title: 'Interactive Park Map — Discover Florida Parks',
    description: `Explore all ${count} Florida parks on an interactive map. Click any marker to learn more.`,
    openGraph: {
      title: 'Interactive Florida Parks Map',
      description: `Explore all ${count} Florida parks on an interactive map. Click any marker to learn more.`,
      url: 'https://discoverfloridaparks.com/map',
      images: [{ url: 'https://discoverfloridaparks.com/hero-3.jpg', width: 1280, height: 853, alt: 'Florida Parks Interactive Map' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Interactive Florida Parks Map',
      description: `Explore all ${count} Florida parks on an interactive map.`,
      images: ['https://discoverfloridaparks.com/hero-3.jpg'],
    },
    alternates: { canonical: 'https://discoverfloridaparks.com/map' },
  };
}

export default async function MapPage() {
  const { data: parks } = await supabase
    .from('parks')
    .select('id, slug, name, park_types, latitude, longitude, google_rating, featured_image_url, short_description')
    .neq('latitude', 0)
    .neq('longitude', 0)
    .not('latitude', 'is', null)
    .not('longitude', 'is', null)
    .order('name');

  return (
    <div style={{ background: '#fff' }}>

      <SiteHeader />

      {/* Map — fills viewport below header */}
      <div style={{ minHeight: 400 }} className="map-viewport">
        <MapLoader parks={parks ?? []} />
      </div>

      <SiteFooter />
    </div>
  );
}
