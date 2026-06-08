---
baseline_commit: b121066b
---

# Story 8.4: Organizer ops notifications (FR31b, P2)

**Status:** review

**Story ID:** 8.4  
**Story key:** `8-4-notifications-ops-organisateurs`  
**Epic:** 8 — Notifications (push, email, preferences)  
**Priority:** **P2** post-MEP (SCP 2026-06-01, FR31b)  
**Catalogue:** [`NOTIFICATIONS_CATALOG.md`](../../docs/v2/technical/NOTIFICATIONS_CATALOG.md) § Story 8.4 + `COMPOSITION_SHARED`  
**Brainstorm:** [`brainstorming-session-2026-06-07-notifications-post-catalog.md`](../brainstorming/brainstorming-session-2026-06-07-notifications-post-catalog.md) (N3 `ASSIGNEE_DECLINED`, D4, D5:B)  
**UX prefs:** [`ux-notification-prefs-orga-section-brief.md`](../planning-artifacts/ux-notification-prefs-orga-section-brief.md) · [`ux-design-notification-preferences-2026-06-08.md`](../planning-artifacts/ux-design-notification-preferences-2026-06-08.md) § phase 3  
**Depends:** Story **8.3** (dispatcher, after-commit), **3.21** (draft/publish gate), **8.2** (prefs API), **8.2b** (UI hidden-key pattern), **8.9** (`TEAM_COMPLETE_MEMBER` — distinct intent/audience)  
**Blocks (soft):** Catalogue § FR31b → Actif ; guerilla test **S3** (Marc / déclin immédiat)

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

---

## Story

As an **event, season, or troupe organizer/admin**,  
I want **automatic ops alerts** (draft created, draft composition shared, SLA to open availability, incomplete composition cadence, team closure, immediate assignee decline),  
so that **I can coordinate the troupe without manually watching every show** (FR31b, NFR-R2).

---

## Critical distinction (do not conflate)

| | **8.4 — orga ops (`TEAM_COMPLETE`, etc.)** | **8.9 — member (`TEAM_COMPLETE_MEMBER`)** |
|--|---------------------------------------------|-------------------------------------------|
| **Intent** | `TEAM_COMPLETE` (new) | `TEAM_COMPLETE_MEMBER` (shipped) |
| **Audience** | **Organizer cascade** only (event orga → season orga → troupe admin fallback) | Event organizers **∪** confirmed/waived assignees |
| **Preference** | **Opt-in** orga categories (`ORG_*`, default OFF) | **Opt-out** member `TEAM_CONFIRMED` (default ON) |
| **Copy tone** | Ops / coordination (« Équipe bouclée » for orgas) | Celebration for people involved (« Équipe au complet ») |
| **UI section** | **Alertes organisateur** (phase 3) | **Messages pour moi** |

Same lifecycle edge `→ COMPLETE` may dispatch **both** intents independently, each filtered by its own pref model and audience.

**`COMPOSITION_SHARED` (existing enum)** = orga-only draft composition publish — **not** a member pref. Do **not** expose under member toggles (D6). Wire dispatch in 8.4; map to orga pref `ORG_DRAFT_COMPOSITION` (or reuse category key — see Dev Notes).

---

## Acceptance Criteria

### Dispatcher — intents & triggers (AC 1–10)

1. **Given** a new **draft** event is created (`EventService.create`, `availabilityOpenedAt == null`), **when** the transaction commits, **then** intent **`EVENT_DRAFT_CREATED`** is dispatched **after commit** to the **organizer cascade** for that event’s season/troupe context. [Source: epics 8.4 ; SCP §4.5 ; catalogue § 8.4]

2. **Given** an organizer **first publishes** a draft composition (`publishDraftComposition` → `DraftCompositionSharedEvent`, story **6.3**), **when** the listener runs after commit, **then** intent **`COMPOSITION_SHARED`** (existing enum — catalogue alias `DRAFT_COMPOSITION_SHARED`) dispatches to the **organizer circle** only — **not** roster, **not** assignees, **not** members. [Source: epics 8.4 « brouillon compo partagé orga only » ; `CompositionWorkflowNotificationAdapter.publishDraftCompositionShared` today DEBUG-only]

3. **Given** a **published** event still collecting availability (`availabilityOpenedAt != null`) whose **`startsAt` is within ~30 days** (configurable SLA horizon) and availability collection is **not** considered open for members (same gate as member dispos — event published), **when** the daily SLA job runs, **then** eligible **organizer cascade** recipients receive **`SLA_OPEN_AVAILABILITY`** at most once per event per civil day (dedupe via `NotificationReminderMarkService` pattern from **8.7**). [Source: catalogue § 8.4 ; SCP FR31b]

