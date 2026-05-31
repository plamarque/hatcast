---
stepsCompleted:
  - step-01-detect-mode
  - step-02-load-context
  - step-03-risk-and-testability
  - step-04-coverage-plan
  - step-05-generate-output
lastStep: step-05-generate-output
lastSaved: 2026-05-31
inputDocuments:
  - _bmad-output/implementation-artifacts/3-19-retrait-roster-saison-sans-desactivation-troupe.md
  - _bmad-output/planning-artifacts/sprint-change-proposal-2026-05-31-participant-removal-three-levels.md
---

# Test Design: Story 3.19 — Season roster removal without troupe deactivation

**Date:** 2026-05-31
**Author:** Patrice
**Status:** Draft
**Mode:** Epic-Level (Phase 4) — single-story recette for Epic 3
**Stack:** Fullstack (Spring/Kotlin API + Angular web)

---

## Executive Summary

**Scope:** Full test design (recette) for Story 3.19 — season-local member removal with a durable sync guard (`removal_source`), re-inclusion API, and the UI revert from troupe deactivation. The story is implemented and marked `done`; this design serves as the **acceptance recipe + regression guard** for the three-level removal pyramid (event → season → troupe).

**Risk Summary:**

- Total risks identified: **10**
- High-priority risks (≥6): **2** (R-001 sync re-activation, R-002 season→troupe cascade)
- Critical categories: **DATA** (ghost participant resurrection), **BUS** (over-broad removal)

**Coverage Summary:**

- P0 scenarios: **8** (~10–14 h) — mostly already automated
- P1 scenarios: **9** — **8 automated**, 1 covered indirectly (gaps closed 2026-05-31)
- P2/P3 scenarios: **8** (~5–9 h)
- **Total effort**: ~24–36 h (~3–5 days) if built from scratch; **P0/P1 now fully automated** → residual = manual three-surface recette + optional P2/P3 edges.

> **Update 2026-05-31:** All automatable gaps closed and green. P1 (3.19-INT-009/010/011, 3.19-CMP-003), P2 (3.19-INT-013/014/015), P3 (3.19-INT-016/017) implemented; composition-pool guard now has a dedicated unit test (3.19-INT-012 → `CompositionParticipantPoolTest`). API `ParticipantControllerIntegrationTest` + `CompositionParticipantPoolTest` + `SeasonParticipantServiceTest` BUILD SUCCESSFUL; web `admin-participants.spec.ts` 15/15 pass. Only manual items remain: V38 migration smoke (R-003), tactile-target a11y waiver (R-010), and the three-surface recette walkthrough.

**Recette verdict driver:** PASS requires the two high risks fully covered by green automated tests (they are) **plus** the manual three-surface walkthrough (§ Execution Order) confirming season vs troupe scoping.

---

## Not in Scope

| Item | Reasoning | Mitigation |
| ---- | --------- | ---------- |
| **Event exclusion behavior** | Level 1 is the unchanged reference implementation (SCP §2.2) | Regression assert only (compose with season re-inclusion) |
| **Hard delete of availability/composition history** | Explicit non-goal (SCP §2.1, story Dev Notes) | Assert rows persist after REMOVED |
| **Account deletion (Story 1.7 / FR37)** | Separate story; no `users` row deletion in any path | Out of scope |
| **V38 backfill of pre-existing REMOVED rows** | Deferred review item; likely no member rows affected | Pre-prod data check (R-003) before deploy |
| **N+1 in cross-season sync** | Deferred perf debt, pre-existing | Monitor; not a release blocker |

---

## Risk Assessment

### High-Priority Risks (Score ≥6)

