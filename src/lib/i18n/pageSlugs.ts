import type { Locale } from './config';

// Canonical page keys map to a localized URL slug per locale.
// The canonical key is also the filename in src/data/pages/{canonical}.json.
export const STATIC_PAGE_SLUGS = {
  products: { fr: 'produits', en: 'products' },
  contact: { fr: 'contact', en: 'contact' },
  'research-and-development': {
    fr: 'recherche-et-developpement',
    en: 'research-and-development',
  },
  solution: { fr: 'trouver-une-solution', en: 'find-a-solution' },
} as const satisfies Record<string, Record<Locale, string>>;

export type StaticPageKey = keyof typeof STATIC_PAGE_SLUGS;

export const STATIC_PAGE_KEYS = Object.keys(STATIC_PAGE_SLUGS) as StaticPageKey[];

/** canonical key + locale → URL path (with locale prefix) */
export function pathForKey(key: StaticPageKey, locale: Locale): string {
  return `/${locale}/${STATIC_PAGE_SLUGS[key][locale]}`;
}

/** locale + incoming slug → canonical key (or null) */
export function keyForSlug(slug: string, locale: Locale): StaticPageKey | null {
  const entry = (Object.entries(STATIC_PAGE_SLUGS) as [StaticPageKey, Record<Locale, string>][]).find(
    ([, slugs]) => slugs[locale] === slug,
  );
  return entry ? entry[0] : null;
}

/** locale + slug in current locale → equivalent slug in target locale (or null if unknown) */
export function translateSlug(slug: string, from: Locale, to: Locale): string | null {
  const key = keyForSlug(slug, from);
  if (!key) return null;
  return STATIC_PAGE_SLUGS[key][to];
}
