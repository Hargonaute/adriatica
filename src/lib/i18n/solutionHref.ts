import type { Locale } from './config';
import { pathForKey } from './pageSlugs';
import {
  catalogueQuery,
  normalizeCatalogueParams,
  type CatalogueFilters,
} from '../products/catalogueFilter';

/**
 * THE link to the filtered catalogue ("Trouver une solution" page):
 *   catalogueHref('fr', { famille: 'correcteurs-de-carences' })
 *     → /fr/trouver-une-solution?famille=correcteurs-de-carences
 *   catalogueHref('en', { culture: 'tomate' }) → /en/find-a-solution?culture=tomate
 *
 * The page path comes from pathForKey('solution', locale) (single place for the
 * EN slug). Filters are passed through the frozen slug map: unknown slugs are
 * dropped and parameters are in canonical order, so the link never triggers
 * the page's 308.
 */
export function catalogueHref(locale: Locale, filters: CatalogueFilters = {}): string {
  const { query } = normalizeCatalogueParams(new URLSearchParams(catalogueQuery(filters)));
  const base = pathForKey('solution', locale);
  return query ? `${base}?${query}` : base;
}

/**
 * Link from a query string written in content JSON (the /produits tiles),
 * e.g. "famille=correcteurs-de-carences". Normalised through the slug map like
 * catalogueHref. Returns undefined when the query is empty or names no known
 * filter (tile without link).
 */
export function solutionFilterHref(locale: Locale, filterQuery?: string): string | undefined {
  const q = (filterQuery ?? '').replace(/^\?/, '').trim();
  if (!q) return undefined;
  const { filters, query } = normalizeCatalogueParams(new URLSearchParams(q));
  return query ? catalogueHref(locale, filters) : undefined;
}
