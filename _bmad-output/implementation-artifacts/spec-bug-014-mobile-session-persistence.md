---
title: 'Restore 30-day remembered mobile sessions'
type: 'bugfix'
created: '2026-08-24'
status: 'done'
review_loop_iteration: 0
baseline_commit: '903dc34a9bd4ffced3906e5a2d7f6bc8f6667c42'
context:
  - 'docs/v2/technical/FRONTEND_UI.md'
  - 'docs/adr/0010-v2-auth-identity-platform.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** A checked “Se souvenir de moi” currently gives a 30-day server-side idle timeout but leaves `HATCAST_SESSION` as a browser-session cookie. Closing a mobile browser removes the client handle, so the user cannot satisfy Story 1.4’s 30-day return guarantee; this is especially visible after Google sign-in because that flow has no Firebase client session to restore from.

**Approach:** Make the HatCast session cookie persist for the remembered lifetime only when `rememberMe=true`, while retaining a short, non-persistent session when false. Preserve existing secure cookie and token-handling boundaries, and document/test the different Google and Identity Platform recovery paths.

## Boundaries & Constraints

**Always:** Keep `HATCAST_SESSION` HttpOnly; retain `Secure` in deployed/cloud environments and the current SameSite policy compatible with credentialed requests. Use the 30-day configured server lifetime for remembered sessions and no long-lived secret in `localStorage`. Preserve Web Push subscriptions and delivery as session-independent. Treat an omitted API `rememberMe` as true.

**Ask First:** Any change to cross-site cookie policy, session-store schema, token persistence model, Google account-selection UX, deployed environment variables, or a duration other than the existing 30 days / 30 minutes.

**Never:** Do not change the Google flow into an assumed persisted Firebase-client session, store ID/refresh tokens in `localStorage`, weaken cookie security attributes, or couple notification delivery to an active HTTP session.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Remembered Google or IdP sign-in | `rememberMe=true` | Secure HatCast session has the 30-day server interval and a persistent cookie; reopening the same browser within the valid interval authenticates through `/v1/auth/me` without credentials. | Expired/revoked session remains unauthenticated. |
| Non-remembered sign-in | `rememberMe=false` | Server interval remains 30 minutes and cookie has no 30-day persistence; ending browser session requires authentication again. | Existing sign-in UI is shown. |
| Email/IdP recovery fallback | Persistent cookie unavailable, local remember preference and Firebase user exist | Existing IdP token exchange may recreate a HatCast session. | No Firebase user means no token exchange. |
| Google recovery fallback | Persistent cookie unavailable | No Firebase recovery is attempted or implied; the user signs in again. | No credentials/tokens are retained by the app. |

</frozen-after-approval>

## Code Map

- `services/api/src/main/resources/application.yml` -- Spring Session JDBC and `HATCAST_SESSION` name/HttpOnly/SameSite configuration; currently lacks cookie persistence lifetime.
- `services/api/src/main/resources/application-cloud.yml` -- deployed `Secure` cookie and forwarded-header configuration; must remain effective.
- `services/api/src/main/kotlin/com/hatcast/api/auth/AuthSessionPolicy.kt` -- central 30-day / 30-minute `HttpSession.maxInactiveInterval` policy.
- `services/api/src/main/kotlin/com/hatcast/api/auth/AuthController.kt` -- both `/v1/auth/google` and `/v1/auth/idp` create and save the HatCast session before applying policy.
- `services/api/src/main/kotlin/com/hatcast/api/auth/dto/AuthDtos.kt` and `services/api/openapi/auth.yaml` -- backward-compatible `rememberMe=true` request contract.
- `services/api/src/test/kotlin/com/hatcast/api/auth/AuthSessionPolicyTest.kt` and `AuthControllerIntegrationTest.kt` -- current interval and endpoint coverage; no persistent-cookie assertions.
- `apps/web/src/app/pages/login/login.ts` -- Google Identity Services sends a credential to HatCast; it explicitly does not establish a Firebase client session.
- `apps/web/src/app/core/auth/auth-api.service.ts` -- API calls and `ensureHatcastSession`; IdP-only token re-exchange fallback after `/me` 401.
- `apps/web/src/app/core/auth/hatcast-remember-me-storage.ts` -- stores only the remember preference boolean, not a credential.
- `apps/web/src/app/core/auth/firebase-auth.service.ts` and `firebase-auth-session.ts` -- Firebase client access and documented distinction from direct Google sign-in.
- `services/api/src/main/kotlin/com/hatcast/api/notification/WebPushNotificationSender.kt` and push subscription entities/controllers -- dispatch reads persisted subscriptions by user and does not read `HttpSession`.
- `ARCH.md`, `ISSUES.md`, and `_bmad-output/implementation-artifacts/investigations/v2-session-and-push-lifetime-investigation.md` -- runtime architecture, issue record, and evidence record; the latter two are present in local `v2` but absent from the required `origin/v2` base.

