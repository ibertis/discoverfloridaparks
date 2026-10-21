// "News & Updates" → "news-updates". Runs of non-alphanumerics collapse to one
// hyphen so names with "&" or commas still produce clean, matchable URLs.
export function categoryToSlug(category: string): string {
  return category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

// Slugs are lossy ("&" is dropped), so map a slug back to its real category
// name by matching against the categories that actually exist.
export function findCategoryBySlug(slug: string, categories: string[]): string | undefined {
  return categories.find(c => categoryToSlug(c) === slug);
}
