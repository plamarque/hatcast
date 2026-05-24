# Story 12.3: Troupe and league filters on user agenda

Status: done

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

## Story

As a **signed-in member** who participates in **more than one troupe and/or more than one league**,
I want **troupe and league filters on Mon agenda** (`/agenda`),
so that I can focus on the events that matter for a specific context without losing troupe/league badges on each row (FR8, FR55, UX-DR14).

## Acceptance Criteria

1. **Given** `GET /v1/me/agenda` returns `filterBarVisible: true`, **when** `/agenda` loads, **then** a sticky filter bar appears below the title with **Toutes les troupes ▾**, **Toutes les ligues ▾**, and **Effacer filtres** (UX-DR14, RES-001). [Source: `ux-design-journey-league-agenda.md` Screen 2 Filters]
2. **Given** `filterBarVisible: false` (exactly one participating troupe **and** exactly one participating league), **when** `/agenda` loads, **then** the filter bar is **not rendered**; troupe and league badges remain on every event row. [Source: epics Story 12.3; Story 12.1 `filterBarVisible` algorithm]
3. **Given** the filter bar is visible, **when** the user selects a troupe, **then** the app reloads the agenda with `troupeId` query param and shows only matching events; league dropdown options are **scoped to that troupe** (participations only). [Source: FR8; UX Screen 2]
4. **Given** the filter bar is visible, **when** the user selects a league, **then** the app reloads with `leagueId` (and current `troupeId` if set); only events for that league appear. [Source: Story 12.1 AC5]
5. **Given** active troupe and/or league filters, **when** the user clicks **Effacer filtres**, **then** both filters reset, URL query params clear, and the full unfiltered agenda reloads. [Source: epics Story 12.3]
6. **Given** active filters and an empty result (`content: []`, `noParticipation: false`), **when** the list renders, **then** show **Aucun spectacle à venir.** plus a muted hint to adjust or clear filters (UX Screen 2 empty states). Do **not** show the no-participation empty state.
7. **Given** filter bar visible, **when** the user changes filters, **then** filtering is **server-side** via existing `GET /v1/me/agenda?troupeId=&leagueId=` — do **not** client-filter the already-loaded page. [Source: Story 12.1]
8. **Given** `/agenda?troupeId=<uuid>&leagueId=<uuid>` on first navigation, **when** the page loads and `filterBarVisible` is true, **then** initial filter state reflects query params and the first API call includes them (deep link for Story 16.1 Planning CTA). Invalid UUIDs in URL are ignored client-side; API 400 still surfaces retryable error.
9. **Given** filter bar visible, **when** filters change, **then** persist `{ troupeId, leagueId }` in `sessionStorage` under `hatcast.agenda.filters` and restore on next `/agenda` visit when query params are absent. Clear storage when filters are cleared or when `filterBarVisible` becomes false.
10. **Given** Story 12.3 complete, **when** Vitest runs for `@hatcast/web`, **then** tests cover: bar hidden when `filterBarVisible: false`; bar shown with menus when true; troupe filter triggers API call with `troupeId`; league filter with `leagueId`; clear restores unfiltered call; filtered empty state copy; URL query param bootstrap. [Source: NFR-Q1]

## Tasks / Subtasks

- [x] **API filter catalog (recommended — unblocks correct dropdown options)** (AC: 3, 4)
  - [x] Extend `UserAgendaResponse` with optional `participationFilters` when `filterBarVisible: true`:
    - `troupes: [{ id, name, slug }]`
    - `leagues: [{ id, title, slug, troupeId }]`
  - [x] Build from the **same participation universe** as `filterBarVisible` (ACTIVE season + event-only, non-archived) — not from the filtered `content` array.
  - [x] Add repository queries (or one joined query) to resolve names/slugs for participating troupe/league ids already collected in `UserAgendaService.participationContext`.
  - [x] Update `services/api/openapi/me-agenda.yaml` and `UserAgendaIntegrationTest` (multi-troupe fixture → non-empty `participationFilters`).
  - [x] **Do not** change `filterBarVisible` / `noParticipation` semantics.