4. **Given** a **validated** composition that is **not** lifecycle-`COMPLETE`, **when** the weekly incomplete job runs and the show date is approaching (same candidate pool as presence reminders — published, non-archived, validated), **then** **`COMPOSITION_INCOMPLETE_WEEKLY`** notifies organizer cascade with cadence dedupe (≥ 7 civil days between sends per event). [Source: catalogue § 8.4]

5. **Given** the same incomplete validated composition, **when** **`startsAt` is exactly J-7** (calendar days, `Europe/Paris`, same boundary helper as `AssigneePresenceReminderJob`), **then** **`COMPOSITION_INCOMPLETE_DAILY_J7`** may notify organizer cascade (dedupe once per event for that window). [Source: catalogue § 8.4]

6. **Given** composition lifecycle transitions **`before != COMPLETE && after == COMPLETE`**, **when** `CompositionLifecycleAuditRecorder.recordIfChanged` fires (same hook as **8.9**), **then** **`TEAM_COMPLETE`** dispatches to **organizer cascade only** — **not** assignees, **not** roster. [Source: epics 8.4 « transition complete orga only » ; contrast **8.9** AC5]

7. **Given** a **validated** composition (`validatedAt != null`), **when** an assignee sets participation to **`DECLINED`** and an `event_composition_declines` row is persisted (`CompositionParticipationService`), **then** **`ASSIGNEE_DECLINED`** dispatches **immediately after commit** to organizer cascade. [Source: brainstorm N3 ; D5:B — no separate `TEAM_REGRESSED_INCOMPLETE`]

8. **Given** organizer cascade resolution for any intent in AC 1–7, **when** recipients are resolved, **then** apply **fallback cascade** (not union of all levels):
   - **If** one or more **event organizers** exist → recipients = event organizers only ;
   - **Else if** one or more **season organizers** exist → season organizers ;
   - **Else** → active **troupe admins** (`TroupeBaselineRole.TROUPE_ADMIN`, active membership).  
   Deduplicate by `userId`. Skip rows without linked `user_id` silently (no guest-email path for orga ops). Exclude the **actor** when `actorUserId` is provided (decline self-action edge). [Source: epics 8.4 ; PRD FR31b ; SCP §4.5]

9. **Given** **`COMPOSITION_SHARED`** dispatch (AC 2), **when** recipients are resolved, **then** use **organizer circle** = union of event organizers, season organizers, and troupe admins who can see draft composition (same visibility as `EventDraftVisibility` / `canManageComposition` scope) — **not** the narrow fallback cascade. Deduplicate by `userId`. [Source: catalogue « cercle orga » ; epics « orga only »]

10. **Given** any 8.4 intent, **when** domain mutation succeeds but notification delivery fails, **then** HTTP / domain state is **unchanged** ; failures logged + `notification_delivery_log` per **8.3** NFR-R2 ; per-recipient isolation in dispatcher. [Source: 8.3 ; 8.8 AC8]

### Preferences — opt-in orga model (AC 11–14)

11. **Given** a linked organizer account, **when** an orga category pref is **absent** in `users.notification_preferences`, **then** treat push and email as **OFF** (opt-in) for **`NotificationCategoryGroup.ORGANIZER_ALERTS`** categories only — member categories keep opt-out defaults (`push=true, email=true`). [Source: ux-design-notification-preferences § Niveau 2 orga ; brief orga opt-in]

12. **Given** channel eligibility for orga intents, **when** push/email is attempted, **then** apply **orga category pref** + **8.1** push gate for push ; email requires non-blank `users.email`. Push global OFF blocks orga push same as member (UX R2). [Source: ux-design-notification-preferences § Conflits membre ↔ orga]

13. **Given** story ship, **when** `GET /v1/me/notification-preferences` returns, **then** response includes:
    - **`hasOrganizerScope: boolean`** — `true` iff user is event organizer, season organizer, or troupe admin on **≥ 1** active troupe ;
    - orga categories in group **`ORGANIZER_ALERTS`** with long French API `label` (OpenAPI compat) ;
    - member categories unchanged. [Source: ux brief § Visibilité ; R6]

14. **Given** `/compte/notifications` loads, **when** **`hasOrganizerScope === false`**, **then** section **Alertes organisateur** is **absent** (Léa never sees it). **When** scope is true **and** at least one orga intent is actively dispatched in this release, **then** render section **in full** per UX brief — **no teaser**, **no placeholder** before ship (rule **A1**, PO party-mode 2026-06-08). [Source: ux-notification-prefs-orga-section-brief ; ux-design-notification-preferences § phase 3]

