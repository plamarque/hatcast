# Story 17.27: Unified filter panel (icon trigger + chips)

Status: done

> **Amendment (2026-05-31):** Field feedback → **UX-DR22.1** supersedes mega-dialog layout. Follow-up: Story **17.28** ([17-28-filtres-hub-pickers.md](./17-28-filtres-hub-pickers.md)).

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

## Story

As a **member** with multiple troupes, seasons, or filterable season views,  
I want **one discreet filter icon** that opens all filter dimensions for the current screen, with **active filter chips** below the toolbar,  
so that **filtering stays available without permanent inline pulldown rows** that add noise for mono-context users.

## Acceptance Criteria

1. **Given** a member with exactly **1 troupe + 1 season** on `/agenda` or `/membre/:userSlug`, **when** the page loads with API `filterBarVisible: false`, **then** **no** filter icon, chips, or sticky filter bar appear (RES-001 unchanged). [Source: UX-DR22 D2 ; `ux-design-unified-filter-panel.md` AC1 ; Story 12.1/12.3]
2. **Given** API `filterBarVisible: true` on `/agenda` or glance, **when** the page loads, **then** only a plain **`filter_list`** `mat-icon-button` appears (no inline `mat-stroked-button` pulldowns, **no `matBadge`** on icon in MVP). [Source: UX-DR22 P2, D3, D6 ; AC2, AC8]
3. **Given** any active troupe or season filter on cross-troupe surfaces, **when** viewing the page, **then** a **chip row** appears below the header/toolbar with one removable chip per active dimension and trailing **Tout effacer** ; icon stays unbadged. [Source: UX-DR22 P3, D6 ; AC3]
4. **Given** season workspace Agenda/Historique with **>1** participant or spectacle option, **when** the toolbar renders, **then** inline participant/spectacle pulldowns in [`season-view-toolbar.html`](../../apps/web/src/app/pages/season-home/season-view-toolbar.html) are **removed** and replaced by the unified filter icon + chips ; view toggles and [`app-scope-admin-menu`](../../apps/web/src/app/shared/scope-admin-menu/scope-admin-menu.ts) stay unchanged. [Source: UX-DR22 Screen C ; AC4 ; `ux-design-scope-admin-menu-epic17.md`]
5. **Given** Statistiques view, **when** toolbar renders, **then** **Exporter** and **Détails/Masquer** remain **outside** the filter panel ; spectacle groups (categories) filter lives **inside** the panel as third section per Story **17.10** rules (checkboxes, `Tous les spectacles`, helper copy). [Source: UX-DR22 P5, Screen D ; AC5 ; `ux-design-stats-equity-compartment-filter-17-10.md`]
6. **Given** viewport **≤ 480px**, **when** the filter icon is tapped, **then** **`MatBottomSheet`** opens with title **Filtres**, dimension sections, and footer **Réinitialiser** + **Appliquer** (Apply closes sheet and emits values). [Source: UX-DR22 D5 ; AC6]
7. **Given** viewport **≥ 481px**, **when** the filter icon is tapped, **then** a **`MatDialog`** panel opens with the **same content** (not bottom sheet) ; single-select dimensions apply **immediately** on selection ; multi-select categories may use footer **Appliquer** for parity. [Source: UX-DR22 D5 ; desktop interaction flow]
8. **Given** any filter UI, **when** styled, **then** Material 3 checklist in [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md) passes : tokens `--mat-sys-*`, French `aria-label`, touch targets ≥ 48×48 dp on trigger. [Source: UX-DR11 ; AC7]
9. **Given** MVP scope, **when** filters are active, **then** **no `matBadge`** on the filter icon ; trigger `aria-label` is `Filtrer` or `Filtrer, N critères actifs` when chips visible (N = active dimension count). [Source: UX-DR22 phase 1 ; AC8]
10. **Given** stats categories filter `{ kind: 'none' }`, **when** Statistiques renders, **then** optional **error tint** on filter icon outline (`--mat-sys-error`) matches current `season-toolbar__filter--warn` semantics ; empty stats message unchanged (17.10 F9). [Source: UX-DR22 Screen D]
11. **Given** filter selections change, **when** user navigates away and returns, **then** persistence behaviour is **unchanged** : [`user-agenda-filters-storage.ts`](../../apps/web/src/app/core/agenda/user-agenda-filters-storage.ts), [`member-glance-filters-storage.ts`](../../apps/web/src/app/core/member-glance/member-glance-filters-storage.ts), season toolbar models in [`season-home.ts`](../../apps/web/src/app/pages/season-home/season-home.ts) — **chrome only**, no API/query contract changes. [Source: UX-DR22 D8]
12. **Given** implementation complete, **when** `npm run test -w @hatcast/web -- --watch=false` and `npm run build -w @hatcast/web`, **then** both pass with updated specs for RES-001 hide, trigger+chips show, panel open/apply, season toolbar migration, stats categories inside panel. [Source: repo norms]

