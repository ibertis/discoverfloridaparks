'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const TipTapEditor = dynamic(() => import('./TipTapEditor'), { ssr: false });

const CATEGORIES = [
  'Park Guides', 'Gear & Packing', 'Family Travel',
  'Conservation', 'Wildlife', 'Florida Travel', 'News & Updates',
];

function generateSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-').trim();
}

interface FormState {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  featured_image_url: string;
  author: string;
  category: string;
  tags: string;
  seo_title: string;
  seo_description: string;
  published: boolean;
  published_at: string | null;
}

const DEFAULTS: FormState = {
  id: '', title: '', slug: '', excerpt: '', body: '',
  featured_image_url: '', author: 'Discover Florida Parks',
  category: '', tags: '', seo_title: '', seo_description: '',
  published: false, published_at: null,
};

const inputStyle: React.CSSProperties = {
  width: '100%', border: '1px solid #e8e4e0', borderRadius: 8,
  padding: '8px 12px', fontFamily: 'Archivo, sans-serif',
  fontSize: '0.82rem', color: '#413734', background: '#fafaf9',
  outline: 'none', boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontFamily: 'Archivo, sans-serif',
  fontSize: '0.72rem', fontWeight: 700, color: '#726d6b',
  textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6,
};

function SidebarCard({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e8e4e0', borderRadius: 12, padding: '14px 18px' }}>
      {children}
    </div>
  );
}

