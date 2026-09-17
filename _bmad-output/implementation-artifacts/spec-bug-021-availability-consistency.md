---
title: 'Make availability selection explicit across home and agenda'
type: 'bugfix'
created: '2026-09-17'
status: 'done'
review_loop_iteration: 0
feature_branch: feat/bug-021-availability-consistency
baseline_commit: aaf7dbb4c6e2da395e9baeb4c91e2dec03b28a6c
context:
  - '{project-root}/docs/v2/technical/FRONTEND_UI.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Availability role chips obscure selection. The dialog immediately saves status but requires a separate, easily missed role save. Home renders an inert availability badge while agenda opens an editor. Empty roles historically mean eligibility for every role, increasing the consequence of an incomplete response.

**Approach:** Provide one consistent event-card interaction across Home and My agenda. Replace dialog role chips with explicit multiple-choice checkboxes and submit status, roles and comment together through one persistent action. Require an explicit role for new available submissions when the event defines roles.

## Boundaries & Constraints

**Always:** Preserve permissions, team confirmation/withdrawal behavior, volunteer rules, archived/read-only restrictions, French copy and Material 3. Preserve historical empty-role records and their existing read/draw interpretation; do not migrate data. Events without required roles retain general availability. Apply write validation to self and proxy availability endpoints. Preserve the poll's existing autosave behavior for valid votes. Keep v2 clean and work only in the dedicated unit.

**Ask First:** Changing historical eligibility, composition assignment rules or expanding the role selector redesign to account preferences.

**Never:** Infer the cause of the reported CCAS assignment as proven; silently pick a role, write sprint-status.yaml, deploy, push or integrate.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Explicit response | Available plus one or multiple event roles | Single submit saves the full response | Remain open with draft on API failure |
| Missing roles | Available, roles offered, no roles checked | No submission; explain required choice | API rejects empty roles with 400 before mutation |
| Cancel | Unsaved status/roles/comment | Dismiss discards draft; no request or optimistic saved badge | Previously persisted response remains intact |
| No role slots | Event defines no candidate roles | Available can be submitted without roles | No invented role |
| Other status | Unavailable or unknown | Explicit submit persists status with empty roles | Standard API errors remain visible |
| Legacy general response | Stored available with empty roles | No invented checks; require choice on next available submission | No data migration |
| Entry point | Same eligible event from Home or agenda | Body opens detail; badge opens same editor without navigation | Fetch failure does not masquerade as a roleless event |
| Team member | Participant already assigned | Badge opens existing participation workflow | Preserve existing permission restrictions |

</frozen-after-approval>

## Code Map

- `apps/web/src/app/shared/availability/availability-form.{ts,html,scss}`: split status/details persistence, preferred-role precheck, role draft and volunteer rules.
- `apps/web/src/app/shared/availability/availability-dialog.{ts,html}`: scrollable content, footer currently only dismisses; close currently returns draft state.
- `apps/web/src/app/shared/availability/open-agenda-availability-dialog.ts`: loads persisted response and opens editor.
- `apps/web/src/app/shared/availability/availability-moi-panel.html`: second form consumer; update obsolete autosave hint.
- `apps/web/src/app/pages/user-agenda/user-agenda.{ts,html}`: existing eligibility, dialogs and refresh logic.
- `apps/web/src/app/pages/member-home-todo/member-home-todo.{ts,html}`: duplicated card; badge lacks action inputs/outputs.
- `apps/web/src/app/shared/participation/agenda-participation-status.ts`: common status control, noninteractive by default.
- `services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityService.kt`: roleKeysForWrite is the shared self/proxy validation point.
- `DOMAIN.md`: historical empty-role semantics; preserve read compatibility while documenting new-write constraint.

## Tasks & Acceptance

