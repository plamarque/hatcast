# Epic 21 Context: Worktree delivery readiness

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Make manually delivered BMad stories verifiable inside their isolated worktrees before requesting human integration approval. The epic adds non-secret readiness, targeted E2E and coverage evidence, a click-ready smoke handoff, and a GitHub review decision tied to the exact PR head, while preserving the existing explicit worktree-integration contract.

## Stories

- Story 21.1: Loop readiness contract
- Story 21.2: Worktree runtime readiness
- Story 21.3: Targeted E2E evidence
- Story 21.4: Human smoke handoff
- Story 21.5: Delivery gates and integration
- Story 21.6: GitHub review decision controller

## Requirements & Constraints

- The selected local Loop adapter and non-secret policy must pass JSON validation before queue activation. A dry run must select the numeric story key; use `--max-stories 1` for every Epic 21 invocation because backlog entries are selectable.
- Readiness must inspect prerequisites without mutation. Dependency downloads require explicit human confirmation; environment handling must reference existing local values without copying, tracking, printing, or serialising secrets or absolute worktree paths.
- Targeted Playwright coverage must be discovered and justified before human validation. Run it only after readiness under the isolated E2E profile; record the command, exit result, report reference, and selected projects/specs. If no relevant E2E exists, require exactly one disposition: a test to write now, cited equivalent coverage, or an authorised, expiring waiver.
- A smoke request requires the prior E2E result or accepted disposition. Its handoff identifies the unit branch/baseline, clickable URL, concise actions and expected observations, account or fixture reference, owner, and explicit stop action. Record the outcome without secrets and verify owned processes stop cleanly.
- Existing integration approval remains human-only: Loop confirmation is not Git approval. Integration must be refused when required readiness, coverage, review, or smoke evidence is absent, stale, ambiguous, or failed; retain the unit for repair on every failure.
- For review, a clean registered `feat/{story-key}` worktree maps to exactly one PR targeting `v2`, with its URL and current head SHA reported and exactly one lane label: `delivery:batch` or `delivery:release-now`. Patrice's direct GitHub label and head-SHA attestation, or his explicit conversational decision, must bind to that current SHA without a formal GitHub approval. Requested changes, unresolved blocking comments, invalid PR state, missing or stale attestation, or a changed head fail closed before any mutation.

## Technical Decisions

- The existing Git lifecycle is authoritative: a clean `v2` integration worktree and adjacent unit worktree, followed by explicit human review and the existing `scripts/v2/story-branch.sh integrate` command.
- `run_e2e.sh` is the isolated E2E entrypoint. It needs dependencies, a JDK, Playwright Chromium, and ports 8080/4200 for Spring's `e2e` plus H2 and Angular. Do not substitute the normal development server as the E2E server.
- `start-dev.sh` serves smoke from the unit worktree's `.env` on 8080/4200 and owns normal cleanup; it does not supply an E2E, environment-file, or port-selection contract.
- The controller delegates a valid explicit integration request only to `story-branch.sh integrate`. That command alone retains responsibility for push, remote verification, and recoverable local worktree/branch cleanup. The controller must not merge, push, deploy, release, delete, or change approvals/labels/comments on an ambiguous or stale state.
- Use black-box workflow tests for readiness and delivery contracts; use hermetic GitHub CLI fixtures to prove stale, ambiguous, unapproved, and changed-head review states fail closed.

## Cross-Story Dependencies

- Stories 21.1–21.5 are sequential: adapter/policy readiness enables runtime readiness, which enables targeted E2E, then the smoke handoff, then delivery-gate integration.
- Story 21.6 depends only on the existing `story-branch.sh integrate` contract. It is additive and may proceed while 21.4 and 21.5 await an operator; it consumes their evidence when applicable without weakening their human gates.
