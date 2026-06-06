# Story 6.8: Proxy confirmation or decline on behalf of a participant

Status: done

<!-- Ultimate context engine analysis completed — comprehensive developer guide created -->

## Story

As a **season organizer, event organizer, or troupe administrator** with composition management rights,  
I want to **confirm or decline participation on behalf of any assigned participant** (including name-only or not-yet-linked participants),  
so that **the lineup can progress when someone cannot act on their own account** (**FR26**, link **FR35**).

## Acceptance Criteria

1. **Given** a **validated** composition (`validatedAt != null`) in **`awaitingConfirmations`** or **`gapsToFill`**, **when** a user with **`canManageComposition`** for the event records **Confirmer**, **À confirmer**, or **Décliner** for a **filled slot they do not own**, **then** the server applies the same semantics as **6.7** (confirm/pending keep assignee; decline frees slot + decline row) and returns updated composition — **FR26**, **FR25** parity.
2. **Given** proxy **Décliner**, **when** the mutation succeeds, **then** `event_composition_declines` stores **subject** (`seasonParticipantId` / `eventParticipantId` of the assignee) and **actor** (`declinedByUserId` = authenticated organizer/admin user) — minimum audit for **FR26** / **FR35** until Epic 9 full trail.
3. **Given** a **name-only** assignee (season/event participant **without** `user_id`), **when** an authorized organizer proxies confirm or decline, **then** **200** — core **FR26** scenario (participant cannot self-serve).
4. **Given** a user **without** `canManageComposition`, **when** they call participation on another person's slot, **then** **403** (unchanged **6.7** rule).
5. **Given** a linked participant with rights on their **own** slot, **when** they tap their slot, **then** **self-service** path from **6.7** still applies (same endpoint, assignee ∈ `viewerParticipantIds`); proxy branch must **not** break own-slot flow.
6. **Given** composition is **locked**, **when** an organizer with `canManageComposition` taps **any filled slot** (including another participant's), **then** a participation modal opens in **proxy mode** (title/subject shows **assignee display name** + role recap); **not** the organizer picker (**6.5** remains blocked when locked).
7. **Given** a regular member taps **another** participant's slot, **when** they lack organizer rights, **then** modal does **not** open — keep existing snackbar (*« Vous ne pouvez confirmer que votre propre participation. »*) or equivalent.
8. **Given** proxy **Décliner** from the modal, **when** the organizer confirms the destructive dialog, **then** copy references the **assignee name** (not “votre désistement”) — distinct from self-service **6.7**.
9. **Given** participation changes via proxy, **when** event detail is open, **then** composition reload + **`compositionPublished`** emit refresh **Infos** lifecycle and **Équipe** six-state badge — same as **6.7**.
10. **Given** composition **not validated** or **empty slot**, **when** a **linked member** (non-organizer) attempts self-service participation, **then** **409** — server authoritative (reuse existing checks).
11. **Given** a composition in **organizer draft** (`validatedAt` null) with assigned slots, **when** an authorized organizer records confirm / decline / pending for an assignee via proxy, **then** the slot `participationStatus` updates, audit records actor + subject, and **no** composition workflow notification is dispatched until validate/revalidate — **FR26**, **FR31** (SCP 2026-06-06).
12. **Couverture:** **FR26** ; **UX-DR6** [Équipe slot interaction](_bmad-output/planning-artifacts/ux-design-hatcast-v2.md#screen-event-detail-equipe-tab) ; **SPEC** slot-click permissions ; **NFR-S2** — Kotlin integration tests for organizer proxy confirm/pending/decline on foreign slot, name-only assignee, **403** for non-organizer, **403**/**200** matrix vs own-slot; Angular tests for organizer tap any slot, proxy modal title, decline confirm copy; regression **6.7** self-service tests unchanged.

### Explicit out of scope (later stories — do not implement in 6.8)

| Story | Deferred capability |
|-------|---------------------|
| **5.5** | Proxy **availability** PUT (separate domain) |
| **6.9** | Gap-fill **Compléter**, partial draw, targeted notifications |
| **6.10** | **Partager** / **Annoncer la compo** |
| **Epic 8** | Push/email on proxy confirm/decline |
| **Epic 9** | Full **FR35** audit UI + property-level before/after for confirm/pending proxy (optional DEBUG log hook only if trivial) |
| **Legacy** | Do not modify `legacy/` |

## Context and slicing

| Story | Scope |
|-------|--------|
| **6.7 (review)** | Self-service participation POST; member modal; declines table; `viewerParticipantIds` |
| **6.8 (this)** | **Extend** same POST + Équipe UX for **`canManageComposition`** proxy on **any** filled locked slot |
| **6.9+** | Organizer gap actions after decline |

**PLAN.md:** **6.8** is post-MVP wave with **5.5** / **6.10** — still specified for parity with V1 admin slot-click ([SPEC.md](../../SPEC.md) lines 121–124).

## Tasks / Subtasks

- [x] **Scope:** `apps/web/` + `services/api/` only; **do not modify** `legacy/`.
- [x] **API — authorization branch** in [`CompositionParticipationService`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionParticipationService.kt):
  - Inject [`OrganizerAccessRules`](../../services/api/src/main/kotlin/com/hatcast/api/organizer/OrganizerAccessService.kt).
  - After loading slot + assignee, if `assigneeId !in viewerIds`, allow only when `organizerAccess.canManageComposition(eventId, seasonId, principal)`; else **403**.
  - **Do not** require client-sent `participantId` — subject is always the slot assignee.
  - Reuse existing confirm/pending/decline mutation body and decline persistence (**no duplicate endpoint**).
- [x] **OpenAPI** [`composition.yaml`](../../services/api/openapi/composition.yaml):
  - Extend POST `.../participation` summary/description: self-service **or** organizer proxy when `canManageComposition`.
  - Document **403** cases: not assignee and not organizer; **409** unchanged.
- [x] **Integration tests** — extend [`CompositionParticipationIntegrationTest`](../../services/api/src/test/kotlin/com/hatcast/api/composition/CompositionParticipationIntegrationTest.kt):
  - `@Tag("FR26")` organizer (troupe admin or season/event organizer seed) confirms **foreign** slot → **200**, `participationStatus` **confirmed**.
  - Proxy decline → slot cleared, decline row with correct **subject** participant id and **actor** user id ≠ subject's linked user (when linked).
  - **Name-only** participant assigned, organizer declines → **200**.
  - Non-organizer member on foreign slot → **403** (existing test stays green).
  - Organizer proxy on **own** linked slot still **200** (self-service path).
  - Season organizer / event organizer matrix if not covered by admin-only helper — mirror [`OrganizerAccessServiceTest`](../../services/api/src/test/kotlin/com/hatcast/api/organizer/OrganizerAccessServiceTest.kt) patterns.
- [x] **Angular — Équipe tab** ([`event-equipe-tab.ts`](../../apps/web/src/app/pages/event-detail/event-equipe-tab.ts)):
  - Add `canTapProxyParticipationSlot(row)`: `canManageComposition() && isCompositionLocked() && row.slot?.participantId` (any assignee).
  - Update `onSlotRowClick`: if locked + organizer + filled slot → `openParticipationModal(row, { proxy: true })` **before** or **instead of** foreign-member snackbar path.
  - When organizer taps **own** slot (`viewerParticipantIds` has id), prefer **self-service** modal copy (*« Confirmer ma participation »*) — single code path OK if title differs by `proxy` flag only.
  - Remove/replace `onForeignParticipationSlotTap` for organizers (keep for plain members).
- [x] **Angular — participation dialog** ([`composition-participation-dialog`](../../apps/web/src/app/shared/composition/composition-participation-dialog.ts)):
  - Extend `CompositionParticipationDialogData` with optional `mode: 'self' | 'proxy'` and `assigneeDisplayName?: string`.
  - Proxy title e.g. *« Confirmer la participation de {name} »*; subtitle/hint that organizer acts **pour le compte de** the participant.
  - Proxy decline confirm in parent: *« Confirmer le désistement de {name} pour ce rôle ? »*
- [x] **Angular — tests** [`event-equipe-tab.spec.ts`](../../apps/web/src/app/pages/event-detail/event-equipe-tab.spec.ts):
  - Organizer + locked composition: tap foreign filled slot opens dialog with proxy title.
  - Member without `canManageComposition`: foreign tap → snackbar, no dialog.
  - Regression: own-slot **6.7** modal + `showConfirm` auto-open unchanged.
- [x] **Regression:** run composition-related `./gradlew test`, `ng test` for equipe tab + participation dialog, `ng build`.

## Dev Notes

### Authorization matrix (normative)

| Actor | May POST participation on slot when validated |
|-------|--------------------------------------------------|
| **Linked assignee (6.7)** | Own slot only (`assigneeId ∈ viewerParticipantIds`) |
| **Season / event organizer or troupe admin (6.8)** | **Any** filled slot in scope via `canManageComposition` |
| **Other troupe member** | **403** |

**SPEC alignment** ([SPEC.md](../../SPEC.md) § slot click): administrator/organizer may open confirmation for **any** slot; concerned player **only their own**.

`canManageComposition` = troupe admin **OR** season organizer **OR** event organizer ([`OrganizerAccessService`](../../services/api/src/main/kotlin/com/hatcast/api/organizer/OrganizerAccessService.kt) lines 242–249). **No** new permission flag.

### Audit (FR26 / FR35 minimum)

| Action | Actor | Subject |
|--------|-------|---------|
| **Proxy decline** | `declined_by_user_id` | `season_participant_id` / `event_participant_id` on decline row |
| **Proxy confirm/pending** | Authenticated user (implicit) | Slot assignee ids unchanged |

Full **FR35** audit store + UI = **Epic 9**. Do **not** block 6.8 on new `audit_events` table; optional structured **DEBUG** log on proxy mutation is acceptable.

### Reuse 6.7 semantics (do not fork)

Same POST: `POST /v1/seasons/{seasonId}/events/{eventId}/composition/slots/{roleKey}/{slotIndex}/participation`  
Body: `{ "status": "confirmed" | "pending" | "declined", "note": "..." }`

| Status | Slot assignee | `participationStatus` | Side effect |
|--------|---------------|----------------------|-------------|
| **confirmed** | kept | `CONFIRMED` | — |
| **pending** | kept | `PENDING` | — |
| **declined** | **cleared** | `PENDING` on empty slot | `event_composition_declines` row |

### UX reference

| Source | Use |
|--------|-----|
| [ux-design — Équipe interactions](_bmad-output/planning-artifacts/ux-design-hatcast-v2.md) | Organizers tap **any** slot when locked; members own slot only |
| [ux-design — participation modal](_bmad-output/planning-artifacts/ux-design-hatcast-v2.md#pattern-confirm-participation-modal) | Same three buttons; proxy = different title + assignee name |
| [SPEC.md](../../SPEC.md) | Admin opens any slot; player own slot only |
| **6.7 story** | Self-service gating via `viewerParticipantIds` |

### Brownfield — files to touch

**Extend (do not rewrite):**

| Asset | Change |
|-------|--------|
| `CompositionParticipationService.kt` | Organizer auth branch |
| `composition.yaml` | Doc + 403 description |
| `CompositionParticipationIntegrationTest.kt` | FR26 proxy cases |
| `event-equipe-tab.ts` / `.html` | Organizer slot tap → proxy modal |
| `composition-participation-dialog.*` | Proxy mode UI |
| `event-equipe-tab.spec.ts` | Proxy + regression |

**Do not change:** validate/unlock, assign when locked (**409**), draw, `CompositionLinkedParticipantResolver` for viewer ids.

### Pitfalls (prevent LLM mistakes)

1. **New endpoint** — unnecessary; extend auth on existing POST.
2. **Client-sent participantId** — forbidden for auth; subject = slot assignee only.
3. **Opening slot picker when locked** — organizers get **participation** modal, not picker (**6.5**).
4. **Breaking 6.7** — members without `canManageComposition` must still get **403** server-side and snackbar client-side for foreign slots.
5. **Organizer own slot** — must still work via `viewerParticipantIds` without requiring proxy flag in API body.
6. **Epic 9 scope creep** — no audit UI, no availability proxy (**5.5**).

### Previous story intelligence (6.7)

1. **`CompositionParticipationService`** already implements mutation + decline row; only **403 gate** needs organizer bypass.
2. **`declinedByUserId`** = acting user — correct for proxy actor on decline.
3. **`event-equipe-tab`**: `canTapParticipationSlot` = own slots only; comment at line 294 marks proxy as **6.8**; `onForeignParticipationSlotTap` snackbar for non-organizers.
4. **`showConfirm` auto-open** — only **own** slot; organizers use manual tap for others (no change required).
5. **Integration tests** — copy `seedValidatedComposition` / `memberCookie` patterns; add organizer cookie with `promoteToAdmin` or season/event organizer seeds.

### Previous story intelligence (6.6 / 6.5)

1. **`isCompositionLocked`** = `validatedAt != null` — proxy only when locked.
2. **`canEditSlots`** = organizer && !locked — proxy participation is **separate** from assign.
3. **Assign when locked → 409** — must remain after 6.8.

### Git intelligence (recent)

- **`86159ef`**, **`de1feab`** — **6.7** participation API + modal; extend these files, do not duplicate.
- **`2a95857`** — validate/unlock; locked-state rules stable.
- **`9768e56`** — participant XOR on slots/declines; proxy decline must preserve assignee ids on decline row **before** `clearAssignee()`.

### Latest tech information

- **Spring Boot 3 / Kotlin** — inject `OrganizerAccessRules` into `CompositionParticipationService`; keep `@Transactional` + `findByEventIdForUpdate`.
- **Angular 19 signals** — computed `canTapProxyParticipationSlot`; pass `proxy` into dialog `data`.
- **MatDialog** — one dialog component with `mode` switch preferred over duplicating modal.

### References

- [epics.md — Story 6.8](../planning-artifacts/epics.md) ; **FR26**
- [prd.md — FR26, FR35](../planning-artifacts/prd.md)
- [ux-design-hatcast-v2.md — Équipe, participation modal](../planning-artifacts/ux-design-hatcast-v2.md)
- [SPEC.md — slot click permissions](../../SPEC.md)
- [PLAN.md — post-MVP 6.8](../../PLAN.md)
- Story **6.7** — participation API, modal, declines
- Story **3.5** — `OrganizerAccessService` / `canManageComposition`
- [architecture.md](../planning-artifacts/architecture.md) — proxy audit actor vs subject

## Dev Agent Record

### Agent Model Used

claude-4.6-sonnet-medium-thinking

### Debug Log References

### Completion Notes List

- Extended `CompositionParticipationService` with `OrganizerAccessRules` bypass when assignee ∉ `viewerParticipantIds` but caller has `canManageComposition`.
- Équipe tab: `canTapProxyParticipationSlot` + unified tappable rows; organizers tap any filled locked slot; members keep readonly foreign-slot snackbar.
- Participation dialog supports `mode: 'self' | 'proxy'` with assignee-specific title, hint, and decline confirm copy in parent.
- Integration tests (`@Tag("FR26")`): admin proxy confirm/decline, name-only assignee, own-slot regression, season organizer matrix.
- Angular tests: proxy modal open on foreign slot, dialog proxy title/hint, 6.7 self-service regressions unchanged.
- All tests pass: `CompositionParticipationIntegrationTest` (14), `ng test` (286), `ng build`.

### File List

- services/api/src/main/kotlin/com/hatcast/api/composition/CompositionParticipationService.kt
- services/api/openapi/composition.yaml
- services/api/src/test/kotlin/com/hatcast/api/composition/CompositionParticipationIntegrationTest.kt
- apps/web/src/app/pages/event-detail/event-equipe-tab.ts
- apps/web/src/app/pages/event-detail/event-equipe-tab.html
- apps/web/src/app/pages/event-detail/event-equipe-tab.spec.ts
- apps/web/src/app/shared/composition/composition-participation-dialog.ts
- apps/web/src/app/shared/composition/composition-participation-dialog.html
- apps/web/src/app/shared/composition/composition-participation-dialog.spec.ts
- _bmad-output/implementation-artifacts/sprint-status.yaml

### Change Log

- 2026-05-25: Story 6.8 created — proxy participation confirm/decline for organizers/admins on any assigned slot, audit via decline actor/subject, Équipe proxy modal.
- 2026-05-25: Code review — 3 patch findings fixed (event-organizer FR26 test, proxy decline confirm copy test, own-slot mode assertion); story done.
- 2026-06-06: **Amendment SCP composition-unlock-preserve-confirmations** — AC11 proxy in organizer draft; AC10 scoped to linked member self-service only.

### Review Findings

- [x] [Review][Patch] Missing event-organizer proxy integration test [CompositionParticipationIntegrationTest.kt] — added `event organizer can proxy confirm on foreign slot` (@Tag FR26).
- [x] [Review][Patch] Missing Angular test for proxy decline confirm copy [event-equipe-tab.spec.ts] — added test asserting ConfirmDialog message with assignee name.
- [x] [Review][Patch] Organizer own-slot test does not assert self-service mode [event-equipe-tab.spec.ts] — now targets own row and asserts `data.mode === 'self'`.
- [x] [Review][Defer] Dead branch in `onSlotRowClick` foreign-slot snackbar [event-equipe-tab.ts:337-344] — unreachable after readonly button path; harmless cleanup for later.
- [x] [Review][Defer] Unlinked viewer (`viewerParticipantIds` empty) sees static foreign slots without snackbar [event-equipe-tab.html:151-168] — edge case outside typical linked-member flow; pre-existing display pattern.
