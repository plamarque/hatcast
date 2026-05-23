# Story 2.2: Member Administration and Baseline Roles

Status: done

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

## Story

As a **troupe administrator**,
I want to **manage troupe members and their baseline troupe roles**,
so that I can control who has member access and who may administer the troupe without relying on the temporary seed-troupe shortcut.

## Acceptance Criteria

1. **Given** an authenticated user with baseline role `TROUPE_ADMIN` for a troupe, **when** they open the Members admin surface, **then** they can see the troupe member list with display name, email when available, membership status, baseline role, and timestamps needed for administration; the list is paged or otherwise bounded and exposed only to troupe admins. [Source: `_bmad-output/planning-artifacts/epics.md#story-22--administration-des-membres-et-roles-de-base`; Source: `_bmad-output/planning-artifacts/prd.md#security--privacy`]
2. **Given** a troupe admin and an email belonging to an existing `users` row, **when** the admin adds that user to the troupe, **then** an active `troupe_memberships` row exists for `(troupeId, userId)` with a troupe-scoped display name and baseline role defaulting to `MEMBER` unless another authorized value is submitted. Duplicate add/reactivate requests are idempotent. [Source: `_bmad-output/implementation-artifacts/2-1-adhesion-a-une-troupe-et-profil-membre-minimal.md#api-shape-guidance`]
3. **Given** a troupe admin edits a member, **when** they change the member display name, status, or baseline role, **then** the API persists the change, returns a camelCase DTO, updates `updated_at`, and the Angular UI reflects the saved value without requiring a full page reload. [Source: `_bmad-output/planning-artifacts/architecture.md#format-patterns`]
4. **Given** a troupe admin removes a member, **when** the action is confirmed, **then** the membership is soft-deactivated (`status = INACTIVE`) rather than hard-deleted; member read access to that troupe is revoked and related admin UI hides troupe-scoped actions on the next permission refresh. [Source: `AGENTS.md#quality-and-safety-rules-repo-relevant`; Source: `_bmad-output/planning-artifacts/prd.md#troupe--membership`]
5. **Given** a role-management mutation would leave a troupe with no active `TROUPE_ADMIN`, **when** the admin demotes, deactivates, or removes the last admin, **then** the API rejects the change with a coherent 400/409 Problem Details response and the UI shows a clear French error. [Source: `_bmad-output/planning-artifacts/implementation-readiness-report-2026-05-23-story-2-2.md#critical-issues-requiring-immediate-action`]
6. **Given** a member without `TROUPE_ADMIN` tries to list, add, remove, or update troupe members, **when** the API request is made or the UI is rendered, **then** the server returns 403 and the Angular UI does not expose member-admin, season-create, event-create/edit/archive, or settings affordances for that user. Hiding UI is not the security boundary. [Source: `_bmad-output/planning-artifacts/implementation-readiness-report-2026-05-23-story-2-2.md#code-readiness-snapshot`; Source: `_bmad-output/implementation-artifacts/2-1-adhesion-a-une-troupe-et-profil-membre-minimal.md#review-findings`]
7. **Given** existing Story 3.5 organizer delegation is installed, **when** Story 2.2 lands, **then** `OrganizerAccessService` and season/event write paths use real troupe-admin membership instead of the provisional seed-troupe manager rule, while season organizers and event organizers keep their narrower delegated powers. [Source: `_bmad-output/implementation-artifacts/3-5-delegation-des-organisateurs-perimetre-saison-evenement.md#permission-matrix-composition--edit`]
8. **Given** API contracts change, **when** the story is complete, **then** `services/api/openapi/seasons.yaml` documents member-admin schemas/endpoints, baseline role enum, CSRF requirements for mutations, 400/403/404/409 responses, and the temporary direct demo-join limitation. [Source: `_bmad-output/planning-artifacts/architecture.md#enforcement-guidelines`]
9. **Given** Story 2.3 will add CSV import/export, **when** this story implements the Members admin surface, **then** it provides a clear extension point for CSV actions but does not implement CSV import/export behaviour in this story. [Source: `_bmad-output/implementation-artifacts/2-3-import-export-csv-des-membres-de-troupe.md#dependencies`]

## Tasks / Subtasks

