# Blueprint CMS — Claude Code Context

## Stack
- Next.js 16+ App Router
- TypeScript strict mode
- Tailwind CSS v4
- Drizzle ORM + PostgreSQL (@vercel/postgres)
- Better Auth
- dnd-kit (drag and drop)
- TipTap (rich text)
- @vercel/blob (file storage)
- Radix UI + shadcn/ui

## Project structure
- src/app/(dashboard)/     → admin interface
- src/app/(site)/          → public-facing pages
- src/app/api/             → route handlers
- src/components/dashboard/        → admin UI
- src/components/page-builder/     → visual editor
- src/components/shared/           → reusable UI
- src/components/ui/               → shadcn primitives
- src/lib/db/schema.ts             → source of truth for DB
- src/types.ts                     → global TS types

## Commands
- npm run dev       → start dev server (Turbopack)
- npm run build     → production build
- npx tsc --noEmit → tsc check (no typecheck script in package.json)
- npm run db:generate → generate Drizzle migrations
- npm run db:push   → push schema to DB

## Architecture rules
- Drizzle schema.ts is the single source of truth — 
  never hardcode field names that exist in the schema
- Static page builder uses local React state (useState/useRef)
  do NOT introduce global state into the static builder
- Template builder will use Zustand — 
  store lives in src/lib/store/templateBuilderStore.ts
- TipTap prose styles must be consistent between 
  (dashboard) and (site) layouts
- Renderer outputs real HTML/CSS — never Tailwind classes

## Two separate systems — do not mix them
1. Static Page Builder — drag/drop blocks, no data binding
2. Template Builder — collection-aware, supports field binding

## What Claude often gets wrong
- Do not add inline styles to TipTap components
- Do not touch static page builder when working on templates
- Do not modify schema.ts without being explicitly asked
- Always run npx tsc --noEmit after making changes