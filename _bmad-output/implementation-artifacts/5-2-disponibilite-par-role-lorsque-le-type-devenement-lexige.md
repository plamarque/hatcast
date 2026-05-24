# Story 5.2: Role-level availability and preferred-role pre-selection

Status: done

<!-- Ultimate context engine analysis completed — comprehensive developer guide created -->

## Story

As a **linked participant**,  
I want to **indicate availability at the level of required roles**, with **pre-selection of my troupe preferred roles** when configured,  
so that **I can quickly signal which positions I can fill** (**FR16**, **FR46**, **UX-DR5**).

## Acceptance Criteria

1. **Given** a spectacle whose `roleSlots` has at least one role with count **> 0** (story **3.4**), **when** I choose **Dispo** in the availability dialog, **then** I see a **role checklist** for **this event’s required roles only** (icon + French label + checkbox) and can toggle candidacy per role — **FR16**, **UX-DR5**.
2. **Given** I am **Dispo** with role candidacy, **when** I save (toggle a role or confirm status), **then** the API persists `status = available` and a **`roleKeys`** array containing only keys present on the event with count **> 0** — **FR16**.
3. **Given** my troupe membership has **preferred roles** configured (story **2.7**, **FR46**), **when** I open the dialog for an applicable event and select **Dispo** (or reopen an existing **available** row with empty roles), **then** roles are **pre-checked** as the intersection of `(preferredRoleKeys effective for my membership)` ∩ `(roles required on this event)` ; I can change selections before the next save — **FR46**.
4. **Given** preferred roles are **unset/empty** on membership (V2 default = all roles per `PreferredRoleKeys.effectiveKeys`), **when** I first select **Dispo**, **then** pre-check follows the same intersection rule (typically all event roles that are also in the global role catalogue).
5. **Given** **mandatory volunteer coverage** applies (interim rule below) and the event has `roleSlots.volunteer > 0`, **when** I check a **play role** (`player`) as available, **then** `volunteer` is **auto-included** in the saved `roleKeys` unless I **explicitly uncheck** volunteer before save — **FR16** tied to **FR14**.
6. **Given** I choose **Pas dispo** or **Non renseigné**, **when** the API persists, **then** any stored **`roleKeys` are cleared** (empty array on read for unavailable; row deleted for unknown — same as story **5.1**) — V1 parity.
7. **Given** an event with **no roles** (`totalSlots(roleSlots) === 0`, e.g. survey/custom zero slots), **when** I open the dialog, **then** behaviour remains **story 5.1 only** (three status buttons, no role block).
8. **Given** I submit invalid `roleKeys` (unknown key or role not required on this event), **when** the API validates, **then** **400** with a clear French error — **NFR-S2**.
9. **Given** I reopen the dialog or reload the agenda, **when** a saved availability exists, **then** status **and** checked roles reflect persisted data.
10. **Given** keyboard use, **when** the role checklist is visible, **then** checkboxes are reachable by Tab and toggling Space/Enter persists like mouse — **NFR-A1**.
11. **Couverture:** **FR16**, **FR46** ; **UX-DR5** (role candidacy when Dispo) ; prepares **FR19** (story **5.3** org grids consume `roleKeys`).

### Explicit out of scope (later stories — do not implement in 5.2)

| Story | Deferred capability |
|-------|---------------------|
| **5.3** | Organizer Dispos tab, Moi/Tous, per-role grids, % transparency |
| **5.4** | Optional comment field (500 chars) |
| **5.5** | Proxy availability for another participant + audit actor |
| **6.2** | Full-screen event detail Dispos tab (reuse same dialog semantics) |
| **FR14 toggle** | Per–event-type admin flag `mandatoryVolunteerCoverage` (see interim rule) |
| **participant_id** | Migrate `event_availability` from `user_id` to `participant_id` (optional hardening — see Dev Notes) |

## Context and slicing

| Story | Scope |
|-------|--------|
| **3.4 (done)** | `templateType` + `roleSlots` on events |
| **2.7 (done)** | `preferred_role_keys` on `troupe_memberships` + API |
| **3.8 (done)** | Season/event participants — availability still keyed by **`user_id`** in **5.1** |
| **5.1 (done)** | Three-state availability, MatDialog shell, agenda badges |
| **5.2 (this)** | `roleKeys` persistence + role checklist UI + preferred-role pre-check + volunteer auto-rule |
| **5.3–5.5** | Org views, comment, proxy |

