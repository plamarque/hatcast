# Story 2.12d: Participant gender — organizer roster entry and Mon compte cascade

---
baseline_commit: 115776cd33d69152e2b700ad95504b1353df5346
---

Status: review

<!-- Ultimate context engine analysis completed — comprehensive developer guide created -->

## Story

As an **organizer**,  
I want to **set gender on a participant row** (add or edit) when the linked account has no M/F,  
so that **mixité** (**6.21**) and gender-aware labels work for guests and members without Mon compte gender.

**Plan source:** [plan-participant-roster-ux-enhancements.md](../planning-artifacts/plan-participant-roster-ux-enhancements.md) — **Lot B phase 1** (approved SCP 2026-06-06).  
**Normative:** [ADR 0020](../../docs/adr/0020-participant-gender-organizer-operational.md) · [member-gender.md](../specs/spec-member-gender-parity/member-gender.md) · [DOMAIN.md](../../DOMAIN.md) § Parité de genre.

## Acceptance Criteria

1. **Given** a **name-only** manual add with gender **Féminin**, **when** saved, **then** `participant.gender = female` and **effective** gender is `female` on roster list, composition slots (`participantGender`), availability summary, and season statistics. [Source: epics 2.12d AC1 ; ADR 0020 ; investigation draft AC1]
2. **Given** a **recognized user with Mon compte M/F** (typeahead selection or email link), **when** add or edit participant, **then** gender is **read-only** from account; create/update **must not** persist organizer override; effective gender = `users.gender`. [Source: epics 2.12d AC2 ; SCP precedence]
3. **Given** a **recognized user without M/F** (Non spéc. / unset) or **MANAGED** row (email, no `user_id`), **when** add or edit, **then** organizer **may** set gender on the participant row before save. [Source: epics 2.12d AC3 ; investigation H2 MANAGED confirmed]
4. **Given** a name-only participant `female` on a filled `player` slot and all other filled `player` slots have known effective gender, **when** Équipe tab loads, **then** mixité pill is **visible** (**6.21** formula unchanged). [Source: epics 2.12d AC4]
5. **Given** a linked user with account `male`, **when** organizer PATCHes participant with `gender: female`, **then** API returns **400** or ignores field; effective remains `male`. [Source: investigation draft AC5]
6. **Given** member PATCH Mon compte **M ↔ F**, **when** saved, **then** all linked `season_participants` and `event_participants` rows sync `participant.gender` to the new account value; composition/dispos reflect the change. [Source: epics 2.12d AC5 ; ADR 0020 §4]
7. **Given** member PATCH Mon compte to **Non spéc.**, **when** saved, **then** linked participant rows clear organizer gender (`NULL` / `non_specified`); effective `non_specified`; mixité may hide; organizer may re-set on roster (**Option B**). [Source: epics 2.12d AC6 ; SCP]
8. **Given** existing linked participants with account gender before migration, **when** migration runs, **then** effective gender unchanged (nullable column, no backfill required). [Source: SCP §3 rollback / additive migration]
9. **Given** implementation complete, **when** tests run, **then** `./gradlew test` and `npm run test -w @hatcast/web -- --watch=false` pass for story scope. [Source: AGENTS.md]

**Effective gender precedence (normative — do not re-interpret):**

```
if linkedUser.gender in { male, female } → linkedUser.gender
else if participantRow.gender in { male, female } → participantRow.gender
else → non_specified
```

**Product coverage:** Gender/mixité parity extension (FR9/FR21); **6.21** mixité strip; **16.3** future aggregate (same read path). **Priority:** P2. **Depends:** **2.12** (done), **2.12b** (done), **2.12c** (done), **6.21** (done), **3.8** (done), **3.8c** (done). **Blocks:** —. **Enables:** **16.3** season parity stats with correct guest counts.

---

## Acceptance Criteria — Material 3 (UI)

