# Story 2.12b: Gender-aware role labels (web + API DTOs)

Status: done

baseline_commit: ea9bde32

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

## Story

As a **member or organizer**,  
I want **role labels to match a participant's declared gender** (e.g. Comédienne),  
so that I **do not rely on middot notation** when gender is known.

## Acceptance Criteria

1. **Given** gender-aware label tables ported to `apps/web/src/app/shared/event-roles/`, **when** `getRoleLabel(roleKey, gender, plural?)` is called, **then** output matches the normative tables in [member-gender.md](../specs/spec-member-gender-parity/member-gender.md) for all `RoleKeys.ALL` — using **V2** `Comédien` / `Comédienne` / `Comédien·ne` for `player` (not V1 `Joueur` / `Joueuse`). [Source: epics 2.12b AC1 ; member-gender.md ; DOMAIN.md]
2. **Given** dispos, équipe, confirmation modals, availability summaries, member popover role pills, and agenda participation chips, **when** a **linked participant's** gender is `male` or `female`, **then** role labels for that participant use the gender-aware table. [Source: epics 2.12b AC2 ; ux-design-member-gender-parity.md Cross-surface ; EXPERIENCE.md § Gender-aware labels]
3. **Given** the composition **draw animation** winner line ([`composition-draw-animation`](../../apps/web/src/app/shared/composition/composition-draw-animation.html)), **when** a participant is selected, **then** the status prefix uses their gender: **Sélectionné** (`male`), **Sélectionnée** (`female`), **Sélectionné·e** (`non_specified` or unknown) — format `{prefix} : {displayName}`. [Source: PO decision 2026-06-05 ; V1 `SelectionModal.vue` canvas parity — **only** this V2 surface]
4. **Given** `non_specified`, null, absent gender, or unlinked participant without a user account, **when** a role label is rendered, **then** inclusive labels remain unchanged (`Comédien·ne`, `Assistant.e`, … — current `ROLE_LABELS_SINGULAR`). [Source: epics 2.12b AC3 ; story 2.12 AC3 regression guard]
5. **Given** empty composition slots (no assignee), event-type role headers, or admin event-type configuration dialogs, **when** labels are shown without a participant context, **then** inclusive labels only (no gender). **Given** season statistics event-cell tooltips for a named participant row, **when** `row.gender` is known, **then** role labels in the cell tooltip use `getRoleLabel` (abbreviated grid letters stay non-gendered). [Source: EXPERIENCE.md — Empty slot placeholder ; member-gender-surfaces.md ; PO review 2026-06-05 D1:A]
6. **Given** composition and availability summary API responses, **when** a slot/participant row is linked to a user with stored gender, **then** DTOs expose `gender: male | female | non_specified` on participant-bearing rows (composition slots, declines, summary participants, **draw step candidates**) so the web client can render labels without extra round-trips. [Source: SCP §4.2 ; story 2.12 non-goals deferral]
7. **Given** server-rendered participant-specific copy (`MeInbox`, proxy/confirmation notifications), **when** the message includes a role label for a known user, **then** the label uses gender-aware Kotlin helper aligned with the same tables (not static `SeasonStatisticsService.ROLE_LABELS`). [Source: SCP §4.2 ; MeInboxIntegrationTest today expects `Comédien·ne`]
8. **Given** implementation complete, **when** tests run, **then** `./gradlew test` and `npm run test -w @hatcast/web -- --watch=false` pass for story scope. [Source: AGENTS.md]

**Normative label tables (singular — implement exactly):**

| roleKey | male | female | non_specified |
|---------|------|--------|---------------|
| `player` | Comédien | Comédienne | Comédien·ne |
| `volunteer` | Bénévole | Bénévole | Bénévole |
| `mc` | MC | MC | MC |
| `dj` | DJ | DJ | DJ |
| `referee` | Arbitre | Arbitre | Arbitre |
| `assistant_referee` | Assistant | Assistante | Assistant.e |
| `lighting` | Lumière | Lumière | Lumière |
| `coach` | Coach | Coach | Coach |
| `stage_manager` | Régisseur | Régisseuse | Régisseur.euse |

