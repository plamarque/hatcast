# Story 17.31 : Modifier la saison — menu engrenage workspace

Status: done

<!-- PO decision 2026-05-31 — Option A : édition saison depuis le gear `/saison/:slug` (ferme le gap 17.5) -->

## Story

En tant qu’**administrateur de troupe** (`TROUPE_ADMIN`),  
je veux **modifier la saison courante** (titre, description, dates) depuis le **menu engrenage** du workspace saison,  
afin de **corriger les métadonnées sans quitter l’agenda** — parité FR11 après la fin de `/seasons`.

## Acceptance Criteria

1. **Given** un utilisateur avec `canManageSeasons === true` sur `/saison/:slug`, **when** le workspace charge, **then** le menu `app-scope-admin-menu` (breadcrumb row) inclut une entrée **Modifier** (`icon: edit`) qui ouvre `SeasonFormDialog` en mode **`edit`** avec la saison courante et le `troupeId` de la saison. [Source: FR11 ; gap [17-5](./17-5-redirects-fin-seasons-hub-troupe.md) ; PO Option A 2026-05-31]
2. **Given** l’entrée **Modifier**, **when** l’utilisateur enregistre avec succès, **then** snack *« Saison mise à jour »* ; le header / breadcrumb reflète le **nouveau titre** ; les dates affichées sur la carte période (si applicable) sont rafraîchies. [Source: parité `seasons-list.openEdit`]
3. **Given** un changement de titre entraînant un **nouveau slug** API, **when** la sauvegarde réussit, **then** navigation vers `/saison/:newSlug` avec **`replaceUrl: true`** (conserver la vue active Agenda / Historique / Stats si possible via query ou état existant — sinon défaut Agenda acceptable). [Source: hint dialog slug ; ADR 0013]
4. **Given** un utilisateur **sans** `canManageSeasons`, **when** le workspace charge, **then** **aucune** entrée **Modifier** ; les autres entrées gear existantes (**Nouveau spectacle**, **Participants**, etc.) restent inchangées selon leurs permissions. [Source: OrganizerAccessService — season organizer ≠ season CRUD]
5. **Given** l’ordre du menu saison, **when** plusieurs entrées sont visibles, **then** l’ordre est : **Modifier** → **Nouveau spectacle** → **Participants** → **Organisateur·ices** (si applicable). [Source: alignement gear troupe « Modifier » en tête ; ux-design-scope-admin-menu-epic17.md Screen 1 amendé]
6. **Given** `SeasonFormDialog` mode `edit`, **when** rendu, **then** mêmes champs qu’à la création (titre requis, description, dates début/fin, hint slug) — **aucun** nouveau champ ; dialog width `min(100vw - 2rem, 28rem)`. [Source: story 3.1 ; ux-design-troupe-hub.md T13]
7. **Given** implémentation terminée, **when** `npm run test -w @hatcast/web -- --watch=false` et `npm run build -w @hatcast/web`, **then** les deux passent ; specs `season-home` couvrent présence/absence de **Modifier** et ouverture du dialog. [Source: repo norms]

**Couverture produit :** amendement [ux-design-scope-admin-menu-epic17.md](../planning-artifacts/ux-design-scope-admin-menu-epic17.md) Screen 1 ; **FR11**.

**Depends on:** **3.1** (`SeasonFormDialog`, API PATCH saison), **17.2** / **17.28** (gear dans breadcrumb row).

---

## Acceptance Criteria — Material 3 (UI)

**M3-1. Composants Material** — Entrée gear via `app-scope-admin-menu` (`mat-icon-button` + `mat-menu-item`) ; édition via `MatDialog` + `SeasonFormDialog` existant (`mat-form-field`, datepickers) — pas de nouveau formulaire custom. [Source: FRONTEND_UI.md ; UX-DR11]

**M3-2. Tokens & thème** — Aucun style nouveau requis ; réutiliser SCSS dialog existant. [Source: FRONTEND_UI.md]

**M3-3. Mobile & tactile** — Gear ≥ 48×48 dp dans breadcrumb row ; dialog pleine largeur mobile `min(100vw - 2rem, 28rem)`. [Source: FRONTEND_UI.md]

**M3-4. Navigation membre** — Pas de bottom app bar M2 ; gear reste dans `app-season-header`. [Source: ux-hub-a-faire.md ; UX-DR22.1]

**M3-5. Revue** — Checklist M3 parcourue ; écarts notés en Dev Agent Record. [Source: AGENTS.md]

---

## Tasks / Subtasks

- [x] **Permissions & menu** (AC: 1, 4, 5)
  - [x] `season-home.ts` — `canManageSeasons` computed depuis `seasonPermissions()`
  - [x] Étendre `seasonAdminItems()` : **Modifier** en tête si `canManageSeasons()`
  - [x] Conserver ordre AC5 pour les entrées existantes (+ **Organisateur·ices** manquante ajoutée)