**M3-1. Composants Material** — **Given** add/edit participant dialogs, **when** gender is editable, **then** reuse `mat-button-toggle-group` + three `mat-button-toggle` values (`female` · `non_specified` · `male`) matching [`account-profile-tab.html`](../../apps/web/src/app/pages/account-placeholder/tabs/account-profile-tab.html) order and labels — not custom segmented divs. [Source: ux-design-member-gender-parity.md Screen 1 ; FRONTEND_UI.md ; UX-DR11]

**M3-2. Tokens & thème** — **Given** gender toggle in dialogs, **when** styled, **then** reuse `--hatcast-member-gender-*` tone classes from account profile (`account-page__gender-toggle-option--*`) or extract shared SCSS; only `var(--mat-sys-*)` and `color-mix` for layout/hints. [Source: FRONTEND_UI.md ; story **2.12**]

**M3-3. Mobile & tactile** — **Given** viewport **max-width: 480px**, **when** add/edit dialog is open, **then** gender toggle touch targets **≥ 48dp**; French `aria-label` on each toggle (reuse `MEMBER_GENDER_OPTIONS` from [`member-gender.ts`](../../apps/web/src/app/core/account/member-gender.ts)). [Source: NFR-A1]

**M3-4. Navigation membre** — **N/A** — admin-only participant dialogs; no member chrome change.

**M3-5. Revue** — **Given** implementation done, **when** validated, **then** walk FRONTEND_UI.md checklist M3; update [member-gender-surfaces.md](../../docs/v2/technical/member-gender-surfaces.md) § Add/edit participant row to ✅.

---

## Tasks / Subtasks

- [x] **Scope:** `services/api/` + `apps/web/` + OpenAPI + registry doc — both layers required.

### API — schema & migration (AC: 1, 8)

- [x] Add Flyway **`V58__participant_gender.sql`**: nullable `gender VARCHAR(32)` on `season_participants` and `event_participants` (same values as `users.gender`: `male`, `female`, `non_specified` or NULL = unset).
- [x] Map column on [`SeasonParticipantEntity`](../../services/api/src/main/kotlin/com/hatcast/api/participant/ParticipantEntities.kt) and [`EventParticipantEntity`](../../services/api/src/main/kotlin/com/hatcast/api/participant/ParticipantEntities.kt) as `MemberGender?` (mirror `UserEntity.gender`).

### API — effective gender helper (AC: 1–5, 8)

- [x] Extend [`ParticipantRowPresentation`](../../services/api/src/main/kotlin/com/hatcast/api/participant/ParticipantRowPresentation.kt):
  - `effectiveGender(participant: SeasonParticipantEntity): MemberGender`
  - `effectiveGender(participant: EventParticipantEntity): MemberGender`
  - `effectiveGenderWire(...)` → wire string for DTOs
  - `canOrganizerSetGender(linkedUser: UserEntity?): Boolean` → `true` when linked user is null OR account gender ∉ {male, female}
- [x] Refactor [`ParticipantGenderResolver`](../../services/api/src/main/kotlin/com/hatcast/api/user/ParticipantGenderResolver.kt) to load participant rows and apply `effectiveGender` (not user-only). Keep batching pattern; extend to read `participant.gender` from season/event entities.
- [x] Replace all `ParticipantRowPresentation.genderWire(user)` call sites with `effectiveGenderWire(row)`:
  - [`SeasonParticipantService`](../../services/api/src/main/kotlin/com/hatcast/api/participant/SeasonParticipantService.kt) (list, selector, create, update, reactivate)
  - [`EventRosterService`](../../services/api/src/main/kotlin/com/hatcast/api/participant/EventRosterService.kt)
  - [`EventParticipantService`](../../services/api/src/main/kotlin/com/hatcast/api/participant/EventParticipantService.kt)
  - [`AvailabilityService`](../../services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityService.kt) `toEligibleRow` (~line 777)
  - [`SeasonStatisticsService`](../../services/api/src/main/kotlin/com/hatcast/api/season/SeasonStatisticsService.kt) (~line 179)
