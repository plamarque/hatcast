---
title: UX — Season Historique & Statistiques (Stories 3.6 / 3.6b)
author: Patrice
date: '2026-05-25'
status: approved
relatedStories:
  - '3.6'
  - '3.6b'
  - '3.3'
  - '17.2'
  - '17.10'
relatedAmendments:
  - _bmad-output/planning-artifacts/ux-design-stats-equity-compartment-filter-17-10.md
relatedArtifacts:
  - _bmad-output/planning-artifacts/ux-design-hatcast-v2.md
  - _bmad-output/planning-artifacts/ux-design-journey-league-agenda.md
  - _bmad-output/planning-artifacts/ux-design-scope-admin-menu-epic17.md
  - docs/adr/0012-league-views-travel-leagues-member-stats.md
  - docs/adr/0013-troupe-navigation-equity-tags-event-slugs.md
  - DOMAIN.md
stakeholderScope: Refine wireframes and interaction spec for league workspace Historique (chronology) and Statistiques (stats grid) before implementation
---

# UX Design — Season workspace: Historique & Statistiques

**Purpose:** Refined mockups and implementation-ready UX for **Story 3.6b** (Historique) and **Story 3.6** (Statistiques). Supersedes ambiguous sections in `ux-design-hatcast-v2.md` where this document is more specific (chrome dated 2026-05-24).

**Route:** `/saison/:slug` — view selected via toolbar + optional query `?view=agenda|history|stats`.

---

## Design decisions (stakeholder alignment)

| # | Topic | Decision | Rationale |
|---|--------|----------|-----------|
| D1 | **Three views** | Toolbar toggles: **Agenda \| Historique \| Statistiques** | ADR 0012; replaces current 2-tab UI and stats placeholder under “Historique”. |
| D2 | **Participants / Spectacles tabs** | **Not** in MVP toolbar (unchanged from 3.3) | Separate admin routes + hub; avoid 5-tab clutter until dedicated stories. |
| D3 | **Historique content** | Reuse **agenda card** layout; **past** events only (`scope=past`) | Same scan pattern as Agenda; no stats columns. |
| D4 | **Statistiques content** | V1 **mat-table** grid (role families + months) | Parity with `CastsView.vue`; CSV export lives in the admin menu. |
| D5 | **Filters on Historique** | **Same** participant + event dropdowns as Agenda | Participant = whose dispo/role badge is shown on cards; event = subset of past spectacles. |
| D6 | **Filters on Statistiques** | **Membres** + **Spectacles** + **Groupes de spectacles** (multi, incl. **Spectacles ordinaires** + tags + **Tous les spectacles**) | Story **17.10**; see [ux-design-stats-equity-compartment-filter-17-10.md](ux-design-stats-equity-compartment-filter-17-10.md). |
| D7 | **Export placement** | **Historique:** no CSV export. **Statistiques:** `Exporter` in the season admin menu; toolbar keeps **Détails/Masquer** only | FR54 Correct Course 2026-06-01; export is organizer/admin-only and full-season. |
| D8 | **Détails** | Toggles **expanded** month columns and **expanded** JEU sub-columns | Matches V1 “voir / masquer les détails”; **no DEPLACEMENT band** after 17.10. |
| D9 | **Compartments in stats** | **Superseded 2026-05-25** — filter by spectacle group, not DEPLACEMENT column | Was: DEPLACEMENT column; now **17.10** filter spec linked above. |
| D10 | **Deep link** | `?view=history` \| `?view=stats` syncs toolbar | Bookmarkable; post-login may default to `agenda`. |
| D11 | **Empty states** | Distinct copy per view | Avoid generic placeholder (“stats coming soon”). |
| D12 | **Mobile** | Stats: horizontal scroll + sticky name column; Historique: same cards as Agenda | NFR readability on small screens. |

---

## Shared chrome (all three views)

Align with [ux-design-scope-admin-menu-epic17.md](ux-design-scope-admin-menu-epic17.md) and journey Screen 3.

### Desktop

```
┌──────────────────────────────────────────────────────────────────────────┐
│ [logo] Troupe › Saison title                                        [⚙] │  breadcrumb — gear (UX-DR22.1)
├──────────────────────────────────────────────────────────────────────────┤
│ (mobile only: H1 season title)                                            │
├──────────────────────────────────────────────────────────────────────────┤
│ ROW A — actions (Détails on Stats only)                                    │
│ ROW B — [ Agenda | Historique | Statistiques ]              [filter_list]│  filter right + chips column
├──────────────────────────────────────────────────────────────────────────┤
│ MAIN — agenda list | past chronology | stats table                        │
└──────────────────────────────────────────────────────────────────────────┘
```

**Note:** Filter hub + pickers per [ux-design-unified-filter-panel.md](ux-design-unified-filter-panel.md) **UX-DR22.1** (Story **17.28**). On mobile, **view toggles** on their own row; gear in breadcrumb row only.

### View switcher

