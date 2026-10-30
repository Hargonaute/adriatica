# Adriatica website: user guide

This guide covers two things:

1. **Building and editing pages**
2. **Adding and managing products**

No technical knowledge is needed.

---

## 0. Logging in

1. Open the website address followed by **`/dashboard/login`**.
2. Type your email and password, then click **Sign in**.
3. **First time?** Change your password: go to **`/dashboard/account`**, type your current password and your new password twice, then save.

> Forgot your password? Ask the site administrator to reset it. Passwords cannot be recovered, only replaced.

---

## Part 1: Building pages

### 1.1 The page list

Click **Pages** in the left menu. You will see two groups:

- **Pages**: normal website pages (including product pages).
- **Templates**: shared layouts. **Don't edit these unless you know what they do.** They affect many pages at once.

Each page shows a status:

- **Draft**: only visible to you in the dashboard.
- **Published**: visible to everyone on the website.

Buttons on each row:

- **Eye icon (View live page)**: opens the public page in a new tab (published pages only).
- **Bin icon (Delete page)**: deletes the page. **This cannot be undone.**

### 1.2 Creating a new page

1. In **Pages**, click **New Page**.
2. **Page Title**: the name of the page, e.g. *About us*.
3. **URL Slug**: the end of the web address. It is filled in automatically from the title, e.g. `about-us`.
   - Use only lowercase letters, numbers and dashes. No spaces or accents.
   - For a product page, the slug **must start with `produit-`** (see Part 2).
4. Click **Create Page & Open Editor**.

You can change the title and slug later.

### 1.3 The editor at a glance

```
┌───────────────────────────────────────────────────────────────────────┐
│ ← Pages   Page name  [Draft]   Edit | Preview | JSON    ⚙ Settings  EN|FR  Save  Publish │
├──────────────┬────────────────────────────────────────────────────────┤
│  Blocks      │                                                         │
│  (add new    │        Your page, made of blocks stacked               │
│   sections)  │        from top to bottom                               │
│              │                                                         │
├──────────────┴────────────────────────────────────────────────────────┤
│  Settings panel for the selected block (opens when you click a block)  │
└───────────────────────────────────────────────────────────────────────┘
```

Top bar, from left to right:

| Button | What it does |
|---|---|
| **← Pages** | Back to the page list |
| **Draft / Published** | Current status of the page |
| **Edit** | Build the page (the normal mode) |
| **Preview** | See the page as visitors will see it. Use **Desktop / Tablet / Mobile** to check each screen size. |
| **JSON** | For technical use only. You can ignore it. |
| **Split view** icon | Edit on the left and see a live preview on the right (needs a wide screen) |
| **⚙ Settings** | Page title, address, Google (SEO) settings and **product filters** |
| **EN / FR** | Switch language. **Each language has its own content.** |
| **Save** | Save your work as a draft. Visitors don't see it yet. |
| **Publish** | Put the page live on the website |
| **Unpublish** | Take the page off the website (it is kept as a draft) |

### 1.4 Adding content with blocks

A page is a stack of **blocks**. Each block is one section: a title, some text, an image, a button…

**To add a block:**

1. In the **left sidebar**, find the block you want. You can type in **Search blocks…**.
2. Click it. It is added to the page.

**To edit a block:** click it on the page. Its settings open in the panel at the bottom. Type text, pick images, change colours, etc.

**To move a block:** grab the handle (⋮⋮) on the left of the block and drag it up or down.

**To copy or delete a block:** use the **Duplicate** or **Remove** buttons on the block.

#### Most useful blocks

| Block | Use it for |
|---|---|
| **Hero** | Big banner at the top of a page: headline, buttons, image |
| **Section Heading** | A title (with optional subtitle) to start a section |
| **Rich Text** | Paragraphs, lists, bold/italic, links. Works like a mini Word. |
| **Image** | One picture, with a short description (alt text) and optional caption |
| **Video** | YouTube, Vimeo, or video file |
| **Columns** | 2 to 4 boxes side by side, each with icon, title and text |
| **Table** | A table of rows and columns |
| **Key-Value List** | "Label · value" rows, ideal for product specs and composition |
| **Button** | A single button that links somewhere |
| **Download Button** | A button that downloads a file (PDF, technical sheet…) |
| **Call to Action** | Headline with one or two buttons |
| **Product Hero** | Product image + name + description + button, side by side |
| **Contact Form (Simple)** | Contact form with an image |
| **Catalogue Download** | The red banner with the catalogue download button |
| **Spacer** | Adds empty space (and optionally a line) between blocks |
| **Container** | Groups several blocks side by side or in a grid |

### 1.5 Images and files

- In any image field, click to open the **media library** and pick an existing image or upload a new one.
- You can also manage all files in **Assets** in the left menu.
- Always fill in the image **alt text** (a short description). It helps Google and visually impaired visitors.

