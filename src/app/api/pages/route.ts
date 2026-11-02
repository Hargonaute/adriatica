import { db } from '@/lib/db';
import { pages } from '@/lib/db/schema';
import { and, desc, eq, notLike } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getValidSession, requireSession } from '@/lib/auth/require-session';
import { RESERVED_SLUG_LIKE } from '@/lib/products/catalogueIntros';

// GET /api/pages — list pages (lean, no blocks payload).
// Drafts are only listed for an authenticated dashboard session.
export async function GET() {
  try {
    const session = await getValidSession();
    const result = await db
      .select({
        id: pages.id,
        slug: pages.slug,
        title: pages.title,
        status: pages.status,
        publishedAt: pages.publishedAt,
        updatedAt: pages.updatedAt,
      })
      .from(pages)
      // Reserved rows (slug "_…", e.g. the catalogue intros store) are never listed.
      .where(
        session
          ? notLike(pages.slug, RESERVED_SLUG_LIKE)
          : and(eq(pages.status, 'published'), notLike(pages.slug, RESERVED_SLUG_LIKE))
      )
      .orderBy(desc(pages.updatedAt));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error listing pages:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

const CreatePageSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
});

// POST /api/pages — create a new blank page
export async function POST(request: Request) {
  const unauthorized = await requireSession();
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const parsed = CreatePageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues.map((i) => i.message).join(', ') },
        { status: 400 }
      );
    }

    const [page] = await db
      .insert(pages)
      .values({
        title: parsed.data.title,
        slug: parsed.data.slug,
        draft_blocks: { en: [], fr: [] },
        meta: { title: parsed.data.title },
        status: 'draft',
      })
      .returning();

    return NextResponse.json(page, { status: 201 });
  } catch (error: any) {
    // Unique constraint on slug
    if (error?.message?.includes('unique')) {
      return NextResponse.json({ error: 'A page with this slug already exists' }, { status: 409 });
    }
    console.error('Error creating page:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
