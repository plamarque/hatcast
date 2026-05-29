# Story 18.2: Self-join OPEN + platform admin join policy API

Status: done

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

## Story

As an **authenticated member**,  
I want to **join any troupe with `join_policy = OPEN`** (including production **Démo**) without an invitation,  
so that **I can discover the product**; as a **platform super-admin**, I want to **change a troupe's join policy**.

## Acceptance Criteria

1. **Given** a troupe with `join_policy = OPEN`, **when** `POST /v1/troupes/{id}/memberships/me`, **then** an active **`MEMBER`** membership is created or reactivated — never `TROUPE_ADMIN`. [Source: epics 18.2 AC1; FR61]
2. **Given** a troupe with `join_policy = INVITE_ONLY`, **when** the same call is made, **then** **403** with a coherent French message (e.g. « Adhésion directe non autorisée pour cette troupe. »). [Source: epics 18.2 AC2; FR61]
3. **Given** self-join on a **Démo** troupe (`is_demo = true`), **when** join succeeds, **then** the user is enrolled as an **ACTIVE season participant** on that troupe's **active season** (roster/league — not membership alone). [Source: epics 18.2 AC3; FR61]
4. **Given** a **platform admin** (`PlatformAdminService`), **when** `PATCH /v1/admin/troupes/{id}` with `{ "joinPolicy": "INVITE_ONLY" }`, **then** the troupe's join policy is updated and returned. [Source: epics 18.2 AC4; FR63]
5. **Given** a **troupe admin** who is **not** a platform admin, **when** they attempt to change join policy, **then** **403**. [Source: epics 18.2 AC5; FR63]
6. **Given** a policy change `OPEN` → `INVITE_ONLY`, **when** applied, **then** existing active memberships are **preserved** (no deactivation). [Source: epics 18.2 AC6]
7. **Given** the implementation, **when** reviewed, **then** [`TroupeController.joinTroupe`](../../services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeController.kt) no longer gates on `isSeedTroupe()` alone — any `OPEN` troupe is allowed (Démo included). [Source: epics 18.2 AC7]
8. **Given** legacy config `hatcast.troupe.seed-troupe-id`, **when** documented, **then** it is marked **deprecated** in favour of `is_demo` + prod Démo UUID (`…000099`); removal deferred to Story **18.5**. [Source: epics 18.2 AC8]
9. **Product coverage:** FR61, FR62, FR63; replaces provisional Story 2.1 self-join contract. **UI : N/A** — no changes under `apps/web/` in this story.

---

## Acceptance Criteria — Material 3 (UI)

**UI : N/A** — backend-only story (`services/api/`); no user-visible Angular changes. Material 3 section omitted intentionally.

---

## Tasks / Subtasks

- [x] **Scope:** `services/api/` only — join authorization, demo season enrollment, platform-admin PATCH, OpenAPI, SecurityConfig, integration tests

- [x] **Replace seed-troupe gate with `join_policy`** (AC: 1, 2, 7)
  - [x] Add `TroupeAccessService.requireSelfJoinAllowed(troupeId: UUID)` (or equivalent) loading troupe from DB and checking `joinPolicy == OPEN`; throw **403** French message if `INVITE_ONLY`; **404** if troupe unknown.
  - [x] Refactor [`TroupeController.joinTroupe`](../../services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeController.kt): remove `isSeedTroupe()` check; delegate to new service method.
  - [x] Add `TroupeMembershipService.selfJoin(userId, troupeId): TroupeMembershipEntity` encapsulating: policy check → `ensureActiveMembership` (always `MEMBER`) → optional demo enrollment (AC3).
  - [x] Mark `TroupeAccessService.isSeedTroupe()` / `seedTroupeId()` as `@Deprecated` with KDoc pointing to 18.5; do **not** remove yet (tests/helpers may still reference env UUID).

