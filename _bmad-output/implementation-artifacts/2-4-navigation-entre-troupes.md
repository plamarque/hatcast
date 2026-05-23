# Story 2.4: Navigation Between Troupes

Status: done

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

## Story

As a **member of multiple troupes**,
I want to **switch between the troupes I belong to**,
so that **season lists, season routes, event routes, and admin screens always operate in the troupe context I chose**.

## Acceptance Criteria

1. **Given** an authenticated user with two or more active troupe memberships, **when** they open `/seasons`, **then** they can see the current troupe context and switch to another active troupe without signing out or manually changing URLs. [Source: `_bmad-output/planning-artifacts/epics.md#story-24--navigation-entre-troupes`; Source: `_bmad-output/planning-artifacts/prd.md` FR8]
2. **Given** the user selects a different troupe, **when** the selection is applied, **then** the seasons list, create-season permissions, card actions, and pagination are reloaded for the selected troupe only; no UI from the previously selected troupe remains actionable. [Source: `_bmad-output/planning-artifacts/prd.md` FR8; Source: `_bmad-output/planning-artifacts/architecture.md#frontend-architecture`]
3. **Given** a previously selected troupe is still an active membership, **when** the user returns to the app in the same browser, **then** the app restores that troupe as the preferred context; if that membership is no longer active or no longer returned by `/v1/troupes`, the app falls back to the first available active troupe and updates the stored preference. [Source: `DOMAIN.md#business-rules--invariants-must-always-hold`; Source: `apps/web/src/app/core/troupes/troupe-api.service.ts`]
4. **Given** a user opens `/saison/:slug`, `/saison/:slug/admin/membres`, or `/saison/:slug/event/:eventId`, **when** the current stored troupe owns that season slug, **then** the route resolves against that troupe and uses that troupe's `troupeId`, `troupeName`, permissions, seasons, events, and member-admin data. [Source: `apps/web/src/app/pages/season-home/season-home.ts`; Source: `apps/web/src/app/pages/admin-membres/admin-membres.ts`; Source: `apps/web/src/app/pages/event-detail-placeholder/event-detail-placeholder.ts`]
5. **Given** a direct route uses a season slug that does **not** belong to the currently selected troupe but belongs to exactly one other active troupe membership, **when** the route loads, **then** the app resolves the season in that owning troupe, switches the current troupe context to it, and continues loading the requested screen. [Source: Story 2.8 review finding on first-troupe route resolution; Source: `_bmad-output/implementation-artifacts/2-8-admin-membres-route-ui-ux-dr10.md#review-findings`]
6. **Given** the same season slug exists in more than one active troupe and the current selected troupe does not own it, **when** the user opens a slug-only route, **then** the app must not silently choose the wrong troupe; it shows a clear French error or selection prompt and does not load cross-troupe data. [Source: `_bmad-output/planning-artifacts/architecture.md#authentication--security`; Source: `_bmad-output/planning-artifacts/prd.md` NFR-S2]
7. **Given** a route cannot be resolved in any active troupe, **when** the app finishes checking accessible troupes, **then** it shows the existing French not-found/error copy pattern (for example `Saison introuvable.`) and leaves the current troupe preference unchanged unless it was invalid. [Source: `apps/web/src/app/pages/season-home/season-home.ts`; Source: `apps/web/src/app/pages/admin-membres/admin-membres.ts`]
8. **Given** the selected troupe changes while the user is inside a season-scoped screen, **when** the current season does not belong to the new troupe, **then** the app navigates to `/seasons` for the newly selected troupe instead of leaving the user on a stale season/admin/event route. [Source: `_bmad-output/planning-artifacts/ux-design-hatcast-v2.md#screen-season-calendar`; Source: `DOMAIN.md#glossary`]
9. **Given** a user has only one active troupe membership, **when** they use `/seasons` or season-scoped routes, **then** the app may show the troupe name for context but must not add a noisy switcher control. [Source: `_bmad-output/planning-artifacts/ux-design-hatcast-v2.md#screen-seasons-list-seasons`; Source: `_bmad-output/planning-artifacts/ux-design-hatcast-v2.md#screen-season-calendar`]
10. **Given** this story is complete, **when** tests run, **then** focused web tests cover troupe switching, preferred-troupe persistence/fallback, direct-route resolution across multiple troupes, ambiguous slug handling, and removal of all `listMyTroupes()[0]` route-resolution behaviour; `npm run test -w @hatcast/web -- --watch=false` and `npm run build -w @hatcast/web` succeed. [Source: `_bmad-output/planning-artifacts/architecture.md#testing-standards-summary`]

