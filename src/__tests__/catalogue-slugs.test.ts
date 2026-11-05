/**
 * Filtered catalogue tests (Lot B)
 *
 * Locks in:
 *   - B6 the FROZEN slug list (a changed / removed / added slug fails here on
 *     purpose: slugs are public URLs), uniqueness, FR labels = editor
 *     constants, every stored label maps to a slug
 *   - B8 "NPK hydrosolubles" famille + read-path bridge + import validation
 *   - B2/B3 URL parameter normalisation (308 targets) and slug filtering
 *   - B4 SEO rules per combination, canonical / hreflang with the query
 *   - intro texts sanitising, reserved page slug
 *
 * Run: npx tsx src/__tests__/catalogue-slugs.test.ts
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  CATALOGUE_FACETS,
  CATALOGUE_TERMS,
  slugForLabel,
  termBySlug,
  termForLabel,
  type CatalogueFacet,
} from '../lib/products/catalogueSlugs';
import {
  catalogueQuery,
  catalogueSeo,
  matchesCatalogueFilters,
  normalizeCatalogueParams,
} from '../lib/products/catalogueFilter';
import {
  CULTURES,
  FAMILLES,
  PROBLEMATIQUES,
  buildProductFilterItems,
  foldKey,
  productMetaProblems,
  publicProductFacets,
  type ProductPageInput,
} from '../lib/products/productMeta';
import { rowToProductMeta, type CatalogueRow } from '../lib/products/importPlan';
import { catalogueCards, catalogueOptions, filterCards } from '../lib/products/catalogueView';
import { catalogueHref } from '../lib/i18n/solutionHref';
import { buildPageMetadata } from '../lib/seo/metadata';
import { SITE_URL } from '../lib/site';
import {
  CATALOGUE_INTROS_SLUG,
  introFor,
  introParagraphs,
  isReservedPageSlug,
  sanitizeIntros,
} from '../lib/products/catalogueIntros';

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
const slugs = (f: CatalogueFacet) => CATALOGUE_TERMS[f].map((t) => t.slug);

// ── B6: frozen slugs ──────────────────────────────────────────────────────────

section('B6 frozen slug list (snapshot — never change a slug)');

const FROZEN: Record<CatalogueFacet, string[]> = {
  famille: [
    'biostimulants-et-engrais-organiques',
    'correcteurs-de-carences',
    'adjuvants-et-regulateurs-de-ph',
    'engrais-nutritionnels',
    'engrais-conventionnels',
    'npk-hydrosolubles',
  ],
  culture: [
    'agrumes',
    'arbres-fruitiers',
    'bananier',
    'cereales',
    'fraisier',
    'hydroponie',
    'maraichage',
    'olivier',
    'ornementales',
    'pomme-de-terre',
    'tomate',
    'vigne',
  ],
  probleme: [
    'stimulation-de-racines-croissance-vegetative-anti-stress',
    'anti-stress-resistance-aux-conditions-difficiles',
    'amelioration-du-sol-structure-mo-microbiologie-anti-stress',
    'correcteurs-de-carences-en-fer',
    'correcteurs-de-carences-en-bore',
    'correcteurs-de-carences-en-cuivre',
    'correcteur-de-carence-en-zinc',
    'correcteur-de-carence-en-molybdene',
    'correcteur-de-carence-en-calcium',
    'correcteur-complet-d-oligo-elements-b-cu-fe-mn-mo-zn',
    'regulateurs-de-ph-conditionneurs-de-bouillie',
    'acidifiants-correcteurs-de-ph',
    'boosters-potassiques',
    'floraison-nouaison-amelioration-des-fruits',
    'troubles-physiologiques-des-plantes',
    'desalinisant-solutions-calcio-potassiques',
    'conventionnel-granule',
    'conventionnel-hydrosolubles',
  ],
};

CATALOGUE_FACETS.forEach((f) => {
  assert(`${f}: slug list equals the frozen snapshot (${FROZEN[f].length})`, eq(slugs(f), FROZEN[f]));
  assert(`${f}: slugs unique`, new Set(slugs(f)).size === slugs(f).length);
  assert(`${f}: FR labels unique (folded)`, new Set(CATALOGUE_TERMS[f].map((t) => foldKey(t.fr))).size === CATALOGUE_TERMS[f].length);
  assert(`${f}: slugs are [a-z0-9-] only`, slugs(f).every((s) => /^[a-z0-9]+(-[a-z0-9]+)*$/.test(s)));
  assert(`${f}: every EN label filled`, CATALOGUE_TERMS[f].every((t) => t.en.trim().length > 0));
});
assert('counts: 6 familles, 12 cultures, 18 problématiques', FAMILLES.length === 6 && CULTURES.length === 12 && PROBLEMATIQUES.length === 18);
assert('NPK EN label is the client\'s', termBySlug('famille', 'npk-hydrosolubles')?.en === 'Water-soluble NPK');
assert('"NPK hydrosolubles" is no longer a problématique', !termForLabel('probleme', 'NPK hydrosolubles') && !(PROBLEMATIQUES as readonly string[]).includes('NPK hydrosolubles'));

section('B6 editor constants ↔ slug map (both directions, exact characters)');
const constants: [CatalogueFacet, readonly string[]][] = [
  ['famille', FAMILLES],
  ['culture', CULTURES],
  ['probleme', PROBLEMATIQUES],
];
constants.forEach(([f, list]) => {
  assert(`${f}: every editor constant maps to a slug`, list.every((l) => !!slugForLabel(f, l)));
  assert(`${f}: map FR labels are exactly the editor constants (same order)`, eq(CATALOGUE_TERMS[f].map((t) => t.fr), [...list]));
});
assert('label lookup ignores case / accents / apostrophe / dashes',
  slugForLabel('probleme', "CORRECTEUR COMPLET D'OLIGO-ELEMENTS (B, CU, FE, MN, MO, ZN)") === 'correcteur-complet-d-oligo-elements-b-cu-fe-mn-mo-zn' &&
  slugForLabel('probleme', 'Amélioration du sol (structure - MO - microbiologie) & anti-stress') === 'amelioration-du-sol-structure-mo-microbiologie-anti-stress');

section('B6 every value stored on product pages maps (snapshot of cmstest = prod copy, 2026-11-02)');
// SELECT DISTINCT values of meta.product on published product pages.
const STORED = {
  famille: ['Adjuvants et régulateurs de pH', 'Biostimulants et engrais organiques', 'Correcteurs de carences', 'Engrais conventionnels', 'Engrais nutritionnels'],
  culture: ['Agrumes', 'Arbres fruitiers', 'Bananier', 'Céréales', 'Fraisier', 'Hydroponie', 'Maraîchage', 'Olivier', 'Ornementales', 'Pomme de terre', 'Tomate', 'Vigne'],
  probleme: [
    'Acidifiants & correcteurs de pH',
    'Amélioration du sol (structure – MO – microbiologie) & anti-stress',
    'Anti-stress & résistance aux conditions difficiles',
    'Boosters potassiques',
    'Conventionnel granulé',
    'Conventionnel hydrosolubles',
    'Correcteur complet d’oligo-éléments (B, Cu, Fe, Mn, Mo, Zn)',
    'Correcteur de carence en calcium',
    'Correcteur de carence en molybdène',
    'Correcteur de carence en zinc',
    'Correcteurs de carences en bore',
    'Correcteurs de carences en cuivre',
    'Correcteurs de carences en fer',
    'Désalinisant & solutions calcio-potassiques',
    'Floraison – nouaison – amélioration des fruits',
    'Régulateurs de pH & conditionneurs de bouillie',
    'Stimulation de racines, croissance végétative & anti-stress',
    'Troubles physiologiques des plantes',
  ],
};
(Object.keys(STORED) as CatalogueFacet[]).forEach((f) => {
  const unmapped = STORED[f].filter((l) => !slugForLabel(f, l));
  assert(`${f}: every stored value maps (${STORED[f].length})${unmapped.length ? ` — unmapped: ${unmapped.join(', ')}` : ''}`, unmapped.length === 0);
});
assert('stored problématique "NPK hydrosolubles" is handled by the bridge (famille)',
  publicProductFacets({ product: { famille: 'Engrais conventionnels', problematiques: ['NPK hydrosolubles'], cultures: [] } })?.famille === 'NPK hydrosolubles');

const catalogue = JSON.parse(readFileSync(join(__dirname, '../../tools/product-meta/catalogue.json'), 'utf8')) as CatalogueRow[];
const metas = catalogue.map(rowToProductMeta);
assert('catalogue.json: every famille maps', metas.every((m) => !m.famille || !!slugForLabel('famille', m.famille)));
assert('catalogue.json: every problématique maps', metas.every((m) => (m.problematiques ?? []).every((p) => !!slugForLabel('probleme', p))));
assert('catalogue.json: every culture maps', metas.every((m) => (m.cultures ?? []).every((c) => !!slugForLabel('culture', c))));

// ── B8 bridge + filter items ──────────────────────────────────────────────────

section('B8 NPK bridge in the filter items');
const page = (slug: string, product: unknown, en?: string): ProductPageInput => ({
  id: slug,
  slug,
  title: slug,
  meta: { product },
  blocks: [{ id: 'h', type: 'product-hero', order: 0, data: { title: slug.replace('produit-', '').toUpperCase(), image: `/${slug}.png` } }],
  ...(en ? { blocksEn: [{ id: 'h', type: 'product-hero', order: 0, data: { title: en } }] } : {}),
});
const items = buildProductFilterItems(
  [
    page('produit-idron-a', { famille: 'Engrais conventionnels', problematiques: ['NPK hydrosolubles'], cultures: ['Tomate'] }),
    page('produit-idron-b', { famille: 'Engrais conventionnels', problematiques: ['NPK HYDROSOLUBLES', 'Boosters potassiques'], cultures: ['Vigne'] }),
    page('produit-granule', { famille: 'Engrais conventionnels', problematiques: ['Conventionnel granulé'], cultures: ['Céréales'] }, 'Granular EN'),
    page('produit-fer', { famille: 'Correcteurs de carences', problematiques: ['Correcteurs de carences en fer'], cultures: ['Agrumes', 'Tomate'] }),
    page('produit-reclassified', { famille: 'NPK hydrosolubles', problematiques: [], cultures: ['Tomate'] }),
  ],
  []
);
const byId = new Map(items.map((i) => [i.id, i]));
assert('NPK problématique → famille npk-hydrosolubles', eq(byId.get('produit-idron-a')?.facetSlugs.famille, ['npk-hydrosolubles']));
assert('NPK problématique dropped, others kept', eq(byId.get('produit-idron-b')?.facetSlugs.probleme, ['boosters-potassiques']) && eq(byId.get('produit-idron-b')?.problematiques, ['Boosters potassiques']));
assert('already reclassified page reads the same', eq(byId.get('produit-reclassified')?.facetSlugs.famille, ['npk-hydrosolubles']));
const fam = (s: string) => items.filter((i) => matchesCatalogueFilters(i.facetSlugs, { famille: s })).map((i) => i.id).sort();
assert('?famille=npk-hydrosolubles → the NPK products', eq(fam('npk-hydrosolubles'), ['produit-idron-a', 'produit-idron-b', 'produit-reclassified']));
assert('?famille=engrais-conventionnels no longer lists them', eq(fam('engrais-conventionnels'), ['produit-granule']));
assert('famille + culture combine (AND)', eq(items.filter((i) => matchesCatalogueFilters(i.facetSlugs, { famille: 'correcteurs-de-carences', culture: 'tomate' })).map((i) => i.id), ['produit-fer']));
assert('EN name from the EN Product Hero', byId.get('produit-granule')?.nameEn === 'Granular EN' && byId.get('produit-fer')?.nameEn === undefined);

section('catalogueCards / catalogueOptions (per locale)');
const frCards = catalogueCards(items, 'fr');
const enCards = catalogueCards(items, 'en');
assert('FR card links to /fr/produit/<slug>', frCards.find((c) => c.id === 'produit-fer')?.href === '/fr/produit/fer');
assert('EN card links to /en/product/<slug>', enCards.find((c) => c.id === 'produit-fer')?.href === '/en/product/fer');
assert('EN card uses the EN name, else the FR name', enCards.find((c) => c.id === 'produit-granule')?.name === 'Granular EN' && enCards.find((c) => c.id === 'produit-fer')?.name === 'FER');
assert('FR card keeps the FR name', frCards.find((c) => c.id === 'produit-granule')?.name === 'GRANULE');
assert('search text includes EN facet labels on EN', enCards.find((c) => c.id === 'produit-fer')!.searchText.includes('citrus'));
assert('filterCards = server-rendered list', eq(filterCards(frCards, { famille: 'npk-hydrosolubles' }).map((c) => c.id).sort(), fam('npk-hydrosolubles')));
const enOpts = catalogueOptions(items, 'en');
assert('EN famille options use EN labels', enOpts.famille.some((o) => o.slug === 'npk-hydrosolubles' && o.label === 'Water-soluble NPK'));
assert('options only list values present on products', !enOpts.famille.some((o) => o.slug === 'engrais-nutritionnels'));
assert('selected value always listed', catalogueOptions(items, 'fr', { famille: 'engrais-nutritionnels' }).famille.some((o) => o.slug === 'engrais-nutritionnels'));
assert('options sorted by label', eq(enOpts.culture.map((o) => o.label), [...enOpts.culture.map((o) => o.label)].sort((a, b) => a.localeCompare(b, 'en'))));

section('B8 JSON import validation (productMetaProblems)');
assert('valid product → no problem', productMetaProblems({ famille: 'NPK hydrosolubles', problematiques: ['Boosters potassiques'], cultures: ['Tomate'] }).length === 0);
assert('case / accents tolerated', productMetaProblems({ famille: 'correcteurs de carences', cultures: ['cereales'] }).length === 0);
assert('no product → no problem', productMetaProblems(undefined).length === 0);
assert('unknown famille rejected', productMetaProblems({ famille: 'Engrais azotés' }).some((p) => p.includes('unknown famille')));
assert('unknown culture rejected', productMetaProblems({ cultures: ['Mangue'] }).some((p) => p.includes('unknown culture')));
assert('NPK as problématique rejected with a hint', productMetaProblems({ problematiques: ['NPK hydrosolubles'] }).some((p) => p.includes('now a famille')));
assert('wrong types rejected', productMetaProblems({ cultures: 'Tomate' }).length === 1 && productMetaProblems('x').length === 1);

// ── URL parameters ────────────────────────────────────────────────────────────

section('normalizeCatalogueParams (308 rules)');
const n = (q: string) => normalizeCatalogueParams(new URLSearchParams(q));
assert('no params → canonical, no redirect', eq(n(''), { filters: {}, query: '', changed: false }));
assert('canonical single param kept', !n('famille=correcteurs-de-carences').changed && n('famille=correcteurs-de-carences').query === 'famille=correcteurs-de-carences');
assert('canonical order kept', !n('famille=engrais-nutritionnels&culture=tomate&probleme=boosters-potassiques').changed);
assert('wrong order → redirect to canonical order', n('culture=agrumes&famille=correcteurs-de-carences').changed && n('culture=agrumes&famille=correcteurs-de-carences').query === 'famille=correcteurs-de-carences&culture=agrumes');
assert('unknown slug → dropped', n('famille=unknown').changed && n('famille=unknown').query === '');
assert('unknown param → dropped', n('famille=vigne&utm_source=x').query === '' && n('culture=vigne&utm_source=x').query === 'culture=vigne');
assert('empty value → dropped', n('famille=').changed && n('famille=').query === '');
assert('repeated param → first known value', n('culture=x&culture=tomate&culture=vigne').query === 'culture=tomate');
assert('?probleme=npk-hydrosolubles → ?famille=npk-hydrosolubles', n('probleme=npk-hydrosolubles').changed && n('probleme=npk-hydrosolubles').query === 'famille=npk-hydrosolubles');
assert('NPK move merges with other params, canonical order', n('culture=tomate&probleme=npk-hydrosolubles').query === 'famille=npk-hydrosolubles&culture=tomate');
assert('explicit famille wins over the moved one', n('probleme=npk-hydrosolubles&famille=correcteurs-de-carences').query === 'famille=correcteurs-de-carences');
assert('Next searchParams object (arrays) supported', normalizeCatalogueParams({ culture: ['tomate', 'vigne'], famille: undefined }).query === 'culture=tomate');
assert('slugs are case-sensitive (frozen)', n('famille=Correcteurs-De-Carences').query === '');
assert('catalogueQuery canonical order', catalogueQuery({ probleme: 'boosters-potassiques', famille: 'engrais-nutritionnels' }) === 'famille=engrais-nutritionnels&probleme=boosters-potassiques');

section('catalogueHref (one helper for every link)');
assert('FR', catalogueHref('fr', { famille: 'correcteurs-de-carences' }) === '/fr/trouver-une-solution?famille=correcteurs-de-carences');
assert('EN path from pathForKey', catalogueHref('en', { culture: 'tomate' }) === '/en/find-a-solution?culture=tomate');
assert('no filter → page', catalogueHref('fr') === '/fr/trouver-une-solution');
assert('unknown slug dropped', catalogueHref('fr', { famille: 'nope' }) === '/fr/trouver-une-solution');
assert('retired slug follows its move', catalogueHref('fr', { probleme: 'npk-hydrosolubles' }) === '/fr/trouver-une-solution?famille=npk-hydrosolubles');

// ── B4 SEO ────────────────────────────────────────────────────────────────────

section('B4 SEO per combination');
assert('no param: index, canonical self, in sitemap', eq(catalogueSeo({}), { index: true, canonicalQuery: '', inSitemap: true, single: null }));
const sf = catalogueSeo({ famille: 'correcteurs-de-carences' });
assert('one famille: index, canonical self, in sitemap', sf.index && sf.inSitemap && sf.canonicalQuery === 'famille=correcteurs-de-carences' && sf.single?.term.fr === 'Correcteurs de carences');
const sc = catalogueSeo({ culture: 'vigne' });
assert('one culture: index, canonical self, in sitemap', sc.index && sc.inSitemap && sc.canonicalQuery === 'culture=vigne');
const sp = catalogueSeo({ probleme: 'boosters-potassiques' });
assert('one probleme: index, canonical self, NOT in sitemap', sp.index && !sp.inSitemap && sp.canonicalQuery === 'probleme=boosters-potassiques');
const s2 = catalogueSeo({ famille: 'correcteurs-de-carences', culture: 'vigne' });
assert('two params: noindex, canonical without params, not in sitemap', !s2.index && !s2.inSitemap && s2.canonicalQuery === '' && s2.single === null);

const meta = buildPageMetadata({
  locale: 'en',
  paths: { fr: '/fr/trouver-une-solution', en: '/en/find-a-solution' },
  query: 'culture=tomate',
  title: 'Tomato — Find a solution',
});
assert('canonical keeps the normalised query', meta.alternates?.canonical === `${SITE_URL}/en/find-a-solution?culture=tomate`);
const langs = meta.alternates?.languages as Record<string, string>;
assert('hreflang: same query on /fr and /en + x-default',
  langs.fr === `${SITE_URL}/fr/trouver-une-solution?culture=tomate` &&
  langs.en === `${SITE_URL}/en/find-a-solution?culture=tomate` &&
  langs['x-default'] === `${SITE_URL}/fr/trouver-une-solution?culture=tomate`);
assert('og:url = canonical', (meta.openGraph as { url?: string }).url === `${SITE_URL}/en/find-a-solution?culture=tomate`);
const plain = buildPageMetadata({ locale: 'fr', paths: { fr: '/fr/contact?utm=x' } });
assert('without `query`, canonical still never carries params', plain.alternates?.canonical === `${SITE_URL}/fr/contact`);

// ── intros ────────────────────────────────────────────────────────────────────

section('Catalogue intros (reserved row)');
assert('reserved slug is not a creatable page slug', isReservedPageSlug(CATALOGUE_INTROS_SLUG) && !/^[a-z0-9-]+$/.test(CATALOGUE_INTROS_SLUG));
assert('normal slugs are not reserved', !isReservedPageSlug('produit-x') && !isReservedPageSlug('contact'));
const empty = sanitizeIntros(null);
assert('empty store → every famille (6) and culture (12) with empty texts',
  Object.keys(empty.famille).length === 6 && Object.keys(empty.culture).length === 12 &&
  Object.values(empty.famille).every((t) => t.fr === '' && t.en === ''));
const s = sanitizeIntros({
  famille: { 'correcteurs-de-carences': { fr: '  Texte FR  ', en: 42 }, 'unknown-slug': { fr: 'x' } },
  culture: { vigne: { fr: 'a'.repeat(5000) } },
  probleme: { 'boosters-potassiques': { fr: 'x' } },
});
assert('texts trimmed, non-strings dropped', s.famille['correcteurs-de-carences'].fr === 'Texte FR' && s.famille['correcteurs-de-carences'].en === '');
assert('unknown slugs / facets dropped', !('unknown-slug' in s.famille) && !('probleme' in s));
assert('texts capped', s.culture.vigne.fr.length === 1500);
assert('introFor by locale; empty when none', introFor(s, 'famille', 'correcteurs-de-carences', 'fr') === 'Texte FR' && introFor(s, 'famille', 'correcteurs-de-carences', 'en') === '');
assert('paragraphs split on blank lines', eq(introParagraphs('Un.\n\nDeux\nsuite.\n\n\n'), ['Un.', 'Deux\nsuite.']));

// ── result ───────────────────────────────────────────────────────────────────

console.log(`\n${'─'.repeat(40)}`);
console.log(`Result: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
