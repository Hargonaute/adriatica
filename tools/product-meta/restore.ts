import { config as loadEnv } from 'dotenv';
loadEnv({ path: '.env.local' });
loadEnv({ path: '.env' });

/**
 * Undo an import: put back the `meta` saved in a backup written by import.ts.
 *
 * Usage:
 *   npx tsx tools/product-meta/restore.ts <backup.json>           # dry run
 *   npx tsx tools/product-meta/restore.ts <backup.json> --apply
 *
 * Only `meta` is restored; blocks / status / slugs are not touched.
 */
import { readFileSync } from 'node:fs';

async function main() {
  const file = process.argv[2];
  const apply = process.argv.includes('--apply');
  if (!file || file.startsWith('--')) throw new Error('Usage: restore.ts <backup.json> [--apply]');
  const backup = JSON.parse(readFileSync(file, 'utf8')) as { id: string; slug: string; meta: unknown }[];
  console.log(`${apply ? 'Restoring' : 'Dry run — would restore'} meta for ${backup.length} pages:`);
  backup.forEach((b) => console.log(`  - ${b.slug}`));
  if (!apply) return;

  const { pool } = await import('../../src/lib/db/pool');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const b of backup) {
      const res = await client.query('UPDATE pages SET meta = $1::jsonb WHERE id = $2 AND slug = $3', [
        JSON.stringify(b.meta ?? {}),
        b.id,
        b.slug,
      ]);
      if (res.rowCount !== 1) throw new Error(`Expected 1 row for ${b.slug}, got ${res.rowCount}`);
    }
    await client.query('COMMIT');
    console.log('Restored.');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Rolled back — nothing written.');
    throw e;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
