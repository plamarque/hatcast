# PR 15 recovery — BMAD party review

Historical planning/review record, superseded by spec-pr-15-stale-client-recovery.md and the delivered verification artifact.
Date: 2026-10-21. Status: discussion open, specification remains draft. No production code changed. Lenses: Winston (architecture), Sally (UX), Amelia (implementation scope), Murat (regression evidence). Source-level findings and focused deterministic probes are distinguished below from browser evidence, which is not yet available.

## Findings requiring specification revision

### R1 — High: activation cannot use the same cancellation policy as a read-only check

Evidence: `pr-15-recovery-investigation.md`, shared-state paragraph and update sequence, says to discard late results after timeout, restore close after failure, and avoid navigation on late completion. In Angular 21.2.9 `Driver.updateClient`, the client-version mapping changes before persistence and the operation acknowledgement. `SwUpdate.activateUpdate` offers no cancellation argument. A UI timeout does not undo that switch. Restoring normal interaction and ignoring a late successful activation can leave the old JavaScript executing with a new worker-version assignment.

A focused probe executed the exact installed `updateClient` method with a delayed `sync()` and confirmed that client mapping B exists before acknowledgement; discarding the delayed result leaves no reload. This proves the ordering risk, not a completed production-browser reproduction.

Required revision: separate cancelable/preparatory checks from the committed update step. Do not restore ordinary old-runtime use after an activation with uncertain outcome. Prefer the documented Angular pattern of full-document navigation once a usable version is ready if the real A/B tests validate the already-prepared-version and degraded-worker cases. If retaining explicit activation, specify a committed state, terminal navigation, late completion and timeout recovery that cannot leave mixed versions. Do not silently change normal banner behavior or the prior Story 10.2 contract.

Primary reference: https://angular.dev/api/service-worker/SwUpdate warns against activation without reload; https://angular.dev/ecosystem/service-workers/communications recommends user-confirmed reload once ready. Local installed Angular 21.2.9 `ngsw-worker.js`: `updateClient`, `assignVersion`, `setupUpdate`; service-worker.mjs: `SwUpdate.activateUpdate`.

### R2 — High: Plus tard has no usable screen to restore on an initial failed destination

Evidence: the spec covers initial lazy navigation after shell bootstrap and promises to preserve the rendered screen on dismissal. For a direct deep link, after refresh, or after a notification opens a new client, the shell can exist while no prior routed component has rendered. Dismissing the only recovery dialog can reveal an empty router outlet.

Required revision: distinguish a previous usable rendered route from initial navigation. Retain Plus tard for an existing screen; provide a safe eager fallback (reuse existing root/AuthRedirect behavior) or keep an actionable retry surface when there is no previous screen. User-visible copy/action exception needs a product decision. Test both states rather than only the open-home -> agenda scenario.

### R3 — Medium: an unrecoverable event is not necessarily a local failed interaction

Evidence: Angular 21.2.9 `Driver.notifyClientsAboutUnrecoverableState` posts to all clients mapped to the broken app version, not just the client whose resource request failed. A second tab may be editing an already loaded form. The current spec feeds all such signals to a modal root flow without distinguishing local failure.

Required revision: avoid turning one tab's failed navigation into an unexpected blocking modal in other still-usable tabs. Recommended initial scope: router failure opens recovery; worker events supply readiness/diagnostic state, and a worker-only event does not interrupt an unrelated active screen. Keep each tab's destination and consent local. Test two real contexts/tabs sharing a worker; do not confuse this with a controller changing in a single tab. Explicit product decision needed if modal interruption on worker-only signals is desired.

### R4 — Medium: replacing Angular ErrorHandler expands the blast radius unnecessarily

Evidence: the draft requires `chunk-recovery-error-handler.ts`, changing the global pipeline for every exception. All 27 actual route loaders already pass through the router hook. Outside routing, the discovered imports are an unused legacy filter-panel path, optional analytics before bootstrap (already outside modal reach), and the framework's async renderer. No observed post-bootstrap feature failure has established a need for global exception replacement.

Recommendation: first implementation handles all navigation routes centrally plus carefully scoped worker signals; preserve existing global ErrorHandler. This still covers all page-navigation destinations. Treat unrelated runtime-import recovery as separate scope supported by a concrete failing consumer, not as a prerequisite for all-page coverage. This is a risk-reduction choice, not a claim that a custom ErrorHandler is inherently broken.

### R5 — Medium: consent does not explain possible loss of an unsaved draft

Evidence: the frozen constraints acknowledge that reload can discard drafts, but the displayed copy only says to update to continue. An open form/dialog can remain behind the scrim, and a worker-only signal can arrive while editing. Current code has dialogs that explicitly protect an in-flight save (e.g. availability-dialog updates disableClose while saving).

Recommendation: add a short confirmation warning such as “Les modifications non enregistrées peuvent être perdues.” Do not build a repository-wide draft registry as part of recovery. Preserve underlying dialogs on dismissal; never use closeAll() to open recovery. Before preparing a full navigation, do not silently imply an in-flight save is complete. User decision: accept a warning and explicit confirmation versus requiring stronger draft/save protection (larger scope).

### R6 — Medium: negative and coexistence tests need to be explicit release gates

The current test matrix already includes a healthy worker and banner stacking. Add named assertions for: unrelated HTTP/auth/guard/business errors; ordinary banner update/dismiss before and after recovery; existing form/dialog + dismissal; two tabs with only one local failure; failed initial deep link with no previous screen; late activation acknowledgement; readiness tied to a specific version rather than a stale boolean; and deployment C while recovering from A to B. Use production A/B behavior, not only callbacks mocked to resolve immediately. Browser-specific claims must distinguish Chromium proof from WebKit/Safari or actual installed-PWA verification.

## Additional existing code defect exposed by reuse

### R7 / BUG-043 — storage bookkeeping can interrupt an already committed update

`PwaUpdateService.applyUpdate()` awaits activateUpdate, then writes the optional changelog sessionStorage flag, then reloads, all under one catch. A denied storage getter/setItem takes the catch after activation, prevents reload, and resets refreshing. Executing the exact existing method with a successful activation and throwing setItem reproduced activated=true, reload=false, refreshing=false. This is a deterministic method-level reproduction; no production frequency is known.

Required boundary: optional changelog/telemetry/storage failures must never interrupt the version-transition -> full-navigation sequence. Do not blindly delegate new recovery to this method. Keep the existing normal update flow behavior under regression test; decide explicitly whether to make the small shared-path hardening in this change rather than introducing a second divergent apply path.

## Proposed direction, not yet approved

Keep the generic modal UX and all-route navigation coverage. Reduce the initial footprint by retaining the existing global error pipeline. Resolve R1 before coding the update path. Add a safe initial-navigation escape and explicit unsaved-change warning; make worker-only multi-tab behavior noninterruptive by default. Expand regression gates above. Preserve current authentication, business routes, caches, service-worker push behavior and all explicit consent boundaries.

## Discussion status

The specification and its frozen-intent block were not rewritten during this review. Its status remains draft. Product choices still open: scope reduction; generic draft warning versus stronger save protection; initial-navigation secondary action; worker-only interruption policy. Technical mechanisms are the implementer's responsibility and must be proven, not delegated to the user as an API-design choice. No claim of regression-free behavior is justified before those changes and the planned tests.
