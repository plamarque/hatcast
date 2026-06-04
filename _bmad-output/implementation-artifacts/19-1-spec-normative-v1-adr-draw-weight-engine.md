---
baseline_commit: 904f69c105e555085995665bc0179db9292b05ff
---

# Story 19.1: Normative V1 draw specification and ADR 0019

Status: done

<!-- Ultimate context engine analysis completed — comprehensive developer guide created -->

## Story

As a **product team / developer**,  
I want a **normative V1 draw specification** and **ADR 0019**,  
so that **every evolution** (factors, category partition, formulas) starts from a clear, auditable contract.

## Acceptance Criteria

1. **Given** observed V1 behaviour (`chancesService.js`, `drawMultiRoles` / `drawForRole` in `GridBoard.vue`), **when** the normative spec is written, **then** it covers: weight formula, `pastSelectionCount` rules (validated, non-archived, non-declined, same season, same `role_key`), intra-role draw without replacement, cross-role exclusion during one draw request, full vs partial redraw semantics, and **display %** (`exactSelectionProbability` + documented approximation and ±1 pt tolerance for golden tests). [Source: epics 19.1 AC1; FR19, FR20, FR24]

2. **Given** the normative spec, **when** compared to V2 runtime (**6.4**, **6.14**, **17.9**), **then** an explicit **V1 ↔ V2 delta table** lists every intentional difference (e.g. history compartment: V1 `templateType = deplacement` binary split vs V2 `SpectacleCategory` / `event.category`; V2-only `SelectionHistoryMode`; V2-only draw-time snapshots **6.14**) with follow-up story ids (**19.8**, **19.2**, etc.). [Source: epics 19.1 AC2; SCP §4]

3. **Given** ADR **0019** at [`docs/adr/0019-draw-weight-engine.md`](../../docs/adr/0019-draw-weight-engine.md), **when** published, **then** it describes: factor-pipeline objective (Wave B+), invariant **« displayed % = draw weights »**, non-regression strategy (golden suite **19.2**), link to **6.14** snapshots, and **Wave D sketch** (formulas + policies — detail deferred to **19.15**). Status: **Accepted**. [Source: epics 19.1 AC3]

4. **Given** [`DOMAIN.md`](../../DOMAIN.md) and [`SPEC.md`](../../SPEC.md), **when** updated, **then** draw/fairness/chances sections **point to ADR 0019 + normative spec** without duplicating the full formula. [Source: epics 19.1 AC4; AGENTS.md doc-update rule]

5. **Given** [`docs/adr/README.md`](../../docs/adr/README.md), **when** updated, **then** ADR 0019 is indexed under V2 decisions. [Source: ADR index convention]

6. **Couverture:** FR19, FR20, FR24; NFR-Q1 (doc enables golden tests **19.2**). **UI : N/A** — documentation and ADR only; no changes under `apps/web/`. **Priorité:** P1. **Depends:** **6.4**, **6.14** (done).

7. **Given** story **19.1** complete (**exit gate 19.2**), **when** a developer picks up **19.2**, **then** they can implement the golden suite **without opening** `legacy/` or `scripts/replay/chancesLogic.js` — all algorithms, tolerances, fixture schema, and **frozen reference vectors** live in [`docs/v2/technical/draw-weight-engine-v1-spec.md`](../../docs/v2/technical/draw-weight-engine-v1-spec.md) § **Golden test contract (19.2 handoff)**. [Source: PO gate 2026-06-04]

---

## Acceptance Criteria — Material 3 (UI)

**UI : N/A** — pas de changement sous `apps/web/` ; section Material 3 omise volontairement.

---

## Tasks / Subtasks

