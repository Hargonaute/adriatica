import { db } from '@/lib/db';
import { fields } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { requireSession } from '@/lib/auth/require-session';

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = await requireSession();
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    const result = await db.delete(fields).where(eq(fields.id, id)).returning();
    if (!result.length) {
      return NextResponse.json({ error: 'Field not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete field error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
