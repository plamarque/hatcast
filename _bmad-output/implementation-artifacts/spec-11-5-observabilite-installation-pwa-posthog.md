---
title: 'PWA installation, updates and release notes observability in PostHog'
type: 'feature'
created: '2026-10-17'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
baseline_commit: '74e59d5b866041ce9ba48f4f54a88cbd88062635'
context:
  - '{project-root}/AGENTS.md'
  - '{project-root}/docs/v2/technical/DEPLOY_V2_CLOUD_RUN.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Operators need to observe installation guidance, native installation signals, update offers and application, client releases and release-note consultation, with a technical snapshot and named follow-up of people on older releases.

**Approach:** Add bounded typed events, immutable bundled release identity and a CI-managed PostHog lifecycle dashboard. This complements Story 11.6 (PWA versus Web adoption). This story owns installation, updates and release notes; 11.6 owns access-mode observations.

## Boundaries & Constraints

**Always:** Capture through `ProductAnalyticsService`; keep analytics a no-op without a PostHog key; use the existing authenticated UUID identity lifecycle only. Emit one event when the manual-instructions dialog actually opens, with a bounded entry point and fallback reason. Keep native-prompt acceptance/dismissal and `appinstalled` semantically distinct. Capture a visible update offer, its dismissal, and a click to apply separately; an apply click is not post-reload confirmation. Use PostHog's parsed browser, browser-version, OS, OS-version, and device-type metadata for compatibility analysis. Exclude demo traffic through a deterministic documented filter once available.

**Never:** Send a raw user agent, device model, hardware/device identifier, fingerprinting data, screen-level unique identifier, URL, email, name, free text, raw error, or new Person property. Do not alter installation UX, service-worker/manifest behavior, prompt timeout semantics, existing 10.5 instructions, 11.4's organizer event contract, or PostHog objects without explicit authorization.

**Decision (PO, 2026-10-18):** The lifecycle dashboard and its insights are provisioned and updated by CI after successful production deployment. CI captures `hatcast_release_promoted`; no manually maintained SQL variables are required. A separate failed observability job does not undo the deployed application. For active people whose last observed release differs from the latest promoted release, show elapsed whole days since that latest production release and last-seen time. Use existing People `name` and `email` in the operator table. On release-note opening, snapshot viewport width/height in CSS pixels and use the event's parsed device type (`phone`/`tablet`/`desktop`/`unknown`), OS/browser and their available versions. Capture bounded visible time and scroll distributions on loaded-dialog close; no engagement threshold.

**Confirmation boundary:** `pwa_update_applied` means a new bundled release was observed in the same browser tab after an identified user's recorded update request. A same-release reload, absent/invalid/expired request, another user's request, or mere fetch of a new `version.txt` must not confirm application. Session state is best-effort with a seven-day maximum age.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Manual help is shown | User invokes install; no native prompt, prompt fails/times out, or development origin blocks it | Exactly one `pwa_install_instructions_viewed` with a bounded reason and instruction variant | Analytics failure never blocks the dialog |
| Native path resolves | Browser exposes `beforeinstallprompt` | Capture bounded accepted/dismissed result; do not show manual-help event unless fallback opens it | Timeout/failure falls back to the manual-help event |
| Native callback | Browser emits `appinstalled` | Capture a partial platform installation signal; it does not fabricate a manual-platform timestamp | Analytics failure never blocks installation UX |
| Update is available | Angular service worker makes a new version visibly actionable | Capture one `pwa_update_available` with source `version_ready` or `fallback` while the banner stays visible | Analytics failure never blocks the update banner |
| Update interaction | User dismisses or clicks « Mettre à jour » | Capture `pwa_update_dismissed` or `pwa_update_apply_requested` | An apply request is not reported as an applied update after reload |
| Next startup | Identified user's recent update request exists and bundled release differs | One `pwa_update_applied` with prior/current release and bounded delay | Same release or unavailable storage produces no confirmation |
| Notes open / close | Existing dialog opens; content later loads | Opening includes viewport snapshot; loaded close includes visible-time/scroll buckets | Failed/empty content sends no close-reading signal; analytics cannot block UX |
| Successful production deploy | CI deployment succeeds | Promotion reference event and idempotent lifecycle dashboard provisioning | Separate observability job reports failure and can be rerun |
| Analytics is disabled | No configured PostHog key | Existing PWA behavior is unchanged and no analytics request is sent | No retry or local queue |

</frozen-after-approval>

## Code Map

