import type { Metadata } from 'next';

// The page is a 'use client' component and can't export metadata itself, so this
// server layout supplies it. Coming-soon page → noindex (thin content) but a
// self-referential canonical so it isn't mislabeled as the homepage.
export const metadata: Metadata = {
  title: 'Shop — Coming Soon | Discover Florida Parks',
  description: "Curated outdoor gear for exploring Florida's parks. Our shop is coming soon — sign up to be notified.",
  alternates: { canonical: 'https://www.discoverfloridaparks.com/shop' },
  robots: { index: false, follow: true },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return children;
}
