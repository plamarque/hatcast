---
baseline_commit: 62398f08714d4d966b073e37607f682af8e303ce
---

# OPS-4 — Staging release script (`vX.Y.Z-rc.N` tag on `staging-v2`)

**Status:** done

**Story ID:** OPS-4  
**Story key:** `ops-4-release-staging-tag-rc`  
**Priority:** P0 (V2.0.0 cutover — Wave D)  
**PLAN:** [PLAN.md](../../PLAN.md) § Wave V2.0.0 — Wave D (OPS)  
**SCP:** [sprint-change-proposal-2026-06-02-v2.0.0-cutover-scope.md](../planning-artifacts/sprint-change-proposal-2026-06-02-v2.0.0-cutover-scope.md) § Wave D, target flow  
**Predecessor (patterns):** [ops-2-ci-integration-tests-postgres.md](ops-2-ci-integration-tests-postgres.md) (done) — ops hygiene / CI discipline  
**Related (do not implement here):** **OPS-5** (prod deploy from release tag), **OPS-6** (`changelog.json` pipeline), **OPS-7** (branch cutover)

---

## Story

As a **platform maintainer**,  
I want a **`release-staging.sh` script** that bumps the V2 product version, updates changelogs, commits on **`staging-v2`**, and creates an annotated Git tag **`vX.Y.Z-rc.N`**,  
so that **staging recette is tied to an immutable semver RC** before promoting the same lineage to production (gate **E3** / **v2.0.0**).

---

## Acceptance Criteria

1. **Given** a clean working tree on branch **`staging-v2`** (from `scripts/v2/branches.env`), **when** the operator runs `./scripts/v2/release-staging.sh` (real mode), **then** the script bumps **`package.json` (repo root)** and **`apps/web/package.json`** to the **same** semver, writes **`apps/web/public/version.txt`**, updates **`CHANGELOG.md`** (and **`CHANGELOG_FR.md`** if present), commits on **`staging-v2`**, creates annotated tag **`vX.Y.Z-rc.N`**, and pushes **branch + tag** to `origin`. [Source: SCP § OPS-4; PLAN § Wave D]

2. **Given** the latest staging RC tag on `origin` is e.g. **`v2.0.0-rc.2`**, **when** the operator runs the script with **no** semver bump flag (default), **then** the new tag is **`v2.0.0-rc.3`** (increment **`N`** only) and the committed product version is **`2.0.0`** (no `-rc.N` suffix in `package.json` / first line of `version.txt` — RC is tag-only). [Source: semver pre-release convention]

3. **Given** the operator passes **`--patch`**, **`--minor`**, **`--major`**, or **`--version=X.Y.Z`**, **when** the script runs after an existing RC lineage, **then** it bumps the **base** semver accordingly and resets the RC counter to **`rc.1`** (e.g. `v2.0.0-rc.5` + `--patch` → product **`2.0.1`**, tag **`v2.0.1-rc.1`**). [Source: PLAN target flow]

4. **Given** **`--dry-run`** / **`-n`**, **when** the script runs, **then** it uses the same sandbox pattern as [`release-production.sh`](../../scripts/v2/release-production.sh) (`.dry-run-sandbox-v2`, `dry-run-staging-v2-*` branches) and prints planned version, tag, commit range, and git commands **without** pushing to `origin`. [Source: existing V2 release UX]

5. **Given** **`apps/web/public/version.txt`** or package versions contain a **`-SNAPSHOT`** suffix (current tree: `2.0.0-SNAPSHOT`), **when** the operator has not passed **`--version=`**, **then** the script either (a) derives the base from the latest **`v*.*.*-rc.*`** tag on `origin`, or (b) exits with a clear French/English message requiring **`--version=X.Y.Z`** for the first RC of a new line — **no silent** release with `-SNAPSHOT` left in tagged artifacts. [Source: `version.txt` today; cutover **v2.0.0**]

6. **Given** root and `apps/web` **`package.json` versions diverge**, **when** bumping, **then** the script **fails fast** (same guard as `assert_package_versions_match` in `release-production.sh`) or aligns web to root once with a logged message before bump — **never** commit mismatched versions. [Source: DEPLOYMENT_WORKFLOW.md § Versioning]

7. **Given** the script completes (real mode), **when** the operator checks GitHub Actions, **then** the existing **push on `staging-v2`** still triggers **Deploy V2 (Cloud Run)** + **E2E smoke gate** (no regression vs today). Document that **tag-only deploy** is **OPS-5** scope. [Source: `.github/workflows/deploy-v2-cloud-run.yml`; SCP § CI tags]

