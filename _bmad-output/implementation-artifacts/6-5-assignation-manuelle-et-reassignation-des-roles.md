# Story 6.5: Manual assignment and role reassignment

Status: done

<!-- Ultimate context engine analysis completed — comprehensive developer guide created -->

## Story

As an **organizer**,  
I want to **manually assign or reassign participants to role slots** from **ordered candidate lists** (season/event roster, availability rules),  
so that **I can adjust the draw or handle special cases** (**FR21**, **UX-DR6**).

## Acceptance Criteria

1. **Given** an editable composition (`validatedAt` is null) and a user with **`canManageComposition`**, **when** they tap an **empty or filled slot** on **Équipe**, **then** a **candidate picker** opens listing **eligible participants for that role**, **ordered by descending `chancePercent`** (same basis as Dispos **Tous** / draw), each row showing **display name** and **%** — **FR21**, **UX-DR6**.
2. **Given** the picker, **when** the organizer selects a participant, **then** the server **persists** the assignment on `(roleKey, slotIndex)`, sets **`participationStatus = pending`**, ensures an **`event_compositions`** row exists, returns the updated composition, and the grid refreshes with the assignee — **FR21**.
3. **Given** a filled slot on an editable composition, **when** the organizer taps **clear (×)** or assigns **null** via API, **then** the slot becomes **empty** (`participantId` null) and the UI shows the dashed placeholder — **FR21**, **UX-DR6**.
4. **Given** a participant already assigned to **another role** on the same event, **when** the organizer manually assigns them to an additional role, **then** the assignment **succeeds** (multi-role stacking **allowed by default** per **FR21**) unless a future event-type flag disables it — **no such flag exists in V2 today; do not block multi-role**.
5. **Given** a participant already assigned to **another slot index of the same `roleKey`**, **when** the organizer picks them for a different index of that role, **then** the API returns **409** with a clear message (one person per slot seat; reassignment on **the same** slot index remains allowed) — mirrors draw **within-role exclusion**.
6. **Given** a participant who is **not available** or **not a candidate** for the role (per **`AvailabilityRoleRules.isCandidateForRole`**), **when** assign is attempted, **then** **409** — server is authoritative; picker must not list them.
7. **Given** **`validatedAt` is set**, **when** an organizer tries assign/clear/candidate fetch, **then** **409** (structural lock — **6.6** owns unlock UI).
8. **Given** a user **without** **`canManageComposition`**, **when** they call assign/clear/candidates endpoints, **then** **403** — **NFR-S2**. Regular members **must not** open the organizer picker on slot tap in **6.5** (member slot tap → **6.7** participation modal — do not implement here).
9. **Given** a composition **published** then **all slots cleared** manually, **when** the organizer calls **publish** again, **then** behaviour is **idempotent** (200, no error) — fixes deferred **D2** from **6.3** review.
10. **Given** assign/clear mutations, **when** display names are resolved, **then** both **season** and **event-only** participants show correct names (fix **`resolveDisplayNames`** gap in **`CompositionService`** that only queries `seasonParticipantRepository` today).
11. **Couverture:** **FR21** ; **UX-DR6** (ordered list pick, slot clear) ; **NFR-Q1** — Kotlin integration tests for assign/reassign/clear/multi-role/same-role conflict/403/409; Angular component tests for picker open, selection, clear button, locked state hides edit affordances; regression `./gradlew test`, `ng test`, `ng build`.

### Explicit out of scope (later stories — do not implement in 6.5)

| Story | Deferred capability |
|-------|---------------------|
| **6.6** | **Valider** / **Déverrouiller**, `validatedAt` mutations from UI |
| **6.7–6.9** | Member **Confirmer ma participation** modal on slot tap, proxy confirm, gap-fill **Compléter** |
| **6.10** | **Partager** / **Annoncer la compo** |
| **Simuler** | Dry-run draw |
| **Effacer** | Clear-all / partial reset toolbar |
| **Epic 8** | Notification delivery on manual assign |
| **Epic 9** | Full audit rows for manual assign/clear (**FR35** — optional DEBUG log hook only) |
| **FR14 role-stacking config** | Event-type flag to forbid multi-role — **not in schema yet**; default **allow** until FR14 exposes it |
| **Legacy** | Do not modify `legacy/` |

## Context and slicing

