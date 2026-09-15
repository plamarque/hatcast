---
title: '21-4 Human smoke handoff'
type: 'feature'
created: '2026-08-26'
status: 'awaiting-operator'
feature_branch: 'feat/21-4-human-smoke-handoff'
baseline_commit: '38fc9534cfd33b3eafd7393e33655c05fa62a491'
prior_e2e_evidence: '_bmad-output/implementation-artifacts/e2e-evidence/21-3-targeted-e2e-evidence.json'
review_loop_iteration: 0
followup_review_recommended: false
context:
  - '{project-root}/_bmad/custom/story-branch-workflow.md'
  - '{project-root}/_bmad-output/planning-artifacts/epic-worktree-delivery-readiness.md'
warnings: []
deferred: []
operator_actions:
  - 'Create a non-secret, repository-relative smoke guide with the route, fixture or account reference, actions, and expected observations for the selected validation scenario.'
  - 'Run the handoff start command from this feature worktree, open its emitted https://localhost:4200 URL in a browser, and perform the guide actions.'
  - 'Run the explicit smoke stop command and record the observed pass or failure without treating it as review or integration approval.'
---

<intent-contract>

## Intent

**Problem:** A ready feature worktree with targeted E2E evidence has no safe, portable way to start a normal development stack for a human smoke test, hand over the necessary facts, and prove that only its owned processes were stopped.

**Approach:** Add a feature-worktree smoke-handoff controller and a concise repository-relative guide contract. It validates readiness and prior E2E evidence before starting the normal local stack, emits non-secret handoff state, and stops only the process group it owns.

## Boundaries & Constraints

**Always:** Operate only from a registered `feat/{story-key}` worktree; require `READINESS=ready` and a valid prior E2E attestation with either `outcome: passed` or its accepted no-coverage disposition; launch `scripts/start-dev.sh --no-tailscale` in an owned process group; wait for the API health endpoint and `https://localhost:4200`; record only branch, baseline commit, repository-relative guide/E2E references, URL, owner, semantic result, and owned process marker. The guide contract has route, account-or-fixture reference, actions, expected observations, E2E result, URL, and stop command.

**Block If:** Runtime readiness is not ready; ports are unavailable; E2E evidence is missing, unsafe, failed, or lacks a permitted disposition; the guide is missing required non-secret fields; startup cannot reach both health checks; or an existing smoke instance is not demonstrably owned by this controller.

**Never:** Copy, print, track, or serialize environment values, ignored-file contents, absolute worktree paths, arbitrary process listings, or unowned PIDs; use a normal development stack as E2E evidence; stop an unowned process; request or infer Git review/integration approval; modify `sprint-status.yaml`.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|---------------|----------------------------|----------------|
| Ready handoff | Valid feature unit, passing E2E evidence, valid guide, free ports | Start owned stack and emit a clickable URL plus non-secret handoff state | No error expected |
| Preflight failure | Invalid worktree, non-ready runtime, missing/failed/unsafe E2E evidence, invalid guide, or occupied port | Refuse before launching a process and retain no passing handoff | Return a semantic gate error |
| Startup failure | Owned stack does not expose both required endpoints | Stop the owned group and persist a failed semantic result | Return failure without process detail |
| Stop request | Existing owned or stale/unowned state | Stop and verify release only for the owned group; reject unowned or stale markers | Record clean-stop or refuse safely |

</intent-contract>

## Code Map

- `scripts/v2/story-worktree-runtime.sh` — Reuse `unit_valid`, `inspect`, and its semantic readiness/port contract; do not copy its preparation behaviour.
- `scripts/v2/story-e2e-evidence.sh` — Consume the existing portable evidence location and schema; its isolated `PLAYWRIGHT_REUSE_SERVERS=0` run must precede smoke.
- `scripts/start-dev.sh` — Canonical normal local stack, owns its own exit cleanup and exposes `http://127.0.0.1:8080/actuator/health` plus `https://localhost:4200`; `--no-tailscale` prevents shared Serve-state changes.
- `scripts/run_e2e.sh` — Requires ports 8080 and 4200 free, establishing that E2E and smoke cannot overlap.
- `scripts/v2/story-worktree-runtime.test.sh` and `scripts/v2/story-e2e-evidence.test.sh` — Hermetic temporary-Git-fixture patterns for black-box gate tests.
- `_bmad/custom/story-branch-workflow.md` — Delivery lifecycle documentation; must retain the separation between smoke, review, and integration.

## Tasks & Acceptance

**Execution:**
- `scripts/v2/story-human-smoke-handoff.sh` — Add the bounded feature-worktree controller for handoff start/status/stop, safe guide and E2E validation, owned process lifecycle, endpoint checks, and portable state.
- `scripts/v2/story-human-smoke-handoff.test.sh` — Add hermetic black-box coverage for all matrix scenarios, no-launch preflight refusals, safe persistence, and owned-process-only cleanup.
- `_bmad/custom/story-branch-workflow.md` — Document the ordered smoke handoff and explicit stop command, without treating it as E2E, human approval, or integration authorization.
- `package.json` — Expose the smoke-handoff test through the repository test-script convention.

