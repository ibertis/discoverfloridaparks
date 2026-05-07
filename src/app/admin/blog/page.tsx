import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getAdminUser, getUserRole, createSupabaseServerClient } from '@/lib/supabase-server';

export const metadata = { title: 'Blog' };

export default async function AdminBlogPage() {
  const user = await getAdminUser();
  const role = getUserRole(user);
  if (!user || (role !== 'admin' && role !== 'editor')) redirect('/admin/login');

  const supabase = await createSupabaseServerClient();
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('id, title, slug, published, published_at, categories, created_at')
    .order('created_at', { ascending: false });

  return (
    <div style={{ padding: '32px 40px', maxWidth: 960 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'Shrikhand, cursive', fontWeight: 400, fontSize: '2.4rem', color: '#362f35', letterSpacing: '-0.04em', margin: 0 }}>
          Blog Posts
        </h1>
        <Link
          href="/admin/blog/new"
          style={{ background: '#ff7044', color: '#fff', borderRadius: '2.3em', padding: '12px 28px', fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none' }}
        >
          + New Post
        </Link>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e8e4e0', borderRadius: 16, overflow: 'hidden' }}>
        {(posts ?? []).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 20px', fontFamily: 'Archivo, sans-serif' }}>
            <p style={{ color: '#a6967c', marginBottom: 16 }}>No posts yet.</p>
            <Link href="/admin/blog/new" style={{ color: '#ff7044', fontWeight: 700 }}>
              Create your first post
            </Link>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Archivo, sans-serif', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #eeeeee', background: '#f9f7f5' }}>
                <th style={{ textAlign: 'left', padding: '12px 20px', color: '#726d6b', fontWeight: 600 }}>Title</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', color: '#726d6b', fontWeight: 600 }}>Status</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', color: '#726d6b', fontWeight: 600 }}>Category</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', color: '#726d6b', fontWeight: 600 }}>Date</th>
                <th style={{ padding: '12px 16px' }}></th>
              </tr>
            </thead>
            <tbody>
              {(posts ?? []).map(post => (
                <tr key={post.id} style={{ borderBottom: '1px solid #f3f0ee' }}>
                  <td style={{ padding: '14px 20px' }}>
                    <Link
                      href={`/admin/blog/${post.id}`}
                      style={{ color: '#413734', fontWeight: 600, textDecoration: 'none' }}
                      className="hover:text-[#ff7044] transition-colors"
                    >
                      {post.title}
                    </Link>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      display: 'inline-block', padding: '3px 10px', borderRadius: '2.3em',
                      fontSize: '0.72rem', fontWeight: 700,
                      background: post.published ? '#e8f5e9' : '#f5f5f5',
                      color: post.published ? '#2e7d32' : '#726d6b',
                    }}>
                      {post.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', color: '#726d6b' }}>{(post.categories as string[] | null)?.join(', ') || '—'}</td>
                  <td style={{ padding: '14px 16px', color: '#a6967c', whiteSpace: 'nowrap' }}>
                    {post.published_at
                      ? new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      : 'Draft'}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <Link
                      href={`/admin/blog/${post.id}`}
                      style={{ color: '#ff7044', fontWeight: 700, fontSize: '0.82rem', textDecoration: 'none' }}
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
