---
baseline_commit: 62a5c312c7ed86c528d62420b1e0b1f03c536b0a
---

# Story 6.22: Composition unlock preserves participation status

Status: done

<!-- Ultimate context engine analysis completed — comprehensive developer guide created -->

## Story

As an **organizer**,  
I want **unlocking a validated composition to preserve each slot's participation status** and **to proxy confirm/decline in organizer draft without spurious notifications**,  
so that **I do not lose confirmation progress, can fix the lineup without re-asking everyone, and re-validation only notifies people who still need to confirm** (**FR23**, **FR26**, **FR31**).

## Acceptance Criteria

1. **Given** a validated composition with assigned slots in mixed statuses (`confirmed`, `pending`, `declined`), **when** an authorized organizer runs **Déverrouiller**, **then** `validatedAt` is cleared, assignees are unchanged, each slot keeps its prior `participationStatus`, ordinary members see no slots (`visibility: none`), and **no** notification intent is dispatched — **FR23**, **FR31**.
2. **Given** unlock with slot A `confirmed` and slot B `pending`, **when** an organizer proxy-confirms **or** proxy-declines slot B in **organizer draft** (`validatedAt` null), **then** slot B updates accordingly (confirm → `confirmed`; decline → slot freed + decline row), audit records actor + subject, and **no** intent is dispatched among `CONFIRMATION_REQUEST`, `RECONFIRMATION_REQUEST`, or **`PROXY_CONFIRMATION_RECORDED`** — **FR26**, **FR31** (closes **G-014**).
3. **Given** unlock with Alice `confirmed` on slot 0, **when** an organizer replaces slot 0 with Bob via manual assign, **then** Bob is `pending`, all other slots keep their prior status, and **no** notification until revalidate — **FR23**.
4. **Given** unlock preserving Alice `confirmed` and Bob `pending`, **when** the organizer re-validates, **then** only Bob receives `RECONFIRMATION_REQUEST`; Alice is not notified and stays `confirmed` — **FR23**, **FR31**.
5. **Given** first validate on a draft with mixed statuses (e.g. organizer proxy-confirmed in draft), **when** validate runs, **then** `confirmed` slots stay `confirmed`; other assignees → `pending` + `CONFIRMATION_REQUEST` **only** for non-`confirmed` assignees (same preservation rule as revalidate) — regression guard.
6. **Given** a linked member (non-organizer), **when** they POST participation on a draft composition, **then** **409** *« Les confirmations ne sont pas encore ouvertes »* — **FR25** regression.
7. **Given** organizer draft (`validatedAt` null) with filled slots, **when** an organizer with `canManageComposition` taps the **row body** of a filled slot (not the × clear control), **then** the participation modal opens — **proxy mode** + assignee name for **foreign** slots; **self-service copy** (*« Confirmer ma participation »*) when the assignee is in `viewerParticipantIds`; manual **replace/clear** stays on × or slot-picker path for **empty** slots only; ordinary members still blocked until validated — **FR26**, **UX-DR6**.
8. **Given** a validated composition, **when** an organizer proxy-confirms or proxy-declines a foreign slot, **then** existing **6.8** behaviour is unchanged (`PROXY_CONFIRMATION_RECORDED` still dispatched) — notification regression guard.
9. **Given** draft manual assign with **same** assignee (no-op replace), **when** PUT slot succeeds, **then** `participationStatus` is **unchanged** — **FR23** targeted reset only on assignee change.
10. **Couverture:** **FR23**, **FR25**, **FR26**, **FR31**, **FR35** (audit unchanged); companion spec [`spec-composition-unlock-preserve-confirmations.md`](spec-composition-unlock-preserve-confirmations.md); SCP [`sprint-change-proposal-2026-06-06-composition-unlock-preserve-confirmations.md`](../planning-artifacts/sprint-change-proposal-2026-06-06-composition-unlock-preserve-confirmations.md).

### Explicit out of scope

| Item | Reason |
|------|--------|
| **REMOVED_FROM_COMPOSITION** on revalidate for former assignees dropped in draft | **Ask First** in companion spec — defer unless trivial diff already exists |
| **PIN gate** before unlock | Deferred per **6.6** |
| Changing `publishedAt` on unlock | Keep as-is |
| Member visibility rules | `CompositionVisibilityRules` unchanged |
| **Legacy** | Do not modify `legacy/` |

