---
title: 'Clarify the Advent ranking'
type: 'feature'
created: '2026-10-31'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Feedback finds the ranking unfriendly and its participation-point explanation ambiguous.

**Approach:** Make tied ranks explicit and clarify that submitting an answer earns one participation point regardless of correctness. Preserve the approved scoring, rank calculation and disclosure rules.

</frozen-after-approval>

## Implementation Notes

- Clarified scoring and reveal timing; identified ties in the ranking without changing rank calculation.
- Updated heading assertions and added a tie rendering test.

## Review Triage Log

- Medium, patched: production reveal timing could leave members wondering where their point went.
- Medium, patched: the tie rule needed a concrete example.
- Medium, patched: added coverage of tied and unique ranks; the existing template preserves the separate unranked summary.
