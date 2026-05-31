---
title: UX — Unified filter panel (icon trigger + hub + pickers)
author: Sally (UX) + Patrice
date: '2026-05-31'
status: approved
stakeholderSignOff: '2026-05-31 — UX-DR22.1 hub + individual pickers; filter trigger right; gear in breadcrumb; multi-select participant/spectacle (season); RES-001 unchanged'
amendmentDate: '2026-05-31'
amendmentNote: 'Patrice — post-17-27 field feedback: mega-dialog with expanded lists does not scale; restore V1 searchable multi-select pickers; hub panel; chips anchored to trigger; gear moves to breadcrumb row'
supersedes:
  - ux-design-journey-league-agenda.md § Filters (inline bar wireframe)
  - ux-design-season-historique-statistiques.md § Toolbar layout matrix Row A (inline filters)
  - ux-design-hatcast-v2.md § Filter and view controls (inline dropdowns)
  - ux-design-stats-equity-compartment-filter-17-10.md § Placement (inline Groupes trigger)
  - ux-design-unified-filter-panel.md § UX-DR22 v1 (mega-dialog, filter left, gear in toolbar) — Story 17.27 partial implementation
relatedArtifacts:
  - _bmad-output/planning-artifacts/ux-design-journey-league-agenda.md
  - _bmad-output/planning-artifacts/ux-design-season-historique-statistiques.md
  - _bmad-output/planning-artifacts/ux-design-stats-equity-compartment-filter-17-10.md
  - _bmad-output/planning-artifacts/ux-design-scope-admin-menu-epic17.md
  - _bmad-output/implementation-artifacts/17-27-panneau-filtres-unifie.md
  - _bmad-output/implementation-artifacts/17-28-filtres-hub-pickers.md
  - docs/v2/technical/FRONTEND_UI.md
  - legacy/src/components/PlayerSelectorModal.vue
  - legacy/src/components/EventSelectorModal.vue
  - apps/web/src/app/shared/filters/
  - apps/web/src/app/pages/season-home/season-view-toolbar.ts
uxDr: UX-DR22.1
---

# UX Design — Unified filter panel (`app-filter-hub`)

**Purpose:** Single reference for **how members access filters** across V2 surfaces — a discreet **icon trigger**, a lightweight **hub panel** (dimension summary rows), **individual picker modals** per dimension (search + multi-select at scale), and **active filter chips anchored to the trigger**.

**Product rationale (Patrice, 2026-05-31):** Most members have **one troupe** and **one season**; filtering is irrelevant noise for them. Multi-context users are a minority; a discreet **filter icon** is enough — no permanent filter row.

**Course correction (Patrice, 2026-05-31 — UX-DR22.1):** Story **17.27** shipped icon + chips but used a **single mega-dialog** with fully expanded `mat-selection-list` rows. That fails at real catalog sizes (30+ members, 40+ events) and dropped V1 affordances (typeahead search, multi-checkbox selection, spectacle scope toggles). **17.28** replaces the mega-dialog with **hub + pickers** and adjusts toolbar chrome (filter right, gear in breadcrumb).

---

## Design principles

| ID | Rule | Detail |
|----|------|--------|
| P1 | **Zero chrome when nothing to filter** | No icon, no chips, no extra vertical space when every dimension has ≤1 option **or** RES-001 applies (1 troupe + 1 saison on cross-troupe screens). |
| P2 | **Icon-only entry** | Never show inline `mat-stroked-button` filter pulldowns in page chrome. One `filter_list` trigger opens the **hub**. |
| P3 | **Chips anchored to trigger** | When any dimension ≠ default, show removable chips **in the filter column** (right cluster), visually connected to the trigger — not a disconnected full-width row on the opposite side of the toolbar. |
| P4 | **Feedback without reopening hub** | Chips let users see and clear filters; chip click reopens the **picker for that dimension**. |
| P5 | **Actions ≠ filters** | **Exporter**, **Détails**, view toggles stay **outside** filter UI. **Scope admin gear** lives in the **breadcrumb row** (see D14). |
| P6 | **French UI, M3** | Tutoiement; Material components + `--mat-sys-*` tokens (UX-DR11). |
| P7 | **Same vocabulary everywhere** | Hub rows show closed-state summary; pickers use explicit “all” rows (see Lexicon). |
| P8 | **Scale by design** | Hub never embeds long scrollable lists. Heavy selection happens in **dedicated picker modals** with search and bounded viewport height. |
| P9 | **Extensible criteria slots** | Event picker includes scope toggles (past, archived) as the first **extensibility pattern** for future filter dimensions. |

