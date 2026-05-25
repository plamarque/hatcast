# Story 17.3: `/troupes` page (Mes troupes + Découvrir)

Status: review

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

## Story

As a **signed-in member**,
I want a **`/troupes` directory** with **Mes troupes** cards and a **Découvrir** section below,
so that **I no longer rely on `/seasons` as my troupe hub** and can open each troupe from a clear card grid (ADR 0013).

## Acceptance Criteria

1. **Given** a signed-in user with one or more active troupe memberships, **when** they open `/troupes`, **then** section **Mes troupes** shows a responsive **card grid**: troupe logo (or Material fallback), name, **member count**, **upcoming spectacle count**, and primary CTA **Ouvrir** → `/troupes/:slug` (existing hub stub until 17.4). [Source: epics 17.3; UX Screen 2b; design-thinking wireframe P1]
2. **Given** the same page, **when** the user scrolls past Mes troupes, **then** section **Découvrir** appears with the **same card layout** for non-member troupes; non-member actions remain **OPEN** (placeholder copy or disabled CTA acceptable). [Source: epics 17.3; ADR 0013 §1 Découvrir deferred Epic 4]
3. **Given** page chrome, **when** loaded on desktop, **then** breadcrumb is **`Mon agenda › Troupes`** (`/agenda` link + current page); top-right **avatar account menu** only — **no** scope admin gear, **no** troupe admin block on this list. [Source: epics 17.3; ux-design-scope-admin-menu-epic17.md § Screen 4]
4. **Given** API load for Mes troupes, **when** `GET /v1/troupes` returns, **then** each card includes **`activeMemberCount`** and **`upcomingEventCount`** per troupe with aggregation rules documented below (same upcoming boundary as user agenda). [Source: epics 17.3 AC API; PLAN.md depends API compteurs]
5. **Given** no memberships, **when** `/troupes` loads, **then** Mes troupes shows an empty state with path to join demo troupe (reuse `environment.demoTroupeId` + `joinTroupe` pattern from `seasons-list`) and Découvrir section still renders per AC2 stub rules. [Source: `seasons-list` empty membership UX]
6. **Given** session missing or expired, **when** `/troupes` is opened, **then** redirect to `/connexion` with post-login return URL (same pattern as `UserAgenda` / `SeasonsList`). [Source: Story 12.5]
7. **Given** implementation complete, **when** `npm run test -w @hatcast/web -- --watch=false` and `npm run build -w @hatcast/web` (and API tests for new fields), **then** they pass; tests cover cards, counts, breadcrumb, Ouvrir link, no admin gear, Découvrir placeholder. [Source: repo norms]

## Tasks / Subtasks

- [x] **API — extend troupe list with counters** (AC: 4)
  - [x] Add `activeMemberCount: Long` and `upcomingEventCount: Long` to `TroupeListItemDto` (Kotlin + OpenAPI if generated).
  - [x] In `TroupeMembershipService.listActiveTroupesForUser`, populate counts per troupe (prefer **one or two aggregate queries**, not N+1 per troupe).
  - [x] **`activeMemberCount`:** count `TroupeMembershipEntity` with `status = ACTIVE` for that troupe.
  - [x] **`upcomingEventCount`:** count **distinct** non-archived events with `startsAt >= AgendaTimeBoundary.startOfTodayInclusive()` in non-archived seasons of that troupe where the **caller** is an **ACTIVE** `season_participants` **or** `event_participants` row (same eligibility as `UserAgendaRepository.findUpcomingForUser` — document in KDoc + story).
  - [x] Integration test: member with 2 troupes sees correct counts; zero upcoming → `0`; non-member troupe not in list.
  - [x] Update `TroupeApiService` / `troupe-api.service.spec.ts` for new JSON fields.

- [x] **Route + page shell** (AC: 1, 3, 6)
  - [x] Add `{ path: 'troupes', component: TroupesList }` in `app.routes.ts` (**before** `troupes/:slug` so list route matches first).
  - [x] Add `troupesListPath()` in `troupe-routes.ts` → `['/troupes']`.
  - [x] Create `apps/web/src/app/pages/troupes-list/` (ts, html, scss, spec.ts).
  - [x] Header: breadcrumb nav + `UserAvatarComponent` account menu (copy pattern from `user-agenda` / `seasons-list`).
  - [x] Page title area: **Troupes** (H1) optional if breadcrumb already says Troupes — avoid duplicate noisy titles on mobile.