### Payload copy (AC 15–16)

15. **Given** each new orga intent fires, **when** push/email is built in [`NotificationPayloadBuilder`](../../services/api/src/main/kotlin/com/hatcast/api/notification/NotificationPayloadBuilder.kt), **then** use **distinct ops copy** (French, `{eventTitle}`, `{eventDate}`, `{roleLabel}` where relevant) — implement verbatim table in § Normative copy below. Deep links: `?tab=equipe` for composition-related ; `?tab=infos` for draft event / SLA ; remove existing `error("COMPOSITION_SHARED payload is story 8.4")` throws.

16. **Given** `ASSIGNEE_DECLINED`, **when** payload is built, **then** include **assignee display name**, **role**, and **event title + date** ; tone = immediate ops alert (≠ weekly incomplete reminder). [Source: brainstorm N3 ; UX « Déclin immédiat »]

### UI — Alertes organisateur section (AC 17–18, M3)

17. **Given** orga section visible (AC 14), **when** rendered, **then** third section on `/compte/notifications`:
    - Title **Alertes organisateur** ;
    - Intro *« Pour les spectacles où tu organises. Active seulement ce dont tu as besoin. »* ;
    - Same card/grid pattern as member prefs (**Cet appareil** \| **E-mail**, layout horizontal, titles outside card) ;
    - One row per **active** orga intent only (A1) — hide rows for intents not shipped ;
    - Optional visual grouping: **Signaux immédiats** (`ASSIGNEE_DECLINED`, `TEAM_COMPLETE`, `COMPOSITION_SHARED`/`ORG_DRAFT_COMPOSITION`, `EVENT_DRAFT_CREATED`) vs **Rappels planifiés** (`SLA_*`, `COMPOSITION_INCOMPLETE_*`) — subtitles only, no sub-tabs. [Source: ux brief ; as-shipped member pattern]

18. **Given** page footnote when orga section visible, **when** both member and orga sections show, **then** display once: *« Les messages membre concernent ta participation. Les alertes orga concernent la coordination — tu choisis de les activer. »* [Source: ux-design-notification-preferences R2]

### Tests & docs (AC 19–20)

19. **Given** tests run, **when** `./gradlew test` and targeted Vitest execute, **then** prove at minimum:
    - Cascade fallback (event orga only → season orga → troupe admin) ;
    - `COMPOSITION_SHARED` → organizer circle, 0 roster recipients ;
    - `TEAM_COMPLETE` on lifecycle edge vs **no** duplicate from `TEAM_COMPLETE_MEMBER` audience overlap handling (orga with pref ON gets ops copy, assignee gets member copy per their prefs) ;
    - `ASSIGNEE_DECLINED` on validated decline, **not** on draft decline ;
    - Opt-in default blocks channel when pref absent ;
    - Opt-in explicit ON delivers ;
    - SLA / weekly / J-7 jobs respect dedupe marks ;
    - Draft event create does **not** emit `AVAILABILITY_OPENED` (regression **3.21**) ;
    - UI: orga section hidden without scope ; visible with scope after ship ; S3 row **Déclin immédiat** discoverable ;
    - `./gradlew test` green ; `notification-preferences-section.spec.ts` green. [Source: project-context.md]

20. **Given** story complete, **when** catalogue is updated, **then** move FR31b intents from § Backlog → **Actif** in [`NOTIFICATIONS_CATALOG.md`](../../docs/v2/technical/NOTIFICATIONS_CATALOG.md) ; document cascade, opt-in defaults, and **`TEAM_COMPLETE` vs `TEAM_COMPLETE_MEMBER`** ; update **Prochaine revue** date. [Source: D7 ; AGENTS.md doc rule]

**Product coverage:** FR31b ; NFR-R2 ; decisions **D4** (N1 fields — not in 8.4), **D5:B** (decline only, no regression notif), **A1** (no teaser UI). **Out of scope:** `TEAM_REGRESSED_INCOMPLETE`, member inbox rows, prefs per season/troupe, guest-email orga recipients, `MANUAL_GAP_RECRUITMENT` (**6.10c**), `TROUPE_MEMBERSHIP_INVITE` (Epic 7), reactivating `TEAM_VALIDATED_FYI`.

---

## Normative copy — orga intents (implement verbatim)

