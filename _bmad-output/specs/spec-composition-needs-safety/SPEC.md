---
id: SPEC-composition-needs-safety
companions:
  - delivery-plan.md
  - ../../../docs/v2/technical/FRONTEND_UI.md
sources: []
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate.

# Safe composition changes when event needs evolve

## Why

This corrective patch prevents an organizer from changing event role needs and unintentionally making an existing selection disappear from the team view. Organizers need to adapt an event as it evolves; members must never be led to believe they remain selected after a member-visible composition has removed them.

## Capabilities

- **CAP-1 — Impact-aware needs update**
  - **intent:** An organizer can change role needs while knowing, before saving, whether assigned people are affected.
  - **success:** A save that changes no assigned required position proceeds normally; a save that affects one or more assignments identifies the affected people and consequences before confirmation.

- **CAP-2 — Role-safe composition projection**
  - **intent:** Organizers and administrators can resolve assignments that no longer match current needs without exposing those inconsistent assignments to ordinary members.
  - **success:** Organizer views visibly list every affected assignment as needing regularization; member views and member agenda projections show only assignments in current required positions.

- **CAP-3 — Member removal notification**
  - **intent:** A member is told when a needs change removes them from a composition that was already visible to members.
  - **success:** Each affected assignee receives the established removal notification only after the persisted update succeeds and only when the prior composition was member-visible; unpublished changes send none.

- **CAP-4 — Explainable activity history**
  - **intent:** An organizer can see exactly which event properties, including role needs, were changed.
  - **success:** Activity presents human-readable old-to-new values for each changed role need, alongside existing event-detail deltas.

## Constraints

- Changing needs remains permitted; the system must neither silently delete selected people nor block a legitimate format change.
- Affected assignments are organizer/admin-only until regularized; they must not leak through member composition, agenda, notification-recipient, or statistics projections.
- Removal delivery is an after-commit domain event and uses existing eligibility/preferences; a failed or rolled-back update sends nothing.
- UI work follows the Material 3 and mobile-first requirements in `FRONTEND_UI.md`.

## Non-goals

- Automatically choosing a replacement role or deleting an affected person.
- Sending a removal notification for a draft or otherwise member-invisible composition.
- Rewriting historical audit entries or introducing a general-purpose event-diff system beyond the affected event properties.

## Success signal

An organizer can reduce or remove a role with existing assignments, see every consequence before and after saving, and regularize it. Members immediately see a truthful composition; affected members receive one appropriate removal notice only when the previous composition was visible to them.

## Open Questions

- What idempotency key should allow a later re-selection followed by a new removal notification, without duplicating delivery retries for the same needs update?
