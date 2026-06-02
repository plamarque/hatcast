---
baseline_commit: 4c6efbb099192c67dbfcef9195447806370a1cf1
---

# Story 8.2: Per-category notification preferences

**Status:** done

**Story ID:** 8.2  
**Story key:** `8-2-preferences-de-notification`  
**Epic:** 8 — Notifications (push, email, preferences)  
**PLAN:** [PLAN.md](../../PLAN.md) § Wave iso-V1 — **8.2 post-MVP** (categories) ; **8.3** P0 MEP does **not** require 8.2  
**SCP:** [sprint-change-proposal-2026-06-02-iso-v1-mep-scope.md](../planning-artifacts/sprint-change-proposal-2026-06-02-iso-v1-mep-scope.md) — category prefs remain post-MVP  
**Depends:** Story **8.1** (done — global push opt-in + subscription storage)  
**Consumed by:** Story **8.3** (milestone delivery checks category + channel eligibility)

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

---

## Story

As a **HatCast member**,  
I want to **manage my notification preferences by type and channel (push vs email)**,  
so that **I receive only the troupe updates I care about** and reduce noise (FR30 post-MVP categories).

---

## Acceptance Criteria

1. **Given** an authenticated user on `/compte`, **when** they open the **Notifications** section, **then** they see **category toggles** grouped like V1 (`Notifications` + `Rappels automatiques`), separate **push** and **email** columns/rows per category, in **French** copy aligned with [`PreferencesModal.vue`](../../legacy/src/components/PreferencesModal.vue) (FR30). [Source: epics 8.2 ; PRD FR30]

2. **Given** the canonical category catalog below, **when** the API returns preferences, **then** each category exposes stable `key`, French `label`, `pushEnabled`, `emailEnabled`, and defaults **`true`** for both channels (opt-out model, same as V1 `!== false`). [Source: V1 `userPreferences` ; FR31 intents]

   | `key` | French label (UI) | FR31 / V1 mapping |
   |-------|-------------------|-------------------|
   | `AVAILABILITY_REQUEST` | M'envoyer une notification lorsqu'un spectacle a besoin de personnes | FR31 availability opened ; V1 `notifyAvailability*` |
   | `COMPOSITION_SHARED` | M'envoyer une notification lorsque je suis concerné par une composition (brouillon partagé) | FR31 draft shared ; V1 `notifySelection*` (draft path) |
   | `CONFIRMATION_REQUEST` | M'envoyer une notification pour confirmer ma participation | FR31 validate → confirm ; V1 `notifySelection*` (confirm path) |
   | `TEAM_CONFIRMED` | M'envoyer une notification lorsque l'équipe est confirmée | FR31 complete recap ; V1 `notifySelection*` (`isConfirmedTeam`) |
   | `REMINDER_7_DAYS` | Rappel automatique 7 jours avant un spectacle | V1 `notifyReminder7Days*` |
   | `REMINDER_1_DAY` | Rappel automatique 1 jour avant un spectacle | V1 `notifyReminder1Day*` |
   | `AVAILABILITY_WEEKLY_REMINDER` | Rappels hebdomadaires si je n'ai pas indiqué mes disponibilités | V1 `notifyAvailabilityReminder*` |

3. **Given** push is **not enabled on the current device** (Story 8.1 `PushNotificationsService` state ≠ `enabled`), **when** category push toggles are shown, **then** they are **disabled** with the same explanatory hint as V1 (“Les préférences ci-dessous sont désactivées…”) ; **email** toggles remain editable (FR30). [Source: V1 PreferencesModal L183–185]

4. **Given** the user changes a category preference, **when** the PATCH succeeds, **then** values persist in PostgreSQL at **account level** (`user_id`), survive reload, and apply to **future** sends only (no retroactive cancellation) (FR30). [Source: epics 8.2]

