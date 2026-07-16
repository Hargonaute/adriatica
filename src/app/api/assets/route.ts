import { db } from '@/lib/db';
import { assets } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url, pathname, contentType } = body;
    if (!url || !pathname) {
      return NextResponse.json({ error: 'url and pathname are required' }, { status: 400 });
    }
    const [existing] = await db.select().from(assets).where(eq(assets.url, url)).limit(1);
    if (existing) return NextResponse.json(existing);
    const [asset] = await db
      .insert(assets)
      .values({ url, pathname, contentType: contentType ?? null, alt: '' })
      .returning();
    return NextResponse.json(asset);
  } catch (error) {
    console.error('Error saving asset:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
