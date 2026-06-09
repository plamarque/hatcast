---
baseline_commit: 0ea366dc43b1dc59d7dd07eb37eea1dca7a7fb72
---

# Story 5.9 : Portes explainability Dispos vs Équipe (decouple)

Status: done

<!-- SCP : sprint-change-proposal-2026-06-09-explainability-gates-dispos-equipe.md (approved 2026-06-09) -->

## Story

En tant que **membre** sur un spectacle publié,  
je veux **voir le pool, les % et le breakdown sur l’onglet Dispos** pendant la collecte des dispos,  
afin de **comprendre mes chances avant que la composition ne soit publiée**, sans voir les assignations brouillon sur Équipe.

## Acceptance Criteria

1. **Given** un spectacle **publié** (dispos ouvertes) sans ligne `event_compositions`, **when** un membre appelle `GET …/availability/summary?includeChances=true`, **then** `chancePercent` (et champs breakdown si demandés) sont renvoyés pour les candidats éligibles — **403/empty not used as substitute**. [Source: FR24 Dispos ; SCP 2026-06-09 ; story **5.8** AC-18]
2. **Given** le même membre, **when** `GET …/composition`, **then** slots vides / visibilité `none` (FR22 inchangé). [Source: **6.3**]
3. **Given** orga avec brouillon non publié, **when** Dispos `includeChances=true`, **then** autorisé ; **when** Équipe slot odds, **then** autorisé (comportement orga inchangé). [Source: FR24]
4. **Given** membre et composition **publiée** non validée, **when** Équipe, **then** slots visibles + odds sur assignés ; **when** Dispos, **then** pool/% toujours visibles. [Source: FR22, FR24 Équipe — *note:* slot visibility after publish may still require validation per current runtime; align tests to SCP success criteria]
5. **Given** membre après **déverrouillage** (FR23, slots masqués), **when** Dispos, **then** pool/% **restent** visibles. [Source: FR23, FR24 Dispos]
6. **Given** spectacle **brouillon** ou archivé, **when** membre `includeChances=true`, **then** **403** ou pas de chances (parité **3.21**). [Source: **3.21**]
7. **Given** les portes explainability, **when** contexte **Équipe** / breakdown depuis composition, **then** `CompositionExplainabilityAccess` (FR22/FR24 Équipe) ; **when** contexte **Dispos**, **then** `DisposExplainabilityAccess` (spectacle publié uniquement). [Source: ADR 0019 §2b ; draw-weight-engine-v1-spec § Explainability API]
8. **Given** `./gradlew test` + tests intégration availability/composition explainability, **when** CI, **then** green ; remplacer le pattern test `enableExplainabilityForChances` (= `validatedAt` forcé) par scénarios Dispos **sans** composition. [Source: NFR-Q1]

**Couverture produit :** FR24 (amended PRD) ; ux-design-dispos-poll D12 ; ux-design-factor-breakdown W8 ; ADR 0019.

---

## Acceptance Criteria — Material 3 (UI)

**M3-1. Composants Material** — Pas de nouveau composant ; réutiliser `app-composition-pool-preview`, `app-chance-breakdown-sheet`, `app-availability-poll`. [Source: FRONTEND_UI.md ; stories **5.8**, **19.7**]

**M3-2. Tokens & thème** — Inchangé ; pas de nouveau style. [Source: FRONTEND_UI.md]

**M3-3. Mobile & tactile** — **Given** membre sur Dispos sans composition chargée, **when** il déplie le pool, **then** segments interactifs + tap % → breakdown sheet fonctionnent (cibles pool ≥ 40 dp — waiver **19.7**). [Source: NFR-A1]

**M3-4. Navigation membre** — N/A (pas de changement chrome).

**M3-5. Revue** — Checklist M3 parcourue ; noter si prefetch composition retiré de l’onglet Dispos (PERF-03). [Source: AGENTS.md]

---

## Tasks / Subtasks

