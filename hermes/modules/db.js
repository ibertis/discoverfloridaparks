// modules/db.js — Fetch park URLs from Supabase
import { createClient } from '@supabase/supabase-js'
import { config } from '../config.js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

/**
 * Fetch all parks with camping_url or website populated.
 * Returns a flat list of { parkName, slug, url, type } objects.
 */
export async function fetchParkURLs() {
  const { data, error } = await supabase
    .from('parks')
    .select('name, slug, camping_url, website')
    .or('camping_url.not.is.null,website.not.is.null')
    .order('name')

  if (error) {
    throw new Error(`Supabase fetch failed: ${error.message}`)
  }

  const urls = []

  for (const park of data) {
    if (park.website) {
      urls.push({
        parkName: park.name,
        slug: park.slug,
        url: park.website,
        type: 'official_website',
      })
    }
    if (park.camping_url) {
      urls.push({
        parkName: park.name,
        slug: park.slug,
        url: park.camping_url,
        type: 'camping_url',
      })
    }
  }

  return urls
}
