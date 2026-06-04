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

**Mapping trigger git → environnement → service Cloud Run (recommandé)** :

| Trigger git | Environnement GitHub | Branche Neon (voir §5) | Exemple de nom de service Cloud Run |
|-------------|----------------------|-------------------------|-------------------------------------|
| `v2` (push) | `development` | `development` ou `dev` | `hatcast-v2-dev` |
| `staging-v2` (push) + `vX.Y.Z-rc.N` (tag RC) | `staging` | `staging` | `hatcast-v2-staging` |
| `vX.Y.Z` (tag prod) | `production` | branche **primary** (prod) | `hatcast-v2` |

La branche git **`staging`** reste dédiée au déploiement **V1** (Firebase Hosting, workflow [`.github/workflows/deploy-staging.yml`](../../.github/workflows/deploy-staging.yml)). Pour la V2, utiliser **`staging-v2`** : même environnement GitHub `staging` et mêmes secrets, sans déclencher ni mélanger les pipelines legacy.

Le workflow [`.github/workflows/deploy-v2-cloud-run.yml`](../../.github/workflows/deploy-v2-cloud-run.yml) applique cet environnement selon la branche ; les secrets ci-dessous doivent être **définis dans chaque environnement** (valeurs différentes par cible).

#### Gate CI E2E avant déploiement staging Cloud Run

Sur **`staging-v2` uniquement**, le workflow de déploiement exécute d’abord le smoke Playwright ([`.github/workflows/e2e-smoke.yml`](../../.github/workflows/e2e-smoke.yml), profil API `e2e`, recette 3.19 S2–S5). Le job **deploy** ne démarre que si ce smoke est **vert**.

| Trigger | Cloud Run cible | Gate E2E avant deploy |
|---------|-----------------|------------------------|
| `v2` (push) | `hatcast-v2-dev` (development) | **Non** |
| `staging-v2` (push) | `hatcast-v2-staging` | **Oui** |
| `vX.Y.Z-rc.N` (tag RC) | `hatcast-v2-staging` | **Oui** |
| `vX.Y.Z` (tag prod) | `hatcast-v2` (production) | **Non** |

Le même workflow `e2e-smoke.yml` reste aussi déclenché en **standalone** sur les PR et les push vers `v2` (palier 2 CI, sans bloquer le deploy dev cloud).

#### Environnement GitHub `staging` — branche de déploiement

Dans **Settings → Environments → staging → Deployment branches**, choisir **Selected branch** et indiquer **`staging-v2`** (pas `staging`, réservée à la V1). Les secrets `HATCAST_DATASOURCE_*` et le reste du tableau « par environnement » restent sur l’environnement nommé `staging`.

Créer la branche git (point de départ = ligne V2 actuelle, en général `v2`) :

```bash
git fetch origin
git checkout v2
git pull origin v2
git checkout -b staging-v2
git push -u origin staging-v2
```

Ensuite, les merges habituels vers la préprod V2 se font sur **`staging-v2`** (ex. `v2` → `staging-v2`), sans toucher à **`staging`** (V1).

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

