---
title: 'Improve Advent loading'
type: 'feature'
created: '2026-10-31'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

Shorten the wait for the Advent elf where possible and bring the loading state into the existing Advent visual identity. Preserve reveal priority, privacy, and accessible feedback.

</frozen-after-approval>

## Implementation Notes

Read quiz content and answer state concurrently after priority reveal checks. Show an Advent-themed, non-animated status while waiting.

## Review Triage Log

- Medium, deferred: when the quiz is missing and the answer-state read stalls, the missing-content message waits for that read; safe early cancellation requires separate request cancellation handling.
- Medium, fixed: a session reset during simultaneous reads is now surfaced as an error, including when content is missing.
- Medium, fixed: a test verifies both reads start together and covers a simultaneous missing quiz and reset.
