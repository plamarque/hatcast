---
title: 'Restore offline Advent test access'
type: 'bugfix'
created: '2026-10-30'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Valid offline seed accounts cannot access the isolated Advent quiz because their synthetic identity has an unverified email.

**Approach:** Mark an authenticated synthetic seed identity as verified only after its local seed account and password have been validated; retain the existing checks for real identity providers, membership and allowlists. Verify access through the actual offline session and Advent routes.

</frozen-after-approval>

## Implementation Notes

Validated seed credentials now produce a verified synthetic identity; real identity provider results remain unchanged. Offline sign-in, Advent read and CSRF-protected reconciliation passed through the Tailscale proxy without recording an answer.

## Review Triage Log

- **Addressed — verification:** Verified the actual offline seed session and Advent routes through Tailscale, and added regression tests for valid and invalid seed credentials and an unverified provider identity.
