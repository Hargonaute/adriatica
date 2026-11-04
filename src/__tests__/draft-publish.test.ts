/**
 * Draft → publish cycle for page settings (A12, phase 4)
 *
 * Locks in:
 *   - pending title / slug / meta live in draft_blocks._pending and are
 *     stripped from every block payload (validator, migrate, publish)
 *   - the editor / authenticated view merges pending over live
 *   - "unpublished changes" detection (pending OR blocks differ)
 *   - publish applies pending settings and records old slugs (previousSlugs)
 *   - old-slug redirect resolution (single hop, no self-redirect)
 *
 * Run: npx tsx src/__tests__/draft-publish.test.ts
 */

import {
  PENDING_KEY,
  MAX_PREVIOUS_SLUGS,
  blocksEqual,
  draftView,
  editableMeta,
  hasUnpublishedChanges,
  pendingForSave,
  previousSlugTarget,
  previousSlugsOf,
  publishedMeta,
  readPending,
  settingsEqual,
  stableStringify,
  stripPending,
  withPending,
} from '../lib/pages/draftState';
import { validatePageData } from '../lib/page-builder/json/validate';
import { migratePageData } from '../lib/page-builder/json/migrate';
import { publicPathForPage } from '../lib/products/productUrl';

let passed = 0;
let failed = 0;

function assert(description: string, condition: boolean) {
  if (condition) {
    console.log(`  ✓  ${description}`);
    passed++;
  } else {
    console.error(`  ✗  ${description}`);
    failed++;
  }
}

const block = (id: string, text: string) => ({
  id,
  type: 'text',
  order: 0,
  data: { content: text, paddingTop: 'md', paddingBottom: 'md', align: 'left', maxWidth: 'full', background: 'none' },
});

const liveMeta = {
  title: 'Atrium Cu',
  description: 'Old description',
  ogImage: 'https://x/old.jpg',
  product: { famille: 'Biostimulants', cultures: ['Agrumes'] },
};
const publishedBlocks = { en: [block('a', 'hello')], fr: [block('b', 'bonjour')] };

// ── stableStringify ──────────────────────────────────────────────────────────
console.log('\nstableStringify');
assert('key order does not matter', stableStringify({ a: 1, b: { c: 2, d: 3 } }) === stableStringify({ b: { d: 3, c: 2 }, a: 1 }));
assert('undefined values are dropped like JSON', stableStringify({ a: 1, b: undefined }) === stableStringify({ a: 1 }));
assert('array order matters', stableStringify([1, 2]) !== stableStringify([2, 1]));

// ── _pending storage ────────────────────────────────────────────────────────
console.log('\n_pending storage');
const pending = pendingForSave(
  { title: 'Atrium Cu', slug: 'produit-atrium-cu', meta: liveMeta },
  {
    title: 'Atrium Cu',
    slug: 'produit-atrium-cu',
    meta: { ...liveMeta, title: 'New Meta Title', product: { famille: 'Engrais', cultures: ['Agrumes'] } },
  },
  new Date('2026-11-04T10:00:00Z')
);
assert('changed meta → pending settings', !!pending && pending.meta.title === 'New Meta Title');
assert('savedAt recorded', pending?.savedAt === '2026-11-04T10:00:00.000Z');
const stored = withPending(publishedBlocks, pending);
assert('withPending stores under the reserved key', PENDING_KEY === '_pending' && !!(stored as Record<string, unknown>)._pending);
assert('readPending reads it back', readPending(stored)?.meta.title === 'New Meta Title');
assert('stripPending removes it', !('_pending' in (stripPending(stored) as object)));
assert('stripPending does not mutate its input', '_pending' in stored);
assert('stripPending passes null through', stripPending(null) === null);
assert('withPending(null) drops an old _pending', !('_pending' in withPending(stored, null)));
assert('readPending ignores a malformed value', readPending({ en: [], _pending: 'x' }) === null);

assert(
  'unchanged settings → no pending',
  pendingForSave(
    { title: 'Atrium Cu', slug: 'produit-atrium-cu', meta: liveMeta },
    { title: 'Atrium Cu', slug: 'produit-atrium-cu', meta: { ...liveMeta } }
  ) === null
);
// The editor adds meta.title / meta.description defaults on load
// (migratePageData); that alone must not count as a change.
assert(
  'editor defaults (meta.title from title, description "") are not a change',
  settingsEqual(
    { title: 'Page', slug: 'page', meta: {} },
    { title: 'Page', slug: 'page', meta: { title: 'Page', description: '' } }
  )
);
assert(
  'previousSlugs never counts as a change',
  settingsEqual(
    { title: 'P', slug: 'p', meta: { previousSlugs: ['old'] } },
    { title: 'P', slug: 'p', meta: {} }
  )
);
assert(
  'a slug change is a change',
  !settingsEqual({ title: 'P', slug: 'p', meta: {} }, { title: 'P', slug: 'p2', meta: {} })
);
assert(
  'pending meta never carries previousSlugs (server-managed)',
  !('previousSlugs' in
    (pendingForSave({ title: 'P', slug: 'p', meta: {} }, { title: 'Q', slug: 'p', meta: { previousSlugs: ['evil'] } })!.meta))
);

// ── Stripping on the publish / validate / migrate paths ─────────────────────
console.log('\nno _pending downstream');
const editorPayload = {
  id: 'x',
  slug: 'produit-atrium-cu',
  title: 'Atrium Cu',
  status: 'published',
  schemaVersion: 1,
  meta: liveMeta,
  blocks: stored,
};
const validated = validatePageData(editorPayload);
assert('validatePageData accepts a payload whose blocks carry _pending', validated.success);
assert('…and strips _pending from blocks', !('_pending' in (validated.data!.blocks as object)));
const migrated = migratePageData(editorPayload);
assert('migratePageData keeps only en / fr', Object.keys(migrated.blocks).sort().join(',') === 'en,fr');

