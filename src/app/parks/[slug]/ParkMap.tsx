'use client';

import { useState, useEffect } from 'react';
import { Maximize2, X } from 'lucide-react';

interface Props {
  src: string;
  parkName: string;
  googleMapsLink?: string;
}

export default function ParkMap({ src, parkName, googleMapsLink }: Props) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setExpanded(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [expanded]);

  return (
    <>
      {/* Preview */}
      <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid #eeeeee', position: 'relative' }}>
        <iframe
          src={src}
          title={`Map of ${parkName}`}
          style={{ width: '100%', height: 220, border: 'none', display: 'block' }}
          loading="lazy"
        />
        <button
          onClick={() => setExpanded(true)}
          aria-label="Expand map"
          style={{
            position: 'absolute', top: 10, right: 10,
            background: '#fff', border: '1px solid #dfdfdf', borderRadius: 8,
            width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#413734', boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
          }}
          className="hover:bg-[#f9f7f5] transition-colors"
        >
          <Maximize2 size={15} />
        </button>
        {googleMapsLink && (
          <div style={{ padding: '10px 16px', background: '#f9f7f5', borderTop: '1px solid #eeeeee' }}>
            <a href={googleMapsLink} target="_blank" rel="noopener noreferrer"
              style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.75rem', fontWeight: 700, color: '#ff7044', textDecoration: 'none' }}
              className="hover:underline">
              Open in Google Maps →
            </a>
          </div>
        )}
      </div>

      {/* Expanded modal */}
      {expanded && (
        <div
          onClick={() => setExpanded(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.75)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'relative', width: '100%', maxWidth: 1000,
              borderRadius: 16, overflow: 'hidden',
              boxShadow: '0 32px 80px rgba(0,0,0,0.4)',
            }}
          >
            <iframe
              src={src}
              title={`Map of ${parkName}`}
              style={{ width: '100%', height: '70vh', border: 'none', display: 'block' }}
            />
            <button
              onClick={() => setExpanded(false)}
              aria-label="Close map"
              style={{
                position: 'absolute', top: 12, right: 12,
                background: '#fff', border: '1px solid #dfdfdf', borderRadius: 8,
                width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#413734', boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
              }}
              className="hover:bg-[#f9f7f5] transition-colors"
            >
              <X size={16} />
            </button>
            {googleMapsLink && (
              <div style={{ padding: '12px 20px', background: '#fff', borderTop: '1px solid #eeeeee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.82rem', fontWeight: 700, color: '#413734' }}>{parkName}</span>
                <a href={googleMapsLink} target="_blank" rel="noopener noreferrer"
                  style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.78rem', fontWeight: 700, color: '#ff7044', textDecoration: 'none' }}
                  className="hover:underline">
                  Open in Google Maps →
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
