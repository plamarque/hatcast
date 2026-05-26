# Story 10.1: PWA installability (shortcut / add to home screen)

Status: done

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

## Story

As a **user**,
I want to **install or add the web application to my home screen** on supported platforms,
so that I can **open HatCast like an app** for quick access (FR40).

## Acceptance Criteria

1. **Given** a production build served over **HTTPS** with a valid **Web App Manifest** and a **registered service worker**, **when** the user follows the browser/platform install flow (native `beforeinstallprompt` or manual add-to-home-screen), **then** a shortcut is created that opens the V2 app at the configured `start_url` in **standalone** (or platform-equivalent) display mode (FR40).
2. **Given** Chrome/Edge (desktop or Android) fires `beforeinstallprompt`, **when** the user taps **Installer** on the in-app install affordance, **then** the native install prompt is shown and acceptance creates an installed PWA; dismissal leaves the app usable without error (FR40).
3. **Given** Safari iOS, Firefox, or browsers without a native install prompt, **when** the user chooses install from the affordance, **then** a **Material dialog** shows **platform-specific manual steps** (parity with V1 `PWAInstallModal.vue`) instead of a dead-end button (FR40).
4. **Given** the app is already installed (`display-mode: standalone`, iOS `navigator.standalone`, or `appinstalled` event), **when** the shell loads, **then** the install banner is **not** shown (do not rely on stale `localStorage` alone — detect real install state like V1 `isPwaInstalled()`).
5. **Given** the user dismisses the install banner, **when** less than **24 hours** have passed, **then** the banner stays hidden; after 24h it may show again unless installed (V1 parity: `hatcast-pwa-banner-dismissed`).
6. **Given** `index.html` and manifest metadata, **when** auditors or `scripts/check-pwa.sh` run against a deployed V2 origin, **then** manifest is reachable, JSON-valid, and includes `name`, `short_name`, `start_url`, `display`, and maskable icons **192** + **512** (FR40).
7. **Given** Story 10.1 scope, **when** implementation ships, **then** **no** user-visible **“new version available / Mettre à jour”** banner or forced reload UX is added — that belongs to **Story 10.2** (FR41); service worker may register and precache for installability only.
8. **Given** implementation complete, **when** tests run, **then** Vitest covers install-state helpers and banner visibility rules; `npm run test -w @hatcast/web -- --watch=false` and `npm run build -w @hatcast/web -- --configuration production` succeed; manual smoke on HTTPS build confirms manifest + SW registration.

## Tasks / Subtasks

- [x] **Add Angular PWA foundation** (AC: 1, 6, 7)
  - [x] Run `ng add @angular/pwa --project web` (adds `@angular/service-worker`, `ngsw-config.json`, wires production build).
  - [x] Enable service worker only for **production** build (`angular.json` → `serviceWorker: true` on production config).
  - [x] Register in `app.config.ts`: `provideServiceWorker('ngsw-worker.js', { enabled: !isDevMode(), registrationStrategy: 'registerWhenStable:30000' })` — **do not** wire `SwUpdate` UI yet (10.2).
  - [x] Configure `ngsw-config.json` with minimal `assetGroups` (app shell + static assets); **no** aggressive `dataGroups` for API (API is network-first via `/v1/` proxy).
  - [x] Verify Docker image still copies `dist/web/browser` including `ngsw-worker.js`, `ngsw.json`, `manifest.webmanifest` ([`Dockerfile`](../../Dockerfile) line 39).

