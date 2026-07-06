// Shared Kit (ConvertKit) subscribe helper. Used by /api/subscribe AND
// /api/download-signup so every email-capture point grows the ONE newsletter
// list. Resilient by design — returns a result object instead of throwing, so a
// Kit outage never breaks the calling flow (e.g. the lead-magnet PDF delivery).

interface KitResult {
  ok: boolean;
  status?: number;
  error?: 'missing_api_key' | 'kit_error' | 'network_error';
}

export async function subscribeToKit(
  email: string,
  source: string,
  firstName?: string,
): Promise<KitResult> {
  const apiKey = process.env.KIT_API_KEY;
  if (!apiKey) {
    console.error('[kit] Missing KIT_API_KEY');
    return { ok: false, error: 'missing_api_key' };
  }

  try {
    const res = await fetch('https://api.kit.com/v4/subscribers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Kit-Api-Key': apiKey },
      body: JSON.stringify({
        email_address: email.trim(),
        ...(firstName?.trim() && { first_name: firstName.trim() }),
        fields: { source: source || 'unknown' },
      }),
    });

    // Kit returns 200/201 for new subscribers and handles duplicates gracefully.
    if (res.ok) return { ok: true, status: res.status };

    const data = await res.json().catch(() => ({}));
    console.error('[kit] API error', res.status, data);
    return { ok: false, status: res.status, error: 'kit_error' };
  } catch (err) {
    console.error('[kit] Unexpected error:', err);
    return { ok: false, error: 'network_error' };
  }
}
