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

#### Secrets **dépôt** (optionnels — Identity Platform / email–mot de passe dans le SPA)

Ces valeurs sont aussi présentes côté client une fois le SPA déployé ; les stocker en **secrets** GitHub reste une bonne pratique pour ne pas les exposer dans l’UI des variables dépôt et pour aligner le stockage avec le reste des identifiants CI.

Le workflow les passe en `--build-arg` Docker ; le script [`apps/web/scripts/inject-google-client-id.mjs`](../../apps/web/scripts/inject-google-client-id.mjs) les injecte dans `environment.ts` au build. Alignez-les sur la **même** appli Web / projet GCP qu’Identity Platform.

| Nom | Description |
|-----|-------------|
| `HATCAST_FIREBASE_WEB_API_KEY` | `apiKey` (config Web GCP / Identity Platform) |
| `HATCAST_FIREBASE_AUTH_DOMAIN` | ex. `mon-projet.firebaseapp.com` |
| `HATCAST_FIREBASE_PROJECT_ID` | ID du projet GCP (souvent identique à `GCP_PROJECT_ID`) |

Si ces secrets sont absents ou vides, le bloc `firebase` reste vide : **Google (GIS)** fonctionne si le Client ID est correct ; le formulaire **email / mot de passe** reste masqué jusqu’à configuration.

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

### 5.5 Schéma Flyway vs seeds (staging / production)

Sur Cloud Run (`HATCAST_SPRING_PROFILE=cloud`), Flyway n’applique que `classpath:db/migration` — **pas** les scripts sous `db/seed` (données La Malice / MVP). Voir [ADR-0014](../../adr/0014-v2-preprod-migration-no-seed.md) et le runbook [preprod-reset-and-migrate.md](../migration/preprod-reset-and-migrate.md) pour alimenter staging depuis **Firestore V1 production** (`default`).

### 5.3 Réseau

La connexion s’établit en **TCP/TLS** depuis Cloud Run vers Neon sur Internet. Si vous activez une **allowlist** d’IPs côté Neon, documentez les contraintes (Cloud Run n’expose pas d’IP sortante fixe par défaut) ou désactivez l’allowlist pour ces environnements.

### 5.4 Mots de passe

Vous pouvez garder les mots de passe dans les **secrets d’environnement GitHub** ou les externaliser vers **GCP Secret Manager** et `--set-secrets` sur `gcloud run deploy` (évolution hors scope du workflow actuel documenté ici).

## 6. Compte d’exécution Cloud Run

Le service Cloud Run s’exécute avec un **service account** (par défaut ou dédié). Avec Neon, **aucun** rôle Cloud SQL Client n’est requis pour la couche données V2.

### 6.1 Identity Platform — `POST /v1/auth/idp` (email / mot de passe)

L’API initialise **Firebase Admin** pour vérifier les ID tokens côté serveur ([ADR-0010](../../adr/0010-v2-auth-identity-platform.md)).

- **Sur Cloud Run**, on ne passe en général **pas** de fichier JSON dans l’image : le workflow définit **`GOOGLE_CLOUD_PROJECT`** (identique au projet GCP où Identity Platform est activé). L’API utilise les **Application Default Credentials** du **compte de service d’exécution** du service Cloud Run.
- Accordez à ce compte de service au minimum un rôle permettant l’administration Auth / Identity Platform sur le projet, par ex. **Administrateur Authentication Firebase** (`roles/firebaseauth.admin`) ou, en environnement restreint, le rôle minimal documenté par Google pour le SDK Admin selon votre politique IAM.
- Le **build Angular** pour cet environnement doit exposer la **même** config Web (`apiKey`, `authDomain`, `projectId`) que ce projet GCP : secrets dépôt `HATCAST_FIREBASE_*` (voir tableau ci-dessus) + `GOOGLE_OAUTH_WEB_CLIENT_ID` dans le workflow.
- En secours, vous pouvez monter un secret fichier et définir **`GOOGLE_APPLICATION_CREDENTIALS`** sur le service Cloud Run (`gcloud run deploy` / Secret Manager) si vous ne souhaitez pas utiliser ADC.

### 6.2 Mot de passe oublié (réinitialisation par email)

