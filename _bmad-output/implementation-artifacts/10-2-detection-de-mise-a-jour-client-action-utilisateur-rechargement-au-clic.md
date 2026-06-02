---
baseline_commit: 0dd643164de20a61a7c76859ae59b3bcb2bf3fd0
---

# Story 10.2: Client update detection + user-triggered reload

Status: done

## Story

As a **user**,
I want to be **clearly informed** when a **new client version** is available after deployment, with a **visible button** to apply the update,
so that I can **switch to the new behaviour** without manually clearing cache or suffering a surprise reload mid-action (FR41).

## Acceptance Criteria

1. **Given** a new client bundle deployed (service worker / PWA strategy via `@angular/service-worker` + `custom-sw.js`), **when** the app automatically detects an update is ready (`SwUpdate` `VERSION_READY`), **then** a **visible fixed banner** (Material tokens, high contrast, top placement — parity with install banner) indicates an update is available (FR41).
2. **Given** the update banner is displayed, **when** the user clicks the dedicated **« Mettre à jour »** button, **then** **only at that moment** `SwUpdate.activateUpdate()` runs and the page reloads to activate the new client — no forced reload before the click.
3. **Given** no pending update, **when** the user uses the app, **then** no update banner appears.
4. **Given** the user dismisses the update banner, **when** they continue using the app, **then** the banner stays hidden until a new `VERSION_READY` event (session-only dismiss).
5. **Given** production build with service worker enabled, **when** update flow runs, **then** client deploy remains aligned with coupled front/API pipeline (NFR-R1) — no separate static-only deploy path.
6. **Given** implementation complete, **when** tests run, **then** Vitest covers update detection, apply-on-click, dismiss, and no banner when SW disabled; `npm run test -w @hatcast/web -- --watch=false` succeeds.

**Couverture produit :** FR41 ; NFR-R1 ; NFR-A1 (keyboard + French labels)

---

## Acceptance Criteria — Material 3 (UI)

**M3-1. Composants Material** — `mat-flat-button`, `mat-icon-button`, `mat-icon`, `mat-progress-spinner` (refreshing state) — no custom button styling for primary actions.

**M3-2. Tokens & thème** — Banner uses `var(--mat-sys-inverse-surface)`, `var(--mat-sys-inverse-on-surface)`, `var(--mat-sys-outline-variant)` via shared `pwa-system-banner` (install + update variants).

**M3-3. Mobile & tactile** — Targets ≥ 48dp ; `aria-label` French on icon-only dismiss ; banner `role="region"` with French `aria-label`.

**M3-4. Navigation membre** — N/A (root shell banner only).

**M3-5. Revue** — Checklist FRONTEND_UI.md parcourue en fin de story.

---

## Tasks / Subtasks

- [x] **PwaUpdateService** (AC: 1–4)
  - [x] Create `apps/web/src/app/core/pwa/pwa-update.service.ts` — inject `SwUpdate`, subscribe `versionUpdates` for `VERSION_READY`, expose `showBanner` / `refreshing` signals.
  - [x] `applyUpdate()` — set refreshing, `activateUpdate()`, then `document.location.reload()`.
  - [x] `dismissBanner()` — hide until next `VERSION_READY`.
  - [x] No-op when `!swUpdate.isEnabled` (dev mode).

- [x] **Update banner UI** (AC: 1–2, M3)
  - [x] Create `apps/web/src/app/shared/pwa/pwa-update-banner/` — fixed top bar, French copy, **Mettre à jour** button, dismiss icon.
  - [x] Refreshing state: spinner + « Mise à jour en cours… » (V1 parity).
  - [x] Mount in `app.html` alongside install banner.

- [x] **Harmonized PWA system banner shell** (UX Option A — Sally review 2026-06-02)
  - [x] Extract `apps/web/src/app/shared/pwa/pwa-system-banner/` — shared fixed top bar (tokens, padding, icon 32px, `safe-area-inset-top`, min-height).
  - [x] Refactor `pwa-install-banner` + `pwa-update-banner` into thin wrappers over `PwaSystemBannerComponent`.
  - [x] `pwa-system-banner.spec.ts` + update install/update banner specs.

- [x] **Tests** (AC: 6)
  - [x] `pwa-update.service.spec.ts` — VERSION_READY → banner, applyUpdate → activateUpdate + reload, dismiss, disabled SW.
  - [x] `pwa-update-banner.spec.ts` — render, click update, dismiss.
  - [x] Update `app.spec.ts` mock for `PwaUpdateService`.
  - [x] Run full Vitest suite.

