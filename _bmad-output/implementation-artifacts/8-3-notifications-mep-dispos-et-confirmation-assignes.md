---
baseline_commit: a74e88ac6992d37c769fd989ce9729bfe8394333
---

# Story 8.3: MEP notifications — availability opened and confirmation for assignees

**Status:** review

**Story ID:** 8.3  
**Story key:** `8-3-notifications-mep-dispos-et-confirmation-assignes`  
**Epic:** 8 — Notifications (push, email, preferences)  
**PLAN:** [PLAN.md](../../PLAN.md) § Wave iso-V1 — **8.3** P0 MEP (after **3.21**)  
**SCP:** [sprint-change-proposal-2026-06-01-notifications-epic8-scope.md](../planning-artifacts/sprint-change-proposal-2026-06-01-notifications-epic8-scope.md) (narrow MEP) ; [sprint-change-proposal-2026-06-02-iso-v1-mep-scope.md](../planning-artifacts/sprint-change-proposal-2026-06-02-iso-v1-mep-scope.md)  
**Brainstorm:** [brainstorming-session-2026-06-01-notifications-epic8.md](../brainstorming/brainstorming-session-2026-06-01-notifications-epic8.md)  
**Depends:** Story **8.1** (done) ; Story **3.21** (done)  
**Blocks:** Stories **8.4** (orga ops dispatcher) ; **8.5** (member extensions)  
**Optional:** Story **8.2** (category prefs — dispatcher must default allow when absent)

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

---

## Story

As a **concerned roster member**,  
I want to **receive notifications** when **availability opens** for an event and when I am **asked to confirm** my assigned role after composition validation,  
so that **I do not miss a step** without having to open the app constantly (FR31 MEP).

---

## Acceptance Criteria

1. **Given** an organizer **opens availability** (`POST …/actions/open-availability`, Story **3.21**), **when** the transaction commits and `EventAvailabilityOpenedEvent` fires, **then** each **eligible** concerned roster member receives intent **`AVAILABILITY_OPENED`** on **push** (FR29 / **8.1**) and/or **email** (troupe policy below) ; **no** notification on draft create or idempotent re-open. [Source: epics 8.3 ; FR31 ; SCP §4.4]

2. **Given** composition **validate** (`POST …/composition/validate`, FR23), **when** the transition runs for the first time (`validatedAt` was null), **then** **only assigned** participants with a resolvable **user account** receive **`CONFIRMATION_REQUEST`** — not the full season roster. [Source: epics 8.3 ; PRD FR31 MEP]

3. **Given** a **locked** composition and a **new assignee** (gap-fill manual assign, draw assign after validate, decline-restore assign), **when** `requestConfirmationForAssignees` is invoked after commit, **then** **only** the listed assignee participant IDs receive **`CONFIRMATION_REQUEST`** (same intent, targeted audience). [Source: `CompositionSlotAssignmentService` ; `CompositionDrawService` ; `CompositionDeclineRestoreService`]

4. **Given** **draft composition shared** (`publishDraftCompositionShared` / `DraftCompositionSharedEvent`) or lifecycle transition to **team complete**, **when** 8.3 MEP ships, **then** **no** member push/email is sent (orga intents → **8.4** ; roster FYI → **8.5**). [Source: SCP §4.4 ; brainstorming]

5. **Given** channel eligibility, **when** dispatch runs, **then**:
   - **PUSH:** `PushNotificationEligibilityPort.isPushEnabled(userId)` (global 8.1) ; if **8.2** shipped, also `NotificationPreferenceEligibilityPort` for category `AVAILABILITY_REQUEST` / `CONFIRMATION_REQUEST` — if **8.2** absent, treat category as **allowed**.
   - **EMAIL:** recipient has non-blank `users.email` ; troupe policy **MEP default = enabled** for all troupes (no troupe-level flag in DB yet — document in Dev Agent Record if product adds later).
   - **Skip** participants without linked `user_id` (name-only roster rows) — no error, no retry storm.
   - Domain HTTP response **never fails** because a channel failed (**NFR-R2**). [Source: epics 8.3 ; architecture NFR-R2]

6. **Given** delivery is attempted, **when** push or email fails (invalid subscription, SMTP error, missing VAPID key), **then** the failure is **logged** (structured: intent, eventId, userId, channel, error class) and optionally persisted in an **outbox/delivery log** table ; the API transaction that triggered the intent is **unchanged**. [Source: NFR-R2 ; Story 8.1 AC6]

