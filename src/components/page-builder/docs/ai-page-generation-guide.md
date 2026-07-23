# AI Page Generation Guide

This document teaches an AI how to produce valid page JSON for the Blueprint CMS page builder. Share this file together with your collection schema and the AI can build a complete page — static or dynamic — that you paste straight into the **JSON** tab of the builder.

---

## What you share with the AI

1. **This file** — the complete rules for the JSON format.
2. **Your collection schema** — the field keys and their types (see [Collection schema format](#collection-schema-format) below).
3. **A description of the page** — what sections it should have, what it should look like.

---

## Collection schema format

When you share your collection with the AI, paste it in this shape:

```json
{
  "collectionId": "6e066f07-550d-4e2c-b965-942fcd094286",
  "collectionSlug": "produit",
  "fields": [
    { "key": "produit",              "label": "Nom du produit",      "type": "text"     },
    { "key": "description",          "label": "Description",         "type": "textarea" },
    { "key": "composition_simplifiee","label": "Composition",        "type": "textarea" },
    { "key": "image",                "label": "Image principale",    "type": "image"    },
    { "key": "dose",                 "label": "Dose",                "type": "textarea" },
    { "key": "mode_utilisation",     "label": "Mode d'utilisation",  "type": "select"   },
    { "key": "cultures",             "label": "Cultures",            "type": "text"     },
    { "key": "categorie_source",     "label": "Catégorie",           "type": "text"     },
    { "key": "sous_categorie",       "label": "Sous-catégorie",      "type": "text"     }
  ]
}
```

Field types the system supports: `text`, `number`, `email`, `date`, `textarea`, `checkbox`, `rich-text`, `image`, `select`, `multi-select`, `list`, `url`, `reference`, `slug`.

---

## Page JSON envelope

There are two envelope shapes depending on whether the page is **static** or a **collection detail template**.

### Static page envelope

Used for home pages, about, contact, category landing pages — anything that does NOT render a single collection entry.

```json
{
  "id": "existing-page-uuid",
  "slug": "page-slug",
  "title": "Page Title",
  "status": "draft",
  "schemaVersion": 1,
  "meta": {
    "title": "SEO title override (optional)",
    "description": "Meta description (optional)"
  },
  "blocks": {
    "en": [ /* array of Block objects */ ],
    "fr": [ /* optional French version */ ]
  }
}
```

### Template (detail) page envelope

Used when the page renders **one item** from a collection — e.g. a product detail page, article page, etc. The envelope requires four extra fields that tell the CMS which collection this template belongs to.

```json
{
  "title": "Produit",
  "slug": "produit",
  "status": "draft",
  "mode": "template",
  "templateKind": "detail",
  "collectionId": "6e066f07-550d-4e2c-b965-942fcd094286",
  "basePath": "produit",
  "meta": {
    "title": "",
    "description": "",
    "canonical": "",
    "noIndex": false,
    "ogImage": ""
  },
  "blocks": {
    "fr": [ /* French blocks */ ],
    "en": [ /* English blocks */ ]
  }
}
```

| Extra field | Value | Description |
|---|---|---|
| `mode` | `"template"` | Marks this as a template page (not a static page). **Required.** |
| `templateKind` | `"detail"` | The only supported kind. **Required.** |
| `collectionId` | UUID | The UUID of the collection this template renders. **Required.** |
| `basePath` | string | The collection's URL slug (e.g. `"produit"` → `/produit/[item-slug]`). **Required.** |

**Rules (both envelope types):**
- `id` and `slug` must match the page that already exists in the CMS — preserve them if the user provides them.
- `schemaVersion` is always `1` (omit it for template pages — the CMS sets it automatically).
- Only include `"fr"` if you want a French version; otherwise omit it.
- When both `"en"` and `"fr"` blocks are present, block IDs **must differ** between locales — use different UUIDs per locale.
- When importing, the builder merges the JSON into the current page state — existing blocks are replaced.

---

## Block object shape

Every item in a `blocks.en` array is a **Block**:

```json
{
  "id": "unique-uuid-v4",
  "type": "block-type-string",
  "data": { /* block-specific fields */ },
  "order": 0
}
```

- `id`: any unique UUID. Generate one per block (e.g. `"a1b2c3d4-e5f6-7890-abcd-ef1234567890"`).
- `type`: one of the registered block types listed below.
- `order`: sequential integer starting at 0.

---

## Universal data fields (every block)

These fields live inside `data` and are valid on **every** block type:

| Field | Type | Default | Description |
|---|---|---|---|
| `paddingTop` | `'none'/'sm'/'md'/'lg'/'xl'` | `'md'` | Top outer padding (0 / 2rem / 4rem / 6rem / 8rem) |
| `paddingBottom` | `'none'/'sm'/'md'/'lg'/'xl'` | `'md'` | Bottom outer padding |
| `maxWidth` | `'sm'/'md'/'lg'/'full'` | `'lg'` | Content max-width (640 / 768 / 1024 / 100%) |
| `align` | `'left'/'center'/'right'` | `'left'` | Text alignment inside the block |
| `background` | `'none'/'muted'/'dark'/'brand-red'/'brand-green'/'navy'` | `'none'` | Section background |
| `hideOnMobile` | `boolean` | `false` | Hide on screens < 768px |
| `customClassName` | `string` | `''` | Extra CSS class on the section wrapper |

---

## Static block catalogue

### `hero`

Full-width hero with headline, subheadline, CTA buttons, and background image.

```json
{
  "id": "...", "type": "hero", "order": 0,
  "data": {
    "headline": "Bienvenue chez Adriatica",
    "subheadline": "Votre partenaire en nutrition végétale",
    "ctaLabel": "Découvrir nos produits",
    "ctaUrl": "/collections/produit",
    "ctaSecondaryLabel": "Nous contacter",
    "ctaSecondaryUrl": "/contact",
    "backgroundImage": "https://example.com/hero.jpg",
    "overlay": true,
    "minHeight": "lg",
    "textColor": "light",
    "paddingTop": "none",
    "paddingBottom": "none"
  }
}
```

`minHeight`: `'sm'` / `'md'` / `'lg'` / `'screen'`

---

### `section-heading`

A heading + optional subheading + optional divider. **Supports field binding in template mode** (see dynamic section).

```json
{
  "id": "...", "type": "section-heading", "order": 1,
  "data": {
    "heading": "Nos produits phares",
    "subheading": "Découvrez notre gamme complète",
    "size": "lg",
    "align": "center",
    "showDivider": true,
    "dividerColor": "#BC0D2A"
  }
}
```

`size`: `'sm'` (h4) / `'md'` (h3) / `'lg'` (h2)

---

### `rich-text`

Formatted HTML content (output from TipTap).

```json
{
  "id": "...", "type": "rich-text", "order": 2,
  "data": {
    "content": "<p>Your HTML here. Supports <strong>bold</strong>, <em>italic</em>, lists, headings.</p>",
    "paddingTop": "sm",
    "paddingBottom": "sm"
  }
}
```

---

### `image`

Single image with alt text, optional caption, optional link.

```json
{
  "id": "...", "type": "image", "order": 3,
  "data": {
    "url": "https://example.com/image.jpg",
    "alt": "Description de l'image",
    "caption": "Légende optionnelle",
    "width": "full",
    "objectFit": "cover",
    "aspectRatio": "16:9",
    "linkUrl": ""
  }
}
```

`width`: `'full'` / `'half'` / `'third'` / `'auto'`
`objectFit`: `'cover'` / `'contain'` / `'fill'`
`aspectRatio`: `'auto'` / `'1:1'` / `'4:3'` / `'16:9'` / `'3:4'`

---

### `cta`

Call-to-action band with headline, body, primary + secondary buttons.

```json
{
  "id": "...", "type": "cta", "order": 4,
  "data": {
    "headline": "Prêt à améliorer vos rendements ?",
    "body": "Contactez notre équipe d'experts.",
    "primaryLabel": "Demander un devis",
    "primaryUrl": "/contact",
    "secondaryLabel": "Voir le catalogue",
    "secondaryUrl": "/catalogue",
    "background": "brand-red",
    "align": "center"
  }
}
```

---

### `columns`

2–4 icon/title/body feature columns.

```json
{
  "id": "...", "type": "columns", "order": 5,
  "data": {
    "columns": 3,
    "gap": "md",
    "items": [
      { "id": "col-1", "icon": "Leaf", "title": "Naturel", "body": "Formules à base de matières organiques." },
      { "id": "col-2", "icon": "Zap",  "title": "Efficace", "body": "Résultats visibles dès la première application." },
      { "id": "col-3", "icon": "Globe","title": "Durable",  "body": "Respectueux de l'environnement." }
    ]
  }
}
```

`columns`: `2` / `3` / `4` | `gap`: `'sm'` / `'md'` / `'lg'`
`icon`: any [Lucide](https://lucide.dev/icons/) icon name (PascalCase).

---

### `key-value-list`

Label/value rows — ideal for specs, composition tables, parameters.

```json
{
  "id": "...", "type": "key-value-list", "order": 6,
  "data": {
    "heading": "Composition",
    "striped": true,
    "showDividers": true,
    "layout": "two-col",
    "items": [
      { "id": "kv-1", "label": "Azote total (N)", "value": "7,7 %" },
      { "id": "kv-2", "label": "Matière organique", "value": "37 %" }
    ]
  }
}
```

`layout`: `'two-col'` / `'stacked'`

---

### `table`

Data table with headers, rows, optional rich-text cells, and optional collection field bindings per column.

```json
{
  "id": "...", "type": "table", "order": 7,
  "data": {
    "caption": "Tableau de doses",
    "headers": ["Culture", "Dose", "Fréquence"],
    "rows": [
      ["Tomates", "5–8 L/ha", "3–4 applications"],
      ["Vigne",   "5–10 L/ha","2–4 applications"]
    ],
    "striped": true,
    "bordered": true,
    "columnConfigs": [
      { "type": "text",      "fieldKey": null },
      { "type": "text",      "fieldKey": null },
      { "type": "rich-text", "fieldKey": null }
    ]
  }
}
```

**`columnConfigs`** — one entry per column (index matches `headers`):

| Sub-field | Values | Description |
|---|---|---|
| `type` | `"text"` / `"rich-text"` | How the cell is rendered. `"text"` = plain string. `"rich-text"` = rendered as HTML via `dangerouslySetInnerHTML`. Default: `"text"`. |
| `fieldKey` | field key string / `null` | When set to a collection field key, the cell shows the bound field value instead of the literal string in `rows`. `null` = use the literal. |

**When to use `fieldKey` on a table column:** only in a **detail template** page, when the table column's data comes from a collection field. Example: a "Cultures" column bound to a `cultures` textarea field. If the data is static and the same across all collection items, leave `fieldKey: null` and write the content directly in `rows`.

**Static table in a template page (most common):** usage/dose tables are usually the same across all products — hardcode the rows and leave all `fieldKey` values as `null`. The table will render exactly as written regardless of which collection item is being viewed.

```json
{
  "id": "...", "type": "table", "order": 2,
  "data": {
    "caption": "",
    "headers": ["Culture / Usage", "Dose"],
    "rows": [
      ["Cultures horticoles (maraîchage)", "3 à 4 applications — 6 à 10 L/ha"],
      ["Arbres fruitiers, agrumes, vigne", "2 à 4 applications — 5 à 10 L/ha"]
    ],
    "striped": false,
    "bordered": true,
    "columnConfigs": [
      { "type": "text", "fieldKey": null },
      { "type": "text", "fieldKey": null }
    ],
    "paddingTop": "sm",
    "paddingBottom": "md"
  }
}
```

---

### `spacer`

Vertical whitespace, optionally with a divider line.

```json
{
  "id": "...", "type": "spacer", "order": 8,
  "data": {
    "size": "md",
    "showDivider": false
  }
}
```

`size`: `'xs'` (8px) / `'sm'` (16px) / `'md'` (32px) / `'lg'` (64px) / `'xl'` (96px)

---

### `button`

Standalone navigation button.

```json
{
  "id": "...", "type": "button", "order": 9,
  "data": {
    "label": "Télécharger la fiche",
    "url": "/catalogue.pdf",
    "variant": "primary",
    "icon": "download",
    "align": "center",
    "openInNewTab": true
  }
}
```

`variant`: `'primary'` / `'outline'` / `'ghost'`
`icon`: `'none'` / `'arrow'` / `'external'` / `'download'`

---

### `download-button`

File download CTA. **Supports field binding for URL in template mode** (see dynamic section).

```json
{
  "id": "...", "type": "download-button", "order": 10,
  "data": {
    "label": "Télécharger la fiche technique",
    "url": "https://example.com/fiche.pdf",
    "variant": "primary",
    "icon": "download",
    "align": "left",
    "openInNewTab": true
  }
}
```

---

### `collection-list`

Grid/list of collection entries with links.

```json
{
  "id": "...", "type": "collection-list", "order": 11,
  "data": {
    "collectionId": "6e066f07-550d-4e2c-b965-942fcd094286",
    "collectionSlug": "produit",
    "layout": "grid-3",
    "limit": 12,
    "imageField": "image",
    "titleField": "produit",
    "displayFields": ["cultures", "categorie_source"],
    "linkToItems": true
  }
}
```

`layout`: `'list'` / `'grid-2'` / `'grid-3'` / `'grid-4'`

---

### `product-hero`

Two-column product showcase (image left or right, text panel). **All text/image props are bindable in template mode** (see dynamic section).

```json
{
  "id": "...", "type": "product-hero", "order": 12,
  "data": {
    "title": "ATRIUM ROOT",
    "subtitle1": "Stimulateur racinaire",
    "subtitle2": "Liquide — Fertigation",
    "body": "<p>Stimule un enracinement profond et dense.</p>",
    "ctaLabel": "Voir la fiche",
    "ctaUrl": "/contact",
    "image": "https://example.com/product.jpg",
    "imagePosition": "right",
    "backgroundColor": ""
  }
}
```

---

### `container`

Flex/grid layout wrapper that holds nested blocks side-by-side.

```json
{
  "id": "...", "type": "container", "order": 13,
  "data": {
    "layout": "two-col-text-image",
    "mobileBehavior": "stack",
    "containerGap": "md",
    "containerPadding": "none",
    "alignItems": "center",
    "backgroundColor": "",
    "borderWidth": "0",
    "borderRadius": "none",
    "borderColor": "",
    "children": [
      {
        "id": "child-1", "type": "rich-text", "order": 0,
        "data": { "content": "<h2>Titre</h2><p>Texte à gauche.</p>" }
      },
      {
        "id": "child-2", "type": "image", "order": 1,
        "data": { "url": "https://example.com/img.jpg", "alt": "image" }
      }
    ]
  }
}
```

`layout`: `'stack'` / `'two-col-text-image'` / `'two-col-image-text'` / `'three-col'`
`mobileBehavior`: `'stack'` / `'same'` / `'hide'`
Allowed child types: `rich-text`, `image`, `video`, `spacer`, `cta`, `bound-text`, `bound-image`, `bound-rich-text`, `bound-date`.

---

## Dynamic blocks — linking to collection fields

Dynamic blocks display **live data from a CMS collection entry**. They are used in two contexts:

| Context | Where | How data arrives |
|---|---|---|
| **Detail template page** | A page marked as the detail template for a collection (e.g. `/collections/produit/[slug]`) | The current URL slug resolves the entry; bound blocks read from it automatically. |
| **Repeater block** | Inside a Repeater on any page | The Repeater fetches all entries and renders the card template once per entry. |

The key rule: **you must set a `fieldKey` (or `*FieldKey`) that exactly matches the `key` of a field in the collection schema.**

---

### Atomic bound blocks

Each renders a single field value.

#### `bound-text`

Displays a `text`, `number`, `email`, `textarea`, `url`, or `slug` field.

```json
{
  "id": "...", "type": "bound-text", "order": 0,
  "data": {
    "fieldKey": "produit",
    "as": "h1",
    "fontSize": "2xl",
    "fontWeight": "bold",
    "textColor": "#0b0f19",
    "textTransform": "uppercase"
  }
}
```

`as`: `'p'` / `'h1'` / `'h2'` / `'h3'` / `'h4'` / `'span'`
`fontSize`: `'xs'` / `'sm'` / `'base'` / `'lg'` / `'xl'` / `'2xl'` / `'3xl'` / `'4xl'`
`fontWeight`: `'normal'` / `'medium'` / `'semibold'` / `'bold'`
`textTransform`: `'none'` / `'uppercase'` / `'lowercase'` / `'capitalize'`

Compatible field types: `text`, `number`, `email`, `textarea`, `url`, `slug`, `select`, `date`.

---

#### `bound-image`

Displays an `image` field.

```json
{
  "id": "...", "type": "bound-image", "order": 1,
  "data": {
    "fieldKey": "image",
    "width": "full",
    "objectFit": "cover",
    "aspectRatio": "4:3"
  }
}
```

Compatible field types: `image`, `url`.

---

#### `bound-rich-text`

Renders a `rich-text` field as formatted HTML.

```json
{
  "id": "...", "type": "bound-rich-text", "order": 2,
  "data": {
    "fieldKey": "description"
  }
}
```

Compatible field types: `rich-text`, `textarea`, `text`.

---

#### `bound-date`

Displays a `date` field with locale-aware formatting.

```json
{
  "id": "...", "type": "bound-date", "order": 3,
  "data": {
    "fieldKey": "date_publication"
  }
}
```

Compatible field types: `date`.

---

### Composite block bindings

These standard blocks support per-prop field binding via `*FieldKey` suffixed fields. When a `*FieldKey` is set, the bound value overrides the literal value at render time.

#### `product-hero` bindings

```json
{
  "id": "...", "type": "product-hero", "order": 0,
  "data": {
    "titleFieldKey":    "produit",
    "subtitle1FieldKey":"sous_categorie",
    "subtitle2FieldKey":"mode_utilisation",
    "bodyFieldKey":     "description",
    "imageFieldKey":    "image",
    "title":     "Fallback title (shown in editor preview)",
    "subtitle1": "Fallback subtitle",
    "body":      "<p>Fallback body</p>",
    "image":     "",
    "imagePosition": "right",
    "ctaLabel":  "Demander un devis",
    "ctaUrl":    "/contact"
  }
}
```

Set a fallback literal for each bound prop — the editor preview shows it when no mock data is available.

---

#### `section-heading` bindings

```json
{
  "id": "...", "type": "section-heading", "order": 1,
  "data": {
    "headingFieldKey":    "produit",
    "subheadingFieldKey": "sous_categorie",
    "heading":    "Nom du produit",
    "subheading": "Catégorie",
    "size": "lg",
    "align": "left",
    "showDivider": true
  }
}
```

---

#### `download-button` binding

```json
{
  "id": "...", "type": "download-button", "order": 2,
  "data": {
    "urlFieldKey": "fiche_technique",
    "label":  "Télécharger la fiche",
    "url":    "",
    "variant":"primary",
    "icon":   "download",
    "align":  "left"
  }
}
```

---

### `repeater` block — dynamic listing page

The Repeater fetches all entries from a collection and renders a `cardTemplate` once per entry. Use it on index/listing pages. Bound blocks inside the card template automatically receive each entry's data.

```json
{
  "id": "...", "type": "repeater", "order": 0,
  "data": {
    "collectionId":   "6e066f07-550d-4e2c-b965-942fcd094286",
    "collectionSlug": "produit",
    "columns": "3",
    "repeaterGap": "md",
    "paddingTop": "md",
    "paddingBottom": "md",
    "background": "none",
    "cardTemplate": [
      {
        "id": "card-img", "type": "bound-image", "order": 0,
        "data": {
          "fieldKey": "image",
          "width": "full",
          "objectFit": "cover",
          "aspectRatio": "4:3"
        }
      },
      {
        "id": "card-title", "type": "bound-text", "order": 1,
        "data": {
          "fieldKey": "produit",
          "as": "h3",
          "fontSize": "lg",
          "fontWeight": "semibold"
        }
      },
      {
        "id": "card-category", "type": "bound-text", "order": 2,
        "data": {
          "fieldKey": "sous_categorie",
          "as": "p",
          "fontSize": "sm",
          "textColor": "#666"
        }
      },
      {
        "id": "card-desc", "type": "bound-rich-text", "order": 3,
        "data": {
          "fieldKey": "description"
        }
      }
    ]
  }
}
```

Allowed `cardTemplate` block types: `container`, `bound-text`, `bound-image`, `bound-rich-text`, `bound-date`, `rich-text`, `image`, `spacer`.

A `container` child inside `cardTemplate` can itself hold bound blocks to create multi-column card layouts:

```json
{
  "id": "card-row", "type": "container", "order": 0,
  "data": {
    "layout": "two-col-text-image",
    "mobileBehavior": "stack",
    "containerGap": "sm",
    "containerPadding": "sm",
    "alignItems": "start",
    "borderWidth": "1",
    "borderRadius": "md",
    "borderColor": "#e5e7eb",
    "children": [
      {
        "id": "c-text", "type": "bound-text", "order": 0,
        "data": { "fieldKey": "produit", "as": "h3", "fontWeight": "bold" }
      },
      {
        "id": "c-img", "type": "bound-image", "order": 1,
        "data": { "fieldKey": "image", "width": "full", "objectFit": "cover" }
      }
    ]
  }
}
```

---

## How the AI should approach page generation

### Step 1 — Identify page type

| Page type | Envelope | Use these blocks |
|---|---|---|
| **Static page** (home, about, contact) | Static envelope (no `mode`) | Static blocks only (hero, rich-text, cta, columns…) |
| **Collection index page** (list all products) | Static envelope | `repeater` with bound card template |
| **Collection detail / template page** (single product) | **Template envelope** — add `mode`, `templateKind`, `collectionId`, `basePath` | Static blocks + composite blocks with `*FieldKey` + atomic `bound-*` blocks |

> **Critical:** if the page is a detail template, the envelope MUST include `"mode": "template"`, `"templateKind": "detail"`, `"collectionId"`, and `"basePath"`. Without these four fields the page will be saved as a static page and field bindings will not resolve.

**Detail template pages can freely mix static and bound blocks.** Not every block needs to be bound. A static `section-heading`, a static `table`, or a static `cta` block placed on a detail template page will render identically for every collection item — that is intentional and correct. Only bind what actually comes from the collection entry.

### Step 2 — Map field keys to blocks

For each piece of data from the collection schema:

| Field type | Best block |
|---|---|
| `text` (product name, title) | `bound-text` with `as: 'h1'/'h2'/'h3'` OR `product-hero.titleFieldKey` |
| `textarea` / `rich-text` (description, body) | `bound-rich-text` OR `product-hero.bodyFieldKey` |
| `image` | `bound-image` OR `product-hero.imageFieldKey` |
| `text` (category, subtitle) | `bound-text` with `as: 'p'` OR `section-heading.subheadingFieldKey` |
| `url` / `image` (downloadable file) | `download-button` with `urlFieldKey` |
| `date` | `bound-date` |
| `textarea` (composition, specs) | `bound-rich-text` OR a static `key-value-list` (if you want labelled rows) |

### Step 3 — Compose the layout

Good detail-page structure for a product:

```
section-heading  (headingFieldKey → product name)
product-hero     (image, title, subtitle, body all bound)
spacer           (size: sm)
section-heading  (heading: "Composition", static)
key-value-list   (static rows)           ← or bound-rich-text for free-form composition
spacer           (size: sm)
section-heading  (heading: "Doses et application", static)
rich-text        (content: static explanation) ← or bound-rich-text if doses is a field
download-button  (urlFieldKey → fiche_technique)
cta              (static — contact banner)
```

Good index-page structure:

```
hero             (static — page hero)
section-heading  (static — "Nos produits")
repeater         (collectionId, card template with bound-image + bound-text × 2)
cta              (static — contact CTA)
```

### Step 4 — Generate UUIDs

Every block needs a unique `id`. Use v4 UUID format: `"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"` where `x` is a random hex digit and `y` is `8`, `9`, `a`, or `b`. Generate a distinct UUID for every block and every card-template block.

### Step 5 — Output the complete JSON

Output the full `PageData` JSON object (not just the blocks array). The user will paste it into the builder's **JSON** tab and click **Load JSON**.

---

## Complete example — product detail template

Given this collection schema:
```json
{
  "collectionId": "6e066f07-550d-4e2c-b965-942fcd094286",
  "collectionSlug": "produit",
  "fields": [
    { "key": "produit",               "type": "text"     },
    { "key": "sous_categorie",        "type": "text"     },
    { "key": "forme",                 "type": "text"     },
    { "key": "description",           "type": "textarea" },
    { "key": "composition_simplifiee","type": "textarea" },
    { "key": "image",                 "type": "image"    }
  ]
}
```

The AI should produce (note the **template envelope** — not the static envelope):

```json
{
  "title": "Produit",
  "slug": "produit",
  "status": "draft",
  "mode": "template",
  "templateKind": "detail",
  "collectionId": "6e066f07-550d-4e2c-b965-942fcd094286",
  "basePath": "produit",
  "meta": {
    "title": "",
    "description": "",
    "canonical": "",
    "noIndex": false,
    "ogImage": ""
  },
  "blocks": {
    "en": [
      {
        "id": "1e000000-0000-4000-8000-000000000001",
        "type": "product-hero",
        "order": 0,
        "data": {
          "titleFieldKey":    "produit",
          "subtitle1FieldKey": null,
          "subtitle2FieldKey": "forme",
          "bodyFieldKey":     "description",
          "imageFieldKey":    "image",
          "title":      "Product name",
          "subtitle1":  "",
          "subtitle2":  "Form / category",
          "body":       "<p>Product description.</p>",
          "image":      "",
          "imagePosition": "right",
          "backgroundColor": "",
          "ctaLabel":   "Download 2026 Catalogue",
          "ctaUrl":     "#catalogue",
          "paddingTop": "lg",
          "paddingBottom": "lg"
        }
      },
      {
        "id": "1e000000-0000-4000-8000-000000000002",
        "type": "section-heading",
        "order": 1,
        "data": {
          "heading": "How to use",
          "subheading": "",
          "align": "left",
          "size": "md",
          "showDivider": false,
          "headingFieldKey": null,
          "subheadingFieldKey": null,
          "paddingTop": "sm",
          "paddingBottom": "sm"
        }
      },
      {
        "id": "1e000000-0000-4000-8000-000000000003",
        "type": "table",
        "order": 2,
        "data": {
          "caption": "",
          "headers": ["Crop / Use", "Dose"],
          "rows": [
            ["Horticultural crops", "3 to 4 applications — 6 to 10 L/ha"],
            ["Fruit trees, citrus, vine", "2 to 4 applications — 5 to 10 L/ha"]
          ],
          "striped": false,
          "bordered": true,
          "columnConfigs": [
            { "type": "text", "fieldKey": null },
            { "type": "text", "fieldKey": null }
          ],
          "paddingTop": "sm",
          "paddingBottom": "md"
        }
      },
      {
        "id": "1e000000-0000-4000-8000-000000000004",
        "type": "section-heading",
        "order": 3,
        "data": {
          "heading": "Product composition",
          "subheading": "",
          "align": "left",
          "size": "md",
          "showDivider": false,
          "headingFieldKey": null,
          "subheadingFieldKey": null,
          "paddingTop": "sm",
          "paddingBottom": "sm"
        }
      },
      {
        "id": "1e000000-0000-4000-8000-000000000005",
        "type": "bound-rich-text",
        "order": 4,
        "data": {
          "fieldKey": "composition_simplifiee",
          "paddingTop": "sm",
          "paddingBottom": "md"
        }
      },
      {
        "id": "1e000000-0000-4000-8000-000000000006",
        "type": "cta",
        "order": 5,
        "data": {
          "headline": "Need personalised advice?",
          "body": "Our team is at your disposal.",
          "primaryLabel": "Contact us",
          "primaryUrl": "/contact",
          "background": "brand-red",
          "align": "center",
          "paddingTop": "lg",
          "paddingBottom": "lg"
        }
      }
    ],
    "fr": [
      {
        "id": "1f000000-0000-4000-8000-000000000001",
        "type": "product-hero",
        "order": 0,
        "data": {
          "titleFieldKey":    "produit",
          "subtitle1FieldKey": null,
          "subtitle2FieldKey": "forme",
          "bodyFieldKey":     "description",
          "imageFieldKey":    "image",
          "title":      "Nom du produit",
          "subtitle1":  "",
          "subtitle2":  "Forme / catégorie",
          "body":       "<p>Description du produit.</p>",
          "image":      "",
          "imagePosition": "right",
          "backgroundColor": "",
          "ctaLabel":   "Télécharger Catalogue 2026",
          "ctaUrl":     "#catalogue",
          "paddingTop": "lg",
          "paddingBottom": "lg"
        }
      },
      {
        "id": "1f000000-0000-4000-8000-000000000002",
        "type": "section-heading",
        "order": 1,
        "data": {
          "heading": "Mode d'utilisation",
          "subheading": "",
          "align": "left",
          "size": "md",
          "showDivider": false,
          "headingFieldKey": null,
          "subheadingFieldKey": null,
          "paddingTop": "sm",
          "paddingBottom": "sm"
        }
      },
      {
        "id": "1f000000-0000-4000-8000-000000000003",
        "type": "table",
        "order": 2,
        "data": {
          "caption": "",
          "headers": ["Culture / Usage", "Dose"],
          "rows": [
            ["Cultures horticoles (maraîchage)", "3 à 4 applications — 6 à 10 L/ha"],
            ["Arbres fruitiers, agrumes, vigne", "2 à 4 applications — 5 à 10 L/ha"]
          ],
          "striped": false,
          "bordered": true,
          "columnConfigs": [
            { "type": "text", "fieldKey": null },
            { "type": "text", "fieldKey": null }
          ],
          "paddingTop": "sm",
          "paddingBottom": "md"
        }
      },
      {
        "id": "1f000000-0000-4000-8000-000000000004",
        "type": "section-heading",
        "order": 3,
        "data": {
          "heading": "Composition du produit",
          "subheading": "",
          "align": "left",
          "size": "md",
          "showDivider": false,
          "headingFieldKey": null,
          "subheadingFieldKey": null,
          "paddingTop": "sm",
          "paddingBottom": "sm"
        }
      },
      {
        "id": "1f000000-0000-4000-8000-000000000005",
        "type": "bound-rich-text",
        "order": 4,
        "data": {
          "fieldKey": "composition_simplifiee",
          "paddingTop": "sm",
          "paddingBottom": "md"
        }
      },
      {
        "id": "1f000000-0000-4000-8000-000000000006",
        "type": "cta",
        "order": 5,
        "data": {
          "headline": "Besoin d'un conseil personnalisé ?",
          "body": "Notre équipe est à votre disposition.",
          "primaryLabel": "Nous contacter",
          "primaryUrl": "/contact",
          "background": "brand-red",
          "align": "center",
          "paddingTop": "lg",
          "paddingBottom": "lg"
        }
      }
    ]
  }
}
```

**Things to notice in this example:**
- The envelope uses `"mode": "template"` etc. — not the static envelope.
- `product-hero` carries all five `*FieldKey` fields. Each set to a collection field key OR `null`.
- The `table` has static rows (dose data is product-specific but written directly) — `fieldKey: null` on all columns. `columnConfigs` is always present and matches `headers` length.
- `section-heading` blocks are completely static (`headingFieldKey: null`) — that is correct for labels/headings that don't come from the collection.
- `bound-rich-text` uses a bare `fieldKey` — no `*` prefix, just `fieldKey`.
- `"en"` and `"fr"` block IDs differ (`1e…` vs `1f…`) — they must never share IDs.
- Fallback literal values (`title`, `body`, etc.) are present in composite blocks so the editor preview has something to show when no mock data is loaded.

---

## Validation checklist (AI must verify before output)

- [ ] Every block has a unique `id` (no duplicates, including inside `children` and `cardTemplate`). Block IDs differ between `"en"` and `"fr"` locales.
- [ ] Every `fieldKey` / `*FieldKey` matches an existing field `key` in the collection schema **exactly** (case-sensitive, no typos).
- [ ] `collectionId` and `collectionSlug` (where used) match the collection exactly.
- [ ] `order` is sequential starting from `0` within each array level.
- [ ] Bound blocks (`bound-text`, `bound-image`, `bound-rich-text`, `bound-date`) are only used in a detail template page or inside a `repeater.cardTemplate`.
- [ ] Static blocks (hero, cta, rich-text, table with `fieldKey: null`…) do NOT have stray `fieldKey` or `*FieldKey` fields — only composite/bound blocks carry these.
- [ ] **If the page is a detail template:** the envelope includes `"mode": "template"`, `"templateKind": "detail"`, `"collectionId"`, and `"basePath"`. Missing any of these makes field bindings non-functional.
- [ ] **If the page is static:** the envelope does NOT include `mode`, `templateKind`, `collectionId`, or `basePath`.
- [ ] Table blocks include a `columnConfigs` array whose length matches `headers`. Set `"fieldKey": null` for all static columns.
- [ ] The output is a valid JSON object (no trailing commas, no comments).
- [ ] `id` and `slug` at the page level are preserved from what the user provided.
