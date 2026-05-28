# Branches et environnements (V1 / V2)

Ce document fixe le **mapping** entre branches Git, déploiements et stacks, pour éviter les déploiements accidentels.

| Branche | Rôle typique | Client déployé (Hosting / Pages) | Backend associé |
|---------|----------------|----------------------------------|-----------------|
| **`main`** | Ligne **production V1** (Firebase) | Build depuis [`legacy/`](../../legacy/) → Firebase Hosting (`firebase.json`, cible `production`) | Cloud Functions + Firestore du projet Firebase prod (voir CI) |
| **`production-v2`** | Ligne **production V2** (Cloud Run + Neon) | Workflow [`.github/workflows/deploy-v2-cloud-run.yml`](../../.github/workflows/deploy-v2-cloud-run.yml) → environnement GitHub **`production`** | API Spring + **Neon** (branche primary) — voir [DEPLOY_V2_CLOUD_RUN.md](../../v2/technical/DEPLOY_V2_CLOUD_RUN.md) |
| **`staging`** | Préproduction / recette **V1** uniquement | Même client `legacy/` → cible Hosting `staging` | Même projet Firebase, base `staging` (config client `VITE_FIRESTORE_DATABASE`) |
| **`staging-v2`** | Préproduction / recette **V2** (Cloud Run + Neon) | Même workflow V2 → environnement GitHub **`staging`** | API Spring + **Neon** (branche `staging`) |
| **`v2`** | Développement **V2** (client `apps/web`, API `services/api`) | Même workflow V2 → environnement GitHub `development` | API Spring + **Neon** (branche dev), hors Firebase client legacy |

### Workflow V2 (scripts + CI)

| Action | Outil |
|--------|--------|
| Push dev cloud | `git push origin v2` |
| Promouvoir vers staging | [`scripts/v2/promote-to-staging.sh`](../../../scripts/v2/promote-to-staging.sh) |
| Release production V2 | [`scripts/v2/release-production.sh`](../../../scripts/v2/release-production.sh) (depuis `staging-v2`) |

Guide complet : [DEPLOYMENT_WORKFLOW.md](../../v2/technical/DEPLOYMENT_WORKFLOW.md). Configuration des noms de branches : [`scripts/v2/branches.env`](../../../scripts/v2/branches.env).

**Note :** la branche git **`main`** ne doit **pas** déclencher le workflow V2 prod tant que la V1 vit sur `main` — seule **`production-v2`** mappe l’environnement GitHub `production` pour Cloud Run V2.

## Règles opérationnelles

1. Les workflows **Deploy to Staging / Production** (`.github/workflows/deploy-*.yml`) sont orientés **build `legacy/` + Firebase**. Ils ignorent les changements **uniquement** sous `apps/web/` ou `services/api/` (voir `paths-ignore` dans les workflows) pour ne pas redéployer la V1 inutilement lors du travail V2.
2. Le merge **`v2` → `main`** (cutover V1) reste distinct du flux **`staging-v2` → `production-v2`** (prod V2). Voir [MERGE_V2_TO_MAIN_CHECKLIST.md](MERGE_V2_TO_MAIN_CHECKLIST.md) et [DEPLOYMENT_WORKFLOW.md](../../v2/technical/DEPLOYMENT_WORKFLOW.md).
3. Les **secrets** GitHub (Firebase, etc.) restent attachés aux bons jobs : ne pas réutiliser un secret prod pour un déploiement expérimental sans le documenter.
