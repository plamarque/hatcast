# Story 2.1: Troupe Membership and Minimal Member Profile

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As an authenticated user,
I want to belong to a troupe with a member profile for that troupe,
so that I can access seasons and events as a real member instead of through the temporary seed-troupe shortcut.

## Acceptance Criteria

1. **Given** an authenticated user and an explicit join/add flow for a troupe, **when** the user joins the troupe, **then** an active membership record exists in PostgreSQL for `(troupeId, userId)` with a minimal troupe-scoped member profile and timestamps. Duplicate joins must be idempotent and must not create duplicate memberships. [Source: `_bmad-output/planning-artifacts/epics.md#story-21--adhesion-a-une-troupe-et-profil-membre-minimal`]
2. **Given** the current user has at least one active membership, **when** the SPA calls `GET /v1/troupes`, **then** the API returns only troupes for which the user has an active membership, with the data needed by the current `/seasons` flow. It must no longer expose the seed troupe to every authenticated user solely because they are signed in. [Source: `_bmad-output/implementation-artifacts/deferred-work.md`]
3. **Given** a user is not an active member of a troupe, **when** they request member-only troupe, season, event, organizer, or season-by-slug data for that troupe, **then** the API refuses access with a coherent 403/404 policy and no personal or troupe-scoped member data leaks. [Source: `_bmad-output/planning-artifacts/prd.md#security--privacy`]
4. **Given** an active member opens the connected experience, **when** the app resolves troupe context, **then** the current seasons list and season home flows continue to work for their member troupes without relying on "first seed troupe" as the product permission model. Existing routes may remain `/seasons` and `/saison/:slug` for this story. [Source: `apps/web/src/app/pages/seasons-list/seasons-list.ts`; Source: `apps/web/src/app/pages/season-home/season-home.ts`]
5. **Given** this story is only the first Epic 2 slice, **when** implementing authorization, **then** baseline roles/admin member management remain out of scope for the full product model; any remaining provisional admin rule must be explicit, membership-gated, and easy to replace in Story 2.2. [Source: `_bmad-output/planning-artifacts/epics.md#story-22--administration-des-membres-et-roles-de-base`]
6. **Given** the API contract is changed, **when** the story is complete, **then** `services/api/openapi/seasons.yaml` (or a new troupe/membership fragment referenced from it) documents membership endpoints, response shapes, auth, CSRF requirements for mutations, and error responses. [Source: `_bmad-output/planning-artifacts/architecture.md#implementation-patterns--consistency-rules`]
7. **Given** membership is personal data, **when** tests exercise allowed and forbidden flows, **then** API and web tests cover successful join/list context, idempotent duplicate join, non-member denial, and the no-membership UI state without disabling existing season/event/organizer tests. [Source: `_bmad-output/planning-artifacts/prd.md#non-functional-requirements`]

## Tasks / Subtasks

- [ ] **Backend data model and migration** (AC: 1, 3)
  - [ ] Add a Flyway migration under `services/api/src/main/resources/db/migration/` for a membership table, using snake_case names and UUID public identifiers.
  - [ ] Store at minimum `troupe_id`, `user_id`, active status (or equivalent), a troupe-scoped `display_name` for the minimal profile, `created_at`, and `updated_at`.
  - [ ] Add a unique constraint on active membership identity (`troupe_id`, `user_id`); if soft-deactivation is modeled, keep duplicate-active prevention explicit.
  - [ ] Add indexes for `user_id` and `troupe_id` lookup paths used by `GET /v1/troupes` and authorization checks.
  - [ ] Do not add the complete role model here; baseline roles and admin member management belong to Story 2.2.

- [ ] **Backend membership domain and access rules** (AC: 1, 2, 3, 5)
  - [ ] Add JPA entity/repository/service classes in the existing V2 API package style, preferably under `com.hatcast.api.troupe` unless a small `membership` package is clearer.
  - [ ] Add service methods equivalent to `listActiveTroupesForUser`, `ensureActiveMembership`, and `requireActiveMemberOfTroupe`.
  - [ ] Refactor `TroupeAccessService` so read access is based on active membership, not only `hatcast.troupe.seed-troupe-id`.
  - [ ] Keep any provisional "can manage seed troupe" rule documented and membership-gated until Story 2.2 replaces it with real baseline roles.
  - [ ] Update season/event/organizer services that call `requireCanManageTroupe` or assume seed-only access so non-members are denied consistently.

