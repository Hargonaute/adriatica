/**
 * B8 data reclassification: "NPK hydrosolubles" moves from problématique to
 * famille on product pages.
 *
 *   npx tsx scripts/reclassify-npk.ts                               # dry run (default, read-only)
 *   npx tsx scripts/reclassify-npk.ts --apply --target-host=<host>  # write
 *
 * For every product page (slug `produit-…`, any status, not a template) whose
 * meta.product.problematiques contains "NPK hydrosolubles" (case / accent /
 * dash-insensitive):
 *   meta.product.famille        → "NPK hydrosolubles"
 *   meta.product.problematiques → same list without "NPK hydrosolubles"
 * Nothing else changes (other meta keys, cultures, blocks, updated_at).
 *
 * Until this runs, the public site already shows these products under the
 * NPK famille (read-path bridge publicProductFacets in productMeta.ts); after
 * it runs the bridge is a no-op.
 *
 * Safety:
 * - dry run (default): BEGIN READ ONLY, prints exactly which rows would
 *   change (id, slug, status, current → new famille / problématiques).
 * - --apply refuses to run unless --target-host equals the host of
 *   DATABASE_URL (same guard as restore-content.ts). One transaction; each
 *   UPDATE only matches if the row's meta is unchanged since it was read; any
 *   mismatch or error rolls everything back.
 * - Take a content backup first (scripts/backup-content.ts).
 */
import { config as loadEnv } from 'dotenv';
import { Client } from 'pg';
import { NPK_FAMILLE, PRODUCT_PAGE_PREFIX, foldKey } from '../src/lib/products/productMeta';

loadEnv({ path: '.env.local' });
loadEnv({ path: '.env' });

const NPK_KEY = foldKey(NPK_FAMILLE);

type Product = { famille?: unknown; problematiques?: unknown; cultures?: unknown; [k: string]: unknown };

interface Change {
  id: string;
  slug: string;
  status: string | null;
  meta: Record<string, unknown>;
  before: Product;
  after: Product;
}

function parseArgs(argv: string[]) {
  const flag = (name: string) => argv.includes(`--${name}`);
  const value = (name: string) => argv.find((a) => a.startsWith(`--${name}=`))?.split('=').slice(1).join('=');
  return { apply: flag('apply'), targetHost: value('target-host') };
}

function isNpk(v: unknown): boolean {
  return typeof v === 'string' && foldKey(v) === NPK_KEY;
}

/** The new meta.product for a row, or null when the row needs no change. */
function reclassify(product: Product | null | undefined): Product | null {
  if (!product || typeof product !== 'object') return null;
  const probs = Array.isArray(product.problematiques) ? product.problematiques : [];
  if (!probs.some(isNpk)) return null;
  return {
    ...product,
    famille: NPK_FAMILLE,
    problematiques: probs.filter((p) => !isNpk(p)),
  };
}

function show(p: Product): string {
  const probs = Array.isArray(p.problematiques) ? p.problematiques.join(' | ') : '';
  return `famille="${String(p.famille ?? '')}" problematiques=[${probs}]`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const connectionString = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
  if (!connectionString) throw new Error('DATABASE_URL is not set.');
  const dbHost = new URL(connectionString).host;

  if (args.apply && args.targetHost !== dbHost) {
    throw new Error(`--apply requires --target-host=${dbHost} (the host of DATABASE_URL). Refusing to write.`);
  }

  console.log(`Target : ${dbHost}`);
  console.log(`Mode   : ${args.apply ? 'APPLY' : 'DRY RUN (read-only, no writes)'}\n`);

  const client = new Client({ connectionString });
  await client.connect();
  try {
    await client.query(args.apply ? 'BEGIN' : 'BEGIN READ ONLY');

    const { rows } = await client.query<{ id: string; slug: string; status: string | null; meta: Record<string, unknown> | null }>(
      `SELECT id, slug, status, meta FROM pages
       WHERE slug LIKE $1 AND is_template = false
       ORDER BY slug`,
      [`${PRODUCT_PAGE_PREFIX}%`],
    );

    const changes: Change[] = [];
    rows.forEach((r) => {
      const meta = r.meta ?? {};
      const before = (meta.product ?? null) as Product | null;
      const after = reclassify(before);
      if (before && after) changes.push({ id: r.id, slug: r.slug, status: r.status, meta, before, after });
    });

    console.log(`Product pages scanned : ${rows.length}`);
    console.log(`Rows to change        : ${changes.length}\n`);
    changes.forEach((c) => {
      console.log(`- ${c.id}  ${c.slug}  (${c.status ?? 'no status'})`);
      console.log(`    before: ${show(c.before)}`);
      console.log(`    after : ${show(c.after)}`);
    });

    if (!args.apply) {
      await client.query('ROLLBACK');
      console.log('\nDry run: nothing written. Re-run with --apply --target-host=<host> to write.');
      return;
    }

    for (const c of changes) {
      const res = await client.query(
        `UPDATE pages SET meta = jsonb_set(meta, '{product}', $1::jsonb)
         WHERE id = $2 AND meta = $3::jsonb`,
        [JSON.stringify(c.after), c.id, JSON.stringify(c.meta)],
      );
      if (res.rowCount !== 1) throw new Error(`Row ${c.slug} changed since it was read; nothing written.`);
    }
    await client.query('COMMIT');
    console.log(`\nApplied: ${changes.length} row(s) updated.`);
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined);
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
