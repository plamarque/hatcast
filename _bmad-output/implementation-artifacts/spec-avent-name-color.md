---
title: 'Advent character name color'
type: 'chore'
created: '2026-11-09'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Character names in the Advent quiz and history titles do not use the red already used in the discovery title.

**Approach:** Apply the existing Advent name style to the character name in both titles, preserving their text and behavior.

</frozen-after-approval>

## Implementation Notes

- Reused the scoped `advent__name` class in the quiz and history headings. The history heading preserves the existing French possessive wording.
- Verified the quiz heading and history variants for consonants, vowels and the generic elf; the Advent test suite passed.

## Review Triage Log

- Medium: The history title's wording and highlighting needed coverage for possessive variants. Added focused rendering assertions.
