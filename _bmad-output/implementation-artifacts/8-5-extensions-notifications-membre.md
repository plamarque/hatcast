---
baseline_commit: 4d96ca8d60686b74e9c93d60e45ddeea5dcac3d0
---

# Story 8.5: Extended member notifications

**Status:** done

**Story ID:** 8.5  
**Story key:** `8-5-extensions-notifications-membre`  
**Epic:** 8 — Notifications (push, email, preferences)  
**PLAN:** [PLAN.md](../../PLAN.md) § Wave iso-V1 — **8.5** P1 post-MEP initial  
**SCP:** [sprint-change-proposal-2026-06-01-notifications-epic8-scope.md](../planning-artifacts/sprint-change-proposal-2026-06-01-notifications-epic8-scope.md)  
**Depends:** Story **8.3** (dispatcher + delivery log) ; Story **8.2** (category preferences, in progress)  
**Related:** Story **8.6** (proxy acknowledgement, same P1 wave) ; Story **9.2** (member audit UI, pull complement)

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

---

## Story

As a **HatCast member**,  
I want to **receive complementary notifications for validated teams, upcoming confirmed participation, removal from a composition, and re-confirmation**,  
so that **I stay informed about changes that affect me without being spammed** (FR31 P1).

---

## Acceptance Criteria

1. **Given** a composition is **validated** for the first time, **when** 8.5 FYI roster notifications are enabled, **then** linked roster members who are **not assigned** receive **`TEAM_VALIDATED_FYI`** with a concise team listing / event summary, while assignees continue to receive only **`CONFIRMATION_REQUEST`** from Story **8.3**. Name-only participants are skipped. [Source: epics 8.5 ; PRD FR31 P1 ; SCP Appendix A]

2. **Given** a linked assignee has **confirmed** participation, **when** the event reaches **J-7** or **J-1** in the product civil-day timezone (`Europe/Paris` / `EventService.AGENDA_ZONE`), **then** the member receives exactly one **`ASSIGNEE_PRESENCE_REMINDER`** per reminder window with event info, role/composition context, and a decline CTA deep link to the Équipe flow. Pending, declined, removed, waived, archived, draft/unopened, and past events are not reminded. [Source: epics 8.5 ; PRD FR31 P1]

3. **Given** a linked assignee is **removed from a validated composition** by an organizer/admin without the member explicitly declining, **when** the transaction commits, **then** the former assignee receives **`REMOVED_FROM_COMPOSITION`** with role + event context. Replacing a member in the same mutation must send removal to the former assignee and confirmation request / re-confirmation only to the new or affected assignee, never to the whole roster. [Source: PRD FR31 P1 ; FR27]

4. **Given** an already validated composition is **unlocked/remodeled/revalidated** and a linked assignee’s required response is reset or the member is newly re-added after a previous decision, **when** the remodel commits, **then** the affected assignee receives **`RECONFIRMATION_REQUEST`** instead of the generic first-time **`CONFIRMATION_REQUEST`**. Unaffected assignees are not notified again. [Source: PRD FR23, FR31 P1]

5. **Given** channel eligibility, **when** any 8.5 intent dispatches, **then** it uses Story **8.2** categories:
   - **`TEAM_VALIDATED_FYI`** → `TEAM_CONFIRMED`
   - **`ASSIGNEE_PRESENCE_REMINDER`** → `REMINDER_7_DAYS` or `REMINDER_1_DAY`
   - **`REMOVED_FROM_COMPOSITION`** → `CONFIRMATION_REQUEST`
   - **`RECONFIRMATION_REQUEST`** → `CONFIRMATION_REQUEST`
   Push also requires Story **8.1** global/device eligibility ; email requires a non-blank user email. Missing 8.2 preference rows default to allowed, but the 8.2 port should be present on this branch. [Source: Story 8.2 AC6 ; FR30/FR31]

