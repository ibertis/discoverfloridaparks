'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { GEAR_CATEGORIES } from '@/lib/gear';

interface Props {
  amenities: Record<string, unknown>;
}

export default function GearRecommendations({ amenities }: Props) {
  const activeCategories = GEAR_CATEGORIES.filter(
    cat => amenities?.[cat.amenityKey] === true
  );

  const [openKey, setOpenKey] = useState<string | null>(null);

  if (activeCategories.length === 0) return null;

  return (
    <section>
      <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.85rem', fontWeight: 600, color: '#a6967c', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 6px' }}>
        Gear Up
      </p>
      <h2 style={{ fontFamily: 'Shrikhand, cursive', fontWeight: 400, fontSize: '2.14rem', color: '#362f35', letterSpacing: '-0.04em', lineHeight: 1, margin: '0 0 12px', paddingBottom: 16, borderBottom: '1px solid #eeeeee' }}>
        What to Pack
      </h2>

      <div style={{ borderRadius: 12, border: '1px solid #eeeeee', overflow: 'hidden' }}>
        {activeCategories.map((category, i) => {
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
                    <a
                      key={item.name}
                      href={item.url}
                      target="_blank"
                      rel="nofollow sponsored noopener noreferrer"
                      style={{
                        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
                        gap: 12, padding: '10px 18px', textDecoration: 'none', background: '#faf8f6',
                        borderTop: j > 0 ? '1px solid #f2eeeb' : 'none',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'baseline', gap: 8, minWidth: 0 }}>
                        <span style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.88rem', fontWeight: 700, color: '#362f35', whiteSpace: 'nowrap' }}>
                          {item.name}
                        </span>
                        <span style={{ fontFamily: 'Glegoo, serif', fontSize: '0.78rem', fontWeight: 400, color: '#a6967c', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.description}
                        </span>
                      </span>
                      <span style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.75rem', fontWeight: 700, color: '#ff7044', whiteSpace: 'nowrap', flexShrink: 0 }}>
                        View on Amazon →
                      </span>
                    </a>
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
