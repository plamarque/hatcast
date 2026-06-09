---
stepsCompleted:
  - step-01-document-discovery
  - step-02-prd-analysis
  - step-03-epic-coverage-validation
  - step-04-ux-alignment
  - step-05-epic-quality-review
  - step-06-final-assessment
assessmentScope: 'Story 17.39 — UI category selection (Infos tab)'
date: '2026-06-09'
project: hatcast
assessor: bmad-check-implementation-readiness
documentsIncluded:
  prd: prd.md
  architecture: architecture.md
  epics: epics.md
  uxNormative: ux-design-category-glossary-17-39.md
  changeProposal: sprint-change-proposal-2026-06-08-category-glossary-ux.md
  dependencyStory: implementation-artifacts/17-38-category-glossary-api.md
  uxContext: ux-design-journey-league-agenda.md
  sprintStatus: implementation-artifacts/sprint-status.yaml
---

# Implementation Readiness Assessment Report

**Date:** 2026-06-09  
**Project:** hatcast  
**Scope:** Story **17.39** — UI category selection & admin link (Epic 17)  
**Assessor:** Implementation Readiness workflow (BMad)

---

## Document Inventory

### PRD Documents

**Whole documents:**
| File | Size | Modified |
|------|------|----------|
| `prd.md` | 74 Ko | 2026-06-08 |
| `prd-validation-report.md` | 22 Ko | 2026-05-27 |
| `prd-validation-report-2026-05-24-league.md` | 7 Ko | 2026-05-27 |

**Sharded:** none

### Architecture Documents

| File | Size | Modified |
|------|------|----------|
| `architecture.md` | 37 Ko | 2026-05-27 |

**Sharded:** none

### Epics & Stories Documents

| File | Size | Modified |
|------|------|----------|
| `epics.md` | 206 Ko | 2026-06-08 |

**Story artifacts (17.39 scope):**
| File | Status |
|------|--------|
| `implementation-artifacts/17-38-category-glossary-api.md` | **done** |
| `implementation-artifacts/17-39-*.md` | **missing** |
| `implementation-artifacts/17-40-*.md` | **missing** |
| `sprint-status.yaml` | 17-39: backlog; 17-38: done |

**Change proposals:**
| File | Role |
|------|------|
| `sprint-change-proposal-2026-06-08-category-glossary-ux.md` | Pivot SCP for 17.38–17.40 |

### UX Design Documents

| File | Role for 17.39 |
|------|----------------|
| `ux-design-category-glossary-17-39.md` | **Normative** — S1 Infos + S2 dialog |
| `ux-design-specification.md` | Global UX framework |
| `ux-design-journey-league-agenda.md` | Screen 6b (to amend) |
| `ux-design-scope-admin-menu-epic17.md` | Admin menu (17.40 gear entry) |
| `_bmad-output/previews/category-glossary-ux-mockup.html` | Visual preview |

**Sharded UX packages:** `ux-designs/ux-hatcast-2026-06-03/`, `ux-hatcast-2026-06-05/`, `ux-member-gender-parity-2026-06-05/` (not in 17.39 scope)

### Duplicate / conflict resolution

- No whole-vs-sharded conflicts for PRD, Architecture, or Epics.
- PRD validation reports are auxiliary artifacts, not competing PRDs.

---

## PRD Analysis

### Functional Requirements

Requirements FR1–FR64 extracted from `prd.md` § Functional Requirements (lines 445–594).

