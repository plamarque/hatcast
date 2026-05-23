# Story 3.5: Organizer delegation (season / event scope)

Status: done

<!-- Ultimate context engine analysis completed — comprehensive developer guide created -->

## Story

As a **troupe administrator**,  
I want to **configure who may act as organizer at season or event scope**,  
so that **organization responsibilities can be distributed without granting full admin rights** (**FR34**, **NFR-S2**).

## Acceptance Criteria

1. **Given** a troupe admin on a season they can manage, **when** they assign or revoke **season organizers** (V1: *Sélectionneur·se·s* / `roles.casters`), **then** the assignment is **persisted in Postgres**, returned by the API, and only **authorized managers** can mutate the list — **FR34**, **NFR-S2**.
2. **Given** a season admin (provisional rule: seed-troupe manager until epic-2), **when** they assign or revoke **event organizers** for a spectacle (V1: *Admin d'événement* / `eventAdmins`), **then** the assignment is **persisted on the event**, listed via API, and **event organizers cannot manage other event organizers** (V1 `canManageEventAdmins` — season admin only) — **FR34**.
3. **Given** a saved organizer configuration, **when** downstream permission checks run (`canManageComposition`, `canEditEvent`, future availability proxy), **then** the **effective organizer scope** follows V1 hierarchy:
   - **Season admin** (future epic-2; provisional: seed-troupe manager) → all organizer + admin powers on the season.
   - **Event organizer** → composition + edit **that event** only.
   - **Season organizer** → composition on **any event in the season**; **cannot** create events or manage organizer lists (V1 caster vs admin split).
   - **Manual slot fill** remains **admin-only** (season admin / event organizer / super admin — **not** season organizer alone); document in `OrganizerAccessService` for epic-6 — **SPEC** composition tab rules.
4. **Given** an admin UI entry point (season settings / spectacle edit), **when** the manager opens organizer management, **then** they can **search/add/revoke** organizers with **email or display name** autocomplete when a matching `users` row exists; otherwise show a clear error (user must have logged in once) — V1 parity [`SeasonAdminPage.vue`](../../legacy/src/views/SeasonAdminPage.vue).
5. **Given** list/detail event responses, **when** organizers are configured, **then** optional `organizerUserIds` or embedded summaries are exposed **only to callers allowed to see admin metadata** (provisional: same seed-troupe authenticated user); ordinary members must **not** receive other users’ emails via list endpoints — **NFR-S2**.
6. **Given** organizer mutations, **when** the API validates input, **then** duplicate assignments are idempotent (200/204), unknown user email → **404** or **400** with Problem Details, self-revoke of last season admin is **out of scope** (season admins = epic-2), revoking the **last** troupe manager is prevented if that rule exists — document chosen behaviour in tests.
7. **Couverture:** **FR34** ; prepares **FR17**, **FR19–FR23**, **FR26** (epics 5–6 consume permission service — **no** full composition/availability UI required in 3.5).

### Explicit placeholders (not blockers for 3.5 done)

- **Season admin CRUD** (full admin role, invitations, member list) — **epic-2** ; this story delivers **organizer** delegation only.
- **Composition / availability / audit UI** — epics **5–6**, **9** ; expose **`OrganizerAccessService`** + optional `permissions` flags on `GET /v1/auth/me` or season context endpoint.
- **Super Admin** platform operator — config stub (`hatcast.auth.super-admin-emails`) acceptable; full ADR-0005 port not required if documented.
- **Kebab menu role-gating** on event detail — wire **`canManageComposition`** boolean from API when epic-6 lands; 3.5 may add **stub** flags on season-home for tests.

## Context and slicing

| Story | Scope |
|-------|--------|
| **3.2–3.4 (done)** | Event CRUD, agenda, types/roles — **no** organizer model |
| **3.5 (this)** | Persist season/event organizers, admin UI, server-side permission service |
| **Epic 2** | Membership, season admins, player directory, troupe roles |
| **Epic 5–6** | Consume `OrganizerAccessService` for dispos/composition/proxy actions |
| **Story 3.6** | Historique — no direct dependency on organizers |

## Tasks / Subtasks

- [x] **Scope:** `apps/web/` + `services/api/` ; **do not modify** `legacy/` (reference only).
- [x] **Migration Flyway** `V8__season_and_event_organizers.sql`:
  - Table `season_organizers` (`season_id`, `user_id`, `granted_at`, `granted_by_user_id` nullable FK → `users`).
  - Table `event_organizers` (`event_id`, `user_id`, `granted_at`, `granted_by_user_id`).
  - Composite PK `(season_id, user_id)` / `(event_id, user_id)` ; `ON DELETE CASCADE` from parent season/event.
  - **No** backfill required (empty lists = V1 default).
- [x] **API domain:**
  - New package or extend `season` / `event`: entities, repositories, DTOs.
  - Endpoints (adjust paths to match existing controllers):
    - `GET/POST/DELETE /v1/seasons/{seasonId}/organizers`
    - `GET/POST/DELETE /v1/seasons/{seasonId}/events/{eventId}/organizers` (or `/v1/events/{eventId}/organizers` if season inferred).
  - Request body: `{ "email": "user@example.com" }` (resolve to `users.id`; normalize email lowercase trim — V1 parity).
  - Response item: `{ userId, email, displayName?, grantedAt }`.
  - **`OrganizerAccessService`** (Kotlin): port V1 checks from [`permissionService.js`](../../legacy/src/services/permissionService.js):
    - `canManageSeasonOrganizers(seasonId, user)`
    - `canManageEventOrganizers(eventId, seasonId, user)`
    - `isSeasonOrganizer(seasonId, user)` ← V1 `isSeasonCaster`
    - `isEventOrganizer(eventId, user)` ← V1 `isEventAdmin`
    - `canManageComposition(eventId, seasonId, user)`
    - `canEditEvent(eventId, seasonId, user)`
    - `canEditEvents(seasonId, user)` → provisional season admin only (seed manager until epic-2)
    - `canCasterEditManually(...)` → false for season-organizer-only users
  - Integrate **`TroupeAccessService.requireCanManageTroupe`** for mutations until epic-2 replaces with real admin matrix.
  - Register new paths in [`SecurityConfig.kt`](../../services/api/src/main/kotlin/com/hatcast/api/config/SecurityConfig.kt).
- [x] **OpenAPI:** extend [`openapi/seasons.yaml`](../../services/api/openapi/seasons.yaml) and/or [`openapi/events.yaml`](../../services/api/openapi/events.yaml) — organizer schemas + CRUD paths ; document 403/404.
- [x] **Angular:**
  - `apps/web/src/app/core/permissions/organizer-api.service.ts` (or extend season/event services).
  - **Season organizers panel:** new component e.g. `season-organizers-panel` — list, add (MatAutocomplete on users if endpoint exists, else MatInput email), revoke with confirm dialog.
  - **Entry point:** season header **settings** cog (story 3.3 placeholder) → route `/saison/:slug/admin/organizers` **or** MatDialog from season-home — Material admin style per [UX admin scope](../planning-artifacts/ux-design-hatcast-v2.md#admin-functional-scope).
  - **Event organizers:** expandable section in [`event-form-dialog`](../../apps/web/src/app/pages/season-home/event-form-dialog.ts) when **editing** an existing event (V1 expandable block in admin event list) ; show only if `canManageEventOrganizers`.
  - French UI labels (product): **« Organisateur·ices de saison »** and **« Organisateur·ices du spectacle »** ; helper text from V1 role descriptions (composition/draw/validate vs full admin).
- [x] **Optional endpoint:** `GET /v1/seasons/{seasonId}/permissions/me` returning `{ canManageSeasonOrganizers, canManageEventOrganizers, isSeasonOrganizer, eventOrganizerFor: [eventIds] }` to simplify Angular gating without N+1.
- [x] **Tests:**
  - API integration: add/list/revoke season + event organizers ; 403 for unauthorized ; duplicate add idempotent ; email not found → 404.
  - Unit: `OrganizerAccessService` matrix (table-driven) mirroring V1 scenarios (season org ≠ manual edit, event org can edit one event, etc.).
  - Component: season panel add/revoke ; event dialog organizer section visibility.
  - Regression: `./gradlew test`, `ng test`, `ng build` ; existing event/season tests green.

## Dev Notes

### Architecture & guardrails

- Monorepo V2: [ARCH.md](../../ARCH.md) ; REST/JSON: [architecture.md](../planning-artifacts/architecture.md) (camelCase DTOs, Flyway, OpenAPI source of truth).
- Auth: [ADR-0010](../../docs/adr/0010-v2-auth-identity-platform.md) ; mutations with `credentials: 'include'` + CSRF.
- Authorization boundary: enforce at **API** — Angular hides UI but must not be sole gate (**NFR-S2**, ADR-0005 spirit).
- UI admin surfaces: [ux-design — Admin functional scope](../planning-artifacts/ux-design-hatcast-v2.md#admin-functional-scope) — Material defaults OK.

### V1 reference model (port semantics, not Firestore)

| V1 concept | V1 storage | V2 proposal |
|------------|------------|-------------|
| Sélectionneur·se (season organizer) | `seasons/{id}.roles.casters[]` (emails) | `season_organizers` → `users.id` |
| Admin d'événement (event organizer) | `events/{id}.eventAdmins[]` (emails) | `event_organizers` → `users.id` |
| Admin de saison | `seasons/{id}.roles.admins[]` | **Epic-2** — not this story |
| Manage event organizers | Season admin only | `canManageEventOrganizers` |
| Manage season organizers | Season admin only | `canManageSeasonOrganizers` |

**Permission matrix (composition & edit)** — source [`permissionService.js`](../../legacy/src/services/permissionService.js):

| Action | Super admin | Season admin* | Event organizer | Season organizer |
|--------|-------------|---------------|-----------------|------------------|
| Manage season organizers | ✓ | ✓ | ✗ | ✗ |
| Manage event organizers | ✓ | ✓ | ✗ | ✗ |
| Create events (`canEditEvents`) | ✓ | ✓ | ✗ | ✗ |
| Edit event metadata | ✓ | ✓ | ✓ (own event) | ✗ |
| Manage composition (draw/validate) | ✓ | ✓ | ✓ (own event) | ✓ (all events in season) |
| Manual slot fill | ✓ | ✓ | ✓ | ✗ (`canCasterEditManually`) |

\*Until epic-2: provisional **seed-troupe authenticated manager** via `TroupeAccessService`.

### Downstream contract (implement service now)

Epics 5–6 **must call** `OrganizerAccessService` — do not duplicate email-list checks in controllers:

```kotlin
// Illustrative — services/api/.../OrganizerAccessService.kt
fun canManageComposition(eventId: UUID, seasonId: UUID, principal: SessionUserPrincipal): Boolean {
    if (isProvisionalSeasonAdmin(seasonId, principal)) return true
    if (isEventOrganizer(eventId, principal.userId)) return true
    if (isSeasonOrganizer(seasonId, principal.userId)) return true
    return isSuperAdmin(principal)
}
```

Expose the same rules to Angular via **`permissions/me`** or include booleans on event detail DTO when epic-6 needs kebab gating.

### Database shape

```sql
CREATE TABLE season_organizers (
    season_id UUID NOT NULL REFERENCES seasons (id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    granted_at TIMESTAMP NOT NULL,
    granted_by_user_id UUID REFERENCES users (id),
    PRIMARY KEY (season_id, user_id)
);

CREATE TABLE event_organizers (
    event_id UUID NOT NULL REFERENCES events (id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    granted_at TIMESTAMP NOT NULL,
    granted_by_user_id UUID REFERENCES users (id),
    PRIMARY KEY (event_id, user_id)
);

CREATE INDEX idx_event_organizers_user ON event_organizers (user_id);
CREATE INDEX idx_season_organizers_user ON season_organizers (user_id);
```

**Email vs user id:** store **`user_id` FK** only ; resolve email on POST via `UserRepository.findByEmailIgnoreCase`. Reject if user never registered — matches V2 Identity Platform flow (contrast V1 Firestore player emails).

### Existing blocks (reuse — do not reinvent)

| Subject | Location |
|---------|----------|
| Provisional troupe gate | [`TroupeAccessService.kt`](../../services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeAccessService.kt) |
| Season / event CRUD | [`SeasonService.kt`](../../services/api/src/main/kotlin/com/hatcast/api/season/SeasonService.kt), [`EventService.kt`](../../services/api/src/main/kotlin/com/hatcast/api/event/EventService.kt) |
| Users | [`UserEntity.kt`](../../services/api/src/main/kotlin/com/hatcast/api/user/UserEntity.kt), [`UserRepository.kt`](../../services/api/src/main/kotlin/com/hatcast/api/user/UserRepository.kt) |
| Event form (extend) | [`event-form-dialog.ts`](../../apps/web/src/app/pages/season-home/event-form-dialog.ts) |
| Season shell / header cog | [`season-header`](../../apps/web/src/app/pages/season-home/season-header.ts), [`season-home.ts`](../../apps/web/src/app/pages/season-home/season-home.ts) |
| Confirm dialog pattern | [`confirm-dialog`](../../apps/web/src/app/pages/seasons-list/confirm-dialog.ts) |
| V1 admin UX reference | [`SeasonAdminPage.vue`](../../legacy/src/views/SeasonAdminPage.vue) — roles column + per-event expandable organizers |
| V1 permission logic | [`permissionService.js`](../../legacy/src/services/permissionService.js) |
| Deferred access control | [`deferred-work.md`](./deferred-work.md) |

### UI behaviour (V1 parity)

1. **Season organizers section** — description: can run weighted draw, validate/invalidate composition, announce ; **cannot** name other organizers or create spectacles (unless also admin).
2. **Event organizers section** — visible on **edit** spectacle only ; expandable or always visible in dialog footer ; autocomplete filters **season participants** when player API exists — until epic-2, autocomplete from **`GET /v1/users/search?q=`** stub or manual email only with validation message.
3. **Revoke** — immediate API call + snackbar ; no cascade (removing season organizer does not remove event organizer rows).
4. **Settings entry** — wire season header cog to organizers admin (replace 3.3 placeholder).

### Migration / backward compatibility

- Existing events/seasons: empty organizer lists ; behaviour unchanged (only provisional seed admins can manage).
- Do **not** break event PATCH, agenda reload, or `scope=upcoming` from 3.3–3.4.

### Security & permissions

- Normalize emails **lowercase trim** on input (V1 [`addEventAdmin`](../../legacy/src/services/storage.js)).
- List endpoints: avoid leaking organizer emails to non-admin callers — return counts or omit field on member-facing list DTOs.
- CSRF on all POST/DELETE organizer routes.
- Document provisional rule in code + test: *authenticated + seed troupe manager = canManageSeasonOrganizers* until epic-2.

### Out of scope

- Season **admin** role assignment (distinct from organizer).
- Troupe membership, invitations, player profiles (epic-2).
- Composition, availability, audit trail implementation.
- Replacing `TroupeAccessService` entirely (epic-2 follow-up).

### Testing requirements

| Layer | What to test |
|-------|----------------|
| **API integration** | CRUD organizers ; 403 non-manager ; unknown email ; cascade delete season removes `season_organizers` |
| **Unit (Kotlin)** | `OrganizerAccessService` matrix ; email normalization |
| **Unit (TS)** | API client mapping ; dialog payload |
| **Component** | Add/revoke flows ; event dialog section gating |
| **Regression** | Event CRUD 3.2–3.4 ; season-home loads |

### Previous story intelligence

**From 3.4 (done):**
- Extend [`event-form-dialog`](../../apps/web/src/app/pages/season-home/event-form-dialog.ts) — already handles create/edit ; add organizer block in **edit** mode only.
- PATCH/`JsonNullable` patterns — organizer endpoints are separate resources (no PATCH on event for organizers list — use POST/DELETE for clarity).
- Review lesson: load persisted fields on edit (`templateType`) — load `eventOrganizers` when opening edit dialog.

**From 3.3 (done):**
- Season header **settings** cog is placeholder — **this story** should attach real navigation.
- Keep agenda/historique shell untouched except settings link.

**From 3.2 / 3.1 (done):**
- `TroupeAccessService` provisional gate — extend, do not bypass.
- Slug-based season routing — organizer admin routes use `:slug` + resolved `seasonId`.

### Git intelligence (recent commits)

- `533e58f` — event types + role slots ; event form dialog patterns to extend.
- `01bb2ae` — season agenda + admin toolbar area in [`season-agenda.html`](../../apps/web/src/app/pages/season-home/season-agenda.html).
- `b22a865` — PATCH JsonNullable ; prefer dedicated organizer sub-resources over PATCH lists.

### Latest tech notes

- **Angular 19+** standalone ; MatDialog, MatAutocomplete, MatChip for organizer lists.
- **Spring Boot 3 / Kotlin 2** — `@Transactional` on grant/revoke ; Problem Details for 403/404.
- **H2 tests** — use same migration V8 ; seed a second user in test fixtures for organizer assignment.

### Project context reference

- [Epics — Story 3.5](../planning-artifacts/epics.md)
- [PRD — FR34, NFR-S2](../planning-artifacts/prd.md)
- [SPEC — Administration capabilities](../../SPEC.md#administration--required-capabilities-v2-target)
- [DOMAIN — Admin glossary](../../DOMAIN.md)
- [ADR-0005 — Permission model (V1 observed)](../../docs/adr/0005-permission-model-super-admin-season.md)
- [Story 3.4](./3-4-types-devenement-et-roles-requis-optionnels.md)
- [Story 3.3](./3-3-vue-calendrier-agenda-saison-filtres-bascule-agenda-historique.md)
- [Deferred work](./deferred-work.md)

## Dev Agent Record

### Agent Model Used

GPT-5.5 (Cursor)

### Debug Log References

- `./gradlew test --tests 'com.hatcast.api.organizer.*'` — passed.
- `./gradlew test` — passed.
- `npm run test -w @hatcast/web` — passed (59 tests).
- `npm run build -w @hatcast/web` — passed.

### Completion Notes List

- Added Postgres organizer persistence with `season_organizers` and `event_organizers`, composite keys, FK cascade, and user-id based storage.
- Added `OrganizerAccessService` as the central V1-parity permission service for season organizers, event organizers, composition management, event edit rights, and manual slot editing rules.
- Added REST endpoints for season/event organizer list/add/revoke plus `GET /v1/seasons/{seasonId}/permissions/me`.
- Added Angular `OrganizerApiService`, a season organizers dialog launched from the season header settings entry, and an event-organizers section in edit mode of `event-form-dialog`.
- Added backend integration/unit tests and Angular service/component tests covering organizer CRUD, idempotent add, unknown-email handling, permission matrix, and UI loading/add flows.
- Product acceptance remains pending: delegation can only target existing `users` rows, so this story must be retested after epic-2 provides member/user addition or invitation UI.

### File List

- `_bmad-output/implementation-artifacts/3-5-delegation-des-organisateurs-perimetre-saison-evenement.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `apps/web/src/app/core/permissions/organizer-api.service.ts`
- `apps/web/src/app/core/permissions/organizer-api.service.spec.ts`
- `apps/web/src/app/pages/season-home/event-form-dialog.html`
- `apps/web/src/app/pages/season-home/event-form-dialog.scss`
- `apps/web/src/app/pages/season-home/event-form-dialog.spec.ts`
- `apps/web/src/app/pages/season-home/event-form-dialog.ts`
- `apps/web/src/app/pages/season-home/season-home.ts`
- `apps/web/src/app/pages/season-home/season-organizers-dialog.spec.ts`
- `apps/web/src/app/pages/season-home/season-organizers-dialog.ts`
- `services/api/openapi/events.yaml`
- `services/api/openapi/seasons.yaml`
- `services/api/src/main/kotlin/com/hatcast/api/organizer/OrganizerAccessService.kt`
- `services/api/src/main/kotlin/com/hatcast/api/organizer/OrganizerController.kt`
- `services/api/src/main/kotlin/com/hatcast/api/organizer/OrganizerEntities.kt`
- `services/api/src/main/kotlin/com/hatcast/api/organizer/OrganizerRepositories.kt`
- `services/api/src/main/kotlin/com/hatcast/api/organizer/dto/OrganizerDtos.kt`
- `services/api/src/main/kotlin/com/hatcast/api/user/UserRepository.kt`
- `services/api/src/main/resources/db/migration/V8__season_and_event_organizers.sql`
- `services/api/src/test/kotlin/com/hatcast/api/organizer/OrganizerAccessServiceTest.kt`
- `services/api/src/test/kotlin/com/hatcast/api/organizer/OrganizerControllerIntegrationTest.kt`

### Change Log

- 2026-05-23: Story 3.5 implemented — organizer delegation persistence, API, Angular admin UI, OpenAPI, and tests; story moved to review.
- 2026-05-23: Code review patches applied — permissions endpoint, UI gating, 403/cascade coverage, OpenAPI corrections; story moved to done.
- 2026-05-23: Story reopened to review pending product retest after epic-2 user/member addition capability.
- 2026-05-24: Checkpoint review accepted; product retest OK (epic-2 member UI + UX-DR10 organisateurs tab); story moved to done.

### Review Findings

- [x] [Review][Retest] Retester l’acceptation produit après livraison de l’UI d’ajout/invitation d’utilisateurs ou de membres (epic-2), car la délégation actuelle échoue légitimement si l’email n’existe pas encore dans `users`.
- [x] [Review][Retest] **UX-DR10 follow-up:** Season organizer UI moves from `SeasonOrganizersDialog` to Organisateur·ices tab on `/saison/:slug/admin/membres`. Retest organizer add/remove after Story 2.8.
- [x] [Review][Patch] `canManageEventOrganizers` absent de `MySeasonPermissionsDto` et du schéma OpenAPI [`OrganizerDtos.kt:39`](../../services/api/src/main/kotlin/com/hatcast/api/organizer/dto/OrganizerDtos.kt)
- [x] [Review][Patch] `/permissions/me` exige `requireCanManageTroupe` — inaccessible aux organisateurs délégués qui devraient pouvoir lire leurs propres flags [`OrganizerAccessService.kt:193`](../../services/api/src/main/kotlin/com/hatcast/api/organizer/OrganizerAccessService.kt)
- [x] [Review][Patch] Aucun test d'intégration 403 pour utilisateur non-manager sur les endpoints organisateurs [`OrganizerControllerIntegrationTest.kt`](../../services/api/src/test/kotlin/com/hatcast/api/organizer/OrganizerControllerIntegrationTest.kt)
- [x] [Review][Patch] Section organisateurs du `event-form-dialog` visible en mode édition sans garde `canManageEventOrganizers` [`event-form-dialog.html:97`](../../apps/web/src/app/pages/season-home/event-form-dialog.html)
- [x] [Review][Patch] Roue dentée réglages saison ouvre le dialogue sans vérifier `canManageSeasonOrganizers` [`season-home.ts:230`](../../apps/web/src/app/pages/season-home/season-home.ts)
- [x] [Review][Patch] Cascade delete `season_organizers` / `event_organizers` non couverte par les tests d'intégration [`OrganizerControllerIntegrationTest.kt`](../../services/api/src/test/kotlin/com/hatcast/api/organizer/OrganizerControllerIntegrationTest.kt)
- [x] [Review][Patch] Test composant absent : section organisateurs absente en mode `create` du `event-form-dialog` [`event-form-dialog.spec.ts`](../../apps/web/src/app/pages/season-home/event-form-dialog.spec.ts)
- [x] [Review][Patch] Branche 403 personnalisée morte dans `requireCanManageSeasonOrganizers` (double appel troupe) [`OrganizerAccessService.kt:252`](../../services/api/src/main/kotlin/com/hatcast/api/organizer/OrganizerAccessService.kt)
- [x] [Review][Patch] OpenAPI : réponse 403 manquante sur POST `/seasons/{seasonId}/organizers` [`seasons.yaml:243`](../../services/api/openapi/seasons.yaml)
- [x] [Review][Defer] Race condition check-then-insert sur grant concurrent (PK composite → possible 500) [`OrganizerAccessService.kt:110`] — deferred, pré-existant / faible probabilité
- [x] [Review][Defer] FK `granted_by_user_id` sans `ON DELETE SET NULL` — suppression utilisateur grantor bloquée [`V8__season_and_event_organizers.sql`] — deferred, pré-existant
- [x] [Review][Defer] N+1 potentiel sur chargement `user` dans listes organisateurs — deferred, pré-existant
- [x] [Review][Defer] Stub super-admin absent de `canManageComposition` (documenté epic-2 / config) [`OrganizerAccessService.kt:226`] — deferred, pré-existant
- [x] [Review][Defer] Validation email minimale (`contains("@")` seulement) [`OrganizerAccessService.kt:298`] — deferred, pré-existant
- [x] [Review][Defer] Flag `organizerSaving` partagé — clics rapides multi-retrait possibles [`event-form-dialog.ts:75`] — deferred, pré-existant
