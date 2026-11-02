---
title: 'Replay Advent automatic opening'
type: 'feature'
created: '2026-11-02'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
baseline_commit: 'd24ea0514e40d46f9280d22b6495fb19c6e4b69b'
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** A tester cannot repeat the automatic Advent opening at HatCast sign-in after answering or closing the experience.

**Approach:** Provide an explicit test-mode action that prepares the tester's own current development day for automatic entry and signs out, so the tester can sign in again and observe the normal entry.

## Boundaries & Constraints

**Always:** Restrict mutation to authorized operators in verified isolated development; use the environment's ordinary effective Paris date, not the tab's simulated date. Confirm the date and the deletion of the operator's own answer before proceeding. Preserve other members' state, content and discovery status. Clear the operator's recorded dismissal for that same date and do not record a new dismissal while leaving. Preserve unseen result priority and report failures.

**Never:** Reset the shared game, delete other days or other members' answers, or enable this operation in production. Do not silently pretend automatic opening is possible when the ordinary date is outside the quiz period or the quiz is missing.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Eligible day | Own answer and/or dismissal exists | Confirm, clear only own day state, sign out; next sign-in evaluates ordinary auto entry | Explain failure and retain retry path |
| Different simulated day | Tab date differs from ordinary development day | Identify and prepare ordinary development day | Do not delete the simulated day by mistake |
| No answer | Own dismissal may exist | Clear dismissal and sign out | Preserve unrelated data |
| Missing content or outside period | No eligible quiz today | Explain why automatic opening cannot be replayed | No deletion or sign-out |
| Concurrent session or request failure | Session changed or mutation fails | No success claim | Surface actionable error |
| Another result is pending | Prior unseen reveal exists | Preserve it and normal reveal priority on entry | No answer leakage |

</frozen-after-approval>

## Code Map

- `apps/web/src/app/pages/advent-test/advent-test.ts` and `.html` — test toolbar, confirmation, session handling, and exit; avoid ordinary dismissal.
- `apps/web/src/app/core/auth/auth-api.service.ts` — existing HatCast sign-out flow.
- `services/api/src/main/kotlin/com/hatcast/api/advent/AdventMemberController.kt` and `AdventMemberGame.kt` — authorized development-only operation under the existing lock and session; determine ordinary effective day server-side.
- `services/api/src/test/kotlin/com/hatcast/api/advent/` and `apps/web/src/app/pages/advent-test/advent-test.spec.ts` — permissions, isolation, day selection and failure behavior.
- `SPEC.md` and Advent UX contracts — document the explicit operator-only action.

## Tasks & Acceptance

**Execution:**
- [x] Implement an authorized, narrowly scoped server operation and relevant API/security tests.
- [x] Add the explicit toolbar action, confirmation and sign-out using existing components; test errors and focus.
- [x] Update functional and UX contracts and exercise a real isolated sign-in and automatic opening.

**Acceptance Criteria:**
- Given an authorized tester with an ordinary development quiz today, when the confirmed action succeeds, then only that tester's answer and dismissal for that day are cleared and HatCast signs out.
- Given a subsequent sign-in, when the user is otherwise eligible, then the ordinary automatic Advent entry occurs and unseen results remain prioritized.
- Given production, another member, a different day, missing content or an invalid session, when the action is attempted, then unrelated state remains intact and no false success is shown.

## Implementation Notes

- Added operator-only preparation and mutation endpoints using the ordinary development clock and confirmed date. They preserve other accounts, other days and first discovery.
- The toolbar action confirms the targeted date, then signs out without recording a dismissal; it distinguishes uncertain deletion from failed logout and blocks concurrent UI actions.
- Targeted Angular tests and the Advent member game and HTTP security suites passed. The HTTP suite exercises a simulated date different from the normal day.
- A real isolated offline stack with a synthetic account and content passed the sign-in, answer, replay, sign-out and automatic sign-in entry on desktop and at 390 px. The same mobile test confirmed a pending answer opens the countdown from the gift after dismissing the install banner.
- The mobile install banner obstructed the gift in this local test; dismissing it restored access. Patrice accepted this existing behavior, recorded under closed BUG-089. Production occurrence has not been checked.

## Review Triage Log

- Medium, fixed: failed sign-out left the retry without a local identity; sign-out can now be retried independently after preparation.
- Medium, fixed: an uncertain POST outcome could lead to repeated deletion; the UI explains uncertainty and does not repeat the deletion.
- Medium, fixed: concurrent closure or mutation could interfere with the prepared state; the underlying interface is inert throughout the action.
- Medium, fixed: tests now protect another member's answer on the same day and invalidate an in-flight attempt.
- Medium, fixed: the end-to-end acceptance was run against a real isolated local API and synthetic login, including a mobile viewport.
- Accepted on 2026-11-02: Patrice considers the possible race between a newly eligible reveal and entry extremely unlikely with limited consequences and explicitly declines further testing or mitigation.
