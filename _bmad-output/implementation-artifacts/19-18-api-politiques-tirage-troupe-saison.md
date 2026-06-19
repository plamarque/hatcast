---
feature_branch: feat/19-18-api-politiques-tirage-troupe-saison
baseline_commit: 2c231f91a08a3e5a616ed7bffc6ede25313ddb1e
---

# Story 19.18 : Admin API — draw policies (troupe / season) + runtime wiring

Status: done

<!-- Ultimate context engine analysis completed — comprehensive developer guide created -->

## Story

As a **troupe admin or season admin (troupe admin only per OQ-19-05)**,  
I want to define a **draw policy** that mandates or restricts formula choice,  
so that **spectacles align** with the troupe's equity policy and organizers draw with the correct recipe (Wave D **Demo 2** runtime gate).

## Acceptance Criteria

### Troupe policy HTTP (AC 1 — epics 19.18)

1. **Given** a user with **`TROUPE_ADMIN`** on troupe **T** (or platform admin), **when** calling `PUT /v1/troupes/{troupeId}/draw-policy` with body `{ defaultRule, categoryRules[] }` (shape from [draw-formulas-policies-spec.md](../../docs/v2/technical/draw-formulas-policies-spec.md) § Entities), **then** upsert the single `TROUPE`-scoped `draw_policies` row (`troupeScopeKey = troupeId`, `seasonId = null`) and return the persisted policy DTO.
   [Source: epics 19.18 AC1 ; spec § DrawPolicy]

2. **Given** `GET /v1/troupes/{troupeId}/draw-policy`, **when** admin authorized, **then** return the troupe policy or **404** if none (implicit default applies at resolution — no auto-create row).
   [Source: 19.20 prep ; pattern from formula CRUD **19.17**]

3. **Given** a member **without** troupe admin, **when** any mutating call on troupe draw-policy endpoints, **then** **403 Forbidden** (French message, [`TroupeAccessService`](../../services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeAccessService.kt)).
   [Source: epics 19.18 AC7 ; spec § Authorization]

### Season policy HTTP (AC 2 — epics 19.18)

4. **Given** season **S** belonging to troupe **T**, **when** `PUT /v1/seasons/{seasonId}/draw-policy` with same body shape, **then** upsert the single `SEASON`-scoped row (`seasonScopeKey = seasonId`, `troupeId = T`) and return DTO.
   [Source: epics 19.18 AC2]

5. **Given** season policy exists, **when** resolving policy for events in **S**, **then** season policy **completely replaces** troupe policy (no per-category merge with troupe) — **REF-R08**.
   [Source: spec § Season vs troupe policy]

6. **Given** `GET /v1/seasons/{seasonId}/draw-policy`, **when** **`TROUPE_ADMIN`** for the season's troupe (**OQ-19-05** — not delegated season organizer), **then** return season policy or **404**. Season organizers **cannot** mutate or read admin policy endpoints.
   [Source: spec § Authorization OQ-19-05 ; epics title « admin saison » is outdated]

### Effective rule for organizers (AC 3 — epics 19.18)

7. **Given** event **E** in season **S**, **when** `GET /v1/seasons/{seasonId}/events/{eventId}/draw-policy/effective` by a user with **`canManageComposition`** on **E**, **then** return resolved rule for `event.category` including: `policySource` (`IMPLICIT` \| `TROUPE` \| `SEASON`), `resolvedRuleSource` (`default` \| `category`), `resolvedMode` (`MANDATORY` \| `CHOICE`), `allowedFormulaIds[]` (UUIDs), `effectiveFormulaId` (when auto-resolved without organizer choice), `selectorVisible`, human-readable formula **names** (join catalogue), category slug/label, and `requiresFormulaIdOnDraw` (true when `CHOICE` with **≥2** allowed formulas).
   [Source: epics 19.18 AC3 ; fixtures **REF-R01–R10**]

8. **Given** resolution uses **`SpectacleCategory.slug(event)`** only, **when** category is `null`, **then** match `categoryRules[]` entry with `category: null` if present, else `defaultRule` — **REF-R06/R07**. **Never** use `templateType`.
   [Source: spec § Resolution key ; risk **R-WD-05**]

### Draw runtime & `formulaId` (AC 4–6 — epics 19.18)

9. **Given** resolved rule **`MANDATORY`**, **when** `POST …/composition/draw`, **then** server applies `mandatoryFormulaId` (with availability fallback per § Active catalogue invariant). Client `formulaId` **ignored** if omitted; if provided and **≠** resolved mandatory id after fallback → **400** `formulaId incompatible avec la politique`.
   [Source: epics 19.18 AC4 ; PO lock documented in OpenAPI]

