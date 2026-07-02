import { db } from '@/lib/db';
import { entries } from '@/lib/db/schema';
import { and, eq, desc } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { generateEntrySlug, ensureUniqueEntrySlug } from '@/lib/db/generateEntrySlug';
import { auth } from '@/lib/auth/auth';

// GET /api/entries?collectionId=X — list items in a collection.
// Public callers only see published entries. Pass ?includeUnpublished=true
// with a valid dashboard session to include drafts.
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const collectionId = searchParams.get('collectionId');

    if (!collectionId) {
      return NextResponse.json({ error: 'collectionId query param required' }, { status: 400 });
    }

    let includeUnpublished = false;
    if (searchParams.get('includeUnpublished') === 'true') {
      const session = await auth.api.getSession({ headers: request.headers });
      if (session) includeUnpublished = true;
    }

    const whereClause = includeUnpublished
      ? eq(entries.collectionId, collectionId)
      : and(eq(entries.collectionId, collectionId), eq(entries.status, 'published'));

    const result = await db
      .select()
      .from(entries)
      .where(whereClause)
      .orderBy(desc(entries.createdAt));

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/entries — create a new item
export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.collectionId || !body.data || typeof body.data !== 'object') {
      return NextResponse.json({ error: 'collectionId and data required' }, { status: 400 });
    }

    const slug = typeof body.slug === 'string' && body.slug.trim()
      ? await ensureUniqueEntrySlug(body.collectionId, body.slug)
      : await generateEntrySlug(body.collectionId, body.data);

    const [newEntry] = await db
      .insert(entries)
      .values({
        collectionId: body.collectionId,
        data: body.data,
        slug,
        status: 'published',
        publishedAt: new Date(),
      })
      .returning();

    return NextResponse.json(newEntry, { status: 201 });
  } catch (error) {
    console.error('Create entry error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