| ID | Requirement (summary — full text in `prd.md`) |
|----|-----------------------------------------------|
| FR1 | Sign in with Google (MVP) |
| FR2 | Sign in with email/password |
| FR3 | Password reset via email |
| FR4 | Remember-me session ≥ 30 days |
| FR5 | Sign out |
| FR6 | Troupe membership + member profile |
| FR7 | Troupe admin manages members and roles |
| FR8 | Navigate between troupes |
| FR9 | Troupe-specific display name (pseudo) |
| FR10 | Avatar upload (JPEG/PNG/WebP, 2 MB) + Google import |
| FR11 | CRUD leagues (seasons) |
| FR12 | CRUD events (title, date/time, location, description, type, lifecycle) |
| FR13 | View active seasons/events (members + authorized participants) |
| FR14 | Configure event types and roles |
| FR15 | Record availability (available/unavailable/unknown) |
| FR16 | Role-level availability + mandatory volunteer |
| FR17 | Proxy availability (organizer/admin) |
| FR18 | Availability comment (500 chars) |
| FR19 | Organizer view eligible participants by role |
| FR20 | Weighted random draw |
| FR21 | Manual assign/reassign; multi-role stacking |
| FR22 | Draft composition + publish |
| FR23 | Validate/unlock composition |
| FR24 | Per-role selection odds (explainability) |
| FR25 | Participant confirm/decline after validation |
| FR26 | Proxy confirm/decline |
| FR27 | Open slots after withdrawal — organizer actions |
| FR28 | Composition lifecycle states |
| FR29 | Global push opt-in (MVP) |
| FR30 | Global push; per-category prefs post-MVP |
| FR31 | Member notification intents (MEP + P1) |
| FR31b | Organizer ops notifications (P2) |
| FR32 | Public troupe directory |
| FR33 | Public season/event pages |
| FR34 | Season/event organizer designation |
| FR35 | Audit trail |
| FR36 | Account profile + password change |
| FR37 | Account deletion |
| FR38 | Self-service guest invitations (post-MVP) |
| FR39 | External contributor selection modes (post-MVP) |
| FR40 | PWA installability |
| FR41 | Client update without manual cache clear |
| FR42 | CSV member import/export |
| FR43 | Season participant roster |
| FR44 | Event-only participants |
| FR45 | Optional email → account linking |
| FR46 | Preferred roles pre-selection |
| FR47 | Anonymized workflow analytics |
| FR48 | Personal user agenda (multi-league) |
| FR49 | Post-login routing (no stub home) |
| FR50 | League creation roster choice |
| FR51 | Event detail → league/troupe navigation |
| FR52 | Troupe hub (leagues, pseudo, admin, directory) |
| FR53 | League workspace: Agenda / Historique / Statistiques |
| FR54 | Statistiques CSV export |
| FR55 | Cross-scope troupe/league filters |
| FR56 | Travel league for déplacements |
| FR57 | Draw within single league |
| FR58 | Personal season glance route |
| FR59 | Other participant season glance (transparency) |
| FR60 | Statistiques DEPLACEMENT columns |
| FR61 | Self-join OPEN troupes (+ Demo) |
| FR62 | Join policy OPEN \| INVITE_ONLY |
| FR63 | Platform admin manages join policy |
| FR64 | Production Demo troupe seed |

**Total FRs: 64**

**Relevance to 17.39:** The PRD does **not** define a dedicated FR for spectacle category glossary or selection UI. Category governance is an **Epic 17 / ADR 0013** extension. Indirect PRD touchpoints: **FR12** (event attributes), **FR34** (organizer/admin roles), **FR56** (déplacements compartment), **FR60** (stats compartments). SCP explicitly states: *« PRD — No direct FR conflict — N/A »*.

### Non-Functional Requirements

| ID | Criterion |
|----|-----------|
| NFR-P1 | TTI ≤ 3 s p95 (Fast 3G) on primary flows |
| NFR-P2 | Read latency ≤ 500 ms p95 |
| NFR-S1 | TLS 1.2+; secure session storage |
| NFR-S2 | 0 unauthorized cross-troupe exposures; 100% role checks on protected endpoints |
| NFR-S3 | Account deletion within 30 days |
| NFR-S4 | CSV import/export data safety |
| NFR-S5 | Participant email visibility restricted |
| NFR-R1 | No P0 version skew > 24 h |
| NFR-R2 | Async notification failures logged; consistent writes |
| NFR-SC1 | Load test 50 troupes × 100 members × 50 events |
| NFR-A1 | WCAG 2.1 AA on core flows; keyboard operability |
| NFR-I1 | Auth success ≥ 99% |
| NFR-Q1 | ≥ 80% backend coverage; critical paths tested |

**Total NFRs: 13**

**Relevance to 17.39:** **NFR-A1** (dialog keyboard/focus trap, 48 dp targets), **NFR-P1** (dialog + PATCH responsiveness), **NFR-S2** (category list scoped to troupe membership).

### Additional Requirements

- **Angular Material 3** mandatory for UI (`FRONTEND_UI.md`, UX-DR11).
- **Brownfield:** legacy autocomplete UI still shipped in `event-category-dialog.ts` — must be refactored.
- **API contract:** `GET /v1/troupes/{id}/categories` + event PATCH validation (delivered in **17.38**).

### PRD Completeness Assessment (17.39 lens)

The PRD is complete for MVP scope but **does not encode category glossary governance** at FR level. This is acceptable for a brownfield Epic 17 extension documented via SCP + UX spec + ADR 0013. No PRD amendment is blocking 17.39 if traceability is maintained through epics/SCP/UX.

---

