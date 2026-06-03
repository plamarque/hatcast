---
baseline_commit: b8816ef9cf9497a81f28b317434610a89a0aa3bf
---

# Story OPS-8 : Prod custom domain `hatcast.app`

Status: in-progress

**Story ID:** OPS-8  
**Story key:** `ops-8-prod-domain-hatcast-app`  
**Priority:** P0 (V2.0.0 — gate **M4**)  
**PLAN:** [PLAN.md](../../PLAN.md) § Wave V2.0.0 — Wave F  
**SCP:** [sprint-change-proposal-2026-06-02-v2.0.0-cutover-scope.md](../planning-artifacts/sprint-change-proposal-2026-06-02-v2.0.0-cutover-scope.md) § 4.2 Wave F + amendement 2026-06-03  
**Runbook:** [DEPLOY_V2_CLOUD_RUN.md](../../docs/v2/technical/DEPLOY_V2_CLOUD_RUN.md) §7  
**Related stories (not in scope):** [ops-9-posthog-hatcast-app.md](ops-9-posthog-hatcast-app.md), [ops-10-email-hatcast-app.md](ops-10-email-hatcast-app.md)

## Story

As a **platform maintainer**,  
I want to **serve production from `https://hatcast.app` (Cloudflare proxied) backed by Cloud Run in `europe-west1`**,  
so that **V2 cutover M4 runs on a canonical branded domain with OAuth/CORS/PWA working end-to-end without impacting staging or cloud dev**.

## Acceptance Criteria

1. **Given** GitHub environment `production`, **when** deploy runs from `production-v2`, **then** Cloud Run service `hatcast-v2` is deployed in region `europe-west1` and image registry is `europe-west1-docker.pkg.dev/...`. [Source: SCP Wave F; DEPLOY_V2_CLOUD_RUN §7.1]
2. **Given** custom domain mapping target `hatcast.app`, **when** DNS records are created in Cloudflare, **then** mapping reaches **Active**, certificate is provisioned, and Cloudflare mode is switched from grey cloud to proxied orange with SSL/TLS `Full (strict)`. [Source: SCP §7 amendment; DEPLOY_V2_CLOUD_RUN §7.2]
3. **Given** production origin `https://hatcast.app`, **when** user signs in with Google and calls API `/v1/*`, **then** there is no `origin_mismatch` or CORS error because OAuth JS origin, Firebase authorized domain, and `HATCAST_CORS_ALLOWED_ORIGINS` are aligned. [Source: DEPLOY_V2_CLOUD_RUN §4.3, §7.3]
4. **Given** production deployment is complete, **when** `BASE_URL=https://hatcast.app ./scripts/check-pwa.sh` is executed, **then** smoke passes (or explicit waiver is documented in completion notes). [Source: SCP Wave F AC; DEPLOY_V2_CLOUD_RUN §7.3]
5. **Given** this story is implemented, **when** staging and cloud dev are verified, **then** `hatcast-v2-staging` and `hatcast-v2-dev` remain in `europe-west9` with working `*.run.app` URLs and unchanged CI flow. [Source: PLAN Wave F; SCP §7 amendment]
6. **Given** cutover readiness review (M4 gate), **when** ops validates production route, **then** IAM public invoker and cache policy bypass for `/v1/*` and `/actuator/*` are confirmed for `hatcast.app`. [Source: DEPLOY_V2_CLOUD_RUN §4.1, §7.2]

**Couverture produit :** Wave V2.0.0 (ops/cutover), pas de nouveau besoin SPEC utilisateur final.

---

## Acceptance Criteria — Material 3 (UI)

**UI : N/A** — pas de changement sous `apps/web/`; scope infra/deploy/DNS/configuration.

---

## Tasks / Subtasks

- [x] **Scope:** `docs/v2/technical/`, `.github` environments/secrets, GCP Cloud Run/Artifact Registry, Cloudflare DNS/TLS/cache — sans refactor UI/API métier.
- [ ] **AC1** — Configurer l’environnement GitHub `production`: `GCP_REGION=europe-west1`, `GCP_ARTIFACT_REGISTRY` en west1, `HATCAST_CORS_ALLOWED_ORIGINS=https://hatcast.app`.
- [ ] **AC1** — Vérifier existence du repository Artifact Registry `europe-west1` et permissions du service account CI.
- [ ] **AC1 + AC5** — Déployer `hatcast-v2` en `europe-west1` tout en laissant `hatcast-v2-staging` / `hatcast-v2-dev` inchangés en `europe-west9`.
- [ ] **AC2** — Configurer domain mapping Cloud Run `hatcast.app`, Search Console si requis, DNS Cloudflare (phase grey -> cert Active -> orange).
- [ ] **AC6** — Valider IAM `roles/run.invoker` pour `allUsers` et règles cache Cloudflare bypass `/v1/*` + `/actuator/*`.
- [ ] **AC3** — Mettre à jour OAuth Authorized JavaScript origins + Firebase/Identity Platform authorized domains avec `hatcast.app`.
- [ ] **AC3** — Vérifier `GET /v1/auth/me` post-login Google sans erreurs CORS/origin mismatch.
- [ ] **AC4** — Exécuter `BASE_URL=https://hatcast.app ./scripts/check-pwa.sh` et journaliser le résultat dans la completion note.
- [ ] **AC5** — Smoke staging/dev cloud (`*.run.app`) après bascule prod ; documenter absence de régression.
- [x] **Docs** — Mettre à jour `DEPLOY_V2_CLOUD_RUN.md` seulement si des étapes opératoires divergent de la section §7 existante.