10. **Given** resolved rule **`CHOICE`** on an **explicit** troupe/season policy with **≥2** allowed formulas, **when** draw **without** `formulaId`, **then** **400** ; with id **∉** allowed set → **403** (**REF-V13** — lock **403** in OpenAPI). **Implicit** default (no policy row, REF-R01) : défaut serveur sans `formulaId` obligatoire jusqu’à UI orga **19.21**.
    [Source: epics 19.18 AC5–6 ; **REF-R05**]

11. **Given** resolved rule **`CHOICE`** with **exactly 1** allowed formula, **when** draw without `formulaId`, **then** apply that sole formula (no selector required — **19.21** waives modale).
    [Source: epics 19.18 AC6]

12. **Given** draw succeeds, **when** weights/`%` computed, **then** use pipeline assembled from **`DrawFormula(effectiveFormulaId).factorConfig`** via [`DrawFormulaPipelineAssembler`](../../services/api/src/main/kotlin/com/hatcast/api/draw/DrawFormulaPipelineAssembler.kt) — **not** `DrawWeightPipelines.DEFAULT` unless fallback lands on system V1 with equivalent config (**REF-F01**).
    [Source: spec § Effective formula invariant ; AC15 regression from **19.17**]

13. **Given** same `formulaId` and event context, **when** comparing `POST …/composition/draw` step weights vs `GET …/availability/summary?includeChances=true` operational scoring vs explainability endpoints, **then** `%` match (**REF-R12**, **OQ-19-04**). Wire resolver into [`CompositionDrawService`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionDrawService.kt), [`CompositionExplainabilityService`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionExplainabilityService.kt), [`CompositionSlotAssignmentService`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionSlotAssignmentService.kt), and [`AvailabilityService.getSummary`](../../services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityService.kt) for orga paths. Optional query `formulaId` on summary/effective GET for orga preview before draw (document in OpenAPI).
    [Source: test design 19-18 § REF-R12]

### Runtime fallbacks (AC 4 extension — REF-V14/V15)

14. **Given** policy saved with category slug **later removed** from glossary, **when** draw at runtime, **then** **fallback to `defaultRule`** (do not fail draw) — **REF-V14**.
    [Source: spec § Runtime fallback when category deleted]

15. **Given** resolved formula id is **`ARCHIVED`**, missing, or deleted after policy save, **when** draw at runtime, **then** apply fallback cascade: next **`PUBLISHED`** in `allowedFormulaIds` (CHOICE) → re-resolve `defaultRule` → **system V1** — draw **must not fail** solely for stale catalogue — **REF-V15**, **REF-R11**.
    [Source: spec § Active catalogue invariant]

### Policy save validation (AC 7 — REF-V05–V12)

16. **Given** policy save (`PUT`), **when** payload violates rules below, **then** **400** with French error:

    | Ref | Rule |
    |-----|------|
    | **REF-V05** | Unknown category slug in `categoryRules` |
    | **REF-V06** | Duplicate `category` in `categoryRules[]` |
    | **REF-V07** | `CHOICE` with empty `allowedFormulaIds` |
    | **REF-V08** | Duplicate UUID in `allowedFormulaIds` |
    | **REF-V09** | `MANDATORY` without `mandatoryFormulaId` |
    | **REF-V10** | Formula from another troupe |
    | **REF-V11** | Reference to **`DRAFT`** formula |
    | **REF-V12** | Reference to **`ARCHIVED`** formula |

    Extend [`DrawPolicyValidator`](../../services/api/src/main/kotlin/com/hatcast/api/draw/DrawPolicyValidator.kt) — today validates slug + catalogue membership only; **add status checks (REF-V11/V12)** and structural rules (REF-V07/V08) deferred from **19.16** review.
    [Source: [`validation.json`](../../services/api/src/test/resources/draw/golden/policies/validation.json) ; deferred-work **19.16**]

17. **Given** policy references formula ids, **when** validating, **then** require **`status = PUBLISHED`** (system V1 always allowed). Reject **DRAFT** and **ARCHIVED** at save time.
    [Source: spec § Validation matrix ; deferred-work **19.16**]

18. **Given** upsert policy entity, **when** persisting, **then** set scope keys correctly: `troupeScopeKey = troupeId` iff `scope = TROUPE`; `seasonScopeKey = seasonId` iff `scope = SEASON`; opposite key **null**.
    [Source: deferred-work **19.16** scope-key factory]

