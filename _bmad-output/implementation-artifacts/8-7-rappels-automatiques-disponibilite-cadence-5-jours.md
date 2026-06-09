---
baseline_commit: 42fcae36
---

# Story 8.7: Automatic availability pending reminders (5-day cadence)

**Status:** done

**Story ID:** 8.7  
**Story key:** `8-7-rappels-automatiques-disponibilite-cadence-5-jours`  
**Epic:** 8 — Notifications (push, email, preferences)  
**PLAN:** [PLAN.md](../../PLAN.md) § Wave iso-V1 — gap after **8.2** / **8.5** (category exists, scheduler missing)  
**Depends:** Story **8.2** (category `AVAILABILITY_WEEKLY_REMINDER`) ; Story **8.3** (dispatcher) ; Story **8.5** (scheduler + `notification_reminder_marks` pattern) ; Story **3.21** (published events / `availabilityOpenedAt`)  
**Related:** Story **6.10b** (manual nudge — distinct intent) ; Story **8.4** (organizer ops — out of scope)

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

---

## Story

As a **HatCast member**,  
I want **automatic reminders when I have not indicated my availability for an upcoming published event**,  
so that **I can respond in time**, while **honouring my opt-out preference** and **avoiding daily spam** (cadence: **every 5 civil days** per event).

---

## Acceptance Criteria

1. **Given** a **published** event (`availabilityOpenedAt != null`), composition **not yet validated** (`EventCompositionEntity.validatedAt IS NULL`), event **not archived**, and `startsAt` in the **reminder horizon** (from **tomorrow** through **+21 civil days** inclusive in `EventService.AGENDA_ZONE` / `Europe/Paris`), **when** the daily scheduler runs, **then** each **linked roster member** with availability status **`unknown`** (same rules as [`NotificationRecipientResolver.resolveUnknownAvailabilityRecipients`](../../services/api/src/main/kotlin/com/hatcast/api/notification/NotificationRecipientResolver.kt)) is a candidate for **`AVAILABILITY_PENDING_REMINDER`**. [Source: V1 `processAvailabilityReminders` ; SPEC availability audience unknown-only ; story **6.10b**]

2. **Given** a candidate member, **when** evaluating cadence, **then** send **at most once every 5 civil days** per `(user, event)`:
   - **First send:** as soon as the member becomes eligible (enters horizon with `unknown` dispo) — no artificial J-7 delay.
   - **Subsequent sends:** only if the **latest** `notification_reminder_marks` row for `(AVAILABILITY_PENDING_REMINDER, event_id, user_id)` has `sent_at` **≥ 5 civil days** before the reference date (Paris civil day boundaries via `AgendaTimeBoundary`).
   - **Same civil day:** idempotent — repeated scheduler runs or Cloud Run instances must not duplicate sends (claim mark before dispatch). [Source: story **8.5** AC9 ; PO decision 2026-06-07 — 5 days not daily]

3. **Given** any of: member responded (`available` / `unavailable`), event still **draft** (`availabilityOpenedAt == null`), composition **validated** (`validatedAt != null`), event **archived**, event **in the past** or **beyond +21 days**, participant **without linked `user_id`**, participant **`REMOVED`** / inactive membership (reuse guards from **8.5b**), **when** the scheduler runs, **then** **no** automatic availability pending reminder is sent. [Source: story **8.5b** ; V1 skip confirmed cast]

4. **Given** channel eligibility, **when** `AVAILABILITY_PENDING_REMINDER` dispatches, **then** category gating uses **`AVAILABILITY_WEEKLY_REMINDER`** (stable enum key — **do not rename** JSON key) with push/email per Story **8.2**:
   - Push: global/device eligibility (**8.1**) **AND** `AVAILABILITY_WEEKLY_REMINDER.push === true`
   - Email: `AVAILABILITY_WEEKLY_REMINDER.email === true`
   - Missing preference row → allowed (opt-out model). [Source: story **8.2** AC6 ; FR30]

5. **Given** the category French label in [`NotificationCategory`](../../services/api/src/main/kotlin/com/hatcast/api/notification/NotificationIntent.kt), **when** `GET /v1/me/notification-preferences` returns categories, **then** the label reads **« Rappels tous les 5 jours si je n'ai pas indiqué mes disponibilités »** (replaces obsolete « hebdomadaires » copy). OpenAPI fragment label aligned. [Source: PO 2026-06-07]

