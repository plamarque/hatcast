---
stepsCompleted:
  - step-01-load-context
  - step-02-discover-tests
  - step-03f-aggregate-scores
  - step-04-generate-report
lastStep: step-04-generate-report
lastSaved: '2026-06-19'
workflowType: testarch-test-review
inputDocuments:
  - _bmad-output/implementation-artifacts/19-18-api-politiques-tirage-troupe-saison.md
  - _bmad-output/test-artifacts/19-18-policy-api-test-design.md
  - project-context.md
storyRef: 19-18-api-politiques-tirage-troupe-saison
---

# Test Quality Review: Story 19.18 — Draw Policy API & Runtime

**Quality Score**: 84/100 (B — Good)
**Review Date**: 2026-06-19
**Review Scope**: Story-scoped suite (6 test classes + 2 golden JSON fixtures)
**Reviewer**: Patrice / TEA Agent

---

Note: This review audits existing tests; it does not generate tests.
Coverage mapping and coverage gates are out of scope here. Use `trace` for coverage decisions.

## Executive Summary

**Overall Assessment**: Good

**Recommendation**: Approve with Comments

### Key Strengths

✅ **Golden JSON + parameterized runners** — `PolicyGoldenTestSupport`, `validation.json`, and `resolution.json` give stable, spec-aligned REF-V/R coverage with minimal duplication.
✅ **Appropriate test levels** — unit (`DrawPolicyValidatorTest`), service golden (`DrawPolicyResolutionGoldenTest`), HTTP integration (`DrawPolicyControllerIntegrationTest`, `DrawPolicyValidationIntegrationTest`), runtime fallbacks (`DrawPolicyRuntimeIntegrationTest`).
✅ **Isolation via unique slugs** — `UUID.randomUUID()` on troupe/season/event slugs reduces cross-test collision in shared Spring context.
✅ **Traceability tags** — `@Tag("19.18")`, `@Tag("REF-V")`, `@Tag("REF-R")` on primary suites; fixture IDs mirror test-design catalogue.
✅ **CI gate alignment** — story documents targeted Gradle filters; full `./gradlew test` reported green.

### Key Weaknesses

❌ **REF-R12 under-asserted** — fixture expects `disposPercentMatchesDrawWeights` but test only checks non-empty pipeline (AC 13 / OQ-19-04 gap).
❌ **No HTTP draw-path integration** — `POST …/composition/draw` + `formulaId` policy enforcement (AC 9–11, REF-V13 via `compositionDraw`) tested at service layer only.
❌ **AC 6 partial** — season organizer forbidden on season policy admin endpoints not covered (only member + effective GET 403).
❌ **Parameterized test smell** — early `return` in `DrawPolicyValidationIntegrationTest` skips non-`policySave` fixtures instead of filtering at source.
❌ **Setup duplication** — `adminCookie` / `ensureMembership` duplicated across controller and validation integration tests.

### Summary

Story 19.18 delivers a solid backend test suite aligned with Wave D golden-fixture conventions. REF-V05–V12 (policy save), REF-R01–R11 (resolution), REF-V13–V15 (runtime fallbacks), and controller auth/upsert paths are well covered. The main quality gap is **REF-R12 / AC 13**: cross-endpoint pipeline parity (draw vs availability summary vs explainability) is declared in fixtures but not asserted. Secondary gaps are HTTP-level draw enforcement and season-organizer auth on admin policy routes. None of these indicate flakiness or structural test debt severe enough to block merge; address in follow-up or before 19.21 E2E handoff.

---

## Quality Dimension Scores

| Dimension | Score | Grade | Weight |
|-----------|-------|-------|--------|
| Determinism | 88 | B+ | 30% |
| Isolation | 83 | B | 30% |
| Maintainability | 82 | B | 25% |
| Performance | 90 | A | 15% |
| **Weighted overall** | **84** | **B** | — |

---

## Quality Criteria Assessment

| Criterion | Status | Violations | Notes |
|-----------|--------|------------|-------|
| BDD Format (Given-When-Then) | ⚠️ WARN | 0 | Kotlin descriptive names; golden JSON encodes G/W/T implicitly |
| Test IDs | ⚠️ WARN | 2 | REF-V/R tags present; no P0–P3 priority markers |
| Priority Markers | ⚠️ WARN | 6 | Classes lack P1/P2 classification from test-design |
| Hard Waits | ✅ PASS | 0 | No sleep/waitForTimeout |
| Determinism | ✅ PASS | 1 | Conditional branches in golden assertions (acceptable for data-driven) |
| Isolation | ⚠️ WARN | 2 | Validation integration lacks `@Transactional`; shared troupe in `@BeforeEach` |
| Fixture Patterns | ✅ PASS | 0 | `PolicyGoldenTestSupport` is strong shared fixture |
| Data Factories | ✅ PASS | 0 | JSON fixtures + scenario builder |
| Network-First | N/A | — | MockMvc backend; not applicable |
| Explicit Assertions | ⚠️ WARN | 1 | REF-R12 weak assertion |
| Test Length (≤300 lines) | ⚠️ WARN | 1 | `DrawPolicyControllerIntegrationTest` = 317 lines |
| Test Duration | ✅ PASS | 0 | No heavy loops; SpringBootTest acceptable for project |
| Flakiness Patterns | ✅ PASS | 0 | No tight timeouts or retries |