19. **Couverture :** NFR-S2, FR20. **Priorité :** P2 Wave D **S5 (Demo 2 runtime)**. **Depends :** **19.17** (done), **19.19b** (done), **3.5**, **17.7**, **17.8**. **Blocks :** **19.20**, **19.21**. **UI : N/A**.

---

## Acceptance Criteria — Material 3 (UI)

**UI : N/A** — no changes under `apps/web/` ; Material 3 section omitted intentionally (**19.20** admin UI, **19.21** orga choix).

---

## Tasks / Subtasks

**Scope:** `services/api/` — policy REST, resolution service, draw runtime wiring, OpenAPI, golden/integration tests. **No** Angular, **no** snapshot metadata (**19.22**).

### 0. Branch & baseline (mandatory)

- [x] Confirm branch `feat/19-18-api-politiques-tirage-troupe-saison` ; baseline `2c231f91a08a3e5a616ed7bffc6ede25313ddb1e`.

### 1. DTOs & OpenAPI (AC 1–4, 7, 9–10)

- [x] **CREATE** `com.hatcast.api.draw.dto.DrawPolicyDtos.kt` — `DrawPolicyDto`, `UpsertDrawPolicyRequest`, `EffectiveDrawPolicyDto`, `DrawRuleDto` (mirror [`DrawDefaultRule`](../../services/api/src/main/kotlin/com/hatcast/api/draw/DrawModels.kt) / [`DrawCategoryRule`](../../services/api/src/main/kotlin/com/hatcast/api/draw/DrawModels.kt) with camelCase JSON).
- [x] **CREATE** [`openapi/draw-policies.yaml`](../../services/api/openapi/draw-policies.yaml) — paths:
  - `GET/PUT /troupes/{troupeId}/draw-policy`
  - `GET/PUT /seasons/{seasonId}/draw-policy`
  - `GET /seasons/{seasonId}/events/{eventId}/draw-policy/effective`
  - Extend `DrawCompositionRequestDto` schema with optional `formulaId` (UUID)
- [x] Document PO locks: MANDATORY mismatch → **400** ; id ∉ allowed → **403** ; CHOICE ≥2 missing `formulaId` → **400**.

### 2. Extend DrawPolicyValidator (AC 16–17)

- [x] **UPDATE** [`DrawPolicyValidator`](../../services/api/src/main/kotlin/com/hatcast/api/draw/DrawPolicyValidator.kt):
  - `validateChoiceRule(rule)` — non-empty, no duplicate ids (**REF-V07/V08**)
  - `validateFormulaReference(troupeId, formulaRef)` — exists, same troupe, **`status == PUBLISHED`** or system V1 (**REF-V10/V11/V12**)
  - `validatePolicyPayload(troupeId, defaultRule, categoryRules)` — orchestrate all REF-V05–V12
- [x] **UPDATE** [`DrawPolicyValidatorTest`](../../services/api/src/test/kotlin/com/hatcast/api/draw/DrawPolicyValidatorTest.kt) for new rules.

### 3. DrawPolicyService — persistence (AC 1–2, 4, 16–18)

- [x] **CREATE** `DrawPolicyService` — `@Transactional`:
  - `getTroupePolicy(troupeId, principal)` / `upsertTroupePolicy(...)`
  - `getSeasonPolicy(seasonId, principal)` / `upsertSeasonPolicy(...)` — resolve season → troupe ; auth **`requireTroupeAdmin`**
  - Upsert: find existing by scope key or insert ; set `troupeScopeKey` / `seasonScopeKey` ; bump `updatedAt`
- [x] **UPDATE** [`DrawPolicyRepository`](../../services/api/src/main/kotlin/com/hatcast/api/draw/DrawPolicyRepository.kt) — add `findByTroupeIdAndScope`, `findBySeasonIdAndScope` (or use existing `exists*` + new finders).

### 4. DrawPolicyResolutionService — full algorithm (AC 5, 7–8, 14–15)

- [x] **UPDATE** [`DrawPolicyResolutionService`](../../services/api/src/main/kotlin/com/hatcast/api/draw/DrawPolicyResolutionService.kt):
  - Keep `resolveImplicitDefault(troupeId)` (used when no explicit policy)
  - **ADD** `resolveForEvent(event: EventEntity, requestedFormulaId: UUID? = null): ResolvedDrawContext` returning rule + effective formula id + assembled pipeline
  - Implement spec § Resolution algorithm steps 1–9 + fallback cascade § Active catalogue invariant
  - Category glossary check at **draw time** (not save): unknown slug → `defaultRule` (**REF-V14**)
  - Extend [`ResolvedDrawRule`](../../services/api/src/main/kotlin/com/hatcast/api/draw/DrawModels.kt) or add `EffectiveDrawPolicyDto` with labels, `requiresFormulaIdOnDraw`, `resolvedRuleSource`
