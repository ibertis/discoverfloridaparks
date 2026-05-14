'use client';

import { useState } from 'react';

interface Props {
  variant: 'inline' | 'card';
  source: string;
}

export default function NewsletterSignup({ variant, source }: Props) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) { setErrorMsg('Enter your email address.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed)) {
      setErrorMsg('Enter a valid email address.');
      return;
    }
    setErrorMsg('');
    setStatus('loading');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed, source }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus('success');
      } else {
        setErrorMsg(data.error ?? 'Something went wrong — try again.');
        setStatus('error');
      }
    } catch {
      setErrorMsg('Something went wrong — try again.');
      setStatus('error');
    }
  }

  if (variant === 'card') {
    return <CardVariant status={status} email={email} errorMsg={errorMsg} setEmail={setEmail} setErrorMsg={setErrorMsg} onSubmit={handleSubmit} />;
  }

  return <InlineVariant status={status} email={email} errorMsg={errorMsg} setEmail={setEmail} setErrorMsg={setErrorMsg} onSubmit={handleSubmit} />;
}

// ─── Shared form props ────────────────────────────────────────────────────────

interface FormProps {
  status: 'idle' | 'loading' | 'success' | 'error';
  email: string;
  errorMsg: string;
  setEmail: (v: string) => void;
  setErrorMsg: (v: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

// ─── Inline variant ───────────────────────────────────────────────────────────

function InlineVariant({ status, email, errorMsg, setEmail, setErrorMsg, onSubmit }: FormProps) {
  if (status === 'success') {
    return (
      <p style={{ fontFamily: 'Glegoo, serif', fontWeight: 700, fontSize: '0.92rem', color: '#362f35', lineHeight: 1.6, margin: 0 }}>
        You&apos;re in! Check your inbox for a welcome note. 🌴
      </p>
    );
  }

  return (
    <div>
      <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.72rem', fontWeight: 700, color: '#a6967c', textTransform: 'uppercase', letterSpacing: '0.14em', margin: '0 0 6px' }}>
        GET THE FLORIDA PARKS INSIDER
      </p>
      <p style={{ fontFamily: 'Glegoo, serif', fontWeight: 700, fontSize: '0.85rem', color: '#726d6b', lineHeight: 1.5, margin: '0 0 14px' }}>
        Weekly hidden gems, seasonal tips & park guides — free.
      </p>
      <form onSubmit={onSubmit} noValidate>
        <div className="newsletter-form-row" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <label htmlFor="newsletter-inline-email" style={{ display: 'none' }}>Email address</label>
          <input
            id="newsletter-inline-email"
            type="email"
            placeholder="Your email address"
            value={email}
            disabled={status === 'loading'}
            onChange={e => { setEmail(e.target.value); setErrorMsg(''); }}
            style={{
              flex: '1 1 200px', background: '#fff',
              border: `1.5px solid ${errorMsg ? '#ff7044' : '#dfdfdf'}`,
              borderRadius: '2.3em', padding: '11px 18px',
              fontFamily: 'Glegoo, serif', fontSize: '0.85rem', color: '#362f35',
              outline: 'none', minWidth: 0,
            }}
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            style={{
              background: '#ff7044', color: '#fff', border: 'none',
              borderRadius: '2.3em', padding: '11px 22px',
              fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: '0.85rem',
              cursor: status === 'loading' ? 'not-allowed' : 'pointer',
              opacity: status === 'loading' ? 0.7 : 1,
              flexShrink: 0, whiteSpace: 'nowrap',
            }}
          >
            {status === 'loading' ? '…' : 'Join Free →'}
          </button>
        </div>
        {errorMsg && (
          <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.72rem', color: '#ff7044', margin: '6px 0 0 16px' }}>
            {errorMsg}
          </p>
        )}
      </form>
    </div>
  );
}

// ─── Card variant ─────────────────────────────────────────────────────────────

function CardVariant({ status, email, errorMsg, setEmail, setErrorMsg, onSubmit }: FormProps) {
  if (status === 'success') {
    return (
      <div style={{ background: '#f9f7f5', borderRadius: 20, padding: '48px 36px', textAlign: 'center', maxWidth: 560, margin: '0 auto' }}>
        <p style={{ fontFamily: 'Shrikhand, cursive', fontWeight: 400, fontSize: '2.2rem', color: '#362f35', letterSpacing: '-0.04em', lineHeight: 1, margin: '0 0 12px' }}>
          You&apos;re in! 🌴
        </p>
        <p style={{ fontFamily: 'Glegoo, serif', fontWeight: 700, fontSize: '0.92rem', color: '#726d6b', lineHeight: 1.6, margin: 0 }}>
          Check your inbox for your first guide.
        </p>
      </div>
    );
  }

  return (
    <div style={{ background: '#f9f7f5', borderRadius: 20, padding: '48px 36px', textAlign: 'center', maxWidth: 560, margin: '0 auto' }}>
      <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.72rem', fontWeight: 700, color: '#a6967c', textTransform: 'uppercase', letterSpacing: '0.14em', margin: '0 0 10px' }}>
        FREE NEWSLETTER
      </p>
      <h2 style={{ fontFamily: 'Shrikhand, cursive', fontWeight: 400, fontSize: 'clamp(2rem, 4vw, 2.8rem)', color: '#362f35', letterSpacing: '-0.04em', lineHeight: 1, margin: '0 0 14px' }}>
        Hundreds of parks.<br />Endless adventures.
      </h2>
      <p style={{ fontFamily: 'Glegoo, serif', fontWeight: 700, fontSize: '0.88rem', color: '#726d6b', lineHeight: 1.6, margin: '0 auto 28px', maxWidth: 380 }}>
        The Florida Parks Insider delivers the best parks, hidden gems, and seasonal guides straight to your inbox.
      </p>
      <form onSubmit={onSubmit} noValidate>
        <div className="newsletter-form-row" style={{ display: 'flex', gap: 8, maxWidth: 420, margin: '0 auto' }}>
          <label htmlFor="newsletter-card-email" style={{ display: 'none' }}>Email address</label>
          <input
            id="newsletter-card-email"
            type="email"
            placeholder="Your email address"
            value={email}
            disabled={status === 'loading'}
            onChange={e => { setEmail(e.target.value); setErrorMsg(''); }}
            style={{
              flex: 1, background: '#fff',
              border: `1.5px solid ${errorMsg ? '#ff7044' : '#dfdfdf'}`,
              borderRadius: '2.3em', padding: '12px 20px',
              fontFamily: 'Glegoo, serif', fontSize: '0.88rem', color: '#362f35',
              outline: 'none', minWidth: 0,
            }}
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            style={{
              background: '#ff7044', color: '#fff', border: 'none',
              borderRadius: '2.3em', padding: '12px 24px',
              fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: '0.88rem',
              cursor: status === 'loading' ? 'not-allowed' : 'pointer',
              opacity: status === 'loading' ? 0.7 : 1,
              flexShrink: 0,
            }}
          >
            {status === 'loading' ? '…' : "Let's Go →"}
          </button>
        </div>
        {errorMsg && (
          <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.72rem', color: '#ff7044', margin: '8px auto 0', textAlign: 'center' }}>
            {errorMsg}
          </p>
        )}
      </form>
      <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.72rem', color: '#b8b0a8', margin: '14px 0 0' }}>
        No spam. Unsubscribe anytime.
      </p>
    </div>
  );
}
