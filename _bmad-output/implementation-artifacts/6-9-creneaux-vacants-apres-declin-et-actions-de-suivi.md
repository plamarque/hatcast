# Story 6.9: Open slots after decline and follow-up actions

Status: done

<!-- Ultimate context engine analysis completed — comprehensive developer guide created -->

## Story

As an **organizer**,  
I want to **see open slots after a decline or withdrawal and act on them** (manual replacement, partial weighted draw, restore from declined list, targeted confirmation intent),  
so that **I can complete the lineup without unlocking the whole composition** (**FR27**, **FR28**, **UX-DR6**).

## Acceptance Criteria

1. **Given** a **validated** composition (`validatedAt != null`) in **`gapsToFill`** or **`awaitingConfirmations`** with **at least one empty required slot**, **when** an organizer with **`canManageComposition`** opens **Équipe**, **then** empty slots are **visually distinct** (dashed / warning styling), the six-state badge shows **« À compléter »** with the existing hint, and a **« Compléter »** action is available — **FR27**, **UX-DR6** [incomplete validated capture](_bmad-output/planning-artifacts/ux-references/event-detail-equipe-declined-validated-incomplete-v1.png).
2. **Given** validated composition with empty slot(s), **when** the organizer taps an **empty** slot, **then** the **candidate picker** opens (same ordered list + % as **6.5**) and a successful pick **assigns** the participant with **`participationStatus = pending`** — **FR27** manual path; **filled** locked slots still open participation modal only (**6.7**/**6.8**), not the picker.
3. **Given** validated composition with empty slot(s), **when** the organizer clicks **« Compléter »**, **then** the client calls **`POST .../composition/draw`** with **`{ "mode": "fillEmpty" }`**, plays the draw animation (or reduced-motion immediate apply), and only **empty** required indices are filled — **FR27** partial draw; **`mode: "full"`** on validated composition remains **409**.
4. **Given** gap-fill assign or **fillEmpty** draw succeeds, **when** the server persists new assignee(s), **then** it invokes a **targeted confirmation notification intent** for **newly assigned participant id(s) only** (stub on **`CompositionNotificationPort`** acceptable until Epic **8**) — **FR27** / **FR31** slice; **do not** re-broadcast to already-assigned unchanged slots.
5. **Given** one or more **`declines[]`** rows and an **empty slot** for the same **`roleKey`**, **when** the organizer uses **« Remettre en composition »** (↶) on that decline row, **then** the participant is **assigned** to an empty slot for that role with **`participationStatus = pending`**, the matching **decline audit row is removed** so they no longer appear under **« Personnes ayant décliné »**, and lifecycle may move from **`gapsToFill`** toward **`awaitingConfirmations`** when no empty required slots remain — **FR27**, **SPEC** declined list behaviour ([SPEC.md](../../SPEC.md) lines 131–132).
6. **Given** validated composition, **when** the organizer attempts **clear slot**, **full redraw**, or **assign replacing an occupied slot**, **then** **409** (composition locked for structural edits) — regression **6.6**/**6.5**/**6.4**.
7. **Given** a member **without** **`canManageComposition`**, **when** they view **Équipe** with gaps, **then** they see empty slots and status but **no** Compléter / gap picker / restore controls — **NFR-S2**.
8. **Given** gap-fill mutations, **when** event detail is open, **then** composition reload + **`compositionPublished`** emit refresh **Infos** lifecycle and **Équipe** badge — same as **6.7**.
9. **Couverture:** **FR27** ; **UX-DR6** ; **NFR-Q1** — Kotlin integration tests: validated **fillEmpty** draw fills only empties; validated assign to empty slot **200**; validated assign to occupied / clear **409**; validated **full** draw **409**; restore-from-decline removes decline row; targeted notification port called with new assignee ids; lifecycle transition after fill; Angular tests: Compléter visibility, empty-slot picker when locked, restore button gating, regression locked participation taps; `./gradlew test`, `ng test`, `ng build`.

### Explicit out of scope (later stories — do not implement in 6.9)

| Story | Deferred capability |
|-------|---------------------|
| **6.10** | **Partager** / **Annoncer la compo** (Share & announce modal) |
| **Epic 8** | Actual push/email delivery (port stub only) |
| **Epic 9** | Full **FR35** audit UI for gap-fill / restore actions |
| **Simuler** / **Effacer** | Dry-run draw, clear-all toolbar |
| **PIN gate** | V1 PIN before fill — V2 uses **`canManageComposition`** only |
| **Legacy** | Do not modify `legacy/` |

## Context and slicing

| Story | Scope |
|-------|--------|
| **6.4 (done)** | Weighted draw + **`fillEmpty`** mode implemented server-side but **blocked when `validatedAt != null`** |
| **6.5 (done)** | Manual assign + picker; **409** when locked |
| **6.6 (done)** | Validate/unlock; six-state badge includes **« À compléter »** hint mentioning Compléter |
| **6.7–6.8 (done)** | Decline frees slot + **`declines[]`** badge/list; participation on filled locked slots |
| **6.9 (this)** | **Relax lock** for gap-fill only; **Compléter** UI; empty-slot picker; **Remettre en composition**; targeted notification hook |
| **6.10+** | Share/announce |

**PLAN.md MVP wave:** **6.9** closes the composition loop (*« état complete atteignable après déclin + action 6.9 »*) with **6.5–6.8**.

## Tasks / Subtasks

- [x] **Scope:** `apps/web/` + `services/api/` only; **do not modify** `legacy/`.
- [x] **API — gap-fill authorization** in [`CompositionSlotAssignmentService`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionSlotAssignmentService.kt):
  - When **`validatedAt != null`**: allow **`assignSlot`** only if target slot **has no assignee** and body carries **`participantId`**; **409** for clear (`participantId == null`) or replacing occupied slot.
  - New assignee: **`participationStatus = PENDING`**; return **`CompositionResponseDto`**.
  - Collect **newly assigned participant ids** for notification hook (single assign).
- [x] **API — gap-fill draw** in [`CompositionDrawService`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionDrawService.kt):
  - When **`validatedAt != null`**: allow draw **only** if **`mode == fillEmpty`** and at least one empty required slot exists; **409** for **`full`** or when no empties.
  - Keep existing **fillEmpty** iteration logic; return steps + composition.
  - Collect **newly assigned participant ids** across steps for notification hook.
- [x] **API — restore from decline** (new service method or extend assignment service):
  - `POST /v1/seasons/{seasonId}/events/{eventId}/composition/declines/{declineId}/restore` (or equivalent documented path).
  - Auth: **`canManageComposition`**; composition **validated**.
  - Preconditions: decline row exists for event; **empty slot** exists for decline’s **`roleKey`** (any index); assign decline’s participant to that slot; **delete** decline row; **PENDING** participation.
  - **409** if no empty slot for role; **404** if decline unknown.
- [x] **API — notification port** [`CompositionNotificationPort`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionNotificationPort.kt):
  - Add **`requestConfirmationForAssignees(eventId, seasonId, assigneeParticipantIds, actorUserId)`** — **NoOp** DEBUG log implementation.
  - Call after gap assign, **fillEmpty** draw (batch ids), restore — **not** on idempotent no-op fills.
- [x] **OpenAPI** [`composition.yaml`](../../services/api/openapi/composition.yaml): document validated **fillEmpty** draw, gap assign rules, restore endpoint, new port behaviour in descriptions.
- [x] **Integration tests** — extend/create in `services/api/src/test/kotlin/com/hatcast/api/composition/`:
  - `@Tag("FR27")` validated **fillEmpty** fills only empty indices; **full** draw **409**.
  - Validated assign empty **200**; clear occupied **409**.
  - Decline → gap → restore removes decline + assigns slot.
  - `verify(notificationPort).requestConfirmationForAssignees(...)` with expected ids (mock port in test config like **6.6**).
  - Lifecycle **gapsToFill** → **awaitingConfirmations** after all required slots filled.
- [x] **Angular — Équipe tab** ([`event-equipe-tab.ts`](../../apps/web/src/app/pages/event-detail/event-equipe-tab.ts) + `.html` + `.scss`):
  - **`canFillGaps`**: `canManageComposition && isCompositionLocked && hasEmptyRequiredSlot` (derive from `slotRows` + `roleSlots`).
  - **`canTapGapSlot(row)`**: locked + organizer + **no** `participantId` on row.
  - Empty locked slots: **button** → `openSlotPicker(row)` (reuse **6.5** picker); emphasize **`.event-equipe-tab__row--empty`** styling when `canFillGaps`.
  - Toolbar when **`canFillGaps`**: **« Compléter »** → `drawComposition(..., 'fillEmpty')` + animation path (reuse **6.4**).
  - Declines list: **↶ Remettre en composition** per row when `hasEmptySlotForRole(decline.roleKey)`; call restore API; loading/disabled during mutation.
  - Subtitle under declines panel: *« (ne comptent pas dans la composition) »* per UX.
  - Snackbars for **409** locked misuse vs success on fill.
- [x] **Angular — API client** ([`composition-api.service.ts`](../../apps/web/src/app/core/composition/composition-api.service.ts)): `restoreDeclinedParticipant(...)`, ensure `drawComposition` passes mode; types for restore response.
- [x] **Angular — tests** [`event-equipe-tab.spec.ts`](../../apps/web/src/app/pages/event-detail/event-equipe-tab.spec.ts):
  - Organizer + locked + empty slot: Compléter visible; calls draw with **fillEmpty**.
  - Empty slot opens picker; filled slot still opens participation modal (**6.7**/**6.8** regression).
  - Restore button shown only when empty role slot exists; hidden for members.
