# PR 15 recovery — technical investigation

Historical planning/review record, superseded by spec-pr-15-stale-client-recovery.md and the delivered verification artifact.
Date: 2026-10-21. Planning evidence only; no production implementation or browser recovery proof yet.

## Baseline and ownership

Dedicated local branch `feat/pr-15-pwa-recovery`, created from integration commit `3a0a08482a4e9d1961f9b2469123ffc874a685c5`. Reviewed PR #15 remains draft at `8740a147c63397623b5cc7bd3e2cadc1197491cb`, based on `cb61b3014ae8cfaa1d6032030b1a34250534c9d6`. No PR commits were cherry-picked: selectively reuse the nginx change and useful error signatures, replace the blind-reload approach. Preserve the integration checkout's existing review notes and mockup. No story key is assigned; do not edit sprint-status.yaml or invent an epic entry. No commit, merge, push or deployment is authorized by this planning artifact.

## Confirmed facts

1. `apps/web/src/app/app.routes.ts` has 27 `loadComponent` entries. All use the same router: agenda, member profiles, account and nested tabs, troupes, seasons, events, admin and historical aliases. Login, signup, account recovery, member shell and home are eager. No route preloading or `@defer` found.
2. `app.html` mounts install/update banners outside `router-outlet`. A recovery host imported statically at the same root remains available when a route chunk fails. Subscribe to router errors through `withNavigationErrorHandler` to include first navigation after shell initialization; a late App subscription alone is insufficient.
3. A router import failure also occurs offline. Its message is a candidate signal, not proof of a stale release. Support Chromium, Firefox and Safari import/MIME signatures; do not treat arbitrary HTTP/API, authorization, guard or business exceptions as update requests. Angular ErrorHandler can forward runtime import failures outside navigation while preserving default reporting. The current non-route imports are the legacy filter panel, analytics initializer and async animations renderer.
4. `ngsw-config.json` prefetches all root `/*.js`. A healthy controlled client normally keeps its old chunks working after deployment. To reproduce controlled-client failure, simulate loss of the relevant cached response as well as removal from the origin. Do not claim every deployment breaks every installed PWA.
5. `PwaUpdateService.pollForAppUpdate()` / `checkForUpdatesManually()` call `ServiceWorkerRegistration.update()`, not `SwUpdate.checkForUpdate()`. Script updates and Angular manifest updates are different. Add a recovery-specific application-version API; do not broaden this feature into rewriting unrelated manual/poll behavior. Record the pre-existing limitation separately.
6. `SwUpdate.isEnabled` is not proof that this tab is controlled. Registration is delayed with `registerWhenStable:30000`; web tabs can be controlled too. Select the branch from actual `navigator.serviceWorker.controller`, and re-check when applying because controller acquisition can race.
7. Angular 21.2.9 installed sources: worker `setupUpdate()` initializes the application resources and syncs before VERSION_READY. The event is not replayed. A manifest already known to the worker can make checkForUpdate return false even while this client has a newer version available. Its local worker also returns false on some offline/install-failure paths. Therefore false alone is neither readiness nor proof that the client is current. A successful activateUpdate result is evidence that this client moved to the latest initialized version.
8. `SwUpdate.unrecoverable` is another global input, especially when a hashed resource was evicted and origin returns 404. Deduplicate it with router/global errors and preserve the explicit failed-navigation destination when available; otherwise use the current document URL.
9. `pwa-system-banner.scss` uses z-index 99999/100000. Default CDK dialog overlays can be covered by these banners. Suppress both install and update banners while the recovery dialog is active, without losing their normal pending state after dismiss.
10. `custom-sw.js` notification clicks navigate an existing client or open a new one with a complete URL. Recovery can resume after shell startup; it cannot render if initial main/shell/analytics bootstrap fails. `ProductAnalyticsService.ensureInitialized()` currently propagates a failed PostHog dynamic import through its app initializer; record this separate pre-existing limitation, do not silently expand implementation scope.

## Implementation decisions

### Shared state and detection

Use a root recovery service plus an eagerly referenced MatDialog component. State machine: idle -> checking -> ready or retry -> applying -> full-document navigation. Dismiss clears the pending attempt and restores focus to the existing screen. App initialization may receive a router error before the host is ready: retain it until the host attaches. One active attempt owns one validated target; a router target takes precedence over a simultaneous worker/global signal. A later successful navigation invalidates a pending obsolete attempt. Discard late async results after dismissal, replacement or timeout.

