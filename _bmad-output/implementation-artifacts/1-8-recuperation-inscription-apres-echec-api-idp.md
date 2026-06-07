---
baseline_commit: e69b668b11bbd6f12ade48e83da974fbb7e45c64
---

# Story 1.8: Signup recovery after IdP API failure (DW-104)

Status: done

<!-- bmad-create-story — 2026-06-07 — Epic 1 auth ; resolves DW-104 (deferred T0) -->
<!-- Source of truth: investigations/dw-104-investigation.md ; deferred-work.md § DW-104 -->

## Story

As a **visitor signing up with email and password**,  
I want the app to **retry** linking my Identity Platform account to HatCast when the API is temporarily unavailable, and to **guide me to sign in** if linking still fails,  
so that I am not left with a **Firebase-only orphan account** and blocked on re-signup (`auth/email-already-in-use`).

## Acceptance Criteria

1. **Transient retry after IdP create (AC-1):** Given email signup succeeded with `createUserWithEmailAndPassword` and a fresh ID token is available, when `POST /v1/auth/idp` returns a **transient** failure — HTTP **`0`** (network / fetch error), **`500`**, or **`503`** — then the client **retries** the same request **N times** (recommend **2 retries → 3 total attempts**) with **exponential backoff** (e.g. ~300 ms, ~900 ms; document constants in code) **before** treating the flow as failed. **Do not retry** on **`401`**, **`403`**, **`409`**, or other **4xx** (except if product explicitly adds 429 later — out of scope). Reuse the **same** `idToken` for retries within one signup attempt (no unnecessary `getIdToken(true)` unless token near expiry — default: same token is fine). [Source: DW-104 investigation Hypothesis 1 ; `signup.ts:251-264` ; `auth-api.service.ts:136-155`]

2. **Persistent failure — recovery UX (AC-2):** Given all retry attempts on `POST /v1/auth/idp` failed after successful Firebase signup, when the user sees feedback, then:
   - A **French, user-safe** snackbar explains that the **Identity Platform account was created** but HatCast could not finalize yet — e.g. *« Votre compte a été créé ; connectez-vous pour finaliser l’accès à HatCast. »* (exact copy may be tuned; must not blame the user or expose internals — NFR-S1 / NFR-I1).
   - The app **navigates to `/connexion`** (preserve `returnUrl` query param when valid, same pattern as [`signup.ts`](../../apps/web/src/app/pages/signup/signup.ts) `loginQueryParams` / [`post-login-redirect-storage`](../../apps/web/src/app/core/navigation/post-login-redirect-storage.ts)).
   - The user is **not** left on `/inscription` with only a generic API error that invites another signup attempt.
   [Source: DW-104 Finding 7 ; deferred-work T0]

3. **Login completes link idempotently (AC-3):** Given a Firebase user exists without a prior successful HatCast session from signup (orphan or ambiguous-failure case), when the user signs in on `/connexion` with the **same email/password**, then `signInWithEmailAndPassword` + `finishIdpSignIn` → `POST /v1/auth/idp` returns **200**, a HatCast session is established, and **at most one** `users` row exists for that `idp_uid` (`AuthUserLinkService.resolveIdpSignInUser` short-circuit on `findByIdpUid` — [`AuthUserLinkService.kt:74-78`](../../services/api/src/main/kotlin/com/hatcast/api/auth/AuthUserLinkService.kt)). **No regression** on happy-path signup (API up) or normal login. [Source: DW-104 Findings 2, 4 ; story **1.2**]

4. **Forbidden default — no blind client rollback (AC-4):** The implementation **must not** call Firebase **`deleteUser`** on the client when `POST /v1/auth/idp` fails with **`0`** or **`5xx`**, nor as a blanket rollback on any API failure. Rationale: ambiguous failures may occur **after** Postgres commit (timeout / network) — client deletion would create HatCast-without-IdP split brain (DW-104 Finding 3). **Optional rejected alternative (document in Dev Notes only):** conditional `deleteUser` on **401/503 only** — explicitly **not** an AC; inferior to login recovery and inconsistent with story **1.7** (server owns IdP deletion). [Source: DW-104 Deduction 2 ; story **1.7**]

