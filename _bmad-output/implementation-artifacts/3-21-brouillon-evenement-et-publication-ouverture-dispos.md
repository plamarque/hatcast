# Story 3.21: Event draft and publish — open for availability

Status: done

baseline_commit: 543688673843322b8c02d858c85d1b1c32b10432

**Story ID:** 3.21  
**Story key:** `3-21-brouillon-evenement-et-publication-ouverture-dispos`  
**Epic:** 3 — Seasons, events, and league workspace  
**Priority:** **P0 MEP** — **blocks Story 8.3**  
**SCP:** [sprint-change-proposal-2026-06-01-notifications-epic8-scope.md](../planning-artifacts/sprint-change-proposal-2026-06-01-notifications-epic8-scope.md)  
**Depends:** 3.2, 3.4, 3.5, 3.8 (done)  
**Blocks:** 8.3 (AVAILABILITY_OPENED dispatch)

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

---

## Story

As a **season or event organizer**,  
I want events to start in **draft** and be **published** when I am ready to collect availability,  
so that I can configure venue, description, roster, and pre-seeded composition slots **without notifying members or accepting premature availability deposits**.

---

## Acceptance Criteria

### Domain gate — draft vs open (AC 1–3)

1. **Given** a **new event**, **when** it is created via `POST /v1/seasons/{seasonId}/events`, **then** `availabilityOpenedAt` is **null** (draft), members **cannot** write availability (`PUT …/availability/me` or proxy `PUT …/participants/{id}/availability`), and **no** `AVAILABILITY_OPENED` notification hook fires (FR31 ; Story 8.3). [Source: epics § 3.21 ; SCP § 4.3]

2. **Given** a **draft** event, **when** an authorized organizer executes **open availability** (`POST …/events/{eventId}/actions/open-availability`), **then** `availabilityOpenedAt` is set (idempotent if already open), roster participants **may** deposit availability, audit records the transition, and an **`EventAvailabilityOpenedEvent`** is published **after commit** for Story **8.3** to consume — **3.21 does not send push/email**. [Source: epics § 3.21 ; SCP § 4.3–4.4]

3. **Given** a **draft** event, **when** an organizer edits venue, description, roster, role slots, category, or pre-seeds composition slots (manual assign, draw prep), **then** all existing organizer flows remain allowed; **ordinary members** do not see the event at all (see AC 8–9) — no list row, no detail route, no availability surface. [Source: epics § 3.21 AC3 ; **PO decision 2026-06-01** : masquer aux membres]

4. **Given** existing production-like rows before this migration, **when** Flyway runs, **then** events that already have `event_availability` rows **or** were created before the migration are backfilled with `availabilityOpenedAt = created_at` (preserve current behaviour); events with **no** availability rows may remain draft or be opened per seed script — document choice in migration comment. [Source: brownfield safety ; bootstrap epic 17 “preparing” events]

### API contracts (AC 5–8)

5. **Given** `EventResponse` / OpenAPI `Event`, **when** serialized, **then** include nullable `availabilityOpenedAt` (ISO 8601 UTC) ; `null` ⇒ draft. Do **not** reuse `event_compositions.published_at` (composition draft publish — Story 6.3). [Source: `EventCompositionEntity.publishedAt` vs event gate]

6. **Given** a caller without open-availability permission, **when** they call `open-availability`, **then** `403` with French Problem Details. Authorized actors: **troupe administrator**, **season organizer**, or **event organizer** for that event — same scope as `OrganizerAccessService.canManageComposition` (not `canEditEvent` alone: season organizers may open but not edit event metadata). [Source: FR34 ; `OrganizerAccessService.kt`]

7. **Given** a draft event, **when** a non-organizer member **writes** availability or loads **summary** (`GET …/availability/summary`), **then** **`403`** with French message (*spectacle en brouillon…*). **Given** the same member calls **`GET …/events/{id}`** or **`GET …/by-slug/{slug}`**, **then** **`200`** with event payload (lien direct / favori) — bandeau client, pas de dépôt dispo. [Source: PO 2026-06-01 session — partial visibility via URL]