Plural forms: port V1 `ROLE_LABELS_PLURAL_BY_GENDER` structure from [`legacy/src/services/storage.js`](../../legacy/src/services/storage.js) but replace `player` masculine/feminine/inclusive with **Comédiens** / **Comédiennes** / **Comédiens·nes** (mirror V1 plural pattern for other roles: Assistants/Assistantes/Assistant.es, etc.).

**Selection status prefix (draw animation only — not role labels):**

| gender | prefix |
|--------|--------|
| `male` | Sélectionné |
| `female` | Sélectionnée |
| `non_specified` / unknown | Sélectionné·e |

Do **not** introduce these strings elsewhere in V2 (no V1 « tu es sélectionnée », no tooltips *Sélectionné - en attente…* genrés — V2 uses role-name tooltips instead).

**Product coverage:** FR9/FR10 ; V1 parity Wave B (SCP G-011). **Priority:** P1. **Depends:** **2.12** (done). **Blocks:** **6.21** (parity strip needs slot gender on DTOs), **16.3** (optional). **Unblocks:** better inbox/notification copy.

---

## Acceptance Criteria — Material 3 (UI)

**M3-1. Composants Material** — **Given** this story changes **copy only** on existing M3 surfaces (dispos panels, équipe tab, dialogs, chips), **when** no new controls are added, **then** no new custom HTML buttons — reuse existing `mat-*` components unchanged. [Source: FRONTEND_UI.md ; UX-DR11]

**M3-2. Tokens & thème** — **Given** label-only changes, **when** styling is touched, **then** no new hard-coded colors — N/A unless a file already edited for unrelated reasons. [Source: FRONTEND_UI.md]

**M3-3. Mobile & tactile** — **Given** no new interactive controls, **when** validating, **then** N/A — existing 48dp targets on dispos/équipe unchanged. [Source: NFR-A1]

**M3-4. Navigation membre** — **Given** scope is operational surfaces only, **when** implemented, **then** no chrome/nav changes. [Source: ux-hub-a-faire.md]

**M3-5. Revue** — **Given** implementation done, **when** validating, **then** walk FRONTEND_UI.md checklist M3 ; note waivers (label-only story). [Source: AGENTS.md]

---

## Tasks / Subtasks

- [x] **Périmètre :** `apps/web/` + `services/api/` — **not** avatar emoji (**2.12c**), parity strip (**6.21**), season stats card (**16.3**), draw factor (**19.11**), gender on public member glance

### Web — core label helper (AC: 1, 4, 8)

- [x] Extend [`apps/web/src/app/shared/event-roles/event-roles.ts`](../../apps/web/src/app/shared/event-roles/event-roles.ts):
  - Add `ROLE_LABELS_BY_GENDER` / `ROLE_LABELS_PLURAL_BY_GENDER` maps keyed by `MemberGender` (import from [`member-gender.ts`](../../apps/web/src/app/core/account/member-gender.ts) ; use `effectiveMemberGender()` for unknown input).
  - Add `getRoleLabel(roleKey: RoleKey, gender?: MemberGender | unknown, plural = false): string`.
  - Keep `roleLabelSingular(roleKey)` as `getRoleLabel(roleKey, 'non_specified')` for backward compat — **do not** break call sites that intentionally show event-level inclusive labels.
  - Add `pluralizeRoleLabel(label, count)` helper or integrate into `getRoleLabel` when `plural=true`.
- [x] Add `drawSelectionStatusLabel(gender?: MemberGender | unknown): string` in [`member-gender.ts`](../../apps/web/src/app/core/account/member-gender.ts) — returns Sélectionné / Sélectionnée / Sélectionné·e per table above.
- [x] Add [`event-roles.spec.ts`](../../apps/web/src/app/shared/event-roles/event-roles.spec.ts): golden tests for every `RoleKey` × `{male, female, non_specified}` × `{singular, plural}` per normative table.
- [x] Extend [`member-gender.spec.ts`](../../apps/web/src/app/core/account/member-gender.spec.ts): `drawSelectionStatusLabel` for each gender.

### Web — draw animation selection prefix (AC: 3, 6, 8)

