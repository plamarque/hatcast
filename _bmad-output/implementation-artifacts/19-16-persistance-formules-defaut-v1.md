---
feature_branch: feat/19-16-persistance-formules-defaut-v1
baseline_commit: e6eebeb81219bb341182e51788fcc880c41818c9
---

# Story 19.16 : Draw formula persistence + system V1 default seed

Status: done

<!-- Ultimate context engine analysis completed — comprehensive developer guide created -->

## Story

As a **developer**,  
I want to **persist draw formulas and policies** with a **seeded system V1 formula per troupe**,  
so that the **troupe catalogue and implicit default resolution** are materialized for Wave D APIs (**19.17–19.18**).

## Acceptance Criteria

### Flyway schema (AC 1 — epics 19.16)

1. **Given** a new Flyway migration (next version after **V63** — **V64** is PostgreSQL-only), **when** applied on PostgreSQL and H2 test profile, **then** it creates:
   - **`draw_formulas`** — troupe-scoped catalogue rows with at minimum: `id` (UUID PK), `troupe_id` (FK → `troupes`, `ON DELETE CASCADE`), `name`, `description` (nullable), `status` (`DRAFT` \| `PUBLISHED` \| `ARCHIVED`), `factor_config` (JSON), `version` (INT, default 1), `is_system` (BOOLEAN, default false), `created_at`, `updated_at`.
   - **`draw_policies`** — policy rows with at minimum: `id` (UUID PK), `troupe_id` (FK), `season_id` (nullable FK → `seasons`, `ON DELETE CASCADE`), `scope` (`TROUPE` \| `SEASON`), `default_rule` (JSON), `category_rules` (JSON array), `updated_at`.
   - **Uniqueness:** at most one `TROUPE`-scoped policy per `troupe_id`; at most one `SEASON`-scoped policy per `season_id`.
   - **Indexes:** `draw_formulas (troupe_id, status)`; `draw_policies (troupe_id)`; `draw_policies (season_id)` where not null.
   - **JSON portability:** use Flyway placeholders for JSON column type/default (pattern: [`V50__user_notification_preferences.sql`](../../services/api/src/main/resources/db/migration/V50__user_notification_preferences.sql) + [`application-test.yml`](../../services/api/src/test/resources/application-test.yml) placeholders).
   [Source: epics 19.16 AC1 ; [`draw-formulas-policies-spec.md`](../../docs/v2/technical/draw-formulas-policies-spec.md) § Persistence expectations]

2. **Given** the migration runs on a database with existing troupes, **when** complete, **then** each troupe has exactly **one** system formula row (`is_system = true`, `status = PUBLISHED`) with deterministic id and idempotent insert (`WHERE NOT EXISTS` / upsert-safe). Re-running migration must not duplicate system rows.
   [Source: spec § System V1 formula ; review defer « Identité UUID stable » → **19.16** seed contract]

3. **Given** the system V1 seed row, **when** `factor_config` is read, **then** it equals the normative DEFAULT recipe (order matters):

   ```json
   [
     { "factorId": "equity_tag", "enabled": true },
     { "factorId": "past_participation", "enabled": true }
   ]
   ```

   and assembling it via the new pipeline builder produces a pipeline **equivalent** to [`DrawWeightPipelines.DEFAULT`](../../services/api/src/main/kotlin/com/hatcast/api/availability/draw/DrawWeightPipeline.kt) (REF-F01 / golden **19.2** must stay green).
   [Source: [`19-16-persistence-test-design.md`](../test-artifacts/19-16-persistence-test-design.md) ; [`pipelines.json`](../../services/api/src/test/resources/draw/golden/formulas/pipelines.json) REF-F01]

### System V1 identity contract (AC 1 extension — PO decision from 19.15 review)

4. **Given** any troupe **T**, **when** resolving the system formula id, **then** use a **deterministic UUID** derived from troupe id (recommended: `UUID.nameUUIDFromBytes("hatcast:draw:system-v1:" + troupeId.toString())` or equivalent documented constant helper `DrawFormulaIds.systemV1(troupeId)`). Fixture alias `"system-v1"` in golden JSON maps to this id in tests.
   [Source: [`resolution.json`](../../services/api/src/test/resources/draw/golden/policies/resolution.json) REF-R02/R10 ; 19.15 review defer]

5. **Given** a new troupe created after migration (**19.16**), **when** the troupe is persisted, **then** the system V1 formula row is created (hook in troupe creation path **or** lazy ensure-on-first-read — choose one, document in Dev Notes; must not leave any troupe without system formula).
   [Source: spec § Active catalogue invariant ; R-WD-09]

