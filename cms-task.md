# CMS Page Builder — Improvement Tasks

Based on audit + screenshots (Produit Template vs real product page).

---

## P0 — Bugs to fix first

### T01 · Preview renders blocks twice
**What:** In Preview mode, every block appears once in the top section and again below it (visible in screenshot 3 — "Sample name", "Sample culture" repeat lower on page).
**Fix:** Find the preview route/component and remove the duplicate render. Likely two `blocks.map()` calls or a layout that renders children + a separate block list.

### T02 · Preview missing footer
**What:** Navbar shows in preview but footer does not.
**Fix:** The preview wrapper wraps with `<Navbar />` but forgot `<Footer />`. Add it after `<main>`.

---

## P1 — Layout & control (core UX gap)

### T03 · Hero block: image + text side by side
**What:** Real product page shows product image on the RIGHT, text on the LEFT in a two-column layout. The current bound blocks only stack vertically — no way to do this.
**Fix:** Add a `layout` prop to the Container block (already exists) with options:
- `stack` (default, vertical)
- `two-col-text-image` (text left, image right, 50/50)
- `two-col-image-text` (image left, text right)
- `three-col`

Container Inspector should expose a Layout dropdown. In Preview, apply the correct flex/grid CSS based on the selected layout. This is the single most impactful layout feature.

### T04 · Bound Image block: sizing controls
**What:** No way to control image size, aspect ratio, or object-fit in a bound image block.
**Fix:** Add to BoundImageBlock Inspector:
- `aspectRatio`: `auto | 1:1 | 4:3 | 16:9 | 3:4`
- `objectFit`: `cover | contain | fill`
- `width`: `full | half | third | auto`
- `borderRadius`: `none | sm | md | lg | full`

### T05 · Typography controls on Bound Text blocks
**What:** No font size, weight, color, or transform controls on bound-text blocks. The real product page has a large bold product name, smaller category text, body text — all different styles.
**Fix:** Add to BoundTextBlock and BoundRichTextBlock Inspector:
- `fontSize`: `xs | sm | base | lg | xl | 2xl | 3xl | 4xl`
- `fontWeight`: `normal | medium | semibold | bold`
- `color`: color picker or CSS var selector
- `textTransform`: `none | uppercase | lowercase`
- `as`: HTML tag override — `p | h1 | h2 | h3 | h4 | span`

### T06 · Table block (new block)
**What:** Real product page has a data table ("Tableau") showing Culture / Moment de l'Application / Dose/Hectare. No table block exists.
**Fix:** Create a new `table` block:
- Editor: paste CSV or build rows/columns in the Inspector with add/remove row + column controls
- Preview: renders as a real `<table>` with thead/tbody, styled to match the site's table style
- Bound variant (`bound-table`): pulls tabular data from a collection field of type `table` or `json`
- Register in registry.ts under CONTENT section

### T07 · Spacer / divider block: visual controls
**What:** Spacer exists but has no visual. Real pages use horizontal rules and spacing to separate sections.
**Fix:** Add `showDivider` toggle to Spacer block. When on, render an `<hr>` styled to match site design. Add `size` control: `xs (8px) | sm (16px) | md (32px) | lg (64px) | xl (96px)`.

---

## P2 — Mobile view

### T08 · Mobile preview toggle in editor toolbar
**What:** No way to preview how the page looks on mobile. Designer builds desktop-only layouts.
**Fix:** Add viewport toggle to the editor toolbar (next to Edit / Preview / JSON):
- Icons: Desktop | Tablet | Mobile
- In Preview mode: wrap the preview iframe/container in a fixed-width frame:
  - Desktop: 100%
  - Tablet: 768px centered
  - Mobile: 390px centered with phone chrome border
- This is a pure UI change — no block changes needed

### T09 · Container block: responsive layout overrides
**What:** A two-column layout (T03) should collapse to single column on mobile. No responsive controls exist.
**Fix:** Add to Container Inspector a "Mobile layout" override:
- `mobileBehavior`: `same | stack | reverse-stack | hide`
- Default: `stack` (always safe)
- In Preview CSS: add a `@media (max-width: 768px)` block that applies the mobile behavior

### T10 · Bound Image block: hide on mobile option
**What:** Product images at full width can break mobile layouts.
**Fix:** Add `hideOnMobile` toggle to BoundImageBlock and ImageBlock Inspector. In Preview, apply `display: none` at mobile breakpoint when toggled.

---

## P3 — Content & collection enhancements

### T11 · Collection field type: Rich Text
**What:** "benefice" field in the screenshot renders rich text (bold, paragraphs) but collection fields may only support plain text.
**Fix:** Add `rich-text` as a field type option when creating collection fields. Store as HTML string. BoundRichTextBlock already exists — wire it to this field type.

### T12 · Collection field type: Table / Structured data
**What:** The "Tableau" section is structured tabular data per product — this should be a collection field, not a hardcoded block.
**Fix:** Add `table` field type to collections. Store as JSON array of row objects. The bound-table block (T06) binds to this field type.

### T13 · Collection Item Fields block: field visibility control
**What:** The `collection-item-fields` block shows ALL fields. No way to hide internal/admin fields.
**Fix:** The "Hide fields" input already exists in the UI (screenshot 2 shows it). Ensure it actually filters fields at render time in CollectionItemFieldsBlock Preview and public render. Add a preview of which fields will show/hide as the user types.

### T14 · Detail template: auto-assign collection
**What:** When a detail template is created from a collection, it should auto-know which collection it belongs to so bound blocks can pre-populate the field dropdown.
**Fix:** Store `collectionId` on the page record when `pageType === 'detail'`. Pass it as context into the editor so bound block Inspectors pre-filter to fields from that collection — no need to manually pick the collection on each block.

---

## P4 — Polish

### T15 · Remove debug console.logs
File: `src/app/(dashboard)/dashboard/pages/[id]/page.tsx` lines 25, 30, 33.
One-liner fix, do it in any session.

### T16 · [id]==="new" inline fallback
File: same file, lines 14–23.
Creates junk DB rows with `page-${Date.now()}` slug, bypasses Zod.
Fix: delete the fallback and always redirect to `/dashboard/pages/new`.

### T17 · Draft entries leak publicly
Files: `src/app/api/entries/route.ts:17-22` and `src/app/(site)/collections/[slug]/page.tsx:24-27`.
Fix: add `where(eq(entries.status, 'published'))` filter to both queries.

### T18 · /api/entries/create — no shape validation
**What:** Public form endpoint accepts arbitrary JSON keys — malicious client can inject extra fields into the entry JSONB.
**Fix:** On POST, fetch the target collection's field definitions, whitelist only those keys from the request body, reject any extra keys with 400.

---

## Suggested execution order

| Session | Tasks | Goal |
|---------|-------|------|
| 1 | T01, T02, T15, T16 | Kill bugs, clean up |
| 2 | T03, T04, T05 | Layout control (biggest UX win) |
| 3 | T06, T07 | New blocks |
| 4 | T08, T09, T10 | Mobile |
| 5 | T11, T12, T13, T14 | Collection depth |
| 6 | T17, T18 | Security before prod |