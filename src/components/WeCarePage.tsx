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

export interface WeCarePageProps {
  eyebrow: string;
  headline: string;
  subhead: string;
  heroBg: string;
  pillars: [WeCarePillar, WeCarePillar, WeCarePillar];
  partnerIntro: string;
  pageSlug: string;
}

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

const inputStyle: React.CSSProperties = {
  background: '#f5f3f0', border: 'none', borderRadius: '2.3em',
  padding: '13px 20px', fontFamily: 'Glegoo, serif', fontSize: '0.9rem',
  color: '#362f35', outline: 'none', width: '100%',
};

export default function WeCarePage({
  eyebrow, headline, subhead, heroBg, pillars, partnerIntro, pageSlug,
}: WeCarePageProps) {
  // Nominate form
  const [orgName, setOrgName]       = useState('');
  const [orgUrl, setOrgUrl]         = useState('');
  const [orgReason, setOrgReason]   = useState('');
  const [orgEmail, setOrgEmail]     = useState('');
  const [nomErrors, setNomErrors]   = useState<Record<string, string>>({});
  const [nomStatus, setNomStatus]   = useState<FormStatus>('idle');

  // Notify form
  const [notifyEmail, setNotifyEmail]   = useState('');
  const [notifyError, setNotifyError]   = useState('');
  const [notifyStatus, setNotifyStatus] = useState<FormStatus>('idle');

  function validateNominate() {
    const e: Record<string, string> = {};
    if (!orgName.trim())  e.orgName  = 'Organization name is required.';
    if (!orgReason.trim()) e.orgReason = 'Please tell us why they matter.';
    if (!orgEmail.trim()) e.orgEmail = 'Your email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(orgEmail)) e.orgEmail = 'Enter a valid email.';
    return e;
  }

  async function handleNominate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const errs = validateNominate();
    if (Object.keys(errs).length) { setNomErrors(errs); return; }
    setNomErrors({});
    setNomStatus('submitting');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `Org Nomination: ${orgName}`,
          email: orgEmail,
          message: `Organization: ${orgName}\nWebsite: ${orgUrl || 'Not provided'}\n\nWhy they matter:\n${orgReason}\n\nNominated via /${pageSlug}`,
        }),
      });
      if (!res.ok) throw new Error();
      setNomStatus('success');
      setOrgName(''); setOrgUrl(''); setOrgReason(''); setOrgEmail('');
    } catch {
      setNomStatus('error');
    }
  }

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
            Coming soon
          </p>
          <h2 style={{ fontFamily: 'Shrikhand, cursive', fontWeight: 400, fontSize: 'clamp(2rem, 4vw, 3.2rem)', color: '#362f35', letterSpacing: '-0.04em', lineHeight: 1, margin: '0 0 14px' }}>
            Partner Organizations
          </h2>
          <p style={{ fontFamily: 'Glegoo, serif', fontWeight: 400, fontSize: '0.92rem', color: '#726d6b', lineHeight: 1.65, maxWidth: 560, margin: '0 0 48px' }}>
            {partnerIntro}
          </p>

          <div className="we-care-pillars">
            {[1, 2, 3].map(i => (
              <div key={i} style={{ border: '2px dashed #dfdfdf', borderRadius: 16, padding: '36px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center', minHeight: 180 }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#dfdfdf" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.78rem', fontWeight: 600, color: '#c4bfbb', margin: 0, letterSpacing: '0.04em' }}>
                  Organization coming soon
                </p>
              </div>
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

            {/* Left — Nominate */}
            <div>
              <h3 style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: '1.05rem', color: '#362f35', margin: '0 0 6px' }}>
                Nominate an Organization
              </h3>
              <p style={{ fontFamily: 'Glegoo, serif', fontWeight: 400, fontSize: '0.88rem', color: '#726d6b', lineHeight: 1.6, margin: '0 0 24px' }}>
                Know a non-profit or conservation group doing great work in Florida? Tell us about them.
              </p>

              {nomStatus === 'success' ? (
                <div style={{ background: '#f5f3f0', borderRadius: 16, padding: '28px', textAlign: 'center' }}>
                  <p style={{ fontFamily: 'Shrikhand, cursive', fontWeight: 400, fontSize: '1.5rem', color: '#362f35', margin: '0 0 8px', letterSpacing: '-0.03em' }}>
                    Nomination received!
                  </p>
                  <p style={{ fontFamily: 'Glegoo, serif', fontWeight: 400, fontSize: '0.88rem', color: '#726d6b', margin: '0 0 16px', lineHeight: 1.5 }}>
                    Thank you — we&apos;ll review it and be in touch.
                  </p>
                  <button onClick={() => setNomStatus('idle')} style={{ background: 'none', border: 'none', fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: '0.85rem', color: '#ff7044', cursor: 'pointer' }}>
                    Nominate another →
                  </button>
                </div>
              ) : (
                <form onSubmit={handleNominate} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label htmlFor="nom-org" style={{ display: 'none' }}>Organization name</label>
                    <input id="nom-org" type="text" placeholder="Organization name" value={orgName} onChange={e => setOrgName(e.target.value)}
                      style={{ ...inputStyle, borderBottom: nomErrors.orgName ? '2px solid #ff7044' : 'none' }} />
                    {nomErrors.orgName && <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.72rem', color: '#ff7044', margin: '4px 0 0 18px' }}>{nomErrors.orgName}</p>}
                  </div>
                  <div>
                    <label htmlFor="nom-url" style={{ display: 'none' }}>Website (optional)</label>
                    <input id="nom-url" type="url" placeholder="Website (optional)" value={orgUrl} onChange={e => setOrgUrl(e.target.value)} style={inputStyle} />
                  </div>
                  <div>
                    <label htmlFor="nom-reason" style={{ display: 'none' }}>Why do they deserve recognition?</label>
                    <textarea id="nom-reason" placeholder="Why do they deserve recognition?" rows={4} value={orgReason} onChange={e => setOrgReason(e.target.value)}
                      style={{ ...inputStyle, borderRadius: '1.4em', resize: 'vertical', borderBottom: nomErrors.orgReason ? '2px solid #ff7044' : 'none' }} />
                    {nomErrors.orgReason && <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.72rem', color: '#ff7044', margin: '4px 0 0 18px' }}>{nomErrors.orgReason}</p>}
                  </div>
                  <div>
                    <label htmlFor="nom-email" style={{ display: 'none' }}>Your email</label>
                    <input id="nom-email" type="email" placeholder="Your email" value={orgEmail} onChange={e => setOrgEmail(e.target.value)}
                      style={{ ...inputStyle, borderBottom: nomErrors.orgEmail ? '2px solid #ff7044' : 'none' }} />
                    {nomErrors.orgEmail && <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.72rem', color: '#ff7044', margin: '4px 0 0 18px' }}>{nomErrors.orgEmail}</p>}
                  </div>
                  {nomStatus === 'error' && <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.78rem', color: '#ff7044', margin: 0 }}>Something went wrong — please try again.</p>}
                  <div>
                    <button type="submit" disabled={nomStatus === 'submitting'}
                      style={{ background: '#ff7044', color: '#fff', border: 'none', borderRadius: '2.3em', padding: '13px 36px', fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: '0.9rem', cursor: nomStatus === 'submitting' ? 'not-allowed' : 'pointer', opacity: nomStatus === 'submitting' ? 0.7 : 1 }}
                      className="hover:opacity-85 transition-opacity">
                      {nomStatus === 'submitting' ? 'Sending…' : 'Submit Nomination'}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Right — Notify */}
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
