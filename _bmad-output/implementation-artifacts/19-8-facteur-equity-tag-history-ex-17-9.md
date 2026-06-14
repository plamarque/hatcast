---
feature_branch: feat/19-8-facteur-equity-tag-history-ex-17-9
baseline_commit: a04579ae6ae039a42c2499c93bd9d0336900a7e5
---

# Story 19.8 : Facteur historique partitionné par `category` *(durcissement ex-17.9)*

Status: done

<!-- Ultimate context engine analysis completed — comprehensive developer guide created -->

## Story

En tant que **développeur**,  
je veux que la **partition par compartiment** (`category`, ex-`equity_tag`) soit un **facteur explicite** du pipeline avec tests golden,  
afin de **préserver** le comportement **17.9** lors des refactors Epic 19 et de verrouiller la divergence V1↔V2 documentée (**G-01**).

## Acceptance Criteria

### Moteur & historique

1. **Given** le comportement actuel `CompositionSelectionHistoryService` + `SpectacleCategory` + JPQL `EventCompositionSlotRepository`, **when** **19.8** livré, **then** partition `(season_id, categorySlug)` **identique** — golden **19.2** / **19.3** existants **100 % green** sans modifier leurs fixtures JSON. [Source: epics 19.8 AC1 ; NFR-Q1]
2. **Given** événement principal (`category` null, pas `templateType = deplacement`), **when** tirage ou summary Dispos, **then** participations sur catégories exclusives (`deplacements`, `aperock`, glossaire **17.7**) **non** comptées dans `pastSelectionCount`. [Source: epics 19.8 AC2 ; 17.9 ; ADR 0013 §3]
3. **Given** scénarios régression Malice / déplacements / Apérock, **when** tests intégration, **then** couverts — réutiliser / renforcer `CompositionDrawIntegrationTest` (`selection history is scoped to category`, `legacy deplacement template…`, `aperock compartment isolates…`). [Source: epics 19.8 AC3 ; FR19]
4. **Given** `CategoryCompartmentFactor` (`FACTOR_ID = equity_tag`) + `PastParticipationFactor` dans `DrawWeightPipelines.DEFAULT`, **when** calcul poids, **then** `finalWeight` **identique** au runtime pré-19.8 (régression 0 sur poids et `%`). [Source: epics 19.8 AC4 ; ADR 0019]
5. **Given** nouvelles fixtures golden compartiment sous `services/api/src/test/resources/draw/golden/compartment/`, **when** `./gradlew test`, **then** cas figés : principal vs `deplacements`, principal vs glossaire custom (`aperock`), legacy `templateType = deplacement`. [Source: spec § Golden — compartment scope ; G-01]
6. **Given** requête SQL historique, **when** refactor, **then** **aucune** sémantique JPQL modifiée sans golden vert — extraire / centraliser, ne pas réécrire le filtre. [Source: epics 19.8 AC5 « Ne pas réécrire la requête SQL sans golden vert »]

### Explainability (consommation 19.7)

7. **Given** breakdown explainability actif (**19.7**), **when** `pastSelectionCountUnscoped > pastSelectionCount` (sélections dans d’autres compartiments), **then** ligne `equity_tag` dans `adjustments[]` avec label FR produit du type « Compté dans un autre type de spectacle » et delta cohérent avec l’écart `referencePercent` / `chancePercent` (tolérance ±1 pt). **Given** aucun écart compartiment, **then** ligne omise (delta 0). [Source: ux-design-factor-breakdown-19-7.md § Copy FR ; epics 19.7]
8. **Given** seul `equity_tag` + `past_participation` actifs (DEFAULT), **when** breakdown sans écart compartiment, **then** une seule ligne `past_participation` (comportement as-shipped **19.7**).

### Documentation

9. **Given** implémentation livrée, **when** docs mises à jour, **then** [`draw-weight-engine-v1-spec.md`](../../docs/v2/technical/draw-weight-engine-v1-spec.md) : compartiment **IN** scope 19.8 (retirer « OUT → 19.8 » sur `toWeightedCandidates` / history SQL) ; [`docs/adr/0019-draw-weight-engine.md`](../../docs/adr/0019-draw-weight-engine.md) : mentionner `CategoryCompartmentFactor` / `equity_tag` dans DEFAULT pipeline. [Source: spec handoff ; ADR 0019]

