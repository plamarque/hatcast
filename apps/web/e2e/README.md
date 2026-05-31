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

## Smoke / recette 3.19

`recette-3.19.spec.ts` — cahier manuel `scripts/v2/RECETTE-3.19-RETRAIT-ROSTER-SAISON.md` :

| Scénario | Couverture E2E |
|----------|----------------|
| S1 | Exclusion événement |
| S2 | Retrait saison membre |
| S3 | Garde de sync (reload) |
| S4 | Portée saison-locale |
| S5 | Ré-inclusion via Ajouter + exclusion événement conservée |
| S6 | Cascade troupe + réactivation |
| S7 | Rétrogradation organisateur·ice de saison |
| S8 | Externe name-only |
| S9 | Conservation historique composition (API, même `season_participant_id`) |

Fixtures : `POST /v1/e2e/fixtures/story-3-19/reset` (membre Max, externe « Invité Recette E2E », saisons A/B).
