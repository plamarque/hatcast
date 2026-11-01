---
title: 'Return to the sleeping Advent elf'
type: 'feature'
created: '2026-11-01'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
baseline_commit: 'c48556fe96ab6c6a5de79cfa10ca93212f4cb16a'
context:
  - '_bmad-output/implementation-artifacts/25-12-retrouver-le-lutin-endormi-apres-avoir-joue.md'
  - '_bmad-output/implementation-artifacts/epic-25-context.md'
  - '_bmad-output/planning-artifacts/ux-designs/ux-hatcast-avent-2026-10-28/DESIGN.md'
  - '_bmad-output/planning-artifacts/ux-designs/ux-hatcast-avent-2026-10-28/EXPERIENCE.md'
  - '_bmad-output/planning-artifacts/architecture/architecture-hatcast-avent-2026-10-29/ARCHITECTURE-SPINE.md'
  - 'docs/v2/technical/FRONTEND_UI.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Returning to today's already answered quiz currently reuses its immediate confirmation; it lacks the much-loved sleeping elf illustration and a clear indication of when the result becomes available.

**Approach:** Present a distinct illustrated waiting scene when revisiting a recorded normal answer before its reveal, with a live countdown to Paris midnight. Keep the immediate confirmation and established entry and reveal priorities.

## Boundaries & Constraints

**Always:** Recreate the sleeping elf, green hat, bell, snow and warmly lit night from panel 9 of the approved reference. Keep « Reviens demain ! », the result explanation and hours/minutes/seconds as real adaptable text. The countdown concerns the result, not a promised new quiz; December 25 has no quiz. Preserve navigation, membership and privacy, the server's authority over time and reveal, and isolated test controls. Use accessible Material controls, scoped Advent visuals, touch targets at least 44 px, responsive 320 px through desktop, zoom, keyboard, focus, contrast and reduced motion. Reconcile the affected functional and UX contracts and show a real journey and visual comparison.

**Never:** Reveal an answer or score based only on the browser clock, change immediate confirmation, late replay or existing entry priority, expose protected data, change HatCast styling outside Advent, push or deploy.

## I/O & Edge-Case Matrix

| Scenario | Input / state | Expected behavior |
|---|---|---|
| Submit then revisit | Normal answer recorded today | Keep immediate confirmation; on a later visit to today's played calendar case show the waiting scene and result countdown. Keep calendar, ranking and closing available. |
| Time boundary | Next Paris midnight, including December 24 | Countdown never negative; re-read authorized server state before revealing. Respect unseen-result priority and Christmas recap. On network failure keep a recoverable waiting state, not a premature reveal. |
| Browser clock / suspension | Incorrect local clock, slow request, suspended or resumed tab | Use server-sampled time with elapsed duration, refresh after resume and boundary; avoid stale, negative or unauthorized result. |
| Isolated test | Per-tab simulated day and replay controls | Use server-validated effective time and keep simulated day explicit; a fixed simulated date does not advance merely because real midnight passes. Avoid refresh loops and retain the arrows and replay. |
| Other paths | Missing content, past late replay, already revealed result, uncertain answer, account or mode switch | Preserve existing behavior and do not leak pending choice, correctness or score; discard stale countdown and asynchronous responses. |

</frozen-after-approval>

## Code Map

- `apps/web/src/app/pages/advent-test/advent-test.ts` and `.html` / `.scss`: `openCalendarDay`, `selectDay`, `confirm` and `reconcile` converge on `answerState='recorded'`; distinguish a later calendar revisit from immediate confirmation and uncertain reconciliation. Preserve `enterAt`, `showResult`, `showLateResult`, `projectionEpoch`, `contextCurrent`, session and replay guards; clean timers on transitions and destruction.
- `services/api/src/main/kotlin/com/hatcast/api/advent/AdventMemberController.kt` `/clock` currently returns only `date`. `AdventMemberGame.kt` samples the clock under lock and associates simulated dates with the real Paris local time; `AdventMemberClock.kt` controls isolated offsets. Extend the existing authorized no-store projection with coherent effective instant and next Paris midnight, without breaking `date` or exposing protected information.
- `apps/web/public/advent/` and `apps/web/src/app/shared/advent/`: scoped illustration and styles; source is panel 9 of `_bmad-output/planning-artifacts/ux-designs/ux-hatcast-avent-2026-10-28/imports/advent-quiz-design-system-reference.png`. Do not bake interface text into the asset.
- `apps/web/src/app/pages/advent-test/advent-test.spec.ts`, `apps/web/e2e/advent-member.spec.ts` and `services/api/src/test/kotlin/com/hatcast/api/advent/`: extend current tests for real entry, server clock, boundaries and isolated simulation.
- `SPEC.md`, Advent `DESIGN.md` and `EXPERIENCE.md`, and architecture as relevant: reconcile the new revisit state while preserving confirmed entry and reveal rules and completed story history.

