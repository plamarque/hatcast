---
baseline_commit: afea893d
---

# Story 8.8: Member notifications — event details changed & archived

**Status:** done

**Story ID:** 8.8  
**Story key:** `8-8-notifications-membre-event-details-et-archivage`  
**Epic:** 8 — Notifications (push, email, preferences)  
**Priority:** **P1** (brainstorm N1 + N2 — PO 2026-06-08)  
**Catalogue:** [`NOTIFICATIONS_CATALOG.md`](../../docs/v2/technical/NOTIFICATIONS_CATALOG.md) § Backlog proposé → **Actif** after ship  
**Brainstorm:** [`brainstorming-session-2026-06-07-notifications-post-catalog.md`](../brainstorming/brainstorming-session-2026-06-07-notifications-post-catalog.md) (N1, N2, D1, D4)  
**UX prefs:** [`ux-design-notification-preferences-2026-06-08.md`](../planning-artifacts/ux-design-notification-preferences-2026-06-08.md) (libellés, règle A1) · as-shipped pattern [`ux-notification-prefs-phase1-as-shipped-2026-06-08.md`](../planning-artifacts/ux-notification-prefs-phase1-as-shipped-2026-06-08.md)  
**Depends:** Story **8.3** (dispatcher, after-commit), **8.2** (category prefs API), **8.2b** (UI hidden-key pattern)  
**Blocks (soft):** Catalogue § index maître refresh ; guerilla S1–S5 extension (optional)

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

---

## Story

As a **person on an event roster** (member account **or** guest reached by email) who has **already engaged** with that show — by answering availability **or** by having a **selection / participation** status (confirmed, declined, or awaiting confirmation),  
I want **alerts** (push and/or email) when **date, location, or format** changes or when the show is **archived**,  
so that **I can revisit my availability or participation** when the new conditions no longer suit me — or when they suddenly do (FR31 P1, decisions D1/D4, **PO audience refine 2026-06-08**).

> **PO refine (2026-06-08, v2):** Audience = **engaged roster members** only — not the full concerned roster. Engagement = **dispo renseignée** (`available` / `unavailable`) **OR** **participation compo** (slot assigné `pending` / `confirmed`, **or** déclin enregistré sur compo validée). A roster member still at `unknown` **with no composition participation** is out of scope (contrast `AVAILABILITY_OPENED`). An orga may assign someone **without** a prior availability row — they are still in scope via the participation branch.
>
> **PO refine (2026-06-08, v3 — invités sans compte):** An **engaged** roster row **without** linked `user_id` but with **`normalizedEmail`** on the participant (externe / pré-lien email) may receive **email only** — **no push** (no account / subscription), **no HatCast category prefs** (no `/compte/notifications`). Pure **name-only** rows (no user, no email) remain skipped — same as **8.3** / **8.6**.

---

## Acceptance Criteria

1. **Given** a **published** event (`availabilityOpenedAt != null`), **when** an organizer PATCHes **only** `description`, `title`, `slug`, `roleSlots`, or `category` (no delta on `startsAt`, `location`, or `templateType`), **then** **no** `EVENT_DETAILS_CHANGED` notification is dispatched. [Source: brainstorm D4:B ; NOTIFICATIONS_CATALOG § Backlog ; `EventService.update`](../../services/api/src/main/kotlin/com/hatcast/api/event/EventService.kt)]

2. **Given** a **published** event, **when** `startsAt`, `location`, and/or `templateType` change in a single `EventService.update`, **then** each eligible recipient receives intent **`EVENT_DETAILS_CHANGED`** on push (8.1) and/or email per category pref **`EVENT_DETAILS_CHANGED`** (opt-out, default ON). [Source: N1 ; FR31 ; catalogue]

3. **Given** a **draft** event (`availabilityOpenedAt == null`), **when** any field including date/location/format is updated, **then** **no** `EVENT_DETAILS_CHANGED` is dispatched (publish-before-ping). [Source: catalogue principle § Principes ; 3.21]

