# `services/api` — API HatCast (V2)

Backend **Kotlin / Spring Boot** (cible Cloud Run, **PostgreSQL sur Neon**, OpenAPI). **Aucune** dépendance vers le code Vue sous [`legacy/`](../../legacy/).

## Prérequis

- **JDK 21** (toolchain Gradle).
- **Base PostgreSQL (Neon)** : branche **`local`** pour le poste (`.env`) ; branches **`development`** / **`staging`** / **primary** pour Cloud Run — voir [ADR-0009](../../docs/adr/0009-neon-postgres-environments.md). **Flyway** s’y connecte pour appliquer les migrations (`classpath:db/migration` ; + `db/seed` en profil `dev` local uniquement).
- Variables **`HATCAST_DATASOURCE_URL`**, **`HATCAST_DATASOURCE_USERNAME`**, **`HATCAST_DATASOURCE_PASSWORD`** (chaîne JDBC typique Neon : `jdbc:postgresql://…?sslmode=require`).
- Variable **`HATCAST_GOOGLE_OAUTH_WEB_CLIENT_ID`** : identifiant client OAuth 2.0 de type **Application Web** (Google Cloud Console), aligné sur le client V2 ([`apps/web`](../apps/web/)) pour Google Identity Services.

En local, chargez ces variables depuis la racine du dépôt (fichier **`.env`**, voir [`.env.example`](../../.env.example)) ; [`scripts/start-dev.sh`](../../scripts/start-dev.sh) les exporte avant `bootRun`.

### Notifications email (story 8.3, recette locale)

| Variable | Rôle |
|----------|------|
| `HATCAST_NOTIFICATION_EMAIL_ENABLED` | `true` pour tenter l’envoi email (défaut API : `false`) |
| `HATCAST_NOTIFICATION_EMAIL_FROM` | En-tête From (optionnel) |

Avec **`./scripts/start-dev.sh`** et `HATCAST_NOTIFICATION_EMAIL_ENABLED=true` :

1. Démarre **Mailpit** (Docker, conteneur `hatcast-mailpit`, image `axllent/mailpit`).
2. Force **`SPRING_MAIL_HOST=127.0.0.1`** et **`SPRING_MAIL_PORT=1025`** pour `bootRun` (ignore les `SPRING_MAIL_*` Gmail éventuels du `.env`).
3. Attend que le port SMTP réponde avant l’API.
4. **Arrête Mailpit** à la fin du script (Ctrl+C).

UI : **http://127.0.0.1:8025**. Preuve serveur : table `notification_delivery_log` (`channel=EMAIL`, `status=SENT`).

Profil **`dev`** : `management.health.mail.enabled=false` ([`application-dev.yml`](src/main/resources/application-dev.yml)) — pas de WARN SMTP sur `actuator/health` si Mailpit est absent.

**`./gradlew bootRun` seul** : pas de Mailpit automatique ; configurer SMTP manuellement ou utiliser `start-dev.sh`.

Cloud Run / staging / prod : **OPS-10** — `CLOUDFLARE_ACCOUNT_ID` + `CLOUDFLARE_EMAIL_SENDING_API_TOKEN` (prioritaire) ; legacy `SPRING_MAIL_*` (Mailpit local via `start-dev.sh` uniquement). Voir [DEPLOY_V2_CLOUD_RUN.md](../../docs/v2/technical/DEPLOY_V2_CLOUD_RUN.md) §7.6.

### Notifications push Web (story 8.3)

| Variable | Rôle |
|----------|------|
| `HATCAST_WEB_PUSH_VAPID_PUBLIC_KEY` | Clé publique VAPID (alignée client Angular / Firebase Cloud Messaging) |
| `HATCAST_WEB_PUSH_VAPID_PRIVATE_KEY` | Clé privée VAPID — **obligatoire** pour envoi ; si absente → canal `SKIPPED` |

