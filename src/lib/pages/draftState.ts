/**
 * Draft → publish cycle for page settings (title, slug, meta), without a
 * schema change.
 *
 * `pages` only versions blocks (draft_blocks / published_blocks). Title, slug
 * and meta (SEO, ogImage, noIndex, canonical, meta.en, meta.product filters)
 * are single live columns. On a PUBLISHED page, Save must not touch them, so
 * the unpublished values are kept inside the draft_blocks jsonb under a
 * reserved key:
 *
 *   draft_blocks = { en: [...], fr: [...], _pending: { title, slug, meta, savedAt } }
 *
 * Rules:
 *   - `_pending` exists only while a published page has unpublished settings
 *     (it is dropped when the saved settings equal the live ones).
 *   - It never reaches published_blocks or a public response: every reader of
 *     draft_blocks goes through stripPending() / draftView(), and
 *     migratePageData() keeps only `en` / `fr`.
 *   - `meta.previousSlugs` (old public slugs that 308 to the current URL) is
 *     server-managed: it is taken from the live row, never from a submission.
 *
 * Pure functions only (no DB / Next), unit-tested with tsx.
 */

import { migratePageData } from '../page-builder/json/migrate';

export const PENDING_KEY = '_pending';

/** Meta keys the server owns; editor submissions never set them. */
export const SERVER_META_KEYS = ['previousSlugs'] as const;

/** Cap on remembered old slugs per page (oldest dropped first). */
export const MAX_PREVIOUS_SLUGS = 20;

type Json = Record<string, unknown>;

export interface PageSettings {
  title: string;
  slug: string;
  meta: Json;
}

export interface PendingSettings extends PageSettings {
  savedAt: string;
}

/** The DB columns these helpers read. */
export interface PageRowLike {
  title: string;
  slug: string;
  meta: unknown;
  status: string | null;
  draft_blocks: unknown;
  published_blocks: unknown;
}

function isObject(v: unknown): v is Json {
  return !!v && typeof v === 'object' && !Array.isArray(v);
}

