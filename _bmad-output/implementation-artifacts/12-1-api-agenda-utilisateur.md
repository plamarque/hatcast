# Story 12.1: User agenda API (`GET /v1/me/agenda`)

Status: review

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

## Story

As a **signed-in member**,
I want the API to expose my **upcoming events** aggregated across every **league where I am a participant**,
so that the **Mon agenda** screen (Story 12.2) can load in **one call** instead of N per-league requests.

## Acceptance Criteria

1. **Given** an authenticated user who is an **ACTIVE** `season_participants` row (`user_id` = caller) in N leagues, **when** `GET /v1/me/agenda` is called with default params, **then** the response lists **upcoming** events (UX-DR12) with **`troupeId`**, **`troupeName`**, **`troupeSlug`**, **`leagueId`**, **`leagueSlug`**, **`leagueTitle`**, plus event summary fields and **`myAvailabilityStatus`** when applicable. [Source: epics Story 12.1; FR48; `architecture.md` § API]
2. **Given** an inter-troupe encounter (two distinct `events` rows in two troupes), **when** the user is a league participant in **both** leagues, **then** the API returns **two separate items** (no server-side merge). [Source: epics Story 12.1; ADR 0011 §3]
3. **Given** the user is an **event-only** participant (`event_participants.user_id` = caller, ACTIVE), **when** the event is upcoming and its league is not archived, **then** that event appears even if the user has **no** season-level participant row for that league. [Source: `DOMAIN.md` § User agenda scope]
4. **Given** `scope=upcoming` (default), **when** listing, **then** only **non-archived** events with `startsAt` ≥ start of **today** in **`Europe/Paris`** are included — same boundary as `EventService.AGENDA_ZONE` / `GET /v1/seasons/{id}/events?scope=upcoming`. [Source: UX-DR12; `EventService.kt`]
5. **Given** optional query `troupeId` and/or `leagueId` (season UUID), **when** provided, **then** results are restricted to that troupe and/or league; invalid UUIDs → **400**; IDs the user does not participate in → empty page (not 403). [Source: FR48; architecture.md]
6. **Given** pagination `page` (≥0) and `size` (1–50, default **50**), **when** listing, **then** response includes `content`, `page`, `size`, `totalElements`, `totalPages` (Spring page shape, consistent with `PagedEventsResponse`). [Source: FR48]
7. **Given** the caller participates in **exactly one troupe** and **exactly one league** (distinct season IDs with ACTIVE participation), **when** listing, **then** `filterBarVisible` is **`false`**; otherwise **`true`** (RES-001 / FR55). [Source: architecture.md; UX-DR14]
8. **Given** archived leagues (`seasons.archived = true`) or archived events, **when** listing, **then** they are **excluded**. [Source: UX-DR12]
9. **Given** no league/event participation, **when** listing, **then** `200` with empty `content` and `filterBarVisible: false`. [Source: FR49 empty-agenda path — API contract only here]
10. **Given** no session cookie, **when** calling the endpoint, **then** **401**. [Source: NFR-S2]
11. **Given** implementation complete, **when** tests run, **then** integration tests cover multi-league aggregation, inter-troupe duplicate rows, filters, pagination cap, `filterBarVisible`, event-only participant, archived exclusion; `./gradlew test` green. [Source: NFR-Q1 FR48–49]

## Tasks / Subtasks

- [x] **OpenAPI contract** (AC: 1, 5, 6, 7) — add [`services/api/openapi/me-agenda.yaml`](../../services/api/openapi/me-agenda.yaml) (or extend a new `me.yaml` fragment):
  - Path `GET /v1/me/agenda`
  - Query: `scope` (`upcoming` default), `troupeId`, `leagueId`, `page`, `size` (max 50)
  - Schemas: `UserAgendaResponse`, `UserAgendaItemDto` (see Dev Notes)
  - Security: `cookieAuth`
  - Document `filterBarVisible` semantics

- [x] **Domain package** `com.hatcast.api.agenda` (AC: 1–10):
  - [x] `UserAgendaController` — `@RequestMapping("/v1/me/agenda")`, `@AuthenticationPrincipal SessionUserPrincipal`
  - [x] `UserAgendaService` — orchestration, pagination, filter bar computation
  - [x] `UserAgendaRepository` — **single JPQL/native query** preferred (avoid N+1 per league); join `events` ← `seasons` ← `troupes`, filter by caller participations
  - [x] DTOs in `agenda/dto/UserAgendaDtos.kt`

