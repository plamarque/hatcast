# Story 17.4: Troupe hub `/troupes/:slug`

Status: done

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

## Story

As a **member of a troupe**,
I want a **troupe home page** (logo, seasons, admin entry, member preferences),
so that **troupe life is centralized** and I no longer rely on `/seasons` as the troupe hub (ADR 0013).

## Acceptance Criteria

1. **Given** an active member opens `/troupes/:slug`, **when** the page loads, **then** it shows **troupe logo** (or Material fallback), **troupe name**, a **Saisons** block listing **non-archived** seasons as tappable cards (title, optional subtitle with `eventCount` / `participantCount`), each linking to `/saison/:seasonSlug`, and a control **Afficher les saisons archivées** that reveals archived seasons in the same layout. [Source: epics 17.4; UX Screen 4; ADR 0013 §1]
2. **Given** `TROUPE_ADMIN` on the hub, **when** the page is shown, **then** **Nouvelle saison** opens the existing `SeasonFormDialog` (create mode) and on success navigates to `/saison/:newSlug`; **gear menu** (Story 17.2) shows **Membres** in the hero/actions row (not breadcrumb). [Source: epics 17.4; ux-design-scope-admin-menu-epic17.md § Screen 3]
3. **Given** any member on the hub, **when** they use **Préférences dans cette troupe** (secondary icon control, **not** inside the admin gear menu), **then** a **drawer or bottom sheet** lets them edit **pseudo troupe** (`PATCH /v1/troupes/:id/memberships/me` `displayName`) and **rôles préférés** (`GET/PUT .../preferred-roles`) with the same role keys/labels as account / member profile (FR9, AC10). [Source: epics 17.4; ADR 0013 §2]
4. **Given** breadcrumb on desktop, **when** hub loads, **then** **`Troupes › {troupe name}`** with **Troupes** linking to `/troupes`; mobile may use compact pattern consistent with 17.1 (logo in header optional — full text OK on hub per 17.3 precedent). [Source: ux-design-journey-league-agenda.md Screen 4]
5. **Given** `app-context-breadcrumb` on season/event screens, **when** user taps troupe logo/name, **then** they land on **`/troupes/:slug`** (already `troupeHubPath` — must remain after hub replace stub). [Source: epics 17.4 AC link from spectacle]
6. **Given** admin membres route per ADR, **when** gear **Membres** is used, **then** navigation uses **`/troupes/:slug/admin/membres`** (add route alias); keep **`/troupe/:slug/admin/membres`** as redirect or parallel route for bookmarks until 17.5 cleanup. [Source: epics 17.4 « Route » line]
7. **Given** bottom of hub, **when** rendered, **then** link **Explorer d’autres troupes** → `/troupes#decouvrir`. [Source: UX Screen 4]
8. **Given** non-member or unknown slug, **when** `/troupes/:slug` loads, **then** **404-style** in-page message (reuse stub pattern) + link to `/troupes` or `/agenda` — no silent wrong troupe. [Source: TroupeHubStub behaviour]
9. **Given** session missing, **when** hub opened, **then** redirect `/connexion` with post-login return URL (same as `TroupesList` / stub). [Source: Story 12.5]
10. **Given** implementation complete, **when** `npm run test -w @hatcast/web -- --watch=false` and `npm run build -w @hatcast/web`, **then** they pass; tests cover seasons list, admin gear, preferences save, breadcrumb, create season navigation, non-member 404. [Source: repo norms]

## Tasks / Subtasks

- [x] **Replace stub with `TroupeHub` page** (AC: 1, 2, 4, 7, 8, 9)
  - [x] Rename/replace `troupe-hub-stub/` → `troupe-hub/` (or evolve stub files in place); update `app.routes.ts` `troupes/:slug` component.
  - [x] Session gate + resolve troupe by `:slug` from `TroupeContextService.load()` + `activeTroupes().find(slug)`; `selectTroupe(id)` on success.
  - [x] Page header: breadcrumb `Mon agenda` is **not** required — use **`Troupes › {name}`** per UX Screen 4 (`troupesListPath()` + current leaf).
  - [x] Hero: logo badge (`mat-icon` `groups` until `logoUrl` exists on API), **h1** name, `app-scope-admin-menu` scope `troupe` (reuse stub `troupeAdminItems` pattern).
  - [x] Footer discovery link → `['/troupes']` with fragment `decouvrir` or `routerLink="/troupes" fragment="decouvrir"`.

