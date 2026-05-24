# Story 6.6: Composition validation (lock) and unlock

Status: done

<!-- Ultimate context engine analysis completed — comprehensive developer guide created -->

## Story

As an **organizer**,  
I want to **validate (lock)** the composition before confirmation requests are sent, and **unlock** it when needed,  
so that **I can freeze or reopen the official lineup proposal** (**FR23**, **FR28**).

## Acceptance Criteria

1. **Given** an editable composition (`validatedAt` is null) with **at least one assigned slot** and a user with **`canManageComposition`**, **when** they click **« Valider »** on **Équipe**, **then** the server sets **`validatedAt`**, returns updated composition with **`visibility: validated`**, and the UI refreshes — **FR23**, **FR28**.
2. **Given** a successful validate, **when** any **active troupe member** reloads composition or event detail, **then** slot assignees are **visible** even if **`publishedAt` was never set** (validation implies member visibility per **6.3** AC 8) and **`compositionLifecycle`** becomes **`awaitingConfirmations`** or **`gapsToFill`** when empty required slots exist — **FR23**, **FR28**.
3. **Given** validate succeeds, **when** the server completes the mutation, **then** it invokes a **notification intent hook** for **`confirmation request`** (**FR31**) — stub/no-op delivery acceptable (Epic **8**); must be a named port method the future notifier can replace; **do not** fire on idempotent re-validate.
4. **Given** a validated composition, **when** an organizer with **`canManageComposition`** clicks **« Déverrouiller »**, **then** **`validatedAt` is cleared**, assigned slots **remain**, all assigned slots' **`participationStatus` reset to `pending`** (re-open confirmations per **FR23**), draw/manual assign/clear become available again, and members lose validated-only visibility rules until re-validated — **FR23**.
5. **Given** **`validatedAt` is set**, **when** an organizer tries draw, assign, clear, candidates, or publish, **then** **409** (already enforced in **6.4**/**6.5**/**6.3** — **6.6** adds unlock path only) — regression guard.
6. **Given** **`validatedAt` is null**, **when** validate is attempted with **zero assigned slots**, **then** **409** with clear message — nothing to validate.
7. **Given** validate or unlock, **when** a user **without** **`canManageComposition`** calls the endpoints, **then** **403** — **NFR-S2**.
8. **Given** a validated composition displayed on **Équipe**, **when** an organizer or member views the tab, **then** a **six-state status badge** and **hint paragraph** appear per [`composition-status-messages.md`](../../docs/v1/technical/composition-status-messages.md) evaluation order (`À composer`, `Équipe complète`, `À compléter`, `À vérifier`, `Confirmations en cours`, `En préparation`) — **UX-DR6**, **FR28** Équipe slice.
9. **Given** a validated composition, **when** the organizer views **Équipe**, **then** **Tirer au sort**, manual slot edit, **× clear**, and **Publier** are **hidden/disabled**; **Déverrouiller** is shown — **UX-DR6** locked toolbar rules.
10. **Given** validate or unlock succeeds, **when** the parent event detail shell is open, **then** event DTO reloads (lifecycle badge on **Infos** / agenda context updates) — same pattern as **`compositionPublished`** from **6.3**.
11. **Couverture:** **FR23**, **FR28** ; **UX-DR6** (validate/unlock, six-state badge) ; **NFR-Q1** — Kotlin integration tests for validate/unlock, visibility matrix, participation reset, 403/409, lifecycle enrichment; Angular component tests for **Valider**/**Déverrouiller** visibility, locked toolbar, status badge labels; regression `./gradlew test`, `ng test`, `ng build`.

### Explicit out of scope (later stories — do not implement in 6.6)

| Story | Deferred capability |
|-------|---------------------|
| **6.7–6.9** | Member **Confirmer ma participation** modal on slot tap, proxy confirm, **Compléter** gap-fill draw |
| **6.10** | **Partager** / **Annoncer la compo** (Share & announce modal) |
| **Effacer** | Clear-all / partial reset toolbar |
| **Simuler** | Dry-run draw |
| **Epic 8** | Actual push/email delivery for confirmation-request intent |
| **Epic 9** | Full audit rows for validate/unlock (**FR35** — optional DEBUG log hook only) |
| **PIN gate** | V1 requires PIN before unlock — **not in V2 yet**; unlock is **`canManageComposition`** only until a dedicated auth story adds PIN |
| **Declined-players collapsible** | *« N personne(s) a/ont décliné »* section — **6.7**/**6.9** when decline flow exists |
| **Legacy** | Do not modify `legacy/` |