- `apps/web/src/app/core/pwa/pwa-install.service.ts` -- single convergence point for native prompt, bounded fallback paths, and actual manual-dialog opening; preserve the PWA UX behavior.
- `apps/web/src/app/core/pwa/pwa-update.service.ts` -- existing service-worker update availability, dismissal, and activation request paths; preserve the UX and reload semantics.
- `apps/web/scripts/build-with-release.mjs` and `core/analytics/release-context.ts` -- immutable bundled release identity derived from release artifact, separate from server-side version fetches.
- `apps/web/src/app/shared/changelog/` -- opening source, viewport snapshot, loaded close, visible duration and scroll buckets.
- `scripts/v2/posthog-lifecycle-dashboard.mjs` and `.github/workflows/deploy-v2-cloud-run.yml` -- production reference event and managed dashboard/insight provisioning.
- `apps/web/src/app/core/pwa/pwa-browser-info.ts` and `pwa-install-instructions.ts` -- existing bounded browser classification and instruction variants; never export their source UA.
- `apps/web/src/app/core/analytics/product-analytics.service.ts` and `fr47-event-names.ts` -- centralized typed capture, enabled/no-op contract, and event constants.
- `apps/web/src/app/core/analytics/posthog-browser.client.ts` -- PostHog initialization and existing identified-only person policy; do not extend person properties.
- `apps/web/src/app/core/pwa/pwa-install.service.spec.ts`, `pwa-update.service.spec.ts`, and `core/analytics/product-analytics.service.spec.ts` -- targeted behavior and capture/no-op coverage.
- `docs/v2/technical/PWA_LIFECYCLE_POSTHOG.md` -- lifecycle event catalogue, CI ownership, named operator queries and verification boundaries. The adoption catalogue remains unchanged.
- `docs/v2/technical/DEPLOY_V2_CLOUD_RUN.md` -- EU PostHog operator-access and production-only configuration constraints.

## Tasks & Acceptance

**Execution:**
- [x] `apps/web/src/app/core/analytics/` -- add typed names, bounded property allow-lists, and capture methods for manual-help, installation, and update interactions.
- [x] `apps/web/src/app/core/pwa/pwa-install.service.ts` -- call the typed capture only at actual state transitions/dialog opening; pass an explicit bounded fallback reason without changing install behavior.
- [x] `apps/web/src/app/core/pwa/pwa-update.service.ts` -- capture only visible update availability, dismissal, and apply request without changing update/reload behavior.
- [x] `apps/web/src/app/core/analytics/*.spec.ts` and `apps/web/src/app/core/pwa/*.spec.ts` -- prove one capture per transition, disabled no-op behavior, deduplication, and prohibited-property absence.
- [x] `docs/v2/technical/PWA_LIFECYCLE_POSTHOG.md` -- document lifecycle-support events separately from the adoption contract.
- [x] Bundle release identity, observe it after identification, and confirm changed release after an owned update request.
- [x] Instrument notes opening and loaded close; verify failed content and bounded snapshot.
- [x] Add CI-only promotion capture and idempotent dashboard provisioning; test through a mock API before any external writes.
- [x] Document credentials, data-start limits, named operator access, and the days-behind definition.
- [x] Configure CI access and validate real HogQL execution (successful run `39099343937`, six insights).
- [x] Record the PO's explicit 2026-10-18 decision: waiting for real client events and a two-release runtime sequence is not a story-closure gate; verify these after release without claiming they have already passed.
- [x] `PLAN.md` and `_bmad-output/implementation-artifacts/sprint-status.yaml` -- register Story 11.5 through the supported BMad story controller only; do not hand-edit generated tracker state.

**Acceptance Criteria:**
- Given manual installation instructions actually open, when any supported entry route reaches that dialog, then PostHog receives one bounded `pwa_install_instructions_viewed` event that distinguishes unavailable prompt, untrusted development origin, and native-prompt failure without raw error details.
- Given a native prompt resolves or the browser emits `appinstalled`, when its outcome is observable, then the event contract preserves accepted, dismissed, and completed states without treating any one of them as universal installation proof.
- Given a visible update is offered, dismissed, or the user requests its application, when those state transitions occur, then PostHog receives one bounded lifecycle event per transition without treating an apply request as post-reload confirmation.
- Given operators investigate these lifecycle events, when they query the existing PostHog environment, then they can filter manual-install events by bounded reason and instruction variant and update offers by bounded source without new identity fields or changes to the separate adoption dashboard.
- Given all captures, when tests inspect their payloads, then the allow-list rejects raw UA, model, device/fingerprint identifiers, person data, URLs, free text, and raw failures.
- Given an identified startup, then report immutable bundled release once per page lifetime/user and confirm application only from a valid earlier update request owned by that user.
- Given a notes dialog opens, then its snapshot records opening-time CSS viewport dimensions with event-attached parsed OS/browser/device information; loaded closes report only bounded visible time and scroll.
- Given successful production deployment, then CI updates the separate lifecycle dashboard without manual variables; its named table uses existing People properties and reports whole days since latest release for people last observed on another release.

## Implementation Notes

## Spec Change Log

- 2026-10-18 — PO approved CI automation, age in days, existing names/emails and viewport/device/OS/browser snapshot. Supersedes the no-dashboard decision and the separate draft in `codex/posthog-install-update-dashboard`; this worktree and story are canonical for lifecycle delivery. Adoption remains Story 11.6.

## Review Triage Log

2026-10-18 post-conflict local self-review against current `v2`: organizer methods, safe context projection, `has_ever_organized`, workspace deduplication/reset and adoption session deduplication are retained unchanged; lifecycle observes the same identified UUID without introducing parallel identity state. The combined regression proves independent adoption/release/workspace captures and logout boundaries. Workflow review confirms a production-only successful-deploy dependency, no check-mode deployment, and no new secret output. This is a local self-review, not an independent BMad review.

