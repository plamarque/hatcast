---
feature_branch: feat/19-9-facteur-rejouer-immediatement
baseline_commit: b02cc84903a5381c06305968607f04bba4005dcc
---

# Story 19.9 : Immediate replay draw factor *(« rejouer immédiatement »)*

Status: done

<!-- Ultimate context engine analysis completed — comprehensive developer guide created -->

## Story

As an **organizer**,  
I want the draw to **penalize or exclude** candidates who **held the same role on the immediately preceding validated show** in the same category compartment,  
so that **rotations** are fairer and back-to-back same-role assignments are discouraged at draw time.

## Acceptance Criteria

### Domain & trigger (shared with 6.20)

1. **Given** the locked PO rule from SCP 2026-06-05 (same as Story **6.20**), **when** evaluating a candidate `(participant, roleKey)` for event E, **then** the trigger predicate is: `immediatePredecessorEvent(E)` exists **and** the participant held **the same `roleKey`** on that predecessor with `participationStatus ≠ DECLINED` (validated composition only; same `SpectacleCategory.slug`; strict chronological predecessor with tie-break `(startsAt, createdAt, id)`). [Source: epics 19.9 ; SCP 2026-06-05 ; DOMAIN.md § consecutive-show ; **6.20** AC-01/03/04/10]

2. **Given** no immediate validated predecessor in the compartment, **when** the factor is enabled, **then** multiplier = `1.0` for all candidates (no effect). [Source: epics 19.9 AC-1 edge]

3. **Given** predecessor P exists but the candidate did **not** hold the same role on P (or only held it with `DECLINED`), **when** the factor is enabled, **then** multiplier = `1.0` for that candidate. [Source: **6.20** AC-10 ; DOMAIN.md]

4. **Given** two consecutive events in **different compartments** (e.g. `deplacements` then `principal`), **when** the factor is enabled, **then** no candidate is penalized solely because they played on the chronologically previous global event. [Source: epics 19.9 note ; **19.8** compartment ; **6.20** AC-04]

5. **Given** participant identity resolution (season participant id vs linked user id), **when** matching predecessor slots, **then** use the **same identity rules** as [`ConsecutiveShowWarningService`](../../services/api/src/main/kotlin/com/hatcast/api/composition/ConsecutiveShowWarningService.kt) / [`CompositionParticipantIdentity`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionParticipantIdentity.kt) — do **not** duplicate ad-hoc UUID equality only. [Source: **6.20** Dev Notes ; review risk]

### Factor behaviour (Wave C — off by default)

6. **Given** `ImmediateReplayFactor` (`FACTOR_ID = immediate_replay`) **not** in [`DrawWeightPipelines.DEFAULT`](../../services/api/src/main/kotlin/com/hatcast/api/availability/draw/DrawWeightPipeline.kt), **when** production draw or Dispos % uses DEFAULT, **then** weights and `%` are **identical** to pre-19.9 runtime — golden Wave A (**19.2**) and compartment golden (**19.8**) **100 % green** without editing existing JSON fixtures. [Source: epics 19.9 AC-2 ; SCP Epic 19 Wave C « each factor off by default »]

7. **Given** a pipeline that **includes** `ImmediateReplayFactor` with mode **`EXCLUDE`** (PO default per SCP Epic 19: « → interdiction »), **when** trigger predicate true for candidate, **then** `multiplier = 0.0` → candidate effectively excluded from weighted draw (`sanitizeMultiplier` path). [Source: epics 19.9 AC-1 ; SCP §5 row 19.9]

8. **Given** the same pipeline with mode **`MALUS`**, **when** trigger predicate true, **then** apply fixed malus multiplier **`ImmediateReplayFactor.MALUS_MULTIPLIER = 0.25`** (named constant — tunable later via **19.16+** troupe/formula config). [Source: epics 19.9 AC-1 ; **PO OQ-19-9-01** 2026-06-14]

9. **Given** troupe-level config UI (**19.16–19.22**) **not** shipped, **when** 19.9 is delivered, **then** mode is selected only via **`ImmediateReplayMode` enum + test/custom pipeline builders** — **no** DB persistence, **no** change to DEFAULT production pipeline. [Source: SCP Wave C/D ; **19.16** backlog]

### Explainability (19.7 consumption)