- [x] **Extend frontend API client** (AC: 3, 4, 7, 8)
  - [x] Add `troupeId?: string` and `leagueId?: string` to `UserAgendaListParams` in `user-agenda-api.service.ts`.
  - [x] Append query params to fetch URL when set.
  - [x] Add TypeScript types for `participationFilters` on `UserAgendaResponse`.
  - [x] Update `user-agenda-api.service.spec.ts` for param serialization.

- [x] **Filter bar UI component** (AC: 1, 2, 3, 4, 5)
  - [x] Create `apps/web/src/app/shared/agenda/user-agenda-filter-bar/` (standalone component + spec) **or** inline in `user-agenda` if < ~80 lines — prefer **shared** component; Story **16.1** will reuse the RES-001 pattern.
  - [x] Match UX wireframe: two `mat-stroked-button` + `mat-menu` dropdowns (same interaction pattern as `season-view-toolbar`), labels **Toutes les troupes** / **Toutes les ligues** when unset.
  - [x] Show **Effacer filtres** only when at least one filter is active (`mat-button` text or stroked).
  - [x] League menu options = `participationFilters.leagues` filtered by selected troupe (or all leagues when no troupe selected).
  - [x] When troupe changes and current `leagueId` is not in scoped list → clear `leagueId` before reload.
  - [x] Sticky positioning below header (`position: sticky; top: 0; z-index` with backdrop consistent with dark theme).

- [x] **Wire filters into `UserAgenda` page** (AC: 1–9)
  - [x] Store `filterBarVisible`, `participationFilters`, `selectedTroupeId`, `selectedLeagueId` as signals.
  - [x] Read `ActivatedRoute.snapshot.queryParamMap` on init for `troupeId` / `leagueId`; else restore from `sessionStorage`.
  - [x] On filter change: update signals, persist storage, `router.navigate([], { queryParams, queryParamsHandling: 'merge', replaceUrl: true })`, call `loadAgenda()`.
  - [x] Pass `troupeId` / `leagueId` into `UserAgendaApiService.listAgenda`.
  - [x] Render filter bar only when `filterBarVisible()` is true after a successful load.
  - [x] Differentiate empty states: `noParticipation` vs filtered-empty vs unfiltered-empty (AC6).

- [x] **Tests** (AC: 10)
  - [x] Extend `user-agenda.spec.ts` with filter scenarios (mock API).
  - [x] Add `user-agenda-filter-bar.spec.ts` if extracted component.
  - [x] Backend: integration test for `participationFilters` shape when `filterBarVisible: true`.

## Dev Notes

### Scope boundaries

| In scope (12.3) | Out of scope |
|-----------------|--------------|
| Troupe/league filter bar on `/agenda` | Personal season glance filters (**16.1** — reuse component only) |
| Server-side filtering via existing query params | Pagination / load-more UI |
| `participationFilters` API catalog (recommended) | Post-login routing (**12.5** — done) |
| URL query params + sessionStorage persistence | `/ligue/:slug` alias (**12.6**) |
| Filtered vs unfiltered empty states | Multi-active league migration (**Epic 13**) |
| Vitest coverage | Cross-league Statistiques filters (**3.6b**) |

This story is primarily **frontend**. A **small additive API extension** (`participationFilters`) is recommended so dropdowns list all participating troupes/leagues even when some have **zero upcoming events** — deriving options only from `content` violates UX-DR14 ("leagues where user is participant").

### Product rules (normative)

| Rule | Implementation |
|------|----------------|
| RES-001 visibility | Trust **`filterBarVisible` from API** — never recompute client-side from row count |
| Filter application | **Server-side** `troupeId` / `leagueId` query params (Story 12.1 AC5) |
| `filterBarVisible` stability | Remains based on **all** participations, **not** filtered result set (Story 12.1) |
| League scope | League dropdown lists participations; when troupe selected, restrict to `league.troupeId === selectedTroupeId` |
| Row badges | Always show `troupeName` + `leagueTitle` on cards — unchanged from 12.2 |
| Inter-troupe rows | Still one row per `eventId`; filters may hide one side of an encounter |
| Terminology | UI copy: **Troupe**, **Ligue**; code may keep `season` / `leagueId` (season UUID) |

