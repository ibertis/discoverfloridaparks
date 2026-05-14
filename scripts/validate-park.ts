/**
 * validate-park.ts
 *
 * Runs 9 correctness checks on a park record and its related data.
 * Returns a structured result with pass/fail per check.
 *
 * Usage (CLI):
 *   npx tsx scripts/validate-park.ts caladesi-island-state-park
 *
 * Usage (library):
 *   import { validatePark } from './validate-park.js'
 *   const result = await validatePark('caladesi-island-state-park')
 */

import * as dotenv from 'dotenv';
import path from 'path';
import { pathToFileURL } from 'url';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { supabaseAdmin } from './lib/supabase-admin.js';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CheckResult {
  id: number;
  label: string;
  passed: boolean;
  detail?: string;
  blocker: boolean;
}

export interface ValidationResult {
  slug: string;
  passed: boolean;
  checks: CheckResult[];
  blockers: CheckResult[];
  warnings: CheckResult[];
}

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

// ─── Core validation ──────────────────────────────────────────────────────────

export async function validatePark(slug: string): Promise<ValidationResult> {
  const checks: CheckResult[] = [];

  // ── Check 1: Park exists ──────────────────────────────────────────────────
  const { data: park, error: parkError } = await supabaseAdmin
    .from('parks')
    .select('id, slug, name, latitude, longitude, short_description, full_description, featured_image_url, park_regions')
    .eq('slug', slug)
    .maybeSingle();

  checks.push({
    id: 1,
    label: 'Park exists in DB',
    passed: !!park && !parkError,
    detail: parkError?.message,
    blocker: true,
  });

  // If the park doesn't exist, remaining checks are meaningless
  if (!park) {
    return buildResult(slug, checks);
  }

  // ── Check 2: Has GPS coordinates ─────────────────────────────────────────
  const hasCoords = park.latitude != null && park.longitude != null;
  checks.push({
    id: 2,
    label: 'Has GPS coordinates',
    passed: hasCoords,
    detail: hasCoords ? `${park.latitude}, ${park.longitude}` : 'latitude and/or longitude is null',
    blocker: true,
  });

  // ── Check 3: Has description ──────────────────────────────────────────────
  const hasDesc = !!(park.short_description?.trim() || park.full_description?.trim());
  checks.push({
    id: 3,
    label: 'Has description',
    passed: hasDesc,
    detail: hasDesc ? undefined : 'short_description and full_description are both empty',
    blocker: true,
  });

  // ── Check 4: Has featured image ───────────────────────────────────────────
  const hasImage = !!park.featured_image_url;
  checks.push({
    id: 4,
    label: 'Has featured image',
    passed: hasImage,
    detail: hasImage ? undefined : 'featured_image_url is null',
    blocker: true,
  });

  // ── Check 5: Has region ───────────────────────────────────────────────────
  const regions = (park as any).park_regions as string[] | null;
  const hasRegion = Array.isArray(regions) && regions.length > 0;
  checks.push({
    id: 5,
    label: 'Has park region',
    passed: hasRegion,
    detail: hasRegion ? regions!.join(', ') : 'park_regions is null or empty',
    blocker: false,
  });

  // ── Check 6: Has amenities row ────────────────────────────────────────────
  const { count: amenitiesCount, error: amenitiesError } = await supabaseAdmin
    .from('park_amenities')
    .select('*', { count: 'exact', head: true })
    .eq('park_id', park.id);

  const hasAmenities = !amenitiesError && (amenitiesCount ?? 0) > 0;
  checks.push({
    id: 6,
    label: 'Has amenities row',
    passed: hasAmenities,
    detail: amenitiesError?.message ?? (hasAmenities ? undefined : 'no row in park_amenities'),
    blocker: false,
  });

  // ── Check 7: Has at least one hotel ──────────────────────────────────────
  const { data: hotels, error: hotelsError } = await supabaseAdmin
    .from('park_hotels')
    .select('id, distance_from_park_km')
    .eq('park_id', park.id);

  const hasHotels = !hotelsError && (hotels?.length ?? 0) > 0;
  checks.push({
    id: 7,
    label: 'Has at least one hotel',
    passed: hasHotels,
    detail: hotelsError?.message ?? (hasHotels ? `${hotels!.length} hotel(s)` : 'no rows in park_hotels'),
    blocker: false,
  });

  // ── Check 8: No hotels with null distance ─────────────────────────────────
  const nullDistHotels = (hotels ?? []).filter(h => h.distance_from_park_km == null);
  const noNullDist = nullDistHotels.length === 0;
  checks.push({
    id: 8,
    label: 'No hotels with null distance',
    passed: noNullDist,
    detail: noNullDist ? undefined : `${nullDistHotels.length} hotel(s) have null distance_from_park_km`,
    blocker: false,
  });

  // ── Check 9: No hotels with distance > 30km ───────────────────────────────
  const farHotels = (hotels ?? []).filter(h => h.distance_from_park_km != null && h.distance_from_park_km > 30);
  const noFarHotels = farHotels.length === 0;
  checks.push({
    id: 9,
    label: 'No hotels further than 30km',
    passed: noFarHotels,
    detail: noFarHotels ? undefined : `${farHotels.length} hotel(s) beyond 30km`,
    blocker: false,
  });

  return buildResult(slug, checks);
}

function buildResult(slug: string, checks: CheckResult[]): ValidationResult {
  const blockers = checks.filter(c => !c.passed && c.blocker);
  const warnings = checks.filter(c => !c.passed && !c.blocker);
  return {
    slug,
    passed: blockers.length === 0,
    checks,
    blockers,
    warnings,
  };
}

// ─── CLI output ───────────────────────────────────────────────────────────────

function printResult(result: ValidationResult) {
  console.log(`\n${c.bold}${c.cyan}Validation: ${result.slug}${c.reset}`);
  console.log('─'.repeat(60));

  for (const check of result.checks) {
    const icon = check.passed ? `${c.green}✓${c.reset}` : check.blocker ? `${c.red}✗${c.reset}` : `${c.yellow}⚠${c.reset}`;
    const label = check.passed ? check.label : `${c.bold}${check.label}${c.reset}`;
    const detail = check.detail && !check.passed ? `  ${c.gray}${check.detail}${c.reset}` : '';
    console.log(`  ${icon}  ${label}${detail}`);
  }

  console.log();

  if (result.passed) {
    if (result.warnings.length > 0) {
      console.log(`${c.yellow}Passed with ${result.warnings.length} warning(s).${c.reset}\n`);
    } else {
      console.log(`${c.green}${c.bold}All checks passed.${c.reset}\n`);
    }
  } else {
    console.log(`${c.red}${c.bold}Failed — ${result.blockers.length} blocker(s).${c.reset}\n`);
  }
}

// ─── Entry point ─────────────────────────────────────────────────────────────

async function main() {
  const slug = process.argv[2];
  if (!slug) {
    console.error('Usage: npx tsx scripts/validate-park.ts <slug>');
    process.exit(1);
  }

  const result = await validatePark(slug);
  printResult(result);
  process.exit(result.passed ? 0 : 1);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(e => { console.error(e); process.exit(1); });
}
