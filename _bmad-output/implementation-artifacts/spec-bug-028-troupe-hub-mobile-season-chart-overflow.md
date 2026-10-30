---
title: 'Fix mobile troupe hub season chart overflow'
type: 'bugfix'
created: '2026-09-29'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
baseline_commit: '92fbf1f302736122148b3d3cc94197571751c7ae'
context:
  - '{project-root}/docs/v2/technical/FRONTEND_UI.md'
  - '{project-root}/_bmad-output/planning-artifacts/ux-design-hub-mini-chart-17-44.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** On the mobile troupe hub at `/troupes/la-malice`, the season mini-chart can place its month columns vertically, extending beneath the viewport and appearing to run behind the member bottom navigation. This prevents the collective season overview from being read or reached as designed.

**Approach:** Restore the approved shared monthly-chart layout structure in the troupe hub, retain the existing touch-friendly horizontal scroll inside the card, and prove on a narrow mobile viewport that content remains accessible above the fixed navigation.

## Boundaries & Constraints

**Always:** Preserve MT15 semantics: past events only, threshold of three events, per-month vertical event blocks, existing tooltip/navigation behavior, Material 3 tokens, and the mobile-first chart scroll defined by MC10. Keep the member shell's safe-area reservation intact and verify it rather than changing it without evidence.

**Never:** Change chart data shaping, event API contracts, season selection, bottom-navigation dimensions/positioning, or introduce a page-level horizontal overflow workaround.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|---------------|---------------------------|----------------|
| Mobile chart | Selected season has at least three past events | Month columns share a horizontal timeline; per-month event blocks remain vertically stacked and the card scrolls horizontally only when needed | Existing loading/error/under-threshold hiding remains unchanged |
| Mobile reachability | Hub has chart CTA and fixed bottom navigation | After document scroll, the CTA can be brought fully above the navigation and activated | No navigation-shell change unless the check disproves its existing reserved space |

</frozen-after-approval>

## Code Map

- `apps/web/src/app/pages/troupe-hub/troupe-hub.html` -- renders chart months directly below the chart container; must reuse the shared timeline/months hierarchy.
- `apps/web/src/app/shared/member-profile/member-profile-panel.html` -- canonical chart markup: timeline wrapper owns `width: max-content`; months wrapper is the horizontal flex row.
- `apps/web/src/app/shared/participation-monthly-chart/_hatcast-participation-monthly-chart.scss` -- shared, token-based layout and in-card horizontal scrolling; do not duplicate or alter without new evidence.
- `apps/web/src/app/pages/troupe-hub/troupe-hub.spec.ts` -- focused unit coverage for chart rendering and structural regression assertion.
- `apps/web/e2e/e1/member-troupe-hub.mobile.spec.ts` and `apps/web/e2e/helpers/troupe-hub.ui.ts` -- existing E1 mobile chart gate; extend with narrow-viewport geometry and fixed-nav reachability checks.
- `apps/web/src/app/layout/member-shell/member-shell.scss` and `apps/web/src/app/shared/member-nav/member-nav.scss` -- verified non-cause: mobile content bottom padding reserves fixed-nav height; keep unchanged unless E2E proves otherwise.
- `ISSUES.md` -- factual BUG-028 registry entry.

## Tasks & Acceptance

**Execution:**
- [x] `ISSUES.md` -- record BUG-028 with observed behavior, expected behavior, source cause, and Android/narrow-viewport reproduction.
- [x] `apps/web/src/app/pages/troupe-hub/troupe-hub.html` -- wrap the existing month loop in the shared chart timeline and horizontal months row; retain all current chart blocks, labels, ARIA labels, and interactions.
- [x] `apps/web/src/app/pages/troupe-hub/troupe-hub.spec.ts` -- assert the rendered hub chart uses the canonical wrappers and that month nodes are their direct children.
- [x] `apps/web/e2e/helpers/troupe-hub.ui.ts` and `apps/web/e2e/e1/member-troupe-hub.mobile.spec.ts` -- extend E1-MEM-046 with mobile geometry proving month columns are lateral, chart overflow is internal rather than page-wide, and the stats CTA can clear the member navigation after scroll.

