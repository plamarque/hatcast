---
title: 'Recover from transient Advent loading failures'
type: 'bugfix'
created: '2026-10-31'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** An Advent quiz intermittently appeared unavailable although its content existed. A result lookup took 40.7 seconds while the browser gives each request 10 seconds; the underlying server delay has not been established.

**Approach:** Retry a failed or timed-out read once when loading Advent data, without retrying mutations or treating authorization, conflict, missing content, or malformed responses as transient. Preserve result priority, server time, privacy, and existing failure and recovery behavior when the retry fails.

</frozen-after-approval>

## Implementation Notes

- One bounded retry for GET timeouts, network failures, interrupted response bodies and server errors; mutations and client errors are never retried.
- The original 40.7-second server delay remains unexplained; the mitigation cannot guarantee recovery from a prolonged outage.

## Review Triage Log

- Medium, patched: retry interrupted response streams while leaving invalid JSON unretried; covered by a unit test.
- Maybe-false, documented: a retry can add server load if a timed-out request continues; the logs do not establish saturation or its cause. The retry is limited to one, and sustained latency can still cause failure; operational monitoring is needed.
