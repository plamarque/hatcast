# Story 1.3: Forgot password — email recovery (unauthenticated)

Status: done

<!-- Optional: run validate-create-story before dev-story. -->

## Story

As an **unauthenticated** user who forgot their password,  
I want to **request a reset** and **set a new password** using the **email link** from Google Cloud Identity Platform (Firebase Auth client),  
so that I can regain access without HatCast storing or handling passwords server-side (**distinct** from “change password while signed in” in story **1.6**).

## Acceptance Criteria

1. **Request reset (FR3, anti-enumeration spirit):** Given a user on the **forgot-password** path while **not** authenticated, when they submit a **valid email address** and the Identity Platform client is configured, then **`sendPasswordResetEmail`** is invoked and the UI shows a **single, generic confirmation** that the next step is via inbox (no “unknown email” vs “known email” distinction — align with Firebase/Identity Platform behaviour and NFR-S1).
2. **Valid link — new password:** Given a **valid, non-expired** reset `oobCode` delivered by email, when the user opens the app URL (continue URL) and submits a **new password** meeting product rules (same minimum length / constraints as sign-up in story **1.2**), then **`confirmPasswordReset`** succeeds and they **can sign in** with the new password (via `/connexion` or an optional chained `signInWithEmailAndPassword` → `POST /v1/auth/idp` — document the chosen UX in Dev Agent Record).
3. **Invalid or expired link (NFR-I1):** Given an **invalid** or **expired** `oobCode` (or missing parameters), when the reset completion page loads or submit runs, then the UI shows a **clear, user-safe** message and a path to **request a new reset** (no sensitive implementation details).
4. **Discoverability:** The **sign-in** experience (`/connexion`, [`oauth-demo`](../../apps/web/src/app/pages/oauth-demo/oauth-demo.ts)) exposes an obvious link to the forgot-password flow when email auth is enabled (`environment.firebase` complete), consistent with V1 parity expectations.
5. **Architecture (ADR-0010):** Password reset email, OOB codes, and password policy enforcement remain **Identity Platform / client SDK** responsibilities — **no** HatCast API endpoint that accepts raw passwords for reset; **no** password hashing in Postgres. If OpenAPI is updated, treat reset as **IdP-managed** (informational note or description block), not new REST mutations.
6. **Out of scope:** Changing password **while already authenticated** → story **1.6**. Google-only accounts without email/password provider → reset request may fail with a generic Firebase error; surface via existing generic mapper pattern in [`auth-user-message`](../../apps/web/src/app/core/auth/auth-user-message.ts).

## Tasks / Subtasks

- [x] **Scope:** `apps/web` (+ docs/OpenAPI notes only if needed) ; do **not** modify `legacy/`. Reuse `firebase/auth` already used in [`oauth-demo.ts`](../../apps/web/src/app/pages/oauth-demo/oauth-demo.ts).
- [x] **Angular — routing:** Add dedicated route(s), e.g. `/mot-de-passe-oublie` (request form) and `/reinitialiser-mot-de-passe` (complete reset from email link — query params from Identity Platform redirect). Register in [`app.routes.ts`](../../apps/web/src/app/app.routes.ts). Use lazy or standalone components consistent with the app.
- [x] **Angular — request step:** Form with email field; call `sendPasswordResetEmail(auth, email, actionCodeSettings)` where `actionCodeSettings.url` is an **absolute** continue URL pointing to the **reset completion** route (build from `window.location.origin` at runtime and/or a documented `environment` base URL for production — must match an **authorized domain** in GCP Identity Platform / Firebase Auth settings).
- [x] **Angular — completion step:** Read `oobCode` (and `mode` if present) from the URL; use `verifyPasswordResetCode` / `confirmPasswordReset` from `firebase/auth`; enforce password confirmation field and same minimum length as registration (**≥ 8** today). On success: snackbar + navigate to `/connexion` and/or optional auto sign-in chain with `AuthApiService.signInWithIdentityPlatformIdToken` (same pattern as story **1.2**).
- [x] **UX / a11y:** Material form fields + buttons; French user-facing strings; dev-only technical panel only in non-production (same pattern as `oauth-demo`).
- [x] **Messages:** Extend [`auth-user-message.ts`](../../apps/web/src/app/core/auth/auth-user-message.ts) with targeted mappers for **password-reset** Firebase error codes where it improves clarity without enumeration (e.g. expired/invalid action code vs network) — still safe for NFR-S1.
- [x] **Operator docs:** Document **continue URL** hostname/path expectations and **authorized domains** next to existing Identity Platform notes (e.g. [`docs/v2/technical/DEPLOY_V2_CLOUD_RUN.md`](../../docs/v2/technical/DEPLOY_V2_CLOUD_RUN.md) or README) if not already implied.
- [x] **OpenAPI (optional but recommended):** Add a short **description** block in [`services/api/openapi/auth.yaml`](../../services/api/openapi/auth.yaml) stating that **email password reset** is handled entirely by the Identity Platform client (no `/v1` reset body), so the contract stays honest.
- [x] **Tests:** At minimum, **unit tests** for URL parsing / guard behaviour on the completion component; run existing `./gradlew test` if API touched (ideally **no** API code for this story). Add or extend web tests if the project has a harness for Firebase (mock auth).

## Dev Notes

### Architecture & guardrails

