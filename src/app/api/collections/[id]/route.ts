import { db } from '@/lib/db';
import { collections, fields, pages } from '@/lib/db/schema';
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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Allowed mutable fields and their DB column names
    const allowed = [
      'basePath',
      'itemSlugField',
      'indexPageId',
      'detailTemplatePageId',
    ] as const;

    const updates: Record<string, any> = {};
    for (const key of allowed) {
      if (key in body) updates[key] = body[key] ?? null;
    }

    if (!Object.keys(updates).length) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const result = await db
      .update(collections)
      .set(updates)
      .where(eq(collections.id, id))
      .returning();

    if (!result.length) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    // When a detail template page is linked, mark that page as a template so
    // the page builder enables field bindings without a manual DB edit.
    if ('detailTemplatePageId' in updates && updates.detailTemplatePageId) {
      await db
        .update(pages)
        .set({ isTemplate: true, templateKind: 'detail', templateCollectionId: id })
        .where(eq(pages.id, updates.detailTemplatePageId));
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Patch collection error:', error);
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
