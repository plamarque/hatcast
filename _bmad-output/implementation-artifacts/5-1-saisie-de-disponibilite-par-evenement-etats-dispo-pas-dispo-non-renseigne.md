# Story 5.1: Event availability entry (Dispo / Pas dispo / Non renseigné)

Status: done

<!-- Ultimate context engine analysis completed — comprehensive developer guide created -->

## Story

As a **linked participant** (troupe member with an active account),  
I want to **record my availability for each spectacle** using the three expected states,  
so that **organizers can plan attendance** (**FR15**, **UX-DR3**).

## Acceptance Criteria

1. **Given** an upcoming spectacle in a season I belong to (active `troupe_membership` for the season’s troupe), **when** I open the **availability dialog** from the agenda dispo badge (**MatDialog**, **UX-DR3**), **then** I can choose **Dispo**, **Pas dispo**, or **Non renseigné** and **save** — **FR15**.
2. **Given** the dialog is open for **my own** availability, **when** the header renders, **then** the title is **« Disponibilité de &lt;prénom&gt; »** using my troupe display name (or account name fallback) — **UX-DR3**.
3. **Given** the dialog, **when** it opens, **then** it shows the **event title** (bold) and **formatted date** (Europe/Paris, French locale) in a context block below the title — **UX-DR3**.
4. **Given** the three primary buttons, **when** one is selected, **then** it is **visually distinct** (green / red / grey, checkmark on active choice, feedback sentence under buttons for Pas dispo and Non renseigné) — **UX-DR3**, **NFR-A1**.
5. **Given** I choose **Dispo** or **Pas dispo** and save, **when** the API persists, **then** my status is stored and returned as **`available`** or **`unavailable`** respectively.
6. **Given** I choose **Non renseigné** and save, **when** the API persists, **then** any existing row for `(eventId, myUserId)` is **deleted** (unknown = **no record**, V1 parity) — see [`saveAvailabilityWithRoles`](../../legacy/src/services/storage.js).
7. **Given** a saved availability, **when** I reopen the dialog or reload the agenda, **then** the **current state** is pre-selected correctly.
8. **Given** the season **Agenda** (story **3.3**), **when** events load for an authenticated member, **then** each card’s dispo badge reflects **Dispo** / **Pas dispo** / **Non renseigné** dynamically (replace hardcoded placeholder in [`season-agenda.html`](../../apps/web/src/app/pages/season-home/season-agenda.html)).
9. **Given** I tap the dispo badge on an agenda card, **when** the click is handled, **then** the availability dialog opens **without** navigating to event detail (`stopPropagation` on badge) — card body click still opens event detail.
10. **Given** I am **not** authenticated or have **no active membership** for the season’s troupe, **when** I view the agenda, **then** dispo badges are **hidden** or non-interactive (no dialog).
11. **Given** keyboard use, **when** the dialog opens, **then** focus moves to the dialog, the three choices are reachable by Tab, and Escape closes the dialog — **NFR-A1**.
12. **Couverture:** **FR15** ; **UX-DR3** ; **NFR-A1** ; prepares **FR16–FR19** (later stories add roles, comment, org views, proxy).

### Explicit out of scope (later stories — do not implement in 5.1)

| Story | Deferred capability |
|-------|---------------------|
| **5.2** | Role-level candidacy when Dispo ; preferred-role pre-check |
| **5.3** | Organizer Dispos tab, Moi/Tous, per-role grids |
| **5.4** | Optional comment field (500 chars) |
| **5.5** | Proxy availability for another participant + audit actor |
| **3.8** | Full season/event participant roster (name-only, event-only) |
| **6.2** | Full-screen event detail with Dispos tab |

## Context and slicing

| Story | Scope |
|-------|--------|
| **3.3–3.4 (done)** | Agenda shell, event CRUD, `templateType` / `roleSlots` |
| **3.5 (done)** | `OrganizerAccessService` — not needed for self-edit in 5.1 |
| **3.8 (backlog, not in sprint)** | Participant rosters — **ideal prerequisite** per epics ; see **Interim participant model** below |
| **5.1 (this)** | Three-state availability persistence + MatDialog + agenda badges (self only) |
| **5.2–5.5** | Extend same table/API with roles, comment, org views, proxy |
| **6.2** | Event detail Dispos tab reuses modal semantics |

## Interim participant model (Story 3.8 not yet implemented)

Epics require **Story 3.8** before 5.1–5.5 for full **participant** identity (FR43–FR45). **3.8 is not in `sprint-status.yaml` and has no code.**

**Approved interim for 5.1 MVP:**

