/**
 * Read-only export of every client-authored content table.
 *
 *   npm run backup:content
 *
 * Writes backups/<YYYY-MM-DD-HHmm>/<table>.json + manifest.json.
 *
 * Safety:
 * - Runs inside a `BEGIN READ ONLY` transaction: Postgres itself rejects any write.
 * - Uses `SELECT *`, so columns that exist in the DB but not in schema.ts are
 *   still exported (any drift is reported in the manifest).
 * - Timestamps are kept as the raw strings Postgres returns (no JS Date
 *   round-trip), so a restore writes back exactly the same values.
 * - Auth tables (sessions, password hashes, tokens) are deliberately NOT
 *   exported: they are credentials, not content, and must not sit in a
 *   plain-text backup folder.
 */
import { config as loadEnv } from 'dotenv';
import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { Client, types } from 'pg';
import { CONTENT_TABLES } from './content-tables';

loadEnv({ path: '.env.local' });
loadEnv({ path: '.env' });

// timestamp (1114), timestamptz (1184), date (1082): keep raw text.
types.setTypeParser(1114, (v: string) => v);
types.setTypeParser(1184, (v: string) => v);
types.setTypeParser(1082, (v: string) => v);

/** Tables in `public` intentionally left out, with the reason recorded in the manifest. */
const EXCLUDED_TABLES: Record<string, string> = {
  user: 'auth table (accounts are recreated with npm run auth:create-user)',
  session: 'auth table (live session tokens: credentials, not content)',
  account: 'auth table (password hashes: credentials, not content)',
  verification: 'auth table (one-time tokens: credentials, not content)',
};

/** Order rows deterministically so two backups can be diffed. */
const ORDER_BY: Record<string, string> = {
  pages: 'created_at, id',
  assets: 'created_at, id',
  collections: 'created_at, id',
  fields: 'collection_id, "order", id',
  entries: 'collection_id, created_at, id',
};

function timestampFolder(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`;
}

function gitInfo(): { commit: string | null; branch: string | null; dirty: boolean | null } {
  try {
    const commit = execSync('git rev-parse HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
    const dirty = execSync('git status --porcelain', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim().length > 0;
    return { commit, branch, dirty };
  } catch {
    return { commit: null, branch: null, dirty: null };
  }
}

async function main() {
  const connectionString = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
  if (!connectionString) throw new Error('DATABASE_URL is not set (.env.local / .env).');
  const dbHost = new URL(connectionString).host;
  const dbName = new URL(connectionString).pathname.replace(/^\//, '');

  const outDir = path.resolve('backups', timestampFolder());
  mkdirSync(outDir, { recursive: true });

  const client = new Client({ connectionString });
  await client.connect();
  const warnings: string[] = [];

  try {
    await client.query('BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');

    const { rows: publicTables } = await client.query<{ table_name: string }>(
      `SELECT table_name FROM information_schema.tables
       WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
       ORDER BY table_name`,
    );
    const known = new Set<string>([...CONTENT_TABLES, ...Object.keys(EXCLUDED_TABLES)]);
    const unknownTables = publicTables.map((t) => t.table_name).filter((t) => !known.has(t));
    for (const t of unknownTables) {
      warnings.push(`Table public.${t} is not in schema.ts: exported anyway, review whether it holds content.`);
    }

    const tablesToExport = [...CONTENT_TABLES, ...unknownTables];
    const tables: Record<string, { rows: number; columns: string[]; file: string }> = {};

    for (const table of tablesToExport) {
      const { rows: cols } = await client.query<{ column_name: string; data_type: string }>(
        `SELECT column_name, data_type FROM information_schema.columns
         WHERE table_schema = 'public' AND table_name = $1 ORDER BY ordinal_position`,
        [table],
      );
      if (cols.length === 0) {
        warnings.push(`Table public.${table} not found: NOT exported.`);
        continue;
      }
      const orderBy = ORDER_BY[table] ?? '1';
      const { rows } = await client.query(`SELECT * FROM "${table}" ORDER BY ${orderBy}`);
      const file = `${table}.json`;
      writeFileSync(path.join(outDir, file), JSON.stringify(rows, null, 2) + '\n');
      tables[table] = { rows: rows.length, columns: cols.map((c) => `${c.column_name}:${c.data_type}`), file };
      console.log(`  ${table.padEnd(12)} ${String(rows.length).padStart(5)} rows`);
    }

    // Non-public schemas (e.g. neon_auth) are reported, not exported.
    const { rows: otherSchemas } = await client.query<{ table_schema: string; n: number }>(
      `SELECT table_schema, count(*)::int AS n FROM information_schema.tables
       WHERE table_schema NOT IN ('public', 'pg_catalog', 'information_schema')
       GROUP BY table_schema ORDER BY table_schema`,
    );
    for (const s of otherSchemas) {
      warnings.push(`Schema ${s.table_schema} (${s.n} tables) not exported: not used by the app's content.`);
    }

    await client.query('COMMIT');

    const manifest = {
      createdAt: new Date().toISOString(),
      git: gitInfo(),
      database: { host: dbHost, name: dbName },
      snapshot: 'single REPEATABLE READ READ ONLY transaction (consistent across tables)',
      tables,
      excluded: EXCLUDED_TABLES,
      notBackedUp: [
        'Binary files in Vercel Blob (assets.json keeps their URLs/pathnames only).',
        'Page JSON shipped in code (src/data/common.json, src/data/pages/*.json): versioned in git.',
      ],
      warnings,
    };
    writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');

    console.log(`\nBackup written to ${outDir}`);
    console.log(`Database: ${dbHost}/${dbName}`);
    for (const w of warnings) console.log(`WARNING: ${w}`);
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('Backup failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
