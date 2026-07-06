import type { Metadata } from 'next';

// The page is a 'use client' component and can't export metadata itself, so this
// server layout supplies it. Indexable lead-magnet page with a real canonical.
export const metadata: Metadata = {
  title: '2026 Florida Travel Trends Report | Discover Florida Parks',
  description: 'A free report on the trends shaping Florida outdoor travel in 2026 — where people are going, when, and what is changing. Download the guide.',
  alternates: { canonical: 'https://www.discoverfloridaparks.com/travel-trends' },
};

export default function TravelTrendsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