---

## Acceptance Criteria — Material 3 (UI)

**M3-1. Composants Material** — Proxy modal in draft reuses existing [`composition-participation-dialog`](../../apps/web/src/app/shared/composition/composition-participation-dialog.ts) (`MatDialog`) — no new dialog shell. [Source: FRONTEND_UI.md ; Story **6.8**]

**M3-2. Tokens & thème** — No new colours; participation row gradients unchanged. [Source: FRONTEND_UI.md]

**M3-3. Mobile & tactile** — Draft proxy slot tap targets unchanged (≥ 48×48 row). [Source: FRONTEND_UI.md]

**M3-4. Navigation membre** — N/A (event detail Équipe tab only).

**M3-5. Revue** — Checklist FRONTEND_UI.md ; note intentional extension of proxy tap from locked-only to organizer-draft.

---

## Tasks / Subtasks

- [x] **Scope:** `services/api/` (primary) + minimal `apps/web/` for draft proxy tap; **do not modify** `legacy/`.
- [x] **`CompositionService.unlockComposition`** — Remove the loop that sets `participationStatus = PENDING` on unlock (lines ~264–276 today). Keep: clear `validatedAt`, audit `COMPOSITION_UNLOCKED`, no notification. [AC 1]
- [x] **`CompositionParticipationService.updateParticipation`** — Split validation gate:
  - **`validatedAt == null` && !`canManageComposition`:** **409** *« Les confirmations ne sont pas encore ouvertes »* (members — FR25).
  - **`validatedAt == null` && `canManageComposition`:** allow confirm / pending / decline on **any** filled slot (own or foreign — organizer draft path).
  - **`validatedAt != null`:** unchanged **6.7** / **6.8** matrix.
  - **Do not** publish `ProxyParticipationRecordedEvent` when `validatedAt == null` (draft = silent). [AC 2, 6, 8]
- [x] **`CompositionSlotAssignmentService.assignParticipant`** — Before setting `PENDING`, compare new `participantId` with existing `assignedParticipantId()`; if unchanged, skip status mutation (no-op assign). [AC 3, 9]
- [x] **OpenAPI** [`composition.yaml`](../../services/api/openapi/composition.yaml) — Unlock description already correct; update participation **409** description to distinguish member (draft blocked) vs organizer (allowed). Verify validate description (first validate → pending only). [AC 1, 6]
- [x] **Angular — Équipe tab** [`event-equipe-tab.ts`](../../apps/web/src/app/pages/event-detail/event-equipe-tab.ts) + template:
  - **`canTapProxyParticipationSlot`:** remove `isCompositionLocked()` guard; require `canManageComposition() && row.slot?.participantId`.
  - **`canTapParticipationSlot`:** unchanged — still requires `isCompositionLocked()` (member self-service only when validated).
  - **`onSlotRowClick` (critical):** for **filled** slots, handle `isParticipationSlotTappable(row)` **before** `canEditSlots()` — otherwise draft post-unlock opens slot picker instead of participation modal. Empty slots keep current order (`canEditSlots` / gap → picker).
  - **`onSlotRowClick` mode selection:** if `canTapParticipationSlot(row)` → `{ mode: 'self' }`; else if `canTapProxyParticipationSlot(row)` → `{ mode: 'proxy' }`. Organizer on **own** linked slot in draft uses **self** copy when `viewerParticipantIds` contains assignee (extend `canTapParticipationSlot` **or** branch in click handler — prefer extending self guard: allow self when `canManageComposition() && assignee ∈ viewerParticipantIds` even in draft).
  - × clear button unchanged — still calls assign/clear path, not participation modal. [AC 7]
- [x] **Integration tests — [`CompositionValidateUnlockIntegrationTest.kt`](../../services/api/src/test/kotlin/com/hatcast/api/composition/CompositionValidateUnlockIntegrationTest.kt):**
  - **Replace** `POST unlock clears validatedAt and resets participation to pending` with preserve test: seed slots `confirmed`, `pending`, and **`declined` with assignee still in slot**; assert each status survives unlock + member `visibility: none`. [AC 1]
  - Keep existing unlock visibility tests green (`unlock on unpublished…`, `unlock keeps publishedAt…`). [AC 1 regression]
