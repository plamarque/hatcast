---
feature_branch: feat/17-44-hub-troupe-mini-chart-saison
baseline_commit: baaee37477724e9992364f9ea9a6d7cb0427b842
---

# Story 17.44: Hub troupe — mini-chart mois saison

Status: done

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

## Story

As a **member**,  
I want a **visual overview of the season year** in the troupe hub season card,  
so that I can **see show density at a glance** like on **Mes Stats**.

## Acceptance Criteria

1. **Given** the troupe hub season card (`/troupes/:slug`) with dashboard data loaded, **when** the selected season has **≥ 3 past spectacles** (`startsAt` strictly before “now” in Europe/Paris), **then** a **compact month-by-month chart band** renders **below the three metric tiles** (Spectacles / Compos / Personnes) and **above** the archived-seasons toggle. [Source: [ux-design-ma-troupe-hub.md](../planning-artifacts/ux-design-ma-troupe-hub.md) MT15 § Phase 2 ; epics 17.44]
2. **Given** **< 3 past spectacles** in the selected season, **when** the season card renders, **then** **no chart** is shown — metric tiles only (same as **17.42**). [Source: MT15 threshold]
3. **Given** the mini-chart is visible, **when** months are rendered, **then** each month column stacks **one block per past spectacle** in that month (not per participant) ; month order follows `monthKeys` from `GET /v1/seasons/:id/statistics` (school-year ordering already computed server-side). [Source: MT15 table]
4. **Given** a chart block (one spectacle), **when** hovered or focused, **then** tooltip shows **3 lines**: `{eventTitle}` ; `{teamStatusBadge.shortLabel}` (statut Équipe agenda : Confirmé, Collecte, Préparation, Brouillon…) ; `{participationCount} participation(s)` where `participationCount` = number of season participants whose `eventCellDetails[eventId].status` is **`selected`** or **`pending`**. [Source: MT15 MC7 — amend. 2026-06-14]
5. **Given** a chart block, **when** rendered, **then** block fill colour matches **Équipe agenda badge** tone from `StatisticsEvent.teamStatusBadge.tone` (`draft`, `collecting`, `preparing`, `confirmed`) — same palette as `composition-status-badge`, **not** neutral nor per-role participation colour. [Source: MT15 MC5 — amend. 2026-06-14]
6. **Given** a chart block, **when** the user taps/clicks it, **then** navigate to event detail via `saisonEventPath(troupeSlug, seasonSlug, eventSlug)` (Story **17.6** canonical URLs). [Source: MT15 — Tap → Event detail]
7. **Given** **> 12 month columns**, **when** the chart renders, **then** the band scrolls **horizontally** (`overflow-x: auto`, touch-friendly) inside the season card — same behaviour as Mes Stats chart. [Source: MT15]
8. **Given** season switcher changes selection or stats load fails, **when** dashboard reloads, **then** chart visibility and content update from the **same** `loadStatistics` call already used for Compos + Personnes ; stale responses ignored via existing `seasonDashboardRequestId` guard ; stats error → no chart (tiles keep working). [Source: 17.42 data-loading pattern]
9. **Given** stats still loading, **when** metric tiles show spinners, **then** chart area is **hidden** (do not flash partial/empty chart). [Source: 17.42 loading UX]
10. **Given** the mini-chart is visible, **when** the season card renders, **then** a **« Voir toutes les stats »** stroked button appears **below** the chart band, centered, linking to `saisonWorkspacePath(troupeSlug, seasonSlug)` with **`?view=stats`** (season statistics grid **3.6**). [Source: MT15 MC16 — amend. 2026-06-14]
11. **Given** implementation complete, **when** `npm run test -w @hatcast/web -- --watch=false --include troupe-hub` and `npm run build -w @hatcast/web`, **then** they pass with specs covering: chart visible at ≥3 past events, hidden at <3, month grouping, tooltip (title + status + participation count), status-based block colours, tap navigation, stats CTA link, hidden on stats error, cleared on season switch. [Source: repo norms]