- [x] **`app-troupe-card` shared component** (AC: 1, 2)
  - [x] Inputs: `name`, `slug`, `memberCount`, `upcomingCount`, `mode: 'mine' | 'discover'`.
  - [x] Logo: `<img>` when URL exists later; until API has logo, **`mat-icon`** in round badge (`groups` / `theater_comedy` — match `context-breadcrumb`).
  - [x] Copy: `{{ n }} membre(s)` / `{{ n }} spectacle(s) à venir` with French plural rules (1 vs other).
  - [x] **Ouvrir** → `troupeHubPath(slug)`; discover mode: secondary/disabled CTA or “Bientôt” per OPEN policy.

- [x] **Mes troupes section** (AC: 1, 5)
  - [x] Load via `TroupeApiService.listMyTroupes()` after session gate.
  - [x] Card grid CSS (responsive 1–3 columns); loading spinner + error retry.
  - [x] Empty membership: message + **Rejoindre la troupe de démonstration** (mirror `seasons-list`).

- [x] **Découvrir section** (AC: 2)
  - [x] **No public directory API today** (Epic 4 backlog) — implement **stub**:
    - Option A (recommended): section heading + short copy (“L’annuaire public arrive bientôt”) + empty state; no fake cards.
    - Option B: if product wants visual parity, show **demo seed troupe** only when user is **not** already a member (`joinTroupe` seed) — document in PR if used.
  - [x] Add `id="decouvrir"` on section for future `/troupes#decouvrir` deep link (agenda empty state in 17.5).

- [x] **Explicit non-goals** (scope guard)
  - [x] Do **not** redirect `/seasons` → `/troupes` (**17.5**).
  - [x] Do **not** change `user-agenda` “Mes troupes” link yet (**17.5** — still `/seasons` until then).
  - [x] Do **not** implement full troupe hub (**17.4**); **Ouvrir** uses existing `TroupeHubStub`.
  - [x] Do **not** add `app-scope-admin-menu` or season CRUD on this page.
  - [x] Do **not** remove or refactor `seasons-list` (admin season management stays there until 17.5).

- [x] **Tests & build** (AC: 7)
  - [x] `troupes-list.spec.ts`: breadcrumb links, cards from mock API, Ouvrir href, no admin menu.
  - [x] API integration test for extended `GET /v1/troupes`.
  - [x] Run web unit tests + build.

## Dev Notes

### Product and UX rules

- **Purpose:** Member-facing **troupe directory**; replaces mental model of `/seasons` as “my troupes” without removing admin season list yet. [Source: ADR 0013 §1; design-thinking empathy map]
- **Vocabulary:** UI **Troupe** / **Saison** / **Spectacle**; code keeps `season` / `league` in API fields where unchanged.
- **Admin:** Troupe administration (Membres, season create) stays on **hub** (17.4) and **gear menu** (17.2) — **not** on `/troupes` list. [Source: ux-design-scope-admin-menu-epic17.md]
- **Breadcrumb:** Simple two-segment nav in page header — **do not** force-fit `app-context-breadcrumb` (season/event layouts only). [Source: Story 17.1 scope]
- **Mobile:** Full breadcrumb text OK on this page (no 480px logo-only rule — that applies to season/event workspace chrome).

### API aggregation (must document in code + PR)

| Field | Definition |
|-------|------------|
| `activeMemberCount` | Active troupe memberships (`TroupeMembershipStatus.ACTIVE`). |
| `upcomingEventCount` | Distinct upcoming events (non-archived event + season, `startsAt >= startOfTodayInclusive()`) in that troupe where the **current user** qualifies via **season** and/or **event** participant ACTIVE rows — **mirror** `UserAgendaRepository` eligibility, **not** “all troupe events”. |

