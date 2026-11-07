# Epic 5 Context: Disponibilités (participants et organisations)

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Enable participants to record their availability for each event and organizers to understand the available roster when preparing a team. Authorized organizers can act for participants, including people without linked accounts, with a traceable actor and subject.

## Stories

- Story 5.1: Record availability per event
- Story 5.2: Record availability by role
- Story 5.3: Organizer availability overview
- Story 5.4: Optional availability comment
- Story 5.5: Record availability on behalf of another participant
- Story 5.9: Availability and team explainability boundaries
- Story 5.10: View people who have not answered

## Requirements & Constraints

- Availability has available, unavailable and unknown states and is scoped to an authorized event and participant. Organizers can inspect available candidates by role.
- Where volunteer slots are offered, a newly saved available response includes volunteer; existing empty-role responses are preserved until explicitly replaced. Role preferences remain unchanged by recording an event response.
- Availability comments are optional, at most 500 characters, available to authorized organizers and administrators, and excluded from public discovery pages.
- Proxy changes require scoped organizer or administrator authority and an audit trail identifying both actor and subject. A read-only consultation must not submit a change.
- Availability and selection-odds visibility must respect event lifecycle and draft-composition confidentiality. A member's availability view must not reveal an unpublished team.
- Core member and organizer journeys target WCAG 2.1 AA; maintain keyboard access, usable touch targets, and meaningful status feedback. Test availability and authorization paths without disabling tests.

## Technical Decisions

- V2 uses an Angular and Angular Material client with a Kotlin/Spring API and PostgreSQL persistence. Enforce troupe-, season- and event-scoped authorization at the API boundary; client visibility alone is not an authorization control.
- Availability, roles, participant identity, and audit records are shared domain concepts; preserve actor-versus-subject identity on proxy mutations. Composition and draw calculations depend on availability data.
- Use Material components and theme tokens for interface changes, following existing mobile-first patterns. Keep client state and asynchronous error/loading states explicit.

## UX & Interaction Patterns

- The event availability tab combines a participant subject selector and a poll-style view. Proxy editing must clearly indicate whose response is being changed.
- Selecting unavailable clears roles; selecting a role can return a participant to available. Preserve existing read-only and archived behavior.
- Show data with suitable empty, loading and error states, and make organizer-only information accessible without exposing it to unauthorized viewers.

## Cross-Story Dependencies

- Event publication controls when availability collection opens. Availability and role selection feed team composition and weighted draw explainability.
- Proxy availability relies on scoped participant identity and audit; notifications for proxy changes depend on the same actor and subject distinction.
- The unanswered-person list is visible to all authorized availability viewers. An eligible organizer can request a reminder from the list after confirmation; viewing it never changes responses or sends notifications.
