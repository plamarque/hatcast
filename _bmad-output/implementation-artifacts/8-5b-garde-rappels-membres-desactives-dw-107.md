---
baseline_commit: 0d35f8e5e4627b453e37962813f9edd7b1f4d7ef
---

# Story 8.5b: Guard presence reminders for inactive members (DW-107)

Status: done

<!-- bmad-create-story — 2026-06-07 — Epic 8 notifications ; resolves DW-107 (deferred T0) -->
<!-- Source of truth: deferred-work.md § DW-107 ; deferred-work-archive.md § 8-5 review W3 ; story 8-5 AC3 -->

## Story

As a **HatCast member who was deactivated or removed from the troupe roster**,  
I want **J-7 / J-1 presence reminders not to be sent to me**,  
so that **I am not spammed after my membership lifecycle ended** and notification trust is preserved (FR31, NFR-R2).

## Acceptance Criteria

1. **Inactive troupe membership guard (AC-1):** Given a linked assignee has a **`CONFIRMED`** composition slot on a validated open event, when `AssigneePresenceReminderJob` evaluates J-7 or J-1 eligibility, then **no** `ASSIGNEE_PRESENCE_REMINDER` is dispatched if the assignee's linked **`TroupeMembershipEntity.status` is `INACTIVE`** (even if the slot is still `CONFIRMED` due to sync lag). [Source: DW-107 ; deferred-work-archive W3 ; story **8.5** AC3 "removed … are not reminded" ; [`SeasonParticipantMembershipSync.kt`](../../services/api/src/main/kotlin/com/hatcast/api/participant/SeasonParticipantMembershipSync.kt)]

2. **Removed season participant guard (AC-2):** Given a season-linked assignee's **`SeasonParticipantEntity.status` is `REMOVED`**, when the reminder job runs, then **no** reminder is sent for that participant (slot may still show `CONFIRMED` until composition is updated). [Source: story **8.5** AC3 ; [`ParticipantStatus`](../../services/api/src/main/kotlin/com/hatcast/api/participant/ParticipantEnums.kt)]

3. **Removed event participant guard (AC-3):** Given an event-scoped assignee (`eventParticipantId`) with **`EventParticipantEntity.status` is `REMOVED`**, when the reminder job runs, then **no** reminder is sent. If the event participant links to a season participant, apply AC-1 and AC-2 on the linked season row as well. [Source: [`EventParticipantEntity`](../../services/api/src/main/kotlin/com/hatcast/api/participant/ParticipantEntities.kt) ; composition slot assignee resolution]

4. **Active assignees unchanged (AC-4):** Given a linked assignee with **`ParticipantStatus.ACTIVE`**, **`TroupeMembershipStatus.ACTIVE`** (when membership is present), slot **`CONFIRMED`**, and a resolvable **`user_id`**, when J-7 or J-1 window matches, then existing reminder behaviour from story **8.5** is **unchanged** (single send per window, idempotent marks, category `REMINDER_7_DAYS` / `REMINDER_1_DAY`). [Source: story **8.5** AC3, AC9 ; [`AssigneePresenceReminderJobTest.kt`](../../services/api/src/test/kotlin/com/hatcast/api/notification/AssigneePresenceReminderJobTest.kt)]

5. **No mark claim when skipped (AC-5):** Given a participant fails AC-1, AC-2, or AC-3, when the job skips them, then **`NotificationReminderMarkService.tryClaimReminderMark` is not called** for that user/event/window (no phantom dedupe marks for ineligible recipients). [Source: NFR-R2 ; story **8.5** AC9]

6. **No user account — unchanged skip (AC-6):** Given a name-only participant (no `user_id`), when the job runs, then behaviour remains **unchanged** — no reminder, no mark claim (existing `resolveUserId` null path). [Source: story **8.5** — linked assignees only]

7. **Tests — unit (AC-7):** Extend [`AssigneePresenceReminderJobTest.kt`](../../services/api/src/test/kotlin/com/hatcast/api/notification/AssigneePresenceReminderJobTest.kt):
   - **Inactive membership:** `CONFIRMED` slot + season participant `ACTIVE` but `troupeMembership.status = INACTIVE` → **0** dispatches, **0** mark claims.
   - **Removed season participant:** `CONFIRMED` slot + `ParticipantStatus.REMOVED` → **0** dispatches.
   - **Regression:** existing J-7 dedupe and J-1 window tests remain green.
   Run: `./gradlew :services:api:test --tests "com.hatcast.api.notification.AssigneePresenceReminderJobTest"`.

8. **Out of scope (AC-8):** Fixing deferred **W1** (`actorUserId` semantic in reminder context) and **W2** (`toCategory(null)` fallback) from story **8.5** review — separate backlog. Clearing stale `CONFIRMED` slots on membership deactivation (composition domain) — not this story. **DW-114** (`reinclude` vs concurrent deactivation) — document only if relevant in Dev Notes. No `apps/web/` changes. No new Flyway migrations.

