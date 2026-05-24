# Story 12.2: Mon agenda screen (`/agenda`)

Status: in-progress

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

## Story

As a **signed-in member**,
I want to open **Mon agenda** at `/agenda` and see my **upcoming events across every league where I participate**,
so that I can immediately know what is coming next without visiting each league one by one.

## Acceptance Criteria

1. **Given** a signed-in member, **when** they open `/agenda`, **then** the page loads `GET /v1/me/agenda` and displays the returned upcoming events grouped by month, using the same `Europe/Paris` date grouping language as the league agenda. [Source: `_bmad-output/planning-artifacts/epics.md` Story 12.2; `_bmad-output/planning-artifacts/ux-design-journey-league-agenda.md` Screen 2; `apps/web/src/app/pages/season-home/season-events.utils.ts`]
2. **Given** an agenda item, **when** it is rendered, **then** the row shows date/time, title, optional location, **troupe badge**, **league badge**, and the user's availability pill when `myAvailabilityStatus` is present. [Source: UX-DR14; Story 12.1 response contract]
3. **Given** an inter-troupe encounter represented by two API rows, **when** the member participates in both leagues, **then** `/agenda` renders **two separate rows** and never merges by title/date. [Source: ADR 0011 § User agenda; UX Screen 2]
4. **Given** a row is clicked or activated by keyboard, **when** navigation occurs, **then** the app opens the existing event detail route `/saison/:leagueSlug/event/:eventId` for this story. **Do not** introduce `/ligue/:slug` routing here; that is Story 12.6. [Source: `app.routes.ts`; `plan-v2-league-journey.md` Wave 1]
5. **Given** the API returns an empty page because the user has no league/event participations, **when** the screen displays, **then** it shows the actionable empty state: "Tu n'es inscrit·e à aucune ligue pour l'instant." with a "Découvrir les troupes" entry that may target `/troupes` when available or remain a clearly marked disabled/future CTA if the route is not yet implemented. [Source: UX Screen 2 empty states; FR49]
6. **Given** the API returns an empty page because there are no upcoming events, **when** the screen displays, **then** it shows "Aucun spectacle à venir." and does **not** imply an error. [Source: UX Screen 2 empty states]
7. **Given** the API request fails with `401`, **when** `/agenda` loads, **then** the user is redirected to `/connexion` with a short snackbar message matching existing authenticated pages. [Source: `SeasonHome`, `SeasonsList` auth patterns]
8. **Given** the API request fails with a non-auth or network error, **when** `/agenda` loads, **then** the page shows a retryable error state and does not navigate away. [Source: existing `SeasonsList` load-error pattern]
9. **Given** Story 12.3 is not implemented yet, **when** `filterBarVisible` is `true`, **then** `/agenda` still displays all events and **does not** add troupe/league filter controls in this story. The response field is consumed only as forward-compatible data or ignored. [Source: `plan-v2-league-journey.md` Wave 1; UX-DR14 split]
10. **Given** `/agenda` is implemented, **when** unit tests run for `@hatcast/web`, **then** tests cover successful rendering, month grouping, separate duplicate rows, empty states, 401 redirect, retryable error state, and keyboard activation of rows. [Source: NFR-Q1; existing Vitest component specs]

## Tasks / Subtasks

- [x] **Route and page shell** (AC: 1, 5, 6, 7, 8)
  - [x] Add `path: 'agenda'` to `apps/web/src/app/app.routes.ts`.
  - [x] Create a route-level standalone component under `apps/web/src/app/pages/user-agenda/` (suggested files: `user-agenda.ts`, `.html`, `.scss`, `.spec.ts`).
  - [x] Reuse existing authenticated-page session flow: `AuthApiService.ensureHatcastSession()`, `MatSnackBar`, `Router.navigate(['/connexion'], { replaceUrl: true })`.
  - [x] Do **not** modify final post-login fallback in this story; Story 12.5 will change `PostLoginNavigationService` from `/seasons` fallback to `/agenda`.

