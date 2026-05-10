'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export interface FeaturedExperience {
  id: string;
  name: string;
  description: string | null;
  duration_hours: number | null;
  image_url: string | null;
  affiliate_url: string | null;
  homepage_order: number | null;
  regions: string[] | null;
}

const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a6967c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

function formatDuration(hours: number | null): string | null {
  if (hours == null) return null;
  return `${hours} hrs`;
}

function coordsToRegions(lat: number, lon: number): string[] {
  const matched: string[] = [];
  if (lat > 30.0 && lon < -85.5) matched.push('Northwest Florida / Panhandle');
  if (lat > 29.5 && lon > -85.5 && lon < -81.5) matched.push('North Florida');
  if (lat > 29.5 && lon > -81.5) matched.push('Northeast Florida');
  if (lat >= 27.5 && lat <= 29.5 && lon >= -83 && lon <= -80.5) matched.push('Central Florida');
  if (lat >= 27.5 && lat <= 29.5 && lon < -82.5) matched.push('Central Florida, West Coast');
  if (lat >= 27.5 && lat <= 29.5 && lon > -81) matched.push('Central Florida, East Coast');
  if (lon < -82.5) matched.push('West Coast');
  if (lon > -81) matched.push('East Coast');
  if (lat < 27.5) matched.push('South Florida');
  if (lat < 25.3) matched.push('South Florida, The Keys');
  if (lat >= 25.5 && lat < 27.5 && lon > -80.5) matched.push('Southeast Florida');
  if (lat < 27.5 && lon < -82) matched.push('Southwest Florida');
  return matched;
}

export default function FeaturedExperiencesList({ listings }: { listings: FeaturedExperience[] }) {
  const [displayed, setDisplayed] = useState<FeaturedExperience[]>(listings.slice(0, 3));

  useEffect(() => {
    function applyGeoSort(data: { latitude: number; longitude: number; country_code: string }) {
      const { latitude: lat, longitude: lon, country_code } = data;
      if (country_code !== 'US' || !lat || !lon) return;
      const userRegions = coordsToRegions(lat, lon);
      if (!userRegions.length) return;

      const pinned = listings
        .filter(e => e.homepage_order != null)
        .sort((a, b) => (a.homepage_order ?? 0) - (b.homepage_order ?? 0));
      const unpinned = listings.filter(e => e.homepage_order == null);
      const matched = unpinned.filter(e => e.regions?.some(r => userRegions.includes(r)));
      const rest = unpinned.filter(e => !e.regions?.some(r => userRegions.includes(r)));

      const sorted = [...pinned, ...matched, ...rest].slice(0, 3);
      // Only update state if the geo sort actually changes which items show
      const currentIds = displayed.map(e => e.id).join(',');
      const newIds = sorted.map(e => e.id).join(',');
      if (currentIds !== newIds) setDisplayed(sorted);
    }

    try {
      const cached = sessionStorage.getItem('dfp-user-geo');
      if (cached) {
        applyGeoSort(JSON.parse(cached));
        return;
      }
      fetch('https://ipapi.co/json/')
        .then(r => r.json())
        .then(data => {
          sessionStorage.setItem('dfp-user-geo', JSON.stringify(data));
          applyGeoSort(data);
        })
        .catch(() => {});
    } catch {
      // sessionStorage unavailable (private browsing on some browsers) — silent fail
    }
  }, [listings]);

  if (displayed.length === 0) {
    return (
      <p style={{ fontFamily: 'Glegoo, serif', fontSize: '0.9rem', color: '#a6967c' }}>
        Check back soon for featured experiences.
      </p>
    );
  }

  return (
    <>
      {displayed.map((item, i) => (
        <div key={item.id}>
          {i > 0 && <hr style={{ border: 'none', borderTop: '1px solid #eeeeee', margin: '32px 0' }} />}
          <div className="featured-listing-row">

            {item.image_url ? (
              <div style={{ width: 136, height: 136, borderRadius: '50%', background: '#e8ddd0', padding: 8, flexShrink: 0 }}>
                <Image
                  src={item.image_url}
                  alt={item.name}
                  width={120}
                  height={120}
                  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', display: 'block' }}
                />
              </div>
            ) : (
              <div style={{ width: 136, height: 136, borderRadius: '50%', background: '#e8ddd0', padding: 8, flexShrink: 0 }}>
                <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#f5f1ec' }} />
              </div>
            )}

            <div style={{ flex: 1 }}>
              {formatDuration(item.duration_hours) && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f5f3f0', borderRadius: '2.3em', padding: '4px 12px', fontFamily: 'Archivo, sans-serif', fontSize: '0.72rem', fontWeight: 600, color: '#726d6b', marginBottom: 10 }}>
                  <ClockIcon />
                  {formatDuration(item.duration_hours)}
                </span>
              )}
              <h3 style={{ fontFamily: 'Shrikhand, cursive', fontWeight: 400, fontSize: '1.45rem', color: '#362f35', margin: '0 0 8px', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                {item.name}
              </h3>
              {item.description && (
                <p style={{
                  fontFamily: 'Glegoo, serif', fontWeight: 700, fontSize: '0.85rem', color: '#726d6b',
                  lineHeight: 1.6, margin: '0 0 14px',
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                } as React.CSSProperties}>
                  {item.description}
                </p>
              )}
              {item.affiliate_url && (
                <a
                  href={item.affiliate_url}
                  target="_blank"
                  rel="noopener nofollow sponsored"
                  style={{ display: 'inline-block', background: '#ff7044', color: '#fff', borderRadius: '2.3em', padding: '9px 24px', fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: '0.82rem', textDecoration: 'none' }}
                  className="hover:opacity-85 transition-opacity"
                >
                  Get Details →
                </a>
              )}
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
