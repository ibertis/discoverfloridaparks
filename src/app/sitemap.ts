import type { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';
import { sanityClient } from '@/sanity/client';
import { postSlugsQuery } from '@/sanity/queries';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ data: parks }, blogSlugs] = await Promise.all([
    supabase.from('parks').select('slug, updated_at'),
    sanityClient.fetch(postSlugsQuery).catch(() => [] as { slug: string }[]),
  ]);

  const parkUrls: MetadataRoute.Sitemap = (parks ?? []).map(park => ({
    url: `https://discoverfloridaparks.com/parks/${park.slug}`,
    lastModified: park.updated_at ? new Date(park.updated_at) : new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  const blogUrls: MetadataRoute.Sitemap = (blogSlugs as { slug: string }[]).map(p => ({
    url: `https://discoverfloridaparks.com/blog/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [
    {
      url: 'https://discoverfloridaparks.com',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: 'https://discoverfloridaparks.com/parks',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: 'https://discoverfloridaparks.com/blog',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: 'https://discoverfloridaparks.com/map',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    ...parkUrls,
    ...blogUrls,
  ];
}
