'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const VIDEO_ID = 'lb8z5V98Wm0';

export default function VideoPlayButton() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Watch video"
        style={{
          width: 52, height: 52, borderRadius: '50%',
          background: '#f0ece6', border: '1px solid #e0d8cc',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
        }}
        className="hover:bg-[#e8e0d4] transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#ff7044" aria-hidden="true">
          <polygon points="6,3 20,12 6,21" />
        </svg>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Florida Parks video"
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'relative',
              width: '100%', maxWidth: 900,
              aspectRatio: '16/9',
              borderRadius: 12, overflow: 'hidden',
              background: '#000',
              boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
            }}
          >
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&controls=0&rel=0&modestbranding=1&iv_load_policy=3`}
              title="Florida Parks"
              allow="autoplay; encrypted-media"
              allowFullScreen
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
            />
            <button
              onClick={() => setOpen(false)}
              aria-label="Close video"
              style={{
                position: 'absolute', top: 12, right: 12, zIndex: 1,
                width: 36, height: 36, borderRadius: '50%',
                background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#fff',
              }}
              className="hover:bg-black/75 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