---

## Decisions (locked)

| ID | Decision |
|----|----------|
| D1 | Replace inline filter bars with **`app-filter-trigger`** + **`app-filter-hub`**. |
| D2 | **RES-001 preserved:** cross-troupe screens (`/agenda`, `/membre/:userSlug` glance) — **no filter chrome at all** when exactly **1 troupe + 1 saison** participation. |
| D3 | When RES-001 does **not** apply but user has **>1 option on any dimension**, show **filter icon only** (not inline pulldowns). |
| D4 | Season workspace (`/saison/:slug`) — filter icon when **any** filter dimension has **>1 option** (participant, spectacle, categories on Stats). |
| D5 | Mobile (≤480px): **hub** = **`MatBottomSheet`**. Desktop (≥481px): **hub** = compact **`mat-menu`** panel (~320px) or small **`MatDialog`** — **never** a tall dialog stacking expanded lists. |
| D6 | Active filter **chips** shown when any dimension ≠ default; hidden when all defaults. **No `matBadge` on icon** (phase 2 optional, unchanged). |
| D7 | Sticky filter chrome **removed** from agenda; header/toolbar stays compact. |
| D8 | Persist filter selections via existing storage keys where possible; **season participant/spectacle multi-select** may extend storage shape in **17.28** (see Data model). |
| D9 | **Phase 2 (optional):** numeric badge on filter icon if usability testing warrants it. |
| **D10** | **Hub panel:** ordered **summary rows** (icon + dimension label + current value + chevron). **No option lists inside the hub.** |
| **D11** | **Picker modal per dimension:** tap hub row → dedicated modal/sheet (`Filtrer les participants`, `Filtrer les événements`, etc.). |
| **D12** | **Season participant + spectacle:** **multi-select** with search + checkboxes (V1 parity — `PlayerSelectorModal`, `EventSelectorModal`). |
| **D13** | **Event picker extensibility:** funnel menu with toggles **Inclure les événements passés** and **Inclure les archivés** (default: view-dependent — see Event picker). |
| **D14** | **Gear placement:** `app-scope-admin-menu` moves to **end of breadcrumb row** (`season-header` / `context-breadcrumb` host). **Amends** Epic 17.2 sign-off (gear was in toolbar). |
| **D15** | **Filter trigger placement (season):** **right cluster** of `season-view-toolbar` — last control after view toggles (occupies former gear slot). |
| **D16** | **Cross-troupe dimensions** (troupe, season): remain **single-select** (small catalogs); hub row opens a **compact single-select picker** (radio / selection-list ≤ ~10 items) — not the heavy multi-select pattern. |

---

## Shared components

### `app-filter-trigger`

**Role:** Icon button opening the **hub**. Unbadged in MVP.

| Property | Value |
|----------|-------|
| Control | `mat-icon-button` |
| Icon | `filter_list` |
| `aria-label` | `Filtrer` when no active filters; `Filtrer, N critères actifs` when chips visible (N = active **dimension** count, not checkbox count) |
| Touch target | ≥ **48×48 dp** |
| Visibility | `@Input() visible` — parent computes from dimension catalog |
| Placement (season) | **Right cluster**, after view toggles (D15) |
| Placement (agenda / glance) | Header top-right (unchanged) |

### `app-filter-hub`

**Role:** Lightweight launcher — **summary rows only**.

**Container:** `MatBottomSheet` (mobile) / `mat-menu` or compact dialog (desktop). Fixed modest height (~auto, max **~280px** for 3 rows).