5. **Given** `GET /v1/me/notification-preferences` and `PATCH /v1/me/notification-preferences`, **when** called by the session user, **then** they follow the same auth pattern as [`MePushController`](../../services/api/src/main/kotlin/com/hatcast/api/notification/MePushController.kt) / [`MePreferencesController`](../../services/api/src/main/kotlin/com/hatcast/api/user/MePreferencesController.kt) ; invalid category keys → **400** ; OpenAPI fragment updated. [Source: project conventions]

6. **Given** `NotificationPreferenceEligibilityPort` (new or extended), **when** Story **8.3** asks “may we send category X on channel Y?”, **then** the answer is:
   - **PUSH:** `global push enabled` (8.1) **AND** `hasActiveSubscription` **AND** `category.pushEnabled === true`
   - **EMAIL:** `category.emailEnabled === true` (troupe-level email policy remains 8.3 scope)
   - **If 8.2 not deployed / row missing:** treat as **`true`** (backward compatible with 8.3 MVP). [Source: PLAN § 8.3 without 8.2]

7. **Given** implementation complete, **when** tests run, **then** API integration tests cover GET defaults, PATCH partial update, invalid key, unauthorized 401 ; Vitest covers disabled push toggles when device off, PATCH on toggle, reload state ; `./gradlew test` and `npm run test -w @hatcast/web -- --watch=false` pass. [Source: project-context.md]

**Product coverage:** FR30 *(post-MVP categories)* ; prepares FR31 channel gating for **8.3**. **Does not block MEP:** global opt-in from **8.1** still governs all push until this story ships.

---

## Acceptance Criteria — Material 3 (UI)

**M3-1. Material components** — **Given** category preference UI on `/compte`, **when** rendered, **then** use `mat-slide-toggle` (or `mat-checkbox` + label) per channel row, `mat-divider` between groups, `mat-hint` for disabled-push explanation — no custom clickable divs. [Source: FRONTEND_UI.md ; UX-DR11]

**M3-2. Tokens & theme** — **Given** section styles, **when** colors are applied, **then** only `var(--mat-sys-*)` / `color-mix` — no hard-coded hex on feature SCSS. [Source: FRONTEND_UI.md]

**M3-3. Mobile & touch** — **Given** viewport ≤ 480px, **when** toggles are shown, **then** touch targets ≥ 48×48 dp ; French `aria-label` on each toggle describing category + channel. [Source: NFR-A1 ; FRONTEND_UI.md]

**M3-4. Member navigation** — **Given** `/compte` shell (Story 17.24), **when** adding category prefs, **then** extend existing **Notifications** `<section>` below [`PushNotificationsSection`](../../apps/web/src/app/shared/push-notifications-section/push-notifications-section.ts) ; do **not** change app bar / rail. [Source: account-placeholder.html]

**M3-5. Review** — **Given** implementation done, **when** validating, **then** walk FRONTEND_UI.md § Checklist M3 HatCast and note waivers in Dev Notes. [Source: AGENTS.md]

---

## Tasks / Subtasks

- [x] **Scope:** `services/api/` + `apps/web/` — reference `legacy/` for V1 parity only.

- [x] **Data model & migration** (AC: 2, 4, 6)
  - [x] Flyway `V45__user_notification_preferences.sql` (or next free version after current branch):
    - Prefer **`users.notification_preferences JSONB NOT NULL DEFAULT '{}'`** storing `{ "AVAILABILITY_REQUEST": { "push": true, "email": true }, … }` — portable H2 + PostgreSQL (follow `V40` / `V44` style).
    - Alternative: normalized table `user_notification_preferences (user_id, category_key, channel, enabled)` — only if team rejects JSONB ; document choice in Dev Agent Record.
  - [x] Kotlin enum `NotificationCategory` + `NotificationChannel { PUSH, EMAIL }` in `com.hatcast.api.notification`.

