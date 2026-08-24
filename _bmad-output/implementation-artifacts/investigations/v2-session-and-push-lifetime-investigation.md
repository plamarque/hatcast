# Investigation: V2 session and push lifetime

## Hand-off Brief

1. **What happened.** Patrice reports being apparently signed out after two or three inactive days and is concerned this may suppress notifications.
2. **Where the case stands.** Source configuration sets the remembered HatCast session to 2,592,000 seconds (30 days) of inactivity, but does not configure a persistent `HATCAST_SESSION` cookie. Google button sign-in also has no Firebase client session for automatic recovery.
3. **What's needed next.** Verify the mobile browser's cookie lifecycle and decide whether to use a persistent cookie and/or a Google reauthentication/recovery design.

## Case Info

| Field            | Value |
| ---------------- | ----- |
| Ticket           | N/A |
| Date opened      | 2026-08-24 |
| Status           | Active |
| System           | HatCast V2, Angular SPA and Spring API |
| Evidence sources | V2 source configuration and session/push implementation |

## Problem Statement

User report: "sur hatcast v2 quel la durée de vie d'une session connectée ? j'ai l'impression que si je ne me connecte pas pendant 2-3 jours, l'appli se déconnecte. du coup je m'inquiete de ne aps recevoir les notifications"

## Evidence Inventory

| Source | Status | Notes |
| ------ | ------ | ----- |
| API session policy | Available | Defaults and assignment traced. |
| Angular authentication recovery | Available | Recreates a remembered IdP session after a 401 when the IdP user persists. |
| Web Push implementation | Available | Delivery is based on persisted subscriptions. |
| Deployed configuration and affected browser storage | Missing | Required to explain the reported 2–3 day observation. |

## Investigation Backlog

| # | Path to Explore | Priority | Status | Notes |
| - | --------------- | -------- | ------ | ----- |
| 1 | Confirm deployed auth-duration environment overrides | High | Open | `HATCAST_AUTH_*` can override defaults. |
| 2 | Inspect affected browser cookie, local preference, permission, and subscription | High | Open | Needed to identify the observed logout mechanism. |

## Timeline of Events

| Time | Event | Source | Confidence |
| ---- | ----- | ------ | ---------- |
| 2026-08-24 | Investigation opened from user report. | User message | Confirmed |

## Confirmed Findings

### Finding 1: Remembered sessions are configured for 30 inactive days by default

**Evidence:** `services/api/src/main/resources/application.yml:53-55`; `services/api/src/main/kotlin/com/hatcast/api/auth/AuthSessionPolicy.kt:11-19`

**Detail:** The API assigns a 2,592,000-second maximum inactive interval when `rememberMe` is true; the alternate value is 1,800 seconds.

### Finding 2: Push delivery is based on stored subscriptions, not the browser HTTP session

**Evidence:** `services/api/src/main/kotlin/com/hatcast/api/notification/PushNotificationEligibilityPort.kt:24-40`; `services/api/src/main/kotlin/com/hatcast/api/notification/WebPushNotificationSender.kt:39-86`

**Detail:** Notification delivery checks the user preference and stored subscription, then sends through Web Push. It has no dependency on `HttpSession`.

### Finding 3: Google button sign-in does not create a Firebase client session

**Evidence:** `apps/web/src/app/pages/login/login.ts:154-161,231-235`; `apps/web/src/app/core/auth/firebase-auth-session.ts:35-37`; `apps/web/src/app/core/auth/auth-api.service.ts:119-131`

**Detail:** The Google Identity Services widget returns a credential that the client sends to `/v1/auth/google`; the source explicitly describes this as a HatCast session without a Firebase client session. Automatic recovery after a 401 requires `firebaseAuth.getAuthOrNull()?.currentUser`, so it does not run when that client user is absent.

### Finding 4: The remembered-session cookie has no configured persistence lifetime

**Evidence:** `services/api/src/main/resources/application.yml:41-49`; `services/api/src/main/kotlin/com/hatcast/api/auth/AuthSessionPolicy.kt:11-19`

**Detail:** The session cookie is configured with a name, `HttpOnly`, and `SameSite=Lax`, but no `Max-Age` or expiry. The 30-day value is applied only to the server-side `HttpSession.maxInactiveInterval`. Therefore a mobile browser closing, clearing, or evicting its session-cookie state can remove the client handle to a still-valid server session.

## Deduced Conclusions

### Deduction 1: A session expiry alone should not disable push notifications

**Based on:** Finding 2

**Reasoning:** The dispatcher resolves a persisted subscription from the database and sends without reading an authenticated request or session.

**Conclusion:** A user can receive a push while not currently logged into HatCast, provided the subscription, browser permission, category preference, and VAPID configuration remain valid.

## Hypothesized Paths

### Hypothesis 1: The observed logout is caused by loss of the non-persistent HatCast cookie, followed by no transparent Google recovery

**Status:** Open

**Theory:** A mobile browser closing, clearing, or evicting its session-cookie state can make the UI appear logged out before 30 days. The Google button flow cannot transparently recreate it because it has no persisted Firebase client user.

**Supporting indicators:** The source default contradicts a 2–3 day expiry.

**Would confirm:** Reproducing after closing/evicting the browser with a cookie that lacks `Max-Age`, then observing the `HATCAST_SESSION` cookie absent and `/v1/auth/me` returning 401.

**Would refute:** A reproducible 2–3 day expiration under source-default settings with persistent browser storage.

**Resolution:** Open.

## Missing Evidence

| Gap | Impact | How to Obtain |
| --- | ------ | ------------- |
| Cloud Run/deployed environment variables | Could shorten server session | Inspect non-secret values for `HATCAST_AUTH_REMEMBER_ME_SECONDS` and `HATCAST_AUTH_NO_REMEMBER_ME_SECONDS`. |
| Browser state on affected device | Could explain apparent logout or missing pushes | Check storage, cookie, notification permission, and push status after reopening HatCast. |

## Source Code Trace

| Element | Detail |
| ------- | ------ |
| Error origin | No error trace supplied. |
| Trigger | Inactivity followed by opening the SPA. |
| Condition | Server session expired or unavailable; client may restore with a persisted IdP user and local remember-me preference. |
| Related files | `AuthSessionPolicy.kt`, `AuthController.kt`, `auth-api.service.ts`, `UserPushSubscriptionService.kt`, `WebPushNotificationSender.kt` |

## Conclusion

**Confidence:** Medium

The checked source defines a 30-day remembered HatCast server session, not a two- or three-day session, and push delivery is session-independent. However, the source does not configure a persistent session cookie, so the mobile browser can lose the session handle before the 30-day server window. For the Google button flow, "remember me" does not provide transparent recovery after that loss because this flow has no Firebase client session to exchange for a new HatCast session. This is a medium-confidence source-level explanation; mobile-browser reproduction remains needed.

## Recommended Next Steps

### Fix direction

No code change is indicated before the deployment and browser evidence is collected.

### Diagnostic

Verify deployed auth overrides and, on the affected device, HatCast push status plus browser notification permission.

## Reproduction Plan

1. Log in with "Se souvenir de moi" enabled and enable push.
2. Leave the browser unused for more than three days without clearing site data.
3. Reopen HatCast and inspect session restoration and push status.

## Side Findings

- The login UI initializes "Se souvenir de moi" as checked by default (`apps/web/src/app/pages/login/login.ts:121-122`).
