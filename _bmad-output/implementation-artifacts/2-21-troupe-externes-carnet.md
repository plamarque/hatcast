# Story 2.21: Troupe externes — carnet `EXTERNE`

---
baseline_commit: 115776cd33d69152e2b700ad95504b1353df5346
---

Status: done

<!-- Ultimate context engine analysis completed — comprehensive developer guide created -->

## Story

As a **troupe administrator**,  
I want to manage **Externes** in the same Membres admin UI (name-only allowed, optional email),  
so that **recurring and one-off guests are recallable in a troupe contact book** without granting full member access (**ADR-0021** P1, **FR7** extension).

**Plan source:** [sprint-change-proposal-2026-06-06-troupe-externes-adr-0021.md](../planning-artifacts/sprint-change-proposal-2026-06-06-troupe-externes-adr-0021.md) — approved 2026-06-06.

## Acceptance Criteria

1. **Given** the V2 troupe membership model, **when** migrated, **then** `TroupeBaselineRole` includes **`EXTERNE`** (Kotlin enum, Flyway check/constraint, OpenAPI `TroupeBaselineRole` enum) and existing **`MEMBER`** / **`TROUPE_ADMIN`** behaviour is unchanged. [Source: ADR-0021 §1; SCP §4.5 story 2.21 AC1]
2. **Given** a troupe admin on **Membres** (`/saison/:slug/admin/membres`), **when** they add an **Externe**, **then** they can save with **display name required** and **email optional**; the row persists with `baseline_role = EXTERNE`, `status = ACTIVE`; UI shows chip/filter **Externe** alongside Membre / Admin. [Source: ADR-0021 §1; DOMAIN.md carnet glossary]
3. **Given** a **name-only** externe (no HatCast account), **when** created, **then** a carnet row exists **without** requiring `users` sign-in or email — implemented via nullable `user_id` on `troupe_memberships` for `EXTERNE` only plus optional stored normalized email for pre-link. [Source: ADR-0021 §1 « DJ local » example]
4. **Given** an externe with optional email matching an existing **`users`** row, **when** created or updated, **then** `user_id` is set on the membership where permitted (same normalization as participant linking — lowercase trim). [Source: ADR-0021 §1; FR45 pattern]
5. **Given** a troupe admin removes an externe from the carnet (**Retirer**), **when** confirmed, **then** `troupe_memberships.status = INACTIVE`; copy states carnet scope and that **spectacle history is preserved**; **season/event participant rows are not cascade-`REMOVED`** (unlike `MEMBER` troupe removal). [Source: ADR-0021 §6; SCP 2026-05-31 contrast]
6. **Given** `ensureMembershipParticipants` / `SeasonParticipantMembershipSync`, **when** any sync runs, **then** **`EXTERNE` memberships are skipped** — never auto-added to season rosters like `MEMBER`. [Source: ADR-0021 §1 consequences; story 3.8 Dev Notes]
7. **Given** a signed-in user with **only** an active `EXTERNE` membership (or carnet-only with linked account), **when** they call member read guards (`TroupeAccessService.requireActiveMember`, troupe list for member hub), **then** they receive **403** / are excluded from troupe member navigation — **no** `MEMBER`-equivalent browse-all-seasons access. [Source: ADR-0021 §5; ARCH.md ADR-0021 note]
8. **Given** `EXTERNE` role, **when** an admin attempts `baselineRole = TROUPE_ADMIN` or last-admin demotion paths, **then** API rejects invalid transitions; **last active admin** guard unchanged for `MEMBER`/`TROUPE_ADMIN`. [Source: story 2.2 AC5]
9. **Given** CSV **export**, **when** downloaded, **then** active/inactive **Externes** are included with `baselineRole = EXTERNE`. **Import** may create or reactivate `EXTERNE` rows when CSV row specifies role Externe — document column in Dev Notes; reject import that would create `EXTERNE` without display name. [Source: SCP §4.6; story 2.3 contract extension]
10. **Given** implementation complete, **when** tests run, **then** integration tests cover: name-only externe create; email-linked externe; carnet remove without season cascade; `MEMBER` troupe remove still cascades (regression); `EXTERNE` denied `requireActiveMember`; sync skip. [Source: SCP §7 success criteria]

