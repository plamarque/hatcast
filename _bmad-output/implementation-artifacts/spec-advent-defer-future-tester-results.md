---
title: 'Defer future gift results for development testers'
type: 'feature'
created: '2026-11-04'
status: 'done'
baseline_commit: 'caec5b7e7bf2f3ff698cd17d26a9905ea44d78d4'
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

**Problem:** An authorized development tester who answers a future gift sees confirmation followed by the result immediately, making the journey unlike ordinary member play.

**Approach:** Keep direct access to future gifts but show a neutral confirmation after an answer and reveal its result at midnight Europe/Paris following the gift’s calendar day, even if the answer was submitted earlier (for example, a day-23 gift reveals on 24 December). In explicitly activated test mode, advancing the simulated date to the day after the gift must reveal the result through the existing priority flow. This revises the immediate-reveal decision for development test access. Preserve the distinct, already authorized production preview and the ordinary member rules.

## Boundaries & Constraints

**Always:** Enforce the result boundary on the server, not only in the UI. Until revelation, do not return correctness, explanation, score or an equivalent indicator via future-result, history, calendar or acknowledgement APIs. Keep active membership, verified development tester authorization, private answers, no-store, implicit future gift access, and existing test controls. Handle retries, revisit, session changes and clock crossings safely. Preserve member-only and production access restrictions, Advent visual isolation and day 25 recap. Keep any already-recorded answer and seen state intact; do not reset or migrate data.

**Never:** Alter the personal production preview, reveal unrevealed answers to ordinary members, change shared clocks, erase answers, deploy or synchronize catalogue data.

## I/O & Edge-Case Matrix

| Scenario | Input / state | Expected behavior |
|---|---|---|
| Future answer | Authorized development tester opens and answers a future gift | Confirmation persists; result stays private until its reveal boundary. |
| Revisit or reload | Future answer recorded, before reveal | Show neutral recorded/waiting state; no correctness or misleading countdown. |
| Boundary | Effective server date reaches reveal, including by advancing the test-mode simulated date | The personal result becomes available and priority routing follows existing rules. |
| Mode and identity | Ordinary member, development test controls off/on, account switch | Server enforces applicable eligibility and secrecy; no stale private display. |
| Production preview | Authorized private production preview | Existing immediate personal preview remains unchanged. |
| Historical data | Answers already acknowledged by the former early preview | Preserve existing data and accurately report any limitation in resurfacing those results. |

</frozen-after-approval>

## Code Map

- `services/api/src/main/kotlin/com/hatcast/api/advent/AdventMemberGame.kt` — `testFuture` currently combines early play and disclosure in `result`, `resultAt`, `history`, `calendarAt`, `acknowledge`; split capability from disclosure and keep production `preview` separate. `latestUnseen` already uses `reveal_at`.
- `AdventMemberController.kt` — `canControl` supplies server-verified isolated tester capability; preserve its security and existing explicit mode control guards.
- `apps/web/src/app/pages/advent-test/advent-test.ts` / `.html` — `selectedFutureTestDay` invokes immediate personal result; waiting countdown currently assumes the selected day is the effective current day. Avoid falsely claiming the next midnight reveals a more distant gift.
- `AdventMemberGameTest.kt`, `AdventMemberSecurityTest.kt`, `advent-test.spec.ts`, `apps/web/e2e/advent-member.spec.ts` — add meaningful boundary, denial, clock transition and UI scenarios with synthetic data.
- `SPEC.md`, `DOMAIN.md`, `ARCH.md` and Advent DESIGN/EXPERIENCE/architecture — reconcile approved development exception and preserve production preview semantics.

## Tasks & Acceptance

**Execution:**
- [x] Separate early gift play from result disclosure and retain authorized personal answer/replay semantics.
- [x] Show neutral confirmation and correct delayed revisit/reveal behavior, preserving async/session guards.
- [x] Add API, UI and browser checks for the matrix and all relevant boundary/privacy paths.
- [x] Update the relevant product and Advent contracts and record the reported behavior factually in `ISSUES.md`.