8. **Given** `GET …/events` list (agenda, historique, `user-agenda` cross-troupe feeds), **when** the caller is an **ordinary member** (not troupe admin, season organizer, nor event organizer for that row), **then** **exclude** rows where `availabilityOpenedAt IS NULL` — drafts are **organizer-visible only**. Troupe admins / season organizers / event organizers for the event **see** draft rows with badge **`draft`**. [Source: **PO decision 2026-06-01** ; `EventService.listForSeason`]

9. **Given** list/detail responses for **organizer-visible** draft events, **when** enriching `teamStatusBadge`, **then** expose badge key **`draft`** (French label *Brouillon*) — **not** `collecting`. After open, normal lifecycle badges apply. [Source: `TeamStatusBadgeMapper` today maps `PREPARING → COLLECTING`]

10. **Given** a **published** event, **when** an authorized organizer executes **close availability** (`POST …/actions/close-availability`), **then** `availabilityOpenedAt` is cleared (idempotent if already draft), audit **`EVENT_AVAILABILITY_CLOSED`**, member lists hide the row again ; existing `event_availability` rows are **retained**. [Source: PO 2026-06-01 session]

### UI — event workspace (AC 11–12)

11. **Given** event detail (`/saison/:slug/evenement/:eventSlug`), **when** spectacle is draft and user **can publish** (`canManageComposition`), **then** show **`app-event-detail-draft-banner`** **above tabs** : chip *Brouillon*, copy orga, CTA **« Publier le spectacle »** → confirm → open → snack ; optional **`ShareAnnounceDialog`** (6.10). **When** member (no publish right), **then** same bandeau **without** CTA. After publish or revert, UI updates **without full page refresh** (dialog returns `EventResponse`). [Source: [ux-event-draft-publish-3-21.md](../planning-artifacts/ux-event-draft-publish-3-21.md)]

12. **Given** season **Agenda** / **user-agenda** lists, **when** data is loaded for an ordinary member, **then** draft events are **absent** from the list (server-side filter). Organizers see draft cards with **`agenda-card--draft`** styling + badge *Brouillon*. **Mon agenda** : `isEventDraft()` must **not** treat missing `availabilityOpenedAt` as draft — use `teamStatusBadge.key === 'draft'` only. [Source: AC8 ; correctif 2026-06-01]

### Notification hook only (AC 13)

13. **Given** Story 3.21 scope, **when** `open-availability` succeeds, **then** wire `EventNotificationPort.publishAvailabilityOpened(…)` with **NoOp** implementation (log at DEBUG) — **do not** implement push/email/web-push send (Story **8.3**). Reuse Spring `@TransactionalEventListener(AFTER_COMMIT)` pattern from [`CompositionNotificationEventListener.kt`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionNotificationEventListener.kt). [Source: Story 8.1 AC6 ; SCP § 4.4]

### Audit (AC 14)

14. **Given** open or close availability succeeds, **when** audit is written, **then** `EVENT_AVAILABILITY_OPENED` / **`EVENT_AVAILABILITY_CLOSED`** with `before`/`after` including `availabilityOpenedAt` ; French labels in `AuditActionLabels.kt`. [Source: Story 9.0 pattern ; FR35]

### Tests (AC 15)

15. **Given** implementation complete, **when** tests run, **then** API + Vitest pass ; integration asserts: member list **excludes** draft ; member `GET by-slug` → **200** on draft (not 404) ; member availability write → **403** ; close-availability lifecycle ; `isEventDraft` without `availabilityOpenedAt` on Mon agenda items. [Source: project-context.md]

**Product coverage:** FR12–FR14 (event lifecycle gate), FR31 prep, FR28 `preparing` semantics, FR35 audit ; **Out of scope:** FR31 delivery (8.3), FR31b draft-create orga alert (8.4), public visitor pages (4.2).

**In scope (PO 2026-06-01 session):** `close-availability`, remise en brouillon via modale Modifier, bandeau au-dessus des onglets, lien direct membre + bandeau, seed **V48**, refresh UI sans F5.