- [x] **Backend data model and migration** (AC: 1, 2, 3, 4, 5, 7)
  - [x] Add Flyway migration `V10__troupe_membership_baseline_roles.sql` under `services/api/src/main/resources/db/migration/`.
  - [x] Add `baseline_role VARCHAR(32) NOT NULL DEFAULT 'MEMBER'` to `troupe_memberships`; supported values for this story are exactly `MEMBER` and `TROUPE_ADMIN`.
  - [x] Keep `status` as the membership lifecycle field (`ACTIVE`, `INACTIVE`); do not introduce invitation status in this story unless already required by a narrow add-member flow.
  - [x] Backfill existing active seed-troupe memberships according to the compatibility decision in this story: preserve current demonstrability by marking existing active seed memberships as `TROUPE_ADMIN`, but make new direct demo joins `MEMBER` only.
  - [x] Add an index that supports admin listing and role checks, e.g. `(troupe_id, status, baseline_role)` plus any query-specific index used by the implementation.
  - [x] Update `TroupeMembershipEntity`, enum classes, DTOs, repositories, and test fixtures to include the baseline role.

- [x] **Backend role and access services** (AC: 4, 5, 6, 7)
  - [x] Replace provisional write access in `TroupeAccessService.requireCanManageTroupe` with a real `requireTroupeAdmin` / `requireCanManageTroupe` check based on active membership + `baselineRole == TROUPE_ADMIN`.
  - [x] Keep `requireActiveMember` for member read access; do not conflate read membership with write/admin permissions.
  - [x] Ensure `isProvisionalTroupeAdmin` is removed or reduced to a migration/demo-only helper that is not used by season/event/organizer mutations after this story.
  - [x] Update `SeasonService`, `EventService`, and `OrganizerAccessService` callers so season/event CRUD and organizer-management operations require real troupe admin where the matrix says "season admin / troupe admin".
  - [x] Implement and test a guard that prevents deactivating, deleting, or demoting the last active `TROUPE_ADMIN` in a troupe.
  - [x] Keep organizer delegation semantics intact: `season_organizers` may manage composition, `event_organizers` may manage their event/composition, but neither becomes troupe admin.

- [x] **Backend member-admin API** (AC: 1, 2, 3, 4, 5, 6, 8)
  - [x] Add admin-gated endpoints under `com.hatcast.api.troupe`; recommended contract:
    - `GET /v1/troupes/{troupeId}/members?page=&size=` -> paged members.
    - `POST /v1/troupes/{troupeId}/members` with `{ email, displayName?, baselineRole? }` -> create/reactivate membership for an existing user.
    - `PATCH /v1/troupes/{troupeId}/members/{membershipId}` with optional `{ displayName, status, baselineRole }` -> update supported fields.
    - `DELETE /v1/troupes/{troupeId}/members/{membershipId}` -> soft-deactivate membership, or use PATCH if the team chooses not to expose DELETE for soft delete.
  - [x] Resolve users by normalized email (`trim().lowercase()`) with `UserRepository.findFirstByEmailIgnoreCase`.
  - [x] For unknown email, return 404 or 400 Problem Details with copy equivalent to "user must sign in once before being added"; do not invent invitation lifecycle in this story.
  - [x] Return stable DTOs only; do not serialize JPA entities directly.
  - [x] Apply CSRF to all member mutations and keep cookie-auth behaviour aligned with existing Angular `fetch(..., { credentials: 'include' })` clients.
  - [x] Normalize validation and authorization failures to the repository's Problem Details / coherent error policy; never return 200 for failed validation.

- [x] **OpenAPI and documentation updates** (AC: 7, 8, 9)
  - [x] Extend `services/api/openapi/seasons.yaml` with member-admin paths, schemas, enum values, request examples, and error responses.
  - [x] Remove or update wording in OpenAPI that says seed-troupe members can manage seasons/events until Story 2.2.
  - [x] Update `DOMAIN.md` to document V2 baseline troupe roles (`MEMBER`, `TROUPE_ADMIN`) and their relationship to season/event organizers.
  - [x] Update `ARCH.md` or `architecture.md` only if implementation makes an existing architecture statement misleading.
  - [x] Mention Story 2.3 CSV extension point without documenting CSV import/export as implemented.

