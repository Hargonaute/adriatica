/**
 * FROZEN catalogue slug map (Lot B, B6): famille / culture / problématique
 * → URL slug + FR and EN display labels.
 *
 * These slugs are public URLs (/fr/trouver-une-solution?famille=<slug>, the
 * /produits tiles, the sitemap, BreadcrumbList JSON-LD, old-site redirects).
 * They are written out by hand on purpose: NEVER derive a slug from a label at
 * runtime, and never change or remove an existing slug. A typo fix in a label
 * must not change a URL. src/__tests__/catalogue-slugs.test.ts snapshots every
 * slug and fails if one changes.
 *
 * Products still store FR LABELS in pages.meta.product; a stored label is
 * matched to its entry with foldKey() (case, accents, ’/', –/- insensitive).
 *
 * The URL parameter names equal the facet names: famille, culture, probleme
 * (same in FR and EN). Canonical parameter order = CATALOGUE_FACETS order.
 *
 * Pure (no DB / React / Next) so it can be unit-tested with tsx and imported by
 * client components.
 */

import type { Locale } from '../i18n/config';
import { foldKey } from './foldKey';

export type CatalogueFacet = 'famille' | 'culture' | 'probleme';

/** Canonical query-parameter order. */
export const CATALOGUE_FACETS: readonly CatalogueFacet[] = ['famille', 'culture', 'probleme'];

export interface CatalogueTerm {
  slug: string;
  fr: string;
  en: string;
}

/**
 * TODO-CLIENT: every EN label below is our translation and must be validated
 * by Adriatica, EXCEPT "Water-soluble NPK" (given by the client). FR labels are
 * the exact values stored on product pages (productMeta.ts FAMILLES / CULTURES
 * / PROBLEMATIQUES). Changing a label is safe; changing a slug is not.
 */
export const EN_LABELS_PENDING_CLIENT_VALIDATION = true;

const FAMILLE_TERMS: readonly CatalogueTerm[] = [
  { slug: 'biostimulants-et-engrais-organiques', fr: 'Biostimulants et engrais organiques', en: 'Biostimulants and organic fertilizers' },
  { slug: 'correcteurs-de-carences', fr: 'Correcteurs de carences', en: 'Deficiency correctors' },
  { slug: 'adjuvants-et-regulateurs-de-ph', fr: 'Adjuvants et régulateurs de pH', en: 'Adjuvants and pH regulators' },
  { slug: 'engrais-nutritionnels', fr: 'Engrais nutritionnels', en: 'Nutritional fertilizers' },
  { slug: 'engrais-conventionnels', fr: 'Engrais conventionnels', en: 'Conventional fertilizers' },
  // EN label given by the client.
  { slug: 'npk-hydrosolubles', fr: 'NPK hydrosolubles', en: 'Water-soluble NPK' },
];

const CULTURE_TERMS: readonly CatalogueTerm[] = [
  { slug: 'agrumes', fr: 'Agrumes', en: 'Citrus' },
  { slug: 'arbres-fruitiers', fr: 'Arbres fruitiers', en: 'Fruit trees' },
  { slug: 'bananier', fr: 'Bananier', en: 'Banana' },
  { slug: 'cereales', fr: 'Céréales', en: 'Cereals' },
  { slug: 'fraisier', fr: 'Fraisier', en: 'Strawberry' },
  { slug: 'hydroponie', fr: 'Hydroponie', en: 'Hydroponics' },
  { slug: 'maraichage', fr: 'Maraîchage', en: 'Vegetable crops' },
  { slug: 'olivier', fr: 'Olivier', en: 'Olive' },
  { slug: 'ornementales', fr: 'Ornementales', en: 'Ornamentals' },
  { slug: 'pomme-de-terre', fr: 'Pomme de terre', en: 'Potato' },
  { slug: 'tomate', fr: 'Tomate', en: 'Tomato' },
  { slug: 'vigne', fr: 'Vigne', en: 'Grapevine' },
];

