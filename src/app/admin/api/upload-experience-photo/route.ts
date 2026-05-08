import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAdminUser } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
  const user = await getAdminUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const serviceClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const fileName = formData.get('fileName') as string | null;

  if (!file || !fileName) {
    return NextResponse.json({ error: 'Missing file or fileName' }, { status: 400 });
  }

  const VALID_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
  if (!VALID_MIME_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Invalid file type. Only JPEG, PNG, WebP, GIF, and AVIF are allowed.' }, { status: 400 });
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large. Maximum size is 10 MB.' }, { status: 413 });
  }

  // Strip path components and sanitize to safe characters only
  const safeName = fileName
    .replace(/^.*[/\\]/, '')
    .replace(/\.{2,}/g, '.')
    .replace(/[^a-zA-Z0-9._-]/g, '-');
  if (!safeName || safeName.length < 3) {
    return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error } = await serviceClient.storage
    .from('experience-photos')
    .upload(safeName, buffer, { upsert: true, contentType: file.type });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data } = serviceClient.storage.from('experience-photos').getPublicUrl(safeName);
  return NextResponse.json({ url: data.publicUrl });
}
