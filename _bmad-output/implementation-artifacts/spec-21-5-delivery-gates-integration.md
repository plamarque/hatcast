---
title: '21-5 Delivery gates and integration'
type: 'feature'
created: '2026-08-26'
status: 'awaiting-operator'
feature_branch: 'feat/21-5-delivery-gates-integration'
baseline_commit: 'f998a3f15a3a0d51681a80bb9ba55703928a62e2'
baseline_revision: 'f998a3f15a3a0d51681a80bb9ba55703928a62e2'
prior_e2e_evidence: '_bmad-output/implementation-artifacts/e2e-evidence/21-3-targeted-e2e-evidence.json'
review_loop_iteration: 0
followup_review_recommended: true
context:
  - '{project-root}/_bmad/custom/story-branch-workflow.md'
  - '{project-root}/_bmad-output/planning-artifacts/epic-worktree-delivery-readiness.md'
warnings: []
deferred: []
operator_actions:
  - 'Create a non-secret repository-relative smoke guide with the selected route, fixture or account reference, actions, and expected observations.'
  - 'Run `story-delivery-gates.sh request-human-smoke` from this registered feature worktree, then start the smoke handoff with that guide.'
  - 'Open the emitted `https://localhost:4200` URL in a browser, perform the guide actions, and stop the owned smoke handoff.'
  - 'Run `story-delivery-gates.sh reverify --confirmation OPERATOR_TOKEN` after the clean smoke stop without treating its result as Git approval.'
  - 'Approve the code review explicitly, then run `story-branch.sh integrate 21-5-delivery-gates-integration` only from clean current `v2` if approved.'
---

<intent-contract>

## Intent

**Problem:** Epic 21 already has separate runtime-readiness, targeted-E2E, and human-smoke contracts, but no single bounded check connects their retained evidence before requesting a human validation or after the human reports the smoke result. That makes it too easy for a workflow caller to skip a gate or mistake a Loop confirmation for Git approval.

**Approach:** Add an additive, feature-worktree delivery-gate controller that composes the existing contracts, emits portable semantic gate results, and documents the required order. It will never invoke, wrap, or weaken the established `story-branch.sh integrate` command.

## Boundaries & Constraints

**Always:** Run only in a registered `feat/{story-key}` unit; resolve exactly one canonical story spec by its `feature_branch`; require a fresh `READINESS=ready` inspection and the spec-declared safe E2E evidence with a passed run or permitted exactly-one disposition before reporting that a human smoke may be requested. A later re-verification additionally requires a valid stopped human-smoke state. Persist only repository-relative references and semantic outcomes; preserve the source gate evidence unchanged.

**Block If:** The unit is invalid; the story spec, readiness result, E2E evidence, smoke state, baseline, ownership marker, or coverage disposition is missing, ambiguous, unsafe, stale, running, failed, or inconsistent. Do not make a human-validation request or a re-verification claim in these cases.

**Never:** Start or stop services, run E2E, create/download prerequisites, inspect or serialize environment values, ignored files, absolute worktree paths, or process details; modify `sprint-status.yaml`; create a Git approval record; call `merge` or `integrate`; or treat Loop confirmation, a delivery-gate result, or human smoke as approval to integrate.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|---------------|---------------------------|----------------|
| Human-smoke request | Registered feature unit; ready runtime; permitted E2E evidence | Emit a portable semantic result that permits the separate smoke-handoff request and says review/integration approval remains external | No integration command or state mutation |
| Missing prior gate | Readiness is not ready or E2E is malformed/failed/unpermitted | Refuse before making a human-smoke request | Semantic gate failure without launching or stopping anything |
| Post-smoke re-verification | A prior request result and a valid completed smoke state | Emit a portable result naming branch, baseline, E2E and smoke references | Refuse absent, running, stale, failed, or unsafe smoke state |
| Operator confirmation | A complete retained smoke result and an operator-supplied confirmation token | Reverify the same evidence and emit only that its evidence remains valid | Do not assert Git approval or invoke integration |
| Integration request | Human-approved review outside the controller | Continue to use only `story-branch.sh integrate STORY_KEY` from clean current `v2` | Preserve its existing push, remote-ancestry, and recoverable-cleanup guards |

</intent-contract>

## Code Map

- `scripts/v2/story-worktree-runtime.sh` — Reuse its `inspect` semantic contract; `READINESS=ready` is the machine prerequisite and `prepare` must remain outside this controller.
- `scripts/v2/story-e2e-evidence.sh` — Existing atomic portable attestation and exactly-one coverage-disposition contract; delivery gates must consume, never rerun, it.
- `scripts/v2/story-human-smoke-handoff.sh` — Canonical feature-spec lookup, E2E validation, portable state, ownership, and safe `start`/`status`/`stop` semantics to compose without process control.
- `scripts/v2/story-branch.sh` — Read-only integration boundary: `integrate_story_branch` alone merges, pushes, verifies `origin/v2`, then cleans local resources.
- `scripts/v2/story-branch.test.sh`, `scripts/v2/story-worktree-runtime.test.sh`, `scripts/v2/story-e2e-evidence.test.sh`, `scripts/v2/story-human-smoke-handoff.test.sh` — Hermetic temporary-Git-fixture conventions and regression boundaries.
- `_bmad/custom/story-branch-workflow.md` — Delivery lifecycle documentation; extend its Epic 21 ordering and retain the explicit human-review-to-`integrate` boundary.
- `package.json` — Register the new hermetic delivery-gate test alongside the other story-worktree checks.

## Tasks & Acceptance