- [x] **CREATE** `DrawFormulaRuntimeService` (or methods on resolution service) — load formula entity, `DrawFormulaPipelineAssembler.assemble(factorConfig)`, handle system V1 seed via [`DrawFormulaSeedService`](../../services/api/src/main/kotlin/com/hatcast/api/draw/DrawFormulaSeedService.kt)

### 5. Controllers (AC 1–4, 7)

- [x] **CREATE** `DrawPolicyController` **or** extend [`TroupeController`](../../services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeController.kt) + [`SeasonController`](../../services/api/src/main/kotlin/com/hatcast/api/season/SeasonController.kt) — follow **19.17** `DrawFormulaController` pattern.
- [x] **ADD** effective GET on [`CompositionController`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionController.kt) or nested `DrawPolicyController` under events path — auth [`OrganizerAccessRules.canManageComposition`](../../services/api/src/main/kotlin/com/hatcast/api/organizer/OrganizerAccessService.kt).

### 6. Draw runtime wiring (AC 9–13)

- [x] **UPDATE** [`DrawCompositionRequestDto`](../../services/api/src/main/kotlin/com/hatcast/api/composition/dto/CompositionDtos.kt) — add `formulaId: UUID? = null`.
- [x] **UPDATE** [`CompositionDrawService.drawComposition`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionDrawService.kt):
  - Resolve pipeline via `DrawPolicyResolutionService` + validate `formulaId` per AC 9–11
  - Replace `ObjectProvider<DrawWeightPipeline>` fallback with **per-request** resolved pipeline (keep test `@Bean` override pattern from [`RoleRequestDrawIntegrationTest`](../../services/api/src/test/kotlin/com/hatcast/api/composition/RoleRequestDrawIntegrationTest.kt))
- [x] **UPDATE** explainability + slot assignment + availability summary to accept resolved pipeline from same resolver (inject service, not singleton DEFAULT bean). For summary: when orga reads with `includeChances=true`, use effective/selected formula (**REF-R12**).

### 7. Integration & golden tests (AC 16, 13–15)

- [x] **ENABLE** [`DrawPolicyValidationIntegrationTest`](../../services/api/src/test/kotlin/com/hatcast/api/composition/DrawPolicyValidationIntegrationTest.kt) — load [`policies/validation.json`](../../services/api/src/test/resources/draw/golden/policies/validation.json) fixtures `policySave`, `compositionDraw`, `drawRuntime` (**REF-V05–V15**).
- [x] **ENABLE** [`DrawPolicyResolutionGoldenTest`](../../services/api/src/test/kotlin/com/hatcast/api/composition/DrawPolicyResolutionGoldenTest.kt) — loader for [`policies/resolution.json`](../../services/api/src/test/resources/draw/golden/policies/resolution.json) (**REF-R01–R12**).
- [x] **ADD** `DrawPolicyControllerIntegrationTest` — auth 403 non-admin ; season/troupe isolation ; upsert idempotency ; effective GET for orga vs member 403.
- [x] **Regression:** `DrawGoldenTest`, `DrawOrchestrationGoldenTest`, `DrawFormulaPipelineGoldenTest`, `DrawFormulaControllerIntegrationTest` unchanged green.
- [x] **Gate:** `./gradlew test` full suite green.

### 8. Explicit regression guard

- [x] **Verify** implicit-default troupe with **no** policy row still draws identically to pre-19.18 when catalogue is empty (system V1 ≡ DEFAULT — **REF-F01**).
- [x] **Verify** troupes without explicit policy never require `formulaId` when only system V1 in allowed set (**REF-R02**).

---

## Dev Notes

### Product and UX rules

- **Wave D Demo 2 gate:** first story where production draw **≠** hardcoded `DEFAULT` when policies/formulas configured. Demo 1 (**19.19c**) admin editor already ships — this story makes choices **enforceable server-side**.
- **OQ-19-05 (authoritative):** Only **`TROUPE_ADMIN`** edits troupe/season policies. Season organizers **consume** effective policy + choose at draw (**19.21**).
- **Season policy replaces troupe policy entirely** — not a merge. UI **19.20** will show inheritance banner; API returns season row only when present.
- **No per-event policy row** — organizer formula selection is session-scoped (**OQ-19-02**); passed only via draw `formulaId` / optional preview query params until **19.21** UI.
- **Snapshot metadata** (`drawFormulaId`, policy scope, …) → **19.22** — do not extend `CompositionDrawChanceSnapshot` columns in this story.

