import { db } from '@/lib/db';
import { pages } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
        return NextResponse.json({ error: 'Page ID is required' }, { status: 400 });
    }

    // Fetch slug before updating so we can revalidate the public route
    const existing = await db.select({ slug: pages.slug }).from(pages).where(eq(pages.id, id)).limit(1);
    if (!existing.length) {
        return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    await db.update(pages)
        .set({
            status: 'draft',
            published_blocks: null,
            publishedAt: null,
            updatedAt: new Date(),
        })
        .where(eq(pages.id, id));

    // Bust the ISR cache so the public route returns 404 immediately
    revalidatePath(`/${existing[0].slug}`);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error unpublishing page:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