**Acceptance Criteria:**
- Given a mobile viewport and a season meeting the mini-chart threshold, when the hub renders, then distinct months occupy a horizontal row within the chart and events in one month remain vertically stacked.
- Given chart width exceeds its card, when a user swipes horizontally, then only the chart card scrolls and the document has no horizontal overflow.
- Given the fixed member navigation is present, when the user scrolls to the chart CTA, then it is visible and actionable above the navigation.
- Given fewer than three past events, loading statistics, or a statistics error, when the hub renders, then the existing chart visibility behavior is unchanged.

## Implementation Notes

- Reused the shared `member-profile` timeline/months hierarchy; no chart CSS, data, API, or member-navigation code changed.
- Added DOM structure coverage and extended E1-MEM-046 with computed mobile layout, internal scroll, and CTA-versus-fixed-nav geometry checks.
- Focused unit suite initially failed before executing tests because this environment did not expose Node localStorage. It passed with an isolated temporary `--localstorage-file`; this is an environment bootstrap issue, not a changed-test failure.

## Spec Change Log

## Review Triage Log

| Reviewer finding | Verdict | Evidence and disposition |
|---|---|---|
| Blind hunter: a one-month chart bypasses lateral-layout proof | medium | Real: the former `positions.length < 2` branch passed without testing the defect. The E1 helper now requires at least two month columns and checks their labels share a baseline with strictly increasing horizontal positions. Patched. |
| Blind hunter: a wrapped layout could satisfy one later-x check | medium | Real: a single later x-coordinate did not rule out wrapping. The revised E1 assertion checks every successive column and the common label baseline. Patched. |
| Blind hunter: internal scrolling was conditional on incidental fixture width | medium | Real: five fixture months can fit Pixel 5. The E1 helper now forces a minimal timeline overflow, requires `scrollWidth > clientWidth`, and proves a non-zero card `scrollLeft`. Patched. |
| Blind hunter: CTA geometry did not prove activation | medium | Real: bounding-box reachability alone cannot detect an intercepting overlay. E1-MEM-046 now clicks the CTA after its fixed-nav clearance check and verifies the season stats URL. Patched. |
| Blind hunter: wrapper unit test could accept an empty months node | low | Real as regression coverage: it did not count direct month children. The unit test now asserts all three fixture months are direct children. Patched. |
| Edge-case hunter: fewer than two month columns could hide a vertical stack | medium | Carried duplicate of the blind-hunter first finding; fixed by the same required two-column and baseline/x geometry assertions. |
| Edge-case hunter: visible CTA might remain non-actionable | medium | Carried duplicate of the blind-hunter CTA finding; fixed by the same click and destination assertion. |
| Verification-gap reviewer: overflow branch was not deterministic | medium | Carried duplicate of the blind-hunter scrolling finding; fixed by forced minimal chart overflow and `scrollLeft` proof in the Pixel 5 E1 test. |

## Design Notes

The shared chart stylesheet only applies its horizontal flex layout to `.member-profile__chart-months`, within a `.member-profile__chart-timeline` whose width is content-sized. The hub currently omits both nodes, so direct month `div`s follow normal block flow. Reusing the canonical markup fixes the root cause without competing page CSS or a bottom-navigation patch.

## Verification

**Commands:**
- `npm test -- --watch=false --include='src/app/pages/troupe-hub/troupe-hub.spec.ts'` (from `apps/web`) -- expected: focused hub unit suite passes.
- `npm run test:e2e -- e2e/e1/member-troupe-hub.mobile.spec.ts --project=e1-mobile-member --grep='E1-MEM-046'` (from `apps/web`) -- expected: mobile local gate passes with chart geometry, no page overflow, and CTA reachability. Staging execution additionally needs its credential and member-slug environment.
- `npm run build` (from `apps/web`) -- expected: production Angular build succeeds.

**Manual checks:**
- On an Android-width viewport at `/troupes/la-malice`, inspect the season card: months run left-to-right, horizontal overflow is contained by the card, and the last actionable content is not hidden by the bottom navigation.
