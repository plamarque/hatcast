---
title: UX — Catégories spectacle (sélection + admin glossaire)
author: Sally (UX) + Patrice
date: '2026-06-08'
amended: '2026-06-09'
status: draft
stakeholderAmendments:
  - '2026-06-09 Patrice — chips inline exclusifs (suppression modale S2) ; libellé pluriel Spectacles ordinaires'
relatedArtifacts:
  - _bmad-output/planning-artifacts/sprint-change-proposal-2026-06-08-category-glossary-ux.md
  - _bmad-output/planning-artifacts/ux-design-journey-league-agenda.md
  - _bmad-output/planning-artifacts/ux-design-scope-admin-menu-epic17.md
  - apps/web/src/app/pages/event-detail/event-infos-tab.html
  - apps/web/src/app/pages/event-detail/event-category.constants.ts
  - apps/web/src/app/pages/event-detail/event-category-select-chip-set.ts
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

# UX Design — Catégories spectacle (Screen 6b v4)

**Purpose:** Remplacer l’autocomplete « tag » par une **sélection explicite inline** (chips exclusifs sur l’onglet Infos). La **gestion admin** vit sur **Paramètres troupe → onglet Catégories** ; le lien **« Gérer les catégories »** (Infos) **navigue** vers cette page (option B découvrabilité).

**Amendement 2026-06-09 (Patrice ↔ Sally) :** la modale S2 (action-row + chevron ▾) créait une **fausse affordance** (pulldown) et un bug Annuler → PATCH erroné. **S2 supprimée** ; sélection = **chips inline exclusifs** (visuel proche des rôles préférés, comportement radio). Libellé par défaut harmonisé : **Spectacles ordinaires** (pluriel, aligné stats/filtres et « Déplacements »).

**Contexte :** [SCP 2026-06-08](sprint-change-proposal-2026-06-08-category-glossary-ux.md) · **17.38** (API) · **17.39** (sélection Infos) · **17.40** (paramètres troupe).

**Preview visuelle :** [`_bmad-output/previews/category-glossary-ux-mockup.html`](../previews/category-glossary-ux-mockup.html) *(mockup v3 — à mettre à jour chips inline)*

---

## Problème (constat terrain)

| Point | Constat |
|-------|---------|
| **Affordance (v3)** | L’action-row avec chevron ▾ évoquait un **menu déroulant** ; ouvrir une modale Annuler/Enregistrer sur 2–5 options = friction inutile. |
| **Recette 2026-06-09** | Annuler dans la modale déclenchait parfois un PATCH → snackbar **« Catégorie invalide. »** |
| **Modèle mental** | L’autocomplete évoque des **tags libres** ; le produit veut un **vocabulaire contrôlé** (dizaines d’entrées, pas des milliers). |
| **Gouvernance** | Créer une catégorie en tapant sur un spectacle invite aux doublons (`Apérock` / `Aperock`). La curation appartient aux **admins troupe**. |
| **Suppression** | L’admin doit **voir l’impact** avant de supprimer une catégorie (spectacles repassés en ordinaires). |
| **Cohérence libellés** | Stats/filtres utilisent déjà **Spectacles ordinaires** ; Infos utilisait le singulier — incohérence produit. |

---

## Principes de design

1. **Sélection inline, pas de modale** — chips exclusifs visibles directement sous le help text ; tap → PATCH immédiat + snackbar (pas d’Annuler/Enregistrer).
2. **Famille visuelle rôles préférés** — `mat-chip-set` + `highlighted` sur l’option active ; flex-wrap ; cibles ≥ 48 dp.
3. **Liste complète, zéro frappe** — toutes les options visibles en MVP (< ~15 catégories typiques).
4. **Deux vitesses** — orga **choisit** ; admin **curate** (créer / renommer / supprimer).
5. **Découvrabilité** — lien **« Gérer les catégories »** sur Infos → navigation paramètres (onglet Catégories).
6. **Extensibilité** — shell **Paramètres troupe** avec onglets (`mat-tab-group`) : **Catégories** (MVP) ; **Formules** / **Rôles** réservés (Epic 19+, futur).
7. **Material 3** — `mat-chip-set`, tokens `--mat-sys-*` ; checklist [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md).

---

## Surfaces

