import { db } from '@/lib/db';
import { fields } from '@/lib/db/schema';
import { NextResponse } from 'next/server';

const VALID_TYPES = [
  'text', 'number', 'email', 'date', 'textarea', 'checkbox', 'rich-text', 'image',
  'select', 'multi-select', 'list', 'url', 'reference', 'slug',
];

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.collectionId || !body.key || !body.label || !body.type) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!VALID_TYPES.includes(body.type)) {
      return NextResponse.json({ error: `Invalid field type: ${body.type}` }, { status: 400 });
    }

    const [newField] = await db.insert(fields).values({
        collectionId: body.collectionId,
        key: body.key,
        label: body.label,
        type: body.type,
        required: body.required || false,
        options: body.options || null,
        order: body.order || 0,
    }).returning();

    return NextResponse.json(newField);
  } catch (error) {
    console.error('Create field error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
