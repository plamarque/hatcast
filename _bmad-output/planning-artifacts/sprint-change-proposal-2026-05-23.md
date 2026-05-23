# Sprint Change Proposal — 2026-05-23 — Participation Scope Model

**Type:** Direct adjustment with moderate backlog reorganization  
**Trigger:** Stakeholder clarification — administrators must manage participants at troupe, season, and event scopes, and not every participant is a HatCast user  
**Status:** Approved — 2026-05-23  
**Approved by:** Patrice  
**Approval mode:** Batch, because no review mode was selected interactively

## 1. Issue Summary

The current V2 planning model correctly introduced troupe membership administration, baseline troupe roles, and organizer delegation. However, it still treats "participant/player" mostly as a season-scoped legacy concept or as a future "guest/non-member invitation" capability. The stakeholder clarification requires a more precise and immediate domain split:

- A **troupe member** belongs to a troupe and, by default, has access to the troupe's seasons.
- A **season participant** can be added by a season administrator even when they are not a troupe member.
- An **event participant** can be added by an event administrator for one event only.
- Season/event participants may be backed by a HatCast user, may be prelinked by email before first login, or may be a name-only managed person.

This matters because current completed and in-review stories assume many admin operations resolve people through existing `users` rows and active troupe memberships. That is too restrictive for musicians, external contributors, one-off helpers, or people who should appear in teams before becoming HatCast users.

## 2. Impact Analysis

### Epic Impact

**Epic 2 — Troupes, membership, and member profile**

Epic 2 remains valid for troupe-level administration, but Story 2.2 and Story 2.3 should explicitly stay about **troupe members**, not every possible participant. Completed work should not be rolled back. It becomes the foundation for default access and troupe governance.

Required adjustment:

- Clarify that troupe members are not the only selectable people in seasons/events.
- Preserve the existing `troupe_memberships.baseline_role` model for governance.
- Add an explicit downstream dependency: season/event participation rosters must not be implemented by overloading troupe membership.

**Epic 3 — Seasons, events, and organizer governance**

Epic 3 is affected because Story 3.5 organizer delegation currently says organizer assignment targets existing `users` rows. That remains acceptable for assigning administrators/organizers, but it should not be reused as the model for adding season/event participants.

Required adjustment:

- Keep organizer delegation as user-backed permissions.
- Add season participant and event participant administration as separate capabilities, consumed by Epics 5 and 6.
- Clarify that default season access includes active troupe members, plus any explicitly added season/event participants where permitted.

**Epic 5 — Availability**

Availability must support a subject that is not necessarily a troupe member or even a user account. This is a major semantic impact, but the story is still backlog, so it can be reshaped before implementation.

Required adjustment:

- Availability subjects become **participants**, not only members.
- Name-only participants can be managed by admins/organizers through proxy actions.
- User-linked participants can submit their own availability after login if the participant is linked to their account.

**Epic 6 — Composition and confirmations**

Composition candidates and assignees become participants. The draw/fairness model must define whether non-member participants are in the normal weighted draw, manually assigned only, or eligible under event/season rules.

Required adjustment:

- Manual assignment must be able to select event participants and season participants, not only troupe members.
- Confirmation may be self-service only for linked users; otherwise an authorized admin/organizer manages the status.
- Audit must record actor vs participant subject for managed participants.

**Epic 7 — Invitations and external contributors**

Epic 7 should be redefined. Its current scope is advanced invitation and alternative selection modes. The new requirement has a simpler, more fundamental part that should move earlier:

- **MVP / near-term:** Admin-managed season/event participant records, optional email, optional user link.
- **Post-MVP / growth:** Invitation links, self-service external contributor flows, alternative joker/direct-pick modes, richer guest onboarding.

### Story Impact

Affected current stories:

- **Story 2.2 (done):** No rollback. Add follow-up note that member administration is troupe membership only.
- **Story 2.3 (done):** No rollback. CSV import/export remains troupe member CSV, not general participant CSV.
- **Story 3.5 (review):** Retest remains needed. Add note that organizer assignment is user-backed permission; participant addition is separate.
- **Stories 5.1–5.5 (backlog):** Rewrite acceptance criteria around participant subjects.
- **Stories 6.4–6.9 (backlog):** Rewrite candidate/assignee wording from member/player to participant and define linked vs managed confirmation.
- **Stories 7.1–7.2 (backlog):** Split or redefine into basic managed participation vs advanced invitation flow.