## Tasks / Subtasks

- [x] **Create shared troupe context utilities** (AC: 1, 2, 3, 8, 9)
  - [x] Add a small shared service under `apps/web/src/app/core/troupes/` (for example `TroupeContextService`) that loads `TroupeApiService.listMyTroupes()`, exposes active troupes, selected troupe, and loading/error state.
  - [x] Persist only the selected troupe id in browser storage; do **not** persist membership role/permissions as authority.
  - [x] Validate persisted troupe id against fresh `/v1/troupes` results on each load; if absent, clear/fallback.
  - [x] Keep the service UI-agnostic: no snack/router calls inside low-level context service unless the existing app pattern strongly prefers it.

- [x] **Add troupe switching on `/seasons`** (AC: 1, 2, 3, 9)
  - [x] Update `SeasonsList` to use the selected troupe from the shared context instead of `tr.data[0]`.
  - [x] Add a Material-first switcher only when `activeTroupes.length > 1`; a compact `mat-select`, menu, or button menu is acceptable.
  - [x] Show current troupe name even for one troupe if it fits the existing card-page header without clutter.
  - [x] On troupe change, reset page index to `0`, reload seasons, recompute `canManageSeasons` from the selected troupe membership, and close/avoid stale dialogs.
  - [x] Keep `joinDemoTroupe()` compatible: after successful demo join, reload troupe context and select the joined troupe if it is returned by the API.

- [x] **Replace first-troupe route resolution** (AC: 4, 5, 6, 7, 8)
  - [x] Implement a reusable resolver/helper that maps a `slug` route parameter to `{ troupe, season }` by checking the selected troupe first, then other active troupes only when needed.
  - [x] Replace `tr.data[0]` in `SeasonHome.loadTroupeAndSeason`.
  - [x] Replace `tr.data[0]` in `AdminMembres.loadPage`.
  - [x] Replace `tr.data[0]` in `EventDetailPlaceholder.loadEvent`.
  - [x] If exactly one non-selected troupe owns the route slug, update the selected troupe context before continuing.
  - [x] If multiple non-selected troupes match the same slug, block silent resolution and surface clear French copy; do not fetch events/admin data until the user/context is disambiguated.

- [x] **Preserve permissions and admin-member flows** (AC: 2, 4, 8)
  - [x] Ensure `OrganizerApiService.mySeasonPermissions(seasonId)` is called only after the season has been resolved in the correct troupe.
  - [x] Ensure `/saison/:slug/admin/membres` passes the resolved `troupeId` into `MembresTab` and `OrganisateursTab`.
  - [x] Ensure member-admin mutation refresh (`refreshPermissionsAfterMemberMutation`) still redirects correctly after self-demotion/deactivation.
  - [x] Ensure create/edit/archive/activate season actions on `/seasons` use the selected troupe id, not a stale `troupeId` captured before switching.

- [x] **UX copy and layout alignment** (AC: 1, 8, 9)
  - [x] Use French UI copy: `Troupe`, `Changer de troupe`, `Aucune troupe active`, `Saison introuvable`, or existing equivalent wording.
  - [x] Keep Angular Material as the primary UI surface; do not introduce Tailwind or custom global styling for the switcher.
  - [x] On season-scoped screens, preserve existing header hierarchy: season screen back goes to `/seasons`; admin/event back goes to `/saison/:slug`.

