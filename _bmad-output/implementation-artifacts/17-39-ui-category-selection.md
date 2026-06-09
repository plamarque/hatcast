# Story 17.39: UI category selection (Infos tab)

Status: done

**UX spec:** [_bmad-output/planning-artifacts/ux-design-category-glossary-17-39.md](../planning-artifacts/ux-design-category-glossary-17-39.md)  
**Depends on:** **17.38** (category glossary API — done)

## Story

En tant qu'**organisateur·ice**,
je veux **choisir la catégorie d'un spectacle via une liste explicite**,
afin que **le vocabulaire reste contrôlé** et **l'affordance soit alignée avec Date / Lieu** sur l'onglet Infos.

## Acceptance Criteria

1. **Given** un orga avec `canManageEvents`, **when** l'onglet Infos affiche la section Catégorie, **then** la valeur courante est un `button.event-infos__action-row` (icône, libellé, chevron) — plus de chip avec `×`. [Source: UX S1]
2. **Given** clic sur l'action-row, **when** la modale s'ouvre, **then** `mat-radio-group` liste **Spectacle ordinaire** (`null`), **Déplacements** (si glossaire), puis entrées custom **A→Z** ; pas d'autocomplete. [Source: UX S2]
3. **Given** sélection + **Enregistrer**, **when** PATCH event, **then** `category` = slug ou `null` ; snackbar « Catégorie enregistrée » / « Spectacle ordinaire ». [Source: UX S2 ; 17.38 AC6]
4. **Given** admin troupe (`canManageTroupe`), **when** Infos ou modale, **then** lien **Gérer les catégories** navigue vers `/troupes/{slug}/admin/parametres?tab=categories` (ferme modale si ouverte). [Source: UX S1/S2]
5. **Given** membre sans `canManageEvents`, **when** Infos, **then** action-row désactivée, pas de lien admin. [Source: UX edge cases]
6. **Given** tests `event-category-dialog.spec.ts` et `event-infos-tab.spec.ts`, **when** `ng test`, **then** specs passent. [Source: repo norms]

**Couverture produit :** Epic 17 category governance UX ; prérequis **17.40** (page paramètres).

---

## Acceptance Criteria — Material 3 (UI)

**M3-1** — `mat-radio-group`, `MatDialog`, `mat-flat-button`, `mat-icon`, `mat-spinner` (chargement glossaire).  
**M3-2** — tokens `--mat-sys-*` / `color-mix` dans dialog et styles Infos existants.  
**M3-3** — action-row `min-height: 48px` ; `aria-label` français sur le bouton catégorie.  
**M3-5** — aligné checklist FRONTEND_UI.md.

---

## Tasks / Subtasks

- [x] **Périmètre :** `apps/web/` — Infos tab + category dialog
- [x] Remplacer chip par `event-infos__action-row` (S1)
- [x] Refondre `EventCategoryDialog` : radio list, ordre options, spinner (S2)
- [x] Lien admin → `troupeAdminSettingsPath` + `?tab=categories`
- [x] Propager `canManageTroupe` depuis `EventDetail`
- [x] Mettre à jour specs unitaires
- [x] `sprint-status.yaml` → **review**

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

- Chip + autocomplete remplacés par action-row + `mat-radio-group` (UX 17.39).
- Dialog retourne slug (pas libellé) pour PATCH event.
- `troupeAdminSettingsPath` ajouté dans `troupe-routes.ts`.
- Tests : 31/31 verts (`event-category-dialog`, `event-infos-tab`).

### File List

- `apps/web/src/app/core/navigation/troupe-routes.ts`
- `apps/web/src/app/pages/event-detail/event-category-dialog.ts`
- `apps/web/src/app/pages/event-detail/event-category-dialog.spec.ts`
- `apps/web/src/app/pages/event-detail/event-infos-tab.html`
- `apps/web/src/app/pages/event-detail/event-infos-tab.ts`
- `apps/web/src/app/pages/event-detail/event-infos-tab.scss`
- `apps/web/src/app/pages/event-detail/event-infos-tab.spec.ts`
- `apps/web/src/app/pages/event-detail/event-detail.html`
- `apps/web/src/app/pages/event-detail/event-detail.ts`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