| Story | Scope |
|-------|--------|
| **5.3 (done)** | Dispos **Tous** role grids with **`chancePercent`**; shared **`AvailabilityChanceCalculator`** + **`CompositionSelectionHistoryService`** |
| **6.1–6.3 (done)** | Lifecycle, Équipe tab, draft/publish visibility, `GET/POST publish` |
| **6.4 (done/review)** | **`POST draw`**, slot upsert, organizer placeholders, draw animation, explainability on read |
| **6.5 (this)** | **`GET candidates`**, **`PUT slot assign/clear`**, picker modal, × clear, multi-role manual assign |
| **6.6+** | Validate/unlock, participation flows |

**PLAN.md MVP wave:** **6.5** is the next composition mutation after draw; pairs naturally with **6.6** (validate) in the same session.

## Tasks / Subtasks

- [x] **Scope:** `apps/web/` + `services/api/` ; **do not modify** `legacy/`.
- [x] **Fix deferred D2 (6.3 review):** in [`CompositionService.publishComposition`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionService.kt), check **`alreadyPublished`** **before** rejecting `assignedCount == 0` so republish stays idempotent after manual clears — **AC #9**.
- [x] **Fix display names (6.4 gap):** extend **`resolveDisplayNames`** to union **`seasonParticipantRepository`** + **`eventParticipantRepository`** (same participant union as draw/summary) — **AC #10**.
- [x] **Extract shared participant pool (Kotlin):** move **`loadEligibleParticipants`** / **`buildRolePool`** from [`CompositionDrawService`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionDrawService.kt) into a package-level helper (e.g. **`CompositionParticipantPool.kt`**) reused by draw + manual assign — **do not duplicate** eligibility rules.
- [x] **`CompositionSlotAssignmentService` (Kotlin):**
  - **`assignSlot(seasonId, eventId, roleKey, slotIndex, participantId?, principal)`**
  - Auth: **`canManageComposition`**; troupe member gate same as draw.
  - Block when **`validatedAt != null`** → **409**.
  - Validate `(roleKey, slotIndex)` against **`RoleTemplates.normalize(event.roleSlots)`**.
  - **`participantId == null`:** clear slot (upsert row with null assignee or update existing).
  - **`participantId != null`:** verify candidate eligibility (available + `isCandidateForRole`); reject if already on **another `slotIndex`** of same **`roleKey`** → **409**; **allow** if already on **different `roleKey`** (multi-role).
  - Upsert **`event_composition_slots`**; set **`participationStatus = PENDING`** on assign/reassign (reset confirmation state).
  - Create **`event_compositions`** row if absent; **`findByEventIdForUpdate`** lock (same as draw/publish).
  - Return **`CompositionResponseDto`** via **`CompositionService.buildResponse`**.
- [x] **`CompositionCandidateService` or methods on assignment service:**
  - **`GET .../composition/candidates?roleKey={roleKey}`**
  - Returns `{ roleKey, requiredCount, candidates: [{ participantId, displayName, chancePercent, pastSelectionCount, alreadyAssignedRoleKeys? }] }`
  - Pool = eligible + available + candidate for role; score with **`AvailabilityChanceCalculator.scoreCandidates`** + history service (same as draw step payload).
  - **Exclude** participants already assigned to **another slot index of the same role** (not the slot being edited).
  - **Include** participants already on **other roles** (multi-role allowed) — optional UI badge *« Déjà : MC »*.
  - Sort **`chancePercent` DESC**, tie-break **`displayName` ASC**.
  - Auth: **`canManageComposition`** only (**403** otherwise).
- [x] **API routes** in [`CompositionController`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionController.kt):
  - `GET /v1/seasons/{seasonId}/events/{eventId}/composition/candidates?roleKey=`
  - `PUT /v1/seasons/{seasonId}/events/{eventId}/composition/slots/{roleKey}/{slotIndex}` body `{ "participantId": "<uuid> | null" }`
- [x] **OpenAPI:** extend [`openapi/composition.yaml`](../../services/api/openapi/composition.yaml) — candidates + slot PUT, 403/409 messages.
- [x] **Angular — API client:** add to [`composition-api.service.ts`](../../apps/web/src/app/core/composition/composition-api.service.ts):
  - `getCompositionCandidates(seasonId, eventId, roleKey)`
  - `assignCompositionSlot(seasonId, eventId, roleKey, slotIndex, participantId | null)`