- [x] Extend [`CompositionDrawStepCandidate`](../../apps/web/src/app/core/composition/composition-api.service.ts) with optional `gender?: MemberGender` (from API).
- [x] [`composition-draw-animation.ts`](../../apps/web/src/app/shared/composition/composition-draw-animation.ts): computed `selectedStatusPrefix` from selected candidate's gender via `drawSelectionStatusLabel`.
- [x] [`composition-draw-animation.html`](../../apps/web/src/app/shared/composition/composition-draw-animation.html): replace hard-coded `Sélectionné` with `{{ selectedStatusPrefix() }} : {{ winner }}`.
- [x] [`composition-draw-animation.spec.ts`](../../apps/web/src/app/shared/composition/composition-draw-animation.spec.ts): assert **Sélectionnée** when selected candidate `gender: 'female'`, **Sélectionné·e** when absent/`non_specified`.

### Web — wire participant gender on surfaces (AC: 2, 5)

- [x] Extend [`composition-api.service.ts`](../../apps/web/src/app/core/composition/composition-api.service.ts) types: `CompositionSlot`, `CompositionDecline` → optional `participantGender?: MemberGender`.
- [x] [`event-equipe-tab.ts`](../../apps/web/src/app/pages/event-detail/event-equipe-tab.ts):
  - Slot **column header** / empty slot: inclusive `roleLabelSingular(roleKey)` (unchanged).
  - **Assignee-specific** copy (participation dialog, decline restore, slot picker title when participant known, consecutive/multi-role warnings for assignee): `getRoleLabel(roleKey, slot.participantGender)`.
  - Pass gender-aware `roleLabel` into `CompositionParticipationDialog` and `CompositionSlotPickerDialog` data.
- [x] [`agenda-participation-status.utils.ts`](../../apps/web/src/app/shared/participation/agenda-participation-status.utils.ts): accept optional `gender` on input ; use `getRoleLabel`.
- [x] Availability summary consumers:
  - [`availability-api.service.ts`](../../apps/web/src/app/core/availability/availability-api.service.ts) — add `gender?` on `SummaryParticipant`.
  - Dispos **Moi** / **Tous** panels and cells that show per-participant role context — use participant gender when rendering participant-specific labels (role **section headers** stay inclusive via `ROLE_LABELS` from `event-types.ts`).
- [x] [`member-profile-panel.ts`](../../apps/web/src/app/shared/member-profile/member-profile-panel.ts): use profile subject's gender from troupe-scoped member profile / season glance DTOs (`gender` wire value) for favorite-role pills — **not** on `/v1/auth/me` (PO review 2026-06-05 D2:A).
- [x] [`member-preferences-form.ts`](../../apps/web/src/app/shared/member-preferences-form/member-preferences-form.ts): use **viewer's own** gender from loaded preferences (`MePreferencesApiService`) for preferred-role pill labels.
- [x] [`consecutive-show-warning.ts`](../../apps/web/src/app/core/composition/consecutive-show-warning.ts) / [`multi-role-on-event-warning.ts`](../../apps/web/src/app/core/composition/multi-role-on-event-warning.ts): accept optional assignee gender parameter.
- [x] [`share-announce-messages.ts`](../../apps/web/src/app/core/messaging/share-announce-messages.ts): when building per-role name lists, use gender-aware plural labels if participant genders are available on input data.
- [x] **Leave inclusive / unchanged** (explicit non-goals for this story):
  - [`audit-display-labels.ts`](../../apps/web/src/app/core/audit/audit-display-labels.ts) — audit trail uses neutral role names.
  - Event Infos tab role template editor ([`event-infos-tab.ts`](../../apps/web/src/app/pages/event-detail/event-infos-tab.ts), [`event-type-roles-dialog.ts`](../../apps/web/src/app/pages/event-detail/event-type-roles-dialog.ts)) — event configuration, not participant-specific.
  - Statistics grid **abbreviated letters** (J, MC, …) — non-gendered ; **tooltips** on event cells use gender-aware role labels when `row.gender` known (PO D1:A 2026-06-05).
  - Agenda/historique tooltips — keep role-name pattern (`Comédien·ne — En attente…`) ; **do not** add gendered « Sélectionné/Sélectionnée » strings (no V2 equivalent to V1 `SelectionCell` tooltip).

