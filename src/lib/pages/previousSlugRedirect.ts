import { and, eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { pages } from '@/lib/db/schema';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { publicPathForPage } from '@/lib/products/productUrl';
import { isReservedPageSlug } from '@/lib/products/catalogueIntros';
import { previousSlugTarget } from './draftState';

/**
 * Canonical public path of the published page that used to live at
 * `oldSlug` (recorded in its meta.previousSlugs when its slug changed on
 * publish), or null. Public routes call this only after `oldSlug` matched no
 * live page, then permanentRedirect() there: a single 308 to the final URL.
 */
export async function previousSlugRedirect(locale: Locale | string, oldSlug: string): Promise<string | null> {
  if (!isLocale(locale) || !oldSlug || isReservedPageSlug(oldSlug)) return null;
  try {
    const candidates = await db
      .select({ slug: pages.slug, meta: pages.meta })
      .from(pages)
      .where(
        and(
          eq(pages.status, 'published'),
          eq(pages.isTemplate, false),
          sql`${pages.meta} -> 'previousSlugs' @> ${JSON.stringify([oldSlug])}::jsonb`
        )
      )
      .limit(5);
    const target = previousSlugTarget(candidates, oldSlug);
    if (!target || isReservedPageSlug(target)) return null;
    return publicPathForPage(locale, target);
  } catch (error) {
    console.error('previousSlugRedirect: lookup failed', error);
    return null;
  }
}
