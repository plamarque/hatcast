---
title: 'Direct Advent preview replay action'
type: 'feature'
created: '2026-11-07'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

Replace the preview action heading and overflow menu with a directly visible “Effacer ma réponse et rejouer” button, and remove the explanatory preview notice above it. Preserve the existing confirmation and personal replay authorization.

</frozen-after-approval>

## Implementation Notes

- Direct Material button retains confirmation and keyboard focus restoration; preview copy removed.
- Updated Advent design contracts and targeted unit and browser coverage.

## Review Triage Log

- Medium: narrow and enlarged text could be clipped by shared control styles; isolated replay styles and visually checked browser capture.
- Low: private-preview reset absence assertion was removed; restored coverage.
- Low: disabled color overridden by shared controls; replay now uses isolated styles and Material disabled colors.
- Medium: viewport bounds alone do not establish readability; added bounds check and inspected the rendered capture.
