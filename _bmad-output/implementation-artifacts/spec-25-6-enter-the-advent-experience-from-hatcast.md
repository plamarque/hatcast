---
title: 'Enter the Advent experience from HatCast'
type: 'feature'
created: '2026-11-01'
status: 'done'
baseline_commit: '3430d9184b55c74c533c76fa5fe9597444aac578'
route: 'dispatch'
review_loop_iteration: 0
context:
  - '_bmad-output/implementation-artifacts/epic-25-context.md'
  - '_bmad-output/planning-artifacts/ux-designs/ux-hatcast-avent-2026-10-28/DESIGN.md'
  - '_bmad-output/planning-artifacts/ux-designs/ux-hatcast-avent-2026-10-28/EXPERIENCE.md'
  - '_bmad-output/planning-artifacts/architecture/architecture-hatcast-avent-2026-10-29/ARCHITECTURE-SPINE.md'
  - 'docs/v2/technical/FRONTEND_UI.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Eligible members cannot discover and reopen the Advent experience naturally from HatCast, with a shared daily dismissal.

**Approach:** Add a seasonal gift entry using `apps/web/public/advent/gifts/gift-closed-v1.png` to the member shell and the controlled automatic daily entry, reusing the existing Advent journey and prioritizing unseen results.

## Boundaries & Constraints

**Always:** Server Paris civil time, active membership and configured troupe govern production access from 1 December through 15 January inclusive. Keep priority revelation before other destinations, with seen acknowledgement only after display. Persist explicit closing by member and day across devices; an answer also prevents daily automatic opening. A visit without available content does not itself consume opening. Test mode remains explicit, visible and restricted to verified isolated development; preserve the existing operator-tab simulated date and reset semantics. Keep sensitive data private and no-store, protect direct API and URLs, preserve existing reveal and score boundaries. Apply the Advent UX contracts and AD-7 without changing the global HatCast design system. Include keyboard, accessible labels, focus placement and restoration, responsive layout, reduced motion and Material 3 checklist.

**Never:** Introduce invitations, analytics, production data changes or deployment. Do not expose quiz content, answers or pending points through entry state. Do not infer access from browser time, or change unrelated game, calendar, ranking, or accepted content-edit risk.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected behavior |
|---|---|---|
| Season | Before 1 December / 1 December–15 January / 16 January | Hide seasonal entry and enforce server boundary / show entry for eligible members / end access. |
| Daily entry | 1–24 December, available and unanswered | First eligible visit opens journey after any priority reveal. Answer or explicit close prevents further automatic opening across devices that day. |
| Missing quiz | Visit without quiz / quiz appears later | No automatic opening and no consumption / a later eligible visit may open it unless the member closed the experience that day. Icon offers absence message, calendar and ranking after any priority reveal. |
| Returning member | Unseen reveal / answered today | Reveal first; acknowledge only on actual display / icon opens ranking after reveal priority. |
| Christmas | 25 December / 26 December–15 January | Christmas journey after reveal priority / final ranking and calendar; no automatic quiz opening. |
| Identity and failure | Ineligible account, changed account, concurrent devices, failed close, clock boundary | Enforce authorization and current identity server-side; avoid stale state or falsely claiming persistence; offer recoverable feedback. |

</frozen-after-approval>

## Code Map

- `apps/web/src/app/layout/member-shell/` and `apps/web/src/app/shared/member-account-menu/` — member shell and mobile/desktop account controls; place accessible seasonal entry near account in both layouts.
- `apps/web/src/app/app.routes.ts` and `apps/web/src/app/pages/advent-test/advent-test.{ts,html,scss}` — existing `/avent` journey, priority result, focus and closing; reuse it, handle entry destination and restoration, retain test-mode boundaries.
- `services/api/src/main/kotlin/com/hatcast/api/advent/AdventMemberController.kt`, `AdventMemberGame.kt`, `AdventParisTime.kt` — existing membership authorization, locked server clock, session, latest unseen result and state projections; extend with minimal authorized entry/dismissal state and protect season access.
- `services/api/src/main/resources/db/migration/` — additive member/day dismissal persistence as needed; preserve existing data and isolated reset behavior.
- `services/api/src/test/kotlin/com/hatcast/api/advent/`, `apps/web/src/app/pages/advent-test/*.spec.ts`, shell tests and `apps/web/e2e/advent-member.spec.ts` — extend existing fictional-data and authenticated coverage.

