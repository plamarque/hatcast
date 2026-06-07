# Epic 19 — Story 19.3 Orchestration Test Design

## Purpose

Golden regression suite for **`CompositionDrawService`** multi-role orchestration: redraw semantics, cross-role exclusion, `%` = summary invariant at service level, and opening snapshot persistence (**E-04** / **6.14**).

Normative authority:
1. `docs/v2/technical/draw-weight-engine-v1-spec.md` — § Orchestration golden test contract (19.3 handoff)
2. `docs/adr/0019-draw-weight-engine.md` — invariant `%` = draw; E-04 note
3. Story `19-3-fixtures-orchestration-draw-complet.md`

Depends on **19.2** (calculator golden — must stay green).

---

## 1) Scope IN / OUT

| IN | OUT |
|----|-----|
| `CompositionDrawService.drawComposition` multi-role | Calculator unit tests → **19.2** |
| Full / partial / fillEmpty redraw | Factor pipeline → **19.5** |
| Cross-role + intra-role exclusion | Category compartment → **19.8** |
| Opening snapshot DB rows | Formula id on snapshot → **19.22** |
| G-03 middle-slot gap | V1 JS orchestration replay |
| Deterministic `Random(seed)` test seam | Public API `randomSeed` |

---

## 2) Risk Matrix

| Risk ID | Description | Impact | Mitigating IDs |
|--------|-------------|--------|----------------|
| R-19.3-01 | Full redraw fails to clear slots when pool shrinks | High | REF-O1 |
| R-19.3-02 | Partial redraw overwrites pre-assigned slots | High | REF-O2, REF-O9 |
| R-19.3-03 | Same participant on two roles in one draw | Critical | REF-O3, REF-O4, REF-O5 |
| R-19.3-04 | Draw `%` diverges from Dispos summary | Critical | REF-O7 |
| R-19.3-05 | Snapshot stores per-step % instead of opening (E-04) | High | REF-O8 |
| R-19.3-06 | fillEmpty clears validated assignees | High | REF-O10 |
| R-19.3-07 | Non-deterministic golden drift | Medium | REF-O6 + `Random(seed)` |
| R-19.3-08 | False confidence from duplicated ad hoc tests | Low | `@Tag("REF-O*")` on legacy integration tests |

---

## 3) Catalogue REF-O* / T-O*

| ID | Tags | Assertion summary |
|----|------|-------------------|
| REF-O1 | FR20 | Second full redraw → 1 assignee when peer unavailable |
| REF-O2 | FR20 | Keeper on slot 0; new assignee slot 1 |
| REF-O3 | FR20 | Solo multi-role → 1 slot total |
| REF-O4 | FR20 | Pre-assign player blocks dj pick |
| REF-O5 | FR20 | Manual player+dj stack → ≤1 auto role |
| REF-O6 | FR20 | Seed 99 → `[b, a]` assigned |
| REF-O7 | FR19, FR20 | Veteran chance < rookie; step % = summary |
| REF-O8 | FR24, E-04 | DB snapshot = opening calculator score |
| REF-O9 | FR20, G-03 | Slot 1 occupant preserved; slot 0 filled |
| REF-O10 | FR20, E-03 | fillEmpty on locked comp |
| T-O1 | edge | Empty player pool; dj still drawn |
| T-O2 | FR24 | Two redraws → 2 snapshot rows |

Fixtures: `services/api/src/test/resources/draw/golden/orchestration.json`  
Runner: `DrawOrchestrationGoldenTest.kt`  
Helper: `DrawOrchestrationFixture.kt`, `DrawTestSupport.kt`

---

## 4) Mapping to existing integration tests

| Legacy test (`CompositionDrawIntegrationTest`) | Golden ID | Deduped? |
|------------------------------------------------|-----------|----------|
| `full redraw clears slots…` | REF-O1 | Annotated; golden is canonical |
| `partial role keeps existing…` | REF-O2 | Annotated |
| `cross role draw excludes… same request` | REF-O3 | Annotated |
| `cross role draw excludes… pre assigned` | REF-O4 | Annotated |
| `full draw does not auto assign two roles…` | REF-O5 | Annotated |
| `availability summary reflects…` | REF-O7 | Annotated (summary only; golden adds draw %) |
| `draw persists chance snapshots…` | REF-O8 | Annotated; opening helper fixed |
| `full redraw replaces previous snapshots…` | T-O2 | Annotated |
| G-03 gap | REF-O9 | **New** in golden only |
| fillEmpty locked | REF-O10 | Covered in `CompositionGapFillIntegrationTest` + REF-O10 |

Category compartment tests (`selection history is scoped to category`, …) remain outside 19.3 — **19.8**.

---

## 5) Test commands

```bash
# Orchestration golden (19.3)
./gradlew -q test --tests 'com.hatcast.api.composition.DrawOrchestrationGoldenTest'

# Calculator golden regression (19.2)
./gradlew -q test --tests 'com.hatcast.api.availability.DrawGoldenTest'

# Full API gate
./gradlew -q test
```

CI: `.github/workflows/api-test.yml` — no change required.

---

## 6) Opening snapshot assertion (E-04 fix)

`CompositionDrawIntegrationTest.expectedSnapshotFromDraw` (first `steps[]` per role) replaced by `expectedOpeningSnapshotPercent` using `AvailabilityChanceCalculator.scoreCandidates` on the **opening pool** — aligned with `captureOpeningDrawSnapshots`.

`DrawOrchestrationFixtureLoader.computeOpeningChancePercent` shared for REF-O8.
