---
title: 'Fix unavailable poll expansion'
type: 'bugfix'
created: '2026-09-28'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** In the Dispos poll, expanding “Pas disponible” shows no participant list when explainability is enabled, unlike role choices. This hides the people who marked themselves unavailable.

**Approach:** Always render the neutral participant list for an expanded unavailable row that has respondents, without requesting or displaying draw chances.

</frozen-after-approval>

## Implementation Notes

- Kept unavailable responses out of the chance-preview path: they are availability states, not draw candidates.
- Updated `availability-poll.ts` and its focused component test; no API or style change is needed.
- Updated BUG-019 to Fixed with focused test evidence.

## Review Triage Log

- medium, patched — BUG-019 remained marked Open despite this exact correction; the registry now records the local verification and focused test evidence.
- medium, patched — the initial regression test invoked the row handler directly; it now clicks the unavailable gauge trigger, covering the reported interaction and confirming the neutral names render without a chance-summary request.
