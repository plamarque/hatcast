# Draw weight engine — normative V1 specification (V2 parity baseline)

**Status:** Normative for V1 parity and Wave A golden tests (Epic 19).  
**Authority:** Supersedes simplified algorithm notes in story **6.4** dev notes; full formula lives here, not in SPEC or DOMAIN.  
**ADR:** [0019 — Draw weight engine](../../adr/0019-draw-weight-engine.md)  
**Product context:** [Sprint Change Proposal Epic 19](../../../_bmad-output/planning-artifacts/sprint-change-proposal-2026-06-04-epic19-draw-weight-engine.md)

This document defines the **observed V1 production behaviour** (`chancesService.js`, `GridBoard.vue`) and the **V2 runtime target** (`AvailabilityChanceCalculator.kt`, orchestration in `CompositionDrawService.kt`) for weighted draw, display percentages, and history counting semantics. Wave B+ refactors must preserve the invariants documented here unless an ADR amends them.

---

## Scope

| In scope (this spec) | Out of scope (follow-up stories) |
|----------------------|----------------------------------|
| Weight formula (`malus`, `weight`) | Wave D formulas & policies (**19.15+**) |
| `pastSelectionCount` rules + history compartment (`SpectacleCategory`, **19.8**) | Full draw orchestration fixtures (**19.3** — done) |
| Factor pipeline DEFAULT (`CategoryCompartmentFactor` + `PastParticipationFactor`) | Optional formula toggles (**19.16+**) |
| `performWeightedDraw` | — |
| `exactSelectionProbability` + display `%` | — |
| Intra-role / cross-role exclusion semantics | — |
| Full vs partial redraw semantics | — |
| User-facing orga/member doc | — (see [Comprendre les pourcentages](../product/draw-chances-explained.md)) |

**Documentation utilisateur (organisateur / membre) :** [`docs/v2/product/draw-chances-explained.md`](../product/draw-chances-explained.md) — plain-language French guide to displayed %; does not duplicate this spec.

---

## Weight formula

For each eligible participant in a role pool at draw or display time:

```
malus = 1 / (1 + pastSelectionCount)
weight = malus × requiredCountForRole
```

Where:

- `pastSelectionCount` — non-negative integer; see § **`pastSelectionCount`**.
- `requiredCountForRole` — number of slots to fill for this role on the current event (V1 `requiredCount`; V2 `requiredCount` from event role slots).

**V1 evidence:** `legacy/src/services/chancesService.js:99-110` (`calculateMalus`, `calculateWeightedChances`).  
**V2 evidence:** `services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityChanceCalculator.kt:43-48` (`weightForParticipant`).

Today this is the **only** weight factor in production (past-participation malus). Future factors multiply onto this base in Wave B (**19.5**).

---

## `pastSelectionCount`

Count validated past assignments for the tuple `(participantId, roleKey)` within the **same season** and **same history compartment** (see § **History compartment (V1)** / V2 `SpectacleCategory`).

### Inclusion rules

| Rule | V1 | V2 |
|------|----|----|
| Same season | Yes | Yes (`season_id`) |
| Same `role_key` | Yes | Yes |
| Validated / locked composition only | `cast.confirmed === true` (`GridBoard.vue:7807-7809`) | `event_compositions.validated_at IS NOT NULL` (`EventCompositionSlotRepository.kt:29`) |
| Declined slot excluded | Player in declined list skipped (`GridBoard.vue:7812-7816`) | `participation_status = DECLINED` excluded (`EventCompositionSlotRepository.kt:31`) |
| Archived events excluded | `event.archived === true` skipped (`GridBoard.vue:7800-7803`) | `events.archived = true` excluded |
| Current event excluded | **Dispos display:** yes when `excludeEventId` passed. **Draw weighting:** V1 passes `null` (`chancesService.js:325`) — see **G-02** (edge case) | Always excludes current `event_id` (`EventCompositionSlotRepository.kt:27`) |

### V2 history modes (extension — not V1)

- **`SelectionHistoryMode.OPERATIONAL`** — used at draw time; includes future validated events in the season (supports out-of-order selection).
- **`SelectionHistoryMode.RETROSPECTIVE`** — used for past events without draw snapshot; events before target only.