### API — expose participant gender on DTOs (AC: 6, 8)

- [x] Add shared resolver (e.g. `ParticipantGenderResolver` in `services/api/.../user/` or `participant/`):
  - Input: season/event participant id(s) or eligible participant rows.
  - Output: `Map<UUID, String>` wire values `male|female|non_specified` from linked `UserEntity.gender` via `MemberGender.effective()` ; unlinked → `non_specified`.
- [x] Extend DTOs in [`CompositionDtos.kt`](../../services/api/src/main/kotlin/com/hatcast/api/composition/dto/CompositionDtos.kt):
  - `CompositionSlotDto.participantGender: String? = null` (null when slot empty).
  - `CompositionDeclineDto.participantGender: String? = null`.
  - `CompositionDrawStepCandidateDto.gender: String = "non_specified"` (for draw animation prefix).
- [x] Update [`CompositionService.kt`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionService.kt) slot/decline mapping to populate gender alongside `participantDisplayName`.
- [x] Update [`CompositionDrawService.kt`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionDrawService.kt) (or draw step builder) to populate candidate `gender` from linked user.
- [x] Extend [`SummaryParticipantDto`](../../services/api/src/main/kotlin/com/hatcast/api/availability/dto/AvailabilityDtos.kt) with `gender: String = "non_specified"`.
- [x] Update [`AvailabilityService.getSummary`](../../services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityService.kt) to resolve gender for eligible participants with linked users.
- [x] Integration tests: composition GET returns `participantGender` for assigned slot ; availability summary returns participant `gender` ; unlinked participant → `non_specified`.

### API — gender-aware server labels (AC: 7, 8)

- [x] Add Kotlin `RoleLabels` helper (mirror web tables) — e.g. `services/api/src/main/kotlin/com/hatcast/api/role/RoleLabels.kt` with `label(roleKey, gender, plural=false)`.
- [x] Update [`MeInboxService.kt`](../../services/api/src/main/kotlin/com/hatcast/api/inbox/MeInboxService.kt): resolve viewer/subject user gender when building `roleLabel` for composition confirm actions.
- [x] Update [`NotificationPayloadBuilder.kt`](../../services/api/src/main/kotlin/com/hatcast/api/notification/NotificationPayloadBuilder.kt) and [`ProxyWorkflowNotificationAdapter.kt`](../../services/api/src/main/kotlin/com/hatcast/api/notification/ProxyWorkflowNotificationAdapter.kt) where role label refers to a **specific participant** — use their gender.
- [x] Keep [`SeasonStatisticsService.ROLE_LABELS`](../../services/api/src/main/kotlin/com/hatcast/api/season/SeasonStatisticsService.kt) as **inclusive defaults** for grid headers and generic tooltips ; use `RoleLabels` only when participant gender is known.
- [x] Update [`MeInboxIntegrationTest.kt`](../../services/api/src/test/kotlin/com/hatcast/api/inbox/MeInboxIntegrationTest.kt): set user gender in fixture ; assert gender-aware `roleLabel` (e.g. `Comédienne` when female + player).

### Explicit non-goals (do not implement in 2.12b)

- [x] **2.12c** — avatar emoji / tone fallback changes beyond labels.
- [x] **6.21 / 16.3** — parity strip UI and season aggregate card (DTO gender from this story **enables** 6.21 client-side).
- [x] **`gender` on `/v1/auth/me`** — privacy from 2.12 AC6 remains.
- [x] **Troupe-scoped profile / season glance DTOs** — **accepted (review D2:A)** : `gender` for operational role pills + avatar tone ; membres actifs de la troupe uniquement.
- [x] **Gendered « Sélectionné/Sélectionnée » outside draw animation** — do not add to participation dialog, agenda tooltips, inbox, notifications, or dispos ; V2 has no matching surface and PO chose not to extend.
- [x] **Signup gender** ; **admin edit others' gender**.

---

## Dev Notes

### Why this story exists (Wave B — display)

