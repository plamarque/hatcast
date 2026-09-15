---
title: 'Isolated manual story worktrees'
type: 'feature'
created: '2026-08-24'
status: 'done'
feature_branch: feat/worktree-development-workflow
baseline_commit: '2db300e61bf88568a8ac932f6388b48487a88589'
review_loop_iteration: 0
context:
  - '{project-root}/project-context.md'
  - '{project-root}/_bmad-output/specs/spec-worktree-story-workflow/SPEC.md'
  - '{project-root}/_bmad-output/specs/spec-worktree-story-workflow/worktree-workflow-contract.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The existing BMad story rule creates `feat/{story-key}` but checks it out in the caller's checkout. A second manual story therefore cannot be isolated, and a fresh worktree does not reliably contain the ignored BMad runtime required to run the project workflows.

**Approach:** Extend the existing story-branch contract with an explicit integration-worktree command that creates or reopens one sibling unit worktree from `origin/v2`, provisions a pinned BMad runtime there, and keeps review and integration deliberate.

## Boundaries & Constraints

**Always:** Require a clean `v2` integration worktree before creation; retain `feat/{story-key}` naming and immutable full baseline SHA; derive unit paths locally; validate the BMad runtime by required files/skills; preserve failed units; keep all policy, commands, and tests versioned. `communication_language = "French"` is a team override, not a missing user-file dependency.

**Ask First:** Any network download not satisfiable from the declared local cache; changing the pinned BMad version; merging, pushing, deleting a unit branch/worktree; provisioning or copying secrets.

**Never:** Switch, clean, merge, delete, or copy ignored working data from another worktree; auto-push; implement BMad Loop parallel fan-out; commit an absolute local path in story frontmatter.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Create unit | Clean `v2`, safe unused key | Fetch baseline, create `feat/{key}` and deterministic sibling worktree, emit branch/baseline/path metadata | Bootstrap failure leaves unit inspectable and returns non-zero |
| Reopen unit | Existing branch/worktree for key | Report the existing path; do not checkout or recreate it | Fail if branch is checked out elsewhere but its path cannot be validated |
| Invalid start | Dirty/wrong integration checkout, unsafe key, or conflicting non-worktree path | No branch/worktree mutation | Explain the failed guard and next safe action |
| Manual workflow | BMad invoked from integration or another unit | Assert rejects with expected local worktree guidance | No story/code artifact is written |
| Integrate unit | Approved branch and clean `v2` integration worktree | Merge locally with existing review-before-push semantics | Never switches the unit checkout, pushes, or deletes automatically |

</frozen-after-approval>

## Code Map

- `scripts/v2/story-branch.sh` -- existing CLI (`start`, `assert`, `merge`, `status`) currently performs in-place checkout and merge; primary extension point.
- `scripts/v2/lib/git-branches.sh` -- reuse V2 root detection, fetch, clean-tree, baseline-ref, and branch-name helpers; avoid coupling worktree-only helpers to release scripts unless shared.
- `_bmad/custom/story-branch-workflow.md` -- normative BMad branch gates; change to integration/worktree lifecycle.
- `_bmad/custom/bmad-create-story.toml`, `_bmad/custom/bmad-dev-story.toml`, `_bmad/custom/bmad-code-review.toml` -- injected BMad workflow rules to align with the revised CLI.
- `_bmad/custom/config.toml` -- team-level `communication_language` override required for a fresh worktree.
- `project-context.md` and `_bmad-output/implementation-artifacts/story-template.md` -- update the documented rule and metadata without persisting machine-local paths.
- `_bmad/_config/manifest.yaml` and `.gitignore` -- authoritative installed-version/runtime boundary; `.agents/skills/*` is ignored, so bootstrap must not assume it is copied by Git.
- `scripts/v2/story-branch.test.sh` -- new local-bare-repository black-box test harness; no external remote or user checkout.

## Tasks & Acceptance

**Execution:**
- [x] `scripts/v2/story-branch.sh` -- make `start`, `assert`, `status`, and `merge` worktree-aware; enforce integration and unit ownership guards; emit stable metadata.
- [x] `scripts/v2/story-worktree-bootstrap.sh` and its version/config source -- provision and verify the pinned BMad runtime in only the requested unit worktree; reject missing requirements without copying secrets or arbitrary ignored files.
- [x] `_bmad/custom/story-branch-workflow.md`, the three BMad overrides, `project-context.md`, and `story-template.md` -- replace branch-switch instructions with the unit-worktree contract and retain branch/baseline metadata only.
- [x] `scripts/v2/story-branch.test.sh` -- cover local Git topology, creation/reopen, guard failures, assert/status, bootstrap validation, and explicit integration semantics.
- [x] `_bmad-output/specs/spec-worktree-story-workflow/` and `ISSUES.md` -- record the provisioning decision and update LIMIT-006 with its mitigated, locally verified status.