6. **Given** delivery is attempted, **when** push/email fails or a channel is skipped, **then** the domain write / scheduler loop is not rolled back ; the result is observable via structured logs and `notification_delivery_log` (**NFR-R2**). Delivery failures are isolated per recipient/channel so one broken subscription does not stop remaining recipients. [Source: architecture NFR-R2 ; Story 8.3 review findings]

7. **Given** member inbox (`GET /v1/me/inbox`, Epic **17.21**), **when** 8.5 notifications are sent, **then** no inbox rows are created or updated as a side effect — inbox remains derived from domain state only. [Source: SCP §4.8 ; Story 8.3 AC7]

8. **Given** scheduled reminders run more than once, the API restarts, or Cloud Run has more than one instance, **when** the same event/user/window is encountered again, **then** 8.5 sends are idempotent: no duplicate J-7/J-1 reminders and no duplicate removal/re-confirmation notifications for the same logical change. [Source: NFR-R2 ; scheduling guardrail]

9. **Given** implementation complete, **when** tests run, **then** integration/unit tests prove: validate → FYI to non-assigned linked roster only ; validate still sends `CONFIRMATION_REQUEST` to assignees only ; J-7/J-1 job sends once to confirmed assignees and never to pending/declined/past/archived events ; slot removal notifies only former assignee ; remodel/revalidate notifies only affected assignees ; channel failure does not abort other recipients ; `./gradlew test` green. [Source: project-context.md]

**Product coverage:** FR31 P1 member intents ; FR30 category gating ; NFR-R2. **Out of scope:** organizer ops intents (**8.4** / FR31b), proxy acknowledgement (**8.6**), manual availability nudge (**6.10b**), new `/compte` UI, rich service-worker action buttons.

---

## Acceptance Criteria — Material 3 (UI)

**UI : N/A** — no changes under `apps/web/` are required. Existing service worker payload handling from Story **8.1** consumes `{ title, body, url }`; Story **8.2** already covers `/compte` preference UI.

---

## Tasks / Subtasks

- [x] **Scope:** `services/api/` only — extend the existing notification stack; do not create a second delivery pipeline.

- [x] **Intent model & category mapping** (AC: 1–6)
  - [x] Extend [`NotificationIntent.kt`](../../services/api/src/main/kotlin/com/hatcast/api/notification/NotificationIntent.kt): `TEAM_VALIDATED_FYI`, `ASSIGNEE_PRESENCE_REMINDER`, `REMOVED_FROM_COMPOSITION`, `RECONFIRMATION_REQUEST`.
  - [x] Update `NotificationIntent.toCategory()` with the mapping in AC5. For reminders, carry the reminder window (`DAYS_7` / `DAYS_1`) in dispatch context so the category can resolve to `REMINDER_7_DAYS` or `REMINDER_1_DAY`.
  - [x] Extend [`NotificationDispatchContext`](../../services/api/src/main/kotlin/com/hatcast/api/notification/NotificationDispatchContext.kt) with fields needed by these intents: explicit `recipientUserIds` or `recipientParticipantIds`, `roleKey`, `slotIndex`, `reminderWindow`, and/or change metadata. Keep defaults backward compatible for 8.3.

- [x] **Dispatcher, resolver, payloads** (AC: 1–7)
  - [x] Extend [`NotificationRecipientResolver`](../../services/api/src/main/kotlin/com/hatcast/api/notification/NotificationRecipientResolver.kt) with:
    - non-assigned linked roster recipients = concerned roster minus active slot assignees;
    - confirmed assignees for an event/window;
    - former assignee / affected assignee single-recipient paths.
  - [x] Extend [`NotificationDispatcher`](../../services/api/src/main/kotlin/com/hatcast/api/notification/NotificationDispatcher.kt) to route 8.5 intents without broad roster fallbacks.
  - [x] Extend [`NotificationPayloadBuilder`](../../services/api/src/main/kotlin/com/hatcast/api/notification/NotificationPayloadBuilder.kt) with French copy and stable URLs:
    - FYI / reminders / removal → `/saison/{seasonSlug}/event/{eventSlug}?tab=equipe`
    - re-confirmation → `/saison/{seasonSlug}/event/{eventSlug}?showConfirm=true`
  - [x] Keep payload shape `{ title, body, url }`; no service-worker change in this story.

