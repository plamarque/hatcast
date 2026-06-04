# Epic 19 — Story 19.2 Golden Test Design

## Purpose

Design a golden regression suite for `AvailabilityChanceCalculator` that freezes Wave A behavior and detects drift during refactors (notably 19.5+ pipeline work), without testing orchestration concerns assigned to later stories.

Normative authority order:
1. `docs/v2/technical/draw-weight-engine-v1-spec.md` (section `Golden test contract (19.2 handoff)`)
2. `docs/adr/0019-draw-weight-engine.md`
3. Story context in `_bmad-output/planning-artifacts/epics.md` (`Story 19.2`)
4. Existing Kotlin runtime behavior in `AvailabilityChanceCalculator.kt`

---

## 1) Scope IN / OUT (19.2)

| IN | OUT (story handoff) |
|----|----------------------|
| `weightForParticipant` | `CompositionDrawService` orchestration -> **19.3** |
| `toWeightedCandidates` | Category compartment deep parity / G-01 -> **19.8** |
| `exactSelectionProbability` | Snapshots semantics (`6.14`) / E-04 |
| `scoreCandidates` | |
| `performWeightedDraw` | |
| JSON fixtures under `services/api/src/test/resources/draw/golden/` | |
| Injectable random seam with `kotlin.random.Random(seed)` | |
| Minimum frozen catalog `REF-W1..REF-E2` | G-02 edge (current event in draw-time history count) |

Clarification for 19.2:
- Legacy V1 files and `scripts/replay/chancesLogic.js` are not used as runtime inputs for implementation.
- 19.2 validates calculator behavior only; integration-level behavior is deferred to 19.3.

---

## 2) Risk Matrix

| Risk ID | Description | Impact | Probability | Mitigating test IDs | Priority |
|--------|-------------|--------|-------------|---------------------|----------|
| R-19.2-01 | Weight formula drift (`malus x requiredCount`) in `weightForParticipant` or factorization prep | Critical | Medium | REF-W1, REF-W2, REF-W3, T-INV1 | P0 |
| R-19.2-02 | `exactSelectionProbability` drift on multi-place cases (approximation logic or equal-weight epsilon), breaking expected `%` | Critical | Medium | REF-P3, T-P6, T-P7 | P0 |
| R-19.2-03 | Wrong tolerance policy (accepting too much or rejecting valid expected approximation), hiding regressions | High | Medium | REF-P3, T-P6, T-P7 (explicit tolerance assertions) | P0 |
| R-19.2-04 | Non-deterministic draw due to incorrect `Random` seam use (default random, seed not injected) | Critical | Low | REF-D1, REF-D2, REF-D3, T-D5 | P0 |
| R-19.2-05 | Silent regression after 19.5 refactor (`DrawWeightFactor` pipeline) while tests remain too shallow | Critical | Medium | Full REF catalog + T-INV1 + CI gate (all golden on touched files) | P0 |
| R-19.2-06 | Sorting/rounding regression in `scoreCandidates` (descending order by `chancePercent`, `Math.round` semantics) | High | Medium | REF-P4, T-P7, T-S1 | P1 |
| R-19.2-07 | Cumulative boundary bug in `performWeightedDraw` (`randomValue` very close to total weight, `<=` logic) | High | Low | T-D4 | P1 |
| R-19.2-08 | Invariant break between `toWeightedCandidates` and downstream scoring/draw (`% = draw weights`) | High | Medium | T-INV1, REF-P4 | P1 |
| R-19.2-09 | Empty/zero-weight edge cases mishandled (`null` vs crash, `%` not zeroed) | Medium | Medium | REF-E1, REF-E2, T-W4 | P1 |
| R-19.2-10 | Confusion with orchestration/snapshot concerns (E-04) introducing false failures in 19.2 suite | Medium | High | Documentation-only guard; OUT-of-scope explicit exclusions | P2 |

Non-tested-in-19.2 by design:
- E-04 (`captureOpeningDrawSnapshots` vs per-step `%` in draw orchestration) is documented but not asserted here.
- G-02 current-event edge during draw-time history counting remains out of 19.2 scope.

---

## 3) Test Case Catalog

### 3.1 Mandatory frozen references (verbatim from normative spec)

All IDs below must be implemented exactly as frozen references from `draw-weight-engine-v1-spec.md` section `Minimum frozen reference catalog`.