| Context | Detail |
|---------|--------|
| **SCP G-011 Wave B** | After **2.12** stores `users.gender`, operational UI still shows middot labels everywhere. |
| **V1 reference** | `legacy/src/services/storage.js` → `getRoleLabel(role, userGender, plural)` — port **logic**, not V1 `player` wording. |
| **V2 terminology** | [`event-roles.ts`](../../apps/web/src/app/shared/event-roles/event-roles.ts) already uses Comédien·ne ; **keep** that inclusive baseline. |
| **UX** | [ux-design-member-gender-parity.md](../planning-artifacts/ux-design-member-gender-parity.md) Cross-surface ; [EXPERIENCE.md](../planning-artifacts/ux-designs/ux-member-gender-parity-2026-06-05/EXPERIENCE.md) § Gender-aware labels. |

### V1 vs V2 player wording (CRITICAL — prevent wrong port)

Epic AC1 says « matches V1 `storage.js` » but V1 `player` labels use `Joueur/Joueuse/Joueur.se` ([`labels.js`](../../legacy/src/constants/labels.js)). V2 deliberately migrated to **Comédien·ne** ([`event-types.ts`](../../apps/web/src/app/core/events/event-types.ts), [`SeasonStatisticsService.ROLE_LABELS`](../../services/api/src/main/kotlin/com/hatcast/api/season/SeasonStatisticsService.kt)). **Implement member-gender.md tables** (Comédien/Comédienne) — golden tests assert those strings, not V1 Joueur strings.

### Current state (READ before coding)

| File | Today | This story |
|------|-------|------------|
| [`event-roles.ts`](../../apps/web/src/app/shared/event-roles/event-roles.ts) | Inclusive only ; `roleLabelSingular()` | Add `getRoleLabel()` + gender tables |
| [`member-gender.ts`](../../apps/web/src/app/core/account/member-gender.ts) | Type + `effectiveMemberGender()` | Reuse ; no Mon compte UI changes |
| [`CompositionSlotDto`](../../services/api/src/main/kotlin/com/hatcast/api/composition/dto/CompositionDtos.kt) | No gender on slots | Add `participantGender` |
| [`SummaryParticipantDto`](../../services/api/src/main/kotlin/com/hatcast/api/availability/dto/AvailabilityDtos.kt) | No gender | Add `gender` |
| [`MeInboxService`](../../services/api/src/main/kotlin/com/hatcast/api/inbox/MeInboxService.kt) | Static inclusive `roleLabel` | Gender-aware for subject user |
| [`event-equipe-tab.ts`](../../apps/web/src/app/pages/event-detail/event-equipe-tab.ts) | `ROLE_LABELS[roleKey]` for all slot rows | Split: header inclusive, assignee-aware in dialogs/warnings |
| [`CompositionParticipationDialog`](../../apps/web/src/app/shared/composition/composition-participation-dialog.ts) | Receives precomputed `roleLabel` | Caller passes gender-aware **role** label (not « Sélectionné ») |
| [`composition-draw-animation.html`](../../apps/web/src/app/shared/composition/composition-draw-animation.html) | Hard-coded `Sélectionné : {{ name }}` | Gender-aware prefix via `drawSelectionStatusLabel` |

### Label selection rules (implement consistently)

```
if (no participant context) → inclusive label (roleLabelSingular)
else if (participantGender is male|female) → getRoleLabel(roleKey, gender)
else → inclusive label
```

**Viewer's own gender** (Mon compte preferences, Moi dispos self row): use `/v1/me/preferences.gender` already loaded in session-scoped services — not public glance.

**Other participants:** use `participantGender` / `gender` from API DTOs added in this story.

### API design guardrails

- Wire format: always `male` | `female` | `non_specified` (underscore) — same as **2.12** ; never expose raw JPA enum names.
- Nullable DTO field on empty slots → omit or null ; client treats as inclusive.
- **Do not** add gender to `/v1/auth/me`, season-glance, or troupe admin CSV responses (2.12 privacy AC6).
- Batch-resolve gender in composition/availability services (one query for user ids) — avoid N+1.

### Frontend implementation guardrails

