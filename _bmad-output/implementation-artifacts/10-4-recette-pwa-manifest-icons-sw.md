---
baseline_commit: ac162ef6
---

# Story 10.4: PWA manifest, icons, service worker — staging recette

Status: done

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

## Story

As a **release owner preparing V2.0.0 cutover**,
I want a **signed-off PWA recette** on the V2 HTTPS origin (manifest, HatCast 2 icons, Angular service worker, `version.txt`),
so that **FR40 installability** and **FR41 update behaviour** are proven end-to-end on staging before **10.5** / **10.6** and prod tag **v2.0.0**.

## Acceptance Criteria

1. **Given** Stories **10.1**, **10.2**, **10.3**, and **10.7** are **done**, **when** this story starts, **then** implementation work is **verification and tooling only** — no new product features, no icon redesign, no install-aids UX (**10.5**) or notification opt-in (**10.6**).
2. **Given** `npm run build -w @hatcast/web -- --configuration production`, **when** the build completes, **then** `dist/web/browser/` contains at minimum: `manifest.webmanifest`, `custom-sw.js`, `ngsw.json`, `ngsw-worker.js`, `/version.txt`, `/changelog.json`, and every file listed in [`pwa-icons.spec.ts`](../../apps/web/src/app/core/pwa/pwa-icons.spec.ts) under `icons/` (FR40 asset contract from **10.7**).
3. **Given** the on-disk manifest at [`apps/web/public/manifest.webmanifest`](../../apps/web/public/manifest.webmanifest), **when** compared to deployed staging, **then** `name`, `short_name`, `start_url` (`/?source=pwa`), `display` (`standalone`), `theme_color` (`#6750A4`), `background_color` (`#FFFBFE`), and **split** `any` + `maskable` icons for **192** and **512** match repo (parity **10.7** AC5).
4. **Given** [`apps/web/ngsw-config.json`](../../apps/web/ngsw-config.json), **when** reviewed, **then** `/icons/**` is in the **assets** group with `updateMode: prefetch`, app shell files are prefetched, and `navigationUrls` still excludes `!/v1/**` (no API caching regression from **10.1**).
5. **Given** [`scripts/check-pwa.sh`](../../scripts/check-pwa.sh), **when** updated in this story, **then** it accepts **`BASE_URL`** (env var or first CLI arg) defaulting to a **documented V2 staging HTTPS origin** (not hard-coded V1 `selections.la-malice.fr`); manifest + maskable icon HTTP checks use that base; script exit code **non-zero** if any **ERROR** check fails.
6. **Given** V2 staging is deployed from `staging-v2` (see [`docs/v2/technical/DEPLOYMENT_WORKFLOW.md`](../../docs/v2/technical/DEPLOYMENT_WORKFLOW.md)), **when** `./scripts/check-pwa.sh` runs with staging `BASE_URL`, **then** HTTPS, manifest JSON, required icon paths, and service worker URL (`/custom-sw.js` or generated worker) pass; results are recorded in **Dev Agent Record** (date + URL).
7. **Given** manual recette on staging over **HTTPS** (production SW enabled), **when** Chrome DevTools → **Application** is used, **then** **Manifest** shows HatCast 2 icons, **Service workers** show `custom-sw.js` + ngsw active, and **Icons** safe-area preview shows no critical clipping (deferred **10.7** AC4) — optional upload to [maskable.app](https://maskable.app) for 512 maskable; waivers noted in Dev Agent Record.
8. **Given** a controlled deploy or `./scripts/start-dev.sh --with-push` recette build, **when** a second client version is simulated (rebuild + refresh `ngsw.json`), **then** update banner (**10.2**) appears, **« Mettre à jour »** reloads, and post-reload changelog auto-open (**10.3**) fires **once** per version; `/version.txt` is fetchable with `cache: 'no-store'` (same as `AppVersionService`).
9. **Given** HatCast 2 icons on disk (**10.7**), **when** comparing home-screen thumbnail on a test device (Android Chrome and/or iOS Add to Home Screen), **then** icon is **visually distinct** from V1 blue PWA on the same device — screenshot or PO sign-off in Dev Agent Record.
10. **Given** implementation complete, **when** tests run, **then** `npm run test -w @hatcast/web -- --watch=false` is green (including `pwa-manifest.spec.ts`, `pwa-icons.spec.ts`, `pwa-update.service.spec.ts`, `app-version.service.spec.ts`); optional new Vitest only if it asserts **post-build** artifacts without flaking CI (prefer documenting dist checklist in Dev Notes if CI has no production build step).

**Product coverage:** Epic 10 / Wave V2.0.0 (SCP [2026-06-02](_bmad-output/planning-artifacts/sprint-change-proposal-2026-06-02-v2.0.0-cutover-scope.md)) ; **FR40**, **FR41** (recette gate) ; feeds success criterion « PWA : install, update, changelog, new icon on device ».

**Explicitly out of scope:** redesigning icons (**10.7** done) ; install instruction modal parity (**10.5**) ; notification opt-in prompt (**10.6**) ; `changelog.json` release pipeline (**OPS-6**) ; porting `legacy/public/pwa-debug.html` to V2 (WARN-only in script is OK) ; Playwright E2E suite (optional follow-up).

---

## Acceptance Criteria — Material 3 (UI)

**UI : N/A** — no new Angular UI in this story. Manual recette **validates** existing M3 surfaces from **10.2** (`pwa-update-banner` / `pwa-system-banner`) and **10.3** (`changelog-dialog`) without changing them.

---

## Tasks / Subtasks

- [x] **Scope lock (AC: 1)** — Confirm no duplicate icon/manifest work; treat **10.7** output as baseline.

- [x] **Local production bundle audit (AC: 2)**
  - [x] `npm run build -w @hatcast/web -- --configuration production`
  - [x] Checklist `dist/web/browser/`: manifest, SW files, `version.txt`, `changelog.json`, `icons/*` per `pwa-icons.spec.ts`
  - [x] Record paths + file sizes in Dev Agent Record

- [x] **Static contract review (AC: 3–4)**
  - [x] Read `manifest.webmanifest`, `index.html` icon links, `ngsw-config.json` — no drift vs **10.7** Dev Agent Record
  - [x] Confirm `provideServiceWorker('custom-sw.js', { enabled: !isDevMode() })` in [`app.config.ts`](../../apps/web/src/app/app.config.ts)

- [x] **`check-pwa.sh` V2 parameterization (AC: 5)**
  - [x] `BASE_URL="${BASE_URL:-${1:-}}"` — required HTTPS origin (no V1 default)
  - [x] Extend icon checks for `icon-192.png`, `icon-512.png`, `favicon.svg`, `apple-icon-180.png` if not already covered
  - [x] SW check: prefer `/custom-sw.js` for V2 (Angular **10.1**+)
  - [x] Update [`scripts/README.md`](../../scripts/README.md) usage section
  - [x] Exit 1 on any ERROR result

- [x] **Staging automated smoke (AC: 6)**
  - [x] Deploy or use current `hatcast-v2-staging` URL from PO/Ops
  - [x] `BASE_URL=https://… ./scripts/check-pwa.sh`
  - [x] Archive command output in Dev Agent Record

- [x] **Manual recette matrix (AC: 7–9)** — complete table in Dev Agent Record:

  | Check | Tool / platform | Pass? |
  |-------|-----------------|-------|
  | Manifest + icons resolve | Chrome DevTools → Application | Pass |
  | Maskable safe zone | DevTools Icons preview + optional maskable.app | Waiver |
  | SW active, no stale `/v1` cache group | DevTools → Service workers | Pass |
  | Install / A2HS (if criteria met) | Android Chrome or iOS Safari | Pass |
  | Update banner + reload | `--with-push` or staging second deploy | Pass |
  | Changelog auto-open once | After update reload (**10.3**) | Pass |
  | `version.txt` visible on `/compte` | Manual | Pass |
  | HatCast 2 vs V1 icon distinct | Side-by-side home screen | Pass |

- [x] **Tests (AC: 10)**
  - [x] `npm run test -w @hatcast/web -- --watch=false`
  - [x] Only add `pwa-dist-recette.spec.ts` if CI already runs production build; otherwise document manual dist checklist

- [x] **Sign-off (AC: 6–9)**
  - [x] PO or release owner checkbox in Dev Agent Record: « PWA recette staging OK for V2.0.0 wave »
  - [x] Note known limits: SW/OS icon cache until **10.2** update (from **10.7** deferred work)

---

## Dev Notes

### Scope boundaries

| In scope (10.4) | Out of scope |
|-----------------|--------------|
| Recette + sign-off of PWA stack delivered in **10.1–10.3**, **10.7** | New icons, manifest fields, SW logic |
| Parameterize `check-pwa.sh` for V2 `BASE_URL` | **10.5** install aids, **10.6** notif prompt |
| Manual QA deferred from **10.7** (maskable, devices) | **OPS-6** version/changelog pipeline |
| Dist/production bundle verification | Member header logo (separate brand story) |
| Staging smoke + Dev Agent Record evidence | Modifying `legacy/` PWA |

### Why this story exists (not duplicate of 10.7)

| Story | Role |
|-------|------|
| **10.7** | **Deliver** HatCast 2 assets + Vitest on-disk contracts |
| **10.4** | **Prove** they work on HTTPS staging with real SW, update flow, and human sign-off |

SCP order was **10.4 → 10.2 + 10.3 + 10.7**; implementation landed features first — **10.4 closes the gate** before **10.5** / parallel **6.15**.

### Files to read (do not reinvent)

| File | Purpose |
|------|---------|
| [`apps/web/public/manifest.webmanifest`](../../apps/web/public/manifest.webmanifest) | Installability contract |
| [`apps/web/src/index.html`](../../apps/web/src/index.html) | `manifest`, favicon, apple-touch-icon, tile |
| [`apps/web/ngsw-config.json`](../../apps/web/ngsw-config.json) | Precache groups |
| [`apps/web/src/custom-sw.js`](../../apps/web/src/custom-sw.js) | Push + `importScripts('./ngsw-worker.js')` |
| [`apps/web/src/app/core/pwa/pwa-icons.spec.ts`](../../apps/web/src/app/core/pwa/pwa-icons.spec.ts) | Required icon file list |
| [`apps/web/src/app/core/pwa/pwa-update.service.ts`](../../apps/web/src/app/core/pwa/pwa-update.service.ts) | Update + `ngsw.json` poll |
| [`apps/web/src/app/core/app/app-version.service.ts`](../../apps/web/src/app/core/app/app-version.service.ts) | `/version.txt` fetch |
| [`scripts/check-pwa.sh`](../../scripts/check-pwa.sh) | Automate HTTP checks (currently V1 URL) |
| [`scripts/start-dev.sh`](../../scripts/start-dev.sh) | `--with-push` for local FR41 recette |

### Recette environments

| Environment | How | SW enabled? |
|-------------|-----|-------------|
| **Local FR41** | `./scripts/start-dev.sh --with-push` — prod build + HTTPS static + proxy `/v1` | Yes |
| **Staging** | `staging-v2` → `hatcast-v2-staging` (GitHub env `staging`) | Yes |
| **Plain `ng serve` dev** | API + HMR | **No** — do not use for install/update recette |

Prerequisites for `--with-push`: `.env` with VAPID keys (push not required for manifest/icon recette, but script may enable SW build).

### `check-pwa.sh` improvement spec (AC5)

Current script hard-codes `https://selections.la-malice.fr` (V1). **Required:**

```bash
BASE_URL="${BASE_URL:-${1:-}}"
if [ -z "$BASE_URL" ]; then
  echo "Usage: BASE_URL=https://your-v2-origin ./scripts/check-pwa.sh"
  exit 1
fi
```

Remove V1-specific marketing copy in header or gate behind `HATCAST_PWA_LEGACY=1`. Document staging URL pattern in `scripts/README.md` (Cloud Run URL from console — not committed).

Icon probe list should align with **10.7**:

- `/icons/manifest-icon-192.maskable.png`
- `/icons/manifest-icon-512.maskable.png`
- `/icons/icon-192.png`, `/icons/icon-512.png`
- `/icons/apple-icon-180.png`, `/icons/favicon.svg`

Service worker: check **`/custom-sw.js`** first (V2), then fallback `sw.js` / `service-worker.js` for legacy.

`pwa-debug.html`: **WARN** if missing on V2 (only exists under `legacy/public/` today).

### Manual maskable QA (from 10.7 deferred)

1. Chrome → Application → Manifest → select 512 maskable → **Show only the minimum safe area**
2. Optional: [maskable.app](https://maskable.app) — upload `manifest-icon-512.maskable.png`
3. Script padding: `generate-icons.sh` uses ~18% padding — document if PO accepts waiver

### Known behaviours (not bugs for 10.4)

- **Icon cache:** Installed PWA may show old icon until user applies **10.2** update or reinstall — document in sign-off (deferred from **10.7** review).
- **Install prompt:** Chrome may delay `beforeinstallprompt` — **10.1** already documents; not a 10.4 failure.
- **`version.txt` on staging:** Must match release tagging policy eventually (**OPS-6**); for recette, file must exist and be readable.

### Architecture compliance

- **NFR-R1:** PWA assets ship in the same coupled image as API — recette validates deployed bundle, not a separate CDN.
- **Do not** add `ngsw` data groups for `/v1/**`.
- **Do not** enable SW in dev mode.
- **Do not** change `legacy/` production PWA.

### Implementation guardrails

- **Do not** regenerate icons unless recette finds a **defect** — fix in a hotfix PR referenced from Dev Agent Record.
- **Do not** expand scope to **10.5** / **10.6** copy or UI.
- **Do not** fail recette because `pwa-debug.html` is absent on V2.
- **Do** fail if staging manifest icons 404 or SW not registered on HTTPS.
- **Do** record exact staging URL and date in Dev Agent Record for M4 audit trail.

### Previous story intelligence

| Story | Relevance to 10.4 |
|-------|-------------------|
| **10.1** | Installability, `ngsw-config`, `check-pwa.sh` follow-up |
| **10.2** | Update banner, `custom-sw.js`, `--with-push` recette |
| **10.3** | `version.txt`, `changelog.json`, auto-open after reload |
| **10.7** | HatCast 2 icons, split manifest purposes, `pwa-icons.spec.ts`, manual QA deferred **here** |

### Git intelligence

Recent PWA commits:

- `ac162ef6` — `feat(pwa): Redesign HatCast 2 icon set and favicon` (**10.7**)
- `4b8dc64e` — `feat(web): Add version and changelog on account` (**10.3**)
- `e5a1efe1` — `feat(web): Add PWA update banner on user action` (**10.2**)
- `da311e29` — `feat(web): Add PWA install and member glance` (**10.1**)

Follow: update `scripts/` with English commit messages; no `legacy/` edits; French UI strings unchanged.

### Testing commands

```bash
# Unit contracts (required)
npm run test -w @hatcast/web -- --watch=false

# Production bundle (required)
npm run build -w @hatcast/web -- --configuration production
ls -la dist/web/browser/{manifest.webmanifest,ngsw.json,custom-sw.js,version.txt}
ls dist/web/browser/icons/

# Local SW recette (recommended)
./scripts/start-dev.sh --with-push
# → https://localhost:4200 — DevTools Application

# Staging HTTP smoke (required after script fix)
BASE_URL=https://<hatcast-v2-staging-host> ./scripts/check-pwa.sh
```

### Project structure (expected changes)

| Action | Path |
|--------|------|
| UPDATE | `scripts/check-pwa.sh` |
| UPDATE | `scripts/README.md` |
| MAYBE | `apps/web/src/app/core/pwa/pwa-dist-recette.spec.ts` (only if CI builds prod) |
| UPDATE | This story file — Dev Agent Record filled at recette time |

---

## Dev Agent Record

### Agent Model Used

Composer (Cursor agent)

### Completion Notes List

- **Scope lock:** No product code changes; **10.7** assets used as baseline. Only `scripts/check-pwa.sh` and `scripts/README.md` updated.
- **Production bundle audit (2026-06-02):** `apps/web/dist/web/browser/` contains all required artifacts:
  - `manifest.webmanifest` (883 B), `custom-sw.js` (2256 B), `ngsw.json` (3401 B), `ngsw-worker.js` (83422 B)
  - `version.txt` (46 B, first line `2.0.0-SNAPSHOT`), `changelog.json` (277 B)
  - `icons/` (136 KB total): all 13 files from `pwa-icons.spec.ts` present (e.g. `icon-192.png` 9385 B, `manifest-icon-512.maskable.png` 23837 B)
- **Static contract:** On-disk manifest matches **10.7** (split `any`/`maskable`, `#6750A4` / `#FFFBFE`, `/?source=pwa`). `ngsw-config.json`: `/icons/**` in assets group with `updateMode: prefetch`; `navigationUrls` excludes `!/v1/**`. `app.config.ts`: `provideServiceWorker('custom-sw.js', { enabled: !isDevMode() })`.
- **`check-pwa.sh`:** Parameterized `BASE_URL` (env or CLI arg, HTTPS required). Extended icon probes, split-manifest validation (10.7), SPA-fallback detection for `version.txt`/`changelog.json`, `/custom-sw.js` first for SW, exit 1 on ERROR.
- **Tests:** `npm run test -w @hatcast/web -- --watch=false` — **866 passed** (includes `pwa-icons`, `pwa-manifest`, `pwa-update`, `app-version` specs). No `pwa-dist-recette.spec.ts` (CI has no prod build step; dist checklist documented above).
- **Staging smoke (post-promote):** `./scripts/v2/promote-to-staging.sh` (70 commits → `staging-v2`), CI deploy run 26834718731 **success**, then `check-pwa.sh` **PASSED** (0 errors) on `https://hatcast-v2-staging-730278491306.europe-west9.run.app`.
- **PO sign-off (2026-06-02):** Recette manuelle validée par Patrice — story **done** ; gate FR40/FR41 ouverte pour **10.5** / **10.6**.

### Recette sign-off

| Field | Value |
|-------|-------|
| Staging `BASE_URL` | `https://hatcast-v2-staging-730278491306.europe-west9.run.app` |
| `check-pwa.sh` date | 2026-06-02 |
| PO / release sign-off | **OK** — Patrice, recette manuelle + smoke staging (2026-06-02) |
| Maskable QA waiver | Accepted: ~18% padding from `generate-icons.sh`; recette manuelle PO OK |

**Staging smoke (2026-06-02, post-promote `dc94e606`) — `check-pwa.sh` PASSED (0 errors, 0 warnings):**

| Result | Check |
|--------|-------|
| PASS | HTTPS, manifest JSON, theme/start_url/display, split any/maskable (10.7) |
| PASS | All 6 icon URLs, `/custom-sw.js`, `version.txt`, `changelog.json` |

**Manual recette matrix:**

| Check | Tool / platform | Pass? |
|-------|-----------------|-------|
| Manifest + icons resolve | Chrome DevTools + HTTP smoke | **Pass** |
| Maskable safe zone | DevTools Icons preview + optional maskable.app | **Pass** (PO) |
| SW active, no stale `/v1` cache group | DevTools → Service workers | **Pass** |
| Install / A2HS (if criteria met) | Android Chrome or iOS Safari | **Pass** (PO) |
| Update banner + reload | `--with-push` or staging second deploy | **Pass** (PO) |
| Changelog auto-open once | After update reload (**10.3**) | **Pass** (PO) |
| `version.txt` visible on `/compte` | Manual | **Pass** |
| HatCast 2 vs V1 icon distinct | Side-by-side home screen | **Pass** (PO) |

**Known limits (not bugs):** Installed PWA may show cached V1-era icon until user applies **10.2** update or reinstalls (from **10.7** deferred work).

### File List

- `scripts/check-pwa.sh` (updated)
- `scripts/README.md` (updated)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (status → done)
- `_bmad-output/implementation-artifacts/10-4-recette-pwa-manifest-icons-sw.md` (this file)

### Change Log

- 2026-06-02 : Story created (`bmad-create-story` 10.4) — ready-for-dev
- 2026-06-02 : Recette tooling — `check-pwa.sh` V2 parameterization, production dist audit, staging smoke archived; conditional sign-off pending `staging-v2` redeploy
- 2026-06-02 : Promote `staging-v2` + smoke PASS; PO manual recette OK — **done**

---

### Validation create-story

- [x] AC métier numérotés et sourcés (Epic 10 FR40/FR41, SCP V2.0.0)
- [x] **UI : N/A** explicite
- [x] Tasks référencent les AC
- [x] Liens vers fichiers code existants
- [x] `npm run test` / production build mentionnés
- [x] Distinction claire vs **10.7** (pas de conflit)
