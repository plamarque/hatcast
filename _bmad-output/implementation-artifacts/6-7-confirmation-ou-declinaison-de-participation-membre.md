# Story 6.7: Linked participant confirmation or decline

Status: done

<!-- Ultimate context engine analysis completed — comprehensive developer guide created -->

## Story

As a **linked participant** with an assigned role during the confirmation phase,  
I want to **confirm or decline my participation after the composition is validated**,  
so that **I can commit to the lineup or signal unavailability** (**FR25**, **UX-DR6**).

## Acceptance Criteria

1. **Given** a **validated** composition (`validatedAt != null`) in lifecycle **`awaitingConfirmations`** or **`gapsToFill`**, **when** the **linked participant** assigned to a filled slot chooses **Confirmer**, **Décliner**, or **À confirmer**, **then** the server persists the choice and returns an updated composition visible to authorized viewers — **FR25**, **FR28**.
2. **Given** **Confirmer** or **À confirmer**, **when** the mutation succeeds, **then** the slot **keeps** its assignee and `participationStatus` becomes **`confirmed`** or **`pending`** respectively.
3. **Given** **Décliner**, **when** the mutation succeeds, **then** the slot is **freed immediately** (`seasonParticipantId` / `eventParticipantId` cleared, `participationStatus` reset to **`pending`** on an empty slot), a **decline record** is persisted (who, role, slot, when, optional note), and event lifecycle moves toward **`gapsToFill`** when a required slot becomes empty — **FR25**, **FR28**, **UX-DR6** [declines audit](_bmad-output/planning-artifacts/ux-design-hatcast-v2.md#declines-audit).
4. **Given** a linked participant on **Équipe** when composition is **validated** and **not** organizer-editable (`isCompositionLocked`), **when** they tap **their own filled slot**, **then** the **« Confirmer ma participation »** modal opens (event title, date, assigned role recap, three response buttons, optional note) — **UX-DR6** [participation modal](_bmad-output/planning-artifacts/ux-design-hatcast-v2.md#pattern-confirm-participation-modal).
5. **Given** a member taps **another participant's slot**, **when** they are **not** an organizer acting under proxy rules, **then** the modal **does not** open (no-op or brief feedback) — **self-service only in 6.7**; proxy for others is **6.8**.
6. **Given** `showConfirm=true` on the event URL and the logged-in user has an **assigned slot** on a validated composition, **when** **Équipe** loads, **then** the participation modal **auto-opens** for their slot (replace stub notice in [`event-equipe-empty`](../../apps/web/src/app/pages/event-detail/event-equipe-empty.html)) — **6.2** deep-link contract.
7. **Given** a validated composition, **when** slots render for members, **then** **pending** / **confirmed** slots use **distinct styling** (warm pending, success-toned confirmed) aligned with UX colour continuity — **UX-DR6**.
8. **Given** one or more decline records exist, **when** any authorized viewer loads **Équipe**, **then** a **compact badge** below the grid shows the decline count (e.g. *« 1 personne a décliné »* / *« N personnes ont décliné »*); clicking toggles a **« Personnes ayant décliné »** list (avatar, name, role) — **UX-DR6**, SPEC compact declined layout.
9. **Given** participation changes, **when** the parent event detail is open, **then** event DTO reloads so **Infos** lifecycle badge and **Équipe** six-state badge refresh — same pattern as validate/unlock **`compositionPublished`** output from **6.6**.
10. **Given** composition is **not validated**, **when** a member calls the participation endpoint or taps a slot, **then** **409** (confirmations not open yet) — server authoritative.
11. **Given** a user **without** a linked participant identity matching the slot assignee, **when** they call the participation endpoint, **then** **403** — **NFR-S2**.
12. **Couverture:** **FR25** ; **UX-DR6** (modal, slot styling, declined badge/list) ; **NFR-Q1** — Kotlin integration tests for confirm/pending/decline, slot free + decline row, auth matrix, lifecycle transition; Angular component tests for modal, slot tap gating, `showConfirm` auto-open, styling classes; regression `./gradlew test`, `ng test`, `ng build`.

### Explicit out of scope (later stories — do not implement in 6.7)

| Story | Deferred capability |
|-------|---------------------|
| **6.8** | Organizer/admin **proxy** confirm/decline for **any** participant (name-only, not linked) |
| **6.9** | **Compléter** gap-fill draw, organizer gap actions, **Remettre en composition** from declined list |
| **6.10** | **Partager** / **Annoncer la compo** |
| **Epic 8** | Push/email on individual confirm/decline (validate already fires confirmation-request intent) |
| **Epic 9** | Full audit trail rows (**FR35** — optional DEBUG log hook on participation mutation) |
| **Organizer slot tap when locked** | Opens proxy modal — **6.8**, not member self-service |
| **Legacy** | Do not modify `legacy/` |

## Context and slicing

| Story | Scope |
|-------|--------|
| **6.1–6.3 (done)** | Lifecycle, visibility, publish |
| **6.4–6.5 (done)** | Draw, manual assign; member slot tap deferred |
| **6.6 (review)** | Validate/unlock; `participationStatus` reset on validate; six-state badge; interim **declined-in-slot** detection until **6.7** frees slot on decline |
| **6.7 (this)** | **`POST participation`** on slot, member modal, decline audit table + UI badge/list, `showConfirm` auto-open, slot status styling |
| **6.8+** | Proxy participation, gap-fill organizer tools |

**PLAN.md MVP wave:** **6.7** completes the minimum composition loop with **6.5 + 6.6**; pairs with **6.4**/**6.9** for draw/gap polish.

## Tasks / Subtasks

- [x] **Scope:** `apps/web/` + `services/api/` ; **do not modify** `legacy/`.
- [x] **Migration `V21__composition_participation_declines.sql`:**
  - Table **`event_composition_declines`**: `id UUID PK`, `event_id FK`, `role_key`, `slot_index`, `season_participant_id NULL`, `event_participant_id NULL` (XOR like slots), `declined_by_user_id FK users`, `declined_at`, `note VARCHAR(500) NULL`, `created_at`.
  - Index on `(event_id)`; FK to `season_participants` / `event_participants` where applicable.
  - **Do not** reuse `participation_status = DECLINED` with assignee still present as the long-term model — **6.7** frees the slot per UX/SPEC.
- [x] **`CompositionParticipationService` (Kotlin):**
  - **`updateParticipation(seasonId, eventId, roleKey, slotIndex, status, note?, principal)`**
  - Preconditions: troupe member; composition **`validatedAt != null`** else **409**; slot exists with assignee; assignee matches **linked participant id(s)** for `principal.userId` else **403**.
  - **Linked participant resolution:** union of `season_participants` where `user_id = actor` OR `troupe_membership.user_id = actor` (active status); plus `event_participants.user_id = actor` for event-only rows. Reuse participant access patterns from [`ParticipantEntities`](../../services/api/src/main/kotlin/com/hatcast/api/participant/ParticipantEntities.kt).
  - **`confirmed`:** set `participationStatus = CONFIRMED`; keep assignee.
  - **`pending`:** set `participationStatus = PENDING`; keep assignee.
  - **`declined`:** insert **`event_composition_declines`** row (capture assignee ids + optional note trimmed ≤500); clear slot assignee fields; set `participationStatus = PENDING`.
  - Use **`findByEventIdForUpdate`** on composition row (same lock pattern as validate/assign).
  - Return **`CompositionResponseDto`** via extended **`buildResponse`** including **`declines[]`** and **`viewerParticipantIds[]`**.
- [x] **API route** in [`CompositionController`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionController.kt):
  - `POST /v1/seasons/{seasonId}/events/{eventId}/composition/slots/{roleKey}/{slotIndex}/participation`
  - Body: `{ "status": "confirmed" | "pending" | "declined", "note": "string | null" }`
- [x] **OpenAPI:** extend [`openapi/composition.yaml`](../../services/api/openapi/composition.yaml) — participation POST, extend **`CompositionResponse`** with `declines`, `viewerParticipantIds`.
- [x] **DTO / read path:**
  - Map decline rows to `{ participantId, participantDisplayName, roleKey, slotIndex, declinedAt, note? }`.
  - Include **`viewerParticipantIds`** on every composition GET (empty when unauthenticated — should not happen for this route).
- [x] **Lifecycle alignment:** after decline frees slot, existing [`CompositionLifecycleService.isEffectivelyFilled`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionLifecycleService.kt) treats empty assignee as gap — **no change expected**; add integration test **decline → gapsToFill**.
- [x] **Six-state badge update:** [`composition-equipe-status.ts`](../../apps/web/src/app/core/composition/composition-equipe-status.ts) — **`hasDeclinedInSlots`** (declined assignee still in slot) becomes **legacy/interim only**; post-decline state is **`À compléter`** via empty slot. Update unit tests accordingly.
- [x] **Angular — API client** ([`composition-api.service.ts`](../../apps/web/src/app/core/composition/composition-api.service.ts)):
  - Types: `CompositionDecline`, extend `CompositionResponse`.
  - `updateSlotParticipation(seasonId, eventId, roleKey, slotIndex, status, note?)`.
- [x] **Angular — participation dialog** — new **`composition-participation-dialog`** under `apps/web/src/app/shared/composition/`:
  - **`MatDialog`** pattern (mirror [`composition-slot-picker-dialog`](../../apps/web/src/app/shared/composition/composition-slot-picker-dialog.ts)).
  - Title *« Confirmer ma participation »*; event title + formatted date; role recap card (emoji + label from [`ROLE_LABELS`](../../apps/web/src/app/core/events/event-types.ts)).
  - Three actions: **Confirmer** (purple gradient), **Décliner** (terracotta/red), **À confirmer** (orange); highlight current status.
  - Optional note textarea, hint *« Visible par l'organisateur·ice. »* max 500 chars.
  - Returns `{ status, note? }` or `undefined` on cancel.
- [x] **Angular — Équipe tab** ([`event-equipe-tab.ts`](../../apps/web/src/app/pages/event-detail/event-equipe-tab.ts) + template + scss):
  - When **`isCompositionLocked`** and slot has assignee: make slot **clickable for members** if `slot.participantId` ∈ `composition.viewerParticipantIds`.
  - **`openParticipationModal(row)`** on eligible slot tap — **do not** open organizer picker when locked.
  - After successful mutation: refresh composition + emit **`compositionPublished`** (or dedicated output) for event reload.
  - **`showConfirmPending()` effect:** after load, if validated + user slot found + status `pending`, auto-open modal once per visit (guard with signal flag).
  - Remove/replace empty-state stub *« La confirmation de participation sera disponible… »* in [`event-equipe-empty`](../../apps/web/src/app/pages/event-detail/event-equipe-empty.html) when composition exists but user awaits confirm — only show stub when truly no composition visibility.
  - Slot row classes: **`--pending`**, **`--confirmed`** (add confirmed styling; keep pending warm gradient).
  - **Declined badge + collapsible list** below grid when `declines.length > 0`.
  - Snackbars: success per action; **403**/*409* differentiated messages.
- [x] **Tests:**
  - **Integration:** confirm/pending/decline happy paths; decline frees slot + inserts decline row; member own slot **200**; other member slot **403**; unvalidated **409**; lifecycle **gapsToFill** after decline; note length validation **400**.
  - **Component:** modal opens on own slot tap only; locked organizer does not get picker on member path; `showConfirm` auto-open; declined badge count; confirmed/pending CSS classes.
  - **Regression:** **6.6** validate/unlock unchanged; **6.5** assign still **409** when locked; six-state badge priority tests updated.

## Dev Notes

### Confirm / pending / decline semantics (normative)

| Action | Slot assignee | `participationStatus` | Side effect |
|--------|---------------|----------------------|-------------|
| **Confirmer** | kept | `CONFIRMED` | — |
| **À confirmer** | kept | `PENDING` | explicit re-pending |
| **Décliner** | **cleared** | `PENDING` (empty slot) | insert **`event_composition_declines`** |

Align **FR25** + V1 [`movePlayerToDeclined`](../../legacy/src/services/castService.js): remove from active composition, retain decline trace for transparency/stats.

**V1 reference UI:** [`ConfirmationModal.vue`](../../legacy/src/components/ConfirmationModal.vue) — three-button layout, optional note.

### Authorization (6.7 vs 6.8)

| Actor | May update participation on |
|-------|----------------------------|
| **Linked participant (6.7)** | Slots where `participantId` matches their linked season/event participant id(s) only |
| **Organizer proxy (6.8)** | Any assignee in scope — **not this story** |

SPEC mentions admins opening any slot — implement that in **6.8** to avoid duplicating proxy audit rules here.

### Linked participant identity

Resolve on server — **never** trust client-sent `participantId` for auth:

```kotlin
// Pseudocode — season scope
seasonParticipantRepository.findActiveBySeasonAndUser(seasonId, userId)
// Include membership-backed rows: troupeMembership.user.id == userId
// Event scope: eventParticipantRepository.findByEventAndUser(eventId, userId)
```

Expose resulting UUID set as **`viewerParticipantIds`** on composition GET so Angular can gate slot taps and `showConfirm` without extra round-trip.

### Validate vs participation phase

| State | Member can confirm? |
|-------|---------------------|
| Draft / published draft, not validated | **No** (**409**) |
| Validated (`validatedAt != null`) | **Yes** on own assigned slots |

Organizers still use assign/picker only when **`validatedAt == null`** (**6.5**). When locked, only participation modal for eligible members.

### Six-state badge after 6.7

Evaluation order unchanged ([`composition-status-messages.md`](../../docs/v1/technical/composition-status-messages.md)). **Behaviour change:** decline **frees** slot → prefer **`À compléter`** over **`À vérifier`**. Keep **`hasDeclinedInSlots`** branch for stale rows (declined status + assignee) until data migrated/cleaned — optional one-time cleanup not required for 6.7.

### UX reference (V1 → V2)

| V1 | V2 target |
|----|-----------|
| [`ConfirmationModal.vue`](../../legacy/src/components/ConfirmationModal.vue) | **`composition-participation-dialog`** |
| Slot click → modal ([`GridBoard.vue`](../../legacy/src/components/GridBoard.vue) `handleCompositionSlotClick`) | **`event-equipe-tab`** locked-slot tap |
| `showConfirm=true` auto-open ([`checkAndOpenConfirmationModal`](../../legacy/src/components/GridBoard.vue)) | **`showConfirmPending` effect** after composition load |
| Declined collapsible badge ([`SelectionModal.vue`](../../legacy/src/components/SelectionModal.vue)) | Badge + list under grid |

### Architecture & guardrails

- Monorepo V2: [ARCH.md](../../ARCH.md) ; REST camelCase: [architecture.md](../planning-artifacts/architecture.md)
- Auth: [ADR-0010](../../docs/adr/0010-v2-auth-identity-platform.md)
- **Server-side participation mutation is authoritative** — never set `participationStatus` only in Angular
- **Fail closed:** **403** when actor ≠ assignee; **409** when not validated
- Reuse **`CompositionVisibilityRules`** — members see slots when validated (**6.3** AC 8)
- Slot assignee helpers: [`CompositionSlotAssignee.kt`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionSlotAssignee.kt) (`assignedParticipantId()`, `hasAssignee()`)

### Brownfield — extend existing composition package

**Already exists (extend, do not rewrite):**

| Asset | Location |
|-------|----------|
| Composition read/validate/assign | [`CompositionService`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionService.kt), [`CompositionController`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionController.kt) |
| Équipe tab + lock gating | [`event-equipe-tab.ts`](../../apps/web/src/app/pages/event-detail/event-equipe-tab.ts) |
| Six-state badge | [`composition-equipe-status.ts`](../../apps/web/src/app/core/composition/composition-equipe-status.ts) |
| Deep link `showConfirm` | [`event-detail-tabs.ts`](../../apps/web/src/app/core/events/event-detail-tabs.ts), [`event-detail.ts`](../../apps/web/src/app/pages/event-detail/event-detail.ts) |
| Lifecycle enrichment | [`CompositionLifecycleEnrichmentService`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionLifecycleEnrichmentService.kt) |

### Project structure notes

```
services/api/src/main/resources/db/migration/
  V21__composition_participation_declines.sql

services/api/src/main/kotlin/com/hatcast/api/composition/
  CompositionParticipationService.kt          # NEW
  EventCompositionDeclineEntity.kt            # NEW
  EventCompositionDeclineRepository.kt        # NEW
  CompositionController.kt                    # ADD POST participation
  CompositionService.kt                       # extend buildResponse (declines, viewerParticipantIds)
  dto/CompositionDtos.kt                      # extend DTOs

services/api/openapi/composition.yaml

services/api/src/test/kotlin/com/hatcast/api/composition/
  CompositionParticipationIntegrationTest.kt  # NEW

apps/web/src/app/core/composition/
  composition-api.service.ts                  # updateSlotParticipation, types

apps/web/src/app/shared/composition/
  composition-participation-dialog.ts         # NEW
  composition-participation-dialog.html
  composition-participation-dialog.scss

apps/web/src/app/pages/event-detail/
  event-equipe-tab.*                          # slot tap, styling, declined badge, showConfirm
  event-equipe-empty.*                        # remove 6.2 stub when modal exists
  event-detail.ts                             # ensure reload after participation change
```

### Testing requirements

| Layer | What to test |
|-------|----------------|
| Unit (Kotlin) | Linked participant resolution; note trim/max length |
| Unit (TS) | Six-state with freed slot after decline; badge pluralization |
| Integration | Confirm/pending/decline; slot free; decline row; 403/409; lifecycle gapsToFill |
| Component | Modal actions; own-slot gating; showConfirm auto-open; declined toggle |
| Regression | 6.6 locked toolbar; 6.5 assign 409 when locked |

### Previous story intelligence (6.6)

1. **`isCompositionLocked`** = `validatedAt != null` — participation only when locked.
2. **Validate resets** all assignees to **`pending`** — first confirmation wave starts after validate.
3. **`compositionPublished` output** — reuse for event reload after participation mutation.
4. **Interim `hasDeclinedInSlots`** — documented until 6.7 frees slot on decline; update tests when decline path lands.
5. **Six-state badge** already on Équipe — should react to confirm/decline without new badge component.

### Previous story intelligence (6.5)

1. Member slot tap was **explicitly deferred** to **6.7** — wire participation modal, **not** picker.
2. **`canEditSlots`** = organizer && !locked — members use separate **`canRespondParticipation`** computed.
3. **409 snackbar differentiation** — extend same pattern for participation errors.

### Previous story intelligence (6.2)

1. **`showConfirm=true`** selects **Équipe** tab — **6.7** must auto-open modal, not empty-state stub.
2. Stub in **`event-equipe-empty`** documents deferred behaviour — remove when modal ships.

### Previous story intelligence (6.1)

1. **`awaitingConfirmations`** vs **`gapsToFill`** — decline emptying a required slot triggers **`gapsToFill`** via existing lifecycle service.
2. **Infos tab badge** stays **Équipe en préparation** until **`complete`** — participation confirm moves toward **`complete`** when all filled slots confirmed.

### Git intelligence (recent)

- **`2a95857`** — story **6.6** validate/unlock landed; extend same Équipe tab and composition package.
- **`9768e56`** — slot FK uses season/event participant XOR (**V20**); decline rows must use same XOR shape.
- **`db1d3d7`** — draw + assign patterns for API client and Équipe tab mutations.

### Latest tech information

- **Spring Boot 3 / Kotlin 2.x** — `@Transactional` + `ResponseStatusException`; Flyway forward-only migration (**V21**).
- **Angular 19+ signals** — `updatingParticipation()` loading signal; one-shot `showConfirmOpened` guard for auto-modal.
- **MatDialog** — `autoFocus: 'first-titled-element'` for a11y (same as picker dialog).

### References

- [epics.md — Story 6.7](../planning-artifacts/epics.md) ; **FR25**
- [prd.md — FR25, FR28](../planning-artifacts/prd.md)
- [ux-design-hatcast-v2.md — participation modal, declines](../planning-artifacts/ux-design-hatcast-v2.md#pattern-confirm-participation-modal)
- [composition-status-messages.md](../../docs/v1/technical/composition-status-messages.md)
- [SPEC.md — slot click participation](../../SPEC.md)
- [PLAN.md — MVP composition wave](../../PLAN.md)
- Story **6.6** — validate/unlock, six-state badge, lock semantics
- Story **6.5** — slot tap split (organizer vs member)
- Story **6.2** — `showConfirm` deep link
- V1: [`ConfirmationModal.vue`](../../legacy/src/components/ConfirmationModal.vue), [`movePlayerToDeclined`](../../legacy/src/services/castService.js)

## Dev Agent Record

### Agent Model Used

Composer

### Debug Log References

- Validated composition with zero assignees: extended `CompositionService.buildResponse` visibility and `CompositionLifecycleService` so members still see the grid/declines and lifecycle reports `gapsToFill`.

### Completion Notes List

- Added `POST .../participation` with confirm/pending/decline semantics; decline frees slot and persists `event_composition_declines`.
- Extended composition GET with `declines[]` and `viewerParticipantIds[]` for self-service gating.
- Angular: participation modal, locked-slot tap, `showConfirm` auto-open, pending/confirmed styling, declined badge/list.
- Tests: `CompositionParticipationIntegrationTest`, lifecycle unit test for validated-empty, extended `event-equipe-tab.spec.ts`.
- Code review (2026-05-25): organizer self-confirm on locked slot, `showConfirm` for any own assignee, decline confirm dialog, note on decline only, loading guard, foreign-slot feedback, `composition-participation-dialog.spec.ts`.

### File List

- services/api/src/main/resources/db/migration/V21__composition_participation_declines.sql
- services/api/src/main/kotlin/com/hatcast/api/composition/EventCompositionDeclineEntity.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/EventCompositionDeclineRepository.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/CompositionLinkedParticipantResolver.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/CompositionParticipationService.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/CompositionController.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/CompositionService.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/CompositionLifecycleService.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/dto/CompositionDtos.kt
- services/api/openapi/composition.yaml
- services/api/src/test/kotlin/com/hatcast/api/composition/CompositionParticipationIntegrationTest.kt
- services/api/src/test/kotlin/com/hatcast/api/composition/CompositionLifecycleServiceTest.kt
- apps/web/src/app/core/composition/composition-api.service.ts
- apps/web/src/app/shared/composition/composition-participation-dialog.ts
- apps/web/src/app/shared/composition/composition-participation-dialog.html
- apps/web/src/app/shared/composition/composition-participation-dialog.scss
- apps/web/src/app/pages/event-detail/event-equipe-tab.ts
- apps/web/src/app/pages/event-detail/event-equipe-tab.html
- apps/web/src/app/pages/event-detail/event-equipe-tab.scss
- apps/web/src/app/pages/event-detail/event-equipe-tab.spec.ts
- apps/web/src/app/pages/event-detail/event-equipe-empty.html
- apps/web/src/app/pages/event-detail/event-equipe-empty.ts
- apps/web/src/app/pages/event-detail/event-detail.spec.ts
- apps/web/src/app/core/composition/composition-equipe-status.ts
- apps/web/src/app/shared/composition/composition-participation-dialog.spec.ts
- _bmad-output/implementation-artifacts/sprint-status.yaml

### Change Log

- 2026-05-24: Story 6.7 created — linked participant confirm/decline API, participation modal, decline audit, showConfirm auto-open, slot styling, declined badge.
- 2026-05-24: Story 6.7 implemented — API participation mutation, declines audit, Équipe UX (modal, styling, deep link), tests green for composition scope.
- 2026-05-25: Code review patches — organizer own-slot confirm, showConfirm breadth, decline UX hardening, tests; story marked done.

### Review Findings

- [x] [Review][Patch] Organizer assigned on locked composition can open participation modal — `canTapParticipationSlot` no longer gated by `canManageComposition`. [`event-equipe-tab.ts`]
- [x] [Review][Patch] `showConfirm=true` auto-opens for any own assigned slot (not only `pending`). [`event-equipe-tab.ts`]
- [x] [Review][Patch] Note persisted only on decline (API + dialog). [`CompositionParticipationService.kt`, `composition-participation-dialog.ts`]
- [x] [Review][Patch] `updatingParticipation` disables slot buttons during mutation. [`event-equipe-tab.html`]
- [x] [Review][Patch] Confirm dialog before decline; snackbar on foreign slot tap. [`event-equipe-tab.ts`]
- [x] [Review][Patch] `composition-participation-dialog.spec.ts`; freed-slot `409` integration test. [`CompositionParticipationIntegrationTest.kt`]
- [x] [Review][Patch] `event-detail.spec.ts` updated for post-6.7 showConfirm behaviour.
- [x] [Review][Defer] Proxy confirm/decline for any participant — **6.8** (implemented separately).