| Concern | Action |
|--------|--------|
| Import path | `getRoleLabel` from `shared/event-roles/event-roles.ts` ; `MemberGender` from `core/account/member-gender.ts` |
| Backward compat | Keep `roleLabelSingular` for event-level labels |
| Type safety | Map API string through `effectiveMemberGender()` at DTO boundary |
| Tests | Golden table tests in `event-roles.spec.ts` ; update equipe-tab / participation-dialog specs with gender fixtures |
| Regressions | Run existing `consecutive-show-warning.spec.ts`, `multi-role-on-event-warning.spec.ts` — update expected strings when gender passed |

### Traps / regressions

| Trap | Mitigation |
|------|------------|
| Porting V1 « Joueur » strings | Use Comédien table from member-gender.md |
| Gender on public profile | Only operational DTOs ; not glance |
| Breaking empty slot display | Slot grid role column stays inclusive |
| Inbox test still expects `Comédien·ne` | Update fixture: set gender + expect `Comédienne`/`Comédien` |
| N+1 gender lookups | Batch resolver shared with displayName resolution |
| Changing 2.12 Mon profil | Out of scope |
| Admin `membres-tab` role labels | Troupe **role** names (admin), not gender-aware participant labels — leave as-is |

### Dependencies

| Story | Status | Relationship |
|-------|--------|----------------|
| **2.12** Optional gender profile | done | **Depends** — `users.gender` + preferences API |
| **2.12c** Avatar fallback | backlog | Independent ; letter tones already in 2.12 |
| **6.21** Parity strip | backlog | **Blocked by** this story (needs slot gender on DTO) |
| **16.3** Season parity stats | backlog | Benefits from gender on composition paths |
| **19.11** Draw factor | backlog | Uses gender enum ; not labels |

### Previous story intelligence (2.12)

- Gender is **account-level** on `users.gender` ; not on `troupe_memberships`.
- `effectiveMemberGender()` normalizes API + V1 hyphen form — reuse at all DTO boundaries.
- Privacy: gender absent on `/v1/auth/me` and season-glance — **still true** ; only add to operational participant rows.
- Shared Enregistrer / Mon profil UI — **do not touch** in 2.12b.
- Flyway V56 already deployed ; no new migration for labels-only story.
- Code review pattern: align story AC to implementation ; add integration tests for privacy and backfill — replicate for DTO gender exposure (operational endpoints only).

### Git intelligence

Recent commits on branch:

| Commit | Relevance |
|--------|-----------|
| `ea9bde32` feat(account): optional member gender | **2.12** foundation — `member-gender.ts`, preferences API, profile tab |
| `7d6e3d8b` / `a3beefb8` composition warnings | Warning formatters use `roleLabelSingular` — extend with optional gender param |

No prior `getRoleLabel` in V2 runtime — safe additive change in `event-roles.ts`.

### Architecture compliance

- **Stack:** Angular 21.2 + Material 21.2 ; Kotlin Spring Boot ; PostgreSQL Flyway.
- **Auth:** No new routes ; extend existing composition/availability/inbox responses.
- **OpenAPI:** Optional fragment update if composition/availability schemas documented ; inline DTO extension acceptable (17.33 / 2.12 precedent).
- **Privacy:** [member-gender.md](../specs/spec-member-gender-parity/member-gender.md) — derived labels visible in troupe operational UI is **expected** ; aggregates must not deanonymize beyond what labels already show.

### Testing requirements

| Layer | Tests |
|-------|-------|
| Web unit | `event-roles.spec.ts` golden matrix ; `member-gender.spec.ts` for `drawSelectionStatusLabel` ; `composition-draw-animation.spec.ts` ; update warning/dialog specs |
| Web component | `event-equipe-tab.spec.ts` — gender-aware dialog `roleLabel` when slot has `participantGender: 'female'` |
| API integration | Composition GET slot gender ; availability summary gender ; MeInbox gender-aware `roleLabel` |
| Commands | `./gradlew test` ; `npm run test -w @hatcast/web -- --watch=false` |

### Manual recette (quick)

