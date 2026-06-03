---
baseline_commit: b8816ef9cf9497a81f28b317434610a89a0aa3bf
---

# OPS-5 — Prod deploy from semver tag (no dedicated prod branch)

**Status:** done

**Story ID:** OPS-5  
**Story key:** `ops-5-prod-deploy-from-semver-tag`  
**Priority:** P0 (V2.0.0 cutover - Wave D)  
**PLAN:** [PLAN.md](../../PLAN.md) - Wave V2.0.0 - Wave D (OPS)  
**SCP:** [sprint-change-proposal-2026-06-02-v2.0.0-cutover-scope.md](../planning-artifacts/sprint-change-proposal-2026-06-02-v2.0.0-cutover-scope.md) - Wave D  
**Previous story:** [ops-4-release-staging-tag-rc.md](ops-4-release-staging-tag-rc.md) (done)  
**Related (do not fully implement here):** OPS-6 (`changelog.json` coupling), OPS-7 (branch cutover), OPS-8 (`hatcast.app` domain cutover)

---

## Story

As a **platform maintainer**,  
I want **production deploy to be triggered from a validated semver tag lineage** (`vX.Y.Z` / `vX.Y.Z-rc.N`) without relying on a long-lived `production-v2` branch,  
so that **the exact artifact validated on staging is promoted to production with immutable traceability** and less branch-management risk.

---

## Acceptance Criteria

1. **Given** a validated RC lineage on staging (`vX.Y.Z-rc.N`) created by OPS-4, **when** the maintainer promotes to production, **then** the flow produces or uses a prod semver tag **`vX.Y.Z`** tied to the same commit lineage and deploys that tag artifact to Cloud Run production. No manual merge to `production-v2` is required. [Source: PLAN Wave D; SCP Wave D]

2. **Given** GitHub Actions configuration, **when** a tag matching `v*.*.*` (and optionally `v*.*.*-rc.*` for staging/tag smoke) is pushed, **then** the deploy workflow supports tag-triggered execution and resolves target environment explicitly (staging/prod) without ambiguity. [Source: SCP technical impact; DEPLOYMENT_WORKFLOW current gap]

3. **Given** production deploy is tag-driven, **when** deploy runs, **then** the image/artifact metadata and logs expose the deployed tag (`vX.Y.Z`) for auditability and rollback decisions. [Source: release governance objective]

4. **Given** operator tooling under `scripts/v2/`, **when** promoting a validated release candidate, **then** there is a deterministic script path (dry-run + real mode) that:
   - verifies clean tree and remote refs,
   - verifies RC existence/lineage for target semver,
   - creates or validates prod tag policy,
   - pushes only the necessary tag(s),
   - prints clear next-step links (Actions URL, expected workflow). [Source: OPS-4 patterns]

5. **Given** rollback needs, **when** maintainers need to redeploy previous stable version, **then** docs define rollback using prior semver tag redeploy (no history rewrite, no force push) and align with current Cloud Run rollback guidance. [Source: DEPLOYMENT_WORKFLOW rollback section]

6. **Given** OPS-5 lands, **when** maintainers read docs, **then** `docs/v2/technical/DEPLOYMENT_WORKFLOW.md` and `scripts/README.md` document the new tag-first prod flow and mark `production-v2` branch flow as legacy/deprecated (or transitional), with explicit relation to OPS-4 and OPS-6. [Source: SCP artifact conflicts]

7. **Given** branch/environment guards in scripts and workflow, **when** invalid inputs occur (missing RC lineage, tag already exists, mismatched semver, wrong branch context), **then** execution fails fast with actionable errors and no partial deploy side effects. [Source: OPS-4 guardrail patterns]

8. **Given** implementation is complete, **when** running smoke checks (`--help`, dry-run, and at least one controlled tag-path validation), **then** all checks succeed and are captured in Dev Agent Record with commands/results. [Source: repo ops norms]

**Product coverage:** release pipeline hardening for V2 cutover; not an end-user feature.

---

## Acceptance Criteria — Material 3 (UI)

**UI: N/A** — no user-facing Angular UI changes are required for OPS-5 core scope.

---

## Tasks / Subtasks

- [x] **Scope and boundaries**
  - [x] Limit implementation to release/deploy pipeline artifacts: `scripts/v2/`, `.github/workflows/`, deployment docs, and story tracking files.
  - [x] Do not include OPS-6 feature work (`changelog.json` generation coupling) except required compatibility notes.

