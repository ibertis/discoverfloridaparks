import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import SiteHeader from '../../SiteHeader';
import SiteFooter from '../../SiteFooter';
import FooterLinks from '../../FooterLinks';
import NewsletterForm from '../../NewsletterForm';
import BlogPostRenderer from '@/components/blog/BlogPostRenderer';
import { getPostBySlug, getPublishedSlugs, getRecentPosts } from '@/lib/blog';

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await getPublishedSlugs();
  return slugs.map(slug => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};

  const title = post.seo_title ?? post.title;
  const description = post.seo_description ?? post.excerpt ?? '';
  const ogImage = post.featured_image_url ?? 'https://discoverfloridaparks.com/hero-1.jpg';

  return {
    title,
    description,
    alternates: { canonical: `https://discoverfloridaparks.com/blog/${slug}` },
    openGraph: {
      title,
      description,
      url: `https://discoverfloridaparks.com/blog/${slug}`,
      type: 'article',
      images: [{ url: ogImage, width: 1280, height: 720, alt: title }],
      ...(post.published_at && { publishedTime: post.published_at }),
    },
    twitter: { card: 'summary_large_image', title, description, images: [ogImage] },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const recentPosts = await getRecentPosts(3, slug);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt ?? '',
    ...(post.featured_image_url && { image: post.featured_image_url }),
    ...(post.published_at && { datePublished: post.published_at }),
    ...(post.author && { author: { '@type': 'Person', name: post.author } }),
    publisher: {
      '@type': 'Organization',
      name: 'Discover Florida Parks',
      url: 'https://discoverfloridaparks.com',
    },
  };

  return (
    <div style={{ background: '#fff', color: '#413734', minHeight: '100vh' }}>
      <SiteHeader />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px 80px' }}>

        <Link
          href="/blog"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'Archivo, sans-serif', fontSize: '0.82rem', fontWeight: 700, color: '#a6967c', marginBottom: 32 }}
          className="hover:text-[#ff7044] transition-colors"
        >
          <ArrowLeft size={13} /> Back to Blog
        </Link>

        {((post.categories ?? []).length > 0 || post.published_at || post.author) && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 20px', alignItems: 'center', marginBottom: 20 }}>
            {(post.categories ?? []).map(cat => (
              <Link
                key={cat}
                href={`/blog/category/${cat.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`}
                style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.72rem', fontWeight: 700, color: '#ff7044', textTransform: 'uppercase', letterSpacing: '0.1em', textDecoration: 'none' }}
                className="hover:underline"
              >
                {cat}
              </Link>
            ))}
            {post.published_at && (
              <span style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.78rem', color: '#a6967c' }}>
                {new Date(post.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            )}
            {post.author && (
              <span style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.78rem', color: '#a6967c' }}>
                by {post.author}
              </span>
            )}
          </div>
        )}

        <h1 style={{ fontFamily: 'Shrikhand, cursive', fontWeight: 400, fontSize: 'clamp(2.2rem, 5vw, 3.6rem)', lineHeight: 1, color: '#362f35', margin: '0 0 28px', letterSpacing: '-0.04em' }}>
          {post.title}
        </h1>

        {post.featured_image_url && (
          <div style={{ width: '100%', paddingTop: '52%', borderRadius: 16, overflow: 'hidden', marginBottom: 40, position: 'relative' }}>
            <img
              src={post.featured_image_url}
              alt={post.title}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        )}

        {post.body && <BlogPostRenderer html={post.body} />}

        {/* Newsletter */}
        <div style={{ background: '#f9f7f5', borderRadius: 20, padding: '40px 36px', marginTop: 64, textAlign: 'center' }}>
          <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.74rem', fontWeight: 700, color: '#a6967c', textTransform: 'uppercase', letterSpacing: '0.14em', margin: '0 0 10px' }}>
            Stay in the know
          </p>
          <h2 style={{ fontFamily: 'Shrikhand, cursive', fontWeight: 400, fontSize: '2rem', color: '#362f35', letterSpacing: '-0.04em', lineHeight: 1, margin: '0 0 10px' }}>
            More Florida, please.
          </h2>
          <p style={{ fontFamily: 'Glegoo, serif', fontWeight: 400, fontSize: '0.88rem', color: '#726d6b', lineHeight: 1.6, margin: '0 auto 24px', maxWidth: 360 }}>
            Get new park guides, travel tips, and seasonal picks delivered to your inbox.
          </p>
          <div style={{ maxWidth: 400, margin: '0 auto' }}>
            <NewsletterForm />
          </div>
        </div>

        {/* Keep Exploring */}
        {recentPosts.length > 0 && (
          <div style={{ marginTop: 64 }}>
            <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.8rem', fontWeight: 700, color: '#a6967c', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
              Keep Exploring
            </p>
            <h2 style={{ fontFamily: 'Shrikhand, cursive', fontWeight: 400, fontSize: '2rem', color: '#362f35', letterSpacing: '-0.04em', lineHeight: 1, margin: '0 0 28px' }}>
              More from the blog
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20 }}>
              {recentPosts.map(p => (
                <Link key={p.id} href={`/blog/${p.slug}`} style={{ display: 'block', textDecoration: 'none', border: '1px solid #eeeeee', borderRadius: 12, overflow: 'hidden' }} className="hover:shadow-md transition-shadow">
                  {p.featured_image_url && (
                    <div style={{ width: '100%', paddingTop: '56.25%', position: 'relative', overflow: 'hidden' }}>
                      <img src={p.featured_image_url} alt={p.title} loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}
                  <div style={{ padding: '14px 16px' }}>
                    {p.category && (
                      <span style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.68rem', fontWeight: 700, color: '#ff7044', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 4 }}>
                        {p.category}
                      </span>
                    )}
                    <p style={{ fontFamily: 'Shrikhand, cursive', fontWeight: 400, fontSize: '1.1rem', lineHeight: 1.1, color: '#362f35', margin: 0, letterSpacing: '-0.02em' }}>
                      {p.title}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Disclaimers */}
        <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.72rem', color: '#b8b0a8', lineHeight: 1.6, marginTop: 40, paddingTop: 24, borderTop: '1px solid #eeeeee' }}>
          Discover Florida Parks is an independent guide to Florida&apos;s parks and outdoor attractions. We are not affiliated with the Florida State Parks system, the National Park Service, or any government agency.
        </p>
        <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.72rem', color: '#b8b0a8', lineHeight: 1.6, marginTop: 12 }}>
          Discover Florida Parks is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com.
        </p>

      </article>

      <FooterLinks />
      <SiteFooter />
    </div>
  );
}
