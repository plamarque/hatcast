---
title: 'Recover stale composition state after unlock conflict'
type: 'bugfix'
created: '2026-10-22'
status: 'done'
route: 'oneshot'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The CCAS screenshot reports an unlock conflict saying the composition is not validated while the screen still offers unlock. The component retains its obsolete locked composition after an HTTP 409, so repeated clicks cannot recover. The supplied activity-journal screenshot confirms Nicolas unlocked at 15:42:35 after Patrice loaded the locked composition and before Patrice's first rejected unlock.

**Approach:** After an unlock conflict, fetch the authoritative composition and synchronize the existing child/parent state. If the fresh composition is a draft, explain that it is already unlocked and expose draft actions; otherwise retain the original error. Preserve assignments, participation statuses, server authorization, and the documented API conflict contract. A failed refresh must remain an error. Do not deploy, push, commit, or integrate this change without the user's separate authorization.

</frozen-after-approval>

## Implementation Notes

- Intent gaps: none; recovery follows existing validatedAt-based action eligibility. Irreversibles: none. Footprint: event-equipe-tab.ts and its regression tests, plus issue registry and this artifact.
- Code map: unlock() currently leaves composition unchanged on 409; applyCompositionUpdate() emits compositionPublished so EventDetail.syncCompositionFromEquipe() updates parent and lifecycle badges. Reuse both existing API getComposition() and state propagation. Do not change the backend lifecycle or API contract.
- Given a locally locked composition and an unlock conflict, when a fresh read returns a draft, then synchronize that response without losing assignments or statuses and show draft actions. If the read returns a locked composition, preserve the error and synchronize that state. If the read fails, preserve the error without claiming success. Ignore results belonging to a different season/event. Keep the interaction blocked during the recovery read.
- Material 3: existing Material controls, layout, tokens, and French snack-bar feedback are reused; no visual styling or navigation changes.

- Implemented recovery in `event-equipe-tab.ts` with `unlocking` held through the authoritative read and released in `finally`. Guard both response boundaries by season/event identity and component lifetime. Synchronize an absent composition, but retain its error rather than acknowledging an unlock.
- Added focused regression coverage in `event-equipe-tab.spec.ts` and a real parent/child integration test in `event-detail.spec.ts` checking composition state, lifecycle and badge updates. Tests include published and organizer-only drafts, no composition, unchanged locked state, failed refresh, other POST failures, double click, navigation and destruction.
- Updated BUG-045 in `ISSUES.md`. No server code, schema, assignments or participation statuses are mutated by the recovery read. The original integration checkout remains clean; work is isolated on `feat/bug-045-composition-unlock` from canonical baseline `4319478f6e73b16b116103d6ebb3399f6f812701` (the local integration branch contains ten commits beyond the existing origin/v2 reference).
- Material 3 self-check: existing Material actions and French snack bars reused; no styling, touch targets, focus behavior, dialogs, navigation or responsive layout changes. Real-device visual verification remains pending.

## Review Triage Log

| Finding | Verdict | Evidence and disposition |
| --- | --- | --- |
| A response can outlive the child after switching away from Équipe. | medium — patched | The real template condition destroys the child on tab change. DestroyRef guards now discard both pending POST and refresh responses; two destruction regressions pass. |
| A missing composition must not be presented as already unlocked. | low — patched | The server also returns 409 when no composition exists; visibility none is synchronized without success feedback. Regression asserts the original error and removal of obsolete unlock. |
| Parent stub alone does not prove lifecycle and badge synchronization. | low — patched | Added real EventDetail host test invoking the real child action and asserting parent composition, draft lifecycle, preparation badge, and no redundant event-page reload. |
| Organizer-only draft recovery lacked coverage. | low — patched | Regression covers publishedAt null / organizerDraft, draft actions restored, and no publish/validate calls. |

## Verification

- Before the fix, the 13-case recovery test group had nine failures and four passes: the missing refresh and season identity guard were reproduced.
- Final `npm run test -w @hatcast/web -- --watch=false --include=src/app/pages/event-detail/event-equipe-tab.spec.ts --include=src/app/pages/event-detail/event-detail.spec.ts`: **158/158 passed** (18 new cases).
- Final `npm run build -w @hatcast/web`: passed. Existing Sass deprecation warnings and unrelated account/troupe component style-budget warnings remain.
- `git diff --check`: passed.
- Backend tests were not rerun because the backend is unchanged. No browser/phone smoke, production incident replay, deployment, push, integration or commit was performed. Human smoke remains a separate pending check.

- Independent follow-up review confirmed all four findings addressed, with no remaining findings on the corrections. Implementation is complete; human smoke and any version-control/release actions remain separately pending.

- Follow-up investigation: inspected the user-supplied production replay in PostHog and verified the reported release against Git revision c93d2c81. Three recorded unlock requests all return 409, with no successful unlock or recovery GET in this session. Initial Équipe page GET is recent (about 85 seconds before first click), so the hypothesis of an old retained screen alone does not establish the initiating cause. See BUG-045 for timings and limitations. Patrice confirmed the local two-tab scenario works; exact production root cause remains open. No further production-code edits made during this investigation.

- Nicolas comparison: the supplied later recording (start 16:49:16 Paris) is on the same event and contains spectacle publication and composition validation at 00:46/00:49; the visual replay shows an editable draft before validation, and no unlock request is recorded. The preceding linked session shows login/workspace only. This narrows the reported successful action to publication of an already editable composition; the initial cause of Patrice's desynchronization is still unproven. No production code changed.

## Local closure — 2026-10-22

- Patrice supplied the activity journal: Nicolas unlocked at 15:42:35, between Patrice's Équipe load (~15:42:09) and first rejected unlock (~15:43:37). This resolves the initial uncertainty recorded chronologically above. The later journal entries confirm Nicolas's edits and validation at 16:50:03.
- Patrice confirmed the two-tab phone test works, then explicitly accepted the concurrent-edit recovery and authorized closure. Human acceptance is complete; no new production source changes followed the passed checks.
- Tracking: this is an ad hoc BUG-045, not an epic story with a canonical sprint key. This spec is already done and the authoritative ISSUES entry is now closed locally; no sprint-status mutation or invented story key is needed.
- Scope of approval: story-only commit, local integration into v2, verification and owned runtime/worktree/branch cleanup. No push, deployment or remote branch deletion is authorized.
