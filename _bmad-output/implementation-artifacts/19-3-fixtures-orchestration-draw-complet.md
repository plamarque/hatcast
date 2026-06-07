---
baseline_commit: 23d17efc
---

# Story 19.3 : Fixtures d'orchestration (draw complet)

Status: done

<!-- Ultimate context engine analysis completed — comprehensive developer guide created -->

## Story

En tant que **développeur**,  
je veux des scénarios de test pour **l'orchestration** du tirage multi-rôles,  
afin de verrouiller les règles **6.4** au-delà du calcul de poids isolé.

## Acceptance Criteria

1. **Given** scénarios seedés (intégration ou tests service), **when** full redraw, **then** slots existants du rôle entièrement remplacés ; partial redraw conserve assignés et remplit indices vides. [Source: epics 19.3 AC1 ; FR20 ; spec § Redraw semantics]
2. **Given** un participant assigné au rôle A, **when** tirage continue sur rôle B, **then** il est **exclu** du pool B (cross-role). [Source: epics 19.3 AC2 ; spec § Cross-role exclusion]
3. **Given** historique validé sur d'autres événements, **when** draw + summary, **then** poids draw = % summary (même `pastSelectionCount`). [Source: epics 19.3 AC3 ; ADR 0019 invariant « % = draw »]
4. **Given** draw réussi, **when** snapshot **6.14** lu, **then** `chancePercent` snapshot = valeur calculée au tirage (**opening snapshot** — **E-04**, pas `steps[]` après accumulation cross-role). [Source: epics 19.3 AC4 ; FR24 ; `CompositionDrawService.captureOpeningDrawSnapshots`]
5. **Given** scénario G-03 (slot indexé avec trou au milieu), **when** partial draw, **then** comportement V2 documenté et asserté (remplit l'indice vide, conserve slotIndex 1). [Source: investigation G-03 ; spec § Redraw semantics]
6. **Given** catalogue `REF-O*` sous `draw/golden/orchestration.json`, **when** `./gradlew :services:api:test`, **then** runner paramétré exécute tous les IDs avec messages d'échec incluant l'ID fixture. [Source: pattern 19.2 ; NFR-Q1]
7. **Couverture :** FR20, FR24, NFR-Q1. **UI : N/A**. **Priorité :** P1. **Depends :** 19.2 (done).

---

## Acceptance Criteria — Material 3 (UI)

**UI : N/A** — pas de changement sous `apps/web/`.

---

## Tasks / Subtasks

- [x] **Périmètre :** `services/api/` tests + doc normative uniquement — **ne pas modifier** l'algorithme `AvailabilityChanceCalculator` sauf bug prouvé ; **ne pas toucher** `apps/web/` ni `legacy/`.
- [x] **Test design** — créer [`_bmad-output/test-artifacts/19-3-orchestration-test-design.md`](../test-artifacts/19-3-orchestration-test-design.md) (risques, catalogue REF-O*, mapping tests existants).
- [x] **Spec handoff** — ajouter § **Orchestration golden test contract (19.3 handoff)** dans [`docs/v2/technical/draw-weight-engine-v1-spec.md`](../../docs/v2/technical/draw-weight-engine-v1-spec.md) : scope IN/OUT, schéma JSON, liste REF-O*, note E-04 vs 6.14 AC1.
- [x] **Fixtures JSON** — `services/api/src/test/resources/draw/golden/orchestration.json` (IDs stables `REF-O1`…`REF-O10`, `T-O*` edge).
- [x] **Runner** — `DrawOrchestrationGoldenTest.kt` + helper `DrawOrchestrationFixture.kt` (charge JSON, setup DB, assertions).
- [x] **Determinisme** — scénarios nécessitant seed : appeler **`CompositionDrawService.drawComposition(..., random = Random(seed))`** directement (pas via HTTP — `DrawCompositionRequestDto` n'expose pas de seed).
- [x] **Consolidation** — annoter ou refactoriser les tests ad hoc de `CompositionDrawIntegrationTest.kt` couverts par REF-O* ; supprimer doublons **seulement** si le golden runner les remplace intégralement.
- [x] **Fix E-04 assertion** — corriger `expectedSnapshotFromDraw` (compare aujourd'hui au premier `steps[]` ; doit refléter **opening snapshot** pour AC4).
- [x] **README + CI** — étendre [`services/api/README.md`](../../services/api/README.md) § Golden draw suite (19.3 orchestration) ; confirmer gate via `api-test.yml` (suite complète déjà).
- [x] **Gate** — `./gradlew -q :services:api:test --tests 'com.hatcast.api.composition.DrawOrchestrationGoldenTest'` vert ; suite API complète verte.

---

## Definition of Done

- [x] Tous les IDs **REF-O1…REF-O10** présents en fixtures avec `id` unique.
- [x] **REF-O1** full redraw remplace tous les slots d'un rôle plein.
- [x] **REF-O2** partial : slotIndex 0 conservé, slotIndex 1 rempli.
- [x] **REF-O3** cross-role même requête : 1 seul rôle pour candidat multi-rôle.
- [x] **REF-O4** pre-assign player → exclu du tirage dj (ordre de priorité).
- [x] **REF-O5** stack manuel multi-rôle : auto-draw ne double pas.
- [x] **REF-O6** intra-rôle sans remise : 2 slots / 3 candidats, seed fixe → 2 assignés distincts.
- [x] **REF-O7** veteran/rookie : `steps[].weight` cohérent avec `GET …/availability/summary` `%` (même `pastSelectionCount`).
- [x] **REF-O8** snapshot DB `chancePercent` = opening score (pas drift vs `steps[]` post cross-role).
- [x] **REF-O9** G-03 : `{player:2}`, slot 0 vide + slot 1 occupé → draw remplit 0 seulement.
- [x] **REF-O10** `mode=fillEmpty` sur composition verrouillée remplit creux sans effacer occupant.
- [x] Spec § 19.3 handoff + test design commités.
- [x] `./gradlew :services:api:test` vert.
- [x] Story → `done` ; sprint-status `19-3-fixtures-orchestration-draw-complet: done` (revue 2026-06-07).

---

## Dev Notes

### Normative sources (read order)

1. [`docs/v2/technical/draw-weight-engine-v1-spec.md`](../../docs/v2/technical/draw-weight-engine-v1-spec.md) — § Intra-role, Cross-role, Redraw semantics (ajouter § 19.3 handoff en impl)
2. [`docs/adr/0019-draw-weight-engine.md`](../../docs/adr/0019-draw-weight-engine.md) — invariant `% = draw`, E-04
3. [`_bmad-output/test-artifacts/19-2-golden-test-design.md`](../test-artifacts/19-2-golden-test-design.md) — pattern catalogue + runner
4. [`CompositionDrawService.kt`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionDrawService.kt) — orchestration runtime
5. [`CompositionDrawIntegrationTest.kt`](../../services/api/src/test/kotlin/com/hatcast/api/composition/CompositionDrawIntegrationTest.kt) — tests existants à mapper / dédupliquer

### Scope IN / OUT

| IN (19.3) | OUT (autres stories) |
|-----------|----------------------|
| `CompositionDrawService` multi-rôle, full/partial redraw | Calculator unit golden → **19.2** (done) |
| Cross-role + intra-role exclusion during one request | Category compartment SQL → **19.8** |
| `%` draw = summary invariant at orchestration level | Factor pipeline refactor → **19.5** |
| Opening snapshot `chancePercent` persistence (**6.14**) | Formula id on snapshot → **19.22** |
| G-03 indexed slot gap fill | G-02 current-event history edge → document only |
| `DrawMode.FILL_EMPTY` on locked composition (**E-03**) | UI explainability doc → **19.4** |

### Runtime behaviour to preserve (read before changing tests)

**`CompositionDrawService.drawComposition`** ([`:59-355`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionDrawService.kt)):

| Mechanism | Lines | Must preserve |
|-----------|-------|---------------|
| `openingCrossRoleExcluded` seeded from pre-existing assignees | 135-139 | REF-O4 |
| `isFullRedraw` when `mode=FULL` && `filledCount >= requiredCount` | 164-185 | REF-O1 |
| Partial: `withinRoleExcluded` from existing assignees | 187-195 | REF-O2, REF-O9 |
| `indicesToFill` for FILL_EMPTY vs full vs partial | 197-203 | REF-O9, REF-O10 |
| Pool exclusion = `crossRoleExcluded + withinRoleExcluded` | 214 | REF-O3 |
| Weight + score + draw same `pastByParticipant` | 216-240 | REF-O7 |
| Opening snapshots before role loop | 148-156, 409-458 | REF-O8 (**E-04**) |
| Snapshot replace/upsert by mode | 331-335 | REF-O1, REF-O10 |

**Critical E-04 clarification for AC4:**  
6.14 story AC1 wording says snapshots come from `steps[]` — **implementation uses `captureOpeningDrawSnapshots`** at draw opening with `openingCrossRoleExcluded`. Tests must assert **opening** semantics. Document in spec § 19.3 ; optional one-line note in 6.14 story file (waivable).

**Snapshot assertion fix:**  
Current helper compares DB to first step candidates:

```218:233:services/api/src/test/kotlin/com/hatcast/api/composition/CompositionDrawIntegrationTest.kt
    private fun expectedSnapshotFromDraw(
        drawBody: JsonNode,
        roleKey: String,
        participantId: String,
    ): Pair<Int, Int>? {
        val firstStep =
            drawBody.get("steps").firstOrNull { it.get("roleKey").asText() == roleKey } ?: return null
        // ...
    }
```

For multi-role draws this can **false-pass** when opening % ≠ first-step %. REF-O8 must recompute expected via same inputs as `captureOpeningDrawSnapshots` OR read pre-pick scores from a dedicated test seam.

### Recommended fixture schema

```json
{
  "id": "REF-O3",
  "description": "Cross-role: same participant cannot hold player and mc in one draw",
  "tags": ["cross-role", "FR20"],
  "setup": {
    "roleSlots": { "player": 1, "mc": 1 },
    "participants": [
      { "key": "solo", "roles": ["player", "mc"] }
    ],
    "availabilities": [{ "participantKey": "solo", "status": "available" }],
    "preAssignedSlots": [],
    "validatedPastEvents": [],
    "drawMode": "full"
  },
  "randomSeed": null,
  "expected": {
    "maxRolesPerParticipant": 1,
    "totalAssignedSlots": 1
  }
}
```

Fields:

| Field | Purpose |
|-------|---------|
| `setup.roleSlots` | Event template counts |
| `setup.preAssignedSlots` | `[{roleKey, slotIndex, participantKey}]` before draw |
| `setup.validatedPastEvents` | History for AC3 (`[{roleSlots, assigneeKey, validated: true}]`) |
| `randomSeed` | When set → direct service call with `Random(seed)` ; assert exact assignees |
| `expected.*` | Structural asserts (counts, exclusion) or exact IDs when seeded |

Reuse participant UUID derivation from [`DrawGoldenFixture.participantId`](../../services/api/src/test/kotlin/com/hatcast/api/availability/DrawGoldenFixture.kt) for cross-suite consistency.

### Minimum frozen reference catalog (REF-O*)

| ID | Scenario | Key assertion | Existing test to map |
|----|----------|---------------|---------------------|
| **REF-O1** | Full redraw, role player×2 fully filled, then redraw with 1 candidate unavailable | Exactly 1 assignee ; previous assignee removed | `full redraw clears slots when candidate pool cannot refill` |
| **REF-O2** | player×2, slotIndex 0 pre-assigned | slot 0 unchanged ; slot 1 new assignee | `partial role keeps existing assignee and fills empty slot` |
| **REF-O3** | player×1 + mc×1, solo available both | solo on ≤1 role | `cross role draw excludes participant already assigned in same request` |
| **REF-O4** | player pre-assigned manually, draw rest | solo stays player only | `cross role draw excludes participant pre assigned on later role in draw order` |
| **REF-O5** | Manual player+dj same person, then full draw | solo on ≤1 role after auto-draw | `full draw does not auto assign two roles when manual multi role stack exists` |
| **REF-O6** | player×2, 3 candidates, `Random(99)` | 2 distinct assignees ; deterministic IDs frozen once | **New** |
| **REF-O7** | Past validated event assigns veteran ; draw new event ; GET summary | veteran `%` < rookie `%` ; step weight matches calculator | `availability summary reflects non zero past selection history` |
| **REF-O8** | 2 candidates player×1 | DB snapshot `chancePercent` = opening score | Fix `draw persists chance snapshots` |
| **REF-O9** | player×2, slot 1 occupied, slot 0 empty | After draw: both filled ; slot 1 unchanged | **New (G-03)** |
| **REF-O10** | Validated composition, 1 empty required slot | fillEmpty adds one ; prior assignee kept | `CompositionGapFillIntegrationTest` pattern |

Optional edge IDs **T-O1** (empty pool continues), **T-O2** (full redraw replaces snapshot rows count).

### Implementation approach (guardrails)

1. **`@SpringBootTest` + `@ActiveProfiles("test")`** — reuse seed troupe `a0000001-0000-4000-8000-000000000001` and helpers from `CompositionDrawIntegrationTest` (extract shared `DrawTestSupport` if duplication exceeds ~80 lines).
2. **Direct service invocation for seeded cases** — inject `CompositionDrawService`, build `SessionUserPrincipal` via `TestAuthSupport`, pass `Random(seed)`. HTTP tests optional for smoke only.
3. **Do not add `randomSeed` to public API** — test seam only.
4. **Do not modify production code** unless REF-O* exposes a proven bug ; if so, document in Dev Agent Record + ISSUES.md.
5. **Category compartment** — use default/principal events only ; do not assert G-01 parity (→ **19.8**).

### Forbidden

- `legacy/**` as runtime reference
- Modifying `AvailabilityChanceCalculator.kt` (19.2 gate)
- Weakening 19.2 golden tests
- Fabricating snapshots outside draw path

### Explicit non-goals

| Item | Reason |
|------|--------|
| Factor pipeline / `DrawWeightFactor` | **19.5** |
| V1 JS replay orchestration | No V1 multi-role replay harness |
| UI explainability copy | **19.4** |
| API `randomSeed` query param | Out of product scope |
| Backfill snapshots MIG-3 | **6.14** AC5 sufficient |

### Dependencies

| Story | Status | Relationship |
|-------|--------|--------------|
| **19.1** | done | Normative spec + G-03 gap table |
| **19.2** | done | Calculator golden — must stay green |
| **6.4** | done | Draw runtime baseline |
| **6.14** | done | Snapshot persistence — E-04 nuance |
| **19.5** | backlog | Blocked on **19.3** |
| **19.8** | backlog | Category golden extends 19.3 patterns |

---

### Architecture compliance

- [AGENTS.md](../../AGENTS.md) — no SPEC formula duplication ; update normative spec only.
- [ADR 0019](../../docs/adr/0019-draw-weight-engine.md) — orchestration tests enforce invariant #2 and snapshot note #5.
- Single calculator path: draw step weights and summary must both flow through `AvailabilityChanceCalculator` (already true — assert, don't reimplement).

### File structure requirements

| Action | Path |
|--------|------|
| **CREATE** | `_bmad-output/test-artifacts/19-3-orchestration-test-design.md` |
| **CREATE** | `services/api/src/test/resources/draw/golden/orchestration.json` |
| **CREATE** | `services/api/src/test/kotlin/com/hatcast/api/composition/DrawOrchestrationFixture.kt` |
| **CREATE** | `services/api/src/test/kotlin/com/hatcast/api/composition/DrawOrchestrationGoldenTest.kt` |
| **UPDATE** | `docs/v2/technical/draw-weight-engine-v1-spec.md` — § 19.3 handoff |
| **UPDATE** | `services/api/README.md` — 19.3 section |
| **UPDATE (optional)** | `CompositionDrawIntegrationTest.kt` — dedupe / `@Tag("REF-O3")` links |
| **OPTIONAL CREATE** | `services/api/src/test/kotlin/com/hatcast/api/composition/DrawTestSupport.kt` — shared setup |

### Testing requirements

| Layer | Command |
|-------|---------|
| Orchestration golden | `./gradlew -q :services:api:test --tests 'com.hatcast.api.composition.DrawOrchestrationGoldenTest'` |
| Regression 19.2 | `./gradlew -q :services:api:test --tests 'com.hatcast.api.availability.DrawGoldenTest'` |
| Full API | `./gradlew -q :services:api:test` |

CI: [`.github/workflows/api-test.yml`](../../.github/workflows/api-test.yml) runs full `./gradlew test` on `services/api/**` changes — no workflow change required if golden tests live in standard test source set.

### Previous story intelligence (19.2)

- JSON fixture pattern: `DrawGoldenFixture.kt` loader with duplicate ID guard.
- Parameterized `DrawGoldenTest.kt` with `id` in assertion messages.
- Review patches applied: duplicate ID validation, no silent empty assertions.
- **Handoff explicitly deferred to 19.3:** orchestration, G-03, snapshots E-04, `%` draw = summary at service level.
- 19.2 left `CompositionDrawService.kt` **untouched** — 19.3 also prefers test-only changes.

### Git intelligence

Recent commits (`23d17efc`, `d231f89b`, …) touch participants/auth — **no Epic 19 code** in last 5 commits. Epic 19.2 artifacts exist in working tree (`DrawGoldenTest.kt`, `draw/golden/*.json`) — baseline orchestration work on current branch.

### Latest technical information

- **`kotlin.random.Random(seed)`** — already injectable on `CompositionDrawService.drawComposition` (line 65) ; use for REF-O6 deterministic picks.
- **Spring Boot 3 + `@SpringBootTest`** — existing integration tests use `@MockBean` for Google OAuth ; copy pattern from `CompositionDrawIntegrationTest`.
- No new dependencies required.

### Project context reference

- [project-context.md](../../project-context.md) — `./gradlew test` from monorepo root.
- [PLAN.md § Epic 19](../../PLAN.md) — Wave A ; 19.3 blocks 19.5.
- [investigation G-03](../../_bmad-output/implementation-artifacts/investigations/draw-v1-v2-gaps-investigation.md) — middle-slot gap is primary new coverage.

---

## Dev Agent Record

### Agent Model Used

Composer (dev-story workflow)

### Debug Log

- REF-O6 frozen assignees `[b, a]` after first run with `Random(99)` (not `[b, c]`).
- No production code changes required — runtime matched spec.

### Completion Notes List

- Added orchestration golden catalogue **REF-O1…REF-O10** + **T-O1/T-O2** in `orchestration.json` with parameterized `DrawOrchestrationGoldenTest`.
- Extracted `DrawTestSupport` for season/event/participant/availability/draw setup; direct `CompositionDrawService` + `Random(seed)` seam for determinism.
- `DrawOrchestrationFixtureLoader.computeOpeningChancePercent` implements E-04 opening semantics for REF-O8.
- Replaced `expectedSnapshotFromDraw` with `expectedOpeningSnapshotPercent` in `CompositionDrawIntegrationTest`; tagged legacy tests with `@Tag("REF-O*")`.
- Spec § 19.3 handoff, test design doc, README section added.
- `./gradlew test` green (full API suite).

### File List

- `_bmad-output/test-artifacts/19-3-orchestration-test-design.md` (CREATE)
- `docs/v2/technical/draw-weight-engine-v1-spec.md` (UPDATE)
- `services/api/README.md` (UPDATE)
- `services/api/src/test/resources/draw/golden/orchestration.json` (CREATE)
- `services/api/src/test/kotlin/com/hatcast/api/composition/DrawOrchestrationFixture.kt` (CREATE)
- `services/api/src/test/kotlin/com/hatcast/api/composition/DrawOrchestrationGoldenTest.kt` (CREATE)
- `services/api/src/test/kotlin/com/hatcast/api/composition/DrawTestSupport.kt` (CREATE)
- `services/api/src/test/kotlin/com/hatcast/api/composition/CompositionDrawIntegrationTest.kt` (UPDATE)

### Change Log

- 2026-06-07 : Story 19.3 created — orchestration golden fixture catalog (Epic 19 Wave A).
- 2026-06-07 : Implementation complete — golden runner, fixtures REF-O1…O10, E-04 assertion fix, docs.
- 2026-06-07 : Code review — 4 patches appliqués (REF-O5 couverture, cookie admin, garde assertions, nettoyage REF-O8).

---

### Validation create-story

- [x] AC métier numérotés et sourcés (epics / FR)
- [x] Section **Material 3** = **UI : N/A**
- [x] Tasks référencent les numéros d'AC
- [x] Liens vers fichiers code existants à réutiliser
- [x] `./gradlew test` mentionné pour gate API
- [x] REF-O* catalog + E-04 / G-03 guidance for dev agent
- [x] Implementation complete — all DoD items satisfied

### Review Findings

- [x] [Review][Patch] REF-O5 n'asserte pas le remplissage du rôle `dj` — ajout `totalAssignedSlots: 2` + `backup: ["dj"]` dans `orchestration.json`
- [x] [Review][Patch] Cookie admin incohérent pour REF-O7 — helper `adminCookieFor(fixture)` aligné sur `buildScenario`
- [x] [Review][Patch] Pas de garde anti-assertions vides — flag `asserted` + `assertTrue` en fin de `assertExpected`
- [x] [Review][Patch] Bloc redondant dans `assertOpeningSnapshotMatchesDb` — supprimé ; param `lastDraw` retiré
- [x] [Review][Defer] `computeOpeningChancePercent` réimplémente le filtrage du pool au lieu d'appeler `CompositionParticipantPool.buildRolePool` — risque de dérive si le pool runtime évolue [`DrawOrchestrationFixture.kt:65`](../../services/api/src/test/kotlin/com/hatcast/api/composition/DrawOrchestrationFixture.kt) — deferred, acceptable pour fixtures actuelles
- [x] [Review][Defer] `CompositionDrawIntegrationTest` conserve ses propres helpers au lieu de `DrawTestSupport` — duplication hors périmètre minimal 19.3 [`CompositionDrawIntegrationTest.kt`](../../services/api/src/test/kotlin/com/hatcast/api/composition/CompositionDrawIntegrationTest.kt) — deferred, story marquait l'extraction optionnelle