**Product coverage:** ADR-0021 P1, **FR7** (admin membres), **UX-DR10**, [ux-design-specification.md](../planning-artifacts/ux-design-specification.md) § Admin Membres.

**Out of scope (later stories):** invitation scope field, upward cascade on participant add (**3.23**), typeahead carnet pool (**3.8d**), guest scoped dispos/agenda (**3.25**), self-service invite (Epic **7**).

---

## Acceptance Criteria — Material 3 (UI)

**M3-1. Composants Material** — **Given** Membres tab changes, **when** add/filter/confirm UI is implemented, **then** reuse existing patterns: `mat-dialog` add modal, `mat-chip` / filter chips, `mat-form-field` outline, `mat-menu` role control — mirror [`membres-tab`](../../apps/web/src/app/pages/admin-membres/membres-tab.ts) / [`add-member-dialog`](../../apps/web/src/app/pages/admin-membres/add-member-dialog.ts). [Source: FRONTEND_UI.md; story 2.8]

**M3-2. Tokens & thème** — **Given** new chips, hints, confirm copy, **when** styled, **then** only `var(--mat-sys-*)` and `color-mix(in srgb, var(--mat-sys-…) …)`. [Source: FRONTEND_UI.md]

**M3-3. Mobile & tactile** — **Given** viewport **max-width: 480px**, **when** add-externe dialog and filter chips render, **then** dialog width `min(100vw - 2rem, 28rem)`; chips wrap; touch targets follow Material defaults. [Source: NFR-A1]

**M3-4. Navigation membre** — **N/A** for add UI; **verify** linked `EXTERNE` accounts do not gain new member chrome entries (guard is API + troupe list filter).

**M3-5. Revue** — **Given** implementation complete, **when** validated, **then** checklist § « Checklist M3 HatCast » in [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md) is walked; waived items noted in Dev Notes.

---

## Tasks / Subtasks

- [x] **Scope:** `services/api/` + `apps/web/` — **do not modify** `legacy/`.
- [x] **Flyway** `V59__troupe_externe_carnet.sql` (V58 taken by participant_gender):
  - Extend `baseline_role` allowed values to include `EXTERNE`.
  - `ALTER troupe_memberships` — `user_id` **nullable** when `baseline_role = 'EXTERNE'` (CHECK constraint); keep NOT NULL for `MEMBER`/`TROUPE_ADMIN`.
  - Add `normalized_email VARCHAR(320) NULL` on `troupe_memberships` for externe pre-link without account (optional if email stored only via `users` when linked — prefer column for name-only + email carnet entries per ADR).
  - Unique index `(troupe_id, user_id)` — PostgreSQL/H2 allow multiple NULL `user_id` (name homonyms OK for MVP).
- [x] **API domain** (AC: 1, 3–8, 10):
  - [`TroupeBaselineRole.kt`](../../services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeBaselineRole.kt) — add `EXTERNE`.
  - [`TroupeMembershipEntity.kt`](../../services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeMembershipEntity.kt) — nullable `user`, optional `normalizedEmail`.
  - New or extended service method `addExterne` / extend `addMember` with `AddTroupeExterneRequest` `{ displayName, email? }` — **do not** require email for `EXTERNE`.
  - [`TroupeAccessService`](../../services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeAccessService.kt) / [`TroupeMembershipService.requireActiveMembership`](../../services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeMembershipService.kt) — member read: **reject** `EXTERNE`; troupe admin paths unchanged.
  - [`TroupeMembershipService.listActiveTroupesForUser`](../../services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeMembershipService.kt) — exclude `EXTERNE`-only memberships from member troupe picker (user may still have separate `MEMBER` row in same troupe — out of scope edge case; document).
  - [`TroupeMembershipService.deactivateMember`](../../services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeMembershipService.kt) — if `baselineRole == EXTERNE`: set `INACTIVE`, **skip** `membershipSync.removeForMembershipAcrossTroupe`; French confirm copy differs from membre troupe.
  - [`SeasonParticipantService.ensureMembershipParticipants`](../../services/api/src/main/kotlin/com/hatcast/api/participant/SeasonParticipantService.kt) + [`SeasonParticipantMembershipSync`](../../services/api/src/main/kotlin/com/hatcast/api/participant/SeasonParticipantMembershipSync.kt) — skip `EXTERNE`.
  - [`countActiveMembersByTroupeIds`](../../services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeMembershipRepository.kt) — exclude `EXTERNE` from public/member **member count** (carnet ≠ membre actif).
  - Update [`TroupeMemberAdminDto`](../../services/api/src/main/kotlin/com/hatcast/api/troupe/dto/TroupeDtos.kt): nullable `userId` / `userSlug` for name-only; email from `normalizedEmail` or user.
  - Audit: reuse `TROUPE_MEMBER_ADDED` / `TROUPE_MEMBER_DEACTIVATED` or add scoped types — prefer existing with `metadata.baselineRole`.
