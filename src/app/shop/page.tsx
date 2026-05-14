'use client';

import { useState } from 'react';
import Link from 'next/link';
import SiteHeader from '../SiteHeader';
import SiteFooter from '../SiteFooter';

type Status = 'idle' | 'submitting' | 'success' | 'error';

export default function ShopComingSoon() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  async function handleNotify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim()) { setEmailError('Enter your email address.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setEmailError('Enter a valid email.'); return; }
    setEmailError('');
    setStatus('submitting');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Shop Launch Notification',
          email,
          message: `${email} wants to be notified when the DFP Shop launches.`,
        }),
      });
      if (!res.ok) throw new Error();
      setStatus('success');
      setEmail('');
    } catch {
      setStatus('error');
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fff' }}>
      <SiteHeader />

      <main style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

        {/* Background photo */}
        <div
          aria-hidden
          style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/park-photos/page-heroes/shop.jpg)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 60%',
            filter: 'blur(3px) brightness(0.45)',
            transform: 'scale(1.04)',
          }}
        />

        {/* Tinted overlay */}
        <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, rgba(54,47,53,0.55) 0%, rgba(255,112,68,0.18) 100%)' }} />

        {/* Content */}
        <div style={{
          position: 'relative', zIndex: 1,
          textAlign: 'center',
          padding: '100px 24px 120px',
          maxWidth: 680,
          width: '100%',
        }}>

          {/* Eyebrow */}
          <p style={{
            fontFamily: 'Archivo, sans-serif', fontSize: '0.76rem', fontWeight: 700,
            color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: '0.16em',
            margin: '0 0 18px',
          }}>
            The DFP Store
          </p>

          {/* Headline */}
          <h1 style={{
            fontFamily: 'Shrikhand, cursive', fontWeight: 400,
            fontSize: 'clamp(2.6rem, 6vw, 4.8rem)',
            lineHeight: 0.92, letterSpacing: '-0.04em',
            color: '#ffffff',
            margin: '0 0 24px',
          }}>
            Something Wild<br />
            <span style={{ color: '#ff7044' }}>Is Coming</span>
          </h1>

          {/* Accent rule */}
          <div style={{ width: 52, height: 3, background: '#ff7044', borderRadius: 2, margin: '0 auto 28px' }} />

          {/* Subtext */}
          <p style={{
            fontFamily: 'Glegoo, serif', fontWeight: 400, fontSize: '1rem',
            color: 'rgba(255,255,255,0.8)', lineHeight: 1.65,
            margin: '0 auto 48px', maxWidth: 580,
          }}>
            Florida-inspired gear, apparel, and park essentials — all curated for the curious explorer. Our shop is putting on its hiking boots. Be the first to know when we open.
          </p>

          {/* Email capture */}
          {status === 'success' ? (
            <div style={{
              background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)',
              borderRadius: 20, padding: '28px 36px',
              border: '1px solid rgba(255,255,255,0.18)',
              display: 'inline-block',
            }}>
              <p style={{
                fontFamily: 'Shrikhand, cursive', fontWeight: 400, fontSize: '1.5rem',
                color: '#ff7044', letterSpacing: '-0.03em', margin: '0 0 6px',
              }}>
                You&apos;re on the list!
              </p>
              <p style={{
                fontFamily: 'Glegoo, serif', fontWeight: 400, fontSize: '0.88rem',
                color: 'rgba(255,255,255,0.75)', margin: 0, lineHeight: 1.5,
              }}>
                We&apos;ll drop you a note the moment the shop opens.
              </p>
            </div>
          ) : (
            <form onSubmit={handleNotify} noValidate style={{ maxWidth: 420, margin: '0 auto' }}>
              <div style={{
                display: 'flex', gap: 8,
                background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)',
                borderRadius: '2.3em', padding: '6px 6px 6px 20px',
                border: `1.5px solid ${emailError ? '#ff7044' : 'rgba(255,255,255,0.22)'}`,
              }}>
                <label htmlFor="shop-notify-email" style={{ display: 'none' }}>Email address</label>
                <input
                  id="shop-notify-email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setEmailError(''); }}
                  style={{
                    flex: 1, background: 'transparent', border: 'none', outline: 'none',
                    fontFamily: 'Glegoo, serif', fontSize: '0.9rem',
                    color: '#ffffff', minWidth: 0,
                  }}
                />
                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  style={{
                    background: '#ff7044', color: '#fff', border: 'none',
                    borderRadius: '2.3em', padding: '11px 24px',
                    fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: '0.85rem',
                    cursor: status === 'submitting' ? 'not-allowed' : 'pointer',
                    flexShrink: 0, opacity: status === 'submitting' ? 0.7 : 1,
                    whiteSpace: 'nowrap',
                  }}
                  className="hover:opacity-85 transition-opacity"
                >
                  {status === 'submitting' ? 'Sending…' : 'Notify Me'}
                </button>
              </div>
              {emailError && (
                <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.72rem', color: '#ffb89a', margin: '8px 0 0 16px', textAlign: 'left' }}>
                  {emailError}
                </p>
              )}
              {status === 'error' && (
                <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.72rem', color: '#ffb89a', margin: '8px 0 0 16px', textAlign: 'left' }}>
                  Something went wrong — try again or reach us at hello@discoverfloridaparks.com
                </p>
              )}
            </form>
          )}

          {/* Secondary links */}
          <div style={{ marginTop: 48, display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/parks"
              style={{
                fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: '0.85rem',
                color: 'rgba(255,255,255,0.85)', borderBottom: '2px solid rgba(255,255,255,0.35)',
                paddingBottom: 2,
              }}
              className="hover:text-white hover:border-white transition-colors"
            >
              Browse Florida Parks →
            </Link>
            <Link
              href="/"
              style={{
                fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: '0.85rem',
                color: 'rgba(255,255,255,0.85)', borderBottom: '2px solid rgba(255,255,255,0.35)',
                paddingBottom: 2,
              }}
              className="hover:text-white hover:border-white transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>

      </main>

      <SiteFooter />
    </div>
  );
}