- Dépendances : `web-push` + **`bcprov-jdk18on`** ; [`NotificationConfiguration`](src/main/kotlin/com/hatcast/api/notification/NotificationConfiguration.kt) enregistre le provider JCE **BouncyCastle** (`BC`) au démarrage — sans cela l’envoi échoue (`NoSuchProviderException`).
- [`WebPushNotificationSender`](src/main/kotlin/com/hatcast/api/notification/WebPushNotificationSender.kt) : envoi multi-appareil depuis `user_push_subscriptions` ; erreur d’init → `FAILED` sans rollback mutation domaine (NFR-R2).
- Recette locale : **`./scripts/start-dev.sh --with-push`** (front Angular en config **production** pour activer le service worker) + opt-in sur `/compte` ; publier un **nouveau** spectacle (`POST …/actions/open-availability`).

Cloud Run : secrets `HATCAST_WEB_PUSH_VAPID_*` injectés par le workflow deploy — voir [DEPLOY_V2_CLOUD_RUN.md](../../docs/v2/technical/DEPLOY_V2_CLOUD_RUN.md) §3.3.

## Lancer l’API en local

```bash
cd services/api
# HATCAST_DATASOURCE_* + HATCAST_GOOGLE_OAUTH_WEB_CLIENT_ID dans l'environnement (ex. .env à la racine)
./gradlew bootRun
```

- HTTP : `http://localhost:8080`
- Santé : `GET http://localhost:8080/actuator/health`

### Profils Spring

| Profil | Usage |
|--------|--------|
| `dev` (défaut) | Poste local : Neon branche **`local`** via `HATCAST_DATASOURCE_*` dans `.env` ; Flyway `db/migration` + `db/seed` + `db/seed-postgresql`. |
| `cloud` | Cloud Run : en-têtes `Forwarded`, cookie session **Secure**, `HATCAST_CORS_ALLOWED_ORIGINS` obligatoire — voir [`docs/v2/technical/DEPLOY_V2_CLOUD_RUN.md`](../../docs/v2/technical/DEPLOY_V2_CLOUD_RUN.md). |
| `test` | Réservé à `./gradlew test` : base **H2 en mémoire** isolée (pas de Neon requis en CI). |

En **dev**, Flyway charge `db/migration` + `db/seed` + `db/seed-postgresql` ([ADR-0014](../../docs/adr/0014-v2-preprod-migration-no-seed.md)). Les données **Les Improbots** vivent surtout dans le repeatable **`R__seed_improbots_dev_demo.sql`** ; les anciennes migrations seed (`V6`, `V17`, …) sont des stubs no-op. Regénération : `npm run generate:improbots-dev-seed` (voir [DEVELOPMENT.md](../../DEVELOPMENT.md)). Si le démarrage échoue avec *« resolved migration not applied … 3.1 »*, la base a été migrée avant l’ajout du seed `V3_1` : le profil `dev` active `out-of-order` + `repair-on-migrate` pour l’appliquer. Sinon, réinitialiser la branche Neon **`local`** (reset) puis relancer `bootRun`. La branche **`development`** (cloud dev) ne doit pas recevoir les seeds — voir [DEPLOY_V2_CLOUD_RUN.md](../../docs/v2/technical/DEPLOY_V2_CLOUD_RUN.md) §5.

## CORS

Par défaut, origines autorisées incluent `http://localhost:5173` (V1), **`http://localhost:4200`** et **`https://localhost:4200`** (Angular V2), etc. Surcharge : `HATCAST_CORS_ALLOWED_ORIGINS` (liste séparée par des virgules).

## Avatars de profil

Stockage local par défaut (dev / tests) ; GCS prévu pour la production.