- [x] **OpenAPI** [`seasons.yaml`](../../services/api/openapi/seasons.yaml) (AC: 1, 3):
  - `TroupeBaselineRole` enum + description for `EXTERNE`.
  - New `POST` body schema or extend add member with `AddTroupeExterneRequest`.
  - `TroupeMemberAdmin.userId` nullable in schema.
- [x] **Angular** (AC: 2, 5, 9):
  - [`troupe-api.service.ts`](../../apps/web/src/app/core/troupes/troupe-api.service.ts) — type `EXTERNE`; `addExterne(troupeId, { displayName, email? })`.
  - [`add-member-dialog.ts`](../../apps/web/src/app/pages/admin-membres/add-member-dialog.ts) — add mode or separate `add-externe-dialog.ts`: name required, email optional, role fixed Externe; **or** role `mat-select` adds **Externe** option with conditional validation (email not required when Externe).
  - [`membres-tab.ts`](../../apps/web/src/app/pages/admin-membres/membres-tab.ts) / `.html` — filter chips (Tous | Membre | Admin | Externe); `roleLabel` → **Externe**; hide role menu promotion to Admin for `EXTERNE`; **Retirer** confirm copy per SCP §4.6.
  - Row without `userId`: avatar initial from display name; no profile link to `/membre/:slug`.
  - [`participant-member-suggestions.ts`](../../apps/web/src/app/shared/participant-add/participant-member-suggestions.ts) — **no change** in this story (3.8d).
- [x] **CSV** (AC: 9): extend export/import mapping in [`TroupeMemberCsvImportService`](../../services/api/src/main/kotlin/com/hatcast/api/troupe/) / export — document new role value; test one import row.
- [x] **Tests** (AC: 10):
  - API integration: create name-only externe; create with email+user link; deactivate externe → season participant stays ACTIVE; deactivate MEMBER → still cascades REMOVED; `GET /troupes` excludes externe-only; guarded endpoint 403 for externe-only user.
  - Web: `membres-tab.spec.ts`, `add-member-dialog` or new spec — filter chip, add externe validation, confirm copy.
  - Regression: `./gradlew test --tests '*TroupeMembership*' --tests '*SeasonParticipant*'` ; `npm run test -w @hatcast/web -- --run admin-membres membres-tab`.

---

## Dev Notes

### Product and UX rules

- **Single admin surface:** `/saison/:slug/admin/membres` — **no** separate contacts app (ADR-0021 §1).
- **Vocabulary (locked):** UI label **Externe**; route remains **Membres**; do not use « contact » as primary nav label.
- **Carnet vs membre:** Layer A (carnet) grants **nothing** in member app by itself — even if `user_id` is set.
- **Removal pyramid:** Downward cascade on **`MEMBER`** troupe remove unchanged (SCP 2026-05-31). **`EXTERNE`** carnet remove = INACTIVE membership only.
- **Reactivation:** Re-adding same externe (email or normalized name match on inactive externals) reuses membership row — align match order with ADR-0021 §4.4 (user → email → display name on inactive externals).
- **Self-join:** unchanged — creates `MEMBER` only ([DOMAIN.md](../../DOMAIN.md) demo direct join).

### Schema decision (name-only carnet)

Today [`TroupeMembershipEntity`](../../services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeMembershipEntity.kt) requires non-null `user`. ADR-0021 **requires** name-only carnet entries.

**Approved approach for this story:**

| Field | `MEMBER` / `TROUPE_ADMIN` | `EXTERNE` |
|-------|---------------------------|-----------|
| `user_id` | NOT NULL | NULL allowed |
| `display_name` | required | required |
| `normalized_email` | from user when linked | optional carnet email |

