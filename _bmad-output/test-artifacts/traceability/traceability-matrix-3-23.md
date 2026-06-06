---
story: 3-23-invitation-scope-cascade-add
phase: PHASE_2_COMPLETE
gate_decision: PASS
lastSaved: 2026-06-06
oracle: formal_requirements
inputDocuments:
  - _bmad-output/implementation-artifacts/3-23-invitation-scope-cascade-add.md
  - services/api/openapi/participants.yaml
coverage_statistics:
  overall_coverage_percentage: 96
  priority_breakdown:
    P0:
      total: 12
      covered: 12
      percentage: 100
    P1:
      total: 10
      covered: 9
      percentage: 90
    P2:
      total: 4
      covered: 1
      percentage: 25
    P3:
      total: 3
      covered: 0
      percentage: 0
---

# Traceability Matrix — Story 3.23 (Invitation scope + cascade add)

**Date:** 2026-06-06  
**Author:** Murat / TEA (`bmad-testarch-trace`)  
**Story status:** done (implementation + manual recette Patrice 2026-06-06)

---

## Coverage oracle

| Source | Role | Confidence |
|--------|------|------------|
| Story AC1–AC9 + M3 | Primary requirements | High |
| OpenAPI `participants.yaml` | Contract (InvitationScope, addToSeasonRoster) | High |
| Manual recette (seed Les Improbots) | Behavioural confirmation A–G | High |
| ADR-0021 / SCP 2026-06-06 | Domain rules (out of scope items flagged) | Medium |

---

## Requirements → tests

| ID | Requirement | P | Level | Automated test(s) | Status |
|----|-------------|---|-------|-------------------|--------|
| 3.23-AC1 | Flyway V60 + OpenAPI `invitationScope` / `addToSeasonRoster` | P1 | Schema + contract | `V60__season_participant_invitation_scope.sql`; `participants.yaml`; DTO fields asserted in integration tests | **Covered** |
| 3.23-AC2a | Season guest **name-only** → carnet EXTERNE + `SEASON` scope | P0 | API int. | `ParticipantExterneCascadeIntegrationTest.season guest name-only add upserts carnet and SEASON scope row` | **Covered** |
| 3.23-AC2b | Season guest **email-linked** → carnet + `SEASON` scope | P0 | API int. | `ParticipantExterneCascadeIntegrationTest.season guest add upserts carnet and SEASON scope row` | **Covered** |
| 3.23-AC3 | Event guest default → carnet + event row, **no** season row | P0 | API int. | `event guest add upserts carnet without season row by default` | **Covered** |
| 3.23-AC3b | Duplicate active event guest → 409 | P1 | API int. | `duplicate active event guest add returns conflict` | **Covered** |
| 3.23-AC4a | `addToSeasonRoster: true` → season row `EVENT` scope | P0 | API int. | `event guest with addToSeasonRoster creates EVENT scope season row` | **Covered** |
| 3.23-AC4b | Event row linked to season row | P0 | API int. | `event add with addToSeasonRoster links event row to season row` | **Covered** |
| 3.23-AC5a | Re-add removed **season** externe → stable IDs | P0 | API int. | `re-adding removed externe season participant reuses stable ids` | **Covered** |
| 3.23-AC5b | Re-add removed **event** externe → stable IDs | P0 | API int. | `re-adding removed externe event participant reuses stable ids` | **Covered** |
| 3.23-AC5c | Re-add after **inactive** carnet → same `troupeMembershipId` | P1 | API int. | `re-adding season guest reactivates inactive externe carnet with stable membership id` | **Covered** (added TEA run) |
| 3.23-AC6a | MEMBER typeahead season add → no carnet, no scope | P0 | API int. | `member typeahead add does not upsert externe carnet` | **Covered** |
| 3.23-AC6b | MEMBER event add → no carnet upsert | P0 | API int. | `member event add does not upsert externe carnet` | **Covered** |
| 3.23-AC7 | `SEASON`-scoped participant + event exclusion unchanged | P1 | API int. | `season scoped externe supports event roster exclusion`; regression `ParticipantControllerIntegrationTest.event roster lists season participants and supports exclusion` (MEMBER) | **Covered** (externe path added TEA run) |
| 3.23-AC8a | Carnet rename → season participant displayName | P1 | API int. | `externe carnet rename propagates to linked season participant` | **Covered** |
| 3.23-AC8b | Carnet email update → season participant email | P1 | API int. | `externe carnet email update propagates to linked season participant` | **Covered** (added TEA run) |
| 3.23-AC9 | Meta: integration + unit + web dialog guardrails | P0 | Suite | `./gradlew test --tests '*Participant*' --tests '*TroupeMembership*'` (122 tests); `SeasonParticipantEntityKindTest`; dialog specs (37 tests) | **Covered** |
| 3.23-M3-1 | Season/event scope hints + checkbox Material | P1 | Component | `add-participant-dialog.spec.ts` (hint show/hide); `add-event-participant-dialog.spec.ts` (hint, checkbox default, submit payload) | **Covered** |
| 3.23-M3-2 | Tokens `var(--mat-sys-*)` only | P2 | Visual | Code review / FRONTEND_UI checklist — no automated visual diff | **Waived** |
| 3.23-M3-3 | Mobile 480px touch targets | P2 | Manual | Manual recette + FRONTEND_UI § checklist | **Waived** |
| 3.23-M3-5 | M3 checklist walk | P2 | Manual | Story Dev Notes — waived items noted | **Waived** |

