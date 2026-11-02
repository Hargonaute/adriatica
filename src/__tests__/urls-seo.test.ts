/**
 * Public URL + SEO helper tests (Phase 3)
 *
 * Locks in:
 *   - one public product URL per locale (/fr/produit/x, /en/product/x) and the
 *     single-hop 308 map from every legacy form
 *   - canonical / hreflang / Open Graph built by buildPageMetadata()
 *   - per-locale meta (meta.en) resolution + its survival through validation
 *   - JSON-LD builders never emit empty TODO-CLIENT values
 *
 * Run: npx tsx src/__tests__/urls-seo.test.ts
 */

import { validatePageData } from '../lib/page-builder/json/validate';
import {
  legacyPublicRedirect,
  productPath,
  publicPathForPage,
  revalidationPathsForPage,
  productSlugFromPageSlug,
} from '../lib/products/productUrl';
import { familleSlug } from '../lib/products/familleSlugs';
import { FAMILLES } from '../lib/products/productMeta';
import { buildLanguageAlternates, buildPageMetadata, hasBlocks, resolvePageMeta } from '../lib/seo/metadata';
import { breadcrumbJsonLd, organizationJsonLd, productJsonLd } from '../lib/seo/jsonLd';
import { SITE_URL, absoluteUrl } from '../lib/site';

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

// ── product URLs ──────────────────────────────────────────────────────────────

section('product URL helpers');
assert('FR product path', productPath('fr', 'atrium-cu') === '/fr/produit/atrium-cu');
assert('EN product path', productPath('en', 'atrium-cu') === '/en/product/atrium-cu');
assert('page slug → product slug', productSlugFromPageSlug('produit-atrium-cu') === 'atrium-cu');
assert('"produit-" alone is not a product', productSlugFromPageSlug('produit-') === null);
assert('non-product slug', productSlugFromPageSlug('about') === null);
assert('publicPathForPage: product', publicPathForPage('en', 'produit-atrium-cu') === '/en/product/atrium-cu');
assert('publicPathForPage: other page keeps /{l}/{slug}', publicPathForPage('fr', 'about') === '/fr/about');
assert(
  'revalidation paths for a product = both canonical URLs',
  eq(revalidationPathsForPage('produit-x'), ['/fr/produit/x', '/en/product/x'])
);

section('legacyPublicRedirect(): every non-canonical form → final URL (one hop)');
const cases: [string, string | null][] = [
  ['/fr/produit-atrium-cu', '/fr/produit/atrium-cu'],
  ['/en/produit-atrium-cu', '/en/product/atrium-cu'],
  ['/produit-atrium-cu', '/fr/produit/atrium-cu'],
  ['/fr/product/atrium-cu', '/fr/produit/atrium-cu'],
  ['/en/produit/atrium-cu', '/en/product/atrium-cu'],
  ['/produit/atrium-cu', '/fr/produit/atrium-cu'],
  ['/product/atrium-cu', '/fr/produit/atrium-cu'],
  ['/fr/produit', '/fr/trouver-une-solution'],
  ['/en/produit', '/en/find-a-solution'],
  ['/en/product', '/en/find-a-solution'],
  ['/fr/collections/produit', '/fr/trouver-une-solution'],
  ['/en/collections/produit', '/en/find-a-solution'],
  ['/en/produits', '/en/products'],
  ['/fr/products', '/fr/produits'],
  ['/en/trouver-une-solution', '/en/find-a-solution'],
  ['/fr/research-and-development', '/fr/recherche-et-developpement'],
  ['/products', '/fr/produits'],
  // canonical / not ours → null
  ['/fr/produit/atrium-cu', null],
  ['/en/product/atrium-cu', null],
  ['/fr/produits', null],
  ['/en/products', null],
  ['/fr/contact', null],
  ['/en/contact', null],
  ['/fr', null],
  ['/', null],
  ['/fr/legal/terms', null],
  ['/fr/collections/produit/atrium-cu', null], // DB lookup in the route
  ['/fr/some-cms-page', null],
  ['/contact', null], // plain locale-prefix redirect (proxy) handles it
];
cases.forEach(([from, to]) => assert(`${from} → ${to ?? '(none)'}`, legacyPublicRedirect(from) === to));
assert(
  'no redirect target is itself redirected (no chains)',
  cases.every(([, to]) => to === null || legacyPublicRedirect(to) === null)
);

// ── metadata ──────────────────────────────────────────────────────────────────

section('buildPageMetadata(): canonical, hreflang, Open Graph');
const md = buildPageMetadata({
  locale: 'en',
  paths: { fr: '/fr/produit/x', en: '/en/product/x' },
  title: 'X',
  description: 'D',
});
const alt = md.alternates as { canonical: string; languages: Record<string, string> };
assert('canonical is absolute + self', alt.canonical === `${SITE_URL}/en/product/x`);
assert('default SITE_URL is https://www.adriatica.ma', SITE_URL === 'https://www.adriatica.ma');
assert(
  'hreflang fr / en / x-default (= fr)',
  eq(alt.languages, {
    fr: `${SITE_URL}/fr/produit/x`,
    en: `${SITE_URL}/en/product/x`,
    'x-default': `${SITE_URL}/fr/produit/x`,
  })
);
const og = md.openGraph as Record<string, unknown>;
assert('og:url = canonical', og.url === alt.canonical);
assert('og:locale en_US + alternate fr_FR', og.locale === 'en_US' && eq(og.alternateLocale, ['fr_FR']));
assert('og:site_name + og:type kept', og.siteName === 'Adriatica' && og.type === 'website');
assert('default og:image 1200×630', eq(og.images, [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'Adriatica' }]));
assert('no robots unless noIndex', md.robots === undefined);

