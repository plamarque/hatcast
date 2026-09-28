# Sprint Change Proposal — worktree dependency cache

## Issue Summary

Story 1.1 evaluated a copied local `node_modules` cache. Repeated measurements
showed it slower than `npm ci`, so copying is rejected. A redirected fixture
then showed that a read-only dependency snapshot can be linked instantly and
that `npm ci` fails before changing the snapshot; explicit detach creates an
isolated writable local tree.

## Impact Analysis

No product PRD, UX, API, data model, or existing product epic changes. Epic 21
and its existing readiness contracts remain unchanged. The affected technical
plan is limited to future worktree dependency provisioning. Existing lifecycle
scripts remain unchanged until a dedicated integration story is approved.

## Recommended Approach

Direct adjustment, moderate scope: retire the copied-tree path and add a new
technical integration story for immutable snapshots plus symlink cache hits.
It must recognize a valid hit in preparation, skip `npm ci` only for that hit,
offer explicit detach before dependency mutation, and retain safe `npm ci`
fallback on a miss. Publication after a verified integration and pruning remain
separate future stories.

## Detailed Change Proposals

### Worktree dependency-cache evaluation

**OLD:** Evaluate copy-on-write materialization as the cache-hit path.

**NEW:** Record copying as rejected. Evaluate immutable symlink hits and safe
detach as the selected technical direction.

**Rationale:** Copy median is slower than normal installation; symlink setup is
instantaneous and read-only protection prevents silent shared-cache mutation.

### New technical story: immutable symlink cache integration

**NEW:** Implement keyed immutable snapshots, validated symlink hits, explicit
detach before dependency changes, miss fallback, and targeted tests. Do not
publish final snapshots or prune caches in this story.

**Rationale:** It removes the worktree setup interruption while preserving an
explicit, recoverable path for dependency-changing stories.

## Implementation Handoff

Classification: **Moderate**. Handoff to Developer after a BMad story spec is
approved. Success means a normal cache hit does not run `npm ci`, mutation is
blocked until detach, misses remain recoverable, and existing worktree/E2E
contracts stay green.