Register `withNavigationErrorHandler` and a forwarding Angular ErrorHandler. Do not swallow/rethrow altered errors or disable existing browser global listeners. Preserve ErrorHandler console/telemetry behavior; recovery itself must not create unhandled rejections. Recognize errors conservatively, including wrapped Error/cause/rejection forms, without unbounded recursion. This is runtime recovery after shell availability, not a replacement bootstrap error page.

### Update eligibility and consent

Before calling a failure a new-version situation, verify readiness or a changed server entry graph. For an uncontrolled browser, fetch existing `/index.html` with no-store and a worker-bypass marker; compare same-origin module-script/stylesheet entry URLs with the actual loaded document. Compare hashed artifacts, never semver or network-fetched version.txt alone. Reject malformed/non-HTML responses, unchanged entries and unavailable network as unconfirmed; use retry copy. This introduces no release endpoint or separate version counter.

For a controlled client, subscribe to VERSION_READY/unrecoverable before checking. Use `SwUpdate.checkForUpdate()`, with a bounded 30-second UI wait, preserving already observed ready events. A fresh origin entry graph differing from the running document can also establish that a deployment exists, even if readiness was emitted before subscription. Readiness is still required before resuming: after consent, check/await application readiness and call activateUpdate, handling already-prepared versions. If activation is successful, immediately leave the old runtime with full navigation. A previously observed ready version plus an already-current activation result can permit one reload; ambiguous false/rejection must return retry, never blind navigation. A timeout invalidates the UI attempt but may not cancel the worker's download; ignore its late result until a new user action.

For no controller, revalidate current server entry availability on consent and full-navigate to the target. Re-check controller state immediately before choosing the path; if a worker gained control, use the controlled flow. No automatic full reload on detection, startup or late completion. Disable double submission. Storage is optional bookkeeping: all getters/methods are inside try blocks. With denied storage, no persistence can authorize an automatic retry, but explicit consent remains usable. With storage, retain a short attempt marker for 30 seconds to detect repeated unsuccessful recoveries and show retry instead of auto-continuation. No global cache purge or worker unregistration.

### UX

Checking: “Impossible de continuer” / “Recherche d’une mise à jour…”. Confirmed deployment: “Une mise à jour est nécessaire” / “Mets HatCast à jour pour continuer.” Actions: “Plus tard” and “Mettre à jour et continuer”. Applying: “Mise à jour en cours…”; disable duplicate actions. Offline/unconfirmed/error: “Impossible de terminer la mise à jour” with a connection/retry explanation, “Plus tard” and “Réessayer”. No page-specific wording and no promise that drafts survive a reload. No extra unsaved-draft feature is introduced.

Use MatDialog standard scrim/focus behavior, static root reachability, existing HatCast icon/tokens, mat-flat-button primary and shared `app-hatcast-dialog-dismiss` (`plus_tard`). No close cross. Escape/backdrop dismiss before applying; while applying, temporarily disable close, restore it after timeout/failure. Route changes close the stale prompt. Do not let an ordinary system banner float above it. No primary click target on background content.

## Coverage contract

| Surface | Coverage |
|---|---|
| All 27 current lazy routes, including nested/admin/legacy aliases | Shared router handler; generated route-family integration cases |
| First lazy destination/deep link after shell startup | Same early handler and buffered state |
| Runtime import failures delivered to ErrorHandler | Current-URL recovery, preserving original error report |
| SW unrecoverable cache state | Root subscription, regardless of install display mode |
| Existing notification target | Same-origin URL and full destination retained after shell startup |
| Healthy eager routes/cached SW chunks | No artificial update prompt |
| Initial main/index/bootstrap never starts | Explicitly outside this modal's reach |
| Exceptions swallowed by feature-local code | Not observable by global recovery; do not claim universal interception |

## Primary references

- Angular application-version events, update checks and the exact evicted lazy-chunk scenario: https://angular.dev/ecosystem/service-workers/communications
- Angular versions and coherent resource caching: https://angular.dev/ecosystem/service-workers/devops
- SwUpdate API and activation warning: https://angular.dev/api/service-worker/SwUpdate
- Installed `@angular/service-worker` and `@angular/router`: 21.2.9. Installed worker internals were inspected to supplement the API documentation; do not rely on mutable latest-doc behavior alone.