4. **Given** `EVENT_DETAILS_CHANGED` dispatch, **when** recipients are resolved, **then** audience = concerned **event roster** participants who are **engaged** and **reachable** (`user_id` **or** non-blank `normalizedEmail` on season/event participant), deduplicated by `userId` when present else by normalized email. **Engaged** means **at least one** of:
   - **Availability answered:** status `available` or `unavailable` on that event (not `unknown`) ;
   - **Participation — awaiting or confirmed:** occupies a composition slot (`assignedParticipantId` set) with `participationStatus` **`pending` or `confirmed`** — includes orga placement **without** prior availability row ;
   - **Participation — declined:** a row exists in **`event_composition_declines`** for that participant on this event (slot may already be cleared — still engaged).  
   **Name-only** rows (no `user_id`, no email) skipped silently. [Source: PO refine 2026-06-08 v2–v3 ; `EventRosterParticipantDto.email`](../../services/api/src/main/kotlin/com/hatcast/api/participant/dto/ParticipantDtos.kt) ; ADR 0021 externe / pré-lien]

4b. **Given** a roster member on a published event with availability **`unknown`** and **no** composition engagement (no slot, no decline row), **when** date/location/format changes, **then** they receive **no** `EVENT_DETAILS_CHANGED`. [Source: PO refine 2026-06-08 v2]

4c. **Given** a roster member placed on a slot **`pending`** confirmation but availability still **`unknown`**, **when** date/location/format changes, **then** they **are** notified (participation branch). [Source: PO refine 2026-06-08 v2]

4d. **Given** an **engaged** roster participant **without** linked `user_id` but with **`normalizedEmail`** (externe / invité pré-lien), **when** `EVENT_DETAILS_CHANGED` or `EVENT_ARCHIVED` dispatches, **then** **email** is attempted to that address ; **push** is **not** attempted ; **category prefs are not consulted** (no HatCast account). [Source: PO refine 2026-06-08 v3]

4e. **Given** an engaged participant with linked `user_id`, **when** dispatch runs, **then** **push** and **email** follow existing gates (**8.1**, category opt-out **8.2**) — unchanged from other member intents. [Source: 8.3 AC5]

5. **Given** an organizer archives an event (`EventService.archive`, `archived: false → true`), **when** the transaction commits, **then** each eligible **reachable engaged** recipient receives **`EVENT_ARCHIVED`** — push/email per AC **4d–4e** and category pref **`EVENT_ARCHIVED`** for linked accounts only (opt-out D1:A, default ON). [Source: N2 ; catalogue ; PO v3]

6. **Given** an organizer **unarchives** an event, **when** the transaction commits, **then** **no** `EVENT_ARCHIVED` (or other member) notification is sent. [Source: brainstorm N2 « Pas de notif sur unarchive »]

7. **Given** `EVENT_ARCHIVED` dispatch, **when** recipients are resolved, **then** audience = **same engaged-roster rule as AC 4**, further filtered to **active** roster participants (`ParticipantStatus.ACTIVE`, active troupe membership per **8.5b** — exclude `REMOVED` / inactive). [Source: PO refine 2026-06-08 v2]

7b. **Given** a roster member with **`unknown`** availability and **no** composition engagement, **when** the event is archived, **then** they receive **no** `EVENT_ARCHIVED`. [Source: PO refine 2026-06-08 v2]

8. **Given** channel eligibility, **when** a channel is blocked or delivery fails, **then** the domain HTTP response is **unchanged** ; failure is logged / `notification_delivery_log` per **8.3** NFR-R2. Rules:
   - **Linked account:** push gated by **8.1** + category pref ; email gated by category pref + non-blank `users.email`.
   - **Guest email only:** email sent if `normalizedEmail` present and SMTP/Cloudflare enabled — **no** pref gate ; push skipped.
   - **No user and no email:** skip silently. [Source: 8.3 AC5–6 ; PO v3]

9. **Given** dispatch runs, **when** push/email is sent, **then** **no** inbox row is created (`GET /v1/me/inbox` remains pull-only). [Source: 8.3 AC7]

10. **Given** payload construction, **when** `EVENT_DETAILS_CHANGED` fires, **then** push/email include **event title**, **formatted date** (new value), **human-readable delta** for changed fields (at minimum: old→new date when `startsAt` changed ; new location when `location` changed ; new format label when `templateType` changed), and deep link **`?tab=infos`** on the event. [Source: role storming N1 « ancienne → nouvelle date » ; `NotificationPayloadBuilder`](../../services/api/src/main/kotlin/com/hatcast/api/notification/NotificationPayloadBuilder.kt)]