- [x] **API client service** (AC: 1, 7, 8, 9)
  - [x] Add `UserAgendaApiService` in `apps/web/src/app/core/agenda/user-agenda-api.service.ts`.
  - [x] Define TypeScript interfaces matching `services/api/openapi/me-agenda.yaml`: `UserAgendaResponse`, `UserAgendaItem`, page fields, `filterBarVisible`.
  - [x] Fetch `/v1/me/agenda?page=0&size=50&scope=upcoming` with `credentials: 'include'`.
  - [x] Return the local `{ ok, status, data? }` shape used by existing API services.
  - [x] Keep query filter support out of the page UI for 12.2; optional service parameters may be added only if they do not create filter chrome.

- [x] **Agenda list presentation** (AC: 1, 2, 3, 4)
  - [x] Reuse or extract `groupEventsByMonth` / `formatEventDateParts` from `season-events.utils.ts` so `/agenda` and league agenda share `Europe/Paris` grouping.
  - [x] Render one card per `UserAgendaItem.eventId`; do not de-duplicate by title/date.
  - [x] Show `troupeName` and `leagueTitle` as visible badges on every row, even when the user has only one context.
  - [x] Show the availability pill only when `myAvailabilityStatus` is non-null; use `availabilityBadgeLabel` / `availabilityBadgeModifier` from `core/availability/availability-status`.
  - [x] Navigate rows to `['/saison', item.leagueSlug, 'event', item.eventId]`.
  - [x] Preserve keyboard operability: cards need `role="button"`, `tabindex="0"`, Enter and Space activation.

- [x] **Member-root chrome** (AC: 1, 5, 6)
  - [x] Title is **Mon agenda**.
  - [x] No back button; `/agenda` is the signed-in member root.
  - [x] Add top-right account/avatar menu following `SeasonsList` and `SeasonHeader` patterns: `Mon compte`, `Se déconnecter`.
  - [x] Optional secondary link **Mes troupes** may point to `/seasons` for now, because troupe hub is Story 14.1.

- [x] **Loading, empty, and error states** (AC: 5, 6, 7, 8)
  - [x] Initial loading state with `role="status"`.
  - [x] Empty no-participation state: "Tu n'es inscrit·e à aucune ligue pour l'instant."
  - [x] Empty no-upcoming-events state: "Aucun spectacle à venir."
  - [x] Retry action for non-auth failures.
  - [x] 401 redirects to `/connexion`; do not show agenda data after auth failure.

- [x] **Tests** (AC: 10)
  - [x] Component test for loaded agenda with two month groups.
  - [x] Component/service test that two rows with same title/date but different `troupeId` remain two cards.
  - [x] Empty-state tests for no participation and no upcoming events.
  - [x] Error-state test with retry action.
  - [x] 401 redirect test.
  - [x] Keyboard activation test for row navigation.

### Review Findings

- [ ] [Review][Decision] Retro-document `noParticipation` in Story 12.1 — The 12.2 implementation added `noParticipation` to the API contract (`me-agenda.yaml`, `UserAgendaService`, integration tests) to distinguish AC5 vs AC6 empty states. Story 12.1 AC9 only describes empty `content` + `filterBarVisible: false`. Should 12.1 / epics be updated retroactively, or is the 12.2 completion note sufficient?

- [x] [Review][Patch] Missing Space key keyboard test [apps/web/src/app/pages/user-agenda/user-agenda.spec.ts] — AC10 requires keyboard activation; Enter is tested but Space is not, despite `(keydown.space)` in the template.

- [x] [Review][Patch] Unused `response` signal [apps/web/src/app/pages/user-agenda/user-agenda.ts:49] — Set in `loadAgenda()` but never read in template or computed; remove or use.