- [x] **Angular member-admin UI** (AC: 1, 2, 3, 4, 6, 9)
  - [x] Add or extend a `TroupeApiService` member-admin client in `apps/web/src/app/core/troupes/`, preserving credentials + CSRF patterns from existing services.
  - [x] Add a Material-first Members admin surface reachable from the season settings/admin path. A dialog is acceptable if it stays maintainable; a route such as `/saison/:slug/admin/members` is preferable if the surface grows.
  - [x] UI copy is French. Use explicit labels such as `Membres`, `Administrateur·ice de troupe`, `Membre`, `Ajouter un membre`, `Désactiver`, and `Rôle de base`.
  - [x] Allow admins to list, add by email, edit baseline role/display name, and deactivate/reactivate memberships with confirmation for destructive-looking actions.
  - [x] Add a reserved section or clean extension point for "Importer / exporter CSV" for Story 2.3, without wiring fake CSV behaviour.
  - [x] Hide or disable admin chrome for non-admin members:
    - `/seasons` "Nouvelle saison" CTA and season card kebab actions.
    - Season agenda "Nouveau spectacle", event edit/archive menu, and season settings actions.
    - Event organizer sections/dialogs that require troupe admin.
  - [x] Refresh permissions after membership or role mutation so UI state reflects demotion/deactivation without stale affordances.

- [x] **Regression alignment with organizer delegation** (AC: 6, 7)
  - [x] Update `MySeasonPermissionsDto` or equivalent permission endpoint so Angular can gate member-admin and organizer-admin affordances without N+1 calls.
  - [x] Retest Story 3.5 product acceptance: adding season/event organizers should work once the target email belongs to an existing user/member as required by this story's member-admin flow.
  - [x] Ensure event organizers still cannot manage other organizers unless they are also `TROUPE_ADMIN`.
  - [x] Ensure season organizers still cannot create events or perform manual slot fill if Story 3.5 intentionally excludes that power.

- [x] **Tests** (AC: 1-9)
  - [x] API integration tests: admin can list members, add existing user, reactivate inactive membership, update display name, update baseline role, deactivate member, and cannot remove/demote last active admin.
  - [x] API integration tests: non-admin active member receives 403 on member-admin endpoints and on season/event write endpoints that previously used the provisional seed rule.
  - [x] API unit/service tests: baseline role checks, last-admin guard, email normalization, idempotent duplicate add/reactivate.
  - [x] Organizer regression tests: `OrganizerAccessService` matrix after replacing provisional admin with real `TROUPE_ADMIN`.
  - [x] Angular service tests: request URLs, credentials, CSRF headers on POST/PATCH/DELETE, DTO mapping and error paths.
  - [x] Angular component tests: member list rendering, add/edit/deactivate flows, last-admin error copy, and hidden admin actions for non-admin users.
  - [x] Run focused tests first, then full commands before moving implementation to review:
    - `cd services/api && ./gradlew test`
    - `npm run test -w @hatcast/web`
    - `npm run build -w @hatcast/web`

## Dev Notes

### Current System Snapshot

- Story 2.1 is complete and created `troupe_memberships` with `id`, `troupe_id`, `user_id`, `status`, `display_name`, `created_at`, and `updated_at`. There is no baseline role column yet.
- `TroupeAccessService.requireActiveMember` is the correct read gate for troupe-scoped data. `requireCanManageTroupe` is currently provisional: active seed-troupe members can manage seasons/events.
- `TroupeController.joinTroupe` is intentionally demo-only and restricted to the seed troupe. After this story, direct demo joins should continue to create `MEMBER` memberships only, not admins.
- Story 3.5 added `season_organizers`, `event_organizers`, organizer CRUD endpoints, `OrganizerAccessService`, and Angular organizer dialogs. It deliberately deferred full troupe admin identity to Epic 2.
- Current Angular admin actions are still too broad in places. The readiness report explicitly calls out admin actions visible to non-admins as a Story 2.2 responsibility.

### Baseline Role Model

Use this story's minimal role model unless a normative doc is updated before implementation:

