---
title: 'PR 15: Minimal stale-route update recovery'
type: bugfix
created: '2026-10-21'
status: done
route: dispatch
review_loop_iteration: 0
baseline_commit: 3a0a08482a4e9d1961f9b2469123ffc874a685c5
source_pr_head: 8740a147c63397623b5cc7bd3e2cadc1197491cb
context:
  - '{project-root}/docs/v2/technical/FRONTEND_UI.md'
  - '{project-root}/_bmad-output/planning-artifacts/ux-design-dialog-patterns.md'
---

<frozen-after-approval reason="approved 2026-10-21: user requests a surgical fix and explicitly rejects unnecessary complexity">

## Intent

**Problem:** An old open client can request a removed lazy-route chunk after deployment and leave navigation broken.

**Approach:** A central router hook offers the agreed modal. Only after user confirmation, prepare the Angular update if this client is worker-controlled, then perform a full-document navigation to the intended destination. Otherwise perform the user-requested refresh directly. Cover installed PWA and ordinary web without changing each route.

## Boundaries & Constraints

**Always:** Keep the fix small. Match recognized import/MIME errors only; preserve the existing error-reporting path. Eagerly load the recovery dialog, deduplicate it, and retain the current screen. Copy: “Une mise à jour est nécessaire”; “Mets HatCast à jour pour continuer.” Primary “Mettre à jour et continuer”, secondary “Plus tard”. Add “Les modifications non enregistrées peuvent être perdues.” Keep existing dialogs/drafts on dismissal. If no usable route ever rendered, offer only update/retry without dismissal or Escape; the root/auth loading redirect is not a safe home fallback. Suppress system banners while the dialog is active; preserve their normal states. Retryable errors remain dismissible when a usable route was previously rendered. Resume only a validated same-origin path with its query and fragment, including when the intended address equals the current document or differs only by its fragment.

**Never:** Replace ErrorHandler; subscribe to worker-only signals to interrupt working tabs; add cross-tab messaging, release fingerprinting/HTML parsing, a draft manager, persistent recovery state, cache deletion or worker unregistration. Do not modify auth/business routes, push behavior, or normal update policy. Do not automatically reload, even on startup or late async completion. Do not promise exact stale-release detection from a browser import error: offline/transient failures can have the same signature and need honest connection/retry feedback. No recovery before the shell starts. No push, deployment or remote PR edits. Local commit/integration/owned cleanup authorized by the user at closure on 2026-10-21.

## I/O & Edge-Case Matrix

| Given | When | Then |
|---|---|---|
| Any configured lazy route | Recognized import/MIME failure | One eager modal captures exact failed destination; ordinary exceptions do not prompt |
| No actual worker controller | User confirms while online | One full-document navigation to the exact destination |
| Controlled client | User confirms | Bounded SwUpdate.checkForUpdate; true or NO_NEW_VERSION_DETECTED confirms a prepared/known manifest, then full navigation; do not call activateUpdate in recovery |
| Already-prepared version | checkForUpdate is false and NO_NEW_VERSION_DETECTED is observed | Consent still resumes by full navigation; no missed VERSION_READY dependency |
| Offline, false without known-manifest event, rejection or timeout | Recovery attempted | No navigation, retry feedback and dismissal only over a previous usable route; discard late check results safely |
| User declines or clicks twice | Dialog is open/checking | Existing screen survives; no duplicate dialog/check/navigation |
| No previous routed screen | Initial lazy navigation fails | Update/retry-only modal, with no dismiss or Escape; root AuthRedirect is only a loading placeholder |
| Storage denied | Any recovery/normal update bookkeeping | Explicit recovery still works; optional changelog storage cannot prevent reload after normal activation |
| Healthy route/SW or another working tab | No local route import failure | No recovery modal or altered navigation |

</frozen-after-approval>

## Code Map

- `apps/web/src/app/app.config.ts`: use withNavigationErrorHandler, inject the recovery service in the hook, return void to preserve error propagation. Do not change route definitions.
- `apps/web/src/app/app.ts`, `app.html`: eagerly initialize recovery state and hide install/update wrappers only while its modal is active.
- `apps/web/src/app/core/pwa/pwa-update.service.ts`: normal applyUpdate activates then writes an optional changelog storage flag; isolate the storage failure (BUG-043) so reload always follows successful activation. No broader refactor.
- `apps/web/src/app/shared/pwa/pwa-system-banner/`, `shared/dialog-chrome/`: reuse identity, tokens and shared plus_tard dismiss. Banners currently out-rank default CDK dialogs.
- Installed Angular 21.2.9: SwUpdate.checkForUpdate=true follows initialization; an already-known manifest emits NO_NEW_VERSION_DETECTED and returns false; offline/installation failure can return false without that event. Subscribe before checking; release the temporary subscription afterwards. Full navigation maps the new client to the ready latest version. Unlike activation, checks do not switch the current client, so late results may be safely ignored.
- Old investigation/verification/party files are historical evidence; this minimal spec supersedes their broader architecture and test-harness requirements.

