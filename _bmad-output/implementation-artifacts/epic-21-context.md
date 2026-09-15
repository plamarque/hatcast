# Epic 21 Context: Worktree delivery readiness

<!-- Generated from planning artifacts. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Make each manually delivered BMad story verifiable from its isolated unit worktree before a human is asked to approve integration. The epic strengthens delivery evidence without changing HatCast product behaviour or replacing the existing explicit human integration approval.

## Stories

- Story 21.1: Loop readiness contract
- Story 21.2: Worktree runtime readiness
- Story 21.3: Targeted E2E evidence
- Story 21.4: Human smoke handoff
- Story 21.5: Delivery gates and integration

## Requirements & Constraints

- The selected local Loop adapter and policy must be validated before execution; readiness artifacts contain identifiers and outcomes only, never secrets or absolute worktree paths.
- Each Epic 21 invocation must select at most one story. Stories proceed strictly in order, and the operator starts a successor only after recording the prior required human gate.
- The adapter choice is an operator-owned prerequisite. Later decisions are deferred to the first story that needs them: environment/dependency/port handling for runtime readiness, waiver authority and expiry for coverage, and the smoke-guide schema for human testing.
- Runtime readiness must inspect BMad, Node/npm, JDK, Playwright browser, environment-reference, and port state without mutation. Downloads require explicit human confirmation.
- Preparation must not copy, track, print, or serialize environment values or ignored files. E2E must use the isolated E2E setup, rather than a normal development API.
- Before human validation, record the relevant Playwright projects/specs and rationale. Run applicable targeted E2E after readiness and retain the command, exit result, and report reference.
- If no relevant E2E exists, require exactly one documented disposition: a test to add now, cited equivalent coverage, or an authorized human waiver.
- Preserve the product-quality baseline: critical paths need automated regression coverage, and a disabled test cannot be used to pass a delivery gate without an explicit waiver.
- A smoke handoff needs a clickable URL, concise guide, branch and baseline identity, prior E2E result, owner, and explicit stop action. Record the clean stop result without secrets.
- Do not request human validation until readiness and E2E evidence or a valid coverage disposition exist. Loop confirmation may reverify evidence but cannot assert Git approval.
- On any gate failure, stop at that gate: do not queue execution after failed preflight, run E2E or smoke after failed readiness, request smoke after missing coverage disposition, or recommend integration after incomplete smoke evidence.

## Technical Decisions

- Retain the delivery model: a clean `v2` integration worktree, an adjacent `feat/{story-key}` unit worktree, explicit human review, then the established integration command and its existing safety guards.
- Use the Loop JSON validation and a dry run that recognizes a numeric queued story key as the pre-execution readiness evidence.
- Treat readiness, coverage, smoke, and review/integration as separate gates. A failed gate preserves the unit and prevents the next activity; it does not weaken integration or cleanup protections.
- Isolated E2E requires its dedicated profile and prerequisites, including dependencies, JDK, Playwright Chromium, and its reserved ports. Development startup is a separate smoke mechanism and does not substitute for E2E.
- Smoke startup must use the selected unit branch and the chosen non-secret environment handoff. Its short guide identifies the route, account or fixture reference, actions, expected observations, E2E result, URL, and stop command.
- Use black-box workflow tests to prove gate ordering and evidence retention on every failure path.

## Cross-Story Dependencies

- 21.2 depends on 21.1 and the operator's environment, dependency, and port decisions.
- 21.3 depends on 21.2 and the waiver-policy decision.
- 21.4 depends on 21.2, 21.3, and the smoke-guide decision.
- 21.5 depends on completion of 21.1 through 21.4; human review approval remains required before integration.
