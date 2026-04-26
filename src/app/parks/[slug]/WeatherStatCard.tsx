'use client';

import { useEffect, useState } from 'react';
import { Cloud } from 'lucide-react';

interface Condition {
  label: string;
  emoji: string;
  bg: string;
  iconColor: string;
}

const DAY_CONDITIONS: Record<string, Condition> = {
  clear:         { label: 'Clear sky',     emoji: '☀️', bg: 'linear-gradient(135deg, #fff8e1 0%, #fff0c0 100%)', iconColor: '#e8a020' },
  mainly_clear:  { label: 'Mainly clear',  emoji: '🌤️', bg: 'linear-gradient(135deg, #fffae5 0%, #fff3cc 100%)', iconColor: '#e8a020' },
  partly_cloudy: { label: 'Partly cloudy', emoji: '⛅', bg: 'linear-gradient(135deg, #f6f8fc 0%, #edf1f7 100%)', iconColor: '#a6967c' },
  overcast:      { label: 'Overcast',      emoji: '☁️', bg: 'linear-gradient(135deg, #f0f2f4 0%, #e6e9ec 100%)', iconColor: '#726d6b' },
  foggy:         { label: 'Foggy',         emoji: '🌫️', bg: 'linear-gradient(135deg, #f4f2ef 0%, #ebe7e2 100%)', iconColor: '#a6967c' },
  drizzle:       { label: 'Drizzle',       emoji: '🌦️', bg: 'linear-gradient(135deg, #eef5fb 0%, #ddedf7 100%)', iconColor: '#4a90c4' },
  rain:          { label: 'Rain',          emoji: '🌧️', bg: 'linear-gradient(135deg, #e8f1f9 0%, #d2e6f4 100%)', iconColor: '#3a7abd' },
  heavy_rain:    { label: 'Heavy rain',    emoji: '🌧️', bg: 'linear-gradient(135deg, #e2edf8 0%, #c8dff2 100%)', iconColor: '#2d6ba8' },
  snow:          { label: 'Snow',          emoji: '❄️', bg: 'linear-gradient(135deg, #f0f8ff 0%, #e0f0ff 100%)', iconColor: '#5ba3d9' },
  showers:       { label: 'Rain showers',  emoji: '🌦️', bg: 'linear-gradient(135deg, #eef3fb 0%, #dce8f8 100%)', iconColor: '#5a7fbf' },
  storm:         { label: 'Thunderstorm',  emoji: '⛈️', bg: 'linear-gradient(135deg, #edeaf6 0%, #ddd5ee 100%)', iconColor: '#7c5cbf' },
};