Do **not** auto-create shadow `users` rows for name-only externes.

### Authorization audit (critical)

`requireActiveMember` is used broadly (availability, audit read, composition decline restore, etc.). Central fix in [`TroupeMembershipService.requireActiveMembership`](../../services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeMembershipService.kt) or [`TroupeAccessService`](../../services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeAccessService.kt):

```kotlin
// Pseudocode — implement in service layer
fun requireActiveMemberMembership(userId, troupeId): TroupeMembershipEntity {
    val m = requireActiveMembership(userId, troupeId)
    if (m.baselineRole == TroupeBaselineRole.EXTERNE) {
        throw ResponseStatusException(HttpStatus.FORBIDDEN, "...")
    }
    return m
}
```

Run ripgrep for `requireActiveMembership` and `requireActiveMember` after implementation; invitation-derived access is **story 3.25**, not this story.

### Frontend implementation guardrails

| Concern | Action |
|--------|--------|
| **Reuse Membres tab** | Extend story **2.8** patterns — do not new route. |
| **Add dialog** | Prefer extending `add-member-dialog` with role `Externe` + conditional validators over duplicating entire dialog. |
| **Avatar** | Name-only: `app-user-avatar` with display name + `non_specified` gender. |
| **Role menu** | `EXTERNE` rows: show static chip **Externe**; no promote to Admin; optional future story for Externe → Membre promotion (ADR: out of scope). |
| **API client** | Extend `TroupeBaselineRole` union type; handle nullable `userId` in list rows. |

### Explicit non-goals

- `invitation_scope` column or participant add cascade (**3.23**).
- Typeahead including externes (**3.8d**).
- Guest `/agenda` / dispos for linked externes (**3.25**).
- Global user search; self-service externe join.
- Mandatory email on carnet.
- Auto-promotion `EXTERNE` → `MEMBER`.

### Dependencies

| Story / artifact | Status | Relationship |
|------------------|--------|----------------|
| **2.2** | done | Membership CRUD, last-admin guard |
| **2.8** | done | Membres admin UI shell |
| **2.3** | done | CSV export/import — extend role column |
| **3.8** | done | Participant model; sync must skip EXTERNE |
| **3.19** | done | Season remove ≠ troupe remove — unchanged |
| **ADR-0021** | accepted | Normative source |
| **SCP 2026-06-06 externes** | approved | Story breakdown P1 |
| **3.23** | backlog | **Blocked by this story** — scope + cascade |
| **3.8d** | backlog | **Blocked by** 2.21 + 3.23 |

### Architecture compliance

- Monorepo V2: [ARCH.md](../../ARCH.md) — Flyway under `services/api/src/main/resources/db/migration/`, OpenAPI source of truth.
- Auth: session + CSRF on mutations (`credentials: 'include'`).
- Authorization at **API** — Angular hides controls but must not be sole gate (**NFR-S2**).
- Member read: `TroupeAccessService` doc comment must be updated to document `EXTERNE` exclusion.

### File structure (expected touch list)

| File | Action |
|------|--------|
| `services/api/src/main/resources/db/migration/V58__*.sql` | NEW |
| `services/api/.../TroupeBaselineRole.kt` | UPDATE |
| `services/api/.../TroupeMembershipEntity.kt` | UPDATE |
| `services/api/.../TroupeMembershipService.kt` | UPDATE |
| `services/api/.../TroupeAccessService.kt` | UPDATE |
| `services/api/.../TroupeMembershipRepository.kt` | UPDATE (counts, queries) |
| `services/api/.../dto/TroupeDtos.kt` | UPDATE |
| `services/api/.../participant/SeasonParticipantService.kt` | UPDATE (sync filter) |
| `services/api/.../participant/SeasonParticipantMembershipSync.kt` | UPDATE |
| `services/api/openapi/seasons.yaml` | UPDATE |
| `apps/web/.../troupe-api.service.ts` | UPDATE |
| `apps/web/.../admin-membres/add-member-dialog.ts` | UPDATE (or NEW externe dialog) |
| `apps/web/.../admin-membres/membres-tab.ts` / `.html` | UPDATE |
| `apps/web/.../admin-membres/*.spec.ts` | UPDATE |
| `services/api/src/test/.../TroupeMembership*Test*.kt` | NEW/UPDATE |

