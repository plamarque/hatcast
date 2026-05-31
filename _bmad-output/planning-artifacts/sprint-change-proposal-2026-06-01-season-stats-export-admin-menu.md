# Sprint Change Proposal — Season stats export in admin menu; remove history export

**Date:** 2026-06-01  
**Author:** Correct Course workflow (BMad) — John (PM)  
**Approver:** Patrice (product) — **approved 2026-06-01**  
**Trigger:** Product review — export placement and scope on season workspace (Historique / Statistiques)  
**Change scope:** **Minor** (UI relocation + permission alignment + doc updates; no API contract change required)

---

## 1. Issue Summary

### Problem statement

The season workspace exposes an **Exporter** button in the view toolbar on both **Historique** and **Statistiques**. Product review (2026-06-01) identified three problems:

1. **Historique export** is a **single-participant** CSV (date, title, composition status, focused participant summary) on a **collective season page** — poor fit; partial overlap with per-event cells in the stats export; low distinct value.
2. **Two buttons labelled « Exporter »** on different views produce **different files**, causing confusion.
3. **Stats CSV export** is an **organizer/admin tool** (full participation matrix for analysis and archival), **not** a transparency/self-service feature for regular season members — yet it is available to any active member from the public toolbar.

### Desired behaviour (stakeholder decision)

| Decision | Detail |
|----------|--------|
| **Remove** Historique CSV export | No replacement; view remains read-only chronology |
| **Remove** toolbar **Exporter** on Historique and Statistiques | Toolbar keeps **Détails/Masquer** on Stats only |
| **Add** stats CSV export to season **scope admin menu** (⚙ breadcrumb row) | Menu label: **« Exporter »** (short) |
| **Gating** | Same audience as season admin gear today — organizers/admins only; **not** exposed to participants without admin permissions |
| **Export payload** | **Full season** statistics (all active participants, all non-archived events, all spectacle categories); **not** tied to toolbar filters on Stats view |
| **On-screen transparency** | Unchanged — members may still **view** the Statistiques grid; they may **not** download the CSV |

### Discovery context

- Identified during PM review comparing Historique vs Statistiques export behaviour.
- Conflicts with **FR54**, **ADR 0012**, **UX-DR9**, **UX-DR19**, and approved UX docs that place **Exporter** in the toolbar and mandate two separate CSV exports.

### Evidence

- Code: `season-home.html` routes `exportClick` to `exportStatisticsCsv()` or `exportHistoryCsv()` by view.
- `SeasonStatisticsService.loadStatistics` requires active season membership only — export is not server-gated today.
- UX spec `ux-design-scope-admin-menu-epic17.md` and `ux-design-unified-filter-panel.md` P5: **Exporter stays outside gear** — this proposal **reverses** that rule for stats export only.

---

## 2. Impact Analysis

### Epic impact

| Epic | Impact |
|------|--------|
| **Epic 3** | Stories **3.6**, **3.6b** AC amended (export placement + Historique export removed) |
| **Epic 17** | New story **17.32** (implementation); amend **17.27** / **17.28** toolbar AC (no Exporter) |
| Other epics | None |

### Story impact

| Story | Action |
|-------|--------|
| **3.6** (Statistiques) | Remove toolbar export AC; add admin-menu export AC; organizer gating |
| **3.6b** (Historique) | Remove export AC entirely |
| **17.27** / **17.28** (unified filter panel) | Remove Exporter from toolbar wireframes and AC |
| **17.32** *(new)* | Implement relocation + full-season export + delete history export code |

### Artifact conflicts

| Artifact | Update required |
|----------|-----------------|
| `_bmad-output/planning-artifacts/prd.md` | **FR54** rewrite |
| `docs/adr/0012-league-views-travel-leagues-member-stats.md` | §1 table — remove History CSV; stats export admin-only |
| `_bmad-output/planning-artifacts/epics.md` | FR54 summary, UX-DR9/19, stories 3.6, 3.6b, 17.27/28, traceability |
| `_bmad-output/planning-artifacts/ux-design-season-historique-statistiques.md` | Remove Historique Exporter; Stats toolbar without Exporter |
| `_bmad-output/planning-artifacts/ux-design-scope-admin-menu-epic17.md` | Add **Exporter** menu entry |
| `_bmad-output/planning-artifacts/ux-design-unified-filter-panel.md` | P5 amendment — stats export **in** gear, not toolbar |
| `_bmad-output/planning-artifacts/ux-design-stats-equity-compartment-filter-17-10.md` | Row A without Exporter |
| `PLAN.md` | Note under 3.6 / post-MVP stats if needed |
| Implementation artifacts `3-6*.md`, `3-6b*.md` | Changelog + AC alignment |