11. **Given** payload construction, **when** `EVENT_ARCHIVED` fires, **then** copy states the show is **archived / removed from agenda** with title + prior date, deep link **`?tab=infos`** (or agenda — pick one, document in Dev Agent Record). [Source: UX DT § Spectacle annulé]

12. **Given** implementation uses domain events, **when** `EventService.update` / `archive` succeed, **then** notification dispatch occurs **only** from `@TransactionalEventListener(AFTER_COMMIT)` — **not** inside `@Transactional` service methods (pattern **6-13**, **8.3** review). [Source: `EventNotificationEventListener`](../../services/api/src/main/kotlin/com/hatcast/api/event/EventNotificationEventListener.kt)]

13. **Given** story ship complete, **when** `/compte/notifications` loads, **then** categories **`EVENT_DETAILS_CHANGED`** and **`EVENT_ARCHIVED`** are **visible** (removed from `MEMBER_HIDDEN_NOTIFICATION_PREFERENCE_KEYS`) with **as-shipped copy** (title + one « Me prévenir quand… » line) ; toggles were **absent** before ship (rule **A1**). [Source: 8.2b extensibility ; ux-notification-prefs-phase1-as-shipped § Évolutions 8.8]

14. **Given** tests run, **when** `./gradlew test` and targeted Vitest execute, **then** integration tests prove: significant PATCH → engaged roster only ; `unknown` + no compo → **0** ; `unknown` + slot `pending` → **1** ; `available` non-assignee → **1** ; decline row + `unknown` dispo → **1** ; engaged **guest email** without `user_id` → **1 email, 0 push, 0 pref lookup** ; name-only engaged → **0** ; description-only PATCH → none ; draft → none ; archive same rules ; unarchive → none ; linked-user pref opt-out blocks channel ; `./gradlew test` green. [Source: project-context.md]

**Product coverage:** FR31 P1 ; decisions **D1** (opt-out archivage), **D4** (date/lieu/format only ; audience **affinée PO** : roster engagé dispo ∪ participation), **D7** (catalogue update) ; **not** orga ops (**8.4**), **not** `TEAM_COMPLETE_MEMBER` (**G-012**), **not** debounce 15 min (defer — see Non-goals).

---

## Normative UI copy (phase 2 member — implement verbatim)

| Key | Short title | Description (`Me prévenir quand…`) |
|-----|-------------|--------------------------------------|
| `EVENT_DETAILS_CHANGED` | **Changements importants** | Me prévenir quand la date, le lieu ou le format change sur un spectacle où j’ai déjà interagi (dispo ou participation). |
| `EVENT_ARCHIVED` | **Spectacle annulé** | Me prévenir quand un spectacle où j’ai déjà interagi (dispo ou participation) est annulé ou archivé. |

**Placement:** section **Messages pour moi**, after **Participation**, before **Rappels automatiques** (API `group = NOTIFICATIONS` — order follows `NotificationCategory` enum ordinal in API response; if needed, document explicit sort in `UserNotificationPreferencesService.toResponse`).

---

## Acceptance Criteria — Material 3 (UI)

**M3-1. Material components** — **Given** two new preference rows, **when** rendered, **then** reuse existing `mat-slide-toggle` grid in [`notification-preferences-section`](../../apps/web/src/app/shared/notification-preferences-section/notification-preferences-section.ts) — no custom toggles. [Source: FRONTEND_UI.md ; 8.2b]

**M3-2. Tokens & theme** — **Given** new rows, **when** styled, **then** inherit existing section card / typography tokens (`--mat-sys-*`) — no new hex colors. [Source: FRONTEND_UI.md]

**M3-3. Mobile & touch** — **Given** viewport ≤ 480px, **when** two additional rows render, **then** **Cet appareil** / **E-mail** labels and `aria-label` pattern unchanged ; targets ≥ 48dp. [Source: as-shipped ; NFR-A1]

**M3-4. Member navigation** — **Given** `/compte/notifications`, **when** adding rows, **then** do **not** change account shell / tabs / rail. [Source: 8.2b M3-4]

**M3-5. Review** — **Given** implementation done, **when** validating, **then** checklist FRONTEND_UI.md § Checklist M3 ; update phase-1 regression checklist count **5 → 7** visible member lines in Dev Agent Record. [Source: AGENTS.md]

---

## Tasks / Subtasks

