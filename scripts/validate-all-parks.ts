/**
 * validate-all-parks.ts
 *
 * Runs validatePark() on every park in the database and prints a summary
 * table of all failures, distinguishing blockers from warnings.
 *
 * Usage:
 *   npx tsx scripts/validate-all-parks.ts
 */

import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { supabaseAdmin } from './lib/supabase-admin.js';
import { validatePark } from './validate-park.js';
import type { ValidationResult } from './validate-park.js';

const DELAY_MS = 100;

const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

async function main() {
  // ── Fetch all slugs ─────────────────────────────────────────────────────────
  const { data: rows, error } = await supabaseAdmin
    .from('parks')
    .select('slug')
    .order('name');

  if (error || !rows) {
    console.error('Failed to fetch park slugs:', error?.message);
    process.exit(1);
  }

  const slugs = rows.map(r => r.slug as string);
  console.log(`\n${c.bold}${c.cyan}Validating ${slugs.length} parks...${c.reset}\n`);

  // ── Run validations ─────────────────────────────────────────────────────────
  const results: ValidationResult[] = [];
  for (let i = 0; i < slugs.length; i++) {
    const slug = slugs[i];
    process.stdout.write(`  [${String(i + 1).padStart(3)}/${slugs.length}] ${slug} ... `);
    const result = await validatePark(slug);
    results.push(result);

    if (result.blockers.length > 0) {
      process.stdout.write(`${c.red}✗ ${result.blockers.length} blocker(s)${c.reset}\n`);
    } else if (result.warnings.length > 0) {
      process.stdout.write(`${c.yellow}⚠ ${result.warnings.length} warning(s)${c.reset}\n`);
    } else {
      process.stdout.write(`${c.green}✓${c.reset}\n`);
    }

    if (i < slugs.length - 1) await new Promise(r => setTimeout(r, DELAY_MS));
  }

  // ── Summary table ───────────────────────────────────────────────────────────
  const withIssues = results.filter(r => r.blockers.length > 0 || r.warnings.length > 0);
  const fullyPassing = results.filter(r => r.blockers.length === 0 && r.warnings.length === 0);

  if (withIssues.length === 0) {
    console.log(`\n${c.bold}${c.green}All ${results.length} parks passed all checks.${c.reset}\n`);
    return;
  }

  // Column widths
  const slugWidth = Math.max(4, ...withIssues.map(r => r.slug.length));
  const issueWidth = 60;

  const hr = '─'.repeat(slugWidth + issueWidth + 9);
  const headerSlug  = 'Slug'.padEnd(slugWidth);
  const headerType  = 'B/W'.padEnd(3);
  const headerIssue = 'Failed check';

  console.log(`\n${c.bold}Parks with issues${c.reset}`);
  console.log(hr);
  console.log(`  ${c.bold}${headerSlug}  ${headerType}  ${headerIssue}${c.reset}`);
  console.log(hr);

  for (const r of withIssues) {
    const allFailed = [...r.blockers, ...r.warnings];
    allFailed.forEach((check, idx) => {
      const slugCell  = idx === 0 ? r.slug.padEnd(slugWidth) : ' '.repeat(slugWidth);
      const typeCell  = check.blocker ? `${c.red}BLK${c.reset}` : `${c.yellow}WRN${c.reset}`;
      const detail    = check.detail ? `  ${c.gray}${check.detail}${c.reset}` : '';
      const label     = check.blocker
        ? `${c.red}${check.label}${c.reset}`
        : `${c.yellow}${check.label}${c.reset}`;
      console.log(`  ${slugCell}  ${typeCell}  ${label}${detail}`);
    });
    console.log(hr);
  }

  // ── Totals ──────────────────────────────────────────────────────────────────
  const blockerParks  = results.filter(r => r.blockers.length > 0).length;
  const warningOnly   = results.filter(r => r.blockers.length === 0 && r.warnings.length > 0).length;

  console.log(`\n${c.bold}Totals${c.reset}`);
  console.log(`  Parks checked  : ${c.bold}${results.length}${c.reset}`);
  console.log(`  Fully passing  : ${c.bold}${c.green}${fullyPassing.length}${c.reset}`);
  console.log(`  Warnings only  : ${c.bold}${c.yellow}${warningOnly}${c.reset}`);
  console.log(`  Have blockers  : ${c.bold}${c.red}${blockerParks}${c.reset}`);
  console.log();
}

main().catch(e => { console.error(e); process.exit(1); });
