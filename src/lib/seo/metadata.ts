/**
 * Shared per-page metadata: canonical, hreflang, Open Graph and Twitter.
 *
 * Every public page type (home, static pages, legal, DB pages, products) builds
 * its Metadata through buildPageMetadata() so that:
 *   - canonical is absolute, self-referencing and never carries query params;
 *   - hreflang lists only the locales that exist, plus x-default (= FR);
 *   - openGraph is always complete (Next replaces, not merges, the layout's
 *     openGraph object, so a partial override would drop og:locale / site_name).
 *
 * Pure (no DB / React) so it can be unit-tested with tsx.
 */

import type { Metadata } from 'next';
import { DEFAULT_LOCALE, LOCALES, type Locale } from '../i18n/config';
import { DEFAULT_OG_IMAGE, OG_LOCALE, SITE_NAME, absoluteUrl } from '../site';

/** Public path of the page in each locale it exists in (e.g. `{ fr: '/fr/contact' }`). */
export type LocalePaths = Partial<Record<Locale, string>>;

/** Strip query / hash so canonical URLs never carry tracking params. */
function cleanPath(path: string): string {
  return path.split(/[?#]/)[0];
}

/** hreflang map: one entry per available locale, plus x-default → FR (or the only locale). */
export function buildLanguageAlternates(paths: LocalePaths): Record<string, string> {
  const languages: Record<string, string> = {};
  LOCALES.forEach((l) => {
    const p = paths[l];
    if (p) languages[l] = absoluteUrl(cleanPath(p));
  });
  const xDefault = paths[DEFAULT_LOCALE] ?? LOCALES.map((l) => paths[l]).find(Boolean);
  if (xDefault) languages['x-default'] = absoluteUrl(cleanPath(xDefault));
  return languages;
}

export interface PageMetadataInput {
  locale: Locale;
  /**
   * Path of this page in each locale. The current locale's path is the
   * canonical even when it is missing from `paths` (pass `selfPath`).
   */
  paths: LocalePaths;
  /** Path of the page being rendered; defaults to paths[locale]. */
  selfPath?: string;
  /** Page title; `{ absolute }` bypasses the root "%s | Adriatica" template. */
  title?: string | { absolute: string };
  description?: string;
  /** Absolute or root-relative image URL; falls back to the default 1200×630 image. */
  image?: string | null;
  noIndex?: boolean;
  type?: 'website' | 'article';
}

export function buildPageMetadata(input: PageMetadataInput): Metadata {
  const { locale, paths, title, description, noIndex, type = 'website' } = input;
  // og:title / twitter:title are never templated: use the plain text.
  const socialTitle = typeof title === 'string' ? title : title?.absolute;
  const selfPath = cleanPath(input.selfPath ?? paths[locale] ?? `/${locale}`);
  const canonical = absoluteUrl(selfPath);
  const otherLocales = LOCALES.filter((l) => l !== locale && paths[l]);

  const images = input.image
    ? [{ url: input.image }]
    : [{ ...DEFAULT_OG_IMAGE }];

  return {
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    alternates: {
      canonical,
      languages: buildLanguageAlternates(paths),
    },
    openGraph: {
      type,
      url: canonical,
      siteName: SITE_NAME,
      locale: OG_LOCALE[locale],
      ...(otherLocales.length ? { alternateLocale: otherLocales.map((l) => OG_LOCALE[l]) } : {}),
      ...(socialTitle ? { title: socialTitle } : {}),
      ...(description ? { description } : {}),
      images,
    },
    twitter: {
      card: 'summary_large_image',
      ...(socialTitle ? { title: socialTitle } : {}),
      ...(description ? { description } : {}),
      images: images.map((i) => i.url),
    },
    ...(noIndex ? { robots: { index: false, follow: true } } : {}),
  };
}

// ── Per-locale page meta (stored in the existing `meta` jsonb) ────────────────

export interface LocalizedMetaFields {
  title?: string;
  description?: string;
}

function str(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

/**
 * Resolve title / description of a DB page for a locale.
 *
 * FR (and any locale without its own fields) keeps the existing behaviour:
 * `meta.title || page.title`, `meta.description`.
 * EN: `meta.en.title` → `enFallbackTitle` (the EN Product Hero title on product
 * pages) → the FR behaviour; `meta.en.description` → `meta.description`.
 */
export function resolvePageMeta(
  meta: unknown,
  locale: Locale,
  pageTitle: string,
  enFallbackTitle?: string
): LocalizedMetaFields {
  const m = (meta && typeof meta === 'object' ? meta : {}) as Record<string, unknown>;
  const base = { title: str(m.title) || str(pageTitle), description: str(m.description) };
  if (locale !== 'en') return { title: base.title || undefined, description: base.description || undefined };

  const en = (m.en && typeof m.en === 'object' ? m.en : {}) as Record<string, unknown>;
  const title = str(en.title) || str(enFallbackTitle) || base.title;
  const description = str(en.description) || base.description;
  return { title: title || undefined, description: description || undefined };
}

/** True when a locale has at least one published block (used to omit empty hreflang). */
export function hasBlocks(publishedBlocks: unknown, locale: Locale): boolean {
  if (!publishedBlocks || typeof publishedBlocks !== 'object') return false;
  const list = (publishedBlocks as Record<string, unknown>)[locale];
  return Array.isArray(list) && list.length > 0;
}
