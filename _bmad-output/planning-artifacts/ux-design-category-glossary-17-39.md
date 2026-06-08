---
title: UX — Catégories spectacle (sélection + admin glossaire)
author: Sally (UX) + Patrice
date: '2026-06-08'
amended: '2026-06-08'
status: draft
relatedArtifacts:
  - _bmad-output/planning-artifacts/sprint-change-proposal-2026-06-08-category-glossary-ux.md
  - _bmad-output/planning-artifacts/ux-design-journey-league-agenda.md
  - _bmad-output/planning-artifacts/ux-design-scope-admin-menu-epic17.md
  - apps/web/src/app/pages/event-detail/event-infos-tab.html
  - apps/web/src/app/pages/event-detail/event-category-dialog.ts
  - docs/v2/technical/FRONTEND_UI.md
  - docs/adr/0013-troupe-navigation-equity-tags-event-slugs.md
stories:
  - '17.38'
  - '17.39'
  - '17.40'
stakeholderDecisions:
  - spectacle-ordinaire-null-deplacements-visible-supprimable
  - admin-crud-orga-select-only
  - discoverability-link-on-infos-navigates-to-troupe-settings-categories-tab
  - admin-crud-on-troupe-settings-page-not-modals
  - delete-impact-count-required
---

# UX Design — Catégories spectacle (Screen 6b v3)

**Purpose:** Remplacer l’autocomplete « tag » par une **sélection explicite** (modale radio). La **gestion admin** vit sur **Paramètres troupe → onglet Catégories** ; le lien **« Gérer les catégories »** (Infos + modale S2) **navigue** vers cette page (option B découvrabilité).

**Contexte :** [SCP 2026-06-08](sprint-change-proposal-2026-06-08-category-glossary-ux.md) · **17.38** (API) · **17.39** (sélection Infos) · **17.40** (paramètres troupe).

**Preview visuelle :** [`_bmad-output/previews/category-glossary-ux-mockup.html`](../previews/category-glossary-ux-mockup.html)

---

## Problème (constat terrain)

| Point | Constat |
|-------|---------|
| **Affordance** | Le chip « Spectacle ordinaire » ressemble à un libellé statique — pas au pattern actionnable déjà utilisé pour Date / Lieu sur le même onglet. |
| **Modèle mental** | L’autocomplete évoque des **tags libres** ; le produit veut un **vocabulaire contrôlé** (dizaines d’entrées, pas des milliers). |
| **Gouvernance** | Créer une catégorie en tapant sur un spectacle invite aux doublons (`Apérock` / `Aperock`). La curation appartient aux **admins troupe**. |
| **Suppression** | L’admin doit **voir l’impact** avant de supprimer une catégorie (spectacles repassés en ordinaire). |

---

## Principes de design

1. **Alignement Infos** — réutiliser le pattern `event-infos__action-row` (Date, Lieu) pour la catégorie courante : une seule ligne cliquable, chevron, 48 dp.
2. **Liste complète, zéro frappe** — la modale affiche **toutes** les options ; pas de champ texte en MVP (< ~15 catégories typiques).
3. **Deux vitesses** — orga **choisit** ; admin **curate** (créer / renommer / supprimer).
4. **Découvrabilité + cohérence** — lien **« Gérer les catégories »** sur Infos **et** dans S2 → **navigation** vers la page paramètres (onglet Catégories), pas de modale admin empilée.
5. **Extensibilité** — shell **Paramètres troupe** avec onglets (`mat-tab-group`) : **Catégories** (MVP) ; **Formules** / **Rôles** réservés (Epic 19+, futur).
6. **Material 3** — `mat-radio-group`, `MatDialog`, `mat-tab-group`, tokens `--mat-sys-*` ; checklist [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md).

---

## Surfaces

| Surface | Rôle | Composant / route |
|---------|------|-------------------|
| **S1** — Section Catégorie (Infos) | Valeur + sélection ; lien admin → paramètres | `event-infos-tab` |
| **S2** — Dialog sélection | Choisir une catégorie pour ce spectacle | `EventCategoryDialog` (refonte) |
| **S3** — Page Paramètres troupe · onglet **Catégories** | CRUD admin glossaire | `TroupeSettingsPage` + `CategoriesTab` (**17.40**) |
| **S4** — Dialog confirmation suppression | Impact + confirm (sur S3) | `MatDialog` alert pattern |

### Entrées vers S3

