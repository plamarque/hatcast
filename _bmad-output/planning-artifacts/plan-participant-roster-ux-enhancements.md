# Plan — Participant roster UX enhancements (backlog)

**Status:** Approved for backlog — not yet scheduled in sprint  
**Created:** 2026-06-06  
**Author intent:** Stakeholder demo feedback + product ideas (non-blocking)  
**Priority:** Lot A → Lot B phase 1 → Lot B phase 2

---

## Context

| Already shipped | Gap |
|-----------------|-----|
| Add participant dialog: display name + optional email | No user typeahead; manual name entry only |
| Auto-link when email matches HatCast account (FR43–45) | Email kept for future invite / notifications |
| Gender on **Mon compte** (`users.gender`, story **2.12**) | Name-only / unlinked participants count as unknown gender in mixité (**6.21**) |
| Mixité pill on Équipe when all `player` slots have known gender | Org cannot set gender for guests without accounts |
| Autocomplete patterns elsewhere (**2.8** membres, **17.15** organisateurs, **17.8** tags) | Not reused on participant add |

**Related fixes (same sprint, done):**

- Dispos subject selector aligned with event roster (`spec-dispos-subject-selector-event-roster.md`)
- Add/edit participant dialog layout (label clipping, scroll)

---

## Lot A — Typeahead on participant add *(recommended first)*

### Intent

When adding a season or event participant, the organizer types a name and HatCast suggests known troupe members / linked accounts. If a suggestion is selected, link the participant and show avatar. If not, keep the typed name as a name-only participant (FR45 unchanged).

### Approach

1. **UX** — Document pattern in planning UX (reuse **17.15** / **2.8** autocomplete; M3 `mat-autocomplete` + `app-user-avatar` in option rows).
2. **Story** — Epic **3** participants, proposed id: `3.8c-participant-add-typeahead`.
3. **Implementation** — Client-side or API search over active troupe members (+ optionally existing season roster); no new persistence model if link uses existing email / user resolution.

### Acceptance criteria

1. **Given** an organizer on « Ajouter un participant », **when** they type in the name field, **then** matching troupe members appear with display name and avatar.
2. **Given** a suggestion is selected, **when** the dialog is submitted, **then** the participant is created linked to that user (email prefilled when available).
3. **Given** no suggestion is selected, **when** the organizer submits a non-empty name, **then** a name-only participant is created (FR45).
4. **Given** the email field, **when** displayed, **then** it remains optional with hint that it enables account linking and future notifications (Epic **8** — no invite implementation in this lot).

### Out of scope (Lot A)

- Sending invitation emails
- Mandatory email
- Gender field on add dialog

### BMAD next steps

| Step | Skill | Invocation |
|------|-------|------------|
| UX wire + copy FR | `bmad-ux` | Create UX note or amend `ux-design-hatcast-v2.md` § admin participants |
| Story file | `bmad-create-story` | `create story 3.8c participant add typeahead` |
| Implement | `bmad-dev-story` | Fresh context window |

---

## Lot B — Organizer-editable gender for mixité

### Intent

Allow organizers to set gender (same 3-state control as Mon compte) when editing a **name-only** or otherwise unlinked participant, so mixité (**6.21**) and gender-aware labels can include guests without HatCast accounts.

Optional phase 2: same control when admin edits a **troupe member** (user-backed).

### Domain decision (required before story)

| Case | Today | Proposed |
|------|-------|----------|
| Participant linked to user | Gender from `users.gender` only | Read-only in admin UI **or** defer to Mon compte — **no org override in phase 1** |
| Name-only participant | Treated as unknown (`u`) in mixité | New optional `gender` on `season_participants` / `event_participants` |
| Troupe member (admin) | Gender on user | Phase 2: admin PATCH user gender (same UX as **2.12**) |

**Recommendation:** Phase 1 = participant-level gender for unlinked rows only. Phase 2 = member admin edit if still needed.

### Approach

1. **Investigate** — Confirm all mixité / avatar / stats read paths (`member-gender.md` companion, `CompositionSlotAssignmentService`).
2. **ADR or sprint change** — If adding `gender` column on participant tables.
3. **UX** — Reuse frozen Mon compte toggle (`ux-design-member-gender-parity.md` Screen 1).
4. **Stories** — Proposed: `2-12d-genre-participant-admin` (phase 1), `2-12e-genre-membre-admin` (phase 2, optional).

### Acceptance criteria (phase 1)

1. **Given** a name-only season participant, **when** an organizer sets gender to `female` and saves, **then** mixité counts that slot in `f` when all other player slots have known gender.
2. **Given** a participant linked to a user with Mon compte gender set, **when** an organizer opens edit, **then** gender is shown from the user record and not duplicated on the participant row.
3. **Given** gender unset on name-only participant, **when** mixité is computed, **then** behaviour unchanged (`u > 0` → pill hidden).

### Out of scope (Lot B)

- Mandatory gender
- Blocking validate / draw on mixité
- Overwriting user gender from participant edit without explicit product decision

### BMAD next steps

| Step | Skill | Invocation |
|------|-------|------------|
| Domain + read-path audit | `bmad-investigate` | Participant gender for mixité |
| Course correction / ADR | `bmad-correct-course` | If participant.gender column approved |
| Story | `bmad-create-story` | After domain decision |

---

## Lot C — Email field rationale *(documentation only)*

Not a separate story. Embed in Lot A story AC and hint copy:

- Optional email enables pre-link to existing account (today) and future invitation / notification flows (Epic **8** backlog).
- Do not implement invite or notification in Lots A/B.

---

## Recommended sequencing

```
Lot A (typeahead add)  →  Lot B phase 1 (participant gender)  →  Lot B phase 2 (member admin gender, optional)
```

Nothing in this plan is **required** for the current sprint closure. Safe to pick up after demo commission wrap-up.

---

## Traceability

| Requirement | Lots |
|-------------|------|
| FR43–FR45 (roster, name-only, email link) | A (enhance add UX, preserve semantics) |
| FR17 / proxy dispos | Indirect — easier roster UX |
| Epic 2.12 / 6.21 / 16.3 (gender, mixité) | B |
| Epic 8 (notifications) | C hint only; no implementation |

---

## Change log

| Date | Change |
|------|--------|
| 2026-06-06 | Initial plan captured from stakeholder session (bmad-help structuring) |
