# Minimal stale-route recovery — delivered verification

Date: 2026-10-21. This supersedes the initial broad A/B harness plan. No permanent harness or test route is shipped.

## Automated application checks

- Angular/Vitest: 9 targeted files, **93 tests passed**. Covers the original Safari MIME signature, browser import signatures, ordinary-error rejection, safe targets, full query/fragment retention, same-document reload, one-dialog ownership, double submit, known/new worker version, false/rejection/offline, 30-second timeout and ignored late checks, initial update/retry-only modal, preserved root banners, real MatDialog, existing install/update/banner behavior and the storage-denied normal-update regression.
- Actual tests/log: `/private/tmp/hatcast-recovery-final-tests.log`.
- Standard final production build: `npm run build --workspace @hatcast/web -- --configuration production`; existing Sass/component budget warnings only. Log: `/private/tmp/hatcast-pr15-final-build.log`.
- `git diff --check`: passed. No tests disabled.

## Real nginx and Chromium checks

Used the existing local `hatcast-v2-test:latest` image with nginx 1.26.3, the actual modified nginx template (only its port and test document root substituted), and two real Angular production builds. A temporary entry preserves the real App and appConfig, adding isolated test routes and stubbing optional analytics/push prompts. Production auth/business guards are unchanged; this fixture does **not** prove authentication or all business screens. Fixture sources lived under `.angular/pr15-browser-check` and were removed from the worktree afterwards. Built outputs and script stay under `/private/tmp`, not in the change.

nginx syntax succeeded. Twelve HTTP checks passed: index/manifest/navigation -> 200 with no-cache; missing JS/MJS/CSS -> 404; existing chunk/custom worker/Angular worker/icon -> 200; /v1 and /actuator remain proxy locations (502 because this isolated test intentionally has no API).

Six browser cases passed:
1. No worker: an A tab requests its removed lazy chunk from B, sees the actual recovery modal, can dismiss without losing a draft, then confirms one full navigation to B with query/fragment intact.
2. Offline: failed lazy navigation gives retry feedback and never performs a full navigation automatically.
3. Real active Angular worker: delete the old target from the test CacheStorage and clear its HTTP-cache copy; switch A -> B. Observe UNRECOVERABLE_STATE, VERSION_DETECTED and VERSION_READY; explicit consent leads to one full navigation and B content.
4. Real worker, B already prepared: subsequent check emits NO_NEW_VERSION_DETECTED and returns false; explicit recovery still resumes into B.
5. Healthy active worker: switch A -> B without cache eviction; the cached A lazy route still works and **no recovery modal** appears.
6. Failed initial lazy destination: offer update/retry only without a misleading home exit; confirmation fully reloads the same current document including query/fragment and renders B.

Receipt: `/private/tmp/hatcast-pr15-browser-receipt.json`. Executable temporary verification script: `/private/tmp/hatcast-pr15-browser-check.cjs`. The builds had different lazy target hashes. nginx fixture upstreams were local only; no production data/account/services were used. Both automated Chromium contexts and real worker cache behavior were exercised; this is **not** an installed-device PWA human smoke.

## Matrix audit

Every approved spec matrix row has a passing targeted test. The actual browser cases additionally prove no-worker, new/known worker version, offline, dismissal/draft retention, initial/current URL and healthy-worker behavior. Timeout, rejected checks, ordinary errors, unsafe targets, storage denial and duplicate operations are covered in targeted unit/integration tests. Root banners remain mounted while hidden. M3 uses standard Material components, tokens and shared dismiss; actual Chromium geometry at 320px passed: scrollWidth = viewport = 320 and both actions >=48px high. Stable screenshot inspected. Zoom, screen-reader and simultaneous unrelated-dialog focus were not browser-tested.

## Explicit limits

No human phone/installed-PWA smoke, Safari/WebKit browser run, production deployment, API/business journey regression suite or live PostHog measurement was performed. The same mechanism selects behavior by controller rather than display mode, but installed-device validation remains distinct. Bootstrap failures and tabs predating the feature are outside recovery. Browser-specific MIME strings are unit-tested; that is not a Safari browser claim. Existing broad unit-suite instability (LIMIT-007) is not bypassed or claimed resolved.

## Reproduce the temporary fixture

Use a disposable worktree with installed dependencies. Under apps/web/.angular/pr15-browser-check create tsconfig.json extending ../../tsconfig.app.json, including ../../src/**/*.ts and ./*.ts, excluding ../../src/**/*.spec.ts. Add target.ts exporting a standalone Target component with template `<h1>Fixture target A</h1>`.

Add main.ts importing bootstrapApplication, real App and appConfig from ../../src/app, Component, RouterLink and provideRouter. Define an eager Home component with a heading, draft input and RouterLink to /__recovery_check/target with query check=a%26b and fragment section. Bootstrap App with appConfig.providers followed by: ProductAnalyticsService mock with async bootstrap and no-op capturePwaUpdateAvailable/capturePwaUpdateApplyRequested; PushOptInPromptService mock with async maybePromptWhenIdle; provideRouter with eager __recovery_check/home and lazy __recovery_check/target using import('./target').then(m => m.Target). These replace optional prompts only; real recovery/App/config stay intact.