**Couverture produit :** ADR 0013 §3–§5 ; FR19, FR20 ; gap **G-01**. **Priorité :** P2. **Depends :** 19.6 (done), 17.7/17.9 (done), 19.7 (done — labels breakdown).

---

## Acceptance Criteria — Material 3 (UI)

**UI : N/A** — pas de changement sous `apps/web/` ; copy breakdown `equity_tag` servie par l’API (consommée par `app-chance-breakdown-sheet` existant).

---

## Tasks / Subtasks

Ordre d’implémentation **obligatoire** (régression golden en gate à chaque étape).

### 1. Centraliser le scope compartiment (AC 1, 2, 6)

- [x] **Périmètre :** `services/api/` — package `availability/draw/` + `composition/` + `event/SpectacleCategory.kt`.
- [x] **`CategoryCompartmentHistoryScope`** (nom final au choix dev) — module unique : résolution `categorySlug` via `SpectacleCategory.slug(event)` ; documenter alignement avec JPQL `countValidatedSelectionsBySeasonAndCategory` / `countValidatedSelectionsBeforeEvent`. (AC 2, 6)
- [x] **Refactor `CompositionSelectionHistoryService`** — déléguer au module scope ; conserver signatures publiques ; **optionnel** : méthode `pastSelectionCountUnscoped…` (toutes catégories) pour explainability — **ne pas** l’exposer en prod si coût SQL inacceptable ; préférer requête dédiée légère ou calcul delta breakdown sans double scan complet si possible. (AC 7)
- [x] **Tests unitaires** — étendre `CompositionSelectionHistoryServiceTest` + `SpectacleCategoryTest` : `principal`, `deplacements`, legacy `templateType`, slug glossaire. (AC 2, 3)
- [x] **Gate** — `./gradlew test --tests CompositionSelectionHistoryServiceTest --tests SpectacleCategoryTest`

### 2. Facteur pipeline `CategoryCompartmentFactor` (AC 4)

- [x] **`CategoryCompartmentFactor`** — `object` implémentant `LabeledDrawWeightFactor` ; `const val FACTOR_ID = "equity_tag"`. (AC 4)
- [x] **Étendre `DrawWeightContext`** — ajouter au minimum `categorySlug: String` ; pour breakdown : `pastSelectionCountUnscoped: Int?` (ou champs dérivés calculés au build du contexte). (AC 4, 7)
- [x] **Mettre à jour les builders de contexte** — `CompositionDrawService`, `CompositionSlotAssignmentService`, `CompositionExplainabilityService`, `AvailabilityChanceCalculator` call sites : passer `categorySlug` (+ unscoped si implémenté). (AC 4)
- [x] **`DrawWeightPipelines.DEFAULT`** — ordre : `[CategoryCompartmentFactor, PastParticipationFactor]` ; `CategoryCompartmentFactor.multiplier` = `1.0` **si** le compartiment reste appliqué via `pastSelectionCount` scoped (invariant poids) **OU** refactor documenté où le facteur compartiment ajuste le count effectif — **dans les deux cas**, poids final inchangé. (AC 4)
- [x] **`adjustmentLabel`** — copy FR : « Compté dans un autre type de spectacle » (variante PO acceptable si plus précise, ex. mention du compartiment courant). (AC 7)
- [x] **Tests unitaires** — `CategoryCompartmentFactorTest`, adapter `DrawWeightPipelineTest` / `PastParticipationFactorTest` pour DEFAULT à 2 facteurs. (AC 4)
- [x] **Gate** — `./gradlew test --tests '*CategoryCompartment*' --tests DrawWeightPipelineTest --tests PastParticipationFactorTest --tests DrawGoldenTest --tests DrawOrchestrationGoldenTest`

### 3. Golden compartiment (AC 1, 5)

- [x] **Fixtures JSON** — `services/api/src/test/resources/draw/golden/compartment/*.json` : au moins 3 scénarios (principal isolé, deplacements, custom slug) avec `pastSelectionCountByParticipant`, `categorySlug`, poids et `%` attendus. (AC 5)
- [x] **`DrawCompartmentGoldenTest`** (ou extension `DrawGoldenTest`) — charge fixtures compartiment ; assert poids + `chancePercent` ±1 pt. (AC 5)
- [x] **Ne pas modifier** les fixtures golden Wave A existantes (`draw/golden/*.json` hors `compartment/`). (AC 1)

