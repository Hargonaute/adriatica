import type { MetadataRoute } from 'next';
import { and, eq } from 'drizzle-orm';
import { db, pages } from '@/lib/db';
import { LOCALES, type Locale } from '@/lib/i18n/config';
import { STATIC_PAGE_KEYS, STATIC_PAGE_SLUGS, pathForKey } from '@/lib/i18n/pageSlugs';
import { publicPathForPage } from '@/lib/products/productUrl';
import { buildLanguageAlternates, hasBlocks, type LocalePaths } from '@/lib/seo/metadata';
import { absoluteUrl } from '@/lib/site';

// /sitemap.xml — generated from the DB on each request, so a publish /
// unpublish shows up immediately. Lists every indexable public URL in FR and
// EN with its hreflang alternates:
//   - coded pages (home, static JSON pages, legal pages);
//   - published, non-template, non-noIndex DB pages (products at
//     /fr/produit/<slug> + /en/product/<slug>), only in the locales that have
//     content.
// Legacy collection pages (/collections/…) are deliberately left out.
export const dynamic = 'force-dynamic';

type Entry = MetadataRoute.Sitemap[number];

function entriesFor(paths: LocalePaths, lastModified?: Date | null): Entry[] {
  const languages = buildLanguageAlternates(paths);
  return LOCALES.filter((l) => paths[l]).map((l) => ({
    url: absoluteUrl(paths[l]!),
    ...(lastModified ? { lastModified } : {}),
    alternates: { languages },
  }));
}

function bothLocales(build: (l: Locale) => string): LocalePaths {
  return { fr: build('fr'), en: build('en') };
}

function codedPageEntries(): Entry[] {
  return [
    bothLocales((l) => `/${l}`),
    ...STATIC_PAGE_KEYS.map((key) => bothLocales((l) => pathForKey(key, l))),
    bothLocales((l) => `/${l}/legal/terms`),
    bothLocales((l) => `/${l}/legal/privacy`),
  ].flatMap((paths) => entriesFor(paths));
}

async function dbPageEntries(): Promise<Entry[]> {
  const rows = await db
    .select({
      slug: pages.slug,
      meta: pages.meta,
      publishedBlocks: pages.published_blocks,
      publishedAt: pages.publishedAt,
      updatedAt: pages.updatedAt,
    })
    .from(pages)
    .where(and(eq(pages.status, 'published'), eq(pages.isTemplate, false)));

  // A DB page whose slug equals a static page slug is shadowed by the coded page.
  const staticSlugs = new Set(
    Object.values(STATIC_PAGE_SLUGS).flatMap((s) => [s.fr, s.en] as string[])
  );

  return rows
    .filter((p) => !staticSlugs.has(p.slug))
    .filter((p) => (p.meta as { noIndex?: unknown } | null)?.noIndex !== true)
    .flatMap((p) => {
      const paths: LocalePaths = {};
      LOCALES.forEach((l) => {
        if (hasBlocks(p.publishedBlocks, l)) paths[l] = publicPathForPage(l, p.slug);
      });
      return entriesFor(paths, p.publishedAt ?? p.updatedAt);
    });
}

/**
 * TODO(Phase 5 / Lot B): indexable catalogue filter URLs
 * (/{l}/trouver-une-solution?famille=<slug>, …) once the frozen facet slug map
 * and the index/noindex rules per combination exist. Not listed yet on purpose.
 */
async function catalogueFilterEntries(): Promise<Entry[]> {
  return [];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let dynamicEntries: Entry[] = [];
  try {
    dynamicEntries = [...(await dbPageEntries()), ...(await catalogueFilterEntries())];
  } catch (error) {
    // Never fail the whole sitemap: the coded pages are still listed.
    console.error('sitemap: failed to load DB pages', error);
  }
  return [...codedPageEntries(), ...dynamicEntries];
}