## Tasks & Acceptance

- [x] `deploy/v2/nginx.conf.template` — reuse PR root JS/MJS/CSS missing-file 404 and index/manifest no-cache rules; preserve navigation fallback and API proxy.
- [x] `apps/web/src/app/core/pwa/chunk-recovery.service.ts` plus test — central classification, one-dialog ownership, consent-only readiness check (30s maximum), safe full navigation, no persistent storage. Reject/disable off-origin destinations. If the dialog is closed or navigation superseded it while checking, a late check must not navigate. Re-check actual controller on confirmation; never gate on installed display mode.
- [x] `apps/web/src/app/shared/pwa/chunk-recovery-dialog/` plus test — small eager MatDialog, generic approved copy, draft warning, busy/retry state, dismiss over a previous usable route, otherwise update/retry only. Use M3 controls, scrim/focus containment/restoration, no close cross. Temporarily disable duplicate submission/close while checking, restore after timeout/error.
- [x] `apps/web/src/app/app.config.ts`, `app.ts`, `app.html`, `app.spec.ts` — wire hook/host, preserve original error behavior and existing normal banners.
- [x] `apps/web/src/app/core/pwa/pwa-update.service.ts` and existing test — best-effort changelog flag only; prove denied storage cannot interrupt normal post-activation reload.
- [x] `SPEC.md`, `ARCH.md`, `ISSUES.md`, this spec — concise delivered behavior, actual evidence and limits. Preserve existing BUG-038 and use BUG-040 for stale-route recovery.

**Acceptance Criteria — Material 3 (UI):** Given keyboard/mobile/desktop use, when the dialog opens, then it has French labels, standard MatDialog focus/scrim, M3 tokens, >=48px controls and an explicit dismiss over a previous usable route; initial failures remain update/retry only. Given ordinary navigation or normal update/install UI outside recovery, when used, then behavior is unchanged.

## Implementation Notes

Implementation in dedicated worktree `feat/pr-15-pwa-recovery`. Existing planning notes/registry are task-owned and must be preserved. No canonical epic story key; never edit sprint-status.yaml. Dependencies must be installed in this worktree, never symlink mutable node_modules. Context paths resolve against this worktree. The delegate may request needed sandbox escalation for edits/install/tests in this approved worktree.

## Spec Change Log

- 2026-10-21 phone feedback: primary update action first/left and shared Plus tard second/right in one row; local footer CSS only, wrapping the primary label inside its button if needed. Phone fixture repeatability reported as BUG-044, investigated separately from production recovery.

- 2026-10-21 review correction: Removed the misleading initial “Retour à l’accueil” fallback under the user’s surgical-fix instruction: `/` is an AuthRedirect loading placeholder that redirects to a lazy agenda, not a safe eager home. Initial failures now offer only update/retry without dismissal or Escape; a previously usable route retains “Plus tard”. No auth/business route changed.

- 2026-10-21: Human accepted the party recommendations and explicitly requested a surgical correction. Removed global ErrorHandler, unsolicited worker modals, HTML fingerprints, persistent recovery guards and a committed A/B harness. Replaced risky explicit activation with ready-check + user-confirmed full navigation; added draft warning, initial-root escape and small existing storage bug hardening. Keep global route coverage, PWA/web behavior and original error reporting.

## Review Triage Log

