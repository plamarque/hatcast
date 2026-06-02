---
baseline_commit: e5a1efe1
---

# Story 10.3: App version + changelog dialog

Status: done

## Story

As a **HatCast user**,
I want to **see the app version** and **open a readable changelog** (including after a PWA update),
so that I **know what changed** without hunting release notes elsewhere (V1 parity: `AppFooter` + `ChangelogModal`).

## Acceptance Criteria

1. **Given** the app is built with static assets under `apps/web/public/`, **when** the client loads, **then** it can fetch **`/version.txt`** (first line = semver shown to users) and **`/changelog.json`** (pre-generated JSON array, same schema as V1).
2. **Given** a signed-in user on **`/compte`**, **when** the page renders, **then** a visible **« À propos »** block shows the current version (e.g. `v0.0.0`) as a **clickable** control with French tooltip/title (« Voir les nouveautés de la version … »).
3. **Given** the user clicks the version control, **when** the changelog dialog opens, **then** a **MatDialog** titled **« Nouveautés »** lists versions from `changelog.json` (newest first), each with date and emoji-prefixed change lines — loading, error, and empty states in French (parity V1 `ChangelogModal.vue`).
4. **Given** `changelog.json` fails to load or is empty, **when** the dialog is open, **then** show **« Impossible de charger les nouveautés »** or **« Aucune nouveauté récente »** — no silent failure.
5. **Given** the user applied a client update via **Story 10.2** (« Mettre à jour » → reload), **when** the new client loads, **then** the changelog dialog **opens automatically once** for that new version (do not re-open on every navigation or refresh for the same version).
6. **Given** the user already saw the auto-open changelog for version **X**, **when** they reload or revisit later at version **X**, **then** the dialog does **not** auto-open again (persist per version, e.g. `localStorage`).
7. **Given** dev mode (`SwUpdate` disabled), **when** the user opens the version control manually, **then** the dialog still works if `version.txt` / `changelog.json` are served (seed files in `public/`).
8. **Given** implementation complete, **when** tests run, **then** Vitest covers version parsing, changelog transform/sort, dialog open on click, auto-open flag after reload, and « seen » suppression; `npm run test -w @hatcast/web -- --watch=false` succeeds.

**Product coverage:** Epic 10 / Wave V2.0.0 (SCP 2026-06-02) ; complements FR41 (10.2) with post-update transparency ; **not** FR40.

**Out of scope (other stories):** full footer chrome (V1 `AppFooter`), environment badge, GitHub/MIT links (**17.34** « À propos » tab may relocate UI — keep version block easy to move), **`changelog.json` generation in V2 release scripts** (**OPS-6** — seed only in this story).

---

## Acceptance Criteria — Material 3 (UI)

**M3-1. Composants Material** — `MatDialog` with `mat-dialog-title`, `mat-dialog-content`, `mat-dialog-actions` ; `mat-button` / `mat-flat-button` for close ; `mat-progress-spinner` while loading ; version trigger uses `mat-button` or `mat-stroked-button` (not raw `<button>` without Material).

**M3-2. Tokens & thème** — Dialog and account section use `var(--mat-sys-*)` only ; no hex/rgb on feature SCSS.

**M3-3. Mobile & tactile** — Version control and dialog close ≥ 48dp ; scrollable content on small viewports (`max-height` / overflow on `mat-dialog-content`).

**M3-4. Navigation membre** — N/A (account page only; no new global nav).

**M3-5. Revue** — Parcourir checklist FRONTEND_UI.md en fin de story ; noter écarts dans Dev Agent Record.

---

## Tasks / Subtasks

- [x] **Static assets (AC: 1, 7)** — `apps/web/public/`
  - [x] Add `version.txt` (line 1 = semver aligned with `apps/web/package.json` at dev time; comment lines optional like V1).
  - [x] Add `changelog.json` — initial `[]` or minimal seed entry for current version (format below).
  - [x] Confirm `angular.json` already serves `public/**` (no change expected).

- [x] **AppVersionService** (AC: 1, 2)
  - [x] `apps/web/src/app/core/app/app-version.service.ts` — `fetch('/version.txt')`, expose `version` signal (first line, trim) ; fallback `'0.0.0'` on failure ; browser-only.

