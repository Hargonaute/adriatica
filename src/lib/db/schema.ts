import {
  pgTable,
  text,
  timestamp,
  jsonb,
  boolean,
  integer,
  uuid,
} from 'drizzle-orm/pg-core';

// ─── App Tables ───────────────────────────────────────────────────────────────

export const pages = pgTable('pages', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  draft_blocks: jsonb('draft_blocks').default({ en: [], fr: [] }),
  published_blocks: jsonb('published_blocks'),
  meta: jsonb('meta').default({}),
  status: text('status', { enum: ['draft', 'published'] }).default('draft'),

  // Template metadata — isTemplate=true pages are not served at /[slug]
  isTemplate: boolean('is_template').default(false).notNull(),
  templateKind: text('template_kind', { enum: ['index', 'detail'] }),
  // UUID of the collection this template belongs to (no FK — avoids circular dep)
  templateCollectionId: uuid('template_collection_id'),

  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
});

export const assets = pgTable('assets', {
  id: uuid('id').defaultRandom().primaryKey(),
  url: text('url').notNull(),
  pathname: text('pathname').notNull(),
  contentType: text('content_type'),
  size: integer('size'),
  alt: text('alt'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const collections = pgTable('collections', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),

  // Public URL prefix: /[basePath] → index, /[basePath]/[itemSlug] → detail
  // Defaults to slug at the application layer; stored explicitly here.
  // Uniqueness enforced by a partial index (see migration SQL).
  basePath: text('base_path'),

  // Which field key drives the item URL slug (e.g. "name", "title").
  // null → auto-generate from first text field value, falling back to entry ID.
  itemSlugField: text('item_slug_field'),

  // FK refs to page-builder pages (ON DELETE SET NULL)
  indexPageId: uuid('index_page_id').references(() => pages.id, { onDelete: 'set null' }),
  detailTemplatePageId: uuid('detail_template_page_id').references(() => pages.id, { onDelete: 'set null' }),

  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const fields = pgTable('fields', {
  id: uuid('id').defaultRandom().primaryKey(),
  collectionId: uuid('collection_id')
    .references(() => collections.id, { onDelete: 'cascade' })
    .notNull(),
  key: text('key').notNull(),
  label: text('label').notNull(),
  type: text('type', {
    enum: ['text', 'number', 'email', 'date', 'textarea', 'checkbox', 'rich-text', 'image'],
  }).notNull(),
  required: boolean('required').default(false),
  options: jsonb('options'),
  order: integer('order').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const entries = pgTable('entries', {
  id: uuid('id').defaultRandom().primaryKey(),
  collectionId: uuid('collection_id')
    .references(() => collections.id, { onDelete: 'cascade' })
    .notNull(),

  // Human-readable URL slug, unique within a collection (enforced below).
  // Nullable during migration; backfilled to entry ID.
  slug: text('slug'),

  data: jsonb('data').notNull(),

  status: text('status', { enum: ['draft', 'published'] }).default('published').notNull(),
  publishedAt: timestamp('published_at'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
  // Uniqueness of (collectionId, slug) enforced by a partial SQL index (WHERE slug IS NOT NULL).
});

// ─── Better Auth Tables ───────────────────────────────────────────────────────
// These must match the names and shapes Better Auth expects.
// Generated via: pnpm dlx @better-auth/cli@latest generate
// See: https://www.better-auth.com/docs/adapters/drizzle

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull(),
  image: text('image'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
});

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
});

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
});

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at'),
  updatedAt: timestamp('updated_at'),
});