- [x] **Regression:** participation, validate/unlock, draft draw assign unchanged when **not** validated.

## Dev Notes

### Normative gap-fill rules (server authoritative)

| Mutation | `validatedAt == null` | `validatedAt != null` |
|----------|----------------------|------------------------|
| **Assign** to empty slot | Allowed | **Allowed (6.9)** |
| **Assign** replacing occupant | Allowed | **409** |
| **Clear** slot | Allowed | **409** |
| **Draw `full`** | Allowed | **409** |
| **Draw `fillEmpty`** | Allowed | **Allowed if ≥1 empty required slot (6.9)** |
| **Restore decline** | N/A (use assign) | **Allowed when empty role slot (6.9)** |

**Do not** require **Déverrouiller** for ordinary gap recovery — unlock remains for wholesale edits (**6.6**).

### Restore semantics (V1 parity)

V1 [`moveDeclinedToComposition`](../../legacy/src/components/SelectionModal.vue) assigns to first empty slot for role, removes player from **declined** map, sets status **pending**.

V2 equivalent:

1. Pick first empty `(roleKey, slotIndex)` for decline’s `roleKey`.
2. Assign participant from decline row (season/event participant XOR).
3. **Delete** `event_composition_declines` row (user no longer listed as declined; stats may use separate history later — **Epic 9**).
4. Fire **targeted** confirmation intent for that participant.