---

## Acceptance Criteria — Material 3 (UI)

**M3-1. Material components** — Draft chip: `mat-chip` or `mat-chip-set` ; publish action: `mat-flat-button` or `mat-stroked-button` ; confirm: existing [`ConfirmDialog`](../../apps/web/src/app/pages/seasons-list/confirm-dialog.ts). No member-facing draft empty state required (drafts hidden server-side). [Source: FRONTEND_UI.md ; UX-DR11]

**M3-2. Tokens & theme** — Badge/chip colors via `var(--mat-sys-*)` ; draft tone distinct from `collecting` / `preparing` composition badges (define `--hatcast-event-draft-*` only if needed in feature SCSS using `color-mix` on sys tokens). [Source: FRONTEND_UI.md]

**M3-3. Mobile & touch** — **« Publier le spectacle »** (bandeau + modale) and confirm dialog actions ≥ **48×48 dp** at ≤ 480px ; French `aria-label` on icon-only admin menu entries unchanged. [Source: NFR-A1]

**M3-4. Member navigation** — **N/A** for global chrome ; do not add bottom app bar. Event detail keeps existing tab strip. [Source: ux-hub-a-faire.md]

**M3-5. Review** — Walk FRONTEND_UI.md § Checklist M3 ; note draft badge color choice in Dev Agent Record. [Source: AGENTS.md]

---

## Tasks / Subtasks

- [x] **Scope:** `services/api/` + `apps/web/` — not `legacy/`.

- [x] **Flyway migration** `V45__event_availability_opened_at.sql` (AC: 1, 4, 5)
  - [x] Add `events.availability_opened_at TIMESTAMPTZ NULL`.
  - [x] Backfill: `UPDATE events SET availability_opened_at = created_at WHERE EXISTS (SELECT 1 FROM event_availability ea WHERE ea.event_id = events.id)` ; optionally open all non-archived seed events — align with `V34`/`V36` bootstrap.
  - [x] Index optional (low cardinality) — not required for MEP.

- [x] **API — entity & DTO** (AC: 1, 5)
  - [x] `EventEntity.availabilityOpenedAt: Instant?`
  - [x] `EventResponseDto`, OpenAPI [`events.yaml`](../../services/api/openapi/events.yaml), TS [`EventResponse`](../../apps/web/src/app/core/events/event-api.service.ts).
  - [x] Helper `EventEntity.isAvailabilityOpen(): Boolean = availabilityOpenedAt != null`.

- [x] **API — open action** (AC: 2, 6, 12, 13)
  - [x] `EventService.openAvailability(seasonId, eventId, principal)` — reject if archived ; idempotent if already open.
  - [x] `POST /v1/seasons/{seasonId}/events/{eventId}/actions/open-availability` in [`EventController.kt`](../../services/api/src/main/kotlin/com/hatcast/api/event/EventController.kt).
  - [x] Register path in [`SecurityConfig.kt`](../../services/api/src/main/kotlin/com/hatcast/api/config/SecurityConfig.kt) ; CSRF on POST.
  - [x] `OrganizerAccessService.canOpenAvailability` (= `canManageComposition` scope) or inline equivalent.
  - [x] Publish `EventAvailabilityOpenedEvent` ; `EventNotificationPort` + `NoOpEventNotificationAdapter`.
  - [x] Audit `EVENT_AVAILABILITY_OPENED`.

- [x] **API — member visibility filter** (AC: 7, 8)
  - [x] `EventService.listForSeason`: exclude `availability_opened_at IS NULL` when caller lacks organizer visibility on that event/season (inject `OrganizerAccessService` or visibility helper).
  - [x] `getById` / `getBySlug`: membres actifs peuvent lire un brouillon (lien direct) ; listes restent filtrées.
  - [x] Apply same rule to **user agenda** event queries if a dedicated repository path exists (search `user-agenda` API consumer).
  - [x] Helper `canViewDraftEvent(eventId, seasonId, principal)` = troupe admin OR season organizer OR event organizer.

