# Investigation: DW-104 — Firebase orphan on email signup (signup.ts → AuthController → AuthUserLinkService)

## Hand-off Brief

1. **What happened.** Email signup commits an Identity Platform user on the client before `POST /v1/auth/idp`; API failure leaves a Firebase-only orphan with no HatCast `users` row (`signup.ts:238-264`).
2. **Root cause.** Split authority: IdP first (client), Postgres second (API), with no retry, rollback, or recovery UX — inverse of story 1.7 (HatCast first, server `deleteUser` best-effort).
3. **Fix.** Prefer **retry + redirect to login** (API idempotence on `idp_uid` already makes login replay safe); **do not** use unconditional client `deleteUser` (unsafe on timeout / 5xx after commit).

## Case Info

| Field            | Value                                                                 |
| ---------------- | --------------------------------------------------------------------- |
| Ticket           | DW-104                                                                |
| Date opened      | 2026-06-07                                                            |
| Status           | Concluded                                                             |
| System           | HatCast V2 — Angular `apps/web/` + Spring API `services/api/`         |
| Evidence sources | Source code, deferred-work.md, story 1.2/1.7, AuthUserLinkServiceTest |

## Problem Statement

**Hypothesis (DW-104):** When email/password signup succeeds in Identity Platform (Firebase client SDK) but `POST /v1/auth/idp` fails, a **Firebase orphan** remains — user cannot use HatCast and may be blocked on re-signup (`auth/email-already-in-use`).

**Decision under study:** Client rollback (`deleteUser` on API failure) vs API idempotence (safe replay of user link).

## Evidence Inventory

| Source                                      | Status    | Notes                                                                 |
| ------------------------------------------- | --------- | --------------------------------------------------------------------- |
| `apps/web/src/app/pages/signup/signup.ts`   | Available | Two-phase flow: Firebase create → API exchange                        |
| `AuthController.kt`                         | Available | `POST /v1/auth/idp` → verify token → link → session                   |
| `AuthUserLinkService.kt`                    | Available | Resolve/link/create user; no `@Transactional` on service class        |
| `AccountDeletionService.kt` (story 1.7)     | Available | Inverse flow; server `deleteUser` best-effort                         |
| `AuthControllerIntegrationTest`             | Available | Happy path idp; no idempotent replay test                             |
| `AuthUserLinkServiceTest`                   | Available | Link/create/conflict; no deleted-user idp test                        |
| Production logs / incident traces           | Missing   | Would quantify orphan rate                                            |
| Integration test signup failure simulation  | Missing   | Would confirm retry vs rollback behaviour                             |

## Investigation Backlog

| # | Path to Explore                                      | Priority | Status | Notes                                      |
| - | ---------------------------------------------------- | -------- | ------ | ------------------------------------------ |
| 1 | Idempotent replay `POST /v1/auth/idp` same uid       | High     | Done   | Confirmed in service logic                 |
| 2 | Failure taxonomy (client status codes)               | High     | Done   | See Confirmed Findings                     |
| 3 | Compare login.ts vs signup.ts finishIdpSignIn        | Medium   | Done   | Identical — login recovery path exists     |
| 4 | 1.7 deletion asymmetry                               | Medium   | Done   | Server-side pattern documented             |
| 5 | Add integration test idempotent idp POST             | Medium   | Open   | Gap in test suite                          |
| 6 | Quantify orphans in prod/staging                     | Low      | Blocked | Needs Firebase Admin export or support tickets |

## Timeline of Events

| Time       | Event                                      | Source                         | Confidence |
| ---------- | ------------------------------------------ | ------------------------------ | ---------- |
| Story 1.2  | Email signup + `POST /v1/auth/idp` shipped | `1-2-inscription-et-connexion` | Confirmed  |
| Story 1.7  | Account deletion with server `deleteUser`  | `AccountDeletionService.kt:79` | Confirmed  |
| DW-104 T0  | Orphan risk escalated in deferred triage     | `deferred-work.md:44-51`       | Confirmed  |

## Confirmed Findings

