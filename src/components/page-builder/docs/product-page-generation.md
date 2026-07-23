# AI Agent — Product Page JSON Generator

This document tells an AI agent how to produce valid **Blueprint CMS page-builder JSON** for individual product pages built from a CSV data source and extracted PDF images.

Share this file together with:
1. Your **CSV file** (or a paste of its rows)
2. A list of **image filenames** that were extracted from the catalogue PDF
3. Optionally: the **page-builder.md** file for full block reference

---

## What this system produces

One JSON file **per product**, each representing a fully designed standalone page for that product. The pages are served at:

- French: `/fr/produit/[product-slug]`
- English: `/en/product/[product-slug]`

These are **static page-builder pages** — not collection templates. Each product page is unique and hand-designed via the page builder.

---

## Slug convention — critical

Every product page is stored in the CMS database with the slug pattern:

```
produit-[product-slug]
```

Where `[product-slug]` is a URL-safe version of the product name:
- Lowercase
- Spaces → hyphens
- Remove accents and special characters
- Example: `"ATRIUM ROOT"` → `produit-atrium-root`

The `slug` field in your JSON output **must follow this pattern exactly**.

---

## Image placeholder format

You do not know the final Vercel Blob URL at generation time. Use this placeholder format everywhere an image URL is needed:

```
{{IMAGE:filename.ext}}
```

- `filename.ext` must match the exact filename of the image file that will be uploaded
- Example: `"{{IMAGE:atrium-root.jpg}}"`
- The upload endpoint replaces every placeholder with the real CDN URL before saving the page

If a product has no image, set the image field to an empty string `""` and omit the image block.

---

## JSON envelope — static page (no collection binding)

Every product page uses the **static page envelope**. Do NOT use `mode`, `templateKind`, `collectionId`, or `basePath` — those are for collection templates, not these standalone pages.

```json
{
  "slug": "produit-[product-slug]",
  "title": "[Product Name]",
  "status": "draft",
  "schemaVersion": 1,
  "meta": {
    "title": "[Product Name] — Adriatica",
    "description": "[One sentence about the product, from description field]",
    "noIndex": false
  },
  "blocks": {
    "fr": [ /* French blocks array */ ],
    "en": [ /* English blocks array */ ]
  }
}
```

**Rules:**
- `"slug"` must be `produit-[product-slug]` (lowercase, hyphens, no spaces)
- `"schemaVersion"` is always `1`
- Both `"fr"` and `"en"` block arrays are required
- Block IDs must be unique **within each locale** and must **differ between `"fr"` and `"en"`**
- Use a UUID v4 format for block IDs: `"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"`
- `order` is a sequential integer starting at `0` within each array

---

## Recommended page layout for a product

```
[0] product-hero   ← image, product name, category, description
[1] section-heading ← "Composition" (static)
[2] rich-text OR key-value-list ← composition data
[3] section-heading ← "Doses et application" / "Application Rates"
[4] table ← dose/crop rows
[5] button ← link to full catalogue PDF (if applicable)
[6] cta ← contact banner (static, same across all products)
```

You may omit sections that have no data (e.g. no image → no product-hero image panel, use section-heading + rich-text instead).

---

## Block reference

### `product-hero`

Two-column block: image on one side, product info on the other. Use this as block 0.

```json
{
  "id": "UUID",
  "type": "product-hero",
  "order": 0,
  "data": {
    "title": "[product name — literal fallback]",
    "subtitle1": "[category]",
    "subtitle2": "[form: Liquide / Soluble / Granulé / etc.]",
    "body": "<p>[description HTML]</p>",
    "image": "{{IMAGE:filename.jpg}}",
    "imagePosition": "right",
    "ctaLabel": "Demander un devis",
    "ctaUrl": "/contact",
    "backgroundColor": "",
    "paddingTop": "lg",
    "paddingBottom": "lg"
  }
}
```

For English:
- `ctaLabel`: `"Request a quote"`
- `ctaUrl`: `"/contact"`

