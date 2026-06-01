---
baseline_commit: 4d96ca8d60686b74e9c93d60e45ddeea5dcac3d0
---

# Story 8.6: Proxy action notifications — acknowledgment to concerned member

**Status:** done

**Story ID:** 8.6  
**Story key:** `8-6-notifications-proxy-confirmation-membre-concerne`  
**Epic:** 8 — Notifications (push, email, preferences)  
**Planning source:** [`epics.md`](../planning-artifacts/epics.md) Story **8.6** + [`sprint-status.yaml`](./sprint-status.yaml) (`ready-for-dev`). **Caveat:** [`PLAN.md`](../../PLAN.md) currently omits **8.6** from the P1 post-MEP list; update PLAN when scheduling the dev work.  
**SCP context:** [sprint-change-proposal-2026-06-01-notifications-epic8-scope.md](../planning-artifacts/sprint-change-proposal-2026-06-01-notifications-epic8-scope.md) defines the notification split, but its optional “8.6” alias was for manual availability nudge / **6.10b**, not proxy acknowledgement; proxy ack is sourced from `epics.md` Story **8.6**.  
**Depends:** Story **8.3** (dispatcher + delivery log, done) ; **5.5** (proxy availability) ; **6.8** (proxy participation) ; **9.0** (audit)  
**Optional:** Story **8.2** (category gating, review — default allow when absent)  
**Related:** Story **9.2** (member audit UI — pull complement, not replaced)

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

---

## Story

As a **member whose availability or participation was recorded by an organizer on my behalf** (proxy Stories **5.5** / **6.8**),  
I want to **receive a notification that an administrator saved my availability or confirmation decision**,  
so that **I know the app reflects my real intent** (e.g. WhatsApp reply) and **can catch a data-entry error** without checking the app daily (FR31 P1).

---

## Acceptance Criteria

1. **Given** a **proxy availability** write via `PUT …/availability/participants/{participantId}` (Story **5.5**) where **`actorUserId ≠ subjectUserId`**, **when** the transaction commits and availability **actually changed** (same guard as audit: create, update, or delete with `before ≠ after`), **then** the **subject** linked user receives intent **`PROXY_AVAILABILITY_RECORDED`** on push (FR29 / **8.1**) and/or email — **not** the roster, **not** the proxy actor. [Source: epics 8.6 ; FR17 ; FR31]

2. **Given** a **proxy participation** mutation via `POST …/composition/slots/{roleKey}/{slotIndex}/participation` (Story **6.8**) where the authenticated user is **not** the assignee’s linked account (`principal.userId ≠ subjectUserId`), **when** the transaction commits with status `confirmed`, `declined`, or `pending` (reset), **then** the **subject** receives **`PROXY_CONFIRMATION_RECORDED`** with the recorded decision — **distinct** from **`CONFIRMATION_REQUEST`** (**8.3**) which **asks** the member to act, not acknowledges an orga-recorded decision. [Source: epics 8.6 ; FR26 ; FR31]

3. **Given** a **non-proxy** action (`actorUserId = subjectUserId`, e.g. `PUT …/availability/me` or member self-confirm on own slot), **when** the mutation succeeds, **then** **no** proxy notification is emitted. [Source: epics 8.6 AC3]

4. **Given** a proxy target **without linked `user_id`** (name-only roster row), **when** proxy succeeds, **then** skip notification silently ; audit **9.0** remains the orga trace. [Source: epics 8.6 AC4]

5. **Given** notification payload construction, **when** dispatch runs, **then** push/email include **actor display name** (organizer/admin), **event title + formatted date** (reuse `NotificationPayloadBuilder` date pattern), **change summary** in French:
   - Availability: status label before→after (`Non renseigné` / `Dispo` / `Pas dispo`, aligned with `availabilityBadgeLabel`) ; include **role keys / role labels** when status is available and roles changed ; include **comment** snippet when comment changed (even if status unchanged).
   - Participation: role label + slot context ; decision `Confirmé`, `Décliné`, or `À confirmer` (push-friendly text may omit audit UI emojis).
   - **Deep link:** availability → `/saison/{seasonSlug}/event/{eventSlug}?tab=dispos` ; participation `pending` → `/saison/{seasonSlug}/event/{eventSlug}?showConfirm=true` ; participation `confirmed` / `declined` → `/saison/{seasonSlug}/event/{eventSlug}?tab=equipe`. [Source: epics 8.6 AC5 ; `MeInboxDtos.kt` for `tab=dispos` / `showConfirm=true` ; `event-detail-tabs.ts` for `showConfirm` selecting Équipe ; existing `NotificationPayloadBuilder` 8.5 payloads for `tab=equipe`]

