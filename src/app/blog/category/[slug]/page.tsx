import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import SiteHeader from '@/app/SiteHeader';
import SiteFooter from '@/app/SiteFooter';
import FooterLinks from '@/app/FooterLinks';
import { getPostsByCategory, getDistinctCategories } from '@/lib/blog';
import { categoryToSlug, slugToCategory } from '@/lib/slug';
import { notFound } from 'next/navigation';

export const revalidate = 60;

export async function generateStaticParams() {
  const categories = await getDistinctCategories();
  return categories.map(cat => ({ slug: categoryToSlug(cat) }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = slugToCategory(slug);
  const description = `Browse all ${category} posts on the Discover Florida Parks blog.`;
  return {
    title: category,
    description,
    alternates: { canonical: `https://discoverfloridaparks.com/blog/category/${slug}` },
    openGraph: {
      title: `${category} | Discover Florida Parks`,
      description,
      url: `https://discoverfloridaparks.com/blog/category/${slug}`,
      type: 'website',
      images: [{ url: 'https://discoverfloridaparks.com/hero-1.jpg', width: 1280, height: 853, alt: `${category} — Discover Florida Parks` }],
    },
    twitter: { card: 'summary_large_image' },
  };
}

export default async function BlogCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = slugToCategory(slug);
  const posts = await getPostsByCategory(category);

  // No posts (or a bogus slug) → return a real 404 instead of a 200 "empty" page,
  // which Google Search Console flags as a Soft 404.
  if (posts.length === 0) notFound();

  const categoryUrl = `https://discoverfloridaparks.com/blog/category/${slug}`;

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://discoverfloridaparks.com' },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://discoverfloridaparks.com/blog' },
      { '@type': 'ListItem', position: 3, name: category, item: categoryUrl },
    ],
  };

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${category} — Florida Parks Blog`,
    description: `Browse all ${category} posts on the Discover Florida Parks blog.`,
    url: categoryUrl,
    isPartOf: { '@type': 'WebSite', url: 'https://discoverfloridaparks.com', name: 'Discover Florida Parks' },
  };

  return (
    <div style={{ background: '#fff', color: '#413734', minHeight: '100vh' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />
      <SiteHeader />

      <div style={{ background: '#f9f7f5', borderBottom: '1px solid #eeeeee', padding: '56px 24px' }}>
        <div style={{ maxWidth: 1278, margin: '0 auto' }}>
          <Link
            href="/blog"
            style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.8rem', fontWeight: 600, color: '#a6967c', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 16 }}
            className="hover:text-[#ff7044] transition-colors"
          >
            ← All Posts
          </Link>
          <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.85rem', fontWeight: 600, color: '#ff7044', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
            Category
          </p>
          <h1 style={{ fontFamily: 'Shrikhand, cursive', fontWeight: 400, fontSize: 'clamp(2.5rem, 5vw, 4.14rem)', lineHeight: 0.98, color: '#362f35', margin: '0 0 12px', letterSpacing: '-0.04em' }}>
            {category}
          </h1>
          <p style={{ fontFamily: 'Glegoo, serif', fontWeight: 700, fontSize: '0.95rem', color: '#726d6b', margin: 0 }}>
            {posts.length === 0 ? 'No posts yet — check back soon.' : `${posts.length} post${posts.length === 1 ? '' : 's'}`}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1278, margin: '0 auto', padding: '56px 24px 80px' }}>
        {posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ fontFamily: 'Shrikhand, cursive', fontWeight: 400, fontSize: '2rem', color: '#362f35', margin: '0 0 12px', letterSpacing: '-0.04em' }}>
              Coming Soon
            </p>
            <p style={{ fontFamily: 'Glegoo, serif', fontWeight: 700, fontSize: '0.9rem', color: '#a6967c', margin: '0 0 32px' }}>
              {`No ${category} posts yet — we're working on it.`}
            </p>
            <Link
              href="/blog"
              style={{ background: '#ff7044', color: '#fff', borderRadius: '2.3em', padding: '14px 32px', fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none' }}
            >
              Browse All Posts
            </Link>
          </div>
        ) : (
          <div className="park-cards-grid">
            {posts.map(post => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                style={{ display: 'flex', flexDirection: 'column', background: '#fff', border: '1px solid #eeeeee', borderRadius: 16, overflow: 'hidden', textDecoration: 'none', transition: 'box-shadow 0.2s' }}
                className="hover:shadow-md"
              >
                {post.featured_image_url ? (
                  <div style={{ width: '100%', paddingTop: '56.25%', background: '#f9f7f5', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
                    <Image
                      src={post.featured_image_url}
                      alt={post.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                ) : (
                  <div style={{ width: '100%', paddingTop: '56.25%', background: '#f9f7f5', flexShrink: 0, position: 'relative' }}>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontFamily: 'Shrikhand, cursive', fontSize: '2rem', color: '#dfdfdf' }}>DFP</span>
                    </div>
                  </div>
                )}
                <div style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  {(post.categories ?? [])[0] && (
                    <span style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.72rem', fontWeight: 700, color: '#ff7044', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
                      {(post.categories ?? [])[0]}
                    </span>
                  )}
                  <h2 style={{ fontFamily: 'Shrikhand, cursive', fontWeight: 400, fontSize: '1.55rem', lineHeight: 1.05, color: '#362f35', margin: '0 0 10px', letterSpacing: '-0.03em' }}>
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p style={{ fontFamily: 'Glegoo, serif', fontWeight: 700, fontSize: '0.82rem', color: '#726d6b', lineHeight: 1.65, margin: '0 0 16px', flex: 1 }}>
                      {post.excerpt}
                    </p>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                    {post.published_at && (
                      <span style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.75rem', color: '#a6967c' }}>
                        {new Date(post.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </span>
                    )}
                    <span style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.82rem', fontWeight: 700, color: '#ff7044', display: 'flex', alignItems: 'center', gap: 4 }}>
                      Read more <ArrowRight size={13} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <FooterLinks />
      <SiteFooter />
    </div>
  );
}
