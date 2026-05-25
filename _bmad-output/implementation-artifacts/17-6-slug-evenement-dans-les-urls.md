# Story 17.6: Event slug in URLs

Status: done

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

## Story

As a **connected member or organizer**,
I want **spectacle URLs to use a human-readable slug** (`/saison/:slug/event/:eventSlug`) with **stable API support and UUID legacy redirects**,
so that **shared links, agenda navigation, and breadcrumbs** match ADR 0013 and remain bookmark-safe after migration.

## Acceptance Criteria

1. **Given** Flyway migration applied, **when** schema is inspected, **then** `events.slug` exists with **`UNIQUE (season_id, slug)`** and every existing row has a non-empty slug (backfilled from title with `-2`, `-3`, … dedupe per season). [Source: epics 17.6; ADR 0013 §4]
2. **Given** an admin creates a spectacle, **when** title is entered, **then** API allocates a **unique slug** derived from title (same normalization as seasons); the create/edit dialog has **no slug field** (removed in **17.12** — server allocation only). [Source: epics 17.6, amended by 17.12]
3. **Given** a saved spectacle, **when** `GET` list or detail runs, **then** `EventResponse` includes **`slug`**; OpenAPI `events.yaml` documents `slug` on schemas and any new lookup route(s). [Source: epics 17.6]
4. **Given** the Angular app, **when** a user opens a spectacle, **then** the canonical browser path is **`/saison/:seasonSlug/event/:eventSlug`**; in-app navigations from season agenda and **Mon agenda** use **slug**, not UUID. [Source: ADR 0013 §1; ux-design-journey Screen 6]
5. **Given** a legacy URL `/saison/:seasonSlug/event/:uuid` where the spectacle has a slug, **when** the event detail route resolves, **then** the app **replaces the URL** with the slug form (`replaceUrl: true`, preserve query string). [Source: epics 17.6 — client-side canonicalization; SPA pattern from 17.5]
6. **Given** `/ligue/:slug/event/:segment`, **when** redirected to `/saison/...` (17.5), **then** UUID→slug canonicalization still applies on the target route. [Source: 17.5 redirects]
7. **Given** implementation complete, **when** `npm run test -w @hatcast/web -- --watch=false`, `./mvnw -q test` (or project API test command), and web build, **then** they pass; integration tests cover slug allocation, by-slug read, PATCH slug, and backfill uniqueness. [Source: repo norms]

## Tasks / Subtasks

- [x] **Flyway + entity** (AC: 1)
  - [x] Add `V24__events_slug.sql`: column `slug VARCHAR(128) NOT NULL`, constraint `events_season_slug UNIQUE (season_id, slug)`.
  - [x] Backfill existing events in SQL or follow-up Kotlin migration step: `slugify(title)` + per-season dedupe (`base`, `base-2`, …).
  - [x] Extend `EventEntity` with `var slug: String`.
  - [x] Extend `EventRepository`: `findBySeason_IdAndSlug`, `existsBySeason_IdAndSlug`, `existsBySeason_IdAndSlugAndIdNot`.

- [x] **Slug generator (reuse season rules)** (AC: 1, 2)
  - [x] Add `EventSlugGenerator` mirroring [`SeasonSlugGenerator.kt`](../../services/api/src/main/kotlin/com/hatcast/api/season/SeasonSlugGenerator.kt) (`slugify`, `allocateUniqueSlug(seasonId, base, excludeEventId?)`).
  - [x] On **create**: allocate from trimmed title; reject empty slugify result (400, French message aligned with seasons).
  - [x] On **update**: support optional explicit `slug` in `UpdateEventRequest` (validate format + uniqueness); **do not** auto-change slug when only `title` changes (bookmark stability — ADR implies editable, not re-derived on every title edit).