See **E-02** in § **V2-only extensions**.

---

## History compartment (V1)

V1 uses a **binary split** on `event.templateType`:

- If the **current** event’s `templateType === 'deplacement'`, count only past events where `templateType === 'deplacement'`.
- Otherwise, count past events where `templateType !== 'deplacement'` (principal / show pool).

**Evidence:** `legacy/src/services/chancesService.js:48-59` (`countCasts`); `legacy/src/components/GridBoard.vue:7818-7829` (`countSelections`).

V2 evolved to multi-slug **`SpectacleCategory`** via `event.category` (**17.9**) — see **G-01**. Story **19.8** hardens this as an explicit factor pipeline entry:

| Piece | Role |
|-------|------|
| `CategoryCompartmentHistoryScope` | Resolves `categorySlug` and runs scoped / unscoped JPQL (`EventCompositionSlotRepository`) |
| `CompositionSelectionHistoryService` | Delegates history counts; scoped map feeds weights, unscoped map feeds breakdown only |
| `CategoryCompartmentFactor` (`FACTOR_ID = equity_tag`) | Always in `DrawWeightPipelines.DEFAULT` before `PastParticipationFactor`; `multiplier = 1.0` (compartment applied via scoped `pastSelectionCount`) |
| `ImmediateReplayFactor` (`FACTOR_ID = immediate_replay`, **19.9**) | **Not** in `DEFAULT` until **19.16**; optional in custom pipelines after `PastParticipationFactor`. Modes: `EXCLUDE` (`0.0`) or `MALUS` (`0.25`). Trigger = same predicate as Story **6.20** consecutive-show warning. Golden: `draw/golden/immediate-replay/*.json` (`DrawImmediateReplayGoldenTest`) |
| Golden fixtures | `services/api/src/test/resources/draw/golden/compartment/*.json` (`DrawCompartmentGoldenTest`) |

**Compartment slug rules** (must match JPQL `:categorySlug` filter):

| `categorySlug` | Events counted |
|----------------|----------------|
| `principal` | `category IS NULL` AND `templateType <> 'deplacement'` |
| `deplacements` | `category = 'deplacements'` OR (`category IS NULL` AND `templateType = 'deplacement'`) |
| `{glossary slug}` | `category = slug` |

---

## Selection — `performWeightedDraw`

```
totalWeight = Σ candidate.weight
IF candidates empty OR totalWeight = 0 → RETURN null
randomValue = random.nextDouble() × totalWeight
cumulative = 0
FOR each candidate IN order:
  cumulative += candidate.weight
  IF randomValue ≤ cumulative → RETURN selected candidate
RETURN last candidate  // fallback; should not occur with valid floats
```

- **`Random` is injectable** for tests (`kotlin.random.Random(seed)` in V2).
- **Edge cases:** empty pool → `null`; zero total weight → `null`; single candidate → always selected when weight > 0.

**V1 evidence:** `legacy/src/services/chancesService.js:466-484`.  
**V2 evidence:** `AvailabilityChanceCalculator.kt:135-155`.  
**Replay (weights + draw only):** `scripts/replay/chancesLogic.js:28-39` — **not** authoritative for display % (**G-04**).

---

## Intra-role filling (no replacement within role)

For a role requiring `requiredCount` slots:

```
FOR slotIndex FROM 0 TO requiredCount - 1:
  pool ← eligible candidates minus withinRoleExcluded
  winner ← performWeightedDraw(pool)
  IF winner IS null → slot stays empty; continue or stop per orchestration
  assign winner to slot
  withinRoleExcluded ← withinRoleExcluded ∪ { winner }
```

**V1 evidence:** `legacy/src/components/GridBoard.vue:7528-7538` (`drawForRole` loop removes winner from `pool`).  
**V2 evidence:** `CompositionDrawService.kt` — `withinRoleExcluded` updated after each assignment.

---

## Cross-role exclusion (one draw request)

During a single multi-role draw request, a participant assigned to **any** slot on the event is excluded from later role pools. **Manual multi-role stacking on the same event (FR21) is allowed; auto-draw must not produce it.**

