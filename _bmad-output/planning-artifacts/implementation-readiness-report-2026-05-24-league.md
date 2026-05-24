---
stepsCompleted:
  - document-discovery
  - prd-analysis
  - epic-coverage-validation
  - ux-alignment
  - architecture-alignment
  - epic-quality-review
  - final-assessment
project: hatcast
assessmentDate: '2026-05-24'
assessmentScope: League journey replan (Epics 12–14, Waves 0–4)
workflowType: implementation-readiness
overallReadiness: READY WITH CAVEATS
readinessByWave:
  wave-0: READY
  wave-1: READY
  wave-2: NOT READY
  wave-3: NOT READY
inputDocuments:
  prd: _bmad-output/planning-artifacts/prd.md
  architecture: _bmad-output/planning-artifacts/architecture.md
  epics: _bmad-output/planning-artifacts/epics.md
  ux-primary: _bmad-output/planning-artifacts/ux-design-journey-league-agenda.md
  ux-legacy: _bmad-output/planning-artifacts/ux-design-hatcast-v2.md
  domain: DOMAIN.md
  adr: docs/adr/0011-league-model-and-user-agenda.md
  plan: _bmad-output/planning-artifacts/plan-v2-league-journey.md
priorAssessment: _bmad-output/planning-artifacts/implementation-readiness-report-2026-05-23.md
---

# Implementation Readiness Assessment — League journey (2026-05-24)

**Date:** 2026-05-24  
**Project:** hatcast V2  
**Prior assessment:** 2026-05-23 (FR1–47, pre-League) — overall **NEEDS WORK**  
**Scope:** Readiness for **new plan** ([plan-v2-league-journey.md](plan-v2-league-journey.md))

---

## Executive Summary

| Scope | Readiness | Gate |
|-------|-----------|------|
| **Wave 0** (Story 2.9, 3.6, AC10) | **READY WITH CAVEATS** | Can start dev |
| **Wave 1** (Epic 12 — user agenda) | **NOT READY** | PRD P0 fixes + UX sign-off + OpenAPI stub |
| **Wave 2** (Epic 13 — multi-active) | **NOT READY** | Architecture update + migration design |
| **Wave 3** (Epic 14 — troupe hub) | **NOT READY** | Depends Wave 1–2 |
| **Resume Epic 5.4+ / 6.4+** | **READY WITH CAVEATS** | Parallel OK; full journey gate = Wave 1 |

**Overall:** **NOT READY** for League epics — **expected** after a planning pivot. Documentation is **directionally aligned** but **artifact drift** must be cleared before Epic 12 `create-story`.

---

## Document Discovery

| Document | Version | Role | Status |
|----------|---------|------|--------|
| `prd.md` | FR1–52 (2026-05-24 edit) | Requirements | ✓ P0 fixes applied |
| `DOMAIN.md` | League + multi-active | Normative | ✓ Updated |
| `ADR 0011` | Accepted | Decision | ✓ |
| `epics.md` | Epics 12–15 added | Delivery | ✓ Updated |
| `plan-v2-league-journey.md` | Waves 0–4 | Order | ✓ |
| `ux-design-journey-league-agenda.md` | Approved 2026-05-24 | UX target | ✓ RES-001 filters |
| `ux-design-hatcast-v2.md` | Pre-League | UX legacy | ⚠️ Conflicts (season hub, single season) |
| `architecture.md` | League journey (2026-05-24) | Technical | ✓ Multi-active + `/agenda` API |
| `sprint-status.yaml` | Pre-League | Tracking | ❌ Epics 12–14 not listed |
| `prd-validation-report-2026-05-24-league.md` | This run | QA | ⚠️ NEEDS WORK |

**Duplicates:** No blocking whole/sharded conflicts. **Two UX sources** — journey doc supersedes v2 for navigation; v2 still valid for event detail / dispos / équipe.

---

## PRD ↔ Epic Coverage (FR48–52)

| FR | Epic | Story | Coverage |
|----|------|-------|----------|
| FR48 | 12 | 12.1–12.3 | ✓ Mapped |
| FR49 | 12 | 2.9, 12.5 | ✓ Mapped |
| FR50 | 13 | 13.3–13.4 | ✓ Mapped |
| FR51 | 12 | 12.4 | ✓ Mapped |
| FR52 | 14 | 14.1–14.5 | ✓ Mapped |
| FR11 (extended) | 13 | 13.1–13.2, 13.5 | ✓ Mapped |

**Gap:** No FR for **“request to join troupe”** — FR52 references it; depends Epic 4 (backlog).

---

## UX Alignment

| UX-DR | Spec location | Implementation | Status |
|-------|---------------|----------------|--------|
| UX-DR13–18 | `ux-design-journey-league-agenda.md` | Not started | Draft |
| UX-DR1–2 | `ux-design-hatcast-v2.md` | `/seasons`, season-home | **Superseded** for member hub |
| UX-DR4–6 | v2 + code | event-detail | ✓ Still valid |

**Critical UX gaps before Wave 1:**

1. Stakeholder **sign-off** on journey doc (Patrice)
2. Confirm **Ligue** vs Saison label
3. Wireframe-level acceptance for **filter UX** on `/agenda` (optional low-fi OK)

