import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import {
  MapPin, Phone, Globe, Clock, DollarSign, Star, Users, Calendar,
  Tent, Fish, Waves, Dog, Ship, TreePine, ParkingCircle, AlertTriangle,
  Leaf, Footprints, Sparkles, ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import SiteHeader from '../../SiteHeader';
import SiteFooter from '../../SiteFooter';
import FooterLinks from '../../FooterLinks';
import PhotoGallery from './PhotoGallery';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Trail {
  id: string; name: string; difficulty: string; length_miles: number; description: string; sort_order: number;
}
interface FunFact { id: string; fact: string; sort_order: number; }
interface SeasonalEvent { id: string; event_name: string; month: string; description: string; sort_order: number; }
interface Park {
  id: string; slug: string; name: string; short_description: string; full_description: string;
  park_type: string; park_regions: string[]; county: string; park_status: string;
  featured_image_url: string; gallery_urls: string[];
  address: string; city: string; zip_code: string;
  latitude: number; longitude: number;
  entrance_fee: string; operating_hours: string; website: string; phone: string; email: string;
  google_maps_link: string; google_rating: number;
  managing_agency: string; year_established: number; park_size_acres: number;
  best_season: string; typical_visit_duration: string; crowd_level: string;
  visitor_tips: string; safety_notes: string; parking_info: string;
  wildlife_summary: string; terrain: string; instagram_hashtag: string;
  nearby_cities: string; is_featured: boolean;
  distance_from_miami: number; distance_from_orlando: number; distance_from_tampa: number;
  seo_title: string; seo_description: string;
  reservation_required: boolean; camping_url: string; reservation_url: string;
  park_amenities: {
    dog_friendly: boolean; camping_available: boolean; swimming_allowed: boolean;
    fishing_allowed: boolean; boat_launch: boolean; picnic_areas: boolean;
    visitor_center: boolean; wheelchair_accessible: boolean;
  };
  park_trails: Trail[];
  park_fun_facts: FunFact[];
  park_seasonal_events: SeasonalEvent[];
}

// ─── Data fetching ────────────────────────────────────────────────────────────

async function getPark(slug: string): Promise<Park | null> {
  const { data, error } = await supabase
    .from('parks')
    .select(`*, park_amenities(*), park_trails(*), park_fun_facts(*), park_seasonal_events(*)`)
    .eq('slug', slug)
    .single();
  if (error || !data) return null;
  return data as Park;
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
  const url = `https://discoverfloridaparks.com/parks/${park.slug}`;
  const image = park.featured_image_url || 'https://discoverfloridaparks.com/hero-1.jpg';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      images: [{ url: image, alt: park.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ParkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const park = await getPark(slug);
  if (!park) notFound();

  const amenities = park.park_amenities ?? {};
  const trails = park.park_trails?.sort((a, b) => a.sort_order - b.sort_order) ?? [];
  const facts = park.park_fun_facts?.sort((a, b) => a.sort_order - b.sort_order) ?? [];
  const events = park.park_seasonal_events?.sort((a, b) => a.sort_order - b.sort_order) ?? [];

  const amenityList = [
    { label: 'Dog Friendly',   icon: Dog,           active: amenities.dog_friendly },
    { label: 'Camping',        icon: Tent,          active: amenities.camping_available },
    { label: 'Swimming',       icon: Waves,         active: amenities.swimming_allowed },
    { label: 'Fishing',        icon: Fish,          active: amenities.fishing_allowed },
    { label: 'Boat Launch',    icon: Ship,          active: amenities.boat_launch },
    { label: 'Picnic Areas',   icon: TreePine,      active: amenities.picnic_areas },
    { label: 'Visitor Center', icon: MapPin,        active: amenities.visitor_center },
    { label: 'Accessible',     icon: ParkingCircle, active: amenities.wheelchair_accessible },
  ].filter(a => a.active);

  const parkUrl = `https://discoverfloridaparks.com/parks/${park.slug}`;

  const touristAttractionSchema = {
    '@context': 'https://schema.org',
    '@type': 'TouristAttraction',
    name: park.name,
    description: park.short_description,
    url: parkUrl,
    ...(park.featured_image_url && { image: park.featured_image_url }),
    ...(park.latitude && park.longitude && {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: park.latitude,
        longitude: park.longitude,
      },
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
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://discoverfloridaparks.com' },
      { '@type': 'ListItem', position: 2, name: 'Parks', item: 'https://discoverfloridaparks.com/parks' },
      { '@type': 'ListItem', position: 3, name: park.name, item: parkUrl },
    ],
  };

  return (
    <div style={{ background: '#fff', color: '#413734', minHeight: '100vh' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(touristAttractionSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

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
            {park.park_type && (
              <span style={{ background: '#ff7044', color: '#fff', borderRadius: '2.3em', padding: '4px 14px', fontFamily: 'Archivo, sans-serif', fontSize: '0.75rem', fontWeight: 700 }}>
                {park.park_type}
              </span>
            )}
            {park.park_regions?.length > 0 && park.park_regions.map(r => (
              <span key={r} style={{ background: 'rgba(255,255,255,0.18)', color: '#fff', borderRadius: '2.3em', padding: '4px 14px', fontFamily: 'Archivo, sans-serif', fontSize: '0.75rem', fontWeight: 600 }}>
                {r}
              </span>
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

      {/* ── Body ────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1278, margin: '0 auto', padding: '48px 24px' }}>

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
        </div>

        <div className="park-detail-layout">

          {/* Main content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>

            {/* About */}
            {park.full_description && (
              <section>
                <SectionHeading>About {park.name}</SectionHeading>
                <div style={{ fontFamily: 'Glegoo, serif', fontWeight: 700, fontSize: '1rem', color: '#726d6b', lineHeight: 1.65 }}>
                  {park.full_description.split('\n').map((line, i) => (
                    <p key={i} style={{ margin: '0 0 1em' }}>{line}</p>
                  ))}
                </div>
              </section>
            )}

            {/* Gallery */}
            {park.gallery_urls?.length > 0 && (
              <section>
                <SectionHeading>Photos</SectionHeading>
                <PhotoGallery urls={park.gallery_urls} />
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
            {park.visitor_tips && (
              <section>
                <SectionHeading>Visitor Tips</SectionHeading>
                <div style={{ borderRadius: 16, padding: '20px 24px', border: '1px solid #eeeeee', background: '#fff', display: 'flex', gap: 14 }}>
                  <Sparkles size={18} style={{ flexShrink: 0, marginTop: 2, color: '#ff7044' }} />
                  <p style={{ fontFamily: 'Glegoo, serif', fontWeight: 700, fontSize: '0.9rem', color: '#726d6b', lineHeight: 1.65, margin: 0 }}>{park.visitor_tips}</p>
                </div>
              </section>
            )}

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

          </div>

          {/* Sidebar */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Info card */}
            <div style={{ borderRadius: 16, padding: '24px', border: '1px solid #eeeeee', background: '#fff' }}>
              <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.72rem', fontWeight: 600, color: '#a6967c', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 20px' }}>
                Park Info
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
                {park.entrance_fee     && <InfoRow icon={<DollarSign size={14} />} label="Entrance Fee" value={park.entrance_fee} />}
                {park.operating_hours  && <InfoRow icon={<Clock size={14} />}      label="Hours"        value={park.operating_hours} />}
                {park.phone            && <InfoRow icon={<Phone size={14} />}      label="Phone"        value={park.phone} />}
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
                {park.camping_url && (
                  <a href={park.camping_url} target="_blank" rel="noopener noreferrer"
                    style={{ background: 'transparent', color: '#413734', border: '2px solid #dfdfdf', borderRadius: '2.3em', padding: '11px 20px', fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, textDecoration: 'none' }}
                    className="hover:border-[#413734] transition-colors">
                    <Tent size={14} /> Book Camping
                  </a>
                )}
              </div>
            </div>

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

            {/* Back to directory */}
            <Link href="/parks"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#f9f7f5', border: '1px solid #eeeeee', borderRadius: '2.3em', padding: '12px 20px', fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: '0.85rem', color: '#413734', textDecoration: 'none' }}
              className="hover:bg-[#f0ece6] transition-colors">
              <ArrowLeft size={14} /> Back to All Parks
            </Link>

          </aside>
        </div>
      </div>

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
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontFamily: 'Archivo, sans-serif', fontSize: '0.72rem', fontWeight: 600, color: '#a6967c', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {icon} {label}
      </div>
      <p style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: '1rem', color: '#413734', margin: 0 }}>{value}</p>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <span style={{ flexShrink: 0, marginTop: 2, color: '#ff7044' }}>{icon}</span>
      <div>
        <span style={{ display: 'block', fontFamily: 'Archivo, sans-serif', fontSize: '0.7rem', fontWeight: 600, color: '#a6967c', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>{label}</span>
        <span style={{ fontFamily: 'Glegoo, serif', fontWeight: 700, fontSize: '0.85rem', color: '#413734' }}>{value}</span>
      </div>
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

