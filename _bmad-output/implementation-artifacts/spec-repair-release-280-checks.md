---
title: 'Repair release 2.8.0 checks'
type: 'bugfix'
created: '2026-11-07'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Release 2.8.0 is blocked by Advent radio click failures, the Advent stylesheet budget and outdated authorization test setup.

**Approach:** Repair the underlying problems while preserving the full-card interaction, access checks, visual isolation and all release gates; verify the fixes before retrying the authorized staging release.

</frozen-after-approval>

## Implementation Notes

Raised the Material radio above its card label overlay, preserving both native input clicks and the full-card target. Removed redundant and unused CSS to keep the existing production budget. Updated the event update fixture to authorize the specific principal and troupe; organizer access remains covered by EventControllerIntegrationTest. Recorded BUG-081.

The unblocked late-answer test expected a label removed by c8bf02a4; it now checks the displayed zero points instead, retaining its no-points assertion.

## Review Triage Log

- medium, patched: restricted the administrator mock to the test principal and troupe.
- false: EventControllerIntegrationTest covers organizer format access and forbidden changes and unrelated events.
- false: advent-isolation clicks the radio in six viewports, and advent-member uses a real pointer at the card edge as well as keyboard interaction.
- false: follow-up review found no concrete regression in the updated late-result assertion.