Le workflow les passe en `--build-arg` Docker ; le script [`apps/web/scripts/inject-google-client-id.mjs`](../../apps/web/scripts/inject-google-client-id.mjs) les injecte dans `environment.ts` au build (`HATCAST_FIREBASE_*`, `HATCAST_WEB_PUSH_VAPID_PUBLIC_KEY` depuis les secrets d’environnement). Alignez-les sur la **même** appli Web / projet GCP qu’Identity Platform.

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
| `HATCAST_SUPER_ADMIN_EMAILS` | Emails opérateurs séparés par des virgules — admin plateforme (menu Membres, join policy, routes `/v1/admin/*`). **Obligatoire** sur l’environnement GitHub **`production`** (gate CI tag `vX.Y.Z`). Injecté sur Cloud Run par le workflow ; **ne jamais** committer les adresses dans le dépôt. |
| `HATCAST_MIGRATION_API_KEY` | **Staging uniquement** — clé longue aléatoire pour l’orchestrateur `migrate:v2:run` ([ADR-0017](../adr/0017-v2-migration-api-key.md)). Jamais activé en prod sans décision explicite. |
| `HATCAST_MIGRATION_OPERATOR_EMAIL` | **Staging uniquement** — email d’un `UserEntity` existant (super-admin plateforme) utilisé comme opérateur CLI. Pair avec `HATCAST_MIGRATION_API_KEY`. |
| `HATCAST_WEB_PUSH_VAPID_PUBLIC_KEY` | Clé VAPID **publique** Web Push (opt-in navigateur, story 8.1). Même valeur que V1 (`legacy/src/services/configService.js`). Exposée au SPA via `GET /v1/config/public`. **Recommandé** dans les trois environnements GitHub (`development`, `staging`, `production`). |
| `HATCAST_WEB_PUSH_VAPID_PRIVATE_KEY` | Clé VAPID **privée** — **story 8.3** (envoi `web-push`). Non présente dans le dépôt V1 (FCM Admin SDK). Récupérer dans **Firebase Console → Project settings → Cloud Messaging → Web configuration** (paire associée à la clé publique). Ne pas committer. |
| `HATCAST_WEB_PUSH_VAPID_SUBJECT` | (Optionnel) Claim VAPID `sub` — défaut `mailto:contact@hatcast.app` dans `application.yml`. |
| `HATCAST_NOTIFICATION_EMAIL_ENABLED` | `true` ou `false` — active l’envoi email story **8.3** (défaut API : `false`). |
| `HATCAST_NOTIFICATION_EMAIL_FROM` | En-tête From, ex. `HatCast <noreply@hatcast.app>`. Pas de guillemets dans l’UI GitHub Secrets. |
| `SPRING_MAIL_HOST` | Hôte SMTP, ex. `smtp.gmail.com`. Requis si `HATCAST_NOTIFICATION_EMAIL_ENABLED=true`. |
| `SPRING_MAIL_PORT` | Port SMTP, ex. `587`. |
| `SPRING_MAIL_USERNAME` | Utilisateur SMTP (adresse configurée chez le fournisseur). |
| `SPRING_MAIL_PASSWORD` | Mot de passe d’application Google (16 caractères ; espaces affichés par Google acceptés tels quels dans le secret). |
| `SPRING_MAIL_PROPERTIES_MAIL_SMTP_AUTH` | `true` pour Gmail. |
| `SPRING_MAIL_PROPERTIES_MAIL_SMTP_STARTTLS_ENABLE` | `true` pour Gmail sur port 587. |

Le workflow [`.github/workflows/deploy-v2-cloud-run.yml`](../../.github/workflows/deploy-v2-cloud-run.yml) injecte ces secrets (s’ils existent) dans `--set-env-vars` à chaque déploiement Cloud Run. **Push seul :** VAPID publique + privée suffisent. **Email :** définir `HATCAST_NOTIFICATION_EMAIL_ENABLED=true` **et** la paire `SPRING_MAIL_*` complète.

**Parité V1 prod (Gmail)** — exemple de jeu de secrets par environnement :

| Secret | Valeur type |
|--------|-------------|
| `HATCAST_NOTIFICATION_EMAIL_ENABLED` | `true` |
| `HATCAST_NOTIFICATION_EMAIL_FROM` | `HatCast <noreply@example.com>` (votre expéditeur prod) |
| `SPRING_MAIL_HOST` | `smtp.gmail.com` |
| `SPRING_MAIL_PORT` | `587` |
| `SPRING_MAIL_USERNAME` | Compte SMTP configuré |
| `SPRING_MAIL_PASSWORD` | App Password Google (collé tel quel, espaces OK) |
| `SPRING_MAIL_PROPERTIES_MAIL_SMTP_AUTH` | `true` |
| `SPRING_MAIL_PROPERTIES_MAIL_SMTP_STARTTLS_ENABLE` | `true` |

**Local (`.env`)** : guillemets doubles si la valeur contient des espaces (`SPRING_MAIL_PASSWORD="…"`, `HATCAST_NOTIFICATION_EMAIL_FROM="HatCast <…>"`). **GitHub Secrets** : coller la valeur brute, sans guillemets.

**Local dev — Mailpit (poste, `./scripts/start-dev.sh` uniquement)** : ne pas confondre avec staging/prod.

