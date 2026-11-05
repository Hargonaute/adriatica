/**
 * Public URLs of product pages, and the 308 map from every legacy /
 * non-canonical form to the canonical one.
 *
 * Products are page-builder pages whose DB slug is `produit-<slug>` (that
 * prefix stays the internal convention: filters, catalogue, auto-added
 * blocks). Only the public URL is derived here:
 *
 *   FR  /fr/produit/<slug>
 *   EN  /en/product/<slug>
 *
 * Pure functions only (no DB / React / Next) so they can be unit-tested with tsx
 * and used from the proxy.
 */

import { DEFAULT_LOCALE, LOCALES, isLocale, type Locale } from '../i18n/config';
import { keyForSlug, pathForKey } from '../i18n/pageSlugs';
import { PRODUCT_PAGE_PREFIX } from './productMeta';

/** URL segment of the product detail route, per locale. */
export const PRODUCT_SEGMENT: Record<Locale, string> = { fr: 'produit', en: 'product' };

const PRODUCT_SEGMENTS = new Set(Object.values(PRODUCT_SEGMENT));

/** Slug of the legacy "Produit" collection (served under /{l}/collections/produit/…). */
export const LEGACY_PRODUCT_COLLECTION = 'produit';

/** True when a DB page slug identifies a product page (`produit-<slug>`). */
export function isProductPageSlug(pageSlug: string): boolean {
  return pageSlug.startsWith(PRODUCT_PAGE_PREFIX) && pageSlug.length > PRODUCT_PAGE_PREFIX.length;
}

/** `produit-atrium-cu` → `atrium-cu`; null when the slug is not a product page slug. */
export function productSlugFromPageSlug(pageSlug: string): string | null {
  return isProductPageSlug(pageSlug) ? pageSlug.slice(PRODUCT_PAGE_PREFIX.length) : null;
}

/** `atrium-cu` → `produit-atrium-cu` (the DB slug). */
export function pageSlugForProduct(productSlug: string): string {
  return `${PRODUCT_PAGE_PREFIX}${productSlug}`;
}

/** Canonical public path of a product, from its bare slug (`atrium-cu`). */
export function productPath(locale: Locale, productSlug: string): string {
  return `/${locale}/${PRODUCT_SEGMENT[locale]}/${productSlug}`;
}

/**
 * Canonical public path of any DB page from its DB slug: product pages get the
 * product route, every other page keeps `/{locale}/{slug}`.
 */
export function publicPathForPage(locale: Locale, pageSlug: string): string {
  const productSlug = productSlugFromPageSlug(pageSlug);
  return productSlug ? productPath(locale, productSlug) : `/${locale}/${pageSlug}`;
}

/** Every public path to revalidate after a page is saved / published / removed. */
export function revalidationPathsForPage(pageSlug: string): string[] {
  return LOCALES.map((l) => publicPathForPage(l, pageSlug));
}

/**
 * Map a request path to its canonical path when it is a legacy or
 * non-canonical public URL; null when the path is already canonical (or not
 * ours to handle). The result is always the FINAL URL (one 308 hop, no chain),
 * including for unprefixed paths that would otherwise get the locale redirect
 * first.
 *
 *   /{l}/produit-x                 → product page
 *   /produit-x                     → /fr/produit/x
 *   /fr/product/x, /en/produit/x   → the locale's product segment
 *   /{l}/produit, /{l}/product, /{l}/collections/produit (old empty indexes)
 *                                  → the "Trouver une solution" page
 *   /en/produits, /fr/products …   (static slug of the other locale)
 *                                  → the static page in the requested locale
 *
 * `/{l}/collections/produit/<slug>` needs a DB lookup (does a product page
 * exist?) and is redirected by its route instead.
 */
export function legacyPublicRedirect(pathname: string): string | null {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length === 0) return null;

  const prefixed = isLocale(parts[0]);
  const locale: Locale = prefixed ? (parts[0] as Locale) : DEFAULT_LOCALE;
  const rest = prefixed ? parts.slice(1) : parts;

  if (rest.length === 1) {
    const [seg] = rest;
    const productSlug = productSlugFromPageSlug(seg);
    if (productSlug) return productPath(locale, productSlug);
    if (PRODUCT_SEGMENTS.has(seg)) return pathForKey('solution', locale);
    if (!keyForSlug(seg, locale)) {
      const other = LOCALES.find((l) => l !== locale && keyForSlug(seg, l));
      const key = other ? keyForSlug(seg, other) : null;
      if (key) return pathForKey(key, locale);
    }
    return null;
  }

  if (rest.length === 2) {
    const [seg, slug] = rest;
    if (PRODUCT_SEGMENTS.has(seg)) {
      const target = productPath(locale, slug);
      return target === `/${parts.join('/')}` ? null : target;
    }
    if (seg === 'collections' && slug === LEGACY_PRODUCT_COLLECTION) {
      return pathForKey('solution', locale);
    }
  }

  return null;
}
