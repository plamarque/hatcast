---
title: 'Additive BMad sprint-status synchronization'
type: 'bugfix'
created: '2026-09-22'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
baseline_commit: 'b580b16226116d64d22245e664823e023f9c4667'
context:
  - '{project-root}/AGENTS.md'
  - '{project-root}/_bmad/custom/story-branch-workflow.md'
  - '{project-root}/_bmad-output/planning-artifacts/epics.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** BMad Sprint Planning can detect the new `21-6-github-review-decision-controller` entry but its full regeneration would remove 238 historical tracking keys that are not represented by the current epics document. The runtime implementation is ignored under `.agents/`, so a direct patch would be lost on the next BMad update. A story must have its BMad key before Build begins, while its unit must stay clean for the existing integration command.

**Approach:** Add a small, versioned HatCast controller invoked by the story-worktree lifecycle. It validates that a requested key exists in the canonical `epics.md`, adds only that missing key with `backlog` status while preserving the YAML document and historical entries, then creates one BMad-owned `chore(bmad)` metadata commit on the feature branch. The existing full BMad generator remains unchanged and continues to report orphan drift rather than deleting it.

**2026-09-23 approved extension:** after Patrice confirms an evidence-backed reconciliation, the same controller may update only the explicitly named canonical keys to explicitly named legal statuses. It preserves all other lines and historical entries, is idempotent, and cannot regenerate the file.

## Boundaries & Constraints

**Always:** Run only from the registered feature-unit lifecycle after `story-branch.sh` has validated the clean `v2` integration checkout. Parse the canonical Epic/Story headings and reject a key absent from them. Preserve all existing `development_status` entries, comments, top-level metadata and `action_items`; make the operation idempotent; emit redacted semantic result fields only. Keep `sprint-status.yaml` under the BMad controller, never under ad-hoc agent editing. Retain the existing `story-branch.sh` integration, remote verification and local cleanup safety checks.

**Never:** Patch `.agents/skills/bmad-sprint-planning` or alter its full-regeneration semantics; delete, rename, downgrade, reorder, or normalize unrelated status entries; create a worktree, push, merge, release, deploy, or delete a branch as part of an additive status operation; put absolute paths, environment values, or credentials in result artifacts; silently tolerate a missing or ambiguous Epic/Story definition.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
| --- | --- | --- | --- |
| Add planned story | Key has one canonical Epic/Story definition and is absent from tracking | Adds only that key as `backlog`, preserves all retained entries, reports `TRACKING=added` | Leaves the worktree unchanged on parse or write failure |
| Idempotent retry | Key already exists with a legal status | Reports `TRACKING=present` and changes no bytes | Does not downgrade or rewrite the mapping |
| Unknown or ambiguous key | No exact definition, duplicate definition, malformed mapping, or illegal key | Refuses before any write | Reports a semantic error and preserves the original file byte-for-byte |
| Historical drift | Existing tracking contains keys absent from epics | Retains all of them during the additive operation | Reports their count only; does not call full generation |
| Lifecycle integration | A planned story is provisioned through the approved lifecycle | The BMad-owned status change reaches the selected Git location and the unit is clean before Build | Fails closed if the status commit or its verification fails |

</frozen-after-approval>

**Decision:** `story-branch.sh start` creates the BMad-owned tracking commit in `feat/{story-key}` before Build. The PR exposes the transition, the worktree is clean, and the status reaches `v2` with the implemented story. It never creates a separate integration-branch metadata commit.

## Code Map

- `scripts/v2/story-branch.sh` -- deterministic provision/assert/integrate lifecycle; the only appropriate project hook for story-key provisioning.
- `scripts/v2/story-branch.test.sh` -- disposable bare-remote fixture pattern and lifecycle regression suite.
- `.agents/skills/bmad-sprint-planning/scripts/sprint_plan.py` -- ignored upstream generator; use only as behavioral reference, never modify.
- `_bmad/custom/story-branch-workflow.md` -- normative BMad/worktree procedure that must describe the new controller boundary.
- `_bmad/custom/bmad-build.toml` -- versioned Build customization, if required to recognize a controller-owned transition.
- `package.json` -- registers hermetic story-worktree commands.

## Tasks & Acceptance

**Execution:**

