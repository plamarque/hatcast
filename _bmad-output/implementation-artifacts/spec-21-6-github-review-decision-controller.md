---
title: 'GitHub review decision controller'
type: 'feature'
created: '2026-09-22'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
baseline_commit: '83c93d073f56233446703918692a781771580ed7'
context:
  - '{project-root}/AGENTS.md'
  - '{project-root}/skills/hatcast-story-lifecycle/SKILL.md'
  - '{project-root}/_bmad/custom/story-branch-workflow.md'
  - '{project-root}/_bmad-output/implementation-artifacts/epic-21-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** A HatCast story can be merged through the established local worktree command, but its GitHub review state is only partly formalized. The current lifecycle wrongly requires an owner `APPROVED` review, which GitHub cannot provide when Patrice is both author and sole reviewer.

**Approach:** Make the PR the durable review and comment surface, while an explicit Patrice decision — made in conversation or directly in GitHub — is attested by his connected GitHub identity with one delivery-lane label and a comment bound to the current head SHA. The controller then delegates integration only to the existing guarded command.

## Boundaries & Constraints

**Always:** Resolve exactly one open PR for the clean registered `feat/{story-key}` worktree against `v2`; report its URL and current head SHA. Require exactly one of `delivery:batch` or `delivery:release-now`. Treat an explicit conversational decision as sufficient authorization to create/update the label and attestation comment; GitHub comments remain a valid direct decision surface. Validate the PR head, lane, Patrice-authored attestation, PR state, and unresolved blocking review threads before integration. Delegate a valid request only to `scripts/v2/story-branch.sh integrate` from clean current `v2`.

**Never:** Submit a GitHub `APPROVED` review as the gate; infer consent from a vague acknowledgement; mutate labels, comments, approvals, merge, push, deploy, release, or delete when head, lane, decision, or blocking-comment state is stale or ambiguous. Do not change the ownership of `story-branch.sh` remote verification and local cleanup.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
| --- | --- | --- | --- |
| Prepare review | One clean registered feature unit, zero or one PR | Create/update one `v2` PR; emit URL, head SHA and lane state | Multiple or invalid PRs fail before mutation |
| Conversation decision | Explicit Patrice decision plus lane, unchanged head | Apply exactly one lane label and Patrice attestation containing the head SHA | Changed head fails before GitHub mutation or integration |
| Direct GitHub decision | Patrice label/comment bound to the current head | Recognize it without a formal GitHub review approval | Missing/malformed attestation fails closed |
| Blocking review | Requested changes or unresolved blocking thread | Refuse integration and retain the unit | No merge/push/cleanup |
| Integrate | Valid current evidence and explicit command | Invoke only `story-branch.sh integrate` | Its existing failure retention remains authoritative |

</frozen-after-approval>

## Code Map

- `skills/hatcast-story-lifecycle/SKILL.md` -- current delivery rules; replace formal owner-review approval with attested explicit decision semantics.
- `skills/hatcast-story-lifecycle/scripts/validate_pr_preflight.py` -- stdlib PR snapshot validator; extend its decision and blocking-thread checks while retaining clean-`v2` facts.
- `skills/hatcast-story-lifecycle/scripts/tests/test_validate_pr_preflight.py` -- hermetic unit fixtures for current, stale, ambiguous, missing and blocking states.
- `scripts/v2/story-branch.sh` -- sole integration, remote-verification and local-cleanup implementation; do not duplicate it.
- `_bmad/custom/story-branch-workflow.md` and `epic-worktree-delivery-readiness.md` -- current documentation still describes owner approval and needs the corrected human-decision contract.

## Tasks & Acceptance

**Execution:**

- [ ] `skills/hatcast-story-lifecycle/scripts/validate_pr_preflight.py` -- validate one open `v2` PR, exactly one lane, a current Patrice attestation and no blocking review state; emit redacted deterministic JSON.
- [ ] `skills/hatcast-story-lifecycle/scripts/tests/test_validate_pr_preflight.py` -- prove valid conversation/direct decisions and fail-closed stale, duplicate-lane, missing-attestation, changed-head and blocking-review cases.
- [ ] `skills/hatcast-story-lifecycle/SKILL.md` -- define preparation, explicit decision recording and integration without a GitHub approval API call.
- [ ] `_bmad/custom/story-branch-workflow.md` and `_bmad-output/planning-artifacts/epic-worktree-delivery-readiness.md` -- align the operational and Epic-21 gate wording with the approved decision model.

**Acceptance Criteria:**

- Given Patrice explicitly approves a current PR in conversation with `batch` or `release-now`, when the controller records it, then GitHub shows exactly one lane label and Patrice’s head-SHA attestation without submitting a formal review.
- Given Patrice directly sets the lane and attestation in GitHub, when the controller validates the PR, then it accepts that decision without a GitHub `APPROVED` review.
- Given the PR head changes after attestation, when integration is requested, then validation fails before any merge, push, label, comment or cleanup.
- Given requested changes or an unresolved blocking review comment, when integration is requested, then the controller fails closed and keeps the feature unit.
- Given a valid current decision, when integration is explicitly requested, then the controller delegates only to `story-branch.sh integrate` and preserves its remote-verification and cleanup behavior.

## Implementation Notes

- 2026-09-22: Patrice confirmed that a sole author/reviewer cannot use formal GitHub approval as the delivery gate. PRs remain useful for review and comments; labels and Patrice-authored attestation comments are the decision record.

## Spec Change Log

## Review Triage Log

## Design Notes

The controller is a deterministic preflight and evidence recorder. It does not become a second merger: GitHub is the review surface, conversation is a valid authorization source, and `story-branch.sh integrate` remains the only integration executor.

## Verification

**Commands:**

- `python3 -m unittest skills/hatcast-story-lifecycle/scripts/tests/test_validate_pr_preflight.py` -- expected: all valid and fail-closed PR decision fixtures pass.
- `bash scripts/v2/story-branch.test.sh` -- expected: existing merge, remote verification and cleanup safeguards remain green.
- `git diff --check` -- expected: no whitespace errors.
