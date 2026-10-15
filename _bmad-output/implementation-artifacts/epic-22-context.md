# Epic 22 Context: Flexible composition slots

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Make the **Équipe** tab the single organizer workspace for configuring a composition: choosing a format, adjusting its role-slot structure, assigning people, and drawing a team. A format is only a starting template; persisted `roleSlots` remains the canonical statement of event needs. This removes the forced detour through Infos and replaces CN-2's special-purpose regularization experience while preserving the safety guarantees that prevent an assigned person from disappearing silently.

## Stories

- Story 22.1: Équipe — format and needs in one place
- Story 22.2: Équipe — free role-slot structure editing
- Story 22.3: Safe template application and out-of-model slots
- Story 22.4: Retire CN-2 and decide removal notifications

## Requirements & Constraints

- Only organizers with composition-management permission can change format, structure, or assignments. Infos presents the effective format and role-count summary without editing controls.
- Applying a changed template requires confirmation. It creates missing required slots, removes obsolete empty slots, and must never delete an existing assignment implicitly.
- An assigned slot no longer required by the current template remains visible to organizers as a neutral **Hors modèle** entry in its role group. Ordinary members, their agendas, notification audiences, and statistics never receive that organizer-only detail.
- Free structure editing must distinguish unassigning a person from deleting a slot. An assigned structural deletion requires explicit confirmation because it also removes the assignment.
- A removal notification is not the same event as retaining a person Hors modèle. It is eligible only for an explicit removal from a composition that was already visible to members, after persistence succeeds; draft or member-invisible changes are silent.
- Activity must make changes in role needs explainable without restoring a separate regularization screen.
- Every UI change follows Angular Material 3, design-token, accessibility, and mobile-first rules. Interaction labels, touch targets, focus behaviour, and semantic states need verification.

## Technical Decisions

- `roleSlots` stays the persisted role-need contract for availability-by-role, drawing, and statistics; moving editing to Équipe creates no second source of truth.
- CN-1 remains the server-side safety dependency: preserve affected assignments and filter every ordinary-member projection by currently required positions. Do not roll it back because the organizer UI changes.
- Structural and template mutations must be atomic. A conflict must not leave partially changed requirements, slots, or projections.
- Notifications are after-commit domain side effects using existing delivery eligibility and preferences. A rollback must not send any removal message.
- Preserve history as superseded rather than erasing it. Retire only CN-2-only active UI, contract wording, and code once the audit establishes that the Epic 22 path covers their purpose.

## UX & Interaction Patterns

- Composition rows remain grouped by role with stable creation order; no drag-and-drop ordering is introduced.
- A provisional add-row begins role-less and persists no new need until the organizer chooses a role. On mobile, the resulting slot is brought into view and focus moves to the person-assignment control; desktop scrolls only when needed.
- A filled or vacant slot keeps a visible role pill. Whole-row actions, the assignee clear action, warnings, and structural deletion are distinct targets with explicit labels.
- Hors modèle is neutral/grey rather than an error state, and stays organizer-only. The same visual system must not expose deleted or preserved assignment details to members.

## Cross-Story Dependencies

- Story 22.1 established Équipe as the format surface and Infos as read-only.
- Story 22.2 establishes free structural editing and explicitly defers removal notifications.
- Story 22.3 is the dependency for retaining assigned out-of-template slots, removing empty obsolete slots, projection redaction, concurrency coverage, and mobile focus/scroll.
- Story 22.4 audits and retires CN-2, revalidates CN-1 against the completed path, and turns the separately gated CN-3 notification decision into a tested rule.
