---
feature_branch: feat/19-17-api-crud-formules-tirage
baseline_commit: 3ed9b7a8f233ec16c76eb03be8af167d630632f6
---

# Story 19.17 : Admin API — CRUD draw formulas (troupe catalogue)

Status: done

<!-- Ultimate context engine analysis completed — comprehensive developer guide created -->

## Story

As a **troupe admin**,  
I want to **create, edit, and archive draw formulas** in my troupe catalogue,  
so that I can **offer draw recipes** to seasons and organizers (Wave D Demo 1 gate for **19.19**).

## Acceptance Criteria

### HTTP surface & authorization (AC 1 — epics 19.17)

1. **Given** a user with **`TROUPE_ADMIN`** on troupe **T** (or platform admin), **when** calling catalogue endpoints under `/v1/troupes/{troupeId}/draw-formulas`, **then** CRUD succeeds with troupe-scoped data and validation of `factorConfig`.
   [Source: epics 19.17 AC1 ; spec § Authorization]

2. **Given** a member **without** troupe admin role, **when** any mutating call or admin catalogue read on `/v1/troupes/{troupeId}/draw-formulas`, **then** **403 Forbidden** (French message consistent with [`TroupeAccessService`](../../services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeAccessService.kt)).
   [Source: epics 19.17 AC1 ; NFR-S2]

3. **Given** path `troupeId` ≠ owning troupe of `{formulaId}`, **when** GET/PATCH/DELETE on `/v1/troupes/{troupeId}/draw-formulas/{formulaId}`, **then** **404** (do not leak cross-troupe ids).
   [Source: NFR-S2 troupe isolation]

4. **Given** the normative endpoints (implement all):

   | Method | Path | Purpose |
   |--------|------|---------|
   | `GET` | `/v1/troupes/{troupeId}/draw-formulas` | List catalogue (all statuses, incl. system row) |
   | `GET` | `/v1/troupes/{troupeId}/draw-formulas/{formulaId}` | Single formula (admin editor **19.19**) |
   | `POST` | `/v1/troupes/{troupeId}/draw-formulas` | Create user formula (default `DRAFT`) |
   | `PATCH` | `/v1/troupes/{troupeId}/draw-formulas/{formulaId}` | Update name, description, `factorConfig`, `status` |
   | `DELETE` | `/v1/troupes/{troupeId}/draw-formulas/{formulaId}` | **Soft archive** — see AC 5 |

   Document in new OpenAPI fragment [`services/api/openapi/draw-formulas.yaml`](../../services/api/openapi/draw-formulas.yaml) (pattern: [`categories.yaml`](../../services/api/openapi/categories.yaml)).
   [Source: epics 19.17 ; test design 19-17]

### Delete / archive & policy references (AC 2 — epics 19.17)

5. **Given** formula **F** referenced by any **`draw_policies`** row for the same troupe (`defaultRule` or `categoryRules[]` — UUID string match), **when** `DELETE …/draw-formulas/{id}`, **then** **409 Conflict** with actionable French body (e.g. « Formule utilisée par une politique de tirage »). **No** physical delete in MVP.
   [Source: epics 19.17 AC2 ; test design § DELETE/archivage]

6. **Given** formula **F** is **not** policy-referenced and **not** `isSystem`, **when** `DELETE`, **then** set `status = ARCHIVED`, bump `updatedAt`, return **200** (or **204**) — reuse [`DrawFormulaSeedService.archiveFormula`](../../services/api/src/main/kotlin/com/hatcast/api/draw/DrawFormulaSeedService.kt) logic moved/extended into service layer.
   [Source: spec § Status rules ; soft-only delete PO choice for Wave D]

7. **Given** system V1 formula (`isSystem = true`), **when** `PATCH` (except read-only GET) or `DELETE`, **then** **403** or **409** — must not mutate/delete system row (guards already in seed service).
   [Source: 19.16 review ; `DrawFormulaSeedServiceTest`]