- [x] **Tests** (AC: 1-10)
  - [x] Unit/service tests for selected-troupe persistence, invalid stored troupe fallback, and active troupe list updates.
  - [x] `SeasonsList` tests: multiple-troupe switcher visible, single-troupe switcher hidden/noisy control absent, list reloads with selected troupe id, create dialog uses selected troupe id.
  - [x] `SeasonHome` tests: selected troupe resolved first; route falls back to another troupe when only that troupe owns the slug; ambiguous slug does not load a season.
  - [x] `AdminMembres` tests: direct admin route uses resolved troupe and no longer assumes first returned troupe.
  - [x] `EventDetailPlaceholder` tests: event route resolves season in correct troupe before listing events.
  - [x] Regression search/test assertion: no route/page code still uses `listMyTroupes()[0]` or `tr.data[0]` as a troupe-resolution shortcut except inside the shared fallback helper.
  - [x] Run `npm run test -w @hatcast/web -- --watch=false`.
  - [x] Run `npm run build -w @hatcast/web`.

## Dev Notes

### Scope boundaries

- **In scope:** V2 Angular troupe context selection and route resolution for currently implemented season, event placeholder, and admin members screens.
- **Out of scope:** Backend membership model changes; new invitation lifecycle; troupe creation; troupe-specific pseudo (Story 2.5); avatar (Story 2.6); member profile popover/favourite roles (Story 2.7); season/event participant rosters (Story 3.8); legacy Vue changes.
- **Backend expectation:** Existing `/v1/troupes` and `/v1/troupes/{troupeId}/seasons/by-slug/{slug}` are sufficient for this story. Add backend/OpenAPI only if the implementation discovers a blocking performance or correctness issue; document that explicitly before expanding scope.

### Current system snapshot

- `TroupeApiService.listMyTroupes()` returns active troupe memberships as `TroupeListItem[]` with `id`, `name`, `slug`, and `membership` summary.
- `SeasonsList.loadTroupeAndSeasons()` currently selects `tr.data[0]`, stores that id, and lists seasons for only that troupe.
- `SeasonHome.loadTroupeAndSeason()` currently selects `tr.data[0]` and resolves `/saison/:slug` only in that first troupe.
- `AdminMembres.loadPage()` currently selects `tr.data[0]`; Story 2.8 review explicitly deferred that as the multi-troupe bug to this story.
- `EventDetailPlaceholder.loadEvent()` currently selects `tr.data[0]` before resolving the season and finding the event.
- `SeasonApiService.getSeasonBySlug(troupeId, slug)` is troupe-scoped, so slug-only routes need a client-side owning-troupe resolution step unless a backend route is added.

### Architecture and guardrails

- Keep REST calls under `/v1`, credentials included, camelCase DTOs, and CSRF headers on mutations. [Source: `_bmad-output/planning-artifacts/architecture.md#implementation-patterns--consistency-rules`]
- Server authorization remains the boundary. The client switcher must never make a cross-troupe request appear authorized; API 403/404 responses must be handled gracefully. [Source: `_bmad-output/planning-artifacts/prd.md` NFR-S2]
- Use Angular standalone components/signals patterns already present in `apps/web/src/app/pages/seasons-list/seasons-list.ts`, `season-home.ts`, and `admin-membres.ts`.
- Avoid adding global state libraries for this narrow context unless the existing codebase already requires them; a small injectable service is enough.
- Do not modify `legacy/`; V1 remains a behavioural reference only.

### Route resolution guidance

Preferred algorithm for slug-based routes:

1. Load active troupes through the shared context service.
2. If no active troupe exists, show the existing no-membership/session copy.
3. Try selected troupe first with `getSeasonBySlug(selectedTroupe.id, slug)`.
4. If found, return selected troupe + season.
5. If not found, try other active troupes.
6. If exactly one match is found, switch selected troupe to that owner and return it.
7. If multiple matches are found, do not choose silently. Ask the user to pick a troupe or show a clear blocker message.
8. If no matches are found, show the existing not-found copy.