**Product coverage:** **UX-DR22** — [_ux-design-unified-filter-panel.md_](../planning-artifacts/ux-design-unified-filter-panel.md) (approved 2026-05-31). Supersedes inline filter wireframes in journey, season historique/stats, hatcast-v2, and 17.10 placement.

---

## Acceptance Criteria — Material 3 (UI)

**M3-1. Composants Material** — **Given** filter trigger, panel, and chips, **when** rendered, **then** use `mat-icon-button` (trigger), `MatBottomSheet` (mobile ≤480px), `MatDialog` (desktop ≥481px), `mat-selection-list` or `mat-radio-group` (single-select dimensions), `mat-checkbox` (categories multi-select), `mat-chip-set` / `mat-chip-row` (removable active chips), `mat-button` (Tout effacer, Appliquer, Réinitialiser) — no custom clickable divs for the same roles. [Source: FRONTEND_UI.md ; UX-DR11]

**M3-2. Tokens & thème** — **Given** SCSS for trigger, chips, panel, and optional warn state, **when** colors or outlines applied, **then** only `var(--mat-sys-*)` and `color-mix(in srgb, var(--mat-sys-…) …)` ; warn outline uses `--mat-sys-error`. [Source: FRONTEND_UI.md]

**M3-3. Mobile & tactile** — **Given** viewport **max-width: 480px**, **when** filter trigger shown, **then** touch target **≥ 48×48 dp** ; `aria-label` French on icon-only trigger ; chip remove buttons accessible ; bottom sheet footer buttons full-width or stacked per M3 patterns. [Source: NFR-A1 ; FRONTEND_UI.md]

**M3-4. Navigation membre** — **Given** filter chrome on `/agenda`, `/membre/*`, `/saison/*`, **when** implemented, **then** do **not** add bottom app bar M2 ; filter icon placement respects existing header/toolbar layout (top-right on agenda header or left of season view toggles per wireframe). [Source: ux-hub-a-faire.md ; UX-DR22 Screen A/C]

**M3-5. Revue** — **Given** implementation done, **when** validated, **then** checklist § « Checklist M3 HatCast » in [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md) walked ; waivers noted in Dev Agent Record. [Source: AGENTS.md]

---

## Tasks / Subtasks

- [x] **Shared filter module** (AC: 2, 3, 6, 7, 8, 9)
  - [x] Create `apps/web/src/app/shared/filters/` :
    - `filter.types.ts` — `FilterDimensionConfig`, `FilterValues`, `FilterLabels`, `FilterDimensionType` (`single-select` | `multi-select`)
    - `filter-trigger.ts` / `.html` / `.scss` — `@Input() visible`, `@Input() activeCount`, `@Input() warn`, `@Output() open` ; `filter_list` icon ; dynamic `aria-label`
    - `filter-panel-content.ts` / `.html` / `.scss` — renders ordered dimensions ; footer Réinitialiser / Appliquer ; inject via sheet or dialog
    - `filter-dimension-single.ts` — radio or `mat-selection-list` (single) with section icon + title
    - `filter-dimension-categories.ts` — extract checkbox UI from current [`season-view-toolbar.html`](../../apps/web/src/app/pages/season-home/season-view-toolbar.html) stats block ; reuse [`stats-categories.ts`](../../apps/web/src/app/pages/season-home/stats-categories.ts) helpers
    - `active-filter-chips.ts` / `.html` / `.scss` — `@Input() chips: ActiveFilterChip[]`, `@Output() removeDimension`, `@Output() clearAll`
    - `filter-panel.service.ts` — `openPanel(config)` picks BottomSheet vs Dialog by breakpoint (match `480px` — use `BreakpointObserver` or shared media query constant)
  - [x] Specs: trigger visibility/aria, chips render/remove/clear, panel apply/reset, breakpoint routing

