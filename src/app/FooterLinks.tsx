'use client';

import Link from 'next/link';
import { useState } from 'react';

const FL_PARKS_LINKS = [
  { label: 'National Parks',  href: '/parks?type=National+Parks' },
  { label: 'State Parks',     href: '/parks?type=State+Parks' },
  { label: 'Theme Parks',     href: '/parks?type=Theme+Parks' },
  { label: 'Water Parks',     href: '/parks?type=Water+Parks' },
];

const OTHER_COLUMNS = [
  {
    heading: 'Travel',
    links: [
      { label: 'Destinations',   href: '/parks' },
      { label: 'Travel Trends',  href: '#' },
      { label: 'Our Deals',      href: '#' },
      { label: 'Upcoming Trips', href: '#' },
    ],
  },
  {
    heading: 'Resources',
    links: [
      { label: 'News',              href: '#' },
      { label: 'Our Channel',       href: '#' },
      { label: 'The Ultimate App',  href: '#' },
      { label: 'Our Blog',          href: '#' },
    ],
  },
  {
    heading: 'Tips',
    links: [
      { label: 'Trip Planner',  href: '#' },
      { label: 'Travel Tips',   href: '#' },
      { label: 'Family Trips',  href: '#' },
      { label: 'Our Picks',     href: '#' },
    ],
  },
  {
    heading: 'Styles',
    links: [
      { label: 'Hot Deals',   href: '#' },
      { label: 'Clearance',   href: '#' },
      { label: 'New Deals',   href: '#' },
      { label: 'Our Shop',    href: '#' },
    ],
  },
  {
    heading: 'We Care',
    links: [
      { label: 'Conservation',  href: '#' },
      { label: 'Preservation',  href: '#' },
      { label: 'Useful Links',  href: '#' },
      { label: 'Our Efforts',   href: '#' },
    ],
  },
];

const COLUMNS = [
  { heading: 'FL Parks', links: FL_PARKS_LINKS },
  ...OTHER_COLUMNS,
];

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