### Policy shape & domain validation (AC 2 — epics 19.16)

6. **Given** a `DrawPolicy` domain object or entity about to be saved (repository-level validation — **no HTTP in this story**), **when** `category_rules[]` is validated, **then**:
   - each `category` is a slug present in `troupe_categories` for that troupe, or `null`;
   - referenced formula ids exist in `draw_formulas` for the **same** `troupe_id`;
   - duplicate `category` values in `category_rules[]` are **rejected**.
   [Source: epics 19.16 AC2 ; spec § Validation matrix REF-V05/V06 — enforcement at save deferred to **19.18** API, but domain validator should exist for reuse]

7. **Given** validation is implemented at domain layer, **when** unit-tested, **then** at least one test covers foreign troupe formula reference rejection and unknown category slug rejection (no MockMvc required).
   [Source: AC 2 ; prepares **19.18**]

### Implicit default resolution (AC 3 — epics 19.16, aligned with OQ-19-02)

8. **Given** troupe **T** with **no** explicit `draw_policies` row (troupe or season scope), **when** `DrawPolicyResolutionService.resolveImplicitDefault(troupeId)` (or equivalent) is called, **then** result matches spec § Implicit troupe default:
   - `resolvedMode = CHOICE`
   - `allowedFormulaIds =` all **`PUBLISHED`** non-system catalogue ids for **T** **plus** system V1 id for **T** (system V1 **always** included — PO decision **1A**, no dedup even if a published clone exists)
   - `categoryRules = []` / `policySource = IMPLICIT`
   [Source: REF-R10 ; [`draw-formulas-policies-spec.md`](../../docs/v2/technical/draw-formulas-policies-spec.md) § Implicit troupe default]

9. **Given** troupe **T** with **zero** `PUBLISHED` non-system formulas (only system V1), **when** implicit default is resolved, **then** `allowedFormulaIds = [systemV1Id(T)]`, `selectorVisible = false`, `effectiveFormulaId = systemV1Id(T)`.
   [Source: REF-R02 ; test design § REF-R02]

10. **Given** troupe **T** with exactly **one** `PUBLISHED` non-system formula **F1**, **when** implicit default is resolved, **then** `allowedFormulaIds = [F1, systemV1Id(T)]` (REF-R03 — implement test now; full golden runner stays `@Disabled` until **19.18**).
    [Source: [`resolution.json`](../../services/api/src/test/resources/draw/golden/policies/resolution.json) REF-R03]

**Epics AC3 nuance:** epics text « formule système V1 seule » is **superseded** by locked **OQ-19-02** (implicit **CHOICE** + published + system V1). Implement spec/19.15, not outdated epics wording.

### Factor config persistence helpers (AC 1 extension — 19.15 defer)

11. **Given** `factorConfig` JSON persisted on a formula, **when** parsed for pipeline assembly, **then**:
    - unknown `factorId` → reject at parse/validate time;
    - `equity_tag` must be present and `enabled: true`;
    - `immediate_replay` with `enabled: true` and missing `params.mode` defaults to **`EXCLUDE`** (19.15 review defer);
    - disabled factors are skipped in pipeline assembly.
    [Source: spec § Factor catalogue ; [`ImmediateReplayFactor.kt`](../../services/api/src/main/kotlin/com/hatcast/api/availability/draw/ImmediateReplayFactor.kt)]

12. **Given** this story completes, **when** production draw runs, **then** **`CompositionDrawService` still uses `DrawWeightPipelines.DEFAULT`** — no runtime wiring to persisted formulas until **19.18**. Catalogue persistence must not change draw behaviour yet.
    [Source: ADR 0019 §3 ; spec § Effective formula & calculator invariant]

### Tests & quality (NFR-Q1)

13. **Given** CI runs `./gradlew test`, **when** this story is merged, **then** new tests pass and existing golden suites (**19.2**, **19.3**, factor goldens) remain green:
    - **`DrawFormulaMigrationTest`** — Flyway smoke: tables exist post-migration; system seed idempotent (pattern: [`UserMemberPreferencesMigrationTest.kt`](../../services/api/src/test/kotlin/com/hatcast/api/user/UserMemberPreferencesMigrationTest.kt)).
    - **`DrawPolicyResolutionServiceTest`** (or repository integration) — REF-R02, REF-R10, REF-R03 assertions.
    - Optional: **`DrawFormulaPipelineAssemblerTest`** — REF-F01 factorConfig → pipeline equals DEFAULT.
    [Source: [`19-16-persistence-test-design.md`](../test-artifacts/19-16-persistence-test-design.md)]

