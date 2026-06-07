---
baseline_commit: 97216aee
---

# Story 19.6 : Facteur `PastParticipationFactor` (= V1)

Status: done

<!-- Ultimate context engine analysis completed — comprehensive developer guide created -->

## Story

En tant que **développeur**,  
je veux migrer le malus **participations passées** vers le pipeline,  
afin que le **seul facteur actif par défaut** reste strictement V1.

## Acceptance Criteria

1. **Given** `PastParticipationFactor`, **when** activé (défaut), **then** multiplicateur = `1/(1+pastSelectionCount)` ; `requiredCount` appliqué comme aujourd'hui (base × facteur = `malus × requiredCount`). [Source: epics 19.6 AC1 ; ADR 0019 §3 ; spec § Weight formula]
2. **Given** règles d'exclusion historique **6.4** / `CompositionSelectionHistoryService`, **when** comptage, **then** **aucun changement** (SQL, modes OPERATIONAL/RETROSPECTIVE, compartment) — extension partition = **19.8** uniquement. [Source: epics 19.6 AC2 ; FR20]
3. **Given** golden suite **19.2** + orchestration **19.3**, **when** `./gradlew test` (classes `DrawGoldenTest`, `DrawOrchestrationGoldenTest`), **then** **100 % green** sans modification des fixtures JSON. [Source: epics 19.6 AC3 ; NFR-Q1]
4. **Couverture :** FR19, FR20. **Priorité :** P1. **Depends :** 19.5 (done).

---

## Acceptance Criteria — Material 3 (UI)

**UI : N/A** — pas de changement sous `apps/web/` ni `legacy/`.

---

## Tasks / Subtasks

- [x] **Périmètre :** `services/api/` uniquement — package `availability/draw/` ; **ne pas** toucher `CompositionSelectionHistoryService` ni SQL historique (**19.8**).
- [x] **`PastParticipationFactor`** — implémenter `DrawWeightFactor` : `multiplier = 1.0 / (1.0 + pastSelectionCount)` ; id stable (`factorId` ou `object` singleton documenté pour **19.7**). (AC1)
- [x] **Découper la base** — remplacer `legacyBaseWeight` monolithique par `baseWeight = requiredCount.toDouble()` ; retirer le malus de la base. (AC1)
- [x] **Registry défaut** — `DrawWeightPipelines.DEFAULT = DrawWeightPipeline.of(PastParticipationFactor)` ; mettre à jour le commentaire « empty until 19.6+ ». (AC1)
- [x] **Garde-fous pipeline** — dans `DrawWeightPipeline.apply`, rejeter ou normaliser multiplicateurs NaN / négatif / infini (dette review **19.5**). (AC1, robustesse)
- [x] **Tests unitaires** — `PastParticipationFactor` + `DrawWeightPipelineTest` : adapter le test « default registry is no-op » → comportement V1 ; ajouter cas past=0, past=3, required>1. (AC1)
- [x] **Tests calculator** — `AvailabilityChanceCalculatorDrawTest` : vérifier que DEFAULT pipeline conserve fresh > veteran ; pipeline custom reste injectable sans double-maluse. (AC1, AC3)
- [x] **Gate régression** — `./gradlew test --tests DrawGoldenTest --tests DrawOrchestrationGoldenTest --tests DrawWeightPipelineTest --tests AvailabilityChanceCalculatorTest --tests AvailabilityChanceCalculatorDrawTest` puis suite API si besoin. (AC3)

### Review Findings

- [x] [Review][Patch] Test `0.0` accepté par `sanitizeMultiplier` [`DrawWeightPipelineTest.kt`]
- [x] [Review][Patch] Test facteur invalide intermédiaire puis facteur valide [`DrawWeightPipelineTest.kt`]
- [x] [Review][Defer] `requiredCount <= 0` sans garde [`AvailabilityChanceCalculator.kt:64`] — deferred, pre-existing (identique `legacyBaseWeight`)
- [x] [Review][Defer] `FACTOR_ID` non asserté en test [`PastParticipationFactor.kt:10`] — deferred, couverture prévue story **19.7**
- [x] [Review][Defer] Pas de log sur multiplicateur invalide [`DrawWeightPipeline.kt:21`] — deferred, hors scope V1
- [x] [Review][Defer] Clamp `pastSelectionCount` négatif silencieux [`PastParticipationFactor.kt:13`] — deferred, option défensive acceptée par spec story
- [x] [Review][Defer] Test V1 via base manuelle vs `weightForParticipant` [`PastParticipationFactorTest.kt:29`] — deferred, couvert par `AvailabilityChanceCalculatorDrawTest`

