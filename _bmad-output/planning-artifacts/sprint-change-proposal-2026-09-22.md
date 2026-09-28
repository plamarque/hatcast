---
title: 'Sprint Change Proposal — GitHub review decision controller'
status: approved
created: '2026-09-22'
type: workflow
affected_epic: '21'
---

# Sprint Change Proposal — GitHub review decision controller

## 1. Issue summary

Epic 21 currently verifies local worktree readiness, targeted E2E evidence and
human smoke handoff, while `story-branch.sh integrate` safely merges, pushes,
verifies the remote and removes the local unit. The remaining decision between
those two boundaries is informal: the repository has no machine-checkable link
between the GitHub pull request, Patrice's review decision, the PR head SHA and
the requested delivery lane.

The approved delivery model requires a controller with three separate sources
of truth:

- the repository owns local worktree and revision state;
- GitHub owns Patrice's review decision;
- BMad sprint status remains tracking only, never the delivery state machine.

## 2. Impact analysis

### Epic and story impact

Add an independent, additive story to Epic 21:

| Key | Title | Dependency | Scheduling note |
| --- | --- | --- | --- |
| 21.6 | GitHub review decision controller | existing `story-branch.sh integrate` safety contract | May be implemented while 21.4 and 21.5 remain `awaiting-operator`; it consumes their evidence when applicable but does not replace them. |

Stories **21.4 — Human smoke handoff** and **21.5 — Delivery gates and
integration** are not changed. Their current operator actions and statuses are
not proof of GitHub approval and are not defects to repair in this change.

### Artifact impact

- Update `epics.md` and `epic-worktree-delivery-readiness.md` after approval
  with story 21.6 and its independent ordering.
- Create the normal 21.6 implementation story in its isolated
  `feat/21-6-github-review-decision-controller` unit. BMad owns its sprint
  status update; no agent edits `sprint-status.yaml` directly.
- Extend `_bmad/custom/story-branch-workflow.md` and the
  `hatcast-story-lifecycle` skill to invoke the resulting controller rather
  than interpreting a review informally.
- No PRD, product architecture, API, database, Angular UI, or UX artifact
  changes are required: this is a delivery-workflow capability.

### Technical impact

The implementation will use the already authenticated GitHub CLI and the
existing local Git/worktree scripts. The MVP is deliberately fixed to the
HatCast repository and Patrice's GitHub login; it does not introduce a generic
provider abstraction, webhook receiver, credential store, background worker,
or automatic release process.

## 3. Recommended approach

Make a direct additive adjustment: introduce Story 21.6 as a bounded GitHub
review controller, then keep later release automation separate.

The controller must expose explicit operations, each with JSON evidence:

1. **Prepare review** — create or update the story PR against `v2`, attach
   exactly one lane label (`delivery:batch` by default or
   `delivery:release-now`), and report the PR URL, branch and head SHA.
2. **Inspect review** — obtain the current PR snapshot and refuse success if
   the branch, base, head SHA, delivery label, worktree state, required owner
   approval, or current `v2` state is invalid.
3. **Record conversation approval** — only after Patrice explicitly approves
   in conversation, re-read the PR head, require the exact expected SHA and
   selected lane, then use Patrice's existing GitHub identity to approve, set
   the sole lane label, and post a comment attesting the decision and SHA.
4. **Handle requested changes** — surface unresolved blocking review comments
   for repair in the live worktree. A later correction may resolve a comment by
   code or an explicit explanation; a new commit always invalidates the prior
   approval.
5. **Integrate** — perform no GitHub mutation beyond the explicit decision
   record; call the existing `story-branch.sh integrate` only after a fresh
   successful inspection. Its established remote verification and local
   decommissioning behavior remains authoritative.

The controller creates smoke artefacts only when the story has a UX surface.
For technical-only stories, it reports relevant automated verification without
inventing visual evidence.

Risk is moderate and contained: GitHub mutations are externally visible.
Every mutation therefore needs an explicit controller operation, the current
head SHA, the connected expected identity, and a deterministic test double in
the hermetic suite. The story must never delete the remote feature branch.

## 4. Detailed change proposals

### Proposal A — Add Story 21.6 to the Epic 21 plan

**New story:** `21.6 — GitHub review decision controller`

**Outcome:** A versioned repository controller binds a story worktree to its
GitHub PR, head SHA, review decision and one delivery lane before the existing
safe integration command may run.

**Acceptance criteria:**

- Given a clean registered `feat/{story-key}` worktree, when review is
  prepared, then the controller creates or updates exactly one PR targeting
  `v2`, reports its URL and head SHA, and applies only one lane label.
- Given a direct GitHub approval by Patrice with one valid lane label, when the
  controller inspects the PR, then it reports an integration-ready result only
  when the current PR head, branch, base, owner approval and clean/current
  `v2` checks all pass.
- Given Patrice explicitly approves in conversation, when the controller is
  asked to record that decision, then it re-reads the PR, refuses a changed
  head, uses Patrice's connected identity, and writes an approval, one label
  and an attestation comment naming the exact head SHA.
- Given a `Request changes` review or unresolved blocking comments, when the
  controller is inspected, then it reports repair-required evidence and never
  integrates. A new story commit requires a fresh approval.
- Given a ready result, when integration is explicitly requested, then the
  controller delegates to the existing `story-branch.sh integrate`; remote
  verification and removal of only the local unit and local branch remain
  unchanged.
- Given any invalid, stale, ambiguous or failed state, when any mutating
  command is requested, then it fails closed without approval, label, comment,
  merge, push, deployment, release or deletion.

**Implementation outline:**

- Add a small `scripts/v2/` controller plus a black-box fixture test using a
  fake `gh` executable and disposable Git repositories.
- Reuse `scripts/v2/story-branch.sh` and its test conventions; do not copy its
  integration or cleanup logic.
- Reuse and strengthen the committed `validate_pr_preflight.py` logic only as
  a shared read-only validator where appropriate.
- Update the lifecycle documentation and skill with the exact commands and
  evidence contract.

### Proposal B — Preserve existing release machinery

`delivery:batch` continues to accumulate integrated work in `v2`.
`delivery:release-now` is only the controller's explicit handoff to the
existing staging/E2E and release flow. The repository's existing
release-context and release-version mechanism remains the source for release
contents; this change creates no second release registry. A staging E2E
failure blocks the release candidate and starts targeted investigation rather
than automatically assigning blame to every included story.

## 5. Implementation handoff

**Scope classification:** Moderate — it adds a delivery control boundary and
updates the Epic 21 plan, but changes neither product behavior nor deployment
infrastructure.

**After approval:**

1. Add the approved 21.6 plan entry.
2. Create the complete 21.6 BMad implementation story through the current
   planning/tracking workflow, without direct edits to `sprint-status.yaml`.
3. Start its dedicated feature worktree from clean `v2` and implement with
   `bmad-build`.
4. Require hermetic controller tests before a PR is prepared; no production
   deployment or release is authorized by this proposal.

**Success criteria:** the first controller story provides an auditable PR/SHA
decision boundary while retaining every existing worktree, human smoke, E2E,
integration and release safety guard.
