# Sprint Change Proposal — Troupe externes (carnet), invitation scope, and upward inclusion cascade

**Date:** 2026-06-06  
**Project:** hatcast  
**Status:** Approved for implementation (Patrice, 2026-06-06)  
**Trigger:** Product recette and design session (2026-06-06). Story **3.8c** (Lot A typeahead) suggests **active troupe members only** — wrong path for recurring/event guests (e.g. Piotrix, Ruben). Story **3.8** / **FR44** event-only add does not promote to carnet → externals are not rediscoverable at the next spectacle. Stakeholder direction validated and recorded in **[ADR-0021](../../docs/adr/0021-troupe-externes-carnet-invitations.md)** (Accepted 2026-06-06). **DOMAIN.md** and **ARCH.md** updated; **runtime not implemented** (`TroupeBaselineRole` = `MEMBER` | `TROUPE_ADMIN` only).

**Related artifacts:** ADR-0021, DOMAIN.md (externes / cascade), sprint-change-proposal 2026-05-31 (three-level removal — **downward** cascade unchanged), plan-participant-roster-ux-enhancements.md (Lot A/B), story 3.8, story 3.8c, story 2.8 (Membres admin).

---

## 1. Issue Summary

HatCast V2 already separates **troupe membership**, **season participants**, and **event participants** (story 3.8, FR43–FR45). In practice, troupes work with two kinds of recurring guests that the current model does not serve well:

| Persona | Need | Failure today |
|---------|------|---------------|
| **Laetitia** (MC, season deal) | Season roster + dispos on all season events without full member access | No `EXTERNE` carnet; no `SEASON` invitation scope |
| **Ruben** (DJ Cambo, one-off) | Event history + carnet recall next time | Event-only row (FR44 AC3); **no carnet upsert**; typeahead cannot find him |
| **« DJ local »** | Name-only carnet contact, no account/email | No troupe-level anchor outside season/event rows |
| **Piotrix** | Appears in typeahead only after first organizer add | Correct once carnet exists; blocked until P1–P3 |

**Root cause:** Product treated « external contributor » as **orphan participant rows** without a troupe **carnet** (`EXTERNE` membership), **invitation scope** (season vs event), or **upward inclusion on add**. Lot A typeahead (3.8c) correctly reused `listMembers(ACTIVE MEMBER|ADMIN)` per its AC — but that pool is insufficient once carnet is normative.

**Evidence:**

- `TroupeBaselineRole.kt` — enum has `MEMBER`, `TROUPE_ADMIN` only.
- `participant-member-suggestions.ts` — filters `baselineRole` to member/admin paths.
- Story 3.8 AC3 — « event-only … does **not** become … season-wide participant » without carnet/scope nuance.
- ADR-0021 normative examples (Laetitia, Ruben, DJ local, Piotrix) — accepted 2026-06-06.

---

## 2. Normative model — Three layers + upward inclusion (authoritative)

This section is **authoritative** for product, domain, API, and UI work triggered by this proposal. Full detail: [ADR-0021](../../docs/adr/0021-troupe-externes-carnet-invitations.md).

### 2.1 Third baseline troupe role: `EXTERNE`

| Role | French UI | Grants by itself |
|------|-----------|------------------|
| `MEMBER` | Membre | Member read access; synced to season rosters |
| `TROUPE_ADMIN` | Admin·istrateur·ice de troupe | Troupe administration |
| `EXTERNE` | Externe | **Carnet only** — organizer recall in admin; **no** member hub / browse-all-seasons |

**Carnet entry:** display name **required**; email and HatCast account **optional** (name-only valid). Single admin surface: `/troupe/:slug/admin/membres` (filter/chip Membre · Admin · Externe).

### 2.2 Three layers: carnet · invitation · account

| Layer | Entity | Grants |
|-------|--------|--------|
| **A — Carnet** | `troupe_memberships` `baseline_role = EXTERNE`, `ACTIVE` | Nothing in member app except future invitations |
| **B — Invitation scope** | Active `season_participants` (+ event rows / exclusions) | Dispos, notifications, agenda **per scope** |
| **C — Account** | Linked `users` row | Self-service dispos, push/email, cross-troupe user agenda |

**Rule:** Layer A alone ≠ app access.

