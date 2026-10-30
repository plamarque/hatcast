---
title: 'Answer the quiz after opening a door'
type: 'feature'
created: '2026-10-30'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
feature_branch: 'feat/25-2-answer-the-quiz-after-opening-a-door'
baseline_commit: '5c41e4fa06dcfa7d25cbe10e8bc1f14a4303b82f'
context:
  - 'docs/v2/technical/FRONTEND_UI.md'
  - '_bmad-output/planning-artifacts/hatcast-avent/epics.md'
  - '_bmad-output/implementation-artifacts/epic-25-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** A tester can open a fictional Advent quiz but cannot answer it, preventing the next steps of the experience.

**Approach:** Allow an eligible member to select and explicitly confirm one statement, record an immutable answer and its stable scoring data, and acknowledge it without revealing the result before the next Paris midnight.

## Boundaries & Constraints

**Always:** Enforce active configured-troupe membership, verified tester allowlist and isolated environment on each test read and mutation, including platform admins. Keep sensitive responses and errors private and no-store. Enforce uniqueness in the database, serialize state and score updates, and use one authoritative server clock. Close confirmations still waiting for the lock at Paris midnight, including requests received earlier. Reveal waits for an already-running transaction to finish. The shared test clock only advances and future-case confirmation advances it to that day; a targeted reset is reserved for 25.2a. Real Paris date boundaries are tested separately. Save stable result data for later reveal; provide only a neutral acknowledgement before reveal, including on retries and errors. Respect Material 3, keyboard, focus, screen readers, enlarged text and responsive layout.

**Never:** Expose answers, correctness, score, derived clues or real future content through the API, client, logs, assets or cache before reveal. Allow catch-up answers, change a confirmed answer, enable production test mode, send Advent notifications or analytics, expose a ranking action before 25.4, or implement the reset, result screen, calendar or general navigation entry belonging to later stories. Do not modify production data or deploy. Test fixtures remain fictional; consented portraits remain protected by existing authorization.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Selection | Three statements, no confirmed answer | Single choice can change until explicit confirmation | No selection cannot be submitted |
| Accepted | Confirmation completed before next Paris midnight | Save exactly one immutable answer and stable score; neutral recorded state | Duplicate or retry reconciles against saved state without clues |
| Closed | Confirmation still waiting for the lock at midnight, or past quiz | No new answer | Explain closure without disclosing result |
| Uncertain | Response lost or network error | Check authoritative recorded state before offering retry | Retry only while still admissible; preserve neutral state |
| Score | Correct / wrong / missed day | 10 / 0 response points, plus 1 participation; 2 bonus per non-overlapping three correct answers | Wrong resets sequence; missed day does not |
| Concurrent | Same member, same or different quizzes, simultaneous requests | One answer per quiz, consistent clock and sequence, no duplicated scores | Database constraint and serialized transaction protect state |
| Test time | Confirm a future test case | Advance shared simulated clock to its day; result revealable next simulated day | No backward move except future targeted reset |
| Unsafe | Nonmember, unlisted tester or unsafe environment | No content or mutation | Deny without sensitive details, no-store |

</frozen-after-approval>

## Code Map

- `services/api/src/main/kotlin/com/hatcast/api/advent/AdventTestController.kt` — existing protected fictional content, membership, isolation and verified-email allowlist checks; reuse without weakening them for every mutation and state read. Fictional answer keys stay server-side.
- `services/api/src/main/kotlin/com/hatcast/api/advent/AdventNoStoreFilter.kt` and `services/api/src/main/kotlin/com/hatcast/api/security/SecurityConfig.kt` — preserve no-store and add authenticated mutation access with equivalent authorization.
- `services/api/src/main/resources/db/migration/` — add a non-destructive Flyway migration with unique member/quiz answer and serialized member and shared clock state; check the latest migration number. `TroupeRepository.kt` demonstrates pessimistic locking.
- `services/api/src/test/kotlin/com/hatcast/api/advent/` — extend existing controller, isolated integration and offline tests; exercise actual concurrent transactions and time boundaries.
- `apps/web/src/app/pages/advent-test/advent-test.{ts,html,scss}` — replace decorative choices with accessible Material single-choice controls, explicit confirmation and neutral server-reconciled states. Preserve protected fetch, focus, responsive door and reduced motion.
- `apps/web/src/app/pages/advent-test/advent-test.spec.ts` and browser motion checks — cover selection, errors, reconciliation, disclosure, keyboard, small screens and enlarged text.
- `SPEC.md`, `DOMAIN.md`, `ARCH.md` — describe shipped behavior, data rules and non-destructive migration where applicable; preserve later-story boundaries.

## Tasks & Acceptance

