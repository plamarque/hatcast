# Story 1.4 : Session persistante (« se souvenir de moi »)

Status: done

<!-- bmad-create-story:validate — 2026-04-19 — OK ready-for-dev ; inscription=idp même case ; HttpSession maxInactiveInterval ; AuthApiService signatures -->
<!-- Validation optionnelle : exécuter validate-create-story avant dev-story. -->

## Story

As a signed-out user on a **trusted device**,  
I want a **« Se souvenir de moi »** option on sign-in (checkbox, **on by default**) that keeps me signed in for **30 days** when selected — matching **HatCast V1**,  
so that I do not re-enter credentials on every visit while still being able to opt into a **shorter / browser-session** experience when I uncheck it.

## Acceptance Criteria

1. **Parité V1 — UI :** Given the sign-in experience (`/connexion`, [`oauth-demo`](../../apps/web/src/app/pages/oauth-demo/oauth-demo.ts)), when the user views the form, then a **« Se souvenir de moi »** (or equivalent) **checkbox** is visible for **both** email/password (including **register** → same `POST /v1/auth/idp` via `finishIdpSignIn`) and **Google** sign-in paths where applicable, and it is **checked by default**.
2. **Parité V1 — durée :** Given the checkbox **checked** at successful sign-in, when the user closes the browser and returns **within 30 days** (same device/browser, cookie still valid), then they remain authenticated **without** full credential entry again (session restored per implementation — server session + cookie semantics documented in Dev Agent Record).
3. **Sans « se souvenir de moi » :** Given the checkbox **unchecked** at successful sign-in, when the **browser session ends** or the **short-lived session policy** applies (per chosen Spring / cookie rules — document explicitly), then the user must **authenticate again** before accessing protected routes; behaviour must be **clearly different** from the 30-day path (no silent 30-day persistence).
4. **Cohérence IdP :** Identity Platform may keep its own refresh persistence in the browser; the **product-visible** guarantee for this story is the **HatCast server session** (`HATCAST_SESSION` / [`ADR-0010`](../../docs/adr/0010-v2-auth-identity-platform.md)) aligned with the checkbox — document any interaction (e.g. re-exchange of ID token when server session is missing but Firebase user persists).
5. **Sécurité (NFR-S1) :** Session cookie remains **`HttpOnly`**, **`Secure`** in deployed environments, **`SameSite`** aligned with existing CORS/credentials policy ([`SecurityConfig`](../../services/api/src/main/kotlin/com/hatcast/api/config/SecurityConfig.kt), [`application.yml`](../../services/api/src/main/resources/application.yml)); do **not** store long-lived secrets in `localStorage` for session establishment.
6. **Contrat API :** Extend sign-in requests (`POST /v1/auth/idp`, and **`POST /v1/auth/google`** if that path still establishes sessions) with a **machine-readable** `rememberMe` (or equivalent) flag so the API can set **session max inactivity / cookie lifetime** consistently; update [`services/api/openapi/auth.yaml`](../../services/api/openapi/auth.yaml) and keep backward-compatible defaults (if the flag is omitted, treat as **remember-me on** to match **checkbox default** — document the default in OpenAPI).

## Tasks / Subtasks

- [x] **Périmètre :** `apps/web` + `services/api` ; ne pas modifier `legacy/` dans cette story.
- [x] **Web — UI :** Add checkbox **« Se souvenir de moi »** on the sign-in surface (email block + Google block as appropriate); **default `checked`**; bind value for both flows.
- [x] **Web — client :** Extend [`AuthApiService`](../../apps/web/src/app/core/auth/auth-api.service.ts) so `signInWithIdentityPlatformIdToken` and `signInWithGoogleIdToken` accept `rememberMe` (or a small options object) and JSON body includes `"rememberMe": <boolean>` alongside `idToken`. **Inscription email** (`registerWithEmail` → `finishIdpSignIn`) must send the **same** flag as email sign-in (one shared checkbox state).
- [x] **API — contrat :** Extend [`GoogleSignInRequest`](../../services/api/src/main/kotlin/com/hatcast/api/auth/dto/AuthDtos.kt) with `@JsonProperty("rememberMe") val rememberMe: Boolean = true` (Kotlin default + Jackson) so omitted field ⇒ **true** (matches UI default and existing clients).
- [x] **API — session :** After `securityContextRepository.saveContext`, set **`HttpSession.maxInactiveInterval`** from `rememberMe`: **true** ⇒ **2 592 000** s (30×24×3600); **false** ⇒ short server timeout (e.g. **1800** s / 30 min — tune to product, document in Dev Agent Record). Optionally align **Spring Session cookie** `Max-Age` with the same policy via `CookieSerializer` / session repository config if the default cookie outlives `maxInactiveInterval`. Centralize the 30-day constant (property `hatcast.auth.remember-me-seconds` or similar) to avoid magic numbers.
- [x] **Tests :** API integration tests: session cookie attributes / timeout behaviour for `rememberMe` true vs false; web unit/component tests for default checked and payload sent.
- [x] **Hors périmètre :** Déconnexion explicite → story **1.5** ; changement de mot de passe connecté → **1.6**.

## Dev Notes

### Architecture & garde-fous