export default function BlogPostEditor({ postId }: { postId?: string }) {
  const router = useRouter();
  const supabase = useRef(
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  ).current;

  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [postLoaded, setPostLoaded] = useState(!postId);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState('');
  const [seoOpen, setSeoOpen] = useState(false);
  const slugEdited = useRef(!!postId);
  const formRef = useRef(form);
  const currentPostId = useRef(postId);
  formRef.current = form;

  useEffect(() => {
    if (!postId) return;
    supabase
      .from('blog_posts')
      .select('*')
      .eq('id', postId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setForm({
            id: data.id ?? '',
            title: data.title ?? '',
            slug: data.slug ?? '',
            excerpt: data.excerpt ?? '',
            body: data.body ?? '',
            featured_image_url: data.featured_image_url ?? '',
            author: data.author ?? 'Discover Florida Parks',
            category: data.category ?? '',
            tags: (data.tags ?? []).join(', '),
            seo_title: data.seo_title ?? '',
            seo_description: data.seo_description ?? '',
            published: data.published ?? false,
            published_at: data.published_at ?? null,
          });
          currentPostId.current = data.id;
        }
        setPostLoaded(true);
      });
  }, [postId, supabase]);

  const performSave = useCallback(async (publish?: boolean): Promise<string | null> => {
    const f = formRef.current;
    if (!f.title.trim()) return null;

    setSaving(true);
    setError('');

    const willPublish = publish !== undefined ? publish : f.published;
    const payload = {
      title: f.title.trim(),
      slug: f.slug || generateSlug(f.title),
      excerpt: f.excerpt || null,
      body: f.body || null,
      featured_image_url: f.featured_image_url || null,
      author: f.author || 'Discover Florida Parks',
      category: f.category || null,
      tags: f.tags ? f.tags.split(',').map(t => t.trim()).filter(Boolean) : null,
      seo_title: f.seo_title || null,
      seo_description: f.seo_description || null,
      published: willPublish,
      published_at: (willPublish && !f.published_at) ? new Date().toISOString() : (f.published_at || null),
    };

    try {
      const id = currentPostId.current ?? f.id;
      if (id) {
        const { error: err } = await supabase.from('blog_posts').update(payload).eq('id', id);
        if (err) throw err;
        setLastSaved(new Date());
        if (publish !== undefined) {
          setForm(prev => ({ ...prev, published: payload.published, published_at: payload.published_at }));
        }
        return id;
      } else {
        const { data, error: err } = await supabase
          .from('blog_posts')
          .insert(payload)
          .select('id')
          .single();
        if (err) throw err;
        currentPostId.current = data.id;
        setForm(prev => ({ ...prev, id: data.id }));
        setLastSaved(new Date());
        if (publish !== undefined) {
          setForm(prev => ({ ...prev, published: payload.published, published_at: payload.published_at }));
        }
        router.replace(`/admin/blog/${data.id}`);
        return data.id;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
      return null;
    } finally {
      setSaving(false);
    }
  }, [supabase, router]);

  // Auto-save every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      if (formRef.current.title) performSave();
    }, 30000);
    return () => clearInterval(interval);
  }, [performSave]);

  function handleTitleChange(title: string) {
    setForm(f => ({
      ...f,
      title,
      ...(!slugEdited.current ? { slug: generateSlug(title) } : {}),
    }));
  }

  async function handleDelete() {
    const id = currentPostId.current ?? form.id;
    if (!id) return;
    if (!window.confirm(`Delete "${form.title}"? This cannot be undone.`)) return;
    await supabase.from('blog_posts').delete().eq('id', id);
    router.push('/admin/blog');
  }

  if (!postLoaded) {
    return (
      <div style={{ padding: '60px 40px', fontFamily: 'Archivo, sans-serif', color: '#a6967c' }}>
        Loading...
      </div>
    );
  }

  const isPublished = form.published;
  const currentSlug = form.slug;

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1200 }}>

      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, gap: 16 }}>
        <Link href="/admin/blog" style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.82rem', color: '#a6967c', textDecoration: 'none' }}
          className="hover:text-[#ff7044] transition-colors">
          ← All Posts
        </Link>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          {lastSaved && (
            <span style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.75rem', color: '#a6967c' }}>
              Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          {error && (
            <span style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.75rem', color: '#e85a2e' }}>{error}</span>
          )}
          {isPublished && currentSlug && (
            <a
              href={`/blog/${currentSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.78rem', color: '#a6967c', textDecoration: 'none' }}
              className="hover:text-[#ff7044] transition-colors"
            >
              View Live ↗
            </a>
          )}
          <button
            type="button"
            onClick={() => performSave(false)}
            disabled={saving}
            style={{ background: '#f0ede9', color: '#413734', border: 'none', borderRadius: '2.3em', padding: '10px 22px', fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: '0.85rem', cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.6 : 1 }}
          >
            {saving ? 'Saving…' : 'Save Draft'}
          </button>
          <button
            type="button"
            onClick={() => performSave(true)}
            disabled={saving}
            style={{ background: '#ff7044', color: '#fff', border: 'none', borderRadius: '2.3em', padding: '10px 22px', fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: '0.85rem', cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.6 : 1 }}
          >
            {isPublished ? 'Update' : 'Publish'}
          </button>
        </div>
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 296px', gap: 32, alignItems: 'start' }}>

        {/* Main column */}
        <div>
          <input
            value={form.title}
            onChange={e => handleTitleChange(e.target.value)}
            placeholder="Post title"
            style={{
              width: '100%', border: 'none', outline: 'none',
              fontFamily: 'Shrikhand, cursive', fontWeight: 400,
              fontSize: '2.4rem', color: '#362f35', letterSpacing: '-0.04em',
              background: 'transparent', marginBottom: 12, boxSizing: 'border-box',
              lineHeight: 1.1,
            }}
          />
          <div style={{ background: '#fff', border: '1px solid #e8e4e0', borderRadius: 12, overflow: 'hidden', minHeight: 500 }}>
            <TipTapEditor
              key={form.id || 'new'}
              content={form.body}
              onChange={body => setForm(f => ({ ...f, body }))}
              placeholder="Start writing…"
            />
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Status */}
          <SidebarCard>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={labelStyle}>Status</span>
              <span style={{
                fontFamily: 'Archivo, sans-serif', fontSize: '0.75rem', fontWeight: 700,
                padding: '3px 10px', borderRadius: '2.3em',
                background: isPublished ? '#e8f5e9' : '#f5f5f5',
                color: isPublished ? '#2e7d32' : '#726d6b',
              }}>
                {isPublished ? 'Published' : 'Draft'}
              </span>
            </div>
            {form.published_at && (
              <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.73rem', color: '#a6967c', margin: '8px 0 0' }}>
                {new Date(form.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            )}
          </SidebarCard>

          {/* Slug */}
          <SidebarCard>
            <label style={labelStyle}>Slug</label>
            <input
              value={form.slug}
              onChange={e => { setForm(f => ({ ...f, slug: e.target.value })); slugEdited.current = true; }}
              style={inputStyle}
              placeholder="post-url-slug"
            />
          </SidebarCard>

          {/* Category */}
          <SidebarCard>
            <label style={labelStyle}>Category</label>
            <input
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              style={inputStyle}
              placeholder="Select or type…"
              list="blog-categories"
            />
            <datalist id="blog-categories">
              {CATEGORIES.map(c => <option key={c} value={c} />)}
            </datalist>
          </SidebarCard>

          {/* Excerpt */}
          <SidebarCard>
            <label style={labelStyle}>Excerpt</label>
            <textarea
              value={form.excerpt}
              onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
              placeholder="Short description for the blog listing…"
            />
          </SidebarCard>

          {/* Tags */}
          <SidebarCard>
            <label style={labelStyle}>Tags <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: '#a6967c' }}>(comma-separated)</span></label>
            <input
              value={form.tags}
              onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
              style={inputStyle}
              placeholder="hiking, wildlife, family"
            />
          </SidebarCard>

          {/* Featured Image */}
          <SidebarCard>
            <label style={labelStyle}>Featured Image URL</label>
            <input
              value={form.featured_image_url}
              onChange={e => setForm(f => ({ ...f, featured_image_url: e.target.value }))}
              style={inputStyle}
              placeholder="https://…"
            />
            {form.featured_image_url && (
              <img
                src={form.featured_image_url}
                alt=""
                style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', borderRadius: 8, marginTop: 10 }}
              />
            )}
          </SidebarCard>

          {/* SEO */}
          <div style={{ background: '#fff', border: '1px solid #e8e4e0', borderRadius: 12, overflow: 'hidden' }}>
            <button
              type="button"
              onClick={() => setSeoOpen(o => !o)}
              style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Archivo, sans-serif', fontSize: '0.72rem', fontWeight: 700, color: '#726d6b', textTransform: 'uppercase', letterSpacing: '0.08em' }}
            >
              SEO <span style={{ fontSize: '0.65rem' }}>{seoOpen ? '▲' : '▼'}</span>
            </button>
            {seoOpen && (
              <div style={{ padding: '0 18px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={labelStyle}>
                    SEO Title{' '}
                    <span style={{ color: form.seo_title.length > 55 ? '#e85a2e' : '#a6967c', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
                      {form.seo_title.length}/60
                    </span>
                  </label>
                  <input value={form.seo_title} onChange={e => setForm(f => ({ ...f, seo_title: e.target.value }))} maxLength={60} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>
                    SEO Description{' '}
                    <span style={{ color: form.seo_description.length > 150 ? '#e85a2e' : '#a6967c', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
                      {form.seo_description.length}/160
                    </span>
                  </label>
                  <textarea value={form.seo_description} onChange={e => setForm(f => ({ ...f, seo_description: e.target.value }))} rows={3} maxLength={160} style={{ ...inputStyle, resize: 'vertical' }} />
                </div>
              </div>
            )}
          </div>

          {/* Danger zone */}
          {(currentPostId.current || form.id) && (
            <div style={{ paddingTop: 4 }}>
              <button
                type="button"
                onClick={handleDelete}
                style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.75rem', color: '#c47a6e', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
              >
                Delete this post
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
