# Story 12.6: Route alias `/ligue/:slug`

Status: done

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

## Story

As a **signed-in member or organizer**,
I want **league workspace URLs to use `/ligue/:slug`** (with `/saison/:slug` still working),
so that **routes match product vocabulary (Ligue)** and bookmarks, deep links, and post-login navigation stay consistent with UX-DR13.

## Acceptance Criteria

1. **Given** a registered route pattern exists for `/saison/:slug`, **when** the same path is requested under `/ligue/:slug`, **then** the app loads the **same component** with identical behaviour (tabs, query params, resolver, permissions). Applies to all league-scoped member routes currently under `/saison/:slug`: workspace home, event detail, admin membres, admin participants. [Source: epics Story 12.6; `_bmad-output/planning-artifacts/architecture.md` § Member navigation; ADR 0011 § Migration]
2. **Given** a user navigates via in-app links or programmatic `Router.navigate`, **when** the destination is a league-scoped screen, **then** the generated URL uses the **`/ligue/`** prefix (canonical product route). Existing `/saison/` URLs in storage or external bookmarks must still resolve without error. [Source: `ux-design-journey-league-agenda.md` § Route aliases; ADR 0011 — `/saison` remains alias during transition]
3. **Given** post-login routing resolves to the last visited league (Story 12.5), **when** no pending deep link is present, **then** navigation targets **`/ligue/:slug`** (not `/saison/:slug`). [Source: UX-DR13 Screen 1 — `lastVisitedLeague` → `/ligue/:slug`]
4. **Given** a pending deep link or `returnUrl` uses `/ligue/...`, **when** `isValidInternalRedirectPath` validates it, **then** it is accepted with the **same rules** as `/saison/...` (path shape, segment count, admin/event subpaths). `/saison/...` deep links remain valid. [Source: `post-login-redirect-storage.ts`; Story 12.5 AC8]
5. **Given** a user opens `/ligue/:slug/event/:eventId`, **when** the event context strip and header render, **then** **Voir la ligue** and back navigation link to **`/ligue/:slug`**. [Source: Story 12.4; UX Screen 6]
6. **Given** a user opens `/agenda` and activates an event row, **when** navigation occurs, **then** the app opens **`/ligue/:leagueSlug/event/:eventId`**. [Source: Story 12.2 AC4 — deferred to 12.6]
7. **Given** implementation complete, **when** `@hatcast/web` tests run, **then** tests cover: each `/ligue/*` route resolves to the expected component (or smoke navigate); redirect validation accepts `/ligue/` paths; post-login last-league target is `/ligue/:slug`; at least one updated navigation assertion (agenda row or context strip) uses `/ligue/`; `npm run test -w @hatcast/web -- --watch=false` and `npm run build -w @hatcast/web` succeed. [Source: NFR-Q1]

## Tasks / Subtasks

- [x] **Register `/ligue/*` route aliases** (AC: 1)
  - [x] In `apps/web/src/app/app.routes.ts`, add parallel routes mirroring every `/saison/:slug` entry:
    - `ligue/:slug` → `SeasonHome`
    - `ligue/:slug/admin/membres` → `AdminMembres`
    - `ligue/:slug/admin/participants` → `AdminParticipants`
    - `ligue/:slug/event/:eventId` → `EventDetail`
  - [x] Do **not** remove `/saison/*` routes — both prefixes must work (ADR 0011 transition).
  - [x] Do **not** add automatic redirect from `/saison/*` → `/ligue/*` on load (out of scope; avoids breaking stored deep links mid-transition).

- [x] **Centralize league route builders** (AC: 2, 5, 6)
  - [x] Add `apps/web/src/app/core/navigation/league-routes.ts` (+ spec) with:
    - `LEAGUE_ROUTE_PREFIX = 'ligue'` (segment, not leading slash)
    - `leagueWorkspacePath(slug: string): string[]` → `['/ligue', slug]`
    - `leagueEventPath(slug: string, eventId: string): string[]`
    - `leagueAdminMembresPath(slug: string): string[]`
    - `leagueAdminParticipantsPath(slug: string): string[]`
  - [x] Replace hardcoded `['/saison', ...]` in navigation and `routerLink` bindings with these helpers (see file list below).
  - [x] Keep `:slug` param reads unchanged in page components — they already use `ActivatedRoute.paramMap.get('slug')`.