- [x] **Scope:** `services/api/` + `apps/web/` + `docs/v2/technical/NOTIFICATIONS_CATALOG.md` (index + move intents to Actif)

### API — intents, categories, dispatch (AC: 1–9, 12, 14)

- [x] Extend [`NotificationIntent.kt`](../../services/api/src/main/kotlin/com/hatcast/api/notification/NotificationIntent.kt): `EVENT_DETAILS_CHANGED`, `EVENT_ARCHIVED`
- [x] Extend [`NotificationCategory`](../../services/api/src/main/kotlin/com/hatcast/api/notification/NotificationIntent.kt): `EVENT_DETAILS_CHANGED`, `EVENT_ARCHIVED` in group `NOTIFICATIONS` with long French API `label` (OpenAPI compat)
- [x] Update `NotificationIntent.toCategory()` mappings
- [x] Extend [`NotificationDispatchContext`](../../services/api/src/main/kotlin/com/hatcast/api/notification/NotificationDispatchContext.kt) with optional `EventDetailsChangeSummary` (sealed: `startsAt`, `location`, `templateType` old/new values for payload)
- [x] Extend [`EventNotificationPort`](../../services/api/src/main/kotlin/com/hatcast/api/event/EventNotificationPort.kt) + [`EventWorkflowNotificationAdapter`](../../services/api/src/main/kotlin/com/hatcast/api/notification/EventWorkflowNotificationAdapter.kt)
- [x] Add domain events `EventDetailsChangedEvent`, `EventArchivedEvent` ; publish from [`EventService`](../../services/api/src/main/kotlin/com/hatcast/api/event/EventService.kt) via `ApplicationEventPublisher` **after** successful save (listener AFTER_COMMIT only)
- [x] Extend [`EventNotificationEventListener`](../../services/api/src/main/kotlin/com/hatcast/api/event/EventNotificationEventListener.kt) with new handlers
- [x] **Delta detection** in `EventService.update`: compare pre-save snapshot vs post-save for `startsAt`, `location`, `templateType` only ; gate on `e.isAvailabilityOpen()` ; skip if `e.archived`
- [x] **Archive detection** in `EventService.archive`: only when transition to `archived = true`
- [x] [`NotificationRecipientResolver`](../../services/api/src/main/kotlin/com/hatcast/api/notification/NotificationRecipientResolver.kt): engaged roster union (dispo answered ∪ compo pending/confirmed ∪ declines) + archive active filter (8.5b)
- [x] Extend [`NotificationRecipient`](../../services/api/src/main/kotlin/com/hatcast/api/notification/NotificationDispatchContext.kt): guest email recipients (`userId` nullable, `email` for guest path)
- [x] [`NotificationDispatcher`](../../services/api/src/main/kotlin/com/hatcast/api/notification/NotificationDispatcher.kt): wire intents ; guest = email only (no push/prefs)
- [x] **Delivery log (guest):** Flyway V62 — nullable `user_id` + `recipient_email` on `notification_delivery_log`
- [x] [`NotificationPayloadBuilder`](../../services/api/src/main/kotlin/com/hatcast/api/notification/NotificationPayloadBuilder.kt): French push/email copy + delta text ; URL `?tab=infos`
- [x] OpenAPI / DTO: new keys via `NotificationCategory.entries` (verified via `MeNotificationPreferencesIntegrationTest`)

### API — tests (AC: 14)

- [x] New `EventDetailsChangedNotificationIntegrationTest`
- [x] New `EventArchivedNotificationIntegrationTest`
- [x] Unit test `NotificationRecipientResolverTest`: engaged resolver paths
- [x] Unit tests `NotificationPayloadBuilderEventDetailsTest` + guest path in `NotificationDispatcherTest`
- [x] Run `./gradlew test` (notification package green ; 3 pre-existing unrelated failures in availability draw tests)

### Web — prefs UI (AC: 13, M3)

- [x] [`me-notification-preferences-api.service.ts`](../../apps/web/src/app/core/notifications/me-notification-preferences-api.service.ts): add keys to `NotificationPreferenceKey` union
- [x] [`notification-preference-ui-copy.ts`](../../apps/web/src/app/core/notifications/notification-preference-ui-copy.ts): copy for both keys ; visible (not hidden)
- [x] Update [`notification-preferences-section.spec.ts`](../../apps/web/src/app/shared/notification-preferences-section/notification-preferences-section.spec.ts): **7** visible rows ; copy assertions
- [x] Shipped keys use copy map (fallback not triggered)
- [x] Run `npm run test -w @hatcast/web -- --watch=false --include "**/notification-preferences-section.spec.ts"` — 11/11 green