### 4. Intégration & régression (AC 3)

- [x] **Conserver / renforcer** `CompositionDrawIntegrationTest` compartiment — tags `@Tag("FR19")` ; pas de régression sur assertions veteran/rookie. (AC 3)
- [x] **Gate intégration** — `./gradlew test --tests CompositionDrawIntegrationTest`

### 5. Breakdown explainability (AC 7, 8)

- [x] **`ChanceBreakdownCalculator`** — intégrer delta `equity_tag` quand unscoped > scoped ; omettre si égal ; réconciliation snapshot (**19.7** re-review) si applicable. (AC 7, 8)
- [x] **Tests** — `ChanceBreakdownCalculatorTest` : cas veteran principal avec historique away-only → ligne `equity_tag` ; cas même compartiment → pas de ligne. (AC 7, 8)
- [x] **Gate** — `./gradlew test --tests '*ChanceBreakdown*'`

### 6. Documentation (AC 9)

- [x] **`draw-weight-engine-v1-spec.md`** — § compartiment : règles `SpectacleCategory`, lien factor `equity_tag`, golden path `compartment/` ; mettre à jour tableau G-01 (follow-up = done). (AC 9)
- [x] **`docs/adr/0019-draw-weight-engine.md`** — DEFAULT pipeline = 2 facteurs ; Wave C note : compartiment **toujours actif** (pas toggle formula until **19.16**). (AC 9)

---

## Dev Notes

### Décisions produit figées (ne pas rouvrir)

| ID | Décision |
|----|----------|
| **Scope** | **Refactor + golden**, pas greenfield — comportement **17.9** = fait foi |
| **FACTOR_ID** | `equity_tag` (copy UX **19.7**) — pas renommer en `category` côté API breakdown |
| **DEFAULT** | Compartiment **toujours on** avec `past_participation` — pas de flag troupe en 19.8 (**19.16+** pour toggles) |
| **SQL** | Extraire / centraliser ; **interdit** de changer le filtre JPQL sans golden vert |
| **Golden Wave A** | Fixtures **19.2** inchangées — nouveaux fichiers sous `compartment/` uniquement |
| **V1 parity** | **G-01** : V2 multi-slug est **intentionnel** vs V1 binaire `deplacement` — golden documente V2, ne pas « corriger » vers V1 |

### État runtime actuel (baseline `a04579ae`)

Le compartiment est **déjà** appliqué **avant** le pipeline, dans la couche historique :

```25:46:services/api/src/main/kotlin/com/hatcast/api/composition/CompositionSelectionHistoryService.kt
    fun pastSelectionCountByParticipantAndRole(
        event: EventEntity,
        mode: SelectionHistoryMode,
    ): Map<Pair<UUID, String>, Int> {
        val compartment = SpectacleCategory.slug(event)
        val rows =
            when (mode) {
                SelectionHistoryMode.OPERATIONAL ->
                    slotRepository.countValidatedSelectionsBySeasonAndCategory(
                        event.season.id,
                        event.id,
                        compartment,
                    )
                // ...
            }
```

`PastParticipationFactor` consomme un `pastSelectionCount` **déjà scoped** :

```15:18:services/api/src/main/kotlin/com/hatcast/api/availability/draw/PastParticipationFactor.kt
    override fun multiplier(context: DrawWeightContext): Double {
        val past = max(0, context.pastSelectionCount)
        return 1.0 / (1.0 + past)
    }
```

**Objectif 19.8 :** rendre cette responsabilité **visible** dans l’architecture facteurs (registry DEFAULT, `FACTOR_ID`, breakdown) **sans** changer le résultat numérique.

### Architecture cible recommandée

```
EventEntity
    ↓
SpectacleCategory.slug(event)  →  categorySlug
    ↓
CategoryCompartmentHistoryScope  →  SQL (inchangé)  →  pastSelectionCount (scoped)
    ↓                                              →  pastSelectionCountUnscoped (opt., breakdown)
DrawWeightContext(..., categorySlug, pastSelectionCount, pastSelectionCountUnscoped?)
    ↓
DrawWeightPipelines.DEFAULT = [CategoryCompartmentFactor, PastParticipationFactor]
    ↓
finalWeight = requiredCount × 1.0 × 1/(1+pastSelectionCount)   // identique aujourd'hui
    ↓
ChanceBreakdownCalculator  →  adjustments[] incl. equity_tag si unscoped > scoped
```