### API contract (extend Story 12.1)

Existing fetch:

```http
GET /v1/me/agenda?page=0&size=50&scope=upcoming&troupeId=<uuid>&leagueId=<uuid>
```

Add to response when `filterBarVisible: true`:

```json
{
  "content": [ "... unchanged ..." ],
  "page": 0,
  "size": 50,
  "totalElements": 3,
  "totalPages": 1,
  "filterBarVisible": true,
  "noParticipation": false,
  "participationFilters": {
    "troupes": [
      { "id": "uuid", "name": "La BIM", "slug": "la-bim" }
    ],
    "leagues": [
      { "id": "uuid", "title": "Ligue Compétition 2026", "slug": "competition-2026", "troupeId": "uuid" }
    ]
  }
}
```

When `filterBarVisible: false`, omit `participationFilters` or set `null`.

**Fallback (if API extension deferred):** accumulate distinct troupe/league pairs from unfiltered `content` — document in Dev Agent Record that participations without upcoming events won't appear in menus (acceptable only as temporary MVP).

### UX copy (French — use exactly)

| Control | Default label |
|---------|---------------|
| Troupe menu | **Toutes les troupes** |
| League menu | **Toutes les ligues** |
| Clear action | **Effacer filtres** |
| Filtered empty hint | e.g. *Aucun spectacle à venir pour cette sélection. Essaie d’élargir les filtres.* |

Filter bar layout reference:

```
[ Toutes les troupes ▾ ]  [ Toutes les ligues ▾ ]     [ Effacer filtres ]
```

[Source: `ux-design-journey-league-agenda.md` Screen 2]

### Implementation guardrails

- **Do not hide the filter bar** when the filtered list is empty but `filterBarVisible` is true — user must be able to clear filters.
- **Do not client-filter** `items()` after fetch; always refetch with query params.
- **Do not recompute `filterBarVisible`** from `participationFilters` length or `content.length`.
- **Do not break Story 12.2** behaviors: month grouping, duplicate inter-troupe rows, 401 redirect, retryable errors, keyboard row activation, account menu.
- **Do not use `TroupeContextService.activeTroupes`** as the troupe filter source — troupe **membership** ≠ league **participation** (event-only guests, multiple leagues per troupe).
- **Do not add** participant/event filters from `season-view-toolbar` — those are league-scoped organizer tools, not cross-scope member filters.
- **Prefer server-side catalog** over scraping `content` for dropdown labels.
- **Sync URL + sessionStorage** on every filter change so `/agenda?troupeId=…` is shareable/bookmarkable for 16.1.

### Existing code to reuse

| File | Reuse for |
|------|-----------|
| `apps/web/src/app/pages/user-agenda/user-agenda.*` | Extend in place — page shell, loading/empty/error states |
| `apps/web/src/app/core/agenda/user-agenda-api.service.ts` | Add query params + response fields |
| `apps/web/src/app/pages/season-home/season-view-toolbar.*` | Mat-menu filter button pattern, SCSS for filter row |
| `services/api/.../UserAgendaService.kt` | `participationContext` + new catalog builder |
| `services/api/.../UserAgendaRepository.kt` | Existing participation id queries; add name/slug joins |
| `services/api/openapi/me-agenda.yaml` | Contract source of truth |

### Previous story intelligence

- **12.1 (done):** `troupeId` / `leagueId` query filters implemented and integration-tested; `filterBarVisible` from participation counts; invalid UUID → 400; non-participating id → empty page (not 403).
- **12.2 (done):** `/agenda` page exists; deliberately **ignores** `filterBarVisible` for UI; `UserAgendaApiService.listAgenda` lacks filter params; empty states for `noParticipation` vs no events; tests assert no filter chrome when `filterBarVisible: false`.
- **12.4 / 12.5 (done):** Do not touch event context strip or post-login routing in this story.

### Git intelligence

