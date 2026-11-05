import { db } from '@/lib/db';
import { pages } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { revalidationPathsForPage } from '@/lib/products/productUrl';
import { migratePageData } from '@/lib/page-builder/json/migrate';
import { getValidSession, requireSession } from '@/lib/auth/require-session';
import { draftView, hasUnpublishedChanges, stripPending } from '@/lib/pages/draftState';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await db.select().from(pages).where(eq(pages.id, id)).limit(1);

    if (!result || result.length === 0) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    const page = result[0];

    // Without a dashboard session: published snapshot only, drafts are 404.
    const session = await getValidSession();
    if (!session && (page.status !== 'published' || !page.published_blocks)) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    // Dashboard session: the latest SAVED state (pending title / slug / meta
    // merged over the live ones, draft blocks). Anonymous: the published
    // snapshot only. `_pending` itself is never returned.
    const view = session ? draftView(page) : null;
    const pageData = {
      id: page.id,
      slug: view ? view.slug : page.slug,
      title: view ? view.title : page.title,
      status: page.status as 'draft' | 'published',
      meta: (view ? view.meta : page.meta) as any,
      blocks: (view ? view.blocks : stripPending(page.published_blocks)) as any,
      schemaVersion: 1,
    };

    const migratedData = migratePageData(pageData);

    if (session) {
      return NextResponse.json({
        ...migratedData,
        hasUnpublishedChanges: hasUnpublishedChanges(page),
        live: { slug: page.slug, title: page.title },
      });
    }
    return NextResponse.json(migratedData);
  } catch (error) {
    console.error('Error fetching page:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireSession();
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;

    const result = await db
      .delete(pages)
      .where(eq(pages.id, id))
      .returning({ slug: pages.slug });

    if (!result || result.length === 0) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    // Bust public cache for the deleted slug
    revalidationPathsForPage(result[0].slug).forEach((p) => revalidatePath(p));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting page:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