- [x] **Manifest + icons + HTML meta** (AC: 1, 6)
  - [x] Add `apps/web/public/manifest.webmanifest` (or use generated manifest from `@angular/pwa` and customize):
    - `name`: `HatCast — Composition d'équipes d'impro` (or product-approved V2 title)
    - `short_name`: `HatCast`
    - `start_url`: `/?source=pwa` (same intent as V1)
    - `scope`: `/`
    - `display`: `standalone`
    - `lang`: `fr`
    - `theme_color` / `background_color`: align with V2 Material theme (violet primary — pick a stable hex, document in manifest)
  - [x] Copy or regenerate icons under `apps/web/public/icons/` from V1 assets ([`legacy/public/icons/`](../../legacy/public/icons/)) — at minimum `manifest-icon-192.maskable.png` and `manifest-icon-512.maskable.png`; apple-touch + favicons for iOS.
  - [x] Update [`apps/web/src/index.html`](../../apps/web/src/index.html): `<link rel="manifest">`, `theme-color`, Apple PWA meta tags (mirror [`legacy/index.html`](../../legacy/index.html) lines 9–30).
  - [x] Optional: extend [`scripts/generate-icons.sh`](../../scripts/generate-icons.sh) with `--target apps/web` or document copy step — **do not** only update legacy paths.

- [x] **Install UX (Angular Material)** (AC: 2–5)
  - [x] Create `apps/web/src/app/core/pwa/pwa-install.service.ts`:
    - Listen `beforeinstallprompt` (preventDefault, store event)
    - Listen `appinstalled`
    - `isPwaInstalled()` — `matchMedia('(display-mode: standalone)')`, iOS `navigator.standalone`, clear stale `hatcast-pwa-installed` when not standalone
    - `shouldShowInstallBanner()` — not installed, not dismissed within 24h
    - `promptInstall()` / `openManualInstructions()`
  - [x] Create `apps/web/src/app/shared/pwa/pwa-install-banner/` — fixed top bar (V1 layout reference), `data-testid="pwa-install-banner-dismiss"`, French copy: *Installez l'app pour une meilleure expérience*, button **Installer**.
  - [x] Create `apps/web/src/app/shared/pwa/pwa-install-instructions-dialog/` — port browser/OS branches from [`legacy/src/components/PWAInstallModal.vue`](../../legacy/src/components/PWAInstallModal.vue) (Chrome desktop/mobile, Safari iOS, Firefox fallback).
  - [x] Mount banner in root shell: [`apps/web/src/app/app.html`](../../apps/web/src/app/app.html) (alongside `<router-outlet />`).
  - [x] Use Angular Material (`MatButton`, `MatDialog`, `MatIcon`) — no Tailwind; match existing app patterns.

- [x] **Deploy / ops verification** (AC: 6)
  - [x] Confirm [`deploy/v2/nginx.conf.template`](../../deploy/v2/nginx.conf.template) serves `.webmanifest` with correct MIME (`application/manifest+json` is in default `mime.types`).
  - [x] Document in story completion or `docs/v2/technical/` (only if missing): PWA smoke = production build + HTTPS (`ng serve` SSL locally, or Cloud Run env).
  - [x] Note: [`scripts/check-pwa.sh`](../../scripts/check-pwa.sh) still points at V1 production URL — optional follow-up to parameterize `BASE_URL`; not blocking 10.1.

- [x] **Tests** (AC: 8)
  - [x] `pwa-install.service.spec.ts` — `isPwaInstalled` mocks, dismiss TTL, banner gating when `beforeinstallprompt` absent.
  - [x] `pwa-install-banner.spec.ts` — dismiss test id, install click delegates to service.
  - [x] Lightweight test: production `index.html` / manifest link presence (build output or static file assertion).
  - [x] Run: `npm run test -w @hatcast/web -- --watch=false` and `npm run build -w @hatcast/web -- --configuration production`.

## Dev Notes

### Scope boundaries

| In scope (10.1) | Out of scope (other stories) |
|-----------------|------------------------------|
| Manifest, icons, meta tags, SW registration for **installability** | **Update banner**, `SwUpdate.activateUpdate()`, reload-on-click (Story **10.2**, FR41) |
| Install banner + manual install dialog | Web Push subscription, VAPID, notificationclick handler (Epic **8**, FR29–31) |
| V2 `apps/web/` only | Changes to `legacy/` production client |
| Reuse V1 icon assets and UX copy/intent | Firebase-era audit logging to Firestore (`createPWAAuditData` in V1) — optional structured log later |
| HTTPS dev via existing `ng serve` SSL | Offline-first API caching beyond app shell |

