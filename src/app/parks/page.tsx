import type { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import FilterBar from './FilterBar';
import SiteHeader from '../SiteHeader';
import SiteFooter from '../SiteFooter';
import FooterLinks from '../FooterLinks';
import ParkCard from '@/components/ParkCard';
import AdUnit from '@/components/AdUnit';

export const dynamic = 'force-dynamic';

export async function generateMetadata(
  { searchParams }: { searchParams: Promise<SearchParams> }
): Promise<Metadata> {
  const { type } = await searchParams;

  let title: string;
  let description: string;

  if (type) {
    title = `Florida ${type} | Discover Florida Parks`;
    description = `Browse Florida ${type} across the state. Filter by region and amenities to find your perfect outdoor destination.`;
  } else {
    const { count } = await supabase
      .from('parks')
      .select('*', { count: 'exact', head: true });
    const n = count ?? 263;
    title = `Florida Parks Directory — ${n} State Parks, National Parks & More | Discover Florida Parks`;
    description = `Browse hundreds of Florida parks — state parks, national parks, wildlife refuges, and more. Filter by type, region, and amenities to plan your next adventure.`;
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: 'https://discoverfloridaparks.com/parks',
      images: [{ url: 'https://discoverfloridaparks.com/hero-2.jpg', width: 1280, height: 853, alt: 'Florida Parks Directory' }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['https://discoverfloridaparks.com/hero-2.jpg'],
    },
    alternates: { canonical: 'https://discoverfloridaparks.com/parks' },
  };
}

const PARK_TYPES = [
  'National Parks', 'State Parks', 'National Wildlife Refuge',
  'County Parks', 'Community Parks', 'Theme Parks', 'Water Parks',
  'National Estuarine Research Reserve', 'Preserve', 'Sanctuary', 'State Forest',
];

const REGIONS = [
  'Florida Panhandle',
  'North Florida', 'Northeast Florida', 'Central Florida',
  'Tampa Bay & West Coast',
  'Southwest Florida', 'Southeast Florida', 'South Florida',
  'Florida Keys',
];

const AMENITY_OPTIONS = [
  { key: 'dog_friendly',        label: 'Dog Friendly' },
  { key: 'camping_available',   label: 'Camping' },
  { key: 'swimming_allowed',    label: 'Swimming' },
  { key: 'fishing_allowed',     label: 'Fishing' },
  { key: 'hiking_available',    label: 'Hiking' },
  { key: 'biking_available',    label: 'Biking' },
  { key: 'horseback_riding',    label: 'Horseback Riding' },
  { key: 'hunting_allowed',     label: 'Hunting' },
  { key: 'paddling_available',  label: 'Paddling' },
  { key: 'wildlife_viewing',    label: 'Wildlife Viewing' },
  { key: 'beach_access',        label: 'Beach Access' },
  { key: 'boat_launch',         label: 'Boat Launch' },
  { key: 'picnic_areas',        label: 'Picnic Areas' },
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
            {type ? `Explore Our ${type}` : 'Explore Our Parks'}
          </h1>
          <p style={{ fontFamily: 'Glegoo, serif', fontWeight: 700, fontSize: '0.95rem', color: '#726d6b', margin: 0 }}>
            {filtered.length} park{filtered.length !== 1 ? 's' : ''}{' '}
            {activeFilters > 0 ? 'match your filters' : 'across Florida'}
          </p>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────── */}
      <div style={{ maxWidth: 1278, margin: '0 auto', padding: '36px 24px 64px' }}>

        {/* Filter bar */}
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

        {/* Grid */}
        <main>
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

      {/* Directory footer ad — full-width above footer */}
      <div style={{ maxWidth: 1278, margin: '4rem auto 0', padding: '0 24px' }}>
        <AdUnit
          slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_DIRECTORY_FOOTER!}
          format="horizontal"
          style={{ minHeight: '90px' }}
        />
      </div>

      <FooterLinks />
      <SiteFooter />
    </div>
  );
}

