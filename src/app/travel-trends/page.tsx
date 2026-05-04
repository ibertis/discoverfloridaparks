'use client';

import { useState } from 'react';
import Link from 'next/link';
import SiteHeader from '@/app/SiteHeader';
import FooterLinks from '@/app/FooterLinks';
import SiteFooter from '@/app/SiteFooter';

const PDF_PATH = '/downloads/2026-florida-travel-trends.pdf';

const INSIDE_ITEMS = [
  {
    number: '01',
    title: "Florida's Fastest-Growing Destinations",
    body: 'The parks and regions seeing the biggest surge in visitors — and how to beat the crowds.',
  },
  {
    number: '02',
    title: 'The Rise of Eco & Wellness Travel',
    body: 'How Floridians and visitors are trading theme parks for springs, forests, and paddling trails.',
  },
  {
    number: '03',
    title: 'Family Travel in 2026',
    body: 'Top picks for multi-generational trips, kid-friendly parks, and what families are prioritizing.',
  },
  {
    number: '04',
    title: 'Hidden Gems & Emerging Parks',
    body: 'Under-the-radar destinations gaining traction — before everyone else finds them.',
  },
  {
    number: '05',
    title: 'Best Times to Visit (by Region)',
    body: 'A season-by-season breakdown of crowd levels, weather, and wildlife across all five Florida regions.',
  },
  {
    number: '06',
    title: 'What Travelers Are Prioritizing',
    body: 'Camping, glamping, accessibility, sustainability — the values shaping Florida travel decisions.',
  },
];

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

