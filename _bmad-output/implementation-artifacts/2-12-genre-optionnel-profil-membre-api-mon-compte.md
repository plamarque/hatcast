# Story 2.12: Optional member gender — profile, API, Mon compte

Status: done

baseline_commit: 1b6b03ff4b505ddadc1e7e303fc62fdead0d021b

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

## Story

As a **member**,  
I want to **optionally declare my gender** on my account profile,  
so that the app can **personalize labels and avatars** while I can keep **Non précisé** for inclusive defaults.

## Acceptance Criteria

1. **Given** a signed-in user, **when** they open **Mon compte → Mon profil**, **then** a **Genre** segmented control offers **Féminin**, **Non spéc.**, **Masculin** (default **Non spéc.** when never set), with question *Quel genre utiliser pour me désigner ?* and a shared **Enregistrer** button. [Source: [ux-design-member-gender-parity.md](../planning-artifacts/ux-design-member-gender-parity.md) Screen 1 **frozen 2026-06-05** ; FR9/FR10]
2. **Given** they change the selection, **when** the API persists, **then** `users.gender` is `male` | `female` | `non_specified` and `GET /v1/me/preferences` returns the same value. [Source: [member-gender.md](../specs/spec-member-gender-parity/member-gender.md) ; SCP G-011]
3. **Given** gender is unset or `non_specified`, **when** any UI renders role labels, **then** inclusive middot forms remain unchanged (no regression — label adaptation is **2.12b**). [Source: epics 2.12 AC3]
4. **Given** V1 import, **when** users CSV includes a `gender` column (or backfill runs), **then** V1 values map per table below and invalid values become `non_specified`; **activated** accounts receive gender backfill without overwriting display name. [Source: SCP G-011 ; companion member-gender.md]
5. **Given** account deletion (FR37), **when** anonymization runs, **then** `users.gender` is cleared with other PII. [Source: member-gender.md]
6. **Given** another member views a public profile glance, **when** gender is set, **then** raw gender is **not** exposed on `/membre/:userSlug` or admin member list in Wave A (OQ-G-011-01 / OQ-G-011-03). [Source: SCP §4.1 AC5]
7. **Given** implementation complete, **when** tests run, **then** `./gradlew test` and `npm run test -w @hatcast/web -- --watch=false` pass for story scope. [Source: AGENTS.md]

**V1 → V2 gender mapping (normative for AC 4):**

| V1 `players.gender` | V2 `users.gender` |
|---------------------|-------------------|
| `male` | `male` |
| `female` | `female` |
| `non-specified`, `unknown`, null, invalid | `non_specified` |

When multiple V1 player rows link to one user: prefer the most recently updated non-`non_specified` value; else `non_specified`.

**Product coverage:** FR9/FR10 ; V1 parity foundation (SCP G-011). **Priority:** P1. **Depends:** **17.36** (done). **Blocks:** **2.12b**, **2.12c**, **6.21**, **16.3**, **19.11**.

---

## Acceptance Criteria — Material 3 (UI)

**M3-1. Composants Material** — **Given** the Gender block on Mon profil, **when** rendered, **then** use `mat-button-toggle-group` with three exclusive `mat-button-toggle` options (Féminin · Non spéc. · Masculin), order L→R, `hideSingleSelectionIndicator`, and visible question label — not `mat-radio-group`. [Source: ux-design-member-gender-parity.md Screen 1 frozen ; FRONTEND_UI.md ; UX-DR11]

**M3-2. Tokens & thème** — **Given** new SCSS for the gender block, **when** colors/spacing apply, **then** only `var(--mat-sys-*)` / `color-mix` and `--hatcast-member-gender-*` semantic tokens ; reuse `account-page__*` rhythm from [`account-placeholder.scss`](../../apps/web/src/app/pages/account-placeholder/account-placeholder.scss). [Source: DESIGN.md spacing tokens]