### Artifact Conflicts

**PRD**

Current PRD places "guest / non-member" mainly post-MVP and describes FR38–FR39 as invitations. This conflicts with the clarified requirement because simple admin-added non-member participants are now core to season/event administration.

**DOMAIN**

Current DOMAIN has `Troupe membership`, `Player`, and legacy season `Player`, but lacks a V2 distinction between:

- troupe member,
- season participant,
- event participant,
- linked HatCast user,
- name-only managed participant.

**Architecture**

Current architecture documents `troupe_memberships`, `season_organizers`, and `event_organizers`, but does not define participant tables or linking rules. This affects schema and OpenAPI before availability/composition work.

**UX**

Admin surfaces mention "members" but not season/event participant rosters. Event and season screens use participant selectors, but the administration surfaces need explicit add/manage flows.

### Technical Impact

Expected V2 schema additions or equivalents:

- `season_participants`: season-scoped participant identity, linked to `season_id`, optional `troupe_membership_id`, optional `user_id`, optional normalized email, display name, status, source/type, timestamps.
- `event_participants`: event-scoped participant identity, linked to `event_id`, optional `season_participant_id`, optional `user_id`, optional normalized email, display name, status, source/type, timestamps.
- Optional account-linking support: an email can be stored before first login; when a matching user account exists or first authenticates, the participant can be linked according to deterministic rules.

API/OpenAPI impact:

- Add participant administration endpoints for season admins and event admins.
- Avoid reusing troupe member endpoints for season/event participant rosters.
- Define safe DTOs that do not leak email to unauthorized users.

Permission impact:

- Troupe admins can manage troupe members and all season/event participants.
- Season admins can manage season participants.
- Event admins can manage participants for their event.
- Ordinary troupe members read accessible seasons by default, but do not manage participants unless delegated.

## 3. Recommended Approach

**Selected path:** Direct adjustment with moderate backlog reorganization.

Do not roll back completed Stories 2.2 and 2.3. They correctly establish troupe membership and troupe-admin governance. The safer path is to add a participant-scope model before Epics 5 and 6, and to reshape Epic 7 so the basic "managed participant" capability is not delayed behind advanced invitation mechanics.

**Effort estimate:** Medium to high.

The core schema/API change is moderate, but it touches permissions, availability subjects, composition candidates, UI selectors, and audit language. Because most affected availability/composition stories are still backlog, the change is manageable if handled before Epic 5 begins.

**Risk level:** Medium.

Main risks:

- Overloading `troupe_memberships` to represent temporary participants would create long-term permission bugs.
- Creating user records too eagerly for email-only participants could confuse auth/account lifecycle.
- Mixing organizer permissions with participant identity would blur who can act vs who can appear in teams.

**Recommendation:** Introduce explicit participant identities at season and event scope, with optional user linking, before implementing availability and composition.

## 4. Detailed Change Proposals

### PRD Changes

#### PRD — Troupe & Membership

**OLD**

> FR6: A user can belong to a troupe as a member with a member profile for that troupe.  
> FR7: A troupe administrator can manage which users are members and their baseline roles for that troupe, within the permission model.

**NEW**

> FR6: A user can belong to a troupe as a member with a member profile for that troupe. Active troupe members have default access to the troupe's seasons unless a more restrictive future policy is explicitly introduced.  
> FR7: A troupe administrator can manage which users are members and their baseline troupe roles, within the permission model. Troupe membership is distinct from season/event participation records.

**Rationale**

This preserves the troupe member model while preventing downstream stories from assuming "participant = troupe member".

#### PRD — Seasons & Events

**OLD**

> FR13: A member can view the list of events in a season they belong to.

**NEW**

> FR13: Active troupe members can view seasons and events for their troupe by default. Authorized season/event participants who are not troupe members can access only the season or event scope granted to them, according to the permission model.

