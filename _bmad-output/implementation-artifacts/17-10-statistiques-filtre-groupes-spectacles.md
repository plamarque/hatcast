# Story 17.10: Statistics — spectacle group filter (compartments)

Status: done

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

## Story

As a **season member or organizer**,
I want to **filter statistics by spectacle groups** (ordinary shows + troupe equity tags),
so that **I can analyze participation for the whole season or for specific programmes** (e.g. away shows only) using one consistent JEU / DECORUM / BÉNÉVOLE grid.

## Acceptance Criteria

1. **Given** the **Statistiques** view (story **3.6**), **when** displayed, **then** the table shows **JEU, DECORUM, BÉNÉVOLE** bands only — **no DEPLACEMENT band** (`deplacementJeu`, `deplacementDecorum`, `totalDeplacement` removed from UI and CSV).
2. **Given** toolbar filter **Groupes de spectacles**, **when** opened, **then** it offers **Tous les spectacles** (default ON), **Spectacles ordinaires** (`equity_tag` null), and one checkbox per troupe glossary tag (API **17.7** labels).
3. **Given** **Tous les spectacles** ON, **when** stats load, **then** all non-archived season events are included (all compartments).
4. **Given** **Tous** OFF and one or more groups checked, **when** stats load, **then** only events in those compartments are aggregated (OR semantics between checked groups).
5. **Given** only **Déplacements** checked, **when** stats are shown, **then** totals use the same JEU/DECORUM columns as ordinary shows (role routing by `templateType`, not legacy DEPLAC. columns).
6. **Given** **CSV export**, **when** triggered, **then** the same event set as the active group filter (+ existing Membres / Spectacle filters).
7. **Given** legacy `template_type = deplacement` and `equity_tag` null, **when** the **Déplacements** group is selected (or **Tous**), **then** the event is included as compartment `deplacements` for filtering only — **no DB migration** ( **MIG-4** ).
8. **Given** **Tous** OFF and **no** group checked, **when** the view renders, **then** empty state: *« Sélectionnez au moins un groupe de spectacles pour afficher les statistiques. »*
9. **Given** groups selected but no matching events/data, **when** the view renders, **then** *« Aucune donnée pour les groupes sélectionnés sur cette saison. »*
10. **Given** closed filter button, **when** selection changes, **then** label reflects state (`Tous les spectacles`, single glossary label, `N sélectionnés`, `Aucun`).

## Tasks / Subtasks

- [x] **API — compartment filter** (AC: 3–7)
  - [x] Add `@RequestParam(required = false) equityCompartments: String?` on [`SeasonStatisticsController.kt`](../../services/api/src/main/kotlin/com/hatcast/api/season/SeasonStatisticsController.kt).
  - [x] Parse: missing or `all` → all events; `principal` → `equityTag == null` **excluding** legacy `template_type = deplacement` (those belong to `deplacements` bucket); slug → `equityTag == slug`; legacy `deplacement` template counts as `deplacements` when that slug is requested.
  - [x] Empty explicit list (e.g. `equityCompartments=`) → return empty `events` / `rows` (or 200 with empty payload — prefer empty grid contract for AC 8).
  - [x] Filter `events` in [`SeasonStatisticsService.loadStatistics`](../../services/api/src/main/kotlin/com/hatcast/api/season/SeasonStatisticsService.kt) **before** aggregation (same list drives month columns and `events` in DTO).

- [x] **API — remove DEPLACEMENT columns** (AC: 1, 5)
  - [x] Remove `deplacementJeu`, `deplacementDecorum`, `totalDeplacement` from [`SeasonStatisticsRules.COLUMN_KEYS`](../../services/api/src/main/kotlin/com/hatcast/api/season/SeasonStatisticsRules.kt).
  - [x] Drop `isDeplacementEvent` branching in `eventMatchesColumn`, `selectionColumnForRole`, `rolesForColumn`, `incrementSelectionTotals` — route **all included events** by `templateType` + role (player → match/cab/long/autre; decorum roles → decorum columns).
  - [x] Update [`SeasonStatisticsRulesTest.kt`](../../services/api/src/test/kotlin/com/hatcast/api/season/SeasonStatisticsRulesTest.kt) and any integration tests for stats endpoint.
  - [x] Add tests: filter `principal` only; `deplacements` only; `principal,deplacements`; legacy `deplacement` template maps to deplacements bucket; ordinary match not in deplacements-only filter.

- [x] **Web — API client** (AC: 3–6)
  - [x] Extend [`season-statistics-api.service.ts`](../../apps/web/src/app/core/seasons/season-statistics-api.service.ts) `loadStatistics` with `equityCompartments?: 'all' | string[]` → query `equityCompartments=all` or `equityCompartments=principal,deplacements`.
  - [x] Refetch stats in [`season-home.ts`](../../apps/web/src/app/pages/season-home/season-home.ts) when group selection changes (alongside participant/event filters).