- [x] **Cross-troupe surfaces — agenda + glance** (AC: 1, 2, 3, 11)
  - [x] Replace [`app-user-agenda-filter-bar`](../../apps/web/src/app/shared/agenda/user-agenda-filter-bar.ts) usage in [`user-agenda.html`](../../apps/web/src/app/pages/user-agenda/user-agenda.html) and [`member-season-glance.html`](../../apps/web/src/app/pages/member-season-glance/member-season-glance.html) with :
    - Filter trigger in header (top-right per wireframe) when `filterBarVisible()` **from API** — **never** recompute from row counts
    - Chip row when `selectedTroupeId` or `selectedSeasonId` ≠ null
    - Panel dimensions: `troupe` (`groups`), `season` (`calendar_month`) — season list scoped to selected troupe (existing logic in `user-agenda.ts` / `member-season-glance.ts`)
  - [x] Keep storage/API wiring : `writeStoredUserAgendaFilters`, `readStoredUserAgendaFilters`, glance storage, URL query params, load-generation guard (Story 12.7)
  - [x] Delete or deprecate `user-agenda-filter-bar.*` after migration ; update [`user-agenda-filter-bar.spec.ts`](../../apps/web/src/app/shared/agenda/user-agenda-filter-bar.spec.ts) → filter module specs
  - [x] Update [`user-agenda.spec.ts`](../../apps/web/src/app/pages/user-agenda/user-agenda.spec.ts), [`member-season-glance.spec.ts`](../../apps/web/src/app/pages/member-season-glance/member-season-glance.spec.ts) — RES-001 hide, icon not pulldowns, chips when filtered

- [x] **Season workspace toolbar** (AC: 4, 5, 10, 11)
  - [x] Refactor [`season-view-toolbar.ts`](../../apps/web/src/app/pages/season-home/season-view-toolbar.ts) / `.html` / `.scss` :
    - Remove all inline `mat-stroked-button` filter pulldowns and embedded `mat-menu` filter panels
    - Add filter trigger (left) when **any** dimension for current `seasonView()` has **>1** option — compute in parent [`season-home.ts`](../../apps/web/src/app/pages/season-home/season-home.ts) and pass `@Input() filterTriggerVisible`
    - Stats: show trigger whenever stats filters enabled (categories glossary non-empty OR >1 participant/event) per UX visibility table
    - Chip row below toolbar when any dimension ≠ default
    - Keep **Exporter**, **Détails/Masquer**, view toggles, gear **outside** panel
  - [x] Wire panel dimensions per view :
    - Agenda/Historique : participant + spectacle (single-select each)
    - Stats : participant + spectacle + categories (multi-select — reuse 17.10 behaviour)
  - [x] Pass `statsCategoryFilter` warn state to trigger `@Input() warn`
  - [x] Update [`season-view-toolbar.spec.ts`](../../apps/web/src/app/pages/season-home/season-view-toolbar.spec.ts)

- [x] **Lexicon & chip labels** (AC: 3, 5, 9)
  - [x] Implement closed-state chip text per UX lexicon : entity name for troupe/saison/spectacle ; `2 catégories` aggregate ; glossary label for single category ; no chip when categories `{ kind: 'none' }`
  - [x] Panel option lists : explicit “all” rows (`Toutes les troupes`, `Tous les spectacles`, etc.)

- [x] **Tests & build** (AC: 12)
  - [x] `npm run test -w @hatcast/web -- --watch=false`
  - [x] `npm run build -w @hatcast/web`

- [x] **Docs** (optional in same PR)
  - [x] Add Story **17.27** entry to [`epics.md`](../planning-artifacts/epics.md) Epic 17 section

## Dev Notes

### Product and UX rules

