/**
 * Pure planning step of the catalogue → page metadata import (no DB access),
 * so it can be unit-tested. CLI: tools/product-meta/import.ts.
 */
import { slugify } from '@/lib/slugify';
import {
  CULTURES,
  FAMILLES,
  PROBLEMATIQUES,
  PRODUCT_PAGE_PREFIX,
  canonicalValue,
  foldKey,
  normalizeValues,
  readProductMeta,
  splitList,
} from './productMeta';
import type { ProductFilterMeta } from '@/types';

export interface CatalogueRow {
  produit: string;
  type: string;
  famille: string;
  sousCategorie: string;
  cultures: string;
}

export interface ExistingPage {
  id: string;
  slug: string;
  title: string;
  status: string | null;
  meta: unknown;
}

export interface PlannedUpdate {
  pageId: string;
  slug: string;
  produit: string;
  product: ProductFilterMeta;
}

export interface ImportPlan {
  updates: PlannedUpdate[];
  /** Pages that already have meta.product and were left alone (no --overwrite). */
  skippedExisting: { slug: string; produit: string }[];
  /** Rows with no product page; `suggestions` are near-miss page slugs. */
  noPage: { produit: string; type: string; expectedSlug: string; suggestions: string[] }[];
  /** Two rows resolving to the same page — neither is applied. */
  duplicates: { slug: string; produits: string[] }[];
  /** Product pages that no catalogue row matched. */
  pagesWithoutRow: string[];
  /** Data-quality warnings for rows that will be applied. */
  warnings: { produit: string; message: string }[];
  /** "Autre référence" rows whose Cultures were copied from their main product. */
  inheritedCultures: { produit: string; from: string }[];
}

export function rowToProductMeta(row: CatalogueRow): ProductFilterMeta {
  const famille = canonicalValue('famille', row.famille);
  return {
    ...(famille ? { famille } : {}),
    problematiques: normalizeValues('problematique', [row.sousCategorie]),
    cultures: normalizeValues('culture', splitList(row.cultures)),
  };
}

const CULTURE_PARENT_TYPES = ['produit principal', 'gamme'];
const CULTURE_CHILD_TYPE = 'autre reference';

/**
 * "Autre référence" rows with no Cultures inherit them from the nearest
 * "Produit principal" / "Gamme" row above them in the same sous-catégorie
 * (the catalogue lists alternatives right under their main product).
 * Returns the rows (copies) and which row each inheritance came from.
 */
export function inheritCultures(rows: CatalogueRow[]): {
  rows: CatalogueRow[];
  inherited: { produit: string; from: string }[];
} {
  const inherited: { produit: string; from: string }[] = [];
  let parent: CatalogueRow | null = null;
  const out = rows.map((row) => {
    const type = foldKey(row.type);
    if (CULTURE_PARENT_TYPES.includes(type)) {
      parent = row;
      return row;
    }
    if (
      type === CULTURE_CHILD_TYPE &&
      !row.cultures.trim() &&
      parent &&
      parent.cultures.trim() &&
      foldKey(parent.sousCategorie) === foldKey(row.sousCategorie)
    ) {
      inherited.push({ produit: row.produit, from: parent.produit });
      return { ...row, cultures: parent.cultures };
    }
    return row;
  });
  return { rows: out, inherited };
}

function isKnown(list: readonly string[], value: string): boolean {
  return list.some((v) => foldKey(v) === foldKey(value));
}

export function planImport(
  sourceRows: CatalogueRow[],
  pages: ExistingPage[],
  opts: { overwrite?: boolean; slugOverrides?: Record<string, string | string[]> } = {}
): ImportPlan {
  const overrides = opts.slugOverrides ?? {};
  const { rows, inherited } = inheritCultures(sourceRows);
  const pageBySlug = new Map(pages.map((p) => [p.slug, p]));
  const plan: ImportPlan = {
    updates: [],
    skippedExisting: [],
    noPage: [],
    duplicates: [],
    pagesWithoutRow: [],
    warnings: [],
    inheritedCultures: [],
  };

  // Resolve every row to a target slug first so duplicates can be detected.
  const rowsBySlug = new Map<string, CatalogueRow[]>();
  rows.forEach((row) => {
    if (!row.produit.trim()) return;
    // An override may list several pages (e.g. one "Gamme" row → each variant page).
    const override = overrides[row.produit];
    const slugs = override === undefined
      ? [`${PRODUCT_PAGE_PREFIX}${slugify(row.produit)}`]
      : Array.isArray(override) ? override : [override];
    slugs.forEach((slug) => rowsBySlug.set(slug, [...(rowsBySlug.get(slug) ?? []), row]));
  });

  const matchedSlugs = new Set<string>();

  rowsBySlug.forEach((slugRows, slug) => {
    const page = pageBySlug.get(slug);
    if (!page) {
      slugRows.forEach((row) => {
        const core = slug.slice(PRODUCT_PAGE_PREFIX.length);
        const suggestions = pages
          .map((p) => p.slug)
          .filter((s) => {
            const c = s.slice(PRODUCT_PAGE_PREFIX.length);
            return c.includes(core) || core.includes(c);
          })
          .slice(0, 3);
        plan.noPage.push({ produit: row.produit, type: row.type, expectedSlug: slug, suggestions });
      });
      return;
    }
    matchedSlugs.add(slug);
    if (slugRows.length > 1) {
      plan.duplicates.push({ slug, produits: slugRows.map((r) => r.produit) });
      return;
    }
    const row = slugRows[0];
    if (!opts.overwrite && readProductMeta(page.meta)) {
      plan.skippedExisting.push({ slug, produit: row.produit });
      return;
    }

    const product = rowToProductMeta(row);
    if (!product.famille) plan.warnings.push({ produit: row.produit, message: 'no Famille' });
    else if (!isKnown(FAMILLES, product.famille))
      plan.warnings.push({ produit: row.produit, message: `unknown Famille "${product.famille}"` });
    if (!product.problematiques?.length)
      plan.warnings.push({ produit: row.produit, message: 'no Sous-catégorie (problématique)' });
    product.problematiques?.forEach((p) => {
      if (!isKnown(PROBLEMATIQUES, p))
        plan.warnings.push({ produit: row.produit, message: `unknown problématique "${p}"` });
    });
    if (!product.cultures?.length) plan.warnings.push({ produit: row.produit, message: 'no Cultures' });
    product.cultures?.forEach((c) => {
      if (!isKnown(CULTURES, c))
        plan.warnings.push({ produit: row.produit, message: `unknown culture "${c}"` });
    });

    plan.updates.push({ pageId: page.id, slug, produit: row.produit, product });
  });

  const updated = new Set(plan.updates.map((u) => u.produit));
  plan.inheritedCultures = inherited.filter((i) => updated.has(i.produit));

  plan.pagesWithoutRow = pages
    .map((p) => p.slug)
    .filter((s) => !matchedSlugs.has(s))
    .sort();

  return plan;
}
