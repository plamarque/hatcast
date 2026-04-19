# Story 1.2 : Inscription et connexion email / mot de passe

Status: done

<!-- Validation optionnelle : exécuter validate-create-story avant dev-story. -->
<!-- bmad-create-story:validate — 2026-04-19 — OK ready-for-dev ; renforcements opérateurs + env -->

## Story

As a visitor or unauthenticated user,  
I want to **register** with email and password and **sign in** with those credentials,  
so that I can use HatCast without a Google account (V1 parity).

## Acceptance Criteria

1. **Inscription (parité V1) :** Given a visitor without an email/password account, when they complete **sign-up** with valid data (password rules per product), then an account exists and they can use the app (session established or sign-in prompt per chosen flow — document; align with [ADR-0010](../../docs/adr/0010-v2-auth-identity-platform.md) when using Identity Platform).
2. **Connexion (FR2) :** Given an existing email/password account, when they submit correct credentials on the sign-in experience, then authenticated access is established per [ADR-0010](../../docs/adr/0010-v2-auth-identity-platform.md) (session cookie and/or validated token flow — document the chosen bridge) and they reach the signed-in experience (e.g. `/accueil` or intended route), NFR-S1.
3. **Invalid credentials (NFR-S1, anti-énumération) :** Given wrong email and/or password at sign-in, when sign-in is attempted, then the UI shows a **generic** message (no “unknown user” vs “wrong password” distinction).
4. **Inscription — erreurs :** Given sign-up with an email already in use or invalid data, when submit runs, then the UI shows **safe, generic or provider-aligned** messages without leaking enumeration (same spirit as sign-in).
5. **Cohérence avec 1.1 :** Same screen area or clear navigation: **Google** (story 1.1) and **email** paths coherent with V1; reuse UX patterns (`AuthApiService` where still valid, MatSnackBar, [`oauth-demo`](../../apps/web/src/app/pages/oauth-demo/oauth-demo.ts) layout as baseline). **Garde-fou :** le slice 1.1 envoie un **JWT Google** (`iss` Google) vers `POST /v1/auth/google` ; **Identity Platform** utilise des **ID tokens** avec issuer typique `https://securetoken.google.com/...` (voir ADR). Pour un référentiel utilisateur unique, prévoir **migration du flux Google** vers le **fournisseur Google du client Identity Platform** (souvent documenté comme `GoogleAuthProvider` dans les guides Google — **nom d’API**, produit = Identity Platform) ou stratégie de liaison documentée — voir Dev Notes.
6. **Contrat & ADR :** Document auth-related endpoints in [`services/api/openapi/auth.yaml`](../../services/api/openapi/auth.yaml). Target identity model per [ADR-0010](../../docs/adr/0010-v2-auth-identity-platform.md) (IdP-managed passwords, no app-side password storage). If a transitional **Spring session + cookie** bridge remains after token verification (`verifyIdToken` via l’Admin SDK Google — artefact `firebase-admin`), document it explicitly until full Bearer/token model is in place.

## Tasks / Subtasks

