# Story 3.7 : Suppression de saisons (admin troupe ou admin plateforme)

Status: done

<!-- Ultimate context engine analysis completed — comprehensive developer guide created -->

## Story

As a **troupe administrator** or **platform administrator**,  
I want to **permanently delete** a season (with explicit confirmation and safeguards),  
so that I can **clean up data-entry mistakes or test seasons** without being limited to archiving (**FR11** extension).

## Acceptance Criteria

### Authorization (NFR-S2)

1. **Given** an authenticated user who is **`TROUPE_ADMIN`** on the season’s troupe, **when** they call `DELETE /v1/seasons/{seasonId}` or confirm deletion in the UI, **then** the season is removed — **FR11**, **NFR-S2**.
2. **Given** an authenticated **platform administrator** (email in configured super-admin list), **when** they delete a season **even without troupe admin role**, **then** the API allows deletion — aligned with [ADR-0005](../../docs/adr/0005-permission-model-super-admin-season.md) and [requirements-season-delete.md](./requirements-season-delete.md).
3. **Given** a user who is an active **member only** (`MEMBER`) or not a member (and not platform admin), **when** they attempt deletion, **then** the API returns **403** and the UI does not show the delete action.
4. **Given** an unknown `seasonId`, **when** `DELETE` is invoked, **then** the API returns **404** (no existence leak beyond current list/read patterns).

### Deletion semantics (product decisions — closes open items in requirements doc)

5. **Given** a confirmed delete, **when** the server processes it, **then** the season row is **hard-deleted** and all dependent data is removed via existing Postgres **`ON DELETE CASCADE`** FKs (events → availability, organizers, participants, etc.) — **V1 parity** with [`deleteSeasonDirect`](../../legacy/src/services/seasons.js) / [`performSeasonDeletion`](../../legacy/src/services/seasons.js).
6. **Given** a season with **`eventCount > 0`** or **`participantCount > 0`**, **when** an authorized user confirms deletion, **then** deletion **still proceeds** after explicit confirmation (no “empty only” gate) — counts are **warnings** in the dialog, not blockers.
7. **Given** a season with **`active === true`**, **when** deletion is confirmed, **then** it is allowed (no forced deactivation first) — dialog shows an **extra warning** that the season is currently active.
8. **Given** a successful delete, **when** the same `seasonId` is deleted again, **then** the API returns **404** (document in OpenAPI).
9. **Given** a successful delete, **when** the server completes, **then** it emits a structured **INFO** log: actor `userId`, `seasonId`, `troupeId`, title, `eventCount`, `participantCount`, timestamp — **minimum audit** until Epic 9 (FR35).

### UI (`/seasons`, UX-DR1 kebab menu)

10. **Given** a user with **`canDeleteSeason`** (troupe admin **or** platform admin per `GET /v1/auth/me`), **when** they open the season card **⋮** menu on [`/seasons`](../../apps/web/src/app/pages/seasons-list/seasons-list.html), **then** a **« Supprimer »** entry appears (destructive styling — red/warn).
11. **Given** the delete action, **when** the user opens the confirmation dialog, **then** it shows: season **title**, optional **dates**, **slug**, **`eventCount` / `participantCount`**, explicit **irreversibility** text listing cascade scope (événements, disponibilités, participants, organisateurs), **Annuler** / **Supprimer définitivement** — reuse or extend [`ConfirmDialog`](../../apps/web/src/app/pages/seasons-list/confirm-dialog.ts).
12. **Given** confirmed deletion, **when** the API returns success, **then** the season **disappears from the list** without full page reload (reload current page via existing `loadTroupeAndSeasons`) and a snackbar confirms success.
13. **Given** the user was viewing the deleted season elsewhere (edge case), **when** they navigate back to `/seasons`, **then** the season is absent — no orphan route fix required in this story beyond list refresh.

### Out of scope

| Item | Deferred to |
|------|-------------|
| Full audit trail table / UI (FR35) | Epic 9 |
| Season logo / object storage cleanup | N/A in V2 (no season logo yet) |
| PIN / typed confirmation (V1 admin PIN) | Not in V2 MVP |
| Bulk delete | — |
| Soft-delete / tombstone seasons | Archiving remains story **3.1** |

## Context and dependencies

| Prerequisite | Role |
|--------------|------|
| **Story 3.1 (done)** | Season CRUD, list UI, archive/activate, `SeasonApiService`, OpenAPI fragment |
| **Story 2.2 (done)** | `TROUPE_ADMIN` via `TroupeAccessService.requireCanManageTroupe` |
| **Stories 3.2–3.8 (done)** | Events, participants, organizers, availability — all cascade on season delete |
| [requirements-season-delete.md](./requirements-season-delete.md) | Authoritative product cadrage; open questions **closed** in this story (§ AC 5–7) |