| Baseline role | Meaning | In scope behaviour |
|---------------|---------|--------------------|
| `MEMBER` | Active troupe member with member read access. | Can see member-allowed troupe/season/event data. Cannot manage members, seasons, events, or organizer lists by baseline role alone. |
| `TROUPE_ADMIN` | Troupe-level administrator. | Can manage troupe members/baseline roles, seasons/events, and season/event organizer delegation unless a narrower future permission overrides it. |

Do **not** add a baseline `ORGANIZER` role in `troupe_memberships` for this story. Organizer delegation is already represented by `season_organizers` and `event_organizers`; mixing it into baseline roles would blur two different permission scopes.

### Recommended Data Shape

```sql
ALTER TABLE troupe_memberships
    ADD COLUMN baseline_role VARCHAR(32) NOT NULL DEFAULT 'MEMBER';

CREATE INDEX idx_troupe_memberships_troupe_status_role
    ON troupe_memberships (troupe_id, status, baseline_role);
```

Backfill note: preserving existing seed-troupe admin behaviour for already-created demo memberships is acceptable as a compatibility step, but new direct demo joins must not automatically become admins after this story.

### API Shape Guidance

Prefer membership id in member-admin routes because `troupe_memberships.id` is already the stable row identity exposed in `MembershipSummaryDto`. If the implementation uses `userId` instead, keep paths and OpenAPI consistent and still enforce `(troupeId, userId)` ownership before mutation.

Suggested DTOs:

```json
{
  "id": "membership-uuid",
  "userId": "user-uuid",
  "email": "user@example.com",
  "displayName": "Patrice",
  "status": "ACTIVE",
  "baselineRole": "TROUPE_ADMIN",
  "createdAt": "2026-05-23T16:00:00Z",
  "updatedAt": "2026-05-23T16:10:00Z"
}
```

### Existing Blocks to Reuse

| Subject | Location |
|---------|----------|
| Membership entity/service/repository | `services/api/src/main/kotlin/com/hatcast/api/troupe/` |
| Existing troupe controller and DTOs | `services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeController.kt`, `dto/TroupeDtos.kt` |
| Current access service to refactor | `services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeAccessService.kt` |
| Season/event write callers | `services/api/src/main/kotlin/com/hatcast/api/season/SeasonService.kt`, `services/api/src/main/kotlin/com/hatcast/api/event/EventService.kt` |
| Organizer permission consumer | `services/api/src/main/kotlin/com/hatcast/api/organizer/OrganizerAccessService.kt` |
| Current Angular troupe API | `apps/web/src/app/core/troupes/troupe-api.service.ts` |
| Season shell and settings | `apps/web/src/app/pages/season-home/season-home.ts`, `season-header.ts` |
| Organizer dialog pattern | `apps/web/src/app/pages/season-home/season-organizers-dialog.ts` |
| Confirmation dialog pattern | `apps/web/src/app/pages/seasons-list/confirm-dialog.ts` |
| OpenAPI fragment | `services/api/openapi/seasons.yaml` |

### Architecture and Contract Guardrails

- Target stack in this repo now uses Angular `21.2.x` + Angular Material `21.2.x`, TypeScript `5.9.x`, Kotlin `2.0.21`, Spring Boot `3.4.1`, JPA, Flyway, PostgreSQL/Neon, and H2 tests.
- Keep REST paths under `/v1`, plural resource names, camelCase JSON, snake_case database names, and ISO 8601 UTC timestamps.
- Use `HATCAST_SESSION` cookie auth and existing CSRF header pattern (`X-XSRF-TOKEN`) for mutations.
- Server-side authorization is mandatory; Angular role gating is a UX improvement, not the security boundary.
- Do not modify `legacy/`; use it only as a semantic reference.
- Do not add CSV parser/import/export code here; Story 2.3 owns that capability.
- Do not implement public directory, multi-troupe switching, troupe-specific pseudo edit, avatar upload, account deletion, or invitation lifecycle here.

### Previous Story Intelligence

