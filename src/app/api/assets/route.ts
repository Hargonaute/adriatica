import { db } from '@/lib/db';
import { assets } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const allAssets = await db.select().from(assets).orderBy(desc(assets.createdAt));
    return NextResponse.json(allAssets);
  } catch (error) {
    console.error('Error fetching assets:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
