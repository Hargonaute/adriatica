/**
 * Rich-text block feature test
 *
 * Verifies that TipTap generates correct HTML for headings, lists, and links —
 * the same extensions used in RichTextBlock.tsx.
 *
 * Run:  npx tsx src/__tests__/rich-text.test.ts
 */

// Polyfill DOM for ProseMirror serializer (runs in Node, not a browser)
import { JSDOM } from 'jsdom';
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
(global as any).window = dom.window;
(global as any).document = dom.window.document;
(global as any).Node = dom.window.Node;

import { generateHTML, type JSONContent } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';

// StarterKit v3 bundles Link — disable it there and add our configured version
const EXTENSIONS = [
  StarterKit.configure({ link: false }),
  Link.configure({ openOnClick: false, autolink: true }),
];

// ── tiny assertion helper ────────────────────────────────────────────────────

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

// ── helpers ──────────────────────────────────────────────────────────────────

function html(content: JSONContent['content']): string {
  return generateHTML({ type: 'doc', content }, EXTENSIONS);
}

// ── tests ────────────────────────────────────────────────────────────────────

section('Headings');

const h1 = html([{ type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Title' }] }]);
assert('H1 generates <h1> tag',        h1.includes('<h1'));
assert('H1 contains the text',         h1.includes('Title'));

const h2 = html([{ type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Subtitle' }] }]);
assert('H2 generates <h2> tag',        h2.includes('<h2'));

const h3 = html([{ type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: 'Section' }] }]);
assert('H3 generates <h3> tag',        h3.includes('<h3'));

section('Inline marks');

const bold = html([{ type: 'paragraph', content: [{ type: 'text', text: 'Hello', marks: [{ type: 'bold' }] }] }]);
assert('Bold generates <strong>',       bold.includes('<strong>'));

const italic = html([{ type: 'paragraph', content: [{ type: 'text', text: 'Hello', marks: [{ type: 'italic' }] }] }]);
assert('Italic generates <em>',         italic.includes('<em>'));

const strike = html([{ type: 'paragraph', content: [{ type: 'text', text: 'Hello', marks: [{ type: 'strike' }] }] }]);
assert('Strikethrough generates <s>',   strike.includes('<s>'));

section('Lists');

const bulletList = html([
  {
    type: 'bulletList',
    content: [
      { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Item A' }] }] },
      { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Item B' }] }] },
    ],
  },
]);
assert('Bullet list generates <ul>',    bulletList.includes('<ul>'));
assert('Bullet list generates <li>',    bulletList.includes('<li>'));
assert('Bullet list contains items',    bulletList.includes('Item A') && bulletList.includes('Item B'));

const orderedList = html([
  {
    type: 'orderedList',
    content: [
      { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'First' }] }] },
      { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Second' }] }] },
    ],
  },
]);
assert('Ordered list generates <ol>',   orderedList.includes('<ol>'));
assert('Ordered list generates <li>',   orderedList.includes('<li>'));
assert('Ordered list contains items',   orderedList.includes('First') && orderedList.includes('Second'));

section('Links');

const linked = html([
  {
    type: 'paragraph',
    content: [
      {
        type: 'text',
        text: 'Click here',
        marks: [{ type: 'link', attrs: { href: 'https://example.com', target: '_blank' } }],
      },
    ],
  },
]);
assert('Link generates <a> tag',        linked.includes('<a '));
assert('Link contains href',            linked.includes('href="https://example.com"'));
assert('Link contains the text',        linked.includes('Click here'));

section('Blockquote');

const bq = html([
  {
    type: 'blockquote',
    content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Quote text' }] }],
  },
]);
assert('Blockquote generates <blockquote>', bq.includes('<blockquote>'));

// ── summary ──────────────────────────────────────────────────────────────────

console.log(`\n${'─'.repeat(40)}`);
console.log(`Result: ${passed} passed, ${failed} failed`);

if (failed > 0) {
  process.exit(1);
}
