import BlogPostEditor from '@/components/blog/BlogPostEditor';

export const metadata = { title: 'Edit Post' };

export default async function EditBlogPost({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BlogPostEditor postId={id} />;
}
