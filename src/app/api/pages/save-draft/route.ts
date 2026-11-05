import { db } from '@/lib/db';
import { pages } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { validatePageData } from '@/lib/page-builder/json/validate';
import { requireSession } from '@/lib/auth/require-session';
import { isReservedPageSlug } from '@/lib/products/catalogueIntros';
import { isUniqueViolation } from '@/lib/db/errors';
import {
  editableMeta,
  hasUnpublishedChanges,
  pendingForSave,
  previousSlugsOf,
  withPending,
} from '@/lib/pages/draftState';

// Save (manual or 30 s autosave). Never changes what the public sees, except
// for template pages, which are always live and keep auto-publishing on save:
//   - published page: blocks → draft_blocks; title / slug / meta →
//     draft_blocks._pending (see src/lib/pages/draftState.ts). The live
//     columns wait for Publish.
//   - draft page (nothing public yet): title / slug / meta are written directly.
export async function POST(request: Request) {
  const unauthorized = await requireSession();
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();

    // Validate payload
    const validation = validatePageData(body);
    if (!validation.success) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const data = validation.data!; // Safe per check above

    // Reserved rows (slug "_…", e.g. the catalogue intros store) are not pages.
    if (isReservedPageSlug(data.slug)) {
      return NextResponse.json({ error: 'Reserved slug' }, { status: 400 });
    }

    const [existing] = await db
      .select({
        isTemplate: pages.isTemplate,
        templateKind: pages.templateKind,
        title: pages.title,
        slug: pages.slug,
        meta: pages.meta,
        status: pages.status,
        published_blocks: pages.published_blocks,
      })
      .from(pages)
      .where(eq(pages.id, data.id))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }
    if (isReservedPageSlug(existing.slug)) {
      return NextResponse.json({ error: 'Reserved slug' }, { status: 400 });
    }

    // Published (non-template) page: settings go to _pending, which is dropped
    // when they equal the live ones. Nothing public changes, so no revalidation.
    if (existing.status === 'published' && !existing.isTemplate) {
      const pending = pendingForSave(
        { title: existing.title, slug: existing.slug, meta: (existing.meta ?? {}) as Record<string, unknown> },
        { title: data.title, slug: data.slug, meta: data.meta as Record<string, unknown> }
      );
      const draftBlocks = withPending(data.blocks, pending);
      await db.update(pages)
        .set({ draft_blocks: draftBlocks, updatedAt: new Date() })
        .where(eq(pages.id, data.id));

      return NextResponse.json({
        success: true,
        autoPublished: false,
        hasUnpublishedChanges: hasUnpublishedChanges({ ...existing, draft_blocks: draftBlocks }),
      });
    }

    // Template pages auto-publish on save — detail / index templates are
    // always live, so a "draft" save immediately pushes the blocks live.
    const autoPublish =
      !!existing.isTemplate &&
      (existing.templateKind === 'detail' || existing.templateKind === 'index');

    // meta.previousSlugs is server-managed: keep the live list.
    const prev = previousSlugsOf(existing.meta);

    await db.update(pages)
        .set({
            title: data.title,
            slug: data.slug,
            meta: { ...editableMeta(data.meta), ...(prev.length ? { previousSlugs: prev } : {}) },
            draft_blocks: data.blocks,
            ...(autoPublish
              ? {
                  published_blocks: data.blocks,
                  status: 'published',
                  publishedAt: new Date(),
                }
              : {}),
            updatedAt: new Date(),
        })
        .where(eq(pages.id, data.id));

    // Bust the collection routes so the newly published template is live.
    if (autoPublish) {
      revalidatePath('/fr/collections', 'layout');
      revalidatePath('/en/collections', 'layout');
    }

    return NextResponse.json({ success: true, autoPublished: autoPublish, hasUnpublishedChanges: false });

  } catch (error) {
    if (isUniqueViolation(error)) {
      return NextResponse.json({ error: 'A page with this slug already exists' }, { status: 409 });
    }
    console.error('Error saving draft:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
