---
title: 'Prepare and play validated quizzes'
type: 'feature'
created: '2026-10-30'
status: 'done'
baseline_commit: '264f4e60050e438a3c828d46cb7b3d5d8d9a3072'
route: 'dispatch'
review_loop_iteration: 2
context:
  - '_bmad-output/implementation-artifacts/epic-25-context.md'
  - '_bmad-output/planning-artifacts/architecture/architecture-hatcast-avent-2026-10-29/ARCHITECTURE-SPINE.md'
  - '_bmad-output/planning-artifacts/ux-designs/ux-hatcast-avent-2026-10-28/DESIGN.md'
  - '_bmad-output/planning-artifacts/ux-designs/ux-hatcast-avent-2026-10-28/EXPERIENCE.md'
  - 'docs/v2/technical/FRONTEND_UI.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The isolated preview serves fictional statements and answer keys from code, so organizers cannot prepare and play validated quizzes in the database.

**Approach:** Use a database-backed quiz for the existing authorized development journey and document preparation and quiz-only promotion between the distinct development and production databases. Preserve existing answer, reveal and test protections.

## Boundaries & Constraints

**Always:** Validated content is prepared with queries; no real contributions or answer keys in Git, logs, analytics, public assets or tests. Portraits remain private and are served only after authorization. For unchanged quiz content, presentation, scoring and reveal use the same ordered statements and false-answer designation. Protect future content and pending correctness, points and derived information; sensitive responses and errors are private and no-store. Retain active membership, verified tester allowlist, environment verification, Paris time, serialized confirmation and reveal, retries, replay, session fencing and scoped reset. Development content may be real or fictional. Production and development use separate databases; production denies simulation and reset. A transfer procedure identifies and verifies both targets and moves only selected quizzes and portrait references, never answers or test state. Verify existing destination and avoid exposing content.

**Never:** Deploy, mutate production or transfer real content in this story. Do not create an administration UI or adopt the old bucket JSON/snapshot implementation. Patrice does not change contributions during play and accepts inconsistency risk if an exceptional change occurs; no versioning, snapshot, stale-content check or edit lock is required for that risk. Do not implement later ranking, complete calendar, production entry or notifications. Preserve the unfinished catalogue worktree and its backup.

## I/O & Edge-Case Matrix

| Scenario | Input / state | Expected behavior |
|---|---|---|
| Available quiz | Eligible tester opens database quiz and answers | Return only allowed portrait and statements, score using its false-answer designation, then reveal the result after the next simulated Paris midnight. |
| Missing or invalid quiz | No valid quiz for selected day | Show or report absence safely; do not accept an answer or invent a key, and do not expose other content. |
| Optional reveal | Quiz has an additional explanation | Keep it server-side before reveal; return and display it only when the result is eligible. |
| Reset/replay | Authorized isolated development | Reset clears only test game state and clock, preserving database quizzes and unrelated data; replay remains personal and session fencing remains effective. |
| Unsafe environment | Production or isolation not demonstrable | Test controls are denied server-side without mutation. |
| Promotion | Selected validated quizzes in dev | Document a verifiable quiz-only procedure with source/destination identity, permissions, destination conflict handling and recovery; never move test answers. Do not run it against production. |

</frozen-after-approval>

## Code Map

- `services/api/src/main/kotlin/com/hatcast/api/advent/AdventTestController.kt` — protected `/v1/advent-test` content, fixture statements, private portrait access and strict environment and membership gates; preserve authorization on every request.
- `services/api/src/main/kotlin/com/hatcast/api/advent/AdventTestAnswers.kt` — hard-coded answer keys, scoring and shared-clock transaction lock; replace keys with the same database content, preserving confirmation, reveal, reset, replay and session semantics.
- `services/api/src/main/kotlin/com/hatcast/api/advent/AdventNoStoreFilter.kt` and `services/api/src/main/kotlin/com/hatcast/api/config/SecurityConfig.kt` — no-store and access boundaries; do not weaken.
- `services/api/src/main/resources/db/migration/V70__advent_test_answers.sql` through `V74__advent_test_result_seen.sql` — existing test state; add only required additive catalogue migration and compatible constraints. Keep content outside the reset deletion scope.
- `apps/web/src/app/pages/advent-test/advent-test.{ts,html,scss}` — existing reveal reads quiz separately and indexes statements from result; expose an optional explanation only after authorization and reveal, preserving accessibility and scoped Advent design.
- `services/api/src/test/kotlin/com/hatcast/api/advent/` and `apps/web/src/app/pages/advent-test/advent-test.spec.ts` — H2, HTTP/security, PostgreSQL concurrency and UI tests; PostgreSQL fixtures build tables explicitly and need updating for any new content table.
- `docs/v2/technical/AVENT_CATALOGUE.md`, `docs/v2/technical/DEPLOY_V2_CLOUD_RUN.md` — catalogue and environment operations; documented Neon development/primary names are not evidence of current identity or permission.
- `SPEC.md`, `DOMAIN.md`, `ARCH.md`, `DEVELOPMENT.md` — describe actual shipped behavior as appropriate; retain distinction between current preview and future production entry.

