---
baseline_commit: c1fac3c7
---

# OPS-6 — Version / changelog pipeline coupling (`changelog.json`)

**Status:** done

**Story ID:** OPS-6  
**Story key:** `ops-6-version-changelog-pipeline`  
**Priority:** P0 (V2.0.0 cutover — Wave D)  
**PLAN:** [PLAN.md](../../PLAN.md) § Wave V2.0.0 — Wave D (OPS)  
**SCP:** [sprint-change-proposal-2026-06-02-v2.0.0-cutover-scope.md](../planning-artifacts/sprint-change-proposal-2026-06-02-v2.0.0-cutover-scope.md) § Wave D  
**Previous story:** [ops-5-prod-deploy-from-semver-tag.md](ops-5-prod-deploy-from-semver-tag.md) (done)  
**Related:** [ops-4-release-staging-tag-rc.md](ops-4-release-staging-tag-rc.md) (done), [10-3-version-app-changelog-dialog.md](10-3-version-app-changelog-dialog.md) (done — UI consumer)

---

## Story

As a **platform maintainer**,  
I want **V2 staging releases to keep `package.json` (root + web), `version.txt`, `CHANGELOG.md`, and `apps/web/public/changelog.json` in sync automatically**,  
so that **users see accurate version and release notes in the PWA (Story 10.3) without manual seed edits after every RC or prod cutover**.

---

## Acceptance Criteria

1. **Given** `./scripts/v2/release-staging.sh` runs in real mode on `staging-v2`, **when** it bumps product semver to `X.Y.Z` and writes `apps/web/public/version.txt`, **then** it also updates **`apps/web/public/changelog.json`** with a new or updated entry for version **`X.Y.Z`** (no `-SNAPSHOT`, no `-rc.N` suffix) and commits it in the same release commit as `package.json`, `version.txt`, and `CHANGELOG.md`. [Source: SCP § OPS-6; PLAN Wave D]

2. **Given** the release script computes changelog git range via `hatcast_staging_changelog_range`, **when** `changelog.json` is generated for a **normal** semver (`≠ 2.0.0` cutover), **then** the new entry's change lines reflect **the same commit range** used for `hatcast_generate_changelog_md`. [Source: ops-4 deferral; consistency]

2b. **Given** the product version is **`2.0.0`** (first V2 cutover release), **when** `changelog.json` is generated, **then** the pipeline **does not** derive user bullets from git history or OpenAI on commits — it loads the **curated cutover entry** from [`scripts/v2/changelog-entries/v2.0.0-cutover.json`](../../scripts/v2/changelog-entries/v2.0.0-cutover.json), substitutes `__BUILD_DATE__` with the release date, and merges into `apps/web/public/changelog.json`. [Source: PO 2026-06-03 — V1→V2 summary beats enormous git diff]

2c. **Given** the curated `v2.0.0-cutover.json` entry, **when** a maintainer or PO reviews it before cutover, **then** bullets are **high-level V1→V2 product outcomes** (Argil-style), sourced from specs/epics — e.g. Mon agenda, À faire, navigation hub, dispos/compo, notifications, PWA 2, Mon compte — **not** commit subjects or technical migration jargon. [Source: epics 12, 17, 5–6, 8, 10 ; SCP V2.0.0]

3. **Given** `apps/web/public/changelog.json` already exists, **when** a release targets version `X.Y.Z` again (re-run / hotfix RC), **then** the pipeline **updates** the existing array item for that version (does not duplicate entries) and preserves other version history. [Source: V1 `update_changelog_json` in `release-version.sh`]

4. **Given** the `changelog.json` contract from Story 10.3 / V1, **when** the file is written, **then** each entry has `{ "version": "X.Y.Z", "date": "YYYY-MM-DD", "changes": ["✨ …", "🐛 …"] }` and the root value is a **JSON array** validatable by `jq empty`. [Source: 10-3 AC1, AC3; `legacy/public/changelog.json`]

