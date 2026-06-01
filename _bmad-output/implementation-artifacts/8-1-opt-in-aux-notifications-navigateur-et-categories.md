# Story 8.1: Global browser push notification opt-in

**Status:** done

**Story ID:** 8.1  
**Story key:** `8-1-opt-in-aux-notifications-navigateur-et-categories`  
**Epic:** 8 — Notifications (push, email, preferences)  
**PLAN:** [PLAN.md](../../PLAN.md) § Wave iso-V1 — MEP remainder — **8.1** P0  
**SCP:** [sprint-change-proposal-2026-06-02-iso-v1-mep-scope.md](../planning-artifacts/sprint-change-proposal-2026-06-02-iso-v1-mep-scope.md)  
**Depends:** Auth session (Epic 1), PWA service worker registration (Story **10.1** done)  
**Blocks:** Story **8.3** (push leg of FR31 milestone delivery)

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

---

## Story

As a **HatCast member**,  
I want to **turn browser push notifications on or off globally**,  
so that **I am informed of important troupe events only when I choose to** (MVP: no per-category preferences — FR29/FR30).

---

## Acceptance Criteria

1. **Given** a browser that supports the Push API and a **production** build with a registered service worker (Story 10.1), **when** the user grants `Notification` permission and completes opt-in on **Mon compte** (`/compte`), **then** the push subscription (endpoint + keys) is **persisted server-side** for the authenticated `user_id`, and the UI shows an **enabled** state (FR29). [Source: epics 8.1 ; PRD § Push notifications (web)]

2. **Given** the user has opted in on this device, **when** they open `/compte` again, **then** the UI reflects **enabled** without requiring a new permission prompt (subscription loaded from API and/or local `PushManager` state). [Source: FR29]

3. **Given** the user **denies** `Notification.requestPermission()` or revokes permission in the browser/OS, **when** they use HatCast, **then** no new push subscription is stored, existing subscriptions for that user/device are **removed or marked inactive** on opt-out, and the UI shows **disabled** / explains how to re-enable (FR29/FR30). [Source: epics 8.1]

4. **Given** the user toggles **off** push for this device in the app (explicit disable), **when** the action succeeds, **then** this device's server-side subscription is removed, the local `PushSubscription` is **unsubscribed** where possible, and the account-level flag becomes `false` only when no subscriptions remain. [Decision 2026-06-01: toggle par appareil ; Source: epics 8.1]

5. **Given** push is unsupported (`!('PushManager' in window)` or `!('serviceWorker' in navigator)`), **when** the user visits the notifications section, **then** show a clear **French** message that push is unavailable on this browser — no broken toggle (FR29). [Source: NFR-A1]

6. **Given** Story 8.1 scope, **when** implementation ships, **then** **no** FR31 milestone notifications are actually **sent** (no queue worker, no email, no `web-push` send) — only **registration + eligibility**; `CompositionNotificationPort` remains no-op for delivery (Epic **8.3**). [Source: SCP § 8.1 ; Story 6-13]

7. **Given** implementation complete, **when** tests run, **then** API integration tests cover register / list status / disable / idempotent re-register; Vitest covers permission gating and UI states; `./gradlew test` and `npm run test -w @hatcast/web -- --watch=false` pass. [Source: project-context.md]

**Product coverage:** FR29, FR30 (global MVP only) ; NFR-R2 prep (no send failures yet — delivery in 8.3).

---

## Acceptance Criteria — Material 3 (UI)

**M3-1. Material components** — **Given** the push section on `/compte`, **when** rendered, **then** use `mat-slide-toggle` (or `mat-checkbox` + label) for this-device opt-in, `mat-button` for “Réactiver dans le navigateur” help, `mat-progress-spinner` while subscribing, and `mat-hint` / inline text for errors — no custom clickable divs for the same role. [Source: FRONTEND_UI.md ; UX-DR11]

**M3-2. Tokens & theme** — **Given** section styles, **when** colors are applied, **then** only `var(--mat-sys-*)` / `color-mix` — no hard-coded hex on feature SCSS. [Source: FRONTEND_UI.md]

**M3-3. Mobile & touch** — **Given** viewport ≤ 480px, **when** the toggle and any action button are shown, **then** touch targets ≥ 48×48 dp ; French `aria-label` on icon-only controls. [Source: NFR-A1 ; FRONTEND_UI.md]