- [x] **Saisons block** (AC: 1, 2)
  - [x] Load seasons via `SeasonApiService.listSeasons(troupeId, page, size)` — use `page=0`, `size=50` (or paginate if `totalElements > size`; show “Charger plus” only if needed).
  - [x] Split UI: default list `!archived`; toggle **Afficher les saisons archivées** / **Masquer** for `archived === true`.
  - [x] Card copy example: `{{ title }}` + meta `{{ eventCount }} spectacle(s) · {{ participantCount }} participant(s)` (French plurals).
  - [x] Card `routerLink` → `saisonWorkspacePath(season.slug)`.
  - [x] **Nouvelle saison**: visible when `membership.baselineRole === 'TROUPE_ADMIN'` (same rule as `seasons-list` `canManageSeasons`); open `SeasonFormDialog` with `{ mode: 'create', troupeId }`; on success `router.navigate(saisonWorkspacePath(data.slug))`.
  - [x] Do **not** port season edit/delete/archive actions from `/seasons` unless product asks — hub is **open + create** only for MVP.

- [x] **Préférences drawer/sheet** (AC: 3)
  - [x] Secondary button/icon e.g. `tune` / `manage_accounts` with label **Préférences dans cette troupe** (visible to all active members).
  - [x] `MatBottomSheet` or `MatSidenav` — pick one and match mobile width.
  - [x] Pseudo field: reuse logic from `account-placeholder` (`updateMyMembership`, `troupeContext.patchMembershipDisplayName`).
  - [x] Preferred roles: reuse chips/toggles from `account-placeholder` or `member-profile-dialog` (`MemberProfileApiService.getPreferredRoles` / `updatePreferredRoles`, `orderedRoleKeys()`, `canDisablePreferredRole`).
  - [x] Save actions with snackbar errors; disable save when pseudo empty.

- [x] **Admin routes under `/troupes/:slug`** (AC: 6)
  - [x] Add `app.routes.ts`: `{ path: 'troupes/:slug/admin/membres', component: AdminMembres }` (reuse `AdminMembres`; ensure resolver reads `slug` from route — today `troupeSlug` param on `/troupe/:troupeSlug/...`).
  - [x] Update `troupeAdminMembresPath(slug)` in `troupe-routes.ts` to `['/troupes', slug, 'admin', 'membres']`.
  - [x] Update `admin-membres.ts` route param resolution to accept **either** `slug` (new) or `troupeSlug` (legacy) from `ActivatedRoute`.
  - [x] Optional: redirect route `/troupe/:troupeSlug/admin/membres` → `/troupes/:troupeSlug/admin/membres` (301-style `redirectTo` in Angular).

- [x] **Tests & build** (AC: 10)
  - [x] Migrate `troupe-hub-stub.spec.ts` → `troupe-hub.spec.ts`: breadcrumb, seasons cards, archived toggle, gear for admin, no gear for member, preferences patch mocked, create season dialog navigation.
  - [x] Update `troupe-routes.spec.ts` for new admin path.
  - [x] Run web unit tests + build.

### Review Findings

- [x] [Review][Patch] Slug change does not reload hub — [`troupe-hub.ts`] `paramMap` subscription + `applySlug()` reloads troupe/seasons on slug change.
- [x] [Review][Patch] AC3 pseudo save not disabled when empty — [`troupe-hub-preferences-sheet.ts`] `canSavePseudo` disables save button.
- [x] [Review][Patch] AC10 test gaps — [`troupe-hub.spec.ts`] Session redirect, Membres admin link, slug reload, only-archived hint tests added.
- [x] [Review][Patch] No unit tests for preferences sheet — [`troupe-hub-preferences-sheet.spec.ts`] Added.
- [x] [Review][Patch] Only-archived seasons UX — [`troupe-hub.html`] Hint before archived toggle.
- [x] [Review][Defer] Pagination beyond 50 seasons — [`troupe-hub.ts:41`] `SEASONS_PAGE_SIZE = 50` with no “Charger plus”; acceptable MVP unless a troupe exceeds 50 seasons.
- [x] [Review][Defer] Unrelated flaky-test fix in story diff — [`event-dispos-tab.spec.ts:183-191`] Drive-by stabilisation of chances toggle; not required for 17.4 acceptance.