**Distinct from archiving:** Archiving (`POST …/actions/archive`) keeps data and sets `archived=true`. Delete is **irreversible** and removes the row.

## Tasks / Subtasks

- [x] **Scope:** `apps/web/` + `services/api/` ; **do not modify** `legacy/` (behavioral reference only).
- [x] **Platform admin service (new):**
  - Config: `hatcast.auth.super-admin-emails` in [`application.yml`](../../services/api/src/main/resources/application.yml) — comma-separated, env `HATCAST_SUPER_ADMIN_EMAILS` (empty default = none).
  - `PlatformAdminService.isPlatformAdmin(principal)` — compare normalized session user email to list (trim, lowercase) — V1 parity [`ADMIN_SETUP.md`](../../docs/v1/technical/ADMIN_SETUP.md).
  - Extend `GET /v1/auth/me` response with `platformAdmin: boolean` (self only) for Angular gating.
- [x] **Authorization helper:**
  - `SeasonAccessService.requireCanDeleteSeason(principal, season)` **or** method on `TroupeAccessService`:
    - allow if `PlatformAdminService.isPlatformAdmin(principal)` **OR** `membershipService.isTroupeAdmin(userId, season.troupe.id)`.
    - **Do not** require active membership for platform admin on delete (ops/support path).
- [x] **API:**
  - `SeasonService.delete(seasonId, principal)` — load season, authorize, log, `seasonRepository.deleteById`.
  - `DELETE /v1/seasons/{seasonId}` on [`SeasonController`](../../services/api/src/main/kotlin/com/hatcast/api/season/SeasonController.kt) → **204 No Content**.
  - CSRF on mutation (`SecurityMockMvcRequestPostProcessors.csrf()` in tests).
  - [`SecurityConfig`](../../services/api/src/main/kotlin/com/hatcast/api/config/SecurityConfig.kt) already permits `/v1/seasons/**` — verify DELETE is not blocked.
- [x] **OpenAPI:** add `delete` on `/seasons/{seasonId}` in [`openapi/seasons.yaml`](../../services/api/openapi/seasons.yaml) — responses 204, 403, 404 ; document idempotence (second call → 404).
- [x] **Angular:**
  - `SeasonApiService.deleteSeason(seasonId)` — `DELETE` + `csrfHeaders()`, expect 204.
  - [`seasons-list.ts`](../../apps/web/src/app/pages/seasons-list/seasons-list.ts): load `platformAdmin` from auth/me (or troupe context); `canDeleteSeason = canManageSeasons() || platformAdmin`.
  - Kebab menu: **Supprimer** with `mat-menu-item` warn class; `confirmDelete(season)` → dialog with counts + active warning.
  - Optional: extend `ConfirmDialogData` with `destructive?: boolean` and `confirmColor: 'warn'` for delete flows.
  - Spec: menu visibility for admin vs member; delete calls API and refreshes list.
- [x] **Tests (API integration):**
  - Troupe admin deletes season → 204; GET season → 404; events for season gone.
  - Member (non-admin) → 403.
  - Platform admin (config email) deletes without troupe admin → 204.
  - Second DELETE → 404.
  - Cascade: create season + event + availability row → delete season → verify `events` and `event_availability` empty for that season.
- [x] **Tests (web):** unit test `SeasonApiService.deleteSeason`; component test delete flow mocked.
- [x] **Docs (minimal):** note in [`requirements-season-delete.md`](./requirements-season-delete.md) header that story 3.7 implements it — optional one-line status update only if dev touches that file.

### Review Findings

- [x] [Review][Patch] Log d’audit émis avant confirmation de suppression [`services/api/src/main/kotlin/com/hatcast/api/season/SeasonService.kt:236`] — AC9 dit que le log INFO est émis quand le serveur complète la suppression ; aujourd’hui `Season deleted` est journalisé avant `seasonRepository.deleteById`, donc un rollback/échec DB peut laisser un audit mensonger.
- [x] [Review][Patch] Compteurs absents quand une saison est vide [`apps/web/src/app/pages/seasons-list/seasons-list.ts:298`] — AC11 demande d’afficher `eventCount` / `participantCount` dans le dialogue ; le message les masque quand les deux valent zéro.
- [x] [Review][Patch] Changement de statut 5-2 hors périmètre [`_bmad-output/implementation-artifacts/sprint-status.yaml:84`] — la revue 3.7 modifie aussi `5-2-disponibilite-par-role-lorsque-le-type-devenement-lexige`, ce qui mélange l’état d’une autre story avec cette livraison.
- [x] [Review][Patch] Recharge de page potentiellement vide après suppression [`apps/web/src/app/pages/seasons-list/seasons-list.ts:323`] — supprimer le dernier élément d’une page paginée recharge le même `pageIndex`, qui peut devenir hors bornes au lieu de revenir à la page précédente.
- [x] [Review][Patch] Le client accepte tout 2xx comme suppression réussie [`apps/web/src/app/core/seasons/season-api.service.ts:198`] — la story attend un DELETE `204 No Content`; un `200`/`202` serait annoncé comme succès malgré un contrat API non respecté.

