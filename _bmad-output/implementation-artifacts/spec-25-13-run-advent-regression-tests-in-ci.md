---
title: 'Run Advent regression tests in CI'
type: 'chore'
created: '2026-11-01'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
feature_branch: feat/25-13-run-advent-regression-tests-in-ci
baseline_commit: b604d84a6d9667016103d5614183272f7abe5d4e
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Existing Advent Angular and PostgreSQL tests do not have demonstrated CI execution. Conditional database tests and empty selections can appear successful without exercising the required behavior.

**Approach:** Make these existing suites run with inspectable evidence on relevant changes, while keeping seasonal test infrastructure identifiable and removable. Inventory existing browser checks and report their actual execution scope.

## Boundaries & Constraints

**Always:** Preserve existing API, build and Playwright coverage and release gates. Use fictional data and a disposable local PostgreSQL instance. Report candidate SHA, selections, counts, failures, skips and durations. Make missing configuration and zero executed required tests fail. Keep general HatCast coverage independent of Advent fixtures and clocks. Follow story 25.13 and PLAN.md.

**Never:** Modify production behavior or data; use shared development or production databases; disable tests; claim intercepted browser requests prove the real member API journey; weaken existing gates. New member end-to-end journeys and a controllable server clock are later plan steps. No UI change.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
| --- | --- | --- | --- |
| Relevant change | Angular Advent and shell tests selected | Required selected tests execute and reports identify counts and revision | Failure fails job |
| PostgreSQL CI | Three Advent PostgreSQL classes, disposable local database | Every class executes at least one test; reports show counts and skips | Missing database, selection or skipped required class fails job |
| Inventory | Playwright, isolation, motion and service-worker checks | Actual configured selection and limitations documented | Unverified execution recorded as unverified |

</frozen-after-approval>

## Code Map

- `.github/workflows/apps-web.yml`: currently installs dependencies and builds only; `apps/web/package.json` uses `ng test`; `apps/web/angular.json` defines Angular unit-test builder.
- `apps/web/src/app/pages/advent-test/advent-test.spec.ts`, `apps/web/src/app/layout/member-shell/member-shell.spec.ts`: existing UI and entry checks; include relevant files without reducing general coverage.
- `.github/workflows/api-test.yml`: runs Gradle test with H2 and no PostgreSQL environment. `AdventMemberPostgresTest`, `AdventRankingPostgresTest`, `AdventResultPostgresTest` require `ADVENT_TEST_POSTGRES_URL` on loopback and credentials. Assert execution per class from Gradle XML, not just exit status.
- `.github/workflows/e2e-smoke.yml`, `apps/web/playwright.config.ts`: existing browser project uses intercepted Advent API. Verify actual discovery with Playwright list, including `e2e/advent-isolation/advent-answer.spec.ts`.
- `apps/web/src/app/pages/advent-test/advent-test.motion.browser.cjs` and `apps/web/e2e/advent-isolation/advent-service-worker.smoke.cjs`: standalone checks; service-worker script requires isolated services and resets test state. Inspect prerequisites; do not run against shared state.
- `PLAN.md` and `_bmad-output/test-artifacts/cartographie-risques-avent-2026-11-01.md`: scope and prior evidence. Inspect active branch protection before claiming required status.

## Tasks & Acceptance

**Execution:**
- [x] `.github/workflows/apps-web.yml`, test tooling as needed — execute named Angular coverage with machine-readable results and fail on empty selection; preserve build.
- [x] `.github/workflows/api-test.yml`, verification tooling as needed — provide disposable PostgreSQL, execute existing suite and validate all three conditional classes actually run; publish reports even on failure.
- [x] Test the result-validation mechanism against passing, empty, skipped, absent and failing reports without mirroring its implementation.
- [x] Document test selection, triggers, counts, elapsed time, SHA, browser inventory and known gaps in a clearly identifiable Advent testing document; measure rather than guess. Preserve independent HatCast test coverage and make Advent-specific additions removable.
- [x] Inspect existing branch protection when accessible; state unknown if inaccessible, rather than declaring a required gate.

**Acceptance Criteria:**
- Given relevant changes to web, API or CI selection, when the configured checks run, then targeted Angular and PostgreSQL tests execute with evidence and failures stop their jobs.
- Given absent configuration, zero required tests, skipped required database classes or failed assertions, when results are checked, then the relevant job fails rather than reporting coverage.
- Given the temporary feature is eventually removed, when its inventory is consulted, then its tests, fixtures, commands and jobs can be identified without removing general HatCast protections.

## Implementation Notes

- Local verification: Angular under Node 20.20.2 passed 139 tests with no skips. PostgreSQL 16 disposable: seven required tests passed; full Gradle suite passed in 5m 33s. Report guard contract tests passed; Playwright lists 16 scenarios. CI execution and remote branch protection remain unverified.

## Spec Change Log

## Review Triage Log

- medium — A declared JUnit test count could disagree with the testcase elements; fixed by checking the declared count and testing both mismatch directions.
- medium — Context regeneration removed retention of answers and results; restored the original context and appended only the new story and CI facts.
- medium — Context regeneration removed explicit consent and private no-store requirements; restored the original context.
- medium — Context regeneration lost specific accessibility checks; restored the original context.
- medium — Context regeneration lost the accepted exceptional-content-change decision; restored the original context.
- medium — Context regeneration lost invitation timing and reminder-infrastructure constraints; restored the original context.
- medium — Validator tests did not distinguish partial skips from zero executed tests; added a mixed passing/skipped contract case.

## Verification

- Run the targeted Angular tests and PostgreSQL tests against disposable local services when available; inspect XML counts and timestamps.
- Verify report guard success and failure cases and run `git diff --check`; validate workflow syntax and actual Playwright selection when dependencies are available.
- Report any unavailable CI, service, branch-protection or timing evidence explicitly.
