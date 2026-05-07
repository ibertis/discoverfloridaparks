/**
 * One-time migration: Sanity blog posts → Supabase blog_posts
 * Run: npx tsx scripts/migrate-sanity-to-supabase.ts
 */

import { createClient as createSanityClient } from '@sanity/client';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { toHTML } from '@portabletext/to-html';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const sanity = createSanityClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2026-04-21',
  useCdn: false,
  token: process.env.SANITY_API_READ_TOKEN,
});

const supabase = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function sanityImageUrl(ref: string): string {
  // "image-abc123-1920x1280-jpg" → "https://cdn.sanity.io/images/project/dataset/abc123-1920x1280.jpg"
  const cleaned = ref
    .replace(/^image-/, '')
    .replace(/-([a-z]+)$/, '.$1');
  return `https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${cleaned}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function portableTextToHtml(body: any[]): string {
  return toHTML(body, {
    components: {
      types: {
        image: ({ value }: { value: { asset?: { _ref?: string }; alt?: string; caption?: string } }) => {
          if (!value?.asset?._ref) return '';
          const src = sanityImageUrl(value.asset._ref);
          return `<figure><img src="${src}" alt="${value.alt ?? ''}" />${value.caption ? `<figcaption>${value.caption}</figcaption>` : ''}</figure>`;
        },
      },
      marks: {
        link: ({ children, value }: { children: string; value?: { href?: string } }) => {
          const href = value?.href ?? '#';
          const external = href.startsWith('http');
          return `<a href="${href}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${children}</a>`;
        },
      },
    },
  });
}

async function migrate() {
  console.log('Fetching posts from Sanity...');

  const posts = await sanity.fetch(`
    *[_type == "post" && defined(slug.current)] | order(publishedAt desc) {
      title,
      "slug": slug.current,
      excerpt,
      publishedAt,
      "category": categories[0],
      author,
      seo_title,
      seo_description,
      "featuredImageRef": mainImage.asset._ref,
      "featuredImageAlt": mainImage.alt,
      body
    }
  `);

  console.log(`Found ${posts.length} post(s)\n`);

  for (const post of posts) {
    console.log(`Migrating: "${post.title}" (${post.slug})`);

    const body = post.body ? portableTextToHtml(post.body) : null;
    const featured_image_url = post.featuredImageRef
      ? sanityImageUrl(post.featuredImageRef)
      : null;

    const { error } = await supabase.from('blog_posts').upsert(
      {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt ?? null,
        body,
        featured_image_url,
        author: post.author ?? 'Discover Florida Parks',
        categories: post.category ? [post.category] : null,
        seo_title: post.seo_title ?? null,
        seo_description: post.seo_description ?? null,
        published: true,
        published_at: post.publishedAt ?? new Date().toISOString(),
      },
      { onConflict: 'slug' }
    );

    if (error) {
      console.error(`  ✗ Error: ${error.message}`);
    } else {
      console.log(`  ✓ Done`);
    }
  }

  console.log('\nMigration complete.');
}

migrate().catch(console.error);
