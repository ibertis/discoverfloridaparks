// modules/mailer.js — Send alert emails via Resend
import { Resend } from 'resend'
import { logger } from './logger.js'

/**
 * Send the Hermes report email.
 */
export async function sendReport({ subject, body, failed, totalChecked }) {
  const resend = new Resend(process.env.RESEND_API_KEY)

  const hasFailures = failed.length > 0
  const emoji = hasFailures ? '🚨' : '✅'
  const emailSubject = hasFailures
    ? `${emoji} Hermes Alert — ${failed.length} broken URL${failed.length > 1 ? 's' : ''} on DFP`
    : `${emoji} Hermes — All ${totalChecked} URLs healthy`

  const { error } = await resend.emails.send({
    from: 'Hermes — DFP Monitor <hermes@discoverfloridaparks.com>',
    to: process.env.ALERT_EMAIL,
    subject: emailSubject,
    text: body,
    html: buildHTML({ body, failed, totalChecked, hasFailures }),
  })

  if (error) throw new Error(`Resend error: ${error.message}`)

  logger.info(`Report email sent to ${process.env.ALERT_EMAIL}`)
}

// ── HTML Email Template ───────────────────────────────────────────────────────

function buildHTML({ body, failed, totalChecked, hasFailures }) {
  const failureRows = failed.map(f => `
    <tr>
      <td style="padding:8px 12px; border-bottom:1px solid #f0ece8;">${f.parkName}</td>
      <td style="padding:8px 12px; border-bottom:1px solid #f0ece8; color:#999; font-size:12px;">${f.type}</td>
      <td style="padding:8px 12px; border-bottom:1px solid #f0ece8; font-size:12px; word-break:break-all;">
        <a href="${f.url}" style="color:#ff7044;">${f.url}</a>
      </td>
      <td style="padding:8px 12px; border-bottom:1px solid #f0ece8; color:${f.healthy ? '#22c55e' : '#ef4444'}; font-weight:600;">
        ${f.status ?? f.error}
      </td>
    </tr>
  `).join('')

  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8" /></head>
<body style="margin:0; padding:0; background:#f0ece8; font-family:Arial,sans-serif;">
  <table width="600" align="center" cellpadding="0" cellspacing="0" style="background:#fff; margin:32px auto; border-radius:12px; overflow:hidden;">

    <!-- Header -->
    <tr>
      <td style="background:#362f35; padding:24px 32px;">
        <p style="margin:0; color:#ff7044; font-size:11px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase;">Discover Florida Parks</p>
        <h1 style="margin:4px 0 0; color:#fff; font-size:22px;">Hermes URL Monitor</h1>
      </td>
    </tr>

    <!-- Status bar -->
    <tr>
      <td style="background:${hasFailures ? '#ef4444' : '#22c55e'}; padding:10px 32px;">
        <p style="margin:0; color:#fff; font-weight:700; font-size:14px;">
          ${hasFailures ? `⚠️ ${failed.length} broken URL${failed.length > 1 ? 's' : ''} detected` : `✅ All ${totalChecked} URLs healthy`}
          &nbsp;·&nbsp; ${new Date().toDateString()}
        </p>
      </td>
    </tr>

    <!-- AI Summary -->
    <tr>
      <td style="padding:28px 32px 20px;">
        <h2 style="margin:0 0 12px; font-size:15px; color:#362f35;">Analysis</h2>
        <p style="margin:0; font-size:14px; line-height:1.7; color:#413734; white-space:pre-line;">${body}</p>
      </td>
    </tr>

    ${hasFailures ? `
    <!-- Failed URLs table -->
    <tr>
      <td style="padding:0 32px 28px;">
        <h2 style="margin:0 0 12px; font-size:15px; color:#362f35;">Failed URLs</h2>
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #f0ece8; border-radius:8px; overflow:hidden;">
          <thead>
            <tr style="background:#f0ece8;">
              <th style="padding:8px 12px; text-align:left; font-size:11px; color:#999; text-transform:uppercase;">Park</th>
              <th style="padding:8px 12px; text-align:left; font-size:11px; color:#999; text-transform:uppercase;">Type</th>
              <th style="padding:8px 12px; text-align:left; font-size:11px; color:#999; text-transform:uppercase;">URL</th>
              <th style="padding:8px 12px; text-align:left; font-size:11px; color:#999; text-transform:uppercase;">Status</th>
            </tr>
          </thead>
          <tbody>${failureRows}</tbody>
        </table>
      </td>
    </tr>
    ` : ''}

    <!-- Footer -->
    <tr>
      <td style="background:#362f35; padding:16px 32px; border-radius:0 0 12px 12px;">
        <p style="margin:0; color:#7a7270; font-size:11px;">
          Hermes · DFP URL Monitor · Ran at ${new Date().toLocaleString()} ·
          <a href="https://discoverfloridaparks.com" style="color:#ff7044; text-decoration:none;">discoverfloridaparks.com</a>
        </p>
      </td>
    </tr>

  </table>
</body>
</html>
  `
}
