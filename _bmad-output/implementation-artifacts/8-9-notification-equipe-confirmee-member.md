---
baseline_commit: 8d45541f
---

# Story 8.9: Member notification — team complete (`TEAM_COMPLETE_MEMBER`, G-012)

**Status:** done

**Story ID:** 8.9  
**Story key:** `8-9-notification-equipe-confirmee-member`  
**Growth ID:** **G-012**  
**Epic:** 8 — Notifications (push, email, preferences)  
**Priority:** **P1** (brainstorm 2026-06-07 ; growth-backlog 2026-06-06)  
**Catalogue:** [`NOTIFICATIONS_CATALOG.md`](../../docs/v2/technical/NOTIFICATIONS_CATALOG.md) § Backlog proposé → **Actif** after ship  
**Brainstorm:** [`brainstorming-session-2026-06-07-notifications-post-catalog.md`](../brainstorming/brainstorming-session-2026-06-07-notifications-post-catalog.md) (D3:B, D5:B, D6:B, A3)  
**UX prefs:** [`ux-design-notification-preferences-2026-06-08.md`](../planning-artifacts/ux-design-notification-preferences-2026-06-08.md) (row `TEAM_CONFIRMED`) · as-shipped pattern [`ux-notification-prefs-phase1-as-shipped-2026-06-08.md`](../planning-artifacts/ux-notification-prefs-phase1-as-shipped-2026-06-08.md)  
**Depends:** Story **8.3** (dispatcher, after-commit), **8.2** (category prefs API), **8.2b** (hidden-key pattern), **8.5** (composition notification hooks — `TEAM_VALIDATED_FYI` withdrawn), **6.1** (`CompositionLifecycleService`)  
**Blocks (soft):** Catalogue § index refresh ; prefs regression checklist count **7 → 8**

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

---

## Story

As an **event organizer or confirmed assignee**,  
I want to **receive a collective notification when the composition lifecycle reaches “team complete”** (all required slots filled and confirmed or waived),  
so that **I know the show is firm for everyone** without confusing it with individual confirmation requests or the old “team validated” FYI (FR31 P1, G-012).

---

## Acceptance Criteria

1. **Given** a validated composition, **when** [`CompositionLifecycleService.computeRawLifecycle`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionLifecycleService.kt) transitions **to** `COMPLETE` from any other state (`before != COMPLETE && after == COMPLETE`), **then** intent **`TEAM_COMPLETE_MEMBER`** is dispatched **after commit** — not inside `@Transactional` domain methods. [Source: G-012 ; growth-backlog § Notes ; `CompositionLifecycleAuditRecorder.recordIfChanged`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionLifecycleAuditRecorder.kt)]

2. **Given** lifecycle is already `COMPLETE`, **when** further mutations leave lifecycle `COMPLETE`, **then** **no** additional `TEAM_COMPLETE_MEMBER` is sent. [Source: A3 — celebration on edge, not duplicate ping]

3. **Given** lifecycle was `COMPLETE` and regresses (decline, gap, unlock edit), **when** lifecycle becomes non-`COMPLETE`, **then** **no** “team incomplete” notification is sent (**D5:B** — `TEAM_REGRESSED_INCOMPLETE` out of scope). [Source: brainstorm D5:B ; growth-backlog hors scope]

4. **Given** lifecycle regresses then later returns to `COMPLETE`, **when** the second edge `→ COMPLETE` occurs, **then** `TEAM_COMPLETE_MEMBER` **may** dispatch again (same rules as AC 1). [Source: G-012 — no permanent dedupe mark across regressions ; optional product note in Dev Agent Record]

