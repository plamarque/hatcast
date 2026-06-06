# ADR-0021: Troupe externes (carnet), invitation scope, and upward inclusion cascade

- **Status:** Accepted
- **Date:** 2026-06-06
- **Accepted:** 2026-06-06 (Patrice)
- **Deciders:** Patrice (product), design discussion 2026-06-06
- **Builds on:** Story **3.8** (season/event participants), sprint-change-proposal **2026-05-31** (three-level removal), [ADR-0011](0011-league-model-and-user-agenda.md) (user agenda), story **3.8c** (participant add typeahead — Lot A)
- **Related:** [plan-participant-roster-ux-enhancements.md](../../_bmad-output/planning-artifacts/plan-participant-roster-ux-enhancements.md)

## Context

HatCast V2 already separates **troupe membership** (`troupe_memberships`), **season participants** (`season_participants`), and **event participants** (`event_participants`). Story **3.8** allows season/event rosters to include people **without** troupe membership (name-only, email-assisted, linked accounts — FR43–FR45).

In practice, troupes work with two kinds of recurring guests:

1. **Season-scope guests** — e.g. Laetitia as MC: agreed to cover ~2 events in the year without knowing which dates upfront; organizers need her on the **season roster** and able to indicate availability across season events.
2. **Event-scope guests** — e.g. Ruben as DJ at Cambo: one-off; organizers need **history** (who DJ’d), optional notifications, and a **contact book** entry to recall him later — **without** season-wide availability or full troupe member access.

**Current friction:**

| Problem | Cause today |
|---------|-------------|
| Adding Ruben at event level does not make him easy to find next time | Event-only rows (FR44 AC3); no troupe **carnet** anchor |
| Typeahead (Lot A) suggests **troupe members only** | `listMembers(ACTIVE MEMBER\|ADMIN)` pool |
| Orgs would never think « add to Membres first, then roster » | UX mismatch with real workflows |
| `MEMBER` membership implies **broad troupe read access** (DOMAIN) | Cannot reuse membership row for guests without opening the app |

Stakeholder direction (2026-06-06): introduce **Externes** as a third troupe role — a **carnet de contacts** managed in the **same Membres admin UI**, reusable for invitations. **Entry in the carnet must not require a HatCast account or email** (name-only contacts are valid). Removal from the carnet is explicit and does not destroy historical data.

This ADR **does not** change the **downward removal cascade** (troupe deactivate → season REMOVED) documented in sprint-change-proposal 2026-05-31. It adds a **symmetric upward inclusion model on add** at the product level.

## Decision

### 1. Third baseline troupe role: `EXTERNE`

Extend `TroupeBaselineRole`:

| Role | French UI | Purpose |
|------|-----------|---------|
| `MEMBER` | Membre | Active troupe member; member read access; synced to season rosters per existing rules |
| `TROUPE_ADMIN` | Admin·istrateur·ice de troupe | Troupe administration |
| `EXTERNE` | Externe | **Carnet entry only** by default — no member hub, no browse-all-seasons access |

**Carnet entry requirements:**

- **Display name** required.
- **Email** optional (enables FR45 pre-link and future notifications).
- **`users` account** optional (link when email resolves or on first sign-in).
- **Name-only externals are in scope** — presence in carnet is an **organizer choice**, not a technical identity gate.

**Single admin surface:** `/troupe/:slug/admin/membres` lists **Membre · Admin · Externe** (filter or chip); no separate « contacts » app area for MVP.

### 2. Carnet vs invitation vs access (three layers)

| Layer | Entity | Grants by itself |
|-------|--------|------------------|
| **A — Carnet troupe** | `troupe_memberships` with `baseline_role = EXTERNE`, `status = ACTIVE` | **Nothing** for the guest in the member app except future invitations; orgs can search/recall in admin |
| **B — Invitation scope** | Active `season_participants` row (+ optional `event_participants` / exclusions) | Dispos, notifications, agenda visibility **per scope below** |
| **C — HatCast account** | Linked `users` row | Self-service dispos, push/email, cross-troupe **user agenda** for invited events |

**Rule:** Layer A alone ≠ app access. Layers B (+ C when linked) define what the person can do.

### 3. Invitation scope (season vs event)

Add normative **invitation scope** on season participation (field name TBD in implementation — e.g. `invitation_scope` on `season_participants` or derived from roster shape):