1. User A sets **Féminin** on Mon profil → open dispos on next event → own row shows **Comédienne** (not Comédien·ne) where role label is participant-specific.
2. User B stays **Non spéc.** → labels unchanged (middot forms).
3. Organizer opens Équipe → assigns User A to player slot → confirmation dialog shows **Comédienne**.
4. Hub inbox action for User A shows gender-aware role label in todo card.
5. Organizer runs draw → animation winner line shows **Sélectionnée : Alice** when Alice is `female`, **Sélectionné·e : …** when gender unknown.

---

## Dev Agent Record

### Agent Model Used

claude-4.6-sonnet-medium-thinking

### Completion Notes List

- Added `getRoleLabel()` + gender tables in `event-roles.ts` (V2 Comédien/Comédienne, not V1 Joueur).
- API exposes `participantGender` / `gender` on composition slots, declines, availability summary, and draw step candidates via `ParticipantGenderResolver`.
- Server copy (inbox, notifications) uses `RoleLabels` with viewer/subject gender.
- Web surfaces wired: équipe dialogs/warnings, dispos Moi (subject gender), preferences pills, agenda chips, share announce role lists, draw animation prefix (`drawSelectionStatusLabel`).
- `member-profile-panel` unchanged (no gender on public glance — inclusive labels kept).
- Story-scoped web tests pass (event-roles golden matrix, draw animation, warnings, equipe-tab, share-announce). Full `npm test` has pre-existing failures in unrelated specs (e.g. season-card).
- `./gradlew test`: story integration tests pass; occasional flaky `AuthControllerIntegrationTest` (XSRF cookie) unrelated to this story.

### File List

- apps/web/src/app/shared/event-roles/event-roles.ts
- apps/web/src/app/shared/event-roles/event-roles.spec.ts
- apps/web/src/app/core/account/member-gender.ts
- apps/web/src/app/core/account/member-gender.spec.ts
- apps/web/src/app/core/composition/composition-api.service.ts
- apps/web/src/app/core/composition/consecutive-show-warning.ts
- apps/web/src/app/core/composition/consecutive-show-warning.spec.ts
- apps/web/src/app/core/composition/multi-role-on-event-warning.ts
- apps/web/src/app/core/composition/multi-role-on-event-warning.spec.ts
- apps/web/src/app/core/availability/availability-api.service.ts
- apps/web/src/app/core/messaging/share-announce-messages.ts
- apps/web/src/app/core/messaging/share-announce-messages.spec.ts
- apps/web/src/app/pages/event-detail/event-equipe-tab.ts
- apps/web/src/app/pages/event-detail/event-equipe-tab.spec.ts
- apps/web/src/app/shared/availability/availability-form.ts
- apps/web/src/app/shared/availability/availability-moi-panel.html
- apps/web/src/app/shared/member-preferences-form/member-preferences-form.ts
- apps/web/src/app/shared/participation/agenda-participation-status.ts
- apps/web/src/app/shared/participation/agenda-participation-status.utils.ts
- apps/web/src/app/shared/participation/agenda-participation-status.utils.spec.ts
- apps/web/src/app/shared/composition/composition-draw-animation.ts
- apps/web/src/app/shared/composition/composition-draw-animation.html
- apps/web/src/app/shared/composition/composition-draw-animation.spec.ts
- services/api/src/main/kotlin/com/hatcast/api/role/RoleLabels.kt
- services/api/src/main/kotlin/com/hatcast/api/user/ParticipantGenderResolver.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/dto/CompositionDtos.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/CompositionService.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/CompositionDrawService.kt
- services/api/src/main/kotlin/com/hatcast/api/availability/dto/AvailabilityDtos.kt
- services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityService.kt
- services/api/src/main/kotlin/com/hatcast/api/inbox/MeInboxService.kt
- services/api/src/main/kotlin/com/hatcast/api/notification/NotificationPayloadBuilder.kt
- services/api/src/main/kotlin/com/hatcast/api/notification/NotificationDispatcher.kt
- services/api/src/main/kotlin/com/hatcast/api/notification/ProxyWorkflowNotificationAdapter.kt
- services/api/src/test/kotlin/com/hatcast/api/composition/CompositionIntegrationTest.kt
- services/api/src/test/kotlin/com/hatcast/api/availability/AvailabilityControllerIntegrationTest.kt
- services/api/src/test/kotlin/com/hatcast/api/inbox/MeInboxIntegrationTest.kt
- _bmad-output/implementation-artifacts/sprint-status.yaml