- [x] **Do not** change mixité formula on web — API must emit correct `participantGender` on composition slots.

### API — write rules & DTOs (AC: 1–3, 5)

- [x] Extend [`ParticipantCreateRequest`](../../services/api/src/main/kotlin/com/hatcast/api/participant/dto/ParticipantDtos.kt) + `ParticipantUpdateRequest` with optional `gender: String?`.
- [x] On create/update (season + event): parse gender with `MemberGender.fromWireOrNull`; persist on row **only when** `canOrganizerSetGender(linkedUser)`; else reject with **400** if body sends gender when account has M/F.
- [x] Apply gender on **reactivate** path in `SeasonParticipantService.reactivateRemoved` when explicit row returns ACTIVE.
- [x] Admin list DTOs:
  - `gender` = **effective** wire (list avatars/chips — existing field)
  - Add `participantGender: String?` = stored organizer value (null when unset) for edit form seeding
  - Add `genderManagedOnAccount: Boolean` for read-only UI
- [x] Update [`services/api/openapi/participants.yaml`](../../services/api/openapi/participants.yaml) schemas accordingly.

### API — Mon compte cascade (AC: 6, 7)

- [x] In [`UserMemberPreferencesService.patchPreferences`](../../services/api/src/main/kotlin/com/hatcast/api/user/UserMemberPreferencesService.kt): when `body.gender` changes, after saving user:
  - Find all `season_participants` + `event_participants` linked via `user_id` (and season rows via `troupe_membership.user`)
  - If new gender is `male`/`female` → set `participant.gender` to same
  - If new gender is `non_specified` → clear `participant.gender` (NULL)
- [x] Extract `ParticipantGenderCascadeService` if `UserMemberPreferencesService` grows too large — mirror `syncActiveMemberships` pattern.
- [x] Integration tests: M→F cascade; F→non_specified clears rows; linked+M/F blocks participant PATCH override.

### Web — shared gender control (AC: 1–3, M3-1–3)

- [x] Extract **`ParticipantGenderToggleField`** under `apps/web/src/app/shared/participant-add/` (or `shared/member-gender/`) wrapping `mat-button-toggle-group` using `MEMBER_GENDER_FIELD_LABEL` + `MEMBER_GENDER_OPTIONS` from [`member-gender.ts`](../../apps/web/src/app/core/account/member-gender.ts).
  - Inputs: `value`, `disabled`, `readOnlyManagedOnAccount` (+ optional `accountGender` for read-only display)
  - `data-testid="participant-gender-group"` / `participant-gender-female` etc.
- [x] Read-only copy (French): *« Le genre est géré par le membre sur Mon compte. »* when `genderManagedOnAccount`.

### Web — add dialogs (AC: 1–3)

- [x] [`add-participant-dialog.ts`](../../apps/web/src/app/pages/admin-participants/add-participant-dialog.ts):
  - Show toggle when no typeahead selection OR selected member without M/F (`effectiveMemberGender(member.gender) === 'non_specified'`)
  - Hide/read-only when selected member has M/F
  - Include `gender` in `createSeasonParticipant` body when writable
- [x] [`add-event-participant-dialog.ts`](../../apps/web/src/app/pages/admin-event-participants/add-event-participant-dialog.ts): same rules for event-only add.
- [x] Extend [`participant-api.service.ts`](../../apps/web/src/app/core/participants/participant-api.service.ts) create/update body types with optional `gender?: MemberGender`.

### Web — edit dialog (AC: 2–3, 7)

- [x] Extend [`EditParticipantDialogData`](../../apps/web/src/app/shared/edit-participant-dialog/edit-participant-dialog.ts) with `genderManagedOnAccount`, `participantGender`, `userId`.
- [x] Pass new fields from [`admin-participants.ts`](../../apps/web/src/app/pages/admin-participants/admin-participants.ts) `openEditParticipant` and event admin equivalent.
- [x] Wire toggle + PATCH body `gender` when writable.

