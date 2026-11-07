---
title: 'Show detail: replace Infos tab with a header'
type: 'feature'
created: '2026-11-07'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
feature_branch: 'feat/17-46-detail-spectacle-remplacer-infos-par-un-bandeau'
baseline_commit: '1bb79faa3214e118fb22a034275e67c98b624973'
context:
  - '{project-root}/docs/v2/technical/FRONTEND_UI.md'
  - '{project-root}/_bmad-output/planning-artifacts/ux-design-pill-tab-bar.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Show details currently occupy an Infos tab, making the other show views less direct to access.

**Approach:** Remove Infos and introduce the approved agenda-card-inspired header above the existing tabs. Keep the existing app-bar title without repeating it in the header; put the edit pencil next to the administration gear in the app bar. Use one redesigned event edit form for general information, format and category.

## Boundaries & Constraints

**Always:** The header shows date and time with a calendar-export action, location, composition status and its explanatory help, format without player count, and category name only for a non-default category. Do not show the agenda participation cell. The pencil is shown only to authorized organizers/admins, adjacent to the gear, and opens the unified form; preserve each field’s current authorization. Preserve access to existing show information and authorized actions, including organizers, location navigation, description and troupe/season navigation; do not assume their removal. Preserve existing permission checks, scoped navigation, and compatible links. The Activity tab remains restricted according to existing permissions; some users therefore see only Dispos and Équipe. Maintain French UI and mobile-first Material 3.

**Never:** Grant event organizers troupe-administration rights, access to unrelated events or permission to change general event fields or category; do not change the global navigation or the scope of Activity visibility.

**Approved permission decision:** An organizer authorized to manage this event’s composition may update its format and template role slots without troupe-management rights. Restrict the server exception to those fields and this event; reject mixed unauthorized updates atomically. Preserve existing permissions for all other fields and users. Add server tests for authorized and unauthorized callers, other events, and mixed payloads.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Show loaded | Authorized member | Header above Dispos and Équipe; Activity only when authorized | Loading and unavailable event retain existing handling |
| Old link | `?tab=infos` or default URL | Open a valid remaining tab; no blank view | Preserve other existing deep-link flags and aliases |
| Existing details | Missing venue or description, invalid date, or denied management permission | Show appropriate existing empty/disabled states; prevent unauthorized actions | Preserve existing errors and retry behavior |
| Navigation | Rapid tab changes and slow data responses | Header data and current tab stay coherent | Ignore stale responses and retain usable tabs on failure |

</frozen-after-approval>

## Code Map

- `apps/web/src/app/pages/event-detail/event-detail.html`, `.ts`, `.scss`: title and draft banner, capsule tabs, permissions, lazy page bootstrap; remove Infos tab without making Dispos or Équipe wait on its request.
- `apps/web/src/app/pages/event-detail/event-infos-tab.{html,ts,scss}`: existing description, calendar/map menus, format/roles, organizer and category management, troupe/season links; preserve their conditions and updates.
- `apps/web/src/app/core/events/event-detail-tabs.ts`: URL aliases and default selection; preserve legacy flags and handle old Infos links. `EventPageTab` API contract still includes `infos` and is separate from visible tabs.
- `apps/web/src/app/shared/participation/agenda-event-card.html` and `apps/web/src/styles/_hatcast-agenda-event-card.scss`: reference for the date column, details and status. The participation cell is excluded.
- `apps/web/src/app/pages/season-home/event-form-dialog.{html,ts,scss}`: existing edit form. Add format and category while retaining validation and publication behavior. `event-type-roles-dialog.{html,ts}` defines format preset application and warning; preserve the existing replacement semantics and assigned-person safety. `event-infos-tab.ts` handles category permissions and glossary.
- `apps/web/src/app/pages/event-detail/event-detail.spec.ts`, `event-infos-tab.spec.ts`, `core/events/event-detail-tabs.spec.ts`, and relevant `apps/web/e2e/` helpers: cover navigation, loading, permissions and moved interactions.
- `_bmad-output/planning-artifacts/epics.md`: move 17.46 from the Epic List summary to the detailed Epic 17 section; update affected UX/normative documentation to reflect the approved behavior.

