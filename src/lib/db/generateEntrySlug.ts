import { db } from './drizzle';
import { collections, entries } from './schema';
import { and, eq } from 'drizzle-orm';
import { slugify } from '@/lib/slugify';

/**
 * Generate a unique slug for an entry within a collection.
 *
 * Priority:
 *  1. data[collection.itemSlugField]  — if the collection designates a slug field
 *  2. first non-empty string value in data
 *  3. random short hex fallback
 *
 * Appends -2, -3, … until the slug is unique within the collection.
 */
export async function generateEntrySlug(
  collectionId: string,
  data: Record<string, unknown>,
): Promise<string> {
  // 1. Look up collection config
  const col = await db.query.collections.findFirst({
    where: eq(collections.id, collectionId),
  });

  let base = '';

  if (col?.itemSlugField) {
    const v = data[col.itemSlugField];
    if (typeof v === 'string' && v.trim()) base = slugify(v);
  }

  // 2. First non-empty string value in the data bag
  if (!base) {
    for (const v of Object.values(data)) {
      if (typeof v === 'string' && v.trim()) {
        base = slugify(v).slice(0, 60);
        break;
      }
    }
  }

  // 3. Short random fallback
  if (!base) base = Math.random().toString(36).slice(2, 10);

  // 4. Ensure uniqueness within collection
  let slug = base;
  let n = 2;
  while (true) {
    const existing = await db.query.entries.findFirst({
      where: and(eq(entries.collectionId, collectionId), eq(entries.slug, slug)),
    });
    if (!existing) return slug;
    slug = `${base}-${n++}`;
  }
}
