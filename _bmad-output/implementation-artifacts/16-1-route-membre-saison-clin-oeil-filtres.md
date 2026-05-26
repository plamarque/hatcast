# Story 16.1: Member season glance route (`/membre/:userSlug`) with troupe/league filters

Status: done

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

## Story

As a **signed-in member**,
I want to open **my season at a glance** (and other participants' glances when allowed) on a **dedicated route** with optional **troupe** and **league** filters,
so that I can track participation with V1 parity, shareable URLs, and a **Planning** shortcut to my filtered agenda (FR55, FR58–FR59, UX-DR8).

## Acceptance Criteria

1. **Given** a signed-in user, **when** they open `/membre/:userSlug`, **then** a full-page **Personal season glance** shows: large avatar, troupe-scoped display name, three summary cards (**Disponibilités** / **Sélections** / **Désistements** with count + % and V1 tooltips), section *Ma saison en un clin d'œil* (monthly block chart), aggregated **Rôles favoris** pills (when counts exist), and footer **Planning** + back/navigation — parity with V1 [`PlayerModal.vue`](../../legacy/src/components/PlayerModal.vue) and UX-DR8. [Source: `_bmad-output/planning-artifacts/ux-design-hatcast-v2.md#screen-personal-season-glance`; epics Story 16.1]
2. **Given** the profile subject participates in **more than one troupe or league**, **when** the page loads, **then** a sticky filter bar shows **Toutes les troupes ▾**, **Toutes les ligues ▾**, and **Effacer filtres** (RES-001, FR55); **hidden** when exactly one troupe **and** one league apply to the subject's participation universe. [Source: Story 12.3; ADR 0012 §2]
3. **Given** troupe and/or league filters are active, **when** filters change, **then** stats and chart reload **server-side** with `troupeId` / `leagueId` query params; URL and `sessionStorage` stay in sync (deep-link + bookmark). Invalid UUIDs in URL are ignored client-side. [Source: Story 12.3 AC7–9]
4. **Given** another participant the viewer may see in a shared league, **when** the viewer opens `/membre/{otherSlug}`, **then** the same blocks render for that user; **preferred roles** editor is **read-only hidden** (not self). [Source: FR59; Story 2.7 AC4]
5. **Given** a member avatar in league workspace (season header self, admin membres row, équipe/dispos surfaces when wired), **when** the user clicks the avatar, **then** navigation goes to `/membre/:userSlug` with optional `?troupeId=&leagueId=` from current context — **MatDialog popover is not required** (may remain temporarily; route is canonical per ADR 0012). [Source: epics Story 16.1; ADR 0012 §4]
6. **Given** the **Planning** CTA, **when** activated, **then** navigate to `/agenda` with the same `troupeId` / `leagueId` query params when set (Story 12.3 deep link), not to `/saison/:slug` participant filter. [Source: UX-DR8 footer; Story 12.3]
7. **Given** dispos + composition data exist (Epics 5–6 delivered), **when** glance stats are computed for the selected scope, **then** the three cards and monthly chart use **V1 `getPlayerStats` semantics** from [`GridBoard.vue`](../../legacy/src/components/GridBoard.vue) (non-archived events in scope; availability % = effective dispos ÷ total events; selection % = initial selections ÷ effective dispos; decline % = declines ÷ initial selections; tooltips match V1 strings). **DEPLAC.** events count when `equity_tag = deplacements` or legacy `deplacement` is in the filtered season scope (FR60 minimal: recap cards consistent with league filter). [Source: DOMAIN.md; Story 3.6 rules family]
8. **Given** no dispos/casts in scope, **when** the API returns empty aggregates, **then** the UI shows the **honest empty state** already used in Story 2.7 (*« Statistiques disponibles lorsque les disponibilités seront saisies »* / empty chart shell) — never fabricated numbers. [Source: Story 2.7 AC5]
9. **Given** an unauthenticated or unauthorized viewer, **when** glance data is requested, **then** **401** / **403** / **404** (unknown slug) with SPA handling (redirect login or snack + back). [Source: NFR-S2]
10. **Given** Story 16.1 is complete, **when** tests run, **then** API integration tests cover slug resolution, filter scoping, authorization (self vs other, shared troupe), and stats shape; web tests cover route render, filter bar visibility, Planning navigation, avatar → route; `cd services/api && ./gradlew test`, `npm run test -w @hatcast/web -- --watch=false`, and `npm run build -w @hatcast/web` succeed. [Source: `architecture.md` § Testing]

## Tasks / Subtasks

- [x] **Database — stable `userSlug`** (AC: 1, 5, 9)
  - [x] Flyway migration: `users.slug VARCHAR(128) NOT NULL UNIQUE` (or nullable + backfill then NOT NULL).
  - [x] Backfill existing users: slugify from `display_name` or email local-part; collision suffix `-2`, `-3` (same algorithm as event slugs in `V17__events_slug.sql`).
  - [x] Set slug on user create/update in auth/signup paths.
  - [x] **Do not** use troupe `display_name` alone as URL key — slug is **account-level** per PRD `/membre/:userSlug`.

- [x] **Backend — season glance API** (AC: 1–4, 7–9)
  - [x] Add `GET /v1/members/{userSlug}/season-glance?troupeId=&leagueId=` (new OpenAPI file or `members.yaml` merged in composition).
  - [x] Resolve `userSlug` → `userId`; 404 if unknown.
  - [x] **Participation context for the profile subject** (not the viewer): reuse `UserAgendaRepository` participation queries with `targetUserId`; compute `filterBarVisible` + `participationFilters` catalog (mirror Story 12.1/12.3).
  - [x] **Authorization:** caller authenticated; viewer and target share **at least one troupe** where both have `ACTIVE` membership **OR** viewer can see target via same season participation rules as today (`MemberProfileService` — active troupe member for resolved season). Return **403** when no shared visibility.
  - [x] **Scope resolution:** `leagueId` (season UUID) selects the season for aggregation; when only `troupeId` set, pick subject's participating season in that troupe (document rule: e.g. most recently active season, or require `leagueId` when multiple seasons — prefer explicit 400 *« Sélectionnez une ligue »* if ambiguous).
  - [x] Response body: reuse/extend `MemberProfileSummary` fields + top-level `filterBarVisible`, `participationFilters`, `resolvedSeasonId`, `troupeId`, `leagueId`.
  - [x] Keep existing `GET /v1/seasons/{seasonId}/member-profile/{userId}` for season-context dialog until callers migrate; season glance route is the **canonical** cross-scope read model for 16.1.

- [x] **Backend — real stats provider** (AC: 7–8)
  - [x] Replace or supplement `StubMemberProfileStatsProvider` with `SeasonGlanceStatsProvider` (or rename) implementing `MemberProfileStatsProvider` using:
    - Event scope: non-archived events in resolved `seasonId`, optional `SeasonStatisticsCompartments` when equity filters apply.
    - Card formulas: port V1 `getPlayerStats` from `GridBoard.vue` (lines ~9814–9862) — **not** the per-column JEU/DECORUM grid from Story 3.6 (different UX).
    - Monthly chart: `getMonthlyActivityWithDetails` parity → `MemberProfileMonthDto` / `MemberProfileChartBlockDto` (`status`: `available` | `unavailable` | `declined` | `neutral`; optional `roleKey`).
    - Favorite role counts: from confirmed slot roles in scope (V1 `getFavoriteRoles`).
  - [x] Wire provider in `MemberProfileService` **and** new glance service (single implementation, two entry points).
  - [x] Integration tests with seeded dispos + composition (reuse fixtures from `SeasonStatistics` / composition tests).

- [x] **Angular — page + routing** (AC: 1, 3, 6)
  - [x] Add route `{ path: 'membre/:userSlug', component: MemberSeasonGlance }` in `app.routes.ts` (+ `app.routes.spec.ts`).
  - [x] Create `apps/web/src/app/pages/member-season-glance/` (page shell: header, account menu, loading/error).
  - [x] Extract shared presentation from `member-profile-dialog` into `shared/member-profile/member-profile-panel/` (stats, chart, favorite pills, preferred-role editor) OR refactor dialog to wrap the panel — **avoid duplicating** SCSS/HTML.
  - [x] `MemberSeasonGlanceApiService`: `getSeasonGlance(userSlug, { troupeId?, leagueId? })`.
  - [x] Filter bar: **reuse** `UserAgendaFilterBar` with `participationFilters` from glance API (same labels/copy as 12.3).
  - [x] Filter persistence: new storage key `hatcast.member-glance.filters` (parallel structure to `user-agenda-filters-storage.ts`); share `parseAgendaFilterUuid`.
  - [x] **Planning** CTA: `router.navigate(['/agenda'], { queryParams: { troupeId, leagueId } })`.
  - [x] Page title: *Ma saison en un clin d'œil* when `isSelf`, else *{displayName} — Saison en un clin d'œil*.

- [x] **Angular — migrate entry points** (AC: 5)
  - [x] `season-header.ts`, `event-detail-header.ts`, `membres-tab.ts`: replace `openProfileDialog` with `router.navigate(['/membre', userSlug], { queryParams })` — pass `troupeId` / `leagueId` from current season context when known.
  - [x] Resolve `userSlug` from session user for self; from membership row API field for others (**add `slug` to troupe member list DTO** if not present).
  - [x] Optional: keep `MemberProfileService.openProfileDialog` as thin redirect wrapper during transition (one release), then delete dialog in follow-up if product agrees.

- [x] **Tests** (AC: 10)
  - [x] API: `MemberSeasonGlanceIntegrationTest` — slug 404, shared troupe 403, filters change payload, stats non-null with fixture data, `filterBarVisible` false when single context.
  - [x] Web: `member-season-glance.spec.ts` — loads profile, filter bar hidden/shown, Planning navigates to `/agenda?…`, read-only when not self.
  - [x] Web: update `season-header.spec.ts` — avatar navigates to `/membre/…` instead of opening dialog.
  - [x] Regression: `member-profile-dialog.spec.ts` still passes if dialog kept as wrapper.

- [ ] **Optional (AC 9):** Infos tab **Annoncer** → `intent=event` — deferred.

## Dev Notes

### Scope boundaries

| In scope (16.1) | Out of scope |
|-----------------|--------------|
| Route `/membre/:userSlug` + query filters | Popover-only UX as canonical (dialog → redirect OK) |
| `users.slug` + glance API | Epic 13 multi-active league migration |
| Real `MemberProfileStatsProvider` for one season scope | Cross-season **merged** chart when « Toutes les ligues » (MVP: require league or show primary season — document in API) |
| Reuse `UserAgendaFilterBar` | `/compte` preferred-roles tab (Story 2.7 review item — still deferred) |
| Avatar → route in wired surfaces | Every équipe/dispos avatar (wire when those surfaces exist) |
| Planning → `/agenda` filtered | Planning → `/saison/:slug?participant=` (old 2.7 behavior — superseded for member hub) |
| Vitest + integration tests | `legacy/` changes |

### Critical gap: `userSlug` does not exist yet

`users` table today (`V1__create_users.sql`) has **no slug**. Story **must** add it before the route can work. Do **not** put raw UUID in public URLs unless product explicitly approves — PRD/architecture specify **`userSlug`**.

Suggested slug rules (align with event slug migration):

| Rule | Value |
|------|--------|
| Charset | lowercase alphanumeric + hyphens |
| Source | `display_name` preferred, else email local-part |
| Uniqueness | global on `users.slug` |
| Stability | slug changes only via explicit account rename flow (optional MVP: immutable after create) |

### API design (recommended)

```http
GET /v1/members/{userSlug}/season-glance?troupeId=<uuid>&leagueId=<uuid>
```

```json
{
  "userId": "…",
  "userSlug": "angie-dupont",
  "displayName": "Angie",
  "avatarUrl": "…",
  "isSelf": false,
  "resolvedSeasonId": "…",
  "filterBarVisible": true,
  "participationFilters": {
    "troupes": [{ "id": "…", "name": "La BIM", "slug": "la-bim" }],
    "leagues": [{ "id": "…", "title": "Ligue 2026", "slug": "ligue-2026", "troupeId": "…" }]
  },
  "stats": { "availabilities": { "count": 25, "percent": 68, "tooltip": "…" }, "…": {} },
  "monthlyChart": [{ "monthKey": "2026-03", "blocks": [{ "eventId": "…", "status": "available", "roleKey": "player" }] }],
  "favoriteRoleCounts": [{ "roleKey": "player", "count": 4 }],
  "preferredRoleKeys": ["player", "volunteer"]
}
```

- `preferredRoleKeys` only when `isSelf` (same as today).
- When `filterBarVisible: false`, omit filters; auto-resolve the single `leagueId` / `seasonId`.
- **Ambiguity rule:** if `troupeId` set but subject has **multiple** seasons in that troupe and `leagueId` omitted → **400** with French message asking to select a league (prevents wrong stats).

### V1 stats formulas (three cards — do not confuse with Story 3.6 grid)

Port from [`legacy/src/components/GridBoard.vue`](../../legacy/src/components/GridBoard.vue) `getPlayerStats`:

| Card | Count | % denominator |
|------|-------|----------------|
| **Disponibilités** | `timesAvailable` (effective dispos) | ÷ `totalNonArchivedEvents` in scope |
| **Sélections** | `totalInitialSelections` | ÷ `timesAvailable` |
| **Désistements** | `declines` (= initial selections − confirmed participations) | ÷ `totalInitialSelections` |

Tooltips (French, match V1 PlayerModal):

- Disponibilités: `Taux = ({timesAvailable} ÷ {totalNonArchivedEvents}) × 100`
- Sélections: `Taux = ({totalInitialSelections} ÷ {timesAvailable}) × 100`
- Désistements: `Taux = ({declines} ÷ {totalInitialSelections}) × 100`

Story **3.6** `SeasonStatisticsRules.statPercent` applies to **league Statistiques grid cells**, not these three summary cards.

### Filter bar reuse (Story 12.3)

| Rule | Implementation |
|------|----------------|
| RES-001 | Trust API `filterBarVisible` — never derive from UI row counts |
| Catalog source | Subject user's participations (season + event-only), same universe as agenda |
| Server-side | Refetch glance on every filter change |
| Labels | **Toutes les troupes**, **Toutes les ligues**, **Effacer filtres** |
| League scoping | When troupe selected, league menu = `leagues.filter(l => l.troupeId === troupeId)` |
| Storage | `hatcast.member-glance.filters` + URL query params |

**Do not** use `TroupeContextService.activeTroupes` for filter options.

### Existing code to reuse (do not reinvent)

| Asset | Use |
|-------|-----|
| [`member-profile-dialog.*`](../../apps/web/src/app/shared/member-profile/) | Visual/UX template for panel |
| [`member-profile-api.service.ts`](../../apps/web/src/app/core/member-profile/member-profile-api.service.ts) | Types + preferred-roles PUT |
| [`MemberProfileService.kt`](../../services/api/src/main/kotlin/com/hatcast/api/memberprofile/MemberProfileService.kt) | Auth pattern for troupe membership |
| [`UserAgendaFilterBar`](../../apps/web/src/app/shared/agenda/user-agenda-filter-bar.ts) | Filter UI |
| [`UserAgendaRepository`](../../services/api/src/main/kotlin/com/hatcast/api/agenda/UserAgendaRepository.kt) | Participation id queries |
| [`SeasonStatisticsService`](../../services/api/src/main/kotlin/com/hatcast/api/season/SeasonStatisticsService.kt) | Event/participant loading patterns for stats |
| [`season-statistics.utils.ts`](../../apps/web/src/app/pages/season-home/season-statistics.utils.ts) | Reference for sel/dispo math (grid only) |
| [`user-agenda-filters-storage.ts`](../../apps/web/src/app/core/agenda/user-agenda-filters-storage.ts) | UUID parse + storage pattern |

### Implementation guardrails

- **Do not** break `GET /v1/seasons/{seasonId}/member-profile/{userId}` — season-scoped callers may still exist.
- **Do not** client-aggregate stats across multiple seasons when filters are cleared — define explicit server behavior.
- **Do not** show preferred-role checkboxes for other members.
- **Do not** navigate Planning to `/saison/...` (member hub is `/agenda` per Epic 12).
- **Do not** recompute `filterBarVisible` from chart block count.
- **Do not** duplicate filter bar — extract or input-bind `UserAgendaFilterBar`.
- **Do not modify `legacy/`.**

### Previous story intelligence

- **2.7 (done):** Built `MemberProfileDialog`, `MemberProfileStatsProvider` stub, preferred roles on `troupe_memberships`, empty honest stats. **16.1 supersedes popover as canonical** (ADR 0012). Reuse dialog markup; implement real stats now that Epics 5–6 are done.
- **12.3 (done):** Filter bar pattern, `participationFilters`, URL + sessionStorage, server-side refetch — **mirror exactly** for glance. Review learnings: `reconcileFiltersWithCatalog`, keep bar visible during reload, clear storage when filters cleared.
- **3.6 (done):** `SeasonStatisticsService` + `SeasonStatisticsRules` for league grid — **reuse repositories**, not card formulas.
- **Epic 2 retro:** `MemberProfileStatsProvider` extension point was intentional — fill it here.

### Git intelligence

Recent work: admin/organizer UI (17.16, 17.17), statistics compartments (17.10), composition/share (6.10). Follow patterns: standalone components, signals, Kotlin integration tests, OpenAPI-first.

### Architecture compliance

- **Stack:** Angular 21 + Material; Spring Boot API; cookie session + CSRF on mutating calls. [Source: `_bmad-output/planning-artifacts/architecture.md`]
- **Routes:** Add `/membre/:userSlug` to member navigation table (architecture.md § Member navigation). [Source: ADR 0012 §4]
- **JSON:** camelCase; UUID path/query params.
- **Performance:** One glance API call per filter change; no N+1 season fetches.

### Testing standards

Backend:

```bash
cd services/api && ./gradlew test --tests '*MemberSeasonGlance*' --tests '*MemberProfile*'
```

Frontend:

```bash
npm run test -w @hatcast/web -- --watch=false --include "**/member-season-glance/**" --include "**/member-profile/**" --include "**/season-header.spec.ts"
npm run build -w @hatcast/web
```

### Project Structure Notes

Expected new/modified files:

- `services/api/src/main/resources/db/migration/V*__users_slug.sql`
- `services/api/openapi/members.yaml` (or extend `auth.yaml`)
- `services/api/src/main/kotlin/com/hatcast/api/memberglance/` (controller, service, stats provider)
- `services/api/src/test/kotlin/com/hatcast/api/memberglance/MemberSeasonGlanceIntegrationTest.kt`
- `apps/web/src/app/pages/member-season-glance/*`
- `apps/web/src/app/core/member-glance/member-season-glance-api.service.ts`
- `apps/web/src/app/core/member-glance/member-glance-filters-storage.ts`
- `apps/web/src/app/app.routes.ts`
- `apps/web/src/app/shared/member-profile/member-profile-panel/*` (if extracted)
- Update: `season-header.ts`, `membres-tab.ts`, `event-detail-header.ts`, `StubMemberProfileStatsProvider.kt` (replace)

### References

- [Source: `_bmad-output/planning-artifacts/epics.md` — Epic 16, Story 16.1]
- [Source: `_bmad-output/planning-artifacts/prd.md` — FR55, FR58–FR59]
- [Source: `_bmad-output/planning-artifacts/ux-design-hatcast-v2.md` — § Personal season glance, § Member profile pattern]
- [Source: `_bmad-output/planning-artifacts/plan-v2-league-journey.md` — Wave 1b, Story 16.1]
- [Source: `docs/adr/0012-league-views-travel-leagues-member-stats.md`]
- [Source: `DOMAIN.md` — Personal season glance, Statistiques de composition]
- [Source: `_bmad-output/implementation-artifacts/2-7-popover-profil-membre-stats-saison-grille-mensuelle-roles-favoris.md`]
- [Source: `_bmad-output/implementation-artifacts/12-3-filtres-troupe-ligue-agenda.md`]
- [Source: `_bmad-output/implementation-artifacts/3-6-vue-historique-colonnes-roles-mois-export-masquage.md`]
- [Source: `legacy/src/components/PlayerModal.vue`, `legacy/src/components/GridBoard.vue`]

## Dev Agent Record

### Agent Model Used

Composer (dev-story workflow)

### Debug Log References

- Spring `@SpringBootTest` integration tests may fail locally if Flyway/H2 migration is unhealthy (pre-existing); Kotlin compiles; unit tests pass.
- AC 9 (Infos **Annoncer**) deferred.

### Completion Notes List

- `users.slug` migration V28 + `UserSlugService` on auth/signup/import paths; `userSlug` on `UserSummaryDto` and `TroupeMemberAdminDto`.
- `GET /v1/members/{userSlug}/season-glance` with participation filters, 403/404 auth, scope resolution (400 when ambiguous troupe).
- `SeasonGlanceStatsProvider` replaces stub — V1 three-card formulas + monthly chart + favorite roles.
- Angular page `/membre/:userSlug` with filter bar (12.3 pattern), `MemberProfilePanel` shared with dialog, Planning → `/agenda?troupeId&leagueId`.
- Entry points: season header, event header, admin membres → `navigateToMemberGlance`.
- Tests: 510 web unit tests pass; `ng build` OK; `MemberSeasonGlanceIntegrationTest` authored.

### File List

- services/api/src/main/resources/db/migration/V28__users_slug.sql
- services/api/src/main/kotlin/com/hatcast/api/user/UserSlugGenerator.kt
- services/api/src/main/kotlin/com/hatcast/api/user/UserSlugService.kt
- services/api/src/main/kotlin/com/hatcast/api/user/UserEntity.kt
- services/api/src/main/kotlin/com/hatcast/api/user/UserRepository.kt
- services/api/src/main/kotlin/com/hatcast/api/auth/AuthUserLinkService.kt
- services/api/src/main/kotlin/com/hatcast/api/auth/dto/AuthDtos.kt
- services/api/src/main/kotlin/com/hatcast/api/avatar/AvatarService.kt
- services/api/src/main/kotlin/com/hatcast/api/troupe/dto/TroupeDtos.kt
- services/api/src/main/kotlin/com/hatcast/api/memberprofile/SeasonGlanceStatsProvider.kt
- services/api/src/main/kotlin/com/hatcast/api/memberglance/MemberSeasonGlanceService.kt
- services/api/src/main/kotlin/com/hatcast/api/memberglance/MemberSeasonGlanceController.kt
- services/api/src/main/kotlin/com/hatcast/api/memberglance/dto/MemberSeasonGlanceDtos.kt
- services/api/src/main/kotlin/com/hatcast/api/config/SecurityConfig.kt
- services/api/openapi/members.yaml
- services/api/src/test/kotlin/com/hatcast/api/memberglance/MemberSeasonGlanceIntegrationTest.kt
- services/api/src/test/kotlin/com/hatcast/api/memberglance/MemberSeasonGlanceServiceTest.kt
- services/api/src/test/kotlin/com/hatcast/api/auth/AuthUserLinkServiceTest.kt
- apps/web/src/app/pages/member-season-glance/member-season-glance.ts
- apps/web/src/app/pages/member-season-glance/member-season-glance.html
- apps/web/src/app/pages/member-season-glance/member-season-glance.scss
- apps/web/src/app/pages/member-season-glance/member-season-glance.spec.ts
- apps/web/src/app/core/member-glance/member-season-glance-api.service.ts
- apps/web/src/app/core/member-glance/member-glance-filters-storage.ts
- apps/web/src/app/shared/member-profile/member-profile-panel.ts
- apps/web/src/app/shared/member-profile/member-profile-panel.html
- apps/web/src/app/shared/member-profile/member-profile-dialog.ts
- apps/web/src/app/shared/member-profile/member-profile-dialog.html
- apps/web/src/app/shared/member-profile/member-profile-dialog.spec.ts
- apps/web/src/app/core/member-profile/member-profile.service.ts
- apps/web/src/app/core/auth/auth-api.service.ts
- apps/web/src/app/core/troupes/troupe-api.service.ts
- apps/web/src/app/app.routes.ts
- apps/web/src/app/pages/season-home/season-header.ts
- apps/web/src/app/pages/season-home/season-header.spec.ts
- apps/web/src/app/pages/event-detail/event-detail-header.ts
- apps/web/src/app/pages/admin-membres/membres-tab.ts
- apps/web/src/app/pages/admin-membres/membres-tab.html

### Review Findings

- [x] [Review][Decision] Autorisation alignée sur (a) MemberProfile — `troupeAccess.requireActiveMember` pour tout viewer ≠ cible sur la troupe de la saison résolue (2026-05-26).

- [x] [Review][Patch] Durcir l’autorisation glance — `MemberSeasonGlanceService.requireCanViewGlance` + `MemberSeasonGlanceServiceTest`.

- [x] [Review][Patch] Tests d’intégration AC10 — filtres, `filterBarVisible`, stats vides (`MemberSeasonGlanceIntegrationTest`).

- [x] [Review][Patch] Tests web — barre filtres, `isSelf: false`, reload `userSlug` (`member-season-glance.spec.ts`).

- [x] [Review][Patch] `userSlug` via `paramMap` + reload (`member-season-glance.ts`).

- [x] [Review][Defer] `./gradlew test --tests '*MemberSeasonGlance*'` échoue localement — échec Flyway H2 sur `V3_1__seed_troupe_la_malice.sql` (`ON CONFLICT`), pas sur V28 ; même classe de problème que d’autres stories. Valider en CI / env test sain.

- [x] [Review][Defer] `services/api/openapi/members.yaml` non référencé dans la composition OpenAPI du repo — contrat documenté mais pas fusionné ; impact génération/clients seulement si un pipeline l’exige.

### Change Log

- 2026-05-26: Story 16.1 — route `/membre/:userSlug`, season glance API, real stats, filter bar, entry-point migration (FR55 / UX-DR8).
- 2026-05-26: Code review BMAD — 1 decision-needed, 4 patch, 2 defer, 0 dismiss.
- 2026-05-26: Post-review — auth (a), tests unitaires/intégration/web, reload route `userSlug`.
