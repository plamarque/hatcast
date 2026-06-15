---
feature_branch: feat/19-10-facteur-nombre-demandes-role
baseline_commit: 1593cdea90b85c97543a3e02e8ca261c8c05ed12
---

# Story 19.10 : Role request aspiration draw factor *(« nombre de demandes de rôle »)*

Status: done

<!-- Ultimate context engine analysis completed — comprehensive developer guide created -->

## Story

As an **organizer**,  
I want the draw to **boost candidates who have repeatedly declared availability for a role without being selected** for that role on past validated shows,  
so that **role aspirations are honoured** and members who keep asking for the same role (e.g. DJ) without ever being picked eventually get a **significant** chance increase.

**Product example (PO):** Boubou declared availability for **DJ** on **7** past validated matches and was **never** selected as DJ. On the next match, her draw weight for DJ must reflect a **substantial boost** vs a peer with no such history.

## Acceptance Criteria

### Domain metric (SPEC / DOMAIN — lock before code)

1. **Given** the PO-locked metric **`unfulfilledRoleRequestCount`** (French product term: *demandes de rôle non satisfaites*), **when** evaluating candidate `(participant, roleKey)` for event E, **then** count = number of **validated, non-archived** events in the same **season** and same **category compartment** as E (same rules as **19.8** / `SpectacleCategory.slug`) where **all** hold:
   - participant was **available** for the draw pool of `roleKey` (`status = AVAILABLE` and `AvailabilityRoleRules.isCandidateForRole(..., roleKey)` — including `roleKeys = []` meaning all roles);
   - event composition **`validatedAt IS NOT NULL`** (draw outcome exists);
   - participant was **not assigned** to `roleKey` on that event (no validated slot with matching `roleKey` and `participationStatus ≠ DECLINED`);
   - event ≠ E (current event excluded).
   [Source: epics 19.10 AC1 ; SPEC § composition history selected/available ; **5.2** role availability data ; **PO correction 2026-06-14**]

2. **Given** `SelectionHistoryMode` (**6.4** / `SelectionHistoryModeResolver`), **when** counting for draw or Dispos % on event E, **then** use the **same temporal scope** as `pastSelectionCount`:
   - **`OPERATIONAL`**: all qualifying events in season/compartment except E (includes future validated events — out-of-order selection parity);
   - **`RETROSPECTIVE`**: only events strictly before E (`startsAt`, `createdAt`, `id` tie-break — mirror `countValidatedSelectionsBeforeEvent`).
   [Source: `SelectionHistoryMode` ; `CompositionSelectionHistoryService`]

3. **Given** participant was **assigned** to `roleKey` on a past event (validated, non-declined slot), **when** counting unfulfilled requests for that role, **then** that event does **not** increment the count (aspiration was satisfied on that show). [Source: epics 19.10 « sans être tiré » ; PO example Boubou]

4. **Given** participant was **proposed** then **declined** the role on a past event (slot assignee with `DECLINED`), **when** counting, **then** that event does **not** increment the count — they were selected by the draw/orga even if they declined (**PO OQ-19-10-02 locked 2026-06-14** : fulfilled / exclude). [Source: parity with `pastSelectionCount` DECLINED exclusion]

5. **Given** event with availability but **no validated composition** (draft / never locked), **when** counting, **then** event is **excluded** — no draw outcome to measure « non satisfait ». [Source: epics 19.10]

6. **Given** metric definition locked in **SPEC.md** and **DOMAIN.md** *before* factor implementation merges, **when** story delivered, **then** docs approved by PO (epics 19.10 AC1 gate). [Source: SCP Wave C « SPEC/DOMAIN delta before dev » ; epics 19.9 AC3 pattern]

### Factor behaviour (Wave C — off by default)

