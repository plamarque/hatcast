---
title: 'Open future Advent gifts in development test mode'
type: 'feature'
created: '2026-11-04'
status: 'ready-for-dev'
route: 'dispatch'
review_loop_iteration: 0
context:
  - 'docs/v2/technical/FRONTEND_UI.md'
  - '_bmad-output/planning-artifacts/ux-designs/ux-hatcast-avent-2026-10-28/DESIGN.md'
  - '_bmad-output/planning-artifacts/ux-designs/ux-hatcast-avent-2026-10-28/EXPERIENCE.md'
  - '_bmad-output/planning-artifacts/architecture/architecture-hatcast-avent-2026-10-29/ARCHITECTURE-SPINE.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** A development tester must change the simulated date to open a future Advent gift, making it difficult to inspect gifts directly.

**Approach:** In authorized development test mode, allow a tester to select and play future quiz gifts directly, like the existing production preview, including immediate access to their personal result.

## Boundaries & Constraints

**Always:** Authorize the exception on the server for isolated development test mode only. Preserve isolated test data, personal privacy and the ordinary member journey. Keep the simulated date and shared clock unchanged by selecting a gift. Preserve the Advent visual contract, keyboard access and accessible states. Respect existing missing-content and day 25 behavior.

**Never:** Enable future access for ordinary members or through an untrusted client flag; broaden production preview authorization; mix development test answers with production data; change rankings or other members' state as a side effect; deploy or push.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected behavior |
|----------|---------------|-------------------|
| Future quiz | Authorized tester, isolated test mode on | Future gift can be selected and played; personal result and explanation are immediately accessible. |
| Revisit | Tester returns to a played future gift | Personal state is consistent and existing authorized replay controls remain usable. |
| Normal journey | Test mode off, ordinary member, or production request | Existing date and authorization restrictions remain in force. |
| Missing content or day 25 | Future gift has no quiz, or is the day 25 review | Existing safe unavailable/review behavior applies; no invented quiz. |
| Navigation | Tester selects a future gift | No simulated or shared clock is changed; other users' state remains private. |

</frozen-after-approval>

## Code Map

- `services/api/src/main/kotlin/com/hatcast/api/advent/AdventMemberController.kt` — `canControl` authenticates isolated operators; `preview` explicitly separates production preview from test mode. Add a narrowly authorized test capability without weakening either boundary.
- `services/api/src/main/kotlin/com/hatcast/api/advent/AdventMemberGame.kt` — calendar, quiz, state, reconcile, reserve, confirm and result independently gate future dates; existing preview supplies useful behavior but also affects ranking and ordinary data semantics. Keep these concerns separate.
- `apps/web/src/app/pages/advent-test/advent-test.ts` and `.html` — calendar disables locked buttons and `openCalendarDay` rejects them; session headers and async guards govern test mode and selected dates.
- `services/api/src/test/kotlin/com/hatcast/api/advent/` and `apps/web/src/app/pages/advent-test/advent-test.spec.ts` — extend existing isolated tests and authorization tests with synthetic content.
- `ARCH.md` and Advent UX contracts — document the approved development exception while keeping normal and production rules intact.

## Tasks & Acceptance

**Execution:**
- [ ] `AdventMemberController.kt` and `AdventMemberGame.kt` — authorize direct future quiz access in isolated test mode and return only the tester's personal result; preserve ordinary and production boundaries.
- [ ] `advent-test.ts` and `advent-test.html` — make eligible future gifts operable in test mode and route selection through the existing session safeguards.
- [ ] Advent API and Angular tests — cover the matrix, forged requests, test-mode off, replay, and no clock changes using synthetic fixtures.
- [ ] Relevant architecture and Advent UX documents — record the scoped exception without changing normal behavior.

**Acceptance Criteria:**
- Given an authorized development tester with test mode enabled, when they select a future quiz gift, then they can play it and see their personal result immediately.
- Given an ordinary member or a production request, when future access is attempted, then the existing server authorization and disclosure restrictions remain effective.
- Given keyboard and mobile use, when the tester opens the calendar, then eligible gifts are discoverable and operable with accessible labels and no changes to other HatCast screens.

## Implementation Notes

## Spec Change Log

## Review Triage Log

## Verification

Run focused Advent API and Angular suites, including authorization and isolated test cases. Inspect responsive and keyboard behavior, and report any accessibility checks not performed.
