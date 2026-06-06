---
stepsCompleted:
  - trace-phase-1
  - trace-phase-2
  - automate-gap-fill
lastSaved: 2026-06-06
inputDocuments:
  - _bmad-output/implementation-artifacts/3-23-invitation-scope-cascade-add.md
story: 3-23-invitation-scope-cascade-add
---

# Test Design: Story 3.23 — Invitation scope + cascade add

**Date:** 2026-06-06  
**Status:** Guardrails complete — gate **PASS**  
**Stack:** API (Spring Boot integration) + Angular Vitest (component)

---

## Scope

ADR-0021 P2: upsert carnet `EXTERNE` + `invitation_scope` (`SEASON` | `EVENT`) on season/event participant add, with propagation from carnet edits and non-regression for MEMBER typeahead.

**Out of scope for automation:** 3.8d (carnet typeahead), 3.25 (scoped dispos guards), Epic 7 invite.

---

## Test levels

| Level | Focus | Rationale |
|-------|-------|-----------|
| **API integration** | Cascade, stable IDs, exclusion, propagation | Source of truth for business rules |
| **Unit** | `SeasonParticipantEntity.kind()` EXTERNE | DTO correctness without DB |
| **Component** | Scope hints, checkbox, submit payloads | M3 UX guardrails without E2E cost |
| **Manual** | Seed Les Improbots A–G | End-to-end product validation (done) |

---

## Automated scenarios

### API — `ParticipantExterneCascadeIntegrationTest` (14)

| ID | Priority | Description |
|----|----------|-------------|
| 3.23-API-01 | P0 | Season name-only → EXTERNE + SEASON |
| 3.23-API-02 | P0 | Season email-linked → carnet + SEASON |
| 3.23-API-03 | P0 | Event default → carnet, no season row |
| 3.23-API-04 | P1 | Duplicate event guest → 409 |
| 3.23-API-05 | P0 | addToSeasonRoster → EVENT scope season row |
| 3.23-API-06 | P0 | addToSeasonRoster links event ↔ season row |
| 3.23-API-07 | P0 | Re-add season externe stable IDs |
| 3.23-API-08 | P0 | Re-add event externe stable IDs |
| 3.23-API-09 | P1 | Inactive carnet reactivation stable membership |
| 3.23-API-10 | P1 | SEASON externe event roster exclusion |
| 3.23-API-11 | P1 | Carnet rename → season participant |
| 3.23-API-12 | P1 | Carnet email → season participant |
| 3.23-API-13 | P0 | Member season add no carnet |
| 3.23-API-14 | P0 | Member event add no carnet |

### API — supporting

| File | Role |
|------|------|
| `ParticipantControllerIntegrationTest.kt` | Broader participant CRUD, MEMBER roster exclusion regression |
| `SeasonParticipantEntityKindTest.kt` | `ParticipantKind.EXTERNE` |
| `SeasonParticipantServiceTest.kt` | `ensureMembershipParticipants` skips EXTERNE |

### Web — dialog specs (37 total in 2 files)

| ID | Priority | File | Description |
|----|----------|------|-------------|
| 3.23-WEB-S01 | P1 | `add-participant-dialog.spec.ts` | Season scope hint for guest |
| 3.23-WEB-S02 | P1 | same | Hide hint when member selected |
| 3.23-WEB-E01 | P1 | `add-event-participant-dialog.spec.ts` | Event scope hint for guest |
| 3.23-WEB-E02 | P1 | same | Hide hint when member selected |
| 3.23-WEB-E03 | P1 | same | Checkbox default off |
| 3.23-WEB-E04 | P1 | same | Submit `addToSeasonRoster: true` |
| 3.23-WEB-P01 | P1 | `admin-participants.spec.ts` | EXTERNE kind + removable behaviour |

*(Remaining cases are 3.8c typeahead guardrails — still valid regression for 3.23 AC6.)*

---

## Manual / waived

| Item | Reason |
|------|--------|
| Scénarios A–G seed Les Improbots | Executed by Patrice — recorded in story Manual Recette |
| M3-2 tokens, M3-3 mobile 480px | FRONTEND_UI checklist — visual |
| Playwright E2E | P3 — deferred (same posture as 3.8c) |

---

## Verdict

**Automated guardrails: PASS** — 14 dedicated API integration tests + 122-test participant/membership regression + 37 Vitest dialog cases. TEA gap-fill added 4 API tests (AC2 name-only, AC5 inactive carnet, AC7 externe exclusion, AC8 email propagation).
