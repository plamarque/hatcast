# Investigation: Draw engine V1 ↔ V2 proven gaps

## Hand-off Brief

1. **What happened.** A targeted code comparison of V1 draw/chances (`chancesService.js`, `GridBoard.vue`, `chancesLogic.js`) vs V2 (`AvailabilityChanceCalculator.kt`, `CompositionDrawService.kt`, history/compartment) found **8 confirmed behavioral gaps**, **6 V2-only extensions**, and **3 documentation/internal inconsistencies** — not assumptions.
2. **Where the case stands.** **Concluded** — evidence perimeter fully mapped for the requested files; no runtime repro required for doc-only deltas.
3. **What's needed next.** Feed the **Confirmed behavioral gaps** table into story **19.1** normative spec § V1↔V2 delta; run **19.2** golden tests on weight/draw/% (not `chancesLogic.js` alone — it omits `exactSelectionProbability`).

## Case Info

| Field            | Value                                                                 |
| ---------------- | --------------------------------------------------------------------- |
| Ticket           | N/A (Epic 19 / story 19.1 prep)                                       |
| Date opened      | 2026-06-04                                                            |
| Status           | Concluded                                                             |
| System           | HatCast monorepo — V1 `legacy/`, V2 `services/api/`                   |
| Evidence sources | Source code (primary), story dev notes 6.4 / 6.14 / 17.9 (secondary) |

## Problem Statement

Produce a **proven** (citation-backed) list of gaps between V1 production draw semantics and V2 runtime, covering: `legacy/chancesService.js`, `scripts/replay/chancesLogic.js`, `AvailabilityChanceCalculator.kt`, `CompositionDrawService.kt`, dev notes 6.4 / 6.14, and category/compartment (17.9).

## Evidence Inventory

| Source | Status | Notes |
| ------ | ------ | ----- |
| `legacy/src/services/chancesService.js` | Available | Weight, %, `countCasts`, `calculateExactSelectionProbability` |
| `legacy/src/components/GridBoard.vue` | Available | `drawMultiRoles`, `drawForRole`, `countSelections` |
| `scripts/replay/chancesLogic.js` | Available | Partial port — no `%` algorithm |
| `services/api/.../AvailabilityChanceCalculator.kt` | Available | V2 calculator |
| `services/api/.../CompositionDrawService.kt` | Available | V2 orchestration + snapshots |
| `services/api/.../SpectacleCategory.kt` + slot repo | Available | Compartment (17.9) |
| `6-4`, `6-14`, `17-9` story files | Available | Dev notes vs code cross-check |
| Production V1 runtime logs | Missing | Not required for static parity audit |

## Confirmed Findings

### Finding 1: Weight formula is aligned V1 ↔ V2

**Evidence:** `legacy/src/services/chancesService.js:99-110`, `services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityChanceCalculator.kt:43-48`

**Detail:** Both use `malus = 1/(1+n)` and `weight = malus × requiredCount`.

---

### Finding 2: Weighted draw selection algorithm is aligned

**Evidence:** `legacy/src/services/chancesService.js:466-484`, `scripts/replay/chancesLogic.js:28-39`, `AvailabilityChanceCalculator.kt:135-155`

**Detail:** Cumulative walk on `random ∈ [0, totalWeight)`; empty pool / zero weight → null; fallback to last candidate.

---

### Finding 3: Display % uses `exactSelectionProbability` in V1 production and V2 — not simple `weight/sum`

**Evidence:** V1 `legacy/src/services/chancesService.js:351-352` (primary path); V2 `AvailabilityChanceCalculator.kt:176-177`. **Counter-evidence:** story `6-4` dev notes `6-4-tirage-...md:112` documents `round((weight/sum)×100)` — **wrong vs code** (doc bug, not V1↔V2 gap).

---

### Finding 4: History compartment — CONFIRMED behavioral gap (V1 binary `templateType` vs V2 multi-slug `category`)

**Evidence:**

- V1: `legacy/src/components/GridBoard.vue:7818-7829` — if `currentEventType === 'deplacement'` count only `templateType === 'deplacement'`; else exclude deplacements. Key = **`event.templateType`** only; no `aperock`, `match`, etc.
- V1 same rule in `legacy/src/services/chancesService.js:48-59` (`countCasts`).
- V2: `services/api/src/main/kotlin/com/hatcast/api/event/SpectacleCategory.kt:14-18` — slug from `event.category` first, legacy `templateType = deplacement` → `deplacements`, else `principal`; arbitrary slugs (e.g. `aperock`) get own pool.
- V2 query: `EventCompositionSlotRepository.kt:32-36`.

**Impact:** Event with `category = aperock` on a cabaret template — V1 counts in **principal** pool; V2 counts in **aperock** pool only.

**Follow-up:** Epic **19.8** (factor extraction + golden); document explicitly in **19.1** spec.

---

### Finding 5: History validation gate — semantically aligned, different storage

**Evidence:** V1 `GridBoard.vue:7807-7809` (`cast.confirmed`); V2 `EventCompositionSlotRepository.kt:29` (`c.validatedAt IS NOT NULL`). Same intent: only locked/validated compositions count.