- [x] **Extend post-login redirect validation** (AC: 4)
  - [x] Refactor `isValidInternalRedirectPath` in `post-login-redirect-storage.ts` so `/ligue/` and `/saison/` share one segment-shape validator (avoid duplicated logic).
  - [x] Add spec cases for `/ligue/festibask`, `/ligue/festibask/event/e1`, admin subpaths, and invalid shapes.

- [x] **Update post-login last-league navigation** (AC: 3)
  - [x] In `post-login-navigation.service.ts`, change resolved slug target from `['/saison', slug]` to `leagueWorkspacePath(slug)`.
  - [x] Update `post-login-navigation.service.spec.ts` accordingly.
  - [x] **Do not** rename `lastVisitedSeason` storage key or slug semantics — only the URL prefix changes.

- [x] **Update in-app navigation targets** (AC: 2, 5, 6)
  - [x] Migrate `routerLink` and `Router.navigate` call sites listed in Dev Notes from `/saison` to `league-routes` helpers.
  - [x] Touch templates: `event-context-strip.html`, `event-detail-header.html`, `season-header.html`, `admin-participants.html`.
  - [x] Touch TS: `user-agenda.ts`, `event-detail.ts`, `season-home.ts`, `seasons-list.ts`, `admin-participants.ts`, `member-profile-dialog.ts`.

- [x] **Tests** (AC: 7)
  - [x] `league-routes.spec.ts` — path builder outputs.
  - [x] `post-login-redirect-storage.spec.ts` — `/ligue/` acceptance.
  - [x] `post-login-navigation.service.spec.ts` — `/ligue/:slug` on last-league resolve.
  - [x] Update affected component specs (`user-agenda.spec.ts`, `event-detail.spec.ts`, `season-home.spec.ts`, `admin-participants.spec.ts`) to expect `/ligue/` in navigation assertions.
  - [x] Optional smoke: configure `provideRouter(routes)` in a small spec and assert `/ligue/test-slug` activates `SeasonHome` (or use Router testing harness).
  - [x] Run full web test suite + build.

## Dev Notes

### Scope boundaries (read first)

| In scope (12.6) | Out of scope |
|-----------------|--------------|
| `/ligue/*` route aliases (4 patterns) | Rename REST `/forecasts` / DB `seasons` table |
| Canonical `/ligue/` in new navigations | Redirect `/seasons` → hub (**14.4**) |
| Shared `league-routes` helpers | Troupe hub `/troupe/:slug` (**14.1**) |
| Post-login + redirect validation for `/ligue/` | Server-side route changes |
| Update tests asserting navigation URLs | URL bar replace `/saison` → `/ligue` on entry |
| | Rename `lastVisitedSeason` localStorage key |
| | Epic 13 multi-active migration |

This is a **frontend routing-only story**. No backend, OpenAPI, or Flyway changes expected.

### Product and UX rules

- UI copy already says **Ligue**; routes should align (UX-DR13).
- **Both** `/ligue/:slug` and `/saison/:slug` must work for the transition period (ADR 0011, architecture.md).
- **Canonical** prefix for code-generated links = **`/ligue/`**. Bookmarks and notification links may still use `/saison/` until migrated externally.
- API paths remain `/v1/.../seasons` — unchanged.

### Route alias pattern (Angular 21)

Duplicate route entries pointing to the same standalone components — **do not** use `redirectTo` for the alias (that would drop `/saison` support):

```typescript
// app.routes.ts — pattern only
{ path: 'saison/:slug', component: SeasonHome },
{ path: 'ligue/:slug', component: SeasonHome },
// … repeat for admin and event child routes
```

Components read `slug` / `eventId` from `paramMap`; the first path segment is irrelevant to resolver logic.

### Files to update (hardcoded `/saison` today)

