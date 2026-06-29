import { db } from '@/lib/db';
import { entries } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await db.select().from(entries).where(eq(entries.id, id)).limit(1);
    if (!result.length) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }
    return NextResponse.json(result[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updates: Record<string, any> = {};

    if ('data' in body) {
      if (!body.data || typeof body.data !== 'object') {
        return NextResponse.json({ error: 'data must be an object' }, { status: 400 });
      }
      updates.data = body.data;
    }

    if ('slug' in body) updates.slug = body.slug ?? null;

    if ('status' in body) {
      if (!['draft', 'published'].includes(body.status)) {
        return NextResponse.json({ error: 'status must be draft or published' }, { status: 400 });
      }
      updates.status = body.status;
      if (body.status === 'published') updates.publishedAt = new Date();
    }

    if (!Object.keys(updates).length) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const result = await db
      .update(entries)
      .set(updates)
      .where(eq(entries.id, id))
      .returning();

    if (!result.length) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }
    return NextResponse.json(result[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await db.delete(entries).where(eq(entries.id, id)).returning();
    if (!result.length) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