| Scope | French label (UI) | Dispos | Typical use |
|-------|-------------------|--------|-------------|
| `SEASON` | Externe saison | All **published** season events (subject to event exclusions) | Laetitia MC deal |
| `EVENT` | Externe spectacle | Only event(s) explicitly on roster | Ruben DJ one-off |
| *(none — carnet only)* | — | None | In carnet, not yet invited this season |

Event-only participants (`event_participants` without season row) map to **`EVENT`** scope for that spectacle. Season row with `SEASON` scope implies presence on season roster UI and typeahead pools.

**Event exclusions** (`event_participant_exclusions`) still hide a season-scoped participant from one spectacle without changing scope.

### 4. Upward inclusion cascade on **add** (organizer flows)

When an organizer adds a person, the system **upserts carnet + roster** so reuse does not require a separate Membres step.

#### 4.1 Add at **event** (spectacle admin)

Default flow when creating an event-scoped guest:

1. Upsert **`EXTERNE`** carnet row (match: linked user → normalized email → display name on inactive externals).
2. Create **`event_participants`** row (and link to season participant when scope requires — see below).
3. **Season roster:** organizer chooses (UI default TBD per product):
   - **One-shot (Ruben):** event participant only; **optional** season row with `EVENT`-equivalent semantics OR event-only row + carnet; **no** season-wide dispos.
   - **Also season (checkbox off by default for true one-shots):** upsert `season_participants` with `EVENT` scope or exclusion-based model.

**Minimum for Ruben case:** carnet + event history — **must not** require season-wide roster unless opted in.

#### 4.2 Add at **season** (Participants admin)

When creating a season external:

1. Upsert **`EXTERNE`** carnet row (including name-only).
2. Upsert **`season_participants`** with scope **`SEASON`** (Laetitia case).

#### 4.3 Reuse from carnet

Typeahead and pickers search **`MEMBER` + `TROUPE_ADMIN` + `EXTERNE`** active carnet rows (+ existing season roster rows per UI context). Selecting a carnet entry pre-fills name/email; organizer sets scope for this invitation.

#### 4.4 Stable identity (re-inclusion)

Re-adding reuses the same rows (`troupe_membership_id`, `season_participant_id`, `event_participant_id`) per sprint-change-proposal **2026-05-31** §2.1 — **forbidden** to mint new UUIDs on every return.

### 5. Access profile for `EXTERNE` with linked account

`EXTERNE` **`ACTIVE` membership must not grant** `MEMBER`-equivalent troupe read (hub, all seasons, stats, member lists).

Permitted access is **invitation-derived**:

| Condition | Access |
|-----------|--------|
| Carnet only | None in member app (org admin only) |
| `SEASON` invitation + linked account | User agenda includes season events; dispos on season events; **partial** season workspace (**Agenda tab only** — no Historique/Statistiques/admin) |
| `EVENT` invitation + linked account | User agenda + dispos **only** on invited event(s); **partial** season workspace (**Agenda + Historique in-scope** — no Statistiques/admin) |
| Invited linked externe (any scope) | **`/troupes/:slug` read-only hub** — invited seasons navigation only; **not** `MEMBER`-equivalent (no all-seasons browse, stats, member lists, admin) |
| Multi-troupe | Each troupe’s invitations aggregate in **user agenda** (`/agenda`) — aligns with ADR-0011 |

**Amended 2026-06-06 (story 3.25, review 1B/2B):** Partial read-only season workspace and read-only troupe hub for linked invited externes ship in **P4**. Authoritative UI/API matrix: story **3.25** Dev Notes. This remains **not** `MEMBER`-equivalent access.

API guards: authorization must check **`EXTERNE` + invitation scope**, not `requireActiveMembership` alone.

### 6. Removal (unchanged downward; carnet removal)

| Action | Effect |
|--------|--------|
| Remove from **event roster** | Local exclusion or event participant REMOVED — **no upward** change |
| Remove from **season roster** | `season_participants.status = REMOVED` — **does not** remove carnet |
| Remove from **carnet** (Membres admin) | `troupe_memberships.status = INACTIVE` for `EXTERNE` — **does not** hard-delete history; season/event participant rows follow existing soft-delete rules |
| Remove **MEMBER** | Existing downward cascade to season participants |

Removing from carnet = « we no longer want this contact suggested » — not « erase Cambo 2026 from stats ».

## Normative examples

### Laetitia — season-scope external (MC)