**M3-3. Mobile & tactile** — **Given** viewport **max-width: 480px**, **when** toggle rows render, **then** each row ≥ **48×48 dp** touch target ; `data-testid` on group and each option per UX spec. [Source: NFR-A1 ; ux-design-member-gender-parity.md]

**M3-4. Navigation membre** — **Given** change is scoped to `/compte` Mon profil tab, **when** implemented, **then** no change to global member chrome (17.22 rail). [Source: ux-hub-a-faire.md]

**M3-5. Revue** — **Given** implementation done, **when** validating, **then** walk FRONTEND_UI.md checklist M3 and note waivers in Dev Notes. [Source: AGENTS.md]

---

## Tasks / Subtasks

- [x] **Périmètre :** `services/api/` + `apps/web/` + migration scripts (V1 backfill) — **not** role labels, cross-surface avatar tone wiring, parity strip (stories **2.12b**, **2.12c**, **6.21**)

### API — schema & domain (AC: 2, 4, 5)

- [x] Add Flyway **`V56__users_gender.sql`**: `ALTER TABLE users ADD COLUMN gender VARCHAR(32)` ; nullable ; no backfill in SQL (app default `non_specified` on read).
- [x] Add `MemberGender` enum (`MALE`, `FEMALE`, `NON_SPECIFIED`) with JSON/DB string helpers `male` | `female` | `non_specified` in [`services/api/src/main/kotlin/com/hatcast/api/user/`](../../services/api/src/main/kotlin/com/hatcast/api/user/).
- [x] Add `@Enumerated(EnumType.STRING)` field on [`UserEntity.kt`](../../services/api/src/main/kotlin/com/hatcast/api/user/UserEntity.kt) — nullable column ; `toResponse()` maps null → `non_specified`.
- [x] Clear `user.gender = null` in [`AccountDeletionService.anonymizeUser`](../../services/api/src/main/kotlin/com/hatcast/api/auth/AccountDeletionService.kt) ; extend [`AccountDeletionIntegrationTest`](../../services/api/src/test/kotlin/com/hatcast/api/auth/AccountDeletionIntegrationTest.kt).

### API — preferences endpoint (AC: 2, 7)

- [x] Extend [`UserMemberPreferencesResponseDto`](../../services/api/src/main/kotlin/com/hatcast/api/user/dto/UserMemberPreferencesDtos.kt) with `gender: String` (always present, default `non_specified`).
- [x] Extend [`PatchUserMemberPreferencesRequest`](../../services/api/src/main/kotlin/com/hatcast/api/user/dto/UserMemberPreferencesDtos.kt) with optional `gender: String?` ; validate allowed values only.
- [x] Update [`UserMemberPreferencesService.patchPreferences`](../../services/api/src/main/kotlin/com/hatcast/api/user/UserMemberPreferencesService.kt):
  - Accept patch when **only** `gender` is sent (update empty-body guard).
  - Persist enum ; **do not** sync gender to `troupe_memberships` (account-level only).
- [x] Extend [`MeMemberPreferencesIntegrationTest`](../../services/api/src/test/kotlin/com/hatcast/api/user/MeMemberPreferencesIntegrationTest.kt): GET default `non_specified` ; PATCH each value ; invalid → 400 ; CSRF required.

### API — V1 CSV import backfill (AC: 4)

- [x] Extend [`UserCsvCodec`](../../services/api/src/main/kotlin/com/hatcast/api/user/UserCsvCodec.kt): optional column `gender` (case-insensitive header) ; map V1 `non-specified` → `non_specified`.
- [x] Extend [`UserImportService`](../../services/api/src/main/kotlin/com/hatcast/api/user/UserImportService.kt): on create/update user from CSV, set gender when column present ; invalid → `non_specified`.
- [x] Extend V1 export [`scripts/v1/troupeMembersCsv.js`](../../scripts/v1/troupeMembersCsv.js) + [`scripts/v1-export-season-users-csv.js`](../../scripts/v1-export-season-users-csv.js): add `gender` column from `players.gender` with V1→V2 mapping ; document in [`docs/v2/migration/v1-troupe-members-csv-recipe.md`](../../docs/v2/migration/v1-troupe-members-csv-recipe.md) (one paragraph + mapping table).
- [x] Integration test: import CSV row with `gender=female` persists on user.