8. **Given** `PATCH` sets `status = PUBLISHED`, **when** validation fails (AC 9), **then** **400** and entity unchanged.

### Preview endpoint (AC 3 — epics 19.17, OQ-19-03)

9. **Given** optional `POST /v1/troupes/{troupeId}/draw-formulas/{formulaId}/preview`, **when** body supplies event/candidate fixture, **then** return computed weights/`%` without persisting a draw. **Waivable for Demo 1** — if omitted, note in Dev Agent Record and OpenAPI « deferred » ; **19.19** UI can ship without preview.
   [Source: epics 19.17 AC3 ; OQ-19-03 ; test design OUT scope]

### Validation matrix HTTP (AC 4 — REF-V01..V04)

10. **Given** formula save (`POST` or `PATCH` with `status` `DRAFT` or unchanged draft), **when** payload violates rules below, **then** **400** with French error:

    | Ref | Rule |
    |-----|------|
    | **REF-V01** | Unknown `factorId` (not in MVP implemented set **nor** reserved catalogue — see Dev Notes) |
    | **REF-V02** | `equity_tag` missing or `enabled: false` |
    | **REF-V02b** | Publish path: `equity_tag` disabled → 400 |

    [Source: [`validation.json`](../../services/api/src/test/resources/draw/golden/policies/validation.json) ; spec § Validation matrix]

11. **Given** publish (`POST` with `status: PUBLISHED` or `PATCH` transitioning to `PUBLISHED`), **when**:

    | Ref | Rule |
    |-----|------|
    | **REF-V03** | `factorConfig` empty → 400 |
    | **REF-V03b** | All entries `enabled: false` → 400 |
    | **REF-V04** | Enabled factor **not implemented** (e.g. `gender_parity` enabled) → 400 |
    | **REF-V04b** | Draft save with reserved factor **disabled** (e.g. `gender_parity: false`) → **201** allowed |

    [Source: validation.json ; spec § Policy ≠ factor / reserved factors]

12. **Given** validation passes on save, **when** persisted, **then** increment `version` on each mutation; set `updatedAt`; never change `troupeId` or `isSystem`.
    [Source: spec § DrawFormula fields]

### Pipeline golden & regression (AC 5 — REF-F01..F08)

13. **Given** `factorConfig` on saved formulas, **when** [`DrawFormulaPipelineGoldenTest`](../../services/api/src/test/kotlin/com/hatcast/api/availability/DrawFormulaPipelineGoldenTest.kt) runs, **then** remove `@Disabled` and implement loader for [`pipelines.json`](../../services/api/src/test/resources/draw/golden/formulas/pipelines.json) — **REF-F01..F08** green via [`DrawFormulaPipelineAssembler`](../../services/api/src/main/kotlin/com/hatcast/api/draw/DrawFormulaPipelineAssembler.kt).
    [Source: test design 19-17 ; 19.16 REF-F01 already covered in unit test]

14. **Given** [`DrawFormulaValidationIntegrationTest`](../../services/api/src/test/kotlin/com/hatcast/api/availability/DrawFormulaValidationIntegrationTest.kt), **when** enabled, **then** parameterized MockMvc tests drive **REF-V01..V04b** from `validation.json` (`function: formulaSave | formulaPublish`).
    [Source: test design 19-17]

15. **Given** this story completes, **when** production draw runs, **then** **`CompositionDrawService` still uses `DrawWeightPipelines.DEFAULT`** — no runtime wiring to persisted formulas until **19.18**.
    [Source: 19.16 AC12 ; spec § Effective formula invariant]

16. **Couverture :** NFR-S2, NFR-Q1. **Priorité :** P2 Wave D **S3**. **Depends :** **19.16** (done). **UI : N/A**.

---

## Acceptance Criteria — Material 3 (UI)

**UI : N/A** — no changes under `apps/web/` ; Material 3 section omitted intentionally.