## Dev Notes

### Product and UX rules

- **Replaces** `TroupeHubStub` placeholder (“Hub troupe — story 17.4”) shipped in 17.1/17.2/17.3.
- **Vocabulary:** UI **Troupe**, **Saison**, **Spectacle**; routes `/saison/`, `/troupes/`.
- **Admin gear vs préférences:** Gear = **Membres** only (17.2). Pseudo + rôles préférés = **separate** control (ADR 0013 §2, ux-design-scope-admin-menu-epic17.md § Future 17.4).
- **Logo:** No `logoUrl` on `TroupeListItem` yet — round badge + `mat-icon` like `context-breadcrumb` / `troupe-card` until brand assets API exists.
- **Multiple active seasons:** Show **all** non-archived seasons (ADR 0011); no single-season assumption.

### Explicit non-goals (scope guard)

- Do **not** redirect `/seasons` → `/troupes` (**17.5**).
- Do **not** change `user-agenda` “Mes troupes” link (**17.5**).
- Do **not** fix `event-context-strip` troupe link (`/troupe/.../admin/membres`) — **17.5** per PLAN.md; breadcrumb on event header already uses `troupeHubPath`.
- Do **not** remove `seasons-list` page (admin season CRUD/edit/delete stays there until later).
- Do **not** implement `events.slug` routes (**17.6**).
- Do **not** add troupe logo upload or `logoUrl` API unless trivial extension — icon fallback is acceptable.
- Do **not** implement **17.11** breadcrumb on admin membres page (LIMIT-002).

### Existing code to reuse

| Artifact | Reuse for |
|----------|-----------|
| `troupe-hub-stub.ts` | Session gate, `troupeAdminItems`, `ScopeAdminMenu`, troupe resolution |
| `seasons-list/season-form-dialog.ts` | Create season modal |
| `seasons-list/seasons-list.ts` | `canManageSeasons` = `TROUPE_ADMIN`, list/load patterns |
| `season-api.service.ts` | `listSeasons`, `createSeason` |
| `troupe-api.service.ts` | `updateMyMembership` |
| `member-profile-api.service.ts` | `getPreferredRoles`, `updatePreferredRoles` |
| `account-placeholder.*` | Pseudo + preferred roles form UX |
| `troupes-list.*` | Header + avatar menu pattern |
| `shared/scope-admin-menu/*` | Troupe admin gear |
| `troupe-routes.ts` | `troupeHubPath`, `saisonWorkspacePath`, `troupesListPath` |
| `shared/event-roles/event-roles.ts` | Role keys/labels for preferences |

### Implementation guardrails

- **Route order:** Keep `path: 'troupes'` **before** `troupes/:slug` in `app.routes.ts`.
- **Membership gate:** Only troupes in `activeTroupes()` after `TroupeContextService.load()` — same as stub (no public troupe by slug API).
- **Season list security:** `GET /v1/troupes/{id}/seasons` already requires membership (integration tests in `TroupeMembershipIntegrationTest`).
- **Archived seasons:** Use `SeasonResponse.archived`; do not delete from list — toggle visibility only.
- **Component naming:** Prefer `TroupeHub` selector `app-troupe-hub`; delete stub component when done to avoid duplicate routes.

### Previous story intelligence (17.1–17.3)

- **17.1:** `troupeHubPath`, `TroupeHubStub` route, breadcrumb links to hub — **must not regress**.
- **17.2:** Troupe gear in hero row; **Membres** entry; no gear in breadcrumb row.
- **17.3:** `/troupes` list + `app-troupe-card` **Ouvrir** → `troupeHubPath`; API counters on list only — hub uses **season** `eventCount`/`participantCount` per card.
- **17.5 next:** Redirects and event strip troupe link fix — do not partially duplicate in 17.4.

