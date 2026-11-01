---
title: 'Repair Advent release checks'
type: 'bugfix'
created: '2026-11-01'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
baseline_commit: '15924ec5163d24bf0f9c3ce8c005ad9301d1dea8'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The staging release is blocked by six visual-isolation tests whose synthetic discovery response is incomplete, and by a CI production-local build requiring an ignored local environment file.

**Approach:** Restore accurate synthetic test data and build the same PWA in CI using the tracked production environment. Preserve all checks and production behavior; record the observed issues and verify the focused tests, PWA and release gates.

</frozen-after-approval>

## Implementation Notes

The isolation fixture now returns a valid discovery state. The CI PWA build uses the tracked production environment; it retains the service worker, hashing and budgets without requiring the ignored local file. BUG-078 records the observed failures.

Verification: six visual-isolation browser tests passed; the tracked production build, active service-worker privacy, real PostHog payload and full-stack before/after/transition smokes passed.

## Review Triage Log

- medium — The targeted Advent CI workflow did not include the six visual-isolation scenarios; it now runs them alongside the member scenarios.
- low — The CI step and full-stack error described a production-local build after switching to the production configuration; their labels now reflect the command.
- low — The frozen intent says “same PWA”; the build options and service worker are equivalent but injected environment values may differ. The implementation notes clarify the distinction without changing approved intent.