## Tasks & Acceptance

**Execution:**
- [x] `services/api` session configuration/policy -- configure a per-sign-in cookie lifetime aligned with the already-selected server interval: 30 days only for remembered sessions and a browser-session cookie for non-remembered sessions; preserve the current security attributes.
- [x] `services/api` auth tests -- assert both Google and IdP sign-ins apply the selected server timeout and cookie persistence/security contract, including omitted `rememberMe`.
- [x] `apps/web` authentication tests -- retain the checked-by-default payload behavior and cover the distinct recovery contracts: persistent HatCast cookie for Google, and Firebase-user fallback only for IdP/email.
- [x] `services/api` notification tests or focused regression coverage -- demonstrate that a stored subscription remains deliverable without an authenticated request/session.
- [x] `ARCH.md`, `ISSUES.md`, and investigation -- record the actual client/server lifetimes, cookie attributes, Google-versus-IdP behavior, push independence, fixed root cause, and evidence. Restore the BUG-014/investigation records onto this branch because they are not in `origin/v2`.

**Acceptance Criteria:**
- Given either successful Google or Identity Platform sign-in with checked remember-me, when the browser is closed and reopened on the same device before 30 days of server inactivity, then `/v1/auth/me` restores the HatCast session without credential entry.
- Given remember-me is unchecked, when the browser session ends, then no 30-day `HATCAST_SESSION` cookie survives and protected routes require authentication; the server-side 30-minute policy remains distinct.
- Given a sign-in request omits `rememberMe`, when the API establishes the session, then it follows the remembered 30-day behavior for compatibility.
- Given a deployed environment, when either session cookie is issued, then it remains HttpOnly, Secure, and SameSite-compatible; no credential is added to browser local storage.
- Given a user has a persisted push subscription but no active HatCast session, when an eligible notification is dispatched, then delivery uses that subscription independently of session state.

## Spec Change Log

## Design Notes

The durable authentication handle is the HttpOnly session cookie, not the front-end preference. The preference remains useful only for the existing email/Identity Platform recovery fallback. A persistent cookie resolves the Google case directly and avoids inventing a Firebase client session for a GIS credential flow.

## Verification

**Commands:**
- `./gradlew test --tests '*AuthSessionPolicyTest' --tests '*AuthControllerIntegrationTest' --tests '*WebPush*Test'` -- expected: selected API tests pass with cookie and push assertions.
- `npm run test -w @hatcast/web -- --watch=false` -- expected: auth tests pass, including remember-me payload/recovery coverage.
- `npm run build -w @hatcast/web` -- expected: production Angular build succeeds.

## Suggested Review Order

**Session lifetime and rotation**

- Rotate an incoming anonymous handle before persisting the authenticated context.
  [`AuthSessionPolicy.kt:28`](../../services/api/src/main/kotlin/com/hatcast/api/auth/AuthSessionPolicy.kt#L28)

- Apply the chosen browser lifetime only to the opaque session handle.
  [`HatcastSessionCookieSerializer.kt:31`](../../services/api/src/main/kotlin/com/hatcast/api/auth/HatcastSessionCookieSerializer.kt#L31)

- Bind the existing name, Secure and SameSite configuration without weakening it.
  [`HatcastSessionCookieConfiguration.kt:9`](../../services/api/src/main/kotlin/com/hatcast/api/auth/HatcastSessionCookieConfiguration.kt#L9)

**Authentication paths**

- Feed the selected policy into both direct Google and Identity Platform sessions.
  [`AuthController.kt:45`](../../services/api/src/main/kotlin/com/hatcast/api/auth/AuthController.kt#L45)

- Keep Google and Identity Platform request payloads explicit and aligned.
  [`auth-api.service.ts:177`](../../apps/web/src/app/core/auth/auth-api.service.ts#L177)

**Regression and operational evidence**

- Assert persistent, session-only and rotation behaviour at the HTTP boundary.
  [`AuthControllerIntegrationTest.kt:50`](../../services/api/src/test/kotlin/com/hatcast/api/auth/AuthControllerIntegrationTest.kt#L50)

- Record browser, server, Google, IdP and push lifetime evidence.
  [`v2-session-and-push-lifetime-investigation.md:1`](investigations/v2-session-and-push-lifetime-investigation.md#L1)