- [x] [Review][Patch] Loading spinner lacks accessible label [apps/web/src/app/pages/user-agenda/user-agenda.html:40] — `role="status"` wrapper has no text; `SeasonAgenda` uses visible status copy. Add sr-only or inline status text for screen readers.

- [x] [Review][Patch] Defensive default for `noParticipation` [apps/web/src/app/pages/user-agenda/user-agenda.ts:85] — Use `r.data.noParticipation ?? false` so a partial/old API response does not mis-route empty states.

- [x] [Review][Defer] Silent truncation beyond 50 events [apps/web/src/app/pages/user-agenda/user-agenda.ts] — deferred, story explicitly defers load-more / pagination UI to a later slice.

- [x] [Review][Defer] Duplicated agenda-card SCSS vs season-agenda [apps/web/src/app/pages/user-agenda/user-agenda.scss] — deferred, story guardrails allow minimal markup/style duplication until shared extraction is warranted.

## Dev Notes

### Scope boundaries

| In scope (12.2) | Out of scope |
|-----------------|--------------|
| Angular route `/agenda` | Final post-login fallback to `/agenda` (**12.5**) |
| Read `GET /v1/me/agenda` | Troupe/league filters UI (**12.3**) |
| Month-grouped event cards | Event context strip (**12.4**) |
| Troupe + league badges on rows | `/ligue/:slug` alias (**12.6**) |
| Empty/error/loading states | Multi-active league domain migration (**Epic 13**) |

This story is intentionally a **read-only frontend slice**. Do not change backend agenda semantics from Story 12.1 unless a contract bug is discovered and fixed with matching API tests.

### API contract from Story 12.1

Use the existing endpoint:

```http
GET /v1/me/agenda?page=0&size=50&scope=upcoming
```

Response shape:

```json
{
  "content": [
    {
      "eventId": "uuid",
      "title": "Match La BIM vs La Malice",
      "startsAt": "2026-05-30T18:30:00Z",
      "location": "Salle A",
      "troupeId": "uuid",
      "troupeName": "La BIM",
      "troupeSlug": "la-bim",
      "leagueId": "uuid",
      "leagueSlug": "competition-2026",
      "leagueTitle": "Ligue Compétition 2026",
      "myAvailabilityStatus": "available"
    }
  ],
  "page": 0,
  "size": 50,
  "totalElements": 1,
  "totalPages": 1,
  "filterBarVisible": false
}
```

`myAvailabilityStatus` values from the backend are lower-case (`available`, `unavailable`, `unknown`) and align with the frontend `AvailabilityStatus` helpers.

### Implementation guardrails

- **Do not reuse `SeasonHome` directly** for `/agenda`: it is league-scoped and depends on resolving a single slug, permissions, participants and event management actions.
- **Do reuse presentational patterns** from `SeasonAgenda`: month divider, agenda-card style, keyboard activation, availability pill helpers. If extraction is small and cleaner, create shared agenda utilities/components under `apps/web/src/app/shared/agenda/`; otherwise duplicate only minimal markup/styles.
- **Do not add admin event actions** (`Nouveau spectacle`, edit/archive menu) to `/agenda`. This is a member hub, not a league admin surface.
- **Do not clear `lastVisitedSeason`** when opening `/agenda`. `SeasonsList` currently clears it; `/agenda` must not, because 12.5 still needs last-league priority.
- **Do not introduce filter UI** in 12.2. `filterBarVisible` exists for Story 12.3 and should not create partial unusable controls.
- **Use product term "Ligue" in UI copy**. Code can keep `season` where it interacts with existing routes/API.
- **Use `/saison/:slug/event/:eventId`** for navigation until Story 12.6 adds `/ligue/:slug`.

### Existing code to reuse