- [x] **Périmètre :** documentation only — `docs/v2/technical/`, `docs/adr/`, `DOMAIN.md`, `SPEC.md` — **no** `legacy/`, `services/api/`, or `apps/web/` code changes in this story.
- [x] **AC1 — Normative V1 spec** — create [`docs/v2/technical/draw-weight-engine-v1-spec.md`](../../docs/v2/technical/draw-weight-engine-v1-spec.md):
  - [x] § **Weight formula** (normative): `malus = 1 / (1 + pastSelectionCount)` ; `weight = malus × requiredCountForRole`.
  - [x] § **`pastSelectionCount`** — count validated assignments per `(participantId, roleKey)` in same season; exclude current event; exclude archived events; exclude `DECLINED` slots; document V1 `cast.confirmed` ↔ V2 `event_compositions.validated_at IS NOT NULL`.
  - [x] § **History compartment (V1)** — binary split: if current event `templateType === 'deplacement'`, count only deplacement events; else exclude deplacements. Reference [`legacy/src/services/chancesService.js`](../../legacy/src/services/chancesService.js) `countCasts` lines 48–60.
  - [x] § **Selection** — `random ∈ [0, Σ weights)` cumulative walk; injectable `Random` for tests; edge cases: empty pool, zero total weight, single candidate.
  - [x] § **Intra-role filling** — loop `slotIndex ∈ 0..requiredCount-1`; each iteration removes winner from role pool (no replacement within role).
  - [x] § **Cross-role exclusion** — participant assigned to any slot in current draw request excluded from later role pools (V1 `excludedPlayers`).
  - [x] § **Redraw semantics** — full draw: role with all slots filled → replace entire role; partial: keep existing assignees, fill empty indices only; document `mode=full` vs `fillEmpty` V2 mapping.
  - [x] § **Display %** — primary: `exactSelectionProbability(places, candidates, index)` (port in [`AvailabilityChanceCalculator.kt`](../../services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityChanceCalculator.kt)); document approximation (expected-weight removal per draw); fallback to `weight/totalWeight` on error (V1); rounding: `Math.round(probability × 100)`; golden tolerance **±1 percentage point** for multi-place unequal weights (**19.2**).
  - [x] § **Code references** — V1 normative: `chancesService.js`, `GridBoard.vue` (`drawMultiRoles`, `countSelections`); replay `chancesLogic.js` (**weights + draw only** — see **G-04**); V2 runtime (informational): `AvailabilityChanceCalculator.kt`, `CompositionDrawService.kt`, `CompositionSelectionHistoryService.kt`.
  - [x] § **Documentation superseded** — explicitly note story **6.4** dev notes (`6-4-...md:112`) `round(weight/sum×100)` is **wrong**; **6.4** `:123` « no deplacement split » is **stale** post-**17.9**.
- [x] **AC2 — V1 ↔ V2 delta table** — copy **verbatim** (with citations) into normative spec § **Proven V1 ↔ V2 gaps** and § **V2-only extensions**; source investigation: [`investigations/draw-v1-v2-gaps-investigation.md`](investigations/draw-v1-v2-gaps-investigation.md).

  **Behavioral gaps (proven — must appear in spec):**

  | ID | Gap | Grade | V1 evidence | V2 evidence | Follow-up |
  |----|-----|-------|-------------|-------------|-----------|
  | **G-01** | History compartment granularity — V1 binary `templateType === 'deplacement'` vs V2 multi-slug `SpectacleCategory` / `event.category` (`aperock`, `deplacements`, `principal`, …) | **Confirmed** | `legacy/src/components/GridBoard.vue:7818-7829`, `legacy/src/services/chancesService.js:48-59` | `SpectacleCategory.kt:14-18`, `EventCompositionSlotRepository.kt:32-36` | **19.8** factor + golden; document example: `category=aperock` on cabaret → V1 principal pool, V2 aperock pool |
  | **G-02** | Current-event exclusion during draw weighting — V2 always excludes `excludeEventId`; V1 draw passes `null` to `countSelections` | **Deduced** (edge) | `legacy/src/services/chancesService.js:325` (via `calculateRoleChancesForFill` → `GridBoard.vue:7492`) | `EventCompositionSlotRepository.kt:27` | Document edge case: differs only if current event already has **confirmed/validated** composition |
  | **G-03** | Slot model — V1 per-role **arrays** (append on partial fill) vs V2 indexed `(roleKey, slotIndex)` with gap fill | **Hypothesized** | `legacy/src/components/GridBoard.vue:7304-7305` | `CompositionDrawService.kt:183-189` | **19.3** orchestration fixture required to confirm/refute |
  | **G-04** | Replay harness incomplete for display % — `chancesLogic.js` has no `exactSelectionProbability` | **Confirmed** | `legacy/src/services/chancesService.js:165-251` | `scripts/replay/chancesLogic.js:42-68` (weights only) | **19.2** golden % must source from the normative spec + Kotlin calculator contract, **not** replay alone |

  **V2-only extensions (document in ADR 0019 — not V1 parity regressions):**

  | ID | Feature | Evidence |
  |----|---------|----------|
  | **E-01** | Draw-time snapshot persistence (**6.14**) | `CompositionDrawService.kt:310-315` |
  | **E-02** | `SelectionHistoryMode` + `chanceSource` on Dispos | `SelectionHistoryMode.kt:6-17`, `AvailabilityService.kt:318-327` |
  | **E-03** | `DrawMode.FILL_EMPTY` on locked composition | `CompositionDrawService.kt:76-85` |
  | **E-04** | Snapshot % computed at draw **opening** (`captureOpeningDrawSnapshots`) ≠ per-step `%` in `steps[]` | `CompositionDrawService.kt:137-147` vs `:214-225`; note internal tension with **6.14** AC1 wording |
  | **E-05** | Event-only participant pool in draw eligibility | `CompositionParticipantPool.kt:23-91` vs V1 `allSeasonPlayers` only |

  **Aligned — do not list as drift in spec (cite as parity baseline):**

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

  **Additional delta rows (already in epic AC2 — keep in spec):**

  | Topic | V1 | V2 today | Follow-up |
  |-------|-----|----------|-----------|
  | Past-event Dispos % | Live recalc only | Snapshots **6.14** + `estimated` fallback | **19.2** |
  | Weight factors | Malus only | Monolithic `weightForParticipant` | **19.5–19.6** |
  | `% = draw` invariant | Yes | Yes — must stay after refactors | **19.2**, **19.5** |

