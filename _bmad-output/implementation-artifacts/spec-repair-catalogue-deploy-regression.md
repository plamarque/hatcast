---
title: 'Repair Advent deployment configuration regression'
type: 'bugfix'
created: '2026-11-01'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
baseline_commit: '445192fdb10d5a3c12bae2995ec3659858ff54ec'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The Advent catalogue release check fails because it extracts a deployment block using a line removed by the approved surprise change.

**Approach:** Update the test to exercise the current deployment block for all three environments while preserving its checks against the obsolete private bucket and verifying the current layout, identities and development-only clock offset. Do not change deployment behavior or skip tests.

</frozen-after-approval>

## Implementation Notes

The fixture now extracts the current deployment block and supplies synthetic identities and offset for each environment. Existing obsolete-bucket and layout checks remain; identity injection and development-only offset are checked explicitly. BUG-087 records the failed CI run.

Verification: all 56 catalogue tests and the deployment-configuration validator passed after review fixes; no tests were skipped.

## Review Triage Log

- medium — BUG-081 was already assigned to another issue; the new entry is BUG-087.
- medium — Checking only the fixture offset value would miss a differently valued production offset; the test now rejects any offset key outside development.
- medium — An obsolete bucket injection before the extracted block could evade its checks; the test now also checks the whole workflow for direct injection.