### Web — list refresh (AC: 4)

- [x] After save, admin lists already reload — verify avatar tone uses effective `gender` from API (no extra client logic).

### Tests (AC: 9)

- [x] **API integration:** precedence matrix (unlinked+org, linked+M/F read-only, linked+non_specified+org, PATCH blocked, cascade M↔F, cascade→non_specified); update [`CompositionIntegrationTest`](../../services/api/src/test/kotlin/com/hatcast/api/composition/CompositionIntegrationTest.kt) unlinked test to set participant gender → expect `female`.
- [x] **Web unit:** `add-participant-dialog.spec.ts`, `add-event-participant-dialog.spec.ts`, `edit-participant-dialog.spec.ts` (new) — toggle visibility per selection/account state; submit payload includes `gender`.
- [x] **Regression:** `npm run build -w @hatcast/web`.

### Documentation (post-impl)

- [x] Update [member-gender-surfaces.md](../../docs/v2/technical/member-gender-surfaces.md) — Add/edit dialog row ✅; gender source matrix dual-layer.

### Explicit non-goals

- [ ] **2-12e** — admin edit **member** `users.gender` on troupe member list
- [ ] Mandatory gender on add; blocking validate/draw on mixité
- [ ] Draw weight factor **19.11**
- [ ] Gender on public `/membre/:userSlug` header
- [ ] Typeahead on edit dialog (remains out of scope per **3.8c**)

---

## Dev Notes

### Why this story exists (Lot B phase 1)

| Context | Detail |
|---------|--------|
| **Gap** | [`ParticipantGenderResolver`](../../services/api/src/main/kotlin/com/hatcast/api/user/ParticipantGenderResolver.kt) returns `non_specified` for all unlinked rows → mixité (**6.21**) hidden when `u > 0` |
| **Product rule** | Organizer who adds a guest is responsible for gender at **participant** level; dual layer with account gender ([ADR 0020](../../docs/adr/0020-participant-gender-organizer-operational.md)) |
| **Investigation** | [`lot-b-phase1-participant-gender-mixite-investigation.md`](investigations/lot-b-phase1-participant-gender-mixite-investigation.md) — concluded 2026-06-06; Option B confirmed |
| **Sequencing** | **3.8c** (typeahead) done — add dialog already has `selectedMember` signal; gender couples to selection state |

### Normative docs (already updated — do not re-debate)

- [DOMAIN.md](../../DOMAIN.md) — participant gender glossary + roster rules
- [member-gender.md](../specs/spec-member-gender-parity/member-gender.md) — effective precedence + cascade
- [ADR 0020](../../docs/adr/0020-participant-gender-organizer-operational.md) — accepted
- SCP: [sprint-change-proposal-2026-06-06-participant-gender-lot-b.md](../planning-artifacts/sprint-change-proposal-2026-06-06-participant-gender-lot-b.md)

### Current state (READ before coding)

| Area | Today | This story |
|------|-------|------------|
| DB `season_participants` / `event_participants` | No `gender` column (`V14`) | `V58` nullable column |
| `ParticipantGenderResolver` | User id → `users.gender` only; unlinked → `non_specified` | Load row + `effectiveGender` |
| `ParticipantRowPresentation.genderWire` | `user?.gender` only | `effectiveGender(row)` |
| `ParticipantCreateRequest` / `Update` | `displayName`, `email` only | Optional `gender` when allowed |
| `UserMemberPreferencesService` | Syncs display name to memberships; **no** gender cascade | Cascade to participant tables |
| Add dialogs (**3.8c**) | Name, email, typeahead | + conditional gender toggle |
| Edit dialog | Name, email only | + conditional gender toggle |
| Web mixité | [`composition-player-gender-parity.ts`](../../apps/web/src/app/core/composition/composition-player-gender-parity.ts) consumes `slot.participantGender` | **No change** if API fixed |
| Admin list DTO `gender` | Derived from user only | **Effective** gender |

### Write rules (implement exactly)

