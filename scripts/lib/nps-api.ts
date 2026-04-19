import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const API_KEY = process.env.NPS_API_KEY ?? '';

export interface NpsPark {
  parkCode: string;
  fullName: string;
  shortDescription: string;
  description: string;
  latitude: string;
  longitude: string;
  entranceFees: { cost: string; description: string; title: string }[];
  operatingHours: { description: string; name: string }[];
  addresses: { line1: string; city: string; postalCode: string; stateCode: string }[];
  contacts: { phoneNumbers: { phoneNumber: string }[] };
  images: { url: string; title: string }[];
  url: string;
}

export async function fetchFloridaNpsParks(): Promise<NpsPark[]> {
  if (!API_KEY) {
    console.warn('NPS_API_KEY not set — skipping NPS pass. Get a free key at nps.gov/subjects/developer/get-started.htm');
    return [];
  }

  const parks: NpsPark[] = [];
  let start = 0;
  const limit = 50;

  while (true) {
    const url = `https://developer.nps.gov/api/v1/parks?stateCode=FL&limit=${limit}&start=${start}&api_key=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json() as any;
    const batch: NpsPark[] = data.data ?? [];
    parks.push(...batch);
    if (parks.length >= parseInt(data.total)) break;
    start += limit;
  }

  return parks;
}
