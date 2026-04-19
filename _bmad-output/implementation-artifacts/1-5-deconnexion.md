# Story 1.5: Logout and user menu (V1 parity)

Status: done

<!-- bmad-create-story:validate — 2026-04-20 — ready-for-dev ; Firebase signOut + POST /v1/auth/logout ; MatMenu ; placeholder Mon compte -->
<!-- Optional: run validate-create-story before dev-story. -->

## Story

As a **signed-in** user,  
I want to **log out explicitly** from a **user menu** (avatar / account trigger, **V1-style**),  
so that my **HatCast server session** and **Identity Platform client session** on this browser are cleared and I cannot reach **member-only** views without signing in again.

## Acceptance Criteria

1. **Explicit logout (FR5):** Given an **active** HatCast session (`GET /v1/auth/me` succeeds), when the user chooses **« Se déconnecter »** from the **signed-in user menu**, then:
   - **`POST /v1/auth/logout`** is invoked with `credentials: 'include'` and completes successfully (cookie invalidated per existing Spring behaviour).
   - **`signOut()`** is called on the **Firebase Auth** instance (`FirebaseAuthService.getAuthOrNull()` when non-null) so the **IdP client session** is cleared — **required** so `ensureHatcastSession()` cannot silently re-create a HatCast session from a lingering `currentUser` (especially with **remember-me** / story **1.4**).
   - **Remember-me preference** in app storage is cleared — reuse [`clearHatcastRememberMePreference()`](../../apps/web/src/app/core/auth/hatcast-remember-me-storage.ts) after successful logout (same pattern as [`home-signed-in.ts`](../../apps/web/src/app/pages/home-signed-in/home-signed-in.ts) today).
2. **Post-logout access:** After a successful logout flow, when the user navigates to **`/accueil`** (or any future member route using the same session check), then they are **not** treated as signed-in (`ensureHatcastSession` / `getMe` must fail without a new sign-in).
3. **User menu shell (UX — account menu):** On **signed-in** surfaces, the UI exposes a **user menu** (dropdown / popover) with at minimum:
   - **« Se déconnecter »** (wired to the flow in AC1).
   - **« Mon compte »** (or equivalent) as a **navigation entry** — target may be a **placeholder route** until story **1.6** (e.g. static “bientôt disponible” copy), but the **navigation pattern** must be in place (no dead-only button).
4. **Presentation:** Replace the standalone **flat** “Se déconnecter” button on [`home-signed-in`](../../apps/web/src/app/pages/home-signed-in/home-signed-in.html) with this **menu-trigger** pattern while keeping **Material** consistency ([`docs/v2/technical/FRONTEND_UI.md`](../../docs/v2/technical/FRONTEND_UI.md)).
5. **API / contract:** [`POST /v1/auth/logout`](../../services/api/openapi/auth.yaml) already exists — **no breaking OpenAPI change** unless documentation must clarify idempotent `401` vs `204` behaviour; keep [`SecurityConfig`](../../services/api/src/main/kotlin/com/hatcast/api/config/SecurityConfig.kt) alignment (`POST` authenticated).
6. **Out of scope:** **Mon compte** **form fields** (email/password change while signed in) → story **1.6** ; **account deletion** → **1.7**. Do **not** modify `legacy/`.

## Tasks / Subtasks

- [x] **Scope:** `apps/web` primary ; API only if a doc/test gap is found. No `legacy/`.
- [x] **Client — full logout:** [`AuthApiService.logout()`](../../apps/web/src/app/core/auth/auth-api.service.ts) : `POST /v1/auth/logout` puis **`signOut(auth)`** si `getAuthOrNull()` non nul ; **`clearHatcastRememberMePreference()`** seulement si le POST répond OK. Si le POST échoue, **`signOut`** est quand même tenté (éviter IdP persistant seul) ; préférence non effacée pour permettre un nouvel essai côté serveur.
- [x] **UI — user menu:** Menu Material (`MatMenuModule` + `MatIconModule`) sur [`HomeSignedIn`](../../apps/web/src/app/pages/home-signed-in/home-signed-in.ts) : **Mon compte** → `/compte`, **Se déconnecter** ; ancien bouton plein largeur retiré.
- [x] **Routing — placeholder Mon compte:** [`/compte`](../../apps/web/src/app/pages/account-placeholder/) — placeholder story **1.6**.
- [x] **Navigation feedback:** Inchangé : snackbar + `/connexion` après succès API.
- [x] **Tests — web:** [`auth-api.service.spec.ts`](../../apps/web/src/app/core/auth/auth-api.service.spec.ts) — logout + `localStorage` `hatcastRememberMe`.
- [x] **Tests — API:** [`AuthControllerIntegrationTest`](../../services/api/src/test/kotlin/com/hatcast/api/auth/AuthControllerIntegrationTest.kt) — `POST logout` puis `GET me` → 401.

## Dev Notes

### Architecture & guardrails

