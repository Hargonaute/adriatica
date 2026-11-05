/**
 * Carries content edited on the preview database (Neon branch
 * `preview-release`) over to the production database at go-live, without
 * losing anything edited on production since the branch was forked.
 *
 *   PREVIEW_DATABASE_URL=… npx tsx scripts/port-preview-content.ts                               # dry run (default, read-only)
 *   PREVIEW_DATABASE_URL=… npx tsx scripts/port-preview-content.ts --apply --target-host=<host>  # write
 *
 * Source = PREVIEW_DATABASE_URL (only ever read). Target = DATABASE_URL.
 *
 * pages  — a preview row updated after the fork is copied to the target
 *          (slug, title, blocks, meta, status, dates) when the target row is
 *          unchanged since the fork. If the target row ALSO changed after the
 *          fork, it is a CONFLICT: reported, never written; decide by hand.
 *          Pages created on preview are inserted; pages deleted on preview
 *          are only reported (nothing is deleted).
 * assets — preview rows missing on the target are inserted (same id, same
 *          Blob URL: preview and production share the Blob store, so the
 *          files already exist) when a preview page references their URL.
 *          Unreferenced uploads (tests) are reported and skipped.
 * Other content tables (collections, fields, entries) are compared and any
 * difference is reported for manual review; nothing is written to them.
 *
 * Safety:
 * - dry run (default): both connections READ ONLY, prints every change.
 * - --apply refuses to run unless --target-host equals the host of
 *   DATABASE_URL, and refuses if it equals the preview host. One transaction;
 *   each page UPDATE only matches if the target row's updated_at is still the
 *   value that was read; any CONFLICT, mismatch or error writes nothing.
 * - Run AFTER the release is merged and deployed (pages may carry the
 *   `_pending` draft state that only the new code understands), and after a
 *   content backup (scripts/backup-content.ts).
 */
import { config as loadEnv } from 'dotenv';
import { Client, types } from 'pg';

loadEnv({ path: '.env.local' });
loadEnv({ path: '.env' });

// Keep timestamps as the raw strings Postgres returns: compared and written
// back verbatim, no timezone shifts.
[1114, 1184].forEach((oid) => types.setTypeParser(oid, (v: string) => v));

/** When `preview-release` was branched from production (Neon parent_timestamp, UTC). */
const FORK_AT = '2026-11-02 09:31:53';

type Row = Record<string, unknown> & { id: string };
type PageRow = Row & { slug: string; updated_at: string };

const PAGE_COLUMNS = [
  'slug', 'title', 'draft_blocks', 'published_blocks', 'meta', 'status',
  'is_template', 'template_kind', 'template_collection_id', 'published_at', 'created_at', 'updated_at',
] as const;
const JSON_COLUMNS = new Set(['draft_blocks', 'published_blocks', 'meta', 'data', 'options']);
const ASSET_COLUMNS = ['id', 'url', 'pathname', 'content_type', 'size', 'alt', 'created_at'] as const;
const REPORT_ONLY_TABLES = ['collections', 'fields', 'entries'] as const;

function parseArgs(argv: string[]) {
  const flag = (name: string) => argv.includes(`--${name}`);
  const value = (name: string) => argv.find((a) => a.startsWith(`--${name}=`))?.split('=').slice(1).join('=');
  return { apply: flag('apply'), targetHost: value('target-host') };
}

const stable = (v: unknown) =>
  JSON.stringify(v, (_k, x) =>
    x && typeof x === 'object' && !Array.isArray(x)
      ? Object.fromEntries(Object.keys(x).sort().map((k) => [k, (x as Record<string, unknown>)[k]]))
      : x
  );

const param = (col: string, v: unknown) => (JSON_COLUMNS.has(col) && v !== null ? JSON.stringify(v) : v);

const afterFork = (ts: unknown) => typeof ts === 'string' && ts > FORK_AT;

async function readAll(client: Client, table: string): Promise<Map<string, Row>> {
  const { rows } = await client.query<Row>(`SELECT * FROM ${table}`);
  return new Map(rows.map((r) => [r.id, r]));
}

