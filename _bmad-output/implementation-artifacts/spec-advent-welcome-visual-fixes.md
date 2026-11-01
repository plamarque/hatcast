---
title: 'Fix Advent welcome visual details'
type: 'bugfix'
created: '2026-11-01'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The Advent welcome shows an unwanted border over the snowy red CTA, a white offset above the gold panel border, and a blue outline around the focused title.

**Approach:** Correct these visual artifacts while preserving the welcome's programmatic heading focus and visible keyboard focus on interactive controls. Keep styling scoped to Advent and preserve existing behavior.

</frozen-after-approval>

## Implementation Notes

- Removed the panel's white upper shadow and the CTA border; retained its snow gradients and depth shadow.
- Suppressed the native outline only on the programmatically focused non-interactive heading; the CTA retains its focus-visible indicator.
- Restored a system-color border and heading focus outline in forced-colors mode, where backgrounds and shadows can disappear.

## Review Triage Log

- Low: A programmatically focused heading has no visible focus outline in ordinary colors. This is the requested visual correction; keyboard focus remains visible on the interactive CTA, and forced colors retain a heading outline.
- Medium, patched: Forced colors can suppress the button background and shadow; a system-color border preserves its boundary.
- Low: Automated tests do not verify the visual appearance. The existing component tests cover behavior; visual browser verification remains outstanding.