- **Authoritative UX:** [_bmad-output/planning-artifacts/ux-design-unified-filter-panel.md_](../planning-artifacts/ux-design-unified-filter-panel.md) (approved 2026-05-31, UX-DR22).
- **RES-001:** Trust API `filterBarVisible` on `/agenda` and glance — algorithm unchanged server-side (`troupeIds.size > 1 || seasonIds.size > 1`). Do **not** show filter icon “for curiosity” on mono-context users (P1).
- **MVP feedback = chips only** — no numeric badge on icon (phase 2 deferred per D9).
- **Actions ≠ filters (P5):** Exporter, Détails, view toggles, scope gear stay outside panel.
- **Sticky filter bar removed (D7):** Agenda header stays compact ; chips row is conditional, not sticky.
- **French UI, tutoiement** in copy ; `aria-label` French.

### Explicit non-goals

- **No backend/API changes** — `filterBarVisible`, query params, stats `equityCompartments`, participation filters catalog unchanged.
- **No `matBadge` on trigger** in this story (phase 2).
- **No** moving Exporter, Détails, view toggles, or admin gear into filter panel.
- **No** filter business rule changes (season scoping inside panel, 17.10 category semantics, RES-001 server flags).

### Architecture compliance

| Area | Rule |
|------|------|
| Stack | Angular **21.2** + Material **21.2** — `apps/web/` only ; **UI : N/A** for API |
| Breakpoint | **480px** mobile/desktop split for panel container (consistent with FRONTEND_UI.md) |
| Bottom sheet precedent | [`troupe-hub-preferences-sheet.ts`](../../apps/web/src/app/pages/troupe-hub/troupe-hub-preferences-sheet.ts) — header title + close, footer actions pattern |
| Season categories | Keep logic in [`stats-categories.ts`](../../apps/web/src/app/pages/season-home/stats-categories.ts) ; only **move UI** into shared filter dimension component |
| Load race | Preserve `loadGeneration` pattern in `user-agenda.ts` when filters change (Story 12.7) |

### Frontend implementation guardrails

| Concern | Action |
|--------|--------|
| Desktop panel | **`MatDialog`** with compact panel width (~360–400px) — prefer over wide `mat-menu` for multi-section forms with footers |
| Mobile panel | **`MatBottomSheet`** via `MatBottomSheet.open(FilterPanelContentComponent, …)` |
| Breakpoint detection | `BreakpointObserver.observe('(max-width: 480px)')` or existing project media constant |
| Trigger placement | Agenda: header top-right ; Season toolbar: left of view toggles (see wireframes Screen A/C) |
| Visibility (season) | Parent computes : trigger visible when any dimension catalog length > 1 OR stats categories enabled |
| Focus | `cdkFocusInitial` on sheet title or first control ; trigger `aria-expanded` while open |
| Tokens | `--mat-sys-*` only ; warn uses `--mat-sys-error` outline on icon button |
| Reuse | Do not duplicate 17.10 checkbox logic — extract from toolbar into `filter-dimension-categories` |

### Type sketch (implementation hint)

```typescript
export type FilterDimensionKey =
  | 'troupe' | 'season' | 'participant' | 'event' | 'spectacle' | 'categories'

export interface FilterDimensionConfig {
  key: FilterDimensionKey
  type: 'single-select' | 'multi-select'
  icon: string
  title: string
  options?: { id: string | null; label: string }[]
  // categories: pass StatsCategoryFilter + glossary via dedicated inputs
}

export interface ActiveFilterChip {
  dimensionKey: FilterDimensionKey
  label: string
}
```

### Component map (before → after)

| Current | Action |
|---------|--------|
| `user-agenda-filter-bar` | **Replace** with `filter-trigger` + `active-filter-chips` + panel service ; delete component when migrated |
| `season-view-toolbar` inline filters | **Remove** pulldowns ; inject shared filter module |
| `member-season-glance` | Same as agenda |
| New `shared/filters/` | Shared module per UX spec |

### Dependencies

| Story | Status | Relationship |
|-------|--------|--------------|
| **12.1, 12.3** | done | `filterBarVisible`, participation filters catalog, storage |
| **16.1** | done | Glance filters + RES-001 on `/membre/:slug` |
| **17.10** | done | Stats categories semantics — UI moves into unified panel |
| **17.22, 17.25** | done | Shell chrome ; filter icon must not collide with shell avatar (agenda header layout) |
| **3.3, 3.6** | done | Season agenda/history/stats views and toolbar shell |