- [x] **AC3 — ADR 0019** — create [`docs/adr/0019-draw-weight-engine.md`](../../docs/adr/0019-draw-weight-engine.md) using repo ADR template:
  - [x] **Context:** Epic 6 MVP draw shipped; business-critical fairness; need extensibility without formula drift.
  - [x] **Decision:** Normative spec is authoritative for V1 parity; future weights = **factor pipeline** (`finalWeight = base × Π factorMultiplier` — exact composition documented, default V1 = single `PastParticipationFactor`); **invariant:** same weight path for draw, Dispos **Tous %**, and Équipe explainability; golden regression **19.2**; snapshots **6.14** store draw-time % not formula id (extended in **19.22** Wave D).
  - [x] **Wave D sketch (non-normative):** `DrawFormula`, `DrawPolicy`, event resolution via `event.category`, organizer choice at draw — detail **19.15**; link SCP.
  - [x] **Consequences:** Positive: auditable evolution; Negative: doc maintenance, golden CI cost.
  - [x] **Alternatives rejected:** Re-open **6.4**; change formula without ADR + golden; free-form scripting in MVP Wave D.
- [x] **AC4 — DOMAIN.md** — in § Draw / chances (≈ lines 28–29), replace thin legacy-only pointer with: V2 normative draw behaviour → ADR 0019 + `docs/v2/technical/draw-weight-engine-v1-spec.md`; keep legacy code refs as historical V1 runtime only.
- [x] **AC4 — SPEC.md** — add short **V2 draw engine** note (near composition/draw flows): weighted draw semantics defined in ADR 0019; do not duplicate formula in SPEC.
- [x] **AC5 — ADR index** — add row to [`docs/adr/README.md`](../../docs/adr/README.md) § V2 decisions.
- [x] **Optional (recommended):** add one-line link from [`docs/v2/README.md`](../../docs/v2/README.md) technical section to the new spec file.
- [x] **Validation:** re-read AC1–5; confirm story **6.4** dev notes superseded by normative spec (add one line at top of **6.4** story file: « Historical implementation notes; normative contract → ADR 0019 » — **optional**, waivable).
- [x] **No code/tests in 19.1** — `./gradlew test` unchanged; **19.2** implements golden suite per ADR.
- [x] **AC7 — Exit gate 19.2 (mandatory spec sections)** — in [`draw-weight-engine-v1-spec.md`](../../docs/v2/technical/draw-weight-engine-v1-spec.md), add § **Golden test contract (19.2 handoff)** containing **all** of the following (self-contained — no pointer to legacy as runtime source):

  - [x] **Scope boundary for 19.2** — IN: `AvailabilityChanceCalculator` (`weightForParticipant`, `toWeightedCandidates`, `exactSelectionProbability`, `scoreCandidates`, `performWeightedDraw`). OUT: `CompositionDrawService` orchestration → **19.3**; history SQL / compartment → **19.8**; snapshots → **6.14** / **E-04**.
  - [x] **Forbidden reads for 19.2** — explicit list: `legacy/**`, `scripts/replay/chancesLogic.js` (weights-only stub). Allowed: normative spec, ADR 0019, `AvailabilityChanceCalculator.kt`, existing unit tests as examples.
  - [x] **Algorithm appendix (normative pseudocode)** — copy-paste-ready specs for:
    - `weightForParticipant(pastSelectionCount, requiredCount)`
    - `performWeightedDraw(candidates, random)` including edge cases (empty, zero total, fallback last)
    - `exactSelectionProbability(places, candidates, targetIndex)` — full loop with `0.0001` equal-weight epsilon, expected-weight removal, closest-candidate removal (matches Kotlin `AvailabilityChanceCalculator.kt:70-133`)
    - `scoreCandidates` — map to weighted list, call `exactSelectionProbability`, `round(prob × 100)`, sort descending by `chancePercent`
  - [x] **Golden tolerance** — `±1` percentage point on `chancePercent` when `places > 1` and weights not all equal; **exact** match when `places === 1` or all weights equal (within epsilon).
  - [x] **Random seam** — `kotlin.random.Random(seed)`; document that golden draw vectors are **Kotlin-specific** (not `Math.random()` / Node).
  - [x] **JSON fixture schema** — document shape under `services/api/src/test/resources/draw/golden/` (include `exactSelectionProbability` in `function` enum):

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

  - [x] **Minimum frozen reference catalog** — embed **inputs + expected outputs** in spec (author computes once during 19.1 using Kotlin calculator or legacy audit — result frozen in doc). Minimum rows:

    | ID | Function | Input summary | Expected (frozen) |
    |----|----------|---------------|-------------------|
    | **REF-W1** | `weightForParticipant` | `past=0, required=5` | `5.0` |
    | **REF-W2** | `weightForParticipant` | `past=3, required=5` | `1.25` |
    | **REF-W3** | `weightForParticipant` | `past=2, required=2` | `0.666…` (document 4 dp) |
    | **REF-P1** | `scoreCandidates` | 3 candidates, `required=1`, equal past | `[33,33,33]` % (any order) |
    | **REF-P2** | `scoreCandidates` | 2 candidates, `required=1`, equal past | `[50,50]` % |
    | **REF-P3** | `scoreCandidates` | 8 candidates, `required=5`, equal past, weight 1 each | each `chancePercent = 63` |
    | **REF-P4** | `scoreCandidates` | 2 candidates, `required=1`, past `{A:2, B:0}` | B % > A % (document numeric pair) |
    | **REF-D1** | `performWeightedDraw` | 1 candidate weight 5, `Random(42)` | selected index 0 |
    | **REF-D2** | `performWeightedDraw` | weights `[3,1,1]`, `Random(42)` | selected index + `randomValue` (run Kotlin once, freeze) |
    | **REF-D3** | `performWeightedDraw` | weights `[10,1]`, `Random(7)` | selected index (freeze) |
    | **REF-E1** | edge | empty candidates | `null` / empty list |
    | **REF-E2** | edge | weight 0 | `null` / 0 % |

  - [x] **Fixture generation note** — one paragraph: 19.1 author runs `AvailabilityChanceCalculator` (REPL, temporary main, or `./gradlew test` println) to fill **REF-D2/D3/P4** numeric cells; **19.2 must not re-run legacy**. Optional helper script `scripts/draw/freeze-golden-vectors.kts` (created in **19.1** or **19.2** — if 19.1, script reads spec IDs only).
  - [x] **ADR 0019 cross-link** — one sentence: golden contract authority = normative spec § Golden test contract; epic **19.2** AC1 « chancesLogic.js » **superseded** by spec for Wave A.

