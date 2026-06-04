# Story 6.4: Weighted random draw and odds explainability

Status: done

> **Historical implementation notes; normative contract → [ADR 0019](../../docs/adr/0019-draw-weight-engine.md) + [draw-weight-engine-v1-spec.md](../../docs/v2/technical/draw-weight-engine-v1-spec.md) (story 19.1).**

<!-- Ultimate context engine analysis completed — comprehensive developer guide created -->

## Story

As an **organizer**,  
I want to **run a weighted draw to fill roles among eligible participants** and **see explainability odds when the product surfaces them**,  
so that **I reduce manual work while keeping the process transparent** (**FR20**, **FR24**, **UX-DR6**).

## Acceptance Criteria

1. **Given** an event with required `roleSlots`, availability data, and draw eligibility rules, **when** an organizer with **`canManageComposition`** clicks **« Tirer au sort »**, **then** the server runs the **V1-weighted lottery** per role/slot, **persists** slot rows with **`participant_id`** identities, ensures an **`event_compositions`** row exists (draft, `validatedAt` null), and returns the updated composition — **FR20**.
2. **Given** a successful draw, **when** the organizer views **Équipe**, **then** filled slots appear in **pending** styling; empty slots remain dashed placeholders when no eligible candidate exists for that role — **UX-DR6**.
3. **Given** the draw executes, **when** the UI plays the lottery step, **then** each step shows a **proportional segment bar** (widths = relative weights) and a **cursor** stopping on the selected segment; a **« Sélection en cours »** banner explains the draw is a **proposal** — **UX-DR6**. **`prefers-reduced-motion`:** skip animation and apply results immediately.
4. **Given** a draw on a draft with existing assignees, **when** the organizer runs **Tirer au sort** again, **then** behaviour matches V1 **`drawMultiRoles`**: **fully filled roles are redrawn**; **partially filled roles keep existing assignees** and only **empty indices** are filled; participants already assigned in the current draw pass are **excluded** from later role pools — **FR20**.
5. **Given** a composition **`validatedAt` is set**, **when** an organizer calls draw, **then** the API returns **409** (composition locked) — structural edits belong to **6.6** unlock flow.
6. **Given** **`publishedAt` is set OR `validatedAt` is set`**, **when** an authorized viewer opens **Équipe** (or composition read API), **then** each filled slot exposes **explainability** data: **`chancePercent`** (and optionally **`pastSelectionCount`**) computed with the **same algorithm** as Dispos **Tous** — **FR24**. **Before publish**, members **must not** see odds on assignees (draft hidden per **6.3**); organizers may see odds during/after draw on their draft view.
7. **Given** no eligible candidates for a required slot, **when** draw completes, **then** that slot stays empty (no error aborting the whole draw); organizer sees unfilled slot — **FR20**.
8. **Given** past compositions exist in the season, **when** chances are computed, **then** **`pastSelectionCount`** counts **validated** assignments (`event_compositions.validated_at IS NOT NULL`) for the same **`role_key`** and **`participant_id`**, **excluding the current event**, **excluding archived events**, **excluding declined assignees** — replaces the **5.3 stub (`0`)** in both draw weighting and explainability display — **FR19/FR24**.
9. **Given** a user without **`canManageComposition`**, **when** they call draw, **then** **403** — **NFR-S2**.
10. **Given** a user without troupe membership, **when** they call draw or read explainability fields they should not see, **then** **403** / fail-closed slot payload per **6.3** — **NFR-S2**.
11. **Couverture:** **FR20**, **FR24** ; **UX-DR6** (draw animation slice) ; **NFR-Q1** — Kotlin unit tests for weighting + draw selection; integration tests for draw persistence, cross-role exclusion, 403/409, past-count wiring; Angular component tests for toolbar visibility, animation vs reduced-motion, odds visibility matrix ; regression `./gradlew test`, `ng test`, `ng build`.

### Explicit out of scope (later stories — do not implement in 6.4)

| Story | Deferred capability |
|-------|---------------------|
| **6.5** | Manual slot assign/clear/reassign, candidate picker modal on slot tap |
| **6.6** | **Valider** / **Déverrouiller**, `validatedAt` mutations from UI |
| **6.7–6.9** | Participation confirm/decline modal, partial gap draw UX polish |
| **6.10** | **Partager** / **Annoncer la compo** (Share & announce — not **Publier**) |
| **Simuler** | Dry-run / algorithm picker (V1 **Simuler** dropdown) — defer until product asks; **6.4** ships **real draw only** |
| **Effacer** | Clear-all / partial reset toolbar |
| **Epic 8** | Notification delivery for draw outcomes |
| **Epic 9** | Full audit rows for lottery assignments (**FR35** names the action; log hook optional stub only) |
| **Legacy** | Do not modify `legacy/` |

## Context and slicing

| Story | Scope |
|-------|--------|
| **5.3 (done)** | Dispos **Tous** role grids with **`chancePercent`**; `AvailabilityChanceCalculator` with **`pastSelectionCount = 0` stub** |
| **6.1–6.3 (done)** | Lifecycle, event detail **Équipe** tab, draft/publish visibility, `GET/POST publish` composition API |
| **6.4 (this)** | **`POST draw`**, server-side weighted selection, slot upsert, draw animation UI, explainability fields on composition slots, real **`pastSelectionCount`** |
| **6.5+** | Manual edits, validate/unlock, participation flows |

**PLAN.md note:** MVP wave lists **6.5** before **6.4** for session ordering; **6.4** can land independently because **6.3** already exposes the **Équipe** shell — draw does not require manual assign (**6.5**).

## Tasks / Subtasks

- [x] **Scope:** `apps/web/` + `services/api/` ; **do not modify** `legacy/`.
- [x] **Fix deferred D4 (6.3 review):** filter composition **`slots`** in [`CompositionService.buildResponse`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionService.kt) to **only** `(roleKey, slotIndex)` pairs present in **`event.roleSlots`** — prevents orphan rows from confusing draw/grid after **6.4** mutations.
- [x] **Past selection history — `CompositionSelectionHistoryService` (Kotlin):**
  - Query validated composition slots in the **same season** (`events.season_id`), join `event_compositions` + `event_composition_slots`.
  - Count per **`(participantId, roleKey)`**; exclude **`eventId = current`**; exclude **`events.archived = true`**; exclude slots with **`participation_status = DECLINED`**.
  - Unit-test count rules against seeded fixtures.
- [x] **Shared chance math — extend [`AvailabilityChanceCalculator`](../../services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityChanceCalculator.kt):**
  - Remove TODO stub: accept **`pastSelectionCountByParticipant`** from history service (already supported in signature).
  - Extract **`performWeightedDraw(candidates, roleKey)`** returning **`selectedId`, `randomValue`, `totalWeight`** — port [`scripts/replay/chancesLogic.js`](../../scripts/replay/chancesLogic.js) / V1 [`performWeightedDraw`](../../legacy/src/services/chancesService.js) (deterministic test seam: inject `Random` or lambda).
  - Reuse in **`AvailabilityService.getSummary`** so Dispos **Tous %** match draw/explainability (**single source of truth**).
- [x] **Draw orchestration — `CompositionDrawService` (Kotlin):**
  - Candidate pool per role: reuse [`AvailabilityRoleRules.isCandidateForRole`](../../services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityRoleRules.kt) + same participant union as availability summary (**season + event roster**, active participants).
  - Exclude: not **available**, wrong **roleKeys**, already assigned **in this draw pass** (cross-role), **`participant_id` already on another slot** when filling partial role (keep existing assignees).
  - Iterate roles in **`RoleTemplates` / `ROLE_DISPLAY_ORDER` order** (match [`event-types.ts`](../../apps/web/src/app/core/events/event-types.ts) — player before dj/mc/…).
  - For each empty slot index up to `roleSlots[roleKey]`: weighted draw without replacement **within the role pool** for that slot iteration.
  - Upsert **`event_composition_slots`** (`participant_id`, `participation_status = PENDING`); create **`event_compositions`** row if absent; touch **`updated_at`**.
  - Block when **`validatedAt != null`** → **409**.
- [x] **API — draw** `POST /v1/seasons/{seasonId}/events/{eventId}/composition/draw`:
  - Auth: **`canManageComposition`**; troupe member gate same as existing composition endpoints.
  - Response DTO extends composition read:
    - `composition`: same shape as **`CompositionResponse`**
    - `steps[]`: `{ roleKey, slotIndex, candidates[{ participantId, displayName, chancePercent, weight }], selectedParticipantId, randomValue, totalWeight }` for client animation
  - Optional request body `{ "mode": "fillEmpty" }` — **default `full`** mirrors V1 **`drawMultiRoles`**; document in OpenAPI; **`fillEmpty`** only fills null slots (prep for **6.9**, implement if trivial).
- [x] **API — explainability on read:** extend **`CompositionSlotDto`** with optional **`chancePercent`** / **`pastSelectionCount`** when viewer may see explainability (**`publishedAt != null OR validatedAt != null OR canManageComposition`** for organizer draft preview).
- [x] **OpenAPI:** extend [`openapi/composition.yaml`](../../services/api/openapi/composition.yaml) — draw endpoint, new slot fields, 403/409.
- [x] **Angular — API client:** add **`drawComposition(seasonId, eventId)`** to [`composition-api.service.ts`](../../apps/web/src/app/core/composition/composition-api.service.ts); types for **`DrawResponse`** / steps.
- [x] **Angular — Équipe tab organizer UX** ([`event-equipe-tab`](../../apps/web/src/app/pages/event-detail/event-equipe-tab.ts)):
  - When **`canManageComposition`** and **not validated**: show **dashed empty slots** derived from **`event.roleSlots`** even if **`composition.slots` is empty** (replace bare [`event-equipe-empty`](../../apps/web/src/app/pages/event-detail/event-equipe-empty.ts) for organizers).
  - Toolbar: **« Tirer au sort »** (gradient pink/purple per UX) + helper copy from [`ux-design-hatcast-v2.md`](../planning-artifacts/ux-design-hatcast-v2.md#screen-event-detail-equipe-tab); **no Simuler / Valider / Effacer / Partager**.
  - On draw: call API → play **`composition-draw-animation`** component step-by-step from `steps[]`; then refresh grid.
  - Show **`chancePercent`** badge on filled slots when explainability allowed (organizer draft OK; member only after publish — mirror API).
  - **`prefers-reduced-motion`:** apply final composition without animation component.
  - Disable draw while **`publishing()`** or animation in progress; handle 409 locked / 403 errors with snackbar (differentiate messages — fix **D6** pattern from **6.3** where easy).
- [x] **Angular — draw animation component:** new **`composition-draw-animation`** under `apps/web/src/app/shared/composition/` — horizontal segmented bar, moving cursor, candidate names in segments; reference [`event-detail-equipe-draw-animation-v1.png`](../planning-artifacts/ux-references/event-detail-equipe-draw-animation-v1.png) and V1 [`SelectionModal.vue`](../../legacy/src/components/SelectionModal.vue) canvas behaviour (port intent, not Vue code).
- [x] **Tests:**
  - **Unit (Kotlin):** weighted draw distribution edge cases (0 candidates, 0 total weight, single candidate); history count exclusions; draw excludes cross-role assignees.
  - **Integration:** POST draw creates composition + slots; member GET before publish → no slot names; organizer GET → slots with odds fields; after publish member sees odds; draw on validated → 409; outsider → 403.
  - **Unit (TS):** animation component renders segments from step payload; reduced-motion path skips animation.
  - **Component:** organizer sees **Tirer au sort** on empty grid; draw populates slots; member without publish sees empty state.
  - Regression: **6.1** lifecycle, **6.3** publish visibility, **5.3** summary chances updated when history non-zero (one integration test).

### Review Findings

- [x] [Review][Patch] Full redraw leaves stale assignees on unfilled slots — [CompositionDrawService.kt:108-186] Fixed: clear role slots before full redraw fill loop.
- [x] [Review][Patch] `resolveDisplayNames` ignores event-only participants — [CompositionService.kt:251-257] Fixed: resolve event-scoped participants when season lookup misses.
- [x] [Review][Patch] Missing AC11 integration coverage — [CompositionDrawIntegrationTest.kt] Fixed: integration tests for full redraw clear, partial fill, cross-role exclusion, history-weighted summary.
- [x] [Review][Defer] Duplicate eligible-participant loading in `CompositionDrawService` and `CompositionService` — deferred, refactor when a shared helper is warranted.
- [x] [Review][Defer] `prefers-reduced-motion` read once at component init — deferred, edge case if user toggles OS setting without reload.

## Dev Notes

### Draw algorithm (normative — port V1, do not invent)

**Weight per candidate (same as 5.3 / V1):**

```
malus = 1 / (1 + pastSelectionCount)
weight = malus * requiredCountForRole
practicalChancePercent = round((weight / sumWeights) * 100)
```

**Selection:** `random in [0, totalWeight)` walk cumulative weights — [`scripts/replay/chancesLogic.js`](../../scripts/replay/chancesLogic.js).

**Per-role slot filling:** loop `slotIndex in 0..requiredCount-1`; each iteration draws one winner and **removes** them from the **role candidate pool** (no replacement within same role).

**Cross-role exclusion during one draw request:** after assigning participant P to any slot, P is excluded from subsequent role pools in the same request (V1 [`drawMultiRoles`](../../legacy/src/components/GridBoard.vue) / [`drawForRole`](../../legacy/src/components/GridBoard.vue) `excludedPlayers`).

**Redraw semantics (V1):** if a role already has `assignedCount >= requiredCount`, **replace entire role** on full draw; if partial, **keep** existing `(roleKey, slotIndex)` assignees and fill gaps only.

**Event-type / travel league:** MVP counts **within the same season (league)** only — no `deplacement` template branch (ADR 0012 travel leagues post-MVP). Do **not** reintroduce V1 `templateType` pool splitting in **6.4**.

### Explainability visibility (FR24)

| Viewer | Draft unpublished | Draft published | Validated |
|--------|-------------------|-----------------|-----------|
| Regular member | No slots / no odds | Slots + **odds visible** | Slots + odds |
| Organizer | Slots + odds (draft preview) | Slots + odds | Slots + odds |

Odds on **Dispos → Tous** already public to tab viewers (**FR19**); **FR24** adds the same basis on **Équipe** once draft is published or validated. Keep **`AvailabilityService.getSummary`** and composition slot odds in sync via shared calculator + history service.

### Architecture & guardrails

- Monorepo V2: [ARCH.md](../../ARCH.md) ; REST camelCase: [architecture.md](../planning-artifacts/architecture.md)
- Auth: [ADR-0010](../../docs/adr/0010-v2-auth-identity-platform.md)
- Authorization: [`OrganizerAccessService.canManageComposition`](../../services/api/src/main/kotlin/com/hatcast/api/organizer/OrganizerAccessService.kt)
- **Server-side draw is authoritative** — client animation is presentational only; never pick winners in Angular.
- **Fail closed:** do not leak assignee names or odds to unauthorized viewers (extend **6.3** rules).
- UI mood: [ux-design — Équipe tab](../planning-artifacts/ux-design-hatcast-v2.md#screen-event-detail-equipe-tab) ; animation ref [`event-detail-equipe-draw-animation-v1.png`](../planning-artifacts/ux-references/event-detail-equipe-draw-animation-v1.png)

### Brownfield — extend existing composition package

**Already exists (extend, do not rewrite):**

| Asset | Location |
|-------|----------|
| Composition read/publish | [`CompositionController`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionController.kt), [`CompositionService`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionService.kt) |
| Slot entity + unique `(event_id, role_key, slot_index)` | [`EventCompositionSlotEntity`](../../services/api/src/main/kotlin/com/hatcast/api/composition/EventCompositionSlotEntity.kt), [`V18__event_composition_lifecycle.sql`](../../services/api/src/main/resources/db/migration/V18__event_composition_lifecycle.sql) |
| Visibility rules | [`CompositionVisibilityRules`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionVisibilityRules.kt) |
| Équipe tab shell | [`event-equipe-tab.ts`](../../apps/web/src/app/pages/event-detail/event-equipe-tab.ts) |
| Client chance helpers | [`availability-chances.ts`](../../apps/web/src/app/core/availability/availability-chances.ts) (keep aligned with server) |
| V1 reference implementation | [`chancesService.js`](../../legacy/src/services/chancesService.js), [`GridBoard.vue` drawMultiRoles/drawForRole](legacy/src/components/GridBoard.vue) |

**No new migration expected** unless audit/draw metadata columns are needed — prefer draw **`steps`** in POST response only ( ephemeral).

### Empty vs filled Équipe grid (6.4 behaviour change)

**6.3:** empty state when no visible slot rows.  
**6.4:** organizers always see **required slot placeholders** from `event.roleSlots` when composition is editable (`validatedAt` null), even before first draw — matches UX [`event-detail-equipe-compose-empty-v1.png`](../planning-artifacts/ux-references/event-detail-equipe-compose-empty-v1.png). Members keep **`Aucun tirage pour le moment`** until publish (**6.3**).

### Project structure notes

```
services/api/src/main/kotlin/com/hatcast/api/composition/
  CompositionDrawService.kt           # NEW — orchestration
  CompositionSelectionHistoryService.kt # NEW — pastSelectionCount
  CompositionController.kt            # ADD POST .../draw
  CompositionService.kt               # D4 filter; optional delegate
  dto/CompositionDtos.kt              # DrawResponse, DrawStep, slot odds fields