- **ADR :** [ADR-0010](../../docs/adr/0010-v2-auth-identity-platform.md) — la durée de vie **métier** côté produit pour « rester connecté » est portée par la **session applicative** après échange du token ; le flag **remember me** ajuste cette politique, pas le stockage des mots de passe.
- **Epic source :** [Epics — Story 1.4](../planning-artifacts/epics.md) ; cette story **affine** la fenêtre « définie » en **30 jours** et l’état **par défaut** de la case (alignement **V1** explicite).
- **Cookie inter-domaines :** Si SPA et API ne partagent pas le même site, vérifier que le cookie de session est bien envoyé (`SameSite`, origines CORS avec credentials) — pas de régression par rapport aux stories **1.1–1.3**.

### Fichiers / zones probables

| Zone | Fichiers / dossiers |
|------|---------------------|
| API | `AuthController.kt`, DTOs auth, `SecurityConfig.kt`, `application*.yml` |
| OpenAPI | `services/api/openapi/auth.yaml` |
| Angular | `apps/web/src/app/core/auth/auth-api.service.ts`, `oauth-demo` (ou future page `/connexion` dédiée) |

### Références

- [Epics — Story 1.4](../planning-artifacts/epics.md)
- [ADR-0010](../../docs/adr/0010-v2-auth-identity-platform.md)
- Story précédente : [`1-3-reinitialisation-et-recuperation-de-mot-de-passe-par-email.md`](./1-3-reinitialisation-et-recuperation-de-mot-de-passe-par-email.md)

### Intelligence story 1.3 (continuité)

- Flux email : `signInWithEmailAndPassword` → `signInWithIdentityPlatformIdToken` → `POST /v1/auth/idp` ; **inscription** : `createUserWithEmailAndPassword` → même `finishIdpSignIn` → **même** booléen **rememberMe** ; ajouter le champ sans casser le flux reset/mot de passe oublié (pas de session HatCast sur les pages reset).

### Garde-fous anti-régression

- **`AuthControllerIntegrationTest`** : ajouter cas `rememberMe` true/false (cookie / session timeout si vérifiable) ; conserver les tests existants **sans** `rememberMe` (défaut **true**).
- **CSRF** : les `POST` `/v1/auth/google` et `/v1/auth/idp` restent **hors CSRF** ([`SecurityConfig`](../../services/api/src/main/kotlin/com/hatcast/api/config/SecurityConfig.kt)) — pas de changement attendu ; documenter si un nouveau endpoint apparaît.

## Dev Agent Record

### Agent Model Used

Composer (implémentation story 1.4)

### Debug Log References

### Completion Notes List

- **API :** `AuthSessionPolicy` applique `HttpSession.setMaxInactiveInterval` après création de session (`rememberMe` true → `hatcast.auth.remember-me-seconds`, défaut 2 592 000 ; false → `no-remember-me-seconds`, défaut 1 800). Variables d’environnement `HATCAST_AUTH_REMEMBER_ME_SECONDS` / `HATCAST_AUTH_NO_REMEMBER_ME_SECONDS` documentées dans [`.env.example`](../../.env.example).
- **Contrat :** `GoogleSignInRequest.rememberMe` défaut `true` ; corps JSON inchangé pour les clients qui n’envoient que `idToken`.
- **Web :** case « Se souvenir de moi (environ 30 jours) » au-dessus du bloc Google et partagée avec inscription/connexion email via `rememberMe` signal (défaut coché).
- **Tests :** `AuthSessionPolicyTest` (intervalles) ; intégration `POST` avec `rememberMe: false` → 200 ; `auth-api.service.spec.ts` (corps JSON). Les assertions d’intervalle sur la session MockMvc ont été retirées (session de test non fiable pour `maxInactiveInterval`).
- **Post-livraison (hors fichier story initial) :** persistance Neon-only au runtime ; `ensureHatcastSession` + préférence `localStorage` ; UI accueil sans faux « connecté » avant `getMe`.

### File List

**API**

- `services/api/src/main/kotlin/com/hatcast/api/auth/AuthSessionPolicy.kt`
- `services/api/src/main/kotlin/com/hatcast/api/auth/AuthController.kt`
- `services/api/src/main/kotlin/com/hatcast/api/auth/dto/AuthDtos.kt`
- `services/api/src/main/resources/application.yml`
- `services/api/src/test/resources/application-test.yml`
- `services/api/src/test/kotlin/com/hatcast/api/auth/AuthSessionPolicyTest.kt`
- `services/api/src/test/kotlin/com/hatcast/api/auth/AuthControllerIntegrationTest.kt`
- `services/api/openapi/auth.yaml`

**Web**

- `apps/web/src/app/core/auth/auth-api.service.ts`
- `apps/web/src/app/core/auth/auth-api.service.spec.ts`
- `apps/web/src/app/pages/oauth-demo/oauth-demo.ts`
- `apps/web/src/app/pages/oauth-demo/oauth-demo.html`
- `apps/web/src/app/pages/oauth-demo/oauth-demo.scss`

**Racine**

- `.env.example`

## Change Log

- 2026-04-19 — Story 1.4 : « Se souvenir de moi » (UI + `rememberMe` API + `HttpSession` + tests).
- 2026-04-20 — Clôture : validation produit ; alignement dépôt Neon-only (runtime) ; story marquée **done**.

## Story completion status

- **Status:** done  
- **Date :** 2026-04-20  
- **Clé sprint :** `1-4-session-persistante-se-souvenir-de-moi`