7. **Given** member inbox (`GET /v1/me/inbox`, Epic **17.21**), **when** a push/email is sent, **then** inbox rows are **not** created or updated as a side effect of send — inbox remains derived from **domain state** only (confirm/dispos actions). [Source: SCP §4.8 ; ADR intent model]

8. **Given** manual share/announce (`POST …/share-recipients/notify`, Story **6.10**), **when** 8.3 ships, **then** `requestManualAnnouncement` remains **separate** (no auto-send from 8.3) ; optional: reuse dispatcher for manual path in a follow-up — **out of MEP scope**. [Source: epics 8.3 Depends note]

9. **Given** implementation complete, **when** tests run, **then** integration tests prove: open-availability → `AVAILABILITY_OPENED` dispatch to roster-linked users with push enabled ; validate → assignees only ; draft publish → **no** member dispatch ; failed push does not roll back event ; `./gradlew test` green. [Source: project-context.md]

**Product coverage:** FR31 MEP subset ; NFR-R2 ; **not** FR31b (8.4), **not** FYI/reminders (8.5), **not** category UI (8.2 optional gating only).

---

## Acceptance Criteria — Material 3 (UI)

**UI : N/A** — no changes under `apps/web/` ; delivery is server-side + existing SW handler from Story **8.1** (`custom-sw.js`).

---

## Tasks / Subtasks

- [x] **Scope:** `services/api/` only — reference `legacy/` for V1 copy/payload parity ; do **not** port Firebase `pushQueue` / Cloud Functions.

- [x] **Intent model & dispatcher** (AC: 1–6, 9)
  - [x] Kotlin `NotificationIntent` enum: at minimum `AVAILABILITY_OPENED`, `CONFIRMATION_REQUEST` (extensible for 8.4/8.5).
  - [x] `NotificationDispatcher` (or `WorkflowNotificationService`) — single entry `dispatch(intent, context)` after eligibility.
  - [x] `NotificationDeliveryPort` with adapters: `WebPushNotificationSender` (library e.g. `nl.martijndwars:web-push`), `EmailNotificationSender` (Spring Mail or outbox + worker — pick one, document).
  - [x] Replace `NoOpEventNotificationAdapter` / `NoOpCompositionNotificationAdapter` with real adapter(s) delegating to dispatcher — **keep** `@TransactionalEventListener(AFTER_COMMIT)` listeners unchanged ([`EventNotificationEventListener.kt`](../../services/api/src/main/kotlin/com/hatcast/api/event/EventNotificationEventListener.kt), [`CompositionNotificationEventListener.kt`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionNotificationEventListener.kt)).
  - [x] **Do not** call dispatcher inside `@Transactional` service methods — only from listeners / post-commit hooks (pattern **6-13**).

- [x] **Audience resolution** (AC: 1–3, 5)
  - [x] `AVAILABILITY_OPENED`: reuse roster rules aligned with [`EventRosterService.buildRoster`](../../services/api/src/main/kotlin/com/hatcast/api/participant/EventRosterService.kt) (active season participants minus event exclusions + event-only participants) ; map `participantId` → `user_id` via season/event participant entities.
  - [x] `CONFIRMATION_REQUEST`: resolve assignees from composition slots (`assignedParticipantId`, `PENDING` after validate) ; honor `requestConfirmationForAssignees(assigneeParticipantIds)` list when provided.
  - [x] **Refactor** `validateComposition`: today calls `requestCompositionConfirmation` without assignee list ([`CompositionService.kt` L174](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionService.kt)) — implementation **must** resolve assignee participant IDs at validate time (not broadcast to season roster).

- [x] **Payloads & deep links** (AC: 1–3, 5)
  - [x] Build canonical member URLs like inbox: `/saison/{seasonSlug}/event/{eventSlug}?tab=dispos` (availability) and `?showConfirm=true` (confirmation) — mirror [`MeInboxDtos.kt`](../../services/api/src/main/kotlin/com/hatcast/api/inbox/dto/MeInboxDtos.kt).
  - [x] Push JSON: `{ title, body, url }` consumed by [`custom-sw.js`](../../apps/web/src/custom-sw.js).
  - [x] French titles/bodies — align V1 [`notificationTemplates.js`](../../legacy/src/services/notificationTemplates.js) (`availability_request`, selection confirm) ; event title + formatted date from `EventEntity`.