6. **Given** dispatch, **when** payload is built, **then** use intent **`AVAILABILITY_PENDING_REMINDER`** with copy aligned to manual nudge (⏰ tone, dispos deep link):
   - Title: **« ⏰ Rappel disponibilité »**
   - Body (default): **« N'oublie pas de répondre pour {eventTitle} le {eventDate} ! »**
   - URL: `/saison/{seasonSlug}/event/{eventSlug}?tab=dispos`
   - **Distinct** from `MANUAL_AVAILABILITY_NUDGE` (orga-triggered, category `AVAILABILITY_REQUEST`). [Source: `NotificationPayloadBuilder` MANUAL_AVAILABILITY_NUDGE]

7. **Given** delivery, **when** push/email fails or channel skipped, **then** domain scheduler is not rolled back; outcomes logged per **NFR-R2** (same isolation as **8.5**). Inbox (`GET /v1/me/inbox`) unchanged. [Source: story **8.5** AC7–8]

8. **Given** implementation complete, **when** tests run, **then** unit tests on the new job cover: eligible unknown → sends once; 5-day cadence respected; prefs opt-out skips channel; validated composition skipped; `./gradlew :services:api:test` green ; `npm run test -w @hatcast/web -- --watch=false` green if label/OpenAPI touched. [Source: project-context.md]

**Product coverage:** FR30 category gating ; FR31 automatic member reminder (V1 parity, cadence amended) ; NFR-R2.  
**Out of scope:** grouped multi-event email (V1 had batch — defer), organizer ops (**8.4**), changing `AVAILABILITY_WEEKLY_REMINDER` enum key, Cloud Scheduler external trigger (document risk only), manual nudge (**6.10b**).

---

## Acceptance Criteria — Material 3 (UI)

**M3-1. Label parity** — **Given** `/compte` notification preferences (Story **8.2**), **when** categories load from API, **then** the automatic-reminder row shows the updated French label from AC5 — no hard-coded stale « hebdomadaires » string in web. [Source: `notification-preferences-section.ts` server-driven labels]

**M3-2–4.** N/A — no new controls or navigation chrome.

**M3-5. Review** — **Given** impl done, **when** validating, **then** confirm preferences section still uses `mat-slide-toggle` and server labels only. [Source: FRONTEND_UI.md]

---

## Tasks / Subtasks

- [x] **Scope:** `services/api/` primary ; `apps/web/` only if a stale label fallback exists ; OpenAPI fragment update.

- [x] **Intent & category mapping** (AC: 4, 6)
  - [x] Add `AVAILABILITY_PENDING_REMINDER` to [`NotificationIntent.kt`](../../services/api/src/main/kotlin/com/hatcast/api/notification/NotificationIntent.kt).
  - [x] Map in `toCategory()` → `NotificationCategory.AVAILABILITY_WEEKLY_REMINDER`.
  - [x] Update category label string (AC5).

- [x] **Periodic dedupe schema** (AC: 2, 7)
  - [x] Flyway migration (next free version): add nullable `reminder_civil_date DATE` to `notification_reminder_marks`.
  - [x] Partial unique index: `(intent, event_id, user_id, reminder_civil_date) WHERE reminder_civil_date IS NOT NULL` for periodic intents.
  - [x] Keep existing `(intent, event_id, user_id, reminder_window)` unique path for J-7/J-1 (`reminder_civil_date IS NULL`) — do not break **8.5**.
  - [x] Extend [`NotificationReminderMarkService`](../../services/api/src/main/kotlin/com/hatcast/api/notification/NotificationReminderMarkService.kt):
    - `tryClaimPeriodicReminderMark(intent, eventId, userId, civilDate): Boolean`
    - `findLatestSentAt(intent, eventId, userId): Instant?` for 5-day cadence check.

