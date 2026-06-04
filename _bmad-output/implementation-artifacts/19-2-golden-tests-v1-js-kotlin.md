---
baseline_commit: a6ca73d0e0e3632a7ba305482749d66f60e19c37
---

# Story 19.2 : Suite golden V1 JS ↔ Kotlin

Status: review

## Story

En tant que **développeur**,  
je veux des **tests golden** comparant V1 et V2 sur poids, % et tirage,  
afin de **détecter toute dérive** lors des refactors.

## Acceptance Criteria

1. **Given** fixtures JSON (`services/api/src/test/resources/draw/golden/`), **when** `./gradlew test`, **then** tests Kotlin valident poids et `chancePercent` vs valeurs de référence **figées dans la spec normative** (§ Golden test contract — **pas** `chancesLogic.js` ni `legacy/`). [Source: epics 19.2 AC1 ; `draw-weight-engine-v1-spec.md`]
2. **Given** `performWeightedDraw` avec **`Random` seedé** (`kotlin.random.Random(seed)`), **when** scénarios à candidat unique ou poids dominants, **then** sélection **déterministe** assertée (REF-D1, REF-D2, REF-D3). [Source: epics 19.2 AC2]
3. **Given** cas multi-places (ex. 5 places / 8 candidats, poids égaux), **when** `exactSelectionProbability` / `scoreCandidates`, **then** % alignés à **±1 point** seulement quand spec l'autorise ; sinon exact. [Source: epics 19.2 AC3 ; ADR 0019]
4. **Given** CI (`api-test.yml`), **when** PR touche `AvailabilityChanceCalculator` ou `CompositionDrawService`, **then** suite golden exécutée via `./gradlew test` (module API). [Source: epics 19.2 AC4]
5. **Couverture :** NFR-Q1. **UI : N/A**. **Priorité :** P1. **Depends :** 19.1.

---

## Acceptance Criteria — Material 3 (UI)

**UI : N/A** — pas de changement sous `apps/web/`.

---

## Tasks / Subtasks

- [x] **Périmètre :** `services/api/` tests uniquement — **ne pas modifier** `AvailabilityChanceCalculator.kt` sauf bug prouvé vs spec ; **ne pas toucher** `CompositionDrawService`, `apps/web/`, `legacy/`.
- [x] **Test design** — suivre [`_bmad-output/test-artifacts/19-2-golden-test-design.md`](../test-artifacts/19-2-golden-test-design.md) à la lettre.
- [x] **Fixtures JSON** — créer `services/api/src/test/resources/draw/golden/` :
  - [x] `weights.json` — REF-W1..W3, T-INV1, T-W4
  - [x] `probabilities.json` — REF-P1..P4, T-P5..P7, T-S1
  - [x] `draws.json` — REF-D1..D3, T-D4, T-D5
  - [x] `edges.json` — REF-E1, REF-E2
- [x] **Runner** — `DrawGoldenTest.kt` : charge JSON, dispatch `function`, assert `expected` + `tolerancePercent`, ID dans messages d'échec.
- [x] **Helpers** — `exact`, `percentTolerance(±1)`, `doubleEpsilon(1e-12)` pour REF-D2/D3 `randomValue`.
- [x] **Déduplication** — retirer tests unitaires redondants avec catalogue REF dans `AvailabilityChanceCalculatorTest.kt` / `DrawTest.kt` (garder smoke si utile).
- [x] **CI** — documenter dans `services/api/README.md` § Tests : golden gate sur PR touchant calculator/draw service (`api-test.yml` existant).
- [x] **Gate** — `./gradlew :services:api:test` vert (golden + calculator tests).

---

## Definition of Done

