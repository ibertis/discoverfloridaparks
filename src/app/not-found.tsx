import Link from 'next/link';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';

export default function NotFound() {
  return (
    <div style={{ background: '#fff', color: '#413734', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <SiteHeader />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px', textAlign: 'center' }}>
        <div>
          <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.82rem', fontWeight: 600, color: '#a6967c', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 12px' }}>
            404 — Page Not Found
          </p>
          <h1 style={{ fontFamily: 'Shrikhand, cursive', fontWeight: 400, fontSize: 'clamp(3rem, 6vw, 5.5rem)', lineHeight: 0.93, color: '#362f35', margin: '0 0 20px', letterSpacing: '-0.04em' }}>
            Lost in the<br />Wilderness?
          </h1>
          <div style={{ width: 48, height: 3, background: '#ff7044', margin: '0 auto 28px', borderRadius: 2 }} />
          <p style={{ fontFamily: 'Glegoo, serif', fontWeight: 700, fontSize: '0.95rem', color: '#726d6b', lineHeight: 1.6, maxWidth: 340, margin: '0 auto 36px' }}>
            This page doesn&apos;t exist, but Florida has 49 amazing parks waiting for you.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/parks"
              style={{ background: '#ff7044', color: '#fff', borderRadius: '2.3em', padding: '13px 32px', fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none' }}
              className="hover:opacity-90 transition-opacity">
              Browse All Parks →
            </Link>
            <Link href="/"
              style={{ background: 'transparent', color: '#413734', border: '2px solid #dfdfdf', borderRadius: '2.3em', padding: '11px 32px', fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none' }}
              className="hover:border-[#413734] transition-colors">
              Go Home
            </Link>
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
