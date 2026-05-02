import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { CinematicHero } from '@/components/ui/cinematic-landing-hero';

export const metadata: Metadata = {
  title: 'The DFP App — Coming Soon | Discover Florida Parks',
  description: 'Find parks near you, unlock exclusive deals, and discover experiences you can\'t get anywhere else. The Discover Florida Parks app is coming soon.',
};

export default function AppPage() {
  return (
    <div className="overflow-x-hidden w-full">
      <CinematicHero />

      {/* Post-scroll footer */}
      <div style={{
        background: '#0A101D',
        padding: '48px 24px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 20,
      }}>
        <Image
          src="/dfp-logo.png"
          alt="Discover Florida Parks"
          width={160}
          height={42}
          style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)', opacity: 0.5 }}
        />
        <Link
          href="/"
          style={{
            fontFamily: 'Archivo, sans-serif',
            fontSize: '0.82rem',
            fontWeight: 700,
            color: 'rgba(255,255,255,0.35)',
            letterSpacing: '0.04em',
          }}
          className="hover:text-white/60 transition-colors"
        >
          ← Back to Discover Florida Parks
        </Link>
      </div>
    </div>
  );
}
