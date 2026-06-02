# Story 3.8: Season and event participant rosters

Status: done

<!-- Ultimate context engine analysis completed — comprehensive developer guide created -->

## Story

As an **authorized season or event administrator**,  
I want to **add and manage participants at season or event scope** — including **name-only** people and people **pre-linked by email**,  
so that **teams can include troupe members, external contributors, and one-off participants without granting troupe membership** (**FR43**, **FR44**, **FR45**, **NFR-S5**).

## Acceptance Criteria

1. **Given** a user with `canManageSeasonParticipants`, **when** they add a season participant with a **display name** and **optional email**, **then** the participant is persisted, appears in season participant selectors, and can be consumed by availability/composition flows per permissions — **FR43**.
2. **Given** active troupe members for the season’s troupe, **when** an authorized user lists season participants, **then** those members appear **by default** in the roster (via membership sync or union — see Dev Notes) with correct display names and optional user linkage — **FR43**, **FR13** default access.
3. **Given** a user with `canManageEventParticipants` for a spectacle, **when** they add an **event-only** participant, **then** the participant is available **only for that event** and does **not** become a troupe member or season-wide participant — **FR44**.
4. **Given** an email matching an existing HatCast **`users`** row (case-insensitive, trimmed), **when** a participant is created or updated with that email, **then** `user_id` is set on the participant row where permitted — **FR45**.
5. **Given** an email with **no activated account** (`users.activated_at IS NULL` or no row), **when** the participant is created, **then** they remain a **managed participant** (usable in admin workflows) and may be linked **automatically on first successful sign-in** with the same normalized email — **FR45**.
6. **Given** **no email**, **when** the participant is created, **then** they remain **name-only** and admin-managed — **FR45**.
7. **Given** a caller **without** participant-admin permission, **when** they hit roster list endpoints, **then** they receive **403** or a **redacted DTO** (no private emails); member-facing selector endpoints expose **id + displayName + avatarUrl** only — **NFR-S5**.
8. **Given** an admin **removes** a participant, **when** the action completes, **then** the row is **soft-deleted** (`status = REMOVED`); historical availability/composition/audit FKs remain valid (no hard cascade delete of domain history) — lifecycle policy below.
9. **Given** the season **Agenda** participant filter (story **3.3**), **when** season participants exist, **then** [`season-home.ts`](../../apps/web/src/app/pages/season-home/season-home.ts) loads real options from the API (replace stub `[{ id: null, label: 'Tous' }]`) — **UX-DR2** prep.
10. **Given** the admin **Participants** screen, **when** opened by an authorized user, **then** UI follows Material admin patterns (compact list, search, add modal, remove with confirm) at route **`/saison/:slug/admin/participants`**; vocabulary **Participants** (never **Membres**) — **UX-DR10**.
11. **Given** event-only participants, **when** editing an existing spectacle, **then** an expandable **Participants du spectacle** section appears in [`event-form-dialog`](../../apps/web/src/app/pages/season-home/event-form-dialog.ts) (mirror event-organizers pattern from story **3.5**) when `canManageEventParticipants`.  
    **Superseded (placement only) by story [17.16](17-16-route-admin-participants-evenement.md):** event participant admin = route `/saison/:slug/event/:eventSlug/admin/participants` ([`AdminEventParticipants`](../../apps/web/src/app/pages/admin-event-participants/admin-event-participants.ts)); roster spectacle = participants saison par défaut + exclusions/ajouts ponctuels.
12. **Non-goals:** CSV import/export of participants (remains on troupe **Membres** — story **2.3**); self-service guest invitations (**Epic 7**); availability/composition UI (**Epics 5–6**); retroactive migration of Firestore `players` documents.

## Context and slicing

| Story | Scope |
|-------|--------|
| **2.2–2.8 (done)** | Troupe **memberships** — distinct from participants |
| **3.5 (done)** | Organizer **users** for permissions — not participant identity |
| **3.8 (this)** | `season_participants` + `event_participants`, admin UI, selector API, email linking |
| **5.1 (ready-for-dev)** | Uses interim `user_id` on `event_availability` — **migrate to `participant_id`** after 3.8 |
| **5.2–5.5, 6.4–6.9** | **Blocked** on participant identity from this story |

