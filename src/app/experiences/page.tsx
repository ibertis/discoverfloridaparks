import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import SiteHeader from '@/app/SiteHeader';
import FooterLinks from '@/app/FooterLinks';
import SiteFooter from '@/app/SiteFooter';
import { supabase } from '@/lib/supabase';

export const metadata: Metadata = {
  title: 'Experiences & Deals | Discover Florida Parks',
  description: "Guided tours, adventures, and one-of-a-kind experiences across Florida's parks and natural spaces.",
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
  is_featured?: boolean | null;
}

const ClockIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);

export default async function ExperiencesPage() {
  const { data: experiences } = await supabase
    .from('experiences')
    .select('id,name,description,duration,image_url,href,cta_label,placement_type,is_featured')
    .eq('is_active', true)
    .or('expires_at.is.null,expires_at.gt.now()')
    .order('sort_order')
    .order('created_at');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fff' }}>
      <SiteHeader />

      {/* ── Banner ───────────────────────────────────────────────────────── */}
      <div style={{ background: '#f9f7f5', borderBottom: '1px solid #eeeeee', padding: '56px 24px' }}>
        <div style={{ maxWidth: 1278, margin: '0 auto' }}>
          <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.85rem', fontWeight: 600, color: '#a6967c', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
            Explore &amp; Experience
          </p>
          <h1 style={{ fontFamily: 'Shrikhand, cursive', fontWeight: 400, fontSize: 'clamp(2.5rem, 5vw, 4.14rem)', lineHeight: 0.98, color: '#362f35', margin: '0 0 12px', letterSpacing: '-0.04em' }}>
            Florida Experiences &amp; Deals
          </h1>
          <p style={{ fontFamily: 'Glegoo, serif', fontWeight: 700, fontSize: '0.95rem', color: '#726d6b', margin: '0 0 20px' }}>
            Guided tours, adventures, and curated experiences across Florida's natural spaces.
          </p>
          <Link
            href="/experiences/featured"
            style={{ display: 'inline-block', background: '#ff7044', color: '#fff', borderRadius: '2.3em', padding: '12px 28px', fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}
            className="hover:opacity-85 transition-opacity"
          >
            View Upcoming Trips →
          </Link>
        </div>
      </div>

      {/* ── Grid ─────────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1278, margin: '0 auto', padding: '56px 24px 80px', width: '100%' }}>
        {!experiences || experiences.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ fontFamily: 'Shrikhand, cursive', fontWeight: 400, fontSize: '2rem', color: '#362f35', margin: '0 0 12px', letterSpacing: '-0.04em' }}>
              Coming Soon
            </p>
            <p style={{ fontFamily: 'Glegoo, serif', fontWeight: 700, fontSize: '0.9rem', color: '#a6967c', margin: 0 }}>
              Experiences are on their way — check back soon.
            </p>
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
                <div style={{ padding: '20px 22px 24px', display: 'flex', flexDirection: 'column', flex: 1, gap: 0 }}>

                  {/* Badges */}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                    {exp.duration && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#f5f3f0', borderRadius: '2.3em', padding: '4px 12px', fontFamily: 'Archivo, sans-serif', fontSize: '0.72rem', fontWeight: 600, color: '#726d6b' }}>
                        <ClockIcon />{exp.duration}
                      </span>
                    )}
                    {exp.is_featured && (
                      <span style={{ background: '#fff5f0', border: '1px solid #ff7044', borderRadius: '2.3em', padding: '4px 12px', fontFamily: 'Archivo, sans-serif', fontSize: '0.68rem', fontWeight: 700, color: '#ff7044', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Featured
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