- [x] **API — availability guards** (AC: 1, 3, 7)
  - [x] Replace/extend `requireEditableEvent` in [`AvailabilityService.kt`](../../services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityService.kt) with `requireAvailabilityOpenForWrite(event)` on `setMyStatus` / `setParticipantStatus`.
  - [x] `getSummary`: if draft && !organizer → `404`/`403` ; if draft && organizer → OK.
  - [x] `loadAuthorizedEvent` path for members on draft → fail before summary (consistent with detail 404).

- [x] **API — lifecycle badge** (AC: 9)
  - [x] Extend [`TeamStatusBadgeKey`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionLifecycle.kt) with `DRAFT` (API key `draft`) **or** compute in `CompositionLifecycleEnrichmentService` when event closed — prefer enrichment layer to avoid conflating composition lifecycle enum.
  - [x] Mirror in [`composition-lifecycle.ts`](../../apps/web/src/app/core/composition/composition-lifecycle.ts) + SCSS modifier `.composition-status-badge--draft`.

- [x] **API — close action** (AC: 10, 14)
  - [x] `EventService.closeAvailability` + `POST …/close-availability` + audit `EVENT_AVAILABILITY_CLOSED`.
  - [x] OpenAPI + `EventApiService.closeAvailability`.

- [x] **Web — event detail** (AC: 11–12, M3)
  - [x] [`event-detail-draft-banner`](../../apps/web/src/app/pages/event-detail/event-detail-draft-banner.ts) above tabs ; CTA **Publier le spectacle**.
  - [x] [`event-form-dialog`](../../apps/web/src/app/pages/season-home/event-form-dialog.ts): toggles publier / remettre en brouillon ; retour `EventResponse` → refresh sans F5.
  - [x] [`event-dispos-tab`](../../apps/web/src/app/shared/availability/event-dispos-tab.ts): message membre si brouillon.
  - [x] [`event-draft.ts`](../../apps/web/src/app/core/events/event-draft.ts): `isEventDraft` safe when `availabilityOpenedAt` absent (Mon agenda).

- [x] **Web — agenda cards** (AC: 11)
  - [x] [`season-home`](../../apps/web/src/app/pages/season-home/) + [`user-agenda`](../../apps/web/src/app/pages/user-agenda/) : render **Brouillon** badge on draft rows (organizers only — members never receive draft rows from API).

- [x] **Seeds** (AC: 4)
  - [x] `V47` — 2 spectacles QA Malice en brouillon.
  - [x] `V48` — backfill `availability_opened_at` après seeds dispos (ordre Flyway).

- [x] **Tests** (AC: 14, M3-5)
  - [x] `EventControllerIntegrationTest`: create → draft ; member list excludes draft ; member getBySlug → 404 ; organizer sees draft ; open → timestamp ; idempotent open ; 403 non-organizer on open-availability.
  - [x] `AvailabilityControllerIntegrationTest`: member PUT on draft → 404/403 ; open → PUT succeeds.
  - [x] Vitest: event-detail draft CTA (organizer) ; season-agenda no draft rows for member fixture.

---

## Dev Notes

### Critical gap today (do not assume draft exists)

| Area | Current behaviour | Target |
|------|-------------------|--------|
| `EventEntity` | No publish/draft field | `availabilityOpenedAt` NULL = draft |
| `EventService.create` | Event immediately “open” for dispos | Default NULL |
| `AvailabilityService.requireEditableEvent` | Only checks `archived` | Also require open for writes |
| `CompositionLifecycleService` | `PREPARING` ⇒ badge **Collecte des dispos** | Draft events **hidden** from member lists ; orga badge **Brouillon** |
| `EventService.listForSeason` | All non-archived events visible | Filter out drafts for non-organizers |
| Notifications | No event-level port | Hook only ; 8.3 sends AVAILABILITY_OPENED |

There is **no** `draft` flag in [`EventEntity.kt`](../../services/api/src/main/kotlin/com/hatcast/api/event/EventEntity.kt) today. Do **not** overload `archived` or `event_compositions.published_at`.

### Distinction: event open vs composition publish