## Dev Notes

### Cascade graph (Postgres — rely on DB, no manual deletes)

Deleting `seasons.id` cascades through:

| Child | Migration | FK |
|-------|-----------|-----|
| `events` | V5 | `ON DELETE CASCADE` |
| `season_organizers` | V8 | CASCADE |
| `season_participants` | V14 | CASCADE |
| `event_organizers` | V8 | via `events` CASCADE |
| `event_participants` | V14 | via `events` CASCADE |
| `event_availability` | V15 | via `events` CASCADE |

**Do not** hand-delete child tables in service code unless a future FK lacks CASCADE (none today).

### V1 reference (legacy — do not port code)

| Behavior | Reference |
|----------|-----------|
| Confirmation copy | [`SeasonDeleteConfirmationModal.vue`](../../legacy/src/components/SeasonDeleteConfirmationModal.vue), [`requestDeletionConfirmation`](../../legacy/src/services/seasons.js) |
| Admin-only delete UI | [`SeasonsPage.vue`](../../legacy/src/views/SeasonsPage.vue) kebab « Supprimer » (red) |
| Super admin | [`permissionService.isSuperAdmin()`](../../legacy/src/services/permissionService.js), ADR-0005 |

V1 lists removed items: events, availabilities, players, logo. V2 dialog should mention **événements, disponibilités, participants, délégations organisateur** (French product copy).

### Existing V2 blocks (extend — do not duplicate)

| Sujet | Emplacement |
|--------|-------------|
| Season service/controller | [`SeasonService.kt`](../../services/api/src/main/kotlin/com/hatcast/api/season/SeasonService.kt), [`SeasonController.kt`](../../services/api/src/main/kotlin/com/hatcast/api/season/SeasonController.kt) |
| Troupe admin checks | [`TroupeAccessService.kt`](../../services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeAccessService.kt), [`TroupeMembershipService`](../../services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeMembershipService.kt) |
| List UI + confirm pattern | [`seasons-list.ts`](../../apps/web/src/app/pages/seasons-list/seasons-list.ts), [`confirm-dialog.ts`](../../apps/web/src/app/pages/seasons-list/confirm-dialog.ts) |
| CSRF client | [`hatcast-csrf.ts`](../../apps/web/src/app/core/http/hatcast-csrf.ts) |
| Integration test pattern | [`SeasonControllerIntegrationTest.kt`](../../services/api/src/test/kotlin/com/hatcast/api/season/SeasonControllerIntegrationTest.kt) — promote admin via `promoteSeedMemberToAdmin` |
| DELETE precedent | [`ParticipantController`](../../services/api/src/main/kotlin/com/hatcast/api/participant/ParticipantController.kt) — 204, CSRF |

### Platform admin in tests

In `@ActiveProfiles("test")`, set `hatcast.auth.super-admin-emails` in [`application-test.yml`](../../services/api/src/test/resources/application-test.yml) to a known test user email; create session cookie for that user **without** promoting to `TROUPE_ADMIN` to prove platform-only path.

### UI gating matrix

| Role | Sees delete in ⋮ menu | API DELETE |
|------|----------------------|------------|
| `MEMBER` | No | 403 |
| `TROUPE_ADMIN` | Yes | 204 |
| Platform admin + `MEMBER` (not troupe admin) | Yes | 204 |
| Platform admin, no troupe membership | No (not on list) | 204 (API-only ops) |
| Unauthenticated | No | 401 |

### DOMAIN alignment

- **Single active season:** Deleting the active season leaves the troupe with **zero** active seasons — allowed (DOMAIN requires **at most one** active, not **at least one**).
- **Archiving vs delete:** Keep both; delete is for irreversible cleanup (test seasons, mistakes).

### Error UX (Angular)

Map API status to snackbars (French, consistent with existing list):