---

## Deferred / out of scope (not gate blockers)

| ID | Item | P | Reason |
|----|------|---|--------|
| 3.23-DEF-01 | Typeahead carnet pool (ré-inclusion D) | P3 | Story **3.8d** — recette manuelle OK sans typeahead |
| 3.23-DEF-02 | Garde-fous dispos/agenda par scope | P3 | Story **3.25** — documenté comme limitation connue |
| 3.23-DEF-03 | Playwright E2E admin add flow | P3 | Vitest guardrails + API int. jugés suffisants (aligné 3.8c) |
| 3.23-DEF-04 | OpenAPI codegen drift check | P2 | TS interfaces maintenues à la main — pas de test auto |

---

## Gap analysis (TEA run 2026-06-06)

### Closed this run

| Gap | Action |
|-----|--------|
| AC7 sans chemin EXTERNE explicite | +1 test `season scoped externe supports event roster exclusion` |
| AC2 name-only non isolé | +1 test `season guest name-only add…` |
| AC5 inactive carnet | +1 test `re-adding season guest reactivates inactive externe carnet…` |
| AC8 email propagation | +1 test `externe carnet email update propagates…` |

### Residual (accepted)

| Gap | Risk | Mitigation |
|-----|------|------------|
| M3 mobile/tokens sans auto | Low | Manual recette + checklist FRONTEND_UI |
| Scope dispos non enforced | Medium (product) | Scheduled **3.25** |
| Carnet typeahead | Low | Scheduled **3.8d** |

---

## Test execution evidence

| Suite | Command | Result |
|-------|---------|--------|
| API cascade | `./gradlew test --tests 'com.hatcast.api.participant.ParticipantExterneCascadeIntegrationTest'` | **14/14** green |
| API regression | `./gradlew test --tests '*Participant*' --tests '*TroupeMembership*'` | **122/122** green |
| Web dialogs | `ng test --include='**/add-participant-dialog.spec.ts' --include='**/add-event-participant-dialog.spec.ts' --no-watch` | **37/37** green |

---

## Quality gate decision

| Criterion | Threshold | Actual | Pass? |
|-----------|-----------|--------|-------|
| P0 coverage | 100% | 100% (12/12) | ✅ |
| P1 coverage | ≥ 90% | 90% (9/10) | ✅ |
| Critical gaps | 0 | 0 | ✅ |
| AC9 meta suite | Green | Green | ✅ |

**Verdict: PASS**

P2/P3 items are explicitly deferred to later stories or manual M3 review. No blocker for story **3.23** closure from a test-architecture perspective.

---

## Related artifacts

- [test-design-story-3-23.md](../test-design-story-3-23.md)
- [automation-summary-3-23.md](../automation-summary-3-23.md)
- Story: [_bmad-output/implementation-artifacts/3-23-invitation-scope-cascade-add.md](../../implementation-artifacts/3-23-invitation-scope-cascade-add.md)