- [x] **Exit gate checklist (19.1 done when all true):**
  - [x] Spec § Golden test contract present and complete
  - [x] Every **REF-*** row has numeric expected values (no TBD)
  - [x] Pseudocode sufficient to reimplement calculator in isolation
  - [x] A reviewer can answer « how do I test draw seed 42 with weights [3,1,1]? » from spec alone
  - [x] ADR 0019 points to spec as 19.2 sole normative input

---

## Dev Notes

### Product and UX rules

- **Wave A goal:** lock V1 parity **on paper** before golden tests (**19.2**) and orchestration fixtures (**19.3**). This story produces **zero runtime behaviour change**.
- **Do not modify `legacy/`** — read-only reference for V1 behaviour.
- **Story 6.4 dev notes** contain useful but **non-authoritative** algorithm text (e.g. simplified `practicalChancePercent = round(weight/sum×100)` — **incorrect** vs production V1 which uses `exactSelectionProbability`). The normative spec must match **observed V1 + V2 Kotlin**, not the simplified line in 6.4 dev notes.
- **Investigation 2026-06-04** ([`draw-v1-v2-gaps-investigation.md`](investigations/draw-v1-v2-gaps-investigation.md)) — **G-01–G-04** are the mandatory behavioral gap rows for AC2; do not re-derive from memory. **G-01** is the primary intentional V2 evolution (17.9 / category); treat as documented drift until **19.8** golden locks compartment behaviour.
- **Exit gate 19.2 (AC7):** Story **19.1** is not done until the normative spec alone is sufficient for **19.2**. The **19.1 author** may read `legacy/` once to **audit and freeze** reference vectors into the spec; the **19.2 author must not**. Legacy citations in AC2/G-01 tables are **provenance for 19.1**, not required reading for 19.2.
- **FR19** = organizer sees eligible available participants per role; **FR20** = weighted draw; **FR24** = explainability odds on composition after publish/validate. ADR ties all three to one calculator pipeline.