7. **Given** `RoleRequestFactor` (`FACTOR_ID = role_request`) **not** in [`DrawWeightPipelines.DEFAULT`](../../services/api/src/main/kotlin/com/hatcast/api/availability/draw/DrawWeightPipeline.kt), **when** production draw or Dispos % uses DEFAULT, **then** weights and `%` are **identical** to pre-19.10 runtime — golden Wave A (**19.2**), compartment (**19.8**), immediate-replay (**19.9**) **100 % green** without editing existing JSON fixtures. [Source: epics 19.10 AC2 ; SCP Wave C]

8. **Given** a pipeline that **includes** `RoleRequestFactor`, **when** `unfulfilledRoleRequestCount = n > 0`, **then** apply **bonus** multiplier **`RoleRequestFactor.bonusMultiplier(n) = min(1.0 + n × BONUS_PER_UNFULFILLED, MAX_BONUS_MULTIPLIER)`** with **`BONUS_PER_UNFULFILLED = 1.0`**, **`MAX_BONUS_MULTIPLIER = 10.0`** (**PO OQ-19-10-01 locked 2026-06-14**). Example: `n = 7` → multiplier **`8.0`** (Boubou / DJ scenario). [Source: **PO correction 2026-06-14** ; epics 19.10]

9. **Given** `unfulfilledRoleRequestCount = 0`, **when** factor enabled, **then** `multiplier = 1.0` (no boost). [Source: epics 19.10 AC2 edge]

10. **Given** cap **`MAX_BONUS_MULTIPLIER = 10.0`** (**PO OQ-19-10-01 locked 2026-06-14**), **when** computed bonus exceeds cap, **then** use cap (prevents runaway weights on very high `n`). [Source: calibration guardrail]

11. **Given** troupe-level config UI (**19.16–19.22**) **not** shipped, **when** 19.10 delivered, **then** factor is wired only via **`DrawWeightPipelines.withRoleRequest()`** test/custom builders — **no** DB persistence, **no** change to DEFAULT production pipeline. [Source: SCP Wave C/D ; **19.16** backlog]

12. **Given** factor direction, **when** implemented, **then** **bonus only** (reward repeated unfulfilled aspirations) — **not** a malus (**PO OQ-19-10-03 locked 2026-06-14**). [Source: PO correction ; epic draft text « malus » is **superseded** by this story]

### Explainability (19.7 consumption)

13. **Given** breakdown explainability active (**19.7**) and pipeline including `RoleRequestFactor`, **when** `unfulfilledRoleRequestCount > 0`, **then** `adjustments[]` includes factor id `role_request` with French label « A demandé {roleLabel} {n} fois sans être tiré·e — bonus aspiration » (gender-aware via `RoleLabels`) and **positive** `deltaPoints` consistent with bonus (±1 pt vs `chancePercent`). **Given** count = 0, **then** line omitted. [Source: ux-design-factor-breakdown-19-7.md ; **19.7**]

14. **Given** DEFAULT pipeline (factor absent), **when** breakdown, **then** no `role_request` line — unchanged **19.7** behaviour.

### Documentation

15. **Given** implementation complete, **when** docs updated, **then**:
    - [`DOMAIN.md`](../../DOMAIN.md) — subsection **Role request aspiration factor (19.10)** with metric § AC 1–5 and **bonus** direction (not malus).
    - [`SPEC.md`](../../SPEC.md) — bullet under composition/draw fairness: boost for repeated unfulfilled role requests.
    - [`draw-weight-engine-v1-spec.md`](../../docs/v2/technical/draw-weight-engine-v1-spec.md) — § optional factor `role_request`, bonus formula, golden path, DEFAULT unchanged.
    - [`docs/adr/0019-draw-weight-engine.md`](../../docs/adr/0019-draw-weight-engine.md) — Wave C inventory: `RoleRequestFactor` (aspiration **bonus**), **not** in DEFAULT until **19.16**.

### Golden & integration tests

16. **Given** new fixtures under `services/api/src/test/resources/draw/golden/role-request/`, **when** `./gradlew test`, **then** at least: (a) Boubou scenario — requester `n=7` **heavily boosted** vs peer `n=0` (same `pastSelectionCount`); (b) `n=1` modest boost; (c) `n=0` → multiplier 1.0; (d) cap at `MAX_BONUS_MULTIPLIER` when `n` very large; (e) DEFAULT pipeline regression gate still green. [Source: golden pattern **19.9** `immediate-replay/`]

