'use client';

import { useState } from 'react';
import Link from 'next/link';
import SiteHeader from '@/app/SiteHeader';
import FooterLinks from '@/app/FooterLinks';
import SiteFooter from '@/app/SiteFooter';

export interface WeCarePillar {
  title: string;
  body: string;
}

export interface WeCarePartner {
  name: string;
  tagline: string;
  href: string;
  logo?: string; // optional — added when logo files are supplied
}

export interface WeCarePageProps {
  eyebrow: string;
  headline: string;
  subhead: string;
  heroBg: string;
  pillars: [WeCarePillar, WeCarePillar, WeCarePillar];
  partnerIntro: string;
  partners: WeCarePartner[];
  pageSlug: string;
}

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

const inputStyle: React.CSSProperties = {
  background: '#f5f3f0', border: 'none', borderRadius: '2.3em',
  padding: '13px 20px', fontFamily: 'Glegoo, serif', fontSize: '0.9rem',
  color: '#362f35', outline: 'none', width: '100%',
};

export default function WeCarePage({
  eyebrow, headline, subhead, heroBg, pillars, partnerIntro, partners, pageSlug,
}: WeCarePageProps) {
  // Notify form
  const [notifyEmail, setNotifyEmail]   = useState('');
  const [notifyError, setNotifyError]   = useState('');
  const [notifyStatus, setNotifyStatus] = useState<FormStatus>('idle');

  async function handleNotify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!notifyEmail.trim()) { setNotifyError('Enter your email address.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(notifyEmail)) { setNotifyError('Enter a valid email.'); return; }
    setNotifyError('');
    setNotifyStatus('submitting');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'We Care — Partner Notification Signup',
          email: notifyEmail,
          message: `${notifyEmail} wants to be notified when partner organizations are listed on /${pageSlug}.`,
        }),
      });
      if (!res.ok) throw new Error();
      setNotifyStatus('success');
      setNotifyEmail('');
    } catch {
      setNotifyError('Something went wrong — please try again.');
      setNotifyStatus('idle');
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fff' }}>
      <SiteHeader />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div
          aria-hidden
          style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${heroBg})`,
            backgroundSize: 'cover', backgroundPosition: 'center 55%',
            filter: 'blur(3px) brightness(0.42)', transform: 'scale(1.04)',
          }}
        />
        <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, rgba(54,47,53,0.6) 0%, rgba(166,150,124,0.2) 100%)' }} />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '120px 24px 130px', maxWidth: 720, width: '100%' }}>
          <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.74rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.16em', margin: '0 0 16px' }}>
            {eyebrow}
          </p>
          <h1 style={{ fontFamily: 'Shrikhand, cursive', fontWeight: 400, fontSize: 'clamp(2.8rem, 6vw, 5rem)', lineHeight: 0.93, letterSpacing: '-0.04em', color: '#ffffff', margin: '0 0 22px' }}>
            {headline}
          </h1>
          <div style={{ width: 52, height: 3, background: '#ff7044', borderRadius: 2, margin: '0 auto 26px' }} />
          <p style={{ fontFamily: 'Glegoo, serif', fontWeight: 400, fontSize: '1rem', color: 'rgba(255,255,255,0.82)', lineHeight: 1.65, margin: '0 auto', maxWidth: 560 }}>
            {subhead}
          </p>
        </div>
      </section>

      {/* ── Why It Matters ───────────────────────────────────────────────── */}
      <section style={{ background: '#fff' }} className="page-section-pad">
        <div style={{ maxWidth: 1278, margin: '0 auto' }}>
          <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.76rem', fontWeight: 700, color: '#a6967c', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 10px' }}>
            The bigger picture
          </p>
          <h2 style={{ fontFamily: 'Shrikhand, cursive', fontWeight: 400, fontSize: 'clamp(2rem, 4vw, 3.2rem)', color: '#362f35', letterSpacing: '-0.04em', lineHeight: 1, margin: '0 0 16px' }}>
            Why It Matters
          </h2>
          <hr style={{ border: 'none', borderTop: '3px solid #ff7044', width: 36, margin: '0 0 48px' }} />

          <div className="we-care-pillars">
            {pillars.map(p => (
              <div key={p.title} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff7044', flexShrink: 0 }} />
                <h3 style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: '1rem', color: '#362f35', margin: 0, letterSpacing: '-0.01em' }}>
                  {p.title}
                </h3>
                <p style={{ fontFamily: 'Glegoo, serif', fontWeight: 400, fontSize: '0.9rem', color: '#726d6b', lineHeight: 1.65, margin: 0 }}>
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Partner Organizations ─────────────────────────────────────────── */}
      <section style={{ background: '#f9f7f5', borderTop: '1px solid #eeeeee', borderBottom: '1px solid #eeeeee' }} className="page-section-pad">
        <div style={{ maxWidth: 1278, margin: '0 auto' }}>
          <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.76rem', fontWeight: 700, color: '#a6967c', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 10px' }}>
            Proud to spotlight
          </p>
          <h2 style={{ fontFamily: 'Shrikhand, cursive', fontWeight: 400, fontSize: 'clamp(2rem, 4vw, 3.2rem)', color: '#362f35', letterSpacing: '-0.04em', lineHeight: 1, margin: '0 0 14px' }}>
            Partner Organizations
          </h2>
          <p style={{ fontFamily: 'Glegoo, serif', fontWeight: 400, fontSize: '0.92rem', color: '#726d6b', lineHeight: 1.65, maxWidth: 560, margin: '0 0 48px' }}>
            {partnerIntro}
          </p>

          <div className="we-care-partners-grid">
            {partners.map(p => (
              <a
                key={p.name}
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                className="partner-logo-card"
                aria-label={`Visit ${p.name}`}
              >
                {p.logo && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.logo}
                    alt={p.name}
                    className="partner-logo-img"
                    onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                  />
                )}
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: '0.85rem', color: '#362f35', margin: '0 0 5px', letterSpacing: '-0.01em' }}>
                    {p.name}
                  </p>
                  <p style={{ fontFamily: 'Glegoo, serif', fontWeight: 400, fontSize: '0.78rem', color: '#726d6b', margin: '0 0 12px', lineHeight: 1.5 }}>
                    {p.tagline}
                  </p>
                  <span style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: '0.72rem', color: '#ff7044', letterSpacing: '0.02em' }}>
                    Visit →
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Get Involved ──────────────────────────────────────────────────── */}
      <section style={{ background: '#fff' }} className="page-section-pad">
        <div style={{ maxWidth: 1278, margin: '0 auto' }}>
          <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.76rem', fontWeight: 700, color: '#a6967c', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 10px' }}>
            Get involved
          </p>
          <h2 style={{ fontFamily: 'Shrikhand, cursive', fontWeight: 400, fontSize: 'clamp(2rem, 4vw, 3.2rem)', color: '#362f35', letterSpacing: '-0.04em', lineHeight: 1, margin: '0 0 16px' }}>
            Join the Effort
          </h2>
          <hr style={{ border: 'none', borderTop: '3px solid #ff7044', width: 36, margin: '0 0 48px' }} />

          <div className="we-care-get-involved">

            {/* Left — Notify */}
            <div>
              <h3 style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: '1.05rem', color: '#362f35', margin: '0 0 6px' }}>
                Stay in the Loop
              </h3>
              <p style={{ fontFamily: 'Glegoo, serif', fontWeight: 400, fontSize: '0.88rem', color: '#726d6b', lineHeight: 1.6, margin: '0 0 24px' }}>
                We&apos;ll notify you as soon as partner organizations are listed on this page.
              </p>

              {notifyStatus === 'success' ? (
                <div style={{ background: '#f5f3f0', borderRadius: 16, padding: '28px' }}>
                  <p style={{ fontFamily: 'Shrikhand, cursive', fontWeight: 400, fontSize: '1.5rem', color: '#362f35', margin: '0 0 8px', letterSpacing: '-0.03em' }}>
                    You&apos;re on the list!
                  </p>
                  <p style={{ fontFamily: 'Glegoo, serif', fontWeight: 400, fontSize: '0.88rem', color: '#726d6b', margin: 0, lineHeight: 1.5 }}>
                    We&apos;ll be in touch when partner organizations go live.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleNotify} noValidate>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                    <label htmlFor="notify-email" style={{ display: 'none' }}>Email address</label>
                    <input id="notify-email" type="email" placeholder="your@email.com" value={notifyEmail}
                      onChange={e => { setNotifyEmail(e.target.value); setNotifyError(''); }}
                      style={{ flex: 1, background: '#f5f3f0', border: `1.5px solid ${notifyError ? '#ff7044' : 'transparent'}`, borderRadius: '2.3em', padding: '13px 20px', fontFamily: 'Glegoo, serif', fontSize: '0.9rem', color: '#362f35', outline: 'none', minWidth: 0 }} />
                    <button type="submit" disabled={notifyStatus === 'submitting'}
                      style={{ background: '#ff7044', color: '#fff', border: 'none', borderRadius: '2.3em', padding: '13px 24px', fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: '0.85rem', cursor: notifyStatus === 'submitting' ? 'not-allowed' : 'pointer', flexShrink: 0, opacity: notifyStatus === 'submitting' ? 0.7 : 1, whiteSpace: 'nowrap' }}
                      className="hover:opacity-85 transition-opacity">
                      {notifyStatus === 'submitting' ? '…' : 'Notify Me'}
                    </button>
                  </div>
                  {notifyError && <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.72rem', color: '#ff7044', margin: '4px 0 0 16px' }}>{notifyError}</p>}
                </form>
              )}

              <div style={{ marginTop: 48 }}>
                <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.76rem', fontWeight: 700, color: '#a6967c', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 14px' }}>
                  Keep exploring
                </p>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <Link href="/parks" style={{ background: 'transparent', color: '#413734', border: '2px solid #dfdfdf', borderRadius: '2.3em', padding: '10px 24px', fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: '0.85rem' }} className="hover:border-[#413734] transition-colors">
                    Browse All Parks →
                  </Link>
                  <Link href="/" style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: '0.85rem', color: '#726d6b', display: 'flex', alignItems: 'center' }} className="hover:text-[#413734] transition-colors">
                    Back to Home
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <FooterLinks />
      <SiteFooter />
    </div>
  );
}
