# Epic 6 Context: Draw, Composition and Confirmation Lifecycle

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Enable organizers to assemble, validate, communicate and maintain an event composition, while participants understand their assignments and can respond. Preserve fair selection, clear lifecycle state, confidentiality and organizer control as lineups evolve.

## Stories

- Story 6.1: Composition lifecycle states and UI consistency
- Story 6.2: Full-screen event detail with information, availability and team tabs
- Story 6.3: Draft composition, publication and visibility
- Story 6.4: Weighted draw and explainable odds
- Story 6.5: Manual assignment and reassignment
- Story 6.6: Composition validation and unlocking
- Story 6.7: Participant confirmation or decline
- Story 6.8: Proxy confirmation or decline
- Story 6.9: Vacancies after declines and follow-up
- Story 6.10: Sharing and announcements
- Story 6.10b: Manual availability reminder and anti-spam
- Story 6.11: Team tab feedback and performance
- Story 6.20: Warning for same-role assignment on previous show in category
- Story 6.21: Informational gender parity hint
- Story 6.25: Warning for consecutive shows across categories

## Requirements & Constraints

Organizers can see eligible candidates by role, draw with the configured weights, and manually assign or reassign a person. Role stacking is permitted by default unless disabled for an event type. Provide per-role odds and explanations according to surface-specific visibility; don't reveal private drafts through secondary UI or metadata.

A composition moves through preparation, organizer draft, validated/awaiting confirmations, gaps and completion. Validation precedes participant confirmation requests. Unlocking returns the lineup to a draft while preserving existing participation states; unchanged slots retain their status and changed assignees become pending. Proxy actions follow the actor's authorization and audit rules. Partial redraw and vacancy handling must preserve the rest of the lineup.

Hints support organizer judgment and are not equivalent to blocking validation, draw exclusions or changes in selection weights. The approved November 2026 direction extends consecutive-show checks across all categories while retaining the independent same-category check and role-by-role comparison. Maintain existing controls on member visibility and do not infer attendance from a validated assignment.

## Technical Decisions

Use the shared composition lifecycle and canonical participant/role identity across manual assignments, draws and subsequent reads. Apply authorization server-side before exposing organizer-only information. Keep time ordering, season boundaries, composition validation and event archival explicit when resolving history. Draw weight calculation, historical odds and snapshots remain separate from informational composition hints.

Preserve existing cross-category and event-type behavior for other troupes unless a product change explicitly specifies otherwise. Maintain audit, notifications and lifecycle state across all assignment paths; avoid leaking a last validated projection when the current draft is private.

## UX & Interaction Patterns

Composition is managed on the event's Équipe tab. Use compact, non-blocking inline information, accessible keyboard and touch behavior and the existing Material 3 design tokens. Surface explanations where they help decisions, preserve usable controls at mobile widths, and do not introduce modal confirmation for informational warnings. Members should not see organizer-only hints.

## Cross-Story Dependencies

Availability and the role model determine eligible candidates; identity resolution covers both season participants and event-only participants. Composition changes affect confirmation, withdrawal, notification and audit flows. Category history used in weighted draws is governed separately from chronological warnings. Any update to previous-show semantics must preserve the independent replay weighting factor unless explicitly approved.
