export interface FlStatePark {
  name: string;
  slug: string;
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Exclude non-park entries from the Wikipedia links list
const EXCLUDE = new Set([
  'AmeriCorps Florida State Parks',
  'Florida Department of Environmental Protection',
  'Florida State Parks',
  'National Register of Historic Places',
]);

export async function fetchFlStateParksList(): Promise<FlStatePark[]> {
  const url = 'https://en.wikipedia.org/w/api.php?action=parse&page=List_of_Florida_state_parks&prop=links&format=json&pllimit=500';
  const res = await fetch(url, { headers: { 'User-Agent': 'DiscoverFloridaParks/1.0 (data enrichment script)' } });
  if (!res.ok) throw new Error(`Wikipedia API error: ${res.status}`);

  const data = await res.json() as any;
  const links: { ns: number; '*': string }[] = data.parse?.links ?? [];

  return links
    .filter(l =>
      l.ns === 0 &&
      !EXCLUDE.has(l['*']) &&
      /State (Park|Forest|Preserve|Reserve|Trail|Garden|Recreation Area|Beach|Museum)/i.test(l['*'])
    )
    .map(l => ({ name: l['*'], slug: toSlug(l['*']) }));
}