**Row anatomy:**

```
[mat-icon]  Dimension label          Current summary value     chevron_right
```

**Inputs:** `dimensions: FilterHubDimension[]`, `values: FilterValues`, `labels`

**Outputs:** `openPicker(dimensionKey)`, `close`

**No footer** on hub (pickers own Apply/Reset). Optional **Fermer** / backdrop dismiss.

**Example (Stats, nothing filtered yet):**

```
┌─ Filtres ──────────────────────────────── ✕ ┐
│ person     Membre          Tous les membres › │
│ event      Spectacle       Tous les spectacles › │
│ category   Catégories      Toutes            › │
└─────────────────────────────────────────────┘
```

### `app-filter-participant-picker`

**Role:** Heavy picker for season (and future surfaces with large member catalogs).

| Element | Spec |
|---------|------|
| Title | `Filtrer les participants` |
| Search | `mat-form-field` — placeholder `Rechercher un participant…` ; filters list client-side |
| “All” row | `Tous` + helper `Charger tous les participants` + master checkbox |
| Rows | Avatar (if available) + display name + optional stats subline (`N dispos / M sélections` when data exists) + `mat-checkbox` |
| Selection | **Multi-select** ; empty set = “none” warning state only if product requires — default empty → treat as “Tous” on Apply |
| Footer | **Réinitialiser** (secondary) + **Appliquer** (primary, closes picker) |
| Container | `MatDialog` desktop / full-height `MatBottomSheet` mobile ; `max-height: 85vh` ; list scrolls internally |
| V1 reference | `legacy/src/components/PlayerSelectorModal.vue` |

### `app-filter-event-picker`

**Role:** Heavy picker for season spectacle filter.

| Element | Spec |
|---------|------|
| Title | `Filtrer les événements` |
| Search | placeholder `Rechercher un événement…` |
| Scope menu | Funnel icon opening **`mat-menu`** : section **AFFICHER** with checkboxes **Passés**, **Archivés** (French labels; map to `showPastEvents`, `showArchivedEvents`) |
| “All” row | `Tous les événements` + master checkbox (applies to **currently filtered list**) |
| Rows | Event icon + title + date + optional status chip (`Passé`) + metadata subline + checkbox |
| Selection | **Multi-select** |
| Footer | Réinitialiser + Appliquer |
| Defaults | **Agenda view:** past/archived toggles off (upcoming scope). **Historique view:** past on by default. **Stats:** both off by default (non-archived season events); user may enable archived for audit. |
| V1 reference | `legacy/src/components/EventSelectorModal.vue` |

### `app-filter-dimension-categories`

**Role:** Unchanged **17.10** checkbox panel — opened as **its own modal** from hub row, not embedded in hub or participant/event pickers.

### `app-filter-dimension-single` (compact)

**Role:** Cross-troupe **troupe** / **season** pickers only — radio or short `mat-selection-list` inside a small dialog/sheet.

### `app-active-filter-chips`

**Role:** Active-filter feedback **anchored to filter column** (P3).

- Host: wrapper `filter-trigger-column` containing trigger + chip stack
- Chips appear **below** trigger (desktop) or **wrapped row under right cluster** (mobile)
- One chip per **dimension** with non-default value; multi-select shows aggregate label (see Lexicon)
- Remove icon → reset dimension
- **Tout effacer** adjacent to chips (text button)
- Chip click → reopen that dimension’s picker (P4)

**Example (season Stats, desktop):**

```
[Exporter] [Détails]     [Agenda | Historique | Stats]  [filter_list]
                                                          Aurélien ✕  2 spectacles ✕  Tout effacer
```

---

## Lexicon

### Hub row summaries (closed state)

| Dimension | Default summary | Active summary (examples) |
|-----------|-----------------|---------------------------|
| Troupe | `Toutes les troupes` | Troupe name |
| Saison | `Toutes les saisons` | Season title |
| Membre | `Tous les membres` | `Aurélien` / `3 membres` |
| Spectacle | `Tous les spectacles` | Event title / `2 spectacles` |
| Catégories | `Toutes` | Glossary label / `2 catégories` |

