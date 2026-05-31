---
title: UX — Statistiques equity compartment filter (Story 17.10)
author: Sally (UX) + Patrice
date: '2026-05-25'
status: proposed
relatedStories:
  - '17.10'
  - '3.6'
  - '17.7'
  - '17.8'
relatedArtifacts:
  - _bmad-output/planning-artifacts/ux-design-season-historique-statistiques.md
  - docs/adr/0013-troupe-navigation-equity-tags-event-slugs.md
  - PLAN.md
stakeholderScope: Replace DEPLACEMENT column band with multi-select spectacle group filter on Statistiques view and CSV export
---

# UX Design — Statistiques: filter by spectacle groups (compartments)

**Purpose:** Implementation-ready interaction spec for **Story 17.10**. Supersedes **D9** and DEPLACEMENT band in [ux-design-season-historique-statistiques.md](ux-design-season-historique-statistiques.md).

**Principle:** Compartments are **which spectacles count**, not **extra table columns**. One grid structure (JEU / DECORUM / BÉNÉVOLE); users choose which groups contribute.

---

## User story

**Marie**, trésorière de La Malice, opens **Statistiques** for the season. She wants February participation for **away shows only** — not mixed with home match nights. She opens **Groupes de spectacles**, unchecks **Spectacles ordinaires**, keeps **Déplacements** checked, and reads the same JEU/DECORUM columns she already knows. In March she checks **Tous les spectacles** to see the full season picture before export.

---

## Design decisions

| # | Topic | Decision |
|---|--------|----------|
| F1 | **No DEPLACEMENT band** | Remove green DEPLAC. band and `deplacementJeu` / `deplacementDecorum` from UI and export headers |
| F2 | **Filter control** | **Groupes de spectacles** — multi-select with explicit compartments |
| F3 | **Ordinary shows compartment** | UI label **Spectacles ordinaires** (PO 2026-05-25); maps to `equity_tag` null ; API/query token `principal` |
| F4 | **Troupe tags** | One checkbox per glossary entry (17.7), label from troupe glossary |
| F5 | **Tous les spectacles** | Master toggle: when ON, all compartments included; disables individual boxes OR syncs all checked |
| F6 | **Default** | **Tous les spectacles** ON on first visit / no query param |
| F7 | **Export** | CSV uses same event set as grid after group filter (+ Membres / Spectacle filters) |
| F8 | **Legacy read** | `template_type = deplacement` without tag counts as **Déplacements** compartment until MIG-4 |
| F9 | **Empty selection** | If user unchecks all (and Tous OFF): empty state, not a zeroed grid |
| F10 | **Deep link** | Optional `?statsGroups=principal,deplacements` or `?statsGroups=all` (implementation choice) |

---

## Control: Groupes de spectacles

### Placement

> **Amended 2026-05-31:** Groupes filter moves **inside** the unified filter panel — [ux-design-unified-filter-panel.md](./ux-design-unified-filter-panel.md). Statistiques Row A: **`filter_list`** + **Exporter** + **Détails** only.

Statistiques toolbar **Row A**:

```
[ filter_list (badge if active) ] [ Exporter ] [ Détails ]
```

### Trigger label (closed state)

Toolbar shows **badge count only** (no inline `Groupes : …` button). Inside filter panel, section title **Groupes de spectacles** with checkbox panel below.

| Selection | Chip / panel summary |
|-----------|----------------------|
| Tous ON | No category chip; badge excludes default all |
| 1 compartment | Chip = glossary label (e.g. `Déplacements`) |
| 2+ compartments | Chip = `2 catégories` |
| None | Warning on filter trigger; empty state F9 |

### Panel content (menu or bottom sheet on mobile)

