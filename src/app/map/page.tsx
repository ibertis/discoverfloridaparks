import type { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import SiteHeader from '../SiteHeader';
import SiteFooter from '../SiteFooter';
import MapLoader from './MapLoader';

export const metadata: Metadata = {
  title: 'Interactive Park Map — Discover Florida Parks',
  description: 'Explore all 49 Florida parks on an interactive map. Click any marker to learn more.',
  openGraph: {
    title: 'Interactive Florida Parks Map',
    description: 'Explore all 49 Florida parks on an interactive map. Click any marker to learn more.',
    url: 'https://discoverfloridaparks.com/map',
    images: [{ url: 'https://discoverfloridaparks.com/hero-3.jpg', width: 1280, height: 853, alt: 'Florida Parks Interactive Map' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Interactive Florida Parks Map',
    description: 'Explore all 49 Florida parks on an interactive map.',
    images: ['https://discoverfloridaparks.com/hero-3.jpg'],
  },
  alternates: { canonical: 'https://discoverfloridaparks.com/map' },
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

      {/* Map — fills viewport below header */}
      <div style={{ minHeight: 400 }} className="map-viewport">
        <MapLoader parks={parks ?? []} />
      </div>

      <SiteFooter />
    </div>
  );
}
