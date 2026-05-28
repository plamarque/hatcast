# Story 18.1: Troupe `join_policy` and `is_demo` persistence

Status: done

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

## Story

As a **developer**,  
I want **`join_policy` and `is_demo` persisted on troupes**,  
so that **the provisional `isSeedTroupe()` env hack can be replaced by explicit business rules** in Stories 18.2–18.5 (FR62, FR64 prerequisites).

## Acceptance Criteria

1. **Given** a Flyway migration applied, **when** the schema is inspected, **then** table `troupes` has columns `join_policy` (`OPEN` | `INVITE_ONLY`, default `OPEN`) and `is_demo` (`BOOLEAN`, default `false`). [Source: epics 18.1 AC1; FR62]
2. **Given** existing troupe rows before the migration, **when** backfill runs, **then** every row has `join_policy = OPEN` and `is_demo = false`. [Source: epics 18.1 AC2]
3. **Given** troupe creation via the existing API, **when** `POST /v1/troupes`, **then** the new troupe has `joinPolicy = OPEN` and `isDemo = false` in the response and in the database. [Source: epics 18.1 AC3; FR62 default OPEN]
4. **Given** troupe list or create responses, **when** exposed as `TroupeListItemDto`, **then** JSON fields `joinPolicy` and `isDemo` are present and documented in OpenAPI [`seasons.yaml`](../../services/api/openapi/seasons.yaml) (`TroupeListItem` schema + `TroupeJoinPolicy` enum). [Source: epics 18.1 AC4]
5. **Product coverage:** FR62 (join policy model), FR64 prerequisite (`is_demo` flag for prod **Démo** bootstrap in Story 18.3). **UI : N/A** — no changes under `apps/web/` in this story.

---

## Acceptance Criteria — Material 3 (UI)

**UI : N/A** — backend-only story (`services/api/`); no user-visible Angular changes. Material 3 section omitted intentionally.

---

## Tasks / Subtasks

- [x] **Scope:** `services/api/` only — Flyway DDL, JPA entity, DTO mapping, OpenAPI, integration tests

- [x] **Flyway migration `V32__troupe_join_policy_is_demo.sql`** (AC: 1, 2) — *V32* (not V30 : conflit Flyway avec `db/seed/V30__*`)
  - [x] Add `join_policy VARCHAR(16) NOT NULL DEFAULT 'OPEN'` and `is_demo BOOLEAN NOT NULL DEFAULT FALSE` to `troupes`.
  - [x] Optional but recommended: `CHECK (join_policy IN ('OPEN', 'INVITE_ONLY'))` — follow [`V14__season_and_event_participants.sql`](../../services/api/src/main/resources/db/migration/V14__season_and_event_participants.sql) pattern; verify H2 PostgreSQL mode in `./gradlew test`.
  - [x] No `UPDATE` required if defaults backfill existing rows on `ADD COLUMN … DEFAULT` (Postgres + H2); add explicit `UPDATE troupes SET …` only if your target DB needs it.
  - [x] **Do not** set `is_demo = true` on Les Improbots seed (`…000001`) — that flag is for prod **Démo** (`…000099`) in Story **18.3**.

- [x] **Kotlin domain model** (AC: 1, 3)
  - [x] Add enum `TroupeJoinPolicy { OPEN, INVITE_ONLY }` alongside [`TroupeBaselineRole.kt`](../../services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeBaselineRole.kt).
  - [x] Extend [`TroupeEntity.kt`](../../services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeEntity.kt):
    - `@Enumerated(EnumType.STRING) @Column(name = "join_policy", nullable = false, length = 16) var joinPolicy: TroupeJoinPolicy = TroupeJoinPolicy.OPEN`
    - `@Column(name = "is_demo", nullable = false) var isDemo: Boolean = false`
  - [x] [`TroupeService.create`](../../services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeService.kt): rely on entity defaults (explicit args optional but OK for clarity).

