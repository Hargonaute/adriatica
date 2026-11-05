/**
 * Re-insert content from a backup made by backup-content.ts.
 *
 *   npx tsx scripts/restore-content.ts backups/2026-11-02-1530                # dry run (default)
 *   npx tsx scripts/restore-content.ts backups/... --tables=pages,entries     # dry run, subset
 *   npx tsx scripts/restore-content.ts backups/... --apply --target-host=<host>
 *   npx tsx scripts/restore-content.ts backups/... --apply --overwrite --target-host=<host>
 *
 * Modes:
 * - dry run (default): read-only transaction, prints per table how many rows
 *   would be inserted, are already identical, or differ (by id), and any
 *   unique-slug conflicts. Writes nothing.
 * - --apply: inserts rows whose id is missing (ON CONFLICT DO NOTHING).
 *   Existing rows are left untouched.
 * - --apply --overwrite: additionally replaces existing rows (same id) with
 *   the backup version.
 *
 * --apply refuses to run unless --target-host equals the host of DATABASE_URL,
 * so a restore can never hit a database by accident. Everything runs in one
 * transaction: any error rolls the whole restore back.
 */
import { config as loadEnv } from 'dotenv';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { Client, types } from 'pg';
import { CONTENT_TABLES } from './content-tables';

loadEnv({ path: '.env.local' });
loadEnv({ path: '.env' });

// Same raw-text timestamp handling as the backup, so comparisons are exact.
types.setTypeParser(1114, (v: string) => v);
types.setTypeParser(1184, (v: string) => v);
types.setTypeParser(1082, (v: string) => v);

type Row = Record<string, unknown>;

function parseArgs(argv: string[]) {
  const positional = argv.filter((a) => !a.startsWith('--'));
  const flag = (name: string) => argv.includes(`--${name}`);
  const value = (name: string) => argv.find((a) => a.startsWith(`--${name}=`))?.split('=').slice(1).join('=');
  return {
    dir: positional[0],
    apply: flag('apply'),
    overwrite: flag('overwrite'),
    targetHost: value('target-host'),
    tables: value('tables')?.split(',').map((t) => t.trim()).filter(Boolean),
  };
}