**Product coverage:** [ux-design-hub-mini-chart-17-44.md](../planning-artifacts/ux-design-hub-mini-chart-17-44.md) (**MT15**, décisions MC1–MC16) ; parent [ux-design-ma-troupe-hub.md](../planning-artifacts/ux-design-ma-troupe-hub.md). **Out of scope:** hub dashboard refactor beyond chart (**17.42** done), event detail chrome (**17.43**), new BFF endpoint, per-role participation colouring (individual Mes Stats), role emoji on blocks, future events in chart.

---

## Acceptance Criteria — Material 3 (UI)

**M3-1. Composants Material** — **Given** chart blocks, **when** rendered, **then** use `matTooltip` (`MatTooltipModule`) for block tooltips ; chart container is semantic HTML (no custom button chrome) ; blocks are keyboard-focusable (`tabindex="0"` or native focusable wrapper) with French `aria-label` mirroring tooltip text. [Source: FRONTEND_UI.md ; reuse pattern from `member-profile-panel`]

**M3-2. Tokens & thème** — **Given** chart SCSS, **when** colors/spacing apply, **then** season event blocks use **`troupe-hub__season-chart-block--{draft|collecting|preparing|confirmed}`** modifiers aligned with [`composition-status-badge.scss`](../../apps/web/src/app/shared/composition/composition-status-badge.scss) tones ; compact hub variant may reduce min-heights but **only** `var(--mat-sys-*)` / `color-mix` for surfaces — no hex on feature SCSS. **Not** `member-profile__chart-block--neutral`. [Source: FRONTEND_UI.md ; MT15 MC5 amend. 2026-06-14]

**M3-3. Mobile & tactile** — **Given** ≤480px, **when** chart band visible, **then** blocks remain **≥ 32×32 dp** (compact band) with horizontal scroll ; tooltips remain accessible ; no layout break on metric tiles above. [Source: NFR-A1 ; MT15 compact band]

**M3-4. Navigation membre** — **Given** hub under `MemberShell`, **when** chart block tapped, **then** in-app navigation only (no new chrome). [Source: ux-hub-a-faire.md]

**M3-5. Revue** — **Given** implementation done, **when** validated, **then** walk FRONTEND_UI.md checklist § M3 ; note waivers in Dev Agent Record. [Source: AGENTS.md]

---

## Tasks / Subtasks

- [x] **Persist stats events for chart** (AC: 1, 3, 7, 8)
  - [x] In [`troupe-hub.ts`](../../apps/web/src/app/pages/troupe-hub/troupe-hub.ts): store `events` + `monthKeys` from `SeasonStatisticsResponse` alongside existing `statsRows` / `confirmedCompositionsCount` ; clear in `clearDashboardContent()`.
  - [x] Add `computed()` signals: `pastStatisticsEvents`, `showSeasonMiniChart`, `seasonMonthlyChart` (see Dev Notes transformation).

- [x] **Optional minimal API — event slug for navigation** (AC: 5)
  - [x] If `StatisticsEvent` lacks slug: add **`slug: String`** to `StatisticsEventDto`, OpenAPI [`seasons.yaml`](../../services/api/openapi/seasons.yaml), and [`season-statistics-api.service.ts`](../../apps/web/src/app/core/seasons/season-statistics-api.service.ts) `StatisticsEvent` interface ; map from `EventEntity.slug` in [`SeasonStatisticsService.kt`](../../services/api/src/main/kotlin/com/hatcast/api/season/SeasonStatisticsService.kt). Additive, backward-compatible.
  - [x] Skip API change only if navigation works without it (it does **not** today — slug required by `saisonEventPath`).

- [x] **Chart UI in season card** (AC: 1–6, M3-1–M3-3)
  - [x] Insert chart block in [`troupe-hub.html`](../../apps/web/src/app/pages/troupe-hub/troupe-hub.html) inside `.troupe-hub__season-card`, after `.troupe-hub__metrics`, guarded by `showSeasonMiniChart()`.
  - [x] Prefer extracting shared markup/SCSS: e.g. [`shared/participation-monthly-chart/`](../../apps/web/src/app/shared/) or SCSS partial `_hatcast-participation-monthly-chart.scss` imported by both `member-profile-dialog.scss` and `troupe-hub.scss` — **do not** fork block/tooltip styles.
  - [x] Hub compact modifier: e.g. `.troupe-hub__season-chart` with reduced `min-height` (~6–8rem vs 12.5rem profile chart).
  - [x] Wire `(click)` / `(keydown.enter)` on blocks → `Router.navigate(saisonEventPath(...))`.