### Explicit non-goals

| Item | Reason |
|------|--------|
| Golden test implementation | Story **19.2** |
| Kotlin/Java/TS code changes | Stories **19.5+** |
| User-facing orga/member doc | Story **19.4** |
| SPEC/DOMAIN Wave D formulas detail | Story **19.15** gates Wave D |
| Re-open or amend **6.4** / **6.14** code | SCP explicitly rejected |

### Dependencies

| Story | Status | Relationship |
|-------|--------|--------------|
| **6.4** | done | V2 draw runtime — source for delta table |
| **6.14** | done | Draw-time snapshot semantics — ADR must reference |
| **17.9** | done | Category compartment in history — document V1↔V2 gap → **19.8** |
| **19.2** | backlog | Blocked on **AC7 exit gate** — implements golden from spec § Golden test contract only |
| **19.4** | backlog | Can reuse spec prose for orga-facing doc |
| **19.15** | backlog | Wave D SPEC/ADR extension |

---

### Architecture compliance

- Follow [AGENTS.md](../../AGENTS.md): normative behaviour in SPEC/DOMAIN **by reference**; full formula lives in `docs/v2/technical/draw-weight-engine-v1-spec.md`.
- ADR format: match [0018-v2-audit-events-postgres.md](../../docs/adr/0018-v2-audit-events-postgres.md) structure.
- **SPEC vs PLAN separation:** do not add Epic 19 task lists to SPEC; PLAN.md already has Epic 19 table.
- Link from ADR to [sprint-change-proposal-2026-06-04-epic19-draw-weight-engine.md](../planning-artifacts/sprint-change-proposal-2026-06-04-epic19-draw-weight-engine.md) for product context.

### Technical requirements (normative content to capture)

**Weight (V1 production scope — only factor today):**

```
malus = 1 / (1 + pastSelectionCount)
weight = malus × requiredCountForRole
```

**Selection (`performWeightedDraw`):**

```
randomValue = random.nextDouble() × totalWeight
walk cumulative weights until randomValue ≤ cumulative → selected
```

**Display % (`scoreCandidates` / V1 `calculateRoleChances`):**

```
chancePercent = round(exactSelectionProbability(requiredCount, weightedCandidates, index) × 100)
```

**`exactSelectionProbability` algorithm (must document steps — 19.2 implements from this text only):**