6. **Given** channel eligibility (**8.1** push, email address, **8.2** if shipped), **when** a channel is unavailable or send fails, **then** domain HTTP response is **unchanged** ; async failure logged + `notification_delivery_log` (**NFR-R2**). [Source: architecture NFR-R2 ; Story 8.3 AC6]

7. **Given** member inbox (`GET /v1/me/inbox`, Epic **17.21**), **when** proxy notifications are sent, **then** **no** inbox row is created — inbox stays derived from domain state only. [Source: Story 8.3 AC7 ; SCP §4.8]

8. **Given** audit journal (**9.0** / UI **9.2**), **when** 8.6 ships, **then** notifications **complement** audit (proactive signal) — they **do not replace** “changes concerning me” consultation. [Source: epics 8.6]

9. **Given** implementation complete, **when** tests run, **then** integration tests prove: orga proxy dispo for linked member → exactly one `PROXY_AVAILABILITY_RECORDED` to subject ; self-service dispo → zero proxy intents ; orga proxy confirm on foreign slot → `PROXY_CONFIRMATION_RECORDED` ; orga confirms own slot → zero proxy intents ; name-only proxy → zero sends ; failed push does not roll back mutation ; `./gradlew test` green. [Source: project-context.md]

**Product coverage:** FR31 P1 (proxy acknowledgment) ; FR17, FR26 ; cross FR35 (audit already writes). **Out of scope:** orga ops intents (**8.4**), roster FYI / reminders (**8.5**), rich SW actions, V1 Firestore queue.

---

## Acceptance Criteria — Material 3 (UI)

**UI : N/A** — no changes under `apps/web/` ; delivery is server-side + existing SW handler from Story **8.1** (`custom-sw.js`).

---

## Tasks / Subtasks

- [x] **Scope:** `services/api/` only — reference `legacy/` for tone only (V1 had **no** proxy ack notification).

- [x] **Intent model** (AC: 1–2, 6)
  - [x] Extend [`NotificationIntent.kt`](../../services/api/src/main/kotlin/com/hatcast/api/notification/NotificationIntent.kt): `PROXY_AVAILABILITY_RECORDED`, `PROXY_CONFIRMATION_RECORDED`.
  - [x] Update `NotificationIntent.toCategory(...)` exhaustively: `PROXY_AVAILABILITY_RECORDED` → `AVAILABILITY_REQUEST` ; `PROXY_CONFIRMATION_RECORDED` → `CONFIRMATION_REQUEST` (reuse existing keys — **no** new 8.2 category in this story).
  - [x] Extend [`NotificationDispatchContext`](../../services/api/src/main/kotlin/com/hatcast/api/notification/NotificationDispatchContext.kt) with proxy fields, e.g. `subjectUserId: UUID`, `actorDisplayName` or actor lookup key, `changeSummary: ProxyChangeSummary` (status/roles/comment/participation decision/roleKey) — keep defaults backward compatible for 8.3/8.5 intents.

