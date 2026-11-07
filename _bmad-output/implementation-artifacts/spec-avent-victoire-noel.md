---
title: 'Celebrate the Advent winner at Christmas'
type: 'feature'
created: '2026-11-02'
status: 'in-review'
baseline_commit: '5d8bc04a6625ba8ab9c33d6b4920c1d4f5b70030'
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

**Problem:** The Christmas summary treats the winner like every other participant and does not celebrate their achievement.

**Approach:** Present the approved festive Christmas scene with a crown for the winner, adapt the message for a shared win, and present a welcoming score summary for everyone else. Keep La Malice branding and the two requested actions.

## Boundaries & Constraints

**Always:** Preserve the existing Santa and decorative La Malice gift, Advent identity, privacy, server-authoritative final ranking, priority reveal, clock and isolation boundaries. Use the approved mockups as visual targets, not as screenshots containing UI text. Display a real accessible score and actual Material buttons. Identify winners using the highest positive score among eligible ranking entries and the current member's matching entry, including all tied leaders despite lowest-position tie ranks. Excluded accounts never win. The zero-score presentation must not claim participation. Keep the calendar accessible through existing navigation. Use the existing close flow for returning to HatCast. Reconcile UX and functional contracts with the approved variants. Preserve existing test and ordinary modes and handle loading, failure, stale account, and mode transitions safely. Honor reduced motion and mobile, zoom, keyboard and contrast requirements; avoid affecting non-Advent pages.

**Never:** Reveal pending results; modify scores, answers, ranking rules or global HatCast theme; infer victory from rank 1; persist a fictional or stale ranking; publish, deploy or modify unrelated work.

**Approved test preview:** In isolated authorized test mode, offer four selectable Christmas outcomes (sole winner, shared winner, non-winner, zero points). Each preview uses the actual member Christmas screen, presentation logic, components, copy and actions; only its ranking data is fictional. Label the preview in the existing test chrome, outside the member scene. Keep it ephemeral, discard it on leaving or context changes, and never expose it in production.

**Approved rank adjustment:** For non-winners with a positive score and a server rank, present their rank and tie status in a cream and gold medallion, followed by the score and thanks. Excluded members receive thanks without a rank; zero points receives neither. Victory messages remain unchanged. Offer a tied non-winner test preview using the same real summary.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected behavior | Error handling |
|---|---|---|---|
| Sole winner | Eligible member has unique highest positive final score | Crown, « Bravo, tu remportes le quiz de l’Avent ! », score and holiday message. | Preserve priority reveal and retry on ranking failure. |
| Shared first | Eligible member shares highest positive score | Same crown and « Bravo, tu remportes le quiz de l’Avent ex æquo ! ». | Use scores, not numeric rank. |
| Other participant | Positive score without winning, including excluded accounts | Star, « Bravo pour ta participation ! », score and holiday message. | Do not claim victory. |
| Zero score | No scored participation, including all members tied at zero | Star, 0 point and holiday message, without a participation claim or winner. | Do not infer participation from late unscored answers. |
| Isolated test preview | Tester selects an outcome | Render the actual member summary with fictional ranking input and a test-chrome indicator. | Exclude production and clear on leaving or changing context. |
| Context changes | Account, test mode or simulated time changes | Discard old Christmas outcome and only show authorized current data. | Keep existing reload and retry behavior. |

</frozen-after-approval>

## Code Map

- `apps/web/src/app/pages/advent-test/advent-test.ts` — `AdventRanking`, `loadChristmasScore`, context transitions, `closeExperience`, and priority lookup; the ranking response already contains the score, roster and `mine` flag.
- `apps/web/src/app/pages/advent-test/advent-test.html` and `advent-*.scss` — existing Santa, logo, Advent header, Material buttons and mobile-scoped styling; reuse these and add a Christmas-specific layout.
- `services/api/src/main/kotlin/com/hatcast/api/advent/AdventTestAnswers.kt` — ranking calculator includes excluded members only in personal score; tied ranks use the last position. Do not change the API contract unless investigation proves necessary.
- `apps/web/src/app/pages/advent-test/advent-test.spec.ts` and `apps/web/e2e/advent-member.spec.ts` — existing Christmas, priority and ranking cases; use realistic isolated fixtures.
- Advent UX contracts and `SPEC.md` — record the approved user-visible variations and navigation.

## Tasks & Acceptance

**Execution:**
- [x] `advent-test.ts`, `advent-test.html` and tests — expose isolated previews that drive the real summary using transient fictional ranking inputs.
- [x] UX contracts and `SPEC.md` — record the approved visual and behavior variants, including scores, tied winners and excluded accounts.
- [x] `advent-test.ts`, `advent-test.html`, Advent SCSS — implement the Christmas outcome and responsive design using the authorized ranking response; retain reveal priority, session guards and retry.
- [x] Advent focused tests and browser checks — cover every matrix outcome, priority and transitions; inspect mobile and desktop visual treatment and accessibility.

**Acceptance Criteria:**
- Given the final ranking is available, when Christmas is shown, then the appropriate variant displays its score and holiday message, with La Malice branding and both requested actions.
- Given the 24th result is unseen, when Christmas is entered, then that result remains prior to the summary and ranking.
- Given small screens, keyboard navigation, zoom or reduced motion, when the summary is used, then the content and controls remain readable and operable without changing other HatCast screens.

## Implementation Notes

Christmas summaries and isolated previews use the same rendering and ranking projection. Focused Christmas tests: 29 passed after the rank adjustment. Browser fixture exercised all four test-menu options and rendered winner, shared winner, participant and zero-score member views. Production build passed. The broader Advent suite previously reported one existing private-preview assertion failure, reproduced on the baseline. Visual inspection used mocked responses, not a real device.

## Spec Change Log

## Review Triage Log

- medium — Late ranking response during navigation: loading is retained and stale contexts are rejected; regression tests added.
- medium — Unrelated loading icon styling changed accidentally: restored.
- medium — Return button interaction was untested: targeted test added.
- low — Logo header retains welcome navigation and its accessible name; preserve existing header behavior.
- low — Score is visually prominent in the personal summary; test fixture screenshots inspected.
- false — Priority revelation retains the selected preview by design and remains explicitly marked in test chrome until continuation.
- medium — Browser fixture checks verify the four member variants and test-menu choices; keyboard and zoom remain for human verification.

## Verification

Run focused Angular tests and production build; exercise mobile and desktop Christmas variants with isolated fixtures, inspect visual layout and keyboard/zoom behavior, and check the Advent exception and Material 3 checklist. Report any unverified human or real-device checks.