| Origine | Action |
|---------|--------|
| **S1** — lien « Gérer les catégories » | `router.navigate` → paramètres, onglet Catégories |
| **S2** — même lien (admin) | Ferme S2 puis même navigation |
| **Hub troupe** — gear ⚙ → **Paramètres troupe** | Ouvre S3 (onglet par défaut ou dernier visité — MVP : Catégories si seul onglet actif) |
| **Retour navigateur** | Depuis S3, retour au spectacle Infos si l’utilisateur venait de S1/S2 |

---

## S1 — Section Catégorie (onglet Infos)

### Structure (identique Format / Organisateur·ices)

```
CATÉGORIE
Choisis la catégorie dans laquelle ce spectacle comptera…

┌─────────────────────────────────────────────┐
│  category          Spectacle ordinaire    ▾ │  ← action-row (orga)
└─────────────────────────────────────────────┘

  Gérer les catégories                        ← lien admin seulement
```

### Règles

| Élément | Règle |
|---------|-------|
| **Label section** | `CATÉGORIE` — `event-infos__label` |
| **Help inline** | Constante `CATEGORY_HELP` — inchangée |
| **Valeur courante** | `button.event-infos__action-row` — **remplace le chip** |
| **Icône gauche** | `category` ou `label` (Material Symbols) — optionnel, même taille que Date/Lieu |
| **Texte** | Libellé glossaire ou **Spectacle ordinaire** si `category` null |
| **Chevron** | `expand_more` à droite — indique ouverture modale |
| **Interaction** | Clic → **S2** ; `aria-label="Changer la catégorie"` |
| **Lecture seule** | Membre sans `canManageEvents` : `action-row--disabled`, pas de chevron actif |
| **Retrait rapide** | **Supprimé** — plus de `×` sur le chip. Revenir à ordinaire = choisir **Spectacle ordinaire** dans S2 (évite double affordance). |

### Lien admin

| Élément | Règle |
|---------|-------|
| **Visibilité** | `canManageTroupe` uniquement |
| **Style** | Même classe que **« Ajouter un·e organisateur·ice »** — `.event-infos__add-organizer` |
| **Libellé** | **Gérer les catégories** |
| **Action** | **Navigation** vers `/troupes/{troupeSlug}/admin/parametres?tab=categories` (ferme rien — pas de modale ouverte) |
| **Placement** | Sous l’action-row, aligné à gauche |
| **Icône** | `settings` (comme mockup) — optionnel, même style que lien organisateur |

---

## S2 — Dialog sélection (organisateur·ice)

### Wireframe mobile

```
┌─────────────────────────────────────┐
│ Catégorie                        ✕  │
├─────────────────────────────────────┤
│ Choisis la catégorie dans laquelle  │
│ ce spectacle comptera pour les      │
│ statistiques et les tirages.        │
│                                     │
│ ○ Spectacle ordinaire               │
│ ● Déplacements                      │
│ ○ Apérock                           │
│                                     │
│ Gérer les catégories                │  ← admin only, text button
├─────────────────────────────────────┤
│              Annuler    Enregistrer │
└─────────────────────────────────────┘
```

### Composants Material

| Élément | Implémentation |
|---------|----------------|
| **Conteneur** | `MatDialog` — `min-width: min(32rem, calc(100vw - 3rem))` |
| **Titre** | `mat-dialog-title` — **Catégorie** |
| **Intro** | Paragraphe `on-surface-variant` — copy `CATEGORY_HELP` (pas de `mat-form-field`) |
| **Liste** | `mat-radio-group` + `mat-radio-button` par option |
| **Ordre options** | 1) **Spectacle ordinaire** (`value=null`) · 2) **Déplacements** (si présent glossaire) · 3) custom **A→Z** par `label` |
| **Pré-sélection** | Valeur courante de l’événement |
| **Actions** | `mat-dialog-actions align="end"` — **Annuler** (`mat-button`) · **Enregistrer** (`mat-flat-button color="primary"`) |
| **Admin link** | Même libellé/style que S1 : **Gérer les catégories** → **ferme S2** (`dialogRef.close()`) puis `router.navigate` vers paramètres · onglet Catégories |

### Comportement

- **Enregistrer** → PATCH `category: slug | null` ; snackbar « Catégorie enregistrée » / retour ordinaire.
- **Aucune option cochée** → traiter comme ordinaire (ou désactiver Enregistrer si identique à l’état initial).
- **Liste vide custom** → au minimum ordinaire + déplacements.
- **Hors scope MVP** : recherche / filtre (seulement si > 10 entrées — reporter).

### Accessibilité

- `mat-radio-group` avec `aria-labelledby` pointant vers le titre.
- Chaque radio : libellé visible ; pas de slug technique exposé.
- Focus trap dialog ; Échap = Annuler.

