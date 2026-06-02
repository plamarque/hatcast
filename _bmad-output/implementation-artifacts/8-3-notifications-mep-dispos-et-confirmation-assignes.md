---
baseline_commit: a74e88ac6992d37c769fd989ce9729bfe8394333
---

# Story 8.3: MEP notifications — availability opened and confirmation for assignees

**Status:** done

**Review handoff (2026-06-01)** : documentation alignée sur les ajustements post-impl. (BouncyCastle, `--with-push`, fix client SW, secrets Cloud Run). Point d’entrée revue adverse : section **Code review checklist (adversarial)** ci-dessous + [`ARCH.md`](../../ARCH.md) § Notifications V2.

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

**UI : N/A** pour le **dispatch serveur** (story 8.3) — pas de nouvel écran sous `apps/web/`.

**Correctif client lié (post-impl., story 8.1)** : [`push-notifications.service.ts`](../../apps/web/src/app/core/push/push-notifications.service.ts) — ne plus bloquer sur `navigator.serviceWorker.ready` quand aucun SW (mode dev) ; utiliser `getRegistration()` + timeout à l’activation. Sans `--with-push`, `/compte` affichait un spinner infini.

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

### Review Findings

- [x] [Review][Patch] `CONFIRMATION_REQUEST` dispatch still runs inside transactional composition services [`CompositionService.kt:174`, `CompositionSlotAssignmentService.kt:184`, `CompositionDrawService.kt:320`, `CompositionDeclineRestoreService.kt:150`] — violates after-commit-only contract from AC/NFR-R2; publish a domain event and dispatch from an `AFTER_COMMIT` listener instead.
- [x] [Review][Patch] Tests do not prove after-commit semantics for validate/assignee confirmation [`CompositionValidateNotificationIntegrationTest.kt:242`] — current mock verifies a dispatch call but not that rollback prevents delivery; add an after-commit/rollback regression test.
- [x] [Review][Patch] Dispatcher catches the whole notification run as one block [`NotificationDispatcher.kt:28`] — an unexpected per-recipient/channel or delivery-log exception can stop remaining recipients; isolate failures per recipient/channel while still shielding the HTTP caller.
- [x] [Review][Patch] `SKIPPED` delivery results are intentionally not persisted [`NotificationDispatcher.kt:94`, `NotificationDispatcher.kt:112`] — missing VAPID private key / disabled mail are part of NFR-R2 observability and should be logged in `notification_delivery_log` or explicitly re-scoped.
- [x] [Review][Patch] Partial multi-device push failures are hidden when at least one subscription succeeds [`WebPushNotificationSender.kt:103`] — status becomes `SENT` and the failed endpoint is only in runtime logs; record partial failure or per-subscription results and consider pruning dead subscriptions.
- [x] [Review][Patch] BouncyCastle provider registration lacks an automated regression test [`NotificationConfiguration.kt:10`] — add a config/unit test asserting provider `BC` is registered or that `PushService` can initialize with configured VAPID keys.
- [x] [Review][Patch] Push enable failure path is untested and can wait 15 seconds before feedback [`push-notifications.service.ts:143`] — add a test for `enable()` without registered service worker and consider a shorter/user-visible timeout.

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

- Dependencies : `nl.martijndwars:web-push:5.1.1` + `org.bouncycastle:bcprov-jdk18on:1.78.1` ([`build.gradle.kts`](../../services/api/build.gradle.kts)).
- **BouncyCastle (obligatoire)** : la lib `web-push` charge les clés VAPID via le provider JCE **`BC`**. [`NotificationConfiguration`](../../services/api/src/main/kotlin/com/hatcast/api/notification/NotificationConfiguration.kt) enregistre `BouncyCastleProvider` au démarrage. Sans cela : `NoSuchProviderException: no such provider: BC` → aucun envoi push (symptôme : opt-in OK, dispatch atteint l’utilisateur, silence côté téléphone).
- VAPID depuis env : `HATCAST_WEB_PUSH_VAPID_PUBLIC_KEY` / `HATCAST_WEB_PUSH_VAPID_PRIVATE_KEY` ([`application.yml`](../../services/api/src/main/resources/application.yml)).
- Send to **all** active `user_push_subscriptions` for each `user_id` (multi-device).
- Payload must match [`custom-sw.js`](../../apps/web/src/custom-sw.js) (`title`, `body`, `url`).
- If VAPID private key empty: skip push with WARN + `SKIPPED` (same pattern as missing SMTP).
- **Push JSON spectacle (MEP)** : titre affiché **`🎯 Nouvel événement !`** (pas le titre du spectacle) ; corps FR avec titre + date — voir [`NotificationPayloadBuilder`](../../services/api/src/main/kotlin/com/hatcast/api/notification/NotificationPayloadBuilder.kt).