| Variable | Défaut | Description |
|----------|--------|-------------|
| `HATCAST_AVATAR_STORAGE` | `local` | `local` (filesystem) ou `gcs` (non implémenté — l’API échoue au démarrage si `gcs` sans impl.). |
| `HATCAST_AVATAR_LOCAL_PATH` | `${java.io.tmpdir}/hatcast-avatars` | Répertoire racine pour `LocalAvatarStorage`. |
| `HATCAST_GCS_AVATAR_BUCKET` | — | Réservé pour `GcsAvatarStorage` (future livraison). |

Endpoints : `POST /v1/auth/me/avatar` (multipart), `POST /v1/auth/me/avatar/google`, `DELETE /v1/auth/me/avatar`, `GET /v1/users/{userId}/avatar` (session + troupe commune ou self).

## Tests

### Commande locale

Depuis `services/api/` :

```bash
./gradlew test
```

Profil Spring **`test`** (`@ActiveProfiles("test")` sur les suites `@SpringBootTest`). Aucune variable `HATCAST_DATASOURCE_*` ni branche Neon requise.

### Golden draw suite (Epic 19.2)

Regression gate for [`AvailabilityChanceCalculator`](src/main/kotlin/com/hatcast/api/availability/AvailabilityChanceCalculator.kt) — frozen vectors from [`docs/v2/technical/draw-weight-engine-v1-spec.md`](../../docs/v2/technical/draw-weight-engine-v1-spec.md) § Golden test contract.

```bash
./gradlew test --tests 'com.hatcast.api.availability.DrawGoldenTest'
```

- Fixtures : `src/test/resources/draw/golden/*.json` (IDs `REF-*`, `T-*`).
- Runner : `DrawGoldenTest.kt` (parameterized; never uses `Random.Default` in golden draws).
- CI : workflow [`api-test.yml`](../../.github/workflows/api-test.yml) runs the full `./gradlew test` on PRs touching `services/api/**` (includes golden + `CompositionDrawService` regressions).

Optional vector regeneration (normative algorithm change only) : [`scripts/draw/freeze-golden-vectors.kts`](../../scripts/draw/freeze-golden-vectors.kts).

### H2 (CI et local) vs PostgreSQL (Neon)

| Environnement | Moteur | Config |
|---------------|--------|--------|
| **CI** + `./gradlew test` local | **H2** en mémoire | [`src/test/resources/application-test.yml`](src/test/resources/application-test.yml) |
| **E2E Playwright V2** | **H2** en mémoire + seeds | [`src/main/resources/application-e2e.yml`](src/main/resources/application-e2e.yml) — profil **`e2e`** |
| **dev** (poste, branche Neon `local`) / **cloud** (Cloud Run) | **PostgreSQL** (Neon) | `HATCAST_DATASOURCE_*` + profils `dev` / `cloud` |

La CI (**[`.github/workflows/api-test.yml`](../../.github/workflows/api-test.yml)**) exécute `./gradlew test --no-daemon` sur chaque PR/push touchant `services/api/**` (branches `v2`, `main`). Échec du job = check rouge. Relance manuelle : onglet Actions → *services/api (tests)* → *Run workflow*.

**Ne pas** pointer les tests vers Neon staging/prod. La parité Postgres complète (job `services: postgres` ou Testcontainers) reste optionnelle avant **MIG-2** si un écart SQL H2/Postgres apparaît ; aujourd’hui la gate **M1** repose sur H2 + migrations/seed identiques aux artefacts prod.

### Flyway en profil `test`

Comme en **dev** : `spring.flyway.locations` = `classpath:db/migration` + `classpath:db/seed` + `classpath:db/seed-postgresql` (données `@seed.improbots.test` via `R__seed_improbots_dev_demo.sql`, etc.). Le profil **cloud** exclut `db/seed` et `db/seed-postgresql` ([ADR-0014](../../docs/adr/0014-v2-preprod-migration-no-seed.md)).

### Profil `e2e` (Playwright V2)

Démarrage local (ou via `apps/web/playwright.config.ts` `webServer`) :

```bash
HATCAST_SPRING_PROFILE=e2e ./gradlew bootRun
```

