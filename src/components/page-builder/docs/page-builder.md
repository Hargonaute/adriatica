# Page Builder — Component Documentation Index

This directory and its sub-folders each have a `.md` file explaining the component and the changes you can make to it.

---

## Core components

| File | MD | What it is |
|---|---|---|
| `Editor.tsx` | [Editor.md](Editor.md) | Root orchestrator — state, drag-drop, auto-save, split view, language toggle. |
| `Inspector.tsx` | [Inspector.md](Inspector.md) | Bottom properties panel — block controls + page SEO settings. |
| `BlockSidebar.tsx` | [BlockSidebar.md](BlockSidebar.md) | Persistent left sidebar for adding blocks to the canvas. |
| `BlockSelector.tsx` | [BlockSelector.md](BlockSelector.md) | Popover block picker (used by Container and Repeater child pickers). |
| `renderEditor.tsx` | [renderEditor.md](renderEditor.md) | Edit-mode card wrapper with drag handle, duplicate, remove buttons. |
| `renderPreview.tsx` | [renderPreview.md](renderPreview.md) | Canonical preview renderer — converts block data to HTML/CSS. |
| `EditorContext.ts` | [EditorContext.md](EditorContext.md) | React context that shares `selectedBlockId` to nested child components. |

---

## Block infrastructure

| File | MD | What it is |
|---|---|---|
| `blocks/registry.ts` | [blocks/registry.md](blocks/registry.md) | Central registry mapping block type strings to Editor/Preview components. |

---

## Layout / special blocks

| Block | MD | Description |
|---|---|---|
| `container/ContainerBlock.tsx` | [blocks/container/ContainerBlock.md](blocks/container/ContainerBlock.md) | Flex/grid layout wrapper that nests other blocks. NOT in the registry. |
| `repeater/RepeaterBlock.tsx` | [blocks/repeater/RepeaterBlock.md](blocks/repeater/RepeaterBlock.md) | Renders one card per collection entry using a designable template. NOT in the registry. |
| `spacer/SpacerBlock.tsx` | [blocks/spacer/SpacerBlock.md](blocks/spacer/SpacerBlock.md) | Vertical whitespace with optional divider line. |

---

## Content blocks

| Block | MD | Description |
|---|---|---|
| `hero/HeroBlock.tsx` | [blocks/hero/HeroBlock.md](blocks/hero/HeroBlock.md) | Full-width hero with headline, CTAs, background image. |
| `rich-text/RichTextBlock.tsx` | [blocks/rich-text/RichTextBlock.md](blocks/rich-text/RichTextBlock.md) | TipTap WYSIWYG editor — formatted HTML output. |
| `section-heading/SectionHeadingBlock.tsx` | [blocks/section-heading/SectionHeadingBlock.md](blocks/section-heading/SectionHeadingBlock.md) | Heading + subheading + optional divider. Bindable in template mode. |
| `cta/CtaBlock.tsx` | [blocks/cta/CtaBlock.md](blocks/cta/CtaBlock.md) | Headline + body + primary/secondary CTA buttons. |
| `columns/ColumnsBlock.tsx` | [blocks/columns/ColumnsBlock.md](blocks/columns/ColumnsBlock.md) | Feature grid — 2–4 columns with icon, title, body. |
| `table/TableBlock.tsx` | [blocks/table/TableBlock.md](blocks/table/TableBlock.md) | Editable data table with headers, rows, striped/bordered options. |
| `key-value-list/KeyValueListBlock.tsx` | [blocks/key-value-list/KeyValueListBlock.md](blocks/key-value-list/KeyValueListBlock.md) | Label/value row list — specs, composition, parameters. |

---

## Media blocks

| Block | MD | Description |
|---|---|---|
| `image/ImageBlock.tsx` | [blocks/image/ImageBlock.md](blocks/image/ImageBlock.md) | Single image with alt text, caption, optional link. |
| `video/VideoBlock.tsx` | [blocks/video/VideoBlock.md](blocks/video/VideoBlock.md) | YouTube, Vimeo, or MP4 embed. |

---

## Interactive blocks

| Block | MD | Description |
|---|---|---|
| `form/FormBlock.tsx` | [blocks/form/FormBlock.md](blocks/form/FormBlock.md) | Dynamic form linked to a CMS collection. |
| `newsletter/NewsletterBlock.tsx` | [blocks/newsletter/NewsletterBlock.md](blocks/newsletter/NewsletterBlock.md) | Email subscription section with image + subscribe button. |
| `contact-form/ContactFormBlock.tsx` | [blocks/contact-form/ContactFormBlock.md](blocks/contact-form/ContactFormBlock.md) | Full contact section with info cards + form. |
| `contact-form-simple/ContactFormSimpleBlock.tsx` | [blocks/contact-form-simple/ContactFormSimpleBlock.md](blocks/contact-form-simple/ContactFormSimpleBlock.md) | Contact section without info cards. |
| `collection-list/CollectionListBlock.tsx` | [blocks/collection-list/CollectionListBlock.md](blocks/collection-list/CollectionListBlock.md) | Grid/list display of collection entries with links. |
| `download-button/DownloadButtonBlock.tsx` | [blocks/download-button/DownloadButtonBlock.md](blocks/download-button/DownloadButtonBlock.md) | File download CTA button. Supports field binding for URL. |
| `button/ButtonBlock.tsx` | [blocks/button/ButtonBlock.md](blocks/button/ButtonBlock.md) | Standalone navigation / action button. |
| `catalogue/CatalogueBlock.tsx` | [blocks/catalogue/CatalogueBlock.md](blocks/catalogue/CatalogueBlock.md) | Branded catalogue download banner (red background). |

---

## Composite block

| Block | MD | Description |
|---|---|---|
| `product-hero/ProductHeroBlock.tsx` | [blocks/product-hero/ProductHeroBlock.md](blocks/product-hero/ProductHeroBlock.md) | Two-column product showcase (image + text). All fields bindable. |

---

## Template / bound blocks

| Block | MD | Description |
|---|---|---|
| `bound/BoundTextBlock.tsx` | [blocks/bound/BoundTextBlock.md](blocks/bound/BoundTextBlock.md) | Displays a text/number/email/textarea field from the current entry. |
| `bound/BoundImageBlock.tsx` | [blocks/bound/BoundImageBlock.md](blocks/bound/BoundImageBlock.md) | Displays an image field from the current entry. |
| `bound/BoundRichTextBlock.tsx` | [blocks/bound/BoundRichTextBlock.md](blocks/bound/BoundRichTextBlock.md) | Renders a rich-text field as formatted HTML. |
| `bound/BoundDateBlock.tsx` | [blocks/bound/BoundDateBlock.md](blocks/bound/BoundDateBlock.md) | Displays a date field with locale-aware formatting. |
| `collection-item-fields/CollectionItemFieldsBlock.tsx` | [blocks/collection-item-fields/CollectionItemFieldsBlock.md](blocks/collection-item-fields/CollectionItemFieldsBlock.md) | Auto-renders all fields of the current collection entry. |

---

## AI page generation

| Guide | Description |
|---|---|
| [ai-page-generation-guide.md](ai-page-generation-guide.md) | Share this + your collection schema with any AI to generate valid page JSON ready to paste into the builder's JSON tab. Covers static blocks, dynamic field bindings, Repeater, and a full example. |

---

## Key architecture rules (do not break)

- `ContainerBlock` and `RepeaterBlock` are **NOT** in `BLOCKS_REGISTRY` — they are dispatched directly from `Editor.tsx` and `renderPreview.tsx` to avoid circular imports.
- `renderPreview.tsx` outputs **inline CSS only** — never Tailwind classes in the rendered HTML.
- The static page builder uses **local React state** (`useState` / `useRef`) only — no Zustand, no global store.
- The template builder uses Zustand (`src/lib/store/templateBuilderStore.ts`) for the active `collectionId`.
- Do not modify `src/lib/db/schema.ts` without being explicitly asked.
- Always run `npx tsc --noEmit` after making changes.


---

# Editor.tsx

**Path:** `src/components/page-builder/Editor.tsx`
**Type:** Client component — the root of the page builder UI.

---

## What it does

`PageBuilderEditor` is the top-level orchestrator for both the **static page builder** and the **template builder**. It owns:

- The canonical `PageData` state (blocks per language, metadata, status).
- All block mutation operations (add, update, remove, duplicate).
- Drag-and-drop sorting via dnd-kit at three nesting levels: top-level → container children → repeater card-template children (including containers inside a repeater).
- Auto-save on a 30-second timer after any change, plus `Cmd/Ctrl+S` manual save.
- A split-view live preview (editor left / preview right) with a draggable divider.
- A resizable bottom Inspector panel that opens when a block is selected or Page Settings is triggered.
- EN / FR language switching (blocks are keyed per language inside `PageData.blocks`).
- Three tabs: **Edit**, **Preview** (desktop / tablet / mobile viewports), **JSON**.
- Mock entry data for template mode so bound blocks render realistic sample content.

---

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `initialData` | `PageData` | required | Seed data from the server; editor clones and manages it locally. |
| `mode` | `'static' \| 'template'` | `'static'` | Switches template-mode behaviour (field binding UI, auto-publish). |
| `templateKind` | `'index' \| 'detail' \| null` | `null` | Refines template mode. `'detail'` shows mock entry, `'index'` shows collection root. |
| `onSave` | `(data: PageData) => Promise<void>` | — | Called on every save. Marks the page dirty-clean cycle. |
| `onPublish` | `(data: PageData) => Promise<void>` | — | Called when the user hits Publish / Save & Publish. |
| `onUnpublish` | `(data: PageData) => Promise<void>` | — | Called when the user hits Unpublish (static mode only). |

---

## Key internal state

| State | Description |
|---|---|
| `data` | Full `PageData` being edited. Blocks live at `data.blocks[language]`. |
| `language` | Active locale (`'en'` \| `'fr'`). Switches which block array is visible. |
| `selectedBlockId` | ID of the block whose Inspector drawer is open. |
| `pageSettingsOpen` | Whether Page Settings (SEO panel) is open instead of a block. |
| `isDirty` | Set on every mutation; cleared on save success. |
| `splitMode` | Whether the split-view live preview is visible. Persisted in `localStorage`. |
| `splitRatio` | Width % of the editor panel (30–70). Draggable; persisted. |
| `inspectorHeight` | Height of the bottom Inspector panel in px (200–500). Draggable; persisted. |
| `previewData` | A snapshot of `data` committed to the preview panel on blur / deselect. |
| `activeTab` | `'edit'` \| `'preview'` \| `'json'`. |
| `viewport` | Preview-tab viewport: `'desktop'` \| `'tablet'` \| `'mobile'`. |

---

## Block mutation functions

All functions call `setData` (immutable update) then `markDirty()`.

### `addBlock(type: string)`
Creates a new block via `createBlock()`, `createContainerBlock()`, or `createRepeaterBlock()` depending on type. Appends to the current language's block array and selects the new block.

### `updateBlock(id: string, updates: Partial<BlockData>)`
Searches top-level, container children, and repeater card-template children (including containers inside a repeater card template) for `id` and merges `updates`. Style-prop changes trigger a 150ms debounced preview sync; text/content changes rely on the blur-only path.

### `removeBlock(id: string)`
Finds and removes the block from whichever level it lives at. Deselects if the removed block was selected.

### `duplicateBlock(id: string)`
Inserts a copy with a new UUID immediately after the original, at whichever nesting level the block lives. Selects the copy.

### `handleDragEnd(event)`
Handles three cases in priority order:
1. Top-level reorder — both active and over IDs are top-level blocks.
2. Container child reorder — active ID is a child of a top-level container.
3. Repeater card-template reorder — active ID is a child of a repeater template (or a container within one).

---

## Split-view behaviour

- Only available when the screen is ≥ 1280px (`wideScreen`).
- The left panel (`splitRatio %`) contains the canvas + Inspector. The right panel (`100 - splitRatio %`) is a live `RenderPreview` with its own viewport toggle.
- `previewData` only updates when the Inspector is **closed** (deselect / drawer close). Style props (listed in `STYLE_PROPS`) get a 150ms debounce sync while the Inspector is open.
- The divider is draggable (pointer events). Double-click resets to 50/50.
- Inspector height is independently draggable with a horizontal resize handle. Double-click resets to 320px.

---

## Template mode specifics

- Reads `collectionId` from the Zustand `templateBuilderStore`.
- Fetches field schema + published entries from `/api/collections/:id` and `/api/entries?collectionId=:id`.
- Builds a `mockEntry` via `buildMockEntryData(fields)` and exposes it via `MockCollectionEntryContext`.
- Bound blocks (`BoundText`, `BoundImage`, etc.) read this context to render sample content in the editor.
- The header **View** button links to the first published entry (detail template) or the collection index (index template).
- Save button label changes to **Save & Publish**; Publish/Unpublish buttons are hidden.

---

## Context providers

`Editor.tsx` is the root provider for two contexts:

| Context | Purpose |
|---|---|
| `MockCollectionEntryContext` | Feeds bound blocks with synthetic entry data in template mode. |
| `EditorContext` | Exposes `selectedBlockId` / `setSelectedBlockId` to deeply nested children (e.g. `SortableChild` inside `ContainerBlock`). |

---

## Auto-save & keyboard shortcut