## Tasks / Subtasks

- [x] **Scope:** `apps/web/` + `services/api/` ; **do not modify** `legacy/` (reference only).
- [x] **Migration Flyway** `V16__event_availability_role_keys.sql`:
  - Add `role_keys TEXT NOT NULL DEFAULT '[]'` on `event_availability` (JSON string array via converter — match `preferred_role_keys` / H2 parity pattern).
  - Backfill existing rows: `[]`.
- [x] **API domain** — extend `com.hatcast.api.availability`:
  - `EventAvailabilityEntity.roleKeys: List<String>` with `RoleKeysJsonConverter` (new, mirror [`PreferredRoleKeysJsonConverter.kt`](../../services/api/src/main/kotlin/com/hatcast/api/troupe/PreferredRoleKeysJsonConverter.kt)).
  - **`AvailabilityRoleRules`** (object or small service):
    - `rolesRequiredForEvent(event)` → `RoleTemplates.rolesWithSlots(event.roleSlots)`.
    - `normalizeRoleKeys(event, requestedKeys, applyVolunteerRule: Boolean)` — filter to required keys, apply volunteer auto-add when play role present (interim FR14 rule).
    - `PLAY_ROLE_KEYS = setOf("player")`.
    - `mandatoryVolunteerCoverage(event)` **interim:** `event.roleSlots["volunteer"] ?: 0 > 0` (document TODO for explicit FR14 template flag).
  - Extend DTOs:
    - `MyAvailabilityResponse`: add `roleKeys: List<String>` (always present; `[]` when unavailable/unknown).
    - `SetMyAvailabilityRequest`: add optional `roleKeys: List<String>?` — required semantics when `status = available` and event has required roles (see validation below).
  - Extend [`AvailabilityService.kt`](../../services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityService.kt):
    - On **available**: upsert row with normalized `roleKeys`.
    - On **unavailable**: upsert with `roleKeys = []`.
    - On **unknown**: delete row (unchanged).
    - Validate keys ⊆ event required roles ; reject unknown keys with **400**.
  - Optional: extend event list `myAvailabilityStatus` with `myAvailabilityRoleKeys` **only if needed for agenda** — **defer** unless product wants role summary on badge (not in AC).
- [x] **OpenAPI:** extend [`openapi/availability.yaml`](../../services/api/openapi/availability.yaml) — document `roleKeys` on request/response ; note volunteer auto-rule in description.
- [x] **Angular — API client:**
  - Extend [`availability-api.service.ts`](../../apps/web/src/app/core/availability/availability-api.service.ts) types + PUT body with `roleKeys`.
  - Add helper module `availability-role-rules.ts` (or extend [`event-types.ts`](../../apps/web/src/app/core/events/event-types.ts)) — port `rolesRequiredForEvent`, volunteer auto-add, preferred-role intersection (reuse [`member-profile-api.service.ts`](../../apps/web/src/app/core/member-profile/member-profile-api.service.ts) preferred-roles GET or cache from troupe context).
- [x] **Angular — dialog UI** ([`availability-dialog`](../../apps/web/src/app/shared/availability/availability-dialog.ts)):
  - Extend `AvailabilityDialogData` with `roleSlots`, `troupeId`, optional `initialRoleKeys`.
  - When `rolesRequiredForEvent(roleSlots).length > 0` **and** selected status is **`available`**:
    - Show intro line: *« Choisis les rôles pour lesquels tu es disponible »* (UX-DR5).
    - Two-column grid of checkboxes with `ROLE_EMOJIS` + `ROLE_LABELS` from [`event-types.ts`](../../apps/web/src/app/core/events/event-types.ts) — port layout from [`AvailabilityForm.vue`](../../legacy/src/components/AvailabilityForm.vue) lines 65–109.
  - **Pre-check logic (FR46):** on first transition to `available` with empty local selection, set checkboxes to `intersect(preferredRoleKeys, eventRoles)` ; fetch preferred roles via `GET /v1/troupes/{troupeId}/memberships/me/preferred-roles` once per dialog open.
  - **Volunteer rule (FR16):** when user checks `player` and interim mandatory coverage applies, auto-check `volunteer` in UI ; allow explicit uncheck before save.
  - **Save model:** keep immediate persist (story **5.1** UX):
    - Status button click → save status + current roleKeys (after pre-check if moving to available).
    - Each role checkbox toggle → save if status is already `available`.
  - **Pas dispo / Non renseigné:** hide role block ; clear local role selection ; persist without roles.
  - Pass `roleSlots` + `troupeId` from [`season-home.ts`](../../apps/web/src/app/pages/season-home/season-home.ts) `openAvailability()` ; load `initialRoleKeys` from extended GET `/availability/me` when opening (fetch if not cached).
