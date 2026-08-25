---
title: '21-2 Worktree runtime readiness'
type: 'feature'
created: '2026-08-25'
status: 'awaiting-operator'
baseline_revision: '01ab0273e39f36a376235978990209687cd6d162'
review_loop_iteration: 0
followup_review_recommended: false
context:
  - '_bmad-output/implementation-artifacts/epic-21-context.md'
  - '_bmad-output/planning-artifacts/epic-worktree-delivery-readiness.md'
warnings: []
deferred: []
operator_actions:
  - 'Record a non-secret environment-handoff reference for Story 21-2 without copying, printing, tracking, or serialising any environment value.'
  - 'Choose the dependency-preparation action and state the explicit confirmation required before any download.'
  - 'Choose the strategy for the fixed E2E ports 8080 and 4200, including the required response to a port conflict.'
---

<intent-contract>

## Intent

**Problem:** A freshly created unit worktree has a BMad-only bootstrap but no safe, reproducible way to determine whether it can run isolated E2E or human smoke work. Running the current E2E helper may download Chromium, and ordinary development startup is not a valid E2E runtime.

**Approach:** Add a dedicated, non-secret runtime-readiness command and black-box coverage. It will distinguish inspection from explicitly confirmed preparation, retain the existing worktree and BMad bootstrap contracts, and require an operator-owned D0 decision record before preparation can claim readiness.

## Boundaries & Constraints

**Always:** Validate that the target is a HatCast Git unit worktree; report BMad, Node/npm, JDK, Playwright Chromium, environment-reference, and ports 8080/4200 using stable, non-secret states. Inspection must not download, install, source, copy, print, serialise, or commit environment data. A successful E2E-ready result must require the isolated Playwright profile with `PLAYWRIGHT_REUSE_SERVERS=0`, never ordinary `start-dev.sh` or a reused development API. Keep the existing `story-branch.sh` lifecycle and `story-worktree-bootstrap.sh` BMad-only contract unchanged.

**Block If:** A requested preparation has no operator-provided D0 decision record identifying the approved environment-reference method, dependency-download choice, and port strategy; a prerequisite download is needed but explicit confirmation is absent; or the selected port strategy is contradicted by occupied required ports. These conditions must be reported as non-destructive readiness outcomes, not bypassed.

**Never:** Copy `.env` files; read, print, persist, or commit secret values or absolute worktree paths; modify `sprint-status.yaml`; stop processes; treat `scripts/start-dev.sh` as E2E infrastructure; implicitly invoke the E2E helper's Chromium download; weaken integration/review guards; or change production behavior.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Inspection | Valid unit with one or more missing prerequisites | Emits only stable readiness identifiers and states; performs no filesystem or network mutation | Exits non-zero or reports not-ready according to the documented contract without proposing a download command that runs automatically |
| Unconfirmed browser prerequisite | Chromium unavailable and no explicit confirmation | Reports the missing browser and confirmation requirement | No browser download, install, or ignored-file mutation occurs |
| Confirmed preparation | Valid D0 record, explicit download confirmation, and missing downloadable prerequisite | Performs only the approved prerequisite action, then re-inspects and reports the result | Fails closed if the prerequisite remains unavailable |
| Port conflict | A required isolated E2E port is listening | Reports the conflicted port number only | Does not expose process command lines, kill a process, or claim E2E readiness |
| Environment reference | `.env` is absent or present | Reports an opaque reference state only | Does not open, copy, source, log, or persist the file or its path |

</intent-contract>

## Code Map

- `scripts/v2/story-branch.sh:127-202` -- creates/reopens isolated `feat/{story-key}` worktrees and verifies BMad; reuse its worktree validation boundary without changing lifecycle commands.
- `scripts/v2/story-worktree-bootstrap.sh:12-114` -- existing BMad-only verification/provisioning and explicit network guard; preserve its scope and reuse its verification output as the BMad readiness input.
- `scripts/v2/bmad-runtime.env:1-8` -- pinned BMad installer configuration; read-only for app-runtime readiness.
- `scripts/run_e2e.sh:90-175` -- canonical local E2E launcher, port checks, isolated profile, and current automatic Chromium install; the new readiness path must inspect before this helper and must not inherit its implicit download behavior.
- `apps/web/playwright.config.ts:3-149` -- isolated API H2 and Angular web-server definition; `PLAYWRIGHT_REUSE_SERVERS=0` is required for readiness evidence.
- `apps/web/e2e/README.md:5-125` -- JDK, Node, dependencies, Chromium, and port prerequisites plus the prohibition on reusing `start-dev.sh` for E2E.
- `scripts/v2/story-branch.test.sh:1-119` -- black-box temporary-worktree test conventions and network-denial fixture model to reuse for the new runtime command.
- `package.json:7-47` -- root script registry and supported Node baseline; add a focused runtime-readiness test entry beside the existing story-worktree test.
- `.gitignore:16-17,39,72-74` -- `.env*`, ignored skill runtime, and E2E artifacts must remain untracked; tests must assert no secret or absolute path is persisted.

## Tasks & Acceptance

