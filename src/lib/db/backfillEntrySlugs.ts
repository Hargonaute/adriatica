import { db } from './drizzle';
import { entries } from './schema';
import { eq, isNull, or } from 'drizzle-orm';
import { generateEntrySlug } from './generateEntrySlug';

export type BackfilledEntry = {
  id: string;
  collectionId: string;
  slug: string;
};

// One-shot repair: assign a slug to every entry that is missing one.
// Detail routes fall back to entry.id when slug is null, which produces
// UUID URLs like /collections/produit/9417…. Running this backfill removes
// that fallback path.
export async function backfillMissingEntrySlugs(): Promise<BackfilledEntry[]> {
  const missing = await db
    .select({
      id: entries.id,
      collectionId: entries.collectionId,
      data: entries.data,
    })
    .from(entries)
    .where(or(isNull(entries.slug), eq(entries.slug, '')));

  const results: BackfilledEntry[] = [];

  for (const row of missing) {
    const slug = await generateEntrySlug(
      row.collectionId,
      (row.data ?? {}) as Record<string, unknown>,
    );
    await db.update(entries).set({ slug }).where(eq(entries.id, row.id));
    results.push({ id: row.id, collectionId: row.collectionId, slug });
  }

  return results;
}
