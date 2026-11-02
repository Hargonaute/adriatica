import { db } from '@/lib/db';
import { pages } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { migratePageData } from '@/lib/page-builder/json/migrate';
import { getValidSession, requireSession } from '@/lib/auth/require-session';

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

    const pageData = {
      id: page.id,
      slug: page.slug,
      title: page.title,
      status: page.status as 'draft' | 'published',
      meta: page.meta as any,
      blocks: (session ? page.draft_blocks : page.published_blocks) as any,
      schemaVersion: 1,
    };

    const migratedData = migratePageData(pageData);

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
    revalidatePath(`/fr/${result[0].slug}`);
    revalidatePath(`/en/${result[0].slug}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting page:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