## Context and slicing

| Story | Scope |
|-------|--------|
| **6.1–6.3 (done)** | Lifecycle model, `validated_at` column, visibility rules (`validatedAt` → member slot visibility) |
| **6.4–6.5 (done/review)** | Draw, manual assign; **409** when `validatedAt != null`; `isCompositionLocked` in Équipe tab |
| **6.6 (this)** | **`POST validate`**, **`POST unlock`**, **Valider** / **Déverrouiller** UI, six-state Équipe badge + hints, confirmation-request notification hook |
| **6.7+** | Participation confirm/decline mutations from member modal |

**PLAN.md MVP wave:** **6.6** pairs with **6.5** in the same session; minimum composition loop is **6.5 + 6.6 + 6.7**.

## Tasks / Subtasks

- [x] **Scope:** `apps/web/` + `services/api/` ; **do not modify** `legacy/`.
- [x] **`CompositionService.validateComposition` (Kotlin):**
  - Auth: **`canManageComposition`**; troupe member gate same as publish/draw.
  - Load composition with **`findByEventIdForUpdate`**.
  - Block when **no composition row** or **zero assigned slots** → **409**.
  - If **`validatedAt` already set** → **idempotent 200** (return current composition; **do not** re-fire notification).
  - Set **`validatedAt = now`**, **`updatedAt = now`**.
  - For every slot with **`participantId != null`**: ensure **`participationStatus = PENDING`** (fresh validate resets any stale status from a prior unlock cycle).
  - Invoke **`notificationPort.requestCompositionConfirmation(...)`** only on first validate.
  - Return **`CompositionResponseDto`** via **`buildResponse`**.
- [x] **`CompositionService.unlockComposition` (Kotlin):**
  - Auth: **`canManageComposition`**.
  - Block when **`validatedAt == null`** → **409**.
  - Set **`validatedAt = null`**, **`updatedAt = now`**.
  - For every slot with **`participantId != null`**: set **`participationStatus = PENDING`** (re-open confirmations — **FR23**).
  - **Do not** delete slot rows or clear assignees.
  - Return **`CompositionResponseDto`**.
- [x] **Extend [`CompositionNotificationPort`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionNotificationPort.kt):**
  - Add **`requestCompositionConfirmation(eventId, seasonId, actorUserId)`** — implement in **`NoOpCompositionNotificationAdapter`** with DEBUG log (mirror **`publishDraftCompositionShared`** pattern from **6.3**).
- [x] **API routes** in [`CompositionController`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionController.kt):
  - `POST /v1/seasons/{seasonId}/events/{eventId}/composition/validate`
  - `POST /v1/seasons/{seasonId}/events/{eventId}/composition/unlock`
- [x] **OpenAPI:** extend [`openapi/composition.yaml`](../../services/api/openapi/composition.yaml) — validate + unlock, 403/409 messages.
- [x] **Angular — API client** ([`composition-api.service.ts`](../../apps/web/src/app/core/composition/composition-api.service.ts)):
  - `validateComposition(seasonId, eventId)`
  - `unlockComposition(seasonId, eventId)`
- [x] **Angular — six-state Équipe status** — new [`composition-equipe-status.ts`](../../apps/web/src/app/core/composition/composition-equipe-status.ts):
  - Port evaluation order from [`composition-status-messages.md`](../../docs/v1/technical/composition-status-messages.md) and V1 [`SelectionModal.vue`](../../legacy/src/components/SelectionModal.vue) `compositionStatus` computed.
  - Inputs: `composition`, `canManageComposition`, `roleSlots` (for empty-slot detection).
  - Output: `{ type, label, hint, tone }` — use **plain text** hints in V2 (no HTML `<strong>` unless a shared sanitizer exists).
  - Unit tests: all six states + priority rule (empty slot → **À compléter** before **À vérifier**).