export default function FooterLinks() {
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(false);
  const [errors, setErrors]   = useState<Record<string, string>>({});
  const [status, setStatus]   = useState<FormStatus>('idle');

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim())    e.name    = 'Name is required.';
    if (!email.trim())   e.email   = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email.';
    if (!message.trim()) e.message = 'Message is required.';
    if (!consent)        e.consent = 'Please accept to continue.';
    return e;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setStatus('submitting');
    try {
      // Replace with your preferred form endpoint (e.g. Resend, Formspree, Web3Forms)
      // const res = await fetch(process.env.NEXT_PUBLIC_CONTACT_FORM_ENDPOINT!, { method: 'POST', ... })
      await new Promise(r => setTimeout(r, 800));
      setStatus('success');
      setName(''); setEmail(''); setMessage(''); setConsent(false);
    } catch {
      setStatus('error');
    }
  }

  const inputStyle: React.CSSProperties = {
    background: '#f5f3f0', border: 'none', borderRadius: '2.3em',
    padding: '14px 22px', fontFamily: 'Glegoo, serif', fontSize: '0.9rem',
    color: '#362f35', outline: 'none', width: '100%',
  };

  return (
    <section style={{ background: '#fff', borderTop: '1px solid #eeeeee' }} className="page-section-pad">
      <div style={{ maxWidth: 1278, margin: '0 auto' }} className="footer-links-grid">

        {/* Left — contact form */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ maxWidth: 420, width: '100%' }}>
            <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.78rem', fontWeight: 600, color: '#a6967c', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 10px' }}>
              Drop us a line
            </p>
            <h2 style={{ fontFamily: 'Shrikhand, cursive', fontWeight: 400, fontSize: '2.8rem', color: '#362f35', margin: '0 0 20px', letterSpacing: '-0.04em', lineHeight: 1 }}>
              Have Questions?
            </h2>
            <hr style={{ border: 'none', borderTop: '3px solid #ff7044', width: 36, margin: '0 0 28px' }} />

            {status === 'success' ? (
              <div style={{ background: '#f5f3f0', borderRadius: 16, padding: '32px 28px', textAlign: 'center' }}>
                <p style={{ fontFamily: 'Shrikhand, cursive', fontWeight: 400, fontSize: '1.8rem', color: '#362f35', margin: '0 0 10px', letterSpacing: '-0.03em' }}>
                  Message sent!
                </p>
                <p style={{ fontFamily: 'Glegoo, serif', fontWeight: 700, fontSize: '0.88rem', color: '#726d6b', margin: '0 0 20px', lineHeight: 1.6 }}>
                  Thanks for reaching out. We&apos;ll get back to you soon.
                </p>
                <button
                  onClick={() => setStatus('idle')}
                  style={{ background: 'none', border: 'none', fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: '0.85rem', color: '#ff7044', cursor: 'pointer' }}
                >
                  Send another →
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label htmlFor="contact-name" style={{ display: 'none' }}>Your name</label>
                  <input
                    id="contact-name"
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    aria-invalid={!!errors.name}
                    style={{ ...inputStyle, borderBottom: errors.name ? '2px solid #ff7044' : 'none' }}
                  />
                  {errors.name && <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.72rem', color: '#ff7044', margin: '4px 0 0 18px' }}>{errors.name}</p>}
                </div>

                <div>
                  <label htmlFor="contact-email" style={{ display: 'none' }}>Your email</label>
                  <input
                    id="contact-email"
                    type="email"
                    placeholder="Your E-mail"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    aria-invalid={!!errors.email}
                    style={{ ...inputStyle, borderBottom: errors.email ? '2px solid #ff7044' : 'none' }}
                  />
                  {errors.email && <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.72rem', color: '#ff7044', margin: '4px 0 0 18px' }}>{errors.email}</p>}
                </div>

                <div>
                  <label htmlFor="contact-message" style={{ display: 'none' }}>Your message</label>
                  <textarea
                    id="contact-message"
                    placeholder="Your Message"
                    rows={5}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    aria-invalid={!!errors.message}
                    style={{
                      background: '#f5f3f0', border: 'none', borderRadius: '1.4em',
                      padding: '14px 22px', fontFamily: 'Glegoo, serif', fontSize: '0.9rem',
                      color: '#362f35', outline: 'none', width: '100%', resize: 'vertical',
                      borderBottom: errors.message ? '2px solid #ff7044' : 'none',
                    }}
                  />
                  {errors.message && <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.72rem', color: '#ff7044', margin: '4px 0 0 18px' }}>{errors.message}</p>}
                </div>

                <div>
                  <label style={{
                    fontFamily: 'Archivo, sans-serif', fontSize: '0.68rem', color: '#726d6b',
                    lineHeight: 1.6, display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer',
                  }}>
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={e => setConsent(e.target.checked)}
                      style={{ marginTop: 2, accentColor: '#ff7044', flexShrink: 0 }}
                    />
                    By using this form you agree with the storage and handling of your data by this website.
                  </label>
                  {errors.consent && <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.72rem', color: '#ff7044', margin: '4px 0 0 28px' }}>{errors.consent}</p>}
                </div>

                {status === 'error' && (
                  <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.78rem', color: '#ff7044', margin: 0 }}>
                    Something went wrong. Please try again.
                  </p>
                )}

                <div>
                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    style={{
                      background: '#ff7044', color: '#fff', border: 'none', borderRadius: '2.3em',
                      padding: '13px 36px', fontFamily: 'Archivo, sans-serif', fontWeight: 700,
                      fontSize: '0.9rem', cursor: status === 'submitting' ? 'not-allowed' : 'pointer',
                      opacity: status === 'submitting' ? 0.7 : 1,
                    }}
                    className="hover:opacity-85 transition-opacity"
                  >
                    {status === 'submitting' ? 'Sending…' : 'Send a message'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Right — nav columns */}
        <div className="footer-nav-grid">
          {COLUMNS.map(col => (
            <div key={col.heading}>
              <h3 style={{ fontFamily: 'Shrikhand, cursive', fontWeight: 400, fontSize: '1.45rem', color: '#362f35', margin: '0 0 12px', letterSpacing: '-0.03em', lineHeight: 1 }}>
                {col.heading}
              </h3>
              <hr style={{ border: 'none', borderTop: '3px solid #a6967c', width: 28, margin: '0 0 16px' }} />
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {col.links.map(link => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.85rem', color: '#726d6b', textDecoration: 'none' }}
                      className="hover:text-[#ff7044] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
