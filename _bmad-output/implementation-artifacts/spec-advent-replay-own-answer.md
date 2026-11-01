---
title: 'Replay my Advent test answer'
type: 'feature'
created: '2026-10-30'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
context:
  - 'docs/v2/technical/FRONTEND_UI.md'
  - '_bmad-output/planning-artifacts/architecture/architecture-hatcast-avent-2026-10-29/ARCHITECTURE-SPINE.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** A tester cannot replay an answered Advent test quiz; the recorded screen also repeats the question unnecessarily.

**Approach:** In isolated test mode, let the signed-in tester explicitly erase only their own answer for the displayed quiz and replay it, including a quiz that has become past, without resetting the shared clock or other testers. Show the question only while selecting an answer.

## Boundaries & Constraints

**Always:** Apply existing isolation, membership, verified-email, allowlist, CSRF and no-store protections. Serialize with the existing clock lock; invalidate outstanding attempts so a delayed confirmation cannot recreate an erased answer. Recompute the member's scores and streak consistently. Permit the requested replay without rewinding the shared clock, including past days. Keep the neutral acknowledgement and do not expose choice, correctness or score. Make replay usable on mobile and with a keyboard. Preserve concurrent unrelated local changes.

**Never:** Enable production test mode, erase other users' answers, reset shared time, change unrelated data, send notifications or analytics, or modify a real identity's verification. Do not reset or delete any real user data. Do not push, deploy, commit, or close a story.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Recorded | Test member answered current or past quiz | Can explicitly erase only this answer and select again | Explain failures; no duplicate submissions |
| Concurrency | Old confirmation races replay | Invalidated old attempt cannot restore erased answer | Serialize and reconcile server state |
| Isolation | Other members and test clock | Answers and clock remain unchanged | Deny outside isolated test mode |
| Scoring | Removing and replaying earlier answer | Recalculate own subsequent score and streak consistently | No scores or solutions returned |
| Confirmation | Recorded screen | Neutral acknowledgement without question text | Preserve accessible controls |

</frozen-after-approval>

## Code Map

- `services/api/src/main/kotlin/com/hatcast/api/advent/AdventTestController.kt`: existing authorization for all test routes; never accept a member ID from the client.
- `services/api/src/main/kotlin/com/hatcast/api/advent/AdventTestAnswers.kt`: global clock lock, answer/attempt/generation handling, scoring.
- `services/api/src/main/resources/db/migration/`: additive isolated-test replay state if needed.
- `services/api/src/main/kotlin/com/hatcast/api/config/SecurityConfig.kt`: authenticated/CSRF routing; retain no-store filter.
- `services/api/src/test/kotlin/com/hatcast/api/advent/`: isolation, race and scoring regression tests.
- `apps/web/src/app/pages/advent-test/`: current in-progress visual work must be preserved; remove question from acknowledgement, add test-only replay action, states and component tests.
- `SPEC.md`, `DOMAIN.md`, `ARCH.md`: update delivered behavior and boundaries without changing production quiz rules.

## Tasks & Acceptance

**Execution:**
- [x] Implement protected personal replay, invalidation, scoring and a test-only past-day replay mechanism.
- [x] Test isolation, current and past days, delayed confirmation, concurrency and score recomputation.
- [x] Implement and test accessible mobile replay action and neutral confirmation; retain concurrent visual edits.
- [x] Update relevant documentation; verify tests and running stack.

**Acceptance Criteria:**
- Given a recorded test answer, when the member chooses to replay it, then only that member's answer for that day is erased and the quiz is playable again, even if the shared clock has advanced.
- Given a delayed confirmation for a removed answer, when it arrives, then it cannot recreate the removed answer.
- Given a recorded answer, when showing the acknowledgement, then the question is absent and no correctness or points are disclosed.

## Implementation Notes

Patrice validated the local user acceptance test on 2026-10-30.

The question was moved into the available-choice branch before this spec. Existing v2 checkout contains unrelated and concurrent user work; do not stage, revert or overwrite it.

## Spec Change Log

## Review Triage Log

- **Fixed:** Reconciliation rotates the recorded-answer replay token under the lock so a delayed replay cannot erase it afterwards; both operation orders have regression tests.
- **Fixed:** Clear the selected choice on replay, including when its response is lost.
- **Fixed:** Reject recorded states without replay tokens in reconciliation, reserve and confirmation.
- **Fixed:** Focus the visible acknowledgement after confirmation and give its section a visible accessible label.
- **Fixed:** Update the Advent specification, epics and architecture to document explicitly the personal test-only replay exception.
- **Fixed:** Exercise the selected day, token, deletion and new confirmation with a stateful Angular test; API tests exercise the actual persistence and authorization.
- **Limitation:** The browser integration uses a stateful fake API; live proxy checks verify the session, quiz and rejection of a stale replay token without deleting the user's existing answer.

## Verification

Run targeted Advent API integration and Angular component tests and check actual test flow on the running isolated stack. Restart only the stack started for this session if needed, then verify the Tailscale link and keep the stack available.