/** Stable JSON for comparing a DB row with a backup row (key order independent). */
function stable(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  const obj = value as Record<string, unknown>;
  return `{${Object.keys(obj).sort().map((k) => `${JSON.stringify(k)}:${stable(obj[k])}`).join(',')}}`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.dir) {
    console.error('Usage: npx tsx scripts/restore-content.ts <backup-dir> [--tables=a,b] [--apply --target-host=<host> [--overwrite]]');
    process.exit(1);
  }
  const dir = path.resolve(args.dir);
  if (!existsSync(path.join(dir, 'manifest.json'))) throw new Error(`No manifest.json in ${dir}`);
  const manifest = JSON.parse(readFileSync(path.join(dir, 'manifest.json'), 'utf8')) as {
    createdAt: string;
    database: { host: string; name: string };
    tables: Record<string, { rows: number; file: string }>;
  };

  const connectionString = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
  if (!connectionString) throw new Error('DATABASE_URL is not set (.env.local / .env).');
  const dbHost = new URL(connectionString).host;

  if (args.overwrite && !args.apply) throw new Error('--overwrite only makes sense with --apply.');
  if (args.apply && args.targetHost !== dbHost) {
    throw new Error(
      `--apply requires --target-host=${dbHost} (the host of DATABASE_URL). Refusing to write.`,
    );
  }

  const order: string[] = [...CONTENT_TABLES, ...Object.keys(manifest.tables).filter((t) => !(CONTENT_TABLES as readonly string[]).includes(t))];
  const selected = order.filter((t) => manifest.tables[t] && (!args.tables || args.tables.includes(t)));
  for (const t of args.tables ?? []) {
    if (!manifest.tables[t]) throw new Error(`Table "${t}" is not in this backup.`);
  }

  console.log(`Backup   : ${dir} (taken ${manifest.createdAt} from ${manifest.database.host})`);
  console.log(`Target   : ${dbHost}`);
  console.log(`Mode     : ${args.apply ? (args.overwrite ? 'APPLY + OVERWRITE' : 'APPLY (insert missing only)') : 'DRY RUN (no writes)'}`);
  console.log(`Tables   : ${selected.join(', ')}\n`);

  const client = new Client({ connectionString });
  await client.connect();

  try {
    await client.query(args.apply ? 'BEGIN' : 'BEGIN READ ONLY');

    for (const table of selected) {
      const rows = JSON.parse(readFileSync(path.join(dir, manifest.tables[table].file), 'utf8')) as Row[];

      const { rows: cols } = await client.query<{ column_name: string; data_type: string }>(
        `SELECT column_name, data_type FROM information_schema.columns
         WHERE table_schema = 'public' AND table_name = $1`,
        [table],
      );
      if (cols.length === 0) {
        console.log(`${table}: table does not exist in target, skipped.`);
        continue;
      }
      const targetCols = new Map(cols.map((c) => [c.column_name, c.data_type]));
      const backupCols = rows.length ? Object.keys(rows[0]) : [];
      const columns = backupCols.filter((c) => targetCols.has(c));
      const dropped = backupCols.filter((c) => !targetCols.has(c));
      if (dropped.length) console.log(`${table}: columns missing in target, NOT restored: ${dropped.join(', ')}`);

      const ids = rows.map((r) => r.id);
      const { rows: existing } = await client.query<Row>(`SELECT * FROM "${table}" WHERE id = ANY($1)`, [ids]);
      const existingById = new Map(existing.map((r) => [String(r.id), r]));

      let toInsert = 0;
      let identical = 0;
      const differing: string[] = [];
      for (const row of rows) {
        const current = existingById.get(String(row.id));
        if (!current) {
          toInsert++;
        } else if (columns.every((c) => stable(current[c]) === stable(row[c]))) {
          identical++;
        } else {
          differing.push(String(row.slug ?? row.id));
        }
      }

      // Slug conflicts: a missing row whose slug is already used by another row.
      let slugConflicts: string[] = [];
      if (targetCols.has('slug') && (table === 'pages' || table === 'collections')) {
        const missingSlugs = rows.filter((r) => !existingById.has(String(r.id)) && r.slug).map((r) => String(r.slug));
        if (missingSlugs.length) {
          const { rows: taken } = await client.query<{ slug: string }>(
            `SELECT slug FROM "${table}" WHERE slug = ANY($1)`,
            [missingSlugs],
          );
          slugConflicts = taken.map((r) => r.slug);
        }
      }

      console.log(
        `${table.padEnd(12)} backup ${String(rows.length).padStart(4)} | missing (would insert) ${String(toInsert).padStart(4)} | identical ${String(identical).padStart(4)} | differ ${String(differing.length).padStart(4)}`,
      );
      if (differing.length) console.log(`  differ: ${differing.slice(0, 20).join(', ')}${differing.length > 20 ? ` … +${differing.length - 20}` : ''}`);
      if (slugConflicts.length) console.log(`  slug already used by another row (insert will be skipped): ${slugConflicts.join(', ')}`);

      if (!args.apply || rows.length === 0) continue;

      const isJson = (c: string) => targetCols.get(c) === 'jsonb' || targetCols.get(c) === 'json';
      const colList = columns.map((c) => `"${c}"`).join(', ');
      const updateList = columns.filter((c) => c !== 'id').map((c) => `"${c}" = EXCLUDED."${c}"`).join(', ');
      const conflict = args.overwrite ? `ON CONFLICT (id) DO UPDATE SET ${updateList}` : 'ON CONFLICT DO NOTHING';

      let written = 0;
      for (const row of rows) {
        const values = columns.map((c) => (isJson(c) && row[c] !== null ? JSON.stringify(row[c]) : row[c]));
        const placeholders = columns.map((c, i) => (isJson(c) ? `$${i + 1}::jsonb` : `$${i + 1}`)).join(', ');
        const res = await client.query(`INSERT INTO "${table}" (${colList}) VALUES (${placeholders}) ${conflict}`, values);
        written += res.rowCount ?? 0;
      }
      console.log(`  written: ${written}`);
    }

    if (args.apply) {
      await client.query('COMMIT');
      console.log('\nRestore committed.');
    } else {
      await client.query('ROLLBACK');
      console.log('\nDry run only: nothing was written. Re-run with --apply --target-host=<host> to write.');
    }
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('Restore failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