**M3-4. Member navigation** — **Given** `/compte` is an existing member shell (Story 17.24), **when** adding the section, **then** do **not** change global app bar / rail ; add a new `<section>` below “Préférences membre” (or grouped under a “Notifications” heading). [Source: ux-hub-a-faire.md N/A for account page]

**M3-5. Review** — **Given** implementation done, **when** validating, **then** walk FRONTEND_UI.md § Checklist M3 HatCast and note waivers in Dev Notes. [Source: AGENTS.md]

---

## Tasks / Subtasks

- [x] **Scope:** `services/api/` + `apps/web/` — **not** `legacy/` (reference only for V1 parity).

- [x] **Data model & migration** (AC: 1, 3, 4)
  - [x] Flyway `V44__user_push_subscriptions.sql` (or next free version after current branch):
    - `users.push_notifications_enabled BOOLEAN NOT NULL DEFAULT false` (global opt-in flag).
    - Table `user_push_subscriptions` (`id`, `user_id` FK, `endpoint` UNIQUE, `p256dh_key`, `auth_key`, `user_agent`, `created_at`, `last_used_at` optional).
  - [x] Portable SQL (H2 test profile + PostgreSQL) — follow `V40` style.

- [x] **API — push registration** (AC: 1–4, 6)
  - [x] Package `com.hatcast.api.notification` (or `push`) with entity, repository, service.
  - [x] `GET /v1/me/push` → `{ enabled, permissionHint, subscriptionCount, subscriptions[]? }` (no secrets in list).
  - [x] `PUT /v1/me/push/subscription` — body: Web Push subscription JSON (`endpoint`, `keys.p256dh`, `keys.auth`) ; sets `push_notifications_enabled = true` ; upsert by `endpoint`.
  - [x] `DELETE /v1/me/push/subscription` — query `endpoint` optional ; if omitted, delete all for user ; set `enabled = false` when last sub removed.
  - [x] `PATCH /v1/me/push` — `{ "enabled": false }` global opt-out (delete all subs).
  - [x] Secured with session (`SessionUserPrincipal`) — same as [`MePreferencesController`](../../services/api/src/main/kotlin/com/hatcast/api/user/MePreferencesController.kt).
  - [x] OpenAPI fragment + aggregate ; document in `services/api/openapi/`.
  - [x] Config: `HATCAST_WEB_PUSH_VAPID_PUBLIC_KEY` (and private key placeholder for 8.3 — **private key not used in 8.1 send path**). Expose **public** key via `GET /v1/config/public` or environment injection on web build — **never commit private key**.

- [x] **Web — service worker push handler** (AC: 1, 5, 6)
  - [x] Extend PWA worker for **standard Web Push** `push` event (PRD: not FCM long-term):
    - Minimal handler: `self.addEventListener('push', …)` → `showNotification` with title/body from `event.data.json()` if present, else generic “HatCast”.
    - `notificationclick` → `clients.openWindow` with `data.url` or `/`.
  - [x] **Do not** port V1 Firebase Messaging SW ([`legacy/src/service-worker.js`](../../legacy/src/service-worker.js) L96–159) wholesale — reference action matrix for **8.3** only.
  - [x] Angular `@angular/pwa` uses `ngsw-worker.js` — use documented approach: custom worker merging ngsw + push listener, or `importScripts` pattern approved for Angular 21 ; verify production build still passes `npm run build -w @hatcast/web -- --configuration production`.

- [x] **Web — opt-in UX on `/compte`** (AC: 1–5, M3)
  - [x] `PushNotificationsSection` (standalone) under `apps/web/src/app/shared/` or `core/push/`.
  - [x] `PushNotificationsService`: `canUsePush()`, `getPermission()`, `subscribe(vapidPublicKey)`, `unsubscribe()`, sync with API.
  - [x] Mount in [`account-placeholder.html`](../../apps/web/src/app/pages/account-placeholder/account-placeholder.html) after member preferences section.
  - [x] French copy aligned with V1 intent ([`PreferencesModal.vue`](../../legacy/src/components/PreferencesModal.vue) `enablePushOnThisDevice` / `disablePushOnThisDevice`) — **single device toggle**, no category checkboxes (8.2).
  - [x] `environment.*.ts`: `webPushVapidPublicKey` from build-time env (document in `.env.example`).