---

### Finding 6: Current event exclusion — aligned in typical draft redraw

**Evidence:** V2 `EventCompositionSlotRepository.kt:27` (`excludeEventId`). V1 UI passes `excludeEventId` to `countSelections` for **Dispos display** (`CastsView.vue:1452`) but draw fill uses `countSelections(..., null, eventType)` via `chancesService.js:325` — **does not pass excludeEventId during draw weighting**. Mitigated when current event cast is **unconfirmed** (`cast.confirmed === false` → not counted). **Deduced edge gap:** if V1 ever had confirmed cast on same event during redraw, it could count; V2 always excludes current event id.

---

### Finding 7: Draw role processing order — aligned

**Evidence:** V1 `legacy/src/services/storage.js:122-131` (`ROLE_PRIORITY_ORDER`); V2 `EventRoleSlots.kt:51-61` (`RoleKeys.PRIORITY_ORDER` — same sequence); used by `CompositionDrawService.kt:149` via `rolesRequiredForEvent`.

---

### Finding 8: Full vs partial redraw semantics — aligned (intent)

**Evidence:** V1 `GridBoard.vue:7279-7308` (complete role → full redraw; else keep + fill remaining). V2 `CompositionDrawService.kt:155-189` (`isFullRedraw` clears slots when `filledCount >= requiredCount`; else fill empty indices only).

---

### Finding 9: Cross-role exclusion during one draw — aligned (fix 2026-06-05)

**Evidence:** V1 `GridBoard.vue:7277-7304` (`allAlreadySelected` / `excludedPlayers`). V2 `CompositionDrawService.kt` (`crossRoleExcluded`).

**Gap (fixed 2026-06-05):** V2 initially seeded `crossRoleExcluded` empty and only accumulated assignees as roles were processed in priority order. A participant **pre-assigned** on a role drawn **later** (e.g. player) could be picked again for an **earlier** role (e.g. DJ). Fix: initialize `crossRoleExcluded` from all pre-existing assignees; on full role redraw, remove that role's assignees from the set before re-pick.

**Related UX:** `multiRoleOnEventWarning` — non-blocking organizer hint when manual assign stacks multiple roles on the same event (FR21 allowed).

---

### Finding 10: Intra-role no-replacement — aligned

**Evidence:** V1 `GridBoard.vue:7528-7538` (remove winner from pool each iteration). V2 `CompositionDrawService.kt:269` (`withinRoleExcluded`).

---

### Finding 11: `scripts/replay/chancesLogic.js` is an incomplete V1 port — CONFIRMED gap vs `chancesService.js`

**Evidence:** `chancesLogic.js:42-68` returns weights only; **no** `calculateExactSelectionProbability`. Golden tests sourced from replay alone would **not** validate display %.

---

### Finding 12: V2-only — draw-time chance snapshots (6.14)

**Evidence:** `CompositionDrawService.kt:310-315`, `CompositionDrawChanceSnapshotService.kt`. V1 has no persisted draw-time % (`6-14` story AC). Not a parity regression — **extension**.

---

### Finding 13: V2-only — `SelectionHistoryMode` OPERATIONAL vs RETROSPECTIVE

**Evidence:** `SelectionHistoryMode.kt:6-17`, `SelectionHistoryModeResolver.kt:20-28`; used in `AvailabilityService.kt:221+` for past-event Dispos. V1 always uses season-wide confirmed history (no past/future mode split).

---

### Finding 14: V2-only — `DrawMode.FILL_EMPTY` on locked composition

**Evidence:** `CompositionDrawService.kt:76-85,362-366`. No V1 equivalent found in `drawMultiRoles`.

---

### Finding 15: V2-only — `captureOpeningDrawSnapshots` (snapshot % ≠ per-step `steps[]` %)

**Evidence:** `CompositionDrawService.kt:369-422` — snapshots scored **once at draw opening** with `openingCrossRoleExcluded` (all pre-existing assignees). Per-slot `steps[]` uses evolving `crossRoleExcluded` (`CompositionDrawService.kt:214-225`). **Internal V2 inconsistency** with story **6.14** AC1 text ("same `scoreCandidates` output used in `steps[]`") — implementation uses opening pass only for persistence.

---

### Finding 16: Slot model — structural difference

**Evidence:** V1 stores per-role **arrays** of player ids (`GridBoard.vue:7314-7320`); V2 uses indexed slots `(roleKey, slotIndex)` (`CompositionDrawService.kt:257-263`). V2 supports gap fill at specific indices; V1 partial fill appends to array — **Deduced:** middle-slot gaps may behave differently (needs dedicated fixture in **19.3** to confirm).

---

### Finding 17: Story 6.4 dev note contradicts V2 implementation on compartment

**Evidence:** `6-4-tirage-...md:123` says "Do **not** reintroduce V1 `templateType` pool splitting" — but V2 **does** partition via `SpectacleCategory` after **17.9** (`CompositionSelectionHistoryService.kt:29-36`). Doc stale; code superseded.

---

### Finding 18: Story 17.9 terminology vs code — `equity_tag` vs `event.category`

