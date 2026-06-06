# Investigation: Lot B phase 1 — organizer gender on name-only participants (mixité 6.21)

## Hand-off Brief

1. **What happened.** Name-only / unlinked roster rows always resolve to `non_specified` gender today because every read path uses `users.gender` only; mixité (6.21) hides when any filled `player` slot is unknown — confirmed by schema, `ParticipantGenderResolver`, and integration test `GET composition uses non_specified gender for unlinked participant`.
2. **Where the case stands.** **Domain decision closed (2026-06-06):** dual-layer model (participant + user); account M/F wins; org fills gap for unrecognized or account without M/F; user M↔F cascades to participant rows; user → Non spéc. **Option B confirmed** — cascade clears participant gender; org may re-set on roster.
3. **What's needed next.** `bmad-correct-course` (DOMAIN + `member-gender.md` + ADR) then `bmad-create-story` for **2-12d**.

## Case Info

| Field            | Value                                                                                      |
| ---------------- | ------------------------------------------------------------------------------------------ |
| Ticket           | N/A (plan backlog — `plan-participant-roster-ux-enhancements.md` Lot B phase 1)            |
| Date opened      | 2026-06-06                                                                                 |
| Status           | Concluded — domain rules approved; ready for `bmad-correct-course` + story 2-12d |
| System           | HatCast V2 — Angular 21 + Spring API + PostgreSQL (Neon)                                   |
| Evidence sources | Planning plan, `member-gender.md`, `member-gender-surfaces.md`, API resolver, V14/V56 migrations, integration tests |

## Problem Statement

Organizers can set gender on **Mon compte** (`users.gender`, story 2.12), but guests added as **name-only** participants (FR45, no HatCast account) never contribute `female` or `male` to mixité counts. The Équipe mixité pill (6.21) stays hidden when any filled `player` slot has unknown gender (`u > 0`). Product intent (Lot B): let organizers set the same 3-state gender control when editing unlinked participants so mixité and gender-aware labels work for guests without accounts.

**User/stakeholder hypothesis (to validate):** A participant-level `gender` column is the right fix for phase 1; user-only gender is insufficient.

## Evidence Inventory

| Source | Status | Notes |
| ------ | ------ | ----- |
| `plan-participant-roster-ux-enhancements.md` (Lot B) | Available | Recommends participant-level gender phase 1; stories 2-12d / 2-12e |
| `member-gender.md` | Available | Parity formula: `u` includes unlinked without gender; only `users.gender` today |
| `member-gender-surfaces.md` | Available | Registry; gender source table lists only `users.gender` via API |
| `DOMAIN.md` | Partial | Defines `users.gender`; no participant-level gender entity yet |
| DB `V14__season_and_event_participants.sql` | Available | No `gender` column on participant tables |
| DB `V56__users_gender.sql` | Available | Gender only on `users` |
| `ParticipantGenderResolver.kt` | Available | Resolves via `user_id` only; else `non_specified` |
| `ParticipantRowPresentation.kt` | Available | `genderWire(user)` — linked user only |
| `CompositionIntegrationTest` | Available | Linked → `male`; unlinked → `non_specified` |
| `edit-participant-dialog.ts` | Available | Name + email only; no gender UI |
| Story file 2-12d | Missing | Not created yet |
| ADR for participant.gender | Missing | Required if column approved |

## Investigation Backlog

| # | Path to Explore | Priority | Status | Notes |
| - | --------------- | -------- | ------ | ----- |
| 1 | Approve domain decision (participant vs user-only) | High | Open | Stakeholder sign-off |
| 2 | ADR + DOMAIN + `member-gender.md` companion update | High | Open | After decision |
| 3 | Flyway migration next version (`V58+`) | High | Open | Both participant tables |
| 4 | Extend `ParticipantGenderResolver` + row presentation | High | Open | Central resolver |
| 5 | `AvailabilityService.toEligibleRow` | High | Open | Dispos summary gender |
| 6 | `SeasonStatisticsService.buildRow` | Medium | Open | Stats grid + 16.3 aggregate path |
| 7 | Admin PATCH participant API + edit dialog UX | High | Open | Reuse frozen Mon compte toggle |
| 8 | Linking / account-deletion precedence rules | Medium | Open | Edge cases below |
| 9 | `member-gender-surfaces.md` registry rows | Low | Open | After implementation story |
| 10 | Phase 2 (`2-12e` admin member gender) | Low | Open | Out of phase 1 scope |

## Timeline of Events