10. **Given** breakdown explainability active (**19.7**) and a pipeline including `ImmediateReplayFactor`, **when** trigger true for target candidate, **then** `adjustments[]` includes factor id `immediate_replay` with French label naming **predecessor title + date** (same locale as **6.20**, e.g. « Déjà {roleLabel} au spectacle « {title} » ({date}) ») and a negative `deltaPoints` consistent with EXCLUDE or MALUS mode (±1 pt tolerance vs `chancePercent`). **Given** trigger false, **then** line omitted. [Source: ux-design-factor-breakdown-19-7.md ; **19.7** ; **PO OQ-19-9-03**]

11. **Given** DEFAULT pipeline (factor absent), **when** breakdown, **then** no `immediate_replay` line — unchanged **19.7** behaviour.

### Documentation (AC epics 19.9 #3)

12. **Given** implementation complete, **when** docs updated, **then**:
    - [`DOMAIN.md`](../../DOMAIN.md) — new subsection **Immediate replay draw factor (19.9)** referencing same predecessor rule as 6.20, distinct from UX warning (6.20 = inform ; 19.9 = weight policy when enabled in a formula).
    - [`SPEC.md`](../../SPEC.md) — one bullet under composition/draw fairness referencing optional draw factor (organizer-facing outcome, not UI in 19.9).
    - [`draw-weight-engine-v1-spec.md`](../../docs/v2/technical/draw-weight-engine-v1-spec.md) — § optional factor `immediate_replay`, modes EXCLUDE/MALUS, golden path, DEFAULT unchanged.
    - [`docs/adr/0019-draw-weight-engine.md`](../../docs/adr/0019-draw-weight-engine.md) — Wave C note: `ImmediateReplayFactor` implemented, **not** in DEFAULT until **19.16** formula wiring.

### Golden & integration tests

13. **Given** new fixtures under `services/api/src/test/resources/draw/golden/immediate-replay/`, **when** `./gradlew test`, **then** at least: (a) EXCLUDE — triggered veteran excluded, fresh candidate ~100 % ; (b) MALUS — triggered candidate heavily penalized vs peer ; (c) cross-compartment — no penalty ; (d) different role on predecessor — no penalty ; (e) DEFAULT pipeline regression gate still green. [Source: golden pattern **19.8** `compartment/`]

14. **Given** integration draw with custom pipeline including EXCLUDE, **when** auto-draw runs with one triggered candidate in pool, **then** draw never selects them (statistical or deterministic seed test). [Source: FR19 ; `CompositionDrawIntegrationTest` pattern]

**Product coverage:** FR19, FR20 ; complements **6.20** (UX warning only). **Priority:** P2. **Depends:** **19.6** (done), **19.8** (done), **6.20** resolver (done on `v2`). **UI:** N/A.

---

## Acceptance Criteria — Material 3 (UI)

**UI : N/A** — no changes under `apps/web/` ; breakdown copy served by API (`app-chance-breakdown-sheet` consumes existing DTOs).

---

## Tasks / Subtasks

Implementation order **mandatory** (DEFAULT regression gate after each step).

### 1. Shared predecessor replay predicate (AC 1–5)

- [x] **Scope:** `services/api/` — `composition/` + `availability/draw/`.
- [x] **Refactor (minimal)** — extract shared « repeats same role on immediate predecessor » logic from [`ConsecutiveShowWarningService`](../../services/api/src/main/kotlin/com/hatcast/api/composition/ConsecutiveShowWarningService.kt) into a reusable service (suggested: `ImmediatePredecessorRoleReplayService` or extend resolver package). Inputs: `currentEvent`, `roleKey`, `participantId` (or batch `Set<UUID>` for a role pool). Reuse [`ImmediatePredecessorEventResolver`](../../services/api/src/main/kotlin/com/hatcast/api/composition/ImmediatePredecessorEventResolver.kt) — **do not** duplicate JPQL. (AC 1, 5)
- [x] **Batch API** — `playedSameRoleOnImmediatePredecessorByParticipant(event, roleKey, participantIds): Map<UUID, Boolean>` — ≤ same DB pattern as warning service (predecessor + predecessor slots + identity maps). (AC 1, performance)
- [x] **Unit tests** — mirror **6.20** scenarios: triggered, absent predecessor, cross-compartment, declined predecessor slot, different role. (AC 2–4)
- [x] **Gate** — `./gradlew test --tests '*ImmediatePredecessor*' --tests '*ConsecutiveShow*'`

### 2. Factor + context (AC 6–9)