| ID | Function | Input | Expected | Tolerance |
|----|----------|-------|----------|-----------|
| REF-W1 | `weightForParticipant` | `past=0, required=5` | `5.0` | exact |
| REF-W2 | `weightForParticipant` | `past=3, required=5` | `1.25` | exact |
| REF-W3 | `weightForParticipant` | `past=2, required=2` | `0.6667` (4dp) | exact at 4dp |
| REF-P1 | `scoreCandidates` | 3 candidates, `required=1`, equal past | `[33, 33, 33]` (any order) | exact |
| REF-P2 | `scoreCandidates` | 2 candidates, `required=1`, equal past | `[50, 50]` | exact |
| REF-P3 | `scoreCandidates` | 8 candidates, `required=5`, equal past, weight 1 each | each `chancePercent = 63` | exact |
| REF-P4 | `scoreCandidates` | 2 candidates, `required=1`, past `{A:2, B:0}` | A = `25`, B = `75` (B > A) | exact |
| REF-D1 | `performWeightedDraw` | 1 candidate weight 5, `Random(42)` | selected index `0` | exact |
| REF-D2 | `performWeightedDraw` | weights `[3, 1, 1]`, `Random(42)` | selected index `0`; `totalWeight=5.0`; `randomValue ~= 1.1315763298615888` | exact for index, epsilon for doubles |
| REF-D3 | `performWeightedDraw` | weights `[10, 1]`, `Random(7)` | selected index `1`; `totalWeight=11.0`; `randomValue ~= 10.533073649264582` | exact for index, epsilon for doubles |
| REF-E1 | edge | empty candidates | `null` draw / empty score list | exact |
| REF-E2 | edge | zero weight | `null` draw / `0%` scoring | exact |

Detailed verification for REF-D2 and REF-D3:

- REF-D2:
  - Seed: `Random(42)`
  - Weights: `[3, 1, 1]`, `totalWeight=5.0`
  - First random factor: `nextDouble() ~= 0.22631526597231776`
  - Computed `randomValue`: `0.226315... * 5.0 = 1.1315763298615888`
  - Cumulative walk:
    - index 0 cumulative = 3.0 -> `1.131576... <= 3.0` -> selected index `0`

- REF-D3:
  - Seed: `Random(7)`
  - Weights: `[10, 1]`, `totalWeight=11.0`
  - Computed `randomValue ~= 10.533073649264582`
  - Cumulative walk:
    - index 0 cumulative = 10.0 -> not selected
    - index 1 cumulative = 11.0 -> selected index `1`

### 3.2 Recommended additional tests (T-*)

Implement 8 supplementary tests to harden regression detection:

| ID | Function | Input | Assertion |
|----|----------|-------|-----------|
| T-P5 | `exactSelectionProbability` / `scoreCandidates` | 1 place, weights ratio `3:1` (e.g., past `{A:0, B:2}` with `required=1`) | exact `75% / 25%` |
| T-P6 | `exactSelectionProbability` | multi-places with unbalanced weights (e.g., 5 places, 8 candidates with one high weight and seven low) | expected values within `+-1` percentage point |
| T-P7 | `scoreCandidates` | mixed weights producing close probabilities | verify half-up rounding and not floor/ceil drift |
| T-D4 | `performWeightedDraw` | crafted RNG producing `randomValue` close to `totalWeight` boundary | verify cumulative walk and no off-by-one at upper edge |
| T-D5 | `performWeightedDraw` | same fixture and same seed repeated 100 runs | identical selected index every run |
| T-INV1 | `toWeightedCandidates` + `scoreCandidates` | shared candidate set with known past counts | derived weights exactly match score pipeline inputs (`% = draw weights` invariant) |
| T-W4 | weight/draw/score edge | empty list and zero/near-zero totals | no crash; `null` draw; `0%` or empty outputs as specified |
| T-S1 | `scoreCandidates` ordering | candidates where only two adjacent percentages differ by 1 point | strictly descending by `chancePercent` and deterministic tie behavior |

Notes:
- T-D4 can use a deterministic stub random or a controlled list where known seed yields boundary-adjacent value.
- For floating assertions on `randomValue`, use a small epsilon (for example `1e-12`).

---

## 4) Technical Strategy

### 4.1 JSON fixture schema

Fixture contract (normative):

