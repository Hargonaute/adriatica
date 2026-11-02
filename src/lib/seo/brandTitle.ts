/**
 * Brand-once page titles (A6).
 *
 * The root title template (`src/app/_shell/rootMetadata.ts`) appends
 * BRAND_SUFFIX to every page title. Titles that already mention the brand
 * (e.g. "Atrium Cu — Adriatica", "Maghreb Adriatica") must not get it a
 * second time, so they are returned as `{ absolute }`, which bypasses the
 * template.
 *
 * Kept dependency-free (no `next` import) so it can be unit-tested with tsx.
 */

export const BRAND = 'Adriatica';
/** Must match `title.template` in src/app/_shell/rootMetadata.ts ("%s | Adriatica"). */
export const BRAND_SUFFIX = ` | ${BRAND}`;

const BRAND_RE = new RegExp(`\\b${BRAND}\\b`, 'i');

export type BrandedTitle = string | { absolute: string };

/** True when the title already names the brand, so the template must not append it. */
export function hasBrand(title: string): boolean {
  return BRAND_RE.test(title);
}

/**
 * Value for `Metadata.title`: a plain string (the template appends
 * " | Adriatica") or `{ absolute }` when the brand is already present.
 * Empty / missing titles return undefined so the parent default applies.
 */
export function brandTitle(title: string | null | undefined): BrandedTitle | undefined {
  const t = (title ?? '').trim();
  if (!t) return undefined;
  return hasBrand(t) ? { absolute: t } : t;
}

/** The final <title> text Next renders for `brandTitle(title)` (used by tests). */
export function renderedTitle(title: string | null | undefined): string | undefined {
  const v = brandTitle(title);
  if (v === undefined) return undefined;
  return typeof v === 'string' ? `${v}${BRAND_SUFFIX}` : v.absolute;
}
