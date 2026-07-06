import { NextResponse } from 'next/server';
import { subscribeToKit } from '@/lib/kit';

// In-memory rate limiter: max 3 attempts per IP per hour.
// Each serverless instance tracks its own state — good enough for basic bot protection.
const rateLimitMap = new Map<string, number[]>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  const attempts = (rateLimitMap.get(ip) ?? []).filter(t => now - t < oneHour);
  if (attempts.length >= 3) return false;
  rateLimitMap.set(ip, [...attempts, now]);
  return true;
}

export async function POST(req: Request) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? '127.0.0.1';

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { success: false, error: 'Too many requests. Try again later.' },
      { status: 429 },
    );
  }

  let body: { email?: string; firstName?: string; source?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request.' }, { status: 400 });
  }

  const { email, firstName, source } = body;

  if (!email?.trim()) {
    return NextResponse.json({ success: false, error: 'Email is required.' }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim()) || /[\r\n]/.test(email)) {
    return NextResponse.json(
      { success: false, error: 'Please enter a valid email address.' },
      { status: 400 },
    );
  }

  const result = await subscribeToKit(email, source ?? 'unknown', firstName);

  if (result.ok) {
    return NextResponse.json({ success: true });
  }
  if (result.error === 'missing_api_key') {
    return NextResponse.json({ success: false, error: 'Service unavailable.' }, { status: 503 });
  }
  return NextResponse.json(
    { success: false, error: 'Could not subscribe. Please try again.' },
    { status: 502 },
  );
}
