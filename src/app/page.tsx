import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export const metadata: Metadata = {
  title: 'Discover Florida Parks — State Parks, National Parks & Outdoor Attractions',
  description: 'Your all-in-one guide to Florida\'s best parks, beaches, and outdoor adventures. Browse 49+ state parks, national parks, wildlife refuges, and more.',
  openGraph: {
    title: 'Discover Florida Parks',
    description: 'Your all-in-one guide to Florida\'s best parks, beaches, and outdoor adventures.',
    url: 'https://discoverfloridaparks.com',
    images: [{ url: 'https://discoverfloridaparks.com/hero-1.jpg', width: 1280, height: 853, alt: 'Discover Florida Parks' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Discover Florida Parks',
    description: 'Your all-in-one guide to Florida\'s best parks, beaches, and outdoor adventures.',
    images: ['https://discoverfloridaparks.com/hero-1.jpg'],
  },
  alternates: { canonical: 'https://discoverfloridaparks.com' },
};
import { ArrowRight, Map as MapIcon } from 'lucide-react';
import { WavesIcon, TicketIcon, RocketIcon, PlantIcon, UmbrellaIcon, MountainsIcon, TreeIcon, BirdIcon, StarIcon as PhosphorStar, TreePalmIcon, DropIcon } from '@phosphor-icons/react/dist/ssr';
import type { Icon } from '@phosphor-icons/react/dist/lib/types';
import HeroSlider from './HeroSlider';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';
import FooterLinks from './FooterLinks';
import VideoPlayButton from './VideoModal';
import HomeMapSection from './HomeMapSection';
import FeaturedExperiences from './FeaturedExperiences';
import ParkCard from '@/components/ParkCard';

const REGIONS: { name: string; icon: Icon; description: string }[] = [
  { name: 'South Florida',                 icon: WavesIcon,    description: 'Everglades, Keys & Miami' },
  { name: 'Central Florida',               icon: TicketIcon,   description: 'Orlando & inland lakes' },
  { name: 'East Coast',                    icon: RocketIcon,   description: 'Space Coast & springs' },
  { name: 'North Florida',                 icon: PlantIcon,    description: 'Historic parks & springs' },
  { name: 'Northwest Florida / Panhandle', icon: UmbrellaIcon, description: 'White sand beaches' },
];

const TYPES: { name: string; icon: Icon }[] = [
  { name: 'National Parks',           icon: MountainsIcon  },
  { name: 'State Parks',              icon: TreeIcon       },
  { name: 'National Wildlife Refuge', icon: BirdIcon       },
  { name: 'Theme Parks',              icon: PhosphorStar   },
  { name: 'County Parks',             icon: TreePalmIcon   },
  { name: 'Water Parks',              icon: DropIcon       },
];

export default async function HomePage() {
  const { data: featuredParks } = await supabase
    .from('parks')
    .select('id, slug, name, short_description, park_type, park_region, featured_image_url, google_rating')
    .eq('is_featured', true)
    .order('name')
    .limit(6);

  const { count } = await supabase
    .from('parks')
    .select('*', { count: 'exact', head: true });

  return (
    <div style={{ background: '#fff', color: '#413734' }}>

      {/* ── Nav ─────────────────────────────────────────────── */}
      <SiteHeader />

      {/* ── Hero Slider ─────────────────────────────────────── */}
      <HeroSlider parkCount={count ?? 49} />

      {/* ── Intro / About ───────────────────────────────────── */}
      <section style={{ background: '#fff', overflow: 'hidden' }}>
        <div
          className="intro-grid-mobile"
          style={{
            maxWidth: 1278,
            margin: '0 auto',
            padding: '80px 24px 40px',
            display: 'grid',
            gridTemplateColumns: '2.2fr 24px 1.6fr 28px',
            gridTemplateRows: 'auto auto',
            gap: '20px 0',
          }}
        >
          {/* Rows 1–2, Col 1 — Text + kayak side by side, couple image below */}
          <div style={{ gridColumn: 1, gridRow: '1 / 3', display: 'flex', flexDirection: 'column', gap: 20, padding: 20 }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{ padding: 20 }}>
                <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.82rem', fontWeight: 600, color: '#a6967c', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 10px' }}>
                  Welcome to
                </p>
                <h2 style={{ fontFamily: 'Shrikhand, cursive', fontWeight: 400, fontSize: '2.2rem', lineHeight: 0.97, color: '#362f35', margin: '0 0 20px', letterSpacing: '-0.04em' }}>
                  Discover<br />Florida Parks
                </h2>
                <VideoPlayButton />
              </div>
              <div className="intro-hide-mobile" style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ width: '80%', borderRadius: 12, overflow: 'hidden' }}>
                  <Image src="/planning-florida-trip.jpg" alt="Kayaking at sunset in Florida"
                    width={600} height={400} style={{ width: '100%', height: 'auto', display: 'block' }} />
                </div>
              </div>
            </div>
            <div className="intro-hide-mobile" style={{ borderRadius: 12, overflow: 'hidden', width: '90%' }}>
              <Image src="/plan-your-trip.jpg" alt="Couple planning a Florida trip"
                width={600} height={400} style={{ width: '100%', height: 'auto', display: 'block' }} />
            </div>
          </div>

          {/* Row 1, Col 3 — "Great Outdoors!" heading + description + CTA */}
          <div style={{ gridColumn: 3, gridRow: 1, padding: 20 }}>
            <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.82rem', fontWeight: 600, color: '#a6967c', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 10px' }}>
              Your Guide to the Sunshine State&apos;s
            </p>
            <h2 style={{ fontFamily: 'Shrikhand, cursive', fontWeight: 400, fontSize: 'clamp(3.2rem, 5.8vw, 6.4rem)', lineHeight: 0.88, color: '#362f35', margin: '0 0 28px', letterSpacing: '-0.04em' }}>
              Great<br />Outdoors!
            </h2>
            <div style={{ width: 44, height: 3, background: '#a6967c', marginBottom: 28, borderRadius: 2 }} />
            <p style={{ fontFamily: 'Glegoo, serif', fontWeight: 700, fontSize: '0.82rem', color: '#726d6b', lineHeight: 1.7, marginBottom: 40 }}>
              DiscoverFloridaParks.com is your all-in-one guide to the best parks, natural attractions, and outdoor experiences across Florida. From world-famous national parks to neighborhood nature trails, we make it easy to find the perfect place to explore, relax, or plan your next getaway.
            </p>
            <Link href="/parks"
              style={{ background: '#ff7044', color: '#fff', borderRadius: '2.3em', padding: '14px 36px', fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}
              className="hover:opacity-90 transition-opacity">
              Adventure Starts Here <ArrowRight size={15} />
            </Link>
          </div>

          {/* Row 2, Col 3 — Phone mockup */}
          <div
            className="intro-hide-mobile"
            style={{ gridColumn: 3, gridRow: 2 }}
          >
            <div style={{ width: '95%', borderRadius: 12, overflow: 'hidden' }}>
              <Image src="/your-ultimate-park-guide.jpg" alt="Discover Florida Parks on mobile"
                width={600} height={400} style={{ width: '100%', height: 'auto', display: 'block' }} />
            </div>
          </div>

          {/* Rows 1–2, Col 4 — Vertical "plan my trip" label */}
          <div
            className="intro-hide-mobile"
            style={{ gridColumn: 4, gridRow: '1 / 3', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 12, gap: 10 }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#413734" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="18 15 12 9 6 15" />
            </svg>
            <span style={{ fontFamily: 'Shrikhand, cursive', fontWeight: 400, fontSize: '1.4rem', color: '#413734', writingMode: 'vertical-rl', transform: 'rotate(180deg)', letterSpacing: '-0.04em' }}>
              plan my trip
            </span>
          </div>

        </div>
      </section>

      {/* ── Featured Parks ──────────────────────────────────── */}
      {featuredParks && featuredParks.length > 0 && (
        <section style={{ maxWidth: 1278, margin: '0 auto', padding: '40px 24px 80px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 48 }}>
            <div>
              <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.85rem', fontWeight: 600, color: '#a6967c', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
                Editor&apos;s Picks
              </p>
              <h2 style={{ fontFamily: 'Shrikhand, cursive', fontWeight: 400, fontSize: 'clamp(2.5rem, 4vw, 4.14rem)', lineHeight: 0.98, color: '#362f35', margin: 0 }}>
                Featured Parks
              </h2>
            </div>
            <Link href="/parks" style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.9rem', fontWeight: 700, color: '#ff7044', display: 'flex', alignItems: 'center', gap: 6 }}
              className="hover:opacity-70 transition-opacity">
              View all parks <ArrowRight size={15} />
            </Link>
          </div>

          <div className="grid-featured">
            {featuredParks.map(park => <ParkCard key={park.id} park={park} />)}
          </div>
        </section>
      )}

      {/* ── Browse by Region ────────────────────────────────── */}
      <section style={{ background: '#f9f7f5', borderTop: '1px solid #eeeeee', borderBottom: '1px solid #eeeeee', padding: '80px 24px' }}>
        <div style={{ maxWidth: 1278, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.85rem', fontWeight: 600, color: '#a6967c', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
              Explore by Location
            </p>
            <h2 style={{ fontFamily: 'Shrikhand, cursive', fontWeight: 400, fontSize: 'clamp(2.5rem, 4vw, 4.14rem)', lineHeight: 0.98, color: '#362f35', margin: 0 }}>
              Browse by Region
            </h2>
          </div>
          <div className="grid-regions">
            {REGIONS.map(r => (
              <Link key={r.name} href={`/parks?region=${encodeURIComponent(r.name)}`}
                style={{ background: '#fff', border: '1px solid #eeeeee', borderRadius: 16, padding: '24px 28px', display: 'flex', alignItems: 'center', gap: 18, transition: 'box-shadow 0.2s' }}
                className="hover:shadow-md">
                <r.icon weight="fill" size={36} color="#ff7044" style={{ flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: '0.95rem', color: '#362f35', margin: '0 0 3px' }}>{r.name}</p>
                  <p style={{ fontFamily: 'Glegoo, serif', fontSize: '0.82rem', color: '#a6967c', margin: 0 }}>{r.description}</p>
                </div>
                <ArrowRight size={16} style={{ color: '#ff7044', flexShrink: 0 }} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Browse by Type ──────────────────────────────────── */}
      <section style={{ maxWidth: 1278, margin: '0 auto', padding: '80px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.85rem', fontWeight: 600, color: '#a6967c', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
            Find Your Adventure
          </p>
          <h2 style={{ fontFamily: 'Shrikhand, cursive', fontWeight: 400, fontSize: 'clamp(2.5rem, 4vw, 4.14rem)', lineHeight: 0.98, color: '#362f35', margin: 0 }}>
            Browse by Park Type
          </h2>
        </div>
        <div className="grid-types">
          {TYPES.map(t => (
            <Link key={t.name} href={`/parks?type=${encodeURIComponent(t.name)}`}
              style={{ background: '#fff', border: '1px solid #eeeeee', borderRadius: 16, padding: '28px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, transition: 'box-shadow 0.2s, border-color 0.2s', textAlign: 'center' }}
              className="hover:shadow-md hover:border-[#ff7044]">
              <t.icon weight="fill" size={40} color="#ff7044" />
              <p style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: '0.8rem', color: '#362f35', margin: 0, lineHeight: 1.3 }}>{t.name}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── In Our Backyard (decorative map) ───────────────── */}
      <HomeMapSection />

      {/* ── Featured Experiences ─────────────────────────────── */}
      <FeaturedExperiences />

      {/* ── Map CTA ─────────────────────────────────────────── */}
      <section style={{ background: '#362f35', padding: '80px 24px' }}>
        <div style={{ maxWidth: 1278, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.85rem', fontWeight: 600, color: '#a6967c', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
            Interactive Map
          </p>
          <h2 style={{ fontFamily: 'Shrikhand, cursive', fontWeight: 400, fontSize: 'clamp(2.5rem, 4vw, 4.14rem)', lineHeight: 0.98, color: '#fff', margin: '0 0 20px' }}>
            See All {count ?? 49} Parks on a Map
          </h2>
          <div style={{ width: 60, height: 3, background: '#ff7044', margin: '0 auto 24px' }} />
          <p style={{ fontFamily: 'Glegoo, serif', fontSize: '1rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, maxWidth: 500, margin: '0 auto 36px' }}>
            Explore Florida&apos;s parks geographically. Click any marker to learn more and plan your next adventure.
          </p>
          <Link href="/map"
            style={{ background: '#ff7044', color: '#fff', borderRadius: '2.3em', padding: '16px 44px', fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: '1rem', display: 'inline-flex', alignItems: 'center', gap: 10 }}
            className="hover:opacity-90 transition-opacity">
            <MapIcon size={18} /> Open the Map
          </Link>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <FooterLinks />
      <SiteFooter />
    </div>
  );
}