| File | Change |
|------|--------|
| `app.routes.ts` | Add 4 `/ligue/*` routes |
| `core/navigation/league-routes.ts` | **NEW** helpers |
| `core/navigation/post-login-redirect-storage.ts` | Accept `/ligue/` |
| `core/navigation/post-login-navigation.service.ts` | Last league → `/ligue/` |
| `pages/user-agenda/user-agenda.ts` | Row navigation |
| `pages/event-detail/event-detail.ts` | Back to league |
| `pages/event-detail/event-context-strip.html` | Voir la ligue link |
| `pages/event-detail/event-detail-header.html` | Back + admin menu links |
| `pages/season-home/season-home.ts` | Event navigation |
| `pages/season-home/season-header.html` | Admin menu links |
| `pages/seasons-list/seasons-list.ts` | Card navigation |
| `pages/admin-participants/admin-participants.ts` + `.html` | Back link |
| `shared/member-profile/member-profile-dialog.ts` | Season navigation |

**Specs** mirroring the above + `login.spec.ts` may keep `/saison/` examples for deep-link **storage** tests (both prefixes valid); navigation **output** assertions should use `/ligue/`.

### Redirect validation refactor hint

Current validator only allows `segments[0] === 'saison'`. Extract:

```typescript
function isValidLeagueScopedPath(segments: string[]): boolean {
  if (segments.length === 2) return true // workspace
  if (segments.length === 4 && segments[2] === 'admin') {
    return segments[3] === 'membres' || segments[3] === 'participants'
  }
  return segments.length === 4 && segments[2] === 'event'
}

// In isValidInternalRedirectPath:
if (segments[0] === 'ligue' || segments[0] === 'saison') {
  return isValidLeagueScopedPath(segments)
}
```

### Architecture compliance

- **Stack:** Angular 21 standalone; routes in `app.routes.ts`; helpers under `core/navigation/`. [Source: architecture.md § Frontend Architecture]
- **Member navigation table:** `/ligue/:slug` = league workspace; `/saison/:slug` = alias. [Source: architecture.md § Member navigation]
- **Security:** Open-redirect rules unchanged — prefix allowlist must include `/ligue/` shapes. [Source: Story 12.5; NFR-S1]
- **No legacy edits:** Do not modify `legacy/`.
- **Terminology:** UI “ligue”; code may keep `seasonSlug` signal names until a dedicated rename slice.

### Previous story intelligence

- **Stories 12.2, 12.4, 12.5** explicitly deferred `/ligue/:slug` and used `/saison/` for all navigation — **12.6 is the migration point**.
- **Story 12.5** finalized post-login priority; only change here is last-league URL prefix + redirect validation. Do not alter priority order or `/agenda` fallback.
- **Story 12.4** context strip linked to `/saison/:slug` — update to `/ligue/:slug` via helpers.
- **Story 12.3** agenda filters unchanged; row navigation in `user-agenda.ts` updates here.
- **Story 2.9** `lastVisitedSeason` slug storage unchanged — stores slug only, not full path.

### Git intelligence

Recent relevant commits:

- `86159ef feat(composition): Add participation modal on Équipe tab`
- `0afdb45 feat(agenda): Add user agenda API and Mon agenda screen`
- `0c7aea3 feat(web): Post-login redirect to last visited league`

Follow Conventional Commits: `feat(web): Add /ligue route alias for league workspace`

### Latest tech information

No new npm dependencies. Angular `Routes` array duplicate paths are supported in Angular 21. No API version changes.

### Testing standards

- Vitest + Angular TestBed; mock `Router` / `provideRouter`.
- After changes, grep `'/saison'` in `apps/web/src/app` — remaining hits should be **route definitions**, **redirect validation tests for backward compat**, or **comments** — not new navigation emissions.
- Commands:

```bash
npm run test -w @hatcast/web -- --watch=false
npm run build -w @hatcast/web
```

### References