5. **Given** `OPENAI_API_KEY` is available (`.env` / `.env.local` loaded like V1), **when** the operator runs release without `--no-user-changelog`, **then** user-facing change lines are produced via **`scripts/generate-changelog.js`**, whose prompt follows the [Argil product-updates playbook](https://www.argil.io/playbooks/product/writing-product-updates-and-releases): **outcomes over output**, **« et alors ? » test**, headline = user benefit (not feature name), max ~5 scannable bullets, **zero noise**. [Source: PO editorial policy 2026-06-03]

6. **Given** the Argil-style prompt runs on a diff that is purely internal (CI, refactor, types, docs…), **when** no line passes the user-benefit filter, **then** the generated entry has **`"changes": []`** — valid success, not an error. [Source: PO — prefer empty over unintelligible]

6b. **Given** a version entry in `changelog.json` has **`"changes": []`**, **when** the user opens « Nouveautés » (Story 10.3), **then** the dialog shows the version header and the fixed French copy **« Cette mise à jour ne change rien de visible pour toi. »** (not a blank section). [Source: PO 2026-06-03 ; `changelog-dialog`]

7. **Given** `OPENAI_API_KEY` is missing or OpenAI transformation fails, **when** release runs without `--no-user-changelog`, **then** the pipeline writes the version entry with **`"changes": []`**, logs a clear warning, and **does not** inject raw commit subjects or `CHANGELOG.md` technical lines into `changelog.json`. Release continues (version sync is more important than notes). [Source: PO — no technical fallback noise]

8. **Given** the operator passes **`--no-user-changelog`**, **when** release runs, **then** `changelog.json` is **not modified** (parity with V1 flag) and other version files still update normally. [Source: V1 `NO_USER_CHANGELOG`]

9. **Given** `./scripts/v2/release-staging.sh --dry-run`, **when** simulation completes, **then** console output shows the planned `changelog.json` update (path + version) without pushing, and no partial write leaves the working tree inconsistent. [Source: OPS-4 dry-run patterns]

10. **Given** a successful release commit, **when** `./scripts/check-pwa.sh` runs against a build or HTTPS origin serving that commit, **then** `/changelog.json` remains valid JSON and `/version.txt` first line equals **`X.Y.Z`** aligned with `apps/web/package.json`. [Source: 10-4; `scripts/check-pwa.sh`]

11. **Given** OPS-6 lands, **when** maintainers read docs, **then** `docs/v2/technical/DEPLOYMENT_WORKFLOW.md` and `scripts/README.md` document `changelog.json` generation, `--no-user-changelog`, OpenAI + Argil editorial rules, empty-list policy, and relation to **10.3** / **OPS-4/5**. [Source: ops-5 doc AC pattern]

12. **Given** `./scripts/v2/promote-tag-to-prod.sh` (OPS-5 tag-only promotion), **when** prod tag `vX.Y.Z` is created, **then** **no additional file bump is required** — prod inherits `changelog.json` from the validated RC commit. [Source: OPS-5 scope boundary]

13. **Given** implementation complete, **when** running smoke checks (`bash -n`, `--help`, `--dry-run`, `jq empty` on sample output), **then** all checks succeed and are recorded in Dev Agent Record. [Source: repo ops norms]

**Product coverage:** release pipeline / PWA transparency (Story 10.3); editorial quality of « Nouveautés » copy.

**Editorial reference (PO):** [Argil — Writing product updates and releases](https://www.argil.io/playbooks/product/writing-product-updates-and-releases) — outcomes not output, scannable bullets, empty beats noise. In-app dialog = condensed « what changed » bullets (no GIF/steps/CTA — those are out of scope for `changelog.json`).

---

## Acceptance Criteria — Material 3 (UI)

**UI: minimal (10.3 extension)** — empty `changes[]` per version in `ChangelogDialog` only.

**M3-1.** Message d’état dans `mat-dialog-content` (pas de bouton custom).

**M3-2.** Couleur via `color-mix(in srgb, var(--mat-sys-on-surface) …)` — voir `.changelog-dialog__version-empty`.

**M3-3.** N/A (texte seul, pas de nouveau contrôle interactif).

**M3-4.** N/A

**M3-5.** Déjà couvert par 10.3 ; pas de régression checklist.

---

## Tasks / Subtasks

- [x] **Prompt editorial (AC: 5–6)** — [`scripts/generate-changelog.js`](../../scripts/generate-changelog.js)
  - [x] Argil principles in prompt + system message (outcomes, « et alors ? », max 5 bullets, empty list OK).
  - [x] Log info when `changes` is empty after AI filter.

- [x] **Empty-version UI (AC: 6b)** — [`changelog-dialog`](../../apps/web/src/app/shared/changelog/changelog-dialog/changelog-dialog.html) + spec
  - [x] Message fixe si `entry.changes.length === 0`.
  - [x] Vitest : version sans puces affiche le libellé.

- [x] **Scope and boundaries**
  - [x] Limit to `scripts/lib/version-changelog.sh`, `scripts/v2/release-staging.sh`, docs, and story tracking — **minimal** `apps/web/` touch : changelog dialog empty state only (10.3 extension).
  - [x] Output path is **`apps/web/public/changelog.json`** (not legacy `public/changelog.json`).

- [x] **Cutover changelog v2.0.0 (AC: 2b–2c)**
  - [x] Curated entry [`scripts/v2/changelog-entries/v2.0.0-cutover.json`](../../scripts/v2/changelog-entries/v2.0.0-cutover.json) — PO review before first `--version=2.0.0` release.
  - [x] `hatcast_load_cutover_changelog_entry(version, build_date)` — `v${version}-cutover.json` (fallback `${version}-cutover.json`); strip `source`/`notes`, set `date`.
  - [x] Orchestrator: **cutover file → skip** git range + OpenAI for that version only.
  - [x] Log: `ℹ️  Changelog 2.0.0 : entrée cutover curated (pas de git/OpenAI)`.

- [x] **Extend `version-changelog.sh` (AC: 2–4, 7)**
  - [x] Add `CHANGELOG_JSON="apps/web/public/changelog.json"` constant or parameterised path helper.
  - [x] `hatcast_build_technical_changelog_json(version, date, commit_range)` — build technical JSON `{version, date, changes[]}` from `git log --oneline` (skip bump/release chore commits like `hatcast_generate_changelog_md`).
  - [x] `hatcast_transform_changelog_json_with_openai(technical_json, version)` — call `node scripts/generate-changelog.js` with `.env` / `.env.local` loading (mirror V1).
  - [x] `hatcast_changelog_json_empty_entry(version, date)` — fallback when OpenAI unavailable/fails: `{version, date, changes:[]}` (**no** CHANGELOG.md technical parse).
  - [x] `hatcast_update_changelog_json_file(new_version_json, version)` — jq prepend/update-by-version; validate with `jq empty`; fail release on invalid JSON.
  - [x] `hatcast_generate_changelog_json_for_release(version, date, commit_range, no_user_changelog_flag)` — orchestrator used by release script.

- [x] **Wire `release-staging.sh` (AC: 1, 5–8)**
  - [x] Add `--no-user-changelog` option to usage/help.
  - [x] After `hatcast_generate_changelog_md` + `hatcast_mirror_changelog_fr`, call changelog JSON orchestrator.
  - [x] Add `${CHANGELOG_JSON}` to `git add` in real and dry-run print paths.
  - [x] Dry-run: print would-update summary; optionally write in sandbox only (follow existing dry-run sandbox pattern — do not pollute real tree).

- [x] **Seed / first-release hygiene (AC: 3, 4, 2b)**
  - [x] First cutover release (`--version=2.0.0`) replaces seed entry `2.0.0-SNAPSHOT` via curated cutover merge.
  - [x] Do **not** bulk-import legacy `legacy/public/changelog.json` history (explicit non-goal).
  - [x] After cutover, delete or keep `v2.0.0-cutover.json` as archive — file is only consumed when `version == 2.0.0`.

- [x] **Docs and runbooks (AC: 10)**
  - [x] Update `DEPLOYMENT_WORKFLOW.md` § Versioning — mention `changelog.json` auto-generation on staging release.
  - [x] Update `scripts/README.md` — `--no-user-changelog`, OpenAI optional, jq prerequisite.

- [x] **Validation and evidence (AC: 9, 12)**
  - [x] `bash -n scripts/lib/version-changelog.sh scripts/v2/release-staging.sh`
  - [x] `./scripts/v2/release-staging.sh --help` documents new flag
  - [x] `./scripts/v2/release-staging.sh --dry-run` (or sandbox) shows changelog.json step
  - [x] `jq empty apps/web/public/changelog.json` after simulated generation
  - [x] Record commands/results in Dev Agent Record

- [x] **Tracking**
  - [x] Set `sprint-status.yaml` `ops-6-version-changelog-pipeline` to `done` only after implementation + review.

### Review Findings

- [x] [Review][Patch] Retirer l'entrée test `2.0.1` de `apps/web/public/changelog.json` — artefact de validation manuelle, ne doit pas être commitée avec la story [`apps/web/public/changelog.json`:2]
- [x] [Review][Patch] Supprimer `2.0.0-SNAPSHOT` lors du cutover `2.0.0` — la story exige de remplacer l'entrée seed ; `hatcast_update_changelog_json_file` ne matche que la version exacte, l'entrée SNAPSHOT restera visible dans « Nouveautés » [`scripts/lib/version-changelog.sh`:479]
- [x] [Review][Patch] Logger les erreurs OpenAI au lieu de `2>/dev/null` — l'opérateur ne voit pas pourquoi le fallback `changes: []` s'active [`scripts/lib/version-changelog.sh`:407]
- [x] [Review][Defer] Nettoyage JSON OpenAI via `.replace(/\n/g, '\\n')` sur la réponse entière — fragile si le modèle renvoie du JSON multi-lignes ; pattern pré-existant dans `generate-changelog.js` — deferred, pre-existing

---

## Dev Notes

### Why this story exists now

Stories **10.3** (changelog dialog) and **10.4** (PWA recette) ship the **consumer** side: Angular reads `/version.txt` and `/changelog.json` from `apps/web/public/`. **OPS-4** and **OPS-5** automate staging RC tags and prod tag promotion, but **explicitly deferred** `changelog.json` generation to **OPS-6**. Until this lands, maintainers must manually edit the seed file on every version bump — error-prone before **v2.0.0** cutover.

### Current state (must read before coding)

| Artifact | Today | OPS-6 target |
|----------|-------|--------------|
| `apps/web/package.json` | `2.0.0-SNAPSHOT` | Bumped to `X.Y.Z` by `release-staging.sh` (already) |
| Root `package.json` | `0.47.1` (legacy) | Aligned to web V2 via `align_v2_package_versions` (already) |
| `apps/web/public/version.txt` | First line `2.0.0-SNAPSHOT` | Written each release (already) — line 1 = product semver |
| `apps/web/public/changelog.json` | Manual seed with `2.0.0-SNAPSHOT` entry | **Auto-generated each release** |
| `CHANGELOG.md` | Generated by `hatcast_generate_changelog_md` | Unchanged; **maintainer/technical** only — **not** copied into `changelog.json` |
| `scripts/v2/promote-tag-to-prod.sh` | Tag-only | **No change** — inherits files from RC commit |
| `scripts/v2/release-production.sh` | Deprecated wrapper → `promote-tag-to-prod.sh` | **No changelog logic here** |

### `changelog.json` contract (do not break — Story 10.3)

```json
[
  {
    "version": "2.0.0",
    "date": "2026-06-03",
    "changes": [
      "✨ Description utilisateur en français",
      "🐛 Correction visible"
    ]
  }
]
```

- **Consumer:** [`apps/web/src/app/core/app/changelog.service.ts`](../../apps/web/src/app/core/app/changelog.service.ts) — sorts semver descending, parses emoji prefix via `^([^\s]+)\s(.+)$`.
- **Reference loader:** `legacy/src/components/ChangelogModal.vue`, `legacy/public/changelog.json`.
- **Validation:** [`scripts/check-pwa.sh`](../../scripts/check-pwa.sh) §5 probes `/changelog.json` with `jq`.

### `version.txt` contract (preserve)

```
X.Y.Z
Staging RC build - YYYY-MM-DD
Git: abc1234
Build: ISO8601
```

Written by `write_version_txt()` in [`scripts/v2/release-staging.sh`](../../scripts/v2/release-staging.sh). **Line 1** is what `AppVersionService` displays. Prod deploy reuses the RC commit — line 2 may still say « Staging RC build » on prod URL; **out of scope** for OPS-6 (no commit in `promote-tag-to-prod.sh`). Document as known limitation if asked.

### Reuse map (do not reinvent)

| Existing | Reuse strategy |
|----------|----------------|
| [`scripts/lib/version-changelog.sh`](../../scripts/lib/version-changelog.sh) | Extend with JSON helpers; RC range already in `hatcast_staging_changelog_range` |
| [`scripts/generate-changelog.js`](../../scripts/generate-changelog.js) | **UPDATED (pre-OPS-6)** — Argil editorial prompt; call via node CLI |
| [`scripts/release-version.sh`](../../scripts/release-version.sh) | **Read-only reference** for `update_changelog_json` jq pattern only — **do not** reuse V1 MD/OpenAI fallback into user JSON |
| [`scripts/v2/release-staging.sh`](../../scripts/v2/release-staging.sh) | Primary integration point (same commit as OPS-4) |
| [`scripts/load-dotenv.sh`](../../scripts/load-dotenv.sh) | Load `OPENAI_API_KEY` for optional OpenAI path |

### Required code/doc touchpoints

| File | Action |
|------|--------|
| `scripts/v2/changelog-entries/v2.0.0-cutover.json` | **NEW** — curated 2.0.0 launch notes (PO) |
| `scripts/generate-changelog.js` | **DONE** — Argil prompt (PO 2026-06-03) |
| `scripts/lib/version-changelog.sh` | **EXTEND** — JSON generation helpers |
| `scripts/v2/release-staging.sh` | **UPDATE** — call helpers, `--no-user-changelog`, git add |
| `docs/v2/technical/DEPLOYMENT_WORKFLOW.md` | **UPDATE** § Versioning |
| `scripts/README.md` | **UPDATE** version management section |
| `apps/web/public/changelog.json` | **OUTPUT** of release (may fix seed in first real release) |

**Do NOT modify:** `apps/web/src/**`, `services/api/**`, `.github/workflows/**`, V1 `release-version.sh` (unless extracting shared lib with zero V1 behavior change — prefer copy-adapt into V2 lib).

### Architecture and operations guardrails

- **Prerequisites:** `jq` on PATH (already used in V1 release path); `node` for OpenAI path.
- **Idempotency:** Re-running release for same semver updates JSON entry in place.
- **Fail-fast:** Invalid JSON after generation → exit 1 before commit (do not push broken release).
- **OpenAI required for meaningful notes:** Without `OPENAI_API_KEY`, write **`changes: []`** and warn — never dump technical lines.
- **Empty list policy:** Prefer `"changes": []` over low-quality bullets; PO accepts version-only entry in « Nouveautés » dialog.
- **French user-facing strings** in `changes[]` when OpenAI succeeds.
- **Argil alignment:** Each bullet = what the user can do/notice; fail « et alors ? » → omit line.
- **Conventional Commits:** Skip messages matching existing `hatcast_generate_changelog_md` filters (`chore(v2): release staging`, etc.).
- **Dry-run sandbox:** Follow OPS-4 `.dry-run-sandbox-v2` — do not write real `apps/web/public/changelog.json` outside sandbox when `--dry-run`.

### Regression risks to prevent

- Writing to wrong path (`public/changelog.json` V1 vs `apps/web/public/changelog.json` V2).
- Breaking Story 10.3 dialog (invalid JSON, wrong schema, `-SNAPSHOT` in version field).
- Divergent commit ranges between `CHANGELOG.md` and `changelog.json`.
- Duplicated semver entries after multiple RCs on same base version.
- Accidentally requiring OpenAI for every release.
- Modifying `promote-tag-to-prod.sh` to create commits (violates OPS-5 tag-only model).

### Previous story intelligence (OPS-5 / OPS-4)

**OPS-5:**
- Prod promotion is **tag-only**; version files must be correct **before** `promote-tag-to-prod.sh`.
- Reuse helper patterns from `version-changelog.sh`; French-friendly console messages OK.
- Always pair script changes with docs in same story.

**OPS-4:**
- `release-staging.sh` already: bump packages, `write_version_txt`, `hatcast_generate_changelog_md`, commit + tag RC.
- Explicit deferral: « Do **not** Generate `apps/web/public/changelog.json` (**OPS-6**) ».
- Product version source: **`apps/web/package.json`** over stale `version.txt`.
- Review patches applied: strict semver validation, ancestor checks on changelog range — **reuse `hatcast_staging_changelog_range`**, do not duplicate range logic.

**Story 10.3:**
- UI already done; only static asset pipeline missing.
- `changelogSeen` / auto-open after PWA update depends on correct version string — must be clean semver after OPS-6 releases.

### Git intelligence (recent commits)

```
c1fac3c7 fix(ci): Run prod deploy when e2e-smoke is skipped
99c38c24 fix(ci): Write Cloud Run env-vars-file as YAML map
c38a822a fix(ci): Use tags-ignore only for RC exclusion
d386780f fix(ci): Green staging release — env file and no RC tag workflow
fbd75f11 ops(ci): Close OPS-5 tag-first prod deploy
```

Release pipeline files are active; preserve OPS-4/5 conventions (`set -euo pipefail`, `shellcheck source`, dry-run sandbox, French operator messages).

### Testing requirements

```bash
# Syntax
bash -n scripts/lib/version-changelog.sh
bash -n scripts/v2/release-staging.sh

# Help / dry-run
./scripts/v2/release-staging.sh --help
./scripts/v2/release-staging.sh --dry-run

# JSON validity (after dry-run sandbox or manual helper invocation)
jq empty apps/web/public/changelog.json

# PWA smoke (optional, needs HTTPS origin)
BASE_URL=https://localhost:4200 ./scripts/check-pwa.sh   # with --with-push build
```

No Vitest/Gradle tests required (scripts-only story). Consider a small **shell test** under `scripts/` only if a helper is complex and untestable via dry-run — not mandatory.

### Explicit non-goals

- Angular / API runtime changes.
- Bulk migration of V1 `legacy/public/changelog.json` history.
- CI workflow changes or build-time regeneration of `changelog.json`.
- Updating `version.txt` line 2 to « Production build » at prod tag time.
- Playwright E2E for changelog dialog (covered by 10.3 unit tests).
- Refactoring entire V1 `release-version.sh` into shared library (minimal extract only).

### Dependencies

| Story | Status | Relationship |
|-------|--------|--------------|
| OPS-4 | done | `release-staging.sh` host script; deferred JSON gen |
| OPS-5 | done | Prod inherits RC commit artifacts; tag-only |
| 10.3 | done | UI consumer of `changelog.json` |
| 10.4 | done | PWA smoke validates both static files |
| OPS-7 | backlog | Branch cutover; no blocker |
| OPS-8 | in-progress | Domain cutover; independent |

### Project context reference

- [project-context.md](../../project-context.md) — scripts-only, no M3 checklist
- [AGENTS.md](../../AGENTS.md) — commit conventions, scope discipline
- [PLAN.md](../../PLAN.md) § Wave D OPS-6
- SCP: `_bmad-output/planning-artifacts/sprint-change-proposal-2026-06-02-v2.0.0-cutover-scope.md`

---

## Dev Agent Record

### Agent Model Used

Composer (dev-story OPS-6)

### Completion Notes List

- Extended `scripts/lib/version-changelog.sh` with `changelog.json` helpers (technical JSON from same git range as MD, OpenAI via `generate-changelog.js`, empty fallback, jq merge by version, cutover loader for `v2.0.0-cutover.json`).
- Wired `scripts/v2/release-staging.sh`: `--no-user-changelog`, orchestrator after CHANGELOG.md, `git add` includes `apps/web/public/changelog.json`, dry-run prints planned JSON update.
- Docs: `DEPLOYMENT_WORKFLOW.md`, `scripts/README.md`.
- Pre-existing: Argil prompt (`generate-changelog.js`), empty-version UI + Vitest (`changelog-dialog`).
- Validation: `bash -n` OK; `--help` shows flag; `--dry-run --version=2.0.1` printed changelog.json step + `git add … changelog.json`; `jq empty` on seed file; manual orchestrator test for 2.0.0 cutover (9 bullets). `promote-tag-to-prod.sh` unchanged (AC 12).

### File List

- `scripts/lib/version-changelog.sh`
- `scripts/v2/release-staging.sh`
- `scripts/v2/changelog-entries/v2.0.0-cutover.json`
- `scripts/generate-changelog.js`
- `docs/v2/technical/DEPLOYMENT_WORKFLOW.md`
- `scripts/README.md`
- `apps/web/src/app/shared/changelog/changelog-dialog/changelog-dialog.html`
- `apps/web/src/app/shared/changelog/changelog-dialog/changelog-dialog.scss`
- `apps/web/src/app/shared/changelog/changelog-dialog/changelog-dialog.spec.ts`
- `_bmad-output/implementation-artifacts/ops-6-version-changelog-pipeline.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

### Editorial principles (Argil → in-app « Nouveautés »)

Source: [Writing product updates and releases](https://www.argil.io/playbooks/product/writing-product-updates-and-releases) (Julien Berthomier).

| Argil principle | HatCast `changelog.json` adaptation |
|-----------------|-----------------------------------|
| Outcomes, not output | Bullets describe user benefit, not shipped code |
| « So what » / « et alors ? » test | Drop any line whose value isn't obvious in 3s |
| Headline = benefit | Each bullet leads with what you can do now |
| Scannable, brief | Max ~5 lines per version |
| Zero noise | Empty `changes[]` if diff is internal-only |
| GIF / steps / CTA | **N/A** — dialog is a bullet list only (10.3) |

Implemented in **`scripts/generate-changelog.js`** (updated before pipeline wiring).

### v2.0.0 cutover exception (curated, not git)

The first **HatCast 2** release spans the entire V2 build history. Feeding thousands of commits to OpenAI would produce **noise**, not a V1→V2 story users need.

| Normal release (`2.0.1+`) | **2.0.0 cutover** |
|---------------------------|-------------------|
| Git range → technical JSON → OpenAI (Argil) | **Static curated file** |
| Max ~5 bullets | ~8–10 bullets OK (launch summary) |
| Empty if internal-only | Never empty — PO-authored summary |

**Curated file:** [`scripts/v2/changelog-entries/v2.0.0-cutover.json`](../../scripts/v2/changelog-entries/v2.0.0-cutover.json)

**Content themes (spec-backed — adjust with PO before cutover):**

| Theme | Epics / stories | Example user line |
|-------|-----------------|-------------------|
| Migration / continuity | MIG, SCP | Données conservées depuis V1 |
| Mon agenda | 12 | Spectacles à venir, toutes troupes |
| À faire | 17.19, 17.21 | Dispos + compos à traiter |
| Navigation hub | 17.3–17.5, 17.22 | Accueil / Agenda / Stats, hub troupe |
| Workspace ligue | 3.3, 3.6, 16 | Agenda · Historique · Statistiques |
| Dispos & compo | 5, 6 | Rôles, tirage, confirmation |
| Notifications | 8.1, 8.3 | Push / e-mail MEP |
| PWA HatCast 2 | 10.x | Install, icône, MAJ + nouveautés |
| Mon compte | 1.x, 17.34 | Connexion, prefs, sécurité |

**Spec references for edits:** [epics.md](../planning-artifacts/epics.md), [ux-hub-a-faire.md](../planning-artifacts/ux-hub-a-faire.md), SCP [V2.0.0 cutover](sprint-change-proposal-2026-06-02-v2.0.0-cutover-scope.md).

**Operator flow:** `./scripts/v2/release-staging.sh --version=2.0.0` → pipeline detects `2.0.0` → loads cutover JSON → merges into `apps/web/public/changelog.json` → same RC commit as prod tag lineage.

### Change Log

- 2026-06-03: Story created via `bmad-create-story OPS-6` — status `ready-for-dev`.
- 2026-06-03: PO editorial — Argil prompt in `generate-changelog.js`; AC updated (empty over noise, no MD fallback).
- 2026-06-03: PO — v2.0.0 cutover curated changelog (V1→V2 summary); `scripts/v2/changelog-entries/v2.0.0-cutover.json`.
- 2026-06-03: PO — empty `changes[]` UI copy in changelog dialog (10.3 extension).
- 2026-06-03: Dev — pipeline `changelog.json` in `release-staging.sh` + `version-changelog.sh` helpers; status → review.
- 2026-06-03: Code review — 3 patches applied (SNAPSHOT seed removal on release, OpenAI stderr visible); status → done.

---

### Validation create-story

- [x] Story key resolved from user input (`ops-6-version-changelog-pipeline`)
- [x] Acceptance criteria implementation-oriented and source-anchored (SCP, PLAN, 10.3, OPS-4/5)
- [x] Material 3 section: **UI: N/A**
- [x] Previous story intelligence (OPS-4, OPS-5, 10.3) captured
- [x] Existing files to read/update documented with paths
- [x] Regression risks and non-goals explicit
- [x] Ultimate context engine analysis completed — comprehensive developer guide created