- [x] **After-commit composition hooks** (AC: 1, 3, 4, 6–8)
  - [x] Do **not** call dispatcher directly inside `@Transactional` domain services. Publish domain events, then dispatch via `@TransactionalEventListener(AFTER_COMMIT)` like [`CompositionNotificationEventListener`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionNotificationEventListener.kt).
  - [x] FYI on first validation: extend `CompositionConfirmationRequestedEvent` or publish a dedicated `TeamValidatedFyiRequestedEvent` from [`CompositionService.validateComposition`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionService.kt) only when `alreadyValidated == false`.
  - [x] Removal: detect former assignee when a validated or previously validated composition loses a linked slot assignment. Current code only allows clearing unlocked draft slots (`CompositionSlotAssignmentService.clearSlot`) and decline frees slots via `CompositionParticipationService`; if the product path requires removing from locked/remodeled compositions, add the domain hook where the actual removal happens, not in the dispatcher.
  - [x] Re-confirmation: when an assignee was previously confirmed/declined and a remodel resets their response to `PENDING`, publish `RECONFIRMATION_REQUEST` for that participant only. Do not re-notify unaffected confirmed assignees.

- [x] **Scheduled reminders J-7/J-1** (AC: 2, 6, 8)
  - [x] Add a scheduler component in `com.hatcast.api.notification` (or a clearly named subpackage) that scans upcoming non-archived events for J-7/J-1 windows using `EventService.AGENDA_ZONE`.
  - [x] Enable scheduling explicitly (`@EnableScheduling`) and configure a dedicated `TaskScheduler` if a long-running reminder scan could block other scheduled jobs.
  - [x] Add idempotency storage, preferably a dedicated Flyway table such as `notification_reminder_marks(intent, event_id, user_id, reminder_window, sent_at)` with a unique key. `notification_delivery_log` alone is append-only delivery evidence and is not a reliable dedupe lock unless extended with a unique logical key.
  - [x] Use a transaction / unique constraint to claim a reminder before sending so repeated scheduler runs and multi-instance Cloud Run do not duplicate sends.

- [x] **Delivery observability hardening** (AC: 6, 8)
  - [x] Address the Story **8.3** review findings that affect 8.5 before layering more intents: isolate per-recipient/channel failures, persist or explicitly log `SKIPPED` outcomes, and avoid one unexpected error aborting a whole dispatch run.
  - [x] Add repository queries to [`NotificationDeliveryLogRepository`](../../services/api/src/main/kotlin/com/hatcast/api/notification/NotificationDeliveryLogRepository.kt) only for observability; keep dedupe in a logical mark table if reminders need once-only guarantees. _(Dedupe via `notification_reminder_marks`; no extra delivery-log queries needed for this story.)_

- [x] **Tests** (AC: 9)
  - [x] `TeamValidatedFyiNotificationIntegrationTest` — assignees get `CONFIRMATION_REQUEST`; linked non-assigned roster gets `TEAM_VALIDATED_FYI`; name-only roster skipped.
  - [x] `AssigneePresenceReminderJobTest` — J-7/J-1 sends once, respects confirmed-only and event filters, and dedupes repeated runs.
  - [x] `CompositionRemovalNotificationIntegrationTest` — former assignee receives `REMOVED_FROM_COMPOSITION`; replacement receives the appropriate request; roster not notified.
  - [x] `ReconfirmationNotificationIntegrationTest` — remodel/revalidate targets only affected assignees.
  - [x] Extend `NotificationDispatcherTest` / `NotificationRecipientResolverTest` for new intents and category mapping.

---

## Dev Notes

### Scope boundary (normative)

