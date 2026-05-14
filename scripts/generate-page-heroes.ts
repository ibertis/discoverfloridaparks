import { config } from 'dotenv'
config({ path: '.env.local' })

import { createClient } from '@supabase/supabase-js'

const MAGNIFIC_API_KEY = process.env.MAGNIFIC_API_KEY!
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

interface Page {
  label: string
  storagePath: string
  prompt: string
}

const PAGES: Page[] = [
  {
    label: 'Conservation',
    storagePath: 'page-heroes/conservation.jpg',
    prompt: 'Stunning underwater view of a pristine Florida coral reef with vibrant sea fans, brain corals and tropical fish in crystal-clear turquoise water, shafts of sunlight penetrating from the surface above, a sea turtle gracefully swimming through the frame, lush and colorful marine ecosystem teeming with life, professional underwater wide angle photography, photorealistic, 8K',
  },
  {
    label: 'Preservation',
    storagePath: 'page-heroes/preservation.jpg',
    prompt: 'Ancient old-growth bald cypress forest in Florida with massive gnarled trunks and knobby knees rising from still blackwater, long curtains of Spanish moss hanging from every branch, golden afternoon light filtering through the dense canopy creating cathedral-like rays, a great blue heron standing motionless in the foreground, sense of timeless natural heritage and wonder, wide angle landscape photography, photorealistic, 8K',
  },
  {
    label: 'Our Efforts',
    storagePath: 'page-heroes/our-efforts.jpg',
    prompt: 'Aerial view of a pristine Florida river watershed at golden hour with sinuous river bends winding through a vast green wilderness, longleaf pine flatwoods meeting cypress swamps, the last warm light of day illuminating the untouched landscape in amber and gold, a sense of vast natural legacy and stewardship, wide angle aerial landscape photography, no people, photorealistic, 8K',
  },
  {
    label: 'Shop',
    storagePath: 'page-heroes/shop.jpg',
    prompt: 'A kayaker paddling through a lush Florida mangrove tunnel with a warm glow of sunlight filtering through the emerald green canopy, twisted red mangrove roots framing both sides, crystal clear shallow water revealing white sand below, adventurer wearing colorful outdoor gear, vibrant colors, dynamic sense of adventure and discovery in Florida wilderness, professional outdoor photography, wide angle, photorealistic, 8K',
  },
  {
    label: 'Travel Trends',
    storagePath: 'page-heroes/travel-trends.jpg',
    prompt: 'Sweeping high-altitude aerial view of the entire Florida peninsula at blue hour just after sunset, soft twilight sky in deep blue and purple, faint glowing coastlines along both the Gulf of Mexico and the Atlantic, vast dark wilderness interior, moody and atmospheric with a sense of mystery and exploration, minimalist and tonal, almost abstract in its scale, photorealistic aerial photography, 8K',
  },
]

async function generateImage(page: Page): Promise<string> {
  console.log(`\n🎨 Generating: ${page.label}...`)

  const createRes = await fetch('https://api.magnific.com/v1/ai/mystic', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-magnific-api-key': MAGNIFIC_API_KEY,
    },
    body: JSON.stringify({
      prompt: page.prompt,
      resolution: '2k',
      aspect_ratio: 'widescreen_16_9',
      model: 'realism',
      hdr: 60,
      creative_detailing: 40,
      filter_nsfw: true,
    }),
  })

  if (!createRes.ok) {
    const err = await createRes.text()
    throw new Error(`Magnific API error: ${createRes.status} — ${err}`)
  }

  const createData = await createRes.json()
  const taskId = createData.data.task_id
  console.log(`   Task ID: ${taskId}`)

  const startTime = Date.now()
  const MAX_WAIT = 5 * 60 * 1000

  while (Date.now() - startTime < MAX_WAIT) {
    await new Promise(r => setTimeout(r, 8000))

    const pollRes = await fetch(`https://api.magnific.com/v1/ai/mystic/${taskId}`, {
      headers: { 'x-magnific-api-key': MAGNIFIC_API_KEY },
    })

    const pollData = await pollRes.json()
    const status = pollData.data.status
    console.log(`   Status: ${status}`)

    if (status === 'COMPLETED') {
      const imageUrl = pollData.data.generated[0] as string | undefined
      if (!imageUrl) throw new Error('No image URL in completed task')
      console.log(`   ✅ Generated`)
      return imageUrl
    }

    if (status === 'FAILED' || status === 'ERROR') {
      throw new Error(`Generation failed for ${page.label}: ${JSON.stringify(pollData)}`)
    }
  }

  throw new Error(`Timeout waiting for ${page.label}`)
}

async function uploadToSupabase(imageUrl: string, storagePath: string): Promise<void> {
  console.log(`   📤 Uploading to Supabase: ${storagePath}`)

  const imgRes = await fetch(imageUrl)
  if (!imgRes.ok) throw new Error(`Failed to download image: ${imgRes.status}`)

  const arrayBuffer = await imgRes.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const { error } = await supabase.storage
    .from('park-photos')
    .upload(storagePath, buffer, {
      contentType: 'image/jpeg',
      upsert: true,
    })

  if (error) throw new Error(`Supabase upload error: ${error.message}`)
  console.log(`   ✅ Uploaded: park-photos/${storagePath}`)
}

async function main() {
  console.log('🌴 DFP Page Hero Generator')
  console.log(`   Generating ${PAGES.length} images via Magnific API\n`)

  if (!MAGNIFIC_API_KEY) throw new Error('MAGNIFIC_API_KEY not set')
  if (!SUPABASE_URL) throw new Error('NEXT_PUBLIC_SUPABASE_URL not set')
  if (!SUPABASE_SERVICE_KEY) throw new Error('SUPABASE_SERVICE_ROLE_KEY not set')

  const results: { label: string; status: 'ok' | 'error'; error?: string }[] = []

  for (const page of PAGES) {
    try {
      const imageUrl = await generateImage(page)
      await uploadToSupabase(imageUrl, page.storagePath)
      results.push({ label: page.label, status: 'ok' })
    } catch (err) {
      console.error(`   ❌ Failed: ${page.label} — ${err}`)
      results.push({ label: page.label, status: 'error', error: String(err) })
    }
  }

  console.log('\n─────────────────────────────────────────')
  console.log('RESULTS:')
  for (const r of results) {
    console.log(`  ${r.status === 'ok' ? '✅' : '❌'} ${r.label}${r.error ? ` — ${r.error}` : ''}`)
  }

  const passed = results.filter(r => r.status === 'ok').length
  console.log(`\n${passed}/${PAGES.length} images generated and uploaded successfully.`)
}

main().catch(console.error)