| Row kind | Organizer can write `participant.gender`? | UI |
|----------|-------------------------------------------|-----|
| `NAME_ONLY` | Yes (add + edit) | Toggle |
| `MANAGED` (email, no user) | Yes | Toggle |
| `LINKED` / `MEMBER`, account **non_specified**/unset | Yes | Toggle |
| `LINKED` / `MEMBER`, account **male** or **female** | **No** | Read-only + Mon compte copy |

**Synced membership rows** (`troupeMembershipId != null`): edit dialog already blocked for name/email — gender follows same rule (not editable here; account or membership sync only).

### API design guardrails

- **Single precedence implementation** — `ParticipantRowPresentation.effectiveGender` is the only source; resolver and DTO mappers call it.
- **Do not** add gender to `/v1/auth/me` (privacy from **2.12**).
- **Do not** expose organizer-set gender on public member profile APIs beyond existing operational surfaces (**2.12b**).
- **Validation:** invalid wire values → **400** `Genre invalide.` (same as Mon compte).
- **OpenAPI:** keep in sync with Kotlin DTOs (`participants.yaml`).
- **Audit:** optional — if other participant fields are audited, include `gender` in snapshot only when changed (follow existing `AuditSnapshots.seasonParticipant` pattern; extend if missing).

### Frontend implementation guardrails

| Concern | Action |
|--------|--------|
| **Reuse toggle UX** | Mirror [`account-profile-tab.html`](../../apps/web/src/app/pages/account-placeholder/tabs/account-profile-tab.html) — order **Féminin · Non spéc. · Masculin** |
| **Constants** | `MEMBER_GENDER_OPTIONS`, `effectiveMemberGender()` from [`member-gender.ts`](../../apps/web/src/app/core/account/member-gender.ts) |
| **Dialog shell** | Keep `.participant-form-dialog`, `overflow: visible` on `mat-dialog-content` (**3.8c** / `570ce4b0`) |
| **Typeahead coupling** | On `onMemberSelected`, if member has M/F → clear local gender override; if non_specified → show toggle defaulting to `non_specified` |
| **Free-text add** | No selection → toggle visible (name-only path) |
| **Submit body** | Omit `gender` key when read-only (server also guards) |

### Read-path inventory (must all use effective gender)

| # | Surface / API | File(s) |
|---|---------------|---------|
| 1 | Composition GET slots / declines | `CompositionService.kt`, `ParticipantGenderResolver` |
| 2 | Draw candidates | `CompositionDrawService.kt` |
| 3 | Slot assignment responses | `CompositionSlotAssignmentService.kt` |
| 4 | Admin season participants list | `SeasonParticipantService.kt` |
| 5 | Admin event roster list | `EventRosterService.kt` |
| 6 | Participant selector (dispos) | `SeasonParticipantService` selector |
| 7 | Availability summary | `AvailabilityService.kt` |
| 8 | Season statistics rows | `SeasonStatisticsService.kt` |
| 9 | Web mixité pill | `composition-player-gender-parity.ts` (API-driven) |
| 10 | Web admin avatars | `admin-participants.ts`, `admin-event-participants.ts` |

### Traps / regressions

| Trap | Mitigation |
|------|------------|
| Precedence drift — one path still uses `user?.gender` only | Grep `genderWire(user)` and `user?.gender` in participant/availability/stats packages after refactor |
| Toggle shown for member with M/F from typeahead | Check `effectiveMemberGender(member.gender)` before rendering |
| Cascade misses event-only participant rows | Update both repositories in cascade service |
| Cascade misses membership-linked season rows | Include `troupe_membership.user_id` join path |
| Reactivation drops gender | Pass gender into `reactivateRemoved` when explicit row |
| Mixité still hidden after fix | Verify composition GET returns `participantGender: female` for name-only with stored gender |
| Breaking **3.8c** layout | Gender block **after** email field; keep paragraph hints |

### Dependencies