- [x] **Persistence & observability** (AC: 6)
  - [x] Flyway `V46__notification_delivery_log.sql` (or next free): append-only log (`intent`, `user_id`, `channel`, `status`, `error`, `created_at`, optional `event_id`) **or** outbox queue table if using async worker.
  - [x] Config: `hatcast.web-push.vapid-private-key` already in [`application.yml`](../../services/api/src/main/resources/application.yml) — wire sender ; document SMTP env vars in `.env.example` if adding email.

- [x] **Eligibility integration** (AC: 5)
  - [x] Inject `PushNotificationEligibilityPort` ([`PushNotificationEligibilityPort.kt`](../../services/api/src/main/kotlin/com/hatcast/api/notification/PushNotificationEligibilityPort.kt)).
  - [x] If `NotificationPreferenceEligibilityPort` exists (Story **8.2**), call it ; else inline **default true** for categories `AVAILABILITY_REQUEST` / `CONFIRMATION_REQUEST`.

- [x] **Explicit non-delivery guards** (AC: 4, 8)
  - [x] `publishDraftCompositionShared` → DEBUG log only / no member dispatch.
  - [x] `requestManualAnnouncement` → unchanged stub or separate manual pipeline (6.10).

- [x] **Tests** (AC: 9)
  - [x] `EventOpenAvailabilityNotificationIntegrationTest` — mock/spy dispatcher: open availability → N roster users with accounts notified ; draft create → never ; second open idempotent → no duplicate sends (guard in dispatcher or listener).
  - [x] `CompositionValidateNotificationIntegrationTest` — validate with 2 assignees + 10 roster → exactly 2 `CONFIRMATION_REQUEST` ; `publishDraftCompositionShared` after commit → 0 member sends.
  - [x] Unit test: push failure in sender → dispatcher catches, logs, no exception to caller.
  - [ ] Optional: `@MockBean WebPushNotificationSender` assert payload `url` matches slug route.

---

## Dev Notes

### MEP scope boundary (normative)

| In 8.3 MEP | Out of 8.3 (do not implement) |
|------------|-------------------------------|
| Unified dispatcher + push send + email send (minimal) | Organizer ops intents (**8.4** / FR31b) |
| `AVAILABILITY_OPENED` on `open-availability` | Draft compo member notify |
| `CONFIRMATION_REQUEST` on validate + targeted assignee hooks | `TEAM_VALIDATED_FYI` roster (**8.5**) |
| Eligibility: 8.1 push + email address + default troupe email on | J-7/J-1 reminders, removal, re-confirm (**8.5**) |
| NFR-R2 log on failure | Category prefs UI (**8.2**) — only consume port if present |
| After-commit delivery only | Migrating V1 Firestore tokens |
| | Rich SW actions (confirm/decline buttons in notification) |
| | `pushQueue` Firestore pattern |

### Critical code state today (must read before coding)

| Hook | Current behavior | 8.3 change |
|------|------------------|------------|
| [`EventNotificationPort.publishAvailabilityOpened`](../../services/api/src/main/kotlin/com/hatcast/api/event/EventNotificationPort.kt) | `NoOpEventNotificationAdapter` DEBUG log | Real dispatch `AVAILABILITY_OPENED` |
| [`CompositionNotificationPort.requestCompositionConfirmation`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionNotificationPort.kt) | No-op | Dispatch `CONFIRMATION_REQUEST` to **assignees only** |
| `requestConfirmationForAssignees` | No-op | Same intent, **explicit** participant ID list |
| `publishDraftCompositionShared` | No-op (6-13 after-commit) | **Remain no-op** for member channels (8.4) |
| [`ShareRecipientsService.notifyRecipients`](../../services/api/src/main/kotlin/com/hatcast/api/share/ShareRecipientsService.kt) | Manual stub | Unchanged in MEP |

**Audience reference (share module):** `ShareRecipientIntent.EVENT` uses **season active participants** ([`resolveSeasonParticipantIds`](../../services/api/src/main/kotlin/com/hatcast/api/share/ShareRecipientsService.kt)) — use the same **concerned roster** definition as event roster (includes event-level participants, respects exclusions), not “all troupe members”.