- Auto-save fires `triggerSave(true)` (silent, no toast) 30 seconds after the last `data` change while `isDirty` is true. The timer resets on every subsequent change.
- `Cmd/Ctrl+S` fires `triggerSave(false)` (with toast). Calls `onSave(latestData.current)`.
- A `beforeunload` listener warns the user if they navigate away with unsaved changes.

---

## Possible changes

| Change | What to touch |
|---|---|
| Add a new language (e.g. `'ar'`) | Add a third button to the language toggle; `PageData.blocks` is already a `Record<string, Block[]>`, so no structural changes needed. |
| Change auto-save delay | Edit `AUTO_SAVE_DELAY` constant (currently `30_000`). |
| Add a real-time style prop to the debounce path | Add its key to the `STYLE_PROPS` Set. |
| Extend Inspector width range | Edit `INSPECTOR_MIN` / `INSPECTOR_MAX` / `INSPECTOR_DEFAULT` constants. |
| Add a 4th nested drag level (e.g. container inside a container) | Extend `findBlock`, `updateBlock`, `removeBlock`, `duplicateBlock`, and `handleDragEnd` with a 4th recursion arm. |
| Persist split-view preferences elsewhere (server/DB) | Replace the `localStorage.getItem/setItem` calls in the `pb.splitMode` / `pb.splitRatio` effects. |
| Add a "History / Undo" feature | Maintain a `history: PageData[]` stack; wrap `setData` to push a snapshot; add undo/redo buttons to the header. |
| Replace the confirm() dialog for Unpublish | Swap `window.confirm(...)` in `handleUnpublish` with a Radix `AlertDialog`. |
| Support cross-container drag (children moving between containers) | Rework `handleDragEnd` to use dnd-kit's `DragOverEvent` and a shared context that tracks which container the item is currently hovering over. |


---

# Inspector.tsx

**Path:** `src/components/page-builder/Inspector.tsx`
**Type:** Client component — the properties panel rendered inside the bottom drawer in `Editor.tsx`.

---

## What it does

The Inspector renders one of two panels depending on context:

- **BlockInspectorPanel** — when a block is selected (`selectedBlock !== null`).
- **PageSettingsPanel** — when no block is selected and the user has opened Page Settings.

It is mounted inside `Editor.tsx`'s resizable bottom drawer and receives `selectedBlock` + `onChange` from the Editor. It never manages its own state for the block data; all changes flow up through `onChange(id, updates)`.

---

## Sub-components

### `PageSettingsPanel`
Renders SEO and metadata controls for the page itself.

| Field | Description |
|---|---|
| Page Title | `pageData.title` — used as the browser tab title and `og:title` fallback. |
| Slug | Read-only. Displayed for reference; editing requires the pages list. |
| Meta Title override | `meta.title` — overrides the browser title. Capped at 60 chars with live counter. |
| Meta Description | `meta.description` — 120–160 chars recommended. Live counter. |
| Canonical URL | `meta.canonical` — optional URL override; auto-generated from slug if blank. |
| No Index | `meta.noIndex` — hides the page from search engines. |
| OG Image URL | `meta.ogImage` — social preview image (1200×630). Shows a live preview when set. |

---

### `BlockInspectorPanel`
Renders controls for the currently selected block. Uses a `key={selectedBlock.id}` prop so every Radix Select remounts on block switch (avoiding stale controlled values).

**Data resolution order** (later wins):
1. `INSPECTOR_FALLBACKS` — hardcoded safe UI defaults so no control is ever empty.
2. `registry.createDefault()` — the block's own defaults.
3. `selectedBlock.data` — what the user has actually saved.

**Sections rendered conditionally by block type:**

| Section component | Shown when |
|---|---|
| `SpacerSection` | `type === 'spacer'` |
| `RepeaterSection` | `type === 'repeater'` |
| `ContainerLayoutSection` | `type === 'container'` |
| `ImageSizingSection` | `type === 'image'` or `'bound-image'` |
| `BoundTextTypographySection` | `type === 'bound-text'` or `'bound-rich-text'` (with `includeAs` only for `bound-text`) |
| `FieldBindingSection` | `effectiveMode === 'template'` AND block is a bound block |
| `CompositeBindingSection` | `effectiveMode === 'template'` AND block is in `COMPOSITE_BINDINGS` |
| Layout section | Always |
| Styling section | Always |
| Typography / Border / Grid / Media sections | Template mode only (`effectiveMode === 'template'`) |

---

### `SpacerSection`
Controls: Size (xs/sm/md/lg/xl), Show Divider toggle, Divider Color (free-text with swatch preview), Divider Style (solid/dashed/dotted).

---

### `RepeaterSection`
Loads all collections via `GET /api/collections`. Controls: Collection dropdown (also sets `collectionSlug`), Columns (1–4), Gap (small/medium/large).

---

### `ContainerLayoutSection`
Controls: Layout preset (stack/two-col-text-image/two-col-image-text/three-col), Mobile behavior (stack/same/hide), Direction (column/row — only shown when `layout === 'stack'`), Inner Gap, Inner Padding, Align Items, Background Color (free-text with swatch), Border Width, Border Radius, Border Color.

---

### `ImageSizingSection`
Controls: Aspect Ratio (auto/1:1/4:3/16:9/3:4), Object Fit (cover/contain/fill), Width (full/half/third/auto), Border Radius (none/sm/md/lg/full), Hide on Mobile toggle.

---

### `BoundTextTypographySection`
Controls: Font Size (xs–4xl), Font Weight (normal/medium/semibold/bold), Color (free-text), Text Transform (none/uppercase/lowercase/capitalize). When `includeAs=true` (bound-text only): Render As (p/h1/h2/h3/h4/span).

---

### `FieldBindingSection`
Used by atomic bound blocks (`bound-text`, `bound-image`, `bound-rich-text`, `bound-date`).

- Resolves the collection from either `repeaterContext.collectionId` (when inside a Repeater) or the Zustand `templateBuilderStore`.
- Falls back to a manual collection picker when neither is available.
- Filters the collection's fields to only those compatible with the block's `BOUND_FIELD_TYPES` entry.
- Saves the chosen field's `key` as `fieldKey` on the block data.

---

### `CompositeBindingSection`
Used by composite blocks that have multiple bindable props (`product-hero`, `section-heading`, `download-button`).

`COMPOSITE_BINDINGS` map defines per-prop label + allowed field types:
- `product-hero` → titleFieldKey, subtitle1FieldKey, subtitle2FieldKey, bodyFieldKey, imageFieldKey
- `section-heading` → headingFieldKey, subheadingFieldKey
- `download-button` → urlFieldKey

Each binding renders an independent dropdown filtered to compatible field types.

---

## `effectiveMode` logic

A block placed inside a Repeater's `cardTemplate` gets template-mode UI even when `mode === 'static'`. This is because blocks in a Repeater are always bound to the Repeater's collection. The Inspector receives `repeaterContext` from `Editor.tsx` (set via `findParentRepeater()`), and uses `effectiveMode = repeaterContext ? 'template' : mode`.

---

## Layout section (universal)

Always shown for all block types:

| Control | Values |
|---|---|
| Padding Top / Bottom | none / sm (2rem) / md (4rem) / lg (6rem) / xl (8rem) |
| Max Width | sm (640px) / md (768px) / lg (1024px) / full (100%) |
| Content Alignment | left / center / right |

---

## Styling section (universal)

