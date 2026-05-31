# Story 17.28: Filter hub + individual pickers (UX-DR22.1)

Status: review

<!-- Course correction after 17.27 field feedback — Patrice 2026-05-31 -->

## Story

As a **member or organizer** filtering a season with many participants and events,  
I want a **lightweight filter hub** that opens **searchable multi-select pickers** per criterion, with **chips next to the filter button**,  
so that **filtering scales** without an enormous combined dialog and matches **V1 ergonomics**.

## Acceptance Criteria

1. **Given** season workspace with **>1** participant or spectacle option, **when** the user taps `filter_list`, **then** a **hub panel** opens showing **summary rows only** (Membre, Spectacle, Catégories on Stats) — **no** fully expanded option lists inside the hub. [Source: UX-DR22.1 D10, D11 ; AC2]
2. **Given** the hub open on season workspace, **when** the user taps **Membre**, **then** a **participant picker** opens titled **Filtrer les participants** with search (`Rechercher un participant…`), **Tous** master row, and **multi-select checkboxes** per member. [Source: UX-DR22.1 D11, D12 ; V1 `PlayerSelectorModal`]
3. **Given** the participant picker, **when** the user selects multiple members and taps **Appliquer**, **then** the view filters to those members and chips show an aggregate label (`Name` / `Name1, Name2` / `N membres`). [Source: UX-DR22.1 Lexicon]
4. **Given** the hub open, **when** the user taps **Spectacle**, **then** an **event picker** opens titled **Filtrer les événements** with search, multi-select checkboxes, and a scope **mat-menu** with toggles **Passés** and **Archivés**. [Source: UX-DR22.1 D13 ; V1 `EventSelectorModal`]
5. **Given** active season filters, **when** the toolbar renders, **then** chips appear in the **filter column** (right cluster), visually adjacent to the filter trigger — **not** a disconnected row on the left. [Source: UX-DR22.1 P3, D15, AC5]
6. **Given** season workspace desktop, **when** chrome renders, **then** `app-scope-admin-menu` (gear) is in the **breadcrumb row** (`season-header`) and the filter trigger is **to the right of view toggles** in `season-view-toolbar`. [Source: UX-DR22.1 D14, D15 ; amends Epic 17.2 placement]
7. **Given** Statistiques view, **when** the user opens filters, **then** the **Catégories** hub row opens the existing **17.10** checkbox picker as an **isolated modal** (not stacked with participant/event lists). [Source: UX-DR22.1 Screen D]
8. **Given** cross-troupe `/agenda` or glance with `filterBarVisible: true`, **when** the user opens filters, **then** hub shows Troupe + Saison rows opening **compact single-select** pickers (not mega-dialog). [Source: UX-DR22.1 D16]
9. **Given** viewport **≤ 480px**, **when** hub or pickers open, **then** use **`MatBottomSheet`** with **Appliquer** / **Réinitialiser** footers on pickers. [Source: UX-DR22.1 D5]
10. **Given** viewport **≥ 481px**, **when** hub opens, **then** compact menu or dialog (~320px); pickers use **`MatDialog`** with internal scroll (`max-height: 85vh`). [Source: UX-DR22.1 P8]
11. **Given** stats categories `{ kind: 'none' }`, **when** Statistiques renders, **then** warn outline on filter trigger unchanged (17.10 F9). [Source: 17.27 AC10]
12. **Given** RES-001 (`filterBarVisible: false`), **when** page loads, **then** no filter chrome (unchanged). [Source: UX-DR22.1 D2]
13. **Given** chip remove or **Tout effacer**, **when** triggered, **then** dimension reset behaviour matches 17.27 semantics. [Source: UX-DR22.1 interaction flows]
14. **Given** implementation complete, **when** `npm run test -w @hatcast/web -- --watch=false` and `npm run build -w @hatcast/web`, **then** both pass. [Source: repo norms]

**Product coverage:** **UX-DR22.1** — [_ux-design-unified-filter-panel.md_](../planning-artifacts/ux-design-unified-filter-panel.md) (approved 2026-05-31).

