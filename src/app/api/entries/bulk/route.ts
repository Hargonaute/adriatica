import { db } from '@/lib/db';
import { collections, entries, fields as fieldsTable } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { generateEntrySlug, ensureUniqueEntrySlug } from '@/lib/db/generateEntrySlug';
import { validateRows, type CsvField } from '@/lib/csv';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface BulkRow {
  id?: string;
  slug?: string;
  data: Record<string, unknown>;
}

// Normalize an incoming row into { id?, slug?, data }. Accepts either the
// structured shape ({ id, slug, data }) or a bare data object (legacy).
function normalizeRow(row: unknown): BulkRow {
  if (row && typeof row === 'object' && 'data' in row) {
    const r = row as { id?: unknown; slug?: unknown; data?: unknown };
    return {
      id: typeof r.id === 'string' && r.id.trim() ? r.id.trim() : undefined,
      slug: typeof r.slug === 'string' && r.slug.trim() ? r.slug.trim() : undefined,
      data: (r.data && typeof r.data === 'object' ? r.data : {}) as Record<string, unknown>,
    };
  }
  return { data: (row && typeof row === 'object' ? row : {}) as Record<string, unknown> };
}

// POST /api/entries/bulk
// Body: { collectionId: string, rows: Array<{ id?, slug?, data } | Record<string, unknown>> }
//
// Rows with a valid `id` update the existing entry in place; rows without one
// are inserted. Every row's data is re-validated server-side through the same
// validateRows() logic the client uses, so a forged request can't bypass the UI.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { collectionId, rows: rawRows } = body ?? {};

    if (!collectionId || !Array.isArray(rawRows)) {
      return NextResponse.json({ error: 'collectionId and rows[] required' }, { status: 400 });
    }
    if (rawRows.length === 0) {
      return NextResponse.json({ error: 'rows[] must not be empty' }, { status: 400 });
    }
    if (rawRows.length > 5000) {
      return NextResponse.json({ error: 'Maximum 5000 rows per import' }, { status: 400 });
    }

    const rows: BulkRow[] = rawRows.map(normalizeRow);

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
    const dataRows = rows.map(row =>
      fieldKeys.map(k => {
        const v = row.data?.[k];
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

    let inserted = 0;
    let updated = 0;
    let skipped = 0;
    const toInsert: Array<typeof entries.$inferInsert> = [];

    // report.rows aligns 1:1 with rows (same order, header excluded).
    for (let i = 0; i < report.rows.length; i++) {
      const data = report.rows[i].data;
      const { id, slug } = rows[i];

      if (id) {
        // Guard against malformed ids (avoid a Postgres uuid cast error killing the batch).
        if (!UUID_RE.test(id)) {
          skipped++;
          continue;
        }
        // Scope the update to this collection so a row can't touch another collection's entry.
        const [existing] = await db
          .select({ id: entries.id })
          .from(entries)
          .where(and(eq(entries.id, id), eq(entries.collectionId, collectionId)))
          .limit(1);
        if (!existing) {
          skipped++;
          continue;
        }
        const set: Partial<typeof entries.$inferInsert> = { data };
        if (slug) set.slug = await ensureUniqueEntrySlug(collectionId, slug, id);
        await db.update(entries).set(set).where(eq(entries.id, id));
        updated++;
      } else {
        const finalSlug = slug
          ? await ensureUniqueEntrySlug(collectionId, slug)
          : await generateEntrySlug(collectionId, data);
        toInsert.push({
          collectionId,
          data,
          slug: finalSlug,
          status: 'published',
          publishedAt: new Date(),
        });
      }
    }

    if (toInsert.length > 0) {
      const rowsInserted = await db.insert(entries).values(toInsert).returning();
      inserted = rowsInserted.length;
    }

    return NextResponse.json({ inserted, updated, skipped }, { status: 201 });
  } catch (error) {
    console.error('Bulk import error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