- [x] **Pure function + unit tests** (AC: 3, 4)
  - [x] Add `buildSeasonHubMonthlyChart(events, rows, monthKeys, now)` in e.g. [`season-hub-mini-chart.utils.ts`](../../apps/web/src/app/pages/troupe-hub/season-hub-mini-chart.utils.ts) with tests in `.spec.ts`: past-event filter, threshold, participation count, month ordering.

- [x] **Hub component tests** (AC: 9)
  - [x] Extend [`troupe-hub.spec.ts`](../../apps/web/src/app/pages/troupe-hub/troupe-hub.spec.ts): mock stats with ≥3 past `events` → chart DOM present ; <3 → absent ; season switch clears chart ; stats error → absent.

- [x] **E2E (optional, non-blocking)**
  - [x] Extend [`e2e/helpers/troupe-hub.ui.ts`](../../apps/web/e2e/helpers/troupe-hub.ui.ts) with `expectTroupeHubSeasonChartVisible` when seed season has enough past events (Les Improbots offline).

- [x] **Amendement recette — couleurs statut + CTA stats** (AC: 4, 5, 10, M3-2)
  - [x] API : `teamStatusBadge: CompositionStatusBadgeDto` on `StatisticsEventDto` — enrich via `CompositionLifecycleEnrichmentService` in `SeasonStatisticsService.kt` ; OpenAPI + TS interface.
  - [x] Front : block classes `--draft|--collecting|--preparing|--confirmed` ; tooltip 3 lines (title, status, participations) ; fix SCSS (`background: transparent` removed on chart blocks).
  - [x] CTA **Voir toutes les stats** below chart → `saisonWorkspacePath` + `?view=stats` ; hub specs updated.

### Review Findings

- [x] [Review][Patch] Empty chart shell when monthKeys omit past-event months [`season-hub-mini-chart.utils.ts:98`] — `buildSeasonHubMonthlyChart` returns `[]` (not `null`) when ≥3 past events exist but `orderedMonthKeys` is empty ; `showSeasonMiniChart` shows bandeau + CTA without blocks.
- [x] [Review][Patch] Enter key may double-fire navigation on chart blocks [`troupe-hub.ts:539`] — native `<button>` already activates on Enter ; `onChartBlockKeydown` also handles Enter → potential duplicate `router.navigate`.
- [x] [Review][Patch] Missing test: chart hidden while stats loading [`troupe-hub.spec.ts`] — AC9 requires no chart during tile spinners ; no spec asserts `.troupe-hub__season-chart` absent while `loadingDashboard` is true.
- [x] [Review][Patch] No API integration test for `teamStatusBadge` on statistics events [`SeasonStatisticsServiceTest.kt`] — enrichment mocked to `emptyMap()` ; AC4/AC5 data pipeline untested end-to-end.
- [x] [Review][Patch] Desktop band height below MC15 spec [`troupe-hub.scss:198`] — UX MC15 requires ~7–9 rem at ≥840 px ; only 6.5 rem mobile value, no desktop media query.
- [x] [Review][Patch] Unknown `teamStatusBadge.tone` not validated [`season-hub-mini-chart.utils.ts:56`] — unexpected API tone yields CSS class without matching modifier.
- [x] [Review][Patch] Blank `eventSlug` not guarded before navigation [`troupe-hub.ts:515`] — missing slug could navigate to invalid event route.
- [x] [Review][Defer] E2E helper added but no Playwright spec consumes it [`troupe-hub.ui.ts:35`] — deferred, story marks E2E optional/non-blocking.
- [x] [Review][Defer] `slug` required on `StatisticsEvent` OpenAPI — deferred, monorepo co-deploy with front ; intentional breaking additive field.
- [x] [Review][Defer] Extra `loadViewsByEventIds` on every stats call [`SeasonStatisticsService.kt:144`] — deferred, acceptable story scope ; monitor if perf issue surfaces.