- [x] **Eligibility hook for future 8.3** (AC: 6)
  - [x] Add `PushNotificationEligibilityPort` / `UserPushSubscriptionRepository.hasActiveSubscription(userId)` used later by notification dispatcher — **8.1** implements repository only ; **do not** wire into `CompositionNotificationPort` yet except optional DEBUG log “would send if enabled”.

- [x] **Tests** (AC: 7)
  - [x] `MePushSubscriptionIntegrationTest` — register, duplicate endpoint idempotent, disable, unauthorized 401.
  - [x] `push-notifications.service.spec.ts` — mock `Notification`, `PushManager`, API client.
  - [x] `push-notifications-section.spec.ts` — `data-testid="push-notifications-toggle"`, denied permission message.

### Review Findings

- [x] [Review][Decision] Clarify whether the `/compte` toggle is global or per-device — Resolved: per-device toggle. AC4, UI copy, and client state now treat enabled as current-device only; account-level `push_notifications_enabled` remains true while at least one subscription exists. [`apps/web/src/app/core/push/push-notifications.service.ts:45`, `apps/web/src/app/core/push/push-notifications.service.ts:99`, `services/api/src/main/kotlin/com/hatcast/api/notification/UserPushSubscriptionService.kt:87`, `apps/web/src/app/shared/push-notifications-section/push-notifications-section.ts:27`]
- [x] [Review][Patch] Revoked browser permission is not synchronized server-side on page load [`apps/web/src/app/core/push/push-notifications.service.ts:41`]
- [x] [Review][Patch] Subscription upsert is scoped by user while the database enforces endpoint uniqueness globally [`services/api/src/main/kotlin/com/hatcast/api/notification/UserPushSubscriptionService.kt:46`]
- [x] [Review][Patch] Notification click does not safely honor `data.url` [`apps/web/src/custom-sw.js:28`]
- [x] [Review][Patch] Toggle handler lets push API exceptions escape without restoring a user-facing error state [`apps/web/src/app/shared/push-notifications-section/push-notifications-section.ts:131`]

---

## Dev Notes

### Critical: V2 has zero push infrastructure today

| Area | V1 (`legacy/`) | V2 today |
|------|----------------|----------|
| Token storage | Firestore `userPushTokens/{email}.tokens[]` | **None** |
| Client SDK | Firebase `getToken(messaging)` + VAPID in config | **None** |
| Queue / send | `pushQueue` + Cloud Function `processPushQueue` | **None** |
| SW push handler | Firebase `onBackgroundMessage` in custom SW | **`ngsw-worker.js` only — no `push` listener** |
| Account UI | `PreferencesModal.vue` per-category + device toggle | `/compte` has pseudo/roles only — **no push section** |

**PRD normative target ([prd.md](../planning-artifacts/prd.md) § Push notifications):** **Web Push** — SW subscription, **VAPID** keys outside repo, **subscription records in PostgreSQL**, server-side send in later stories. **Do not** add Firebase Messaging SDK to V2 for 8.1.

### Recommended API contract (normative for dev)

```json
// PUT /v1/me/push/subscription
{
  "endpoint": "https://fcm.googleapis.com/fcm/send/…",
  "keys": { "p256dh": "…", "auth": "…" }
}

// GET /v1/me/push
{
  "enabled": true,
  "browserPermission": "granted",
  "subscriptionCount": 1
}
```

Use `PushSubscription.toJSON()` from the browser; validate endpoint URL and key lengths server-side.

### V1 behaviour to mirror (reference only)

| V1 | V2 8.1 |
|----|--------|
| `requestAndGetToken()` after `Notification.requestPermission()` | `pushManager.subscribe({ applicationServerKey: vapidPublicKey })` |
| Save token array per email in Firestore | Upsert row in `user_push_subscriptions` by `user_id` |
| `disablePushOnThisDevice()` clears `localStorage fcmToken` | `subscription.unsubscribe()` + `DELETE` API |
| Category prefs (`notifySelectionPush`, …) | **Out of scope** — Story **8.2** post-MVP ; global flag governs all types for 8.3 |

### Service worker strategy (avoid 10.1 regression)

Story **10.1** installed `@angular/pwa` with `ngsw-config.json` and **no** push handlers ([10-1 story Dev Notes](../../_bmad-output/implementation-artifacts/10-1-installabilite-pwa-raccourci-ajouter-a-lecran-d-accueil.md): push extensions = Epic 8).