### Architecture compliance

| Topic | Rule |
|-------|------|
| Stack | Kotlin + Spring Boot + JPA ; MockMvc `@ActiveProfiles("test")` |
| Package | HTTP + policy domain in `com.hatcast.api.draw` ; draw execution stays in `composition` + `availability` |
| Auth troupe policy | `TroupeAccessService.requireTroupeAdmin` |
| Auth season policy | Resolve season → troupeId → same admin gate |
| Auth effective GET / draw | `OrganizerAccessRules.canManageComposition` |
| JSON columns | Reuse entity types on [`DrawPolicyEntity`](../../services/api/src/main/kotlin/com/hatcast/api/draw/DrawPolicyEntity.kt) — no parallel rule shape |
| Pipeline assembly | Always via `DrawFormulaPipelineAssembler.assemble` — validates publish rules |
| Category key | `SpectacleCategory.slug(event)` — [`SpectacleCategory`](../../services/api/src/main/kotlin/com/hatcast/api/event/SpectacleCategory.kt) |
| Errors | French messages ; `400` validation, `403` auth / forbidden formula, `404` not found |
| No migration expected | V65 tables sufficient unless discovery gap |

### Current code state (baseline — READ before editing)

| File | Today | This story |
|------|-------|------------|
| [`DrawPolicyResolutionService`](../../services/api/src/main/kotlin/com/hatcast/api/draw/DrawPolicyResolutionService.kt) | `resolveImplicitDefault` only | **Full event resolution + fallbacks** |
| [`DrawPolicyValidator`](../../services/api/src/main/kotlin/com/hatcast/api/draw/DrawPolicyValidator.kt) | Slug + catalogue existence | **+ REF-V07–V12, PUBLISHED-only** |
| [`DrawPolicyRepository`](../../services/api/src/main/kotlin/com/hatcast/api/draw/DrawPolicyRepository.kt) | `exists*` + `findByTroupeId` | **+ findBy scope for upsert** |
| [`DrawPolicyEntity`](../../services/api/src/main/kotlin/com/hatcast/api/draw/DrawPolicyEntity.kt) | JPA + JSON | Use as-is ; set scope keys on save |
| [`CompositionDrawService`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionDrawService.kt) | `DrawWeightPipelines.DEFAULT` via `ObjectProvider` | **Per-draw resolved pipeline** |
| [`DrawCompositionRequestDto`](../../services/api/src/main/kotlin/com/hatcast/api/composition/dto/CompositionDtos.kt) | `mode` only | **+ `formulaId`** |
| [`DrawPolicyValidationIntegrationTest`](../../services/api/src/test/kotlin/com/hatcast/api/composition/DrawPolicyValidationIntegrationTest.kt) | `@Disabled` stub | **Implement** |
| [`DrawPolicyResolutionGoldenTest`](../../services/api/src/test/kotlin/com/hatcast/api/composition/DrawPolicyResolutionGoldenTest.kt) | `@Disabled` stub | **Implement** |
| [`AvailabilityService.getSummary`](../../services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityService.kt) | `scoreCandidates()` without pipeline arg | **Pass resolved pipeline for orga operational path** |

### Resolution algorithm (implement verbatim)

Follow [draw-formulas-policies-spec.md § Resolution algorithm](../../docs/v2/technical/draw-formulas-policies-spec.md):

1. Season policy row → else troupe policy row → else `resolveImplicitDefault(troupeId)`
2. Match `categoryRules` by exact slug (`null` matches uncategorized events)
3. Apply `MANDATORY` / `CHOICE` branches ; enforce `formulaId` on draw when `CHOICE` size ≥ 2
4. `resolveFormulaAvailability` fallback cascade before assembly
5. `DrawFormulaPipelineAssembler.assemble(factorConfig)`

**Tie-break for server default when CHOICE ≥2 (UI load before selection):** document in OpenAPI — recommend **first** id in `allowedFormulaIds` order (stable, testable). **19.21** UI may override before draw.

### Implicit default (already implemented — do not regress)

[`resolveImplicitDefault`](../../services/api/src/main/kotlin/com/hatcast/api/draw/DrawPolicyResolutionService.kt):

- `allowedFormulaIds` = all `PUBLISHED` non-system + `DrawFormulaIds.systemV1(troupeId)`
- `selectorVisible = allowedFormulaIds.size >= 2`
- `effectiveFormulaId = systemV1` when sole entry