export default function TravelTrendsPage() {
  const [name, setName]     = useState('');
  const [email, setEmail]   = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [status, setStatus] = useState<FormStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  function validate() {
    const e: { name?: string; email?: string } = {};
    if (!name.trim()) e.name = 'Your name is required.';
    if (!email.trim()) e.email = 'Your email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email address.';
    return e;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setStatus('submitting');
    try {
      const res = await fetch('/api/download-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        setErrorMsg(data.error ?? 'Something went wrong — please try again.');
        setStatus('error');
        return;
      }
      setStatus('success');
    } catch {
      setErrorMsg('Something went wrong — please try again.');
      setStatus('error');
    }
  }

  const firstName = name.trim().split(' ')[0] || 'there';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fff', hyphens: 'none' }}>
      <SiteHeader />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="trends-hero-section" style={{ background: '#362f35', padding: '80px 24px 72px' }}>
        <div className="trends-hero-grid" style={{ maxWidth: 1278, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 420px', gap: 64, alignItems: 'center' }}>

          {/* Left — copy */}
          <div>
            <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.76rem', fontWeight: 700, color: '#ff7044', textTransform: 'uppercase', letterSpacing: '0.14em', margin: '0 0 16px' }}>
              Free Download · 2026 Guide
            </p>
            <h1 style={{ fontFamily: 'Shrikhand, cursive', fontWeight: 400, fontSize: 'clamp(2.8rem, 5vw, 4.8rem)', lineHeight: 0.95, letterSpacing: '-0.04em', color: '#ffffff', margin: '0 0 20px' }}>
              Florida Travel Trends 2026
            </h1>
            <div style={{ width: 48, height: 3, background: '#ff7044', borderRadius: 2, margin: '0 0 24px' }} />
            <p style={{ fontFamily: 'Glegoo, serif', fontWeight: 400, fontSize: '1rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, maxWidth: 520, margin: '0 0 32px' }}>
              Where Florida travelers are headed, what they're prioritizing, and which parks are breaking through — all in one free guide built for explorers like you.
            </p>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              {['6 trend chapters', '5 Florida regions', 'Free, no catch'].map(tag => (
                <span key={tag} style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.8rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff7044', display: 'inline-block', flexShrink: 0 }} />
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Right — form card */}
          <div className="trends-form-card" style={{ background: '#ffffff', borderRadius: 20, padding: '36px 32px', boxShadow: '0 24px 64px rgba(0,0,0,0.28)' }}>
            {status === 'success' ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#fff5f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 24 }}>
                  🌴
                </div>
                <h2 style={{ fontFamily: 'Shrikhand, cursive', fontWeight: 400, fontSize: '1.9rem', color: '#362f35', margin: '0 0 10px', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                  It's on its way, {firstName}!
                </h2>
                <p style={{ fontFamily: 'Glegoo, serif', fontWeight: 400, fontSize: '0.88rem', color: '#726d6b', lineHeight: 1.65, margin: '0 0 28px' }}>
                  Check your inbox for your download link. Or grab it right now:
                </p>
                <a
                  href={PDF_PATH}
                  download
                  style={{ display: 'block', background: '#ff7044', color: '#fff', textDecoration: 'none', fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: '0.95rem', padding: '15px 24px', borderRadius: '2.3em', textAlign: 'center', marginBottom: 16 }}
                >
                  Download Now →
                </a>
                <Link href="/parks" style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.82rem', fontWeight: 600, color: '#a6967c', textDecoration: 'none' }}>
                  Browse Florida Parks →
                </Link>
              </div>
            ) : (
              <>
                <h2 style={{ fontFamily: 'Shrikhand, cursive', fontWeight: 400, fontSize: '1.7rem', color: '#362f35', margin: '0 0 6px', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                  Get the free guide
                </h2>
                <p style={{ fontFamily: 'Glegoo, serif', fontWeight: 400, fontSize: '0.84rem', color: '#726d6b', lineHeight: 1.6, margin: '0 0 24px' }}>
                  Enter your details below and we'll send it straight to your inbox.
                </p>

                <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label htmlFor="trend-name" style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.75rem', fontWeight: 700, color: '#362f35', display: 'block', marginBottom: 5 }}>
                      First Name
                    </label>
                    <input
                      id="trend-name"
                      type="text"
                      placeholder="Jane"
                      value={name}
                      onChange={e => { setName(e.target.value); setErrors(v => ({ ...v, name: undefined })); }}
                      style={{ width: '100%', background: '#f9f7f5', border: `1.5px solid ${errors.name ? '#ff7044' : 'transparent'}`, borderRadius: '2.3em', padding: '12px 18px', fontFamily: 'Glegoo, serif', fontSize: '0.9rem', color: '#362f35', outline: 'none', boxSizing: 'border-box' }}
                    />
                    {errors.name && <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.72rem', color: '#ff7044', margin: '4px 0 0 14px' }}>{errors.name}</p>}
                  </div>

                  <div>
                    <label htmlFor="trend-email" style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.75rem', fontWeight: 700, color: '#362f35', display: 'block', marginBottom: 5 }}>
                      Email Address
                    </label>
                    <input
                      id="trend-email"
                      type="email"
                      placeholder="jane@email.com"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setErrors(v => ({ ...v, email: undefined })); }}
                      style={{ width: '100%', background: '#f9f7f5', border: `1.5px solid ${errors.email ? '#ff7044' : 'transparent'}`, borderRadius: '2.3em', padding: '12px 18px', fontFamily: 'Glegoo, serif', fontSize: '0.9rem', color: '#362f35', outline: 'none', boxSizing: 'border-box' }}
                    />
                    {errors.email && <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.72rem', color: '#ff7044', margin: '4px 0 0 14px' }}>{errors.email}</p>}
                  </div>

                  {status === 'error' && (
                    <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.78rem', color: '#ff7044', margin: '0', textAlign: 'center' }}>{errorMsg}</p>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    style={{ background: '#ff7044', color: '#fff', border: 'none', borderRadius: '2.3em', padding: '15px 24px', fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: '0.95rem', cursor: status === 'submitting' ? 'not-allowed' : 'pointer', opacity: status === 'submitting' ? 0.7 : 1, marginTop: 4, transition: 'opacity 0.2s' }}
                  >
                    {status === 'submitting' ? 'Sending…' : 'Send Me the Guide →'}
                  </button>

                  <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.7rem', color: '#a6967c', textAlign: 'center', margin: '4px 0 0', lineHeight: 1.5 }}>
                    No spam, ever. Unsubscribe anytime.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── What's Inside ────────────────────────────────────────────────── */}
      <section style={{ background: '#ffffff', borderBottom: '1px solid #eeeeee' }} className="page-section-pad">
        <div style={{ maxWidth: 1278, margin: '0 auto' }}>
          <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.76rem', fontWeight: 700, color: '#a6967c', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 10px' }}>
            Inside the guide
          </p>
          <h2 style={{ fontFamily: 'Shrikhand, cursive', fontWeight: 400, fontSize: 'clamp(2rem, 4vw, 3.2rem)', color: '#362f35', letterSpacing: '-0.04em', lineHeight: 1, margin: '0 0 14px' }}>
            What You'll Discover
          </h2>
          <hr style={{ border: 'none', borderTop: '3px solid #ff7044', width: 36, margin: '0 0 48px' }} />

          <div className="trends-inside-grid">
            {INSIDE_ITEMS.map(item => (
              <div key={item.number} style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
                <span style={{ fontFamily: 'Shrikhand, cursive', fontSize: '2rem', color: '#ff7044', lineHeight: 1, flexShrink: 0, letterSpacing: '-0.04em' }}>
                  {item.number}
                </span>
                <div>
                  <h3 style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: '0.95rem', color: '#362f35', margin: '0 0 6px', letterSpacing: '-0.01em', lineHeight: 1.3 }}>
                    {item.title}
                  </h3>
                  <p style={{ fontFamily: 'Glegoo, serif', fontWeight: 400, fontSize: '0.85rem', color: '#726d6b', lineHeight: 1.65, margin: 0 }}>
                    {item.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ───────────────────────────────────────────────────── */}
      <section style={{ background: '#f9f7f5', borderBottom: '1px solid #eeeeee', padding: '64px 24px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.76rem', fontWeight: 700, color: '#a6967c', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 12px' }}>
          It's free
        </p>
        <h2 style={{ fontFamily: 'Shrikhand, cursive', fontWeight: 400, fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#362f35', letterSpacing: '-0.04em', lineHeight: 1, margin: '0 0 14px' }}>
          Ready to Plan Your 2026 Adventures?
        </h2>
        <div style={{ width: 40, height: 3, background: '#ff7044', borderRadius: 2, margin: '0 auto 20px' }} />
        <p style={{ fontFamily: 'Glegoo, serif', fontWeight: 400, fontSize: '0.95rem', color: '#726d6b', lineHeight: 1.65, maxWidth: 460, margin: '0 auto 32px' }}>
          Get your free copy of the 2026 Florida Travel Trends Guide and start planning smarter.
        </p>
        <a
          href="#hero-form"
          onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          style={{ display: 'inline-block', background: '#ff7044', color: '#fff', textDecoration: 'none', fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: '0.95rem', padding: '15px 40px', borderRadius: '2.3em' }}
        >
          Get the Free Guide →
        </a>
      </section>

      <FooterLinks />
      <SiteFooter />
    </div>
  );
}
