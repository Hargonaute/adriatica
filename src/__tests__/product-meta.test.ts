/**
 * Product filter metadata tests
 *
 * Locks in:
 *   - meta.product survives save-draft / publish validation (and unknown meta
 *     keys are no longer stripped; a malformed product never blocks a save)
 *   - normalisation of catalogue values (case / accents / dashes / lists)
 *   - backwards compatibility of the filter: every legacy collection entry
 *     still yields one card with the same link
 *   - filter matching (multi-value, accent/case-insensitive, search)
 *   - catalogue import planning against the real catalogue.json
 *
 * Run: npx tsx src/__tests__/product-meta.test.ts
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { validatePageData } from '../lib/page-builder/json/validate';
import {
  buildProductFilterItems,
  canonicalValue,
  facetOptions,
  foldKey,
  matchesFilters,
  readProductMeta,
  splitList,
  type LegacyEntryInput,
  type ProductPageInput,
} from '../lib/products/productMeta';
import { inheritCultures, planImport, rowToProductMeta, type CatalogueRow } from '../lib/products/importPlan';

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

function section(name: string) {
  console.log(`\n${name}`);
}

const eq = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

// ── validation ────────────────────────────────────────────────────────────────

section('validatePageData() keeps meta.product and other meta keys');

const basePage = {
  id: 'p1',
  slug: 'produit-atrium-root',
  title: 'Atrium Root',
  blocks: { en: [], fr: [] },
  status: 'draft' as const,
  schemaVersion: 1,
};

const withProduct = validatePageData({
  ...basePage,
  meta: {
    title: 'SEO title',
    noIndex: false,
    product: { famille: 'Engrais nutritionnels', problematiques: ['Boosters potassiques'], cultures: ['Vigne'] },
    somethingElse: 'kept',
  },
});
assert('valid page with meta.product passes', withProduct.success === true);
assert(
  'meta.product is preserved verbatim',
  eq((withProduct.data?.meta as Record<string, unknown>).product, {
    famille: 'Engrais nutritionnels',
    problematiques: ['Boosters potassiques'],
    cultures: ['Vigne'],
  })
);
assert(
  'unknown meta keys are no longer stripped',
  (withProduct.data?.meta as Record<string, unknown>).somethingElse === 'kept'
);
assert('existing SEO fields still preserved', withProduct.data?.meta.title === 'SEO title');

const malformed = validatePageData({ ...basePage, meta: { product: { cultures: 'Vigne' } } });
assert('malformed meta.product never blocks a save', malformed.success === true);

const noMeta = validatePageData({ ...basePage, meta: {} });
assert('page without product meta still valid (regression)', noMeta.success === true);

const badSeo = validatePageData({ ...basePage, meta: { noIndex: 'yes' } });
assert('SEO fields are still type-checked', badSeo.success === false);

// ── normalisation ─────────────────────────────────────────────────────────────

section('normalisation');

assert('foldKey ignores case + accents', foldKey('MARAÎCHAGE') === foldKey('maraichage'));
assert(
  'uppercase sous-catégorie maps to canonical label',
  canonicalValue('problematique', 'CORRECTEURS DE CARENCES EN FER') === 'Correcteurs de carences en fer'
);
assert(
  'dash / apostrophe variants map to canonical',
  canonicalValue('problematique', "CORRECTEUR COMPLET D'OLIGO-ÉLÉMENTS (B, CU, FE, MN, MO, ZN)") ===
    'Correcteur complet d’oligo-éléments (B, Cu, Fe, Mn, Mo, Zn)'
);
assert('unknown value kept as typed (trimmed)', canonicalValue('culture', '  Melon ') === 'Melon');
assert('empty value → empty string', canonicalValue('famille', '   ') === '');
assert(
  'splitList handles · separators',
  eq(splitList('Maraîchage · Arbres fruitiers · Fraisier'), ['Maraîchage', 'Arbres fruitiers', 'Fraisier'])
);
assert('readProductMeta(null) → null', readProductMeta(null) === null);
assert('readProductMeta({}) → null', readProductMeta({}) === null);
assert('readProductMeta with empty product → null', readProductMeta({ product: { cultures: [] } }) === null);
assert(
  'readProductMeta drops non-strings and duplicates',
  eq(readProductMeta({ product: { cultures: ['Vigne', 'VIGNE', 3, ''] } })?.cultures, ['Vigne'])
);
assert(
  'readProductMeta ignores malformed cultures string',
  readProductMeta({ product: { cultures: 'Vigne' } }) === null
);

// ── filter items (backwards compatibility) ───────────────────────────────────

section('buildProductFilterItems() — backwards compatibility');

const legacy: LegacyEntryInput[] = [
  { id: 'e1', slug: 'atrium-root', name: 'Atrium Root', image: 'https://x.public.blob.vercel-storage.com/a.png', culture: 'Vigne', problematique: 'Racines' },
  { id: 'e2', slug: 'black-leo', name: 'Black Leo', image: '', culture: 'Olivier', problematique: '' },
  { id: 'e3', slug: null, name: 'No Slug', image: '', culture: '', problematique: '' },
];
const pages: ProductPageInput[] = [
  {
    id: 'p1',
    slug: 'produit-atrium-root',
    title: 'Atrium Root page',
    meta: { product: { famille: 'Biostimulants et engrais organiques', problematiques: ['STIMULATION DE RACINES, CROISSANCE VÉGÉTATIVE & ANTI-STRESS'], cultures: ['Maraîchage', 'Fraisier'] } },
    blocks: [],
  },
  { id: 'p2', slug: 'produit-black-leo', title: 'Black Leo', meta: { title: 'SEO' }, blocks: [] },
  {
    id: 'p3',
    slug: 'produit-twister',
    title: 'Twister page title',
    meta: { product: { famille: 'Engrais nutritionnels', cultures: ['Vigne'] } },
    blocks: [{ id: 'b', type: 'product-hero', order: 0, data: { title: 'Twister', image: '/produit_page_img/twister.png' } }],
  },
  { id: 'p4', slug: 'produit-untagged', title: 'Untagged', meta: {}, blocks: [] },
];

const items = buildProductFilterItems(pages, legacy);
const byId = new Map(items.map((i) => [i.id, i]));

assert('every legacy entry still produces a card', ['e1', 'e2', 'e3'].every((id) => byId.has(id)));
assert('legacy link unchanged (produit-<entry slug>)', byId.get('e2')?.pathSlug === 'produit-black-leo');
assert('slugless legacy entry kept as unlinked card', byId.get('e3')?.pathSlug === null);
assert('legacy values used when page has no meta.product', eq(byId.get('e2')?.cultures, ['Olivier']));
assert('empty legacy values give empty lists', eq(byId.get('e2')?.problematiques, []));
assert('page meta.product overrides legacy values', eq(byId.get('e1')?.cultures, ['Maraîchage', 'Fraisier']));
assert('page metadata canonicalised', eq(byId.get('e1')?.problematiques, ['Stimulation de racines, croissance végétative & anti-stress']));
assert('legacy image kept', byId.get('e1')?.image === 'https://x.public.blob.vercel-storage.com/a.png');
assert('tagged page without legacy entry is added', byId.get('p3')?.pathSlug === 'produit-twister');
assert('name/image fall back to product-hero', byId.get('p3')?.name === 'Twister' && byId.get('p3')?.image === '/produit_page_img/twister.png');
assert('untagged page without entry stays hidden (as today)', !byId.has('p4'));
assert('no duplicate card for a page that has an entry', !byId.has('p1') && !byId.has('p2'));
assert('items sorted by name', eq(items.map((i) => i.name), ['Atrium Root', 'Black Leo', 'No Slug', 'Twister']));

section('buildProductFilterItems() — image fallback (IDRON case)');

const blob = (n: string) => `https://x.public.blob.vercel-storage.com/${n}.jpg`;
const idronPages: ProductPageInput[] = ['12-12-36', '6-0-48'].map((v) => ({
  id: `pg-${v}`,
  slug: `produit-idron-npk-${v}`,
  title: `IDRON NPK ${v}`,
  meta: { product: { famille: 'Engrais conventionnels', cultures: ['Tomate'] } },
  blocks: [{ id: 'h', type: 'product-hero', order: 0, data: { title: `IDRON NPK ${v} + OE`, image: blob(v) } }],
}));
const idronEntries: LegacyEntryInput[] = [
  { id: 'ie1', slug: 'idron', name: 'IDRON', image: blob('12-12-36'), culture: '', problematique: '' },
  { id: 'ie2', slug: 'idron', name: 'IDRON', image: blob('6-0-48'), culture: '', problematique: '' },
  { id: 'ie3', slug: 'idron', name: 'IDRON', image: blob('unknown'), culture: '', problematique: '' },
  { id: 'ie4', slug: 'nitracid', name: 'NITRACID', image: blob('12-12-36'), culture: '', problematique: '' },
];
const idronItems = buildProductFilterItems(idronPages, idronEntries);
const idronById = new Map(idronItems.map((i) => [i.id, i]));
assert('no duplicate cards: 4 entries + 2 image-matched pages → 4 cards', idronItems.length === 4);
assert('entry matched by image links to the real page', idronById.get('ie1')?.pathSlug === 'produit-idron-npk-12-12-36');
assert('image-matched card uses the specific page name', idronById.get('ie2')?.name === 'IDRON NPK 6-0-48 + OE');
assert('image-matched card gets page metadata', eq(idronById.get('ie1')?.cultures, ['Tomate']) && idronById.get('ie1')?.source === 'page');
assert('entry without matching image unchanged', idronById.get('ie3')?.pathSlug === 'produit-idron' && idronById.get('ie3')?.source === 'collection');
assert('a page is never claimed twice', idronById.get('ie4')?.pathSlug === 'produit-nitracid');
assert('untagged pages are not image-matched', buildProductFilterItems([{ ...idronPages[0], meta: {} }], [idronEntries[0]])[0].pathSlug === 'produit-idron');

// ── matching ──────────────────────────────────────────────────────────────────

section('matchesFilters() / facetOptions()');

const none = { culture: null, famille: null, problematique: null, search: '' };
assert('no filters → everything matches', items.every((i) => matchesFilters(i, none)));
const vigne = items.filter((i) => matchesFilters(i, { ...none, culture: 'Vigne' })).map((i) => i.id);
assert('multi-value culture match', eq(vigne, ['p3']));
const fraisier = items.filter((i) => matchesFilters(i, { ...none, culture: 'fraisier' })).map((i) => i.id);
assert('culture match is case-insensitive', eq(fraisier, ['e1']));
const combined = items.filter((i) =>
  matchesFilters(i, { ...none, culture: 'Vigne', famille: 'Biostimulants et engrais organiques' })
);
assert('filters combine with AND', combined.length === 0);
const searched = items.filter((i) => matchesFilters(i, { ...none, search: 'atrium' })).map((i) => i.id);
assert('search on name', eq(searched, ['e1']));
const searchFam = items.filter((i) => matchesFilters(i, { ...none, search: 'engrais nutri' })).map((i) => i.id);
assert('search also matches famille', eq(searchFam, ['p3']));
const searchAccent = items.filter((i) => matchesFilters(i, { ...none, search: 'vegetative' })).map((i) => i.id);
assert('search is accent-insensitive', eq(searchAccent, ['e1']));
assert('famille options de-duplicated + sorted', eq(facetOptions(items, 'familles'), ['Biostimulants et engrais organiques', 'Engrais nutritionnels']));
assert('culture options built from data', eq(facetOptions(items, 'cultures'), ['Fraisier', 'Maraîchage', 'Olivier', 'Vigne']));

// ── import planning (real catalogue) ─────────────────────────────────────────

section('planImport() against tools/product-meta/catalogue.json');

const catalogue = JSON.parse(
  readFileSync(join(__dirname, '../../tools/product-meta/catalogue.json'), 'utf8')
) as CatalogueRow[];
assert('catalogue has 63 rows', catalogue.length === 63);

const atrium = rowToProductMeta(catalogue.find((r) => r.produit === 'Atrium Root')!);
assert(
  'Atrium Root row → expected metadata',
  eq(atrium, {
    famille: 'Biostimulants et engrais organiques',
    problematiques: ['Stimulation de racines, croissance végétative & anti-stress'],
    cultures: ['Maraîchage', 'Arbres fruitiers', 'Fraisier', 'Bananier'],
  })
);

const allMetas = catalogue.map(rowToProductMeta);
const problematiques = new Set(allMetas.flatMap((m) => m.problematiques ?? []));
assert('casing duplicates merged (21 raw → 19 problématiques)', problematiques.size === 19);

const existing = [
  { id: 'a', slug: 'produit-atrium-root', title: 'Atrium Root', status: 'published', meta: {} },
  { id: 'b', slug: 'produit-black-leo', title: 'Black Leo', status: 'published', meta: { product: { cultures: ['Vigne'] } } },
  { id: 'c', slug: 'produit-sulfate-d-ammonium', title: 'Sulfate', status: 'draft', meta: null },
  { id: 'd', slug: 'produit-old-product', title: 'Old', status: 'published', meta: {} },
];
const plan = planImport(catalogue, existing);
assert('existing pages matched by slugified name (incl. ’ → -)', eq(plan.updates.map((u) => u.slug).sort(), ['produit-atrium-root', 'produit-sulfate-d-ammonium']));
assert('already-tagged page skipped without --overwrite', eq(plan.skippedExisting.map((s) => s.slug), ['produit-black-leo']));
assert('no page is ever created (unmatched rows only reported)', plan.noPage.length === 63 - 3);
assert('pages with no row reported, untouched', eq(plan.pagesWithoutRow, ['produit-old-product']));
const planOverwrite = planImport(catalogue, existing, { overwrite: true });
assert('--overwrite includes tagged page', planOverwrite.updates.some((u) => u.slug === 'produit-black-leo'));
const planOverride = planImport(catalogue, existing, { slugOverrides: { 'Fill K 40 + 4 MgO': 'produit-old-product' } });
assert('slug override maps a row to a differently named page', planOverride.updates.some((u) => u.slug === 'produit-old-product' && u.produit === 'Fill K 40 + 4 MgO'));
const dupPlan = planImport(catalogue, existing, { slugOverrides: { 'Black Leo': 'produit-atrium-root' } });
assert('two rows → one page: neither applied, reported', dupPlan.duplicates.length === 1 && !dupPlan.updates.some((u) => u.slug === 'produit-atrium-root'));
const gammePages = [
  ...existing,
  { id: 'i1', slug: 'produit-idron-npk-20-20-20', title: 'Idron', status: 'published', meta: {} },
  { id: 'i2', slug: 'produit-idron-npk-6-0-48', title: 'Idron', status: 'published', meta: {} },
];
const gammePlan = planImport(catalogue, gammePages, {
  slugOverrides: { Idron: ['produit-idron-npk-20-20-20', 'produit-idron-npk-6-0-48'] },
});
const idronUpdates = gammePlan.updates.filter((u) => u.produit === 'Idron');
assert('array override applies one Gamme row to every variant page', eq(idronUpdates.map((u) => u.slug).sort(), ['produit-idron-npk-20-20-20', 'produit-idron-npk-6-0-48']));
assert('variant pages get the Gamme metadata', idronUpdates.every((u) => u.product.famille === 'Engrais conventionnels' && eq(u.product.cultures, ['Tomate', 'Fraisier', 'Agrumes', 'Ornementales'])));
assert('variant pages no longer reported as without row', !gammePlan.pagesWithoutRow.some((s) => s.startsWith('produit-idron')));
const inh = inheritCultures(catalogue);
const inhBy = new Map(inh.inherited.map((i) => [i.produit, i.from]));
assert('Autre référence inherits from main product above', inhBy.get('Fertea RootActiv S') === 'Atrium Root');
assert('inherited cultures copied', inh.rows.find((r) => r.produit === 'Fertea RootActiv S')?.cultures === catalogue.find((r) => r.produit === 'Atrium Root')?.cultures);
assert('inherits from the nearest main product (AminoBoost ← Vitalmino)', inhBy.get('Fertea AminoBoost 30') === 'Vitalmino');
assert('main product without cultures passes nothing on (Super pH)', !inhBy.has('Super pH'));
assert('Carte rows never inherit (acids)', !inhBy.has('Acide Nitrique'));
assert('Gamme can be a parent (Fertimon Cristal ← K Sol)', inhBy.get('Fertimon Cristal') === 'K Sol');
assert('source rows are not mutated', catalogue.find((r) => r.produit === 'Fertea RootActiv S')?.cultures === '');
const noCult = inh.rows.filter((r) => !r.cultures.trim()).map((r) => r.produit);
console.log('     still without cultures:', noCult.join(', '));
const inheritPlan = planImport(catalogue, [{ id: 'r', slug: 'produit-fertea-rootactiv-s', title: 'x', status: 'published', meta: {} }]);
assert('plan applies inherited cultures + reports them', inheritPlan.updates[0]?.product.cultures?.length === 4 && inheritPlan.inheritedCultures[0]?.from === 'Atrium Root');
assert('row with inherited cultures has no "no Cultures" warning', !inheritPlan.warnings.some((w) => w.message === 'no Cultures'));
assert('rows missing data are warned about', plan.warnings.some((w) => w.produit === 'Sulfate d’Ammonium' && w.message === 'no Cultures'));

// ── result ───────────────────────────────────────────────────────────────────

console.log(`\n${'─'.repeat(40)}`);
console.log(`Result: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