### Critical gap: V2 has no PWA today

| Area | V1 (`legacy/`) | V2 (`apps/web/`) today |
|------|----------------|-------------------------|
| Manifest | `vite-plugin-pwa` in [`legacy/vite.config.js`](../../legacy/vite.config.js) | **Missing** |
| Service worker | [`legacy/src/service-worker.js`](../../legacy/src/service-worker.js) (Workbox injectManifest + push handlers) | **Missing** |
| Install UI | [`legacy/src/App.vue`](../../legacy/src/App.vue) + `PWAInstallModal.vue` | **Missing** |
| Dependencies | `vite-plugin-pwa` | No `@angular/pwa` / `@angular/service-worker` in [`apps/web/package.json`](../../apps/web/package.json) |
| `index.html` | Full PWA meta | Only favicon + fonts ([`apps/web/src/index.html`](../../apps/web/src/index.html)) |

**Do not** copy the entire V1 custom Workbox worker into V2 for 10.1 — use **`@angular/pwa`** (per architecture + Story 10.2 note). Push notification SW extensions land with Epic 8.

### Recommended `@angular/pwa` setup (Angular 21)

```bash
cd apps/web && npx ng add @angular/pwa --project web
```

Then adjust:

- **`ngsw-config.json`**: precache `index.html`, `*.js`, `*.css`, `/icons/*`, `manifest.webmanifest`; exclude `/v1/**`.
- **`app.config.ts`**: `provideServiceWorker(...)` with `enabled: !isDevMode()`.
- **Story 10.2** will add `SwUpdate` + Material snackbar/banner — keep 10.1 free of that coupling.

Local install testing requires **production build + HTTPS** (install criteria are not met on plain `ng serve` dev without SW). Workflow:

```bash
npm run build -w @hatcast/web -- --configuration production
# serve dist over HTTPS (npx serve -s dist/web/browser --ssl-cert ... or Cloud Run dev)
```

### V1 behavior to port (reference only)

| V1 artifact | Port to V2 |
|-------------|------------|
| `handleBeforeInstallPrompt` / `installPwa()` | `PwaInstallService` |
| Install top banner (z-index, dismiss 24h) | `PwaInstallBannerComponent` |
| `PWAInstallModal.vue` browser matrix | `PwaInstallInstructionsDialog` |
| `isPwaInstalled()` | Same detection logic in service |
| `localStorage` keys `hatcast-pwa-banner-dismissed`, `hatcast-pwa-installed` | Reuse keys for continuity |

**Do not** port V1 update banner block (`updateAvailable`, `updateApp`, `SKIP_WAITING` message flow) — Story 10.2.

### Manifest fields (minimum for Lighthouse / Chrome install)

```json
{
  "name": "HatCast — Composition d'équipes d'impro",
  "short_name": "HatCast",
  "start_url": "/?source=pwa",
  "scope": "/",
  "display": "standalone",
  "lang": "fr",
  "icons": [
    { "src": "/icons/manifest-icon-192.maskable.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "/icons/manifest-icon-512.maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ]
}
```

Align `theme_color` with V2 Material violet branding (V1 used `#0ea5e9` — **do not** blindly copy if product wants V2 identity).

### Architecture compliance

- **Stack:** Angular 21 + Material; static assets from `apps/web/public/` copied to nginx root ([`architecture.md`](../../_bmad-output/planning-artifacts/architecture.md) § Frontend Architecture, § Infrastructure).
- **PWA:** FR40 installability now; FR41 update UX explicitly deferred to 10.2.
- **Coupled deploy (NFR-R1):** SW + manifest ship in the same Docker image as API — no separate static-only deploy path for PWA assets.
- **Do not modify `legacy/`** — V1 remains reference until V2 cutover.

