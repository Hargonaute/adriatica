/**
 * Intro texts of the filtered catalogue pages (B4): one short paragraph per
 * famille (6) and per culture (12), FR and EN, edited in the dashboard
 * (Catalogue → Intros) and shown under the H1 of
 * /fr/trouver-une-solution?famille=<slug> (and ?culture=<slug>).
 *
 * Storage without a schema change: ONE reserved row in `pages` whose slug
 * starts with "_" (the dashboard's page-create rule only allows [a-z0-9-], so
 * no user page can take it). The row is always `status = 'draft'`, so every
 * public reader (routes, sitemap, navbar, /api/pages public list,
 * /api/pages/slug, /api/products) already ignores it; the dashboard page lists
 * and /api/pages filter it out explicitly, and save-draft / publish refuse it.
 * The texts live in `meta.catalogueIntros`. The row is created on first save.
 *
 * Pure (no DB) so it can be unit-tested; DB access is in catalogueIntrosStore.ts.
 */

import type { Locale } from '../i18n/config';
import { CATALOGUE_TERMS, termBySlug } from './catalogueSlugs';

export const CATALOGUE_INTROS_SLUG = '_catalogue-intros';
export const CATALOGUE_INTROS_TITLE = 'Catalogue intros (reserved — never public)';

/** Max characters per intro (one or two short paragraphs). */
export const INTRO_MAX_LENGTH = 1500;

export type IntroFacet = 'famille' | 'culture';
export const INTRO_FACETS: readonly IntroFacet[] = ['famille', 'culture'];

export type IntroText = { fr: string; en: string };
export type CatalogueIntros = Record<IntroFacet, Record<string, IntroText>>;

/** Reserved (never public, never listed) page slugs. */
export function isReservedPageSlug(slug: string): boolean {
  return slug.startsWith('_');
}

/** SQL LIKE pattern of reserved slugs (escaped "_"), for `notLike(pages.slug, …)`. */
export const RESERVED_SLUG_LIKE = '\\_%';

function text(v: unknown): string {
  return typeof v === 'string' ? v.replace(/\r\n/g, '\n').trim().slice(0, INTRO_MAX_LENGTH) : '';
}

/**
 * Keep only known facets / slugs and string texts (trimmed, capped). Always
 * returns every famille and culture slug, with '' when there is no text.
 */
export function sanitizeIntros(raw: unknown): CatalogueIntros {
  const src = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const out = { famille: {}, culture: {} } as CatalogueIntros;
  INTRO_FACETS.forEach((facet) => {
    const byFacet = (src[facet] && typeof src[facet] === 'object' ? src[facet] : {}) as Record<string, unknown>;
    CATALOGUE_TERMS[facet].forEach((term) => {
      const entry = (byFacet[term.slug] && typeof byFacet[term.slug] === 'object'
        ? byFacet[term.slug]
        : {}) as Record<string, unknown>;
      out[facet][term.slug] = { fr: text(entry.fr), en: text(entry.en) };
    });
  });
  return out;
}

/** Intro for one facet value in one locale; '' when none (→ no paragraph). */
export function introFor(
  intros: CatalogueIntros,
  facet: IntroFacet,
  slug: string,
  locale: Locale
): string {
  if (!termBySlug(facet, slug)) return '';
  return intros[facet]?.[slug]?.[locale] ?? '';
}

/** Paragraphs of an intro (blank-line separated). Plain text, never HTML. */
export function introParagraphs(intro: string): string[] {
  return intro
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}
