# Déploiement HatCast V2 (Cloud Run — option A)

Ce guide complète la configuration **Google Cloud**, **Neon** (PostgreSQL managé) et **GitHub Actions** pour des services **Cloud Run** distincts par environnement : image Docker (Nginx + Angular statique + Spring Boot), alignée avec le plan option A.

## 1. APIs Google Cloud à activer

Dans **APIs & Services > Library**, activer au minimum :

- **Artifact Registry API**
- **Cloud Run Admin API**
- **IAM API**
- **Secret Manager API** (recommandé pour mots de passe applicatifs si vous sortez les secrets du dépôt GitHub)

Neon étant hébergé hors GCP, **Cloud SQL Admin API** et le rôle **Cloud SQL Client** sur le compte d’exécution Cloud Run **ne sont pas requis** pour la base V2.

## 2. Artifact Registry

1. **Artifact Registry > Repositories > Create**  
   - Format : **Docker**  
   - Région : ex. `europe-west1`  
   - Nom : ex. `hatcast-v2`

L’URL d’image sera du type :

`europe-west1-docker.pkg.dev/PROJECT_ID/hatcast-v2/hatcast-api:TAG`

## 3. Comptes de service et Workload Identity Federation (GitHub)

Éviter les clés JSON longue durée : lier **GitHub Actions** à GCP via **OIDC**.

### 3.1 Pool de charge de travail (Workload Identity Pool)

1. **IAM & Admin > Workload Identity Federation**  
2. Créer un **pool** (ex. `github-pool`) et un **fournisseur** **OIDC** :
   - Issuer : `https://token.actions.githubusercontent.com`
   - Audiences : `https://token.actions.githubusercontent.com`
3. Mapper l’attribut (ex. `attribute.repository` = `OWNER/REPO`) pour restreindre au dépôt HatCast.

### 3.2 Compte de service pour la CI (push + deploy)

1. Créer un compte de service, ex. `github-deploy-hatcast-v2`
2. Rôles typiques :
   - **Artifact Registry Writer** (push d’images)
   - **Service Account User** sur le compte d’exécution utilisé par Cloud Run (si distinct)
   - **Cloud Run Admin** (ou rôle minimal `roles/run.developer` + permissions déploiement)
3. **Accorder au pool WIF** l’impersonation de ce SA :  
   *IAM > Compte de service > Permissions* : principal `principalSet://iam.googleapis.com/projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/github-pool/attribute.repository/OWNER/REPO` → rôle **Workload Identity User** sur le SA.

### 3.3 Environnements GitHub et secrets

Créer **trois environnements** dans **Settings > Environments** : `development`, `staging`, `production`.

**Mapping branche git → environnement → service Cloud Run (recommandé)** :

| Branche git | Environnement GitHub | Branche Neon (voir §5) | Exemple de nom de service Cloud Run |
|-------------|----------------------|-------------------------|-------------------------------------|
| `v2` | `development` | `development` ou `dev` | `hatcast-v2-dev` |
| `staging` | `staging` | `staging` | `hatcast-v2-staging` |
| `main` | `production` | branche **primary** (prod) | `hatcast-v2` |

Le workflow [`.github/workflows/deploy-v2-cloud-run.yml`](../../.github/workflows/deploy-v2-cloud-run.yml) applique cet environnement selon la branche ; les secrets ci-dessous doivent être **définis dans chaque environnement** (valeurs différentes par cible).

#### Secrets au niveau **dépôt** (réutilisés pour tous les déploiements)

| Nom | Description |
|-----|-------------|
| `GCP_PROJECT_ID` | ID du projet GCP |
| `GCP_ARTIFACT_REGISTRY` | ex. `europe-west1-docker.pkg.dev/PROJECT/hatcast-v2/hatcast-api` (sans tag) |
| `GCP_WORKLOAD_IDENTITY_PROVIDER` | Ressource WIF complète, ex. `projects/123/locations/global/workloadIdentityPools/github-pool/providers/github-provider` |
| `GCP_SERVICE_ACCOUNT` | Email du SA CI, ex. `github-deploy-hatcast-v2@PROJECT.iam.gserviceaccount.com` |
| `GOOGLE_OAUTH_WEB_CLIENT_ID` | Client ID Web — **build Angular** (même valeur que le client utilisé par le runtime si un seul client multi-origines) |

#### Variables d’environnement **par environnement GitHub** (recommandé)

| Nom | Description |
|-----|-------------|
| `CLOUD_RUN_SERVICE_NAME` | Nom du service Cloud Run pour **cet** env (ex. `hatcast-v2-dev`, `hatcast-v2-staging`, `hatcast-v2`) |
| `GCP_REGION` | (Optionnel) Région ; défaut `europe-west1` si absent |

#### Secrets **par environnement GitHub** (base + CORS + OAuth runtime)

