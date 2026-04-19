import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const BASE = 'https://maps.googleapis.com/maps/api/place';

export interface PlaceResult {
  placeId: string;
  name: string;
  formattedAddress: string;
  city: string;
  zipCode: string;
  phone: string | null;
  website: string | null;
  rating: number | null;
  operatingHours: string | null;
  photoUrl: string | null;
  lat: number | null;
  lng: number | null;
}

function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

export async function findPark(query: string): Promise<string | null> {
  if (!API_KEY) throw new Error('Missing GOOGLE_PLACES_API_KEY in .env.local');
  await sleep(200); // 5 req/sec throttle
  const url = `${BASE}/findplacefromtext/json?input=${encodeURIComponent(query)}&inputtype=textquery&fields=place_id&key=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json() as any;
  if (data.status !== 'OK' || !data.candidates?.length) return null;
  return data.candidates[0].place_id as string;
}

export async function getPlaceDetails(placeId: string): Promise<PlaceResult | null> {
  if (!API_KEY) throw new Error('Missing GOOGLE_PLACES_API_KEY in .env.local');
  await sleep(200);
  const fields = [
    'name', 'formatted_address', 'formatted_phone_number',
    'website', 'rating', 'opening_hours', 'photos', 'geometry',
    'address_components',
  ].join(',');
  const url = `${BASE}/details/json?place_id=${placeId}&fields=${fields}&key=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json() as any;
  if (data.status !== 'OK' || !data.result) return null;

  const r = data.result;
  const addrComponents: any[] = r.address_components ?? [];

  const city = addrComponents.find((c: any) => c.types.includes('locality'))?.long_name
    ?? addrComponents.find((c: any) => c.types.includes('administrative_area_level_2'))?.long_name
    ?? '';
  const zip = addrComponents.find((c: any) => c.types.includes('postal_code'))?.long_name ?? '';

  // Build a street address (street number + route)
  const streetNumber = addrComponents.find((c: any) => c.types.includes('street_number'))?.long_name ?? '';
  const route = addrComponents.find((c: any) => c.types.includes('route'))?.long_name ?? '';
  const address = [streetNumber, route].filter(Boolean).join(' ') || r.formatted_address?.split(',')[0] || '';

  const hours = r.opening_hours?.weekday_text?.join('\n') ?? null;

  let photoUrl: string | null = null;
  if (r.photos?.length && API_KEY) {
    const ref = r.photos[0].photo_reference;
    photoUrl = `${BASE}/photo?maxwidth=1280&photoreference=${ref}&key=${API_KEY}`;
  }

  return {
    placeId,
    name: r.name ?? '',
    formattedAddress: r.formatted_address ?? '',
    city,
    zipCode: zip,
    phone: r.formatted_phone_number ?? null,
    website: r.website ?? null,
    rating: r.rating ?? null,
    operatingHours: hours,
    photoUrl,
    lat: r.geometry?.location?.lat ?? null,
    lng: r.geometry?.location?.lng ?? null,
  };
}
