---
title: UX — Scope admin menu (Epic 17.2)
author: Patrice
date: '2026-05-25'
status: approved
supersedes: app-scope-admin-bar (full-width strip, rejected 2026-05-25)
relatedArtifacts:
  - docs/adr/0013-troupe-navigation-equity-tags-event-slugs.md
  - _bmad-output/planning-artifacts/ux-design-journey-league-agenda.md
  - _bmad-output/planning-artifacts/sprint-change-proposal-2026-05-25-scope-admin-menu.md
  - _bmad-output/implementation-artifacts/17-2-bandeau-administration-par-scope.md
stakeholderSignOff: '2026-05-31 — season + event detail gear in breadcrumb row (UX-DR22.1, ux-design-event-detail-chrome-alignment.md approved); 2026-05-31 PO Option A — Modifier saison in season workspace gear (17.31)'
amendmentDate: '2026-05-31'
amendmentNote: 'Patrice — season gear in breadcrumb row (UX-DR22.1 / 17.28); event detail chrome alignment; 17.31 adds Modifier saison (FR11 gap post-17.5)'
---

# UX Design — Scope admin menu (`app-scope-admin-menu`)

**Purpose:** Single reference for **where** the administration gear appears, **what** the menu contains, and **what must never appear** in the breadcrumb header row — after Correct Course 2026-05-25.

---

## Design principles

| Rule | Detail |
|------|--------|
| **Separation** | Breadcrumb row = **context navigation** (troupe → saison → spectacle) + **account** menu. **Season workspace:** scope admin gear also lives here (UX-DR22.1). |
| **Admin entry** | **One gear per screen** — **season workspace + event detail:** breadcrumb row end ; **other screens:** view chrome (toolbar / tab row / hero actions). |
| **Density** | No dedicated full-width row for administration. |
| **Discoverability** | Material `settings` icon; `aria-label` includes scope in French. |
| **Gating** | Gear **hidden** when `items.length === 0` (no empty or disabled gear). |
| **Interaction** | `mat-icon-button` + `mat-menu`; one tap to open, one tap per action. |

---

## Shared component

**Selector:** `app-scope-admin-menu`

**Inputs:**

- `scope: 'troupe' | 'saison' | 'event'` — drives `aria-label` only (menu item labels stay explicit).
- `items: ScopeAdminMenuItem[]` — `{ label, icon, routerLink?, queryParams?, action? }`.

**Aria-labels (French):**

| scope | `aria-label` on icon button |
|-------|----------------------------|
| troupe | `Administration de la troupe` |
| saison | `Administration de la saison` |
| event | `Administration du spectacle` |

**Menu content:** flat list of `mat-menu-item` rows (icon + label). No nested submenus in MVP.

---

## Screen 1 — Season workspace (`/saison/:slug`)

**Persona:** Season organizer, troupe admin.

### Chrome layout (desktop)

```
┌─────────────────────────────────────────────────────────────────┐
│ [logo] Troupe › Saison title                              [⚙]   │  ← breadcrumb row (gear here — UX-DR22.1)
├─────────────────────────────────────────────────────────────────┤
│ (mobile only: H1 saison title)                                   │
├─────────────────────────────────────────────────────────────────┤
│ [Détails]                     [Agenda|Historique|Stats] [filter]│  ← filter right (UX-DR22.1)
├─────────────────────────────────────────────────────────────────┤
│ agenda / history content…                                        │
└─────────────────────────────────────────────────────────────────┘
```

### Gear placement

- **Component host (season workspace):** `app-season-header` — **end of breadcrumb row** (after context switcher / season title).
- **Filter trigger:** `app-season-view-toolbar` **right cluster** (after view toggles) — see [ux-design-unified-filter-panel.md](./ux-design-unified-filter-panel.md) UX-DR22.1.
- **Mobile (≤480px):** gear stays in **breadcrumb row** (not on view-toggle row). Filter on action row with **Détails** when visible (Stats view).

### Menu entries (when permitted)

**Order (flat list):** **Modifier** → **Nouveau spectacle** → **Participants** → **Organisateur·ices** → **Exporter** (skip rows user cannot use).

| Permission | Label | Destination / action |
|------------|-------|----------------------|
| `canManageSeasons` | **Modifier** | Opens `SeasonFormDialog` (`mode: 'edit'`) for current season — **Story 17.31** ; on slug change after title edit, navigate to new `/saison/:slug` with `replaceUrl` |
| `canManageEvents` | Nouveau spectacle | Opens create `EventFormDialog` (existing) |
| `canManageSeasonParticipants` | Participants | `/saison/:slug/admin/participants` |
| `canManageSeasonOrganizersOnly` | Organisateur·ices | `/saison/:slug/admin/membres?onglet=organisateurs` |
| `isSeasonOrganizer` or `isTroupeAdmin` | **Exporter** | Download full-season Statistiques CSV (`download` icon) — **Story 17.32** |

**Note:** Season organizers **do not** receive **Modifier** (`canManageSeasons` is troupe-admin only).

### Acceptance hints

- [ ] Gear **in** `app-season-header` breadcrumb row (season workspace — UX-DR22.1).
- [ ] No gear in `season-view-toolbar` right cluster (filter occupies that slot).
- [ ] No `.scope-admin-bar` strip between header and toolbar.
- [ ] Gear absent when user lacks **all** entries above (including **Modifier** when not troupe admin).
- [ ] **Modifier** re-homes season edit lost when `/seasons` redirect landed (17.5 gap — **17.31**).

---

## Screen 2 — Event detail (`/saison/:slug/event/:id`)

**Persona:** Season organizer, event participant admin, event organizer.

### Chrome layout