| Concept | Field / action | Story |
|---------|----------------|-------|
| **Availability collection open** | `events.availability_opened_at` ; `POST …/open-availability` | **3.21** |
| **Composition draft visible to members** | `event_compositions.published_at` ; `POST …/composition/publish` | **6.3** |

An event can be **open for availability** while composition is still empty (`PREPARING`). An event can remain **draft** while organizers pre-seed slots on Équipe tab — ensure composition mutations stay allowed (they already bypass availability guards).

### Product decision — draft visibility (PO 2026-06-01, affiné session)

**Masquer aux membres dans les listes** (agenda saison, Mon agenda) : filtre API. **Fiche spectacle** : un membre avec **lien direct** peut ouvrir la page, voir le **bandeau brouillon**, sans déposer de dispos. Organisateurs voient brouillons partout jusqu’à publication. Spec UX : [ux-event-draft-publish-3-21.md](../planning-artifacts/ux-event-draft-publish-3-21.md).

### Authorization matrix (implement explicitly)

| Action | Troupe admin | Season organizer | Event organizer | Member |
|--------|--------------|------------------|-----------------|--------|
| Create event | ✅ (`canManageEvents`) | ❌ | ❌ | ❌ |
| See draft in list / detail | ✅ | ✅ | ✅ (their events) | ❌ **hidden** |
| Edit event metadata | ✅ | ❌ (unless event orga) | ✅ | ❌ |
| Open availability | ✅ | ✅ | ✅ | ❌ |
| Close availability (revert draft) | ✅ | ✅ | ✅ | ❌ |
| Deposit dispos (self) | ✅ when open | ✅ when open | ✅ when open | ✅ when open |
| View dispos summary | ✅ | ✅ | ✅ | ✅ only when open (and visible) |
| Pre-seed compo slots | ✅ | ✅ | ✅ | ❌ |

Reference: [`OrganizerAccessService.canManageComposition`](../../services/api/src/main/kotlin/com/hatcast/api/organizer/OrganizerAccessService.kt) lines 300–307 ; [`canEditEvent`](../../services/api/src/main/kotlin/com/hatcast/api/organizer/OrganizerAccessService.kt) lines 309–313.

### Notification integration (hook only)

Pattern to copy:

```kotlin
// CompositionService.publishDraft — existing
eventPublisher.publishEvent(DraftCompositionSharedEvent(...))

// CompositionNotificationEventListener — existing AFTER_COMMIT listener
```

Add parallel types under `com.hatcast.api.event`:

- `EventAvailabilityOpenedEvent(eventId, seasonId, troupeId, actorUserId)`
- `EventNotificationPort.publishAvailabilityOpened(...)`
- `NoOpEventNotificationAdapter` @Component

Story **8.3** will replace NoOp with real dispatcher calling push (`PushNotificationEligibilityPort`) + email stub.

### Audit

Follow [`EventService.create`](../../services/api/src/main/kotlin/com/hatcast/api/event/EventService.kt) audit pattern. Extend [`AuditSnapshots.event`](../../services/api/src/main/kotlin/com/hatcast/api/audit/AuditSnapshots.kt) with `availabilityOpenedAt`. New enum value in [`AuditActionType.kt`](../../services/api/src/main/kotlin/com/hatcast/api/audit/AuditActionType.kt) — insert before deploy so 9.1 labels work.

### Frontend touchpoints (read before editing)

| File | Role |
|------|------|
| [`event-detail.ts`](../../apps/web/src/app/pages/event-detail/event-detail.ts) | Tabs, permissions, admin menu |
| [`event-dispos-tab.ts`](../../apps/web/src/app/shared/availability/event-dispos-tab.ts) | Members won't load draft events ; orga dispos tab works once open |
| [`event-detail-header`](../../apps/web/src/app/pages/event-detail/event-detail-header.ts) | Breadcrumb ; optional draft chip in header band |
| [`season-agenda` components](../../apps/web/src/app/pages/season-home/) | `teamStatusBadge` rendering |
| [`event-api.service.ts`](../../apps/web/src/app/core/events/event-api.service.ts) | Client contract |

