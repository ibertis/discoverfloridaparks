// modules/analyzer.js — Send failed URLs to Claude for AI analysis
import fetch from 'node-fetch'
import { config } from '../config.js'
import { logger } from './logger.js'

/**
 * Send failed URLs to Claude Haiku and get a formatted alert summary back.
 * Falls back to a plain summary if the API is unavailable.
 */
export async function analyzeFailures(failed, totalChecked) {
  if (failed.length === 0) {
    return {
      summary: `✅ All ${totalChecked} URLs are healthy. No action required.`,
      aiGenerated: false,
    }
  }

  const prompt = buildPrompt(failed, totalChecked)

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    logger.warn('ANTHROPIC_API_KEY not set — using fallback summary')
    return { summary: buildFallbackSummary(failed, totalChecked), aiGenerated: false }
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: config.ai.maxTokens,
        system: `You are Hermes, a site-health monitoring assistant for Discover Florida Parks (discoverfloridaparks.com).
You analyze broken URLs, fee changes, and affiliate issues and produce clear, actionable alert reports.
Always respond in plain text — no markdown, no bullet symbols, just clean readable text.
Be concise and direct. Prioritize by severity.`,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    const data = await response.json()
    const summary = data.content?.[0]?.text?.trim()

    if (!summary) throw new Error(`Empty response — ${JSON.stringify(data).slice(0, 120)}`)

    logger.info('Claude analysis complete')
    return { summary, aiGenerated: true }

  } catch (err) {
    logger.warn(`Claude API unavailable, using fallback summary: ${err.message}`)
    return { summary: buildFallbackSummary(failed, totalChecked), aiGenerated: false }
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function buildPrompt(failed, totalChecked) {
  const failureList = failed.map(f =>
    `- ${f.parkName} | ${f.type} | ${f.url} | Status: ${f.status ?? f.error}`
  ).join('\n')

  return `Hermes URL Health Report — ${new Date().toDateString()}

Total URLs checked: ${totalChecked}
Failed: ${failed.length}

Failed URLs:
${failureList}

Please write a brief alert report (5-10 sentences) that:
1. States the overall health status
2. Identifies the most critical failures
3. Notes any patterns (e.g. multiple parks on same domain failing)
4. Recommends immediate action items
5. Ends with a one-line summary for the subject line prefixed with "SUBJECT:"
`
}

function buildFallbackSummary(failed, totalChecked) {
  const lines = [
    `Hermes URL Health Report — ${new Date().toDateString()}`,
    ``,
    `${failed.length} of ${totalChecked} URLs are broken and need attention:`,
    ``,
    ...failed.map(f =>
      `${f.parkName} (${f.type}): ${f.url} — ${f.status ?? f.error}`
    ),
  ]
  return lines.join('\n')
}
