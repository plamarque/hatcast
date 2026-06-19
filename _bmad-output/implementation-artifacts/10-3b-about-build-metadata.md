---
baseline_commit: 94f3eb67
retroactive: true
checkpoint: approved 2026-06-14
---

# Story 10.3b: About — discrete build metadata

Status: done

## Story

As an **operator or support person** using HatCast,
I want **discrete build metadata on the About tab** (git hash, build timestamp, deployment channel),
so that I **know exactly which artifact is running and on which environment** without a debug panel or permanent env badge.

**Retroactive story** — implemented outside the normal BMad story cycle (2026-06-14); checkpoint review approved.

**UX amendment (normative):** [`ux-design-mon-compte.md`](../planning-artifacts/ux-design-mon-compte.md) § Onglet 4 — À propos — **amendement 2026-06-14** (wireframe + test ids + retrait « badge environnement — story ultérieure »). *Aligné 2026-06-14.*

**Parent / related:** extends **10.3** (`version.txt` consumer) ; closes deferred « environment badge » from 10.3 out-of-scope ; resolves OPS-6 deferred item « Production build line at prod tag » via **Docker build-time patch** (compatible OPS-5).

---

## Acceptance Criteria

### UI & client

1. **Given** a signed-in user on **`/compte/a-propos`**, **when** `version.txt` (or local override) includes channel metadata, **then** a **discrete secondary line** appears under « Version X.Y.Z » with format `{gitHash} · {YYYYMMDDHHmm} · canal {channel}` (French channel labels: production, staging, développement, local).
2. **Given** channel metadata is missing or unparseable, **when** the About tab renders, **then** the secondary line is **hidden** — the screen stays user-oriented (version + actions only).
3. **Given** the client loads version files, **when** in local dev, **then** it tries **`/version.local.txt` first** (gitignored), then falls back to **`/version.txt`** — tracked seed is never required to be restored before commit.
4. **Given** implementation complete, **when** Vitest runs, **then** parsing, formatting, service fetch order, and About tab render/absence of meta line are covered; `npm run test -w @hatcast/web -- --watch=false` succeeds for touched specs.

### Pipeline & `version.txt` contract

5. **Given** the four-line `version.txt` contract (semver · build line · `Git:` · `Build:`), **when** `release-staging.sh` runs, **then** it writes line 2 as **`Staging RC build - DATE`** via shared `scripts/v2/lib/version-txt.sh`.
6. **Given** Cloud Run deploy via **`deploy-v2-cloud-run.yml`**, **when** Docker builds the image, **then** `HATCAST_VERSION_CHANNEL` (`production` | `staging` | `development`) patches **line 2 only** before `ng build` — prod UI shows **canal production** without amending the RC git commit (OPS-5).
7. **Given** `./scripts/start-dev.sh`, **when** the stack starts, **then** it writes **`apps/web/public/version.local.txt`** (gitignored) with **`Local build`** + current git hash and timestamp; **`version.txt` in git stays unchanged**.

**Product coverage:** Epic 10 · Mon compte · operator/support visibility (not end-user feature).

**Out of scope:** tap-to-copy meta line; global env badge outside About; legacy V1; rewriting git `version.txt` on prod tag promotion.

---

## Acceptance Criteria — Material 3 (UI)

**M3-1. Composants Material** — N/A for new controls; existing About tab actions unchanged (`mat-icon`, action rows). Meta line is plain text only.

**M3-2. Tokens & thème** — Meta line uses `color-mix(in srgb, var(--mat-sys-on-surface) 48%, transparent)` ; no hex/rgb on feature SCSS. [Source: FRONTEND_UI.md]

**M3-3. Mobile & tactile** — Meta line wraps on ≤480px ; no new interactive targets ; existing action rows ≥48dp unchanged.

**M3-4. Navigation membre** — N/A (About tab only).

**M3-5. Revue** — Checkpoint M3 self-check 2026-06-14: tokens OK ; meta line discrete ; `data-testid="account-app-build-meta"` ; `aria-describedby` on version line when meta present.

---

## Tasks / Subtasks

- [x] **AppVersionService** — parse lines 2–4 ; `buildMeta` signal ; `VERSION_TXT_URLS` local-first fetch
- [x] **About tab** — `buildMetaLine` computed ; template + `.account-page__about-build-meta` SCSS
- [x] **Pipeline** — `version-txt.sh` ; `patch-version-txt-channel.mjs` ; Dockerfile + CI build-arg ; `start-dev.sh` → `version.local.txt`
- [x] **Tests** — `app-version.service.spec.ts` ; `account-about-tab.spec.ts` ; `account-placeholder.spec.ts` mock `buildMeta`
- [x] **Docs UX** — amend [`ux-design-mon-compte.md`](../planning-artifacts/ux-design-mon-compte.md) § À propos (wireframe + test id + hors scope)
- [x] **Docs ops** — [`DEPLOYMENT_WORKFLOW.md`](../../docs/v2/technical/DEPLOYMENT_WORKFLOW.md) § Versioning (Docker channel patch)

---

## Dev Notes

### Display format (shipped)

```
Version 2.3.0
a0db03f7 · 202606131249 · canal staging
```

- **gitHash** — line 3 of version file (`Git: …`)
- **buildStamp** — `YYYYMMDDHHmm` from line 4 (`Build: ISO8601`), literal parse (no TZ conversion)
- **channel** — from line 2 prefix (`Production` / `Staging RC` / `Development` / `Local build`)