### Finding 1: Two-phase signup with no compensating action on API failure

**Evidence:** `apps/web/src/app/pages/signup/signup.ts:238-264`

**Detail:** `createUserWithEmailAndPassword` runs first; on success, `finishIdpSignIn` calls `AuthApiService.signInWithIdentityPlatformIdToken` (`POST /v1/auth/idp`). On `!r.ok`, only a snackbar is shown — **no** `deleteUser`, **no** retry, **no** redirect to login.

### Finding 2: API link path is idempotent by `idp_uid`

**Evidence:** `services/api/src/main/kotlin/com/hatcast/api/auth/AuthUserLinkService.kt:74-78`

**Detail:** `findByIdpUid(idpUid)` short-circuits to existing user, runs `markActivated` (no-op if already set) and `linkPendingParticipantsOnLogin` (updates only rows where `user IS NULL` — `ParticipantRepositories.kt:148-159`).

### Finding 3: True orphan = Firebase user without HatCast row

**Evidence:** Client order in `signup.ts:239-241` — Firebase commit precedes API.

**Detail:** Orphan occurs when API fails **before** `userRepository.save` in `resolveIdpSignInUser` (`AuthUserLinkService.kt:110`). If API persisted but client saw failure (network timeout, `status: 0`), HatCast row **exists** — not an orphan; blind client rollback would **worsen** state.

### Finding 4: Login path already replays the same exchange

**Evidence:** `apps/web/src/app/pages/login/login.ts:238-240`, `auth-api.service.ts:76-78`

**Detail:** `signInWithEmailAndPassword` + `finishIdpSignIn` is identical to post-signup exchange. `ensureHatcastSession` also re-exchanges IdP token when cookie lost but Firebase session persists.

### Finding 5: Story 1.7 uses inverted authority pattern

**Evidence:** `AccountDeletionService.kt:40-79`, `account-delete-dialog.ts:156-159`

**Detail:** Deletion: anonymize HatCast in `@Transactional`, then **server** `FirebaseAuth.deleteUser` best-effort (DW-105: inside transaction). Client calls `DELETE /v1/auth/me` then `logout()` (Firebase `signOut`, not `deleteUser`). Signup is the **mirror risk**: IdP first (client), HatCast second (API).

### Finding 6: No client-side `deleteUser` anywhere in web app

**Evidence:** Grep `apps/web` — only `signOut` in `auth-api.service.ts:178`; server owns IdP deletion in 1.7.

**Detail:** Introducing signup rollback would be a **new** client pattern, unlike 1.7.

### Finding 7: Re-signup blocked at Firebase after orphan

**Evidence:** `auth-user-message.ts:28-29` — `auth/email-already-in-use`

**Detail:** User with Firebase orphan who retries signup hits Firebase error; must use **login** (or password reset flow) to obtain idToken and complete HatCast link.

## Deduced Conclusions

### Deduction 1: API idempotence already solves replay — not the orphan case

**Based on:** Findings 2, 4

**Reasoning:** Replaying `POST /v1/auth/idp` with the same uid is safe once a row exists. The gap is when **no row was ever written**; retry only helps if the user can obtain a fresh idToken (login flow).

**Conclusion:** "API idempotence" is necessary but **insufficient alone** for signup UX; need **retry on transient failures** + **login recovery messaging**.

### Deduction 2: Unconditional client `deleteUser` on API failure is high-risk

**Based on:** Findings 1, 3, 5

**Reasoning:** `signInWithIdentityPlatformIdToken` returns `{ ok: false, status: 0 }` on network error (`auth-api.service.ts:153-154`) even if server committed. Deleting Firebase would leave a HatCast user with broken IdP link.

**Conclusion:** Rollback via client `deleteUser` should **not** run on status `0` or `5xx` without server confirmation.

### Deduction 3: Conditional client rollback is narrowly applicable

**Based on:** Findings 1, 3, AuthController error paths

**Reasoning:** On **401** (invalid token) or **503** (Firebase Admin unavailable), HatCast row is unlikely to exist (verify fails before link, or service unavailable). Client could `deleteUser` **only** when failure is provably pre-persist — but client cannot distinguish 500 before vs after save.

