# Story 1.6: Mon compte — change email & password (logged in, V1 parity)

Status: review

baseline_commit: 03a893ca3d2392acf173dbc2b2180bb016699097

<!-- bmad-create-story — 2026-06-03 — P0 V2.0.0 ; user constraint: email confirmation like V1 -->

## Story

As a **signed-in** HatCast user (Google, email/password, or **both**),  
I want to **change my email address** and **set or change my password** from **Mon compte → Sécurité**, with **email confirmation** for each action (V1 parity),  
so that I keep my credentials up to date — including a **backup password** if I normally sign in with Google — **without confusing** this with the unauthenticated **forgot-password** flow (story **1.3**).

## Acceptance Criteria

1. **Security tab — enable actions (FR36, UX C6):** Given an authenticated user with a **non-empty account email** on **`/compte/securite`**, when the shell has loaded session data, then the rows **`Changer l’adresse e-mail`** and **`Changer le mot de passe`** / **`Définir un mot de passe`** are **enabled** (no **Bientôt** badge, no disabled placeholder) — **including** users who signed in **only via Google** so far; **`Supprimer mon compte`** stays disabled until story **1.7**. Preserve stable `data-testid`: `account-change-email`, `account-reset-password`. [Source: epics 1.6 ; story **17.34** ; **product amend 2026-06-03**]

2. **Google sign-in + backup password (product rule):** Given `hasGoogleAccount === true` and the Firebase user has **no** `password` provider yet (`providerData` lacks `providerId === 'password'`), when Sécurité renders, then the password row is **visible and enabled** with label **`Définir un mot de passe`** (not hidden) and an **informational** hint (reuse or extend `data-testid="account-google-password-hint"`) explaining that Google sign-in remains available and that a password is a **secours** if Google access is lost. **Do not** block `sendPasswordResetEmail` for these users — Identity Platform uses the reset email to **add** the email/password provider to the existing account (same email). Given the user **already has** a password provider, show **`Changer le mot de passe`** instead. [Source: **product amend 2026-06-03** ; FR36 spirit — recovery path ; supersedes ux-design-mon-compte « Google-only → pas de ligne MDP » for story **1.6**]

3. **Change email — dialog & verification email (V1 parity via IdP):** Given a signed-in user with a HatCast account email (Google and/or password provider), when they tap **Changer l’adresse e-mail**, then a **`MatDialog`** opens with the **new email** field (current email shown read-only), validation (`Validators.email`, must differ from current), and submit. On submit, call Identity Platform **`verifyBeforeUpdateEmail(currentUser, newEmail.trim())`** (ADR-0010 — **not** a custom Firestore magic link like V1). On success, show confirmation copy aligned with V1 spirit: *Un email de vérification a été envoyé à {newEmail}. Cliquez sur le lien pour confirmer le changement. Vérifiez vos spams si besoin.* On **`auth/requires-recent-login`**, show *Veuillez vous reconnecter pour modifier votre email* (V1 message) and offer navigation to `/connexion` (after optional logout). Google-only users may need **recent Google re-auth** before IdP accepts the request — surface the same re-login message. [Source: V1 `AccountMenu.vue` ; FR36 ; NFR-S1]

4. **Change email — complete verification & sync HatCast:** Given the user clicked the **verification link** from the new-email inbox, when the app handles the action code (dedicated route, e.g. **`/compte/verification-email`**, or in-dialog handler if link returns to app with `oobCode` + `mode=verifyAndChangeEmail`), then apply Identity Platform completion (`applyActionCode` / `checkActionCode` per Firebase modular API), **`reload()`** the Firebase user, **re-exchange** session via existing **`AuthApiService.signInWithIdentityPlatformIdToken(getIdToken(true))`**, refresh **`AccountPageContext.user`**, and show success (*Votre adresse email a été mise à jour.*). The **Identité** tab read-only email and **`GET /v1/auth/me`** must reflect the new address (Postgres sync via existing [`AuthUserLinkService.updateProfile`](../../services/api/src/main/kotlin/com/hatcast/api/auth/AuthUserLinkService.kt) on token exchange — **no new password storage server-side**). [Source: ADR-0010 ; story **1.2** session bridge]