- [x] **Angular — Équipe tab** ([`event-equipe-tab.ts`](../../apps/web/src/app/pages/event-detail/event-equipe-tab.ts) + template + scss):
  - **`canValidate`**: `canManageComposition && !isCompositionLocked && hasAssignedSlot`.
  - **`canUnlock`**: `canManageComposition && isCompositionLocked`.
  - **Valider** button (blue/green gradient per UX mood); loading state **`validating()`**.
  - **Déverrouiller** button when locked (secondary/outline — see UX references).
  - Render **status badge + hint** above slot grid when composition has visible slots.
  - Emit **`compositionChanged`** (or reuse **`compositionPublished`**) after validate/unlock so [`event-detail.ts`](../../apps/web/src/app/pages/event-detail/event-detail.ts) reloads event DTO (`reloadAfterPublish` pattern → rename or add parallel handler).
  - Snackbars: success *« Composition validée »* / *« Composition déverrouillée »*; **409**/*403* differentiated messages.
  - **`showPublishButton`**: already hidden when not `organizerDraft` — verify stays hidden when `validated`.
- [x] **Tests:**
  - **Integration:** validate sets `validatedAt`; member sees slots; lifecycle `awaitingConfirmations` vs `gapsToFill`; notification port called once; idempotent validate; unlock clears lock + resets pending; assign works after unlock; 403/409 matrix.
  - **Component:** Valider visible/hidden; Déverrouiller visible when locked; draw/edit hidden when locked; badge labels for draft vs validated pending.
  - Regression: **6.5** assign 409 when locked; **6.4** draw 409 when locked; **6.3** visibility unchanged for unpublished non-validated draft.

## Dev Notes

### Validate vs publish (do not conflate)

| Action | Field | Member sees slots? | Structural lock? |
|--------|-------|-------------------|------------------|
| **Publier** (**6.3**) | `publishedAt` | Yes (draft visible) | No — still editable |
| **Valider** (**6.6**) | `validatedAt` | Yes (even without publish) | Yes — draw/assign blocked |

Organizer may **validate** from **`organizerDraft`** or **`publishedDraft`**. Validation is the **structural lock**; publish is optional pre-step for sharing draft before locking.

### Unlock semantics (normative)

Align **FR23** + V1 [`unconfirmCast`](../../legacy/src/services/storage.js):

- **Keep** all slot assignees.
- **Clear** `validatedAt`.
- **Reset** `participationStatus` → **`PENDING`** on assigned slots (re-open confirmation requirements).
- **Do not** auto-clear `publishedAt` — after unlock, visibility falls back to publish rules (**6.3**): members still see slots if `publishedAt` set, organizers-only if unpublished draft.

V1 **preserved** `playerStatuses` on unlock for visual history; V2 **resets to pending** per FR23 wording (*« re-opens confirmation requirements »*). Document in tests.

### Six-state badge evaluation order

First match wins (from [`composition-status-messages.md`](../../docs/v1/technical/composition-status-messages.md)):

| Order | Label | Condition |
|-------|-------|-----------|
| 1 | À composer | No assigned slots |
| 2 | Équipe complète | Validated, no empty slots, no declined-in-slot, all filled **confirmed** |
| 3 | À compléter | Validated + ≥1 empty required slot |
| 4 | À vérifier | Validated + declined assignee still in slot (no empty slots) |
| 5 | Confirmations en cours | Validated, filled, not all confirmed |
| 6 | En préparation | Has selection, not validated |

For **6.6**, states **2–5** require **`validatedAt != null`**; state **6** requires selection + not validated; state **1** is the existing empty/placeholder path.

**Declined-in-slot detection:** slot with `participationStatus === 'declined'` **and** `participantId != null` (until **6.7** frees slot on decline — use current schema faithfully).

### UX reference (V1 → V2)

| V1 | V2 target |
|----|-----------|
| [`SelectionModal.vue`](../../legacy/src/components/SelectionModal.vue) **Valider** / **Déverrouiller** | Toolbar buttons on [`event-equipe-tab`](../../apps/web/src/app/pages/event-detail/event-equipe-tab.ts) |
| `compositionStatus` badge + hint | **`composition-equipe-status.ts`** + template block |
| [`event-detail-equipe-draft-validate-v1.png`](../planning-artifacts/ux-references/event-detail-equipe-draft-validate-v1.png) | **Valider** on editable draft |
| [`event-detail-equipe-declined-validated-incomplete-v1.png`](../planning-artifacts/ux-references/event-detail-equipe-declined-validated-incomplete-v1.png) | **À compléter** + **Déverrouiller** when validated with gaps |

Toolbar rules after validation ([ux-design — Équipe tab](../planning-artifacts/ux-design-hatcast-v2.md#screen-event-detail-equipe-tab)): **no** casual edit/clear/redraw; **Déverrouiller** is the edit path. **Compléter** / **Annoncer** deferred.

### Architecture & guardrails

- Monorepo V2: [ARCH.md](../../ARCH.md) ; REST camelCase: [architecture.md](../planning-artifacts/architecture.md)
- Auth: [ADR-0010](../../docs/adr/0010-v2-auth-identity-platform.md)
- Authorization: [`OrganizerAccessService.canManageComposition`](../../services/api/src/main/kotlin/com/hatcast/api/organizer/OrganizerAccessService.kt) — same gate as draw/publish/assign
- **Server-side validate/unlock is authoritative** — never set `validatedAt` only in Angular
- **Fail closed:** visibility from [`CompositionVisibilityRules`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionVisibilityRules.kt) already correct for `validatedAt` — no change expected unless tests prove otherwise
- Lifecycle enrichment: validate/unlock should reflect on next **`GET event`** via existing [`CompositionLifecycleEnrichmentService`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionLifecycleEnrichmentService.kt) — trigger client reload after mutation

### Brownfield — extend existing composition package

**Already exists (extend, do not rewrite):**

| Asset | Location |
|-------|----------|
| Composition read/publish/draw/assign | [`CompositionController`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionController.kt), [`CompositionService`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionService.kt) |
| Lock checks in draw/assign | [`CompositionDrawService`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionDrawService.kt), [`CompositionSlotAssignmentService`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionSlotAssignmentService.kt) |
| `isCompositionLocked` / toolbar gating | [`event-equipe-tab.ts`](../../apps/web/src/app/pages/event-detail/event-equipe-tab.ts) |
| Notification stub port | [`CompositionNotificationPort`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionNotificationPort.kt) |
| Infos-tab lifecycle hint (FR28 coarse) | [`composition-status-hint.ts`](../../apps/web/src/app/core/composition/composition-status-hint.ts) — **distinct** from six-state Équipe badge |

**No new migration expected** — reuse **`event_compositions.validated_at`** and **`event_composition_slots.participation_status`**.

### Project structure notes

```
services/api/src/main/kotlin/com/hatcast/api/composition/
  CompositionService.kt              # ADD validateComposition, unlockComposition
  CompositionController.kt           # ADD POST validate, POST unlock
  CompositionNotificationPort.kt     # ADD requestCompositionConfirmation

services/api/openapi/composition.yaml

services/api/src/test/kotlin/com/hatcast/api/composition/
  CompositionValidateUnlockIntegrationTest.kt   # NEW

apps/web/src/app/core/composition/
  composition-api.service.ts         # validateComposition, unlockComposition
  composition-equipe-status.ts       # NEW six-state helper
  composition-equipe-status.spec.ts

apps/web/src/app/pages/event-detail/
  event-equipe-tab.*                 # Valider, Déverrouiller, badge, hints
  event-detail.ts/html               # reload event after validate/unlock
```

### Testing requirements

| Layer | What to test |
|-------|----------------|
| Unit (Kotlin) | Optional: validate preconditions in isolation |
| Unit (TS) | Six-state evaluation order; priority À compléter vs À vérifier |
| Integration | Validate/unlock happy paths; member visibility; pending reset; notification port once; idempotent validate; 403/409 |
| Component | Button visibility matrix; locked toolbar; badge label on validated pending |
| Regression | 6.4 draw 409 locked; 6.5 assign 409 locked; 6.3 publish idempotent unchanged |

### Previous story intelligence (6.5)

1. **`isCompositionLocked`** = `validatedAt != null` — reuse; **6.6** wires the mutations that flip it.
2. **409 UX** — extend snackbar differentiation for validate/unlock failures (same pattern as assign).
3. **`findByEventIdForUpdate`** — use on validate/unlock (same as publish/draw/assign).
4. **Organizer placeholders** — when unlocked, editable placeholders return via existing `showOrganizerPlaceholders` computed.
5. **Multi-role assign** — unaffected by validate; lock blocks all structural edits uniformly.

### Previous story intelligence (6.4)

1. Draw blocked at **409** when validated — unlock must re-enable draw without extra client state.
2. Explainability visible when **`validatedAt != null`** — persists after validate (no change needed).

### Previous story intelligence (6.3)

1. **`publishedAt` vs `validatedAt`** — validate makes slots visible even without publish (AC 8); test both paths.
2. **`compositionPublished` output** — mirror for validate/unlock event reload.
3. **Notification port pattern** — copy **`publishDraftCompositionShared`** stub approach for confirmation request.

### Previous story intelligence (6.1)

1. Lifecycle **`awaitingConfirmations`** vs **`gapsToFill`** after validate — depends on empty required slots vs `roleSlots`.
2. **Simplified team badge** on Infos stays **Équipe en préparation** until **`complete`** — six-state badge is **Équipe tab only**.

### Git intelligence (recent)

- **`db1d3d7`** — composition draw + manual assign landed: extend same Équipe tab; avoid parallel validate UI.
- **12.x** agenda work is parallel — no route changes in **6.6**.
- Prefer focused diff: two POST endpoints + notification port method + toolbar buttons + equipe status helper.

### Latest tech information

- **Spring Boot 3 / Kotlin 2.x** — use existing `@Transactional` + `ResponseStatusException` patterns; no new dependencies.
- **Angular 19+ signals** — follow **`validating()`** / **`unlocking()`** signal pattern from **`publishing()`** / **`assigning()`** in **6.5**.

### References

- [epics.md — Story 6.6](../planning-artifacts/epics.md) ; **FR23**, **FR28**
- [prd.md — FR23, FR28, FR31](../planning-artifacts/prd.md)
- [ux-design-hatcast-v2.md — validate/unlock, lifecycle](../planning-artifacts/ux-design-hatcast-v2.md#composition-lifecycle-status)
- [composition-status-messages.md](../../docs/v1/technical/composition-status-messages.md)
- [PLAN.md — MVP composition wave](../../PLAN.md)
- Story **6.5** — lock checks, Équipe tab toolbar patterns
- Story **6.3** — visibility, notification port, publish reload
- Story **6.1** — lifecycle computation
- V1: [`confirmCast`](../../legacy/src/services/storage.js), [`unconfirmCast`](../../legacy/src/services/storage.js)

## Dev Agent Record

### Agent Model Used

Composer (dev-story workflow)

### Debug Log References

### Completion Notes List

- Added `POST .../composition/validate` and `POST .../composition/unlock` with `canManageComposition` gate, idempotent validate, participation reset to `pending`, and `requestCompositionConfirmation` notification port (no-op stub).
- Équipe tab: **Valider** / **Déverrouiller** buttons, six-state badge via `composition-equipe-status.ts`, reload event via existing `compositionPublished` output.
- Tests: `CompositionValidateUnlockIntegrationTest` (10 cases), `composition-equipe-status.spec.ts`, extended `event-equipe-tab.spec.ts`.
- Regression: `./gradlew test --tests "com.hatcast.api.composition.*"`, `npm test` (271), `npm run build` OK.

### File List

- services/api/src/main/kotlin/com/hatcast/api/composition/CompositionService.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/CompositionController.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/CompositionNotificationPort.kt
- services/api/openapi/composition.yaml
- services/api/src/test/kotlin/com/hatcast/api/composition/CompositionValidateUnlockIntegrationTest.kt
- apps/web/src/app/core/composition/composition-api.service.ts
- apps/web/src/app/core/composition/composition-equipe-status.ts
- apps/web/src/app/core/composition/composition-equipe-status.spec.ts
- apps/web/src/app/pages/event-detail/event-equipe-tab.ts
- apps/web/src/app/pages/event-detail/event-equipe-tab.html
- apps/web/src/app/pages/event-detail/event-equipe-tab.scss
- apps/web/src/app/pages/event-detail/event-equipe-tab.spec.ts

### Change Log

- 2026-05-24: Story 6.6 created — validate/unlock API, Valider/Déverrouiller UI, six-state Équipe badge, confirmation-request notification hook.
- 2026-05-24: Story 6.6 implemented — API validate/unlock, notification port, Équipe UI and tests.
- 2026-05-24: Code review patches — unlock visibility integration tests (unpublished + published), unlock component test.

### Review Findings

- [x] [Review][Patch] Test member visibility after unlock (unpublished draft) — `unlock on unpublished validated draft hides slots from member`. [`CompositionValidateUnlockIntegrationTest.kt`]
- [x] [Review][Patch] Test `publishedAt` preserved after unlock — `unlock keeps publishedAt and member still sees published draft`. [`CompositionValidateUnlockIntegrationTest.kt`]
- [x] [Review][Patch] Component test for unlock flow — `emits compositionPublished after successful unlock`. [`event-equipe-tab.spec.ts`]
- [x] [Review][Defer] `compositionPublished` output reused for validate/unlock — works for AC10 reload but naming obscures intent; rename when event-detail outputs are refactored. [`event-equipe-tab.ts`]
- [x] [Review][Defer] Slots updated outside composition row lock — `findByEventIdForUpdate` on composition only; slot list read without pessimistic lock (low risk for single-organizer MVP). [`CompositionService.kt:107-124`]
