---
baseline_commit: 24f30d5e
---

# Story 19.5 : Pipeline `DrawWeightFactor` (sans nouveau facteur)

Status: done

<!-- Ultimate context engine analysis completed — comprehensive developer guide created -->

## Story

En tant que **développeur**,  
je veux un **pipeline de facteurs** composant le poids final,  
afin d'**activer des règles** une par une sans toucher au cœur du tirage.

## Acceptance Criteria

1. **Given** interface `DrawWeightFactor` (contexte : événement, rôle, candidat, historique, `requiredCount`), **when** pipeline exécuté, **then** `finalWeight = base × Π factorMultiplier` (ADR 0019) avec **facteurs configurables** ordonnés. [Source: epics 19.5 AC1 ; ADR 0019 §3]
2. **Given** config troupe/événement par défaut (pipeline vide / no-op), **when** aucun facteur Wave C activé, **then** comportement **identique** aux golden tests **19.2** et orchestration **19.3** (régression 0). [Source: epics 19.5 AC2 ; NFR-Q1]
3. **Given** `performWeightedDraw`, `scoreCandidates`, `toWeightedCandidates`, **when** refactor, **then** **un seul** chemin de calcul des poids via le pipeline (entrée = `weightForParticipant` ou équivalent centralisé). [Source: epics 19.5 AC3 ; ADR invariant « % = draw »]
4. **Couverture :** NFR-Q1. **UI : N/A**. **Priorité :** P1. **Depends :** 19.3 (done).

---

## Acceptance Criteria — Material 3 (UI)

**UI : N/A** — pas de changement sous `apps/web/` ni `legacy/`.

---

## Tasks / Subtasks

- [x] **Périmètre :** `services/api/` uniquement — package `availability/draw/` ; **ne pas** implémenter `PastParticipationFactor` (**19.6**) ni facteurs Wave C.
- [x] **Types pipeline** — `DrawWeightContext`, `DrawWeightFactor`, `DrawWeightPipeline` (+ registry `DrawWeightPipelines.DEFAULT` vide). (AC1)
- [x] **Refactor calculator** — `AvailabilityChanceCalculator.weightForParticipant` délègue au pipeline ; base legacy = formule V1 actuelle (`malus × requiredCount`) jusqu'à **19.6**. (AC2, AC3)
- [x] **Chemin unique** — vérifier que `toWeightedCandidates` → `scoreCandidates` → poids utilisés par `performWeightedDraw` passent par le même calcul ; pas de duplication dans `CompositionDrawService` / `AvailabilityService`. (AC3)
- [x] **Tests unitaires pipeline** — stub/no-op, ordre, produit multiplicatif. (AC1)
- [x] **Gate régression** — `DrawGoldenTest`, `DrawOrchestrationGoldenTest`, `AvailabilityChanceCalculatorTest`, suite API complète. (AC2)

---

## Dev Notes

### Normative sources (read order)

1. [`docs/v2/technical/draw-weight-engine-v1-spec.md`](../../docs/v2/technical/draw-weight-engine-v1-spec.md) — formule V1, invariant `% = draw`, golden contract
2. [`docs/adr/0019-draw-weight-engine.md`](../../docs/adr/0019-draw-weight-engine.md) — `finalWeight = base × Π factorMultiplier`
3. [`_bmad-output/planning-artifacts/epics.md`](../planning-artifacts/epics.md) — Story 19.5 AC
4. [`AvailabilityChanceCalculator.kt`](../../services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityChanceCalculator.kt) — cœur actuel
5. [`CompositionDrawService.kt`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionDrawService.kt) — consomme `toWeightedCandidates` / `scoreCandidates`
6. [`AvailabilityService.kt`](../../services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityService.kt) — Dispos **Tous %** via `scoreCandidates`

### Current runtime (preserve until 19.6)

**`weightForParticipant`** — formule V1 inchangée via `legacyBaseWeight` puis pipeline vide (×1).

**Call graph after 19.5:**

| Entry | Uses weights via |
|-------|------------------|
| `weightForParticipant` | `legacyBaseWeight` → `DrawWeightPipeline.apply` |
| `toWeightedCandidates` | `weightForParticipant` per candidate |
| `scoreCandidates` | `toWeightedCandidates` |
| `performWeightedDraw` | pre-built weights from `toWeightedCandidates` |

### Architecture target (19.5)

```
DrawWeightContext(participantId, roleKey, pastSelectionCount, requiredCount)
       ↓
legacyBaseWeight(context)  // malus × requiredCount — until 19.6 splits base + PastParticipationFactor
       ↓
DrawWeightPipeline.apply(base, context)  // DEFAULT = empty → ×1.0
       ↓
finalWeight
```