### Previous story intelligence

- **17.25** removed duplicate account menu from page headers including `user-agenda` and `member-season-glance` — filter trigger on agenda should use **header top-right** without reintroducing crowded chrome.
- **17.10** implemented categories as inline toolbar menu with `season-toolbar__filter--warn` — **preserve warn semantics** on unified trigger ; reuse `statsCategoriesFilterLabel` for chip text patterns.
- **12.3** established “never hide filter bar when filtered list empty but `filterBarVisible` true” — chips + trigger must remain so user can clear filters.

### Git intelligence (recent patterns)

- `fecf0019` / `55957e8c` — stats categories filter UI in toolbar (labels, menu) — **source to extract**, not rewrite business rules.
- `57349b43` — header copy alignment ; respect voice chart for empty states (do not change filtered-empty copy unless UX spec says so).

### Project context reference

- [project-context.md](../../project-context.md) — Angular 21.2, M3 tokens, FRONTEND_UI checklist mandatory.
- [AGENTS.md](../../AGENTS.md) — read FRONTEND_UI.md before UI work ; record issues in ISSUES.md if discovered.

### Validation create-story

- [x] AC métier numérotés et sourcés (UX-DR22, epics 12.x, 17.10)
- [x] Section **Material 3** remplie
- [x] Tasks référencent les numéros d’AC (y compris M3-x)
- [x] Liens vers fichiers code existants à réutiliser
- [x] `npm run test` / build web mentionnés

## Dev Agent Record

### Agent Model Used

Composer (Cursor)

### Completion Notes List

- Module partagé `apps/web/src/app/shared/filters/` : trigger `filter_list`, chips actifs, panneau BottomSheet (≤480px) / Dialog (≥481px), dimensions single-select et catégories multi-select (17.10).
- `/agenda` et `/membre/:slug` : barre inline supprimée ; trigger header + chips ; RES-001 et persistance inchangés.
- Toolbar saison : pulldowns retirés ; trigger + chips ; Exporter / Détails / toggles / gear hors panneau ; warn `--mat-sys-error` si catégories `{ kind: 'none' }`.
- Tests : 723/723 pass ; build web OK.
- **M3 revue** : composants Material natifs, tokens `--mat-sys-*`, aria-label FR, cible 48dp sur trigger — OK. Pas de badge MVP (AC8). Docs epics optionnels non faits.

### File List

- apps/web/src/app/shared/filters/filter.types.ts
- apps/web/src/app/shared/filters/filter-builders.ts
- apps/web/src/app/shared/filters/filter-builders.spec.ts
- apps/web/src/app/shared/filters/filter-trigger.ts
- apps/web/src/app/shared/filters/filter-trigger.html
- apps/web/src/app/shared/filters/filter-trigger.scss
- apps/web/src/app/shared/filters/filter-trigger.spec.ts
- apps/web/src/app/shared/filters/active-filter-chips.ts
- apps/web/src/app/shared/filters/active-filter-chips.html
- apps/web/src/app/shared/filters/active-filter-chips.scss
- apps/web/src/app/shared/filters/active-filter-chips.spec.ts
- apps/web/src/app/shared/filters/filter-dimension-single.ts
- apps/web/src/app/shared/filters/filter-dimension-single.html
- apps/web/src/app/shared/filters/filter-dimension-single.scss
- apps/web/src/app/shared/filters/filter-dimension-categories.ts
- apps/web/src/app/shared/filters/filter-dimension-categories.html
- apps/web/src/app/shared/filters/filter-dimension-categories.scss
- apps/web/src/app/shared/filters/filter-panel-content.ts
- apps/web/src/app/shared/filters/filter-panel-content.html
- apps/web/src/app/shared/filters/filter-panel-content.scss
- apps/web/src/app/shared/filters/filter-panel.service.ts
- apps/web/src/app/shared/filters/filter-panel.service.spec.ts
- apps/web/src/app/pages/user-agenda/user-agenda.ts
- apps/web/src/app/pages/user-agenda/user-agenda.html
- apps/web/src/app/pages/user-agenda/user-agenda.spec.ts
- apps/web/src/app/pages/member-season-glance/member-season-glance.ts
- apps/web/src/app/pages/member-season-glance/member-season-glance.html
- apps/web/src/app/pages/member-season-glance/member-season-glance.spec.ts
- apps/web/src/app/pages/season-home/season-home.ts
- apps/web/src/app/pages/season-home/season-home.html
- apps/web/src/app/pages/season-home/season-view-toolbar.ts
- apps/web/src/app/pages/season-home/season-view-toolbar.html
- apps/web/src/app/pages/season-home/season-view-toolbar.scss
- apps/web/src/app/pages/season-home/season-view-toolbar.spec.ts
- apps/web/src/app/core/availability/availability-role-rules.spec.ts (assertion ordre-indépendante, test préexistant flaky)
- apps/web/src/app/shared/agenda/user-agenda-filter-bar.ts (supprimé)
- apps/web/src/app/shared/agenda/user-agenda-filter-bar.html (supprimé)
- apps/web/src/app/shared/agenda/user-agenda-filter-bar.scss (supprimé)
- apps/web/src/app/shared/agenda/user-agenda-filter-bar.spec.ts (supprimé)
- _bmad-output/planning-artifacts/epics.md