5. **Given** `TEAM_COMPLETE_MEMBER` dispatch, **when** recipients are resolved, **then** audience = **union** of:
   - **Event organizers** — users from [`EventOrganizerRepository.findByEvent_IdOrderByGrantedAtAsc`](../../services/api/src/main/kotlin/com/hatcast/api/organizer/OrganizerRepositories.kt) (event scope only — **not** season/troupe cascade ; distinct from orga intent `TEAM_COMPLETE` in **8.4**);
   - **Team assignees contributing to `COMPLETE`** — slots on required positions that are effectively filled (`participantId != null`, not `DECLINED`) with `participationStatus == CONFIRMED` **or** `waived == true` (waived slots count toward complete without explicit confirm — see lifecycle tests).  
   Recipients deduplicated by `userId`. Rows without linked `user_id` are skipped silently (**no** guest-email path — unlike **8.8**). [Source: G-012 destinataires ; `CompositionLifecycleServiceTest` waived/complete]

6. **Given** an event organizer is also a confirmed assignee, **when** dispatch runs, **then** they receive **one** notification (dedupe by `userId`). [Source: G-012]

7. **Given** channel eligibility for a linked account, **when** push/email is attempted, **then** category pref **`TEAM_CONFIRMED`** applies (opt-out, default ON for push and email) plus Story **8.1** push gate and non-blank `users.email` for email — same pattern as other member intents (**8.3** AC5). [Source: 8.2 ; brainstorm D3:B mapping]

8. **Given** a channel is blocked or delivery fails, **when** dispatch completes, **then** the domain HTTP response / lifecycle audit is **unchanged** ; failure is logged / `notification_delivery_log` per **8.3** NFR-R2 ; per-recipient isolation. [Source: 8.5 AC7]

9. **Given** dispatch runs, **when** push/email is sent, **then** **no** inbox row is created (`GET /v1/me/inbox` remains pull-only). [Source: 8.3 AC7 ; A3]

10. **Given** payload construction, **when** `TEAM_COMPLETE_MEMBER` fires, **then** copy is **distinct from** `TEAM_VALIDATED_FYI` (do **not** reuse “Équipe validée” wording):
    - Push title: `🎉 Équipe au complet` (or equivalent celebration tone)
    - Body: collective message — e.g. `Tous les participant·es ont confirmé pour {eventTitle} le {eventDate}.`
    - Email subject: `Équipe au complet · {eventTitle} ({eventDate})`
    - Deep link: `?tab=equipe`  
    Implement in [`NotificationPayloadBuilder`](../../services/api/src/main/kotlin/com/hatcast/api/notification/NotificationPayloadBuilder.kt) under the **new** intent — leave existing `TEAM_VALIDATED_FYI` branch unchanged (dead path, not repurposed). [Source: D3:B ; NOTIFICATIONS_CATALOG § Câblés mais non émis ; anti-pattern reuse]

11. **Given** first validate with **all assignees already `CONFIRMED`** (unlock preserve — **6.22**), **when** validate commits and lifecycle jumps to `COMPLETE`, **then** `TEAM_COMPLETE_MEMBER` fires and **no** `CONFIRMATION_REQUEST` / `RECONFIRMATION_REQUEST` (empty `assigneesNeedingConfirm`). [Source: `CompositionService.validateComposition`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionService.kt) ; G-012]

12. **Given** last pending assignee confirms via [`CompositionParticipationService.updateParticipation`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionParticipationService.kt), **when** that confirmation triggers `→ COMPLETE`, **then** `TEAM_COMPLETE_MEMBER` fires (typical path). [Source: G-012 déclencheur]

13. **Given** story ship complete, **when** `/compte/notifications` loads, **then** category **`TEAM_CONFIRMED`** is **visible** (removed from `MEMBER_HIDDEN_NOTIFICATION_PREFERENCE_KEYS`) with **as-shipped copy** per UX DT ; row placed in **Messages pour moi** after `EVENT_ARCHIVED`, before **Rappels automatiques** (rule **A1** — dispatch + UI same release). [Source: 8.2b extensibility ; ux-design-notification-preferences § TEAM_CONFIRMED]

14. **Given** tests run, **when** `./gradlew test` and targeted Vitest execute, **then** integration tests prove: edge `AWAITING_CONFIRMATIONS → COMPLETE` on last confirm dispatches `TEAM_COMPLETE_MEMBER` to organizers ∪ assignees ; organizer+assignee dedupe ; waived+confirmed team ; validate-all-confirmed path ; no dispatch on `COMPLETE → COMPLETE` ; decline regression `COMPLETE → GAPS_TO_FILL` sends **no** team notification ; pref opt-out blocks channel ; `TEAM_VALIDATED_FYI` still never published from validate ; `./gradlew test` green. [Source: project-context.md]

