# Worktree dependency cache evaluation

Story 1.1 adds only `scripts/v2/worktree-dependency-cache.sh evaluate`. It is
deliberately disconnected from `prepare`, integration, pruning, and all normal
runtime paths.

The evaluator may run only from a registered `feat/*` worktree. It builds
disposable baseline and source installations with a temporary npm cache,
attempts `cp -cR`, and verifies that changing an existing nested probe in the
materialization leaves its source counterpart unchanged. It reports elapsed
times, `du` storage figures when available, method, isolation, and a
`FEASIBILITY=go` or `no-go` result without emitting local paths or environment
values. `go` only proves the filesystem safety gate; it is not a product
decision to adopt a cache.

## Actual measurement — 2026-09-20

The evaluator ran successfully in the registered Story 1.1 worktree. It used
two disposable `npm ci` installations and a temporary npm download cache:

```
BASELINE_NPM_CI_MS=11376
SOURCE_NPM_CI_MS=12432
COPY_METHOD=clone-requested
COPY_MS=17318
SOURCE_STORAGE_KIB=713864
MATERIALIZATION_STORAGE_KIB=735184
ISOLATION=passed
FEASIBILITY=go
```

`cp -cR` was requested and produced an isolated writable tree: changing an
existing nested probe in the materialization did not alter the source. The
filesystem capability gate therefore passes. The baseline `npm ci` had a cold
temporary download cache (11.4 s); the source installation reused that temporary
download cache (12.4 s). However, the materialization took 17.3 seconds, slower
than either installation measurement. The extra cache layer would make initial
worktree setup slower on this machine. The product decision is therefore
**no-go for cache integration**: keep `npm ci` as the only dependency
materialization path and do not start Stories 1.2 or 1.3.

This is a machine-local measurement, not a portable benchmark: `HEAD` was
`30c3767b`, Node was `v26.8.2`, npm was `11.19.1`, and the working volume had
about 111 GiB free. The evaluator refuses uncommitted `package-lock.json` or
`.npmrc` inputs, so it never silently reports a result for a dependency tree
different from its archived commit.

## Repeated measurement — 2026-09-20

Three further identical runs confirmed the conclusion. Each run starts with a
fresh temporary npm download cache; the two `npm ci` timings below are the
cold-cache baseline and the cache-warmed source installation respectively.

| Run | Baseline `npm ci` | Source `npm ci` | Materialization | Isolation |
| --- | ---: | ---: | ---: | --- |
| 1 | 11.908 s | 11.506 s | 18.573 s | passed |
| 2 | 11.525 s | 11.980 s | 18.732 s | passed |
| 3 | 11.546 s | 11.648 s | 18.291 s | passed |
| Median | 11.546 s | 11.648 s | 18.573 s | passed |

The materialization is consistently 6.6 to 7.2 seconds slower than the normal
installation path. This makes the no-go decision robust for this machine and
dependency tree.

## Immutable symlink feasibility — 2026-09-20

The redirected fixture evaluates a read-only snapshot linked as a worktree's
`node_modules`. Creating the link is a cache hit and performs no dependency
build. A real `npm ci` against the linked fixture is refused with `EACCES`
before it can remove the immutable sentinel; the link is retained and the
snapshot remains unchanged. An explicit detach validates that the link resolves
inside the supplied cache root, unlinks only that entry, creates a writable
local tree, and proves a later local mutation does not change the snapshot.

This is a favorable safety result, not production authorization. A follow-up
integration story would need to make runtime preparation recognize a valid
cache hit and offer detach before dependency changes; without it, `npm ci`
correctly fails closed on the read-only link.

## Consumption integration — 2026-09-20

Runtime preparation now consumes an opt-in snapshot only when
`WORKTREE_DEPENDENCY_CACHE_ROOT` names an existing root and a matching,
read-only snapshot is present. Its identity combines the SHA-256 of the current
`package-lock.json` with the active Node and npm versions. The snapshot layout
is `<root>/<identity>/node_modules`, with the exact identity in
`<root>/<identity>/.hatcast-worktree-dependency-cache`; this is a consumer
contract, not a publication command.

On a validated hit, preparation creates a local `node_modules` overlay. Each
external top-level dependency links to the immutable snapshot, while the root
workspaces (`legacy` and `apps/web`) are linked into the consuming worktree;
this preserves npm's relative workspace resolution. The hit skips `npm ci` and
Chromium preparation continues as usual. A missing or invalid snapshot falls
back to `npm ci` only when no dependency entry exists. Existing dependencies
are reused unchanged.

`detach-dependencies` accepts only an overlay bearing the matching local
marker. It validates the immutable snapshot, copies only cache-backed entries
to a staging tree, rebuilds worktree-local workspace links, and swaps the
staging tree in only after that copy succeeds. A failed copy leaves the
original overlay in place; ordinary locally installed `node_modules` trees are
never removed by this command.

This remains deliberately bounded: it does not publish snapshots, select a
default or user-level cache root, prune cache entries, or alter browser-cache
handling.
