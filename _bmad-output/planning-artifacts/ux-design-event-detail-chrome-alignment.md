---
title: UX — Event detail chrome alignment
author: Patrice
date: '2026-05-31'
status: approved
relatedArtifacts:
  - _bmad-output/planning-artifacts/ux-design-scope-admin-menu-epic17.md
  - _bmad-output/planning-artifacts/ux-design-unified-filter-panel.md
  - _bmad-output/planning-artifacts/ux-design-journey-league-agenda.md
  - docs/adr/0013-troupe-navigation-equity-tags-event-slugs.md
  - docs/v2/technical/FRONTEND_UI.md
supersedesPartially:
  - ux-design-scope-admin-menu-epic17.md#screen-2--event-detail
  - ux-design-journey-league-agenda.md#screen-6--détail-événement
stakeholderSignOff: '2026-05-31 — Patrice (E1–E6 approved as specified)'
---

# UX Design — Event detail chrome alignment

**Purpose:** Align event detail navigation and administration chrome with the season workspace pattern (post UX-DR22.1 / D14), remove redundant mobile title/date header, consolidate **Modifier** / **Archiver** into a single discoverable admin entry point, and rebalance the composition status badge.

**Trigger:** PO review 2026-05-31 — event screen feels inconsistent with season screen (gear buried on Infos tab; duplicate title on mobile; agenda card ⋮ menu hard to find).

---

## User story

> As a season organizer opening a spectacle from the agenda, I want the same navigation and admin patterns I already learned on the season workspace — breadcrumb context, gear top-right, no duplicate title — so I can orient myself and manage the event without hunting for hidden menus.

---

## Design decisions

| ID | Decision |
|----|----------|
| **E1** | Move `app-scope-admin-menu` to **`app-event-detail-header`** breadcrumb row end (mirror `season-header__admin`). **Amends** Epic 17.2 Screen 2 (gear was Infos-tab-only). |
| **E2** | Gear **visible on all tabs** (Infos, Dispos, Équipe) when `items.length > 0` — same rule as season workspace gear across Agenda / Historique / Stats. |
| **E3** | **Remove** agenda card **`more_vert`** overflow menu (`Modifier`, `Archiver`) from `season-agenda` (agenda variant only). Those actions live **only** in the event scope gear menu. |
| **E4** | **Remove** mobile duplicate hero block (`event-detail__mobile-context`: title + date below breadcrumb). Event title is the **breadcrumb leaf**; date stays in Infos tab field only. |
| **E5** | Extend **`app-context-breadcrumb`** mobile row for `layout="event"` so the **event title** appears in the header breadcrumb trail (truncated), not in a second block under the header. |
| **E6** | Center the composition status badge (`À compléter`, `À vérifier`, etc.) horizontally when no sibling actions remain in the status row (after E1 removes gear from Infos header). |

---

## Target chrome — event detail

### Desktop (≥ 840px)

```
┌──────────────────────────────────────────────────────────────────────┐
│ [logo] Troupe › Saison › Apérock Juin                    [ ⚙ ] [avatar ▾] │
├──────────────────────────────────────────────────────────────────────┤
│              [ Infos | Dispos | Équipe ]  (centered pills)          │
├──────────────────────────────────────────────────────────────────────┤
│ Infos tab:                                                           │
│                    [ À compléter ]   ← centered badge                │
│   TITRE / DESCRIPTION / DATE / LIEU…                                 │
└──────────────────────────────────────────────────────────────────────┘
```

### Mobile (≤ 480px)

```
┌──────────────────────────────────────────────────────────────────────┐
│ [logo] Malice 2025-2026 › Apérock Juin…                  [ ⚙ ] [avatar] │
├──────────────────────────────────────────────────────────────────────┤
│              [ Infos | Dispos | Équipe ]                              │
├──────────────────────────────────────────────────────────────────────┤
│ (tab content — no duplicate title/date under header)                  │
└──────────────────────────────────────────────────────────────────────┘
```