**Rationale**

This captures the default access rule while allowing scoped external participants.

#### PRD — New Participant Requirements

**ADD**

> FR43: A season administrator can manage a season participant roster that includes troupe members by default and can also include non-member participants. A non-member participant may be a name-only managed participant, an existing HatCast user, or an email-prelinked participant awaiting first login.  
> FR44: An event administrator can add or manage participants for a single event without making them troupe members or season-wide participants. Event participants may be name-only, linked to an existing HatCast user, or prelinked by email awaiting first login.  
> FR45: When an administrator provides an email for a season or event participant, the system attempts to link the participant to an existing user account; if no activated account exists, the participant remains usable as a managed participant and may be linked later when the user first signs in. Email is optional.

**Rationale**

These requirements directly express the clarified stakeholder intent and avoid hiding it inside "guest invitation" language.

#### PRD — Guest & External Contributors

**OLD**

> FR38: An organizer can invite a non-member to contribute to a specific role for a specific event or set of events when that capability is enabled for the troupe.  
> FR39: An invited non-member can submit availability for the invited scope without being subject to the same default draw rules as full members when the troupe configures alternative selection modes (e.g. organizer pick, last-resort/joker).

**NEW**

> FR38: An organizer can invite or onboard an external contributor for a specific role and scope when self-service invitation flows are enabled. This builds on the core season/event participant model.  
> FR39: External contributors can use configured selection modes, such as organizer pick or last-resort/joker, when those advanced modes are enabled. The basic ability for admins to create managed season/event participants is covered by FR43–FR45.

**Rationale**

This keeps advanced guest workflows in Epic 7 without delaying the simpler participant model needed for core planning.

### Epic Changes

#### Requirements Inventory

**ADD**

- FR43: A season administrator can manage a season participant roster, including non-member and name-only participants.
- FR44: An event administrator can manage event-only participants, including non-member and name-only participants.
- FR45: Optional email on a participant can link to an existing or future HatCast user without making email mandatory.

#### FR Coverage Map

**OLD**

| FR | Epic | Résumé |
|----|------|--------|
| FR38–FR39 | Epic 7 | Invitations contributeurs externes |

**NEW**

| FR | Epic | Résumé |
|----|------|--------|
| FR43–FR45 | Epic 3 / new Story 3.8 | Participant rosters at season and event scopes |
| FR38–FR39 | Epic 7 | Advanced invitation and external contributor selection modes |

#### New Story Proposal

**ADD after Story 3.7 or before Epic 5 begins**

> **Story 3.8: Season and event participant rosters**  
> As an authorized season or event administrator,  
> I want to add and manage participants at season or event scope, including name-only and optionally email-linked people,  
> so that teams can include troupe members, external contributors, and one-off participants without granting troupe membership.

**Acceptance Criteria**

- Given a season administrator, when they add a season participant with a display name and optional email, then the participant appears in season participant selectors and can be used by availability/composition flows according to permissions.
- Given an event administrator, when they add an event-only participant, then the participant is available only for that event and does not gain troupe or season-wide membership.
- Given an email matching an existing HatCast user, when the participant is created, then the participant is linked to that user where permitted.
- Given an email with no matching activated user, when the participant is created, then the participant remains a managed participant and can be linked later after first login.
- Given no email, when the participant is created, then the participant remains name-only and admin-managed.
- Given participant data is listed to unauthorized users, then private email data is not exposed.
- Given an admin removes a participant, then historical availability/composition/audit data is preserved according to the chosen lifecycle policy.

**Dependencies**

- Story 2.2 for troupe admin permissions.
- Story 3.5 for season/event organizer permission services.
- Must land before Stories 5.1–5.5 and 6.4–6.9.

### Architecture Changes

#### Data Architecture

**ADD**

> V2 distinguishes membership from participation. `troupe_memberships` grants troupe access and baseline governance. Season and event participation are separate domain identities. A participant may be linked to a `users` row, linked to a troupe membership, prelinked by normalized email, or remain a name-only managed participant. Availability and composition should reference participant identities, not raw users or troupe memberships.

#### Authorization

**ADD**