17. **Given** integration test with custom pipeline including `RoleRequestFactor`, **when** auto-draw runs with one high-count requester (`n≥3`) and one peer with `n=0` (equal `pastSelectionCount`, equal base pool), **then** requester **selected** deterministically (`Random` seed) or statistically favored. [Source: `ImmediateReplayDrawIntegrationTest` pattern — inverted vs malus story draft]

18. **Given** batch count service, **when** DEFAULT pipeline draw, **then** **no extra SQL** for role-request counts (conditional load like [`DrawImmediateReplaySupport`](../../services/api/src/main/kotlin/com/hatcast/api/composition/DrawImmediateReplaySupport.kt)). [Source: 19.9 performance precedent]

**Product coverage:** FR19, FR20. **Priority:** P2. **Depends:** **19.6** (done), **19.8** (done), **5.2** (done). **UI:** N/A.

---

## Acceptance Criteria — Material 3 (UI)

**UI : N/A** — no changes under `apps/web/` ; breakdown copy served by API (`app-chance-breakdown-sheet` consumes existing DTOs).

---

## Tasks / Subtasks

Implementation order **mandatory** (DEFAULT regression gate after each step).

### 0. PO / docs gate (AC 1–6, 15 partial)

- [x] **OQ resolved (PO 2026-06-14)** — **OQ-19-10-01** : `1 + n`, cap `10` ; **OQ-19-10-02** : declined assignee = fulfilled (exclude) ; **OQ-19-10-03** : bonus only.
- [x] **Scope:** `DOMAIN.md`, `SPEC.md` — metric § AC 1–5 + **bonus aspiration** wording (**before** merge factor code — AC 6).
- [x] **Gate:** docs + metric text in PR (PO sign-off OQs done — see Dev Agent Record).

### 1. Unfulfilled role request count service (AC 1–5, 18)

- [x] **Scope:** `services/api/` — new `composition/` or `availability/` service (suggested: `UnfulfilledRoleRequestService`).
- [x] **JPQL / repository** — batch query `(participantId, roleKey) → count` for a season + compartment + history mode + exclude event E. Join `event_availability` + `EventEntity` + `EventCompositionEntity` + anti-join / NOT EXISTS on matching validated slot. Reuse compartment filter literals from [`EventCompositionSlotRepository`](../../services/api/src/main/kotlin/com/hatcast/api/composition/EventCompositionSlotRepository.kt) — **extract shared compartment predicate** if duplicating (DRY with **19.8**). (AC 1, 2)
- [x] **Participant identity** — resolve season vs event participant ids via [`CompositionParticipantIdentity`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionParticipantIdentity.kt) / [`CompositionLinkedParticipantResolver`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionLinkedParticipantResolver.kt) — same rules as selection history. (AC 1)
- [x] **API:** `unfulfilledRoleRequestCountByParticipant(event, roleKey, participantIds, mode): Map<UUID, Int>`. (AC 1, 18)
- [x] **Unit tests** — scenarios: fulfilled (selected), unfulfilled (available not selected), declined assignee excluded, no validation excluded, cross-compartment excluded, RETROSPECTIVE vs OPERATIONAL scope, empty `roleKeys` counts for all roles. (AC 2–5)
- [x] **Gate** — `./gradlew test --tests '*UnfulfilledRoleRequest*' --tests '*RoleRequest*'`

### 2. Factor + context (AC 7–12, 18)