- [x] **API DTO + mapping** (AC: 3, 4)
  - [x] Add `joinPolicy: TroupeJoinPolicy` and `isDemo: Boolean` to [`TroupeListItemDto`](../../services/api/src/main/kotlin/com/hatcast/api/troupe/dto/TroupeDtos.kt).
  - [x] Map in [`TroupeMembershipService.listActiveTroupesForUser`](../../services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeMembershipService.kt) and [`TroupeService.create`](../../services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeService.kt) from `membership.troupe` / saved entity.
  - [x] Consider a small `TroupeListItemDto.from(troupe, membership, counts)` helper if it avoids duplication — only if it stays minimal.

- [x] **OpenAPI** (AC: 4)
  - [x] Extend `TroupeListItem` in [`seasons.yaml`](../../services/api/openapi/seasons.yaml): add required fields `joinPolicy`, `isDemo`; schema `TroupeJoinPolicy` enum `[OPEN, INVITE_ONLY]` with French description referencing FR62.
  - [x] Document that **`isDemo`** identifies the production onboarding sandbox (ADR-0015); dev seed Les Improbots remains `isDemo: false`.

- [x] **Integration tests** (AC: 1–4)
  - [x] Extend [`TroupeCreationIntegrationTest.kt`](../../services/api/src/test/kotlin/com/hatcast/api/troupe/TroupeCreationIntegrationTest.kt): assert `$.joinPolicy` = `OPEN`, `$.isDemo` = `false` on POST 201 and GET list.
  - [x] Extend [`TroupeMembershipIntegrationTest.kt`](../../services/api/src/test/kotlin/com/hatcast/api/troupe/TroupeMembershipIntegrationTest.kt) list/join flow: seed Les Improbots list item exposes `joinPolicy`/`isDemo` (expect `OPEN`/`false`).
  - [x] Optional repository assertion: load seed troupe by id `a0000001-0000-4000-8000-000000000001` after Flyway — columns match backfill expectations.

- [x] **Docs (minimal)**
  - [x] If [`ARCH.md`](../../ARCH.md) still describes troupes as `(id, name, slug, created_at)` only, add one line for new columns — **do not** expand SPEC scope. *(N/A — ARCH ne listait pas ce schéma.)*

---

## Dev Notes

### Why this story exists (Epic 18 foundation)

| Context | Detail |
|---------|--------|
| **Epic 18** | Prod onboarding sandbox (**Démo**, UUID `…000099`) + join policy model before V2 prod launch |
| **Today** | [`TroupeController.joinTroupe`](../../services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeController.kt) gates self-join via [`TroupeAccessService.isSeedTroupe()`](../../services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeAccessService.kt) + env `hatcast.troupe.seed-troupe-id` |
| **This story** | Persist columns only — **no behaviour change** to join flow |
| **Next** | **18.2** switches join gate to `join_policy = OPEN`; **18.3** inserts Démo row with `is_demo = true` via `db/migration` per [ADR-0015](../../docs/adr/0015-v2-demo-troupe-product-bootstrap.md) |

### Three troupes — do not conflate (product decision 2026-05-28)

| Name | UUID suffix | Env | `is_demo` after Epic 18 |
|------|-------------|-----|-------------------------|
| **Les Improbots** | `…000001` | `db/seed` dev/CI | `false` (always) |
| **Démo** | `…000099` | `db/migration` prod bootstrap (**18.3**) | `true` |
| **La Malice** | varies | V1 migration real troupe | `false` |

Story **18.0** (done) renamed dev seed labels; UUID `…000001` unchanged.

### Explicit non-goals (scope guard)