## Epic Coverage Validation

### Epic FR Coverage Extracted

`epics.md` § FR Coverage Map claims coverage for **FR1–FR64** across Epics 1–18. Epic 17 covers **FR52** (troupe hub) and navigation chrome; category stories (17.7–17.10) extend ADR 0013 beyond explicit PRD FRs.

### FR Coverage Analysis (global)

| Metric | Value |
|--------|-------|
| Total PRD FRs | 64 |
| FRs in epics coverage map | 64 |
| Missing from epics | **0** |
| Coverage percentage | **100%** (PRD-level) |

### Story 17.39 traceability gap

| Requirement source | Epic/story coverage | Status |
|---------------------|---------------------|--------|
| SCP §4.7 Story 17.39 AC | **Not in `epics.md`** | ❌ MISSING |
| UX spec S1 + S2 | Referenced in SCP; no epic story block | ❌ MISSING |
| Amended 17.8 AC (radio list) | `epics.md` still shows **autocomplete + chip ×** | ⚠️ STALE |
| Story file `17-39-*.md` | Not created | ❌ MISSING |
| Dependency 17.38 | `sprint-status.yaml`: **done** | ✅ SATISFIED |

### Missing Requirements (17.39-specific)

**Critical for implementation readiness:**

1. **Story 17.39 not registered in `epics.md`** — SCP §4.4 lists amend + add 17.38/17.39; only 17.7/17.8 blocks exist today.
2. **No implementation story file** — `bmad-create-story` not yet run for 17.39.
3. **Stale 17.8 AC in epics** — contradicts UX spec v3 and shipped direction; risks wrong acceptance at review time.

**Not blocking (deferred to 17.40):** Admin CRUD UI (S3/S4) explicitly out of 17.39 per UX spec handoff table.

---

## UX Alignment Assessment

### UX Document Status

**Found** — `ux-design-category-glossary-17-39.md` (draft, 2026-06-08) is detailed and implementation-ready for **S1** (Infos action-row) and **S2** (radio dialog). Includes M3 checklist, accessibility, edge cases, file handoff, and mockup preview.

### UX ↔ PRD Alignment

| Check | Result |
|-------|--------|
| PRD FR for category selection | None — expected for Epic extension |
| Organizer vs admin roles | Aligns with FR34 permission model |
| Déplacements compartment | Aligns with FR56/FR60 + ADR 0012 |
| Controlled vocabulary | Product decision in SCP; not PRD-level |

### UX ↔ Architecture Alignment

| Check | Result |
|-------|--------|
| API endpoints for category list + PATCH | ✅ Delivered in 17.38 (`categories.yaml`) |
| `architecture.md` mentions glossary | ⚠️ No explicit section (gap in planning doc, not runtime) |
| Angular Material dialog + radio | ✅ Supported by stack (ADR + FRONTEND_UI) |
| Route `/troupes/:slug/admin/parametres?tab=categories` | ⚠️ **17.40** — 17.39 only navigates; route may not exist yet |
| Current code vs spec | ❌ `event-category-dialog.ts` still **MatAutocomplete** + free text |

### Alignment Issues

| # | Issue | Severity |
|---|-------|----------|
| UX-1 | **SCP §4.7 AC#4** says admin CRUD in sheet/dialog from Infos; **UX spec** assigns CRUD to **17.40** (page S3). SCP not amended after UX split. | 🟠 Major |
| UX-2 | **`epics.md` Story 17.8** still documents autocomplete/chip `×`; UX v3 removes `×`, uses action-row + S2. | 🟠 Major |
| UX-3 | **`ux-design-journey-league-agenda.md` § Screen 6b** — SCP lists as *Replace*; amend pending PO validation. | 🟡 Minor |
| UX-4 | **SCP approval** still *pending* (§6 checklist). | 🟡 Minor (product sign-off) |
| UX-5 | **17.39 depends on navigation target** for « Gérer les catégories » — route owned by **17.40** (backlog). Link can 404 or stub until 17.40 ships. | 🟠 Major (coordination) |

### Warnings

- UX spec status = **draft**; stakeholder decisions recorded but Screen 6b normative doc not yet amended.
- Recommended dev order per UX: **17.38 → 17.40 → 17.39**; sprint-status lists 17.39 before 17.40 — sequencing mismatch.

---

## Epic Quality Review

### Epic 17 context (17.39 slice)

Epic 17 delivers navigation and category governance — user-facing value is clear. Story 17.39 is appropriately scoped as **organizer category selection** on event Infos tab.

### Story 17.39 quality checklist

