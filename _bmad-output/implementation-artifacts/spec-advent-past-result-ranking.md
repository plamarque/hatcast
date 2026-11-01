---
title: 'Ranking action on past Advent results'
type: 'feature'
created: '2026-11-01'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Past Advent results offer no prominent action to continue after reading either a correct or incorrect result.

**Approach:** Add a “Voir le classement” button to both past-result outcomes, preserving the existing priority-reveal continuation and ranking navigation safeguards.

</frozen-after-approval>

## Implementation Notes

- Reused the existing historical-result ranking navigation and Advent Material button styling. Added tests for both outcomes and late answers; all 108 Advent component tests pass.

## Review Triage Log

- Low, deferred: existing ranking navigation clears a historical result before a failed request; the calendar and its ranking control remain available, but the result must be reopened.
- False: priority-reveal handling is already covered by existing ranking tests, and the new button calls the same navigation path.