---

### `section-heading`

Static label for a section. No field bindings needed.

```json
{
  "id": "UUID",
  "type": "section-heading",
  "order": 1,
  "data": {
    "heading": "Composition",
    "subheading": "",
    "size": "md",
    "align": "left",
    "showDivider": false,
    "paddingTop": "sm",
    "paddingBottom": "sm"
  }
}
```

---

### `rich-text`

For free-form text content (description, composition, instructions).

```json
{
  "id": "UUID",
  "type": "rich-text",
  "order": 2,
  "data": {
    "content": "<p>[HTML content]</p>",
    "paddingTop": "none",
    "paddingBottom": "sm"
  }
}
```

Convert plain-text composition data to `<p>` tags. If the composition is a list of ingredients, use `<ul><li>...</li></ul>`.

---

### `key-value-list`

Ideal for structured composition tables (label: value rows).

```json
{
  "id": "UUID",
  "type": "key-value-list",
  "order": 2,
  "data": {
    "heading": "",
    "striped": true,
    "showDividers": true,
    "layout": "two-col",
    "items": [
      { "id": "kv-1", "label": "Azote total (N)", "value": "7,7 %" },
      { "id": "kv-2", "label": "Matière organique", "value": "37 %" }
    ],
    "paddingTop": "none",
    "paddingBottom": "sm"
  }
}
```

Use this when composition data is structured as `ingredient: percentage` pairs. Use `rich-text` when composition is a paragraph.

---

### `table`

For dose/application tables. All cells are static — leave `fieldKey: null`.