| Intent | Push title | Push body (pattern) | Email subject |
|--------|------------|---------------------|---------------|
| `EVENT_DRAFT_CREATED` | `📝 Nouveau brouillon` | `Un spectacle brouillon « {eventTitle} » vient d'être créé.` | `Nouveau brouillon · {eventTitle}` |
| `COMPOSITION_SHARED` | `👥 Brouillon partagé` | `La composition brouillon pour {eventTitle} le {eventDate} est visible dans le cercle orga.` | `Brouillon partagé · {eventTitle} ({eventDate})` |
| `SLA_OPEN_AVAILABILITY` | `⏰ Ouvrir les dispos` | `{eventTitle} le {eventDate} approche — les disponibilités ne sont pas encore ouvertes.` | `Ouvrir les dispos · {eventTitle} ({eventDate})` |
| `COMPOSITION_INCOMPLETE_WEEKLY` | `⚠️ Compo incomplète` | `Des places manquent encore pour {eventTitle} le {eventDate}.` | `Compo incomplète · {eventTitle} ({eventDate})` |
| `COMPOSITION_INCOMPLETE_DAILY_J7` | `⚠️ Compo incomplète (J-7)` | `J-7 pour {eventTitle} — la composition n'est pas complète.` | `Compo incomplète J-7 · {eventTitle} ({eventDate})` |
| `TEAM_COMPLETE` | `✅ Équipe bouclée` | `Toutes les confirmations sont reçues pour {eventTitle} le {eventDate}.` | `Équipe bouclée · {eventTitle} ({eventDate})` |
| `ASSIGNEE_DECLINED` | `🚨 Déclin` | `{assigneeName} a décliné ({roleLabel}) pour {eventTitle} le {eventDate}.` | `Déclin · {eventTitle} ({eventDate})` |

**UI pref rows** (description pattern « Me prévenir quand… » — opt-in wording):

| API category key | UI title | UI description |
|------------------|----------|----------------|
| `ORG_ASSIGNEE_DECLINED` | **Déclin immédiat** | Me prévenir quand quelqu'un décline après validation de la compo. |
| `ORG_TEAM_COMPLETE` | **Équipe bouclée** | Me prévenir quand toutes les confirmations sont reçues. |
| `ORG_COMPOSITION_INCOMPLETE` | **Compo incomplète** | Me prévenir si des places manquent (rappels hebdo et à J-7). |
| `ORG_SLA_OPEN_AVAILABILITY` | **Ouvrir les dispos** | Me prévenir quand un spectacle approche (~1 mois) sans dispos ouvertes. |
| `ORG_DRAFT_COMPOSITION` | **Brouillon partagé** | Me prévenir quand un brouillon de compo est partagé dans le cercle orga. |
| `ORG_EVENT_DRAFT_CREATED` | **Nouveau brouillon** | Me prévenir quand un spectacle brouillon est créé. |

Map intents → categories: one orga category may cover multiple intents (e.g. `ORG_COMPOSITION_INCOMPLETE` ← `COMPOSITION_INCOMPLETE_WEEKLY` + `COMPOSITION_INCOMPLETE_DAILY_J7`).

---

## Acceptance Criteria — Material 3 (UI)

**M3-1. Material components** — **Given** orga preference rows, **when** rendered, **then** reuse `mat-slide-toggle` grid from [`notification-preferences-section`](../../apps/web/src/app/shared/notification-preferences-section/notification-preferences-section.ts) — no custom toggles. [Source: FRONTEND_UI.md ; 8.2b/8.9]

**M3-2. Tokens & theme** — **Given** orga section, **when** styled, **then** `--mat-sys-*` tokens only ; match member card amendement 2026-06-08 (titles outside card). [Source: as-shipped member prefs]

**M3-3. Mobile & touch** — **Given** viewport ≤ 480px, **when** orga rows render, **then** horizontal layout preserved ; toggles ≥ 48dp ; French `aria-label` on switches. [Source: NFR-A1]

**M3-4. Member navigation** — **Given** `/compte/notifications`, **when** adding orga section, **then** do not change account shell / tabs / rail. [Source: 8.2b M3-4]

**M3-5. Review** — **Given** implementation done, **when** validating, **then** FRONTEND_UI.md § Checklist M3 ; confirm **zero** orga rows visible before API dispatch ships (A1 audit). [Source: AGENTS.md]

---

## Tasks / Subtasks

- [x] **Scope:** `services/api/` + `apps/web/` + `docs/v2/technical/NOTIFICATIONS_CATALOG.md` + OpenAPI

### API — model & prefs (AC: 11–13)