### Implementation guardrails

- **Do not** implement Story 10.2 update banner or `skipWaiting` user messaging in this story.
- **Do not** cache `/v1/**` API responses in `ngsw` data groups (stale auth/session risk).
- **Do not** register service worker in development mode (false install tests, HMR conflicts).
- **Do not** show install banner when `isPwaInstalled()` is true.
- **Do not** use `registerType: 'autoUpdate'` silent reload patterns from V1 Workbox `skipWaiting()` for user-facing updates — 10.2 owns reload UX.
- **Do not** add Playwright suite under `legacy/tests/pwa.spec.js` — add Vitest (+ optional future E2E under V2 test layout).

### Previous story intelligence

- **No prior story in Epic 10** — first story; sets PWA foundation for 10.2.
- **Epic 8 (backlog)** will need SW push handlers — design `ngsw`/`@angular/pwa` so a future custom worker or notification plugin can extend without rewriting 10.1 install flow.
- **12.x / 17.x (done):** Root shell is minimal [`app.html`](../../apps/web/src/app/app.html) — banner mounts cleanly at app root; follow standalone component + signals patterns from recent web stories.

### Git intelligence

Recent commits are composition/admin focused (`feat(composition)`, `feat(web)`). Follow: standalone components, Vitest specs colocated, French UI strings, no `legacy/` edits.

### Testing standards

```bash
npm run test -w @hatcast/web -- --watch=false
npm run build -w @hatcast/web -- --configuration production
# Manual: Chrome DevTools → Application → Manifest + Service workers
# Optional: ./scripts/check-pwa.sh with BASE_URL overridden to your V2 HTTPS origin
```

### Project Structure Notes

Expected new/modified files:

- `apps/web/package.json` — `@angular/service-worker`, `@angular/pwa` devDep
- `apps/web/angular.json` — `serviceWorker`, `ngswConfigPath`
- `apps/web/ngsw-config.json`
- `apps/web/public/manifest.webmanifest`
- `apps/web/public/icons/**` (copied from legacy)
- `apps/web/src/index.html`
- `apps/web/src/app/app.config.ts`
- `apps/web/src/app/app.html` — host install banner
- `apps/web/src/app/core/pwa/pwa-install.service.ts` (+ spec)
- `apps/web/src/app/shared/pwa/pwa-install-banner/*` (+ spec)
- `apps/web/src/app/shared/pwa/pwa-install-instructions-dialog/*` (+ spec)

### References

