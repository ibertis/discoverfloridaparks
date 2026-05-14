/**
 * onboard-park.ts
 *
 * One-command park onboarding: enrichment → validation → hotel proximity fix.
 * Stops if any blocker check fails after enrichment.
 *
 * Usage:
 *   npx tsx scripts/onboard-park.ts --slug caladesi-island-state-park
 *   npx tsx scripts/onboard-park.ts --slug "Blue Spring State Park"   # slug auto-derived
 *   npx tsx scripts/onboard-park.ts --slug caladesi-island-state-park --no-ai
 *   npx tsx scripts/onboard-park.ts --slug caladesi-island-state-park --overwrite
 */

import * as dotenv from 'dotenv';
import path from 'path';
import { pathToFileURL } from 'url';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { enrichPark } from './enrich-one-park.js';
import { validatePark } from './validate-park.js';
import { fixHotelProximityForPark } from './fix-hotel-proximity.js';

// ─── Colors ───────────────────────────────────────────────────────────────────

const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  red: '\x1b[31m',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function step(n: number, total: number, label: string) {
  console.log(`\n${c.bold}${c.cyan}[${n}/${total}] ${label}${c.reset}`);
  console.log('─'.repeat(60));
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);

  const rawSlug = args.find(a => a.startsWith('--slug='))?.split('=')[1]
    ?? (args.includes('--slug') ? args[args.indexOf('--slug') + 1] : null);

  if (!rawSlug) {
    console.error('Usage: npx tsx scripts/onboard-park.ts --slug <slug-or-name>');
    process.exit(1);
  }

  // Accept either a slug or a display name (e.g. "Blue Spring State Park")
  const slug = rawSlug.includes(' ') ? toSlug(rawSlug) : rawSlug;
  const displayName = rawSlug.includes(' ') ? rawSlug : undefined;

  const noAi = args.includes('--no-ai');
  const noPhoto = args.includes('--no-photo');
  const overwrite = args.includes('--overwrite');

  console.log(`\n${c.bold}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${c.reset}`);
  console.log(`${c.bold}  Onboarding: ${slug}${c.reset}`);
  console.log(`${c.bold}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${c.reset}`);

  // ── Step 1: Enrich ────────────────────────────────────────────────────────
  step(1, 3, 'Enrichment');
  try {
    await enrichPark(slug, { displayName, noAi, noPhoto, overwrite, autoApply: true });
    console.log(`\n${c.green}✓ Enrichment complete.${c.reset}`);
  } catch (e) {
    console.error(`\n${c.red}✗ Enrichment failed: ${(e as Error).message}${c.reset}`);
    process.exit(1);
  }

  // ── Step 2: Validate ──────────────────────────────────────────────────────
  step(2, 3, 'Validation');
  const validation = await validatePark(slug);

  for (const check of validation.checks) {
    const icon = check.passed
      ? `${c.green}✓${c.reset}`
      : check.blocker ? `${c.red}✗${c.reset}` : `${c.yellow}⚠${c.reset}`;
    const detail = check.detail && !check.passed ? `  ${c.gray}${check.detail}${c.reset}` : '';
    console.log(`  ${icon}  ${check.label}${detail}`);
  }

  if (!validation.passed) {
    console.log(`\n${c.red}${c.bold}✗ Validation failed — ${validation.blockers.length} blocker(s) must be resolved before this park can go live.${c.reset}`);
    console.log(`\n${c.bold}Blockers to fix manually:${c.reset}`);
    validation.blockers.forEach((b, i) => {
      console.log(`  ${i + 1}. [Check ${b.id}] ${b.label}${b.detail ? ` — ${c.gray}${b.detail}${c.reset}` : ''}`);
    });
    console.log();
    process.exit(1);
  }

  console.log(`\n${c.green}✓ Validation passed${validation.warnings.length > 0 ? ` (${validation.warnings.length} warning(s))` : ''}.${c.reset}`);

  // ── Step 3: Hotel proximity fix ───────────────────────────────────────────
  step(3, 3, 'Hotel proximity fix');
  const hotelResult = await fixHotelProximityForPark(slug);

  if (hotelResult.error) {
    console.log(`  ${c.yellow}⚠  Hotel fix encountered an error: ${hotelResult.error}${c.reset}`);
  } else if (hotelResult.skipped) {
    console.log(`  ${c.gray}Skipped: ${hotelResult.reason}${c.reset}`);
  } else {
    console.log(`  ${c.green}✓ Hotels re-enriched with fresh proximity data.${c.reset}`);
  }

  // ── Done ──────────────────────────────────────────────────────────────────
  console.log(`\n${c.bold}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${c.reset}`);
  console.log(`${c.green}${c.bold}  Onboarding complete: ${slug}${c.reset}`);
  console.log(`${c.bold}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${c.reset}\n`);

  // Print human review checklist for warnings
  const reviewItems = [
    ...validation.warnings.map(w => `[Check ${w.id}] ${w.label}${w.detail ? ` — ${w.detail}` : ''}`),
    ...(hotelResult.skipped ? [`Hotel proximity — ${hotelResult.reason}`] : []),
  ];

  if (reviewItems.length > 0) {
    console.log(`${c.yellow}${c.bold}Manual review needed:${c.reset}`);
    reviewItems.forEach((item, i) => {
      console.log(`  ${i + 1}. ${item}`);
    });
    console.log();
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(e => { console.error(e); process.exit(1); });
}