- [x] **`ImmediateReplayMode`** — enum `OFF | EXCLUDE | MALUS` (+ `MALUS_MULTIPLIER` constant, default `0.25`). (AC 8, 9)
- [x] **`ImmediateReplayFactor`** — `object` implementing `LabeledDrawWeightFactor` ; `FACTOR_ID = "immediate_replay"`. Constructor or companion configured with mode (immutable per pipeline instance — follow pattern if other factors need config: wrap in class implementing `DrawWeightFactor`). (AC 7, 8)
- [x] **Extend `DrawWeightContext`** — add `playedSameRoleOnImmediatePredecessor: Boolean = false`. (AC 7, 8)
- [x] **`DrawWeightPipelines`** — add factory e.g. `withImmediateReplay(mode: ImmediateReplayMode): DrawWeightPipeline` = `[CategoryCompartmentFactor, PastParticipationFactor, ImmediateReplayFactor(mode)]` — factor **after** past participation for explainability waterfall order (**PO OQ-19-9-02**). **Leave `DEFAULT` unchanged**. (AC 6, 9)
- [x] **Context builders** — update call sites to pass replay flag when pipeline includes factor:
  - [`CompositionDrawService`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionDrawService.kt)
  - [`CompositionSlotAssignmentService`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionSlotAssignmentService.kt)
  - [`CompositionExplainabilityService`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionExplainabilityService.kt)
  - [`AvailabilityChanceCalculator`](../../services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityChanceCalculator.kt) (`toWeightedCandidates` / `weightForParticipant` — optional map param `playedSameRoleOnImmediatePredecessorByParticipant`)
  Only compute batch replay map when pipeline contains `ImmediateReplayFactor` (avoid extra SQL on DEFAULT path). (AC 6, 9)
- [x] **`adjustmentLabel`** — FR with predecessor **title + date** (reuse formatting from **6.20** / `ConsecutiveShowWarningDto` fields passed into context). Gender-aware `roleLabel` via `RoleLabels.label`. (AC 10 ; **PO OQ-19-9-03**)
- [x] **Extend `DrawWeightContext`** — fields for breakdown copy: `immediatePredecessorTitle`, `immediatePredecessorStartsAt` (nullable ; set when batch replay lookup runs). (AC 10)
- [x] **Unit tests** — `ImmediateReplayFactorTest`, extend `DrawWeightPipelineTest`. (AC 7, 8)
- [x] **Gate** — `./gradlew test --tests '*ImmediateReplay*' --tests DrawGoldenTest --tests DrawOrchestrationGoldenTest --tests DrawCompartmentGoldenTest`

### 3. Breakdown (AC 10–11)

- [x] **`ChanceBreakdownCalculator`** — sequential delta for `ImmediateReplayFactor` (generic path preferred over another hard-coded `when` branch if feasible ; if special-case like **19.8**, document why). (AC 10)
- [x] **Tests** — `ChanceBreakdownCalculatorTest`: EXCLUDE → large negative delta ; no trigger → no line. (AC 10, 11)
- [x] **Gate** — `./gradlew test --tests '*ChanceBreakdown*'`

### 4. Golden immediate-replay (AC 13)

- [x] **Fixtures** — `services/api/src/test/resources/draw/golden/immediate-replay/*.json` following [`DrawGoldenFixture.kt`](../../services/api/src/test/kotlin/com/hatcast/api/availability/DrawGoldenFixture.kt) ; include `immediateReplayMode`, `playedSameRoleOnImmediatePredecessorByParticipant` (or equivalent input fields).
- [x] **`DrawImmediateReplayGoldenTest`** (or extend golden loader) — uses `DrawWeightPipelines.withImmediateReplay(...)`, not DEFAULT. (AC 13)
- [x] **Do not modify** existing `draw/golden/*.json` or `draw/golden/compartment/*.json`. (AC 6)

### 5. Integration draw (AC 14)

- [x] **Extend or add** `CompositionDrawIntegrationTest` — seed two validated events same compartment ; candidate played same role on P ; draw with EXCLUDE pipeline via test hook (inject custom pipeline bean or package-visible test config). (AC 14)
- [x] **Gate** — `./gradlew test --tests CompositionDrawIntegrationTest`

### 6. Documentation (AC 12)

- [x] **`DOMAIN.md`** — factor subsection + link to 6.20 warning distinction.
- [x] **`SPEC.md`** — optional draw factor bullet.
- [x] **`draw-weight-engine-v1-spec.md`** — optional factor table + golden path.
- [x] **`docs/adr/0019-draw-weight-engine.md`** — Wave C inventory update.