- [x] **Action Modifier** (AC: 2, 3, 6)
  - [x] `openEditSeason()` — ouvrir `SeasonFormDialog` `{ mode: 'edit', troupeId, season }`
  - [x] `SeasonFormDialog` retourne `SeasonResponse` PATCHée en mode edit
  - [x] Après succès : `season.set(updated)` ; redirect slug + `queryParams.view`
  - [x] Snack *« Saison mise à jour »*

- [x] **Réutilisation** (AC: 6)
  - [x] Import direct `SeasonFormDialog` depuis `seasons-list/`

- [x] **Docs UX** (AC: product)
  - [x] `ux-design-scope-admin-menu-epic17.md` Screen 1 — déjà amendé en CE

- [x] **Tests** (AC: 7)
  - [x] `season-home.spec.ts` — Modifier, ordre menu, navigation slug
  - [x] `npm run test -w @hatcast/web -- --watch=false` ; `npm run build -w @hatcast/web`

---

## Dev Notes

### Product and UX rules

- **Ferme le gap** documenté en **17.5** : édition saison accessible après redirect `/seasons` → `/troupes`.
- **PO 2026-05-31 — Option A** : point d’entrée = gear **workspace saison** ; **pas** menu ⋮ sur cartes hub (reste candidat **G-007** / story **17.26** pour archive + édition depuis hub).
- **Permission** : seul **`TROUPE_ADMIN`** (et super-admin plateforme) a `canManageSeasons` — les organisateur·ices de saison **ne** voient **pas** **Modifier**.
- **Parité V1** : [`SeasonsPage.vue`](../../legacy/src/views/SeasonsPage.vue) avait **Modifier** dans le menu carte ; V2 le replace par gear in-context.

### Frontend implementation guardrails

| Concern | Action |
|--------|--------|
| Material | `ScopeAdminMenuItem` avec `action` + `icon: 'edit'` |
| Permissions | `OrganizerApiService.mySeasonPermissions` — champ `canManageSeasons` déjà exposé |
| Slug | Toujours gérer redirect si titre modifié (hint dialog existant) |
| Réutilisation | [`season-form-dialog.ts`](../../apps/web/src/app/pages/seasons-list/season-form-dialog.ts), pattern [`seasons-list.ts`](../../apps/web/src/app/pages/seasons-list/seasons-list.ts) L203–225 |

### Explicit non-goals

- **Archiver** / **Activer** / **Supprimer** saison depuis le gear (hors FR11 minimal ici — backlog **G-007** / hub cartes)
- Menu ⋮ sur `app-season-card` au hub troupe
- Changements API (PATCH saison déjà livré en 3.1)
- Édition nom/logo **troupe** (17-29 **Modifier** troupe)

### Dependencies

| Story | Status | Relationship |
|-------|--------|--------------|
| **3.1** | done | `SeasonFormDialog`, API update |
| **17.5** | done | Gap édition documenté |
| **17.28** | review | Gear dans breadcrumb row |
| **G-007** | idée validée | Option hub ⋮ + archive — **complémentaire**, pas remplacée |

## Dev Agent Record

### Agent Model Used

Composer

### Completion Notes List

- Gear saison : **Modifier** (`canManageSeasons`) en tête ; ordre AC5 complet incluant **Organisateur·ices** (gap UX 17.2 corrigé en passant).
- `SeasonFormDialog` edit retourne `SeasonResponse` ; redirect slug + conservation `view` query param.
- Tests : 754/754 web ; build OK.

### File List

- `apps/web/src/app/pages/season-home/season-home.ts`
- `apps/web/src/app/pages/season-home/season-home.spec.ts`
- `apps/web/src/app/pages/seasons-list/season-form-dialog.ts`
- `apps/web/src/app/pages/seasons-list/seasons-list.ts`

### Change Log

- 2026-05-31 : Story créée — PO Option A (Patrice / John CE).
- 2026-05-31 : Implémentation — gear **Modifier**, dialog edit, tests.
- 2026-05-31 : Code review — 3 patches appliqués (typage seasons-list, tests dialog payload + slug inchangé).

### Review Findings

- [x] [Review][Patch] Align `seasons-list.openEdit` MatDialog close type with `SeasonFormDialog` edit return (`SeasonResponse`) [`seasons-list.ts:212`]
- [x] [Review][Patch] Assert `dialog.open` payload in edit test (component, `{ mode: 'edit', troupeId, season }`, width) [AC1] [`season-home.spec.ts:369`]
- [x] [Review][Patch] Add test: successful edit with unchanged slug does not call `router.navigate` [AC3] [`season-home.spec.ts`]
- [x] [Review][Defer] Slug change triggers full `loadTroupeAndSeason` reload (loading spinner flash) — pre-existing route param pattern, not introduced by 17.31 [`season-home.ts:933`] — deferred, pre-existing

---

### Validation create-story

- [x] AC métier numérotés et sourcés (FR11, 17.5, UX scope admin)
- [x] Section **Material 3** remplie
- [x] Tasks référencent les AC
- [x] Liens fichiers code existants
- [x] Tests web mentionnés
