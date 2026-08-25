---
title: '21-3 Targeted E2E evidence'
type: 'feature'
created: '2026-08-25'
status: 'done'
baseline_revision: 'fe4ab813453cb76748769fff16cd9caabda06313'
review_loop_iteration: 0
followup_review_recommended: true
context:
  - '{project-root}/_bmad/custom/story-branch-workflow.md'
  - '{project-root}/apps/web/e2e/README.md'
warnings: []
deferred: []
---

<intent-contract>

## Intent

**Problem:** A story worktree can be runtime-ready but has no reproducible way to discover the relevant Playwright coverage, prove that isolated E2E was run, or record the one permitted disposition when coverage is absent. That leaves later human smoke requests without a trustworthy, reviewable gate.

**Approach:** Add a non-secret, black-box-tested E2E-evidence gate for an isolated feature worktree. It will discover and attest selected Playwright projects/specifications, reuse the existing isolated runner, and refuse a missing-coverage waiver unless it is explicitly authorized under an operator-supplied policy.

## Boundaries & Constraints

**Always:** Run from a valid `feat/{story-key}` worktree after `story-worktree-runtime.sh inspect` reports `READINESS=ready`; invoke only `scripts/run_e2e.sh` with `PLAYWRIGHT_REUSE_SERVERS=0`; retain a relative report reference, normalized command, project/spec selection, rationale, and exit outcome; preserve no environment values, absolute worktree paths, ignored files, or process details; keep `sprint-status.yaml` entirely untouched.

**Block If:** The target cannot be mapped to declared Playwright coverage and no exactly-one valid disposition is supplied; a waiver is requested without an operator-selected authority, required fields, and unexpired approval; readiness is not `ready`; or the invocation would reuse a normal development server.

**Never:** Change product behavior, create/download dependencies, start normal development services, replace `run_e2e.sh`, claim a report proves human smoke or integration approval, invent a waiver authority, or modify orchestrator-owned sprint bookkeeping.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Covered target | Ready feature unit plus declared Playwright project/spec and rationale | Run the isolated targeted command and write an attestation with exit result and relative report reference | Propagate a non-zero test result as failed evidence |
| Not ready | Invalid or non-ready runtime inspection | Do not invoke the E2E runner or emit a passing attestation | Emit a semantic gate failure only |
| Coverage absent | No declared matching project/spec | Require exactly one of test-now, cited-equivalent, or authorized waiver | Reject none, several, expired, or unauthorized dispositions |
| Unsafe evidence | Secret-like value, absolute path, or server reuse request | Refuse or redact before persistence | Do not write unsafe evidence |

</intent-contract>

## Code Map

- `scripts/v2/story-worktree-runtime.sh` — Existing semantic, non-mutating readiness contract; `READINESS=ready` and `E2E_PROFILE=PLAYWRIGHT_REUSE_SERVERS=0` are the gate inputs.
- `scripts/v2/story-worktree-runtime.test.sh` — Reusable black-box temporary-Git-fixture pattern, including exact output and no-mutation assertions.
- `scripts/run_e2e.sh` — Canonical isolated E2E runner; forwards targeted Playwright arguments after `--`, asserts ports, and forces fresh `e2e` services when reuse is disabled.
- `apps/web/playwright.config.ts` — Canonical mapping from named Playwright projects to specs and fresh Spring `e2e` plus Angular servers.
- `apps/web/e2e/README.md` — E2E profile, selector, report, and local execution constraints; no UI code changes are in scope.
- `_bmad/custom/story-branch-workflow.md` — Epic 21 worktree and runtime-readiness boundary; explicitly excludes `start-dev.sh` as E2E evidence.
- `_bmad-output/planning-artifacts/epic-worktree-delivery-readiness.md` — Acceptance contract and the operator-owned waiver-policy decision for story 21-3.

## Tasks & Acceptance

**Execution:**
- `scripts/v2/story-e2e-evidence.sh` — Add a feature-worktree-only discovery, execution, and attestation gate that validates readiness, maps a supplied target to declared Playwright coverage, calls the existing runner with reuse disabled, and validates exactly one coverage disposition when no target exists.
- `scripts/v2/story-e2e-evidence.test.sh` — Add hermetic black-box tests for mapping discovery, readiness refusal without runner execution, enforced isolated invocation, successful and failed attestations, unsafe-output redaction, and invalid waiver/disposition rejection.
- `_bmad/custom/story-branch-workflow.md` — Document the post-readiness targeted-E2E command, attestation contract, coverage-disposition boundary, and the prohibition on human-smoke/integration claims.
- `_bmad-output/implementation-artifacts/spec-21-3-targeted-e2e-evidence.md` — Record implementation, review, verification, and the non-secret operator action needed to authorize any waiver policy.