### 2.3 Invitation scope

| Scope | French UI | Dispos |
|-------|-----------|--------|
| `SEASON` | Externe saison | All **published** season events (minus per-event exclusions) |
| `EVENT` | Externe spectacle | Only explicitly invited spectacle(s) |
| *(none)* | — | Carnet only; not invited this season |

Event-only participants map to **`EVENT`** scope for that spectacle. **`EXTERNE` rows are not auto-synced to every season** like `MEMBER`.

### 2.4 Upward inclusion cascade on **add**

| Add surface | Minimum upsert |
|-------------|----------------|
| **Event** (spectacle admin) | `EXTERNE` carnet + event roster; season row per scope / opt-in (Ruben default: carnet + event, **no** season-wide dispos) |
| **Season** (Participants admin) | `EXTERNE` carnet + `season_participants` with `SEASON` scope (Laetitia) |
| **Reuse from carnet** | Pre-fill name/email; organizer sets scope for this invitation |

**Stable identity:** Re-inclusion reuses `troupe_membership_id`, `season_participant_id`, `event_participant_id` (SCP 2026-05-31 §2.1) — **forbidden** to mint new UUIDs on every return.

### 2.5 Removal (unchanged downward; carnet removal)

| Action | Effect |
|--------|--------|
| Event roster exclude | Local only — no upward change |
| Season roster remove | `season_participants.status = REMOVED` — **does not** remove carnet |
| Carnet remove (Membres) | `troupe_memberships.status = INACTIVE` for `EXTERNE` — history retained |
| `MEMBER` remove | Existing downward cascade (story 2.2) |

### 2.6 Guest access profile (linked account)

`EXTERNE` **must not** grant `MEMBER`-equivalent troupe read. Permitted access is **invitation-derived** (scoped dispos + user agenda per ADR-0021 §5). API guards must check **`EXTERNE` + invitation scope**, not `requireActiveMembership` alone.

---

## 3. Impact analysis

### 3.1 Epic impact

| Epic | Impact | Severity |
|------|--------|----------|
| **Epic 2 — Troupes / Membres** | **Primary (P1).** `EXTERNE` enum, Membres UI (chip/filter/add/edit/remove carnet), API guards, CSV policy for externes, **no** `ensureMembershipParticipants` sync for `EXTERNE`. Extends stories 2.2, 2.8. | High |
| **Epic 3 — Saisons / participants** | **Primary (P2–P3).** `invitation_scope`, cascade on add (season + event), amend story 3.8 / FR44; new story **3.8d** extends typeahead pool (do **not** reopen 3.8c CR). | High |
| **Epic 7 — Invitations self-service** | **Dependency clarification (post-MVP).** Story 7.1 self-service onboarding **builds on** carnet + managed participants (FR43–FR45 + ADR-0021). P4 guest access is **organizer-managed**, not Epic 7. No epic removal. | Low |
| **Epic 12 — User agenda** | **P4.** Extend FR48 paths so linked externes see invitation-scoped events on `/agenda` without member hub. | Medium |
| **Epics 5–6 — Dispos / composition** | Read paths must respect invitation scope for externes (P4); no formula change. | Medium (P4) |
| **Epic 8 — Notifications** | Future: notify scoped externes; out of P1–P3 MVP carnet. | Deferred |

**No new epic required.** Work fits Epic 2 (carnet) + Epic 3 (roster/scope/typeahead) + Epic 12 (guest agenda P4).

### 3.2 Story impact

| Story | Status | Change |
|-------|--------|--------|
| **3.8** | done | Amend AC3 + Dev Notes (FR44 scoped rules + carnet upsert); add cross-ref ADR-0021 |
| **3.8c** | done | **No CR reopen.** Lot A delivered membres-only pool per its AC. Extend via **3.8d** (P3). |
| **3.19** | done | Compatible — season remove does not touch carnet |
| **2.2 / 2.8** | done | Extend for `EXTERNE` CRUD in Membres UI |
| **2.12d** | backlog | Orthogonal (gender). May add gender on externe edit in same dialog — optional coordination |
| **7.1 / 7.2** | post-MVP | Add Depends: **2.21**, **3.23** (carnet + scope before self-service invite) |
| **New 2.21** | — | P1 carnet `EXTERNE` |
| **New 3.23** | — | P2 invitation scope + upward cascade |
| **New 3.8d** | — | P3 typeahead pool (MEMBER + ADMIN + EXTERNE + season roster) |
| **New 3.25** | — | P4 guest scoped access (dispos + agenda) |