---

## S3 — Page Paramètres troupe · onglet Catégories (admin)

**Route (proposée) :** `/troupes/:troupeSlug/admin/parametres?tab=categories`  
**Story :** **17.40** (shell page + onglet ; formules/rôles = onglets placeholder ou absents en MVP).

### Wireframe mobile

```
┌─────────────────────────────────────┐
│ ← Les Improbots                     │  breadcrumb / app bar
├─────────────────────────────────────┤
│ Paramètres troupe                   │
│                                     │
│ [ Catégories ]  Formules   Rôles    │  ← mat-tab-group (Formules/Rôles disabled ou hidden MVP)
│ ─────────────────────────────────── │
│ Les catégories séparent les stats   │
│ et les tirages par compartiment.    │
│                                     │
│ Déplacements              ✎    🗑  │
│ Apérock                   ✎    🗑  │
│                                     │
│ [ + Ajouter une catégorie ]         │
└─────────────────────────────────────┘
```

### Shell page (extensible)

| Élément | Règle |
|---------|-------|
| **Titre page** | **Paramètres troupe** |
| **Onglets MVP** | **Catégories** (actif) — seul onglet implémenté en **17.40** |
| **Onglets futurs** | **Formules** (Epic 19.19–19.21), **Rôles** (FR14+) — visibles en grisé / « Bientôt » **ou** masqués jusqu’à story dédiée (choix dev : masquer = moins de bruit) |
| **Recommandation Sally** | **Masquer** les onglets non implémentés en MVP ; ajouter au fur et à mesure des epics — le shell `mat-tab-group` reste prêt côté routing |
| **Accès** | `requireCanManageTroupe` ; sinon 403 / redirect hub |
| **Chrome** | Aligné admin back-office existant (breadcrumb troupe, pas de rail membre si pattern admin pages) |
| **Gear hub** | Entrée **Paramètres troupe** dans [scope admin menu](ux-design-scope-admin-menu-epic17.md) Screen 3 |

### Liste (onglet Catégories)

| Colonne | Règle |
|---------|-------|
| **Libellé** | `label` du glossaire |
| **Éditer** | `mat-icon-button` `edit` → sous-formulaire inline ou mini-dialog |
| **Supprimer** | `mat-icon-button` `delete` → **S4** |

**Entrées non supprimables via UI :** aucune — **Déplacements** est supprimable (décision PO) avec cascade ordinaire.

**Spectacle ordinaire** n’apparaît **pas** dans cette liste (ce n’est pas une entrée glossaire).

### Ajouter / modifier

**Formulaire (inline sur la page ou mini-dialog sur S3) :**

| Champ | Règle |
|-------|-------|
| **Libellé** | Requis — ex. « Apérock » |
| **Identifiant (slug)** | Visible **à la création** seulement ; pré-rempli depuis libellé ; éditable avant enregistrement ; **immuable** après création |
| **Aide slug** | *« Utilisé en interne ; préfère un nom court sans accents. »* |
| **Validation** | Slug normalisé ; rejet `principal` ; doublon → erreur FR |

**Actions formulaire :** Annuler · **Enregistrer**

---

## S4 — Confirmation suppression (contexte : page S3)

Dialog **par-dessus** l’onglet Catégories — pas de navigation supplémentaire.

### Wireframe

```
┌─────────────────────────────────────┐
│ Supprimer « Apérock » ?             │
├─────────────────────────────────────┤
│ ⚠ 3 spectacles utilisent cette      │
│   catégorie. Ils seront basculés    │
│   en Spectacle ordinaire.           │
│                                     │
│ Cette action est irréversible.      │
├─────────────────────────────────────┤
│         Annuler      Supprimer      │
└─────────────────────────────────────┘
```

| Élément | Règle |
|---------|-------|
| **Titre** | `Supprimer « {label} » ?` |
| **Impact** | **`{eventCount}` spectacles** — chargé via API preview **avant** affichage (spinner si lent) |
| **Copy impact** | *« {n} spectacle(s) utilisent cette catégorie. Ils seront basculés en Spectacle ordinaire. »* |
| **0 spectacles** | *« Aucun spectacle n’utilise cette catégorie. »* — bouton Supprimer reste actif |
| **Bouton destructif** | `mat-flat-button color="warn"` — **Supprimer** |
| **Succès** | Snackbar « Catégorie supprimée » ; rafraîchir glossaire ; si S2 ouvert plus tard, liste à jour |

---

## Parcours (protagoniste : Léa, admin + orga)