| Cible | SMTP | Mailpit |
|-------|------|---------|
| `./scripts/start-dev.sh` + `HATCAST_NOTIFICATION_EMAIL_ENABLED=true` | Script force `127.0.0.1:1025` | Docker auto (`hatcast-mailpit`), UI http://127.0.0.1:8025, arrêt à la fin du script |
| `./scripts/start-dev.sh` + `HATCAST_NOTIFICATION_EMAIL_ENABLED=false` | — | Non démarré |
| `npm run dev:api` / `bootRun` seul | Variables `.env` telles quelles | Non géré par le script |
| Cloud Run (dev/staging/prod) | Secrets `SPRING_MAIL_*` (Gmail) | N/A |

Dans `.env` local, **`HATCAST_NOTIFICATION_EMAIL_ENABLED=true`** suffit pour la recette email via `start-dev.sh` — pas besoin de `SPRING_MAIL_*` local (le script écrase vers Mailpit). Voir [DEVELOPMENT.md](../../../DEVELOPMENT.md) et [`.env.example`](../../../.env.example).

**Ne pas définir** `HATCAST_SEED_TROUPE_ID` (supprimé en story 18.5). L’onboarding « Rejoindre la troupe de démonstration » cible la troupe **Démo** (`a0000001-0000-4000-8000-000000000099`, Flyway) ; **Les Improbots** (`…000001`) est un seed dev uniquement.

Le workflow utilise `google-github-actions/auth` avec `workload_identity_provider` et `service_account` (secrets dépôt).

## 4. Cloud Run — accès public (IAM) et origines OAuth

### 4.1 Accès public au service (`403 Forbidden`)

Le workflow passe `--allow-unauthenticated` à `gcloud run deploy`, mais le compte de service CI peut **ne pas avoir** le droit d’appliquer la policy IAM (`Setting IAM policy failed` dans les logs GitHub). Symptôme : le service est **vert** dans la console, mais le navigateur affiche **403 Forbidden** — *Your client does not have permission to get URL / from this server*.

**Après le premier déploiement réussi** (ou si le warning IAM apparaît), accorder **Invoquer Cloud Run** au public :

```bash
gcloud run services add-iam-policy-binding "${SERVICE_NAME}" \
  --region "${GCP_REGION}" \
  --member="allUsers" \
  --role="roles/run.invoker"
```

Exemple staging :

```bash
gcloud run services add-iam-policy-binding hatcast-v2-staging \
  --region europe-west9 \
  --member="allUsers" \
  --role="roles/run.invoker"
```

Alternative : console Cloud Run → service → **Sécurité** / **Permissions** → principal **`allUsers`** → rôle **Cloud Run Invoker**.

Le workflow CI tente aussi ce binding après chaque deploy (avertissement GitHub Actions si échec — policy org ou droits SA insuffisants).

> Une **policy d’organisation** peut interdire `allUsers` ; dans ce cas, documenter l’alternative (IAP, accès authentifié GCP, etc.).

### 4.2 Mémoire JVM (OOM au démarrage)

Spring Boot + Nginx dans la même image peuvent dépasser **512 Mi** au cold start (Flyway, parsing JPQL). Symptôme : logs **`Java heap space`** pendant la création des beans JPA, révision Cloud Run en échec « port 8080 ».

Recommandation **staging / production** : **1 Gi** RAM minimum (le workflow CI applique déjà `--memory 1Gi` et `--cpu 1` — voir [`.github/workflows/deploy-v2-cloud-run.yml`](../../.github/workflows/deploy-v2-cloud-run.yml)).

Ajustement manuel si besoin avant le prochain deploy CI :

```bash
gcloud run services update "${SERVICE_NAME}" \
  --region "${GCP_REGION}" \
  --memory 1Gi \
  --cpu 1
```

### 4.3 Origines OAuth (une par environnement)

Après chaque **premier** déploiement sur un environnement, récupérer l’URL HTTPS du service (console Cloud Run ou `gcloud run services describe`).

1. Dans **Google Cloud Console > APIs & Credentials > Client OAuth Web**, ajouter chaque URL en **Authorized JavaScript origins** (schéma `https://`, **sans** chemin, **sans** slash final).  
   Ex. staging : `https://hatcast-v2-staging-730278491306.europe-west9.run.app`  
   Sans cette entrée : **Error 400: origin_mismatch** au clic « Continuer avec Google ».
2. **Identity Platform / Firebase Auth** → **Authorized domains** : ajouter le **hostname** seul (ex. `hatcast-v2-staging-730278491306.europe-west9.run.app`).
3. Mettre à jour le secret **`HATCAST_CORS_ALLOWED_ORIGINS`** de **l’environnement** GitHub correspondant avec **exactement** la même origine que (1), puis redeployer ou `gcloud run services update … --update-env-vars`.

