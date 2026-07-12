# ADR-0022: Season participation mode and troupe role lifecycle

- **Status:** Accepted
- **Date:** 2026-07-12
- **Accepted:** 2026-07-12 (Patrice)
- **Builds on:** [ADR-0021](0021-troupe-externes-carnet-invitations.md) (carnet, invitation scope, guest access), story **3.25** (guest scoped app access), investigation [member-externe-conversion-investigation.md](../../_bmad-output/implementation-artifacts/investigations/member-externe-conversion-investigation.md)
- **Related:** ISSUES **LIMIT-005** (Laetitia Landelle / V1 import); DOMAIN.md participation mode glossary

## Context

ADR-0021 introduced **`EXTERNE`** carnet entries, **`invitation_scope`** on season participants (`SEASON` | `EVENT`), and guest app access for linked accounts. It assumed externes are **created** through organizer add flows, not **converted** from existing **`MEMBER`** rows after V1 migration or real-life role changes.

Production recette (2026-07-12, La Malice) surfaced **LIMIT-005**: a recurring guest imported as **`MEMBER`** cannot be downgraded to **`EXTERNE`** via UI, CSV, or API. Workarounds (deactivate member then add externe) fail because `(troupe_id, user_id)` allows only one membership row.

Product direction (Patrice, 2026-07-12):

- **Bidirectional** troupe role lifecycle: **`MEMBER` ↔ `EXTERNE`** over time.
- **Per-season participation** may differ: member on season A, invited guest on season B (including after leaving full membership).
- **HatCast account remains optional** for externes; when linked, self-service dispos on in-scope events (ADR-0021 unchanged).

Today:

- `troupe_memberships.baseline_role` is **singular** per user per troupe.
- Active **`MEMBER`** triggers **`ensureMembershipParticipants`** → auto roster on **all** seasons.
- Access guards mix **troupe role** and **invitation scope**; historical season rows do not record **how** the person participated that season once troupe role changes.

## Decision

### 1. Two complementary concepts

| Concept | Storage | Meaning |
| ------- | ------- | ------- |
| **Troupe baseline role (current default)** | `troupe_memberships.baseline_role` | **`MEMBER`** / **`TROUPE_ADMIN`** / **`EXTERNE`**. Drives **default for new seasons** only: member sync vs invite-only. |
| **Season participation mode** | `season_participants.participation_mode` | How this person participates **on this season**, independent of current troupe role. |

**Normative enum `SeasonParticipationMode`:**

| Mode | French UI (admin roster) | `invitation_scope` | Member/guest access on **this season** |
| ---- | ------------------------ | ------------------- | -------------------------------------- |
| **`MEMBER_SYNC`** | Membre troupe | `NULL` | Full member season workspace (if troupe membership active at access time **or** historical member row — see §3) |
| **`GUEST_SEASON`** | Externe saison | `SEASON` | Guest partial workspace (ADR-0021 / story 3.25 Laetitia) |
| **`GUEST_EVENT`** | Externe spectacle | `EVENT` | Guest partial workspace — event scope (Ruben) |

Legacy name-only / managed rows without `troupe_membership_id` keep existing `ParticipantKind`; when `participation_mode` is set, it **wins** for access and UI badges.

### 2. Troupe role lifecycle (bidirectional)

Organizers with **Membres admin** may:

| Transition | API / UI | Effects |
| ---------- | -------- | ------- |
| **`MEMBER` → `EXTERNE`** | « Passer en externe » | Same `troupe_memberships` row: `baseline_role = EXTERNE`. **No** hard delete. Prompt: which **active** season rows become **`GUEST_SEASON`** vs **`REMOVED`**. **Past** seasons: default **preserve** existing `MEMBER_SYNC` rows (historical truth). Stop auto-sync on **new** seasons. Optional linked account **retained**. |
| **`EXTERNE` → `MEMBER`** | « Réintégrer comme membre » | Same row: `baseline_role = MEMBER`. Trigger **`ensureMembershipParticipants`** for active seasons (respecting `SEASON_ADMIN` removals). Clear `participation_mode` → **`MEMBER_SYNC`** on re-synced rows. |
| **`TROUPE_ADMIN`** | Unchanged | Last-admin guard; no direct downgrade to EXTERNE without demotion first (existing rules). |

**Forbidden:** creating a second membership row for the same `(troupe_id, user_id)` to simulate conversion.