### Local dev pattern

| File | Tracked | Role |
|------|---------|------|
| `apps/web/public/version.txt` | yes | Staging/release seed |
| `apps/web/public/version.local.txt` | gitignored | Generated by `start-dev.sh` |

### Explicit non-goals

- Tap-to-copy for support tickets
- Visible DEV/STG badge elsewhere in app (10.3 deferred item — addressed only on About)
- Git commit amend on prod promote

### Dependencies

| Story | Status | Relationship |
|-------|--------|----------------|
| 10.3 | done | Parent consumer of `version.txt` line 1 |
| 10.2 | done | About tab MAJ check unchanged |
| OPS-5 | done | Prod tag = RC commit ; channel patch at Docker build |
| OPS-6 | done | `write_version_txt` shared ; prod line-2 gap closed at build time |

---

## Dev Agent Record

### Agent Model Used

Cursor agent (retro doc + implementation 2026-06-14)

### Completion Notes List

- Checkpoint preview approved 2026-06-14 (ship)
- Code review 2026-06-14 : 6 patches appliqués (fetch fallback, Docker hygiene, tests AC2/a11y, overflow-wrap) ; décision B `--with-push` + canal local conservé
- `version.local.txt` pattern avoids dirty `version.txt` before every commit
- Vitest: 36/36 green on touched specs (2026-06-14)

### File List

| Path | Change |
|------|--------|
| `apps/web/src/app/core/app/app-version.service.ts` | Parse meta ; local-first fetch ; `isVersionTxtResponseUsable` |
| `apps/web/src/app/core/app/app-version.service.spec.ts` | Parser + service + fallback tests |
| `apps/web/src/app/pages/account-placeholder/tabs/account-about-tab.ts` | `buildMetaLine` computed |
| `apps/web/src/app/pages/account-placeholder/tabs/account-about-tab.html` | Meta line + a11y |
| `apps/web/src/app/pages/account-placeholder/tabs/account-about-tab.spec.ts` | Render tests |
| `apps/web/src/app/pages/account-placeholder/account-placeholder.scss` | `.account-page__about-build-meta` |
| `apps/web/src/app/pages/account-placeholder/account-placeholder.spec.ts` | Mock `buildMeta` |
| `apps/web/scripts/patch-version-txt-channel.mjs` | **new** — CI Docker line-2 patch |
| `scripts/v2/lib/version-txt.sh` | **new** — shared `write_version_txt` |
| `scripts/v2/release-staging.sh` | Use shared lib |
| `scripts/start-dev.sh` | `patch_local_version_txt` → `version.local.txt` |
| `Dockerfile` | `HATCAST_VERSION_CHANNEL` build-arg ; rm `version.local.txt` |
| `.dockerignore` | Exclude `apps/web/public/version.local.txt` |
| `.github/workflows/deploy-v2-cloud-run.yml` | Pass channel to Docker |
| `.gitignore` | `apps/web/public/version.local.txt` |

### Change Log

- 2026-06-14 : Story created retroactively after ship-approved implementation (build meta UI + pipeline + version.local.txt).

---

### Review Findings

- [x] [Review][Decision] `--with-push` et `version.local.txt` — **Résolu (B)** : conserver `version.local.txt` en recette `--with-push` ; canal **local** explicite voulu en dev PWA prod-like.

- [x] [Review][Patch] Fallback fetch incomplet [`apps/web/src/app/core/app/app-version.service.ts`] — `isVersionTxtResponseUsable()` ; rejet corps vide / canal illisible sur `.local` → fallback `/version.txt`.

- [x] [Review][Patch] Fuite Docker `version.local.txt` [`.dockerignore`] — exclusion `apps/web/public/version.local.txt`.

- [x] [Review][Patch] Nettoyage build Docker [`Dockerfile:31`] — `rm -f` avant `patch-version-txt-channel.mjs`.

- [x] [Review][Patch] Test AC2 canal illisible [`app-version.service.spec.ts` / `account-about-tab.spec.ts`] — parse + render sans canal ; fallback fetch test ajoutés.

- [x] [Review][Patch] Test a11y `aria-describedby` [`account-about-tab.spec.ts`] — assertion quand meta affichée.

- [x] [Review][Patch] Wrap mobile meta line [`account-placeholder.scss:431`] — `overflow-wrap: anywhere`.

- [x] [Review][Defer] Requête 404 `/version.local.txt` en prod [`app-version.service.ts:5`] — deferred, trade-off accepté AC3 (local-first puis fallback).

- [x] [Review][Defer] Couplage libellés canal sur 4 artefacts [pipeline + parser] — deferred, dette documentée ; contrat implicite suffisant pour MVP.

- [x] [Review][Defer] Pas de tests `patch-version-txt-channel.mjs` [`apps/web/scripts/patch-version-txt-channel.mjs`] — deferred, script CI simple ; couverture parser Angular suffisante pour l’UI.

- [x] [Review][Defer] `version.local.txt` stale sans redémarrage [`start-dev.sh:377`] — deferred, workflow dev documenté DEPLOYMENT_WORKFLOW.md.

### Validation create-story

- [x] AC métier numérotés (UI + pipeline)
- [x] Section Material 3 remplie
- [x] Lien amendement UX
- [x] File list complète
- [x] Status **done** (retroactive)