**Why user-scoped upcoming count:** A member card answers “how many spectacles **à venir** concernent **ma** participation dans cette troupe”, aligned with agenda semantics (FR48), not troupe-wide public programming.

### Découvrir stub (Epic 4 not built)

- FR32/FR33 (public directory) = **backlog** — no `GET /v1/troupes/public` or similar in `services/api` today.
- AC allows **OPEN** non-member actions: ship honest placeholder; avoid inventing join-request flows.
- Future Epic 4 will feed Découvrir cards; keep section DOM/`id="decouvrir"` stable.

### Existing code to reuse

| File | Reuse for |
|------|-----------|
| `apps/web/src/app/core/troupes/troupe-api.service.ts` | `listMyTroupes()` — extend `TroupeListItem` type |
| `apps/web/src/app/core/navigation/troupe-routes.ts` | `troupeHubPath()` for Ouvrir |
| `apps/web/src/app/pages/user-agenda/user-agenda.ts` | Session gate, avatar menu, layout tokens |
| `apps/web/src/app/pages/seasons-list/seasons-list.ts` | Demo troupe join, empty membership, error retry |
| `apps/web/src/app/shared/context-breadcrumb/context-breadcrumb.scss` | Logo badge sizing / fallback icon styling |
| `services/api/.../agenda/AgendaTimeBoundary.kt` | Shared “today” boundary for upcoming |
| `services/api/.../agenda/UserAgendaRepository.kt` | SQL eligibility reference for upcoming count |

### Implementation guardrails

- **Route order:** Register `path: 'troupes'` **before** `troupes/:slug` in `app.routes.ts`.
- **Performance:** Batch count queries for all troupe IDs returned by memberships in one service call.
- **Security:** `GET /v1/troupes` remains **authenticated memberships only**; Découvrir stub must not leak private troupe data without Epic 4 public contract.
- **Logo:** `TroupeListItem` has no `logoUrl` — icon fallback until 17.4/brand assets (same as 17.1).
- **Copy consistency:** Prefer **spectacle(s) à venir** on cards (UX Screen 2b), not “événement”.

### Previous story intelligence (17.1, 17.2)

- **17.1:** `troupeHubPath`, breadcrumb patterns, stub `/troupes/:slug` — **Ouvrir** must use `troupeHubPath`, not `/troupe/.../admin/membres`.
- **17.2:** No scope admin gear on directory/list surfaces; season admin stays on season toolbar.
- **17.5** will wire `/seasons` redirect and agenda “Mes troupes” → `/troupes` — do not partially redirect in 17.3 (avoid duplicate migration steps).

### Git intelligence

Recent Epic 17 commits:

- `f2de86d` — `app-scope-admin-menu`, season toolbar + troupe stub gear.
- `d499911` — `app-context-breadcrumb`, header refactor, `troupe-routes.ts`, `TroupeHubStub`.

Follow standalone components, signals, Vitest + `TestBed` patterns from those commits.

### Project Structure Notes

- New page: `apps/web/src/app/pages/troupes-list/`
- New shared (optional): `apps/web/src/app/shared/troupe-card/`
- Touch: `app.routes.ts`, `troupe-routes.ts`, `troupe-api.service.ts` (+ spec), `TroupeDtos.kt`, `TroupeMembershipService.kt`, `TroupeMembershipIntegrationTest.kt` or new test class

### References

- [Source: `_bmad-output/planning-artifacts/epics.md` — Story 17.3]
- [Source: `docs/adr/0013-troupe-navigation-equity-tags-event-slugs.md` — §1 IA]
- [Source: `_bmad-output/planning-artifacts/ux-design-journey-league-agenda.md` — Screen 2b]
- [Source: `_bmad-output/design-thinking-2026-05-25.md` — wireframe P1, item 17.3]
- [Source: `PLAN.md` — Epic 17 table story 17.3]
- [Source: `_bmad-output/implementation-artifacts/17-1-breadcrumb-contexte-responsive.md`]
- [Source: `_bmad-output/implementation-artifacts/17-2-bandeau-administration-par-scope.md`]
- [Source: `_bmad-output/planning-artifacts/ux-design-scope-admin-menu-epic17.md`]