L’envoi du mail et le lien avec `oobCode` sont gérés par **Identity Platform / Firebase Auth** (SDK client `firebase/auth`), pas par l’API Spring.

- **Domaines autorisés :** dans la console GCP (Identity Platform) ou la console Firebase liée au projet, ajoutez le **hostname** du front déployé (ex. `hatcast-xxx.run.app` ou votre domaine custom) dans **Authorized domains**, comme pour les autres flux Auth.
- **URL de continuation :** le SPA construit une URL absolue vers `/reinitialiser-mot-de-passe` sur **le même origine** que l’utilisateur (`window.location.origin`). Cette origine doit correspondre à un domaine autorisé ; sinon le clic sur le lien email peut échouer côté client.
- Après définition du nouveau mot de passe, la session applicative HatCast repose toujours sur **`POST /v1/auth/idp`** (échange ID token → cookie), comme pour une connexion classique.

#### Gestionnaire d’actions e-mail (console Firebase)

Le **domaine au début du lien** dans l’e-mail (variable `%LINK%` du modèle, hors `continueUrl`) est défini par la **configuration Auth du projet**, pas par le code Angular.

- **Console Firebase** → **Authentication** → **Settings** (Paramètres) : repérer la section qui fixe l’**URL du gestionnaire d’actions** pour les e-mails (réinitialisation du mot de passe, etc.) — le libellé exact peut varier selon la version de la console.
- Utiliser l’URL **hébergée par Firebase** pour les actions par e-mail, typiquement  
  `https://<PROJECT_ID>.firebaseapp.com/__/auth/action`  
  (ex. projet HatCast V2 : `impro-selector` → `https://impro-selector.firebaseapp.com/__/auth/action`), plutôt qu’un **ancien domaine applicatif** (ex. site V1 sur Firebase Hosting) si ce domaine servait encore de point d’entrée unique et envoyait les utilisateurs vers une page incompatible avec le flux V2.
- Après changement, vérifier un envoi réel : le lien doit passer par ce gestionnaire, avec le **`continueUrl`** (localhost, origine Cloud Run, etc.) correctement pris en compte une fois le domaine d’origine **autorisé** (voir puces ci-dessus).
- Référence : [Create custom email action handlers](https://firebase.google.com/docs/auth/custom-email-handler) (Firebase) — le comportement par défaut du gestionnaire `__/auth/action` suffit en général pour HatCast V2.

## 7. Vérifications post-déploiement

- `https://<service-url>/` charge l’SPA Angular.
- Navigation directe vers `/accueil` ou `/connexion` : pas de 404 (fallback SPA via Nginx).
- Connexion Google sans `origin_mismatch` (origine OAuth + CORS alignés sur cet env).
- `GET /v1/auth/me` après login.
- Après déploiement : tester **email / mot de passe** sur `/connexion` ; si **503** sur `POST /v1/auth/idp`, vérifier IAM du compte d’exécution Cloud Run (§6.1) et les logs JVM.
- Parcours **mot de passe oublié** : `/mot-de-passe-oublie` → email reçu → lien vers `/reinitialiser-mot-de-passe?...` (domaine autorisé, §6.2).

### 502 sur `/v1/...` (`connect() failed (111: Connection refused)` vers `127.0.0.1:8081`)

Souvent **Nginx** est prêt avant que **Spring** n’écoute sur `HATCAST_SERVER_PORT` (cold start, Flyway/Neon lent). L’image attend jusqu’à **240 s** que `http://127.0.0.1:8081/actuator/health` réponde avant de lancer Nginx ; variable optionnelle **`WAIT_FOR_API_SECONDS`** sur le service Cloud Run pour ajuster. Si l’API ne démarre pas (Neon injoignable, OOM, erreur Flyway), consulter les **logs** du révision Cloud Run (sortie Java + Nginx).

## Références

- [Neon — documentation](https://neon.tech/docs)
- [V2_GOOGLE_OAUTH_SETUP.md](V2_GOOGLE_OAUTH_SETUP.md)
- [ADR-0010 — Identity Platform (cible)](../../adr/0010-v2-auth-identity-platform.md)
- [ADR-0008 — Google OIDC + session (historique)](../../adr/0008-v2-spa-auth-google-session.md)
- [ADR-0009](../../adr/0009-neon-postgres-environments.md)