- [ ] **Backend API contract and endpoints** (AC: 1, 2, 3, 6)
  - [ ] Change `GET /v1/troupes` to return only the current user's active membership troupes.
  - [ ] Add a minimal explicit join/add endpoint for the current user, for example `POST /v1/troupes/{troupeId}/memberships/me`, requiring session cookie and CSRF. If a different route is chosen, document it in OpenAPI and use the same REST/camelCase conventions.
  - [ ] Add `GET /v1/troupes/{troupeId}/memberships/me` or include enough membership fields in `GET /v1/troupes` so the SPA can resolve the current member profile without guessing.
  - [ ] Normalize the default member display name from `UserEntity.displayName`, then email local part, then a deterministic fallback; do not expose full email as display name unless already product-approved.
  - [ ] Return stable DTOs with camelCase JSON and no accidental JPA serialization.

- [ ] **Frontend troupe context and minimal join UX** (AC: 2, 4, 7)
  - [ ] Add or extend an Angular service in `apps/web/src/app/core/` for troupe membership APIs; keep `fetch(..., { credentials: 'include' })` and CSRF handling aligned with `SeasonApiService`.
  - [ ] Update `/seasons` context resolution so it uses the membership-aware `GET /v1/troupes` response and handles zero troupes explicitly instead of only showing "Impossible de charger les troupes."
  - [ ] Provide a minimal, non-admin join/add path for the seed/dev troupe only if needed to make Story 2.1 demonstrable before invitation/member-admin stories. Label it as temporary/product-limited in code or copy, and avoid pretending it is the final invitation system.
  - [ ] Preserve existing `/seasons` card grid behavior for members with at least one troupe.
  - [ ] Avoid changes in `legacy/`.

- [ ] **OpenAPI and documentation** (AC: 5, 6)
  - [ ] Update `services/api/openapi/seasons.yaml` title/description if it still says "seed pour l'instant" for troupes.
  - [ ] Document new membership schemas, endpoints, 403/404 behavior, and CSRF expectations.
  - [ ] Update `DOMAIN.md` and/or `ARCH.md` only where implementation makes the previous seed-only membership/access description wrong or misleading.
  - [ ] If the remaining provisional admin rule is still used, add it to the story completion notes and keep it visible for Story 2.2.

- [ ] **Tests** (AC: 1, 2, 3, 7)
  - [ ] API integration tests: authenticated user can join seed troupe, duplicate join is idempotent, `GET /v1/troupes` lists only active memberships, and non-member access to a troupe's seasons/events is denied.
  - [ ] API unit/service tests: membership access rules and default display-name resolution.
  - [ ] Web unit tests: membership/troupe API service sends credentials/CSRF for join; `/seasons` handles no-membership and membership-loaded states.
  - [ ] Regression tests: existing season, event, organizer tests still pass with the new membership gate.

## Dev Notes

### Current System Snapshot

- V2 already has `users`, `troupes`, and `seasons` in PostgreSQL. `troupes` is seeded with **La Malice** in `V3__troupes_seasons.sql`; seasons/events are also seeded in later migrations.
- `TroupeController.listTroupesForAdmin()` currently returns the seed troupe for every authenticated user. This is the main behavior to replace for read/context access.
- `TroupeAccessService` currently documents a pre-Epic-2 rule: "only the seed troupe is administrable by any authenticated user." Story 2.1 should replace the read-membership part, but not overbuild the full admin role matrix.
- `SeasonApiService.listTroupes()` and `SeasonsList.loadTroupeAndSeasons()` currently assume at least one troupe and use `tr.data[0].id`. This assumption must become membership-aware and handle zero memberships.
- Story 3.5 introduced organizer tables and permission endpoints; these still use provisional seed admin checks. Do not break organizer delegation endpoints while adding membership gating.

### Architecture and Contract Guardrails

- Target stack: Angular 21 + Angular Material in `apps/web/`; Kotlin + Spring Boot 3.4.1 + JPA + Flyway in `services/api/`; PostgreSQL/Neon as system of record.
- Keep JSON DTOs camelCase, REST paths plural/resource-oriented, DB names snake_case, dates as ISO 8601 UTC where timestamps are serialized.
- Use session-cookie auth (`HATCAST_SESSION`) and the existing CSRF pattern for mutations (`X-XSRF-TOKEN` from readable cookie) as in `SeasonApiService` and `SecurityConfig`.
- Do not expose memberships through direct entity serialization; create DTOs under `dto/`.
- Do not implement public directory behavior, multi-troupe switcher UI, editable troupe pseudo, avatar upload, or admin member-role management here. Those are Stories 2.3, 2.4, 2.5, and 2.2.