- [x] **Dispatcher & payload** (AC: 1–2, 5–6)
  - [x] [`NotificationDispatcher`](../../services/api/src/main/kotlin/com/hatcast/api/notification/NotificationDispatcher.kt): branch `resolveRecipients` for proxy intents → **single** subject user (skip if same as actor).
  - [x] [`NotificationRecipientResolver`](../../services/api/src/main/kotlin/com/hatcast/api/notification/NotificationRecipientResolver.kt): add a direct linked-user recipient path (or resolve from a carried `subjectUserId`) instead of reusing roster / assignee fallbacks.
  - [x] [`NotificationPayloadBuilder`](../../services/api/src/main/kotlin/com/hatcast/api/notification/NotificationPayloadBuilder.kt): extend the current `build(intent, event, recipientName, roleKey)` path to accept proxy context (`actorDisplayName`, change summary, role label / status labels). Today the dispatcher passes `recipient.displayName`, so do **not** assume the builder already has actor name.
  - [x] Example bodies (indicative):
    - *« {Actor} a enregistré votre disponibilité pour {Event} le {Date} : {Avant} → {Après} »*
    - *« {Actor} a confirmé votre participation pour {Event} ({Role}) »*
    - *« {Actor} a décliné votre participation pour {Event} ({Role}) »*

- [x] **After-commit hooks** (AC: 1–4, 7 — **NFR-R2**)
  - [x] **Do not** call dispatcher inside `@Transactional` service methods — publish domain events with `ApplicationEventPublisher`, then use **`@TransactionalEventListener(AFTER_COMMIT)`** (same pattern as [`EventNotificationEventListener.kt`](../../services/api/src/main/kotlin/com/hatcast/api/event/EventNotificationEventListener.kt) and [`CompositionNotificationEventListener.kt`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionNotificationEventListener.kt)).
  - [x] Keep the same port/adapter shape as 8.3: domain event → `@TransactionalEventListener(AFTER_COMMIT)` → notification port/adapter (e.g. a small `ProxyNotificationPort` implemented under `com.hatcast.api.notification`) → `NotificationDispatcher`. Avoid wiring a domain listener directly to sender classes.
  - [x] Publish domain events from mutation sites when proxy + eligible:
    - [`AvailabilityService.setParticipantStatus`](../../services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityService.kt) — only when subject resolves to linked `userId ≠ actorUserId` **and** audit would fire (data changed). `recordedByUserId != null` alone is insufficient because this endpoint sets it for every organizer proxy write, including name-only rows. Carry enough before/after data for payload (`status`, `roleKeys`, `comment`) before returning. **Never** from `setMyStatus`.
    - [`CompositionParticipationService.updateParticipation`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionParticipationService.kt) — resolve `assigneeUserId` from the slot’s `seasonParticipantId` / `eventParticipantId` **before** decline clears the assignee ; publish only when `principal.userId ≠ assigneeUserId` **and** `beforeStatus != participationStatus` to avoid duplicate no-op acknowledgements.
  - [x] New listener component (e.g. `ProxyWorkflowNotificationEventListener`) delegating to dispatcher.

- [x] **Explicit non-delivery guards** (AC: 3–4, 7)
  - [x] Self proxy on own linked slot (existing test `organizer proxy on own linked slot still succeeds`) → **no** `PROXY_CONFIRMATION_RECORDED`.
  - [x] Validate composition **8.3** `CONFIRMATION_REQUEST` unchanged — proxy confirm after validate is **ack**, not a second request.
  - [x] No inbox side effects.

- [x] **Tests** (AC: 9)
  - [x] `ProxyAvailabilityNotificationIntegrationTest` (or extension of [`AvailabilityControllerIntegrationTest`](../../services/api/src/test/kotlin/com/hatcast/api/availability/AvailabilityControllerIntegrationTest.kt)) — proxy PUT linked member → one intent to subject ; self PUT `/me` → zero proxy intents ; name-only proxy → zero sends ; comment-only proxy edit with changed comment → one intent.
  - [x] `ProxyParticipationNotificationIntegrationTest` (or extension of [`CompositionParticipationIntegrationTest`](../../services/api/src/test/kotlin/com/hatcast/api/composition/CompositionParticipationIntegrationTest.kt)) — proxy confirm/decline/reset on foreign assignee ; own-slot confirm → zero proxy intents ; name-only assignee → zero sends.
  - [x] `NotificationDispatcherTest` / resolver unit tests — proxy intents resolve only explicit subject, never concerned roster or validated assignees.
  - [x] Payload unit test: actor name + event date + before→after status labels + role label + deep link tab.
  - [x] Documentation task: update [`ARCH.md`](../../ARCH.md) / notification section if this story changes production notification behavior; update [`PLAN.md`](../../PLAN.md) P1 list if **8.6** is scheduled for the dev wave.