| Toggle value | Query `view` | API event scope |
|--------------|--------------|-----------------|
| Agenda | `agenda` (default) | `upcoming` |
| Historique | `history` | `past` |
| Statistiques | `stats` | N/A (aggregates all non-archived events in season, filtered by UI) |

**Component:** extend `SeasonView` type: `'agenda' | 'history' | 'stats'`.

---

## Screen A — Historique (Story 3.6b)

### Purpose

Chronological **past** programme: *what happened, in what order*. No participation grid.

### Toolbar (Row A — visible when `view === 'history'`)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ [filter_list]                                                              │
│     (flex left)                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

| Control | Options | Behaviour |
|---------|---------|-----------|
| **Participant** | `Tous` + each season participant (roster) | **Tous:** cards show **connected user** dispo/role summary (default). **One member:** cards show **that member’s** summary (read-only; no proxy edit from Historique). |
| **Spectacle** | `Tous` + each **past** event in loaded set | Restricts visible cards to selected spectacle(s). |
| Export | — | Historique is read-only chronology; no CSV export. |

**Filters hidden** on Agenda and Statistiques rows use their own Row A (below).

### Main content — wireframe

```
                    ─── mai 2026 ───
┌────┬────────────────────────────────────────────┬─────────────────────┐
│ 12 │ 🎭 Apérock Avril          [Équipe confirmée] │ [Joueur · dans l'équipe] │
│ mar│                                            │                     │
├────┼────────────────────────────────────────────┼─────────────────────┤
│  5 │ ⚽ Match vs X              [En préparation]  │ [Pas dispo]         │
│ mar│                                            │                     │
└────┴────────────────────────────────────────────┴─────────────────────┘

                    ─── avril 2026 ───
┌────┬────────────────────────────────────────────┬─────────────────────┐
│ …  │ …                                          │ …                   │
└────┴────────────────────────────────────────────┴─────────────────────┘
```

- **Reuse** `agenda-card` styles and structure from `season-agenda` (date column, title, composition badge, role/dispo pill).
- **No** availability edit button on Historique cards (past events) — pill is **display-only** unless product later allows audit correction via detail.
- **Click card** → `/saison/:slug/event/:eventSlug`.
- **Pagination:** same pattern as Agenda — initial cap (e.g. 50), “Charger plus” if API reports more past events.

### States

| State | Copy / UI |
|-------|-----------|
| Loading | `Chargement de l’historique…` |
| Empty (no past events) | `Aucun spectacle passé dans cette saison.` |
| Empty (filters too narrow) | `Aucun spectacle ne correspond aux filtres.` |
| Truncated list | Same notice pattern as Agenda (“Affichage limité aux N … sur M au total”) |

### API

- `GET …/events?scope=past` (mirror `upcoming`; civil-day boundary **Europe/Paris**, end of day — story 3.2/3.6 AC13).
- Non-archived events only.

### Acceptance hints

- [ ] No JEU/DECORUM/DEPLAC./BÉNÉVOLE columns.
- [ ] Participant + spectacle filters active on Historique.
- [ ] No Exporter action on Historique.
- [ ] Third tab Statistiques does not show stats placeholder text.

---

## Screen B — Statistiques (Story 3.6)

### Purpose

Participation analytics: *how often* each member played in role families and per month (V1 grid).

### Toolbar (Row A — visible when `view === 'stats'`)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ [filter_list]                                      [ Masquer ]             │
└──────────────────────────────────────────────────────────────────────────┘
```

| Control | Options | Behaviour |
|---------|---------|-----------|
| **Membres** | `Tous` + participants | **Tous:** all roster rows. **One:** single row (quick focus). |
| **Spectacles** | `Tous` + events (season, non-archived) | Limits which events feed aggregates and month columns. |
| **Masquer** | Toggle (or stroked; V1 purple accent via theme token) | **Off:** collapsed month columns + collapsed JEU sub-columns. **On:** expanded details per V1. |
| **Exporter** | Admin menu item (`download`) | CSV full-season (all active participants, all non-archived events, all spectacle categories), available to season organizers/admins only. |

### Main content — wireframe (summary collapsed)

```
┌─────────────┬──────── JEU ────────┬──── DECORUM ────┬─ DEPLAC. ─┬ BÉNÉVOLE ─┬─ Sept 2025 ─┬ Oct 2025 ─┐
│ (sticky)    │ voir détails ▾      │ voir détails ▾  │           │           │ voir détails│           │
├─────────────┼─────────────────────┼─────────────────┼───────────┼───────────┼─────────────┼───────────┤
│ [av] Alice  │ 2/7 (29%)           │ 1/5 (20%)       │ —         │ 0/3 (0%)  │ 1 (50%)     │ 1 (100%)  │
│ [av] Bob    │ …                   │ …               │ …         │ …         │ …           │ …         │
└─────────────┴─────────────────────┴─────────────────┴───────────┴───────────┴─────────────┴───────────┘
         ↔ horizontal scroll ────────────────────────────────────────────────────────────────►