| Risk ID | Category | Description | Probability | Impact | Score | Mitigation | Owner | Timeline |
| ------- | -------- | ----------- | ----------- | ------ | ----- | ---------- | ----- | -------- |
| R-001 | DATA | `ensureMembershipParticipants` / `ensureForMembership` re-activates a season-admin-removed member on the next `GET /participants` (ghost reappears in stats/selectors) | 2 | 3 | 6 | `removal_source = SEASON_ADMIN` guard skips re-activation while membership ACTIVE; covered by service + integration tests | Dev/QA | done, verify green |
| R-002 | BUS | Season "Retirer" on a `kind=MEMBER` row deactivates troupe membership (original drift bug) instead of season-local removal | 2 | 3 | 6 | UI calls `removeSeasonParticipant`, not `deactivateMember`; API season route never calls troupe deactivation | Dev/QA | done, verify green |

### Medium-Priority Risks (Score 3-4)

| Risk ID | Category | Description | Probability | Impact | Score | Mitigation | Owner |
| ------- | -------- | ----------- | ----------- | ------ | ----- | ---------- | ----- |
| R-003 | DATA | V38 migration leaves pre-existing REMOVED member rows with `removal_source = NULL`; next sync may resurrect them as ACTIVE | 2 | 2 | 4 | Pre-prod data audit; backfill if member rows found NULL | Dev |
| R-004 | TECH | `SEASON_ADMIN` reconciliation logic duplicated across `SeasonParticipantMembershipSync` and `SeasonParticipantService` → behavioral drift over time | 2 | 2 | 4 | Shared assertions in both code paths; future refactor | Dev |
| R-005 | DATA | Event-scoped row linked to a season `REMOVED` participant still surfaces in event roster / composition pool (data leak via EVENT-fallback) | 2 | 2 | 4 | Guards in `EventRosterService.buildRoster` + `CompositionParticipantPool` (status + `findRemovedUserIdsForSeason`) | Dev/QA |

### Low-Priority Risks (Score 1-2)

| Risk ID | Category | Description | Probability | Impact | Score | Action |
| ------- | -------- | ----------- | ----------- | ------ | ----- | ------ |
| R-006 | BUS | `reinclude` allowed while troupe membership INACTIVE (should 400 "Réactivez d'abord l'adhésion") | 1 | 2 | 2 | Test |
| R-007 | BUS | Removed member who was a season organizer not demoted/refreshed | 1 | 2 | 2 | Test (component) |
| R-008 | DATA | Troupe reactivation (toggle / CSV / `addMemberByEmail`) does not restore `MEMBERSHIP_INACTIVE` rows | 1 | 2 | 2 | Test |
| R-009 | OPS | Race: `reinclude` vs concurrent membership deactivation (transient zombie) | 1 | 1 | 1 | Monitor (auto-healed by `findActiveLinkedToInactiveMembershipsForSeason`) |
| R-010 | BUS | M3-3 tactile target of "Retirer" button (40dp) below 48dp guideline | 1 | 1 | 1 | Monitor (pre-existing pattern, deferred) |

### Risk Category Legend

- **TECH**: Technical/Architecture · **SEC**: Security · **PERF**: Performance · **DATA**: Data Integrity · **BUS**: Business Impact · **OPS**: Operations

---

## Entry Criteria

- [ ] API + web build green (`./gradlew compileKotlin`, `ng build`)
- [ ] Flyway migration **V38** applied to the test database
- [ ] Test seed troupe + admin session fixtures available (`TestAuthSupport.joinSeedTroupe`)
- [ ] At least two seasons (A, B) of the same troupe creatable for cross-season assertions

## Exit Criteria

- [ ] All P0 tests passing (100%)
- [ ] All P1 tests passing or failures triaged with waiver
- [ ] No open high-risk (R-001, R-002) item unmitigated
- [ ] Manual three-surface recette walkthrough signed off (event / season / troupe scoping)
- [ ] No hard delete of availability/composition history observed in any path

---

## Test Coverage Plan

> Legend for **Status**: ✅ existing automated test · 🟡 partial / extend · ❌ gap to add · 👁 manual recette

### P0 (Critical) — Run on every commit