```
INPUT: places (int), candidates[{weight}], targetIndex (int)
IF places=0 OR candidates empty OR targetIndex out of range → RETURN 0
IF places >= candidates.length → RETURN 1
targetWeight ← candidates[targetIndex].weight
totalWeight ← sum(candidates.weight)
IF totalWeight = 0 → RETURN 0
IF places = 1 → RETURN targetWeight / totalWeight
IF all |c.weight - targetWeight| < 0.0001 → RETURN places / candidates.length
probNotSelected ← 1
remainingCandidates ← copy(candidates)
remainingTotalWeight ← totalWeight
FOR tirage FROM 1 TO places:
  IF remainingCandidates.length <= 1 → BREAK
  probNotSelected *= 1 - (targetWeight / remainingTotalWeight)
  otherCandidates ← remainingCandidates without target
  otherTotalWeight ← remainingTotalWeight - targetWeight
  IF otherCandidates not empty AND otherTotalWeight > 0:
    expectedWeightRemoved ← Σ (c.weight/remainingTotalWeight * c.weight) for c in otherCandidates
  ELSE:
    expectedWeightRemoved ← otherTotalWeight / max(1, |otherCandidates|)
  remainingTotalWeight -= expectedWeightRemoved
  IF remainingCandidates.length > 1 AND otherCandidates not empty:
    closest ← argmin |c.weight - expectedWeightRemoved| over otherCandidates
    remainingCandidates ← remainingCandidates without closest
RETURN clamp(1 - probNotSelected, 0, 1)
```

**`scoreCandidates` rounding:** `chancePercent = roundHalfUp(exactSelectionProbability × 100)` — Java/Kotlin `Math.round` / `halfUpRound`, not floor.

**Seed values already verified in V2 unit tests (must appear as REF-P* in spec):**

| Case | Input | Expected |
|------|-------|----------|
| Equal 8×5 | 8 candidates weight 1, `requiredCount=5` | each `chancePercent = 63` |
| Equal 3×1 | 3 candidates, `requiredCount=1` | each `33` % |
| Equal 2×1 | 2 candidates, `requiredCount=1` | each `50` % |
| Veteran malus | A past=2, B past=0, `requiredCount=1` | B % > A % |

Source: `AvailabilityChanceCalculatorTest.kt` — 19.1 embeds exact B/A pair when freezing **REF-P4**.

**`pastSelectionCount` (V2 implementation — document as target semantics aligned with V1 intent):**

Source: [`CompositionSelectionHistoryService`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionSelectionHistoryService.kt) + [`EventCompositionSlotRepository`](../../services/api/src/main/kotlin/com/hatcast/api/composition/EventCompositionSlotRepository.kt).

- Scope: same `season_id`, same compartment (`SpectacleCategory.slug(event)`), same `role_key`, same `participant_id`.
- Exclude: current `event_id`, `events.archived = true`, slots with `participation_status = DECLINED`, compositions with `validated_at IS NULL`.
- **Draw / future events:** `SelectionHistoryMode.OPERATIONAL` (includes future validated events in season — supports out-of-order selection).
- **Past events without snapshot:** `SelectionHistoryMode.RETROSPECTIVE` (events before target only) — superseded by **6.14** snapshot when present.

**Orchestration ([`CompositionDrawService`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionDrawService.kt)):**

- Roles processed in template display order.
- Per role: build eligible pool → weight → score → draw per slot index.
- `DrawMode.FULL`: clear role slots before fill when full redraw; `FILL_EMPTY`: only empty indices.
- Cross-role set `crossRoleExcluded` updated after each assignment.
- Within-role set `withinRoleExcluded` for no-replacement intra-role.
- Empty pool → slot stays empty; draw continues (no abort).

**6.14 snapshot link (ADR must mention — include E-04):**

- Table `event_draw_chance_snapshots` — persisted via `captureOpeningDrawSnapshots` at draw **opening** (`CompositionDrawService.kt:369-422`), **not** per-step `steps[]` scores.
- Snapshot % uses `openingCrossRoleExcluded` (all pre-existing assignees); `steps[]` `%` evolves as `crossRoleExcluded` grows during the same request — document this divergence; do **not** claim AC1 « same scoreCandidates as steps[] » without the opening-vs-step caveat.
- Past event Dispos reads snapshot when present; else `chanceSource: estimated`.
- Invariant for **future** refactors: snapshot semantics must stay documented and test-covered (**19.2** / **19.3**).

### File structure requirements

| Action | Path |
|--------|------|
| **CREATE** | `docs/v2/technical/draw-weight-engine-v1-spec.md` |
| **CREATE** | `docs/adr/0019-draw-weight-engine.md` |
| **UPDATE** | `docs/adr/README.md` — index row |
| **UPDATE** | `DOMAIN.md` — draw/chances pointer (~§ lines 28–29) |
| **UPDATE** | `SPEC.md` — V2 draw reference (1 short paragraph) |
| **OPTIONAL UPDATE** | `docs/v2/README.md` — link under technical docs |

