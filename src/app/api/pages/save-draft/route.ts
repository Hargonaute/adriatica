import { db } from '@/lib/db';
import { pages } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { validatePageData } from '@/lib/page-builder/json/validate';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate payload
    const validation = validatePageData(body);
    if (!validation.success) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const data = validation.data!; // Safe per check above

    // Update DB
    // We only update draft_blocks, meta, status(maybe), title, slug
    await db.update(pages)
        .set({
            title: data.title,
            slug: data.slug,
            meta: data.meta,
            draft_blocks: data.blocks,
            updatedAt: new Date(),
        })
        .where(eq(pages.id, data.id));

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error saving draft:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