**Sally verdict:** Screen-by-screen spec is **sufficient for Epic 12 story breakdown** once sign-off done.

---

## Architecture Alignment

| Topic | architecture.md | DOMAIN / ADR 0011 | Gap |
|-------|-----------------|-------------------|-----|
| Multi-active leagues | ❌ Single active season | ✓ Multiple active | **CRITICAL** |
| User agenda API | Not described | FR48 | **MAJOR** — needs OpenAPI + package design |
| Route `/agenda` | Not described | UX-DR14 | **MINOR** |
| Troupe hub | Partial (admin routes) | UX-DR16 | **MAJOR** |

**Required before Wave 2:**

- Update `architecture.md` § data model + frontend routes
- Flyway migration note for 13.1
- Optional: OpenAPI `me/agenda.yaml`

---

## Epic Quality Review (Epics 12–14)

| Epic | Story count | AC quality | Issues |
|------|-------------|------------|--------|
| **12** | 6 | Medium | 12.1 needs response schema; 12.6 alias strategy |
| **13** | 5 | **Thin** | 13.1–13.2 need migration AC; 13.5 retest list |
| **14** | 5 | Medium | 14.5 blocked on Epic 4 |
| **15** | 2 | Placeholder | Post-MVP OK |

**Missing artifacts:**

- No `implementation-artifacts/12-*.md` story files
- No `12.1` OpenAPI contract
- `sprint-status.yaml` not updated

**Epic 3 regression risk:** Stories 3.1 done with **opposite** invariant — 13.5 mandatory.

---

## Conflict Register (normative)

| # | Conflict | Severity | Resolution |
|---|----------|----------|------------|
| C1 | `architecture.md` vs DOMAIN/ADR single-active | **Resolved** | architecture.md updated 2026-05-24 |
| C2 | PRD traceability vs FR48–52 | **Resolved** | PRD simple-fix queue applied |
| C3 | `ux-design-hatcast-v2.md` `/seasons` as hub vs journey `/agenda` | **Major** | Add deprecation note in v2 doc |
| C4 | Epic 5–6 in progress vs Wave 1 gate | **Process** | Documented in PLAN — parallel OK |
| C5 | Story 3.1 AC text in epics vs ADR | **Major** | Revise Story 3.1 note + 13.5 |

---

## Readiness by Wave (detail)

### Wave 0 — READY WITH CAVEATS ✓

| Item | Status |
|------|--------|
| Story 2.9 defined in epics | ✓ |
| V1 reference (`seasonPreferences.js`) | ✓ |
| Resolver 2.4 | ✓ |
| **Caveat** | Final routing target evolves in 12.5 (`/agenda`) |

**Action:** `create-story` 2.9 → dev.

### Wave 1 — NOT READY ✗

| Blocker | Owner |
|---------|-------|
| UX journey sign-off | Patrice |
| PRD P0 traceability fixes | PM |
| OpenAPI sketch for `/v1/me/agenda` | Architect/Dev |
| `create-story` 12.1–12.6 | PO |

### Wave 2 — NOT READY ✗

| Blocker | Owner |
|---------|-------|
| architecture.md update | Architect |
| Migration design 13.1 | Dev |
| Story 13.x full AC (`create-story`) | PO |

### Wave 3 — NOT READY ✗

Depends Wave 1–2.

---

## Comparison to 2026-05-23 Assessment

| Dimension | 2026-05-23 | 2026-05-24 |
|-----------|------------|------------|
| FR coverage | FR1–47 | +FR48–52 mapped to epics |
| UX | ux-design-hatcast-v2 | +journey doc; **dual UX period** |
| Domain | Single active season | **Multi-active** (ADR 0011) |
| Implementation | Epics 1–6 partial done | **Re-sequenced** Waves 0–4 |
| Overall | NEEDS WORK | NOT READY (new scope — normal) |

**Core loop (5–6):** Still **implementable** — code exists; journey refactor is **navigation**, not availability/composition rewrite.

---

## Recommended Action Plan

### Before any Epic 12 dev (1–2 days)

1. ✏️ PRD simple-fix queue ([validation report](prd-validation-report-2026-05-24-league.md) P0)
2. ✍️ Sign-off `ux-design-journey-league-agenda.md`
3. 📝 Update `architecture.md` (at least League + agenda sections)
4. 📋 Update `sprint-status.yaml` (2.9, epic-12 backlog)
5. 📄 `create-story` 12.1 with OpenAPI response shape

### Parallel (no block)

- Wave 0: Story **2.9**, **3.6**, AC10
- Epic 5.4+ / 6.4+ (with PLAN gate awareness)

### Before Wave 2

- Migration review 13.1
- Story 3.1 completion note + 13.5 retest checklist

---

## Final Verdict

| Question | Answer |
|----------|--------|
| Was the replan worth validating? | **Yes** — caught C1 architecture drift and PRD matrix gap |
| Can we implement the **full** League vision now? | **No** |
| Can we start **Wave 0** today? | **Yes** |
| Can we start **Epic 12** this week? | **After** P0 fixes + UX sign-off (~1–2 days) |

**Overall readiness:** **NOT READY** (League epics) · **READY WITH CAVEATS** (Wave 0 + continue 5/6)

---

*Implementation Readiness — BMAD check-implementation-readiness (batch delta run)*