**V1:** `excludedPlayers` / `allAlreadySelected` passed into `drawForRole` (`GridBoard.vue:7277-7304`, `:7498-7514`). V1 seeds from assignments **already placed** on the in-progress composition before each role is drawn.

**V2:** `crossRoleExcluded` in `CompositionDrawService.kt`:

1. **Initialized** from all assignees already on the composition (`openingCrossRoleExcluded` → mutable copy at draw start). Required so a participant pre-assigned on a role processed **later** in priority order (e.g. player) is excluded when drawing an **earlier** role (e.g. DJ).
2. **Grows** after each pick in the same request (`:273`).
3. **Full role redraw:** assignees cleared for that role are **removed** from `crossRoleExcluded` before re-pick so they can be drawn again for that role only (`isFullRedraw` block).

Order of roles: **`ROLE_PRIORITY_ORDER`** (V1 `storage.js:122-131`; V2 `EventRoleSlots.kt:51-61` / `RoleKeys.PRIORITY_ORDER`).

---

## Redraw semantics

| Mode | V1 behaviour | V2 mapping |
|------|--------------|------------|
| **Full redraw** | Role already has `filledCount >= requiredCount` → replace entire role (`GridBoard.vue:7280-7289`) | `DrawMode.FULL` / `isFullRedraw` clears role slots before fill (`CompositionDrawService.kt:155-189`) |
| **Partial / fill empty** | Keep existing assignees; draw only `remainingSlots` (`GridBoard.vue:7291-7308`) | `DrawMode.FILL_EMPTY` — fill empty `(roleKey, slotIndex)` only (**E-03**) |

V1 stores per-role **arrays** (partial fill appends). V2 uses indexed `(roleKey, slotIndex)` — possible gap **G-03** (orchestration fixture in **19.3**).

---

## Display % (`exactSelectionProbability`)

Primary path (V1 production and V2):

```
chancePercent = round(exactSelectionProbability(requiredCount, weightedCandidates, index) × 100)
```

- Rounding: Java/Kotlin `Math.round` (half-up to integer), **not** floor.
- Sort display list by `chancePercent` descending (`scoreCandidates`).

### Fallback (V1 only)

On exception in `calculateExactSelectionProbability`, V1 falls back to `(weight / totalWeight) × 100` (`chancesService.js:355-360`). V2 does not use this fallback in `scoreCandidates`.

### Approximation note

`exactSelectionProbability` uses **expected-weight removal** per draw iteration (not exhaustive enumeration). Documented tolerance for golden tests: **±1 percentage point** when `places > 1` and weights are not all equal (**19.2**).

### Superseded documentation

- Story **6.4** dev notes (`6-4-tirage-aleatoire-pondere-et-affichage-des-cotes-explainability.md:112`) — `round(weight/sum×100)` is **wrong** vs production.
- Story **6.4** dev notes (`:123`) — « no deplacement split » is **stale** post-**17.9**; compartment exists in V2 via `SpectacleCategory`.

---

## Algorithm — `exactSelectionProbability`

Normative pseudocode (matches V1 `calculateExactSelectionProbability` and V2 `AvailabilityChanceCalculator.kt:70-133`):

```
INPUT: places (int), candidates[{participantId, weight, ...}], targetIndex (int)

IF places = 0 OR candidates empty OR targetIndex out of range → RETURN 0
IF places >= candidates.length → RETURN 1

targetWeight ← candidates[targetIndex].weight
totalWeight ← sum(candidates.weight)
IF totalWeight = 0 → RETURN 0

IF places = 1 → RETURN targetWeight / totalWeight

IF all |c.weight - targetWeight| < 0.0001 → RETURN places / candidates.length

probNotSelected ← 1
remainingCandidates ← copy(candidates)
remainingTotalWeight ← totalWeight
targetParticipantId ← candidates[targetIndex].participantId

FOR tirage FROM 1 TO places:
  IF remainingCandidates.length <= 1 → BREAK
  probNotSelected *= 1 - (targetWeight / remainingTotalWeight)
  otherCandidates ← remainingCandidates without targetParticipantId
  otherTotalWeight ← remainingTotalWeight - targetWeight
  IF otherCandidates not empty AND otherTotalWeight > 0:
    expectedWeightRemoved ← Σ (c.weight/remainingTotalWeight × c.weight) for c in otherCandidates
  ELSE:
    expectedWeightRemoved ← otherTotalWeight / max(1, |otherCandidates|)
  remainingTotalWeight -= expectedWeightRemoved
  IF remainingCandidates.length > 1 AND otherCandidates not empty:
    closest ← argmin |c.weight - expectedWeightRemoved| over otherCandidates
    remainingCandidates ← remainingCandidates without closest

RETURN clamp(1 - probNotSelected, 0, 1)
```