---

## Dev Notes

### Scope boundary (normative)

| In 8.6 | Out of 8.6 |
|--------|------------|
| `PROXY_AVAILABILITY_RECORDED` on proxy dispo change (**5.5**) | Orga ops intents (**8.4** / FR31b) |
| `PROXY_CONFIRMATION_RECORDED` on proxy confirm/decline/reset (**6.8**) | `CONFIRMATION_REQUEST` on validate (**8.3**) |
| Single-subject audience (linked user only) | Name-only participants (skip) |
| After-commit dispatch + delivery log | Category prefs UI (**8.2**) — consume port only |
| French push/email payloads + deep links | Member audit UI (**9.2**) |
| Reuse 8.3 dispatcher/senders/log | Comment-only **self-service** (no proxy notif) |

### Critical code state today (must read before coding)

| Hook | Current behavior | 8.6 change |
|------|------------------|------------|
| [`AvailabilityService.setParticipantStatus`](../../services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityService.kt) | Persists row + audit via `recordAvailabilityAudit` ; **no** notification | Publish `ProxyAvailabilityRecordedEvent` when proxy + subject linked + data changed |
| [`AvailabilityService.setMyStatus`](../../services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityService.kt) | Self-service ; `recordedByUserId = null` | **No** proxy notification |
| [`CompositionParticipationService.updateParticipation`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionParticipationService.kt) | Audit `PARTICIPATION_*` ; **no** notification | Publish `ProxyParticipationRecordedEvent` when actor ≠ assignee user |
| [`NotificationDispatcher`](../../services/api/src/main/kotlin/com/hatcast/api/notification/NotificationDispatcher.kt) | Routes existing member intents via roster / assignee / explicit user lists | Add proxy intents + single-recipient subject resolution; never fall back to roster or all assignees |
| [`NotificationRecipientResolver`](../../services/api/src/main/kotlin/com/hatcast/api/notification/NotificationRecipientResolver.kt) | Roster, assignee, and 8.5 recipient helpers | Add direct subject-user resolution for proxy intents |
| [`NotificationPayloadBuilder`](../../services/api/src/main/kotlin/com/hatcast/api/notification/NotificationPayloadBuilder.kt) | Current signature is event + recipient + optional role; no actor/change summary | Add proxy payload input for actor + before/after summary |
| [`NotificationIntent`](../../services/api/src/main/kotlin/com/hatcast/api/notification/NotificationIntent.kt) | Existing 8.3/8.5 member intents | +2 proxy intents and exhaustive category mapping |

### Proxy detection rules (implementation — do not guess)

**Availability (5.5)**

- Entry point: **`setParticipantStatus`** only (organizer endpoint).
- Proxy when: resolved subject has `user.id` **and** `user.id != principal.userId`.
- Fire only when audit fires: `existing == null \|\| beforeSnapshot != afterSnapshot` (includes delete → unknown, comment-only edit, role key change).
- `setMyStatus` → never proxy notif (even if user is also organizer).

**Participation (6.8)**

- Entry point: **`updateParticipation`**.
- Resolve assignee linked user from `slotEntity.seasonParticipantId` / `eventParticipantId` (same IDs as audit subject fields).
- Proxy when: `assigneeUserId != null` **and** `assigneeUserId != principal.userId`.
- Includes `confirmed`, `declined`, and `pending` (reset) — all are orga-administered decisions on behalf of assignee when proxy.
- Self confirm on own slot: `assigneeUserId == principal.userId` → **no** proxy notif (see [`CompositionParticipationIntegrationTest`](../../services/api/src/test/kotlin/com/hatcast/api/composition/CompositionParticipationIntegrationTest.kt) `organizer proxy on own linked slot still succeeds`).

### Distinction vs Story 8.3 (regression guard)

