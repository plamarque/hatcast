---
title: '21-2 Worktree runtime readiness policy implementation'
type: 'feature'
created: '2026-08-25'
status: 'done'
baseline_commit: '91acc0707527ae6a8e34a69778831dd4801360bb'
review_loop_iteration: 0
context:
  - '{project-root}/_bmad-output/implementation-artifacts/epic-21-context.md'
  - '{project-root}/_bmad-output/implementation-artifacts/spec-21-2-worktree-runtime-readiness.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** A fresh HatCast unit worktree lacks a repeatable, low-friction way to establish its local runtime. Manually copying ignored files is unsafe, while repeated confirmation of routine prerequisite downloads makes worktrees impractical as the normal delivery path.

**Approach:** Provide a separate, explicit runtime-readiness command that inspects a valid unit worktree and, when asked to prepare it, applies the approved machine-local policy automatically: a safe `.env` handoff, reproducible local dependencies, shared tool caches, and fixed-port checks.

## Boundaries & Constraints

**Always:** Treat Git-tracked files and lockfiles as the source of reproducibility. Create a worktree-local `.env` symlink only when absent, by locating the local `v2` integration worktree through Git metadata; do not read, print, copy, serialize, track, or expose the link target or environment values. Run `npm ci` only inside the validated unit worktree; keep `node_modules` local while relying on the normal shared npm cache. Use Playwright's shared browser cache and Gradle's machine cache. Check ports 8080 and 4200 without revealing process details; a conflict is a safe not-ready result. Inspection has no mutation. Preparation must be idempotent and emit semantic states only.

**Ask First:** Any change to the approved runtime policy: a different environment source, a different package manager or dependency source, sharing `node_modules`, dynamic E2E ports, copying ignored files, a process stop, or any new network action outside `npm ci` and Playwright Chromium provisioning.

**Never:** Modify `sprint-status.yaml`, alter `story-branch.sh` lifecycle or BMad-only bootstrap semantics, use `start-dev.sh` as E2E infrastructure, reuse a normal development API for E2E, copy `.env` or other ignored files, overwrite a pre-existing or broken `.env`, read secret contents, persist absolute paths, stop processes, or prepare legacy/staging/migration data and artifacts.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Inspection | Valid unit worktree | Reports semantic readiness for BMad, Node/npm, JDK, Chromium cache, environment handoff, and ports without writes or downloads | Non-ready states are explicit and non-destructive |
| Approved preparation | Valid unit; canonical `v2/.env`; prerequisites absent | Creates only the `.env` symlink, runs approved dependency/browser preparation, then re-inspects | Fails closed if a prerequisite remains unavailable |
| Existing environment entry | Existing file, symlink, or broken symlink at `.env` | Never overwrites it; reports a distinct environment state | Operator resolves the conflict manually |
| Port conflict | 8080 or 4200 is listening | Reports only the port as unavailable | Does not identify, stop, or reuse a process |
| E2E handoff | Dependencies/browser ready and ports free | Declares isolated E2E requirement `PLAYWRIGHT_REUSE_SERVERS=0` | Does not start servers or invoke E2E implicitly |

</frozen-after-approval>

## Code Map

- `scripts/v2/story-branch.sh:89-92,155-202` -- validate unit-worktree identity; preserve its start/reopen and BMad-bootstrap-only lifecycle.
- `scripts/v2/story-worktree-bootstrap.sh:12-44,101-114` -- existing pinned BMad runtime verification; consume its stable result rather than copying skills.
- `scripts/run_e2e.sh:90-158` -- JDK, local package, Chromium-cache and fixed-port prerequisites; new readiness command must not inherit its implicit server startup.
- `apps/web/playwright.config.ts:132-149` -- canonical isolated E2E profile removes datasource settings and owns fresh API/frontend startup.
- `scripts/start-dev.sh:35-38,175-217` -- smoke consumes root `.env`; version and production-local Angular files are generated, not provisioned.
- `.gitignore:10-22,47-84` -- local dependencies, environments, generated files, credentials, reports, exports, BMad/Loop state remain untracked and are never blanket-copied.
- `scripts/v2/story-branch.test.sh:6-119` -- isolated-fixture and mocked-provisioner conventions to reuse without weakening lifecycle coverage.
- `apps/web/e2e/README.md:5-9,65-83` -- documented E2E prerequisites and smoke boundary.

