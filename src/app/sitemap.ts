import type { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';
import { getDistinctCategories } from '@/lib/blog';
import { categoryToSlug } from '@/lib/slug';

const BASE = 'https://www.discoverfloridaparks.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ data: parks }, { data: blogPosts }, categories] = await Promise.all([
    supabase.from('parks').select('slug, updated_at'),
    supabase.from('blog_posts').select('slug, updated_at').eq('published', true),
    getDistinctCategories(),
  ]);

  const parkUrls: MetadataRoute.Sitemap = (parks ?? []).map(park => ({
    url: `${BASE}/parks/${park.slug}`,
    lastModified: park.updated_at ? new Date(park.updated_at) : new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  const blogUrls: MetadataRoute.Sitemap = (blogPosts ?? []).map(post => ({
    url: `${BASE}/blog/${post.slug}`,
    lastModified: post.updated_at ? new Date(post.updated_at) : new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const categoryUrls: MetadataRoute.Sitemap = categories.map(cat => ({
    url: `${BASE}/blog/category/${categoryToSlug(cat)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [
    { url: BASE,                   lastModified: new Date(), changeFrequency: 'weekly',  priority: 1   },
    { url: `${BASE}/parks`,        lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE}/blog`,         lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${BASE}/news`,         lastModified: new Date(), changeFrequency: 'hourly',  priority: 0.8 },
    { url: `${BASE}/map`,          lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/conservation`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/preservation`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/our-efforts`,  lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/useful-links`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    ...parkUrls,
    ...blogUrls,
    ...categoryUrls,
  ];
}