### Email (Spring Mail)

- **Pas** de bean `JavaMailSenderImpl()` vide dans `NotificationConfiguration` — laisser **Spring Boot Mail auto-config** créer le client quand `SPRING_MAIL_*` est défini (Cloud Run / secrets GitHub). [`EmailNotificationSender`](../../services/api/src/main/kotlin/com/hatcast/api/notification/EmailNotificationSender.kt) utilise `ObjectProvider<JavaMailSender>`.
- Local : Mailpit via `start-dev.sh` ; Cloud : secrets `SPRING_MAIL_*` injectés par [`.github/workflows/deploy-v2-cloud-run.yml`](../../.github/workflows/deploy-v2-cloud-run.yml) — voir [DEPLOY_V2_CLOUD_RUN.md](../../docs/v2/technical/DEPLOY_V2_CLOUD_RUN.md) §3.3.

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

### Local dev — recette push + email

**Décision (2026-06-01)** : recette email locale via **Mailpit** ; recette push via **`--with-push`** sur [`scripts/start-dev.sh`](../../scripts/start-dev.sh).

| Levier | Comportement |
|--------|--------------|
| `./scripts/start-dev.sh` (défaut) | Front **dev** (`ng serve`) — **service worker désactivé** → pas de push ; Mailpit si email activé |
| `./scripts/start-dev.sh --with-push` | Front **`--configuration=production`** (SW actif) ; **cumulable** avec Mailpit ; alias `--push-test` ; env `HATCAST_START_DEV_WITH_PUSH=1` |
| `HATCAST_NOTIFICATION_EMAIL_ENABLED=true` | Mailpit Docker, SMTP `127.0.0.1:1025`, UI http://127.0.0.1:8025 |
| VAPID dans `.env` | Publique + privée requises pour envoi push ; script affiche un warning si absentes |
| Déclencheur push MEP | **`POST …/actions/open-availability`** (« Publier le spectacle ») — **pas** la seule création brouillon ; republication idempotente → pas de 2ᵉ notif |
| Opt-in | `/compte` sur **même origine** que le test (Tailscale ou localhost) ; attendre ~30 s (enregistrement SW) |

**Cloud / staging** : secrets GitHub `HATCAST_WEB_PUSH_VAPID_*`, `HATCAST_NOTIFICATION_*`, `SPRING_MAIL_*` — voir [DEPLOY_V2_CLOUD_RUN.md](../../docs/v2/technical/DEPLOY_V2_CLOUD_RUN.md).

---

## Post-implementation adjustments (2026-06-01)

Ajustements **après** le premier handoff « implementation complete », validés en recette manuelle (push téléphone + Mailpit).

| Ajustement | Fichier(s) | Motivation |
|------------|------------|------------|
| Enregistrement provider **BouncyCastle** | `NotificationConfiguration.kt` | Fix runtime `NoSuchProviderException: BC` — envoi push impossible malgré abonnements en base |
| Suppression bean `JavaMailSender` vide | `NotificationConfiguration.kt` | Laisser Spring Boot configurer SMTP depuis `SPRING_MAIL_*` (Cloud Run) |
| Try/catch init `PushService` | `WebPushNotificationSender.kt` | NFR-R2 : retour `FAILED` + log au lieu de faire échouer tout le dispatch |
| Fix spinner `/compte` sans SW | `push-notifications.service.ts` | `getRegistration()` / timeout au lieu de `serviceWorker.ready` infini en mode dev |
| Option **`--with-push`** | `start-dev.sh`, `DEVELOPMENT.md`, `.cursor/rules/dev-server.mdc` | Un seul script pour push (SW) + email (Mailpit) |
| Secrets deploy Cloud Run | `deploy-v2-cloud-run.yml`, `DEPLOY_V2_CLOUD_RUN.md`, `.env.example` | Injection VAPID + SMTP par environnement GitHub |