### 1.6 Two languages (EN / FR)

The site has an English and a French version. **They are edited separately.**

1. Build the page in one language.
2. Click **FR** (or **EN**) in the top bar.
3. Add or translate the content for that language.

If a language is left empty, that version of the page will be empty.

### 1.7 Page settings (⚙ Settings)

- **Page Title / Slug**: name and web address of the page.
- **Meta Title**: the title shown in Google results. Leave empty to use the page title.
- **Description**: the short text under the title in Google. Keep it under **160 characters**.
- **No Index**: turn on to hide the page from Google.
- **OG Image URL**: the image shown when the page is shared on LinkedIn, Facebook, WhatsApp… (1200 × 630 px).
- **Product filters**: only shown on product pages (see Part 2).

### 1.8 Saving and publishing

- The editor **saves a draft automatically every 30 seconds**. You can also click **Save** (or press **Ctrl+S** / **Cmd+S**).
- "**Unsaved changes**" in the top bar means something hasn't been saved yet.
- **Saving does not publish.** Visitors only see the page after you click **Publish**.
- After you publish a change, it can take **up to 1 minute** to appear on the live site. Refresh the page.

---

## Part 2: Products

### 2.1 How products work

**Every product is a normal page** whose address (slug) starts with **`produit-`**.

| Slug in the dashboard | Public address |
|---|---|
| `produit-humiforte` | `/fr/produit/humiforte` |

On every product page, the **Catalogue** banner and the **Contact form** are **added automatically** at the bottom. Don't add them yourself (if you do, they are hidden anyway).

Products also appear on the **Trouver une solution** page (`/fr/trouver-une-solution`), where visitors filter them by **Famille**, **Problématique** and **Culture**.

### 2.2 Adding a new product

1. **Pages** → **New Page**.
2. **Page Title**: the product name, e.g. *Humiforte*.
3. **URL Slug**: `produit-` + product name, e.g. `produit-humiforte`.
   ⚠️ Without `produit-` at the start, the page is **not** treated as a product.
4. Click **Create Page & Open Editor**.
5. Add blocks. A typical product page:
   1. **Product Hero**: product image, name, short description
   2. **Rich Text**: full description and benefits
   3. **Key-Value List**: composition (e.g. *Azote (N) · 5 %*)
   4. **Table**: doses per crop (optional)
   5. **Download Button**: technical sheet (PDF)
6. Fill in the **product filters** (next section).
7. Do the same in the other language (**EN / FR**).
8. Click **Publish**.

### 2.3 Product filters (Famille, Problématiques, Cultures)

These decide where the product shows up on **Trouver une solution**.

1. Open the product page in the editor.
2. Click **⚙ Settings** in the top bar.
3. Scroll to **Product filters**:
   - **Famille**: pick **one** product family from the list.
   - **Problématiques**: click **all** the problems the product solves. Selected items are highlighted. Click again to unselect.
   - **Cultures**: click **all** the crops the product is for.
4. Click **Save**, then **Publish**.

> The **Product filters** section only appears when the slug starts with `produit-`. If you don't see it, check the slug.
>
> Filters are the same for both languages. You only set them once.

**Families available:**

- Biostimulants et engrais organiques
- Correcteurs de carences
- Adjuvants et régulateurs de pH
- Engrais nutritionnels
- Engrais conventionnels

**Crops available:** Agrumes, Arbres fruitiers, Bananier, Céréales, Fraisier, Hydroponie, Maraîchage, Olivier, Ornementales, Pomme de terre, Tomate, Vigne.

### 2.4 Editing a product

1. **Pages**: find the page whose slug starts with `produit-`.
2. Click it to open the editor.
3. Change text, images, filters…
4. Click **Publish** to put the changes live (**Save** alone is not enough).

### 2.5 Removing a product

- **To hide it temporarily:** open it and click **Unpublish**. It disappears from the website and from *Trouver une solution*, but you keep it.
- **To delete it for good:** click the **bin icon** in the page list. This cannot be undone.

---

## Quick checklist before publishing

- [ ] Content is filled in **both EN and FR**
- [ ] All images have an **alt text**
- [ ] Checked in **Preview** on **Desktop** and **Mobile**
- [ ] Product: slug starts with **`produit-`**
- [ ] Product: **Famille**, **Problématiques** and **Cultures** are set
- [ ] Clicked **Publish** (not just Save)

## Common problems

| Problem | Solution |
|---|---|
| My changes don't show on the website | Did you click **Publish**? Wait 1 minute and refresh. |
| The product isn't on *Trouver une solution* | Check it is **Published**, the slug starts with `produit-`, and the filters are set. |
| I don't see "Product filters" | The slug doesn't start with `produit-`. Fix it in **⚙ Settings**. |
| The French page is empty | Content is per language. Click **FR** and add the content. |
| I can't log in | Ask the administrator to reset your password. |