## Tasks & Acceptance

**Execution:**
- [x] `scripts/v2/story-worktree-runtime.sh` -- add inspect-only and explicit `prepare` modes for a validated unit worktree, semantic redacted output, approved `.env` symlink handoff, local `npm ci`, Playwright Chromium preparation, and safe port checks.
- [x] `scripts/v2/story-worktree-runtime.test.sh` -- add black-box temporary-worktree tests for no-mutation inspection, idempotent preparation, environment conflicts, mocked dependency/browser preparation, port conflicts, and redaction.
- [x] `package.json` -- expose the dedicated black-box runtime-readiness suite.
- [x] `_bmad/custom/story-branch-workflow.md` -- document the durable D0 policy, runtime command sequence, cache ownership, and separation among readiness, E2E and human smoke.
- [x] `_bmad-output/implementation-artifacts/spec-21-2-worktree-runtime-readiness-2.md` -- retain the non-secret policy and verification outcome only.

**Acceptance Criteria:**
- Given a valid unit worktree, when inspected, then it reports all runtime states without changing dependencies, environment files, browser caches, processes, or Git state.
- Given approved preparation and absent prerequisites, when preparation runs, then the worktree obtains only its local reproducible runtime while tool downloads use shared machine caches and no repeated confirmation is required.
- Given any pre-existing environment entry or fixed-port conflict, when preparation or inspection runs, then it fails safely without replacement, secret/path disclosure, process reuse, or termination.
- Given E2E is requested after readiness, when its prerequisites are available, then the recorded handoff requires `PLAYWRIGHT_REUSE_SERVERS=0` and never treats normal development startup as E2E evidence.
- Given the black-box suite runs, when it covers success and failure states, then the existing story-worktree lifecycle suite remains green and no ignored secret/artifact is propagated.

## Design Notes

The command is separate from `story-branch.sh start`: creating a worktree stays fast and preserves the existing BMad-only bootstrap contract. `prepare` is a deliberate delivery operation, not an interactive confirmation gate; the durable policy above authorizes its two bounded downloads. Worktree-local installation protects branch/workspace resolution while npm, Playwright and Gradle reuse their machine-level caches.

## Verification

**Commands:**
- `bash scripts/v2/story-worktree-runtime.test.sh` -- expected: all isolated preparation, conflict, redaction and no-mutation cases pass.
- `npm run test:story-worktree-runtime` -- expected: package entry runs the same black-box suite successfully.
- `bash scripts/v2/story-branch.test.sh` -- expected: existing worktree lifecycle remains unchanged and green.
- `git diff --check` -- expected: no whitespace errors and no change to `sprint-status.yaml`.

**Verification outcome (2026-08-25):** The runtime black-box suite, its npm entry,
and the existing worktree lifecycle suite passed. Shell parsing and
`git diff --check` passed; `sprint-status.yaml` was not changed.

## Suggested Review Order

**Runtime contract**

- Validate the unit boundary and emit only redacted readiness states.
  [`story-worktree-runtime.sh:15`](../../scripts/v2/story-worktree-runtime.sh#L15)

- Accept only the canonical environment link and fail closed for port ambiguity.
  [`story-worktree-runtime.sh:19`](../../scripts/v2/story-worktree-runtime.sh#L19)

- Perform the two policy-approved preparations without an approval prompt.
  [`story-worktree-runtime.sh:65`](../../scripts/v2/story-worktree-runtime.sh#L65)

**Operator handoff**

- Explain the separate readiness, E2E and smoke stages.
  [`story-branch-workflow.md:30`](../../_bmad/custom/story-branch-workflow.md#L30)

**Evidence**

- Exercise redaction, conflicts, exact commands and fail-closed ports in an isolated fixture.
  [`story-worktree-runtime.test.sh:46`](../../scripts/v2/story-worktree-runtime.test.sh#L46)

- Make the black-box runtime suite discoverable through npm.
  [`package.json:24`](../../package.json#L24)
