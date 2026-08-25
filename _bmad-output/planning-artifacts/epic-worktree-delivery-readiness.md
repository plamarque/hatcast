---
title: 'Epic — Worktree delivery readiness'
status: review-required
created: '2026-08-25'
type: workflow
source: 'PERF-03 delivery retrospective'
---

# Epic — Worktree delivery readiness

## Goal and execution boundary

Make a manually delivered BMad story verifiable from its isolated unit worktree before a human is asked to approve integration. This is a developer-workflow epic; it does not alter HatCast product behaviour.

The existing Git contract remains authoritative: clean `v2` integration worktree, adjacent `feat/{story-key}` unit, explicit human review, then the explicit `story-branch.sh integrate` command. A Loop confirmation does not prove that approval and must not replace it.

## Observed baseline

- Bootstrap provisions only the pinned BMad runtime, not npm dependencies, Playwright Chromium, JDK, ports, or a worktree `.env`.
- `run_e2e.sh` is the isolated E2E entrypoint: it needs dependencies, JDK and Chromium, and reserves 8080/4200 for Spring `e2e` + H2 and Angular. `start-dev.sh` is not an E2E server.
- `start-dev.sh` loads only `<worktree>/.env`, uses 8080/4200, exposes `https://localhost:4200`, and owns its normal cleanup. It has no env-file or port-selection contract and produces no smoke handoff.
- Loop 0.11.1 exposes `validate --json`, `run --dry-run`, `status --json`, `decisions --list --json`, and `confirm --reverify`; it has no declared DSL for E2E discovery, coverage waivers, or smoke evidence.
- The current local Loop preflight is red: effective policy selects Claude, but only Codex hooks are versioned. The ignored policy is absent. This is a prerequisite, not an assumption this epic may silently repair.

## Human decision gate D0 — required before queue activation

The operator selects the Loop adapter locally before queue activation. The remaining choices are deliberate story-level gates: they are made when the first story that needs them is ready, not before 21-1 can be dispatched.

1. **Loop adapter and policy:** selected CLI/profile, reproducible local policy location, and green `bmad-loop validate --project . --json` evidence. No secret is permitted in policy, hook config, output, or logs.
2. **Story 21-2:** choose environment handoff, dependency action, and port strategy. It must reference existing local values without copying, tracking, printing, or serialising them; downloads remain separately confirmed.
3. **Story 21-3:** choose waiver authority, required fields, and expiry.
4. **Story 21-4:** choose the short guide schema (route, account/fixture reference, actions, expected observations, E2E result, URL, and stop command).

## Ordered stories and dependencies

| Order | Proposed key | Story outcome | Depends on | Gate before done |
| --- | --- | --- | --- | --- |
| 1 | `21-1-loop-readiness-contract` | Align the selected Loop adapter/policy and define non-secret readiness/evidence schemas. | D0 adapter choice | `validate --json` green; `run --dry-run` sees a numeric story key. |
| 2 | `21-2-worktree-runtime-readiness` | Inspect readiness and perform only human-confirmed dependency preparation; preserve worktree and secret boundaries. | 21-1; D0 env/dependency/port choices | Black-box tests cover missing dependency, denied download, port conflict, and no secret/path persistence. |
| 3 | `21-3-targeted-e2e-evidence` | Discover applicable Playwright coverage, run it after readiness, and record an attested result. | 21-2; D0 waiver policy | Targeted E2E passes, or a documented equivalent/approved waiver exists. |
| 4 | `21-4-human-smoke-handoff` | Start the selected story worktree, publish a click-ready smoke handoff, and stop it cleanly. | 21-2, 21-3; D0 smoke-guide choice | Handoff names branch, URL, guide, E2E evidence and owner; stop verification passes. |
| 5 | `21-5-delivery-gates-integration` | Connect the four evidence contracts to the existing BMad/worktree lifecycle without weakening human integration approval. | 21-1..21-4 | Black-box workflow tests prove ordering and retention on every failure. |

