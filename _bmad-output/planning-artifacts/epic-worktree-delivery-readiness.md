---
title: 'Epic — Worktree delivery readiness'
status: proposed
created: '2026-08-25'
type: workflow
source: 'PERF-03 delivery retrospective'
---

# Epic — Worktree delivery readiness

## Intent

Make every manually delivered BMad story ready to verify in its isolated
worktree before a human is asked to approve it. The workflow must prepare the
local runtime, prove targeted automated non-regression where available, and
make the human smoke test a short, link-first step.

This epic concerns developer workflow and local verification. It does not
change HatCast product behaviour.

## Problem observed

The PERF-03 follow-up was correctly isolated in a `feat/{story-key}`
worktree, but a new worktree did not contain the ignored local files needed to
run it:

- `node_modules` was absent, so project dependencies had to be installed.
- `.env` was absent, while `start-dev.sh` reads its environment from the
  worktree root.
- Targeted Playwright E2E required their own runtime and exclusive ports
  8080/4200; a normal local development stack had to be stopped first.
- Human smoke required manually starting the correct worktree and then
  sharing its local URL.

Ignored secrets and generated dependencies must remain ignored. The gap is a
missing readiness contract, not a reason to commit or copy them.

## Outcomes

1. A story worktree can report whether it is ready for implementation,
   targeted E2E, and human smoke.
2. Before human approval is requested, the workflow discovers and runs the
   targeted E2E coverage for the changed capability.
3. If no relevant E2E exists, the missing coverage is explicit and receives a
   human disposition: add it now, cite equivalent coverage, or approve a
   documented waiver.
4. Human smoke starts the application from the story worktree and returns a
   directly clickable URL plus a concise guide derived from the story
   acceptance criteria and changed behaviour.
5. Integration remains explicitly human-approved and retains the existing
   remote-verification-and-cleanup guard.

## Required workflow order

```text
Create isolated story worktree
  -> prepare and verify local readiness
  -> implement, unit test, and build
  -> discover and run targeted E2E
  -> resolve any E2E coverage gap
  -> start story-worktree smoke environment
  -> present URL, smoke guide, and observed results
  -> explicit human approval
  -> merge, push, remote verification, local cleanup
```

Local readiness is a prerequisite, not a parallel activity:

- **Shared test runtime:** Node/npm dependencies, JDK, Playwright browser, and
  either free or isolated ports. This is required for local E2E.
- **Human-smoke configuration:** an explicit, non-copying source for local
  environment values. This is required for the normal development stack.

Local E2E uses the Spring `e2e` profile and H2 fixtures; it should not require
the developer's Neon credentials. Human smoke may use the existing local
development configuration.

## Constraints

- Never commit, copy into tracked files, or record secret values.
- Never write a machine-specific path into story frontmatter or a committed
  story contract.
- Network downloads remain explicit and confirmed.
- Do not reuse a normal development API for E2E unless it is demonstrably the
  `e2e` profile.
- Do not request human approval before the targeted-E2E result, or its
  documented coverage-gap disposition, is available.
- Keep the existing worktree isolation, explicit integration approval, remote
  verification, and recoverable cleanup behaviour.

## Decisions to make during consolidation

1. **Environment handoff:** choose between an explicit `--env-file` / runtime
   variable and a deliberately created ignored symlink to the integration
   worktree's local environment file. Neither approach may copy secrets.
2. **Dependency preparation:** choose whether readiness only reports missing
   dependencies or offers an explicit confirmed `npm ci` action.
3. **Port isolation:** decide whether E2E and smoke gain configurable port
   pairs, deterministic per-worktree offsets, or remain mutually exclusive
   with clearer automation around stopping and restoring processes.
4. **Coverage-gap policy:** define the required waiver fields and when writing
   a missing E2E is mandatory rather than optional.
5. **Smoke guide format:** decide how story acceptance criteria, changed
   routes, test accounts, and expected observations are rendered into a short
   human checklist.
6. **BMad Loop contract:** define the machine-readable state transitions and
   artifacts that allow the future loop to pause at confirmation and approval
   gates without inferring either decision.

## Evidence from the current workflow

- `scripts/v2/story-worktree-bootstrap.sh` validates and provisions BMad, but
  does not provision project dependencies or local environment configuration.
- `.gitignore` correctly ignores `node_modules`, `.env`, local build output,
  and Playwright reports.
- `scripts/start-dev.sh` loads `<worktree>/.env` and uses the normal local
  API/frontend ports.
- `scripts/run_e2e.sh` intentionally requires free ports and starts an
  isolated H2/e2e stack.
- `scripts/v2/story-branch.sh integrate` keeps the unit until push and remote
  ancestry verification succeed, then removes the local worktree and branch.

## Out of scope

- Changing product acceptance criteria or UI behaviour.
- Automatically approving a missing-E2E waiver.
- Automatically pushing `v2` merely because it is ahead of its remote.
- Replacing the existing explicit human approval before integration.

## Consolidation handoff

Use this document as the intent input for a separate BMad planning session.
That session should turn the outcomes and decisions above into bounded stories
with acceptance criteria, test strategy, ownership, dependencies, and
BMad-Loop-compatible lifecycle gates. It must not silently choose any of the
listed decisions.
