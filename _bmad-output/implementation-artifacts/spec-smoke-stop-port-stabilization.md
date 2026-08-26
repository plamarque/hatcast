---
title: 'Stabilize human smoke port release'
type: 'bugfix'
created: '2026-08-26'
status: 'done'
baseline_commit: '7af43987c54a2f285826d46192ee0834cc5b048c'
review_loop_iteration: 0
context:
  - '{project-root}/project-context.md'
  - '{project-root}/_bmad-output/implementation-artifacts/spec-21-4-human-smoke-handoff.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** A successful human-smoke stop can persist `stopped:ports-unreleased` although its owned process group has exited and ports 8080 and 4200 become free moments later. The delivery-gate re-verification correctly rejects that failed state, so a completed browser smoke cannot progress.

**Approach:** Give the smoke controller a short, bounded settling window after verified owned-group termination. It must record `stopped` only after both reserved ports are free, while retaining the current failure result if another listener remains through the whole window.

## Boundaries & Constraints

**Always:** Stop only the controller-owned process group; preserve the existing marker and ownership checks; poll only the reserved ports 8080 and 4200 after group termination; use a bounded, positive, environment-configurable wait; retain portable non-secret state.

**Ask First:** Any change to the ports, process ownership model, smoke guide schema, integration authority, or timeout policy beyond the local bounded settling window.

**Never:** Signal a process after ownership has ceased to be demonstrable; mark a still-occupied port as free; weaken existing start-time port refusal; change E2E, human-review, delivery-gate, or Git-integration authority; alter `sprint-status.yaml`.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|---------------|---------------------------|----------------|
| Delayed release | Owned group has stopped; one or both reserved ports report unavailable for initial probes then become free within the bound | Poll until both ports are free, persist `stopped`, and emit `SMOKE_STOP=clean` | No extra signal or process inspection |
| Persistent occupation | Owned group has stopped; either reserved port remains unavailable for every probe | Persist `stopped:ports-unreleased` and refuse the clean stop | Preserve the existing semantic error |
| Unowned or stale state | Marker/group is not demonstrably owned and not verifiably absent | Do not poll as a substitute for ownership | Preserve the existing safe refusal |

</frozen-after-approval>

## Code Map

- `scripts/v2/story-human-smoke-handoff.sh` — `port_state` is the single semantic probe (lines 37–43); `stop_group` already bounds owned-group termination (220–228); `stop` currently makes the false-failure single probe at line 302.
- `scripts/v2/story-human-smoke-handoff.test.sh` — the temporary `lsof` fixture is at lines 25–27; current clean-stop proof is at lines 75–83 and needs a delayed-release case.
- `_bmad-output/implementation-artifacts/spec-21-4-human-smoke-handoff.md` — source delivery contract: clean completion remains conditional on owned-group termination and free reserved ports.
- `scripts/v2/story-delivery-gates.sh` — consumer of the resulting smoke state; read-only and out of scope for this repair.

## Tasks & Acceptance

**Execution:**
- [x] `scripts/v2/story-human-smoke-handoff.sh` — added a bounded helper that waits for both reserved ports to become free after the existing owned-group stop check, then uses it before persisting the final stop result.
- [x] `scripts/v2/story-human-smoke-handoff.test.sh` — made the fake port probe simulate release after a few stop-time probes and assert that the controller records a clean stop; retained coverage for permanent conflicts and unowned state.

**Acceptance Criteria:**
- Given the controller-owned group has exited and a reserved port is released shortly afterwards, when `stop` is requested, then it records `stopped` and prints `SMOKE_STOP=clean` without another signal.
- Given a reserved port remains occupied until the bounded wait expires, when `stop` is requested, then it retains `stopped:ports-unreleased` and refuses a clean result.
- Given an unowned or stale state, when `stop` is requested, then the new wait does not bypass the existing ownership refusal.

## Design Notes

The settling window belongs after process-group verification, not before it. It accounts only for normal OS socket-release timing and does not treat an unavailable port as safe until two explicit probes agree that both reserved listeners are absent.

## Verification

**Commands:**
- `bash scripts/v2/story-human-smoke-handoff.test.sh` — expected: delayed release, persistent conflict, ownership, and existing handoff cases pass.
- `bash -n scripts/v2/story-human-smoke-handoff.sh scripts/v2/story-human-smoke-handoff.test.sh` — expected: no shell syntax errors.
- `git diff --check` — expected: no whitespace errors.

## Suggested Review Order

**Stop lifecycle**

- Wait only after verified owned-group termination, and only for the reserved ports.
  [`story-human-smoke-handoff.sh:229`](../../scripts/v2/story-human-smoke-handoff.sh#L229)

- Preserve the existing semantic failure if the bounded wait never observes release.
  [`story-human-smoke-handoff.sh:299`](../../scripts/v2/story-human-smoke-handoff.sh#L299)

**Regression coverage**

- Make delayed port release deterministic without touching product processes.
  [`story-human-smoke-handoff.test.sh:25`](../../scripts/v2/story-human-smoke-handoff.test.sh#L25)

- Exercise delayed release for API and web ports, then retain persistent-conflict coverage.
  [`story-human-smoke-handoff.test.sh:76`](../../scripts/v2/story-human-smoke-handoff.test.sh#L76)
