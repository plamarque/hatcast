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
stakeholderSignOff: '2026-05-25 — gear + mat-menu inline in view chrome (not breadcrumb row, not admin strip)'
---

# UX Design — Scope admin menu (`app-scope-admin-menu`)

**Purpose:** Single reference for **where** the administration gear appears, **what** the menu contains, and **what must never appear** in the breadcrumb header row — after Correct Course 2026-05-25.

---

## Design principles

| Rule | Detail |
|------|--------|
| **Separation** | Breadcrumb row = **context navigation** (troupe → saison → spectacle) + **account** menu only. |
| **Admin entry** | **One gear per screen** in **view chrome** (toolbar / tab row / hero actions). |
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
│ [logo] Troupe › Saison title                          [avatar ▾] │  ← breadcrumb row (NO gear)
├─────────────────────────────────────────────────────────────────┤
│ (mobile only: H1 saison title)                                   │
├─────────────────────────────────────────────────────────────────┤
│ [Participant ▾] [Spectacle ▾]     [Agenda|Historique]  [⚙]    │  ← season-view-toolbar
├─────────────────────────────────────────────────────────────────┤
│ agenda / history content…                                        │
└─────────────────────────────────────────────────────────────────┘
```

### Gear placement

- **Component host:** inside `app-season-view-toolbar`, **right cluster**.
- **Order (LTR):** filters (left, flex) → `mat-button-toggle-group` (Agenda | Historique) → **gear** (last, `flex-shrink: 0`).
- **Mobile (≤480px):** toolbar stacks vertically; gear stays on the **same row as view toggles** when possible (row: toggles + gear); filters above.

### Menu entries (when permitted)

| Permission | Label | Destination / action |
|------------|-------|----------------------|
| `canManageSeasonParticipants` | Participants | `/saison/:slug/admin/participants` |
| `canManageSeasonOrganizersOnly` | Organisateur·ices | `/saison/:slug/admin/membres?onglet=organisateurs` |

### Acceptance hints

- [ ] No gear in `app-season-header` breadcrumb row.
- [ ] No `.scope-admin-bar` strip between header and toolbar.
- [ ] Gear absent when user lacks both permissions above.

---

## Screen 2 — Event detail (`/saison/:slug/event/:id`)

**Persona:** Season organizer, event participant admin, event organizer.

### Chrome layout

```
┌─────────────────────────────────────────────────────────────────┐
│ [logo] Troupe › Saison › Event title                  [avatar ▾] │  ← NO gear
├─────────────────────────────────────────────────────────────────┤
│ [ Infos | Dispos | Équipe ]                                      │
├─────────────────────────────────────────────────────────────────┤
│ Infos tab panel:                                                 │
│  [badge statut …]                                    [ ⚙ ]      │  ← gear top-right
│  Titre / Description / Date / Lieu…                              │
└─────────────────────────────────────────────────────────────────┘
```

### Gear placement

- **Only on the Infos tab** — top-right of `app-event-infos-tab` header (`event-infos__header`).
- **Not** beside tab labels; **not** on Dispos or Équipe.
- **Single gear** replaces the former Infos **⋮ kebab** (`more_vert`).

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

- [ ] No `more_vert` kebab on Infos.
- [ ] No gear on Dispos / Équipe tabs.
- [ ] No gear in `app-event-detail-header` row.

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
| 2026-05-25 | Event Infos: single gear merges ⋮ + scope admin items |
| 2026-05-25 | Initial spec — replaces `app-scope-admin-bar` strip per SCP approval |