- [x] **Event query** (AC: 1, 3)
  - [x] Add `EventRepository` method e.g. `findPublishedEventsCollectingAvailability(fromInclusive, toInclusive)`:
    - `availabilityOpenedAt IS NOT NULL`
    - `archived = false`
    - `startsAt` in horizon
    - `EventCompositionEntity.validatedAt IS NULL` (join composition)
    - FETCH JOIN season + troupe (same lazy-init lesson as **8.5**)
  - [x] **Do not reuse** `findValidatedOpenEventsStartingFrom` — that requires `validatedAt IS NOT NULL` (assignee J-7/J-1 only).

- [x] **Scheduler job** (AC: 1–3, 7)
  - [x] New `AvailabilityPendingReminderJob` in `com.hatcast.api.notification` mirroring [`AssigneePresenceReminderJob`](../../services/api/src/main/kotlin/com/hatcast/api/notification/AssigneePresenceReminderJob.kt):
    - `@Scheduled(cron = "${hatcast.notification.availability-pending-reminder-cron:0 0 9 * * *}", zone = "Europe/Paris")`
    - `@Transactional` + dispatch in `afterCommit` via `TransactionSynchronizationManager`
    - `processRemindersAt(reference: Instant): Int` test entry point
  - [x] Reuse [`NotificationRecipientResolver.resolveUnknownAvailabilityRecipients`](../../services/api/src/main/kotlin/com/hatcast/api/notification/NotificationRecipientResolver.kt).
  - [x] Reuse **8.5b** eligibility: skip inactive membership / removed participants (extract shared helper or duplicate minimal guard — prefer small shared `NotificationReminderEligibility` if duplication exceeds ~15 lines).

- [x] **Dispatcher & payload** (AC: 4, 6)
  - [x] Route `AVAILABILITY_PENDING_REMINDER` in [`NotificationDispatcher`](../../services/api/src/main/kotlin/com/hatcast/api/notification/NotificationDispatcher.kt) (recipient list from context).
  - [x] Add payload branch in [`NotificationPayloadBuilder`](../../services/api/src/main/kotlin/com/hatcast/api/notification/NotificationPayloadBuilder.kt).
  - [x] Email subject aligned with push title.

- [x] **Config** (AC: 2)
  - [x] Document in [`application.yml`](../../services/api/src/main/resources/application.yml): `hatcast.notification.availability-pending-reminder-cron`, optional `availability-pending-horizon-days: 21`, `availability-pending-cadence-days: 5`.

- [x] **Tests** (AC: 8)
  - [x] `AvailabilityPendingReminderJobTest` — mirror structure of [`AssigneePresenceReminderJobTest`](../../services/api/src/test/kotlin/com/hatcast/api/notification/AssigneePresenceReminderJobTest.kt).
  - [x] Extend `NotificationDispatcherTest` — category mapping `AVAILABILITY_WEEKLY_REMINDER`.
  - [x] Optional integration: prefs opt-out → `SKIPPED` in delivery log.

- [x] **OpenAPI** — update [`notification-preferences.yaml`](../../services/api/openapi/notification-preferences.yaml) example label if documented.

### Review Findings

- [x] [Review][Decision] Cadence avancée malgré opt-out total push+email — **Résolu : B** (comportement accepté, aligné story 8.5 — marque = traitement du run, pas livraison effective).

- [x] [Review][Patch] Événements publiés sans ligne `event_compositions` exclus du scheduler [`EventRepository.kt:215-227`] — corrigé : `LEFT JOIN` + `(c IS NULL OR c.validatedAt IS NULL)`.

- [x] [Review][Patch] Tests AC8 manquants — ajout `EventRepositoryAvailabilityPendingReminderTest` (sans composition, brouillon, validée) + opt-out push/email dans `NotificationDispatcherTest`.

- [x] [Review][Defer] Marque consommée si dispatch échoue après claim [`AvailabilityPendingReminderJob.kt:78-96`] — deferred, pre-existing (même pattern que `AssigneePresenceReminderJob` / story 8.5).

- [x] [Review][Defer] Course recipient répond entre claim et `afterCommit` dispatch — deferred, pre-existing (fenêtre étroite, pas de re-resolve au dispatch).

- [x] [Review][Defer] Suite Gradle non entièrement verte (793/796) — deferred, pre-existing (échecs hors périmètre 8.7 documentés dans Dev Agent Record).

- [x] [Review][Defer] `@Scheduled` Cloud Run scale-to-zero — deferred, pre-existing (documenté dans Dev Notes, même limitation que 8.5).