**Execution:**
- [x] `shared/availability/availability-form.*`, `availability-dialog.*`, `availability-moi-panel.html`: implement draft-only editing, checkbox roles, unified submit and persistent dialog action; return saved state only and preserve error drafts. Do not silently preselect preferred roles.
- [x] `shared/participation/agenda-event-card.*`, `agenda-event-actions.service.ts` (new): extract reusable presentation and dialog actions from agenda; preserve existing metadata, status handling and event navigation.
- [x] `pages/user-agenda/user-agenda.*`, `pages/member-home-todo/member-home-todo.*`: consume shared card/actions; refresh each parent's data after saved changes and prevent badge-click navigation.
- [x] `AvailabilityService.kt`, `services/api/openapi/availability.yaml`: validate nonempty normalized roles for available writes when roles exist; document 400 behavior and retain other validation errors.
- [x] `DOMAIN.md`, `SPEC.md`, `docs/v2/technical/FRONTEND_UI.md`, `ISSUES.md`: document the authorized interaction/write changes and factual issue resolution; update contradictory availability UX descriptions.
- [x] Adjacent form/dialog/card/page specs, `AvailabilityControllerIntegrationTest.kt`, `apps/web/e2e/recette-agenda-participation-cell.spec.ts`: cover matrix including self/proxy rejection, reopen persistence, cancel and both entry points.

**Acceptance Criteria — Material 3 (UI):**
- Given multiple roles, when toggled by pointer or keyboard, then each selection has a visible check and accessible checked state independent of color.
- Given a mobile viewport, when content scrolls, then submit remains visible and controls offer 48px touch targets without clipping.
- Given either card location, when the same action is activated, then rendering and behavior follow the shared implementation.
- Given a request failure, when saving, then no success state is shown and the draft remains editable.

## Spec Change Log

## Verification

- Run targeted Angular tests with `npm run test -w @hatcast/web -- --watch=false --include=PATTERN` for changed specs, then `npm run build -w @hatcast/web`.
- Run API controller integration tests with `./gradlew test --tests '*AvailabilityControllerIntegrationTest'` using isolated test configuration; verify rejected writes leave storage unchanged.
- Inspect runtime readiness before targeted Playwright execution. Record selection/result in the repository E2E attestation workflow; do not reuse development servers or download browsers implicitly.
- Verify mobile light/dark rendering, checkbox keyboard behavior, sticky action, cancellation, and identical Home/agenda outcomes before human smoke handoff.

### Implementation evidence (2026-09-17)

See `bug-021-implementation-report.md` for changes, matrix coverage, commands, M3 checks and remaining workflow gates. API: 75/75 tests across five affected suites. Targeted Angular: 111/112 (one unchanged baseline expectation documented under LIMIT-007). Frontend production build: passed. Mobile light/dark Playwright: 12/12, including keyboard checkbox, footer visibility, cancel/reopen, both entry points and network errors. Persisted attestation: `e2e-evidence/bug-021.json` (`outcome: passed`). Post-run runtime inspection: ports 8080/4200 free, READINESS=ready. Review and human smoke remain; no push/integration/deployment.

Review patches: persisted volunteer opt-out, first-response analytics, draft status roundtrips, footer dirty hint, fresh team-focus refresh, saved agenda retention on reload failure, valid API fixtures and notification rejection, dismissal during retained PUT, and measured 48px hit targets are covered. See the report for individual evidence. Frozen intent is unchanged.

## Suggested Review Order

**Shared entry points**

- Share eligibility and dialog behavior; preserve saved state when refreshing fails.
  [agenda-event-actions.service.ts:38](../../apps/web/src/app/shared/participation/agenda-event-actions.service.ts#L38)

**Explicit draft and validation**

- Submit one complete response and require roles without changing historical reads.
  [availability-form.ts:227](../../apps/web/src/app/shared/availability/availability-form.ts#L227)

**Persistent action**

- Keep cancellation and saving visible; prevent dismissal during a pending write.
  [availability-dialog.html:1](../../apps/web/src/app/shared/availability/availability-dialog.html#L1)

**API boundary**

- Reject incomplete self and proxy responses before storage writes.
  [AvailabilityService.kt:799](../../services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityService.kt#L799)

**Behavioral proof**

- Exercise both entry points, persistence, cancellation, mobile themes and pending requests.
  [recette-agenda-participation-cell.spec.ts:100](../../apps/web/e2e/recette-agenda-participation-cell.spec.ts#L100)

**Verification record**

- Read final counts and the unchanged baseline test limitation.
  [bug-021-implementation-report.md:1](bug-021-implementation-report.md#L1)
