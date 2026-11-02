/**
 * "Trouver une solution" URL parameters (Lot B): parsing, canonical form,
 * SEO rules per combination, and slug-based filtering.
 *
 *   ?famille=<slug>&culture=<slug>&probleme=<slug>
 *
 * One value per parameter; slugs come from the frozen map (catalogueSlugs.ts)
 * and are identical in FR and EN. The canonical URL keeps only known
 * parameters with known slugs, in the order famille, culture, probleme. Any
 * other request URL is 308-redirected to the canonical one by the page.
 *
 * Pure (no DB / React / Next) so it can be unit-tested with tsx.
 */

import {
  CATALOGUE_FACETS,
  MOVED_SLUGS,
  isCatalogueFacet,
  termBySlug,
  type CatalogueFacet,
  type CatalogueTerm,
} from './catalogueSlugs';

/** Selected slug per facet (absent = no filter). */
export type CatalogueFilters = Partial<Record<CatalogueFacet, string>>;

/** Next.js `searchParams` shape. */
export type RawSearchParams = Record<string, string | string[] | undefined>;

function entriesOf(raw: RawSearchParams | URLSearchParams): [string, string][] {
  if (raw instanceof URLSearchParams) return Array.from(raw.entries());
  const out: [string, string][] = [];
  Object.keys(raw).forEach((k) => {
    const v = raw[k];
    if (Array.isArray(v)) v.forEach((x) => out.push([k, x]));
    else if (typeof v === 'string') out.push([k, v]);
  });
  return out;
}

/** Canonical query string (without "?") for a set of filters; '' when none. */
export function catalogueQuery(filters: CatalogueFilters): string {
  const params = new URLSearchParams();
  CATALOGUE_FACETS.forEach((f) => {
    const slug = filters[f];
    if (slug) params.set(f, slug);
  });
  return params.toString();
}

export interface NormalizedCatalogueParams {
  filters: CatalogueFilters;
  /** Canonical query string without "?" ('' = no filter). */
  query: string;
  /** True when the request query differs from the canonical one (→ 308). */
  changed: boolean;
}

/**
 * Clean a request's query:
 *  - unknown parameters and unknown slugs are dropped;
 *  - a repeated parameter keeps its first known value;
 *  - retired slugs move to their new facet (?probleme=npk-hydrosolubles →
 *    ?famille=npk-hydrosolubles) unless that facet is already set explicitly;
 *  - parameters are put in canonical order.
 */
export function normalizeCatalogueParams(raw: RawSearchParams | URLSearchParams): NormalizedCatalogueParams {
  const entries = entriesOf(raw);
  const filters: CatalogueFilters = {};
  const moved: { facet: CatalogueFacet; slug: string }[] = [];

  entries.forEach(([key, value]) => {
    if (!isCatalogueFacet(key) || filters[key]) return;
    const slug = value.trim();
    const move = MOVED_SLUGS.find((m) => m.from.facet === key && m.from.slug === slug);
    if (move) {
      moved.push(move.to);
      return;
    }
    if (termBySlug(key, slug)) filters[key] = slug;
  });
  // Explicit parameters win over a moved one (applied second).
  moved.forEach((to) => {
    if (!filters[to.facet] && termBySlug(to.facet, to.slug)) filters[to.facet] = to.slug;
  });

  const query = catalogueQuery(filters);
  const original = new URLSearchParams(entries).toString();
  return { filters, query, changed: original !== query };
}

// ── SEO per combination (B4) ─────────────────────────────────────────────────

export interface CatalogueSeo {
  /** Robots index (follow is always on). */
  index: boolean;
  /** Canonical query ('' = the page without parameters). */
  canonicalQuery: string;
  /** Listed in the sitemap. */
  inSitemap: boolean;
  /** The single selected facet, when exactly one parameter is set. */
  single: { facet: CatalogueFacet; term: CatalogueTerm } | null;
}

/**
 *   no parameter               → index, canonical self, in sitemap
 *   one famille or one culture → index, canonical self, in sitemap
 *   one probleme               → index, canonical self, NOT in sitemap
 *   two or more parameters     → noindex,follow, canonical = page without params
 */
export function catalogueSeo(filters: CatalogueFilters): CatalogueSeo {
  const set = CATALOGUE_FACETS.filter((f) => filters[f]);
  if (set.length === 0) return { index: true, canonicalQuery: '', inSitemap: true, single: null };
  if (set.length > 1) return { index: false, canonicalQuery: '', inSitemap: false, single: null };
  const facet = set[0];
  const term = termBySlug(facet, filters[facet]!);
  if (!term) return { index: false, canonicalQuery: '', inSitemap: false, single: null };
  return {
    index: true,
    canonicalQuery: catalogueQuery(filters),
    inSitemap: facet !== 'probleme',
    single: { facet, term },
  };
}

// ── Filtering by slug ────────────────────────────────────────────────────────

/** Facet slugs of one product (see ProductFilterItem.facetSlugs). */
export type FacetSlugs = Record<CatalogueFacet, string[]>;

export function matchesCatalogueFilters(slugs: FacetSlugs, filters: CatalogueFilters): boolean {
  return CATALOGUE_FACETS.every((f) => {
    const wanted = filters[f];
    return !wanted || slugs[f].includes(wanted);
  });
}