- Subject key = **`user_id`** of the authenticated session user.
- Authorization = active **`troupe_membership`** for the season’s **`troupe_id`** (same gate as season access).
- Covers **linked troupe members** (primary MVP audience).
- **Do not** implement name-only or event-only participants in 5.1.

**Forward compatibility (document in migration + service):**

- Table column comment or nullable `participant_id UUID` reserved for 3.8 migration.
- When 3.8 lands, availability rows migrate from `user_id` → `participant_id` for linked members; API paths may gain `/participants/{participantId}` while keeping `/me` as alias.

## Tasks / Subtasks

- [x] **Scope:** `apps/web/` + `services/api/` ; **do not modify** `legacy/` (reference only).
- [x] **Migration Flyway** `V15__event_availability.sql`:
  - Table `event_availability`:
    - `event_id UUID NOT NULL REFERENCES events (id) ON DELETE CASCADE`
    - `user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE`
    - `status VARCHAR(16) NOT NULL` — check `IN ('AVAILABLE', 'UNAVAILABLE')`
    - `created_at`, `updated_at TIMESTAMP NOT NULL`
    - `PRIMARY KEY (event_id, user_id)`
  - Index `idx_event_availability_user` on `(user_id)` for bulk “my dispos” queries.
  - **No** `roles` or `comment` columns yet (5.2 / 5.4).
- [x] **API domain** — new package `com.hatcast.api.availability`:
  - `EventAvailabilityEntity`, `EventAvailabilityRepository`, `AvailabilityService`, `AvailabilityController`.
  - Endpoints (adjust to match existing controller style):
    - `GET /v1/seasons/{seasonId}/events/{eventId}/availability/me` → `{ status: "available" | "unavailable" | "unknown", updatedAt? }` (`unknown` = no row).
    - `PUT /v1/seasons/{seasonId}/events/{eventId}/availability/me` — body `{ status: "available" | "unavailable" | "unknown" }` ; `unknown` → DELETE row ; idempotent PUT.
    - **Agenda bulk:** extend `GET /v1/seasons/{seasonId}/events` (existing list) with optional field **`myAvailabilityStatus`** on each event when caller is authenticated member — avoids N+1. Values: `"available" | "unavailable" | "unknown"`.
  - Authorization:
    - Read/write **own** availability: authenticated + active troupe membership for season’s troupe + event belongs to season + event not archived (optional: allow past events for correction — **match V1**: allow edit on any non-deleted event in season).
    - Reject 403 for non-members ; 404 for wrong season/event.
  - Register paths in [`SecurityConfig.kt`](../../services/api/src/main/kotlin/com/hatcast/api/config/SecurityConfig.kt).
- [x] **OpenAPI:** new fragment [`openapi/availability.yaml`](../../services/api/openapi/availability.yaml) or extend [`openapi/events.yaml`](../../services/api/openapi/events.yaml) — schemas `AvailabilityStatus`, `MyAvailabilityResponse`, `SetMyAvailabilityRequest` ; document 403/404.
- [x] **Wire stats stub:** extend [`StubMemberProfileStatsProvider.kt`](../../services/api/src/main/kotlin/com/hatcast/api/avatar/StubMemberProfileStatsProvider.kt) or add real counts later — **optional in 5.1**: return non-null empty stats only if trivial; otherwise leave stub (2.7 empty state already honest).
- [x] **Angular:**
  - `apps/web/src/app/core/availability/availability-api.service.ts` — mirror [`event-api.service.ts`](../../apps/web/src/app/core/events/event-api.service.ts) (`credentials: 'include'`, `csrfHeaders` on PUT).
  - `apps/web/src/app/shared/availability/availability-dialog.ts` (+ html/scss) — **MatDialog**:
    - Input `MAT_DIALOG_DATA`: `{ seasonId, eventId, eventTitle, eventStartsAt, subjectDisplayName, initialStatus }`.
    - Three buttons (Dispo / Pas dispo / Non renseigné) — port interaction from [`AvailabilityForm.vue`](../../legacy/src/components/AvailabilityForm.vue) **lines 1–63 only** (no roles, no comment).
    - Feedback strings (second person): *« Tu n'as pas renseigné de dispo. »* / *« Tu n'es pas disponible pour cet événement. »*
    - Save on button click (immediate persist, V1 pattern) or explicit Save — **prefer immediate save on choice** like V1 for fewer steps.
    - `cdkFocusInitial` on first button or dialog title ; `autoFocus` per Material dialog config.
  - **Agenda integration** in [`season-agenda`](../../apps/web/src/app/pages/season-home/season-agenda.html):
    - Replace hardcoded « Non renseigné » with dynamic label + modifier classes (`--available`, `--unavailable`, `--unknown`).
    - Badge click → open dialog ; `@click.stop` on badge.
    - Pass `myAvailabilityStatus` from parent when events loaded (extend [`season-home.ts`](../../apps/web/src/app/pages/season-home/season-home.ts) event fetch).
  - **SCSS:** extend [`season-agenda.scss`](../../apps/web/src/app/pages/season-home/season-agenda.scss) badge colours (green/red/grey) — align UX-DR3 tokens.