**Pattern `CategoryCompartmentFactor` (minimal, régression 0) :**

- `multiplier(context) = 1.0` — le malus compartiment est reflété dans `pastSelectionCount` scoped.
- Explainability : comparer pipeline avec count unscoped vs scoped pour produire le delta `equity_tag` (voir UX copy).
- Alternative **plus invasive** (seulement si review exige) : `PastParticipationFactor` prend count unscoped et `CategoryCompartmentFactor` encode l’effet compartiment — **interdit** sans golden complet + accord explicite car risque régression.

### Fichiers API — actions probables

| Fichier | Action |
|---------|--------|
| `event/SpectacleCategory.kt` | **Lire** — source slug ; garder `eventInCategory` aligné JPQL |
| `composition/EventCompositionSlotRepository.kt` | **Lire** — JPQL `:categorySlug` ; **ne pas** changer sans golden |
| `composition/CompositionSelectionHistoryService.kt` | **Refactor** — déléguer scope ; option unscoped query |
| `availability/draw/CategoryCompartmentFactor.kt` | **NEW** |
| `availability/draw/CategoryCompartmentHistoryScope.kt` | **NEW** (nom suggéré) |
| `availability/draw/DrawWeightContext.kt` | **Extend** — `categorySlug`, optional unscoped |
| `availability/draw/DrawWeightPipeline.kt` | **Update** DEFAULT registry comment |
| `composition/CompositionDrawService.kt` | **Update** context builders |
| `composition/CompositionSlotAssignmentService.kt` | **Update** context builders |
| `composition/CompositionExplainabilityService.kt` | **Update** pool / breakdown inputs |
| `availability/draw/ChanceBreakdownCalculator.kt` | **Update** delta `equity_tag` |
| `availability/AvailabilityChanceCalculator.kt` | **Update** si contexte construit ici |
| `test/.../DrawCompartmentGoldenTest.kt` | **NEW** |
| `test/resources/draw/golden/compartment/*.json` | **NEW** |

### Règles compartiment (rappel normatif)

| `categorySlug` | Événements comptés dans l’historique |
|----------------|--------------------------------------|
| `principal` | `category IS NULL` AND `templateType <> 'deplacement'` |
| `deplacements` | `category = 'deplacements'` OR (`category IS NULL` AND `templateType = 'deplacement'`) |
| `{slug}` glossaire | `category = slug` |

Source : `SpectacleCategory.kt` + JPQL `EventCompositionSlotRepository.kt:32-36`. UI label principal = **Spectacles ordinaires** (**17.10**).

### Tests d’intégration existants (ne pas casser)

| Test | Fichier | Vérifie |
|------|---------|---------|
| `selection history is scoped to category` | `CompositionDrawIntegrationTest.kt:689` | Away `category=deplacements` n’affecte pas chances principal |
| `legacy deplacement template scopes history…` | `:727` | Legacy `templateType=deplacement` |
| `aperock compartment isolates history…` | `:763` | Glossaire custom isolé |

Helper partagé : `assertPrincipalChancesEqualAfterAwayAssignment`.

### Explicit non-goals

- **Pas** de changement UI Angular (**UI : N/A**).
- **Pas** de toggle admin compartiment / formules (**19.16–19.22**).
- **Pas** de modification stats **17.10** (`SeasonStatisticsCategoryFilter` — filtre agrégat, pas tirage).
- **Pas** de backfill MIG-4 (`deplacement` → tag) — hors scope.
- **Pas** de changement sémantique `SelectionHistoryMode` OPERATIONAL / RETROSPECTIVE (**E-02**).
- **Pas** de réouverture copy as-shipped **19.7** (waterfall, pool preview) sauf ligne `equity_tag` additionnelle.

### Dependencies

