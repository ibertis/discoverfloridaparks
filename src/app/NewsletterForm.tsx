'use client';

import { useState } from 'react';

export default function NewsletterForm() {
  const [email, setEmail]     = useState('');
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim()) { setError('Enter your email address.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Enter a valid email.'); return; }
    setError('');
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 600));
      setSuccess(true);
      setEmail('');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <p style={{ fontFamily: 'Glegoo, serif', fontWeight: 700, fontSize: '0.88rem', color: '#362f35', lineHeight: 1.6, margin: 0 }}>
        You&apos;re subscribed! 🌴 Watch your inbox.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div style={{ display: 'flex', gap: 8 }}>
        <label htmlFor="newsletter-email" style={{ display: 'none' }}>Email address</label>
        <input
          id="newsletter-email"
          type="email"
          placeholder="Your email"
          value={email}
          onChange={e => { setEmail(e.target.value); setError(''); }}
          style={{
            flex: 1, background: '#fff', border: `1.5px solid ${error ? '#ff7044' : '#dfdfdf'}`,
            borderRadius: '2.3em', padding: '10px 16px', fontFamily: 'Glegoo, serif',
            fontSize: '0.82rem', color: '#362f35', outline: 'none', minWidth: 0,
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            background: '#ff7044', color: '#fff', border: 'none', borderRadius: '2.3em',
            padding: '10px 20px', fontFamily: 'Archivo, sans-serif', fontWeight: 700,
            fontSize: '0.82rem', cursor: loading ? 'not-allowed' : 'pointer',
            flexShrink: 0, opacity: loading ? 0.7 : 1,
          }}
          className="hover:opacity-85 transition-opacity"
        >
          {loading ? '…' : 'Subscribe'}
        </button>
      </div>
      {error && <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.72rem', color: '#ff7044', margin: '6px 0 0 16px' }}>{error}</p>}
    </form>
  );
}
