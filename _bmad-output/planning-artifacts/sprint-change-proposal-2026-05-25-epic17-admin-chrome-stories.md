# Sprint Change Proposal — Epic 17 admin back-office breadcrumb stories

**Date:** 2026-05-25  
**Author:** Correct Course (BMad)  
**Approver:** Patrice (product) — requested via `/bmad-correct-course`  
**Trigger:** Story **17.2** closure + **LIMIT-002** (ISSUES.md)  
**Change scope:** **Moderate** (backlog: new story 17.11, epic/PLAN/sprint updates; no code in this step)

---

## 1. Issue Summary

After Stories **17.1** (breadcrumb on season/event member screens) and **17.2** (scope admin gear menu), the PO noted that **admin destination pages** still use **legacy header chrome**:

- Chevron **back** to agenda/workspace
- **No** `app-context-breadcrumb`
- Inconsistent with ADR 0013 member deep screens

**Affected routes:**

| Route | Component | Scope |
|-------|-----------|--------|
| `/saison/:slug/admin/participants` | `AdminParticipants` | Saison |
| `/saison/:slug/event/:eventId/admin/participants` (or equivalent event-scoped admin participants URL) | `AdminParticipants` | Spectacle |
| `/troupe/:slug/admin/membres`, `/troupes/:slug/admin/membres` | `AdminMembres` | Troupe |

Previously tracked only as **LIMIT-002** without a schedulable story.

---

## 2. Impact Analysis

| Area | Impact |
|------|--------|
| Epic 17 | New story **17.11**; **17.2** epic text amended (event gear on Infos tab, not tab bar) |
| Stories 17.3–17.5 | Unchanged scope; **17.11** should run **after 17.1** (done) and ideally **after 17.5** (canonical routes) |
| 17.6–17.10 | No impact |
| ISSUES.md | LIMIT-002 linked to story **17.11** |
| UX | Screens 7–8 in journey doc; § Follow-up in scope-admin-menu spec |

---

## 3. Recommended Approach

**Direct adjustment:** add **one** story **17.11** covering all three admin surfaces (shared breadcrumb pattern, two page families).

**Not chosen:**

- Folding into **17.5** — 17.5 is redirects/hub links; admin page chrome is a distinct UI slice.
- Two stories (17.11 saison/event + 17.12 membres) — valid if split later; single story reduces coordination for now.

**Priority:** **P1** (navigation polish), **depends:** 17.1 (done), 17.2 (done), **17.5** (recommended before implementation for stable `/troupes` paths).

---

## 4. Story added to Epic 17

### Story 17.11 — Breadcrumb on admin back-office pages

**Summary:** Replace chevron-back headers on Participants (saison/spectacle) and Membres (troupe) admin pages with `app-context-breadcrumb` (or shared admin header wrapper), account menu only on the right — no redundant back chevron.

**Acceptance criteria (high level):**

1. Saison participants admin — breadcrumb troupe › saison › Participants (leaf); no chevron back.
2. Event-scoped participants admin — breadcrumb troupe › saison › spectacle › Participants (leaf).
3. Troupe membres admin — breadcrumb aligned with troupe hub context; no chevron back to `/seasons`.
4. Reuse `app-context-breadcrumb` + resolver context; mobile rules per 17.1.
5. Tests + build pass.

**Implementation artifact:** `_bmad-output/implementation-artifacts/17-11-breadcrumb-pages-admin-back-office.md`

---

## 5. Artifact updates (this change)

| File | Change |
|------|--------|
| `epics.md` | Story 17.11 + fix 17.2 event placement AC |
| `PLAN.md` | Row 17.11; LIMIT-002 → story reference |
| `sprint-status.yaml` | `17-11-...: backlog` |
| `ISSUES.md` | LIMIT-002 notes → Story 17.11 |
| `ux-design-journey-league-agenda.md` | Screens 7–8 → Story 17.11 |
| `ux-design-scope-admin-menu-epic17.md` | Follow-up → 17.11 |
| `deferred-work.md` | Pointer to 17.11 |

---

## 6. Handoff

| Role | Action |
|------|--------|
| PO | Confirm priority vs 17.3–17.5 ordering |
| Dev | `dev story 17.11` when scheduled (after 17.5 suggested) |
| PM | No epic renumbering; 17.6+ unchanged |

**Success criteria:** LIMIT-002 closable when 17.11 is **done** and all three admin routes show breadcrumb chrome without legacy chevron.