From apps/web: `npm exec -- ng build --configuration production --browser .angular/pr15-browser-check/main.ts --ts-config .angular/pr15-browser-check/tsconfig.json --output-path /private/tmp/hatcast-pr15-browser-A`. Change only target marker A to B and build to /private/tmp/hatcast-pr15-browser-B. Copy each output's browser folder into sibling nginx fixture directories A and B. Find target chunk names by their marker in built JS.

Use changed nginx template with port 8080 and document root /tmp/pr15-current, a container symlink to mounted A or B. Preserve proxy locations, with no API running; bind an unused loopback port. Run nginx -t and HTTP expectations listed above. Switch the symlink inside the container between versions while keeping the browser tab open.

Use fresh Chromium contexts for each case, allowing workers for cases 3–5 and blocking them otherwise. Start on A Home and follow its target link after switching nginx to B. For worker-loss cases, wait for navigator.serviceWorker.controller, reload once and verify A target in CacheStorage before deleting its entry; clear/disable Chromium HTTP cache too. This loss is a test stimulus, never product behavior. For prepared-version case, post CHECK_FOR_UPDATES to the worker and await VERSION_READY before confirming. Check main-frame navigation count, final path/query/hash, worker messages and input value. For initial failure, open the target URL directly while intercepting its A chunk with 404; switch to B, remove interception, confirm and check same-address full reload. Expect no home/dismiss action on this initial failure.

Receipt excerpt: 12 HTTP checks and six browser cases pass. New-version recovery emits UNRECOVERABLE_STATE, VERSION_DETECTED, VERSION_READY, OPERATION_COMPLETED. Prepared-version recovery additionally emits NO_NEW_VERSION_DETECTED then OPERATION_COMPLETED. Healthy-cache case renders A content with no modal. Generated fixtures, scripts and owned nginx container are temporary verification assets and are not shipped.

## Android human smoke environment prepared (2026-10-21)

URL: https://patrices-macbook-pro.tail3f7249.ts.net:8443/__recette/ (tailnet only; Tailscale enabled on phone). Dedicated origin with manifest name HatCast Recette and start URL /__recovery_check/home, separate from the ordinary port-443 app. Full start-dev.sh --offline stack runs in the dedicated worktree; API health UP, anonymous auth 401 and front /connexion 200 verified. The controlled failure uses an isolated fixture screen, real App/config/recovery dialog and real Angular service worker, rather than business account data. Optional analytics/push prompts are stubbed in that temporary fixture.

The dashboard now restores server A while preserving worker registrations/caches used by other live clients; its initial Home URL uses ngsw-bypass=true so the test screen comes from A. This supersedes the destructive first reset implementation (BUG-044). Home keeps a draft, switches server A to B, evicts its old target chunk from the test worker cache and exposes a lazy navigation. Test nginx disables HTTP caching for JS to make reproduction deterministic. This explicit fault injection is test-only. No product source or normal application cache policy changed for the phone setup.

Exact tailnet URL verified in Chromium: old Home retained; deployment; failure; modal; dismissal retains draft; second navigation; user-confirmed real-worker update; target B with query/fragment retained. Reset and dedicated manifest also pass. Log /private/tmp/hatcast-pr15-phone-check.log. Actual Android installed-PWA and Chrome observations remain for Patrice to report.

Owned runtime: start-dev session (API 8080, HTTPS dev front 4200); Node controller /private/tmp/hatcast-pr15-phone-server.cjs on 61103; container hatcast-pr15-phone-01a15fb9 on 61102; Tailscale HTTPS 8443 -> 61103. Existing Tailscale 443 -> 4200 preserved. Stopped and removed at local closure after user confirmation. Cleanup later only these owned processes/container plus `tailscale serve --https=8443 off`, preserving the original 443 entry. Temporary source backup /private/tmp/hatcast-pr15-phone-source; generated A/B builds and runtime under /private/tmp/hatcast-pr15-phone-*.

## Phone feedback correction — repeatability and action row

User reported one-time-only recipe behavior and requested primary left / dismiss right in one row. Reproduced reset failure with a second client left on B; initial single-client checks missed it. Test dashboard reset no longer unregisters workers or clears caches, preserving other live clients; initial Home document bypasses worker navigation. Only temporary fixture reset changes; production recovery state machine unchanged.

On final served builds, three consecutive complete cycles pass with another B client still open: fault injection, modal, Plus tard preserves draft, second fault, user-confirmed worker check/full navigation to B, then reset. Receipt /private/tmp/hatcast-pr15-repeat-ui-final.log. Dark-theme real Chromium at 320px: primary x40/w151.23/h56, dismiss x199.23/w80.77/h48, vertically centered in same row, scrollWidth=viewport=320. Screenshot /private/tmp/hatcast-pr15-modal-row-320.png inspected. Local component CSS only; standard shared dismiss retained. Final production build passes. Focused service/dialog tests rerun; actual Android/installed-PWA feedback pending. No commit/push/deploy.

## Closure evidence

Patrice confirmed repeated phone recipe, then requested removal of interactive recipe before commit/closure. Fixture sources, generated A/B builds, controller/container and dedicated Tailscale :8443 entry removed; original port-443 configuration preserved. Only product code, automated regression tests and documentation enter the commit. Historical temporary source/script references describe completed checks and are no longer live assets; receipts/logs remain evidence. No separate installed-PWA or Safari acceptance inferred from repeatability confirmation.
