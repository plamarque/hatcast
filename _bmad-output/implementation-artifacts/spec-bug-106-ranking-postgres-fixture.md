---
title: 'Repair Advent ranking PostgreSQL fixture'
type: 'bugfix'
created: '2026-11-07'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The staging release gate fails because the PostgreSQL ranking test fixture omits a column required by the ranking query.

**Approach:** Align the fixture with the existing schema while preserving the transaction and score assertions, then verify the PostgreSQL regression gate.

</frozen-after-approval>

## Implementation Notes

- Added the query's required non-null receipt timestamp to the targeted fixture, without changing runtime or migrations.
- All four PostgreSQL CI suites ran locally: 10 tests, no failures or skips.

## Review Triage Log

- Existing partial fixture versus full migrations: low, pre-existing design; retaining a focused fixture is sufficient for this concurrency test.
- Distinct receipt timestamps: low, outside this test's transaction-isolation assertion; no ranking order behavior was changed.
- Scope of schema alignment: false; the intent requires the missing column, not a complete schema replica.