- [x] **Demo season participant enrollment on self-join** (AC: 3)
  - [x] Add `SeasonRepository.findByTroupe_IdAndIsActiveTrue(troupeId: UUID): SeasonEntity?` (or equivalent single-row query).
  - [x] After successful self-join when `troupe.isDemo == true`: resolve active season for troupe; if present, ensure season participant row linked to membership (reuse logic from [`SeasonParticipantService.ensureMembershipParticipants`](../../services/api/src/main/kotlin/com/hatcast/api/participant/SeasonParticipantService.kt) — prefer extracting `ensureSeasonParticipantForMembership(season, membership)` to avoid duplicating sync rules).
  - [x] Participant row must link `troupeMembership`, `user`, `displayName` from membership, `status = ACTIVE` — same shape as membership-sync rows (see [`ParticipantEntities.kt`](../../services/api/src/main/kotlin/com/hatcast/api/participant/ParticipantEntities.kt)).
  - [x] **Non-demo OPEN troupes:** membership only — no automatic season enrollment (AC1 without AC3 side effect).
  - [x] **Edge case:** demo troupe with no active season → membership succeeds; skip enrollment (no error). Document in Dev Notes; full demo bootstrap is Story **18.3**.

- [x] **Platform admin PATCH join policy** (AC: 4, 5, 6)
  - [x] Create [`AdminTroupeController`](../../services/api/src/main/kotlin/com/hatcast/api/troupe/) at `PATCH /v1/admin/troupes/{troupeId}`.
  - [x] Request DTO `UpdateTroupeJoinPolicyRequest { joinPolicy: TroupeJoinPolicy }` (required field).
  - [x] Response: `TroupeAdminDto` or reuse `TroupeListItemDto`-like shape with at least `id`, `name`, `slug`, `joinPolicy`, `isDemo` (no membership block needed for admin).
  - [x] Authorize via `PlatformAdminService.isPlatformAdmin(principal)` only — troupe admins **must not** pass (AC5).
  - [x] `TroupeService.updateJoinPolicy(troupeId, joinPolicy)` or dedicated admin service — load troupe, set `joinPolicy`, save; **do not** touch memberships (AC6).
  - [x] **Critical:** add `/v1/admin/**` to authenticated matchers in [`SecurityConfig.kt`](../../services/api/src/main/kotlin/com/hatcast/api/config/SecurityConfig.kt) — today `.anyRequest().denyAll()` blocks unknown paths.

- [x] **OpenAPI** (AC: 7, 8, 9)
  - [x] Update `POST /troupes/{troupeId}/memberships/me` in [`seasons.yaml`](../../services/api/openapi/seasons.yaml): summary/description — self-join for **`join_policy = OPEN`** troupes; remove « seed/démonstration only » wording; 403 = INVITE_ONLY or CSRF.
  - [x] Add `PATCH /admin/troupes/{troupeId}` path + schemas (`UpdateTroupeJoinPolicyRequest`, admin troupe response) with French descriptions referencing FR63.
  - [x] Update top-level `info.description` line 11 (still says demo-only join).

- [x] **Integration tests** (AC: 1–7)
  - [x] Update [`TroupeMembershipIntegrationTest.kt`](../../services/api/src/test/kotlin/com/hatcast/api/troupe/TroupeMembershipIntegrationTest.kt):
    - Replace `direct join is limited to seed troupe` with **OPEN allows join** on a non-seed troupe (`joinPolicy = OPEN`).
    - Add **INVITE_ONLY returns 403** on a troupe with `joinPolicy = INVITE_ONLY`.
    - Add **demo self-join creates season participant**: create troupe `isDemo = true`, `joinPolicy = OPEN`, active season; self-join; assert `season_participants` row with `troupe_membership_id` linked to user.
    - Preserve existing idempotency, CSRF, and Les Improbots join tests (Improbots remains OPEN — should still work).
  - [x] Add admin PATCH tests (new class or same file):
    - Platform admin (`platform-members-admin@hatcast.test` from [`application-test.yml`](../../services/api/src/test/resources/application-test.yml)) can PATCH join policy.
    - Troupe admin (non platform) gets **403**.
    - After `OPEN` → `INVITE_ONLY`, existing member count unchanged.
  - [x] Optional unit test for `ensureSeasonParticipantForMembership` idempotency (mirror [`SeasonParticipantServiceTest`](../../services/api/src/test/kotlin/com/hatcast/api/participant/SeasonParticipantServiceTest.kt)).

