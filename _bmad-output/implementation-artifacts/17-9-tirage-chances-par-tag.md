# Story 17.9: Draw and chances partitioned by equity tag

Status: done

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

## Story

As an **organizer or member** viewing availability odds or running an auto-draw,
I want **past selection history and chance weights scoped to the event’s equity compartment** within the season,
so that **participation in away shows (`deplacements`), Apérock, etc. does not reduce chances for ordinary shows** (and vice versa), per **ADR 0013**.

## Acceptance Criteria

1. **Given** auto-draw on a tagged event, **when** chances are computed, **then** `pastSelectionCount` uses only validated assignments from events in the **same compartment** `(season_id, equity compartment)` as the current event. [Source: epics 17.9; ADR 0013 §5]
2. **Given** a **principal** event (`equity_tag` null, not legacy `deplacement` template), **when** draw or `includeChances=true` summary runs, **then** history **excludes** participations from events in other compartments (tagged `deplacements`, `aperock`, …). [Source: epics 17.9 AC2]
3. **Given** legacy `template_type = deplacement` with `equity_tag` null, **when** history is computed, **then** it uses the **`deplacements` compartment** (same rule as stats **17.10** / `SeasonStatisticsCompartments.compartmentSlug`). [Source: 17.10; MIG-4 deferred]
4. **Given** `GET .../availability/summary?includeChances=true`, `GET .../composition/candidates`, draw (`POST .../composition/draw`), and composition explainability (`chancePercent` / `pastSelectionCount`), **when** any of these run, **then** they all use the **same partitioned history** for the target event (single source of truth in `CompositionSelectionHistoryService`). [Source: 6.4 FR19/FR24; ADR 0013]
5. **Given** integration tests, **when** a Malice-style scenario (validated assignment on a `deplacements` event, then chances on a principal event), **then** the principal pool **does not** count the away assignment; a second `deplacements` event **does** count it. [Source: epics 17.9 — régression Malice déplacement]
6. **Given** implementation complete, **when** `./gradlew -q test` (API module), **then** unit + integration tests pass; existing draw/history tests updated or extended, not weakened. [Source: repo norms]

## Tasks / Subtasks

- [x] **Shared compartment slug** (AC: 1–3)
  - [x] Extract `compartmentSlug(event: EventEntity): String` from [`SeasonStatisticsCompartments`](../../services/api/src/main/kotlin/com/hatcast/api/season/SeasonStatisticsCompartments.kt) into a shared type (e.g. [`EquityCompartment.kt`](../../services/api/src/main/kotlin/com/hatcast/api/event/EquityCompartment.kt) in `event` package) — **same rules** as 17.10: `equityTag` if set; else `deplacements` if `templateType == "deplacement"`; else `principal`.
  - [x] Make `SeasonStatisticsCompartments.compartmentSlug` delegate to the shared helper (thin wrapper) so stats and draw cannot diverge.
  - [x] Add unit tests mirroring [`SeasonStatisticsCompartmentsTest.kt`](../../services/api/src/test/kotlin/com/hatcast/api/season/SeasonStatisticsCompartmentsTest.kt) on the shared object (or keep one test class importing shared helper).

- [x] **Partitioned history query** (AC: 1–4)
  - [x] Extend [`CompositionSelectionHistoryService`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionSelectionHistoryService.kt): `pastSelectionCountByParticipantAndRole(seasonId, excludeEventId, equityCompartment: String)` (or pass `EventEntity` / `eventId` and resolve compartment inside service via `EventRepository`).
  - [x] Update JPQL in [`EventCompositionSlotRepository.countValidatedSelectionsBySeason`](../../services/api/src/main/kotlin/com/hatcast/api/composition/EventCompositionSlotRepository.kt) to filter joined `EventEntity e` by compartment:
    - `principal`: `e.equityTag IS NULL AND e.templateType <> 'deplacement'`
    - `deplacements`: `e.equityTag = 'deplacements' OR (e.equityTag IS NULL AND e.templateType = 'deplacement')`
    - other slug: `e.equityTag = :equityTag`
  - [x] Keep existing exclusions: `excludeEventId`, `archived = false`, `validatedAt IS NOT NULL`, `DECLINED` slots excluded.

- [x] **Wire all consumers** (AC: 4)
  - [x] [`CompositionDrawService`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionDrawService.kt) — load event, pass compartment into history call.
  - [x] [`CompositionSlotAssignmentService`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionSlotAssignmentService.kt) — candidates list.
  - [x] [`CompositionService`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionService.kt) — explainability odds map.
  - [x] [`AvailabilityService`](../../services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityService.kt) — `getSummary` when `includeChances=true`.

