---
title: 'Verify PWA updates after reload'
type: 'bugfix'
created: '2026-11-11'
status: 'done'
route: 'dispatch'
baseline_commit: '1bc308d9da9160b042dcfc5c5ba8f29f2be0120d'
context: []
---

<frozen-after-approval>

## Intent

Keep the existing update banner. Offer an application update when Angular reports a ready version, or confirms a cached manifest whose exact hash and build identity match the server; after explicit user action reload and verify the version actually running. Report failure or uncertainty without automatic reload loops. Keep PR #20 open as reference until the replacement is ready.

## Boundaries & Constraints

Preserve update dismissal and the user's work, support manual checks and unavailable storage, retain the existing visual treatment, and distinguish analytics from confirmation. Do not implement the unrelated notification-link changes in PR #20. Validate with real service workers and successive builds, and separately report device verification.

## I/O & Edge-Case Matrix

| State | Expected behavior |
| --- | --- |
| Worker installed, no application ready event | No update offer |
| Angular reports a ready build | Existing banner offers update |
| Reload starts expected build | Confirm and show release notes when applicable |
| Reload keeps previous build | Explain and allow retry without a loop |
| Storage, identity, network or check unavailable | Never claim success or current state without proof |
| Another build becomes available | Do not falsely identify an unknown build as the expected one |

</frozen-after-approval>

## Code Map

- `apps/web/src/app/core/pwa/pwa-update.service.ts`: readiness, checks, reload and post-reload verification.
- `apps/web/scripts/build-with-release.mjs`: build identity in bundle and worker manifest.
- `apps/web/src/app/shared/pwa/pwa-update-banner/`: retain banner and report recoverable errors.
- `apps/web/src/app/core/pwa/chunk-recovery.service.ts`: preserve independent recovery path.
- `apps/web/src/app/core/analytics/product-analytics.service.ts`: distinguish release observation from exact build proof.

## Tasks & Acceptance

- [x] Implement readiness, verification, and retry behavior.
- [x] Validate failure, missing metadata, multi-client and offline scenarios with tests.
- [x] Validate real A/B build transition and user-facing banner.
- [x] Update relevant architecture and issue records.

## Implementation Notes

Angular worker `checkForUpdate()` can resolve false on network failure or when a manifest is already cached. Its events are broadcast to clients. A release identifier alone cannot identify a unique build.

## Spec Change Log

## Review Triage Log

- medium: A cancelled or slow reload could leave an ambiguous pending attempt. The timeout now marks it uncertain; a later load cannot claim confirmation.
- medium: A manual check could announce a dismissed cached version without showing the banner. The check now explicitly reopens it.
- low: A known ready target can become stale after another release or rollback; reload verification reports uncertainty rather than success and never retries automatically.
- low: Retrying an older cached target can fail after another deployment; post-reload verification makes failure visible and retry remains voluntary.
- false: A deliberately unverified reload displaying an uncertainty message is consistent with the warning the user accepted, not a false success.
- medium: Pending verification was skipped when the new build has no active worker. Startup now verifies before the worker-enabled guard.
- medium: The browser test did not prove that the bundle identity enabled release notes. It now records the post-reload confirmation marker from the actual running bundle.
- medium: Missing real-worker branches for build C, cancelled reload and storage denial. Storage denial is now tested in Chromium; C and cancelled reload retain unit coverage and remain explicit device/browser limitations.
- medium: An expired attempt was silently discarded. It now displays an unconfirmed result.
- false: A cancelled reload followed by a later reload could have been mistaken for immediate success. The timeout now marks the attempt uncertain, so a later reload does not claim confirmation.

## Verification

Run focused Angular tests, a production build, and a browser test using two production builds on one origin. Record limitations and human/device results separately.

Focused Angular suite: 120 tests passed after final review fixes. Two production builds with distinct IDs passed a Chromium transition with two tabs and an offline check before the version was ready. Mobile screenshot inspected at 390 px. The existing update banner and Material controls are retained; other M3 checklist items are not applicable. The cached-version browser proof passed with VERSION_READY deliberately suppressed in the second tab. Device testing remains outstanding. Local production watch builds do not embed an identity, so post-reload confirmation is unavailable there.

The update action asks before reloading when an Angular form is dirty or a Material dialog is open, and respects existing beforeunload guards. Other application-specific unsaved state may require its own guard. The old fallback and overlapping-dialog concerns are recorded as separate issues.