5. **Set or change password — email confirmation while logged in (V1 parity, distinct from 1.3 UX):** Given a **signed-in** user with `currentUser.email` (including **Google-only** accounts that never set a password), when they tap **`Définir un mot de passe`** or **`Changer le mot de passe`**, then a **`MatDialog`** explains that the next step is **by email** (distinct from *Mot de passe oublié* on `/connexion` — reuse tooltip intent from **17.34**). For Google-only / no password provider yet, dialog copy must state that this **adds** email+password sign-in **in addition to** Google. On confirm, invoke **`sendPasswordResetEmail(auth, currentUser.email, { url: origin + '/reinitialiser-mot-de-passe', handleCodeInApp: false })`** — **same IdP mechanism** as story **1.3** but **initiated from Mon compte** while authenticated (matches V1 `AccountMenu.changePassword` → reset email, **not** inline `updatePassword` without email). **Must work** for Google-only IdP users (links password provider on completion). Show success: *Email de réinitialisation envoyé ! …* (V1 copy). Completion remains on existing [`/reinitialiser-mot-de-passe`](../../apps/web/src/app/pages/reset-password/reset-password.ts) (`confirmPasswordReset` + optional sign-in chain). After completion, user can sign in with **Google or email/password**. [Source: epics 1.6 vs 1.3 ; legacy `AccountMenu.vue` ; FR36 ; **product amend 2026-06-03**]

6. **Validation & safe errors (NFR-S1, NFR-I1):** Given invalid input or IdP errors (`auth/email-already-in-use`, `auth/invalid-email`, `auth/too-many-requests`, network), when submit fails, then show **French, user-safe** messages via extended helpers in [`auth-user-message.ts`](../../apps/web/src/app/core/auth/auth-user-message.ts) — no stack traces, no enumeration beyond provider-aligned cases. Password rules on completion path remain **≥ 8 characters** (same as **1.2** / **1.3**).

7. **Architecture guardrail (ADR-0010):** **No** HatCast API endpoint accepting raw passwords or performing email mutation in Postgres directly. Optional OpenAPI **description note** in [`auth.yaml`](../../services/api/openapi/auth.yaml) that logged-in email/password account updates are **IdP-client-managed** (like reset in **1.3**). **Do not** modify `legacy/` or reintroduce V1 Firestore `accountMagicLinks`.

8. **Out of scope:** Account deletion → **1.7** ; unauthenticated forgot-password entry → **1.3** ; `displayName` editing ; **unlinking** Google or removing providers ; custom HatCast transactional email pipeline for these flows (IdP emails only). **In scope:** **adding** password to a Google account via reset email (implicit provider link).

**Product coverage:** FR36 ; NFR-S2, NFR-S3 ; P0 V2.0.0 cutover ([sprint-change-proposal-2026-06-02-v2.0.0-cutover-scope.md](../planning-artifacts/sprint-change-proposal-2026-06-02-v2.0.0-cutover-scope.md)).

---

## Acceptance Criteria — Material 3 (UI)

**M3-1. Composants Material** — **Given** Sécurité actions enabled, **when** the user starts email or password change, **then** use **`MatDialog`** + **`mat-form-field`** / **`mat-stroked-button`** / **`mat-flat-button`** (pattern [`troupe-edit-dialog.ts`](../../apps/web/src/app/pages/troupe-hub/troupe-edit-dialog.ts)) — not inline full-page forms or custom div buttons. List rows stay **`mat-list-item`** / **`mat-nav-list`**. [Source: ux-design-mon-compte.md ; FRONTEND_UI.md]

**M3-2. Tokens & thème** — **Given** dialog and list styles, **when** colors or danger zone, **then** reuse [`account-placeholder.scss`](../../apps/web/src/app/pages/account-placeholder/account-placeholder.scss) tokens (`--mat-sys-*`) ; zone sensible (delete placeholder) unchanged. [Source: FRONTEND_UI.md]

**M3-3. Mobile & tactile** — **Given** viewport **max-width: 480px**, **when** dialogs and list rows render, **then** dialog actions stack/wrap safely ; primary actions ≥ **48dp** ; French **`aria-label`** on icon-only controls if any. [Source: NFR-A1]

**M3-4. Navigation membre** — **Given** `/compte/securite`, **when** dialogs open, **then** no new global nav chrome ; account menu remains hidden on `/compte/*` (story **17.34**). [Source: ux-hub-a-faire.md]

**M3-5. Revue** — **Given** implementation done, **when** validating, **then** checklist § « Checklist M3 HatCast » in [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md) is walked ; waivers noted in Dev Agent Record.

---

## Tasks / Subtasks