---

## Tasks / Subtasks

**Scope:** `services/api/` only — REST controller, service, DTOs, OpenAPI fragment, validation hardening, integration tests. **No** Angular, **no** draw runtime wiring, **no** policy PUT/GET (**19.18**).

### 0. Branch & baseline (mandatory)

- [x] Confirm branch `feat/19-17-api-crud-formules-tirage` from `origin/v2` ; baseline `3ed9b7a8f233ec16c76eb03be8af167d630632f6`.

### 1. DTOs & OpenAPI (AC 1, 4, 12)

- [x] **Create** `com.hatcast.api.draw.dto.*` — `DrawFormulaDto`, `CreateDrawFormulaRequest`, `UpdateDrawFormulaRequest` (camelCase JSON, mirror entity fields + `isSystem` read-only on responses).
- [x] **Create** [`openapi/draw-formulas.yaml`](../../services/api/openapi/draw-formulas.yaml) — paths, schemas, 400/403/404/409 ; document DELETE = soft archive + 409 when policy-bound.
- [x] **Gate:** manual OpenAPI review aligned with implemented controller.

### 2. Validator extension — reserved factors (AC 10–11)

- [x] **Extend** [`DrawFormulaValidator`](../../services/api/src/main/kotlin/com/hatcast/api/draw/DrawFormulaPipelineAssembler.kt):
  - `IMPLEMENTED_FACTOR_IDS` — existing MVP four (`equity_tag`, `past_participation`, `immediate_replay`, `role_request`)
  - `RESERVED_FACTOR_IDS` — `gender_parity`, `volunteer_bonus`, `class_mix`, `prestige` (spec § Factor catalogue)
  - **Save:** allow reserved ids only when `enabled: false`; reject unknown ids (REF-V01)
  - **Publish:** reject any enabled factor ∉ IMPLEMENTED (REF-V04); reject empty/all-disabled pipeline (REF-V03/V03b)
- [x] **Split** validation API: `validateForSave(factorConfig)` vs `validateForPublish(factorConfig)` (publish calls save rules + publish rules).
- [x] **Unit tests** in `DrawFormulaPipelineAssemblerTest` or new `DrawFormulaValidatorTest` for REF-V04b reserved-disabled path.

### 3. DrawFormulaService (AC 1, 5–8, 12)

- [x] **Create** `DrawFormulaService` with `@Transactional` methods:
  - `list(troupeId, principal)` — admin auth ; include system row ; order by name
  - `get(troupeId, formulaId, principal)`
  - `create(troupeId, request, principal)` — default `DRAFT`, new UUID, `version = 1`
  - `update(troupeId, formulaId, request, principal)` — partial patch ; validate on `factorConfig` / status transition
  - `archive(troupeId, formulaId, principal)` — policy reference check → 409 ; else ARCHIVED
- [x] **Create** `DrawFormulaPolicyReferenceService` (or private helper) — scan [`DrawPolicyRepository`](../../services/api/src/main/kotlin/com/hatcast/api/draw/DrawPolicyRepository.kt) rows for troupe ; extract UUID refs from `defaultRule` + `categoryRules` JSON ([`DrawDefaultRule`](../../services/api/src/main/kotlin/com/hatcast/api/draw/DrawModels.kt) uses `String` ids).
- [x] **Extend** `DrawFormulaRepository` — `findByTroupeIdOrderByNameAsc(troupeId)` for admin list.
- [x] **Wire** auth via [`TroupeAccessService.requireTroupeAdmin`](../../services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeAccessService.kt).

### 4. Controller (AC 1–4)

- [x] **Create** `DrawFormulaController` — `@RequestMapping("/v1/troupes/{troupeId}/draw-formulas")` ; map exceptions to 400/403/404/409 (`ResponseStatusException` pattern from [`TroupeController`](../../services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeController.kt)).
- [x] **Optional (AC 9):** `POST …/{formulaId}/preview` — defer if time-boxed ; document waiver.

