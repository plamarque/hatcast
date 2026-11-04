---
title: 'Preserve future gift appearance and open Christmas'
type: 'feature'
created: '2026-11-04'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context:
  - 'docs/v2/technical/FRONTEND_UI.md'
  - '_bmad-output/planning-artifacts/ux-designs/ux-hatcast-avent-2026-10-28/DESIGN.md'
  - '_bmad-output/planning-artifacts/ux-designs/ux-hatcast-avent-2026-10-28/EXPERIENCE.md'
  - '_bmad-output/planning-artifacts/architecture/architecture-hatcast-avent-2026-10-29/ARCHITECTURE-SPINE.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

Authorized development testers can click future gifts without activating test mode or changing their normal future appearance. The 25th is also clickable and opens the existing Christmas recap, not a quiz. Preserve personal outcomes, the actual and simulated clocks, server-side authorization, ordinary-member and production restrictions and the existing test data. Do not add a preview label. Before the 25th, any displayed score must not be represented as final. This changes the earlier 25.19 decision to keep the 25 locked; the existing production preview code currently also locks it and must not be changed by this development-only request.

</frozen-after-approval>

## Implementation Notes

Keep the existing future gift darkening independent from click authorization; do not mislabel an available button as locked. `calendarAt` controls whether day 25 projects `christmas` for an authorized development operator. The Angular Christmas scene currently requires the clock to reach 25 December, so add a scoped view state that is cleared on navigation and session transitions. Use the existing ranking and priority-result guards and preserve no-store privacy. Verify rendering and interaction, authorization for ordinary and production users, mobile and keyboard, existing mode controls, and no data or clock mutation. Update the relevant Advent contracts to record the development exception.

The calendar retains future darkening with a separate attribute, independent of the button's accessibility. Day 25 is projected as Christmas only for isolated development operators, and the recap uses the existing current score. The Christmas heading receives keyboard focus. A missing priority result leaves the calendar available for retry.

Verification: 47 focused API tests and 165 Angular tests passed. A real offline H2 browser session at 390 × 844, with test mode off, verified that day 2 and day 25 were enabled and darkened, and that keyboard activation of day 25 opened the Christmas scene with the current score. No quiz answer was submitted.

## Review Triage Log

- false — Played gifts intentionally retain their personal outcome colors; darkening applies to unopened future gifts and preserves the approved result legend.
- medium — Opening Christmas did not move keyboard focus; the heading now receives focus.
- medium — An unavailable priority result could leave the calendar without an actionable failure; the existing retry error is now shown.
- medium — The initial component test did not exercise the actual calendar API; a real offline browser verification covered the authorized no-mode journey. Ordinary and production denial are covered by the focused API suite.
- low — The future CSS filter was duplicated and its actual appearance unverified; removed the duplicate and checked computed styles for days 2 and 25 in the real browser.