| Story | Status | Relationship |
|-------|--------|--------------|
| 17.7 | done | Glossaire catégories troupe |
| 17.9 | done (impl) | Comportement livré — **19.8** = durcissement pipeline |
| 19.5 | done | Shell `DrawWeightPipeline` |
| 19.6 | done | `PastParticipationFactor` — **ne pas** changer formule malus |
| 19.7 | done | Breakdown — consommer `equity_tag` label/delta |
| 19.2, 19.3 | done | Golden gate — fixtures inchangées |
| 19.9+ | backlog | Rejouer immédiatement réutilisera même compartiment (**19.8**) |

### Previous story intelligence (19.7)

- Story **19.7** Dev Notes : « **Pas** de modification `CompositionSelectionHistoryService` (**19.8**) » — **19.8** est **autorisée** à refactorer ce service ; ne pas toucher UI sheet sauf consommation API.
- `ChanceBreakdownCalculator` : deltas séquentiels par facteur ; tolérance ±1 pt ; réconciliation snapshot si `chancePercent` figé (**6.14**).
- `LabeledDrawWeightFactor` + `FACTOR_ID` stable — pattern à copier pour `equity_tag`.
- Review **19.7** : un seul facteur en prod → refactor O(n²) acceptable ; avec 2 facteurs DEFAULT, rester simple.

### Previous story intelligence (19.6)

- `DrawWeightPipelines.DEFAULT` was `[PastParticipationFactor]` only — **19.8** devient `[CategoryCompartmentFactor, PastParticipationFactor]`.
- AC2 **19.6** : « extension partition = **19.8** uniquement » — c’est **cette** story.
- Golden **19.2** must stay green without JSON edits.

### Git intelligence (commits récents)

| Commit | Insight |
|--------|---------|
| `a04579ae` | Branche baseline — hub troupe admin trigger (hors scope draw) |
| Epic 19 draw work | Patterns dans `PastParticipationFactor`, `ChanceBreakdownCalculator`, `DrawGoldenTest` |

### Commandes test (gate story)

```bash
# Gate principal — compartiment + non-régression
./gradlew test \
  --tests '*CategoryCompartment*' \
  --tests CompositionSelectionHistoryServiceTest \
  --tests SpectacleCategoryTest \
  --tests DrawGoldenTest \
  --tests DrawOrchestrationGoldenTest \
  --tests '*DrawCompartment*' \
  --tests CompositionDrawIntegrationTest \
  --tests '*ChanceBreakdown*' \
  --tests DrawWeightPipelineTest \
  --tests PastParticipationFactorTest \
  --tests AvailabilityChanceCalculatorDrawTest
```

### Latest tech notes

- Kotlin **Spring Boot** — pas de nouvelle dépendance ; rester dans `availability/draw/`.
- Golden fixtures : suivre le format `DrawGoldenFixture.kt` / champs `input.pastSelectionCountByParticipant`, `requiredCount`, `expected.weights`, `expected.chancePercents`.
- Si requête « unscoped » ajoutée : préférer **une** requête SQL agrégée réutilisable par breakdown batch (éviter N+1 sur pool preview).

---

## Dev Agent Record

### Agent Model Used

Composer (dev-story 19.8)

### Completion Notes List

- `CategoryCompartmentHistoryScope` centralise slug + requêtes scoped/unscoped ; JPQL existant inchangé ; nouvelles requêtes `*AllCategories` pour breakdown.
- `CategoryCompartmentFactor` (`equity_tag`) ajouté en tête de `DrawWeightPipelines.DEFAULT` avec `multiplier = 1.0` — régression 0 sur poids et % (golden Wave A + orchestration verts).
- `ChanceBreakdownCalculator` : waterfall `equity_tag` quand `unscoped > scoped` (malus cross-compartiment simulé puis relief `past_participation`).
- Golden compartiment : `draw/golden/compartment/principal-deplacements-aperock.json` + `DrawCompartmentGoldenTest`.
- Docs : spec § History compartment + G-01 done ; ADR 0019 DEFAULT à 2 facteurs.
- Gates Gradle : CategoryCompartment*, CompositionSelectionHistoryServiceTest, SpectacleCategoryTest, DrawGoldenTest, DrawOrchestrationGoldenTest, DrawCompartmentGoldenTest, CompositionDrawIntegrationTest, ChanceBreakdownCalculatorTest, DrawWeightPipelineTest, PastParticipationFactorTest, AvailabilityChanceCalculatorDrawTest — all green.