- [x] **Config / docs (minimal)** (AC: 8)
  - [x] Add deprecation comment on `hatcast.troupe.seed-troupe-id` in [`application.yml`](../../services/api/src/main/resources/application.yml) — superseded by `join_policy` + `is_demo`; removal in 18.5.
  - [x] DOMAIN.md already states `join_policy = OPEN` rule — no change required unless wording still mentions seed-only.

---

## Dev Notes

### Why this story exists (Epic 18 — behaviour switch)

| Context | Detail |
|---------|--------|
| **18.1 (review)** | Columns `join_policy`, `is_demo` persisted; join flow **unchanged** (`isSeedTroupe` still active) |
| **This story** | Switch runtime gate to `join_policy`; add super-admin PATCH; demo roster enrollment |
| **18.3 next** | Inserts prod **Démo** row (`is_demo = true`, UUID `…000099`) + pedagogical season via `db/migration` |
| **18.4 next** | Frontend « Rejoindre la troupe de démonstration » → UUID `…000099` |

### Three troupes — do not conflate

| Name | UUID suffix | `is_demo` | Self-join in 18.2 |
|------|-------------|-----------|-------------------|
| **Les Improbots** | `…000001` | `false` | OPEN — membership only (no season auto-enroll) |
| **Démo** (prod, 18.3) | `…000099` | `true` | OPEN — membership + active season participant |
| **La Malice** | varies | `false` | Depends on `join_policy` (default OPEN from 18.1) |

### Current code hotspots (must change)

```kotlin
// TroupeController.kt L71-73 — REPLACE this gate
if (!troupeAccess.isSeedTroupe(troupeId)) {
    throw ResponseStatusException(HttpStatus.FORBIDDEN, "Adhésion directe réservée à la troupe de démonstration.")
}
```

```kotlin
// TroupeMembershipService.ensureActiveMembership — REUSE for membership creation
// Does NOT enroll season participants today
```

```kotlin
// SeasonParticipantService.ensureMembershipParticipants — REUSE sync logic for demo enroll
// Lazy sync on listAdmin/listSelectors; demo join needs eager single-member call
```

### Recommended service flow (`selfJoin`)

```
POST /memberships/me
  → load troupe (404 if missing)
  → if joinPolicy != OPEN → 403
  → membership = ensureActiveMembership(userId, troupeId)  // always MEMBER
  → if troupe.isDemo:
       season = findByTroupe_IdAndIsActiveTrue(troupeId)
       if season != null: ensureSeasonParticipantForMembership(season, membership)
  → return MembershipSummaryDto
```

### Platform admin API shape (decided — readiness report)

| Decision | Choice |
|----------|--------|
| Namespace | **`/v1/admin/troupes/{id}`** — new controller, not nested under member `/v1/troupes` |
| Auth | `PlatformAdminService.isPlatformAdmin(principal)` in controller/service — same pattern as member management bypass in [`TroupeMembershipService.requireCanManageTroupeMembers`](../../services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeMembershipService.kt) |
| CSRF | Required on PATCH (mutations) |
| SecurityConfig | **Must whitelist** `/v1/admin/**` — otherwise Spring Security returns deny before controller |

Test platform admin email: `platform-members-admin@hatcast.test` (see existing test `platform admin can manage members without troupe admin role`).

### Demo season resolution (AC3)

- Prod Démo season (18.3): UUID `b0000001-0000-4000-8000-000000000099`, slug `saison-2026-2027`, `is_active = true`.
- **Do not hardcode UUID** in join logic — use `isActive = true` on the troupe's seasons (one active season per troupe is the existing product pattern; see [`SeasonService`](../../services/api/src/main/kotlin/com/hatcast/api/season/SeasonService.kt) activate/deactivate).
- Integration tests create demo troupe + active season inline (18.3 bootstrap not required for 18.2 tests).

