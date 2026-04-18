# Story 1.1: Sign in with Google (OAuth)

Status: done

**Portée réalisée :** piste **Track B — V2** (`apps/web` Angular 21 + `services/api` Spring), conforme [ADR-0008](../../docs/adr/0008-v2-spa-auth-google-session.md) et fragment OpenAPI [`auth.yaml`](../../services/api/openapi/auth.yaml).

## Story

As an unauthenticated user,  
I want to sign in with “Sign in with Google” (or equivalent),  
so that I can access HatCast without creating a new HatCast-specific password.

## Acceptance Criteria

1. **Happy path:** Given an unauthenticated user on the sign-in experience, when they choose Google sign-in and complete the OAuth flow successfully, then an application session consistent with the project’s auth model is established and they are taken to the signed-in experience (home or intended return route).
2. **Failure / cancel:** Given the provider flow fails or the user cancels, when control returns to the app, then a clear, user-safe message is shown (NFR-I1) without leaking sensitive implementation details (NFR-S1).
3. **Token / session handling:** Sessions or tokens are handled according to current security practices for the chosen stack (NFR-S1) — no long-lived secrets in localStorage without an explicit product/architecture decision.

## Tasks / Subtasks

- [x] **Scope gate (mandatory first):** Incrément **Track B** (Angular + Spring + session cookie) ; Track A (Firebase) inchangé dans ce lot.
- [ ] **Track A — Legacy Vue + Firebase (brownfield):** hors périmètre de cette livraison.
- [x] **Track B — V2 Angular + Spring (greenfield / parallel app):**
  - [x] Auth API : validation ID token Google, session JDBC, `POST /v1/auth/google`, `GET /v1/auth/me`, `POST /v1/auth/logout` (existant).
  - [x] Client Angular : bouton Google (GIS), établissement de session, **navigation vers `/accueil`** après succès ; écran **Connexion** sur `/connexion`.
  - [x] Erreurs auth : **MatSnackBar**, textes utilisateur sans fuite de détail ; panneau technique optionnel **uniquement en build développement**.
  - [x] Entrée `/` : redirection vers `/accueil` si session valide, sinon `/connexion`.

## Dev Notes

### Historique BMad

L’analyse détaillée (Track A legacy Firebase, garde-fous, Playwright, structure des fichiers V1) était dans la version **ready-for-dev** de ce fichier ; elle reste consultable dans l’historique Git. Ce lot implémente uniquement la **Track B V2** sans modifier `legacy/`.

## Dev Agent Record

### Agent Model Used

Composer (implémentation incrément + fermeture story).

### Completion Notes List

- Session **cookie HttpOnly** côté API ; aucun jeton longue durée en `localStorage`.
- Parcours : `/` → `AuthRedirect` (`GET /me`) → `/accueil` ou `/connexion` ; connexion Google → snackbar succès → `/accueil` ; déconnexion → snackbar → `/connexion`.
- Messages d’échec centralisés dans `apps/web/src/app/core/auth/auth-user-message.ts`.
- Animations Angular ajoutées (`@angular/animations`) pour Material snackbar.

### File List

**Angular (`apps/web/`)**

- `src/app/core/auth/auth-api.service.ts` — appels `fetch` vers `/v1/auth/*`.
- `src/app/core/auth/auth-user-message.ts` — libellés utilisateur.
- `src/app/pages/auth-redirect/auth-redirect.ts` — redirection racine selon session.
- `src/app/pages/home-signed-in/*` — expérience connectée minimale + logout.
- `src/app/pages/oauth-demo/*` — écran connexion (`/connexion`), GIS + snackbars.
- `src/app/app.routes.ts`, `src/app/app.config.ts` — routes + `provideAnimationsAsync`.

**Suivi**

- `_bmad-output/implementation-artifacts/sprint-status.yaml` — story **1-1** → **done**.

## Story completion status

- **Status:** done  
- **Date:** 2026-04-19
