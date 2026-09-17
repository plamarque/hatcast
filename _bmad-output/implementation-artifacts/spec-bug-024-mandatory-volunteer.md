---
title: 'Make volunteer availability mandatory when offered'
type: 'bugfix'
created: '2026-09-17'
status: 'done'
review_loop_iteration: 0
feature_branch: feat/fix-availability-mandatory-volunteer
baseline_commit: aaf7dbb4c6e2da395e9baeb4c91e2dec03b28a6c
dependency_commit: 531256812b212a3145085236302169b857daf924
context:
  - '{project-root}/docs/v2/technical/FRONTEND_UI.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Available participants can remove volunteer availability, and only player selection triggers automatic volunteer inclusion. The explanatory paragraph is remote from its control and describes the wrong scope.

**Approach:** For events offering volunteer, make it the mandatory baseline of every new available response. Keep other roles optional, support volunteer-only responses, and explain the locked selection next to its control with touch and keyboard support. Enforce the same invariant on the server.

## Boundaries & Constraints

**Always:** Preserve the BUG-021 checkbox layout, explicit unified save, cancellation and error recovery. Enforce the rule for self and proxy writes and both dialog and poll. Preserve permissions, archived/read-only behavior, French copy and Material 3. Existing historical empty-role records retain their wildcard eligibility until explicitly replaced by a saved user response.

**Confirmed scope (2026-09-17):** Apply the mandatory rule only when the event offers volunteer (positive volunteer slots), including volunteer-only events. No optional role needs to be selected to trigger it. Events without volunteer keep existing choices; events without roles keep general availability. The user explicitly confirmed this boundary.

**Ask First:** Expanding volunteer beyond configured event roles, changing historical candidacy, or changing role configuration and assignment.

**Never:** Bulk-migrate records, silently mutate on read/open/cancel, modify account role preferences, write sprint-status.yaml, alter the other worktree, deploy, push or integrate.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| New response | Dispo, volunteer offered | Volunteer checked immediately; other roles optional | Draft saved only by existing submit |
| Volunteer only | No optional roles checked | Valid available response with volunteer | Remains selected after optional roles removed |
| Attempt removal | Tap/click/keyboard on locked volunteer | Selection unchanged; accessible explanation | No opt-out payload |
| Other role | Any offered role selected | Volunteer remains selected | Existing invalid-role validation retained |
| Direct API | AVAILABLE with optional role or empty roles; applyVolunteerRule=false | Server includes volunteer when offered | No client-controlled exemption |
| Other status | Unavailable or unknown | Persist empty roles | Existing status behavior preserved |
| No volunteer | Positive slots for other roles only | Existing role-selection validation | Do not invent volunteer |
| No roles | All slots zero | General availability allowed | No invented role |
| Historical response | Stored AVAILABLE with [] | Read/draw semantics remain wildcard; explicit editor save replaces draft only | No migration or mutation on open/cancel |
| Existing opt-out | Stored optional roles without volunteer | Editable available draft includes volunteer; persisted record changes only on save | No false saved-state indication |

</frozen-after-approval>

## Code Map

- Dependency `531256812b212a3145085236302169b857daf924` contains BUG-021's tested checkbox dialog and server validation; current origin/v2 lacks it. Inspect and incorporate its committed changes into this unit before implementation, preserving the other worktree and its smoke artifacts.
- `apps/web/src/app/shared/availability/availability-form.{ts,html,scss}`: draft initialization, toggleRole, opt-out state and player hint. Use the dependency version, not the old chip selector.
- `apps/web/src/app/core/availability/availability-role-rules.ts`: player-only normalization, candidate-role filtering; distinguish write normalization from historic reads.
- `apps/web/src/app/shared/availability/availability-poll.{ts,html}` and `availability-vote.utils.ts`: autosaved role votes and independent opt-out. Preserve an explicit route back to unknown/unavailable while locking volunteer for available votes.
- `services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityRoleRules.kt` and `AvailabilityService.kt`: common self/proxy write normalization; isCandidateForRole implements historical wildcard.
- `services/api/src/main/kotlin/com/hatcast/api/availability/dto/AvailabilityDtos.kt`, `apps/web/src/app/core/availability/availability-api.service.ts`, `services/api/openapi/availability.yaml`: legacy applyVolunteerRule request contract.
- `DOMAIN.md`, `SPEC.md`, `_bmad-output/planning-artifacts/prd.md:478`, `epics.md:1036`: document authorized rule replacement without changing historical artifacts' frozen intent.