| Existing file | Reuse for |
|---------------|-----------|
| `apps/web/src/app/core/auth/auth-api.service.ts` | Session check and logout |
| `apps/web/src/app/pages/seasons-list/seasons-list.ts` / `.html` | Account menu, logout, auth error redirect, retryable error pattern |
| `apps/web/src/app/pages/season-home/season-events.utils.ts` | `Europe/Paris` grouping and day labels |
| `apps/web/src/app/pages/season-home/season-agenda.*` | Agenda card interaction and visual pattern |
| `apps/web/src/app/core/events/event-api.service.ts` | API service return shape and fetch style |
| `apps/web/src/app/core/availability/availability-status.ts` | Availability pill label and modifier |
| `apps/web/src/app/app.routes.ts` | Route registration; existing event detail path |

### Previous story intelligence

- Story 12.1 implemented `GET /v1/me/agenda` and is currently in `review`. It added `services/api/openapi/me-agenda.yaml`, agenda DTOs, controller/service/repository, security config, and integration tests.
- `filterBarVisible` is computed from **all active participations**, not the filtered result set. For 12.2, the frontend may receive it but should not act on it beyond preserving it in the typed response.
- Story 12.1 deliberately omitted composition lifecycle fields. `/agenda` must not require `teamStatusBadge` or `compositionLifecycle` to render.
- API returns event-only participations as well as league participants; UI copy should stay generic ("ligue" / "spectacle") and not assume troupe membership.

### Git intelligence

Recent work uses small, scoped frontend services/components and Vitest specs:

- `fix(web): Add user menu with logout to seasons-list and season-header`
- `feat(web): Post-login redirect to last visited league`
- Story 12.1 backend work is present in the working tree but not committed yet; build the frontend against that contract.

### Architecture compliance

- **Stack:** Angular 21, Angular Material, standalone components, signals/computed for local state. [Source: `architecture.md` § Frontend Architecture]
- **Frontend structure:** feature-oriented route pages under `apps/web/src/app/pages`, core API services under `apps/web/src/app/core`. [Source: `architecture.md` § Structure Patterns]
- **API style:** REST `/v1`, camelCase JSON, cookie auth, no token query params. [Source: `architecture.md` § API & Communication Patterns]
- **Performance:** initial request size remains 50, matching API default and NFR-P1. Do not implement an unbounded client loop in 12.2; "load more" can be deferred unless needed for visible pagination acceptance. [Source: FR48 default bounded agenda]
- **Accessibility:** keyboard row activation, visible focus, status roles for loading/errors, contrast consistent with current dark Material theme. [Source: NFR-A1]

### Documentation conflict note

`SPEC.md` still contains older wording that says at most one season may be active per troupe. `DOMAIN.md` and ADR 0011 explicitly supersede that invariant with multiple active leagues. For this story, follow `DOMAIN.md`, ADR 0011, `epics.md`, and the approved UX journey.

### Testing standards

- Use Vitest/Angular TestBed patterns from existing `*.spec.ts` files in `apps/web/src/app/pages/**`.
- Mock `AuthApiService`, `UserAgendaApiService`, `Router`, and `MatSnackBar` instead of hitting the backend.
- Recommended command before handoff:

```bash
npm run test -w @hatcast/web -- --watch=false
```

If the project’s Angular test command does not accept `--watch=false`, use the nearest repo-supported non-watch equivalent and document it in Dev Agent Record.

### Project Structure Notes

- Expected new files:
  - `apps/web/src/app/core/agenda/user-agenda-api.service.ts`
  - `apps/web/src/app/core/agenda/user-agenda-api.service.spec.ts`
  - `apps/web/src/app/pages/user-agenda/user-agenda.ts`
  - `apps/web/src/app/pages/user-agenda/user-agenda.html`
  - `apps/web/src/app/pages/user-agenda/user-agenda.scss`
  - `apps/web/src/app/pages/user-agenda/user-agenda.spec.ts`
- Expected modified file:
  - `apps/web/src/app/app.routes.ts`
- No `legacy/` changes.
- No backend changes expected unless Story 12.1 contract issues are found.

### References

