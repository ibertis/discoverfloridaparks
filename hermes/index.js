// index.js — Hermes main entry point
// Usage:
//   node index.js           → full run
//   node index.js --dry-run → check URLs only, no email sent

import 'dotenv/config'
import { fetchParkURLs } from './modules/db.js'
import { checkAllURLs } from './modules/checker.js'
import { checkAffiliateLinks } from './modules/affiliateChecker.js'
import { checkFees, buildManualReviewList, verifyAllFees } from './modules/feeChecker.js'
import { checkGSC, buildGSCSummary } from './modules/gscChecker.js'
import { analyzeFailures } from './modules/analyzer.js'
import { sendReport } from './modules/mailer.js'
import { logger } from './modules/logger.js'
import { checkGearLinks, buildGearLinksSection } from './modules/gearLinks.js'
import { checkHotelProximity, buildHotelProximitySection } from './modules/hotelProximity.js'
import { checkNewParks, buildNewParksSection, runOnboarding } from './modules/newParks.js'

const isDryRun = process.argv.includes('--dry-run')
const isForce  = process.argv.includes('--force')

// ── --verify-fees: stamp all bot-protected parks as verified, then exit ───────
if (process.argv.includes('--verify-fees')) {
  const count = await verifyAllFees()
  logger.info(`Fee verification complete — ${count} park(s) stamped. Manual review will be suppressed for 90 days (free parks: 180 days).`)
  process.exit(0)
}

async function run() {
  logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  logger.info('Hermes starting' + (isDryRun ? ' [DRY RUN]' : ''))
  logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  // ── Step 1 — Park URL health checks ────────────────────────────────────────
  logger.info('Fetching park URLs from Supabase...')
  const urls = await fetchParkURLs()
  logger.info(`Found ${urls.length} URLs to check`)

  logger.info('Running park URL health checks...')
  const { healthy: healthyURLs, failed: failedURLs } = await checkAllURLs(urls)
  logger.info(`Park URLs: ${healthyURLs.length} healthy, ${failedURLs.length} failed`)

  // ── Steps 2–5 — Parallel checks ────────────────────────────────────────────
  logger.info('Running affiliate, fee, gear, and hotel checks in parallel...')
  const [
    { healthy: healthyAffiliates, failed: failedAffiliates, total: totalAffiliates },
    { flagged: flaggedFees, checked: checkedFees, manualReview, suppressedCount, nextReview, automatedTotal, manualTotal },
    gearResult,
    hotelResult,
    newParksResult,
  ] = await Promise.all([
    checkAffiliateLinks(),
    checkFees({ force: isForce }),
    checkGearLinks(),
    checkHotelProximity(),
    checkNewParks(),
  ])
  logger.info(`Affiliate links: ${healthyAffiliates.length} healthy, ${failedAffiliates.length} failed`)
  logger.info(`Fees: ${checkedFees.length} checked, ${flaggedFees.length} flagged | ${manualTotal} need manual review`)
  logger.info(`Gear links: ${gearResult.passed} passed, ${gearResult.failed} failed`)
  logger.info(`Hotel proximity: ${hotelResult.detected} detected, ${hotelResult.fixed} fixed, ${hotelResult.skipped} skipped`)
  logger.info(`New parks: ${newParksResult.total} added today, ${newParksResult.incomplete.length} need onboarding`)

  // ── Step 6 — Auto-onboard new parks (sequential — spawnSync would block parallel) ─
  let onboardResults = []
  if (!isDryRun && newParksResult.incomplete.length > 0) {
    logger.info(`Auto-onboarding ${newParksResult.incomplete.length} park(s)...`)
    onboardResults = await runOnboarding(newParksResult.incomplete)
    const succeeded = onboardResults.filter(r => r.success).length
    const failed = onboardResults.filter(r => !r.success).length
    logger.info(`Auto-onboarding complete: ${succeeded} succeeded, ${failed} failed`)
  }

  // ── Step 7 — GSC performance check ────────────────────────────────────────
  logger.info('Running GSC performance check...')
  const gscResult = await checkGSC()
  if (gscResult.available) {
    logger.info(`GSC: ${gscResult.flagged.length} pages flagged`)
  } else {
    logger.warn(`GSC: ${gscResult.message}`)
  }

  // ── Step 8 — Combine all failures ──────────────────────────────────────────
  const allFailed = [
    ...failedURLs,
    ...failedAffiliates.map(f => ({
      parkName: f.name,
      slug: f.id,
      url: f.url,
      type: `affiliate_${f.program}`,
      status: f.status ?? f.error,
      healthy: false,
      error: f.missingParams.length > 0
        ? `Missing params: ${f.missingParams.join(', ')}`
        : f.error,
    })),
    ...flaggedFees.map(({ park, result }) => ({
      parkName: park.name,
      slug: park.slug,
      url: park.website,
      type: 'fee_change',
      status: 'changed',
      healthy: false,
      error: `Stored: "${park.entrance_fee}" → Detected: "${result.detected_fee}" (${result.confidence} confidence)`,
    })),
  ]

  const totalChecked = urls.length + totalAffiliates + automatedTotal

  // ── Step 9 — AI analysis ───────────────────────────────────────────────────
  logger.info('Sending results to LM Studio for analysis...')
  const { summary, aiGenerated } = await analyzeFailures(allFailed, totalChecked)
  logger.info(`Analysis complete (AI generated: ${aiGenerated})`)

  // Build full report — GSC and manual review appended as text sections
  let fullSummary = summary + buildGSCSummary(gscResult) + buildManualReviewList(manualReview, suppressedCount, nextReview)

  const gearSection = buildGearLinksSection(gearResult)
  const hotelSection = buildHotelProximitySection(hotelResult)
  const newParksSection = buildNewParksSection(newParksResult, onboardResults, isDryRun)
  if (gearSection) fullSummary += '\n\n' + gearSection
  if (hotelSection) fullSummary += '\n\n' + hotelSection
  if (newParksSection) fullSummary += '\n\n' + newParksSection

  // ── Step 10 — Send report ──────────────────────────────────────────────────
  if (isDryRun) {
    logger.info('[DRY RUN] Skipping email. Report preview:')
    logger.info(fullSummary)
  } else {
    logger.info('Sending email report...')
    await sendReport({
      subject: null,
      body: fullSummary,
      failed: allFailed,
      totalChecked,
    })
  }

  logger.info('Hermes complete ✓')
  logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

run().catch(err => {
  logger.error(`Hermes crashed: ${err.message}`)
  process.exit(1)
})
