import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
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