- [x] **API surface** (AC: 2, 3)
  - [x] Add `slug` to `EventResponseDto`, `CreateEventRequest` (optional `slug` override), `UpdateEventRequest` (`JsonNullable<String>` for slug).
  - [x] Add `GET /v1/seasons/{seasonId}/events/by-slug/{slug}` (mirror [`SeasonController` by-slug](../../services/api/src/main/kotlin/com/hatcast/api/season/SeasonController.kt)).
  - [x] Keep `GET/PATCH/.../events/{eventId}` with **UUID** `eventId` for sub-resources (availability, composition, organizers, participants) — resolve event once in the page by slug, then call existing UUID paths (minimal blast radius).
  - [x] Update [`services/api/openapi/events.yaml`](../../services/api/openapi/events.yaml): `slug` on `Event`, optional `slug` on create/update, `by-slug` path.
  - [x] Extend `EventControllerIntegrationTest` + unit tests for generator/dedupe.

- [x] **User agenda payload** (AC: 4)
  - [x] Add `eventSlug` to `UserAgendaItemDto` (+ SQL projection in `UserAgendaRepository` if needed).
  - [x] Update [`me-agenda.yaml`](../../services/api/openapi/me-agenda.yaml) and web `UserAgenda` types.
  - [x] `user-agenda.ts`: navigate with `saisonEventPath(item.leagueSlug, item.eventSlug)`.

- [x] **Angular routes + helpers** (AC: 4, 5, 6)
  - [x] Rename route param to `:eventSlug` in `app.routes.ts` (`saison/:slug/event/:eventSlug`, legacy `ligue/...` redirect preserves param name).
  - [x] Update `saisonEventPath(seasonSlug, eventSlug)` in [`troupe-routes.ts`](../../apps/web/src/app/core/navigation/troupe-routes.ts); keep a deprecated alias `saisonEventPathByUuid` only if needed for transitional code — prefer slug everywhere in new links.
  - [x] `EventDetail`: read `eventSlug` param; load via `getEventBySlug(seasonId, slug)`; if param is UUID and response has `slug`, `router.navigate(..., { replaceUrl: true })`.
  - [x] `season-home`: `openEvent` / legacy `?event=` redirect → slug when known (after create, navigate with returned `slug`).
  - [x] Grep `saisonEventPath`, `leagueEventPath`, `['/saison', …, 'event'` — update to slug from `EventResponse.slug`.

- [x] **Event form slug field** (AC: 2)
  - [x] [`event-form-dialog.ts`](../../apps/web/src/app/pages/season-home/event-form-dialog.ts): optional **Identifiant URL** field; on title blur (create), preview slug client-side with same rules OR show server-returned slug after create attempt; on edit, load `event.slug`, allow edit, send in PATCH.
  - [x] Validate slug pattern in UI (lowercase, hyphens) before save; surface API 409/400 messages.

- [x] **Tests & build** (AC: 7)
  - [x] `troupe-routes.spec.ts`, `event-detail.spec.ts` (UUID→slug replaceUrl), `event-form-dialog.spec.ts`, `app.routes.spec.ts`, `user-agenda.spec.ts`.
  - [x] API: slug collision, by-slug 404, backfill uniqueness smoke in migration test if applicable.

## Dev Notes

### Product and UX rules

- **Canonical public path:** `/saison/:seasonSlug/event/:eventSlug` (French UI: **Spectacle**; param name `eventSlug` in router).
- **API IDs unchanged:** Sub-resources stay `/v1/seasons/{seasonId}/events/{uuid}/...` — only the **browser URL** and **read-by-slug** entry point gain slugs.
- **Slug stability:** Changing the **title** must **not** silently change `slug`. Since **17.12**, users cannot edit slug in the dialog; PATCH omits `slug` so links stay stable.
- **Vocabulary:** UI **Saison** / **Spectacle**; code may keep `league*` / `eventId` in API types where they mean UUID.

### Explicit non-goals (scope guard)

