---
title: 'Advent entry and waiting screen'
type: 'feature'
created: '2026-11-02'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Returning through the Advent gift opens the ranking even when today's recorded answer is waiting for revelation. Investigate automatic opening at sign-in.

**Approach:** Preserve first discovery and unseen result priority; otherwise show today's quiz or waiting countdown as appropriate, keeping Christmas and unavailable states. Verify automatic entry with an unanswered available quiz and preserve dismissal rules.

</frozen-after-approval>

## Implementation Notes

- Member entry and continuation after a reveal return to the existing waiting scene for a normal pending answer. Simulated day activation keeps its existing confirmation behavior.
- The API still controls automatic entry, dismissal and result eligibility. Existing server and shell tests cover their separate conditions; a real sign-in with an unanswered account remains unverified.
- A subsequent full-stack offline test with synthetic data verified sign-in, automatic opening, answer, exit and return by gift to the countdown, followed by replay, sign-out and another automatic entry.
- Node 26 fails the existing shell suite because localStorage is unavailable; the CI Node 20 runtime passes both targeted suites.

## Review Triage Log

- Medium, fixed: align SPEC and UX/PRD requirements with the approved entry behavior.
- Medium, fixed: focus the waiting scene after it is rendered and ensure it is still current.
- Medium, mitigated: recheck the latest unseen result after the answer read before opening the waiting scene, with a targeted test. On 2026-11-02 Patrice explicitly accepted the residual concurrency risk and declined further testing or mitigation.
- Medium, limitation: unit mocks and separate API tests do not establish the real sign-in flow; perform an isolated end-to-end test before delivery.
