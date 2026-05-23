# Story 2.5: Troupe-Specific Display Name (Pseudo)

Status: done

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

## Story

As a **member of a troupe**,
I want to **set and update the display name (pseudo) used for me within that troupe**,
so that **other members and organizers recognize me with my troupe usage name, independently of my account-level identity or my name in other troupes**.

## Acceptance Criteria

1. **Given** an authenticated user with an active membership in a troupe, **when** they save a non-empty trimmed pseudo within allowed length, **then** `troupe_memberships.display_name` for that `(troupeId, userId)` is updated and returned by `GET /v1/troupes` / `GET /v1/troupes/{troupeId}/memberships/me`. [Source: `_bmad-output/planning-artifacts/epics.md#story-25--pseudo-affiche-par-troupe`; Source: `_bmad-output/planning-artifacts/prd.md` FR9]
2. **Given** a member submits an empty or whitespace-only pseudo, **when** the save is attempted, **then** the API returns **400** with French error copy aligned with admin member edit (*« Le nom affiché ne peut pas être vide. »*) and the previous pseudo remains unchanged. [Source: `services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeMembershipService.kt`; Source: Story 2.2 admin PATCH behaviour]
3. **Given** a pseudo longer than **255** characters, **when** the save is attempted, **then** the API rejects the request (**400**) without persisting partial data. [Source: `services/api/src/main/resources/db/migration/V9__troupe_memberships.sql`; Source: `services/api/openapi/seasons.yaml` `UpdateTroupeMemberRequest.displayName.maxLength`]
4. **Given** a user who is **not** an active member of the troupe, **when** they call the self-service pseudo endpoint for that troupe, **then** access is denied (**403** or **404** per existing membership lookup policy) with no data leak (NFR-S2). [Source: `_bmad-output/planning-artifacts/prd.md` NFR-S2]
5. **Given** a member updates their pseudo in troupe A, **when** they belong to troupe B as well, **then** troupe B membership display name is unchanged; pseudo is **troupe-scoped**, not account-scoped. [Source: `_bmad-output/planning-artifacts/prd.md` FR9; Source: V2 data model vs legacy V1 account-level pseudo in `legacy/src/services/userProfileService.js`]
6. **Given** a troupe administrator edits a member pseudo via the existing admin PATCH (`/v1/troupes/{troupeId}/members/{membershipId}`), **when** that member later opens their own pseudo editor, **then** they see the admin-set value and may update it via the self-service flow without regression. [Source: Story 2.8 `membres-tab.ts` inline edit; Source: Story 2.2 admin member update]
7. **Given** a member saves a valid pseudo on `/compte`, **when** they return to troupe-scoped screens (`/seasons`, `/saison/:slug`, admin/event headers), **then** the UI shows the updated **troupe membership** pseudo as the current user's visible label (not the account-level `auth.user.displayName` when a troupe context exists). [Source: `_bmad-output/planning-artifacts/prd.md` FR9; Source: `apps/web/src/app/pages/season-home/season-header.html` currently uses account displayName]
8. **Given** the member belongs to **multiple** active troupes, **when** they open `/compte`, **then** they can view and edit a **separate pseudo per troupe** (one field per troupe membership), not a single global name. [Source: Story 2.4 multi-troupe context; Source: FR9]
9. **Given** a member attempts to change baseline role or status through the self-service pseudo endpoint, **when** the request includes those fields, **then** they are ignored or rejected; only `displayName` may change via self-service (NFR-S2). [Source: `_bmad-output/planning-artifacts/architecture.md#authentication--security`]
10. **Given** this story is complete, **when** tests run, **then** API integration tests cover self-service update, validation, authorization, and cross-troupe isolation; web tests cover API client, account pseudo UI, and troupe-scoped header label; `cd services/api && ./gradlew test`, `npm run test -w @hatcast/web -- --watch=false`, and `npm run build -w @hatcast/web` succeed. [Source: `_bmad-output/planning-artifacts/architecture.md#project-structure--boundaries`]

## Tasks / Subtasks

- [x] **Backend self-service membership update** (AC: 1, 2, 3, 4, 5, 9)
  - [x] Add `UpdateMyMembershipRequest` DTO with required/validated `displayName` (`@NotBlank` after trim semantics, `@Size(max = 255)`).
  - [x] Add `TroupeMembershipService.updateMyMembership(userId, troupeId, displayName)` using `requireActiveMembership`; reuse `normalizeDisplayName` / same empty check as admin `updateMember`.
  - [x] Add `PATCH /v1/troupes/{troupeId}/memberships/me` on `TroupeController`; session cookie + CSRF required.
  - [x] Return `MembershipSummaryDto`; update `updatedAt`.
  - [x] Do **not** grant self-service changes to `baselineRole` or `status`.