- [x] Tous les IDs **REF-W1..REF-E2** présents en fixtures JSON avec `id` stable.
- [x] Tous les IDs **T-P5, T-P6, T-P7, T-D4, T-D5, T-INV1, T-W4, T-S1** implémentés.
- [x] REF-D2 : `Random(42)`, weights `[3,1,1]`, index **0**, `randomValue ≈ 1.1315763298615888`, `totalWeight = 5.0`.
- [x] REF-D3 : `Random(7)`, weights `[10,1]`, index **1**, `randomValue ≈ 10.533073649264582`, `totalWeight = 11.0`.
- [x] REF-P4 : past `{A:2, B:0}` → A **25%**, B **75%**, B > A.
- [x] `performWeightedDraw` golden : **jamais** `Random.Default`.
- [x] `./gradlew -q :services:api:test --tests 'com.hatcast.api.availability.DrawGoldenTest' --tests 'com.hatcast.api.availability.AvailabilityChanceCalculator*'` vert.
- [x] Suite API complète verte.
- [x] Story → `review` ; sprint-status `19-2-golden-tests-v1-js-kotlin: review`.

---

## Dev Notes

### Normative sources (read order)

1. [`docs/v2/technical/draw-weight-engine-v1-spec.md`](../../docs/v2/technical/draw-weight-engine-v1-spec.md) § **Golden test contract (19.2 handoff)**
2. [`docs/adr/0019-draw-weight-engine.md`](../../docs/adr/0019-draw-weight-engine.md)
3. [`_bmad-output/test-artifacts/19-2-golden-test-design.md`](../test-artifacts/19-2-golden-test-design.md)
4. [`AvailabilityChanceCalculator.kt`](../../services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityChanceCalculator.kt) + tests existants

### Forbidden

- `legacy/**`
- `scripts/replay/chancesLogic.js` (runtime)
- Modifier `CompositionDrawService.kt`
- Modifier l'algo Kotlin sans écart spec documenté

### Handoff 19.3 (hors scope)

Story **19.3** — orchestration draw complet : full/partial redraw, cross-role exclusion, invariant poids draw = % summary, snapshots **6.14** (G-03). Ne pas implémenter dans 19.2.

### Previous story (19.1)

- Vecteurs REF figés dans spec § Minimum frozen reference catalog.
- Helper optionnel : [`scripts/draw/freeze-golden-vectors.kts`](../../scripts/draw/freeze-golden-vectors.kts).

### Explicit non-goals

- Orchestration `CompositionDrawService` → **19.3**
- Compartiment category / G-01 → **19.8**
- Snapshots 6.14 / E-04
- G-02 current-event edge in draw-time history

---

## Dev Agent Record

### Agent Model Used

Composer

### Completion Notes List

- Implemented 20 golden fixtures (REF-W1..REF-E2 + 8 T-* cases) as JSON under `src/test/resources/draw/golden/`.
- Added `DrawGoldenFixture.kt` loader + `DrawGoldenTest.kt` parameterized runner with function dispatch, ±1% tolerance, and `1e-12` double epsilon.
- Trimmed redundant unit tests in `AvailabilityChanceCalculatorTest` / `DrawTest` — kept smoke tests only.
- Documented golden gate in `services/api/README.md`; CI already runs full suite via `api-test.yml`.
- No production code changes (`AvailabilityChanceCalculator.kt` untouched).

### File List

- `services/api/src/test/resources/draw/golden/weights.json` (new)
- `services/api/src/test/resources/draw/golden/probabilities.json` (new)
- `services/api/src/test/resources/draw/golden/draws.json` (new)
- `services/api/src/test/resources/draw/golden/edges.json` (new)
- `services/api/src/test/kotlin/com/hatcast/api/availability/DrawGoldenFixture.kt` (new)
- `services/api/src/test/kotlin/com/hatcast/api/availability/DrawGoldenTest.kt` (new)
- `services/api/src/test/kotlin/com/hatcast/api/availability/AvailabilityChanceCalculatorTest.kt` (modified)
- `services/api/src/test/kotlin/com/hatcast/api/availability/AvailabilityChanceCalculatorDrawTest.kt` (modified)
- `services/api/README.md` (modified)

### Change Log

- 2026-06-04 — Story 19.2 golden fixture suite for draw calculator (Epic 19 Wave A).
