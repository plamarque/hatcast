---
title: 'Open future Advent gifts in development test mode'
type: 'feature'
created: '2026-11-04'
status: 'done'
baseline_commit: 'eec888b9fe59ce8c6531aa7f9295b12be3062a02'
route: 'dispatch'
review_loop_iteration: 1
context:
  - 'docs/v2/technical/FRONTEND_UI.md'
  - '_bmad-output/planning-artifacts/ux-designs/ux-hatcast-avent-2026-10-28/DESIGN.md'
  - '_bmad-output/planning-artifacts/ux-designs/ux-hatcast-avent-2026-10-28/EXPERIENCE.md'
  - '_bmad-output/planning-artifacts/architecture/architecture-hatcast-avent-2026-10-29/ARCHITECTURE-SPINE.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** A development tester must change the simulated date to open a future Advent gift, making it difficult to inspect gifts directly.

**Approach:** For an authorized development tester, without requiring test mode, allow a tester to select and play future quiz gifts directly, like the existing production preview, including immediate access to their personal result.

## Boundaries & Constraints

**Always:** Authorize the exception on the server for isolated development testers, regardless of test mode. Preserve isolated test data, personal privacy and the ordinary member journey. Keep the simulated date and shared clock unchanged by selecting a gift. Preserve the Advent visual contract, keyboard access and accessible states. Respect existing missing-content behavior; allow authorized development testers to open the day 25 recap before its date.

**Never:** Enable future access for ordinary members or through an untrusted client flag; broaden production preview authorization; mix development test answers with production data; change rankings or other members' state as a side effect; deploy or push.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected behavior |
|----------|---------------|-------------------|
| Future quiz | Authorized isolated development tester, with test mode on or off | Future gift can be selected and played; personal result and explanation are immediately accessible. |
| Revisit | Tester returns to a played future gift | Personal state is consistent and existing authorized replay controls remain usable. |
| Normal journey | Ordinary member or unauthorized production request | Existing date and authorization restrictions remain in force. |
| Missing content or day 25 | Future gift has no quiz, or is the day 25 review | Missing quizzes remain unavailable; day 25 opens the existing review early for authorized testers, without inventing a quiz. |
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
- [x] `AdventMemberController.kt` and `AdventMemberGame.kt` — authorize direct future quiz access in isolated test mode and return only the tester's personal result; preserve ordinary and production boundaries.
- [x] `advent-test.ts` and `advent-test.html` — make eligible future gifts operable in test mode and route selection through the existing session safeguards.
- [x] Advent API and Angular tests — cover the matrix, forged requests, test-mode off, replay, and no clock changes using synthetic fixtures.
- [x] Relevant architecture and Advent UX documents — record the scoped exception without changing normal behavior.

**Acceptance Criteria:**
- Given an authorized development tester, whether test mode is enabled or not, when they select a future quiz gift, then they can play it and see their personal result immediately.
- Given an ordinary member or a production request, when future access is attempted, then the existing server authorization and disclosure restrictions remain effective.
- Given keyboard and mobile use, when the tester opens the calendar, then eligible gifts are discoverable and operable with accessible labels and no changes to other HatCast screens.

## Implementation Notes

Future-result scoring must retain the ordinary unrevealed current-day boundary. The current-day answer is excluded from the provisional calculation, which can change a later streak bonus; show the existing preview provisional-score notice for this case. Keep scoring of other members and the existing isolated test ranking rules unchanged. Add a full authorized future HTTP answer/result flow and denial checks, plus a score regression covering a pending current day.

## Spec Change Log

- Review found that a future result can omit a pending current-day answer and therefore display a provisional streak bonus without explanation. Specify the existing preview notice and a regression while preserving current-day privacy, isolated authorization, future replay, and existing ranking behavior. Cover the full future HTTP mutation/result path.

## Review Triage Log

- medium — Future result scoring excludes an unrevealed current-day answer, so its streak and total can change after revelation; the display needs an explicit provisional notice without leaking that answer.
- false — Isolated test ranking intentionally includes recorded scores regardless of reveal time, and privileged operators remain excluded from public entries; the other-member ranking test confirms no shared ranking change.
- low — Acknowledging the personal preview marks the result seen, consistent with existing preview and its personal progression; the result remains reachable in the calendar.
- false — Test-mode switching does not promise to erase the tester's isolated answers; shared environments are not affected.
- low — Totals include other recorded eligible answers, matching the existing personal result and preview total semantics.
- medium — The full future HTTP reserve, confirm and result sequence and unauthorized requests lack a dedicated regression; add it.
- medium — A future-to-current simulated-date transition is not covered by a targeted regression; add coverage for pending and revealed state.
- low — Text enlargement and focus restoration after replay were not measured; preserve as a verification limitation.
- medium — Edge-case review independently confirmed the provisional streak calculation described above.
- medium — Verification-gap review confirmed that controller propagation of future access across the HTTP mutation and result chain is not covered by existing automated tests.

- medium — HTTP replay propagation lacks a durable focused regression, although a manual full-stack replay passed.
- medium — Early acknowledgement authorization lacks a focused HTTP regression; verify owner, disabled mode and another member.
- low — Reload of a played future gift was not separately automated; manual revisit passed.
- low — Mode-switch race retains the existing context/epoch guard; no new demonstrated race.
- low — Existing priority-result machinery remains in place; the new case lacks a dedicated combination test.
- low — Future-to-current transition is tested on the server; an additional UI scenario would strengthen coverage.
- low — Keyboard replay focus restoration was not measured.
- low — Text enlargement was not measured.
- medium — The provisional notice should say that revealing already-recorded earlier answers can also change a streak bonus.
- medium — Verification-gap review independently identifies the missing HTTP acknowledgement regression.
- medium — Verification-gap review independently identifies the missing HTTP replay regression.

## Verification

Run focused Advent API and Angular suites, including authorization and isolated test cases. Inspect responsive and keyboard behavior, and report any accessibility checks not performed.


Verification results: API `AdventMemberGameTest` and `AdventMemberSecurityTest` passed (46 tests); Angular `advent-test.spec.ts` passed (163 tests). A 320 × 700 Chromium scenario passed with a mocked API, covering keyboard selection, answer, explanation and unchanged simulated date. An initial attempt using the Chrome extension stalled at the welcome screen; its cause remains unknown.

Full-stack verification: an offline H2 stack and Chromium at 320 × 700 exercised a seeded login, test mode, keyboard selection of future day 23, answer, immediate result, revisit, personal replay, and a second answer. Day 23 requests retained the simulated date 2026-12-01; no horizontal overflow was observed. The temporary browser script and servers were removed or stopped. The earlier Chrome extension interaction failure remains unexplained.

Review-loop verification: 47 API tests, 164 Angular tests and one mocked mobile Chromium scenario passed, including the provisional-score notice and future HTTP flow. Text enlargement and focus restoration after replay were not measured.

Final verification after review patches: 47 focused API tests, 164 Angular tests and one isolated Chromium scenario with a mocked API passed. The real-API offline H2 journey was verified before the wording-only final patch. Text enlargement and focus restoration after replay remain unmeasured.

User clarification: future gifts must open implicitly for authorized development testers without switching on test mode. The separate correction spec records the implementation and verification.

User clarification: future gifts retain their usual dark appearance while remaining clickable; day 25 opens the existing Christmas recap early for authorized development testers. The separate follow-up spec records verification.
