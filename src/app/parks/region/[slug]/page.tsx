import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, MapPin, Calendar, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import SiteHeader from '../../../SiteHeader';
import SiteFooter from '../../../SiteFooter';
import FooterLinks from '../../../FooterLinks';
import ParkCard from '@/components/ParkCard';
import NewsletterSignup from '@/components/NewsletterSignup';

// ─── Types ────────────────────────────────────────────────────────────────────

interface RegionConfig {
  dbValue: string
  title: string
  headline: string
  description: string
  highlights: string[]
  bestFor: string[]
  bestSeason: string
  heroImage: string
  nearbyRegions: string[]
  parkCount: number
}

// ─── Region Map ───────────────────────────────────────────────────────────────

const REGION_MAP: Record<string, RegionConfig> = {
  'central-florida': {
    dbValue: 'Central Florida',
    title: 'Central Florida Parks',
    headline: 'Central Florida\'s Best Parks & Nature Areas',
    description: 'Beyond the theme parks, Central Florida is home to some of Florida\'s most spectacular freshwater springs, ancient forest preserves, and wildlife-rich prairies. Discover 63 parks across Orlando, Ocala, Gainesville, and the heart of the Sunshine State.',
    highlights: ['Silver Springs State Park', 'Wekiwa Springs State Park', 'Paynes Prairie Preserve State Park'],
    bestFor: ['Springs & swimming', 'Wildlife watching', 'Hiking & biking', 'Family day trips'],
    bestSeason: 'Year-round · Peak October–April',
    heroImage: 'region-photos/central-florida.jpg',
    nearbyRegions: ['north-florida', 'tampa-bay-west-coast', 'northeast-florida'],
    parkCount: 63,
  },
  'north-florida': {
    dbValue: 'North Florida',
    title: 'North Florida Parks',
    headline: 'North Florida\'s Wildest & Most Beautiful Parks',
    description: 'Canopy roads draped in Spanish moss, pristine blackwater rivers, and crystal-clear springs make North Florida one of the state\'s most rewarding outdoor destinations. Discover 56 parks across Tallahassee, Gainesville, and Florida\'s forgotten interior.',
    highlights: ['Ichetucknee Springs State Park', 'O\'Leno State Park', 'Torreya State Park'],
    bestFor: ['Spring kayaking', 'Hiking', 'Birding', 'Camping'],
    bestSeason: 'March–November · Peak April–June',
    heroImage: 'region-photos/north-florida.jpg',
    nearbyRegions: ['florida-panhandle', 'central-florida', 'northeast-florida'],
    parkCount: 56,
  },
  'florida-panhandle': {
    dbValue: 'Florida Panhandle',
    title: 'Florida Panhandle Parks',
    headline: 'Florida Panhandle: Emerald Waters & White Sand Beaches',
    description: 'The Panhandle is home to some of America\'s most breathtaking beaches alongside rich pine forests, blackwater rivers, and expansive state forests. Discover 44 parks stretching from Pensacola to Panama City along the Emerald Coast.',
    highlights: ['Grayton Beach State Park', 'Gulf Islands National Seashore', 'Blackwater River State Park'],
    bestFor: ['Beach days', 'Snorkeling', 'Fishing', 'Camping'],
    bestSeason: 'April–October · Peak June–August',
    heroImage: 'region-photos/florida-panhandle.jpg',
    nearbyRegions: ['north-florida'],
    parkCount: 44,
  },
  'south-florida': {
    dbValue: 'South Florida',
    title: 'South Florida Parks',
    headline: 'South Florida Parks: Urban Escapes & Wild Wilderness',
    description: 'South Florida packs extraordinary natural diversity into a compact region — from Everglades wetlands and Biscayne\'s coral reefs to urban nature preserves minutes from Miami. Discover 26 parks across Miami-Dade, Broward, and Palm Beach counties.',
    highlights: ['Everglades National Park', 'Biscayne National Park', 'Bill Baggs Cape Florida State Park'],
    bestFor: ['Wildlife watching', 'Kayaking & canoeing', 'Snorkeling', 'Day trips from Miami'],
    bestSeason: 'November–April · Avoid June–September (heat & rain)',
    heroImage: 'region-photos/south-florida.jpg',
    nearbyRegions: ['florida-keys', 'southeast-florida', 'southwest-florida'],
    parkCount: 26,
  },
  'southeast-florida': {
    dbValue: 'Southeast Florida',
    title: 'Southeast Florida Parks',
    headline: 'Southeast Florida: Treasure Coast Parks & Nature Preserves',
    description: 'The Southeast Florida coast stretches from Fort Lauderdale to Vero Beach, offering a surprising mix of barrier island parks, freshwater preserves, and Atlantic beach escapes across the Treasure Coast and Palm Beach areas.',
    highlights: ['Jonathan Dickinson State Park', 'Hugh Taylor Birch State Park', 'Savannas Preserve State Park'],
    bestFor: ['Beach visits', 'Kayaking', 'Nature walks', 'Family day trips'],
    bestSeason: 'October–May · Peak December–March',
    heroImage: 'region-photos/southeast-florida.jpg',
    nearbyRegions: ['south-florida', 'central-florida', 'florida-keys'],
    parkCount: 25,
  },
  'tampa-bay-west-coast': {
    dbValue: 'Tampa Bay & West Coast',
    title: 'Tampa Bay & Gulf Coast Parks',
    headline: 'Tampa Bay & Gulf Coast: Beaches, Preserves & Island Parks',
    description: 'The Tampa Bay area and Florida\'s central Gulf Coast blend vibrant urban parks with stunning barrier island beaches and wildlife-rich preserves. Discover 25 parks across Tampa, St. Petersburg, Clearwater, and Sarasota.',
    highlights: ['Caladesi Island State Park', 'Fort De Soto Park', 'Oscar Scherer State Park'],
    bestFor: ['Beaches & shelling', 'Kayaking', 'Wildlife watching', 'Family trips'],
    bestSeason: 'Year-round · Peak October–April',
    heroImage: 'region-photos/tampa-bay-west-coast.jpg',
    nearbyRegions: ['central-florida', 'southwest-florida', 'north-florida'],
    parkCount: 25,
  },
  'northeast-florida': {
    dbValue: 'Northeast Florida',
    title: 'Northeast Florida Parks',
    headline: 'Northeast Florida: History, Coast & Natural Wonders',
    description: 'Northeast Florida combines rich colonial history with dramatic Atlantic coastline, ancient forests, and freshwater springs. Discover 21 parks across Jacksonville, St. Augustine, Daytona Beach, and the First Coast.',
    highlights: ['Fort Clinch State Park', 'Fort Matanzas National Monument', 'Little Talbot Island State Park'],
    bestFor: ['History & heritage', 'Beach visits', 'Birding', 'Hiking'],
    bestSeason: 'October–May · Peak March–April',
    heroImage: 'region-photos/northeast-florida.jpg',
    nearbyRegions: ['north-florida', 'central-florida'],
    parkCount: 21,
  },
  'florida-keys': {
    dbValue: 'Florida Keys',
    title: 'Florida Keys Parks',
    headline: 'Florida Keys Parks: Reef, Sea & Island Adventures',
    description: 'The Florida Keys chain offers some of the most spectacular marine environments in North America. Explore living coral reefs, tropical hardwood hammocks, and turquoise waters across 12 parks from Key Largo to the Dry Tortugas.',
    highlights: ['John Pennekamp Coral Reef State Park', 'Dry Tortugas National Park', 'Bahia Honda State Park'],
    bestFor: ['Snorkeling & diving', 'Kayaking', 'Sunset watching', 'Camping'],
    bestSeason: 'December–April · Avoid September–October (hurricane season)',
    heroImage: 'region-photos/florida-keys.jpg',
    nearbyRegions: ['south-florida', 'southeast-florida'],
    parkCount: 12,
  },
  'southwest-florida': {
    dbValue: 'Southwest Florida',
    title: 'Southwest Florida Parks',
    headline: 'Southwest Florida: Gulf Beaches, Preserves & Island Parks',
    description: 'Southwest Florida blends pristine Gulf Coast beaches with mangrove islands, wildlife-rich estuaries, and nature preserves. Discover 10 parks across Naples, Fort Myers, and Charlotte Harbor — including some of Florida\'s most secluded barrier islands.',
    highlights: ['Cayo Costa State Park', 'Lovers Key State Park', 'Delnor-Wiggins Pass State Park'],
    bestFor: ['Beach days', 'Shelling', 'Kayaking', 'Birdwatching'],
    bestSeason: 'November–April · Peak January–March',
    heroImage: 'region-photos/southwest-florida.jpg',
    nearbyRegions: ['south-florida', 'tampa-bay-west-coast'],
    parkCount: 10,
  },
};