Tests: [`DrawPolicyResolutionServiceTest`](../../services/api/src/test/kotlin/com/hatcast/api/draw/DrawPolicyResolutionServiceTest.kt) (**REF-R02/R03/R10** partial).

### HTTP status PO locks (document in OpenAPI)

| Scenario | Status |
|----------|--------|
| Policy validation (**REF-V05–V12**) | **400** |
| Non-admin policy mutation | **403** |
| `formulaId` missing when required (**REF-R05**) | **400** |
| `formulaId` ∉ allowed set (**REF-V13**) | **403** |
| MANDATORY + client `formulaId` mismatch | **400** |
| Season/event not found / wrong troupe | **404** |

### Effective GET response sketch (informative)

```json
{
  "policySource": "TROUPE",
  "resolvedRuleSource": "category",
  "eventCategory": "match",
  "resolvedMode": "MANDATORY",
  "allowedFormulaIds": ["uuid-parity"],
  "allowedFormulas": [{ "id": "…", "name": "Parité match" }],
  "effectiveFormulaId": "uuid-parity",
  "effectiveFormulaName": "Parité match",
  "selectorVisible": false,
  "requiresFormulaIdOnDraw": false
}
```

### File structure requirements

| File / area | Action |
|-------------|--------|
| `draw/DrawPolicyService.kt` | **CREATE** |
| `draw/DrawPolicyController.kt` (or troupe/season controllers) | **CREATE** |
| `draw/DrawFormulaRuntimeService.kt` | **CREATE** (optional split) |
| `draw/dto/DrawPolicyDtos.kt` | **CREATE** |
| `draw/DrawPolicyResolutionService.kt` | **UPDATE** — full resolution |
| `draw/DrawPolicyValidator.kt` | **UPDATE** |
| `draw/DrawPolicyRepository.kt` | **UPDATE** |
| `draw/DrawModels.kt` | **UPDATE** — extend resolved types if needed |
| `composition/CompositionDrawService.kt` | **UPDATE** — runtime wiring |
| `composition/dto/CompositionDtos.kt` | **UPDATE** — `formulaId` |
| `composition/CompositionExplainabilityService.kt` | **UPDATE** — shared pipeline |
| `composition/CompositionSlotAssignmentService.kt` | **UPDATE** — shared pipeline |
| `availability/AvailabilityService.kt` | **UPDATE** — REF-R12 |
| `openapi/draw-policies.yaml` | **CREATE** |
| `DrawPolicyValidationIntegrationTest.kt` | **UPDATE** — enable |
| `DrawPolicyResolutionGoldenTest.kt` | **UPDATE** — enable |
| `DrawPolicyControllerIntegrationTest.kt` | **CREATE** |
| `apps/web/**` | **DO NOT TOUCH** |

### Explicit non-goals

- Admin UI policy editor → **19.20**
- Orga bandeau + draw modale → **19.21**
- Snapshot formula metadata on draw → **19.22**
- Factor implementations **19.11–19.14** (parked)
- Physical DELETE of policies (upsert-only MVP)
- Requiring `PUBLISHED` on formula **archive** path beyond existing **19.17** 409
- Audit `created_at` on `draw_policies` (deferred **19.16**)

### Dependencies

| Story | Status | Relationship |
|-------|--------|--------------|
| **19.17** | done | Formula CRUD + policy reference scan — **blocks this story** |
| **19.19b** | done | Parameterized pipeline assembly — **blocks runtime** |
| **19.16** | done | Persistence + implicit default — foundation |
| **19.15** | done | Normative spec + ADR |
| **3.5** | done | Organizer delegation / `canManageComposition` |
| **17.7** | done | Category glossary slugs for policy rules |
| **17.8** | done | Event category on Infos tab |
| **19.20** | backlog | **Blocked by this story** — admin UI policies |
| **19.21** | backlog | **Blocked by this story** — orga UI choix |
| **19.22** | backlog | Snapshot extension after **19.21** |

### Previous story intelligence (19.17 + 19.19b/c)

- **Package `com.hatcast.api.draw.*`** — extend controllers/services ; do not duplicate entities.
- **Policy reference scan** in [`DrawFormulaPolicyReferenceService`](../../services/api/src/main/kotlin/com/hatcast/api/draw/DrawFormulaPolicyReferenceService.kt) already parses `defaultRule` + `categoryRules` JSON — reuse UUID extraction pattern.
- **19.17 review:** archive/PATCH policy reference check shared ; cross-troupe 404 ; system formula guards.
- **19.19b:** `DrawFormulaPipelineAssembler.assemble` calls `validateForPublish` — only **`PUBLISHED`** formulas should reach assembly at runtime (fallback if not).
- **19.19c:** Admin UI lists formulas ; **no policy screen yet** — API must be stable for **19.20**.
- **Deferred from 19.16:** `DrawPolicyValidator` PUBLISHED enforcement + scope keys on save → **this story**.

