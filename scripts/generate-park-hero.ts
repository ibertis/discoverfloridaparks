/**
 * Generates an AI hero image for a single park using the Magnific API,
 * uploads it to Supabase storage, and sets featured_image_url on the park record.
 *
 * Usage: npx tsx scripts/generate-park-hero.ts <slug> "<prompt>"
 */
import { config } from 'dotenv';
config({ path: '.env.local' });

import { supabaseAdmin } from './lib/supabase-admin';

const MAGNIFIC_API_KEY = process.env.MAGNIFIC_API_KEY!;
const PHOTO_BUCKET = 'park-photos';

async function generateImage(prompt: string): Promise<string> {
  console.log('Generating image via Magnific API…');

  const createRes = await fetch('https://api.magnific.com/v1/ai/mystic', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-magnific-api-key': MAGNIFIC_API_KEY },
    body: JSON.stringify({
      prompt,
      resolution: '2k',
      aspect_ratio: 'widescreen_16_9',
      model: 'realism',
      hdr: 60,
      creative_detailing: 40,
      filter_nsfw: true,
    }),
  });

  if (!createRes.ok) throw new Error(`Magnific create error: ${createRes.status} — ${await createRes.text()}`);

  const { data } = await createRes.json();
  const taskId = data.task_id as string;
  console.log(`  Task ID: ${taskId}`);

  const deadline = Date.now() + 5 * 60 * 1000;
  while (Date.now() < deadline) {
    await new Promise(r => setTimeout(r, 8000));

    const pollRes = await fetch(`https://api.magnific.com/v1/ai/mystic/${taskId}`, {
      headers: { 'x-magnific-api-key': MAGNIFIC_API_KEY },
    });
    const pollData = await pollRes.json();
    const status = pollData.data.status as string;
    console.log(`  Status: ${status}`);

    if (status === 'COMPLETED') {
      const url = pollData.data.generated?.[0] as string | undefined;
      if (!url) throw new Error('No image URL in completed task');
      return url;
    }
    if (status === 'FAILED' || status === 'ERROR') {
      throw new Error(`Generation failed: ${JSON.stringify(pollData)}`);
    }
  }

  throw new Error('Timed out waiting for image generation');
}

async function uploadAndSave(imageUrl: string, slug: string): Promise<string> {
  console.log('Uploading to Supabase storage…');

  const res = await fetch(imageUrl);
  if (!res.ok) throw new Error(`Failed to download generated image: ${res.status}`);

  const buffer = await res.arrayBuffer();
  const fileName = `${slug}-${Date.now()}.jpg`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from(PHOTO_BUCKET)
    .upload(fileName, Buffer.from(buffer), { contentType: 'image/jpeg', upsert: true });

  if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`);

  const { data } = supabaseAdmin.storage.from(PHOTO_BUCKET).getPublicUrl(fileName);
  return data.publicUrl;
}

async function main() {
  const slug = process.argv[2];
  const prompt = process.argv[3];

  if (!slug || !prompt) {
    console.error('Usage: npx tsx scripts/generate-park-hero.ts <slug> "<prompt>"');
    process.exit(1);
  }
  if (!MAGNIFIC_API_KEY) throw new Error('MAGNIFIC_API_KEY not set in .env.local');

  // Confirm park exists
  const { data: park, error: fetchError } = await supabaseAdmin
    .from('parks')
    .select('id, name, featured_image_url')
    .eq('slug', slug)
    .single();

  if (fetchError || !park) throw new Error(`Park not found: ${slug}`);
  console.log(`Park: ${park.name}`);
  if (park.featured_image_url) {
    console.warn('  Note: park already has a featured image — overwriting.');
  }

  const generatedUrl = await generateImage(prompt);
  const publicUrl = await uploadAndSave(generatedUrl, slug);

  const { error: updateError } = await supabaseAdmin
    .from('parks')
    .update({ featured_image_url: publicUrl })
    .eq('slug', slug);

  if (updateError) throw new Error(`DB update failed: ${updateError.message}`);

  console.log(`\n✅ Done — featured_image_url set:`);
  console.log(`   ${publicUrl}`);
}

main().catch(e => { console.error(e); process.exit(1); });