| Out of scope | Owner story |
|--------------|-------------|
| Change `POST …/memberships/me` authorization (`isSeedTroupe`) | **18.2** |
| Platform admin `PATCH` join policy | **18.2** |
| Demo troupe bootstrap SQL (`is_demo = true`, ~20 events) | **18.3** |
| Frontend `demoTroupeId` → `…000099`, badge « Démo » | **18.4** / **18.5** |
| Deprecate `hatcast.troupe.seed-troupe-id` config | **18.5** |
| Analytics filter excluding `is_demo` rows | **18.3** Dev Notes / Epic 11 |
| Set `join_policy = INVITE_ONLY` on any troupe in this story | **18.2** tests |
| Angular `TroupeListItem` TypeScript interface update | Optional; extra JSON fields are ignored at runtime until **18.4** |

### Backend implementation guardrails

| Concern | Pattern to follow |
|--------|-------------------|
| Migration number | **`V30__troupe_join_policy_is_demo.sql`** (after [`V29__event_availability_comment.sql`](../../services/api/src/main/resources/db/migration/V29__event_availability_comment.sql)) |
| Enum storage | `@Enumerated(EnumType.STRING)` like [`TroupeMembershipEntity.baselineRole`](../../services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeMembershipEntity.kt) |
| DB column naming | snake_case `join_policy`, `is_demo`; JSON camelCase `joinPolicy`, `isDemo` |
| Defaults | DB `DEFAULT 'OPEN'` / `DEFAULT FALSE` + Kotlin entity defaults — new troupes and backfill stay consistent |
| Seed INSERTs | Existing `INSERT INTO troupes (id, name, slug, created_at)` in `db/seed` **need no change** — column defaults apply |
| H2 tests | Spring `@ActiveProfiles("test")` runs Flyway migrations; confirm CHECK constraint if added |

**Suggested migration sketch:**

```sql
ALTER TABLE troupes
    ADD COLUMN join_policy VARCHAR(16) NOT NULL DEFAULT 'OPEN',
    ADD COLUMN is_demo BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE troupes
    ADD CONSTRAINT troupes_join_policy_chk CHECK (join_policy IN ('OPEN', 'INVITE_ONLY'));
```

If CHECK causes H2 friction in CI, drop CHECK and enforce via JPA enum only (same trade-off as `baseline_role` in V10).

**Response shape (additive fields on existing DTO):**

```json
{
  "id": "uuid",
  "name": "Les Improbots",
  "slug": "les-improbots",
  "joinPolicy": "OPEN",
  "isDemo": false,
  "membership": { … },
  "activeMemberCount": 12,
  "upcomingEventCount": 3
}
```

### API surface today

There is **no** `GET /v1/troupes/{id}` detail endpoint. « Liste/détail » in epics means **`TroupeListItemDto`** returned by:

- `GET /v1/troupes` (membership-scoped list)
- `POST /v1/troupes` (create response 201)

Do **not** add a new detail endpoint in this story.

### Architecture compliance

- **Stack:** Kotlin 3.4 + Spring Boot JPA; Flyway under `services/api/src/main/resources/db/migration/`.
- **Conventions:** French user-facing API errors unchanged; OpenAPI fragments in `services/api/openapi/`.
- **ADR-0015:** Demo bootstrap migration (**18.3**) must run **after** this migration so `INSERT` can set `is_demo = true` and `join_policy = 'OPEN'`.

### Testing standards

```bash
cd services/api && ./gradlew test
```

Follow session + CSRF patterns in [`TroupeMembershipIntegrationTest.kt`](../../services/api/src/test/kotlin/com/hatcast/api/troupe/TroupeMembershipIntegrationTest.kt) and [`TestAuthSupport.kt`](../../services/api/src/test/kotlin/com/hatcast/api/support/TestAuthSupport.kt).

### Previous story intelligence (18.0)

