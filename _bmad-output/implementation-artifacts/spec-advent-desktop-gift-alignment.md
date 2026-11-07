---
title: 'Fix Advent desktop gift alignment'
type: 'bugfix'
created: '2026-11-07'
status: 'in-review'
route: 'oneshot'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The Advent gift shortcut is partly outside the desktop navigation rail.

**Approach:** Center the shortcut within the desktop rail while preserving the mobile shortcut and its behavior.

</frozen-after-approval>

## Implementation Notes

- Reset the mobile top and inline-end offsets on the desktop shortcut in `member-shell.scss`.
- Center the 40px image within the 48px Material button: its 8px padding otherwise offsets the overflowing image by 4px.
- Record the reported defect as BUG-107; leave mobile positioning and navigation behavior unchanged.
- Chromium verified desktop and mobile bounding boxes against the compiled component styles. The member navigation suite passed; the member shell suite failed because `localStorage` was undefined in its test environment.
- The actual desktop application screenshot was validated by the user. Mobile human verification remains pending.

## Review Triage Log

- Low: No permanent browser regression test for the offsets. A focused Chromium geometry check passed for both desktop and mobile; adding a new browser test for this two-property correction is deferred.