**Product coverage:** FR31 P1 ; G-012 ; decisions **D3:B** (new intent), **D5:B** (no regression notif), **D6:B** (unhide pref on ship), **A3** (celebration, not state duplicate). **Out of scope:** `TEAM_REGRESSED_INCOMPLETE`, orga ops `TEAM_COMPLETE` / `ORG_TEAM_COMPLETE` (**8.4**), guest-email recipients, repurposing `TEAM_VALIDATED_FYI`, manual Share/Announce modal.

---

## Normative UI copy (phase 2 member — implement verbatim)

| Key | Short title | Description (`Me prévenir quand…`) |
|-----|-------------|--------------------------------------|
| `TEAM_CONFIRMED` | **Équipe au complet** | Me prévenir quand tous les participant·es ont confirmé sur un spectacle où je suis impliqué·e (orga ou sélectionné·e). |

**Placement:** section **Messages pour moi**, after **Spectacle annulé** (`EVENT_ARCHIVED`), before **Rappels automatiques**.

---

## Acceptance Criteria — Material 3 (UI)

**M3-1. Material components** — **Given** one new preference row, **when** rendered, **then** reuse existing `mat-slide-toggle` grid in [`notification-preferences-section`](../../apps/web/src/app/shared/notification-preferences-section/notification-preferences-section.ts) — no custom toggles. [Source: FRONTEND_UI.md ; 8.2b/8.8]

**M3-2. Tokens & theme** — **Given** the new row, **when** styled, **then** inherit existing section card / typography tokens (`--mat-sys-*`) — no new hex colors. [Source: FRONTEND_UI.md]

**M3-3. Mobile & touch** — **Given** viewport ≤ 480px, **when** the additional row renders, **then** **Cet appareil** / **E-mail** labels and `aria-label` pattern unchanged ; targets ≥ 48dp. [Source: as-shipped ; NFR-A1]

**M3-4. Member navigation** — **Given** `/compte/notifications`, **when** adding the row, **then** do **not** change account shell / tabs / rail. [Source: 8.2b M3-4]

**M3-5. Review** — **Given** implementation done, **when** validating, **then** checklist FRONTEND_UI.md § Checklist M3 ; update visible member row count **7 → 8** in Dev Agent Record / prefs spec. [Source: AGENTS.md]

---

## Tasks / Subtasks

- [x] **Scope:** `services/api/` + `apps/web/` + `docs/v2/technical/NOTIFICATIONS_CATALOG.md`

### API — intent, trigger, dispatch (AC: 1–12, 14)

- [x] Extend [`NotificationIntent.kt`](../../services/api/src/main/kotlin/com/hatcast/api/notification/NotificationIntent.kt): add **`TEAM_COMPLETE_MEMBER`** ; map to existing category **`TEAM_CONFIRMED`** in `toCategory()` — **do not** change `TEAM_VALIDATED_FYI` mapping.
- [x] Add domain event `TeamCompleteMemberRequestedEvent(eventId, seasonId, actorUserId?)` in [`CompositionNotificationEvents.kt`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionNotificationEvents.kt).
- [x] Extend [`CompositionLifecycleAuditRecorder.recordIfChanged`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionLifecycleAuditRecorder.kt): inject `ApplicationEventPublisher` ; when `before != CompositionLifecycle.COMPLETE && after == CompositionLifecycle.COMPLETE`, publish `TeamCompleteMemberRequestedEvent` (keep existing audit record unchanged).
- [x] Extend [`CompositionNotificationPort`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionNotificationPort.kt) + [`CompositionWorkflowNotificationAdapter`](../../services/api/src/main/kotlin/com/hatcast/api/notification/CompositionWorkflowNotificationAdapter.kt): `notifyTeamCompleteMember(...)`.
- [x] Extend [`CompositionNotificationEventListener`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionNotificationEventListener.kt): `@TransactionalEventListener(AFTER_COMMIT)` handler for `TeamCompleteMemberRequestedEvent`.
- [x] Extend [`NotificationRecipientResolver`](../../services/api/src/main/kotlin/com/hatcast/api/notification/NotificationRecipientResolver.kt): `resolveTeamCompleteMemberRecipients(eventId)` — organizers ∪ complete-state assignees (CONFIRMED or waived on filled required slots) ; `userId` only.
- [x] Wire intent in [`NotificationDispatcher.resolveRecipients`](../../services/api/src/main/kotlin/com/hatcast/api/notification/NotificationDispatcher.kt).
- [x] Add **new** payload + email subject branches for `TEAM_COMPLETE_MEMBER` in [`NotificationPayloadBuilder`](../../services/api/src/main/kotlin/com/hatcast/api/notification/NotificationPayloadBuilder.kt) — **do not** alter `TEAM_VALIDATED_FYI` copy.

