import Link from 'next/link';
import SiteHeader from '@/app/SiteHeader';
import FooterLinks from '@/app/FooterLinks';
import SiteFooter from '@/app/SiteFooter';

export const metadata = {
  title: 'Useful Links | Discover Florida Parks',
  description: 'A curated collection of resources for planning your Florida park visits — reservations, trail maps, weather, wildlife, and conservation organizations.',
};

const CATEGORIES = [
  {
    eyebrow: 'Before you go',
    heading: 'Plan Your Visit',
    bg: '#ffffff',
    links: [
      {
        name: 'Florida State Parks',
        description: 'Reserve campsites, pavilions, and facilities at Florida\'s 175 state parks.',
        href: 'https://www.floridastateparks.org',
      },
      {
        name: 'ReserveAmerica',
        description: 'Book campsites and lodging at national and state parks across Florida.',
        href: 'https://www.reserveamerica.com',
      },
      {
        name: 'Florida Fish & Wildlife',
        description: 'Hunting and fishing licenses, regulations, and wildlife area access maps.',
        href: 'https://myfwc.com',
      },
      {
        name: 'SunPass',
        description: "Florida's prepaid toll program — essential for road trips across the state.",
        href: 'https://www.sunpass.com',
      },
      {
        name: 'Visit Florida',
        description: "The state's official tourism resource for trip ideas, events, and travel guides.",
        href: 'https://www.visitflorida.com',
      },
    ],
  },
  {
    eyebrow: 'Get oriented',
    heading: 'Maps & Trails',
    bg: '#f9f7f5',
    links: [
      {
        name: 'AllTrails',
        description: 'Detailed trail maps, reviews, and GPS tracking for thousands of Florida hikes.',
        href: 'https://www.alltrails.com/us/florida',
      },
      {
        name: 'Florida Trail Association',
        description: 'Official resource for the 1,300-mile Florida National Scenic Trail.',
        href: 'https://www.floridatrail.org',
      },
      {
        name: 'Florida Paddling Trails',
        description: 'Canoe and kayak trail maps for rivers, springs, and coastal waterways statewide.',
        href: 'https://floridadep.gov/parks/recreation-trails/content/florida-paddling-trails',
      },
      {
        name: 'iNaturalist',
        description: "Identify Florida's wildlife and native plants in the field using your phone.",
        href: 'https://www.inaturalist.org',
      },
    ],
  },
  {
    eyebrow: 'Stay informed',
    heading: 'Weather & Safety',
    bg: '#ffffff',
    links: [
      {
        name: 'National Hurricane Center',
        description: 'Real-time hurricane tracking, storm alerts, and preparedness guides.',
        href: 'https://www.nhc.noaa.gov',
      },
      {
        name: 'National Weather Service',
        description: 'Detailed forecasts for every Florida region — including marine and coastal conditions.',
        href: 'https://www.weather.gov/mfl',
      },
      {
        name: 'Florida Flood Hub',
        description: 'Statewide flood monitoring, risk maps, and historical flood data.',
        href: 'https://floridafloods.org',
      },
      {
        name: 'Florida Forest Service',
        description: 'Active wildfire maps, burn bans, and forest condition reports by county.',
        href: 'https://www.fdacs.gov/Divisions-Offices/Florida-Forest-Service',
      },
    ],
  },
  {
    eyebrow: 'Go deeper',
    heading: 'Conservation & Learning',
    bg: '#f9f7f5',
    links: [
      {
        name: 'Florida DEP',
        description: 'Environmental permits, water quality data, and natural resource maps from the state.',
        href: 'https://floridadep.gov',
      },
      {
        name: 'Florida Museum of Natural History',
        description: "Florida's biodiversity research hub — exhibits, species databases, and field guides.",
        href: 'https://www.floridamuseum.ufl.edu',
      },
      {
        name: 'Florida Native Plant Society',
        description: 'Resources for identifying, growing, and protecting Florida native plants.',
        href: 'https://www.fnps.org',
      },
      {
        name: 'Our Conservation Partners',
        description: 'Meet the organizations protecting Florida\'s ecosystems — spotlighted right here on DFP.',
        href: '/conservation',
        internal: true,
      },
    ],
  },
];

export default function UsefulLinksPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fff' }}>
      <SiteHeader />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section style={{ background: '#fff', padding: '80px 24px 64px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.76rem', fontWeight: 700, color: '#a6967c', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 14px' }}>
          Resources
        </p>
        <h1 style={{ fontFamily: 'Shrikhand, cursive', fontWeight: 400, fontSize: 'clamp(2.8rem, 6vw, 5rem)', lineHeight: 0.95, letterSpacing: '-0.04em', color: '#362f35', margin: '0 0 20px' }}>
          Useful Links
        </h1>
        <div style={{ width: 52, height: 3, background: '#ff7044', borderRadius: 2, margin: '0 auto 24px' }} />
        <p style={{ fontFamily: 'Glegoo, serif', fontWeight: 400, fontSize: '1rem', color: '#726d6b', lineHeight: 1.65, maxWidth: 520, margin: '0 auto' }}>
          A curated collection of resources to help you plan, explore, and connect more deeply with Florida&apos;s natural spaces.
        </p>
      </section>

      {/* ── Categories ───────────────────────────────────────────────────── */}
      {CATEGORIES.map((cat, i) => (
        <section
          key={cat.heading}
          style={{
            background: cat.bg,
            borderTop: '1px solid #eeeeee',
            borderBottom: i === CATEGORIES.length - 1 ? '1px solid #eeeeee' : 'none',
          }}
          className="page-section-pad"
        >
          <div style={{ maxWidth: 1278, margin: '0 auto' }}>
            <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.76rem', fontWeight: 700, color: '#a6967c', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 10px' }}>
              {cat.eyebrow}
            </p>
            <h2 style={{ fontFamily: 'Shrikhand, cursive', fontWeight: 400, fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', color: '#362f35', letterSpacing: '-0.04em', lineHeight: 1, margin: '0 0 32px' }}>
              {cat.heading}
            </h2>

            <div className="useful-links-grid">
              {cat.links.map(link => (
                link.internal ? (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="useful-link-card"
                  >
                    <p style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: '0.9rem', color: '#362f35', margin: '0 0 6px', letterSpacing: '-0.01em' }}>
                      {link.name}
                    </p>
                    <p style={{ fontFamily: 'Glegoo, serif', fontWeight: 400, fontSize: '0.82rem', color: '#726d6b', margin: '0 0 14px', lineHeight: 1.55, flex: 1 }}>
                      {link.description}
                    </p>
                    <span style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: '0.75rem', color: '#ff7044', letterSpacing: '0.02em' }}>
                      Learn more →
                    </span>
                  </Link>
                ) : (
                  <a
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="useful-link-card"
                  >
                    <p style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: '0.9rem', color: '#362f35', margin: '0 0 6px', letterSpacing: '-0.01em' }}>
                      {link.name}
                    </p>
                    <p style={{ fontFamily: 'Glegoo, serif', fontWeight: 400, fontSize: '0.82rem', color: '#726d6b', margin: '0 0 14px', lineHeight: 1.55, flex: 1 }}>
                      {link.description}
                    </p>
                    <span style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: '0.75rem', color: '#ff7044', letterSpacing: '0.02em' }}>
                      Visit →
                    </span>
                  </a>
                )
              ))}
            </div>
          </div>
        </section>
      ))}

      <FooterLinks />
      <SiteFooter />
    </div>
  );
}