- [x] **OpenAPI and contract** (AC: 1, 2, 3, 4, 9)
  - [x] Document `PATCH /troupes/{troupeId}/memberships/me` in `services/api/openapi/seasons.yaml` with request schema, 200/400/403/404 responses, CSRF note.
  - [x] Add `UpdateMyMembershipRequest` component (displayName only).

- [x] **Angular API client** (AC: 1, 7, 8)
  - [x] Add `UpdateMyMembershipRequest` interface and `updateMyMembership(troupeId, body)` to `TroupeApiService` (`PATCH`, credentials, CSRF, trim client-side).
  - [x] Unit tests in `troupe-api.service.spec.ts` for success, trim, and error status passthrough.

- [x] **Account page pseudo editor (`/compte`)** (AC: 1, 2, 7, 8)
  - [x] Replace/extend `AccountPlaceholder` with a functional pseudo section (keep honest copy that full account settings remain Story 1.6).
  - [x] Load active troupes via `TroupeContextService.load()` or `TroupeApiService.listMyTroupes()`.
  - [x] Render **one editable pseudo field per active troupe** (troupe name as label/subtitle).
  - [x] Save per troupe (button or blur+Enter); show inline validation for empty pseudo; snack on success (*« Pseudo enregistré »*) / failure (*« Enregistrement impossible »*).
  - [x] After successful save, refresh troupe context (`reloadAndSelect` or patch local `selectedTroupe` / `activeTroupes` membership displayName) so headers update without full reload.

- [x] **Use troupe pseudo in troupe-scoped UI** (AC: 7)
  - [x] Introduce a small helper (e.g. `currentTroupeDisplayName()` on a shared service or computed from `TroupeContextService`) returning `selectedTroupe()?.membership.displayName` with fallback to auth `displayName` → email → *« Compte »*.
  - [x] Update user menu labels in `season-header.html`, `admin-membres.html`, and `seasons-list` header if present — **only where the screen is troupe-contextual**.
  - [x] Do **not** change admin member list rows (already use API `member.displayName`).

- [x] **Tests** (AC: 1–10)
  - [x] API: `TroupeMembershipIntegrationTest` — member PATCH own pseudo; empty → 400; non-member → 403/404; troupe A change does not alter troupe B; extra fields (status/role) do not change membership.
  - [x] Web: `account-placeholder.spec.ts` (create if missing) — lists troupes, saves pseudo, shows validation.
  - [x] Web: header/component test proving troupe pseudo overrides account displayName when context loaded.
  - [x] Run full API + web test suites and web build.

## Dev Notes

### Scope boundaries

- **In scope:** Self-service troupe pseudo edit (API + `/compte` UI), validation parity with admin display-name rules, troupe-scoped current-user label in existing V2 headers, context refresh after save.
- **Out of scope:** Avatar upload/import (Story 2.6); member profile popover / favourite roles (Story 2.7); account-level profile/password/email (Story 1.6 / FR36); season/event **participant** roster names (Story 3.8); retroactive rename of historical season player records; legacy Vue/Firestore pseudo sync (`updateUserPseudo` player propagation); admin membres tab refactor beyond regression safety.
- **Backend data model:** No new migration — `troupe_memberships.display_name` exists since Story 2.1 (V9).

### Current system snapshot

- **Storage:** `TroupeMembershipEntity.displayName` (`VARCHAR(255) NOT NULL`) is the troupe-scoped pseudo. [Source: `services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeMembershipEntity.kt`]
- **Default on join:** `MemberDisplayNameResolver.resolve(user)` — account `displayName`, else email local part, else `Membre {id-prefix}`. [Source: `services/api/src/main/kotlin/com/hatcast/api/troupe/MemberDisplayNameResolver.kt`]
- **Read paths:** `GET /v1/troupes` embeds `membership.displayName`; `GET /v1/troupes/{troupeId}/memberships/me` returns current user's membership. [Source: `TroupeController.kt`]
- **Admin write path:** `PATCH /v1/troupes/{troupeId}/members/{membershipId}` — **admin only**; already supports `displayName` with trim + non-empty validation. [Source: `TroupeMembershipService.updateMember`]
- **Missing for FR9:** No `PATCH .../memberships/me`; no member-facing UI; headers use **account** `user.displayName` from auth session, not troupe membership pseudo. [Source: `apps/web/src/app/pages/season-home/season-header.html`]
- **V1 difference (do not port blindly):** V1 stored a single account-level `pseudo` in Firestore `userProfiles`. V2 pseudo is **per troupe membership** — do not add a global pseudo field on `users` for this story.