### Web — Mon profil UI (AC: 1, 2, M3)

- [x] Extend [`UserMemberPreferences`](../../apps/web/src/app/core/account/me-preferences-api.service.ts) type + `patchPreferences` body with `gender?: MemberGender`.
- [x] Add shared type `MemberGender = 'male' | 'female' | 'non_specified'` (e.g. `apps/web/src/app/core/account/member-gender.ts`).
- [x] [`account-profile-tab.ts/html`](../../apps/web/src/app/pages/account-placeholder/tabs/account-profile-tab.ts): after pseudo block, before **Modes de connexion**:
  - `mat-button-toggle-group` ; question **Quel genre utiliser pour me désigner ?** ; options Féminin / Non spéc. / Masculin (L→R).
  - **Shared Enregistrer** saves dirty pseudo and/or gender (PATCH only changed fields).
  - Live avatar preview on Mon profil and rail/menu via `MemberDisplayNameService.setGenderPreview` (UX Screen 1).
  - `data-testid`: `account-gender-group`, `account-gender-female`, `account-gender-non-specified`, `account-gender-male`, `account-profile-save`.
  - Import `MatButtonToggleModule`.
- [x] SCSS: `.account-page__gender-toggle` + `--hatcast-member-gender-*` tone tokens ; 48dp toggles at ≤480px.
- [x] [`account-profile-tab.spec.ts`](../../apps/web/src/app/pages/account-placeholder/tabs/account-profile-tab.spec.ts): load preferences with gender ; toggle + Enregistrer → PATCH ; preview ; snack on failure.

### Explicit non-goals (do not implement in 2.12)

- [x] **2.12b** — `getRoleLabel(role, gender)` ; no changes under `event-roles.ts` beyond type export if needed.
- [x] **2.12c** — cross-surface avatar tone wiring in `user-avatar` (Mon profil preview done here).
- [x] **6.21 / 16.3** — parity strip / season stats.
- [x] **`gender` on composition/member list DTOs** — deferred to **2.12b** (frontend needs it for labels).
- [x] **Gender on signup** ; **admin edit others' gender** ; **draw factor 19.11**.

---

## Dev Notes

### Why this story exists (Wave A foundation)

| Context | Detail |
|---------|--------|
| **SCP G-011** | V2 shipped without V1 optional gender — blocks labels, avatars, parity hints, draw factor **19.11**. |
| **Spec** | [_spec-member-gender-parity/SPEC.md_](../specs/spec-member-gender-parity/SPEC.md) + [_member-gender.md_](../specs/spec-member-gender-parity/member-gender.md) ; SPEC.md + DOMAIN.md already amended. |
| **UX** | [ux-design-member-gender-parity.md](../planning-artifacts/ux-design-member-gender-parity.md) Screen 1 only. |
| **Placement** | After **Pseudo**, before **Modes de connexion** on [`account-profile-tab.html`](../../apps/web/src/app/pages/account-placeholder/tabs/account-profile-tab.html) — amends [ux-design-mon-compte.md](../planning-artifacts/ux-design-mon-compte.md) C1. |

### Current state (READ before coding)