- [x] Extend [`NotificationIntent.kt`](../../services/api/src/main/kotlin/com/hatcast/api/notification/NotificationIntent.kt): add `EVENT_DRAFT_CREATED`, `SLA_OPEN_AVAILABILITY`, `COMPOSITION_INCOMPLETE_WEEKLY`, `COMPOSITION_INCOMPLETE_DAILY_J7`, `TEAM_COMPLETE`, `ASSIGNEE_DECLINED` ; wire `COMPOSITION_SHARED` (existing).
- [x] Extend [`NotificationCategory`](../../services/api/src/main/kotlin/com/hatcast/api/notification/NotificationIntent.kt): add `ORG_*` keys + `NotificationCategoryGroup.ORGANIZER_ALERTS`.
- [x] Update `NotificationIntent.toCategory()` mappings (including mapping both incomplete intents → `ORG_COMPOSITION_INCOMPLETE`).
- [x] Extend [`UserNotificationPreferencesService`](../../services/api/src/main/kotlin/com/hatcast/api/notification/UserNotificationPreferencesService.kt): opt-in defaults for `ORGANIZER_ALERTS` group ; add `hasOrganizerScope(userId)` (query event/season organizer tables + troupe admin memberships).
- [x] Extend [`NotificationPreferencesResponseDto`](../../services/api/src/main/kotlin/com/hatcast/api/notification/dto/NotificationPreferenceDtos.kt) + OpenAPI with `hasOrganizerScope`.
- [x] Extend [`NotificationPreferenceEligibilityAdapter`](../../services/api/src/main/kotlin/com/hatcast/api/notification/UserNotificationPreferencesService.kt) if default resolution moves to service layer.

### API — recipient resolution (AC: 8–9)

- [x] Extend [`NotificationRecipientResolver`](../../services/api/src/main/kotlin/com/hatcast/api/notification/NotificationRecipientResolver.kt):
  - `resolveOrganizerCascadeRecipients(eventId, seasonId, troupeId, actorUserId?)` — fallback cascade ;
  - `resolveOrganizerCircleRecipients(eventId, seasonId, troupeId, actorUserId?)` — union for draft compo ;
  - Inject `SeasonOrganizerRepository`, `TroupeMembershipRepository` (or dedicated query for active `TROUPE_ADMIN`).
- [x] Wire branches in [`NotificationDispatcher.resolveRecipients`](../../services/api/src/main/kotlin/com/hatcast/api/notification/NotificationDispatcher.kt) — replace `COMPOSITION_SHARED → emptyList()`.

### API — triggers & jobs (AC: 1–7, 10)

- [x] **Draft event:** domain event from [`EventService.create`](../../services/api/src/main/kotlin/com/hatcast/api/event/EventService.kt) → `EventNotificationEventListener` AFTER_COMMIT → `EVENT_DRAFT_CREATED`.
- [x] **Draft compo:** implement dispatch in [`CompositionWorkflowNotificationAdapter.publishDraftCompositionShared`](../../services/api/src/main/kotlin/com/hatcast/api/notification/CompositionWorkflowNotificationAdapter.kt) (listener already exists).
- [x] **Team complete orga:** extend [`CompositionLifecycleAuditRecorder`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionLifecycleAuditRecorder.kt) to publish `TeamCompleteOrganizerRequestedEvent` on same edge as 8.9 (separate event type — do not reuse `TeamCompleteMemberRequestedEvent`).
- [x] **Decline:** publish `AssigneeDeclinedEvent` from [`CompositionParticipationService`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionParticipationService.kt) when `DECLINED` + validated composition ; listener dispatches `ASSIGNEE_DECLINED`.
- [x] **Schedulers** (pattern [`AvailabilityPendingReminderJob`](../../services/api/src/main/kotlin/com/hatcast/api/notification/AvailabilityPendingReminderJob.kt)):
  - `OrganizerSlaOpenAvailabilityJob` — daily, ~30d horizon, published-not-open dispos SLA ;
  - `CompositionIncompleteReminderJob` — weekly + J-7 branches, validated + not COMPLETE ;
  - Use `NotificationReminderMarkService` for dedupe ; afterCommit batch dispatch.
- [x] Implement payloads in [`NotificationPayloadBuilder`](../../services/api/src/main/kotlin/com/hatcast/api/notification/NotificationPayloadBuilder.kt) — remove 8.4 `error(...)` stubs for `COMPOSITION_SHARED`.

### API — tests (AC: 19)

- [x] Integration: `OrganizerOpsNotificationIntegrationTest` (cascade, dual TEAM_COMPLETE, decline, draft regression).
- [x] Unit: `NotificationRecipientResolverTest` cascade + circle ; `NotificationPayloadBuilderOrganizerOpsTest` copy tests.
- [x] Regression: `TEAM_COMPLETE_MEMBER` tests still green ; `COMPOSITION_SHARED` dispatcher test updated ; `EventOpenAvailabilityNotificationIntegrationTest` regression 3.21.
- [x] Run `./gradlew test` — all `com.hatcast.api.notification.*` green ; 3 failures hors scope (`AvailabilityControllerIntegrationTest` ×2, `CompositionDrawIntegrationTest` ×1 — `chancePercent` null, branche `v2` préexistant).