| Finding | Verdict / disposition | Evidence |
|---|---|---|
| Blind 1: initial root escape fails again | medium / patch | AuthRedirect calls PostLoginNavigationService, whose default is lazy /agenda. Removed the misleading fallback; initial recovery offers update/retry only. No auth-route change. |
| Blind 2: root placeholder counted as usable | medium / patch | Root renders only Chargement. Root is excluded from usable screens; focused test passes. |
| Blind 3: navigation failure lost during closing animation | medium / patch | Material separates beforeClosed and afterClosed. Ownership now releases at beforeClosed with identity check; delayed-close regression passes. |
| Blind 4: cancelled replacement removes recovery | medium / patch | NavigationStart does not establish success. Keep modal until NavigationEnd; invalidate pending confirmation on NavigationStart. Guard-cancel and failed-replacement tests pass. |
| Blind 5: concurrent known-manifest broadcast can overlap a failed check | low / rejected complexity | Installed worker broadcasts NO_NEW_VERSION_DETECTED to every client. Simultaneous checks against different manifests can be inconclusive. Worst case here is a consented reload needing another refresh, with no cache deletion or forced activation. Accept this rare residual under the explicit surgical-fix instruction rather than add cross-tab correlation; recorded in BUG-040. |
| Blind 6: fixture omits real auth escape and another open dialog | low / accepted verification limit | Removed the auth escape. Recovery closes only its own ref, never unrelated dialogs. Simultaneous-dialog focus is not browser-tested; no business/auth coverage claim. |
| Blind 7: narrow geometry unverified | false / documentation corrected | Parent had measured actual Chromium at 320px: no horizontal overflow and both actions >=48px. Evidence now recorded; zoom/screen-reader checks remain unexecuted. |
| Blind 8: no WebKit run | low / accepted verification limit | Disclosed limitation: exact original MIME signature is unit-tested; actual browser run is Chromium only. No Safari runtime claim. |
| Blind 9: temporary receipts hard to reproduce | low / patch documentation | Added durable fixture reconstruction/build instructions, scenario procedure and receipt excerpts to verification artifact. No permanent product harness. |
| Edge 1: rapid failure during exit animation | medium / patch | Same demonstrated ownership race as Blind 3; delayed-afterClosed test proves the new modal survives old close notifications. |

Verification-gap reviewer: no gaps found. All three reviewers completed before triage. Parent inspected the patches and their focused regressions. No high findings.

## Verification

Run targeted Vitest for recovery classifier/controller/real-router integration, actual MatDialog and app root, existing pwa-update/banner/install tests; cover every matrix row and forwarding of ordinary errors. Test true, false+known event, false without event, rejected/late/timed-out checks, modal cancellation and initial/hash-only destinations. Build production. Run nginx syntax/HTTP fixtures when available, recording any limitation. Prefer a focused temporary browser check over adding general permanent infrastructure; do not claim installed-PWA or real SW proof from mocked tests. Record unexecuted browser/device checks explicitly. Run git diff --check. Do not run a blanket known-red suite or disable tests to obtain green.

### Delivered implementation evidence (2026-10-21)

- Targeted Angular/Vitest run: **9 files, 93 tests passed**, covering the exact Safari MIME error from PR 15, other recognized signatures and ordinary errors, destination validation, real-router rejection propagation, consent/worker readiness outcomes, timeout and late completion, initial update/retry-only behavior, full-document same-address/hash navigation, actual MatDialog copy/busy/retry controls, app banner preservation, and existing PWA install/update/banner behavior. The normal update storage-denial regression confirms post-activation reload is invoked.
- Final production build (`npm run build --workspace @hatcast/web -- --configuration production`) succeeded after review patches; existing Sass deprecation and component budget warnings remain. No tests were disabled. JSDOM reports its expected unsupported real navigation warning for the existing normal update test; unit tests use an injected navigation function and do not prove a browser reload or real service worker.
- `git diff --check` passed after the implementation and focused test additions.
- MatDialog uses its standard scrim/focus containment/restoration, French copy, Material buttons, theme tokens and 48px controls; shared `plus_tard` dismiss is reused. Existing banner component instances remain mounted while their wrapper is hidden. No M3 waiver introduced.
- Browser/nginx evidence is recorded by the parent review in the dedicated verification artifact. Real multi-release Angular service-worker promotion is verified in Chromium; installed-device PWA validation still requires a human device check.

### Parent verification

- Read actual changed files and audited all approved matrix rows against passing tests. Final standard production build passes, plus two temporary production-fixture builds. Twelve real nginx HTTP checks and six real Chromium cases pass, including actual active-worker recovery and already-prepared-version recovery. See the delivered verification artifact for commands, limitations and receipts. No permanent test harness, fixture source or auth-guard change is shipped.

## Local closure (2026-10-21)

Patrice confirmed repeated phone recipe and requested removal of the interactive recipe before commit/local closure. Temporary servers, A/B builds, fixture scripts and Tailscale :8443 access removed; product sources contain no recipe route, switch endpoint or fault injection. Automated regression tests retained. No canonical epic/story key exists for this issue-driven fix; spec status done and ISSUES records are its tracking artifacts. Sprint-status.yaml is unchanged. Confirmation covers phone repeatability; no separate installed-PWA/Safari approval inferred. Local commit and v2 integration authorized; no remote operation authorized.
