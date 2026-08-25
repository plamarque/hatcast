---
title: 'Worktree delivery readiness workflow'
type: 'feature'
created: '2026-08-25'
status: 'in-progress'
review_loop_iteration: 0
baseline_commit: 'fa8a8ba41c77f636e8c9d7db57e92034cdc4c909'
context:
  - '{project-root}/project-context.md'
  - '{project-root}/_bmad/custom/story-branch-workflow.md'
  - '{project-root}/_bmad-output/planning-artifacts/epic-worktree-delivery-readiness.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** A fresh isolated story worktree has the BMad runtime but lacks a non-secret contract for dependency readiness, targeted E2E proof, and a click-ready human smoke. The installed Loop preflight is also currently inconsistent with the versioned Codex integration.

**Approach:** Deliver the approved five-story Epic 21 plan: first make the actual Loop adapter and policy verifiable, then add readiness, E2E evidence, smoke handoff and lifecycle gates without changing the human integration authority.

## Boundaries & Constraints

**Always:** Keep worktree isolation; make readiness precede E2E and smoke; discover and execute targeted E2E before requesting human validation; require test, equivalent coverage, or documented human waiver for a coverage gap; retain review approval and `integrate` remote verification/cleanup guards.

**Ask First:** Select the Loop adapter/policy before queue activation. Select the `.env` reference method, dependency-download action and port strategy in 21-2; waiver authority/schema in 21-3; and smoke guide schema in 21-4. Every choice must be recorded without secrets.

**Never:** Copy, track, print, or serialise secrets; commit machine-local worktree paths; treat `start-dev.sh` as an E2E server; invent Loop state names or a gate DSL; merge, push, or clean up automatically.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|---------------|----------------------------|----------------|
| Loop preflight | Selected adapter/config | Stable green `validate --json` evidence | Keep execution unqueued on failure |
| Missing prerequisite | Dependency/browser/port absent | Readiness report and explicit preparation request | No download or process mutation without confirmation |
| No E2E match | Discovery returns no applicable spec | Test, equivalent evidence, or human waiver record | Block smoke/approval until disposition |
| Smoke request | E2E evidence available | Unit-branch URL and short guide | Stop owned processes and record result |

</frozen-after-approval>

## Code Map

- `scripts/v2/story-branch.sh` -- existing isolated unit lifecycle and explicit integration guard.
- `scripts/v2/story-worktree-bootstrap.sh` -- BMad-only provisioning boundary; does not prepare application runtime.
- `scripts/run_e2e.sh` -- current isolated E2E entrypoint and 8080/4200 ownership contract.
- `scripts/start-dev.sh` -- normal smoke server, worktree-root `.env` loader and cleanup owner.
- `apps/web/playwright.config.ts` -- named Playwright projects; no story-to-coverage discovery contract.
- `.bmad-loop/bmad_loop_hook.py`, `.codex/hooks.json` -- tracked Loop relay and Codex registration.
- `_bmad-output/implementation-artifacts/sprint-status.yaml` -- observed Loop sprint queue; numeric keys are required for selection.
- `_bmad/custom/story-branch-workflow.md` -- mandatory human-review and worktree rules.

## Tasks & Acceptance

**Execution:**
- [ ] Establish the D0 decision record and Loop adapter/policy preflight before activating Epic 21.
- [ ] Implement stories 21-1 through 21-5 in order, retaining their gates and evidence contracts in the epic plan.
- [ ] Add black-box verification for readiness, E2E disposition, smoke lifecycle and unchanged integration authority.

**Acceptance Criteria:**
- Given the approved D0 decisions, when Epic 21 is queued, then Loop preflight and dry-run select its numeric story keys successfully.
- Given a story reaches human validation, when targeted E2E coverage is absent, then an approved waiver, equivalent evidence, or new test is present before smoke.
- Given a human receives a smoke request, when they open it, then it identifies the unit branch, provides a clickable URL and short guide, includes E2E evidence, and defines a clean stop.
- Given a human approves integration, when the existing integration command runs, then its worktree, remote-verification and recoverable-cleanup behavior remains intact.

## Design Notes

Loop's verified facilities are preflight, dry-run, run status, pending decisions and operator confirmation. The workflow must encode E2E discovery, waiver and smoke evidence in project artifacts and verification commands; those gates are not native Loop states.

## Verification

**Commands:**
- `bmad-loop validate --project . --json` -- expected: green only after the approved adapter/policy story.
- `bmad-loop run --project . --dry-run --epic 21 --max-stories 1` -- expected: selects only the next approved Epic 21 story without spawning sessions.
- `bash scripts/v2/story-branch.test.sh` -- expected: existing isolation and integration guard cases remain green.