- Base **H2** isolée, Flyway **migration + seed** (Les Improbots).
- **Auth Google mockée** : `E2eGoogleIdTokenService` — token `e2e-admin` → `patrice@seed.improbots.test` (TROUPE_ADMIN Les Improbots ; super-admin plateforme).
- **CSRF désactivé** (`hatcast.e2e.api-enabled=true`) pour les mutations Playwright sans bootstrap `XSRF-TOKEN`.
- **Fixtures hybrides** (option C) : seed minimal + `POST /v1/e2e/fixtures/story-3-19/reset` (en-tête `X-Hatcast-E2E-Key`, clé par défaut `e2e-fixtures-secret` dans `application-e2e.yml`).
- Package : [`src/main/kotlin/com/hatcast/api/e2e/`](src/main/kotlin/com/hatcast/api/e2e/). CI : [`.github/workflows/e2e-smoke.yml`](../../.github/workflows/e2e-smoke.yml).

### Compatibilité SQL H2 (shims test uniquement)

- **`TIMESTAMPTZ`** : domaine créé dans l’URL JDBC H2 (`INIT=CREATE DOMAIN IF NOT EXISTS TIMESTAMPTZ AS TIMESTAMP WITH TIME ZONE` dans `application-test.yml`).
- **`gen_random_uuid()`** : en production, PostgreSQL 13+ natif ([`V23__event_availability_proxy_audit.sql`](src/main/resources/db/migration/V23__event_availability_proxy_audit.sql)). En test, H2 en `MODE=PostgreSQL` fournit la fonction — **pas** de `CREATE EXTENSION pgcrypto` dans les migrations (texte deferred obsolète DW-028/030/037).

Les migrations doivent rester exécutables sur H2 tant que la CI utilise ce profil ; éviter le SQL réservé Postgres non émulé par H2.

### Suites d’intégration (non désactivées en CI)

Environ **22** classes `@SpringBootTest` sous `src/test/kotlin/`, dont notamment `MemberSeasonGlanceIntegrationTest`, `ShareRecipientsIntegrationTest`, et l’ensemble des tests composition/auth/event. Aucun `@Disabled` pour faire passer la CI.

## Contrats OpenAPI (fragments)

| Fichier | Contenu |
|---------|---------|
| [`openapi/auth.yaml`](openapi/auth.yaml) | Auth V2 : `POST /v1/auth/google`, `POST /v1/auth/idp` (Identity Platform), `GET /v1/auth/me`, `POST /v1/auth/logout`, avatar (`/auth/me/avatar`, `/users/{id}/avatar`) — [ADR-0008](../../docs/adr/0008-v2-spa-auth-google-session.md) + [ADR-0010](../../docs/adr/0010-v2-auth-identity-platform.md). |

Les fragments pourront être fusionnés en un seul `openapi.yaml` lorsque l’API complète sera modélisée.

## Sécurité (slice actuelle)

- Session HTTP **cookie** `HATCAST_SESSION` (HttpOnly, SameSite=Lax ; **Secure** en profil `cloud`).
- **CSRF** : chemins `POST /v1/auth/google`, `POST /v1/auth/idp` et `POST /v1/auth/logout` ignorés pour faciliter les tests ; à durcir avec jeton synchroniseur côté SPA en production si besoin.
- **Identity Platform** : `POST /v1/auth/idp` — en **local**, `GOOGLE_APPLICATION_CREDENTIALS` vers un JSON du projet GCP ; sur **Cloud Run**, plutôt **Application Default Credentials** du compte d’exécution + `GOOGLE_CLOUD_PROJECT` (voir [`docs/v2/technical/DEPLOY_V2_CLOUD_RUN.md`](../../docs/v2/technical/DEPLOY_V2_CLOUD_RUN.md) §6.1). Sans init Firebase Admin, le client reçoit 503 sur cet endpoint.
