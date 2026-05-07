import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string | null;
  featured_image_url: string | null;
  author: string;
  category: string | null;
  tags: string[] | null;
  seo_title: string | null;
  seo_description: string | null;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

const LIST_FIELDS = 'id, title, slug, excerpt, featured_image_url, author, category, published_at';

export async function getPublishedPosts(): Promise<BlogPost[]> {
  const { data } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .order('published_at', { ascending: false });
  return (data ?? []) as BlogPost[];
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const { data } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle();
  return data as BlogPost | null;
}

export async function getPostsByCategory(category: string): Promise<BlogPost[]> {
  const { data } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .ilike('category', category)
    .order('published_at', { ascending: false });
  return (data ?? []) as BlogPost[];
}

export async function getRecentPosts(limit = 3, excludeSlug?: string): Promise<BlogPost[]> {
  const { data } = await supabase
    .from('blog_posts')
    .select(LIST_FIELDS)
    .eq('published', true)
    .order('published_at', { ascending: false })
    .limit(limit + (excludeSlug ? 1 : 0));
  const posts = (data ?? []) as BlogPost[];
  return excludeSlug ? posts.filter(p => p.slug !== excludeSlug).slice(0, limit) : posts;
}

export async function getPublishedSlugs(): Promise<string[]> {
  const { data } = await supabase
    .from('blog_posts')
    .select('slug')
    .eq('published', true);
  return (data ?? []).map(p => p.slug as string);
}

export async function getDistinctCategories(): Promise<string[]> {
  const { data } = await supabase
    .from('blog_posts')
    .select('category')
    .eq('published', true)
    .not('category', 'is', null);
  return [...new Set((data ?? []).map(p => p.category).filter(Boolean))] as string[];
}