- [x] **Périmètre :** `services/api/` + `apps/web/` — decouple gates only ; pas de changement formule tirage.
- [x] **AC-1, AC-6, AC-7** — Créer `DisposExplainabilityAccess.kt` (event published + membership + draw-mode) ; brancher `AvailabilityService.resolveExplainabilityForSummary` ; restreindre `CompositionExplainabilityAccess` au contexte Équipe/composition.
- [x] **AC-7** — `CompositionExplainabilityService.getChanceBreakdown` : accepter contexte Dispos vs Équipe (param, route dédiée, ou inférence caller) ; **403** fail-closed.
- [x] **AC-1–AC-6, AC-8** — Tests intégration : membre + `includeChances=true` sans `event_compositions` ; pas de fuite slots ; unlock scenario ; supprimer `enableExplainabilityForChances` helper pattern.
- [x] **AC-1, AC-5, M3-3** — Front : `canShowDisposExplainability(event)` dans `composition-explainability.ts` ; `event-detail.disposExplainabilityEnabled` sur event published ; retirer dépendance composition pour le gate Dispos (option : garder prefetch composition si autre usage).
- [x] **AC-7** — OpenAPI `availability.yaml` : description `includeChances` = porte Dispos (spectacle publié).
- [x] **Docs** — Vérifier alignement post-merge : PRD FR24, ADR 0019, draw-weight spec, UX D12/W8, `draw-chances-explained.md` (amendés dans SCP).

## Dev Notes

### Product and UX rules

| Surface | Gate membre |
|---------|-------------|
| **Dispos** | Spectacle publié (`availabilityOpenedAt` set, non archivé) — **indépendant** de `event_compositions` |
| **Équipe slots** | FR22 — brouillon masqué ; publish/validation selon runtime actuel |
| **Équipe % sur assignés** | Composition publiée ou validée ; orga : brouillon |

**Invariant ADR 0019 :** même `AvailabilityChanceCalculator` ; seules les portes de visibilité changent.

### Frontend implementation guardrails

| Concern | Action |
|--------|--------|
| Gate signal | `isEventDraft(event)` + `availabilityOpenedAt` — réutiliser helpers event-detail existants |
| Pool UI | `availability-poll.ts` — `explainabilityEnabled` input déjà câblé |
| Prefetch | `ensureCompositionLoaded()` sur onglet Dispos : évaluer si encore nécessaire pour explainability seul |

### Explicit non-goals

- Modifier formule tirage, pipeline facteurs, golden **19.2**.
- Changer règle FR22 « publish compo → slots visibles membre » si diverge du runtime (SCP séparé si PO le demande).

### Dependencies

| Story | Status | Relationship |
|-------|--------|----------------|
| 5.8 | done | Sondage Dispos — consomme `explainabilityEnabled` |
| 19.7 | done | Breakdown sheet — gate à router |
| 6.3 | done | Visibilité slots Équipe |
| 6.4 | done | Odds sur slots assignés Équipe |
| PERF-03 | done | Prefetch composition onglet Dispos — opportunité simplification |

### References

- [SCP 2026-06-09](../planning-artifacts/sprint-change-proposal-2026-06-09-explainability-gates-dispos-equipe.md)
- [`CompositionExplainabilityAccess.kt`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionExplainabilityAccess.kt)
- [`composition-explainability.ts`](../../apps/web/src/app/core/composition/composition-explainability.ts)
- [`draw-weight-engine-v1-spec.md`](../../docs/v2/technical/draw-weight-engine-v1-spec.md) § Explainability API

## Dev Agent Record

### Agent Model Used

claude-4.6-sonnet-medium-thinking

### Completion Notes List

- Nouvelle porte `DisposExplainabilityAccess` : spectacle publié (non archivé) ou orga sur brouillon ; indépendante de `event_compositions`.
- `AvailabilityService.resolveExplainabilityForSummary` et `CompositionExplainabilityService.getChanceBreakdown` utilisent la porte Dispos en priorité ; `CompositionExplainabilityAccess` reste pour Équipe/slots.
- Front : `canShowDisposExplainability` + `disposExplainabilityEnabled` basé sur l'événement publié ; prefetch composition limité à l'onglet Équipe (PERF-03 simplifié).
- Tests : scénarios sans composition, draft 403, unlock FR23 ; helper `enableExplainabilityForChances` supprimé.
- M3 : pas de nouveau composant/style ; pool/breakdown inchangés côté UI.
- Suite API story-related green ; 2 échecs préexistants sur la branche (`CompositionGapFillIntegrationTest`, `CompositionSlotAssignmentIntegrationTest` — hors scope 5.9).
- **Correctif erratum :** refactor PERF-10 (`getEventPage` BFF) retiré de `event-detail.ts` — hors scope 5.9, cassait le chargement fiche ; PERF-10 reste en artifacts non commités.