## Dev Notes

### Product and UX rules

- Story purement ops; ne pas introduire de changement fonctionnel FR/UX.
- M4 dépend explicitement de cette story dans `PLAN.md` (gate V2.0.0).
- Les stories OPS-9 et OPS-10 restent post-M4 (P1).

### Explicit non-goals

- Migration région de `hatcast-v2-staging` ou `hatcast-v2-dev`.
- Implémentation PostHog (`OPS-9`) et e-mail branding domaine (`OPS-10`).
- Changement de stratégie release tags (`OPS-4..7` gérés séparément).

### Dependencies

| Story | Status | Relationship |
|-------|--------|--------------|
| OPS-4 | done | Pipeline staging RC disponible, non bloquant pour mapping domaine |
| OPS-5 | backlog | Promotion prod tag-based, complémentaire à OPS-8 |
| OPS-6 | backlog | Synchronisation version/changelog, non requis pour DNS/domain mapping |
| OPS-7 | backlog | Exécuté après M4, pas prérequis OPS-8 |

### Architecture compliance

- Conserver architecture couplée Cloud Run + Neon décrite dans `ARCH.md` et `DEPLOY_V2_CLOUD_RUN.md`.
- Respecter la séparation environnements (`development`, `staging`, `production`) et ne pas mélanger secrets.
- Ne pas modifier le runtime applicatif en dehors des variables d’environnement nécessaires au domaine prod.

### File structure requirements

- Story ops: modifications attendues principalement dans docs ops/runbook et éventuels scripts de support, pas dans `apps/web/` ni logique métier `services/api/`.
- Toute commande manuelle utilisée pour la recette doit être reproductible depuis les runbooks.

### Testing requirements

- Vérification login Google + appel `/v1/auth/me` sur `https://hatcast.app`.
- Vérification PWA smoke: `BASE_URL=https://hatcast.app ./scripts/check-pwa.sh`.
- Vérification non-régression staging/dev cloud (au moins ouverture app + auth smoke).

### Previous story intelligence (OPS)

- OPS-4 a confirmé le pattern attendu: story ops = scripts/docs + validations manuelles explicites.
- Garder une checklist orientée exploitabilité et auditabilité (prérequis, commandes, résultat attendu).

### Git intelligence summary

- Commits récents indiquent une séquence active OPS (`OPS-4` clos) et stories auth/UI déjà stabilisées.
- Aucun conflit structurel identifié avec une évolution domaine prod en parallèle.

### Project context reference

- Voir `project-context.md` (scope discipline, commits Conventional Commits, pas de features inventées).

## Dev Agent Record

### Agent Model Used

Codex 5.3

### Completion Notes List

- Story contextualisée et alignée avec PLAN/SCP/runbook pour exécution ops.
- Story passée en `in-progress` avec `baseline_commit` renseigné.
- CI V2 renforcée pour OPS-8: région par défaut branch-aware (`production-v2` en `europe-west1`, autres branches V2 en `europe-west9`) et garde-fous `production-v2` (`GCP_REGION=europe-west1`, `HATCAST_CORS_ALLOWED_ORIGINS=https://hatcast.app`).
- Runbook de déploiement V2 mis à jour avec les invariants OPS-8 et les defaults de région.
- Blocage restant: validations/déploiements Cloud Run + DNS Cloudflare + OAuth/Firebase + recette `check-pwa.sh` nécessitent accès GCP/Cloudflare/GitHub Environments non disponible depuis cette session.

### File List

- `_bmad-output/implementation-artifacts/ops-8-prod-domain-hatcast-app.md`
- `.github/workflows/deploy-v2-cloud-run.yml`
- `docs/v2/technical/DEPLOYMENT_WORKFLOW.md`

### Change Log

- 2026-06-03: Story OPS-8 créée/normalisée au format template et prête pour dev.
- 2026-06-03: Démarrage implémentation OPS-8 (in-progress), garde-fous CI prod `hatcast.app` + documentation workflow mise à jour.

---

### Validation create-story

- [x] AC métier numérotés et sourcés (PLAN/SCP/DEPLOY runbook)
- [x] Section **Material 3** = **UI : N/A**
- [x] Tasks référencent les AC
- [x] Liens vers artefacts existants à réutiliser
- [x] Tests/recettes ops explicités
