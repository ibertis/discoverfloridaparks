import { NextRequest, NextResponse } from 'next/server';

// In-memory rate limiter: max 60 requests per IP per minute (consistency with the
// other public routes; prevents using this as a lightweight open proxy/amplifier).
const rateLimitMap = new Map<string, number[]>();
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const window = 60 * 1000;
  const attempts = (rateLimitMap.get(ip) ?? []).filter(t => now - t < window);
  if (attempts.length >= 60) return false;
  rateLimitMap.set(ip, [...attempts, now]);
  return true;
}

export async function GET(req: NextRequest) {
  const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || '127.0.0.1';
  if (!checkRateLimit(ip)) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  const { searchParams } = new URL(req.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  if (!lat || !lng) return NextResponse.json({ error: 'Missing coords' }, { status: 400 });

  const latNum = parseFloat(lat);
  const lngNum = parseFloat(lng);
  if (isNaN(latNum) || isNaN(lngNum) || latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180) {
    return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 });
  }

  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latNum}&longitude=${lngNum}&current=temperature_2m,weather_code,wind_speed_10m,is_day&temperature_unit=fahrenheit&wind_speed_unit=mph`,
    { next: { revalidate: 900 } }
  );

  const data = await res.json();
  return NextResponse.json(data);
}