### V1 parity reference (copy & triggers only)

| V1 reason | V2 intent | V1 prefs (→ 8.2 category) |
|-----------|-----------|---------------------------|
| `availability_request` / `new_event` | `AVAILABILITY_OPENED` | `notifyAvailability` / `notifyAvailabilityPush` |
| selection confirm | `CONFIRMATION_REQUEST` | `notifySelection` / `notifySelectionPush` |

V1 sends availability email via [`queueAvailabilityEmail`](../../legacy/src/services/emailService.js) with HTML template ; push mirrored in [`notificationsService.js`](../../legacy/src/services/notificationsService.js). V2 has **no** Spring Mail dependency yet ([`build.gradle.kts`](../../services/api/build.gradle.kts)) — add minimal SMTP integration or outbox + documented worker for MEP.

### Architecture compliance

- **NFR-R2** ([architecture.md](../planning-artifacts/architecture.md)): notification delivery **out of band** after commit ; never block domain transactions.
- **Inbox ≠ notification log** (SCP §4.8, brainstorming): do not write inbox rows on send.
- **Stable event URLs** (architecture cross-deps): deep links must use season + event slugs from DB.
- **ADR-0006** (V1 Firestore queue): do **not** recreate `pushQueue` in Postgres for MEP unless team chooses outbox — prefer direct send + delivery log for simplicity.

### Email troupe policy (MEP decision)

No `troupes.email_notifications_enabled` column exists today. **MEP:** send email when user has email + category allows (default allow). Document assumption in Dev Agent Record ; troupe-level policy can be a small follow-up migration if PO requires opt-out per troupe.

### Web Push technical notes

- Add server dependency (e.g. `implementation("nl.martijndwars:web-push:5.1.1")`) — use VAPID keys from env (`HATCAST_WEB_PUSH_VAPID_PUBLIC_KEY` / `HATCAST_WEB_PUSH_VAPID_PRIVATE_KEY`).
- Send to **all** active `user_push_subscriptions` for each `user_id` (multi-device).
- Payload must match [`custom-sw.js`](../../apps/web/src/custom-sw.js) (`title`, `body`, `url`).
- If VAPID private key empty in dev: skip push with WARN log (same as missing SMTP).

### Composition validate vs assignee list (implementation pitfall)

```kotlin
// CompositionService.kt L174 — today (too broad for FR31 MEP)
notificationPort.requestCompositionConfirmation(eventId, seasonId, principal.userId)
```

Implementation options (pick one, document in Dev Agent Record):

1. Change port method to accept `assigneeParticipantIds: List<UUID>` and pass slot assignees at validate time ; or  
2. Keep signature ; adapter loads assignees from `EventCompositionSlotRepository` when handling `requestCompositionConfirmation`.

**Must not** notify entire season roster on validate (regression vs epics AC).

### Idempotency

| Trigger | Guard |
|---------|--------|
| `open-availability` | `EventService` already idempotent when `availabilityOpenedAt != null` — listener should not fire duplicate event (verify: no second `EventAvailabilityOpenedEvent` on re-open). |
| `validate` | Only when `!alreadyValidated` (existing branch). |
| Gap-fill assign | One notification per `requestConfirmationForAssignees` call — acceptable ; optional dedupe window out of MEP. |

### Dependencies

| Story / item | Status | Relationship |
|--------------|--------|--------------|
| **8.1** | done | Push subscriptions + `PushNotificationEligibilityPort` |
| **3.21** | done | `EventAvailabilityOpenedEvent` + draft gate |
| **6-13** | done | After-commit pattern for composition events |
| **8.2** | ready-for-dev | Optional category gating — default allow if missing |
| **8.4** | backlog | Extends same dispatcher for orga intents |
| **8.5** | backlog | Extends dispatcher for FYI/reminders |

### Explicit non-goals

- Implementing **8.2** UI or migration for category prefs (only read port if merged).
- Organizer auto-notifs (draft created, SLA, incomplete compo cadence).
- Scheduled cron reminders (J-7/J-1).
- Analytics FR47 notification click tracking (optional log field later).
- Changing **6.10** ShareAnnounceDialog or manual notify API behavior.
- Frontend changes (no new `/compte` section).

### Previous story intelligence

**8.1 (done):**