function changedColumns(a: Row, b: Row, cols: readonly string[]): string[] {
  return cols.filter((c) => stable(a[c]) !== stable(b[c]));
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const targetUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
  const sourceUrl = process.env.PREVIEW_DATABASE_URL;
  if (!targetUrl) throw new Error('DATABASE_URL is not set.');
  if (!sourceUrl) throw new Error('PREVIEW_DATABASE_URL is not set.');
  const targetHost = new URL(targetUrl).host;
  const sourceHost = new URL(sourceUrl).host;
  if (targetHost === sourceHost) throw new Error('DATABASE_URL and PREVIEW_DATABASE_URL point at the same host.');
  if (args.apply && args.targetHost !== targetHost) {
    throw new Error(`--apply requires --target-host=${targetHost} (the host of DATABASE_URL). Refusing to write.`);
  }

  console.log(`Source (read only): ${sourceHost}`);
  console.log(`Target            : ${targetHost}`);
  console.log(`Fork point (UTC)  : ${FORK_AT}`);
  console.log(`Mode              : ${args.apply ? 'APPLY' : 'DRY RUN (read-only, no writes)'}\n`);

  const source = new Client({ connectionString: sourceUrl });
  const target = new Client({ connectionString: targetUrl });
  await source.connect();
  await target.connect();
  try {
    await source.query('BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');
    await target.query(args.apply ? 'BEGIN' : 'BEGIN READ ONLY');

    // ── pages ──────────────────────────────────────────────────────────────
    const srcPages = (await readAll(source, 'pages')) as Map<string, PageRow>;
    const dstPages = (await readAll(target, 'pages')) as Map<string, PageRow>;
    const pageUpdates: { src: PageRow; dst: PageRow; cols: string[] }[] = [];
    const pageInserts: PageRow[] = [];
    const conflicts: string[] = [];
    const notes: string[] = [];

    srcPages.forEach((src, id) => {
      const dst = dstPages.get(id);
      if (!dst) {
        pageInserts.push(src);
        return;
      }
      const cols = changedColumns(src, dst, PAGE_COLUMNS);
      if (cols.length === 0) return;
      const srcChanged = afterFork(src.updated_at);
      const dstChanged = afterFork(dst.updated_at);
      if (srcChanged && dstChanged) {
        conflicts.push(`${src.slug}: edited on BOTH sides (preview ${src.updated_at}, production ${dst.updated_at}) — columns ${cols.join(', ')}`);
      } else if (srcChanged) {
        pageUpdates.push({ src, dst, cols });
      } else if (!dstChanged) {
        notes.push(`${src.slug}: differs (${cols.join(', ')}) but neither side's updated_at is after the fork — review by hand`);
      }
      // dstChanged only: production is newer, keep it.
    });
    dstPages.forEach((dst, id) => {
      if (!srcPages.has(id)) notes.push(`${dst.slug}: exists on production, not on preview (deleted on preview, or created on production) — left as is`);
    });
    const slugTaken = new Set(Array.from(dstPages.values()).map((p) => p.slug));
    pageInserts.forEach((p) => {
      if (slugTaken.has(p.slug)) conflicts.push(`${p.slug}: created on preview, but production already has a different page with this slug`);
    });

    // ── assets ─────────────────────────────────────────────────────────────
    const srcAssets = await readAll(source, 'assets');
    const dstAssets = await readAll(target, 'assets');
    const portedPages = [...pageUpdates.map((u) => u.src), ...pageInserts];
    const referenced = stable(Array.from(srcPages.values()).map((p) => [p.draft_blocks, p.published_blocks, p.meta]));
    const assetInserts: Row[] = [];
    srcAssets.forEach((a, id) => {
      if (dstAssets.has(id)) return;
      if (typeof a.url === 'string' && referenced.includes(a.url)) assetInserts.push(a);
      else notes.push(`asset ${String(a.pathname)}: uploaded on preview, used by no page — skipped`);
    });

    // ── other tables: report only ──────────────────────────────────────────
    for (const table of REPORT_ONLY_TABLES) {
      const a = await readAll(source, table);
      const b = await readAll(target, table);
      let n = 0;
      a.forEach((row, id) => {
        const other = b.get(id);
        if (!other || stable(row) !== stable(other)) n += 1;
      });
      b.forEach((_row, id) => {
        if (!a.has(id)) n += 1;
      });
      if (n > 0) notes.push(`${table}: ${n} row(s) differ — NOT ported, review by hand`);
    }

    // ── report ─────────────────────────────────────────────────────────────
    console.log(`Pages to update : ${pageUpdates.length}`);
    pageUpdates.forEach(({ src, cols }) => console.log(`  - ${src.slug}  (preview ${src.updated_at})  ${cols.join(', ')}`));
    console.log(`Pages to insert : ${pageInserts.length}`);
    pageInserts.forEach((p) => console.log(`  - ${p.slug}  (${String(p.status)})`));
    console.log(`Assets to insert: ${assetInserts.length}`);
    assetInserts.forEach((a) => console.log(`  - ${String(a.pathname)}`));
    if (portedPages.some((p) => stable(p.draft_blocks).includes('"_pending"'))) {
      console.log('\nNote: some pages carry `_pending` draft settings — production must already run the release code.');
    }
    if (notes.length) {
      console.log('\nFor information:');
      notes.forEach((n) => console.log(`  · ${n}`));
    }
    if (conflicts.length) {
      console.log('\nCONFLICTS (nothing will be written until resolved):');
      conflicts.forEach((c) => console.log(`  ! ${c}`));
    }

    if (!args.apply) {
      await target.query('ROLLBACK');
      console.log('\nDry run: nothing written. Re-run with --apply --target-host=<host> to write.');
      return;
    }
    if (conflicts.length) throw new Error('Conflicts found; nothing written.');

    for (const a of assetInserts) {
      await target.query(
        `INSERT INTO assets (${ASSET_COLUMNS.join(', ')}) VALUES (${ASSET_COLUMNS.map((_c, i) => `$${i + 1}`).join(', ')})`,
        ASSET_COLUMNS.map((c) => a[c]),
      );
    }
    for (const p of pageInserts) {
      const cols = ['id', ...PAGE_COLUMNS];
      await target.query(
        `INSERT INTO pages (${cols.join(', ')}) VALUES (${cols.map((_c, i) => `$${i + 1}`).join(', ')})`,
        cols.map((c) => param(c, p[c])),
      );
    }
    for (const { src, dst, cols } of pageUpdates) {
      const sets = cols.map((c, i) => `${c} = $${i + 1}`).join(', ');
      const res = await target.query(
        `UPDATE pages SET ${sets} WHERE id = $${cols.length + 1} AND updated_at = $${cols.length + 2}`,
        [...cols.map((c) => param(c, src[c])), src.id, dst.updated_at],
      );
      if (res.rowCount !== 1) throw new Error(`Page ${src.slug} changed on production since it was read; nothing written.`);
    }
    await target.query('COMMIT');
    console.log(`\nApplied: ${pageUpdates.length} page(s) updated, ${pageInserts.length} inserted, ${assetInserts.length} asset(s) inserted.`);
  } catch (error) {
    await target.query('ROLLBACK').catch(() => undefined);
    throw error;
  } finally {
    await source.query('ROLLBACK').catch(() => undefined);
    await source.end();
    await target.end();
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
