/**
 * PROVISIONAL famille → URL slug map, used only by the product BreadcrumbList
 * (JSON-LD) to link a family to /{locale}/trouver-une-solution?famille=<slug>.
 *
 * TODO(Phase 5.1): replace with the frozen {slug, fr, en} facet map (and EN
 * labels). The slugs below are the 5 family slugs the client supplied, which
 * equal a naive slugify of the FR labels in FAMILLES (productMeta.ts).
 */

import { foldKey } from './productMeta';

const FAMILLE_SLUGS: Record<string, string> = {
  'Biostimulants et engrais organiques': 'biostimulants-et-engrais-organiques',
  'Correcteurs de carences': 'correcteurs-de-carences',
  'Adjuvants et régulateurs de pH': 'adjuvants-et-regulateurs-de-ph',
  'Engrais nutritionnels': 'engrais-nutritionnels',
  'Engrais conventionnels': 'engrais-conventionnels',
};

const BY_KEY = new Map(Object.entries(FAMILLE_SLUGS).map(([label, slug]) => [foldKey(label), slug]));

/** Slug for a famille label (case/accent-insensitive); null when unknown. */
export function familleSlug(label: string): string | null {
  return BY_KEY.get(foldKey(label)) ?? null;
}