- Per-device opt-in ; `users.push_notifications_enabled` true while ≥1 subscription.
- `custom-sw.js` + VAPID public via `/v1/config/public`.
- **No send path** was implemented — 8.3 adds first real send.
- Review lesson: sync browser permission revocation (client) — server-side send still checks subscription rows.

**8.2 (ready-for-dev, not blocking):**

- Categories `AVAILABILITY_REQUEST` and `CONFIRMATION_REQUEST` map to MEP intents.
- Dispatcher **must default allow** when 8.2 not deployed ([8-2 story AC6](../../_bmad-output/implementation-artifacts/8-2-preferences-de-notification.md)).

**3.21 (done):**

- `NoOpEventNotificationAdapter` wired ; 8.3 replaces with real adapter.
- Open availability only when `availabilityOpenedAt` was null.

**6-13 (done):**

- `DraftCompositionSharedEvent` → port after commit ; 8.3 **must not** send member notifications on this hook.

### Git intelligence

Recent relevant commits:

- `2615f647` `feat(events): Gate spectacles with draft publish flow` — `EventNotificationPort` + listener (3.21).
- `54368867` `feat(push): Add browser opt-in` — subscriptions, eligibility port (8.1).
- `b31f01b7` `feat(composition): Add share and announce modal (6.10)` — manual notify stub.

Follow conventions: Kotlin service + Flyway, integration tests with `@MockBean` on dispatcher/senders, Conventional Commit on merge.

### Project context reference

- Tests: `./gradlew test` ([project-context.md](../../project-context.md)).
- V1 ops: [PUSH_NOTIFICATIONS_SUMMARY.md](../../docs/v1/technical/PUSH_NOTIFICATIONS_SUMMARY.md).
- UX draft/publish (context only): [ux-event-draft-publish-3-21.md](../planning-artifacts/ux-event-draft-publish-3-21.md).

### Suggested package layout

```
com.hatcast.api.notification
  NotificationIntent.kt
  NotificationDispatcher.kt
  NotificationRecipientResolver.kt
  WebPushNotificationSender.kt
  EmailNotificationSender.kt
  NotificationDeliveryLogEntity.kt
  WorkflowNotificationAdapter.kt  // implements EventNotificationPort + CompositionNotificationPort
```

Consolidating both ports into one adapter reduces duplicate eligibility logic.

### Local dev — recette email (Mailpit)

**Décision (2026-06-01)** : recette email locale via **Mailpit** intégrée à [`scripts/start-dev.sh`](../../scripts/start-dev.sh), pas Ethereal ni envoi Gmail depuis le poste.

| Levier | Comportement |
|--------|--------------|
| `HATCAST_NOTIFICATION_EMAIL_ENABLED=true` | `start-dev.sh` démarre Mailpit (Docker `hatcast-mailpit`), force `SPRING_MAIL_HOST=127.0.0.1:1025`, attend SMTP, arrête Mailpit à la fin |
| `HATCAST_NOTIFICATION_EMAIL_ENABLED=false` | Pas de Mailpit |
| UI | http://127.0.0.1:8025 |
| Preuve API | `notification_delivery_log` (`EMAIL`, `SENT`) |
| Profil `dev` | `management.health.mail.enabled=false` — pas de health check SMTP bruyant |

**Push** : recette manuelle navigateur (VAPID + opt-in 8.1) ; non couverte par Mailpit.

**Cloud / staging** : secrets GitHub `SPRING_MAIL_*` (Gmail) — voir [DEPLOY_V2_CLOUD_RUN.md](../../docs/v2/technical/DEPLOY_V2_CLOUD_RUN.md).

---

## Dev Agent Record

### Agent Model Used

Composer (Cursor agent)

### Completion Notes List

- Implemented `NotificationDispatcher` with push (`nl.martijndwars:web-push`) + optional email (Spring Mail, `HATCAST_NOTIFICATION_EMAIL_ENABLED=false` by default).
- Split port adapters: `EventWorkflowNotificationAdapter` + `CompositionWorkflowNotificationAdapter` (avoids `@MockBean CompositionNotificationPort` removing the event adapter in tests).
- Validate confirmation audience: option 2 — adapter resolves assignees from `EventCompositionSlotRepository` when no explicit participant list (no `CompositionService` signature change).
- Email troupe policy MEP: send when user has email + category allowed ; no per-troupe opt-out column yet.
- Push/email failures logged + persisted in `notification_delivery_log` (Flyway V46) ; dispatcher never throws to caller (NFR-R2).
- `NotificationPreferenceEligibilityPort` interface added ; defaults allow when no 8.2 bean.
- Tests: `com.hatcast.api.notification.*` all green ; full suite baseline had 42 pre-existing failures (draft availability gate in several composition tests) — unchanged regression surface.
- Local email recette: `start-dev.sh` + Mailpit Docker when `HATCAST_NOTIFICATION_EMAIL_ENABLED=true` ; SMTP local forcé ; profil `dev` désactive mail health indicator.

