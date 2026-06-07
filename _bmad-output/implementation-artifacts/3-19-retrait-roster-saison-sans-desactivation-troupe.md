# Story 3.19: Season roster removal without troupe deactivation

Status: done

**SCP:** [sprint-change-proposal-2026-05-31-participant-removal-three-levels.md](../planning-artifacts/sprint-change-proposal-2026-05-31-participant-removal-three-levels.md) — Approved (Patrice, 2026-05-31).

## Story

As a **season administrator**,  
I want to **remove a troupe member from this season’s roster without removing them from the troupe**,  
so that **they disappear from season stats and selectors but remain a troupe member (other seasons unaffected)**.

## Acceptance Criteria

1. **Given** an admin on `/saison/:slug/admin/participants` and a row with `kind = MEMBER`, **when** they confirm **Retirer**, **then** the API soft-removes **this season’s** participant (`season_participants.status = REMOVED`) and **does not** call troupe member deactivation. [Source: SCP 2026-05-31 §2.3; DOMAIN.md three-level removal; FR43]
2. **Given** a season-local removal, **when** the admin views another season of the same troupe, **then** the person may still appear there if they were on that roster. [Source: SCP §2.3]
3. **Given** `ensureMembershipParticipants` runs on `GET /participants`, **when** a participant was removed at season scope, **then** they are **not** re-activated while `troupe_memberships.status = ACTIVE`. [Source: story 3.8 amended remove policy]
4. **Given** a troupe admin on `/troupe/:slug/admin/membres`, **when** they **Retirer** a member, **then** troupe membership is deactivated and all linked season participants for that troupe cascade to `REMOVED` (regression — Story 2.2). [Source: SCP §2.4]
5. **Given** historical availability/composition rows for a removed participant, **when** they are re-included at season level, **then** the same `season_participant_id` is reactivated and prior data is visible again in stats/selectors. [Source: SCP §2.1]
6. **Given** event-level exclusion exists for a participant, **when** they are removed at season level then re-included, **then** event exclusions remain unless explicitly cleared (filters compose). [Source: SCP §2.5]
7. **Couverture:** integration tests (API) + `admin-participants` component tests; `./gradlew test`, `ng test`.

---

## Acceptance Criteria — Material 3 (UI)

**M3-1. Composants Material** — Confirm dialog uses existing `ConfirmDialog` / `MatDialog`; row actions use Material buttons with French `aria-label`.

**M3-2. Tokens & thème** — No new hard-coded colors.

**M3-3. Mobile & tactile** — Retirer control ≥ 48dp; `aria-label="Retirer ce membre de la saison"`.

**M3-4. Navigation membre** — N/A (admin surface only).

**M3-5. Revue** — Checklist FRONTEND_UI.md at story completion.

**Copy (French):**

| Element | Text |
|---------|------|
| Confirm title | Retirer de cette saison ? |
| Confirm body | Il disparaîtra du roster, des statistiques et des sélecteurs de cette saison. Son adhésion à la troupe est conservée. |
| Snackbar success | Membre retiré de la saison. |
| Optional link | Retirer de la troupe… → `/troupe/:slug/admin/membres` (MVP+ if time) |

---

## Tasks / Subtasks

- [x] **Périmètre :** `services/api/` + `apps/web/`
- [x] **API — season remove for member rows:** Allow `DELETE /v1/seasons/{seasonId}/participants/{participantId}` (or dedicated action) when `troupeMembershipId != null`; set `REMOVED` + sync guard marker (`removal_source = SEASON_ADMIN` or equivalent — see Dev Notes).
- [x] **API — sync guard:** Update `ensureMembershipParticipants` / `SeasonParticipantMembershipSync` to skip re-ACTIVATE for season-admin removals; troupe cascade sets `MEMBERSHIP_INACTIVE` source.
- [x] **API — re-inclusion:** Endpoint or PATCH to reactivate season participant (`ACTIVE`, clear season-admin marker); idempotent.
- [x] **Frontend — revert wrong path:** `admin-participants.ts` must **not** call `TroupeApiService.deactivateMember` for member rows.
- [x] **Frontend — copy:** Apply SCP copy matrix; keep troupe removal on `membres-tab` only.
- [x] **Tests:** Integration per SCP §7; extend `ParticipantControllerIntegrationTest`, `admin-participants.spec.ts`.
- [x] **Docs:** DOMAIN.md updated (done in SCP approval); openapi `participants.yaml` if contract changes.

## Dev Notes

### Product and UX rules

Three-level removal pyramid (normative): **event exclusion** → **season roster removal** → **troupe membership removal**. Only level 3 cascades all seasons. Event exclusion (`event_participant_exclusions`) is the reference implementation — season removal must mirror its “local filter” semantics at season scope.

**Revert:** Current `admin-participants` wiring that calls `deactivateMember` is a bug relative to amended story 3.8.