### Technical impact

| Area | Change |
|------|--------|
| `season-view-toolbar` | Remove `showExport()`, `exportClick` output, Exporter button |
| `season-home` | Remove `exportHistoryCsv()`; move `exportStatisticsCsv()` to admin menu action; load stats with **no filters** for export |
| `season-history-export.ts` (+ spec) | **Delete** |
| `seasonAdminItems` | Add `{ label: 'Exporter', icon: 'download', action: … }` when user has any season admin gear entry |
| Tests | Update `season-view-toolbar.spec.ts`, `season-home.spec.ts`; remove history export tests |
| API | **Optional hardening (recommended follow-up):** server-side export permission check on statistics endpoint or dedicated export endpoint — **out of scope** for 17.32 unless security review requires it (client gating matches existing admin-menu pattern) |

### PRD MVP

**Scope reduction** (intentional): one CSV export instead of two; export restricted to organizers/admins. On-screen Historique and Statistiques views unchanged.

---

## 3. Recommended Approach

**Selected: Option 1 — Direct adjustment** (Story **17.32** + doc amendments)

| Criterion | Assessment |
|-----------|------------|
| Effort | **Low** (~0.5–1 day: UI move, delete history export, tests, docs) |
| Risk | **Low** — no route/API breaking change; permission model aligns with existing gear |
| Rollback | Re-enable toolbar export if needed (code isolated) |
| Timeline | Does not block other Epic 17 work |

**Not chosen:**

- **Keep both exports, rename only** — rejected; Historique export adds confusion without clear job.
- **Export in gear but keep toolbar on Stats** — rejected; duplicate entry points.

---

## 4. Detailed Change Proposals

### PRD — FR54

**OLD:**

> FR54: **Historique** and **Statistiques** each provide a dedicated **CSV export** aligned with the **visible** content. Exports are **not** combined into a single file.

**NEW:**

> FR54: The season workspace provides a **single CSV export** of **Statistiques** data (participation grid: annual role-family columns, monthly summaries, per-event cells — format per SPEC § CSV export). The export is available from the **season administration menu** (⚙) to **season organizers and administrators** only; it is **not** a self-service transparency feature for participants without admin permissions. The export reflects the **full season** dataset (all active participants, all non-archived events, all spectacle categories). **Historique** has **no** CSV export.

**Rationale:** Aligns product with organizer workflow; removes redundant history file.

---

### ADR 0012 — §1 League workspace views

**OLD:**

| View | Content | Export |
|------|---------|--------|
| **Historique** | Past events chronology | History CSV |
| **Statistiques** | V1 participation grid | Stats CSV |

**NEW:**

| View | Content | Export |
|------|---------|--------|
| **Historique** | Past events chronology | — |
| **Statistiques** | V1 participation grid (on-screen for all active members) | Stats CSV via **season admin menu** (organizers/admins only; full season) |

Add amendment note: *2026-06-01 — FR54 / export placement Correct Course (sprint-change-proposal-2026-06-01-season-stats-export-admin-menu.md).*

---

### Epics.md — UX decision records

**UX-DR9 — OLD tail:**

> … **Exporter** (stats CSV) / **Masquer** — distinct from Historique.

**NEW:**

> … **Masquer/Détails** on toolbar; stats CSV **Exporter** in season admin menu (organizers/admins).

**UX-DR19 — OLD tail:**

> … **Exporter** (history CSV) when specified.

**NEW:**

> … no CSV export (chronology read-only).

**FR54 summary line — OLD:**

> FR54: **Historique** and **Statistiques** each provide a dedicated **CSV export**…

**NEW:**

> FR54: Single **Statistiques** CSV export via season admin menu (organizers/admins; full season). Historique: no export.

---

### Story 3.6 — Acceptance Criteria (excerpt)

**Remove:**

> - **Given** l’action **Exporter**, **when** l’utilisateur télécharge le CSV, **then** le format suit SPEC … — export **Statistiques** distinct de l’export Historique (FR54).

**Add:**

> - **Given** a user with **season administration** access (same gating as scope admin gear), **when** they choose **Exporter** from the season admin menu, **then** a CSV is downloaded with **full-season** Statistiques data per SPEC (annual columns, month summaries, per-event cells); filename pattern `statistiques-{slug}-{date}.csv`.
> - **Given** a season member **without** administration permissions, **when** they use the season workspace, **then** no CSV export action is available (Statistiques grid remains viewable).
> - **Given** the Statistiques toolbar, **when** rendered, **then** **Détails/Masquer** is shown and **Exporter** is **not** shown.