- [x] **Web — toolbar filter UI** (AC: 2, 8–10)
  - [x] Add group filter to [`season-view-toolbar`](../../apps/web/src/app/pages/season-home/season-view-toolbar.ts) / `.html` / `.scss` (stats row only): trigger **Groupes de spectacles**, panel with **Tous les spectacles** + **Spectacles ordinaires** + glossary checkboxes.
  - [x] Load glossary via existing `listEquityTags(troupeId)` from [`troupe-api.service.ts`](../../apps/web/src/app/core/troupes/troupe-api.service.ts) in `season-home` (already loaded for agenda badges).
  - [x] Help copy per UX spec (French `mat-hint`).
  - [x] Wire models: `statsEquityCompartments` signal — default `all`; sync **Tous** with individual checkboxes per UX rules.
  - [x] Pass `statsEquityCompartments` into `loadStatistics`; show empty states in [`season-statistics.html`](../../apps/web/src/app/pages/season-home/season-statistics.html) or parent when AC 8/9.

- [x] **Web — table & export** (AC: 1, 6)
  - [x] Remove DEPLACEMENT band from [`season-statistics.html`](../../apps/web/src/app/pages/season-home/season-statistics.html), `.ts` (`deplacementExpanded`, `deplacementDetailsVisible`), `.scss` (`--depl` band).
  - [x] Remove DEPLAC columns from [`season-statistics-export.ts`](../../apps/web/src/app/pages/season-home/season-statistics-export.ts) and [`season-statistics-export.spec.ts`](../../apps/web/src/app/pages/season-home/season-statistics-export.spec.ts).
  - [x] Optional: CSV metadata comment row `Groupes: …` per UX spec.

- [x] **Docs** (AC: 7)
  - [x] No SPEC change required if behaviour matches DOMAIN; note in story completion only. **Do not** implement **MIG-4** or remove `deplacement` template from API/UI.

## Dev Notes

### Product and UX rules

- **Authoritative UX:** [_bmad-output/planning-artifacts/ux-design-stats-equity-compartment-filter-17-10.md](../planning-artifacts/ux-design-stats-equity-compartment-filter-17-10.md) (approved 2026-05-25).
- **UI label for null tag:** **Spectacles ordinaires** (not « Principal »). API/query token remains `principal` for stability with ADR 0013 reserved slugs.
- **Tous les spectacles:** default; equivalent to all compartments selected.
- **Compartment = event filter**, not extra table columns. After filter, Malice away show (`equity_tag=deplacements`, `templateType=match`) counts player selections in **JEU MATCH**, not a green DEPLAC. band.
- **Ordinary compartment:** `equity_tag IS NULL` AND `template_type != 'deplacement'` (legacy away rows without tag belong to **deplacements** compartment only).

### Explicit non-goals (scope guard)

- Do **not** implement draw/chances partitioning — **17.9**.
- Do **not** run DB backfill `deplacement` → `equity_tag` — **MIG-4** (post prod import).
- Do **not** remove `deplacement` from `EventType` / create dialog — separate migration story.
- Do **not** add equity filter to **Agenda** or **Historique** (stats view only).
- Do **not** change Infos tag UI — **17.8** done.

### API contract (proposed)

| Query | Behaviour |
|-------|-----------|
| *(omit)* or `equityCompartments=all` | All non-archived events |
| `equityCompartments=principal` | `equityTag == null` and `templateType != 'deplacement'` |
| `equityCompartments=deplacements` | `equityTag == 'deplacements'` OR (`equityTag == null` AND `templateType == 'deplacement'`) |
| `equityCompartments=principal,deplacements` | Union |
| `equityCompartments=` (empty) | No events |

Repeatable param `equityCompartments=principal&equityCompartments=deplacements` is acceptable if easier in Spring than CSV string.

### Frontend implementation guardrails

| Concern | Pattern |
|--------|---------|
| Glossary labels | Reuse `equityTagLabels` map from `season-home` (17.8 agenda pattern) |
| Filter placement | [`season-view-toolbar.html`](../../apps/web/src/app/pages/season-home/season-view-toolbar.html) stats block — after Spectacles, before Exporter |
| Refetch | Mirror `loadStatistics` debounce on `selectedStatsEventId` / `selectedParticipantId` |
| Empty selection | Client can avoid API call when zero groups checked; show AC 8 copy immediately |
| Tests | `season-view-toolbar.spec.ts` (new or extend), `season-statistics` specs, API service spec with query string |

### Backend refactor sketch

After event list is filtered by compartment, **delete** deplacement-specific column keys and treat every event like a “local” show for column routing:

```kotlin
// selectionColumnForRole — player branch (simplified)
"player" -> when (event.templateType) {
    "match" -> "jeuMatch"
    "cabaret" -> "jeuCab"
    "longform" -> "jeuLong"
    else -> "jeuAutre"
}
```

Legacy `template_type = deplacement` typically has no match/cab/long — lands in **jeuAutre** when included via deplacements filter.

### Dependencies

| Story | Status | Role |
|-------|--------|------|
| **3.6** | done | Stats grid, export, toolbar shell |
| **17.7** | done | `equity_tag` column, glossary API |
| **17.8** | done | Tag assignment on Infos |
| **17.9** | backlog | Independent; do not block 17.10 |

### Project Structure Notes

