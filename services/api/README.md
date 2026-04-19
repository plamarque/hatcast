# `services/api` — API HatCast (V2)

Backend **Kotlin / Spring Boot** (cible Cloud Run, PostgreSQL sur **Neon**, OpenAPI). **Aucune** dépendance vers le code Vue sous [`legacy/`](../../legacy/).

## Prérequis

- **JDK 21** (toolchain Gradle).
- Variable **`HATCAST_GOOGLE_OAUTH_WEB_CLIENT_ID`** : identifiant client OAuth 2.0 de type **Application Web** (Google Cloud Console), identique à celui utilisé par le client V2 ([`apps/web`](../apps/web/)) pour Google Identity Services.

## Lancer l’API en local

```bash
cd services/api
export HATCAST_GOOGLE_OAUTH_WEB_CLIENT_ID="xxxx.apps.googleusercontent.com"
./gradlew bootRun
```

- HTTP : `http://localhost:8080`
- Santé : `GET http://localhost:8080/actuator/health`

Profils :

| Profil | Usage |
|--------|--------|
| `dev` (défaut) | H2 en mémoire, Flyway `users`, tables Spring Session créées au démarrage. |
| `docker` | PostgreSQL via [`docker-compose.yml`](docker-compose.yml) (port hôte **5433**). |
| `cloud` | Cloud Run : PostgreSQL **Neon** via `HATCAST_DATASOURCE_*` (une branche Neon par environnement), cookie **Secure** ; voir [`docs/v2/technical/DEPLOY_V2_CLOUD_RUN.md`](../../docs/v2/technical/DEPLOY_V2_CLOUD_RUN.md). |

Exemple Postgres :

```bash
docker compose -f docker-compose.yml up -d
export HATCAST_SPRING_PROFILE=docker
export HATCAST_GOOGLE_OAUTH_WEB_CLIENT_ID="…"
./gradlew bootRun
```

## CORS

Par défaut, origines autorisées incluent `http://localhost:5173` (V1), **`http://localhost:4200`** et **`https://localhost:4200`** (Angular V2, `ng serve` souvent en TLS en local), ainsi que les ports **5174** si encore utilisés. Surcharge : `HATCAST_CORS_ALLOWED_ORIGINS` (liste séparée par des virgules).

## Tests

```bash
./gradlew test
```

## Contrats OpenAPI (fragments)

| Fichier | Contenu |
|---------|---------|
| [`openapi/auth.yaml`](openapi/auth.yaml) | Auth V2 : `POST /v1/auth/google`, `GET /v1/auth/me`, `POST /v1/auth/logout` — aligné sur [ADR-0008](../../docs/adr/0008-v2-spa-auth-google-session.md). |

Les fragments pourront être fusionnés en un seul `openapi.yaml` lorsque l’API complète sera modélisée.

## Sécurité (slice actuelle)

- Session HTTP **cookie** `HATCAST_SESSION` (HttpOnly, SameSite=Lax).
- **CSRF** : chemins `POST /v1/auth/google` et `POST /v1/auth/logout` ignorés pour faciliter les tests ; à durcir avec jeton synchroniseur côté SPA en production si besoin.
