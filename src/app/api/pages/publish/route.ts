import { db } from '@/lib/db';
import { pages } from '@/lib/db/schema';
import { and, eq, ne } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { revalidationPathsForPage } from '@/lib/products/productUrl';
import { validatePageData } from '@/lib/page-builder/json/validate';
import { requireSession } from '@/lib/auth/require-session';
import { isReservedPageSlug } from '@/lib/products/catalogueIntros';
import { isUniqueViolation } from '@/lib/db/errors';
import { publishedMeta, stripPending } from '@/lib/pages/draftState';

// Publish ("Publish" on a draft page, "Publish changes" on a published one,
// "Update Live Template" on a template). The body is the editor's current
// state, i.e. the saved draft (pending settings merged in, see
// src/lib/pages/draftState.ts) plus any edit not autosaved yet. In one update:
//   1. blocks → draft_blocks AND published_blocks (never the `_pending` key);
//   2. title / slug / meta → the live columns, which clears `_pending`;
//   3. a slug change on a public page records the old slug in
//      meta.previousSlugs, so its URL 308s to the new one;
//   4. status = 'published', publishedAt = now.
// A slug already used by another page → 409, nothing applied.
export async function POST(request: Request) {
  const unauthorized = await requireSession();
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();

    // Validate payload before publishing
    const validation = validatePageData(body);
    if (!validation.success) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const data = validation.data!;

    // Reserved rows (slug "_…", e.g. the catalogue intros store) are not pages.
    if (isReservedPageSlug(data.slug)) {
      return NextResponse.json({ error: 'Reserved slug' }, { status: 400 });
    }

    const [existing] = await db
      .select({ slug: pages.slug, meta: pages.meta, status: pages.status, isTemplate: pages.isTemplate })
      .from(pages)
      .where(eq(pages.id, data.id))
      .limit(1);
    if (!existing) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }
    if (isReservedPageSlug(existing.slug)) {
      return NextResponse.json({ error: 'Reserved slug' }, { status: 400 });
    }

    if (data.slug !== existing.slug) {
      const [taken] = await db
        .select({ id: pages.id })
        .from(pages)
        .where(and(eq(pages.slug, data.slug), ne(pages.id, data.id)))
        .limit(1);
      if (taken) return slugConflict(data.slug);
    }

    const blocks = stripPending(data.blocks);
    const now = new Date();
    await db.update(pages)
        .set({
            title: data.title,
            slug: data.slug,
            meta: publishedMeta(
              data.meta,
              {
                slug: existing.slug,
                meta: existing.meta,
                // Only a page that was publicly reachable gets a redirect.
                wasPublic: existing.status === 'published' && !existing.isTemplate,
              },
              data.slug
            ),
            draft_blocks: blocks, // clears _pending
            published_blocks: blocks, // SNAPSHOT
            status: 'published',
            publishedAt: now,
            updatedAt: now,
        })
        .where(eq(pages.id, data.id));

    // Immediately bust the ISR cache of the old and new public URLs
    // (product pages: /fr/produit/<slug> + /en/product/<slug>).
    new Set([...revalidationPathsForPage(existing.slug), ...revalidationPathsForPage(data.slug)])
      .forEach((p) => revalidatePath(p));

    return NextResponse.json({ success: true, publishedAt: now, slug: data.slug });

  } catch (error) {
    if (isUniqueViolation(error)) {
      return slugConflict();
    }
    console.error('Error publishing page:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

function slugConflict(slug?: string) {
  return NextResponse.json(
    {
      error: slug
        ? `The slug "${slug}" is already used by another page. Choose another slug, nothing was published.`
        : 'This slug is already used by another page. Choose another slug, nothing was published.',
      code: 'slug_conflict',
    },
    { status: 409 }
  );
}