**Product coverage:** DW-107 ; deferred-work **T0** ; Epic 8 notification integrity ; FR31 P1 ; NFR-R2.

---

## Acceptance Criteria — Material 3 (UI)

**UI : N/A** — backend-only guard in `services/api/` ; no changes under `apps/web/`.

---

## Tasks / Subtasks

- [x] **Scope:** `services/api/` only — patch [`AssigneePresenceReminderJob.kt`](../../services/api/src/main/kotlin/com/hatcast/api/notification/AssigneePresenceReminderJob.kt) ; no dispatcher/payload/scheduler config changes.

- [x] **AC 1–3, 5, 6 — Eligibility guard** — Refactor `resolveUserId(participantId)` into an explicit eligibility helper (e.g. `resolveEligibleReminderUserId`):
  - Load season participant by id when present; require `status == ACTIVE`.
  - If `troupeMembership` is non-null, require `troupeMembership.status == ACTIVE`.
  - Else load event participant; require `status == ACTIVE`; if `seasonParticipant` link exists, re-apply season + membership checks.
  - Return `userId` only when all checks pass; otherwise `null` (skip before mark claim).
  - Prefer **lazy fetch** awareness: membership may be lazy on `SeasonParticipantEntity` — use existing repository `findById` pattern (already loads entity graph from DB in current code).

- [x] **AC 4 — Regression** — Run full existing `AssigneePresenceReminderJobTest` suite unchanged except new cases.

- [x] **AC 7 — Tests** — Add negative cases listed in AC-7 ; mock `troupeMembership` on `SeasonParticipantEntity` (see [`SeasonParticipantEntityKindTest.kt`](../../services/api/src/test/kotlin/com/hatcast/api/participant/SeasonParticipantEntityKindTest.kt) for entity construction patterns).

- [x] **Closure** — When story is **done**, remove or mark **DW-107** resolved in [`deferred-work.md`](./deferred-work.md) § T0 (same pattern as DW-104 → story 1.8).

### Review Findings

- [x] [Review][Patch] Missing unit tests for `EventParticipant` eligibility paths (AC-3, AC-7) — added tests: removed event participant; event assignee linked to removed season participant; event assignee linked to inactive membership. [`AssigneePresenceReminderJobTest.kt`](../../services/api/src/test/kotlin/com/hatcast/api/notification/AssigneePresenceReminderJobTest.kt)

- [x] [Review][Defer] N+1 `findById` per confirmed slot — deferred, pre-existing (unchanged query pattern from story 8.5)

- [x] [Review][Defer] Eligibility evaluated in transaction but dispatch in `afterCommit` — deferred, pre-existing architecture (story 8.5); not introduced by this guard

---

## Dev Notes

### Problem statement (root cause)

Story **8.5** AC3 states that **pending, declined, removed, waived** assignees must not receive J-7/J-1 reminders. The job filters slot-level state (`CONFIRMATION`, `waived`) but **`resolveUserId` only maps participant → user** without checking participant or membership lifecycle:

```112:116:services/api/src/main/kotlin/com/hatcast/api/notification/AssigneePresenceReminderJob.kt
    private fun resolveUserId(participantId: UUID): UUID? {
        seasonParticipantRepository.findById(participantId).orElse(null)?.user?.id?.let { return it }
        eventParticipantRepository.findById(participantId).orElse(null)?.user?.id?.let { return it }
        return null
    }
```

When an admin **deactivates troupe membership** (`TroupeMembershipStatus.INACTIVE`), [`SeasonParticipantMembershipSync`](../../services/api/src/main/kotlin/com/hatcast/api/participant/SeasonParticipantMembershipSync.kt) marks season participants `REMOVED` with `removalSource = MEMBERSHIP_INACTIVE` — but a **confirmed composition slot can lag** until the next composition/roster sync. During that window, reminders still fire → **spam + trust loss** (DW-107).

### Intended behaviour (normative)

| Condition | Remind? |
|-----------|---------|
| Slot not `CONFIRMED` or `waived` | No (existing) |
| No `user_id` (name-only) | No (existing) |
| `SeasonParticipant.status == REMOVED` | **No (new)** |
| `EventParticipant.status == REMOVED` | **No (new)** |
| `TroupeMembership.status == INACTIVE` | **No (new)** |
| Active participant + active membership + confirmed slot | Yes (unchanged) |

**Externes / guests:** Event-only participants without troupe membership should still receive reminders when `ACTIVE` and linked to a user — AC-1 applies only when `troupeMembership` is present.

### Critical code state (read before coding)