Use existing [`ConfirmDialog`](../../apps/web/src/app/pages/seasons-list/confirm-dialog.ts) for publish confirmation — copy pattern from archive/unarchive in `event-detail.ts`.

### Explicit non-goals

- Sending push/email/in-app notification content (**8.3**).
- Organizer “draft event created” ops notification (**8.4** P2).
- Category notification preferences (**8.2**).
- Adding `availabilityOpenedAt` to `UserAgendaItem` DTO (optional future; client uses badge `draft` for card styling).

### Dependencies

| Story | Status | Relationship |
|-------|--------|--------------|
| 3.2, 3.4, 3.5, 3.8 | done | Event CRUD, types, organizers, roster |
| 5.1–5.5 | done | Availability API to guard |
| 6.3 | done | Composition publish — orthogonal field |
| 8.1 | done | Push registration ; no send |
| 8.3 | backlog | **Blocked by 3.21** — consumes `EventAvailabilityOpenedEvent` |
| 9.0 | done | Audit infrastructure |

### Previous story intelligence (3.20)

- Participation badge pattern: API enriches DTO → shared component → SCSS modifier `--draft`.
- Keep **French** UI strings ; tests may stay English.
- `./gradlew test` + targeted Vitest ; update OpenAPI + TS types in same PR.

### Git intelligence (recent)

- `feat(push): Add browser opt-in` — push infra ready ; do not send yet.
- `feat(audit): Add backend audit capture` — use `AuditEventRecorder` for open action.
- Composition notification port remains NoOp — extend parallel port for events.

---

## Dev Agent Record

### Agent Model Used

Composer (dev-story 3.21)

### Completion Notes List

- `events.availability_opened_at` : NULL = brouillon ; backfill sur lignes `event_availability` existantes.
- Action `POST …/actions/open-availability` (scope `canManageComposition`), audit `EVENT_AVAILABILITY_OPENED`, hook `EventAvailabilityOpenedEvent` + `NoOpEventNotificationAdapter` (Story 8.3).
- Visibilité : brouillons masqués aux membres (**listes** uniquement) ; détail membre via lien + bandeau ; badge `draft` pour orgas.
- UI : `event-detail-draft-banner` au-dessus des onglets ; modale Modifier (publier / remettre en brouillon) ; refresh immédiat après mutation.
- API : `close-availability` + audit `EVENT_AVAILABILITY_CLOSED` ; seed V48 backfill.
- Correctif Mon agenda : `isEventDraft` sans faux positif `undefined == null`.
- Docs : [ux-event-draft-publish-3-21.md](../planning-artifacts/ux-event-draft-publish-3-21.md), DOMAIN, ARCH, epics, FRONTEND_UI.
- Tests : `./gradlew test --tests '*EventController*' --tests '*AvailabilityController*'` OK ; Vitest `event-detail`, `season-agenda`, `event-infos-tab` OK ; `ng build` OK.
- M3 : chip `mat-chip`, bouton `mat-flat-button`, confirm dialog, cibles tactiles ≥ 48dp sur CTA brouillon.
- Revue code 2026-06-01 : pagination brouillon en SQL (`EVENT_LIST_VISIBILITY_JPQL`) ; tests AC15 complétés (by-slug, summary 403, close idempotent, Mon agenda).

### File List