14. **Couverture :** NFR-Q1, NFR-S2 (troupe isolation at DB layer). **Priorité :** P2 Wave D S2. **Depends :** **19.15** (done), **19.6**, **17.7**. **UI : N/A**.

---

## Acceptance Criteria — Material 3 (UI)

**UI : N/A** — no changes under `apps/web/` ; Material 3 section omitted intentionally.

---

## Tasks / Subtasks

**Scope:** `services/api/` only — Flyway, JPA entities, repositories, domain services, unit/integration tests. **No** HTTP controllers, **no** OpenAPI, **no** Angular, **no** runtime draw wiring.

### 0. Branch & baseline (mandatory)

- [x] Confirm branch `feat/19-16-persistance-formules-defaut-v1` from `origin/v2` ; baseline `e6eebeb81219bb341182e51788fcc880c41818c9`.

### 1. Flyway migration (AC 1–2, 4)

- [x] **Create** `V64__draw_formulas_and_policies.sql` + `V65__draw_formulas_system_seed` (Kotlin Java migration) with tables, constraints, indexes, JSON placeholders.
- [x] **Backfill** system V1 formula for every existing `troupes.id` (idempotent).
- [x] **Add** Flyway placeholders to `application.yml` / `application-test.yml` / `application-e2e.yml` / `application-offline.yml`.
- [x] **Gate:** `DrawFormulaMigrationTest` — tables + one system row per troupe + idempotent re-run (AC 1–2, 13).

### 2. JPA domain model (AC 1, 6)

- [x] **Create** package `com.hatcast.api.draw` with:
  - [x] `DrawFormulaEntity`, `DrawFormulaRepository`
  - [x] `DrawPolicyEntity`, `DrawPolicyRepository`
  - [x] Enums: `DrawFormulaStatus`, `DrawPolicyScope`
  - [x] JSON mapping for `factor_config`, `default_rule`, `category_rules` (`@JdbcTypeCode(SqlTypes.JSON)`)
- [x] **Create** `DrawFormulaIds.systemV1(troupeId: UUID)` helper (AC 4).

### 3. System formula lifecycle (AC 4–5)

- [x] **Implement** `DrawFormulaSeedService.ensureSystemFormula(troupeId)` — insert-if-absent with canonical `factor_config`.
- [x] **Wire** troupe creation path (`TroupeService.create`) + lazy ensure in `DrawPolicyResolutionService.resolveImplicitDefault`.
- [x] **Guard:** system formulas cannot be deleted/archived via `DrawFormulaSeedService.deleteFormula` / `archiveFormula`.

### 4. Factor config → pipeline assembly (AC 3, 11)

- [x] **Create** `DrawFactorConfig` value types + `DrawFormulaPipelineAssembler.assemble(factorConfig): DrawWeightPipeline`.
- [x] **Create** `DrawFormulaValidator` — equity_tag rules, unknown factorId, immediate_replay default mode (AC 11).
- [x] **Test** REF-F01 equivalence with DEFAULT (AC 3, 13).

### 5. Policy validation (AC 6–7)

- [x] **Create** `DrawPolicyValidator` — category slug ∈ troupe glossary, formula ids ∈ troupe catalogue, no duplicate categories (AC 6).
- [x] **Unit tests** for reject paths (AC 7).

### 6. Implicit default resolution (AC 8–10)

- [x] **Create** `DrawPolicyResolutionService` with `resolveImplicitDefault(troupeId)` returning `ResolvedDrawRule`.
- [x] **Tests** REF-R02, REF-R03, REF-R10 (AC 8–10, 13). `DrawPolicyResolutionGoldenTest` stays `@Disabled`.

### 7. Regression guard (AC 12–13)

- [x] **Verify** no changes to `CompositionDrawService`, `AvailabilityChanceCalculator` DEFAULT path.
- [x] **Run** `./gradlew test` — full API suite (1016 tests) + targeted gates green.

### 8. Documentation touch (minimal)

- [x] **Update** `draw-formulas-policies-spec.md` § Persistence expectations with actual table/column names + system V1 id contract.
- [x] **Optional:** ADR 0019 — waived (table names match spec illustrative names).

---

## Dev Notes

### Product and UX rules