### 5. Integration tests (AC 2, 10–14)

- [x] **Implement** `DrawFormulaValidationIntegrationTest` — load `validation.json` fixtures ; MockMvc + admin cookie pattern from [`TroupeCategoryIntegrationTest`](../../services/api/src/test/kotlin/com/hatcast/api/troupe/TroupeCategoryIntegrationTest.kt).
- [x] **Implement** `DrawFormulaPipelineGoldenTest` — assemble pipeline per `pipelines.json` ; assert weight/probability refs (reuse helpers from [`DrawGoldenTest`](../../services/api/src/test/kotlin/com/hatcast/api/availability/DrawGoldenTest.kt)).
- [x] **Add** `DrawFormulaControllerIntegrationTest` — 403 non-admin ; system formula DELETE 403 ; DELETE when policy references → 409 ; happy CRUD path.
- [x] **Gate:** `./gradlew test` full suite green.

### 6. Regression guard (AC 15)

- [x] **Verify** no changes to `CompositionDrawService` DEFAULT path ; existing draw golden suites unchanged.

### Review Findings

**Revue 2026-06-16 (2e passage — gaps tests + code)**

- [x] [Review][Patch] PATCH `status: ARCHIVED` contourne le 409 politique — `rejectIfPolicyReferenced()` partagé archive/PATCH [DrawFormulaService.kt]
- [x] [Review][Patch] POST create accepte `status: ARCHIVED` — rejet 400 aligné OpenAPI [DrawFormulaService.kt]
- [x] [Review][Patch] GET détail sans `ensureSystemFormula` — seed avant lookup + test dédié [DrawFormulaService.kt]
- [x] [Review][Patch] `list()`/`get()` readOnly + seed — transactions read-write [DrawFormulaService.kt]
- [x] [Review][Patch] DELETE idempotent absent — second DELETE sans bump version [DrawFormulaService.kt]
- [x] [Review][Patch] Tests validation REF-V POST-only — `formulaValidationPatch` paramétré POST+PATCH [DrawFormulaValidationIntegrationTest.kt]
- [x] [Review][Patch] AC 8 non prouvé — test PATCH→PUBLISHED invalide + DB inchangée [DrawFormulaControllerIntegrationTest.kt]
- [x] [Review][Patch] 403 non-admin GET list seulement — tous endpoints catalogue [DrawFormulaControllerIntegrationTest.kt]
- [x] [Review][Patch] Isolation troupe GET seulement — PATCH/DELETE cross-troupe 404 [DrawFormulaControllerIntegrationTest.kt]
- [x] [Review][Patch] Garde formule système PATCH 403 absent — test ajouté [DrawFormulaControllerIntegrationTest.kt]
- [x] [Review][Patch] `expectedHttpStatus` fixtures non asserté — assert POST + PATCH rejected [DrawFormulaValidationIntegrationTest.kt]

- [x] [Review][Defer] TOCTOU check politique puis save archivage — fenêtre race MVP acceptée [DrawFormulaService.kt] — deferred, pre-existing pattern MVP
- [x] [Review][Defer] Scan politiques O(n) en mémoire à chaque archivage — explicitement MVP dans Dev Notes [DrawFormulaPolicyReferenceService.kt] — deferred, pre-existing
- [x] [Review][Defer] Incrément `version` sur PATCH sans changement effectif — bruit versioning mineur [DrawFormulaService.kt] — deferred, pre-existing

---

## Dev Notes

### Product and UX rules

- **Wave D S3 goal:** expose troupe catalogue CRUD so **19.19** (admin UI) and **19.18** (policy API + runtime) can consume stable HTTP contracts.
- **DELETE = soft archive (PO lock for this story):** epics allow « 409 or soft-only » — choose **soft archive** + **409 when policy-bound** ; document in OpenAPI ; UI **19.19** shows same error on archive attempt.
- **System V1 row:** always listed ; read-only ; name from [`DrawFormulaSeedConstants.SYSTEM_V1_NAME`](../../services/api/src/main/kotlin/com/hatcast/api/draw/DrawFormulaSeedConstants.kt).
- **Preview (AC3):** explicitly **waivable** per OQ-19-03 and test design ; do not block story on preview if CRUD + validation green.