Stories are strictly sequential through 21-5. Loop treats `backlog` entries as selectable, so every Epic 21 invocation must use `--max-stories 1`; the operator starts the next story only after the preceding story's required human gate is recorded. Parallel product stories may use the resulting workflow only after their own readiness evidence exists.

## Story acceptance contract

### 21-1 — Loop readiness contract

1. **Given** the selected CLI/profile is installed, **when** Loop is validated, **then** `bmad-loop validate --project . --json` returns `ok`.
2. **Given** a valid numeric queued key, **when** `run --dry-run` runs, **then** it selects that story rather than silently ignoring it.
3. **Given** a decision/evidence artifact, **when** it is inspected, **then** it contains identifiers and outcomes only, never secret values or absolute worktree paths.

### 21-2 — Worktree runtime readiness

1. **Given** a unit worktree, **when** readiness is requested, **then** it reports BMad, Node/npm, JDK, Playwright browser, environment-reference and port state without mutation.
2. **Given** a missing downloadable prerequisite, **when** preparation is not explicitly confirmed, **then** it stops without downloading.
3. **Given** the D0 environment and port choice, **when** preparation passes, **then** E2E and smoke prerequisites are demonstrably available without copying `.env`, committing ignored files, or using a normal dev API as E2E.

### 21-3 — Targeted E2E evidence

1. **Given** a changed capability, **when** its story reaches verification, **then** the workflow records the discovered Playwright projects/specs and their rationale before requesting human validation.
2. **Given** relevant coverage exists, **when** readiness passed, **then** it runs the targeted E2E under the isolated `e2e` profile and records command, exit result and report reference.
3. **Given** no relevant E2E exists, **when** verification is evaluated, **then** the story is blocked pending exactly one documented disposition: test to write now, cited equivalent coverage, or an authorized human waiver.

### 21-4 — Human smoke handoff

1. **Given** targeted E2E evidence or its accepted disposition, **when** a human smoke is requested, **then** the server starts from that unit branch, not `v2`, with the chosen non-secret environment handoff.
2. **Given** startup succeeds, **when** the handoff is emitted, **then** it provides a clickable URL, concise guide, branch/baseline identity, prior E2E result and explicit stop action.
3. **Given** smoke completes or fails, **when** the owner stops it, **then** owned processes are stopped and the result is recorded without secrets.

### 21-5 — Delivery gates and integration

1. **Given** a story lacks readiness, targeted E2E evidence, or a valid coverage disposition, **when** it asks for human validation, **then** the workflow refuses to make that request.
2. **Given** a complete smoke handoff, **when** the operator completes external actions, **then** Loop's observed confirmation facility may park and reverify evidence, but does not assert Git approval.
3. **Given** human review approval, **when** integration is requested, **then** the existing `integrate` command alone preserves push, remote-ancestry and recoverable-cleanup guards.

## Machine and human gates

| Gate | Owner | Evidence / command | Failure outcome |
| --- | --- | --- | --- |
| G0 Loop preflight | machine + operator | `bmad-loop validate --project . --json` | Do not queue execution. |
| G1 D0 decisions | human | non-secret decision artifact | Keep 21-2..21-5 backlog. |
| G2 readiness | machine | readiness result; confirmed downloads only | Do not run E2E or smoke. |
| G3 coverage | machine | discovery record plus targeted E2E result | Enter coverage disposition, not human smoke. |
| G4 coverage disposition | human where waiver is chosen | test/equivalent/waiver record | Do not request validation without it. |
| G5 smoke | human | URL, guide, branch, E2E result, clean stop | Do not recommend integration. |
| G6 review/integration | human then machine | explicit approval; existing `integrate` guards | Preserve unit on failure. |

## Activation and non-goals

After plan approval, create Epic 21 and its numeric backlog entries through the established planning/tracking workflow, then run the green preflight and `bmad-loop run --project . --dry-run --epic 21 --max-stories 1` before any real Loop run. No code, policy rewrite, dependency download, secret handoff, process stop, worktree creation, merge, push, or cleanup is authorised by this plan review.
