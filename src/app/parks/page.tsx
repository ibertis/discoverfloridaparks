import type { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import FilterBar from './FilterBar';
import SiteHeader from '../SiteHeader';
import SiteFooter from '../SiteFooter';
import FooterLinks from '../FooterLinks';
import ParkCard from '@/components/ParkCard';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Explore Florida Parks',
  description: 'Browse all 49 Florida parks, nature preserves, and outdoor attractions. Filter by type, region, and amenities.',
  openGraph: {
    title: 'Explore Florida Parks',
    description: 'Browse all 49 Florida parks, nature preserves, and outdoor attractions. Filter by type, region, and amenities.',
    url: 'https://discoverfloridaparks.com/parks',
    images: [{ url: 'https://discoverfloridaparks.com/hero-2.jpg', width: 1280, height: 853, alt: 'Florida Parks Directory' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Explore Florida Parks',
    description: 'Browse all 49 Florida parks, nature preserves, and outdoor attractions.',
    images: ['https://discoverfloridaparks.com/hero-2.jpg'],
  },
  alternates: { canonical: 'https://discoverfloridaparks.com/parks' },
};

const PARK_TYPES = [
  'National Parks', 'State Parks', 'National Wildlife Refuge',
  'County Parks', 'Community Parks', 'Theme Parks',
  'Water Parks', 'Seasonal Attractions', 'National Estuarine Research Reserve',
];

const REGIONS = [
  'North Florida', 'Northeast Florida', 'Central Florida',
  'Southwest Florida', 'Southeast Florida', 'South Florida',
  'Northwest Florida / Panhandle', 'East Coast', 'West Coast',
];

const AMENITY_OPTIONS = [
  { key: 'dog_friendly',      label: 'Dog Friendly' },
  { key: 'camping_available', label: 'Camping' },
  { key: 'swimming_allowed',  label: 'Swimming' },
  { key: 'fishing_allowed',   label: 'Fishing' },
  { key: 'boat_launch',       label: 'Boat Launch' },
  { key: 'picnic_areas',      label: 'Picnic Areas' },
];

interface SearchParams {
  type?: string;
  region?: string;
  amenities?: string;
  q?: string;
}

export default async function ParksPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const { type, region, amenities, q } = params;
  const amenityList = amenities ? amenities.split(',').filter(Boolean) : [];

  let query = supabase
    .from('parks')
    .select('id, slug, name, short_description, park_types, park_regions, featured_image_url, google_rating, crowd_level, is_featured, park_amenities(*)')
    .order('name', { ascending: true });

  if (type)   query = query.contains('park_types', [type]);
  if (region) query = query.contains('park_regions', [region]);
  if (q)      query = query.ilike('name', `%${q}%`);

  const { data: parks } = await query;
  const allParks = parks ?? [];

  const filtered = amenityList.length
    ? allParks.filter(p => {
        const a = (p as any).park_amenities ?? {};
        return amenityList.every(k => a[k] === true);
      })
    : allParks;

  const activeFilters = [type, region, ...amenityList, q].filter(Boolean).length;

  return (
    <div style={{ background: '#fff', color: '#413734', minHeight: '100vh' }}>

      <SiteHeader />

      {/* ── Page Banner ───────────────────────────────────────── */}
      <div style={{ background: '#f9f7f5', borderBottom: '1px solid #eeeeee', padding: '56px 24px' }}>
        <div style={{ maxWidth: 1278, margin: '0 auto' }}>
          <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.85rem', fontWeight: 600, color: '#a6967c', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
            Find Your Next Adventure
          </p>
          <h1 style={{ fontFamily: 'Shrikhand, cursive', fontWeight: 400, fontSize: 'clamp(2.5rem, 5vw, 4.14rem)', lineHeight: 0.98, color: '#362f35', margin: '0 0 12px', letterSpacing: '-0.04em' }}>
            Explore Our Parks
          </h1>
          <p style={{ fontFamily: 'Glegoo, serif', fontWeight: 700, fontSize: '0.95rem', color: '#726d6b', margin: 0 }}>
            {filtered.length} park{filtered.length !== 1 ? 's' : ''}{' '}
            {activeFilters > 0 ? 'match your filters' : 'across Florida'}
          </p>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────── */}
      <div className="parks-page-layout" style={{ maxWidth: 1278, margin: '0 auto', padding: '48px 24px' }}>

        {/* Sidebar */}
        <aside className="park-sidebar">
          <FilterBar
            types={PARK_TYPES}
            regions={REGIONS}
            amenities={AMENITY_OPTIONS}
            currentType={type}
            currentRegion={region}
            currentAmenities={amenityList}
            currentQ={q}
            parkCount={filtered.length}
          />
        </aside>

        {/* Grid */}
        <main style={{ flex: 1 }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <p style={{ fontFamily: 'Shrikhand, cursive', fontWeight: 400, fontSize: '2rem', color: '#362f35', margin: '0 0 12px', letterSpacing: '-0.04em' }}>
                No parks match your filters
              </p>
              <p style={{ fontFamily: 'Glegoo, serif', fontWeight: 700, fontSize: '0.9rem', color: '#a6967c', margin: 0 }}>
                Try removing a filter to see more results.
              </p>
            </div>
          ) : (
            <div className="park-cards-grid">
              {filtered.map(park => <ParkCard key={park.id} park={park} />)}
            </div>
          )}
        </main>
      </div>

      <FooterLinks />
      <SiteFooter />
    </div>
  );
}

