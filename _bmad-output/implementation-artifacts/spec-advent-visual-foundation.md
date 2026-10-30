---
title: 'Advent visual foundation and preview alignment'
type: 'feature'
created: '2026-10-30'
status: 'done'
baseline_commit: '7be61ff9db810c5d5171beedb27ea02ffabe2f8e'
route: 'dispatch'
review_loop_iteration: 0
context:
  - 'docs/v2/technical/FRONTEND_UI.md'
  - '_bmad-output/planning-artifacts/ux-designs/ux-hatcast-avent-2026-10-28/DESIGN.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The existing test discovery, question and confirmation do not reflect the approved Advent visual direction, and Advent palette variables live globally.

**Approach:** Establish a reusable, explicitly scoped Advent visual foundation and align existing preview surfaces with the approved visual references while preserving all current behavior and HatCast's appearance.

## Boundaries & Constraints

**Always:** Apply the approved warm, festive art direction and the UX contracts, maintain accessible Material controls and semantic text, keyboard focus and reduced motion. Preserve confidential content and the neutral recorded state before reveal. Isolate Advent tokens, typography, components and styles from HatCast; test the boundary. Use existing authorized portraits without publishing protected images.

**Never:** Add a result, score, countdown, sharing or ranking behavior; alter API, answer timing, reset or membership rules; use a reference image as an interface; apply a global Advent theme or change HatCast styles to accommodate it.

## I/O & Edge-Case Matrix

| State | Expected behavior |
|---|---|
| Door, loading or error | Preserve controls, feedback, retry and authorized portrait behavior. |
| Question | Three accessible choices, disabled and selected states, explicit confirmation; long text remains legible. |
| Recorded | Festive confirmation with real text; no answer, correctness, or points. |
| Uncertain or closed | Preserve reconciliation, retry and existing status semantics. |
| Small viewport, zoom, reduced motion | No horizontal overflow or lost content; keyboard and reduced-motion access remain equivalent. |

</frozen-after-approval>

## Code Map

- `apps/web/src/app/pages/advent-test/advent-test.html`, `.scss`, `.ts` — current isolated development preview; preserve all signals, handlers, 25.2 personal replay behavior, recorded-status focus and portrait sizing expectations.
- `apps/web/src/app/shared/advent/_foundation.scss` — existing scoped tokens and Material overrides; reuse and extend for later Advent surfaces. `apps/web/src/styles.scss` retains the PWA banner rule; Advent variables were already migrated.
- `apps/web/src/app/pages/advent-test/advent-test.spec.ts` and `advent-test.motion.browser.cjs` — current state and motion tests.
- `apps/web/e2e/advent-answer.spec.ts` — keyboard, zoom, reduced motion and submission regression.
- UX references under `_bmad-output/planning-artifacts/ux-designs/ux-hatcast-avent-2026-10-28/imports/`; protected images remain server-served.

## Tasks & Acceptance

**Execution:**
- [x] `apps/web/src/app/pages/advent-test/`, `apps/web/src/app/shared/advent/` — extend the existing scoped Advent foundation and align discovery, quiz, recorded and existing error states with the approved visual references; preserve the committed 25.2 replay and focus behavior.
- [x] `apps/web/src/styles.scss` — verify the existing migration; preserve the PWA banner rule and other global rules.
- [x] `apps/web/e2e/` and component tests — cover behavior, responsiveness, accessibility and isolation using representative stable fixtures, subject to the scoped verification waiver recorded below.

**Acceptance Criteria:**
- Given the test preview, when opening and answering a door, then the screens follow the approved festive visual direction with accessible text and unchanged behavior.
- Given an answer recorded before reveal, when its confirmation appears, then it contains no correctness, answer or points.
- Given a non-Advent HatCast screen, when Advent is entered and left, then its visual styles and computed typography and colors are unchanged.
- Given narrow screens, enlarged text or reduced motion, when interacting with the preview, then content and controls remain accessible without horizontal overflow.

## Implementation Notes