### Chip labels (multi-select aggregates)

| Selection count | Chip text |
|-----------------|-----------|
| 0 (default) | No chip |
| 1 | Entity name |
| 2 | `Name1, Name2` (truncate with ellipsis if > ~24 chars) |
| ≥3 | `N membres` / `N spectacles` |

Categories: unchanged from 17.10 (`2 catégories`, glossary label, none → warn state).

### Active dimension count (a11y)

Count **+1** per dimension where value ≠ default — **not** per checked row inside a picker.

---

## Visibility rules

Unchanged from UX-DR22 — see RES-001 and season workspace table. Trigger hidden when mono-context or all catalogs ≤1 option.

---

## Screen layouts

### Screen A — User agenda (`/agenda`) & Screen B — Glance

Unchanged placement (header top-right). **Hub** replaces mega-dialog:

- Hub rows: **Troupe**, **Saison** (single-select compact pickers)
- Chips anchored under/right of trigger in header column when active

### Screen C — Season workspace

**Desktop — full chrome:**

```
┌──────────────────────────────────────────────────────────────────────┐
│ [logo] La Malice › Malice 2025-26                              [⚙] │  ← gear in breadcrumb row (D14)
├──────────────────────────────────────────────────────────────────────┤
│ [Exporter] [Détails]          [Agenda | Historique | Stats] [filter]│  ← filter right (D15)
│                                                         (chips here) │
├──────────────────────────────────────────────────────────────────────┤
│ content…                                                             │
└──────────────────────────────────────────────────────────────────────┘
```

**Historique Row A:** `[Exporter]` + filter column (right, with toggles row).

**Statistiques Row A:** `[Exporter]` + `[Détails]` + filter column.

**Mobile (≤480px):**

```
Row 1: [Exporter] [Détails]                    [filter + chips column]
Row 2: [ Agenda | Historique | Statistiques ]
(breadcrumb row: logo … switcher … [⚙])
```

Gear **not** on Row 2 anymore — only in breadcrumb row.

### Screen D — Statistiques categories

Categories hub row opens isolated **17.10** picker modal. Warn tint on trigger when `{ kind: 'none' }` unchanged.

---

## Interaction flows

### Open filters

1. User taps `filter_list`
2. **Hub** opens (sheet/menu) — summary rows only
3. Focus: hub title or first row

### Select a dimension

1. User taps hub row (e.g. Membre)
2. Hub closes (or stays under picker on desktop — prefer **close hub** when picker opens)
3. **Picker modal** opens with search focused
4. User searches, toggles checkboxes, optionally opens scope menu (events)
5. **Appliquer** → emit values, close picker, update chips, host refetches

### Chip interactions

- Remove chip → reset that dimension to default
- Click chip body → reopen that dimension’s picker with current selection
- **Tout effacer** → all defaults

### Reset

- **Réinitialiser** in picker → dimension default, stay open or close per picker
- **Tout effacer** on chips → global reset

---

## Data model (17.28 implementation note)

| Surface | Dimension | UX-DR22 (17.27) | UX-DR22.1 |
|---------|-----------|-----------------|-----------|
| Cross-troupe | troupe, season | `string \| null` single | unchanged |
| Season workspace | participant | `string \| null` single | **`string[]` or `Set<string>`** — empty / all ids = “Tous” |
| Season workspace | spectacle | `string \| null` single | **`string[]`** per view (agenda/history/stats may share or separate — prefer **one selection state per view** if API differs) |
| Season workspace | categories | `StatsCategoryFilter` | unchanged |

**API / query params:** Story **17.28** must define backend support or client-side filtering strategy for multi-id participant/spectacle filters. UX spec does not mandate API shape — implementation story must align with `DOMAIN.md` / existing endpoints.

---

## States

