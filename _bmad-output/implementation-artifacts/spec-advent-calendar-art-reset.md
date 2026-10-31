---
title: 'Refine Advent gifts and daily test reset'
type: 'feature'
created: '2026-10-31'
status: 'in-review'
baseline_commit: '466e66e2fc4f137ed62aff866d5105d1642d36c2'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '_bmad-output/planning-artifacts/ux-designs/ux-hatcast-avent-2026-10-28/DESIGN.md'
  - '_bmad-output/planning-artifacts/ux-designs/ux-hatcast-avent-2026-10-28/EXPERIENCE.md'
  - '_bmad-output/planning-artifacts/architecture/architecture-hatcast-avent-2026-10-29/ARCHITECTURE-SPINE.md'
  - 'docs/v2/technical/FRONTEND_UI.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The illustrated gifts remain small, sparse and muted compared with the approved reference; per-gift operator reset controls add visual clutter.

**Approach:** Make the personal calendar more vivid and compact, with larger illustrated gifts and a prominent, colorful 25th gift, and replace per-cell test resets with one control in the top test bar for the current simulated day's own gift.

## Boundaries & Constraints

**Always:** Use the approved gift mockup as visual inspiration, with its compact ordered four-column grid, larger imagery and prominent centered 25. Preserve Advent-only theme, accessible real numbers and non-color state indicators, 44px minimum targets, visible focus, enlarged text and reduced motion. Limit overlaid decoration and protect image legibility. The 25 remains dark and locked before its date, then becomes larger and colorful and opens the Christmas summary without a quiz. Preserve server-authorized outcomes, neutral pending, priority reveal, account/time isolation, missing and late-answer behavior.

In the calendar, only authorized test operators see one clearly labelled daily reset in the top bar; it targets their own answer for the exact displayed simulated date, not another person or the shared game. Disable it when that date is not a played day from 1–24 December, including 25 December and January, or while another operation is in progress. Reuse existing token, server authorization, stale-session and priority-reveal protections. Retain the separately confirmed global reset outside the calendar.

**Never:** Reveal correctness before authorized time or replace the current gift reset with a shared reset. Do not add controls to each cell, change scoring or production data, push or deploy.

## I/O & Edge-Case Matrix

| Scenario | State | Expected behavior |
|---|---|---|
| Grid | Mobile or desktop | Larger bright gifts, compact ordered layout, recognizable open/closed silhouettes, readable numbers and signs. |
| 25 | Before / from its date | Larger dark locked gift / larger colorful gift opening the summary; never a quiz. |
| Operator reset | Current simulated day 1–24 with own answer | Only that answer is closed; refresh calendar without changing date or other members; priority reveal wins. |
| Reset unavailable | Unplayed day, 25, January, loading or ordinary member | Disabled or absent as appropriate; no mutation. |
| Accessibility | Keyboard, 320 px, 200% text, image failure | Usable controls, visible focus, legible states without color alone and usable fallback. |

</frozen-after-approval>

## Code Map

- `apps/web/src/app/pages/advent-test/advent-calendar.scss`, `advent-test.html` — grid, images, state indicators and per-cell reset; use `apps/web/public/advent/gifts/` and approved mockup in `.../mockups/calendrier-cadeaux-proposition.png`.
- `apps/web/src/app/pages/advent-test/advent-test.ts` — `closeCalendarDay`, `clockDate`, `calendarDays`, `closingDay`: reuse existing guarded replay token and `close:true`; match full date, not day-of-month alone. Preserve separate `resetGame`.
- `services/api/src/main/kotlin/com/hatcast/api/advent/AdventMemberController.kt`, `AdventMemberGame.kt` — existing authorization, test replay and priority rules; avoid API changes unless necessary.
- `apps/web/src/app/pages/advent-test/advent-test.spec.ts`, `apps/web/e2e/advent-member.spec.ts`, `apps/web/e2e/advent-isolation/advent-answer.spec.ts` — adapt operator reset and visual/keyboard coverage.
- Advent `EXPERIENCE.md`, `DESIGN.md`, `ARCH.md` — reconcile the user's explicit change to the per-cell test control and visual treatment.

## Tasks & Acceptance

**Execution:**
- [x] `advent-calendar.scss`, `advent-test.html` — revise layout, artwork scale, visual treatment and 25 gift, minimizing overlays while preserving accessibility and all states.
- [x] `advent-test.ts`, `advent-test.html`, `advent-test.scss` — replace per-cell reset with one top-bar action for the exact current simulated day, retaining server guards and distinct global reset.
- [x] `advent-test.spec.ts`, `advent-member.spec.ts`, `advent-answer.spec.ts` — cover the matrix, operator and member boundaries, priority, stale requests and responsive visuals.
- [ ] Advent UX contracts and `ARCH.md` as applicable — reconcile the revised test control and 25 presentation.

**Acceptance Criteria:**
- Given any authorized state, when the calendar renders, then gifts and indicators reflect the server state with no premature disclosure, and the 25 remains inaccessible until authorized.
- Given an operator in calendar view, when resetting the current played day, then only their answer for that exact date is affected and priority revelation remains first.
- Given M3-1–M3-5 and AD-7, when using the calendar at mobile widths, enlarged text, keyboard or reduced motion, then controls remain usable and HatCast styling is unaffected; record any waiver.

## Implementation Notes

A separate concurrent ranking CTA change exists in the shared checkout, including overlapping files; preserve it and do not claim it as this story.

## Spec Change Log

## Review Triage Log

- **medium — patch:** The visible daily reset label does not state that the personal answer is erased; make the consequence visible.
- **medium — patch:** The reset failure message is visually hidden, so an operator cannot see why the action failed; display it while retaining its live announcement.
- **low:** Closing the experience during a pending reset is possible; the explicitly requested mutation is already sent and the server guards it, so no extra navigation guard is required.
- **low, out of scope:** The ranking return behavior belongs to a concurrent, separate user-requested change; preserve it without changing its approved behavior.
- **false:** The UX/documentation task is checked in the current spec; the reviewer read an earlier staged snapshot.
- **medium — patch:** Rerun the full browser scenarios after the final header changes and record the result.
- **medium — patch:** Add coverage for the reset failure feedback and date arrows while a reset is pending; the close-link behavior is intentional as above.
- **medium — patch:** A delayed reset test should assert both date arrows and methods stay blocked while closing is in progress.

## Verification

Run focused Angular tests, production build and Chromium calendar/member and HatCast isolation scenarios. Inspect all gift states against the mockup at actual size at 320, 375, 390 and 430 px, tablet and desktop; inspect 200% text, keyboard focus, reduced motion, fallback, touch targets and contrast. Exercise authorized and ordinary accounts, current played/unplayed days, 25 and January, priority result and stale-session reset; do not reset shared or production data. Record evidence and limitations.

Results: 91 focused Angular tests passed; production build passed with existing Sass and Advent CSS budget warnings. Ten Chromium member/isolation scenarios passed after final header changes and review patches. 320–1280 px and 200% screenshots, reduced-motion fallback, target sizes and operator focus were inspected. The reset scenarios use fictional mocked APIs; a full screen-reader audit was not performed.

Post-review: the reset label and error feedback are visible, and a delayed-reset test verifies that date controls remain disabled. Production build and all 10 Chromium scenarios passed again. The checkout also contains a separate concurrent ranking CTA change in overlapping files, so local commit remains pending.