2026-10-18 formal local self-review: corrected release identity to be bundled (live version fetch cannot prove client update); moved manual-help capture after actual MatDialog opening; prevent a notes-close event from being attributed after an identity change; CI promotion uses deployment completion date rather than retry date; added Actions read permission and duplicate/cross-origin provisioning guards. These fixes were re-tested. Material 3: existing MatDialog/template/theme/focus/dismiss controls retained; no visual/style/navigation changes. Remaining external verification: real PostHog schema/query execution and two-release smoke.

## Design Notes

The story separates manual help, browser-confirmed native installation, update availability, dismissal, apply request, and a changed bundled release observed later. A request alone is not confirmation. Adoption remains a separate contract. Visible reading time and scroll buckets do not imply comprehension.

## Verification

Final reconciled-tree evidence, 2026-10-18: 297 Angular tests passed across 16 files (analytics, PWA, changelog, organizer/detail, availability and announcements); all 5 Node provisioning tests passed. Production build succeeded, and bundled `2.6.2:5009b980` identity was found in generated JavaScript. Workflow YAML gate/isolation assertions passed. Tracker delta against `v2` is exactly the addition of the 11.5 `done` entry, leaving 11.4 and 11.6 unchanged. Integration and process/worktree cleanup are verified separately after this commit; no push or deployment.

2026-10-18 local closure: PO explicitly authorized resolving integration conflicts while preserving 11.4 organizer and 11.6 adoption contracts, and a targeted manual tracker correction because the supported controller rejects the registered ASCII key (BUG-BMAD-001). No unrelated tracker entry is changed. Merge reconciliation retains organizer allow-lists, deduplication and identity reset; lifecycle uses that same identified UUID. A combined regression checks the three event families and reset behavior. Production build and Node tests pass; historical Sass/style-budget warnings remain. No UI styling, controls, focus, layout or navigation changed (Material 3 checklist: existing MatDialog retained; visual change checks N/A). Real events and the two-release sequence remain explicitly deferred, not claimed as verified.

2026-10-18 closure decision: the PO explicitly requests a local commit, integration into `v2`, and closure without waiting for client traffic. Real client payloads and the two-release update sequence remain unverified and are deferred to release validation. This is an accepted verification boundary, not a claim of live runtime success. No additional push or deployment is authorized by this local closure.

2026-10-18 local evidence: 72 targeted Angular tests passed (analytics, install, update, changelog service and dialog); 3 Node tests passed for release identity, repeated provisioning and invalid API pagination/duplicate ownership. Final Angular production build passed and bundled identity was located in generated JavaScript. Workflow YAML parsing and `git diff --check` passed. Existing Sass and component style-budget warnings remain. Local self-review recorded above. No real PostHog writes, commits, push, deployment or process shutdown performed.

Read-only GitHub configuration check: the production environment has the existing `HATCAST_POSTHOG_PROJECT_API_KEY`. Neither the inspected production environment nor the inspected repository secret/variable lists include `HATCAST_POSTHOG_PERSONAL_API_KEY` or `HATCAST_POSTHOG_PROJECT_ID`. The new job needs these configured before external provisioning can succeed. Values were not read or modified.

Follow-up configuration check, 2026-10-18: the user added both `HATCAST_POSTHOG_PERSONAL_API_KEY` and `HATCAST_POSTHOG_PROJECT_ID` as production environment secrets. Their names were verified read-only; the workflow now accepts the project ID from either a variable or secret. Values, token validity and granted scopes remain unverified; no workflow or external provisioning was invoked.

Subsequent authorized real CI verification, 2026-10-18: commit `83bf536b`, run `39099343937`, success. Dashboard `https://eu.posthog.com/project/193437/dashboard/1032942` and six SQL insights were provisioned and computed through the saved-insight API. Credentials are verified for these operations. An initial scalar dashboards filter caused HTTP 500, fixed and tracked as BUG-POSTHOG-001. The explicitly authorized temporary branch access to production secrets was removed after each attempt; original tag-only `v*` policy was verified restored. Deployment and promotion capture were skipped. Application instrumentation remains uncommitted and undeployed; real client payloads and a two-release update sequence are still unverified.

**Commands:**
- `npm run test -w @hatcast/web -- --watch=false --include='src/app/core/pwa/pwa-install.service.spec.ts'` -- expected: fallback branches and existing UX stay green.
- `npm run test -w @hatcast/web -- --watch=false --include='src/app/core/analytics/product-analytics.service.spec.ts'` -- expected: typed captures and disabled analytics coverage stay green.
- `npm run test -w @hatcast/web -- --watch=false --include='src/app/core/pwa/pwa-update.service.spec.ts'` -- expected: availability, dismissal, apply request, and unaffected update UX stay green.

**Manual checks:**
- In production PostHog Live Events with an authorized test account, verify one manual-help event, a native outcome where Chromium exposes it, and visible update interactions where a safe release-recette permits them. Do not claim live evidence until this is performed.