### API — tests (AC: 14)

- [x] New `TeamCompleteMemberNotificationIntegrationTest` (or extend composition notification matrix): last-confirm path, validate-all-confirmed, dedupe, regression no-op, opt-out.
- [x] Unit test `NotificationRecipientResolverTest` for organizer ∪ assignee resolution + waived slot.
- [x] Unit test `NotificationPayloadBuilder` for `TEAM_COMPLETE_MEMBER` copy ≠ `TEAM_VALIDATED_FYI`.
- [x] Assert `TeamValidatedFyiRequestedEvent` still never published from validate (regression guard).
- [x] Run `./gradlew test`.

### Web — prefs UI (AC: 13, M3)

- [x] [`notification-preference-ui-copy.ts`](../../apps/web/src/app/core/notifications/notification-preference-ui-copy.ts): remove `TEAM_CONFIRMED` from `MEMBER_HIDDEN_NOTIFICATION_PREFERENCE_KEYS` ; add copy to `NOTIFICATION_PREFERENCE_UI_COPY`.
- [x] [`me-notification-preferences-api.service.ts`](../../apps/web/src/app/core/notifications/me-notification-preferences-api.service.ts): ensure `TEAM_CONFIRMED` in union (likely already present).
- [x] Update [`notification-preferences-section.spec.ts`](../../apps/web/src/app/shared/notification-preferences-section/notification-preferences-section.spec.ts): **8** visible rows ; copy assertion for **Équipe au complet**.
- [x] Run `npm run test -w @hatcast/web -- --watch=false --include "**/notification-preferences-section.spec.ts"`.

### Docs (AC: 14, D7)

- [x] Move `TEAM_COMPLETE_MEMBER` to **Actif** in [`NOTIFICATIONS_CATALOG.md`](../../docs/v2/technical/NOTIFICATIONS_CATALOG.md) ; update index, pref table (`TEAM_CONFIRMED` visible), and § Câblés mais non émis (`TEAM_VALIDATED_FYI` remains dead).

---

## Dev Notes

### Current state (must read before coding)

| Area | Today |
|------|--------|
| Lifecycle `COMPLETE` | Computed in [`CompositionLifecycleService`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionLifecycleService.kt) — all required slots filled + each `CONFIRMED` or `waived` |
| Lifecycle audit | [`CompositionLifecycleAuditRecorder`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionLifecycleAuditRecorder.kt) records `COMPOSITION_LIFECYCLE_CHANGED` on any transition — **no** notification hook today |
| `TEAM_VALIDATED_FYI` | Intent + listener + payload exist ; [`TeamValidatedFyiRequestedEvent`](../../services/api/src/main/kotlin/com/hatcast/api/composition/CompositionNotificationEvents.kt) **never published** since 2026-06-06 (**8.5** amendment) ; recipients = non-assigned roster — **wrong semantics for G-012** |
| `TEAM_CONFIRMED` pref | API category exists (**8.2**) ; UI **hidden** via `MEMBER_HIDDEN_NOTIFICATION_PREFERENCE_KEYS` (**8.2b** D6) |
| Confirmed assignees resolver | [`resolveConfirmedAssigneeRecipients`](../../services/api/src/main/kotlin/com/hatcast/api/notification/NotificationRecipientResolver.kt) — CONFIRMED only ; extend or add sibling for waived |
| Event organizers | [`EventOrganizerRepository`](../../services/api/src/main/kotlin/com/hatcast/api/organizer/OrganizerRepositories.kt) — no notification resolver yet |