- [x] **ChangelogService + types** (AC: 3–4)
  - [x] `apps/web/src/app/core/app/changelog.service.ts` — load `/changelog.json`, map `changes: string[]` → `{ id, emoji, description }` (regex `^([^\s]+)\s(.+)$`, default emoji `📝`), sort semver descending (same algorithm as V1).
  - [x] Export types: `ChangelogVersion`, `ChangelogChange`.

- [x] **ChangelogDialogComponent** (AC: 3–4, M3)
  - [x] `apps/web/src/app/shared/changelog/changelog-dialog/` — standalone dialog component ; French copy ; `panelClass` if needed for max height.
  - [x] `ChangelogDialogService` — `open()` via `MatDialog` (pattern: `PwaInstallService` + `PwaInstallInstructionsDialog`).

- [x] **Mon compte — version entry (AC: 2)**
  - [x] `account-placeholder.html` — new section **« À propos »** (before footer logout) with version button.
  - [x] `account-placeholder.ts` — inject services, wire click → `ChangelogDialogService.open()`.

- [x] **Post-update auto-open (AC: 5–6)** — integrates **10.2**
  - [x] In `PwaUpdateService.applyUpdate()` **before** `document.location.reload()`: `sessionStorage.setItem('hatcast.showChangelogAfterReload', '1')`.
  - [x] On app bootstrap (`App.ngOnInit` or dedicated initializer): if flag set → clear flag → after `AppVersionService` resolves → if `localStorage` key `hatcast.changelogSeen:${version}` absent → open dialog → set key.
  - [x] Do **not** auto-open when user only dismissed update banner without applying.

- [x] **Tests (AC: 8)**
  - [x] `app-version.service.spec.ts`, `changelog.service.spec.ts`, `changelog-dialog.spec.ts`
  - [x] `pwa-update.service.spec.ts` — assert sessionStorage flag set before reload path
  - [x] `account-placeholder` spec — version control present, opens dialog (mock `MatDialog`)
  - [x] Full Vitest suite green.

---

## Dev Notes

### `changelog.json` contract (V1 — do not break)

```json
[
  {
    "version": "0.47.1",
    "date": "2026-03-03",
    "changes": ["✨ Description utilisateur", "🐛 Autre changement"]
  }
]
```

Reference: `legacy/public/changelog.json`, loader logic in `legacy/src/components/ChangelogModal.vue`.

### `version.txt` contract

```
0.0.0
Production build - 2026-06-02
Git: abc1234
Build: 2026-06-02T12:00:00+0200
```

V2 release script already writes this path: `scripts/v2/release-production.sh` → `apps/web/public/version.txt` via `write_version_txt()`. **OPS-6** will add `changelog.json` to the same pipeline — until then, maintain seed manually on bumps.

### Scope boundaries

| In scope (10.3) | Out of scope |
|-----------------|--------------|
| Version + changelog on `/compte` | Global footer, contact, GitHub links |
| MatDialog changelog | `generate-changelog.js` / OPS-6 automation |
| Auto-open once after 10.2 reload | Help modal, audit logging |
| Seed `public/version.txt` + `changelog.json` | Playwright E2E |
| Vitest unit tests | Environment badge (DEV/STG) |

### Foundation from Story 10.2 (must preserve)

- `PwaUpdateService.applyUpdate()` → `activateUpdate()` then `document.location.reload()` — **only** add sessionStorage flag; do not change reload semantics.
- Update banner dismiss (AC4) unchanged.
- Recette: `./scripts/start-dev.sh --with-push` serves `dist/` with SW — use for manual auto-open test after rebuild.

### V1 reference (port UX, not Vue/CSS)

| V1 file | Reuse |
|---------|--------|
| `legacy/src/components/ChangelogModal.vue` | Fetch, transform, sort, French states |
| `legacy/src/components/AppFooter.vue` | Version click → modal ; **V2: Mon compte only** per SCP |

### UI placement vs Story 17.34

