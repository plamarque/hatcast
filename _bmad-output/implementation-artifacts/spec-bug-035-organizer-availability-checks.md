---
title: 'BUG-035 organizer subject-switch regression test'
type: 'bugfix'
created: '2026-10-17'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** BUG-035 is reported from a replay, but the existing organizer-subject tests only switch to an unanswered participant. They cannot establish whether a saved availability is lost when the organizer selects another participant.

**Approach:** Add a focused component regression test that switches an organizer to a participant whose summary already records availability and role keys, then asserts that the rendered role checkbox is checked without a new API write.

</frozen-after-approval>

## Implementation Notes

- Added a focused `EventDisposTab` regression test. It loads Alex as `available` with `player` already saved, switches the organizer's subject to Alex, and asserts the `player` poll row receives `checked = true` without calling the proxy write API.
- Kept production behavior unchanged; the test isolates the reported rendering contract in the current checkout.
- Strengthened the regression after review: it drives the subject selector's public output, verifies two saved roles and one unsaved role, verifies neither availability write endpoint is called, and types the summary fixture as `EventAvailabilitySummary`.

## Review Triage Log

- patched — The first test version invoked the tab handler directly. It now emits `AvailabilitySubjectSelector.selectedParticipantIdChange`, exercising the parent binding used by the organiser selector.
- patched — One saved role was insufficient to prove role restoration. The fixture now saves `player` and `mc`, and asserts that an unsaved `dj` remains unchecked.
- patched — Subject switching must be read-only. The regression now asserts both proxy and self availability write spies remain untouched.
- patched — The configurable summary fixture was `unknown`. It is now typed as `EventAvailabilitySummary`, preventing malformed API fixtures from silently weakening the regression.