// ── Editor / authenticated view ─────────────────────────────────────────────
console.log('\ndraftView');
const row = {
  title: 'Atrium Cu',
  slug: 'produit-atrium-cu',
  meta: { ...liveMeta, previousSlugs: ['produit-atrium'] },
  status: 'published',
  draft_blocks: withPending(publishedBlocks, {
    title: 'Atrium Cu 2',
    slug: 'produit-atrium-cu-2',
    meta: { title: 'New Meta Title' },
    savedAt: '',
  }),
  published_blocks: publishedBlocks,
};
const view = draftView(row);
assert('pending title wins', view.title === 'Atrium Cu 2');
assert('pending slug wins', view.slug === 'produit-atrium-cu-2');
assert('pending meta wins', view.meta.title === 'New Meta Title');
assert('live previousSlugs are kept in the view', stableStringify(view.meta.previousSlugs) === '["produit-atrium"]');
assert('view blocks have no _pending', !('_pending' in (view.blocks as object)));
const plain = draftView({ ...row, draft_blocks: publishedBlocks });
assert('no pending → live settings', plain.title === 'Atrium Cu' && plain.slug === 'produit-atrium-cu' && plain.meta.ogImage === 'https://x/old.jpg');

// ── Unpublished changes ─────────────────────────────────────────────────────
console.log('\nhasUnpublishedChanges');
assert('pending → true', hasUnpublishedChanges(row));
assert('same blocks, no pending → false', !hasUnpublishedChanges({ ...row, draft_blocks: publishedBlocks }));
assert(
  'blocks differ → true',
  hasUnpublishedChanges({ ...row, draft_blocks: { en: [block('a', 'changed')], fr: publishedBlocks.fr } })
);
assert(
  'key order / editor defaults do not count',
  blocksEqual(
    { fr: publishedBlocks.fr, en: [{ id: 'a', type: 'text', order: 0, data: { content: 'hello' } }] },
    publishedBlocks
  )
);
assert('draft page → always false', !hasUnpublishedChanges({ ...row, status: 'draft' }));
assert('unpublished draft_blocks vs null published → false for draft', !hasUnpublishedChanges({ ...row, status: 'draft', published_blocks: null }));

// ── Publish: meta + previousSlugs ───────────────────────────────────────────
console.log('\npublishedMeta');
const pm = publishedMeta({ title: 'T', previousSlugs: ['injected'] }, { slug: 'old', meta: { previousSlugs: ['older'] }, wasPublic: true }, 'new');
assert('old public slug recorded first', stableStringify(pm.previousSlugs) === '["old","older"]');
assert('submitted previousSlugs ignored', !(pm.previousSlugs as string[]).includes('injected'));
assert('editable meta applied', pm.title === 'T');
const back = publishedMeta({}, { slug: 'new', meta: { previousSlugs: ['old', 'older'] }, wasPublic: true }, 'old');
assert('renaming back removes the new slug from the list (no self-redirect)', stableStringify(back.previousSlugs) === '["new","older"]');
const same = publishedMeta({ a: 1 }, { slug: 's', meta: {}, wasPublic: true }, 's');
assert('no slug change → no previousSlugs key', !('previousSlugs' in same));
const draftRename = publishedMeta({}, { slug: 'draft-old', meta: {}, wasPublic: false }, 'draft-new');
assert('never-public page: old slug not recorded', !('previousSlugs' in draftRename));
const many = publishedMeta(
  {},
  { slug: 's0', meta: { previousSlugs: Array.from({ length: 30 }, (_, i) => `p${i}`) }, wasPublic: true },
  's-new'
);
assert(`list capped at ${MAX_PREVIOUS_SLUGS}`, (many.previousSlugs as string[]).length === MAX_PREVIOUS_SLUGS);
const dup = publishedMeta({}, { slug: 'a', meta: { previousSlugs: ['a', 'b'] }, wasPublic: true }, 'c');
assert('deduplicated', stableStringify(dup.previousSlugs) === '["a","b"]');
assert('previousSlugsOf sanitises', stableStringify(previousSlugsOf({ previousSlugs: ['a', 3, '', null] })) === '["a"]');
assert('editableMeta drops previousSlugs only', stableStringify(editableMeta({ a: 1, previousSlugs: ['x'] })) === '{"a":1}');

// ── Old-slug redirect resolution ────────────────────────────────────────────
console.log('\npreviousSlugTarget');
const candidates = [
  { slug: 'produit-atrium-cu-2', meta: { previousSlugs: ['produit-atrium-cu', 'produit-atrium'] } },
  { slug: 'about-us', meta: { previousSlugs: ['about'] } },
];
const t = previousSlugTarget(candidates, 'produit-atrium-cu');
assert('old product slug → current slug', t === 'produit-atrium-cu-2');
assert('…whose public URL is the final canonical one (single hop)', publicPathForPage('fr', t!) === '/fr/produit/atrium-cu-2');
assert('EN canonical', publicPathForPage('en', t!) === '/en/product/atrium-cu-2');
assert('two renames ago still resolves to the final URL', previousSlugTarget(candidates, 'produit-atrium') === 'produit-atrium-cu-2');
assert('plain page', previousSlugTarget(candidates, 'about') === 'about-us');
assert('unknown slug → null', previousSlugTarget(candidates, 'nope') === null);
assert(
  'never redirects a slug to itself',
  previousSlugTarget([{ slug: 'loop', meta: { previousSlugs: ['loop'] } }], 'loop') === null
);
assert('malformed meta ignored', previousSlugTarget([{ slug: 'x', meta: { previousSlugs: 'about' } }], 'about') === null);

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