**Critical dependency:** This story **must land before** implementing availability/composition against `participant_id` (stories **5.1–5.5**, **6.4–6.9**). If **5.1** already merged with `user_id` only, add Flyway migration to introduce `participant_id` and backfill from membership-linked season participants.

## Tasks / Subtasks

- [x] **Scope:** `apps/web/` + `services/api/` ; **do not modify** `legacy/` (reference only).
- [x] **Migration Flyway** `V14__season_and_event_participants.sql` (renumber if **5.1** took V14 — use next free version):
  - Table `season_participants` (see Dev Notes schema).
  - Table `event_participants` (see Dev Notes schema).
  - Indexes on `(season_id, status)`, `(event_id, status)`, `(user_id)`, `(normalized_email)` where useful.
  - Optional: nullable `participant_id` on future `event_availability` — coordinate with story **5.1** file if that migration exists.
- [x] **API domain** — package `com.hatcast.api.participant`:
  - Entities, repositories, DTOs (admin vs public shapes).
  - **`ParticipantAccessService`**: permission checks (extend [`OrganizerAccessService`](../../services/api/src/main/kotlin/com/hatcast/api/organizer/OrganizerAccessService.kt) or sibling service):
    - `canManageSeasonParticipants(seasonId, principal)` → troupe admin (`canManageMembers`) for MVP; document future season-admin role.
    - `canManageEventParticipants(eventId, seasonId, principal)` → troupe admin **or** event organizer for that event.
    - `canViewParticipantEmail(participant, principal)` → admin scopes only.
  - **`ParticipantLinkService`**: normalize email; resolve `user_id` on create/update; **`linkPendingParticipantsOnLogin(userId, email)`** hook from auth session establishment ([`AuthController`](../../services/api/src/main/kotlin/com/hatcast/api/auth/) or session service — find existing post-login hook).
  - **`SeasonParticipantService`**: CRUD + **`ensureMembershipParticipants(seasonId)`** on list (upsert ACTIVE rows for active `troupe_memberships` with `troupe_membership_id` set).
  - Endpoints (adjust paths to match existing style):
    - `GET /v1/seasons/{seasonId}/participants` — admin list (emails when permitted).
    - `POST /v1/seasons/{seasonId}/participants` — body `{ displayName, email? }`.
    - `PATCH /v1/seasons/{seasonId}/participants/{participantId}` — update name/email.
    - `DELETE /v1/seasons/{seasonId}/participants/{participantId}` — soft remove (reject if row is membership-synced troupe member? **or** allow remove from season roster only for explicit non-member rows — see lifecycle).
    - `GET /v1/seasons/{seasonId}/participants/selectors` — member-safe list for filters (id, displayName, avatarUrl, kind).
    - `GET/POST/DELETE /v1/seasons/{seasonId}/events/{eventId}/participants` — event-only roster.
  - Update `seasons.participant_count` when explicit non-member rows change (membership-synced count included in list total).
  - Register paths in [`SecurityConfig.kt`](../../services/api/src/main/kotlin/com/hatcast/api/config/SecurityConfig.kt).
- [x] **OpenAPI:** new [`openapi/participants.yaml`](../../services/api/openapi/participants.yaml) or extend [`openapi/seasons.yaml`](../../services/api/openapi/seasons.yaml) — admin vs selector schemas; document 403/404; email fields marked admin-only.
- [x] **Extend `MySeasonPermissionsDto`:** add `canManageSeasonParticipants`, `canManageEventParticipants` (per-event list optional).
- [x] **Angular:**
  - `apps/web/src/app/core/participants/participant-api.service.ts`.
  - Page `apps/web/src/app/pages/admin-participants/` — route `/saison/:slug/admin/participants`:
    - Shell like [`admin-membres`](../../apps/web/src/app/pages/admin-membres/admin-membres.ts) (back → agenda, H1 **Participants**, subtitle season + troupe).
    - Toolbar: search (displayName, debounce 150ms), **Ajouter** modal (name required, email optional), **Retirer** with confirm.
    - Row: display name (inline edit optional MVP+), email read-only for admins, badge **Membre troupe** / **Externe** / **Nom seul** / **Lié**.
    - No CSV toolbar (out of scope).
  - Settings menu: add **Participants** entry in [`season-header`](../../apps/web/src/app/pages/season-home/season-header.ts) when `canManageSeasonParticipants`.
  - **Event form:** `event-participants-section` in edit mode of [`event-form-dialog`](../../apps/web/src/app/pages/season-home/event-form-dialog.ts).
  - **Agenda filter:** wire [`season-home.ts`](../../apps/web/src/app/pages/season-home/season-home.ts) `participantOptions` from `GET .../participants/selectors`.