8. **Given** OPS-4 is **done**, **when** maintainers read docs, **then** [`scripts/README.md`](../../scripts/README.md) lists `release-staging.sh`, and [`docs/v2/technical/DEPLOYMENT_WORKFLOW.md`](../../docs/v2/technical/DEPLOYMENT_WORKFLOW.md) has a **« Staging RC release »** section (command, prerequisites, RC tag rules, relation to `promote-to-staging.sh` → `release-staging.sh` → recette). Full tag-based prod flow wording may stay minimal until **OPS-5**. [Source: SCP § Artifact conflicts]

9. **Given** implementation touches shared bash, **when** `./scripts/v2/release-staging.sh --help` and **`--dry-run`** are executed on the current branch, **then** both succeed without error (smoke validation). [Source: repo norms]

**Product coverage:** V2.0.0 release pipeline (PLAN / SCP) — not a SPEC end-user feature.

---

## Acceptance Criteria — Material 3 (UI)

**UI : N/A** — no changes under `apps/web/`; bash scripts and documentation only.

---

## Tasks / Subtasks

- [x] **Scope:** `scripts/v2/`, `scripts/lib/version-changelog.sh`, `scripts/README.md`, `docs/v2/technical/DEPLOYMENT_WORKFLOW.md` — **no** Angular/API runtime code; **no** `.github/workflows` changes (OPS-5).
- [x] **AC1–AC3** — Create [`scripts/v2/release-staging.sh`](../../scripts/v2/release-staging.sh):
  - [x] Source `lib/git-branches.sh` + `../lib/version-changelog.sh` (same as `release-production.sh`).
  - [x] `hatcast_v2_assert_branch` → **`HATCAST_V2_BRANCH_STAGING`**; `hatcast_v2_assert_clean`; `hatcast_v2_fetch`.
  - [x] Resolve **current base semver** + **next RC** (helpers in `version-changelog.sh` preferred for OPS-5/6 reuse):
    - `git tag -l 'v*.*.*-rc.*' --sort=-v:refname` on `origin` (or document equivalent sort).
    - Parse `vMAJOR.MINOR.PATCH-rc.N`.
  - [x] Reuse / extract from `release-production.sh`: `align_web_package_version_to_root`, `assert_package_versions_match`, `bump_both_package_json`, `write_version_txt` (staging build line: e.g. `Staging RC build - DATE` instead of `Production build`).
  - [x] Changelog: `hatcast_generate_changelog_md` with range from **previous RC tag** `vX.Y.Z-rc.(N-1)` or last **non-RC** tag if `rc.1`; skip `chore(v2):` bump commits (already in `version-changelog.sh`).
  - [x] Commit: `chore(v2): release staging vX.Y.Z-rc.N`; tag: `vX.Y.Z-rc.N`; push `origin staging-v2` + tag.
  - [x] CLI: `--dry-run|-n`, `--patch|--minor|--major`, `--version=X.Y.Z`, `--help|-h`.
- [x] **AC4** — Dry-run sandbox: mirror `create_dry_run_sandbox` / `cleanup_dry_run_sandbox` from `release-production.sh` (reuse functions or factor minimal shared snippet in `scripts/v2/lib/` only if it reduces duplication without scope creep).
- [x] **AC5** — Explicit first-line cutover path: document `git checkout staging-v2 && ./scripts/v2/release-staging.sh --version=2.0.0` for first `v2.0.0-rc.1` when tree still has `2.0.0-SNAPSHOT`.
- [x] **AC7** — Dev Notes + DEPLOYMENT_WORKFLOW: staging deploy still **branch push**; RC tag is audit trail until OPS-5.
- [x] **AC8** — Update `scripts/README.md` § Déploiement V2; DEPLOYMENT_WORKFLOW § Staging RC + update mermaid note (`release-staging.sh` between promote and prod).
- [x] **AC9** — Manual smoke: `--help`, `--dry-run --patch` from clean tree.
- [x] **PLAN.md** — Set **OPS-4** status `[x]` when story done (dev-story / review).
- [x] **sprint-status.yaml** — `ops-4-release-staging-tag-rc: done` after code review (not in this story file edit).

### Review Findings

- [x] [Review][Patch] RC base can drift to wrong lineage when multiple RC streams exist [`scripts/lib/version-changelog.sh:64`]
- [x] [Review][Patch] Changelog range for `rc.1` is not constrained to an ancestor tag of `HEAD` [`scripts/lib/version-changelog.sh:148`]
- [x] [Review][Patch] Missing strict semver validation for `--version=X.Y.Z` allows invalid tags [`scripts/lib/version-changelog.sh:115`]
- [x] [Review][Patch] `--version` and bump flags are not mutually exclusive (implicit precedence) [`scripts/v2/release-staging.sh:51`]
- [x] [Review][Patch] Product version hint prioritizes `version.txt` over `apps/web/package.json` and can be stale [`scripts/v2/release-staging.sh:118`]
- [x] [Review][Defer] Story tracking inconsistency (`PLAN.md` marks OPS-4 done while sprint status remains review) [`PLAN.md:462`] — deferred, pre-existing

