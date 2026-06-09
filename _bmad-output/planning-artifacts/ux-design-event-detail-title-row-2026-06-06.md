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
stakeholderSignOff: '2026-06-06 — Patrice (shipped in apps/web event-detail)'
---

# UX — Event detail title row (amendment 2026-06-06)

**Purpose:** Freeze the **post–2026-06-06** event detail chrome after mobile field testing: event title leaves the breadcrumb and sits on a **dedicated row above tabs**, paired with the composition status badge; Infos tab no longer duplicates title/description chrome.

**Trigger:** Mobile breadcrumb truncation (`[MVP] 02 · Assignatio…`); redundant Infos fields after title row shipped.

---

## User story

> As a member or organizer on event detail, I want the **spectacle name** readable at a glance next to its **composition status**, without fighting the breadcrumb or repeating the same information in Infos — on **phone and desktop**.

---

## Design decisions (amend prior E4–E6)

| ID | Decision | Replaces |
|----|----------|----------|
| **E7** | **Title row above tabs** (all breakpoints): `h1.event-detail__event-title` left, composition status badge + help trigger right. `aria-current="page"` on the `h1`. | E4 mobile-context removal (still valid); **reverses** E5 (title in breadcrumb). |
| **E8** | Breadcrumb on event detail = **troupe + saison only** (`omitEventFromBreadcrumb` on `app-context-breadcrumb`). Desktop **and** mobile. Season segment stays a link on event detail. | E5 breadcrumb leaf = event title. |
| **E9** | Composition status badge lives **only** on the title row (above tabs), **right-aligned** with help icon — not centered, **not** in Infos tab. Help panel spans full width below the title row when open. | E6 centered badge on Infos / Équipe. |
| **E10** | **Infos tab:** no **Titre** field. **Description:** no section label; show text in value card **only when** `description.trim()` is non-empty; otherwise **omit block entirely** (no « Non renseignée »). | Prior Infos three-field stack (Description labeled). |
| **E11** | Tab body content: **≥ 1.5rem** padding-top below pill tab bar (all tabs). | — |
| **E12** | Barre d’onglets : pattern **capsule M3** (coque `surface-container-high` + pastille active `primary-container`) — spec normative [ux-design-pill-tab-bar.md](./ux-design-pill-tab-bar.md) ; mixin `_hatcast-pill-tab-bar.scss`. | Ancien style pastilles isolées + `rgba(255,255,255,0.1)`. |

**Unchanged from 2026-05-31 chrome alignment:** E1 gear in header row (all tabs), E2 gear visibility, E3 agenda card ⋮ removed, date only in Infos Date field.

---

## Target chrome — event detail (all breakpoints)

```
┌──────────────────────────────────────────────────────────────────────┐
│ [logo] Troupe › Saison 2026-2027                        [ ⚙ ] [avatar] │
├──────────────────────────────────────────────────────────────────────┤
│ [MVP] 02 · Assignation manuelle              [ À composer ] [ ? ]     │  ← title row
├──────────────────────────────────────────────────────────────────────┤
│              [ Infos | Dispos | Équipe | Activité ]                     │
├──────────────────────────────────────────────────────────────────────┤
│ (1.5rem gap)                                                          │
│ Infos: description card (if any) · Date · Lieu · Format…              │
└──────────────────────────────────────────────────────────────────────┘
```

### Title row (`event-detail__context-row`)

| Property | Value |
|----------|-------|
| Layout | CSS grid: `minmax(0, 1fr) auto` — title col 1, status col 2 |
| Title | `h1`, `1.25rem` mobile / `1.35rem` ≥ 840px, `font-weight: 700`, wrap allowed |
| Status | `app-composition-equipe-status-header` with `inlineInEventContext` |
| Draft banner (composition) | Full width row **above** title+badge when shown |
| No status yet | Title row shows title only (no placeholder badge) |

### Breadcrumb (`app-context-breadcrumb`, event detail)

| Breakpoint | Trail |
|------------|-------|
| Desktop | `[logo] Troupe › Saison` (saison linked) |
| Mobile | `[logo] › Saison` (switcher or link) |

Event title **must not** appear in breadcrumb on canonical event detail (`event-detail-header` sets omit flag).

**Admin sub-pages** (e.g. Participants du spectacle): keep event title in breadcrumb + separate mobile H1 per `mobileOmitLeaf` pattern — **unchanged**.

### Infos tab fields (member view)

| Field | Rule |
|-------|------|
| Description | Optional card, no label, hidden if empty |
| Date | Labeled « Date », calendar export when valid |
| Lieu | Labeled « Lieu », maps menu when set |
| Format et besoins | Inline help under label ; section always visible ; edit icon if `canManageEvents` (**17.14**, **UX-DR22**) |
| Organisateur·ices | Inline help when section visible ; gating unchanged (`canManageEventOrganizers` or ≥1 organizer) (**17.15**, **UX-DR23**) |
| Catégorie | **Always visible** ; inline help under label ; chip **Spectacle ordinaire** when unset ; custom chip + **×** when set ; chip click opens dialog if orga (**UX-DR21**) |

---

## Acceptance criteria (regression guards)

### Title row & breadcrumb

- [ ] **E7** Event title visible in `event-detail__event-title` after event load; `aria-current="page"` on `h1`.
- [ ] **E8** Breadcrumb does **not** contain event title on event detail (desktop trail + mobile row).
- [ ] **E8** Breadcrumb still shows troupe + saison; saison links to `/saison/:slug`.
- [ ] Title row hidden while loading / on resolver or event 404.

### Composition status

- [ ] **E9** Badge + help on title row right; not duplicated in Infos tab.
- [ ] Help panel opens below title row, full content width.
- [ ] When composition draft banner shows, it appears above title row without overlapping title.

### Infos tab

- [ ] **E10** No « Titre » label or value in Infos.
- [ ] **E10** Empty or whitespace-only description → no description block.
- [ ] **E10** Non-empty description → card without « DESCRIPTION » heading.
- [ ] **E10** **Catégorie** section always present ; default chip **Spectacle ordinaire** when `category` null.
- [ ] **E10** Inline help under **Catégorie**, **Format et besoins**, and **Organisateur·ices** (when that section is shown).

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
| Title row | `event-detail.html`, `event-detail.scss` |
| Tab bar capsule | `_hatcast-pill-tab-bar.scss`, spec [ux-design-pill-tab-bar.md](./ux-design-pill-tab-bar.md) |
| Breadcrumb omit | `event-detail-header.html` → `[omitEventFromBreadcrumb]="true"`, `context-breadcrumb.html/ts` |
| Status inline | `composition-equipe-status-header.ts/scss` (`inlineInEventContext`) |
| Infos | `event-infos-tab.html` |
| Tests | `event-detail.spec.ts`, `event-infos-tab.spec.ts`, `context-breadcrumb.spec.ts` |

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