- [x] **Tests:**
  - API integration: create name-only, email-linked existing user, email-prelinked pending user, event-only participant, soft delete, 403 non-admin, selector DTO redaction.
  - Unit: email normalization, link-on-login, membership sync idempotency.
  - Component: admin page add/remove; event dialog section gating; agenda filter populated.
  - Regression: `./gradlew test`, `ng test`, `ng build` ; stories **2.8**, **3.5** unaffected.

## Dev Notes

### Architecture & guardrails

- Monorepo V2: [ARCH.md](../../ARCH.md) ; REST/JSON: [architecture.md](../planning-artifacts/architecture.md) (camelCase DTOs, Flyway, OpenAPI source of truth).
- Auth: [ADR-0010](../../docs/adr/0010-v2-auth-identity-platform.md) ; mutations with `credentials: 'include'` + CSRF.
- Authorization at **API** — Angular hides admin routes but must not be sole gate (**NFR-S2**, **NFR-S5**).
- UI admin: Material defaults per [ux-design — Admin scope](../planning-artifacts/ux-design-hatcast-v2.md#admin-functional-scope).
- **Vocabulary (locked):** **Membres** = troupe scope ([`/admin/membres`](../../apps/web/src/app/app.routes.ts)) ; **Participants** = this story ([ux-design-specification.md](../planning-artifacts/ux-design-specification.md) § Product vocabulary).

### Domain model (approved sprint change 2026-05-23)

| Concept | V2 meaning |
|---------|------------|
| **Season participant** | Person in season availability/selectors/composition ; active troupe members included **by default** |
| **Event participant** | Person for **one event only** ; not troupe member or season-wide participant |
| **Linked participant** | Row with `user_id` set |
| **Managed participant** | Name ± optional email ; no account required |
| **Email-prelinked** | `normalized_email` stored ; `user_id` null until match / first login |

**Do not** overload `troupe_memberships` for temporary or event-only people.

### Database shape (proposed)

```sql
CREATE TABLE season_participants (
    id UUID NOT NULL PRIMARY KEY,
    season_id UUID NOT NULL REFERENCES seasons (id) ON DELETE CASCADE,
    display_name VARCHAR(255) NOT NULL,
    normalized_email VARCHAR(320) NULL,
    user_id UUID NULL REFERENCES users (id) ON DELETE SET NULL,
    troupe_membership_id UUID NULL REFERENCES troupe_memberships (id) ON DELETE SET NULL,
    status VARCHAR(16) NOT NULL DEFAULT 'ACTIVE'
        CHECK (status IN ('ACTIVE', 'REMOVED')),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    removed_at TIMESTAMP NULL,
    CONSTRAINT uq_season_participant_membership UNIQUE (season_id, troupe_membership_id)
);

CREATE TABLE event_participants (
    id UUID NOT NULL PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES events (id) ON DELETE CASCADE,
    display_name VARCHAR(255) NOT NULL,
    normalized_email VARCHAR(320) NULL,
    user_id UUID NULL REFERENCES users (id) ON DELETE SET NULL,
    season_participant_id UUID NULL REFERENCES season_participants (id) ON DELETE SET NULL,
    status VARCHAR(16) NOT NULL DEFAULT 'ACTIVE'
        CHECK (status IN ('ACTIVE', 'REMOVED')),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    removed_at TIMESTAMP NULL
);

CREATE INDEX idx_season_participants_season_status ON season_participants (season_id, status);
CREATE INDEX idx_event_participants_event_status ON event_participants (event_id, status);
CREATE INDEX idx_season_participants_email ON season_participants (normalized_email)
    WHERE normalized_email IS NOT NULL AND status = 'ACTIVE';
```

### Membership sync (default roster)

On **`GET /participants`** (admin) and **`GET /participants/selectors`**:

1. Call `ensureMembershipParticipants(seasonId)`:
   - For each **ACTIVE** `troupe_membership` on the season’s troupe:
     - Upsert `season_participants` with `troupe_membership_id`, `display_name` from membership, `user_id` from membership’s user, `normalized_email` from user if present.
   - Do **not** remove membership rows when member deactivated — set `status = REMOVED` or exclude from ACTIVE list per product rule (inactive members hidden from selectors, visible in admin with filter — mirror **Membres** *Afficher les inactifs* if time permits; else exclude inactive from selectors only).

2. Return ACTIVE explicit non-member rows + synced membership rows.

**Remove policy:**

- **Explicit admin-added** non-member season participant → soft `REMOVED`.
- **Season admin “Retirer”** (including rows synced from troupe membership): soft-remove **this season’s** participant row (`REMOVED`). Does **not** deactivate troupe membership. See story **3.19** and SCP [sprint-change-proposal-2026-05-31-participant-removal-three-levels.md](../planning-artifacts/sprint-change-proposal-2026-05-31-participant-removal-three-levels.md).
- **Troupe admin “Retirer”** (Membres tab only): deactivates troupe membership (Story **2.2**); cascades `REMOVED` on all linked season participants for that troupe.
- **Membership sync:** upserts ACTIVE season rows for ACTIVE troupe memberships **except** rows explicitly removed at season scope (sync guard — story **3.19**).
- **Re-inclusion:** admin “Réintégrer à la saison” reactivates the same row; historical FKs remain valid.

### Email linking rules (**FR45**)

```kotlin
// On create/update when email present:
fun resolveUserLink(normalizedEmail: String): UUID? =
    userRepository.findByEmailIgnoreCase(normalizedEmail)?.id
    // Link even if activated_at null (prelinked / imported account)

// After successful login (session create):
fun linkPendingParticipants(user: UserEntity) {
    val email = user.email?.trim()?.lowercase() ?: return
    seasonParticipantRepository.linkUnlinkedByEmail(email, user.id)
    eventParticipantRepository.linkUnlinkedByEmail(email, user.id)
}
```

- **Never** auto-create `users` rows from participant email alone.
- Normalize: **lowercase trim** (V1 parity with organizer email handling).

### DTO privacy (**NFR-S5**)

| Endpoint | Email | Fields |
|----------|-------|--------|
| Admin list `GET .../participants` | Yes if `canManageSeasonParticipants` | id, displayName, email?, userId?, troupeMembershipId?, kind, status |
| Selector `GET .../participants/selectors` | **No** | id, displayName, avatarUrl?, kind (`MEMBER`, `MANAGED`, `EVENT_ONLY` N/A here) |
| Event admin list | Same gate as event participant admin | same pattern |

### Permission matrix (MVP)

| Action | Troupe admin | Event organizer | Season organizer | Ordinary member |
|--------|--------------|-----------------|------------------|-----------------|
| Manage season participants | ✓ | ✗ | ✗ | ✗ |
| Manage event-only participants | ✓ | ✓ (own event) | ✗ | ✗ |
| List selectors (filter UI) | ✓ | ✓ | ✓ | ✓ (season access) |
| See participant emails | ✓ | ✓ (event scope admin) | ✗ | ✗ |

Extend [`MySeasonPermissionsDto`](../../services/api/src/main/kotlin/com/hatcast/api/organizer/dto/OrganizerDtos.kt) accordingly.

### V1 reference (semantics, not Firestore port)

| V1 | V2 |
|----|-----|
| `seasons/{id}/players` collection | `season_participants` + membership sync |
| `addPlayer(name)` name-only | POST season participant without email |
| `protectPlayer` + email | Linked / prelinked participant |
| Hard delete + PIN ([`SeasonAdminPage.vue`](../../legacy/src/views/SeasonAdminPage.vue)) | **Soft delete** ; no season PIN in V2 MVP |
| Event-scoped guests (implicit) | `event_participants` |

V1 [`addPlayer`](../../legacy/src/services/storage.js) validates unique name per season — **reuse** uniqueness rule for explicit non-member rows (case-insensitive display name or separate constraint — document choice in tests).

### Existing blocks (reuse — do not reinvent)

| Subject | Location |
|---------|----------|
| Admin page shell | [`admin-membres.ts`](../../apps/web/src/app/pages/admin-membres/admin-membres.ts) |
| Event dialog extension | [`event-form-dialog.ts`](../../apps/web/src/app/pages/season-home/event-form-dialog.ts) (organizers section) |
| Permissions endpoint | [`OrganizerController`](../../services/api/src/main/kotlin/com/hatcast/api/organizer/OrganizerController.kt) `/permissions/me` |
| Troupe memberships | [`TroupeMembershipService.kt`](../../services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeMembershipService.kt) |
| Users / activated_at | [`UserEntity.kt`](../../services/api/src/main/kotlin/com/hatcast/api/user/UserEntity.kt), `V11__user_activated_at.sql` |
| Agenda participant stub | [`season-home.ts:94-97`](../../apps/web/src/app/pages/season-home/season-home.ts) |
| Confirm dialog | [`confirm-dialog`](../../apps/web/src/app/pages/seasons-list/confirm-dialog.ts) |
| Season `participantCount` | [`SeasonEntity.kt`](../../services/api/src/main/kotlin/com/hatcast/api/season/SeasonEntity.kt) |

### UI behaviour

1. **Route `/saison/:slug/admin/participants`** — separate from **Membres** ; settings menu exposes both when permitted.
2. **Add modal:** display name (required), email (optional), helper text for prelink behaviour.
3. **Retirer:** confirm dialog — soft remove ; warn that dispos/compositions history is kept ; different copy for external vs synced member rows.
4. **Event dialog section:** list event-only participants ; add by name ± email ; no season-wide side effects.
5. **Agenda filter:** populate from selectors API ; deep link `?participant={participantId}` already parsed in [`season-home.ts`](../../apps/web/src/app/pages/season-home/season-home.ts).

### Downstream contract (Epics 5–6)

After 3.8, domain writes should prefer **`participant_id`**:

- `event_availability.participant_id` (nullable during 5.1 interim → backfill migration).
- Composition/cast assignees reference `season_participants.id` or `event_participants.id` (epic 6).
- Proxy actions (5.5): actor = user session ; subject = participant id.

Document participant ids in OpenAPI for selector consumers.

### Out of scope

- CSV participant import/export.
- Guest self-service invite flows (Epic 7).
- PIN-gated hard delete (V1).
- Full season-admin role beyond troupe admin (future epic-2).
- Wiring availability/composition UI (later stories).

### Testing requirements

| Layer | What to test |
|-------|----------------|
| **API integration** | CRUD season + event participants ; membership sync ; email link existing user ; prelinked + login link ; soft delete ; 403 ; selector redaction |
| **Unit (Kotlin)** | Email normalize ; link service ; ensureMembershipParticipants idempotent |
| **Unit (TS)** | API client mapping ; admin page flows |
| **Component** | Add/remove ; event section visibility ; agenda filter options |
| **Regression** | Admin membres 2.8 ; organizers 3.5 ; season-home loads |

### Previous story intelligence

**From 3.5 (done):**

- Organizer assignment targets **`users`** only — **do not** conflate with participant add flows.
- Extend [`event-form-dialog`](../../apps/web/src/app/pages/season-home/event-form-dialog.ts) in **edit** mode only for event-scoped UI.
- Add permission flags to `/permissions/me` like `canManageSeasonOrganizers`.

**From 2.8 (done):**

- Admin route pattern: slug resolution via [`TroupeSeasonResolverService`](../../apps/web/src/app/core/troupes/troupe-season-resolver.service.ts), unauthorized → agenda + snack.
- Material compact list + modal add — copy structure, not membres CSV toolbar.

**From 5.1 (ready-for-dev, not implemented):**

- Interim `event_availability.user_id` — when 3.8 lands first, add `participant_id` column immediately and map `/me` to membership-linked participant row to avoid double migration.

### Git intelligence (recent commits)

- `d8f2178` — member profile popover ; avatar/display name patterns for selector rows.
- `43904d1` — member removal ; soft lifecycle on memberships mirrors participant REMOVED approach.
- `c2f6ba7` — multi-troupe context ; admin routes must use season slug resolver consistently (known 2.8 defer).

### Latest tech notes

- **Angular 21** standalone ; MatDialog, MatList, MatChip for kind badges.
- **Spring Boot 3 / Kotlin** — `@Transactional` on sync + link ; Problem Details 403/404/409 duplicate name.
- **Flyway:** next version after latest migration (`V13` at time of writing — use **`V14`** unless 5.1 merged first).

### Project context reference

- [Epics — Story 3.8](../planning-artifacts/epics.md)
- [PRD — FR43–FR45, NFR-S5](../planning-artifacts/prd.md)
- [Sprint change proposal — participant model](../planning-artifacts/sprint-change-proposal-2026-05-23.md)
- [UX — Admin scope](../planning-artifacts/ux-design-hatcast-v2.md#admin-functional-scope)
- [Story 3.5](./3-5-delegation-des-organisateurs-perimetre-saison-evenement.md)
- [Story 2.8](./2-8-admin-membres-route-ui-ux-dr10.md)
- [Story 5.1 — interim model](./5-1-saisie-de-disponibilite-par-evenement-etats-dispo-pas-dispo-non-renseigne.md)

## Dev Agent Record

### Agent Model Used

GPT-5.5 (Cursor) — dev-story workflow

### Debug Log References

_(none)_

### Completion Notes List

- Ultimate context engine analysis completed — comprehensive developer guide created (2026-05-24).
- Implemented V14 migration (`season_participants`, `event_participants`), full participant API (CRUD saison + spectacle, selectors, soft delete, membership sync, email linking on login).
- Admin UI `/saison/:slug/admin/participants`, event dialog section, agenda filter wired to selectors API.
- Extended `MySeasonPermissionsDto` with participant flags + `eventParticipantAdminFor`.
- API integration tests (ParticipantControllerIntegrationTest), unit tests (ParticipantLinkServiceTest, AuthUserLinkService updated).
- `./gradlew test`, `ng test`, `ng build` all green.

### File List

- services/api/src/main/resources/db/migration/V14__season_and_event_participants.sql
- services/api/src/main/kotlin/com/hatcast/api/participant/ParticipantEnums.kt
- services/api/src/main/kotlin/com/hatcast/api/participant/ParticipantEntities.kt
- services/api/src/main/kotlin/com/hatcast/api/participant/ParticipantRepositories.kt
- services/api/src/main/kotlin/com/hatcast/api/participant/dto/ParticipantDtos.kt
- services/api/src/main/kotlin/com/hatcast/api/participant/ParticipantLinkService.kt
- services/api/src/main/kotlin/com/hatcast/api/participant/ParticipantAccessService.kt
- services/api/src/main/kotlin/com/hatcast/api/participant/SeasonParticipantService.kt
- services/api/src/main/kotlin/com/hatcast/api/participant/EventParticipantService.kt
- services/api/src/main/kotlin/com/hatcast/api/participant/ParticipantController.kt
- services/api/src/main/kotlin/com/hatcast/api/auth/AuthUserLinkService.kt
- services/api/src/main/kotlin/com/hatcast/api/organizer/dto/OrganizerDtos.kt
- services/api/src/main/kotlin/com/hatcast/api/organizer/OrganizerAccessService.kt
- services/api/openapi/participants.yaml
- services/api/openapi/seasons.yaml
- services/api/src/test/kotlin/com/hatcast/api/participant/ParticipantControllerIntegrationTest.kt
- services/api/src/test/kotlin/com/hatcast/api/participant/ParticipantLinkServiceTest.kt
- services/api/src/test/kotlin/com/hatcast/api/auth/AuthUserLinkServiceTest.kt
- services/api/src/test/kotlin/com/hatcast/api/organizer/OrganizerControllerIntegrationTest.kt
- apps/web/src/app/core/participants/participant-api.service.ts
- apps/web/src/app/core/permissions/organizer-api.service.ts
- apps/web/src/app/pages/admin-participants/admin-participants.ts
- apps/web/src/app/pages/admin-participants/admin-participants.html
- apps/web/src/app/pages/admin-participants/admin-participants.scss
- apps/web/src/app/pages/admin-participants/add-participant-dialog.ts
- apps/web/src/app/pages/season-home/season-home.ts
- apps/web/src/app/pages/season-home/season-home.html
- apps/web/src/app/pages/season-home/season-header.ts
- apps/web/src/app/pages/season-home/season-header.html
- apps/web/src/app/pages/season-home/event-form-dialog.ts
- apps/web/src/app/pages/season-home/event-form-dialog.html
- apps/web/src/app/pages/season-home/season-home.spec.ts
- apps/web/src/app/pages/admin-membres/admin-membres.spec.ts
- apps/web/src/app/app.routes.ts
- apps/web/src/app/pages/admin-participants/admin-participants.spec.ts
- apps/web/src/app/pages/season-home/event-form-dialog.spec.ts
- services/api/src/test/kotlin/com/hatcast/api/participant/SeasonParticipantServiceTest.kt
- _bmad-output/implementation-artifacts/sprint-status.yaml

### Change Log

- 2026-05-24: Story created — participant rosters schema, API, admin UI, selector wiring, email linking, soft-delete lifecycle.
- 2026-05-24: Code review — 10 patch findings (test coverage) fixed; status → done.

### Review Findings

- [x] [Review][Patch] Missing admin-participants component tests [apps/web/src/app/pages/admin-participants/] — Story tasks require add/remove component coverage; no `admin-participants.spec.ts` exists.
- [x] [Review][Patch] Missing event-form-dialog participant section gating test [apps/web/src/app/pages/season-home/event-form-dialog.ts:130] — Section visibility when `canManageEventParticipants` is not asserted in tests.
- [x] [Review][Patch] Agenda filter not asserted in season-home tests [apps/web/src/app/pages/season-home/season-home.spec.ts:115] — `listSeasonParticipantSelectors` is mocked but no test verifies `participantOptions` is populated (AC9).
- [x] [Review][Patch] Missing integration test: membership sync on list [services/api/src/test/kotlin/com/hatcast/api/participant/ParticipantControllerIntegrationTest.kt] — AC2 (troupe members appear by default) not covered.
- [x] [Review][Patch] Missing integration test: login link for prelinked participant [services/api/src/test/kotlin/com/hatcast/api/participant/ParticipantControllerIntegrationTest.kt] — AC5 auto-link on first sign-in not covered end-to-end.
- [x] [Review][Patch] Missing integration test: event organizer manages event participants [services/api/src/test/kotlin/com/hatcast/api/participant/ParticipantControllerIntegrationTest.kt] — Permission matrix allows event organizer; only troupe admin tested.
- [x] [Review][Patch] Missing integration tests for guard rails [ParticipantControllerIntegrationTest.kt] — No coverage for duplicate name 409, PATCH update, remove blocked on membership-synced row, update blocked on synced row.
- [x] [Review][Patch] AuthUserLinkServiceTest omits link-on-login verification [services/api/src/test/kotlin/com/hatcast/api/auth/AuthUserLinkServiceTest.kt] — `linkPendingParticipantsOnLogin` never verified after sign-in paths.
- [x] [Review][Patch] ParticipantLinkServiceTest incomplete [services/api/src/test/kotlin/com/hatcast/api/participant/ParticipantLinkServiceTest.kt] — Only `normalizeEmail` tested; missing `resolveUserId` and `linkPendingParticipantsOnLogin`.
- [x] [Review][Patch] No unit test for ensureMembershipParticipants idempotency [SeasonParticipantService.kt:177] — Explicitly listed in story testing requirements.
- [x] [Review][Defer] GET list/selectors mutate DB via membership sync [SeasonParticipantService.kt:46-52] — Intentional per Dev Notes (sync on GET); note for future caching/perf tuning.
- [x] [Review][Defer] Admin DTO exposes normalized (lowercase) email [ParticipantDtos.kt:40] — Functional but differs from user-entered casing; cosmetic UX only.
- [x] [Review][Patch] Membres troupe route is inconsistent and legacy route was removed [apps/web/src/app/app.routes.ts:23, _bmad-output/planning-artifacts/ux-design-specification.md:100]
- [x] [Review][Patch] Troupe members route can authorize a season-only organizer against an arbitrary default season [apps/web/src/app/pages/admin-membres/admin-membres.ts:249]
- [x] [Review][Patch] Season permissions and participant selector loaders can write stale state after rapid season navigation [apps/web/src/app/pages/season-home/season-home.ts:240]
