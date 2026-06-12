---
title: UX — Event detail title row (amendment)
author: Sally (UX) + Patrice
date: '2026-06-06'
status: approved
relatedArtifacts:
  - _bmad-output/implementation-artifacts/17-37-event-detail-title-row.md
  - _bmad-output/planning-artifacts/ux-design-event-detail-chrome-alignment.md
  - _bmad-output/planning-artifacts/ux-design-journey-league-agenda.md
  - _bmad-output/planning-artifacts/ux-design-scope-admin-menu-epic17.md
  - docs/v2/technical/FRONTEND_UI.md
supersedesPartially:
  - ux-design-event-detail-chrome-alignment.md#design-decisions-e4-e5-e6
  - ux-design-event-detail-chrome-alignment.md#breadcrumb--event-title-in-header-e4-e5
  - ux-design-event-detail-chrome-alignment.md#composition-status-badge--centered-e6
  - ux-design-journey-league-agenda.md#screen-6--détail-événement
  - ux-design-scope-admin-menu-epic17.md#screen-2--event-detail
stakeholderSignOff: '2026-06-06 — Patrice (shipped in apps/web event-detail) — E8 breadcrumb superseded 2026-06-10 by ux-design-ma-troupe-hub.md ED1'
---

# UX — Event detail title row (amendment 2026-06-06)

**Purpose:** Freeze event detail chrome after mobile field testing and **17.43** (2026-06-12): event title **inline in sticky header** with back chevron; composition status badge **on Équipe tab only**; troupe/saison context in Infos **Saison** section (chips, last block).

**Trigger:** Mobile breadcrumb truncation; badge in header harmed title readability; context section « Contexte » too abstract — renamed **Saison**, moved to bottom with chips.

---

## User story

> As a member or organizer on event detail, I want the **spectacle name** readable in the header without competing chrome, discover troupe/saison in Infos when I need it, and see **composition status** where I act on the team — on **phone and desktop**.

---

## Design decisions (amend prior E4–E9)

| ID | Decision | Replaces / notes |
|----|----------|------------------|
| **E7** | **Title in sticky header** (all breakpoints): same row as chevron back — `h1.event-detail__event-title`, ellipsis on narrow viewports. `aria-current="page"` on the `h1`. Tabs **below** header. | 2026-06-06 title row **above** tabs with badge right. |
| **E8** | ~~Breadcrumb troupe › saison on event detail~~ — **superseded by ED1** (no breadcrumb). Admin sub-pages unchanged. | E5 breadcrumb leaf = event title. |
| **E9** | Composition status badge + help **`?`** : **Équipe tab only** (top of `event-equipe-tab`), centered row — **not** in header, **not** on Infos/Dispos. Help panel below badge row when open. | E6 centered badge on Infos ; 2026-06-06 title row badge. |
| **E10** | **Infos tab:** no **Titre** field. **Description:** no section label; show text in value card **only when** `description.trim()` is non-empty. **Saison** section (last block): chips `{troupeName}` + `{seasonTitle}` → hub / workspace. | Prior « Contexte » first block + buttons (ED4 initial). |
| **E11** | Tab body content: **≥ 1.5rem** padding-top below pill tab bar (all tabs). | — |
| **E12** | Barre d’onglets : pattern **capsule M3** (coque `surface-container-high` + pastille active `primary-container`) — spec normative [ux-design-pill-tab-bar.md](./ux-design-pill-tab-bar.md) ; mixin `_hatcast-pill-tab-bar.scss`. | Ancien style pastilles isolées + `rgba(255,255,255,0.1)`. |

**Unchanged from 2026-05-31 chrome alignment:** E1 gear in header row (all tabs), E2 gear visibility, E3 agenda card ⋮ removed, date only in Infos Date field.

---

## Target chrome — event detail (all breakpoints)

```
┌──────────────────────────────────────────────────────────────────────┐
│ [←] Spectacle title (ellipsis…)                           [ ⚙ ] [av] │  ← sticky header
├──────────────────────────────────────────────────────────────────────┤
│              [ Infos | Dispos | Équipe | Activité ]                     │
├──────────────────────────────────────────────────────────────────────┤
│ (1.5rem gap)                                                          │
│ Infos: … · Catégorie · Saison [chip troupe] [chip saison]             │
│ Équipe: [ Confirmé ] [ ? ] · grille…                                  │
└──────────────────────────────────────────────────────────────────────┘
```

### Header title (`event-detail-header` — title projected via `data-event-detail-title-row`)

| Property | Value |
|----------|-------|
| Layout | Flex row: back chevron \| title (`flex 1`, ellipsis mobile) \| admin gear (fixed corner mobile) |
| Title | `h1`, `1.25rem` mobile / `1.35rem` ≥ 840px, `font-weight: 700` |
| Status badge | **Not in header** — see E9 / Équipe tab |
| Draft banner (event) | Full width **below** header when event unpublished |