- [x] **Tests** (AC: 5–6)
  - [x] Update [`CompositionSelectionHistoryServiceTest`](../../services/api/src/test/kotlin/com/hatcast/api/composition/CompositionSelectionHistoryServiceTest.kt): mock repository method with compartment param; assert correct repository invocation per slug.
  - [x] Add integration test (new method in [`CompositionDrawIntegrationTest`](../../services/api/src/test/kotlin/com/hatcast/api/composition/CompositionDrawIntegrationTest.kt) or dedicated `CompositionEquityCompartmentIntegrationTest`): create principal + `deplacements` events; validate past draw; assert `availability/summary` veteran chance on principal event **ignores** away history; assert tagged away event **includes** it.
  - [ ] Optional: PATCH `equityTag` on event and re-fetch summary to confirm compartment switch (API 17.7).
  - [x] Run full API test suite; fix any tests that assumed season-wide history.

## Dev Notes

### Product and domain rules

- **Compartment = fairness pool** within one season roster — not a separate season, not navigation (ADR 0013 §3).
- **Principal:** `equity_tag IS NULL` and **not** legacy `template_type = deplacement`. UI never shows « Principal » (17.8).
- **Tagged event:** only participations on events sharing the same compartment slug affect `pastSelectionCount` and weighted draw.
- **Legacy away rows:** `template_type = deplacement` without tag count as **`deplacements`** compartment until **MIG-4** backfill — must match stats filter (17.10 **done**).
- **No UI story:** Web already displays `chancePercent` / `pastSelectionCount` from API; behaviour changes when API partitions history. Smoke-test Infos tag + Dispos **Tous** + draw on seed Malice season optional.

### Explicit non-goals (scope guard)

- Do **not** change stats compartment filter or DEPLACEMENT column removal — **17.10** done.
- Do **not** add or change Infos tag UI — **17.8** done.
- Do **not** run DB backfill `deplacement` → `equity_tag` — **MIG-4**.
- Do **not** change chance formula (`AvailabilityChanceCalculator` malus) — only **which past events count**.
- Do **not** partition **eligibility** (who is on the roster) — only **history weighting**; season/event participant pools unchanged.
- Do **not** modify `legacy/` or Angular unless a type/test breaks (unexpected).

### Backend implementation guardrails

| Concern | Pattern to follow |
|--------|-------------------|
| Single source of truth | One `EquityCompartment.slug(event)` used by stats + composition |
| History API shape | Extend service signature; avoid duplicating JPQL in four services |
| Resolve compartment | Prefer `eventRepository.findById(eventId)` inside history service **or** pass slug from callers that already loaded `EventEntity` |
| Repository method | Rename or overload: `countValidatedSelectionsBySeasonAndCompartment(seasonId, excludeEventId, compartmentSlug)` |
| `principal` token | Query token `principal` — **not** SQL NULL comparison on tag alone |
| Performance | Same single aggregated query as today; one extra WHERE on `events` join — acceptable |
| OpenAPI | No new public fields; optional note in `composition.yaml` description that history is compartment-scoped |

**Suggested compartment filter in JPQL (parameter `:compartmentSlug`):**

```sql
AND (
  (:compartmentSlug = 'principal' AND e.equityTag IS NULL AND e.templateType <> 'deplacement')
  OR (:compartmentSlug = 'deplacements' AND (e.equityTag = 'deplacements' OR (e.equityTag IS NULL AND e.templateType = 'deplacement')))
  OR (:compartmentSlug NOT IN ('principal', 'deplacements') AND e.equityTag = :compartmentSlug)
)
```

Alternative: resolve matching `eventId` list in Kotlin via `EventRepository` + `EquityCompartment.matches` — easier to test, potentially more queries; prefer JPQL if one query stays readable.

**Call-site sketch:**

```kotlin
val event = eventRepository.findByIdAndSeasonId(eventId, seasonId) ?: throw notFound()
val compartment = EquityCompartment.slug(event)
val historyCounts = selectionHistory.pastSelectionCountByParticipantAndRole(
    seasonId, eventId, compartment,
)
```

### Malice regression scenario (AC 5)

1. Season S; members A (veteran), B (rookie).
2. Event **D** (`equityTag=deplacements` or legacy `templateType=deplacement`): both available; draw + validate → A assigned `player`.
3. Event **P** (principal, `equityTag=null`, `templateType=match`): both available; `GET summary?includeChances=true` → **B.chancePercent > A.chancePercent** (A’s away pick must not penalize principal pool).
4. Event **D2** (same compartment as D): **A** should have higher `pastSelectionCount` than B for `player`.