### 3.3 Artifact conflicts

| Document | Conflict | Action |
|----------|----------|--------|
| **PRD / FR44** | « Event-only does not become season-wide participant » vs carnet + EVENT scope | Amend FR44 (§4.1) — preserve « no MEMBER access » |
| **Story 3.8 AC3** | Same as FR44 | Replace with scoped rules (§4.2) |
| **plan-participant-roster-ux-enhancements.md** | Lot A pool membres-only | Add Lot A-ext / P3 pointer to 3.8d (§4.4) |
| **DOMAIN.md** | — | **Already updated** (ADR acceptance) — verify at implementation |
| **ARCH.md** | Notes ADR-0021 not implemented | Update when P1 lands |
| **openapi/seasons.yaml** | `baselineRole` enum | Add `EXTERNE` when P1 ships |
| **Implementation** | `ensureMembershipParticipants` syncs MEMBER only today | Explicitly exclude `EXTERNE` in P1 |

### 3.4 Technical impact

| Area | Work |
|------|------|
| **DB** | Flyway: extend `baseline_role` check; optional `invitation_scope` on `season_participants` (P2) |
| **API** | `TroupeBaselineRole.EXTERNE`; membership CRUD; participant create cascade; authorization branch on all `MEMBER` read guards |
| **Frontend** | Membres admin: Externe chip, add name-only, filter; participant add dialogs: scope selector (P2), typeahead pool (P3) |
| **Tests** | Integration: Ruben event-add → carnet + event row, no season dispos; Laetitia season-add → carnet + SEASON scope; re-inclusion stable IDs; EXTERNE denied member hub |

---

## 4. Detailed change proposals

### 4.1 PRD — FR44 amendment

**Section:** Functional requirements — participant roster (FR44)

**OLD:**

> FR44: An event administrator can add or manage participants for a single event without making them troupe members or season-wide participants. Event participants may be name-only, linked to an existing HatCast user, or prelinked by email awaiting first login.

**NEW:**

> FR44: An event administrator can add or manage participants for a single event. Adding an event-scoped guest **upserts a troupe carnet entry** (`EXTERNE` membership — display name required; email and account optional) and an event roster row with **invitation scope `EVENT`** by default, so the guest can be recalled later without granting **full troupe membership** (`MEMBER`) or **season-wide availability** unless the organizer explicitly opts in to season roster inclusion with appropriate scope. Event participants may be name-only, linked to an existing HatCast user, or prelinked by email awaiting first login. Carnet removal does not destroy historical participation data.

**Rationale:** Aligns FR44 with ADR-0021 §4.1 (Ruben case). Preserves « no MEMBER access » while allowing carnet + scoped season row when opted in.

### 4.2 Story 3.8 — AC3 replacement

**Story:** 3.8 — Season and event participant rosters  
**Section:** Acceptance Criteria #3

**OLD:**

> 3. **Given** a user with `canManageEventParticipants` for a spectacle, **when** they add an **event-only** participant, **then** the participant is available **only for that event** and does **not** become a troupe member or season-wide participant — **FR44**.

**NEW:**

> 3. **Given** a user with `canManageEventParticipants` for a spectacle, **when** they add an **event-scoped** guest, **then** the system upserts an **`EXTERNE`** troupe carnet row (name required; email/account optional), creates or reuses an **event roster** row, and applies **invitation scope `EVENT`** so the guest is **not** available for season-wide dispos on unrelated spectacles unless the organizer explicitly opts in to a season roster row with documented scope — **FR44**, **ADR-0021**. The guest **must not** receive `MEMBER` baseline role or member-hub access.

**Rationale:** Replaces absolute « no season row » with scoped model + carnet anchor.

### 4.3 Story 3.8 — Dev Notes addendum (carnet / sync)

**ADD** after « Membership sync » section:

