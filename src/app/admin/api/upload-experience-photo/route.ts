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

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error } = await serviceClient.storage
    .from('experience-photos')
    .upload(fileName, buffer, { upsert: true, contentType: file.type });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data } = serviceClient.storage.from('experience-photos').getPublicUrl(fileName);
  return NextResponse.json({ url: data.publicUrl });
}
