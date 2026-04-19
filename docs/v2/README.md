# Documentation V2

**Périmètre :** stack cible **Angular** ([`apps/web/`](../../apps/web/)) + **API Spring Boot** ([`services/api/`](../../services/api/)), persistance **PostgreSQL (Neon)**, déploiement **Cloud Run**.

**Important pour les agents :** c’est ici que se trouvent les guides **opérationnels** pour la V2 (OAuth Google sans Firebase Auth, déploiement, etc.). Ne pas confondre avec [`docs/v1/`](../v1/), qui documente uniquement le legacy Firebase.

## Guides techniques V2

- [`technical/V2_GOOGLE_OAUTH_SETUP.md`](technical/V2_GOOGLE_OAUTH_SETUP.md) — configuration Google OAuth (opérateurs)
- [`technical/DEPLOY_V2_CLOUD_RUN.md`](technical/DEPLOY_V2_CLOUD_RUN.md) — Cloud Run, Neon, GitHub Actions

## Décisions (ADR)

- [ADR-0008 — Auth SPA V2 (Google + session)](../adr/0008-v2-spa-auth-google-session.md)
- [ADR-0009 — PostgreSQL Neon par environnement](../adr/0009-neon-postgres-environments.md)

## Planning et architecture (artefacts)

- [`_bmad-output/planning-artifacts/`](../../_bmad-output/planning-artifacts/) — PRD, UX, architecture produit V2 (complément aux guides ci-dessus)

## Monorepo et branches (transverse)

Voir [`docs/shared/technical/MONOREPO.md`](../shared/technical/MONOREPO.md) et [`BRANCH_ENVIRONMENTS.md`](../shared/technical/BRANCH_ENVIRONMENTS.md).
