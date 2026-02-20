import { db } from '@/lib/db';
import { pages } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

// Public endpoint — returns only the published snapshot for a given slug.
// No auth required; only exposes published_blocks.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const result = await db
      .select()
      .from(pages)
      .where(eq(pages.slug, slug))
      .limit(1);

    if (!result || result.length === 0) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    const page = result[0];

    if (page.status !== 'published' || !page.published_blocks) {
      return NextResponse.json({ error: 'Page not published' }, { status: 404 });
    }

    return NextResponse.json({
      id: page.id,
      slug: page.slug,
      title: page.title,
      meta: page.meta,
      blocks: page.published_blocks,
      publishedAt: page.publishedAt,
    });
  } catch (error) {
    console.error('Error fetching page by slug:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