| Surface | Rôle | Composant / route |
|---------|------|-------------------|
| **S1** — Section Catégorie (Infos) | Sélection inline + lien admin → paramètres | `event-infos-tab` + `EventCategorySelectChipSet` |
| ~~**S2** — Dialog sélection~~ | ~~Choisir une catégorie~~ | **Supprimée v4** — remplacée par chips S1 |
| **S3** — Page Paramètres troupe · onglet **Catégories** | CRUD admin glossaire | `TroupeSettingsPage` + `CategoriesTab` (**17.40**) |
| **S4** — Dialog confirmation suppression | Impact + confirm (sur S3) | `MatDialog` alert pattern |

### Entrées vers S3

| Origine | Action |
|---------|--------|
| **S1** — lien « Gérer les catégories » | `router.navigate` → paramètres, onglet Catégories |
| **Hub troupe** — gear ⚙ → **Paramètres troupe** | Ouvre S3 (onglet par défaut ou dernier visité — MVP : Catégories si seul onglet actif) |
| **Retour navigateur** | Depuis S3, retour au spectacle Infos si l’utilisateur venait de S1 |

---

## S1 — Section Catégorie (onglet Infos) — v4

### Structure

```
CATÉGORIE
Choisis la catégorie dans laquelle ce spectacle comptera…

[ Spectacles ordinaires ]  [ Déplacements ]  [ Apérock ]  …
     ↑ sélectionné (highlighted)              ↑ wrap mobile

  Gérer les catégories                        ← lien admin seulement
```

### Règles

| Élément | Règle |
|---------|-------|
| **Label section** | `CATÉGORIE` — `event-infos__label` |
| **Help inline** | Constante `CATEGORY_HELP` — inchangée |
| **Sélection** | `app-event-category-select-chip-set` — **remplace action-row + modale S2** |
| **Composant M3** | `mat-chip-set` + `mat-chip` ; `[highlighted]` sur slug courant |
| **Ordre options** | 1) **Spectacles ordinaires** (`slug=null`) · 2) **Déplacements** (si glossaire) · 3) custom **A→Z** par `label` |
| **Libellé défaut** | **Spectacles ordinaires** (pluriel — aligné `stats-categories`, filtres stats) |
| **Interaction orga** | Tap chip ≠ courant → PATCH `category: slug \| null` immédiat ; snackbar succès |
| **Tap chip courant** | No-op (pas de PATCH) |
| **Lecture seule** | Membre sans `canManageEvents` : chips `[disabled]`, sélection courante `highlighted` |
| **Chargement glossaire** | Skeleton 2–3 chips ou `mat-spinner` sous le help text |
| **Erreur PATCH** | Snackbar FR ; sélection visuelle reste sur valeur serveur (via `@Input event`) |

### Lien admin

| Élément | Règle |
|---------|-------|
| **Visibilité** | `canManageTroupe` uniquement |
| **Style** | Même classe que **« Ajouter un·e organisateur·ice »** — `.event-infos__add-organizer` |
| **Libellé** | **Gérer les catégories** |
| **Action** | **Navigation** vers `/troupes/{troupeSlug}/admin/parametres?tab=categories` |
| **Placement** | Sous les chips, aligné à gauche |
| **Icône** | `settings` — optionnel, même style que lien organisateur |

---

## ~~S2 — Dialog sélection~~ (supprimée v4)

> **Historique v3 :** modale `MatDialog` + `mat-radio-group` + Annuler / Enregistrer.  
> **Raison retrait :** fausse affordance pulldown, bug Annuler, friction inutile pour enum court.  
> **Migration impl :** supprimer `EventCategoryDialog` ; logique options → `buildEventCategoryOptions()` dans `event-category.constants.ts`.

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

**Spectacles ordinaires** n’apparaît **pas** dans cette liste (ce n’est pas une entrée glossaire).

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
│   en Spectacles ordinaires.           │
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
| **Copy impact** | *« {n} spectacle(s) utilisent cette catégorie. Ils seront basculés en Spectacles ordinaires. »* |
| **0 spectacles** | *« Aucun spectacle n’utilise cette catégorie. »* — bouton Supprimer reste actif |
| **Bouton destructif** | `mat-flat-button color="warn"` — **Supprimer** |
| **Succès** | Snackbar « Catégorie supprimée » ; rafraîchir glossaire ; si S2 ouvert plus tard, liste à jour |