| File | Today | This story |
|------|-------|------------|
| [`UserEntity.kt`](../../services/api/src/main/kotlin/com/hatcast/api/user/UserEntity.kt) | No `gender` column | Add nullable enum field |
| [`UserMemberPreferencesDtos.kt`](../../services/api/src/main/kotlin/com/hatcast/api/user/dto/UserMemberPreferencesDtos.kt) | `memberDisplayName`, `preferredRoleKeys` only | Add `gender` |
| [`MePreferencesController.kt`](../../services/api/src/main/kotlin/com/hatcast/api/user/MePreferencesController.kt) | GET/PATCH `/v1/me/preferences` | Same routes — extend DTOs |
| [`account-profile-tab`](../../apps/web/src/app/pages/account-placeholder/tabs/account-profile-tab.ts) | Pseudo + auth modes + delete | Add gender toggle block + shared Enregistrer |
| [`UserCsvCodec`](../../services/api/src/main/kotlin/com/hatcast/api/user/UserCsvCodec.kt) | `email`, `displayName` | Optional `gender` column |
| [`legacy/storage.js`](../../legacy/src/services/storage.js) | V1 `getRoleLabel(role, userGender)` | Reference only — port in **2.12b** |

### API design guardrails

**Extend existing endpoint** (do **not** create `/v1/me/profile` — preferences is the account-level self-service surface since **17.33**):

```json
// GET /v1/me/preferences — response (add field)
{
  "memberDisplayName": "Léa",
  "preferredRoleKeys": ["player", "volunteer"],
  "gender": "non_specified"
}

// PATCH /v1/me/preferences — body (any subset)
{ "gender": "female" }
```

- Invalid gender string → **400** French message.
- PATCH with all-null body → **400** (extend guard to include `gender`).
- Gender patch does **not** trigger `syncActiveMemberships` display-name sync (only pseudo/roles do).
- **Privacy:** Do **not** add `gender` to session `/v1/auth/me`, public member glance DTOs, or troupe member list responses in this story.

### Frontend implementation guardrails

| Concern | Action |
|--------|--------|
| Save UX | **Shared Enregistrer** ; PATCH only dirty fields ; disable save while saving ; revert on error + snack |
| Live preview | `setGenderPreview` on toggle change ; `avatarGender` on rail/menu trigger |
| Load | Bind toggle from `GET /v1/me/preferences` in existing `loadPreferences()` path |
| Material | `MatButtonToggleModule` ; question label + `aria-labelledby` |
| Tokens | `--hatcast-member-gender-*` + `--mat-sys-on-surface-variant` for label |
| Reuse | Same CSRF + fetch pattern as [`me-preferences-api.service.ts`](../../apps/web/src/app/core/account/me-preferences-api.service.ts) |

### V1 migration backfill strategy

1. **Export:** `buildV2UserRowsFromV1Season` aggregates `players.gender` per email (dedupe rule in mapping table).
2. **Import:** Optional CSV column ; existing users matched by email get gender updated on re-import (document skip vs update behaviour in import service — prefer **update gender when column present** for re-migration runs).
3. **Already-migrated staging:** Re-run user export+import after deploy — import updates **gender only** on activated accounts (display name unchanged). No separate Flyway data migration required.

### Traps / regressions

| Trap | Mitigation |
|------|------------|
| Breaking PATCH guard (`Aucune préférence`) | Include `gender` in null-check |
| Syncing gender to memberships | Account-level only — do not copy to `troupe_memberships` |
| Exposing gender publicly | Restrict to `/v1/me/preferences` in Wave A |
| Changing role labels in this story | AC3 is regression guard only — labels unchanged until **2.12b** |
| Pseudo save pattern copied for gender | Gender uses **shared Enregistrer** with pseudo (UX frozen Screen 1) |
| V1 hyphen `non-specified` in CSV | Normalize in codec |

### Dependencies

| Story | Status | Relationship |
|-------|--------|----------------|
| **17.36** Mon profil tab | done | UI host for gender control |
| **17.33** Account preferences API | done | Extend `/v1/me/preferences` |
| **2.12b** Role labels | backlog | **Blocked by** this story |
| **2.12c** Avatar fallback | backlog | **Blocked by** this story |
| **6.21** Parity hint | backlog | Needs stored gender |
| **19.11** Draw factor | backlog | Needs enum on users |

### Previous story intelligence (2.11)

- Prefer extending existing services/controllers over new endpoints.
- Integration tests via `MeMemberPreferencesIntegrationTest` pattern + CSRF.
- Web tests: mock `MePreferencesApiService` ; stable `data-testid`.
- Flyway next version after **V55** → **V56**.