### Architecture compliance

| Topic | Rule |
|-------|------|
| Stack | Kotlin + Spring Boot + JPA ; MockMvc integration tests `@ActiveProfiles("test")` |
| Package | HTTP in `com.hatcast.api.draw` ; keep weight math in `availability.draw` |
| Auth | `TroupeAccessService.requireTroupeAdmin` ; platform admin bypass (existing pattern) |
| Troupe isolation | Every query filters `troupe_id` ; path/body mismatch → 404 |
| JSON | Reuse `DrawFactorConfig` / entity `@JdbcTypeCode(JSON)` — no parallel DTO shape |
| Errors | French messages ; `400` validation, `403` auth, `404` not found, `409` policy conflict |
| DEFAULT unchanged | **19.18** wires runtime ; this story must not alter draw outcomes in production |
| Versioning | Bump `version` int on every successful PATCH/POST mutation |

### Current code state (19.16 baseline — READ before editing)

| File | Today | This story |
|------|-------|------------|
| [`DrawFormulaEntity.kt`](../../services/api/src/main/kotlin/com/hatcast/api/draw/DrawFormulaEntity.kt) | JPA entity + JSON columns | Use as-is ; no schema migration |
| [`DrawFormulaSeedService.kt`](../../services/api/src/main/kotlin/com/hatcast/api/draw/DrawFormulaSeedService.kt) | `ensureSystemFormula`, `deleteFormula`, `archiveFormula` | Prefer **service-layer** archive with policy check ; keep system guards |
| [`DrawFormulaValidator`](../../services/api/src/main/kotlin/com/hatcast/api/draw/DrawFormulaPipelineAssembler.kt) | MVP factor ids only | **Extend** reserved-factor rules (AC 10–11) |
| [`DrawPolicyValidator.kt`](../../services/api/src/main/kotlin/com/hatcast/api/draw/DrawPolicyValidator.kt) | Category/formula refs at policy save | Reuse UUID parsing pattern for policy reference scan |
| [`DrawPolicyResolutionService.kt`](../../services/api/src/main/kotlin/com/hatcast/api/draw/DrawPolicyResolutionService.kt) | Implicit default only | **Do not** wire to HTTP in this story |

### Policy reference detection (AC 5)

Scan all `DrawPolicyEntity` rows where `troupeId` matches. Collect UUIDs from:

- `defaultRule.mandatoryFormulaId`
- `defaultRule.allowedFormulaIds[]`
- each `categoryRules[]` entry (same fields)

Use `UUID.fromString` with same error handling as `DrawPolicyValidator`. No DB JSON query required at MVP scale.

### Reserved vs implemented factors

```kotlin
// Implemented (can be enabled on publish):
equity_tag, past_participation, immediate_replay, role_request

// Reserved (save allowed disabled only; publish if enabled → REF-V04):
gender_parity, volunteer_bonus, class_mix, prestige
```

**Gap vs current validator:** `gender_parity` disabled currently fails REF-V01 — **must fix** before REF-V04b passes.

### Response DTO sketch (informative)

```json
{
  "id": "uuid",
  "troupeId": "uuid",
  "name": "V1 + aspirations rôle",
  "description": null,
  "status": "DRAFT",
  "factorConfig": [
    { "factorId": "equity_tag", "enabled": true },
    { "factorId": "past_participation", "enabled": true },
    { "factorId": "role_request", "enabled": true }
  ],
  "version": 1,
  "isSystem": false,
  "createdAt": "…",
  "updatedAt": "…"
}
```

### File structure requirements