### Testing requirements

| Layer | What to test |
|-------|----------------|
| **Integration** | Name-only externe POST; email link; externe deactivate no season REMOVED; member deactivate cascade regression; requireActiveMember 403 |
| **Unit** | DTO mapping nullable user; role validation |
| **Component** | Filter chips; add externe without email; confirm copy |
| **Regression** | Story 2.8 membres flows; story 2.2 last-admin |

### Previous story intelligence

**From story 2.8 (done):**

- Membres tab at `/saison/:slug/admin/membres`; `listMembers(troupeId, 0, 100)` client filter; add dialog requires email today — **this story relaxes validation for Externe**.
- **Retirer** on members calls `DELETE /members/{id}` soft deactivate — reuse endpoint with server-side EXTERNE branch.

**From story 3.8 / 3.19 (done):**

- Season participants ≠ troupe membership; removal levels differ — externe carnet remove must **not** mimic MEMBER cascade.

**From SCP 2026-06-06 (approved):**

- P1 before 3.23; auth refactor risk rated **high** — audit all member read paths.

### Git intelligence

| Commit | Relevance |
|--------|-----------|
| `115776cd` | SCP + ADR-0021 approved; FR44/3.8 amended; backlog 2.21 added |
| `2392adae` | Typeahead membres-only — 3.8d will extend later |

### Latest tech notes

- **Spring Data JPA** nullable `@ManyToOne` — use `optional = true` on `user` for EXTERNE rows; audit FK `subjectUserId` may be null on name-only externe deactivate.
- **Angular 21** signals in add dialog — match existing `signal()` pattern in `add-member-dialog.ts`.
- **OpenAPI nullable** — `userId` nullable on `TroupeMemberAdmin` may require front null checks in `membres-tab` row actions (no « Nommer organisateur·ice » for user-less rows).

### Project context reference

- [project-context.md](../../project-context.md)
- [docs/adr/0021-troupe-externes-carnet-invitations.md](../../docs/adr/0021-troupe-externes-carnet-invitations.md)
- [sprint-change-proposal-2026-06-06-troupe-externes-adr-0021.md](../planning-artifacts/sprint-change-proposal-2026-06-06-troupe-externes-adr-0021.md)
- [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md)
- [2-8-admin-membres-route-ui-ux-dr10.md](./2-8-admin-membres-route-ui-ux-dr10.md)

## Dev Agent Record

### Agent Model Used

Composer (dev-story, 2026-06-06)

### Completion Notes List

- Ultimate context engine analysis completed — comprehensive developer guide created (2026-06-06).
- **Schema gap flagged:** `user_id NOT NULL` today — migration required for name-only carnet (ADR normative).
- **Deactivate branch:** EXTERNE must not call `removeForMembershipAcrossTroupe` (ADR §6 vs MEMBER cascade).
- **Implemented:** V59 migration; `POST /v1/troupes/{id}/externes`; `requireActiveMemberMembership`; sync skip; Membres UI filter chips + dialog Externe mode; CSV name-only import row.
- **M3 checklist:** M3-1/2/3/5 validated (Material dialog/chips/form-field, `--mat-sys-*` tokens, mobile dialog width). M3-4 N/A (no member chrome for externes).
- **Tests:** `./gradlew test --tests '*TroupeMembership*' --tests '*SeasonParticipant*'` green; `ng test` membres-tab + add-member-dialog specs green.
- **Edge case documented:** same `(troupe_id, user_id)` cannot hold both MEMBER and EXTERNE rows — linked externe uses one membership row with `baselineRole=EXTERNE`.

### File List

