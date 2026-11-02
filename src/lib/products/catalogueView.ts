/**
 * Server-side shaping of the "Trouver une solution" data for one locale:
 * product cards (localized name, canonical link, facet slugs, search text)
 * and the filter options (labels from the frozen slug map).
 *
 * Pure (no DB / React / Next) so it can be unit-tested with tsx.
 */

import type { Locale } from '../i18n/config';
import { publicPathForPage } from './productUrl';
import { foldKey } from './foldKey';
import {
  CATALOGUE_FACETS,
  CATALOGUE_TERMS,
  termLabel,
  type CatalogueFacet,
} from './catalogueSlugs';
import { matchesCatalogueFilters, type CatalogueFilters, type FacetSlugs } from './catalogueFilter';
import type { ProductFilterItem } from './productMeta';

export interface CatalogueCard {
  id: string;
  name: string;
  href: string | null;
  image: string | null;
  facetSlugs: FacetSlugs;
  searchText: string;
}

export interface CatalogueOption {
  slug: string;
  label: string;
}

function labelsFor(facet: CatalogueFacet, slugs: string[], locale: Locale): string[] {
  return CATALOGUE_TERMS[facet].filter((t) => slugs.includes(t.slug)).map((t) => termLabel(t, locale));
}

/** Cards for a locale: EN name = EN Product Hero title when present (PUB-4). */
export function catalogueCards(items: ProductFilterItem[], locale: Locale): CatalogueCard[] {
  const cards = items.map((item) => {
    const name = (locale === 'en' && item.nameEn) || item.name;
    const labels = CATALOGUE_FACETS.flatMap((f) => labelsFor(f, item.facetSlugs[f], locale));
    return {
      id: item.id,
      name,
      href: item.pathSlug ? publicPathForPage(locale, item.pathSlug) : null,
      image: item.image,
      facetSlugs: item.facetSlugs,
      searchText: foldKey([name, item.name, ...labels].join(' ')),
    };
  });
  const collator = locale === 'en' ? 'en' : 'fr';
  return cards.sort((a, b) => a.name.localeCompare(b.name, collator, { sensitivity: 'base' }));
}

/**
 * Filter options per facet: values present on at least one product (as
 * before), plus the selected value so the dropdown can always show it.
 * Sorted by the locale's label.
 */
export function catalogueOptions(
  items: ProductFilterItem[],
  locale: Locale,
  selected: CatalogueFilters = {}
): Record<CatalogueFacet, CatalogueOption[]> {
  const out = {} as Record<CatalogueFacet, CatalogueOption[]>;
  CATALOGUE_FACETS.forEach((facet) => {
    const present = new Set<string>();
    items.forEach((i) => i.facetSlugs[facet].forEach((s) => present.add(s)));
    const sel = selected[facet];
    if (sel) present.add(sel);
    out[facet] = CATALOGUE_TERMS[facet]
      .filter((t) => present.has(t.slug))
      .map((t) => ({ slug: t.slug, label: termLabel(t, locale) }))
      .sort((a, b) => a.label.localeCompare(b.label, locale));
  });
  return out;
}

/** Cards matching the filters (what the server HTML lists). */
export function filterCards(cards: CatalogueCard[], filters: CatalogueFilters): CatalogueCard[] {
  return cards.filter((c) => matchesCatalogueFilters(c.facetSlugs, filters));
}
