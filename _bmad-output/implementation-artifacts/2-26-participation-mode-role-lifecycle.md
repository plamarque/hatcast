# Story 2.26: Season participation mode and troupe role lifecycle

---
feature_branch: feat/2-26-participation-mode-role-lifecycle
baseline_commit: b0d701c696759d4e040620a4c6080b85f4edce43
---

Status: done

<!-- Ultimate context engine analysis completed — comprehensive developer guide created -->

## Story

As a **troupe administrator**,  
I want to **change a person's troupe role over time (member ↔ externe) while preserving how they participated each season**,  
so that **real-life transitions work** (e.g. former member becomes season-scoped MC guest; Laetitia after V1 import) **without SQL hacks** (**ADR-0022**, **LIMIT-005**).

**Plan source:** Investigation [member-externe-conversion-investigation.md](investigations/member-externe-conversion-investigation.md) (2026-07-12); PO validation per-season participation over time.

## Acceptance Criteria

1. **Given** the participant schema, **when** migrated (Flyway **V69**), **then** `season_participants.participation_mode` (`MEMBER_SYNC` | `GUEST_SEASON` | `GUEST_EVENT`) exists with backfill: existing member-linked rows with `invitation_scope IS NULL` → **`MEMBER_SYNC`**; `invitation_scope = SEASON` → **`GUEST_SEASON`**; `invitation_scope = EVENT` → **`GUEST_EVENT`**; name-only rows without membership → mode derived from scope or left NULL until next write. OpenAPI exposes `participationMode` on `SeasonParticipantAdmin`. [Source: ADR-0022 §1; epics 2.26 AC1]

2. **Given** a troupe admin on **Membres**, **when** they pick **Externe** on the role chip of an active **`MEMBER`** row, **then** a conversion dialog opens when active roster seasons exist; API converts **the same** `troupe_memberships` row to `baseline_role = EXTERNE` (no second row); dialog lists **active seasons** and lets admin pick **externe saison** (`GUEST_SEASON`, default) or **retirer du roster** (`REMOVED`); **past/archived** seasons preserve **`MEMBER_SYNC`** without prompt. Linked account and email **unchanged**. **`TROUPE_ADMIN` → `EXTERNE`** is blocked until demoted to **Membre**. [Source: ADR-0022 §2; SPEC § Members; LIMIT-005; Laetitia]

3. **Given** **MEMBER → EXTERNE** conversion completes, **when** a **new** season is created or sync runs, **then** the person is **not** auto-added (`ensureMembershipParticipants` skips **`EXTERNE`** — regression **2.21**); they appear only after explicit Participants invite (**3.23**). [Source: ADR-0021; 2.21 AC6]

4. **Given** a troupe admin picks **Membre** on the role chip of an active **`EXTERNE`** carnet row, **when** confirmed, **then** same membership row → `baseline_role = MEMBER`; **`ensureMembershipParticipants`** runs for active seasons (respect **`SEASON_ADMIN`** removals); active season rows become **`MEMBER_SYNC`** with `invitation_scope = NULL`. [Source: ADR-0022 §2; supersedes 3.25 out-of-scope EXTERNE→MEMBER]

5. **Given** access checks for season **S** / event **E**, **when** the user is not platform admin, **then** **`GuestInvitationAccessService`** (and agenda/list guards) use **`participation_mode` on the season row** as primary signal; **`GUEST_*`** paths do **not** call `requireActiveMemberMembership`; **`MEMBER_SYNC`** grants member season workspace on **S** only when user has active **`MEMBER`/`TROUPE_ADMIN`** **or** historical **`MEMBER_SYNC`** row on **S** with current troupe role **`EXTERNE`** (past member season: member workspace on **that** season only — not troupe-wide hub). [Source: ADR-0022 §3; story **3.25** matrix amended]

6. **Given** **`MEMBER_SYNC`** on a past season and current troupe role **`EXTERNE`**, **when** the linked user opens troupe hub **`/troupes/:slug`**, **then** **read-only invited** hub only (seasons with **`GUEST_*`** or explicit invitation) — **not** full member browse-all-seasons. [Source: ADR-0022 §3; 3.25 review 1B]

