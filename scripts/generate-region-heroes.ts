import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const MAGNIFIC_API_KEY = process.env.MAGNIFIC_API_KEY!
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

interface Region {
  slug: string
  label: string
  prompt: string
}

const REGIONS: Region[] = [
  {
    slug: 'central-florida',
    label: 'Central Florida',
    prompt: 'Aerial view of a pristine Florida freshwater lake surrounded by cypress trees draped in Spanish moss, with white sand beaches and crystal-clear springs visible, golden afternoon light, lush subtropical forest, professional landscape photography, wide angle, 8K, photorealistic',
  },
  {
    slug: 'florida-keys',
    label: 'Florida Keys',
    prompt: 'Aerial panorama of the Florida Keys with brilliant turquoise and emerald shallow waters, coral reef visible beneath the surface, white sand sandbars, mangrove islands, a long highway bridge stretching to the horizon, dramatic tropical sky, golden hour light, photorealistic landscape photography, 8K',
  },
  {
    slug: 'florida-panhandle',
    label: 'Florida Panhandle',
    prompt: 'Pristine white sand beach on the Florida Panhandle with emerald green Gulf of Mexico water, sugar-white sand dunes with sea oats, longleaf pine forest in the background, soft golden morning light, no people, wide angle landscape photography, photorealistic, 8K',
  },
  {
    slug: 'north-florida',
    label: 'North Florida',
    prompt: 'Ancient longleaf pine forest in North Florida with a crystal clear blackwater river winding through the trees, Spanish moss hanging from cypress trees, dappled sunlight through the forest canopy, wild azaleas in bloom, peaceful natural landscape, professional photography, photorealistic, 8K',
  },
  {
    slug: 'northeast-florida',
    label: 'Northeast Florida',
    prompt: 'Wild undeveloped Atlantic coast beach in Northeast Florida with sea turtles nesting on white sand, salt marsh estuary in the background with herons and egrets, ancient live oak forest, dramatic sunrise sky over the Atlantic Ocean, photorealistic landscape photography, 8K',
  },
  {
    slug: 'south-florida',
    label: 'South Florida',
    prompt: 'Vast Everglades sawgrass prairie stretching to the horizon under a dramatic sunset sky with pink and orange clouds, a great blue heron standing in shallow water in the foreground, roseate spoonbills in flight, subtropical wilderness, professional landscape photography, photorealistic, 8K',
  },
  {
    slug: 'southeast-florida',
    label: 'Southeast Florida',
    prompt: 'Tropical beach in Southeast Florida with clear blue Atlantic water, vibrant coral reef visible just offshore, palm trees lining the white sand beach, colorful tropical fish visible in the shallows, dramatic blue sky with puffy cumulus clouds, photorealistic landscape photography, 8K',
  },
  {
    slug: 'southwest-florida',
    label: 'Southwest Florida',
    prompt: 'Dramatic Gulf of Mexico sunset from Southwest Florida with a mangrove tunnel of red mangroves in the foreground, dolphins visible in the golden water, a roseate spoonbill perched in the mangroves, brilliant orange and pink sky reflected in calm water, photorealistic, 8K',
  },
  {
    slug: 'tampa-bay-west-coast',
    label: 'Tampa Bay & West Coast',
    prompt: 'Stunning Gulf Coast sunset from Tampa Bay area with a wide sandy beach, pelicans gliding over calm shallow water, seagrass visible in the clear shallows, distant silhouette of a city skyline, sky filled with warm orange and purple tones, photorealistic landscape photography, 8K',
  },
]

async function generateImage(region: Region): Promise<string> {
  console.log(`\n🎨 Generating: ${region.label}...`)

  const createRes = await fetch('https://api.magnific.com/v1/ai/mystic', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-magnific-api-key': MAGNIFIC_API_KEY,
    },
    body: JSON.stringify({
      prompt: region.prompt,
      resolution: '2k',
      aspect_ratio: 'landscape_16_9',
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
      const imageUrl = pollData.data.generated[0]?.url
      if (!imageUrl) throw new Error('No image URL in completed task')
      console.log(`   ✅ Generated: ${imageUrl.substring(0, 60)}...`)
      return imageUrl
    }

    if (status === 'FAILED' || status === 'ERROR') {
      throw new Error(`Generation failed for ${region.label}: ${JSON.stringify(pollData)}`)
    }
  }

  throw new Error(`Timeout waiting for ${region.label} after 5 minutes`)
}

async function uploadToSupabase(imageUrl: string, slug: string): Promise<void> {
  console.log(`   📤 Uploading to Supabase...`)

  const imgRes = await fetch(imageUrl)
  if (!imgRes.ok) throw new Error(`Failed to download image: ${imgRes.status}`)

  const arrayBuffer = await imgRes.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const path = `region-photos/${slug}.jpg`

  const { error } = await supabase.storage
    .from('park-photos')
    .upload(path, buffer, {
      contentType: 'image/jpeg',
      upsert: true,
    })

  if (error) throw new Error(`Supabase upload error: ${error.message}`)
  console.log(`   ✅ Uploaded: park-photos/${path}`)
}

async function main() {
  console.log('🌴 DFP Regional Hero Image Generator')
  console.log(`   Generating ${REGIONS.length} images via Magnific API\n`)

  if (!MAGNIFIC_API_KEY) throw new Error('MAGNIFIC_API_KEY not set in .env.local')
  if (!SUPABASE_URL) throw new Error('NEXT_PUBLIC_SUPABASE_URL not set')
  if (!SUPABASE_SERVICE_KEY) throw new Error('SUPABASE_SERVICE_ROLE_KEY not set')

  const results: { slug: string; status: 'ok' | 'error'; error?: string }[] = []

  for (const region of REGIONS) {
    try {
      const imageUrl = await generateImage(region)
      await uploadToSupabase(imageUrl, region.slug)
      results.push({ slug: region.slug, status: 'ok' })
    } catch (err) {
      console.error(`   ❌ Failed: ${region.label} — ${err}`)
      results.push({ slug: region.slug, status: 'error', error: String(err) })
    }
  }

  console.log('\n─────────────────────────────────────────')
  console.log('RESULTS:')
  for (const r of results) {
    console.log(`  ${r.status === 'ok' ? '✅' : '❌'} ${r.slug}${r.error ? ` — ${r.error}` : ''}`)
  }

  const passed = results.filter(r => r.status === 'ok').length
  console.log(`\n${passed}/${REGIONS.length} images generated and uploaded successfully.`)

  if (passed === REGIONS.length) {
    console.log('\n🎉 All 9 regional hero images are live in Supabase Storage.')
    console.log('   Path: park-photos/region-photos/[slug].jpg')
    console.log('   The hub pages will pick them up automatically on next build/revalidation.')
  }
}

main().catch(console.error)