---

## Algorithm — `scoreCandidates`

```
IF candidates empty → RETURN []
weighted ← map each candidate to weight via weightForParticipant(pastSelectionCount, requiredCount)
totalWeight ← sum(weighted.weight)
IF totalWeight = 0 → RETURN each candidate with chancePercent = 0

FOR each index in weighted:
  chancePercent ← round(exactSelectionProbability(requiredCount, weighted, index) × 100)

RETURN list sorted by chancePercent descending
```

---

## Code references

| Concern | V1 normative | V2 runtime (informational) |
|---------|--------------|----------------------------|
| Weights + malus | `legacy/src/services/chancesService.js` | `AvailabilityChanceCalculator.kt` |
| Display % | `chancesService.js:351-352` | `AvailabilityChanceCalculator.kt:176-177` |
| Multi-role draw | `GridBoard.vue` (`drawMultiRoles`, `drawForRole`) | `CompositionDrawService.kt` |
| History count (UI) | `GridBoard.vue:7782-7845` (`countSelections`) | `CompositionSelectionHistoryService.kt`, `EventCompositionSlotRepository.kt` |
| Replay harness | `scripts/replay/chancesLogic.js` — **weights + draw only** | N/A |

---

## Proven V1 ↔ V2 gaps

Source: [`draw-v1-v2-gaps-investigation.md`](../../../_bmad-output/implementation-artifacts/investigations/draw-v1-v2-gaps-investigation.md) (2026-06-04).

### Behavioral gaps (must appear in parity planning)

| ID | Gap | Grade | V1 evidence | V2 evidence | Follow-up |
|----|-----|-------|-------------|-------------|-----------|
| **G-01** | History compartment granularity — V1 binary `templateType === 'deplacement'` vs V2 multi-slug `SpectacleCategory` / `event.category` (`aperock`, `deplacements`, `principal`, …) | **Confirmed (intentional V2)** | `legacy/src/components/GridBoard.vue:7818-7829`, `legacy/src/services/chancesService.js:48-59` | `SpectacleCategory.kt`, `CategoryCompartmentHistoryScope.kt`, `CategoryCompartmentFactor.kt`, `EventCompositionSlotRepository.kt:32-36` | **Done — 19.8** golden `draw/golden/compartment/`; V2 multi-slug is product intent, not a parity bug |
| **G-02** | Current-event exclusion during draw weighting — V2 always excludes `excludeEventId`; V1 draw passes `null` to `countSelections` | **Deduced** (edge) | `legacy/src/services/chancesService.js:325` (via `calculateRoleChancesForFill` → `GridBoard.vue:7492`) | `EventCompositionSlotRepository.kt:27` | Differs only if current event already has **confirmed/validated** composition |
| **G-03** | Slot model — V1 per-role **arrays** (append on partial fill) vs V2 indexed `(roleKey, slotIndex)` with gap fill | **Hypothesized** | `legacy/src/components/GridBoard.vue:7304-7305` | `CompositionDrawService.kt:183-189` | **19.3** orchestration fixture required to confirm/refute |
| **G-04** | Replay harness incomplete for display % — `chancesLogic.js` has no `exactSelectionProbability` | **Confirmed** | `legacy/src/services/chancesService.js:165-251` | `scripts/replay/chancesLogic.js:42-68` (weights only) | **19.2** golden % must source from this spec / Kotlin, **not** replay alone |

### V2-only extensions (not V1 parity regressions)