**Criteria**: Blocks core journey + High risk (≥6) + No workaround

| ID | Requirement (AC / invariant) | Test Level | Risk | Status | Existing test / Action |
| -- | ---------------------------- | ---------- | ---- | ------ | ---------------------- |
| 3.19-INT-001 | AC1 — season remove for `kind=MEMBER` sets `REMOVED` + `SEASON_ADMIN`, does **not** deactivate membership | API (integration) | R-002 | ✅ | `season remove for troupe member keeps membership active and sync does not restore` |
| 3.19-INT-002 | AC1/AC2 — removal is season-local: removed in A, still present in B | API (integration) | R-002 | ✅ | same test (asserts season B intact) |
| 3.19-INT-003 | AC3 — `GET /participants` sync does **not** re-activate a `SEASON_ADMIN` removal while membership ACTIVE | API (integration) | R-001 | ✅ | same test (double GET assert empty) |
| 3.19-UNIT-001 | AC3 — `ensureMembershipParticipants` skips `SEASON_ADMIN` rows | Unit | R-001 | ✅ | `ensureMembershipParticipants does not reactivate season admin removals` |
| 3.19-INT-004 | AC4 — troupe "Retirer" cascades `REMOVED` (`MEMBERSHIP_INACTIVE`) on all seasons; sync does not restore (regression Story 2.2) | API (integration) | R-002 | ✅ | `deactivating troupe member removes synced season participant and list does not restore it` |
| 3.19-CMP-001 | AC1/M3 — UI member "Retirer" calls `removeSeasonParticipant`, **not** `deactivateMember` | Component | R-002 | ✅ | `removes troupe member from season after confirm without deactivating membership` |
| 3.19-INT-005 | AC1 — synced member row cannot be PATCHed but **can** be season-removed | API (integration) | R-002 | ✅ | `cannot patch membership synced participant but can season remove` |
| 3.19-E2E-001 👁 | Three-surface scoping: event-exclude vs season-remove vs troupe-remove behave per SCP §2.5 table | Manual recette | R-001/R-002 | 👁 | Manual walkthrough (§ Execution Order) |

**Total P0**: 8 (7 automated ✅, 1 manual 👁)

### P1 (High) — Run on PR to main

**Criteria**: Important features + Medium risk + common workflows

| ID | Requirement (AC / invariant) | Test Level | Risk | Status | Existing test / Action |
| -- | ---------------------------- | ---------- | ---- | ------ | ---------------------- |
| 3.19-INT-006 | AC5 — `reinclude` reactivates **same** `season_participant_id`, clears `SEASON_ADMIN`, restores roster | API (integration) | R-001 | ✅ | `reinclude season participant restores roster and keeps event exclusion` |
| 3.19-INT-007 | AC6 — after season remove→reinclude, prior **event exclusion** still applies (filters compose) | API (integration) | R-005 | ✅ | same test (event roster still excludes) |
| 3.19-INT-008 | AC1 — explicit non-member `DELETE /participants/{id}` stays season-local soft remove | API (integration) | — | ✅ | `admin can create name-only season participant list and soft remove` |
| 3.19-INT-009 | R-006 — `reinclude` on member whose membership is INACTIVE returns **400** | API (integration) | R-006 | ✅ | `reinclude is rejected while troupe membership is inactive` (added 2026-05-31) |
| 3.19-INT-010 | R-008 — troupe reactivation (`addMemberByEmail` INACTIVE→ACTIVE) re-activates `MEMBERSHIP_INACTIVE` rows and restores roster | API (integration) | R-008 | ✅ | `reactivating troupe member restores cascade-removed season participant` (added 2026-05-31) |
| 3.19-INT-011 | R-005 — event-scoped row whose user was `REMOVED` at season level is excluded from event roster (`findRemovedUserIdsForSeason` guard) | API (integration) | R-005 | ✅ | `event roster hides member removed at season level via linked event row` (added 2026-05-31) |
| 3.19-INT-012 | R-005 — composition pool excludes participant removed at season level | Unit | R-005 | ✅ | `CompositionParticipantPoolTest` — `excludes event row whose user was removed at season scope` + `excludes event row linked to a removed season participant` (added 2026-05-31) |
| 3.19-CMP-002 | M3 — confirm dialog title/body/snackbar copy match SCP matrix; aria-label `Retirer ce membre de la saison` | Component | R-002 | ✅ | `removes troupe member ...` (snackbar) + `shows delete for troupe member rows ...` (aria-label) |
| 3.19-CMP-003 | R-007 — removing a member who is a season organizer demotes + refreshes organizers | Component | R-007 | ✅ | `demotes a season organizer when removing them from the season roster` (added 2026-05-31) |