const PROBLEME_TERMS: readonly CatalogueTerm[] = [
  {
    slug: 'stimulation-de-racines-croissance-vegetative-anti-stress',
    fr: 'Stimulation de racines, croissance végétative & anti-stress',
    en: 'Root stimulation, vegetative growth & anti-stress',
  },
  {
    slug: 'anti-stress-resistance-aux-conditions-difficiles',
    fr: 'Anti-stress & résistance aux conditions difficiles',
    en: 'Anti-stress & resistance to difficult conditions',
  },
  {
    slug: 'amelioration-du-sol-structure-mo-microbiologie-anti-stress',
    fr: 'Amélioration du sol (structure – MO – microbiologie) & anti-stress',
    en: 'Soil improvement (structure – organic matter – microbiology) & anti-stress',
  },
  { slug: 'correcteurs-de-carences-en-fer', fr: 'Correcteurs de carences en fer', en: 'Iron deficiency correctors' },
  { slug: 'correcteurs-de-carences-en-bore', fr: 'Correcteurs de carences en bore', en: 'Boron deficiency correctors' },
  { slug: 'correcteurs-de-carences-en-cuivre', fr: 'Correcteurs de carences en cuivre', en: 'Copper deficiency correctors' },
  { slug: 'correcteur-de-carence-en-zinc', fr: 'Correcteur de carence en zinc', en: 'Zinc deficiency corrector' },
  { slug: 'correcteur-de-carence-en-molybdene', fr: 'Correcteur de carence en molybdène', en: 'Molybdenum deficiency corrector' },
  { slug: 'correcteur-de-carence-en-calcium', fr: 'Correcteur de carence en calcium', en: 'Calcium deficiency corrector' },
  {
    slug: 'correcteur-complet-d-oligo-elements-b-cu-fe-mn-mo-zn',
    fr: 'Correcteur complet d’oligo-éléments (B, Cu, Fe, Mn, Mo, Zn)',
    en: 'Complete trace-element corrector (B, Cu, Fe, Mn, Mo, Zn)',
  },
  {
    slug: 'regulateurs-de-ph-conditionneurs-de-bouillie',
    fr: 'Régulateurs de pH & conditionneurs de bouillie',
    en: 'pH regulators & spray-mix conditioners',
  },
  { slug: 'acidifiants-correcteurs-de-ph', fr: 'Acidifiants & correcteurs de pH', en: 'Acidifiers & pH correctors' },
  { slug: 'boosters-potassiques', fr: 'Boosters potassiques', en: 'Potassium boosters' },
  {
    slug: 'floraison-nouaison-amelioration-des-fruits',
    fr: 'Floraison – nouaison – amélioration des fruits',
    en: 'Flowering – fruit set – fruit quality',
  },
  { slug: 'troubles-physiologiques-des-plantes', fr: 'Troubles physiologiques des plantes', en: 'Plant physiological disorders' },
  {
    slug: 'desalinisant-solutions-calcio-potassiques',
    fr: 'Désalinisant & solutions calcio-potassiques',
    en: 'Desalinizer & calcium-potassium solutions',
  },
  { slug: 'conventionnel-granule', fr: 'Conventionnel granulé', en: 'Conventional granular' },
  { slug: 'conventionnel-hydrosolubles', fr: 'Conventionnel hydrosolubles', en: 'Conventional water-soluble' },
];

export const CATALOGUE_TERMS: Readonly<Record<CatalogueFacet, readonly CatalogueTerm[]>> = {
  famille: FAMILLE_TERMS,
  culture: CULTURE_TERMS,
  probleme: PROBLEME_TERMS,
};

/**
 * Retired slugs that still arrive in URLs, mapped to their new place
 * (308 in the find-a-solution page). B8: "NPK hydrosolubles" moved from
 * problématique to famille.
 */
export const MOVED_SLUGS: readonly { from: { facet: CatalogueFacet; slug: string }; to: { facet: CatalogueFacet; slug: string } }[] = [
  { from: { facet: 'probleme', slug: 'npk-hydrosolubles' }, to: { facet: 'famille', slug: 'npk-hydrosolubles' } },
];

const BY_SLUG: Record<CatalogueFacet, Map<string, CatalogueTerm>> = {
  famille: new Map(FAMILLE_TERMS.map((t) => [t.slug, t])),
  culture: new Map(CULTURE_TERMS.map((t) => [t.slug, t])),
  probleme: new Map(PROBLEME_TERMS.map((t) => [t.slug, t])),
};

const BY_LABEL: Record<CatalogueFacet, Map<string, CatalogueTerm>> = {
  famille: new Map(FAMILLE_TERMS.map((t) => [foldKey(t.fr), t])),
  culture: new Map(CULTURE_TERMS.map((t) => [foldKey(t.fr), t])),
  probleme: new Map(PROBLEME_TERMS.map((t) => [foldKey(t.fr), t])),
};

export function isCatalogueFacet(value: string): value is CatalogueFacet {
  return (CATALOGUE_FACETS as readonly string[]).includes(value);
}

/** Entry for a URL slug (exact match); null when unknown. */
export function termBySlug(facet: CatalogueFacet, slug: string): CatalogueTerm | null {
  return BY_SLUG[facet].get(slug) ?? null;
}

/** Entry for a stored FR label (foldKey match); null when unknown. */
export function termForLabel(facet: CatalogueFacet, label: string): CatalogueTerm | null {
  return BY_LABEL[facet].get(foldKey(label)) ?? null;
}

/** Slug for a stored FR label; null when unknown. */
export function slugForLabel(facet: CatalogueFacet, label: string): string | null {
  return termForLabel(facet, label)?.slug ?? null;
}

/** Display label of an entry in a locale. */
export function termLabel(term: CatalogueTerm, locale: Locale): string {
  return locale === 'en' ? term.en : term.fr;
}
