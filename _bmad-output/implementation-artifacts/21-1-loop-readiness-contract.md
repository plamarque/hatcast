---
feature_branch: feat/21-1-loop-readiness-contract
baseline_commit: 268b999c59af14277d3dd6140fa444ba777217b3
status: awaiting-operator
followup_review_recommended: true
deferred:
  - summary: >-
      A fresh Git clone without its ignored, locally provisioned BMad skills fails the upstream-skills validation before the Loop preflight can pass.
    evidence: |-
      The clean-clone check reported missing bmad-build-auto and legacy review-layer skills; the same check passed after the existing local BMad runtime was provisioned.
    location: >-
      scripts/v2/story-worktree-bootstrap.sh:46
    severity: medium
operator_actions:
  - Resolve the orchestrator-owned pending sprint-status.yaml bookkeeping change, then provide a clean v2 checkout for final commit verification.
---

# Story 21.1: Loop readiness contract

Status: ready-for-dev

## Story

As a delivery operator,
I want the locally selected BMad Loop adapter and the Epic 21 queue to be verifiable before a real run,
so that an orchestration failure is detected without starting an agent session.

## Acceptance Criteria

1. **Given** Codex is the selected local adapter, **when** `bmad-loop validate --project . --json` runs from a clean checkout, **then** it reports `ok: true` and confirms Codex hooks and upstream skills.
2. **Given** Epic 21 is in `sprint-status.yaml`, **when** `bmad-loop run --project . --dry-run --epic 21 --max-stories 1` runs, **then** it selects only `21-1-loop-readiness-contract` without spawning a session.
3. **Given** the local policy, **when** it is generated or amended, **then** it stays ignored and contains no secret value; the committed documentation states the reproducible operator procedure but no machine-local path.
4. **Given** the current worktree contract, **when** a Loop dry-run is requested, **then** it requires a clean checkout and does not weaken `story-branch.sh` human-review or integration guards.

**UI: N/A** — no change under `apps/web/`.

## Tasks / Subtasks

- [x] Record the local Codex policy initialization and validation procedure without tracking the policy file.
- [ ] Confirm the orchestrator-owned Epic 21 numeric queue entry without modifying its bookkeeping.
- [x] Add a deterministic one-story dry-run verification to the workflow documentation.

## Dependencies

| Story | Status | Relationship |
| --- | --- | --- |
| 21-2-worktree-runtime-readiness | backlog | Follows this preflight contract |

## Dev Notes

- `.bmad-loop/policy.toml` is intentionally ignored and machine-specific.
- The policy generator defaults its adapter to Claude even when called with `--cli codex`; the operator must set `[adapter] name = "codex"` before validation.
- Do not invoke a real `bmad-loop run` in this story. The acceptance check is dry-run only.

## Review Triage Log

### 2026-08-25 — Review pass
- intent_gap: 0
- bad_spec: 0
- patch: 7 (high 1, medium 4, low 2)
- defer: 1 (medium 1)
- reject: 8 (low 8)
- addressed_findings:
  - `[high]` `[patch]` Stopped all interaction with the orchestrator-owned sprint status file and excluded it from the agent-owned handoff.
  - `[medium]` `[patch]` Made the preflight require the v2 integration branch and re-check tracked cleanliness after local policy initialization.
  - `[medium]` `[patch]` Added exact JSON assertions for the Codex policy, registered hooks, upstream skills, and validation success.
  - `[medium]` `[patch]` Added deterministic dry-run selection assertions plus before/after worktree and tmux-session checks.
  - `[low]` `[patch]` Rewrote the new workflow documentation in English.

## Auto Run Result

Summary: Added a reproducible Codex BMad Loop preflight for Epic 21, including a non-secret ignored policy check, JSON validation, and a one-story dry-run assertion.

Files changed:
- `../../_bmad/custom/story-branch-workflow.md` — Documents the strict Loop preflight and deterministic dry-run checks.
- `21-1-loop-readiness-contract.md` — Records baseline, review triage, verification evidence, and the remaining operator action.

Review findings: 7 patches applied (high 1, medium 4, low 2); 1 medium item deferred; 8 low items rejected. Follow-up review score: 14, so a follow-up review is recommended.

Verification performed:
- `git diff --check` passed.
- `bash -n` passed for both documented Bash blocks.
- In a clean v2 checkout with the installed local BMad runtime, the documented policy, JSON validation, deterministic dry-run, no-new-worktree, and no-new-tmux-session checks passed.

Residual risks: A raw fresh clone lacks ignored BMad skill files until its local runtime is provisioned; this is recorded as deferred. The orchestrator-owned sprint-status change remains intentionally untouched, so final clean-worktree and commit verification require its owner.
