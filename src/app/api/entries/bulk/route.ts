import { db } from '@/lib/db';
import { collections, entries, fields as fieldsTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { generateEntrySlug } from '@/lib/db/generateEntrySlug';
import { validateRows, type CsvField } from '@/lib/csv';

// POST /api/entries/bulk
// Body: { collectionId: string, rows: Record<string, unknown>[] }
//
// Each row is a fully-coerced data object (already passed through the client validator).
// We re-validate server-side by serializing back to a "csv-like" header+row shape so
// the same validateRows() logic gates the insert — a forged request can't bypass the UI.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { collectionId, rows } = body ?? {};

    if (!collectionId || !Array.isArray(rows)) {
      return NextResponse.json({ error: 'collectionId and rows[] required' }, { status: 400 });
    }
    if (rows.length === 0) {
      return NextResponse.json({ error: 'rows[] must not be empty' }, { status: 400 });
    }
    if (rows.length > 5000) {
      return NextResponse.json({ error: 'Maximum 5000 rows per import' }, { status: 400 });
    }

    const collection = await db.query.collections.findFirst({
      where: eq(collections.id, collectionId),
    });
    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    const colFields = await db.select().from(fieldsTable).where(eq(fieldsTable.collectionId, collectionId));
    const csvFields: CsvField[] = colFields.map(f => ({
      key: f.key,
      label: f.label,
      type: f.type as CsvField['type'],
      required: !!f.required,
    }));
    const fieldKeys = csvFields.map(f => f.key);

    // Re-validate by feeding rows back through the same validator the client uses.
    const headerRow = fieldKeys;
    const dataRows = rows.map((row: Record<string, unknown>) =>
      fieldKeys.map(k => {
        const v = row?.[k];
        return v === null || v === undefined ? '' : String(v);
      }),
    );
    const report = validateRows([headerRow, ...dataRows], csvFields);

    if (report.errorCount > 0) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          report: {
            errorCount: report.errorCount,
            issues: report.rows.flatMap(r => r.errors).slice(0, 50),
          },
        },
        { status: 400 },
      );
    }

    // Generate slugs sequentially (generateEntrySlug consults the DB for uniqueness)
    const values = await Promise.all(
      report.rows.map(async r => {
        const slug = await generateEntrySlug(collectionId, r.data);
        return {
          collectionId,
          data: r.data,
          slug,
          status: 'published' as const,
          publishedAt: new Date(),
        };
      }),
    );

    const inserted = await db.insert(entries).values(values).returning();
    return NextResponse.json({ inserted: inserted.length }, { status: 201 });
  } catch (error) {
    console.error('Bulk import error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
