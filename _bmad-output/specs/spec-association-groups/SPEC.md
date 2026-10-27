---
id: SPEC-association-groups
companions:
  - glossary.md
  - brownfield.md
  - configuration-contract.md
  - open-decisions.md
  - ../../planning-artifacts/architecture/architecture-association-groups-2026-10-27/ARCHITECTURE-SPINE.md
  - ../../../docs/v2/technical/FRONTEND_UI.md
sources: []
---

# HatCast for association groups

> Intended V2 evolution, not shipped behavior. Product decisions made during the
> association-groups framing and architecture discussions apply here; the
> adopted architecture companion governs technical invariants.

## Why

Pottoks, an amateur hockey group, needs availability for matches, volunteers and
training and is considering manual selection without random draw. HatCast's group,
season, event, role and selection model can support associations beyond theatre
while preserving existing theatre use, data and access.

## Capabilities

- **CAP-1 — Generic vocabulary**
  - **intent:** Members and organizers understand common association concepts.
  - **success:** French UI, accessible names, notifications, help and generated
    messages use **Groupe**, **Événement**, **Type** and **Sélection** instead of
    Troupe, Spectacle, Format and Compo/Composition. Common labels work without
    customization and apply throughout the interface, including existing events.
- **CAP-2 — Group identity in navigation**
  - **intent:** Members recognize the group reached through their group menu.
  - **success:** The former **Ma troupe** trigger displays the resolved group
    name and icon/logo with accessible fallback and mobile readability. Group,
    season and statistics destinations use a coherent authorized context, including
    after switching groups or when data is unavailable.
- **CAP-3 — Optional random draw**
  - **intent:** Groups can organize events using manual selection without draw.
  - **success:** A group sets the draw default for new events. An event whose
    effective rule disables draw has no draw or simulation, formula controls,
    percentages, probability colors or chance explanations; its API prevents
    draw execution. Manual assignment/publication, participation colors,
    statistics, category editing and category filters remain. Existing events
    retain their effective rule after a default changes.
- **CAP-4 — Group role catalog and preferences**
  - **intent:** Groups describe participation and volunteer roles they need.
  - **success:** Each group has an autonomous catalog initialized from existing
    models and can create, rename and archive roles without affecting other
    groups. Stable identities preserve existing assignments and history; archived
    roles remain usable for roles already offered on existing events. Members'
    role preferences are independent per group and existing preferences retain
    their meaning. Statistics cover each role; an event counts at most once per
    person in overall participation totals. Existing theatre groupings remain.
- **CAP-5 — Group event-type catalog**
  - **intent:** Organizers reuse types appropriate to their activities.
  - **success:** Each group has an autonomous type catalog initialized from
    existing models and can create, rename and archive types such as a hockey
    match. Stable identities preserve event history. Types define default role
    needs and confirmation choice; event needs remain independently editable and
    types stay distinct from categories. Default changes do not silently alter
    existing events.
- **CAP-6 — Group volunteer obligation**
  - **intent:** Each group chooses whether availability also implies volunteering.
  - **success:** One group setting makes volunteering mandatory or optional for
    new events, without a type override. In optional mode, player-only,
    volunteer-only or both candidacies are valid through self/proxy entry when
    those roles are offered. Existing events retain their effective policy;
    unoffered roles remain unavailable.
- **CAP-7 — Optional post-selection confirmation**
  - **intent:** Groups avoid a second member response when it does not fit selection.
  - **success:** Confirmation is configured per type with a group default, resolved
    for new events and preserved thereafter. Without confirmation, organizer
    validation establishes commitment with the distinct label **sélectionné**;
    participants may withdraw. The person is informed without a confirmation
    task or request. Unchanged revalidation is silent; a validated replacement
    informs the incoming and outgoing people. Unlock preserves commitments and
    withdrawal is not silently reversed. No fictional member acceptance or actual
    attendance is inferred. No editable per-event confirmation override is approved.
- **CAP-9 — Per-group vocabulary**
  - **intent:** Groups adapt selected words while retaining common terminology.
  - **success:** Groups may customize Groupe, Événement, Type and Sélection;
    role names are managed in their catalog. Group-context surfaces use the
    group's words and common forms provide fallback; multigroup chrome uses common
    words. Saison, Dispos and Équipe do not change by implication. Content and
    audit snapshots authored in the past are preserved.

## Constraints

- Apply to V2 and preserve identities, rosters, availability, selections, history,
  audit and existing access. Configuration cannot silently delete or reinterpret data.
- Behavioral settings are defaults for newly created events. Existing events
  retain effective draw, volunteer and confirmation rules; changing a default is
  not a retroactive kill switch or an event-level override. See
  [configuration-contract.md](configuration-contract.md).
- Use the existing V2 application for all groups, without a hockey-specific fork
  or a general workflow engine. The adopted architecture records the targeted
  changes, authorization boundaries and compatible transition.
- Scope group catalogs, preferences, vocabulary and event rules correctly in
  shared components and cross-group home/agenda views. Enforce disabled draw in
  the API as well as the UI; preserve category editing/filters and status colors.
- New groups start with draw enabled, volunteering mandatory when volunteer
  places are offered, and confirmation required by default. Administrators may
  change these defaults; type confirmation can inherit or choose a value.
- Preserve the semantics of historical keys, empty preferences and wildcard
  availability. Renamed roles/types retain identity; archived references and
  event needs remain usable. Do not infer classification of a custom role as
  `player` or `volunteer`; keep existing parity behavior.
- Use generic wording across existing and new screens, including accessibility,
  plurals, notifications and messages. Preserve user-authored content and audit
  snapshots. Follow the adopted Material 3/mobile/accessibility contract.
- An organizer-established selection, a member or proxy confirmation, and actual
  attendance are distinct. Do not create a confirmation task for **sélectionné**.
  Product wording need not rename technical routes, API fields or storage.

## Non-goals

- Hockey-specific scores, standings, licences, fees, tactics or automatic sports
  balancing; actual-attendance check-in or assiduity inferred from responses.
- Simple participation without selection (**CAP-10**, **Q-4**) and linked event
  series (**CAP-8**, **Q-5**): deferred until their training use is confirmed.
  Their identifiers and prior discussion remain reserved; no implementation or
  preparatory workflow/recurrence framework is required in the active scope.
- Category disabling coupled to draw, type-specific volunteer settings, editable
  per-event confirmation overrides or automatic retroactive default propagation.
- Configurable statistical groupings, a new parity configuration per role, V1
  changes, or execution of a production migration in this framing work.

## Success signal

Demonstrate a Pottoks group with a custom role and type and a new event using
manual selection without draw. Members provide availability; category management
and statistics remain available; validation informs selected people without a
second response and allows withdrawal. Changing a group/type default affects new
individual events while pre-existing events keep their behavior. Theatre history,
access and statistics remain intact, and catalogs, preferences and vocabulary do
not leak between groups.

## Assumptions and open questions

- **A-2:** Existing technical identifiers and routes can remain compatible while
  UX wording changes; the adopted architecture defines compatibility constraints.
- Stable **Q-1–Q-8** and the remaining follow-up are in
  [open-decisions.md](open-decisions.md). Q-4 and Q-5 are deferred; Q-8 actual
  attendance remains outside scope. Precise French grammatical forms, generic
  default-category wording, presentation and operational migration details remain
  to be resolved at implementation altitude without reopening adopted decisions.