| Criterion | Assessment |
|-----------|------------|
| Clear user value | ✅ Organizer selects category from controlled list without typing |
| Independent completable | ⚠️ **Partial** — needs 17.38 API (done); admin link target needs 17.40 route or stub |
| Given/When/Then ACs | ❌ **Missing** — no story file; SCP has high-level AC only |
| M3 acceptance criteria | ⚠️ Referenced in SCP (M3-1…M3-5) but not in dedicated story file |
| Forward dependencies | ✅ No dependency on future epics beyond 17.38 |
| Test plan | ✅ SCP lists `event-category-dialog.spec.ts`, `event-infos-tab.spec.ts` |

### Quality violations

#### 🔴 Critical

1. **No story file for 17.39** — cannot run `bmad-dev-story` with full developer context (tasks, dev notes, file paths, M3 AC).
2. **Story absent from `epics.md`** — breaks traceability chain SCP → epics → story file → sprint-status.

#### 🟠 Major

3. **Scope split SCP vs UX not propagated** — SCP bundles admin CRUD into 17.39; UX assigns to 17.40. Dev could implement wrong surface without story file clarifying split.
4. **Sequencing conflict** — UX recommends 17.40 before 17.39; sprint-status implies 17.39 next after 17.38. Admin link behavior undefined if 17.40 not ready.
5. **Stale 17.8 AC in epics** — acceptance auditor could validate against obsolete autocomplete behavior.

#### 🟡 Minor

6. SCP formal approval pending.
7. `architecture.md` not updated for category CRUD (17.38 story chose minimal doc scope).

### Best practices compliance (17.39)

- [x] Epic delivers user value
- [x] Story dependency on 17.38 is backward-only (17.38 done)
- [ ] Stories appropriately sized — 17.39 scope clarified in UX but not in story file
- [ ] Clear acceptance criteria — missing dedicated story
- [ ] Traceability to FRs — indirect only (ADR/Epic extension)

---

## Summary and Recommendations

### Overall Readiness Status

**NEEDS WORK** — UX spec and API dependency (17.38) are strong; **planning artifacts for 17.39 itself are incomplete** before `bmad-dev-story`.

### Critical Issues Requiring Immediate Action

1. **Run `bmad-create-story` for 17.39** — produce `17-39-ui-category-selection.md` with AC from UX spec S1/S2, explicit **out-of-scope** (S3/S4 → 17.40), M3 checklist, and file handoff.
2. **Amend `epics.md`** — add Story 17.39 block; update Story 17.8 AC to radio/action-row model; add 17.40 if missing.
3. **Resolve sequencing** — decide: implement **17.40 first** (UX recommendation) or ship 17.39 with admin link hidden/stubbed until 17.40 route exists.

### Recommended Next Steps

1. **Approve SCP** (or record explicit approval in SCP §6) — closes product sign-off gap.
2. **`bmad-create-story` → 17.39** — align AC with `ux-design-category-glossary-17-39.md` § S1, S2, Handoff; reference 17.38 API DTOs.
3. **Clarify admin link strategy** — if 17.39 before 17.40: either defer « Gérer les catégories » link to 17.40, or implement minimal route stub returning « Bientôt ».
4. **Amend Screen 6b** in `ux-design-journey-league-agenda.md` after PO validation.
5. **Update SCP §4.7** — remove admin CRUD from 17.39 AC; point to 17.40 for S3/S4.
6. **`bmad-dev-story`** once story file exists and sequencing decision is made.

### Readiness by dimension

| Dimension | Status | Notes |
|-----------|--------|-------|
| PRD | ✅ N/A at FR level | No conflict; Epic extension model OK |
| Architecture | ✅ Runtime ready | API in 17.38; planning doc thin |
| UX | ✅ Strong spec | Draft; S1/S2 detailed; mockup available |
| Epics | ❌ Gap | 17.39 not in epics.md; 17.8 stale |
| Story file | ❌ Missing | Blocker for dev workflow |
| Dependencies | ✅ 17.38 done | API + OpenAPI + tests shipped |
| Tests | ⚠️ Planned | Named in SCP; no story tasks yet |

### Final Note

This assessment identified **7 issues** across **4 categories** (traceability, scope alignment, sequencing, stale docs). **2 critical** blockers must be resolved before implementation: **story file creation** and **epics registration**. The UX specification and completed API story (17.38) provide sufficient design and backend context — the gap is **delivery planning hygiene**, not product ambiguity.

---

*Report generated: 2026-06-09 — Implementation Readiness workflow complete.*
