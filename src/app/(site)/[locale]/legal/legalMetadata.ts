import type { Metadata } from 'next';
import { isLocale } from '@/lib/i18n/config';
import { buildPageMetadata } from '@/lib/seo/metadata';

/**
 * Canonical / hreflang / Open Graph for a legal page, set from its layout so
 * the pages' own `metadata` (title) stays untouched. A page's title overrides
 * the layout's; og:title falls back to it.
 */
export function legalMetadata(page: 'terms' | 'privacy') {
  return async function generateMetadata({
    params,
  }: {
    params: Promise<{ locale: string }>;
  }): Promise<Metadata> {
    const { locale } = await params;
    if (!isLocale(locale)) return {};
    return buildPageMetadata({
      locale,
      paths: { fr: `/fr/legal/${page}`, en: `/en/legal/${page}` },
    });
  };
}
