---
id: SPEC-composition-needs-safety
companions:
  - delivery-plan.md
  - ../../../docs/v2/technical/FRONTEND_UI.md
sources: []
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate.

# Safe composition changes when event needs evolve

> **Amended 2026-10-14.** This corrective contract is now a safety dependency of Epic 22, **Flexible composition slots**. CN-2's standalone regularization UX is superseded; template application and free slot editing happen in Équipe.

## Why

This corrective patch prevents an organizer from changing event role needs and unintentionally making an existing selection disappear from the team view. Organizers need to adapt an event as it evolves; members must never be led to believe they remain selected after a member-visible composition has removed them.

## Capabilities

- **CAP-1 — Confirmed template application**
  - **intent:** An organizer can apply a different format template from Équipe while knowing that role needs will change.
  - **success:** A different template requires confirmation; it creates missing slots, removes obsolete empty slots, and never silently removes an assignment.

- **CAP-2 — Role-safe flexible composition projection**
  - **intent:** Organizers can edit arbitrary role slots in Équipe without exposing assigned slots outside current needs to ordinary members.
  - **success:** An organizer sees affected assignments as neutral Hors modèle slots in their role group; member views and member agenda projections show only assignments in current required positions.

- **CAP-3 — Member removal notification**
  - **intent:** A member is told only when an organizer explicitly deletes their assigned slot from an unlocked composition that was already visible to members.
  - **success:** The deletion remains silent while the draft is edited. On successful revalidation, each still-removed affected assignee receives the established removal notification after commit; unpublished changes, Hors modèle retention, and failed revalidations send none.

- **CAP-4 — Explainable structure history**
  - **intent:** An organizer can see role-need changes as part of event activity without needing a separate regularization screen.
  - **success:** Activity presents human-readable old-to-new role counts alongside existing event-detail deltas.

## Constraints

- Changing needs remains permitted; the system must neither silently delete selected people nor block a legitimate format change.
- Assigned slots outside current needs are organizer/admin-only Hors modèle details; they must not leak through member composition, agenda, notification-recipient, or statistics projections.
- Removal delivery is an after-commit domain event emitted only by successful revalidation and uses existing eligibility/preferences; a failed or rolled-back deletion or revalidation sends nothing.
- UI work follows the Material 3 and mobile-first requirements in `FRONTEND_UI.md`.

## Non-goals

- Automatically choosing a replacement role or deleting an affected person.
- Sending a removal notification for a draft or otherwise member-invisible composition.
- Rewriting historical audit entries or introducing a general-purpose event-diff system beyond the affected event properties.

## Success signal

An organizer can apply a template or edit a role slot from Équipe without losing an assigned person. Members immediately see a truthful composition; notification behavior for explicit assigned-slot deletion remains separately gated by CAP-3.

## Open Questions

- What idempotency key should allow a later re-selection followed by a new removal notification, without duplicating delivery retries for the same needs update?
