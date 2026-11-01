---
title: 'Restart an isolated test session'
type: 'feature'
created: '2026-10-30'
status: 'done'
baseline_commit: '6b4592797d675cb8126142f500d1b0e1238dd7b6'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '_bmad-output/planning-artifacts/architecture/architecture-hatcast-avent-2026-10-29/ARCHITECTURE-SPINE.md'
  - '_bmad-output/planning-artifacts/hatcast-avent/epics.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Organizers cannot safely restart the isolated Advent test game and its shared simulated clock to repeat a full session.

**Approach:** Provide a documented, targeted server-controlled reset for the isolated test session, followed by verification and replay using fresh state.

## Boundaries & Constraints

**Always:** Fail closed unless isolation is verified server-side; production and ambiguous configurations reject reset and clock control. Reset only the intended isolated Advent test session, atomically clearing its answers, scoring, journey and operational state and resetting its clock. Preserve fictional content and unrelated data. Serialize against in-flight mutations and prevent stale pre-reset operations from repopulating the new session. Keep existing membership, allowlist, CSRF, no-store, privacy and forward-only clock protections. Document operator prerequisites, target, effects and verification. Verify actual date behavior separately from simulated time.

**Never:** Touch production or unrelated data, send notifications or analytics, expose hidden answers or scores, implement 25.3 results, or add a general administration interface. Do not confuse the existing personal replay or navigation-to-day-one with the session reset.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected outcome |
|---|---|---|
| Isolated session | Answers, series, attempts and advanced clock exist | One reset clears only session state and allows an earlier clock; content and unrelated data survive |
| Unsafe target | Production, incorrect configuration or unverified isolation | Server rejects without mutation |
| Concurrent or delayed operation | Confirmation, replay, reservation or reconciliation overlaps reset | Atomic ordering; requests from the old session cannot write into the new session |
| Failure | Reset transaction fails partway | All prior session state remains intact |
| New play | Reset then answer again | Scores and streak derive only from new answers |

</frozen-after-approval>

## Code Map

- `services/api/src/main/kotlin/com/hatcast/api/advent/AdventTestController.kt` — existing test eligibility and isolation checks; reuse without weakening. Select a narrowly authorized operator procedure and preserve CSRF and no-store as applicable.
- `services/api/src/main/kotlin/com/hatcast/api/advent/AdventTestAnswers.kt` — shared clock row lock serializes test mutations; extend transactional session fencing and reset. Existing personal replay must keep its separate semantics.
- `services/api/src/main/resources/db/migration/V70__advent_test_answers.sql` through `V72` — test state tables; check actual dependencies and add an additive migration only if necessary for a durable session fence. Do not run migrations against production.
- `services/api/src/test/kotlin/com/hatcast/api/advent/` — integration and authorization tests, including actual concurrent transactions and offline isolation.
- `apps/web/src/app/pages/advent-test/` — preserve individual replay and existing visual identity; adjust client protocol only if session fencing requires it. If UI changes, apply `docs/v2/technical/FRONTEND_UI.md` and Advent DESIGN, EXPERIENCE and AD-7 contracts.
- `DEVELOPMENT.md`, `SPEC.md`, `DOMAIN.md`, `ARCH.md` — document the targeted procedure and shipped behavior, scope and safeguards without recording secrets.

## Tasks & Acceptance

**Execution:**
- [x] `services/api/src/main/kotlin/com/hatcast/api/advent/` and migrations as needed — implement fail-closed scoped reset and durable session boundary with transactional locking.
- [x] `services/api/src/test/kotlin/com/hatcast/api/advent/` — exercise matrix, access control, rollback, ordering and old-client races; verify unrelated records and content are untouched.
- [x] `apps/web/src/app/pages/advent-test/` and tests if needed — support the session boundary without changing personal replay behavior or leaking state.
- [x] `DEVELOPMENT.md`, `SPEC.md`, `DOMAIN.md`, `ARCH.md` — document prerequisites, exact target, effects, verification and relevant behavior.

**Acceptance Criteria:**
- Given an authorized isolated development session with recorded play, when the documented reset succeeds, then its test state and simulated clock restart while unrelated data and fixtures remain unchanged.
- Given production or an environment whose isolation cannot be verified, when reset is attempted, then the server rejects it without changing data or external services.
- Given operations around the reset boundary, when they complete in any order, then old-session work cannot mutate the new session and a failed reset leaves the prior state intact.
- Given a newly restarted session, when members answer again, then scores and streaks use only new answers, while individual replay retains its existing scope.

## Implementation Notes

Patrice validated the documented API reset workflow on 2026-10-30 after a real offline browser/API smoke. The reset returned HTTP 200 and the stale client reloaded and replayed the case. Browser tests with mocked API passed at six viewport widths.

The reset serializes on the shared clock row and rotates a session identifier. Clients send it with each answer operation; stale requests fail. The documented operator route retains existing isolation and membership checks. The 21 persistence and concurrency tests passed on isolated PostgreSQL 16.8 as well as the Advent suite on H2.

## Spec Change Log

## Review Triage Log

- **Medium — fixed:** A stale session left the player in an unrecoverable uncertain state; a 409 now offers an accessible preview reload.
- **Medium — fixed:** Fresh play after reset was tested only through the service; the offline HTTP test now exercises the new session.
- **Medium — fixed:** Rollback did not assert every auxiliary table; the reset integration test now checks all six tables and clock state.
- **Medium — fixed:** Reset-first ordering was not covered; the integration test now checks a stale operation after reset.
- **Medium — addressed:** Delayed HTTP operations were only checked sequentially; all four endpoints reject stale session headers and the shared lock ordering is exercised on H2 and PostgreSQL.
- **Medium — fixed:** Non-operator rejection was not exercised end-to-end; the offline test verifies rejection and unchanged state.
- **Medium — addressed:** Preservation of unrelated data was insufficiently demonstrated; the test checks users and other members while fictional content remains accessible.
- **Medium — fixed:** Clock observed time and advances were not asserted; reset and rollback tests now check them.
- **Medium — resolved:** PostgreSQL concurrency was unverified; 21 persistence tests passed against isolated PostgreSQL 16.8.
- **Medium — fixed:** Client mutation session headers were not asserted; tests now check reconciliation, reservation, confirmation and replay.
- **Medium — fixed:** Auxiliary state deletion lacked assertions; populated rows in all affected tables are checked before and after reset.
- **Medium — fixed:** Existing browser mocks lacked the session endpoint; fixtures and browser recovery checks were updated.

## Verification

Run targeted Advent API tests, including concurrency, security and rollback. Run relevant Angular tests and build if the client protocol changes. Verify H2 and, where available, PostgreSQL locking; report any unverified environment. No production reset, deployment or human smoke is implied.