- Dev seed renamed **Les Improbots** (`les-improbots`, `@seed.improbots.test`); UUID `…000001` unchanged.
- Flyway seed filenames `*malice*` kept for checksum stability; content uses Improbots labels.
- [`V31__seed_improbots_rename_legacy_labels.sql`](../../services/api/src/main/resources/db/seed/V31__seed_improbots_rename_legacy_labels.sql) renames legacy DB labels on persistent dev DBs.
- **Do not** touch join logic or platform-admin bypass decisions from 18.0 review — self-join behaviour remains seed-gated until **18.2**.

### Dependencies

| Story | Status | Relationship |
|-------|--------|--------------|
| 2.1 / 2.11 | done | `troupes` table + `POST /v1/troupes` create flow |
| 18.0 | done | Improbots naming; no schema change |
| **18.2** | backlog | Consumes `join_policy` for self-join + admin PATCH |
| **18.3** | backlog | Sets `is_demo = true` on Démo bootstrap (blocked until this story ships) |
| ADR-0015 | accepted | Schema dependency documented |

### Git intelligence (recent)

- `a4f35be` — chore(seed): Rename dev troupe to Les Improbots (18.0); confirms seed UUID and test fixtures still use `…000001`.
- Migration series at **V29** in `db/migration`; seed at **V31** in `db/seed` (separate Flyway location).

### DOMAIN alignment

[`DOMAIN.md`](../../DOMAIN.md) § Demo direct join already references **`join_policy = OPEN`** (updated for Epic 18). This story makes that rule persistable; DOMAIN text needs no change unless ARCH still lists old column set.

---

## Dev Agent Record

### Agent Model Used

Composer (dev-story 18.1)

### Completion Notes List

- Migration **V32** (pas V30) : conflit Flyway avec `db/seed/V30__seed_context_switcher_dev.sql` quand les deux locations sont fusionnées (profil test/dev).
- DDL scindée en deux `ALTER TABLE … ADD COLUMN` (H2 ne supporte pas l’ajout multi-colonnes en une seule instruction).
- CHECK `troupes_join_policy_chk` validé sous H2 mode PostgreSQL.
- Comportement join inchangé (`isSeedTroupe` toujours actif — story 18.2).
- `./gradlew test` : suite complète verte.

### File List

- `services/api/src/main/resources/db/migration/V32__troupe_join_policy_is_demo.sql` (new)
- `services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeJoinPolicy.kt` (new)
- `services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeEntity.kt`
- `services/api/src/main/kotlin/com/hatcast/api/troupe/dto/TroupeDtos.kt`
- `services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeService.kt`
- `services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeMembershipService.kt`
- `services/api/openapi/seasons.yaml`
- `services/api/src/test/kotlin/com/hatcast/api/troupe/TroupeCreationIntegrationTest.kt`
- `services/api/src/test/kotlin/com/hatcast/api/troupe/TroupeMembershipIntegrationTest.kt`

### Change Log

- 2026-05-28 : Story **18.1** created via `bmad-create-story` — join_policy + is_demo persistence (Epic 18 foundation).
- 2026-05-28 : Story **18.1** implemented — V32 migration, enum/DTO/OpenAPI, tests ; status → review.
- 2026-05-28 : Code review — tests durcis (reload DB post-POST, assertions unitaires) ; status → done.

### Review Findings

- [x] [Review][Patch] POST create — assertion repository après création [`TroupeCreationIntegrationTest.kt:72`] — fixed
- [x] [Review][Patch] Unit test `listActiveTroupesForUser` — assert `joinPolicy`/`isDemo` [`TroupeMembershipServiceTest.kt:128`] — fixed
- [x] [Review][Defer] Drift enum `TroupeJoinPolicy` ↔ CHECK SQL — deferred, pattern établi (`baseline_role`)

---

### Validation create-story

- [x] AC métier numérotés et sourcés (epics / FR62 / FR64)
- [x] Section **Material 3** remplie **ou** **UI : N/A** explicite
- [x] Tasks référencent les numéros d’AC
- [x] Liens vers fichiers code existants à réutiliser
- [x] `./gradlew test` mentionné (API)
