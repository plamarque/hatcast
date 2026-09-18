# BUG-021 review triage

Three context-free review layers inspected the full tracked and untracked diff against baseline aaf7dbb4c6e2da395e9baeb4c91e2dec03b28a6c: blind hunter, edge cases, verification gaps.

| Finding | Severity | Disposition |
|---|---|---|
| Persisted volunteer opt-out lost on unchanged resubmit (two reviewers) | high | patch: restore persisted opt-out and regression test |
| Unknown-to-unknown submission counted as first answer (two reviewers) | medium | patch: gate analytics on answered result |
| Event/season API fixtures assume now-invalid empty available writes | medium | patch: valid fixture roles, execute affected suites |
| Notification matrix uses obsolete two-step write | medium | patch: assert rejected write sends nothing and full reply notifies |
| In-flight Escape/backdrop/cancel protection lacks behavioral test (two reviewers) | high | patch: pending browser PUT and dismissal attempts |
| Pre-submit Escape/backdrop cancellation untested | medium | patch: assert no write and persisted state unchanged |
| Dialog dirty hint hidden with external submit | low | patch: expose alongside persistent action |
| Unsaved status round trip clears role draft | medium | patch: retain role draft until response submission |
| Fresh assigned focus silently stops editor without refreshing card | medium | patch: refresh-aware result or participation action |
| Post-save refresh failure discards successful local state | medium | patch: preserve saved response and card list on refresh failure |
| Touch measurements cover submit only | medium | patch: verify actual role/status/dismiss hit areas |
| Rejection tests could assert every audit/status side effect | low | reject: validation executes before all write branches; persisted roles/comment already checked, notification behavior strengthened separately |

No intent gap or spec re-derivation required. Patches retain the approved behavior and strengthen implementation/verification. The unrelated pre-existing session-bootstrap assertion is retained unchanged and documented under LIMIT-007, with baseline source evidence in the implementation report.

## Closure

All accepted patches are implemented. Final evidence: API 75/75 across five impacted suites; Playwright 12/12 with passed persisted attestation; targeted Angular 111/112, with only the unchanged baseline LIMIT-007 expectation; build and diff whitespace check pass. No tests disabled. Human smoke and integration approval remain separate.