### Web — prefs UI (AC: 14, 17–18, M3)

- [x] Extend [`me-notification-preferences-api.service.ts`](../../apps/web/src/app/core/notifications/me-notification-preferences-api.service.ts): orga keys + `hasOrganizerScope` + group `ORGANIZER_ALERTS`.
- [x] Add [`notification-preference-orga-ui-copy.ts`](../../apps/web/src/app/core/notifications/notification-preference-orga-ui-copy.ts) (or extend existing copy map) with `ORG_*` rows + order arrays.
- [x] Extend [`notification-preferences-section.ts`](../../apps/web/src/app/shared/notification-preferences-section/notification-preferences-section.ts): conditional third section ; filter to dispatched keys only ; opt-in copy (« Active… » not « Désactive… »).
- [x] Update [`notification-preferences-section.spec.ts`](../../apps/web/src/app/shared/notification-preferences-section/notification-preferences-section.spec.ts): scope false → 2 sections ; scope true → 3 sections ; S3 **Déclin immédiat** row + copy.
- [x] Run `npm run test -w @hatcast/web -- --watch=false --include "**/notification-preferences-section.spec.ts"` — 15/15.

### Docs (AC: 20)

- [x] Move FR31b intents to **Actif** in catalogue ; add § Organizer cascade + opt-in matrix ; link UX brief.

---

## Dev Notes

### Current state (must read before coding)

| Area | Today |
|------|--------|
| `COMPOSITION_SHARED` | Enum + category exist ; dispatcher returns **emptyList()** ; payload **throws** if called |
| `publishDraftCompositionShared` | [`CompositionWorkflowNotificationAdapter`](../../services/api/src/main/kotlin/com/hatcast/api/notification/CompositionWorkflowNotificationAdapter.kt) DEBUG log only ; `DraftCompositionSharedEvent` + AFTER_COMMIT listener wired |
| Organizer recipients | **No** cascade resolver — only `eventOrganizerRepository` used in `resolveTeamCompleteMemberRecipients` |
| Member `TEAM_COMPLETE` | Shipped as **`TEAM_COMPLETE_MEMBER`** (**8.9**) — do not rename ; add sibling **`TEAM_COMPLETE`** for orga |
| Prefs defaults | All categories opt-out (`NotificationPreference()` = push+email **true** when absent) |
| Prefs UI | Two member sections only ; `COMPOSITION_SHARED` in `MEMBER_HIDDEN_NOTIFICATION_PREFERENCE_KEYS` |
| Decline | [`CompositionParticipationService`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionParticipationService.kt) writes decline row — **no** notification hook |
| Event create | [`EventService.create`](../../services/api/src/main/kotlin/com/hatcast/api/event/EventService.kt) — audit only, no notification |
| Scheduled jobs | Patterns in **8.7** (`AvailabilityPendingReminderJob`) and **8.5** (`AssigneePresenceReminderJob`) |

### Organizer cascade (normative)

```text
resolveOrganizerCascade(eventId, seasonId, troupeId):
  eventOrgas = eventOrganizerRepository.findByEvent_IdOrderByGrantedAtAsc(eventId)
  if eventOrgas.isNotEmpty():
    return distinct userIds(eventOrgas)
  seasonOrgas = seasonOrganizerRepository.findBySeason_IdOrderByGrantedAtAsc(seasonId)
  if seasonOrgas.isNotEmpty():
    return distinct userIds(seasonOrgas)
  return activeTroupeAdminUserIds(troupeId)
```

**Organizer circle** (draft composition shared): union of all three levels (event + season + troupe admin), deduped — people who can see draft compo per `EventDraftVisibility`.

### Lifecycle hook — dual dispatch on COMPLETE

```text
recordIfChanged(...):
  if before != COMPLETE && after == COMPLETE:
    publish TeamCompleteMemberRequestedEvent      // 8.9 — existing
    publish TeamCompleteOrganizerRequestedEvent   // 8.4 — new
```

Listeners remain separate ; each calls dispatcher with different intent → different resolver → different pref category.

### Incomplete composition eligibility (normative)

Candidate event for weekly / J-7 orga reminders:

- `archived == false`
- `validatedAt != null` (composition validated)
- lifecycle **not** `COMPLETE` (use `CompositionLifecycleService.computeRawLifecycle` or enriched status)
- published (`availabilityOpenedAt != null`) for SLA job ; SLA additionally requires dispos **not** open — align with product: « dispos fermées » = draft OR published-but-closed if such state exists ; **minimum**: draft events within 30d window (no `AVAILABILITY_OPENED` yet)