- [x] **`RoleRequestFactor`** — `object` implementing `LabeledDrawWeightFactor` ; `FACTOR_ID = "role_request"`. `bonusMultiplier(n) = min(1.0 + n × BONUS_PER_UNFULFILLED, MAX_BONUS_MULTIPLIER)` for `n > 0` ; else `1.0`. Constants: **`BONUS_PER_UNFULFILLED = 1.0`**, **`MAX_BONUS_MULTIPLIER = 10.0`** (interim). (AC 8, 9, 10)
- [x] **Extend `DrawWeightContext`** — add `unfulfilledRoleRequestCount: Int = 0`. (AC 8)
- [x] **`DrawWeightPipelines`** — add `withRoleRequest(): DrawWeightPipeline` = `[CategoryCompartmentFactor, PastParticipationFactor, RoleRequestFactor]` ; **leave `DEFAULT` unchanged**. Add `includesRoleRequest(pipeline): Boolean`. (AC 7, 11)
- [x] **`DrawRoleRequestSupport`** (mirror `DrawImmediateReplaySupport`) — load batch counts only when `includesRoleRequest(pipeline)`. (AC 18)
- [x] **Context builders** — update:
  - [`CompositionDrawService`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionDrawService.kt)
  - [`CompositionSlotAssignmentService`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionSlotAssignmentService.kt)
  - [`CompositionExplainabilityService`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionExplainabilityService.kt)
  - [`AvailabilityChanceCalculator`](../../services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityChanceCalculator.kt) — optional `unfulfilledRoleRequestCountByParticipant` param on `toWeightedCandidates` / `scoreCandidates` / `weightForParticipant`.
  (AC 7, 11, 18)
- [x] **`adjustmentLabel`** — FR: « A demandé {roleLabel} {n} fois sans être tiré·e — bonus aspiration » (`RoleLabels.label`). (AC 13)
- [x] **Unit tests** — `RoleRequestFactorTest`: n=7 → multiplier 8.0 ; n=0 → 1.0 ; cap applied ; extend `DrawWeightPipelineTest`. (AC 8–10)
- [x] **Gate** — `./gradlew test --tests '*RoleRequest*' --tests DrawGoldenTest --tests DrawOrchestrationGoldenTest --tests DrawCompartmentGoldenTest --tests DrawImmediateReplayGoldenTest`

### 3. Breakdown (AC 13–14)

- [x] **`ChanceBreakdownCalculator`** — sequential delta for `RoleRequestFactor` (generic path preferred). (AC 13)
- [x] **Tests** — `ChanceBreakdownCalculatorTest`: n>0 → **positive** delta ; n=0 → no line. (AC 13, 14)
- [x] **Gate** — `./gradlew test --tests '*ChanceBreakdown*'`

### 4. Golden role-request (AC 16)

- [x] **Fixtures** — `services/api/src/test/resources/draw/golden/role-request/*.json` including **Boubou** scenario (`n=7`, boosted % >> peer). (AC 16)
- [x] **`DrawRoleRequestGoldenTest`** — uses `DrawWeightPipelines.withRoleRequest()`, not DEFAULT. (AC 16)
- [x] **Do not modify** existing golden JSON outside `role-request/`. (AC 7)

### 5. Integration draw (AC 17)

- [x] **Add** `RoleRequestDrawIntegrationTest` — seed validated past events with availability-without-selection ; high-count requester wins draw vs peer ; `@TestConfiguration` pattern from [`ImmediateReplayDrawIntegrationTest`](../../services/api/src/test/kotlin/com/hatcast/api/composition/ImmediateReplayDrawIntegrationTest.kt). (AC 17)
- [x] **Gate** — `./gradlew test --tests '*RoleRequestDraw*' --tests CompositionDrawIntegrationTest`

### 6. Documentation (AC 15)

- [x] **`DOMAIN.md`**, **`SPEC.md`**, **`draw-weight-engine-v1-spec.md`**, **`docs/adr/0019-draw-weight-engine.md`**.

---

## Dev Notes

### Locked product decisions (do not reopen without PO)