const NIGHT_CONDITIONS: Record<string, Condition> = {
  clear:         { label: 'Clear night',        emoji: '🌙', bg: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', iconColor: '#a8b4d8' },
  mainly_clear:  { label: 'Mainly clear',        emoji: '🌙', bg: 'linear-gradient(135deg, #1c1c30 0%, #181828 100%)', iconColor: '#a8b4d8' },
  partly_cloudy: { label: 'Partly cloudy night', emoji: '☁️', bg: 'linear-gradient(135deg, #252535 0%, #1e1e2e 100%)', iconColor: '#8890aa' },
  overcast:      { label: 'Overcast',            emoji: '☁️', bg: 'linear-gradient(135deg, #f0f2f4 0%, #e6e9ec 100%)', iconColor: '#726d6b' },
  foggy:         { label: 'Foggy',               emoji: '🌫️', bg: 'linear-gradient(135deg, #f4f2ef 0%, #ebe7e2 100%)', iconColor: '#a6967c' },
  drizzle:       { label: 'Drizzle',             emoji: '🌦️', bg: 'linear-gradient(135deg, #eef5fb 0%, #ddedf7 100%)', iconColor: '#4a90c4' },
  rain:          { label: 'Rain',                emoji: '🌧️', bg: 'linear-gradient(135deg, #e8f1f9 0%, #d2e6f4 100%)', iconColor: '#3a7abd' },
  heavy_rain:    { label: 'Heavy rain',          emoji: '🌧️', bg: 'linear-gradient(135deg, #e2edf8 0%, #c8dff2 100%)', iconColor: '#2d6ba8' },
  snow:          { label: 'Snow',                emoji: '❄️', bg: 'linear-gradient(135deg, #f0f8ff 0%, #e0f0ff 100%)', iconColor: '#5ba3d9' },
  showers:       { label: 'Rain showers',        emoji: '🌧️', bg: 'linear-gradient(135deg, #eef3fb 0%, #dce8f8 100%)', iconColor: '#5a7fbf' },
  storm:         { label: 'Thunderstorm',        emoji: '⛈️', bg: 'linear-gradient(135deg, #edeaf6 0%, #ddd5ee 100%)', iconColor: '#7c5cbf' },
};

const WMO_MAP: Record<number, keyof typeof DAY_CONDITIONS> = {
  0: 'clear', 1: 'mainly_clear', 2: 'partly_cloudy', 3: 'overcast',
  45: 'foggy', 48: 'foggy',
  51: 'drizzle', 53: 'drizzle', 55: 'drizzle',
  61: 'rain', 63: 'rain', 65: 'heavy_rain',
  71: 'snow', 73: 'snow', 75: 'snow',
  80: 'showers', 81: 'showers', 82: 'storm',
  95: 'storm', 96: 'storm', 99: 'storm',
};

interface Props { lat: number; lng: number; }
interface Weather { temp: number; code: number; wind: number; isDay: boolean; }

export default function WeatherStatCard({ lat, lng }: Props) {
  const [weather, setWeather] = useState<Weather | null>(null);

  useEffect(() => {
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weathercode,wind_speed_10m,is_day&temperature_unit=fahrenheit&wind_speed_unit=mph`
    )
      .then(r => r.json())
      .then(d => {
        const c = d.current;
        setWeather({
          temp: Math.round(c.temperature_2m),
          code: c.weathercode,
          wind: Math.round(c.wind_speed_10m),
          isDay: c.is_day === 1,
        });
      })
      .catch(() => {});
  }, [lat, lng]);

  const conditionKey = weather ? (WMO_MAP[weather.code] ?? 'overcast') : null;
  const CONDITIONS = weather?.isDay ? DAY_CONDITIONS : NIGHT_CONDITIONS;
  const condition = conditionKey ? CONDITIONS[conditionKey] : null;

  const textColor = weather && !weather.isDay && ['clear', 'mainly_clear', 'partly_cloudy'].includes(conditionKey ?? '')
    ? '#c8d0e8'
    : '#413734';
  const subTextColor = weather && !weather.isDay && ['clear', 'mainly_clear', 'partly_cloudy'].includes(conditionKey ?? '')
    ? '#8890aa'
    : '#726d6b';

  return (
    <div style={{
      borderRadius: 16, padding: '20px', border: '1px solid #eeeeee',
      background: condition?.bg ?? '#fff',
      display: 'flex', flexDirection: 'column', gap: 10,
      position: 'relative', overflow: 'hidden',
      transition: 'background 0.6s ease',
      order: 9999,
    }}>
      {/* Watermark emoji */}
      {condition && (
        <span style={{
          position: 'absolute', bottom: -10, right: 4,
          fontSize: '5rem', lineHeight: 1,
          opacity: 0.2, pointerEvents: 'none', userSelect: 'none',
        }}>
          {condition.emoji}
        </span>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontFamily: 'Archivo, sans-serif', fontSize: '0.72rem', fontWeight: 600, color: condition?.iconColor ?? '#a6967c', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        <Cloud size={17} style={{ color: condition?.iconColor ?? '#a6967c' }} /> Current Weather
      </div>

      {weather && condition ? (
        <>
          <p style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: '1rem', color: textColor, margin: 0, position: 'relative' }}>
            {weather.temp}°F · {condition.label}
          </p>
          <p style={{ fontFamily: 'Archivo, sans-serif', fontSize: '0.72rem', color: subTextColor, margin: 0, position: 'relative' }}>
            Wind {weather.wind} mph
          </p>
        </>
      ) : (
        <p style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: '1rem', color: '#413734', margin: 0 }}>—</p>
      )}
    </div>
  );
}