### Review Findings

- [x] [Review][Patch] Preserve the creation baseline after a rebase [scripts/v2/story-branch.sh:67]
- [x] [Review][Patch] Reject non-Git paths during bootstrap verification [scripts/v2/story-worktree-bootstrap.sh:94]
- [x] [Review][Patch] Restore tracked BMad files after a failed installer [scripts/v2/story-worktree-bootstrap.sh:62]
- [x] [Review][Patch] Prove merge remains local-only [scripts/v2/story-branch.test.sh:111]
- [x] [Review][Patch] Exercise the pinned installer command path [scripts/v2/story-branch.test.sh:14]
- [x] [Review][Patch] Preserve uncommitted work in a parallel unit [scripts/v2/story-branch.test.sh:65]
- [x] [Review][Patch] Assert failed starts leave no Git mutation [scripts/v2/story-branch.test.sh:75]
- [x] [Review][Patch] Record successful live provisioning in the canonical SPEC [_bmad-output/specs/spec-worktree-story-workflow/SPEC.md:62]

**Acceptance Criteria:**
- Given a clean V2 integration worktree, when a valid unused key starts, then an adjacent unit worktree on `feat/{key}` is created from the fetched V2 baseline and the integration checkout remains unchanged.
- Given another unit worktree is active, when a second key starts, then both directories retain independent indexes and uncommitted files.
- Given a fresh unit worktree, when bootstrap succeeds, then the required BMad skill/runtime files are verified without source-checkout secrets or unrelated ignored files.
- Given a dirty/wrong integration checkout, unsafe key, or path conflict, when start runs, then it fails before a branch/worktree mutation; given an unavailable runtime after unit creation, it fails without further mutation and preserves that unit for inspection.
- Given a human-reviewed unit, when merge runs from clean and current V2 integration, then it merges locally without checkout in the unit, push, or cleanup. The command cannot itself prove review approval.

## Design Notes

The deterministic sibling location is derived from the integration checkout path and safe work key, matching the existing local worktree convention. Bootstrap must use a declared version and an explicit allowlist of runtime artifacts; a directory existence check is insufficient because an ignored install can be partial.

## Spec Change Log

- 2026-08-24: Clarified that bootstrap failure intentionally preserves an already-created unit, and that review approval is a human gate outside the merge command.

## Verification

**Commands:**
- `bash scripts/v2/story-branch.test.sh` -- expected: creates only local temporary repositories and passes all lifecycle/guard cases.
- `UV_CACHE_DIR=/private/tmp/hatcast-worktree-uv-cache uv run _bmad/scripts/resolve_config.py --project-root .` -- expected: merged core configuration contains `communication_language: French`.
- `git diff --check` -- expected: no whitespace errors.

## Suggested Review Order

**Lifecycle and integration guardrails**

- Defines unit creation, ownership checks, and intentional local-only integration.
  [`story-branch.sh:81`](../../scripts/v2/story-branch.sh#L81)

- Ensures integration fast-forwards before a reviewed branch can be merged.
  [`story-branch.sh:153`](../../scripts/v2/story-branch.sh#L153)

**Reproducible BMad runtime**

- Pins the installer and module versions shared by every fresh unit.
  [`bmad-runtime.env:1`](../../scripts/v2/bmad-runtime.env#L1)

- Gates network provisioning and verifies only required, standard runtime artifacts.
  [`story-worktree-bootstrap.sh:12`](../../scripts/v2/story-worktree-bootstrap.sh#L12)

**Manual BMad workflow contract**

- Makes worktree isolation mandatory at create, develop, and review boundaries.
  [`story-branch-workflow.md:15`](../../_bmad/custom/story-branch-workflow.md#L15)

- Injects the creation gate before a story artifact is authored.
  [`bmad-create-story.toml:6`](../../_bmad/custom/bmad-create-story.toml#L6)

- Preserves portable branch and baseline metadata in every new story.
  [`story-template.md:1`](story-template.md#L1)

**Evidence**

- Exercises isolated creation, guards, reopening, and upstream-aware merging locally.
  [`story-branch.test.sh:21`](../../scripts/v2/story-branch.test.sh#L21)

- Records the completed approved live provisioning validation.
  [`ISSUES.md:13`](../../ISSUES.md#L13)