```

### Expanded JEU (example)

```
┌─────────────┬ MATCH │ CAB │ LONG │ AUTRE │ TOTAL JEU ┬ …
│ [av] Alice  │ 1/2   │ 0/1 │ 1/3  │ 0/1   │ 2/7 (29%) ├ …
```

Header link copy: **« Voir les détails »** / **« Masquer les détails »** per band (JEU, DECORUM, each month group).

### Cell content

| Cell type | Display | Interaction |
|-----------|---------|-------------|
| Role family summary | `selections/denominator (pct%)` via shared ratio component | Tooltip: dispo / sélections / désistements (story 3.6) |
| Month collapsed | Count + % for month | Expand → per-event sub-columns |
| Month / event detail | Event title, date, status chip, role chip or **—** | Tooltip for pending confirmation states |
| Row header | Avatar + name | Avatar click → member profile dialog (if FR permits) |

### Colour bands (semantic tokens)

Map V1 band colours to theme tokens (do not hardcode hex in components):

| Band | Token role |
|------|------------|
| JEU | `--stats-band-jeu` (yellow family) |
| DECORUM | `--stats-band-decorum` (purple) |
| BÉNÉVOLE | `--stats-band-benevole` (teal/grey) |

> **17.10:** DEPLACEMENT band removed; use compartment filter instead.

### Responsive (≤768px)

- Table wrapper `overflow-x: auto`; first column `position: sticky; left: 0; z-index: 2`.
- Toolbar: filters full width; Détails/Masquer on second row if needed.
- Optional MVP fallback (document only if built): card-per-member summary without month columns — **not** default; full table preferred with scroll.

### States

| State | Copy / UI |
|-------|-----------|
| Loading | `Chargement des statistiques…` |
| Empty season | `Pas encore de données pour cette saison.` |
| Insufficient data (no dispos/casts) | Grid with **—** cells; tooltips explain |

### Spectacle groups filter (Story 17.10)

See **[ux-design-stats-equity-compartment-filter-17-10.md](ux-design-stats-equity-compartment-filter-17-10.md)**. Summary: multi-select **Groupes de spectacles** (**Spectacles ordinaires** + troupe tags + **Tous les spectacles**) for the on-screen grid; same JEU/DECORUM/BÉNÉVOLE columns. Admin export ignores toolbar filters and uses the full-season dataset. Data migration `deplacement` → tag: **MIG-4**, not 17.10.

---

## Toolbar layout matrix (implementation)

> **Amended 2026-05-31:** Inline filter pulldowns superseded by unified filter icon — [ux-design-unified-filter-panel.md](./ux-design-unified-filter-panel.md) (UX-DR22). Participant, Spectacle, and Groupes de spectacles live **inside** the filter panel.

| View | Row A (filters/actions) | Row B (toggles + gear) |
|------|-------------------------|-------------------------|
| Agenda | **`filter_list`** (when >1 option on any dimension) | Agenda \| Historique \| Statistiques + ⚙ |
| Historique | **`filter_list`** | same |
| Statistiques | **`filter_list`** + **Détails** | same |

**Gear menu:** hosts **Exporter** for Statistiques full-season CSV when the user is a season organizer/admin. It never hosts **Masquer/Détails**.

---

## Component map (Angular)

| Piece | Action |
|-------|--------|
| `season-view-toolbar` | Add `stats` toggle; conditional Row A slots via `@Input() seasonView` |
| `season-history-shell` | **Remove** — replace with `season-chronology` (or `season-agenda` + `mode="past"`) |
| `season-statistics` | **New** — mat-table, column groups, export triggers |
| `season-home` | Branch: agenda \| chronology \| statistics; load events on view change |
| `StatRatioDisplay` (or V2 equivalent) | Shared cell renderer for stats |

---

## V1 reference captures

| File | Use |
|------|-----|
| `ux-references/season-history-summary-v1.png` | Statistiques summary grid |
| `ux-references/season-history-jeu-expanded-v1.png` | JEU sub-columns |
| `ux-references/season-history-month-detail-v1.png` | Month drill-down cells |
| `ux-references/season-calendar-v1.png` | Card vocabulary for Historique |

---

## Stakeholder sign-off (2026-05-25)

| ID | Question | Decision |
|----|----------|----------|
| Q1 | Historique: dispo edit on past cards? | **No** — edit via event detail only |
| Q2 | Statistiques: Masquer default state? | **Collapsed** (V1 parity) |
| Q3 | Stats filter labels | **Membres** + **Spectacles** |
| Q4 | Desktop toolbar row order | **Filters above** view toggles |

| Field | Value |
|-------|-------|
| Status | **Approved** (Patrice, 2026-05-25) |
| Confirms | D1–D12, wireframes Historique (A) & Statistiques (B), toolbar matrix |

Once approved, set `status: approved` and link from stories **3.6** / **3.6b** Dev Notes.

---

## Changelog

- **2026-05-25:** Stakeholder sign-off (Q1–Q4 defaults); status **approved**.
- **2026-05-25:** Initial refined mockups (split Historique vs Statistiques, Epic 17 chrome, ADR 0012/0013).