> **`EXTERNE` carnet (ADR-0021):** `ensureMembershipParticipants` syncs **`MEMBER`** and **`TROUPE_ADMIN`** only — **never** `EXTERNE`. Organizer add flows (season or event) upsert carnet + roster per upward inclusion cascade. Season participant rows for externes carry **`invitation_scope`** (`SEASON` | `EVENT`). See story **3.23**.

### 4.4 plan-participant-roster-ux-enhancements.md — Lot A follow-up

**Section:** Lot A — Typeahead on participant add

**ADD** after « Out of scope (Lot A) »:

```markdown
### Lot A — Delivered scope (2026-06-06)

Story **3.8c** shipped with **active troupe members** (`MEMBER` | `TROUPE_ADMIN`) as the suggestion pool — correct per Lot A AC. **ADR-0021** requires a follow-up:

### Lot A-ext — Typeahead carnet pool *(P3 — story 3.8d)*

**Depends:** **2.21** (carnet), **3.23** (cascade creates carnet rows on add).

**Intent:** Extend suggestion pool to **`MEMBER` + `TROUPE_ADMIN` + `EXTERNE`** active carnet rows plus existing season roster entries per UI context (ADR-0021 §4.3). Selecting a carnet entry pre-fills name/email; organizer sets invitation scope on add (P2 UI).

**Do not reopen** story 3.8c code review — implement as **3.8d**.
```

**Rationale:** Separates Lot A closure from ADR pool extension.

### 4.5 Epics.md — new story entries (summary)

**Epic 2 — ADD after story 2.12d:**

#### Story 2.21 : Troupe externes — carnet `EXTERNE` *(P1 — ADR-0021)*

**As a** troupe administrator,  
**I want** to manage **Externes** in the same Membres admin UI (name-only allowed, optional email),  
**so that** recurring and one-off guests are recallable without granting full member access.

**Acceptance criteria (summary):**

1. `TroupeBaselineRole` includes `EXTERNE`; Flyway + OpenAPI updated.
2. Membres list shows Membre · Admin · Externe (filter/chip); add externe with display name only.
3. Remove from carnet → `INACTIVE` membership; historical season/event rows retained.
4. `EXTERNE` **excluded** from `ensureMembershipParticipants` and from member-hub / `requireActiveMembership` read paths.
5. CSV import/export policy documented (externes in export; import may create `EXTERNE` rows per product rule).
6. Regression: `MEMBER` / `TROUPE_ADMIN` behaviour unchanged.

**Priority:** P1. **Depends:** 2.2, 2.8. **Blocks:** 3.23, 3.8d.

---

**Epic 3 — ADD:**

#### Story 3.23 : Invitation scope and upward inclusion on add *(P2 — ADR-0021)*

**As an** organizer adding a guest at season or event level,  
**I want** the system to upsert carnet + roster rows with the correct **invitation scope**,  
**so that** Ruben and Laetitia workflows work without a separate Membres step.

**Acceptance criteria (summary):**

1. `season_participants.invitation_scope` (`SEASON` | `EVENT`) — Flyway + OpenAPI.
2. **Season add:** upsert `EXTERNE` carnet + season row with `SEASON` scope (Laetitia).
3. **Event add:** upsert `EXTERNE` carnet + event row; default `EVENT` scope, no season-wide dispos (Ruben); optional opt-in season row.
4. Re-inclusion reuses stable IDs (match: user → email → display name on inactive externals).
5. Name-only carnet + roster paths covered by integration tests.
6. Event exclusions compose with `SEASON` scope unchanged.

**Priority:** P1 (after 2.21). **Depends:** 2.21, 3.8. **Blocks:** 3.8d, 3.25.

---

#### Story 3.8d : Participant add typeahead — carnet pool *(P3 — ADR-0021)*

**As an** organizer on « Ajouter un participant »,  
**I want** suggestions to include **Externes** and relevant roster rows,  
**so that** I can re-invite Ruben or Laetitia without retyping.

**Acceptance criteria (summary):**

1. Suggestion pool: active `MEMBER` + `TROUPE_ADMIN` + `EXTERNE` + context-appropriate season roster rows (ADR-0021 §4.3).
2. Carnet selection pre-fills name/email; scope set per 3.23 UI.
3. Preserve name-only free-text path (FR45).
4. Exclusion rules from 3.8c retained (ACTIVE season/event roster duplicates).
5. Extends `participant-member-suggestions.ts` — **no** global user search.