## Tasks & Acceptance

**Execution:**
- [x] `services/api/src/main/resources/db/migration/` and `services/api/src/main/kotlin/com/hatcast/api/advent/` — add the minimum quiz model and database-backed reads/scoring, including safe missing/invalid content and protected optional reveal.
- [x] `services/api/src/main/kotlin/com/hatcast/api/advent/AdventTestController.kt` — use permitted database content and private portrait references without exposing future content or direct public URLs.
- [x] `services/api/src/test/kotlin/com/hatcast/api/advent/` — exercise matrix with fictional fixtures, actual PostgreSQL migration/transactions where available, H2, security, no-store, midnight, replay and reset preservation.
- [x] `apps/web/src/app/pages/advent-test/` and tests — display optional explanation at reveal only, if present; preserve existing interaction, responsive accessibility and scoped visual identity. Verify M3 checklist and report waivers.
- [x] `docs/v2/technical/AVENT_CATALOGUE.md` — document safe query preparation and quiz-only promotion, target identification, verification and recovery without embedding real content or assuming access; no real execution.
- [x] `SPEC.md`, `DOMAIN.md`, `ARCH.md`, `DEVELOPMENT.md` — reconcile shipped behavior and limitations without representing a production member journey as delivered.

**Acceptance Criteria:**
- Given an authorized isolated test session and a valid database quiz, when the tester opens, answers and advances to reveal, then the normal journey, points and explanation reflect that unchanged quiz without premature disclosure.
- Given production or an unverified target, when a simulation or reset is attempted, then it is rejected without changing data.
- Given validated quizzes and test answers in development, when the documented transfer is prepared, then it selects quizzes only and excludes all test answers and state.
- Given the existing HatCast and Advent surfaces, when the affected journey is inspected, then accessibility, Material behavior and visual isolation remain intact.

- [x] `services/api/src/main/kotlin/com/hatcast/api/advent/` and `docs/v2/technical/AVENT_CATALOGUE.md` — safely handle existing fictional test answers before database content is used: retain them until an explicitly authorized isolated targeted reset, clearly document and enforce the transition without silent deletion or mismatched reveal; preserve content and session fencing.
- [x] `apps/web/src/app/pages/advent-test/` and tests — handle absent or unavailable quizzes with an accurate accessible state, including when availability changes during an answer or an old result lacks content; do not trap the tester in repeated priority reveal.
- [x] `docs/v2/technical/AVENT_CATALOGUE.md` and tests — make destination conflict handling executable and unambiguous, and verify the documented selected-quiz transaction, rollback and preservation of test answers; do not perform a real transfer.

- [x] `services/api/src/main/resources/db/migration/V75__advent_quizzes.sql` and Advent tests — fence pre-migration pending attempts and generations as well as recorded answers so an old fictional reservation cannot confirm a new quiz; preserve state until authorized reset and exercise the migration with pending-only state.
- [x] `apps/web/src/app/pages/advent-test/` and tests — retry an unavailable result against its actual day, including when content disappears between result and content reads.
- [x] `services/api/src/main/kotlin/com/hatcast/api/advent/AdventTestAnswers.kt` and tests — safely handle content disappearing between availability and key lookup without recording an answer or advancing the clock; surface unavailability and preserve atomicity.
- [x] `services/api/src/test/kotlin/com/hatcast/api/advent/AdventOfflineIntegrationTest.kt` — assert individual revealed-result route rejects the legacy transition before reset, with a preexisting answer and newly prepared quiz.

## Implementation Notes

Database content is empty until prepared; the existing development-only preview uses it for display and scoring. The promotion test uses two disposable PostgreSQL schemas and does not establish real target identity or permissions. No production transfer or deployment occurred.

## Spec Change Log

- Second review found pending fictional reservations surviving migration, an unavailable-result retry targeting the wrong day, a content-disappearance race and missing individual-result transition coverage. Amend tasks to fence the old session state and exercise these cases. KEEP: prior loop's safe explicit reset, unchanged quiz data, existing privacy, test mode future-case access, and verified transaction and UI behavior.

- Review identified legacy fictional answers that can be paired with new quiz content, unavailable states presented as reconnect errors, and an incomplete destination-conflict procedure. Amend tasks to require a safe explicit transition, usable missing-content states and verified promotion procedure. Avoid mismatched results and trapped previews. KEEP: database content and same-key scoring, isolated gates, next-midnight reveal, no-store, targeted reset preserving quizzes, no versioning, and existing H2/PostgreSQL/UI test coverage.