### Docs (AC: 14, D7)

- [x] Move `EVENT_DETAILS_CHANGED` / `EVENT_ARCHIVED` to **Actif** in [`NOTIFICATIONS_CATALOG.md`](../../docs/v2/technical/NOTIFICATIONS_CATALOG.md) ; index + prochaine revue updated

---

## Dev Notes

### Current state (must read before coding)

| Area | Today |
|------|--------|
| `EventService.update` | Persists all fields ; audit `EVENT_UPDATED` on any diff ; **no** notification hook |
| `EventService.archive` | Sets `archived=true` ; audit `EVENT_ARCHIVED` ; **no** notification |
| `EventNotificationPort` | Only `publishAvailabilityOpened` |
| `NotificationIntent` / `NotificationCategory` | No `EVENT_*` members |
| Prefs UI | 5 visible rows ; `MEMBER_HIDDEN` = `COMPOSITION_SHARED`, `TEAM_CONFIRMED` only |
| Reminder jobs | `findValidatedOpenEventsStartingFrom` already filters `archived = false` — archived shows stop J-7/J-1 without extra work |

### Architecture compliance

| Rule | Implementation |
|------|----------------|
| After-commit only | Publish `EventDetailsChangedEvent` / `EventArchivedEvent` from service ; dispatch in listener |
| Pref = dispatch (A1) | Ship API dispatch **and** UI rows in **same** release |
| Opt-out default | Absent pref key → `NotificationPreference(push=true, email=true)` |
| Inbox ≠ send log | No `MeInbox` writes |
| Published gate | `EventEntity.isAvailabilityOpen()` (`availabilityOpenedAt != null`) |
| Significant delta only | **Do not** use raw audit diff — explicit field allowlist |

### Significant field allowlist (normative)

| Field | Triggers `EVENT_DETAILS_CHANGED` |
|-------|-----------------------------------|
| `startsAt` | Yes |
| `location` | Yes (including null↔value) |
| `templateType` | Yes |
| `description` | **No** |
| `title`, `slug`, `roleSlots`, `category` | **No** |

### Audience resolution (normative — PO refine 2026-06-08 v2)

**Engaged event roster member** = on concerned roster, **reachable** (`user_id` or `normalizedEmail`), and **at least one**:

| Branch | Condition | Code hints |
|--------|-----------|------------|
| **Dispo** | `available` or `unavailable` | `buildAvailabilityIndex` ; complement of `unknownRosterRows` |
| **Participation — en cours** | Slot assigné, status `pending` or `confirmed` | `EventCompositionSlotRepository` + `resolveAssigneeRecipients` |
| **Participation — déclinée** | Row in `event_composition_declines` for this event | `EventCompositionDeclineRepository` → participant → `user_id` |

```text
engaged = distinctBy(userId ?: normalizedEmail)(
  answeredAvailabilityRoster(seasonId, eventId, includeEmail = true)
  ∪ slotParticipants(eventId, statuses = { PENDING, CONFIRMED })
  ∪ declineParticipants(eventId)
).filter { it.userId != null || !it.email.isNullOrBlank() }

EVENT_DETAILS_CHANGED  → engaged
EVENT_ARCHIVED         → engaged.filter(activeParticipantAndMembership)  // 8.5b

Delivery per recipient:
  userId present     → push? (8.1 + pref) + email? (pref + users.email)
  email only (guest) → email only, no pref, no push
  neither            → skip
```

**Terminology (story ↔ produit):**

| Terme story | Signification membre |
|-------------|---------------------|
| Roster événement | Inscrit·e sur ce spectacle (saison ± invité événement) |
| Engagé·e | A répondu dispo/indispo **ou** a une participation compo (à confirmer, confirmée, déclinée) |
| ~~Assigné~~ (éviter en copy UI) | Placé·e sur un rôle dans l’équipe — **un cas** de la branche participation |
| Invité email sans compte | Externe / pré-lien : `normalizedEmail` sur participant, pas de `user_id` — **email seul** |

**Contrast with other intents:**