**Total P1**: 9 (8 ✅ automated, 1 🟡 covered indirectly)

### P2 (Medium) — Run nightly/weekly

| ID | Requirement | Test Level | Risk | Status | Existing test / Action |
| -- | ----------- | ---------- | ---- | ------ | ---------------------- |
| 3.19-UNIT-002 | `ensureMembershipParticipants` idempotent for unchanged member rows | Unit | R-004 | ✅ | `ensureMembershipParticipants is idempotent for existing membership rows` |
| 3.19-UNIT-003 | `ensureForMembership` idempotent (single-membership path) | Unit | R-004 | ✅ | `ensureSeasonParticipantForMembership is idempotent` |
| 3.19-INT-013 | `reinclude` resyncs `displayName`/`normalizedEmail`/`user` from membership for member rows | API | R-004 | ✅ | `reinclude resyncs member display name from troupe membership` (added 2026-05-31) |
| 3.19-INT-014 | `reinclude` enforces display-name uniqueness for explicit participants (`...IgnoreCaseAndIdNot`) | API | — | ✅ | `reinclude of explicit participant conflicts with active duplicate name` (added 2026-05-31) |
| 3.19-CMP-004 | Roster split: Externes vs Membres sections render correctly | Component | — | ✅ | `splits roster into Externes and Membres sections` |
| 3.19-CMP-005 | Delete control hidden for member rows without `canManageMembers` | Component | — | ✅ | `hides delete for troupe member without canManageMembers` |
| 3.19-CMP-006 | Edit hidden for member rows (synced) | Component | — | ✅ | `hides edit for troupe member row` |
| 3.19-INT-015 | `participant_count` refreshed after remove / reinclude | API | DATA | ✅ | `participant count tracks remove and reinclude` (added 2026-05-31) |

**Total P2**: 8 (all ✅ automated)

### P3 (Low) — Run on-demand

| ID | Requirement | Test Level | Status | Action |
| -- | ----------- | ---------- | ------ | ------ |
| 3.19-INT-016 | `remove` on already-REMOVED participant is a no-op (idempotent, no 500) | API | ✅ | `removing an already removed participant is a no-op` (added 2026-05-31) |
| 3.19-INT-017 | `reinclude` on already-ACTIVE participant is a no-op | API | ✅ | `reincluding an already active participant is a no-op` (added 2026-05-31) |
| 3.19-MIG-001 | V38 enum migration applies cleanly; `removal_source` nullable default NULL | Migration smoke | 👁 | Manual pre-prod check (R-003) |
| 3.19-A11Y-001 | M3-3 — measure "Retirer" tactile target (≥48dp ideal; 40dp pre-existing waiver) | Manual / a11y | 👁 | Document waiver |

**Total P3**: 4 (2 ✅ automated, 2 👁 manual)

---

## Execution Order

### Smoke Tests (<5 min)
- [ ] `./gradlew test --tests '*SeasonParticipantServiceTest*'` (sync guard unit) — fast fail on R-001
- [ ] `npm run test -- --run admin-participants` (UI wiring) — fast fail on R-002