Voir [V2_GOOGLE_OAUTH_SETUP.md](V2_GOOGLE_OAUTH_SETUP.md) pour le détail multi-environnements.

## 5. PostgreSQL sur Neon (un projet, quatre branches)

- Créer un **projet Neon** ([console](https://console.neon.tech)).
- **Branche primary** : données de **production** (alignée avec les déploiements depuis le tag prod `vX.Y.Z`).
- Branches enfant (depuis la primary ou selon votre politique Neon) :
  - **`staging`** — recette V2 (`staging-v2` → Cloud Run staging).
  - **`development`** — **cloud dev seulement** (`v2` → `hatcast-v2-dev`, secrets GitHub `development`). Profil Spring **`cloud`** : Flyway **`db/migration` uniquement** (ADR-0014) — pas de seeds Les Improbots.
  - **`local`** — **poste développeur uniquement** (`.env` → `HATCAST_DATASOURCE_*`, jamais dans GitHub Actions). Profil Spring **`dev`** : Flyway `db/migration` + `db/seed` (Les Improbots, MVP, context switcher).

| Cible | Branche Neon | Profil Spring | Flyway | Credentials |
|-------|--------------|---------------|--------|-------------|
| `./scripts/start-dev.sh` | **`local`** | `dev` | migration + seed | `.env` local |
| `hatcast-v2-dev` (push `v2`) | **`development`** | `cloud` | migration seule | GitHub env `development` |
| `hatcast-v2-staging` | **`staging`** | `cloud` | migration seule | GitHub env `staging` |
| `hatcast-v2` (prod) | **primary** | `cloud` | migration seule | GitHub env `production` |

**Pourquoi séparer `local` et `development` ?** Le dev local exécute les scripts `db/seed` et peut regénérer Les Improbots ; le cloud dev ne charge pas ces scripts. Partager une branche provoquait des échecs Flyway au démarrage Cloud Run (`Detected applied migration not resolved locally`) et couplait les resets seed locaux au service déployé. Voir [ADR-0009](../../adr/0009-neon-postgres-environments.md).

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

Sur Cloud Run (`HATCAST_SPRING_PROFILE=cloud`), Flyway n’applique que `classpath:db/migration` — **pas** les scripts sous `db/seed` (données Les Improbots / MVP). Voir [ADR-0014](../../adr/0014-v2-preprod-migration-no-seed.md) et le runbook [preprod-reset-and-migrate.md](../migration/preprod-reset-and-migrate.md) pour alimenter staging depuis **Firestore V1 production** (`default`).

**Symptôme :** l’UI charge (Nginx) mais l’API ne répond pas ; logs Cloud Run `FlywayValidateException: Detected applied migration not resolved locally` (versions 3.1, 4, 6, 17, … — scripts `db/seed`), puis `exited: api (exit status 1)` en boucle.

**Cause :** la branche Neon **`development`** (cloud dev) avait reçu des migrations **`db/seed`** (profil `dev` ou ancienne config partagée avec le poste local). Le déploiement `cloud` ne charge plus ces scripts.

**Prévention (2026-05-28) :** branche Neon **`local`** pour le poste (`dev` + seeds) ; branche **`development`** réservée à `hatcast-v2-dev` (`cloud`, schéma seul). Ne plus pointer `.env` vers `development`.

**Correctif ops :** reset de la branche Neon concernée (`development`, `staging`, …) puis redeploy — ou purge ciblée des lignes seed dans `flyway_schema_history`. **Pas** de contournement Flyway côté app : le profil `cloud` doit échouer au démarrage si l’historique ne correspond pas au classpath (fail-fast).

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

### Post-deploy smoke (Epic 18 / NFR-R1)

Checklist manuelle après déploiement couplé SPA + API (staging ou production) :

1. Ouvrir l’URL du service → se connecter (Google ou email).
2. Aller sur `/troupes` (ou CTA vide sur `/agenda`).
3. Cliquer **Rejoindre la troupe de démonstration**.
4. Vérifier la redirection vers **`/saison/demo/saison-2026-2027`** et le fil d’Ariane **Démo › Saison 2026-2027** (sans chip badge).
5. Ouvrir un spectacle **en préparation** (ex. événement seed bootstrap si visible) → renseigner une première disponibilité → enregistrer.
6. (Optionnel) Avec `HATCAST_SUPER_ADMIN_EMAILS` incluant l’email opérateur, vérifier l’accès aux surfaces admin plateforme.

### Vérifications techniques

- Pas de **403 Forbidden** sur `/` (IAM `run.invoker` pour `allUsers`, §4.1).
- `https://<service-url>/` charge l’SPA Angular.
- Navigation directe vers `/accueil` ou `/connexion` : pas de 404 (fallback SPA via Nginx).
- Connexion Google sans **`origin_mismatch`** (origine OAuth §4.3 + CORS alignés sur cet env).
- `GET /v1/auth/me` après login.
- Après déploiement : tester **email / mot de passe** sur `/connexion` ; si **503** sur `POST /v1/auth/idp`, vérifier IAM du compte d’exécution Cloud Run (§6.1) et les logs JVM.
- Parcours **mot de passe oublié** : `/mot-de-passe-oublie` → email reçu → lien vers `/reinitialiser-mot-de-passe?...` (domaine autorisé, §6.2).

### 502 sur `/v1/...` (`connect() failed (111: Connection refused)` vers `127.0.0.1:8081`)

Souvent **Nginx** est prêt avant que **Spring** n’écoute sur `HATCAST_SERVER_PORT` (cold start, Flyway/Neon lent). L’image attend jusqu’à **240 s** que `http://127.0.0.1:8081/actuator/health` réponde avant de lancer Nginx ; variable optionnelle **`WAIT_FOR_API_SECONDS`** sur le service Cloud Run pour ajuster. Si l’API ne démarre pas (Neon injoignable, OOM, erreur Flyway), consulter les **logs** du révision Cloud Run (sortie Java + Nginx).

## 7. Prod custom domain `hatcast.app` (OPS-8, V2.0.0)

**Scope :** production uniquement (`hatcast-v2`, environnement GitHub **`production`**, trigger tag **`vX.Y.Z`**). **Staging** (`hatcast-v2-staging`) et **dev cloud** (`hatcast-v2-dev`) restent en **`europe-west9`** avec leurs URLs `*.run.app` — pas de migration.

**Registrar / DNS :** **`hatcast.app`** chez **Cloudflare** (Registrar + zone DNS). **Prod Cloud Run :** région **`europe-west1`** (domain mapping natif — **non** disponible en `europe-west9`).

### 7.1 GitHub Environment `production`

| Paramètre | Valeur |
|-----------|--------|
| `GCP_REGION` | `europe-west1` |
| `GCP_ARTIFACT_REGISTRY` | `europe-west1-docker.pkg.dev/PROJECT/hatcast-v2/hatcast-api` (sans tag) |
| `HATCAST_CORS_ALLOWED_ORIGINS` | `https://hatcast.app` (exact, sans slash final) |

Ne pas modifier les secrets des environnements **`staging`** / **`development`** (west9).

### 7.2 Cloud Run domain mapping + Cloudflare

1. Vérifier le domaine dans **Google Search Console** si demandé par GCP.
2. **Cloud Run** (`hatcast-v2`, `europe-west1`) → **Manage custom domains** → `hatcast.app` (et `www` si redirection vers apex).
3. Créer les enregistrements DNS dans **Cloudflare** (valeurs affichées par GCP).
4. **SSL/TLS** Cloudflare : **Full (strict)**.
5. **Provisioning certificat Google :** enregistrements en **DNS only (nuage gris)** jusqu’à mapping **Active** (~10–30 min), puis **Proxied (orange)**.
6. Règles cache : **bypass** `/v1/*`, `/actuator/*` ; prudence sur `index.html` / `ngsw.json` (PWA).

### 7.3 Auth (prod)

- **OAuth Web** : origine JavaScript `https://hatcast.app`.
- **Identity Platform / Firebase Auth** : domaine autorisé `hatcast.app`.
- Aligner **`HATCAST_CORS_ALLOWED_ORIGINS`** (§4.3).

Recette : § vérifications techniques ci-dessus sur `https://hatcast.app` ; `BASE_URL=https://hatcast.app ./scripts/check-pwa.sh`.

### 7.4 Suivi V2.0.0 (non bloquant M4)

| ID | Sujet |
|----|--------|
| **OPS-9** | PostHog EU — voir **§7.5** |
| **OPS-10** | E-mail `noreply@hatcast.app` / `info@hatcast.app` — SPF/DKIM, `HATCAST_NOTIFICATION_EMAIL_FROM` |

Story : [_bmad-output/implementation-artifacts/ops-8-prod-domain-hatcast-app.md](../../_bmad-output/implementation-artifacts/ops-8-prod-domain-hatcast-app.md). PLAN § Wave V2.0.0 Wave F ; SCP amend. 2026-06-03.

### 7.5 PostHog EU + proxy `e.hatcast.app` (OPS-9 / FR47)

Analytics produit **MVP** : opérateurs via le projet PostHog uniquement (pas d’UI dans l’app). Événements workflow anonymisés côté `apps/web` (`posthog-js`).

#### Projet PostHog Cloud EU

1. Créer un projet sur **[eu.posthog.com](https://eu.posthog.com)** (région **EU**).
2. Récupérer la **Project API Key** (clé publique d’ingestion — même classe que `apiKey` Firebase côté front).
3. Dashboards pilote : filtrer **`is_demo_troupe != true`** pour exclure la troupe Démo (FR64 / ADR-0015).

**Événement `notification_link_opened` (MVP)** : déclenché dès que l’URL contient `?tab=dispos|equipe`, `?showConfirm=true` ou `?showAvailability=true` — y compris navigation manuelle ou favori, pas seulement un clic email/push (pas de param `src=notif` dans cette story). Interpréter les KPI « suivi notification » comme indicateur de **deep-link tab**, pas de source notif exclusive.

#### Proxy managé (recommandé)

1. PostHog → **Organization settings** → **Proxy** → **New managed proxy**.
2. Sous-domaine : **`e.hatcast.app`** (label DNS `e` uniquement).
3. Cloudflare (zone `hatcast.app`) : enregistrement **CNAME** `e` → cible affichée par PostHog (ex. `*.proxy-eu.posthog.com` ou équivalent EU dans l’UI).
4. **DNS only (nuage gris)** jusqu’à statut **live** dans PostHog ; ensuite laisser en gris (mode managé — **ne pas** passer en proxied orange pour ce CNAME).
5. Le SPA prod utilise `api_host: https://e.hatcast.app` et `ui_host: https://eu.posthog.com`.

**Fallback (hors scope par défaut)** : Worker Cloudflare + proxied orange si le proxy managé échoue (zone hold, etc.) — documenter l’incident, ne pas mélanger avec l’apex `hatcast.app` (orange pour l’app).

#### Build & secrets GitHub

| Secret / variable | Environnement | Rôle |
|-------------------|---------------|------|
| `HATCAST_POSTHOG_PROJECT_API_KEY` | **production** (recommandé) | Injectée au build Docker via `inject-google-client-id.mjs` → `environment.posthogApiKey` |
| *(vide)* | staging, development, local, CI | PostHog **désactivé** (aucun appel réseau) |

Workflow : `.github/workflows/deploy-v2-cloud-run.yml` passe `--build-arg HATCAST_POSTHOG_PROJECT_API_KEY=…` sur l’image unique.

Local optionnel : `HATCAST_POSTHOG_PROJECT_API_KEY` dans `.env` + `./scripts/start-dev.sh --with-push` (régénère `environment.ts`).

#### Recette post-déploiement (AC14)

1. Ouvrir `https://hatcast.app`, se connecter.
2. DevTools → **Network** : après une action (ex. première dispo sur un événement non-démo), les requêtes d’ingestion vont vers **`https://e.hatcast.app`** (pas `eu.i.posthog.com` directement).
3. PostHog EU → **Live events** : vérifier `availability_first_submission` ou autre événement FR47.

#### Staging vs prod

Par défaut **prod seule** reçoit la clé. Pour un projet PostHog staging séparé, ajouter le secret sur l’environnement GitHub `staging` et documenter la décision PO.

## Références

- [Neon — documentation](https://neon.tech/docs)
- [V2_GOOGLE_OAUTH_SETUP.md](V2_GOOGLE_OAUTH_SETUP.md)
- [ADR-0010 — Identity Platform (cible)](../../adr/0010-v2-auth-identity-platform.md)
- [ADR-0008 — Google OIDC + session (historique)](../../adr/0008-v2-spa-auth-google-session.md)
- [ADR-0009](../../adr/0009-neon-postgres-environments.md)
