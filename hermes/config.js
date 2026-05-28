// config.js — Central configuration for Hermes
// Edit thresholds and settings here without touching core logic

export const config = {
  // URL check settings
  checker: {
    timeoutMs: 10000,
    retries: 2,
    concurrency: 5,
    healthyCodes: [200, 201, 301, 302, 307, 308],
    botProtectedDomains: [
      'floridastateparks.org',
      'reserve.floridastateparks.org',
      'seaworld.com',
      'buschgardens.com',
      'aquatica.com',
      'marionfl.org',
      'miamigov.com',
      'miramarparks.com',
      'booking.com',
      'viator.com',
      // Government sites that block automated requests (confirmed valid for human visitors)
      'fortlauderdale.gov',
      'westonfl.org',
      'plantation.org',
      'sarasotacountyparks.com',
      'sunrisefl.gov',
      'delraybeachfl.gov',   // Atlantic Dunes Park — confirmed valid, blocks bots
      'sibfl.gov',           // Samson Oceanfront Park — confirmed valid, blocks bots
      'coralsprings.gov',    // Sawgrass Trailhead at Atlantic Blvd — confirmed valid, blocks bots
    ],
  },

  // Which fields to pull from Supabase parks table
  fields: {
    camping: 'camping_url',
    website: 'website',
  },

  // Claude API (Haiku) AI analysis
  ai: {
    maxTokens: 800,
    temperature: 0.2,
  },

  // Scheduling (used in launchd plist)
  schedule: {
    intervalHours: 24,
  },

  // Logging
  logs: {
    dir: './logs',
    level: 'info',
  }
}