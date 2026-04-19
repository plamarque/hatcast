# Configuration Google OAuth (V2 — sans Firebase Auth)

Ce guide est destiné aux **opérateurs** et développeurs qui configurent « Se connecter avec Google » pour la stack **Angular + Spring Boot + PostgreSQL**, conformément à [ADR-0008](../adr/0008-v2-spa-auth-google-session.md). Il ne couvre **pas** la V1 (Firebase Auth sous `legacy/`).

## Principes

- Un **projet Google Cloud** héberge l’écran de consentement OAuth et les **identifiants** (Client ID / secret côté serveur si besoin).
- Le navigateur obtient un **ID token** (JWT OIDC) via **Google Identity Services** ; l’API valide ce jeton puis établit une **session** (cookie HttpOnly) — voir le contrat [`services/api/openapi/auth.yaml`](../../services/api/openapi/auth.yaml).

## Étapes dans Google Cloud Console

### 1. Écran de consentement OAuth

1. [APIs & Services](https://console.cloud.google.com/apis/credentials) → **OAuth consent screen**.
2. Type d’utilisateur : **Externe** (sauf cas interne Google Workspace spécifique).
3. Renseigner nom d’application, email de support, domaines autorisés si vous avez un domaine de production.
4. Scopes : au minimum **openid**, **email**, **profile** (OIDC standard).

### 2. Identifiants OAuth 2.0 — Client Web

1. **Credentials** → **Create credentials** → **OAuth client ID**.
2. Type d’application : **Web application**.
3. **Authorized JavaScript origins** (la valeur doit **coller exactement** à l’URL de la page, sinon erreur **400 `origin_mismatch`**) :
   - Développement local (client V2, `ng serve` avec **`ssl: true`** dans [`apps/web/angular.json`](../../apps/web/angular.json)) : **`https://localhost:4200`** et, si besoin, **`https://127.0.0.1:4200`**.
   - Si vous désactivez SSL en local : ajoutez aussi **`http://localhost:4200`** (et `http://127.0.0.1:4200`).
   - Avec `ng serve --host` (téléphone / LAN) : ajoutez chaque origine utilisée, ex. **`https://192.168.x.x:4200`** (même schéma, hôte et port que dans la barre d’adresse).
   - **Cloud Run (V2, option A — SPA + API dans la même image)** : une origine **par environnement** — l’URL HTTPS **exacte** du service Cloud Run pour **development**, **staging** et **production** (ex. `https://hatcast-v2-dev-xxxxx-ew.a.run.app`, idem pour `-staging` et prod). Ces trois URL doivent être ajoutées au même client OAuth Web si vous utilisez un seul Client ID multi-origines ; voir [`DEPLOY_V2_CLOUD_RUN.md`](DEPLOY_V2_CLOUD_RUN.md) pour le mapping branches git ↔ environnements.
   - Staging / production (autre hébergement SPA) : origine du SPA (ex. GitHub Pages `https://<org>.github.io` ou domaine custom).
4. **Authorized redirect URIs** : requis si vous utilisez un flux avec **redirection** (authorization code). Pour le flux **ID token → POST `/v1/auth/google`** décrit dans l’ADR, les redirect URIs peuvent rester minimaux ; ajoutez toute URI utilisée par GIS ou par des outils de test OAuth.

> **Note :** Un même **Client ID Web** sert typiquement d’**audience** (`aud`) pour la validation du JWT côté Spring et côté configuration GIS dans le SPA. Ne commitez pas les secrets ; utilisez les variables listées dans [`.env.example`](../../.env.example).

### 3. Lien avec Cloud Run (API)

- L’API déployée sur **Cloud Run** expose une URL HTTPS ; configurez **CORS** pour n’autoriser que l’origine du SPA (voir ADR-0008).
- Le **Client ID** utilisé pour GIS doit être celui dont l’`aud` est validé par l’API (variable `HATCAST_GOOGLE_OAUTH_WEB_CLIENT_ID` ou équivalent documenté).

### 4. Environnements multiples (development / staging / production)

- **Trois cibles V2 (Neon + Cloud Run)** : en général **trois URL Cloud Run** distinctes (dev, staging, prod). Ajoutez **chaque** origine dans **Authorized JavaScript origins** du client OAuth Web utilisé par GIS.
- **Option A (courante) :** un client OAuth Web avec **plusieurs** origines et redirect URIs listés (adapté aux trois URL Cloud Run + local).
- **Option B :** un client par environnement pour isoler les erreurs de configuration ; l’API et le SPA de chaque env doivent utiliser le **même** Client ID que le front correspondant (`HATCAST_GOOGLE_OAUTH_WEB_CLIENT_ID` par environnement GitHub).

Alignez les déploiements front et API (NFR-R1) lorsque vous changez origines ou Client ID.

## Configuration côté client Angular (`apps/web`)

Le **Client ID Web** public utilisé par Google Identity Services est défini dans les fichiers d’environnement Angular, pas via des variables `VITE_*` :

- Développement local : `src/environments/environment.development.ts` (chargé par le build **`development`** via `fileReplacements` dans `angular.json`).
- Production / CI : `src/environments/environment.ts` ou remplacements de build / secrets injectés dans le pipeline.

Ne commitez pas de secrets ; pour la recette locale, copier la valeur depuis la console Google (identifiant **OAuth 2.0 Client ID** de type *Web application*).

L’API Spring lit **`HATCAST_GOOGLE_OAUTH_WEB_CLIENT_ID`** (sans préfixe front). Les deux doivent référencer le **même** client OAuth Web pour que la validation du jeton (`aud`) corresponde.

Voir aussi [`.env.example`](../../.env.example) pour les variables racine utiles à l’API.

## Références

- [ADR-0008 — V2 SPA auth (Google + session)](../adr/0008-v2-spa-auth-google-session.md)
- [OpenAPI auth fragment](../../services/api/openapi/auth.yaml)
- [MONOREPO — séparation V1 / V2](MONOREPO.md)