- [x] **Integration tests — [`CompositionParticipationIntegrationTest.kt`](../../services/api/src/test/kotlin/com/hatcast/api/composition/CompositionParticipationIntegrationTest.kt):**
  - `@Tag("FR26")` draft organizer proxy **confirm** on foreign slot → **200**. [AC 2]
  - `@Tag("FR26")` draft organizer proxy **decline** on foreign slot → **200**, slot cleared. [AC 2]
  - Existing `participation before validate returns 409` stays green for linked member. [AC 6]
- [x] **Integration tests — [`CompositionNotificationTriggerMatrixIntegrationTest.kt`](../../services/api/src/test/kotlin/com/hatcast/api/notification/CompositionNotificationTriggerMatrixIntegrationTest.kt):**
  - **Add `M-P5`** (or equivalent): validate → unlock → draft proxy confirm **and** draft proxy decline → `verifyNoCompositionNotificationIntents()` + never `PROXY_CONFIRMATION_RECORDED`. [AC 2]
  - **Add `M-R2`**: validate → confirm slot A → unlock → slot B stays pending → revalidate → `RECONFIRMATION_REQUEST` **only** for B; A not in assignee list. [AC 4]
  - Keep **`M-U1`**, **`M-E1`**, **`M-E2`**, **`M-R1`**, **`M-P3`**, **`M-P4`** green (unlock silent, draft edit silent, validated proxy still notifies). [AC 8]
- [x] **Integration tests — assign:** no-op PUT same assignee preserves `participationStatus` (e.g. confirmed stays confirmed). [AC 9]
- [x] **Component tests — [`event-equipe-tab.spec.ts`](../../apps/web/src/app/pages/event-detail/event-equipe-tab.spec.ts):**
  - Organizer + **unlocked** draft: tap **foreign** filled row → proxy modal (`mode: 'proxy'`, assignee name). [AC 7]
  - Organizer + unlocked draft: tap **own** linked filled row → self modal (`mode: 'self'`). [AC 7]
  - Organizer + **locked**: tap foreign slot → proxy modal (regression, existing ~L1031). [AC 8]
  - Member without `canManageComposition`: foreign slot tap → snackbar, no dialog (regression). [AC 6]
- [x] **Regression:** `./gradlew test` classes in verification block below; `npm test -- --include='**/event-equipe-tab.spec.ts'`; `ng build`.

### Review Findings

- [x] [Review][Patch] `slotRowAriaLabel` incohérent avec le nouveau routage clic brouillon [`event-equipe-tab.ts:514-527`] — pour un slot rempli déverrouillé, `canEditSlots()` est vrai donc l’aria annonce « Modifier … » alors que `onSlotRowClick` ouvre la modale participation ; inverser la priorité (participation tappable avant édition slot rempli) ou restreindre la branche `canEditSlots` aux slots vides.
- [x] [Review][Patch] AC3 sans test d’intégration dédié — pas de scénario « unlock → replace slot 0 Alice→Bob → Bob `pending`, slot 1 inchangé » ; `M-E1` couvre le silence notification seulement ; ajouter un test ciblé dans `CompositionParticipationIntegrationTest` ou étendre `M-E1`.
- [x] [Review][Defer] Proxy sur slot propre si organisateur non lié (`viewerParticipantIds` vide) [`event-equipe-tab.ts:467-474`] — cas admin sans identité membre ; copie proxy sur slot propre ; rare en prod ; deferred, pre-existing pattern étendu.
- [x] [Review][Patch] File List story incomplet — ajouter `event-equipe-tab.html`, `event-equipe-tab.scss`, `composition-equipe-actions.ts` (zone brouillon inline + Partager en grille).

---

## Dev Notes

### Problem statement (code vs normative docs)

Normative docs and OpenAPI **already** describe unlock preservation (SCP **2026-06-06**, amended **FR23**, story **6.6** AC4, OpenAPI unlock description). **Runtime still resets** all slot statuses to `pending` on unlock:

