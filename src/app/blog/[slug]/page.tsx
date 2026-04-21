import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PortableText } from '@portabletext/react';
import type { PortableTextComponents } from '@portabletext/react';
import { ArrowLeft } from 'lucide-react';
import SiteHeader from '../../SiteHeader';
import SiteFooter from '../../SiteFooter';
import FooterLinks from '../../FooterLinks';
import { sanityClient } from '@/sanity/client';
import { postBySlugQuery, postSlugsQuery } from '@/sanity/queries';
import { urlFor } from '@/sanity/imageUrl';

interface Post {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt?: string;
  mainImage?: { asset: { _ref: string }; alt?: string };
  body?: unknown[];
  publishedAt?: string;
  categories?: string[];
  author?: string;
  seoTitle?: string;
  seoDescription?: string;
}

export async function generateStaticParams() {
  const slugs: { slug: string }[] = await sanityClient.fetch(postSlugsQuery);
  return slugs.map(s => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post: Post | null = await sanityClient.fetch(postBySlugQuery, { slug });
  if (!post) return {};

  const title = post.seoTitle ?? post.title;
  const description = post.seoDescription ?? post.excerpt ?? '';
  const ogImage = post.mainImage?.asset
    ? urlFor(post.mainImage).width(1280).height(720).url()
    : 'https://discoverfloridaparks.com/hero-1.jpg';

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
      ...(post.publishedAt && { publishedTime: post.publishedAt }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

const portableTextComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p style={{ fontFamily: 'Glegoo, serif', fontWeight: 700, fontSize: '1rem', color: '#726d6b', lineHeight: 1.75, margin: '0 0 1.4em' }}>{children}</p>
    ),
    h2: ({ children }) => (
      <h2 style={{ fontFamily: 'Shrikhand, cursive', fontWeight: 400, fontSize: '2.4rem', lineHeight: 1, color: '#362f35', margin: '1.6em 0 0.5em', letterSpacing: '-0.04em' }}>{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 style={{ fontFamily: 'Shrikhand, cursive', fontWeight: 400, fontSize: '1.8rem', lineHeight: 1.05, color: '#362f35', margin: '1.4em 0 0.4em', letterSpacing: '-0.03em' }}>{children}</h3>
    ),
    h4: ({ children }) => (
      <h4 style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: '1.05rem', color: '#413734', margin: '1.2em 0 0.3em' }}>{children}</h4>
    ),
    blockquote: ({ children }) => (
      <blockquote style={{ borderLeft: '4px solid #ff7044', paddingLeft: 20, margin: '1.6em 0', fontFamily: 'Glegoo, serif', fontWeight: 700, fontSize: '1rem', color: '#a6967c', fontStyle: 'italic', lineHeight: 1.7 }}>{children}</blockquote>
    ),
  },
  marks: {
    strong: ({ children }) => <strong style={{ fontWeight: 700, color: '#413734' }}>{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
    link: ({ value, children }) => (
      <a href={value?.href} style={{ color: '#ff7044', textDecoration: 'underline', textDecorationColor: 'rgba(255,112,68,0.3)', textUnderlineOffset: 3 }} target={value?.href?.startsWith('http') ? '_blank' : undefined} rel={value?.href?.startsWith('http') ? 'noopener noreferrer' : undefined}>
        {children}
      </a>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul style={{ fontFamily: 'Glegoo, serif', fontWeight: 700, fontSize: '1rem', color: '#726d6b', lineHeight: 1.75, margin: '0 0 1.4em', paddingLeft: 24 }}>{children}</ul>
    ),
    number: ({ children }) => (
      <ol style={{ fontFamily: 'Glegoo, serif', fontWeight: 700, fontSize: '1rem', color: '#726d6b', lineHeight: 1.75, margin: '0 0 1.4em', paddingLeft: 24 }}>{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li style={{ marginBottom: '0.4em' }}>{children}</li>,
    number: ({ children }) => <li style={{ marginBottom: '0.4em' }}>{children}</li>,
  },
  types: {
    image: ({ value }) => {
      if (!value?.asset) return null;
      return (
        <figure style={{ margin: '2em 0' }}>
          <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', borderRadius: 12, overflow: 'hidden' }}>
            <Image
              src={urlFor(value).width(1200).height(675).url()}
              alt={value.alt ?? ''}
              fill
              style={{ objectFit: 'cover' }}
              sizes="(max-width: 800px) 100vw, 800px"
            />
          </div>
          {value.caption && (
            <figcaption style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.78rem', color: '#a6967c', textAlign: 'center', marginTop: 10 }}>
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },
  },
};

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post: Post | null = await sanityClient.fetch(postBySlugQuery, { slug });
  if (!post) notFound();

  const ogImage = post.mainImage?.asset
    ? urlFor(post.mainImage).width(1280).height(720).url()
    : null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt ?? '',
    ...(ogImage && { image: ogImage }),
    ...(post.publishedAt && { datePublished: post.publishedAt }),
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

        {/* Back link */}
        <Link
          href="/blog"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'Archivo, sans-serif', fontSize: '0.82rem', fontWeight: 700, color: '#a6967c', marginBottom: 32 }}
          className="hover:text-[#ff7044] transition-colors"
        >
          <ArrowLeft size={13} /> Back to Blog
        </Link>

        {/* Meta */}
        {(post.categories?.length || post.publishedAt || post.author) && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 20px', alignItems: 'center', marginBottom: 20 }}>
            {post.categories?.map(cat => (
              <span key={cat} style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.72rem', fontWeight: 700, color: '#ff7044', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {cat}
              </span>
            ))}
            {post.publishedAt && (
              <span style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.78rem', color: '#a6967c' }}>
                {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            )}
            {post.author && (
              <span style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.78rem', color: '#a6967c' }}>
                by {post.author}
              </span>
            )}
          </div>
        )}

        {/* Title */}
        <h1 style={{ fontFamily: 'Shrikhand, cursive', fontWeight: 400, fontSize: 'clamp(2.2rem, 5vw, 3.6rem)', lineHeight: 1, color: '#362f35', margin: '0 0 28px', letterSpacing: '-0.04em' }}>
          {post.title}
        </h1>

        {/* Hero image */}
        {post.mainImage?.asset && (
          <div style={{ position: 'relative', width: '100%', paddingTop: '52%', borderRadius: 16, overflow: 'hidden', marginBottom: 40 }}>
            <Image
              src={urlFor(post.mainImage).width(1600).height(832).url()}
              alt={post.mainImage.alt ?? post.title}
              fill
              priority
              style={{ objectFit: 'cover' }}
              sizes="(max-width: 800px) 100vw, 800px"
            />
          </div>
        )}

        {/* Body */}
        {post.body && (
          <div>
            <PortableText value={post.body as Parameters<typeof PortableText>[0]['value']} components={portableTextComponents} />
          </div>
        )}

      </article>

      <FooterLinks />
      <SiteFooter />
    </div>
  );
}