### Validation rules (locked for MVP)

| Rule | Server behaviour today (admin) | Self-service must match |
|------|-------------------------------|-------------------------|
| Trim whitespace | `normalizeDisplayName` | Yes |
| Non-empty after trim | 400 *« Le nom affiché ne peut pas être vide. »* | Yes |
| Max length | 255 (DB + OpenAPI) | Yes |
| Character set | No extra regex in admin path | Same — no new regex unless product asks |
| Uniqueness | Not enforced | Do not add uniqueness constraint |

### Architecture and guardrails

- REST under `/v1`, camelCase JSON, snake_case DB, session cookie + CSRF on mutations. [Source: `_bmad-output/planning-artifacts/architecture.md#implementation-patterns--consistency-rules`]
- Authorization boundary on server: self-service endpoint uses `requireActiveMembership`, not `requireTroupeAdmin`. [Source: NFR-S2]
- Reuse existing DTO patterns in `com.hatcast.api.troupe.dto`; do not expose JPA entities.
- Angular: standalone components, signals, Material form controls — match `account-placeholder` / `seasons-list` styling.
- Do not modify `legacy/`.
- Keep admin inline edit in `membres-tab.ts` working; admins editing another member's pseudo is unchanged.

### Recommended API shape

```http
PATCH /v1/troupes/{troupeId}/memberships/me
Content-Type: application/json
X-XSRF-TOKEN: …

{ "displayName": "Patou" }
```

Response: `MembershipSummary` (same schema as GET).

### UI guidance (`/compte`)

- **French copy:** section title *« Pseudo par troupe »*; helper *« Nom affiché aux autres membres de la troupe. Chaque troupe a son propre pseudo. »*; validation *« Le pseudo ne peut pas être vide. »*
- Material: `mat-form-field` + `matInput` per troupe row; primary save button or save-on-blur consistent with admin inline edit (Enter saves, Esc cancels if using inline pattern).
- Empty memberships state: if user has zero troupes, show existing empty-membership guidance (link/join demo flow from `/seasons`) — do not expose pseudo editor.
- Account-level fields (email, password) remain placeholder text pointing to Story 1.6.

### Display-name resolution for current user (client)

Preferred order on troupe-scoped screens:

1. `TroupeContextService.selectedTroupe()?.membership.displayName` (after context load)
2. Auth session `user.displayName`
3. Auth session `user.email`
4. *« Compte »*

Load troupe context on season list / season home / admin routes if not already loaded (Story 2.4 services exist).

### Previous story intelligence

- **Story 2.1:** Created `display_name` column and membership summary in `GET /v1/troupes`; default resolver documented.
- **Story 2.2:** Admin PATCH validation for displayName; last-admin rules unrelated to this story.
- **Story 2.4:** `TroupeContextService` holds selected troupe + `membership.displayName`; refresh context after pseudo save to keep switcher/headers coherent.
- **Story 2.8:** Admin inline pseudo edit pattern in `membres-tab.ts` (`trim`, Enter/blur save, snack errors) — reuse UX patterns, not necessarily extract shared component unless trivial.

### Git intelligence

Recent Epic 2 commits to preserve:

- `c2f6ba7 feat(web): Add multi-troupe context switching` — context service is the source for current troupe pseudo in UI.
- `43904d1 feat(web): Add member removal` — admin member flows must remain intact.
- `e7868f1 feat(web): Add admin members route` — admin PATCH displayName already in production path.

### Testing commands

- API: `cd services/api && ./gradlew test`
- Focused API: `./gradlew test --tests '*TroupeMembershipIntegrationTest*'`
- Web: `npm run test -w @hatcast/web -- --watch=false`
- Build: `npm run build -w @hatcast/web`

### References