**Execution:**
- `scripts/v2/story-worktree-runtime.sh` -- add a unit-worktree runtime-readiness CLI with inspect-only default and an explicitly confirmed preparation mode; emit a documented, stable, redacted state contract for BMad, Node/npm, JDK, dependencies, Chromium, environment reference, and ports.
- `scripts/v2/story-worktree-runtime.test.sh` -- add black-box isolated-fixture tests for missing prerequisites, denied download, confirmed preparation, port conflict, and absence of secret/path persistence.
- `package.json` -- expose the dedicated runtime-readiness black-box suite through an npm script.
- `_bmad/custom/story-branch-workflow.md` -- document the non-secret D0 decision-record format, command sequence, redaction rules, and separation between readiness, isolated E2E, and human smoke.
- `_bmad-output/implementation-artifacts/spec-21-2-worktree-runtime-readiness.md` -- record implementation and verification results without secret values, paths, or orchestrator bookkeeping.

**Acceptance Criteria:**
- Given a valid unit worktree, when runtime readiness is inspected, then it reports BMad, Node/npm, JDK, Playwright Chromium, environment-reference, and ports without mutating dependencies, browser caches, environment files, processes, or Git state.
- Given Chromium or another downloadable prerequisite is missing, when preparation lacks explicit operator confirmation, then the command stops without downloading or installing it.
- Given a non-secret D0 decision record approves the environment-reference method, dependency action, and port strategy, when confirmed preparation succeeds, then isolated E2E prerequisites are available with `PLAYWRIGHT_REUSE_SERVERS=0` and no copied `.env`, tracked ignored file, absolute worktree path, or normal development API.
- Given a required E2E port is occupied, when readiness is checked, then the result identifies only the conflicted port and does not stop or disclose the owning process.
- Given the black-box suite runs in temporary worktrees, when it exercises missing dependency, denied download, port conflict, and redaction scenarios, then each failure is retained as a safe not-ready result and the existing story-worktree lifecycle suite remains green.

## Design Notes

The readiness command is a gate, not a launcher. Its machine-readable output must use semantic states rather than local paths, environment contents, process IDs, or command lines. D0 is represented by a committed non-secret decision record whose values identify approved methods and outcomes, not credentials or machine-local locations. Browser installation is reachable only through an unambiguous confirmation flag plus that decision record; normal inspection never delegates to `run_e2e.sh`.

## Verification

**Commands:**
- `git diff --check` -- expected: no whitespace errors and no change to `sprint-status.yaml`.
- `git status --short` -- expected before commit: only the Epic 21 context and this Story 21-2 spec are untracked.

## Superseded implementation attempt

The runtime command, its tests, package entry, and workflow documentation described below were reverted during review. They had fixed the operator-owned D0 choices without an operator decision and are not retained as implementation evidence.

- Added `scripts/v2/story-worktree-runtime.sh`: inspect-only by default; a
  confirmed preparation requires a tracked, clean, non-secret D0 record and
  `--confirm-download`. Its output is semantic `KEY=STATE` data only and
  declares the isolated Playwright profile with
  `PLAYWRIGHT_REUSE_SERVERS=0`.
- Added the isolated black-box suite and exposed it as
  `npm run test:story-worktree-runtime`. It covers missing prerequisites,
  absent D0/confirmation, a failed browser preparation, confirmed preparation,
  port conflict, and environment-output redaction.
- Documented the D0 record and the boundary between readiness, isolated E2E,
  and human smoke in `_bmad/custom/story-branch-workflow.md`.
- Verification passed on 2026-08-25:
  `bash scripts/v2/story-worktree-runtime.test.sh`,
  `npm run test:story-worktree-runtime`,
  `bash scripts/v2/story-branch.test.sh`, the specified `bash -n` check, and
  `git diff --check`.

## Review Triage Log

### 2026-08-25 — Review pass
- intent_gap: 1 (high 1)
- bad_spec: 0
- patch: 0
- defer: 0
- reject: 16 (medium 10, low 6)
- addressed_findings:
  - `[high]` `[intent_gap]` Reverted the proposed runtime command, tests, package entry, and workflow documentation because they selected D0 environment, dependency, and port values on the operator's behalf. The original contract leaves those values to the operator and no safe implementation can infer them.

## Auto Run Result

Summary: Compiled Epic 21 context and completed an evidence-based readiness investigation. No runtime implementation is retained because its observable D0 contracts require operator choices that were not supplied.

Files changed:
- `epic-21-context.md` -- Focused Epic 21 delivery constraints, dependencies, and gate order.
- `spec-21-2-worktree-runtime-readiness.md` -- Implementation map, acceptance contract, review triage, and non-secret operator gate.

Review findings breakdown: 0 patches applied; 0 items deferred; 16 lower-priority findings rejected after the unresolved D0 intent gap made the proposed implementation invalid. Follow-up review recommendation: false (patch score 0).

Verification performed:
- `bash scripts/v2/story-worktree-runtime.test.sh` passed before the speculative runtime implementation was reverted.
- `npm run test:story-worktree-runtime` passed before the speculative runtime implementation was reverted.
- `bash scripts/v2/story-branch.test.sh` passed.
- Shell parsing and `git diff --check` passed before the revert; final artifact validation is re-run before commit.

Residual risks: The D0 environment-handoff reference, dependency-preparation action, and fixed-port strategy remain operator-owned. Until they are recorded, no readiness implementation, E2E run, or smoke handoff may claim readiness.