**Do not create** test fixtures, Kotlin interfaces, or modify calculator code in **19.1**.

### Testing requirements

| Layer | Expectation |
|-------|-------------|
| This story | **No new automated tests** — documentation only |
| **19.2** | Golden suite validates spec; `./gradlew test` |
| Manual review | PO + architect sign-off on ADR 0019 draft (SCP handoff) |

Review checklist for author:

- [x] Spec matches `chancesService.js` + `AvailabilityChanceCalculator.kt` (not simplified 6.4 dev-note formula)
- [x] V1↔V2 delta table includes **G-01–G-04** + **E-01–E-05** + aligned baseline (investigation-backed)
- [x] **AC7 exit gate:** § Golden test contract complete; all **REF-*** rows frozen; 19.2 doable without legacy
- [x] ADR 0019 status = Accepted; Wave D clearly marked non-normative sketch
- [x] DOMAIN/SPEC do not duplicate formulas
- [x] French UI terms preserved where cited (Dispos, Équipe, Catégorie)

**19.2 reviewer spot-check (after 19.1 merge):** Pick **REF-D2** at random — confirm expected values exist in spec and match `./gradlew test` without reading `legacy/`.

### Previous story intelligence (6.4, 6.14, 17.9)

**From 6.4 (done):**

- Single source of truth: `AvailabilityChanceCalculator` for draw + Dispos summary + explainability.
- Server-side draw authoritative; client animation presentational only.
- History service wired; stub removed.
- Full redraw must clear stale slots (review patch applied).

**From 6.14 (done):**

- `%` at draw time persisted; past events prefer snapshot over live recalc.
- `SelectionHistoryMode.OPERATIONAL` used at draw; retrospective for migrated past events without snapshot.
- Do not fabricate snapshots on manual assign.

**From 17.9 (done):**