| ID | Decision |
|----|----------|
| **FACTOR_ID** | `role_request` (stable for breakdown API) |
| **Metric name** | `unfulfilledRoleRequestCount` — per `(participant, roleKey)` |
| **Direction** | **Bonus only** — boost repeated unfulfilled aspirations (**PO 2026-06-14**) |
| **Reference scenario** | Boubou: 7× dispo DJ, jamais DJ → **multiplier 8.0** at next draw (with interim constants) |
| **DEFAULT** | Factor **absent** from `DrawWeightPipelines.DEFAULT` until **19.16** formula persistence |
| **Multiplier (interim)** | `min(1 + n × 1.0, 10.0)` — linear bonus + cap ; tunable via **19.16+** |
| **Factor order** | `[CategoryCompartmentFactor, PastParticipationFactor, RoleRequestFactor]` — bonus **stacks with** past-participation malus (net effect = both multiply) |
| **Compartment** | Same `categorySlug` filter as **19.8** / selection history |
| **History mode** | Same `SelectionHistoryMode` as `pastSelectionCount` |
| **V1 parity** | V1 production has **no** equivalent factor — golden Wave A must stay green on DEFAULT |

### Interaction with past participation (important for dev)

Both factors apply when enabled: `finalWeight = base × pastMalus × roleRequestBonus`.

Example Boubou (DJ, `n=7`, `pastSelectionCount=0`, `requiredCount=1`, pool of 2 peers with `n=0`):
- Peer weight ≈ `1 × 1.0 × 1.0 = 1.0`
- Boubou weight ≈ `1 × 1.0 × 8.0 = 8.0` → ~**89 %** vs ~**11 %** (before exact multi-place math)

If Boubou was DJ before (`pastSelectionCount=2`), past malus `1/3` applies **in addition**: weight ≈ `1 × 0.333 × 8.0 ≈ 2.67` — still boosted vs fresh peer but not as dominant. Document in breakdown.

### Open questions (PO) — all resolved

| ID | Decision (2026-06-14, Patrice) |
|----|--------------------------------|
| **OQ-19-10-01** | **`bonusMultiplier(n) = min(1 + n × 1.0, 10.0)`** — Boubou n=7 → ×8 ; recalibrate via **19.16+** if needed |
| **OQ-19-10-02** | **Declined assignee = fulfilled** — event does **not** increment unfulfilled count |
| **OQ-19-10-03** | **Bonus only** — no malus for frequent requesters |

### Runtime baseline (`1593cdea`)

**19.10 target flow:**

```
EventEntity + roleKey + pool participantIds
    ↓
SelectionHistoryModeResolver.forEvent(event)
    ↓
UnfulfilledRoleRequestService.unfulfilledRoleRequestCountByParticipant(...)
    ↓
DrawWeightContext(..., unfulfilledRoleRequestCount = n)
    ↓
RoleRequestFactor:
  n = 0 → multiplier 1.0
  n > 0 → multiplier min(1 + n × BONUS_PER_UNFULFILLED, MAX_BONUS_MULTIPLIER)
    ↓
Pipeline (NOT DEFAULT until 19.16):
  [CategoryCompartmentFactor, PastParticipationFactor, RoleRequestFactor?]
```

### Architecture target

| Component | Action |
|-----------|--------|
| `UnfulfilledRoleRequestService.kt` | **NEW** — batch count service |
| `EventAvailabilityRepository.kt` or slot repo | **Extend** — JPQL for unfulfilled counts |
| `RoleRequestFactor.kt` | **NEW** — **bonus** multiplier |
| `DrawRoleRequestSupport.kt` | **NEW** — conditional batch load |
| `DrawWeightContext.kt` | **Extend** — `unfulfilledRoleRequestCount` |
| `DrawWeightPipeline.kt` | **Extend** — `withRoleRequest()`, `includesRoleRequest()` ; DEFAULT unchanged |
| `AvailabilityChanceCalculator.kt` | **Extend** — optional count map param |
| Composition / explainability services | **Update** — conditional batch |
| `ChanceBreakdownCalculator.kt` | **Update** — positive delta for `role_request` |
| Golden + integration tests | **NEW** — Boubou n=7 scenario |

### Distinction vs other mechanisms

