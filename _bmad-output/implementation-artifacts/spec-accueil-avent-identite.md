---
title: 'Advent welcome identity and return'
type: 'feature'
created: '2026-11-01'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: []
---
<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The first Advent welcome does not identify La Malice or provide an obvious return to HatCast.

**Approach:** Implement the approved mobile-first mockup with centered La Malice logo, title and copy, the existing snowy primary action, and an explicit return using the existing close behavior. Keep discovery and reveal semantics unchanged.

</frozen-after-approval>

## Implementation Notes

- Updated welcome markup and isolated styles; reused close and discovery handlers.
- Updated the durable Advent design contract and existing tests.

## Review Triage Log

- Medium, fixed: prevent discovery while the return request is in progress; covered by component test.
- Low, fixed: check all requests when asserting discovery was not posted.
- Low, fixed: browser test decodes the logo and checks the return label at each responsive size.
- Verification: 117 component tests and responsive browser test passed; the latter checks 320–1280 px and 200% text.
