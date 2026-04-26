import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Star, ArrowRight } from 'lucide-react';

export interface ParkCardData {
  id: string;
  slug: string;
  name: string;
  short_description?: string | null;
  park_types?: string[] | null;
  park_regions?: string[] | null;
  featured_image_url?: string | null;
  google_rating?: number | null;
}

export default function ParkCard({ park }: { park: ParkCardData }) {
  return (
    <Link
      href={`/parks/${park.slug}`}
      style={{
        display: 'flex', flexDirection: 'column', borderRadius: 16,
        overflow: 'hidden', border: '1px solid #eeeeee', background: '#fff',
        transition: 'box-shadow 0.2s', textDecoration: 'none',
      }}
      className="group hover:shadow-lg"
    >
      <div style={{ position: 'relative', height: 200, overflow: 'hidden', background: '#f0ece6' }}>
        {park.featured_image_url ? (
          <Image
            src={park.featured_image_url}
            alt={park.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            style={{ objectFit: 'cover', transition: 'transform 0.5s' }}
            className="group-hover:scale-105"
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e8e0d6' }}>
            <MapPin size={32} style={{ color: '#a6967c' }} />
          </div>
        )}
        {park.park_types?.[0] && (
          <span style={{
            position: 'absolute', top: 12, right: 12,
            background: '#ff7044', color: '#fff', borderRadius: '2.3em',
            padding: '4px 12px', fontFamily: 'Archivo, sans-serif',
            fontSize: '0.72rem', fontWeight: 700,
          }}>
            {park.park_types[0]}
          </span>
        )}
      </div>

      <div style={{ padding: '18px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{
          fontFamily: 'Shrikhand, cursive', fontWeight: 400, fontSize: '1.5rem',
          lineHeight: 1.05, color: '#362f35', margin: '0 0 6px', letterSpacing: '-0.04em',
        }}>
          {park.name}
        </h3>
        {park.park_regions && park.park_regions.length > 0 && (
          <p style={{
            fontFamily: 'Archivo, sans-serif', fontSize: '0.78rem', color: '#a6967c',
            display: 'flex', alignItems: 'center', gap: 4, margin: '0 0 10px',
          }}>
            <MapPin size={11} /> {park.park_regions.join(', ')}
          </p>
        )}
        {park.short_description && (
          <p style={{
            fontFamily: 'Glegoo, serif', fontWeight: 700, fontSize: '0.82rem',
            color: '#726d6b', lineHeight: 1.55, flex: 1, margin: '0 0 14px',
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {park.short_description}
          </p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {park.google_rating ? (
            <span style={{
              display: 'flex', alignItems: 'center', gap: 4,
              fontFamily: 'Archivo, sans-serif', fontSize: '0.78rem',
              fontWeight: 700, color: '#e8a020',
            }}>
              <Star size={13} fill="currentColor" /> {park.google_rating}
            </span>
          ) : <span />}
          <span style={{
            fontFamily: 'Archivo, sans-serif', fontSize: '0.78rem',
            fontWeight: 700, color: '#ff7044',
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            Explore <ArrowRight size={13} />
          </span>
        </div>
      </div>
    </Link>
  );
}