- [x] **Tag-driven deploy workflow**
  - [x] Update `.github/workflows/deploy-v2-cloud-run.yml` to support tag-triggered deploy path for semver tags.
  - [x] Ensure environment selection and service target remain explicit and safe (`development` unchanged, `staging` and `production` deterministic).
  - [x] Preserve existing smoke/E2E gating expectations where applicable.

- [x] **Promotion script path**
  - [x] Add or adapt a script under `scripts/v2/` (for example `promote-tag-to-prod.sh`) with `--dry-run`, `--help`, and strict guards.
  - [x] Reuse helpers from `scripts/v2/lib/git-branches.sh` and `scripts/lib/version-changelog.sh` where possible.
  - [x] Enforce lineage checks: `vX.Y.Z` must correspond to validated `vX.Y.Z-rc.N` branch/tag ancestry policy.

- [x] **Docs and runbooks**
  - [x] Update `docs/v2/technical/DEPLOYMENT_WORKFLOW.md` flow diagram and operator commands for tag-first prod.
  - [x] Update `scripts/README.md` with new script usage and safety checks.
  - [x] Clarify transitional status for `release-production.sh` / `production-v2` flow until OPS-7 cleanup.

- [x] **Validation and evidence**
  - [x] Run CLI smoke checks for new/updated scripts (`--help`, dry-run).
  - [x] Provide one end-to-end simulated promotion example from an existing RC lineage.
  - [x] Record command outputs and expected GitHub Actions run in Dev Agent Record.

- [x] **Tracking**
  - [x] Keep `PLAN.md` status for OPS-5 aligned after completion.
  - [x] Set `sprint-status.yaml` `ops-5-prod-deploy-from-semver-tag` to `done` only after implementation + review.

### Review Findings

- [x] [Review][Patch] Durcir la classification des tags semver/RC dans le workflow pour eviter toute promotion prod de prerelease non RC [`.github/workflows/deploy-v2-cloud-run.yml`]
- [x] [Review][Patch] Valider la lineage RC cote script (tag RC present sur origin + commit ancetre de `origin/staging-v2`) avant creation/push du tag prod [scripts/v2/promote-tag-to-prod.sh:95]
- [x] [Review][Patch] Aligner la documentation GitHub Environment `production` avec le flux tag-first (autoriser explicitement les tags semver) [docs/v2/technical/DEPLOYMENT_WORKFLOW.md:256]
- [x] [Review][Patch] Documenter un rollback operatoire par redeploiement d'un tag stable precedent `vX.Y.Z` (sans rewrite) [docs/v2/technical/DEPLOYMENT_WORKFLOW.md:Rollback]
- [x] [Review][Patch] Completer les preuves AC8 avec une validation controlee du chemin tag (`vX.Y.Z-rc.N`/`vX.Y.Z` -> env cible) dans le Dev Agent Record [_bmad-output/implementation-artifacts/ops-5-prod-deploy-from-semver-tag.md:184]
- [x] [Review][Defer] Fragilite preexistante de la construction `--set-env-vars` CSV (`gcloud run deploy`) si valeurs avec virgule/egal, non introduite par OPS-5 [`.github/workflows/deploy-v2-cloud-run.yml`] — deferred, pre-existing

---

## Dev Notes

### Why this story exists now

OPS-4 created immutable RC tags on `staging-v2`. OPS-5 is the missing piece that turns this into a full tag-governed release model for production, removing dependency on a dedicated prod branch as the deployment trigger.

### Current state (must be read before coding)

- Current docs still describe prod deploy via `production-v2` and `release-production.sh`.
- OPS-4 is done and provides reusable RC/tag helpers and script conventions.
- `sprint-status.yaml` still marks OPS-5 as backlog before this story creation.

### Required code/doc touchpoints

- `.github/workflows/deploy-v2-cloud-run.yml` (tag trigger + env resolution)
- `scripts/v2/release-production.sh` (may be adapted or partially superseded)
- `scripts/v2/` (new promotion script likely)
- `scripts/v2/lib/git-branches.sh`
- `scripts/lib/version-changelog.sh`
- `docs/v2/technical/DEPLOYMENT_WORKFLOW.md`
- `scripts/README.md`
- Optional references: `docs/shared/technical/BRANCH_ENVIRONMENTS.md` if branch model wording changes

### Architecture and operations guardrails