Document chosen SLA predicate in Dev Agent Record if ambiguous.

### Opt-in pref implementation sketch

```kotlin
// UserNotificationPreferencesService.isChannelAllowed
val preference = user.notificationPreferences[category]
    ?: if (category.group == NotificationCategoryGroup.ORGANIZER_ALERTS) {
        NotificationPreference(push = false, email = false)
    } else {
        NotificationPreference() // member opt-out default
    }
```

UI toggles for orga: **unchecked** when absent/false ; PATCH `push: true` / `email: true` to opt in.

### Architecture compliance

| Rule | Implementation |
|------|----------------|
| After-commit only | Domain events → `@TransactionalEventListener(AFTER_COMMIT)` ; jobs register `TransactionSynchronization.afterCommit` |
| Pref = dispatch (A1) | Ship each orga intent **with** its UI row in same release ; no teaser section |
| Orga ≠ member prefs | Disjoint category keys ; no cross-filter |
| Inbox ≠ send log | No `MeInbox` writes |
| NFR-R2 | Per-recipient try/catch in dispatcher (8.3 review pattern) |
| Publish before ping (members) | Orga draft/create intents must **not** notify roster members |

### Explicit non-goals

- `TEAM_REGRESSED_INCOMPLETE` (D5:B)
- Exposing `COMPOSITION_SHARED` under member prefs (remains hidden / orga-only)
- Inbox badge / notification history UI
- Per-troupe or per-season pref scoping
- Rich HTML email upgrade
- Auto `MANUAL_GAP_RECRUITMENT` post-decline

### Dependencies

| Story | Status | Relationship |
|-------|--------|--------------|
| 8.3 | done | Dispatcher, delivery log, after-commit pattern |
| 3.21 | done | Draft vs published gate |
| 8.2 / 8.2b | done | Prefs API + member UI pattern |
| 8.8 | done | Parallel member intent pattern |
| 8.9 | done | **`TEAM_COMPLETE_MEMBER`** — do not merge with orga `TEAM_COMPLETE` |
| 8.7 | done | Scheduler + dedupe reference |

### Previous story intelligence (8.9, 8.8, 8.3)

- **8.9:** Lifecycle hook in `CompositionLifecycleAuditRecorder` is the correct central trigger ; separate event types per audience ; dedupe by `userId` ; leave dead `TEAM_VALIDATED_FYI` path alone.
- **8.8:** Guest-email path **not** needed for orga ops ; engaged-roster resolver pattern is member-only.
- **8.3:** Never call `NotificationDispatcher` inside `@Transactional` services ; `CompositionWorkflowNotificationAdapter` is the composition notification façade.

### Git intelligence (recent Epic 8)

| Commit | Relevance |
|--------|-----------|
| `b121066b` feat(notifications): Ship team complete member alerts | **`TEAM_COMPLETE_MEMBER`** pattern to mirror for orga sibling |
| `8d45541f` feat(notifications): Dispatch event details and archive alerts | Member intent + unhide pref row same release |
| `a91bd7c2` / `afea893d` | Prefs card layout + copy map — reuse for orga section |

### Latest tech notes

- **Spring `@Scheduled`:** cron + `zone = "Europe/Paris"` (existing jobs) — keep consistency.
- **Angular 21.2 / Material 21.2:** inline template in `notification-preferences-section` — extend, do not fork.
- **Flyway:** next migration only if new columns needed (unlikely — prefs JSON map already flexible) ; delivery log unchanged.

### Project context reference

- Tests: `./gradlew test` ; `npm run test -w @hatcast/web -- --watch=false`
- Push recette: `./scripts/start-dev.sh --with-push`
- UI checklist: [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md)

---

## Dev Agent Record

### Agent Model Used

Composer (Cursor)

### Completion Notes List