---

## Dev Notes

### Product and UX rules

- **Phase 2 only:** **17.42** shipped metric tiles + Personnes + teaser ; this story adds MT15 band **without** changing those sections.
- **Threshold « spectacles passés »:** events from statistics where `startsAt < now` (compare instants; API emits ISO-8601). Count **only past** events for the ≥3 gate ; chart blocks are **past events only** (future density belongs in « Prochains spectacles »).
- **Collective vs individual chart (MT15 table):**

  | Aspect | Mes Stats (`member-profile-panel`) | Hub saison (this story) |
  |--------|-----------------------------------|-------------------------|
  | Block | 1 participation, colour by status/role | 1 spectacle, **Équipe badge tone** (`teamStatusBadge`) |
  | Tooltip | Title + date + role/status | Title + **statut Équipe** + participation count |
  | Emoji on block | Role emoji when selected | **None** |
  | Layout | Full section « En un clin d'œil » | Compact band under metric tiles + **CTA stats** |

- **Participation count definition:** count rows where `eventCellDetails[eventId]?.status` ∈ `{ selected, pending }`. Do **not** count `available`, `unavailable`, `declined`, `neutral`. Matches « personnes assignées / en attente » on a spectacle.
- **Data source:** reuse existing `statsApi.loadStatistics(seasonId)` — response already includes `events`, `monthKeys`, `rows`. **No new BFF.** UX note « monthSummary stats saison » = aggregate derived from per-event cells across rows, not a new API field.
- **Guest / EXTERNE:** statistics API already scopes visible participants/events ; chart reflects the same permission-filtered dataset as Personnes strip.

### Current state (must read before edit)

| File / area | Today | This story |
|-------------|-------|------------|
| [`troupe-hub.html`](../../apps/web/src/app/pages/troupe-hub/troupe-hub.html) L155–184 | Season card = 3 metric tiles only | + conditional mini-chart band |
| [`troupe-hub.ts`](../../apps/web/src/app/pages/troupe-hub/troupe-hub.ts) L698–705 | Stores `rows` + `confirmedCompositionsCount` only | + `events`, `monthKeys`, chart computeds |
| [`member-profile-panel.html`](../../apps/web/src/app/shared/member-profile/member-profile-panel.html) L46–81 | Reference chart grammar | Reuse classes / extract shared partial |
| [`member-profile-dialog.scss`](../../apps/web/src/app/shared/member-profile/member-profile-dialog.scss) L103–194 | Chart layout + block modifiers | Share via partial ; hub adds compact overrides |
| [`StatisticsEvent`](../../apps/web/src/app/core/seasons/season-statistics-api.service.ts) | `slug` + `teamStatusBadge` | API + TS for navigation + block colours |

### Suggested data transformation

```typescript
/** Europe/Paris “past” — use existing date helpers if present; else parse startsAt ISO. */
function isPastEvent(startsAt: string, now: Date): boolean { /* … */ }

function countEventParticipations(
  eventId: string,
  rows: ParticipantStatisticsRow[],
): number {
  return rows.filter((row) => {
    const s = row.eventCellDetails[eventId]?.status
    return s === 'selected' || s === 'pending'
  }).length
}

/** Returns null when pastEvents.length < 3 */
function buildSeasonHubMonthlyChart(
  events: StatisticsEvent[],
  rows: ParticipantStatisticsRow[],
  monthKeys: string[],
  now: Date,
): { monthKey: string; blocks: SeasonHubChartBlock[] }[] | null
```

Filter `events` to past → if `< 3` return null → group by `monthKey` → order months by `monthKeys` intersection → sort blocks within month by `startsAt` then `title` (mirror backend `loadMonthlyChart` ordering in [`SeasonGlanceStatsProvider.kt`](../../services/api/src/main/kotlin/com/hatcast/api/memberprofile/SeasonGlanceStatsProvider.kt)).

### Layout (mobile, season card)

