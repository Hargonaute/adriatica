import { db } from '@/lib/db';
import { entries } from '@/lib/db/schema';
import { NextResponse } from 'next/server';
import { generateEntrySlug } from '@/lib/db/generateEntrySlug';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.collectionId || !body.data) {
        return NextResponse.json({ error: 'Collection ID and Data required' }, { status: 400 });
    }

    const slug = await generateEntrySlug(body.collectionId, body.data);

    const [newEntry] = await db.insert(entries).values({
        collectionId: body.collectionId,
        data: body.data,
        slug,
        status: 'published',
        publishedAt: new Date(),
    }).returning();

    return NextResponse.json(newEntry);
  } catch (error) {
    console.error('Create entry error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
