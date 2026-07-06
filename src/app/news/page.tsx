import type { Metadata } from 'next';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import SiteHeader from '../SiteHeader';
import SiteFooter from '../SiteFooter';
import FooterLinks from '../FooterLinks';
import { fetchAllFeeds, relativeDate, type NewsItem } from '@/lib/news-feeds';

export const revalidate = 7200;

export const metadata: Metadata = {
  title: 'Florida Parks & Conservation News',
  description: 'The latest news on Florida state parks, wildlife conservation, the Everglades, coral reef restoration, and more — aggregated from partner organizations and top news sources.',
  alternates: { canonical: 'https://www.discoverfloridaparks.com/news' },
  openGraph: {
    title: 'Florida Parks & Conservation News',
    description: 'Stay informed on Florida parks, wildlife, and conservation efforts.',
    url: 'https://www.discoverfloridaparks.com/news',
  },
};

function NewsCard({ item }: { item: NewsItem }) {
  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className="news-item-card"
    >
      {/* Source badge */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div
          style={{
            width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
            background: item.sourceColor, display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: '#fff',
            fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: '1rem',
          }}
        >
          {item.sourceInitial}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.72rem', fontWeight: 600, color: '#a6967c', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {item.sourceName}
            </span>
            <span style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.72rem', color: '#c0bab8' }}>·</span>
            <span style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.72rem', color: '#a6967c' }}>
              {relativeDate(item.pubDate)}
            </span>
          </div>

          <h3 style={{ fontFamily: 'Shrikhand, cursive', fontWeight: 400, fontSize: 'clamp(1.05rem, 1.8vw, 1.25rem)', color: '#362f35', margin: '0 0 6px', letterSpacing: '-0.025em', lineHeight: 1.2 }}>
            {item.title}
          </h3>

          {item.snippet && (
            <p style={{ fontFamily: 'Glegoo, serif', fontSize: '0.83rem', color: '#726d6b', margin: 0, lineHeight: 1.55 }}>
              {item.snippet}
            </p>
          )}
        </div>

        <ExternalLink size={14} color="#c0bab8" style={{ flexShrink: 0, marginTop: 4 }} />
      </div>
    </a>
  );
}

function SectionHeading({ eyebrow, title, sub }: { eyebrow: string; title: string; sub: string }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.78rem', fontWeight: 600, color: '#a6967c', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 8px' }}>
        {eyebrow}
      </p>
      <h2 style={{ fontFamily: 'Shrikhand, cursive', fontWeight: 400, fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', color: '#362f35', margin: '0 0 10px', letterSpacing: '-0.04em', lineHeight: 1 }}>
        {title}
      </h2>
      <p style={{ fontFamily: 'Glegoo, serif', fontWeight: 700, fontSize: '0.88rem', color: '#726d6b', margin: 0 }}>
        {sub}
      </p>
      <hr style={{ border: 'none', borderTop: '3px solid #ff7044', width: 36, margin: '16px 0 0' }} />
    </div>
  );
}

export default async function NewsPage() {
  const { partner, googleNews } = await fetchAllFeeds();

  return (
    <div style={{ background: '#fff', color: '#413734', minHeight: '100vh' }}>
      <SiteHeader />

      {/* Banner */}
      <div style={{ background: '#f9f7f5', borderBottom: '1px solid #eeeeee', padding: '56px 24px' }}>
        <div style={{ maxWidth: 1278, margin: '0 auto' }}>
          <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.85rem', fontWeight: 600, color: '#a6967c', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
            Stay Informed
          </p>
          <h1 style={{ fontFamily: 'Shrikhand, cursive', fontWeight: 400, fontSize: 'clamp(2.5rem, 5vw, 4.14rem)', lineHeight: 0.98, color: '#362f35', margin: '0 0 12px', letterSpacing: '-0.04em' }}>
            Florida Parks News
          </h1>
          <p style={{ fontFamily: 'Glegoo, serif', fontWeight: 700, fontSize: '0.95rem', color: '#726d6b', margin: 0 }}>
            Conservation updates, park news, and wildlife stories — updated every few hours
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1278, margin: '0 auto', padding: '64px 24px 96px' }}>
        <div className="news-two-col">

          {/* Google News */}
          <section>
            <SectionHeading
              eyebrow="Latest Coverage"
              title="In the News"
              sub="Recent press on Florida parks, wildlife, the Everglades, and reef restoration"
            />
            {googleNews.length === 0 ? (
              <p style={{ fontFamily: 'Glegoo, serif', fontSize: '0.9rem', color: '#a6967c', padding: '32px 0' }}>
                No recent news stories available — check back soon.
              </p>
            ) : (
              <div className="news-list">
                {googleNews.map(item => <NewsCard key={item.id} item={item} />)}
              </div>
            )}
          </section>

          {/* Partner news */}
          <section>
            <SectionHeading
              eyebrow="Partner Organizations"
              title="From Our Partners"
              sub="Stories from the conservation orgs working to protect Florida's natural world"
            />
            {partner.length === 0 ? (
              <p style={{ fontFamily: 'Glegoo, serif', fontSize: '0.9rem', color: '#a6967c', padding: '32px 0' }}>
                No partner stories available right now — check back soon.
              </p>
            ) : (
              <div className="news-list">
                {partner.map(item => <NewsCard key={item.id} item={item} />)}
              </div>
            )}
          </section>

        </div>

        {/* Attribution */}
        <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.72rem', color: '#c0bab8', textAlign: 'center', marginTop: 64 }}>
          News is aggregated from public RSS feeds and updated automatically. Stories link to their original sources.
        </p>
      </div>

      <FooterLinks />
      <SiteFooter />
    </div>
  );
}
