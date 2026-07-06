import { notFound } from 'next/navigation';
import { cache } from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import {
  MapPin, Phone, Globe, Clock, DollarSign, Star, Users, Calendar,
  Tent, Fish, Waves, Dog, Ship, TreePine, ParkingCircle, AlertTriangle,
  Leaf, Footprints, ArrowLeft, Mail, Hash, Umbrella,
  Bike, Bird, Crosshair, MountainSnow, Sailboat,
} from 'lucide-react';
import Link from 'next/link';
import SiteHeader from '../../SiteHeader';
import SiteFooter from '../../SiteFooter';
import FooterLinks from '../../FooterLinks';
import PhotoGallery from './PhotoGallery';
import WeatherStatCard from './WeatherStatCard';
import ParkMap from './ParkMap';
import HotelReviewsModal from './HotelReviewsModal';
import AdUnit from '@/components/AdUnit';
import GearRecommendations from '@/components/GearRecommendations';
import ExperiencesSection from '@/components/ExperiencesSection';
import type { CatalogExperience } from '@/components/ExperienceCard';
import NewsletterSignup from '@/components/NewsletterSignup';
import AffiliateLink from '@/components/AffiliateLink';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Trail {
  id: string; name: string; difficulty: string; length_miles: number; description: string; sort_order: number;
}
interface FunFact { id: string; fact: string; sort_order: number; }
interface SeasonalEvent { id: string; event_name: string; month: string; description: string; sort_order: number; }
interface OpeningHoursSpec { dayOfWeek: string; opens: string; closes: string; }
interface Park {
  id: string; slug: string; name: string; short_description: string; full_description: string;
  park_types: string[]; park_regions: string[]; activity_types: string[]; county: string; park_status: string;
  featured_image_url: string; gallery_urls: string[];
  address: string; city: string; zip_code: string;
  latitude: number; longitude: number;
  entrance_fee: string; operating_hours: string; website: string; phone: string; email: string;
  google_maps_link: string; google_rating: number; google_review_count: number | null;
  opening_hours_spec: OpeningHoursSpec[] | null;
  managing_agency: string; year_established: number; park_size_acres: number;
  best_season: string; typical_visit_duration: string; crowd_level: string;
  visitor_tips: string; safety_notes: string; parking_info: string;
  wildlife_summary: string; terrain: string; instagram_hashtag: string;
  nearby_cities: string[] | string | null; is_featured: boolean;
  gateway_note: string | null;
  distance_from_miami: number; distance_from_orlando: number; distance_from_tampa: number;
  seo_title: string; seo_description: string;
  reservation_required: boolean; camping_url: string; reservation_url: string;
  updated_at: string;
  park_amenities: {
    dog_friendly: boolean; camping_available: boolean; swimming_allowed: boolean;
    fishing_allowed: boolean; hiking_available: boolean; biking_available: boolean;
    horseback_riding: boolean; hunting_allowed: boolean; paddling_available: boolean;
    wildlife_viewing: boolean; beach_access: boolean; boat_launch: boolean; picnic_areas: boolean;
    visitor_center: boolean; wheelchair_accessible: boolean;
  };
  park_trails: Trail[];
  park_fun_facts: FunFact[];
  park_seasonal_events: SeasonalEvent[];
}

interface NearbyPark {
  id: string; slug: string; name: string; city: string;
  featured_image_url: string | null; latitude: number; longitude: number;
  park_types: string[]; distance: number;
}

function fmtTime(t: string): string {
  const [h, m] = t.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return m === 0 ? `${hour} ${period}` : `${hour}:${m.toString().padStart(2, '0')} ${period}`;
}

// ─── Hotel rating helpers ─────────────────────────────────────────────────────

function parseHotelRating(description: string | null): {
  rating: number; reviewCount: number; cleanDesc: string;
} | null {
  if (!description) return null;
  const match = description.match(/Rated (\d+(?:\.\d+)?)\/5 \((\d[\d,]*) reviews?\)/i);
  if (!match) return null;
  return {
    rating: parseFloat(match[1]),
    reviewCount: parseInt(match[2].replace(/,/g, ''), 10),
    cleanDesc: description.replace(/\s*Rated \d+(?:\.\d+)?\/5 \(\d[\d,]* reviews?\)\.\s*/i, ' ').trim(),
  };
}

function buildExpediaCityUrl(city: string): string {
  const cjBase = process.env.EXPEDIA_CJ_BASE_URL;
  const destination = encodeURIComponent(`${city} FL`);
  const expediaUrl = `https://www.expedia.com/Hotel-Search?destination=${destination}`;
  return cjBase ? `${cjBase}?url=${encodeURIComponent(expediaUrl)}` : expediaUrl;
}

function buildHotelsComUrl(hotelName: string, lat: number | null, lng: number | null): string {
  const cjBase = process.env.HOTELS_COM_CJ_BASE_URL;
  const destination = encodeURIComponent(hotelName);
  let hotelsUrl = `https://www.hotels.com/Hotel-Search?destination=${destination}`;
  if (lat != null && lng != null) hotelsUrl += `&latLong=${lat},${lng}`;
  return cjBase ? `${cjBase}?url=${encodeURIComponent(hotelsUrl)}` : hotelsUrl;
}

function buildHotelsComCityUrl(city: string): string {
  const cjBase = process.env.HOTELS_COM_CJ_BASE_URL;
  const destination = encodeURIComponent(`${city} FL`);
  const hotelsUrl = `https://www.hotels.com/Hotel-Search?destination=${destination}`;
  return cjBase ? `${cjBase}?url=${encodeURIComponent(hotelsUrl)}` : hotelsUrl;
}

function parseHotelAddress(description: string | null, hotelName: string): string {
  if (!description) return '';
  let addr = description;
  const prefix = hotelName + ' — ';
  if (addr.startsWith(prefix)) addr = addr.slice(prefix.length);
  addr = addr.replace(/\s*Rated \d+(?:\.\d+)?\/5 \(\d[\d,]* reviews?\)\.\s*/i, ' ');
  addr = addr.replace(/\s*Nearby base for visiting.*?\.?\s*$/i, '');
  return addr.replace(/\.\s*$/, '').trim();
}

function formatHotelDistance(km: number | null, parkName: string): string {
  if (!km) return '';
  const miles = km * 0.621371;
  if (miles < 1) return `Less than a mile from ${parkName}`;
  const rounded = Math.round(miles * 10) / 10;
  const display = rounded % 1 === 0 ? String(Math.round(rounded)) : rounded.toFixed(1);
  return `About ${display} ${rounded === 1 ? 'mile' : 'miles'} from ${parkName}`;
}

