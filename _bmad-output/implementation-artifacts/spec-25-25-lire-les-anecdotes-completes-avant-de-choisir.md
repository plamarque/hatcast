---
title: 'Read full Advent anecdotes before answering'
type: 'feature'
created: '2026-11-07'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
baseline_commit: '7a45d6f406c5dab56b29a2cc422c34c35b544b04'
context:
  - '{project-root}/docs/v2/technical/FRONTEND_UI.md'
  - '{project-root}/_bmad-output/planning-artifacts/ux-designs/ux-hatcast-avent-2026-10-28/DESIGN.md'
  - '{project-root}/_bmad-output/planning-artifacts/ux-designs/ux-hatcast-avent-2026-10-28/EXPERIENCE.md'
  - '{project-root}/_bmad-output/planning-artifacts/architecture/architecture-hatcast-avent-2026-10-29/ARCHITECTURE-SPINE.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Short quiz choices hide information contributors supplied in longer accounts until after the member has answered.

**Approach:** Keep three selectable short choices and allow members to read each available complete account before choosing; retain the existing reminder in the revealed result. A choice without an account remains playable on its own.

## Boundaries & Constraints

**Always:** Preserve exact narrative paragraphs, Unicode, ordering and choice association; opening or closing a story must not select or change an answer. Preserve reveal timing, scoring, explanation, past and late results, replay and navigation. Server authorization, active membership, Paris time, preview and isolated test boundaries, account isolation and private no-store handling remain authoritative. Only the authorized playable quiz may expose its stories before reveal; correct choice, correctness, points, explanation and revealing metadata remain secret. Preserve Advent's isolated visual identity and accessible Material behavior.

**Never:** Expose future or forbidden content, change real contributions or synchronize cloud data, migrate databases, reset game state, publish private content, push or deploy as part of implementation. Do not fabricate missing stories or nest interactive controls.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected behavior |
|----------|---------------|-------------------|
| Playable quiz | Three short choices, some multiline stories | Each available story opens independently and completely under its matching choice; selection remains unchanged and editable until confirmation |
| Older or partial quiz | All or some stories absent | Three short choices remain selectable; no empty reading action or placeholder |
| Forbidden request | Unauthenticated, nonmember, locked future day or invalid mode | Existing denial and no protected story, answer or revealing metadata |
| Authorized paths | Member, isolated test, authorized preview or development early opening | Same ordered optional stories only under the existing access rules; private no-store responses |
| Reveal and waiting | Submitted pending answer or authorized revealed result | No early answer, explanation or points; result retains its existing complete-story reminder and navigation |
| Narrow or enlarged UI | 320px viewport, 200% text, keyboard | Readable paragraphs, no clipping or horizontal overflow, independent accessible controls and usable focus |

</frozen-after-approval>

## Code Map

- `services/api/src/main/kotlin/com/hatcast/api/advent/AdventMemberController.kt` and `AdventTestController.kt` — playable `FictionalQuiz` projections; extend only authorized paths while retaining checks and avoiding incidental exposure through history or waiting.
- `services/api/src/main/kotlin/com/hatcast/api/advent/AdventTestAnswers.kt` and `AdventMemberGame.kt` — ordered `story_0..2` storage and `revealedStories`; reuse safely, preserving nulls, with no false choice or explanation in the playable projection.
- `services/api/src/test/kotlin/com/hatcast/api/advent/AdventMemberSecurityTest.kt`, `AdventOfflineIntegrationTest.kt`, `AdventTestIntegrationTest.kt` and `AdventMemberGameTest.kt` — HTTP authorization, mode, reveal and no-store coverage; use fictional data.
- `apps/web/src/app/pages/advent-test/advent-test.ts`, `advent-test.html`, `advent-test.scss`, `advent-result.scss` — `FictionalQuiz`, radio group and existing result expansion panels. Material expansion is available; preserve independent radio semantics and scoped styles, including multiline rendering.
- `apps/web/src/app/pages/advent-test/advent-test.spec.ts` and `apps/web/e2e/advent-member.spec.ts` — extend synthetic tests and mocked browser journey; distinguish mock UI evidence from real API security.
- `SPEC.md`, `docs/v2/technical/AVENT_CATALOGUE.md`, Advent `DESIGN.md`, `EXPERIENCE.md`, and `ARCHITECTURE-SPINE.md` — amend the explicitly superseded reveal-only story contract, preserving all other restrictions. `spec-25-22-advent-long-stories.md` is historical and remains unchanged.

## Tasks & Acceptance