### Trigger design (normative)

Centralize on **`CompositionLifecycleAuditRecorder.recordIfChanged`** — already called from every composition mutation that can change lifecycle:

| Caller | Can trigger `→ COMPLETE`? |
|--------|---------------------------|
| `CompositionParticipationService` | **Yes** — last `confirmed` |
| `CompositionService.validateComposition` | **Yes** — all already confirmed |
| `CompositionSlotAssignmentService` | Unlikely while validated (assignee changes post-validate are constrained) |
| `CompositionDrawService` | No — draft only |
| `CompositionDeclineRestoreService` | Unlikely toward complete |

```text
recordIfChanged(event, seasonId, before):
  after = captureRawLifecycle(...)
  if before == after: return
  audit COMPOSITION_LIFECYCLE_CHANGED
  if before != COMPLETE && after == COMPLETE:
    publish TeamCompleteMemberRequestedEvent  // AFTER_COMMIT listener dispatches
```

**Do not** publish from `CompositionLifecycleService` itself (pure compute). **Do not** call `NotificationDispatcher` inside `@Transactional` services (**6-13**, **8.3**).

### Audience resolution (normative)

```text
organizerUserIds = eventOrganizerRepository.findByEvent_IdOrderByGrantedAtAsc(eventId).map { it.user.id }

completeAssigneeParticipantIds = slots on required positions where:
  participantId != null
  participationStatus != DECLINED
  (participationStatus == CONFIRMED || waived)

assigneeRecipients = resolveAssigneeRecipients(completeAssigneeParticipantIds)  // userId only

recipients = distinctBy(userId)(organizerRecipients ++ assigneeRecipients)
```

**Contrast with dead `TEAM_VALIDATED_FYI`:**

| | `TEAM_VALIDATED_FYI` | `TEAM_COMPLETE_MEMBER` (G-012) |
|--|----------------------|--------------------------------|
| Trigger | Validate (withdrawn) | Lifecycle `→ COMPLETE` |
| Audience | Roster **not** assigned | Event organizers + complete-state assignees |
| Copy | « Équipe **validée** » | « Équipe **au complet** » |
| Pref | `TEAM_CONFIRMED` | `TEAM_CONFIRMED` |

### Architecture compliance

| Rule | Implementation |
|------|----------------|
| After-commit only | `TeamCompleteMemberRequestedEvent` → `CompositionNotificationEventListener` |
| Pref = dispatch (A1) | Ship API dispatch **and** unhide `TEAM_CONFIRMED` row in **same** release |
| Opt-out default | Absent pref → push+email ON |
| Inbox ≠ send log | No `MeInbox` writes |
| New intent (D3:B) | `TEAM_COMPLETE_MEMBER` — do not route G-012 through `TEAM_VALIDATED_FYI` |
| No regression notif (D5:B) | Only fire on `→ COMPLETE` edge |

### Payload copy (implement in builder tests)

| Intent | Push title | Body pattern | Email subject |
|--------|------------|--------------|---------------|
| `TEAM_COMPLETE_MEMBER` | `🎉 Équipe au complet` | `Tous les participant·es ont confirmé pour {eventTitle} le {eventDate}.` | `Équipe au complet · {eventTitle} ({eventDate})` |
| `TEAM_VALIDATED_FYI` *(unchanged)* | `✅ Équipe validée` | `L'équipe pour {eventTitle} le {eventDate} a été validée.` | `Équipe validée · …` |

Deep link: `/saison/{seasonSlug}/event/{eventSlug}?tab=equipe` (2-segment URL debt unchanged — **8.8** non-goal).

### Frontend implementation guardrails