## Tasks & Acceptance

**Execution:**
- [x] `AdventMemberController.kt`, `AdventMemberGame.kt` and API tests — provide and verify a coherent, authorized server-time projection for ordinary and simulated modes, including no-store and Paris midnight.
- [x] `advent-test.ts`, `.html`, `.scss` and Advent assets — implement distinct accessible revisit scene and server-based countdown, lifecycle cleanup, refresh and error recovery.
- [x] Advent contracts and `SPEC.md` where relevant — document the new waiting scene without changing unrelated rules.
- [x] Angular, API and browser tests — cover the matrix, clock skew, request latency, suspension, boundaries, context switches, late replay, privacy and navigation.
- [x] Real local full-stack demo — record submit → confirmation → exit → calendar revisit → waiting → authorized reveal; compare panel 9 and inspect responsive, zoom, focus, contrast, reduced motion and isolation from HatCast.

**Acceptance Criteria:**
- Given a member revisiting their pending normal answer, when the scene is rendered, then it visibly evokes panel 9 and presents the remaining time to the result in accessible real text.
- Given an expired or uncertain local timer, when server state is not yet authorized or cannot be read, then no result is disclosed and the member has a recoverable path.
- Given the Material 3 and Advent checklists, when the story is reviewed, then applicable checks pass or explicit limitations are recorded.

## Implementation Notes

## Spec Change Log

## Review Triage Log

- medium — Network round-trip could end the timer early and show an error; the server-sampled duration now starts at receipt, followed by an authorized read.
- medium — `clockDate` remained on the previous day after the authorized reveal; it is updated after the result is displayed.
- medium — Failed calendar or ranking navigation discarded waiting; the previous context and waiting state are restored on failure.
- medium — A visibility resume during a pending read could lose the refresh; a pending refresh now runs after that read.
- false — A simulated countdown could imply an automatic date change: the screen explicitly says to advance the simulated day, and the timer never changes the test date.
- low — The clock error text also covered result failures; the copy now describes both possible failures.
- medium — A unit test did not exercise a real timer crossing; a controlled before/after-midnight test was added. A separate isolated H2 browser journey also crossed the server boundary before review patches.
- low — The original verification note did not describe visual comparison and limits; the note now records the comparison and explicitly reports non-exhaustive keyboard and contrast checks.
- medium — Calendar/ranking failure lost waiting; same verified defect as the navigation finding above, now fixed.
- false — A hung clock request could disable controls indefinitely: `requestJson` has a 10-second timeout and the existing finally block releases loading.
- medium — Automated coverage did not exercise expiry of a real timer; added controlled-time test and ran it successfully.
- medium — Authorized clock HTTP serialization and no-store were untested; an authorized HTTP test now checks all fields and cache policy.

## Verification

Run focused Angular and backend tests using project-supported commands and the relevant Playwright member scenarios. Verify the real full-stack journey with fictional data, including actual Paris midnight boundaries independently of per-tab simulated dates. Record the visual comparison and any accessibility or test limitations.


Verification performed: 133 targeted Angular tests, AdventMemberGameTest and AdventMemberSecurityTest passed; Playwright fixture scenario passed at 320 px and 200% text. Isolated offline H2 full-stack recording showed the December 24 answer, confirmation, return and waiting countdown, then authorized revelation at Paris midnight. Video: /private/tmp/hatcast-2512-video-diagnostic/page@e90f432c9dd253fbc70ec8b0d06e5b35.webm. Contrast and keyboard coverage are not exhaustive.

Visual comparison: the elf and three white counters follow panel 9; the scene uses a newly generated illustration and a solid blue panel rather than the exact illustrated background. 320 px and 200% text screenshots were inspected. The full-stack video was recorded before the subsequent review patches; targeted tests were rerun after them.
