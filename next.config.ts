import type { NextConfig } from "next";

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://pagead2.googlesyndication.com https://tpc.googlesyndication.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https:",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://dteajahghspuqrczutgp.supabase.co https://www.google-analytics.com https://analytics.google.com https://region1.google-analytics.com https://api.mapbox.com https://events.mapbox.com https://*.tiles.mapbox.com",
      "worker-src blob:",
      "frame-src https://www.openstreetmap.org https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://www.google.com",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Existing redirects
      { source: '/events/:path*',    destination: '/blog',         permanent: true },
      { source: '/park/:slug*',      destination: '/parks/:slug*', permanent: true },
      { source: '/trip-type/:path*', destination: '/parks',        permanent: true },
      // Slug fixes — long slugs shortened for SEO
      {
        source: '/parks/guana-tolomato-matanzas-national-estuarine-research-reserve-gtm-nerr',
        destination: '/parks/gtm-nerr',
        permanent: true,
      },
      {
        source: '/parks/gamble-rogers-memorial-state-recreation-area-at-flagler-beach',
        destination: '/parks/gamble-rogers-state-park',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dteajahghspuqrczutgp.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        pathname: '/images/**',
      },
      {
        protocol: 'http',
        hostname: 'discoverfloridaparks.local',
      },
    ],
  },
};

export default nextConfig;