**Removed vs current (2026-05-31):**

| Element | Fate |
|---------|------|
| `event-detail__mobile-context` (title + date) | **Delete** |
| Gear in `event-infos__header` | **Move** to `event-detail-header` |
| Agenda card `more_vert` menu | **Delete** (agenda variant) |
| Left-aligned status badge with empty right column | **Center** badge |

---

## Admin gear — placement & menu

### Placement

| Property | Value |
|----------|-------|
| Host | `app-event-detail-header` → `event-detail-header__admin` |
| Pattern | Copy `season-header` flex: left = breadcrumb, right = gear |
| Visibility | `showAdminMenu = adminItems.length > 0` |
| Tabs | Shown on **Infos, Dispos, Équipe** (E2) |
| Scope input | `scope="event"` |

### Unified menu entries (unchanged semantics)

Single `mat-menu`; same gating as today (`eventAdminItems()` in `event-detail.ts`):

| Condition | Label | Behaviour |
|-----------|-------|-----------|
| `canManageSeasonParticipants` | Participants | Route season admin participants |
| `canManageSeasonOrganizersOnly` | Organisateur·ices | Route season membres + `onglet=organisateurs` |
| Event participant admin only | Participants du spectacle | Navigate / dialog per current impl |
| Event organizer (deduped) | Organisateur·ices du spectacle | Dialog per current impl |
| `canManageEvents` && !archived | **Modifier** | Edit dialog — **primary home** after E3 |
| `canManageEvents` && !archived | **Archiver** | Confirm then archive — **primary home** after E3 |

**Dedup rule:** unchanged — no duplicate « Organisateur·ices du spectacle » when season-level link already present.

### Agenda card — explicit non-placement (E3)

On `season-agenda` **agenda** variant:

- **No** `more_vert` icon button.
- **No** `mat-menu` with Modifier / Archiver.
- Card remains clickable → opens event detail → admin via header gear.
- Remove `agenda-card--with-menu` layout hook if it exists only for the overflow column.

**Rationale:** Two entry points for the same actions (card ⋮ vs event gear) caused discoverability drift; organizers reported the card menu as hard to find. One canonical admin surface per scope.

**Trade-off (accepted):** Modifier / Archiver require opening the event detail first. Acceptable — these are infrequent, high-intent actions; primary agenda flow is participation, not metadata editing.

---

## Breadcrumb — event title in header (E4, E5)

### Desktop

Already supported: `app-context-breadcrumb` with `layout="event"` renders `Troupe › Saison › Event title` when inputs are set.

### Mobile

**Problem today:** mobile row shows logo + season switcher only; event title renders in a **second block** below (`event-detail__mobile-context`).

**Target:** event title is the **last segment** of the mobile breadcrumb row:

1. Logo (troupe hub link)
2. Season switcher **or** season label (existing)
3. Separator `›`
4. Event title — `font-weight: 700`, `aria-current="page"`, ellipsis overflow

**Implementation hint:** extend `context-breadcrumb.html` mobile row when `layout() === 'event' && eventTitle()`; do **not** reintroduce a separate `h1` under the header.

### Date

- **Not** in header (mobile or desktop).
- **Only** in Infos tab « Date » field (already present).
- Remove `formatEventStart` usage from header / mobile-context.

---

## Composition status badge — centered (E6)

Applies to:

- `event-infos-tab` status row
- `app-composition-equipe-status-header` on Équipe tab (and any shared usage)

**Rule:** when the actions slot is empty (no projected content / no gear), the badge row uses **horizontal center** alignment.

**CSS approach (implementation hint):**

```scss
.composition-equipe-status__head {
  justify-content: center; // default when actions empty

  &:has(.composition-equipe-status__actions:not(:empty)) {
    justify-content: space-between;
  }
}
```

Or modifier class `--centered` on the head when actions array is empty — prefer `:has()` only if supported in project browser targets; otherwise explicit class from component.

