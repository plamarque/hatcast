---
title: 'Composition publish flow'
type: 'feature'
created: '2026-10-14'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
baseline_commit: '4765ae1545d612f50236f39dff704dd09f96c5ee'
context:
  - 'docs/v2/technical/FRONTEND_UI.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Organizers can validate a draft composition without immediately reaching the announcement dialog, so the common publication flow is easy to misunderstand and drafts may be communicated instead.

**Approach:** Replace the draft composition's **Valider** call to action with **Publier**. It validates the composition and, only after a successful validation, opens the existing **Annoncer la compo** dialog. If the dialog is dismissed, the composition remains validated and the normal **Annoncer la compo** action remains available for a later announcement.

## Boundaries & Constraints

**Always:** Reuse the existing validation API, state refresh, analytics event, announcement dialog, recipient transparency, and Material 3 button/dialog patterns. Keep the current organizer-only permission checks, busy state, validation error handling, draw/share actions, and delayed announcement action unchanged. A successful validation must complete before the dialog opens.

**Never:** Do not add an API endpoint, alter validation side effects or notification rules, auto-send an announcement, change the event publication flow, or reopen the draft state when the announcement dialog is cancelled.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Publish draft | Organizer, editable composition with at least one assigned slot | **Publier** is the primary action; validation succeeds, state becomes validated, then the existing composition announcement dialog opens with the validated roster and timestamp. | Existing busy affordance blocks duplicate actions while validation is in flight. |
| Validation fails | Same draft, API returns an error | No dialog opens; draft state remains displayed and the existing validation error toast is shown. | Reuse current error mapping. |
| Dismiss announcement | Successfully validated composition; dialog is closed without sharing/notifying | Composition stays validated; **Annoncer la compo** is available for a later manual action. | No rollback or extra dispatch. |
| Already validated | Organizer views a validated composition | **Annoncer la compo** remains the primary delayed-announcement action; **Publier** is absent. | Existing permissions and busy disabling apply. |

</frozen-after-approval>

## Code Map

- `apps/web/src/app/pages/event-detail/event-equipe-tab.ts` -- owns the server validation transition, validated-state update/analytics/toast, and `openShareDialog('composition')`; compose them only after validation success.
- `apps/web/src/app/pages/event-detail/event-equipe-tab.html` -- renders the sticky action toolbar, draft lead copy, Material button variants, and `data-testid` hooks.
- `apps/web/src/app/core/composition/composition-equipe-actions.ts` -- centralizes action ids, labels, primary-action selection, and toolbar grid ordering; rename the draft action presentation to publish while retaining validated announcement behavior.
- `apps/web/src/app/core/composition/composition-equipe-actions.spec.ts` -- verifies action layout, labels, and primary state matrix.
- `apps/web/src/app/core/composition/composition-equipe-status.ts` and `.spec.ts` -- own draft guidance that currently refers to **Valider**; align it with the publish action without changing validated-state guidance.
- `apps/web/src/app/pages/event-detail/event-equipe-tab.spec.ts` -- has validation, busy-overlay, Material styling, and dialog mocks; extend it for success, API failure, and dismissed-dialog behavior.
- `apps/web/e2e/e1/orga-composition.desktop.spec.ts` -- existing organizer smoke locates the draft validation action; keep its user-facing assertion aligned if it covers this toolbar.
- `SPEC.md` -- documents the draft-zone action semantics; update its composition draft action wording to state the direct publish-to-announce flow.

## Tasks & Acceptance

**Execution:**
- [x] `apps/web/src/app/core/composition/composition-equipe-actions.ts` and `composition-equipe-actions.spec.ts` -- model **publish** as the draft action label and primary toolbar action while preserving **announce** for validated compositions.
- [x] `apps/web/src/app/pages/event-detail/event-equipe-tab.ts` and `.html` -- run the existing validation path from **Publier**, then open the existing announcement dialog only on success; update draft guidance and accessible/test hooks without duplicating the dialog contract.
- [x] `apps/web/src/app/core/composition/composition-equipe-status.ts` and `.spec.ts` -- make organizer draft guidance refer to **Publier** rather than the retired validation CTA.
- [x] `apps/web/src/app/pages/event-detail/event-equipe-tab.spec.ts` -- cover publish success, validation failure without dialog, post-dismiss validated state, and Material 3 primary/secondary controls.
- [x] `apps/web/e2e/e1/orga-composition.desktop.spec.ts` -- update any affected user-visible draft-action expectation.
- [x] `SPEC.md` -- align the normative composition draft-zone description with the delivered organizer flow.

**Acceptance Criteria:**
- Given an authorized organizer and a draft composition with an assigned participant, when they view Équipe, then **Publier** is the only validation/announcement CTA for that draft and is the Material primary action.
- Given that organizer clicks **Publier**, when validation succeeds, then the composition state is updated and the existing **Annoncer la compo** dialog opens using the validated composition data.
- Given validation fails, when **Publier** completes, then no announcement dialog opens and the existing validation error feedback is shown.
- Given the organizer dismisses the announcement dialog after a successful publish, when the toolbar updates, then the composition remains validated and **Annoncer la compo** can be used later.
- Given a validated composition, when an authorized organizer views Équipe, then **Annoncer la compo** remains available and **Publier** is not rendered.
- Given the action toolbar on a mobile viewport, when the draft or validated state is shown, then controls use Angular Material buttons, French accessible labels/copy, and the existing busy state prevents duplicate invocation.

## Implementation Notes

- Reused `validateComposition` for the server transition; the UI-only `publish()` method applies the successful response before opening the existing composition announcement dialog.
- The dialog close has no state callback, so dismissal naturally preserves the validated composition and its delayed **Annoncer la compo** action.

## Review Triage Log

| Finding | Verdict | Evidence and route |
|---------|---------|--------------------|
| Blind hunter: dismissal was not tested | medium | Real coverage gap for a stated matrix row; patched by closing the mocked dialog, asserting the validated announcement action, and reopening it. |
| Blind hunter: E2E does not identify/dismiss the dialog | false | The extended unit test verifies the composition dialog payload, close path, and delayed action; the matrix does not require redundant browser coverage. |
| Blind hunter: `suppressValidateCtaInGuideline` retained obsolete vocabulary | low | Real developer-facing inconsistency; patched by renaming the interface property and its caller/tests to `suppressPublishCtaInGuideline`. |
| Blind hunter: fallback errors say validation after clicking publish | medium | Real user-visible mismatch when no API message is returned; patched with publish-specific fallback copy while retaining server-provided messages. |
| Blind hunter: success snackbar may compete with the dialog | false | The existing success toast remains intentionally preserved after the immediate dialog open; no evidence shows it blocks the dialog or contradicts the approved flow. |
| Blind hunter: draft test did not exclude an announcement CTA | low | Real regression-coverage gap; patched with an explicit draft DOM assertion that **Annoncer la compo** is absent. |
| Verification gap: dismissing the publish dialog was not verified | medium | Same verified gap as the blind-hunter dismissal finding; patched by exercising close and delayed re-announcement in the component test. |

## Verification

**Commands:**
- `cd apps/web && npx ng test --watch=false --include=src/app/core/composition/composition-equipe-actions.spec.ts --include=src/app/core/composition/composition-equipe-status.spec.ts --include=src/app/pages/event-detail/event-equipe-tab.spec.ts` -- passed: 105 tests.
- `cd apps/web && npm run build` -- passed: Angular production build succeeds.
