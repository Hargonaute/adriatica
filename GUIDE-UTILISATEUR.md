# Site Adriatica : guide d'utilisation

Ce guide couvre deux sujets :

1. **Créer et modifier des pages**
2. **Ajouter et gérer les produits**

Aucune connaissance technique n'est nécessaire.

> L'interface d'administration est en anglais. Les noms des boutons sont donc indiqués **tels qu'ils apparaissent à l'écran** (en anglais), avec leur explication en français.

---

## 0. Se connecter

1. Ouvrez l'adresse du site suivie de **`/dashboard/login`**.
2. Saisissez votre e-mail et votre mot de passe, puis cliquez sur **Sign in** (Se connecter).
3. **Première connexion ?** Changez votre mot de passe : allez sur **`/dashboard/account`**, saisissez votre mot de passe actuel puis deux fois le nouveau, et enregistrez.

> Mot de passe oublié ? Demandez à l'administrateur du site de le réinitialiser. Un mot de passe ne peut pas être récupéré, seulement remplacé.

---

## Partie 1 : Créer des pages

### 1.1 La liste des pages

Cliquez sur **Pages** dans le menu de gauche. Vous verrez deux groupes :

- **Pages** : les pages normales du site (y compris les pages produits).
- **Templates** (modèles) : des mises en page partagées. **Ne les modifiez pas sans savoir ce qu'elles font**, car elles touchent plusieurs pages à la fois.

Chaque page affiche un statut :

- **Draft** (brouillon) : visible uniquement par vous dans l'administration.
- **Published** (publiée) : visible par tout le monde sur le site.

Boutons sur chaque ligne :

- **Icône œil (View live page)** : ouvre la page publique dans un nouvel onglet (pages publiées uniquement).
- **Icône corbeille (Delete page)** : supprime la page. **Cette action est irréversible.**

### 1.2 Créer une nouvelle page

1. Dans **Pages**, cliquez sur **New Page** (Nouvelle page).
2. **Page Title** (titre de la page) : le nom de la page, par ex. *À propos*.
3. **URL Slug** (adresse) : la fin de l'adresse web. Il est rempli automatiquement à partir du titre, par ex. `a-propos`.
   - Utilisez uniquement des minuscules, des chiffres et des tirets. Pas d'espaces ni d'accents.
   - Pour une page produit, le slug **doit commencer par `produit-`** (voir Partie 2).