SCP **17.34** will tab Mon compte (Identité · Sécurité · … · **À propos**). Implement 10.3 as a **dedicated section** with stable `data-testid="account-app-version"` so 17.34 can move the block without rewriting changelog logic.

### Dialog implementation guardrails

| Concern | Action |
|--------|--------|
| Material | Copy structure from `pwa-install-instructions-dialog` (title, content, actions) |
| Tokens | `--mat-sys-surface`, `--mat-sys-on-surface`, outline variants |
| Dialog size | `maxWidth: '42rem'`, `maxHeight: '85vh'` (V1 was ~85vh) |
| a11y | `mat-dialog-title` = « Nouveautés » ; focus trap default MatDialog |

### Storage keys (convention)

| Key | Storage | Purpose |
|-----|---------|---------|
| `hatcast.showChangelogAfterReload` | `sessionStorage` | Set by 10.2 apply, consumed once on next load |
| `hatcast.changelogSeen:${version}` | `localStorage` | Suppress repeat auto-open for version |

### Explicit non-goals

- Wiring V2 `release-production.sh` to emit `changelog.json` (**OPS-6**)
- Copying entire legacy `changelog.json` history into repo (seed minimal)
- SSR: version fetch is browser-only (`isPlatformBrowser`)

### Dependencies

| Story | Status | Relationship |
|-------|--------|----------------|
| 10.2 | done | Reload trigger ; set `showChangelogAfterReload` in `applyUpdate()` |
| 10.4 | backlog | Will verify `version.txt` in PWA recette |
| OPS-6 | backlog | Pipeline sync for `changelog.json` |
| 17.34 | backlog | May relocate « À propos » UI — keep service/dialog stable |

### Project structure (new files)

```
apps/web/public/version.txt
apps/web/public/changelog.json
apps/web/src/app/core/app/app-version.service.ts
apps/web/src/app/core/app/app-version.service.spec.ts
apps/web/src/app/core/app/changelog.service.ts
apps/web/src/app/core/app/changelog.service.spec.ts
apps/web/src/app/shared/changelog/changelog-dialog/changelog-dialog.ts
apps/web/src/app/shared/changelog/changelog-dialog/changelog-dialog.html
apps/web/src/app/shared/changelog/changelog-dialog/changelog-dialog.scss
apps/web/src/app/shared/changelog/changelog-dialog/changelog-dialog.spec.ts
apps/web/src/app/shared/changelog/changelog-dialog.service.ts
```

**UPDATE:** `account-placeholder.*`, `app.ts`, `pwa-update.service.ts`, `pwa-update.service.spec.ts`

### Testing commands

```bash
npm run test -w @hatcast/web -- --watch=false
# Manual: ./scripts/start-dev.sh --with-push → apply update → changelog auto-opens once
```

### Architecture compliance

- Static assets via `apps/web/public/` → served at `/` (ARCH: Angular PWA client).
- No API endpoint for version/changelog in this story.
- French UI strings (NFR-A1 / project-context).

### Previous story intelligence (10.2)

- Shared PWA patterns under `core/pwa/` and `shared/pwa/` — changelog is **`core/app`** + **`shared/changelog`** (not PWA install).
- jsdom: cannot spy `document.location.reload` — test sessionStorage flag instead.
- 840 Vitest tests baseline after 10.2 — keep suite green.

### Git intelligence

Recent commit `feat(web): Add PWA update banner on user action` — extend `PwaUpdateService` / `App` in same style (signals, inject, French copy, Vitest).

### Latest tech notes

- Angular Material **21.2** `MatDialog` — standalone `imports: [MatDialogModule, …]`.
- Fetch static JSON with `cache: 'no-store'` optional for recette (changelog updates without SW bump).
- `HttpClient` not required — `fetch` matches V1 and keeps tests simple.

### Project context reference

- [project-context.md](../../project-context.md) — M3, tests, `npm run test -w @hatcast/web`
- [docs/v2/technical/FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md) — checklist M3
- [PLAN.md](../../PLAN.md) § Wave V2.0.0 — **10.3** P0
- SCP: `_bmad-output/planning-artifacts/sprint-change-proposal-2026-06-02-v2.0.0-cutover-scope.md` § Wave A

