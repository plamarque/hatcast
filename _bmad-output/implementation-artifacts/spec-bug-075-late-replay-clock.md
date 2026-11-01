---
title: 'Fix late replay on simulated quiz day'
type: 'bugfix'
created: '2026-11-01'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** An operator who deletes a late answer after returning the simulated clock to that quiz's date cannot replay it: the persisted late replay marker and date checks conflict.

**Approach:** Allow only the authorized late replay on its own simulated day without converting it into scored participation or exposing the answer before the reveal; preserve normal late-play and production rules.

</frozen-after-approval>

## Implementation Notes

- Development read-only inspection confirmed the December 1 replay marker retained `late=true`; only the operator's December 1 and 2 answers were erased through the personal controls. Other members' responses were not reset.
- Server permits an existing authorized late replay on its own simulated day while retaining `late=true`, zero points, and reveal timing. Client displays the zero-point warning and neutral confirmation before reveal.
- AdventMemberGameTest and AdventMemberSecurityTest passed; 119 targeted Angular tests and the production web build passed. Existing Sass and CSS budget warnings remain.

## Review Triage Log

- Medium, patched: early late replay was incorrectly marked seen; it now remains unseen until revelation and has a regression assertion.
- Medium, patched: focus was lost after neutral confirmation; focus returns to the recorded status with context guard.
- Medium, patched: the zero-point nature of this replay was not communicated; the server reports its late generation and the client displays an appropriate warning.