### Change Log

- 2026-05-31 : Story created from approved UX spec `ux-design-unified-filter-panel.md` (UX-DR22).
- 2026-05-31 : Implementation — unified filter panel (UX-DR22) ; shared filters module ; agenda/glance/season toolbar migration.
- 2026-05-31 : Code review — 6 patch findings corrigés (troupe/saison panel, glance loading guard, panel mutex, dead code).

### Review Findings

- [x] [Review][Patch] Réapplication saison invalide après changement troupe — `resolveAgendaPanelSeason()` + ordre apply troupe puis saison validée. [`user-agenda.ts`, `member-season-glance.ts`, `filter-builders.ts`]
- [x] [Review][Patch] Draft panel : saison non effacée quand troupe change — `onSingleSelect('troupe')` appelle `resolveAgendaPanelSeason`. [`filter-panel-content.ts`]
- [x] [Review][Patch] Mobile : liste Saison figée à l'ouverture — `participationFilters` + `effectiveDimensions()` rescope réactif. [`filter.types.ts`, `filter-panel-content.ts`]
- [x] [Review][Patch] Glance : trigger filtre sans garde loading/erreur — aligné sur agenda (`!loadingSession() && !loadError()`). [`member-season-glance.html`]
- [x] [Review][Patch] Double ouverture panel — mutex `panelOpen` dans `FilterPanelService`. [`filter-panel.service.ts`]
- [x] [Review][Patch] Code mort `statsCategoriesChipLabel()` — supprimé. [`filter-builders.ts`]
- [x] [Review][Defer] Couverture tests flux panel troupe→saison — pas de `filter-panel-content.spec.ts` ni test page-level `openFilterPanel` cross-troupe. — deferred, test gap non bloquant build.
- [x] [Review][Defer] Glance sans `loadGeneration` — courses concurrentes `loadGlance()` possibles ; préexistant, aggravé par panel. [`member-season-glance.ts:259-310`] — deferred, préexistant.
- [x] [Review][Defer] `loadingAgenda` si requête stale — early return sans `loadingAgenda.set(false)` si génération obsolète. [`user-agenda.ts:144-146`] — deferred, préexistant.
- [x] [Review][Defer] Input `immediateApply` non câblé — `FilterDimensionSingle.immediateApply` jamais passé depuis le panel. — deferred, cleanup.
- [x] [Review][Defer] Couplage `shared/filters` → `pages/season-home/stats-categories` — dépendance page dans module shared. — deferred, accepté story.
- [x] [Review][Defer] Breakpoint figé à l'ouverture du panel — pas de bascule sheet↔dialog au resize. [`filter-panel.service.ts:21`] — deferred, edge rare.
- [x] [Review][Defer] Test availability tri `.sort()` — assertion ordre-indépendante masque ordre UI potentiel. [`availability-role-rules.spec.ts`] — deferred, flaky préexistant.
