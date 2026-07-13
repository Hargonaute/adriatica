import { db } from '@/lib/db';
import { pages } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { migratePageData } from '@/lib/page-builder/json/migrate';

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

    const pageData = {
      id: page.id,
      slug: page.slug,
      title: page.title,
      status: page.status as 'draft' | 'published',
      meta: page.meta as any,
      blocks: page.draft_blocks as any,
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