| Nom | Description |
|-----|-------------|
| `HATCAST_GOOGLE_OAUTH_WEB_CLIENT_ID` | Client ID Web validé côté API (`aud` du jeton Google) — souvent **identique** dans les trois env si un seul client OAuth avec plusieurs origines |
| `HATCAST_DATASOURCE_URL` | JDBC Postgres Neon pour **cette** branche (voir §5) |
| `HATCAST_DATASOURCE_USERNAME` | Utilisateur Neon |
| `HATCAST_DATASOURCE_PASSWORD` | Mot de passe Neon |
| `HATCAST_CORS_ALLOWED_ORIGINS` | Origine **exacte** du service Cloud Run **de cet env** (schéma `https://`, sans chemin), ex. `https://hatcast-v2-dev-xxxxx-ew.a.run.app` |

Le workflow utilise `google-github-actions/auth` avec `workload_identity_provider` et `service_account` (secrets dépôt).

## 4. Cloud Run — origines OAuth (une par environnement)

Après chaque **premier** déploiement sur un environnement, récupérer l’URL HTTPS du service (console Cloud Run ou `gcloud run services describe`).

1. Dans **Google Cloud Console > APIs & Credentials > Client OAuth Web**, ajouter chaque URL en **Authorized JavaScript origins** (schéma `https://`, sans chemin).
2. Mettre à jour le secret **`HATCAST_CORS_ALLOWED_ORIGINS`** de **l’environnement** correspondant avec **exactement** la même origine.

Voir [V2_GOOGLE_OAUTH_SETUP.md](V2_GOOGLE_OAUTH_SETUP.md) pour le détail multi-environnements.

## 5. PostgreSQL sur Neon (un projet, trois branches)

- Créer un **projet Neon** ([console](https://console.neon.tech)).
- **Branche primary** : données de **production** (alignée avec les déploiements depuis `main`).
- Créer deux branches enfant (depuis la primary ou selon votre politique Neon), par ex. **`staging`** et **`development`** (ou `dev`), pour isoler données et chaînes de connexion.

Chaque branche Neon fournit sa propre **chaîne de connexion** (hôte `*.neon.tech` distinct dans le tableau de bord).

### 5.1 JDBC et TLS

La valeur **`HATCAST_DATASOURCE_URL`** doit être au format JDBC Postgres attendu par Spring ([`application-cloud.yml`](../../services/api/src/main/resources/application-cloud.yml)) :

`jdbc:postgresql://HOST:5432/NOM_BASE?sslmode=require`

- Remplacez `HOST`, `NOM_BASE`, utilisateur et mot de passe par ceux affichés pour **la branche** ciblée dans Neon.
- **`sslmode=require`** (ou équivalent selon la doc Neon) est attendu pour TLS.

### 5.2 Poolé vs direct (Cloud Run)

- Pour l’**application** sur Cloud Run (scale-to-zero, nombreuses connexions courtes), privilégiez l’endpoint **poolé** (« Pooled connection » / PgBouncer) proposé par Neon dans la console, s’il est disponible pour votre projet.
- Pour **Flyway** ou migrations nécessitant des fonctionnalités session complètes, utilisez l’endpoint **direct** si Neon le recommande pour ces opérations.

### 5.3 Réseau

La connexion s’établit en **TCP/TLS** depuis Cloud Run vers Neon sur Internet. Si vous activez une **allowlist** d’IPs côté Neon, documentez les contraintes (Cloud Run n’expose pas d’IP sortante fixe par défaut) ou désactivez l’allowlist pour ces environnements.

### 5.4 Mots de passe

Vous pouvez garder les mots de passe dans les **secrets d’environnement GitHub** ou les externaliser vers **GCP Secret Manager** et `--set-secrets` sur `gcloud run deploy` (évolution hors scope du workflow actuel documenté ici).

## 6. Compte d’exécution Cloud Run

Le service Cloud Run s’exécute avec un **service account** (par défaut ou dédié). Avec Neon, **aucun** rôle Cloud SQL Client n’est requis pour la couche données V2.

## 7. Vérifications post-déploiement

- `https://<service-url>/` charge l’SPA Angular.
- Navigation directe vers `/accueil` ou `/connexion` : pas de 404 (fallback SPA via Nginx).
- Connexion Google sans `origin_mismatch` (origine OAuth + CORS alignés sur cet env).
- `GET /v1/auth/me` après login.

### 502 sur `/v1/...` (`connect() failed (111: Connection refused)` vers `127.0.0.1:8081`)

Souvent **Nginx** est prêt avant que **Spring** n’écoute sur `HATCAST_SERVER_PORT` (cold start, Flyway/Neon lent). L’image attend jusqu’à **240 s** que `http://127.0.0.1:8081/actuator/health` réponde avant de lancer Nginx ; variable optionnelle **`WAIT_FOR_API_SECONDS`** sur le service Cloud Run pour ajuster. Si l’API ne démarre pas (Neon injoignable, OOM, erreur Flyway), consulter les **logs** du révision Cloud Run (sortie Java + Nginx).

## Références

- [Neon — documentation](https://neon.tech/docs)
- [V2_GOOGLE_OAUTH_SETUP.md](V2_GOOGLE_OAUTH_SETUP.md)
- [ADR-0008](../../adr/0008-v2-spa-auth-google-session.md)
- [ADR-0009](../../adr/0009-neon-postgres-environments.md)
