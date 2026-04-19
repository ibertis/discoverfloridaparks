import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Discover Florida Parks',
    template: '%s | Discover Florida Parks',
  },
  description: 'Explore Florida\'s best state parks, national parks, nature preserves, and outdoor attractions.',
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
      </head>
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