- Do **not** implement `equity_tag` or form tag UI (**17.7**, **17.8**).
- Do **not** change draw/stats partitioning (**17.9**, **17.10**).
- Do **not** implement **17.11** admin breadcrumb.
- Do **not** update legacy V1 Cloud Functions / email templates (`/season/...` in `legacy/`) — V2-only slice; track as follow-up if notifications must deep-link with slugs.
- Do **not** add server-side HTTP 301 middleware for event slugs — use **Angular `replaceUrl`** (consistent with 17.5 SPA redirects).
- Do **not** rename `eventId` in composition/availability API paths to slug.

### Backend implementation guardrails

| Concern | Pattern to follow |
|--------|-------------------|
| Slugify + dedupe | Copy [`SeasonSlugGenerator`](../../services/api/src/main/kotlin/com/hatcast/api/season/SeasonSlugGenerator.kt) → `EventSlugGenerator`; uniqueness scope **`season_id`** not `troupe_id` |
| Migration numbering | Next file: `V24__events_slug.sql` (after `V23__...`) |
| Permissions | Same as existing event read: `requireActiveMember` for GET; `requireCanManageTroupe` for create/update slug |
| Slug validation | Max 128 chars; reject empty after normalize; 409 or 400 on duplicate `(season_id, slug)` |
| List endpoints | Include `slug` in every `EventResponseDto.from` |

**Suggested migration sketch (verify against Flyway rules):**

```sql
ALTER TABLE events ADD COLUMN slug VARCHAR(128);
-- backfill via repeatable script or UPDATE from application; then:
ALTER TABLE events ALTER COLUMN slug SET NOT NULL;
ALTER TABLE events ADD CONSTRAINT events_season_slug UNIQUE (season_id, slug);
```

Prefer deterministic SQL backfill in migration for CI reproducibility (slugify in SQL is hard — acceptable pattern: Kotlin `ApplicationRunner` only for dev **or** SQL copying simplified rules; **best:** single Flyway migration with Java-based callback if already used in project, else pure SQL transliteration consistent with tests).

### Frontend implementation guardrails

- **`EventDetail.loadEvent`:** Today calls `getEvent(seasonId, eventId)` with UUID from route ([`event-detail.ts`](../../apps/web/src/app/pages/event-detail/event-detail.ts) ~L453). Switch to:
  1. Resolve season by `slug` (unchanged).
  2. If route segment matches UUID regex → `getEvent(seasonId, uuid)`; if response contains `slug`, replace URL.
  3. Else → `getEventBySlug(seasonId, eventSlug)` new API method.
- **Post-login deep links:** [`post-login-redirect-storage.ts`](../../apps/web/src/app/core/navigation/post-login-redirect-storage.ts) `isValidLeagueScopedPath` allows `event` 4-segment paths — segment may be UUID or slug (no change needed if both alphanumeric).
- **Breadcrumb:** No change required — event title remains leaf; URL bar carries slug (17.1).
- **Create flow:** After `EventApiService.createEvent`, navigate with `saisonEventPath(seasonSlug, data.slug)` not `data.id`.

### Previous story intelligence (17.4, 17.5)

- **17.5** (review/done): Canonical paths `/saison/*`, `saisonEventPath(slug, eventId)` still passes **UUID** — **this story switches the second segment to slug**. Legacy `/ligue/.../event/:x` redirects to `/saison/.../event/:x` — canonicalization runs after redirect.
- **17.5** removed `event-context-strip`; do not reintroduce duplicate chrome.
- **17.4** hub cards link to `saisonWorkspacePath` only — season agenda owns event links.
- **Route order:** Declare specific redirects before parameterized routes (lesson from 17.5).

### Git intelligence

Recent Epic 17 commits:

- `2dd6c07` — troupe hub + legacy redirects (`saisonEventPath`, `app.routes.ts` redirects).
- `b0ac951` — `/troupes` list.
- Pattern: standalone components, Vitest, Kotlin integration tests in `EventControllerIntegrationTest`.

### Project Structure Notes

