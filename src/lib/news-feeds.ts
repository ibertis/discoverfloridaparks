import Parser from 'rss-parser';

export interface NewsItem {
  id: string;
  title: string;
  link: string;
  pubDate: Date;
  snippet?: string;
  sourceName: string;
  sourceInitial: string;
  sourceColor: string;
  type: 'partner' | 'google-news';
}

interface FeedSource {
  id: string;
  name: string;
  url: string;
  type: 'partner' | 'google-news';
  color: string;
}

const FEED_SOURCES: FeedSource[] = [
  // Partner organization feeds
{ id: 'fwf',           name: 'Florida Wildlife Federation', url: 'https://fwfonline.org/feed/',                              type: 'partner',      color: '#7c6b4a' },
  { id: 'con-florida',   name: 'Conservation Florida',        url: 'https://www.conservationflorida.org/feed/',                type: 'partner',      color: '#4a6b7c' },
  { id: 'mote',          name: 'Mote Marine Laboratory',      url: 'https://mote.org/feed/',                                   type: 'partner',      color: '#1a6b8a' },
  { id: 'coral',         name: 'Coral Restoration Foundation',url: 'https://www.coralrestoration.org/feed/',                   type: 'partner',      color: '#e07b4a' },
  { id: 'riverkeeper',   name: 'Apalachicola Riverkeeper',    url: 'https://www.apalachicolariverkeeper.org/feed/',            type: 'partner',      color: '#5a8a6b' },
  // Google News queries
  { id: 'gn-parks',      name: 'Google News',                 url: 'https://news.google.com/rss/search?q=florida+state+parks&hl=en-US&gl=US&ceid=US:en',           type: 'google-news',  color: '#a6967c' },
  { id: 'gn-wildlife',   name: 'Google News',                 url: 'https://news.google.com/rss/search?q=florida+conservation+wildlife&hl=en-US&gl=US&ceid=US:en', type: 'google-news',  color: '#a6967c' },
  { id: 'gn-everglades', name: 'Google News',                 url: 'https://news.google.com/rss/search?q=everglades+florida+environment&hl=en-US&gl=US&ceid=US:en',type: 'google-news',  color: '#a6967c' },
  { id: 'gn-springs',    name: 'Google News',                 url: 'https://news.google.com/rss/search?q=florida+springs+reef+restoration&hl=en-US&gl=US&ceid=US:en',type: 'google-news', color: '#a6967c' },
];

const parser = new Parser({
  timeout: 8000,
  headers: { 'User-Agent': 'DiscoverFloridaParks/1.0 RSS Reader' },
  customFields: {
    item: [['source', 'source', { keepArray: false }]],
  },
});

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&[a-z]+;/gi, ' ').replace(/\s+/g, ' ').trim();
}

function wordOverlap(a: string, b: string): number {
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 3);
  const wordsA = new Set(normalize(a));
  const wordsB = new Set(normalize(b));
  if (wordsA.size === 0 || wordsB.size === 0) return 0;
  let shared = 0;
  wordsA.forEach(w => { if (wordsB.has(w)) shared++; });
  return shared / Math.min(wordsA.size, wordsB.size);
}

function dedup(items: NewsItem[]): NewsItem[] {
  // Pass 1: exact URL dedup
  const seen = new Set<string>();
  const pass1 = items.filter(item => {
    if (seen.has(item.link)) return false;
    seen.add(item.link);
    return true;
  });

  // Pass 2: fuzzy title dedup (>70% word overlap = same story, keep earlier)
  const result: NewsItem[] = [];
  for (const item of pass1) {
    const isDupe = result.some(r => wordOverlap(r.title, item.title) > 0.7);
    if (!isDupe) result.push(item);
  }
  return result;
}

async function fetchFeed(source: FeedSource): Promise<NewsItem[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(source.url, {
      signal: controller.signal,
      next: { revalidate: 7200 },
      headers: { 'User-Agent': 'DiscoverFloridaParks/1.0 RSS Reader' },
    });
    if (!res.ok) return [];
    const xml = await res.text();
    const feed = await parser.parseString(xml);

    return (feed.items ?? []).slice(0, 15).map((item, i) => {
      // For Google News, extract real publisher name from <source> element
      const rawSource = item.source as { $?: { url?: string }; _?: string } | string | undefined;
      const publisherName = typeof rawSource === 'object' && rawSource?._
        ? rawSource._
        : source.name;

      const title = stripHtml(item.title ?? '');
      const snippet = item.contentSnippet
        ? stripHtml(item.contentSnippet).slice(0, 160)
        : item.content
          ? stripHtml(item.content).slice(0, 160)
          : undefined;

      return {
        id: item.guid ?? item.link ?? `${source.id}-${i}`,
        title,
        link: item.link ?? '#',
        pubDate: item.pubDate ? new Date(item.pubDate) : new Date(0),
        snippet: snippet || undefined,
        sourceName: publisherName,
        sourceInitial: publisherName.charAt(0).toUpperCase(),
        sourceColor: source.color,
        type: source.type,
      };
    });
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchAllFeeds(): Promise<{ partner: NewsItem[]; googleNews: NewsItem[] }> {
  const results = await Promise.allSettled(FEED_SOURCES.map(fetchFeed));

  const allItems: NewsItem[] = results.flatMap((result, i) => {
    if (result.status === 'fulfilled') return result.value;
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Feed failed: ${FEED_SOURCES[i].id}`);
    }
    return [];
  });

  const sorted = allItems.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
  const deduped = dedup(sorted);

  return {
    partner:    deduped.filter(i => i.type === 'partner').slice(0, 30),
    googleNews: deduped.filter(i => i.type === 'google-news').slice(0, 30),
  };
}

export function relativeDate(date: Date): string {
  const diff = Date.now() - date.getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1)  return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7)   return `${days}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