| File / area | Action |
|-------------|--------|
| `com/hatcast/api/draw/DrawFormulaController.kt` | **CREATE** |
| `com/hatcast/api/draw/DrawFormulaService.kt` | **CREATE** |
| `com/hatcast/api/draw/dto/DrawFormulaDtos.kt` | **CREATE** |
| `com/hatcast/api/draw/DrawFormulaPipelineAssembler.kt` | **UPDATE** — validator split + reserved ids |
| `com/hatcast/api/draw/DrawFormulaRepository.kt` | **UPDATE** — list query |
| `openapi/draw-formulas.yaml` | **CREATE** |
| `DrawFormulaValidationIntegrationTest.kt` | **UPDATE** — enable + implement |
| `DrawFormulaPipelineGoldenTest.kt` | **UPDATE** — enable + implement |
| `DrawFormulaControllerIntegrationTest.kt` | **CREATE** |
| `CompositionDrawService.kt` | **DO NOT** wire persisted formulas |
| `DrawPolicyResolutionGoldenTest.kt` | **DO NOT** enable (**19.18**) |

### Explicit non-goals

- Policy CRUD / effective rule GET / draw `formulaId` enforcement → **19.18**
- Admin UI formula editor → **19.19**
- Preview % endpoint (optional — waivable) → defer or minimal stub
- Snapshot metadata on draw → **19.22**
- Physical DELETE of formula rows
- Changing `DrawWeightPipelines.DEFAULT` or editing golden weight fixtures

### Dependencies

| Story | Status | Relationship |
|-------|--------|--------------|
| **19.16** | done | Persistence + validator baseline — **blocks this story** |
| **19.15** | done | Normative spec + validation matrix |
| **19.18** | backlog | **Blocked by this story** — policy API + runtime |
| **19.19** | backlog | **Blocked by this story** — admin UI |
| **19.2** | done | Golden regression must stay green |

### Previous story intelligence (19.16)

- **Package `com.hatcast.api.draw.*`** established — extend, do not duplicate entities/repos.
- **System formula guards** — `SystemDrawFormulaMutationException` ; tests in `DrawFormulaSeedServiceTest`.
- **Review deferrals relevant here:**
  - Policy validator does **not** require `PUBLISHED` on referenced formulas at policy save — still deferred to **19.18** ; this story only blocks **archive** when referenced (any status in policy JSON).
  - `resolveImplicitDefault` uses `@Transactional(readOnly=true)` with lazy seed — **do not regress**.
- **Flyway V64/V65** — no new migration expected unless DTO/index gap discovered.

### Git intelligence

Recent commits on baseline `3ed9b7a8`:

- `3ed9b7a8` — merge **19.16** (persistence + system V1 seed)
- `9c6aa6a3` — draw domain package, Flyway V64/V65, implicit resolution
- `d09cb95d` — Wave D test scaffolding (`@Disabled` runners tagged `@Tag("19.17")`)

Pattern: enable scaffolded tests ; implement controller/service ; extend validator for reserved factors.

### Testing requirements

| Test class | Purpose | AC |
|------------|---------|-----|
| `DrawFormulaValidationIntegrationTest` | REF-V01..V04b HTTP | 10–11, 14 |
| `DrawFormulaPipelineGoldenTest` | REF-F01..F08 assembly | 13 |
| `DrawFormulaControllerIntegrationTest` | Auth, 409 policy, system guards | 2, 5–7 |
| `DrawFormulaPipelineAssemblerTest` | Unit validator regressions | 10–11 |
| `DrawGoldenTest` / factor goldens | Unchanged regression | 15 |

**CI gate (story):**

```bash
./gradlew -q test --tests 'com.hatcast.api.availability.DrawFormulaValidationIntegrationTest'
./gradlew -q test --tests 'com.hatcast.api.availability.DrawFormulaPipelineGoldenTest'
./gradlew -q test --tests 'com.hatcast.api.draw.DrawFormulaControllerIntegrationTest'
./gradlew -q test --tests 'com.hatcast.api.draw.DrawFormula*'
./gradlew -q test --tests 'com.hatcast.api.availability.DrawGoldenTest'
```