### Suggested Minimal Data Shape

Use names that fit local conventions; exact names can change during implementation if OpenAPI and code stay consistent:

```sql
CREATE TABLE troupe_memberships (
    id UUID NOT NULL PRIMARY KEY,
    troupe_id UUID NOT NULL,
    user_id UUID NOT NULL,
    status VARCHAR(32) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT troupe_memberships_troupe_fk FOREIGN KEY (troupe_id) REFERENCES troupes (id) ON DELETE CASCADE,
    CONSTRAINT troupe_memberships_user_fk FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT troupe_memberships_unique_user_troupe UNIQUE (troupe_id, user_id)
);
```

If using `active BOOLEAN` instead of `status`, make the active/inactive semantics explicit in service code and tests. A status enum (`ACTIVE`, later `INACTIVE`/`INVITED`) is more extensible, but do not implement invitation lifecycle in this story.

### API Shape Guidance

Prefer one of these minimal contracts, keeping names aligned with OpenAPI:

- `GET /v1/troupes` -> active member troupes for current user:
  - `id`, `name`, `slug`
  - optional `membership`: `id`, `displayName`, `status`
- `POST /v1/troupes/{troupeId}/memberships/me` -> create/reactivate current user's active membership and return the same member-troupe DTO.
- `GET /v1/troupes/{troupeId}/memberships/me` -> return current user's membership or 404 if not a member.

The endpoint names are guidance, not a mandate. The important behavior is stored membership plus member-gated access.

### Access Rule Guidance

Split access concepts explicitly:

- **Member read access:** active membership in the troupe.
- **Provisional management access:** temporary Story 3.x behavior for seed troupe management until Story 2.2 introduces baseline roles.
- **Organizer access:** existing Story 3.5 season/event organizer grants, scoped to composition/event capabilities.

Avoid a single method name such as `requireCanManageTroupe` being used for both read and write decisions. This is the bug-prone part of the current seed shortcut.

### UX Notes

- This story is not the final troupe switcher. If the user has exactly one membership, continuing directly with the existing `/seasons` flow is acceptable.
- If the user has zero memberships, show a clear empty state in French. For a temporary seed join action, use honest wording such as "Rejoindre la troupe de démonstration" rather than a final invitation promise.
- Keep Angular Material patterns and existing dark/token styling where this touches visible UI.

### Previous Story Intelligence

- There is no previous Story 2.x file to inherit from.
- Relevant deferred work from Epic 3 explicitly points to Epic 2:
  - read/write access is not differentiated yet in `EventService.kt`;
  - season slug resolution in the web app depends on the first troupe;
  - `TroupeAccessService.kt` needs a real member/admin model.
- Story 3.1 documented the seed-only troupe rule as temporary. This story is the first replacement step; do not preserve the old rule as if it were product behavior.

### Testing Commands

- API: `cd services/api && ./gradlew test`
- Web: `npm run test -w @hatcast/web`
- If time is constrained, run focused tests first, then the full commands above before marking implementation complete.

### References

- [Source: `_bmad-output/planning-artifacts/epics.md#story-21--adhesion-a-une-troupe-et-profil-membre-minimal`]
- [Source: `_bmad-output/planning-artifacts/epics.md#epic-2--troupes-adhesion-et-profil-membre`]
- [Source: `_bmad-output/planning-artifacts/prd.md#troupe--membership`]
- [Source: `_bmad-output/planning-artifacts/prd.md#security--privacy`]
- [Source: `_bmad-output/planning-artifacts/architecture.md#implementation-patterns--consistency-rules`]
- [Source: `DOMAIN.md#glossary`]
- [Source: `_bmad-output/implementation-artifacts/deferred-work.md`]
- [Source: `services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeAccessService.kt`]
- [Source: `services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeController.kt`]
- [Source: `apps/web/src/app/pages/seasons-list/seasons-list.ts`]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

- Story context created by BMad create-story workflow on 2026-05-23.
- Ultimate context engine analysis completed - comprehensive developer guide created.

### File List

