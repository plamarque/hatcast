---
title: 'Restore Angular suite reliability'
type: 'bugfix'
created: '2026-11-14'
status: 'done'
baseline_commit: '8ae87e8c8e6912848658865d768803b781931e83'
route: 'dispatch'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The full Angular unit suite fails on the baseline, obscuring regressions and blocking the local closure of story 6.25.

**Approach:** Diagnose the existing failures, correct stale test fixtures and assertions when current behavior is established, and investigate any genuine defects separately. Demonstrate the suite can run reliably without disabling tests.

## Boundaries & Constraints

**Always:** Preserve production behavior and security semantics unless the user explicitly approves a behavior change. Verify each adjustment against implementation and normative intent. Keep this maintenance isolated from story 6.25 and worktree 19.23. Report any remaining failures and uncertainties.

**Never:** Disable, skip or weaken tests merely to make the suite pass; change production code to satisfy a stale test; modify production data, push or deploy.

</frozen-after-approval>

## Code Map

- `apps/web/src/app/pages/season-home/season-home.spec.ts`: route fixtures lack troupe-qualified params and the current `resolveSeasonInTroupe` mock. Investigate each remaining assertion after correcting fixtures.
- `apps/web/src/app/core/navigation/last-visited-season-shortcut.service.spec.ts`, `apps/web/src/app/shared/member-cross-nav/member-season-shortcut.spec.ts`, `apps/web/src/app/shared/context-switcher/context-switcher.spec.ts`, `apps/web/src/app/shared/context-breadcrumb/context-breadcrumb.spec.ts`, `apps/web/src/app/shared/season-card/season-card.spec.ts`: review current qualified route and troupe resolver mocks; missing `findTroupeBySlug` causes an unhandled error.
- `apps/web/src/app/core/troupes/demo-troupe-join.service.spec.ts`, `apps/web/src/app/pages/troupes-list/troupes-list.spec.ts`, `apps/web/src/app/core/troupes/troupe-context.service.spec.ts`, `apps/web/src/app/pages/admin-membres/admin-membres.spec.ts`, `apps/web/src/app/pages/admin-event-participants/admin-event-participants.spec.ts`: inspect actual routing and resolver inputs against test doubles.
- `apps/web/src/app/core/share-announce/share-announce-api.service.spec.ts`: compare nullable normalization expectations with current contract.
- `apps/web/src/app/pages/reset-password/reset-password.spec.ts` and `apps/web/src/app/pages/account-placeholder/dialogs/`: inspect session and reauthentication fixtures and established security semantics before changing assertions.
- `apps/web/src/app/pages/user-agenda/user-agenda.spec.ts`: concurrent initial requests and URL synchronization need investigation against intended behavior; do not assume the test or runtime is correct.
- `ISSUES.md` LIMIT-007 and `_bmad-output/implementation-artifacts/deferred-work.md` DW-120 record the pre-existing instability.

## Tasks & Acceptance

**Execution:**
- [x] Reproduce the suite on Node 20 and classify each failure against actual behavior and documentation.
- [x] Correct demonstrably stale fixtures or assertions; retain meaningful behavior checks.
- [x] Investigate remaining failures, flakiness and unhandled errors; stop and report any product behavior or specification conflict that needs a decision.
- [x] Run the full web unit suite repeatedly and relevant targeted checks; document exact results and update LIMIT-007 only to the extent supported by evidence.

**Acceptance Criteria:**
- Given the unchanged production contract, when the full Angular unit suite runs repeatedly under Node 20, then all registered tests pass without unhandled errors or new skips.
- Given a possible product behavior conflict, when evidence does not establish intended behavior, then the conflict is reported rather than silently changing the product or its tests.

## Implementation Notes

Test fixtures and expectations were adjusted for qualified routes, resolver inputs, session fixtures and normalized nullable fields. Global storage stubs are restored after push dialog tests. No production code was changed.

The user approved parallel agenda loading after verification of API authentication and principal scoping. Duplicate 401 feedback is tracked as BUG-121.

## Spec Change Log

## Review Triage Log

- **medium — patched:** The no-membership test injected a result unreachable from the qualified resolver; it now uses the real resolver and checks the no-troupe guest fallback and navigation.
- **false:** The qualified resolver does not return ambiguity, but its consumer defensively handles the declared union. Legacy ambiguity remains covered in `troupe-season-resolver.service.spec.ts` through `resolveSeasonSlug`.
- **maybe-false — deferred (unverified medium):** Agenda success preceding a failed session is not covered for both completion orders; API authentication is established, but a controlled asynchronous test is needed to establish whether data can remain visible after failed navigation.
- **low — deferred:** Duplicate 401 notifications and navigation are pre-existing, confirmed, and tracked as BUG-121; a future fix should assert single feedback.
- **medium — patched:** Node 22 was part of historical evidence while green verification used Node 20. LIMIT-007 now explicitly limits the local result to Node 20 and marks Node 22 unverified.

Edge-case and verification-gap review layers reported no findings.

## Verification

- Node 20 baseline: 202 files, 2,281 tests, 53 failures and one unhandled error (`/private/tmp/limit007-baseline.log`).
- Intermediate full run: 202 files, 2,270 passed, 11 failed and one unhandled rejection (`/private/tmp/limit007-next.log`). Failures: admin members 3, season home 5, user agenda 2 and login 1. The rejection reports a missing season resolver API method in a test double. Results varied across runs before test isolation.
- `git diff --check` passed. No tests were intentionally skipped or disabled.

- `npm run test -w @hatcast/web -- --watch=false` under Node 20, repeated at least twice; report counts, failures and unhandled errors.
- Run targeted test files during diagnosis; do not treat zero selected tests as success.

### Results (2026-11-14)

- Node 20.20.2: two consecutive full runs passed 202 files and 2,281 tests, with no unhandled errors (36.70 s and 36.45 s). After review fixes, two more full runs passed the same counts (37.20 s and 36.65 s).
- Targeted checks: agenda 28/28, admin membres 9/9, season home 26/26.
- Vitest file isolation prevents incompatible Firebase module mocks from leaking across suites; storage stubs are restored after each affected test.
- Agenda API security checked in SecurityConfig, controller and user-scoped read-only service; the existing integration test asserts anonymous requests return 401. The targeted Gradle run could not start because the sandbox denied its wrapper lock under the user Gradle cache.
- The user approved concurrent agenda loading after security review. When both requests return 401, duplicate notification and navigation are tracked separately as BUG-121.