5. **Remember-me preserved (AC-5):** Signup continues to send **`rememberMe: true`** (`SIGNUP_REMEMBER_ME`) on every `POST /v1/auth/idp` attempt, including retries — no regression vs story **1.4**. [Source: `signup.ts:42`, **1.4**]

6. **Non-transient API errors on signup (AC-6):** Given signup succeeded in Identity Platform but `POST /v1/auth/idp` returns **`401`**, **`403`**, or **`409`**, when retries are **not** applied, then show the existing or improved **user-safe** message via [`userMessageForIdpApiFailure`](../../apps/web/src/app/core/auth/auth-user-message.ts) / dedicated signup-recovery helper — **do not** redirect to login with “account created” copy when the failure is **definitive** (e.g. **403** deleted account, **409** email conflict). Only apply AC-2 redirect for **transient** failures **after retries exhausted** **or** when status is **`0`/`500`/`503`** on final attempt. [Source: DW-104 failure matrix]

7. **Tests — web (AC-7):** Vitest coverage in [`signup.spec.ts`](../../apps/web/src/app/pages/signup/signup.spec.ts) (and/or extracted helper spec):
   - Mock `createUserWithEmailAndPassword` success + `signInWithIdentityPlatformIdToken` failing **`503`** twice then **`200`** → expect **3** IdP calls, success navigation (no redirect to login).
   - Mock IdP always **`0`** or **`500`** after retries → expect snackbar with recovery message + **`Router.navigate`** to `/connexion` (with `returnUrl` when set).
   - Assert **`deleteUser`** is **never** imported/called from signup path (static import guard or explicit negative assertion in test design).
   Run: `npm run test -w @hatcast/web -- --watch=false`.

8. **Tests — API (AC-8):** Add integration test in [`AuthControllerIntegrationTest.kt`](../../services/api/src/test/kotlin/com/hatcast/api/auth/AuthControllerIntegrationTest.kt): **two consecutive** `POST /v1/auth/idp` with the **same mocked `uid`** → both **200** ; second response references the **same** `user.id` ; **`userRepository.count()`** (or find by `idp_uid`) shows **one** row. Run: `./gradlew test` (JDK 21).

9. **E2E (AC-9):** Playwright `recette-1-8.spec.ts` (project `chromium-1-8`) — profil API `e2e`, mock Identity Toolkit + tokens `e2e-idp|…` :
   - **1.8-E2E-01** — IdP bloqué → snackbar recovery + redirect `/connexion`.
   - **1.8-E2E-02** — 2× `503` puis succès (retry signup).
   - **1.8-E2E-03** — signup échoué puis login → session + idempotence `user.id`.
   Recette manuelle DW-104 (API stoppée) reste valide en complément local.