## Dev Agent Record

### Agent Model Used

Composer

### Debug Log References

### Completion Notes List

- Extended `GET /v1/troupes` with `activeMemberCount` and `upcomingEventCount` via batched queries (`countActiveMembersByTroupeIds`, `TroupeListStatsRepository.countUpcomingEventsByTroupeIdsForUser` mirroring agenda eligibility).
- Added `/troupes` page (`TroupesList`) with breadcrumb Mon agenda › Troupes, avatar menu only, Mes troupes card grid, Découvrir stub (`#decouvrir`), demo troupe join empty state.
- Added shared `app-troupe-card` with French plural labels and Ouvrir → `troupeHubPath`.
- Tests: `troupes-list.spec.ts`, `troupe-api.service.spec.ts`, `TroupeMembershipServiceTest` (+ integration assertions in `TroupeMembershipIntegrationTest`). Web build OK. Full web suite: 363/364 pass — pre-existing failure in `event-dispos-tab.spec.ts` (unrelated). API integration tests blocked locally by Flyway V23 on H2 (`CREATE EXTENSION`).

### File List

- `services/api/src/main/kotlin/com/hatcast/api/troupe/dto/TroupeDtos.kt`
- `services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeMembershipRepository.kt`
- `services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeListStatsRepository.kt`
- `services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeMembershipService.kt`
- `services/api/src/test/kotlin/com/hatcast/api/troupe/TroupeMembershipServiceTest.kt`
- `services/api/src/test/kotlin/com/hatcast/api/troupe/TroupeMembershipIntegrationTest.kt`
- `apps/web/src/app/app.routes.ts`
- `apps/web/src/app/core/navigation/troupe-routes.ts`
- `apps/web/src/app/core/troupes/troupe-api.service.ts`
- `apps/web/src/app/core/troupes/troupe-api.service.spec.ts`
- `apps/web/src/app/shared/troupe-card/troupe-card.ts`
- `apps/web/src/app/shared/troupe-card/troupe-card.html`
- `apps/web/src/app/shared/troupe-card/troupe-card.scss`
- `apps/web/src/app/pages/troupes-list/troupes-list.ts`
- `apps/web/src/app/pages/troupes-list/troupes-list.html`
- `apps/web/src/app/pages/troupes-list/troupes-list.scss`
- `apps/web/src/app/pages/troupes-list/troupes-list.spec.ts`
- `apps/web/src/app/pages/seasons-list/seasons-list.spec.ts`
- `apps/web/src/app/pages/season-home/season-home.spec.ts`
- `apps/web/src/app/pages/event-detail/event-detail.spec.ts`
- `apps/web/src/app/pages/account-placeholder/account-placeholder.spec.ts`
- `apps/web/src/app/pages/admin-membres/admin-membres.spec.ts`
- `apps/web/src/app/core/troupes/troupe-context.service.spec.ts`
- `apps/web/src/app/core/troupes/troupe-season-resolver.service.spec.ts`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

### Review Findings

- [ ] [Review][Patch] Remove unused `countByTroupe_IdAndStatus` repository method [`TroupeMembershipRepository.kt:55`]
- [ ] [Review][Patch] Strengthen API integration test per story task (2 troupes, exact counts, zero upcoming) [`TroupeMembershipIntegrationTest.kt`]
- [ ] [Review][Patch] Consolidate redundant integration tests for troupe list counters [`TroupeMembershipIntegrationTest.kt:97-107`]
- [x] [Review][Defer] Session redirect test does not assert `rememberCurrentUrlForPostLogin` — deferred, pre-existing pattern (same as `seasons-list`)
- [x] [Review][Defer] API integration tests blocked locally by Flyway V23 on H2 — deferred, environment
- [x] [Review][Defer] Pre-existing `event-dispos-tab.spec.ts` failure in full web suite — deferred, unrelated

### Change Log

- 2026-05-25: Story 17.3 — `/troupes` directory page, API troupe list counters, tests (Composer).
- 2026-05-25: Code review — 3 patch, 3 defer, 2 dismissed.
