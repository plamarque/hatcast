---
title: 'Preserve team member names on mobile'
type: 'bugfix'
created: '2026-10-14'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** On narrow mobile screens, the fixed-width role pill in the Équipe slot row leaves too little room for the assigned person’s name, so names are clipped or invisible.

**Approach:** Keep the complete role label at wider widths, but at the mobile breakpoint render the same role control as its existing emoji only, so the name remains the row’s readable priority.

</frozen-after-approval>

## Implementation Notes

- Reduced only the mobile role-grid column and visually collapsed the existing role chip label; desktop and tablet keep the complete role wording.
- Recorded the reported defect as BUG-032 in the issue registry. The interactive role-pool chip already supplies a full French accessible label.
- Review correction: retain the role wording in the accessibility tree with visually-hidden text, and make the mobile role-pool trigger at least 44 by 44 px.

## Review Triage Log

- medium — Fixed: hiding the only textual role label would remove it from the accessibility tree for non-interactive chips; the label is now visually hidden instead.
- medium — Fixed: the mobile role-pool chip could be 44 by 36 px; it now has a 2.75rem minimum height and width.
- low — Rejected: a unit assertion cannot exercise this media-query-only layout without coupling tests to implementation CSS. The targeted component suite and production build compile the changed stylesheet; a narrow-device visual smoke remains the appropriate user-facing check.