function HotelStars({ rating }: { rating: number }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      {/* CSS overlay: gold stars clipped to exact decimal width */}
      <span style={{ position: 'relative', display: 'inline-block', fontSize: '0.88rem', color: '#ddd8d0', lineHeight: 1, letterSpacing: '0.05em', userSelect: 'none' }}>
        {'★★★★★'}
        <span style={{ position: 'absolute', left: 0, top: 0, overflow: 'hidden', width: `${(rating / 5) * 100}%`, whiteSpace: 'nowrap', color: '#e8a020' }}>
          {'★★★★★'}
        </span>
      </span>
      <span style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.82rem', fontWeight: 700, color: '#362f35' }}>
        {rating}
      </span>
    </span>
  );
}

// ─── Data fetching ────────────────────────────────────────────────────────────

// cache() dedupes the call within a single render — getPark runs in both
// generateMetadata and the page body. Our Supabase client sets cache:'no-store',
// which disables Next's fetch-dedup, so React cache() is what prevents the
// heavy joined query from running twice per request.
const getPark = cache(async (slug: string): Promise<Park | null> => {
  const { data, error } = await supabase
    .from('parks')
    .select(`*, park_amenities(*), park_trails(*), park_fun_facts(*), park_seasonal_events(*), park_experiences(id, name, description, duration, price_from, href, source, business_name, sort_order), park_hotels(id, name, description, url, price_from, sort_order, distance_from_park_km, pet_friendly, price_level, latitude, longitude, place_id, photo_reference)`)
    .eq('slug', slug)
    .single();
  if (error || !data) return null;
  return data as Park;
});

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function getNearbyParks(currentSlug: string, lat: number | null, lng: number | null): Promise<NearbyPark[]> {
  if (!lat || !lng) return [];
  const { data } = await supabase
    .from('parks')
    .select('id, slug, name, city, featured_image_url, latitude, longitude, park_types')
    .neq('slug', currentSlug)
    .not('park_types', 'cs', '{"Seasonal Attractions"}')
    .not('latitude', 'is', null)
    .not('longitude', 'is', null);
  if (!data) return [];
  return (data as Omit<NearbyPark, 'distance'>[])
    .map(p => ({ ...p, distance: haversine(lat, lng, p.latitude, p.longitude) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 4);
}

export const revalidate = 60;

export async function generateStaticParams() {
  const { data } = await supabase.from('parks').select('slug');
  return (data ?? []).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const park = await getPark(slug);
  if (!park) return { title: 'Park Not Found' };

  const title = park.seo_title || park.name;
  const description = park.seo_description || park.short_description;
  const url = `https://www.discoverfloridaparks.com/parks/${park.slug}`;
  const image = park.featured_image_url || 'https://www.discoverfloridaparks.com/hero-1.jpg';

  return {
    title,
    description,
    openGraph: { title, description, url, type: 'website', images: [{ url: image, alt: park.name }] },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
    alternates: { canonical: url },
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SEASON_LABELS: Record<string, string> = {
  fall_winter: 'Fall & Winter', spring_fall: 'Spring & Fall',
  year_round: 'Year-Round', summer: 'Summer', spring: 'Spring',
  winter: 'Winter', fall: 'Fall',
};
const DURATION_LABELS: Record<string, string> = {
  full_day: 'Full Day', half_day: 'Half Day', multi_day: 'Multi-Day',
  quick_stop: 'Quick Stop', weekend: 'Weekend',
};
const CROWD_LABELS: Record<string, string> = {
  low: 'Low', moderate: 'Moderate', high: 'High',
};
const AGENCY_LABELS: Record<string, string> = {
  nps: 'National Park Service', fws: 'U.S. Fish & Wildlife Service',
  usfs: 'U.S. Forest Service', fdep: 'Florida Dept. of Environmental Protection',
  city: 'City / Municipal', county: 'County', private: 'Private',
};
const DIFFICULTY_COLORS: Record<string, { bg: string; color: string }> = {
  easy:      { bg: '#dcfce7', color: '#166534' },
  moderate:  { bg: '#fef9c3', color: '#854d0e' },
  hard:      { bg: '#ffedd5', color: '#9a3412' },
  strenuous: { bg: '#fee2e2', color: '#991b1b' },
};
const STATUS_STYLES: Record<string, { bg: string; border: string; iconColor: string; text: string }> = {
  'Closed':           { bg: '#fee2e2', border: '#fca5a5', iconColor: '#dc2626', text: 'This park is currently closed to visitors.' },
  'Under Renovation': { bg: '#fef9c3', border: '#fde047', iconColor: '#ca8a04', text: 'This park is currently under renovation. Some areas may be inaccessible.' },
  'Seasonal':         { bg: '#eff6ff', border: '#93c5fd', iconColor: '#2563eb', text: 'This park operates seasonally. Please verify hours before your visit.' },
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ParkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const park = await getPark(slug);
  if (!park) notFound();

  const [nearbyParks, catalogExperiencesResult] = await Promise.all([
    getNearbyParks(slug, park.latitude, park.longitude),
    supabase.rpc('get_park_experiences', {
      park_activity_types: park.activity_types ?? [],
      park_region_list: park.park_regions ?? [],
      park_lat: park.latitude ?? null,
      park_lng: park.longitude ?? null,
    }),
  ]);
  const catalogExperiences: CatalogExperience[] = catalogExperiencesResult.data ?? [];

  const amenities = park.park_amenities ?? {};
  const trails = park.park_trails?.sort((a, b) => a.sort_order - b.sort_order) ?? [];
  const facts = park.park_fun_facts?.sort((a, b) => a.sort_order - b.sort_order) ?? [];
  const events = park.park_seasonal_events?.sort((a, b) => a.sort_order - b.sort_order) ?? [];
  const experiences = (park as any).park_experiences?.sort((a: any, b: any) => a.sort_order - b.sort_order) ?? [];
  const hotels = (park as any).park_hotels?.sort((a: any, b: any) => a.sort_order - b.sort_order) ?? [];

  const amenityList = [
    { label: 'Dog Friendly',      icon: Dog,           active: amenities.dog_friendly },
    { label: 'Camping',           icon: Tent,          active: amenities.camping_available },
    { label: 'Swimming',          icon: Waves,         active: amenities.swimming_allowed },
    { label: 'Fishing',           icon: Fish,          active: amenities.fishing_allowed },
    { label: 'Hiking',            icon: MountainSnow,  active: amenities.hiking_available },
    { label: 'Biking',            icon: Bike,          active: amenities.biking_available },
    { label: 'Horseback Riding',  icon: Footprints,    active: amenities.horseback_riding },
    { label: 'Hunting',           icon: Crosshair,     active: amenities.hunting_allowed },
    { label: 'Paddling',          icon: Sailboat,      active: amenities.paddling_available },
    { label: 'Wildlife Viewing',  icon: Bird,          active: amenities.wildlife_viewing },
    { label: 'Beach Access',      icon: Umbrella,      active: amenities.beach_access },
    { label: 'Boat Launch',       icon: Ship,          active: amenities.boat_launch },
    { label: 'Picnic Areas',      icon: TreePine,      active: amenities.picnic_areas },
    { label: 'Visitor Center',    icon: MapPin,        active: amenities.visitor_center },
    { label: 'Accessible',        icon: ParkingCircle, active: amenities.wheelchair_accessible },
  ].filter(a => a.active);

  const parkUrl = `https://www.discoverfloridaparks.com/parks/${park.slug}`;

  const mapSrc = park.latitude && park.longitude
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${park.longitude - 0.03}%2C${park.latitude - 0.03}%2C${park.longitude + 0.03}%2C${park.latitude + 0.03}&layer=mapnik&marker=${park.latitude}%2C${park.longitude}`
    : null;

  const statusStyle = park.park_status ? STATUS_STYLES[park.park_status] : null;

  const updatedAt = park.updated_at
    ? new Date(park.updated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  const touristAttractionSchema = {
    '@context': 'https://schema.org',
    '@type': ['TouristAttraction', 'LocalBusiness'],
    '@id': parkUrl,
    additionalType: 'https://schema.org/Park',
    name: park.name,
    description: park.short_description,
    url: parkUrl,
    ...(park.featured_image_url && {
      image: { '@type': 'ImageObject', url: park.featured_image_url },
    }),
    ...(park.latitude && park.longitude && {
      geo: { '@type': 'GeoCoordinates', latitude: park.latitude, longitude: park.longitude },
    }),
    ...(park.address && {
      address: {
        '@type': 'PostalAddress',
        streetAddress: park.address,
        addressLocality: park.city,
        postalCode: park.zip_code,
        addressCountry: 'US',
      },
    }),
    ...(park.phone && { telephone: park.phone }),
    ...(park.website && { sameAs: park.website }),
    ...(park.entrance_fee && { priceRange: park.entrance_fee }),
    ...(park.google_rating && park.google_review_count && park.google_review_count > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: park.google_rating,
        ratingCount: park.google_review_count,
        bestRating: 5,
        worstRating: 1,
      },
    }),
    ...(park.opening_hours_spec?.length && {
      openingHoursSpecification: park.opening_hours_spec.map(h => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: `https://schema.org/${h.dayOfWeek}`,
        opens: h.opens,
        closes: h.closes,
      })),
    }),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.discoverfloridaparks.com' },
      { '@type': 'ListItem', position: 2, name: 'Parks', item: 'https://www.discoverfloridaparks.com/parks' },
      { '@type': 'ListItem', position: 3, name: park.name, item: parkUrl },
    ],
  };

  const experiencesSchema = catalogExperiences.length > 0 ? catalogExperiences.map(exp => ({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: exp.name,
    description: exp.description ?? undefined,
    url: exp.affiliate_url ?? undefined,
    image: park.featured_image_url ?? undefined,
    brand: exp.provider ? { '@type': 'Brand', name: exp.provider } : undefined,
    ...(exp.rating && exp.review_count && {
      aggregateRating: { '@type': 'AggregateRating', ratingValue: exp.rating, reviewCount: exp.review_count, bestRating: 5 },
    }),
    offers: {
      '@type': 'Offer',
      url: exp.affiliate_url ?? undefined,
      ...(exp.price_from && { price: exp.price_from, priceCurrency: 'USD' }),
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'US',
        returnPolicyCategory: 'https://schema.org/MerchantReturnNotPermitted',
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: { '@type': 'MonetaryAmount', value: '0', currency: 'USD' },
        shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'US' },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 0, unitCode: 'DAY' },
          transitTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 0, unitCode: 'DAY' },
        },
      },
    },
  })) : null;

  const faqItems = [
    ...(park.entrance_fee ? [{ q: `What is the entrance fee for ${park.name}?`, a: park.entrance_fee }] : []),
    ...(park.opening_hours_spec?.length ? [{ q: `What are the hours for ${park.name}?`, a: park.opening_hours_spec.map((h: any) => `${h.dayOfWeek}: ${h.opens}–${h.closes}`).join(', ') }] : []),
    ...(park.parking_info ? [{ q: `Is there parking at ${park.name}?`, a: park.parking_info }] : []),
    ...(amenities.dog_friendly ? [{ q: `Are dogs allowed at ${park.name}?`, a: 'Yes, dogs are welcome at this park.' }] : []),
  ];
  const faqSchema = faqItems.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  } : null;

  return (
    <div style={{ background: '#fff', color: '#413734', minHeight: '100vh' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(touristAttractionSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}
      {experiencesSchema && experiencesSchema.map((s, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}

      <SiteHeader />

      {/* ── Hero ────────────────────────────────────────────── */}
      <div style={{ position: 'relative', height: 480, overflow: 'hidden', background: '#a6967c' }}>
        {park.featured_image_url && (
          <Image src={park.featured_image_url} alt={park.name} fill
            sizes="100vw" style={{ objectFit: 'cover' }} priority />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(30,20,10,0.75) 0%, rgba(30,20,10,0.2) 60%, transparent 100%)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '40px 24px', maxWidth: 1278, margin: '0 auto' }}>
          <Link href="/parks"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'Archivo, sans-serif', fontSize: '0.82rem', fontWeight: 600, color: 'rgba(255,255,255,0.75)', marginBottom: 16, textDecoration: 'none' }}
            className="hover:text-white transition-colors">
            <ArrowLeft size={14} /> All Parks
          </Link>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
            {park.park_types?.map(t => (
              <span key={t} style={{ background: '#ff7044', color: '#fff', borderRadius: '2.3em', padding: '4px 14px', fontFamily: 'Archivo, sans-serif', fontSize: '0.75rem', fontWeight: 700 }}>
                {t}
              </span>
            ))}
            {park.terrain && (
              <span style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', borderRadius: '2.3em', padding: '4px 14px', fontFamily: 'Archivo, sans-serif', fontSize: '0.75rem', fontWeight: 600 }}>
                {park.terrain}
              </span>
            )}
            {park.park_regions?.length > 0 && park.park_regions.map(r => (
              <Link key={r} href={`/parks/region/${r.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`}
                style={{ background: 'rgba(255,255,255,0.18)', color: '#fff', borderRadius: '2.3em', padding: '4px 14px', fontFamily: 'Archivo, sans-serif', fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none' }}
                className="hover:bg-white/30 transition-colors">
                {r}
              </Link>
            ))}
          </div>
          <h1 style={{ fontFamily: 'Shrikhand, cursive', fontWeight: 400, fontSize: 'clamp(2.5rem, 5vw, 4.14rem)', lineHeight: 0.98, color: '#fff', margin: '0 0 10px', letterSpacing: '-0.04em' }}>
            {park.name}
          </h1>
          {park.city && (
            <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.85rem', color: 'rgba(255,255,255,0.75)', display: 'flex', alignItems: 'center', gap: 5, margin: 0 }}>
              <MapPin size={13} /> {park.city}{park.county ? `, ${park.county} County` : ''}
            </p>
          )}
        </div>
      </div>

      {/* ── Status Banner ───────────────────────────────────── */}
      {statusStyle && (
        <div style={{ background: statusStyle.bg, borderBottom: `1px solid ${statusStyle.border}`, padding: '14px 24px' }}>
          <div style={{ maxWidth: 1278, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 10 }}>
            <AlertTriangle size={16} style={{ flexShrink: 0, color: statusStyle.iconColor }} />
            <span style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: '0.88rem', color: '#362f35' }}>
              {statusStyle.text}
            </span>
          </div>
        </div>
      )}

      {/* ── Body ────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1278, margin: '0 auto', padding: '48px 24px' }}>

        {/* Breadcrumb */}
        <nav style={{ marginBottom: 36, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px 6px' }}>
          <Link href="/" style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.78rem', color: '#a6967c', textDecoration: 'none' }} className="hover:text-[#ff7044] transition-colors">Home</Link>
          <span style={{ color: '#dfdfdf', fontSize: '0.78rem' }}>/</span>
          <Link href="/parks" style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.78rem', color: '#a6967c', textDecoration: 'none' }} className="hover:text-[#ff7044] transition-colors">Parks</Link>
          {park.park_types?.[0] && (
            <>
              <span style={{ color: '#dfdfdf', fontSize: '0.78rem' }}>/</span>
              <Link href={`/parks?type=${encodeURIComponent(park.park_types[0])}`} style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.78rem', color: '#a6967c', textDecoration: 'none' }} className="hover:text-[#ff7044] transition-colors">
                {park.park_types[0]}
              </Link>
            </>
          )}
          <span style={{ color: '#dfdfdf', fontSize: '0.78rem' }}>/</span>
          <span style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.78rem', fontWeight: 600, color: '#413734' }}>{park.name}</span>
        </nav>

        {/* Quick stats */}
        <div className="park-stats-grid" style={{ marginBottom: 56 }}>
          {park.google_rating && (
            <StatCard icon={<Star size={17} style={{ color: '#e8a020' }} />} label="Google Rating" value={`${park.google_rating} / 5`} />
          )}
          {park.crowd_level && (
            <StatCard icon={<Users size={17} style={{ color: '#ff7044' }} />} label="Crowd Level" value={CROWD_LABELS[park.crowd_level] ?? park.crowd_level} />
          )}
          {park.typical_visit_duration && (
            <StatCard icon={<Clock size={17} style={{ color: '#a6967c' }} />} label="Visit Duration" value={DURATION_LABELS[park.typical_visit_duration] ?? park.typical_visit_duration} />
          )}
          {park.best_season && (
            <StatCard icon={<Calendar size={17} style={{ color: '#a6967c' }} />} label="Best Season" value={SEASON_LABELS[park.best_season] ?? park.best_season} />
          )}
          {park.latitude && park.longitude && (
            <div style={{ minHeight: 120 }}>
              <WeatherStatCard lat={park.latitude} lng={park.longitude} />
            </div>
          )}
        </div>

        <div className="park-detail-layout">

          {/* ── Main content ──────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>

            {/* About */}
            {(park.short_description || park.full_description) && (
              <section>
                <SectionHeading>About {park.name}</SectionHeading>
                {park.short_description && (
                  <p style={{ fontFamily: 'Glegoo, serif', fontWeight: 700, fontSize: '1.05rem', color: '#413734', lineHeight: 1.6, margin: '0 0 24px', paddingBottom: 24, borderBottom: '1px solid #f0ece6' }}>
                    {park.short_description}
                  </p>
                )}
                {park.full_description && (
                  <div style={{ fontFamily: 'Glegoo, serif', fontWeight: 700, fontSize: '1rem', color: '#726d6b', lineHeight: 1.65 }}>
                    {park.full_description.split('\n').map((line, i) => (
                      <p key={i} style={{ margin: '0 0 1em' }}>{line}</p>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Gallery */}
            {park.gallery_urls?.length > 0 && (
              <section>
                <SectionHeading>Photos</SectionHeading>
                <PhotoGallery urls={park.gallery_urls} parkName={park.name} />
              </section>
            )}

            {/* Amenities */}
            {amenityList.length > 0 && (
              <section>
                <SectionHeading>Amenities & Activities</SectionHeading>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {amenityList.map(({ label, icon: Icon }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: '2.3em', border: '1px solid #eeeeee', background: '#fff', fontFamily: 'Archivo, sans-serif', fontSize: '0.85rem', fontWeight: 600, color: '#413734' }}>
                      <Icon size={15} style={{ color: '#ff7044' }} />
                      {label}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Guided Tours & Experiences */}
            {experiences.length > 0 && (
              <section>
                <SectionHeading>Guided Tours & Experiences</SectionHeading>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {experiences.map((exp: any) => (
                    <div key={exp.id} style={{ borderRadius: 16, padding: '20px 24px', border: '1px solid #eeeeee', background: '#fff' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
                        <div>
                          <AffiliateLink network={exp.source ?? 'partner'} placement="park-experience-manual" park={park.slug}
                            href={exp.href} target="_blank" rel="nofollow sponsored noopener noreferrer"
                            style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: '0.95rem', color: '#ff7044', textDecoration: 'none' }}>
                            {exp.name}
                          </AffiliateLink>
                          {exp.business_name && (
                            <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.78rem', color: '#a6967c', margin: '2px 0 0' }}>{exp.business_name}</p>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {exp.duration && (
                            <span style={{ background: '#f0ece6', color: '#726d6b', borderRadius: '2.3em', padding: '3px 10px', fontFamily: 'Archivo, sans-serif', fontSize: '0.72rem', fontWeight: 700 }}>{exp.duration}</span>
                          )}
                          {exp.price_from && (
                            <span style={{ background: '#f0ece6', color: '#726d6b', borderRadius: '2.3em', padding: '3px 10px', fontFamily: 'Archivo, sans-serif', fontSize: '0.72rem', fontWeight: 700 }}>{exp.price_from}</span>
                          )}
                          {exp.source === 'viator'
                            ? <span style={{ background: '#e8f4f8', color: '#0066cc', borderRadius: '2.3em', padding: '3px 10px', fontFamily: 'Archivo, sans-serif', fontSize: '0.72rem', fontWeight: 700 }}>Viator</span>
                            : <span style={{ background: '#f0ece6', color: '#726d6b', borderRadius: '2.3em', padding: '3px 10px', fontFamily: 'Archivo, sans-serif', fontSize: '0.72rem', fontWeight: 700 }}>Partner</span>
                          }
                        </div>
                      </div>
                      {exp.description && (
                        <p style={{ fontFamily: 'Glegoo, serif', fontWeight: 700, fontSize: '0.85rem', color: '#726d6b', lineHeight: 1.6, margin: 0 }}>{exp.description}</p>
                      )}
                    </div>
                  ))}
                </div>
                <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.72rem', color: '#c4bab3', marginTop: 12, lineHeight: 1.6 }}>
                  Tour links may be affiliate links or sponsored placements. We earn a small commission at no extra cost to you.
                </p>
              </section>
            )}

            {/* Gear Recommendations */}
            <GearRecommendations amenities={amenities} />

            {/* Trails */}
            {trails.length > 0 && (
              <section>
                <SectionHeading>Trails</SectionHeading>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {trails.map(trail => {
                    const dc = DIFFICULTY_COLORS[trail.difficulty?.toLowerCase()] ?? { bg: '#f0ece6', color: '#413734' };
                    return (
                      <div key={trail.id} style={{ borderRadius: 16, padding: '20px 24px', border: '1px solid #eeeeee', background: '#fff' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: trail.description ? 10 : 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Footprints size={15} style={{ color: '#ff7044' }} />
                            <span style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: '0.95rem', color: '#362f35' }}>{trail.name}</span>
                          </div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            {trail.difficulty && (
                              <span style={{ background: dc.bg, color: dc.color, borderRadius: '2.3em', padding: '3px 10px', fontFamily: 'Archivo, sans-serif', fontSize: '0.72rem', fontWeight: 700 }}>
                                {trail.difficulty}
                              </span>
                            )}
                            {trail.length_miles && (
                              <span style={{ background: '#f0ece6', color: '#726d6b', borderRadius: '2.3em', padding: '3px 10px', fontFamily: 'Archivo, sans-serif', fontSize: '0.72rem', fontWeight: 700 }}>
                                {trail.length_miles} mi
                              </span>
                            )}
                          </div>
                        </div>
                        {trail.description && (
                          <p style={{ fontFamily: 'Glegoo, serif', fontWeight: 700, fontSize: '0.85rem', color: '#726d6b', lineHeight: 1.6, margin: 0 }}>{trail.description}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Fun Facts */}
            {facts.length > 0 && (
              <section>
                <SectionHeading>Fun Facts</SectionHeading>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {facts.map((f, i) => (
                    <div key={f.id} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                      <span style={{ flexShrink: 0, width: 28, height: 28, borderRadius: '50%', background: '#ff7044', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Archivo, sans-serif', fontSize: '0.75rem', fontWeight: 700, color: '#fff' }}>
                        {i + 1}
                      </span>
                      <p style={{ fontFamily: 'Glegoo, serif', fontWeight: 700, fontSize: '0.9rem', color: '#726d6b', lineHeight: 1.6, margin: 0, paddingTop: 4 }}>{f.fact}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Seasonal Events */}
            {events.length > 0 && (
              <section>
                <SectionHeading>Seasonal Events</SectionHeading>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {events.map(evt => (
                    <div key={evt.id} style={{ borderRadius: 16, padding: '20px 24px', border: '1px solid #eeeeee', background: '#fff', display: 'flex', gap: 18 }}>
                      <div style={{ flexShrink: 0, width: 56, height: 56, borderRadius: 12, background: '#f9f7f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Archivo, sans-serif', fontSize: '0.72rem', fontWeight: 700, color: '#a6967c', textAlign: 'center', lineHeight: 1.3 }}>
                        {evt.month}
                      </div>
                      <div>
                        <p style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: '0.95rem', color: '#362f35', margin: '0 0 6px' }}>{evt.event_name}</p>
                        {evt.description && <p style={{ fontFamily: 'Glegoo, serif', fontWeight: 700, fontSize: '0.85rem', color: '#726d6b', lineHeight: 1.6, margin: 0 }}>{evt.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Where to Stay */}
            {hotels.length === 0 && park.city && (
              <section>
                <SectionHeading>Where to Stay</SectionHeading>
                <div style={{ borderRadius: 16, padding: '20px 24px', border: '1px solid #eeeeee', background: '#fff' }}>
                  <span style={{ display: 'block', fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: '0.95rem', color: '#333', marginBottom: 12 }}>
                    Search hotels near {park.name}
                  </span>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <AffiliateLink
                      network="expedia" placement="park-hotel-fallback" park={park.slug}
                      href={buildExpediaCityUrl(park.city)}
                      target="_blank"
                      rel="nofollow sponsored noopener noreferrer"
                      style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.82rem', fontWeight: 700, color: '#ff7044', textDecoration: 'none', borderRadius: '2.3em', border: '1.5px solid #ff7044', padding: '5px 14px' }}
                    >
                      Search on Expedia →
                    </AffiliateLink>
                    <AffiliateLink
                      network="hotels.com" placement="park-hotel-fallback" park={park.slug}
                      href={buildHotelsComCityUrl(park.city)}
                      target="_blank"
                      rel="nofollow sponsored noopener noreferrer"
                      style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.82rem', fontWeight: 700, color: '#d4145a', textDecoration: 'none', borderRadius: '2.3em', border: '1.5px solid #d4145a', padding: '5px 14px' }}
                    >
                      Search on Hotels.com →
                    </AffiliateLink>
                  </div>
                </div>
                <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.72rem', color: '#c4bab3', marginTop: 12, lineHeight: 1.6 }}>
                  Hotel links are affiliate links. We earn a small commission at no extra cost to you.
                </p>
              </section>
            )}
            {hotels.length > 0 && (
              <section>
                {(() => {
                  const closestKm = Math.min(...hotels.map((h: any) => h.distance_from_park_km ?? Infinity));
                  const heading = closestKm > 32 ? 'Where to Stay' : 'Where to Stay Nearby';
                  return <SectionHeading>{heading}</SectionHeading>;
                })()}
                {park.gateway_note && (
                  <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.82rem', fontWeight: 600, color: '#a6967c', background: '#f9f7f5', borderRadius: 10, padding: '9px 14px', marginBottom: 16, marginTop: 0 }}>
                    🚢 {park.gateway_note}
                  </p>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {hotels.map((hotel: any) => {
                    const hotelRating = parseHotelRating(hotel.description);
                    const address = parseHotelAddress(hotel.description, hotel.name);
                    const distanceText = formatHotelDistance(hotel.distance_from_park_km, park.name);
                    const photoSrc = hotel.photo_reference
                      ? (hotel.photo_reference.startsWith('/') || hotel.photo_reference.startsWith('https://')
                          ? hotel.photo_reference
                          : `/api/hotel-photo?ref=${encodeURIComponent(hotel.photo_reference)}`)
                      : null;
                    return (
                    <div key={hotel.id} className="hotel-card">
                      {photoSrc && (
                        <div className="hotel-thumb">
                          <img src={photoSrc} alt="" loading="lazy" decoding="async" />
                        </div>
                      )}
                      <div className="hotel-body">
                        {/* Name always on its own line */}
                        <a href={hotel.url} target="_blank" rel="nofollow sponsored noopener noreferrer"
                          style={{ display: 'block', fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: '0.95rem', color: '#ff7044', textDecoration: 'none', marginBottom: 6 }}>
                          {hotel.name}
                        </a>
                        {/* Stars + badges wrap freely */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px 8px', marginBottom: (address || distanceText) ? 10 : 0 }}>
                          {hotelRating && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                              <HotelStars rating={hotelRating.rating} />
                              {hotel.place_id
                                ? <HotelReviewsModal placeId={hotel.place_id} hotelName={hotel.name} reviewCount={hotelRating.reviewCount} rating={hotelRating.rating} />
                                : <span style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.75rem', color: '#a6967c' }}>({hotelRating.reviewCount.toLocaleString()} reviews)</span>
                              }
                            </span>
                          )}
                          {hotel.pet_friendly === true && (
                            <span style={{ background: '#e6f2ea', color: '#3d7a52', borderRadius: '2.3em', padding: '3px 10px', fontFamily: 'Archivo, sans-serif', fontSize: '0.72rem', fontWeight: 700 }}>🐾 Pet-friendly</span>
                          )}
                          {hotel.price_level && (
                            <span style={{ background: '#f0ece6', color: '#726d6b', borderRadius: '2.3em', padding: '3px 10px', fontFamily: 'Archivo, sans-serif', fontSize: '0.72rem', fontWeight: 700 }}>{'$'.repeat(hotel.price_level)}</span>
                          )}
                        </div>
                        {(address || distanceText) && (
                          <p style={{ fontFamily: 'Glegoo, serif', fontSize: '0.85rem', color: '#726d6b', lineHeight: 1.6, margin: '0 0 12px' }}>
                            {address && <strong>{address}</strong>}
                            {address && distanceText && <span style={{ fontWeight: 400 }}> · {distanceText}</span>}
                            {!address && distanceText && <span style={{ fontWeight: 400 }}>{distanceText}</span>}
                          </p>
                        )}
                        <AffiliateLink
                          network="hotels.com" placement="park-hotel-card" park={park.slug}
                          href={buildHotelsComUrl(hotel.name, hotel.latitude ?? null, hotel.longitude ?? null)}
                          target="_blank"
                          rel="nofollow sponsored noopener noreferrer"
                          className="hotels-pill"
                          style={{ display: 'inline-block', fontFamily: 'Archivo, sans-serif', fontSize: '0.75rem', fontWeight: 600, color: '#a6967c', textDecoration: 'none', borderRadius: '2.3em', border: '1px solid #c4bab3', padding: '3px 11px', transition: 'background 0.15s, color 0.15s, border-color 0.15s' }}
                        >
                          Book on Hotels.com →
                        </AffiliateLink>
                      </div>
                    </div>
                    );
                  })}
                </div>
                <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.72rem', color: '#c4bab3', marginTop: 12, lineHeight: 1.6 }}>
                  Hotel links are affiliate links. We earn a small commission at no extra cost to you.
                </p>
              </section>
            )}

            {/* Wildlife */}
            {park.wildlife_summary && (
              <section>
                <SectionHeading>Wildlife</SectionHeading>
                <div style={{ borderRadius: 16, padding: '20px 24px', border: '1px solid #eeeeee', background: '#fff', display: 'flex', gap: 14 }}>
                  <Leaf size={18} style={{ flexShrink: 0, marginTop: 2, color: '#ff7044' }} />
                  <p style={{ fontFamily: 'Glegoo, serif', fontWeight: 700, fontSize: '0.9rem', color: '#726d6b', lineHeight: 1.65, margin: 0 }}>{park.wildlife_summary}</p>
                </div>
              </section>
            )}

            {/* Visitor Tips */}
            {park.visitor_tips && (() => {
              const tips = park.visitor_tips.split('•').map(t => t.trim()).filter(Boolean);
              return (
                <section>
                  <SectionHeading>Visitor Tips</SectionHeading>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {tips.map((tip, i) => (
                      <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                        <span style={{ flexShrink: 0, width: 10, height: 10, borderRadius: '50%', background: '#ff7044', marginTop: 7 }} />
                        <p style={{ fontFamily: 'Glegoo, serif', fontWeight: 700, fontSize: '0.9rem', color: '#726d6b', lineHeight: 1.6, margin: 0, paddingTop: 4 }}>{tip}</p>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })()}

            {/* Safety */}
            {park.safety_notes && (
              <section>
                <SectionHeading>Safety Notes</SectionHeading>
                <div style={{ borderRadius: 16, padding: '20px 24px', border: '1px solid #eeeeee', background: '#fff', display: 'flex', gap: 14 }}>
                  <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 2, color: '#e8a020' }} />
                  <p style={{ fontFamily: 'Glegoo, serif', fontWeight: 700, fontSize: '0.9rem', color: '#726d6b', lineHeight: 1.65, margin: 0 }}>{park.safety_notes}</p>
                </div>
              </section>
            )}

            {/* Share / Instagram */}
            {park.instagram_hashtag && (
              <section>
                <SectionHeading>Share Your Visit</SectionHeading>
                <div style={{ borderRadius: 16, padding: '20px 24px', border: '1px solid #eeeeee', background: '#fff5f2', display: 'flex', gap: 14, alignItems: 'center' }}>
                  <Hash size={20} style={{ flexShrink: 0, color: '#ff7044' }} />
                  <p style={{ fontFamily: 'Glegoo, serif', fontWeight: 700, fontSize: '0.9rem', color: '#726d6b', lineHeight: 1.6, margin: 0 }}>
                    Tag your photos <span style={{ color: '#ff7044', fontFamily: 'Archivo, sans-serif', fontWeight: 700 }}>#{park.instagram_hashtag}</span> and share your experience with the community!
                  </p>
                </div>
              </section>
            )}

          </div>

          {/* ── Sidebar ───────────────────────────────────── */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Info card */}
            <div style={{ borderRadius: 16, padding: '24px', border: '1px solid #eeeeee', background: '#fff' }}>
              <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.72rem', fontWeight: 600, color: '#a6967c', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 16px' }}>
                Park Info
              </p>

              {park.reservation_required && (
                <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 8, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <Calendar size={13} style={{ color: '#ea580c', flexShrink: 0 }} />
                  <span style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.75rem', fontWeight: 700, color: '#9a3412' }}>Reservations Required</span>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
                {park.entrance_fee && <InfoRow icon={<DollarSign size={14} />} label="Entrance Fee" value={park.entrance_fee} />}
                {park.opening_hours_spec?.length ? (
                  <div>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontFamily: 'Archivo, sans-serif', fontSize: '0.7rem', fontWeight: 600, color: '#a6967c', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                      <span style={{ color: '#ff7044', lineHeight: 0 }}><Clock size={14} /></span>
                      Hours
                    </span>
                    <div style={{ paddingLeft: 21, display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {park.opening_hours_spec.map(h => (
                        <span key={h.dayOfWeek} style={{ fontFamily: 'Glegoo, serif', fontWeight: 700, fontSize: '0.85rem', color: '#413734' }}>
                          {h.dayOfWeek.slice(0, 3)}: {fmtTime(h.opens)} – {fmtTime(h.closes)}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : park.operating_hours ? (
                  <InfoRow icon={<Clock size={14} />} label="Hours" value={park.operating_hours} />
                ) : null}
                {park.phone            && <InfoRow icon={<Phone size={14} />}      label="Phone"        value={park.phone} />}
                {park.email            && (
                  <div style={{ display: 'flex', gap: 12 }}>
                    <span style={{ flexShrink: 0, marginTop: 2, color: '#ff7044' }}><Mail size={14} /></span>
                    <div>
                      <span style={{ display: 'block', fontFamily: 'Archivo, sans-serif', fontSize: '0.7rem', fontWeight: 600, color: '#a6967c', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>Email</span>
                      <a href={`mailto:${park.email}`} style={{ fontFamily: 'Glegoo, serif', fontWeight: 700, fontSize: '0.85rem', color: '#ff7044', textDecoration: 'none' }} className="hover:underline">
                        {park.email}
                      </a>
                    </div>
                  </div>
                )}
                {park.address          && <InfoRow icon={<MapPin size={14} />}     label="Address"      value={`${park.address}${park.city ? `, ${park.city}` : ''}${park.zip_code ? ` ${park.zip_code}` : ''}`} />}
                {park.managing_agency  && <InfoRow icon={<TreePine size={14} />}   label="Managed By"   value={AGENCY_LABELS[park.managing_agency] ?? park.managing_agency} />}
                {park.year_established && <InfoRow icon={<Calendar size={14} />}   label="Established"  value={String(park.year_established)} />}
                {park.park_size_acres  && <InfoRow icon={<Leaf size={14} />}       label="Size"         value={`${park.park_size_acres.toLocaleString()} acres`} />}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {park.website && (
                  <a href={park.website} target="_blank" rel="noopener noreferrer"
                    style={{ background: '#ff7044', color: '#fff', borderRadius: '2.3em', padding: '12px 20px', fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, textDecoration: 'none' }}
                    className="hover:opacity-90 transition-opacity">
                    <Globe size={14} /> Official Website
                  </a>
                )}
                {park.google_maps_link && (
                  <a href={park.google_maps_link} target="_blank" rel="noopener noreferrer"
                    style={{ background: 'transparent', color: '#413734', border: '2px solid #dfdfdf', borderRadius: '2.3em', padding: '11px 20px', fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, textDecoration: 'none' }}
                    className="hover:border-[#413734] transition-colors">
                    <MapPin size={14} /> Get Directions
                  </a>
                )}
                {park.camping_url && (() => {
                  const isThemePark = park.park_types?.some(t => ['Theme Park', 'Water Park'].includes(t));
                  const label = isThemePark ? 'Book a Resort Stay' : park.reservation_required ? 'Reserve a Campsite' : 'Book a Campsite';
                  return (
                    <a href={park.camping_url} target="_blank" rel="noopener noreferrer"
                      style={{ background: 'transparent', color: '#413734', border: '2px solid #dfdfdf', borderRadius: '2.3em', padding: '11px 20px', fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, textDecoration: 'none' }}
                      className="hover:border-[#413734] transition-colors">
                      <Tent size={14} /> {label}
                    </a>
                  );
                })()}
                {park.reservation_url && (
                  <a href={park.reservation_url} target="_blank" rel="noopener noreferrer"
                    style={{ background: 'transparent', color: '#413734', border: '2px solid #dfdfdf', borderRadius: '2.3em', padding: '11px 20px', fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, textDecoration: 'none' }}
                    className="hover:border-[#413734] transition-colors">
                    <Calendar size={14} /> Reserve Facilities
                  </a>
                )}
              </div>
            </div>

            {/* Map */}
            {mapSrc && (
              <ParkMap
                src={mapSrc}
                parkName={park.name}
                googleMapsLink={park.google_maps_link}
              />
            )}

            {/* Distances */}
            {(park.distance_from_miami || park.distance_from_orlando || park.distance_from_tampa) && (
              <div style={{ borderRadius: 16, padding: '24px', border: '1px solid #eeeeee', background: '#fff' }}>
                <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.72rem', fontWeight: 600, color: '#a6967c', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 16px' }}>
                  Drive Distance
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {park.distance_from_miami   && <DistanceRow city="Miami"   miles={park.distance_from_miami} />}
                  {park.distance_from_orlando && <DistanceRow city="Orlando" miles={park.distance_from_orlando} />}
                  {park.distance_from_tampa   && <DistanceRow city="Tampa"   miles={park.distance_from_tampa} />}
                </div>
              </div>
            )}

            {/* Parking */}
            {park.parking_info && (
              <div style={{ borderRadius: 16, padding: '24px', border: '1px solid #eeeeee', background: '#fff' }}>
                <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.72rem', fontWeight: 600, color: '#a6967c', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 12px' }}>
                  Parking
                </p>
                <p style={{ fontFamily: 'Glegoo, serif', fontWeight: 700, fontSize: '0.85rem', color: '#726d6b', lineHeight: 1.6, margin: 0 }}>{park.parking_info}</p>
              </div>
            )}

            {/* Nearby Cities */}
            {park.nearby_cities && (
              <div style={{ borderRadius: 16, padding: '24px', border: '1px solid #eeeeee', background: '#fff' }}>
                <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.72rem', fontWeight: 600, color: '#a6967c', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 12px' }}>
                  Nearby Cities
                </p>
                <p style={{ fontFamily: 'Glegoo, serif', fontWeight: 700, fontSize: '0.85rem', color: '#726d6b', lineHeight: 1.6, margin: 0 }}>
                  {(() => {
                    const v = park.nearby_cities;
                    if (!v) return null;
                    if (Array.isArray(v)) return v.join(', ');
                    try { const p = JSON.parse(v as string); return Array.isArray(p) ? p.join(', ') : v; } catch { return v; }
                  })()}
                </p>
              </div>
            )}

            {/* Back to directory */}
            <Link href="/parks"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#f9f7f5', border: '1px solid #eeeeee', borderRadius: '2.3em', padding: '12px 20px', fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: '0.85rem', color: '#413734', textDecoration: 'none' }}
              className="hover:bg-[#f0ece6] transition-colors">
              <ArrowLeft size={14} /> Back to All Parks
            </Link>

            {/* Last updated */}
            {updatedAt && (
              <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.68rem', color: '#a6967c', textAlign: 'center', margin: 0 }}>
                Last updated {updatedAt}
              </p>
            )}

            {/* Sidebar ad unit */}
            <div style={{ marginTop: '1.5rem' }}>
              <AdUnit
                slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_PARK_DETAIL_SIDEBAR!}
                format="auto"
                style={{ minHeight: '250px' }}
              />
            </div>

          </aside>
        </div>

      </div>

      {/* ── Catalog Experiences — full-bleed section ─── */}
      <ExperiencesSection parkName={park.name} experiences={catalogExperiences} />

      {/* ── Nearby Parks ────────────────────────────────── */}
      {nearbyParks.length > 0 && (
        <div style={{ maxWidth: 1278, margin: '0 auto', padding: '64px 24px' }}>
          <SectionHeading>Parks Nearby</SectionHeading>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
            {nearbyParks.map(p => (
              <Link key={p.id} href={`/parks/${p.slug}`}
                style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid #eeeeee', textDecoration: 'none', display: 'block', background: '#fff' }}
                className="hover:border-[#dfdfdf] hover:shadow-sm transition-all">
                <div style={{ position: 'relative', height: 130, background: '#f0ece6' }}>
                  {p.featured_image_url && (
                    <Image src={p.featured_image_url} alt={p.name} fill style={{ objectFit: 'cover' }} sizes="280px" />
                  )}
                </div>
                <div style={{ padding: '14px 16px' }}>
                  <p style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: '0.9rem', color: '#362f35', margin: '0 0 4px', lineHeight: 1.3 }}>{p.name}</p>
                  <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.75rem', color: '#a6967c', margin: 0 }}>
                    {p.city} · {Math.round(p.distance)} mi away
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <section style={{ background: '#f9f7f5', borderTop: '1px solid #eeeeee', padding: '48px 24px' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <NewsletterSignup variant="inline" source={park.slug} />
        </div>
      </section>

      <FooterLinks />
      <SiteFooter />
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontFamily: 'Shrikhand, cursive', fontWeight: 400, fontSize: '2.14rem', lineHeight: 0.98, color: '#362f35', margin: '0 0 20px', paddingBottom: 16, borderBottom: '1px solid #eeeeee', letterSpacing: '-0.04em' }}>
      {children}
    </h2>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{ borderRadius: 16, padding: '20px', border: '1px solid #eeeeee', background: '#fff', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7, fontFamily: 'Archivo, sans-serif', fontSize: '0.72rem', fontWeight: 600, color: '#a6967c', textTransform: 'uppercase', letterSpacing: '0.08em', lineHeight: '1.25' }}>
        <span style={{ flexShrink: 0, lineHeight: 0, paddingTop: 2 }}>{icon}</span>{label}
      </div>
      <p style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: '1rem', color: '#413734', margin: 0 }}>{value}</p>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontFamily: 'Archivo, sans-serif', fontSize: '0.7rem', fontWeight: 600, color: '#a6967c', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
        <span style={{ color: '#ff7044', lineHeight: 0, flexShrink: 0 }}>{icon}</span>
        {label}
      </span>
      <span style={{ display: 'block', paddingLeft: 21, fontFamily: 'Glegoo, serif', fontWeight: 700, fontSize: '0.85rem', color: '#413734' }}>{value}</span>
    </div>
  );
}

function DistanceRow({ city, miles }: { city: string; miles: number }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontFamily: 'Glegoo, serif', fontWeight: 700, fontSize: '0.85rem', color: '#726d6b' }}>{city}</span>
      <span style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: '0.85rem', color: '#413734' }}>{miles} mi</span>
    </div>
  );
}