Full `./gradlew test` before merge.

### Latest tech notes

- **Spring Boot 3.x / MockMvc:** use `SecurityMockMvcRequestPostProcessors.csrf()` on mutating requests (existing integration tests).
- **OpenAPI:** fragments under `services/api/openapi/` — no code-gen in build ; keep YAML in sync manually (project pattern).
- **Jackson:** DTOs use `@JsonNaming(LowerCamelCaseStrategy)` like [`DrawModels.kt`](../../services/api/src/main/kotlin/com/hatcast/api/draw/DrawModels.kt).

---

## Dev Agent Record

### Agent Model Used

Composer (dev-story 19.17)

### Completion Notes List

- CRUD admin REST under `/v1/troupes/{troupeId}/draw-formulas` (GET list/detail, POST, PATCH, DELETE soft archive).
- `DrawFormulaValidator` split save/publish ; reserved factors (`gender_parity`, etc.) allowed disabled on draft (REF-V04b).
- Policy reference scan → 409 on archive ; system formula → 403 on mutate/delete.
- Preview endpoint **deferred** (AC 9 / OQ-19-03) — noted in OpenAPI fragment.
- Enabled `DrawFormulaValidationIntegrationTest` (REF-V01..V04b) and `DrawFormulaPipelineGoldenTest` (REF-F01..F08).
- `./gradlew test` full suite green ; `CompositionDrawService` unchanged.

### File List

- `services/api/src/main/kotlin/com/hatcast/api/draw/DrawFormulaController.kt` (CREATE)
- `services/api/src/main/kotlin/com/hatcast/api/draw/DrawFormulaService.kt` (CREATE)
- `services/api/src/main/kotlin/com/hatcast/api/draw/DrawFormulaPolicyReferenceService.kt` (CREATE)
- `services/api/src/main/kotlin/com/hatcast/api/draw/dto/DrawFormulaDtos.kt` (CREATE)
- `services/api/src/main/kotlin/com/hatcast/api/draw/DrawFormulaPipelineAssembler.kt` (UPDATE)
- `services/api/src/main/kotlin/com/hatcast/api/draw/DrawFormulaRepository.kt` (UPDATE)
- `services/api/src/main/kotlin/com/hatcast/api/draw/DrawPolicyRepository.kt` (UPDATE)
- `services/api/openapi/draw-formulas.yaml` (CREATE)
- `services/api/src/test/kotlin/com/hatcast/api/draw/DrawFormulaControllerIntegrationTest.kt` (CREATE)
- `services/api/src/test/kotlin/com/hatcast/api/draw/DrawFormulaPipelineAssemblerTest.kt` (UPDATE)
- `services/api/src/test/kotlin/com/hatcast/api/availability/DrawFormulaValidationIntegrationTest.kt` (UPDATE)
- `services/api/src/test/kotlin/com/hatcast/api/availability/DrawFormulaPipelineGoldenTest.kt` (UPDATE)

### Change Log

- 2026-06-16 : Story **19.17** created via `bmad-create-story` — Wave D S3 CRUD API gate.
- 2026-06-16 : Implemented admin CRUD API, validator reserved factors, integration + golden tests (dev-story).
- 2026-06-16 : Code review 2e passage — gaps tests fermés, 5 correctifs service appliqués, story `done`.

---

### Validation create-story

- [x] AC métier numérotés et sourcés (epics / spec / REF-*)
- [x] Section **Material 3** = **UI : N/A**
- [x] Tasks référencent les numéros d'AC
- [x] Liens vers fichiers code existants (19.16 draw package, test scaffolding, OpenAPI patterns)
- [x] `./gradlew test` mentionné avec gates ciblés