- [x] **Scope:** `apps/web/` primary ; OpenAPI description-only touch optional in `services/api/openapi/auth.yaml` ; **no** `legacy/`.
- [x] **AC 1–2 — Enable Sécurité rows** — Update [`account-security-tab.ts/html`](../../apps/web/src/app/pages/account-placeholder/tabs/account-security-tab.html): remove disabled/Bientôt on email + password rows ; wire `(click)` → open dialogs ; keep delete row disabled ; **remove** the `@if (!u.hasGoogleAccount)` branch that hides the password row — replace with dynamic label (**Définir** vs **Changer**) from Firebase `providerData` ; convert `account-google-password-hint` to **informational** secours copy (not a substitute for the password action).
- [x] **AC 3 — Email change dialog** — New component e.g. `account-change-email-dialog.ts` : form new email, call `verifyBeforeUpdateEmail`, success/error snackbars, handle `requires-recent-login`.
- [x] **AC 4 — Email verification completion** — Route + component (e.g. `/compte/verification-email`) : parse `oobCode`/`mode`, `applyActionCode`, `user.reload()`, `signInWithIdentityPlatformIdToken`, update `AccountPageContext` ; register in [`app.routes.ts`](../../apps/web/src/app/app.routes.ts) ; document continue URL in operator notes if new path must be authorized in GCP.
- [x] **AC 5 — Password set/change dialog** — New `account-change-password-dialog.ts` : `@Input()` or data flag `hasPasswordProvider` ; copy for **define** vs **change** ; confirm → `sendPasswordResetEmail` to **`auth.currentUser.email`** (must succeed for Google-only) with same `continueUrl` as [`forgot-password.ts`](../../apps/web/src/app/pages/forgot-password/forgot-password.ts).
- [x] **AC 6 — Messages** — Extend [`auth-user-message.ts`](../../apps/web/src/app/core/auth/auth-user-message.ts) with mappers for email-update (`verifyBeforeUpdateEmail` / `applyActionCode`) error codes.
- [x] **AC 7 — Docs** — Short note in OpenAPI auth descriptions (optional) ; no new REST mutations.
- [x] **AC 8 — Tests** — Update [`account-placeholder.spec.ts`](../../apps/web/src/app/pages/account-placeholder/account-placeholder.spec.ts) (enabled buttons, dialog open, **Google user sees enabled password row** with « Définir » label + hint) ; unit tests for new dialogs with mocked `firebase/auth` (Vitest pattern from `forgot-password.spec.ts`) ; run `npm run test -w @hatcast/web -- --watch=false`.

---

## Dev Notes

### Product and UX rules

- Normative UX: [ux-design-mon-compte.md](../planning-artifacts/ux-design-mon-compte.md) — **MatDialog per line** when **1.6** ships (§ Onglet Sécurité).
- **V1 reference behaviour (legacy, do not port implementation):**
  - Email: custom magic link to **new** email → [`legacy/src/components/AccountMenu.vue`](../../legacy/src/components/AccountMenu.vue) + [`magicLinks.js`](../../legacy/src/services/magicLinks.js).
  - Password from Mon compte: **`sendPasswordResetEmail`** to current email (not a form with old+new password in UI).
- **V2 IdP equivalent:** `verifyBeforeUpdateEmail` + `sendPasswordResetEmail` — satisfies user request *confirmation email comme en V1* without Firestore magic links (ADR-0010).
- **Product amend 2026-06-03 (Patrice):** Google-only users **must** be able to **define a backup password** by email — not hide the password row. HatCast requires an email on every account ; losing Google access must not lock the user out. Both sign-in methods coexist after reset completion.
- **Detect password provider (client):** `auth.currentUser?.providerData.some(p => p.providerId === 'password')` — do **not** infer from `hasGoogleAccount` alone (API flag only means Google was used at link time, not that password is absent).

### Current state (READ before coding)

| File | Today | This story |
|------|-------|------------|
| [`account-security-tab.html`](../../apps/web/src/app/pages/account-placeholder/tabs/account-security-tab.html) | Disabled rows + **Bientôt** ; password hidden if `hasGoogleAccount` | Enable email + password for **all** users with email ; dynamic label ; hint = secours Google |
| [`account-security-tab.ts`](../../apps/web/src/app/pages/account-placeholder/tabs/account-security-tab.ts) | Static tooltip strings | Inject `MatDialog`, `FirebaseAuthService`, `AuthApiService` |
| [`forgot-password.ts`](../../apps/web/src/app/pages/forgot-password/forgot-password.ts) | Unauthenticated reset request | Reuse `sendPasswordResetEmail` settings from Mon compte dialog |
| [`reset-password.ts`](../../apps/web/src/app/pages/reset-password/reset-password.ts) | Completes reset from email link | Unchanged completion path for Mon compte-initiated reset |
| [`AuthUserLinkService`](../../services/api/src/main/kotlin/com/hatcast/api/auth/AuthUserLinkService.kt) | Syncs email on `POST /v1/auth/idp` | Rely on re-exchange after IdP email change — **no new service method required** unless session principal caches stale email in UI-only edge cases (then refresh `getMe`) |