---

## Parcours (protagoniste : Léa, admin + orga)

1. Léa ouvre un spectacle → onglet **Infos** → chips **Spectacles ordinaires** · **Déplacements** · …
2. Elle tape **Apérock** → PATCH immédiat → snackbar « Catégorie enregistrée ».
3. Elle tape **Gérer les catégories** (S1) → **navigation** → **S3** onglet Catégories → **Ajouter** « Festival ».
4. Retour navigateur → spectacle Infos ; le chip **Festival** apparaît dans la liste inline.
5. Sur S3, elle supprime « Apérock » → **S4** : **12 spectacles** → confirme → cascade API.

**Climax :** le compteur S4 sur la page paramètres ; le lien Infos évite de « chercher » les paramètres dans le gear menu.

---

## États & edge cases

| État | Comportement |
|------|--------------|
| **Chargement glossaire** | S1 : skeleton 2–3 chips ou spinner ; S3 : `mat-progress-bar` |
| **Erreur API PATCH** | Snackbar FR ; chips restent sur valeur `@Input event` |
| **Erreur chargement glossaire** | Snackbar FR ; chips minimum = ordinaires seul |
| **Orga non admin** | Pas de lien « Gérer » ; chips disabled |
| **Admin seulement** | Peut ouvrir S3 via gear hub ou lien Infos |
| **Deep link `?tab=categories`** | Onglet Catégories actif à l’arrivée depuis S1 |
| **1 seule catégorie custom** | Liste courte — pas de scroll |
| **Legacy `template_type=deplacement`** | Affichage stats/tirage inchangé (lecture `SpectacleCategory`) ; UI peut montrer Déplacements si `category` null + legacy — **hors scope 17.39** (pas de badge spécial) |

---

## Anti-patterns (interdits)

- Champ texte + autocomplete pour choisir une catégorie.
- Création de catégorie depuis S1 (saisie libre orga).
- Action-row + chevron ▾ masquant une modale pour un enum court (**retiré v4**).
- Modale Annuler/Enregistrer pour 2–5 options (**retiré v4**).
- Suppression sans compteur de spectacles impactés.
- Modales empilées pour le CRUD admin (tout admin → page paramètres).
- Paramètres troupe **uniquement** via gear menu sans lien Infos (PO a tranché option B : les deux entrées).

---

## Checklist M3

| Story | Points clés |
|-------|-------------|
| **17.39** | `mat-chip-set` inline exclusif, PATCH au tap, lien navigate, **Spectacles ordinaires** |
| **17.40** | Page admin, liste + CRUD, S4 dialog, breadcrumb, 48 dp |

---

## Handoff implémentation

| Fichier | Story | Action |
|---------|-------|--------|
| `event-category.constants.ts` | 17.39 amend | `CATEGORY_HELP`, `DEFAULT_CATEGORY_DISPLAY_LABEL`, `buildEventCategoryOptions()` |
| `event-category-select-chip-set.ts` | 17.39 amend | Chips exclusifs inline |
| `event-infos-tab.html` | 17.39 amend | Remplacer action-row + dialog par chip-set |
| ~~`event-category-dialog.ts`~~ | 17.39 amend | **Supprimer** |
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
| OQ-3 | Réintroduire `×` sur chip ? | **Non** — tap **Spectacles ordinaires** |
| OQ-4 | Query `?tab=` vs path `/parametres/categories` | **`?tab=categories`** — un seul composant shell, onglets futurs sans nouvelles routes |
| OQ-5 | Modale vs chips inline ? | **Chips inline v4** — recette 2026-06-09 ; modale S2 retirée |

---

## Flux confirmé (Patrice ↔ Sally) — v4

```
S1 Infos ── chips inline (tap → PATCH)
    │
    └── Gérer les catégories ──► navigate ──► S3 Paramètres · tab Catégories
                                              └── 🗑 ──► S4 confirm dialog
Hub ⚙ ── Paramètres troupe ───────────────────────► S3 (même destination)
```

---

*Draft amendé 2026-06-08 — placement admin sur page paramètres ; lien Infos conservé (option B).*  
*Amendement 2026-06-09 — chips inline exclusifs ; suppression S2 ; libellé pluriel Spectacles ordinaires.*