- [Source: `_bmad-output/planning-artifacts/epics.md#story-25--pseudo-affiche-par-troupe`]
- [Source: `_bmad-output/planning-artifacts/prd.md` FR9, NFR-S2]
- [Source: `_bmad-output/planning-artifacts/architecture.md#implementation-patterns--consistency-rules`]
- [Source: `_bmad-output/planning-artifacts/architecture.md#frontend-architecture`]
- [Source: `DOMAIN.md#glossary` — Troupe membership]
- [Source: `services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeController.kt`]
- [Source: `services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeMembershipService.kt`]
- [Source: `services/api/src/main/kotlin/com/hatcast/api/troupe/MemberDisplayNameResolver.kt`]
- [Source: `services/api/openapi/seasons.yaml`]
- [Source: `apps/web/src/app/core/troupes/troupe-api.service.ts`]
- [Source: `apps/web/src/app/core/troupes/troupe-context.service.ts`]
- [Source: `apps/web/src/app/pages/account-placeholder/account-placeholder.ts`]
- [Source: `apps/web/src/app/pages/season-home/season-header.html`]
- [Source: `apps/web/src/app/pages/admin-membres/membres-tab.ts`]
- [Source: `_bmad-output/implementation-artifacts/2-1-adhesion-a-une-troupe-et-profil-membre-minimal.md`]
- [Source: `_bmad-output/implementation-artifacts/2-4-navigation-entre-troupes.md`]
- [Source: `_bmad-output/implementation-artifacts/2-8-admin-membres-route-ui-ux-dr10.md`]

## Dev Agent Record

### Agent Model Used

Composer (Cursor)

### Debug Log References

- EventController integration tests failed in full suite due to shared fixed email `event@example.com` across distinct googleSubs; fixed by using per-sub emails in test helper.

### Completion Notes List

- Added self-service `PATCH /v1/troupes/{troupeId}/memberships/me` with validation parity to admin display-name rules; extra JSON fields ignored via DTO shape.
- Implemented `/compte` pseudo editor (one field per active troupe) with context patch after save.
- Added `TroupeContextService.currentUserDisplayLabel()` and `patchMembershipDisplayName()`; updated season and admin headers to show troupe pseudo.
- API integration tests for self-service pseudo; web tests for API client, account page, header label, and context helpers.
- Verified: `./gradlew test`, `npm run test -w @hatcast/web -- --watch=false`, `npm run build -w @hatcast/web`.

### File List

- services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeController.kt
- services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeMembershipService.kt
- services/api/src/main/kotlin/com/hatcast/api/troupe/dto/TroupeDtos.kt
- services/api/openapi/seasons.yaml
- services/api/src/test/kotlin/com/hatcast/api/troupe/TroupeMembershipIntegrationTest.kt
- services/api/src/test/kotlin/com/hatcast/api/event/EventControllerIntegrationTest.kt
- apps/web/src/app/core/troupes/troupe-api.service.ts
- apps/web/src/app/core/troupes/troupe-api.service.spec.ts
- apps/web/src/app/core/troupes/troupe-context.service.ts
- apps/web/src/app/core/troupes/troupe-context.service.spec.ts
- apps/web/src/app/pages/account-placeholder/account-placeholder.ts
- apps/web/src/app/pages/account-placeholder/account-placeholder.html
- apps/web/src/app/pages/account-placeholder/account-placeholder.scss
- apps/web/src/app/pages/account-placeholder/account-placeholder.spec.ts
- apps/web/src/app/pages/season-home/season-header.ts
- apps/web/src/app/pages/season-home/season-header.html
- apps/web/src/app/pages/season-home/season-header.spec.ts
- apps/web/src/app/pages/admin-membres/admin-membres.ts
- apps/web/src/app/pages/admin-membres/admin-membres.html

## Change Log

- 2026-05-23: Story 2.5 — self-service troupe pseudo API, `/compte` editor, troupe-scoped user labels in headers, tests (Date: 2026-05-23)
- 2026-05-23: Code review — maxlength 255, try/finally savePseudo, test AC6

### Review Findings

- [x] [Review][Patch] Ajouter `maxlength="255"` sur le champ pseudo `/compte` [`account-placeholder.html:48-53`]
- [x] [Review][Patch] Protéger `savingTroupeId` avec `try/finally` dans `savePseudo` [`account-placeholder.ts:89-91`]
- [x] [Review][Patch] Couvrir AC6 par un test (pseudo admin visible puis modifiable via `/compte`) [`account-placeholder.spec.ts`]
- [x] [Review][Defer] Correction email dupliqué dans `EventControllerIntegrationTest` [`EventControllerIntegrationTest.kt:61`] — deferred, pre-existing flaky test hors périmètre story
