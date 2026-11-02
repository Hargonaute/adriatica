/**
 * /produits tiles tests (B7)
 *
 * Locks in:
 *   - 8 tiles per locale, in the client's order, with the agreed filter links
 *   - FR and EN tiles link to the same filters (same order)
 *   - the removed tiles stay removed
 *   - hrefs use the localized find-a-solution slug
 *
 * Run: npx tsx src/__tests__/produits-tiles.test.ts
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { solutionFilterHref } from '../lib/i18n/solutionHref';

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

type Tile = { title: string; image: string; filterQuery?: string };
const data = JSON.parse(readFileSync(join(process.cwd(), 'src/data/pages/products.json'), 'utf8')) as Record<
  'fr' | 'en',
  { productsSection: { items: Tile[] } }
>;
const fr = data.fr.productsSection.items;
const en = data.en.productsSection.items;

const expected: [string, string][] = [
  ['Biostimulants', 'famille=biostimulants-et-engrais-organiques'],
  ['Correcteur de carence', 'famille=correcteurs-de-carences'],
  ['Engrais nutritionnels', 'famille=engrais-nutritionnels'],
  ['Adjuvants et régulateurs de pH', 'famille=adjuvants-et-regulateurs-de-ph'],
  ['Acide', 'probleme=acidifiants-correcteurs-de-ph'],
  ['Engrais granulés conventionnels', 'probleme=conventionnel-granule'],
  ['Engrais hydrosolubles', 'probleme=conventionnel-hydrosolubles'],
  ['NPK Hydrosolubles', 'famille=npk-hydrosolubles'],
];

console.log('\ntiles');
assert('FR has 8 tiles', fr.length === 8);
assert('EN has 8 tiles', en.length === 8);
expected.forEach(([title, q], i) => {
  assert(`FR #${i + 1} "${title}" → ?${q}`, fr[i]?.title === title && fr[i]?.filterQuery === q);
  assert(`EN #${i + 1} same filter as FR`, en[i]?.filterQuery === q);
  assert(`EN #${i + 1} same image as FR`, en[i]?.image === fr[i]?.image);
});
for (const removed of ['Engrais azotés', 'Engrais granulés tertiaires', 'NPK Gel', 'Céréales']) {
  assert(`"${removed}" removed`, !fr.some((t) => t.title === removed));
}
for (const removed of ['Nitrogen fertilizers', 'Tertiary granulated fertilizers', 'NPK Gel', 'Cereals']) {
  assert(`"${removed}" removed (EN)`, !en.some((t) => t.title === removed));
}
const imgs = readFileSync(join(process.cwd(), 'src/data/pages/products.json'), 'utf8');
for (const t of fr) {
  let exists = true;
  try {
    readFileSync(join(process.cwd(), 'public', t.image));
  } catch {
    exists = false;
  }
  assert(`image exists for "${t.title}"`, exists && imgs.includes(t.image));
}

console.log('\nsolutionFilterHref');
assert('FR href', solutionFilterHref('fr', 'famille=x') === '/fr/trouver-une-solution?famille=x');
assert('EN href uses the EN slug', solutionFilterHref('en', 'famille=x') === '/en/find-a-solution?famille=x');
assert('leading "?" tolerated', solutionFilterHref('fr', '?probleme=y') === '/fr/trouver-une-solution?probleme=y');
assert('no query → no link', solutionFilterHref('fr', '') === undefined && solutionFilterHref('fr') === undefined);

// ── result ───────────────────────────────────────────────────────────────────

console.log(`\n${'─'.repeat(40)}`);
console.log(`Result: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