| In 8.5 | Out of 8.5 |
|--------|------------|
| `TEAM_VALIDATED_FYI` to non-assigned linked roster | Organizer ops (`EVENT_DRAFT_CREATED`, incomplete composition cadence) |
| J-7 / J-1 reminders for confirmed assignees | Manual nudge from organizer UI (**6.10b**) |
| Removal and re-confirmation for affected members | Proxy acknowledgement (**8.6**) |
| Category gating via 8.2 | New `/compte` preference UI |
| Idempotent scheduler / marks | Rich push actions in service worker |
| Existing push/email senders + delivery log | Firestore `pushQueue` / V1 Cloud Functions |

### Critical code state today (must read before coding)

| Area | Current behavior | 8.5 change |
|------|------------------|------------|
| [`NotificationIntent`](../../services/api/src/main/kotlin/com/hatcast/api/notification/NotificationIntent.kt) | Only `AVAILABILITY_OPENED`, `CONFIRMATION_REQUEST` | Add four member P1 intents |
| [`NotificationDispatcher`](../../services/api/src/main/kotlin/com/hatcast/api/notification/NotificationDispatcher.kt) | Resolves roster or assignees; broad try/catch | Add explicit recipient paths; isolate failures |
| [`NotificationRecipientResolver`](../../services/api/src/main/kotlin/com/hatcast/api/notification/NotificationRecipientResolver.kt) | Roster + assignees only | Add non-assigned roster, confirmed assignees, former/affected assignee |
| [`CompositionService.validateComposition`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionService.kt) | Publishes `CompositionConfirmationRequestedEvent` on first validate | Also trigger FYI for non-assigned roster, after commit |
| [`CompositionSlotAssignmentService.assignSlot`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionSlotAssignmentService.kt) | When locked and target slot is empty, publishes confirmation request for new assignee | Keep confirmation for new assignment; add removal/re-confirm only where assignees are actually displaced/reset |
| [`CompositionDrawService.drawComposition`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionDrawService.kt) | Fill-empty publishes confirmation request for newly assigned participants | Preserve; do not turn fill-empty into roster FYI |
| [`CompositionParticipationService.updateParticipation`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionParticipationService.kt) | Decline frees slot and records decline | Decline is not “removed by organizer”; do not send `REMOVED_FROM_COMPOSITION` for self-decline |

### Intent semantics

| Intent | Trigger | Audience | Meaning |
|--------|---------|----------|---------|
| `TEAM_VALIDATED_FYI` | First composition validate | Linked concerned roster **not assigned** | “The team was validated; you are not assigned / here is the team.” |
| `ASSIGNEE_PRESENCE_REMINDER` | Scheduler J-7 / J-1 | Confirmed linked assignees | “Reminder: you are expected at this event; decline if no longer possible.” |
| `REMOVED_FROM_COMPOSITION` | Organizer/admin removes linked assignee from validated/remodeled composition | Former assignee only | “You are no longer in this composition.” |
| `RECONFIRMATION_REQUEST` | Remodel resets or re-adds an already affected assignee | Affected assignee only | “Please confirm again after changes.” |

### Category / 8.2 integration

- Story **8.2** currently defines categories `TEAM_CONFIRMED`, `REMINDER_7_DAYS`, `REMINDER_1_DAY`, and `CONFIRMATION_REQUEST`. Reuse these; do **not** add new UI categories unless product explicitly changes FR30.
- `TEAM_VALIDATED_FYI` is semantically “FYI roster on validate” but should be controlled by the existing `TEAM_CONFIRMED` category label from 8.2 until the product renames it.
- If 8.2 is partially implemented on the branch, work with the existing `NotificationPreferenceEligibilityPort` rather than adding a parallel preference service.

### Scheduling guidance

