---
title: "Show the highest-priority assigned role"
type: bugfix
created: 2026-11-21
status: in-review
route: oneshot
review_loop_iteration: 0
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

When a member has multiple roles, show the assigned role that comes first in the existing draw priority order in the shared participant summary. Assistant referee takes precedence over volunteer. Preserve existing decline, visibility and participation-status behavior. Verify the shared consumers and mobile agenda.

</frozen-after-approval>

## Implementation Notes

- Reuse `RoleKeys.PRIORITY_ORDER` for assigned slots; retain the existing decline ordering and visibility checks. The summary is shared by agenda, inbox and season lists.
- Integration coverage: two confirmed assignments select assistant referee; 19 participation regression tests pass. Mobile visual check remains outstanding.

## Review Triage Log

- Medium, fixed: move the functional test out of the performance-tagged suite.
- Medium, fixed: reproduce confirmed assignments and assert the returned status.