- [x] **API — notification preferences** (AC: 2, 4, 5, 6)
  - [x] `GET /v1/me/notification-preferences` → `{ categories: [{ key, label, pushEnabled, emailEnabled }] }` with defaults merged server-side.
  - [x] `PATCH /v1/me/notification-preferences` — partial body `{ preferences: { "AVAILABILITY_REQUEST": { "push": false } } }` ; merge ; reject unknown keys.
  - [x] `UserNotificationPreferencesService` + `MeNotificationPreferencesController`.
  - [x] `NotificationPreferenceEligibilityPort.isAllowed(userId, category, channel): Boolean` — implement adapter ; **extend** [`PushNotificationEligibilityPort`](../../services/api/src/main/kotlin/com/hatcast/api/notification/PushNotificationEligibilityPort.kt) with optional `isPushAllowedForCategory(userId, category)` delegating to both ports.
  - [x] OpenAPI fragment `services/api/openapi/notification-preferences.yaml` + aggregate.

- [x] **Web — category preferences UI** (AC: 1, 3, 4, M3)
  - [x] `NotificationPreferencesSection` (standalone) under `apps/web/src/app/shared/` or `core/notifications/`.
  - [x] `MeNotificationPreferencesApiService` mirroring [`me-push-api.service.ts`](../../apps/web/src/app/core/push/me-push-api.service.ts).
  - [x] Inject `PushNotificationsService` to disable push toggles when `uiState !== 'enabled'`.
  - [x] Auto-save on toggle change (debounced ~300ms) like [`MemberPreferencesForm`](../../apps/web/src/app/shared/member-preferences-form/member-preferences-form.ts) — no modal “Enregistrer” button.
  - [x] Mount in [`account-placeholder.html`](../../apps/web/src/app/pages/account-placeholder/account-placeholder.html) inside Notifications section, **after** `<app-push-notifications-section />`.
  - [x] `data-testid` per category channel, e.g. `notification-pref-availability-request-push`.

- [x] **8.3 handoff (no send in this story)** (AC: 6)
  - [x] Document category → `CompositionNotificationPort` method mapping in Dev Agent Record for 8.3:
    - `publishDraftCompositionShared` → `COMPOSITION_SHARED`
    - `requestCompositionConfirmation` / `requestConfirmationForAssignees` → `CONFIRMATION_REQUEST`
    - (availability opened — new port method or scheduler in 8.3) → `AVAILABILITY_REQUEST`
    - team complete → `TEAM_CONFIRMED`
  - [x] **Do not** implement `web-push` send, email queue, or cron reminders here.

- [x] **Tests** (AC: 7)
  - [x] `MeNotificationPreferencesIntegrationTest` — defaults all true, patch one category, invalid key 400, 401.
  - [x] `NotificationPreferenceEligibilityAdapterTest` — global off blocks push ; category off blocks ; missing JSON defaults true.
  - [x] `notification-preferences-section.spec.ts` — push toggles disabled when push off ; PATCH called ; labels French.

---

## Dev Notes

### Priority & relationship to 8.3 MEP

| Item | Status |
|------|--------|
| **8.1** global push opt-in | **Done** — [`8-1-opt-in-aux-notifications-navigateur-et-categories.md`](./8-1-opt-in-aux-notifications-navigateur-et-categories.md) |
| **8.3** FR31 milestone send | **P0 MEP** — can ship with **all categories implicitly enabled** |
| **8.2** | **Post-MVP** per SCP / deferred triage — implement when PO activates category prefs |

**Critical:** Do **not** make 8.3 depend on 8.2 landing first. Eligibility port **must default to allow** when preferences are absent.

### V1 reference (Firestore `userPreferences/{email}`)

V1 stores flat booleans on the same document as role prefs. Relevant fields:

| V1 field | V2 category | Channel |
|----------|-------------|---------|
| `notifyAvailability` | `AVAILABILITY_REQUEST` | email |
| `notifyAvailabilityPush` | `AVAILABILITY_REQUEST` | push |
| `notifySelection` | `COMPOSITION_SHARED`, `CONFIRMATION_REQUEST`, `TEAM_CONFIRMED` (dispatcher picks by intent) | email |
| `notifySelectionPush` | same | push |
| `notifyReminder7Days` / `Push` | `REMINDER_7_DAYS` | email / push |
| `notifyReminder1Day` / `Push` | `REMINDER_1_DAY` | email / push |
| `notifyAvailabilityReminderEmail` / `Push` | `AVAILABILITY_WEEKLY_REMINDER` | email / push |

V1 gating logic: [`notificationTemplates.js`](../../legacy/src/services/notificationTemplates.js) checks `prefs?.field !== false`. [`notificationsService.js`](../../legacy/src/services/notificationsService.js) loads prefs then builds payloads per `reason`.

**V2 split:** FR31 distinguishes composition draft vs confirmation vs team complete — expose **three** toggles instead of one `notifySelection` for clearer UX (matches epics 8.2 intent). 8.3 dispatcher maps each intent to the correct category key.

### Recommended API contract (normative for dev)

```json
// GET /v1/me/notification-preferences
{
  "categories": [
    {
      "key": "AVAILABILITY_REQUEST",
      "label": "M'envoyer une notification lorsqu'un spectacle a besoin de personnes",
      "pushEnabled": true,
      "emailEnabled": true
    }
  ]
}

// PATCH /v1/me/notification-preferences
{
  "preferences": {
    "AVAILABILITY_REQUEST": { "push": false, "email": true },
    "REMINDER_7_DAYS": { "email": false }
  }
}
```

Labels may be server-driven (single source for web) or duplicated in a shared constants file — prefer **server-driven** to keep French copy centralized.

### Architecture compliance

- **Account-level storage** — same pattern as Story **17.33** (`users.member_display_name`, `preferred_role_keys`) ; notification prefs are **not** per-troupe.
- **NFR-R2** ([architecture.md](../planning-artifacts/architecture.md)) — preference writes are synchronous user actions ; delivery remains async in **8.3**.
- **Security:** session-scoped only ; no reading other users’ prefs.
- **CompositionNotificationPort** — remains `NoOpCompositionNotificationAdapter` in this story ; only eligibility port is extended.

### Frontend implementation guardrails

| Concern | Action |
|--------|--------|
| Reuse push state | `PushNotificationsService.loadStatus()` / `uiState` signal — do not duplicate permission logic |
| Save pattern | Debounced PATCH like `MemberPreferencesForm` + `MatSnackBar` on error |
| Section layout | Two sub-headings: « Notifications » and « Rappels automatiques » (match V1 grouping) |
| Loading | Show spinner until GET prefs + push status both resolved |

### Scope boundaries

| In scope (8.2) | Out of scope |
|----------------|--------------|
| Persist + UI for 7 categories × 2 channels | Actual push/email send (**8.3**) |
| Eligibility port for 8.3 | Scheduled reminder jobs / cron |
| OpenAPI + integration tests | Migrating V1 Firestore prefs to V2 (optional script — not required) |
| French UI copy V1 parity | Troupe-level “email delivery enabled” policy (**8.3**) |
| Default-all-true opt-out | Rich notification actions in SW (**8.3**) |

### Dependencies

| Story / item | Status | Relationship |
|--------------|--------|--------------|
| **8.1** | done | Device push toggle ; push toggles disabled when off |
| **8.3** | backlog | Consumes `NotificationPreferenceEligibilityPort` |
| **17.24** | done | `/compte` shell |
| **17.33** | done | Account-level API pattern (`/v1/me/preferences`) |
| **6-13** | done | After-commit notification intents — wiring in 8.3 |

### Explicit non-goals

- Sending notifications or adding `web-push` / SMTP dependencies.
- Replacing or removing Story **8.1** global/device toggle.
- Email address change UI (Story **1.6** backlog).
- Audit entries for preference changes (optional ; FR35 not required here).
- iOS Web Push edge cases beyond disabled-state copy.