| Status | Message |
|--------|---------|
| 204 | « Saison supprimée. » |
| 403 | « Vous ne pouvez pas supprimer cette saison. » |
| 404 | « Saison introuvable. » (refresh list) |
| 0 / network | « Suppression impossible. » |

### Intelligence from prior stories

- **3.1:** Kebab menu pattern, `ConfirmDialog`, pagination refresh after mutation — mirror `confirmArchive` / `runArchive`.
- **3.5:** Super-admin config stub was anticipated (`hatcast.auth.super-admin-emails`) — **implement now** for this story.
- **3.8:** Participant soft-delete is separate; season hard-delete removes participant rows via CASCADE (acceptable for season-scoped roster data).
- **5.1 (in review):** `event_availability` cascades via events — deleting a season cleans availability data.

### Git / recent patterns

Recent epic-3 work (`feat(participants)`, `feat(member-profile)`) follows: Kotlin service + controller + Flyway only when needed + Angular core service + page wiring + integration tests. **No migration required** for this story.

### Architecture guardrails

- Monorepo: [ARCH.md](../../ARCH.md) ; REST/OpenAPI: [architecture.md](../planning-artifacts/architecture.md).
- Auth session: [ADR-0010](../../docs/adr/0010-v2-auth-identity-platform.md) — mutations use cookie + CSRF.
- UI: [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md) — Material dialogs, French copy.
- UX seasons list: [ux-design — `/seasons`](../planning-artifacts/ux-design-hatcast-v2.md#screen-seasons-list-seasons) — ⋮ menu for edit/archive; add delete as destructive secondary action.

## Dev Agent Record

### Agent Model Used

Composer (Cursor)

### Debug Log References

_(none)_

### Completion Notes List

- `PlatformAdminService` + config `hatcast.auth.super-admin-emails` ; `platformAdmin` exposé sur `GET /v1/auth/me` et réponses session.
- `SeasonAccessService.requireCanDeleteSeason` : admin troupe ou admin plateforme.
- `DELETE /v1/seasons/{seasonId}` → 204, log INFO structuré, cascade Postgres.
- UI `/seasons` : entrée « Supprimer » (warn), dialog de confirmation détaillée, snackbars FR.
- Tests : `./gradlew test` OK ; `ng test` (season-api + seasons-list specs) OK.

### File List

- services/api/src/main/kotlin/com/hatcast/api/auth/PlatformAdminService.kt
- services/api/src/main/kotlin/com/hatcast/api/auth/AuthController.kt
- services/api/src/main/kotlin/com/hatcast/api/auth/dto/AuthDtos.kt
- services/api/src/main/kotlin/com/hatcast/api/avatar/ProfileAvatarController.kt
- services/api/src/main/kotlin/com/hatcast/api/season/SeasonAccessService.kt
- services/api/src/main/kotlin/com/hatcast/api/season/SeasonService.kt
- services/api/src/main/kotlin/com/hatcast/api/season/SeasonController.kt
- services/api/src/main/resources/application.yml
- services/api/src/test/resources/application-test.yml
- services/api/src/test/kotlin/com/hatcast/api/auth/PlatformAdminServiceTest.kt
- services/api/src/test/kotlin/com/hatcast/api/season/SeasonDeleteIntegrationTest.kt
- services/api/src/test/kotlin/com/hatcast/api/season/SeasonServiceUpdateTest.kt
- services/api/openapi/seasons.yaml
- services/api/openapi/auth.yaml
- apps/web/src/app/core/auth/auth-api.service.ts
- apps/web/src/app/core/seasons/season-api.service.ts
- apps/web/src/app/core/seasons/season-api.service.spec.ts
- apps/web/src/app/pages/seasons-list/seasons-list.ts
- apps/web/src/app/pages/seasons-list/seasons-list.html
- apps/web/src/app/pages/seasons-list/seasons-list.scss
- apps/web/src/app/pages/seasons-list/seasons-list.spec.ts
- apps/web/src/app/pages/seasons-list/confirm-dialog.ts
- _bmad-output/implementation-artifacts/requirements-season-delete.md

### Change Log

- 2026-05-24: Story created — closes open product questions from `requirements-season-delete.md`; cascade hard-delete aligned with V1 and Postgres FKs; platform admin via config email list.
- 2026-05-24: Implementation complete — DELETE API, platform admin, UI confirmation, integration and unit tests.

---

### Validation create-story — 2026-05-24

Derived from epics 3.7, `requirements-season-delete.md`, implementation-readiness report (sensitive destructive extension of FR11), story 3.1 completion notes, and current schema V3–V15. Platform admin service is net-new in V2 API (was stub-only in story 3.5).