### Explicit non-goals (scope guard)

| Out of scope | Owner story |
|--------------|-------------|
| Prod Démo bootstrap SQL (~20 events, fictitious participants) | **18.3** |
| Frontend join button / badge « Démo » | **18.4** |
| Remove `HATCAST_SEED_TROUPE_ID` env / update `demoTroupeId` | **18.5** |
| Troupe admin UI to change join policy | Post-MVP (FR63 = platform admin only) |
| Premium paywall on `INVITE_ONLY` | Deferred |
| Auto-enroll season participant on non-demo OPEN troupes | Out of scope — demo only (AC3) |
| `GET /v1/troupes/{id}` public detail endpoint | Not needed |

### Backend implementation guardrails

| Concern | Pattern to follow |
|--------|-------------------|
| Join role | Self-join **never** elevates to `TROUPE_ADMIN` — `ensureActiveMembership` already defaults `MEMBER`; reactivation must not change role |
| Policy persistence | Update `TroupeEntity.joinPolicy` only via admin PATCH — not exposed on member PATCH |
| Error messages | French, consistent with existing 403 strings in troupe controllers |
| Transactions | `selfJoin` + demo enrollment in one `@Transactional` method |
| OpenAPI fragments | [`seasons.yaml`](../../services/api/openapi/seasons.yaml) for troupe paths; consider admin path in same file (troupe domain) |
| Enum | Reuse [`TroupeJoinPolicy`](../../services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeJoinPolicy.kt) |

### Architecture compliance

- **Stack:** Kotlin 3.4 + Spring Boot JPA; no new dependencies.
- **Security:** Session cookie + CSRF on mutations; platform admin = email allowlist (`hatcast.auth.super-admin-emails`).
- **ADR-0015:** Demo troupe row arrives in **18.3**; this story's demo enrollment logic must work once that migration runs.
- **FR50 pattern:** Season roster sync from memberships exists in `ensureMembershipParticipants` — align demo eager enroll with that logic to avoid divergent participant rows.

### Testing standards

```bash
cd services/api && ./gradlew test
```

Follow session + CSRF patterns in [`TroupeMembershipIntegrationTest.kt`](../../services/api/src/test/kotlin/com/hatcast/api/troupe/TroupeMembershipIntegrationTest.kt) and [`TestAuthSupport.kt`](../../services/api/src/test/kotlin/com/hatcast/api/support/TestAuthSupport.kt).

Key test mutations from 18.1 baseline:
- `direct join is limited to seed troupe` → **replace** with OPEN/INVITE_ONLY matrix
- Les Improbots join tests remain valid (`joinPolicy = OPEN`, `isDemo = false`)

### Previous story intelligence (18.1)

- Migration **V32** adds `join_policy` / `is_demo`; CHECK constraint `troupes_join_policy_chk` validated on H2.
- DTO fields `joinPolicy`, `isDemo` on `TroupeListItemDto` — admin PATCH response should expose same fields.
- **Do not** set `is_demo = true` on Les Improbots seed.
- `./gradlew test` green after 18.1.

### Dependencies

| Story | Status | Relationship |
|-------|--------|--------------|
| **18.1** | review | **Blocks** — provides `join_policy`, `is_demo` columns and DTO fields |
| 2.1 / 2.11 | done | `POST /memberships/me` endpoint exists |
| **18.3** | backlog | Consumes demo enrollment logic once Démo row exists in prod |
| **18.4** | backlog | Frontend calls self-join against Démo UUID |
| **18.5** | backlog | Deprecate/remove `seed-troupe-id` config |
| ADR-0015 | accepted | Demo bootstrap in 18.3 |

### Git intelligence (recent)

- `a4f35be` — Les Improbots rename (18.0); seed UUID `…000001` unchanged.
- `d4f64d1` — Platform admin test email patterns established.
- 18.1 changes (uncommitted/review): V32, `TroupeJoinPolicy`, DTO/OpenAPI — **assume merged or implement on top of working tree**.

