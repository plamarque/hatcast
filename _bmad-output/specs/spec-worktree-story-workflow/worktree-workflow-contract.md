# Worktree workflow contract

## Terms

| Term | Meaning |
| --- | --- |
| Integration worktree | The clean checkout on `v2`; it prepares and integrates units but contains no active story edits. |
| Unit | One user story, bug, documentation change, or operations change identified by a safe work key. |
| Unit worktree | The dedicated directory and branch for one unit. It is the only location where that unit's code and artifacts are edited. |
| Baseline | The fetched `origin/v2` commit from which the unit branch is created. |

## Required lifecycle

1. Validate the integration worktree, its `v2` branch, a clean index, and the requested safe work key.
2. Fetch the V2 baseline and create or locate the deterministic unit branch and worktree.
3. Bootstrap the BMad runtime in the unit worktree and verify the exact required files and skills.
4. Start BMad manual work only from the unit worktree. Record the branch and baseline commit in the story metadata; derive the worktree location locally rather than committing an absolute path.
5. Review the unit branch against its baseline. On approval, merge it explicitly into `v2` from the integration worktree. Push only with a separate explicit request.
6. Preserve a failed or unfinished unit worktree. Removal is an explicit post-integration maintenance action.

## Safety gates

The workflow must stop before mutation when any condition below is true:

- `v2` is not the active integration branch or has uncommitted changes;
- the unit branch is checked out in a different worktree;
- the requested directory conflicts with a non-worktree path;
- the baseline cannot be resolved after fetch;
- BMad provisioning or validation is incomplete;
- a command would affect a worktree other than the integration worktree or the requested unit worktree.

## Runtime provisioning boundary

Tracked policy files already describe the HatCast workflow, while `.agents/skills` and parts of `_bmad/` can be ignored local installation files. The bootstrap must make a new worktree independently usable and must exclude secrets, environment files, generated build outputs, and unrelated working changes. It must report its source, installed version, and verification result.

## Compatibility

`scripts/v2/story-branch.sh` and `_bmad/custom/story-branch-workflow.md` are the current branch-only contract. The implementation extends their start, assert, status, and merge semantics with worktree awareness while retaining their review-before-merge and no-automatic-push rules.