- [ ] `scripts/v2/story-status-sync.py` -- add a standard-library, exact-key additive controller that validates `epics.md`, preserves the existing YAML document, and produces stable semantic output.
- [ ] `scripts/v2/story-status-sync.test.sh` -- cover addition, idempotency, retained historical entries, unknown/ambiguous key refusal, malformed state and byte-preserving failures in disposable fixtures.
- [ ] `scripts/v2/story-branch.sh` and `scripts/v2/story-branch.test.sh` -- invoke the controller only on successful unit provisioning, enforce the approved clean-state commit policy, and retain all existing failure and cleanup guarantees.
- [ ] `package.json` -- expose the hermetic controller suite through an npm command.
- [ ] `_bmad/custom/story-branch-workflow.md` and `_bmad/custom/bmad-build.toml` -- document the BMad-owned tracking boundary and the permitted clean-state transition without weakening human review or integration gates.

**Acceptance Criteria:**

- Given 238 historical entries not found in the current epics, when a new planned story is synchronized, then all 238 remain and only the selected key is added.
- Given a repeated provision of the same planned story, when the controller runs again, then it reports the existing status without altering the tracking file or creating a second metadata commit.
- Given a key not defined exactly once in `epics.md`, when provisioning is requested, then the controller exits non-zero before modifying tracking, Git state, or worktree ownership.
- Given a successfully provisioned planned story, when BMad Build starts, then the story key resolves from `sprint-status.yaml` and the unit satisfies the existing clean-worktree rule.
- Given an integration attempt after a successful story, when `story-branch.sh integrate` runs, then its existing push verification and removal of only the local unit and local feature branch still pass.

## Implementation Notes

- 2026-09-22: Full BMad generator dry-run found `21-6-github-review-decision-controller` but reported 238 dropped orphans. No status write was performed.
- 2026-09-22: Worktree bootstrap exposed a stale 6.11 pin after the BMad 6.12 upgrade. `b580b162` aligns the tracked runtime pin and its hermetic lifecycle test passes.

## Spec Change Log

## Review Triage Log

| Finding | Verdict | Route | Evidence |
| --- | --- | --- | --- |
| blind-1 retained statuses | high | patch | The tracked mapping contains `cancelled` and `awaiting-operator`; rejecting them prevents the requested story from starting. |
| blind-2 enclosing Epic | medium | patch | A story heading under a different nearest Epic can be accepted because the parser only checks for any earlier Epic. |
| blind-3 terminal newline | medium | patch | Insertion after an unterminated status line concatenates YAML entries. |
| blind-4 atomic write | medium | patch | Direct replacement can truncate the tracked file on an I/O failure, violating byte-preserving refusal. |
| blind-5 broad YAML syntax | false | reject | The controller deliberately accepts the repository's simple generated mapping and refuses unsupported syntax before any write; no supported input was shown to fail. |
| blind-6 dirty reopened unit | medium | patch | The pre-existing dirty state is checked after the controller writes, leaving an uncommitted tracking change on failure. |
| blind-7 orphan fixture placement | low | patch | The 238 fixture lines were below `action_items`, so the test did not prove the reported orphan count. |
| blind-8 commit-boundary failure coverage | low | patch | The lifecycle test needed a dirty-reopen refusal assertion to prove no tracking mutation or extra commit. |
| edge-1 terminal newline | medium | carried patch | Same verified missing-terminal-newline defect as blind-3. |
| edge-2 atomic write | medium | carried patch | Same verified direct-write truncation defect as blind-4. |
| edge-3 enclosing Epic | medium | carried patch | Same verified nearest-Epic validation defect as blind-2. |
| edge-4 preserve claim | medium | carried patch | Same verified atomic-write contradiction as blind-4. |
| edge-5 add claim | medium | carried patch | Same verified terminal-newline contradiction as blind-3. |
| verification-1 duplicate unrelated Epics | high | patch | `epics.md` repeats earlier Epic headings while Story 21.6 is unique; global duplicate rejection blocks provision. |
| verification-2 retained statuses | high | carried patch | Same verified real status-vocabulary defect as blind-1. |

## Design Notes

The controller is deliberately project-owned because BMad's installed script is ignored and update-managed. Its contract is narrower than full sprint planning: one known key may be added; no existing key may be removed or transformed.

## Verification

**Commands:**

- `bash scripts/v2/story-status-sync.test.sh` -- expected: all additive and refusal fixtures pass.
- `npm run test:story-status-sync` -- expected: the package entry runs the same hermetic suite.
- `bash scripts/v2/story-branch.test.sh` -- expected: existing worktree lifecycle guarantees remain green.
- `git diff --check` -- expected: no whitespace errors.