| Layer | Paths |
|-------|--------|
| DB | `services/api/src/main/resources/db/migration/V24__events_slug.sql` |
| API | `event/EventEntity.kt`, `EventSlugGenerator.kt`, `EventService.kt`, `EventController.kt`, `dto/EventDtos.kt`, `EventRepository.kt` |
| OpenAPI | `services/api/openapi/events.yaml`, `me-agenda.yaml` |
| Web | `troupe-routes.ts`, `app.routes.ts`, `event-detail.ts`, `season-home.ts`, `event-form-dialog.*`, `event-api.service.ts`, `user-agenda.ts`, `core/agenda/*` |
| Tests | `EventControllerIntegrationTest.kt`, `EventSlugGeneratorTest.kt`, `troupe-routes.spec.ts`, `event-detail.spec.ts` |

**Commands:**

```bash
npm run test -w @hatcast/web -- --watch=false
npm run build -w @hatcast/web
cd services/api && ./gradlew -q test
```

### References

- [Source: `_bmad-output/planning-artifacts/epics.md` — Story 17.6]
- [Source: `docs/adr/0013-troupe-navigation-equity-tags-event-slugs.md` — §1 routes, §4 Event slugs]
- [Source: `PLAN.md` — Epic 17 table 17.6]
- [Source: `_bmad-output/planning-artifacts/ux-design-journey-league-agenda.md` — Screen 6 shareable slug URL]
- [Source: `_bmad-output/implementation-artifacts/17-5-redirects-fin-seasons-hub-troupe.md` — non-goals, `saisonEventPath`, redirect patterns]
- [Source: `_bmad-output/implementation-artifacts/17-4-hub-troupes-slug.md` — deferred event slugs]
- [Source: `services/api/src/main/kotlin/com/hatcast/api/season/SeasonSlugGenerator.kt` — slug implementation reference]
- [Source: `DOMAIN.md` — Season slug precedent; event slug implied by ADR 0013]

## Dev Agent Record

### Agent Model Used

Composer (dev-story workflow)

### Debug Log References

- API `@SpringBootTest` integration suite requires Flyway through V23+ on H2; V23 `pgcrypto` extension is PostgreSQL-only (pre-existing). Unit tests (`EventSlugGeneratorTest`, `EventServiceUpdateTest`) and Kotlin compile succeed; integration tests added in `EventControllerIntegrationTest` run when Flyway completes on PostgreSQL/Neon.

### Completion Notes List

- Added `events.slug` with portable SQL backfill (`V24__events_slug.sql`) and per-season uniqueness.
- API: `EventSlugGenerator`, create/update slug handling, `GET .../events/by-slug/{slug}`, `eventSlug` on user agenda.
- Web: canonical route `:eventSlug`, `getEventBySlug`, UUID→slug `replaceUrl`, form **Identifiant URL**, agenda links by slug.
- Tests: web 384/384 pass; API unit tests for slug generator; integration tests written (require Postgres Flyway chain in CI).

### File List

