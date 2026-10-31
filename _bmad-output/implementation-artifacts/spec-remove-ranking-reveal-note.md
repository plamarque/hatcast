---
title: 'Remove ranking reveal note'
type: 'chore'
created: '2026-10-31'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

Remove the sentence about points appearing after the next-day reveal from the normal-mode Advent ranking screen. Preserve the ranking and scoring behavior.

</frozen-after-approval>

## Implementation Notes

Removed the normal-mode paragraph and its unused style. Ranking data and score calculation remain unchanged.

## Review Triage Log

- Low: no dedicated member-mode regression test asserts the removed copy; the isolated deletion is directly verifiable and a new test would add little value for this copy-only change.
