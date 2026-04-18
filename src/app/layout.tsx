import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Discover Florida Parks',
    template: '%s | Discover Florida Parks',
  },
  description: 'Explore Florida\'s best state parks, national parks, nature preserves, and outdoor attractions.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