- Spring scheduling in Framework 6.2 uses `@Scheduled` with `@EnableScheduling`; by default Spring falls back to a single-threaded scheduler if no `TaskScheduler` / `ScheduledExecutorService` bean is available. For production reminder scans, prefer a dedicated scheduler bean or ensure the job is short and idempotent.
- Use civil-day windows, not raw “now + 7 * 24h” instants. Compute J-7/J-1 against `EventService.AGENDA_ZONE` so member expectations match agenda date rules.
- Cloud Run can run multiple instances. The database must enforce once-only logical sends; in-memory “already sent” sets are invalid.

### Previous story intelligence

**8.3 (review):**

- Existing dispatcher, senders, delivery log, and payload shape are the foundation for 8.5.
- Review findings in the 8.3 story matter more in 8.5 because scheduler and roster FYI multiply recipient counts: fix per-recipient/channel isolation and `SKIPPED` observability before adding these intents.
- Inbox must remain domain-derived; push/email delivery is not a notification history table.

**8.2 (in progress):**

- Category preferences are account-level JSON on `users.notification_preferences`; defaults are opt-out (`true` unless explicitly false).
- Push category checks must still respect device/global push state from Story **8.1**.

**6.13 / composition after-commit pattern:**

- Domain services publish events inside the transaction; listeners call notification ports after commit. Follow this pattern for all 8.5 mutation-triggered sends.

### Dependencies

| Story / item | Status | Relationship |
|--------------|--------|--------------|
| **8.3** | review | Required dispatcher, senders, delivery log ; review patches should be folded before 8.5 |
| **8.2** | in-progress | Required category preferences for opt-out and reminders |
| **8.1** | done | Push opt-in + subscriptions |
| **6.5 / 6.6 / 6.7 / 6.9** | done | Composition assign/validate/confirm/gap flows used by triggers |
| **9.2** | backlog | Pull audit view complements notifications; not required |

### Explicit non-goals

- No organizer ops notifications: no draft-created, SLA open availability, or incomplete composition cadence.
- No manual “relancer les dispos” button or recent-send guard.
- No UI changes under `apps/web/`.
- No migration of V1 Firestore notification queues.
- No new inbox rows or notification history UI.

### Project context reference

- Tests: `./gradlew test` ([project-context.md](../../project-context.md)).
- Architecture: [ARCH.md](../../ARCH.md) § Notifications V2 ; [architecture.md](../planning-artifacts/architecture.md) NFR-R2.
- Product: [prd.md](../planning-artifacts/prd.md) FR30/FR31 ; [epics.md](../planning-artifacts/epics.md) Story 8.5 ; notification SCP 2026-06-01.
- UI: [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md) confirms UI section is N/A unless the implementation unexpectedly touches `apps/web/`.

### Latest technical notes

- Spring Framework 6.2 `@Scheduled` supports `cron`, `fixedRate`, and `fixedDelay`; use `@EnableScheduling` and consider a named `TaskScheduler` instead of the default single-threaded fallback for production jobs.
- For reminder idempotency, prefer a database unique constraint over relying on scheduler timing or delivery log counts.

---

## Dev Agent Record

### Agent Model Used

Composer (Cursor)

### Implementation Plan

1. Extend notification intents, dispatch context, category mapping (8.2 categories).
2. Add recipient resolver paths and French payloads with stable deep links.
3. Publish after-commit composition events for FYI, removal, re-confirmation.
4. Add J-7/J-1 scheduler with `notification_reminder_marks` idempotency (Flyway V51).
5. Harden dispatcher SKIPPED logging per channel; isolate per-recipient failures.
6. Integration/unit tests for all AC paths; `./gradlew test` green (561 tests).

### Completion Notes List

- Four P1 member intents wired through existing dispatcher (no second pipeline).
- First validate → `CONFIRMATION_REQUEST` + `TEAM_VALIDATED_FYI`; re-validate after unlock skips duplicate notifications (audit-gated).
- Unlock/remodel → `RECONFIRMATION_REQUEST` only for assignees whose status was reset.
- Slot clear/replace after unlock → `REMOVED_FROM_COMPOSITION` + targeted re-confirmation for replacement.
- Daily reminder job (`Europe/Paris` civil days) with DB unique constraint dedupe.
- UI : N/A — no `apps/web/` changes.