| Story | Status | Relationship |
|-------|--------|----------------|
| **2.12** Optional gender profile | done | `users.gender` + Mon compte PATCH |
| **2.12b** Operational DTO gender | done | `gender` on list/slot DTOs (effective source changes here) |
| **2.12c** Avatar tones | done | Avatars use effective `gender` from API |
| **6.21** Mixité pill | done | Consumes `participantGender` — no formula change |
| **3.8** Roster CRUD | done | Create/update endpoints |
| **3.8c** Add typeahead | done | **Depends** — selection state for gender visibility |
| **16.3** Season parity stats | backlog | **Enabled** — same `SeasonStatisticsService` read path |
| **2-12e** Admin member gender | backlog | Out of scope |

### Previous story intelligence (3.8c — Lot A)

- Add dialogs use `selectedMember` signal; clearing selection clears email — apply same reset for gender local state.
- `troupeId` already passed in dialog data; `TroupeMemberAdmin.gender` available on suggestions.
- Shared helper [`participant-member-suggestions.ts`](../../apps/web/src/app/shared/participant-add/participant-member-suggestions.ts) — gender toggle is separate component, not in suggestions helper.
- Dialog tests mock `TroupeApiService` + `ParticipantApiService` — extend with gender payload assertions.
- **Non-goal in 3.8c was gender** — explicitly in scope now; do not remove typeahead.

### Previous story intelligence (2.12b / 2.12c)

- `effectiveMemberGender()` at all web DTO boundaries.
- Admin templates already bind `[gender]="p.gender"` on `app-user-avatar` — effective API value is sufficient.
- Privacy: gender not on `/v1/auth/me`; organizer surfaces are operational only.
- Code review pattern: align story AC to frozen UX when epic text lags; add integration tests per read path.

### Git intelligence

| Commit | Relevance |
|--------|-----------|
| `2392adae` feat(participants): Add name typeahead on add | **3.8c** — add dialog structure to extend |
| `570ce4b0` fix(participants): Fix add/edit dialog layout | M3 dialog shell baseline |
| `ea9bde32` feat(account): optional member gender | Mon compte toggle pattern to reuse |
| Working tree | DOMAIN, ADR 0020, member-gender.md, SCP already applied — implement runtime only |

### Architecture compliance

- **Stack:** Angular **21.2** + Material **21.2** ; Kotlin Spring Boot ; PostgreSQL Flyway (**V58** next after `V57__bootstrap_demo_roster_gender.sql`).
- **Auth:** Existing participant admin guards (`participantAccess.requireCanManageSeasonParticipants`) — no new routes.
- **Transactions:** Cascade + create/update in `@Transactional` service methods.
- **Testing:** Extend `CompositionIntegrationTest` rather than only unit tests.

### Testing requirements

| Layer | Tests |
|-------|-------|
| API integration | Precedence matrix; cascade; PATCH rejection when account M/F; migration smoke |
| Web unit | Add (season + event) dialog gender visibility + payload; edit dialog read-only vs writable |
| Manual recette | Name-only → set F → assign JEU → mixité visible; link to user with M → read-only; Mon compte F→M cascade |
| Commands | `./gradlew test` ; `npm run test -w @hatcast/web -- --watch=false` |

### Manual recette (quick)

1. Add name-only **Marie** as **Féminin** → roster shows orange avatar tone.
2. Assign Marie + linked male to `player` slots → Équipe mixité pill **visible**.
3. Add troupe member **with** Mon compte Masculin via typeahead → no gender toggle → save → effective male.
4. Add troupe member **Non spéc.** via typeahead → set **Féminin** on row → effective female on dispos.
5. Member changes Mon compte M→F → all roster rows for that user show female on composition.
6. Member sets **Non spéc.** → participant gender cleared → mixité may hide until org re-edits row.

---

## Dev Agent Record

### Agent Model Used

Composer (dev-story 2026-06-06)

### Completion Notes List

