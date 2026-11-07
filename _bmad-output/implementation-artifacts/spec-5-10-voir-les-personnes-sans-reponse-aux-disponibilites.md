---
title: 'Story 5.10: View unanswered availability'
type: 'feature'
created: '2026-11-07'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
feature_branch: feat/5-10-voir-les-personnes-sans-reponse-aux-disponibilites
baseline_commit: 72a6d272753d49e5a394f5b414e625063b14efb7
prior_e2e_evidence: _bmad-output/implementation-artifacts/e2e-evidence/5-10-voir-les-personnes-sans-reponse-aux-disponibilites.json
context:
  - docs/v2/technical/FRONTEND_UI.md
  - _bmad-output/planning-artifacts/epics.md
  - ISSUES.md
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Members and organizers cannot readily identify participants who have not answered an event's availability request.

**Approach:** Add a compact, accessible member-visible count and expandable list of unanswered participants to the availability tab, using the current event summary. Provide organizers a compact bell-icon “Relancer” action in the panel header, before its chevron, to request a reminder for all still-unanswered eligible people after confirmation; the approved mockup is the interaction direction.

## Boundaries & Constraints

**Always:** Show the list to all viewers authorized to read the event availability, as decided by Patrice. Count participants whose summary status is `unknown`; derive names and count from the same current summary. Preserve existing event and availability authorization, event lifecycle, availability editing, and Material 3 conventions. Reading or expanding the list never sends notifications. Show the reminder action only under the same permission and lifecycle conditions as the existing “Relance dispos” action; recheck unanswered status and notification preferences server-side. Preserve existing preview freshness, double-send protection and accurate acceptance-versus-delivery messaging.

**Never:** Rebuild the complete “Tous” view, offer individual recipient selection from this new action, change availability responses, alter composition, send without confirmation, override opt-outs, or change global navigation.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Authorized viewer | One or more unknown participants | Count and expandable list show matching names | Existing summary error behavior remains |
| None | No unknown participants, including empty roster | Clear zero state | No mutation |
| Refresh | Summary changes after save or event change | List and count reflect the current summary | No additional write |
| Organizer reminder | Unknown participants and existing reminder permission | Header link opens confirmation for all eligible unanswered people; explicit confirmation requests reminders | Changed audience, no eligible channel or failed request is handled safely; no false delivery claim |
| Unauthorized viewer | No access to event availability | No access to the list or its data | Preserve existing API authorization |
| Accessibility | Keyboard, screen reader, mobile and desktop | Control exposes expanded state; names remain readable | Existing loading and error states retained |

</frozen-after-approval>

## Code Map

- `apps/web/src/app/shared/availability/event-dispos-tab.html` and `event-dispos-tab.ts`: current subject selector and summary signal; summary patches update participants after saves.
- `apps/web/src/app/pages/event-detail/event-detail.ts` and `.html`: event-detail passes the summary and existing event access context; do not gate this list on `canManageComposition`. Reuse `canRelanceDispos()` and `openRelanceDispos()` only if the resulting confirmation meets the approved all-unanswered interaction; otherwise reuse the existing share API and guards without individual selection.
- `apps/web/src/app/shared/availability/availability-tous-panel.ts`: existing Material expansion pattern; do not reuse interactive poll checkboxes for read-only names.
- `apps/web/src/app/shared/share-announce/` and `apps/web/src/app/core/share-announce/`: existing reminder preview, channel eligibility, fingerprint, dispatch confirmation and error handling; preserve their guarantees.
- `services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityService.kt`: `getSummary` already returns participant identities and unknown statuses to authorized members; preserve its existing authorization and contract.
- `services/api/src/test/kotlin/com/hatcast/api/availability/AvailabilityControllerIntegrationTest.kt` and `AvailabilityProxyAccessSeedIntegrationTest.kt`: existing member and organizer access coverage.
- `apps/web/src/app/shared/availability/event-dispos-tab.spec.ts`: existing subject switching, loading and summary patch tests.

## Tasks & Acceptance

**Execution:**
- [x] `apps/web/src/app/shared/availability/event-dispos-tab.*` — implement the member-visible list and reactive count using the existing summary.
- [x] `apps/web/src/app/pages/event-detail/` and `apps/web/src/app/shared/share-announce/` — connect the organizer-only header action to a confirmation for all eligible unanswered participants, without per-person selection; reuse existing reminder API, permission and lifecycle guards.
- [x] `apps/web/src/app/shared/availability/event-dispos-tab.spec.ts` — cover zero, one, multiple, update, event change, permission and no-write cases.
- [x] `services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityService.kt` and related integration tests — confirm existing authorization; do not alter the API contract.
- [x] `ISSUES.md` — record the limited resolution of LIMIT-009 after verification; update relevant normative documentation for the visible list and new reminder entry point.
- [x] Perform Material 3 checklist, accessibility, responsive and isolated E2E verification; create evidence and human smoke handoff per the story controller.

**Acceptance Criteria:**
- Given an authorized viewer, when the list is expanded, then the count and names match the event summary and no write or notification occurs.
- Given an organizer, when the reminder action is used, then a confirmation precedes a request limited to all currently eligible unanswered people, respecting preferences; a stale audience or failure never causes a silent send.
- Given a viewer without event access, when availability data is requested, then existing API authorization remains enforced.
- Given keyboard or touch interaction, when the control is used, then its state and names are accessible and readable at mobile and desktop sizes.

## Implementation Notes

- Implemented the approved list and organizer reminder entry; the existing preview and dispatch rules remain authoritative.
- Focused Angular suites: 101 passed; API availability access suites passed; isolated Playwright: eight passed including three authentication setups and five member/organizer journeys across mobile and desktop.
- The local human-smoke handoff runs offline; real notification delivery is not established.

## Spec Change Log

## Review Triage Log

- medium — The direct confirmation omits the existing recent-reminder date and interval, removing useful duplicate-send context; patched and covered in the confirmation.
- low — A malformed successful preview without a fingerprint cannot open confirmation and has no explanatory error; patched with a retryable error.
- medium — The original browser evidence used an administrator only; added a scoped-organizer project to verify the same action under event-level permissions.
- medium — The cancellation browser scenario did not observe notification requests; it now asserts that no dispatch POST occurred.
- medium — The all-recipient dispatch test only used one eligible person; added multi-recipient and opt-out coverage.
- medium — The new path lacked a 409 stale-preview regression; a fresh-preview and renewed-confirmation test was added.
- medium — Initial browser coverage used only mobile; desktop member and organizer projects were added.
- medium — Verification-gap independently confirmed that cancellation lacked a no-dispatch assertion; the browser scenario now observes dispatch requests.

## Verification

- Run focused Angular availability component tests and the relevant API authorization tests if API behavior changes.
- Run the applicable build and isolated targeted Playwright evidence; verify organizer and ordinary-member access and mobile layout.