const frOnly = buildPageMetadata({
  locale: 'en',
  selfPath: '/en/product/y?utm_source=x',
  paths: { fr: '/fr/produit/y' },
  image: 'https://blob.example/y.png',
  noIndex: true,
});
const frAlt = frOnly.alternates as { canonical: string; languages: Record<string, string> };
assert('canonical strips query params', frAlt.canonical === `${SITE_URL}/en/product/y`);
assert('empty locale omitted from hreflang', eq(Object.keys(frAlt.languages), ['fr', 'x-default']));
assert('explicit image used', eq((frOnly.openGraph as { images: unknown }).images, [{ url: 'https://blob.example/y.png' }]));
assert('noIndex → robots index:false', eq(frOnly.robots, { index: false, follow: true }));
assert('x-default falls back to the only locale', buildLanguageAlternates({ en: '/en/a' })['x-default'] === `${SITE_URL}/en/a`);
assert('absoluteUrl keeps absolute URLs', absoluteUrl('https://a.b/c') === 'https://a.b/c');

section('resolvePageMeta(): per-locale meta with fallbacks');
const meta = { title: 'Titre FR', description: 'Desc FR', en: { title: 'EN title', description: 'EN desc' } };
assert('FR uses top-level fields', eq(resolvePageMeta(meta, 'fr', 'Page'), { title: 'Titre FR', description: 'Desc FR' }));
assert('EN uses meta.en', eq(resolvePageMeta(meta, 'en', 'Page', 'Hero'), { title: 'EN title', description: 'EN desc' }));
assert(
  'EN without meta.en → EN hero title, FR description',
  eq(resolvePageMeta({ title: 'Titre FR', description: 'Desc FR' }, 'en', 'Page', 'Hero EN'), {
    title: 'Hero EN',
    description: 'Desc FR',
  })
);
assert(
  'EN without meta.en nor hero → existing behaviour',
  eq(resolvePageMeta({ title: '', description: '' }, 'en', 'Page'), { title: 'Page', description: undefined })
);
assert('blank meta.en.title is ignored', resolvePageMeta({ title: 'T', en: { title: '  ' } }, 'en', 'P').title === 'T');
assert('hasBlocks', hasBlocks({ fr: [{}], en: [] }, 'fr') && !hasBlocks({ fr: [{}], en: [] }, 'en') && !hasBlocks(null, 'fr'));

section('validatePageData() keeps meta.en');
const basePage = {
  id: 'p1',
  slug: 'produit-x',
  title: 'X',
  blocks: { en: [], fr: [] },
  status: 'draft' as const,
  schemaVersion: 1,
};
const v = validatePageData({ ...basePage, meta: { title: 'T', en: { title: 'EN T', description: 'EN D' } } });
assert('valid', v.success);
assert('meta.en survives', eq(v.data?.meta.en, { title: 'EN T', description: 'EN D' }));
const bad = validatePageData({ ...basePage, meta: { title: 'T', en: 'not an object' } });
assert('malformed meta.en never blocks a save', bad.success);
assert('malformed meta.en is dropped', bad.data?.meta.en === undefined && bad.data?.meta.title === 'T');

// ── JSON-LD ───────────────────────────────────────────────────────────────────

section('JSON-LD builders');
const org = organizationJsonLd();
const orgStr = JSON.stringify(org);
assert('Organization type + name', org['@type'] === 'Organization' && org.name === 'Maghreb Adriatica');
assert('Organization logo absolute', org.logo === `${SITE_URL}/images%20Adriatica/logo.png`);
assert('no empty values emitted (TODO-CLIENT placeholders)', !orgStr.includes('""') && !('sameAs' in org));
const prod = productJsonLd({ name: 'Atrium Cu', url: `${SITE_URL}/fr/produit/atrium-cu`, image: '/a.png', category: 'Correcteurs de carences' });
assert('Product: absolute image, brand, category, no offers', prod.image === `${SITE_URL}/a.png` && !!prod.brand && prod.category === 'Correcteurs de carences' && !('offers' in prod));
assert('Product: missing description not emitted', !('description' in prod));
const bc = breadcrumbJsonLd([{ name: 'Accueil', url: '/fr' }, { name: 'X', url: `${SITE_URL}/fr/produit/x` }]);
assert('BreadcrumbList positions + absolute items', eq(bc.itemListElement, [
  { '@type': 'ListItem', position: 1, name: 'Accueil', item: `${SITE_URL}/fr` },
  { '@type': 'ListItem', position: 2, name: 'X', item: `${SITE_URL}/fr/produit/x` },
]));
assert('every famille has a provisional slug', FAMILLES.every((f) => !!familleSlug(f)));
assert('famille slug lookup is case/accent-insensitive', familleSlug('ADJUVANTS ET REGULATEURS DE PH') === 'adjuvants-et-regulateurs-de-ph');

// ── result ───────────────────────────────────────────────────────────────────

console.log(`\n${'─'.repeat(40)}`);
console.log(`Result: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
