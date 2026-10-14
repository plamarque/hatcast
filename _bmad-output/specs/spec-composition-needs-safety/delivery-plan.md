# Corrective patch delivery plan — safe changes to composition needs

## Classification and sequencing

This corrective work is now a **safety dependency** of Epic 22, not a standalone organizer workflow. The visible symptom crosses event editing, composition state, authorization-specific projections, notifications, and audit rendering. Preserve the server safety contract before replacing the organizer UI.

| Order | Proposed story | Outcome | Depends on |
|---|---|---|---|
| 1 | **CN-1 — Reconcile assignments after needs change** | Retained safety capability: preserve assignments outside changed needs and produce member-safe projections. | SPEC CAP-1, CAP-2 |
| 2 | **CN-2 — Explain and regularize impacted selections** | **Superseded.** Its separate organizer regularization UI is replaced by Epic 22 slot editing in Équipe. | Epic 22 |
| 3 | **Epic 22 — Flexible composition slots** | Move format and slot editing to Équipe; apply templates safely; permit arbitrary slot creation and explicit structural deletion. | CN-1; SPEC CAP-1, CAP-2, CAP-4 |
| 4 | **CN-3 — Notify removals from a visible composition** | Re-scope after Epic 22: decide notifications for an explicit deletion of an assigned structural slot, not merely Hors modèle retention. | Epic 22; SPEC CAP-3 |

## Existing integration points to preserve

- `EventService.update` already records an `EVENT_UPDATED` audit snapshot containing `roleSlots`, but event-detail notification and display summaries currently cover date, location, and format only.
- `EventEquipeTab.slotRows` currently iterates only current `event.roleSlots`; this caused affected stored assignments to disappear from the organizer view.
- `NotificationIntent.REMOVED_FROM_COMPOSITION` and its payload already exist. Its `publishAssigneeRemoved` helper is not currently called, and no current role-needs update produces the removal event.
- Member-facing composition visibility and all downstream projections must continue to honor the existing member/organizer authorization boundary.

## Story contracts

### CN-1 — Reconcile assignments after needs change

**Scope**

- Compute affected assigned slots by comparing the persisted slots with the post-update required positions.
- Preserve those slots as organizer-only regularization data; do not silently clear, reassign, or count them as current team members.
- Return an explicit, permission-gated reconciliation model instead of asking clients to infer it from hidden or missing slots.
- Keep member composition, agenda focus, recipient resolution, and participation/statistics projections limited to current required positions.

**Acceptance evidence**

- Reducing `player: 5` to `player: 3` preserves the two excess assignments for authorized organizers and hides them from a member.
- Removing a role with an assigned person follows the same rule.
- Increasing needs and unrelated event edits create no reconciliation items.
- A failed update leaves needs and assignments unchanged.

### CN-2 — Explain and regularize impacted selections (**superseded**)

**Scope**

- Do not implement or integrate a distinct organizer/admin-only “À régulariser” section.
- Epic 22 replaces this scope with format confirmation and Hors modèle slots in the normal Équipe role groups.
- Preserve audit rendering of `roleSlots` diffs for Epic 22.

**UI and accessibility checks**

- Use Material dialog patterns and existing semantic warning tokens; do not introduce custom overlay or warning colors.
- Validate mobile at 480 px, keyboard focus/escape behavior, readable names and role labels, and French copy.

### CN-3 — Notify removals from a visible composition

**Scope**

- Emit an after-commit removal event for every newly affected assignee only when the composition was visible to members before the needs update (published or otherwise member-visible under the domain rule).
- Reuse `REMOVED_FROM_COMPOSITION`; the message states that the person is no longer in the composition and links to the event, without exposing organizer-only rationale.
- Define idempotency at the needs-update transition level so retries do not duplicate notification, while a later genuine re-selection and removal can notify again.

**Acceptance evidence**

- Visible composition plus affected assignee: one eligible recipient receives one notification after commit.
- Draft/invisible composition: no removal notification.
- Unaffected assignee, disabled preference, no linked user, rollback, and retry are safe no-send/no-duplicate cases.

## Test matrix

| Layer | Required checks |
|---|---|
| API/domain | Role reduction/removal/increase; update rollback; visibility-gated reconciliation; permission-gated response; lifecycle and statistics regressions; after-commit removal event and idempotency. |
| Notification | Recipient selection, category eligibility, payload copy/link, no sends for drafts, retries, or non-affected assignees. |
| Audit | Stored before/after `roleSlots` maps and rendered French role/count deltas, including mixed property changes. |
| Angular | No-warning safe edit; impact confirmation; organizer-only regularization section; member projection excludes mismatches; action refreshes state; M3 and narrow viewport checks. |
| E2E | Seeded event with a member-visible composition, reduce/remove a role, verify organizer reconciliation, member team truth, and notification delivery record. Avoid mutable shared-state fixtures. |
| Regression | Targeted API/web tests, full `./gradlew test`, web unit suite, web production build, and the affected Playwright flow. |

## Patch gates

1. Review the final behavior against this SPEC and the Material 3 checklist.
2. Run the test matrix in a dedicated prepared worktree; capture command output and a real organizer/member smoke.
3. Perform a staging smoke using a disposable seeded event: published composition, role reduction, organizer regularization, member view, and notification evidence.
4. Review code and release notes; obtain explicit approval for tracker update, commit, push, and the patch release separately.
5. Follow the HatCast V2 release procedure for the approved patch version; do not select or publish a version as part of this planning document.

## Out of scope for this patch

- Bulk repair of historic mismatches.
- A generic audit-diff renderer for every entity.
- Automatic reassignment, cancellation messages authored by organizers, or changes to notification preference UI.
