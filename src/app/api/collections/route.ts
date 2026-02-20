import { db } from '@/lib/db';
import { collections } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const allCollections = await db.select().from(collections).orderBy(desc(collections.createdAt));
    return NextResponse.json(allCollections);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name || !body.slug) {
        return NextResponse.json({ error: 'Name and Slug required' }, { status: 400 });
    }

    const [newCollection] = await db.insert(collections).values({
        name: body.name,
        slug: body.slug,
        description: body.description,
    }).returning();

    return NextResponse.json(newCollection);
  } catch (error) {
    console.error('Create collection error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