### Git intelligence

Recent commit `1b6b03ff` added planning/spec docs for gender parity — **no runtime code yet**. Safe greenfield on API column + UI block.

### Architecture compliance

- **Stack:** Kotlin Spring Boot API ; Angular 21.2 + Material 21.2 ; Flyway on PostgreSQL/Neon.
- **Auth:** Session cookie + CSRF on PATCH (existing [`SecurityConfig.kt`](../../services/api/src/main/kotlin/com/hatcast/api/config/SecurityConfig.kt) matchers — no new routes).
- **OpenAPI:** Optional fragment update in [`seasons.yaml`](../../services/api/openapi/seasons.yaml) if preferences schema is documented there ; otherwise inline DTO is acceptable (match **17.33** precedent).

### Testing requirements

| Layer | Tests |
|-------|-------|
| API | `MeMemberPreferencesIntegrationTest` gender cases ; user CSV import with gender ; account deletion clears gender |
| Web | `account-profile-tab.spec.ts` radio + PATCH ; optional `me-preferences-api.service` type check |
| Commands | `./gradlew test` ; `npm run test -w @hatcast/web -- --watch=false` |

---

## Dev Agent Record

### Agent Model Used

Composer (Cursor agent)

### Completion Notes List

- Added `users.gender` column (Flyway V56), `MemberGender` enum + JPA converter, extended `/v1/me/preferences` GET/PATCH with validation and account-level-only persistence (no membership sync on gender-only patch).
- Account deletion clears `gender` with other PII; CSV import/export supports optional `gender` column with V1→V2 mapping; **activated users** receive gender-only backfill on re-import.
- Mon profil tab: `mat-button-toggle-group` + shared Enregistrer (UX Screen 1 frozen), M3 tokens, 48dp touch targets on mobile, live avatar preview on rail/menu, stable `data-testid`s.
- **M3 checklist:** M3-1–M3-4 validated per frozen UX; M3-5 self-check done (avatar tone on menu trigger for live preview ; cross-surface wiring deferred to **2.12c**).
- **Code review 2026-06-05:** D1 — story AC aligned to frozen UX (implementation is source of truth); D2 — activated-user gender backfill enabled; patches applied (preview, 48dp, AC6 privacy tests).

### File List