- **Wave D S2 goal:** materialize catalogue + implicit default so **19.17** (CRUD API) and **19.18** (policy API + runtime) can build on stable persistence.
- **System V1 always in choice lists (1A):** even when troupe publishes « V1 standard » with identical factors, implicit default includes **both** — no deduplication.
- **French admin labels (downstream 19.19):** system formula name suggestion: « V1 standard (système) » — not required in migration but recommended for demo troupes.

### Architecture compliance

| Topic | Rule |
|-------|------|
| Stack | Kotlin + Spring Boot + JPA + Flyway ; PostgreSQL prod, H2 `MODE=PostgreSQL` tests |
| Package | New `com.hatcast.api.draw.*` — keep draw weight math in existing `availability.draw` package |
| Troupe isolation | All queries filter by `troupe_id` ; FK constraints enforce referential integrity |
| DEFAULT unchanged | **19.18** wires runtime ; this story must not alter draw outcomes in production |
| Golden **19.2** | REF-F01 assembly must match DEFAULT ; do not edit `draw/golden/weights.json` |
| Test scaffolding | Existing `@Disabled` classes stay disabled except new tests you add in this story |
| JSON columns | Reuse placeholder pattern from V50 for H2 `JSON` vs PostgreSQL `JSONB` |

### Suggested schema (informative — adjust to fit conventions)

```sql
-- draw_formulas
CREATE TABLE draw_formulas (
    id UUID PRIMARY KEY,
    troupe_id UUID NOT NULL REFERENCES troupes(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(16) NOT NULL,
    factor_config ${draw_factor_config_json_type} NOT NULL,
    version INT NOT NULL DEFAULT 1,
    is_system BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

-- draw_policies
CREATE TABLE draw_policies (
    id UUID PRIMARY KEY,
    troupe_id UUID NOT NULL REFERENCES troupes(id) ON DELETE CASCADE,
    season_id UUID REFERENCES seasons(id) ON DELETE CASCADE,
    scope VARCHAR(16) NOT NULL,
    default_rule ${draw_policy_rule_json_type} NOT NULL,
    category_rules ${draw_policy_rules_json_type} NOT NULL DEFAULT ${draw_policy_rules_json_default},
    updated_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT draw_policies_troupe_unique UNIQUE (troupe_id) WHERE scope = 'TROUPE', -- use partial index pattern if needed
    ...
);
```

**Note:** PostgreSQL partial unique indexes may need separate migration statements; H2 compatibility — follow existing repo patterns (check V25 equity tags, V39 snapshots).

### File structure requirements

| File / area | Action |
|-------------|--------|
| `db/migration/V65__draw_formulas_and_policies.sql` | **CREATE** |
| `com/hatcast/api/draw/*` | **CREATE** entities, repos, services |
| `com/hatcast/api/troupe/TroupeService.kt` | **UPDATE** (optional) — ensure system formula on troupe create |
| `application.yml` / `application-test.yml` | **UPDATE** — JSON placeholders if needed |
| `docs/v2/technical/draw-formulas-policies-spec.md` | **UPDATE** — actual persistence names + id contract |
| `CompositionDrawService.kt` | **DO NOT** wire persisted formulas |
| `DrawFormulaPipelineGoldenTest.kt` | **DO NOT** enable (`@Disabled` until **19.17**) |
| `DrawPolicyResolutionGoldenTest.kt` | **DO NOT** enable (`@Disabled` until **19.18**) |

### Explicit non-goals

- HTTP REST endpoints (`/v1/troupes/{id}/draw-formulas`, draw-policy PUT/GET) → **19.17**, **19.18**
- Full policy resolution (season override, category rules, MANDATORY, fallback cascade) → **19.18** (`DrawPolicyResolutionGoldenTest`)
- Formula CRUD validation HTTP (REF-V01–V04) → **19.17**
- UI admin editor → **19.19**, **19.20**
- Snapshot metadata on draw → **19.22**
- Changing `DrawWeightPipelines.DEFAULT` or disabling golden tests
- Shipping factors **19.11–19.14**

### Dependencies

| Story | Status | Relationship |
|-------|--------|--------------|
| **19.15** | done | Normative spec + ADR — **blocks this story** |
| **19.6** | done | Past participation factor in system V1 |
| **17.7** | done | Category slugs for policy validation |
| **19.17** | backlog | **Blocked by this story** — CRUD API |
| **19.18** | backlog | **Blocked by 19.17** — policy API + runtime wiring |
| **19.2** | done | Golden regression must stay green |

### Previous story intelligence (19.15)