## Tasks & Acceptance

**Execution:**
- [x] Incorporate the committed BUG-021 dependency in the dedicated branch; reverify worktree assertion and inspect overlapping changes.
- [x] `availability-role-rules.ts`, `AvailabilityRoleRules.kt`, `AvailabilityService.kt`: normalize available writes to include offered volunteer regardless of optional roles or legacy opt-out flag; preserve invalid-role errors and historical reads.
- [x] `availability-form.*`: establish volunteer in available drafts, lock removal, remove player-only hint and opt-out state; preserve unified submit/cancel.
- [x] `availability-poll.*`, `availability-vote.utils.ts`: maintain the same write invariant and clear status transitions without accidental availability when clearing a response.
- [x] API DTO/client/OpenAPI files: retain wire compatibility for the old flag while documenting that it cannot bypass the mandatory rule.
- [x] `DOMAIN.md`, `SPEC.md`, PRD, epics and `ISSUES.md`: reconcile the obsolete opt-out contract and record the factual correction.
- [x] Adjacent form/poll/helper tests, `AvailabilityRoleRulesTest.kt`, `AvailabilityControllerIntegrationTest.kt`: cover the matrix including self/proxy, errors, historical reads and direct false-flag requests.
- [x] `apps/web/e2e/recette-agenda-participation-cell.spec.ts`: cover volunteer-only save/reopen, all optional-role families, removal attempts, cancel, and accessible explanation.

**Acceptance Criteria — Material 3 (UI):**
- Given an available draft, when viewing volunteer, then the checked and locked state is understandable without color alone.
- Given touch or keyboard use, when activating the adjacent volunteer help, then it explains “Quand tu es disponible, tu es aussi disponible comme bénévole.” without changing selection; hover must not be the only access.
- Given a 360px viewport or desktop, when editing, then controls retain usable focus, 48px touch targets and no horizontal clipping.
- Given a failed save, when the server rejects or cannot respond, then the draft is preserved and no success is reported.

## Spec Change Log

## Design Notes

Use a disabled checked Material checkbox plus an adjacent accessible help trigger; a disabled checkbox alone cannot receive the tap required to explain the rule. Preserve historical read semantics separately from the editable draft and explicit write normalization. No new persistent event flag is needed.

## Verification

- Target Angular suites with `npm run test -w @hatcast/web -- --watch=false --include=PATTERN`, then production build.
- Run `./gradlew test --tests '*AvailabilityRoleRulesTest' --tests '*AvailabilityControllerIntegrationTest'` in isolated test configuration.
- Discover existing Playwright selection and inspect runtime readiness before isolated E2E; use repository evidence workflow, no implicit browser installation or development-server reuse. Parse persisted attestation before requesting human smoke.
- Review mobile light/dark, keyboard/help, saved reopen, cancellation, proxy and status transitions. Run `git diff --check` and integrated review before completion.

## Suggested Review Order

**Mandatory write invariant**

- Include offered volunteer for every available write, without client opt-out.
  [AvailabilityRoleRules.kt:13](../../services/api/src/main/kotlin/com/hatcast/api/availability/AvailabilityRoleRules.kt#L13)

**Editable availability draft**

- Normalize editable drafts while preserving saved historical records until explicit submission.
  [availability-form.ts:221](../../apps/web/src/app/shared/availability/availability-form.ts#L221)

**Locked checkbox and help**

- Keep volunteer selected and explain the rule through an accessible adjacent control.
  [availability-form.html:55](../../apps/web/src/app/shared/availability/availability-form.html#L55)

**Serialized poll writes**

- Prevent concurrent votes, comment saves and response clearing.
  [availability-poll.ts:122](../../apps/web/src/app/shared/availability/availability-poll.ts#L122)

**Regression evidence**

- Exercise mobile light/dark, keyboard help and persisted volunteer-only responses.
  [recette-agenda-participation-cell.spec.ts:267](../../apps/web/e2e/recette-agenda-participation-cell.spec.ts#L267)
