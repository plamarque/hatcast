---
title: 'Private preview of long Advent anecdotes'
type: 'feature'
created: '2026-11-05'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Long anecdotes make the mobile quiz difficult to read and the current published text is incomplete.

**Approach:** Prepare an isolated, private, interactive local preview showing approved concise choices and the complete stories only after a simulated reveal, without changing the catalogue, databases, or production application.

</frozen-after-approval>

## Implementation Notes

- The current API exposes a single optional reveal explanation; a durable structured solution requires separate design and server-side privacy enforcement.
- The preview uses private files outside the repository and is not connected to HatCast.
- Verified the interactive preview at 320 and 390 CSS pixels, including answer selection, simulated reveal, and expanding the first story.

## Review Triage Log

- Medium: focus remained on a hidden confirmation button; fixed by focusing the waiting title.
- Medium: the radio group lacked an accessible question label; fixed with a labelled group.
- Low: the preview covers Véro only; this is a declared prototype boundary, not evidence about other quiz formats.
