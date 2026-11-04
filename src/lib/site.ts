/**
 * Public site identity, shared by metadata, sitemap, robots and JSON-LD.
 * Pure constants (no Next / DB) so tests and the proxy can import them.
 */

import type { Locale } from './i18n/config';

/**
 * Absolute origin of the public site, used for canonical / hreflang / og:url /
 * sitemap URLs. Override with SITE_URL (e.g. on a preview deployment); never
 * ends with a slash.
 */
export const SITE_URL = (process.env.SITE_URL || 'https://www.adriatica.ma').replace(/\/+$/, '');

export const SITE_NAME = 'Adriatica';

/**
 * Last change to the content that lives in code (src/data/*.json: home, static
 * pages, legal pages). Used as <lastmod> for those pages in /sitemap.xml.
 * Bump it when that content changes.
 */
export const CODED_CONTENT_UPDATED_AT = new Date('2026-11-02T00:00:00Z');

export const OG_LOCALE: Record<Locale, string> = { fr: 'fr_FR', en: 'en_US' };

/**
 * Default social image (1200×630) when a page has none. Cropped from
 * public/home_page_img/Adriatica Web.jpg.
 * TODO-CLIENT: replace with a branded 1200×630 image if the client provides one.
 */
export const DEFAULT_OG_IMAGE = {
  url: '/og-default.jpg',
  width: 1200,
  height: 630,
  alt: 'Adriatica',
} as const;

/** `/fr/contact` → `https://www.adriatica.ma/fr/contact` */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