/** JSON.stringify with sorted object keys (undefined values dropped, like JSON). */
export function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map((v) => stableStringify(v === undefined ? null : v)).join(',')}]`;
  if (isObject(value)) {
    const keys = Object.keys(value)
      .filter((k) => value[k] !== undefined)
      .sort();
    return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(value[k])}`).join(',')}}`;
  }
  return JSON.stringify(value) ?? 'null';
}

/** The `_pending` settings stored in draft_blocks, or null. */
export function readPending(draftBlocks: unknown): PendingSettings | null {
  if (!isObject(draftBlocks)) return null;
  const p = draftBlocks[PENDING_KEY];
  if (!isObject(p) || typeof p.title !== 'string' || typeof p.slug !== 'string') return null;
  return {
    title: p.title,
    slug: p.slug,
    meta: isObject(p.meta) ? p.meta : {},
    savedAt: typeof p.savedAt === 'string' ? p.savedAt : '',
  };
}

/** draft_blocks without the reserved `_pending` key (input never mutated). */
export function stripPending<T>(blocks: T): T {
  if (!isObject(blocks) || !(PENDING_KEY in blocks)) return blocks;
  const rest: Json = { ...blocks };
  delete rest[PENDING_KEY];
  return rest as T;
}

/** draft_blocks to store: the blocks, plus `_pending` when there is one. */
export function withPending(blocks: unknown, pending: PendingSettings | null): Json {
  const base: Json = isObject(blocks) ? stripPending(blocks) : {};
  return pending ? { ...base, [PENDING_KEY]: pending } : base;
}

/** Meta without the server-managed keys. */
export function editableMeta(meta: unknown): Json {
  const m: Json = isObject(meta) ? { ...meta } : {};
  SERVER_META_KEYS.forEach((k) => delete m[k]);
  return m;
}

/** Old public slugs recorded on a page (`meta.previousSlugs`), sanitised. */
export function previousSlugsOf(meta: unknown): string[] {
  const list = isObject(meta) ? meta.previousSlugs : undefined;
  if (!Array.isArray(list)) return [];
  return list.filter((s): s is string => typeof s === 'string' && s.length > 0);
}

/**
 * Comparable form of a page's settings. Applies the same defaults the editor
 * adds on load (migratePageData: meta.title falls back to the page title,
 * meta.description to ''), so an untouched page compares equal to its row.
 */
function comparableSettings(s: PageSettings): string {
  const meta = editableMeta(s.meta);
  return stableStringify({
    title: s.title,
    slug: s.slug,
    meta: {
      ...meta,
      title: (typeof meta.title === 'string' && meta.title) || s.title,
      description: meta.description ?? '',
    },
  });
}

export function settingsEqual(a: PageSettings, b: PageSettings): boolean {
  return comparableSettings(a) === comparableSettings(b);
}

/**
 * Pending settings to store when a published page is saved: null when the
 * submitted settings equal the live ones (nothing to publish).
 */
export function pendingForSave(
  live: PageSettings,
  submitted: PageSettings,
  now: Date = new Date()
): PendingSettings | null {
  if (settingsEqual(live, submitted)) return null;
  return {
    title: submitted.title,
    slug: submitted.slug,
    meta: editableMeta(submitted.meta),
    savedAt: now.toISOString(),
  };
}

function comparableBlocks(blocks: unknown): string {
  const b = stripPending(blocks);
  if (!isObject(b) && !Array.isArray(b)) return stableStringify(null);
  return stableStringify(migratePageData({ id: 'cmp', title: 'cmp', slug: 'cmp', blocks: b }).blocks);
}

export function blocksEqual(a: unknown, b: unknown): boolean {
  return comparableBlocks(a) === comparableBlocks(b);
}

/**
 * True when a published page has saved changes that are not public yet:
 * pending settings, or draft blocks that differ from the published snapshot.
 * Always false for a draft page (nothing is public to differ from).
 */
export function hasUnpublishedChanges(row: PageRowLike): boolean {
  if (row.status !== 'published') return false;
  if (readPending(row.draft_blocks)) return true;
  return !blocksEqual(row.draft_blocks, row.published_blocks);
}

/**
 * What the editor (and an authenticated GET /api/pages/[id]) shows: the latest
 * SAVED state, i.e. pending settings over the live ones, and the draft blocks
 * without `_pending`. `meta.previousSlugs` stays the live, server-managed list.
 */
export function draftView(row: PageRowLike): PageSettings & { blocks: unknown; pending: PendingSettings | null } {
  const pending = readPending(row.draft_blocks);
  const liveMeta: Json = isObject(row.meta) ? row.meta : {};
  const prev = previousSlugsOf(liveMeta);
  return {
    title: pending ? pending.title : row.title,
    slug: pending ? pending.slug : row.slug,
    meta: pending ? { ...pending.meta, ...(prev.length ? { previousSlugs: prev } : {}) } : liveMeta,
    blocks: stripPending(row.draft_blocks),
    pending,
  };
}

/**
 * Live meta to write on publish: the submitted (editable) meta, plus the
 * server-managed `previousSlugs`. When a PUBLIC page changes slug, the old slug
 * is recorded so its URL 308s to the new one; the new slug is removed from the
 * list (a page never redirects to itself).
 */
export function publishedMeta(
  submittedMeta: unknown,
  live: { slug: string; meta: unknown; wasPublic: boolean },
  newSlug: string
): Json {
  let prev = previousSlugsOf(live.meta);
  if (live.wasPublic && live.slug !== newSlug) prev = [live.slug, ...prev];
  prev = prev.filter((s, i) => s !== newSlug && prev.indexOf(s) === i).slice(0, MAX_PREVIOUS_SLUGS);
  const meta = editableMeta(submittedMeta);
  return prev.length ? { ...meta, previousSlugs: prev } : meta;
}

/**
 * Pure part of the old-slug redirect: among candidate published pages, the
 * current slug of the one that lists `requestedSlug` in meta.previousSlugs.
 * Null when none does, or when the match IS the requested slug (no loop).
 * Callers only consult this after the requested slug matched no live page.
 */
export function previousSlugTarget(
  candidates: { slug: string; meta: unknown }[],
  requestedSlug: string
): string | null {
  const hit = candidates.find(
    (c) => c.slug !== requestedSlug && previousSlugsOf(c.meta).includes(requestedSlug)
  );
  return hit ? hit.slug : null;
}
