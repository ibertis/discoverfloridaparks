// Serialize structured data for <script type="application/ld+json">.
// Escapes '<' so database text can never close the script tag (e.g. "</script>").
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
