---
feature_branch: feat/21-1-loop-readiness-contract
baseline_commit:
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

- [ ] Record the local Codex policy initialization and validation procedure without tracking the policy file.
- [ ] Add Epic 21 numeric queue entries and this first story artifact.
- [ ] Add a deterministic one-story dry-run verification to the workflow documentation.

## Dependencies

| Story | Status | Relationship |
| --- | --- | --- |
| 21-2-worktree-runtime-readiness | backlog | Follows this preflight contract |

## Dev Notes

- `.bmad-loop/policy.toml` is intentionally ignored and machine-specific.
- The policy generator defaults its adapter to Claude even when called with `--cli codex`; the operator must set `[adapter] name = "codex"` before validation.
- Do not invoke a real `bmad-loop run` in this story. The acceptance check is dry-run only.