### Sync guard (recommended: Option A)

Add `season_participants.removal_source` enum: `SEASON_ADMIN | MEMBERSHIP_INACTIVE | null`.

- Season admin remove → `REMOVED`, `removal_source = SEASON_ADMIN`
- Troupe deactivate cascade → `REMOVED`, `removal_source = MEMBERSHIP_INACTIVE`
- `ensureMembershipParticipants`: for ACTIVE membership, upsert ACTIVE **only if** `removal_source != SEASON_ADMIN`
- Re-inclusion: set `ACTIVE`, `removal_source = null`

Flyway migration required. Document in Dev Notes / optional ADR if schema debate.

### Explicit non-goals

- Changing event exclusion behavior (already correct).
- Hard-deleting availability/composition history.
- Account deletion (Story 1.7).

### Dependencies

| Story | Status | Relationship |
|-------|--------|----------------|
| 3.8 | done | Amended remove policy; this story implements the missing path |
| 2.2 / 2.8 | done | Troupe removal remains on Membres only |
| 17.16 | done | Event admin participants — level 1 reference |

## Dev Agent Record

### Agent Model Used

Composer (Cursor)

### Completion Notes List

- Migration `V38__season_participant_removal_source.sql` adds `removal_source` (`SEASON_ADMIN` | `MEMBERSHIP_INACTIVE`).
- `SeasonParticipantService.remove` accepts member rows; sets `SEASON_ADMIN`. New `reinclude` + `POST .../reinclude`.
- Sync guard in `ensureMembershipParticipants` and `SeasonParticipantMembershipSync.ensureForMembership` skips `SEASON_ADMIN` rows.
- Troupe cascade (`removeForMembership*`) sets `MEMBERSHIP_INACTIVE`; troupe reactivation clears via sync.
- Frontend: member **Retirer** calls `removeSeasonParticipant`, not `deactivateMember`; SCP copy applied.
- Integration tests: season-only remove (other season intact), sync no-restore, troupe cascade regression, reinclude + event exclusion compose.
- Frontend: 14/14 `admin-participants.spec.ts` pass. API: 21 participant tests pass.
- M3: ConfirmDialog/MatDialog, French aria-label, no new colors; optional Membres link deferred (MVP+).
- Re-inclusion UX (2026-05-31): no dedicated "Réintégrer" button — re-inclusion is the **« Ajouter »** flow. `SeasonParticipantService.create` detects an existing `REMOVED` row (linked user → email → display-name) and **reactivates the same `season_participant_id`** (clears `SEASON_ADMIN`, re-syncs member name/email from the membership) instead of duplicating; same `400 « Réactivez d'abord l'adhésion à la troupe. »` guard when the membership is INACTIVE. History (dispos/compositions) reappears since the row id is reused. Added `3.19-INT-018/019/020`.

### File List

- `services/api/src/main/resources/db/migration/V38__season_participant_removal_source.sql`
- `services/api/src/main/kotlin/com/hatcast/api/participant/ParticipantEnums.kt`
- `services/api/src/main/kotlin/com/hatcast/api/participant/ParticipantEntities.kt`
- `services/api/src/main/kotlin/com/hatcast/api/participant/SeasonParticipantService.kt`
- `services/api/src/main/kotlin/com/hatcast/api/participant/SeasonParticipantMembershipSync.kt`
- `services/api/src/main/kotlin/com/hatcast/api/participant/ParticipantController.kt`
- `services/api/src/main/kotlin/com/hatcast/api/participant/ParticipantRepositories.kt`
- `services/api/src/main/kotlin/com/hatcast/api/season/SeasonRepository.kt`
- `services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeMembershipService.kt`
- `services/api/openapi/participants.yaml`
- `services/api/src/test/kotlin/com/hatcast/api/participant/ParticipantControllerIntegrationTest.kt`
- `services/api/src/test/kotlin/com/hatcast/api/participant/SeasonParticipantServiceTest.kt`
- `apps/web/src/app/pages/admin-participants/admin-participants.ts`
- `apps/web/src/app/pages/admin-participants/admin-participants.spec.ts`
- `apps/web/src/app/core/participants/participant-api.service.ts`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

### Review Findings

_Code review 2026-05-31 (Blind Hunter + Edge Case Hunter + Acceptance Auditor). Coverage: AC1–AC7, M3-1..M3-5 et invariants SCP §2.1–2.5 jugés satisfaits par l'auditeur d'acceptation._

