import { db, pages } from '@/lib/db';
import { and, eq, like } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { PRODUCT_PAGE_PREFIX, buildProductFilterItems } from '@/lib/products/productMeta';

// GET /api/products — public, read-only list of filterable products for the
// "Trouver une solution" page and the site search. Only published,
// non-template product pages: the legacy "produit" collection is no longer
// merged in (an unpublished page used to come back as a dead collection card).
export async function GET() {
  try {
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

    const items = buildProductFilterItems(
      productPages.map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        meta: p.meta,
        blocks: (p.publishedBlocks as Record<string, unknown> | null)?.fr ?? [],
      })),
      []
    );

    return NextResponse.json(items, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    });
  } catch (error) {
    console.error('Error loading products:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
