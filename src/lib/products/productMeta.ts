/**
 * Product filter metadata — shared by the page editor, the /api/products
 * route, the "Trouver une solution" filter and the catalogue import script.
 *
 * Products are page-builder pages (slug `produit-<slug>`); their filter
 * metadata lives in `pages.meta.product` (see ProductFilterMeta in types.ts).
 * No DB schema change: `meta` is an existing jsonb column.
 *
 * Pure functions only (no DB / React) so they can be unit-tested with tsx.
 */

import type { ProductFilterMeta } from '@/types';
import { foldKey } from './foldKey';
import { CATALOGUE_FACETS, slugForLabel, type CatalogueFacet } from './catalogueSlugs';

export { foldKey };

export const PRODUCT_PAGE_PREFIX = 'produit-';

// ── Canonical values (from Catalogue 2026) ────────────────────────────────────
// Used as editor options and as the display label for any value that folds to
// the same key (so "BOOSTERS POTASSIQUES" and "Boosters potassiques" merge).

export const FAMILLES = [
  'Biostimulants et engrais organiques',
  'Correcteurs de carences',
  'Adjuvants et régulateurs de pH',
  'Engrais nutritionnels',
  'Engrais conventionnels',
  // B8: was a problématique; products still tagged that way are read as this
  // famille (see publicProductFacets) until scripts/reclassify-npk.ts runs.
  'NPK hydrosolubles',
] as const;

export const PROBLEMATIQUES = [
  'Stimulation de racines, croissance végétative & anti-stress',
  'Anti-stress & résistance aux conditions difficiles',
  'Amélioration du sol (structure – MO – microbiologie) & anti-stress',
  'Correcteurs de carences en fer',
  'Correcteurs de carences en bore',
  'Correcteurs de carences en cuivre',
  'Correcteur de carence en zinc',
  'Correcteur de carence en molybdène',
  'Correcteur de carence en calcium',
  'Correcteur complet d’oligo-éléments (B, Cu, Fe, Mn, Mo, Zn)',
  'Régulateurs de pH & conditionneurs de bouillie',
  'Acidifiants & correcteurs de pH',
  'Boosters potassiques',
  'Floraison – nouaison – amélioration des fruits',
  'Troubles physiologiques des plantes',
  'Désalinisant & solutions calcio-potassiques',
  'Conventionnel granulé',
  'Conventionnel hydrosolubles',
] as const;

export const CULTURES = [
  'Agrumes',
  'Arbres fruitiers',
  'Bananier',
  'Céréales',
  'Fraisier',
  'Hydroponie',
  'Maraîchage',
  'Olivier',
  'Ornementales',
  'Pomme de terre',
  'Tomate',
  'Vigne',
] as const;

// ── Normalisation ─────────────────────────────────────────────────────────────

function buildCanonicalMap(values: readonly string[]): Map<string, string> {
  const map = new Map<string, string>();
  values.forEach((v) => map.set(foldKey(v), v));
  return map;
}

const CANONICAL = {
  famille: buildCanonicalMap(FAMILLES),
  problematique: buildCanonicalMap(PROBLEMATIQUES),
  culture: buildCanonicalMap(CULTURES),
};

export type ProductFacet = keyof typeof CANONICAL;

/** Trim + map to the canonical label when known; unknown values are kept as typed. */
export function canonicalValue(facet: ProductFacet, raw: string): string {
  const trimmed = raw.replace(/\s+/g, ' ').trim();
  if (!trimmed) return '';
  return CANONICAL[facet].get(foldKey(trimmed)) ?? trimmed;
}

