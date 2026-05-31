# E2E V2 (Playwright)

Tests de bout en bout Angular V2 contre l'API Spring en profil **`e2e`** (H2 + seeds Flyway + auth Google mockée).

## Prérequis

- JDK 21, Node 20+, dépendances racine (`npm ci`).

## Lancer localement

Depuis `apps/web/` :

```bash
npx playwright install chromium
npm run test:e2e
```

Playwright démarre automatiquement :

1. API : `HATCAST_SPRING_PROFILE=e2e ./gradlew bootRun` → `http://127.0.0.1:8080`
2. Front : `ng serve --ssl` → `https://localhost:4200`

Par défaut, les serveurs sont **toujours démarrés par Playwright** (profil `e2e`, CSRF désactivé côté API).
Pour réutiliser des processus déjà lancés : `PLAYWRIGHT_REUSE_SERVERS=1 npm run test:e2e` — l'API **doit** alors tourner avec `HATCAST_SPRING_PROFILE=e2e` (sinon échecs auth/CSRF).

## Auth & fixtures

- **Auth mock** : `POST /v1/auth/google` avec `{ "idToken": "e2e-admin" }` (voir `E2eGoogleIdTokenService`).
- **Fixtures** : `POST /v1/e2e/fixtures/story-3-19/reset` + en-tête `X-Hatcast-E2E-Key: e2e-fixtures-secret`.
- État auth Playwright : `e2e/.auth/admin.json` (généré par `auth.setup.ts`, gitignored).

## Smoke 3.19

`smoke-3.19-season-removal.spec.ts` — scénarios recette **S2, S3, S4, S5** (`scripts/v2/RECETTE-3.19-RETRAIT-ROSTER-SAISON.md`).