| File | Role |
|------|------|
| [`AssigneePresenceReminderJob.kt`](../../services/api/src/main/kotlin/com/hatcast/api/notification/AssigneePresenceReminderJob.kt) | **Primary patch** — eligibility in `buildEventContexts` / resolver |
| [`AssigneePresenceReminderJobTest.kt`](../../services/api/src/test/kotlin/com/hatcast/api/notification/AssigneePresenceReminderJobTest.kt) | Unit tests — add negative membership/participant cases |
| [`SeasonParticipantMembershipSync.kt`](../../services/api/src/main/kotlin/com/hatcast/api/participant/SeasonParticipantMembershipSync.kt) | Documents deactivation → `REMOVED` + `MEMBERSHIP_INACTIVE` |
| [`ParticipantEnums.kt`](../../services/api/src/main/kotlin/com/hatcast/api/participant/ParticipantEnums.kt) | `ParticipantStatus`, `SeasonParticipantRemovalSource` |
| [`TroupeMembershipStatus.kt`](../../services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeMembershipStatus.kt) | `ACTIVE` / `INACTIVE` |

**Do not modify:** `NotificationDispatcher`, `NotificationReminderMarkService`, Flyway, scheduler cron, or composition services in this story.

### Previous story intelligence

**8.5 (done, review W3 deferred → this story):**

- Reminder idempotency uses `notification_reminder_marks` unique claim **before** dispatch — skipping ineligible users **before** `tryClaimReminderMark` is mandatory (AC-5).
- `processRemindersAt` is the test entry point; `runDailyReminders` uses `afterCommit` — guard logic must live in shared `buildEventContexts` path.
- Review items **W1** (actorUserId) and **W2** (category fallback) remain deferred — do not bundle.

**1.8 (done, DW-104):**

- Pattern for T0 deferred items: focused story, minimal diff, test at boundary, update `deferred-work.md` on closure.

### Dependencies

| Story / item | Status | Relationship |
|--------------|--------|--------------|
| **8.5** | done | Parent feature — J-7/J-1 reminders |
| **8.3** | done | Dispatcher + delivery log (unchanged) |
| **8.2** | done | Category gating (unchanged) |
| **2.2** | done | Membership deactivation (`INACTIVE`) |
| **3.19** | done | Season roster removal without troupe deactivation (different path — participant may stay ACTIVE) |
| **DW-114** | T1 backlog | Concurrent reinclude vs deactivation — not fixed here |

### Explicit non-goals

- Auto-clearing `CONFIRMED` slots when membership deactivates.
- Changing manual availability nudge (**6.10b**) or other notification intents.
- New integration test unless unit coverage is insufficient (prefer unit tests at job boundary per **8.5**).
- Recording in `ISSUES.md` unless PO wants a permanent defect entry — **DW-107** in `deferred-work.md` is the tracking ID until closure.

### Project context reference

- Tests: `./gradlew test` from repo root or `:services:api:test` ([project-context.md](../../project-context.md)).
- Architecture: [ARCH.md](../../ARCH.md) § Notifications V2 ; NFR-R2 delivery reliability.
- Product: [epics.md](../planning-artifacts/epics.md) Story 8.5 ; [deferred-triage-2026-06.md](./deferred-triage-2026-06.md) T0 ordering.

---

## Dev Agent Record

### Agent Model Used

(create-story) ; dev-story (Auto)

### Debug Log

- Refactored `resolveUserId` → `resolveEligibleReminderUserId` with shared season/event eligibility helpers.
- Guard runs before `tryClaimReminderMark` in `buildEventContexts` (AC-5 satisfied).

### Completion Notes List

- Ultimate context engine analysis completed — comprehensive developer guide created.
- Implemented eligibility guard: skip reminders when `ParticipantStatus.REMOVED`, `TroupeMembershipStatus.INACTIVE`, or linked season participant fails checks.
- Added unit tests for inactive membership and removed season participant (0 dispatch, 0 mark claims).
- All 7 `AssigneePresenceReminderJobTest` tests pass (code review: +3 event-participant guard cases).
- Marked **DW-107** Done in `deferred-work.md` (T0 closure pattern).

### File List

- `services/api/src/main/kotlin/com/hatcast/api/notification/AssigneePresenceReminderJob.kt`
- `services/api/src/test/kotlin/com/hatcast/api/notification/AssigneePresenceReminderJobTest.kt`
- `_bmad-output/implementation-artifacts/deferred-work.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/8-5b-garde-rappels-membres-desactives-dw-107.md` (this file)

### Change Log

- 2026-06-07 : Story created (`bmad-create-story` DW-107) — ready-for-dev.
- 2026-06-07 : Implemented eligibility guard + tests ; DW-107 closed ; status → review.
- 2026-06-07 : Code review — added EventParticipant eligibility unit tests (AC-3) ; status → done.

---

### Validation create-story

- [x] AC métier numérotés et sourcés (epics / FR / DW-107)
- [x] Section **Material 3** → **UI : N/A** explicite
- [x] Tasks référencent les numéros d'AC
- [x] Liens vers fichiers code existants à réutiliser
- [x] `./gradlew test` mentionné pour API
