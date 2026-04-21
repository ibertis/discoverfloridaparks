import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import SiteHeader from '../SiteHeader';
import SiteFooter from '../SiteFooter';
import FooterLinks from '../FooterLinks';
import { client as sanityClient } from '@/sanity/lib/client';
import { postsListQuery } from '@/sanity/queries';
import { urlFor } from '@/sanity/imageUrl';

export const metadata: Metadata = {
  title: 'Florida Parks Blog',
  description: 'Stories, guides, and inspiration for exploring Florida\'s best parks, beaches, and outdoor adventures.',
  alternates: { canonical: 'https://discoverfloridaparks.com/blog' },
  openGraph: {
    title: 'Florida Parks Blog',
    description: 'Stories, guides, and inspiration for exploring Florida\'s best parks, beaches, and outdoor adventures.',
    url: 'https://discoverfloridaparks.com/blog',
  },
};

interface Post {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt?: string;
  mainImage?: { asset: { _ref: string }; alt?: string };
  publishedAt?: string;
  categories?: string[];
  author?: string;
}

export default async function BlogPage() {
  const posts: Post[] = await sanityClient.fetch(postsListQuery);

  return (
    <div style={{ background: '#fff', color: '#413734', minHeight: '100vh' }}>
      <SiteHeader />

      {/* Banner */}
      <div style={{ background: '#f9f7f5', borderBottom: '1px solid #eeeeee', padding: '56px 24px' }}>
        <div style={{ maxWidth: 1278, margin: '0 auto' }}>
          <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.85rem', fontWeight: 600, color: '#a6967c', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
            From the Blog
          </p>
          <h1 style={{ fontFamily: 'Shrikhand, cursive', fontWeight: 400, fontSize: 'clamp(2.5rem, 5vw, 4.14rem)', lineHeight: 0.98, color: '#362f35', margin: '0 0 12px', letterSpacing: '-0.04em' }}>
            Florida Park Stories
          </h1>
          <p style={{ fontFamily: 'Glegoo, serif', fontWeight: 700, fontSize: '0.95rem', color: '#726d6b', margin: 0 }}>
            Guides, trip reports, and inspiration for your next adventure
          </p>
        </div>
      </div>

      {/* Posts grid */}
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
              <Link
                key={post._id}
                href={`/blog/${post.slug.current}`}
                style={{ display: 'flex', flexDirection: 'column', background: '#fff', border: '1px solid #eeeeee', borderRadius: 16, overflow: 'hidden', textDecoration: 'none', transition: 'box-shadow 0.2s' }}
                className="hover:shadow-md"
              >
                {post.mainImage?.asset ? (
                  <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', background: '#f9f7f5', flexShrink: 0 }}>
                    <Image
                      src={urlFor(post.mainImage).width(800).height(450).url()}
                      alt={post.mainImage.alt ?? post.title}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
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
                  {post.categories && post.categories.length > 0 && (
                    <span style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.72rem', fontWeight: 700, color: '#ff7044', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
                      {post.categories[0]}
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
                    {post.publishedAt && (
                      <span style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.75rem', color: '#a6967c' }}>
                        {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
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