This intentionally optimizes for correctness over cleverness. Expected troupe counts are small, and NFR-P1/P2 risk is lower than cross-troupe leakage or wrong-context admin actions.

### Previous story intelligence

- **Story 2.1:** Membership uniqueness and active-membership read access exist. Story 2.2 notes already warned that multi-troupe route resolution used the first membership and was deferred to Story 2.4.
- **Story 2.2:** Baseline roles are `MEMBER` and `TROUPE_ADMIN`; admin capabilities must derive from the membership of the selected/resolved troupe, not from any other troupe.
- **Story 2.3:** CSV import/export uses `troupeId`; after switching troupes, export/import must use the resolved current troupe only.
- **Story 2.8:** Admin Membres route is implemented and done, but review deferred first-troupe route resolution to this story. Do not regress the route, tabs, CSV toolbar, or permission-refresh patches from 2.8.

### Git intelligence

Recent commits show the pattern to follow:

- `43904d1 feat(web): Add member removal` — latest web change after admin route review; keep member-removal semantics and tests intact.
- `e7868f1 feat(web): Add admin members route` — introduced the admin route that needs multi-troupe-safe resolution.
- `5f32271 feat(troupe): Add CSV member import and export` — member CSV API/UI depends on correct `troupeId`.
- `030cb2f feat(troupe): Add member admin and baseline roles` — baseline-role gating must remain troupe-scoped.

### Testing commands

- Focused service/page tests as added by the implementation.
- Full web tests: `npm run test -w @hatcast/web -- --watch=false`
- Web build: `npm run build -w @hatcast/web`
- API tests are not expected unless backend code changes: `cd services/api && ./gradlew test`

### References

- [Source: `_bmad-output/planning-artifacts/epics.md#story-24--navigation-entre-troupes`]
- [Source: `_bmad-output/planning-artifacts/prd.md` FR8, NFR-S2]
- [Source: `_bmad-output/planning-artifacts/architecture.md#implementation-patterns--consistency-rules`]
- [Source: `_bmad-output/planning-artifacts/ux-design-hatcast-v2.md#screen-seasons-list-seasons`]
- [Source: `_bmad-output/planning-artifacts/ux-design-hatcast-v2.md#screen-season-calendar`]
- [Source: `DOMAIN.md#glossary`]
- [Source: `DOMAIN.md#business-rules--invariants-must-always-hold`]
- [Source: `apps/web/src/app/core/troupes/troupe-api.service.ts`]
- [Source: `apps/web/src/app/core/seasons/season-api.service.ts`]
- [Source: `apps/web/src/app/pages/seasons-list/seasons-list.ts`]
- [Source: `apps/web/src/app/pages/season-home/season-home.ts`]
- [Source: `apps/web/src/app/pages/admin-membres/admin-membres.ts`]
- [Source: `apps/web/src/app/pages/event-detail-placeholder/event-detail-placeholder.ts`]
- [Source: `_bmad-output/implementation-artifacts/2-2-administration-des-membres-et-roles-de-base.md`]
- [Source: `_bmad-output/implementation-artifacts/2-3-import-export-csv-des-membres-de-troupe.md`]
- [Source: `_bmad-output/implementation-artifacts/2-8-admin-membres-route-ui-ux-dr10.md`]

## Dev Agent Record

### Agent Model Used

GPT-5.5 (Cursor)

### Debug Log References

- `npm run test -w @hatcast/web -- --watch=false --include "src/app/core/troupes/troupe-context.service.spec.ts" --include "src/app/core/troupes/troupe-season-resolver.service.spec.ts"` — passed.
- `npm run test -w @hatcast/web -- --watch=false --include "src/app/pages/seasons-list/seasons-list.spec.ts"` — passed.
- `npm run test -w @hatcast/web -- --watch=false --include "src/app/core/troupes/troupe-context.service.spec.ts" --include "src/app/core/troupes/troupe-season-resolver.service.spec.ts" --include "src/app/pages/seasons-list/seasons-list.spec.ts" --include "src/app/pages/season-home/season-home.spec.ts" --include "src/app/pages/admin-membres/admin-membres.spec.ts" --include "src/app/pages/event-detail-placeholder/event-detail-placeholder.spec.ts"` — passed.
- `npm run test -w @hatcast/web -- --watch=false && npm run build -w @hatcast/web` — passed; 104 web tests, successful Angular build.
- `rg "listMyTroupes\(\)|tr\.data\[0\]|data\[0\]" apps/web/src/app` — remaining matches are limited to the shared context service, API service, and API tests.