**Priority:** P2. **Depends:** 2.21, 3.23. **Extends:** 3.8c (does not amend done story file).

---

#### Story 3.25 : Guest scoped access for linked externes *(P4 — ADR-0021)*

**As an** external guest with a linked HatCast account,  
**I want** dispos and user agenda visibility **only** for invitation-scoped events,  
**so that** I can participate without troupe member hub access.

**Acceptance criteria (summary):**

1. `EXTERNE` + `SEASON` scope → user agenda includes season events (published); dispos on those events; **no** full season workspace as member.
2. `EXTERNE` + `EVENT` scope → agenda + dispos only on invited event(s).
3. Carnet-only → no member app access.
4. Multi-troupe invitations aggregate on `/agenda` (ADR-0011).
5. API authorization refactored: invitation-derived checks, not `MEMBER` alone.

**Priority:** P2. **Depends:** 3.23, Epic 12 (`/agenda` baseline). **Blocks:** Epic 7 self-service (soft).

---

**Epic 7 — AMEND story 7.1 Depends:**

**ADD:** Depends on **2.21**, **3.23** (carnet + managed scope must exist before self-service guest invite).

### 4.6 UI copy matrix (French) — Membres externes

| Surface | Label | Notes |
|---------|-------|-------|
| Membres list chip | Externe | Distinct from Membre / Admin |
| Add modal role | Externe | Name required; email optional hint |
| Remove carnet confirm | Retirer du carnet ? | « Ne supprime pas l'historique des spectacles. » |
| Season add scope | Externe saison | Laetitia — dispos toute la saison |
| Event add scope (default) | Externe spectacle | Ruben — ce spectacle seulement |
| Event add opt-in | Ajouter aussi à la saison | Off by default for one-shots |

---

## 5. Recommended approach

**Path:** **Direct Adjustment** — four phased stories within existing epics; normative docs largely done (P0 ✓).

| Option | Viable | Notes |
|--------|--------|-------|
| **1. Direct Adjustment** | **Yes (selected)** | ADR accepted; DOMAIN/ARCH drafted; clear P1→P4 phasing |
| **2. Rollback 3.8c** | **No** | 3.8c correct for Lot A; extend via 3.8d |
| **3. MVP scope cut** | **Partial** | P1+P2 minimum for Ruben/Laetitia admin; P4 can slip one sprint |

**Effort estimate:**

| Phase | Stories | Effort | Risk |
|-------|---------|--------|------|
| P1 Carnet | 2.21 | **Medium–High** (enum + auth refactor sweep) | **High** if `MEMBER` guards not audited |
| P2 Scope + cascade | 3.23 | **Medium** (migration + create flows) | **Medium** (match/reactivation edge cases) |
| P3 Typeahead | 3.8d | **Low–Medium** (front + API list endpoint maybe) | **Low** |
| P4 Guest access | 3.25 | **Medium** (agenda + dispos guards) | **Medium** |

**Recommended sequencing:**

```
P0 spec ✓ (ADR-0021, DOMAIN, ARCH note)
  → 2.21 (P1 carnet + guards)
  → 3.23 (P2 scope + cascade)
  → 3.8d (P3 typeahead)     ─┐ parallel ok after 3.23
  → 3.25 (P4 guest access)  ─┘
```

**Parallelism:** **2.12d** (Lot B gender) may run in parallel with P1/P2 — no hard dependency.

**Do not:** Implement P3 typeahead before P2 cascade (empty carnet pool for new event adds).

---

## 6. Checklist

- [x] **1.1** Trigger: recette 2026-06-06 + stories 3.8c / 3.8 / FR44 gap
- [x] **1.2** Problem: missing `EXTERNE` carnet, scope, upward cascade; typeahead pool too narrow
- [x] **1.3** Evidence: ADR examples, `TroupeBaselineRole.kt`, 3.8c suggestion helper
- [x] **2.1** Epic 3 still completable with new stories 3.23, 3.8d, 3.25
- [x] **2.2** Epic 2 extended (2.21); no new epic
- [x] **2.3** Epics 5–6, 8, 12 touched at P4 / notifications deferred
- [x] **2.4** Epic 7 not obsolete — depends on carnet
- [x] **2.5** Priority: P1 before P2 before P3; P4 after P2
- [x] **3.1** PRD FR44 amend (§4.1)
- [x] **3.2** Architecture/data model per ADR-0021
- [x] **3.3** Membres UI + participant add dialogs
- [x] **3.4** Tests, OpenAPI, Flyway
- [x] **4.4** Path: Direct Adjustment
- [x] **5.x** Proposal sections complete
- [x] **6.3** User approval — Patrice, 2026-06-06
- [x] **6.4** sprint-status.yaml update — 2026-06-06
- [ ] **6.5** Story files created — next: `bmad-create-story` for **2.21**