| Intent | Trigger | Audience | Meaning |
|--------|---------|----------|---------|
| `CONFIRMATION_REQUEST` | Composition **validate** / gap-fill assign | Assignees | “Please confirm your role” |
| `PROXY_CONFIRMATION_RECORDED` | Orga records confirm/decline/reset **for** assignee | Subject only | “An orga saved your decision” |

Never emit `CONFIRMATION_REQUEST` when orga proxy-confirms — that would contradict the recorded state.

### Architecture compliance

- **NFR-R2** ([architecture.md](../planning-artifacts/architecture.md)): delivery **after commit** ; domain transaction never fails on push/email error.
- **Inbox ≠ notification log** (Story 8.3, SCP §4.8): no inbox writes on send.
- **Stable event URLs**: season + event slugs from `EventEntity`.
- **Audit alignment**: notification payload should mirror audit `before`/`after` labels shown in Story **9.1** journal (French status words).

### Status label mapping (French — align audit UI)

| API / stored | Label |
|--------------|-------|
| unknown / deleted | Non renseigné |
| available | Dispo |
| unavailable | Pas dispo |
| confirmed | Confirmé |
| declined | Décliné |
| pending | À confirmer |

Source of truth for current UI labels: [`availability-status.ts`](../../apps/web/src/app/core/availability/availability-status.ts), [`audit-display-labels.ts`](../../apps/web/src/app/core/audit/audit-display-labels.ts), and backend role labels in [`SeasonStatisticsService.ROLE_LABELS`](../../services/api/src/main/kotlin/com/hatcast/api/season/SeasonStatisticsService.kt). Push/email text can omit audit emojis, but must not invent a different status vocabulary.

### Category / 8.2 integration

- Reuse **`AVAILABILITY_REQUEST`** and **`CONFIRMATION_REQUEST`** categories for eligibility — members can opt out via existing toggles once **8.2** ships.
- If `NotificationPreferenceEligibilityPort` absent: **default allow** (same as 8.3).
- Caveat: routing proxy acknowledgements through `CONFIRMATION_REQUEST` means a member who opts out of confirmation notifications also opts out of proxy confirmation acknowledgements. This is intentional for 8.6 unless product requests a new category.

### V1 parity

V1 changelog notes orga can edit player availability ; **no** automatic proxy-ack push/email existed. This story is **V2 net-new** value (WhatsApp → orga proxy workflow).

### Previous story intelligence (8.3)

- Unified [`NotificationDispatcher`](../../services/api/src/main/kotlin/com/hatcast/api/notification/NotificationDispatcher.kt) + [`WebPushNotificationSender`](../../services/api/src/main/kotlin/com/hatcast/api/notification/WebPushNotificationSender.kt) + [`EmailNotificationSender`](../../services/api/src/main/kotlin/com/hatcast/api/notification/EmailNotificationSender.kt) + `V46__notification_delivery_log.sql`.
- Adapters: [`EventWorkflowNotificationAdapter`](../../services/api/src/main/kotlin/com/hatcast/api/notification/EventWorkflowNotificationAdapter.kt), [`CompositionWorkflowNotificationAdapter`](../../services/api/src/main/kotlin/com/hatcast/api/notification/CompositionWorkflowNotificationAdapter.kt).
- **Extend** this stack — do not create parallel send pipeline.
- 8.3 post-review fixes are already in code: dispatch is after-commit, per-recipient/channel failures are isolated, and `SKIPPED` delivery results are persisted for observability.
- Integration test pattern: spy/mock `NotificationDispatcher` or port ; assert intent + explicit subject after HTTP call, not just “any notification was sent”.

### Planning references to avoid

- Do **not** cite `PLAN.md` as already scheduling **8.6**; current PLAN P1 list omits it.
- Do **not** cite the SCP’s optional “NEW 6.10b or 8.6” row as the proxy-ack requirement; that row is about manual availability nudge + anti-spam. Use `epics.md` Story **8.6** for this proxy notification scope.
- Do **not** cite `MeInboxDtos.kt` as proof for `?tab=equipe`; it proves `?tab=dispos` and `?showConfirm=true`. `?tab=equipe` is supported by event detail tab routing / existing notification payloads.