> **2026-05-31 (approved):** [ux-design-event-detail-chrome-alignment.md](./ux-design-event-detail-chrome-alignment.md) — gear in breadcrumb row; mobile duplicate title/date removed; agenda card ⋮ removed.

```
┌─────────────────────────────────────────────────────────────────┐
│ [logo] Troupe › Saison › Event title              [ ⚙ ] [avatar ▾] │  ← gear here
├─────────────────────────────────────────────────────────────────┤
│ [ Infos | Dispos | Équipe ]                                      │
├─────────────────────────────────────────────────────────────────┤
│ Infos tab panel:                                                 │
│              [ badge statut … ]          ← centered               │
│  Titre / Description / Date / Lieu…                              │
└─────────────────────────────────────────────────────────────────┘
```

### Gear placement

- **Approved (E1/E2):** `app-event-detail-header` breadcrumb row end — mirror `season-header__admin`; visible on **all tabs** when `items.length > 0`.
- **Supersedes:** Infos-tab-only placement in `event-infos__header` (2026-05-25 sign-off).
- **Agenda (E3):** Remove card `more_vert` menu; **Modifier** / **Archiver** live only in this gear menu.

### Unified menu entries (one `mat-menu`)

| Condition | Label | Behaviour |
|-----------|-------|-----------|
| `canManageSeasonParticipants` | Participants | Link to season admin participants |
| `canManageSeasonOrganizersOnly` | Organisateur·ices | Link to season membres + `onglet=organisateurs` |
| Event participant admin only | Participants du spectacle | Opens `EventFormDialog` (participants) |
| Event organizer (no duplicate saison orga link) | Organisateur·ices du spectacle | Opens `EventFormDialog` (organizers) |
| `canManageEvents` && !archived | Modifier | Opens edit dialog |
| `canManageEvents` && !archived | Archiver | Confirmation then archive |

**Dedup rule:** Do not show « Organisateur·ices du spectacle » when season-level « Organisateur·ices » is already in the menu.

### Acceptance hints

- [ ] Gear in `app-event-detail-header` row when admin items exist (E1).
- [ ] Gear visible on Infos, Dispos, and Équipe tabs (E2).
- [ ] No `more_vert` on Infos tab or agenda cards (E3).
- [ ] No duplicate mobile title/date block under header (E4/E5).

---

## Screen 3 — Troupe hub (`/troupes/:slug`) [stub until 17.4]

**Persona:** `TROUPE_ADMIN`.

### Chrome layout

```
┌─────────────────────────────────────────────────────────────────┐
│ (minimal chrome — stub)                              [avatar?] │
├─────────────────────────────────────────────────────────────────┤
│ Saison 2025-26                                    [⚙]          │  ← hero row: title + gear
│ Hub troupe — story 17.4                                        │
│ [Voir mon agenda]                                              │
└─────────────────────────────────────────────────────────────────┘
```

### Gear placement

- **Hero row:** `display: flex; align-items: center; justify-content: space-between; gap: 0.75rem`
- Title (`h1`) flexes/min-width 0; gear `flex-shrink: 0`.

### Menu entries

| Role | Label | Destination |
|------|-------|-------------|
| `TROUPE_ADMIN` | Membres | `/troupe/:slug/admin/membres` |

### Future (17.4)

- Same gear pattern on full hub; optional second entry « Paramètres troupe » later.
- **Préférences** (pseudo, rôles) stays **separate** secondary control — not inside admin gear menu.

---

## Screen 4 — Explicit non-placement

| Surface | Admin pattern |
|---------|----------------|
| `/agenda` | No scope gear (cross-season member view) |
| `/troupes` list | Troupe cards; troupe-level admin on `/seasons` list block unchanged (17.3/17.5) |
| Breadcrumb header row | **Never** scope admin gear |
| Global app shell | **Never** duplicate gear beside avatar |

---

## Responsive & accessibility

- **Touch target:** Material icon button default (48px) — do not shrink below 40px.
- **Focus:** visible focus ring on gear and menu items.
- **Keyboard:** Menu opens on Enter/Space; arrow keys navigate items; Esc closes.
- **Screen reader:** Scope in gear `aria-label`; each `mat-menu-item` has visible text label (not icon-only).

---

## Visual reference (season toolbar)

```text
Filters row (optional):  [ group ▾ ] [ event ▾ ]
View row:                [ Agenda | Historique ]  [ ⚙ ]
```

Gear uses `settings` icon (consistent with legacy season header menu before 17.1).

---

## Implementation mapping

| File | Responsibility |
|------|----------------|
| `shared/scope-admin-menu/*` | Presentational gear + menu |
| `season-view-toolbar.*` | Host gear on season workspace |
| `season-home.ts` | Compute `seasonAdminItems`, pass to toolbar |
| `event-detail.*` | `event-detail__tabs-shell` + items |
| `troupe-hub-stub.*` | Hero row + items |

---

## Follow-up (out of scope 17.2 — PO 2026-05-25)

**Closed in Story 17.11 (2026-05-25):** admin destination pages now use `app-context-breadcrumb` with admin leaf; chevron back removed. See [17-11-breadcrumb-pages-admin-back-office.md](../implementation-artifacts/17-11-breadcrumb-pages-admin-back-office.md).

---

## Changelog

| Date | Change |
|------|--------|
| 2026-05-31 | **17.31** — Screen 1 : add **Modifier** (`canManageSeasons`) first in season workspace gear ; closes 17.5 edit gap (PO Option A) |
| 2026-05-25 | Event Infos: single gear merges ⋮ + scope admin items |
| 2026-05-25 | Initial spec — replaces `app-scope-admin-bar` strip per SCP approval |