---

### Story 3.6b — Acceptance Criteria (excerpt)

**Remove:**

> - **Given** l’action **Exporter** Historique, **when** l’utilisateur télécharge, **then** the CSV reflète la chronologie visible — **fichier distinct** de l’export Statistiques (FR54).

**Amend coverage:**

> - **Couverture :** FR53 ; UX-DR19. *(FR54 removed from Historique scope.)*

---

### UX — Scope admin menu (`ux-design-scope-admin-menu-epic17.md`)

**Add to menu entries table** (after existing rows, same gating as gear visibility):

| Permission | Label | Action |
|------------|-------|--------|
| `isSeasonOrganizer` or `isTroupeAdmin` | **Exporter** | Download full-season Statistiques CSV (`download` icon); snack on success/error per existing patterns |

**Amend chrome layout wireframe — Row A:**

**OLD:** `[Exporter] [Détails] …`  
**NEW:** `[Détails] …` *(Stats only)*

**Amend design principles:** Stats CSV export is an **administration action** hosted in the gear menu, not view-toolbar chrome.

---

### UX — Unified filter panel P5

**OLD:**

> **Exporter**, **Détails**, view toggles stay **outside** filter UI. **Scope admin gear** lives in the **breadcrumb row**.

**NEW:**

> **Détails**, view toggles stay **outside** filter UI. **Statistiques CSV export** lives in **scope admin gear** (breadcrumb row). **Scope admin gear** remains in the breadcrumb row.

---

### New Story 17.32 — Exporter statistiques via menu admin saison

**File:** `_bmad-output/implementation-artifacts/17-32-season-stats-export-admin-menu.md`

**User story:**

En tant qu’**organisateur ou administrateur de saison**,  
je veux **Exporter** les statistiques complètes depuis le menu administration,  
afin d’obtenir le CSV de participation sans encombrer la toolbar membre.

**Acceptance Criteria**

1. **Given** season admin gear visible, **when** menu opens, **then** entry **Exporter** (`download` icon) appears in the flat menu list.
2. **Given** **Exporter** clicked, **when** export succeeds, **then** CSV downloads (`statistiques-{slug}-{date}.csv`) with full-season data (no toolbar filter constraints); format unchanged from current `buildStatisticsCsv`.
3. **Given** no statistics data, **when** **Exporter** clicked, **then** snack « Aucune donnée à exporter. » (existing copy).
4. **Given** Historique or Statistiques toolbar, **then** no **Exporter** button.
5. **Given** history export code paths, **then** removed (`season-history-export*`, `exportHistoryCsv`, related tests).
6. **Tests:** `season-home.spec.ts`, `season-view-toolbar.spec.ts` updated; admin menu includes Exporter when permitted.

**UI : M3** — menu item uses existing `mat-menu-item` + icon pattern from scope admin menu.

---

## 5. Implementation Handoff

### Scope classification

**Minor** — Developer agent can implement directly after doc sign-off.

### Handoff checklist

| Step | Owner | Deliverable |
|------|-------|-------------|
| 1 | PM (Patrice) | Approve this proposal |
| 2 | PM / Tech writer | Apply PRD, ADR, epics, UX doc edits listed in §4 |
| 3 | Dev | Story **17.32** implementation |
| 4 | Dev | Remove dead code; green tests |
| 5 | QA | Verify participant without admin rights: no Exporter; organizer: export from ⚙ on any view |

### Success criteria

- [ ] No **Exporter** in `season-view-toolbar` on Historique or Statistiques
- [ ] **Exporter** in season admin menu with label exactly **« Exporter »**
- [ ] CSV content = full season (not filtered by Stats toolbar state)
- [ ] Historique export code and tests removed
- [ ] FR54 / ADR 0012 / UX docs updated
- [ ] `ng test` + relevant specs pass

### Optional follow-up (not blocking)

- Server-side authorization on bulk statistics export (if CSV is considered sensitive at API layer)
- Snack « Export téléchargé » on success (align with Admin Membres pattern)

---

## 6. Approval

| Role | Name | Decision | Date |
|------|------|----------|------|
| Product | Patrice | ☑ Approved | 2026-06-01 |

**On approval:** route to **bmad-create-story** or **bmad-dev-story** for **17.32**; apply §4 doc edits in same PR or preceding docs commit.

---

*Correct Course workflow — HatCast — 2026-06-01*