1. Léa ouvre un spectacle → onglet **Infos** → ligne Catégorie **Spectacle ordinaire** ▾.
2. Elle tape la ligne → **S2** → choisit **Apérock** → **Enregistrer** → snackbar OK.
3. Elle tape **Gérer les catégories** (S1) → **navigation** → **S3** onglet Catégories → **Ajouter** « Festival ».
4. Retour navigateur → spectacle Infos ; la liste S2 inclut « Festival » au prochain open.
5. Sur S3, elle supprime « Apérock » → **S4** : **12 spectacles** → confirme → cascade API.

**Climax :** le compteur S4 sur la page paramètres ; le lien Infos évite de « chercher » les paramètres dans le gear menu.

---

## États & edge cases

| État | Comportement |
|------|--------------|
| **Chargement glossaire** | S2 : skeleton 2–3 lignes radio ; S3 : `mat-progress-bar` |
| **Erreur API** | Snackbar FR ; conserver sélection locale |
| **Orga non admin** | Pas de lien « Gérer » ; S2 sans lien admin |
| **Admin seulement** | Peut ouvrir S3 via gear hub ou lien Infos |
| **Deep link `?tab=categories`** | Onglet Catégories actif à l’arrivée depuis S1/S2 |
| **Modale S2 ouverte + lien admin** | Fermer dialog puis naviguer (pas de dialog empilé + route) |
| **1 seule catégorie custom** | Liste courte — pas de scroll |
| **Legacy `template_type=deplacement`** | Affichage stats/tirage inchangé (lecture `SpectacleCategory`) ; UI peut montrer Déplacements si `category` null + legacy — **hors scope 17.39** (pas de badge spécial) |

---

## Anti-patterns (interdits)

- Champ texte + autocomplete pour choisir une catégorie.
- Création de catégorie depuis S2 (saisie libre orga).
- Chip plat sans chevron pour l’état éditable.
- Suppression sans compteur de spectacles impactés.
- Modales empilées pour le CRUD admin (tout admin → page paramètres).
- Paramètres troupe **uniquement** via gear menu sans lien Infos (PO a tranché option B : les deux entrées).

---

## Checklist M3

| Story | Points clés |
|-------|-------------|
| **17.39** | `mat-radio-group`, S1 action-row, S2 dialog, lien navigate |
| **17.40** | Page admin, liste + CRUD, S4 dialog, breadcrumb, 48 dp |

---

## Handoff implémentation

| Fichier | Story | Action |
|---------|-------|--------|
| `event-infos-tab.html` | 17.39 | Chip → action-row ; lien `routerLink` / navigate paramètres |
| `event-category-dialog.ts` | 17.39 | Autocomplete → radio list ; lien admin → navigate |
| `troupe-settings/` (nouveau) | 17.40 | Page shell + onglet Catégories |
| `troupe-categories-tab.ts` | 17.40 | Liste CRUD |
| `troupe-category-delete-dialog.ts` | 17.40 | S4 |
| `app.routes.ts` | 17.40 | Route `admin/parametres` |
| `troupe-hub` scope admin menu | 17.40 | Entrée **Paramètres troupe** |
| `ux-design-journey-league-agenda.md` § 6b | — | Amend après validation PO |
| `ux-design-scope-admin-menu-epic17.md` Screen 3 | — | Activer entrée Paramètres troupe |

**Ordre dev :** **17.38** (API) → **17.40** (page admin — peut paralléliser après contrat API) → **17.39** (sélection Infos ; dépend du glossaire à jour).

---

## Open questions

| # | Question | Recommandation Sally |
|---|----------|---------------------|
| OQ-1 | Onglets futurs visibles en MVP ? | **Masquer** Formules/Rôles jusqu’aux stories — shell routing prêt |
| OQ-2 | Afficher le slug en lecture seule dans S3 ? | **Non** — libellé seul ; slug à la création |
| OQ-3 | Réintroduire `×` sur action-row ? | **Non** — S2 uniquement |
| OQ-4 | Query `?tab=` vs path `/parametres/categories` | **`?tab=categories`** — un seul composant shell, onglets futurs sans nouvelles routes |

---

## Flux confirmé (Patrice ↔ Sally)

```
S1 Infos ──action-row──► S2 dialog sélection
    │                         │
    └── Gérer les catégories ─┴──► navigate ──► S3 Paramètres · tab Catégories
                                              └── 🗑 ──► S4 confirm dialog
Hub ⚙ ── Paramètres troupe ───────────────────────► S3 (même destination)
```

---

*Draft amendé 2026-06-08 — placement admin sur page paramètres ; lien Infos conservé (option B).*
