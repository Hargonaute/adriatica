import { and, eq, like } from 'drizzle-orm';
import { db, pages } from '@/lib/db';
import { PRODUCT_PAGE_PREFIX, buildProductFilterItems, type ProductFilterItem } from './productMeta';

/**
 * Filterable products, read from the DB: published, non-template product pages
 * (`produit-<slug>`) carrying `meta.product`. Shared by GET /api/products and
 * the server-rendered "Trouver une solution" page (so both list the same set).
 */
export async function loadProductFilterItems(): Promise<ProductFilterItem[]> {
  const productPages = await db
    .select({
      id: pages.id,
      slug: pages.slug,
      title: pages.title,
      meta: pages.meta,
      publishedBlocks: pages.published_blocks,
    })
    .from(pages)
    .where(
      and(
        like(pages.slug, `${PRODUCT_PAGE_PREFIX}%`),
        eq(pages.status, 'published'),
        eq(pages.isTemplate, false)
      )
    );

  return buildProductFilterItems(
    productPages.map((p) => {
      const blocks = p.publishedBlocks as Record<string, unknown> | null;
      return {
        id: p.id,
        slug: p.slug,
        title: p.title,
        meta: p.meta,
        blocks: blocks?.fr ?? [],
        blocksEn: blocks?.en ?? [],
      };
    }),
    []
  );
}