**Non modifié (revue cible)** : logique audience validate (assignés via slots), idempotence open-availability, guards draft publish / manual announce, tests d’intégration dispatcher mockés.

---

## Code review checklist (adversarial)

Points à stresser pour une revue **8.3 + ajustements post-impl.** :

1. **After-commit only** — aucun `NotificationDispatcher.dispatch` dans une méthode `@Transactional` domaine ; listeners inchangés.
2. **Audience validate** — `CONFIRMATION_REQUEST` résout les assignés slot (`NotificationRecipientResolver`), pas tout le roster saison.
3. **Idempotence** — second `open-availability` ne republie pas `EventAvailabilityOpenedEvent` ; second validate ne renvoie pas.
4. **NFR-R2** — échec push/email ne remonte pas au caller HTTP ; `notification_delivery_log` + logs structurés.
5. **BouncyCastle** — provider `BC` enregistré une seule fois au startup ; test manuel ou unitaire si absent en CI.
6. **Eligibility push** — `PushNotificationEligibilityPort` (subscription + flag user) ; sans clé privée → `SKIPPED`, pas exception.
7. **Email Cloud Run** — pas de bean mail vide ; `HATCAST_NOTIFICATION_EMAIL_ENABLED` + `SPRING_MAIL_*` cohérents avec workflow deploy.
8. **Inbox** — aucune écriture inbox sur send (AC7).
9. **Payload push** — JSON `{ title, body, url }` ; deep links slugs ; titre push dispos = emoji générique (produit V1).
10. **Client 8.1** — opt-in push requiert SW (production build ou `--with-push`) ; section `/compte` ne bloque plus sans SW.
11. **Tests** — `EventOpenAvailabilityNotificationIntegrationTest`, `CompositionValidateNotificationIntegrationTest`, `NotificationDispatcherTest` ; optional payload URL test still open.
12. **Hors scope** — pas de notif sur draft compo shared ; pas de `pushQueue` Firestore ; pas de prefs 8.2 UI.

**Recette manuelle minimale (reviewer)** :

```bash
# .env : VAPID_* + HATCAST_NOTIFICATION_EMAIL_ENABLED=true
./scripts/start-dev.sh --with-push
# Téléphone ou desktop : opt-in /compte → publier un NOUVEAU spectacle → notif « 🎯 Nouvel événement ! » + email Mailpit
```

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
- **Post-impl. (2026-06-01)** : BouncyCastle provider registration (fix push send) ; `--with-push` on `start-dev.sh` ; deploy workflow VAPID/SMTP secrets ; `push-notifications.service.ts` SW hang fix ; Cloud Run mail auto-config (no empty JavaMailSender bean).
- Recette validée : push spectacle (`AVAILABILITY_OPENED`) + email Mailpit via `./scripts/start-dev.sh --with-push` ; opt-in PWA Tailscale + publication nouvel événement.

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
- `ARCH.md`
- `.github/workflows/deploy-v2-cloud-run.yml`
- `apps/web/src/app/core/push/push-notifications.service.ts`
- `apps/web/src/app/core/push/push-notifications.service.spec.ts`
- `.cursor/rules/dev-server.mdc`

### Change Log

- 2026-06-01 : Story created (`bmad-create-story 8.3`) — narrow MEP per SCP 2026-06-01 ; depends 3.21 + 8.1.
- 2026-06-01 : Implementation complete — dispatcher, push/email send, delivery log, integration + unit tests.
- 2026-06-01 : Local dev Mailpit — `start-dev.sh` lifecycle (start/stop), SMTP override, docs BMad + DEVELOPMENT.
- 2026-06-01 : Post-impl. — BouncyCastle BC provider, `--with-push`, deploy secrets VAPID/SMTP, client SW hang fix, Cloud Run mail config ; recette push+email validée ; doc mise à jour pour code review adverse.

---

### Validation create-story

- [x] AC métier numérotés et sourcés (epics / FR / SCP)
- [x] Section **Material 3** = **UI : N/A**
- [x] Tasks référencent AC ; liens fichiers code existants
- [x] `./gradlew test` mentionné
- [x] MEP in/out scope table ; pitfall `requestCompositionConfirmation` documented
- [x] Inbox ≠ send log ; after-commit only