7. **Given** carnet **`EXTERNE`** with **no** linked account, **when** on roster with **`GUEST_SEASON`**, **then** organizer can assign in composition and set proxy dispos; guest self-service **unchanged** (none). [Source: ADR-0021 §1; PO 2026-07-12 #2]

8. **Given** PATCH member with `baselineRole: EXTERNE` or CSV member row attempting role flip, **when** submitted, **then** **either** dedicated conversion endpoint succeeded **or** clear **400** directing to the role chip **Externe** flow (no silent partial update). [Source: LIMIT-005; `TroupeMembershipService.kt:566-572`]

9. **Given** implementation complete, **when** tests run, **then** integration tests cover: (a) MEMBER→EXTERNE conversion preserves past `MEMBER_SYNC`; (b) active season → `GUEST_SEASON` or REMOVED per admin choice; (c) EXTERNE→MEMBER re-sync; (d) guest dispos/agenda on `GUEST_SEASON` only; (e) no auto-sync on new season after downgrade; (f) Laetitia-style: imported MEMBER converted, invited on one season only; (g) regression **3.25** Ruben/Laetitia guest matrix. [Source: ADR-0022; investigation reproduction plan]

**Product coverage:** ADR-0022, ADR-0021 (amended lifecycle), **FR7**, **FR43–FR45**, **LIMIT-005**, **UX-DR10**.

**Out of scope:** Epic **7** self-service invite; concurrent automation « MEMBER troupe + guest season B without admin removal » (document workaround in Dev Notes); `legacy/`.

---

## Acceptance Criteria — Material 3 (UI)

**M3-1. Composants Material** — **Given** Membres role/conversion UI, **when** implemented, **then** use role **chip + `mat-menu`** (*Membre* / *Administrateur·ice de troupe* / *Externe*) on [`membres-tab`](../../apps/web/src/app/pages/admin-membres/membres-tab.ts); conversion dialog uses `MatDialog` + `mat-radio-group` for season choices, `mat-stroked-button` / `mat-flat-button` actions ([`convert-member-externe-dialog.ts`](../../apps/web/src/app/pages/admin-membres/convert-member-externe-dialog.ts)). [Source: FRONTEND_UI.md; **3.24**; **17-17** chip pattern]

**M3-2. Tokens & thème** — **Given** new dialogs and roster badges, **when** styled, **then** only `var(--mat-sys-*)` and `color-mix(in srgb, var(--mat-sys-…) …)`. [Source: FRONTEND_UI.md]

**M3-3. Mobile & tactile** — **Given** viewport **max-width: 480px**, **when** conversion dialog renders season checklist, **then** dialog width `min(100vw - 2rem, 28rem)`; checkbox/radio rows ≥ 48dp; French `aria-label` on icon-only actions. [Source: NFR-A1]

**M3-4. Navigation membre** — **Given** downgraded externe, **when** they sign in, **then** post-login and hub routes follow **3.25** guest rules; no new member chrome. [Source: **3.25** M3-4]

**M3-5. Revue** — **Given** implementation complete, **when** validated, **then** checklist § « Checklist M3 HatCast » in [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md) walked; waivers in Dev Notes. [Source: AGENTS.md]

---

## Tasks / Subtasks

- [x] **Scope:** `services/api/` + `apps/web/` — **do not modify** `legacy/`.
- [x] **Flyway V69** `V69__season_participant_participation_mode.sql` (AC: 1)
- [x] **Domain** (AC: 1, 5)
- [x] **Conversion API** (AC: 2, 4, 8)
- [x] **Season row updates on conversion** (AC: 2, 4)
- [x] **Access guards** (AC: 5, 6)
- [x] **CSV import** (AC: 8)
- [x] **Angular Membres admin** (AC: 2, 4, M3)
- [x] **Tests** (AC: 9)

---

## Dev Notes

### Product and UX rules

- **Three layers (ADR-0021)** unchanged: carnet (A) → invitation (B) → optional account (C). Account **optional**; linked account enables self-service on in-scope events only.
- **Troupe role** = **current default** for new seasons; **season mode** = truth for **that season's** access and admin badges.
- **Laetitia acceptance (La Malice):** MEMBER import → role chip **Externe** → keep **past season** as `MEMBER_SYNC` → active/new season **GUEST_SEASON** only where invited; linked account keeps self-service on invited season(s) only.
- **Vocabulary (French UI):** role chip *Membre* / *Administrateur·ice de troupe* / *Externe*; dialog title **Passer en externe**; roster badges **Membre troupe**, **Externe saison**, **Externe spectacle** (align **3.23** / **3.8d**).
- **Confirm copy downgrade:** explain loss of member hub / auto-sync; carnet retained; spectacle history preserved; optional account unchanged.

### Participation mode vs invitation_scope

| participation_mode | invitation_scope | Set together on |
| -------------------- | ---------------- | --------------- |
| MEMBER_SYNC | NULL | Member sync + conversion to member |
| GUEST_SEASON | SEASON | Externe season invite + conversion downgrade (selected seasons) |
| GUEST_EVENT | EVENT | Event-scoped invite (**3.23**) |

Keep both columns during migration; guards **prefer `participation_mode`** when non-null.

### Current code — must read before coding

| File | Today | This story |
| ---- | ----- | ---------- |
| `TroupeMembershipService.updateMember` | Rejects MEMBER→EXTERNE PATCH | Delegate to conversion service |
| `TroupeExterneCarnetService.upsertActiveExterne` | Cannot insert if MEMBER row exists | Conversion mutates same row first |
| `SeasonParticipantEntity.kind()` | Uses **live** `baselineRole` | Use **`participation_mode`** when set |
| `GuestInvitationAccessService.resolveGuestSeasonWorkspaceMode` | Checks `invitationScope == SEASON` only | Check `GUEST_SEASON` / `GUEST_EVENT` modes |
| `GuestEventAccessJpql` | `invitationScope IS NULL OR SEASON` | Align with `MEMBER_SYNC` / `GUEST_SEASON` explicitly |
| `edit-troupe-member-dialog` | No role change | Name/email only; role via chip on membres-tab |

### Explicit non-goals

- Automatic concurrent « full member on season A + guest-only season B without admin action » — admin must **retirer** from B roster or convert troupe role; document in admin help text.
- Epic **7** self-service onboarding.
- Mandatory email on externe conversion.

### Dependencies

| Story / artifact | Status | Relationship |
| ---------------- | ------ | ------------- |
| **2.21** | done | EXTERNE carnet; sync skip |
| **3.23** | done | invitation_scope; cascade add |
| **3.25** | done | Guest access — **update** for season mode |
| **3.24** | done | Edit member dialog shell |
| **ADR-0022** | accepted | Normative |
| **LIMIT-005** | deferred | **Closed by this story** |

### Architecture compliance

- Flyway **V69** next after V68.
- OpenAPI + TS client regen per repo conventions.
- API authorization at service layer (**NFR-S2**).
- Update [ARCH.md](../../ARCH.md) ADR-0022 note when shipped.

### Testing requirements

| Layer | Cases |
| ----- | ----- |
| API | Conversion both directions; past MEMBER_SYNC preserved; hub 403/invited-only for EXTERNE; agenda scope |
| Web | Dialog season picker; action visibility MEMBER vs EXTERNE |
| E2E | Optional follow-up `recette-2-26` — not blocking MVP |

### Validation create-story

- [x] AC métier numérotés et sourcés
- [x] Section Material 3 remplie
- [x] Tasks référencent AC
- [x] Liens fichiers existants
- [x] `./gradlew test` / `npm run test` mentionnés

## Dev Agent Record

### Agent Model Used

(create-story / investigation handoff 2026-07-12; dev-story 2026-07-12)

### Completion Notes List

- V69 Flyway: `participation_mode` column + backfill + index on `(season_id, participation_mode)`.
- `TroupeMembershipLifecycleService`: convert-to-externe / convert-to-member + conversion-context GET; audit metadata `conversion`.
- Access: `GuestInvitationAccessService`, `GuestEventAccessJpql`, `UserAgendaRepository`, `SeasonRepository.findInvitedForUserInTroupe` prefer season mode; historical `MEMBER_SYNC` grants season workspace for past member seasons.
- UI: role chip dropdown + `convert-member-externe-dialog`; admin-participants participation mode badges.
- Tests: `TroupeMembershipLifecycleIntegrationTest`, `SeasonParticipantEntityKindTest`; regression GuestInvitation/TroupeMembership/ParticipantExterne green.
- M3 waiver: dedicated conversion dialog spec deferred (dialog covered via membres-tab integration path); checklist walked manually on new dialog.

### File List

- services/api/src/main/resources/db/migration/V69__season_participant_participation_mode.sql
- services/api/src/main/kotlin/com/hatcast/api/participant/SeasonParticipationMode.kt
- services/api/src/main/kotlin/com/hatcast/api/participant/SeasonParticipationModeSupport.kt
- services/api/src/main/kotlin/com/hatcast/api/participant/ParticipantEntities.kt
- services/api/src/main/kotlin/com/hatcast/api/participant/GuestInvitationAccessService.kt
- services/api/src/main/kotlin/com/hatcast/api/participant/GuestEventAccessJpql.kt
- services/api/src/main/kotlin/com/hatcast/api/participant/SeasonParticipantMembershipSync.kt
- services/api/src/main/kotlin/com/hatcast/api/participant/SeasonParticipantService.kt
- services/api/src/main/kotlin/com/hatcast/api/participant/dto/ParticipantDtos.kt
- services/api/src/main/kotlin/com/hatcast/api/participant/ParticipantRepositories.kt
- services/api/src/main/kotlin/com/hatcast/api/agenda/UserAgendaRepository.kt
- services/api/src/main/kotlin/com/hatcast/api/season/SeasonRepository.kt
- services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeMembershipLifecycleService.kt
- services/api/src/main/kotlin/com/hatcast/api/troupe/dto/TroupeMembershipLifecycleDtos.kt
- services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeMembershipService.kt
- services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeMemberCsvImportService.kt
- services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeController.kt
- services/api/openapi/participants.yaml
- services/api/openapi/seasons.yaml
- services/api/src/test/kotlin/com/hatcast/api/troupe/TroupeMembershipLifecycleIntegrationTest.kt
- services/api/src/test/kotlin/com/hatcast/api/participant/SeasonParticipantEntityKindTest.kt
- apps/web/src/app/core/troupes/troupe-api.service.ts
- apps/web/src/app/core/participants/participant-api.service.ts
- apps/web/src/app/pages/admin-membres/convert-member-externe-dialog.ts
- apps/web/src/app/pages/admin-membres/membres-tab.ts
- apps/web/src/app/pages/admin-membres/membres-tab.html
- apps/web/src/app/pages/admin-participants/admin-participants.ts
- apps/web/src/app/pages/admin-participants/admin-participants.html

### Change Log

- 2026-07-12 : Story created from investigation member-externe-conversion; ADR-0022 accepted.
- 2026-07-12 : Implementation — participation mode schema, conversion API, access guards, Membres UI (dev-story).
- 2026-07-12 : Code review — test coverage AC9, convertToMember active-season filter, UI error handling, docs LIMIT-005 closed.

### Review Findings

- [x] [Review][Patch] Uncommitted implementation on feature branch — committed on feat/2-26-participation-mode-role-lifecycle.
- [x] [Review][Patch] AC9 test gaps — added REMOVED, GUEST_SEASON workspace/agenda, hub guest-only, and 3.25 regression tests. [`TroupeMembershipLifecycleIntegrationTest.kt`]
- [x] [Review][Patch] `convertToMember` resets `MEMBER_SYNC` on all ACTIVE roster rows, not only active seasons — filter with `isActiveSeason` per AC4. [`TroupeMembershipLifecycleService.kt:161`]
- [x] [Review][Patch] No integration test for AC6 hub guest-only browse — covered in hub list + 325 regression tests.
- [x] [Review][Patch] ARCH.md still marks story 2.26 as `(scheduled)` — updated to `livré`.
- [x] [Review][Patch] LIMIT-005 in ISSUES.md still `Scheduled` — closed to `Resolved`.
- [x] [Review][Patch] Conversion dialog swallows API error detail — `readApiErrorMessage` + display in dialog.
- [x] [Review][Patch] Dialog submit allows double-click — in-flight guard + keep saving until close or error.

- 2026-07-12 : Review pass 2 — role chip UX, API empty-body default, SPEC/DOMAIN sync.

### Review Findings (2026-07-12 — pass 2)

- [x] [Review][Patch] `loadContext` failure shows « seul le rôle troupe change » but API defaults all active roster rows to `GUEST_SEASON` when body lists are empty — restored blocking error on load failure. [`convert-member-externe-dialog.ts`]
- [x] [Review][Patch] Story AC2 / M3-1 / Dev Notes still describe a separate « Passer en externe » menu action — aligned with role chip UX.
- [x] [Review][Patch] Uncommitted delta — committed on feature branch.
- [x] [Review][Patch] No integration test for API empty-body default — added `convert to externe with empty body defaults active seasons to GUEST_SEASON`.