- **From Story 2.1:** Membership uniqueness and idempotent join are already implemented. Build on `ensureActiveMembership`, but adapt it so admin-added memberships can set baseline role and do not rely on the demo self-join path.
- **From Story 2.1 review:** Multi-troupe route resolution still uses the first membership and is deferred to Story 2.4. Avoid solving troupe switching in this story, but do not make it worse.
- **From Story 2.1 review:** Admin CRUD actions remained visible for non-admin troupe members. This story must close that UI gap.
- **From Story 3.5:** Organizer delegation is in review because product retest depends on Epic 2 adding a real member/user administration path. This story should make that retest possible for existing users.
- **From Story 3.5 review:** Avoid repeating UI gating mistakes: check permission flags before opening dialogs/menus, and keep 403 integration tests for forbidden users.

### Git Intelligence

Recent commits show the implementation pattern to follow:

- `e6e814b fix(troupe): Harden membership join` — membership join was tightened after review; keep idempotency and server-side restriction patterns.
- `16eac28 feat(troupe): Add membership slice and CSV plan` — Story 2.1 and Story 2.3 established the membership table and downstream CSV dependency.
- `1925e19 feat(organizers): Add delegation` — organizer delegation added central permission services and Angular dialog patterns to reuse.
- `533e58f feat(events): Add event types and role slots` — event write paths already rely on `TroupeAccessService`; update them through the service, not one-off checks.
- `01bb2ae feat(web): Add season agenda shell` — current season shell exposes admin controls that now need baseline-role gating.

### Testing Commands

- API focused: `cd services/api && ./gradlew test --tests 'com.hatcast.api.troupe.*'`
- API full: `cd services/api && ./gradlew test`
- Web: `npm run test -w @hatcast/web`
- Web build: `npm run build -w @hatcast/web`

### References

- [Source: `_bmad-output/planning-artifacts/epics.md#story-22--administration-des-membres-et-roles-de-base`]
- [Source: `_bmad-output/planning-artifacts/prd.md#troupe--membership`]
- [Source: `_bmad-output/planning-artifacts/prd.md#security--privacy`]
- [Source: `_bmad-output/planning-artifacts/ux-design-hatcast-v2.md#admin-functional-scope`]
- [Source: `_bmad-output/planning-artifacts/architecture.md#implementation-patterns--consistency-rules`]
- [Source: `SPEC.md#administration--required-capabilities-v2-target`]
- [Source: `DOMAIN.md#glossary`]
- [Source: `_bmad-output/planning-artifacts/implementation-readiness-report-2026-05-23-story-2-2.md`]
- [Source: `_bmad-output/implementation-artifacts/2-1-adhesion-a-une-troupe-et-profil-membre-minimal.md`]
- [Source: `_bmad-output/implementation-artifacts/3-5-delegation-des-organisateurs-perimetre-saison-evenement.md`]
- [Source: `_bmad-output/implementation-artifacts/2-3-import-export-csv-des-membres-de-troupe.md`]
- [Source: `services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeAccessService.kt`]
- [Source: `services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeMembershipEntity.kt`]
- [Source: `apps/web/src/app/pages/season-home/season-home.ts`]

## Dev Agent Record

### Agent Model Used

GPT-5.5 (Cursor)

### Debug Log References

- 2026-05-23: Implemented backend baseline role migration, entity/repository/DTO/service/controller changes; focused troupe tests initially exposed email validation trim behaviour and full-suite pagination assumptions, both fixed.
- 2026-05-23: Replaced seed-troupe provisional write access with real `TROUPE_ADMIN`; aligned season/event/organizer integration fixtures and permission DTO flags.
- 2026-05-23: Implemented Angular member-admin dialog and admin chrome gating; frontend tests/build passed after adding member dialog component tests.
- 2026-05-23: Final validations passed: `cd services/api && ./gradlew test`; `npm run test -w @hatcast/web -- --watch=false`; `npm run build -w @hatcast/web`.

### Completion Notes List

- Story context created by BMad create-story workflow on 2026-05-23.
- Readiness report gaps incorporated: role enum, schema migration, member list/add/remove/update API, real troupe-admin authorization, admin UI gating, OpenAPI, tests, and Story 2.3 CSV extension point.
- Added `baseline_role` with `MEMBER`/`TROUPE_ADMIN`, backfilled active seed memberships as admins, and kept new demo self-joins as `MEMBER`.
- Added admin-gated member list/add/update/deactivate API with last-active-admin protection, email normalization, stable camelCase DTOs, and CSRF-compatible mutations.
- Replaced provisional seed-troupe admin checks with active `TROUPE_ADMIN` membership for member, season, event, and organizer-admin mutations while keeping organizer delegation scoped.
- Added Angular member administration from season settings, French copy, CSV placeholder, permission refresh after member changes, and hidden admin actions for non-admin members.
- Updated OpenAPI, `DOMAIN.md`, and `ARCH.md` for baseline roles, soft deactivation, permission boundaries, and the Story 2.3 CSV extension point.