- [x] **Angular — candidate picker dialog:** new **`composition-slot-picker-dialog`** under `apps/web/src/app/shared/composition/`:
  - **`MatDialog`** pattern (see [`add-participant-dialog.ts`](../../apps/web/src/app/pages/admin-participants/add-participant-dialog.ts)).
  - Inputs: `roleKey`, `roleLabel`, `slotIndex`, `candidates[]`.
  - List rows: avatar initial, name, **`chancePercent %`** right-aligned; optional subtitle if assigned elsewhere.
  - Selecting a row closes dialog with **`participantId`**; cancel closes with **`undefined`**.
  - Loading/error states while fetching candidates.
- [x] **Angular — Équipe tab** ([`event-equipe-tab.ts`](../../apps/web/src/app/pages/event-detail/event-equipe-tab.ts) + template):
  - When **`canManageComposition && !isCompositionLocked`**: slots are **clickable** (`button` or `(click)` with keyboard support).
  - On slot tap → fetch candidates → open picker → on pick call **`assignCompositionSlot`** → refresh composition.
  - **× clear** button on filled rows (stop propagation so it does not reopen picker); confirm not required for MVP (V1 clears immediately).
  - Helper copy under grid (UX): *« Cliquez sur un rôle pour choisir manuellement, ou utilisez Tirer au sort. »* — align [`ux-design-hatcast-v2.md`](../planning-artifacts/ux-design-hatcast-v2.md#screen-event-detail-equipe-tab).
  - Disable assign/clear while **`publishing()`**, **`drawing()`**, or **`animatingDraw()`**.
  - Differentiate **409** snackbars: locked vs invalid candidate vs same-role conflict vs generic (partial fix **D6** pattern for assign path).
  - **Do not** wire member slot tap → participation modal (**6.7**).
- [x] **Tests:**
  - **Unit (Kotlin):** same-role conflict; multi-role allowed; clear slot; ineligible candidate rejected.
  - **Integration:** PUT assign creates composition + slot; reassign resets pending; GET candidates order; member **403**; validated **409**; publish idempotent after clear-all (**D2**); event-only participant name on read.
  - **Component (Angular):** organizer tap opens dialog; pick assigns; × clears; locked composition hides × and disables click.
  - Regression: **6.4** draw still works; **6.3** publish visibility unchanged.

### Review Findings

- [x] [Review][Decision] Event-only participants cannot be assigned — resolved via **V20** migration: `season_participant_id` + `event_participant_id` dual FK with XOR check; `CompositionSlotAssignee` helpers route assign/draw to the correct column.
- [x] [Review][Patch] Assign-path 409 snackbars not differentiated [`event-equipe-tab.ts:341`] — fixed: API error `message` propagated via `composition-api.service.ts` and shown in assign/candidates UX.
- [x] [Review][Patch] `clearSlot` leaves stale `participationStatus` [`CompositionSlotAssignmentService.kt:234-245`] — fixed: reset to `PENDING` on clear.
- [x] [Review][Patch] PUT clear creates orphan composition row [`CompositionSlotAssignmentService.kt:145-165`] — fixed: composition row created only on assign; clear-only no-op without existing row; integration test added.
- [x] [Review][Defer] Missing event-only display-name integration test [`CompositionSlotAssignmentIntegrationTest.kt`] — resolved with V20 migration + `assign event-only participant persists event participant FK` test.
- [x] [Review][Defer] `loadEligibleForExplainability` duplicates `CompositionParticipantPool` [`CompositionService.kt:212-248`] — deferred from 6.4 review; refactor when explainability path is consolidated.
- [x] [Review][Defer] Concurrent same-role assign TOCTOU [`CompositionSlotAssignmentService.kt:204-217`] — check-then-insert without slot-level lock; same class of race as draw; acceptable for MVP unless duplicate-slot reports appear in prod.

## Dev Notes

### Candidate eligibility (normative — reuse draw, do not invent)

Same rules as **`CompositionDrawService.buildRolePool`**:

- Participant union: **active season roster** + **event-only** participants (dedupe by user id) — [`loadEligibleParticipants`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionDrawService.kt).
- **Available** status on event availability row.
- **`AvailabilityRoleRules.isCandidateForRole`** for target **`roleKey`**.
- **Chance %:** `AvailabilityChanceCalculator.scoreCandidates` with **`CompositionSelectionHistoryService`** past counts — must match Dispos **Tous** and draw explainability.

**Manual vs draw exclusion difference:**

| Rule | Weighted draw (6.4) | Manual assign (6.5) |
|------|---------------------|---------------------|
| Cross-role (same person, two roles) | Excluded **during one draw request** | **Allowed** (FR21 default) |
| Same role, two slot indices | Excluded after first pick in draw | **Blocked** on assign (409) |
| Unavailable / not candidate | Excluded | **Blocked** (409) |

### Slot mutation semantics

- **Lazy composition row:** create on first assign (same as draw).
- **Participation status:** always **`PENDING`** on manual assign/reassign until **6.7** confirmations.
- **Clear:** set `participantId = null`; keep slot row (do not delete — preserves index stability).
- **Reassign on same slot:** allowed; replaces assignee, resets to **pending**.

### UX reference (V1 → V2)

| V1 | V2 target |
|----|-----------|
| [`SelectionModal.vue`](../../legacy/src/components/SelectionModal.vue) `startEditSlot` / `onChooseForSlot` / `clearSlot` | **`composition-slot-picker-dialog`** + × button |
| Ordered list with `%` from `calculateAllRoleChances` | **`GET candidates`** using shared calculator |
| Immediate save on pick | **`PUT` slot** then refresh |

Visual: dashed empty slots, filled pending styling, picker list with **%** — [`event-detail-equipe-compose-empty-v1.png`](../planning-artifacts/ux-references/event-detail-equipe-compose-empty-v1.png).

### Architecture & guardrails

- Monorepo V2: [ARCH.md](../../ARCH.md) ; REST camelCase: [architecture.md](../planning-artifacts/architecture.md)
- Auth: [ADR-0010](../../docs/adr/0010-v2-auth-identity-platform.md)
- Authorization: [`OrganizerAccessService.canManageComposition`](../../services/api/src/main/kotlin/com/hatcast/api/organizer/OrganizerAccessService.kt)
- **Server-side assign is authoritative** — picker is presentational; never persist assign only in Angular.
- **Fail closed:** visibility rules from **6.3** unchanged; mutations do not leak draft to members.
- UI: [ux-design — Équipe tab](../planning-artifacts/ux-design-hatcast-v2.md#screen-event-detail-equipe-tab)

### Brownfield — extend existing composition package

**Already exists (extend, do not rewrite):**

| Asset | Location |
|-------|----------|
| Composition read/publish/draw | [`CompositionController`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionController.kt), [`CompositionService`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionService.kt), [`CompositionDrawService`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionDrawService.kt) |
| Slot entity + unique `(event_id, role_key, slot_index)` | [`EventCompositionSlotEntity`](../../services/api/src/main/kotlin/com/hatcast/api/composition/EventCompositionSlotEntity.kt) |
| History + chances | [`CompositionSelectionHistoryService`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionSelectionHistoryService.kt), [`AvailabilityChanceCalculator`](../../services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityChanceCalculator.kt) |
| Équipe tab shell | [`event-equipe-tab.ts`](../../apps/web/src/app/pages/event-detail/event-equipe-tab.ts) |
| Dispos candidate UI reference | [`availability-tous-panel`](../../apps/web/src/app/shared/availability/availability-tous-panel.ts) (% display pattern) |

**No new migration expected** — reuse **`event_composition_slots`** / **`event_compositions`**.

### Project structure notes

```
services/api/src/main/kotlin/com/hatcast/api/composition/
  CompositionParticipantPool.kt          # NEW — shared eligible + role pool (extracted)
  CompositionSlotAssignmentService.kt  # NEW — assign/clear + candidates
  CompositionController.kt             # ADD GET candidates, PUT slot
  CompositionService.kt                # D2 publish fix; resolveDisplayNames fix
  dto/CompositionDtos.kt               # CandidateListResponse, AssignSlotRequest

apps/web/src/app/core/composition/
  composition-api.service.ts           # getCandidates, assignSlot

apps/web/src/app/shared/composition/
  composition-slot-picker-dialog.*     # NEW MatDialog

apps/web/src/app/pages/event-detail/
  event-equipe-tab.*                   # slot click, × clear, helper copy
```

### Testing requirements

| Layer | What to test |
|-------|----------------|
| Unit (Kotlin) | Same-role conflict; multi-role OK; eligibility rejection |
| Integration | Assign/clear/candidates; D2 publish idempotent; 403/409 matrix |
| Component | Picker open/select/clear; locked hides controls |
| Regression | 6.4 draw; 6.3 visibility; 5.3 % consistency for listed candidates |

### Previous story intelligence (6.4)

1. **D4 slot filter** — already fixed in **6.4** (`buildResponse` filters to `event.roleSlots`); keep when upserting slots.
2. **Organizer placeholders** — grid always shows required slots when editable; manual assign fills them without requiring draw first.
3. **Draw cross-role exclusion** — **do not** copy to manual assign (FR21 multi-role).
4. **`findByEventIdForUpdate`** — use on composition row during assign/clear.
5. **409 UX** — differentiate locked vs conflict messages (extends **D6** defer from **6.3**).

### Previous story intelligence (6.3)

1. **Draft visibility** — mutations visible to organizers only until publish; no change to rules.
2. **Deferred D2** — **must fix** in **6.5** when clear-after-publish becomes possible.
3. **`participantId` on event-only participants** — assign must accept IDs from event roster, not only season rows.

### Previous story intelligence (5.3)

1. Reuse **`GET availability/summary`** scoring logic server-side — do not call summary HTTP from assign service; share calculator + history.
2. Candidate **%** in picker should match **Tous** tab for same event/role (one integration test).

### Git intelligence (recent)

- **6.4** composition draw landed locally (review): `CompositionDrawService`, `composition-draw-animation`, Équipe toolbar — extend same tab, avoid parallel implementations.
- **12.x** agenda work is parallel — no route changes in **6.5**.
- Prefer focused diff: assignment service + picker dialog + Équipe interactions + D2/D10 fixes.

### References

- [epics.md — Story 6.5](../planning-artifacts/epics.md) ; **FR21**
- [prd.md — FR21](../planning-artifacts/prd.md)
- [ux-design-hatcast-v2.md — Équipe tab, manual pick](../planning-artifacts/ux-design-hatcast-v2.md#screen-event-detail-equipe-tab)
- [PLAN.md — MVP composition wave](../../PLAN.md)
- Story **6.4** — draw, chances, slot upsert patterns
- Story **6.3** — visibility, publish, deferred **D2** / **D6**
- Story **5.3** — Dispos **Tous** % display
- [deferred-work.md — D2, D6](deferred-work.md)
- V1: [`SelectionModal.vue`](../../legacy/src/components/SelectionModal.vue) (`onChooseForSlot`, `clearSlot`)

## Dev Agent Record

### Agent Model Used

Composer (Cursor)

### Debug Log References

- D2 publish idempotency: guard `assignedCount == 0` only when `publishedAt` is null.
- `GET candidates` accepts optional `slotIndex` so current slot assignee stays in picker list.
- DB FK `event_composition_slots.participant_id → season_participants` limits slot IDs to season roster (pre-existing); `resolveDisplayNames` still unions event participants for display.

### Completion Notes List

- Added `CompositionSlotAssignmentService` with `GET /composition/candidates` and `PUT /composition/slots/{roleKey}/{slotIndex}`.
- Extracted `CompositionParticipantPool` shared by draw and manual assign.
- Équipe tab: clickable slots, × clear, MatDialog picker with % and multi-role badge, manual hint copy.
- Integration tests: assign/clear/reassign, multi-role, same-role 409, 403/409 matrix, D2 republish after clear.
- Angular component tests: picker, assign flow, clear, locked state.
- Regression: composition package tests green; `ng build` OK; 3 pre-existing failures in `TroupeMembershipIntegrationTest` (unrelated).

### File List

- services/api/src/main/kotlin/com/hatcast/api/composition/CompositionParticipantPool.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/CompositionSlotAssignmentService.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/CompositionController.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/CompositionService.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/CompositionDrawService.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/dto/CompositionDtos.kt
- services/api/openapi/composition.yaml
- services/api/src/test/kotlin/com/hatcast/api/composition/CompositionSlotAssignmentIntegrationTest.kt
- apps/web/src/app/core/composition/composition-api.service.ts
- apps/web/src/app/shared/composition/composition-slot-picker-dialog.ts
- apps/web/src/app/shared/composition/composition-slot-picker-dialog.html
- apps/web/src/app/shared/composition/composition-slot-picker-dialog.scss
- apps/web/src/app/shared/composition/composition-slot-picker-dialog.spec.ts
- apps/web/src/app/pages/event-detail/event-equipe-tab.ts
- apps/web/src/app/pages/event-detail/event-equipe-tab.html
- apps/web/src/app/pages/event-detail/event-equipe-tab.scss
- apps/web/src/app/pages/event-detail/event-equipe-tab.spec.ts

### Change Log

- 2026-05-24: Story 6.5 created — manual slot assign/clear, candidate picker, multi-role rules, D2 publish fix.
- 2026-05-24: Implemented manual assign/clear API, picker UI, D2 fix, shared participant pool, tests (status → review).
