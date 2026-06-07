# Documentation V2

**Périmètre :** stack cible **Angular** ([`apps/web/`](../../apps/web/)) + **API Spring Boot** ([`services/api/`](../../services/api/)), persistance **PostgreSQL (Neon)**, déploiement **Cloud Run**.

**Important pour les agents :** c’est ici que se trouvent les guides **opérationnels** pour la V2 (déploiement, OAuth Google pour le slice historique, etc.). La cible d’identité est **Identity Platform** ([ADR-0010](../adr/0010-v2-auth-identity-platform.md)). Ne pas confondre avec [`docs/v1/`](../v1/), qui documente uniquement le legacy Firebase.

## Documentation produit V2

- [`product/draw-chances-explained.md`](product/draw-chances-explained.md) — comprendre les pourcentages de tirage (organisateur / membre)

## Guides techniques V2

- [`technical/V2_GOOGLE_OAUTH_SETUP.md`](technical/V2_GOOGLE_OAUTH_SETUP.md) — configuration Google OAuth (opérateurs)
- [`technical/DEPLOY_V2_CLOUD_RUN.md`](technical/DEPLOY_V2_CLOUD_RUN.md) — Cloud Run, Neon, GitHub Actions
- [`migration/preprod-reset-and-migrate.md`](migration/preprod-reset-and-migrate.md) — pre-prod staging : reset Neon, migration depuis Firestore **prod** (`default`)
- [`migration/v1-troupe-members-csv-recipe.md`](migration/v1-troupe-members-csv-recipe.md) — import CSV utilisateurs + membres (V1 → V2)
- [`technical/FRONTEND_UI.md`](technical/FRONTEND_UI.md) — Angular Material (références officielles), theming, CDK, **mobile-first** / responsive, **checklist M3**
- [`technical/draw-weight-engine-v1-spec.md`](technical/draw-weight-engine-v1-spec.md) — moteur de tirage pondéré V1 (spec normative, contrat golden **19.2**)
- [`../../project-context.md`](../../project-context.md) — contexte court pour agents (stack, chemins, règles)
- [`../../_bmad-output/implementation-artifacts/story-template.md`](../../_bmad-output/implementation-artifacts/story-template.md) — modèle de story avec AC Material 3

## Décisions (ADR)

- [ADR-0010 — Auth V2 : Identity Platform](../adr/0010-v2-auth-identity-platform.md) (décision cible)
- [ADR-0008 — Auth SPA V2 (Google OIDC + session, historique)](../adr/0008-v2-spa-auth-google-session.md) (Deprecated)
- [ADR-0009 — PostgreSQL Neon par environnement](../adr/0009-neon-postgres-environments.md)
- [ADR-0014 — Pre-prod sans seed, migration V1 prod](../adr/0014-v2-preprod-migration-no-seed.md)

## Planning et architecture (artefacts)

- [`_bmad-output/planning-artifacts/`](../../_bmad-output/planning-artifacts/) — PRD, UX, architecture produit V2 (complément aux guides ci-dessus)

## Monorepo et branches (transverse)

Voir [`docs/shared/technical/MONOREPO.md`](../shared/technical/MONOREPO.md) et [`BRANCH_ENVIRONMENTS.md`](../shared/technical/BRANCH_ENVIRONMENTS.md).