### Git intelligence

Recent commits on baseline `2c231f91`:

- `2c231f91` — merge **19-19c** (admin formula editor UI)
- `6770a2da` — Angular draw formula editor
- `9ed06c45` — merge **19-19b** (factor params runtime)
- `e8a5c902` — parameterized factors in pipeline assembler

Pattern: enable `@Disabled` **19.18** tests ; implement policy service/controller ; extend resolution service ; wire draw path last (highest regression risk) ; run full `./gradlew test`.

### Testing requirements

| Test class | Purpose | AC |
|------------|---------|-----|
| `DrawPolicyValidationIntegrationTest` | REF-V05–V15 HTTP | 16, 9–15 |
| `DrawPolicyResolutionGoldenTest` | REF-R01–R12 resolution | 7–8, 5, 14–15 |
| `DrawPolicyControllerIntegrationTest` | Auth, upsert, GET | 1–4, 7 |
| `DrawPolicyValidatorTest` | Unit REF-V07–V12 | 16–17 |
| `DrawPolicyResolutionServiceTest` | Unit implicit + new paths | 8, regression |
| `DrawGoldenTest` / `DrawOrchestrationGoldenTest` | Unchanged | 12 |
| `DrawFormulaPipelineGoldenTest` | Unchanged REF-F* | 12 |

**CI gate (story):**

```bash
./gradlew -q test --tests 'com.hatcast.api.composition.DrawPolicyValidationIntegrationTest'
./gradlew -q test --tests 'com.hatcast.api.composition.DrawPolicyResolutionGoldenTest'
./gradlew -q test --tests 'com.hatcast.api.draw.DrawPolicy*'
./gradlew -q test --tests 'com.hatcast.api.composition.CompositionDrawIntegrationTest'
./gradlew -q test --tests 'com.hatcast.api.availability.DrawGoldenTest'
```

Full `./gradlew test` before merge.

### Latest tech notes

- **Spring `ObjectProvider<DrawWeightPipeline>`** in draw services exists for **test overrides** — production path should call resolver directly per request; keep test `@TestConfiguration` beans working (**RoleRequestDrawIntegrationTest** pattern).
- **OpenAPI fragments** under `services/api/openapi/` — manual sync (no codegen).
- **Jackson** — `@JsonNaming(LowerCamelCaseStrategy)` on DTOs matching existing draw models.
- **No new Flyway** unless upsert reveals missing index — V65 unique indexes on scope keys already enforce one row per troupe/season.

### Project context reference

- [project-context.md](../../project-context.md) — branch-per-story, `./gradlew test`, package layout
- [draw-formulas-policies-spec.md](../../docs/v2/technical/draw-formulas-policies-spec.md) — normative resolution + validation
- [19-wave-d-test-design.md](../test-artifacts/19-wave-d-test-design.md) — REF-V/R catalogues
- [19-18-policy-api-test-design.md](../test-artifacts/19-18-policy-api-test-design.md) — story test scope

---

## Dev Agent Record

### Agent Model Used

Composer (dev-story 19.18)

### Completion Notes List

- API REST politiques troupe/saison + GET effective pour orga composition.
- Résolution complète (season > troupe > implicit) avec fallbacks catalogue REF-V14/V15.
- Runtime draw/explainability/dispos branchés sur pipeline résolu ; override test `@Primary` conservé.
- Tests : REF-V05–V12 (policy save HTTP), REF-R01–R11 (résolution golden), controller integration, `./gradlew test` green.

### File List

