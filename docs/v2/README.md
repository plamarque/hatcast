# Documentation V2

**Périmètre :** stack cible **Angular** ([`apps/web/`](../../apps/web/)) + **API Spring Boot** ([`services/api/`](../../services/api/)), persistance **PostgreSQL (Neon)**, déploiement **Cloud Run**.

**Important pour les agents :** c’est ici que se trouvent les guides **opérationnels** pour la V2 (déploiement, OAuth Google pour le slice historique, etc.). La cible d’identité est **Identity Platform** ([ADR-0010](../adr/0010-v2-auth-identity-platform.md)). Ne pas confondre avec [`docs/v1/`](../v1/), qui documente uniquement le legacy Firebase.

## Guides techniques V2

- [`technical/V2_GOOGLE_OAUTH_SETUP.md`](technical/V2_GOOGLE_OAUTH_SETUP.md) — configuration Google OAuth (opérateurs)
- [`technical/DEPLOY_V2_CLOUD_RUN.md`](technical/DEPLOY_V2_CLOUD_RUN.md) — Cloud Run, Neon, GitHub Actions
- [`technical/FRONTEND_UI.md`](technical/FRONTEND_UI.md) — Angular Material (références officielles), theming, CDK, **mobile-first** / responsive

## Décisions (ADR)

- [ADR-0010 — Auth V2 : Identity Platform](../adr/0010-v2-auth-identity-platform.md) (décision cible)
- [ADR-0008 — Auth SPA V2 (Google OIDC + session, historique)](../adr/0008-v2-spa-auth-google-session.md) (Deprecated)
- [ADR-0009 — PostgreSQL Neon par environnement](../adr/0009-neon-postgres-environments.md)

## Planning et architecture (artefacts)

- [`_bmad-output/planning-artifacts/`](../../_bmad-output/planning-artifacts/) — PRD, UX, architecture produit V2 (complément aux guides ci-dessus)

## Monorepo et branches (transverse)

Voir [`docs/shared/technical/MONOREPO.md`](../shared/technical/MONOREPO.md) et [`BRANCH_ENVIRONMENTS.md`](../shared/technical/BRANCH_ENVIRONMENTS.md).