```264:276:services/api/src/main/kotlin/com/hatcast/api/composition/CompositionService.kt
        val slotsToUpdate =
            slots.filter { slot ->
                slot.hasAssignee() && slot.participationStatus != SlotParticipationStatus.PENDING
            }
        if (slotsToUpdate.isNotEmpty()) {
            ...
                slot.participationStatus = SlotParticipationStatus.PENDING
```

Similarly, **6.8** AC11 (organizer proxy in draft) is documented but **`CompositionParticipationService`** rejects all participation when `validatedAt == null` (line 96–101), **`canTapProxyParticipationSlot`** requires `isCompositionLocked()`, and **`onSlotRowClick`** prioritizes `canEditSlots()` over participation — so draft post-unlock opens the slot picker, not the modal.

This story closes the **implementation gap** — not a new product decision.

### Participation status rules (normative)

| Mutation | Condition | `participationStatus` effect |
|----------|-----------|------------------------------|
| **Unlock** | slot has assignee | **No change** |
| **Validate (first)** | status = `confirmed` | **No change**, no notification |
| **Validate (first)** | status ≠ `confirmed` | → `pending` + `CONFIRMATION_REQUEST` (that assignee only) |
| **Revalidate** | status ≠ `confirmed` | → `pending` + `RECONFIRMATION_REQUEST` (that assignee only) |
| **Revalidate** | status = `confirmed` | **No change**, no notification |
| **Draft assign/replace** | assignee changes | that slot → `pending` |
| **Draft assign/replace** | same assignee (no-op) | no change |
| **Organizer proxy** | draft | set per request; **no** notification |
| **Organizer proxy** | validated | existing **6.8** + `PROXY_CONFIRMATION_RECORDED` rules |

Source: [`spec-composition-unlock-preserve-confirmations.md`](spec-composition-unlock-preserve-confirmations.md).

### Validate path (first + revalidate — unified preservation)

[`CompositionService.validateComposition`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionService.kt) sets non-`confirmed` assignees to `pending` before dispatch; `confirmed` slots are **preserved** (amendment **2026-06-07** — first validate no longer resets all slots). Revalidation uses `auditEventRepository.existsByEventIdAndActionType(..., COMPOSITION_VALIDATED)` to choose `RECONFIRMATION_REQUEST` vs `CONFIRMATION_REQUEST`. Selective notifications **depend** on statuses surviving unlock and draft proxy confirm.

Existing test `M-R1 revalidate dispatches reconfirmation to pending assignees` in [`CompositionNotificationTriggerMatrixIntegrationTest.kt`](../../services/api/src/test/kotlin/com/hatcast/api/notification/CompositionNotificationTriggerMatrixIntegrationTest.kt) must stay green; **add `M-R2`** mixed-status scenario (Alice confirmed survives unlock, Bob pending notified on revalidate) per AC 4.

Validated proxy regression: **`M-P3`** / **`M-P4`** must still dispatch `PROXY_CONFIRMATION_RECORDED` — draft silence is scoped to `validatedAt == null` only (AC 8).

### Notification matrix (must hold after fix)

| Trigger | Dispatch | Forbidden |
|---------|----------|-----------|
| Unlock | — | Any intent; status reset |
| Org proxy in draft | — | `CONFIRMATION_REQUEST`, `RECONFIRMATION_REQUEST`, `PROXY_CONFIRMATION_RECORDED` |
| Draft assign/replace/clear | — | Any composition intent |
| Revalidate | `RECONFIRMATION_REQUEST` for non-`confirmed` assignees only | `CONFIRMATION_REQUEST`, `TEAM_VALIDATED_FYI` |

Source: [`spec-composition-notify-on-validate-only.md`](spec-composition-notify-on-validate-only.md).

### Authorization matrix (participation POST)

| Actor | Draft (`validatedAt` null) | Validated |
|-------|---------------------------|-----------|
| **Linked assignee** | **409** (FR25) | Own slot only |
| **Organizer / admin (`canManageComposition`)** | **Any** filled slot (own or foreign) | **Any** filled slot |
| **Other member** | **403** | **403** on foreign slot |

Implementation pattern: after loading composition, if `validatedAt == null` && !`canManageComposition` → **409**; if `validatedAt == null` && `canManageComposition` → proceed (organizer draft). Front self vs proxy copy is UX-only; same POST endpoint.

### Angular Équipe — click routing (blocking detail)