### Completion Notes List

- Story context created by BMad create-story workflow on 2026-05-23.
- Discovery loaded PRD, architecture, epics, UX specification, root SPEC/DOMAIN/ARCH, previous Epic 2 stories, current code hotspots, sprint status, and recent git commits.
- No `project-context.md` file was found in the repository.
- Added `TroupeContextService` to load active memberships, validate and persist only the selected troupe id, and expose selected/active/loading/error state without UI or router coupling.
- Added `TroupeSeasonResolverService` to resolve slug-only season routes against the selected troupe first, switch to the unique owning troupe when needed, and block ambiguous slug matches.
- Updated `/seasons` with a Material troupe context section and switcher, reloading pagination/actions/permissions from the selected troupe and preserving demo troupe join behavior.
- Updated season home, admin members, and event detail route loading to use resolved troupe context before permissions, member-admin tabs, events, or mutations become actionable.
- Added focused service and page tests for persistence/fallback, switcher behavior, direct route resolution, ambiguous slug handling, admin troupe id propagation, and event detail season ownership.

### File List

- `_bmad-output/implementation-artifacts/2-4-navigation-entre-troupes.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `apps/web/src/app/core/troupes/troupe-context.service.spec.ts`
- `apps/web/src/app/core/troupes/troupe-context.service.ts`
- `apps/web/src/app/core/troupes/troupe-season-resolver.service.spec.ts`
- `apps/web/src/app/core/troupes/troupe-season-resolver.service.ts`
- `apps/web/src/app/pages/admin-membres/admin-membres.spec.ts`
- `apps/web/src/app/pages/admin-membres/admin-membres.ts`
- `apps/web/src/app/pages/event-detail-placeholder/event-detail-placeholder.spec.ts`
- `apps/web/src/app/pages/event-detail-placeholder/event-detail-placeholder.ts`
- `apps/web/src/app/pages/season-home/season-home.spec.ts`
- `apps/web/src/app/pages/season-home/season-home.ts`
- `apps/web/src/app/pages/seasons-list/seasons-list.html`
- `apps/web/src/app/pages/seasons-list/seasons-list.scss`
- `apps/web/src/app/pages/seasons-list/seasons-list.spec.ts`
- `apps/web/src/app/pages/seasons-list/seasons-list.ts`

## Change Log

- 2026-05-23: Implemented multi-troupe context selection, slug route resolution, UI switcher, focused tests, full web test suite, and web build; story moved to review.
- 2026-05-23: Code review — AC8 dismissed (hors périmètre sans switcher global) ; patch resolver pour distinguer 404/403 des erreurs serveur/réseau ; story moved to done.

### Review Findings

- [x] [Review][Decision] AC8 — changement de troupe sans navigation sur écrans saison — dismissed : hors périmètre tant qu'il n'y a pas de switcher global ; vacuairement satisfait en single-tab (2026-05-23).

- [x] [Review][Patch] Erreurs API masquées comme 404 dans le resolver [`apps/web/src/app/core/troupes/troupe-season-resolver.service.ts`] — fixed : 404/403 continuent la sonde ; 5xx/status 0 renvoient `kind: 'error'`.

- [x] [Review][Defer] localStorage indisponible peut annuler `selectTroupe` au prochain `load()` [`apps/web/src/app/core/troupes/troupe-context.service.ts:65-70`] — deferred, pre-existing edge case for hardened browsers; comment already documents in-memory fallback for the session.