| Time | Event | Source | Confidence |
| ---- | ----- | ------ | ---------- |
| 2026-06-05 | Wave B gender surfaces shipped (2.12b/c); mixité 6.21 live | `member-gender-surfaces.md` | Confirmed |
| 2026-06-06 | Participant roster UX plan approved; Lot B sequenced after Lot A | `plan-participant-roster-ux-enhancements.md` | Confirmed |
| Runtime | Unlinked participant → `participantGender: non_specified` on composition GET | `CompositionIntegrationTest.kt:452–462` | Confirmed |

## Confirmed Findings

### Finding 1: Participant tables have no gender column

**Evidence:** `services/api/src/main/resources/db/migration/V14__season_and_event_participants.sql:1–28`

**Detail:** `season_participants` and `event_participants` store `display_name`, email, `user_id`, membership link, status — no gender field. Gender persistence is solely `users.gender` (`V56__users_gender.sql`).

### Finding 2: All operational gender resolution is user-centric today

**Evidence:** `services/api/src/main/kotlin/com/hatcast/api/user/ParticipantGenderResolver.kt:44–50`

**Detail:** For each participant id, resolver maps to `user_id` if present, loads `users.gender`, else returns `MemberGender.NON_SPECIFIED`. Used by `CompositionService`, `CompositionDrawService`, `CompositionSlotAssignmentService` (mixité input: `slot.participantGender` on web).

**Evidence (admin list DTO):** `ParticipantRowPresentation.kt:13` — `genderWire(user)` from linked user only; `SeasonParticipantService.kt:61`, `EventRosterService.kt:196`.

**Evidence (dispos):** `AvailabilityService.kt:777` — `MemberGender.effective(user?.gender)`.

**Evidence (season stats):** `SeasonStatisticsService.kt:179–181` — `linkedUser(participant)?.gender` or `NON_SPECIFIED`.

### Finding 3: Mixité client logic matches spec; unknown gender hides pill

**Evidence:** `apps/web/src/app/core/composition/composition-player-gender-parity.ts:37–50`

**Detail:** Counts `u` when `effectiveMemberGender(slot.participantGender) === 'non_specified'`. If `u > 0`, returns `null` (indicator hidden). Unlinked participants always increment `u` today.

**Evidence (API contract):** `member-gender.md:73–74` — `u` includes unlinked participant without gender.

### Finding 4: Integration test documents current unlinked behaviour

**Evidence:** `services/api/src/test/kotlin/com/hatcast/api/composition/CompositionIntegrationTest.kt:452–462`

**Detail:** Name-only season participant assigned to slot → `participantGender` = `non_specified`.

### Finding 5: Edit participant dialog has no gender control

**Evidence:** `apps/web/src/app/shared/edit-participant-dialog/edit-participant-dialog.ts:13–28,34–54`

**Detail:** Dialog data and form: display name + optional email only. `ParticipantUpdateRequest` (`ParticipantDtos.kt:16–20`) has no gender field.

### Finding 6: Plan already proposes participant-level gender for phase 1

**Evidence:** `_bmad-output/planning-artifacts/plan-participant-roster-ux-enhancements.md:70–78,87–91`

**Detail:** Phase 1 = optional `gender` on participant tables for unlinked rows; linked rows read-only from user; phase 2 optional admin user edit (`2-12e`).

## Deduced Conclusions

### Deduction 1: User-only extension cannot satisfy phase 1 without inventing accounts

**Based on:** Findings 1–2, FR45 name-only semantics

**Reasoning:** Name-only participants deliberately have `user_id = NULL`. No `users` row exists to hold organizer-supplied gender. Extending only `users.gender` would require shadow users or violating FR45.

**Conclusion:** Phase 1 **requires** participant-level persistence (or an equivalent side table keyed by participant id — same effect as a column).

### Deduction 2: Resolver centralization limits blast radius

**Based on:** Finding 2, `member-gender-surfaces.md` architecture diagram

**Reasoning:** Most composition/mixité paths funnel through `ParticipantGenderResolver`. Admin/dispos/stats use parallel `genderWire(user)` / `user?.gender` patterns — same precedence rule must be applied in ~4 Kotlin sites + DTO mapping, not scattered web fixes.

**Conclusion:** Implement **one precedence helper** (e.g. extend `ParticipantGenderResolver` or extract `EffectiveParticipantGender`) consumed by all API surfaces listed in backlog #4–6.

## Hypothesized Paths

### Hypothesis 1: Add `gender VARCHAR(32) NULL` on both participant tables (recommended)