- SLA predicate : brouillons (`availabilityOpenedAt == null`) dont `startsAt` ∈ [aujourd'hui ; +30j] ; dedupe civil day via `NotificationReminderMarkService`.
- `TEAM_COMPLETE` orga et `TEAM_COMPLETE_MEMBER` membre dispatchés indépendamment sur le même edge lifecycle.
- `COMPOSITION_SHARED` → cercle orga (union) ; intents cascade → fallback event → season → troupe admin.
- Prefs orga opt-in (défaut OFF/OFF) ; `hasOrganizerScope` sur GET prefs ; section UI **Alertes organisateur** conditionnelle (A1).
- Tests notification : package `com.hatcast.api.notification.*` 100 % vert ; Vitest prefs 15/15.
- `./gradlew test` complet : 838/841 — 3 échecs availability/chances hors scope story (préexistants branche `v2`).

### File List

- services/api/src/main/kotlin/com/hatcast/api/notification/NotificationIntent.kt
- services/api/src/main/kotlin/com/hatcast/api/notification/NotificationDispatchContext.kt
- services/api/src/main/kotlin/com/hatcast/api/notification/NotificationRecipientResolver.kt
- services/api/src/main/kotlin/com/hatcast/api/notification/NotificationDispatcher.kt
- services/api/src/main/kotlin/com/hatcast/api/notification/NotificationPayloadBuilder.kt
- services/api/src/main/kotlin/com/hatcast/api/notification/UserNotificationPreferencesService.kt
- services/api/src/main/kotlin/com/hatcast/api/notification/dto/NotificationPreferencesDtos.kt
- services/api/src/main/kotlin/com/hatcast/api/notification/CompositionWorkflowNotificationAdapter.kt
- services/api/src/main/kotlin/com/hatcast/api/notification/EventWorkflowNotificationAdapter.kt
- services/api/src/main/kotlin/com/hatcast/api/notification/NotificationReminderMarkService.kt
- services/api/src/main/kotlin/com/hatcast/api/notification/OrganizerSlaOpenAvailabilityJob.kt
- services/api/src/main/kotlin/com/hatcast/api/notification/CompositionIncompleteReminderJob.kt
- services/api/src/main/kotlin/com/hatcast/api/event/EventDraftCreatedEvent.kt
- services/api/src/main/kotlin/com/hatcast/api/event/EventService.kt
- services/api/src/main/kotlin/com/hatcast/api/event/EventRepository.kt
- services/api/src/main/kotlin/com/hatcast/api/event/EventNotificationPort.kt
- services/api/src/main/kotlin/com/hatcast/api/event/EventNotificationEventListener.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/CompositionLifecycleAuditRecorder.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/CompositionNotificationEvents.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/CompositionNotificationPort.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/CompositionNotificationEventListener.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/CompositionParticipationService.kt
- services/api/src/main/kotlin/com/hatcast/api/organizer/OrganizerRepositories.kt
- services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeMembershipRepository.kt
- services/api/openapi/notification-preferences.yaml
- services/api/src/test/kotlin/com/hatcast/api/notification/OrganizerOpsNotificationIntegrationTest.kt
- services/api/src/test/kotlin/com/hatcast/api/notification/OrganizerSlaOpenAvailabilityJobTest.kt
- services/api/src/test/kotlin/com/hatcast/api/notification/CompositionIncompleteReminderJobTest.kt
- services/api/src/test/kotlin/com/hatcast/api/notification/NotificationPayloadBuilderOrganizerOpsTest.kt
- services/api/src/test/kotlin/com/hatcast/api/notification/NotificationRecipientResolverTest.kt
- services/api/src/test/kotlin/com/hatcast/api/notification/NotificationDispatcherTest.kt
- services/api/src/test/kotlin/com/hatcast/api/notification/EventOpenAvailabilityNotificationIntegrationTest.kt
- services/api/src/test/kotlin/com/hatcast/api/notification/MeNotificationPreferencesIntegrationTest.kt
- services/api/src/test/kotlin/com/hatcast/api/notification/NotificationPreferenceEligibilityAdapterTest.kt
- apps/web/src/app/core/notifications/me-notification-preferences-api.service.ts
- apps/web/src/app/core/notifications/notification-preference-orga-ui-copy.ts
- apps/web/src/app/core/notifications/notification-preference-ui-copy.ts
- apps/web/src/app/shared/notification-preferences-section/notification-preferences-section.ts
- apps/web/src/app/shared/notification-preferences-section/notification-preferences-section.spec.ts
- docs/v2/technical/NOTIFICATIONS_CATALOG.md
- _bmad-output/implementation-artifacts/sprint-status.yaml

### Change Log

- 2026-06-08 : Story created (bmad-create-story).
- 2026-06-08 : Story 8.4 implemented — orga ops notifications, prefs opt-in, UI section, catalogue.

---

### Validation create-story

- [x] AC métier numérotés et sourcés (epics / FR31b / UX / brainstorm)
- [x] Section **Material 3** remplie
- [x] Tasks référencent les numéros d'AC (y compris M3-x)
- [x] Liens vers fichiers code existants à réutiliser
- [x] `./gradlew test` / Vitest mentionnés
- [x] Distinction **`TEAM_COMPLETE` orga vs `TEAM_COMPLETE_MEMBER`** explicite
- [x] Règle **A1** — pas de teaser UI orga avant dispatch