- [Source: `_bmad-output/planning-artifacts/epics.md` — Story 12.6]
- [Source: `_bmad-output/planning-artifacts/architecture.md` — Member navigation, League vs season naming]
- [Source: `_bmad-output/planning-artifacts/ux-design-journey-league-agenda.md` — Route aliases, UX-DR13]
- [Source: `_bmad-output/planning-artifacts/plan-v2-league-journey.md` — Wave 1 Story 12.6]
- [Source: `docs/adr/0011-league-model-and-user-agenda.md`]
- [Source: `_bmad-output/implementation-artifacts/12-2-ecran-mon-agenda.md`]
- [Source: `_bmad-output/implementation-artifacts/12-4-bandeau-contexte-evenement.md`]
- [Source: `_bmad-output/implementation-artifacts/12-5-routage-post-connexion-agenda.md`]
- [Source: `apps/web/src/app/app.routes.ts`]
- [Source: `apps/web/src/app/core/navigation/post-login-redirect-storage.ts`]

## Dev Agent Record

### Agent Model Used

Composer

### Debug Log References

### Completion Notes List

- Added four `/ligue/*` route aliases mirroring `/saison/*` (same components; no redirect on load).
- Introduced `league-routes.ts` helpers; all in-app navigation and `routerLink` bindings now emit `/ligue/`.
- Refactored post-login redirect validation with shared `isValidLeagueScopedPath` for `/ligue/` and `/saison/`.
- Post-login last-visited league resolves to `leagueWorkspacePath(slug)`; `lastVisitedSeason` key unchanged.
- Tests: 311 passed; build succeeded. Smoke spec confirms `/ligue/test-slug` → `SeasonHome`.
- Code review (batch): `app.routes.spec.ts` — 8 smoke tests (4 `/ligue/*` + 4 `/saison/*` alias); 318 tests pass.

### File List

- apps/web/src/app/app.routes.ts
- apps/web/src/app/app.routes.spec.ts (new)
- apps/web/src/app/core/navigation/league-routes.ts (new)
- apps/web/src/app/core/navigation/league-routes.spec.ts (new)
- apps/web/src/app/core/navigation/post-login-redirect-storage.ts
- apps/web/src/app/core/navigation/post-login-redirect-storage.spec.ts
- apps/web/src/app/core/navigation/post-login-navigation.service.ts
- apps/web/src/app/core/navigation/post-login-navigation.service.spec.ts
- apps/web/src/app/pages/user-agenda/user-agenda.ts
- apps/web/src/app/pages/user-agenda/user-agenda.spec.ts
- apps/web/src/app/pages/event-detail/event-detail.ts
- apps/web/src/app/pages/event-detail/event-detail.spec.ts
- apps/web/src/app/pages/event-detail/event-context-strip.ts
- apps/web/src/app/pages/event-detail/event-context-strip.html
- apps/web/src/app/pages/event-detail/event-detail-header.ts
- apps/web/src/app/pages/event-detail/event-detail-header.html
- apps/web/src/app/pages/season-home/season-home.ts
- apps/web/src/app/pages/season-home/season-home.spec.ts
- apps/web/src/app/pages/season-home/season-header.ts
- apps/web/src/app/pages/season-home/season-header.html
- apps/web/src/app/pages/seasons-list/seasons-list.ts
- apps/web/src/app/pages/admin-participants/admin-participants.ts
- apps/web/src/app/pages/admin-participants/admin-participants.html
- apps/web/src/app/pages/admin-participants/admin-participants.spec.ts
- apps/web/src/app/shared/member-profile/member-profile-dialog.ts

## Change Log

- 2026-05-25: Story 12.6 — `/ligue/:slug` route aliases, canonical navigation helpers, post-login and redirect validation updates, tests.

### Review Findings

- [x] [Review][Patch] Route smoke tests cover only workspace alias [apps/web/src/app/app.routes.spec.ts:15]
- [x] [Review][Patch] No regression test for `/saison/:slug` alias [apps/web/src/app/app.routes.spec.ts]
- [x] [Review][Patch] `league-routes.ts` and specs untracked while HEAD already imports them [apps/web/src/app/core/navigation/league-routes.ts]
- [x] [Review][Defer] `season-header.spec.ts` admin links assert substring only, not `/ligue/` prefix [apps/web/src/app/pages/season-home/season-header.spec.ts:65] — deferred, pre-existing weak assertion pattern