| ID | Feature | Evidence |
|----|---------|----------|
| **E-01** | Draw-time snapshot persistence (**6.14**) | `CompositionDrawService.kt:310-315` |
| **E-02** | `SelectionHistoryMode` + `chanceSource` on Dispos | `SelectionHistoryMode.kt:6-17`, `AvailabilityService.kt:318-327` |
| **E-03** | `DrawMode.FILL_EMPTY` on locked composition | `CompositionDrawService.kt:76-85` |
| **E-04** | Snapshot % computed at draw **opening** (`captureOpeningDrawSnapshots`) ≠ per-step `%` in `steps[]` | `CompositionDrawService.kt:137-147` vs `:214-225`; internal tension with **6.14** AC1 wording |
| **E-05** | Event-only participant pool in draw eligibility | `CompositionParticipantPool.kt:23-91` vs V1 `allSeasonPlayers` only |

### Aligned — parity baseline (do not list as drift)

| Topic | V1 evidence | V2 evidence |
|-------|-------------|-------------|
| Weight formula | `chancesService.js:99-110` | `AvailabilityChanceCalculator.kt:43-48` |
| `performWeightedDraw` | `chancesService.js:466-484`, `chancesLogic.js:28-39` | `AvailabilityChanceCalculator.kt:135-155` |
| Display % (`exactSelectionProbability`) | `chancesService.js:351-352` | `AvailabilityChanceCalculator.kt:176-177` |
| Role draw order | `storage.js:122-131` `ROLE_PRIORITY_ORDER` | `EventRoleSlots.kt:51-61` |
| Full vs partial redraw | `GridBoard.vue:7279-7308` | `CompositionDrawService.kt:155-189` |
| Cross-role / intra-role exclusion | `GridBoard.vue:7277-7304`, `:7528-7538` | `CompositionDrawService.kt:128-129`, `:269-270` |
| Validated-only history | `GridBoard.vue:7807-7809` (`cast.confirmed`) | `EventCompositionSlotRepository.kt:29` |
| Declined excluded from history count | `GridBoard.vue:7812-7816` | `EventCompositionSlotRepository.kt:31` |

### Additional delta rows (epic AC2)

| Topic | V1 | V2 today | Follow-up |
|-------|-----|----------|-----------|
| Past-event Dispos % | Live recalc only | Snapshots **6.14** + `estimated` fallback | **19.2** |
| Weight factors | Malus only | Monolithic `weightForParticipant` | **19.5–19.6** |
| `% = draw` invariant | Yes | Yes — must stay after refactors | **19.2**, **19.5** |

---

## Golden test contract (19.2 handoff)

**Authority:** This section is the **sole normative input** for story **19.2**. Epic **19.2** AC1 reference to `chancesLogic.js` is **superseded** for Wave A — use this spec + ADR 0019 only. Cross-link: [ADR 0019](../../adr/0019-draw-weight-engine.md).

### Scope boundary for 19.2

| IN (19.2 implements) | OUT (later stories) |
|----------------------|---------------------|
| `AvailabilityChanceCalculator.weightForParticipant` | — |
| `toWeightedCandidates` (scoped `pastSelectionCount` + DEFAULT pipeline) | — |
| `exactSelectionProbability` | Snapshots → **6.14** / **E-04** |
| `scoreCandidates` | — |
| `performWeightedDraw` | — |

**19.2 edge-case scope clarification:** Do **not** test parity for the V1 edge case where draw weighting can include current-event history because `excludeEventId = null` (see **G-02**). Treat this as out of scope for Wave A golden and cover it later with orchestration/history stories.

### Forbidden reads for 19.2

Implementers **must not** use as runtime sources:

- `legacy/**`
- `scripts/replay/chancesLogic.js` (weights-only stub; no `%` algorithm — **G-04**)

**Allowed:** this normative spec, ADR 0019, `AvailabilityChanceCalculator.kt`, existing unit tests in `AvailabilityChanceCalculatorTest.kt` as examples.

### Algorithm appendix (normative pseudocode)

See § **Weight formula**, § **Selection — `performWeightedDraw`**, § **Algorithm — `exactSelectionProbability`**, § **Algorithm — `scoreCandidates`**. Reimplementation from those sections alone must match Kotlin behaviour.

