'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Map, ChevronRight as ChevronRightIcon } from 'lucide-react';

interface Slide {
  image: string;
  eyebrow: string;
  heading: string;
  subtext: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
}

const SLIDES: Slide[] = [
  {
    image: '/hero-1.jpg',
    eyebrow: 'From hidden gems to world-famous destinations',
    heading: "Florida's Parks\n& Attractions",
    subtext: "Explore the Sunshine State's top parks, beaches, and attractions — all in one place. Find your next adventure today!",
    primaryCta: { label: 'Browse All Parks', href: '/parks' },
    secondaryCta: { label: 'View Map', href: '/map' },
  },
  {
    image: '/hero-2.jpg',
    eyebrow: 'State, national, county, community, theme parks, and more',
    heading: 'Your Ultimate\nFL Park Guide',
    subtext: "Search, plan, and explore with our easy-to-use directory of Florida's most breathtaking parks and outdoor experiences.",
    primaryCta: { label: 'Browse All Parks', href: '/parks' },
    secondaryCta: { label: 'View Map', href: '/map' },
  },
  {
    image: '/hero-3.jpg',
    eyebrow: 'Plan your perfect getaway with expert insights',
    heading: 'Adventure Awaits\n— Start Exploring!',
    subtext: "Whether you're seeking nature, thrills, or relaxation, we provide everything you need to enjoy Florida's best destinations.",
    primaryCta: { label: 'Browse All Parks', href: '/parks' },
    secondaryCta: { label: 'View Map', href: '/map' },
  },
];

export default function HeroSlider({ parkCount: _parkCount }: { parkCount: number }) {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent(i => (i - 1 + SLIDES.length) % SLIDES.length);
  const next = () => setCurrent(i => (i + 1) % SLIDES.length);

  const slide = SLIDES[current];

  return (
    <section style={{ position: 'relative', height: '88vh', minHeight: 600, overflow: 'hidden' }}>
      {/* Background image */}
      <div
        style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(${slide.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transition: 'background-image 0.5s ease',
        }}
      />
      {/* Dark overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(30,25,20,0.52)' }} />

      {/* Content */}
      <div className="hero-content-pad" style={{
        position: 'relative', zIndex: 1,
        maxWidth: 1278, margin: '0 auto',
        height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center',
      }}>
        <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.9rem', fontWeight: 500, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.04em', marginBottom: 16 }}>
          {slide.eyebrow}
        </p>
        <h1 style={{ fontFamily: 'Shrikhand, cursive', fontWeight: 400, fontSize: 'clamp(3rem, 6.5vw, 5.35rem)', lineHeight: 1.0, color: '#fff', margin: '0 0 20px', whiteSpace: 'pre-line', letterSpacing: '-0.04em' }}>
          {slide.heading}
        </h1>
        <div style={{ width: 48, height: 3, background: '#ff7044', marginBottom: 22, borderRadius: 2 }} />
        {slide.subtext && (
          <p style={{ fontFamily: 'Glegoo, serif', fontSize: '0.9rem', fontWeight: 700, color: 'rgba(255,255,255,0.82)', lineHeight: 1.6, marginBottom: 36, maxWidth: 560 }}>
            {slide.subtext}
          </p>
        )}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href={slide.primaryCta.href}
            style={{ background: '#ff7044', color: '#fff', borderRadius: '2.3em', padding: '14px 36px', fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: '1rem', display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}
            className="hover:opacity-90 transition-opacity">
            {slide.primaryCta.label} <ChevronRightIcon size={16} />
          </Link>
          {slide.secondaryCta && (
            <Link href={slide.secondaryCta.href}
              style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', border: '2px solid rgba(255,255,255,0.4)', borderRadius: '2.3em', padding: '14px 36px', fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: '1rem', display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}
              className="hover:bg-white/20 transition-colors">
              <Map size={16} /> {slide.secondaryCta.label}
            </Link>
          )}
        </div>
      </div>

      {/* Arrow — Left */}
      <button onClick={prev} aria-label="Previous slide"
        style={{ position: 'absolute', left: 24, top: '50%', transform: 'translateY(-50%)', zIndex: 2, background: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.4)', borderRadius: '50%', width: 52, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', backdropFilter: 'blur(4px)', transition: 'background 0.2s' }}
        className="hover:bg-white/30">
        <ChevronLeft size={22} />
      </button>

      {/* Arrow — Right */}
      <button onClick={next} aria-label="Next slide"
        style={{ position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)', zIndex: 2, background: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.4)', borderRadius: '50%', width: 52, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', backdropFilter: 'blur(4px)', transition: 'background 0.2s' }}
        className="hover:bg-white/30">
        <ChevronRight size={22} />
      </button>

      {/* Dot indicators */}
      <div style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 2, display: 'flex', gap: 10 }}>
        {SLIDES.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)} aria-label={`Go to slide ${i + 1}`}
            style={{ width: i === current ? 28 : 10, height: 10, borderRadius: 5, border: 'none', cursor: 'pointer', background: i === current ? '#ff7044' : 'rgba(255,255,255,0.5)', transition: 'all 0.3s', padding: 0 }} />
        ))}
      </div>
    </section>
  );
}
