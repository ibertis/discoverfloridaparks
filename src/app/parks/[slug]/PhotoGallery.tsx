'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export default function PhotoGallery({ urls }: { urls: string[] }) {
  const [selected, setSelected] = useState<number | null>(null);

  function prev() { setSelected(i => i === null ? null : (i - 1 + urls.length) % urls.length); }
  function next() { setSelected(i => i === null ? null : (i + 1) % urls.length); }

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }} className="gallery-grid">
        {urls.map((url, i) => (
          <div
            key={url}
            onClick={() => setSelected(i)}
            style={{ position: 'relative', height: 200, borderRadius: 12, overflow: 'hidden', cursor: 'pointer', background: '#f0ece6' }}
            className="group"
          >
            <Image
              src={url}
              alt=""
              fill
              sizes="(max-width: 640px) 50vw, 33vw"
              style={{ objectFit: 'cover', transition: 'transform 0.4s' }}
              className="group-hover:scale-105"
            />
          </div>
        ))}
      </div>

      {selected !== null && (
        <div
          onClick={() => setSelected(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <button
            onClick={e => { e.stopPropagation(); prev(); }}
            style={{ position: 'absolute', left: 16, background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}
          >
            <ChevronLeft size={22} />
          </button>

          <div
            onClick={e => e.stopPropagation()}
            style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh', borderRadius: 12, overflow: 'hidden' }}
          >
            <Image
              src={urls[selected]}
              alt=""
              width={1200}
              height={800}
              style={{ maxWidth: '90vw', maxHeight: '90vh', width: 'auto', height: 'auto', display: 'block' }}
              unoptimized
            />
          </div>

          <button
            onClick={e => { e.stopPropagation(); next(); }}
            style={{ position: 'absolute', right: 16, background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}
          >
            <ChevronRight size={22} />
          </button>

          <button
            onClick={() => setSelected(null)}
            style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}
          >
            <X size={16} />
          </button>

          <p style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', fontFamily: 'Archivo, sans-serif', fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)' }}>
            {selected + 1} / {urls.length}
          </p>
        </div>
      )}
    </>
  );
}