### Breadcrumb (`app-context-breadcrumb`, event detail)

**Removed on canonical event detail** (ED1 / 17.43). No `omitEventFromBreadcrumb` — component absent from header.

**Admin sub-pages** (e.g. Participants du spectacle): keep full breadcrumb + separate mobile H1 — **unchanged**.

### Infos tab fields (member view)

| Field | Rule |
|-------|------|
| Description | Optional card, no label, hidden if empty |
| Date | Labeled « Date », calendar export when valid |
| Lieu | Labeled « Lieu », maps menu when set |
| Format et besoins | Inline help under label ; section always visible ; edit icon if `canManageEvents` (**17.14**, **UX-DR22**) |
| Organisateur·ices | Inline help when section visible ; gating unchanged (`canManageEventOrganizers` or ≥1 organizer) (**17.15**, **UX-DR23**) |
| Catégorie | **Always visible** ; inline help under label ; chip **Spectacle ordinaire** when unset ; custom chip + **×** when set ; chip click opens dialog if orga (**UX-DR21**) |
| Saison | **Last block** ; label **Saison** ; two **clickable chips** (troupe name → hub, season title → workspace), centered ; hidden if context unresolved (**17.43** / ED4) |

---

## Acceptance criteria (regression guards)

### Header & title

- [ ] **E7** Event title in `event-detail__event-title` inside sticky header (same row as back chevron); `aria-current="page"` on `h1`.
- [ ] **E7** Title hidden while loading / on resolver or event 404.
- [ ] **E7** No composition status badge in header.

### Breadcrumb

- [ ] **E8** No `app-context-breadcrumb` on canonical event detail (ED1).
- [ ] Admin event sub-pages still use breadcrumb with event title leaf.

### Composition status

- [ ] **E9** Badge + help on **Équipe tab** top only; not on Infos/Dispos/header.
- [ ] Help panel opens below badge row on Équipe tab.
- [ ] When composition draft zone shows on Équipe, it appears below status chrome without overlap.

### Infos tab

- [ ] **E10** No « Titre » label or value in Infos.
- [ ] **E10** Empty or whitespace-only description → no description block.
- [ ] **E10** Non-empty description → card without « DESCRIPTION » heading.
- [ ] **E10** **Catégorie** section always present ; default chip **Spectacle ordinaire** when `category` null.
- [ ] **E10** **Saison** section last in Infos when troupe + season context known ; chips navigate correctly.

### Tabs spacing

- [ ] **E11** Visible gap between tab bar and first Infos content (≥ 1.5rem).
- [ ] **E12** Tab bar uses capsule pattern (outer shell + active primary-container pill) per [ux-design-pill-tab-bar.md](./ux-design-pill-tab-bar.md).

### Prior chrome (still required)

- [ ] Gear in `event-detail-header` when admin items exist (E1/E2).
- [ ] No agenda card `more_vert` (E3).
- [ ] Date not in header (date field in Infos only).

---

## Implementation touchpoints

**Story BMad :** [_17-37-event-detail-title-row.md_](../implementation-artifacts/17-37-event-detail-title-row.md) (status: done).

| Area | File(s) |
|------|---------|
| Header + title | `event-detail-header.html/ts`, `event-detail.html`, `event-detail.scss` |
| Tab bar capsule | `_hatcast-pill-tab-bar.scss`, spec [ux-design-pill-tab-bar.md](./ux-design-pill-tab-bar.md) |
| Status (Équipe) | `event-equipe-tab.html`, `composition-equipe-status-header.ts/scss` |
| Infos Saison | `event-infos-tab.html` |
| Hub UX source | [ux-design-ma-troupe-hub.md](./ux-design-ma-troupe-hub.md) ED1–ED5 |
| Tests | `event-detail.spec.ts`, `event-infos-tab.spec.ts`, `event-equipe-tab.spec.ts` |

---

## Out of scope

- Season workspace title row (saison keeps breadcrumb leaf).
- SPEC.md legacy V1 modal section (historical); V2 UX source of truth = this doc + journey Screen 6 + story **17.37**.

---

## Revision history

| Date | Author | Change |
|------|--------|--------|
| 2026-06-06 | Sally / Patrice | Amendment E7–E11 after mobile + desktop shipping |
| 2026-06-09 | Sally / Paige | E12 — barre onglets capsule M3 ; lien ux-design-pill-tab-bar.md |
| 2026-06-12 | Sally / Patrice | **17.43 retro-doc** — titre inline header ; badge Équipe only ; Infos › Saison (chips, dernier bloc) ; supersedes E8 breadcrumb omit + E9 title-row badge |