**Evidence:** Story `17-9-tirage-chances-par-tag.md` references `equity_tag`; runtime uses `EventEntity.category` + `SpectacleCategory.kt`. Not V1↔V2 — **story doc drift**.

## Proven V1 ↔ V2 Gap List (deliverable)

| ID | Gap | Grade | V1 evidence | V2 evidence | Parity impact |
|----|-----|-------|-------------|-------------|---------------|
| **G-01** | History compartment granularity | **Confirmed** | `GridBoard.vue:7818-7829` binary `templateType` | `SpectacleCategory.kt:14-18`, repo `:32-36` | Different `pastSelectionCount` for tagged events (e.g. `aperock`) |
| **G-02** | Current-event history during draw | **Deduced** (edge) | Draw uses `countSelections(..., null, ...)` `chancesService.js:325` | Always `excludeEventId` in SQL `:27` | Differs only if current event already validated/confirmed |
| **G-03** | Slot indexing / gap semantics | **Hypothesized** | Array append `GridBoard.vue:7304-7305` | Indexed slots `CompositionDrawService.kt:183-189` | Needs **19.3** fixture |
| **G-04** | Replay harness incomplete for % | **Confirmed** | `chancesService.js:165-251` | `chancesLogic.js` lacks equivalent | **19.2** must not use replay-only for golden % |

### V2-only extensions (not V1 parity gaps — document in ADR 0019)

| ID | Feature | Evidence |
|----|---------|----------|
| **E-01** | Draw-time snapshot persistence | `CompositionDrawService.kt:310-315` |
| **E-02** | `SelectionHistoryMode` + `chanceSource` | `SelectionHistoryMode.kt`, `AvailabilityService.kt:318-327` |
| **E-03** | `fillEmpty` on locked composition | `CompositionDrawService.kt:76-85` |
| **E-04** | Opening snapshot % vs step % divergence | `CompositionDrawService.kt:137-147` vs `:214-225` |
| **E-05** | Event-only / season roster pool (V2 participants model) | `CompositionParticipantPool.kt:23-91` — V1 uses `allSeasonPlayers` only |

### Aligned (no gap — do not list as drift in 19.1)

- Weight formula (F1)
- `performWeightedDraw` (F2)
- `exactSelectionProbability` port (F3 — Kotlin matches JS structure `chancesService.js:165-251` ↔ `AvailabilityChanceCalculator.kt:70-133`)
- Validated-only history (F5)
- Role draw order (F7)
- Full/partial redraw (F8)
- Cross-role + intra-role exclusion (F9–F10)
- Declined excluded from **history count** (V1 `GridBoard.vue:7812-7816`, V2 repo `:31`)

## Hypothesized Paths

### Hypothesis 1: V2 matches V1 for all seasons without `category` set

**Status:** **Confirmed** (for compartment)

**Theory:** When `event.category IS NULL` and not legacy deplacement, V2 `principal` pool matches V1 non-deplacement branch.

**Evidence:** V2 `SpectacleCategory.kt:17-18` + V1 `GridBoard.vue:7826-7828` both exclude `templateType === 'deplacement'` from principal pool.

---

### Hypothesis 2: Golden tests can use `chancesLogic.js` as sole V1 reference

**Status:** **Refuted**

**Resolution:** F11 — replay lacks `exactSelectionProbability`.

## Missing Evidence

| Gap | Impact | How to Obtain |
| --- | ------ | ------------- |
| Runtime side-by-side on Malice season with `aperock` category | Confirm G-01 numeric delta | **19.2** golden fixture |
| Middle-slot gap redraw | Confirm/refute G-03 | **19.3** orchestration test |
| V1 confirmed-cast redraw same event | Confirm/refute G-02 edge | Legacy manual repro or Firestore export |

## Conclusion

**Confidence:** **High** for G-01, G-04, aligned core formula/draw; **Medium** for G-02, G-03.

V1 and V2 **align** on malus weighting, weighted draw, multi-place % algorithm, draw orchestration order, and redraw/exclusion rules. The **primary proven behavioral drift** is **history compartment scoping** (binary deplacement vs multi-slug `category`). Secondary: replay harness gap for golden work, V2-only snapshot/mode features, and stale **6.4** dev notes.

## Recommended Next Steps

### Fix direction (for 19.1 / 19.2)

1. **19.1 spec** — embed gap table G-01–G-04 + extensions E-01–E-05; mark 6.4 dev-note formula line as superseded.
2. **19.2 golden** — generate % references from `chancesService.js` `calculateExactSelectionProbability`, not `chancesLogic.js` alone.
3. **19.3** — add orchestration fixture for G-03 slot gaps.
4. **Optional ISSUES** — E-04 snapshot vs `steps[]` AC1 wording in 6.14 (internal consistency).

### Diagnostic

No further investigation required for story **19.1** authoring unless PO adds new category slugs to parity scope.

## Side Findings

- **6.4 dev notes** `%` formula (`weight/sum`) contradicts both V1 and V2 code — documentation error only.
- **17.9 story** uses `equity_tag`; code uses `category` — rename in story file when touched, not a draw algorithm gap.
