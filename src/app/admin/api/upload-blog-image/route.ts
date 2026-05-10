import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAdminUser } from '@/lib/supabase-server';

const VALID_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(req: NextRequest) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const serviceClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const formData = await req.formData();
  const file = formData.get('file') as File | null;

  if (!file) return NextResponse.json({ error: 'Missing file' }, { status: 400 });

  if (!VALID_MIME_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Invalid file type. Only JPEG, PNG, WebP, GIF, and AVIF are allowed.' }, { status: 400 });
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'File too large. Maximum size is 10 MB.' }, { status: 413 });
  }

  const ext = file.name.split('.').pop() ?? 'jpg';
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error } = await serviceClient.storage
    .from('blog-images')
    .upload(fileName, buffer, { upsert: false, contentType: file.type });

  if (error) { console.error('upload-blog-image:', error.message); return NextResponse.json({ error: 'Upload failed.' }, { status: 500 }); }

  const { data } = serviceClient.storage.from('blog-images').getPublicUrl(fileName);
  return NextResponse.json({ url: data.publicUrl });
}

export async function DELETE(req: NextRequest) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { url } = await req.json() as { url?: string };
  if (!url) return NextResponse.json({ error: 'Missing url' }, { status: 400 });

  // Extract filename from public URL: .../blog-images/FILENAME.ext
  const marker = '/blog-images/';
  const idx = url.indexOf(marker);
  if (idx === -1) return NextResponse.json({ error: 'Not a blog-images URL' }, { status: 400 });

  // Strip query string and guard against path traversal
  const fileName = url.slice(idx + marker.length).split('?')[0];
  if (!fileName || fileName.includes('..') || fileName.includes('/')) {
    return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
  }

  const serviceClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await serviceClient.storage.from('blog-images').remove([fileName]);
  if (error) { console.error('upload-blog-image:', error.message); return NextResponse.json({ error: 'Upload failed.' }, { status: 500 }); }

  return NextResponse.json({ ok: true });
}