---

## 7. Implementation handoff

**Scope classification:** **Major** (domain model + authorization refactor + multi-surface UI). Backlog reorganization required across Epics 2, 3, and 12.

| Phase | Agent / skill | Invocation |
|-------|---------------|------------|
| Approve SCP | Patrice | Review §8 below |
| Story 2.21 | `bmad-create-story` | `create story 2.21 troupe externes carnet` |
| Story 3.23 | `bmad-create-story` | `create story 3.23 invitation scope cascade` |
| Story 3.8d | `bmad-create-story` | `create story 3.8d participant typeahead carnet` |
| Story 3.25 | `bmad-create-story` | `create story 3.25 externe guest scoped access` |
| Implement P1 | `bmad-dev-story` | After 2.21 ready-for-dev |
| UX copy / scope UI | `bmad-ux` | Membres Externe chip + add-dialog scope selector (before or with 3.23) |
| Auth guard audit | `bmad-investigate` | Optional pre-flight before 2.21 — list all `requireActiveMembership` / `MEMBER` read paths |
| Sprint tracking | `bmad-sprint-planning` | After approval — add stories to sprint-status.yaml |
| Amend epics.md | `bmad-create-epics-and-stories` or manual | §4.5 entries |

**Success criteria:**

1. `EXTERNE` in DB enum and OpenAPI; Membres UI manages carnet (name-only OK).
2. Event add (Ruben) → carnet + event row; **no** season-wide dispos by default.
3. Season add (Laetitia) → carnet + `SEASON` scope row.
4. Typeahead finds externes after carnet exists (3.8d).
5. Linked externe sees only scoped events on `/agenda`; denied member hub.
6. FR44 and story 3.8 AC3 amended; 3.8c remains **done**.
7. Downward removal pyramid (SCP 2026-05-31) unchanged.

**Suggested test commands (after implementation):**

```bash
cd services/api && ./gradlew test --tests '*TroupeMembership*' --tests '*SeasonParticipant*' --tests '*ParticipantController*'
cd apps/web && npm run test -w @hatcast/web -- --run admin-membres add-participant-dialog participant-member-suggestions
```

---

## 8. Approval request

Approve this proposal to:

1. Treat **[ADR-0021](../../docs/adr/0021-troupe-externes-carnet-invitations.md)** as the implementation source of truth (P0 complete).
2. Amend **FR44** and **story 3.8 AC3** per §4.1–4.2.
3. Update **plan-participant-roster-ux-enhancements.md** with Lot A-ext / **3.8d** per §4.4.
4. Add backlog stories **2.21**, **3.23**, **3.8d**, **3.25** per §4.5 and phasing §5.
5. Schedule P1→P4 in sprint-status / PLAN after story files exist.

**Approver:** Patrice — **approved 2026-06-06**  
**Next step:** run `bmad-create-story` → `create story 2.21 troupe externes carnet`

---

## 9. Traceability

| Requirement / ADR | Stories |
|-------------------|---------|
| ADR-0021 P1 carnet | 2.21 |
| ADR-0021 P2 scope + cascade | 3.23 |
| ADR-0021 P3 typeahead | 3.8d |
| ADR-0021 P4 guest access | 3.25 |
| FR43 season roster | 3.8 (amended), 3.23 |
| FR44 event-scoped guest | 3.8 AC3 (amended), 3.23 |
| FR45 name-only / email link | 2.21, 3.23, 3.8d |
| FR48 user agenda | 3.25 |
| SCP 2026-05-31 removal | Unchanged — 3.19 |
| plan Lot A (3.8c) | Done; extended by 3.8d only |