- services/api/src/main/resources/db/migration/V45__event_availability_opened_at.sql
- services/api/src/main/resources/db/seed/V47__seed_draft_events_qa.sql
- services/api/src/main/resources/db/seed/V48__seed_availability_opened_at_backfill.sql
- services/api/openapi/events.yaml
- services/api/src/main/kotlin/com/hatcast/api/event/EventEntity.kt
- services/api/src/main/kotlin/com/hatcast/api/event/EventDraftVisibility.kt
- services/api/src/main/kotlin/com/hatcast/api/event/EventAvailabilityOpenedEvent.kt
- services/api/src/main/kotlin/com/hatcast/api/event/EventNotificationPort.kt
- services/api/src/main/kotlin/com/hatcast/api/event/EventNotificationEventListener.kt
- services/api/src/main/kotlin/com/hatcast/api/event/EventService.kt
- services/api/src/main/kotlin/com/hatcast/api/event/EventController.kt
- services/api/src/main/kotlin/com/hatcast/api/event/dto/EventDtos.kt
- services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityService.kt
- services/api/src/main/kotlin/com/hatcast/api/agenda/UserAgendaService.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/CompositionLifecycle.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/CompositionLifecycleService.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/CompositionLifecycleEnrichmentService.kt
- services/api/src/main/kotlin/com/hatcast/api/audit/AuditActionType.kt
- services/api/src/main/kotlin/com/hatcast/api/audit/AuditActionLabels.kt
- services/api/src/main/kotlin/com/hatcast/api/audit/AuditSnapshots.kt
- services/api/src/test/kotlin/com/hatcast/api/event/EventControllerIntegrationTest.kt
- services/api/src/test/kotlin/com/hatcast/api/event/EventServiceUpdateTest.kt
- services/api/src/test/kotlin/com/hatcast/api/availability/AvailabilityControllerIntegrationTest.kt
- apps/web/src/app/core/events/event-api.service.ts
- apps/web/src/app/core/composition/composition-lifecycle.ts
- apps/web/src/app/core/audit/audit-labels.ts
- apps/web/src/app/core/audit/audit-api.service.ts
- apps/web/src/app/core/audit/audit-action-tone.ts
- apps/web/src/app/shared/composition/composition-status-badge.scss
- apps/web/src/app/core/events/event-draft.ts
- apps/web/src/app/core/events/event-draft.spec.ts
- apps/web/src/app/pages/event-detail/event-detail.ts
- apps/web/src/app/pages/event-detail/event-detail.html
- apps/web/src/app/pages/event-detail/event-detail-draft-banner.ts
- apps/web/src/app/pages/event-detail/event-detail-draft-banner.html
- apps/web/src/app/pages/event-detail/event-detail-draft-banner.scss
- apps/web/src/app/pages/event-detail/event-detail-draft-banner.spec.ts
- apps/web/src/app/pages/season-home/event-form-dialog.ts
- apps/web/src/app/pages/season-home/event-form-dialog.html
- apps/web/src/app/shared/availability/event-dispos-tab.ts
- apps/web/src/app/shared/availability/event-dispos-tab.html
- apps/web/src/styles/_hatcast-agenda-event-card.scss
- _bmad-output/planning-artifacts/ux-event-draft-publish-3-21.md

### Change Log

- 2026-06-01 : Story created (`bmad-create-story 3.21`) — P0 MEP gate for Epic 8 notifications.
- 2026-06-01 : PO decision — draft events **hidden from ordinary members** (list + detail 404), not partial Dispos lock.
- 2026-06-01 : Implementation complete — draft gate, open-availability, visibility filters, UI CTA, tests (status → review).
- 2026-06-01 : PO session — close-availability, bandeau onglets, modale publier/revert, lien direct membre, V48, fix Mon agenda violet, docs UX alignées.
- 2026-06-01 : Code review clôturée — S1 pagination SQL + S2 tests ; status → done.

---

### Review Findings

- [x] [Review][Patch] S1 — Pagination listes après filtre brouillon (`EventRepository`, `UserAgendaRepository`, `EVENT_LIST_VISIBILITY_JPQL`)
- [x] [Review][Patch] S2 — Tests AC15 (by-slug 200, summary 403, close idempotent, Mon agenda draft)
- [x] [Review][Defer] S3–S7 — Idempotent open sans lifecycle, hex badge, Vitest bandeau, dette M3 mineure — report post-MEP

---

### Validation create-story

- [x] AC métier numérotés et sourcés (epics / FR / SCP)
- [x] Section **Material 3** remplie
- [x] Tasks référencent les numéros d’AC (y compris M3-x)
- [x] Liens vers fichiers code existants à réutiliser
- [x] `./gradlew test` / `npm run test` mentionnés
