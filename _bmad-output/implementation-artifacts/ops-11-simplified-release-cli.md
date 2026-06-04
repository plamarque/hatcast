---
baseline_commit: ca85c0339e615cce6acd2f12d4d98140ab838323
---

# OPS-11 — CLI release V2 simplifiée (4 commandes développeur)

**Status:** done

**Story ID:** OPS-11  
**Story key:** `ops-11-simplified-release-cli`  
**Priority:** P0 (DX cutover — débloque l’usage quotidien du pipeline OPS-4/5)  
**PLAN:** [PLAN.md](../../PLAN.md) — Wave V2.0.0, Wave D (OPS)  
**SCP:** [sprint-change-proposal-2026-06-02-v2.0.0-cutover-scope.md](../planning-artifacts/sprint-change-proposal-2026-06-02-v2.0.0-cutover-scope.md)  
**Prérequis :** [ops-4-release-staging-tag-rc.md](ops-4-release-staging-tag-rc.md) (done), [ops-5-prod-deploy-from-semver-tag.md](ops-5-prod-deploy-from-semver-tag.md) (done)  
**Motivation PO :** confusion opérationnelle (branches `v2` / `staging-v2`, tags RC vs prod, `--version=` manuel) — incident cutover `v2.0.0` déjà tagué sur rc.3 alors que rc.4 était visé.

---

## Story

En tant que **développeur HatCast V2**,  
je veux **un workflow release en quatre gestes sans manipuler branches ni tags Git ni numéros de version**,  
afin de **passer de dev → staging (E2E) → release semver → prod** de façon prévisible et reproductible.

---

## Interface cible (contrat développeur)

| Intent | Commande unique | Ce que le script fait (opaque pour l’humain) |
|--------|-----------------|-----------------------------------------------|
| Dev cloud | `git push` | Push sur branche dev (`v2`) → CI `hatcast-v2-dev` (inchangé) |
| Staging + E2E | `./scripts/deploy_staging.sh` | Merge `origin/v2` → `staging-v2`, push, affiche URL Actions / gate smoke |
| Release semver | `./scripts/release_version.sh [--patch\|--minor\|--major]` | Sur `staging-v2` : bump semver (ou RC seul si sans flag), changelog, tag `vX.Y.Z-rc.N`, push branche + tag |
| Prod | `./scripts/deploy_prod.sh` | Détecte le **dernier RC distant** ; crée/pousse tag prod `vX.Y.Z` si absent et aligné ; sinon message actionnable |
| Re-deploy prod | `./scripts/deploy_prod.sh --redeploy` | Re-déclenche le deploy Cloud Run prod pour le tag prod courant (sans réécrire de tag) |

**Règle d’or :** le développeur ne tape jamais `--version=`, `--rc-tag=`, ni `git checkout staging-v2`.

Tous les scripts acceptent `--dry-run` / `-n` et `--help`.

---

## Acceptance Criteria

1. **Given** un arbre Git propre sur la branche dev (`v2`), **when** le développeur exécute `./scripts/deploy_staging.sh`, **then** le script fetch, merge `origin/v2` dans `staging-v2`, push, et affiche le lien CI + rappel « attendre le smoke E2E vert avant release ». Aucun argument de branche requis. [Source: `promote-to-staging.sh` ; DEPLOYMENT_WORKFLOW]

2. **Given** le dernier deploy staging + smoke E2E est vert, **when** le développeur exécute `./scripts/release_version.sh --patch` (ou `--minor` / `--major`), **then** le script checkout `staging-v2` si besoin, calcule automatiquement la prochaine semver à partir des tags distants (`v*.*.*-rc.*`), met à jour `package.json`, `CHANGELOG.md`, `changelog.json`, crée le tag RC, push branche + tag, et affiche « version produit X.Y.Z — tag vX.Y.Z-rc.N ». Sans flag bump : incrémente uniquement le numéro RC de la semver courante. [Source: OPS-4 ; `release-staging.sh`]

