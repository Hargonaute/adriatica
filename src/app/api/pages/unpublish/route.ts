import { db } from '@/lib/db';
import { pages } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireSession } from '@/lib/auth/require-session';
import { revalidationPathsForPage } from '@/lib/products/productUrl';

export async function POST(request: Request) {
  const unauthorized = await requireSession();
  if (unauthorized) return unauthorized;

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

    // draft_blocks (and any `_pending` settings saved while the page was
    // live) are kept: the editor still shows the latest saved state, and the
    // next Save of the now-draft page writes those settings directly.
    await db.update(pages)
        .set({
            status: 'draft',
            published_blocks: null,
            publishedAt: null,
            updatedAt: new Date(),
        })
        .where(eq(pages.id, id));

    // Bust the ISR cache so the public route returns 404 immediately
    revalidationPathsForPage(existing[0].slug).forEach((p) => revalidatePath(p));

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error unpublishing page:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