**Total Violations**: 0 Critical, 3 High, 4 Medium, 2 Low

---

## Critical Issues (Must Fix)

No critical (P0) issues detected. ✅

No hard waits, race-prone browser patterns, or missing assertions on happy paths.

---

## Recommendations (Should Fix)

### 1. Strengthen REF-R12 cross-endpoint parity assertion

**Severity**: P1 (High)
**Location**: `DrawPolicyResolutionGoldenTest.kt:94-101`
**Criterion**: Explicit Assertions
**Story AC**: AC 13, REF-R12, OQ-19-04

**Issue Description**:
Fixture `REF-R12` sets `disposPercentMatchesDrawWeights: true` and `explainabilityUsesSamePipeline: true`, but the test only asserts `resolved.pipeline.factors.isNotEmpty()` and optional formula id match. This does not verify that draw weights, availability summary `%`, and explainability share the same resolved pipeline — the core Demo 2 invariant.

**Current Code**:

```kotlin
if (expected.path("disposPercentMatchesDrawWeights").asBoolean(false) ||
    expected.path("explainabilityUsesSamePipeline").asBoolean(false)
) {
    assertFalse(resolved.pipeline.factors.isEmpty())
    requestedId?.let {
        assertEquals(it, resolved.effectiveFormulaId, "Selected formula must drive pipeline")
    }
}
```

**Recommended Improvement**:

```kotlin
// After resolveForEvent, call the same services used in production:
// 1. scoreCandidates / draw step weights via CompositionDrawService or calculator helper
// 2. AvailabilityService.getSummary(..., includeChances=true, formulaId=...)
// 3. Explainability path with same formulaId
// Assert percentage maps match within tolerance (pattern from DrawOrchestrationGoldenTest / REF-O7)
```

**Priority**: Before 19.21 E2E; run via `trace` to confirm AC 13 mapping.

---

### 2. Add HTTP integration for composition draw + formulaId policy

**Severity**: P1 (High)
**Location**: Missing — suggest new methods in `DrawPolicyRuntimeIntegrationTest` or dedicated class
**Criterion**: Test Levels Framework
**Story AC**: AC 9–11; `validation.json` `compositionDraw` (REF-V13)

**Issue Description**:
`validation.json` defines `function: "compositionDraw"` for REF-V13, but no runner loads it over HTTP. REF-V13 is covered at `DrawPolicyResolutionService` level only. HTTP status codes and French error bodies are part of the PO lock documented in OpenAPI.

**Recommended Improvement**:
Add MockMvc `POST /v1/seasons/{seasonId}/events/{eventId}/composition/draw` scenarios:
- CHOICE ≥2 without `formulaId` → 400
- `formulaId` ∉ allowed → 403
- MANDATORY with mismatched client `formulaId` → 400

Reuse `PolicyGoldenTestSupport.buildScenario()` for setup.

---

### 3. Cover season organizer forbidden on season policy admin endpoints

**Severity**: P1 (High)
**Location**: `DrawPolicyControllerIntegrationTest.kt`
**Criterion**: Test Levels Framework
**Story AC**: AC 6 (OQ-19-05)

**Issue Description**:
Tests verify member 403 on troupe policy and effective GET, but not season organizer 403 on `GET/PUT /v1/seasons/{seasonId}/draw-policy`. Story explicitly locks this to `TROUPE_ADMIN` only.

**Recommended Improvement**:
Add test with `canManageComposition` / season organizer role (not troupe admin) → 403 on season policy GET and PUT.

---

### 4. Filter parameterized fixtures at MethodSource

**Severity**: P2 (Medium)
**Location**: `DrawPolicyValidationIntegrationTest.kt:112-114`

**Issue Description**:
Early `return` when `function != "policySave"` creates no-op parameterized invocations if fixture list expands. Prefer filtering in `fixtures()` or separate `@MethodSource` per function type.

**Recommended Improvement**:

```kotlin
fun fixtures(): List<String> =
    PolicyGoldenTestSupport.loadPolicyValidationFixtures()
        .filter { it.path("function").asText() == "policySave" }
        .map { it.path("id").asText() }
```

---

### 5. Extract shared auth test helpers

**Severity**: P2 (Medium)
**Location**: `DrawPolicyValidationIntegrationTest.kt`, `DrawPolicyControllerIntegrationTest.kt`

**Issue Description**:
Duplicated `adminCookie`, `memberCookie`, `ensureMembership` (~60 lines × 2). Increases drift risk when auth patterns change.

