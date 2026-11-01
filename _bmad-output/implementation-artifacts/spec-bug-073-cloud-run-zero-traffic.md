---
title: 'Accept inactive Cloud Run traffic statuses'
type: 'bugfix'
created: '2026-11-01'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The Advent catalogue operator refuses all environments when Cloud Run includes an inactive traffic status alongside the single revision serving all traffic.

**Approach:** Accept unambiguous inactive statuses while maintaining the existing active revision, environment isolation, and concurrency checks; test both target and other services and reject ambiguous or split traffic.

</frozen-after-approval>

## Implementation Notes

- Verified tagged revisions against their owning environment and rechecked service etags; preserved distinct database and exclusive active-traffic checks.
- Targeted Node tests and live production readiness check passed.

## Review Triage Log

- Medium, patched: recheck all other service etags at the end of verification.
- Low, rejected: tagged checks share one implementation across environments; existing tests also cover staging and production bindings.
- Medium, patched: test tagged pooler aliases and distinct database names.
- Medium, patched: test an etag change while reading a tagged revision.