- [x] **Périmètre :** `apps/web` + `services/api` ; ne pas modifier `legacy/` dans cette story.
- [x] **Hors périmètre (ne pas livrer ici) :** reset « mot de passe oublié » → story **1.3** ; case **se souvenir de moi** → **1.4** ; menu complet **Mon compte** / suppression → **1.5–1.7** (peut poser uniquement les liens UI minimaux cohérents avec l’epic).
- [x] **Fournisseur :** Inscription + connexion email/mot de passe via **Google Cloud Identity Platform** ([ADR-0010](../../docs/adr/0010-v2-auth-identity-platform.md)) ; **aucun** hash de mot de passe applicatif ; persistance métier : colonne **`idp_uid`** (uid Identity Platform) ou équivalent dans Postgres + email/displayName synchronisés depuis le token / profil.
- [x] **Dépendance API :** Bibliothèque de **vérification de tokens** pour Identity Platform : artefact Maven officiel **`com.google.firebase:firebase-admin`** (nom technique Google — voir ADR *Clarification*) dans [`services/api/build.gradle.kts`](../../services/api/build.gradle.kts) ; config **compte de service** GCP (secret / `GOOGLE_APPLICATION_CREDENTIALS` — ne jamais committer la clé).
- [x] **API :** Endpoint(s) documenté(s) acceptant un **ID token Identity Platform** (ex. échange session) ; `verifyIdToken` → `uid` ; créer/mettre à jour l’utilisateur métier ; étendre [`SecurityConfig`](../../services/api/src/main/kotlin/com/hatcast/api/config/SecurityConfig.kt) (CSRF/CORS pour nouveaux POST publics, aligné 1.1).
- [x] **Schéma données :** Migration Flyway si besoin : colonne **`idp_uid`** (unique), évolution depuis `google_sub` uniquement (voir ADR-0010 *Migration*).
- [x] **Unification Google (1.1) :** Travailler avec l’équipe / slice suivante si besoin : remplacer ou compléter GIS pur par **connexion Google via le client Identity Platform** pour obtenir le **même type d’ID token** que l’email/mot de passe. _(Non fait dans ce lot — documenté ; flux Google historique inchangé.)_
- [x] **Angular :** SDK client **Identity Platform** (souvent config et modules documentés sous le bundle npm `firebase` / `@angular/fire` — **détail de packaging**, produit = Identity Platform) ; initialisation par **config Web** GCP (`apiKey`, `authDomain`, `projectId`, …) via `environment` ; formulaires **register** + **login** ; messages [`auth-user-message`](../../apps/web/src/app/core/auth/auth-user-message.ts) ; discipline **XSS** (pas de secrets en dur côté client).
- [x] **Config & secrets :** Exposer les clés **publiques** adaptées dans les `environment` Angular ; secrets compte de service et variables déploiement API via **secrets CI / `.env` local** (mettre à jour [`.env.example`](../../.env.example) avec les noms de variables, sans valeurs sensibles).
- [x] **Tests :** API (token valide/invalide, `uid` mapping) ; web (happy path + erreurs génériques) ; **non-régression** du bouton Google existant ou plan de bascule explicite.

## Dev Notes

### Architecture & garde-fous

- **Décision cible :** [ADR-0010](../../docs/adr/0010-v2-auth-identity-platform.md). L’implémentation historique « GIS + JWT Google + `POST /v1/auth/google` + session JDBC » ([ADR-0008](../../docs/adr/0008-v2-spa-auth-google-session.md), Deprecated) est le **code actuel** ; cette story la **fait converger** vers des **ID tokens Identity Platform** pour email **et** idéalement Google.
- **Risque principal :** deux chemins parallèles (JWT Google direct vs tokens Identity Platform) ⇒ doubles identités ou logique divergente ; traiter explicitement dans l’implémentation ou une sous-tâche « aligner 1.1 sur le client Identity Platform ».
- CORS + origines explicites : maintenir la liste par env ([`application.yml`](../../services/api/src/main/resources/application.yml) / secrets) ; **NFR-R1** si changement de contrat auth.
- **Console GCP :** pour Identity Platform, vérifier les **domaines autorisés** / origines autorisées pour le client Web (sinon erreurs type `auth/unauthorized-domain` côté client) — en parallèle de la config CORS API.

### Fichiers / zones probables

| Zone | Fichiers / dossiers |
|------|---------------------|
| API | `services/api/src/main/kotlin/com/hatcast/api/auth/`, `.../user/`, `.../config/`, migrations si mapping `uid` |
| OpenAPI | `services/api/openapi/auth.yaml` |
| Angular | `apps/web/src/app/core/auth/`, pages connexion |

### Références

- [Epics — Story 1.2](../planning-artifacts/epics.md) (section *Inscription et connexion email / mot de passe*)
- [ADR-0010 — Identity Platform](../../docs/adr/0010-v2-auth-identity-platform.md)
- Story précédente : [`1-1-connexion-avec-fournisseur-oauth-google.md`](./1-1-connexion-avec-fournisseur-oauth-google.md)

### Intelligence story 1.1 (continuité)

- Parcours racine → `/accueil` ou `/connexion` ; snackbars Material ; `AuthApiService` à étendre pour les flux email/IdP.

