---
title: 'Restore Advent production build'
type: 'bugfix'
created: '2026-11-08'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The production PWA build fails because the compiled Advent component stylesheet exceeds its existing 12 kB budget.

**Approach:** Reduce the stylesheet size without raising the budget or changing the Advent presentation, and verify the production build and relevant regression checks.

</frozen-after-approval>

## Implementation Notes

- Moved the waiting-screen rules unchanged into a separate stylesheet at the same cascade position; retained the existing budgets. Production build passed at 11.25 kB.

## Review Triage Log

- Medium, patched: BUG-076 did not distinguish the previous fix from the renewed CI failure; its note now records both the failure and the verified 11.25 kB build.
