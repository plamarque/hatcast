---
title: 'Clarify private Advent preview replay'
type: 'bugfix'
created: '2026-11-02'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The private preview replay menu is difficult to identify, and replay briefly reports a reload failure while the request is still pending.

**Approach:** Give the preview action menu a visible, accessible label and show the reload failure only after an actual failure, preserving retry and personal replay isolation.

</frozen-after-approval>

## Implementation Notes

- The preview menu has a visible label, separate from development test controls. Loading and failure have distinct states; a failed content read retains a retry action. Identity changes clear both states.
- Angular component tests cover a delayed read, actual failure and retry. The browser journey uses synthetic API responses.

## Review Triage Log

- Medium, fixed: identity changes during a pending read could leave the loading state visible; both replay states now reset with the identity.
- Medium, fixed: a retry retained the failure message during its pending read; retry now displays loading and retains failure if it fails again.