## Tasks & Acceptance

**Execution:**
- [x] `apps/web/src/app/pages/event-detail/` — implement the approved header and destination for existing details; retain access checks and update propagation.
- [x] `services/api/src/main/kotlin/com/hatcast/api/event/EventService.kt` and its tests — enforce the approved event-scoped format-only authorization without granting general edit rights.
- [x] `apps/web/src/app/core/events/event-detail-tabs.ts` and event-detail bootstrap — update tab defaults and compatibility while retaining independent loading and stale-response protection.
- [x] `apps/web/src/app/pages/event-detail/*.spec.ts`, `apps/web/src/app/core/events/event-detail-tabs.spec.ts`, and relevant E2E — verify the matrix, access conditions, and moved interactions.
- [x] `_bmad-output/planning-artifacts/epics.md`, affected UX docs and normative source — correct placement and describe the resulting behavior; record visual and accessibility verification.

**Acceptance Criteria:**
- Given a visible show, when its page loads, then Infos is absent, the header precedes the remaining tabs, and each remaining tab respects current permissions.
- Given an authorized organizer, when managing show details, then existing allowed actions and their resulting updates remain reachable.
- Given a member using keyboard or a screen reader, when using the header and details, then controls have meaningful French names, visible focus and logical focus order.

## Acceptance Criteria — Material 3 (UI)

- Given a control in scope, when Material provides its equivalent, then use Material components; retain the capsule tab mixin and use theme tokens (UX-DR11).
- Given a viewport at or below 480px, when the header and details are used, then content remains readable without overlap and controls target 48×48 dp where applicable; verify desktop too.
- Given implementation complete, when checking `FRONTEND_UI.md`, then document applicable results and any waived items.

## Implementation Notes

Implemented the compact header and accessible supplementary-information dialog, the unified form, scope-limited server permission and backward-compatible tab routing. The pre-existing lifecycle tracker remains controlled by `story-branch.sh`; its status is not a delivery decision.

## Spec Change Log

## Review Triage Log

- Medium, fixed: a format-only organizer could submit an empty PATCH; no-change and publication paths now avoid that request.
- Medium, fixed: cancelling the return-to-draft confirmation after the PATCH could leave silent persisted edits; confirmation now precedes mutations.
- Medium, fixed: the default category label was hardcoded; the troupe glossary now supplies it.
- Medium, fixed: guest workspaces could not fetch category labels through the troupe-member endpoint; event-page Infos bootstrap now supplies them with retry and stale-response protection.
- Medium, fixed: tests manipulated select state directly; tests now exercise the Material controls and check the submitted payload.
- False: an additional confirmation dialog for preset replacement is not required by the approved design; the form warns about replacement and Enregistrer explicitly applies it.
- Medium, fixed: moving the team status initially removed detailed statuses and organizer guidance; these now appear in the header help without a duplicate team badge.
- Medium, fixed: the first implementation placed the information panel between the banner and tabs and omitted month/year from the compact date; a dedicated dialog preserves access and the full date is shown.

## Design Notes

The user approved the header and unified form, with the edit pencil beside the app-bar gear. The exploratory mockup simplified tabs and their contents; it is not a design specification for those contents. The edit form places title, date/time, location and description before format and category; changing the format previews its preset and warns before replacing existing needs. Other existing functions must remain discoverable with appropriate permissions.

## Verification

- Six targeted Angular suites: 256 tests passed after the final visual corrections.
- Server integration: event-scoped organizer format authorization, mixed-payload refusal, other-event refusal, member denial and administrator behavior passed; two assignment/reconciliation scenarios passed.
- Isolated Playwright: member setup plus one 17.46 journey passed; mobile and desktop banner and mobile details dialog inspected. This targeted run does not replace the story lifecycle's independent E2E attestation or human smoke.
- Material 3: Material controls and dialog, theme tokens, keyboard calendar interaction, mobile/desktop layout verified; no checklist waiver identified.

- Run focused unit tests for tab routing, show details, and permission/bootstrap behavior; run relevant isolated Playwright coverage and report its actual selection.
- Inspect mobile and desktop layouts, keyboard navigation and accessible names; retain evidence for the HatCast story delivery workflow.
