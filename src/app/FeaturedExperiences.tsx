const LISTINGS = [
  {
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=240&h=240&fit=crop',
    duration: '4 day(s) 3 night(s)',
    title: 'Crystal River Manatee Snorkeling Adventure',
    description: 'Swim with gentle manatees and explore crystal-clear springs at Three Sisters Springs and Homosassa Springs Wildlife State Park.',
    href: '#',
  },
  {
    image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=240&h=240&fit=crop',
    duration: '1 day',
    title: 'Ocala National Forest Springs Tour',
    description: 'Hop between Juniper Springs, Alexander Springs, Silver Glen Springs, and Salt Springs for a full day of swimming and paddling.',
    href: '#',
  },
];

const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a6967c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export default function FeaturedExperiences() {
  return (
    <section style={{ background: '#fff', borderTop: '1px solid #eeeeee' }} className="page-section-pad">
      <div style={{ maxWidth: 1278, margin: '0 auto' }} className="featured-experiences-grid">

        {/* Left — listings */}
        <div>
          <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.78rem', fontWeight: 600, color: '#a6967c', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 10px' }}>
            Explore &amp; Experience
          </p>
          <h2 style={{ fontFamily: 'Shrikhand, cursive', fontWeight: 400, fontSize: 'clamp(2.4rem, 3.5vw, 3.6rem)', lineHeight: 0.95, color: '#362f35', margin: '0 0 40px', letterSpacing: '-0.04em' }}>
            Plan your next Florida<br />Adventure
          </h2>

          {LISTINGS.map((item, i) => (
            <div key={i}>
              {i > 0 && <hr style={{ border: 'none', borderTop: '1px solid #eeeeee', margin: '32px 0' }} />}
              <div className="featured-listing-row">

                {/* Round image */}
                <img
                  src={item.image}
                  alt={item.title}
                  width={120}
                  height={120}
                  style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                />

                {/* Content */}
                <div style={{ flex: 1 }}>
                  {/* Duration badge */}
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f5f3f0', borderRadius: '2.3em', padding: '4px 12px', fontFamily: 'Archivo, sans-serif', fontSize: '0.72rem', fontWeight: 600, color: '#726d6b', marginBottom: 10 }}>
                    <ClockIcon />
                    {item.duration}
                  </span>

                  <h3 style={{ fontFamily: 'Shrikhand, cursive', fontWeight: 400, fontSize: '1.45rem', color: '#362f35', margin: '0 0 8px', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                    {item.title}
                  </h3>
                  <p style={{ fontFamily: 'Glegoo, serif', fontWeight: 700, fontSize: '0.85rem', color: '#726d6b', lineHeight: 1.6, margin: '0 0 14px' }}>
                    {item.description}
                  </p>
                  <a
                    href={item.href}
                    style={{ display: 'inline-block', background: '#ff7044', color: '#fff', borderRadius: '2.3em', padding: '9px 24px', fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: '0.82rem', textDecoration: 'none' }}
                    className="hover:opacity-85 transition-opacity"
                  >
                    Get Details →
                  </a>
                </div>
              </div>
            </div>
          ))}
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
                href="#"
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
              Get all news &amp; deals!
            </p>
            <h3 style={{ fontFamily: 'Shrikhand, cursive', fontWeight: 400, fontSize: '1.6rem', color: '#362f35', margin: '0 0 20px', letterSpacing: '-0.04em', lineHeight: 1.05 }}>
              Subscribe to Our Newsletter!
            </h3>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="email"
                placeholder="Your email"
                style={{ flex: 1, background: '#fff', border: '1.5px solid #dfdfdf', borderRadius: '2.3em', padding: '10px 16px', fontFamily: 'Glegoo, serif', fontSize: '0.82rem', color: '#362f35', outline: 'none', minWidth: 0 }}
              />
              <button
                type="submit"
                style={{ background: '#ff7044', color: '#fff', border: 'none', borderRadius: '2.3em', padding: '10px 20px', fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', flexShrink: 0 }}
                className="hover:opacity-85 transition-opacity"
              >
                Subscribe
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