- services/api/src/main/kotlin/com/hatcast/api/draw/dto/DrawPolicyDtos.kt (added)
- services/api/src/main/kotlin/com/hatcast/api/draw/DrawPolicyService.kt (added)
- services/api/src/main/kotlin/com/hatcast/api/draw/DrawPolicyController.kt (added)
- services/api/src/main/kotlin/com/hatcast/api/draw/DrawFormulaRuntimeService.kt (added)
- services/api/src/main/kotlin/com/hatcast/api/draw/DrawPolicyValidator.kt (modified)
- services/api/src/main/kotlin/com/hatcast/api/draw/DrawPolicyResolutionService.kt (modified)
- services/api/src/main/kotlin/com/hatcast/api/draw/DrawPolicyRepository.kt (modified)
- services/api/src/main/kotlin/com/hatcast/api/draw/DrawModels.kt (modified)
- services/api/src/main/kotlin/com/hatcast/api/composition/CompositionDrawService.kt (modified)
- services/api/src/main/kotlin/com/hatcast/api/composition/CompositionExplainabilityService.kt (modified)
- services/api/src/main/kotlin/com/hatcast/api/composition/CompositionSlotAssignmentService.kt (modified)
- services/api/src/main/kotlin/com/hatcast/api/composition/dto/CompositionDtos.kt (modified)
- services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityService.kt (modified)
- services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityController.kt (modified)
- services/api/openapi/draw-policies.yaml (added)
- services/api/openapi/composition.yaml (modified)
- services/api/src/test/kotlin/com/hatcast/api/composition/DrawPolicyValidationIntegrationTest.kt (modified)
- services/api/src/test/kotlin/com/hatcast/api/composition/DrawPolicyResolutionGoldenTest.kt (modified)
- services/api/src/test/kotlin/com/hatcast/api/composition/PolicyGoldenTestSupport.kt (added)
- services/api/src/test/kotlin/com/hatcast/api/draw/DrawPolicyControllerIntegrationTest.kt (added)
- services/api/src/test/kotlin/com/hatcast/api/draw/DrawPolicyRuntimeIntegrationTest.kt (added)

### Change Log

- 2026-06-19 : Story **19.18** created via `bmad-create-story` — Wave D S5 policy API + runtime wiring (Demo 2 gate).
- 2026-06-19 : Implemented policy API, resolution service, draw runtime wiring, OpenAPI, golden/integration tests.
- 2026-06-19 : Code review — 13 patches appliqués ; décision IMPLICIT Option 1 (REF-R01) ; status **done**.

---

### Validation create-story

- [x] AC métier numérotés et sourcés (epics / spec / REF-*)
- [x] Section **Material 3** = **UI : N/A**
- [x] Tasks référencent les numéros d'AC
- [x] Liens vers fichiers code existants à réutiliser
- [x] `./gradlew test` mentionné avec gates ciblés

### Review Findings

- [x] [Review][Decision] Politique **IMPLICIT** CHOICE ≥2 sans `formulaId` au draw — **Résolu (PO, 2026-06-19) : Option 1 — garder REF-R01.** Implicit exempte ; AC 10 clarifié (politique explicite uniquement).

- [x] [Review][Patch] Clarifier AC 10 [`19-18-api-politiques-tirage-troupe-saison.md` AC 10]
- [x] [Review][Patch] Fallback MANDATORY catégorie → `defaultRule` [`DrawPolicyResolutionService.kt`]
- [x] [Review][Patch] Validation MANDATORY `formulaId` post-fallback (AC 9) [`DrawPolicyResolutionService.kt`]
- [x] [Review][Patch] Label catégorie GET effective (AC 7) [`DrawPolicyDtos.kt`]
- [x] [Review][Patch] `resolvedRuleSource` JSON lowercase [`DrawModels.kt`]
- [x] [Review][Patch] Alignement `effectiveFormulaId` / pipeline [`DrawPolicyResolutionService.kt`]
- [x] [Review][Patch] Preview : rejet `formulaId` hors politique [`DrawPolicyResolutionService.kt`]
- [x] [Review][Patch] Propagation `formulaId` explainability / candidats (AC 13)
- [x] [Review][Patch] Tests REF-V13–V15 [`DrawPolicyRuntimeIntegrationTest.kt`]
- [x] [Review][Patch] REF-R12 golden [`DrawPolicyResolutionGoldenTest.kt`]
- [x] [Review][Patch] Tests controller saison / effective [`DrawPolicyControllerIntegrationTest.kt`]
- [x] [Review][Patch] OpenAPI availability + draw [`availability.yaml`, `composition.yaml`]
- [x] [Review][Patch] Transaction read-write pour seed system V1 [`DrawPolicyResolutionService.kt`]

- [x] [Review][Defer] `ObjectProvider<DrawWeightPipeline>` court-circuite la résolution — pattern test voulu (story task 6) [`CompositionDrawService.kt:67-77`] — deferred, pre-existing
- [x] [Review][Defer] Course concurrente sur upsert politique (index unique V65) [`DrawPolicyService.kt:47-63`] — deferred, pre-existing
- [x] [Review][Defer] GET politique 404 ambigu (troupe vs politique absente) [`DrawPolicyService.kt:29-34`] — deferred, pre-existing
- [x] [Review][Defer] Pas de verrou optimiste / ETag sur PUT politique [`DrawPolicyService.kt:60-62`] — deferred, pre-existing
