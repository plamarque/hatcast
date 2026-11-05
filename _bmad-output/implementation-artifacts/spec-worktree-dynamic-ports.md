---
title: 'Isolated worktree local stacks'
type: 'feature'
created: '2026-11-03'
status: 'done'
route: 'dispatch'
baseline_commit: 'd3570cc435ee97b3f72983614b6c8a0988cea6d8'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Parallel local HatCast worktrees contend for fixed front and API ports, delaying human testing and causing incorrect proxy or CORS configuration.

**Approach:** Assign each worktree a reusable, replaceable port pair and launch independently configured local stacks, including phone access via explicit-port Tailscale HTTPS.

## Boundaries & Constraints

**Always:** Reserve on story lifecycle start and for existing worktrees on demand; retain a reservation while the worktree exists even if its stack stops. Recheck actual port availability on start and atomically assign a new pair if either is occupied by a foreign process. Keep a shared ignored registry and ignored per-worktree metadata sufficient to rebuild it safely if deleted. Serialize concurrent allocations; never reserve an already reserved or actually occupied port. Expose clear commands and actual URLs. Enable offline seed login through the correct dynamically configured front, proxy and CORS, including on Tailscale. Remove only resources proven owned by this stack. Preserve the explicit distinction between local closure and push/deployment.

**Never:** Kill an unknown process, overwrite another worktree's assignment or Serve route, expose secrets, silently accept ambiguous/corrupt state, or break independent fixed-port E2E contracts. A reservation coordinates HatCast worktrees; it cannot guarantee a port remains free against unrelated applications.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Parallel assignment | Multiple worktrees reserve concurrently | Distinct pairs, no cross-port collision | Fail closed if lock or state invalid |
| Restart | Stack stopped but worktree exists | Same available pair reused | Replace if a third party occupied it |
| Occupied reservation | Either reserved port used by a foreign listener | Assign new free pair and update metadata and registry | Never signal foreign process |
| Registry deleted | Valid per-worktree metadata exists | Reconstruct assignments under lock | Reject duplicates or invalid metadata |
| Local closure | Owned stack stopped and worktree removed | Reservation becomes reusable | Do not remove another stack or route |
| Offline phone | Independent offline stack and Tailscale available | Explicit-port HTTPS URL, seed login and API proxy work | Explain unavailable Tailscale, no false success |

</frozen-after-approval>

## Code Map

- `scripts/v2/story-branch.sh` — two successful start paths; merge retains unit, integrate performs push and cleanup. Do not invoke push implicitly.
- `scripts/v2/story-worktree-runtime.sh` — read-only inspection and preparation currently check fixed E2E ports; preserve independent E2E readiness guarantees and distinguish local-stack reservation.
- `scripts/start-dev.sh` — fixed front/API ports, proxy, offline CORS, Tailscale Serve and owned cleanup; both ng serve and static push mode must use assigned ports.
- `apps/web/proxy.conf.json`, `apps/web/scripts/serve-dist-https.mjs`, `services/api/src/main/resources/application-offline.yml`, `SecurityConfig.kt` — propagate proxy, front/API ports and permitted origins without exposing secrets.
- `scripts/v2/story-human-smoke-handoff.sh` and tests — currently store fixed ports, URL and ownership checks; preserve verified ownership and compatibility, adapt if necessary.
- `scripts/run_e2e.sh` — separate fixed-port E2E contract; do not silently change.
- `DEVELOPMENT.md`, `AGENTS.md`, lifecycle guidance — document assignment, replacement, cleanup, and phone access.

## Tasks & Acceptance

**Execution:**
- [x] `scripts/v2/` — implement a concurrency-safe reconstructible assignment controller and lifecycle integration; add meaningful isolated tests.
- [x] `scripts/start-dev.sh`, web proxy/static server and API configuration — use assigned ports and correct origins, with safe route and process ownership.
- [x] `scripts/v2/story-worktree-runtime.sh` and human-smoke controller — keep readiness and ownership truthful for their respective ports; update tests.
- [x] `DEVELOPMENT.md` and repository workflow guidance — document actual commands, reservation lifecycle and limitations.

**Acceptance Criteria:**
- Given two worktrees, when both launch offline stacks, then both front-to-API paths use their own configuration and seed authentication succeeds.
- Given an unavailable reserved port, when the worktree starts, then it obtains and records a new available pair without affecting the listener.
- Given a phone in the tailnet, when explicit-port HTTPS is enabled, then the URL identifies the correct worktree and cleanup leaves other Serve routes intact.
- Given the shared registry is deleted, when allocation resumes, then active worktree reservations are reconstructed without collisions.

## Implementation Notes

Implemented in an isolated worktree. Two simultaneous offline stacks were exercised with distinct ports and seed sessions; a real Tailscale route was created, served a page and removed, preserving the existing route. The reservation, runtime, lifecycle, smoke, signal and Tailscale controller tests passed. Proxy and Serve lifecycle integration tests use controlled fake services. On 2026-11-04 the user confirmed on a phone that both Tailscale links opened, both logins succeeded, and the first session remained connected after signing into the second. The conditional Tailscale LocalAPI integration currently supports the macOS system-extension transport only.

## Spec Change Log

## Review Triage Log

## Verification

- Run focused registry, lifecycle, runtime and human-smoke tests, plus appropriate stack integration tests; record failures and limitations.
- Check two real local stacks and front/API identity where feasible; do not claim real-phone validation without user evidence.
