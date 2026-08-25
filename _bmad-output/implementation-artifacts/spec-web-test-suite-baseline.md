---
title: 'Record Web Unit Test Baseline'
type: 'chore'
created: '2026-08-25'
status: 'done'
route: 'one-shot'
---

# Record Web Unit Test Baseline

## Intent

**Problem:** Historical review notes report incompatible web unit-suite failures, so the backlog cannot guide stabilization or CI decisions.

**Approach:** Record reproducible current runs and their variability in DW-120, centralize the open limitation, and archive prior story-specific aggregates as dated evidence.

## Suggested Review Order

**Current remediation contract**

- Establishes the environment, observed variability, clusters, and exit criteria.
  [`deferred-work.md:263`](deferred-work.md#L263)

- Registers the non-deterministic suite as an open project limitation.
  [`ISSUES.md:13`](../../ISSUES.md#L13)

**Historical evidence**

- Preserves previous story snapshots without presenting them as the current baseline.
  [`deferred-work-archive.md:658`](deferred-work-archive.md#L658)