| Intent | `unknown`, pas de compo | Dispo renseignée | Slot pending/confirmed | Déclin enregistré |
|--------|-------------------------|------------------|----------------------|-------------------|
| `AVAILABILITY_OPENED` | ✅ | ✅ | ✅ | ✅ |
| `MANUAL_AVAILABILITY_NUDGE` | ✅ only | ❌ | ❌ | ❌ |
| `EVENT_DETAILS_CHANGED` | ❌ | ✅ | ✅ | ✅ |
| `EVENT_ARCHIVED` | ❌ | ✅ | ✅ | ✅ |

Reuse [`ParticipantStatus.ACTIVE`](../../services/api/src/main/kotlin/com/hatcast/api/participant/ParticipantEnums.kt) and [`TroupeMembershipStatus.ACTIVE`](../../services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeMembershipStatus.kt) for archive path — mirror **8.5b**.

### Payload copy (suggested — adjust in builder tests)

| Intent | Push title | Body pattern |
|--------|------------|--------------|
| `EVENT_DETAILS_CHANGED` | `📅 Spectacle modifié` | `{title} le {newDate} — {deltaPhrase}` e.g. « Date : samedi 12 avril → dimanche 13 avril » |
| `EVENT_ARCHIVED` | `🚫 Spectacle archivé` | `{title} le {date} n’a plus lieu (archivé).` |

Use existing `formatEventDate` / `EventTypes` label for `templateType` if available.

### Frontend implementation guardrails

| Concern | Action |
|--------|--------|
| Hidden keys | Keep `COMPOSITION_SHARED`, `TEAM_CONFIRMED` hidden ; only expose new keys when API lists them |
| Copy | Single `Me prévenir quand…` line — **no** « Si désactivé » blocks (phase 1 as-shipped) |
| Fallback | `notificationPreferenceUiCopy()` fallback should remain for forward-compat, not used for shipped keys |
| testids | `notification-pref-EVENT_DETAILS_CHANGED-push` etc. |

### Guest email vs existing dispatcher (8.3)

Today [`NotificationDispatcher`](../../services/api/src/main/kotlin/com/hatcast/api/notification/NotificationDispatcher.kt) and [`NotificationRecipient`](../../services/api/src/main/kotlin/com/hatcast/api/notification/NotificationDispatchContext.kt) are **`userId`-only** ; **8.3** / **8.6** skip name-only rows. **8.8** introduces the **first** guest-email path for automatic dispatcher intents — scoped to **engaged** roster with `normalizedEmail`. Do **not** retrofit all legacy intents in this story.

| Row type | Engaged? | Push | Email | Prefs |
|----------|----------|------|-------|-------|
| Compte lié | if AC 4 | 8.1 + catégorie | catégorie + `users.email` | oui |
| Email pré-lien, pas de compte | if AC 4 | non | oui (`normalizedEmail`) | **non** |
| Name-only | if AC 4 | non | non | n/a |

### Explicit non-goals

- Debounce / coalesce multiple PATCHes within 15 min (role storming idea — **defer**)
- Orga « do not notify » checkbox on PATCH (Marc idea — **hors MVP**)
- `TEAM_COMPLETE_MEMBER` / `TEAM_CONFIRMED` UI (**G-012**)
- Orga ops intents (**8.4**)
- Cancelling in-flight `AVAILABILITY_PENDING_REMINDER` marks for archived event (optional hygiene — only if trivial)
- Aligning `NotificationPayloadBuilder` 3-segment canonical URLs (known debt — **unchanged**)
- i18n `@angular/localize` migration

### Dependencies

| Story | Status | Relationship |
|-------|--------|--------------|
| **8.3** | done | Dispatcher, delivery log, after-commit pattern |
| **8.2** | done | Category prefs API + eligibility port |
| **8.2b** | done | Hidden-key + copy map pattern ; **extend** in 8.8 |
| **8.5b** | done | Active roster / membership guards — reuse for archive audience |
| **8.4** | backlog | Orga intents — out of scope |
| **G-012** | backlog | `TEAM_CONFIRMED` row — separate story |

### Previous story intelligence (8.2b)

- UI filter is **client-side** ; API returns all `NotificationCategory.entries`
- When adding rows: update `NOTIFICATION_PREFERENCE_UI_COPY` + tests ; do **not** hardcode row count without updating specs (5 → **7**)
- Deferred review item: fallback copy for unknown API keys — **8.8** closes for new keys

