# Investigation — Notifications catalog (V2)

**Date:** 2026-06-07  
**Investigator:** Agent (bmad-investigate)  
**Trigger:** Product request for full push/email inventory, preferences, triggers, backlog  
**Outcome:** Formalized in [`docs/v2/technical/NOTIFICATIONS_CATALOG.md`](../../../docs/v2/technical/NOTIFICATIONS_CATALOG.md)

---

## Scope

Reconstruct the **as-is** notification system for HatCast V2 (Angular + Spring API) and map parity/backlog against V1 (Firebase) and planning artifacts (Epic 8, SCP 2026-06-01, story 8.7).

**Out of scope:** Changing runtime behaviour; inbox pull model (Epic 17); Identity Platform transactional auth emails.

---

## Evidence sources (Confirmed)

| Source | Role |
|--------|------|
| `services/api/src/main/kotlin/com/hatcast/api/notification/NotificationIntent.kt` | Intent enum + category mapping |
| `services/api/src/main/kotlin/com/hatcast/api/notification/NotificationPayloadBuilder.kt` | Push title/body + email subject |
| `services/api/src/main/kotlin/com/hatcast/api/notification/NotificationDispatcher.kt` | Recipients, channel gating, delivery log |
| `services/api/src/main/kotlin/com/hatcast/api/notification/EmailNotificationSender.kt` | Email HTML wrapper (minimal) |
| `services/api/src/main/kotlin/com/hatcast/api/notification/AssigneePresenceReminderJob.kt` | Scheduled J-7/J-1 cron |
| `services/api/src/main/kotlin/com/hatcast/api/notification/CompositionWorkflowNotificationAdapter.kt` | Composition + manual announce dispatch |
| `services/api/src/main/kotlin/com/hatcast/api/notification/EventWorkflowNotificationAdapter.kt` | AVAILABILITY_OPENED on publish |
| `services/api/src/main/kotlin/com/hatcast/api/notification/PushNotificationEligibilityPort.kt` | Global push + category prefs |
| `services/api/src/main/kotlin/com/hatcast/api/notification/UserNotificationPreferencesService.kt` | Category defaults (opt-out) |
| `apps/web/src/app/core/messaging/share-announce-messages.ts` | Manual message defaults (front) |
| `legacy/src/services/notificationTemplates.js` | V1 push/email templates (rich HTML) |
| `_bmad-output/planning-artifacts/sprint-change-proposal-2026-06-01-notifications-epic8-scope.md` | FR31/FR31b split, backlog |
| `_bmad-output/implementation-artifacts/8-5-extensions-notifications-membre.md` | TEAM_VALIDATED_FYI auto withdrawn |
| `_bmad-output/implementation-artifacts/8-7-rappels-automatiques-disponibilite-cadence-5-jours.md` | Pending availability scheduler spec |

---

## Findings (Confirmed)

### F1 — Dispatcher model

V2 uses a unified **`NotificationDispatcher`** invoked **after commit** (Spring `@TransactionalEventListener` / job `afterCommit`). Channels: **Web Push** + **email** (Spring Mail or Cloudflare). Delivery outcomes persisted in **`notification_delivery_log`**. No Firestore `pushQueue` in V2.

### F2 — Implemented intents (9 active message families)

| Intent | Emits? |
|--------|--------|
| `AVAILABILITY_OPENED` | Yes — auto on publish |
| `MANUAL_AVAILABILITY_ANNOUNCE` | Yes — manual |
| `MANUAL_AVAILABILITY_NUDGE` | Yes — manual |
| `CONFIRMATION_REQUEST` | Yes — auto on validate |
| `RECONFIRMATION_REQUEST` | Yes — auto on revalidate |
| `REMOVED_FROM_COMPOSITION` | Yes — auto on slot removal (validated) |
| `ASSIGNEE_PRESENCE_REMINDER` | Yes — cron J-7/J-1 |
| `PROXY_AVAILABILITY_RECORDED` | Yes — auto proxy dispo |
| `PROXY_CONFIRMATION_RECORDED` | Yes — auto proxy participation |
| `COMPOSITION_SHARED` | **No** — empty recipients (8.4) |
| `TEAM_VALIDATED_FYI` | **No auto publisher** — listener wired, event never published (8.5 amendment) |

