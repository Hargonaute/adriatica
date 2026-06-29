/**
 * Convert any string to a URL-safe slug.
 * Strips diacritics, lowercases, collapses non-alphanumeric chars to hyphens.
 */
export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')    // non-alphanumeric → hyphen
    .replace(/^-+|-+$/g, '')        // trim leading/trailing hyphens
    .slice(0, 96);                  // keep URLs reasonable
}
