import { eq } from 'drizzle-orm';
import { db, pages } from '@/lib/db';
import {
  CATALOGUE_INTROS_SLUG,
  CATALOGUE_INTROS_TITLE,
  sanitizeIntros,
  type CatalogueIntros,
} from './catalogueIntros';

/**
 * DB access for the catalogue intro texts (see catalogueIntros.ts for the
 * storage design). Reads never throw: on any error the public page simply
 * renders without intros.
 */

async function loadRow() {
  const [row] = await db
    .select({ id: pages.id, meta: pages.meta })
    .from(pages)
    .where(eq(pages.slug, CATALOGUE_INTROS_SLUG))
    .limit(1);
  return row ?? null;
}

export async function getCatalogueIntros(): Promise<CatalogueIntros> {
  try {
    const row = await loadRow();
    return sanitizeIntros((row?.meta as { catalogueIntros?: unknown } | null)?.catalogueIntros);
  } catch (error) {
    console.error('catalogue intros: read failed', error);
    return sanitizeIntros(null);
  }
}

/**
 * Save every intro (full replace of meta.catalogueIntros). Creates the reserved
 * row on first save, always as a draft (never public). Returns what was stored.
 */
export async function saveCatalogueIntros(raw: unknown): Promise<CatalogueIntros> {
  const intros = sanitizeIntros(raw);
  const now = new Date();
  const row = await loadRow();
  if (row) {
    const meta = (row.meta && typeof row.meta === 'object' ? row.meta : {}) as Record<string, unknown>;
    await db
      .update(pages)
      .set({ meta: { ...meta, catalogueIntros: intros }, status: 'draft', updatedAt: now })
      .where(eq(pages.id, row.id));
  } else {
    await db.insert(pages).values({
      slug: CATALOGUE_INTROS_SLUG,
      title: CATALOGUE_INTROS_TITLE,
      draft_blocks: { en: [], fr: [] },
      meta: { noIndex: true, catalogueIntros: intros },
      status: 'draft',
      isTemplate: false,
    });
  }
  return intros;
}