**Implementation options (pick one, document in Dev Agent Record):**

1. **Custom worker** that imports Angular’s generated worker + adds `push` / `notificationclick` listeners (preferred for single registration).
2. **Separate** minimal `push-sw.js` registered alongside ngsw — only if team accepts dual SW complexity (generally **avoid**).

Local testing: production build + HTTPS (`./scripts/start-dev.sh` or `ng serve` SSL). Push permission is unreliable on plain HTTP dev without SW.

**Chosen (8.1):** Option 1 — `custom-sw.js` registers `push`/`notificationclick` with `stopImmediatePropagation`, then `importScripts('./ngsw-worker.js')`. Registered via `provideServiceWorker('custom-sw.js')`.

### Architecture compliance

- **NFR-R2** ([architecture.md](../planning-artifacts/architecture.md)): domain writes independent of notification delivery — 8.1 is registration only ; 8.3 adds async send with observability.
- **ADR-0006** (Firestore queue): **V1 pattern** — do **not** recreate `pushQueue` in Postgres for 8.1 ; 8.3 may use outbox/table + worker (separate design).
- **CompositionNotificationPort** ([CompositionNotificationPort.kt](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionNotificationPort.kt)): keep `NoOpCompositionNotificationAdapter` ; after-commit hooks from **6-13** unchanged.
- **Security:** subscriptions scoped to session user ; no cross-user endpoint leakage ; rate-limit PUT if easy (optional).

### Scope boundaries

| In scope (8.1) | Out of scope |
|----------------|--------------|
| Global opt-in + multi-device subscription storage | Per-category prefs (**8.2**) |
| SW `push` + `notificationclick` minimal | Rich notification actions (confirm/decline) — **8.3** |
| `/compte` UI section | Troupe-level email policy |
| VAPID public key wiring | Actual `web-push` send / queue (**8.3**) |
| Eligibility repository / port stub | Migrating V1 Firestore tokens to V2 |
| `.env.example` variable names | Email templates |

### Dependencies

| Story / item | Status | Relationship |
|--------------|--------|--------------|
| **10.1** | done | SW + manifest required for subscribe |
| **17.24** / **17.33** | done | `/compte` shell + `MePreferencesApiService` pattern to follow |
| **6-13** | done | Notification intents fire after commit — delivery waits on 8.3 |
| **8.3** | backlog | Consumes `push_notifications_enabled` + subscriptions |
| **8.2** | backlog | Category prefs — do not add UI in 8.1 |

### Explicit non-goals

- Implementing `CompositionNotificationPort` real adapter or FR31 sends.
- Porting V1 `pushQueue` / Cloud Functions.
- Category toggles in preferences (story key mentions “categories” historically — **MVP = global only** per epics 8.1 vs 8.2).
- Audit trail entries for opt-in (optional nice-to-have; FR35 write path is **9.0**).
- iOS Web Push limitations beyond honest UX copy (Safari 16.4+ PWA — link to Apple docs in hint if needed).

### M3 checklist (8.1)

- M3-1 ✅ `mat-slide-toggle`, `mat-stroked-button`, `mat-spinner`, inline hints
- M3-2 ✅ `var(--mat-sys-*)` / `color-mix` only in section styles
- M3-3 ✅ min-height 3rem (48dp) on row/button ; no icon-only controls in this section
- M3-4 ✅ new `<section>` under Mon compte ; no app bar/rail changes
- M3-5 ✅ reviewed ; no waivers

### Previous story intelligence

No prior story in Epic 8. Relevant prep:

- **6-13** — `@TransactionalEventListener(AFTER_COMMIT)` for `publishDraftCompositionShared` ; Epic 8 delivery must attach to port/listener, not re-open in-tx calls.
- **10-1** — Do not break install banner or `ngsw` precache when adding push listener.
- **17-33** — Account-level API pattern: `GET/PATCH /v1/me/...` + small dedicated service + integration test.

### Git intelligence

Recent account/PWA work: `f208dfc0` feat(account): member preferences ; **10.1** PWA foundation. Follow same conventions: Kotlin service + Flyway, Angular standalone component + `ApiResult`, Conventional Commit on merge.

### Project context reference