```text
┌─────────────────────────────────────┐
│  45       11       37               │
│  Spectacles Compos Personnes        │
│  ┌─ chart band (scroll if >12 mo) ─┐│
│  │ JAN FEV MAR …  (status-coloured blocks) ││
│  └─────────────────────────────────┘│
│     [ Voir toutes les stats ]       │
└─────────────────────────────────────┘
```

### Frontend implementation guardrails

| Concern | Action |
|--------|--------|
| Reuse | `loadStatistics`, `member-profile__chart*` SCSS, `matTooltip`, `saisonEventPath`, `seasonDashboardRequestId` stale guard |
| Do not | Duplicate full `member-profile-panel` ; add troupe-hub BFF ; show chart when stats loading/error ; colour blocks by **individual participation role** |
| Perf | No extra HTTP — chart derived from stats response already fetched for Compos/Personnes |
| Regression | All **17.42** dashboard AC + e2e helpers in `troupe-hub.ui.ts` |
| i18n | Tooltip FR: `{title}\n{statusLabel}\n{n} participation(s)` — singular « participation » when n = 1 |

### Explicit non-goals

| Item | Story |
|------|-------|
| Hub dashboard sections (Personnes, teaser, switcher) | **17.42** (done) |
| Event detail breadcrumb / Infos Saison | **17.43** |
| Individual member monthly chart API changes | N/A |
| Season statistics full grid / export | **3.6** |
| Chart for archived-season inline list | Out of scope |

### Dependencies

| Story | Status | Relationship |
|-------|--------|--------------|
| **17.42** | done | Season card + `loadStatistics` — prerequisite |
| **17.6** | done | Event URLs require `eventSlug` |
| **17.41** | done | Hub route + nav — unchanged |
| **3.6** | done | Statistics API shape (`events`, `rows`, `monthKeys`) |

### Previous story intelligence (17.42)

- **`loadSeasonDashboard`** already parallel-fetches stats + workspace ; extend stats branch only.
- **Review patches to preserve:** `clearDashboardContent()` on season switch ; `seasonDashboardRequestId` + `selectedSeasonId` stale guards ; do not show partial Personnes while loading — same rule for chart.
- **Stats error:** Compos shows `—` ; chart must **not** render (avoid misleading empty band).
- **Test command:** `--include troupe-hub` or `'**/troupe-hub.spec.ts'` — 32+ specs baseline.
- **E2E:** `e2e/helpers/troupe-hub.ui.ts` + `e1/member-troupe-hub.mobile.spec.ts` — extend optionally.

### Git intelligence

Recent `v2` commits are event-detail badge fix (**17.43**), About metadata (**10.3b**), story-branch workflow — no conflicting hub work. Hub files last touched by **17.42**.

### Architecture compliance

- **Primary:** `apps/web/` front-only ; **optional** additive field on existing statistics DTO (Kotlin + OpenAPI) for event slug.
- **Routes:** no new routes.
- **Angular 21.2 + Material 21.2** — signals, `computed`, `inject`.
- **Time zone:** align past-event filter with API `monthKey` (Europe/Paris) — use same convention as [`SeasonStatisticsService.monthKey`](../../services/api/src/main/kotlin/com/hatcast/api/season/SeasonStatisticsService.kt).

### Library / framework notes

- **Angular Material 21.2** — `MatTooltipModule` already used in `member-profile-panel`.
- No charting library — CSS blocks only (existing pattern).

### Testing

```bash
npm run test -w @hatcast/web -- --watch=false --include troupe-hub
npm run test -w @hatcast/web -- --watch=false --include season-hub-mini-chart
npm run build -w @hatcast/web
# If API slug field added:
./gradlew test --tests '*SeasonStatistics*'
```

Manual smoke: season with ≥3 past shows · season with 0–2 past hides chart · switch season updates chart · tap block opens event · stats failure hides chart · horizontal scroll with long season.

### Project context reference

- [project-context.md](../../project-context.md) — branch `feat/17-44-hub-troupe-mini-chart-saison`, M3 checklist, reuse `shared/`.
- [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md) — tokens, tactile targets.
- [ux-design-hub-mini-chart-17-44.md](../planning-artifacts/ux-design-hub-mini-chart-17-44.md) (spec normative MT15).

---

## Dev Agent Record

### Agent Model Used

