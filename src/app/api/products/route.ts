import { db, pages, collections, entries, fields } from '@/lib/db';
import { and, eq, like, asc } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import {
  PRODUCT_PAGE_PREFIX,
  buildProductFilterItems,
  type LegacyEntryInput,
} from '@/lib/products/productMeta';

// Legacy collection the "Trouver une solution" filter used to read directly.
// Still read as a fallback so no product disappears while pages are being
// tagged with `meta.product`.
const LEGACY_COLLECTION_SLUG = 'produit';
const LEGACY_CULTURE_KEY = 'culture';
const LEGACY_PROBLEMATIQUE_KEY = 'problematique';

function str(v: unknown): string {
  return typeof v === 'string' ? v : v == null ? '' : String(v);
}

async function loadLegacyEntries(): Promise<LegacyEntryInput[]> {
  const [col] = await db
    .select()
    .from(collections)
    .where(eq(collections.slug, LEGACY_COLLECTION_SLUG))
    .limit(1);
  if (!col) return [];

  const [colFields, colEntries] = await Promise.all([
    db.select().from(fields).where(eq(fields.collectionId, col.id)).orderBy(asc(fields.order)),
    db
      .select()
      .from(entries)
      .where(and(eq(entries.collectionId, col.id), eq(entries.status, 'published'))),
  ]);

  // Same name / image field resolution the filter used before.
  const nameKey =
    col.itemSlugField ?? (colFields.find((f) => f.type === 'text') ?? colFields[0])?.key ?? null;
  const imageKey = colFields.find((f) => f.type === 'image')?.key ?? null;

  return colEntries.map((e) => {
    const data = (e.data ?? {}) as Record<string, unknown>;
    return {
      id: e.id,
      slug: e.slug,
      name: nameKey ? str(data[nameKey]).trim() : '',
      image: imageKey ? str(data[imageKey]).trim() : '',
      culture: str(data[LEGACY_CULTURE_KEY]),
      problematique: str(data[LEGACY_PROBLEMATIQUE_KEY]),
    };
  });
}

// GET /api/products — public, read-only list of filterable products for the
// "Trouver une solution" page. Only published, non-template product pages.
export async function GET() {
  try {
    const [productPages, legacyEntries] = await Promise.all([
      db
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
        ),
      loadLegacyEntries(),
    ]);

    const items = buildProductFilterItems(
      productPages.map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        meta: p.meta,
        blocks: (p.publishedBlocks as Record<string, unknown> | null)?.fr ?? [],
      })),
      legacyEntries
    );

    return NextResponse.json(items, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    });
  } catch (error) {
    console.error('Error loading products:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