---

## Dev Notes

### Problem statement

Today the V2 staging path is:

1. `./scripts/v2/promote-to-staging.sh` — merge `v2` → `staging-v2` + push → CI deploy  
2. `./scripts/v2/release-production.sh` — **only** for prod: version bump, merge → `production-v2`, tag **`vX.Y.Z`** (no `-rc`)

There is **no** `release-staging.sh`. Staging recette for **v2.0.0** needs **immutable RC tags** (`v2.0.0-rc.1`, …) on `staging-v2` before **OPS-5** promotes the **same semver** to prod (`v2.0.0`).

### Target operator flow (after OPS-4)

```
v2 → promote-to-staging.sh → release-staging.sh → tag vX.Y.Z-rc.N → (push staging-v2 → CI deploy)
→ recette on staging → OPS-5: promote same semver to prod tag
```

### Current version state (2026-06-03 — do not assume without re-read)

| File | Typical value today |
|------|---------------------|
| `package.json` (root) | `0.47.1` (monorepo legacy — may need alignment to `2.x` before first V2 RC; script must not blindly tag `0.47.1-rc.1`) |
| `apps/web/package.json` | `2.0.0-SNAPSHOT` |
| `apps/web/public/version.txt` | `2.0.0-SNAPSHOT` |

**Implementer rule:** For V2 staging releases, treat **`apps/web/package.json`** + **`version.txt`** as the **product semver source** when no RC tags exist; consider a one-time operator step to set root `package.json` to **`2.0.0`** before first `v2.0.0-rc.1` OR extend `align_web_package_version_to_root` to prefer **web → root** when root looks like legacy `0.x` (document choice in script `--help`). **Do not** ship a script that tags `v0.47.1-rc.1` for a V2 cutover.

### Technical guardrails

| Topic | Action |
|--------|--------|
| Reuse | `scripts/v2/lib/git-branches.sh`, `scripts/lib/version-changelog.sh`, copy patterns from `release-production.sh` |
| Do **not** | Merge `production-v2`, call `release-production.sh`, or change `deploy-v2-cloud-run.yml` triggers |
| Do **not** | Use `scripts/release-version.sh` (V1 Firebase / `staging` → `main`) |
| Do **not** | Generate `apps/web/public/changelog.json` (**OPS-6**) — optional manual seed bump only if PO asks |
| Tags | Annotated tags; `git push origin vX.Y.Z-rc.N` |
| Idempotency | Refuse to run if tag already exists locally/remotely |
| Commits | Conventional Commits: `chore(v2): release staging vX.Y.Z-rc.N` |
| French UX | Operator-facing echoes may stay French (match `promote-to-staging.sh`) |

### Reference files (READ before coding)

| File | Role |
|------|------|
| [`scripts/v2/release-production.sh`](../../scripts/v2/release-production.sh) | **Primary template** — bump, changelog, dry-run sandbox, tag push |
| [`scripts/v2/promote-to-staging.sh`](../../scripts/v2/promote-to-staging.sh) | Pre-step merge; return to dev branch after promote |
| [`scripts/lib/version-changelog.sh`](../../scripts/lib/version-changelog.sh) | `hatcast_bump_semver`, `hatcast_generate_changelog_md`, package version helpers |
| [`scripts/v2/lib/git-branches.sh`](../../scripts/v2/lib/git-branches.sh) | Branch names, fetch, clean, Actions URL |
| [`docs/v2/technical/DEPLOYMENT_WORKFLOW.md`](../../docs/v2/technical/DEPLOYMENT_WORKFLOW.md) | Update staging section |
| [`.github/workflows/deploy-v2-cloud-run.yml`](../../.github/workflows/deploy-v2-cloud-run.yml) | Still `push` branches `[v2, staging-v2, production-v2]` — AC7 |
| [`_bmad-output/implementation-artifacts/10-3-version-app-changelog-dialog.md`](10-3-version-app-changelog-dialog.md) | `version.txt` contract; OPS-6 owns `changelog.json` |

### Suggested RC resolution algorithm (implement exactly or equivalent)

```bash
# Latest RC on origin (example)
# v2.0.0-rc.3 → base=2.0.0, rc=3

# Default (no bump flag): next tag v2.0.0-rc.4, product version 2.0.0

# --patch: v2.0.1-rc.1

# No RC tags, version.txt 2.0.0-SNAPSHOT, no --version:
#   → exit 1 with message: pass --version=2.0.0 for first RC
```

### `write_version_txt` staging variant

Mirror production format; first line = **base semver** (e.g. `2.0.0`); second line e.g. `Staging RC build - 2026-06-03` (not `Production build`).