3. **Given** un RC distant validé sur staging, **when** le développeur exécute `./scripts/deploy_prod.sh`, **then** le script détecte automatiquement le **dernier** tag `vX.Y.Z-rc.N` sur `origin`, vérifie la lignée `staging-v2`, crée et pousse `vX.Y.Z` sur le même commit si le tag prod n’existe pas encore. [Source: OPS-5 ; `promote-tag-to-prod.sh`]

4. **Given** le tag prod `vX.Y.Z` existe déjà sur un commit **différent** du dernier RC (cas vécu : prod sur rc.3, staging sur rc.4), **when** `./scripts/deploy_prod.sh` est exécuté, **then** le script **refuse** avec un message clair en français du type : « Prod déjà sur v2.0.0 (rc.3). Dernier RC : v2.0.0-rc.4. Lancez `./scripts/release_version.sh --patch` puis redeployez. » — pas de réécriture de tag distant. [Source: incident cutover 2026-06-03]

5. **Given** le tag prod existe et pointe déjà le commit du dernier RC, **when** `./scripts/deploy_prod.sh`, **then** le script indique « déjà promu » et n’échoue pas (idempotent).

6. **Given** besoin de redéployer la prod sans nouveau tag, **when** `./scripts/deploy_prod.sh --redeploy`, **then** le script déclenche un redeploy via `gh workflow run` (ou mécanisme documenté équivalent) sur le tag prod courant, sans modifier Git. [Source: rollback / hotfix infra]

7. **Given** le script legacy V1 `scripts/release-version.sh`, **when** OPS-11 est livré, **then** il est renommé ou clairement séparé (`release-version-v1.sh`) et **`scripts/release_version.sh`** (underscore) est réservé au pipeline V2 — `scripts/README.md` et DEPLOYMENT_WORKFLOW mis à jour.

8. **Given** les scripts bas niveau `scripts/v2/*.sh`, **when** OPS-11 est livré, **then** ils restent implémentation interne (appelés par les façades) ; leur `--help` mentionne la façade ; pas de suppression tant que les tests/docs ne sont pas migrés.

9. **Given** un développeur lit la doc, **when** il ouvre `docs/v2/technical/DEPLOYMENT_WORKFLOW.md`, **then** la section « Quick start développeur » tient en **4 lignes** (push / deploy_staging / release_version / deploy_prod) ; le détail tags/branches est en annexe « comment ça marche sous le capot ».

10. **Given** implémentation terminée, **when** validation, **then** au minimum : `--help` et `--dry-run` OK sur les 3 scripts ; scénario documenté dans Dev Agent Record (promote staging simulé, release patch simulé, deploy prod simulé avec RC fictif).

**Couverture produit :** pipeline ops / DX — pas de feature utilisateur.

---

## Acceptance Criteria — Material 3 (UI)

**UI : N/A** — pas de changement sous `apps/web/`.

---

## Tasks / Subtasks

- [x] **Façades racine** (`scripts/`)
  - [x] `deploy_staging.sh` → wrap `v2/promote-to-staging.sh` + messages UX
  - [x] `release_version.sh` → wrap `v2/release-staging.sh` ; auto-detect semver ; flags `--patch|--minor|--major` uniquement
  - [x] `deploy_prod.sh` → wrap `v2/promote-tag-to-prod.sh` ; auto `--rc-tag` + `--version` depuis tags distants ; `--redeploy`
- [x] **Helpers partagés**
  - [x] `hatcast_latest_remote_rc_tag`, `hatcast_latest_remote_release_tag`, `hatcast_remote_tag_commit` dans `version-changelog.sh`
- [x] **Garde-fous**
  - [x] Message FR si prod tag diverge du dernier RC
  - [x] `release_version.sh` bascule staging-v2 depuis `v2`
- [x] **Legacy V1**
  - [x] `release-version.sh` → délègue `release-version-v1.sh`
- [x] **Documentation**
  - [x] Quick start `DEPLOYMENT_WORKFLOW.md`
  - [x] `scripts/README.md`
  - [x] `PLAN.md` + `sprint-status.yaml`
- [x] **Validation**
  - [x] `--dry-run` deploy_staging, deploy_prod (message rc.3/rc.4)

---

## Dev Notes

### Workflow mental modèle (post-OPS-11)