Recent commits are composition-focused (`feat(composition): …`). Agenda work landed in prior commits (`docs(agenda): Complete Story 12.1 code review`). Follow established patterns: small scoped services, Vitest + TestBed mocks, Kotlin integration tests for API additions.

### Architecture compliance

- **Stack:** Angular 21, Angular Material, standalone components, signals. [Source: `architecture.md` § Frontend]
- **API:** REST `/v1`, camelCase JSON, cookie auth on GET. [Source: `architecture.md` § API]
- **Routes:** `/agenda` remains member root; optional query `troupeId`, `leagueId`. [Source: `architecture.md` § Routes]
- **Performance:** Keep single paginated request per filter change (NFR-P1); no client-side N×league fetches.
- **Accessibility:** Filter buttons need `aria-label`; menus keyboard-operable; sticky bar must not trap focus (NFR-A1).

### Testing standards

Frontend:

```bash
npm run test -w @hatcast/web -- --watch=false --include "src/app/pages/user-agenda/**" --include "src/app/shared/agenda/**" --include "src/app/core/agenda/**"
```

Backend (if API extended):

```bash
./gradlew :services:api:test --tests '*UserAgenda*'
```

Full suite before handoff: `npm run test -w @hatcast/web -- --watch=false` and `./gradlew test`.

Mock `UserAgendaApiService`, `Router`, `ActivatedRoute` (query params), and `AuthApiService` in component tests.

### Project Structure Notes

Expected new/ modified files:

- `apps/web/src/app/shared/agenda/user-agenda-filter-bar.ts` (+ `.html`, `.scss`, `.spec.ts`) — recommended
- `apps/web/src/app/pages/user-agenda/user-agenda.ts` (+ `.html`, `.scss`, `.spec.ts`)
- `apps/web/src/app/core/agenda/user-agenda-api.service.ts` (+ `.spec.ts`)
- `services/api/openapi/me-agenda.yaml` — if API extended
- `services/api/src/main/kotlin/com/hatcast/api/agenda/dto/UserAgendaDtos.kt`
- `services/api/src/main/kotlin/com/hatcast/api/agenda/UserAgendaService.kt`
- `services/api/src/main/kotlin/com/hatcast/api/agenda/UserAgendaRepository.kt` — optional new queries
- `services/api/src/test/kotlin/com/hatcast/api/agenda/UserAgendaIntegrationTest.kt`

No `legacy/` changes.

### References

- [Source: `_bmad-output/planning-artifacts/epics.md` — Epic 12, Story 12.3]
- [Source: `_bmad-output/planning-artifacts/prd.md` — FR8, FR48, FR55, RES-001]
- [Source: `_bmad-output/planning-artifacts/ux-design-journey-league-agenda.md` — Screen 2 Filters, UX-DR14]
- [Source: `_bmad-output/planning-artifacts/architecture.md` — User agenda API & `/agenda` route]
- [Source: `_bmad-output/planning-artifacts/plan-v2-league-journey.md` — Story 12.3 sequencing]
- [Source: `_bmad-output/implementation-artifacts/12-1-api-agenda-utilisateur.md`]
- [Source: `_bmad-output/implementation-artifacts/12-2-ecran-mon-agenda.md`]
- [Source: `services/api/openapi/me-agenda.yaml`]
- [Source: `docs/adr/0011-league-model-and-user-agenda.md`]

## Dev Agent Record

### Agent Model Used

Composer

### Debug Log References

### Completion Notes List

- Extended `GET /v1/me/agenda` with `participationFilters` catalog when `filterBarVisible` is true (troupe/league names from participation universe, independent of filtered `content`).
- Added shared `UserAgendaFilterBar` (mat-menu pattern), sessionStorage + URL sync, server-side refetch on filter change, filtered empty state copy.
- Vitest: 298 web tests green; `UserAgenda*` integration tests green.

### File List