- [x] **Tests:**
  - API integration: available + roleKeys persisted ; invalid key → 400 ; unavailable clears roles ; unknown deletes row ; volunteer auto-add when player checked ; explicit volunteer omit honored ; preferred roles not needed server-side (client pre-check only) — server validates submitted keys only.
  - Unit: `AvailabilityRoleRules` normalization + volunteer rule matrix.
  - Component: role block visible only when Dispo + slots ; pre-check from mocked preferred roles ; toggle saves API ; Pas dispo hides roles.
  - **NFR-Q1:** at least one automated test covering **FR16** path (auth + PUT with roleKeys + GET round-trip).
  - Regression: `./gradlew test`, `ng test`, `ng build`.

## Dev Notes

### Architecture & guardrails

- Monorepo V2: [ARCH.md](../../ARCH.md) ; REST/JSON: [architecture.md](../planning-artifacts/architecture.md) (camelCase DTOs, Flyway, OpenAPI source of truth).
- Auth: [ADR-0010](../../docs/adr/0010-v2-auth-identity-platform.md) ; mutations with `credentials: 'include'` + CSRF.
- Authorization unchanged from **5.1**: active troupe membership for season’s troupe ; `/availability/me` only.
- UI mood: extend existing dark modal — [ux-design — Availability modal](../planning-artifacts/ux-design-hatcast-v2.md#pattern-availability-modal-overlay) + role rows from [Dispos tab — Moi](../planning-artifacts/ux-design-hatcast-v2.md#screen-event-detail-dispos-tab).
- Reference screenshots: [`event-detail-dispos-moi-dispo-roles-v1.png`](../planning-artifacts/ux-references/event-detail-dispos-moi-dispo-roles-v1.png).

### V1 reference model (port semantics, not Firestore)

| V1 concept | V2 (5.2) |
|------------|----------|
| `availability.roles: string[]` | `event_availability.role_keys` JSON array |
| Dispo + roles | `status = AVAILABLE` + non-empty `roleKeys` (may be `[]` = dispo générale when event has roles — see below) |
| Pas dispo | `status = UNAVAILABLE`, `roleKeys = []` |
| Non renseigné | row **deleted** |
| Preferred roles | `troupe_memberships.preferred_role_keys` via story **2.7** API |
| Volunteer mandatory | V1 blocks uncheck entirely ; **FR16** allows explicit uncheck — implement **epic AC**, not V1 `canDisableRole` |

**Dispo générale (empty roleKeys while available):** V1 treats `roles: []` as eligible for any role in draw logic ([`playerAvailabilityService.js`](../../legacy/src/services/playerAvailabilityService.js)). **Keep this semantics** for parity: do **not** require ≥1 role when status is available ; organizers interpret empty as “dispo sans préférence de rôle”.

**Pas dispo / Non renseigné vs roles:** Always **clear** `roleKeys` (V1 `handleAvailabilityChange` clears roles when not Dispo).

### Mandatory volunteer coverage — interim rule (FR14 not fully implemented in 3.4)

PRD **FR14** allows per–event-type configuration of whether volunteer is mandatory when a play role is marked available. Story **3.4** persisted `roleSlots` only — **no** `mandatoryVolunteerCoverage` flag yet.

**Approved interim for 5.2:**

- `mandatoryVolunteerCoverage(event) = (event.roleSlots["volunteer"] ?: 0) > 0`.
- When **true** and saved `roleKeys` contains any **play role** (`player`), server **adds** `volunteer` if missing unless the client explicitly sent a list **without** volunteer after user unchecked it.
- **Client:** when user checks `player`, auto-check `volunteer` in UI ; user may uncheck volunteer ; send resulting list to API.
- **Server:** trust client list after normalization ; re-apply auto-add only when play role present, volunteer slot exists, and volunteer not explicitly excluded — simplest approach: if `player ∈ roleKeys` and volunteer slot > 0, ensure `volunteer ∈ roleKeys` **unless** request includes sentinel or separate flag — **prefer:** always merge volunteer server-side when play role present (epic AC: “sauf décochage explicite” → client omits volunteer from array when user unchecked).

Document **TODO** in `AvailabilityRoleRules` for future FR14 template flag.

### Preferred roles pre-selection (FR46)

| Source | Rule |
|--------|------|
| API | [`PreferredRoleKeys.effectiveKeys`](../../services/api/src/main/kotlin/com/hatcast/api/troupe/PreferredRoleKeys.kt) — empty storage ⇒ all `RoleKeys.ALL` |
| Event filter | `rolesRequiredForEvent(event.roleSlots)` from [`event-types.ts`](../../apps/web/src/app/core/events/event-types.ts) |
| Pre-check set | `effectivePreferred ∩ eventRequired` |

Fetch once per dialog: `GET /v1/troupes/{troupeId}/memberships/me/preferred-roles`.

Apply when:

- User clicks **Dispo** and local `selectedRoleKeys` is empty (first time or fresh).
- Dialog opens with `initialStatus === 'available'` and `initialRoleKeys` empty — run pre-check before display.

Do **not** re-apply pre-check on every reopen if user already saved explicit roles.

### Database shape

```sql
ALTER TABLE event_availability
    ADD COLUMN role_keys TEXT NOT NULL DEFAULT '[]';
-- JSON array of role key strings, e.g. ["player","mc","volunteer"]
```

Primary key remains `(event_id, user_id)` from **5.1**. Column `participant_id` still deferred — see below.

### participant_id note (Story 3.8 landed after 5.1 plan)

Story **3.8** is **done** but **5.1** shipped with `user_id` only. **Do not block 5.2** on participant migration. Optional follow-up in same or later story:

- Add nullable `participant_id` FK → `season_participants`.
- Backfill from membership-synced season participant for linked members.
- Keep `/availability/me` resolving via session user.

Proxy (**5.5**) will need participant subject — track as tech debt if not done here.

### Existing blocks (reuse — do not reinvent)

| Subject | Location |
|---------|----------|
| Availability shell (5.1) | [`availability-dialog.ts`](../../apps/web/src/app/shared/availability/availability-dialog.ts), [`AvailabilityService.kt`](../../services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityService.kt) |
| Role catalogue + slots | [`event-types.ts`](../../apps/web/src/app/core/events/event-types.ts), [`EventRoleSlots.kt`](../../services/api/src/main/kotlin/com/hatcast/api/event/EventRoleSlots.kt) |
| Preferred roles API | [`MemberProfileService.kt`](../../services/api/src/main/kotlin/com/hatcast/api/memberprofile/MemberProfileService.kt), [`member-profile-api.service.ts`](../../apps/web/src/app/core/member-profile/member-profile-api.service.ts) |
| Agenda entry point | [`season-home.ts`](../../apps/web/src/app/pages/season-home/season-home.ts) `openAvailability()` |
| V1 role UI + volunteer | [`AvailabilityForm.vue`](../../legacy/src/components/AvailabilityForm.vue), [`rolePreferencesService.js`](../../legacy/src/services/rolePreferencesService.js) |
| Status mapping | [`AvailabilityStatusMapper.kt`](../../services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityStatusMapper.kt) |

### UI behaviour (5.2 additions)

1. **Role block visibility:** only when `rolesRequiredForEvent(roleSlots).length > 0` **and** `selected === 'available'`.
2. **Order:** use `ROLE_DISPLAY_ORDER` filtered to event roles (same as V1 `availableRoles`).
3. **Labels:** French from `ROLE_LABELS` (product copy — inclusive forms already in constants).
4. **Volunteer hint:** when auto-checked and mandatory, optional subtle label *(obligatoire)* under volunteer row — matches V1 hint when `!canDisableRole` ; in FR16 mode show only when auto-added from play role, not when user freely selected volunteer alone.
5. **Agenda badge:** still shows Dispo/Pas dispo/Non renseigné only — **no** role summary on badge (5.3/6.x).

### Downstream contract (implement API shape now)

| Story | Consumes |
|-------|----------|
| **5.3** | Aggregated availability by role across participants |
| **5.4** | Adds `comment` column — extend same PUT |
| **5.5** | PUT for participant subject + audit |
| **6.4** | Draw filters candidates by `roleKeys` contains role |

Keep `roleKeys` on GET responses even when empty for stable client parsing.

### Security & permissions

- Same gates as **5.1** — no new endpoints.
- Server validates `roleKeys` ⊆ event required set — never persist organizer-only or arbitrary keys.
- Do not expose other members’ `roleKeys` in **5.2** (5.3 adds org aggregate).

### Testing requirements

| Layer | What to test |
|-------|----------------|
| API integration | PUT available + roleKeys ; GET round-trip ; 400 bad key ; unavailable clears roles ; volunteer merge with player ; play role without volunteer slot (cabaret) — no volunteer added |
| Rules unit | Intersection helper ; volunteer auto-add matrix |
| Angular component | Role grid conditional ; pre-check from preferred API mock ; checkbox PUT ; status change clears/hides roles |
| A11y | Checkbox keyboard toggle |
| Regression | 5.1 availability tests still green |

### Previous story intelligence (5.1 — patterns to extend)

From **5.1** (**done**, commit `843cf61`):

1. **Do not rewrite** the dialog — extend `AvailabilityDialog` in place.
2. **Immediate save** on status choice worked well — extend to role toggles, not a separate Save button (comment comes in **5.4**).
3. Migration **V15** exists ; next is **V16**.
4. `myAvailabilityStatus` on event list — optional `myAvailabilityRoleKeys` **not required** for AC.
5. Review fixes to preserve: badge `stopPropagation` / keyboard ; `canEditAvailability` membership gate in [`season-home.ts`](../../apps/web/src/app/pages/season-home/season-home.ts).
6. Interim `user_id` subject — still valid ; document participant migration as debt.

From **2.7** (preferred roles):

- `PreferredRoleKeys.ensureVolunteer` on save — pre-check may include volunteer even when event has no volunteer slot (filter intersection handles this).
- Empty preferred storage ⇒ all roles — pre-check may select all event roles.

From **3.4** (role slots):

- Only roles with count **> 0** are offered — `rolesWithSlots` / `rolesRequiredForEvent`.

### Git intelligence (recent work)

Recent commits reinforce patterns:

- `843cf61 feat(availability): Add per-event availability entry` — package layout, integration tests, MatDialog.
- `f0b5c5e feat(participants): Add season and event rosters` — participant domain exists ; availability not yet wired.
- `d8f2178 feat(member-profile): Add popover and preferred roles` — preferred-roles API ready for client fetch.

### Latest tech notes

- **Angular 21** + standalone components ; **Material** checkboxes (`MatCheckboxModule`) for role grid.
- **Spring Boot 3.x** + **Flyway V16** after V15.
- **PostgreSQL / Neon** — JSON as TEXT + AttributeConverter (project standard).
- No new npm/Maven dependencies expected.

### Project context reference

- [SPEC.md](../../SPEC.md) — availability by role ; historique categories use role keys.
- [DOMAIN.md](../../DOMAIN.md) — availability schema ambiguity ; this story defines V2 `roleKeys` canonical shape.
- [epics.md](../planning-artifacts/epics.md) — Epic 5, Story 5.2 AC.
- [prd.md](../planning-artifacts/prd.md) — FR14, FR16, FR46.

## Dev Agent Record

### Agent Model Used

GPT-5.5

### Debug Log References

- `./gradlew test --tests com.hatcast.api.availability.AvailabilityRoleRulesTest --tests com.hatcast.api.availability.AvailabilityControllerIntegrationTest`
- `./gradlew test --rerun-tasks`
- `npm run test -w @hatcast/web -- --watch=false`
- `npm run build -w @hatcast/web`
- `git diff --check`

### Completion Notes List

- Added `event_availability.role_keys` persistence via Flyway V16 and a JSON converter, with empty arrays for unavailable/unknown reads.
- Added backend role validation/normalization, including required-role filtering, FR16 volunteer auto-add by default, and explicit volunteer omit through `applyVolunteerRule=false`.
- Extended `/availability/me` request/response and OpenAPI with stable `roleKeys` and documented volunteer semantics.
- Extended the Angular availability dialog with required-role checkboxes, preferred-role pre-check from membership preferences, immediate save on role toggles, and role clearing for unavailable/unknown.
- Kept agenda badges status-only; no `myAvailabilityRoleKeys` was added to event list responses because it is deferred by story scope.
- Added API unit/integration tests and Angular rule/component tests covering role persistence, invalid roles, clearing, preferred-role pre-check, volunteer auto-add, and explicit omit.

### File List

- `_bmad-output/implementation-artifacts/5-2-disponibilite-par-role-lorsque-le-type-devenement-lexige.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `apps/web/src/app/core/availability/availability-api.service.ts`
- `apps/web/src/app/core/availability/availability-role-rules.spec.ts`
- `apps/web/src/app/core/availability/availability-role-rules.ts`
- `apps/web/src/app/pages/season-home/season-home.ts`
- `apps/web/src/app/shared/availability/availability-dialog.html`
- `apps/web/src/app/shared/availability/availability-dialog.scss`
- `apps/web/src/app/shared/availability/availability-dialog.spec.ts`
- `apps/web/src/app/shared/availability/availability-dialog.ts`
- `services/api/openapi/availability.yaml`
- `services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityRoleRules.kt`
- `services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityService.kt`
- `services/api/src/main/kotlin/com/hatcast/api/availability/EventAvailabilityEntity.kt`
- `services/api/src/main/kotlin/com/hatcast/api/availability/RoleKeysJsonConverter.kt`
- `services/api/src/main/kotlin/com/hatcast/api/availability/dto/AvailabilityDtos.kt`
- `services/api/src/main/resources/db/migration/V16__event_availability_role_keys.sql`
- `services/api/src/test/kotlin/com/hatcast/api/availability/AvailabilityControllerIntegrationTest.kt`
- `services/api/src/test/kotlin/com/hatcast/api/availability/AvailabilityRoleRulesTest.kt`

### Review Findings

- [x] [Review][Decision] Pre-check on reopen — **Option B (V1 dispo générale):** pre-check only on first transition to Dispo in the dialog session, not when reopening a persisted `available` row with empty `roleKeys`.
- [x] [Review][Defer] Silent empty pre-check when preferred-roles API fails — fixed: snackbar + fallback to all catalogue roles (V1 `effectiveKeys` parity).
- [x] [Review][Patch] Missing AC7 component test for events with zero role slots [availability-dialog.spec.ts]
- [x] [Review][Patch] Missing AC6 component test for Pas dispo hiding/clearing role block [availability-dialog.spec.ts]
- [x] [Review][Patch] Misleading test name still says « closes on choice » but dialog no longer auto-closes [availability-dialog.spec.ts:84]
- [x] [Review][Patch] Volunteer « (obligatoire) » hint not shown when auto-added from play role [availability-dialog.html]
- [x] [Review][Patch] DOMAIN.md not updated with canonical V2 `roleKeys` shape [DOMAIN.md]
- [x] [Review][Defer] Silent empty pre-check when preferred-roles API fails [availability-dialog.ts:167] — deferred, pre-existing error-handling gap pattern

### Change Log

- 2026-05-24: Implemented Story 5.2 role-level availability, preferred-role pre-selection, volunteer rule handling, and regression coverage.
- 2026-05-24: Post-review fixes — dispo générale preserved on reopen; preferred-roles API failure shows snackbar and falls back to all roles.

## References

- [Source: _bmad-output/planning-artifacts/epics.md — Story 5.2](../planning-artifacts/epics.md)
- [Source: _bmad-output/planning-artifacts/ux-design-hatcast-v2.md — Dispos role candidacy](../planning-artifacts/ux-design-hatcast-v2.md#screen-event-detail-dispos-tab)
- [Source: _bmad-output/planning-artifacts/prd.md — FR14, FR16, FR46](../planning-artifacts/prd.md)
- [Source: _bmad-output/implementation-artifacts/5-1-saisie-de-disponibilite-par-evenement-etats-dispo-pas-dispo-non-renseigne.md](./5-1-saisie-de-disponibilite-par-evenement-etats-dispo-pas-dispo-non-renseigne.md)
- [Source: _bmad-output/implementation-artifacts/3-4-types-devenement-et-roles-requis-optionnels.md](./3-4-types-devenement-et-roles-requis-optionnels.md)
- [Source: _bmad-output/implementation-artifacts/2-7-popover-profil-membre-stats-saison-grille-mensuelle-roles-favoris.md](./2-7-popover-profil-membre-stats-saison-grille-mensuelle-roles-favoris.md)
- [Source: legacy/src/components/AvailabilityForm.vue](../../legacy/src/components/AvailabilityForm.vue)
- [Source: legacy/src/services/playerAvailabilityService.js](../../legacy/src/services/playerAvailabilityService.js)