| Control | Notes |
|---|---|
| Background | none / muted / dark / brand-red (#BC0D2A) / brand-green (#328542) / navy (#0b0f19). Shows a colour swatch. |
| Hide on Mobile | Toggle. Injects scoped `@media` + `@container` CSS in `renderPreview.tsx`. |
| Custom CSS Class | Free-text; passed through as `className` on the `<section>` wrapper in preview. |

---

## Template-only sections (only when `effectiveMode === 'template'`)

- **Typography** — Font Size, Font Weight, Text Color (free-text).
- **Border** — Border Width (0/1/2/4px), Border Radius (none/sm/md/lg/full).
- **Grid / Flex** — Gap, Grid Columns (1–4).
- **Media** — Aspect Ratio (auto/square/video/portrait).

---

## Possible changes

| Change | What to touch |
|---|---|
| Add a new bound block type | Add it to `BOUND_FIELD_TYPES` with its accepted field types. |
| Add a new composite block | Add an entry to `COMPOSITE_BINDINGS` with key/label/allowed arrays. |
| Add a new background preset | Add to the `Select` in the Styling section and to `BACKGROUND_STYLE` in `renderPreview.tsx`. |
| Add a new padding size | Add to both the `Select` items in the Layout section and the `PADDING_MAP` in `renderPreview.tsx`. |
| Make OG Image pick from the asset library | Replace the `Input` in `PageSettingsPanel` with `AssetPicker`. |
| Add more Inspector fallbacks | Edit `INSPECTOR_FALLBACKS` at the top of the file. |
| Show Typography / Border in static mode | Remove the `effectiveMode === 'template'` guard from those sections. |
| Add a custom font picker | Add a `fontFamily` Select to `BoundTextTypographySection` and resolve it in `getBaseStyles` in `renderPreview.tsx`. |


---

# BlockSelector.tsx

**Path:** `src/components/page-builder/BlockSelector.tsx`
**Type:** Client component — a Radix Popover-based block picker.

---

## What it does

`BlockSelector` is a compact, searchable popover that lists all available blocks grouped by category. Clicking a block fires `onAdd(type)` and closes the popover. It is currently **not used directly** in the editor layout (the `BlockSidebar` replaced it as the primary entry point), but it is still imported by `ContainerBlock.tsx` and `RepeaterBlock.tsx` as the child-block picker.

---

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `onAdd` | `(type: string) => void` | required | Called when the user selects a block. |
| `trigger` | `React.ReactNode` | `undefined` | Custom trigger element. Defaults to a dashed "Add Block" button. |
| `side` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'` | Popover placement relative to the trigger. |
| `align` | `'start' \| 'center' \| 'end'` | `'center'` | Alignment of the popover. |
| `className` | `string` | `undefined` | Extra class on the default trigger button. |

---

## Categories

Blocks are grouped in this fixed order:

| Category | Block types |
|---|---|
| Composite | product-hero |
| Content | hero, rich-text, section-heading, cta, columns, table, key-value-list |
| Media | image, video |
| Interactive | form, newsletter, contact-form, collection-list, download-button |
| Layout | container, spacer |
| Template | repeater, collection-item-fields, bound-text, bound-image, bound-rich-text, bound-date |
| Other | Any registry block not assigned to a named category (auto-detected). |

---

## `EXTRA_BLOCK_META`

**Exported from this file** — used by `Editor.tsx`'s drawer header and `BlockSidebar.tsx`.

Contains metadata for `container` and `repeater`, which live outside `BLOCKS_REGISTRY` to avoid circular imports:

```ts
EXTRA_BLOCK_META = {
  container: { type, label: 'Container', description: '...', icon: LayoutTemplate },
  repeater:  { type, label: 'Repeater',  description: '...', icon: Repeat2 },
}
```

---

## Search

Free-text search filters by block `label` and `description` (case-insensitive). Empty search shows all blocks. When all results in a category are filtered out, the category header is hidden.

---

## Popover appearance

- Width: 320px, max-height: 480px with scroll.
- Search input is auto-focused when the popover opens.
- Each block row: icon (turns brand-red on hover), label, description.
- No results: shows "No blocks match '…'".

---

## Possible changes

| Change | What to touch |
|---|---|
| Add a block to a category | Add its type string to the relevant array in `CATEGORIES`. |
| Create a new category | Add `{ label: 'My Category', types: ['my-block'] }` to `CATEGORIES`. |
| Change popover dimensions | Edit `w-80 max-h-[480px]` on `PopoverContent`. |
| Add block thumbnails/previews | Add a `thumbnail` field to `BlockConfig` in `registry.ts` and render it here. |
| Add keyboard arrow-key navigation | Replace the `<button>` list with a Radix `Command` (cmdk) component. |


---

# BlockSidebar.tsx

**Path:** `src/components/page-builder/BlockSidebar.tsx`
**Type:** Client component — the persistent left-hand block picker panel in the editor.

---

## What it does

`BlockSidebar` is a collapsible `<aside>` that lists all available blocks organised by category. Clicking any block calls `onAdd(type)`, which wires directly to `Editor.addBlock`. It is always visible in Edit mode, sitting to the left of the canvas.

It is the **primary** way to add blocks to a page (the older `BlockSelector` popover is now only used inside Container/Repeater child pickers).

---

## Props

| Prop | Type | Description |
|---|---|---|
| `onAdd` | `(type: string) => void` | Called with the block type when the user clicks a block entry. |

---

## State

| State | Persisted | Description |
|---|---|---|
| `collapsed` | `localStorage('pb.sidebarCollapsed')` | When `true`, sidebar shrinks to 48px and shows only icons with tooltips. |
| `search` | — (session only) | Live filter text. |
| `openCategories` | `localStorage('pb.category.<Label>')` per category | Whether each category section is expanded. Defaults to `true` (open). |
| `hydrated` | — | Guards against reading `localStorage` during SSR. |

---

## Layout modes

### Expanded (w-[200px])
- Header with "BLOCKS" label + collapse button.
- Search input (persists in state but not localStorage).
- Categories with chevron-toggle headers.
- Each block: small icon + label text.

### Collapsed (w-12)
- Collapse button only in the header; no label.
- Search hidden.
- Category headers hidden.
- Each block: icon only, with a tooltip (`title`) showing label + description.
- All blocks always visible regardless of `openCategories` when collapsed.

---

## Search behaviour

- Filters by block `label` and `description` (case-insensitive).
- When a query is active, all categories are force-expanded (`forceOpenAll = true`) regardless of their persisted open/closed state.
- Empty categories (all blocks filtered out) are hidden from the list.
- Empty state: "No blocks match '…'" shown below the list (expanded mode only).

---

## Categories

Same fixed order as `BlockSelector.tsx`:

| Category | Block types |
|---|---|
| Composite | product-hero |
| Content | hero, rich-text, section-heading, cta, columns, table, key-value-list |
| Media | image, video |
| Interactive | form, newsletter, contact-form, collection-list, download-button |
| Layout | container, spacer |
| Template | repeater, collection-item-fields, bound-text, bound-image, bound-rich-text, bound-date |
| Other | Auto-detected: any block in the registry not in a named category. |

Both `BLOCKS_REGISTRY` entries and `EXTRA_BLOCK_META` (container, repeater) are merged via:
```ts
EXTRA_BLOCK_META[type] ?? BLOCKS_REGISTRY[type]
```

---

## Possible changes

| Change | What to touch |
|---|---|
| Change the collapsed width | Edit the `w-12` class on the `<aside>`. |
| Change the expanded width | Edit `w-[200px]` on the `<aside>`. |
| Add drag-from-sidebar to canvas | Replace `onClick(() => onAdd(block.type))` with dnd-kit's `useDraggable`; handle the drop in `Editor.handleDragEnd`. |
| Add a "Recently used" category | Track a `recentlyUsed: string[]` array in `localStorage`; prepend it to `allCategories`. |
| Add category reordering | Make `CATEGORIES` a user-editable preference stored in `localStorage`. |
| Persist search across sessions | Add `localStorage.setItem('pb.sidebarSearch', search)` to the search `onChange`. |
| Show block descriptions in expanded mode | Render `block.description` as a second line below the label. |
| Add a "favourites" star | Add a star button per block row; persist favourited IDs in `localStorage` and show them in a top "Favourites" category. |


---

# renderEditor.tsx

**Path:** `src/components/page-builder/renderEditor.tsx`
**Type:** Client component — the edit-mode wrapper card for a single block.

---

## What it does

`RenderEditor` wraps any registry block in a drag-and-drop sortable card with a header bar showing the block's icon, label, a type badge (on hover), a Duplicate button, and a Remove button. It delegates actual block content editing to the block's own `Editor` component from the registry.

This component is **only used for top-level blocks in the main canvas** (the `blocks.map(…)` in `Editor.tsx`). Container children and Repeater card-template children use their own internal `SortableChild` wrappers inside `ContainerBlock.tsx` and `RepeaterBlock.tsx`.

---

## Props

| Prop | Type | Description |
|---|---|---|
| `block` | `{ id, type, data, order }` | The block to render. |
| `onChange` | `(id, updates) => void` | Propagates field changes up to `Editor.updateBlock`. |
| `onRemove` | `(id) => void` | Calls `Editor.removeBlock`. |
| `onDuplicate` | `(id) => void` | Calls `Editor.duplicateBlock`. |
| `isOverlay` | `boolean` | When `true` (DragOverlay usage), renders with a rotated/shadow effect and disables pointer events on the drag handle. |

---

## dnd-kit integration

Uses `useSortable({ id: block.id })` from `@dnd-kit/sortable`.

- `setNodeRef` attaches to the outer `<Card>`.
- `transform` + `transition` applied as inline style for the smooth drag animation.
- `isDragging` sets `opacity: 0.4` on the original item while it is being dragged (the overlay renders the full card instead).
- `attributes` + `listeners` are spread onto the grip icon button so only the handle initiates drag.

---

## Error handling

If `BLOCKS_REGISTRY[block.type]` returns `undefined`, the component renders a red error card showing "Unknown block type: `<type>`". This prevents crashes when a block type is removed from the registry but still exists in saved data.

---

## Card layout

```
┌──────────────────────────────────────────────────────────┐
│  ≡  <Icon> Label                     [type badge]  📋  🗑  │  ← CardHeader
├──────────────────────────────────────────────────────────┤
│                                                          │
│         <Editor block={data} onChange={...} />           │  ← CardContent
│                                                          │
└──────────────────────────────────────────────────────────┘
```

- The type badge (`font-mono`) is hidden by default and appears on `group-hover`.
- `onClick` on the card is handled by `Editor.tsx` (the parent div), not here.

---

## Possible changes

| Change | What to touch |
|---|---|
| Add a "Move to top / bottom" quick action | Add buttons to the header bar that call reorder helpers passed down from `Editor.tsx`. |
| Show a mini live preview thumbnail in the header | Render a scaled-down `<Preview>` component inside a `pointer-events-none` wrapper in the header. |
| Add a block visibility toggle (eye icon) | Add a `hidden` field to `BlockData`; add an eye button here; skip hidden blocks in `renderPreview.tsx`. |
| Change the block card styling | Edit `CardHeader` / `CardContent` classes and the `group relative` card class. |
| Add keyboard shortcut to delete selected block | The deletion shortcut should live in `Editor.tsx`'s `handleKeyDown` rather than here, since this component doesn't know if it's "selected". |


---

# renderPreview.tsx

**Path:** `src/components/page-builder/renderPreview.tsx`
**Type:** Client component — the canonical renderer for all blocks in preview and live-site output.

---

## What it does

`RenderPreview` converts a single `Block` into its public HTML output. It wraps every block in a `<section>` with inline CSS for padding and background, then an inner `<div>` for max-width and text alignment. The block's own `Preview` component from the registry is rendered inside that inner div.

This is the only output path — the live public pages call the same `RenderPreview` for each block in the stored `blocks` array, so what you see in the Preview tab is exactly what renders live.

---

## Architecture

```
<section data-block-id={id} style={sectionStyle} className={customClass}>
  <div style={wrapperStyle}>
    <Preview block={data} />      ← from BLOCKS_REGISTRY
  </div>
</section>
```

Container and Repeater blocks are handled before the registry lookup to avoid circular imports:
- `container` → `ContainerPreview` (renders its `children` without a `<section>` wrapper per child).
- `repeater` → `RepeaterPreview` (fetches entries, renders one card per entry).

Unknown block types silently return `null` in preview (no error, unlike the editor).

---

## Style functions

### `getSectionStyle(data)`
Returns `paddingTop`, `paddingBottom`, and the background preset CSS:

| `background` value | CSS |
|---|---|
| `none` | `{}` (white) |
| `muted` | `backgroundColor: var(--muted)` |
| `dark` | `backgroundColor: var(--foreground); color: var(--background)` |
| `brand-red` | `backgroundColor: #BC0D2A; color: #ffffff` |
| `brand-green` | `backgroundColor: #328542; color: #ffffff` |
| `navy` | `backgroundColor: #0b0f19; color: #ffffff` |
| `image` | `backgroundSize: cover; backgroundPosition: center` |

### `getWrapperStyle(data)`
Returns `marginLeft/Right: auto`, `paddingLeft/Right: 1rem`, `maxWidth`, and `textAlign`:

| `maxWidth` | CSS value |
|---|---|
| `sm` | 640px |
| `md` | 768px |
| `lg` | 1024px |
| `full` | 100% |

### `getBaseStyles(data)`
Maps template-mode typography, border, spacing, flex/grid, and media fields onto inline CSS. Handles:

- **Font size** — enum map: `xs`→0.75rem … `4xl`→2.25rem; bare numbers get `px`; CSS values pass through.
- **Font weight** — `normal`→400, `medium`→500, `semibold`→600, `bold`→700.
- **Text align / text color / text transform**.
- **Background color** (free-text; separate from the preset `background` field).
- **Border** — width, style (`solid`), radius (enum map), color. Border is only emitted when `borderWidth` is non-zero.
- **Spacing** — `padding`, `margin`, `gap` via a `none→0 / sm→0.5rem / md→1rem / lg→2rem / xl→3rem` enum map.
- **Flex / grid** — `flexDirection`, `alignItems`, `justifyContent`.
- **Media** — `aspectRatio` (named presets + raw strings), `objectFit`.

---

## `hideOnMobile` gate

When `data.hideOnMobile` is `true`, `RenderPreview` renders a `<HideOnMobileStyle id={block.id}>` component alongside the `<section>`. This injects a scoped `<style>` tag with two rules:

```css
/* Live site — viewport-based */
@media (max-width: 767.98px) {
  section[data-block-id="<id>"] { display: none !important; }
}

/* Editor Preview tab — container-query-based */
@container preview (max-width: 767.98px) {
  section[data-block-id="<id>"] { display: none !important; }
}
```

The `@container preview` rule fires when the `@container/preview` wrapper in the Editor is narrowed below 768px (i.e. when the user selects the Tablet or Mobile viewport toggle). This keeps the preview visually accurate without depending on the actual browser window width.

---

## Padding scale

| Token | CSS value |
|---|---|
| `none` | 0 |
| `sm` | 2rem |
| `md` | 4rem |
| `lg` | 6rem |
| `xl` | 8rem |

---

## Possible changes

| Change | What to touch |
|---|---|
| Add a new background preset | Add to `BACKGROUND_STYLE` map here AND to the Select in `Inspector.tsx`'s Styling section. |
| Change the padding scale | Edit `PADDING_MAP` here; also update the `Select` items in `Inspector.tsx`. |
| Add a new max-width option | Edit `MAX_WIDTH_MAP` here and the Select in `Inspector.tsx`. |
| Add a `hidden` (fully invisible) block feature | Add a guard before the return — if `data.hidden` return `null`. |
| Support background image on the section | When `data.background === 'image'`, pass `backgroundImage: \`url(${data.backgroundImageUrl})\`` in `getSectionStyle`. |
| Change the mobile breakpoint | Edit `767.98px` in `HideOnMobileStyle`. Note: the Container block has its own Tailwind classes (`max-md:`) which also need updating. |
| Add a `data-block-type` attribute | Add it to `sectionProps` alongside `data-block-id`. Useful for CSS targeting by block type. |
| Make `customClassName` safe (sanitize) | Wrap the `data.customClassName` value through a whitelist/sanitizer before passing it as `className`. |


---

# EditorContext.ts

**Path:** `src/components/page-builder/EditorContext.ts`
**Type:** React Context — thin selection-state bridge between `Editor.tsx` and deeply nested child components.

---

## What it does

Provides `selectedBlockId` and `setSelectedBlockId` to any component within the editor tree without prop-drilling. The context is created here; the Provider lives in `Editor.tsx`.

---

## API

```ts
interface EditorContextValue {
  selectedBlockId: string | null;
  setSelectedBlockId: (id: string | null) => void;
}
```

### `EditorContext`
The raw React context. Default value is `{ selectedBlockId: null, setSelectedBlockId: () => {} }`, so reading outside a Provider silently no-ops instead of throwing.

### `useEditorContext()`
Convenience hook — returns the context value. Used by:
- `ContainerBlock.tsx` → `SortableChild` highlights the selected block and calls `setSelectedBlockId` on click.
- `RepeaterBlock.tsx` → `SortableCardChild` does the same for card-template children.

---

## Who sets vs. who reads

| Component | Role |
|---|---|
| `Editor.tsx` | **Sets** — owns `selectedBlockId` state, provides it via `EditorContext.Provider`. |
| `ContainerBlock.tsx` (SortableChild) | **Reads + sets** — reads to apply the red ring; calls `setSelectedBlockId` on click. |
| `RepeaterBlock.tsx` (SortableCardChild) | Same as SortableChild. |

The Inspector itself does **not** consume `EditorContext` — it receives `selectedBlock` as a prop from `Editor.tsx` instead.

---

## Possible changes

| Change | What to touch |
|---|---|
| Add `hoveredBlockId` for hover highlighting | Add it to `EditorContextValue`; manage the state in `Editor.tsx`; consume it in `RenderEditor` or `SortableChild`. |
| Add multi-select | Change `selectedBlockId: string | null` to `selectedBlockIds: string[]`; update all consumers. |
| Move context to Zustand | Replace the `createContext` + `useState` approach with a Zustand slice if the editor ever needs selection state outside the React tree (e.g. from a keyboard shortcut handler). |


---

# blocks/registry.ts

**Path:** `src/components/page-builder/blocks/registry.ts`
**Type:** Module — the central registry of all block types.

---

## What it does

`BLOCKS_REGISTRY` is a plain object keyed by block type string. Every registered block exports an `Editor` component (edit-mode form), a `Preview` component (live output), a `createDefault()` factory, metadata (icon, label, description), and an optional `validate()` function.

`registry.ts` is the single import point that wires all block Editor+Preview pairs. Only components that need **all** blocks import from here; individual blocks import nothing from it (avoiding circular dependencies).

---

## `BlockConfig<T>` shape

```ts
type BlockConfig<T extends BlockData> = {
  type: T['type'];
  label: string;
  description: string;
  icon: React.ElementType;           // Lucide icon
  createDefault: () => Omit<T, 'id' | 'type'> & Partial<Pick<T, 'type'>>;
  Editor: React.ComponentType<{ block: T; onChange: (updates: Partial<T>) => void }>;
  Preview: React.ComponentType<{ block: T; className?: string }>;
  validate?: (data: unknown) => { success: boolean; error?: string };
};
```

---

## Registered blocks

| Key | Label | Category |
|---|---|---|
| `hero` | Hero | Content |
| `rich-text` | Rich Text | Content |
| `image` | Image | Media |
| `video` | Video | Media |
| `columns` | Columns | Content |
| `table` | Table | Content |
| `cta` | Call to Action | Content |
| `form` | Form | Interactive |
| `spacer` | Spacer | Layout |
| `collection-list` | Collection List | Interactive |
| `newsletter` | Newsletter | Interactive |
| `contact-form` | Contact Form | Interactive |
| `bound-text` | Bound Text | Template |
| `bound-image` | Bound Image | Template |
| `bound-rich-text` | Bound Rich Text | Template |
| `bound-date` | Bound Date | Template |
| `collection-item-fields` | Collection Item Fields | Template |
| `product-hero` | Product Hero | Composite |
| `section-heading` | Section Heading | Content |
| `key-value-list` | Key-Value List | Content |
| `download-button` | Download Button | Interactive |
| `button` | Button | Interactive |
| `contact-form-simple` | Contact Form (Simple) | Interactive |
| `catalogue` | Catalogue Download | Interactive |

**Not in the registry** (handled as special cases in `Editor.tsx` and `renderPreview.tsx`):
- `container` — defined in `ContainerBlock.tsx`, exported as `EXTRA_BLOCK_META` in `BlockSelector.tsx`.
- `repeater` — defined in `RepeaterBlock.tsx`, same pattern.

---

## `createDefault()` return values

Each block's `createDefault()` returns an object of initial field values (no `id`, no `type`). These are used by:
- `createBlock.ts` when instantiating a new block.
- `Inspector.tsx` to seed fallback values for controlled inputs.

---

## `BlockType`

```ts
export type BlockType = keyof typeof BLOCKS_REGISTRY;
```

Used throughout the codebase to type-safely reference block type strings.

---

## Possible changes

| Change | What to touch |
|---|---|
| Register a new block | Create `src/components/page-builder/blocks/<name>/<Name>Block.tsx`, export `Editor` + `Preview` + `createDefault`, then add an entry here. |
| Add a `validate()` function | Add it to the block's entry; call it in the form submit / save path. |
| Add a `thumbnail` field | Add `thumbnail?: string` to `BlockConfig`; render it in `BlockSelector.tsx` and `BlockSidebar.tsx`. |
| Add a `tags` field for richer search | Add `tags?: string[]` to `BlockConfig`; filter on it in the sidebar/selector search. |
| Lazy-load block components | Replace static imports with `React.lazy(...)` + `Suspense`. This would reduce the initial bundle significantly on pages with few block types. |


---

# ContainerBlock.tsx

**Path:** `src/components/page-builder/blocks/container/ContainerBlock.tsx`
**Type:** Client component — flex/grid layout container that holds nested blocks.

---

## What it does

The Container block is a layout wrapper that can hold other blocks side-by-side or stacked. Unlike all other blocks it is **not registered in `BLOCKS_REGISTRY`** — it is handled as a special case in `Editor.tsx` and `renderPreview.tsx` to avoid circular imports (ContainerBlock imports from the registry itself to render its children).

The file exports three things:
- `createContainerBlock(order)` — factory used by `Editor.addBlock('container')`.
- `ContainerEditorCard` — the drag-and-drop editor card, dispatched directly from `Editor.tsx`.
- `ContainerPreview` — the preview renderer, dispatched directly from `renderPreview.tsx`.

---

## Data shape (`ContainerBlockData`)

| Field | Type | Default | Description |
|---|---|---|---|
| `layout` | `'stack' \| 'two-col-text-image' \| 'two-col-image-text' \| 'three-col'` | `'stack'` | Layout preset. |
| `direction` | `'column' \| 'row'` | `'column'` | Flex direction (only applies when `layout === 'stack'`). |
| `mobileBehavior` | `'stack' \| 'same' \| 'hide'` | `'stack'` | How the container behaves on mobile (< 768px). |
| `containerGap` | `'none' \| 'sm' \| 'md' \| 'lg'` | `'md'` | Gap between children (0/8/16/32px). |
| `containerPadding` | `'none' \| 'sm' \| 'md' \| 'lg'` | `'none'` | Inner padding of the container box (0/8/16/32px). |
| `alignItems` | `'stretch' \| 'start' \| 'center' \| 'end'` | `'stretch'` | CSS `align-items`. |
| `backgroundColor` | `string` | `''` | Free-text background color. |
| `borderWidth` | `'0' \| '1' \| '2' \| '4'` | `'0'` | Border width in px. |
| `borderRadius` | `'none' \| 'sm' \| 'md' \| 'lg' \| 'full'` | `'none'` | Border radius (0/4/8/16/9999px). |
| `borderColor` | `string` | `''` | Border color (free-text). |
| `children` | `Block[]` | `[]` | Nested blocks. |
| `paddingTop/Bottom` | `'none'/'sm'/'md'/'lg'/'xl'` | `'md'` | Section-level outer padding (via `renderPreview.tsx`). |
| `background` | preset string | `'none'` | Section-level background (via `renderPreview.tsx`). |
| `hideOnMobile` | `boolean` | `false` | Hides the whole container on mobile. |

---

## Layout presets (preview)

| Preset | CSS output |
|---|---|
| `stack` | `display: flex; flexDirection: <direction>` |
| `two-col-text-image` | `display: flex; flexDirection: row` |
| `two-col-image-text` | `display: flex; flexDirection: row-reverse` |
| `three-col` | `display: grid; gridTemplateColumns: repeat(3, minmax(0, 1fr))` |

---

## Mobile behaviour (preview)

`ContainerPreview` emits Tailwind classes for responsiveness because it is rendered inside the `@container/preview` wrapper:

| `mobileBehavior` | Classes added |
|---|---|
| `hide` | `max-md:hidden @max-3xl/preview:hidden` |
| `stack` (multi-column layout) | Forces `flex-col` / `1fr` grid below 768px via `max-md:` and `@max-3xl/preview:` variants |
| `same` | No mobile override |

---

## Editor behaviour

### `ContainerEditorCard`
- Uses `useSortable` from dnd-kit for top-level drag ordering (the card itself is draggable in the main canvas).
- Its children have their own `SortableContext` + `SortableChild` components with independent drag handles.
- `direction === 'row'` switches the children drop zone to `flex flex-row flex-wrap` and uses `horizontalListSortingStrategy`.
- `direction === 'column'` uses `flex flex-col` + `verticalListSortingStrategy`.
- Child mutations (`updateChild`, `removeChild`, `duplicateChild`, `addChild`) are handled locally and bubble up via `onChange(block.id, { children: newChildren })`.
- The `AddChildButton` popover restricts available child types to `CHILD_BLOCK_TYPES` (excludes full-page sections and container itself — no nested containers in v1).

### `SortableChild`
Inner draggable wrapper for each child block. Reads `EditorContext` to apply the red selection ring and calls `setSelectedBlockId(child.id)` on click. Renders the child's `Editor` component from the registry.

---

## Allowed child types

```ts
const CHILD_BLOCK_TYPES = [
  'rich-text', 'image', 'video', 'spacer', 'cta',
  'bound-text', 'bound-image', 'bound-rich-text', 'bound-date',
]
```

---

## Possible changes

| Change | What to touch |
|---|---|
| Allow nested containers (container inside container) | Add `'container'` to `CHILD_BLOCK_TYPES` and handle the `createContainerBlock` case in `addChild`. Update `Editor.tsx`'s `updateBlock`/`removeBlock`/`duplicateBlock`/`handleDragEnd` to recurse one more level. |
| Add a new layout preset | Add a case to the `getLayoutStyles` switch and a `SelectItem` in `Inspector.tsx`'s `ContainerLayoutSection`. |
| Add cross-container drag | Replace the per-container `SortableContext` approach with a shared `DndContext` that tracks the active draggable's target container using `DragOverEvent`. |
| Add a `justifyContent` control | Add the field to `ContainerBlockData`; expose it in `Inspector.tsx`'s `ContainerLayoutSection`; map it in `ContainerPreview`. |
| Allow sections (hero, contact-form) as children | Add them to `CHILD_BLOCK_TYPES`. Be aware these blocks manage their own padding internally. |
| Add more gap options | Add entries to the `GAP_MAP` constant at the top of the file and to the Select in Inspector. |


---

# RepeaterBlock.tsx

**Path:** `src/components/page-builder/blocks/repeater/RepeaterBlock.tsx`
**Type:** Client component — fetches a collection's entries and renders one card per entry using a designable card template.

---

## What it does

The Repeater block is the primary tool for displaying dynamic collection data on a page. Like the Container block, it is **not in `BLOCKS_REGISTRY`** — it is dispatched as a special case from `Editor.tsx` and `renderPreview.tsx`.

The file exports:
- `createRepeaterBlock(order)` — factory.
- `RepeaterEditorCard` — editor UI (card template designer + inspector binding).
- `RepeaterPreview` — live renderer (fetches entries, renders a grid of cards).

---

## Data shape (`RepeaterBlockData`)

| Field | Type | Default | Description |
|---|---|---|---|
| `collectionId` | `string \| null` | `null` | The CMS collection to pull entries from. |
| `collectionSlug` | `string \| null` | `null` | Stored alongside `collectionId` to avoid extra lookups at render time. |
| `columns` | `'1' \| '2' \| '3' \| '4'` | `'3'` | Number of grid columns. |
| `repeaterGap` | `'sm' \| 'md' \| 'lg'` | `'md'` | Gap between cards (12/24/48px). |
| `cardTemplate` | `Block[]` | `[]` | The layout blocks that define one card (bound + static blocks, optionally containers). |
| `paddingTop/Bottom` | spacing tokens | `'md'` | Section-level outer padding. |
| `background` | preset | `'none'` | Section-level background. |

---

## How the card template works

The `cardTemplate` array is the designer-authored layout for a single card. In edit mode, the card template is shown once as an editable preview. In live preview, the same template is cloned for each entry, wrapped in `RepeaterEntryContext.Provider` with that entry's data.

Bound blocks (`BoundText`, `BoundImage`, etc.) inside the card template read `useRepeaterEntry()` to get the entry data instead of making an API call, so they render the real entry's field value for each card.

---

## `RepeaterEntryContext`

Defined in `src/contexts/RepeaterEntryContext.ts`. Provides:

```ts
{ entryData: Record<string, any>, collectionSlug: string | null }
```

Consumed by all four bound block Previews. When this context is present, bound blocks skip the API fetch entirely and read directly from `entryData[fieldKey]`.

---

## `RepeaterPreview` behaviour

1. If no `collectionId` is set, renders a placeholder text and returns.
2. Fetches `GET /api/entries?collectionId=<id>` (one request for all entries). Uses `AbortController` for cleanup.
3. While loading or if entries are empty, renders `null`.
4. Renders a CSS grid (`display: grid; gridTemplateColumns: repeat(N, 1fr); gap: Xpx`).
5. For each entry, wraps all `cardTemplate` blocks in a `RepeaterEntryContext.Provider` with that entry's `data`.
6. Dispatches `ContainerPreview` for container children, or `reg.Preview` for registered blocks.

---

## `RepeaterEditorCard` behaviour

- Shows a warning badge if no collection is selected (nudges the user to use the Inspector).
- Shows the collection name fetched from `GET /api/collections/:id` in the card header badge.
- The card template zone is styled with an indigo dashed border to distinguish it from the container's gray dashed border.
- Supports `container` blocks inside the card template (calls `ContainerEditorCard` recursively).
- The `AddCardBlockButton` popover includes `container` at the top of the list, plus bound blocks, rich-text, image, and spacer.

---

## Allowed card template types

```ts
const CARD_TEMPLATE_TYPES = [
  'container',       // nested layout
  'bound-text',
  'bound-image',
  'bound-rich-text',
  'bound-date',
  'rich-text',       // static content
  'image',           // static image
  'spacer',
]
```

---

## Inspector controls (via `RepeaterSection` in `Inspector.tsx`)

| Control | Description |
|---|---|
| Collection | Dropdown of all collections. Sets both `collectionId` and `collectionSlug`. |
| Columns | 1–4 columns. |
| Gap | Small (12px) / Medium (24px) / Large (48px). |

---

## Possible changes

| Change | What to touch |
|---|---|
| Add pagination / limit | Add a `limit` field to `RepeaterBlockData`; pass `?limit=N` to the entries fetch; add a control in `RepeaterSection`. |
| Add sorting/filtering | Add `sortField`, `sortDir`, `filterField`, `filterValue` to the data; pass as query params to the API. |
| Add a "load more" button | In `RepeaterPreview`, keep a `displayCount` state and render a button that increments it. |
| Allow static blocks other than rich-text/image/spacer | Add types to `CARD_TEMPLATE_TYPES`. |
| Show a skeleton while loading | Replace the `if (loading) return null` with a grid of `<Skeleton>` components. |
| Support responsive columns | Replace the single `columns` field with `desktopColumns` / `tabletColumns` / `mobileColumns`; use container queries in the grid styles. |
| Add an "entry link" wrapper | Wrap each card `<div>` in an `<a href={\`/collections/${collectionSlug}/${entry.slug}\`}>` when `collectionSlug` and `entry.slug` are present. |


---

# HeroBlock.tsx

**Path:** `src/components/page-builder/blocks/hero/HeroBlock.tsx`
**Registry key:** `hero`

---

## What it does

Full-width hero section with a headline, subheadline, two CTA buttons (primary + secondary), a background image, and an optional dark overlay. The Preview component renders the same `HeroSection` component used on the live home page, so the appearance is pixel-perfect.

---

## Data shape

| Field | Type | Default | Description |
|---|---|---|---|
| `headline` | `string` | `''` | Main headline. Falls back to the HeroSection built-in default when empty. |
| `subheadline` | `string` | `''` | Supporting text below the headline. |
| `ctaLabel` | `string` | `''` | Primary button label. |
| `ctaUrl` | `string` | `''` | Primary button URL. |
| `ctaSecondaryLabel` | `string` | `''` | Secondary button label. |
| `ctaSecondaryUrl` | `string` | `''` | Secondary button URL. |
| `backgroundImage` | `string` | `''` | URL of the background image. |
| `overlay` | `boolean` | `false` | Dark overlay on top of the background image. |
| `minHeight` | `'sm' \| 'md' \| 'lg' \| 'full'` | `'md'` | Minimum height of the hero. |
| `textColor` | `'light' \| 'dark'` | `'light'` | Text colour scheme. |
| `paddingTop` | `'none'` | `'none'` | Section padding is suppressed — HeroSection manages its own. |
| `paddingBottom` | `'none'` | `'none'` | Same. |

---

## Editor controls

- Headline and subheadline text inputs.
- Primary CTA: label + URL inputs.
- Secondary CTA: label + URL inputs.
- Background Image URL (or AssetPicker).
- Overlay toggle.
- Min height select.
- Text color select (light/dark).

---

## Preview

Delegates entirely to the live `HeroSection` site component. Empty string fields cause `HeroSection` to fall back to its own hardcoded defaults, so a freshly dropped Hero block shows the actual home-page hero immediately.

---

## Possible changes

| Change | What to touch |
|---|---|
| Add a third CTA button | Add `ctaTertiaryLabel` + `ctaTertiaryUrl` fields; update the Editor form and `HeroSection` component. |
| Add video background support | Add a `backgroundVideo` URL field; in `HeroSection` render a `<video>` autoplay loop behind the content. |
| Make background image selectable from the asset library | Replace the URL `Input` with `AssetPicker`. |
| Add text alignment control | Add an `align` field (`left/center/right`); apply it in `HeroSection`. |
| Add an animated entrance | Add a `animate` boolean field; in `HeroSection` apply a Tailwind `animate-fade-in` class when true. |


---

# RichTextBlock.tsx

**Path:** `src/components/page-builder/blocks/rich-text/RichTextBlock.tsx`
**Registry key:** `rich-text`

---

## What it does

A formatted text block backed by TipTap. The editor exposes a rich-text toolbar (headings, bold, italic, lists, links); the preview renders the stored HTML with consistent prose styles.

---

## Data shape

| Field | Type | Default | Description |
|---|---|---|---|
| `content` | `string` | `'<p>Start typing your content here...</p>'` | Raw HTML string produced by TipTap. |

All layout/styling fields (`paddingTop`, `paddingBottom`, `align`, `maxWidth`, `background`, etc.) are handled by the universal `RenderPreview` wrapper, not stored in `content`.

---

## Editor

Uses TipTap with a floating or fixed toolbar. The `onChange` callback fires whenever the content changes and passes the new HTML string via `onChange({ content: editor.getHTML() })`.

**Important:** Do not add inline styles to TipTap components — see `CLAUDE.md`. Prose styles are defined in `blocks/proseClasses.ts` and applied consistently to both the editor's editable area and the preview output.

---

## Preview

Renders the `content` HTML via `dangerouslySetInnerHTML`. Prose styles from `proseClasses.ts` are applied to the wrapper div so headings, lists, links, and tables all render consistently.

---

## `proseClasses.ts`

Defines the shared Tailwind class string applied to both the TipTap editor container and the `RichTextPreview` wrapper. Both must use the same classes to ensure WYSIWYG accuracy.

---

## Possible changes

| Change | What to touch |
|---|---|
| Add a table insertion button to the toolbar | Enable TipTap's `Table` extension; add a toolbar button. |
| Add image embedding in the rich text | Enable TipTap's `Image` extension; add an upload/URL dialog; use AssetPicker. |
| Change default prose styles | Edit `proseClasses.ts` — changes apply to both editor and preview automatically. |
| Add YouTube embed support | Enable TipTap's `Youtube` extension and add a toolbar button. |
| Add text highlight / colour | Enable TipTap's `Highlight` + `Color` extensions. |
| Support Markdown paste | Enable `@tiptap/extension-markdown`. |


---

# ImageBlock.tsx

**Path:** `src/components/page-builder/blocks/image/ImageBlock.tsx`
**Registry key:** `image`

---

## What it does

A single image with alt text, an optional caption, and optional link wrapping. Fully static — the image URL is entered manually or picked from the asset library.

---

## Data shape

| Field | Type | Default | Description |
|---|---|---|---|
| `url` | `string` | `''` | Image source URL. |
| `alt` | `string` | `''` | Alt text for accessibility / SEO. |
| `caption` | `string` | `''` | Optional caption displayed below the image. |
| `objectFit` | `'cover' \| 'contain' \| 'fill'` | `'cover'` | CSS `object-fit` for the `<img>` element. |
| `linkUrl` | `string` | `''` | Wraps the image in an `<a>` when set. |
| `aspectRatio` | aspect ratio token | — | Inspector-level override; resolved in `renderPreview.tsx`'s `getBaseStyles`. |
| `width` | `'full' \| 'half' \| 'third' \| 'auto'` | — | Inspector-level width override. |
| `borderRadius` | radius token | — | Inspector-level border radius. |
| `hideOnMobile` | `boolean` | — | Hides the block at mobile viewport widths. |

---

## Editor

- URL text input + AssetPicker button (opens the asset library).
- Alt text input.
- Caption input.
- Link URL input.
- Object fit select (shown when URL is set).

---

## Preview

- If `url` is empty, shows a placeholder `<div>` with an image icon.
- If `url` is set, renders `<img src={url} alt={alt}>` with `object-fit` style.
- If `caption` is set, wraps in a `<figure>` with a `<figcaption>`.
- If `linkUrl` is set, wraps the figure/image in `<a href={linkUrl}>`.

---

## Inspector controls

The `ImageSizingSection` in `Inspector.tsx` adds controls for:
- **Aspect Ratio** — auto / 1:1 / 4:3 / 16:9 / 3:4
- **Object Fit** — cover / contain / fill
- **Width** — full / half / third / auto
- **Border Radius** — none / sm / md / lg / full
- **Hide on Mobile** toggle

---

## Possible changes

| Change | What to touch |
|---|---|
| Use Next.js `<Image>` for optimisation | Replace `<img>` with `next/image`; add `width`/`height` props or use `fill` layout; ensure public hostname is in `next.config.js`. |
| Add lazy loading | Add `loading="lazy"` to the `<img>`. Already the browser default for below-fold images. |
| Add a hover zoom effect | Add a `hoverZoom` boolean field; apply a CSS transition on the wrapper `<div>`. |
| Add image overlay text | Add an `overlayText` field; render an absolutely positioned `<p>` on top of the image. |
| Support SVG inline rendering | Detect `.svg` URLs and fetch+inject the SVG markup directly. |


---

# VideoBlock.tsx

**Path:** `src/components/page-builder/blocks/video/VideoBlock.tsx`
**Registry key:** `video`

---

## What it does

Embeds a YouTube, Vimeo, or direct MP4 video. Handles URL detection to choose the correct embed strategy.

---

## Data shape

| Field | Type | Default | Description |
|---|---|---|---|
| `url` | `string` | `''` | Video URL. YouTube, Vimeo, or direct `.mp4`. |
| `title` | `string` | `''` | Accessible title for the `<iframe>`. |
| `autoPlay` | `boolean` | `false` | Auto-starts playback on load (muted required for most browsers). |
| `muted` | `boolean` | `false` | Mutes the video. Required for autoplay in modern browsers. |
| `loop` | `boolean` | `false` | Loops the video. |

---

## Preview behaviour

- **YouTube URL** — converts to `https://www.youtube.com/embed/<id>?<params>` and renders an `<iframe>`.
- **Vimeo URL** — converts to `https://player.vimeo.com/video/<id>?<params>` and renders an `<iframe>`.
- **Direct MP4** — renders a `<video>` element with `controls`, optional `autoplay`, `muted`, `loop`.
- **Empty URL** — shows a placeholder with a video icon.
- All embeds are wrapped in a `16:9` aspect ratio container.

---

## Editor controls

- URL input.
- Title input.
- AutoPlay, Muted, Loop toggles.

---

## Possible changes

| Change | What to touch |
|---|---|
| Add a poster image for MP4 | Add a `posterUrl` field; set it on `<video poster={posterUrl}>`. |
| Support Wistia/Loom/other platforms | Add URL-matching cases in the preview's URL-detection logic. |
| Add a play-on-scroll behaviour | Add a `playOnScroll` boolean; use an `IntersectionObserver` in `VideoPreview` to call `video.play()`. |
| Change the default aspect ratio | Replace the `16:9` container with a configurable `aspectRatio` select (already available via `getBaseStyles` if set in the Inspector). |
| Add a thumbnail click-to-play overlay | Fetch the YouTube thumbnail URL; show it as a static image with a play button; replace with the iframe on click. |


---

# ColumnsBlock.tsx

**Path:** `src/components/page-builder/blocks/columns/ColumnsBlock.tsx`
**Registry key:** `columns`

---

## What it does

A feature grid block — renders a configurable number of columns (2–4), each with an emoji icon, a title, and a body text paragraph. Typically used for feature lists, benefits grids, or value propositions.

---

## Data shape

| Field | Type | Default | Description |
|---|---|---|---|
| `columns` | `2 \| 3 \| 4` | `3` | Number of columns in the grid. |
| `gap` | `'sm' \| 'md' \| 'lg'` | `'md'` | Gap between columns. |
| `items` | `ColumnItem[]` | 3 sample items | Array of column entries. |

### `ColumnItem`

| Field | Type | Description |
|---|---|---|
| `id` | `string` | UUID — used as React key. |
| `icon` | `string` | Emoji or text icon (e.g. `'🚀'`). |
| `title` | `string` | Column heading. |
| `body` | `string` | Column paragraph text. |

---

## Default items

Three pre-filled sample items are created on `createDefault()`:
- 🚀 Fast — "Lightning-fast performance out of the box."
- 🔒 Secure — "Enterprise-grade security you can trust."
- 🎨 Beautiful — "Stunning design that converts visitors."

---

## Editor

- Columns count select (2/3/4).
- Gap select.
- List of items with icon, title, and body inputs each.
- Add item button.
- Remove item button per item.
- (Optionally) drag-to-reorder with dnd-kit if implemented.

---

## Preview

Renders a CSS grid with `grid-template-columns: repeat(N, 1fr)`. Each item shows the emoji icon in a styled circle, the title as a heading, and the body as a paragraph.

---

## Possible changes

| Change | What to touch |
|---|---|
| Replace emoji icons with Lucide icons | Change `icon` from a free-text string to a Lucide icon name string; add an icon picker in the editor; render the correct Lucide component in preview. |
| Add a link per column | Add a `url` field to `ColumnItem`; wrap each card in an `<a>`. |
| Add an image per column | Add an `imageUrl` field to `ColumnItem`; render an `<img>` above the title. |
| Add reorder drag-and-drop for items | Wrap the items list in a `SortableContext` from dnd-kit. |
| Add a "card" style variant | Add a `variant: 'plain' \| 'card'` field; in preview, apply a border/shadow/background-color when `variant === 'card'`. |
| Support 1 column (single wide feature) | Allow `columns: 1` in the type and Select options. |


---

# TableBlock.tsx

**Path:** `src/components/page-builder/blocks/table/TableBlock.tsx`
**Registry key:** `table`

---

## What it does

A structured data table with editable headers and rows, optional striped rows, optional cell borders, and an optional caption. Typical use case: specifications, comparison tables, ingredient lists.

---

## Data shape

| Field | Type | Default | Description |
|---|---|---|---|
| `caption` | `string` | `''` | Table caption shown above the table. |
| `headers` | `string[]` | `['Column 1', 'Column 2', 'Column 3']` | Column header labels. |
| `rows` | `string[][]` | 2 empty rows × 3 columns | Two-dimensional array of cell strings (raw text or rich-text HTML). |
| `striped` | `boolean` | `true` | Alternating row background colour. |
| `bordered` | `boolean` | `true` | Shows borders between all cells. |
| `columnConfigs` | `TableColumnConfig[]` | `[]` | Per-column config (index matches `headers`). Each entry: `{ type?: 'text' \| 'rich-text'; fieldKey?: string \| null }`. |

### `TableColumnConfig`

```ts
interface TableColumnConfig {
  type?: 'text' | 'rich-text'; // default: 'text'
  fieldKey?: string | null;     // collection field key; null = use literal cell value
}
```

---

## Editor

- Caption text input.
- Striped and bordered toggles.
- Grid of headers + cells. Each column header has two toggle buttons — **Text** and **Rich** — that switch the column's `type`:
  - **Text** → cells render as plain `<Input>` fields.
  - **Rich** → cells render as a TipTap mini-editor (bold, italic, lists, etc.).
- Add / remove row and column buttons; `columnConfigs` is kept in sync with `headers`.
- Field binding is configured in the **Inspector** panel (template mode only), not inline.

---

## Preview

Renders a `<table>` with `<thead>` from `headers` and `<tbody>` rows. Each cell is rendered by `BoundCell`, which:

1. Resolves the cell value via `useBoundValue` if `columnConfigs[ci].fieldKey` is set:
   - Checks `RepeaterEntryContext` first.
   - Then `MockCollectionEntryContext`.
   - Then `CollectionItemContext` (live detail page).
   - Falls back to the literal cell string if none resolve.
2. Renders via `dangerouslySetInnerHTML` when the column type is `rich-text` (or the resolved string starts with `<`).
3. Otherwise renders as plain text.

Striped / bordered styles are applied as before.

---

## Inspector (template mode)

`TableBindingSection` in `Inspector.tsx` is shown when `effectiveMode === 'template'`:

- Optional manual collection picker when no template collection is detected.
- One **field picker dropdown** per column, labelled with the column header.
- Allowed field types per column:
  - `rich-text` column → `rich-text`, `textarea`.
  - `text` column → `text`, `number`, `email`, `textarea`, `select`, `url`, `slug`.
- Selecting a field sets `columnConfigs[i].fieldKey`; selecting "— None (use literal) —" clears it.

---

## Possible changes

| Change | What to touch |
|---|---|
| Add column sorting | Add a `sortable` boolean; in preview add click handlers on `<th>` to sort `rows` by that column. |
| Add a "first column as header" option | Add a `rowHeaders` boolean; render `<th scope="row">` for the first cell of each row. |
| Support column width ratios | Add a `colWidths: string[]` array (e.g. `['40%', '40%', '20%']`); apply via `<colgroup>`. |
| Per-cell type override | Change `columnConfigs` to a per-cell 2D config; complex UX — column-level type is usually enough. |


---

# CtaBlock.tsx

**Path:** `src/components/page-builder/blocks/cta/CtaBlock.tsx`
**Registry key:** `cta`

---

## What it does

A call-to-action section with a headline, body paragraph, a primary button, and an optional secondary button. Designed to sit between content sections to prompt user action.

---

## Data shape

| Field | Type | Default | Description |
|---|---|---|---|
| `headline` | `string` | `'Ready to get started?'` | Main CTA heading. |
| `body` | `string` | `'Join thousands of teams already using our platform.'` | Supporting paragraph. |
| `primaryLabel` | `string` | `'Get Started Free'` | Primary button label. |
| `primaryUrl` | `string` | `'#'` | Primary button URL. |
| `secondaryLabel` | `string` | `'Talk to Sales'` | Secondary button label. Empty = hidden. |
| `secondaryUrl` | `string` | `'#contact'` | Secondary button URL. |

---

## Editor

- Headline and body text inputs.
- Primary button: label + URL inputs.
- Secondary button: label + URL inputs. If the label is blank, the secondary button is not rendered in preview.

---

## Preview

- Centered layout with headline, body, then buttons side by side.
- Primary button: filled/brand style.
- Secondary button: outline or ghost style (if `secondaryLabel` is non-empty).

---

## Possible changes

| Change | What to touch |
|---|---|
| Add a third button | Add `tertiaryLabel` + `tertiaryUrl` fields and a third button in preview. |
| Add icon support for buttons | Add an `iconLeft / iconRight` field per button; resolve the Lucide icon in preview. |
| Add an image or illustration beside the CTA | Add an `imageUrl` field; change the layout to a two-column flex/grid in preview. |
| Add button `openInNewTab` option | Add `primaryNewTab: boolean` and `secondaryNewTab: boolean`; set `target="_blank"` accordingly. |
| Add a variant (light/dark/colour) | Add a `variant` select; the background preset in the Inspector already handles colour, but a dedicated variant could control typography colour automatically. |


---

# FormBlock.tsx

**Path:** `src/components/page-builder/blocks/form/FormBlock.tsx`
**Registry key:** `form`

---

## What it does

A dynamic form block linked to a CMS collection. It fetches the collection's field schema, renders a form input for each field (respecting field types), and on submission posts the entry to `POST /api/entries/create`.

---

## Data shape

| Field | Type | Default | Description |
|---|---|---|---|
| `collectionId` | `string` | `''` | The collection this form writes entries to. |
| `submitLabel` | `string` | `'Submit'` | Text on the submit button. |
| `successMessage` | `string` | `"Thank you! We'll be in touch."` | Shown after successful submission. |

---

## Editor

- Collection picker dropdown (fetches `GET /api/collections`).
- Submit label input.
- Success message input.
- A live preview of the inferred form fields is shown in the editor card.

---

## Preview behaviour

1. On mount, fetches `GET /api/collections/:collectionId` to get the field schema.
2. Renders one form control per field, respecting the field's `type`:
   - `text`, `email`, `number` → `<input type="…">`
   - `textarea`, `rich-text` → `<textarea>`
   - `date` → `<input type="date">`
   - `image` → file upload input (or URL input)
3. On submit, posts `{ collectionId, data: formValues }` to `POST /api/entries/create`.
4. On success, replaces the form with `successMessage`.
5. On error, shows an error banner.

---

## Possible changes

| Change | What to touch |
|---|---|
| Add field-level validation | Add `required`, `minLength`, `maxLength`, `pattern` to `CollectionField`; enforce in the preview form before submit. |
| Add reCAPTCHA | Add a reCAPTCHA widget before the submit button; include the token in the POST body. |
| Add a `redirectUrl` field | Redirect to a thank-you page instead of showing the inline success message. |
| Add multi-step form support | Split `fields` into pages; add navigation state in `FormPreview`. |
| Add a file upload field type | Handle `type === 'file'`; upload to Vercel Blob and store the URL in the entry data. |
| Customise field labels / order | Add reorderable fields inside the Editor that override the collection's schema order. |


---

# SpacerBlock.tsx

**Path:** `src/components/page-builder/blocks/spacer/SpacerBlock.tsx`
**Registry key:** `spacer`

---

## What it does

A simple vertical whitespace block with an optional horizontal divider line. Used to control spacing between sections or to visually separate content areas.

---

## Data shape

| Field | Type | Default | Description |
|---|---|---|---|
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Height of the spacer (8/16/32/64/96px). |
| `showDivider` | `boolean` | `false` | Renders a horizontal `<hr>` in the vertical centre. |
| `dividerStyle` | `'solid' \| 'dashed' \| 'dotted'` | `'solid'` | CSS border style of the divider. |
| `dividerColor` | `string` | `''` | Free-text colour for the divider. Defaults to `currentColor` at 20% opacity when blank. |

---

## Inspector controls

Handled by `SpacerSection` in `Inspector.tsx` (not in the block's own Editor component, since spacer has no inline text content to edit):

- Size select: xs (8px) / sm (16px) / md (32px) / lg (64px) / xl (96px).
- Show Divider toggle.
- Divider Color input with live colour swatch (visible when divider is on).
- Divider Style select (visible when divider is on).

---

## Legacy `height` field

The `SpacerSection` reads `data.size ?? data.height` to stay backward-compatible with older saved blocks that used a `height` key. New blocks always write `size`.

---

## Preview

Renders a `<div>` with a fixed height (pixel values from the size map) and, when `showDivider` is true, a centered `<hr>` with the selected border style and colour.

---

## Possible changes

| Change | What to touch |
|---|---|
| Add more size options (e.g. 2xl at 128px) | Add `2xl` to the `size` type, to `SpacerSection`'s Select items, and to the size map in `SpacerPreview`. |
| Add left/right margin collapse (only vertical) | The block already has no horizontal content; this is the default. |
| Add a label on the divider (section separator label) | Add a `dividerLabel` string field; render it as an absolutely positioned `<span>` centred on the `<hr>`. |
| Remove the legacy `height` fallback | Once all saved pages have been migrated to `size`, remove the `?? data.height` fallback in `SpacerSection`. |


---

# CollectionListBlock.tsx

**Path:** `src/components/page-builder/blocks/collection-list/CollectionListBlock.tsx`
**Registry key:** `collection-list`

---

## What it does

Fetches published entries from a chosen CMS collection and displays them as a card grid or list. Each card shows the fields selected by the editor (image, title, other display fields). Cards link to the collection item's detail page.

---

## Data shape

| Field | Type | Default | Description |
|---|---|---|---|
| `collectionId` | `string` | `''` | The collection to list. |
| `displayFields` | `string[]` | `[]` | Field keys to show on each card (beyond image/title). |
| `layout` | `'grid-2' \| 'grid-3' \| 'grid-4' \| 'list'` | `'grid-3'` | Display layout. |
| `limit` | `number` | `12` | Maximum number of entries to show. |
| `imageField` | `string` | `''` | Field key for the card thumbnail. |
| `titleField` | `string` | `''` | Field key for the card title. |

---

## Editor

- Collection picker (fetches all collections from `GET /api/collections`).
- Image field and title field dropdowns (populated from the chosen collection's fields).
- Display fields multi-select (additional fields to show).
- Layout select.
- Limit input.

---

## Preview behaviour

1. Fetches `GET /api/entries?collectionId=<id>&limit=<n>` on mount.
2. Renders cards in the selected layout (CSS grid or list).
3. Each card: thumbnail image (from `imageField`), title (from `titleField`), additional field values (from `displayFields`), link to `/collections/<collection.slug>/<entry.slug>`.
4. Empty state: shows a placeholder when no entries are found.

---

## Possible changes

| Change | What to touch |
|---|---|
| Add a "load more" / pagination | Add `page` state; fetch subsequent pages on button click. |
| Add filtering by a field value | Add `filterField` + `filterValue` to the data; pass as query params. |
| Add a search input | Add a `searchable` boolean; render a text input above the grid; filter client-side or add `?search=` to the API call. |
| Add a "view all" link | Add a `viewAllLabel` + `viewAllUrl` field; render a link below the grid. |
| Add sorting | Add `sortField` + `sortDir` fields; pass to the API. |
| Support a masonry layout | Add `'masonry'` to the `layout` type; use CSS `column-count` in preview. |


---

# NewsletterBlock.tsx

**Path:** `src/components/page-builder/blocks/newsletter/NewsletterBlock.tsx`
**Registry key:** `newsletter`

---

## What it does

An email subscription section with a heading, body paragraph, an email input + subscribe button, and an optional side image. Styled in brand red by default.

---

## Data shape

| Field | Type | Default | Description |
|---|---|---|---|
| `heading` | `string` | `'Newsletter'` | Section heading. |
| `body` | `string` | `'Restez informé sur les dernières nouveautés de Maghreb Adriatica!'` | Supporting paragraph. |
| `buttonLabel` | `string` | `"S'inscrire"` | Subscribe button label. |
| `imageUrl` | `string` | `''` | Optional side image URL. |
| `sectionBg` | `string` | `'brand-red'` | Background preset token. |
| `paddingTop` | `'none'` | `'none'` | Suppressed — the block manages its own layout. |
| `paddingBottom` | `'none'` | `'none'` | Same. |

---

## Editor

- Heading and body text inputs.
- Button label input.
- Image URL input (or AssetPicker).
- Background colour select.

---

## Preview behaviour

- Renders a horizontal two-column layout (text + image) or single column when no image is set.
- The email input is decorative in preview (does not actually submit — wiring to a service is a separate step).
- Background colour resolves via the `sectionBg` token against the same `BACKGROUND_STYLE` map used by `renderPreview.tsx`.

---

## Possible changes

| Change | What to touch |
|---|---|
| Wire up the email subscription | Add a server action / API route (e.g. `POST /api/newsletter`); call it from the subscribe form handler in preview. |
| Add double opt-in | Integrate with an email marketing API (Mailchimp, Resend, Brevo); add a confirmation page. |
| Add a "privacy policy" checkbox | Add a `requireConsent: boolean` field; render a checkbox in the email form; block submission until checked. |
| Add localisation for default text | Swap the hardcoded French defaults for locale-aware defaults using `common.json`. |
| Add success/error states | After subscribe, show a success message or error banner based on the API response. |


---

# ContactFormBlock.tsx

**Path:** `src/components/page-builder/blocks/contact-form/ContactFormBlock.tsx`
**Registry key:** `contact-form`

---

## What it does

A full-width contact section with a heading, body paragraph, a side image, and a contact form. Includes info cards (email, phone, location) alongside the form. This is the "full" variant — see `ContactFormSimpleBlock` for the version without info cards.

---

## Data shape

| Field | Type | Default | Description |
|---|---|---|---|
| `heading` | `string` | `'Nous contacter'` | Section heading. |
| `body` | `string` | `'Notre équipe serait ravie de vous entendre.'` | Supporting paragraph. |
| `imageUrl` | `string` | `''` | Optional side image URL. |
| `paddingTop` | `'none'` | `'none'` | Suppressed — block manages its own layout. |
| `paddingBottom` | `'none'` | `'none'` | Same. |

---

## Editor

- Heading and body text inputs.
- Image URL input / AssetPicker.

---

## Preview

- Two-column layout: left = content/image, right = form.
- Info cards (below the text): email icon + address, phone icon + number, location icon + address.
- Contact form with name, email, message fields; submit button.
- The info card details (email, phone, address) are likely hardcoded or pulled from `common.json` — not block-level fields.

---

## Possible changes

| Change | What to touch |
|---|---|
| Make the contact details editable | Add `contactEmail`, `contactPhone`, `contactAddress` fields to the data; wire them into the preview's info cards. |
| Add form submission wiring | Add a `POST /api/contact` route that sends an email (via Resend/Nodemailer) or saves to a collection. |
| Add a success / error state | Manage `formState: 'idle' | 'success' | 'error'` in the preview and show appropriate UI. |
| Allow the info cards to be toggled off | Add a `showInfoCards: boolean` field. |
| Support a single-column layout | Add a `layout: 'two-col' | 'one-col'` field and adjust the preview grid. |


---

# ContactFormSimpleBlock.tsx

**Path:** `src/components/page-builder/blocks/contact-form-simple/ContactFormSimpleBlock.tsx`
**Registry key:** `contact-form-simple`

---

## What it does

A simplified contact section — same layout as `ContactFormBlock` (heading, body, side image, form) but without the email/phone/address info cards. Used when you want a cleaner, less cluttered contact form.

---

## Data shape

Identical to `ContactFormBlock`:

| Field | Type | Default | Description |
|---|---|---|---|
| `heading` | `string` | `'Nous contacter'` | Section heading. |
| `body` | `string` | `'Notre équipe serait ravie de vous entendre.'` | Supporting paragraph. |
| `imageUrl` | `string` | `''` | Optional side image URL. |
| `paddingTop` | `'none'` | `'none'` | Suppressed. |
| `paddingBottom` | `'none'` | `'none'` | Suppressed. |

---

## Relationship to `ContactFormBlock`

These two blocks share the same data shape. They differ only in the Preview component:
- `ContactFormBlock` renders info cards (email, phone, location) below the heading.
- `ContactFormSimpleBlock` omits the info cards entirely.

If both blocks need the same new field, add it to both.

---

## Possible changes

| Change | What to touch |
|---|---|
| Merge the two contact form blocks | Add a `showInfoCards: boolean` field to one of them and delete the other. Update the registry to remove the duplicate. |
| Add form field customisation | Add a `fields: { name, label, type, required }[]` array; render dynamic inputs in the preview. |
| Wire up submission | Same as `ContactFormBlock` — add a `POST /api/contact` route. |
| Add a `subject` field | Add `subject: string`; include it in the email sent on submit. |


---

# BoundTextBlock.tsx

**Path:** `src/components/page-builder/blocks/bound/BoundTextBlock.tsx`
**Registry key:** `bound-text`

---

## What it does

Displays a single text, number, email, or textarea field from the current collection entry. Used inside Repeater card templates or on collection detail page templates to show a dynamic field value as styled text.

---

## Data shape

| Field | Type | Default | Description |
|---|---|---|---|
| `fieldKey` | `string \| null` | `null` | The field key to display (set via the Inspector's Field Binding section). |
| `fontSize` | size token | — | Font size (from Inspector Typography section). |
| `fontWeight` | weight token | — | Font weight. |
| `textColor` | `string` | — | Free-text colour. |
| `textTransform` | `'none' \| 'uppercase' \| 'lowercase' \| 'capitalize'` | `'none'` | Text transform. |
| `as` | `'p' \| 'h1' \| 'h2' \| 'h3' \| 'h4' \| 'span'` | `'p'` | HTML element to render the text as. |

---

## Context priority

The Preview reads entry data in this order:
1. `useRepeaterEntry()` — entry data provided by `RepeaterEntryContext` when inside a Repeater.
2. `useMockCollectionEntry()` — mock entry data from `MockCollectionEntryContext` when in template editor mode.
3. `GET /api/entries/<id>` — live API call when on the public detail page.

If `fieldKey` is null or the field has no value, renders nothing (or a placeholder in the editor).

---

## Inspector controls

Handled by `BoundTextTypographySection` + `FieldBindingSection` in `Inspector.tsx`:
- **Font Size** — xs / sm / base / lg / xl / 2xl / 3xl / 4xl
- **Font Weight** — normal / medium / semibold / bold
- **Color** — free-text
- **Text Transform** — none / uppercase / lowercase / capitalize
- **Render As** — p / h1 / h2 / h3 / h4 / span
- **Bound Field** — dropdown of compatible fields (text, number, email, textarea) from the template's collection.

---

## Accepted field types

```ts
BOUND_FIELD_TYPES['bound-text'] = ['text', 'number', 'email', 'textarea']
```

---

## Preview

Renders `<{as} style={...}>{entry.data[fieldKey]}</{as}>`. Inline styles from the typography fields are applied. Empty / null values render nothing.

---

## Possible changes

| Change | What to touch |
|---|---|
| Add a `fallback` field | When `entry.data[fieldKey]` is empty, render `data.fallback` instead of nothing. |
| Add a prefix / suffix field | Add `prefix: string` + `suffix: string` fields; render them before/after the value. |
| Support `select` field type | Add `'select'` to the accepted types in `BOUND_FIELD_TYPES`. |
| Add line clamping | Add a `lineClamp: number` field; apply `-webkit-line-clamp` in the inline style. |
| Add a link wrapper | Add a `linkFieldKey` field; when set, wrap the text in an `<a>` whose href is the value of that field. |


---

# BoundImageBlock.tsx

**Path:** `src/components/page-builder/blocks/bound/BoundImageBlock.tsx`
**Registry key:** `bound-image`

---

## What it does

Displays an image field from the current collection entry. Used in Repeater card templates or collection detail templates for thumbnails, hero images, or product photos.

---

## Data shape

| Field | Type | Default | Description |
|---|---|---|---|
| `fieldKey` | `string \| null` | `null` | Image field key from the collection (set via Inspector). |
| `aspectRatio` | aspect ratio token | `'auto'` | Constrains the image container's aspect ratio. |
| `objectFit` | `'cover' \| 'contain' \| 'fill'` | `'cover'` | CSS `object-fit` for the image element. |
| `width` | `'full' \| 'half' \| 'third' \| 'auto'` | `'full'` | Width of the image container. |
| `borderRadius` | radius token | `'none'` | Border radius. |
| `hideOnMobile` | `boolean` | `false` | Hides on mobile viewports. |

---

## Context priority

Same as `BoundTextBlock`:
1. `useRepeaterEntry()` — from `RepeaterEntryContext` when inside a Repeater.
2. `useMockCollectionEntry()` — from `MockCollectionEntryContext` in template editor mode.
3. API call on the live public page.

If `fieldKey` is null or the field has no value, renders an image placeholder box.

---

## Inspector controls

Handled by `ImageSizingSection` + `FieldBindingSection` in `Inspector.tsx`:
- **Aspect Ratio** — auto / 1:1 / 4:3 / 16:9 / 3:4
- **Object Fit** — cover / contain / fill
- **Width** — full / half / third / auto
- **Border Radius** — none / sm / md / lg / full
- **Hide on Mobile** toggle
- **Bound Field** — dropdown filtered to `image` field type only.

---

## Accepted field types

```ts
BOUND_FIELD_TYPES['bound-image'] = ['image']
```

---

## Possible changes

| Change | What to touch |
|---|---|
| Use Next.js `<Image>` for optimisation | Replace `<img>` with `next/image`; requires knowing width/height or using `fill` mode. |
| Add an alt text field binding | Add `altFieldKey` to bind the alt text to a `text` field; fall back to a static `alt` string. |
| Add a click-to-enlarge lightbox | Add an `enlargeable: boolean` field; wrap the image in a trigger that opens a Radix Dialog with a full-size version. |
| Add lazy loading | Add `loading="lazy"` to the `<img>` (browser default for off-screen images). |
| Support a fallback image URL | Add `fallbackUrl: string`; render it when `entry.data[fieldKey]` is empty or fails to load. |


---

# BoundRichTextBlock.tsx

**Path:** `src/components/page-builder/blocks/bound/BoundRichTextBlock.tsx`
**Registry key:** `bound-rich-text`

---

## What it does

Renders a rich-text field from the current collection entry as formatted HTML. The stored field value is raw TipTap HTML; this block outputs it with the same prose styles used by `RichTextBlock`.

---

## Data shape

| Field | Type | Default | Description |
|---|---|---|---|
| `fieldKey` | `string \| null` | `null` | Rich-text field key from the collection (set via Inspector). |
| `fontSize` | size token | — | Font size override (from Inspector). |
| `fontWeight` | weight token | — | Font weight override. |
| `textColor` | `string` | — | Free-text colour override. |
| `textTransform` | transform token | `'none'` | Text transform override. |

Note: **No `as` (render as) selector** — rich text always renders as a prose `<div>`, not a single element.

---

## Context priority

Same as all bound blocks:
1. `useRepeaterEntry()` — Repeater context.
2. `useMockCollectionEntry()` — template editor mock.
3. API call on the live page.

If `fieldKey` is null or no value, renders nothing / placeholder.

---

## Inspector controls

`BoundTextTypographySection` (with `includeAs={false}`) + `FieldBindingSection`:
- **Font Size**, **Font Weight**, **Color**, **Text Transform**
- **Bound Field** — dropdown filtered to `rich-text` only.

---

## Accepted field types

```ts
BOUND_FIELD_TYPES['bound-rich-text'] = ['rich-text']
```

---

## Preview

Renders `<div dangerouslySetInnerHTML={{ __html: entry.data[fieldKey] }}` with prose class names from `proseClasses.ts`. Typography overrides from the Inspector are applied as inline styles on the wrapper div.

---

## Possible changes

| Change | What to touch |
|---|---|
| Add `textarea` to accepted types | Add `'textarea'` to `BOUND_FIELD_TYPES['bound-rich-text']`; in the preview, detect plain text and wrap it in `<p>` tags before rendering. |
| Sanitize the HTML output | Pipe the stored HTML through DOMPurify before `dangerouslySetInnerHTML` to prevent XSS from malformed saved content. |
| Add a `maxLines` / line clamp | Add `maxLines: number`; apply `overflow: hidden; display: -webkit-box; -webkit-line-clamp: N` to the wrapper. |


---

# BoundDateBlock.tsx

**Path:** `src/components/page-builder/blocks/bound/BoundDateBlock.tsx`
**Registry key:** `bound-date`

---

## What it does

Displays a date field from the current collection entry, formatted as a human-readable string. Handles locale-aware formatting.

---

## Data shape

| Field | Type | Default | Description |
|---|---|---|---|
| `fieldKey` | `string \| null` | `null` | Date field key from the collection. |
| `dateFormat` | `string` | `'long'` | Format preset or custom `Intl.DateTimeFormat` options key. |
| `locale` | `string` | — | Locale string for `Intl.DateTimeFormat` (e.g. `'fr-FR'`). Falls back to the page locale. |

---

## Context priority

Same as all bound blocks:
1. `useRepeaterEntry()` — Repeater context.
2. `useMockCollectionEntry()` — template editor mock.
3. API call on the live page.

---

## Inspector controls

`FieldBindingSection` in `Inspector.tsx`:
- **Bound Field** — dropdown filtered to `date` only.

---

## Accepted field types

```ts
BOUND_FIELD_TYPES['bound-date'] = ['date']
```

---

## Preview

Parses `entry.data[fieldKey]` as an ISO date string and formats it with `Intl.DateTimeFormat`. Empty / null values render nothing or a placeholder.

---

## Possible changes

| Change | What to touch |
|---|---|
| Add format options to the Inspector | Add a `dateFormat` Select (short / medium / long / full / custom); expose it in `BoundDateTypographySection` or a dedicated section. |
| Add relative time ("3 days ago") | Add a `relative: boolean` field; use `Intl.RelativeTimeFormat` or a library like `date-fns/formatDistance` when true. |
| Add time display | Add `showTime: boolean`; include `hour`, `minute` in the `Intl.DateTimeFormat` options. |
| Add typography controls | Add `BoundTextTypographySection` to the Inspector for this block (currently absent — the block only has field binding). |


---

# CollectionItemFieldsBlock.tsx

**Path:** `src/components/page-builder/blocks/collection-item-fields/CollectionItemFieldsBlock.tsx`
**Registry key:** `collection-item-fields`

---

## What it does

Renders **all** of a collection entry's field values in a single auto-generated block. Useful on detail page templates as a "dump all data" block — no per-field configuration required. Fields can be selectively hidden via `hiddenFields`.

---

## Data shape

| Field | Type | Default | Description |
|---|---|---|---|
| `hiddenFields` | `string[]` | `[]` | Field keys to exclude from the output. |

---

## Editor

- A checklist of the collection's fields (fetched from the template's collection context).
- Checking a field adds it to `hiddenFields`, hiding it in preview.

---

## Preview behaviour

1. Reads the entry from context (Repeater → MockCollectionEntry → live API).
2. Fetches the collection's field schema to get field labels and types.
3. For each field not in `hiddenFields`, renders the field label + formatted value:
   - `text`, `email`, `number`, `textarea` → plain text or `<pre>`.
   - `rich-text` → `dangerouslySetInnerHTML`.
   - `date` → formatted date string.
   - `image` → `<img>`.
   - `select` → raw value string.

---

## Use case

On collection detail page templates, this block lets you get a working detail page immediately with zero field binding work. Replace individual fields with `BoundText` / `BoundImage` blocks as the design matures.

---

## Possible changes

| Change | What to touch |
|---|---|
| Add field ordering | Replace `hiddenFields: string[]` with `fieldOrder: string[]`; render in that order. |
| Add per-field label override | Add `fieldLabels: Record<string, string>`; use the override label when present. |
| Add a key-value table layout | Add a `layout: 'list' \| 'table'` field; in preview, render as a `<table>` when `table`. |
| Add per-field style overrides | Very complex — better to replace this block with individual bound blocks for fine-grained control. |


---

# ProductHeroBlock.tsx

**Path:** `src/components/page-builder/blocks/product-hero/ProductHeroBlock.tsx`
**Registry key:** `product-hero`
**Category:** Composite

---

## What it does

A two-column product showcase section — one column for text content (title, subtitles, body, CTA button) and one for an image. The image can be positioned left or right. All five text/image fields can be statically set or bound to collection fields in template mode.

---

## Data shape

| Field | Type | Default | Description |
|---|---|---|---|
| `title` | `string` | `''` | Main product title. |
| `subtitle1` | `string` | `''` | Small label above the title. |
| `subtitle2` | `string` | `''` | Second subtitle / tagline. |
| `body` | `string` | `''` | Description paragraph. |
| `ctaLabel` | `string` | `''` | CTA button label. |
| `ctaUrl` | `string` | `''` | CTA button URL. |
| `image` | `string` | `''` | Product image URL. |
| `imagePosition` | `'left' \| 'right'` | `'right'` | Side the image appears on. |
| `backgroundColor` | `string` | `''` | Free-text background colour of the section. |
| `paddingTop` | `'lg'` | `'lg'` | Default outer padding (can be overridden in Inspector). |
| `paddingBottom` | `'lg'` | `'lg'` | Same. |

### Composite binding fields (template mode only)

| Field | Description |
|---|---|
| `titleFieldKey` | Binds `title` to a `text` collection field. |
| `subtitle1FieldKey` | Binds `subtitle1` to a `text` field. |
| `subtitle2FieldKey` | Binds `subtitle2` to a `text` field. |
| `bodyFieldKey` | Binds `body` to a `textarea` or `rich-text` field. |
| `imageFieldKey` | Binds `image` to an `image` field. |

When a `*FieldKey` is non-null, the bound value replaces the static literal at render time.

---

## Editor

- Title, subtitle1, subtitle2 text inputs.
- Body textarea.
- CTA label + URL inputs.
- Image URL + AssetPicker.
- Image position toggle (left/right).
- Background colour input.

---

## Preview

- Two-column flex layout (row-reverse when `imagePosition === 'left'`).
- Left/right column: text content with CTA button.
- Other column: `<img>` (or a placeholder if empty).
- Bound fields resolve from entry context when `*FieldKey` is set.

---

## Inspector controls

In **template mode**, the `CompositeBindingSection` renders a dropdown for each of the five bindable props, showing only compatible field types from the collection.

---

## Possible changes

| Change | What to touch |
|---|---|
| Add a second CTA button | Add `ctaSecondaryLabel` + `ctaSecondaryUrl`; render a secondary button below the primary. |
| Add a bullet list | Add `bullets: string[]` field; render a `<ul>` below the body. |
| Support video in the media column | Add `videoUrl` field; when set, render a `<video>` or iframe instead of `<img>`. |
| Add a `badge` label | Add `badge: string`; render it as a coloured pill above `subtitle1`. |
| Add mobile image position override | Add `mobileImagePosition: 'top' \| 'bottom'`; apply with a container query. |


---

# SectionHeadingBlock.tsx

**Path:** `src/components/page-builder/blocks/section-heading/SectionHeadingBlock.tsx`
**Registry key:** `section-heading`

---

## What it does

A heading + optional subheading block with an optional decorative divider line below. Designed to open content sections. Both the heading and subheading can be bound to collection fields in template mode.

---

## Data shape

| Field | Type | Default | Description |
|---|---|---|---|
| `heading` | `string` | `''` | Main heading text. |
| `subheading` | `string` | `''` | Supporting subheading. Empty = hidden. |
| `align` | `'left' \| 'center' \| 'right'` | `'left'` | Text alignment. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Heading font-size scale. |
| `showDivider` | `boolean` | `false` | Renders a decorative line below the heading. |
| `dividerColor` | `string` | `''` | Free-text divider colour. |
| `paddingTop` | `'sm'` | `'sm'` | Default outer padding (smaller than most blocks). |
| `paddingBottom` | `'sm'` | `'sm'` | Same. |

### Composite binding fields (template mode)

| Field | Description |
|---|---|
| `headingFieldKey` | Binds `heading` to a `text` field. |
| `subheadingFieldKey` | Binds `subheading` to a `text` or `textarea` field. |

---

## Editor

- Heading text input.
- Subheading text input.
- Alignment select.
- Size select.
- Show Divider toggle.
- Divider colour input (visible when divider is on).

---

## Preview

- `<h2>` or size-scaled heading element for the heading.
- `<p>` for the subheading when non-empty.
- `<hr>` below the heading when `showDivider` is true.
- Text alignment applied to the wrapper.

---

## Possible changes

| Change | What to touch |
|---|---|
| Add a heading level selector (h1/h2/h3) | Add `headingLevel: 'h1' \| 'h2' \| 'h3'` field; use it as the HTML tag. |
| Add an eyebrow label above the heading | Add `eyebrow: string`; render as a small uppercase label above the `<h2>`. |
| Add `eyebrowFieldKey` for template binding | Add it to `COMPOSITE_BINDINGS['section-heading']` in `Inspector.tsx`. |
| Add a coloured accent bar instead of `<hr>` | Replace the `<hr>` with a `<div>` of fixed width/height and brand colour when `showDivider` is on. |


---

# KeyValueListBlock.tsx

**Path:** `src/components/page-builder/blocks/key-value-list/KeyValueListBlock.tsx`
**Registry key:** `key-value-list`

---

## What it does

A label/value row list — similar to a single-column key-value table. Used for product specifications, composition details, technical parameters, and similar structured data. Supports striped rows and optional dividers between rows.

---

## Data shape

| Field | Type | Default | Description |
|---|---|---|---|
| `heading` | `string` | `''` | Optional section heading above the list. |
| `items` | `KeyValueItem[]` | 3 empty items | Array of label/value rows. |
| `striped` | `boolean` | `true` | Alternating row background. |
| `showDividers` | `boolean` | `true` | Horizontal lines between rows. |
| `layout` | `'two-col' \| 'stacked'` | `'two-col'` | Two-column (label left, value right) or stacked (label above value). |

### `KeyValueItem`

| Field | Type | Description |
|---|---|---|
| `id` | `string` | UUID React key. |
| `label` | `string` | Row label / key. |
| `value` | `string` | Row value. |

---

## Default items

Three empty rows are created on `createDefault()`.

---

## Editor

- Optional heading input.
- Striped toggle.
- Show dividers toggle.
- Layout select (two-col / stacked).
- Per-item label + value inputs with add/remove buttons.
- Optional drag-to-reorder (if dnd-kit is implemented for items).

---

## Preview

- Optional `<h3>` heading.
- List of rows, each with a `label` cell and a `value` cell.
- Striped rows via alternating background colour.
- Dividers via `border-bottom` when `showDividers` is true.
- Two-column layout: `display: flex` or `display: grid` with two columns.
- Stacked layout: `display: block` with label above value.

---

## Possible changes

| Change | What to touch |
|---|---|
| Add drag-to-reorder for items | Wrap the items list in a dnd-kit `SortableContext`. |
| Add rich text values | Change `value: string` to `value: { type: 'text' \| 'html', content: string }`; render HTML via `dangerouslySetInnerHTML` when `type === 'html'`. |
| Add a unit column | Add `unit: string` to `KeyValueItem`; render a third cell for the unit (already common in the default French headers of `TableBlock`). |
| Add a copy-to-clipboard button per row | Add a copy icon button next to each value in preview. |
| Bind items to collection fields | This would require a fundamentally different approach — use `BoundText` blocks inside a `Container` for per-field binding instead. |


---

# DownloadButtonBlock.tsx

**Path:** `src/components/page-builder/blocks/download-button/DownloadButtonBlock.tsx`
**Registry key:** `download-button`

---

## What it does

A styled CTA button that triggers a file download. Typically used for PDFs, spec sheets, or technical documents. The file URL can be static or bound to a collection field in template mode.

---

## Data shape

| Field | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | `'Download'` | Button label text. |
| `url` | `string` | `''` | File URL. Used when `urlFieldKey` is null. |
| `icon` | `'download' \| 'file' \| 'none'` | `'download'` | Icon displayed on the button. |
| `variant` | `'primary' \| 'outline' \| 'ghost'` | `'primary'` | Button visual style. |
| `align` | `'left' \| 'center' \| 'right'` | `'left'` | Button alignment within the section. |
| `openInNewTab` | `boolean` | `true` | Opens the download in a new browser tab. |
| `urlFieldKey` | `string \| null` | `null` | Binds the URL to a `text` or `image` collection field (template mode). |

---

## Editor

- Label input.
- URL input / AssetPicker.
- Icon select.
- Variant select.
- Alignment select.
- Open in new tab toggle.

---

## Preview

Renders an `<a href={url} download target={openInNewTab ? '_blank' : '_self'}>` styled as a button. The `download` attribute triggers the browser's download behaviour. When `urlFieldKey` is set, the URL is resolved from the entry context.

---

## Composite binding (template mode)

`COMPOSITE_BINDINGS['download-button']`:
- `urlFieldKey` — allowed types: `text`, `image` (since blob URLs from image fields are valid download targets).

---

## Possible changes

| Change | What to touch |
|---|---|
| Add a `filename` override | Add `filename: string`; set it as the `download="<filename>"` attribute on the `<a>`. |
| Add a file size indicator | Add `fileSize: string` (e.g. `'2.4 MB'`); render it as small text beside the button. |
| Add file type icon auto-detection | Detect `.pdf`, `.zip`, `.xls` extensions from the URL; show a matching icon automatically regardless of the `icon` field. |
| Add a progress indicator during download | Intercept the click with a `fetch()` + `Blob` approach to track download progress. |
| Add a `labelFieldKey` binding | Add `labelFieldKey` to `COMPOSITE_BINDINGS['download-button']` to bind the button label to a collection field. |


---

# ButtonBlock.tsx

**Path:** `src/components/page-builder/blocks/button/ButtonBlock.tsx`
**Registry key:** `button`

---

## What it does

A standalone CTA button — simpler than `DownloadButtonBlock` (no download behaviour) and simpler than `CtaBlock` (no headline or body text). Use this when you need a single navigation or action button as its own block.

---

## Data shape

| Field | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | `'Click here'` | Button label text. |
| `url` | `string` | `''` | Destination URL. |
| `variant` | `'primary' \| 'outline' \| 'ghost'` | `'primary'` | Visual style. |
| `icon` | `'none' \| 'arrow-right' \| 'external'` | `'none'` | Optional icon shown beside the label. |
| `align` | `'left' \| 'center' \| 'right'` | `'left'` | Button alignment within the section. |
| `openInNewTab` | `boolean` | `false` | Opens in a new tab when true. |

---

## Editor

- Label input.
- URL input.
- Variant select (primary / outline / ghost).
- Icon select (none / arrow-right / external).
- Alignment select.
- Open in new tab toggle.

---

## Preview

Renders `<a href={url} target={openInNewTab ? '_blank' : '_self'}>` styled as a button with the chosen variant. The icon (if selected) appears inline on the right side of the label.

---

## Possible changes

| Change | What to touch |
|---|---|
| Add a `size` field (sm / md / lg) | Add `size` to the data; apply a font-size / padding scale in preview. |
| Add an icon-left position option | Change `icon` to `{ name: string, position: 'left' \| 'right' }`; render accordingly. |
| Add a `disabled` state | Add `disabled: boolean`; render `<button disabled>` or an `<a>` with `pointer-events: none`. |
| Add a loading state on click | Add a client-side `loading` state; show a spinner while an async action runs. |
| Bind the label/URL to a collection field | Add `labelFieldKey` + `urlFieldKey` to the data and to `COMPOSITE_BINDINGS` in `Inspector.tsx`. |


---

# CatalogueBlock.tsx

**Path:** `src/components/page-builder/blocks/catalogue/CatalogueBlock.tsx`
**Registry key:** `catalogue`

---

## What it does

A full-width branded section (red background by default) with a heading, a catalogue image, and a download button. Designed specifically for the Adriatica brand catalogue download CTA.

---

## Data shape

| Field | Type | Default | Description |
|---|---|---|---|
| `heading` | `string` | `'Téléchargez notre catalogue'` | Section heading. |
| `ctaLabel` | `string` | `'Télécharger le catalogue'` | Download button label. |
| `imageUrl` | `string` | `''` | Catalogue cover image URL. |
| `imageAlt` | `string` | `'Adriatica catalogue'` | Alt text for the image. |
| `paddingTop` | `'none'` | `'none'` | Suppressed — block manages its own layout. |
| `paddingBottom` | `'none'` | `'none'` | Same. |

---

## Editor

- Heading text input.
- CTA label input.
- Image URL input / AssetPicker.
- Image alt text input.

---

## Preview

- Full-width red section (`background: #BC0D2A` or `brand-red`).
- Horizontal layout: heading + download button on the left, catalogue image on the right.
- Download button links to the catalogue file (the URL is likely hardcoded or from a config — not currently a block field).

---

## Possible changes

| Change | What to touch |
|---|---|
| Add a `ctaUrl` field | Add `ctaUrl: string`; wire it to the download button's `href`. This is currently missing — the download URL is likely hardcoded. |
| Add a `ctaUrl` asset picker | Replace the URL text input with `AssetPicker` to pick a PDF from Vercel Blob. |
| Add a secondary CTA | Add `secondaryCta: { label, url }`; render a second (outline) button. |
| Make the background colour configurable | Add a `sectionBg` field (already available in `Newsletter`); resolve it through `BACKGROUND_STYLE`. |
| Rename to a more generic `BannerDownload` | Generalise this block by removing the hardcoded "catalogue" copy — make heading, image, and CTA fully configurable. |