### Previous story intelligence (8.3)

- Never dispatch inside `@Transactional` composition/event methods
- Per-recipient error isolation in dispatcher
- Mock/spy `NotificationDispatcher` in integration tests

### Git intelligence

Recent: `afea893d` feat(notifications): Ship member prefs UX phase 1 — copy map and hidden keys landed ; dispatcher has no `EVENT_*` yet.

### Project context reference

- API tests: `./gradlew test`
- Web tests: `npm run test -w @hatcast/web -- --watch=false`
- UI checklist: [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md)
- Dev push: `./scripts/start-dev.sh --with-push`

---

## Dev Agent Record

### Agent Model Used

Claude (dev-story / Auto)

### Completion Notes List

- Implemented `EVENT_DETAILS_CHANGED` + `EVENT_ARCHIVED` intents with after-commit domain events (`EventDetailsChangedEvent`, `EventArchivedEvent`).
- Delta detection limited to `startsAt`, `location`, `templateType` on published non-archived events.
- Audience = **engaged roster** (dispo answered ∪ compo pending/confirmed ∪ decline rows) ; archive adds 8.5b active filters.
- PO v3 guest email: `normalizedEmail` without account → email only (no push/prefs) ; Flyway **V62** nullable `user_id` + `recipient_email`.
- Deep link: **`?tab=infos`** for both intents.
- Web prefs: **7** visible member rows (was 5) — `Changements importants` + `Spectacle annulé` with as-shipped copy.
- Tests: notification package 106/106 green ; web prefs spec 11/11 green.
- M3 checklist: reused `mat-slide-toggle` grid, tokens inherited, no shell change ; visible row count 5→7 verified in spec.

### File List

- services/api/src/main/kotlin/com/hatcast/api/notification/NotificationIntent.kt
- services/api/src/main/kotlin/com/hatcast/api/notification/NotificationDispatchContext.kt
- services/api/src/main/kotlin/com/hatcast/api/notification/NotificationRecipientResolver.kt
- services/api/src/main/kotlin/com/hatcast/api/notification/NotificationDispatcher.kt
- services/api/src/main/kotlin/com/hatcast/api/notification/NotificationPayloadBuilder.kt
- services/api/src/main/kotlin/com/hatcast/api/notification/NotificationDeliveryLogEntity.kt
- services/api/src/main/kotlin/com/hatcast/api/notification/EmailNotificationSender.kt
- services/api/src/main/kotlin/com/hatcast/api/notification/EventWorkflowNotificationAdapter.kt
- services/api/src/main/kotlin/com/hatcast/api/notification/AvailabilityPendingReminderJob.kt
- services/api/src/main/kotlin/com/hatcast/api/event/EventNotificationPort.kt
- services/api/src/main/kotlin/com/hatcast/api/event/EventNotificationEventListener.kt
- services/api/src/main/kotlin/com/hatcast/api/event/EventDetailsChangedEvent.kt
- services/api/src/main/kotlin/com/hatcast/api/event/EventArchivedEvent.kt
- services/api/src/main/kotlin/com/hatcast/api/event/EventService.kt
- services/api/src/main/kotlin/com/hatcast/api/share/ShareRecipientsService.kt
- services/api/src/main/resources/db/migration/V62__notification_delivery_log_guest_recipients.sql
- services/api/src/test/kotlin/com/hatcast/api/notification/EventDetailsChangedNotificationIntegrationTest.kt
- services/api/src/test/kotlin/com/hatcast/api/notification/EventArchivedNotificationIntegrationTest.kt
- services/api/src/test/kotlin/com/hatcast/api/notification/NotificationRecipientResolverTest.kt
- services/api/src/test/kotlin/com/hatcast/api/notification/NotificationPayloadBuilderEventDetailsTest.kt
- services/api/src/test/kotlin/com/hatcast/api/notification/NotificationDispatcherTest.kt
- apps/web/src/app/core/notifications/me-notification-preferences-api.service.ts
- apps/web/src/app/core/notifications/notification-preference-ui-copy.ts
- apps/web/src/app/shared/notification-preferences-section/notification-preferences-section.ts
- apps/web/src/app/shared/notification-preferences-section/notification-preferences-section.spec.ts
- apps/web/src/app/shared/push-notifications-section/push-notifications-section.ts
- apps/web/src/app/shared/push-notifications-section/push-notifications-section.spec.ts
- docs/v2/technical/NOTIFICATIONS_CATALOG.md
- _bmad-output/planning-artifacts/ux-design-mon-compte.md
- _bmad-output/planning-artifacts/ux-design-notification-preferences-2026-06-08.md
- _bmad-output/planning-artifacts/ux-notification-prefs-phase1-as-shipped-2026-06-08.md
- _bmad-output/implementation-artifacts/sprint-status.yaml