**Acceptance Criteria:**
- Given an authorized development tester, when they answer a future quiz, then confirmation remains visible without any result disclosure before the selected reveal boundary.
- Given a boundary crossing, when the personal result becomes revealable, then the existing priority and result flow is applied.
- Given an ordinary member or production-preview user, when playing under their existing rules, then their existing respective reveal and authorization behavior is unchanged.

## Implementation Notes

The existing isolated test ranking intentionally includes all recorded answers; it may imply scores before reveal. Do not silently claim full protection from this existing test-only behavior. Inspect and report it while keeping ordinary ranking secrecy. No existing answers may be altered.

## Spec Change Log

## Review Triage Log

- medium — Broad documentation wording can obscure the known test-ranking score clue; clarify that the detailed result is protected while explicitly enabled test ranking can expose points.
- false — `SPEC.md` already explicitly states that the test ranking includes pending answers; ordinary ranking alone uses revealable scores.
- medium — The new real-midnight waiting branch lacked a deterministic intermediate-midnight test; add one.
- false — The existing `rechecks the server clock on resume` test exercises visibility restoration through the shared waiting listener.
- false — Existing waiting-generation cancellation and identity-context tests prevent stale displays; the new branch retains those guards.
- false — The existing `recovers a result already acknowledged on another device` test exercises the shared fallback.
- false — Existing priority-result tests cover selection of the latest eligible result through the shared server path.
- low — Full-stack real-midnight crossing was not performed; the API Paris boundary, simulated full-stack journey and deterministic client clock test cover its components. The full deployment clock remains outside this local verification.
- low — Complete screen-reader and reduced-motion audits were not performed; mobile layout and keyboard interaction were checked as documented.
- medium — Verification-gap review independently confirmed that the new intermediate-midnight timer needed a focused test.

## Verification

Run focused Advent API, Angular and browser tests with synthetic fixtures. Verify both sides of the chosen Paris-time boundary and real offline UI with a separate synthetic account or disposable fixture, without changing the user's existing answers. Report accessibility and any existing test-ranking limitations.


### Local verification evidence

- `cd services/api && ./gradlew test --tests '*AdventMemberGameTest' --tests '*AdventMemberSecurityTest'`: 48 passed, no skips. Synthetic historical answer with `seen_at` predating the fix remains unchanged and non-priority; at 22:59:59 UTC on 2 December its result is unavailable and calendar pending, and at 23:00:00 UTC it is available in history with the original answer ID and seen timestamp. API tests also cover authorization and production preview.
- `npm test -w @hatcast/web -- --watch=false --include='**/advent-test.spec.ts'`: 166 passed, including neutral future waiting without a misleading countdown.
- `npm run test:e2e -w @hatcast/web -- advent-member.spec.ts --grep 'authorized future gift works'`: 1 passed, Chromium mobile, synthetic API responses. `npm run test:e2e -w @hatcast/web -- advent-member.spec.ts --grep 'future answer reveals only'`: 1 passed, synthetic responses; neutral on simulated gift day and priority reveal the following day.
- Separate offline H2 database and API copy under `/private/tmp/hatcast-advent-disposable`, front on port 28192, API on 28191, seed account `patrice@seed.improbots.test`: headless browser recorded future day 2, displayed neutral confirmation, kept it hidden on simulated day 2, and revealed it on simulated day 3. No horizontal overflow at 320 px. The two temporary processes were stopped; the pre-existing 4200/8080 stack was left running. This is not a complete accessibility or service-worker audit.
- Test-only ranking intentionally includes unrevealed scores and can therefore provide an indirect clue; ordinary ranking continues to use revealable scores. Previously seen results do not reappear as unseen priority results.
- `git diff --check`: passed.

Final review verification: 48 targeted API tests passed in the preceding run; 167 Angular tests and two synthetic mobile Chromium scenarios passed after review fixes. A separate full-stack H2 browser run covered simulated date advance without touching the existing user database. The explicitly enabled test ranking still includes unrevealed scores.

Human acceptance: Patrice confirmed on his phone that the delayed-result flow works and approved local closure on 2026-11-05.
