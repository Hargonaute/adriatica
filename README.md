# CMS Page Builder Blueprint

A production-ready, no-code landing page builder built with Next.js 15+, Drizzle ORM, Vercel Postgres, and Vercel Blob. Clone it, fill in credentials, and you have a fully extensible CMS.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15+ (App Router) |
| Language | TypeScript |
| ORM | Drizzle ORM |
| Database | Vercel Postgres (PostgreSQL) |
| File Storage | Vercel Blob |
| Drag & Drop | dnd-kit |
| Rich Text | TipTap |
| UI Components | shadcn/ui + Tailwind CSS v4 |
| Validation | Zod |
| Forms | React Hook Form |

---

## Prerequisites

- **Node.js 18+**
- **npm 9+**
- A **Vercel account** (free tier works) for Postgres and Blob storage
- **Git**

---

## Quick Start

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd <project-directory>

# 2. Install dependencies
npm install

# 3. Copy the environment template
cp .env.example .env.local

# 4. Fill in your credentials (see "Getting Your Credentials" below)
#    Edit .env.local with your values

# 5. Push the database schema
npm run db:push

# 6. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.
Open [http://localhost:3000/dashboard](http://localhost:3000/dashboard) for the CMS dashboard.

---

## Environment Variables

Create a `.env.local` file from `.env.example` and populate these values:

| Variable | Description | Where to get it |
|----------|-------------|-----------------|
| `POSTGRES_URL` | Pooled Postgres connection string | Vercel Dashboard → Storage → your DB → `.env.local` tab |
| `POSTGRES_PRISMA_URL` | Prisma-compatible connection string | Same as above |
| `POSTGRES_URL_NO_SSL` | Connection without SSL (local dev) | Same as above |
| `POSTGRES_URL_NON_POOLING` | Non-pooled (for migrations) | Same as above |
| `POSTGRES_USER` | DB username | Same as above |
| `POSTGRES_HOST` | DB host | Same as above |
| `POSTGRES_PASSWORD` | DB password | Same as above |
| `POSTGRES_DATABASE` | DB name | Same as above |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token | Vercel Dashboard → Storage → your Blob Store → `.env.local` tab |
| `AUTH_SECRET` | Session signing secret | `openssl rand -base64 32` |
| `NEXTAUTH_SECRET` | Auth library secret | Same value as `AUTH_SECRET` |
| `NEXTAUTH_URL` | App base URL | `http://localhost:3000` in dev; your domain in prod |

---

## Getting Your Credentials

### Vercel Postgres

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **Storage** in the left sidebar
3. Click **Create Database** → choose **Postgres**
4. After creation, open the database → click the **`.env.local`** tab
5. Copy all the `POSTGRES_*` values into your `.env.local`

### Vercel Blob

1. In the same **Storage** section, click **Create** → choose **Blob Store**
2. After creation, open the store → click **`.env.local`** tab
3. Copy `BLOB_READ_WRITE_TOKEN` into your `.env.local`

---

## Database Setup

This project uses **Drizzle ORM** for schema management.

```bash
# Push schema to your database (fastest for development)
npm run db:push

# Generate SQL migration files (recommended for production)
npm run db:generate

# Apply generated migrations
npm run db:migrate
```

> **`db:push` vs `db:migrate`:**
> `db:push` directly syncs your schema to the database without creating migration files — great for rapid development. `db:generate` + `db:migrate` creates versioned SQL files you can review and commit — required for production deployments.

---

## Project Structure

```
src/
├── app/
│   ├── [slug]/page.tsx           # Public page renderer (ISR, RTL-aware)
│   ├── api/
│   │   ├── pages/
│   │   │   ├── [id]/route.ts     # GET page by ID (editor)
│   │   │   ├── save-draft/       # POST save draft blocks
│   │   │   ├── publish/          # POST publish (snapshot draft → published)
│   │   │   └── slug/[slug]/      # GET published page by slug (public)
│   │   ├── upload/route.ts       # POST file upload → Vercel Blob
│   │   ├── assets/               # GET list / GET+DELETE by ID
│   │   ├── collections/          # GET+POST list / GET+PUT+DELETE by ID
│   │   └── entries/
│   │       ├── route.ts          # GET entries by collectionId
│   │       └── create/route.ts   # POST public form submission (honeypot)
│   └── dashboard/page.tsx        # CMS dashboard landing
│
├── components/
│   └── page-builder/
│       ├── Editor.tsx            # Main page builder shell (dnd-kit, tabs, EN/AR)
│       ├── Inspector.tsx         # Per-block settings panel (BaseBlockSettings)
│       ├── BlockSelector.tsx     # Sidebar — dynamically built from registry
│       ├── renderEditor.tsx      # Renders draggable block card (uses registry)
│       ├── renderPreview.tsx     # Renders published section (uses registry)
│       └── blocks/
│           ├── registry.ts       # BLOCKS_REGISTRY — single source of truth
│           ├── createBlock.ts    # Factory: type → Block with UUID + defaults
│           ├── rich-text/        # TipTap editor + prose preview
│           ├── image/            # URL + alt editor + img preview
│           ├── video/            # YouTube/native video (autoplay, loop)
│           └── form/             # Collection-backed form block
│
├── lib/
│   ├── db/
│   │   ├── index.ts              # Drizzle client (Vercel Postgres)
│   │   └── schema.ts             # pages, assets, collections, fields, entries
│   └── page-builder/json/
│       ├── migrate.ts            # Legacy JSON → current PageData shape
│       └── validate.ts           # Zod validation of full PageData
│
├── middleware.ts                 # Protects /dashboard + mutating API routes
└── types.ts                      # BlockData union, PageData, PageMeta, BaseBlockSettings
```

---

## Adding a New Block

The entire system is driven by `BLOCKS_REGISTRY`. Adding a block requires **4 steps** and **no changes** to renderers, the block selector, or the inspector.

### Step 1 — Define the type in `src/types.ts`

```ts
export interface HeroBlockData extends BaseBlockSettings {
  type: 'hero';
  heading: string;
  subheading?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  backgroundImage?: string;
}

// Add to the union:
export type BlockData =
  | RichTextBlockData
  | ImageBlockData
  | VideoBlockData
  | FormBlockData
  | HeroBlockData   // <-- add this
  | (BaseBlockSettings & { type: string; [key: string]: any });
```

### Step 2 — Create the block components

Create `src/components/page-builder/blocks/hero/HeroBlock.tsx`:

```tsx
'use client';
import { type BlockData } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function HeroEditor({ block, onChange }: {
  block: BlockData & { type: 'hero' };
  onChange: (updates: Partial<BlockData>) => void;
}) {
  return (
    <div className="space-y-4 p-4 border rounded-md">
      <div className="space-y-1.5">
        <Label>Heading</Label>
        <Input value={block.heading || ''} onChange={(e) => onChange({ heading: e.target.value })} />
      </div>
      <div className="space-y-1.5">
        <Label>Subheading</Label>
        <Input value={block.subheading || ''} onChange={(e) => onChange({ subheading: e.target.value })} />
      </div>
    </div>
  );
}

export function HeroPreview({ block }: { block: BlockData & { type: 'hero' } }) {
  return (
    <section className="py-24 text-center">
      <h1 className="text-5xl font-bold">{block.heading}</h1>
      {block.subheading && <p className="mt-4 text-xl text-muted-foreground">{block.subheading}</p>}
    </section>
  );
}
```

### Step 3 — Register it in `src/components/page-builder/blocks/registry.ts`

```ts
import { HeroEditor, HeroPreview } from './hero/HeroBlock';
import { LayoutTemplate } from 'lucide-react'; // pick any Lucide icon

// Inside BLOCKS_REGISTRY:
'hero': {
  type: 'hero',
  label: 'Hero',
  icon: LayoutTemplate,
  createDefault: () => ({
    heading: 'Your Headline Here',
    subheading: 'A compelling subheading',
  }),
  Editor: HeroEditor,
  Preview: HeroPreview,
},
```

### Step 4 — Done

The block immediately appears in the sidebar `BlockSelector`, can be dragged in `Editor`, previewed in `RenderPreview`, and saved/published through the existing API. No other files need editing.

---

## Deploying to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy (follows next.config.ts automatically)
vercel deploy
```

After deployment:
1. In the Vercel project dashboard, go to **Settings → Environment Variables**
2. Add all variables from `.env.example` with their production values
3. Link your Vercel Postgres DB and Blob Store to the project (Storage tab)
4. Run `npm run db:push` pointed at the production DB, or apply migrations via CI

> Set `NEXTAUTH_URL` to your production domain (e.g. `https://your-app.vercel.app`).

---

## Security Notes

- The `middleware.ts` protects `/dashboard` and all mutating API routes with a session cookie check. **Replace** the `isAuthenticated` function with a real auth library (NextAuth.js, Lucia, Clerk) before going live.
- Public form submissions at `/api/entries/create` include a honeypot field check.
- File uploads are validated for type and size (max 10 MB) before hitting Vercel Blob.
- The public slug renderer only exposes `published_blocks` — drafts are never leaked.

---

## License

MIT
# blue-print-cms-next
