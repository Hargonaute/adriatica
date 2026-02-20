import { db } from '@/lib/db';
import { collections, fields } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const collection = await db.query.collections.findFirst({
      where: eq(collections.id, id),
    });

    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    const collectionFields = await db
      .select()
      .from(fields)
      .where(eq(fields.collectionId, id))
      .orderBy(fields.order);

    return NextResponse.json({ ...collection, fields: collectionFields });
  } catch (error) {
    console.error('Get collection error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Cascade delete handles fields and entries (see schema FK onDelete: 'cascade')
    const result = await db.delete(collections).where(eq(collections.id, id)).returning();
    if (!result.length) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete collection error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
