import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { notFound } from 'next/navigation';
import SiteHeader from '@/app/SiteHeader';
import SiteFooter from '@/app/SiteFooter';
import FooterLinks from '@/app/FooterLinks';
import { client as sanityClient } from '@/sanity/lib/client';
import { postsByCategoryQuery, allCategoriesQuery } from '@/sanity/queries';
import { urlFor } from '@/sanity/imageUrl';

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

function slugToCategory(slug: string): string {
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export async function generateStaticParams() {
  const categories: string[] = await sanityClient.fetch(allCategoriesQuery);
  return categories.map(cat => ({
    slug: cat.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = slugToCategory(slug);
  return {
    title: `${category} | Florida Parks Blog`,
    description: `Browse all ${category} posts on the Discover Florida Parks blog.`,
  };
}

export default async function BlogCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = slugToCategory(slug);
  const posts: Post[] = await sanityClient.fetch(postsByCategoryQuery, { category });

  if (posts === null) notFound();

  return (
    <div style={{ background: '#fff', color: '#413734', minHeight: '100vh' }}>
      <SiteHeader />

      {/* Banner */}
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

      {/* Posts grid */}
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