**Acceptance Criteria:**
- Given a ready isolated feature worktree and a changed capability, when targeted E2E evidence is requested, then the resulting attestation records discovered Playwright projects/specs and an explicit selection rationale before any human-validation handoff.
- Given declared relevant coverage and `READINESS=ready`, when the gate executes it, then it invokes the existing runner under `PLAYWRIGHT_REUSE_SERVERS=0` and records the normalized command, exit outcome, and a relative Playwright report reference.
- Given readiness is invalid, incomplete, or requests server reuse, when evidence is requested, then no E2E runner is invoked and no passing evidence is recorded.
- Given no relevant E2E coverage, when a disposition is evaluated, then exactly one of test-now, cited equivalent coverage, or an authorized, unexpired waiver is retained; an unauthorized or malformed waiver is rejected.
- Given any persisted evidence is inspected, when it contains output from discovery or execution, then it contains no environment value, absolute local path, ignored file content, process detail, human-smoke assertion, or integration-approval assertion.

## Design Notes

The gate separates machine facts from human authority: discovery and test outcomes are attestable, while a waiver remains an operator decision. A relative report reference keeps evidence portable across adjacent worktrees without serializing their location.

## Verification

**Commands:**
- `bash scripts/v2/story-e2e-evidence.test.sh` — expected: all hermetic gate scenarios pass without starting product services.
- `bash scripts/v2/story-worktree-runtime.test.sh` — expected: existing readiness boundary remains green.
- `git diff --check` — expected: no whitespace errors.

## Implementation record

- Added `scripts/v2/story-e2e-evidence.sh`: feature-worktree validation,
  readiness gate, declared Playwright discovery/selection, isolated canonical
  runner invocation, portable JSON attestation, and exactly-one no-coverage
  disposition validation.
- Added `scripts/v2/story-e2e-evidence.test.sh`: hermetic black-box coverage
  for discovery, readiness refusal, isolation, pass/fail outcomes, output
  safety, and waiver/disposition failures.
- Updated `_bmad/custom/story-branch-workflow.md` with the post-readiness
  command and the boundary between machine E2E facts and later human gates.

## Operator action for a waiver

Before using `--waiver-policy`, an operator must create a non-secret,
repository-relative JSON policy. It must contain `authority`, a non-empty
`required_fields` list, and `approval`; `approval.authority` must equal
`authority`, include every required field, and include an unexpired ISO date
in `approval.expires_on`. Selecting that authority and its required fields is
an operator decision; this implementation intentionally does not supply one.

## Review and verification record

- `bash scripts/v2/story-e2e-evidence.test.sh`
- `bash scripts/v2/story-worktree-runtime.test.sh`
- `git diff --check`

## Review Triage Log

### 2026-08-25 — Review pass
- intent_gap: 0
- bad_spec: 0
- patch: 7 (high 3, medium 3, low 1)
- defer: 0
- reject: 8 (medium 3, low 5)
- addressed_findings:
  - `[high]` `[patch]` Rejected explicit projects and specs that do not themselves map to the requested target, preventing unrelated coverage from being attested.
  - `[high]` `[patch]` Required a report produced by the runner and replaced stale passing evidence with a failed attestation when readiness or report evidence fails.
  - `[high]` `[patch]` Refused symlink evidence destinations and atomically replaced regular attestations.
  - `[medium]` `[patch]` Restricted explicit spec selection and discovery to target-matching Playwright `*.spec.ts` coverage, excluding setup prerequisites.
  - `[medium]` `[patch]` Rejected empty normalized targets and arbitrary absolute paths in attested text.
  - `[medium]` `[patch]` Extended hermetic tests for all three absence dispositions, mismatched coverage, missing reports, stale evidence, path safety, and destination safety.

## Auto Run Result

Summary: Added a feature-worktree gate that discovers targeted Playwright coverage, invokes the existing isolated E2E runner, and writes a portable JSON attestation or exactly one valid absence disposition.

Files changed:
- `scripts/v2/story-e2e-evidence.sh` — Enforces readiness, target-to-coverage selection, isolated execution, safe atomic attestation, and waiver/disposition validation.
- `scripts/v2/story-e2e-evidence.test.sh` — Exercises the gate in a hermetic temporary Git worktree, including every matrix scenario.
- `_bmad/custom/story-branch-workflow.md` — Documents the targeted-E2E evidence command and its later human-gate boundary.
- `spec-21-3-targeted-e2e-evidence.md` — Captures the implementation, review, and verification record.

Review findings: 7 patches applied (high 3, medium 3, low 1); 0 items deferred; 8 items rejected. Follow-up review recommended: true (patched score: 12).

Verification performed:
- `bash scripts/v2/story-e2e-evidence.test.sh` passed.
- `bash scripts/v2/story-worktree-runtime.test.sh` passed.
- `bash -n scripts/v2/story-e2e-evidence.sh scripts/v2/story-e2e-evidence.test.sh` passed.
- `git diff --check` passed.

Residual risks: The gate validates a non-secret waiver policy's schema, authority label, required approval fields, and expiry, but does not claim to independently prove the human authority behind that policy. The hermetic tests prove the delivery gate; no live HatCast product E2E was launched in this workflow.
