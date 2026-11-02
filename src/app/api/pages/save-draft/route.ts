import { db } from '@/lib/db';
import { pages } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { revalidationPathsForPage } from '@/lib/products/productUrl';
import { validatePageData } from '@/lib/page-builder/json/validate';
import { requireSession } from '@/lib/auth/require-session';
import { isReservedPageSlug } from '@/lib/products/catalogueIntros';

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

    // Look up template metadata so template pages can auto-publish on save —
    // detail / index templates are always live, so a "draft" save should
    // immediately push draft_blocks into published_blocks.
    const [existing] = await db
      .select({
        isTemplate: pages.isTemplate,
        templateKind: pages.templateKind,
        slug: pages.slug,
        status: pages.status,
      })
      .from(pages)
      .where(eq(pages.id, data.id))
      .limit(1);

    const autoPublish =
      !!existing?.isTemplate &&
      (existing.templateKind === 'detail' || existing.templateKind === 'index');

    await db.update(pages)
        .set({
            title: data.title,
            slug: data.slug,
            meta: data.meta,
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

    // Save writes title / slug / meta to the live row of a published page, so
    // refresh its public URLs (old and new slug; products: /produit|product/x).
    if (existing && existing.status === 'published' && !existing.isTemplate) {
      new Set([...revalidationPathsForPage(existing.slug), ...revalidationPathsForPage(data.slug)])
        .forEach((p) => revalidatePath(p));
    }

    return NextResponse.json({ success: true, autoPublished: autoPublish });

  } catch (error) {
    console.error('Error saving draft:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
