# `services/api` — API HatCast (V2)

Backend **Kotlin / Spring Boot** (cible Cloud Run, **PostgreSQL sur Neon**, OpenAPI). **Aucune** dépendance vers le code Vue sous [`legacy/`](../../legacy/).

## Prérequis

- **JDK 21** (toolchain Gradle).
- **Base PostgreSQL (Neon)** : une branche / base par environnement. **Flyway** s’y connecte pour appliquer les migrations (`classpath:db/migration`) — pas de second Postgres « local » pour valider le schéma.
- Variables **`HATCAST_DATASOURCE_URL`**, **`HATCAST_DATASOURCE_USERNAME`**, **`HATCAST_DATASOURCE_PASSWORD`** (chaîne JDBC typique Neon : `jdbc:postgresql://…?sslmode=require`).
- Variable **`HATCAST_GOOGLE_OAUTH_WEB_CLIENT_ID`** : identifiant client OAuth 2.0 de type **Application Web** (Google Cloud Console), aligné sur le client V2 ([`apps/web`](../apps/web/)) pour Google Identity Services.

En local, chargez ces variables depuis la racine du dépôt (fichier **`.env`**, voir [`.env.example`](../../.env.example)) ; [`scripts/start-dev.sh`](../../scripts/start-dev.sh) les exporte avant `bootRun`.

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
| `dev` (défaut) | Même runtime que ci-dessus : **Neon** via `HATCAST_DATASOURCE_*`. |
| `cloud` | Cloud Run : en-têtes `Forwarded`, cookie session **Secure**, `HATCAST_CORS_ALLOWED_ORIGINS` obligatoire — voir [`docs/v2/technical/DEPLOY_V2_CLOUD_RUN.md`](../../docs/v2/technical/DEPLOY_V2_CLOUD_RUN.md). |
| `test` | Réservé à `./gradlew test` : base **H2 en mémoire** isolée (pas de Neon requis en CI). |

En **dev**, Flyway charge `db/migration` + `db/seed` ([ADR-0014](../../docs/adr/0014-v2-preprod-migration-no-seed.md)). Si le démarrage échoue avec *« resolved migration not applied … 3.1 »*, la base a été migrée avant l’ajout du seed `V3_1` : le profil `dev` active `out-of-order` + `repair-on-migrate` pour l’appliquer. Sinon, réinitialiser la branche Neon de dev (reset) puis relancer `bootRun`.

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

```bash
./gradlew test
```

Les tests d’intégration utilisent le profil `test` et **H2** uniquement pour une base jetable ; les migrations Flyway restent les mêmes artefacts que pour Neon (compatibilité SQL surveillée).

## Contrats OpenAPI (fragments)

| Fichier | Contenu |
|---------|---------|
| [`openapi/auth.yaml`](openapi/auth.yaml) | Auth V2 : `POST /v1/auth/google`, `POST /v1/auth/idp` (Identity Platform), `GET /v1/auth/me`, `POST /v1/auth/logout`, avatar (`/auth/me/avatar`, `/users/{id}/avatar`) — [ADR-0008](../../docs/adr/0008-v2-spa-auth-google-session.md) + [ADR-0010](../../docs/adr/0010-v2-auth-identity-platform.md). |

Les fragments pourront être fusionnés en un seul `openapi.yaml` lorsque l’API complète sera modélisée.

## Sécurité (slice actuelle)

- Session HTTP **cookie** `HATCAST_SESSION` (HttpOnly, SameSite=Lax ; **Secure** en profil `cloud`).
- **CSRF** : chemins `POST /v1/auth/google`, `POST /v1/auth/idp` et `POST /v1/auth/logout` ignorés pour faciliter les tests ; à durcir avec jeton synchroniseur côté SPA en production si besoin.
- **Identity Platform** : `POST /v1/auth/idp` — en **local**, `GOOGLE_APPLICATION_CREDENTIALS` vers un JSON du projet GCP ; sur **Cloud Run**, plutôt **Application Default Credentials** du compte d’exécution + `GOOGLE_CLOUD_PROJECT` (voir [`docs/v2/technical/DEPLOY_V2_CLOUD_RUN.md`](../../docs/v2/technical/DEPLOY_V2_CLOUD_RUN.md) §6.1). Sans init Firebase Admin, le client reçoit 503 sur cet endpoint.
