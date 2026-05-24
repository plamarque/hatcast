---
validationTarget: _bmad-output/planning-artifacts/prd.md
validationDate: '2026-05-24'
validationScope: post-league-model (FR48–FR52, ADR 0011)
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - DOMAIN.md
  - docs/adr/0011-league-model-and-user-agenda.md
  - _bmad-output/planning-artifacts/ux-design-journey-league-agenda.md
  - _bmad-output/planning-artifacts/plan-v2-league-journey.md
validationStepsCompleted:
  - discovery
  - format-detection
  - traceability
  - measurability
  - domain-compliance
  - completeness
  - holistic-quality
validationStatus: COMPLETE
overallVerdict: PASS WITH NOTES
severity: Info
postFixDate: '2026-05-24'
postFixNote: P0/P1 simple-fix queue applied to prd.md and architecture.md
---

# PRD Validation Report — League model delta (2026-05-24)

**PRD validated:** `_bmad-output/planning-artifacts/prd.md`  
**Trigger:** FR48–FR52 added; Journey 1 updated; DOMAIN/ADR 0011 aligned  
**Prior validation:** `prd-validation-report.md` (2026-05-23, FR1–FR47)

---

## Executive Summary

| Dimension | Verdict |
|-----------|---------|
| **Overall** | **NEEDS WORK** (Warning — ship Wave 0; fix before Wave 1) |
| **Traceability** | **Gaps** — FR48–52 not in matrix; Journey 1 row stale |
| **Measurability** | **Partial** — FR48–49 lack explicit test metrics |
| **Domain compliance** | **Partial** — PRD/DOMAIN/ADR aligned; Executive Summary & MVP scope still “season-centric” |
| **Completeness** | **Good** — FR section updated; frontmatter not updated |
| **Anti-patterns** | **Minor** — FR49 delegates priority to UX doc |

**Recommendation:** Apply **simple-fix queue** (1–2 h) before Epic 12 story creation; not a full PRD rewrite.

---

## Traceability Validation

### Chain validation

| Chain | Status | Finding |
|-------|--------|---------|
| Executive Summary → Success Criteria | **Gap** | Summary still describes “seasons” hub; success criteria don’t mention user agenda or multi-league |
| Success Criteria → User Journeys | **Partial** | Journey 1 narrative updated; matrix row **not** updated |
| User Journeys → FRs | **Gap** | FR48–52 not listed in Requirement Traceability table |
| Scope → FR alignment | **Gap** | MVP Feature Set (Phase 1) omits FR48–52; reads as pre-League MVP |

### Orphan / missing links

| ID | Issue |
|----|-------|
| **FR48** | Supported by Journey 1 text but **absent** from traceability matrix |
| **FR49** | Same |
| **FR50** | Should link **Journey 3 (Amira)** — not in matrix |
| **FR51** | Journey 1 + 2 — not in matrix |
| **FR52** | Journey 3 + 4 — not in matrix; “request joining” has no dedicated FR |

### Updated matrix (recommended)

| Journey | Primary FRs (add / change) |
|---------|---------------------------|
| **1 — Léa** | Add **FR48, FR49, FR51**; keep FR13 via league workspace |
| **3 — Amira** | Add **FR50, FR52** |
| **4 — Julien** | FR52 links to FR32 (directory) — note in matrix |

**Severity:** Warning (broken traceability for new FRs, not orphan FRs)

---

## Measurability Validation (FR48–52)

| FR | SMART | Gap |
|----|-------|-----|
| **FR48** | Partial | No bound on list size, pagination, or p95 load; “upcoming” undefined (reuse UX-DR12?) |
| **FR49** | Partial | Routing priority lives in UX-DR13, not PRD; no fallback when zero participations |
| **FR50** | Good | Two explicit modes; testable |
| **FR51** | Good | Navigation capabilities; testable via E2E |
| **FR52** | Partial | “Request joining” implied but not FR; archived filter behaviour unspecified |

### Recommended FR tightenings

- **FR48:** Add “paginated or bounded (default ≤ 50 upcoming events)”; reference civil-day boundary (align NFR-P1 / UX-DR12).
- **FR49:** Inline priority: (1) deep link (2) last league workspace (3) `/agenda` (4) empty state.
- **FR52:** Split “discover troupes” (FR32) from “request to join” → new **FR53 (post-MVP)** or mark Epic 4 dependency explicitly.

---

## Domain & Consistency Validation

### Aligned ✓

- FR11 multi-active leagues
- FR6 league participation vs membership
- ADR 0011 ↔ DOMAIN.md ↔ FR48–52
- Cross-troupe = separate rows (FR48)

### Conflicts / drift ⚠️

| Location | Issue |
|----------|-------|
| **Executive Summary** (L76–80) | Still “seasons and shows” as primary framing |
| **MVP Feature Set** (L369–385) | No user agenda, no troupe hub, no multi-league |
| **Requirement Traceability** (L250–261) | Stale FR lists |
| **NFR-P1 context** (L528) | “50 events per active season” — should add cross-league agenda context |
| **NFR-Q1** (L610) | Test coverage list omits FR48–52 |
| **FR43–45** | Still “season participant” — acceptable as API alias if glossary note added |
| **PRD frontmatter** | `lastEdited` still 2026-05-23; no editHistory entry for League delta |

### SPEC.md

- No explicit “single active season” in SPEC (grep) — **low conflict**
- SPEC still V1/Firebase oriented — **known brownfield gap** (not introduced by League delta)

---

## Completeness Validation

| Section | Status |
|---------|--------|
| Executive Summary | **Partial** — needs League/agenda mention |
| Success Criteria | **Complete** (unchanged; optional agenda KPI) |
| Product Scope / MVP | **Partial** — Phase 1 list outdated |
| User Journeys | **Partial** — Journey 1 updated; 3/4 not |
| Functional Requirements | **Complete** — FR1–52 present |
| NFRs | **Complete** — but context strings stale |
| Frontmatter editHistory | **Incomplete** |

**Template variables:** None found ✓

---

## Holistic Quality

**Strengths**

- FR48–52 are capability-focused (not implementation leakage)
- Post-MVP Encounter clearly scoped out of MVP
- Journey 1 narrative matches stakeholder intent

**Weaknesses**

- PRD reads as **two eras stitched**: FR body = League; Summary/MVP/matrix = Season hub
- Downstream agents (epics, dev) may miss FR48–52 if they only read traceability table

---

## Simple-Fix Queue (recommended before Epic 12)

| Priority | Fix |
|----------|-----|
| **P0** | Update Requirement Traceability matrix (Journeys 1, 3, 4 + FR48–52) |
| **P0** | Update MVP Feature Set bullet: member → user agenda (FR48–49) |
| **P1** | Executive Summary: one paragraph on League + user agenda |
| **P1** | FR48 + FR49 measurability tightenings |
| **P1** | NFR-Q1 add FR48–49 to coverage list |
| **P2** | Frontmatter editHistory 2026-05-24 |
| **P2** | Journey 3 (Amira) narrative: multi-league creation + troupe hub |

---

## Verdict

| Question | Answer |
|----------|--------|
| Safe to start **Story 2.9** (Wave 0)? | **Yes** — FR49 partial sufficient |
| Safe to **`create-story` Epic 12**? | **After P0 fixes** (~1 h) |
| Full PRD re-validation needed? | **No** — delta re-run after simple-fix queue |

**Status:** **NEEDS WORK** — Warning severity, not blocking for Wave 0.

---

*Validation Architect — BMAD validate-prd workflow (batch delta run)*
