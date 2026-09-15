---
title: 'Automated Story Integration'
type: 'feature'
created: '2026-08-25'
status: 'done'
review_loop_iteration: 0
baseline_commit: '07e491da7283ea3c1089330b51fc60f58bd97c5b'
context:
  - '{project-root}/AGENTS.md'
  - '{project-root}/_bmad/custom/story-branch-workflow.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** A reviewed story still requires a person to manually merge it to `v2`, push it, and remove its local worktree and feature branch. This makes the documented isolated-story workflow incomplete at the `done` transition.

**Approach:** Provide an explicit integration command that performs the approved post-review lifecycle atomically as far as Git permits: local integration, remote publication and verification, then local cleanup. Provisioning of required pinned BMad files remains part of creating every unit worktree.

## Boundaries & Constraints

**Always:** Run only from a clean `v2` integration checkout; require a valid, clean story unit; preserve the existing `start`, `assert`, `status`, and local-only `merge` semantics; push `v2`, fetch, and prove that `origin/v2` contains the integrated HEAD before local cleanup; use the existing pinned BMad bootstrap rather than copying runtime files; update operational docs only after implementation and tests pass; use English code, tests, and commit messages.

**Ask First:** Any remote feature-branch deletion, force operation, cleanup following a failed remote verification, or recovery from a non-fast-forward/rejected `v2` push.

**Never:** Automatically delete `origin/feat/{story-key}`, clean an invalid or dirty unit, use forced worktree/branch removal, or alter a previously done workflow specification to represent this new capability.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|---------------|----------------------------|----------------|
| Approved integration | Clean `v2`, clean valid unit, accepted remote push | Merge, push `v2`, fetch/verify remote contains HEAD, remove only this local unit and branch | Print integration and cleanup metadata |
| Rejected push | Remote rejects `v2` update | No cleanup of the unit or local feature branch | Leave local merge inspectable and report recovery gate |
| Unsafe state | Dirty integration/unit, absent/invalid unit, or failed verification | No destructive cleanup | Fail before cleanup with the blocking reason |
| Remote feature branch | `origin/feat/{story-key}` exists | It remains untouched | Report that remote deletion is out of scope |

</frozen-after-approval>

## Code Map

- `scripts/v2/story-branch.sh` -- lifecycle CLI; retain its path/branch validation, clean-check and local `merge`; add an explicit post-review integration command with cleanup only after remote verification.
- `scripts/v2/lib/git-branches.sh` -- shared `v2` detection, remote reference and clean-worktree helpers used by lifecycle commands.
- `scripts/v2/story-worktree-bootstrap.sh` -- versioned pinned BMad provisioning and completion-marker validation; continue to be reached by `start` rather than copying `.agents` files.
- `scripts/v2/story-branch.test.sh` -- local bare-remote black-box harness; extend with successful integration, remote rejection, verification, and cleanup safety cases.
- `_bmad/custom/story-branch-workflow.md` -- normative operational sequence, currently describes manual push and retained unit.
- `_bmad/custom/bmad-{create-story,dev-story,code-review}.toml` and `project-context.md` -- BMad gates and repository context currently prescribe manual integration; align them with the delivered command.
- `_bmad-output/implementation-artifacts/story-template.md` -- preserve portable branch/baseline metadata guidance; update only if the post-review lifecycle instruction is represented there.

## Tasks & Acceptance

**Execution:**
- [x] `scripts/v2/story-branch.sh` -- add a separately named, explicit integration lifecycle command that carries out merge, push, remote verification, and guarded local cleanup -- preserves backward-compatible manual `merge` behavior.
- [x] `scripts/v2/story-branch.test.sh` -- cover successful disposable-remote integration, retained remote feature branch, rejected/failed remote path, and all cleanup guards -- proves no data is removed before verified publication.
- [x] `_bmad/custom/story-branch-workflow.md`, `_bmad/custom/bmad-*.toml`, `project-context.md` -- document the existing delivered lifecycle and BMad post-review gate -- ensures future stories use the automation consistently.

**Acceptance Criteria:**
- Given a review-approved clean story unit and clean `v2`, when the explicit integration command succeeds, then `origin/v2` contains the integration HEAD and only that unit worktree and its local feature branch are removed.
- Given a push rejection or remote verification failure, when integration stops, then the local unit and feature branch remain available and no remote feature branch is deleted.
- Given a dirty or invalid integration/unit state, when the integration command is invoked, then it exits without merging, pushing, or cleaning up.
- Given a new unit worktree, when `start` completes, then the pinned standard BMad runtime remains provisioned and validated inside that unit.

## Spec Change Log

## Design Notes

Keep `merge` as the intentionally local-only primitive. The new explicit command communicates the higher authority of publishing and cleanup, while its ordering makes cleanup contingent on a freshly fetched remote reference that contains the local integration HEAD.

## Verification

**Commands:**
- `bash -n scripts/v2/story-branch.sh scripts/v2/story-worktree-bootstrap.sh` -- expected: shell syntax succeeds.
- `npm run test:story-worktree` -- expected: disposable Git lifecycle tests pass, including no-cleanup failure paths.
- `./scripts/v2/story-branch.sh start automated-story-integration` -- expected: the current unit asserts a valid pinned BMad runtime without storing a machine-local path in tracked story metadata.

## Suggested Review Order

**Integration safety**

- Gate the destructive lifecycle on an exact clean remote baseline.
  [`story-branch.sh:240`](../../scripts/v2/story-branch.sh#L240)

- Preserve local recovery material until a fetched remote contains the integration commit.
  [`story-branch.sh:261`](../../scripts/v2/story-branch.sh#L261)

**Operational contract**

- Make the explicit approval-to-cleanup transition visible to BMad reviewers.
  [`story-branch-workflow.md:17`](../../_bmad/custom/story-branch-workflow.md#L17)

- Keep repository-wide agent context aligned with the actual lifecycle.
  [`project-context.md:46`](../../project-context.md#L46)

**Verification**

- Exercise successful cleanup and retained recovery states against disposable remotes.
  [`story-branch.test.sh:145`](../../scripts/v2/story-branch.test.sh#L145)

- Expose the lifecycle test through a standard repository command.
  [`package.json:23`](../../package.json#L23)