4. Cliquez sur **Create Page & Open Editor** (Créer la page et ouvrir l'éditeur).

Le titre et le slug peuvent être modifiés plus tard.

### 1.3 L'éditeur en un coup d'œil

```
┌───────────────────────────────────────────────────────────────────────┐
│ ← Pages   Nom de la page  [Draft]   Edit | Preview | JSON   ⚙ Settings  EN|FR  Save  Publish │
├──────────────┬────────────────────────────────────────────────────────┤
│  Blocs       │                                                         │
│  (ajouter    │        Votre page, composée de blocs empilés           │
│  des sections)│       de haut en bas                                   │
│              │                                                         │
├──────────────┴────────────────────────────────────────────────────────┤
│  Panneau de réglages du bloc sélectionné (s'ouvre au clic sur un bloc) │
└───────────────────────────────────────────────────────────────────────┘
```

Barre du haut, de gauche à droite :

| Bouton | Ce qu'il fait |
|---|---|
| **← Pages** | Retour à la liste des pages |
| **Draft / Published** | Statut actuel de la page (brouillon / publiée) |
| **Edit** | Construire la page (le mode normal) |
| **Preview** | Voir la page comme les visiteurs. Utilisez **Desktop / Tablet / Mobile** pour vérifier chaque taille d'écran. |
| **JSON** | Usage technique uniquement. Vous pouvez l'ignorer. |
| Icône **vue partagée** | Modifier à gauche et voir l'aperçu en direct à droite (nécessite un grand écran) |
| **⚙ Settings** | Titre, adresse, réglages Google (SEO) et **filtres produit** |
| **EN / FR** | Changer de langue. **Chaque langue a son propre contenu.** |
| **Save** | Enregistrer en brouillon. Les visiteurs ne le voient pas encore. |
| **Publish** | Mettre la page en ligne |
| **Unpublish** | Retirer la page du site (elle est conservée en brouillon) |

### 1.4 Ajouter du contenu avec des blocs

Une page est une pile de **blocs**. Chaque bloc est une section : un titre, du texte, une image, un bouton…

**Ajouter un bloc :**

1. Dans la **barre latérale gauche**, trouvez le bloc souhaité. Vous pouvez taper dans **Search blocks…** (rechercher).
2. Cliquez dessus. Il est ajouté à la page.

**Modifier un bloc :** cliquez dessus dans la page. Ses réglages s'ouvrent dans le panneau du bas : texte, images, couleurs, etc.

**Déplacer un bloc :** attrapez la poignée (⋮⋮) à gauche du bloc et faites-le glisser vers le haut ou le bas.

**Copier ou supprimer un bloc :** utilisez les boutons **Duplicate** (dupliquer) ou **Remove** (supprimer) du bloc.

#### Les blocs les plus utiles

| Bloc | À utiliser pour |
|---|---|
| **Hero** | Grande bannière en haut de page : titre, boutons, image |
| **Section Heading** | Un titre (avec sous-titre facultatif) pour démarrer une section |
| **Rich Text** | Paragraphes, listes, gras/italique, liens. Fonctionne comme un mini Word. |
| **Image** | Une image, avec une courte description (texte alternatif) et une légende facultative |
| **Video** | YouTube, Vimeo ou fichier vidéo |
| **Columns** | 2 à 4 encadrés côte à côte, chacun avec icône, titre et texte |
| **Table** | Un tableau en lignes et colonnes |
| **Key-Value List** | Des lignes « libellé · valeur », idéal pour la composition et les caractéristiques d'un produit |
| **Button** | Un bouton qui renvoie vers une autre page |
| **Download Button** | Un bouton qui télécharge un fichier (PDF, fiche technique…) |
| **Call to Action** | Un titre avec un ou deux boutons |
| **Product Hero** | Image du produit + nom + description + bouton, côte à côte |
| **Contact Form (Simple)** | Formulaire de contact avec une image |
| **Catalogue Download** | La bannière rouge avec le bouton de téléchargement du catalogue |
| **Spacer** | Ajoute un espace vide (et éventuellement une ligne) entre les blocs |
| **Container** | Regroupe plusieurs blocs côte à côte ou en grille |

### 1.5 Images et fichiers

- Dans un champ image, cliquez pour ouvrir la **médiathèque** : choisissez une image existante ou importez-en une nouvelle.
- Vous pouvez aussi gérer tous les fichiers dans **Assets** (menu de gauche).
- Renseignez toujours le **texte alternatif** de l'image (une courte description). Il aide Google et les visiteurs malvoyants.

### 1.6 Deux langues (EN / FR)

Le site existe en anglais et en français. **Les deux versions se modifient séparément.**

1. Construisez la page dans une langue.
2. Cliquez sur **FR** (ou **EN**) dans la barre du haut.
3. Ajoutez ou traduisez le contenu pour cette langue.

Si une langue reste vide, cette version de la page sera vide.

### 1.7 Réglages de la page (⚙ Settings)

- **Page Title / Slug** : nom et adresse web de la page.
- **Meta Title** : le titre affiché dans les résultats Google. Laissez vide pour reprendre le titre de la page.
- **Description** : le court texte affiché sous le titre dans Google. **160 caractères maximum.**
- **No Index** : activez pour cacher la page à Google.
- **OG Image URL** : l'image affichée quand la page est partagée sur LinkedIn, Facebook, WhatsApp… (1200 × 630 px).
- **Product filters** (filtres produit) : visibles uniquement sur les pages produits (voir Partie 2).

### 1.8 Enregistrer et publier

- L'éditeur **enregistre automatiquement un brouillon toutes les 30 secondes**. Vous pouvez aussi cliquer sur **Save** (ou appuyer sur **Ctrl+S** / **Cmd+S**).
- « **Unsaved changes** » dans la barre du haut signifie que des modifications ne sont pas encore enregistrées.
- **Enregistrer ne publie pas.** Les visiteurs ne voient la page qu'après un clic sur **Publish**.
- Après publication, une modification peut mettre **jusqu'à 1 minute** à apparaître sur le site. Rafraîchissez la page.

---

## Partie 2 : Les produits

### 2.1 Comment fonctionnent les produits

**Chaque produit est une page normale** dont l'adresse (slug) commence par **`produit-`**.

| Slug dans l'administration | Adresse publique |
|---|---|
| `produit-humiforte` | `/fr/produit/humiforte` |

Sur chaque page produit, la bannière **Catalogue** et le **formulaire de contact** sont **ajoutés automatiquement** en bas de page. Ne les ajoutez pas vous-même (s'ils sont ajoutés, ils sont de toute façon masqués).

Les produits apparaissent aussi sur la page **Trouver une solution** (`/fr/trouver-une-solution`), où les visiteurs les filtrent par **Famille**, **Problématique** et **Culture**.

### 2.2 Ajouter un nouveau produit

1. **Pages** → **New Page**.
2. **Page Title** : le nom du produit, par ex. *Humiforte*.
3. **URL Slug** : `produit-` + nom du produit, par ex. `produit-humiforte`.
   ⚠️ Sans `produit-` au début, la page **n'est pas** considérée comme un produit.
4. Cliquez sur **Create Page & Open Editor**.
5. Ajoutez des blocs. Une page produit type :
   1. **Product Hero** : image, nom et courte description du produit
   2. **Rich Text** : description complète et avantages
   3. **Key-Value List** : composition (par ex. *Azote (N) · 5 %*)
   4. **Table** : doses par culture (facultatif)
   5. **Download Button** : fiche technique (PDF)
6. Remplissez les **filtres produit** (section suivante).
7. Faites de même dans l'autre langue (**EN / FR**).
8. Cliquez sur **Publish**.

### 2.3 Filtres produit (Famille, Problématiques, Cultures)

Ils déterminent où le produit apparaît sur **Trouver une solution**.

1. Ouvrez la page produit dans l'éditeur.
2. Cliquez sur **⚙ Settings** dans la barre du haut.
3. Descendez jusqu'à **Product filters** :
   - **Famille** : choisissez **une seule** famille dans la liste.
   - **Problématiques** : cliquez sur **toutes** les problématiques traitées par le produit. Les éléments sélectionnés sont surlignés. Cliquez à nouveau pour désélectionner.
   - **Cultures** : cliquez sur **toutes** les cultures concernées.
4. Cliquez sur **Save**, puis sur **Publish**.

> La section **Product filters** n'apparaît que si le slug commence par `produit-`. Si vous ne la voyez pas, vérifiez le slug.
>
> Les filtres sont communs aux deux langues. Il suffit de les régler une fois.

**Familles disponibles :**

- Biostimulants et engrais organiques
- Correcteurs de carences
- Adjuvants et régulateurs de pH
- Engrais nutritionnels
- Engrais conventionnels

**Cultures disponibles :** Agrumes, Arbres fruitiers, Bananier, Céréales, Fraisier, Hydroponie, Maraîchage, Olivier, Ornementales, Pomme de terre, Tomate, Vigne.

### 2.4 Modifier un produit

1. **Pages** : trouvez la page dont le slug commence par `produit-`.
2. Cliquez dessus pour ouvrir l'éditeur.
3. Modifiez le texte, les images, les filtres…
4. Cliquez sur **Publish** pour mettre les modifications en ligne (**Save** seul ne suffit pas).

### 2.5 Retirer un produit

- **Pour le masquer temporairement :** ouvrez-le et cliquez sur **Unpublish**. Il disparaît du site et de *Trouver une solution*, mais il est conservé.
- **Pour le supprimer définitivement :** cliquez sur l'**icône corbeille** dans la liste des pages. Cette action est irréversible.

---

## Partie 3 : À ne pas faire (et quoi faire à la place)

Ce sont les erreurs les plus courantes. Chacune est suivie de la bonne pratique.

### Pages et adresses

**❌ Changer le slug d'une page déjà publiée**
L'ancienne adresse ne fonctionne plus : les liens partagés, les favoris et les résultats Google mènent vers une page d'erreur.
**✅ À la place :** choisissez le bon slug dès la création. S'il faut vraiment le changer, prévenez l'administrateur pour qu'il mette en place une redirection.

**❌ Supprimer une page pour la « cacher »**
La suppression est définitive : tout le contenu est perdu.
**✅ À la place :** cliquez sur **Unpublish**. La page disparaît du site mais reste disponible dans l'administration.

**❌ Modifier les Templates**
Un template est partagé par plusieurs pages : une erreur casse toutes ces pages en même temps.
**✅ À la place :** ne touchez qu'aux pages de la section **Pages**. Pour un changement de template, demandez à l'administrateur.

**❌ Écrire le slug avec des espaces, majuscules ou accents** (ex. `Produit Été`)
**✅ À la place :** minuscules, chiffres et tirets uniquement (ex. `produit-ete`).

### Enregistrer et publier

**❌ Cliquer sur Save et croire que c'est en ligne**
**Save** enregistre un brouillon que seuls les administrateurs voient.
**✅ À la place :** cliquez sur **Publish** pour mettre en ligne, puis vérifiez sur le site avec l'icône œil (après 1 minute environ).

**❌ Fermer l'onglet alors que « Unsaved changes » est affiché**
Les dernières modifications sont perdues. Le navigateur affiche normalement un avertissement : ne l'ignorez pas.
**✅ À la place :** cliquez sur **Save** (ou **Ctrl+S** / **Cmd+S**) avant de quitter, et attendez la confirmation « Saved ».

**❌ Modifier la même page à deux personnes en même temps**
Il n'y a pas de travail collaboratif : le dernier qui enregistre écrase le travail de l'autre.
**✅ À la place :** mettez-vous d'accord sur qui modifie quelle page, une personne à la fois.

**❌ Publier sans vérifier sur mobile**
La majorité des visiteurs consultent le site sur téléphone.
**✅ À la place :** avant de publier, passez en **Preview** et vérifiez **Desktop** puis **Mobile**.

### Langues

**❌ Ne remplir qu'une seule langue**
L'autre version de la page reste vide pour les visiteurs.
**✅ À la place :** après avoir terminé en français, cliquez sur **EN** et ajoutez la version anglaise (et inversement).

**❌ Mélanger les langues dans une même version** (texte français dans la version EN)
**✅ À la place :** vérifiez le bouton **EN / FR** actif en haut avant de taper du texte.

### Images et fichiers

**❌ Importer des photos très lourdes** (photos d'appareil photo ou de téléphone de plusieurs Mo)
Le site devient lent et l'import peut échouer.
**✅ À la place :** réduisez les images avant de les importer (moins de **1 Mo** et environ **2000 px** de large maximum). Des outils gratuits comme *squoosh.app* ou *tinypng.com* le font en un clic.

**❌ Laisser le texte alternatif vide**
**✅ À la place :** décrivez l'image en quelques mots (ex. « Bidon de Humiforte 5 L »). C'est bon pour Google et pour l'accessibilité.

**❌ Nommer les fichiers `IMG_4521.jpg` ou `fiche final v2 (1).pdf`**
**✅ À la place :** des noms clairs, sans espaces ni accents : `humiforte-bidon-5l.jpg`, `fiche-technique-humiforte.pdf`.

**❌ Utiliser des images trouvées sur Internet**
Elles peuvent être protégées par des droits d'auteur.
**✅ À la place :** utilisez uniquement les photos et visuels fournis par Adriatica.

### Contenu et mise en page

**❌ Copier-coller directement depuis Word ou un e-mail**
La mise en forme cachée (polices, couleurs, espacements) peut s'afficher bizarrement.
**✅ À la place :** collez le texte sans mise en forme (**Ctrl+Maj+V** / **Cmd+Maj+Option+V**), puis remettez le gras, les listes et les titres avec les outils du bloc **Rich Text**.

**❌ Ajouter des blocs Spacer pour « faire de la place »**
Les espacements sont déjà prévus entre les blocs ; trop d'espaces vides rendent la page déséquilibrée, surtout sur mobile.
**✅ À la place :** utilisez **Spacer** seulement en cas de besoin réel, et vérifiez le résultat en **Preview**.

**❌ Écrire des titres entiers en MAJUSCULES ou tout mettre en gras**
C'est plus difficile à lire et rien ne ressort plus.
**✅ À la place :** écrivez normalement et réservez le gras aux mots vraiment importants.

**❌ Écrire « cliquez ici » sur un bouton**
**✅ À la place :** dites où mène le bouton : « Télécharger la fiche technique », « Nous contacter ».

**❌ Laisser des boutons ou liens sans adresse, ou avec une adresse non testée**
**✅ À la place :** après publication, cliquez sur chaque bouton de la page pour vérifier qu'il mène au bon endroit.

### Produits

**❌ Oublier `produit-` au début du slug**
La page ne sera pas reconnue comme un produit : pas de filtres, pas d'apparition sur *Trouver une solution*.
**✅ À la place :** slug toujours au format `produit-nom-du-produit`.

**❌ Laisser les filtres vides ou en cocher trop « au cas où »**
Un produit sans filtres est introuvable ; un produit coché partout apparaît dans des recherches où il n'a rien à faire.
**✅ À la place :** une **Famille**, puis uniquement les **Problématiques** et **Cultures** réellement indiquées dans le catalogue.

**❌ Ajouter à la main les blocs Catalogue ou Formulaire de contact sur une page produit**
Ils sont déjà ajoutés automatiquement en bas de chaque page produit.
**✅ À la place :** ne mettez que le contenu propre au produit.

**❌ Créer deux pages pour le même produit**
Les visiteurs voient le produit en double et Google ne sait pas quelle page afficher.
**✅ À la place :** cherchez d'abord dans la liste **Pages** si le produit existe déjà, et modifiez-le.

### Compte et sécurité

**❌ Partager son mot de passe ou utiliser le compte d'un collègue**
**✅ À la place :** chaque personne a son propre compte. Demandez un accès à l'administrateur.

**❌ Garder le mot de passe provisoire reçu par e-mail**
**✅ À la place :** changez-le dès la première connexion sur `/dashboard/account`.

---

## Liste de vérification avant publication

- [ ] Le contenu est rempli **en EN et en FR**
- [ ] Toutes les images ont un **texte alternatif**
- [ ] Vérifié dans **Preview** en **Desktop** et **Mobile**
- [ ] Produit : le slug commence par **`produit-`**
- [ ] Produit : **Famille**, **Problématiques** et **Cultures** sont renseignées
- [ ] Clic sur **Publish** (pas seulement Save)

## Problèmes fréquents

| Problème | Solution |
|---|---|
| Mes modifications n'apparaissent pas sur le site | Avez-vous cliqué sur **Publish** ? Attendez 1 minute et rafraîchissez. |
| Le produit n'apparaît pas sur *Trouver une solution* | Vérifiez qu'il est **publié**, que le slug commence par `produit-` et que les filtres sont renseignés. |
| Je ne vois pas « Product filters » | Le slug ne commence pas par `produit-`. Corrigez-le dans **⚙ Settings**. |
| La page en français est vide | Le contenu est propre à chaque langue. Cliquez sur **FR** et ajoutez le contenu. |
| Je n'arrive pas à me connecter | Demandez à l'administrateur de réinitialiser votre mot de passe. |
