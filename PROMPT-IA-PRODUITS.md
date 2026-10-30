# Créer une page produit avec ChatGPT ou Claude

Ce document explique comment créer une page produit **sans construire les blocs à la main** : une IA (ChatGPT ou Claude) écrit la page à votre place, au format « JSON », et vous n'avez plus qu'à **copier-coller** ce texte dans l'administration.

Durée : environ 5 minutes par produit.

---

## Étape 1 : Importer l'image du produit

L'IA ne peut pas importer d'image sur le site. Vous le faites vous-même, et vous lui donnez ensuite l'**adresse** (URL) de l'image.

1. Préparez l'image : format **JPG ou PNG**, moins de **1 Mo**, nom clair (ex. `humiforte.jpg`).
2. Dans l'administration, cliquez sur **Assets** dans le menu de gauche.
3. Importez l'image.
4. Sous l'image importée, cliquez sur **Copy URL**. L'adresse est copiée. Elle ressemble à :
   `https://2pzx9a0778lya5md.public.blob.vercel-storage.com/humiforte-Ab12Cd.jpg`
5. Gardez-la de côté (collez-la dans un bloc-notes) : vous la donnerez à l'IA à l'étape 3.

> **Pas d'image pour l'instant ?** Pas de problème : dites à l'IA « pas d'image ». Vous pourrez l'ajouter plus tard dans l'éditeur en cliquant sur le bloc **Product Hero** puis sur le champ image.

---

## Étape 2 : Créer la page vide

1. **Pages** → **New Page**.
2. **Page Title** : le nom du produit (ex. *Humiforte*).
3. **URL Slug** : `produit-` + nom du produit en minuscules, avec des tirets (ex. `produit-humiforte`).
   ⚠️ Le slug doit **obligatoirement** commencer par `produit-`.
4. Cliquez sur **Create Page & Open Editor**.

---

## Étape 3 : Demander le JSON à l'IA

1. Ouvrez **ChatGPT** (chatgpt.com) ou **Claude** (claude.ai).
2. Copiez **tout le bloc « PROMPT À COPIER »** ci-dessous (de `=== DÉBUT DU PROMPT ===` à `=== FIN DU PROMPT ===`).
3. Collez-le dans la conversation.
4. **Juste en dessous**, remplissez la fiche produit (modèle à la fin du prompt) : nom, description, composition, doses, cultures, URL de l'image…
   Vous pouvez aussi coller le texte de la fiche technique ou du catalogue : l'IA le réorganisera.
5. Envoyez. L'IA répond avec un bloc de code JSON.
6. Cliquez sur le bouton **Copier** du bloc de code (en haut à droite du bloc).

---

## Étape 4 : Coller le JSON dans la page

1. Revenez dans l'éditeur de la page créée à l'étape 2.
2. En haut, cliquez sur l'onglet **JSON**.
3. Dans la zone **Import JSON**, collez le texte (**Ctrl+V** / **Cmd+V**) à la place de « Paste JSON here… ».
4. Cliquez sur **Apply JSON to page**.
5. L'éditeur revient sur **Edit** et affiche la page. Vérifiez :
   - le contenu en **FR**, puis en **EN** ;
   - l'image ;
   - **⚙ Settings → Product filters** : Famille, Problématiques et Cultures doivent être cochées.
6. Corrigez si besoin directement dans les blocs.
7. Cliquez sur **Save**, puis sur **Publish**.

> ⚠️ **Apply JSON to page remplace tout le contenu de la page.** Ne l'utilisez pas sur une page produit déjà terminée, sauf si vous voulez la refaire entièrement.

### En cas de message d'erreur

| Message | Que faire |
|---|---|
| `Not valid JSON…` | Le texte copié est incomplet. Recopiez **uniquement** le bloc de code de l'IA (pas les phrases autour). Ou demandez à l'IA : « Ton JSON n'est pas valide, renvoie-le corrigé. » |
| `Unrecognised shape…` | L'IA n'a pas suivi le format. Écrivez-lui : « Respecte exactement le format de l'exemple du prompt. » |
| La page est vide en FR ou EN | Demandez à l'IA : « Il manque la version FR (ou EN), ajoute-la. » |