### Previous story intelligence (8.1)

- **Per-device** push toggle vs **account-level** `push_notifications_enabled` — category prefs are **account-level** but push toggles UI-disabled when **this device** is not subscribed (V1 parity).
- Files to extend, not rewrite: [`push-notifications-section.ts`](../../apps/web/src/app/shared/push-notifications-section/push-notifications-section.ts), [`UserPushSubscriptionService.kt`](../../services/api/src/main/kotlin/com/hatcast/api/notification/UserPushSubscriptionService.kt).
- Review fixes from 8.1: sync revoked browser permission on load ; endpoint uniqueness global — **do not regress**.
- `custom-sw.js` unchanged in 8.2.

### Git intelligence

Recent Epic 8 work: `54368867` `feat(push): Add browser opt-in` — follow same package layout (`com.hatcast.api.notification`), OpenAPI fragments, Angular `core/push/` → add `core/notifications/` or colocate in `core/push/`.

### Project context reference

- Tests: `./gradlew test`, `npm run test -w @hatcast/web -- --watch=false` ([project-context.md](../../project-context.md)).
- UI: [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md).
- V1 ops: [PUSH_NOTIFICATIONS_SUMMARY.md](../../docs/v1/technical/PUSH_NOTIFICATIONS_SUMMARY.md).

### Latest technical notes

- JSONB in JPA: use `@JdbcTypeCode(SqlTypes.JSON)` (Hibernate 6) or `AttributeConverter` like `PreferredRoleKeysJsonConverter` — match existing `UserEntity` patterns.
- Angular Material 21 `mat-slide-toggle` supports `[disabled]` + `[checked]` for each row.
- Keep category `key` enum stable — 8.3 analytics and templates will reference these strings.

---

## Dev Agent Record

### Agent Model Used

GPT-5.5

### Implementation Plan

- Add account-level `users.notification_preferences` JSON storage with H2/PostgreSQL Flyway placeholders.
- Expose `/v1/me/notification-preferences` GET/PATCH with server-side category defaults, French labels, and 400 on unknown keys.
- Provide category/channel eligibility for future notification sends, preserving allow-by-default when preferences are absent.
- Add a Material 3 notification preference section under `/compte`, after the device-level push section.
- Cover API defaults/PATCH/401/400, eligibility, and Angular disabled-push/PATCH/label behavior.

### Completion Notes List

- Implemented Story 8.2 code paths and targeted tests.
- Targeted API tests pass: `./gradlew test --tests "com.hatcast.api.notification.MeNotificationPreferencesIntegrationTest" --tests "com.hatcast.api.notification.NotificationPreferenceEligibilityAdapterTest"`.
- Targeted UI test passes: `npm run test -w @hatcast/web -- --watch=false --include "src/app/shared/notification-preferences-section/notification-preferences-section.spec.ts"`.
- Full web suite passes: `npm run test -w @hatcast/web -- --watch=false`.
- Full API suite passes after fix verification: `./gradlew test --rerun-tasks`.
- 8.3 mapping documented for handoff: `publishDraftCompositionShared` → `COMPOSITION_SHARED`; `requestCompositionConfirmation` / `requestConfirmationForAssignees` → `CONFIRMATION_REQUEST`; availability opened → `AVAILABILITY_REQUEST`; team complete → `TEAM_CONFIRMED`. No web-push send, email queue, or cron reminder was added here.
- Material 3 self-check: Material slide toggles/divider/spinner used; styles rely on `var(--mat-sys-*)` / `color-mix`; mobile layout keeps 48dp toggle rows and French aria labels; member chrome unchanged. N/A: dialogs, bottom sheets, rail/navigation changes.

### File List

