---
title: 'BUG-031 Prevent cancel from clearing event role needs'
type: 'bugfix'
created: '2026-10-13'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context:
  - 'AGENTS.md'
  - 'docs/v2/technical/FRONTEND_UI.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The footer Cancel button in the event format-and-roles dialog closes Angular Material with an empty string. The parent treats that value as a save result and PATCHes a normalized all-zero role map, silently hiding an existing team.

**Approach:** Make cancellation return no dialog result and reject non-object results before persistence. Cover the actual Material button interaction and the parent API boundary with regression tests.

</frozen-after-approval>

## Implementation Notes

- Made the footer cancellation result explicit with `[mat-dialog-close]="undefined"`.
- Added a runtime guard in the parent so malformed dialog results cannot reach `updateEvent`.
- Added regression coverage for the real Material footer click and the parent persistence boundary.
- Targeted Angular tests passed: 42 tests across the dialog and Infos tab suites.
- Blind review found that the first runtime guard accepted arrays and incomplete objects; it was replaced with a shape guard for a known event type and every finite role count.
- Targeted Angular tests passed after review fixes: 46 tests across the dialog and Infos tab suites.

## Review Triage Log

- high — The first object-only guard accepted arrays, which could again normalize to all-zero slots; fixed by rejecting arrays and validating the exact result shape.
- high — The first guard accepted incomplete objects, which could again normalize missing slots to zero; fixed by requiring a known template type and every finite role count.
- medium — The first regression test covered only the empty-string sentinel; fixed with array, incomplete-object, and valid-save boundary cases.