> Troupe admins manage troupe members and all participant scopes. Season administrators manage season participants. Event administrators manage event-only participants for events they administer. Organizer permissions grant the ability to act in workflow scopes, but do not create troupe membership.

### UX Changes

#### Admin Surfaces

**OLD**

> Members: Manage members of the troupe/season: invite, remove or deactivate, assign roles.

**NEW**

> Members and participants: Troupe admins manage troupe members and baseline roles. Season admins manage the season participant roster, including non-member and name-only people. Event admins manage event-only participants for their event. CSV member import/export remains part of troupe-member administration unless a separate participant import format is explicitly designed.

**Rationale**

Admin UI needs separate labels and workflows so users understand whether they are granting troupe membership or simply listing someone for a season/event.

### DOMAIN Changes

**ADD to glossary**

- **Season participant (V2):** A person who can appear in a season's availability, participant selectors, and composition workflows. All active troupe members are season-accessible by default, but a season participant may also be a non-member managed by a season administrator.
- **Event participant (V2):** A person added to one event only. They can appear in that event's availability/composition workflows without becoming a troupe member or season-wide participant.
- **Linked participant:** A season or event participant associated with a HatCast `users` row.
- **Managed participant:** A participant with a display name and optional email, administered by authorized users. They may have no HatCast user account.
- **Email-prelinked participant:** A managed participant with a normalized email that can be linked to an existing or future HatCast user account.

## 5. Implementation Handoff

**Scope classification:** Moderate.

This is not a full product reset, but it is foundational enough that it must be handled before availability and composition implementation. Completed membership work remains valuable and should be preserved.

### Recommended Routing

- **Product / PO:** FR43–FR45 approved by Patrice on 2026-05-23; still decide whether Story 3.8 belongs in Epic 3 or a new early Epic 7 split during artifact update.
- **Architect:** Confirm schema and account-linking rules for email-prelinked participants.
- **Developer agent:** After approval, update PRD, epics, DOMAIN, architecture, UX, sprint status, and create the story file for participant rosters.

### Success Criteria

- The docs clearly distinguish membership from participation.
- Existing troupe member admin and CSV member import/export are not redefined or broken.
- Season/event admins can add participants without requiring troupe membership.
- Name-only participants work for admin-managed workflows.
- Email-linked participants can later connect to HatCast users without making email mandatory.
- Availability and composition stories consume participant identities rather than raw users or memberships.

### Checklist Completion

- [x] 1.1 Triggering story identified: Story 2.2 / Story 3.5 implementation exposed the existing user/member-only assumption.
- [x] 1.2 Core problem defined: New stakeholder requirement and misunderstanding of participant scope.
- [x] 1.3 Evidence gathered: Current PRD/Epics place guests post-MVP and current stories resolve admin targets through `users`.
- [x] 2.1 Current epic viability assessed: Epics remain viable with reorganization.
- [x] 2.2 Epic-level changes identified: Add core participant roster story and reshape Epic 7.
- [x] 2.3 Remaining epics reviewed: Epics 5, 6, 7 are affected.
- [x] 2.4 Future epic invalidation checked: No epic obsolete; Epic 7 needs scope split.
- [x] 2.5 Priority checked: Participant rosters must precede availability/composition.
- [x] 3.1 PRD conflicts identified.
- [x] 3.2 Architecture conflicts identified.
- [x] 3.3 UX conflicts identified.
- [x] 3.4 Secondary artifact impacts identified.
- [x] 4.1 Direct adjustment evaluated: viable.
- [x] 4.2 Rollback evaluated: not recommended.
- [x] 4.3 MVP review evaluated: MVP expands modestly for basic managed participants; advanced invitation remains post-MVP.
- [x] 4.4 Recommended path selected.
- [x] 5.1 Issue summary drafted.
- [x] 5.2 Epic and artifact impacts documented.
- [x] 5.3 Recommended path documented.
- [x] 5.4 MVP impact and action plan defined.
- [x] 5.5 Handoff plan defined.
- [x] 6.3 User approval obtained: Patrice approved on 2026-05-23.
- [!] 6.4 Sprint status update pending implementation of approved artifact changes.

