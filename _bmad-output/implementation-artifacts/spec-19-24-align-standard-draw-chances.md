---
title: 'Align standard draw chances at La Malice'
type: 'feature'
created: '2026-11-14'
status: 'done'
baseline_commit: '99c2b81e1b9461598c5747858b99b4d6b2e6f930'
route: 'dispatch'
review_loop_iteration: 0
context: ['SPEC.md', 'DOMAIN.md', 'docs/v2/technical/draw-formulas-policies-spec.md']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

La Malice wants its Aperocks to be ordinary shows and its live draw estimates to reflect the selections known now. Use the existing category and policy controls and the standard formula.

## Boundaries & Constraints

- La Malice's only active formula is V1 standard. Ordinary shows include former Aperocks. CCAS and travel each keep their existing category and selection history.
- Live estimates use the other validated shows in the same season and category, by participant and role, including shows yet to occur. Declined assignments and archived events stay excluded. Use the current approximation and present the result as an estimate in the existing chance detail.
- Preserve stored draw snapshots and past compositions. Chance details always show the current estimated percentage and its current explanation. When available, also show the percentage and date recorded at selection, clearly separated from the current estimate. Keep the other troupes' configuration. No new history groups, historical data rewrite or formula page. An additive schema migration is authorized for selection-time evidence.
- Production reclassification and policy changes require separate explicit authorization.

</frozen-after-approval>

## Code Map

- `TroupeCategoryService.deleteCategory` and `EventRepository.clearCategoryForTroupe` reclassify current events through the existing category removal operation. Legacy travel uses the template fallback, so verify the affected events are ordinary templates.
- `DrawPolicyService` and `DrawPolicyResolutionService` own troupe and season formula rules. `DrawFormulaService.archive` refuses formulas still referenced by a policy.
- `SelectionHistoryModeResolver`, `CategoryCompartmentHistoryScope` and `EventCompositionSlotRepository` already include future validated selections in operational mode. `AvailabilityService` uses retrospective mode for past events and can read stored snapshots.
- Existing Dispos and composition chance detail are the UI surfaces to verify. Read `docs/v2/technical/FRONTEND_UI.md` before any user-visible edit and use the Material 3 checklist if an edit is needed.

## Tasks & Acceptance

**Execution:**
- [x] In the existing 19.24 worktree, reconcile the baseline with local `v2` and preserve the three tracker entries via the HatCast workflow.
- [x] Verify policy update, category removal and formula archival using targeted integration tests and the staging rehearsal. Production configuration was subsequently changed with explicit authorization.
- [x] Verify the existing French chance detail and projection wording through targeted tests and the approved mobile demonstration. No separate English UI copy exists for this component.
- [x] Prepare a reversible operations checklist listing the precise policy and event changes, rollback data, and checks before and after the change. Keep production read-only during the story.

**Acceptance Criteria:**
- Given a La Malice Aperocks fixture, when the existing category removal is applied, then its events count as ordinary, with their original compositions. CCAS, travel and another troupe keep their original histories.
- Given the standard-only policy and a live estimate, when another ordinary show is validated, then its same-role selections enter the estimate and the draw regardless of the other show's date. Given a later decline, composition change or availability update, the next live calculation reflects the current inputs.
- Given a selected participant with a recorded value, when the detail opens, then the current estimate and its explanation are shown separately from the recorded value and its date. The recorded value is not explained using current factors.
- Given a new manual or draw selection, when it succeeds, then record the estimate and time associated with that selection. Existing draw-opening snapshots are identified as estimates recorded at draw opening and are never represented as exact step odds. If an older date or selection value is unavailable, do not invent it.
- Given a replacement, removal, redraw or retry, when the composition changes, then the displayed recorded value refers to the current assignment and does not incorrectly reuse a previous assignment’s value.
- Given a member opening the existing detail, then the percentage is identified as an estimate and the role and selection scope can be understood.

## Implementation Notes

- Closure verification on 2026-11-16: 91 targeted API tests and 113 Angular tests passed. The mobile demonstration was accepted. A privacy regression found in review was fixed and covered by an integration test.
- Staging rehearsal and the authorized production configuration change reclassified nine Aperocks and retained CCAS and travel. Caprani percentages were compared in the production interface. The application code in this story remains local until separately released.

- Local v2 was merged at `99c2b81e`; stories 6.25 and 19.23 remain done. The tracker controller set 19.24 to in-progress.
- Category, draw policy, formula and availability integration tests passed. The added repository scenario exercises ordinary history after category removal and after a decline.
- The live chance sheet shows role and adjustments and labels its final value as an estimate. The 14 targeted Angular tests passed. A manual mobile check remains outstanding.
- Superseded on 2026-11-15: the user requested both the current detailed estimate and the recorded selection value with its date. The current local snapshot-only implementation must be revised. Manual selections do not yet record a value and legacy draw snapshots represent draw opening, not necessarily selection-step odds.
- See [the production operations draft](19-24-la-malice-operations.md).

## Spec Change Log

- 2026-11-15: User requested the current detailed estimate at all times plus the recorded percentage and date at manual or draw selection. Existing implementation must be revised. UI proposal was approved by Patrice.

## Review Triage Log

## Acceptance Criteria — Material 3 (UI)

- Given a recorded percentage, when the shared Material dialog or bottom sheet opens, then the value and its source are readable and the standard close action remains available.
- Given a live estimate, when the existing detail opens, then the role, factors and estimated value remain visible.
- UX-DR11: reuse the existing overlay, styles and controls. Navigation and theming changes are out of scope. Template tests cover both paths. Verify small-screen rendering during manual QA.

## Verification

Verify category removal, policy resolution, operational history, decline handling and stored snapshots with the targeted API suite. Verify the existing Dispos and composition detail on a local stack where touched.