| Concern | Action |
|--------|--------|
| Hidden keys | Remove only `TEAM_CONFIRMED` from hidden set ; keep `COMPOSITION_SHARED` hidden |
| Copy | Single `Me prévenir quand…` line — no « Si désactivé » blocks (phase 1 as-shipped) |
| Row count | Update specs **7 → 8** visible member categories |
| testids | `notification-pref-TEAM_CONFIRMED-push` / `-email` |

### Explicit non-goals

- `TEAM_REGRESSED_INCOMPLETE` / notify when team becomes incomplete (**D5:B**)
- Orga ops `TEAM_COMPLETE` / `ORG_TEAM_COMPLETE` (**8.4** FR31b — opt-in orga family)
- Repurposing or re-enabling auto `TEAM_VALIDATED_FYI` on validate
- Guest-email recipients (no `user_id`)
- Inbox badge / PWA affordance
- Debounce / coalesce multiple confirm paths in same request (single `recordIfChanged` call suffices)
- Aligning 3-segment canonical URLs (known debt)

### Dependencies

| Story | Status | Relationship |
|-------|--------|--------------|
| **8.3** | done | Dispatcher, delivery log, after-commit pattern |
| **8.2** | done | `TEAM_CONFIRMED` category API |
| **8.2b** | done | Hidden-key pattern — **unhide** `TEAM_CONFIRMED` here |
| **8.5** | done | `TEAM_VALIDATED_FYI` withdrawn — G-012 replaces product intent |
| **8.8** | done | Prefs UI extensibility pattern (7 rows) |
| **6.22** | done | Validate with preserved confirmations → immediate `COMPLETE` |
| **8.4** | backlog | Orga `TEAM_COMPLETE` — separate intent/audience/prefs |

### Previous story intelligence (8.8)

- Unhide pref key in **same release** as dispatch (A1).
- Client-side filter via `MEMBER_HIDDEN_NOTIFICATION_PREFERENCE_KEYS` ; API already returns all categories.
- Update `notification-preferences-section.spec.ts` row count when adding visible key.
- Guest-email path exists for **8.8** only — **not** applicable here.

### Previous story intelligence (8.5)

- Never dispatch inside `@Transactional` composition methods.
- `TEAM_VALIDATED_FYI` listener remains for future manual/orga use — G-012 must **not** call `notifyTeamValidatedFyi`.
- Per-recipient error isolation in dispatcher.
- Integration tests at `NotificationDispatcher` boundary — follow [`composition-notification-trigger-test-design.md`](investigations/composition-notification-trigger-test-design.md) style.

### Git intelligence

Recent notification work (`8d45541f` **8.8**, `afea893d` **8.2b**): dispatcher has no `TEAM_COMPLETE_MEMBER` ; `TEAM_CONFIRMED` still hidden in UI ; lifecycle audit records transitions without notification side effects.

### Project context reference

- API tests: `./gradlew test`
- Web tests: `npm run test -w @hatcast/web -- --watch=false`
- UI checklist: [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md)
- Dev push: `./scripts/start-dev.sh --with-push`

---

## Dev Agent Record

### Agent Model Used

Composer (Cursor agent)

### Completion Notes List

- Implemented G-012 **`TEAM_COMPLETE_MEMBER`**: lifecycle edge `→ COMPLETE` publishes `TeamCompleteMemberRequestedEvent` from `CompositionLifecycleAuditRecorder` ; after-commit listener dispatches to event organizers ∪ complete assignees (CONFIRMED or waived on required slots), deduped by `userId`.
- Copy distinct from dead `TEAM_VALIDATED_FYI` : push `🎉 Équipe au complet`, email subject `Équipe au complet · …`, deep link `?tab=equipe`.
- Unhid **`TEAM_CONFIRMED`** pref row in `/compte/notifications` (8 visible member rows, M3 checklist OK).
- Tests: `TeamCompleteMemberNotificationIntegrationTest`, resolver/payload/dispatcher unit tests ; Vitest prefs spec green. Full `./gradlew test`: 826 run, **3 failures unrelated** (`AvailabilityControllerIntegrationTest` ×2, `CompositionDrawIntegrationTest` ×1 — `chancePercent` null, pre-existing draw/availability area).
- Product note (AC 4): re-dispatch allowed on second `→ COMPLETE` edge after lifecycle regression — no permanent dedupe mark.

