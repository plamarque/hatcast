---
id: SPEC-worktree-story-workflow
companions:
  - worktree-workflow-contract.md
  - ../../../_bmad/custom/story-branch-workflow.md
sources:
  - ../../../scripts/v2/story-branch.sh
  - ../../../project-context.md
---

> **Canonical contract.** This SPEC and the files in `companions:` define the complete contract for the manual HatCast development-worktree workflow.

# Isolated manual story worktrees

## Why

The existing HatCast story workflow creates a dedicated branch but switches the current checkout to it. That prevents a second story from progressing while the first is active, and it leaves local BMad runtime files absent from a fresh Git worktree. Developers need a repeatable manual path that isolates each story without disturbing `v2` or another active checkout.

## Capabilities

- id: CAP-1
  intent: A developer can start a story or bug in a dedicated Git worktree and branch derived from the current V2 integration baseline.
  success: Starting a valid work key creates or reuses one deterministic adjacent worktree on its dedicated branch; the integration worktree is left on `v2` and its files are unchanged.

- id: CAP-2
  intent: A fresh dedicated worktree can run the HatCast BMad workflows required for manual story delivery.
  success: The start operation provisions and validates the local BMad runtime before handoff; a required skill and `_bmad/scripts/memlog.py` are available in the new worktree without a developer copying ignored files manually.

- id: CAP-3
  intent: Manual BMad create, development, and review workflows identify the active story worktree and refuse to edit code or story artifacts from the integration worktree.
  success: Each story artifact records its feature branch and baseline commit; the workflow derives and verifies its machine-local worktree path, and an invocation from another checkout stops with an actionable message.

- id: CAP-4
  intent: A completed isolated unit returns to V2 through an explicit, review-gated integration path.
  success: Review happens on the unit branch; merge and push remain separate explicit operations; failed or unfinished worktrees remain inspectable and are never removed automatically.

## Constraints

- `v2` remains the integration branch and is never a manual story-development checkout.
- The baseline follows the existing `origin/v2` policy after an explicit fetch; an integration checkout on `v2` must be clean before creating a unit.
- The existing `feat/{story-key}` naming and frontmatter metadata remain compatible.
- The implementation must not modify, switch, clean, merge, or delete another Git worktree.
- The bootstrap must be reproducible from repository-owned instructions and validate required files; the presence of a directory alone is not proof that BMad is usable.
- Worktrees and their ignored local configuration may be machine-local; the policy, script, and validation must be versioned.

## Non-goals

- Running several stories automatically inside one BMad Loop run.
- Automatic merge, push, branch deletion, or worktree deletion.
- Changing product behavior, deployment branches, or the V2 release process.
- Copying arbitrary developer secrets or local data into a worktree.

## Success signal

With one active story worktree already modifying code, a developer starts a second independent work key from the clean V2 integration worktree. The command creates a separate branch and directory, makes the required BMad workflow available there, and leaves the first story and `v2` untouched. After review, each unit can be integrated deliberately, one at a time.

## Resolved decisions

| ID | Decision |
| --- | --- |
| D-1 | Story frontmatter stores only the feature branch and baseline commit. The worktree path is derived and verified locally, never committed as machine-specific metadata. |
| D-2 | `scripts/v2/bmad-runtime.env` pins `bmad-method` and the installed modules. The bootstrap invokes that installer only for the requested clean unit, after explicit network confirmation when its cache is insufficient, then verifies a completion marker together with the standard `bmad-create-story`, `bmad-dev-story`, and `bmad-code-review` skills, tracked BMad scripts, and policy. It restores installer-written tracked `_bmad/` files before returning, while retaining the ignored IDE skills. Tests inject a local provisioner; it never copies secrets, arbitrary ignored data, or another checkout. A live pinned-installer run passed on 2026-08-25. |