---

## Dev Notes

### Locked product decisions (do not reopen without PO)

| ID | Decision |
|----|----------|
| **Trigger** | **Identical** to **6.20** consecutive-show warning predicate — not `pastSelectionCount`, not global chronological predecessor |
| **FACTOR_ID** | `immediate_replay` (stable for breakdown API) |
| **DEFAULT** | Factor **absent** from `DrawWeightPipelines.DEFAULT` until **19.16** formula persistence |
| **Mode default (when enabled)** | **`EXCLUDE`** (`multiplier = 0`) per SCP Epic 19 row 19.9 « → interdiction » |
| **MALUS interim** | **`MALUS_MULTIPLIER = 0.25`** (PO **OQ-19-9-01**, 2026-06-14) — hardcoded until **19.16+** troupe/formula config |
| **Factor order** | **`[CategoryCompartmentFactor, PastParticipationFactor, ImmediateReplayFactor]`** — after past participation for explainability waterfall (**PO OQ-19-9-02**) ; commutative → no draw impact |
| **Breakdown copy** | Include predecessor **title + date** (**PO OQ-19-9-03**) |
| **6.20 relationship** | Warning remains **non-blocking** and **orga-only** ; draw factor does **not** replace or auto-enable warning |
| **Manual assign (FR21)** | Factor affects **draw weights only** ; organizers may still manually assign triggered candidates |
| **V1 parity** | V1 production has **no** equivalent factor — golden Wave A must stay green on DEFAULT |

### Runtime baseline (`b02cc849`)

Predecessor resolution **already shipped** for UX (**6.20**):

```22:31:services/api/src/main/kotlin/com/hatcast/api/composition/ImmediatePredecessorEventResolver.kt
    override fun resolve(currentEvent: EventEntity): EventEntity? =
        eventRepository
            .findImmediateValidatedPredecessorInCategory(
                seasonId = currentEvent.season.id,
                beforeEventId = currentEvent.id,
                beforeStartsAt = currentEvent.startsAt,
                beforeCreatedAt = currentEvent.createdAt,
                categorySlug = SpectacleCategory.slug(currentEvent),
                pageable = PageRequest.of(0, 1),
            ).firstOrNull()
```

`ConsecutiveShowWarningService` already implements the **role match** predicate for **assigned** slots — **19.9** generalizes to **draw pool candidates** for a `(event, roleKey)`:

```
EventEntity
    ↓
ImmediatePredecessorEventResolver.resolve(event) → predecessor | null
    ↓
Load predecessor slots (validated, not DECLINED)
    ↓
For each pool candidate: CompositionParticipantIdentity match + same roleKey?
    ↓
DrawWeightContext(..., playedSameRoleOnImmediatePredecessor = true|false)
    ↓
ImmediateReplayFactor(mode):
  EXCLUDE → multiplier 0.0
  MALUS   → multiplier 0.25 (constant)
  else    → 1.0
    ↓
Pipeline (NOT DEFAULT until 19.16):
  [CategoryCompartmentFactor, PastParticipationFactor, ImmediateReplayFactor?]
```

### Architecture target

| Component | Action |
|-----------|--------|
| `ImmediatePredecessorRoleReplayService.kt` | **NEW** — shared batch predicate (refactor from warning service) |
| `ConsecutiveShowWarningService.kt` | **Refactor** — delegate to shared service |
| `ImmediateReplayFactor.kt` | **NEW** |
| `ImmediateReplayMode.kt` | **NEW** |
| `DrawWeightContext.kt` | **Extend** — `playedSameRoleOnImmediatePredecessor` |
| `DrawWeightPipeline.kt` | **Extend** — `withImmediateReplay` factory ; DEFAULT unchanged |
| `AvailabilityChanceCalculator.kt` | **Extend** — optional replay map param |
| `CompositionDrawService.kt` | **Update** — conditional batch replay + pipeline param (future: from formula) |
| `CompositionExplainabilityService.kt` | **Update** — same |
| `CompositionSlotAssignmentService.kt` | **Update** — same for manual assign preview % |
| `ChanceBreakdownCalculator.kt` | **Update** — delta for `immediate_replay` |
| `test/.../DrawImmediateReplayGoldenTest.kt` | **NEW** |
| `test/resources/draw/golden/immediate-replay/*.json` | **NEW** |

### Distinction vs other mechanisms