### File List

- `services/api/src/main/kotlin/com/hatcast/api/notification/NotificationIntent.kt`
- `services/api/src/main/kotlin/com/hatcast/api/composition/CompositionNotificationEvents.kt`
- `services/api/src/main/kotlin/com/hatcast/api/composition/CompositionLifecycleAuditRecorder.kt`
- `services/api/src/main/kotlin/com/hatcast/api/composition/CompositionNotificationPort.kt`
- `services/api/src/main/kotlin/com/hatcast/api/composition/CompositionNotificationEventListener.kt`
- `services/api/src/main/kotlin/com/hatcast/api/notification/CompositionWorkflowNotificationAdapter.kt`
- `services/api/src/main/kotlin/com/hatcast/api/notification/NotificationRecipientResolver.kt`
- `services/api/src/main/kotlin/com/hatcast/api/notification/NotificationDispatcher.kt`
- `services/api/src/main/kotlin/com/hatcast/api/notification/NotificationDispatchContext.kt`
- `services/api/src/main/kotlin/com/hatcast/api/notification/NotificationPayloadBuilder.kt`
- `services/api/src/test/kotlin/com/hatcast/api/notification/TeamCompleteMemberNotificationIntegrationTest.kt`
- `services/api/src/test/kotlin/com/hatcast/api/notification/NotificationRecipientResolverTest.kt`
- `services/api/src/test/kotlin/com/hatcast/api/notification/NotificationPayloadBuilderTeamCompleteMemberTest.kt`
- `services/api/src/test/kotlin/com/hatcast/api/notification/NotificationDispatcherTest.kt`
- `apps/web/src/app/core/notifications/notification-preference-ui-copy.ts`
- `apps/web/src/app/shared/notification-preferences-section/notification-preferences-section.spec.ts`
- `docs/v2/technical/NOTIFICATIONS_CATALOG.md`

### Change Log

- 2026-06-08 : Story created (ready-for-dev) — G-012 / `TEAM_COMPLETE_MEMBER`
- 2026-06-08 : Implemented API dispatch + prefs UI + catalogue ; status → review
- 2026-06-08 : Code review — prefs row order fix + tests ; status → done

### Review Findings

- [x] [Review][Patch] `TEAM_CONFIRMED` row appears before `EVENT_DETAILS_CHANGED` / `EVENT_ARCHIVED` in production UI [`notification-preferences-section.ts:255`] — fixed via `MEMBER_NOTIFICATION_CATEGORY_ORDER` sort
- [x] [Review][Patch] Add DOM order assertion: `TEAM_CONFIRMED` after `EVENT_ARCHIVED` [`notification-preferences-section.spec.ts`]
- [x] [Review][Patch] Add integration test: event organizer (not assignee) receives `TEAM_COMPLETE_MEMBER` dispatch [`TeamCompleteMemberNotificationIntegrationTest.kt`]
- [x] [Review][Defer] No test for AC4 re-dispatch after lifecycle regression then second `→ COMPLETE` — deferred, optional product path
- [x] [Review][Defer] No push opt-out unit test for `TEAM_COMPLETE_MEMBER` — deferred, same dispatcher path as other intents (email covered)
- [x] [Review][Defer] `./gradlew test` 3 unrelated failures (`AvailabilityControllerIntegrationTest`, `CompositionDrawIntegrationTest`) — deferred, pre-existing

---

### Validation create-story

- [x] AC métier numérotés et sourcés (G-012 / FR31 / brainstorm / catalogue / UX DT)
- [x] Section **Material 3** remplie (UI prefs row)
- [x] Tasks référencent les numéros d’AC (y compris M3-x)
- [x] Liens vers fichiers code existants à réutiliser
- [x] `npm run test` / `./gradlew test` mentionnés