- **Normative authority:** [`draw-formulas-policies-spec.md`](../../docs/v2/technical/draw-formulas-policies-spec.md) overrides epics where they diverge (AC3 implicit default, season policy editor = TROUPE_ADMIN only).
- **Review decisions to implement:** system V1 always in allowed set (**1A**); season policy **replaces** troupe policy entirely (**3A**); runtime fallback on archived formula — implement in **19.18**, not here.
- **Deferred to this story:** stable system V1 UUID contract; `immediate_replay.params.mode` default **EXCLUDE**.
- **Docs-only pattern:** 19.15 touched no Kotlin — this story is the first Wave D code; keep scope tight (persistence + implicit resolution only).

### Git intelligence

Recent commits on `origin/v2`:

- `e6eebeb` — merge **19.15** (normative spec)
- `d09cb95` — Wave D test scaffolding (`DrawFormula*Test`, golden JSON, `@Disabled`)
- `cd07ffd` — draw-formulas-policies-spec.md

Pattern: implement persistence first; reuse scaffolded test IDs (REF-R02, REF-R10) in new service tests rather than enabling full golden runners early.

### Testing requirements

| Test class | Purpose | AC |
|------------|---------|-----|
| `DrawFormulaMigrationTest` | Flyway + idempotent system seed | 1–2, 13 |
| `DrawFormulaPipelineAssemblerTest` | REF-F01 = DEFAULT | 3, 11, 13 |
| `DrawPolicyResolutionServiceTest` | REF-R02, REF-R03, REF-R10 | 8–10, 13 |
| `DrawPolicyValidatorTest` | Category/formula foreign refs | 6–7 |
| Existing `DrawGoldenTest` | Regression | 12–13 |

**CI gate (story):**

```bash
./gradlew -q test --tests '*DrawFormula*'
./gradlew -q test --tests '*DrawPolicyResolution*'
./gradlew -q test --tests 'com.hatcast.api.availability.DrawGoldenTest'
```

Full `./gradlew test` before merge.

### factorId registry (MVP — use exact strings)

| factorId | Kotlin constant | Notes |
|----------|-----------------|-------|
| `equity_tag` | `CategoryCompartmentFactor.FACTOR_ID` | Always enabled |
| `past_participation` | `PastParticipationFactor.FACTOR_ID` | System V1 |
| `immediate_replay` | `ImmediateReplayFactor.FACTOR_ID` | Default mode EXCLUDE if param absent |
| `role_request` | `RoleRequestFactor.FACTOR_ID` | Optional catalogue toggle |

---

## Dev Agent Record

### Agent Model Used

Composer (dev-story workflow)

### Completion Notes List

- Flyway **V64** (DDL) + **V65** (Kotlin idempotent system V1 seed per troupe). Policy uniqueness via portable `troupe_scope_key` / `season_scope_key` columns (H2-compatible vs partial indexes).
- Package `com.hatcast.api.draw.*`: entities, repos, `DrawFormulaIds`, seed service, pipeline assembler/validator, policy validator, implicit resolution service.
- System V1 lifecycle: seed on troupe create (`TroupeService`) + lazy ensure in `resolveImplicitDefault`; delete/archive guarded for `is_system`.
- Tests: `DrawFormulaMigrationTest`, `DrawFormulaPipelineAssemblerTest` (REF-F01), `DrawPolicyResolutionServiceTest` (REF-R02/R03/R10), `DrawPolicyValidatorTest`. Full `./gradlew test` green (1016 tests). `CompositionDrawService` / DEFAULT path untouched.
- Spec § Persistence expectations updated with actual schema + UUID contract.

### File List

