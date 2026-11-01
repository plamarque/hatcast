---
title: 'Refine the Advent art direction'
type: 'feature'
created: '2026-11-01'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
baseline_commit: '6a28ed87179bc37894bcdd4f2192b7427a490e95'
context:
  - '_bmad-output/implementation-artifacts/epic-25-context.md'
  - '_bmad-output/planning-artifacts/ux-designs/ux-hatcast-avent-2026-10-28/DESIGN.md'
  - '_bmad-output/planning-artifacts/ux-designs/ux-hatcast-avent-2026-10-28/EXPERIENCE.md'
  - '_bmad-output/planning-artifacts/architecture/architecture-hatcast-avent-2026-10-29/ARCHITECTURE-SPINE.md'
  - 'docs/v2/technical/FRONTEND_UI.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The real Advent screens do not yet convey the illustrated, expressive Christmas world of the approved board and confirmation reference.

**Approach:** Audit the existing screens against both references, build a cohesive Advent visual foundation and apply it to existing states using illustrated scenery, frosted buttons, warm panels and appropriate character moods. Demonstrate the real journey and record remaining visual gaps.

## Boundaries & Constraints

**Always:** Preserve all existing quiz, reveal, scoring, calendar, entry and test-mode behavior. Keep unrevealed content, personal portraits and contributions private. Scope graphics, typography, component styles and animation to Advent under AD-7. Use real HTML text and controls over decorative art. Prioritize large legible text and generous touch targets; retain existing keyboard, focus and reduced-motion behavior when compatible. Test reader use and a numerical contrast threshold are not mandatory gates for this visual work, as directed by Patrice; visually check text and states for readability. Preserve completed story history.

**Never:** Add functionality suggested only by the images, expose private images as public assets, change HatCast's global visual system, alter production data, deploy, or imply a visual check has passed without evidence.

## I/O & Edge-Case Matrix

| Scenario | State | Expected behavior |
|---|---|---|
| Question and confirmation | Available, selected, submitting, recorded or uncertain | Readable choices and controls; confirmation remains neutral and reveals neither answer nor points. |
| Result | Correct, incorrect, historical or late | Distinct festive or encouraging mood; preserve timing, points, history and celebration rules. |
| Navigation | Calendar, ranking, Christmas, unavailable, loading or error | Apply the same visual family without changing permissions, ordering or recovery. |
| Responsive | Small screens, enlarged text and long real content | Text stays legible, controls remain large and content can scroll without horizontal loss. |
| Portraits | Personalized, missing or unauthorized | Preserve protected delivery and recognizable identity; decorative mood assets contain no private portrait. |

</frozen-after-approval>

## Code Map

- `apps/web/src/app/pages/advent-test/advent-test.html` and `advent-test.ts` — existing state branches, interactions, authorized portrait and reveal flows; preserve logic and accessible semantics.
- `advent-test.scss`, `advent-result.scss`, `advent-calendar.scss`, `advent-ranking.scss` — existing visual treatments for journey, results, gifts and ranking; coordinate rather than duplicating rules.
- `apps/web/src/app/shared/advent/_foundation.scss` — scoped visual roles, typography, panels and scenery; extend without leaking to HatCast.
- `apps/web/public/advent/` — current generic gifts, Santa and logo; add only non-sensitive reusable artwork, preserving private portrait delivery.
- Advent DESIGN and EXPERIENCE files, board and confirmation reference — approved art direction and behavior; record the refined visual language and testing decision.
- `apps/web/src/app/pages/advent-test/advent-test.spec.ts`, `apps/web/e2e/advent-member.spec.ts` and existing Advent isolation tests — reuse for behavior, privacy and regressions.

## Tasks & Acceptance

