/**
 * Page builder persistence round-trip test
 *
 * Locks in the contract for Tasks 10 + 11:
 *   - Repeater collectionId/collectionSlug/cardTemplate persist through
 *     save-draft → DB → reload (validate + migrate pipeline)
 *   - Container children + colour/border fields persist
 *   - All Inspector style fields (typography, border, flex, media) survive
 *     publish even when they are not explicitly declared on the schema
 *     (defends `.passthrough()` against an accidental `.strict()` regression)
 *
 * Run: npx tsx src/__tests__/page-builder-persistence.test.ts
 */

import { validatePageData } from '../lib/page-builder/json/validate';
import { migratePageData } from '../lib/page-builder/json/migrate';

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

// ── fixture: every block type the inspector can write ───────────────────────

const fixture = {
  id: 'page-1',
  slug: 'test',
  title: 'Test',
  status: 'draft' as const,
  schemaVersion: 1,
  meta: { title: 'Test', description: 'desc' },
  blocks: {
    en: [
      {
        id: 'rep-1',
        type: 'repeater',
        order: 0,
        data: {
          type: 'repeater',
          // Layout
          paddingTop: 'md',
          paddingBottom: 'md',
          align: 'left',
          maxWidth: 'full',
          background: 'none',
          // Repeater-specific
          collectionId: 'col-xyz',
          collectionSlug: 'products',
          columns: '3',
          repeaterGap: 'md',
          // Style (template mode)
          fontSize: 'lg',
          fontWeight: 'bold',
          textAlign: 'center',
          textColor: '#111',
          backgroundColor: '#fff',
          borderWidth: '1',
          borderRadius: 'md',
          borderColor: '#eee',
          padding: '16px',
          margin: '8px',
          gap: 'lg',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          aspectRatio: 'square',
          objectFit: 'cover',
          cardTemplate: [
            {
              id: 'child-1',
              type: 'bound-text',
              order: 0,
              data: { fieldKey: 'name', fontSize: 'xl', textColor: '#222' },
            },
            {
              id: 'cont-nested',
              type: 'container',
              order: 1,
              data: {
                type: 'container',
                direction: 'row',
                containerGap: 'md',
                containerPadding: 'sm',
                backgroundColor: '#fafafa',
                borderColor: '#ddd',
                alignItems: 'center',
                children: [
                  {
                    id: 'gc-1',
                    type: 'bound-image',
                    order: 0,
                    data: { fieldKey: 'image', objectFit: 'contain' },
                  },
                ],
              },
            },
          ],
        },
      },
      {
        id: 'cont-top',
        type: 'container',
        order: 1,
        data: {
          type: 'container',
          direction: 'column',
          containerGap: 'lg',
          containerPadding: 'md',
          backgroundColor: '#abc',
          borderColor: '#def',
          alignItems: 'stretch',
          paddingTop: 'md',
          paddingBottom: 'md',
          align: 'left',
          maxWidth: 'full',
          background: 'none',
          children: [
            { id: 'cc-1', type: 'rich-text', order: 0, data: { type: 'rich-text', content: '<p>x</p>' } },
          ],
        },
      },
    ],
  },
};

// ── 1. validate (save-draft / publish API gate) ─────────────────────────────

section('validatePageData() preserves new style fields');

const validation = validatePageData(fixture);
assert('validation succeeds', validation.success);
if (!validation.success) {
  console.error(validation.error);
  process.exit(1);
}

const rep: any = validation.data!.blocks.en[0].data;

// Repeater identity
assert('repeater.collectionId preserved', rep.collectionId === 'col-xyz');
assert('repeater.collectionSlug preserved', rep.collectionSlug === 'products');
assert('repeater.columns preserved', rep.columns === '3');
assert('repeater.repeaterGap preserved', rep.repeaterGap === 'md');

// Repeater style fields
assert('repeater.fontSize preserved', rep.fontSize === 'lg');
assert('repeater.fontWeight preserved', rep.fontWeight === 'bold');
assert('repeater.textAlign preserved', rep.textAlign === 'center');
assert('repeater.textColor preserved', rep.textColor === '#111');
assert('repeater.backgroundColor preserved', rep.backgroundColor === '#fff');
assert('repeater.borderWidth preserved', rep.borderWidth === '1');
assert('repeater.borderRadius preserved', rep.borderRadius === 'md');
assert('repeater.borderColor preserved', rep.borderColor === '#eee');
assert('repeater.padding preserved', rep.padding === '16px');
assert('repeater.margin preserved', rep.margin === '8px');
assert('repeater.gap preserved', rep.gap === 'lg');
assert('repeater.flexDirection preserved', rep.flexDirection === 'row');
assert('repeater.alignItems preserved', rep.alignItems === 'center');
assert('repeater.justifyContent preserved', rep.justifyContent === 'space-between');
assert('repeater.aspectRatio preserved', rep.aspectRatio === 'square');
assert('repeater.objectFit preserved', rep.objectFit === 'cover');

// Nested cardTemplate survives
assert('repeater.cardTemplate has 2 entries', rep.cardTemplate?.length === 2);
assert('cardTemplate[0] is bound-text', rep.cardTemplate?.[0]?.type === 'bound-text');
assert('cardTemplate[0].data.fieldKey kept', rep.cardTemplate?.[0]?.data?.fieldKey === 'name');
assert(
  'cardTemplate[1].data.children survives',
  rep.cardTemplate?.[1]?.data?.children?.length === 1,
);
assert(
  'nested grandchild.fieldKey kept',
  rep.cardTemplate?.[1]?.data?.children?.[0]?.data?.fieldKey === 'image',
);

// Top-level container
const cont: any = validation.data!.blocks.en[1].data;
assert('container.direction preserved', cont.direction === 'column');
assert('container.containerGap preserved', cont.containerGap === 'lg');
assert('container.containerPadding preserved', cont.containerPadding === 'md');
assert('container.backgroundColor preserved', cont.backgroundColor === '#abc');
assert('container.borderColor preserved', cont.borderColor === '#def');
assert('container.alignItems preserved', cont.alignItems === 'stretch');
assert('container.children survives', cont.children?.length === 1);

// ── 2. migrate (DB → editor reload) ─────────────────────────────────────────

section('migratePageData() preserves Repeater binding through reload');

// Simulate what the [id] page does: read draft_blocks from DB, hand to migrate.
const fromDB = {
  id: fixture.id,
  slug: fixture.slug,
  title: fixture.title,
  status: 'draft',
  meta: fixture.meta,
  blocks: validation.data!.blocks,
  schemaVersion: 1,
};

const migrated = migratePageData(fromDB);
const mRep: any = migrated.blocks.en[0].data;
const mCont: any = migrated.blocks.en[1].data;

assert('reload: repeater.collectionId persists', mRep.collectionId === 'col-xyz');
assert('reload: repeater.collectionSlug persists', mRep.collectionSlug === 'products');
assert('reload: repeater.columns persists', mRep.columns === '3');
assert('reload: repeater.cardTemplate length', mRep.cardTemplate?.length === 2);
assert(
  'reload: nested grandchild.fieldKey persists',
  mRep.cardTemplate?.[1]?.data?.children?.[0]?.data?.fieldKey === 'image',
);
assert('reload: container.children persists', mCont.children?.length === 1);
assert('reload: container.backgroundColor persists', mCont.backgroundColor === '#abc');
assert('reload: container.direction persists', mCont.direction === 'column');

// ── summary ─────────────────────────────────────────────────────────────────

console.log(`\n${'─'.repeat(40)}`);
console.log(`Result: ${passed} passed, ${failed} failed`);

if (failed > 0) {
  process.exit(1);
}
