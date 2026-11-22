---
name: hatcast-story-lifecycle
description: Coordinates HatCast story delivery and incoming pull request review and local integration. Use for story delivery, an incoming PR, review decisions, or HatCast release preparation.
---

# HatCast story lifecycle

## Overview

Act as HatCast's delivery controller. Coordinate a story from its isolated
worktree through evidence, human review, integration and release without
replacing deterministic repository scripts. The consumer is Patrice: every
action must leave him an auditable PR, exact revision and clear next decision.

## Resolution rules

- Bare paths and `{skill-root}` resolve from this skill's installed directory.
- `{project-root}` → the project working directory.
- `{skill-name}` → the skill directory's basename.

## On Activation

Identify whether the work is a HatCast story or an incoming PR. For an incoming
PR, use the separate procedure below; do not treat it as a story. For a story,
identify the requested operation and story key first; ask only for either item
that is missing. Then read `{project-root}/AGENTS.md`, the relevant story
specification and `{project-root}/_bmad/custom/story-branch-workflow.md`.

The repository controller owns local worktree and revision state. GitHub owns
Patrice's review decision. `sprint-status.yaml` remains BMad tracking and is
never used as the delivery state machine.

For a review or integration decision, resolve exactly one open PR from the
registered `feat/{story-key}` unit to `v2`. Report its URL and current head
SHA. Capture a snapshot containing `number`, `url`, `state`, `baseRefName`,
`headRefName`, `headRefOid`, `labels`, `comments`, `reviews` and
`reviewThreads`, with every connection fully paginated, then run:

```bash
uv run scripts/v2/validate_pr_preflight.py --pr-json <snapshot> \
  --project-root {project-root} --expected-owner <Patrice-GitHub-login>
```

The validator accepts one PR only, requires an open `v2` PR, one delivery lane,
Patrice's current lane-and-SHA attestation, no requested changes, no unresolved
review thread, and a clean `v2` checkout. Every unresolved review thread is
blocking for this controller. Its JSON is the decision evidence. If it
cannot run or any check fails, report the limitation and do not mutate GitHub.

Use the versioned controller, rather than reconstructing its GitHub calls:

```bash
python3 {project-root}/scripts/v2/github_review_decision_controller.py \
  <prepare|record|preflight> --story-key <story-key> \
  --project-root {project-root} --expected-owner <Patrice-GitHub-login> \
  [--lane <batch|release-now>]
```

`prepare` resolves or creates the single PR and captures every snapshot page;
`record` writes the explicitly authorised lane and attestation, then re-reads
and validates it; `preflight` only captures and validates.

## Incoming pull requests

An incoming PR is a proposed contribution, not necessarily a tracked story or
a branch owned by Patrice. Identify it by repository and PR number; use
`pr-<number>` as its local unit key (for example `pr-21`). Read its actual
base, head SHA, changes and review state before acting, and recheck the head
before integrating. Never invent a story or add it to `sprint-status.yaml`.

The current `story-branch.sh start` validates story keys against the epic
registry and does not support arbitrary PR keys. Do not repeatedly invoke it or
claim it supports `pr-<number>`. If no dedicated incoming-PR controller exists,
prepare an isolated Git worktree and local branch for the exact PR head; record
the repository, PR URL, base and head. Keep unrelated work and the integration
checkout intact. Apply requested fixes and run checks in that unit. Review the
PR against its own merge base and separately assess conflicts against current
`v2`; document any test or human-smoke gaps.

When Patrice explicitly requests local closure, commit only the accepted PR
work and local corrections, reconcile conflicts as authorized, integrate into a
clean `v2` and verify the final tree and ancestry. Preserve the original PR
commit in the local history when practical so an eventual push can associate the
contribution with the PR. Clean up only this unit after verified local
integration. Local closure does not authorize a push, deployment, GitHub
comment, PR closure or remote branch deletion. If a push is separately
authorized, verify the remote commit and inspect whether GitHub marked the PR as
merged indirectly; do not assume it did. Do not push fixes to the author's PR
branch unless explicitly requested.

## Local stack ports

Story provisioning reserves a reusable front/API port pair for the worktree.
For a local human smoke, use the assigned pair and the actual URLs printed by
`start-dev.sh`; for phone testing, use its explicit-port Tailscale URL when
available. If a reserved port is occupied, let the launcher allocate a new
pair; never stop an unrelated process. Stopping the stack retains its worktree
reservation. During authorised cleanup, stop only owned processes and routes;
removing the worktree releases its reservation for subsequent allocations.
The independent E2E contract uses fixed ports 4200 and 8080. For commands,
recovery and platform limitations, follow `{project-root}/DEVELOPMENT.md`
and `{project-root}/_bmad/custom/story-branch-workflow.md`.

## Choose the operation

- **Provision or repair** — from a clean `v2`, run
  `{project-root}/scripts/v2/story-branch.sh start <story-key>`; run `assert` from the unit
  before code changes. The controller automatically provisions the pinned BMad runtime,
  including its download when needed, without a separate confirmation. Reopen the same
  unit only before integration.
- **Prepare review** — require committed, targeted verification. For UX work,
  create the prescribed smoke evidence; for technical-only work, report the
  relevant verification without inventing visual artefacts. Create or update
  one PR from the registered feature unit to `v2`, then present its URL, head
  SHA and current lane state. Multiple or invalid PRs fail before any mutation.
- **Handle review** — a GitHub `Request changes` authorizes repair from
  unresolved blocking comments in the live unit. Resolve each comment with a
  correction or an explicit explanation. Any new commit requires fresh review.
- **Record decision** — accept only Patrice's explicit conversational decision
  naming `batch` or `release-now`, or his direct GitHub decision. A vague
  acknowledgement is never a decision. Before a conversational mutation,
  re-read the PR head, labels, requested changes and review threads; stop if
  the PR is ambiguous, closed, targets another branch, has a changed head, or
  has requested changes or an unresolved thread. Use Patrice's connected
  identity to leave exactly one label, `delivery:batch` or
  `delivery:release-now`, and this exact comment line:
  `HatCast delivery decision: lane=delivery:<lane> head_sha=<current-40-character-sha>`.
  Re-read the snapshot and require the successful validator before integration.
  Do not call a GitHub approval API or submit an `APPROVED` review.
- **Integrate** — require the successful current preflight above and an
  explicit integration request. A changed head, missing/malformed attestation,
  requested changes, or unresolved review thread fails closed before any label,
  comment, merge, push or cleanup. From clean, current `v2`, invoke only
  `{project-root}/scripts/v2/story-branch.sh integrate <story-key>`.
- **Release follow-up** — `delivery:release-now` proceeds through the existing
  staging/E2E and promotion flow. `delivery:batch` waits for the existing
  release-context/release-version flow; do not create a second batch registry.
  A release E2E failure blocks the RC and starts targeted investigation from the
  existing commit range and artifacts. Never automatically blame or regress all
  included stories.

## Boundaries

- After a verified integration, the existing script removes the local unit and
  local feature branch. A later failure starts a new correction unit from the
  current `v2`; use PR, integrated SHA and evidence for attribution.
- Never merge, push, label, comment, deploy, release or delete from a vague
  acknowledgement. Explain the proposed external action and obtain the explicit
  decision first. A direct GitHub label/comment is valid only when it satisfies
  the current snapshot validator; a formal GitHub approval is neither required
  nor used as the delivery gate.
- BMAD Loop may only be introduced through a version-pinned proof of concept;
  it must not supersede this controller for integration or decommissioning.