**Depends on:** **17.27** (shared filter module baseline), **17.10**, **17.2** (gear component — placement change only).

---

## Acceptance Criteria — Material 3 (UI)

**M3-1. Composants Material** — Hub, pickers, and chips use `mat-icon-button`, `MatBottomSheet`, `MatDialog`, `mat-form-field`, `mat-checkbox`, `mat-menu`, `mat-chip-set`, `mat-button` — no custom clickable divs for equivalent roles. [Source: FRONTEND_UI.md ; UX-DR11]

**M3-2. Tokens & thème** — SCSS uses `--mat-sys-*` and `color-mix` only; warn state uses `--mat-sys-error`. [Source: FRONTEND_UI.md]

**M3-3. Mobile & tactile** — Filter trigger ≥ 48×48 dp; French `aria-label`; picker footers accessible. [Source: FRONTEND_UI.md]

**M3-4. Navigation membre** — No bottom app bar M2; gear in breadcrumb row per UX-DR22.1. [Source: ux-hub-a-faire.md]

**M3-5. Revue** — M3 checklist walked; waivers in Dev Agent Record. [Source: AGENTS.md]

---

## Tasks / Subtasks

- [x] **Hub panel** (AC: 1, 8, 9, 10)
  - [x] Replace `filter-panel-content` mega-dialog with `filter-hub` (summary rows + chevron)
  - [x] Route `FilterPanelService.openHub()` — breakpoint split unchanged
  - [x] Wire cross-troupe compact single-select pickers for troupe/season

- [x] **Participant picker** (AC: 2, 3)
  - [x] New `filter-participant-picker` — search, Tous row, checkboxes, avatars optional
  - [x] Extend season state: `selectedParticipantIds: string[]` (or Set) — align filtering in `season-home.ts`
  - [x] API/query param strategy documented in Dev Notes (multi-id support or client-side filter)

- [x] **Event picker** (AC: 4)
  - [x] New `filter-event-picker` — search, scope menu (past/archived), checkboxes
  - [x] Extend season state: multi event ids per view (agenda/history/stats)
  - [x] Default scope toggles per view (Historique: past on)

- [x] **Chrome layout** (AC: 5, 6)
  - [x] Move `app-scope-admin-menu` to `season-header.html` (breadcrumb row end)
  - [x] Move `app-filter-trigger` to `season-view-toolbar` right cluster
  - [x] Wrap trigger + `active-filter-chips` in `filter-trigger-column`
  - [x] Chip click → reopen dimension picker

- [x] **Categories** (AC: 7)
  - [x] Hub row opens isolated `filter-dimension-categories` dialog/sheet

- [x] **Cleanup** (AC: 1)
  - [x] Remove stacked `mat-selection-list` from unified panel path
  - [x] Update specs: hub, pickers, layout, multi-select chips

- [x] **Docs** (AC: product)
  - [x] Confirm linked UX docs updated (scope-admin, season historique/stats)

- [x] **Tests & build** (AC: 14)

---

## Dev Notes

### Product and UX rules

- **Authoritative UX:** [_ux-design-unified-filter-panel.md_](../planning-artifacts/ux-design-unified-filter-panel.md) — **UX-DR22.1** (2026-05-31).
- **17.27** delivered trigger + chips + mega-dialog — **17.28 replaces dialog architecture and toolbar layout**; reuse `filter-trigger`, `active-filter-chips`, `filter-panel.service` where possible.
- **V1 reference:** `legacy/src/components/PlayerSelectorModal.vue`, `EventSelectorModal.vue` — behaviour reference, M3 styling in V2.

### Data model / API (OPEN — resolve in implementation)

- Current season filters: single `selectedParticipantId`, single `selectedEventId` per view.
- Target: **arrays** for participant and spectacle on season workspace.
- Check whether API supports multiple ids in query params or if filtering is client-side on loaded catalog — **do not silently drop multi-select** if API is single-id only; extend API in separate story if needed and document in Dev Agent Record.

### Explicit non-goals

- RES-001 server logic changes
- `matBadge` on filter icon (phase 2)
- Moving Exporter / Détails into filter UI

### Dependencies