### Explicit non-goals

- **OPS-5:** CI on tag `v*.*.*` / `v*.*.*-rc.*`, prod deploy without `production-v2` branch  
- **OPS-6:** Automate `changelog.json` from git commits  
- **OPS-7:** Branch renames (`staging-v2` → `staging`)  
- **OPS-8:** `hatcast.app` domain / region  
- Rewriting [`release-production.sh`](../../scripts/v2/release-production.sh) to use RC tags (prod stays **`vX.Y.Z`** until OPS-5 redesign)

### Dependencies

| Story / item | Status | Relationship |
|--------------|--------|--------------|
| `promote-to-staging.sh` | exists | Run **before** first RC if `v2` commits not yet on `staging-v2` |
| **OPS-5** | backlog | Consumes RC tags for prod promotion |
| **OPS-6** | backlog | Extends both release scripts for `changelog.json` |
| **10.3** | done | UI reads `version.txt`; keep first line = semver |
| **E3** gate | open | Needs validated `v2.0.0-rc.*` on staging before prod `v2.0.0` |

### Previous story intelligence (OPS-2)

- Ops stories are **script + doc + CI awareness**; no Gradle/Angular tests required unless behavior changes.
- Prefer **documented** manual smoke (`--dry-run`) over skipping validation.
- Do not weaken CI or skip hooks.

### Git intelligence (recent work)

Recent commits are feature-focused (`feat(share)`, `feat(web)` auth/account). No conflicting release-script work — safe to add `release-staging.sh` alongside stable `release-production.sh`.

### Architecture compliance

- **ARCH.md** / **ADR-0009:** Staging Neon + GitHub env `staging` unchanged; this story only adds Git tagging discipline on `staging-v2`.
- **AGENTS.md:** No Firestore/production data changes.

### Testing requirements

| Check | Command |
|-------|---------|
| Help | `./scripts/v2/release-staging.sh --help` |
| Dry-run | `git checkout staging-v2 && ./scripts/v2/release-staging.sh --dry-run` (or sandbox from current branch per dry-run design) |
| No API/web tests | N/A |

### Project context reference

See [project-context.md](../../project-context.md) — commits English Conventional Commits; scope discipline; no invented features.

---

## Dev Agent Record

### Agent Model Used

Composer (Cursor agent)

### Completion Notes List

- Created `scripts/v2/release-staging.sh` — staging RC release with annotated tags `vX.Y.Z-rc.N`, branch push to `staging-v2`, dry-run sandbox.
- Extended `scripts/lib/version-changelog.sh` with RC helpers (`hatcast_latest_rc_tag`, `hatcast_parse_rc_tag`, `hatcast_resolve_staging_rc_release`, `hatcast_staging_changelog_range`) for OPS-5/6 reuse.
- AC5: refuses silent release when `-SNAPSHOT` and no RC tags without `--version=X.Y.Z`.
- AC6: aligns legacy root `0.x` to web V2 semver before bump; fails fast on other mismatches.
- Updated `scripts/README.md`, `DEPLOYMENT_WORKFLOW.md` (new § Staging RC release, mermaid), `PLAN.md` (OPS-4 done).
- Smoke: `--help` OK; `--dry-run --version=2.0.0` OK; SNAPSHOT guard verified; `--dry-run --patch` OK (sandbox).
- **Recette manuelle (2026-06-03):** release réelle `v2.0.0-rc.1` (`447518c4`); CI [26888840696](https://github.com/plamarque/hatcast/actions/runs/26888840696) smoke 4/4 + deploy `hatcast-v2-staging` vert; UI Mon compte → À propos affiche `2.0.0` (attendu — RC tag-only).

### File List

- `scripts/v2/release-staging.sh` (new)
- `scripts/lib/version-changelog.sh` (extend — RC helpers)
- `scripts/README.md`
- `docs/v2/technical/DEPLOYMENT_WORKFLOW.md`
- `PLAN.md` (OPS-4 status)
- `_bmad-output/implementation-artifacts/ops-4-release-staging-tag-rc.md`

### Change Log

- 2026-06-03 : Story created (`bmad-create-story` OPS-4) — ready-for-dev
- 2026-06-03 : Implemented release-staging.sh + RC helpers + docs (dev-story OPS-4) — review
- 2026-06-03 : Recette manuelle OK — tag `v2.0.0-rc.1`, CI staging vert, story closed **done**

---

### Validation create-story

- [x] AC métier numérotés et sourcés (SCP / PLAN)
- [x] Section **Material 3** = **UI : N/A**
- [x] Tasks référencent les AC
- [x] Liens vers fichiers code existants à réutiliser
- [x] Tests : smoke `--help` / `--dry-run` documentés
- [x] Ultimate context engine analysis completed — comprehensive developer guide created