### File List

- `services/api/src/main/resources/db/migration/V51__notification_reminder_marks.sql`
- `services/api/src/main/kotlin/com/hatcast/api/notification/NotificationIntent.kt`
- `services/api/src/main/kotlin/com/hatcast/api/notification/NotificationDispatchContext.kt`
- `services/api/src/main/kotlin/com/hatcast/api/notification/NotificationRecipientResolver.kt`
- `services/api/src/main/kotlin/com/hatcast/api/notification/NotificationDispatcher.kt`
- `services/api/src/main/kotlin/com/hatcast/api/notification/NotificationPayloadBuilder.kt`
- `services/api/src/main/kotlin/com/hatcast/api/notification/NotificationReminderMarkEntity.kt`
- `services/api/src/main/kotlin/com/hatcast/api/notification/NotificationReminderMarkRepository.kt`
- `services/api/src/main/kotlin/com/hatcast/api/notification/NotificationReminderMarkService.kt`
- `services/api/src/main/kotlin/com/hatcast/api/notification/AssigneePresenceReminderJob.kt`
- `services/api/src/main/kotlin/com/hatcast/api/notification/NotificationSchedulingConfiguration.kt`
- `services/api/src/main/kotlin/com/hatcast/api/notification/CompositionWorkflowNotificationAdapter.kt`
- `services/api/src/main/kotlin/com/hatcast/api/composition/CompositionNotificationEvents.kt`
- `services/api/src/main/kotlin/com/hatcast/api/composition/CompositionNotificationPort.kt`
- `services/api/src/main/kotlin/com/hatcast/api/composition/CompositionNotificationEventListener.kt`
- `services/api/src/main/kotlin/com/hatcast/api/composition/CompositionService.kt`
- `services/api/src/main/kotlin/com/hatcast/api/composition/CompositionSlotAssignmentService.kt`
- `services/api/src/main/kotlin/com/hatcast/api/composition/CompositionDeclineRestoreService.kt`
- `services/api/src/main/kotlin/com/hatcast/api/audit/AuditEventRepository.kt`
- `services/api/src/main/kotlin/com/hatcast/api/event/EventRepository.kt`
- `services/api/src/test/kotlin/com/hatcast/api/notification/TeamValidatedFyiNotificationIntegrationTest.kt`
- `services/api/src/test/kotlin/com/hatcast/api/notification/AssigneePresenceReminderJobTest.kt`
- `services/api/src/test/kotlin/com/hatcast/api/notification/CompositionRemovalNotificationIntegrationTest.kt`
- `services/api/src/test/kotlin/com/hatcast/api/notification/ReconfirmationNotificationIntegrationTest.kt`
- `services/api/src/test/kotlin/com/hatcast/api/notification/CompositionValidateNotificationIntegrationTest.kt`
- `services/api/src/test/kotlin/com/hatcast/api/notification/NotificationDispatcherTest.kt`
- `services/api/src/test/kotlin/com/hatcast/api/notification/NotificationRecipientResolverTest.kt`
- `services/api/src/test/kotlin/com/hatcast/api/composition/CompositionGapFillIntegrationTest.kt`

### Review Findings

<!-- Generated by bmad-code-review 2026-06-01 — 3 layers: Blind Hunter, Edge Case Hunter, Acceptance Auditor -->
<!-- Triage: 3 decision-needed, 6 patch, 3 defer, ~8 dismissed -->

