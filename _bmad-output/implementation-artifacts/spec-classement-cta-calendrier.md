---
title: 'Ranking calendar call to action'
type: 'feature'
created: '2026-10-31'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

Replace the bottom return button on the Advent ranking with a large, centered red button labeled “Voir le calendrier” that opens the calendar.

</frozen-after-approval>

## Implementation Notes

- Reused the Advent Material filled-button color and calendar navigation. Added an accessible error message when calendar loading fails from the ranking.
- Verified 89 Advent component tests, including navigation and failure handling.

## Review Triage Log

- Medium, fixed: calendar loading failures could be invisible from the ranking when no quiz was loaded; the ranking now displays an alert.