- `services/api/openapi/me-agenda.yaml`
- `services/api/src/main/kotlin/com/hatcast/api/agenda/UserAgendaService.kt`
- `services/api/src/main/kotlin/com/hatcast/api/agenda/UserAgendaRepository.kt`
- `services/api/src/main/kotlin/com/hatcast/api/agenda/dto/UserAgendaDtos.kt`
- `services/api/src/test/kotlin/com/hatcast/api/agenda/UserAgendaIntegrationTest.kt`
- `apps/web/src/app/core/agenda/user-agenda-api.service.ts`
- `apps/web/src/app/core/agenda/user-agenda-api.service.spec.ts`
- `apps/web/src/app/core/agenda/user-agenda-filters-storage.ts`
- `apps/web/src/app/shared/agenda/user-agenda-filter-bar.ts`
- `apps/web/src/app/shared/agenda/user-agenda-filter-bar.html`
- `apps/web/src/app/shared/agenda/user-agenda-filter-bar.scss`
- `apps/web/src/app/shared/agenda/user-agenda-filter-bar.spec.ts`
- `apps/web/src/app/pages/user-agenda/user-agenda.ts`
- `apps/web/src/app/pages/user-agenda/user-agenda.html`
- `apps/web/src/app/pages/user-agenda/user-agenda.scss`
- `apps/web/src/app/pages/user-agenda/user-agenda.spec.ts`

### Review Findings

- [x] [Review][Patch] Filter bar hidden during `loadingAgenda` — fixed via `filterBarCatalog` (bar stays visible while refetching)
- [x] [Review][Patch] Bar not rendered when `filterBarVisible: true` but `participationFilters` null — fixed via empty catalog fallback
- [x] [Review][Patch] `sessionStorage` not cleared when user resets filters via menus (both null) — fixed via `persistFilterSelection()`
- [x] [Review][Patch] No URL sync when filters restored from `sessionStorage` on first visit — fixed via `syncInitialFilterUrl()`
- [x] [Review][Patch] URL/storage filter IDs not reconciled with `participationFilters` after successful load — fixed via `reconcileFiltersWithCatalog()`
- [x] [Review][Patch] Incompatible `troupeId` + `leagueId` in URL not validated at bootstrap — fixed in `reconcileFiltersWithCatalog()`
- [x] [Review][Patch] Misleading troupe/league button labels when selected ID is outside catalog — fixed labels in filter bar
- [x] [Review][Patch] `writeStoredUserAgendaFilters` lacks try/catch — fixed
- [x] [Review][Patch] Missing test: restore filters from `sessionStorage` — added
- [x] [Review][Patch] Missing test: league menu scoped by selected troupe — added
- [x] [Review][Patch] Missing test: `leagueId` cleared when troupe changes — added
- [x] [Review][Patch] Missing backend test: `participationFilters` unchanged when `?troupeId=` filters `content` — added

- [x] [Review][Defer] Concurrent `loadAgenda()` without request token — race on rapid filter clicks [`user-agenda.ts:loadAgenda`] — deferred, pre-existing async pattern acceptable for MVP
- [x] [Review][Defer] Two extra catalog SQL queries on every agenda load when `filterBarVisible` — deferred, same class as 12-1 participation-context cost
- [x] [Review][Defer] `bootstrapFiltersFromRoute` uses route snapshot only — in-place query param changes not re-synced [`user-agenda.ts`] — deferred, first-load deep link covers AC8
- [x] [Review][Defer] Sticky bar `top: 0` may overlap page header on scroll — deferred, minor UX polish
- [x] [Review][Defer] Filter bar below « Mes troupes » link, not directly under title — deferred, layout acceptable vs wireframe intent

## Change Log

- 2026-05-25: Story 12.3 created — troupe/league filter bar on `/agenda`, server-side filtering, RES-001 visibility, recommended `participationFilters` API catalog, URL/session persistence, and Vitest coverage plan.
- 2026-05-25: Story 12.3 implemented — API `participationFilters`, filter bar UI, URL/session persistence, tests.
- 2026-05-25: Code review — 12 patch findings, 5 deferred, 9 dismissed as noise/false positives/pre-existing.
- 2026-05-25: Code review fixes batch-applied — filter bar UX, persistence, reconciliation, tests (304 web + UserAgenda* API green).
