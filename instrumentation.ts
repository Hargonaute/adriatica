// Next.js server-start hook. Runs once when the Node.js runtime boots.
// In development we auto-republish templates and backfill missing entry slugs
// so pre-auto-publish drafts land on the live routes and URLs stop falling
// back to /collections/{basePath}/{uuid} instead of a slug.
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  if (process.env.NODE_ENV !== 'development') return;

  try {
    const { republishAllTemplates } = await import('./src/lib/db/republishTemplates');
    const updated = await republishAllTemplates();
    if (updated.length > 0) {
      console.log(
        `[startup] Republished ${updated.length} template page(s): ` +
          updated.map((p) => p.title).join(', ')
      );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(`[startup] Template republish skipped: ${message}`);
  }

  try {
    const { backfillMissingEntrySlugs } = await import('./src/lib/db/backfillEntrySlugs');
    const backfilled = await backfillMissingEntrySlugs();
    if (backfilled.length > 0) {
      console.log(
        `[startup] Backfilled slugs for ${backfilled.length} entrie(s): ` +
          backfilled.map((e) => e.slug).join(', ')
      );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(`[startup] Entry slug backfill skipped: ${message}`);
  }
}