- Baseline 7be61ff9 is historical: commit e6940c9b integrated part of this work and closed 25.2. Further work was checked against that current commit, preserving personal replay and recorded-state focus.
- Expanded the scoped Advent foundation and retrofitted discovery, quiz and recorded confirmation. Fredoka and Nunito are loaded locally; font-family applies within the Advent root. Real member illustrations remain API-protected.
- Verification: web build passes; 15 component tests, 2 motion tests and 7 targeted E2E tests pass. The E2E isolation test compares a full HatCast home screenshot and representative computed styles before and after a complete Advent journey with mocked responses. These are same-version checks, not an independent pre-change baseline.
- Remaining before completion: visual fidelity to both approved boards (including festive scenery), full state and width coverage, contrast and assistive technology checks, independent HatCast baseline, and durable reusable components beyond the existing SCSS foundation. BMAD tracker format validation reports BUG-BMAD-002; tracker unchanged.
- 2026-10-30 continuation: added a reusable scoped winter scenery mixin to discovery and confirmation. The web build and 15 component tests passed; the build warned that Advent component styles exceeded the 9 kB budget (10.56 kB). Two browser motion/banner tests and seven targeted Playwright tests passed; after the review fix, the six isolation cases also passed with full-page captures.
- Compared the current uncommitted tree with an independent local build of `e6940c9b` using identical mocked home data and Chromium at 320, 375, 390, 430, 768 and 1280 px. Full-page home screenshots and computed styles of headings and buttons matched. This commit already contains part of the Advent refoundation, so it is not a baseline before that integrated work. Screenshots and the one-off comparison script are in `/private/tmp`; this is evidence for this run, not a durable visual baseline.
- Still incomplete: inspect real rendered Advent states against both reference boards at the requested widths, verify contrast and assistive technology across states, establish a baseline preceding the integrated work, and audit every matrix row with executed tests. The change remains in progress.
- Subsequent user feedback: discovery now presents the member's name in red in a single heading, with an always-visible hint and a full-card button. Confirmation reuses the quiz's circular portrait and removes the calendar and winter scenery at the bottom. The 15 component tests and seven targeted E2E tests passed after these changes; earlier notes about a full-body confirmation illustration describe the superseded iteration.
- Continuation: a scoped panel mixin now styles loading, checking, closed and confirmation surfaces. The component suite passes 16 tests, including actual mocked loading and closed request transitions. Seven targeted E2E and two motion/banner browser tests pass; the production web build passes with an Advent CSS budget warning (9.62 kB against 9 kB).
- An independently built `7be61ff9db810c5d5171beedb27ea02ffabe2f8e` home and the current home were compared with matching mocked data at 320, 375, 390, 430, 768 and 1280 px: full-page screenshots and heading/button computed styles matched. The script and captures are temporary run evidence, not a committed baseline.
- Captured discovery, question and confirmation at those six widths using a fictional generic portrait and long answer text. Inspected the 320 and 390 px screens and desktop confirmation against both approved boards, applying the user's later preference for a circular confirmation portrait and no lower decoration. The visual direction is suggestive rather than pixel-identical; error and loading states were not visually inspected at all widths.
- Calculated token contrast ratios: green/cream 8.31, red/cream 6.03, ink/white 12.29, ink/selected 10.69, error/white 8.19, white/red 6.47, disabled ink/surface 5.28. The existing browser test measures the selected answer text. These do not establish every actual rendered pair, focus indicator or assistive-technology announcement; no screen-reader session was performed.
- User decision on 2026-10-30: for this visual-foundation acceptance, do not block on a screen-reader session, exhaustive contrast measurements, or inspection of every loading/error state at every narrow width. Existing accessible controls and behavior remain in place; this is a scoped verification waiver, not evidence those checks passed or a change to the project's standing accessibility contracts.
- Real API recipe on 2026-10-30: Playwright used the actual Angular UI and an isolated Spring `dev,offline` API with a fresh H2 database in `/private/tmp/hatcast-api-recipe`; no Advent responses were mocked. Seed sign-in, opening day 1, choosing and confirming, neutral acknowledgement, recovery after reload and personal replay all succeeded. The isolated clock and answers are separate from the user's running local session. Requests were routed to the temporary API by Playwright; production and Neon were not exercised.
- Acceptance: the user approved the recorded visual journey and authorized closure. The preceding incomplete notes describe earlier checkpoints; the remaining verification exclusions are explicitly waived for this acceptance as stated above. Future screens remain in their respective stories.

## Spec Change Log

## Review Triage Log

- medium — Same-version before/after isolation cannot prove an independent pre-change baseline; capture and compare a representative HatCast baseline before declaring complete.
- medium — Isolation journey did not exercise question and confirmation; patched, with the full journey now covered.
- medium — Full-page captures were not compared; patched with a stabilized whole-page comparison in addition to title and button checks.
- maybe-false — No Advent overlay is currently used; future overlays need a dedicated isolation test if introduced.
- medium — The new visible recorded illustration was not asserted; patched in unit and browser tests.
- medium — Alternative text was on the visually hidden image; moved to the displayed illustration.
- low — New direct colors were not reusable tokens; moved to the scoped foundation.
- medium — Home styles at enlarged text were not compared consistently; retain as a verification gap.
- medium — Isolation comparison initially covered 390 px only; extended to 320, 375, 390, 430, 768 and 1280 px. An independent before-change baseline remains outstanding.
- medium — Contrast and assistive-technology checks for all states are incomplete; retain as a verification gap.
- medium — Verification-gap review independently confirmed the visible illustration was not tested; patched.
- Edge-case reviewer reported no findings.
- false — The isolation file is selected by the existing `chromium-advent-answer` project; no second matching project exists, so it is not run twice.
- medium — The purported full-page isolation capture was viewport-only; corrected to `fullPage: true` and six cases passed.
- medium — The prior same-version comparison could not detect a change present at initial load; a separate `e6940c9b` comparison passed, but a baseline before the already-integrated changes remains missing.
- medium — Only the home screen and representative styles were compared; wider HatCast surfaces remain unverified.
- medium — Advent state renders at all requested widths have not been compared with the references.
- medium — Contrast checks cover the selected choice but not all text, controls, focus and disabled/error states.
- medium — Isolation fixtures use short answers; long-answer behavior is covered separately in the existing targeted E2E, but not in the isolation journey.
- medium — Loading, network error, uncertain and closed states lack the requested visual and accessibility coverage.
- medium — The visible confirmation illustration has presence and source assertions, but its framing and overlap at widths and zoom have not been visually checked.
- low — Unchecked tasks and verification reflect ongoing work; no completion is claimed.
- Edge-case review of the current uncommitted diff reported no findings.
- medium — Loading and closed status tests originally forced state or omitted loading; the component test now observes pending requests and a mocked closed response.
- maybe-false — A dynamically inserted populated status may not be announced by every screen reader; verify with real assistive technology before claiming coverage.
- Verification-gap and edge-case reviewers reported no findings for the continuation diff.

## Verification

Run focused unit, browser and E2E tests and a web production build as appropriate. Compare real browser renders at the requested mobile widths and inspect isolation on a HatCast screen; record any unavailable checks.