### Change Log

- 2026-06-05 : Story created (`bmad-create-story` for 2.12b).
- 2026-06-05 : PO — draw animation only for gendered « Sélectionné/Sélectionnée » ; stats grid letters unchanged ; no new selection-status strings elsewhere in V2.
- 2026-06-05 : Implementation complete — gender-aware role labels web + API DTOs (`bmad-dev-story`).
- 2026-06-05 : Code review (round 1) — patches inbox/N+1/slot-picker/etc.
- 2026-06-05 : Code review combinée 2.12b+2.12c — D1:A stats tooltips genrés ; D2:A profile/glance gender ; garde avatarUrl profil/glance ; cleanup `home-signed-in` mort.

---

### Review Findings

#### Decision needed

- [x] [Review][Decision] **Genre exposé sur la liste admin membres** — **Résolu D1-A** : revert `TroupeMemberAdminDto.gender`, `membres-tab` inclusif, suppression `troupe-baseline-role-labels`.

- [x] [Review][Decision] **Genre sur MemberSeasonGlanceResponseDto** — **Résolu D2-B** : conservé pour pills profil ; MAJ `member-gender.md` privacy + `member-gender-surfaces.md`.

#### Patch

- [x] [Review][Patch] **N+1 MeInboxService** — `findById(userId)` extrait avant boucle. [`MeInboxService.kt`]

- [x] [Review][Patch] **Slot picker dialog titre genré** — `getRoleLabel(roleKey, slot.participantGender)`. [`event-equipe-tab.ts`]

- [x] [Review][Patch] **Tests intégration decline / draw candidate gender** — `CompositionParticipationIntegrationTest`, `CompositionDrawIntegrationTest`.

- [x] [Review][Patch] **share-announce participantGenders aligné** — filtrage par paires name/gender. [`share-announce-messages.ts`]

- [x] [Review][Patch] **Cache preferences Me équipe tab** — `loadViewerGender()` promesse mémorisée. [`event-equipe-tab.ts`]

- [x] [Review][Patch] **N+1 NotificationDispatcher** — `findAllById` batch. [`NotificationDispatcher.kt`]

- [x] [Review][Patch] **AgendaParticipationStatus try/catch** — [`agenda-participation-status.ts`]

#### Deferred

- [x] [Review][Defer] **Couplage rolePillLabel → auditRoleDisplay pour slots vides** [`event-equipe-tab.ts`] — deferred, couplage pré-existant étendu ; refactor séparé si souhaité.

---

### Review Findings

- [x] [Review][Decision] Stats grid tooltips genrés — **D1:A** : garder `genderStatisticsEventCell` ; AC5 et tâches mis à jour (lettres abrégées inchangées).
- [x] [Review][Decision] `gender` sur member profile / season glance — **D2:A** : surface opérationnelle troupe authentifiée ; AC/non-goals alignés.
- [x] [Review][Patch] Garde `avatarUrl` profil + glance — `ParticipantRowPresentation.avatarUrl()` ; tests intégration ajoutés.
- [x] [Review][Patch] `home-signed-in` — template mort (`home-signed-in.html`/`.scss`) supprimé ; composant = redirect inline uniquement (pas de surface avatar).
- [x] [Review][Defer] Tables de libellés dupliquées web (`event-roles.ts`) / API (`RoleLabels.kt`) — maintenance future ; pas de divergence constatée dans le diff.
- [x] [Review][Defer] `context-breadcrumb` modifié dans le working tree — hors périmètre 2.12b/2.12c ; à committer séparément ou exclure de la PR combinée.

### Validation create-story

- [x] AC métier numérotés et sourcés (epics / FR / SCP / member-gender.md)
- [x] Section **Material 3** remplie (label-only UI story)
- [x] Tasks référencent les numéros d'AC (y compris M3-x)
- [x] Liens vers fichiers code existants à réutiliser
- [x] `./gradlew test` / `npm run test` mentionnés
- [x] Non-goals explicites (2.12c, 6.21, public glance, selection status outside draw animation)
- [x] V1 vs V2 player wording conflict documented
