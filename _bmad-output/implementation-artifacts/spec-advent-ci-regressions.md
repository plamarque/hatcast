---
title: 'Repair Advent CI regressions'
type: 'bugfix'
created: '2026-10-31'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The API and E2E CI suites fail after the Advent delivery because their expectations no longer match the supported routes and ranking interface.

**Approach:** Diagnose and repair the failing tests while preserving meaningful security, user journey and accessibility coverage; do not alter unrelated work or reopen retired endpoints.

</frozen-after-approval>

## Implementation Notes

- Updated ranking assertions to match the current accessible layout and absence of the removed test notice.
- Migrated obsolete offline API checks to member routes, preserving membership, operator, CSRF and private-response protections; retired routes remain forbidden.
- Local browser verification uses a dedicated port to avoid another worktree's server.
- Full API suite passed before the last review refinements; the final offline integration tests passed afterward. All 13 Advent browser tests passed, and the amended three-test file passed again afterward.

## Review Triage Log

- Medium, patched: use a real offline clock with a spied instant so profile and H2 checks remain exercised.
- False: date-arrow endpoints no longer exist; the supported simulated-date header is tested for the unverified operator.
- Medium, patched: replay uses a syntactically valid token to isolate authorization from request validation.
- Medium, patched: check reserve, submit and acknowledgement for inactive, external and unrelated users as well as reconciliation.
- Medium, patched: verify that answer and explanation are absent from the quiz response.
- Low, patched: assert the exact score within the ranking entry.
- Medium, patched: verify an authorized operator's reset without CSRF is rejected.