| Mechanism | Scope | Effect |
|-----------|-------|--------|
| **`pastSelectionCount` / `PastParticipationFactor`** | Season history in compartment | Gradual malus `1/(1+n)` |
| **`immediate_replay` (19.9)** | **Only** immediate predecessor event | EXCLUDE or strong MALUS |
| **`consecutiveShowWarning` (6.20)** | Same trigger | UI hint only ; no weight change |
| **Cross-role exclusion** | Same current event | Pool exclusion during draw |

### Explicit non-goals

- **No** Angular / picker UI changes (**UI : N/A**).
- **No** troupe admin toggle or formula editor (**19.16–19.22**).
- **No** adding factor to DEFAULT production pipeline.
- **No** blocking manual assignment when triggered.
- **No** member-visible new fields (unlike 6.20 orga-only warning).
- **No** change to `ImmediatePredecessorEventResolver` JPQL semantics.
- **No** replay script `chancesLogic.js` update (**G-04** — weights-only stub).

### Dependencies

| Story | Status | Relationship |
|-------|--------|--------------|
| 19.6 | done | Pipeline shell + `PastParticipationFactor` |
| 19.7 | done | Breakdown waterfall — consume new factor line |
| 19.8 | done | Compartment via `categorySlug` + DEFAULT compartment factor |
| 6.20 | done/review on v2 | **`ImmediatePredecessorEventResolver`** + warning predicate — **reuse** |
| 19.2, 19.3, 19.8 golden | done | DEFAULT must stay green |
| 19.16+ | backlog | Wire factor into persisted formulas / troupe config |

### Previous story intelligence (19.8)

- `CategoryCompartmentFactor` uses `multiplier = 1.0` with scoped counts — **different pattern** from 19.9 (real multiplier change when enabled).
- `ChanceBreakdownCalculator` has special branch for `CategoryCompartmentFactor` — prefer generic sequential delta for `ImmediateReplayFactor` if mathematically clean.
- Batch unscoped/scoped queries set precedent for **conditional** extra SQL only when explainability/draw needs it — apply same rule: **no predecessor query on DEFAULT path**.
- Review deferral: double SQL on explainability acceptable for 19.8 — predecessor lookup is **one per event per draw**, cache on draw request scope.

### Previous story intelligence (6.20)

- **Do not** reimplement compartment filter inline — reuse resolver + `SpectacleCategory.slug`.
- **`CompositionParticipantIdentity.matchesRoleWith`** handles season vs event participant ids — mandatory for guest/linked accounts.
- Warning batch pattern: 1 predecessor + 1 slot list + identity maps — replicate for draw pool batch.
- Story explicitly deferred draw penalty to **19.9** — this story **is** that work.

### Git intelligence (recent commits)

| Commit | Insight |
|--------|---------|
| `b02cc849` | Merge **19.8** — DEFAULT = `[CategoryCompartmentFactor, PastParticipationFactor]` |
| `6dbe0f69` | Category compartment factor + golden `compartment/` |
| Pattern | New factors: `object` + `FACTOR_ID` + `LabeledDrawWeightFactor` + golden subfolder |

### Test commands (story gate)

```bash
./gradlew test \
  --tests '*ImmediateReplay*' \
  --tests '*ImmediatePredecessor*' \
  --tests '*ConsecutiveShow*' \
  --tests DrawGoldenTest \
  --tests DrawOrchestrationGoldenTest \
  --tests DrawCompartmentGoldenTest \
  --tests '*DrawImmediateReplay*' \
  --tests CompositionDrawIntegrationTest \
  --tests '*ChanceBreakdown*' \
  --tests DrawWeightPipelineTest \
  --tests PastParticipationFactorTest \
  --tests AvailabilityChanceCalculatorDrawTest
```

### Latest tech notes

- Kotlin / Spring Boot — no new dependencies ; stay in `availability/draw/` + `composition/`.
- Golden fixtures: extend [`DrawGoldenFixture.kt`](../../services/api/src/test/kotlin/com/hatcast/api/availability/DrawGoldenFixture.kt) if new input fields needed — keep backward compatible for existing JSON.
- `DrawWeightPipeline.sanitizeMultiplier` already maps invalid values to `0.0` — EXCLUDE mode should use explicit `0.0`, not negative.
- For integration tests needing custom pipeline: prefer optional constructor param / `@TestConfiguration` over changing production DEFAULT.

### Open questions (PO) — all resolved