- Tests: `./gradlew test`, `npm run test -w @hatcast/web -- --watch=false` ([project-context.md](../../project-context.md)).
- UI: [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md), rule `material-m3-hatcast`.
- V1 ops docs (reference): [PUSH_NOTIFICATIONS_SUMMARY.md](../../docs/v1/technical/PUSH_NOTIFICATIONS_SUMMARY.md), [AUTO_REFRESH_FCM_TOKENS.md](../../docs/v1/technical/AUTO_REFRESH_FCM_TOKENS.md).

### Latest technical notes (Web Push)

- Use **RFC 8030** Push API + **VAPID** (RFC 8292) ; server library for **8.3**: `nl.martijndwars:web-push` or Spring-compatible wrapper.
- **Angular 21** + `@angular/service-worker`: verify [Angular SW docs](https://angular.dev/ecosystem/service-workers) for custom worker entry if extending `ngsw-worker.js`.
- Store **only** `endpoint`, `p256dh`, `auth` — not full browser subscription object blobs in JSONB unless needed.

---

## Dev Agent Record

### Agent Model Used

Composer

### Implementation Plan

- Flyway V44 + JPA entity/repository for `user_push_subscriptions` ; `users.push_notifications_enabled`.
- REST `/v1/me/push*` + `GET /v1/config/public` (VAPID public key).
- `PushNotificationEligibilityPort` stub for 8.3.
- Angular: `custom-sw.js` (push + notificationclick) ; `PushNotificationsService` + section on `/compte`.
- Integration + Vitest coverage.

### Completion Notes List

- Backend: register/upsert/delete/patch push subscriptions ; endpoint HTTPS validation ; global opt-out clears subs.
- Frontend: global toggle on `/compte` ; denied/unsupported states ; VAPID from env or `/v1/config/public`.
- SW: custom worker extends ngsw without breaking PWA precache (production build verified).
- Tests: 7 integration tests ; 8 Vitest specs ; full `./gradlew test` + 801 web tests green.
- No send path / `CompositionNotificationPort` unchanged (AC 6).

### File List

- .env.example
- apps/web/angular.json
- apps/web/src/app/app.config.ts
- apps/web/src/app/core/push/me-push-api.service.ts
- apps/web/src/app/core/push/push-notifications.service.ts
- apps/web/src/app/core/push/push-notifications.service.spec.ts
- apps/web/src/app/pages/account-placeholder/account-placeholder.html
- apps/web/src/app/pages/account-placeholder/account-placeholder.ts
- apps/web/src/app/shared/push-notifications-section/push-notifications-section.ts
- apps/web/src/app/shared/push-notifications-section/push-notifications-section.spec.ts
- apps/web/src/custom-sw.js
- apps/web/src/environments/environment.ts
- apps/web/src/environments/environment.development.ts
- services/api/openapi/push.yaml
- services/api/src/main/kotlin/com/hatcast/api/config/PublicConfigController.kt
- services/api/src/main/kotlin/com/hatcast/api/config/SecurityConfig.kt
- services/api/src/main/kotlin/com/hatcast/api/notification/MePushController.kt
- services/api/src/main/kotlin/com/hatcast/api/notification/PushNotificationEligibilityPort.kt
- services/api/src/main/kotlin/com/hatcast/api/notification/UserPushSubscriptionEntity.kt
- services/api/src/main/kotlin/com/hatcast/api/notification/UserPushSubscriptionRepository.kt
- services/api/src/main/kotlin/com/hatcast/api/notification/UserPushSubscriptionService.kt
- services/api/src/main/kotlin/com/hatcast/api/notification/dto/PushDtos.kt
- services/api/src/main/kotlin/com/hatcast/api/user/UserEntity.kt
- services/api/src/main/resources/application.yml
- services/api/src/main/resources/db/migration/V44__user_push_subscriptions.sql
- services/api/src/test/kotlin/com/hatcast/api/notification/MePushSubscriptionIntegrationTest.kt

### Change Log

- 2026-06-01 : Story created (create-story 8.1) — MEP P0 iso-V1 scope.
- 2026-06-01 : Story 8.1 implemented — push opt-in API, SW handler, `/compte` UI, tests.

---

### Validation create-story

- [x] AC métier numérotés et sourcés (epics / FR)
- [x] Section **Material 3** remplie
- [x] Tasks référencent les numéros d’AC (y compris M3-x)
- [x] Liens vers fichiers code existants à réutiliser
- [x] `npm run test` / `./gradlew test` mentionnés