## Tasks & Acceptance

**Execution:**
- [x] `services/api/src/main/kotlin/com/hatcast/api/advent/` and migration directory — implement authorized seasonal entry state and durable member/day dismissal, retaining locks, simulated-clock isolation and reset behavior.
- [x] `apps/web/src/app/layout/member-shell/`, account navigation and `apps/web/src/app/pages/advent-test/` — implement icon, automatic entry, destination and closing behavior, focus handling and isolated visual treatment.
- [x] API, Angular and browser tests — verify the scenario matrix, authorization, date limits, two devices, failures, priority and confidentiality using fictional data.
- [x] `SPEC.md`, `DOMAIN.md` and `ARCH.md` as applicable — document the delivered behavior and persistence without modifying unrelated decisions.

**Acceptance Criteria:**
- Given an eligible member, when entering or reopening Advent, then the seasonal entry and daily behavior follow the matrix and the most recent unseen reveal takes precedence.
- Given a member who closes Advent or answers, when using another device on the same Paris day, then automatic daily opening does not recur; an absent quiz alone never records dismissal.
- Given keyboard navigation, reduced motion, small screens or enlarged text, when entering and leaving Advent, then controls remain usable and focus is placed and restored appropriately; a decorative moving reflection and sparkle on the gift last under five seconds, runs once on opening HatCast, and is suppressed with reduced motion.
- Given the Material 3 checklist and Advent DESIGN, EXPERIENCE and AD-7, when reviewing the UI, then applicable items are met or explicitly recorded as waived, with no unintended effect on HatCast.

## Implementation Notes

## Spec Change Log

## Review Triage Log

- Exit without saving reopened the journey on return: fixed by suppressing automatic opening on the return navigation; shell test covers it.
- Browser back could cause the same loop: fixed by the same return-navigation rule.
- Closing during answer or acknowledgement mutation could interrupt reconciliation: close is disabled and guarded while a mutation is pending.
- Close before session initialization could lack the session token: close is disabled while the initial load is in progress; errors retain the explicit exit.
- A stalled dismissal request had no timeout: added a 10-second abort and existing error path.
- A stalled entry request had no timeout: added a 10-second abort and existing retry feedback.
- An idle open HatCast tab does not poll at midnight: no automatic polling is required by the first-eligible-visit contract; navigation refreshes the projection.
- A dismissal received after midnight records the current server civil day: this follows the specified member/day dismissal rule; no client clock is used.
- Focus restoration when the gift is no longer present: added a fallback to the main content.
- Successful dismissal had no component return test: added a component test and exercised the real local API, reload and entry projection.
- Return after failed dismissal and closing during mutation lacked tests: added focused shell and component tests.
- The two timeout review findings repeat the stalled dismissal and stalled entry findings above.

## Verification

On 2026-11-01, focused AdventMemberGameTest and AdventMemberSecurityTest passed; 169 targeted Angular tests passed under Node 22. The production web build passed with pre-existing Sass and CSS budget warnings. V80 ran and accepted a fictional member/day row on isolated PostgreSQL 16; the disposable database was removed. A real offline API and Chromium test confirmed dismissal, return to agenda, reload and autoOpen=false. Browser checks at 320 px with normal and 200% zoom reported no document overflow after fixing the PWA banner, navigation and agenda badge; keyboard focus on the last navigation item was checked. The user validated the gift and animation on phone in the implementation thread. Full screen-reader, full contrast audit and multiple physical devices were not tested. No production or deployment verification was performed.

Run focused Advent API authorization, clock, game and migration tests, Angular shell and Advent tests, production build, and browser scenarios with a real local API and fictional users. Verify Paris season boundaries, test-mode isolation, two accounts and devices, cache/no-store, priority reveal, late publication, focus, reduced motion, mobile widths, enlarged text, contrast and Advent visual isolation. Record a usable demonstration and any coverage limitations.
