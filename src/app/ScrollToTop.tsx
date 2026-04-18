'use client';

import { useEffect, useState } from 'react';
import { ArrowUpIcon } from '@phosphor-icons/react/dist/ssr';

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Scroll to top"
      style={{
        position: 'fixed', bottom: 28, right: 28, zIndex: 50,
        width: 44, height: 44, borderRadius: '50%',
        background: '#ff7044', border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
        transition: 'opacity 0.25s ease',
      }}
      className="hover:opacity-85"
    >
      <ArrowUpIcon weight="bold" size={20} color="#fff" />
    </button>
  );
}