### Frontend implementation guardrails

| Concern | Action |
|--------|--------|
| Firebase auth | Reuse [`FirebaseAuthService.getAuthOrNull()`](../../apps/web/src/app/core/auth/firebase-auth.service.ts) — guard missing config like other auth pages |
| Session refresh | After email verified: `getIdToken(true)` → `signInWithIdentityPlatformIdToken` → `AccountPageContext.setUser` |
| Re-auth | On `auth/requires-recent-login` for email change: prompt re-login (optional `reauthenticateWithCredential` with current password in dialog **phase 2** — only if product wants inline re-auth; minimum AC is V1 message + redirect) |
| Dialog pattern | Standalone component + `MatDialog.open` ; `MatDialogRef` close on success |
| Password provider detection | Read Firebase `providerData` in security tab (after `getAuthOrNull()` + session) — optional small helper e.g. `hasPasswordProvider(auth)` in `core/auth/` |
| Google + password coexistence | After first reset from Google-only account, `providerData` includes `google.com` + `password` — no API schema change |
| Identity tab email | Read-only display in [`account-identity-tab`](../../apps/web/src/app/pages/account-placeholder/tabs/account-identity-tab.html) — must update after AC 4 |

### Explicit non-goals

- Suppression de compte (**1.7**).
- HatCast API storing or validating passwords.
- V1 Firestore `accountMagicLinks` collection.
- Inline password change with old+new fields **without** email (conflicts with user V1 parity requirement).
- Unlinking Google or removing sign-in methods.

### Dependencies

| Story | Status | Relationship |
|-------|--------|--------------|
| **1.2** | done | Email/password sign-up ; min password 8 |
| **1.3** | done | Reset completion route + `sendPasswordResetEmail` pattern |
| **1.5** | done | Mon compte route + session |
| **17.34** | done | Sécurité tab shell + placeholders to replace |
| **1.7** | backlog | Delete row stays placeholder |

### Testing requirements

```bash
npm run test -w @hatcast/web -- --watch=false
```

Minimum cases:

- Sécurité: email + password buttons **enabled** for email/password user.
- **Google-only:** password row **enabled**, label « Définir un mot de passe », hint secours visible ; `sendPasswordResetEmail` invoked on confirm.
- Email dialog: invalid email blocked ; success message after `verifyBeforeUpdateEmail` mock.
- Password dialog: calls `sendPasswordResetEmail` with `currentUser.email` + continue URL ; copy differs for define vs change.
- Delete account row still disabled.
- Regression: `data-testid` values unchanged.

Manual recette (Mailpit **not** used — IdP sends email):

- Local `./scripts/start-dev.sh` with `HATCAST_FIREBASE_*` in `.env`.
- Change email → receive IdP mail on **new** address → complete → Identité shows new email.
- Change password from Sécurité → receive reset mail → `/reinitialiser-mot-de-passe` → sign in.
- **Google-only account:** Définir mot de passe from Sécurité → same email flow → after completion, sign in with **email/password OR Google**.

### Previous story intelligence (1.5)

- Full logout clears Firebase + server session — after password reset via email user may need to sign in again (expected).
- `AccountPageContext` holds `user` signal — refresh after credential changes.

### Previous story intelligence (17.34)

- Do **not** restructure tabs ; only activate Sécurité lines.
- Preserve `account-change-email`, `account-reset-password`, `account-google-password-hint`, `account-delete` testids.
- **Replace** spec « Google-only hides password row » with « Google-only shows Définir + hint ».
- Update specs that assert `disabled === true` on security actions.

### Git intelligence (recent)

- `03a893ca` — Mon compte tabs + signup page: Sécurité placeholders are the direct touch point for **1.6**.
- Follow standalone Angular + Material dialog patterns from recent web commits.

### Latest technical notes (Firebase modular API)