---

## PROMPT À COPIER

```text
=== DÉBUT DU PROMPT ===

Tu es un assistant qui crée des pages produits pour le site d'Adriatica (engrais, biostimulants, correcteurs de carences). Tu dois produire UNIQUEMENT un bloc de code JSON valide, que je vais coller dans notre outil de création de pages. Aucune phrase avant ou après le bloc de code.

## Format exact à respecter

{
  "title": "NOM DU PRODUIT",
  "meta": {
    "title": "NOM DU PRODUIT — Adriatica",
    "description": "Une phrase de 160 caractères maximum, en français, qui résume le bénéfice principal.",
    "noIndex": false,
    "product": {
      "famille": "…",
      "problematiques": ["…"],
      "cultures": ["…"]
    }
  },
  "blocks": {
    "fr": [ …blocs en français… ],
    "en": [ …les mêmes blocs traduits en anglais… ]
  }
}

## Blocs à utiliser, dans cet ordre (pour "fr" ET pour "en")

1. product-hero (obligatoire)
{
  "id": "fr-1",
  "type": "product-hero",
  "order": 0,
  "data": {
    "title": "NOM DU PRODUIT",
    "subtitle1": "Accroche courte, ex. Biostimulant racinaire intensif",
    "subtitle2": "",
    "body": "<p><strong>Description :</strong></p><ul><li>Bénéfice 1</li><li>Bénéfice 2</li><li>Bénéfice 3</li></ul>",
    "image": "URL DE L'IMAGE, ou \"\" s'il n'y en a pas",
    "imagePosition": "right",
    "ctaLabel": "Télécharger Catalogue 2026",
    "ctaUrl": "/catalogue-adriatica-2026.pdf",
    "backgroundColor": "",
    "align": "left",
    "maxWidth": "full",
    "background": "none",
    "paddingTop": "none",
    "paddingBottom": "none"
  }
}

2. section-heading « Mode d'utilisation »
{
  "id": "fr-2",
  "type": "section-heading",
  "order": 1,
  "data": {
    "heading": "Mode d'utilisation",
    "subheading": "",
    "size": "lg",
    "align": "left",
    "showDivider": false,
    "dividerColor": "",
    "maxWidth": "full",
    "background": "none",
    "paddingTop": "sm",
    "paddingBottom": "sm"
  }
}

3. rich-text (forme, application, cultures)
{
  "id": "fr-3",
  "type": "rich-text",
  "order": 2,
  "data": {
    "content": "<p><strong>Forme :</strong> Liquide</p><p><strong>Application :</strong> Fertigation</p><p><strong>Cultures :</strong> …</p>",
    "align": "left",
    "maxWidth": "full",
    "background": "none",
    "paddingTop": "none",
    "paddingBottom": "none"
  }
}

4. table (doses par culture) — à omettre s'il n'y a aucune dose
{
  "id": "fr-4",
  "type": "table",
  "order": 3,
  "data": {
    "caption": "",
    "headers": ["Culture / Usage", "Dose"],
    "rows": [
      ["Cultures horticoles", "3–4 applications, 6–10 L/ha"],
      ["Arbres fruitiers, agrumes, vigne", "2–4 applications, 5–10 L/ha"]
    ],
    "striped": false,
    "bordered": true,
    "columnConfigs": [
      { "type": "text", "fieldKey": null },
      { "type": "text", "fieldKey": null }
    ],
    "align": "left",
    "maxWidth": "full",
    "background": "none",
    "paddingTop": "none",
    "paddingBottom": "none"
  }
}

5. section-heading « Composition du produit » (même format que le bloc 2, "order": 4)

6. key-value-list (composition) — à omettre s'il n'y a aucune composition
{
  "id": "fr-6",
  "type": "key-value-list",
  "order": 5,
  "data": {
    "heading": "",
    "items": [
      { "id": "kv-1", "label": "Azote total (N)", "value": "7,7 %" },
      { "id": "kv-2", "label": "Matière organique totale", "value": "37 %" }
    ],
    "layout": "two-col",
    "striped": true,
    "showDividers": true,
    "align": "left",
    "maxWidth": "full",
    "background": "none",
    "paddingTop": "none",
    "paddingBottom": "none"
  }
}

## Version anglaise ("en")

Mêmes blocs, même ordre, texte traduit en anglais professionnel. Valeurs fixes en anglais :
- ctaLabel : "Download 2026 Catalogue" (ctaUrl identique)
- titres de section : "How to use" et "Product composition"
- en-têtes du tableau : ["Crop / Use", "Application rate"]
- "Forme / Application / Cultures" → "Form / Application / Crops"
Les "id" anglais doivent être différents des français : "en-1", "en-2", etc.
Le nom du produit et l'URL de l'image ne se traduisent pas.

## Filtres produit (meta.product) — valeurs AUTORISÉES uniquement

Recopie les valeurs EXACTEMENT comme écrites ci-dessous (majuscules, accents, tirets). N'invente aucune valeur.

"famille" : UNE seule valeur parmi :
- Biostimulants et engrais organiques
- Correcteurs de carences
- Adjuvants et régulateurs de pH
- Engrais nutritionnels
- Engrais conventionnels

"problematiques" : une ou plusieurs valeurs parmi :
- Stimulation de racines, croissance végétative & anti-stress
- Anti-stress & résistance aux conditions difficiles
- Amélioration du sol (structure – MO – microbiologie) & anti-stress
- Correcteurs de carences en fer
- Correcteurs de carences en bore
- Correcteurs de carences en cuivre
- Correcteur de carence en zinc
- Correcteur de carence en molybdène
- Correcteur de carence en calcium
- Correcteur complet d’oligo-éléments (B, Cu, Fe, Mn, Mo, Zn)
- Régulateurs de pH & conditionneurs de bouillie
- Acidifiants & correcteurs de pH
- Boosters potassiques
- Floraison – nouaison – amélioration des fruits
- Troubles physiologiques des plantes
- Désalinisant & solutions calcio-potassiques
- Conventionnel granulé
- Conventionnel hydrosolubles
- NPK hydrosolubles

"cultures" : une ou plusieurs valeurs parmi :
Agrumes, Arbres fruitiers, Bananier, Céréales, Fraisier, Hydroponie, Maraîchage, Olivier, Ornementales, Pomme de terre, Tomate, Vigne

Si une information de filtre n'est pas fournie et ne peut pas être déduite avec certitude, laisse la liste vide ([]) ou "famille": "" — ne devine pas.

## Règles importantes

- Réponds UNIQUEMENT avec le bloc de code JSON, rien d'autre.
- JSON strictement valide : guillemets doubles, pas de virgule finale, pas de commentaires.
- N'ajoute PAS de blocs "catalogue", "contact-form-simple" ou "cta" : le site les ajoute automatiquement en bas de chaque page produit.
- N'invente AUCUNE donnée technique (dose, composition, pourcentage). Utilise uniquement ce que je te donne. S'il manque une information, omets le bloc concerné.
- Le texte des champs "body" et "content" est du HTML simple : <p>, <strong>, <ul>, <li> uniquement.
- "order" commence à 0 et suit l'ordre des blocs, sans trou.

## Fiche produit

Nom du produit :
URL de l'image (ou « pas d'image ») :
Accroche courte :
Description / bénéfices :
Forme (liquide, poudre, granulé…) :
Application (fertigation, foliaire…) :
Cultures concernées :
Doses par culture :
Composition :
Famille :
Problématiques :

=== FIN DU PROMPT ===
```

---

## Astuces

- **Plusieurs produits ?** Faites-les **un par un** : une conversation, un produit, une page. Les risques d'erreur sont bien plus faibles.
- **Relisez toujours** les chiffres (doses, pourcentages) avant de publier : l'IA peut se tromper en recopiant.
- **Vous n'êtes pas sûr de la Famille ou des Problématiques ?** Laissez-les vides dans la fiche, puis choisissez-les vous-même dans **⚙ Settings → Product filters** après l'import.
- **Modifier un produit existant** : ne repassez pas par l'IA. Modifiez directement les blocs dans l'éditeur.