**Acceptance Criteria:**
- Given valid targeted E2E evidence and a ready feature worktree, when a smoke handoff starts, then it launches the normal stack from that branch with the selected local environment and exposes a clickable `https://localhost:4200` URL.
- Given a successful startup, when the handoff is inspected, then it supplies the guide, branch and baseline identity, prior E2E outcome, owner, URL, and an explicit stop action without secrets or absolute paths.
- Given human smoke finishes or fails, when the owner requests stop, then the controller stops only its owned process group, verifies the reserved ports are free, and records a non-secret result.
- Given any readiness, evidence, guide, port, ownership, or startup gate fails, when smoke is requested, then no valid smoke handoff is emitted and no unrelated process is stopped.

## Design Notes

The controller keeps machine lifecycle facts separate from human judgement. The guide is structured enough to be reproducible but provides no product-specific scenario: the caller supplies a non-secret route and fixture/account reference for the story being smoked. State remains repository-relative so adjacent worktrees can be audited without revealing their locations.

## Verification

**Commands:**
- `bash scripts/v2/story-human-smoke-handoff.test.sh` — expected: all hermetic success and refusal scenarios pass without starting the HatCast stack.
- `bash scripts/v2/story-worktree-runtime.test.sh` — expected: the readiness contract remains green.
- `bash scripts/v2/story-e2e-evidence.test.sh` — expected: the preceding evidence gate remains green.
- `bash -n scripts/v2/story-human-smoke-handoff.sh scripts/v2/story-human-smoke-handoff.test.sh` — expected: no shell syntax errors.
- `git diff --check` — expected: no whitespace errors.

## Spec Change Log

### 2026-08-26 — Smoke stop lifecycle repair

- Keep the full development stack in the controller-owned process group for a
  marked human-smoke launch; retain ordinary job-control behavior otherwise.
- Wait for the bounded API cleanup before reporting stop failure, and record a
  clean completion only when the prior owned group is verifiably absent and the
  reserved ports are free.

## Review Triage Log

### 2026-08-26 — Review pass
- intent_gap: 0
- bad_spec: 0
- patch: 8 (high 5, medium 3)
- defer: 0
- reject: 14
- addressed_findings:
  - `[high]` `[patch]` Resolved the canonical story spec from its `feature_branch`, so the real `spec-21-4-human-smoke-handoff.md` supplies the baseline instead of a non-existent filename.
  - `[high]` `[patch]` Added an explicit `start-dev.sh` ownership-marker option and protected the owned process lifecycle through state publication, endpoint failure, and interruption.
  - `[high]` `[patch]` Removed the normal-stack fallback that could stop an unrelated Java process, and verified real owned-group termination for both stop and failed startup.
  - `[high]` `[patch]` Rejected ignored and credential-like guides before launch, and strengthened E2E evidence validation before a handoff can start.
  - `[medium]` `[patch]` Revalidated state, canonical evidence, and both endpoints for `status`, rejecting stale or altered handoffs.
  - `[medium]` `[patch]` Allowed a new smoke run after a safely stopped prior handoff while preserving the latest semantic result.
  - `[medium]` `[patch]` Expanded hermetic tests from state-only assertions to owned-process cleanup, safe-guide refusal, and accepted evidence dispositions.
  - `[high]` `[patch]` Restored the accidentally removed Epic 21 coverage-baseline constraint.

## Auto Run Result

Summary: Added a guarded human-smoke handoff for one feature worktree. It validates readiness and targeted-E2E evidence, starts the normal local stack without Tailscale Serve changes, emits a portable handoff, and stops only the process group it owns.

Files changed:
- `scripts/v2/story-human-smoke-handoff.sh` — Implements safe start, status, stop, guide/evidence validation, endpoint checks, and non-secret state.
- `scripts/v2/story-human-smoke-handoff.test.sh` — Hermetically verifies successful handoff, refusal gates, ownership, cleanup, repeated smoke, and evidence dispositions.
- `scripts/start-dev.sh` — Supports the controller ownership marker and avoids stopping an unrelated Java process in this controlled smoke mode.
- `_bmad/custom/story-branch-workflow.md` — Documents the ordered handoff and explicit stop operation.
- `package.json` — Registers `test:story-human-smoke-handoff`.
- `spec-21-4-human-smoke-handoff.md` — Records the execution contract, verification, and review triage.

Review findings: 8 patches applied (high 5, medium 3); 0 items deferred; 14 items rejected. Follow-up review recommendation: true (high-severity patch present; score 14).

Verification performed:
- `bash scripts/v2/story-human-smoke-handoff.test.sh` passed.
- `bash scripts/v2/story-worktree-runtime.test.sh` passed.
- `bash scripts/v2/story-e2e-evidence.test.sh` passed.
- `bash -n scripts/v2/story-human-smoke-handoff.sh scripts/v2/story-human-smoke-handoff.test.sh scripts/start-dev.sh` passed.
- `git diff --check` passed.

Residual risks: Verification uses hermetic fixture processes and synthetic endpoints. No live HatCast stack was started and no human browser smoke was performed; neither the handoff nor its stop result asserts review or integration approval.
