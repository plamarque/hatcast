---
title: 'Discover and recover the quiz result'
type: 'feature'
created: '2026-10-30'
status: 'done'
baseline_commit: '1133e77d5ebd85ed56c1045aaaa5f86920b2a8b9'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '_bmad-output/planning-artifacts/architecture/architecture-hatcast-avent-2026-10-29/ARCHITECTURE-SPINE.md'
  - '_bmad-output/planning-artifacts/ux-designs/ux-hatcast-avent-2026-10-28/DESIGN.md'
  - '_bmad-output/planning-artifacts/ux-designs/ux-hatcast-avent-2026-10-28/EXPERIENCE.md'
  - 'docs/v2/technical/FRONTEND_UI.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** A member can save an Advent answer but cannot discover its result or recover an unseen reveal after an interruption or on another device.

**Approach:** Reveal the saved result at the authorized time and prioritize the most recent revealable unseen answer on return. Persist acknowledgment only after the reveal is displayed.

## Boundaries & Constraints

**Always:** Enforce server-side eligibility, isolation, session fencing, Paris time, no-store and secrecy across accounts, errors and caches. Serialize result reads with confirmations using the singleton clock lock, sample authoritative time after locking and read committed answers before release. Show correctness, the false statement, the selected statement when different, and the points earned that day (response, participation and any streak bonus), plus any optional anecdote. Score 10/0 plus 1 participation and 2 per non-overlapping three consecutive correct answers; missed days do not break a streak. Use the scoped Advent visual contracts and accessible Material 3 behavior; preserve HatCast styling. In isolated test mode, provide visible authorized controls to move the shared simulated clock one Paris day forward or backward, including 25 December, without deleting answers; each change simulates a new entry at that date and the targeted reset restarts the game. Treat a demonstration as partial and isolated.

**Never:** Reveal pending correctness, points or derived clues, change production data or weaken protections. Do not build the ranking, complete calendar, production entry or notifications from later stories. Do not promise exactly-once display or calendar access that is not yet implemented.

## I/O & Edge-Case Matrix

| Scenario | Input / state | Expected behavior |
|---|---|---|
| Test clock | An answer is saved and the tester advances to the next day, including 24 to 25 December | The shared simulated clock advances without another answer; the previously pending result becomes revealable. All testers share the new time; rejected or stale-session operations do not advance it. |
| Moving backward | An authorized tester moves to the previous Paris day | Retain answers and seen state; simulate a new entry at that date and prioritize its latest eligible unseen reveal, otherwise offer that day’s quiz. |
| Before and after reveal | Saved answer around next Paris midnight | Before: no result or revealing derivative in API/UI; after: faithful result and points. A transaction holding the lock may delay availability. |
| Return | Several answers, including a newer pending one | Show the most recent revealable unseen result first; no calendar action on this priority screen. Then offer today's quiz, missing-content state or 25 December path as applicable. Older unseen results remain available through their cases when the calendar exists, without automatic chaining or special markers. |
| Seen state | Screen displayed and client acknowledges | Persist per member and answer across devices; acknowledgment is idempotent. Delivery alone does not mark seen; lost acknowledgment or concurrent devices may repeat the reveal. |
| Celebration | First correct reveal, reduced motion or revisit | Celebrate only the initial correct reveal; reduced motion provides an equivalent immediate result. Revisit does not replay celebration. |
| Uncertain submission | Confirmation fails or is uncertain | Reconcile saved state before offering retry; after closure explain that the quiz is closed. Preserve existing replay and reset session boundaries. |
| Concurrent reset, confirmation or failure | Overlapping operations and transaction rollback | Keep snapshot and seen state consistent with the serialized session; reject stale session work and leave committed state intact on rollback. |

</frozen-after-approval>

## Code Map

- `services/api/src/main/kotlin/com/hatcast/api/advent/AdventTestAnswers.kt` — answer persistence, shared clock lock, scoring, session fencing and replay; reuse transaction ordering and protect all result reads.
- `services/api/src/main/kotlin/com/hatcast/api/advent/AdventTestController.kt` and `AdventNoStoreFilter` — existing authorization, session header, transaction and no-store boundary; preserve all checks.
- `services/api/src/main/resources/db/migration/V70__advent_test_answers.sql` and subsequent Advent migrations — existing answer and session schema; add only the necessary durable seen state and ensure reset/replay semantics.
- `services/api/src/test/kotlin/com/hatcast/api/advent/` — extend persistence, HTTP authorization, Paris time, rollback and real PostgreSQL concurrency tests.
- `apps/web/src/app/pages/advent-test/advent-test.{ts,html,scss}` — existing isolated route, neutral acknowledgment, reconciliation, replay, session and focus handling; add reveal and continuation while preserving them.
- `apps/web/src/app/shared/advent/_foundation.scss`, `apps/web/src/app/pages/advent-test/advent-test.spec.ts`, `apps/web/e2e/advent-answer.spec.ts` and `apps/web/e2e/advent-isolation/` — scoped visual foundation and client/browser coverage.
- `SPEC.md`, `DOMAIN.md`, `ARCH.md`, `DEVELOPMENT.md` — update applicable behavior and partial isolated preview documentation without exposing sensitive content.

## Tasks & Acceptance