#### `weightForParticipant(pastSelectionCount, requiredCount)`

```
malus ← 1 / (1 + pastSelectionCount)
RETURN malus × requiredCount
```

#### `performWeightedDraw(candidates, random)`

See § **Selection — `performWeightedDraw`**. Edge cases: empty → `null`; zero total → `null`; single candidate with positive weight → index 0.

#### `exactSelectionProbability(places, candidates, targetIndex)`

See § **Algorithm — `exactSelectionProbability`**. Equal-weight epsilon: `0.0001`.

#### `scoreCandidates(candidates, requiredCount, pastSelectionCountByParticipant)`

See § **Algorithm — `scoreCandidates`**.

### Golden tolerance

| Condition | Tolerance on `chancePercent` |
|-----------|------------------------------|
| `places > 1` and weights not all equal (within `0.0001`) | **±1** percentage point |
| `places === 1` OR all weights equal | **Exact** match |

### Random seam

- Test RNG: `kotlin.random.Random(seed)`.
- Golden draw vectors (**REF-D2**, **REF-D3**) are **Kotlin-specific** — not `Math.random()` / Node.

### JSON fixture schema

Fixtures live under `services/api/src/test/resources/draw/golden/`:

```json
{
  "id": "string",
  "description": "string",
  "function": "weightForParticipant | exactSelectionProbability | scoreCandidates | performWeightedDraw",
  "input": { },
  "expected": { },
  "tolerancePercent": 0
}
```

### Minimum frozen reference catalog

Values frozen during story **19.1** from `AvailabilityChanceCalculator` (Kotlin). **19.2 must not re-run legacy.**

| ID | Function | Input summary | Expected (frozen) |
|----|----------|---------------|-------------------|
| **REF-W1** | `weightForParticipant` | `past=0, required=5` | `5.0` |
| **REF-W2** | `weightForParticipant` | `past=3, required=5` | `1.25` |
| **REF-W3** | `weightForParticipant` | `past=2, required=2` | `0.6667` (4 dp) |
| **REF-P1** | `scoreCandidates` | 3 candidates, `required=1`, equal past | `[33, 33, 33]` % (any order) |
| **REF-P2** | `scoreCandidates` | 2 candidates, `required=1`, equal past | `[50, 50]` % |
| **REF-P3** | `scoreCandidates` | 8 candidates, `required=5`, equal past, weight 1 each | each `chancePercent = 63` |
| **REF-P4** | `scoreCandidates` | 2 candidates, `required=1`, past `{A:2, B:0}` | A = **25** %, B = **75** % (B > A) |
| **REF-D1** | `performWeightedDraw` | 1 candidate weight 5, `Random(42)` | selected index **0** |
| **REF-D2** | `performWeightedDraw` | weights `[3, 1, 1]`, `Random(42)` | selected index **0**, `randomValue ≈ 1.1315763298615888`, `totalWeight = 5.0` |
| **REF-D3** | `performWeightedDraw` | weights `[10, 1]`, `Random(7)` | selected index **1** (light candidate), `randomValue ≈ 10.533073649264582`, `totalWeight = 11.0` |
| **REF-E1** | edge | empty candidates | `null` / empty list |
| **REF-E2** | edge | weight 0 | `null` / 0 % |

**How to verify REF-D2:** With weights `[3, 1, 1]` and `Random(42)`, first `nextDouble()` yields `≈ 0.22631526597231776`; `randomValue = 0.2263… × 5.0 = 1.131576…`; cumulative walk selects index **0** (weight 3).

### Fixture generation note

Story **19.1** author computed **REF-D2**, **REF-D3**, **REF-P4** by executing `AvailabilityChanceCalculator` in Kotlin (Gradle test harness). Optional helper: [`scripts/draw/freeze-golden-vectors.kts`](../../../scripts/draw/freeze-golden-vectors.kts) — re-run only when the normative algorithm changes (requires Kotlin CLI or equivalent Gradle task).

---

## Orchestration golden test contract (19.3 handoff)

Story **19.3** locks **multi-role draw orchestration** in `CompositionDrawService` — beyond calculator-only golden tests (**19.2**).