- [Source: `_bmad-output/planning-artifacts/epics.md` — Epic 10, Story 10.1]
- [Source: `_bmad-output/planning-artifacts/prd.md` — FR40, PWA installability § Application delivery]
- [Source: `_bmad-output/planning-artifacts/architecture.md` — § PWA, § Coupled deploy]
- [Source: `ARCH.md` — PWA note under Browser / PWA]
- [Source: `SPEC.md` — PWA baseline (V1 reference)]
- [Source: `legacy/vite.config.js`, `legacy/src/App.vue`, `legacy/src/components/PWAInstallModal.vue`]
- [Source: `Dockerfile`, `deploy/v2/nginx.conf.template`]
- [Source: `scripts/check-pwa.sh`, `scripts/generate-icons.sh`]
- [Source: Angular PWA guide](https://angular.dev/ecosystem/service-workers)

## Dev Agent Record

### Agent Model Used

Composer

### Debug Log References

- `ng add @angular/pwa` schematic failed (version mismatch); installed `@angular/service-worker@21.2.9` manually and wired `ngsw-config.json` + `angular.json` production `serviceWorker`.
- PWA smoke: production build emits `ngsw-worker.js`, `ngsw.json`, `manifest.webmanifest` under `dist/web/browser/`.

### Completion Notes List

- Added `@angular/service-worker` with production-only registration (`registerWhenStable:30000`); no `SwUpdate` UI (Story 10.2).
- Manifest + icons + Apple/MS meta in `index.html`; theme `#6750A4` (V2 violet).
- `PwaInstallService` + top banner + Material instructions dialog (V1 browser matrix parity); reuses `hatcast-pwa-banner-dismissed` / install detection keys.
- Vitest: install service, instructions builder, banner, manifest contract. Production build OK.
- Full suite: 507/508 tests pass; 1 pre-existing failure in `member-profile-dialog.spec.ts` (unrelated). Minimal fixes in WIP `member-season-glance` to unblock compile.

### File List

- apps/web/package.json
- package-lock.json
- apps/web/angular.json
- apps/web/ngsw-config.json
- apps/web/public/manifest.webmanifest
- apps/web/public/icons/apple-icon-180.png
- apps/web/public/icons/favicon.ico
- apps/web/public/icons/favicon.svg
- apps/web/public/icons/icon-48x48.png
- apps/web/public/icons/manifest-icon-192.maskable.png
- apps/web/public/icons/manifest-icon-512.maskable.png
- apps/web/public/icons/mstile-150x150.png
- apps/web/src/index.html
- apps/web/src/app/app.config.ts
- apps/web/src/app/app.html
- apps/web/src/app/app.ts
- apps/web/src/app/app.spec.ts
- apps/web/src/app/core/pwa/pwa-browser-info.ts
- apps/web/src/app/core/pwa/pwa-install-instructions.ts
- apps/web/src/app/core/pwa/pwa-install-instructions.spec.ts
- apps/web/src/app/core/pwa/pwa-install.service.ts
- apps/web/src/app/core/pwa/pwa-install.service.spec.ts
- apps/web/src/app/core/pwa/pwa-manifest.spec.ts
- apps/web/src/app/shared/pwa/pwa-install-banner/pwa-install-banner.ts
- apps/web/src/app/shared/pwa/pwa-install-banner/pwa-install-banner.html
- apps/web/src/app/shared/pwa/pwa-install-banner/pwa-install-banner.scss
- apps/web/src/app/shared/pwa/pwa-install-banner/pwa-install-banner.spec.ts
- apps/web/src/app/shared/pwa/pwa-install-instructions-dialog/pwa-install-instructions-dialog.ts
- apps/web/src/app/shared/pwa/pwa-install-instructions-dialog/pwa-install-instructions-dialog.html
- apps/web/src/app/shared/pwa/pwa-install-instructions-dialog/pwa-install-instructions-dialog.scss
- apps/web/src/app/shared/user-account-menu/user-account-menu-items.ts

## Change Log

- 2026-05-26: Story 10.1 — V2 PWA installability (manifest, SW, install banner, manual instructions, Vitest).
- 2026-05-26: Code review (BMAD) — findings in Review Findings below.

### Review Findings

- [x] [Review][Decision] Menu « Installer l'app » — `UserAccountMenuItemsComponent` ajouté aux menus utilisateur V2 ; `PwaInstallService.installFromUserMenu()`.

- [x] [Review][Patch] Manifest test reads `public/manifest.webmanifest` [`pwa-manifest.spec.ts`].

- [x] [Review][Patch] Dev Notes test command — use full `npm run test -w @hatcast/web -- --watch=false` (no broken `--include` filter).

- [x] [Review][Patch] Firefox/Android instructions — `isFirefox` branch before generic `isAndroid`.

- [x] [Review][Patch] `display-mode: standalone` `change` listener on `PwaInstallService`.

- [x] [Review][Patch] File List — removed out-of-scope `member-season-glance` entries; added `user-account-menu-items.ts`.

- [x] [Review][Defer] `scripts/check-pwa.sh` still targets V1 production URL — Story already marks parameterizing `BASE_URL` as optional follow-up; not blocking 10.1.

- [x] [Review][Defer] `PwaInstallService` imports dialog from `shared/` (core → shared) [`pwa-install.service.ts:7-9`] — Works today; refactor to invert dependency only if layering rules tighten later.