- [x] **Tests:**
  - API integration: set available/unavailable/unknown ; GET reflects state ; unknown after delete ; 403 non-member ; list includes `myAvailabilityStatus`.
  - Unit: `AvailabilityService` status mapping.
  - Component: dialog renders three states ; save calls API ; badge opens dialog.
  - **NFR-Q1:** at least one automated test covering FR15 path (auth + PUT + GET).
  - Regression: `./gradlew test`, `ng test`, `ng build`.

## Dev Notes

### Architecture & guardrails

- Monorepo V2: [ARCH.md](../../ARCH.md) ; REST/JSON: [architecture.md](../planning-artifacts/architecture.md) (camelCase DTOs, Flyway, OpenAPI source of truth).
- Auth: [ADR-0010](../../docs/adr/0010-v2-auth-identity-platform.md) ; mutations with `credentials: 'include'` + CSRF.
- Authorization at **API** — Angular hides badges but must not be sole gate (**NFR-S2**).
- UI mood: dark navy modal, dimmed backdrop — [ux-design — Availability modal](../planning-artifacts/ux-design-hatcast-v2.md#pattern-availability-modal-overlay).
- Reference screenshot: [`ux-references/availability-modal-v1.png`](../planning-artifacts/ux-references/availability-modal-v1.png).

### V1 reference model (port semantics, not Firestore)

| V1 concept | V1 storage | V2 (5.1 interim) |
|------------|------------|------------------|
| Player availability | `seasons/{id}/players/{playerId}/availability/{eventId}` | `event_availability` row |
| Dispo | `{ available: true, roles: [], comment }` | `status = AVAILABLE` (roles empty until 5.2) |
| Pas dispo | `{ available: false, … }` | `status = UNAVAILABLE` |
| Non renseigné | **document deleted** | **row deleted** ; API returns `unknown` |
| Subject | `playerId` (season player) | **`user_id`** until Story 3.8 `participant_id` |

**V1 UI reference (copy structure, not Vue code):**

| Component | Path |
|-----------|------|
| Modal shell | [`legacy/src/components/AvailabilityModal.vue`](../../legacy/src/components/AvailabilityModal.vue) |
| Three buttons + feedback | [`legacy/src/components/AvailabilityForm.vue`](../../legacy/src/components/AvailabilityForm.vue) (ignore roles/comment blocks) |
| Cell/badge colours | [`legacy/src/components/AvailabilityCell.vue`](../../legacy/src/components/AvailabilityCell.vue) |
| Semantics helpers | [`legacy/src/services/playerAvailabilityService.js`](../../legacy/src/services/playerAvailabilityService.js) |

### Three-state semantics (do not invent a fourth)

```typescript
// API / UI enum mapping — apps/web/src/app/core/availability/availability-status.ts
export type AvailabilityStatus = 'available' | 'unavailable' | 'unknown'

// Persistence rule:
// available   → UPSERT status AVAILABLE
// unavailable → UPSERT status UNAVAILABLE
// unknown     → DELETE row (never store UNKNOWN in DB)
```

### Database shape

```sql
CREATE TABLE event_availability (
    event_id UUID NOT NULL REFERENCES events (id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    status VARCHAR(16) NOT NULL CHECK (status IN ('AVAILABLE', 'UNAVAILABLE')),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    PRIMARY KEY (event_id, user_id)
);

CREATE INDEX idx_event_availability_user ON event_availability (user_id);
-- participant_id UUID NULL  -- add in Story 3.8 migration when rosters exist
```

### Existing blocks (reuse — do not reinvent)

| Subject | Location |
|---------|----------|
| Event list + agenda | [`season-home.ts`](../../apps/web/src/app/pages/season-home/season-home.ts), [`season-agenda.html`](../../apps/web/src/app/pages/season-home/season-agenda.html) |
| MatDialog pattern | [`member-profile-dialog.ts`](../../apps/web/src/app/shared/member-profile/member-profile-dialog.ts), [`event-form-dialog.ts`](../../apps/web/src/app/pages/season-home/event-form-dialog.ts) |
| CSRF + fetch | [`csrfHeaders`](../../apps/web/src/app/core/http/hatcast-csrf.ts), [`event-api.service.ts`](../../apps/web/src/app/core/events/event-api.service.ts) |
| Troupe membership gate | [`TroupeMembershipService.kt`](../../services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeMembershipService.kt), [`MemberProfileService.kt`](../../services/api/src/main/kotlin/com/hatcast/api/memberprofile/MemberProfileService.kt) |
| Event domain | [`EventService.kt`](../../services/api/src/main/kotlin/com/hatcast/api/event/EventService.kt), [`EventEntity.kt`](../../services/api/src/main/kotlin/com/hatcast/api/event/EventEntity.kt) |
| Organizer permissions (future proxy) | [`OrganizerAccessService.kt`](../../services/api/src/main/kotlin/com/hatcast/api/organizer/OrganizerAccessService.kt) — **do not** use for self-edit in 5.1 |
| Role slots (5.2 prep only) | [`event-types.ts`](../../apps/web/src/app/core/events/event-types.ts) — **do not** show role UI in 5.1 |
| Empty stats message | [`member-profile-dialog`](../../apps/web/src/app/shared/member-profile/member-profile-dialog.html) — unchanged until stats wired |

### UI behaviour (5.1 only)

1. **Entry point:** agenda dispo badge only (not event detail — 6.2).
2. **Title:** « Disponibilité de {{ displayName }} » — use membership display name from session context or profile API.
3. **Save:** immediate on button tap (V1) ; close dialog on success ; snackbar on error.
4. **Badge labels:** « Dispo » / « Pas dispo » / « Non renseigné » (French product copy).
5. **Composition badge:** leave placeholder dashed badge unchanged (Epic 6).

### Downstream contract (implement API shape now)

Stories **5.2–5.5** and **6.2** will extend the same table/service:

- **5.2:** add `role_keys TEXT[]` or JSON column ; validate against `events.role_slots`.
- **5.4:** add `comment VARCHAR(500)`.
- **5.5:** PUT for `(eventId, participantId)` + `recorded_by_user_id` audit column.
- **5.3 / 6.2:** list endpoints for organizers aggregating by role.

Keep service methods **composable** — e.g. `AvailabilityService.setMyStatus(...)` now ; `setForParticipant(...)` in 5.5.

### Security & permissions

- Only **self** write in 5.1 (`/availability/me`).
- Verify `event.seasonId` matches path ; verify season’s troupe matches membership.
- Do not expose other members’ availability in 5.1 (5.3 adds org views).
- CSRF on PUT ; session cookie auth per ADR-0010.

### Testing requirements

| Layer | What to test |
|-------|----------------|
| API integration | Happy path three states ; idempotent PUT ; DELETE on unknown ; 403 outsider ; list field `myAvailabilityStatus` |
| Service unit | Status ↔ entity mapping ; unknown = absent row |
| Angular component | Dialog opens with context ; buttons update selection ; API called with correct status |
| A11y smoke | Dialog focus trap ; Escape closes ; buttons keyboard-operable |
| Regression | Existing event/agenda/organizer tests green |

### Previous story intelligence (Epic 3 — patterns to copy)

From **3.4** and **3.5** (both **done**):

1. Flyway migration → entity → service → controller → OpenAPI → Angular service → UI → integration tests.
2. Extend existing list DTOs rather than new page loads where possible (3.4 extended event responses).
3. French UI labels ; Material components ; no legacy edits.
4. Table-driven permission tests (3.5) — apply similar matrix for membership vs non-member in 5.1.

From **2.7**: honest empty states — profile stats may stay null until Epic 5+6 aggregate.

### Git intelligence (recent work)

Recent commits (`feat(member-profile)`, `feat(avatar)`, `feat(troupe)`) reinforce:

- Package layout under `apps/web/src/app/core/*` for API services.
- Shared dialogs under `apps/web/src/app/shared/*`.
- Kotlin feature packages per domain under `services/api/src/main/kotlin/com/hatcast/api/`.
- Integration tests colocated in `src/test/kotlin/...`.

### Latest tech notes

- **Angular 21** + **Angular Material** `MatDialog` — use standalone components (existing pattern).
- **Spring Boot 3.x** + **Flyway** — next migration **V14** after V13.
- **PostgreSQL / Neon** — enum as `VARCHAR` + CHECK (matches project style in V7/V8).
- No new npm/Maven dependencies expected for 5.1.

### Project context reference

- [SPEC.md](../../SPEC.md) — availability popup entry via event surfaces ; deep link `showAvailability=true` deferred to 6.2.
- [DOMAIN.md](../../DOMAIN.md) — Availability entity (schema ambiguity noted — this story defines V2 canonical shape).
- [epics.md](../planning-artifacts/epics.md) — Epic 5 overview, Story 5.1 AC, Story 3.8 dependency note.

## Dev Agent Record

### Agent Model Used

Composer

### Debug Log References

- Migration numbered **V15** (V14 already used by `season_and_event_participants`).
- Stats stub left unchanged (optional task).

### Completion Notes List

- Implemented three-state availability (`available` / `unavailable` / `unknown`) with DB row delete on `unknown` (V1 parity).
- API: `GET/PUT .../availability/me` + `myAvailabilityStatus` on event list (no N+1).
- Angular: MatDialog with immediate save on choice, agenda badges (green/red/grey), stopPropagation on badge click.
- Tests: `AvailabilityControllerIntegrationTest` (FR15 auth+PUT+GET path), `AvailabilityStatusMapperTest`, `availability-dialog.spec.ts`.
- Regression: `./gradlew test` (161), `ng test --no-watch` (141), `ng build` OK.

### File List

- services/api/src/main/resources/db/migration/V15__event_availability.sql
- services/api/src/main/kotlin/com/hatcast/api/availability/EventAvailabilityEntity.kt
- services/api/src/main/kotlin/com/hatcast/api/availability/EventAvailabilityRepository.kt
- services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityStatusMapper.kt
- services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityService.kt
- services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityController.kt
- services/api/src/main/kotlin/com/hatcast/api/availability/dto/AvailabilityDtos.kt
- services/api/src/main/kotlin/com/hatcast/api/event/dto/EventDtos.kt
- services/api/src/main/kotlin/com/hatcast/api/event/EventService.kt
- services/api/openapi/availability.yaml
- services/api/openapi/events.yaml
- services/api/src/test/kotlin/com/hatcast/api/availability/AvailabilityStatusMapperTest.kt
- services/api/src/test/kotlin/com/hatcast/api/availability/AvailabilityControllerIntegrationTest.kt
- services/api/src/test/kotlin/com/hatcast/api/event/EventServiceUpdateTest.kt
- apps/web/src/app/core/availability/availability-status.ts
- apps/web/src/app/core/availability/availability-api.service.ts
- apps/web/src/app/core/events/event-api.service.ts
- apps/web/src/app/shared/availability/availability-dialog.ts
- apps/web/src/app/shared/availability/availability-dialog.html
- apps/web/src/app/shared/availability/availability-dialog.scss
- apps/web/src/app/shared/availability/availability-dialog.spec.ts
- apps/web/src/app/pages/season-home/season-agenda.ts
- apps/web/src/app/pages/season-home/season-agenda.html
- apps/web/src/app/pages/season-home/season-agenda.scss
- apps/web/src/app/pages/season-home/season-home.ts
- apps/web/src/app/pages/season-home/season-home.html

### Change Log

- 2026-05-24: Story 5.1 — event availability persistence, API endpoints, agenda badges, MatDialog UI, tests.

### Review Findings

- [x] [Review][Patch] Activation clavier du badge peut déclencher l’ouverture du détail événement [apps/web/src/app/pages/season-home/season-agenda.html:35]
- [x] [Review][Patch] La règle UI `canEditAvailability` n’encode pas explicitement l’adhésion active de troupe attendue par AC10 [apps/web/src/app/pages/season-home/season-home.ts:148]
- [x] [Review][Patch] Couverture de tests incomplète pour le flux badge disponibilité (ouverture, propagation clavier/clic, et mise à jour locale) [apps/web/src/app/pages/season-home/season-agenda.ts:47]

## References

- [Source: _bmad-output/planning-artifacts/epics.md — Story 5.1](../planning-artifacts/epics.md)
- [Source: _bmad-output/planning-artifacts/ux-design-hatcast-v2.md — Availability modal](../planning-artifacts/ux-design-hatcast-v2.md#pattern-availability-modal-overlay)
- [Source: _bmad-output/planning-artifacts/architecture.md](../planning-artifacts/architecture.md)
- [Source: _bmad-output/implementation-artifacts/3-4-types-devenement-et-roles-requis-optionnels.md](./3-4-types-devenement-et-roles-requis-optionnels.md)
- [Source: _bmad-output/implementation-artifacts/3-5-delegation-des-organisateurs-perimetre-saison-evenement.md](./3-5-delegation-des-organisateurs-perimetre-saison-evenement.md)
- [Source: legacy/src/components/AvailabilityForm.vue](../../legacy/src/components/AvailabilityForm.vue)
- [Source: legacy/src/services/storage.js — saveAvailabilityWithRoles](../../legacy/src/services/storage.js)