services/api/src/main/kotlin/com/hatcast/api/availability/
  AvailabilityChanceCalculator.kt     # ADD performWeightedDraw; wire history in getSummary

apps/web/src/app/core/composition/
  composition-api.service.ts          # drawComposition()

apps/web/src/app/shared/composition/
  composition-draw-animation.*        # NEW

apps/web/src/app/pages/event-detail/
  event-equipe-tab.*                  # toolbar, grid placeholders, odds badges
```

### Testing requirements

| Layer | What to test |
|-------|----------------|
| Unit (Kotlin) | History counts; weighted draw; redraw full vs partial role |
| Integration | Draw persists slots; visibility + odds matrix; 403/409 |
| Unit (TS) | `availability-chances` unchanged contract; animation math |
| Component | Tirer au sort visible; reduced motion; odds after publish |
| Regression | 6.3 publish flow; 5.3 summary percentages with non-zero history |

### Previous story intelligence (6.3)

1. **Separate composition endpoint** — draw returns updated **`CompositionResponse`**; refresh event detail for lifecycle badge if needed.
2. **`showEmptyState`** uses **`slotRows().length`** — organizers need rows from **`roleSlots`**, not only API slots (**6.3** review **Patch**).
3. **Deferred D4:** filter API slots to **`event.roleSlots`** — **must fix in 6.4** before draw upserts.
4. **Do not add Publier** logic changes beyond regression — publish stays **6.3**.
5. **Race on concurrent mutations:** use **`findByEventIdForUpdate`** on composition row during draw (same pattern as publish).

### Previous story intelligence (5.3)

1. **`AvailabilityChanceCalculator`** already accepts **`pastSelectionCountByParticipant`** — wire real map from history service.
2. **`isCandidateForRole`** duplicated in TS [`availability-chances.ts`](../../apps/web/src/app/core/availability/availability-chances.ts) — keep in sync with Kotlin rules.
3. Review defer **W2:** rounding to 100% — apply **largest remainder** or document acceptable drift when implementing real counts.

### Previous story intelligence (6.1)

1. Lazy slot creation on first draw is expected (**6.1** dev note).
2. **`participation_status = PENDING`** for new draw assignees until **6.7** confirmations.

### Git intelligence (recent)

- Composition API landed in **6.3** (`CompositionController`, `event-equipe-tab`).
- Agenda work (**12.x**) is parallel — avoid unrelated route changes.
- Prefer focused diff: composition draw package + Équipe tab + history service + calculator extension.

### References

- [epics.md — Story 6.4](../planning-artifacts/epics.md) ; **FR20**, **FR24**
- [prd.md — FR20, FR24](../planning-artifacts/prd.md)
- [ux-design-hatcast-v2.md — Équipe tab, draw animation](../planning-artifacts/ux-design-hatcast-v2.md#screen-event-detail-equipe-tab)
- [PLAN.md — MVP composition wave](../../PLAN.md) (ordering note: 6.5/6.6/6.7 may precede 6.4 in sessions)
- Story **5.3** — chance calculator stub to replace
- Story **6.3** — Équipe tab, publish, visibility
- Story **6.1** — schema + lifecycle
- [DOMAIN.md](../../DOMAIN.md) — draw / cast terminology
- [deferred-work.md — D4](deferred-work.md) — slot filter fix
- V1: [`chancesService.js`](../../legacy/src/services/chancesService.js), [`SelectionModal.vue`](../../legacy/src/components/SelectionModal.vue)

## Dev Agent Record

### Agent Model Used

Composer

### Debug Log References

### Completion Notes List

- Implemented server-authoritative weighted draw (`CompositionDrawService`) with V1 `drawMultiRoles` semantics (full redraw per complete role, partial fill otherwise) and `fillEmpty` mode.
- Wired real `pastSelectionCount` via `CompositionSelectionHistoryService` into draw, composition read explainability, and Dispos summary.
- Added `POST .../composition/draw` with animation `steps[]` payload; extended slot DTOs with `chancePercent` / `pastSelectionCount`.
- Équipe tab: organizer placeholders from `roleSlots`, **Tirer au sort** toolbar, draw animation (skipped when `prefers-reduced-motion`).
- Tests: Kotlin unit + integration (`CompositionDrawIntegrationTest`), Angular component tests; `./gradlew test`, `ng test`, `ng build` pass.

### File List

- services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityChanceCalculator.kt
- services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityService.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/CompositionController.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/CompositionDrawService.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/CompositionSelectionHistoryService.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/CompositionService.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/EventCompositionSlotRepository.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/dto/CompositionDtos.kt
- services/api/openapi/composition.yaml
- services/api/src/test/kotlin/com/hatcast/api/availability/AvailabilityChanceCalculatorDrawTest.kt
- services/api/src/test/kotlin/com/hatcast/api/composition/CompositionDrawIntegrationTest.kt
- services/api/src/test/kotlin/com/hatcast/api/composition/CompositionSelectionHistoryServiceTest.kt
- apps/web/src/app/core/composition/composition-api.service.ts
- apps/web/src/app/shared/composition/composition-draw-animation.ts
- apps/web/src/app/shared/composition/composition-draw-animation.html
- apps/web/src/app/shared/composition/composition-draw-animation.scss
- apps/web/src/app/shared/composition/composition-draw-animation.spec.ts
- apps/web/src/app/pages/event-detail/event-equipe-tab.ts
- apps/web/src/app/pages/event-detail/event-equipe-tab.html
- apps/web/src/app/pages/event-detail/event-equipe-tab.scss
- apps/web/src/app/pages/event-detail/event-equipe-tab.spec.ts
- _bmad-output/implementation-artifacts/sprint-status.yaml

### Change Log

- 2026-05-24: Story 6.4 — weighted composition draw, explainability odds, Équipe UX and animation.