**Execution:**
- [x] `AdventMemberController.kt`, `AdventTestController.kt`, `AdventTestAnswers.kt` and `AdventMemberGame.kt` — expose optional ordered narratives in authorized playable projections only, preserving all privacy boundaries and compatibility.
- [x] `AdventMemberSecurityTest.kt`, `AdventOfflineIntegrationTest.kt`, `AdventTestIntegrationTest.kt` and relevant game tests — verify the matrix with fictional full, partial and absent stories, denied requests, no-store, mode boundaries and no correctness leakage.
- [x] `advent-test.ts`, `advent-test.html`, `advent-test.scss` and `advent-result.scss` — implement independently operable story reading alongside the short radio choices and retain result reminder.
- [x] `advent-test.spec.ts` and `advent-member.spec.ts` — cover matching, multiline, absence, independent selection and keyboard/mobile interaction; inspect visual isolation and enlarged text.
- [x] `SPEC.md`, `AVENT_CATALOGUE.md`, Advent `DESIGN.md`, `EXPERIENCE.md` and `ARCHITECTURE-SPINE.md` — align the durable contracts with the approved product change.
- [x] Run targeted API and Angular suites with nonzero selection, appropriate build and browser checks; perform the Material checklist and document any exceptions.

**Acceptance Criteria:**
- Given a playable quiz, when the member reads any supplied account and answers, then all three choices remain available and the selected choice changes only through the answer control.
- Given a member without access, when they request a quiz or its content, then the server discloses no protected narrative; authorized play never discloses answer correctness or pending points.
- Given a revealed result, when it is opened, then existing result details and available full-story reminders remain intact.

## Implementation Notes

## Spec Change Log

## Review Triage Log

- maybe-false: Expansion buttons are inside the radiogroup but outside each radio; keyboard tests pass. Assistive-technology announcement requires a real screen-reader check.
- low: Quiz and stories use separate queries; a concurrent content edit can mismatch them. The existing catalogue procedure explicitly forbids editing a quiz during play and accepts exceptional inconsistency.
- low: Earlier contributor narratives may contain direct answer clues. Review the private content before release; this implementation must not read or modify the cloud catalogue.
- medium: Arrow navigation was untested; added and passed in Playwright.
- medium: Independent concurrent opening and closing were untested; added and passed in Angular.
- medium: A long choice at narrow width was untested; added and passed at 320px and enlarged text.
- low: Denial tests do not compare every possible private marker; real HTTP tests cover denied bodies, no-store and individual sensitive fields. Broader private-content audit remains useful before release.
- low: Browser tests mock the API; real HTTP tests and browser tests cover the contract separately. A combined real-stack journey remains unverified.
- maybe-false: No physical screen-reader run; actual announcements and navigation require assistive-technology testing.
- medium: Third story content association lacked a test; added and passed in Angular.

## Verification

- Run the applicable Advent API tests through `services/api/gradlew` and the targeted Angular suite from `apps/web` with `npm test -- --watch=false --include='**/advent-test.spec.ts'`; confirm tests actually run.
- Run relevant browser coverage with fictional content; check 320px, 200% text, keyboard/focus, touch targets at least 44px, reduced motion and no HatCast style leakage. Record mocked versus real API evidence and the FRONTEND_UI checklist.

### Evidence — 7 November 2026

- Isolated dependencies prepared with `bash scripts/v2/story-worktree-runtime.sh prepare` (`READINESS=ready`). API: `cd services/api && ./gradlew test --tests '*AdventMemberSecurityTest' --tests '*AdventOfflineIntegrationTest' --tests '*AdventTestIntegrationTest' --tests '*AdventMemberGameTest'`: 55 passed. MockMvc exercises real authorization and no-store, ordered partial Unicode stories, preview, development early opening, test mode and denied bodies.
- `cd apps/web && npm test -- --watch=false --include='**/advent-test.spec.ts'`: 225 passed; `npm run build`: passed with existing Sass deprecation and SCSS budget warnings.
- `cd apps/web && PLAYWRIGHT_REUSE_SERVERS=0 npx playwright test e2e/advent-member.spec.ts --project=chromium-advent-answer --grep 'member confirmation and ranking remain neutral and accessible'`: passed with fictional mocked API. Keyboard opening/closing and radio selection, 320px, 200% text, reduced motion, story header touch target, no overflow and multiline text checked; screenshot inspected. `--grep 'Christmas podium remains usable at narrow width'`: passed, including calculated HatCast button styles before and after entering Advent. These browser tests do not establish real API security.
- Material checklist: Material expansion panels and radios, separately operable controls, scoped Advent styles and tokens, French labels, keyboard focus, narrow layout and reduced motion checked. Header minimum 3rem (48px at default size); no story-specific waiver. Existing Advent colour/type exception in FRONTEND_UI applies. Screen-reader and physical touch-device testing were not performed.