| Story | Status | Relationship |
|-------|--------|--------------|
| **17.27** | done | Baseline module — superseded dialog/hub layout |
| **17.10** | done | Categories picker content |
| **17.2** | done | Gear component — new host only |

## Dev Agent Record

### Agent Model Used

Composer

### Completion Notes List

- Hub + pickers (`filter-hub`, `filter-participant-picker`, `filter-event-picker`, `filter-categories-picker`, `filter-single-picker`) ; `FilterPanelService.openHub()` et méthodes picker par dimension.
- Saison : état `selectedParticipantIds` / `selectedEventIds` (tableaux) ; spectacles filtrés côté client via `filterEventsByIds` ; stats : lignes filtrées client si plusieurs membres, API `participantId`/`eventId` uniquement quand un seul id (`resolveApiParticipantId`).
- Chrome : engrenage dans `season-header` ; trigger + chips dans colonne droite `filter-trigger-column` ; clic chip rouvre le picker.
- Agenda / glance : hub Troupe+Saison + `openSinglePicker` (plus de mega-dialog).
- **API multi-id** : pas de support backend — story follow-up si union serveur requise pour historique multi-membres.
- Tests : 730/730 ; build OK. M3 : avatars participant picker reportés (optionnel UX) ; row buttons pour lignes liste = pattern liste cliquable + checkbox Material (équivalent V1).

### File List

- apps/web/src/app/shared/filters/filter-hub.ts
- apps/web/src/app/shared/filters/filter-hub.html
- apps/web/src/app/shared/filters/filter-hub.scss
- apps/web/src/app/shared/filters/filter-participant-picker.ts
- apps/web/src/app/shared/filters/filter-participant-picker.html
- apps/web/src/app/shared/filters/filter-event-picker.ts
- apps/web/src/app/shared/filters/filter-event-picker.html
- apps/web/src/app/shared/filters/filter-event-picker.scss
- apps/web/src/app/shared/filters/filter-categories-picker.ts
- apps/web/src/app/shared/filters/filter-categories-picker.html
- apps/web/src/app/shared/filters/filter-single-picker.ts
- apps/web/src/app/shared/filters/filter-single-picker.html
- apps/web/src/app/shared/filters/filter-picker-shell.scss
- apps/web/src/app/shared/filters/filter.types.ts
- apps/web/src/app/shared/filters/filter-panel.service.ts
- apps/web/src/app/shared/filters/filter-panel.service.spec.ts
- apps/web/src/app/shared/filters/filter-builders.ts
- apps/web/src/app/shared/filters/filter-builders.spec.ts
- apps/web/src/app/shared/filters/filter-panel-content.ts
- apps/web/src/app/shared/filters/active-filter-chips.ts
- apps/web/src/app/shared/filters/active-filter-chips.html
- apps/web/src/app/pages/season-home/season-header.ts
- apps/web/src/app/pages/season-home/season-header.html
- apps/web/src/app/pages/season-home/season-header.scss
- apps/web/src/app/pages/season-home/season-view-toolbar.ts
- apps/web/src/app/pages/season-home/season-view-toolbar.html
- apps/web/src/app/pages/season-home/season-view-toolbar.scss
- apps/web/src/app/pages/season-home/season-view-toolbar.spec.ts
- apps/web/src/app/pages/season-home/season-home.ts
- apps/web/src/app/pages/season-home/season-home.html
- apps/web/src/app/pages/season-home/season-home.spec.ts
- apps/web/src/app/pages/season-home/season-view.types.ts
- apps/web/src/app/pages/season-home/season-events.utils.ts
- apps/web/src/app/pages/user-agenda/user-agenda.ts
- apps/web/src/app/pages/user-agenda/user-agenda.html
- apps/web/src/app/pages/member-season-glance/member-season-glance.ts
- apps/web/src/app/pages/member-season-glance/member-season-glance.html
- apps/web/src/styles.scss

### Change Log

- 2026-05-31 : Story created from UX-DR22.1 amendment (Patrice sign-off).
- 2026-05-31 : Implemented hub + pickers, toolbar layout, multi-select state (Composer).
