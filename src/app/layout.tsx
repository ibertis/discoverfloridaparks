import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Discover Florida Parks',
    template: '%s | Discover Florida Parks',
  },
  description: 'Explore Florida\'s best state parks, national parks, nature preserves, and outdoor attractions.',
  alternates: { canonical: 'https://discoverfloridaparks.com' },
  robots: { index: true, follow: true },
  openGraph: {
    siteName: 'Discover Florida Parks',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: 'https://discoverfloridaparks.com/hero-1.jpg',
        width: 1280,
        height: 853,
        alt: 'Discover Florida Parks',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Discover Florida Parks',
            url: 'https://discoverfloridaparks.com',
            logo: 'https://discoverfloridaparks.com/dfp-logo.png',
            description: 'Your all-in-one guide to Florida\'s best parks, beaches, and outdoor adventures.',
          }) }}
        />
      </head>
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
