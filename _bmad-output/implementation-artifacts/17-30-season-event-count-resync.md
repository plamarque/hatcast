# Story 17.30: Resync season event_count (BUG-004)

Status: done

## Story

En tant que **membre consultant le hub troupe**,  
je veux **des compteurs de spectacles exacts** sur les cartes saison,  
afin de **faire confiance aux statistiques affichées**, y compris après import migration.

## Acceptance Criteria

1. **Given** a season with events inserted via bulk SQL (migration) or API create, **when** `GET` season list/detail returns, **then** `eventCount` equals count of **non-archived** events for that season. [Source: ISSUES BUG-004; ux-design-troupe-hub.md T14]
2. **Given** admin archives an event via API, **when** archive completes, **then** `seasons.event_count` decrements (or is recalculated) so list cards update. [Source: EventService.archive gap]
3. **Given** migration pipeline completes event load, **when** smoke step runs, **then** optional reconciliation updates `event_count` for affected seasons (or document one-shot SQL in runbook). [Source: scripts/v2/migrate-lib]
4. **Given** `./gradlew test`, **when** run, **then** integration tests cover drift scenario: bulk insert events → list seasons shows correct count; archive adjusts count.

**Couverture :** [ISSUES.md](../../ISSUES.md) BUG-004. **Depends on:** none for API fix; **pairs with** 17.29 UI (cards already display `eventCount`).

**UI : N/A** — backend/migration only unless a follow-up verifies hub display manually.

## Tasks / Subtasks

- [x] Define canonical rule: `event_count` = non-archived events (align seeds V26/V34)
- [x] `EventService.archive` — decrement or call `SeasonStatsSync.recountEvents(seasonId)`
- [x] Optional: recount on season list read (performance trade-off — document if chosen)
- [x] Migration post-load SQL or Java hook to reconcile counts
- [x] One-off admin script or flyway repair for existing imported troupes
- [x] Integration tests + close BUG-004 in ISSUES.md

## Explicit non-goals

- Hub UI / season-card changes (17-29)
- `participant_count` (already synced — verify only)

## Dev Agent Record

### Implementation Plan

- Canonical rule documented in `SeasonEventCountSync` KDoc: `event_count = COUNT(events WHERE archived = FALSE)`.
- **No recount-on-read** on season list — denormalized cache kept; sync on archive + post-migration reconcile only (performance trade-off documented).
- `EventService.archive` calls `SeasonEventCountSync.recountEvents(seasonId)` after marking event archived (idempotent if already archived).
- MIG-2 `buildEventsLoadSql` appends reconcile `UPDATE seasons SET event_count = …` (non-archived only).
- Migration pipeline (`pipeline.mjs`) reconciles after b4/b5 load; smoke asserts `season_event_count == events_non_archived`.
- Admin repair: `scripts/v2/reconcile-season-event-counts.mjs` (+ npm script `reconcile:season-event-counts`).
- Seed V6 aligned with V26/V34 (`archived = FALSE` filter).

### Debug Log

- Full suite: 3 pre-existing flaky failures in `TroupeMembershipIntegrationTest` (LIMIT-002); new `SeasonEventCountIntegrationTest` green.

### Completion Notes

- BUG-004 closed in ISSUES.md (Fixed).
- Integration tests: bulk-insert drift + recount, archive decrements on detail/list, archived events excluded from count.
- `./gradlew test --tests SeasonEventCountIntegrationTest` passes.

## File List

- `services/api/src/main/kotlin/com/hatcast/api/season/SeasonEventCountSync.kt` (new)
- `services/api/src/main/kotlin/com/hatcast/api/event/EventRepository.kt`
- `services/api/src/main/kotlin/com/hatcast/api/event/EventService.kt`
- `services/api/src/test/kotlin/com/hatcast/api/season/SeasonEventCountIntegrationTest.kt` (new)
- `services/api/src/test/kotlin/com/hatcast/api/event/EventServiceUpdateTest.kt`
- `services/api/src/main/resources/db/seed/V6__seed_events_la_malice_2026_2027.sql`
- `scripts/v1/maliceEventsManifest.js`
- `scripts/v1/maliceEventsManifest.test.js`
- `scripts/v2/migrate-lib/neon.mjs`
- `scripts/v2/migrate-lib/pipeline.mjs`
- `scripts/v2/reconcile-season-event-counts.mjs` (new)
- `package.json`
- `ISSUES.md`

## Change Log

- 2026-06-01: Story 17-30 — resync `seasons.event_count` (archive sync, migration reconcile, admin script, tests); BUG-004 fixed.

### Review Findings

- [x] [Review][Patch] Script admin : `--season-id` inexistant ou sans dérive affiche « No event_count drift detected » au lieu d’une erreur explicite [`scripts/v2/reconcile-season-event-counts.mjs:49-67`]
- [x] [Review][Patch] AC4 partiel : le test bulk-insert vérifie le repo après `recountEvents` mais pas `GET /v1/seasons` (surface API hub) [`SeasonEventCountIntegrationTest.kt:108-110`]
- [x] [Review][Defer] ISSUES BUG-004 mentionne « unarchive lifecycle » — pas d’endpoint unarchive en V2 ; resync à prévoir si feature ajoutée — deferred, pre-existing scope gap