**Conclusion:** If rollback is chosen, restrict to **401 + 503** after explicit product decision; still inferior to "retry then send user to login".

## Hypothesized Paths

### Hypothesis 1: Primary fix = retry + login recovery (no deleteUser)

**Status:** Confirmed (recommended fix direction — pending implementation)

**Theory:** On API failure after Firebase create: (1) retry `POST /v1/auth/idp` 1–2 times with backoff for `0`/`503`/`500`; (2) if still failing, show message directing user to **login** (account exists in Identity Platform); (3) login `finishIdpSignIn` completes HatCast link idempotently.

**Supporting indicators:** Existing login path; API idempotence; mirrors `ensureHatcastSession` recovery.

**Would confirm:** E2E test: kill API after Firebase create, restore API, login succeeds.

**Would refute:** API returns 409 on replay for new uid (not observed in code).

### Hypothesis 2: Client deleteUser rollback on any API failure

**Status:** Refuted (for general case)

**Theory:** Always delete Firebase user when `POST /v1/auth/idp` fails.

**Would refute:** Ambiguous failure after successful DB commit (Finding 3).

**Resolution:** Refuted — creates HatCast-without-IdP split brain on timeout.

### Hypothesis 3: Server-side signup endpoint (Firebase Admin createUser)

**Status:** Open (alternative architecture)

**Theory:** Move user creation to API (Admin SDK) in one orchestrated flow — eliminates client-first orphan.

**Would confirm:** Product accepts server-owned signup + different threat model.

**Would refute:** ADR-0010 client-first password policy unchanged.

## Missing Evidence

| Gap                         | Impact                                      | How to Obtain                          |
| --------------------------- | ------------------------------------------- | -------------------------------------- |
| Prod orphan count           | Prioritize T0 urgency                       | Firebase Auth user list vs `users.idp_uid` |
| 500 after partial commit    | Validate rollback danger                    | Chaos test / integration failure injection |
| Idempotent POST idp test    | Lock regression                             | Add `AuthControllerIntegrationTest` case |

## Source Code Trace

| Element       | Detail                                                                 |
| ------------- | ---------------------------------------------------------------------- |
| Error origin  | `signup.ts:251-264` — `finishIdpSignIn` silent failure after Firebase create |
| Trigger       | User submits valid signup form → `signUpWithEmail()`                   |
| Condition     | `createUserWithEmailAndPassword` OK AND `signInWithIdentityPlatformIdToken` returns `!ok` |
| Related files | `AuthController.kt:101-157`, `AuthUserLinkService.kt:69-112`, `auth-api.service.ts:136-155`, `login.ts:250-263`, `AccountDeletionService.kt:198-216` |

### Signup flow (email)

```mermaid
sequenceDiagram
  participant U as User
  participant SPA as signup.ts
  participant IdP as Identity Platform
  participant API as AuthController
  participant Link as AuthUserLinkService
  participant DB as PostgreSQL

  U->>SPA: submit email/password
  SPA->>IdP: createUserWithEmailAndPassword
  IdP-->>SPA: uid + idToken
  SPA->>API: POST /v1/auth/idp { idToken }
  API->>API: verifyIdToken
  API->>Link: resolveIdpSignInUser(uid, email)
  alt new user
    Link->>DB: INSERT users (idp_uid)
  else existing uid
    Link->>DB: SELECT + update profile
  end
  API-->>SPA: 200 + Set-Cookie session
  Note over SPA,IdP: On API failure: IdP user remains (orphan if no DB row)
```

### Failure scenario matrix

| API outcome | HatCast row | Firebase user | User action today | Safe replay via login |
| ----------- | ----------- | ------------- | ----------------- | --------------------- |
| 401 invalid token | No | Yes | Snackbar; retry signup → email-already-in-use | Yes, after valid token |
| 403 deleted account | Maybe | Yes | Blocked by `rejectIfDeleted` | No (forbidden) |
| 409 email conflict | Maybe | Yes | Snackbar | Depends on conflict |
| 503 Admin SDK | No | Yes | Snackbar | Yes once API up |
| 0 network / timeout | **Unknown** | Yes | Snackbar | Yes if row exists; orphan if not |
| 500 server error | **Unknown** | Yes | Snackbar | Same as timeout |

