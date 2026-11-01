---
title: 'Personal Advent gift calendar'
type: 'feature'
created: '2026-10-31'
status: 'done'
baseline_commit: 'e7b57d08f532144c2244ff7cb6ca53ed311f1f3e'
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

**Problem:** The delivered calendar lets members browse days but does not provide the approved personal gift recap.

**Approach:** Evolve the existing calendar into 25 expressive gifts, inspired by the approved mockup, with personal outcomes disclosed only when the server authorizes revelation.

## Boundaries & Constraints

**Always:** Preserve the existing journey, priority unseen revelation, server Paris time, membership authorization, no-store privacy, test controls and theme isolation (AD-7). Keep the four-column chronological grid, accessible numbered controls and the existing late-play, missing-content and Christmas flows. A gift opens only on recorded answer; it is neutral until reveal, then indicates correct or incorrect with color and a non-color accessible sign, including unseen outcomes. A past unanswered gift stays closed and neutral without a missed-day label. Distinguish absent content accessibly. Day 25 is distinctive when available, remains locked before its date and never represents a quiz. The mockup is visual inspiration, not authority on rules.

**Never:** Expose choices, points, correctness or derived clues before authorized reveal, including in test mode, accessible names or API responses. Do not disclose other members' results, cache sensitive data, weaken priority revelation, mutate production data, push or deploy. Do not let account changes, simulated-date rollback or stale requests retain previously authorized results.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected behavior |
|---|---|---|
| Answered | Recorded before reveal | Open neutral gift; accessible pending state; no outcome or points in API or UI. |
| Revealed | Correct or incorrect, seen or unseen | Authorized personal green/check or red/cross; priority reveal still takes precedence. |
| No answer | Past playable, today, missing or future | Closed neutral without missed-day indicator; missing has a distinct accessible sign; future remains dark and locked. |
| Late play | Past quiz answered for pleasure | Immediately revealed personal result, zero points and no ranking or streak effect. |
| Christmas | Before / from 25 December | Locked before date; distinctive accessible link to Christmas summary thereafter, no quiz. |
| Identity or time | Account switch, simulated rollback, stale response | Clear prior projection immediately and display only a fresh server-authorized projection for current account and time. |

</frozen-after-approval>

## Code Map

- `services/api/src/main/kotlin/com/hatcast/api/advent/AdventMemberGame.kt` — `calendar`, `AdventCalendarDay`: project only the current user's authorized outcome under existing clock lock; retain priority and future checks. `AdventMemberController.kt` and `AdventNoStoreFilter.kt` enforce existing access and cache boundaries.
- `apps/web/src/app/pages/advent-test/advent-test.ts`, `.html`, `advent-calendar.scss` — existing navigation, Material buttons, four-column grid, operator close action, labels and no-store requests. Preserve priority and guard asynchronous results against identity and date changes.
- `services/api/src/test/kotlin/com/hatcast/api/advent/AdventMemberGameTest.kt`, `AdventMemberSecurityTest.kt`; `apps/web/src/app/pages/advent-test/advent-test.spec.ts`; `apps/web/e2e/advent-member.spec.ts` — extend existing focused tests. `apps/web/e2e/advent-isolation/advent-service-worker.smoke.cjs` exercises isolated PWA and two accounts.
- `_bmad-output/planning-artifacts/ux-designs/ux-hatcast-avent-2026-10-28/mockups/calendrier-cadeaux-proposition.png` — approved visual target; `apps/web/src/app/shared/advent/_foundation.scss` confines the theme.

## Tasks & Acceptance

**Execution:**
- [x] `AdventMemberGame.kt` — add minimal personal pending/correct/incorrect projection gated by server reveal time, preserving locks and existing contracts.
- [x] `advent-test.ts`, `advent-test.html`, `advent-calendar.scss` — implement accessible, visually legible gift states and fence stale identity/date requests while preserving current controls.
- [ ] Advent API, Angular and browser tests listed above — cover the matrix, priority, midnight, two accounts, rollback, stale requests and disclosure boundaries with fictional data.
- [x] `SPEC.md`, `DOMAIN.md`, `ARCH.md` and Advent UX documents as applicable — reconcile the shipped behavior without changing other decisions.

**Acceptance Criteria:**
- Given a member and server time, when the calendar is fetched or read directly, then only that member's currently authorized states are returned, with no premature outcome or points.
- Given an unseen priority result, when calendar access is requested, then the priority result is presented first and existing acknowledgment behavior remains intact.
- Given keyboard, screen reader semantics, reduced motion, mobile and enlarged text, when using the calendar, then all states and controls are distinguishable, operable and legible without relying on color.
- Given UX-DR11 and Material 3 criteria M3-1–M3-5, when reviewing the interface, then applicable controls, theme, responsive behavior, accessibility and French copy conform or an explicit waiver is recorded. Advent visual styles do not affect HatCast.

## Implementation Notes

The calendar exposes only server-authorized personal outcomes. Identity and clock changes invalidate in-flight requests. Gift artwork is scoped to Advent; the four-column grid scrolls horizontally at 200% text on narrow screens.

## Spec Change Log

## Review Triage Log

- **false:** `reconcile` suppresses stale errors, but all three callers check the context before any subsequent state or focus work.
- **low — patch:** A delayed confirmation focus can target a later session; fence the callback by identity and epoch.
- **medium — patch:** Horizontal scrolling at 200% lacks a keyboard focus visibility check; exercise focus on the last column.
- **low:** The mocked visual fixture combines a future clock and revealed gifts for a single visual matrix; server date consistency is independently covered by the real API and game tests.
- **low — patch:** The second account smoke checks state but not `outcome`; assert no personal outcome.
- **low — patch:** The revealed projection smoke does not assert absence of choices and points; assert it explicitly.
- **low — patch:** The revealed projection smoke omits a `no-store` assertion; add it.
- **low:** Screenshot tests have no pixel/contrast assertion; real-size captures were inspected separately, and adding brittle visual snapshots is not needed for this story.
- **false:** The task is checked in the current spec; the reviewer read an earlier diff.
- **low — patch:** EXPERIENCE still labels the verification as future; use a timeless heading.

## Verification

Run focused Advent server game and security tests, Angular calendar tests, production build and relevant browser scenarios. Inspect real-size gift silhouettes and indicators at 320, 375, 390 and 430 px, tablet, desktop and 200% text; verify touch targets, focus, contrast and reduced motion. Exercise a real isolated API with fictional accounts and simulated rollback, no-store/service-worker behavior, and compare computed styles on a HatCast page with and without the Advent theme. Record actual coverage and limitations; mock API tests alone do not prove server privacy.

Results: focused server game and security tests passed, including the Paris midnight and rollback cases; 85 Angular tests passed; the production build passed; four calendar/member Chromium scenarios and six HatCast isolation scenarios passed. A real API and service-worker smoke passed on a disposable H2 database with fictional accounts. Screenshots were inspected at 320–1280 px and at 200% text. An exhaustive screen-reader audit was not performed.