```json
{
  "id": "UUID",
  "type": "table",
  "order": 4,
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

**Rules for the table:**
- `columnConfigs` must have the same number of entries as `headers`
- `fieldKey` is always `null` (these are standalone pages, not templates)
- English headers: `["Crop / Use", "Application Rate"]`

---

### `button`

Standalone navigation or download button.

```json
{
  "id": "UUID",
  "type": "button",
  "order": 5,
  "data": {
    "label": "Télécharger le catalogue 2026",
    "url": "/catalogue-adriatica-2026.pdf",
    "variant": "outline",
    "icon": "download",
    "align": "left",
    "openInNewTab": true,
    "paddingTop": "sm",
    "paddingBottom": "sm"
  }
}
```

---

### `cta`

Contact banner. Use this as the last block on every product page. Keep it identical across all products.

```json
{
  "id": "UUID",
  "type": "cta",
  "order": 6,
  "data": {
    "headline": "Besoin d'un conseil personnalisé ?",
    "body": "Notre équipe est à votre disposition pour vous accompagner.",
    "primaryLabel": "Nous contacter",
    "primaryUrl": "/contact",
    "background": "brand-red",
    "align": "center",
    "paddingTop": "lg",
    "paddingBottom": "lg"
  }
}
```

English version:
```json
{
  "headline": "Need personalised advice?",
  "body": "Our team is at your disposal.",
  "primaryLabel": "Contact us",
  "primaryUrl": "/contact"
}
```

---

## CSV column mapping

This section is specific to the Adriatica product catalogue. Adapt for your own CSV.

| CSV column | Use in page |
|---|---|
| `produit` | `product-hero.title`, page `title`, `meta.title` |
| `description` | `product-hero.body` (wrap in `<p>` tags) |
| `composition_simplifiee` | `key-value-list` items OR `rich-text.content` |
| `image` | Image filename — convert to `{{IMAGE:filename.ext}}` in `product-hero.image` |
| `dose` | `table` rows — split by crop type if structured, otherwise `rich-text` |
| `mode_utilisation` | `product-hero.subtitle2` (e.g. "Liquide — Fertigation") |
| `cultures` | `product-hero.subtitle1` OR additional `rich-text` block |
| `categorie_source` | Used to group products; include in `meta.description` |
| `sous_categorie` | `product-hero.subtitle1` (more specific than category) |

**When building the page:**
1. Use `sous_categorie` as `subtitle1` if present, otherwise `categorie_source`
2. Use `mode_utilisation` as `subtitle2`
3. Format `description` as `<p>[text]</p>` in `product-hero.body`
4. For `composition_simplifiee`: if it looks like a list of `"ingredient: %"` pairs, use `key-value-list`; otherwise `rich-text`
5. For `dose`: if it has crop-specific rows, use `table` with "Culture" and "Dose" columns; if it's a single value, use `rich-text`

---

## Output format

Produce one JSON object per product. If given a batch of products, wrap them in an array:

```json
[
  { /* product 1 page JSON */ },
  { /* product 2 page JSON */ },
  ...
]
```

Each object is the full page JSON (with `slug`, `title`, `schemaVersion`, `meta`, `blocks.fr`, `blocks.en`).

---

## Adriatica example — ATRIUM ROOT

Given CSV row:
```
produit: ATRIUM ROOT
description: Stimulateur racinaire organique liquide. Stimule le développement racinaire profond et dense dès la germination.
composition_simplifiee: Extrait d'algues marines (Ascophyllum nodosum): 30% — Acides aminés hydrolysés: 15% — Azote organique (N): 4%
image: atrium-root.jpg
dose: Cultures horticoles: 6–10 L/ha (3–4 applications) / Arbres fruitiers: 5–10 L/ha (2–4 applications)
mode_utilisation: Liquide — Fertigation / Foliaire
cultures: Maraîchage, arboriculture, vigne
categorie_source: Stimulateurs
sous_categorie: Stimulateur racinaire
```

Expected JSON output (abbreviated — show full in your actual output):

```json
{
  "slug": "produit-atrium-root",
  "title": "ATRIUM ROOT",
  "status": "draft",
  "schemaVersion": 1,
  "meta": {
    "title": "ATRIUM ROOT — Adriatica",
    "description": "Stimulateur racinaire organique liquide pour maraîchage, arboriculture et vigne.",
    "noIndex": false
  },
  "blocks": {
    "fr": [
      {
        "id": "fr-ar-01-hero",
        "type": "product-hero",
        "order": 0,
        "data": {
          "title": "ATRIUM ROOT",
          "subtitle1": "Stimulateur racinaire",
          "subtitle2": "Liquide — Fertigation / Foliaire",
          "body": "<p>Stimulateur racinaire organique liquide. Stimule le développement racinaire profond et dense dès la germination.</p>",
          "image": "{{IMAGE:atrium-root.jpg}}",
          "imagePosition": "right",
          "ctaLabel": "Nous contacter",
          "ctaUrl": "/contact",
          "backgroundColor": "",
          "paddingTop": "lg",
          "paddingBottom": "lg"
        }
      },
      {
        "id": "fr-ar-02-comp-heading",
        "type": "section-heading",
        "order": 1,
        "data": {
          "heading": "Composition",
          "subheading": "",
          "size": "md",
          "align": "left",
          "showDivider": false,
          "paddingTop": "sm",
          "paddingBottom": "sm"
        }
      },
      {
        "id": "fr-ar-03-comp",
        "type": "key-value-list",
        "order": 2,
        "data": {
          "heading": "",
          "striped": true,
          "showDividers": true,
          "layout": "two-col",
          "items": [
            { "id": "kv-1", "label": "Extrait d'algues marines (Ascophyllum nodosum)", "value": "30 %" },
            { "id": "kv-2", "label": "Acides aminés hydrolysés", "value": "15 %" },
            { "id": "kv-3", "label": "Azote organique (N)", "value": "4 %" }
          ],
          "paddingTop": "none",
          "paddingBottom": "sm"
        }
      },
      {
        "id": "fr-ar-04-dose-heading",
        "type": "section-heading",
        "order": 3,
        "data": {
          "heading": "Doses et application",
          "subheading": "",
          "size": "md",
          "align": "left",
          "showDivider": false,
          "paddingTop": "sm",
          "paddingBottom": "sm"
        }
      },
      {
        "id": "fr-ar-05-table",
        "type": "table",
        "order": 4,
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
        "id": "fr-ar-06-cta",
        "type": "cta",
        "order": 5,
        "data": {
          "headline": "Besoin d'un conseil personnalisé ?",
          "body": "Notre équipe est à votre disposition pour vous accompagner.",
          "primaryLabel": "Nous contacter",
          "primaryUrl": "/contact",
          "background": "brand-red",
          "align": "center",
          "paddingTop": "lg",
          "paddingBottom": "lg"
        }
      }
    ],
    "en": [
      {
        "id": "en-ar-01-hero",
        "type": "product-hero",
        "order": 0,
        "data": {
          "title": "ATRIUM ROOT",
          "subtitle1": "Root stimulator",
          "subtitle2": "Liquid — Fertigation / Foliar",
          "body": "<p>Organic liquid root stimulator. Stimulates deep, dense root development from germination onwards.</p>",
          "image": "{{IMAGE:atrium-root.jpg}}",
          "imagePosition": "right",
          "ctaLabel": "Contact us",
          "ctaUrl": "/contact",
          "backgroundColor": "",
          "paddingTop": "lg",
          "paddingBottom": "lg"
        }
      },
      {
        "id": "en-ar-02-comp-heading",
        "type": "section-heading",
        "order": 1,
        "data": {
          "heading": "Composition",
          "subheading": "",
          "size": "md",
          "align": "left",
          "showDivider": false,
          "paddingTop": "sm",
          "paddingBottom": "sm"
        }
      },
      {
        "id": "en-ar-03-comp",
        "type": "key-value-list",
        "order": 2,
        "data": {
          "heading": "",
          "striped": true,
          "showDividers": true,
          "layout": "two-col",
          "items": [
            { "id": "kv-1", "label": "Seaweed extract (Ascophyllum nodosum)", "value": "30 %" },
            { "id": "kv-2", "label": "Hydrolysed amino acids", "value": "15 %" },
            { "id": "kv-3", "label": "Organic nitrogen (N)", "value": "4 %" }
          ],
          "paddingTop": "none",
          "paddingBottom": "sm"
        }
      },
      {
        "id": "en-ar-04-dose-heading",
        "type": "section-heading",
        "order": 3,
        "data": {
          "heading": "Application rates",
          "subheading": "",
          "size": "md",
          "align": "left",
          "showDivider": false,
          "paddingTop": "sm",
          "paddingBottom": "sm"
        }
      },
      {
        "id": "en-ar-05-table",
        "type": "table",
        "order": 4,
        "data": {
          "caption": "",
          "headers": ["Crop / Use", "Application Rate"],
          "rows": [
            ["Horticultural crops (market gardening)", "3 to 4 applications — 6 to 10 L/ha"],
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
        "id": "en-ar-06-cta",
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
    ]
  }
}
```

---

## Validation checklist (AI must verify before output)

- [ ] `slug` follows the `produit-[product-slug]` pattern (lowercase, hyphens, no spaces or special chars)
- [ ] `schemaVersion` is `1`
- [ ] All block IDs are unique within `"fr"` and within `"en"`; `"fr"` and `"en"` IDs never share the same value
- [ ] `order` is sequential starting from `0` within each block array
- [ ] All image fields use the `{{IMAGE:filename.ext}}` placeholder (never a bare filename or a guessed URL)
- [ ] `table.columnConfigs` has the same number of entries as `table.headers`; all `fieldKey` values are `null`
- [ ] `key-value-list` items each have a unique `"id"` field
- [ ] The JSON envelope does NOT contain `mode`, `templateKind`, `collectionId`, or `basePath`
- [ ] The output is valid JSON (no trailing commas, no comments)
- [ ] Both `"fr"` and `"en"` are present in `blocks`