---

## Dev Notes

### Normative sources (read order)

1. [`docs/v2/technical/draw-weight-engine-v1-spec.md`](../../docs/v2/technical/draw-weight-engine-v1-spec.md) — § Weight formula, invariant `% = draw`
2. [`docs/adr/0019-draw-weight-engine.md`](../../docs/adr/0019-draw-weight-engine.md) — `finalWeight = base × Π factorMultiplier` ; V1 = `PastParticipationFactor`
3. [`_bmad-output/planning-artifacts/epics.md`](../planning-artifacts/epics.md) — Story 19.6 AC
4. [`_bmad-output/implementation-artifacts/19-5-pipeline-draw-weight-factor.md`](19-5-pipeline-draw-weight-factor.md) — architecture posée, dettes reportées
5. [`AvailabilityChanceCalculator.kt`](../../services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityChanceCalculator.kt) — `weightForParticipant`, `legacyBaseWeight`
6. [`DrawWeightPipeline.kt`](../../services/api/src/main/kotlin/com/hatcast/api/availability/draw/DrawWeightPipeline.kt) — registry DEFAULT

### Current runtime (after 19.5 — change in 19.6)

**Monolithique (à découper) :**

```kotlin
internal fun legacyBaseWeight(context: DrawWeightContext): Double {
    val malus = 1.0 / (1.0 + context.pastSelectionCount)
    return malus * context.requiredCount
}
// DrawWeightPipelines.DEFAULT = EMPTY → ×1.0
```

**Call graph (inchangé côté appelants) :**

| Entry | Uses weights via |
|-------|------------------|
| `weightForParticipant` | base → `DrawWeightPipeline.apply` |
| `toWeightedCandidates` | `weightForParticipant` per candidate |
| `scoreCandidates` | `toWeightedCandidates` |
| `performWeightedDraw` | pre-built weights from `toWeightedCandidates` |

Production callers (`CompositionDrawService`, `AvailabilityService`, `CompositionSlotAssignmentService`, `CompositionService`) utilisent déjà le paramètre `pipeline` par défaut — **aucun câblage Spring** requis en 19.6.

### Architecture target (19.6)

```
DrawWeightContext(participantId, roleKey, pastSelectionCount, requiredCount)
       ↓
baseWeight(context) = requiredCount.toDouble()
       ↓
DrawWeightPipeline.apply(base, context)   // DEFAULT = [PastParticipationFactor]
       ↓
finalWeight = requiredCount × 1/(1+pastSelectionCount)   // identique V1
```

**Exemple numérique (golden contract) :**

| pastSelectionCount | requiredCount | malus | weight |
|--------------------|---------------|-------|--------|
| 0 | 2 | 1.0 | 2.0 |
| 2 | 2 | 1/3 | 0.667… |
| 3 | 1 | 1/4 | 0.25 |

### `PastParticipationFactor` sketch

```kotlin
// availability/draw/PastParticipationFactor.kt
object PastParticipationFactor : DrawWeightFactor {
    const val FACTOR_ID = "past_participation" // for 19.7 breakdown

    override fun multiplier(context: DrawWeightContext): Double =
        1.0 / (1.0 + context.pastSelectionCount)
}
```

Renommer ou supprimer `legacyBaseWeight` au profit de `baseWeight` (internal, testable). Garder `weightForParticipant` comme point d'entrée unique.

### Pipeline guardrails (from 19.5 review)

Dans `DrawWeightPipeline.apply`, après chaque `factor.multiplier(context)` :

- Si le multiplicateur n'est pas fini (`!value.isFinite()`) ou `< 0`, choisir une stratégie **documentée** (recommandé : traiter comme `0.0` pour exclure de facto, ou `1.0` pour no-op — **préférer alignement spec V1** : un malus invalide ne devrait pas arriver si `pastSelectionCount >= 0`).
- `pastSelectionCount` négatif : **ne pas** changer le contrat appelant ; optionnel clamp à `0` dans le facteur si défensif.

