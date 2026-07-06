import { Star, Clock } from 'lucide-react';
import AffiliateLink from '@/components/AffiliateLink';

export interface CatalogExperience {
  id: string;
  name: string;
  provider: string | null;
  description: string | null;
  activity_type: string;
  affiliate_url: string;
  affiliate_source: string;
  price_from: number | null;
  price_currency: string;
  review_count: number;
  rating: number | null;
  duration_hours: number | null;
  is_featured: boolean;
}

export default function ExperienceCard({ experience: e }: { experience: CatalogExperience }) {
  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid #eeeeee',
        borderRadius: 12,
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
      className="hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-shadow"
    >
      {/* Activity badge */}
      <span style={{
        display: 'inline-block',
        background: '#fff3ef',
        color: '#ff7044',
        fontFamily: 'Archivo, sans-serif',
        fontSize: '0.72rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        padding: '4px 12px',
        borderRadius: '2.3em',
        alignSelf: 'flex-start',
      }}>
        {e.activity_type}
      </span>

      {/* Name */}
      <h4 style={{
        fontFamily: 'Shrikhand, cursive',
        fontSize: '1.4rem',
        fontWeight: 400,
        color: '#362f35',
        letterSpacing: '-0.03em',
        lineHeight: 1.1,
        margin: 0,
      }}>
        {e.name}
      </h4>

      {/* Provider */}
      {e.provider && (
        <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.82rem', color: '#a6967c', margin: 0 }}>
          by {e.provider}
        </p>
      )}

      {/* Description */}
      {e.description && (
        <p style={{
          fontFamily: 'Glegoo, serif',
          fontWeight: 700,
          fontSize: '0.88rem',
          color: '#726d6b',
          lineHeight: 1.6,
          margin: 0,
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        } as React.CSSProperties}>
          {e.description}
        </p>
      )}

      {/* Meta row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, fontFamily: 'Archivo, sans-serif', fontSize: '0.82rem', color: '#726d6b' }}>
        {e.rating != null && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Star size={13} style={{ color: '#e8a020', fill: '#e8a020' }} />
            {e.rating.toFixed(1)}
            {e.review_count > 0 && ` (${e.review_count.toLocaleString()} reviews)`}
          </span>
        )}
        {e.duration_hours != null && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Clock size={13} style={{ color: '#a6967c' }} />
            {e.duration_hours} hrs
          </span>
        )}
      </div>

      {/* Price */}
      {e.price_from != null && (
        <p style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: '1.05rem', color: '#362f35', margin: 0 }}>
          From ${Math.round(e.price_from)} per person
        </p>
      )}

      {/* CTA */}
      <AffiliateLink
        network={e.affiliate_source ?? 'viator'}
        placement="park-experience-catalog"
        href={e.affiliate_url}
        target="_blank"
        rel="noopener nofollow sponsored"
        style={{
          display: 'block',
          background: '#ff7044',
          color: '#ffffff',
          fontFamily: 'Archivo, sans-serif',
          fontWeight: 700,
          fontSize: '0.92rem',
          textAlign: 'center',
          textDecoration: 'none',
          padding: '13px 24px',
          borderRadius: '2.3em',
          marginTop: 4,
        }}
        className="hover:opacity-90 transition-opacity"
      >
        Book This Experience →
      </AffiliateLink>

      {/* Attribution */}
      <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.72rem', color: '#a6967c', textAlign: 'center', margin: 0 }}>
        {e.affiliate_source === 'viator' ? 'Powered by Viator · Free cancellation on most bookings' : 'Partner experience'}
      </p>
    </div>
  );
}