| State | UI |
|-------|-----|
| No filter chrome | RES-001 or all dimensions ≤1 option |
| Default multi-context | Plain filter icon only; no chips |
| Active filters | Icon + **chips in filter column** |
| Hub open | Hub overlay; trigger `aria-expanded=true` |
| Picker open | Picker overlay; hub closed |
| Categories none (stats) | Error tint on trigger (17.10 F9) |
| Filtered empty list | Existing copy + chips remain |

---

## Component map (implementation)

| Asset (17.27) | Action in 17.28 |
|---------------|-----------------|
| `filter-panel-content` (mega-dialog) | **Replace** with `filter-hub` + picker components |
| `filter-dimension-single` (in hub) | **Move** to compact picker only (cross-troupe) |
| `filter-trigger` | **Move** to toolbar right (season); add `filter-trigger-column` wrapper |
| `active-filter-chips` | **Anchor** to trigger column; chip click → open picker |
| `season-view-toolbar` | Remove gear; filter right |
| `season-header` | **Add** `app-scope-admin-menu` in breadcrumb row end |
| New | `filter-hub`, `filter-participant-picker`, `filter-event-picker` |

**Non-goals (17.28):**

- RES-001 algorithm changes
- Moving Exporter / Détails / view toggles into filter UI
- Filter icon for mono-context users

---

## Acceptance criteria (UX)

1. **Given** RES-001 on `/agenda` or glance, **when** page loads, **then** no filter chrome.
2. **Given** season workspace with >1 member or event, **when** user opens filter, **then** **hub** shows summary rows only — **no** embedded scrollable member/event lists.
3. **Given** hub open, **when** user taps Membre, **then** **participant picker** opens with search field and multi-select checkboxes (V1 parity).
4. **Given** hub open, **when** user taps Spectacle, **then** **event picker** opens with search, multi-select, and scope toggles (past, archived).
5. **Given** active filters, **when** toolbar renders, **then** chips appear **in the filter column** (right), visually adjacent to trigger — not isolated on the left.
6. **Given** season workspace desktop, **when** chrome renders, **then** gear is in **breadcrumb row** and filter trigger is **right of view toggles**.
7. **Given** Statistiques, **when** user filters categories, **then** 17.10 semantics unchanged; categories opened from hub row as isolated picker.
8. **Given** viewport ≤480px, **when** filter tapped, **then** hub = bottom sheet; pickers = full-height sheets with Appliquer footer.
9. **Given** any filter UI, **when** styled, **then** M3 checklist passes (FRONTEND_UI.md).
10. **Given** MVP, **when** filters active, **then** no badge on filter icon.

---

## Material 3 hints

| Concern | Material choice |
|---------|-----------------|
| Trigger | `mat-icon-button` |
| Hub | `MatBottomSheet` / `mat-menu` / compact `MatDialog` |
| Pickers | `MatDialog` (desktop) / `MatBottomSheet` (mobile) |
| Search | `mat-form-field` + `matInput` |
| Multi-select rows | `mat-checkbox` in scrollable list |
| Single-select (cross-troupe) | `mat-selection-list` or `mat-radio-group` |
| Categories | existing 17.10 checkboxes |
| Chips | `mat-chip-set`, removable |
| Scope menu | `mat-menu` from icon button |

---

## Documentation updates

| Document | Change |
|----------|--------|
| `ux-design-scope-admin-menu-epic17.md` | Gear → breadcrumb row (season workspace) |
| `ux-design-season-historique-statistiques.md` | Toolbar wireframe → filter right, gear breadcrumb |
| `ux-design-journey-league-agenda.md` | Hub model link |
| `ux-design-stats-equity-compartment-filter-17-10.md` | Categories via hub row → isolated picker |

---

## Stakeholder sign-off

| Field | Value |
|-------|-------|
| Decision | **UX-DR22.1** — hub + individual pickers; multi-select season filters; filter right; gear in breadcrumb; chips anchored to trigger |
| Approved by | Patrice |
| Date | 2026-05-31 |
| Supersedes | UX-DR22 mega-dialog layout (17.27 implementation to be corrected in 17.28) |