CSV import: allow role transitions via dedicated externe/member rows with explicit validation (extends story **2.3**).

### 3. Access resolution order

For a signed-in user on **season S / event E**:

1. **Platform admin** → full access (unchanged).
2. **`season_participants.participation_mode`** for **(S, user)** (or linked membership) → primary:
   - **`MEMBER_SYNC`** → member season workspace **if** active **`MEMBER`/`TROUPE_ADMIN`** **or** row is historical member-sync and PO policy allows read-only stats/historique on past member seasons (MVP: same as active member for **past** seasons where mode is `MEMBER_SYNC`; **future** seasons require active membership or guest mode).
   - **`GUEST_SEASON`** / **`GUEST_EVENT`** → **`GuestInvitationAccessService`** (story 3.25), keyed on scope + exclusions — **not** `requireActiveMemberMembership`.
3. **Fallback** (migration window only): derive mode from legacy `invitation_scope` + `troupe_membership.baseline_role` when `participation_mode` IS NULL.

**Clarification:** **`GuestInvitationAccessService.isActiveTroupeMember`** remains « active baseline role ≠ EXTERNE ». Season mode **`MEMBER_SYNC`** on a past season **does not** grant troupe hub browse-all-seasons if current role is **`EXTERNE`** — only season-scoped member surfaces for that season.

### 4. Account optional (unchanged, explicit)

Carnet **`EXTERNE`** and guest modes **do not require** `users` account or email.

| Account | Organizer | Guest |
| ------- | --------- | ----- |
| **Absent** | Roster, composition assign, proxy dispos | No self-service |
| **Linked** | Same + notifications 8.3 when on roster | Self-service dispos + `/agenda` in scope |

### 5. V1 migration class (Laetitia)

Post-import **`MEMBER`** rows may be converted via §2 without SQL. Acceptance scenario documented in story **2.26** Dev Notes.

## Consequences

### Positive

- Matches real troupe life cycle (active member → recurring MC guest).
- Preserves **historical** season participation semantics.
- Closes **LIMIT-005** with product path, not ops SQL.
- Clarifies account-optional vs account-linked externes for organizers.

### Negative / cost

- Flyway **`participation_mode`** + backfill on `season_participants`.
- Refactor **`ParticipantKind` / DTO badges** to prefer season mode over **current** `baseline_role`.
- Update **`GuestInvitationAccessService`**, **`UserAgendaRepository`**, **`ensureMembershipParticipants`**, Membres UI.
- Amend **ADR-0021** cross-references; story **3.25** out-of-scope note on EXTERNE→MEMBER **superseded** for this ADR.

### Out of scope (this ADR)

- Self-service invite (Epic 7).
- Per-season **different troupe roles simultaneously** without lifecycle transition (e.g. MEMBER troupe + guest-only season B while still MEMBER on season A **without** admin removal/sync control) — use **`MEMBER_SYNC` + SEASON_ADMIN removal** on B plus explicit **`GUEST_*`** row, or convert troupe role; full concurrent dual-mode automation deferred.
- Mandatory email on carnet.

## Alternatives considered

| Alternative | Why not chosen |
| ----------- | ---------------- |
| **SQL one-off only (LIMIT-005 workaround)** | PO rejected; not repeatable for other troupes |
| **Troupe conversion only, no season mode** | Loses « membre saison 2024, externe 2025 » labelling and breaks access after role change |
| **Separate `troupe_contacts` table** | Rejected in ADR-0021 |
| **Keep blocking MEMBER→EXTERNE** | Contradicts 2026-07-12 product direction |

## Implementation phasing (inform PLAN)

| Phase | Deliverable |
| ----- | ------------- |
| **P0 — Spec** | This ADR **Accepted**; DOMAIN.md; story **2.26** |
| **P1 — Schema + API** | Flyway V69; enum; backfill; conversion endpoints |
| **P1 — Guards** | Access services use season mode |
| **P1 — UI** | Membres admin conversion dialogs |
| **P2 — CSV + migration playbook** | Import transitions; doc for La Malice |

## References

- [0021-troupe-externes-carnet-invitations.md](0021-troupe-externes-carnet-invitations.md)
- [DOMAIN.md](../../DOMAIN.md)
- [ISSUES.md](../../ISSUES.md) LIMIT-005
- Story **2.26** — `_bmad-output/implementation-artifacts/2-26-participation-mode-role-lifecycle.md`