- **ADR:** [ADR-0010 — Identity Platform](../../docs/adr/0010-v2-auth-identity-platform.md) — reset emails and OOB flows are **not** reimplemented in Spring.
- **Session bridge:** After a successful **sign-in** following reset, the existing **`POST /v1/auth/idp`** + session cookie flow from story **1.2** remains the source of HatCast server session; do not introduce parallel session APIs.
- **CORS / domains:** The **continue URL** domain must appear in the Identity Platform / Firebase console **authorized domains** list; local dev uses `https://localhost:4200` (or the port from `start-dev.sh`) — same constraint as other auth flows.
- **XSS:** Do not persist reset tokens in `localStorage`; consume `oobCode` from the URL in memory for the completion request only.

### Reuse vs. new code

- Centralize Firebase app + `getAuth` initialization: **extract** a small `FirebaseAuthFactory` / `provideFirebaseAuth()` (or shared service) if duplication with `oauth-demo` grows; otherwise keep a **private helper** mirrored from `getFirebaseAuth()` in [`oauth-demo.ts`](../../apps/web/src/app/pages/oauth-demo/oauth-demo.ts) to avoid drift.
- **Link placement:** Add “Mot de passe oublié ?” (or equivalent) on the email sign-in section of [`oauth-demo.html`](../../apps/web/src/app/pages/oauth-demo/oauth-demo.html) routing to `/mot-de-passe-oublie` when `hasEmailAuth` is true.

### Library reference (client)

- `firebase/auth`: `sendPasswordResetEmail`, `confirmPasswordReset`, `verifyPasswordResetCode`, `ActionCodeSettings` — use the **same** `firebase` major version as [`apps/web/package.json`](../../apps/web/package.json).

### References

- [Epics — Story 1.3](../planning-artifacts/epics.md) (*Mot de passe oublié — récupération par email*)
- [ADR-0010](../../docs/adr/0010-v2-auth-identity-platform.md)
- Previous story: [`1-2-inscription-et-connexion-email-mot-de-passe.md`](./1-2-inscription-et-connexion-email-mot-de-passe.md)

### Previous story intelligence (1.2)

- Identity Platform is wired with **`firebase` npm** + **`POST /v1/auth/idp`** after client obtains an ID token; `UserEntity` uses `idp_uid`; Firebase Admin on API verifies tokens — **unchanged** for this story.
- **`environment.firebase`**: if incomplete, email flows are hidden — forgot-password should follow the same gating (or show the same hint as email login).
- **503** from API when Firebase Admin is not configured: irrelevant to pure reset email send, but relevant if implementing **post-reset auto sign-in**.

### Git intelligence (recent commits)

- Story **1.2** landed Identity Platform email/password, Cloud Run deploy secrets, and `auth.yaml` `/auth/idp` — extend the **Angular** auth UX without breaking Google or email sign-in.
- Docs under `docs/v2/` describe deployment; keep operator steps in sync when adding continue URLs.

### Latest technical notes (Firebase Auth / Identity Platform)

- **`sendPasswordResetEmail`** completes without revealing whether the email is registered (treat all outcomes as the same user-facing confirmation for the request step).
- **`ActionCodeSettings.handleCodeInApp`**: default web flow uses redirect with `oobCode` query parameters on the continue URL — verify against current `firebase` v10+ / modular API docs when implementing.

## Dev Agent Record

### Agent Model Used

Composer (implémentation story 1.3)

### Debug Log References

### Completion Notes List

- **Client :** `sendPasswordResetEmail` avec `continueUrl` = `{origin}/reinitialiser-mot-de-passe` ; page reset : `verifyPasswordResetCode` → formulaire → `confirmPasswordReset` → `signInWithEmailAndPassword` → `POST /v1/auth/idp`.
- **Service partagé :** [`firebase-auth.service.ts`](../../apps/web/src/app/core/auth/firebase-auth.service.ts) extrait depuis la logique dupliquée dans `oauth-demo`.
- **Tests :** `password-reset-query.spec.ts` (parse query) ; `reset-password.spec.ts` et `forgot-password.spec.ts` (mocks `firebase/auth` + services) ; `ng test --watch=false` OK.
- **Readiness (réserves initiales) :** doc opérateurs (§6.2 + gestionnaire d’actions Firebase) et parcours e-mail validés ; URL d’action configurée en console Firebase (lien `%LINK%` cohérent avec V2).

### File List

**Web**

- `apps/web/src/app/core/auth/firebase-auth.service.ts`
- `apps/web/src/app/core/auth/password-reset-query.ts` + `password-reset-query.spec.ts`
- `apps/web/src/app/core/auth/auth-user-message.ts`
- `apps/web/src/app/pages/forgot-password/*` (+ `forgot-password.spec.ts`)
- `apps/web/src/app/pages/reset-password/*` (+ `reset-password.spec.ts`)
- `apps/web/src/app/pages/oauth-demo/oauth-demo.ts` + `.html` + `.scss`
- `apps/web/src/app/app.routes.ts`

**API / docs**

- `services/api/openapi/auth.yaml`
- `docs/v2/technical/DEPLOY_V2_CLOUD_RUN.md`

## Story completion status

- **Status:** done  
- **Date :** 2026-04-20  
- **Sprint key:** `1-3-reinitialisation-et-recuperation-de-mot-de-passe-par-email`