**Execution:**
- [x] `services/api/src/main/kotlin/com/hatcast/api/advent/` and migrations — implement authorized, serialized reveal, durable idempotent acknowledgment and isolated one-day forward/backward clock controls, with safe reset and replay semantics.
- [x] `services/api/src/test/kotlin/com/hatcast/api/advent/` — test the matrix, cross-account secrecy, scoring, time boundaries, rollback and concurrent transactions on PostgreSQL and H2.
- [x] `apps/web/src/app/pages/advent-test/` — implement priority reveal, displayed-screen acknowledgment, accessible celebration and continuation, and expose the isolated next-day test control using Advent styles.
- [x] `apps/web/src/app/pages/advent-test/advent-test.spec.ts`, `apps/web/e2e/` — verify client states, acknowledgment timing, recovery, responsive layout, keyboard, announcements, reduced motion and visual isolation.
- [x] `SPEC.md`, `DOMAIN.md`, `ARCH.md`, `DEVELOPMENT.md` — document shipped behavior and limitations as appropriate.

**Acceptance Criteria:**
- Given a saved answer in an authorized isolated test session, when the tester advances the shared clock to the following Paris day without answering another quiz, then the result becomes available, including the 24 December answer on 25 December. Clock changes respect authorization and session fencing, preserve answers and re-enter at the simulated date.
- Given a saved answer, when the next Paris day begins and serialized reading completes, then its owner can see the faithful result and points; before then no result is accessible.
- Given an unseen revealable answer and a newer pending answer, when the member returns on any device, then the most recent eligible unseen reveal takes priority until displayed and acknowledged.
- Given a revealed answer, when acknowledgment is lost or repeated, then no result is lost and repeated acknowledgments are harmless.
- Given a correct initial reveal, when the member views it with or without reduced motion or revisits it, then the result is equally usable and celebration occurs only initially where motion is allowed.
- Given a narrow screen, keyboard or assistive technology, when the member navigates the reveal and error states, then text is not truncated, focus and announcements are meaningful, and actions remain usable.

## Implementation Notes

The isolated preview provides shared one-day forward/backward controls, re-enters at the selected date, and refreshes the clock on continuation. Result acknowledgments bind to answer identity. H2 integration, HTTP security, PostgreSQL locking on a disposable schema, Angular unit tests, responsive browser checks and a real offline two-account 24-to-25 journey passed. A local service-worker smoke verified no cached Advent responses across account change and offline access; the test proxy adapts its test origin to the allowed offline origin. The Angular build passes with an Advent CSS budget warning.

## Spec Change Log

- Patrice revised the accepted test-clock behavior: each arrow moves the shared simulated date by one day without erasing answers and simulates opening the experience on that date. The reveal displays only that day’s earned points, including participation and any bonus. The result styling and compact test bar were approved during human testing.

- Review corrections applied in place at the user’s request: preserve replay from reveals, refresh the displayed day after clock advancement, delay acknowledgment until visible, revalidate session before display, bound the result request and test historical answers without identifiers.

## Review Triage Log

- **Medium — bad spec:** Revisiting a revealed answer does not initialize the replay token or quiz, so personal replay is unavailable.
- **Medium — bad spec:** Advancing without an unseen result keeps the old preview, including on 25 December.
- **Maybe-false — verify:** A reset between result and content reads can display a stale result; reproduce the interleaving and establish session fencing before display.
- **Medium — bad spec:** The acknowledgment checks connected DOM and animation frames but not document visibility, allowing a background tab to mark a result seen.
- **Low — accepted:** A lost acknowledgment is explicitly allowed to repeat the reveal; the current interface does not signal non-409 failures.
- **Maybe-false — verify:** Advancing while a reveal is displayed may overlap its acknowledgment and the next result; reproduce the ordering.
- **Medium — patch:** PRD wording says recording happens within the day, although a transaction holding the lock can commit after midnight.
- **Low — accepted:** Total is the currently revealed total; the current label does not explain the time basis when revisiting an earlier case.
- **Medium — bad spec:** No test exercises personal replay from a revealed result.
- **Medium — bad spec:** No test exercises advancing without an answer into Christmas and its continuation.
- **Maybe-false — verify:** Reset between result and content reads and an acknowledgment failure after continuing need explicit interleaving tests.
- **Medium — bad spec:** The direct result fetch lacks the timeout used by requestJson, so a stalled request can lock the screen.
- **Medium — bad spec:** A recorded quiz can leave its replay control visible while its result is displayed; replay may delete the answer behind the visible result.
- **Medium — bad spec:** The no-result branch of clock advance retains an old preview on Christmas.
- **Medium — patch:** Add a migration compatibility test for an existing answer whose answer_id is null and confirm stable acknowledgment.

## Verification

Closure checks: 32 targeted Angular tests, nine mocked browser scenarios, H2 Advent result/security/concurrency tests, and a PostgreSQL locking and clock test passed; the production build passed with an existing Advent stylesheet budget warning. Patrice accepted the compact result display after testing. Real two-account offline coverage and service-worker checks were performed earlier; physical multi-device validation and full PostgreSQL migrations were not separately verified.


After review corrections: 28 targeted Angular tests, H2 result integration tests, nine responsive/isolation browser scenarios, production build, the real two-account offline 24-to-25 journey, and the active service-worker cache/account smoke passed. The PostgreSQL locking test passed before the frontend-only correction. Full migrations on PostgreSQL and a physical second device were not separately verified.


Run targeted Advent API integration and security tests on H2 and isolated PostgreSQL, including actual concurrent transactions and rollback. Run relevant Angular unit tests, build and browser tests for narrow viewports, keyboard, reduced motion, visual isolation and cross-account/cache secrecy. Exercise the real test interface and API by answering, advancing a day, and viewing the reveal, including 24 to 25 December; verify shared time and reset. Separately verify simulated time and actual Paris boundary behavior. Report any unverified checks; no production deployment is implied.