```
┌─────────────────────────────────────────┐
│ Groupes de spectacles                    │
│ Les stats ne comptent que les spectacles │
│ des groupes cochés.                      │
├─────────────────────────────────────────┤
│ ☑ Tous les spectacles                    │
├─────────────────────────────────────────┤
│ ☐ Spectacles ordinaires                  │
│ ☐ Déplacements                           │
│ ☐ Apérock                                │
│   … (glossary from troupe)               │
├─────────────────────────────────────────┤
│              [ Appliquer ]  (mobile)     │
└─────────────────────────────────────────┘
```

**Interaction rules**

1. **Tous les spectacles** ON → all compartment checkboxes checked; user may turn Tous OFF to refine.
2. **Tous** OFF + user checks **Spectacles ordinaires** only → stats = events with `equity_tag` null only.
3. **Tous** OFF + **Déplacements** + **Apérock** → union of those tags (OR semantics).
4. Unchecking the last compartment → show empty state (F9); do not auto-re-enable Tous without user action.
5. When user manually checks every compartment, optionally auto-enable **Tous** (sync) — acceptable either way; prefer sync for clarity.

### Help copy (inline, 1 line under title in panel)

> « Choisissez quels spectacles entrent dans le tableau. *Spectacles ordinaires* = spectacles sans groupe. Pour les stats d’un seul programme (ex. bus), cochez uniquement ce groupe. »

---

## Table structure (after 17.10)

| Band | Columns (unchanged from 3.6 except DEPLAC removed) |
|------|------------------------------------------------------|
| JEU | MATCH, CAB, LONG, AUTRE, TOTAL JEU |
| DECORUM | MC, DJ, ARB, ASS. ARB, COACH, TOTAL DECORUM |
| BÉNÉVOLE | Régie, Lumière, Bénévole, TOTAL BÉNÉVOLE |

**Masquer / Détails:** unchanged — expands JEU/DECORUM/BÉNÉVOLE sub-columns and months; no DEPLAC toggle.

**Colour tokens:** remove `--stats-band-deplacement` usage from stats table; keep jeu / decorum / benevole only.

---

## States

| State | UI |
|-------|-----|
| Loading | Unchanged |
| Tous / full season | Grid populated; all compartments |
| Single group (e.g. Déplacements) | Same columns; only tagged events in cells |
| No group selected | `Sélectionnez au moins un groupe de spectacles pour afficher les statistiques.` + link focus to filter |
| No data for selection | `Aucune donnée pour les groupes sélectionnés sur cette saison.` |
| Glossary empty (only ordinary compartment) | Filter still shows **Spectacles ordinaires** + Tous; tags appear when troupe adds them |

---

## API contract (UX-facing)

Query or body parameter, e.g. `equityCompartments=principal,deplacements` or `all`.

| Value | Meaning |
|-------|---------|
| `all` | All events in season (non-archived), all compartments |
| `principal` | `equity_tag IS NULL` — UI label **Spectacles ordinaires** (legacy `template_type = deplacement` maps to `deplacements`, not this bucket) |
| `{slug}` | `equity_tag = slug` |

Server filters **events before** aggregation. Client sends selection on load and when filter changes (debounced refetch).

---

## Export

- Filename hint optional: `stats-{seasonSlug}-{groups}.csv`
- Header row: no DEPLAC columns
- Metadata row or comment (optional): `Groupes: Tous les spectacles` or `Groupes: Déplacements, Apérock`

---

## Mobile (≤768px)

- **Groupes de spectacles** opens **bottom sheet** with same checklist + **Appliquer**.
- Sticky first column unchanged.
- Filter row may wrap: Row A1 Membres + Spectacles; Row A2 Groupes + Exporter + Détails.

---

## Out of scope (17.10)

| Item | Owner |
|------|--------|
| DB backfill `deplacement` → `equity_tag` | **MIG-4** |
| Retire `deplacement` template type | **MIG-4** + product follow-up |
| Draw/chances partitioning | **17.9** |
| Tag assignment UI | **17.8** (done) |

---

## Acceptance traceability

Maps to Story **17.10** AC in [epics.md](epics.md) and **PLAN.md** Epic 17 table.
