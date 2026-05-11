#!/usr/bin/env node
// Usage: node scripts/revalidate-parks.js slug-1 slug-2 slug-3
// Requires REVALIDATE_SECRET env var (or pass via .env.local).
// Defaults to http://localhost:3000 — set NEXT_PUBLIC_SITE_URL for production.

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });

const slugs = process.argv.slice(2);

if (slugs.length === 0) {
  console.error('Usage: node scripts/revalidate-parks.js <slug-1> [slug-2] ...');
  process.exit(1);
}

const secret = process.env.REVALIDATE_SECRET;
if (!secret) {
  console.error('Error: REVALIDATE_SECRET env var is not set.');
  process.exit(1);
}

const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
const url = `${baseUrl}/api/revalidate-parks`;

console.log(`Revalidating ${slugs.length} park(s) via ${url} ...`);

fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-revalidate-secret': secret,
  },
  body: JSON.stringify({ slugs }),
})
  .then(res => res.json())
  .then(data => {
    if (data.revalidated?.length) {
      console.log('✓ Revalidated:', data.revalidated.join(', '));
    }
    if (data.failed?.length) {
      console.error('✗ Failed:');
      data.failed.forEach(f => console.error(`  ${f.slug}: ${f.reason}`));
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Request failed:', err.message);
    process.exit(1);
  });