```json
{
  "id": "string",
  "description": "string",
  "function": "weightForParticipant | exactSelectionProbability | scoreCandidates | performWeightedDraw",
  "input": {},
  "expected": {},
  "tolerancePercent": 0
}
```

Fixture location:
- `services/api/src/test/resources/draw/golden/`

Recommended fixture organization:
- `weights.json` (`REF-W*`, `T-W*`, `T-INV*`)
- `probabilities.json` (`REF-P*`, `T-P*`, `T-S*`)
- `draws.json` (`REF-D*`, `T-D*`)
- `edges.json` (`REF-E*`)

### 4.2 Runner proposal

Create `DrawGoldenTest.kt` with parameterized execution:
- Load all JSON fixtures into typed DTOs.
- Dispatch by `function`.
- Assert:
  - exact values where required
  - tolerance windows for allowed approximation (`+-1` point only under normative condition)
- Keep test IDs in assertion messages for fast triage.

Recommended stack:
- JUnit 5 `@ParameterizedTest`
- `@MethodSource` or dynamic test factory from fixture list

### 4.3 Tolerances (normative)

Apply `Golden tolerance` from spec:
- Exact match when:
  - `places == 1`, or
  - all weights are equal (within epsilon `0.0001`)
- `+-1` percentage point only when:
  - `places > 1`, and
  - weights are not all equal

### 4.4 CI gating

Execution command:
- `./gradlew :services:api:test`

CI policy for 19.2:
- Run golden suite on PRs touching:
  - `AvailabilityChanceCalculator.kt`
  - `CompositionDrawService.kt`
- Important: when `CompositionDrawService` changes, 19.2 still runs as a regression gate, but does not add orchestration-specific assertions (those belong to 19.3).

### 4.5 Optional helper regeneration

Optional helper:
- `scripts/draw/freeze-golden-vectors.kts`

Regenerate vectors only when:
- normative algorithm intentionally changes via ADR/spec update

Do not regenerate when:
- refactor intends behavioral parity (19.5/19.6/19.8 parity gates)

---

## 5) Ambiguities and Guardrails

If spec and current Kotlin diverge, do not guess.

Current guardrails:
1. If discrepancy appears between frozen REF values and runtime outputs, first verify fixture precision/rounding rules.
2. If mismatch remains and violates normative spec, raise a PO decision point before changing expected vectors.
3. Preserve Kotlin-frozen behavior only when it is explicitly aligned with the normative section.

Known sensitivity points to watch:
- `REF-W3` precision treatment (`0.6667` at 4dp) vs full double representation.
- Draw `randomValue` floating precision assertions for REF-D2/REF-D3.
- Sorting ties in `scoreCandidates` (do not over-assert tie order unless fixture requires it).

---

## 6) Window B Handoff — Implementation Task List (for `bmad-dev-story`)

1. Create fixture DTO + loader utility for JSON files under `services/api/src/test/resources/draw/golden/`.
2. Create fixture files (`weights.json`, `probabilities.json`, `draws.json`, `edges.json`) including all mandatory `REF-W1..REF-E2`.
3. Add `DrawGoldenTest.kt` parameterized runner executing all fixture IDs with function dispatch and structured assertions.
4. Implement exact/tolerance assertion helpers (`exact`, `percentTolerance`, `doubleEpsilon`) with explicit ID in failure messages.
5. Add recommended tests `T-P5`, `T-P6`, `T-P7`, `T-D4`, `T-D5`, `T-INV1`, `T-W4`, `T-S1`.
6. Add deterministic checks for REF-D2 and REF-D3 details (seed, `totalWeight`, `randomValue`, selected index).
7. Wire CI selection rule/documentation so golden suite is required for PRs touching `AvailabilityChanceCalculator` or `CompositionDrawService`.
8. Run gate: `./gradlew :services:api:test`, ensure green, and publish failing-ID readable output if regressions occur.

---

## P0 Priority Summary (Window B, 5 lines)

1. Implement all mandatory frozen references `REF-W1..REF-E2` exactly from the normative catalog.
2. Build a parameterized golden runner that enforces exact vs `+-1` tolerance by spec conditions.
3. Lock deterministic seeded draw checks (especially REF-D2/REF-D3 with `randomValue` and selected index).
4. Add anti-drift tests targeting refactor risk (`T-INV1`, multi-place probability behavior, rounding/sorting safety).
5. Ensure CI gate always runs `./gradlew :services:api:test` golden coverage when calculator or draw service files change.