### File List

- `ARCH.md`
- `DOMAIN.md`
- `_bmad-output/implementation-artifacts/2-2-administration-des-membres-et-roles-de-base.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `apps/web/src/app/core/permissions/organizer-api.service.ts`
- `apps/web/src/app/core/troupes/troupe-api.service.spec.ts`
- `apps/web/src/app/core/troupes/troupe-api.service.ts`
- `apps/web/src/app/pages/season-home/season-agenda.html`
- `apps/web/src/app/pages/season-home/season-agenda.ts`
- `apps/web/src/app/pages/season-home/season-header.html`
- `apps/web/src/app/pages/season-home/season-header.ts`
- `apps/web/src/app/pages/season-home/season-home.html`
- `apps/web/src/app/pages/season-home/season-home.spec.ts`
- `apps/web/src/app/pages/season-home/season-home.ts`
- `apps/web/src/app/pages/season-home/troupe-members-dialog.spec.ts`
- `apps/web/src/app/pages/season-home/troupe-members-dialog.ts`
- `apps/web/src/app/pages/seasons-list/seasons-list.html`
- `apps/web/src/app/pages/seasons-list/seasons-list.ts`
- `services/api/openapi/seasons.yaml`
- `services/api/src/main/kotlin/com/hatcast/api/organizer/OrganizerAccessService.kt`
- `services/api/src/main/kotlin/com/hatcast/api/organizer/dto/OrganizerDtos.kt`
- `services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeAccessService.kt`
- `services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeBaselineRole.kt`
- `services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeController.kt`
- `services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeMembershipEntity.kt`
- `services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeMembershipRepository.kt`
- `services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeMembershipService.kt`
- `services/api/src/main/kotlin/com/hatcast/api/troupe/dto/TroupeDtos.kt`
- `services/api/src/main/kotlin/com/hatcast/api/troupe/dto/UpdateTroupeMemberRequestDeserializer.kt`
- `services/api/src/main/resources/db/migration/V10__troupe_membership_baseline_roles.sql`
- `services/api/src/test/kotlin/com/hatcast/api/event/EventControllerIntegrationTest.kt`
- `services/api/src/test/kotlin/com/hatcast/api/organizer/OrganizerControllerIntegrationTest.kt`
- `services/api/src/test/kotlin/com/hatcast/api/season/SeasonControllerIntegrationTest.kt`
- `services/api/src/test/kotlin/com/hatcast/api/troupe/TroupeMembershipIntegrationTest.kt`
- `services/api/src/test/kotlin/com/hatcast/api/troupe/TroupeMembershipServiceTest.kt`

### Change Log

- 2026-05-23: Implemented Story 2.2 member administration and baseline roles; moved story to review.
- 2026-05-23: Code review — fixed last-admin guard on POST add, added reactivate integration test and seasons-list non-admin gating test; story marked done.

### Review Findings

- [x] [Review][Patch] Last-admin guard contournable via POST add sur membre ACTIVE [services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeMembershipService.kt:164]
- [x] [Review][Patch] Test d'intégration manquant : réactivation d'un membre INACTIVE [services/api/src/test/kotlin/com/hatcast/api/troupe/TroupeMembershipIntegrationTest.kt]
- [x] [Review][Patch] Test composant manquant : actions admin masquées pour non-admin sur `/seasons` [apps/web/src/app/pages/seasons-list/seasons-list.spec.ts]
- [x] [Review][Defer] Erreurs API sans RFC 7807 Problem Details (AC5) — deferred, pre-existing
- [x] [Review][Defer] N+1 lazy-load email utilisateur sur liste membres — deferred, pre-existing
- [x] [Review][Defer] Retest produit Story 3.5 non documenté après remplacement admin provisoire — deferred, pre-existing

