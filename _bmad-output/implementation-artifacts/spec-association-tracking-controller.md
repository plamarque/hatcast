---
title: 'Recognize association stories in tracking'
type: 'bugfix'
created: '2026-10-27'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The additive story status controller cannot find the association epic and its ASCII branch keys do not match the planner's accented, truncated tracking keys.

**Approach:** Recognize both existing epic formats and the association epic file, resolve branch keys against planner-compatible keys without changing existing tracker entries, reject ambiguous definitions, and preserve the additive controller's historical data guarantees.

</frozen-after-approval>

## Implementation Notes

- Implemented in the isolated association-tracking worktree. The original epic file retains its historical ASCII keys; the association file follows the sprint planner's Unicode and 60-character slug rules. Tracker additions remain additive.
- Existing controller and worktree lifecycle tests pass; new fixtures cover association stories, long keys, fenced examples and normalized collisions.

## Review Triage Log

- Medium, fixed: historical long keys retain their original untruncated controller form; regression fixture added.
- Low, fixed: epic numbers now require a delimiter to avoid interpreting a story-like heading as an epic.
- Medium, fixed: a fenced block only closes on a valid closing marker without trailing text; regression fixture added.
