---
title: 'Fix Advent test-mode entry'
type: 'bugfix'
created: '2026-11-01'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Activating test mode on December 1 can open the ranking instead of the current day's gift, recorded confirmation, or eligible result.

**Approach:** Restore the appropriate day state in test mode, preserving unseen-result priority, privacy, and normal member behavior. Verify the transition and recorded-answer cases without changing stored data.

</frozen-after-approval>

## Implementation Notes

- Activation selects the simulated day's recorded confirmation instead of restoring calendar or ranking; normal member entry and mode deactivation retain their behavior. Unseen results remain first.
- Updated the Advent experience contract and BUG-074. Component suite: 112 passed. Production web build passed outside the sandbox, with existing Sass and CSS budget warnings. No live development verification.
- Deployed `b9c14575` to development revision `hatcast-v2-dev-00258-2lg`; Patrice confirmed the fix works on 2026-11-01. BUG-074 is closed.

## Review Triage Log

- Medium, patched: controls revoked during activation could apply test-day entry to member mode; condition on confirmed test mode and test it.
- False for this change: a later ordinary `start()` retains existing entry semantics; `retryEntry()` uses the simulated date directly when available. The requested correction targets activation, not every subsequent visit.
- Low, patched: available-answer activation already had a test; added an assertion that it sends no answer mutation.