## Final Conclusion

**Confidence:** **High** on mechanism and fix direction; **Low** on production orphan incidence (no telemetry reviewed).

| Question | Verdict |
| -------- | ------- |
| Is DW-104 real for email signup? | **Yes** — confirmed two-phase flow without compensation. |
| Is API idempotence enough alone? | **No** — safe replay requires a subsequent idToken exchange (login / retry); does not undo Firebase-only orphans. |
| Client `deleteUser` on API failure? | **Reject** as default — ambiguous failures (status `0`, `5xx` after commit) risk HatCast row without IdP user. |
| Recommended approach | **Retry** transient failures on `POST /v1/auth/idp` + **UX redirect to `/connexion`**; login completes link idempotently via existing `AuthUserLinkService.resolveIdpSignInUser`. |

**Decision record (rollback vs idempotence):** Treat **API idempotence as the server contract** (already satisfied); add **client resilience** (retry + login recovery). Do not mirror story 1.7 deletion in reverse on the client unless product explicitly accepts narrow `deleteUser` on 401/503 only — inferior to login recovery and inconsistent with existing patterns (`account-delete-dialog.ts` never calls client `deleteUser`).

## Recommended Next Steps

### Fix direction

| Mechanism | Action |
| --------- | ------ |
| Client resilience | Retry + login redirect in `signup.ts` `finishIdpSignIn` |
| API (already OK) | Document idempotence; optional `@Transactional` on link for atomicity with session (separate concern) |
| Avoid | Blind `deleteUser` on status 0 / 5xx |
| Long-term | Consider server-orchestrated signup (Admin SDK) if orphan rate material |

### Diagnostic

1. Staging: signup with API stopped → verify orphan; start API → login completes.
2. Compare `users.idp_uid` set vs Firebase Auth user count (email provider).
3. Add integration test for duplicate `POST /v1/auth/idp`.

## Reproduction Plan

1. Local: `./scripts/start-dev.sh` with valid `HATCAST_FIREBASE_*`.
2. Stop API after patching `signup.ts` to delay (or block port 8080) **after** Firebase create.
3. Sign up new email → observe Firebase user in console, no HatCast session, snackbar error.
4. Restart API → navigate to `/connexion`, sign in same credentials → expect 200 and session (idempotent link).
5. Optional: repeat with API returning 500 mid-request to validate rollback must not run.

## Side Findings

- **Google signup** (`onGoogleCredential` → `POST /v1/auth/google`) does not use Firebase Auth email provider; orphan shape differs (GIS JWT only). DW-104 scope in deferred-work targets **email inscrits**.
- **`logout()`** already applies asymmetric cleanup: always `signOut` Firebase even if API logout fails (`auth-api.service.ts:163-182`) — precedent for "prefer consistent IdP state" but opposite direction from signup.
- **Email uniqueness** on `users.email` is **not** DB-unique (`UserEntity.kt:28-29`); conflicts handled in link service logic, not constraint.

## Follow-up: 2026-06-07

### New Evidence

Initial forensic pass — code trace signup → AuthController → AuthUserLinkService; comparison with story 1.7 deletion pattern.

### Updated Conclusion

Investigation **concluded** (user option 4). Fix direction locked: retry + login recovery; reject unconditional client `deleteUser`.

### Hand-off

- **Story scope:** Epic 1 — DW-104 / auth orphan recovery.
- **Files to touch:** `signup.ts` (primary), optionally shared helper with `login.ts` / `auth-api.service.ts`; tests in `AuthControllerIntegrationTest` + signup spec.
- **Out of scope for minimal fix:** server-orchestrated signup (Hypothesis 3); prod orphan audit (backlog #6, blocked on data).