10. **Out of scope (AC-10):** Google GIS signup (`POST /v1/auth/google`) — different orphan shape (side note only). Server-orchestrated signup via Admin SDK (DW-104 Hypothesis 3 — long-term alternative note only). Prod orphan audit / Firebase vs Postgres count (backlog #6). API `@Transactional` refactor on link (separate concern). Changes to `AuthUserLinkService` link logic (already idempotent).

**Product coverage:** DW-104 ; deferred-work **T0** ; Epic 1 auth integrity ; NFR-I1, NFR-S1 ; FR2 (email signup parity).

---

## Acceptance Criteria — Material 3 (UI)

**M3-1. Composants Material** — **Given** recovery feedback after failed IdP exchange, **when** shown, **then** use existing **`MatSnackBar`** (same pattern as [`signup.ts`](../../apps/web/src/app/pages/signup/signup.ts) / [`login.ts`](../../apps/web/src/app/pages/login/login.ts)) — no custom toast div. Navigation uses **`Router`** only. [Source: FRONTEND_UI.md ; UX-DR11]

**M3-2. Tokens & thème** — **Given** snackbar on signup page, **when** styled, **then** no new hard-coded colors ; inherit global Material snackbar theme. [Source: FRONTEND_UI.md]

**M3-3. Mobile & tactile** — **Given** viewport **max-width: 480px**, **when** recovery snackbar appears before redirect, **then** message remains readable (duration ≥ **8000 ms** for recovery copy — longer than success snackbar) ; no new interactive controls required on signup for this story. [Source: NFR-A1]

**M3-4. Navigation membre** — **Given** redirect to `/connexion`, **when** landing, **then** no member chrome ; preserve valid `returnUrl` on login link/query. [Source: story **1.2b** ; ux-hub patterns]

**M3-5. Revue** — **Given** implementation done, **when** validating, **then** checklist § « Checklist M3 HatCast » in [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md) is walked ; waivers noted in Dev Agent Record.

---

## Tasks / Subtasks

- [x] **Scope:** `apps/web/` (primary) + `services/api/` (tests/doc only) ; **no** `legacy/` ; **no** Google GIS changes.
- [x] **AC 1, 4, 5 — Retry helper** — Add transient-retry wrapper for IdP exchange:
  - **Preferred:** extend [`AuthApiService.signInWithIdentityPlatformIdToken`](../../apps/web/src/app/core/auth/auth-api.service.ts) with optional `{ maxAttempts, backoffMs, isRetryableStatus }` **or** new `signInWithIdentityPlatformIdTokenWithRetry(...)` used by signup only.
  - Centralize **`isTransientIdpFailure(status)`** → `status === 0 || status === 500 || status === 503`.
  - **Do not** add retry to `ensureHatcastSession` in this story (different UX contract — silent fallback) unless explicitly needed; document if left unchanged.
- [x] **AC 1, 2, 5, 6 — Signup flow** — Update [`signup.ts`](../../apps/web/src/app/pages/signup/signup.ts) `finishIdpSignIn`:
  - Use retry wrapper for signup path.
  - On persistent transient failure: recovery snackbar + `router.navigate(['/connexion'], { queryParams })`.
  - Keep `SIGNUP_REMEMBER_ME = true` on all attempts.
- [x] **AC 1 — Factorisation (recommended)** — Extract shared **`finishIdpSignInAfterEmailAuth`** (or similar) used by [`login.ts`](../../apps/web/src/app/pages/login/login.ts) and `signup.ts` to avoid duplicating success snackbar + `postLoginNav.navigateAfterSignIn` + remember-me handling. Login keeps **no** retry + **no** recovery redirect (existing behaviour). Signup passes `{ enableIdpRetry: true, recoveryRedirectOnPersistentFailure: true }`.
- [x] **AC 2, 6 — Messages** — Add [`userMessageForSignupIdpRecovery()`](../../apps/web/src/app/core/auth/auth-user-message.ts) (or extend `userMessageForIdpApiFailure` with context flag) ; French copy per AC-2 ; keep NFR-S1.
- [x] **AC 7 — Web tests** — Extend [`signup.spec.ts`](../../apps/web/src/app/pages/signup/signup.spec.ts) ; mock `Router` ; cover retry + redirect scenarios ; optional unit test for retry helper if extracted.
- [x] **AC 8 — API test** — `AuthControllerIntegrationTest`: duplicate `POST /v1/auth/idp` same uid → idempotent user id.
- [x] **AC 9 — Manual validation** — Execute reproduction plan ; record result in Dev Agent Record.
- [x] **AC 10 — Docs traceability** — Add one line to [`deferred-work.md`](./deferred-work.md) § DW-104 pointing to this story when **done** (Dev Agent Record — not in this create-story commit unless user requests). Reference investigation file in Dev Notes (already).

---

## Dev Notes

### Product and UX rules

- **DW-104 (T0):** Email signup is two-phase: Identity Platform first (client), HatCast link second (API). Failure between phases leaves Firebase-only orphans — high support risk for all email registrants.
- **Decision locked (investigation 2026-06-07):** **Retry + login recovery** ; **reject** unconditional client `deleteUser`. Do not reopen this debate in implementation.
- **User mental model:** After recovery redirect, copy on `/connexion` already handles `auth/email-already-in-use` with guidance ([`auth-user-message.ts:28-29`](../../apps/web/src/app/core/auth/auth-user-message.ts)) — signup must **stop** pushing users into a second signup attempt.

### Architecture — current state (READ BEFORE EDITING)

| File | Current behaviour | This story changes |
|------|-------------------|-------------------|
| [`signup.ts:238-264`](../../apps/web/src/app/pages/signup/signup.ts) | `createUserWithEmailAndPassword` → `finishIdpSignIn` → single IdP POST ; on `!ok` generic snackbar only | Retry transient ; recovery snackbar + redirect |
| [`login.ts:250-263`](../../apps/web/src/app/pages/login/login.ts) | Identical `finishIdpSignIn` without retry | Should share helper ; login unchanged UX |
| [`auth-api.service.ts:136-155`](../../apps/web/src/app/core/auth/auth-api.service.ts) | Single fetch ; `status: 0` on network error | Retry wrapper (signup-invoked) |
| [`auth-api.service.ts:42-89`](../../apps/web/src/app/core/auth/auth-api.service.ts) | `ensureHatcastSession` re-exchanges IdP token on 401 + remember-me | **Preserve** — do not break silent recovery |
| [`AuthController.kt:101-157`](../../services/api/src/main/kotlin/com/hatcast/api/auth/AuthController.kt) | Verify token → `resolveIdpSignInUser` → session | **No refactor** required |
| [`AuthUserLinkService.kt:69-112`](../../services/api/src/main/kotlin/com/hatcast/api/auth/AuthUserLinkService.kt) | Idempotent by `idp_uid` | **No change** ; test only |

### Asymmetry with story 1.7 (Account deletion)

| Flow | Authority order | IdP cleanup |
|------|-----------------|-------------|
| **Signup (1.2)** | Client IdP **first**, API Postgres **second** | None on failure — **this story adds retry + login path** |
| **Delete (1.7)** | API Postgres **first** (`@Transactional`), server `FirebaseAuth.deleteUser` **best-effort** | Server-side only ; client calls `signOut`, never `deleteUser` |

Reference: [`AccountDeletionService.kt`](../../services/api/src/main/kotlin/com/hatcast/api/account/AccountDeletionService.kt) — mirror **inverse risk**, not inverse **implementation** (no client `deleteUser` on signup failure).

### Failure scenario matrix (signup email)

| API outcome | HatCast row | Retry? | After retries / no retry UX |
|-------------|-------------|--------|----------------------------|
| 401 invalid token | Unlikely | No | Generic IdP API message |
| 403 deleted account | Maybe | No | Block message (no “go login”) |
| 409 email conflict | Maybe | No | Generic / conflict message |
| 503 Admin SDK down | No | **Yes** | Recovery redirect if still failing |
| 0 network / timeout | **Unknown** | **Yes** | Recovery redirect — **never deleteUser** |
| 500 server error | **Unknown** | **Yes** | Recovery redirect — **never deleteUser** |
| 200 | Yes | N/A | Success — existing flow |

### Explicit non-goals

- Client `deleteUser` rollback (any broad or 401/503-only variant) as default fix.
- Server-side signup orchestration (Admin SDK `createUser`) — note as long-term alternative in Completion Notes only.
- Google GIS / `POST /v1/auth/google` orphan handling.
- Changing OpenAPI contract for `/v1/auth/idp` (body unchanged).
- Retry on login or `ensureHatcastSession` (optional future story).

### LLM developer pitfalls (mandatory read)

1. **Do not** import `deleteUser` from `firebase/auth` in signup — grep `apps/web` confirms only `signOut` exists today ; keep it that way.
2. **Do not** duplicate `finishIdpSignIn` in signup and login without extracting — drift caused the original gap.
3. **Do not** break `ensureHatcastSession` : it must still call **single-attempt** `signInWithIdentityPlatformIdToken` (no infinite retry on app boot).
4. **Do not** retry **403/409** — wrong UX and may amplify conflicts.
5. **Do not** assume API failure means no Postgres row — **never** compensate with client IdP deletion on `0`/`5xx`.
6. **Do not** change `AuthUserLinkService` idempotence logic — add test only.
7. **Do not** remove `SIGNUP_REMEMBER_ME = true` or forget `rememberMe` on retry POST bodies.
8. **Do not** invent new routes — use existing `/connexion` and `/inscription`.

### Dependencies

| Story | Status | Relationship |
|-------|--------|--------------|
| **1.2** | done | Introduced two-phase signup + `POST /v1/auth/idp` |
| **1.2b** | done | Dedicated signup page UX |
| **1.4** | done | `SIGNUP_REMEMBER_ME = true` ; `rememberMe` on IdP POST |
| **1.7** | done | Inverse deletion pattern ; server `deleteUser` only |
| ADR-0010 | accepted | Client-first IdP ; API validates tokens |

### Suggested commit message (Dev Agent Record only)

`fix(auth): Retry IdP link on signup and redirect to login on failure`

### References

- Investigation: [`investigations/dw-104-investigation.md`](./investigations/dw-104-investigation.md)
- Deferred: [`deferred-work.md`](./deferred-work.md) § DW-104
- [ADR-0010](../../docs/adr/0010-v2-auth-identity-platform.md)
- [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md)

### Previous story intelligence (1.7 — latest Epic 1)

- Multi-step UX and **`auth-user-message.ts`** patterns for safe French copy.
- API integration tests in `AuthControllerIntegrationTest` — follow mock `IdpIdTokenVerifier` pattern from existing `POST idp` tests.
- Client never calls `deleteUser` — [`account-delete-dialog`](../../apps/web/src/app/pages/account-placeholder/dialogs/account-delete-dialog.ts) uses API + `logout()`.

### Git intelligence

Recent commits are docs/ops (deferred triage, release) — no conflicting auth work in flight. Epic 1 stories **1.1–1.7** are **done** ; this is the first post-epic hygiene story for auth (**1.8**).

### Latest tech information

- **Angular 21.2** + **Vitest** for web tests ; **Spring Boot** + **MockMvc** for API integration tests (unchanged from project-context).
- **Firebase client SDK** (`firebase/auth`): `createUserWithEmailAndPassword`, `signInWithEmailAndPassword`, `signOut` — **`deleteUser` exists in SDK but is explicitly out of scope** for this story.
- No new npm/Maven dependencies expected.

### Project context reference

See [`project-context.md`](../../project-context.md) — stack, test commands, Material 3 rules, Conventional Commits (English subjects).

---

## Dev Agent Record

### Agent Model Used

Composer (dev-story)

### Debug Log References

- `ensureHatcastSession` left on single-attempt `signInWithIdentityPlatformIdToken` (no retry on app boot).
- Retry constants: `IDP_SIGNUP_RETRY_MAX_ATTEMPTS = 3`, backoff `[300, 900]` ms in `idp-transient-retry.ts`.

### Completion Notes List

- Ultimate context engine analysis completed — comprehensive developer guide created (create-story 2026-06-07).
- Implemented `signInWithIdentityPlatformIdTokenWithRetry` on signup path only ; login unchanged (single attempt).
- Extracted `finishIdpSignInAfterEmailAuth` shared by signup + login ; signup enables retry + recovery redirect to `/connexion` with `returnUrl`.
- Added `userMessageForSignupIdpRecovery()` French copy ; recovery snackbar duration 8000 ms (M3-3).
- No client `deleteUser` — grep + static source assertion in tests.
- Web tests: signup retry/redirect/403/no-deleteUser ; auth-api retry unit tests ; idp-transient-retry spec.
- API test: duplicate `POST /v1/auth/idp` same uid → same `user.id`, one row in Postgres.
- **Manual / E2E (AC-9):** Scénario principal validé par Patrice (2026-06-07) — API stoppée avant signup, snackbar recovery + redirect `/connexion`, relance API, login même email → session OK. **Playwright** `recette-1-8.spec.ts` (3 scénarios, CI `e2e-smoke`) — 2026-06-07.
- **M3 checklist:** M3-1 MatSnackBar + Router — OK ; M3-2 no new hard-coded colors — OK ; M3-3 duration ≥ 8000 ms recovery — OK ; M3-4 `/connexion` + returnUrl — OK ; M3-5 waivers: none.

**Manual recette (AC-9) — résultat :**
1. `./scripts/start-dev.sh` — OK.
2. API stoppée → signup email neuf — snackbar recovery + redirect `/connexion` — OK.
3. API relancée → login mêmes identifiants → session OK — OK.
*(Scénarios secondaires : waived manuel, tests auto.)*

### File List

**Web**

- `apps/web/src/app/core/auth/idp-transient-retry.ts` (new)
- `apps/web/src/app/core/auth/idp-transient-retry.spec.ts` (new)
- `apps/web/src/app/core/auth/finish-idp-email-auth.ts` (new)
- `apps/web/src/app/core/auth/auth-api.service.ts`
- `apps/web/src/app/core/auth/auth-api.service.spec.ts`
- `apps/web/src/app/core/auth/auth-user-message.ts`
- `apps/web/src/app/pages/signup/signup.ts`
- `apps/web/src/app/pages/signup/signup.spec.ts`
- `apps/web/src/app/pages/login/login.ts`

**API**

- `services/api/src/test/kotlin/com/hatcast/api/auth/AuthControllerIntegrationTest.kt`
- `services/api/src/main/kotlin/com/hatcast/api/e2e/E2eIdpIdTokenVerifier.kt`
- `services/api/src/main/kotlin/com/hatcast/api/e2e/E2eStory18FixtureService.kt`
- `services/api/src/main/kotlin/com/hatcast/api/e2e/dto/Story18FixtureResponse.kt`
- `services/api/src/main/kotlin/com/hatcast/api/auth/AuthController.kt` (guard Firebase e2e)
- `services/api/src/main/kotlin/com/hatcast/api/auth/FirebaseIdpIdTokenVerifier.kt` (profile `!e2e`)
- `services/api/src/main/kotlin/com/hatcast/api/e2e/E2eFixtureController.kt` (`story-1-8/cleanup`)

**E2E**

- `apps/web/e2e/recette-1-8.spec.ts`
- `apps/web/e2e/helpers/story-1-8.*`
- `apps/web/e2e/fixtures/story-1-8.constants.ts`
- `apps/web/playwright.config.ts` (project `chromium-1-8`)
- `apps/web/e2e/README.md`

**Docs**

- `_bmad-output/implementation-artifacts/deferred-work.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

**Incidental fix (pre-existing broken test string)**

- `apps/web/src/app/pages/troupe-hub/troupe-hub.spec.ts`

### Change Log

- 2026-06-07 : Story created (DW-104 / deferred T0) — ready-for-dev.
- 2026-06-07 : Implemented retry + login recovery (story 1.8) — review.
- 2026-06-07 : Recette manuelle scénario principal AC-9 — PASS (Patrice).
- 2026-06-07 : Code review — 2 patch findings fixed (status `0` signup test, login email single-attempt test) ; story → done.
- 2026-06-07 : Playwright recette 1.8 (3 E2E) + `E2eIdpIdTokenVerifier` pour gate CI sans Firebase Admin.

### Review Findings

- [x] [Review][Patch] Missing component test for status `0` recovery redirect [signup.spec.ts] — AC-7 requires mocking IdP failure `0` or `500` at signup level; only `500` is covered in component tests (`0` covered only in `auth-api.service.spec.ts`).
- [x] [Review][Patch] Login email IdP path untested after helper extraction [login.spec.ts] — refactor to `finishIdpSignInAfterEmailAuth` without retry is correct in code, but `login.spec.ts` never exercises email sign-in; regression on AC-3 (single-attempt login) would go unnoticed.
- [x] [Review][Defer] Unrelated `troupe-hub.spec.ts` apostrophe fix [troupe-hub.spec.ts] — deferred, pre-existing broken assertion; should live in a separate commit.
- [x] [Review][Defer] No submit guard during IdP retry backoff [signup.ts] — deferred, pre-existing pattern; retry window (~1.2s + network) slightly amplifies double-click risk on `createUserWithEmailAndPassword`.

---

### Validation create-story

- [x] AC métier numérotés et sourcés (DW-104, epics 1, FR2, NFR)
- [x] Section **Material 3** remplie (snackbar + redirect)
- [x] Tasks référencent les numéros d’AC (y compris M3-x)
- [x] Liens vers fichiers code existants à réutiliser
- [x] `npm run test` / `./gradlew test` mentionnés
- [x] LLM pitfalls explicités (deleteUser, ensureHatcastSession, factorisation)
- [x] Rejected alternatives documented (client deleteUser, server signup)