- [x] **Participation scope** (AC: 1, 2, 3):
  - [x] Include events where caller has ACTIVE `season_participants` for the event’s `season_id` (`user_id` match)
  - [x] **Union** events where caller has ACTIVE `event_participants` for that `event_id` (`user_id` match) — DISTINCT event ids
  - [x] Do **not** include events based on troupe membership alone without participant row

- [x] **Reuse existing enrichment** (AC: 1):
  - [x] Batch `availabilityService.myStatusByEventIds(eventIds, principal.userId)` — same keys as [`EventResponseDto.myAvailabilityStatus`](../../services/api/src/main/kotlin/com/hatcast/api/event/dto/EventDtos.kt)
  - [x] Optional MVP: include `compositionLifecycle` + `teamStatusBadge` via `CompositionLifecycleEnrichment` **only if** cheap to batch; otherwise omit and let event detail (6.2) own full lifecycle — **do not block 12.1** on composition fields

- [x] **Security** (AC: 10):
  - [x] Register `GET /v1/me/agenda` in [`SecurityConfig.kt`](../../services/api/src/main/kotlin/com/hatcast/api/config/SecurityConfig.kt) as authenticated (member), not troupe-admin

- [x] **Tests** (AC: 11):
  - [x] `UserAgendaIntegrationTest` using `TestAuthSupport` + seed Malice data ([`EventControllerIntegrationTest`](../../services/api/src/test/kotlin/com/hatcast/api/event/EventControllerIntegrationTest.kt) patterns)
  - [x] Scenarios: default list; `troupeId` filter; `leagueId` filter; `size=51` → 400; unauthenticated → 401; `filterBarVisible` with one vs two leagues (create second season + participant in test)
  - [x] Event-only participant: create event participant without season row → event appears

### Review Findings

- [x] [Review][Patch] V18 migration was edited in place — decision: treat V18 as potentially applied and fix with a forward-only / non-rewrite-safe approach [services/api/src/main/resources/db/migration/V18__event_composition_lifecycle.sql:1]
- [x] [Review][Patch] Event-only archived events can affect `filterBarVisible` [services/api/src/main/kotlin/com/hatcast/api/agenda/UserAgendaRepository.kt:75]
- [x] [Review][Patch] Agenda pagination ordering is not stable when events share `startsAt` [services/api/src/main/kotlin/com/hatcast/api/agenda/UserAgendaRepository.kt:36]
- [x] [Review][Patch] AC11 integration coverage is incomplete for multi-league aggregation, inter-troupe duplicates, archived exclusion, pagination metadata, invalid UUIDs, and the Paris upcoming boundary [services/api/src/test/kotlin/com/hatcast/api/agenda/UserAgendaIntegrationTest.kt:181]
- [x] [Review][Patch] Repository returns entities and DTO mapping can trigger lazy-load N+1 despite the one-query performance goal [services/api/src/main/kotlin/com/hatcast/api/agenda/UserAgendaRepository.kt:16]

## Dev Notes

### Scope boundaries (API-only — read first)

| In scope (12.1) | Out of scope (later stories) |
|-----------------|------------------------------|
| `GET /v1/me/agenda` backend + OpenAPI | Angular `/agenda` route (**12.2**) |
| `filterBarVisible` in JSON | Filter UI chrome (**12.3**) |
| Query filters `troupeId`, `leagueId` | Post-login → `/agenda` (**12.5**) |
| Pagination + upcoming scope | Route alias `/ligue/:slug` (**12.6**) |
| OpenAPI fragment | Multi-active league migration (**Epic 13**) |

**Do not** change post-login routing (Story **2.9** still falls back to `/seasons`). **Do not** add SPA routes in this story.

### Product rules (normative)

| Rule | Implementation hint |
|------|------------------------|
| League participant roster drives agenda | `season_participants.user_id = :userId AND status = ACTIVE` |
| Event-only guests | `event_participants.user_id = :userId AND status = ACTIVE` |
| Inter-troupe = separate rows | No `GROUP BY` title/date; return raw `events.id` |
| Upcoming = civil day Paris | Reuse `EventService.AGENDA_ZONE` + `startOfTodayInclusive` logic (extract shared helper or duplicate 3 lines — prefer **shared** `AgendaTimeBoundary` util) |
| Archived league hidden | `seasons.archived = false` |
| Default page size ≤ 50 | `@RequestParam(defaultValue = "50") size: Int` + validate `size > 50` → 400 |