---

## Dev Notes

### Scope boundary

| In 8.7 | Out of 8.7 |
|--------|------------|
| Auto scheduler for unknown dispo on unpublished-validated events | Manual orga nudge (**6.10b**) |
| Honor `AVAILABILITY_WEEKLY_REMINDER` prefs | Rename enum key / migrate stored prefs |
| 5-day cadence (PO 2026-06-07) | Daily or V1 7-day weekly cadence |
| Single-event dispatch (one notif per user/event/run) | V1 grouped multi-event email batch |
| Label copy update (server-driven) | New `/compte` UI section |

### V1 reference (legacy — do not port blindly)

[`functions/index.js`](../../functions/index.js) `processAvailabilityReminders`:
- Horizon J+1..J+21, skip validated cast, unknown dispo only.
- Cadence: J-7 then every **7** days — **superseded by 5-day rule** in V2.
- No Firestore queue — daily scan. V2 follows same scan model, not `reminderQueue`.

### Architecture pattern (copy from 8.5)

```text
@Scheduled (09:00 Paris)
  → AvailabilityPendingReminderJob.buildDispatchContexts(reference)
  → for each (event, unknown linked recipient):
       if cadence elapsed (5 civil days since last mark)
       if tryClaimPeriodicReminderMark(..., civilDate=today Paris)
       → NotificationDispatchContext(AVAILABILITY_PENDING_REMINDER)
  → afterCommit → NotificationDispatcher.dispatch(each)
  → preference check inside dispatcher → AVAILABILITY_WEEKLY_REMINDER
```

### Critical: event selection vs assignee reminders

| Job | Composition state | Query |
|-----|-------------------|-------|
| `AssigneePresenceReminderJob` (**8.5**) | **Validated** (`validatedAt NOT NULL`) | `findValidatedOpenEventsStartingFrom` |
| `AvailabilityPendingReminderJob` (**8.7**) | **Not validated** (`validatedAt IS NULL`) | **New** query |

Sending availability pending reminders after validate would spam members during confirmation phase — **forbidden**.

### Periodic dedupe design

J-7/J-1 uses enum `reminder_window` (`DAYS_7` / `DAYS_1`) with one mark per window **ever**.

Periodic availability reminders need **many marks over time**. Options considered:

1. ~~Reuse `ONCE`~~ — blocks resend.
2. **Chosen:** `reminder_civil_date` column + partial unique index ; cadence gate via `latest sent_at + 5 civil days`.

Claim flow per candidate per run:

```kotlin
if (!cadenceElapsed(lastSent, reference, cadenceDays = 5)) return
if (!markService.tryClaimPeriodicReminderMark(intent, eventId, userId, civilDate)) return
// dispatch
```

### Scheduling on Cloud Run (document, do not fix in 8.7 unless trivial)

`@Scheduled` is in-process (**8.5** same limitation). If API scaled to zero at 09:00, run may be missed — no catch-up queue. Note in Dev Agent Record if observed; external Cloud Scheduler → internal endpoint is a follow-up ops story.

### Previous story intelligence (8.5 / 8.5b)

- FETCH JOIN season/troupe on event query — prevents `LazyInitializationException`.
- Dispatch **afterCommit** — do not call FCM/SMTP inside DB transaction.
- **8.5b:** skip `INACTIVE` membership / `REMOVED` participant — apply same rules.
- `actorUserId` in reminder contexts — cosmetic; not required for payload.

### Files likely touched

| File | Action |
|------|--------|
| `AvailabilityPendingReminderJob.kt` | **NEW** |
| `AvailabilityPendingReminderJobTest.kt` | **NEW** |
| `NotificationIntent.kt` | intent + label + `toCategory()` |
| `NotificationReminderMarkEntity.kt` | optional `reminderCivilDate` |
| `NotificationReminderMarkService.kt` | periodic claim + latest query |
| `NotificationReminderMarkRepository.kt` | queries |
| `V52__*.sql` (or next) | schema |
| `EventRepository.kt` | new query |
| `NotificationPayloadBuilder.kt` | payload |
| `NotificationDispatcher.kt` | route intent |
| `application.yml` | cron + cadence props |
| `notification-preferences.yaml` | label doc |

### Explicit non-goals