```
[v2] dev local + git push ──► Cloud Run dev
         │
         ▼
./scripts/deploy_staging.sh ──► staging-v2 + E2E smoke + Cloud Run staging
         │
         ▼ (smoke vert)
./scripts/release_version.sh --patch ──► vX.Y.Z-rc.N (audit)
         │
         ▼
./scripts/deploy_prod.sh ──► tag vX.Y.Z ──► Cloud Run prod (west1)
```

### Ce qui ne change pas (sous le capot)

- Branches : `v2`, `staging-v2` (`scripts/v2/branches.env`)
- CI : `.github/workflows/deploy-v2-cloud-run.yml` (branch push staging ; tag prod `vX.Y.Z`)
- Tags RC **ne déclenchent pas** la CI (audit) — le push `staging-v2` lors de `release_version.sh` déclenche le deploy staging

### Explicit non-goals

- **OPS-7** (rename `v2` → `main`, archive V1) — hors scope ; les scripts continuent de lire `branches.env`
- Refonte du workflow GitHub Actions (tag RC → CI) — reporté sauf si `--redeploy` nécessite un petit `workflow_dispatch` input
- UI admin « bouton release » — hors scope

### Fichiers existants à réutiliser

| Fichier | Rôle |
|---------|------|
| `scripts/v2/promote-to-staging.sh` | Merge dev → staging |
| `scripts/v2/release-staging.sh` | Bump + changelog + tag RC |
| `scripts/v2/promote-tag-to-prod.sh` | Tag prod depuis RC |
| `scripts/v2/lib/git-branches.sh` | Noms de branches |
| `scripts/lib/version-changelog.sh` | Semver, tags RC |

### Dépendances

| Story | Status | Relationship |
|-------|--------|--------------|
| OPS-4 | done | Logique release staging |
| OPS-5 | done | Logique promote prod |
| OPS-7 | backlog | Simplifiera encore les noms de branches plus tard |

---

## Dev Agent Record

*(À remplir à l’implémentation.)*

### Agent Model Used

—

### Completion Notes List

- Façades OPS-11 : `deploy_staging.sh`, `release_version.sh`, `deploy_prod.sh`
- V1 : `release-version-v1.sh` + stub `release-version.sh`
- `deploy_prod.sh --dry-run` valide le message FR rc.3 vs rc.4 (prod déjà taguée)

### File List

- `scripts/deploy_staging.sh`
- `scripts/release_version.sh`
- `scripts/deploy_prod.sh`
- `scripts/release-version.sh` (stub V1)
- `scripts/release-version-v1.sh` (renommé)
- `scripts/lib/version-changelog.sh`
- `scripts/v2/promote-to-staging.sh`, `release-staging.sh`, `promote-tag-to-prod.sh` (help)
- `docs/v2/technical/DEPLOYMENT_WORKFLOW.md`
- `scripts/README.md`
- `PLAN.md`, `_bmad-output/implementation-artifacts/sprint-status.yaml`

### Change Log

- 2026-06-04 : Story créée (retour PO post-cutover — DX release instable).
- 2026-06-04 : Implémentation façades OPS-11 + doc.
- 2026-06-04 : Migration smoke — attentes dérivées des artefacts ; preflight sans POST troupe.

### Review Findings

- [x] [Review][Decision] Message prod/RC divergent — reformulé (option 2) : tag prod « consommé », bump `--patch` → `vX.Y.Z-rc.1` explicite [scripts/deploy_prod.sh]
- [x] [Review][Patch] Rappel smoke E2E après promotion staging [scripts/v2/promote-to-staging.sh]
- [x] [Review][Patch] `.dry-run-sandbox-v2/` ajouté à `.gitignore`
- [x] [Review][Patch] `--force` documenté dans `deploy_prod.sh --help`
- [x] [Review][Defer] `--dry-run` release copie tout le dépôt (~2 min) [scripts/v2/release-staging.sh:105-119] — deferred, pre-existing (pattern OPS-4)

---

### Validation create-story

- [x] AC métier numérotés et sourcés (OPS-4/5, incident cutover)
- [x] **UI : N/A** explicite
- [x] Tasks référencent les scripts existants
- [x] Non-goals OPS-7 explicités
