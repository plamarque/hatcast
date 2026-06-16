---
feature_branch: feat/19-19b-factor-params-runtime-tests
baseline_commit: 81d2b5f834949be07133d6049c35344b7ed67eee
---

# Story 19.19b : Runtime — parameterized factors + golden tests

Status: done

<!-- Ultimate context engine analysis completed — comprehensive developer guide created -->

## Story

As a **troupe admin (via saved formulas)** and **platform maintainer**,  
I want **draw weight factors to read `factorConfig[].params` at runtime** with strict validation on save/publish,  
so that **tuned coefficients affect draw weights correctly**, **invalid params are rejected with French errors**, and **V1 parity is preserved when params are omitted or at catalogue defaults** — unblocking **19.19c** (admin UI coefficients).

**Trigger:** [Sprint Change Proposal 2026-06-16](_bmad-output/planning-artifacts/sprint-change-proposal-2026-06-16-draw-formula-factor-params.md) — Wave D S4b. Normative param catalogue locked in **19.19a** (done). Test catalogue: [_bmad-output/test-artifacts/19-19b-factor-params-test-design.md](../test-artifacts/19-19b-factor-params-test-design.md).

## Acceptance Criteria

### AC1 — Runtime consumes params; defaults = baseline `81d2b5f8`

1. **Given** a published `factorConfig` with enabled factors and **omitted or default** `params` per the locked catalogue table below, **when** `DrawFormulaPipelineAssembler.assemble()` runs, **then** assembled pipeline produces **identical weights** to baseline commit `81d2b5f8` hardcoded constants — golden **REF-F01..F08** in `pipelines.json` **MUST remain bit-identical** (no edits to those fixture entries).
2. **Given** `past_participation` enabled with `params: { "strength": s }`, **when** multiplier is computed, **then** `mult = (1/(1+n))^s` where `n = max(0, pastSelectionCount)` ; `s=1.0` → V1 `1/(1+n)` ; `s=0` → `mult = 1.0` always.
3. **Given** `role_request` enabled with optional params, **when** multiplier is computed, **then** `mult = min(1 + n × bonusPerUnfulfilled, maxBonusMultiplier)` with defaults `bonusPerUnfulfilled=1.0`, `maxBonusMultiplier=10.0` (today's `RoleRequestFactor` constants).
4. **Given** `immediate_replay` enabled, **when** params include `mode` and optional `malusMultiplier`, **then** `EXCLUDE` / default-null mode → exclude on replay (`mult=0`) ; `MALUS` + replay → `mult = malusMultiplier` (default `0.25`) ; `malusMultiplier` ignored at runtime when mode is `EXCLUDE`.
5. **Given** `equity_tag` enabled, **when** assembled, **then** no params consumed (unchanged `CategoryCompartmentFactor` singleton).

**Locked catalogue table (normative — mirror in Kotlin catalogue):**

| factorId | Param key | Type / range | Default | Runtime formula at default |
|----------|-----------|--------------|---------|----------------------------|
| `equity_tag` | — | — | — | `multiplier = 1.0` |
| `past_participation` | `strength` | number `0.0–2.0` | `1.0` | `mult = (1/(1+n))^strength` |
| `immediate_replay` | `mode` | `EXCLUDE` \| `MALUS` | `EXCLUDE` | Same semantics as today |
| | `malusMultiplier` | number `0.0–1.0` | `0.25` | When `mode=MALUS` and replay: `mult = malusMultiplier` |
| `role_request` | `bonusPerUnfulfilled` | number `0.0–5.0` | `1.0` | See AC1.3 |
| | `maxBonusMultiplier` | number `1.0–20.0` | `10.0` | Caps bonus |

[Source: **19.19a** AC2 ; `draw-formulas-policies-spec.md` § Factor catalogue after **19.19a** merge]

### AC2 — Validation REF-P01..P06 on save/publish

6. **Given** formula save or publish, **when** an **enabled** factor has an **unknown param key**, **then** **400** with French message containing `Paramètre inconnu pour <factorId>` (**REF-P01**).
7. **Given** param value **out of documented range**, **when** save/publish, **then** **400** with French range message (**REF-P02**, **REF-P05**).
8. **Given** `immediate_replay` with `mode=EXCLUDE` (or omitted → EXCLUDE) **and** `malusMultiplier` present, **when** save/publish, **then** **400** — `malusMultiplier n'est autorisé que si mode=MALUS` (**REF-P03**).
9. **Given** enabled factor with **no `params` object**, **when** save/publish, **then** **accept** — assembler applies catalogue defaults at runtime (**REF-P04**).
10. **Given** `immediate_replay.params.mode = "OFF"`, **when** save/publish, **then** **400** — normative enum is **`EXCLUDE` \| `MALUS` only** (**REF-P06**). Remove `OFF` from `DrawFormulaValidator.IMMEDIATE_REPLAY_MODES` and from `resolveImmediateReplayMode` (use `enabled:false` on factor to disable).

**French error examples (partial match OK in tests):**

| Ref | Substring |
|-----|-----------|
| REF-P01 | `Paramètre inconnu pour past_participation` |
| REF-P02 | `maxBonusMultiplier doit être entre 1.0 et 20.0` |
| REF-P03 | `malusMultiplier n'est autorisé que si mode=MALUS` |
| REF-P05 | `strength doit être entre 0.0 et 2.0` |
| REF-P06 | reject `OFF` (message mentions `mode`) |

[Source: **19.19a** AC3 ; test design § REF-P*]

### AC3 — Golden extensions; full test suite green

11. **Given** additive fixtures in `validation.json`, **when** `DrawFormulaValidationIntegrationTest` runs, **then** **REF-P01..P06** pass (tags `19.19b`, `REF-P`).
12. **Given** additive fixtures in `pipelines.json`, **when** `DrawFormulaPipelineGoldenTest` runs, **then** **REF-F09..F11** pass (tags `19.19b`, `REF-F`) proving tuned params change weights/% as documented in test design.
13. **Given** this story completes, **when** `./gradlew test` runs on `services/api`, **then** all existing draw golden suites remain green — especially `DrawGoldenTest`, `DrawImmediateReplayGoldenTest`, `DrawRoleRequestGoldenTest`, **REF-F01..F08**, **REF-P1..P4** (Wave A probability IDs — **do not rename**).

**Couverture :** Wave D S4b. **Priorité :** P2. **Depends :** **19.19a** (done), **19.17** (done). **Blocks :** **19.19c**, **19.18** (Demo 2 prep). **UI : N/A.**

---

## Acceptance Criteria — Material 3 (UI)

**UI : N/A** — no changes under `apps/web/` ; Material 3 section omitted intentionally. Coefficient controls → **19.19c**.

---

## Tasks / Subtasks

**Scope:** `services/api/` only. **No** `apps/web/`. **No** normative doc edits unless runtime diverges from **19.19a** spec (fix spec in same PR only if unavoidable).

### 0. Branch, baseline & prerequisite (mandatory)

- [x] Confirm branch `feat/19-19b-factor-params-runtime-tests` ; baseline `81d2b5f834949be07133d6049c35344b7ed67eee`.
- [x] **Pre-flight:** On baseline `81d2b5f8`, `docs/v2/technical/draw-formulas-policies-spec.md` may **lack** **19.19a** amendments. If § Factor catalogue has no `strength` / REF-P rows, **merge or rebase `feat/19-19a-spec-factor-params-draw`** (or cherry-pick its doc commits) **before** implementing — use **19.19a** story AC2 table as authority until merge.

### 1. Shared Kotlin param catalogue (AC1, AC2)

- [x] Add `DrawFactorParamCatalog.kt` (or equivalent) under `com.hatcast.api.draw` — **single source** for param keys, types, inclusive ranges, defaults, allowed enum values. Used by **both** `DrawFormulaValidator` and `DrawFormulaPipelineAssembler`.
- [x] Export factor `direction` enum (`MALUS` | `BONUS` | `NEUTRAL`) as metadata only (for **19.19c** TS mirror documented in spec) — **not** persisted in `factorConfig`.
- [x] Parse `Map<String, Any>?` safely (Jackson may deliver `Double`/`Int`/`String`) — coerce numbers with validation, reject non-numeric where number expected.

### 2. Parameterized factor classes (AC1)

- [x] Refactor `PastParticipationFactor` from `object` → class with `strength: Double` (default `1.0`). Keep companion defaults = catalogue. Update `DrawWeightPipelines.DEFAULT` to use default instance.
- [x] Refactor `RoleRequestFactor` from `object` → class with `bonusPerUnfulfilled`, `maxBonusMultiplier`. Keep companion constants as defaults.
- [x] Extend `ImmediateReplayFactor` constructor: `mode` + `malusMultiplier: Double = 0.25`. Keep `MALUS_MULTIPLIER` companion = default.
- [x] Update all call sites: `DrawWeightPipelines`, tests, `ChanceBreakdownCalculator` if it references factor types — **grep** `PastParticipationFactor`, `RoleRequestFactor` across `services/api/`.

### 3. Assembler wiring (AC1)

- [x] In `DrawFormulaPipelineAssembler.assemble()`, read each enabled entry's `params` via catalogue ; instantiate parameterized factor instances.
- [x] Preserve factor order from `factorConfig` list (unchanged contract).
- [x] `resolveImmediateReplayMode`: drop `OFF` branch ; null/`EXCLUDE` → `EXCLUDE` ; `MALUS` → `MALUS`.

### 4. Validator — REF-P01..P06 (AC2)

- [x] Extend `DrawFormulaValidator.validateForSave()` (and thus publish) with param validation for **enabled** implemented factors only.
- [x] Implement REF-P01 (unknown keys), REF-P02/P05 (range), REF-P03 (malusMultiplier + EXCLUDE), REF-P04 (implicit — no validator reject on missing params), REF-P06 (reject `OFF`).
- [x] Validate **disabled** factors: ignore `params` or validate leniently — prefer **skip param validation when `enabled=false`** (matches **19.17** draft patterns).
- [x] Optional: add `DrawFormulaValidatorTest` (unit, no Spring) for REF-P01..P06 — recommended per test design.

### 5. Golden fixtures — validation (AC3)

- [x] Append **REF-P01..P06** to `services/api/src/test/resources/draw/golden/policies/validation.json` — copy payloads from [19-19b-factor-params-test-design.md](../test-artifacts/19-19b-factor-params-test-design.md).
- [x] Tag entries `"tags": ["19.19b", "REF-P"]`.
- [x] **Do not modify** REF-V01..V15 or REF-P1..P4 probability fixtures.

### 6. Golden fixtures — pipelines (AC3)

- [x] Append **REF-F09..F11** to `services/api/src/test/resources/draw/golden/formulas/pipelines.json` — **do not edit** REF-F01..F08 entries.
- [x] **REF-F09** (`strength=1.5`): expected weights REF-W2 → `0.625`, REF-W3 → `≈0.3849` (4 dp).
- [x] **REF-F10** (`bonusPerUnfulfilled=0.5`, `maxBonusMultiplier=5.0`): add `draw/golden/role-request/bonus-tuned.json` with `RR-BOUBOU-TUNED` / `RR-N1-TUNED` — **do not modify** existing `bonus.json`.
- [x] **REF-F11** (`mode=MALUS`, `malusMultiplier=0.5`): add `draw/golden/immediate-replay/exclude-malus-tuned.json` with `IR-ML1-TUNED` / `IR-W2-TUNED`.
- [x] Extend `DrawFormulaPipelineGoldenTest.assertWeightAssertion()` to honor inline `expectedWeight` + `input` on `weightAssertions` when present (preferred over new REF-W* ids) — see test design § REF-F09.

### 7. Unit tests (AC1, AC3)

- [x] Extend `PastParticipationFactorTest`: `strength=1` (V1 parity), `1.5`, `0` → mult 1.0, `2`.
- [x] Extend `RoleRequestFactorTest`: defaults = constants ; tuned bonusPerUnfulfilled ; cap maxBonusMultiplier.
- [x] Extend `ImmediateReplayFactorTest`: custom `malusMultiplier` vs default `0.25`.
- [x] Extend `DrawFormulaPipelineAssemblerTest`: REF-P04 — config without `params` → weights match REF-F01 / REF-W2.

### 8. Regression gate (AC3)

- [x] Run gate commands (test design § Gate CI):
  ```bash
  ./gradlew -q test --tests 'com.hatcast.api.availability.DrawFormulaValidationIntegrationTest'
  ./gradlew -q test --tests 'com.hatcast.api.availability.DrawFormulaPipelineGoldenTest'
  ./gradlew -q test --tests 'com.hatcast.api.draw.DrawFormulaPipelineAssemblerTest'
  ./gradlew -q test --tests 'com.hatcast.api.availability.DrawGoldenTest'
  ./gradlew -q test --tests 'com.hatcast.api.availability.DrawImmediateReplayGoldenTest'
  ./gradlew -q test --tests 'com.hatcast.api.availability.DrawRoleRequestGoldenTest'
  ```
- [x] Full `./gradlew test` green before review.

---

## Dev Notes

### Product and UX rules

- **Why now:** **19.17** CRUD persists arbitrary `params` JSON but runtime ignores all params except `immediate_replay.mode`. Admin UI (**19.19c**) cannot ship until math + validation are proven here.
- **V1 parity gate:** Production draw still uses `DrawWeightPipelines.DEFAULT` until **19.18** wires policies — this story must **not** change DEFAULT behavior at default params.
- **Naming collision:** Validation param refs = **REF-P01..P06** (two digits). Wave A probability refs = **REF-P1..P4** — never rename the latter.

### Current runtime state (READ BEFORE EDITING)

| File | Today | This story changes |
|------|-------|-------------------|
| [`DrawFormulaPipelineAssembler.kt`](../../services/api/src/main/kotlin/com/hatcast/api/draw/DrawFormulaPipelineAssembler.kt) | Singleton factors ; `mode` only for replay ; accepts `OFF` | Param catalogue ; parameterized instances ; drop `OFF` |
| [`DrawFormulaValidator`](../../services/api/src/main/kotlin/com/hatcast/api/draw/DrawFormulaPipelineAssembler.kt) L100–110 | `immediate_replay.mode` in `{OFF, EXCLUDE, MALUS}` | Full REF-P* ; enum `{EXCLUDE, MALUS}` only |
| [`PastParticipationFactor.kt`](../../services/api/src/main/kotlin/com/hatcast/api/availability/draw/PastParticipationFactor.kt) | `object` ; `1/(1+n)` hardcoded | Class + `strength` param |
| [`RoleRequestFactor.kt`](../../services/api/src/main/kotlin/com/hatcast/api/availability/draw/RoleRequestFactor.kt) | `object` ; companion constants | Class + tunable bonus params |
| [`ImmediateReplayFactor.kt`](../../services/api/src/main/kotlin/com/hatcast/api/availability/draw/ImmediateReplayFactor.kt) | Class ; fixed `MALUS_MULTIPLIER` | Constructor `malusMultiplier` |
| [`DrawWeightPipelines.kt`](../../services/api/src/main/kotlin/com/hatcast/api/availability/draw/DrawWeightPipeline.kt) | Uses factor singletons | Default parameterized instances |
| [`DrawModels.kt`](../../services/api/src/main/kotlin/com/hatcast/api/draw/DrawModels.kt) | `params: Map<String, Any>?` | **No schema change** |

**Must preserve:**

- `DrawFormulaValidator.IMPLEMENTED_FACTOR_IDS` / `RESERVED_FACTOR_IDS` sets
- Factor order semantics: `finalWeight = base × Π factorMultiplier`
- `DrawFormulaPipelineGoldenTest.resolvePipelineRef()` — still used by REF-F01..F08 ; may need extension if parameterized pipelines cannot map to static refs (REF-F09+ use inline assertions, not `pipelineRef`)
- Explainability labels on factors (`adjustmentLabel`) — **no copy change required** for MVP ; tuned strength does not need new label text (**19.7** optional follow-up)

### Refactor pattern (recommended)

```kotlin
// DrawFactorParamCatalog.kt — illustrative
data class PastParticipationParams(val strength: Double = 1.0) {
    fun multiplier(past: Int): Double =
        if (strength == 0.0) 1.0 else (1.0 / (1.0 + max(0, past))).pow(strength)
}
```

- Keep **companion object defaults** on factor classes matching catalogue for `DrawWeightPipelines.DEFAULT`.
- `DrawWeightPipelines.withImmediateReplay(mode)` — pass default `malusMultiplier=0.25` for backward compat in Wave A tests.

### Architecture compliance

- **Authority:** [`draw-formulas-policies-spec.md`](../../docs/v2/technical/draw-formulas-policies-spec.md) § Factor catalogue + § Validation matrix (post-**19.19a**) ; [`draw-weight-engine-v1-spec.md`](../../docs/v2/technical/draw-weight-engine-v1-spec.md) § parameterized formulas ; [ADR 0019](../../docs/adr/0019-draw-weight-engine.md).
- **No API shape change:** **19.17** endpoints unchanged ; validation stricter on existing JSON field.
- **No Flyway / DB migration.**
- **Production draw path:** `AvailabilityChanceCalculator` + `DrawWeightPipelines.DEFAULT` unchanged at defaults — formula assembler path exercised via golden + future **19.18**.

### File structure requirements

| Action | Path |
|--------|------|
| **NEW** | `services/api/src/main/kotlin/com/hatcast/api/draw/DrawFactorParamCatalog.kt` (name flexible) |
| **UPDATE** | `DrawFormulaPipelineAssembler.kt` (validator in same file today — may split validator to own file if cleaner) |
| **UPDATE** | `PastParticipationFactor.kt`, `RoleRequestFactor.kt`, `ImmediateReplayFactor.kt` |
| **UPDATE** | `DrawWeightPipeline.kt` (`DrawWeightPipelines` object) |
| **UPDATE** | `validation.json`, `pipelines.json` |
| **NEW** | `draw/golden/role-request/bonus-tuned.json` |
| **NEW** | `draw/golden/immediate-replay/exclude-malus-tuned.json` |
| **UPDATE** | `DrawFormulaPipelineGoldenTest.kt` (inline weight assertions) |
| **UPDATE** | `PastParticipationFactorTest.kt`, `RoleRequestFactorTest.kt`, `ImmediateReplayFactorTest.kt`, `DrawFormulaPipelineAssemblerTest.kt` |
| **NEW (recommended)** | `DrawFormulaValidatorTest.kt` |
| **DO NOT EDIT** | `apps/web/**` ; REF-F01..F08 fixture bodies ; REF-P1..P4 ; Wave A `weights.json` / `probabilities.json` core entries |

### Testing requirements

- Primary authority: [_bmad-output/test-artifacts/19-19b-factor-params-test-design.md](../test-artifacts/19-19b-factor-params-test-design.md) — risk matrix R-19.19b-01..07.
- **REF-F09 weight math:** REF-W2 input `n=3, required=5`, `strength=1.5` → `(1/4)^1.5 × 5 = 0.625`.
- **REF-F10 RR-BOUBOU tuned:** mult_B = min(1+7×0.5, 5) = 4.5 → B **82%**, P **18%** (±1 tolerance).
- **REF-F11 IR-ML1 tuned:** malus 0.5 → A **67%**, B **33%** (±1).
- Tag new tests `@Tag("19.19b")` where applicable.

### Explicit non-goals

- Angular admin editor, `draw-factor-catalog.ts` → **19.19c**
- Draw policy runtime / effective formula at draw → **19.18**
- Preview POST `%` live → OQ-19-03 waivable
- Snapshot formula metadata → **19.22**
- Shipping factors **19.11–19.14**
- Changing `DrawWeightPipelines.DEFAULT` factor **set** (still equity_tag + past_participation only)

### Dependencies

| Story | Status | Relationship |
|-------|--------|----------------|
| **19.19a** | done | Normative param catalogue + REF-P rules — **merge docs before dev if missing on branch** |
| **19.17** | done | CRUD persists `params` ; validation extended here |
| **19.16** | done | `factor_config` JSON column |
| **19.19c** | backlog | **Blocked by this story** — UI coefficients |
| **19.18** | backlog | Runtime policy ; consumes assembled pipelines |
| **19-19-ui-admin-editeur-formules** | cancelled | Do not implement monolithic 19.19 |

---

## Previous story intelligence

### From **19.19a** (spec — done)

- Locked catalogue table and REF-P01..P05 (+ **REF-P06** `OFF` rejection from code review handoff).
- Review finding: runtime currently accepts `OFF` — **this story must reject** per normative enum.
- Review finding: **19.19a** doc commits may still be on `feat/19-19a-spec-factor-params-draw` — verify merge.
- Handoff stub fixture IDs: **REF-F09** (`strength=1.5`), **REF-F10**, **REF-F11** documented in spec § Handoff to 19.19b.
- OQ-P1 locked: `(1/(1+n))^strength` ; OQ-P2: per-param replay/role_request, single strength for past_participation.

### From **19.17** (API CRUD — done)

- `DrawFactorConfigEntry.params: Map<String, Any>?` — sufficient ; no DTO change.
- `validateForSave` vs `validateForPublish` split — param validation on **both** paths.
- Golden **REF-F01..F08** prove assembler parity — **immutable** in this story.
- `DrawFormulaValidationIntegrationTest` loads all `validation.json` entries by `function` — REF-P* auto-picked when added.

### From test design **19-19b** (TEA)

- Full JSON payloads for REF-P01..P06 ready to copy.
- Prefer inline `expectedWeight` on pipeline golden over new REF-W* ids.
- CI gate commands listed in Tasks §8.

---

## Git intelligence summary

Recent Epic 19 commits on baseline `81d2b5f8`:

| Commit | Relevance |
|--------|-----------|
| `81d2b5f8` merge **19.17** | **Baseline** — assembler + validator + REF-F golden |
| `f319d5c0` draw formula API | Controller, `validation.json`, `pipelines.json` |
| `3ed9b7a8` merge **19.16** | Flyway V64/V65, system V1 seed |
| `e6eebeb8` merge **19.15** | Policies spec created |

**Pattern:** Wave D = docs (**19.15**, **19.19a**) → API persistence (**16–17**) → **this story** (runtime proof) → UI (**19.19c**).

---

## Latest tech information

- **Kotlin/Spring Boot:** No new dependencies. Use existing Jackson `Map<String, Any>` parsing patterns from **19.17** controller layer.
- **`kotlin.math.pow`:** Available for `(1/(1+n)).pow(strength)` — prefer over manual log/exp.
- **JUnit 5 `@Tag`:** Already used (`19.17`, `REF-F`, `REF-V`) — add `19.19b`, `REF-P` consistently.

---

## Project context reference

- [project-context.md](../../project-context.md) — story branch `feat/19-19b-factor-params-runtime-tests` until merge after review.
- [AGENTS.md](../../AGENTS.md) — no SPEC/DOMAIN update required unless observable product behavior changes (admin can already save params — validation/runtime change is internal until **19.19c** surfaces UI).
- Commit format: `feat(api): …` per [COMMIT_MESSAGE_GUIDELINES.md](../../docs/shared/technical/COMMIT_MESSAGE_GUIDELINES.md).

---

## Dev Agent Record

### Agent Model Used

Composer (dev-story 2026-06-16)

### Completion Notes List

- Added `DrawFactorParamCatalog` as single source for param keys, ranges, defaults, parsing, and `FactorDirection` metadata.
- Refactored `PastParticipationFactor`, `RoleRequestFactor`, `ImmediateReplayFactor` to parameterized classes; `DrawWeightPipelines.DEFAULT` unchanged at default params (V1 parity).
- `DrawFormulaValidator` validates REF-P01..P06 on save/publish for enabled factors; `OFF` mode rejected; disabled factor params skipped.
- Golden fixtures REF-P01..P06 (validation.json) and REF-F09..F11 (pipelines.json + tuned JSON) added; REF-F01..F08 untouched.
- `DrawFormulaPipelineGoldenTest` supports inline `expectedWeight` + `input` on weight assertions.
- All gate commands + full `./gradlew test` green on `feat/19-19b-factor-params-runtime-tests`.

### File List

- `services/api/src/main/kotlin/com/hatcast/api/draw/DrawFactorParamCatalog.kt` (NEW)
- `services/api/src/main/kotlin/com/hatcast/api/draw/DrawFormulaPipelineAssembler.kt`
- `services/api/src/main/kotlin/com/hatcast/api/availability/draw/PastParticipationFactor.kt`
- `services/api/src/main/kotlin/com/hatcast/api/availability/draw/RoleRequestFactor.kt`
- `services/api/src/main/kotlin/com/hatcast/api/availability/draw/ImmediateReplayFactor.kt`
- `services/api/src/main/kotlin/com/hatcast/api/availability/draw/DrawWeightPipeline.kt`
- `services/api/src/main/kotlin/com/hatcast/api/availability/draw/ChanceBreakdownCalculator.kt`
- `services/api/src/test/kotlin/com/hatcast/api/draw/DrawFormulaValidatorTest.kt` (NEW)
- `services/api/src/test/kotlin/com/hatcast/api/draw/DrawFormulaPipelineAssemblerTest.kt`
- `services/api/src/test/kotlin/com/hatcast/api/availability/draw/PastParticipationFactorTest.kt`
- `services/api/src/test/kotlin/com/hatcast/api/availability/draw/RoleRequestFactorTest.kt`
- `services/api/src/test/kotlin/com/hatcast/api/availability/draw/ImmediateReplayFactorTest.kt`
- `services/api/src/test/kotlin/com/hatcast/api/availability/draw/CategoryCompartmentFactorTest.kt`
- `services/api/src/test/kotlin/com/hatcast/api/availability/draw/DrawWeightPipelineTest.kt`
- `services/api/src/test/kotlin/com/hatcast/api/availability/DrawFormulaPipelineGoldenTest.kt`
- `services/api/src/test/resources/draw/golden/policies/validation.json`
- `services/api/src/test/resources/draw/golden/formulas/pipelines.json`
- `services/api/src/test/resources/draw/golden/role-request/bonus-tuned.json` (NEW)
- `services/api/src/test/resources/draw/golden/immediate-replay/exclude-malus-tuned.json` (NEW)

### Change Log

- 2026-06-16 : Story created — Wave D S4b runtime + golden per SCP 2026-06-16 and TEA test design.
- 2026-06-16 : Implemented runtime param catalogue, parameterized factors, REF-P/REF-F golden extensions; full test suite green.
- 2026-06-16 : Code review approved — status done ; patch REF-P01 message harmonization.

---

### Review Findings

- [x] [Review][Patch] NaN/Infinity bypass validation des params numériques — garde `value.isFinite()` ajouté dans `DrawFactorParamCatalog.requireDoubleInRange` + test `non-finite numeric param rejected`.
- [x] [Review][Patch] Implémentation non commitée — résolu : commit `e8a5c902` sur `feat/19-19b-factor-params-runtime-tests`.
- [x] [Review][Patch] Test REF-P03 variante mode omis — `malusMultiplier without mode rejected` ajouté dans `DrawFormulaValidatorTest`.
- [x] [Review][Patch] Messages REF-P01 incohérents — `rejectUnknownKeys` harmonisé avec `validateNoParams` (`Paramètre inconnu pour $factorId : $key`).
- [x] [Review][Defer] Golden REF-P uniquement `formulaSave` — chemin `formulaPublish` non couvert par fixtures HTTP ; `validateForPublish` délègue à `validateForSave` donc comportement OK — deferred, pre-existing pattern 19.17.
- [x] [Review][Defer] Messages FR non assertés en intégration — `DrawFormulaValidationIntegrationTest` ne vérifie que le status HTTP ; substrings couverts par `DrawFormulaValidatorTest` — deferred, couverture unitaire suffisante pour MVP.
- [x] [Review][Defer] Artefact test design absent du dépôt — `19-19b-factor-params-test-design.md` référencé dans la story mais non versionné ; payloads présents dans golden JSON — deferred, traçabilité TEA.
- [x] [Review][Defer] Spec normative 19.19a non mergée sur branche — `draw-formulas-policies-spec.md` sans `strength`/`malusMultiplier` ; runtime aligné sur table AC story — deferred, merge doc 19.19a séparé.
- [x] [Review][Defer] `@Tag("19.19b")` absent sur `DrawFormulaPipelineGoldenTest` — fixtures JSON taguées mais pas la classe — deferred, filtrage CI par tags JSON suffisant pour MVP.

### Validation create-story

- [x] AC métier numérotés et sourcés (epics / **19.19a** / test design)
- [x] Section **Material 3** → **UI : N/A**
- [x] Tasks référencent les numéros d'AC
- [x] Liens vers fichiers code existants à modifier
- [x] `./gradlew test` gate commands documentés
- [x] REF-F01..F08 immutability explicit
- [x] REF-P vs REF-P1..P4 naming collision documented