- API: `services/api/src/main/kotlin/com/hatcast/api/season/`
- Web: `apps/web/src/app/pages/season-home/`, `apps/web/src/app/core/seasons/season-statistics-api.service.ts`
- UX amend: `ux-design-season-historique-statistiques.md` D6/D9 already reference this story

### References

- [Source: epics.md § Story 17.10](../planning-artifacts/epics.md)
- [Source: PLAN.md § Epic 17, MIG-4](../../PLAN.md)
- [Source: ADR 0013 §5 stats](../../docs/adr/0013-troupe-navigation-equity-tags-event-slugs.md)
- [Source: DOMAIN.md § Statistiques de composition](../../DOMAIN.md)
- [Source: ux-design-stats-equity-compartment-filter-17-10.md](../planning-artifacts/ux-design-stats-equity-compartment-filter-17-10.md)
- [Source: 3-6 implementation](../implementation-artifacts/3-6-vue-historique-colonnes-roles-mois-export-masquage.md)
- [Source: 17-8 implementation](../implementation-artifacts/17-8-ui-onglet-infos-tag-equite.md) — glossary load pattern

## Dev Agent Record

### Agent Model Used

Composer (dev-story workflow)

### Debug Log References

### Completion Notes List

- API: `SeasonStatisticsCompartments` parses `equityCompartments` (all / none / selected slugs) and filters events before aggregation; legacy `template_type=deplacement` maps to `deplacements` compartment.
- API: Removed DEPLACEMENT column keys; player/decorum routing uses `templateType` only (away `match` + `equity_tag=deplacements` → JEU MATCH).
- Web: Toolbar **Groupes de spectacles** multi-select with UX labels and empty states (AC 8/9); refetch on selection change; CSV `Groupes:` metadata row.
- Tests: `SeasonStatisticsCompartmentsTest`, updated rules/service tests, `stats-equity-compartments.spec.ts`, toolbar/export specs.

### File List

- services/api/src/main/kotlin/com/hatcast/api/season/SeasonStatisticsCompartments.kt
- services/api/src/main/kotlin/com/hatcast/api/season/SeasonStatisticsRules.kt
- services/api/src/main/kotlin/com/hatcast/api/season/SeasonStatisticsController.kt
- services/api/src/main/kotlin/com/hatcast/api/season/SeasonStatisticsService.kt
- services/api/src/test/kotlin/com/hatcast/api/season/SeasonStatisticsCompartmentsTest.kt
- services/api/src/test/kotlin/com/hatcast/api/season/SeasonStatisticsRulesTest.kt
- services/api/src/test/kotlin/com/hatcast/api/season/SeasonStatisticsServiceTest.kt
- apps/web/src/app/core/seasons/season-statistics-api.service.ts
- apps/web/src/app/pages/season-home/stats-equity-compartments.ts
- apps/web/src/app/pages/season-home/stats-equity-compartments.spec.ts
- apps/web/src/app/pages/season-home/season-view-toolbar.ts
- apps/web/src/app/pages/season-home/season-view-toolbar.html
- apps/web/src/app/pages/season-home/season-view-toolbar.scss
- apps/web/src/app/pages/season-home/season-view-toolbar.spec.ts
- apps/web/src/app/pages/season-home/season-home.ts
- apps/web/src/app/pages/season-home/season-home.html
- apps/web/src/app/pages/season-home/season-statistics.ts
- apps/web/src/app/pages/season-home/season-statistics.html
- apps/web/src/app/pages/season-home/season-statistics.scss
- apps/web/src/app/pages/season-home/season-statistics-export.ts
- apps/web/src/app/pages/season-home/season-statistics-export.spec.ts

## Change Log

- 2026-05-25: Story 17.10 — stats equity compartment filter, DEPLACEMENT band removed, CSV groups metadata (dev-story).

### Review Findings

- [x] [Review][Patch] Import `beforeEach` manquant dans le spec toolbar — [`season-view-toolbar.spec.ts:3`](../../apps/web/src/app/pages/season-home/season-view-toolbar.spec.ts) importe `describe, expect, it` depuis vitest mais utilise `beforeEach` non importé ; la suite échoue sous vitest.
- [x] [Review][Patch] Données stats obsolètes après échec API — [`season-home.ts:699`](../../apps/web/src/app/pages/season-home/season-home.ts) en cas de `!r.ok`, snackbar seulement ; `statisticsData` conserve l’ancien jeu de données alors que le filtre groupes a changé.
- [x] [Review][Defer] Pas de test MockMvc du paramètre `equityCompartments` — [`SeasonStatisticsController.kt`](../../services/api/src/main/kotlin/com/hatcast/api/season/SeasonStatisticsController.kt) ; couverture service + unitaires compartiments suffisante pour cette story — deferred, pre-existing pattern
- [x] [Review][Defer] Bottom sheet mobile pour le filtre groupes — [ux-design-stats-equity-compartment-filter-17-10.md](../planning-artifacts/ux-design-stats-equity-compartment-filter-17-10.md) § Mobile ; menu Material desktop livré — deferred, hors scope story (polish mobile)
- [x] [Review][Defer] Deep link `?statsGroups=` — UX F10 optionnel ; non implémenté — deferred, explicitement optionnel