- `services/api/src/main/resources/db/migration/V56__users_gender.sql`
- `services/api/src/main/kotlin/com/hatcast/api/user/MemberGender.kt`
- `services/api/src/main/kotlin/com/hatcast/api/user/MemberGenderConverter.kt`
- `services/api/src/main/kotlin/com/hatcast/api/user/UserEntity.kt`
- `services/api/src/main/kotlin/com/hatcast/api/user/dto/UserMemberPreferencesDtos.kt`
- `services/api/src/main/kotlin/com/hatcast/api/user/UserMemberPreferencesService.kt`
- `services/api/src/main/kotlin/com/hatcast/api/auth/AccountDeletionService.kt`
- `services/api/src/main/kotlin/com/hatcast/api/user/UserCsvCodec.kt`
- `services/api/src/main/kotlin/com/hatcast/api/user/dto/UserImportDtos.kt`
- `services/api/src/main/kotlin/com/hatcast/api/user/UserAccountService.kt`
- `services/api/src/main/kotlin/com/hatcast/api/user/UserImportService.kt`
- `services/api/src/test/kotlin/com/hatcast/api/user/MeMemberPreferencesIntegrationTest.kt`
- `services/api/src/test/kotlin/com/hatcast/api/auth/AccountDeletionIntegrationTest.kt`
- `services/api/src/test/kotlin/com/hatcast/api/troupe/TroupeMembershipIntegrationTest.kt`
- `services/api/src/test/kotlin/com/hatcast/api/memberglance/MemberSeasonGlanceServiceTest.kt`
- `apps/web/src/app/core/account/member-gender.ts`
- `apps/web/src/app/core/account/me-preferences-api.service.ts`
- `apps/web/src/app/pages/account-placeholder/tabs/account-profile-tab.ts`
- `apps/web/src/app/pages/account-placeholder/tabs/account-profile-tab.html`
- `apps/web/src/app/pages/account-placeholder/tabs/account-profile-tab.spec.ts`
- `apps/web/src/app/pages/account-placeholder/account-placeholder.scss`
- `apps/web/src/app/core/account/member-display-name.service.ts`
- `apps/web/src/app/shared/user-avatar/user-avatar.ts`
- `apps/web/src/app/shared/user-avatar/user-avatar.scss`
- `apps/web/src/app/shared/member-account-menu/member-account-menu-trigger.html`
- `apps/web/src/styles/_hatcast-semantic-colors.scss`
- `scripts/v1/troupeMembersCsv.js`
- `scripts/v1/troupeMembersCsv.test.js`
- `scripts/v1-export-season-users-csv.js`
- `docs/v2/migration/v1-troupe-members-csv-recipe.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

### Change Log

- 2026-06-05 : Story created (`bmad-create-story` for 2.12).
- 2026-06-05 : Implemented optional member gender — API, Mon profil UI, V1 CSV backfill (story 2.12).
- 2026-06-05 : Code review (bmad-code-review) — findings below.
- 2026-06-05 : Post-review — story AC aligned to frozen UX; activated-user gender backfill; live avatar preview; AC6 privacy tests.

### Review Findings

- [x] [Review][Decision] Story AC/M3 vs UX frozen — **Resolved 2026-06-05:** implementation + UX Screen 1 frozen is source of truth; story AC/M3/tasks updated to match `mat-button-toggle-group`, Féminin/Non spéc./Masculin, shared Enregistrer.
- [x] [Review][Decision] CSV gender backfill on activated users — **Resolved 2026-06-05:** `UserAccountService.importMigrationUser` updates gender only on activated accounts (display name preserved); integration test added.
- [x] [Review][Patch] Rail/menu avatar live preview — **Fixed:** `MemberDisplayNameService.setGenderPreview` + `avatarGender` on menu trigger.
- [x] [Review][Patch] Touch targets below 48 dp — **Fixed:** `min-height: 3rem` on gender toggles at ≤480px.
- [x] [Review][Patch] AC6 privacy integration test — **Fixed:** `MeMemberPreferencesIntegrationTest` asserts `gender` absent on `/v1/auth/me` and season-glance.
- [x] [Review][Patch] Dev Agent Record inaccurate — **Fixed:** Completion Notes aligned to frozen UX.
- [x] [Review][Defer] OpenAPI preferences schema not updated — story marks OpenAPI optional (17.33 precedent); clients/docs may lag [`UserMemberPreferencesDtos.kt`] — deferred, pre-existing pattern
- [x] [Review][Defer] Concurrent PATCH last-write-wins — no `@Version` on `UserEntity`; pseudo + gender patches can race across tabs [`UserMemberPreferencesService.kt`] — deferred, pre-existing
- [x] [Review][Defer] NULL vs persisted `non_specified` in DB — PATCH writes enum; never-set users stay NULL; both read as `non_specified` via `MemberGender.effective` [`MemberGender.kt`] — deferred, acceptable for Wave A
- [x] [Review][Defer] V1 export gender dedupe tie-break — equal `updatedAt` scores pick last array iteration [`troupeMembersCsv.js:212-224`] — deferred, low migration risk

---

### Validation create-story

- [x] AC métier numérotés et sourcés (epics / FR / SCP / spec companion)
- [x] Section **Material 3** remplie (UI story)
- [x] Tasks référencent les numéros d'AC (y compris M3-x)
- [x] Liens vers fichiers code existants à réutiliser
- [x] `./gradlew test` / `npm run test` mentionnés
- [x] Non-goals explicites (2.12b/c, DTO exposure, parity)