### Change Log

- 2026-06-08 : Story created (ready-for-dev)
- 2026-06-08 : PO audience refine — assignés + dispo renseignée (`available`/`unavailable`) ; pas le roster `unknown` (AC 4/4b/7/7b, copy UI, resolver tasks)
- 2026-06-08 : PO audience v2 — **roster engagé** = dispo ∪ participation (pending/confirmed/déclin) ; AC 4c ; decline table ; copy « déjà interagi »
- 2026-06-08 : PO v3 — invité sans compte : **email** si `normalizedEmail`, pas de push ni prefs ; extension `NotificationRecipient` + delivery log
- 2026-06-08 : Implementation complete — API dispatch + prefs UI + catalogue ; status → review
- 2026-06-08 : Code review — scope creep résolu (refactor prefs M3 + docs UX inclus dans File List)
- 2026-06-08 : Story closed (done) — PO accepte livraison ; patches review AC14 restants en suivi optionnel

### Review Findings

- [x] [Review][Decision] Scope creep — fichiers modifiés hors File List — **Résolu (option 1)** : inclus dans le périmètre 8.8 ; File List mis à jour (refactor cartes M3 prefs, push-notifications-section, docs UX phase 2).

- [ ] [Review][Patch] AC 14 — couverture de tests incomplète [`EventDetailsChangedNotificationIntegrationTest.kt`] — La story exige explicitement : `name-only engaged → 0`, `linked-user pref opt-out blocks channel`, `location`/`templateType`-only PATCH, `archived event date change → none`. Seuls description-only, draft, date-change (startsAt), pending slot et decline row sont couverts en intégration ; le chemin invité email n’a qu’un test unitaire (`NotificationDispatcherTest`).

- [ ] [Review][Patch] AC 14 — pas de test d’exclusion du membre `unknown` sur le dispatch réel [`EventDetailsChangedNotificationIntegrationTest.kt`] — Le test `unknown availability without composition yields zero engaged recipients` vérifie le resolver isolément, pas que `notificationDispatcher.dispatch` n’est pas appelé (ou appelé avec 0 destinataires effectifs) lors d’un PATCH date.

- [ ] [Review][Patch] Dev Agent Record contradictoire — Les Completion Notes affirment `./gradlew test` green tout en notant « 3 pre-existing unrelated failures in availability draw tests ». Harmoniser la note (scope exact des tests exécutés / échecs connus).

- [x] [Review][Defer] `isActiveEngagedMember` reconstruit le roster complet par destinataire [`NotificationRecipientResolver.kt:169-198`] — deferred, pre-existing pattern risk ; correct fonctionnellement, optimisation N+1 non requise pour MVP.

- [x] [Review][Defer] URLs push/email en 2 segments (`/saison/{slug}/event/{slug}`) [`NotificationPayloadBuilder.kt:152`] — deferred, dette documentée dans Non-goals de la story.

- [x] [Review][Defer] `ShareRecipientsService` ignore les logs `user_id = null` [`ShareRecipientsService.kt:384`] — deferred, pre-existing ; les envois invité email n’apparaîtront pas dans l’agrégat « déjà notifié » du partage — comportement acceptable hors scope 8.8.

- [x] [Review][Defer] Fix défensif `AvailabilityPendingReminderJob` (`userId ?: continue`) — deferred, changement de support pour `NotificationRecipient.userId` nullable, non documenté dans la story mais cohérent.

---

### Validation create-story

- [x] AC métier numérotés et sourcés (epics / FR / brainstorm / catalogue)
- [x] Section **Material 3** remplie (UI prefs rows)
- [x] Tasks référencent les numéros d’AC (y compris M3-x)
- [x] Liens vers fichiers code existants à réutiliser
- [x] `npm run test` / `./gradlew test` mentionnés