### P0 Tests (<10 min)
- [ ] `./gradlew test --tests '*ParticipantControllerIntegrationTest*'` (season-local remove, no-restore, troupe cascade, member remove path)
- [ ] Component: member "Retirer" → `removeSeasonParticipant` not `deactivateMember`

### P1 Tests (<30 min)
- [ ] reinclude + event-exclusion compose; INACTIVE-membership reinclude 400; troupe reactivation restore; event/composition leak guards
- [ ] Component: snackbar copy + aria-label + organizer demotion

### P2/P3 Tests (<60 min)
- [ ] Idempotency, count refresh, no-op edges, migration smoke, a11y target

### Manual three-surface recette (3.19-E2E-001) 👁
Reproduce the SCP §2.5 composition table end-to-end on `https://localhost:4200`:

1. **Event exclude** a member on `/saison/:slug/event/:eventSlug/admin/participants` → hidden from that event only; **still counted** in season stats.
2. **Season remove** the same member on `/saison/:slug/admin/participants` → confirm dialog "Retirer de cette saison ?"; snackbar "Membre retiré de la saison."; member disappears from season roster, selectors, stats; **troupe membership still ACTIVE**; member still on another season's roster.
3. Reload the participants list (triggers sync) → member **does not** reappear.
4. **Réintégrer** the member → roster/stats reappear; the prior **event exclusion still applies**.
5. **Troupe remove** on `/troupe/:slug/admin/membres` → "Retirer de la troupe ?"; cascades `REMOVED` across **all** seasons; reactivating membership restores everything.

---

## Resource Estimates

### Test Development Effort

| Priority | Count | Hours/Test | Total Hours | Notes |
| -------- | ----- | ---------- | ----------- | ----- |
| P0 | 8 | ~1.5 | ~10–14 | 7 already exist → residual ~1–2 h (manual recette) |
| P1 | 9 | ~1.0 | ~9–13 | 4 gaps/extends → residual ~3–5 h |
| P2 | 8 | ~0.5 | ~3–6 | 3 gaps/extends → residual ~1.5–3 h |
| P3 | 4 | ~0.25 | ~1–3 | mostly cheap edges + manual |
| **Total** | **29** | **-** | **~24–36** | **Residual new work ~4–8 h** (suite largely in place) |

### Prerequisites

**Test Data:**
- Seed troupe + admin (`signInAdmin`), target member added via `POST /troupes/{id}/members`
- Two seasons A/B of same troupe for cross-season assertions

**Tooling:**
- API: Spring Boot Test + MockMvc (`@SpringBootTest`, `@AutoConfigureMockMvc`, profile `test`)
- Web: Vitest + Angular TestBed (`admin-participants.spec.ts`)

**Environment:**
- Flyway V38 applied; H2/Postgres test profile
- For manual recette: `./scripts/start-dev.sh` (API `:8080`, web `https://localhost:4200`)

---

## Quality Gate Criteria

### Pass/Fail Thresholds
- **P0 pass rate**: 100% (no exceptions)
- **P1 pass rate**: ≥95% (waivers required for failures)
- **P2/P3 pass rate**: ≥90% (informational)
- **High-risk mitigations (R-001, R-002)**: 100% covered by green tests

### Coverage Targets
- **Critical paths** (season remove, sync guard, troupe cascade): ≥80%
- **Data-integrity invariants** (no resurrection, no hard delete, stable IDs): 100% of high risks
- **Business logic** (reinclude, compose filters): ≥70%

### Non-Negotiable Requirements
- [ ] AC1 + AC3 + AC4 covered and green (R-001, R-002)
- [ ] No `deactivateMember` call from the season participants surface
- [ ] No hard delete of availability/composition history
- [ ] Stable `season_participant_id` on re-inclusion

---

## Mitigation Plans