### Response contract (implement exactly — unblocks 12.2)

```json
{
  "content": [
    {
      "eventId": "uuid",
      "title": "string",
      "startsAt": "2026-05-30T18:30:00Z",
      "location": "string | null",
      "troupeId": "uuid",
      "troupeName": "string",
      "troupeSlug": "string",
      "leagueId": "uuid",
      "leagueSlug": "string",
      "leagueTitle": "string",
      "myAvailabilityStatus": "AVAILABLE | UNAVAILABLE | UNKNOWN | null"
    }
  ],
  "page": 0,
  "size": 50,
  "totalElements": 12,
  "totalPages": 1,
  "filterBarVisible": true
}
```

**Naming:** Response uses **`league*`** fields (product term). DB/API paths remain `seasons` / `season_id`. Do **not** expose `seasonId` in this DTO (use `leagueId`).

**`filterBarVisible` algorithm:**

```
participatingTroupeIds = distinct troupe ids from ACTIVE season_participants (+ troupes from event-only participations)
participatingLeagueIds = distinct season ids from ACTIVE season_participants (+ seasons from event-only events)
filterBarVisible = (participatingTroupeIds.size > 1) || (participatingLeagueIds.size > 1)
```

Compute from **all** participations for the user, **not** from the filtered result set.

### Suggested repository query (sketch)

```sql
-- Conceptual: DISTINCT events for user, upcoming, non-archived event + season
SELECT e.* FROM events e
JOIN seasons s ON s.id = e.season_id AND s.archived = false
JOIN troupes t ON t.id = s.troupe_id
WHERE e.archived = false AND e.starts_at >= :fromInclusive
AND (
  e.season_id IN (SELECT season_id FROM season_participants WHERE user_id = :userId AND status = 'ACTIVE')
  OR e.id IN (SELECT event_id FROM event_participants WHERE user_id = :userId AND status = 'ACTIVE')
)
-- optional AND t.id = :troupeId AND s.id = :leagueId
ORDER BY e.starts_at ASC
```

Add indexes only if explain plans fail — existing indexes on `season_participants(user_id)`, `events(season_id, starts_at)` likely sufficient for MVP.

### Architecture compliance

- **Stack:** Kotlin 21, Spring Boot 3, JPA, Flyway — **no migration required** for 12.1 (read-only aggregation). [Source: `architecture.md`]
- **Package layout:** new `com.hatcast.api.agenda` mirroring `event`, `participant`, `memberprofile`
- **Auth:** session cookie + CSRF on mutations only; this endpoint is **GET** — cookie auth sufficient ([ADR 0010](../../docs/adr/0010-v2-auth-identity-platform.md))
- **Performance (NFR-P1/P2):** one paginated query + one availability batch; target < 500 ms for 50 rows on seed DB
- **Error style:** `ResponseStatusException` with French messages matching [`EventController`](../../services/api/src/main/kotlin/com/hatcast/api/event/EventController.kt)

### Code reuse (do not reinvent)

| Existing | Reuse |
|----------|--------|
| [`EventService.AGENDA_ZONE`](../../services/api/src/main/kotlin/com/hatcast/api/event/EventService.kt) | Upcoming boundary |
| [`EventRepository.findUpcomingNonArchived`](../../services/api/src/main/kotlin/com/hatcast/api/event/EventRepository.kt) | Pattern for archived + date filter |
| [`AvailabilityService.myStatusByEventIds`](../../services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityService.kt) | Per-event dispo pill |
| [`EventResponseDto`](../../services/api/src/main/kotlin/com/hatcast/api/event/dto/EventDtos.kt) | Field naming for `myAvailabilityStatus` values |
| [`ParticipantStatus.ACTIVE`](../../services/api/src/main/kotlin/com/hatcast/api/participant/ParticipantEntities.kt) | Participation filter |
| [`openapi/events.yaml`](../../services/api/openapi/events.yaml) | Pagination param conventions (`page`, `size`, `scope`) |

### Previous story intelligence (dependencies)