- Keep deploy targets and branch/environment mapping explicit; no implicit production deploy from non-semver tags.
- No destructive git operations in scripts (no force-push, no history rewrite).
- Preserve local/dev/staging workflows (`v2` and `staging-v2`) while introducing tag-based prod.
- Ensure idempotency: re-running dry-run or validation commands should be safe.
- Do not change runtime app behavior under `apps/web` or `services/api`.

### Regression risks to prevent

- Accidental production deploy from wrong tag pattern.
- Divergence between tag lineage and validated staging candidate.
- Breaking existing staging deploy pipeline while adding tag triggers.
- Silent fallback to deprecated branch flow without operator visibility.

### Previous story intelligence (OPS-4)

- Reuse existing helper patterns rather than duplicating semver/tag parsing logic.
- Keep operator UX explicit (French-friendly console messages are acceptable in scripts).
- Document dry-run behavior clearly and keep it trustworthy.
- Always pair script changes with docs updates in same story scope.

### Git intelligence (recent commits)

- `docs(ops): Close OPS-4 after manual recette`
- `ops(v2): Add staging RC release script`
- `feat(share): Complete story 6.15 M3 announce dialogs`
- `fix(auth): Apply story 1.7 code review fixes`
- `fix(auth): Apply story 1.6 code review fixes`

Release pipeline files changed recently in OPS-4; preserve conventions introduced there.

### Testing requirements

- Script CLI smoke:
  - `./scripts/v2/<new-or-updated-script>.sh --help`
  - `./scripts/v2/<new-or-updated-script>.sh --dry-run ...`
- Workflow sanity:
  - YAML validation and trigger-path reasoning for tags
- Optional controlled execution:
  - Use non-production safe context for first tag-flow validation

### Non-goals

- Full branch cutover/renaming (OPS-7).
- PostHog/email domain ops tracks (OPS-9/OPS-10).
- UI feature changes.

### Project context reference

See [project-context.md](../../project-context.md), [AGENTS.md](../../AGENTS.md), and deployment docs under `docs/v2/technical/`.

---

## Dev Agent Record

### Agent Model Used

Codex 5.3

### Completion Notes List

- Added `scripts/v2/promote-tag-to-prod.sh` (OPS-5) with strict semver/RC lineage checks, dry-run mode, and safe tag handling (no remote tag rewrite).
- Updated `.github/workflows/deploy-v2-cloud-run.yml` to support tag-triggered deploys:
  - RC tags (`vX.Y.Z-rc.N`) target `staging` with E2E smoke gate.
  - Release tags (`vX.Y.Z`) target `production`.
  - Explicit deployment context logging for auditability.
- Updated `docs/v2/technical/DEPLOYMENT_WORKFLOW.md` to document tag-first production flow and legacy/transitional status of `release-production.sh`.
- Updated `scripts/README.md` with new OPS-5 script entry.
- Validation executed:
  - `bash -n scripts/v2/promote-tag-to-prod.sh`
  - `./scripts/v2/promote-tag-to-prod.sh --help`
  - `./scripts/v2/promote-tag-to-prod.sh --version=2.0.0 --rc-tag=v2.0.0-rc.invalid --dry-run` (expected fail-fast: invalid RC format)
  - deploy workflow ref-classification hardened (`classify-ref`): only `vX.Y.Z` and `vX.Y.Z-rc.N` tags are accepted

### File List

- `.github/workflows/deploy-v2-cloud-run.yml` (updated)
- `scripts/v2/promote-tag-to-prod.sh` (new)
- `docs/v2/technical/DEPLOYMENT_WORKFLOW.md` (updated)
- `scripts/README.md` (updated)
- `_bmad-output/implementation-artifacts/ops-5-prod-deploy-from-semver-tag.md` (updated)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (status update)

### Change Log

- 2026-06-03: Story created via `bmad-create-story` command - status `ready-for-dev`.
- 2026-06-03: Implemented OPS-5 tag-first deploy flow (workflow + script + docs) - status `review`.
- 2026-06-03: Applied code-review fixes (strict tag classification, RC lineage guardrails, docs rollback/env policy) - status `done`.

---

### Validation create-story

- [x] Story key resolved from sprint backlog (`ops-5-prod-deploy-from-semver-tag`)
- [x] Acceptance criteria are implementation-oriented and source-anchored
- [x] Material 3 section included with `UI: N/A`
- [x] Previous story intelligence (OPS-4) captured
- [x] Git intelligence and guardrails included
- [x] Ultimate context engine analysis completed - comprehensive developer guide created