After unlock, `canEditSlots()` is **true** (`!isCompositionLocked`). Today `onSlotRowClick` checks `canEditSlots()` **first**, so a tap on a **filled** slot opens the **slot picker**, not participation — AC 7 would fail with guard-only changes.

**Required click order for filled slots:**

1. If `isParticipationSlotTappable(row)` → participation modal (self or proxy per guards below).
2. Else if `canEditSlots() || canTapGapSlot(row)` → slot picker (empty slots / non-participation edit).

**Guard rules after fix:**

| Guard | Draft post-unlock | Validated (locked) |
|-------|-------------------|---------------------|
| `canTapParticipationSlot` | **Yes** when assignee ∈ `viewerParticipantIds` (organizer self on own slot) | Yes (unchanged) |
| `canTapProxyParticipationSlot` | **Yes** when `canManageComposition` + filled + not self-tappable | Yes (unchanged) |
| `canEditSlots` | Yes — × clear + picker for **empty** slots; filled-slot **row body** → participation when tappable | No |

× clear button (`canEditSlots && participantId`) stays separate from row-body tap — no change to template control wiring.

### Angular proxy tap (guard delta)

Current guard (**6.8**):

```461:465:apps/web/src/app/pages/event-detail/event-equipe-tab.ts
  protected canTapProxyParticipationSlot(row: SlotRow): boolean {
    ...
    if (!this.canManageComposition() || !this.isCompositionLocked() || ...
```

Remove `!this.isCompositionLocked()` from proxy guard. Extend self guard for organizer own-slot in draft (see table above).

### Brownfield — files to touch

| File | Change |
|------|--------|
| [`CompositionService.kt`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionService.kt) | Remove unlock status reset |
| [`CompositionParticipationService.kt`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionParticipationService.kt) | Draft organizer gate; suppress proxy event in draft |
| [`CompositionSlotAssignmentService.kt`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionSlotAssignmentService.kt) | No-op assign preserves status |
| [`composition.yaml`](../../services/api/openapi/composition.yaml) | Participation 409 wording |
| [`event-equipe-tab.ts`](../../apps/web/src/app/pages/event-detail/event-equipe-tab.ts) | Draft proxy/self tap guards + `onSlotRowClick` order |
| Test files listed in Tasks | Replace wrong unlock test; add matrix cases |

**Do not change:** `CompositionVisibilityRules`, member self-service modal auto-open (`showConfirm`), validate/revalidate notification adapters, draw/assign lock checks when validated.

### V1 reference

[`unconfirmCast`](../../legacy/src/services/storage.js) preserved `playerStatuses` on unlock — V2 aligns with this intent (ISSUES.md documents the V1 bug where wrong collection was read; fixed in legacy).

### Previous story intelligence

| Story | Relevant learning |
|-------|-------------------|
| **6.6** | Unlock API + UI exist; AC amended 2026-06-06 but code not updated; integration test still asserts global reset |
| **6.8** | Proxy POST + modal exist; AC11 draft proxy specified; backend blocks draft |
| **6.13+** | Notifications after commit — ensure draft proxy does not publish events that trigger dispatch |
| **8.5** | Reconfirmation matrix — depends on preserved statuses after unlock |

### Testing commands

```bash
cd services/api && ./gradlew test \
  --tests "com.hatcast.api.composition.CompositionValidateUnlockIntegrationTest" \
  --tests "com.hatcast.api.notification.CompositionNotificationTriggerMatrixIntegrationTest" \
  --tests "com.hatcast.api.composition.CompositionParticipationIntegrationTest"
```

Note: `ReconfirmationNotificationIntegrationTest` referenced in companion spec **does not exist** — revalidate coverage lives in `CompositionNotificationTriggerMatrixIntegrationTest` (`M-R1`, new `M-R2`).

```bash
cd apps/web && npm test -- --include='**/event-equipe-tab.spec.ts'
```

### Explicit non-goals

- No migration — reuse `event_composition_slots.participation_status`.
- No change to six-state Équipe badge evaluation (statuses preserved → badge reflects real state when re-validated).
- No Epic 9 audit UI work.

### References

