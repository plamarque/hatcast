---
title: 'Fix private editor isolation test'
type: 'bugfix'
created: '2026-11-08'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The release gate fails because the editor isolation test hides the gift in its fixture while shared setup requires it to be visible.

**Approach:** Make image settling specific to the visual screenshot cases, preserving the private preview fixture and all isolation assertions. Verify the test and resume the authorized release gates.

</frozen-after-approval>

## Implementation Notes

- Kept image decoding and frame settling on both screenshot captures; the editor scenario instead asserts the unavailable entry stays hidden before and after editing.
- The seven isolation tests passed before the additional visibility assertions; the full release gate will verify the final change.

## Review Triage Log

- Medium, patched: explicitly assert the entry remains hidden in the editor fixture, so the test detects an accidental exposure as well as comparing styles.
