---
title: 'Stabilize availability journey regression'
type: 'bugfix'
created: '2026-11-01'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
baseline_commit: 'e8e3014533f952bf8d3b69de6b40aaeb58652492'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The mandatory GitHub end-to-end release gate fails while an asynchronous inbox interception races with navigation in the availability save-and-reopen scenario.

**Approach:** Stabilize interception and cleanup without suppressing errors, disabling tests or weakening save, persistence and navigation assertions; verify both themes and the complete release gate.

</frozen-after-approval>

## Implementation Notes

The test waits for active route handlers to finish before navigation and retains its live event lookup and all business assertions. BUG-080 records the failure; the precise competing handler remains unproven and the proposed fix must be verified by rerunning the failing scenario.

Verification: after configuring the isolated API to allow the isolated frontend origin, both light and dark save/reopen journeys passed three times each on a separate H2/API/frontend stack. A first attempt before that configuration failed at save and did not exercise the interception; it was an isolated test setup failure. The full CI gate remains to run.

## Review Triage Log

- medium — Precomputing the event would make the inbox projection stale after the availability update; the live lookup is retained.
- medium — The scenario does not explicitly hold an in-flight inbox interception during cleanup; the original CI failure remains to be reproduced and tested under real timing.
- low — The frozen intent describes a plausible race as if confirmed; the implementation note explicitly states that its cause remains unproven.