## Dev Notes

### Scope boundaries

| In scope (10.2) | Out of scope |
|-----------------|--------------|
| `SwUpdate` detection + user-triggered reload | Auto-open changelog after reload (**10.3**) |
| Material update banner at app root | Version display / changelog dialog (**10.3**) |
| Vitest unit tests | Playwright E2E |
| Production SW only (`isEnabled`) | Dev-mode SW registration |

### Foundation from Story 10.1

- SW registered via `provideServiceWorker('custom-sw.js', { enabled: !isDevMode(), registrationStrategy: 'registerWhenStable:30000' })`.
- Install banner pattern: `PwaInstallService` + `PwaInstallBannerComponent` — reuse layout/tokens for update banner.
- **Do not** add `skipWaiting()` in `custom-sw.js` — Angular ngsw waits until `activateUpdate()`.

### V1 reference (do not port audit logging)

- `legacy/src/App.vue` — update banner UX, `SKIP_WAITING` via postMessage (V1 Workbox). V2 uses `SwUpdate.activateUpdate()` instead.
- V1 gated update banner on `isPwaInstalled()` — **Story 10.2 epic AC shows banner for all users** when update is ready (browser tab + installed PWA).

### Explicit non-goals

- Changelog modal / version.txt (**10.3**)
- `scripts/check-pwa.sh` parameterization
- Audit logging for update clicks

## Dev Agent Record

### Agent Model Used

Composer

### Debug Log References

- jsdom cannot spy on `document.location.reload` (non-configurable) — service spec asserts `activateUpdate()` + `refreshing` state instead.

### Completion Notes List

- Added `PwaUpdateService` listening to `SwUpdate.versionUpdates` (`VERSION_READY`) with session dismiss.
- Added `PwaUpdateBannerComponent` at app root (z-index above install banner) with Material buttons, spinner during refresh, French copy.
- Harmonized install + update banners via shared `PwaSystemBannerComponent` (same shell height, padding, icon size, safe-area; install + update title/subtitle).
- Poll `ngsw.json` on navigation when SW enabled; session dismiss until next `VERSION_READY` (AC4).
- Dev recette: `--with-push` serves dist HTTPS + production watch (`serve-dist-https.mjs`); LIMIT-003 Tailscale install guidance.
- Code review fixes: removed debug instrumentation, French update copy, banner stacking, 48dp primary button.
- Vitest: 840/840 pass (`npm run test -w @hatcast/web -- --watch=false`).
- M3 checklist: tokens inverse-surface, mat-flat-button/icon-button/spinner, aria-labels FR — validated.

### File List

- _bmad-output/implementation-artifacts/10-2-detection-de-mise-a-jour-client-action-utilisateur-rechargement-au-clic.md
- _bmad-output/implementation-artifacts/sprint-status.yaml
- apps/web/src/app/core/pwa/pwa-update.service.ts
- apps/web/src/app/core/pwa/pwa-update.service.spec.ts
- apps/web/src/app/shared/pwa/pwa-system-banner/pwa-system-banner.ts
- apps/web/src/app/shared/pwa/pwa-system-banner/pwa-system-banner.html
- apps/web/src/app/shared/pwa/pwa-system-banner/pwa-system-banner.scss
- apps/web/src/app/shared/pwa/pwa-system-banner/pwa-system-banner.spec.ts
- apps/web/src/app/shared/pwa/pwa-update-banner/pwa-update-banner.ts
- apps/web/src/app/shared/pwa/pwa-update-banner/pwa-update-banner.html
- apps/web/src/app/shared/pwa/pwa-update-banner/pwa-update-banner.spec.ts
- apps/web/src/app/shared/pwa/pwa-install-banner/pwa-install-banner.ts
- apps/web/src/app/shared/pwa/pwa-install-banner/pwa-install-banner.html
- apps/web/src/app/shared/pwa/pwa-install-banner/pwa-install-banner.spec.ts
- apps/web/src/app/app.html
- apps/web/src/app/app.ts
- apps/web/src/app/app.scss
- apps/web/src/app/app.spec.ts
- apps/web/src/app/core/pwa/pwa-install-origin.ts
- apps/web/package.json
- apps/web/scripts/serve-dist-https.mjs
- scripts/start-dev.sh
- .cursor/rules/dev-server.mdc
- ISSUES.md

## Change Log

- 2026-06-02: Story 10.2 — PWA update detection banner + user-triggered reload via `SwUpdate` (FR41).
- 2026-06-02: Code review — dismiss AC4, remove debug probes, UI copy, tests 840 green; status done.
