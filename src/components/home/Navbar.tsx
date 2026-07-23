import { cache } from 'react';
import { db, pages } from '@/lib/db';
import { and, eq, desc } from 'drizzle-orm';
import { NavbarShell } from './NavbarShell';
import type { NavLink } from './nav-types';
import { type Locale } from '@/lib/i18n/config';
import { loadCommon } from '@/lib/i18n/loadPageData';
import { pathForKey, STATIC_PAGE_SLUGS, type StaticPageKey } from '@/lib/i18n/pageSlugs';

export type { NavLink };

const NAV_KEY_TO_PAGE: Record<string, StaticPageKey> = {
  rd: 'research-and-development',
  products: 'products',
  solution: 'solution',
  contact: 'contact',
};

const getCmsLinks = cache(async (locale: Locale): Promise<NavLink[]> => {
  try {
    const rows = await db
      .select({ slug: pages.slug, title: pages.title })
      .from(pages)
      .where(and(eq(pages.status, 'published'), eq(pages.isTemplate, false)))
      .orderBy(desc(pages.updatedAt));

    const reserved = new Set<string>();
    for (const key of Object.keys(STATIC_PAGE_SLUGS) as StaticPageKey[]) {
      reserved.add(STATIC_PAGE_SLUGS[key][locale]);
    }

    return rows
      .filter((p) => !reserved.has(p.slug) && !p.slug.startsWith('produit-'))
      .map((p) => ({ label: p.title, href: `/${locale}/${p.slug}` }));
  } catch (err) {
    console.error('Navbar: failed to load CMS pages', err);
    return [];
  }
});

export async function Navbar({ locale }: { locale: Locale }) {
  const common = loadCommon(locale);
  const staticLinks: NavLink[] = common.nav.links.map((l) => {
    const pageKey = NAV_KEY_TO_PAGE[l.key];
    return {
      label: l.label,
      href: pageKey ? pathForKey(pageKey, locale) : `/${locale}`,
    };
  });
  const cmsLinks = await getCmsLinks(locale);
  return <NavbarShell locale={locale} links={[...staticLinks, ...cmsLinks]} />;
}
