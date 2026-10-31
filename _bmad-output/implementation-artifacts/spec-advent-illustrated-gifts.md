---
title: 'Illustrated Advent calendar gifts'
type: 'feature'
created: '2026-10-31'
status: 'done'
baseline_commit: '579f83e69cb6dcda13d90c0604aaa611632a1881'
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

**Problem:** The functional calendar's CSS gifts are too schematic compared with the approved illustrated Advent art direction.

**Approach:** Use cohesive illustrated bitmap gifts with distinct open and closed silhouettes, adapting their appearance to the already authorized states and preserving real, accessible numbers and indicators.

## Boundaries & Constraints

**Always:** Treat the approved gift mockup as visual reference and the UX and architecture contracts as behavioral authority. Keep the four-column calendar, Material controls, French labels, keyboard focus, touch targets, reduced motion and Advent-only styles. Use decorative assets without personal data, text or baked-in state indicators. Only apply image effects to decorative artwork, never the control, number, icon or focus. Preserve the operator close action and ensure it does not obscure a gift or its label. Keep assets reasonably optimized and transparent, with a usable fallback if an image cannot load.

**Never:** Change calendar API, account/date handling, reveal priority, or scoring. A recorded answer opens a neutral gift until the server permits revelation, then correct and incorrect are green and red with accessible non-color signs. Missed days remain closed and neutral with no missed-day label; absent content remains distinguishable. Future days, including 25, remain locked; 25 is a distinctive summary without a quiz once available. No premature correctness clues, push or deployment.

## I/O & Edge-Case Matrix

| Scenario | State | Expected behavior |
|---|---|---|
| Normal | Today or past unanswered | Closed illustrated gift; no missed-day indicator. |
| Answered | Before / after authorized reveal | Open neutral gift / open green or red gift with clear check or cross and accessible label. |
| Locked / missing | Future or no content | Dark locked gift / distinct no-content sign, without disclosing content. |
| Christmas | Before / after 25 December | Locked before its date / distinctive gift leading to summary; no quiz. |
| Accessibility | 320 px, 200% text, keyboard, image failure | Distinct shapes, readable numbers and indicators, visible focus, usable targets and fallback; no state conveyed only by color. |

</frozen-after-approval>

## Code Map

- `apps/web/public/advent/gifts/gift-closed-v1.png`, `gift-open-v1.png` — generated transparent reference assets based on the approved mockup; optimize for actual mobile use while retaining alpha. They contain no personal data.
- `apps/web/src/app/pages/advent-test/advent-test.html`, `advent-calendar.scss` — existing gift artwork, state selectors, Material controls and accessible labels. Use the existing `data-state` and `data-outcome`; retain `calendarLabel` and behavior in `advent-test.ts`.
- `apps/web/src/app/pages/advent-test/advent-test.spec.ts`, `apps/web/e2e/advent-member.spec.ts`, `apps/web/e2e/advent-isolation/advent-answer.spec.ts` — existing state, responsive, keyboard and HatCast isolation checks. Extend for asset fallback and presentation where meaningful.
- `_bmad-output/planning-artifacts/ux-designs/ux-hatcast-avent-2026-10-28/mockups/calendrier-cadeaux-proposition.png` — visual target, not a source of game rules.

## Tasks & Acceptance

**Execution:**
- [x] `apps/web/public/advent/gifts/` — prepare and optimize the illustrated open and closed gifts and any variants needed for legible state colors.
- [x] `advent-test.html`, `advent-calendar.scss` — render artwork while preserving live numbers, accessible icons, focus, operator controls, all states and a usable fallback.
- [x] `advent-test.spec.ts`, `advent-member.spec.ts`, `advent-answer.spec.ts` — verify state mapping, fallback, responsive keyboard access and isolation as appropriate.

**Acceptance Criteria:**
- Given an authorized state, when the calendar is displayed, then gift silhouette and state match the matrix without changing any server-driven behavior.
- Given keyboard navigation, enlarged text, reduced motion and an image loading failure, when a member uses the calendar, then numbers, states and controls remain legible and operable without color alone.
- Given UX-DR11 and M3-1–M3-5, when the Advent calendar is reviewed, then applicable component behavior, scoped theming, responsiveness, accessibility and French copy are satisfied or an explicit waiver is recorded, and HatCast appearance is unchanged.

## Implementation Notes

The separate user-requested Christmas Santa logo label change already exists in the working tree, including `advent-test.html` and `advent-test.scss`; preserve it.

## Spec Change Log

## Review Triage Log

- **medium — patch:** Pending artwork and incorrect artwork are both red, making pending resemble a revealed failure; use a neutral non-red treatment without changing accessible indicators.
- **medium — patch:** Pending CSS fallback also uses red; preserve a neutral fallback.
- **medium — patch:** An image hidden after a load error stays hidden if the tracked day later switches to a valid image; restore visibility on successful load and cover that transition.
- **low:** At enlarged text, the grid intentionally scrolls horizontally; the tested focused control remains visible and the screenshot shows the first gift within its cell.
- **medium — patch:** The fallback test dispatches an artificial event, leaving actual failed image requests unverified; exercise a real aborted image request.
- **medium — patch:** Existing tests do not assert the actual open and closed assets loaded successfully; assert their natural dimensions before testing fallback.
- **carried — medium:** Pending red resembles incorrect red, independently identified by the edge-case reviewer; same root cause and fix as above.
- **carried — medium:** Hidden image is not restored after a source change, independently identified by the edge-case reviewer; same root cause and fix as above.

The pre-existing 200% installation banner clipping is already recorded as BUG-054 in `ISSUES.md`.

## Verification

Run focused Angular tests, the production build, calendar browser and HatCast isolation tests. Inspect open and closed gifts and every state at actual size at 320, 375, 390 and 430 px, tablet and desktop; inspect 200% text, focus, operator close control, image fallback, contrast and reduced motion. Compare computed styles of HatCast before and after the Advent view. Record actual coverage and limitations.

Results: 86 focused Angular tests, production build and 10 Chromium member/isolation tests passed. Mobile and enlarged-text screenshots, fallback, reduced motion and operator controls were inspected; text and indicator contrast measured at least 4.92:1. The existing SCSS budget warning remains. Open and closed silhouettes remain somewhat subtle at 320 px; explicit accessible state signs are present. A full screen-reader audit was not performed.

Post-review verification: 86 Angular tests, 10 Chromium member/isolation scenarios and the production build passed after patches. The tests verify real asset loads, a network failure and recovery after a source change. The build reports an Advent SCSS budget warning of 2.12 kB.
