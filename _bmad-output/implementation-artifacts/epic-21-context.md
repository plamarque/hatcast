# Epic 21 Context: Worktree delivery readiness

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Make work performed in an isolated story worktree verifiable before a human is asked to approve its integration. This developer-workflow epic strengthens delivery evidence without changing HatCast product behaviour or replacing the existing human approval and integration contract.

## Stories

- Story 21.1: Loop readiness contract
- Story 21.2: Worktree runtime readiness
- Story 21.3: Targeted E2E evidence
- Story 21.4: Human smoke handoff
- Story 21.5: Delivery gates integration

## Requirements & Constraints

- Keep the integration worktree clean and preserve the isolated unit worktree through failures. Only the established explicit integration command may merge, push, or perform recoverable cleanup after human approval.
- Validate the selected Loop adapter and local policy before queue activation. Evidence and decision artifacts must contain identifiers and outcomes only: never secrets or absolute worktree paths.
- Treat readiness inspection as non-mutating. Dependency or browser downloads require explicit confirmation; preparation must not copy `.env`, track ignored files, or disclose local configuration values.
- Before human validation, discover relevant Playwright coverage and record the selected projects/specs and rationale. Run applicable coverage in the isolated E2E environment and attest command, result, and report reference.
- If relevant E2E coverage is absent, require one recorded disposition before smoke: a test to add now, equivalent cited coverage, or an authorized human waiver.
- A smoke handoff must identify the unit branch and baseline, give a clickable URL and concise guide, carry the preceding coverage result, and state how to stop owned processes. Record the outcome without secrets.
- Workflow gates must refuse a validation request when prerequisite readiness or coverage evidence is missing. Loop confirmation may store and reverify evidence, but never constitutes Git approval.
- Verify failure paths with black-box tests, including missing prerequisites, declined downloads, port conflicts, missing evidence, and retention of the story unit on failure.

## Technical Decisions

- Use the existing isolated `e2e` profile and its dedicated entrypoint for automated E2E; a normal development server is not an E2E substitute.
- Readiness covers BMad availability, Node/npm, JDK, Playwright browser, non-secret environment reference, and port availability before automated or human validation begins.
- The local runtime uses ports 8080 and 4200. Process ownership and clean stop verification are part of the smoke contract.
- Run this epic sequentially. Loop considers backlog entries selectable, so invocations for Epic 21 must select one story at a time with `--max-stories 1`; the operator records each required human gate before starting the next story.
- Preserve the existing Git lifecycle: a clean `v2` integration worktree, a `feat/{story-key}` unit worktree, explicit human review, then the explicit integration command with its existing remote-ancestry and cleanup safeguards.

## Cross-Story Dependencies

- Story 21.1 depends on the operator choosing the locally available Loop adapter and policy, and must produce a green validation and dry-run before the remaining stories proceed.
- Story 21.2 depends on 21.1 and requires human choices for environment handoff, dependency preparation, and port strategy.
- Story 21.3 depends on 21.2 and requires a waiver authority and record format when a waiver is considered.
- Story 21.4 depends on 21.2 and 21.3, plus a human-selected smoke-guide schema.
- Story 21.5 depends on all preceding evidence contracts and must preserve the existing human integration approval boundary.