### File List

- `services/api/build.gradle.kts`
- `services/api/src/main/resources/application.yml`
- `services/api/src/main/resources/db/migration/V46__notification_delivery_log.sql`
- `services/api/src/main/kotlin/com/hatcast/api/event/EventNotificationPort.kt`
- `services/api/src/main/kotlin/com/hatcast/api/composition/CompositionNotificationPort.kt`
- `services/api/src/main/kotlin/com/hatcast/api/notification/NotificationIntent.kt`
- `services/api/src/main/kotlin/com/hatcast/api/notification/NotificationDispatchContext.kt`
- `services/api/src/main/kotlin/com/hatcast/api/notification/NotificationDeliveryLogEntity.kt`
- `services/api/src/main/kotlin/com/hatcast/api/notification/NotificationDeliveryLogRepository.kt`
- `services/api/src/main/kotlin/com/hatcast/api/notification/NotificationPreferenceEligibilityPort.kt`
- `services/api/src/main/kotlin/com/hatcast/api/notification/NotificationPayloadBuilder.kt`
- `services/api/src/main/kotlin/com/hatcast/api/notification/NotificationRecipientResolver.kt`
- `services/api/src/main/kotlin/com/hatcast/api/notification/NotificationProperties.kt`
- `services/api/src/main/kotlin/com/hatcast/api/notification/NotificationDeliveryPort.kt`
- `services/api/src/main/kotlin/com/hatcast/api/notification/WebPushNotificationSender.kt`
- `services/api/src/main/kotlin/com/hatcast/api/notification/EmailNotificationSender.kt`
- `services/api/src/main/kotlin/com/hatcast/api/notification/NotificationDispatcher.kt`
- `services/api/src/main/kotlin/com/hatcast/api/notification/EventWorkflowNotificationAdapter.kt`
- `services/api/src/main/kotlin/com/hatcast/api/notification/CompositionWorkflowNotificationAdapter.kt`
- `services/api/src/main/kotlin/com/hatcast/api/notification/NotificationConfiguration.kt`
- `services/api/src/test/kotlin/com/hatcast/api/notification/EventOpenAvailabilityNotificationIntegrationTest.kt`
- `services/api/src/test/kotlin/com/hatcast/api/notification/CompositionValidateNotificationIntegrationTest.kt`
- `services/api/src/test/kotlin/com/hatcast/api/notification/NotificationDispatcherTest.kt`
- `services/api/src/test/kotlin/com/hatcast/api/notification/NotificationRecipientResolverTest.kt`
- `.env.example`
- `scripts/start-dev.sh`
- `services/api/src/main/resources/application-dev.yml`
- `DEVELOPMENT.md`
- `services/api/README.md`
- `scripts/README.md`
- `docs/v2/technical/DEPLOY_V2_CLOUD_RUN.md`
- `project-context.md`
- `.cursor/rules/dev-server.mdc`

### Change Log

- 2026-06-01 : Story created (`bmad-create-story 8.3`) — narrow MEP per SCP 2026-06-01 ; depends 3.21 + 8.1.
- 2026-06-01 : Implementation complete — dispatcher, push/email send, delivery log, integration + unit tests.
- 2026-06-01 : Local dev Mailpit — `start-dev.sh` lifecycle (start/stop), SMTP override, docs BMad + DEVELOPMENT.

---

### Validation create-story

- [x] AC métier numérotés et sourcés (epics / FR / SCP)
- [x] Section **Material 3** = **UI : N/A**
- [x] Tasks référencent AC ; liens fichiers code existants
- [x] `./gradlew test` mentionné
- [x] MEP in/out scope table ; pitfall `requestCompositionConfirmation` documented
- [x] Inbox ≠ send log ; after-commit only