### Explicit non-goals

- Do **not** add `PastParticipationFactor` (story **19.6**).
- Do **not** modify golden JSON fixtures unless a proven spec bug.
- Do **not** wire Spring `@Configuration` for formulas (Wave D **19.16**).

## Dev Agent Record

### Agent Model Used

Composer (Cursor agent)

### Completion Notes List

- Introduced `availability/draw/` package: `DrawWeightContext`, `DrawWeightFactor`, `DrawWeightPipeline`, `DrawWeightPipelines.DEFAULT` (empty no-op registry).
- `AvailabilityChanceCalculator.weightForParticipant` builds context, computes `legacyBaseWeight`, applies optional `pipeline` param (default empty).
- `toWeightedCandidates` / `scoreCandidates` propagate `pipeline` and `roleKey` for future factors; production callers unchanged (defaults).
- Unit tests: `DrawWeightPipelineTest` (no-op, stub, order, product) + pipeline smoke in `AvailabilityChanceCalculatorDrawTest`.
- Regression gate green: `DrawGoldenTest`, `DrawOrchestrationGoldenTest`, `AvailabilityChanceCalculatorTest`, `DrawWeightPipelineTest`, `AvailabilityChanceCalculatorDrawTest`.

### File List

- `services/api/src/main/kotlin/com/hatcast/api/availability/draw/DrawWeightContext.kt` (new)
- `services/api/src/main/kotlin/com/hatcast/api/availability/draw/DrawWeightFactor.kt` (new)
- `services/api/src/main/kotlin/com/hatcast/api/availability/draw/DrawWeightPipeline.kt` (new)
- `services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityChanceCalculator.kt` (modified)
- `services/api/src/test/kotlin/com/hatcast/api/availability/draw/DrawWeightPipelineTest.kt` (new)
- `services/api/src/test/kotlin/com/hatcast/api/availability/AvailabilityChanceCalculatorDrawTest.kt` (modified)
- `services/api/src/main/kotlin/com/hatcast/api/composition/CompositionDrawService.kt` (modified — code review)
- `services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityService.kt` (modified — code review)
- `services/api/src/main/kotlin/com/hatcast/api/composition/CompositionSlotAssignmentService.kt` (modified — code review)
- `services/api/src/main/kotlin/com/hatcast/api/composition/CompositionService.kt` (modified — code review)
- `_bmad-output/implementation-artifacts/19-5-pipeline-draw-weight-factor.md` (new)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (modified)

### Change Log

- 2026-06-07 : Story created (create-story).
- 2026-06-07 : Pipeline architecture implemented ; golden regression gate green.
- 2026-06-07 : Code review — `roleKey` propagé aux appelants prod ; sprint-status `last_updated` corrigé ; story → done.

---

### Validation create-story

- [x] AC métier numérotés et sourcés (epics / FR)
- [x] Section **Material 3** remplie **ou** **UI : N/A** explicite
- [x] Tasks référencent les numéros d'AC
- [x] Liens vers fichiers code existants à réutiliser
- [x] `./gradlew test` mentionné pour gate API

### Review Findings

- [x] [Review][Decision] Propager `roleKey` aux appelants production — câblé dans `CompositionDrawService`, `AvailabilityService`, `CompositionSlotAssignmentService`, `CompositionService`.
- [x] [Review][Patch] `last_updated` sprint-status régressé [`sprint-status.yaml:40`] — corrigé à `2026-06-07T15:51:06+02:00`.
- [x] [Review][Defer] Garde-fous multiplicateurs pipeline (NaN, négatif, infini) [`DrawWeightPipeline.kt:13-15`] — deferred, aucun facteur Wave C en 19.5 ; traiter avec premier facteur réel (**19.6**).
- [x] [Review][Defer] `pastSelectionCount` négatif non validé [`AvailabilityChanceCalculator.kt:68-69`] — deferred, contrat appelant inchangé depuis V1 ; pas introduit par ce diff.
- [x] [Review][Defer] `DrawWeightContext` sans `eventId` (AC1 libellé complet) [`DrawWeightContext.kt:9-14`] — deferred, extension prévue Wave B/C (**19.6+**) selon story.
- [x] [Review][Defer] Spec normative sans section pipeline [`draw-weight-engine-v1-spec.md`] — deferred, comportement identique ; architecture documentée dans story + ADR 0019.
- [x] [Review][Defer] Double calcul poids par step tirage [`CompositionDrawService.kt:217-239`] — deferred, pré-existant (`toWeightedCandidates` puis `scoreCandidates`) ; hors périmètre 19.5.