Seed reference: [`V26__seed_malice_past_events_historique.sql`](../../services/api/src/main/resources/db/seed/V26__seed_malice_past_events_historique.sql) (`hist-deplacement-valenciennes` has `equity_tag=deplacements`).

### Dependencies

| Story | Status | Role |
|-------|--------|------|
| **17.7** | done | `events.equity_tag`, glossary |
| **17.8** | done | Tag assignment on Infos (data for manual QA) |
| **17.10** | done | `SeasonStatisticsCompartments` — **must stay aligned** |
| **6.4** | done | Draw, history service, chance calculator |
| **MIG-4** | backlog | Prod backfill; not required for this story |

### Project Structure Notes

| Layer | Paths |
|-------|--------|
| Shared rules | `services/api/src/main/kotlin/com/hatcast/api/event/EquityCompartment.kt` (new) |
| History | `composition/CompositionSelectionHistoryService.kt`, `composition/EventCompositionSlotRepository.kt` |
| Consumers | `CompositionDrawService.kt`, `CompositionSlotAssignmentService.kt`, `CompositionService.kt`, `availability/AvailabilityService.kt` |
| Stats alignment | `season/SeasonStatisticsCompartments.kt` (delegate only) |
| Tests | `CompositionSelectionHistoryServiceTest.kt`, `CompositionDrawIntegrationTest.kt`, `EquityCompartmentTest.kt` or extend `SeasonStatisticsCompartmentsTest.kt` |

**Commands:**

```bash
cd services/api && ./gradlew -q test
# Manual: ./scripts/start-dev.sh — tag an away show on Infos, compare Dispos % vs ordinary show
```

(No `apps/web` changes expected.)

### Testing requirements

- Unit: compartment slug for principal / deplacements / tagged / legacy deplacement.
- Unit: history service calls repository with compartment derived from event.
- Integration: principal vs deplacements history isolation (AC 5).
- Regression: existing `availability summary reflects non zero past selection history` still passes **within same compartment** (adjust setup if events were implicitly principal-only).

### References

- [Source: `_bmad-output/planning-artifacts/epics.md` — Story 17.9]
- [Source: `docs/adr/0013-troupe-navigation-equity-tags-event-slugs.md` — §3 tag, §5 draw/stats]
- [Source: `PLAN.md` — 17.9 P2, DoD phase domaine 17.7–17.10]
- [Source: `DOMAIN.md` — Equity tag, déplacement V2]
- [Source: `_bmad-output/implementation-artifacts/17-7-api-tag-equite-glossaire-troupe.md` — deferred history]
- [Source: `_bmad-output/implementation-artifacts/17-10-statistiques-filtre-groupes-spectacles.md` — compartment rules]
- [Source: `_bmad-output/implementation-artifacts/6-4-tirage-aleatoire-pondere-et-affichage-des-cotes-explainability.md` — history service FR19]
- [Source: `_bmad-output/planning-artifacts/ux-design-journey-league-agenda.md` — Screen 6b help copy context]

## Dev Agent Record

### Agent Model Used

Composer

### Debug Log References

### Completion Notes List

- `EquityCompartment.slug` centralise les règles 17.10 ; stats et tirage partagent la même source.
- `countValidatedSelectionsBySeasonAndCompartment` filtre l’historique validé par compartiment (principal / deplacements / tag glossaire).
- Tirage, candidats, explainability composition et résumé dispos (`includeChances`) passent `EquityCompartment.slug(event)`.
- Test d’intégration Malice : cotes égales sur spectacle principal après déplacement validé ; `pastSelectionCount` compté sur le 2ᵉ déplacement.
- Validé manuellement par le PO (2026-05-27) — story clôturée.

### File List

- services/api/src/main/kotlin/com/hatcast/api/event/EquityCompartment.kt (new)
- services/api/src/main/kotlin/com/hatcast/api/season/SeasonStatisticsCompartments.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/EventCompositionSlotRepository.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/CompositionSelectionHistoryService.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/CompositionDrawService.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/CompositionSlotAssignmentService.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/CompositionService.kt
- services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityService.kt
- services/api/src/test/kotlin/com/hatcast/api/event/EquityCompartmentTest.kt (new)
- services/api/src/test/kotlin/com/hatcast/api/composition/CompositionSelectionHistoryServiceTest.kt
- services/api/src/test/kotlin/com/hatcast/api/composition/CompositionDrawIntegrationTest.kt

### Change Log

- 2026-05-27 — Story 17.9 : historique de sélection et pondération du tirage scopés par compartiment d’équité.
- 2026-05-27 — Clôture : statut `done`, validation PO.