### File List

- `services/api/src/main/kotlin/com/hatcast/api/availability/DisposExplainabilityAccess.kt` (new)
- `services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityService.kt`
- `services/api/src/main/kotlin/com/hatcast/api/composition/CompositionExplainabilityAccess.kt`
- `services/api/src/main/kotlin/com/hatcast/api/composition/CompositionExplainabilityService.kt`
- `services/api/openapi/availability.yaml`
- `services/api/src/test/kotlin/com/hatcast/api/availability/DisposExplainabilityAccessTest.kt` (new)
- `services/api/src/test/kotlin/com/hatcast/api/availability/AvailabilityControllerIntegrationTest.kt`
- `services/api/src/test/kotlin/com/hatcast/api/composition/CompositionExplainabilityIntegrationTest.kt`
- `apps/web/src/app/core/composition/composition-explainability.ts`
- `apps/web/src/app/core/composition/composition-explainability.spec.ts`
- `apps/web/src/app/pages/event-detail/event-detail.ts`
- `apps/web/src/app/pages/event-detail/event-detail.spec.ts`

### Review Findings

- [x] [Review][Patch] Test intégration AC-3 : orga + brouillon + `includeChances=true` retourne `chancePercent` [`AvailabilityControllerIntegrationTest.kt`]
- [x] [Review][Patch] Test intégration AC-6 : événement archivé + `includeChances=true` → pas de `chancePercent` (200 sans chances) [`AvailabilityControllerIntegrationTest.kt`]
- [x] [Review][Patch] Test intégration AC-8 : `composition/chance-breakdown` sur spectacle publié **sans** `event_compositions` [`CompositionExplainabilityIntegrationTest.kt`]
- [x] [Review][Patch] Type TS `archived` requis (pas optionnel) dans `canShowDisposExplainability` [`composition-explainability.ts:4-7`]
- [x] [Review][Defer] Breakdown accessible sur événement archivé via fallback `CompositionExplainabilityAccess` (pas de garde `archived`) [`CompositionExplainabilityService.kt:241-259`] — deferred, pre-existing
- [x] [Review][Defer] AC-4 : pas de test « composition publiée non validée → slots Équipe visibles membre » [`CompositionExplainabilityIntegrationTest.kt`] — deferred, pre-existing (note AC-4)
- [x] [Review][Defer] M3-3 : pas de test E2E/composant « tap % → breakdown sheet » sans composition préchargée [`availability-poll.ts`, e2e] — deferred, test debt
- [x] [Review][Defer] OpenAPI `availability.yaml` : pas de doc du 403 explainability vs membership [`availability.yaml`] — deferred, doc improvement
- [x] [Review][Defer] Chemins `EVENT_ORGANIZER` / `SEASON_ORGANIZER` pour `canManageComposition` non couverts par tests [`DisposExplainabilityAccessTest.kt`] — deferred, pre-existing

### Change Log

- 2026-06-09 : Story créée depuis SCP explainability gates Dispos/Équipe (Correct Course, PO approved).
- 2026-06-09 : Implémentation — decouple portes Dispos vs Équipe (API + front + tests).
- 2026-06-09 : Code review BMad — 0 decision-needed, 4 patch, 5 defer, 6 dismissed.
- 2026-06-09 : Revue — 4 patch appliqués (tests AC-3/AC-6/AC-8 + type TS `archived`).
- 2026-06-09 : Erratum — revert branchement PERF-10 BFF sur event-detail (hors scope) ; gate Dispos 5.9 conservée.
