---
name: hatcast-story-lifecycle
description: Coordinates a HatCast story delivery lifecycle. Use when the user says "start story delivery", "review this story", "approve this PR", "request story changes", or "prepare a HatCast release".
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

Identify the requested operation and story key first; ask only for either item
that is missing. Then read `{project-root}/AGENTS.md`, the relevant story
specification and `{project-root}/_bmad/custom/story-branch-workflow.md`.

The repository controller owns local worktree and revision state. GitHub owns
Patrice's review decision. `sprint-status.yaml` remains BMad tracking and is
never used as the delivery state machine.

For a review or integration decision, obtain the GitHub PR JSON snapshot, then
run `uv run scripts/validate_pr_preflight.py --pr-json <snapshot> --project-root {project-root} --expected-owner <GitHub-login> --require-approval` to validate
its head, delivery label, owner approval and clean `v2` facts. Reason from its
JSON result; if it cannot run, report that limitation and do not mutate GitHub.

## Choose the operation

- **Provision or repair** — from a clean `v2`, run
  `{project-root}/scripts/v2/story-branch.sh start <story-key>`; run `assert` from the unit
  before code changes. Reopen the same unit only before integration.
- **Prepare review** — require committed, targeted verification. For UX work,
  create the prescribed smoke evidence; for technical-only work, report the
  relevant verification without inventing visual artefacts. Open or update the
  story PR and present its head revision and evidence.
- **Handle review** — a GitHub `Request changes` authorizes repair from
  unresolved blocking comments in the live unit. Resolve each comment with a
  correction or an explicit explanation. Any new commit requires fresh review.
- **Approve and integrate** — accept only Patrice's GitHub approval or his
  explicit conversation approval. Conversation approval names only
  `batch` or `release-now`; re-read the PR head, refuse if it changed, then use
  Patrice's connected GitHub identity to approve, set exactly one
  `delivery:<lane>` label and attest the head SHA in a comment. Refuse
  integration without approval and exactly one lane. From clean, current `v2`,
  run `{project-root}/scripts/v2/story-branch.sh integrate <story-key>`.
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
- Never merge, push, label, approve, comment, deploy, release or delete from a
  vague acknowledgement. Explain the proposed external action and obtain the
  explicit decision first.
- BMAD Loop may only be introduced through a version-pinned proof of concept;
  it must not supersede this controller for integration or decommissioning.