- `_bmad-output/implementation-artifacts/8-2-preferences-de-notification.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `apps/web/src/app/core/notifications/me-notification-preferences-api.service.ts`
- `apps/web/src/app/pages/account-placeholder/account-placeholder.html`
- `apps/web/src/app/pages/account-placeholder/account-placeholder.scss`
- `apps/web/src/app/pages/account-placeholder/account-placeholder.ts`
- `apps/web/src/app/shared/notification-preferences-section/notification-preferences-section.spec.ts`
- `apps/web/src/app/shared/notification-preferences-section/notification-preferences-section.ts`
- `services/api/openapi/notification-preferences.yaml`
- `services/api/src/main/kotlin/com/hatcast/api/config/SecurityConfig.kt`
- `services/api/src/main/kotlin/com/hatcast/api/notification/MeNotificationPreferencesController.kt`
- `services/api/src/main/kotlin/com/hatcast/api/notification/NotificationDispatcher.kt`
- `services/api/src/main/kotlin/com/hatcast/api/notification/NotificationIntent.kt`
- `services/api/src/main/kotlin/com/hatcast/api/notification/NotificationPreferenceEligibilityPort.kt`
- `services/api/src/main/kotlin/com/hatcast/api/notification/PushNotificationEligibilityPort.kt`
- `services/api/src/main/kotlin/com/hatcast/api/notification/UserNotificationPreferencesService.kt`
- `services/api/src/main/kotlin/com/hatcast/api/notification/dto/NotificationPreferencesDtos.kt`
- `services/api/src/main/kotlin/com/hatcast/api/user/UserEntity.kt`
- `services/api/src/main/resources/application-e2e.yml`
- `services/api/src/main/resources/application.yml`
- `services/api/src/main/resources/db/migration/V50__user_notification_preferences.sql`
- `services/api/src/test/kotlin/com/hatcast/api/notification/MeNotificationPreferencesIntegrationTest.kt`
- `services/api/src/test/kotlin/com/hatcast/api/notification/NotificationPreferenceEligibilityAdapterTest.kt`
- `services/api/src/test/kotlin/com/hatcast/api/user/UserMemberPreferencesMigrationTest.kt`
- `services/api/src/test/resources/application-test.yml`

### Change Log

- 2026-06-01 : Code review patches — debounce toggles, `group` in API DTO, PATCH 401 test, Vitest rollback.
- 2026-06-01 : Full API suite fixed and story moved to review.
- 2026-06-01 : Implemented notification preferences API/UI and tests; blocked from review by unrelated full API regression failures.
- 2026-06-01 : Story created (create-story 8.2) — post-MVP category preferences for FR30.

### Review Findings

- [x] [Review][Decision] Périmètre PR 8.2 vs 8.3 — 8.3 validée et commitée ; fichiers dispatcher communs ignorés pour la revue 8.2.

- [x] [Review][Patch] Pas de debounce sur les toggles — debounce 300 ms avec annulation du timer ; UI optimiste immédiate ; PATCH au commit.

- [x] [Review][Patch] Test PATCH 401 manquant — `patch notification preferences requires authentication` ajouté.

- [x] [Review][Patch] Test UI rollback échec PATCH — scénario Vitest `patchOk: false` + snackbar.

- [x] [Review][Patch] Catalogue rappels dupliqué côté front — champ `group` dans le DTO API et filtrage UI par `NOTIFICATIONS` / `AUTOMATIC_REMINDERS`.

- [x] [Review][Defer] `COMPOSITION_SHARED` sans mapping `NotificationIntent.toCategory()` — `NotificationIntent.kt` : aucun intent ne mappe vers cette catégorie ; cohérent avec le handoff 8.3 documenté, à traiter quand le dispatcher brouillon partagé sera câblé.

---

### Validation create-story

- [x] AC métier numérotés et sourcés (epics / FR)
- [x] Section **Material 3** remplie
- [x] Tasks référencent les numéros d’AC (y compris M3-x)
- [x] Liens vers fichiers code existants à réutiliser
- [x] `npm run test` / `./gradlew test` mentionnés
