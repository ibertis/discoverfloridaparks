import Link from 'next/link';
import SiteHeader from '../SiteHeader';
import FooterLinks from '../FooterLinks';
import SiteFooter from '../SiteFooter';

export const metadata = {
  title: 'Privacy Policy | Discover Florida Parks',
  description: 'Privacy policy for Discover Florida Parks — how we collect, use, and protect your information.',
  alternates: { canonical: 'https://www.discoverfloridaparks.com/privacy' },
};

const s = {
  eyebrow: {
    fontFamily: 'Archivo, sans-serif',
    fontSize: '0.78rem',
    fontWeight: 600,
    color: '#a6967c',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    margin: '0 0 12px',
  },
  h1: {
    fontFamily: 'Shrikhand, cursive',
    fontWeight: 400,
    fontSize: '3rem',
    color: '#362f35',
    margin: '0 0 16px',
    letterSpacing: '-0.04em',
    lineHeight: 1,
  },
  h2: {
    fontFamily: 'Shrikhand, cursive',
    fontWeight: 400,
    fontSize: '1.55rem',
    color: '#362f35',
    margin: '0 0 8px',
    letterSpacing: '-0.03em',
    lineHeight: 1.1,
  },
  rule: {
    border: 'none',
    borderTop: '2px solid #a6967c',
    width: 28,
    margin: '0 0 16px',
  } as React.CSSProperties,
  p: {
    fontFamily: 'Glegoo, serif',
    fontSize: '0.95rem',
    color: '#726d6b',
    lineHeight: 1.85,
    margin: '0 0 1rem',
  },
  li: {
    marginBottom: '0.55rem',
  },
};

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />

      <main style={{ background: '#fff' }}>

        {/* ── Page header ─────────────────────────────────────────────────── */}
        <section style={{ background: '#faf8f5', borderBottom: '1px solid #edeae5', padding: '56px 24px 48px' }}>
          <div style={{ maxWidth: 780, margin: '0 auto' }}>
            <p style={s.eyebrow}>Legal · Privacy Policy</p>
            <h1 style={s.h1}>Privacy Policy</h1>
            <hr style={{ border: 'none', borderTop: '3px solid #ff7044', width: 36, margin: '0 0 20px' }} />
            <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.85rem', color: '#a6967c', margin: 0, lineHeight: 1.6 }}>
              Effective date: May 15, 2026 &nbsp;·&nbsp; NETHOST Solutions, LLP d/b/a Discover Florida Parks
            </p>
          </div>
        </section>

        {/* ── Body ────────────────────────────────────────────────────────── */}
        <section style={{ padding: '56px 24px 80px' }}>
          <div style={{ maxWidth: 780, margin: '0 auto' }}>

            <p style={{ ...s.p, marginBottom: '2.5rem' }}>
              Discover Florida Parks (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) is committed to protecting your privacy.
              This policy explains what information we collect when you visit discoverfloridaparks.com (the &ldquo;Site&rdquo;),
              how we use it, and the choices available to you.
            </p>

            {/* 1 */}
            <div style={{ marginBottom: '2.5rem' }}>
              <h2 style={s.h2}>1. Information We Collect</h2>
              <hr style={s.rule} />
              <p style={s.p}>We collect information in three ways:</p>
              <ul style={{ ...s.p, paddingLeft: '1.4rem', margin: '0 0 1rem' }}>
                <li style={s.li}>
                  <strong>Browsing data.</strong> Our servers and analytics tools automatically record your IP address,
                  browser type, referring URL, pages visited, and time on page. This data is used in aggregate
                  to understand how visitors use the Site and to improve our content.
                </li>
                <li style={s.li}>
                  <strong>Cookies.</strong> We use first-party and third-party cookies to improve your experience
                  and measure Site performance. See Section 4 for a full breakdown.
                </li>
                <li style={s.li}>
                  <strong>Email address.</strong> If you subscribe to our newsletter or submit a contact form,
                  we collect your email address and, optionally, your name.
                </li>
              </ul>
              <p style={s.p}>
                We do not collect payment information, government IDs, or other sensitive personal data.
              </p>
            </div>

            {/* 2 */}
            <div style={{ marginBottom: '2.5rem' }}>
              <h2 style={s.h2}>2. Affiliate Links</h2>
              <hr style={s.rule} />
              <p style={s.p}>
                Some links on this Site are affiliate links. If you click one and make a qualifying purchase
                or booking, we may earn a commission — at no additional cost to you. Affiliate relationships
                do not influence our editorial content or recommendations.
              </p>
              <p style={s.p}>We currently participate in the following affiliate programs:</p>
              <ul style={{ ...s.p, paddingLeft: '1.4rem', margin: '0 0 1rem' }}>
                <li style={s.li}><strong>Hotels &amp; Travel:</strong> Booking.com, Hotels.com, Expedia</li>
                <li style={s.li}><strong>Experiences &amp; Tours:</strong> Viator</li>
                <li style={s.li}><strong>Outdoor Gear &amp; General Retail:</strong> Amazon Associates</li>
                <li style={s.li}><strong>Sponsored Placements:</strong> Backcountry (via Impact)</li>
              </ul>
              <p style={s.p}>
                When you click an affiliate link, the relevant network may set a tracking cookie to attribute
                any resulting transaction to this Site.
              </p>
            </div>

            {/* 3 */}
            <div style={{ marginBottom: '2.5rem' }}>
              <h2 style={s.h2}>3. Third-Party Tracking</h2>
              <hr style={s.rule} />
              <p style={s.p}>
                In addition to affiliate tracking, the Site may use the following third-party services:
              </p>
              <ul style={{ ...s.p, paddingLeft: '1.4rem', margin: '0 0 1rem' }}>
                <li style={s.li}>
                  <strong>Google Analytics.</strong> Measures traffic and user behavior in aggregate.
                  Google may collect and process data in accordance with its own privacy policy.
                </li>
                <li style={s.li}>
                  <strong>CJ Affiliate (Commission Junction).</strong> Tracking pixels may load on pages
                  containing CJ affiliate links.
                </li>
                <li style={s.li}>
                  <strong>Impact.</strong> Tracking pixels may load on pages containing Impact affiliate
                  links (e.g., Backcountry).
                </li>
                <li style={s.li}>
                  <strong>Amazon Associates.</strong> Amazon may track clicks from this Site in accordance
                  with its own terms and privacy policy.
                </li>
              </ul>
              <p style={s.p}>
                Each third party operates under its own privacy policy, which we encourage you to review
                independently.
              </p>
            </div>

            {/* 4 */}
            <div style={{ marginBottom: '2.5rem' }}>
              <h2 style={s.h2}>4. Cookies</h2>
              <hr style={s.rule} />
              <p style={s.p}>We use the following types of cookies:</p>
              <ul style={{ ...s.p, paddingLeft: '1.4rem', margin: '0 0 1rem' }}>
                <li style={s.li}>
                  <strong>Essential.</strong> Required for the Site to function correctly (e.g., session state).
                  These cannot be disabled without breaking Site functionality.
                </li>
                <li style={s.li}>
                  <strong>Analytics.</strong> Set by Google Analytics to measure page views, sessions, and
                  traffic sources. Data is anonymized and reported in aggregate only.
                </li>
                <li style={s.li}>
                  <strong>Affiliate tracking.</strong> Set by affiliate networks (Booking.com, Hotels.com,
                  Expedia, Impact, CJ Affiliate, Amazon) when you click a partner link. These cookies allow
                  networks to attribute commissions to this Site.
                </li>
              </ul>
              <p style={s.p}>
                Most browsers let you refuse or delete cookies through their settings. Disabling non-essential
                cookies may limit some Site functionality and will prevent affiliate commission attribution.
              </p>
            </div>

            {/* 5 */}
            <div style={{ marginBottom: '2.5rem' }}>
              <h2 style={s.h2}>5. Email &amp; Newsletter</h2>
              <hr style={s.rule} />
              <p style={s.p}>
                If you subscribe to the Discover Florida Parks newsletter or submit our contact form, we
                collect your email address (and optionally your name) solely to deliver the content you
                requested.
              </p>
              <p style={s.p}>
                We do not sell, rent, or share email addresses with third parties for marketing purposes.
                You can unsubscribe at any time via the link at the bottom of any email we send.
              </p>
            </div>

            {/* 6 */}
            <div style={{ marginBottom: '2.5rem' }}>
              <h2 style={s.h2}>6. No Sale of Personal Data</h2>
              <hr style={s.rule} />
              <p style={s.p}>
                We do not sell, trade, or transfer your personal information to third parties for their own
                marketing or commercial purposes. Information shared with affiliate networks is limited to
                what is technically necessary to attribute transactions, and is governed by each network&apos;s
                own privacy policy.
              </p>
            </div>

            {/* 7 */}
            <div style={{ marginBottom: '2.5rem' }}>
              <h2 style={s.h2}>7. Contact &amp; Privacy Requests</h2>
              <hr style={s.rule} />
              <p style={s.p}>
                To submit a privacy request — including requests to access, correct, or delete personal
                information we hold — please contact us at:
              </p>
              <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.95rem', fontWeight: 700, color: '#362f35', margin: '0 0 0.6rem' }}>
                <a href="mailto:info@discoverfloridaparks.com" style={{ color: '#ff7044', textDecoration: 'none' }}>
                  info@discoverfloridaparks.com
                </a>
              </p>
              <p style={{ ...s.p, margin: 0 }}>
                NETHOST Solutions, LLP d/b/a Discover Florida Parks
              </p>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #edeae5', margin: '2.5rem 0' }} />

            <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.78rem', color: '#a6967c', margin: 0, lineHeight: 1.7 }}>
              We reserve the right to update this policy at any time. Material changes will be noted by
              updating the effective date above. Continued use of the Site after a change constitutes
              acceptance of the revised policy.
            </p>

          </div>
        </section>

      </main>

      <FooterLinks />
      <SiteFooter />
    </>
  );
}
