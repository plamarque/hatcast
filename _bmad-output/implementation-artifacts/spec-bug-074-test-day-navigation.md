---
title: 'Fix Advent test day navigation'
type: 'bugfix'
created: '2026-11-01'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** In development, navigating back to an answered simulated day opens the ranking and hides the date arrows, blocking straightforward quiz navigation.

**Approach:** Keep the tester on the selected day's appropriate state during simulated day changes and retries, preserve unseen-result priority and calendar navigation, and leave ordinary member entry unchanged.

</frozen-after-approval>

## Implementation Notes

- Reproduced on development in Chrome: moving back from December 3 to an answered December 2 opened the ranking, hiding day controls. The arrows and retry now select the day's state; continuing after a result does so in test mode as well.
- Verified 117 component tests and the production web build; existing Sass deprecation and CSS budget warnings remain. Live verification of this further correction is pending.

## Review Triage Log

- Medium, patched: continuation after a result also opened the ranking on an answered test day; changed and covered.
- Low, rejected: revealed-day path uses the unchanged `selectDay` result logic already covered by existing tests; the new navigation tests verify it reaches that logic.
- False: existing previous-day priority-revelation test exercises `latest-unseen` before the selected day's state.
- Low, patched: added a test that changing date from the calendar leaves it open.