### Tests to update (not fixtures)

| File | Change |
|------|--------|
| `DrawWeightPipelineTest` | `default registry pipeline is no-op` → assert V1 malus on base (ex. base=5, past=3 → 5×0.25=1.25) |
| `DrawWeightPipelineTest` | `factor receives draw context` — peut rester ou fusionner avec test PastParticipation |
| `AvailabilityChanceCalculatorDrawTest` | `uses configured pipeline` — avec base=`requiredCount` seul, stub ×2 sur required=5 → 10.0 |

**Do not modify** `services/api/src/test/resources/draw/golden/*.json`.

### Explicit non-goals

- **Pas** de changement SQL / `CompositionSelectionHistoryService` / compartment **19.8**.
- **Pas** de `factorBreakdown` API (**19.7**).
- **Pas** de facteurs Wave C (**19.9+**).
- **Pas** de persistance formule (**19.16**) ni `@Configuration` Spring.
- **Pas** de modification fixtures golden **19.2**.
- **Pas** de refactor « double calcul poids » dans `CompositionDrawService` (pré-existant, hors scope).

### Dependencies

| Story | Status | Relationship |
|-------|--------|--------------|
| 19.5 | done | Pipeline shell ; DEFAULT était EMPTY |
| 19.2, 19.3 | done | Golden gate — must stay green |
| 19.7 | backlog | Consommer `FACTOR_ID` pour breakdown |
| 19.8 | backlog | Partition category en facteur séparé |

### Wave B DoD (19.5 + 19.6)

- Un seul chemin de calcul des poids ✓ (19.5)
- **19.6 complète :** un seul facteur actif par défaut = historique V1
- Golden **19.2** vert

## Dev Agent Record

### Agent Model Used

claude-4.6-sonnet-medium-thinking (Cursor)

### Completion Notes List

- Implemented `PastParticipationFactor` singleton with `FACTOR_ID = "past_participation"` and defensive clamp for negative `pastSelectionCount`.
- Split `legacyBaseWeight` into `baseWeight(requiredCount)` + pipeline factor; `DrawWeightPipelines.DEFAULT` now registers `PastParticipationFactor`.
- Added `sanitizeMultiplier` guardrails in `DrawWeightPipeline.apply` (NaN/infinite/negative → 0.0).
- Updated unit tests; golden suite (`DrawGoldenTest`, `DrawOrchestrationGoldenTest`) green without fixture changes.
- Full API test suite green (`./gradlew test`).

### File List

- `services/api/src/main/kotlin/com/hatcast/api/availability/draw/PastParticipationFactor.kt` (new)
- `services/api/src/main/kotlin/com/hatcast/api/availability/draw/DrawWeightPipeline.kt` (modified — guardrails, DEFAULT registry)
- `services/api/src/main/kotlin/com/hatcast/api/availability/draw/DrawWeightFactor.kt` (modified — comment cleanup)
- `services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityChanceCalculator.kt` (modified — baseWeight split)
- `services/api/src/test/kotlin/com/hatcast/api/availability/draw/DrawWeightPipelineTest.kt` (modified)
- `services/api/src/test/kotlin/com/hatcast/api/availability/draw/PastParticipationFactorTest.kt` (new)
- `services/api/src/test/kotlin/com/hatcast/api/availability/AvailabilityChanceCalculatorDrawTest.kt` (modified)
- `_bmad-output/implementation-artifacts/19-6-facteur-past-participation-v1.md` (this file)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (modified)

### Change Log

- 2026-06-07 : Story created (create-story).
- 2026-06-07 : Implemented PastParticipationFactor pipeline migration; all AC satisfied; tests green.
- 2026-06-07 : Code review — 2 patch tests added to `DrawWeightPipelineTest`; story → done.

---

### Validation create-story

- [x] AC métier numérotés et sourcés (epics / FR)
- [x] Section **Material 3** remplie **ou** **UI : N/A** explicite
- [x] Tasks référencent les numéros d'AC
- [x] Liens vers fichiers code existants à réutiliser
- [x] `./gradlew test` mentionné pour gate API