Composer (dev-story 17.44)

### Completion Notes List

- Added `statsEvents` / `statsMonthKeys` signals + `seasonMonthlyChart` / `showSeasonMiniChart` computeds in `troupe-hub.ts`; chart hidden while loading or on stats error; cleared on season switch via existing `clearDashboardContent()`.
- Pure transform `buildSeasonHubMonthlyChart` in `season-hub-mini-chart.utils.ts` — past-event filter, ≥3 threshold, participation count (`selected`/`pending`), month ordering from API `monthKeys`.
- Chart UI in season card: status-coloured blocks (`teamStatusBadge.tone`), `matTooltip` (title + status + participations), keyboard-accessible buttons, tap → `saisonEventPath`.
- Extracted shared SCSS partial `_hatcast-participation-monthly-chart.scss` (reused by member profile + hub compact `.troupe-hub__season-chart`, blocks kept ≥ 32×32 dp on mobile).
- API additive: `slug` + `teamStatusBadge` on `StatisticsEventDto` / OpenAPI / TS interface (navigation AC6 + colours AC5).
- CTA **Voir toutes les stats** below chart → workspace saison `?view=stats`.
- Tests: utils + hub specs (status tooltip, CTA link, block tone classes) ; `./gradlew test --tests '*SeasonStatistics*'` green ; `npm run build -w @hatcast/web` green.
- **M3 checklist:** M3-1–M3-4 validated ; M3-5 walk done — no waivers.

### File List

- `apps/web/src/app/pages/troupe-hub/troupe-hub.ts`
- `apps/web/src/app/pages/troupe-hub/troupe-hub.html`
- `apps/web/src/app/pages/troupe-hub/troupe-hub.scss`
- `apps/web/src/app/pages/troupe-hub/troupe-hub.spec.ts`
- `apps/web/src/app/pages/troupe-hub/season-hub-mini-chart.utils.ts`
- `apps/web/src/app/pages/troupe-hub/season-hub-mini-chart.utils.spec.ts`
- `apps/web/src/app/shared/participation-monthly-chart/_hatcast-participation-monthly-chart.scss`
- `apps/web/src/app/shared/member-profile/member-profile-dialog.scss`
- `apps/web/src/app/core/seasons/season-statistics-api.service.ts`
- `apps/web/e2e/helpers/troupe-hub.ui.ts`
- `services/api/src/main/kotlin/com/hatcast/api/season/dto/SeasonStatisticsDtos.kt`
- `services/api/src/main/kotlin/com/hatcast/api/season/SeasonStatisticsService.kt`
- `services/api/openapi/seasons.yaml`
- `services/api/src/test/kotlin/com/hatcast/api/season/SeasonStatisticsServiceTest.kt`
- `services/api/src/test/kotlin/com/hatcast/api/season/SeasonStatisticsEventCellTest.kt`
- `apps/web/src/app/pages/season-home/season-statistics.spec.ts`
- `apps/web/src/app/pages/season-home/season-statistics-export.spec.ts`
- `apps/web/src/app/pages/season-home/season-home.spec.ts`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

### Change Log

- 2026-06-14 : Story created (bmad-create-story 17.44) — hub mini-chart MT15 phase 2.
- 2026-06-14 : UX spec normative ajoutée — [ux-design-hub-mini-chart-17-44.md](../planning-artifacts/ux-design-hub-mini-chart-17-44.md) (Sally, mockups validés).
- 2026-06-14 : Implementation complete (dev-story) — hub season mini-chart MT15, shared chart SCSS, stats event slug API field, unit tests.
- 2026-06-14 : Amendement recette — couleurs statut Équipe (`teamStatusBadge` API), tooltip 3 lignes, CTA « Voir toutes les stats » → `?view=stats` ; specs MT15 MC5/MC7/MC16 alignées.

---

### Validation create-story

- [x] AC métier numérotés et sourcés (ux-design-ma-troupe-hub MT15 ; epics 17.44)
- [x] Section **Material 3** remplie
- [x] Tasks référencent les AC (y compris M3-x)
- [x] Liens vers fichiers code existants à réutiliser
- [x] `npm run test` / build mentionnés