- `services/api/src/main/resources/db/migration/V64__draw_formulas_and_policies.sql` (added)
- `services/api/src/main/kotlin/db/migration/V65__draw_formulas_system_seed.kt` (added)
- `services/api/src/main/kotlin/com/hatcast/api/draw/DrawFormulaIds.kt` (added)
- `services/api/src/main/kotlin/com/hatcast/api/draw/DrawModels.kt` (added)
- `services/api/src/main/kotlin/com/hatcast/api/draw/DrawFormulaSeedConstants.kt` (added)
- `services/api/src/main/kotlin/com/hatcast/api/draw/DrawFormulaEntity.kt` (added)
- `services/api/src/main/kotlin/com/hatcast/api/draw/DrawPolicyEntity.kt` (added)
- `services/api/src/main/kotlin/com/hatcast/api/draw/DrawFormulaRepository.kt` (added)
- `services/api/src/main/kotlin/com/hatcast/api/draw/DrawPolicyRepository.kt` (added)
- `services/api/src/main/kotlin/com/hatcast/api/draw/DrawFormulaPipelineAssembler.kt` (added)
- `services/api/src/main/kotlin/com/hatcast/api/draw/DrawPolicyValidator.kt` (added)
- `services/api/src/main/kotlin/com/hatcast/api/draw/DrawFormulaSeedService.kt` (added)
- `services/api/src/main/kotlin/com/hatcast/api/draw/DrawPolicyResolutionService.kt` (added)
- `services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeService.kt` (modified)
- `services/api/src/main/resources/application.yml` (modified)
- `services/api/src/test/resources/application-test.yml` (modified)
- `services/api/src/main/resources/application-e2e.yml` (modified)
- `services/api/src/main/resources/application-offline.yml` (modified)
- `services/api/src/test/kotlin/com/hatcast/api/draw/DrawFormulaMigrationTest.kt` (added)
- `services/api/src/test/kotlin/com/hatcast/api/draw/DrawFormulaPipelineAssemblerTest.kt` (added)
- `services/api/src/test/kotlin/com/hatcast/api/draw/DrawPolicyResolutionServiceTest.kt` (added)
- `services/api/src/test/kotlin/com/hatcast/api/draw/DrawPolicyValidatorTest.kt` (added)
- `services/api/src/test/kotlin/com/hatcast/api/user/UserMemberPreferencesMigrationTest.kt` (modified — draw Flyway placeholders)
- `docs/v2/technical/draw-formulas-policies-spec.md` (modified)

### Change Log

- 2026-06-15 : Story **19.16** created via `bmad-create-story` — Wave D persistence + system V1 seed gate.
- 2026-06-15 : Story **19.16** implemented — Flyway V64/V65, draw domain package, implicit default resolution, tests green.
- 2026-06-15 : Code review — 6 patches applied (readOnly tx, system_troupe_key unique, season index placeholder, V65 canonical guard, validator hardening, ORDER BY name).

---

### Validation create-story

- [x] AC métier numérotés et sourcés (epics / spec / REF-*)
- [x] Section **Material 3** = **UI : N/A**
- [x] Tasks référencent les numéros d'AC
- [x] Liens vers fichiers code existants (pipeline, migration patterns, test design)
- [x] `./gradlew test` mentionné avec gates ciblés

### Review Findings

- [x] [Review][Patch] `@Transactional(readOnly=true)` sur `resolveImplicitDefault` bloque l'INSERT lazy de `ensureSystemFormula` en prod [DrawPolicyResolutionService.kt:12]
- [x] [Review][Patch] Aucune contrainte DB « une formule système par troupe » — race TOCTOU dans `ensureSystemFormula` [V64__draw_formulas_and_policies.sql, DrawFormulaSeedService.kt:18-26]
- [x] [Review][Patch] Index `draw_policies_season_idx` sans `WHERE season_id IS NOT NULL` (AC1) [V64__draw_formulas_and_policies.sql:32]
- [x] [Review][Patch] Guard idempotent V65 vérifie `is_system=TRUE` au lieu de l'UUID canonique [V65__draw_formulas_system_seed.kt:33-36]
- [x] [Review][Patch] `DrawFormulaValidator` n'interdit pas les `factorId` dupliqués ; `equity_tag` utilise `firstOrNull` au lieu de `any { enabled }` [DrawFormulaPipelineAssembler.kt:23-31]
- [x] [Review][Patch] `REF-R10` assert un ordre de formules non garanti (`findByTroupeIdAndStatus` sans `ORDER BY`) [DrawPolicyResolutionServiceTest.kt:87-90]
- [x] [Review][Defer] `DrawPolicyValidator` n'exige pas `status=PUBLISHED` sur les formules référencées [DrawPolicyValidator.kt:82] — deferred, enforcement runtime en 19.18
- [x] [Review][Defer] `troupeScopeKey`/`seasonScopeKey` non imposés à la persistance (pas de factory/service policy save) [DrawPolicyEntity.kt:27-31] — deferred, story 19.18
- [x] [Review][Defer] V65 prépare un statement par troupe (N round-trips) [V65__draw_formulas_system_seed.kt:20-47] — deferred, volume troupes MVP acceptable
- [x] [Review][Defer] `draw_policies` sans `created_at` (audit historique) [V64__draw_formulas_and_policies.sql] — deferred, hors AC1 explicite