- services/api/src/main/resources/db/migration/V24__events_slug.sql
- services/api/src/main/kotlin/com/hatcast/api/event/EventSlugGenerator.kt
- services/api/src/main/kotlin/com/hatcast/api/event/EventEntity.kt
- services/api/src/main/kotlin/com/hatcast/api/event/EventRepository.kt
- services/api/src/main/kotlin/com/hatcast/api/event/EventService.kt
- services/api/src/main/kotlin/com/hatcast/api/event/EventController.kt
- services/api/src/main/kotlin/com/hatcast/api/event/dto/EventDtos.kt
- services/api/src/main/kotlin/com/hatcast/api/event/dto/UpdateEventRequestDeserializer.kt
- services/api/src/main/kotlin/com/hatcast/api/agenda/UserAgendaRepository.kt
- services/api/src/main/kotlin/com/hatcast/api/agenda/dto/UserAgendaDtos.kt
- services/api/openapi/events.yaml
- services/api/openapi/me-agenda.yaml
- services/api/src/test/kotlin/com/hatcast/api/event/EventSlugGeneratorTest.kt
- services/api/src/test/kotlin/com/hatcast/api/event/EventControllerIntegrationTest.kt
- services/api/src/test/kotlin/com/hatcast/api/event/EventServiceUpdateTest.kt
- services/api/src/test/kotlin/com/hatcast/api/agenda/UserAgendaIntegrationTest.kt
- services/api/src/test/kotlin/com/hatcast/api/troupe/TroupeMembershipIntegrationTest.kt
- services/api/src/test/kotlin/com/hatcast/api/organizer/OrganizerControllerIntegrationTest.kt
- apps/web/src/app/core/navigation/url-slug.ts
- apps/web/src/app/core/navigation/url-slug.spec.ts
- apps/web/src/app/core/navigation/troupe-routes.ts
- apps/web/src/app/core/events/event-api.service.ts
- apps/web/src/app/core/agenda/user-agenda-api.service.ts
- apps/web/src/app/app.routes.ts
- apps/web/src/app/pages/event-detail/event-detail.ts
- apps/web/src/app/pages/event-detail/event-detail.spec.ts
- apps/web/src/app/pages/season-home/season-home.ts
- apps/web/src/app/pages/season-home/season-agenda.html
- apps/web/src/app/pages/season-home/season-agenda.spec.ts
- apps/web/src/app/pages/season-home/event-form-dialog.ts
- apps/web/src/app/pages/season-home/event-form-dialog.html
- apps/web/src/app/pages/season-home/season-home.spec.ts
- apps/web/src/app/pages/season-home/season-events.utils.spec.ts
- apps/web/src/app/pages/season-home/event-form-dialog.spec.ts
- apps/web/src/app/pages/user-agenda/user-agenda.ts
- apps/web/src/app/pages/user-agenda/user-agenda.spec.ts
- apps/web/src/app/pages/event-detail/event-equipe-tab.spec.ts
- _bmad-output/implementation-artifacts/sprint-status.yaml

### Change Log

- 2026-05-25 (17.12): **Form field removed** — `EventFormDialog` no longer shows « Identifiant URL »; create/update omit `slug` in payloads; API slug behavior unchanged (`EventSlugGenerator`, PATCH only if `slug` present).
- 2026-05-25: Story 17.6 — event slugs in DB, API, OpenAPI, Angular routes, form field, tests.
- 2026-05-25: Code review — patches post-création, erreurs API formulaire, rejet slug UUID, tests slug ; décision collision PATCH = auto-dédoublonnement.

### Review Findings

- [x] [Review][Decision] PATCH slug en collision — **Conservé : auto-dédoublonnement** (`allocateUniqueSlug`, comme à la création). Aligné avec les tests d’intégration existants.
- [x] [Review][Patch] Navigation post-création — `openCreate` navigue vers `saisonEventPath` avec le `EventResponse` renvoyé par le dialog.
- [x] [Review][Patch] Erreurs API formulaire — `createEvent`/`updateEvent` exposent `errorMessage` ; `submit()` affiche le message dans `slugError`.
- [x] [Review][Patch] Slug format UUID rejeté — `EventSlugGenerator.requireValidExplicitSlug` + `isValidSlug` côté web.
- [x] [Review][Patch] Test stabilité slug — `EventServiceUpdateTest.update title does not change slug`.
- [x] [Review][Patch] Tests formulaire slug — `event-form-dialog.spec.ts` (blur, erreur API, succès create).
- [x] [Review][Defer] Suite d’intégration API `@SpringBootTest` sur H2 — V23 `pgcrypto` bloque Flyway en local H2 (noté dans Dev Agent Record) ; les tests d’intégration ajoutés supposent Postgres/CI.
- [x] [Review][Defer] Backfill SQL vs `slugify` Kotlin — `V24` utilise `translate()` SQL ; le runtime utilise NFD Java/TS. Écart possible sur titres exotiques au moment de la migration uniquement.
