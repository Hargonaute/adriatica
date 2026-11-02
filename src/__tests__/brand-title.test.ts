/**
 * Brand-once title tests (A6)
 *
 * Locks in:
 *   - the root title template appends " | Adriatica"
 *   - titles that already name the brand are not suffixed a second time
 *   - every static page title (src/data/pages/*.json, FR + EN) renders with
 *     "Adriatica" exactly once
 *
 * Run: npx tsx src/__tests__/brand-title.test.ts
 */

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { BRAND_SUFFIX, brandTitle, renderedTitle } from '../lib/seo/brandTitle';

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

const brandCount = (s: string | undefined) => (s ?? '').match(/adriatica/gi)?.length ?? 0;

// ── template stays in sync with the root layout ─────────────────────────────

console.log('\nroot layout template');
const layout = readFileSync(join(process.cwd(), 'src/app/layout.tsx'), 'utf8');
assert(
  `layout.tsx template is "%s${BRAND_SUFFIX}"`,
  layout.includes(`template: "%s${BRAND_SUFFIX}"`) || layout.includes(`template: '%s${BRAND_SUFFIX}'`),
);

// ── rule ─────────────────────────────────────────────────────────────────────

console.log('\nbrandTitle rule');
assert('plain title gets the suffix', renderedTitle('Atrium Cu') === 'Atrium Cu | Adriatica');
assert('plain title stays a template string', brandTitle('Atrium Cu') === 'Atrium Cu');
assert('surrounding whitespace is trimmed', renderedTitle('  Contact  ') === 'Contact | Adriatica');
assert('empty title → undefined (parent default applies)', brandTitle('') === undefined);
assert('whitespace title → undefined', brandTitle('   ') === undefined);
assert('null / undefined → undefined', brandTitle(null) === undefined && brandTitle(undefined) === undefined);

const alreadyBranded = [
  'Atrium Cu — Adriatica',
  'Atrium Cu – Adriatica',
  'Atrium Cu - Adriatica',
  'Atrium Cu | Adriatica',
  'Atrium Cu|Adriatica',
  'Atrium Cu —Adriatica',
  'Atrium Cu — adriatica',
  'Maghreb Adriatica',
  'Privacy Policy | Maghreb Adriatica',
  'Adriatica — Solutions agronomiques',
];
for (const t of alreadyBranded) {
  const out = renderedTitle(t);
  assert(`"${t}" is kept as is (absolute)`, out === t.trim() && typeof brandTitle(t) === 'object');
  assert(`"${t}" renders "Adriatica" once`, brandCount(out) === 1);
}
assert('a word merely containing the brand still gets the suffix', renderedTitle('Adriaticas') === 'Adriaticas | Adriatica');

// ── real static page titles ──────────────────────────────────────────────────

console.log('\nstatic page titles (src/data/pages/*.json)');
const dir = join(process.cwd(), 'src/data/pages');
for (const file of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
  const data = JSON.parse(readFileSync(join(dir, file), 'utf8')) as Record<string, { meta?: { title?: string } }>;
  for (const locale of ['fr', 'en']) {
    const out = renderedTitle(data[locale]?.meta?.title);
    assert(`${file} [${locale}] "${out}" has "Adriatica" exactly once`, brandCount(out) === 1);
  }
}

// ── result ───────────────────────────────────────────────────────────────────

console.log(`\n${'─'.repeat(40)}`);
console.log(`Result: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