**Status:** Open — pending ADR / DOMAIN approval

**Theory:** Nullable column storing `male` | `female` | `non_specified` (same enum as `users.gender`). Writable via admin PATCH when row is unlinked (`user_id IS NULL` and `troupe_membership_id IS NULL` for season rows). Read precedence: `users.gender` if linked → else `participant.gender` → else `non_specified`.

**Supporting indicators:** Plan recommendation; mirrors V1 `players.gender` for roster-only guests; minimal schema change.

**Would confirm:** Stakeholder + architect approval; ADR drafted.

**Would refute:** Privacy/legal objection to org-set gender on behalf of guests; decision to defer mixité for guests entirely.

**Resolution:** —

### Hypothesis 2: Extend phase 1 to `MANAGED` participants (email, no user yet)

**Status:** Open

**Theory:** `ParticipantKind.MANAGED` rows have pre-linked email but no `user_id`; they also resolve to `non_specified` today and block mixité. Product may want organizer gender for them too.

**Supporting indicators:** Plan wording « name-only **or otherwise unlinked** »; MANAGED is unlinked.

**Would confirm:** Explicit AC in 2-12d including MANAGED edit case.

**Would refute:** Product limits control to strict `NAME_ONLY` only.

**Resolution:** —

### Hypothesis 3: Stale participant.gender after account link or deletion

**Status:** Open

