'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { GEAR_CATEGORIES, UNIVERSAL_ITEMS } from '@/lib/gear';
import AffiliateLink from '@/components/AffiliateLink';

interface Props {
  amenities: Record<string, unknown>;
}

export default function GearRecommendations({ amenities }: Props) {
  const activeCategories = GEAR_CATEGORIES.filter(
    cat => amenities?.[cat.amenityKey] === true
  );

  const allCategories = [
    { label: 'Florida Essentials', amenityKey: '_universal', items: UNIVERSAL_ITEMS },
    ...activeCategories,
  ];

  // Default-open the first category (always "Florida Essentials") so visitors see
  // a helpful "what to pack" preview instead of a fully-collapsed accordion.
  const [openKey, setOpenKey] = useState<string | null>(allCategories[0]?.amenityKey ?? null);

  return (
    <section>
      <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.85rem', fontWeight: 600, color: '#a6967c', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px' }}>
        Gear Up
      </p>
      <h2 style={{ fontFamily: 'Shrikhand, cursive', fontWeight: 400, fontSize: '2.14rem', color: '#362f35', letterSpacing: '-0.04em', lineHeight: 1, margin: '0 0 12px', paddingBottom: 16, borderBottom: '1px solid #eeeeee' }}>
        What to Pack
      </h2>

      <div style={{ borderRadius: 12, border: '1px solid #eeeeee', overflow: 'hidden' }}>
        {allCategories.map((category, i) => {
          const isOpen = openKey === category.amenityKey;
          return (
            <div key={category.amenityKey} style={{ borderTop: i > 0 ? '1px solid #eeeeee' : 'none' }}>
              <button
                onClick={() => setOpenKey(isOpen ? null : category.amenityKey)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 18px', background: isOpen ? '#faf8f6' : '#fff',
                  border: 'none', cursor: 'pointer', textAlign: 'left',
                }}
              >
                <span style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.85rem', fontWeight: 700, color: '#362f35', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {category.label}
                </span>
                <ChevronDown
                  size={16}
                  style={{ color: '#a6967c', flexShrink: 0, transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                />
              </button>

              {isOpen && (
                <div style={{ borderTop: '1px solid #f2eeeb' }}>
                  {category.items.map((item, j) => (
                    <AffiliateLink
                      key={item.name}
                      network={item.url.includes('amazon.') ? 'amazon' : 'backcountry'}
                      placement="park-gear"
                      href={item.url}
                      target="_blank"
                      rel="nofollow sponsored noopener noreferrer"
                      className="gear-item-row"
                      style={{
                        display: 'flex', alignItems: 'baseline',
                        gap: 8, padding: '10px 18px', textDecoration: 'none', background: '#faf8f6',
                        borderTop: j > 0 ? '1px solid #f2eeeb' : 'none',
                      }}
                    >
                      <span style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.88rem', fontWeight: 700, color: '#ff7044', whiteSpace: 'nowrap' }}>
                        {item.name}
                      </span>
                      <span style={{ fontFamily: 'Glegoo, serif', fontSize: '0.78rem', fontWeight: 400, color: '#a6967c', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.description}
                      </span>
                    </AffiliateLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.72rem', color: '#c4bab3', marginTop: 12, lineHeight: 1.6 }}>
        Gear links are affiliate links. We earn a small commission at no extra cost to you.
      </p>
    </section>
  );
}
