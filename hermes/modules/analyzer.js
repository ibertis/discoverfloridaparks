// modules/analyzer.js — Send failed URLs to LM Studio for AI analysis
import fetch from 'node-fetch'
import { config } from '../config.js'
import { logger } from './logger.js'

/**
 * Send failed URLs to LM Studio and get a formatted alert summary back.
 * Falls back to a plain summary if LM Studio is unavailable.
 */
export async function analyzeFailures(failed, totalChecked) {
  // If nothing failed, return clean bill of health
  if (failed.length === 0) {
    return {
      summary: `✅ All ${totalChecked} URLs are healthy. No action required.`,
      aiGenerated: false,
    }
  }

  const prompt = buildPrompt(failed, totalChecked)

  try {
    const response = await fetch(`${process.env.LM_STUDIO_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.LM_STUDIO_MODEL,
        messages: [
          {
            role: 'system',
            content: `You are Hermes, a URL monitoring assistant for Discover Florida Parks (discoverfloridaparks.com). 
You analyze broken URLs and produce clear, actionable alert reports.
Always respond in plain text — no markdown, no bullet symbols, just clean readable text.
Be concise and direct. Prioritize by severity.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: config.ai.maxTokens,
        temperature: config.ai.temperature,
      }),
    })

    const data = await response.json()
    const summary = data.choices?.[0]?.message?.content?.trim()

    if (!summary) throw new Error('Empty response from LM Studio')

    logger.info('AI analysis complete')
    return { summary, aiGenerated: true }

  } catch (err) {
    logger.warn(`LM Studio unavailable, using fallback summary: ${err.message}`)
    return {
      summary: buildFallbackSummary(failed, totalChecked),
      aiGenerated: false,
    }
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
