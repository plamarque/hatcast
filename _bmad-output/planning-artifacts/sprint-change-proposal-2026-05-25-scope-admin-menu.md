# Sprint Change Proposal — Scope admin menu (replace scope admin bar)

**Date:** 2026-05-25  
**Author:** Correct Course workflow (BMad)  
**Approver:** Patrice (product) — **approved 2026-05-25**  
**Trigger story:** 17.2 (`17-2-bandeau-administration-par-scope`)  
**Change scope:** **Minor** (UI refactor + doc alignment; permissions and routes unchanged)

---

## 1. Issue Summary

### Problem statement

After implementing Story **17.2**, the product owner validated **functional** restoration of admin links (participants, organisateurs, membres) but rejected the **UX pattern**: an expandable **full-width administration strip** (`app-scope-admin-bar`) below the header consumes vertical space and feels disconnected from the workspace controls.

### Desired behaviour

- All scope administration actions reachable from a **gear icon** (`settings` / `admin_panel_settings`).
- **Dropdown menu** (`mat-menu`) when multiple entries exist.
- Gear **does not occupy its own row** — integrated **inline** with existing view chrome (e.g. to the **right** of **Agenda | Historique** on season workspace).
- **Still no gear in the global header row** (breadcrumb + account avatar) — preserves Story **17.1** separation between navigation and administration.

### Discovery context

- Identified post-implementation review of 17.2 (code exists; docs still describe « bandeau »).
- Conflicts with ADR **0013** §2, Epic **17.2**, UX journey, design-thinking wireframes, and story **17.2** as written.

### Evidence

- PO feedback (2026-05-25): prefer gear + menu in toolbar, not administration band.
- Implemented component: `apps/web/src/app/shared/scope-admin-bar/` placed between header and `season-view-toolbar`.

---

## 2. Impact Analysis

### Epic impact

| Epic | Impact |
|------|--------|
| **Epic 17** | Story **17.2** AC and UI spec change; **17.1** unchanged (header still no ⚙). Stories **17.3–17.10** unaffected. |
| Other epics | None |

### Story impact

| Story | Action |
|-------|--------|
| **17.1** | Done — AC « pas de ⚙ dans le header » remains; clarify « header » = breadcrumb/account row only. |
| **17.2** | **Amend in place** (no 17.2b): rename component pattern, reposition UI, update tests. Route helpers and permission gating **kept**. |
| **17.4+** | Hub troupe: gear in hero/toolbar row (not full-width strip). |

### Artifact conflicts

| Artifact | Update required |
|----------|-----------------|
| `docs/adr/0013-troupe-navigation-equity-tags-event-slugs.md` | §2 Chrome: `app-scope-admin-menu`, toolbar placement |
| `_bmad-output/planning-artifacts/epics.md` | Story 17.2 title + AC |
| `_bmad-output/planning-artifacts/ux-design-journey-league-agenda.md` | Shared chrome + Screens 3, 4, 6 |
| `_bmad-output/design-thinking-2026-05-25.md` | Component spec + P0 table |
| `PLAN.md` | Epic 17.2 row |
| `_bmad-output/implementation-artifacts/17-2-*.md` | Story rewrite + refactor tasks |
| `17-1-breadcrumb-*.md` | Regression guard wording (menu not bar) |

### Technical impact

- **Rename/refactor** `scope-admin-bar` → `scope-admin-menu` (or keep selector, change template to icon+menu only).
- **Season:** inject menu into `SeasonViewToolbar` (right of view toggles).
- **Event:** gear on tab bar right (or compact actions row), not below mobile context.
- **Troupe hub:** gear inline with hero actions row.
- Tests: update selectors (no `.scope-admin-bar` full strip; `aria-label` on icon button + menu items).
- **No API / route changes.**

### PRD MVP

No MVP scope change — presentation only. Same admin capabilities as pre-17.1 header menu.

---

## 3. Recommended Approach

**Selected: Option 1 — Direct adjustment** (amend Story 17.2, refactor UI)

| Criterion | Assessment |
|-----------|------------|
| Effort | **Low–medium** (1 component refactor + 3 integration points + tests) |
| Risk | **Low** (permissions and URLs already implemented) |
| Rollback | Not needed — keep 17.1 breadcrumb work |
| Timeline | Does not block 17.3 if 17.2 marked in-progress briefly |