- **`verifyBeforeUpdateEmail(user, newEmail)`** — sends verification to **new** email; requires recent login for sensitive accounts.
- **`applyActionCode(auth, oobCode)`** — completes email change when user lands with code (pair with route handler).
- **`sendPasswordResetEmail`** — already used in **1.3** ; reuse `ActionCodeSettings.url` = `${origin}/reinitialiser-mot-de-passe`. For Google-only accounts, this **adds** the password sign-in method when the user completes the link (Identity Platform links providers on same `uid`).
- Package: same `firebase` version as [`apps/web/package.json`](../../apps/web/package.json) (Identity Platform client).
- **Authorized domains:** any new completion path must be listed in GCP Identity Platform console (same as **1.3** operator docs).

### Project context reference

- [project-context.md](../../project-context.md) — Material 3, tests mandatory, no invented features.
- [ADR-0010](../../docs/adr/0010-v2-auth-identity-platform.md) — IdP owns credentials.
- [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md) — M3 checklist.

---

## Dev Agent Record

### Agent Model Used

Composer (Cursor agent)

### Completion Notes List

- Enabled Sécurité actions (email + password) for all users with account email; delete row stays placeholder until 1.7.
- Google-only users see **Définir un mot de passe** + informational backup-password hint; password provider detected via Firebase `providerData`.
- Email change: `MatDialog` + `verifyBeforeUpdateEmail` with continue URL `/compte/verification-email`; handles `requires-recent-login` with re-login CTA.
- Email verification route: `applyActionCode` → `user.reload()` → `signInWithIdentityPlatformIdToken` → session refresh via existing API bridge.
- Password set/change: `MatDialog` + `sendPasswordResetEmail` (same continue URL as story 1.3); distinct copy for define vs change.
- Extended `auth-user-message.ts` for email-update flows; OpenAPI auth fragment note for IdP-client-managed account updates.
- **M3 checklist:** MatDialog + mat-form-field/buttons; account-placeholder tokens; mobile dialog actions ≥48dp; no new nav chrome. **Operator note:** authorize `/compte/verification-email` in GCP Identity Platform authorized domains (same as 1.3).
- Tests: `npm run test -w @hatcast/web -- --watch=false` — 930/930 passed.

### File List

- `apps/web/src/app/core/auth/auth-action-code-settings.ts` (new)
- `apps/web/src/app/core/auth/firebase-auth-providers.ts` (new)
- `apps/web/src/app/core/auth/auth-user-message.ts`
- `apps/web/src/app/pages/account-placeholder/tabs/account-security-tab.ts`
- `apps/web/src/app/pages/account-placeholder/tabs/account-security-tab.html`
- `apps/web/src/app/pages/account-placeholder/dialogs/account-change-email-dialog.ts` (new)
- `apps/web/src/app/pages/account-placeholder/dialogs/account-change-email-dialog.spec.ts` (new)
- `apps/web/src/app/pages/account-placeholder/dialogs/account-change-password-dialog.ts` (new)
- `apps/web/src/app/pages/account-placeholder/dialogs/account-change-password-dialog.spec.ts` (new)
- `apps/web/src/app/pages/account-email-verification/account-email-verification.ts` (new)
- `apps/web/src/app/pages/account-email-verification/account-email-verification.html` (new)
- `apps/web/src/app/pages/account-email-verification/account-email-verification.scss` (new)
- `apps/web/src/app/pages/account-placeholder/account-placeholder.spec.ts`
- `apps/web/src/app/pages/forgot-password/forgot-password.ts`
- `apps/web/src/app/app.routes.ts`
- `services/api/openapi/auth.yaml`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

### Change Log

- 2026-06-03 : Story created (`bmad-create-story`) — P0 V2.0.0 ; email + password from Mon compte with email confirmation (V1 parity via Identity Platform).
- 2026-06-03 : Product amend — Google-only users **must** define backup password by email (both providers) ; supersedes ux-design-mon-compte « hide password row » for **1.6**.
- 2026-06-03 : Implementation complete — Sécurité dialogs, verification route, tests green (930/930).

---

### Validation create-story

- [x] AC métier numérotés et sourcés (epics / FR36 / ux-design-mon-compte)
- [x] Section **Material 3** remplie
- [x] Tasks référencent les numéros d’AC (y compris M3-x)
- [x] Liens vers fichiers code existants à réutiliser
- [x] `npm run test -w @hatcast/web` mentionné

## Story completion status

- **Status:** review
- **Sprint key:** `1-6-mise-a-jour-des-identifiants-et-champs-de-compte-supportes`
- **Note:** Google + backup password by email ; confirmation email like V1 ; supersedes prior AC hiding password for Google-only.
