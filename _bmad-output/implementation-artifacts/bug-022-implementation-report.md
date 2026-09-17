# BUG-022 implementation report

Implemented in `feat/fix-availability-mandatory-volunteer` on 2026-09-17.

## Changes

- Incorporated BUG-021 dependency as `3e8d1a3b` and `52615b49` (original commits `105fe455` and `53125681`). Preserved the BUG-022 issue entry and spec. No changes to the other worktree.
- Available self/proxy writes include offered volunteer regardless of optional roles or legacy false flag. Invalid-role validation remains before normalization. Other statuses keep empty roles.
- The dialog initializes an available editable draft with volunteer, records its unsaved difference from historical state, disables removal, and retains unified submit/cancel/error behavior. Adjacent Material help works by keyboard and touch. The volunteer row spans the two columns to keep the 360px label readable.
- The poll normalizes explicit writes and offers an explicit clear-response action. Historical reads remain unchanged. Optimistic candidate removal now respects historical wildcard records.
- API wire compatibility retained. SPEC, DOMAIN, PRD, epics, frontend guidance and ISSUES updated. Frozen historical artifacts unchanged.
- E2E-only fixture supports all-role and volunteer-only variants for real browser/API saves.

## Verification

- Angular availability suites: 82 tests in 9 files passed.
- Kotlin: AvailabilityRoleRulesTest 9 tests and AvailabilityControllerIntegrationTest 30 tests passed, H2 test profile.
- Angular production build passed; existing Sass deprecation and two unrelated SCSS budget warnings remain.
- Isolated Playwright agenda-participation selection: 14 tests passed, including 360px light/dark, optional role families, locked removal, keyboard help, cancellation, volunteer-only save/reopen, and BUG-021 regressions. Persisted attestation: `e2e-evidence/bug-022.json`.
- No browser download. No reused development server. No production data access. `.env` is a relative symlink to the integration environment; no secret values copied or displayed.
- `git diff --check` passed.

## M3 and handoff

Material checkboxes/buttons/icons and existing dialog chrome retained. Help and save targets are 48px; native buttons supply keyboard activation. Mobile captures inspected in both themes. Existing navigation, theming, account preferences and role assignment unchanged.

Three independent review layers completed; patches verified (see bug-022-review.md). Human smoke and integration remain external gates. No push, deployment or integration performed. Browser coverage of the poll itself remains unit/component-level here; the new browser recipes exercise the dialog with real API persistence.

## Final review verification

All accepted review patches passed the final 82 Angular tests, 39 Kotlin tests, production build and 14 isolated browser tests. The persisted E2E attestation was parsed again. Ports 8080/4200 are free. Poll DOM coverage now verifies locking, help and self/proxy clearing; retained promises verify write serialization. No historical availability is narrowed by a comment-only save. BUG-023 is recorded separately as pre-existing deferred work.