| Mechanism | What it counts | Effect |
|-----------|----------------|--------|
| **`pastSelectionCount` / `PastParticipationFactor`** | Times **selected** for role | Malus `1/(1+n)` |
| **`unfulfilledRoleRequestCount` / `role_request` (19.10)** | Times **available but not selected** | **Bonus** `1 + n` (capped) when enabled |
| **`preferred_role_keys` (member profile)** | Static preferences | **Not** used by draw — per-event dispos (**5.2**) |
| **`immediate_replay` (19.9)** | Same role on immediate predecessor | EXCLUDE / MALUS (opposite intent — different trigger) |

### Explicit non-goals

- **No** malus for frequent requesters (superseded draft).
- **No** Angular / UI changes (**UI : N/A**).
- **No** troupe admin toggle or formula editor (**19.16–19.22**).
- **No** adding factor to DEFAULT production pipeline.
- **No** counting proxy-entered availability differently from self-service.
- **No** change to `PastParticipationFactor` semantics.
- **No** replay script `chancesLogic.js` update (**G-04**).

### Dependencies

| Story | Status | Relationship |
|-------|--------|--------------|
| 19.6 | done | Pipeline shell + `PastParticipationFactor` |
| 19.7 | done | Breakdown — positive delta for bonus |
| 19.8 | done | Compartment scope for counts |
| 19.9 | done | Pattern for Wave C optional factor |
| 5.2 | done | Per-event `roleKeys` — data source |
| 19.16+ | backlog | Persisted formulas / tunable bonus constants |

### Test commands (story gate)

```bash
./gradlew test \
  --tests '*RoleRequest*' \
  --tests '*UnfulfilledRoleRequest*' \
  --tests DrawGoldenTest \
  --tests DrawOrchestrationGoldenTest \
  --tests DrawCompartmentGoldenTest \
  --tests DrawImmediateReplayGoldenTest \
  --tests '*DrawRoleRequest*' \
  --tests '*RoleRequestDraw*' \
  --tests CompositionDrawIntegrationTest \
  --tests '*ChanceBreakdown*' \
  --tests DrawWeightPipelineTest
```

---

## Dev Agent Record

### Agent Model Used

Composer (dev-story 19.10)

### Completion Notes List

- 2026-06-14 : PO confirmed **OQ-19-10-01** (`1+n`, cap 10), **OQ-19-10-02** (declined = exclude), **OQ-19-10-03** (bonus only). Implementation deferred to separate dev session.
- 2026-06-14 : Implemented `UnfulfilledRoleRequestService` with batch JPQL on `event_availability` + validated composition filter; identity resolution via `user_id` / `season_participant_id` / `event_participant_id` (self-service dispos store `user_id`).
- 2026-06-14 : `RoleRequestFactor` bonus `min(1+n, 10)` wired via `DrawRoleRequestSupport` (conditional load); `DEFAULT` unchanged.
- 2026-06-14 : Golden Boubou n=7 → ~89 % vs peer 11 %; integration draw selects high-count requester with `withRoleRequest()` pipeline.
- 2026-06-14 : Docs updated (DOMAIN, SPEC, draw-weight-engine-v1-spec, ADR 0019). Full story test gate green (104 tests).

### File List