// ─── Static generation ────────────────────────────────────────────────────────

export async function generateStaticParams() {
  return Object.keys(REGION_MAP).map(slug => ({ slug }));
}

export const revalidate = 3600;

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const region = REGION_MAP[slug];
  if (!region) return {};

  const heroUrl = `https://dteajahghspuqrczutgp.supabase.co/storage/v1/object/public/park-photos/region-photos/${slug}.jpg`;

  return {
    title: `${region.title} | Discover Florida Parks`,
    description: region.description,
    openGraph: {
      title: region.headline,
      description: region.description,
      images: [{ url: heroUrl, alt: region.headline }],
    },
    alternates: {
      canonical: `https://discoverfloridaparks.com/parks/region/${slug}`,
    },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface Park {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  featured_image_url: string | null;
  city: string | null;
  county: string | null;
  park_types: string[] | null;
  park_regions: string[] | null;
  entrance_fee: string | null;
  google_rating: number | null;
}

export default async function RegionHubPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const region = REGION_MAP[slug];
  if (!region) notFound();

  const { data } = await supabase
    .from('parks')
    .select('id, name, slug, short_description, featured_image_url, city, county, park_types, park_regions, entrance_fee, google_rating')
    .contains('park_regions', [region.dbValue])
    .order('name');

  const allParks: Park[] = data ?? [];
  const featuredParks = allParks.filter(p => region.highlights.includes(p.name));

  const heroUrl = `https://dteajahghspuqrczutgp.supabase.co/storage/v1/object/public/park-photos/region-photos/${slug}.jpg`;

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',  item: 'https://discoverfloridaparks.com' },
      { '@type': 'ListItem', position: 2, name: 'Parks', item: 'https://discoverfloridaparks.com/parks' },
      { '@type': 'ListItem', position: 3, name: region.title, item: `https://discoverfloridaparks.com/parks/region/${slug}` },
    ],
  };

  return (
    <div style={{ background: '#fff', color: '#413734' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <SiteHeader />

      {/* ── Hero ──────────────────────────────────────────────────────────────── */}
      <div style={{ position: 'relative', height: '60vh', minHeight: 420, background: '#362f35', overflow: 'hidden' }}>
        <Image
          src={heroUrl}
          alt={region.headline}
          fill
          priority
          style={{ objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.65) 100%)' }} />

        <div style={{ position: 'absolute', inset: 0, maxWidth: 1278, margin: '0 auto', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '0 24px 52px' }}>
          {/* Breadcrumb */}
          <nav style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Archivo, sans-serif', fontSize: '0.78rem', color: 'rgba(255,255,255,0.65)' }}>
            <Link href="/" style={{ color: 'rgba(255,255,255,0.65)', textDecoration: 'none' }} className="hover:text-white">Home</Link>
            <span>/</span>
            <Link href="/parks" style={{ color: 'rgba(255,255,255,0.65)', textDecoration: 'none' }} className="hover:text-white">Parks</Link>
            <span>/</span>
            <span style={{ color: '#fff' }}>{region.title}</span>
          </nav>

          {/* Badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
            <span style={{ background: '#ff7044', color: '#fff', borderRadius: '2.3em', padding: '5px 16px', fontFamily: 'Archivo, sans-serif', fontSize: '0.78rem', fontWeight: 700 }}>
              {allParks.length} Parks
            </span>
            <span style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(4px)', color: '#fff', borderRadius: '2.3em', padding: '5px 16px', fontFamily: 'Archivo, sans-serif', fontSize: '0.78rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Calendar size={12} /> {region.bestSeason}
            </span>
          </div>

          <h1 style={{ fontFamily: 'Shrikhand, cursive', fontWeight: 400, fontSize: 'clamp(2.2rem, 5vw, 4.14rem)', lineHeight: 0.98, color: '#fff', margin: 0, letterSpacing: '-0.04em' }}>
            {region.headline}
          </h1>
        </div>
      </div>

      {/* ── Region Intro ──────────────────────────────────────────────────────── */}
      <section style={{ background: '#f9f7f5', borderBottom: '1px solid #eeeeee', padding: '52px 24px' }}>
        <div style={{ maxWidth: 1278, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr auto', gap: 48, alignItems: 'start' }}>
          <div>
            <p style={{ fontFamily: 'Glegoo, serif', fontWeight: 700, fontSize: '1.05rem', lineHeight: 1.7, color: '#413734', margin: 0, maxWidth: 720 }}>
              {region.description}
            </p>
          </div>
          <div style={{ minWidth: 220 }}>
            <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.72rem', fontWeight: 700, color: '#a6967c', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12, marginTop: 0 }}>
              Best For
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {region.bestFor.map(item => (
                <span key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Archivo, sans-serif', fontSize: '0.85rem', fontWeight: 600, color: '#362f35' }}>
                  <Check size={14} style={{ color: '#ff7044', flexShrink: 0 }} /> {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured Parks ────────────────────────────────────────────────────── */}
      {featuredParks.length > 0 && (
        <section style={{ maxWidth: 1278, margin: '0 auto', padding: '72px 24px' }}>
          <div style={{ marginBottom: 40 }}>
            <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.85rem', fontWeight: 600, color: '#a6967c', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, marginTop: 0 }}>
              Editor&apos;s Picks
            </p>
            <h2 style={{ fontFamily: 'Shrikhand, cursive', fontWeight: 400, fontSize: 'clamp(2rem, 3.5vw, 3.2rem)', lineHeight: 0.98, color: '#362f35', margin: 0 }}>
              Can&apos;t-Miss Parks
            </h2>
          </div>

          <div className="grid-featured">
            {featuredParks.map(park => (
              <Link key={park.slug} href={`/parks/${park.slug}`}
                style={{ display: 'flex', flexDirection: 'column', borderRadius: 16, overflow: 'hidden', border: '1px solid #eeeeee', background: '#fff', textDecoration: 'none', transition: 'box-shadow 0.2s' }}
                className="group hover:shadow-lg">
                <div style={{ position: 'relative', height: 280, overflow: 'hidden', background: '#f0ece6', flexShrink: 0 }}>
                  {park.featured_image_url ? (
                    <Image
                      src={park.featured_image_url}
                      alt={park.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      style={{ objectFit: 'cover', transition: 'transform 0.5s' }}
                      className="group-hover:scale-105"
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: '#e8e0d6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <MapPin size={36} style={{ color: '#a6967c' }} />
                    </div>
                  )}
                  {park.park_types?.[0] && (
                    <span style={{ position: 'absolute', top: 14, right: 14, background: '#ff7044', color: '#fff', borderRadius: '2.3em', padding: '4px 12px', fontFamily: 'Archivo, sans-serif', fontSize: '0.72rem', fontWeight: 700 }}>
                      {park.park_types[0]}
                    </span>
                  )}
                </div>
                <div style={{ padding: '22px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontFamily: 'Shrikhand, cursive', fontWeight: 400, fontSize: '1.7rem', lineHeight: 1.0, color: '#362f35', margin: '0 0 6px', letterSpacing: '-0.04em' }}>
                    {park.name}
                  </h3>
                  {park.city && (
                    <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.78rem', color: '#a6967c', display: 'flex', alignItems: 'center', gap: 4, margin: '0 0 12px' }}>
                      <MapPin size={11} /> {park.city}{park.county ? `, ${park.county} County` : ''}
                    </p>
                  )}
                  {park.short_description && (
                    <p style={{ fontFamily: 'Glegoo, serif', fontWeight: 700, fontSize: '0.85rem', color: '#726d6b', lineHeight: 1.55, flex: 1, margin: '0 0 18px' }}>
                      {park.short_description}
                    </p>
                  )}
                  <span style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.82rem', fontWeight: 700, color: '#ff7044', display: 'flex', alignItems: 'center', gap: 5 }}>
                    View Park <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── All Parks ─────────────────────────────────────────────────────────── */}
      <section style={{ background: '#f9f7f5', borderTop: '1px solid #eeeeee', padding: '72px 24px' }}>
        <div style={{ maxWidth: 1278, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 40 }}>
            <h2 style={{ fontFamily: 'Shrikhand, cursive', fontWeight: 400, fontSize: 'clamp(2rem, 3.5vw, 3.2rem)', lineHeight: 0.98, color: '#362f35', margin: 0 }}>
              All {region.title}
            </h2>
            <span style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.85rem', fontWeight: 600, color: '#a6967c' }}>
              {allParks.length} parks
            </span>
          </div>

          <div className="park-cards-grid">
            {allParks.map(park => (
              <ParkCard key={park.slug} park={park} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Nearby Regions ────────────────────────────────────────────────────── */}
      {region.nearbyRegions.length > 0 && (
        <section style={{ maxWidth: 1278, margin: '0 auto', padding: '72px 24px' }}>
          <div style={{ marginBottom: 40 }}>
            <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.85rem', fontWeight: 600, color: '#a6967c', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, marginTop: 0 }}>
              Keep Exploring
            </p>
            <h2 style={{ fontFamily: 'Shrikhand, cursive', fontWeight: 400, fontSize: 'clamp(2rem, 3.5vw, 3.2rem)', lineHeight: 0.98, color: '#362f35', margin: 0 }}>
              Nearby Regions
            </h2>
          </div>

          <div className="grid-regions" style={{ gridTemplateColumns: `repeat(${Math.min(region.nearbyRegions.length, 3)}, 1fr)` }}>
            {region.nearbyRegions.map(nearbySlug => {
              const nearby = REGION_MAP[nearbySlug];
              if (!nearby) return null;
              return (
                <Link key={nearbySlug} href={`/parks/region/${nearbySlug}`}
                  style={{ background: '#fff', border: '1px solid #eeeeee', borderRadius: 16, padding: '28px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, textDecoration: 'none', transition: 'box-shadow 0.2s, border-color 0.2s' }}
                  className="hover:shadow-md hover:border-[#ff7044]">
                  <div>
                    <p style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: '1rem', color: '#362f35', margin: '0 0 4px' }}>{nearby.title}</p>
                    <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.82rem', color: '#a6967c', margin: 0 }}>{nearby.parkCount} parks</p>
                  </div>
                  <ArrowRight size={18} style={{ color: '#ff7044', flexShrink: 0 }} />
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Newsletter ────────────────────────────────────────────────────────── */}
      <section style={{ background: '#f9f7f5', borderTop: '1px solid #eeeeee', padding: '72px 24px' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <NewsletterSignup variant="card" source={`region-hub-${slug}`} />
        </div>
      </section>

      <FooterLinks />
      <SiteFooter />
    </div>
  );
}