### Git intelligence

Recent Epic 17 commits to mirror:

- `b0ac951` — `troupes-list`, `troupe-card`, API list counters.
- `f2de86d` — `app-scope-admin-menu`.
- `d499911` — `context-breadcrumb`, `troupe-routes.ts`, initial stub.

Patterns: standalone components, signals, Vitest + `TestBed`, Material modules.

### Project Structure Notes

- Primary new/renamed: `apps/web/src/app/pages/troupe-hub/`
- Touch: `app.routes.ts`, `troupe-routes.ts` (+ spec), `admin-membres.ts` (route params), delete or gut `troupe-hub-stub/`
- No API changes required for MVP hub (seasons + membership endpoints exist).

### References

- [Source: `_bmad-output/planning-artifacts/epics.md` — Story 17.4]
- [Source: `docs/adr/0013-troupe-navigation-equity-tags-event-slugs.md`]
- [Source: `_bmad-output/planning-artifacts/ux-design-journey-league-agenda.md` — Screen 4]
- [Source: `_bmad-output/planning-artifacts/ux-design-scope-admin-menu-epic17.md` — Screen 3, Future 17.4]
- [Source: `_bmad-output/design-thinking-2026-05-25.md` — P0 item 17.4]
- [Source: `PLAN.md` — Epic 17 table 17.4]
- [Source: `_bmad-output/implementation-artifacts/17-3-page-troupes-mes-troupes-decouvrir.md`]
- [Source: `_bmad-output/implementation-artifacts/17-2-bandeau-administration-par-scope.md`]
- [Source: `_bmad-output/implementation-artifacts/17-1-breadcrumb-contexte-responsive.md`]

## Dev Agent Record

### Agent Model Used

Composer

### Debug Log References

### Completion Notes List

- Replaced `TroupeHubStub` with full `TroupeHub` at `/troupes/:slug`: breadcrumb, hero, seasons grid, archived toggle, admin gear, preferences bottom sheet, discovery footer, 404 state.
- `troupeAdminMembresPath` now targets `/troupes/:slug/admin/membres`; legacy `/troupe/:troupeSlug/admin/membres` redirects.
- `SeasonFormDialog` returns created season slug for post-create navigation.
- Tests: `troupe-hub.spec.ts`, `troupe-routes.spec.ts`; fixed flaky `event-dispos-tab` chances toggle in test.
- `npm run test -w @hatcast/web -- --watch=false` and `npm run build -w @hatcast/web` pass.

### File List

- apps/web/src/app/pages/troupe-hub/troupe-hub.ts
- apps/web/src/app/pages/troupe-hub/troupe-hub.html
- apps/web/src/app/pages/troupe-hub/troupe-hub.scss
- apps/web/src/app/pages/troupe-hub/troupe-hub.spec.ts
- apps/web/src/app/pages/troupe-hub/troupe-hub-preferences-sheet.ts
- apps/web/src/app/pages/troupe-hub/troupe-hub-preferences-sheet.spec.ts
- apps/web/src/app/app.routes.ts
- apps/web/src/app/core/navigation/troupe-routes.ts
- apps/web/src/app/core/navigation/troupe-routes.spec.ts
- apps/web/src/app/pages/admin-membres/admin-membres.ts
- apps/web/src/app/pages/seasons-list/season-form-dialog.ts
- apps/web/src/app/shared/availability/event-dispos-tab.spec.ts
- apps/web/src/app/pages/troupe-hub-stub/troupe-hub-stub.ts (deleted)
- apps/web/src/app/pages/troupe-hub-stub/troupe-hub-stub.html (deleted)
- apps/web/src/app/pages/troupe-hub-stub/troupe-hub-stub.scss (deleted)
- apps/web/src/app/pages/troupe-hub-stub/troupe-hub-stub.spec.ts (deleted)

### Change Log

- 2026-05-25: Story 17.4 — troupe hub MVP, admin route under `/troupes`, preferences sheet.