/** Split "Vigne · Olivier" / "Vigne, Olivier" style lists. */
export function splitList(raw: string): string[] {
  return raw
    .split(/[·•,;\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Canonicalise + de-duplicate (by fold key), preserving first-seen order. */
export function normalizeValues(facet: ProductFacet, values: unknown): string[] {
  if (!Array.isArray(values)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  values.forEach((v) => {
    if (typeof v !== 'string') return;
    const c = canonicalValue(facet, v);
    const k = foldKey(c);
    if (!c || seen.has(k)) return;
    seen.add(k);
    out.push(c);
  });
  return out;
}

/**
 * Read `meta.product` defensively (it is user/DB data). Returns null when the
 * page carries no usable filter metadata at all.
 */
export function readProductMeta(meta: unknown): ProductFilterMeta | null {
  if (!meta || typeof meta !== 'object') return null;
  const product = (meta as { product?: unknown }).product;
  if (!product || typeof product !== 'object') return null;
  const p = product as Record<string, unknown>;
  const famille = typeof p.famille === 'string' ? canonicalValue('famille', p.famille) : '';
  const problematiques = normalizeValues('problematique', p.problematiques);
  const cultures = normalizeValues('culture', p.cultures);
  if (!famille && problematiques.length === 0 && cultures.length === 0) return null;
  return {
    ...(famille ? { famille } : {}),
    problematiques,
    cultures,
  };
}

/**
 * B8 compatibility bridge (read path only, until scripts/reclassify-npk.ts has
 * run): "NPK hydrosolubles" used to be a problématique of products whose
 * famille is "Engrais conventionnels". It is now a famille. A product still
 * carrying the old problématique is read as famille "NPK hydrosolubles" and
 * the problématique is dropped. Once the data is reclassified this is a no-op.
 */
export const NPK_FAMILLE = 'NPK hydrosolubles';
const NPK_KEY = foldKey(NPK_FAMILLE);

/** readProductMeta + the B8 bridge: the facet values shown publicly. */
export function publicProductFacets(meta: unknown): ProductFilterMeta | null {
  const pm = readProductMeta(meta);
  if (!pm) return null;
  const problematiques = pm.problematiques ?? [];
  if (!problematiques.some((p) => foldKey(p) === NPK_KEY)) return pm;
  return {
    ...pm,
    famille: NPK_FAMILLE,
    problematiques: problematiques.filter((p) => foldKey(p) !== NPK_KEY),
  };
}

/**
 * Validation for imported metadata (editor "Import JSON", B8): every value of
 * `meta.product` must be one of the editor options. Returns human-readable
 * problems; [] = valid. Saving a page never runs this (a malformed value must
 * not block a save; readers sanitise via readProductMeta).
 */
export function productMetaProblems(product: unknown): string[] {
  if (product === undefined) return [];
  if (!product || typeof product !== 'object' || Array.isArray(product)) {
    return ['meta.product must be an object { famille, problematiques, cultures }'];
  }
  const p = product as Record<string, unknown>;
  const problems: string[] = [];
  const known = (facet: ProductFacet, v: string) => CANONICAL[facet].has(foldKey(v));
  if (p.famille !== undefined && p.famille !== '') {
    if (typeof p.famille !== 'string') problems.push('famille must be a string');
    else if (!known('famille', p.famille)) problems.push(`unknown famille "${p.famille}"`);
  }
  const lists: [string, ProductFacet][] = [
    ['problematiques', 'problematique'],
    ['cultures', 'culture'],
  ];
  lists.forEach(([key, facet]) => {
    const v = p[key];
    if (v === undefined) return;
    if (!Array.isArray(v)) {
      problems.push(`${key} must be a list`);
      return;
    }
    v.forEach((x) => {
      if (typeof x !== 'string') problems.push(`${key}: every value must be a string`);
      else if (facet === 'problematique' && foldKey(x) === NPK_KEY)
        problems.push(`"${x}" is now a famille, not a problématique: use "famille": "${NPK_FAMILLE}"`);
      else if (!known(facet, x)) problems.push(`unknown ${facet} "${x}"`);
    });
  });
  return problems;
}

// ── Filter items ──────────────────────────────────────────────────────────────

/** One card in the "Trouver une solution" filter. */
export interface ProductFilterItem {
  id: string;
  name: string;
  /** Path without locale, e.g. "produit-atrium-root"; null → card without link. */
  pathSlug: string | null;
  image: string | null;
  familles: string[];
  problematiques: string[];
  cultures: string[];
  /** Where the filter values came from (debug / admin visibility). */
  source: 'page' | 'collection';
  /** EN Product Hero title of the page, when it has one (PUB-4). */
  nameEn?: string;
  /**
   * URL slugs of the values above (frozen map, catalogueSlugs.ts); values that
   * map to no slug are left out here (they stay in the label arrays).
   */
  facetSlugs: Record<CatalogueFacet, string[]>;
}

function slugsOf(facet: CatalogueFacet, labels: string[]): string[] {
  const out: string[] = [];
  labels.forEach((l) => {
    const s = slugForLabel(facet, l);
    if (s && !out.includes(s)) out.push(s);
  });
  return out;
}

/** facetSlugs for an item's label arrays. */
export function facetSlugsOf(item: Pick<ProductFilterItem, 'familles' | 'cultures' | 'problematiques'>): Record<CatalogueFacet, string[]> {
  const labels: Record<CatalogueFacet, string[]> = {
    famille: item.familles,
    culture: item.cultures,
    probleme: item.problematiques,
  };
  const out = {} as Record<CatalogueFacet, string[]>;
  CATALOGUE_FACETS.forEach((f) => {
    out[f] = slugsOf(f, labels[f]);
  });
  return out;
}

export interface ProductPageInput {
  id: string;
  slug: string; // full DB slug, "produit-…"
  title: string;
  meta: unknown;
  /** published_blocks.fr — used for name / image fallback. */
  blocks: unknown;
  /** published_blocks.en — EN name (Product Hero title), optional. */
  blocksEn?: unknown;
}

export interface LegacyEntryInput {
  id: string;
  slug: string | null;
  name: string;
  image: string;
  culture: string;
  problematique: string;
}

/** First product-hero (or image) in a block list: title + image fallback. */
export function heroFromBlocks(blocks: unknown): { title: string; image: string } {
  if (!Array.isArray(blocks)) return { title: '', image: '' };
  let title = '';
  let image = '';
  for (const b of blocks) {
    if (!b || typeof b !== 'object') continue;
    const { type, data } = b as { type?: string; data?: Record<string, unknown> };
    if (!data) continue;
    if (type === 'product-hero') {
      if (!title && typeof data.title === 'string') title = data.title.replace(/<[^>]*>/g, '').trim();
      if (!image && typeof data.image === 'string') image = data.image.trim();
    } else if (type === 'image' && !image && typeof data.url === 'string') {
      image = data.url.trim();
    }
    if (title && image) break;
  }
  return { title, image };
}

/**
 * Merge product pages and the legacy `produit` collection into filter items.
 *
 * Backwards-compatibility rules (nothing that shows today may disappear):
 *  - Every published legacy entry still produces exactly one card, linking to
 *    `produit-<entry.slug>` as before (or unlinked when it has no slug).
 *  - If a product page exists for that entry AND carries `meta.product`, the
 *    page metadata replaces the entry's culture / problématique values.
 *  - If no page has the entry's slug, a tagged page with the exact same image
 *    is used instead (link + metadata), so the product isn't listed twice.
 *  - A product page with `meta.product` but no legacy entry is added.
 *  - A product page with neither is left out (same as today).
 */
export function buildProductFilterItems(
  pages: ProductPageInput[],
  legacyEntries: LegacyEntryInput[]
): ProductFilterItem[] {
  const pageBySlug = new Map<string, ProductPageInput>();
  pages.forEach((p) => pageBySlug.set(p.slug, p));

  // Fallback match when the entry slug has no page: same image URL as a tagged
  // page (e.g. six "IDRON" entries all slugged `idron` vs the real pages
  // `produit-idron-npk-…`). Blob URLs are unique per upload, so this is exact.
  const taggedPageByImage = new Map<string, ProductPageInput>();
  pages.forEach((p) => {
    if (!readProductMeta(p.meta)) return;
    const img = heroFromBlocks(p.blocks).image;
    if (img && !taggedPageByImage.has(img)) taggedPageByImage.set(img, p);
  });

  const items: Omit<ProductFilterItem, 'facetSlugs'>[] = [];
  const usedPageSlugs = new Set<string>();

  legacyEntries.forEach((e) => {
    // Entries without a slug have no product page: keep the unlinked card.
    const legacySlug = e.slug ? `${PRODUCT_PAGE_PREFIX}${e.slug}` : null;
    const slugPage = legacySlug ? pageBySlug.get(legacySlug) : undefined;
    const imagePage =
      !slugPage && e.image ? taggedPageByImage.get(e.image) : undefined;
    // Two entries can't claim the same page: a second match keeps its old card.
    const page = slugPage ?? (imagePage && !usedPageSlugs.has(imagePage.slug) ? imagePage : undefined);
    const pm = page ? publicProductFacets(page.meta) : null;
    if (page) usedPageSlugs.add(page.slug);
    const hero = page ? heroFromBlocks(page.blocks) : { title: '', image: '' };
    const matchedByImage = !!page && page !== slugPage;
    const nameEn = page ? heroFromBlocks(page.blocksEn).title : '';

    items.push({
      id: e.id,
      // Image-matched entries carry a generic name ("IDRON"); the page title is specific.
      name: (matchedByImage ? hero.title || page.title : '') || e.name || hero.title || page?.title || '',
      pathSlug: matchedByImage ? page.slug : legacySlug,
      image: e.image || hero.image || null,
      familles: pm?.famille ? [pm.famille] : [],
      problematiques: pm
        ? pm.problematiques ?? []
        : normalizeValues('problematique', [e.problematique]),
      cultures: pm ? pm.cultures ?? [] : normalizeValues('culture', [e.culture]),
      source: pm ? 'page' : 'collection',
      ...(nameEn ? { nameEn } : {}),
    });
  });

  pages.forEach((p) => {
    if (usedPageSlugs.has(p.slug)) return;
    const pm = publicProductFacets(p.meta);
    if (!pm) return;
    const hero = heroFromBlocks(p.blocks);
    const nameEn = heroFromBlocks(p.blocksEn).title;
    items.push({
      id: p.id,
      name: hero.title || p.title,
      pathSlug: p.slug,
      image: hero.image || null,
      familles: pm.famille ? [pm.famille] : [],
      problematiques: pm.problematiques ?? [],
      cultures: pm.cultures ?? [],
      source: 'page',
      ...(nameEn ? { nameEn } : {}),
    });
  });

  return items
    .map((i) => ({ ...i, facetSlugs: facetSlugsOf(i) }))
    .sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }));
}

// ── Client-side filtering ─────────────────────────────────────────────────────

export interface ProductFilterState {
  culture: string | null;
  famille: string | null;
  problematique: string | null;
  search: string;
}

function hasValue(values: string[], wanted: string | null): boolean {
  if (!wanted) return true;
  const k = foldKey(wanted);
  return values.some((v) => foldKey(v) === k);
}

export function matchesFilters(item: ProductFilterItem, f: ProductFilterState): boolean {
  if (!hasValue(item.cultures, f.culture)) return false;
  if (!hasValue(item.familles, f.famille)) return false;
  if (!hasValue(item.problematiques, f.problematique)) return false;
  const q = foldKey(f.search);
  if (q) {
    const haystack = foldKey([item.name, ...item.familles, ...item.problematiques].join(' '));
    if (!haystack.includes(q)) return false;
  }
  return true;
}

/** Distinct values present in the items, sorted (French collation). */
export function facetOptions(
  items: ProductFilterItem[],
  facet: 'cultures' | 'familles' | 'problematiques'
): string[] {
  const byKey = new Map<string, string>();
  items.forEach((i) =>
    i[facet].forEach((v) => {
      const k = foldKey(v);
      if (!byKey.has(k)) byKey.set(k, v);
    })
  );
  return Array.from(byKey.values()).sort((a, b) => a.localeCompare(b, 'fr'));
}
