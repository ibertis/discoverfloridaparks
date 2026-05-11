import { supabase } from '@/lib/supabase';
import NewsletterForm from './NewsletterForm';
import FeaturedExperiencesList from './FeaturedExperiencesList';

export default async function FeaturedExperiences() {
  const { data: listings } = await supabase
    .from('experiences')
    .select('id,name,description,duration_hours,image_url,affiliate_url,homepage_order,regions')
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('homepage_order', { ascending: true })
    .order('rating', { ascending: false })
    .limit(10);

  return (
    <section style={{ background: '#fff', borderTop: '1px solid #eeeeee' }} className="page-section-pad">
      <div style={{ maxWidth: 1278, margin: '0 auto' }} className="featured-experiences-grid">

        {/* Left — listings */}
        <div>
          <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.78rem', fontWeight: 600, color: '#a6967c', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 10px' }}>
            Explore &amp; Experience
          </p>
          <h2 style={{ fontFamily: 'Shrikhand, cursive', fontWeight: 400, fontSize: 'clamp(2.4rem, 3.5vw, 3.6rem)', lineHeight: 0.95, color: '#362f35', margin: '0 0 48px', letterSpacing: '-0.04em' }}>
            Plan your next<br />Adventure
          </h2>

          <FeaturedExperiencesList listings={listings ?? []} />
        </div>

        {/* Right — sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Ad placeholder */}
          <div style={{ borderRadius: 16, overflow: 'hidden', background: '#362f35', minHeight: 300, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 28px', textAlign: 'center' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(145deg, #413734 0%, #1e1a1a 100%)', opacity: 0.9 }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.72rem', fontWeight: 600, color: '#a6967c', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 10px' }}>
                Premium Placement
              </p>
              <h3 style={{ fontFamily: 'Shrikhand, cursive', fontWeight: 400, fontSize: '2.2rem', color: '#fff', margin: '0 0 12px', letterSpacing: '-0.04em', lineHeight: 1 }}>
                Advertise Here
              </h3>
              <p style={{ fontFamily: 'Glegoo, serif', fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, margin: '0 0 24px' }}>
                Reach thousands of Florida park visitors every month.
              </p>
              <a
                href="mailto:contact@discoverfloridaparks.com"
                style={{ display: 'inline-block', background: '#ff7044', color: '#fff', borderRadius: '2.3em', padding: '10px 28px', fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: '0.82rem', textDecoration: 'none' }}
                className="hover:opacity-85 transition-opacity"
              >
                Get in Touch →
              </a>
            </div>
          </div>

          {/* Newsletter card */}
          <div style={{ background: '#f5f3f0', borderRadius: 16, padding: 28 }}>
            <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.72rem', fontWeight: 600, color: '#a6967c', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 8px' }}>
              Subscribe to our free newsletter
            </p>
            <h3 style={{ fontFamily: 'Shrikhand, cursive', fontWeight: 400, fontSize: '1.6rem', color: '#362f35', margin: '0 0 12px', letterSpacing: '-0.04em', lineHeight: 1.05 }}>
              Hundreds of Parks. Endless Adventures.
            </h3>
            <p style={{ fontFamily: 'Glegoo, serif', fontWeight: 700, fontSize: '0.85rem', color: '#726d6b', lineHeight: 1.6, margin: '0 0 20px' }}>
              The Florida Parks Insider delivers the best parks, hidden gems, and seasonal guides straight to your inbox.
            </p>
            <NewsletterForm />
            <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.72rem', color: '#b8b0a8', margin: '12px 0 0' }}>
              No spam. Unsubscribe anytime.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