- `services/api/src/main/resources/db/migration/V59__troupe_externe_carnet.sql`
- `services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeBaselineRole.kt`
- `services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeMembershipEntity.kt`
- `services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeMembershipService.kt`
- `services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeAccessService.kt`
- `services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeMembershipRepository.kt`
- `services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeController.kt`
- `services/api/src/main/kotlin/com/hatcast/api/troupe/dto/TroupeDtos.kt`
- `services/api/src/main/kotlin/com/hatcast/api/troupe/dto/MemberImportDtos.kt`
- `services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeMemberCsvCodec.kt`
- `services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeMemberCsvImportService.kt`
- `services/api/src/main/kotlin/com/hatcast/api/participant/SeasonParticipantService.kt`
- `services/api/src/main/kotlin/com/hatcast/api/participant/SeasonParticipantMembershipSync.kt`
- `services/api/src/main/kotlin/com/hatcast/api/memberprofile/MemberProfileService.kt`
- `services/api/openapi/seasons.yaml`
- `services/api/src/test/kotlin/com/hatcast/api/troupe/TroupeMembershipIntegrationTest.kt`
- `services/api/src/test/kotlin/com/hatcast/api/participant/SeasonParticipantServiceTest.kt`
- `apps/web/src/app/core/troupes/troupe-api.service.ts`
- `apps/web/src/app/pages/admin-membres/add-member-dialog.ts`
- `apps/web/src/app/pages/admin-membres/add-member-dialog.spec.ts`
- `apps/web/src/app/pages/admin-membres/membres-tab.ts`
- `apps/web/src/app/pages/admin-membres/membres-tab.html`
- `apps/web/src/app/pages/admin-membres/membres-tab.scss`
- `apps/web/src/app/pages/admin-membres/membres-tab.spec.ts`
- `apps/web/src/app/pages/event-detail/event-organizers-dialog.ts`
- `apps/web/src/app/shared/participant-add/participant-member-suggestions.ts`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/2-21-troupe-externes-carnet.md`

### Change Log

- 2026-06-06: Story created (`bmad-create-story`) — ADR-0021 P1 carnet.
- 2026-06-06: Implemented carnet EXTERNE (API + Membres UI + tests).
- 2026-06-06: Code review patches applied (CSV guards, email update PATCH, conflict checks, tests).

### Review Findings

- [x] [Review][Patch] CSV import peut promouvoir un EXTERNE en MEMBER/ADMIN [`TroupeMemberCsvImportService.kt:93`]
- [x] [Review][Patch] `addMemberByEmail` réactive un EXTERNE inactif en MEMBER [`TroupeMembershipService.kt:329`]
- [x] [Review][Patch] `addExterne` / `importExterneRow` sans garde conflit si `user_id` a déjà une adhésion MEMBER active [`TroupeMembershipService.kt:467`, `TroupeMemberCsvImportService.kt:148`]
- [x] [Review][Patch] Pas de chemin mise à jour email / `user_id` sur externe ACTIVE (AC4 « updated ») [`TroupeMembershipService.kt:502`]
- [x] [Review][Patch] Tests manquants : import EXTERNE sans nom, export externe inactif, transitions rôle EXTERNE invalides, `SeasonParticipantMembershipSync` skip [`TroupeMembershipIntegrationTest.kt`, `TroupeMemberCsvImportService.kt`]
- [x] [Review][Patch] Validation email externe trop faible (`contains("@")` seulement) [`TroupeMembershipService.kt:434`]
- [x] [Review][Patch] Sélecteur de rôle visible en mode Externe alors que `submitExterne()` l'ignore [`add-member-dialog.ts`]
- [x] [Review][Defer] Réactivation inactive par `displayName` ambiguë si homonymes [`TroupeMembershipService.kt:782`] — deferred, homonymes MVP acceptés ADR-0021
- [x] [Review][Defer] Pas d'index sur `normalized_email` pour matching carnet [`V59__troupe_externe_carnet.sql`] — deferred, perf MVP
- [x] [Review][Defer] `addExterne` côté front ne parse pas le corps d'erreur API [`troupe-api.service.ts`] — deferred, UX mineure
- [x] [Review][Defer] Renommage externe ne propage pas vers `season_participants` liés [`SeasonParticipantMembershipSync.kt:26`] — deferred, story 3.23
- [x] [Review][Defer] Modifications genre participant dans le même diff hors périmètre 2.21 [`SeasonParticipantService.kt`] — deferred, lot participant-gender mélangé

---

### Validation create-story

- [x] AC métier numérotés et sourcés (ADR / SCP / FR)
- [x] Section **Material 3** remplie (Membres admin UI)
- [x] Tasks référencent les numéros d'AC (y compris M3-x)
- [x] Liens vers fichiers code existants à réutiliser
- [x] `./gradlew test` / `npm run test -w @hatcast/web` mentionnés
