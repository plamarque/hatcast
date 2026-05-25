# Story 5.5: Proxy availability for another participant with audit

Status: done

<!-- Ultimate context engine analysis completed — comprehensive developer guide created -->

## Story

As a **season organizer, event organizer, or troupe administrator** with composition-management rights,  
I want to **record or adjust availability on behalf of any eligible participant** (including name-only or not-yet-linked participants),  
so that **real-world corrections are possible while preserving who actually acted** (**FR17**, prepares **FR35**).

## Acceptance Criteria

1. **Given** I have **`canManageComposition`** for the spectacle, **when** I select another participant as subject in the Dispos **Moi** panel (or arrive from **Tous**), **then** the availability form is **editable** (same three states + role candidacy as **5.1**/**5.2**) and saves via a **proxy** API — **FR17**, **UX-DR5**.
2. **Given** a proxy save succeeds, **when** the row is persisted, **then** `recorded_by_user_id` (or equivalent audit column) stores the **authenticated actor**; the **subject** is the target participant (linked `user_id` and/or `season_participant_id` / `event_participant_id`) — **FR17**, **FR35** minimum until Epic 9.
3. **Given** a **name-only** participant (no `user_id`) on the event roster, **when** an authorized organizer saves proxy availability, **then** **200** and summary reflects the new status/roleKeys — core **FR17** / **FR43–FR45** scenario.
4. **Given** a user **without** `canManageComposition`, **when** they call the proxy endpoint or attempt to edit another subject in the UI, **then** **403** (server authoritative) and UI remains read-only — **NFR-S2**.
5. **Given** I edit **my own** availability (subject = self), **when** I save from Moi or the agenda dialog, **then** existing **`PUT .../availability/me`** still applies; proxy endpoint is **not** required for self — no regression on **5.1**/**5.2**.
6. **Given** organizer rights and **Tous** view, **when** I tap a person, **then** UI switches to **Moi** with that subject **and** tooltip/copy reads *« Cliquer pour modifier la disponibilité »* (replace *« Voir la disponibilité »*) — **UX-DR5**.
7. **Given** proxy mode, **when** the form or dialog header renders, **then** title/copy uses **third person** for the subject (e.g. *« Disponibilité de Patrice »*) and a short hint that the organizer acts **pour le compte de** the participant — align with [ux-design availability modal](_bmad-output/planning-artifacts/ux-design-hatcast-v2.md#pattern-availability-modal).
8. **Given** an **archived** event, **when** proxy or self edit is attempted, **then** edits remain blocked (same as **5.3**) — server + UI.
9. **Given** invalid `roleKeys` or status on proxy PUT, **when** validated, **then** **400** with French error — reuse **5.2** rules.
10. **Given** a successful proxy write, **when** the Dispos tab is open, **then** summary reloads and **Tous** percentages/candidate lists update — same `saved` → `reloadSummary()` path as self-edit.
11. **Couverture:** **FR17** ; **UX-DR5** ; **NFR-S2** — Kotlin integration tests: organizer proxy for linked user, **name-only** participant, **403** non-organizer, self `/me` unchanged; Angular tests: `subjectReadOnly` false for org + other subject, Tous tooltip, proxy API called with `participantId`; regression **5.3** summary and **6.8** organizer permission pattern.

### Explicit out of scope (later stories — do not implement in 5.5)

| Story | Deferred capability |
|-------|---------------------|
| **5.4** | Optional **comment** field (500 chars) — proxy PUT may omit `comment` until **5.4** adds column; do not block **5.5** on comment |
| **Epic 9** | Full **FR35** audit UI, property-level before/after, `audit_events` table |
| **Epic 8** | Notifications when organizer changes someone else's dispo |
| **Agenda MatDialog** | Proxy from agenda for **another** member (optional follow-up — **5.5** AC focuses on event Dispos tab + subject selector; agenda stays self-only unless trivial to pass `participantId`) |
| **Legacy** | Do not modify `legacy/` |

## Context and slicing

| Story | Scope |
|-------|--------|
| **3.8 (done)** | Season/event participants; summary `participantId` |
| **3.5 (done)** | `canManageComposition` — **reuse** for proxy gate (same as **6.8**) |
| **5.1–5.2 (done)** | Three-state + `roleKeys`; `/availability/me` |
| **5.3 (done)** | Dispos tab, Moi/Tous, subject selector, **read-only** other subject |
| **5.5 (this)** | Proxy PUT + audit actor; enable edit for other subject; Tous affordance |
| **5.4 (backlog)** | `comment` column — extend same row later |
| **6.8 (done)** | Proxy **composition** participation — mirror auth pattern, different domain |

## Tasks / Subtasks

- [x] **Scope:** `apps/web/` + `services/api/` only; **do not modify** `legacy/`.
- [x] **Flyway migration** (next version after latest, e.g. `V22__event_availability_proxy_audit.sql`):
  - Add nullable **`season_participant_id`**, **`event_participant_id`** (XOR subject for name-only / explicit participant scope).
  - Add **`recorded_by_user_id UUID NULL`** → `users(id)` — set on every **proxy** write to `principal.userId`; **null** on self-service `/me` writes (or set equal to subject user — pick one rule and document in service).
  - Make **`user_id` nullable** on `event_availability` (reserved since V15).
  - Replace PK `(event_id, user_id)` with **surrogate `id UUID`** **or** partial unique indexes:
    - at most one row per `(event_id, user_id)` when `user_id` not null;
    - at most one per `(event_id, season_participant_id)` when set;
    - at most one per `(event_id, event_participant_id)` when set;
    - CHECK: exactly one subject discriminator (linked user **or** XOR participant ids).
  - Backfill: for existing rows, set `season_participant_id` from active `season_participants` where `user_id` matches (best effort).
- [x] **API — proxy endpoint** in [`AvailabilityController.kt`](../../services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityController.kt):
  - `PUT /v1/seasons/{seasonId}/events/{eventId}/availability/participants/{participantId}`
  - Body: reuse **`SetMyAvailabilityRequest`** (`status`, `roleKeys`, `applyVolunteerRule`).
  - Auth: `organizerAccess.canManageComposition(eventId, seasonId, principal)` else **403**.
  - Resolve **`participantId`** against eligible roster (same union as summary — season ACTIVE + event-only ACTIVE; dedupe rules in [`AvailabilityService.loadEligibleParticipants`](../../services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityService.kt)).
  - **Linked subject** (`user_id` present): upsert/delete on `(event_id, user_id)` path; set **`recorded_by_user_id`** = actor.
  - **Name-only subject**: upsert/delete using participant XOR columns; **`user_id` null**; **`recorded_by_user_id`** = actor.
  - Reuse **`AvailabilityRoleRules`** + status mapping from **`setMyStatus`** — extract shared `upsertAvailability(...)` to avoid duplication.
  - Response: same shape as **`MyAvailabilityResponse`** (optionally add `recordedByUserId` for org debugging — **optional**, not required for AC).
- [x] **API — summary read path** in [`AvailabilityService.getSummary`](../../services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityService.kt):
  - Join availability by **`user_id`** when participant linked.
  - Join by **`season_participant_id` / `event_participant_id`** when name-only.
  - Keep DTO stable; no breaking renames on **`SummaryParticipant`**.
- [x] **OpenAPI:** extend [`openapi/availability.yaml`](../../services/api/openapi/availability.yaml) — proxy PUT path, 403/404, audit note, name-only behaviour.
- [x] **Angular — API client** [`availability-api.service.ts`](../../apps/web/src/app/core/availability/availability-api.service.ts):
  - `setParticipantAvailability(seasonId, eventId, participantId, body)` → proxy PUT.
- [x] **Angular — `AvailabilityForm`** [`availability-form.ts`](../../apps/web/src/app/shared/availability/availability-form.ts):
  - Inputs: `subjectParticipantId`, `proxyMode` (or derive: `readOnly === false` && subject ≠ self).
  - `persist()`: if editing **other** subject with `participantId`, call **proxy** API; else **`setMyAvailability`**.
  - Proxy copy: third-person feedback already exists when `readOnly()`; add organizer hint line when `proxyMode`.
  - **Do not** fetch preferred roles for **other** subject — pre-check uses **subject's** troupe prefs only when subject is self (keep current behaviour for proxy: no preferred-role pre-check for others, or load subject's membership if `userId` known — **simplest:** skip preferred pre-check for proxy subjects).
- [x] **Angular — Dispos tab** [`event-dispos-tab.ts`](../../apps/web/src/app/shared/availability/event-dispos-tab.ts):
  - Change **`subjectReadOnly`**: `false` when `canSwitchSubject() && subject.userId !== currentUserId()` **OR** subject has no `userId` and `canSwitchSubject()` (name-only editable by org).
  - Pass `subjectParticipantId` into Moi panel / form.
- [x] **Angular — Tous panel** [`availability-tous-panel.html`](../../apps/web/src/app/shared/availability/availability-tous-panel.html):
  - Tooltip: *« Cliquer pour modifier la disponibilité »* when `canSelectSubject()`.
- [x] **Tests:**
  - API: `@Tag("FR17")` proxy available/unavailable/unknown + roleKeys; name-only participant; 403 member; 403 outsider; self `/me` regression; summary reflects proxy row.
  - Angular: organizer edits other subject; member cannot; Tous tooltip; form calls correct endpoint.
  - Regression: `./gradlew test`, `ng test`, `ng build`.

## Dev Notes

### Architecture & guardrails

- Monorepo V2: [ARCH.md](../../ARCH.md) ; REST camelCase: [architecture.md](../planning-artifacts/architecture.md).
- **Authorization:** **`canManageComposition`** only — same matrix as **6.8** ([`OrganizerAccessService`](../../services/api/src/main/kotlin/com/hatcast/api/organizer/OrganizerAccessService.kt) lines 242–249). **Do not** invent a new permission flag.
- **Audit (FR17 / FR35 minimum):** Persist **`recorded_by_user_id`** on proxy writes. Full audit trail UI = **Epic 9**. Optional **DEBUG** structured log acceptable; **no** `audit_events` table in **5.5**.
- **Actor vs subject:** Actor = session user. Subject = slot/participant identity (season or event participant row). Mirror **6.8** decline row pattern ([`EventCompositionDeclineEntity`](../../services/api/src/main/kotlin/com/hatcast/api/composition/EventCompositionDeclineEntity.kt)).

### Authorization matrix (normative)

| Actor | May PUT availability for |
|-------|---------------------------|
| **Linked participant** | Self via `/availability/me` only |
| **Organizer / troupe admin (`canManageComposition`)** | Any **eligible** participant on that event (including name-only) via proxy path |
| **Other troupe member** | Self only — **403** on proxy |

### Schema strategy (critical — do not skip)

Current table ([`V15__event_availability.sql`](../../services/api/src/main/resources/db/migration/V15__event_availability.sql)) PK `(event_id, user_id)` **cannot** store name-only participants. **5.5 must migrate** as planned in **5.1** downstream notes.

**Recommended model:**

| Subject type | Storage key | `recorded_by_user_id` |
|--------------|-------------|------------------------|
| Linked member | `event_id` + `user_id` (keep existing path) | Set on proxy; null on pure self `/me` |
| Name-only / explicit participant | `event_id` + XOR `season_participant_id` / `event_participant_id`, `user_id` null | Always set (proxy-only path) |

**Participant id in URL:** Matches summary `participantId` — may be a **season** or **event** participant UUID ([`loadEligibleParticipants`](../../services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityService.kt) uses season row id for season roster, event row id for event-only).

### UI behaviour

1. **`subjectReadOnly` today** (line 61–65 in `event-dispos-tab.ts`): treats missing `userId` as read-only — **invert for organizers** so name-only becomes editable.
2. **Title:** *« Disponibilité de {displayName} »* — already on dialog; add proxy hint in Moi panel when editing other (*« Vous modifiez la disponibilité pour le compte de {name}. »*).
3. **Preferred roles (FR46):** Apply pre-check **only** for self-edit. Proxy for others: start from empty `roleKeys` on first **Dispo** unless existing row has data.
4. **Volunteer rule:** Same `applyVolunteerRule` body field as **5.2** on proxy PUT.
5. **Agenda dialog:** Still self-only in **5.5** unless explicitly extended — document as follow-up.

### Reuse — do not reinvent

| Asset | Use |
|-------|-----|
| `AvailabilityService.setMyStatus` | Extract shared persistence; keep `/me` thin wrapper |
| `AvailabilityRoleRules` | Same validation for proxy |
| `AvailabilityForm` + `AvailabilityMoiPanel` | Wire proxy PUT in `persist()` |
| `OrganizerAccessService` | Inject `OrganizerAccessRules` into availability service |
| **6.8** participation proxy | Auth branch pattern only — **different** endpoint and table |

### Pitfalls (prevent LLM mistakes)

1. **New permission flag** — forbidden; use `canManageComposition`.
2. **Client-only guard** — proxy PUT must **403** without server check.
3. **Using `/me` with forged body** — proxy must use **`participantId` path**; subject never inferred from client user id.
4. **Skipping name-only migration** — AC #3 fails without participant-scoped rows.
5. **Breaking summary DTO** — extend read joins only; keep field names.
6. **Epic 9 scope creep** — no audit UI.
7. **5.4 dependency** — do not require `comment` column for **5.5** merge.

### Previous story intelligence (5.3)

1. **`subjectReadOnly`** and Tous *« Voir la disponibilité »* were intentional placeholders for **5.5**.
2. **`AvailabilityForm`** already supports `readOnly` + third-person `feedbackText()`.
3. **Summary** loads participant union — proxy must use **identical** eligibility rules.
4. **Review fixes:** dedupe by `userId` in eligible list; do not break when fixing name-only joins.
5. **`/availability/me`** stays self-edit — [`event-dispos-tab`](../../apps/web/src/app/shared/availability/event-dispos-tab.ts) passes readOnly for other linked users today.

### Previous story intelligence (5.2 / 5.1)

1. **`role_keys`** column (V16) — proxy writes same JSON converter.
2. **Unknown** = delete row — applies to name-only rows too.
3. **5.1** composable services note: `setForParticipant(...)` in **5.5** — implement now.

### Previous story intelligence (6.8 — proxy pattern)

1. Extend **authorization** in existing service; **no** duplicate controller for same resource.
2. **403** when not organizer and not self.
3. **Integration tests** with `@Tag("FR17")` mirroring `@Tag("FR26")` layout in [`CompositionParticipationIntegrationTest`](../../services/api/src/test/kotlin/com/hatcast/api/composition/CompositionParticipationIntegrationTest.kt).
4. **Modal copy** distinction — availability uses **Disponibilité de {name}** not participation confirm wording.

### Git intelligence (recent)

- **`f7191a2`** — composition gap-fill; organizer actions on event detail are active patterns.
- **`c03ba79`**, **`f7d02e7`** — **6.7** participation; **6.8** extends same files — **do not** touch composition participation in **5.5**.
- **`843cf61`** (historical) — availability package layout and integration tests — extend [`AvailabilityControllerIntegrationTest`](../../services/api/src/test/kotlin/com/hatcast/api/availability/AvailabilityControllerIntegrationTest.kt).

### Latest tech notes

- **Spring Boot 3 / Kotlin** — Flyway + JPA entity update on `EventAvailabilityEntity`; partial unique indexes may need `@Table` indexes or raw SQL in migration.
- **Angular 21** — signals: update `subjectReadOnly` computed; pass `participantId` to form.
- **H2 tests** — mirror Postgres constraints in migration for test profile.

### Downstream contract

| Story | Consumes |
|-------|----------|
| **5.4** | Adds `comment` to same availability row + proxy body |
| **Epic 9** | Reads `recorded_by_user_id` / future audit store |
| **6.4+** | Summary `roleKeys` / status unchanged semantics |

### Testing requirements

| Layer | What to test |
|-------|----------------|
| API integration | Proxy CRUD three states; roleKeys; name-only; recorded_by set; 403; summary join |
| API unit | Subject resolution by participantId (season vs event row) |
| Angular | subjectReadOnly false for org; proxy API invoked; Tous tooltip |
| Regression | Self `/me`; **5.3** summary tests; no **6.8** regression |

### Project context reference

- [epics.md — Story 5.5](../planning-artifacts/epics.md)
- [prd.md — FR17, FR35](../planning-artifacts/prd.md)
- [ux-design-hatcast-v2.md — Dispos tab, availability modal](../planning-artifacts/ux-design-hatcast-v2.md)
- [architecture.md — audit fields](../planning-artifacts/architecture.md)
- [5-3 story](./5-3-vue-organisateur-disponibilites-par-role-et-vues-moi-tous.md)
- [6-8 story](./6-8-confirmation-ou-declinaison-pour-le-compte-d-un-membre-proxy.md)

## Dev Agent Record

### Agent Model Used

Composer (dev-story workflow)

### Debug Log References

- Flyway V23: H2 requires `DROP PRIMARY KEY` before nullable `user_id`; partial unique indexes replaced with full unique indexes; no backfill of `season_participant_id` on linked rows (CHECK XOR).
- Collateral: V22 MVP seed SQL fixed for H2 (`ON CONFLICT` → `WHERE NOT EXISTS`, `season_participant_id` column on composition slots).

### Completion Notes List

- Added **V23** migration: surrogate `id`, nullable `user_id`, participant XOR columns, `recorded_by_user_id`, subject CHECK.
- **PUT …/availability/participants/{participantId}** with `canManageComposition` gate; shared upsert paths for linked / season / event participants.
- Summary joins availability by `user_id` or participant-scoped rows.
- Angular: `setParticipantAvailability`, `proxyMode` on form, organizer `subjectReadOnly` / Tous tooltip, proxy hint in Moi panel.
- **Audit rule:** `recorded_by_user_id` set on proxy writes; **null** on `/availability/me` self writes.
- Tests: 4× `@Tag("FR17")` API integration tests; 2 new Angular `EventDisposTab` tests. `./gradlew test`: 306 tests, 303 pass (3 `TroupeMembershipIntegrationTest` fail only in full suite — pass in isolation; unrelated pollution). `ng test` + `ng build` OK for availability specs.

### File List

- services/api/src/main/resources/db/migration/V23__event_availability_proxy_audit.sql
- services/api/src/main/resources/db/migration/V22__seed_mvp_pilot_recette.sql
- services/api/src/main/kotlin/com/hatcast/api/availability/EventAvailabilityEntity.kt
- services/api/src/main/kotlin/com/hatcast/api/availability/EventAvailabilityRepository.kt
- services/api/src/main/kotlin/com/hatcast/api/availability/EventAvailabilityLookup.kt
- services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityService.kt
- services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityController.kt
- services/api/openapi/availability.yaml
- services/api/src/main/kotlin/com/hatcast/api/composition/CompositionService.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/CompositionDrawService.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/CompositionDeclineRestoreService.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/CompositionSlotAssignmentService.kt
- services/api/src/test/kotlin/com/hatcast/api/availability/AvailabilityControllerIntegrationTest.kt
- services/api/src/test/kotlin/com/hatcast/api/event/EventControllerIntegrationTest.kt
- apps/web/src/app/core/availability/availability-api.service.ts
- apps/web/src/app/shared/availability/availability-form.ts
- apps/web/src/app/shared/availability/availability-moi-panel.ts
- apps/web/src/app/shared/availability/availability-moi-panel.html
- apps/web/src/app/shared/availability/event-dispos-tab.ts
- apps/web/src/app/shared/availability/event-dispos-tab.html
- apps/web/src/app/shared/availability/availability-tous-panel.html
- apps/web/src/app/shared/availability/event-dispos-tab.spec.ts

### Review Findings

- [x] [Review][Patch] V22 seed migration breaks H2 test Flyway (`ON CONFLICT`) — [V22__seed_mvp_pilot_recette.sql:10]
- [x] [Review][Patch] AC #8 — no server-side block when `event.archived` on `/me` or proxy PUT — [AvailabilityService.kt:loadAuthorizedEvent]
- [x] [Review][Patch] AC #8 — no API integration test for archived event rejection
- [x] [Review][Patch] AC #7 — proxy edit form still uses second-person role copy (« Choisis les rôles… ») — [availability-form.html:54]
- [x] [Review][Patch] AC #11 — Angular test does not assert `setParticipantAvailability` is called in proxy mode — [event-dispos-tab.spec.ts]
- [x] [Review][Defer] Organizer may call proxy PUT on own `participantId` (sets `recorded_by_user_id`; AC #5 prefers `/me`) — deferred, low impact

## Change Log

- 2026-05-25: Story 5.5 — proxy availability API + UI, audit `recorded_by_user_id`, V23 schema migration.
- 2026-05-25: Code review — 5 patch items, 1 defer; status → in-progress.
- 2026-05-25: Review patches applied (V22 H2, archived guard + test, proxy copy, Angular proxy API test).

## References

- [Source: _bmad-output/planning-artifacts/epics.md — Story 5.5](../planning-artifacts/epics.md)
- [Source: _bmad-output/planning-artifacts/prd.md — FR17](../planning-artifacts/prd.md)
- [Source: _bmad-output/planning-artifacts/ux-design-hatcast-v2.md — Dispos permissions](../planning-artifacts/ux-design-hatcast-v2.md#screen-event-detail-dispos-tab)
- [Source: _bmad-output/implementation-artifacts/5-3-vue-organisateur-disponibilites-par-role-et-vues-moi-tous.md](./5-3-vue-organisateur-disponibilites-par-role-et-vues-moi-tous.md)
- [Source: services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityService.kt](../../services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityService.kt)
- [Source: apps/web/src/app/shared/availability/event-dispos-tab.ts](../../apps/web/src/app/shared/availability/event-dispos-tab.ts)