## Review Triage Log

- **False, carried:** Future cases are explicitly accessible in authorized development test mode under FR-13 and AD-2.
- **Medium — patch:** `unavailable` remains true when entering an eligible reveal or 25 December, masking the destination; the connected-heading guard prevents acknowledgment when the reveal is not displayed.
- **Low — rejected:** An initialized clock alone can survive migration; with no answers, attempts, generations or clock advances there is no old content to mismatch, and the shared simulated date is legitimate test state.
- **Medium — patch:** The private production portrait bucket previously documented is missing from the promotion procedure; retain its expected location while requiring independent verification.
- **Low — rejected:** The procedure compares all selected destination rows within the destination transaction before commit; this verifies the intended committed content absent subsequent edits, which are an accepted operational risk.
- **Medium — patch:** HTTP tests do not exercise reserve and confirm while transition is required; assert 423 and unchanged state for both.

- **False, carried:** Future test cases are explicitly accessible to authorized development testers under FR-13 and AD-2; production test routes remain denied.
- **High — bad spec:** Migration only checks existing answers; pending attempts can survive and confirm against a new quiz key. Fence all relevant legacy game state and verify pending-only migration.
- **Medium — bad spec:** When result content disappears before `showResult`, `selectedDay` remains old and retry targets another case; bind it to the result day.
- **Medium — bad spec:** Content can disappear between `stateAt` and key lookup; 404 is treated as uncertainty instead of unavailability. Ensure no clock change or answer is committed and expose the absent state.
- **False:** Concurrent content edits can yield mismatched content; Patrice explicitly accepted this exceptional-edit risk and rejected version fencing.
- **Medium — bad spec:** The individual result endpoint transition guard lacks a focused HTTP test with legacy answer and new content; add it.

- **False:** Future quiz reads in the explicitly authorized test mode are allowed by FR-13 and AD-2; production must remain inaccessible. This refutes both future-content findings and the corresponding proposed test.
- **High — bad spec:** Existing fictional answers can be matched with newly prepared content after migration, producing incorrect reveals; preserve data and require an explicit safe transition.
- **Medium — bad spec:** An old unseen answer with no matching quiz can repeatedly block the preview; handle the transition and missing content safely.
- **Medium — bad spec:** Missing quiz currently produces an unrelated reconnect instruction; expose an accurate absence state.
- **Medium — bad spec:** The client rejects the new `unavailable` state when content disappears between requests; handle it consistently.
- **Medium — bad spec:** The promotion procedure mentions replacement but provides only insertion; specify and test conflict, rollback and restoration without touching production.
- **Medium — bad spec:** The transfer test only mimics a copy and does not exercise the complete described conflict and recovery procedure.
- **Medium — bad spec:** Absence is tested at service level but not on HTTP and UI paths; cover both.
- **False:** The added HTTP integration test reads the database quiz, confirms it, checks the explanation absent before reveal and present after advancing the clock; the browser test separately checks display.
- **Medium — bad spec:** Reset test compares only quiz row count, not the retained fields; compare the full prepared quiz.

## Verification

Final rerun after review patches: Advent API suite with PostgreSQL 16 disposable passed; 39 Angular tests, production build and 3 Chromium tests passed. Existing Sass deprecation and CSS budget warnings remain. Screen-reader inspection was not exhaustive. No real transfer or deployment.

Second review loop: Advent API/H2 and three PostgreSQL 16 tests passed, including pending-only migration, individual-result denial, concurrency and transfer; 37 Angular tests, build and 3 Chromium checks passed. Disposable PostgreSQL was stopped. Sass and CSS budget warnings remain; screen-reader coverage is not exhaustive. No production operations performed.

Review loop: Advent H2 and PostgreSQL 16 tests passed, including migration transition, concurrency, reset preservation and quiz-only conflict/rollback; 37 Angular tests, build and 3 Chromium checks passed. PostgreSQL was disposable; real destination identities and permissions remain unverified. Existing Sass and CSS budget warnings remain; screen-reader testing was not exhaustive.

Passed: Advent H2 API/security tests; disposable PostgreSQL 16 migration, concurrency and quiz-only transfer tests; 32 Angular tests; frontend build; three Chromium browser checks. Existing Sass and CSS budget warnings remain. Screen-reader inspection was not exhaustive; real database permissions and isolation were not verified.

Run focused Advent API and security tests on H2 and disposable PostgreSQL, including migrations, actual transaction concurrency, reveal and reset; run relevant Angular tests and build, and browser/accessibility checks if the UI changes. Verify no real content appears in repository or logs. Report tests not run and any existing warnings. Do not imply deployment.