- [spec-composition-unlock-preserve-confirmations.md](spec-composition-unlock-preserve-confirmations.md) — **implementation kernel**
- [sprint-change-proposal-2026-06-06-composition-unlock-preserve-confirmations.md](../planning-artifacts/sprint-change-proposal-2026-06-06-composition-unlock-preserve-confirmations.md)
- [epics.md — FR23](../planning-artifacts/epics.md) ; Story **6.6** amended AC
- [prd.md — FR23, FR26, FR31](../planning-artifacts/prd.md)
- Story **6.6**, **6.8**, **8.5**
- [spec-composition-notify-on-validate-only.md](spec-composition-notify-on-validate-only.md)

## Dev Agent Record

### Agent Model Used

Composer (Cursor)

### Implementation Plan

1. Backend: remove unlock status reset; split participation gate (member 409 vs organizer draft allowed); suppress `ProxyParticipationRecordedEvent` in draft; no-op assign preserves status.
2. Frontend: extend self/proxy tap guards for organizer draft; prioritize participation tap over slot picker on filled rows.
3. Tests: replace wrong unlock test; add draft proxy + M-P5/M-R2 + no-op assign + Équipe tab draft tap specs.

### Completion Notes List

- Unlock no longer resets `participationStatus`; mixed statuses survive unlock; members see `visibility: none`.
- Organizer draft proxy (confirm/decline) allowed via POST participation; silent (no notification intents, no `PROXY_CONFIRMATION_RECORDED`).
- Revalidate after unlock notifies only non-`confirmed` assignees (`M-R2`).
- No-op slot PUT preserves existing status (e.g. `confirmed` stays `confirmed`).
- Équipe tab: filled-slot row tap opens participation modal in draft (self vs proxy); empty slots still open picker.
- API integration tests (46) pass for the three targeted test classes.
- `ng build` succeeds. `npm test --include event-equipe-tab` blocked by pre-existing syntax error in `troupe-hub.spec.ts` (unrelated); new component tests added and compile with build.

### File List

- services/api/src/main/kotlin/com/hatcast/api/composition/CompositionService.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/CompositionParticipationService.kt
- services/api/src/main/kotlin/com/hatcast/api/composition/CompositionSlotAssignmentService.kt
- services/api/openapi/composition.yaml
- services/api/src/test/kotlin/com/hatcast/api/composition/CompositionValidateUnlockIntegrationTest.kt
- services/api/src/test/kotlin/com/hatcast/api/composition/CompositionParticipationIntegrationTest.kt
- services/api/src/test/kotlin/com/hatcast/api/notification/CompositionNotificationTriggerMatrixIntegrationTest.kt
- apps/web/src/app/pages/event-detail/event-equipe-tab.ts
- apps/web/src/app/pages/event-detail/event-equipe-tab.html
- apps/web/src/app/pages/event-detail/event-equipe-tab.scss
- apps/web/src/app/pages/event-detail/event-equipe-tab.spec.ts
- apps/web/src/app/core/composition/composition-equipe-actions.ts

### Change Log

- 2026-06-07: Story 6.22 created — unlock preserve participation + draft organizer proxy; closes SCP 2026-06-06 implementation gap and G-014.
- 2026-06-07: Pre-implementation audit — added AC 8 (validated proxy regression), fixed AC 7 click routing, draft proxy decline + `M-P5`/`M-R2` tests, declined slot unlock seed, corrected gradlew class list.
- 2026-06-07: Implementation complete — backend unlock/participation/assign fixes, Équipe draft proxy tap, integration + component tests; status → review.
- 2026-06-07: Code review — aria label fix + AC3 integration test ; status → done.
- 2026-06-07: Docs normatifs — first validate preserves `confirmed` (SPEC, DOMAIN, companion specs, UX draft zone + toolbar Partager).
- 2026-06-07: Code review — File List complété (HTML/SCSS Équipe + `composition-equipe-actions`).

### Validation create-story

- [x] AC métier numérotés et sourcés (epics / FR / companion spec)
- [x] Section **Material 3** remplie (UI minimal — proxy tap in draft)
- [x] Tasks référencent les numéros d'AC (y compris M3-x si UI)
- [x] Liens vers fichiers code existants à réutiliser
- [x] `./gradlew test` / `npm test` mentionnés
- [x] Pre-impl review (6 spec AC + notif matrix + Équipe click priority) applied
