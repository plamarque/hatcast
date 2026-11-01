---
title: 'Clarify simulated date and continuation'
type: 'bugfix'
created: '2026-10-31'
status: 'done'
baseline_commit: '886f2f728599272dcf5e7dc84048ae78be8002c0'
route: 'oneshot'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The reveal shows the answered quiz's date without showing the current simulated day, making the test journey confusing. Patrice reports that Continue appears to advance a day.

**Approach:** Show the current shared simulated day between the test arrows, distinct from the quiz date. After the 8 December reveal on simulated 9 December, Continue must open the 9 December elf without advancing the clock. Preserve the server clock refresh for concurrent testers, the 25 December behavior, privacy, accessible controls and the Advent visual isolation contract. Verify the 8-to-9 scenario, no clock-advance mutation from Continue, narrow layouts, keyboard and screen-reader labels. Record the reported ambiguity in ISSUES.md.

</frozen-after-approval>

## Implementation Notes

Show the simulated day in the development test controls with a full accessible label, while retaining the answered quiz date in the reveal. Continue reads the current shared clock and does not advance it; the 8-to-9 path is covered by unit and browser checks. The controls wrap at large text sizes. Verification: 40 Angular tests, 3 Chromium tests and frontend build passed; existing Sass and CSS budget warnings remain. Visual check at 320 px passed. Real screen-reader announcement remains unverified.

## Review Triage Log

- **Low — patched:** A bare number can be ambiguous, so the visible value also says “déc.” while retaining the full accessible label.
- **Maybe-false — deferred:** Announcement of a changing labelled live region varies by screen reader; a real-device screen-reader check would settle it.
- **Low — accepted:** Another tester may move the shared clock while the screen is idle; Continue refreshes the authoritative date and arrows refresh when used. Continuous synchronization is not required by the current contract.
- **Medium — patched:** The exact 8-to-9 journey needed browser interaction coverage in addition to the unit test; the narrow-screen browser scenario now exercises it.