### Scope IN / OUT

| IN (19.3) | OUT |
|-----------|-----|
| Full / partial redraw semantics | `AvailabilityChanceCalculator` unit golden → **19.2** |
| Cross-role + intra-role exclusion in one request | — (compartment in **19.8** — done) |
| `%` draw = summary at orchestration level | Factor pipeline → **19.5** |
| Opening snapshot `chancePercent` persistence (**6.14**, **E-04**) | Formula id on snapshot → **19.22** |
| G-03 indexed slot gap fill | UI explainability → **19.4** |
| `DrawMode.FILL_EMPTY` on locked composition (**E-03**) | API `randomSeed` param (test seam only) |

### E-04 vs story 6.14 AC1

Story **6.14** AC1 wording references `steps[]` candidate `%`. **Runtime** uses `captureOpeningDrawSnapshots` at draw opening with `openingCrossRoleExcluded` (pre-existing assignees only). Persisted `event_draw_chance_snapshots.chancePercent` is the **opening** score, not the first per-slot step after cross-role exclusions accumulate in the same request. Orchestration golden **REF-O8** asserts this invariant.

### JSON fixture schema (`draw/golden/orchestration.json`)

```json
{
  "id": "REF-O3",
  "description": "string",
  "tags": ["cross-role", "FR20"],
  "setup": {
    "roleSlots": { "player": 1, "mc": 1 },
    "participants": [{ "key": "solo" }],
    "availabilities": [{ "participantKey": "solo", "status": "available", "roleKeys": ["player", "mc"] }],
    "preAssignedSlots": [],
    "validatedPastEvents": [{ "roleSlots": { "player": 1 }, "assigneeKey": "veteran" }],
    "lockComposition": false
  },
  "drawSteps": [{ "mode": "full", "randomSeed": 99, "before": [{ "setAvailability": { "participantKey": "p2", "status": "unavailable", "roleKeys": [] } }] }],
  "expected": { "totalAssignedSlots": 1, "maxRolesPerParticipant": 1 }
}
```

Deterministic draws: call `CompositionDrawService.drawComposition(..., random = Random(seed))` in tests — **not** via HTTP (`DrawCompositionRequestDto` has no seed).

Participant keys map to stable UUIDs via `DrawGoldenFixtureLoader.participantId(key)` (same as **19.2**).

### Minimum frozen reference catalog (orchestration)

| ID | Scenario | Key assertion |
|----|----------|---------------|
| **REF-O1** | Full redraw, pool cannot refill | Exactly 1 assignee after second draw |
| **REF-O2** | Partial: slot 0 pre-assigned | Slot 0 unchanged; slot 1 filled |
| **REF-O3** | Cross-role same request | ≤1 role per multi-role candidate |
| **REF-O4** | Pre-assign player → excluded from dj | Solo stays player only |
| **REF-O5** | Manual multi-role stack | Auto-draw does not double-assign |
| **REF-O6** | 2 slots / 3 candidates, `Random(99)` | 2 distinct assignees (frozen keys) |
| **REF-O7** | Validated past history | Veteran `%` < rookie `%`; step `%` = summary |
| **REF-O8** | Multi-role opening snapshot | DB `chancePercent` = opening score (E-04) |
| **REF-O9** | G-03 gap: slot 1 occupied | Fills slot 0 only |
| **REF-O10** | `fillEmpty` on locked composition | Fills creux; occupant kept |
| **T-O1** | Empty player pool | Draw continues; dj filled |
| **T-O2** | Two full redraws | Snapshot row count stable |

Runner: `DrawOrchestrationGoldenTest` — `./gradlew test --tests 'com.hatcast.api.composition.DrawOrchestrationGoldenTest'`.

---

## Explainability API (story 19.7)

Per-candidate waterfall breakdown: how `chancePercent` differs from a **pure draw** baseline (`referencePercent`) via sequential factor deltas.

### Endpoints

