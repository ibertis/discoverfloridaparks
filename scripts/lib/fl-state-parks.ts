export interface FlStatePark {
  name: string;
  slug: string;
  url: string;
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function fetchFlStateParksList(): Promise<FlStatePark[]> {
  const res = await fetch('https://www.floridastateparks.org/parks-and-trails/');
  if (!res.ok) throw new Error(`Failed to fetch FL State Parks list: ${res.status}`);
  const html = await res.text();

  // Parse anchor tags pointing to park pages: /parks-and-trails/park-slug-here
  const pattern = /href="(\/parks-and-trails\/[a-z0-9-]+(?:\/[a-z0-9-]+)?)"/g;
  const seen = new Set<string>();
  const parks: FlStatePark[] = [];

  let match: RegExpExecArray | null;
  while ((match = pattern.exec(html)) !== null) {
    const href = match[1];
    // Skip the listing page itself and any sub-pages (e.g. /parks-and-trails/park/activities)
    const parts = href.split('/').filter(Boolean);
    if (parts.length !== 2) continue;
    const slug = parts[1];
    if (seen.has(slug)) continue;
    seen.add(slug);

    // Derive a display name from the slug (best-effort; Google Places will provide the canonical name)
    const name = slug
      .split('-')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    parks.push({ name, slug, url: `https://www.floridastateparks.org${href}` });
  }

  return parks;
}