- Compartment via `SpectacleCategory` (evolved from story's `equity_tag` wording — code uses `event.category`).
- **19.8** will extract compartment into factor pipeline + golden regression — spec must document current behaviour without promising factor API yet.

### Git intelligence

Recent commit `904f69c1 docs(plan): Add Epic 19 draw engine backlog` — planning only; no ADR/spec files yet. **19.1** is the first implementation artifact for Epic 19.

### Latest technical information

No external library versions apply (documentation story). ADR should note:

- Kotlin `kotlin.random.Random` as test seam (already in `AvailabilityChanceCalculator.performWeightedDraw`).
- Golden tolerance ±1 pt documented for unequal-weight multi-place scenarios (**19.2** will enforce).

### Project context reference

- [project-context.md](../../project-context.md) — doc locations, no feature invention.
- [PLAN.md § Epic 19](../../PLAN.md) — wave table, DoD Wave A.
- [epics.md § Epic 19](../planning-artifacts/epics.md) — story AC source.
- [SCP Epic 19](../planning-artifacts/sprint-change-proposal-2026-06-04-epic19-draw-weight-engine.md) — product rationale.

### References

| Artifact | Purpose |
|----------|---------|
| [`legacy/src/services/chancesService.js`](../../legacy/src/services/chancesService.js) | V1 normative reference |
| [`scripts/replay/chancesLogic.js`](../../scripts/replay/chancesLogic.js) | Replay harness — **weights/draw only**; not sole golden source for % (**G-04**) |
| [`investigations/draw-v1-v2-gaps-investigation.md`](investigations/draw-v1-v2-gaps-investigation.md) | Proven G-01–G-04 gap list (2026-06-04) |
| [`AvailabilityChanceCalculator.kt`](../../services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityChanceCalculator.kt) | V2 calculator |
| [`CompositionDrawService.kt`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionDrawService.kt) | V2 orchestration |
| [`6-4` story file](6-4-tirage-aleatoire-pondere-et-affichage-des-cotes-explainability.md) | Historical dev notes |
| [`6-14` story file](6-14-snapshot-chances-au-tirage.md) | Snapshot semantics |
| [`17-9` story file](17-9-tirage-chances-par-tag.md) | Compartment partitioning |
| [ADR 0013](../../docs/adr/0013-troupe-navigation-equity-tags-event-slugs.md) | Category / compartment model |

---

## Dev Agent Record

### Agent Model Used

claude-4.6-sonnet-medium-thinking

### Debug Log

- Frozen REF-D2/D3/P4 via `AvailabilityChanceCalculator` Kotlin execution (seed 42 → index 0, randomValue 1.131576…; seed 7 → index 1; veteran/newcomer 25/75 %).

### Completion Notes List

- Created normative spec `docs/v2/technical/draw-weight-engine-v1-spec.md` with full V1 algorithm, V1↔V2 delta (G-01–G-04, E-01–E-05), and § Golden test contract with frozen REF-* catalog.
- Created ADR 0019 (Accepted): factor-pipeline objective, `% = draw` invariant, golden **19.2**, **6.14** snapshots, Wave D sketch.
- Updated DOMAIN.md, SPEC.md (by-reference pointers), docs/adr/README.md, docs/v2/README.md.
- Added supersession note to story 6.4 file.
- Optional helper `scripts/draw/freeze-golden-vectors.kts` for re-freezing vectors when algorithm changes.
- `./gradlew test` — BUILD SUCCESSFUL (no production code changes).

### File List

- `docs/v2/technical/draw-weight-engine-v1-spec.md` (CREATE)
- `docs/adr/0019-draw-weight-engine.md` (CREATE)
- `docs/adr/README.md` (UPDATE)
- `docs/v2/README.md` (UPDATE)
- `DOMAIN.md` (UPDATE)
- `SPEC.md` (UPDATE)
- `scripts/draw/freeze-golden-vectors.kts` (CREATE — optional helper)
- `_bmad-output/implementation-artifacts/6-4-tirage-aleatoire-pondere-et-affichage-des-cotes-explainability.md` (UPDATE — supersession note)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (UPDATE — 19.1 → review)
- `_bmad-output/implementation-artifacts/19-1-spec-normative-v1-adr-draw-weight-engine.md` (UPDATE)

### Change Log

- 2026-06-04: Story 19.1 created — normative V1 spec + ADR 0019 + DOMAIN/SPEC pointers.
- 2026-06-04: Integrated proven V1↔V2 gaps **G-01–G-04**, extensions **E-01–E-05**, aligned baseline from [`draw-v1-v2-gaps-investigation.md`](investigations/draw-v1-v2-gaps-investigation.md).
- 2026-06-04: Added **AC7 exit gate 19.2** — golden handoff contract, REF-* catalog, forbidden legacy reads for 19.2.
- 2026-06-04: Implementation complete — spec, ADR 0019, doc pointers, frozen REF vectors; status → review.

---

### Validation create-story

- [x] AC métier numérotés et sourcés (epics / FR)
- [x] **AC7 exit gate 19.2** défini
- [x] Section **Material 3** = **UI : N/A**
- [x] Tasks référencent les numéros d'AC
- [x] Liens vers fichiers code existants à réutiliser (read-only)
- [x] `./gradlew test` mentionné comme unchanged ; **19.2** pour tests golden

### Review Findings

- [x] [Review][Dismiss] BUG-008 hors périmètre story 19.1 — non traité dans cette revue.
- [x] [Review][Patch] Retirer les références de stories du SPEC (`stories 6.4, 6.14`) pour respecter la séparation SPEC/PLAN [SPEC.md] — done
- [x] [Review][Patch] Aligner le contrat 19.2 pour éviter la contradiction « legacy interdit » vs « % golden source depuis `chancesService.js` » [docs/v2/technical/draw-weight-engine-v1-spec.md] — done
- [x] [Review][Patch] Étendre le schéma de fixture golden pour couvrir explicitement `exactSelectionProbability` [docs/v2/technical/draw-weight-engine-v1-spec.md] — done
- [x] [Review][Patch] Lever l’ambiguïté exécutable sur l’exclusion de l’événement courant (cas edge V1 draw avec `excludeEventId = null`) dans la section règles/contrat 19.2 [docs/v2/technical/draw-weight-engine-v1-spec.md] — done
- [x] [Review][Patch] Corriger le helper `freeze-golden-vectors.kts` (`@file:DependsOn(\"\")` vide) pour garantir la reproductibilité annoncée [scripts/draw/freeze-golden-vectors.kts] — done
- [x] [Review][Defer] Périmètre de working tree non isolé à 19.1 [git status] — deferred, pre-existing