## Dev Agent Record

### Agent Model Used

Composer (implémentation story 1.2)

### Debug Log References

### Completion Notes List

- **API :** `POST /v1/auth/idp` avec corps `{ idToken }` ; vérification `FirebaseAuth.verifyIdToken` (profil `!test`) ; session JDBC inchangée ; `UserEntity` : `google_sub` nullable, `idp_uid` ; `SessionUserPrincipal` : `idpUid` + `googleSub`.
- **Init Firebase Admin :** fichier JSON via `GOOGLE_APPLICATION_CREDENTIALS` en local ; sur **Cloud Run**, repli **Application Default Credentials** + `GOOGLE_CLOUD_PROJECT` (`IdentityPlatformFirebaseInitializer`).
- **Garde-fou :** si aucune app Firebase initialisée (hors profil `test`), `POST /v1/auth/idp` → **503** (évite un 401 trompeur).
- **Angular :** `firebase` npm ; formulaires email sur `/connexion` ; `signInWithIdentityPlatformIdToken` ; UI masquée si `environment.firebase` incomplet.
- **CI / Docker :** secrets `HATCAST_FIREBASE_*` + script `inject-google-client-id.mjs` pour le build prod ; workflow injecte `GOOGLE_CLOUD_PROJECT` — voir `docs/v2/technical/DEPLOY_V2_CLOUD_RUN.md` §6.1.
- **Validation :** parcours email/mot de passe OK en **local** et en **environnement dev** (déploiement Cloud Run) après configuration secrets + IAM.
- **Tests :** `AuthControllerIntegrationTest` mocke `IdpIdTokenVerifier` ; exécuter `./gradlew test` localement (JDK 21).

### File List

**API**

- `services/api/build.gradle.kts`
- `services/api/src/main/resources/db/migration/V2__users_idp_uid.sql`
- `services/api/src/main/kotlin/com/hatcast/api/user/UserEntity.kt`
- `services/api/src/main/kotlin/com/hatcast/api/user/UserRepository.kt`
- `services/api/src/main/kotlin/com/hatcast/api/auth/SessionUserPrincipal.kt`
- `services/api/src/main/kotlin/com/hatcast/api/auth/IdpTokenPayload.kt`
- `services/api/src/main/kotlin/com/hatcast/api/auth/IdpIdTokenVerifier.kt`
- `services/api/src/main/kotlin/com/hatcast/api/auth/FirebaseIdpIdTokenVerifier.kt`
- `services/api/src/main/kotlin/com/hatcast/api/auth/IdentityPlatformFirebaseInitializer.kt`
- `services/api/src/main/kotlin/com/hatcast/api/auth/AuthController.kt`
- `services/api/src/main/kotlin/com/hatcast/api/config/SecurityConfig.kt`
- `services/api/openapi/auth.yaml`
- `services/api/src/test/kotlin/com/hatcast/api/auth/AuthControllerIntegrationTest.kt`
- `services/api/README.md`

**Web**

- `apps/web/package.json` (+ lockfile)
- `apps/web/src/environments/environment.ts`
- `apps/web/src/environments/environment.development.ts`
- `apps/web/src/app/core/auth/auth-api.service.ts`
- `apps/web/src/app/core/auth/auth-user-message.ts`
- `apps/web/src/app/pages/oauth-demo/oauth-demo.ts`
- `apps/web/src/app/pages/oauth-demo/oauth-demo.html`
- `apps/web/src/app/pages/oauth-demo/oauth-demo.scss`

**Racine**

- `.env.example`
- `.github/workflows/deploy-v2-cloud-run.yml`
- `Dockerfile`
- `.gitignore` (excl. `skills-lock.json` — tooling Cursor)

**Docs**

- `docs/v2/technical/DEPLOY_V2_CLOUD_RUN.md` (§6.1 Identity Platform, secrets `HATCAST_FIREBASE_*`)

## Story completion status

- **Status:** done (clôturée après validation **dev** déployé)  
- **Date :** 2026-04-19  
- **Clé sprint :** `1-2-inscription-et-connexion-email-mot-de-passe`
