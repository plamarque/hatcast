---
title: 'Evaluate immutable symlink dependency cache'
type: 'feature'
created: '2026-09-20'
status: 'done'
review_loop_iteration: 0
baseline_commit: '6396ab2f3710420051b4dcb7173954e26ed2eab0'
context:
  - 'AGENTS.md'
  - 'project-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Every HatCast story worktree starts without `node_modules`. Runtime preparation runs `npm ci`, delaying first tests and sometimes stopping an agent for authorization. The prior feasibility test rejected a per-worktree copy because it was slower than `npm ci`.

**Approach:** Evaluate a cache hit made of a symbolic link to an immutable dependency snapshot. In disposable fixtures only, prove whether link setup is fast, whether npm can alter or replace the link, and whether an explicit detach safely creates a local writable tree before dependency mutation.

## Boundaries & Constraints

**Always:** Keep the snapshot immutable; use a symlink, not a copy, for a hit; run all experiments under a temporary directory; emit machine-readable evidence without local paths or environment values; only detach a link resolving inside an explicitly supplied cache root; preserve the source snapshot byte-for-byte.

**Ask First:** Stop before changing normal runtime preparation, story creation, integration, deprovisioning, cache retention, or a user-level cache location. A favorable result authorizes only a separate integration story.

**Never:** Do not create or consume a real shared `node_modules` cache; do not link a mutable snapshot; do not alter `.env`, `package-lock.json`, browser cache handling, E2E/smoke/delivery workflows, or existing lifecycle contracts; do not delete arbitrary `node_modules` directories.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|---------------|---------------------------|----------------|
| Safe cache hit | Complete read-only snapshot and matching link | Reports hit and elapsed link setup; sentinel unchanged | No builder or runtime command runs |
| npm while linked | `node_modules` links to snapshot | Records whether npm retains, replaces, or mutates the link | No-go if source sentinel changes |
| Explicit detach | Link resolves within cache root | Removes only link; local tree becomes writable and isolated | Rejects invalid target |
| Invalid cache state | Missing sentinel, broken link, or outside target | Reports unavailable or rejected with no outside mutation | Safe no-go |

</frozen-after-approval>

## Code Map

- `scripts/v2/worktree-dependency-cache.sh:1-97` -- isolated evaluator; extend without production wiring.
- `scripts/v2/worktree-dependency-cache.test.sh:1-39` -- temporary Git/worktree fixture and report assertions; expand for links and detach.
- `scripts/v2/story-worktree-runtime.sh:42-76` -- inspect accepts `node_modules`; prepare unconditionally runs `npm ci`; read-only evidence only.
- `scripts/v2/story-branch.sh:127-186,240-277` -- creation/removal boundaries; unchanged for this experiment.
- `package.json:22-26` -- existing evaluator test command.
- `docs/v2/technical/WORKTREE_DEPENDENCY_CACHE_EVALUATION.md` -- retain rejected-copy evidence and add symlink results.

## Tasks & Acceptance

**Execution:**
- [x] `scripts/v2/worktree-dependency-cache.sh` -- add fixture-only symlink evaluation and explicit detach, with strict cache-root validation; report hit, link time, npm behavior, isolation, feasibility.
- [x] `scripts/v2/worktree-dependency-cache.test.sh` -- cover immutable hit, npm interaction, successful detach, unsafe targets, unchanged source sentinel, no network or real cache.
- [x] `docs/v2/technical/WORKTREE_DEPENDENCY_CACHE_EVALUATION.md` -- document experiment and outcome separately from rejected copying.
- [x] `package.json` -- retain one discoverable evaluator-test command.

**Acceptance Criteria:**
- Given a complete immutable fixture snapshot, when a hit is prepared, then the worktree uses a symlink and no dependency build runs.
- Given a linked snapshot, when selected npm behavior runs, then the evaluator reports retained/replaced link and source sentinel stays unchanged; any mutation is no-go.
- Given a valid cache link, when detach runs, then only that link is removed, a writable local tree is established, and a local mutation leaves snapshot unchanged.
- Given an invalid, broken, or outside-cache target, when detach runs, then it fails closed without changing it.
- Given completion, when tests run, then they need no registry access and leave no cache state outside the fixture.

## Spec Change Log

## Design Notes

This experiment deliberately does not decide production keying, publication, pruning, or runtime integration. It converts symlink safety assumptions into observed behavior. A later story may use read-only snapshots plus detach only if results are favorable.

## Verification

**Commands:**
- `npm run test:worktree-dependency-cache` -- expected: all fixture cases pass without registry access.
- `npm run test:story-worktree-runtime` -- expected: runtime contract unchanged.
- `npm run test:story-worktree` -- expected: lifecycle contract unchanged.
- `git diff --check` -- expected: no whitespace errors.

## Suggested Review Order

- Cache-hit, npm probe, and guarded detach are isolated from runtime paths.
  [`worktree-dependency-cache.sh:35`](../../scripts/v2/worktree-dependency-cache.sh#L35)

- Disposable fixture proves immutable snapshot behavior and unsafe-target rejection.
  [`worktree-dependency-cache.test.sh:40`](../../scripts/v2/worktree-dependency-cache.test.sh#L40)

- Recorded result distinguishes safe feasibility from future production integration.
  [`WORKTREE_DEPENDENCY_CACHE_EVALUATION.md:51`](../../docs/v2/technical/WORKTREE_DEPENDENCY_CACHE_EVALUATION.md#L51)
