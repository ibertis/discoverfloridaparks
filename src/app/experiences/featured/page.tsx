import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import SiteHeader from '@/app/SiteHeader';
import FooterLinks from '@/app/FooterLinks';
import SiteFooter from '@/app/SiteFooter';
import { supabase } from '@/lib/supabase';

export const metadata: Metadata = {
  title: 'Upcoming Trips | Discover Florida Parks',
  description: "Hand-picked Florida trips and featured experiences — curated by the Discover Florida Parks team.",
};

interface Experience {
  id: string;
  name: string;
  description?: string | null;
  duration?: string | null;
  image_url?: string | null;
  href?: string | null;
  cta_label?: string | null;
  placement_type?: string | null;
  expires_at?: string | null;
}

const ClockIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

export default async function FeaturedExperiencesPage() {
  const { data: experiences } = await supabase
    .from('experiences')
    .select('id,name,description,duration,image_url,href,cta_label,placement_type,expires_at')
    .eq('is_active', true)
    .eq('is_featured', true)
    .or('expires_at.is.null,expires_at.gt.now()')
    .order('expires_at', { ascending: true, nullsFirst: false })
    .order('sort_order')
    .order('created_at');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fff' }}>
      <SiteHeader />

      {/* ── Banner ───────────────────────────────────────────────────────── */}
      <div style={{ background: '#362f35', padding: '56px 24px' }}>
        <div style={{ maxWidth: 1278, margin: '0 auto' }}>
          <Link
            href="/experiences"
            style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.45)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 20 }}
            className="hover:text-white transition-colors"
          >
            ← All Experiences
          </Link>
          <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.85rem', fontWeight: 600, color: '#ff7044', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
            Hand-picked by our team
          </p>
          <h1 style={{ fontFamily: 'Shrikhand, cursive', fontWeight: 400, fontSize: 'clamp(2.5rem, 5vw, 4.14rem)', lineHeight: 0.98, color: '#ffffff', margin: '0 0 12px', letterSpacing: '-0.04em' }}>
            Upcoming Trips
          </h1>
          <div style={{ width: 40, height: 3, background: '#ff7044', borderRadius: 2, margin: '0 0 16px' }} />
          <p style={{ fontFamily: 'Glegoo, serif', fontWeight: 400, fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)', margin: 0, maxWidth: 520, lineHeight: 1.65 }}>
            Curated trips and featured experiences we love — from guided adventures to sponsored getaways worth your time.
          </p>
        </div>
      </div>

      {/* ── Grid ─────────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1278, margin: '0 auto', padding: '56px 24px 80px', width: '100%' }}>
        {!experiences || experiences.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ fontFamily: 'Shrikhand, cursive', fontWeight: 400, fontSize: '2rem', color: '#362f35', margin: '0 0 12px', letterSpacing: '-0.04em' }}>
              More Coming Soon
            </p>
            <p style={{ fontFamily: 'Glegoo, serif', fontWeight: 700, fontSize: '0.9rem', color: '#a6967c', margin: '0 0 32px' }}>
              We're curating our next round of featured trips — check back soon.
            </p>
            <Link
              href="/experiences"
              style={{ display: 'inline-block', background: '#ff7044', color: '#fff', borderRadius: '2.3em', padding: '14px 32px', fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none' }}
            >
              Browse All Experiences
            </Link>
          </div>
        ) : (
          <div className="park-cards-grid">
            {experiences.map(exp => (
              <div key={exp.id} style={{ display: 'flex', flexDirection: 'column', background: '#fff', border: '1px solid #eeeeee', borderRadius: 16, overflow: 'hidden' }}>

                {/* Image */}
                {exp.image_url ? (
                  <div style={{ position: 'relative', width: '100%', paddingTop: '60%', background: '#f9f7f5', flexShrink: 0 }}>
                    <Image src={exp.image_url} alt={exp.name} fill style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                  </div>
                ) : (
                  <div style={{ width: '100%', paddingTop: '60%', background: '#f9f7f5', flexShrink: 0, position: 'relative' }}>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontFamily: 'Shrikhand, cursive', fontSize: '2rem', color: '#dfdfdf' }}>DFP</span>
                    </div>
                  </div>
                )}

                {/* Content */}
                <div style={{ padding: '20px 22px 24px', display: 'flex', flexDirection: 'column', flex: 1 }}>

                  {/* Badges */}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                    {exp.duration && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#f5f3f0', borderRadius: '2.3em', padding: '4px 12px', fontFamily: 'Archivo, sans-serif', fontSize: '0.72rem', fontWeight: 600, color: '#726d6b' }}>
                        <ClockIcon />{exp.duration}
                      </span>
                    )}
                    {exp.expires_at && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#fff5f0', borderRadius: '2.3em', padding: '4px 12px', fontFamily: 'Archivo, sans-serif', fontSize: '0.72rem', fontWeight: 600, color: '#ff7044' }}>
                        <CalendarIcon />
                        Until {new Date(exp.expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    )}
                    {exp.placement_type === 'sponsored' && (
                      <span style={{ background: '#f9f7f5', borderRadius: '2.3em', padding: '4px 12px', fontFamily: 'Archivo, sans-serif', fontSize: '0.68rem', fontWeight: 600, color: '#a6967c' }}>
                        Sponsored
                      </span>
                    )}
                  </div>

                  <h2 style={{ fontFamily: 'Shrikhand, cursive', fontWeight: 400, fontSize: '1.5rem', lineHeight: 1.05, color: '#362f35', margin: '0 0 10px', letterSpacing: '-0.03em' }}>
                    {exp.name}
                  </h2>
                  {exp.description && (
                    <p style={{ fontFamily: 'Glegoo, serif', fontWeight: 400, fontSize: '0.85rem', color: '#726d6b', lineHeight: 1.65, margin: '0 0 18px', flex: 1 }}>
                      {exp.description}
                    </p>
                  )}

                  {exp.href && (
                    <a
                      href={exp.href}
                      style={{ display: 'inline-block', alignSelf: 'flex-start', background: '#ff7044', color: '#fff', borderRadius: '2.3em', padding: '10px 24px', fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: '0.82rem', textDecoration: 'none', marginTop: 'auto' }}
                      className="hover:opacity-85 transition-opacity"
                    >
                      {exp.cta_label ?? 'Get Details'} →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <FooterLinks />
      <SiteFooter />
    </div>
  );
}