- [x] [Review][Decision] D1 — Mixed story scope: 8.6 proxy code committed alongside 8.5. **→ accepted as-is ; 8.6 committed séparément en `1db79442`.**
- [x] [Review][Decision] D2 — `CompositionDeclineRestoreService` gap-fill utilisait `CompositionReconfirmationRequestedEvent` au lieu de `CompositionConfirmationRequestedEvent`. **→ revert appliqué ; fichier revenu à CONFIRMATION (working tree == HEAD).**
- [x] [Review][Decision] D3 — Pas de déduplication pour `REMOVED_FROM_COMPOSITION`. **→ dédup via `NotificationReminderMarkService.tryClaimReminderMark(…, reminderWindow = ONCE)` dans `CompositionWorkflowNotificationAdapter.notifyAssigneeRemoved` ; sentinel `ONCE` dans l'enum (V51, pas de migration V53).**
- [x] [Review][Patch] P1 — `tryClaimReminderMark` : `@Transactional` → `@Transactional(propagation = REQUIRES_NEW)` pour isoler l'insert de marque et rendre le catch `DataIntegrityViolationException` fonctionnel en production. [NotificationReminderMarkService.kt]
- [x] [Review][Patch] P2 — `runDailyReminders` restructuré : collecte de tous les `NotificationDispatchContext` dans `buildDispatchContexts()` (dans la transaction), dispatch dans `afterCommit()` via `TransactionSynchronizationManager` (hors transaction). [AssigneePresenceReminderJob.kt]
- [x] [Review][Patch] P3 — `findValidatedOpenEventsStartingFrom` : ajout `SELECT DISTINCT … JOIN FETCH e.season s JOIN FETCH s.troupe` — élimine le N+1 sur season/troupe. [EventRepository.kt]
- [x] [Review][Patch] P4 — `resolveNonAssignedRosterRecipients` : exclusion basée sur `userId` (via `resolveAssigneeRecipients`) plutôt que sur `participantId` brut — élimine le risque de faux positif season/event participant cross-type. [NotificationRecipientResolver.kt]
- [x] [Review][Patch] P5 — Unlocked path de `assignSlot` : `publishAssigneeRemoved` et `CompositionReconfirmationRequestedEvent` conditionnés par `existsByEventIdAndActionType(COMPOSITION_VALIDATED)` (même guard que le locked path). [CompositionSlotAssignmentService.kt]
- [x] [Review][Patch] P6 — `processRemindersAt` : `LazyInitializationException` prévenu par le FETCH JOIN (P3) sur season/troupe ; dispatch direct conservé (helper de test sans AFTER_COMMIT). [AssigneePresenceReminderJob.kt]
- [x] [Review][Defer] W1 — `actorUserId` set to recipient's own `userId` in reminder dispatch — semantic smell; no immediate user-visible impact since `actorUserId` is not surfaced in reminder payloads — deferred, pre-existing pattern
- [x] [Review][Defer] W2 — `ASSIGNEE_PRESENCE_REMINDER.toCategory(null)` silently falls back to `REMINDER_7_DAYS` — latent wrong-category preference check for future callers that omit `reminderWindow` [NotificationIntent.kt] — deferred, pre-existing
- [x] [Review][Defer] W3 — `resolveUserId` in reminder job has no participant-status guard; deactivated/unlisted participants may still receive reminders if their slot is `CONFIRMED` — deferred, pre-existing participant lifecycle gap

### Change Log

- 2026-06-01 : Story created (`bmad-create-story 8.5`) — P1 member notification extensions after 8.3 MEP.
- 2026-06-01 : Implemented story 8.5 — member P1 notification intents, scheduler, composition hooks, tests.
- 2026-06-01 : Code review complete — 3 decision-needed, 6 patch, 3 defer.
- 2026-06-01 : Tous les patches appliqués (P1–P6 + D2 revert + D3 dédup REMOVED_FROM_COMPOSITION). Story passée à `done`.

---

### Validation create-story

- [x] AC métier numérotés et sourcés (epics / FR / SCP)
- [x] Section **Material 3** = **UI : N/A**
- [x] Tasks référencent les AC et fichiers code existants
- [x] `./gradlew test` mentionné
- [x] Previous story intelligence included (8.2, 8.3, 6.13)
- [x] Scheduler idempotency and NFR-R2 guardrails documented
