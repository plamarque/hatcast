---
id: SPEC-deterministic-worktree-lifecycle
companions:
  - lifecycle-contract.md
sources:
  - ../../../scripts/v2/story-branch.sh
  - ../../../.bmad-loop/policy.toml
  - ../spec-worktree-story-workflow/SPEC.md
---

> **Canonical contract.** This SPEC and `lifecycle-contract.md` define the complete contract for deterministic HatCast story-unit preparation, review handoff, integration, and local cleanup.

# Deterministic story worktree lifecycle

## Why

An unattended Loop sweep currently pauses when its required external `feat/{story-key}` worktree has not been created manually. This is an operational gap: an agent may forget an essential prerequisite, while the existing `story-branch.sh` commands already provide the safe unit and integration operations. Operators need a deterministic lifecycle that prepares the right unit before either a normal Loop story or a sweep bundle runs, then makes the review-gated integration and cleanup path explicit and repeatable.

## Capabilities

- **CAP-1**
  - **intent:** The system can prepare or reopen the one permitted external story worktree before a Loop story or sweep bundle starts.
  - **success:** From a clean V2 integration checkout, a missing eligible `feat/{story-key}` unit is created through the repository-owned start contract before Loop evaluates its external-worktree precondition; an existing valid unit is reused, and any invalid state stops with an actionable failure.

- **CAP-2**
  - **intent:** An operator can receive a deterministic post-delivery handoff that identifies the preserved unit and the next required review or integration action.
  - **success:** Every completed or paused external unit produces a durable, non-secret handoff containing its story key, branch, worktree path, outcome, verification evidence locations, and the exact explicit command or review action required next.

- **CAP-3**
  - **intent:** An authorized operator can integrate a reviewed unit and reclaim its local worktree through one controlled command.
  - **success:** The command delegates to the existing integration contract only after explicit operator approval, and reports merge, push, remote-ancestry verification, and local cleanup separately; on any failed condition the unit remains intact for inspection.

- **CAP-4**
  - **intent:** A developer can begin `bmad-build` or `bmad-build-auto` only from the validated story unit associated with the requested key.
  - **success:** The supported launch path creates or reuses the unit, verifies branch and runtime readiness, invokes the selected build skill in that unit, and refuses an integration checkout, a mismatched key, or an unprepared worktree.

## Constraints

- `v2` remains the clean integration checkout; story code and story artifacts are never developed there.
- The feature branch remains `feat/{story-key}` and the adjacent worktree path remains derived locally rather than persisted in versioned story metadata.
- Loop preparation must use declarative project hooks at `pre_story` and `pre_bundle`, because these run before the Loop external-worktree check.
- The implementation reuses and strengthens `scripts/v2/story-branch.sh`; it does not duplicate Git branch, merge, remote verification, or cleanup logic.
- Integration requires an explicit human review and explicit operator approval. No hook, build skill, sweep, or controller may infer either approval.
- Local cleanup occurs only after the existing integration command reports a successful push and remote-ancestry verification. Failed, paused, or unreviewed units are preserved.
- Handoffs and logs contain no secrets and do not copy ignored user configuration between worktrees beyond the established runtime bootstrap contract.
- The lifecycle changes must be testable with isolated Git fixtures and must not modify unrelated worktrees.

## Non-goals

- Automatic approval, merge, push, remote branch deletion, or local worktree deletion.
- Changing product behavior, Epic 21 acceptance criteria, deployment, or release workflows.
- Replacing `bmad-loop` upstream external-worktree semantics or patching its installed package.
- Dispatching these stories while the existing Epic 21 operator gates (21-4 and 21-5) remain unresolved.

## Success signal

For a selected Loop story or sweep bundle with no pre-created unit, the deterministic preparation step creates the correct isolated worktree before development begins. After implementation and human review, an operator sees one unambiguous integration handoff and can integrate successfully with verified cleanup, while any failed path leaves the unit available for inspection.