- Added via **Participants saison** as externe, scope **`SEASON`**.
- **Carnet:** `EXTERNE` row (email if known).
- **Season roster:** active; dispos on all season events unless excluded per event.
- **Not** a `MEMBER`; may use **read-only** troupe hub and **partial** season workspace (Agenda tab only) for invited seasons — not full member hub or stats.
- Next season: org re-invites from carnet or re-adds to new season roster.

### Ruben — event-scope external (DJ Cambo)

- Added via **Participants spectacle** for one event.
- **Carnet:** `EXTERNE` row upserted (email/account if known).
- **Season roster:** not season-scoped (no dispos on unrelated galas).
- **Event roster:** present; org sees « who DJ’d » in history; stats/audit retain identity.
- **Linked account:** user agenda + **partial** season workspace (Agenda + Historique for invited event only); read-only troupe hub for navigation.
- Next event: org finds Ruben via typeahead (carnet + past participants).

### « DJ local » — name-only carnet contact

- No email, no HatCast account.
- **Carnet:** `EXTERNE` with display name only.
- **Reuse:** typeahead by name; organizer may add email later on edit.
- **Risk:** homonym collision — UI should encourage email when known; not mandatory for carnet entry.

### Piotrix — account exists, never met troupe

- Not in carnet until first organizer add (any level).
- After first manual add with email → carnet + roster rows per flow above → appears in typeahead thereafter.

## Consequences

### Positive

- Matches real troupe workflows (Cambo DJ, MC season deal).
- One Membres UI; clear **Externe** chip.
- Typeahead pool becomes useful without global user search.
- Multi-troupe guests benefit from user agenda without troupe membership sprawl.

### Negative / cost

- **Enum + authorization refactor** — every `MEMBER` read path must exclude or branch for `EXTERNE`.
- **Story 3.8 FR44 AC3** (« event-only does not become season participant ») must be **amended** — replaced by scoped rules + opt-in/opt-out defaults.
- **Membership sync** (`ensureMembershipParticipants`) must **not** auto-add `EXTERNE` to every season like `MEMBER`.
- **Data model** may add `invitation_scope` (or equivalent) — Flyway + OpenAPI.
- Name-only carnet duplicates possible — mitigated by merge/reactivation rules, not blocking MVP.

### Out of scope (this ADR)

- Global HatCast user search in typeahead.
- Self-service « join troupe as externe ».
- Automatic promotion `EXTERNE` → `MEMBER`.
- Mandatory email on carnet.
- Full **member** season workspace for externes (Historique/Statistiques/admin/export for all seasons without invitation scope).

## Alternatives considered

| Alternative | Why not chosen |
|-------------|----------------|
| **Season participants only** (no `EXTERNE` membership) | No troupe-level carnet; Ruben lost between seasons; typeahead incomplete |
| **Carnet = email/account only** | Rejects name-only contacts stakeholder requires |
| **`EXTERNE` gets `MEMBER` read access** | Over-exposes troupe data; wrong for multi-troupe guests |
| **Separate `troupe_contacts` table** | Duplicates membership UI; two sources of truth |
| **Event add never touches season/carnet** (status quo + typeahead fix only) | Ruben not rediscoverable; org mental model broken |

## Implementation phasing (inform PLAN; not normative order)

| Phase | Deliverable |
|-------|-------------|
| **P0 — Spec** | This ADR **Accepted**; DOMAIN.md + SPEC fragments; amend FR44 / story 3.8 |
| **P1 — Carnet** | `EXTERNE` role; Membres UI; API guards; no auto season sync |
| **P2 — Scope + cascade** | `invitation_scope`; add flows event/season → carnet upsert |
| **P3 — Typeahead** | Suggest MEMBER + ADMIN + EXTERNE + season roster (story 3.8c extension) |
| **P4 — Guest app access** | Scoped dispos + agenda for linked externals |

## References

- [DOMAIN.md](../../DOMAIN.md) — participant vs membership (to be updated on acceptance)
- [3-8-rosters-participants-saison-et-evenement.md](../../_bmad-output/implementation-artifacts/3-8-rosters-participants-saison-et-evenement.md)
- [sprint-change-proposal-2026-05-31-participant-removal-three-levels.md](../../_bmad-output/planning-artifacts/sprint-change-proposal-2026-05-31-participant-removal-three-levels.md)
- [TroupeBaselineRole.kt](../../services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeBaselineRole.kt) — today `MEMBER`, `TROUPE_ADMIN` only
