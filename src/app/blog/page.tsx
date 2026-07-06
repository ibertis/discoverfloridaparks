import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import SiteHeader from '../SiteHeader';
import SiteFooter from '../SiteFooter';
import FooterLinks from '../FooterLinks';
import { getPublishedPosts } from '@/lib/blog';
import { categoryToSlug } from '@/lib/slug';
import NewsletterSignup from '@/components/NewsletterSignup';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Florida Parks Blog',
  description: 'Stories, guides, and inspiration for exploring Florida\'s best parks, beaches, and outdoor adventures.',
  alternates: { canonical: 'https://www.discoverfloridaparks.com/blog' },
  openGraph: {
    title: 'Florida Parks Blog',
    description: 'Stories, guides, and inspiration for exploring Florida\'s best parks, beaches, and outdoor adventures.',
    url: 'https://www.discoverfloridaparks.com/blog',
    type: 'website',
    images: [{ url: 'https://www.discoverfloridaparks.com/hero-1.jpg', width: 1280, height: 853, alt: 'Florida Parks Blog — Discover Florida Parks' }],
  },
  twitter: { card: 'summary_large_image' },
};

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  return (
    <div style={{ background: '#fff', color: '#413734', minHeight: '100vh' }}>
      <SiteHeader />

      <div style={{ background: '#f9f7f5', borderBottom: '1px solid #eeeeee', padding: '56px 24px' }}>
        <div style={{ maxWidth: 1278, margin: '0 auto' }}>
          <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.85rem', fontWeight: 600, color: '#a6967c', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
            From the Blog
          </p>
          <h1 style={{ fontFamily: 'Shrikhand, cursive', fontWeight: 400, fontSize: 'clamp(2.5rem, 5vw, 4.14rem)', lineHeight: 0.98, color: '#362f35', margin: '0 0 12px', letterSpacing: '-0.04em' }}>
            Florida Park Stories
          </h1>
          <p style={{ fontFamily: 'Glegoo, serif', fontWeight: 700, fontSize: '0.95rem', color: '#726d6b', margin: 0 }}>
            Guides, park reviews, and inspiration for your next adventure
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1278, margin: '0 auto', padding: '56px 24px 80px' }}>
        {posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ fontFamily: 'Shrikhand, cursive', fontWeight: 400, fontSize: '2rem', color: '#362f35', margin: '0 0 12px', letterSpacing: '-0.04em' }}>
              Coming Soon
            </p>
            <p style={{ fontFamily: 'Glegoo, serif', fontWeight: 700, fontSize: '0.9rem', color: '#a6967c', margin: 0 }}>
              Our first posts are on the way.
            </p>
          </div>
        ) : (
          <div className="park-cards-grid">
            {posts.map(post => (
              <div
                key={post.id}
                style={{ display: 'flex', flexDirection: 'column', background: '#fff', border: '1px solid #eeeeee', borderRadius: 16, overflow: 'hidden', transition: 'box-shadow 0.2s' }}
                className="hover:shadow-md"
              >
                <Link href={`/blog/${post.slug}`} style={{ display: 'block', textDecoration: 'none', flexShrink: 0 }}>
                  {post.featured_image_url ? (
                    <div style={{ width: '100%', paddingTop: '56.25%', background: '#f9f7f5', position: 'relative', overflow: 'hidden' }}>
                      <Image
                        src={post.featured_image_url}
                        alt={post.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  ) : (
                    <div style={{ width: '100%', paddingTop: '56.25%', background: '#f9f7f5', position: 'relative' }}>
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontFamily: 'Shrikhand, cursive', fontSize: '2rem', color: '#dfdfdf' }}>DFP</span>
                      </div>
                    </div>
                  )}
                </Link>

                <div style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  {(post.categories ?? [])[0] && (
                    <Link
                      href={`/blog/category/${categoryToSlug(post.categories![0])}`}
                      style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.72rem', fontWeight: 700, color: '#ff7044', textTransform: 'uppercase', letterSpacing: '0.1em', textDecoration: 'none', display: 'block', marginBottom: 8 }}
                      className="hover:underline"
                    >
                      {post.categories![0]}
                    </Link>
                  )}
                  <Link href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
                    <h2 style={{ fontFamily: 'Shrikhand, cursive', fontWeight: 400, fontSize: '1.55rem', lineHeight: 1.05, color: '#362f35', margin: '0 0 10px', letterSpacing: '-0.03em' }}>
                      {post.title}
                    </h2>
                  </Link>
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
                    <Link href={`/blog/${post.slug}`} style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.82rem', fontWeight: 700, color: '#ff7044', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
                      Read more <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Newsletter capture on the blog hub */}
      <div style={{ maxWidth: 1278, margin: '4rem auto 0', padding: '0 24px' }}>
        <NewsletterSignup variant="card" source="blog-index" />
      </div>

      <FooterLinks />
      <SiteFooter />
    </div>
  );
}
