import type { Metadata } from 'next';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { MapPin, Star, ArrowRight } from 'lucide-react';
import FilterBar from './FilterBar';
import SiteHeader from '../SiteHeader';
import SiteFooter from '../SiteFooter';
import FooterLinks from '../FooterLinks';

export const metadata: Metadata = {
  title: 'Explore Florida Parks',
  description: 'Browse all 49 Florida parks, nature preserves, and outdoor attractions. Filter by type, region, and amenities.',
};

const PARK_TYPES = [
  'National Parks', 'State Parks', 'National Wildlife Refuge',
  'County Parks', 'Community Parks', 'Theme Parks',
  'Water Parks', 'Seasonal Attractions', 'National Estuarine Research Reserve',
];

const REGIONS = [
  'South Florida', 'Central Florida', 'East Coast',
  'North Florida', 'Northwest Florida / Panhandle',
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
    .select('id, slug, name, short_description, park_type, park_region, featured_image_url, google_rating, crowd_level, is_featured, park_amenities(*)')
    .order('is_featured', { ascending: false })
    .order('name', { ascending: true });

  if (type)   query = query.eq('park_type', type);
  if (region) query = query.eq('park_region', region);
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
            Explore Florida Parks
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

function ParkCard({ park }: { park: any }) {
  return (
    <Link href={`/parks/${park.slug}`}
      style={{ display: 'flex', flexDirection: 'column', borderRadius: 16, overflow: 'hidden', border: '1px solid #eeeeee', background: '#fff', transition: 'box-shadow 0.2s', textDecoration: 'none' }}
      className="group hover:shadow-lg">

      <div style={{ position: 'relative', height: 200, overflow: 'hidden', background: '#e8e0d6' }}>
        {park.featured_image_url ? (
          <img src={park.featured_image_url} alt={park.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
            className="group-hover:scale-105" />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MapPin size={32} style={{ color: '#a6967c' }} />
          </div>
        )}
        {park.park_type && (
          <span style={{ position: 'absolute', top: 12, right: 12, background: '#ff7044', color: '#fff', borderRadius: '2.3em', padding: '4px 12px', fontFamily: 'Archivo, sans-serif', fontSize: '0.72rem', fontWeight: 700 }}>
            {park.park_type}
          </span>
        )}
      </div>

      <div style={{ padding: '18px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontFamily: 'Shrikhand, cursive', fontWeight: 400, fontSize: '1.5rem', lineHeight: 1.05, color: '#362f35', margin: '0 0 6px', letterSpacing: '-0.04em' }}>
          {park.name}
        </h3>
        {park.park_region && (
          <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.78rem', color: '#a6967c', display: 'flex', alignItems: 'center', gap: 4, margin: '0 0 10px' }}>
            <MapPin size={11} /> {park.park_region}
          </p>
        )}
        {park.short_description && (
          <p style={{ fontFamily: 'Glegoo, serif', fontWeight: 700, fontSize: '0.82rem', color: '#726d6b', lineHeight: 1.55, flex: 1, margin: '0 0 14px',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {park.short_description}
          </p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {park.google_rating ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'Archivo, sans-serif', fontSize: '0.78rem', fontWeight: 700, color: '#e8a020' }}>
              <Star size={13} fill="currentColor" /> {park.google_rating}
            </span>
          ) : <span />}
          <span style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.78rem', fontWeight: 700, color: '#ff7044', display: 'flex', alignItems: 'center', gap: 4 }}>
            Explore <ArrowRight size={13} />
          </span>
        </div>
      </div>
    </Link>
  );
}
