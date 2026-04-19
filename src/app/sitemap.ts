import type { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data: parks } = await supabase
    .from('parks')
    .select('slug, updated_at');

  const parkUrls: MetadataRoute.Sitemap = (parks ?? []).map(park => ({
    url: `https://discoverfloridaparks.com/parks/${park.slug}`,
    lastModified: park.updated_at ? new Date(park.updated_at) : new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
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
      url: 'https://discoverfloridaparks.com/map',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    ...parkUrls,
  ];
}
