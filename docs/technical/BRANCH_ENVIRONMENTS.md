# Branches et environnements (V1 / V2)

Ce document fixe le **mapping** entre branches Git, déploiements et stacks, pour éviter les déploiements accidentels.

| Branche | Rôle typique | Client déployé (Hosting / Pages) | Backend associé |
|---------|----------------|----------------------------------|-----------------|
| **`main`** | Ligne **production** actuelle | Build depuis [`legacy/`](../../legacy/) → Firebase Hosting (`firebase.json`, cible `production`) | Cloud Functions + Firestore du projet Firebase prod (voir CI) |
| **`staging`** | Préproduction / recette V1 | Même client `legacy/` → cible Hosting `staging` | Même projet Firebase, base `staging` (config client `VITE_FIRESTORE_DATABASE`) |
| **`v2`** | Développement **V2** (client `apps/web`, API `services/api`) jusqu’au go prod | Déploiement **séparé** (autre projet Firebase / Cloud Run / URL) — à documenter quand les pipelines V2 existent | API Spring + DB Neon (cible architecture) — hors Firebase client legacy |

## Règles opérationnelles

1. Les workflows **Deploy to Staging / Production** (`.github/workflows/deploy-*.yml`) sont orientés **build `legacy/` + Firebase**. Ils ignorent les changements **uniquement** sous `apps/web/` ou `services/api/` (voir `paths-ignore` dans les workflows) pour ne pas redéployer la V1 inutilement lors du travail V2.
2. Le merge **`v2` → `main`** est réservé au moment où tu acceptes de livrer sur la ligne `main` (souvent cutover ou préparation cutover). Voir [MERGE_V2_TO_MAIN_CHECKLIST.md](MERGE_V2_TO_MAIN_CHECKLIST.md).
3. Les **secrets** GitHub (Firebase, etc.) restent attachés aux bons jobs : ne pas réutiliser un secret prod pour un déploiement expérimental sans le documenter.