- [Source: `_bmad-output/planning-artifacts/epics.md` — Epic 12, Story 12.2]
- [Source: `_bmad-output/planning-artifacts/prd.md` — FR48, FR49, FR55, NFR-Q1]
- [Source: `_bmad-output/planning-artifacts/architecture.md` — User agenda route/API and frontend architecture]
- [Source: `_bmad-output/planning-artifacts/ux-design-journey-league-agenda.md` — Screen 2 Mon agenda]
- [Source: `_bmad-output/planning-artifacts/plan-v2-league-journey.md` — Wave 1 sequencing]
- [Source: `docs/adr/0011-league-model-and-user-agenda.md`]
- [Source: `DOMAIN.md` — User agenda scope]
- [Source: `_bmad-output/implementation-artifacts/12-1-api-agenda-utilisateur.md`]
- [Source: `services/api/openapi/me-agenda.yaml`]

## Dev Agent Record

### Agent Model Used

GPT-5.5

### Debug Log References

- 2026-05-24: Red run confirmed new frontend specs failed before implementation because `UserAgendaApiService` and `UserAgenda` did not exist.
- 2026-05-24: `npm run test -w @hatcast/web -- --watch=false --include "src/app/core/agenda/user-agenda-api.service.spec.ts" --include "src/app/pages/user-agenda/user-agenda.spec.ts"` passed (10 tests).
- 2026-05-24: `./gradlew test --tests "com.hatcast.api.agenda.UserAgendaIntegrationTest"` passed.
- 2026-05-24: `npm run test -w @hatcast/web -- --watch=false` passed (227 tests).
- 2026-05-24: `./gradlew test` passed (API suite).
- 2026-05-24: `npm run build -w @hatcast/web` passed.

### Completion Notes List

- Implemented `/agenda` as a signed-in member root page with account menu, `Mes troupes` secondary link, no back button, loading/error/empty states, and retry for non-auth failures.
- Added `UserAgendaApiService` and typed frontend response models for `GET /v1/me/agenda?page=0&size=50&scope=upcoming`.
- Reused the league agenda month grouping by generalizing `groupEventsByMonth` for agenda-like items while preserving existing `EventResponse` usage.
- Rendered agenda rows with date/time, title, optional location, troupe and league badges, optional availability pill, duplicate row preservation, click navigation, and Enter/Space keyboard activation.
- Added `noParticipation` to the agenda API contract because the frontend could not otherwise distinguish the two required empty states; covered it with API integration tests.
- Isolated `UserAgendaIntegrationTest` after class execution to prevent seed troupe membership fixture contamination in later backend integration tests.

### File List

- `_bmad-output/implementation-artifacts/12-2-ecran-mon-agenda.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `apps/web/src/app/app.routes.ts`
- `apps/web/src/app/core/agenda/user-agenda-api.service.ts`
- `apps/web/src/app/core/agenda/user-agenda-api.service.spec.ts`
- `apps/web/src/app/pages/season-home/season-events.utils.ts`
- `apps/web/src/app/pages/user-agenda/user-agenda.ts`
- `apps/web/src/app/pages/user-agenda/user-agenda.html`
- `apps/web/src/app/pages/user-agenda/user-agenda.scss`
- `apps/web/src/app/pages/user-agenda/user-agenda.spec.ts`
- `services/api/openapi/me-agenda.yaml`
- `services/api/src/main/kotlin/com/hatcast/api/agenda/UserAgendaService.kt`
- `services/api/src/main/kotlin/com/hatcast/api/agenda/dto/UserAgendaDtos.kt`
- `services/api/src/test/kotlin/com/hatcast/api/agenda/UserAgendaIntegrationTest.kt`

## Change Log

- 2026-05-24: Story 12.2 created — `/agenda` Angular page consuming `GET /v1/me/agenda`, month-grouped rows, empty/error states, and frontend tests.
- 2026-05-24: Implemented Story 12.2 and moved to review.