### Git intelligence

Recent relevant commits:

- `e35d1c00` `fix(notifications): Dispatch after commit` — composition notification events are now published inside domain transactions and delivered through `@TransactionalEventListener(AFTER_COMMIT)`.
- `4c6efbb0` `feat(notifications): Add MEP dispatch and local Mailpit dev` — current push/email dispatcher, delivery log, Mailpit recipe, and payload builder foundation.
- `2615f647` `feat(events): Gate spectacles with draft publish flow` — event notification after-commit pattern for `EventAvailabilityOpenedEvent`.

### Dependencies

| Story / item | Status | Relationship |
|--------------|--------|--------------|
| **8.3** | done | **Required** — dispatcher, senders, delivery log, after-commit pattern |
| **8.1** | done | Push opt-in |
| **8.2** | review | Optional category gating ; default allow if port absent |
| **5.5** | done | Proxy availability API + audit |
| **6.8** | done | Proxy participation API + audit |
| **9.0** | done | Audit trail (complement) |
| **9.2** | backlog | Member audit UI — related, not blocking |

### Explicit non-goals

- Notifying the **proxy actor** (orga) — that is **8.4** ops family.
- Notifying when orga uses **manual announce** (**6.10**) — separate pipeline.
- Push notification action buttons (confirm/decline in SW).
- New Material 3 UI or `/compte` preference rows (reuse 8.2 categories).

### Project context reference

- Tests: `./gradlew test` from repo root ([project-context.md](../../project-context.md)).
- Architecture: [architecture.md](../planning-artifacts/architecture.md) NFR-R2 ; [ARCH.md](../../ARCH.md) § Notifications V2 if implementation changes production notification behavior.
- Product: [prd.md](../planning-artifacts/prd.md) FR29–FR31 ; [epics.md](../planning-artifacts/epics.md) Story 8.6 ; notification SCP 2026-06-01.
- UI: [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md) is only relevant if implementation unexpectedly touches `apps/web/`; current story is **UI : N/A**.

---

## Dev Agent Record

### Agent Model Used

Composer

### Completion Notes List

- Added `PROXY_AVAILABILITY_RECORDED` and `PROXY_CONFIRMATION_RECORDED` intents with 8.2 category mapping (`AVAILABILITY_REQUEST` / `CONFIRMATION_REQUEST`).
- After-commit pipeline: domain events from `AvailabilityService` (linked-user proxy only) and `CompositionParticipationService` → `ProxyWorkflowNotificationEventListener` → `ProxyWorkflowNotificationAdapter` → `NotificationDispatcher`.
- Payloads include French actor name, before→after availability summary (from audit snapshots to avoid in-place entity mutation), participation decision, and deep links per AC5.
- Guards: skip name-only participants, self-service `/me`, actor=subject, no inbox writes.
- Tests: `ProxyNotificationIntegrationTest`, `ProxyNotificationPushFailureIntegrationTest`, `NotificationPayloadBuilderProxyTest`, dispatcher/resolver unit tests. Full `services/api` `./gradlew test` green.

### File List

- services/api/src/main/kotlin/com/hatcast/api/notification/NotificationIntent.kt
- services/api/src/main/kotlin/com/hatcast/api/notification/NotificationDispatchContext.kt
- services/api/src/main/kotlin/com/hatcast/api/notification/NotificationDispatcher.kt
- services/api/src/main/kotlin/com/hatcast/api/notification/NotificationRecipientResolver.kt
- services/api/src/main/kotlin/com/hatcast/api/notification/NotificationPayloadBuilder.kt
- services/api/src/main/kotlin/com/hatcast/api/notification/ProxyNotificationEvents.kt
- services/api/src/main/kotlin/com/hatcast/api/notification/ProxyNotificationPort.kt
- services/api/src/main/kotlin/com/hatcast/api/notification/ProxyNotificationLabels.kt
- services/api/src/main/kotlin/com/hatcast/api/notification/ProxyWorkflowNotificationAdapter.kt
- services/api/src/main/kotlin/com/hatcast/api/notification/ProxyWorkflowNotificationEventListener.kt
- services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityService.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/CompositionParticipationService.kt
- services/api/src/test/kotlin/com/hatcast/api/notification/ProxyNotificationIntegrationTest.kt
- services/api/src/test/kotlin/com/hatcast/api/notification/ProxyNotificationPushFailureIntegrationTest.kt
- services/api/src/test/kotlin/com/hatcast/api/notification/NotificationPayloadBuilderProxyTest.kt
- services/api/src/test/kotlin/com/hatcast/api/notification/NotificationDispatcherTest.kt
- services/api/src/test/kotlin/com/hatcast/api/notification/NotificationRecipientResolverTest.kt
- ARCH.md
- PLAN.md
- _bmad-output/implementation-artifacts/sprint-status.yaml