**Theory:** If org sets `participant.gender`, then email links to a user, user gender differs — user wins (plan AC #2). On account deletion (`user_id` cleared, user PII cleared), row may fall back to NULL participant.gender → mixité hidden again unless org re-edits.

**Would confirm:** Document precedence in DOMAIN; optional: clear `participant.gender` on link to avoid confusion.

**Would refute:** Copy org gender to participant on link before user_id set — rejected by plan (no org override of user gender).

**Resolution:** —

## Missing Evidence

| Gap | Impact | How to Obtain |
| --- | ------ | ------------- |
| Stakeholder sign-off on participant.gender vs defer | Blocks story | Product review of this case file |
| MANAGED kind in/out of phase 1 | AC scope | Clarify with Patrice |
| Privacy review for org-set gender on guests | Compliance | UX/legal note in `member-gender.md` Wave B |
| V1 roster-only player gender import path | Migration/backfill | Check mig scripts — likely user-only for linked |
| Next Flyway version number | Migration PR | `ls services/api/src/main/resources/db/migration` at implementation time |

## Source Code Trace

| Element | Detail |
| ------- | ------ |
| Error origin | Not a defect — spec-compliant gap: unlinked → unknown gender |
| Trigger | Organizer assigns name-only participant to `player` slot; opens Équipe tab |
| Condition | `ParticipantGenderResolver` returns `non_specified`; `computeCompositionPlayerGenderParity` → `u > 0` → pill hidden |
| Related files | **Resolver:** `ParticipantGenderResolver.kt`. **Composition:** `CompositionService.kt`, `CompositionDtos.kt` (`participantGender`). **Web mixité:** `composition-player-gender-parity.ts`, `event-equipe-tab.ts`. **Admin:** `SeasonParticipantService.kt`, `EventRosterService.kt`, `edit-participant-dialog.ts`. **Dispos:** `AvailabilityService.kt`. **Stats:** `SeasonStatisticsService.kt`. **Entities:** `ParticipantEntities.kt`. **Tests:** `CompositionIntegrationTest.kt:391–462`, `composition-player-gender-parity.spec.ts`, `event-equipe-tab.spec.ts` (mixité cases) |

### Read-path inventory (phase 1 must update)

| # | Surface / API | Current source | File(s) |
| - | ------------- | -------------- | ------- |
| 1 | Composition GET slots / declines | `ParticipantGenderResolver` → user only | `CompositionService.kt`, resolver |
| 2 | Draw candidates / steps | Same resolver | `CompositionDrawService.kt` |
| 3 | Slot assignment responses | Same resolver | `CompositionSlotAssignmentService.kt` |
| 4 | Admin season participants list | `ParticipantRowPresentation.genderWire(linkedUser)` | `SeasonParticipantService.kt` |
| 5 | Admin event roster list | Same | `EventRosterService.kt` |
| 6 | Participant selector (dispos subject) | Same | `SeasonParticipantService` selector path |
| 7 | Availability summary participants | `user?.gender` | `AvailabilityService.kt:766–778` |
| 8 | Season statistics rows | `linkedUser?.gender` | `SeasonStatisticsService.kt:179–181` |
| 9 | Web mixité pill | `slot.participantGender` from API | `composition-player-gender-parity.ts` (no change if API fixed) |
| 10 | Web admin avatars / role chips | `participant.gender` from API | `admin-participants.ts`, `admin-event-participants.ts` |
| 11 | Edit participant dialog | N/A (not sent) | `edit-participant-dialog.ts` |
| 12 | PATCH participant API | No gender in request | `ParticipantDtos.kt`, `SeasonParticipantService` update |

**Out of phase 1 (linked-user admin override):** troupe member admin, `GET troupe members` — story **2-12e**.

## Domain Decision (stakeholder-refined — 2026-06-06)

| Option | Description | Verdict |
| ------ | ----------- | ------- |
| **A — User-only** | Keep gender on `users` only | **Refuted** — cannot cover unrecognized guests or org fill-in when account gender unset |
| **B — Dual layer (participant + user)** | `participant.gender` = organizer operational; `users.gender` = member self-declaration; precedence below | **Approved in principle** (Patrice) |
| **C — Virtual / client-only** | No server persistence | **Refuted** |

### Stakeholder rules (Patrice — confirmed)

| Situation | Who sets gender | Storage | Effective read |
| --------- | --------------- | ------- | -------------- |
| Manual add, **not recognized** (name-only) | Organizer at add time | `participant.gender` | `participant.gender` |
| Recognized user, account has **M or F** | Member (Mon compte); org read-only | `users.gender` | `users.gender` (as-is) |
| Recognized user, account **without M/F** (unset / Non spéc.) | Organizer at add (or edit) | `participant.gender` | `participant.gender` if org set M/F, else `non_specified` |
| User changes **M ↔ F** later | Member | Cascade: update all linked `participant.gender` rows | `users.gender` |
| User changes to **Non spéc.** | Member | Cascade clears `participant.gender`; org may re-set on roster | **Option B confirmed** — effective `non_specified`; mixité may hide |

**Responsibility principle:** whoever adds an unrecognized person is responsible for specifying gender at participant level. Mixité and gender-aware labels in **that organizer's compositions** use the effective gender above.

### Precedence rule (proposed normative — v2)

```
effectiveGender(participantRow):
  user = linkedUser(participantRow)  // via user_id or membership

  if user != null AND user.gender in { male, female }:
    return user.gender                    // account binary gender always wins

  if participantRow.gender in { male, female }:
    return participantRow.gender          // org operational overlay

  return non_specified
```

**Note:** `users.gender` NULL and explicit `non_specified` both map to `MemberGender.NON_SPECIFIED` today (`UserMemberPreferencesService.kt:98`) — no DB distinction. Org overlay applies in both cases until user sets M/F.

### Cascade on user gender PATCH (new behaviour)

When member PATCHes `users.gender` via `PATCH /v1/me/preferences`:

| New account gender | Action on all `season_participants` + `event_participants` linked to that `user_id` (and membership-linked season rows) |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `male` or `female` | Set `participant.gender` = same value (sync) |
| `non_specified` | **Confirmed (Option B):** set `participant.gender` = NULL / `non_specified` (respect member); org may re-set on roster afterward |

**Evidence gap:** Today `UserMemberPreferencesService.patchPreferences` syncs display name + preferred roles to memberships only (`syncActiveMemberships`, lines 105–118) — **no** gender cascade exists yet.

### User → Non spéc. — **Confirmed: Option B (2026-06-06, Patrice)**

When member sets account gender to **Non spéc.**, cascade clears `participant.gender` on all linked rows. Effective gender becomes `non_specified` (inclusive labels, mixité may hide). Organizer may set `participant.gender` again on the roster row under the same write rules as « recognized user without M/F ».

| Option | Verdict |
| ------ | ------- |
| A — Sticky participant | **Refuted** |
| **B — Respect user** | **Confirmed** |
| C — Split display vs parity | **Refuted** |

### Write rules (proposed normative — v2)

- **Who:** Troupe / season / event admin (same as participant add/edit today).
- **When writable on participant row:**
  - Unlinked (name-only / no user), **or**
  - Linked user whose account gender is **not** `male`/`female` (unset or Non spéc.)
- **When read-only on participant row:** linked user with account `male` or `female` — show value from account; copy: managed on Mon compte.
- **Surfaces:** **Add** dialog (when not recognized or recognized without M/F) **and** edit dialog — not edit-only.
- **Values:** same enum as `users.gender`.
- **UI:** reuse frozen Mon compte 3-state toggle (`ux-design-member-gender-parity.md` Screen 1).

### Docs to update after approval

- `DOMAIN.md` — participant gender (organizer operational) + precedence + cascade
- `member-gender.md` — `u` counts use **effective** gender; privacy note for org-set guest gender
- `member-gender-surfaces.md` — gender source matrix (dual layer)
- ADR — participant.gender column + precedence + cascade on user PATCH

## Draft Acceptance Criteria — Story 2-12d (phase 1, v2)

*Proposed story id:* `2-12d-genre-participant-admin` · Epic 2.12 extension · Lot A typeahead compatible (gender on add when suggestion not selected or selected user without M/F).

### Functional — add & edit

1. **Given** an organizer adds a **name-only** participant with gender **Féminin**, **when** saved, **then** row persists `participant.gender = female` and effective gender is `female` on roster, composition, dispos.
2. **Given** an organizer selects a **recognized user with Mon compte M/F**, **when** added to roster, **then** gender toggle is read-only or hidden; effective gender = account value; no participant override accepted.
3. **Given** an organizer selects a **recognized user without M/F** (Non spéc. / unset), **when** adding to roster, **then** organizer **must be able to** set gender on the participant row before save.
4. **Given** a name-only participant with gender `female` on a filled `player` slot and all other player slots have known gender, **when** Équipe tab loads, **then** mixité pill visible; slot counts in `f` (**6.21** unchanged).
5. **Given** linked user with account `male`, **when** organizer PATCHes participant with `gender: female`, **then** `403` or field ignored; effective remains `male`.
6. **Given** gender unset on participant and no account M/F, **when** mixité computed, **then** `u > 0` → pill hidden.

### Functional — user cascade

7. **Given** a user linked to N participant rows with account gender **Masculin**, **when** member PATCHes Mon compte to **Féminin**, **then** all N `participant.gender` values update to `female` and composition/dispos reflect `female`.
8. **Given** org set `participant.gender = female` while account was Non spéc., **when** member later sets account to **Masculin**, **then** effective gender becomes `male` everywhere (account wins); participant rows synced to `male`.
9. **Given** user with account **Féminin** and synced participants, **when** member sets **Non spéc.**, **then** participant rows clear to `non_specified`, effective `non_specified`, mixité may hide; organizer may re-set participant gender on roster (Option B — confirmed).

### API / data

10. Migration: nullable `gender` on `season_participants` and `event_participants`.
11. `ParticipantCreateRequest` + `ParticipantUpdateRequest` accept optional `gender` when write rules allow.
12. `UserMemberPreferencesService.patchPreferences`: on gender change, cascade to linked participant rows per table above.
13. Single `effectiveGender(participant, user)` helper used by resolver, admin DTOs, availability, stats.

### Regression & tests

14. Existing linked participants with account gender: effective unchanged post-migration.
15. Integration tests for precedence matrix (8 cases: unlinked, linked+M/F, linked+non_specified+org overlay, cascade M↔F, cascade → non_specified).
16. Web: add + edit dialog specs — toggle visibility per link + account gender state.

### Acceptance Criteria — Material 3 (UI)

- **M3-1:** Gender control reuses `mat-button-toggle-group` 3-state pattern from Mon compte (Féminin · Non spéc. · Masculin); order and tokens per `ux-design-member-gender-parity.md` Screen 1.
- **M3-2:** Edit dialog layout: gender block after name/email; mobile-first; touch targets ≥ 48dp.
- **M3-3:** Read-only linked state: French copy explaining gender is managed on Mon compte (no duplicate toggle).
- **M3-4:** Avatar preview in admin participant list reflects effective gender after save (existing `app-user-avatar`).
- **M3-5:** `data-testid` on toggle group consistent with account pattern (`participant-gender-group`, etc.).

### Out of scope (explicit)

- Lot B phase 2 (`2-12e` admin member gender)
- Mandatory gender; mixité blocking validate/draw
- Gender on add when typeahead selects user **with** M/F (read-only)
- Draw weight factor 19.11

## Risks

| Risk | Severity | Mitigation |
| ---- | -------- | ---------- |
| **Precedence drift** — some API paths keep `user?.gender` only | High | Single resolver/helper + integration tests per read-path row |
| **MANAGED kind ambiguity** — email but no user | Medium | Clarify in AC; default include in unlinked write rule |
| **Account deletion** — linked guest loses user gender, no participant gender stored | Medium | Document; optional: on first org gender save before link, retain after deletion |
| **Org vs self conflict** after link | Medium | Precedence v2: account M/F always wins; cascade on user PATCH |
| **Cascade scope** — N seasons × events per user | Medium | Batch update on `UserMemberPreferencesService`; transaction + test |
| **User → Non spéc. loses mixité** | Low (accepted) | Non-blocking 6.21; org re-edit participant row |
| **Privacy / consent** — org assigns gender for guest without account | Medium | DOMAIN privacy note; operational UI only (not public profile) |
| **Spec/doc lag** — code ships before DOMAIN/ADR | High | `bmad-correct-course` gate before `bmad-dev-story` |
| **Migration on large rosters** | Low | Nullable column, no backfill required |
| **16.3 season aggregate** — stats parity uses same gender source | Medium | Include `SeasonStatisticsService` in story scope |
| **Lot A typeahead** — selecting member should not expose org gender edit | Low | Edit dialog already keyed on link state |

## Conclusion

**Confidence:** **High** — domain rules complete and stakeholder-approved.

Dual-layer model: `participant.gender` (organizer operational) + `users.gender` (member self-service). Account M/F always wins; org fills gap for unrecognized users or accounts without M/F; cascade sync on user gender PATCH; user → Non spéc. clears participant rows (Option B). Ready for `bmad-correct-course` and story **2-12d**.

## Recommended Next Steps

### Fix direction

1. **`bmad-correct-course`** — Approve participant.gender column; update DOMAIN + `member-gender.md`; add ADR.
2. **`bmad-create-story`** — `create story 2-12d genre participant admin` using draft AC above.
3. **`bmad-dev-story`** — After Lot A if sequenced per plan; migration + resolver + edit dialog.

### Diagnostic

- Manual: create name-only participant → assign JEU slot → confirm mixité hidden → set gender via edit → confirm pill appears.
- Re-run `CompositionIntegrationTest` gender tests after implementation.

## Reproduction Plan

1. Seed season with one linked member (`users.gender = male`) and one name-only participant.
2. Assign both to `player` slots on draft composition.
3. Open Équipe as organizer → mixité pill **hidden** (name-only → `u = 1`).
4. After phase 1 fix: edit name-only → set Féminin → save → reload Équipe → pill **visible** (e.g. acceptable mixité 1F·1H).

## Side Findings

- Admin event/season participant lists already **consume** `participant.gender` from API for avatars/chips (`admin-participants.ts:258`, `admin-event-participants.ts:277`) — DTO field exists but is always derived from user today (`ParticipantDtos.kt:32`).
- `member-gender-surfaces.md` documents mixité as ✅ implemented; gap is **data source** for unlinked rows, not UI formula.
- Plan sequences Lot B phase 1 **after** Lot A (typeahead); gender on **add** dialog couples with Lot A when typeahead selects recognized users.
- `UserMemberPreferencesService` already cascades display name to memberships but **not** gender — cascade to participants is net-new.

## Follow-up: 2026-06-06 (#2)

### New Evidence

Stakeholder (Patrice) refined domain rules beyond initial plan (unlinked-only):

1. Unrecognized manual add → org specifies gender on participant row.
2. Recognized user with M/F → use account gender; org read-only.
3. Recognized user without M/F → org may specify on participant row (composition context).
4. User M↔F change → cascade update all linked participant rows.
5. User → Non spéc.: **open** — sticky participant (preserve mixité) vs respect user (lose mixité).

### Additional Findings

- Precedence is **not** simple user-first: account binary gender wins; participant overlay applies only when account is not M/F.
- Gender at **creation** is in scope, not edit-only.
- Cascade on user PATCH mirrors existing membership display-name sync pattern but targets participant tables.

### Updated Hypotheses

| Hypothesis | Prior | Now |
| ---------- | ----- | --- |
| H1 participant column | Open | **Confirmed in principle** |
| H2 MANAGED kind in scope | Open | **Confirmed** — same as unrecognized / no account M/F |
| H3 stale gender after link | Open | Superseded by precedence v2 + cascade |
| H4 User → Non spéc. | — | **Confirmed — Option B** (2026-06-06) |

### Backlog Changes

- Add: cascade service / hook in `UserMemberPreferencesService.patchPreferences`
- Add: gender field on **add** participant dialog (conditional visibility)
- Change: write rule — not unlinked-only; writable when account gender ∉ {male, female}

### Updated Conclusion

Dual-layer model and Option B **approved**. Investigation **concluded** — proceed to `bmad-correct-course` + `bmad-create-story` 2-12d.
