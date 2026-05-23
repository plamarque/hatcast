# Story 2.7: Member Profile Popover (Season Stats, Month Grid, Preferred Roles)

Status: done

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

## Story

As a **troupe member viewing a season**,
I want to **open a compact profile popover from a member avatar showing season participation stats, a month-at-a-glance chart, and preferred roles — with a quick link to planning**,
so that **I understand my (or a teammate's) activity in the season and can configure the roles I prefer for availability pre-selection**.

## Acceptance Criteria

1. **Given** an authenticated user in a **season context** (`/saison/:slug`) and a **clickable member avatar** (UX-DR8), **when** they activate the avatar, **then** a **Member profile** overlay opens showing: header (avatar + troupe display name), three stat cards, month chart section, preferred-roles section, and footer actions (*Planning*, *Fermer* / ×). [Source: `_bmad-output/planning-artifacts/ux-design-hatcast-v2.md#pattern-member-profile`; `_bmad-output/planning-artifacts/epics.md#story-27--popover-profil-membre-stats-saison-grille-mensuelle-roles-favoris`]
2. **Given** the popover is open, **when** the user clicks outside, presses Escape, or taps *Fermer* / ×, **then** the overlay closes without navigation side-effects. [Source: UX-DR8 acceptance hints]
3. **Given** the subject is the **current user** in the **current troupe**, **when** the popover opens, **then** identity uses **troupe-scoped** `displayName` (FR9) and account-level `avatarUrl` (FR10) via `UserAvatarComponent`. [Source: Story 2.5 / 2.6]
4. **Given** the subject is **another active troupe member** in the same season, **when** an authorized viewer opens their profile from a wired entry point, **then** the popover shows that member's troupe `displayName` and `avatarUrl` (when visible per membership rules); the viewer **cannot** edit that member's preferred roles (NFR-S2). [Source: NFR-S2; admin membres row pattern]
5. **Given** **availability/composition data does not yet exist** in V2 (Epics 5–6 not delivered), **when** stats or chart blocks would require dispos/casts, **then** the UI shows **honest empty states** (e.g. *« Statistiques disponibles lorsque les disponibilités seront saisies »*, chart area with zero blocks) — **not** fabricated numbers. Aggregated *« Rôles favoris »* counts (selection history) stay empty/hidden until Epic 5/6; do **not** block story completion on fake stats. [Source: `_bmad-output/planning-artifacts/implementation-readiness-report-2026-05-23.md` Story 2.7 rescope guidance; Story 3.6 dependency note]
6. **Given** availability/composition data **exists** (future integration with Stories 3.6 / 5.x / 6.x), **when** the profile API returns stats, **then** the three cards follow UX-DR8 semantics: **Disponibilités** (green), **Sélections** (purple), **Désistements** (red) with count + **%** and tooltips documenting numerator/denominator per [DOMAIN.md](../../DOMAIN.md) § Statistiques de composition and V1 `PlayerModal.vue` tooltips. [Source: UX-DR8; `legacy/src/components/PlayerModal.vue`]
7. **Given** chart data is available, **when** the month grid renders, **then** months span the season calendar, each month shows stacked coloured blocks per spectacle (green/red/grey semantics per UX-DR8), optional role emoji on selection blocks — aligned with V1 *« Ma saison en un clin d'œil »* layout. [Source: UX-DR8; `legacy/src/components/PlayerModal.vue`]
8. **Given** aggregated selection history exists, **when** *« Rôles favoris »* (stats pills) render, **then** each pill shows role label + emoji + **(count)** from season selections — distinct from the **configuration** checkboxes in AC9. [Source: UX-DR8; V1 `getFavoriteRoles` in `GridBoard.vue`]
9. **Given** the viewer is the **subject member**, **when** they toggle **preferred roles for the troupe** (FR46 configuration — checkboxes, V1 parity with `PreferencesModal.vue` roles tab), **then** choices persist **troupe-scoped** on their membership and are returned by the API for Story **5.2** pre-selection; **`volunteer` is always included** when saved (cannot be disabled, V1 rule). [Source: `_bmad-output/planning-artifacts/prd.md` FR46; `legacy/src/services/rolePreferencesService.js`]
10. **Given** preferred roles are saved, **when** the member reopens the popover or `/compte`, **then** the same troupe-scoped selection is shown; changing troupe context shows **that troupe's** preferences independently. [Source: FR46 troupe scope; Story 2.4 multi-troupe]
11. **Given** the **Planning** CTA, **when** activated for the profile subject, **then** the user navigates to the season **Agenda** view (`/saison/:slug`) with participant focus applied when the filter supports it (query param e.g. `?participant={userId}` or toolbar `selectedParticipantId`); if filter is still MVP-only *Tous*, navigation to Agenda alone satisfies AC until Story 3.3 filter is extended. [Source: UX-DR8 footer; `legacy/src/components/PlayerModal.vue` `showAvailabilityGrid`]
12. **Given** a user without a valid session or without access to the season/troupe, **when** they request profile data or mutate preferred roles, **then** **401** / **403** as appropriate. [Source: NFR-S2]
13. **Given** this story is complete, **when** tests run, **then** API tests cover preferred-roles CRUD, authorization, validation; web tests cover dialog open/close, self vs other read-only, preferred-role save, empty stats state; `cd services/api && ./gradlew test`, `npm run test -w @hatcast/web -- --watch=false`, and `npm run build -w @hatcast/web` succeed. [Source: `_bmad-output/planning-artifacts/architecture.md#project-structure--boundaries`]

## Tasks / Subtasks

- [x] **Database — troupe-scoped preferred roles** (AC: 9, 10, 12)
  - [x] Flyway `V13__membership_preferred_roles.sql`: add `preferred_role_keys JSONB NOT NULL DEFAULT '[]'` (or `TEXT[]`) on `troupe_memberships`.
  - [x] Extend `TroupeMembershipEntity`; map in repositories.

- [x] **Backend — preferred roles API** (AC: 9, 10, 12)
  - [x] `GET /v1/troupes/{troupeId}/memberships/me/preferred-roles` → `{ "preferredRoleKeys": ["player", …] }`.
  - [x] `PUT /v1/troupes/{troupeId}/memberships/me/preferred-roles` with body `{ "preferredRoleKeys": [...] }` — validate keys against `RoleKeys.ALL` (`EventRoleSlots.kt`); enforce `volunteer` present; session + CSRF.
  - [x] Default when unset/empty: all `RoleKeys.ALL` (V1 `getDefaultRolePreferences` parity) **or** document explicit product default in OpenAPI — pick one and test.

- [x] **Backend — member profile summary API (read model)** (AC: 1, 3–8, 12)
  - [x] `GET /v1/seasons/{seasonId}/member-profile/{userId}` (or `/v1/troupes/{troupeId}/seasons/{seasonId}/members/{userId}/profile`) returning:
    - `displayName`, `avatarUrl`, `userId`, `membershipId`, `isSelf`
    - `stats`: nullable object `{ availabilities, selections, declines }` each `{ count, percent, tooltip? }` — **null or zeros until Epic 5/6**
    - `monthlyChart`: `[]` until data exists
    - `favoriteRoleCounts`: `[]` until data exists
    - `preferredRoleKeys`: only when `isSelf` (or always readable for self; omit for others)
  - [x] Authorize: caller must be active member of season's troupe; target user must be active member of same troupe.
  - [x] **Do not** implement full stats aggregation in this story if Epics 5–6 tables are absent — return structured empty payload; add TODO/service stub interface for Story 3.6/5.x to fill.

- [x] **OpenAPI** (AC: 9, 12)
  - [x] Extend `services/api/openapi/seasons.yaml`: `MemberProfileSummary`, preferred-roles paths, error responses.

- [x] **Angular — shared role metadata** (AC: 8, 9)
  - [x] Add `apps/web/src/app/shared/event-roles/` (or extend existing util): `ROLE_KEYS`, labels (French), emojis — mirror `RoleKeys.ALL` + V1 `ROLE_EMOJIS` / `ROLE_LABELS_SINGULAR` from `legacy/src/services/storage.js`; single source for popover + future availability form (Story 5.2).

- [x] **Angular — `MemberProfileDialogComponent`** (AC: 1–11)
  - [x] Standalone `MatDialog` (panel class `member-profile-dialog` — compact max-width ~`28rem`–`36rem`, dark theme per UX-DR8).
  - [x] Inputs via `MAT_DIALOG_DATA`: `{ seasonId, troupeId, userId, seasonSlug }`.
  - [x] Load profile summary on open; `mat-spinner` while loading.
  - [x] Sections: header (`UserAvatarComponent` xl), stat cards (with `matTooltip` when data present), chart placeholder/component, aggregated role pills (when counts > 0), **preferred roles editor** (checkbox grid — self only), footer *Planning* + *Fermer*.
  - [x] Preferred roles: debounced or explicit *Enregistrer*; snack *« Préférences enregistrées »*; call PUT preferred-roles API.

- [x] **Angular — `MemberProfileService` + API client** (AC: 1, 9, 11)
  - [x] Methods: `getProfileSummary(seasonId, userId)`, `getPreferredRoles(troupeId)`, `updatePreferredRoles(troupeId, keys)`.
  - [x] `openProfileDialog(...)` helper wrapping `MatDialog.open`.

- [x] **Wire entry points (MVP)** (AC: 1, 3, 11)
  - [x] **Season header** — separate avatar click from user menu: e.g. `(click)` on `app-user-avatar` opens profile for **self**; menu button remains for account links (stop propagation on avatar).
  - [x] **Admin membres tab** — optional: avatar click opens profile for **that member** (read-only preferred roles).
  - [x] Extend `UserAvatarComponent` with optional `clickable` input + `avatarClick` output (pattern from V1 `PlayerAvatar.vue`).
  - [x] **Do not** wire every future surface (dispos grid, équipe slots) — document in Dev Notes for Epic 5/6 consumers.

- [x] **Planning navigation** (AC: 11)
  - [x] On *Planning*: `router.navigate(['/saison', seasonSlug], { queryParams: { participant: userId, view: 'agenda' } })`; in `season-home`, read query param and set toolbar participant when options exist.

- [x] **Tests** (AC: 1–13)
  - [x] API: `MemberProfileIntegrationTest` — preferred roles PUT/GET, invalid role key 400, non-member 403, volunteer enforced, profile summary 200 with empty stats.
  - [x] Web: `member-profile-dialog.spec.ts` — renders empty stats, saves preferred roles (self), hides editor for other member.
  - [x] Web: `season-header.spec.ts` — avatar click opens dialog.
  - [x] Run full API + web test suites and web build.

### Review Findings

- [x] [Review][Patch] AC10 is not implemented on `/compte` [`apps/web/src/app/pages/account-placeholder/account-placeholder.ts`:37] — Preferred roles are only loaded and edited in `MemberProfileDialog`; the account page still manages session, avatar, and troupe display names only, so reopening `/compte` cannot show or persist the same troupe-scoped preferred-role selection required by AC10.

## Dev Notes

### Scope boundaries

- **In scope:** Reusable member profile **MatDialog** (UX-DR8), troupe-scoped **preferred roles configuration** (FR46 storage + API — consumed by Story 5.2), identity display (FR9/FR10), **empty-state** stats/chart/aggregated role counts, MVP entry points (season header self + optional admin membres), Planning CTA navigation hook.
- **Out of scope:** Full stats/month-chart **aggregation** (requires Epics 5–6 + Story 3.6 formulas — return empty structure now, wire later); participant roster avatars on agenda rows (Story 3.8+); dispos/équipe grid avatar entry points; *Protégé* / managed-player badge (Epic 7 / participant stories); inline pseudo edit from popover (use `/compte` or admin tab); legacy Vue/Firestore `userPreferences` migration; account-level preferred roles (V1 stored by email — V2 is **troupe-scoped** on `troupe_memberships`).
- **Do not modify `legacy/`.**

### Critical dependency split (read carefully)

| Block | Data source today | Story 2.7 delivery |
|-------|-------------------|------------------|
| Identity (name, avatar) | `troupe_memberships` + `users.avatar_url` | **Real data** |
| Preferred roles config (FR46) | New column on membership | **Full persistence + UI** |
| Stat cards (dispo / sélection / désistement) | No dispos/casts in Postgres yet | **Empty state UI + API shape** |
| Month chart blocks | No dispos/casts | **Empty chart shell** |
| Aggregated *Rôles favoris* pills (counts) | Selection history | **Hidden/empty until Epic 6** |

Implement a **`MemberProfileStatsProvider`** interface (Kotlin) / `{ loadStats: … }` stub (TS) so Story 3.6 or 5.x can plug real aggregators without rewriting the dialog.

### Two different « rôles favoris » concepts (do not conflate)

| Concept | Purpose | UI in popover | Storage |
|---------|---------|---------------|---------|
| **Preferred roles (FR46)** | Pre-check roles in availability form (Story 5.2) | Checkbox grid — **self only** | `troupe_memberships.preferred_role_keys` |
| **Favorite roles (UX display)** | Season selection counts per role | Pill tags with `(count)` | Computed from casts — **later** |

V1 `PreferencesModal` = FR46 config. V1 `PlayerModal` pills = aggregated stats. Both appear in UX-DR8 popover.

### Product rules — preferred roles (locked, V1 parity)

| Rule | Value |
|------|--------|
| Scope | **Troupe-scoped** (per `troupe_memberships`, not `users`) |
| Valid keys | `RoleKeys.ALL` in `EventRoleSlots.kt` |
| Volunteer | **Always included** on save; checkbox disabled (V1 `canDisableRole`) |
| Default when never saved | All roles selected (V1 default) — document in API |
| Pre-selection consumer | Story **5.2** reads same API/field |

### Recommended API shapes

```http
GET /v1/seasons/{seasonId}/member-profile/{userId}
→ 200 {
  "userId", "membershipId", "displayName", "avatarUrl", "isSelf",
  "stats": null | { "availabilities": { "count", "percent" }, "selections": {...}, "declines": {...} },
  "monthlyChart": [ { "monthKey": "2025-09", "blocks": [ { "eventId", "status", "roleKey" } ] } ],
  "favoriteRoleCounts": [ { "roleKey", "count" } ],
  "preferredRoleKeys": ["player", "volunteer", ...]  // only when isSelf
}

PUT /v1/troupes/{troupeId}/memberships/me/preferred-roles
Content-Type: application/json
X-XSRF-TOKEN: …
{ "preferredRoleKeys": ["player", "mc", "volunteer"] }
→ 200 { "preferredRoleKeys": [...] }
```

Use **PUT** (replace set) for idempotent preferred-role updates.

### UI guidance (French copy)

- Dialog title: subject **display name** (no extra title bar text needed if name in header).
- Empty stats: *« Les statistiques de saison apparaîtront ici une fois les disponibilités et compositions renseignées. »*
- Chart heading: *« Ma saison en un clin d'œil »* (self) / *« Saison en un clin d'œil »* (other).
- Preferred roles heading: *« Mes rôles préférés »*; helper: *« Rôles pré-cochés par défaut lors de la saisie de disponibilité. »*
- Volunteer hint (tooltip): *« Le rôle bénévole est toujours pré-coché : si tu es disponible, tu peux toujours aider ! »*
- Buttons: *Planning*, *Enregistrer* (if explicit save), *Fermer*.
- Stat labels: *Disponibilités*, *Sélections*, *Désistements*.

Material: `mat-dialog`, `mat-chip-set` for pills, `mat-checkbox` grid, `matTooltip` on stat cards, colour tokens approximating V1 green/purple/red cards.

### Entry points — MVP vs future

| Surface | Story 2.7 | Later |
|---------|-----------|-------|
| Season header avatar (self) | **Yes** | — |
| Admin membres row avatar | **Recommended** | — |
| Agenda participant filter avatar | No | Story 3.3+ when filter lists members |
| Historique row avatar | No | Story 3.6 |
| Event dispos / équipe slots | No | Epic 5/6 |

### Architecture and guardrails

- REST `/v1`, camelCase JSON, snake_case DB, session cookie + CSRF on mutations. [Source: `_bmad-output/planning-artifacts/architecture.md#implementation-patterns--consistency-rules`]
- Reuse `UserAvatarComponent`, `TroupeContextService.currentUserDisplayLabel()`, `csrfHeaders()` from `hatcast-csrf.ts`.
- Reuse `RoleKeys` server-side — expose same keys to web shared module (do not invent parallel enum).
- Angular 21 standalone components, signals, Material — match `season-header` / `google-avatar-prompt-dialog` patterns.
- Avatar authorization for other users: same troupe membership check as `GET /v1/users/{id}/avatar` (Story 2.6).

### Current system snapshot

| Area | Today | Gap for 2.7 |
|------|--------|-------------|
| DB | `troupe_memberships` has display_name, baseline_role — **no preferred roles** | Migration V13 |
| API | No profile summary or preferred-roles endpoints | New controller methods |
| Dispos/casts | **Not in V2 API** | Stats stub / empty |
| Web | `UserAvatarComponent` not clickable; header opens **menu** only | Dialog + avatar click |
| Season toolbar | Participant filter MVP = *Tous* only | Planning CTA + query param hook |

### V1 reference (behaviour only)

| V1 artifact | Reuse |
|-------------|--------|
| `legacy/src/components/PlayerModal.vue` | Layout: 3 stat cards, month chart, favorite pills, Planning/Fermer |
| `legacy/src/components/PreferencesModal.vue` | Preferred-role checkbox grid + volunteer rule |
| `legacy/src/services/rolePreferencesService.js` | Validation semantics (troupe scope differs — V2 on membership) |
| `legacy/src/components/GridBoard.vue` `getFavoriteRoles` | Aggregated counts logic — port when casts exist |

V1 opens **full-screen modal** (`z-[1050]`); V2 may use centered `MatDialog` with similar density — UX allows *overlay / dialog*.

### Previous story intelligence

- **Story 2.6 (done):** `UserAvatarComponent`, `avatarUrl` on session + admin members — use for popover header; do not duplicate avatar fetch logic. [Source: `2-6-avatar-et-option-image-de-profil-google.md`]
- **Story 2.5 (done):** Troupe `displayName` via `TroupeContextService` — popover must show **membership** name, not account `displayName`. [Source: `2-5-pseudo-affiche-par-troupe.md`]
- **Story 2.6 explicitly deferred popover** — this story owns UX-DR8 shell + FR46 config.
- **Story 3.6 (ready-for-dev):** Will own history stats formulas — coordinate `MemberProfileStatsProvider` when implementing; do not duplicate `calculatePlayerRoleStats` in 2.7.
- **Story 3.3 (done):** Season shell + agenda/history toggle — Planning CTA targets agenda route under same slug.

### Git intelligence

Recent Epic 2 commits to preserve:

- `1ec8864 feat(avatar): Add profile photo upload and Google import` — avatar URLs and `UserAvatarComponent`; extend with `clickable` input.
- `2a69ed2 feat(troupe): Add self-service display name` — troupe-scoped labels in headers.
- `c2f6ba7 feat(web): Add multi-troupe context switching` — preferred roles must be per troupe membership.

### Testing commands

- API: `cd services/api && ./gradlew test`
- Focused: `./gradlew test --tests '*MemberProfile*'`
- Web: `npm run test -w @hatcast/web -- --watch=false`
- Build: `npm run build -w @hatcast/web`

### References

- [Source: `_bmad-output/planning-artifacts/epics.md#story-27--popover-profil-membre-stats-saison-grille-mensuelle-roles-favoris`]
- [Source: `_bmad-output/planning-artifacts/prd.md` FR46, FR9, FR10, NFR-S2]
- [Source: `_bmad-output/planning-artifacts/ux-design-hatcast-v2.md#pattern-member-profile`]
- [Source: `_bmad-output/planning-artifacts/architecture.md#implementation-patterns--consistency-rules`]
- [Source: `_bmad-output/planning-artifacts/implementation-readiness-report-2026-05-23.md` — Story 2.7 data-dependency caution]
- [Source: `DOMAIN.md` § Statistiques de composition]
- [Source: `services/api/src/main/kotlin/com/hatcast/api/event/EventRoleSlots.kt` — `RoleKeys`]
- [Source: `services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeMembershipEntity.kt`]
- [Source: `apps/web/src/app/shared/user-avatar/user-avatar.ts`]
- [Source: `apps/web/src/app/pages/season-home/season-header.html`]
- [Source: `apps/web/src/app/pages/season-home/season-view-toolbar.ts`]
- [Source: `apps/web/src/app/pages/login/google-avatar-prompt-dialog.ts` — MatDialog pattern]
- [Source: `legacy/src/components/PlayerModal.vue`]
- [Source: `legacy/src/components/PreferencesModal.vue`]
- [Source: `legacy/src/services/rolePreferencesService.js`]
- [Source: `_bmad-output/implementation-artifacts/2-6-avatar-et-option-image-de-profil-google.md`]
- [Source: `_bmad-output/implementation-artifacts/3-6-vue-historique-colonnes-roles-mois-export-masquage.md`]

## Dev Agent Record

### Agent Model Used

Composer (Cursor)

### Debug Log References

- H2 test schema: `preferred_role_keys` stored as TEXT (same pattern as `role_slots`) for Flyway/Hibernate validate compatibility.

### Completion Notes List

- Backend: V13 migration, `MemberProfileController` + `MemberProfileService`, `PreferredRoleKeys` validation, `MemberProfileStatsProvider` stub for future stats.
- API: GET profile summary with empty stats/chart; GET/PUT preferred roles with volunteer enforcement and V1 default (all roles when unset).
- Web: `MemberProfileDialog` (UX-DR8 shell), avatar click on season header (self) and admin membres (read-only other), query param hook for Planning CTA.
- Tests: 8 API integration tests, 4 dialog tests, season-header avatar test; `./gradlew test`, `npm run test -w @hatcast/web`, `npm run build -w @hatcast/web` all green.

### File List

- services/api/src/main/resources/db/migration/V13__membership_preferred_roles.sql
- services/api/src/main/kotlin/com/hatcast/api/troupe/PreferredRoleKeys.kt
- services/api/src/main/kotlin/com/hatcast/api/troupe/PreferredRoleKeysJsonConverter.kt
- services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeMembershipEntity.kt
- services/api/src/main/kotlin/com/hatcast/api/memberprofile/MemberProfileController.kt
- services/api/src/main/kotlin/com/hatcast/api/memberprofile/MemberProfileService.kt
- services/api/src/main/kotlin/com/hatcast/api/memberprofile/MemberProfileStatsProvider.kt
- services/api/src/main/kotlin/com/hatcast/api/memberprofile/StubMemberProfileStatsProvider.kt
- services/api/src/main/kotlin/com/hatcast/api/memberprofile/dto/MemberProfileDtos.kt
- services/api/src/test/kotlin/com/hatcast/api/memberprofile/MemberProfileIntegrationTest.kt
- services/api/openapi/seasons.yaml
- apps/web/src/app/shared/event-roles/event-roles.ts
- apps/web/src/app/core/member-profile/member-profile-api.service.ts
- apps/web/src/app/core/member-profile/member-profile.service.ts
- apps/web/src/app/shared/member-profile/member-profile-dialog.ts
- apps/web/src/app/shared/member-profile/member-profile-dialog.html
- apps/web/src/app/shared/member-profile/member-profile-dialog.scss
- apps/web/src/app/shared/member-profile/member-profile-dialog.spec.ts
- apps/web/src/app/shared/user-avatar/user-avatar.ts
- apps/web/src/app/shared/user-avatar/user-avatar.html
- apps/web/src/app/shared/user-avatar/user-avatar.scss
- apps/web/src/app/pages/season-home/season-header.ts
- apps/web/src/app/pages/season-home/season-header.html
- apps/web/src/app/pages/season-home/season-header.spec.ts
- apps/web/src/app/pages/season-home/season-home.ts
- apps/web/src/app/pages/season-home/season-home.html
- apps/web/src/app/pages/season-home/season-home.spec.ts
- apps/web/src/app/pages/admin-membres/membres-tab.ts
- apps/web/src/app/pages/admin-membres/membres-tab.html
- apps/web/src/app/pages/admin-membres/membres-tab.spec.ts
- apps/web/src/app/pages/admin-membres/admin-membres.html
- apps/web/src/app/pages/account-placeholder/account-placeholder.ts
- apps/web/src/app/pages/account-placeholder/account-placeholder.html
- apps/web/src/app/pages/account-placeholder/account-placeholder.scss
- apps/web/src/app/pages/account-placeholder/account-placeholder.spec.ts

### Change Log

- 2026-05-23 — Story 2.7 created: member profile popover (UX-DR8), troupe-scoped preferred roles (FR46), empty-state stats/chart until Epics 5–6.
- 2026-05-23 — Story 2.7 implemented: API + dialog + entry points + tests; status → review.