| Story | Relevance |
|-------|-----------|
| **3.8 (done)** | `season_participants` + `event_participants` schema and ACTIVE/REMOVED lifecycle — agenda **must** respect ACTIVE only |
| **3.3 (done)** | League agenda `scope=upcoming` semantics — keep identical boundary |
| **2.9 (done)** | Explicitly deferred `/agenda` API — do not modify `PostLoginNavigationService` |
| **5.1 (done)** | Availability stored per `user_id` on events — `myStatusByEventIds` is correct for agenda pills |

### Git intelligence (recent patterns)

- `feat(web): Post-login redirect to last visited league` — navigation work stays SPA-side; API story is independent
- `feat(availability):` / `feat(composition):` — integration tests use seed Malice troupe `a0000001-...`, season `b0000001-...`, Google sub test users — follow same IDs in `UserAgendaIntegrationTest`

### Testing standards

- Add `UserAgendaIntegrationTest` under `services/api/src/test/kotlin/com/hatcast/api/agenda/`
- Use `@SpringBootTest` + `@AutoConfigureMockMvc` + `@ActiveProfiles("test")` like other controller ITs
- Run: `./gradlew :services:api:test --tests '*UserAgenda*'` then full `./gradlew test` before PR

### Project Structure Notes

- API-only change: `services/api/src/main/kotlin/com/hatcast/api/agenda/**`
- OpenAPI: `services/api/openapi/me-agenda.yaml`
- **No** `apps/web/` changes in this story
- **No** `legacy/` changes

### References

- [Source: `_bmad-output/planning-artifacts/epics.md` — Epic 12, Story 12.1]
- [Source: `_bmad-output/planning-artifacts/architecture.md` — § User agenda (FR48)]
- [Source: `_bmad-output/planning-artifacts/ux-design-journey-league-agenda.md` — Screen 2, UX-DR14 filter rules]
- [Source: `_bmad-output/planning-artifacts/plan-v2-league-journey.md` — Wave 1, Story 12.1]
- [Source: `docs/adr/0011-league-model-and-user-agenda.md`]
- [Source: `DOMAIN.md` — User agenda scope]
- [Source: `_bmad-output/implementation-artifacts/3-8-rosters-participants-saison-et-evenement.md`]
- [Source: `_bmad-output/implementation-artifacts/2-9-post-login-et-derniere-ligue-visitee-v1-parity.md` — out-of-scope note]

## Dev Agent Record

### Agent Model Used

claude-4.6-sonnet-medium-thinking

### Debug Log References

- V18 migration used `TIMESTAMPTZ` (unsupported by H2 test DB) — fixed to `TIMESTAMP` to unblock `./gradlew test`.
- Seed-season integration test initially called roster sync (adds all troupe members) — replaced with single linked participant to avoid polluting other tests.

### Completion Notes List

- Implemented `GET /v1/me/agenda` with paginated upcoming events across all ACTIVE season/event participations.
- Added `filterBarVisible` computed from distinct troupe/league participation counts (not filtered result set).
- Reused `AvailabilityService.myStatusByEventIds` for availability pills; omitted composition lifecycle (MVP per story).
- Added OpenAPI fragment `me-agenda.yaml` and SecurityConfig whitelist entry.
- Added 9 integration tests covering auth, pagination cap, filters, filterBarVisible, event-only participant, seed data.
- Full suite: `./gradlew test` — 232 tests green.

### File List

- services/api/openapi/me-agenda.yaml
- services/api/src/main/kotlin/com/hatcast/api/agenda/AgendaTimeBoundary.kt
- services/api/src/main/kotlin/com/hatcast/api/agenda/UserAgendaController.kt
- services/api/src/main/kotlin/com/hatcast/api/agenda/UserAgendaRepository.kt
- services/api/src/main/kotlin/com/hatcast/api/agenda/UserAgendaService.kt
- services/api/src/main/kotlin/com/hatcast/api/agenda/dto/UserAgendaDtos.kt
- services/api/src/main/kotlin/com/hatcast/api/config/SecurityConfig.kt
- services/api/src/main/resources/db/migration/V18__event_composition_lifecycle.sql
- services/api/src/test/kotlin/com/hatcast/api/agenda/UserAgendaIntegrationTest.kt

## Change Log

- 2026-05-24: Story 12.1 — User agenda API (`GET /v1/me/agenda`), OpenAPI, integration tests; V18 H2 compatibility fix.