### Targeted notification (FR27 / FR31)

| Event | Port method | Recipients |
|-------|-------------|------------|
| **Validate (6.6)** | `requestCompositionConfirmation` | All current assignees (existing) |
| **Gap fill (6.9)** | `requestConfirmationForAssignees` | **Only** participants newly placed in empty slots |

Epic **8** implements delivery; **6.9** only needs a **named, test-verified hook**.

### UX reference

| Source | Use |
|--------|-----|
| [ux-design — Équipe, validated incomplete](_bmad-output/planning-artifacts/ux-design-hatcast-v2.md#screen-event-detail-equipe-tab) | **Compléter**, **À compléter** warning, declined collapsible + restore |
| [composition-equipe-status.ts](../../apps/web/src/app/core/composition/composition-equipe-status.ts) | **`slots_to_complete`** label/hint already correct — wire actions |
| [SPEC.md](../../SPEC.md) | Declined badge + **Remettre en composition** when empty slot for role |
| V1 [`SelectionModal.vue`](../../legacy/src/components/SelectionModal.vue) | `handleFillCast` / `fill-cast`, `moveDeclinedToComposition`, `saveEmptySlotSelection` |

### Brownfield — files to touch

**Extend:**

| Asset | Change |
|-------|--------|
| `CompositionSlotAssignmentService.kt` | Gap-fill assign branch when validated |
| `CompositionDrawService.kt` | Allow `fillEmpty` when validated |
| `CompositionNotificationPort.kt` + adapter | New targeted method |
| New `CompositionDeclineRestoreService.kt` (or method on participation service) | Restore endpoint |
| `CompositionController.kt` | Route restore |
| `composition.yaml` | OpenAPI |
| `event-equipe-tab.*` | Compléter, gap slot tap, restore ↶ |
| `composition-api.service.ts` | Client methods |
| Integration + component tests | FR27 coverage |

**Do not change:** participation confirm/decline semantics (**6.7**/**6.8**); unlock resets (**6.6**); draw algorithm weights (**6.4**).

### Pitfalls (prevent LLM mistakes)

1. **Unlocking by default** — gap fill must work **while locked**; do not force **Déverrouiller** for Compléter.
2. **Full draw when validated** — must stay **409**; only **`fillEmpty`**.
3. **Clearing filled slots when validated** — must stay **409**; only assign **into empties**.
4. **Re-sending confirmation to entire team** on each gap fill — use **targeted** port only for **new** assignees.
5. **Keeping decline row after restore** — remove from **`declines[]`** UI list (delete row).
6. **Opening picker on filled locked slots** — still participation modal (**6.7**/**6.8**), not picker.
7. **`showOrganizerPlaceholders`** — when locked, grid comes from **`slotRows`** + `roleSlots`; empty rows have `slot == null` — gap tap must handle **null** slot.
8. **Epic 8 scope creep** — no FCM/email implementation.
9. **No `fillEmpty` integration tests today** — add them in **6.9** (mode exists since **6.4** but untested and blocked when validated).

### Previous story intelligence (6.8)

1. **`CompositionParticipationService`** + organizer bypass — unchanged; gap fill is **assignment**, not participation POST.
2. **Proxy modal on filled slots** — keep; gap work is on **empty** slots only.
3. **Decline list UI** exists but **no restore button** yet — add ↶ in **6.9**.

### Previous story intelligence (6.7)

1. **Decline frees slot** + inserts **`event_composition_declines`** — restore reverses assign + deletes row.
2. **`composition-equipe-status`**: empty slot ⇒ **« À compléter »** — already shipped; **6.9** adds actions hinted in copy.
3. **`compositionPublished`** output — reuse after gap mutations.

### Previous story intelligence (6.4)

1. **`drawComposition(..., 'fillEmpty')`** client already accepts mode; server parses **`fillEmpty`**.
2. **Draw blocked when validated** at lines 63–65 — **relax only for fillEmpty** in **6.9**.
3. **Animation component** — reuse for Compléter; same reduced-motion guard.

### Previous story intelligence (6.6)

1. **Locked toolbar** hid draw/assign — **6.9** re-enables **subset** (fillEmpty + empty assign only).
2. **`requestCompositionConfirmation`** on validate — do not duplicate on gap fill; use new targeted method.

### Git intelligence (recent)

- **`f7d02e7`**, **`86159ef`**, **`de1feab`** — participation + declines landed; extend **`event-equipe-tab`** and composition services, do not fork modals.
- **`db1d3d7`** — draw/assign patterns for API client and tests.

### Latest tech information

- **Spring Boot 3 / Kotlin** — keep `@Transactional` + `findByEventIdForUpdate`; centralize “is gap-fill assign allowed” helper to avoid duplicated validation in draw/assign/restore.
- **Angular 19 signals** — `canFillGaps`, `canTapGapSlot` as computed; guard restore with `restoringDeclineId` signal.
- **MatDialog** — reuse **`CompositionSlotPickerDialog`** from **6.5** without duplicate picker.

### References

- [epics.md — Story 6.9](../planning-artifacts/epics.md) ; **FR27**
- [prd.md — FR27, FR28, FR31](../planning-artifacts/prd.md)
- [ux-design-hatcast-v2.md — Équipe validated incomplete](../planning-artifacts/ux-design-hatcast-v2.md#screen-event-detail-equipe-tab)
- [SPEC.md — declined badge + Remettre en composition](../../SPEC.md)
- [PLAN.md — MVP composition wave](../../PLAN.md)
- [composition-status-messages.md](../../docs/v1/technical/composition-status-messages.md)
- Story **6.4** — draw + `fillEmpty`
- Story **6.5** — picker + assign
- Story **6.6** — lock/unlock
- Story **6.7** — decline frees slot
- Story **6.8** — proxy participation
- V1: [`SelectionModal.vue`](../../legacy/src/components/SelectionModal.vue) (`handleFillCast`, `moveDeclinedToComposition`)

## Dev Agent Record

### Agent Model Used

Composer

### Debug Log References

### Completion Notes List

- API: `CompositionGapFillRules` centralizes validated gap-fill preconditions; assign/draw/candidates relaxed only for empty slots; `fillEmpty` draw on locked composition; restore via `POST .../declines/{declineId}/restore`; `requestConfirmationForAssignees` on NoOp port for new assignees only.
- Web: **Compléter** (`fillEmpty`), gap slot picker, ↶ restore on declines when role has empty slot; `CompositionDecline.id` exposed in API DTO.
- Tests: `CompositionGapFillIntegrationTest` (@Tag FR27); updated slot assignment validated test; 3 new `event-equipe-tab` specs. `./gradlew test --tests com.hatcast.api.composition.*` and `npm run test` green; `ng build` OK.

### File List

- services/api/src/main/kotlin/com/hatcast/api/composition/CompositionGapFillRules.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/CompositionSlotAssignmentService.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/CompositionDrawService.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/CompositionDeclineRestoreService.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/CompositionNotificationPort.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/CompositionController.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/CompositionService.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/dto/CompositionDtos.kt
- services/api/openapi/composition.yaml
- services/api/src/test/kotlin/com/hatcast/api/composition/CompositionGapFillIntegrationTest.kt
- services/api/src/test/kotlin/com/hatcast/api/composition/CompositionSlotAssignmentIntegrationTest.kt
- apps/web/src/app/core/composition/composition-api.service.ts
- apps/web/src/app/pages/event-detail/event-equipe-tab.ts
- apps/web/src/app/pages/event-detail/event-equipe-tab.html
- apps/web/src/app/pages/event-detail/event-equipe-tab.scss
- apps/web/src/app/pages/event-detail/event-equipe-tab.spec.ts
- _bmad-output/implementation-artifacts/sprint-status.yaml

### Review Findings

- [x] [Review][Patch] Lifecycle test does not assert `compositionLifecycle` transition [CompositionGapFillIntegrationTest.kt:424] — fixed: `GET .../events/{id}` expects `awaitingConfirmations` after gap assign.
- [x] [Review][Patch] Restore skips assign eligibility guards [CompositionDeclineRestoreService.kt] — fixed: `ensureEligibleForRoleAssign` mirrors assign pool + same-role checks.
- [x] [Review][Patch] Locked `getCandidates` ignores `slotIndex` emptiness [CompositionSlotAssignmentService.kt:54-58] — fixed: occupied `slotIndex` → 409; integration test added.
- [x] [Review][Patch] Restore notification may target wrong participant id [CompositionDeclineRestoreService.kt] — fixed: uses `eligibleRow.participantId`.
- [x] [Review][Patch] Missing Angular AC7 test for Compléter / gap picker [event-equipe-tab.spec.ts] — fixed: member without `canManageComposition` spec added.

### Change Log

- 2026-05-25: Story 6.9 — gap-fill on validated composition (assign, fillEmpty draw, restore decline, targeted notification hook, Équipe UI).
- 2026-05-25: Code review — 5 patch findings recorded and fixed (see Review Findings).
