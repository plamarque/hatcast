# Checklist — merge `v2` → `main` (cutover ou préparation prod)

À utiliser avant de fusionner la branche **`v2`** dans **`main`**, lorsque la V2 doit devenir (ou préparer) la ligne de production.

## Déploiement et CI

- [ ] Les workflows GitHub ciblent les bons **chemins** : build client depuis `apps/web/` (ou stratégie documentée), API depuis `services/api/`, sans supposer une sortie dans `legacy/dist` si la prod ne sert plus la V1.
- [ ] **Secrets** : variables pour Firebase, Cloud Run, Neon, OAuth Google, etc. sont présentes et nommées pour **l’environnement prod** (pas seulement staging / dev).
- [ ] **Coupled deploy** (NFR-R1) : pipeline qui livre **client + API** dans la même exécution ou avec dépendances `needs:` explicites — pas de déploiement “à moitié”.
- [ ] **Firebase Hosting** : si la prod utilise encore Hosting, vérifier `firebase.json` (`public`, `rewrites`) et cibles `production` / `staging` — pas d’écrasement par une ancienne config à la racine.

## Code et produit

- [ ] Aucun import résiduel **V2 → `legacy/`** non justifié.
- [ ] **DNS / URLs** : domaine public, deep links, auth redirect URIs (Google) mis à jour pour la V2.
- [ ] **Migration données** : si applicable, plan cutover Firestore → PostgreSQL (ou coexistence) validé ; pas de perte de données non assumée.

## Documentation

- [ ] `ARCH.md`, `DEVELOPMENT.md`, README racine reflètent la structure **monorepo** et la stack prod réelle.
- [ ] [BRANCH_ENVIRONMENTS.md](BRANCH_ENVIRONMENTS.md) mis à jour après le changement de politique de branches.

## Après le merge

- [ ] Vérifier un déploiement **staging** puis **production** manuellement ou via release.
- [ ] Communiquer la version / le hash déployé (traçabilité support).
