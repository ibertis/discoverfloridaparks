import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/'],
      },
      // AI training crawlers
      { userAgent: 'GPTBot',          disallow: '/' },
      { userAgent: 'ChatGPT-User',    disallow: '/' },
      { userAgent: 'OAI-SearchBot',   disallow: '/' },
      { userAgent: 'Google-Extended', disallow: '/' },
      { userAgent: 'anthropic-ai',    disallow: '/' },
      { userAgent: 'ClaudeBot',       disallow: '/' },
      { userAgent: 'PerplexityBot',   disallow: '/' },
      { userAgent: 'Amazonbot',       disallow: '/' },
      { userAgent: 'FacebookBot',     disallow: '/' },
      { userAgent: 'Omgilibot',       disallow: '/' },
      { userAgent: 'CCBot',           disallow: '/' },
      // Aggressive commercial scrapers
      { userAgent: 'AhrefsBot',       disallow: '/' },
      { userAgent: 'SemrushBot',      disallow: '/' },
      { userAgent: 'MJ12bot',         disallow: '/' },
      { userAgent: 'DotBot',          disallow: '/' },
      { userAgent: 'BLEXBot',         disallow: '/' },
      { userAgent: 'DataForSeoBot',   disallow: '/' },
      { userAgent: 'Bytespider',      disallow: '/' },
    ],
    sitemap: 'https://discoverfloridaparks.com/sitemap.xml',
  };
}
