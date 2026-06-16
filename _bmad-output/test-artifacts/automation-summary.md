---
stepsCompleted:
  - step-01-preflight-and-context
  - step-02-identify-targets
  - step-03-generate-tests
  - step-04-validate-and-summarize
lastStep: step-04-validate-and-summarize
lastSaved: 2026-06-16
inputDocuments:
  - _bmad-output/implementation-artifacts/19-17-api-crud-formules-tirage.md
  - _bmad-output/test-artifacts/19-17-formula-api-test-design.md
  - project-context.md
story: 19-17-api-crud-formules-tirage
detected_stack: backend
execution_mode: sequential
---

# Automation Summary — Story 19.17 (API CRUD draw formulas)

**Date:** 2026-06-16  
**Author:** TEA / bmad-testarch-automate  
**Status:** Review-gap coverage complete — targeted integration tests green

---

## Context

| Item | Value |
|------|-------|
| Story | `19-17-api-crud-formules-tirage` |
| Stack | Kotlin + Spring Boot + MockMvc (API integration) |
| UI | N/A |
| Prior coverage | Dev-story delivered CRUD, validation golden, pipeline golden |
| This run | Closed code-review test gaps (AC 2, 3, 7, 8, 10–11, 14) |

---

## Coverage plan

| Priority | Test level | Target | Rationale |
|----------|------------|--------|-----------|
| P1 | API integration | `DrawFormulaValidationIntegrationTest` POST + PATCH | AC 10–11, 14 — REF-V01..V04b via both mutating paths |
| P1 | API integration | `DrawFormulaControllerIntegrationTest` auth/isolation | AC 2, 3, 7, 8 — 403, 404, entity unchanged on failed publish |
| P2 | Unit/golden | `DrawFormulaPipelineGoldenTest` | AC 13 — already green (no change) |

**Scope:** backend API only. Preview endpoint (AC 9) waivable — not tested. E2E/UI deferred to **19.19**.

---

## Files updated

| File | Change |
|------|--------|
| `services/api/src/test/kotlin/com/hatcast/api/availability/DrawFormulaValidationIntegrationTest.kt` | Split POST/PATCH parameterized tests; assert `expectedHttpStatus` from fixtures |
| `services/api/src/test/kotlin/com/hatcast/api/draw/DrawFormulaControllerIntegrationTest.kt` | +5 tests: non-admin all endpoints, system PATCH 403, invalid publish rollback, cross-troupe PATCH/DELETE 404 |

---

## Tests added (summary)

### DrawFormulaValidationIntegrationTest

- **POST REF-V01..V04b** — asserts exact HTTP status from `validation.json` (201 or 400)
- **PATCH REF-V01..V04b** — seed draft then PATCH; validates save/publish rules on update path

### DrawFormulaControllerIntegrationTest

- `non-admin receives 403 on all catalogue endpoints` — GET list/detail, POST, PATCH, DELETE (AC 2)
- `system formula cannot be patched` — AC 7
- `patch to published with invalid config returns 400 and leaves entity unchanged` — AC 8
- `cross-troupe patch and delete return 404` — AC 3

---

## Validation

```bash
cd services/api && ./gradlew -q test \
  --tests 'com.hatcast.api.availability.DrawFormulaValidationIntegrationTest' \
  --tests 'com.hatcast.api.draw.DrawFormulaControllerIntegrationTest'
```

**Result:** exit 0 (all targeted tests green)

---

## Assumptions & remaining risks

| Item | Status |
|------|--------|
| PATCH success returns 200 (POST success 201) — handled explicitly in PATCH assertions | Resolved |
| Code-review **code** gaps (ARCHIVED via PATCH bypasses 409, POST ARCHIVED, readOnly seed) | Out of scope for test expansion — tracked in story Review Findings |
| Preview endpoint | Waived per AC 9 / OQ-19-03 |

---

## Next recommended workflow

- **`bmad-code-review`** — re-run adversarial review; test gaps above should be closed
- **`bmad-testarch-trace`** — map REF-V/REF-F to AC matrix for Wave D gate
- **`bmad-dev-story`** — address remaining [Review][Patch] code findings if not yet fixed
