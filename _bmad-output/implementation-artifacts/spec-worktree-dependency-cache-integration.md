---
title: 'Integrate immutable worktree dependency cache'
type: 'feature'
created: '2026-09-20'
status: 'done'
review_loop_iteration: 2
baseline_commit: '0d25fe44603c860f8e44c28aee02bd0683bf5944'
context:
  - 'AGENTS.md'
  - 'project-context.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Isolated HatCast story worktrees always run `npm ci` during runtime preparation, although a compatible immutable dependency snapshot may already exist. A direct `node_modules` symlink cannot work for this npm monorepo because its workspace package links would resolve relative to the cache rather than the target worktree.

**Approach:** Runtime preparation first consumes only a caller-configured, pre-existing immutable snapshot whose key matches the current lockfile, Node, and npm versions. A valid hit creates a lightweight local `node_modules` overlay: cache-backed links for external dependencies and local links for the declared npm workspaces. It completes without running `npm ci`. Only an unavailable cache with no existing dependency entry takes the current `npm ci` fallback. The overlay must be explicitly detached before any dependency mutation.

## Boundaries & Constraints

**Always:** Derive and validate the snapshot identity from `package-lock.json`, Node, and npm; use a cache root supplied explicitly by configuration, never an implicit user-level location. Prepare in this order: a valid immutable hit creates a local overlay and never runs `npm ci`; no dependency entry and no valid snapshot runs `npm ci`; an existing dependency entry is reused without running `npm ci`. Build workspace links from the root `package.json` workspaces (`legacy` and `apps/web`) so they resolve inside the target worktree; link every other cached top-level dependency without mutating the snapshot. Treat every malformed, missing, writable, broken, external, or mismatched snapshot as unavailable. Validate the resolved target stays under the configured cache root. Make detach recoverable: complete a verified local copy before replacing an overlay, and preserve the original tree if copying fails. Keep output portable: no local paths, secrets, or environment values.

**Ask First:** Stop before adding snapshot publication, automatic cache population, cache pruning/retention, another cache location/default, browser-cache changes, or changes to story creation, integration, delivery, and deprovisioning workflows.

**Never:** Do not consume a mutable snapshot, detach automatically, delete arbitrary `node_modules`, alter `package-lock.json` or `.npmrc`, use the feasibility evaluator as the production path, or weaken the existing worktree/secret/environment guards.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|---------------|---------------------------|----------------|
| Valid hit | Configured root contains a matching immutable keyed snapshot; worktree has no dependencies | `prepare` creates a local overlay whose external dependencies link to cache and whose workspace links resolve in the worktree; it skips `npm ci`, then continues Chromium preparation | Snapshot remains unchanged |
| Cache miss | Root omitted, snapshot absent, or key does not match; `node_modules` is absent | `prepare` runs its existing `npm ci` fallback | No snapshot is created or changed |
| Unsafe snapshot | Broken/external/writable link, missing lock metadata, or malformed key | Cache is unavailable; never link it | Runs `npm ci` only when `node_modules` is absent; otherwise preserves the entry and fails closed |
| Existing dependency entry | A local overlay or a local `npm ci` tree already exists | `prepare` reuses it without `npm ci` | Preserve the entry unchanged |
| Explicit detach | Worktree has a validated cache overlay | Local writable tree replaces the overlay only after copy succeeds | Failed copy leaves the original tree intact |

</frozen-after-approval>

## Code Map

- `scripts/v2/story-worktree-runtime.sh:14-18,51,65-76` -- current dependency readiness and unconditional preparation seam; replace it with an explicit hit-then-miss decision while retaining unit/worktree/environment/port guards and Chromium handling.
- `scripts/v2/worktree-dependency-cache.sh:35-89` -- reuse or harden cache-root canonicalization and build a workspace-aware local overlay; `evaluate` and `probe-npm-ci` remain fixture-only and are not runtime dependencies.
- `scripts/v2/story-worktree-runtime.test.sh:7-63` -- hermetic Git-worktree fixture and command mocks; current assertions establish the miss baseline (`npm ci`, then Chromium).
- `scripts/v2/worktree-dependency-cache.test.sh:39-66` -- disposable immutable snapshot, sentinel, rejected external target, and detached local-mutation patterns to extend for production-safe primitives.
- `package.json:22-26` -- discoverable existing shell-test commands; retain coverage entry points.
- `docs/v2/technical/WORKTREE_DEPENDENCY_CACHE_EVALUATION.md:65-78` -- feasibility evidence that permits this narrowly scoped consumption integration but not cache publication or lifecycle policy.
- `_bmad-output/planning-artifacts/sprint-change-proposal-2026-09-20-worktree-dependency-cache.md:39-46` -- approved change direction: keyed immutable hit, explicit detach, and safe miss fallback.

## Tasks & Acceptance

**Execution:**
- [x] `scripts/v2/worktree-dependency-cache.sh` -- add deterministic identity, configured-root snapshot validation, workspace-aware overlay preparation, and transactional explicit detach primitives; retain evaluator isolation.
- [x] `scripts/v2/story-worktree-runtime.sh` -- make `prepare` select a validated overlay before considering `npm ci`; run the current install only for an absent dependency entry and a cache miss; reuse a pre-existing local entry without an install attempt.
- [x] `scripts/v2/worktree-dependency-cache.test.sh` -- cover identity variation, complete immutable overlay, workspace link resolution, invalid snapshots, detach isolation, and failed detach without paths, network, or a real shared cache.
- [x] `scripts/v2/story-worktree-runtime.test.sh` -- prove a hit skips `npm ci` yet prepares Chromium, a configured-root miss runs it, and an existing local entry is reused without an install attempt.
- [x] `docs/v2/technical/WORKTREE_DEPENDENCY_CACHE_EVALUATION.md` -- document the workspace-aware integration contract and the unchanged publication/pruning boundary.

**Acceptance Criteria:**
- Given matching lockfile, Node, and npm inputs and a valid immutable snapshot, when the runtime prepares a registered worktree, then it creates a workspace-aware overlay and does not invoke `npm ci`.
- Given an absent or invalid configured snapshot and no pre-existing dependency entry, when preparation runs, then and only then it completes through the established `npm ci` fallback without publishing a cache.
- Given existing local dependencies, when preparation runs, then it reuses them without `npm ci` or mutation.
- Given a cache overlay and an explicit detach request, when copying succeeds, then the local tree is writable and mutations cannot affect the snapshot; when copying fails, then the original tree remains.
- Given the targeted shell suites run, when fixtures exercise hits, misses, and unsafe inputs, then they use no registry, user cache, or persistent state outside their temporary fixtures.

## Spec Change Log

- Review iteration 1: Real HatCast npm workspaces create relative links in `node_modules` that a direct cache symlink resolves under the cache. The spec now requires a lightweight local overlay with worktree-local workspace links, avoiding broken workspace resolution while preserving cache-backed external dependencies.

## Design Notes

The cache root is opt-in configuration because the feasibility story explicitly prohibited selecting a user-level cache location. The runtime consumes a pre-published snapshot first through a local overlay; a cache miss never quietly converts into cache publication. `npm ci` is not part of the hit path: it remains solely the recovery path for an empty worktree while a future publisher owns snapshot creation and retention.

## Verification

**Commands:**
- `npm run test:worktree-dependency-cache` -- expected: immutable-hit and transactional-detach fixtures pass without network access.
- `npm run test:story-worktree-runtime` -- expected: hit/miss/unsafe-link runtime contract passes with mocked commands.
- `npm run test:story-worktree` -- expected: existing lifecycle contract remains green.
- `git diff --check` -- expected: no whitespace errors.