| Method | Path | Audience |
|--------|------|----------|
| `GET` | `/v1/seasons/{seasonId}/events/{eventId}/composition/chance-breakdown?roleKey=&participantId=` | Orga (draft or validated) ; member on **Dispos** when event published ; member on **Équipe** when composition published or validated |
| `GET` | `/v1/seasons/{seasonId}/events/{eventId}/composition/pool-preview?roleKey=` | Orga (`canManageComposition`) only |

**403** when explainability is not allowed for the **requested surface**:

| Surface | Parameter / endpoint | Member gate | Organizer gate |
|---------|---------------------|-------------|----------------|
| Dispos | `includeChances=true` on availability summary ; breakdown from Dispos context | Published event (`availabilityOpenedAt` set, not draft/archived) + troupe membership | Same + `canManageComposition` on draft **events** per **3.21** |
| Équipe | Composition GET slot odds ; `chance-breakdown` from Équipe | Composition `publishedAt` or `validatedAt` | `canManageComposition` |

**Do not** use composition slot visibility to gate Dispos `includeChances` (SCP 2026-06-09 ; story **5.9**).

### `ChanceBreakdownDto`

| Field | Meaning |
|-------|---------|
| `referencePercent` | **Option C (W18):** `exactSelectionProbability` with `DrawWeightPipeline.EMPTY` (base weight = `requiredCount` only, all factor multipliers = 1.0). |
| `candidateCount` | Eligible pool size for the role (UI reference line: « Chance de base pour les {n} candidats »). |
| `poolRank` | **1-based** rank in the pool by `chancePercent` (desc); `aheadCount + 1`. |
| `aheadCount` | Count of candidates with **strictly higher** `chancePercent` than the subject (= `pool.peers.length` when peers are returned). |
| `tiedAtChanceCount` | Candidates sharing the subject’s `chancePercent` (including the subject); used for ex-aequo copy in UI. |
| `chancePercent` | Effective % with `DrawWeightPipelines.DEFAULT` (or draw snapshot on retrospective events when present). |
| `adjustments[]` | `{ factorId, label, deltaPoints }` — one row per pipeline factor; **omit** `deltaPoints === 0`. Sorted by \|delta\| desc. |
| `requiredCount` | Places to fill for the role (multi-place hint in UI header). |
| `pool.peers` | Candidates with **strictly higher** `chancePercent` than the subject, desc. **Not** rendered as a peer list in as-shipped UI (rank summary only); still returned for API completeness / client fallback when rank fields are absent. |
| `factorBreakdown` | Optional engine detail (`multiplier`, `label`) — tests / diagnostics, not MVP UI. |

### UI surfaces (as-shipped 19.7)

| Surface | API | Entry |
|---------|-----|-------|
| Fiche waterfall | `chance-breakdown` | Segment pool, % picker/grid/animation |
| Pool coloré (Équipe, Dispos) | `pool-preview` (orga) ; Dispos chances summary (membre) | Tap segment → `chance-breakdown` |
| Aide générale | — | `DrawChancesHelpDialog` (5 slides) ; not `chance-breakdown` |

**Client fallback:** if `poolRank` / `aheadCount` are missing but `pool.peers` is present, the web app derives rank from `peers.length` (`chance-breakdown-sheet.ts`).

### Delta algorithm

1. Build the same eligible pool as `scoreCandidates` for the role (availability + role rules).
2. `referencePercent` = rounded probability with `DrawWeightPipeline.EMPTY`.
3. For each factor `f` in pipeline order: apply factors `1..i`, recompute target %, `deltaPoints = percentAfter − percentBefore` (integer points); skip zero deltas.
4. **Tolerance:** `referencePercent + Σ deltaPoints ≈ chancePercent` (±1 pt rounding).

### Labels

`PastParticipationFactor` (`past_participation`): « Déjà {rôle} {n} fois » ou « Jamais {rôle} » si `n = 0` (`RoleLabels`).

Implementation: `ChanceBreakdownCalculator`, `CompositionExplainabilityService`.

---

## Invariant

**Displayed % = draw weights:** The same `AvailabilityChanceCalculator` pipeline must produce weights used for `performWeightedDraw`, Dispos **Tous %**, and Équipe explainability (FR19, FR20, FR24). Refactors (**19.5+**) must preserve this unless ADR + golden suite are updated.