---

## Dev Agent Record

### Agent Model Used

Composer

### Completion Notes List

- `POST /v1/troupes/{id}/memberships/me` : gate `join_policy = OPEN` via `TroupeMembershipService.selfJoin` ; inscription participant saison si `isDemo` + saison active.
- `TroupeAccessService.requireSelfJoinAllowed` exposé ; `isSeedTroupe` / `seedTroupeId` dépréciés (18.5).
- `PATCH /v1/admin/troupes/{id}` : admin plateforme uniquement ; `SecurityConfig` whitelist `/v1/admin/**`.
- `SeasonParticipantService.ensureSeasonParticipantForMembership` pour sync liste admin ; enrollment demo dans membership service (évite cycle Spring).
- `./gradlew test` vert.

### File List

- services/api/src/main/kotlin/com/hatcast/api/troupe/AdminTroupeController.kt (new)
- services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeAccessService.kt
- services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeController.kt
- services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeMembershipService.kt
- services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeService.kt
- services/api/src/main/kotlin/com/hatcast/api/troupe/dto/TroupeDtos.kt
- services/api/src/main/kotlin/com/hatcast/api/participant/SeasonParticipantMembershipSync.kt (new, review)
- services/api/src/main/kotlin/com/hatcast/api/participant/SeasonParticipantService.kt
- services/api/src/main/kotlin/com/hatcast/api/season/SeasonRepository.kt
- services/api/src/main/kotlin/com/hatcast/api/config/SecurityConfig.kt
- services/api/src/main/resources/application.yml
- services/api/openapi/seasons.yaml
- services/api/src/test/kotlin/com/hatcast/api/troupe/TroupeMembershipIntegrationTest.kt
- services/api/src/test/kotlin/com/hatcast/api/troupe/TroupeMembershipServiceTest.kt
- services/api/src/test/kotlin/com/hatcast/api/participant/SeasonParticipantServiceTest.kt
- _bmad-output/implementation-artifacts/sprint-status.yaml

### Change Log

- 2026-05-28 : Story **18.2** created via `bmad-create-story` — self-join OPEN, demo season enrollment, platform admin PATCH join policy.
- 2026-05-28 : Code review — decision B (réactivation conserve le rôle) ; patches : retrait dead code, `SeasonParticipantMembershipSync` extrait (évite cycle Spring).

---

### Review Findings

- [x] [Review][Decision] Self-join réactive un ancien `TROUPE_ADMIN` inactif sans le rétrograder — **résolu (B)** : Dev Notes prime ; la réactivation conserve le rôle existant ; AC1 à interpréter comme « création toujours MEMBER ».
- [x] [Review][Patch] Code mort `TroupeAccessService.requireSelfJoinAllowed` — retiré ; gate dans `TroupeMembershipService.requireOpenJoinPolicy` [`TroupeAccessService.kt`]
- [x] [Review][Patch] `enrollDemoSeasonParticipant` duplique `ensureSeasonParticipantForMembership` — remplacé par appel à `SeasonParticipantService` [`TroupeMembershipService.kt`]
- [x] [Review][Defer] `ensureMembershipParticipants` n'utilise pas le nouvel helper — refactor bulk sync hors scope 18.2 [`SeasonParticipantService.kt:228`] — deferred, pre-existing
- [x] [Review][Defer] Plusieurs saisons actives → `NonUniqueResultException` sur `findByTroupe_IdAndIsActiveTrue` — invariant produit via `SeasonService.activate` [`SeasonRepository.kt:40`] — deferred, pre-existing

### Validation create-story

- [x] AC métier numérotés et sourcés (epics / FR61–FR63)
- [x] Section **Material 3** remplie **ou** **UI : N/A** explicite
- [x] Tasks référencent les numéros d'AC
- [x] Liens vers fichiers code existants à réutiliser
- [x] `./gradlew test` mentionné (API)
- [x] SecurityConfig `/v1/admin/**` whitelist called out (critical miss prevention)
- [x] Demo season enrollment design specified (readiness caveat resolved)