---

## Change Log

| Date | Change |
|------|--------|
| 2026-06-01 | Story context created (create-story 8.6) |
| 2026-06-01 | Story validated against current 8.3/8.2 status and notification code guardrails |
| 2026-06-01 | False/obsolete references corrected before dev handoff (PLAN/SCP caveats, deep links, labels, event wiring, test names) |
| 2026-06-01 | Implementation complete — proxy ack notifications after-commit (API only) |
| 2026-06-01 | Code review (bmad-code-review) — findings recorded below |
| 2026-06-01 | Code review patches applied — tutoiement, tests AC9, membership-linked resolution |

---

### Review Findings

- [x] [Review][Decision] Ton vouvoiement « votre » vs tutoiement — **résolu : tutoiement** (« ta disponibilité / participation »).

- [x] [Review][Patch] AC9 — test intégration « failed push ne rollback pas la mutation » [`ProxyNotificationPushFailureIntegrationTest.kt`]
- [x] [Review][Patch] AC9/AC2 — tests intégration proxy participation `declined` et `pending` (reset) [`ProxyNotificationIntegrationTest.kt`]
- [x] [Review][Patch] AC9/Tasks — garde-fou régression `CONFIRMATION_REQUEST` sur proxy confirm post-validate [`ProxyNotificationIntegrationTest.kt`]
- [x] [Review][Patch] Résolution sujet lié via `troupeMembership.user` absente pour dispo proxy [`AvailabilityService.kt:388-396`]
- [x] [Review][Patch] Même lacune pour participation proxy [`CompositionParticipationService.kt:207-217`]
- [x] [Review][Patch] Libellés décision en chaînes magiques dans le builder vs `ProxyNotificationLabels` [`NotificationPayloadBuilder.kt`, `ProxyNotificationLabels.kt`]
- [x] [Review][Patch] Tests payload `declined` + assertion date formatée [`NotificationPayloadBuilderProxyTest.kt`]
- [x] [Review][Patch] Tests idempotence no-op (re-PUT dispo / re-POST participation identiques → zéro intent) [`ProxyNotificationIntegrationTest.kt`]

- [x] [Review][Defer] Diff review mélangé avec changements 8.5 (FYI/rappels) — périmètre review, pas régression 8.6 — deferred, pre-existing
- [x] [Review][Defer] `resolveSubjectRecipient` retourne `displayName` vide — pattern existant 8.3, payloads proxy n'utilisent pas le prénom destinataire — deferred, pre-existing
- [x] [Review][Defer] `userRepository.findById` par notification pour le nom acteur — charge DB post-commit acceptable pour V1 du pipeline — deferred, pre-existing

---

### Validation create-story

- [x] AC métier numérotés et sourcés (epics / FR / SCP)
- [x] Section **Material 3** = **UI : N/A**
- [x] Tasks référencent les AC et les fichiers code existants à réutiliser
- [x] `./gradlew test` mentionné
- [x] Previous story intelligence included (8.3 done, 8.2 review)
- [x] After-commit, explicit subject recipient, name-only skip, and inbox non-side-effect guardrails documented
- [x] False/obsolete references corrected or explicitly caveated (PLAN omission, SCP 6.10b alias, `MeInboxDtos.kt` deep-link scope, current notification code state)