| ID | Decision (2026-06-14) |
|----|------------------------|
| **OQ-19-9-01** | **`MALUS_MULTIPLIER = 0.25`** for interim ; recalibrate if needed ; **19.16+** will expose troupe/formula configuration |
| **OQ-19-9-02** | Factor **after** `PastParticipationFactor` in pipeline order — **explainability waterfall only** (multiplication is commutative) |
| **OQ-19-9-03** | Breakdown label includes predecessor **title + date** (aligned with **6.20**) |

---

## Dev Agent Record

### Agent Model Used

Composer (dev-story 19.9)

### Completion Notes List

- Added `ImmediatePredecessorRoleReplayService` (shared predicate with 6.20) and refactored `ConsecutiveShowWarningService` to delegate.
- Added `ImmediateReplayFactor` / `ImmediateReplayMode`; extended `DrawWeightContext`, `AvailabilityChanceCalculator`, `ChanceBreakdownCalculator`, composition draw/explainability/slot services.
- `DrawWeightPipelines.DEFAULT` unchanged; `withImmediateReplay(mode)` for tests/custom formulas; replay SQL only when pipeline includes factor (`DrawImmediateReplaySupport`).
- Golden fixtures `draw/golden/immediate-replay/` + `DrawImmediateReplayGoldenTest`; integration `ImmediateReplayDrawIntegrationTest` with `@Primary` EXCLUDE pipeline.
- All story gate tests green (`services/api`).

### File List

- services/api/src/main/kotlin/com/hatcast/api/composition/ImmediatePredecessorRoleReplayService.kt (new)
- services/api/src/main/kotlin/com/hatcast/api/composition/DrawImmediateReplaySupport.kt (new)
- services/api/src/main/kotlin/com/hatcast/api/composition/ConsecutiveShowWarningService.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/CompositionDrawService.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/CompositionExplainabilityService.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/CompositionSlotAssignmentService.kt
- services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityChanceCalculator.kt
- services/api/src/main/kotlin/com/hatcast/api/availability/draw/DrawWeightContext.kt
- services/api/src/main/kotlin/com/hatcast/api/availability/draw/DrawWeightPipeline.kt
- services/api/src/main/kotlin/com/hatcast/api/availability/draw/ImmediateReplayMode.kt (new)
- services/api/src/main/kotlin/com/hatcast/api/availability/draw/ImmediateReplayFactor.kt (new)
- services/api/src/main/kotlin/com/hatcast/api/availability/draw/ChanceBreakdownCalculator.kt
- services/api/src/test/kotlin/com/hatcast/api/composition/ImmediatePredecessorRoleReplayServiceTest.kt (new)
- services/api/src/test/kotlin/com/hatcast/api/composition/ImmediateReplayDrawIntegrationTest.kt (new)
- services/api/src/test/kotlin/com/hatcast/api/availability/DrawImmediateReplayGoldenTest.kt (new)
- services/api/src/test/kotlin/com/hatcast/api/availability/draw/ImmediateReplayFactorTest.kt (new)
- services/api/src/test/kotlin/com/hatcast/api/availability/draw/DrawWeightPipelineTest.kt
- services/api/src/test/kotlin/com/hatcast/api/availability/draw/ChanceBreakdownCalculatorTest.kt
- services/api/src/test/resources/draw/golden/immediate-replay/exclude-malus.json (new)
- DOMAIN.md
- SPEC.md
- docs/v2/technical/draw-weight-engine-v1-spec.md
- docs/adr/0019-draw-weight-engine.md
- _bmad-output/implementation-artifacts/sprint-status.yaml

### Change Log

- 2026-06-14 : Story created (`bmad-create-story` 19.9) — status `ready-for-dev`.
- 2026-06-14 : PO resolved OQ-19-9-01 (MALUS `0.25`), OQ-19-9-02 (order after past participation), OQ-19-9-03 (breakdown title+date).
- 2026-06-14 : Implementation complete — immediate replay draw factor (off by default in DEFAULT pipeline).
- 2026-06-14 : Story done — test review fixes (@Tag 19.9, declined/absent predecessor units, golden cleanup).

---

### Validation create-story

- [x] AC numbered and sourced (epics / FR / SCP / DOMAIN / 6.20)
- [x] Material 3 section = **UI : N/A**
- [x] Tasks reference AC numbers
- [x] Links to existing code to reuse
- [x] `./gradlew test` gates documented
- [x] Non-goals explicit ; DEFAULT regression invariant
- [x] Frontmatter `feature_branch` + `baseline_commit`
