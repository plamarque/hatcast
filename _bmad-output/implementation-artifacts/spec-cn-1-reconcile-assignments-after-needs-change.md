---
title: 'CN-1 Reconcile assignments after needs change'
type: 'feature'
created: '2026-10-12'
status: 'done'
route: 'dispatch'
baseline_commit: 'a61e7435f14a64f95c0d6d6048b87290d1fcb1d3'
review_loop_iteration: 0
context:
  - 'AGENTS.md'
  - '_bmad-output/specs/spec-composition-needs-safety/SPEC.md'
  - '_bmad-output/specs/spec-composition-needs-safety/delivery-plan.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Reducing or removing an event role need preserves existing composition rows in storage but makes them disappear implicitly. Organizers cannot see which people need resolution, while member-facing projections can still count or focus an obsolete assignment.

**Approach:** Make reconciliation explicit in the server composition contract for organizers and administrators. Preserve affected assignments without automatic removal or reassignment, and restrict every ordinary-member projection and downstream calculation to current required positions.

## Boundaries & Constraints

**Always:** Detect affected assigned slots against the normalized post-update role requirements inside the existing event update transaction; preserve those rows; expose a typed reconciliation list only to users allowed to manage that composition; use one shared required-position predicate at each affected server projection; cover authorization and rollback in API/domain tests.

**Never:** Implement CN-2 confirmation/UI/activity rendering or CN-3 notifications; delete, reassign, or notify affected participants; expose reconciliation items or their personal data to ordinary members; update the sprint tracker, release, schema, or client UI.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Reduced role | Assigned slots 0–4, role need changes from 5 to 3 | Slots 3–4 persist as organizer-only reconciliation items; normal slots contain 0–2 | Member receives neither affected slots nor reconciliation data |
| Removed role | An assigned slot belongs to a role absent from post-update needs | The slot persists as reconciliation data | Member/agenda/recipient/statistics paths exclude it |
| Safe edit | Increased role count or edit without affected assignment | No reconciliation items | Existing composition behavior stays unchanged |
| Failed update | Exception during the update transaction | Requirements and slot state remain at their previous committed values | API returns the existing failure and emits no partial projection |

</frozen-after-approval>

## Code Map

- `services/api/src/main/kotlin/com/hatcast/api/event/EventService.kt` -- transactional PATCH authorization and normalized `roleSlots` persistence; calculate the post-update impact here without changing audit rendering.
- `services/api/src/main/kotlin/com/hatcast/api/composition/EventCompositionSlotRepository.kt` and `EventCompositionSlotEntity.kt` -- persisted slot identity and any needed locked/load query; no migration is required.
- `services/api/src/main/kotlin/com/hatcast/api/composition/CompositionService.kt` -- builds the composition API response and is the authorization boundary for an organizer-only reconciliation field.
- `services/api/src/main/kotlin/com/hatcast/api/composition/dto/CompositionDtos.kt` -- add the explicit reconciliation DTO to the composition response while keeping `slots` current-role-only.
- `services/api/src/main/kotlin/com/hatcast/api/composition/CompositionLifecycleEnrichmentService.kt`, `event/EventParticipantFocusService.kt`, `season/SeasonStatisticsService.kt`, and `notification/NotificationRecipientResolver.kt` -- filter stored slots to current required positions before lifecycle, focus, statistics, or recipient decisions.
- `services/api/src/test/kotlin/com/hatcast/api/event/EventServiceUpdateTest.kt`, `composition/CompositionIntegrationTest.kt`, `composition/CompositionLifecycleIntegrationTest.kt`, `event/EventControllerIntegrationTest.kt`, `notification/NotificationRecipientResolverTest.kt`, and `season/SeasonStatisticsEventCellTest.kt` -- existing API/domain bases for the authorization, transactional, and projection regressions.

## Tasks & Acceptance

**Execution:**
- [x] Event/composition domain and DTO files -- calculate and return preserved out-of-requirement assigned slots only to authorized composition managers -- make regularization explicit without client inference.
- [x] Lifecycle, participant focus, statistics, and notification-recipient services -- apply current-required-position filtering before deriving member-visible or participation results -- prevent indirect leakage and wrong counts.
- [x] Event, composition, lifecycle, recipient, and statistics tests -- cover reduced/removed/increased roles, manager/member visibility, and transaction rollback -- lock the contract at API/domain boundaries.

**Acceptance Criteria:**
- Given an organizer reduces a filled role or removes it, when the PATCH succeeds, then every affected assigned slot remains persisted and is returned as a reconciliation item only to an organizer or administrator.
- Given an ordinary member consults composition, agenda/focus, notification-recipient, or statistic-derived data after that update, when a stored assignment is outside current requirements, then it is absent from that result and does not affect counts or status.
- Given a role increase or unrelated event edit, when it succeeds, then the reconciliation list is empty and valid existing assignments remain unchanged.
- Given the role-needs update fails, when its transaction rolls back, then neither requirements nor composition slots have a partial committed change.

## Implementation Notes

- The current event requirements remain the sole source of truth. `isRequiredBy` filters derived projections without deleting persisted composition rows.
- `GET .../composition` returns preserved assigned rows outside current needs only in `reconciliationItems` for a composition manager. Ordinary callers receive neither those rows nor their presentation data.
- Notification recipient resolution and scheduled assignee-presence reminders both exclude preserved rows outside current needs.

## Spec Change Log

## Review Triage Log

- Resolved: manager/member API boundary, lifecycle projection, focus, statistics, recipient resolution, member-profile summaries, incomplete-composition reminders, and assignee-presence reminders now filter through the shared predicate.
- Resolved: integration tests cover a successful reduction, persisted affected row, manager-only reconciliation payload, ordinary-member redaction, observable lifecycle, and rejected update preserving the prior requirements and assignment.
- Verified: targeted server suite passed on 2026-10-12. The complete API suite has one unrelated pre-existing seed-fixture failure: `UserAgendaPerformanceIntegrationTest` expects at least 20 upcoming seeded events but found 19; it did not reach or report a CN-1 assertion failure.
- Accepted: mobile Tailscale smoke validated by Patrice on 2026-10-12 after the offline CORS correction; seed sign-in reached the agenda successfully.

## Design Notes

The normal `slots` array remains a truthful current composition for every caller. A separate reconciliation array is an organizer-only server response, avoiding both client-side reconstruction and accidental member disclosure.

## Verification

**Commands:**
- `./gradlew :services:api:test --tests '*EventServiceUpdateTest' --tests '*CompositionIntegrationTest' --tests '*CompositionLifecycleIntegrationTest' --tests '*EventControllerIntegrationTest' --tests '*NotificationRecipientResolverTest' --tests '*SeasonStatisticsEventCellTest'` -- expected: targeted API/domain regressions pass.
- `./gradlew test` -- expected: the complete repository test suite passes after targeted verification.