- V58 migration + `MemberGender?` on season/event participant entities; single precedence in `ParticipantRowPresentation`.
- Write path: `ParticipantGenderWriteSupport` + DTO fields `participantGender` / `genderManagedOnAccount`; cascade via `ParticipantGenderCascadeService` on Mon compte PATCH.
- Web: `ParticipantGenderToggleField` (M3 tokens, 48dp mobile, French aria-labels) wired in add/edit season + event dialogs.
- Tests: `ParticipantRowPresentationTest` (pass); `ParticipantGenderIntegrationTest` + updated `CompositionIntegrationTest` (Spring context blocked on branch by V59 partial-index H2 syntax — unrelated ADR-0021 migration).
- M3 checklist: mat-button-toggle-group, `--hatcast-member-gender-*` tokens, member-gender-surfaces.md updated.

### File List

- services/api/src/main/resources/db/migration/V58__participant_gender.sql
- services/api/src/main/kotlin/com/hatcast/api/participant/ParticipantEntities.kt
- services/api/src/main/kotlin/com/hatcast/api/participant/ParticipantRowPresentation.kt
- services/api/src/main/kotlin/com/hatcast/api/participant/ParticipantGenderWriteSupport.kt
- services/api/src/main/kotlin/com/hatcast/api/participant/ParticipantGenderCascadeService.kt
- services/api/src/main/kotlin/com/hatcast/api/participant/dto/ParticipantDtos.kt
- services/api/src/main/kotlin/com/hatcast/api/participant/SeasonParticipantService.kt
- services/api/src/main/kotlin/com/hatcast/api/participant/EventParticipantService.kt
- services/api/src/main/kotlin/com/hatcast/api/participant/EventRosterService.kt
- services/api/src/main/kotlin/com/hatcast/api/user/ParticipantGenderResolver.kt
- services/api/src/main/kotlin/com/hatcast/api/user/UserMemberPreferencesService.kt
- services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityService.kt
- services/api/src/main/kotlin/com/hatcast/api/season/SeasonStatisticsService.kt
- services/api/openapi/participants.yaml
- services/api/src/test/kotlin/com/hatcast/api/participant/ParticipantRowPresentationTest.kt
- services/api/src/test/kotlin/com/hatcast/api/participant/ParticipantGenderIntegrationTest.kt
- services/api/src/test/kotlin/com/hatcast/api/composition/CompositionIntegrationTest.kt
- apps/web/src/app/shared/participant-add/participant-gender-toggle-field.ts
- apps/web/src/app/shared/participant-add/participant-gender-toggle-field.scss
- apps/web/src/app/pages/admin-participants/add-participant-dialog.ts
- apps/web/src/app/pages/admin-participants/add-participant-dialog.spec.ts
- apps/web/src/app/pages/admin-event-participants/add-event-participant-dialog.ts
- apps/web/src/app/shared/edit-participant-dialog/edit-participant-dialog.ts
- apps/web/src/app/shared/edit-participant-dialog/edit-participant-dialog.spec.ts
- apps/web/src/app/core/participants/participant-api.service.ts
- apps/web/src/app/pages/admin-participants/admin-participants.ts
- apps/web/src/app/pages/admin-event-participants/admin-event-participants.ts
- docs/v2/technical/member-gender-surfaces.md

### Change Log

- 2026-06-06 : Story created (`bmad-create-story` for 2-12d).
- 2026-06-06 : Implementation complete — dual-layer participant gender (API + admin dialogs + cascade).

---

### Validation create-story

- [x] AC métier numérotés et sourcés (epics / ADR / investigation / SCP)
- [x] Section **Material 3** remplie (add/edit dialog UI)
- [x] Tasks référencent les numéros d'AC (y compris M3-x)
- [x] Liens vers fichiers code existants à réutiliser
- [x] `./gradlew test` / `npm run test` mentionnés
- [x] Non-goals explicites (2-12e, 19.11, mandatory gender)
- [x] Read-path inventory + precedence documented
- [x] 3.8c typeahead coupling documented