**Execution:**
- [x] `services/api/src/main/resources/db/migration/` — create additive schema and compatibility plan for stable answers, uniqueness, member streak and shared test clock; no production migration execution.
- [x] `services/api/src/main/kotlin/com/hatcast/api/advent/` — implement protected confirmation and state reconciliation, transactional scoring and clock advance, and neutral response contracts.
- [x] `services/api/src/main/kotlin/com/hatcast/api/security/SecurityConfig.kt` — permit authenticated requests while retaining strict Advent checks.
- [x] `services/api/src/test/kotlin/com/hatcast/api/advent/` — test matrix, concurrency, retries, authorization, no-store, no disclosure and actual Paris boundary independent of simulated time.
- [x] `apps/web/src/app/pages/advent-test/` — implement single-choice form, confirmation, loading, neutral recorded and uncertain/closed states without truncation or unsupported ranking.
- [x] `apps/web/src/app/pages/advent-test/` tests — exercise interactive semantics, reconciliation, accessibility, responsive and reduced-motion behavior.
- [x] `SPEC.md`, `DOMAIN.md`, `ARCH.md` — update relevant delivered behavior and architecture.

**Acceptance Criteria:**
- Given an eligible member and an available quiz, when a choice is confirmed, then it is stored once and the member receives only a neutral return-tomorrow acknowledgement until reveal.
- Given two simultaneous submissions or retries, when persistence completes, then the database contains at most one answer per member and quiz, and scores and streak remain correct.
- Given a confirmation still waiting for the lock at Paris midnight, including one received earlier, it closes; a result read waits for an already-running transaction. Verify real and simulated clocks separately.
- Given a keyboard, assistive technology, reduced motion, narrow viewport or enlarged text, when playing the quiz, then choices, errors, focus and confirmation remain operable and readable with Material 3.
- Given a potential human demonstration, when data, notifications and analytics isolation has not been verified, then no demonstration is handed off.

## Implementation Notes

Patrice validated the user acceptance test on 2026-10-30, after local adjustments to replay, navigation and the visual preview. Those adjustments were still uncommitted at the time of validation; the test portraits were local ignored files.

Patrice accepts a possible delay after midnight while an already-running transaction completes. API Advent and Angular component tests passed; the isolated Chromium check passed with a mocked API and blocked service worker. A real offline browser/API/CSRF session was checked through Tailscale; the service-worker cross-account isolation check remains outstanding.

On 2026-10-30 Patrice replaced the earlier receipt-time rule: close confirmations still waiting for the lock at midnight; a result may wait briefly for an already-running transaction. BUG-055 must be fixed without disabling its reproducing tests.

## Spec Change Log

- 2026-10-30: Patrice replaced receipt-time eligibility with closure of confirmations still waiting for the lock at midnight; a result may wait for an already-running transaction. Earlier BUG-055 acceptance below is superseded.

## Review Triage Log

### Final review — 2026-10-30

- **Resolved locally — BUG-055:** Confirmation time is checked after obtaining the shared lock. Future result reads must acquire the same lock; Patrice accepts a brief delay if a transaction is already running. Reproducing tests remain enabled.
- **Resolved locally — BUG-056:** The prior conflicting-retry finding is addressed by server-side reservation and generation fencing; H2 and component tests cover the cited orders. PostgreSQL concurrency remains unverified.
- **Resolved locally — BUG-057:** Requests and response parsing time out after 10 seconds. A timed-out confirmation is reconciled before retry; if reconciliation times out, the state remains uncertain. Component tests cover stalled preview, reconciliation and confirmation; a browser network-stall test remains unverified.
- **Medium — verification gap:** The browser test mocks the API and does not validate browser CSRF handling against the real server; MockMvc supplies its own token.
- **Unverified — cache isolation:** The browser test blocks the service worker. `ngsw-config.json` excludes `/v1/**` from navigation and has no API data group, but this is not an end-to-end cross-account cache test.
- **False — leap-day initialization:** `ZonedDateTime.withYear` adjusts February 29 to the last valid day in February when changing to a non-leap year; it does not throw for that reason.
- **Documentation — previous review log:** Earlier BUG-056 and verification-gap entries are historical findings; the current result is recorded above. The selected choice/day and offline unverified-email negative tests were added.

- **Accepted — BUG-055:** Patrice accepted the rare possibility that a late confirmation changes an already revealable bonus. The reproducing test remains enabled and fails.
- **High — unresolved submission:** A failed POST can still be processing when reconciliation returns `available`; changing the selection and retrying can leave the first choice recorded. See BUG-056. This requires a safe reconciliation design and remains open.
- **Medium — verification gap:** The frontend tests do not assert that the selected option and day are sent in the POST.
- **Medium — verification gap:** The offline integration tests do not reject an allowlisted member with an unverified email on all three protected routes.
- **Medium — verification gap:** The browser check uses mocked API responses and blocks the service worker; it does not establish real API/CSRF or service-worker cache isolation.

## Design Notes

A correct sequence scores bonuses on answers 3, 6, 9 and so on; an incorrect answer resets it, while a day without an answer leaves it unchanged. Score and correctness must remain inaccessible until reveal, even through concurrent or retry responses.


**Reveal serialization contract (25.3/25.4):** Future result and ranking reads must acquire the same singleton clock row lock as confirmation, then sample authoritative time after acquiring it and read committed answers before releasing it. This serializes a reveal with in-flight confirmations so its scoring snapshot cannot subsequently change. Patrice accepts that an already-running transaction may delay the read beyond midnight. Story 25.3 must implement and test this contract, including rollback and concurrent reads, on PostgreSQL.

## Verification

Run targeted Advent API integration tests including real concurrent requests, Angular component tests, the frontend build and relevant browser accessibility/responsive checks. Report isolation evidence and remaining limitations before any human test.