### R-001: Sync re-activation of season-admin removal (Score 6)
**Mitigation Strategy:** Durable `removal_source = SEASON_ADMIN` marker; both `SeasonParticipantService.ensureMembershipParticipants` and `SeasonParticipantMembershipSync.ensureForMembership` `continue`/skip such rows while membership ACTIVE.
**Owner:** Dev/QA · **Status:** Implemented · **Verification:** 3.19-UNIT-001, 3.19-INT-003 green.

### R-002: Season remove cascading to troupe deactivation (Score 6)
**Mitigation Strategy:** UI member "Retirer" routes to `removeSeasonParticipant`; season API route never invokes troupe deactivation; troupe-wide removal only on `/troupe/.../membres`.
**Owner:** Dev/QA · **Status:** Implemented · **Verification:** 3.19-CMP-001, 3.19-INT-001/004 green + manual 3.19-E2E-001.

---

## Assumptions and Dependencies

### Assumptions
1. Story 3.19 is implemented (`done`); this design validates and guards against regression.
2. Test DB is reset/per-test isolated so seed troupe membership state is deterministic.
3. `MembershipParticipantSyncCache` / `MembershipSyncScope` are reset between unit tests (as done in `SeasonParticipantServiceTest`).

### Dependencies
1. Flyway **V38** (`season_participant_removal_source`) applied before tests.
2. Stories 3.8 (amended remove policy), 2.2/2.8 (troupe removal), 17.16 (event level 1) remain `done`.

### Risks to Plan
- **Risk**: Pre-existing REMOVED rows with NULL `removal_source` resurrected in prod (R-003).
  - **Impact**: Ghost participants reappear in stats after deploy.
  - **Contingency**: Pre-prod data audit + targeted backfill before release.

---

## Follow-on Workflows (Manual)

- Run `*atdd` to generate any missing failing P1 tests (3.19-INT-009/011/012, 3.19-CMP-003) before/while closing gaps.
- Run `*trace` to produce the AC→test traceability matrix and gate decision once gaps are filled.
- Run `*automate` only if broader regression coverage is desired beyond the recette.

---

## Approval

**Test Design Approved By:**
- [ ] Product Manager: ____ Date: ____
- [ ] Tech Lead: ____ Date: ____
- [ ] QA Lead: ____ Date: ____

**Comments:**

---

## Interworking & Regression

| Service/Component | Impact | Regression Scope |
| ----------------- | ------ | ---------------- |
| **SeasonParticipantService** | Core remove/reinclude + sync guard | `ParticipantControllerIntegrationTest`, `SeasonParticipantServiceTest` |
| **SeasonParticipantMembershipSync** | Troupe cascade + reactivation; `MEMBERSHIP_INACTIVE` source | troupe deactivate/reactivate paths |
| **TroupeMembershipService** | `addMemberByEmail` reactivation re-syncs season rows | troupe member add/remove tests |
| **EventRosterService** | EVENT-fallback guard: ignore event rows tied to season `REMOVED` | event roster tests (R-005) |
| **CompositionParticipantPool** | Same guard in eligible-participant pool | composition pool tests (R-005) |
| **admin-participants (web)** | Member "Retirer" → season remove; copy; organizer demotion | `admin-participants.spec.ts` |

---

## Appendix

### Knowledge Base References
- `risk-governance.md` — Risk classification framework
- `probability-impact.md` — Risk scoring methodology
- `test-levels-framework.md` — Test level selection
- `test-priorities-matrix.md` — P0-P3 prioritization

### Related Documents
- Story: `_bmad-output/implementation-artifacts/3-19-retrait-roster-saison-sans-desactivation-troupe.md`
- SCP: `_bmad-output/planning-artifacts/sprint-change-proposal-2026-05-31-participant-removal-three-levels.md`
- OpenAPI: `services/api/openapi/participants.yaml`
- DOMAIN.md — three-level removal pyramid

---

**Generated by**: BMad TEA Agent — Test Architect Module
**Workflow**: `bmad-testarch-test-design`
**Version**: 4.0 (BMad v6)
