---
title: 'Stabilize Advent isolation image capture'
type: 'bugfix'
created: '2026-11-08'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The release E2E gate intermittently compares the Advent gift before its raster image is stable, producing a false visual isolation failure.

**Approach:** Wait for the visible gift image to load and decode before both home captures, retaining strict before/after visual assertions. Verify and resume the authorized RC2 promotion.

</frozen-after-approval>

## Implementation Notes

- Wait for the visible gift image to decode and two animation frames before both captures.
- Repeated all six viewport comparisons three times: 18 passed.

## Review Triage Log

- Low: a controlled decoding-delay test could prove the race directly; repeated end-to-end captures exercise the actual visual invariant, while the exact root cause remains unproven. A test solely mirroring the wait was not added.