**Execution:**
- `scripts/v2/story-delivery-gates.sh` — Add a feature-unit-only `request-human-smoke` and evidence-only `reverify` controller that safely resolves canonical metadata, composes readiness/E2E before the request and smoke completion after it, and emits a portable result with no review or integration authority.
- `scripts/v2/story-delivery-gates.test.sh` — Add black-box temporary-Git fixtures covering valid completed delivery evidence, every missing/unsafe/inconsistent upstream gate, re-verification, and proof that the controller neither launches services nor invokes integration.
- `package.json` — Register `test:story-delivery-gates` using the repository test-script convention.
- `_bmad/custom/story-branch-workflow.md` — Document the validation/reverification order, external human responsibility, and the unchanged explicit `integrate` command.
- `_bmad-output/implementation-artifacts/spec-21-5-delivery-gates-integration.md` — Record implementation, review, verification, and any remaining human-only smoke/review action without touching orchestrator bookkeeping.

**Acceptance Criteria:**
- Given a story lacks ready runtime evidence, targeted E2E evidence, or exactly one valid coverage disposition, when delivery validation is requested, then it refuses before requesting human validation and performs no external action.
- Given complete, safe readiness and E2E evidence for one registered feature unit, when a human-smoke request is made, then it retains only portable semantic facts and states that Git review approval remains external.
- Given an operator reports completion of the external smoke action, when the controller re-verifies its evidence, then it may report the evidence state but neither records nor asserts Git approval.
- Given a human has approved review, when integration is requested, then delivery-gate code does not participate and the existing explicit `story-branch.sh integrate STORY_KEY` continues to provide push, remote-ancestry, and recoverable-cleanup protections.

## Design Notes

The controller is a read-only composition boundary, not a fourth implementation of the preceding checks. Its output is deliberately insufficient to authorize Git mutation: it makes the evidence chain reviewable, while the already-tested integration command remains the only mechanics for the human-approved transition.

## Verification

**Commands:**
- `bash scripts/v2/story-delivery-gates.test.sh` — expected: all hermetic delivery-order, refusal, retention, and no-integration scenarios pass.
- `bash scripts/v2/story-worktree-runtime.test.sh` — expected: readiness contract remains green.
- `bash scripts/v2/story-e2e-evidence.test.sh` — expected: E2E evidence contract remains green.
- `bash scripts/v2/story-human-smoke-handoff.test.sh` — expected: smoke handoff and owned cleanup remain green.
- `bash scripts/v2/story-branch.test.sh` — expected: existing integration and recovery guards remain green.
- `bash -n scripts/v2/story-delivery-gates.sh scripts/v2/story-delivery-gates.test.sh` — expected: no shell syntax errors.
- `git diff --check` — expected: no whitespace errors.

## Implementation Record

- Implemented `story-delivery-gates.sh` with retained, repository-relative
  request evidence and evidence-only re-verification. It has no review or
  integration authority.
- Added hermetic coverage for gate ordering, invalid/missing/unsafe evidence,
  completed smoke re-verification, and the absence of service or integration
  invocation.
- Verified with the commands listed above on 2026-08-26; all passed.
- Remaining human-only work: perform the external smoke action, approve the
  review outside this controller, then run `story-branch.sh integrate STORY_KEY`
  from clean current `v2` if approved.

## Review Triage Log

### 2026-08-26 — Review pass
- intent_gap: 0
- bad_spec: 0
- patch: 5: (high 1, medium 3, low 1)
- defer: 0
- reject: 9: (medium 4, low 5)
- addressed_findings:
  - `[high]` `[patch]` Added the declared prior E2E evidence reference to the canonical 21.5 spec and fixture coverage, so the documented controller command can resolve this story.
  - `[medium]` `[patch]` Re-ran the read-only readiness inspection during re-verification and covered refusal when it is no longer ready.
  - `[medium]` `[patch]` Rejected ignored canonical specs, E2E evidence, and smoke guides, preserving the evidence-boundary contract.
  - `[medium]` `[patch]` Preserved a valid delivery request instead of overwriting it, rejected inconsistent retained state, and emitted a portable identity derived from the shared evidence facts.
  - `[low]` `[patch]` Documented the explicit smoke handoff start and stop sequence between request and re-verification.

## Auto Run Result

Summary: Added a read-only delivery-gate controller that makes the readiness, E2E, and smoke evidence sequence reviewable without granting review or integration authority.

Files changed:
- `scripts/v2/story-delivery-gates.sh` — Validates portable prerequisite evidence, retains a smoke-request result, and re-verifies a stopped handoff without service, E2E, or Git actions.
- `scripts/v2/story-delivery-gates.test.sh` — Covers success, every refusal path, retained evidence, ignored-file rejection, and absence of integration invocation in a temporary Git fixture.
- `package.json` — Registers the delivery-gate hermetic test.
- `_bmad/custom/story-branch-workflow.md` — Documents request, smoke handoff, re-verification, and the unchanged human-review integration boundary.
- `_bmad-output/implementation-artifacts/spec-21-5-delivery-gates-integration.md` — Records the contract, verification, review, and remaining operator actions.

Review findings: 5 patches applied (high 1, medium 3, low 1); 0 items deferred; 9 items rejected. Follow-up review recommended: true (high-severity patch; score 11).

Verification performed:
- `npm run test:story-delivery-gates` passed.
- `bash scripts/v2/story-worktree-runtime.test.sh` passed.
- `bash scripts/v2/story-e2e-evidence.test.sh` passed.
- `bash scripts/v2/story-human-smoke-handoff.test.sh` passed.
- `bash scripts/v2/story-branch.test.sh` passed.
- `bash -n scripts/v2/story-delivery-gates.sh scripts/v2/story-delivery-gates.test.sh` passed.
- `git diff --check` passed.

Residual risks: The automated coverage is hermetic and validates retained evidence contracts; it does not perform the real browser smoke or grant Git review approval. The remaining actions are intentionally owned by an operator.