**Not chosen:**

- **Rollback 17.2 entirely** — wastes working route/gating logic.
- **New story 17.2b** — unnecessary; same story ID with course-correction changelog is enough.

---

## 4. Detailed Change Proposals

### ADR 0013 §2 — Chrome

**OLD:**

> **`app-scope-admin-bar`** (below header, one scope per screen)  
> … expandable admin strip …  
> **No ⚙** in global header.

**NEW:**

> **`app-scope-admin-menu`** (one scope per screen, role-gated)  
> - **Control:** `mat-icon-button` with gear icon + **`mat-menu`** for entries (router links and dialog actions).  
> - **Placement:** **inline in view chrome**, not a dedicated full-width row — e.g. season workspace: right of **Agenda | Historique** in `season-view-toolbar`; event detail: right of tab bar; troupe hub: hero/toolbar row.  
> - **Hidden** when user has no entries for that scope.  
> - **No ⚙** in the **global header row** (breadcrumb + avatar) — administration remains separate from context navigation (Story 17.1).

**Rationale:** PO-validated discoverability without vertical band.

---

### Epic 17 — Story 17.2 (epics.md)

**OLD title:** Bandeau administration par scope  

**NEW title:** Menu administration par scope (icône engrenage)

**OLD AC (summary):** bandeau « Administration de la … »  

**NEW AC (summary):**

- Hub `/troupes/:slug`, TROUPE_ADMIN → gear menu with **Membres** (and future entries).
- `/saison/:slug` → gear in **season toolbar**, menu with Participants / Organisateur·ices when permitted.
- Event detail → gear in **event chrome** (tab/actions row), same entries + event-scoped actions.
- No gear in **breadcrumb header row**; no full-width admin strip.
- Member without rights → control absent.

---

### UX journey — Shared chrome

**OLD:** `app-scope-admin-bar` below breadcrumb/title  

**NEW:** `app-scope-admin-menu` — gear + dropdown, placement per screen table:

| Screen | Placement |
|--------|-----------|
| Season workspace | Right of `Agenda \| Historique` toggles |
| Event detail | Right of tab labels (or actions cluster) |
| Troupe hub | Hero / top actions row (not full-width band) |

---

### Story 17.2 implementation file

- Rename story title and component references to **menu**.
- Mark **route helpers** tasks complete; **UI shell** tasks open for refactor.
- Status: **`ready-for-dev`** until menu UI merged.
- Add **Change Log** entry referencing this SCP.

---

## 5. Implementation Handoff

### Classification: **Minor**

**Handoff to:** Developer agent (`bmad-dev-story` on amended `17-2-bandeau-administration-par-scope.md`)

### Implementation checklist

1. Refactor `scope-admin-bar` → `scope-admin-menu` (icon + `mat-menu`; remove expandable strip layout).
2. Mount in `SeasonViewToolbar` (pass `items` from `SeasonHome` or compute inside toolbar inputs).
3. Event detail: move control to tab/header actions row.
4. Troupe hub stub: inline gear next to hero CTAs.
5. Update unit tests; remove strip-specific assertions.
6. Run `npm run test -w @hatcast/web -- --watch=false` and `npm run build -w @hatcast/web`.
7. Mark story **review** after PO confirms placement in browser.

### Success criteria

- [ ] Same admin URLs and permission gating as current 17.2 code.
- [ ] No `.scope-admin-bar` full-width row on season/event/troupe screens.
- [ ] Gear visible only when `items.length > 0`.
- [ ] No ⚙ in `season-header` / `event-detail-header` breadcrumb row.
- [ ] Docs (ADR, epics, UX, story) match implementation.

---

## 6. Checklist Summary (Correct Course)

| Section | Status |
|---------|--------|
| 1 Trigger & context | [x] Done |
| 2 Epic impact | [x] Done |
| 3 Artifact conflicts | [x] Done |
| 4 Path forward | [x] Direct adjustment |
| 5 Proposal components | [x] Done |
| 6 User approval | [ ] **Pending** |
| 6.4 sprint-status | [x] 17.2 `done` (2026-05-25) |
| 6.5 Handoff | [x] Dev story |

---

## Approval

**Reply with:** `yes` to approve implementation, or `revise` with edits.
