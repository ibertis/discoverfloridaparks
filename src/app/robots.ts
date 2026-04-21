import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/studio', '/admin'],
      },
    ],
    sitemap: 'https://discoverfloridaparks.com/sitemap.xml',
  };
}