---

## Dev Agent Record

### Agent Model Used

Composer (dev-story 10.3)

### Completion Notes List

- Static assets: `apps/web/public/version.txt` (0.0.0) + `changelog.json` (seed 0.0.0).
- `AppVersionService` + `ChangelogService` (V1 transform/sort parity); `changelog-keys.ts` for storage conventions.
- `ChangelogDialog` (MatDialog, French loading/error/empty states, `--mat-sys-*` tokens, scrollable content).
- `/compte` section « À propos » with `data-testid="account-app-version"` and tooltip.
- Post-update: `PwaUpdateService` sets `hatcast.showChangelogAfterReload`; `App.ngOnInit` → `maybeAutoOpenAfterPwaUpdate()` with `hatcast.changelogSeen:${version}`.
- Vitest: **859** tests green (`npm run test -w @hatcast/web -- --watch=false`).

**M3 checklist (FRONTEND_UI.md):** M3-1 MatDialog/buttons/spinner OK ; M3-2 tokens only ; M3-3 version button + Fermer ≥ 48dp, dialog scroll ; M3-4 N/A ; M3-5 self-check done, no waivers.

### File List

- apps/web/public/version.txt
- apps/web/public/changelog.json
- apps/web/src/app/core/app/changelog-keys.ts
- apps/web/src/app/core/app/app-version.service.ts
- apps/web/src/app/core/app/app-version.service.spec.ts
- apps/web/src/app/core/app/changelog.service.ts
- apps/web/src/app/core/app/changelog.service.spec.ts
- apps/web/src/app/shared/changelog/changelog-dialog.service.ts
- apps/web/src/app/shared/changelog/changelog-dialog.service.spec.ts
- apps/web/src/app/shared/changelog/changelog-dialog/changelog-dialog.ts
- apps/web/src/app/shared/changelog/changelog-dialog/changelog-dialog.html
- apps/web/src/app/shared/changelog/changelog-dialog/changelog-dialog.scss
- apps/web/src/app/shared/changelog/changelog-dialog/changelog-dialog.spec.ts
- apps/web/src/app/pages/account-placeholder/account-placeholder.ts
- apps/web/src/app/pages/account-placeholder/account-placeholder.html
- apps/web/src/app/pages/account-placeholder/account-placeholder.scss
- apps/web/src/app/pages/account-placeholder/account-placeholder.spec.ts
- apps/web/src/app/core/pwa/pwa-update.service.ts
- apps/web/src/app/core/pwa/pwa-update.service.spec.ts
- apps/web/src/app/app.ts
- _bmad-output/implementation-artifacts/sprint-status.yaml

### Change Log

- 2026-06-02: Story 10.3 created (ready-for-dev) — version display, changelog MatDialog, post-update auto-open.
- 2026-06-02: Story 10.3 implemented — version + changelog on Mon compte, auto-open after PWA reload, Vitest coverage.
- 2026-06-02: Code review — `changelogSeen` on `afterClosed()`, skip auto-open if version fallback, M3 close button 48dp.

---

### Validation create-story

- [x] AC métier numérotés et sourcés (SCP Wave A, V1 parity, 10.2)
- [x] Section **Material 3** remplie
- [x] Tasks référencent les AC
- [x] Liens vers fichiers code existants (10.2, V1, account-placeholder)
- [x] `npm run test` mentionné

### Review Findings

- [x] [Review][Decision] Quand marquer `changelogSeen` — **B** : `afterClosed()` avant écriture `localStorage` (auto-open uniquement).
- [x] [Review][Patch] Auto-open avec version fallback `0.0.0` — pas d’ouverture ni de consommation du flag session si `DEFAULT_APP_VERSION`.
- [x] [Review][Patch] Cible tactile « Fermer » M3-3 — classe `changelog-dialog__close` (`min-height` / `min-width` 3rem).
- [x] [Review][Defer] Tri semver avec suffixe `SNAPSHOT` — Même limite que V1 ; acceptable tant que OPS-6 / releases utilisent des versions numériques propres.
