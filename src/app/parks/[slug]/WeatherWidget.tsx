'use client';

import { useEffect, useState } from 'react';

const WMO: Record<number, { label: string; emoji: string }> = {
  0:  { label: 'Clear sky',     emoji: '☀️' },
  1:  { label: 'Mainly clear',  emoji: '🌤️' },
  2:  { label: 'Partly cloudy', emoji: '⛅' },
  3:  { label: 'Overcast',      emoji: '☁️' },
  45: { label: 'Foggy',         emoji: '🌫️' },
  48: { label: 'Icy fog',       emoji: '🌫️' },
  51: { label: 'Light drizzle', emoji: '🌦️' },
  53: { label: 'Drizzle',       emoji: '🌦️' },
  55: { label: 'Heavy drizzle', emoji: '🌦️' },
  61: { label: 'Light rain',    emoji: '🌧️' },
  63: { label: 'Rain',          emoji: '🌧️' },
  65: { label: 'Heavy rain',    emoji: '🌧️' },
  71: { label: 'Light snow',    emoji: '❄️' },
  73: { label: 'Snow',          emoji: '❄️' },
  75: { label: 'Heavy snow',    emoji: '❄️' },
  80: { label: 'Rain showers',  emoji: '🌦️' },
  81: { label: 'Rain showers',  emoji: '🌦️' },
  82: { label: 'Heavy showers', emoji: '⛈️' },
  95: { label: 'Thunderstorm',  emoji: '⛈️' },
  96: { label: 'Thunderstorm',  emoji: '⛈️' },
  99: { label: 'Thunderstorm',  emoji: '⛈️' },
};

interface Props { lat: number; lng: number; }
interface Weather { temp: number; code: number; wind: number; }

export default function WeatherWidget({ lat, lng }: Props) {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weathercode,wind_speed_10m&temperature_unit=fahrenheit&wind_speed_unit=mph`
    )
      .then(r => r.json())
      .then(d => {
        const c = d.current;
        setWeather({ temp: Math.round(c.temperature_2m), code: c.weathercode, wind: Math.round(c.wind_speed_10m) });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [lat, lng]);

  const card: React.CSSProperties = { borderRadius: 16, padding: '24px', border: '1px solid #eeeeee', background: '#fff' };
  const lbl: React.CSSProperties = { fontFamily: 'Archivo, sans-serif', fontSize: '0.72rem', fontWeight: 600, color: '#a6967c', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 16px' };

  if (loading) return (
    <div style={card}>
      <p style={lbl}>Current Weather</p>
      <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.82rem', color: '#a6967c', margin: 0 }}>Loading…</p>
    </div>
  );

  if (!weather) return null;

  const wmo = WMO[weather.code] ?? { label: 'Conditions unavailable', emoji: '🌡️' };

  return (
    <div style={card}>
      <p style={lbl}>Current Weather</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 10 }}>
        <span style={{ fontSize: '2.8rem', lineHeight: 1 }}>{wmo.emoji}</span>
        <div>
          <p style={{ fontFamily: 'Shrikhand, cursive', fontWeight: 400, fontSize: '2.2rem', color: '#362f35', margin: 0, letterSpacing: '-0.04em', lineHeight: 1 }}>
            {weather.temp}°F
          </p>
          <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.8rem', color: '#726d6b', margin: '4px 0 0' }}>{wmo.label}</p>
        </div>
      </div>
      <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.72rem', color: '#a6967c', margin: 0 }}>
        Wind {weather.wind} mph · Live conditions
      </p>
    </div>
  );
}
