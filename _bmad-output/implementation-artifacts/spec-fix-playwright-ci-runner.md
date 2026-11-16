---
title: 'Restore Playwright CI runner compatibility'
type: 'bugfix'
created: '2026-11-16'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

Restore the release CI checks blocked by Playwright Chromium installation on Ubuntu 26.04, using a compatible runner for affected browser jobs while preserving all tests and deployment gates.

</frozen-after-approval>

## Implementation Notes

- Pin all four Chromium-installing jobs to Ubuntu 24.04. The release smoke and Advent browser checks failed on the Ubuntu 26.04 runner before test execution; the staging and migration gates use the same install command.
- Independent review found no substantive defect; GitHub Actions execution is required to verify the runner fix.
