# Story 17.39: UI category selection (Infos tab)

Status: done

**UX spec:** [_bmad-output/planning-artifacts/ux-design-category-glossary-17-39.md](../planning-artifacts/ux-design-category-glossary-17-39.md) (v4 amend 2026-06-09 — chips inline)  
**Depends on:** **17.38** (category glossary API — done)

## Story

En tant qu'**organisateur·ice**,
je veux **choisir la catégorie d'un spectacle via des chips exclusifs inline**,
afin que **le vocabulaire reste contrôlé** et **l'affordance soit honnête** (pas de fausse modale pulldown).

## Acceptance Criteria

1. **Given** un orga avec `canManageEvents`, **when** l'onglet Infos affiche la section Catégorie, **then** les options sont des **chips exclusifs inline** (`app-event-category-select-chip-set`) — plus d'action-row chevron ni modale. [Source: UX S1 v4]
2. **Given** les chips visibles, **when** l'utilisateur consulte la liste, **then** ordre : **Spectacles ordinaires** (`null`), **Déplacements** (si glossaire), custom **A→Z** ; pas d'autocomplete. [Source: UX S1 v4]
3. **Given** tap sur un chip ≠ courant, **when** PATCH event, **then** `category` = slug ou `null` ; snackbar « Catégorie enregistrée » / « Spectacles ordinaires. » [Source: UX S1 v4 ; 17.38 AC6]
4. **Given** admin troupe (`canManageTroupe`), **when** Infos, **then** lien **Gérer les catégories** navigue vers `/troupes/{slug}/admin/parametres?tab=categories`. [Source: UX S1]
5. **Given** membre sans `canManageEvents`, **when** Infos, **then** chips disabled, sélection courante highlighted, pas de lien admin. [Source: UX edge cases]
6. **Given** tests `event-category-select-chip-set.spec.ts` et `event-infos-tab.spec.ts`, **when** `ng test`, **then** specs passent. [Source: repo norms]

**Couverture produit :** Epic 17 category governance UX ; prérequis **17.40** (page paramètres).

---

## Acceptance Criteria — Material 3 (UI)

**M3-1** — `mat-chip-set`, `mat-spinner` (chargement glossaire), tokens `--mat-sys-*`.  
**M3-2** — tokens `--mat-sys-*` / `color-mix` dans chip-set et styles Infos.  
**M3-3** — chips `min-height: 2.75rem` (≥ 48 dp tactile) ; `aria-label` français sur le chip-set.  
**M3-5** — aligné checklist FRONTEND_UI.md.

---

## Tasks / Subtasks

- [x] **Périmètre :** `apps/web/` — Infos tab + category selection
- [x] Remplacer action-row + modale par chips inline exclusifs (S1 v4)
- [x] Extraire `event-category.constants.ts` + `buildEventCategoryOptions()`
- [x] Libellé pluriel **Spectacles ordinaires** (aligné stats/filtres)
- [x] Supprimer `EventCategoryDialog`
- [x] Lien admin → `troupeAdminSettingsPath` + `?tab=categories`
- [x] Mettre à jour specs unitaires
- [x] Amend UX spec v4 (Sally 2026-06-09)

## Dev Notes

### Explicit non-goals

- Page Paramètres troupe / CRUD admin (**17.40**).
- Route `admin/parametres` (sera ajoutée en 17.40 — navigation préparée).

### Dependencies

| Story | Status | Relationship |
|-------|--------|----------------|
| 17.38 | done | API glossaire + validation slug |
| 17.40 | backlog | Destination lien « Gérer les catégories » |

## Dev Agent Record

### Agent Model Used

Composer (Cloud Agent)

### Completion Notes List

- Amend UX v4 2026-06-09 : chips inline exclusifs, suppression modale S2, libellé pluriel.
- `EventCategoryDialog` supprimé ; logique options → `buildEventCategoryOptions()`.
- PATCH immédiat au tap chip (plus de bug Annuler → PATCH erroné).
- Snackbar « Spectacles ordinaires. » quand `category` null.

### File List

- `apps/web/src/app/pages/event-detail/event-category.constants.ts`
- `apps/web/src/app/pages/event-detail/event-category-select-chip-set.ts`
- `apps/web/src/app/pages/event-detail/event-category-select-chip-set.spec.ts`
- `apps/web/src/app/pages/event-detail/event-infos-tab.html`
- `apps/web/src/app/pages/event-detail/event-infos-tab.ts`
- `apps/web/src/app/pages/event-detail/event-infos-tab.scss`
- `apps/web/src/app/pages/event-detail/event-infos-tab.spec.ts`
- `_bmad-output/planning-artifacts/ux-design-category-glossary-17-39.md`
- `_bmad-output/implementation-artifacts/17-39-ui-category-selection.md`

### Change Log

- 2026-06-09 — Amend v4 : inline chips, suppression modale, Spectacles ordinaires (Patrice ↔ Sally)

### Review Findings

- [x] [Amend v4] Remplacer action-row + modale par chips inline [event-infos-tab]
- [x] [Amend v4] Libellé pluriel Spectacles ordinaires [event-category.constants.ts]
- [x] [Amend v4] Supprimer EventCategoryDialog (bug Annuler)
- [x] [Review][Defer] Navigation vers `/admin/parametres` sans route 17.40 — deferred
- [x] [Review][Defer] `persistCategory` sans garde post-await identité événement — deferred, pré-existant
- [x] [Review][Defer] Fallback slug brut si glossaire incomplet — deferred, pré-existant
- [x] [Review][Patch] `loadGlossary` sans `catch` sur exceptions réseau [event-infos-tab.ts:460]
- [x] [Review][Patch] Glossaire stale après échec API — pas de reset `glossary.set([])` [event-infos-tab.ts:467]
- [x] [Review][Patch] Test « lien admin masqué » fragile (classe partagée organisateurs) [event-infos-tab.spec.ts:395]
- [x] [Review][Patch] Test manquant : échec chargement glossaire → snackbar [event-infos-tab.spec.ts]
- [x] [Review][Patch] Test manquant : échec PATCH catégorie → snackbar erreur [event-infos-tab.spec.ts]
- [x] [Review][Patch] A11y chip-set : aligner `aria-pressed` (pattern `role-toggle-chip-set`), retirer listbox/option [event-category-select-chip-set.ts:10]
- [x] [Review][Defer] `saving` partagé orga/format/catégorie sans séquencement — deferred, pré-existant
- [x] [Review][Defer] Catégorie éditable sur spectacle archivé si `canManageEvents` — deferred, pré-existant
- [x] [Review][Defer] Changement `share-announce-messages.ts` hors scope 17.39 dans le working tree — deferred, commit séparé