- **ADR:** [ADR-0010](../../docs/adr/0010-v2-auth-identity-platform.md) — logout must address **both** the **HttpOnly session cookie** (server) and the **client IdP session** (Firebase Auth SDK).
- **Why Firebase `signOut` matters:** [`ensureHatcastSession()`](../../apps/web/src/app/core/auth/auth-api.service.ts) can call `getIdToken(true)` and `POST /v1/auth/idp` when remember-me preference is set and Firebase still has a user. Server-only logout would **not** meet “invalidates client and provider-associated mechanism” from the epic without clearing Firebase.
- **Epic source:** [Epics — Story 1.5](../planning-artifacts/epics.md).

### Existing building blocks (do not reinvent)

| Capability | Location |
|------------|----------|
| Server logout | `POST /v1/auth/logout` — [`AuthController.kt`](../../services/api/src/main/kotlin/com/hatcast/api/auth/AuthController.kt) (`SecurityContextLogoutHandler`) |
| Client fetch + cookie | [`AuthApiService.logout()`](../../apps/web/src/app/core/auth/auth-api.service.ts) |
| Clear remember-me flag | [`hatcast-remember-me-storage.ts`](../../apps/web/src/app/core/auth/hatcast-remember-me-storage.ts) |
| Firebase app singleton | [`FirebaseAuthService`](../../apps/web/src/app/core/auth/firebase-auth.service.ts) |
| User messaging | [`auth-user-message.ts`](../../apps/web/src/app/core/auth/auth-user-message.ts) for logout failure |

### File / structure hints

| Area | Likely files |
|------|----------------|
| Menu UI | `home-signed-in.*` and/or new `shared/` or `components/user-menu/` under `apps/web/src/app/` |
| Routes | `app.routes.ts` |
| Auth service | `auth-api.service.ts`, optional `auth-api.service.spec.ts` |

### Security

- Do **not** store session tokens in `localStorage` for logout; keep using **cookie** + **Firebase Auth** state.
- Preserve **CSRF** posture: no new state-changing GETs; logout stays **`POST`**.

### References

- [Epics — Story 1.5](../planning-artifacts/epics.md)
- [ADR-0010](../../docs/adr/0010-v2-auth-identity-platform.md)
- Previous story: [`1-4-session-persistante-se-souvenir-de-moi.md`](./1-4-session-persistante-se-souvenir-de-moi.md)

### Previous story intelligence (1.4)

- **Remember-me** preference lives in browser storage; **must** be cleared on logout to match user expectation (already called from `HomeSignedIn.logout` after API success — ensure it still runs after consolidating logout logic).
- **503 / missing Firebase:** If `getAuthOrNull()` is null, **server logout** remains mandatory; **Firebase signOut** is a no-op.

### Git intelligence (recent commits)

- Story **1.4** added `AuthSessionPolicy`, `rememberMe` on `POST /v1/auth/idp` and `/google`, and `ensureHatcastSession` — this story **must not** weaken session invalidation on logout.

### Latest technical notes

- **`firebase/auth` `signOut`:** Use the modular API `signOut(auth)` with the same `Auth` instance from `getAuthOrNull()`.
- **Angular Material:** Import `MatMenuModule`, `MatButtonModule`; follow existing standalone component style.

## Dev Agent Record

### Agent Model Used

Composer (implémentation story 1.5)

### Debug Log References

### Completion Notes List

- **Logout :** `signOut` Firebase après le POST serveur ; en échec serveur, `signOut` IdP conservé pour limiter l’état « connecté côté SDK ».
- **Préférence remember-me :** effacée uniquement si `POST /v1/auth/logout` répond OK (évite de perdre la préférence si l’utilisateur doit réessayer la déconnexion).
- **Tests Vitest :** pas de mock ESM sur `firebase/auth` ; couverture `signOut` côté navigateur réelle.

### File List

**Web**

- `apps/web/src/app/core/auth/auth-api.service.ts`
- `apps/web/src/app/core/auth/auth-api.service.spec.ts`
- `apps/web/src/app/pages/home-signed-in/home-signed-in.ts` + `.html` + `.scss`
- `apps/web/src/app/pages/account-placeholder/account-placeholder.ts` + `.html` + `.scss`
- `apps/web/src/app/app.routes.ts`

**API**

- `services/api/src/test/kotlin/com/hatcast/api/auth/AuthControllerIntegrationTest.kt`

## Change Log

- 2026-04-20 — Story 1.5 drafted: logout + user menu + IdP client sign-out + placeholder Mon compte.
- 2026-04-20 — Implémentation : menu compte, `/compte`, `signOut` + tests.
- 2026-04-20 — Clôture : validation manuelle OK ; story **done**.

## Story completion status

- **Status:** done  
- **Date:** 2026-04-20  
- **Sprint key:** `1-5-deconnexion`  
- **Note:** Livré et validé par le produit (tests manuels).