- [x] [Review][Patch] (décision résolue → rétrograder) Organisateur saison rafraîchi ET rétrogradé au retrait season-local — `removeParticipant` prend désormais le participant, retire l'organisateur saison s'il l'est (`organizerApi.removeSeasonOrganizer`) puis `reloadSeasonOrganizers()`. [apps/web/src/app/pages/admin-participants/admin-participants.ts:387]
- [x] [Review][Patch] (décision résolue → patch, après investigation) Garde EVENT-fallback ajouté : `buildRoster` et `CompositionParticipantPool` ignorent les rows event liées à une row saison `REMOVED` (par `status` ou par `userId` via `findRemovedUserIdsForSeason`). [services/api/.../composition/CompositionParticipantPool.kt; .../participant/EventRosterService.kt]
- [x] [Review][Patch] `addMemberByEmail` appelle `syncSeasonParticipantsAfterStatusChange` lors de la réactivation INACTIVE→ACTIVE (réactive les rows `MEMBERSHIP_INACTIVE` + invalide le cache). [services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeMembershipService.kt:220]
- [x] [Review][Patch] `reinclude` resynchronise `displayName`/`normalizedEmail`/`user` depuis l'adhésion pour les rows membre. [services/api/src/main/kotlin/com/hatcast/api/participant/SeasonParticipantService.kt:202]
- [x] [Review][Patch] `reinclude` applique le garde d'unicité de nom (`...DisplayNameIgnoreCaseAndIdNot`) pour les participants explicites. [services/api/src/main/kotlin/com/hatcast/api/participant/SeasonParticipantService.kt:179]
- [x] [Review][Patch] `when (targetStatus)` rendu exhaustif avec `else -> Unit`. [services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeMembershipService.kt:567]
- [x] [Review][Patch] OpenAPI : `404` documenté sur `DELETE /seasons/{id}/participants/{id}`. [services/api/openapi/participants.yaml:78]
- [x] [Review][Patch] Le test composant exerce désormais `confirmRemove(member)` (dialog → `confirmRemoveTroupeMember` → branche saison). 14/14 verts. [apps/web/src/app/pages/admin-participants/admin-participants.spec.ts:352]

_Vérification : `compileKotlin` OK ; front `admin-participants.spec.ts` 14/14 ✅ ; API `ParticipantControllerIntegrationTest` + `SeasonParticipantServiceTest` → BUILD SUCCESSFUL ✅ (re-lancés après stabilisation du working tree ; le blocage de compilation transitoire dû à `AvailabilityControllerIntegrationTest`/6-14 est résolu)._
- [x] [Review][Defer→Closed] Migration V38 sans backfill — **DW-118** clos 2026-06-07 : audit SQL staging + prod **0 row** ; pas de V61. [`investigations/dw-118-investigation.md`](../investigations/dw-118-investigation.md)
- [x] [Review][Defer] N+1 dans `removeForMembershipAcrossTroupe`/`ensureForMembershipAcrossTroupe` (une requête par saison). [services/api/src/main/kotlin/com/hatcast/api/participant/SeasonParticipantMembershipSync.kt:337] — deferred, pre-existing
- [x] [Review][Defer] Course `reinclude` vs désactivation d'adhésion concurrente (zombie transitoire, auto-réparé par `findActiveLinkedToInactiveMembershipsForSeason`). [services/api/src/main/kotlin/com/hatcast/api/participant/SeasonParticipantService.kt:193] — deferred, pre-existing
- [x] [Review][Defer] Cible tactile du bouton « Retirer » (`mat-icon-button`, 40dp) potentiellement < 48dp (M3-3) — pattern préexistant non introduit ici. [apps/web/src/app/pages/admin-participants/admin-participants.html] — deferred, pre-existing
- [x] [Review][Defer] Logique de réconciliation `SEASON_ADMIN` dupliquée entre `SeasonParticipantMembershipSync` et `SeasonParticipantService` (dette de drift). [services/api/src/main/kotlin/com/hatcast/api/participant/SeasonParticipantMembershipSync.kt:317] — deferred, pre-existing
- [x] [Review][Defer] Méthode repository `findByTroupeMembership_Id` ajoutée mais non utilisée (code mort). [services/api/src/main/kotlin/com/hatcast/api/participant/ParticipantRepositories.kt:271] — deferred, pre-existing

## Change Log

- 2026-05-31: Story 3.19 implemented — season-local member removal, sync guard (`removal_source`), reinclude API, UI revert from troupe deactivation.
- 2026-05-31: Code review — 2 decision-needed (résolues → patch), 8 patch appliqués, 6 deferred, 4 dismissed. Statut → done.
- 2026-05-31: Re-inclusion via « Ajouter » — `create` réactive la ligne `REMOVED` existante (par utilisateur/email/nom) au lieu de dupliquer ; tests `3.19-INT-018/019/020` ; précondition de `3.19-INT-014` reconstruite via PATCH rename.
- 2026-05-31: Recette manuelle 3 surfaces **PASS** (`scripts/v2/RECETTE-3.19-RETRAIT-ROSTER-SAISON.md`) — 9 scénarios + 2 contrôles (M2 waiver tactile). Aucun écart.