**Evidence:** `CompositionWorkflowNotificationAdapter.publishDraftCompositionShared` logs skip; `grep TeamValidatedFyiRequestedEvent` shows only listener + data class, no publisher.

### F3 — Preference model (three layers)

1. **Global push (8.1):** `user.pushNotificationsEnabled` + active `user_push_subscriptions` row.
2. **Category (8.2):** Seven `NotificationCategory` keys; default `{ push: true, email: true }` (opt-out).
3. **No app prefs:** Identity Platform password reset / verification emails.

Push gating: `PushNotificationEligibilityAdapter.isPushAllowedForCategory` = global **AND** category push pref.  
Email gating: `NotificationDispatcher.isChannelAllowed` → category email pref only.

### F4 — Email body format V2 vs V1

V2 email body = `<p>{payload.body}</p>` + link « Ouvrir dans HatCast » (`EmailNotificationSender.buildHtmlBody`).  
V1 uses rich templates in `legacy/src/services/emailTemplates.js` (Dispo/Pas dispo buttons, composition blocks).

### F5 — Scheduled jobs

| Job | Cron (default) | Zone |
|-----|----------------|------|
| `AssigneePresenceReminderJob` | `0 0 8 * * *` | Europe/Paris |
| `AvailabilityPendingReminderJob` | **Not implemented** (story 8.7: `0 0 9 * * *`) | — |

Config key: `hatcast.notification.reminder-cron`.

### F6 — Manual share intents without push/email

`CompositionWorkflowNotificationAdapter.requestManualAnnouncement` dispatches only `availability_nudge` and `event` intents. `draw` / `composition` → debug log, WhatsApp/copy only (`share-announce-messages.ts`).

---

## Findings (Deduced)

### D1 — REMOVED_FROM_COMPOSITION vs “mandatory”

SCP 2026-06-01 labels removal alert as mandatory for members. Code maps intent → `NotificationCategory.CONFIRMATION_REQUEST` → **user can opt out**. Product gap unless a dedicated non-opt-out category is added.

### D2 — Proxy ack shares confirmation pref

Story 8.6 documents intentional routing: opt-out of `CONFIRMATION_REQUEST` also blocks proxy participation acknowledgements.

### D3 — TEAM_VALIDATED_FYI future trigger

Amendment 2026-06-06 defers roster FYI to G-012 (team complete) or manual announce; infrastructure remains for future wiring.

---

## Hypotheses (Open)

| ID | Hypothesis | Confirm by |
|----|------------|------------|
| H1 | V1 `processAvailabilityReminders` still runs in prod Firebase | Check deployed Cloud Functions / legacy traffic |
| H2 | Cloud Scheduler external trigger needed for multi-instance dedupe on 8.7 | Ops review post-8.7 |
| H3 | Rich email HTML will return in a dedicated story | PLAN / product decision |

---

## Backlog (from planning artifacts)

| Item | Story | Status |
|------|-------|--------|
| Organizer ops (FR31b) | 8.4 | backlog P2 |
| Availability pending reminders (5-day cadence) | 8.7 | ready-for-dev P1 |
| PWA inbox badge | Epic 10 cross-cut | P2 |
| Grouped multi-event email (V1 parity) | — | deferred in 8.7 |

---

## Deliverable

Normative catalog: **[`docs/v2/technical/NOTIFICATIONS_CATALOG.md`](../../../docs/v2/technical/NOTIFICATIONS_CATALOG.md)** (FR, VD P1 applied 2026-06-07)  
Linked from **ARCH.md** § Notifications V2.

---

## Investigation status

**Closed** — evidence sufficient for catalog v1.1 (post-VD). Re-open when 8.4/8.7 ship, API URL canonical alignment, or pref model changes.
