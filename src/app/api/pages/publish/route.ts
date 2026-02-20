import { db } from '@/lib/db';
import { pages } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { validatePageData } from '@/lib/page-builder/json/validate';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate payload before publishing
    const validation = validatePageData(body);
    if (!validation.success) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const data = validation.data!; 

    // Publish logic:
    // 1. Save current state to draft (sync)
    // 2. Copy draft_blocks -> published_blocks
    // 3. Set status = 'published'
    // 4. Update publishedAt

    await db.update(pages)
        .set({
            title: data.title,
            slug: data.slug,
            meta: data.meta,
            draft_blocks: data.blocks,
            published_blocks: data.blocks, // SNAPSHOT
            status: 'published',
            publishedAt: new Date(),
            updatedAt: new Date(),
        })
        .where(eq(pages.id, data.id));

    // Immediately bust the ISR cache so the public page reflects the new content.
    revalidatePath(`/${data.slug}`);

    return NextResponse.json({ success: true, publishedAt: new Date() });

  } catch (error) {
    console.error('Error publishing page:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