- Changing V1 Firebase functions cadence.
- Grouping multiple events into one email (V1 behaviour).
- `TEAM_VALIDATED_FYI` / assignee presence reminders (already **8.5**).

---

## Dependencies

| Story | Status | Relationship |
|-------|--------|--------------|
| **8.2** | done | Category + prefs UI |
| **8.3** | done | Dispatcher pipeline |
| **8.5** | done | Scheduler pattern + marks table |
| **8.5b** | done | Eligibility guards |
| **6.10b** | done | Manual nudge — do not conflate intents |
| **3.21** | done | `availabilityOpenedAt` publish gate |

---

## Dev Agent Record

### Agent Model Used

claude-4.6-sonnet-medium-thinking (Cursor)

### Completion Notes List

- Implemented `AvailabilityPendingReminderJob` — daily 09:00 Europe/Paris, horizon J+1..J+21, 5-day civil cadence, afterCommit dispatch pattern from 8.5.
- New intent `AVAILABILITY_PENDING_REMINDER` gated by category `AVAILABILITY_WEEKLY_REMINDER`; label updated to « Rappels tous les 5 jours… » (server-driven, no web hard-code).
- V61 migration: `reminder_civil_date` with sentinel `1970-01-01` for legacy window marks + composite unique index `(intent, event_id, user_id, reminder_window, reminder_civil_date)` — chosen over partial indexes for H2/PostgreSQL test parity (same dedupe semantics).
- 8.5b eligibility: roster built via `EventRosterService` already filters ACTIVE participants / active memberships — no extra helper needed.
- Cloud Run `@Scheduled` limitation documented (same as 8.5): no catch-up if instance scaled to zero at cron time.
- Tests: `AvailabilityPendingReminderJobTest` (5 cases), `NotificationPayloadBuilderAvailabilityPendingReminderTest`, `NotificationDispatcherTest` category mapping — all notification tests green.
- Full `./gradlew test`: 793/796 pass; 3 pre-existing failures in availability/chance summary tests (unrelated to 8.7). Web Vitest has unrelated TS error in `chance-breakdown-sheet.spec.ts`.

### File List

- `services/api/src/main/kotlin/com/hatcast/api/notification/AvailabilityPendingReminderJob.kt` (NEW)
- `services/api/src/main/kotlin/com/hatcast/api/notification/NotificationIntent.kt`
- `services/api/src/main/kotlin/com/hatcast/api/notification/NotificationReminderMarkEntity.kt`
- `services/api/src/main/kotlin/com/hatcast/api/notification/NotificationReminderMarkRepository.kt`
- `services/api/src/main/kotlin/com/hatcast/api/notification/NotificationReminderMarkService.kt`
- `services/api/src/main/kotlin/com/hatcast/api/notification/NotificationPayloadBuilder.kt`
- `services/api/src/main/kotlin/com/hatcast/api/notification/NotificationDispatcher.kt`
- `services/api/src/main/kotlin/com/hatcast/api/event/EventRepository.kt`
- `services/api/src/main/resources/db/migration/V61__notification_reminder_marks_civil_date.sql` (NEW)
- `services/api/src/main/resources/application.yml`
- `services/api/openapi/notification-preferences.yaml`
- `services/api/src/test/kotlin/com/hatcast/api/notification/AvailabilityPendingReminderJobTest.kt` (NEW)
- `services/api/src/test/kotlin/com/hatcast/api/notification/NotificationPayloadBuilderAvailabilityPendingReminderTest.kt` (NEW)
- `services/api/src/test/kotlin/com/hatcast/api/notification/NotificationDispatcherTest.kt`

### Change Log

- 2026-06-07 : Story created (`bmad-create-story 8.7`) — auto availability pending reminders, 5-day cadence, honor `AVAILABILITY_WEEKLY_REMINDER`.
- 2026-06-07 : Implementation complete — scheduler, intent, dedupe schema V61, tests (Date: 2026-06-07).

---

### Validation create-story

- [x] AC métier numérotés et sourcés (epics / FR / V1)
- [x] Section **Material 3** remplie (label parity only)
- [x] Tasks référencent les numéros d'AC
- [x] Liens vers fichiers code existants à réutiliser
- [x] `./gradlew test` / Vitest mentionnés