**Execution:**
- [x] Capture the actual available journey with isolated fictional data and compare representative states against both reference images; document verified gaps.
- [x] Create and evaluate a cohesive set of non-sensitive decorative assets and character moods aligned with the board; inventory personalized portrait constraints and avoid claiming unavailable variants.
- [x] Update scoped Advent foundation, components and actual screen states, keeping Material controls and existing behavior.
- [x] Amend Advent UX contracts and story evidence to reflect the visual decisions and Patrice's testing priorities.
- [x] Run focused component/build and relevant real-browser journey checks, record a demonstration and inspect mobile, tablet and desktop layouts, enlarged text and HatCast isolation.

### Review Findings

- [x] [Review][Patch] Restore a visible keyboard focus indicator on the ranking heading [apps/web/src/app/pages/advent-test/advent-ranking.scss:5] — Opening the ranking moves focus to its heading, whose outline is now removed.
- [x] [Review][Patch] Prevent CTA text from overlapping the arrow at 320 px with 200% text [apps/web/src/app/pages/advent-test/advent-illustrated.scss:41] — verified on confirmation and result after adapting arrow placement.
- [x] [Review][Verified] Enlarged date and portrait badge do not overlap on confirmation or result at 320 px and 200% text [apps/web/src/app/pages/advent-test/advent-illustrated.scss:80].

Rejected:
- The keyboard return test removed in this diff exercised a Return control absent already at the baseline; no removal of that navigation behavior was established.
- The visible and accessible discovery labels differed already at the baseline; this is not a new regression in the reviewed change.
- The generic village behind the image is a fallback; the supplied personalized portraits contain their own scenes, so it does not show the same backdrop for every portrait.
- The absent portrait handling on the question was already present at baseline; the API supplies a generic fallback for a missing image.
- The audit records what was inspected, and the user reviewed the demonstration; a permanent video link was not specified as a story requirement.
- The assertion that long labels overlap is not established by the absence of a bounding-box test alone; the specific possible overlap is retained above as unverified.

**Acceptance Criteria:**
- Given the approved references, when the existing Advent states are presented, then their snowy buttons, illustrations, backgrounds, panels and moods form a coherent, substantially closer visual family.
- Given an answer before or after revelation, when navigating the experience, then the existing confidentiality, result, scoring and calendar rules remain unchanged.
- Given long text at 320, 375, 390 and 430 CSS pixels, when navigating, then content remains readable and touch controls usable without horizontal loss.
- Given a non-Advent HatCast screen, when comparing before and after, then the visual theme and computed styles remain unaffected.

## Implementation Notes

- Before/after comparison is recorded in `25-8-visual-audit.md`. The live offline demonstration uses seed data; error and absence were simulated in an isolated browser test.
- New illustrations are generic and contain no individual portrait. Personal portraits remain delivered by the authorized API and appear as a badge on confirmation and when available on results; no new personalized facial variants were generated.
- Five WebP assets total approximately 1.4 MiB; styles are isolated to the Advent component. The app-wide theme is unchanged.
- Verification: Angular component tests 100/100; production web build passes with existing Sass and CSS budget warnings. Playwright: 13/14 in the broad run; the remaining keyboard case passed in isolation after correcting its test-only zoom cleanup. The missing/error browser test passed separately. Six non-Advent home isolation comparisons passed from 320 through 1280 px. The real offline demonstration covered discovery, question, confirmation, incorrect reveal and calendar; Christmas was captured with the simulated clock. Correct reveal was captured with a fictional browser fixture.
- Screen-reader testing and a numerical contrast audit were explicitly waived. Physical devices were not tested. Visual quality still requires human judgment against the approved references.

## Spec Change Log

## Review Triage Log

## Verification

Post-integration verification: 106 Advent component tests passed; the production build passed with existing CSS budget warnings; 10 isolated Advent browser tests passed after the simulated-day toolbar was made flexible at 200% text size.


Run the relevant Advent Angular tests, production web build and selected isolated E2E cases for answer secrecy, reveal and calendar. Compare real screenshots with the visual references, record the demonstration, check responsive layouts and reduced motion, and report exact coverage and remaining limitations. Screen-reader and numerical contrast tests are explicitly waived for this work.