**Visual intent:** badge reads as a **status banner**, not a left-aligned label fighting empty space where the gear used to sit.

---

## Acceptance criteria

### Chrome & navigation

- [ ] **E1** Event detail header shows `app-scope-admin-menu` at breadcrumb row end when user has admin items.
- [ ] **E2** Gear remains visible when switching to Dispos and Équipe tabs.
- [ ] **E4** No `event-detail__mobile-context` title/date block on any breakpoint.
- [ ] **E5** Mobile header shows event title in breadcrumb row (truncated); full context available via `aria-label` on troupe logo link.
- [ ] Breadcrumb desktop trail unchanged: `Troupe › Saison › Event title`.

### Admin actions

- [ ] **E3** Season agenda cards (agenda variant) have **no** `more_vert` overflow menu.
- [ ] Modifier and Archiver reachable from event gear menu when `canManageEvents` && !archived.
- [ ] No duplicate Modifier/Archiver entry points on agenda cards.

### Composition status

- [ ] **E6** Status badge (`À compléter`, etc.) centered on Infos and Équipe when no actions in status row.
- [ ] Draft banner (Équipe) unchanged — full-width informational block above badge.

### Regression guards

- [ ] No gear in global app bar / account row (only header + account avatar from shell).
- [ ] Members without admin rights: no gear, no agenda card overflow.
- [ ] Archived events: Archiver hidden in menu; Modifier hidden per existing rules.

### Material 3 (UI)

- [ ] **M3-1** Gear = `mat-icon-button` + `settings` icon; menu = `mat-menu`.
- [ ] **M3-2** Tokens only in new/changed SCSS (`var(--mat-sys-*)`).
- [ ] **M3-3** Touch targets ≥ 48dp on gear and removed card menu areas.
- [ ] **M3-4** French `aria-label` on gear (`Administration du spectacle`).

---

## Implementation touchpoints

| Area | File(s) | Change |
|------|---------|--------|
| Event header | `event-detail-header.html/ts/scss` | Add `__admin` + inputs; mirror `season-header` |
| Event shell | `event-detail.html/ts` | Pass `eventAdminItems()` to header; remove mobile-context block |
| Infos tab | `event-infos-tab.html` | Remove `app-scope-admin-menu` from status row |
| Agenda | `season-agenda.html/scss` | Remove card overflow menu + `--with-menu` styling |
| Breadcrumb | `context-breadcrumb.html/scss` | Mobile event title segment |
| Status badge | `composition-equipe-status-header.scss`, `event-infos-tab.scss` | Center badge when actions empty |
| Tests | `event-detail.spec.ts`, `season-agenda` / `season-home` specs | Update selectors; remove « no gear on Dispos » if inverted to « gear on all tabs » |

---

## Document amendments (when approved)

| Document | Update |
|----------|--------|
| `ux-design-scope-admin-menu-epic17.md` | Screen 2 — gear in header; E2 all tabs; remove Infos-only placement |
| `ux-design-journey-league-agenda.md` | Screen 6 chrome table |
| `ux-design-unified-filter-panel.md` | Add note: D14 pattern extended to event detail (E1) |

---

## Out of scope

- Troupe hub gear placement (hero row — unchanged).
- History agenda variant overflow (never had card menu).
- Filter panel / season toolbar (separate stories).
- New admin menu entries beyond existing `eventAdminItems()`.

---

## Open questions

| # | Question | Default if silent |
|---|----------|-------------------|
| Q1 | Long event titles on mobile — single-line ellipsis OK? | Yes (match season breadcrumb truncation) |
| Q2 | Swipe/long-press on agenda card for power users? | No — YAGNI |

---

## Revision history

| Date | Author | Change |
|------|--------|--------|
| 2026-05-31 | Patrice (via UX) | Initial proposal — header gear, breadcrumb, agenda dedup, centered badge |
| 2026-05-31 | Patrice | **Approved** — E1–E6 as specified |
