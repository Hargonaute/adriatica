import { db } from '@/lib/db';
import { entries } from '@/lib/db/schema';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!body.collectionId || !body.data) {
        return NextResponse.json({ error: 'Collection ID and Data required' }, { status: 400 });
    }

    // In a real scenario, validate body.data against collection fields schema here

    const [newEntry] = await db.insert(entries).values({
        collectionId: body.collectionId,
        data: body.data,
    }).returning();

    return NextResponse.json(newEntry);
  } catch (error) {
    console.error('Create entry error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