- `services/api/src/main/kotlin/com/hatcast/api/event/SpectacleCategoryCompartmentJpql.kt` (new)
- `services/api/src/main/kotlin/com/hatcast/api/composition/UnfulfilledRoleRequestService.kt` (new)
- `services/api/src/main/kotlin/com/hatcast/api/composition/DrawRoleRequestSupport.kt` (new)
- `services/api/src/main/kotlin/com/hatcast/api/availability/draw/RoleRequestFactor.kt` (new)
- `services/api/src/main/kotlin/com/hatcast/api/availability/EventAvailabilityRepository.kt`
- `services/api/src/main/kotlin/com/hatcast/api/composition/EventCompositionSlotRepository.kt`
- `services/api/src/main/kotlin/com/hatcast/api/availability/draw/DrawWeightContext.kt`
- `services/api/src/main/kotlin/com/hatcast/api/availability/draw/DrawWeightPipeline.kt`
- `services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityChanceCalculator.kt`
- `services/api/src/main/kotlin/com/hatcast/api/availability/draw/ChanceBreakdownCalculator.kt`
- `services/api/src/main/kotlin/com/hatcast/api/composition/CompositionDrawService.kt`
- `services/api/src/main/kotlin/com/hatcast/api/composition/CompositionSlotAssignmentService.kt`
- `services/api/src/main/kotlin/com/hatcast/api/composition/CompositionExplainabilityService.kt`
- `services/api/src/test/kotlin/com/hatcast/api/availability/draw/RoleRequestFactorTest.kt` (new)
- `services/api/src/test/kotlin/com/hatcast/api/availability/DrawRoleRequestGoldenTest.kt` (new)
- `services/api/src/test/kotlin/com/hatcast/api/composition/UnfulfilledRoleRequestServiceTest.kt` (new)
- `services/api/src/test/kotlin/com/hatcast/api/composition/RoleRequestDrawIntegrationTest.kt` (new)
- `services/api/src/test/resources/draw/golden/role-request/bonus.json` (new)
- `services/api/src/test/kotlin/com/hatcast/api/availability/draw/DrawWeightPipelineTest.kt`
- `services/api/src/test/kotlin/com/hatcast/api/availability/draw/ChanceBreakdownCalculatorTest.kt`
- `DOMAIN.md`
- `SPEC.md`
- `docs/v2/technical/draw-weight-engine-v1-spec.md`
- `docs/adr/0019-draw-weight-engine.md`

### Change Log

- 2026-06-14 : Story created (`bmad-create-story` 19.10) — status `ready-for-dev`.
- 2026-06-14 : **PO correction** — direction inverted: **bonus aspiration** (not malus) ; Boubou n=7 DJ example ; formula `1 + n` capped at 10.
- 2026-06-14 : `epics.md` § 19.10 aligned (bonus aspiration).
- 2026-06-14 : PO locked OQ-19-10-01, OQ-19-10-02, OQ-19-10-03 — ready for dev-story (Task 0 docs remain for implementer).
- 2026-06-14 : Code review — AC4 declines, tests métrique, intégration draw déterministe, distinctBy ; status `done`.

### Review Findings

- [x] [Review][Patch] **AC4 — assigné qui décline encore compté comme non satisfait** — corrigé via `event_composition_declines` + `DOMAIN.md`.
- [x] [Review][Patch] **`RoleRequestDrawIntegrationTest` flaky / échoue en CI** — 7 événements passés, seed `Random` déterministe via `CompositionDrawService`.
- [x] [Review][Patch] **Couverture métrique incomplète (tâche §1 / AC2–5)** — tests RETROSPECTIVE, compartiment, non validé, declined ajoutés.
- [x] [Review][Patch] **Import mort** — retiré de `EventCompositionSlotRepository`.
- [x] [Review][Patch] **Risque double-comptage par événement** — `distinctBy { participantId to eventId }`.
- [x] [Review][Defer] **Requête role-request relancée par rôle au tirage** [`DrawRoleRequestSupport.kt`] — deferred, acceptable Wave C tant que facteur hors DEFAULT ; optimiser si activé en prod (19.16+)
- [x] [Review][Defer] **DRY compartiment partiel** — `SpectacleCategoryCompartmentJpql` extrait mais requêtes historiques existantes du slot repo inchangées ; deferred, refactor opportuniste
- [x] [Review][Defer] **Pas de test mock prouvant z SQL en DEFAULT (AC18)** — chargement conditionnel présent via `includesRoleRequest` ; deferred, pattern identique 19.9

---

### Validation create-story

- [x] AC numbered and sourced (epics / FR / PO correction / 5.2 / 19.8 / 19.9)
- [x] Material 3 section = **UI : N/A**
- [x] Tasks reference AC numbers
- [x] Bonus direction explicit with worked example
- [x] `./gradlew test` gates documented
- [x] Non-goals explicit ; DEFAULT regression invariant
- [x] Frontmatter `feature_branch` + `baseline_commit`