**Recommended Improvement**:
Move to `PolicyGoldenTestSupport` or existing `TestAuthSupport` extension with troupe membership helpers.

---

### 6. Add `@Transactional` to validation integration class or per test

**Severity**: P2 (Medium)
**Location**: `DrawPolicyValidationIntegrationTest.kt`

**Issue Description**:
Eight parameterized tests share one troupe from `@BeforeEach` without transaction rollback. Currently safe (all expect 400), but a future passing case could leak policy rows.

---

### 7. Align `@Tag("19.18")` on all story tests

**Severity**: P3 (Low)
**Location**: `DrawPolicyControllerIntegrationTest.kt`, `DrawPolicyValidatorTest.kt`

**Issue Description**:
Inconsistent tagging breaks selective CI filters documented in story § Testing requirements.

---

## Best Practices Found

### 1. PolicyGoldenTestSupport scenario builder

**Location**: `PolicyGoldenTestSupport.kt`
**Pattern**: JSON-driven scenario factory with auto formula/glossary seeding

**Why This Is Good**:
Single component translates golden `setup` nodes into persisted troupe/season/event/policy graph — reduces fixture drift and mirrors 19.17/19.19b patterns.

### 2. REF-ID parameterized golden tests

**Location**: `DrawPolicyResolutionGoldenTest.kt`, `DrawPolicyValidationIntegrationTest.kt`

**Why This Is Good**:
Each REF-R/V scenario is independently runnable by name; failures map directly to spec catalogue and test-design IDs.

### 3. Dedicated runtime fallback tests

**Location**: `DrawPolicyRuntimeIntegrationTest.kt`

**Why This Is Good**:
REF-V14/V15/V13 isolated in focused tests with explicit French-method names — easy to diagnose draw-time vs save-time validation.

---

## Test File Analysis

| File | Lines | Tests | Framework | Tags |
|------|-------|-------|-----------|------|
| `DrawPolicyValidationIntegrationTest.kt` | 276 | 8 param | JUnit 5 + MockMvc | 19.18, REF-V |
| `DrawPolicyResolutionGoldenTest.kt` | 163 | 12 param | JUnit 5 + SpringBootTest | 19.18, REF-R |
| `DrawPolicyControllerIntegrationTest.kt` | 317 | 5 | JUnit 5 + MockMvc | — |
| `DrawPolicyRuntimeIntegrationTest.kt` | 224 | 3 | JUnit 5 + SpringBootTest | 19.18, REF-V |
| `DrawPolicyValidatorTest.kt` | 226 | 9 | JUnit 5 unit | — |
| `DrawPolicyResolutionServiceTest.kt` | ~143 | 4+ | JUnit 5 unit | — |
| `PolicyGoldenTestSupport.kt` | 323 | — | Spring `@Component` | — |

**Fixtures**: `validation.json` (REF-V05–V15 + others), `resolution.json` (REF-R01–R12)

**Execution verified**: `./gradlew test --tests 'com.hatcast.api.composition.DrawPolicy*' --tests 'com.hatcast.api.draw.DrawPolicy*'` — green.

---

## Context and Integration

- **Story**: [19-18-api-politiques-tirage-troupe-saison.md](../../implementation-artifacts/19-18-api-politiques-tirage-troupe-saison.md) — Status: done
- **Test Design**: [19-18-policy-api-test-design.md](../19-18-policy-api-test-design.md)
- **Risk threshold (TEA config)**: P1
- **Deferred to trace**: AC coverage matrix REF-R12 HTTP parity, season organizer AC 6

---

## Next Steps

### Immediate Actions (Before 19.21)

1. **Implement REF-R12 parity assertion** — P1 — ~4h — compare draw / summary / explainability weights
2. **HTTP draw policy tests** — P1 — ~3h — MockMvc POST draw with formulaId matrix
3. **Season organizer 403** — P1 — ~1h — controller integration

### Follow-up Actions

1. **Refactor auth helpers** — P2 — next API test cleanup slice
2. **MethodSource filter** — P2 — quick win in validation test
3. **Tag alignment** — P3 — when touching files

### Re-Review Needed?

⚠️ Re-review after REF-R12 and HTTP draw tests — recommended before 19.21 E2E handoff, not blocking 19.18 merge.

---

## Decision

**Recommendation**: Approve with Comments

**Rationale**:
Test quality is good (84/100) with strong golden-fixture architecture and broad REF-V/R coverage at appropriate levels. Gaps are **assertion depth** (REF-R12) and **HTTP boundary** (draw POST, season organizer auth), not structural flakiness. Story status is done with full suite green; address P1 items in follow-up PR or as 19.21 prep per test-design handoff.

---

## Review Metadata

**Generated By**: BMad TEA Agent (Test Architect)
**Workflow**: testarch-test-review
**Review ID**: test-review-19-18-20260619
**Timestamp**: 2026-06-19
