import { db } from './drizzle';
import { pages } from './schema';
import { eq } from 'drizzle-orm';

export type RepublishedTemplate = {
  id: string;
  title: string;
  slug: string;
  templateKind: 'index' | 'detail' | null;
};

// One-shot repair: copies draft_blocks → published_blocks on every template
// page. Templates are auto-published on every draft save, but pages that
// existed before that behaviour landed still hold stale published_blocks —
// this brings them into sync.
export async function republishAllTemplates(): Promise<RepublishedTemplate[]> {
  const templatePages = await db
    .select({
      id: pages.id,
      title: pages.title,
      slug: pages.slug,
      templateKind: pages.templateKind,
      draft_blocks: pages.draft_blocks,
    })
    .from(pages)
    .where(eq(pages.isTemplate, true));

  const now = new Date();
  const updated: RepublishedTemplate[] = [];

  for (const p of templatePages) {
    await db
      .update(pages)
      .set({
        published_blocks: p.draft_blocks,
        status: 'published',
        publishedAt: now,
        updatedAt: now,
      })
      .where(eq(pages.id, p.id));
    updated.push({
      id: p.id,
      title: p.title,
      slug: p.slug,
      templateKind: p.templateKind,
    });
  }

  return updated;
}