### File List

- services/api/src/main/kotlin/com/hatcast/api/availability/draw/CategoryCompartmentHistoryScope.kt (new)
- services/api/src/main/kotlin/com/hatcast/api/availability/draw/CategoryCompartmentFactor.kt (new)
- services/api/src/main/kotlin/com/hatcast/api/availability/draw/DrawWeightContext.kt
- services/api/src/main/kotlin/com/hatcast/api/availability/draw/DrawWeightPipeline.kt
- services/api/src/main/kotlin/com/hatcast/api/availability/draw/ChanceBreakdownCalculator.kt
- services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityChanceCalculator.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/CompositionSelectionHistoryService.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/EventCompositionSlotRepository.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/CompositionExplainabilityService.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/CompositionDrawService.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/CompositionSlotAssignmentService.kt
- services/api/src/test/kotlin/com/hatcast/api/availability/draw/CategoryCompartmentFactorTest.kt (new)
- services/api/src/test/kotlin/com/hatcast/api/availability/draw/CategoryCompartmentHistoryScopeTest.kt (new)
- services/api/src/test/kotlin/com/hatcast/api/availability/DrawCompartmentGoldenTest.kt (new)
- services/api/src/test/kotlin/com/hatcast/api/availability/DrawGoldenFixture.kt
- services/api/src/test/kotlin/com/hatcast/api/availability/draw/ChanceBreakdownCalculatorTest.kt
- services/api/src/test/kotlin/com/hatcast/api/composition/CompositionSelectionHistoryServiceTest.kt
- services/api/src/test/resources/draw/golden/compartment/principal-deplacements-aperock.json (new)
- docs/v2/technical/draw-weight-engine-v1-spec.md
- docs/adr/0019-draw-weight-engine.md

### Change Log

- 2026-06-14 : Story créée (`bmad-create-story` 19.8) — statut `ready-for-dev`.
- 2026-06-14 : Implémentation 19.8 — compartiment factor pipeline + golden + breakdown equity_tag ; statut `review`.
- 2026-06-14 : Code review — 4 patches appliqués (golden COMP-P2/L1, categorySlug draw paths, test rétrospectif scopé) ; statut `done`.

### Review Findings

- [x] [Review][Patch] COMP-P1 ne démontre pas l’isolation away-only — corrigé : description COMP-P1 + fixture COMP-P2 (scoped 0 / unscoped 3) [`principal-deplacements-aperock.json`]
- [x] [Review][Patch] Golden legacy `templateType = deplacement` manquant — ajout COMP-L1 [`draw/golden/compartment/`]
- [x] [Review][Patch] `categorySlug` non propagé sur les chemins draw — `SpectacleCategory.slug(event)` passé dans `CompositionDrawService` et `CompositionSlotAssignmentService`
- [x] [Review][Patch] Test rétrospectif scopé absent — ajout dans `CategoryCompartmentHistoryScopeTest`
- [x] [Review][Defer] Double requête SQL sur explainability — `buildRolePoolContext` exécute scoped + unscoped par rôle ; coût perf accepté pour 19.8, optimisation reportée [`CompositionExplainabilityService.kt:222-226`] — deferred, trade-off documenté en Dev Notes
- [x] [Review][Defer] Branche spéciale `when (CategoryCompartmentFactor)` dans breakdown — acceptable pour DEFAULT à 2 facteurs ; extensibilité à revoir quand d’autres facteurs « narratifs » arrivent [`ChanceBreakdownCalculator.kt:104`] — deferred, hors scope 19.8
- [x] [Review][Defer] Pas de test d’intégration bout-en-bout `CompositionExplainabilityService` → delta `equity_tag` — couvert par tests unitaires `ChanceBreakdownCalculatorTest` + intégration draw compartiment — deferred, couverture suffisante pour merge

---

### Validation create-story

- [x] AC métier numérotés et sourcés (epics / FR / ADR / UX)
- [x] Section **Material 3** = **UI : N/A**
- [x] Tasks référencent les numéros d’AC
- [x] Liens vers fichiers code existants à réutiliser
- [x] `./gradlew test` gates documentés
- [x] Non-goals explicites ; invariant régression 0
- [x] Frontmatter `feature_branch` + `baseline_commit`
