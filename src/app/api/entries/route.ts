import { db } from '@/lib/db';
import { entries } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { generateEntrySlug } from '@/lib/db/generateEntrySlug';

// GET /api/entries?collectionId=X — list all items in a collection
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const collectionId = searchParams.get('collectionId');

    if (!collectionId) {
      return NextResponse.json({ error: 'collectionId query param required' }, { status: 400 });
    }

    const result = await db
      .select()
      .from(entries)
      .where(eq(entries.collectionId, collectionId))
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

    const slug = await generateEntrySlug(body.collectionId, body.data);

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
