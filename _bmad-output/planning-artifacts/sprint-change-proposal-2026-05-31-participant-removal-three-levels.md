# Sprint Change Proposal — Three-level participant removal (event / season / troupe)

**Date:** 2026-05-31  
**Project:** hatcast  
**Status:** Approved for implementation (Patrice, 2026-05-31)  
**Trigger:** Stakeholder clarification during V1→V2 migration review. Removing a person from the **season Participants** admin screen must not deactivate troupe membership. Event-level exclusions already follow a local filter model; season and troupe removals must be documented and implemented as distinct, non-cascading-up actions except where explicitly defined below.

**Related artifacts:** Story 3.8, Story 2.2 / 2.8, sprint-change-proposal-2026-05-23 (participants split), sprint-change-proposal-2026-05-23-member-removal.

---

## 1. Issue Summary

HatCast V2 distinguishes **troupe membership**, **season participants**, and **event roster** scope (sprint-change-proposal-2026-05-23). Story **3.8** specified that membership-synced rows on the season Participants screen must **not** be removed by calling troupe member deactivation; troupe removal (Story **2.2**) drives `REMOVED` on season participants as a **downstream cascade**.

**Current drift:**

| Surface | Expected (3.8 + stakeholder) | Shipped (2026-05) |
|---------|------------------------------|-------------------|
| `/saison/:slug/admin/participants` — **Retirer** on troupe member row | Season-local removal; troupe membership unchanged | Calls `DELETE /v1/troupes/{id}/members/{membershipId}` (troupe deactivation) |
| `/troupe/:slug/admin/membres` — **Retirer** | Troupe deactivation + cascade all seasons | Correct |
| Event roster — exclude participant | Local `event_participant_exclusions` filter | **Correct** (reference model) |

This caused migration cleanup issues (e.g. test account visible in season statistics after a “remove” that appeared to succeed but re-synced, or over-broad troupe removal when the admin intent was season-only).

**Root cause:** Conflation of **season roster administration** with **troupe membership administration** in the Participants UI, plus incomplete normative wording in `DOMAIN.md` on the three removal levels.

---

## 2. Normative model — Three-level removal pyramid

This section is **authoritative** for product, domain, API, and UI work triggered by this proposal.

### 2.1 Shared principles (all levels)

1. **Filter, do not destroy:** Removal at event or season scope is a **visibility / roster filter**. Historical rows (`event_availability`, composition slots, declines, audit FKs) **remain** in the database.
2. **Stable identity on re-inclusion:** Re-including a person at any level **reuses** the same domain identity (`season_participant_id`, `troupe_membership_id`, `users.id`). New UUIDs on every return would orphan history — **forbidden**.
3. **No upward cascade:** Event removal does not change season or troupe state. Season removal does not change troupe state. Only troupe removal cascades downward.
4. **Account deletion is separate:** None of these actions delete the HatCast `users` row (Story 1.7 / FR37).

### 2.2 Level 1 — Event (spectacle) exclusion *(reference implementation)*

| Attribute | Rule |
|-----------|------|
| **Admin surface** | `/saison/:slug/event/:eventSlug/admin/participants` (event roster) |
| **Action label (FR)** | Exclure du spectacle / Réintégrer au spectacle |
| **Persistence** | Row in `event_participant_exclusions` (`event_id`, `season_participant_id`) |
| **Troupe membership** | Unchanged (`troupe_memberships.status` stays `ACTIVE`) |
| **Season participant** | Unchanged (`season_participants.status` stays `ACTIVE`) |
| **UI effect** | Hidden from **this event’s** roster, availability entry for that event, draw pools for that event |
| **Season stats grid** | Participant **still counted** in season-level statistics unless also removed at season level |
| **Reversal** | Delete exclusion row (`includeSeasonParticipant`) — history for that event reappears immediately |
| **Code reference** | `EventRosterService.excludeSeasonParticipant` / `includeSeasonParticipant` |

Event exclusion is the **template** for season-local removal semantics.

### 2.3 Level 2 — Season roster removal *(to implement / restore)*

| Attribute | Rule |
|-----------|------|
| **Admin surface** | `/saison/:slug/admin/participants` |
| **Action label (FR)** | Retirer de la saison / Réintégrer à la saison |
| **Persistence** | `season_participants.status = REMOVED` (and `removed_at`) **or** dedicated season exclusion mechanism — **must not** call troupe member deactivation |
| **Troupe membership** | **Unchanged** |
| **Other seasons** | **Unchanged** — same person remains on other seasons’ rosters if they were included there |
| **UI effect** | Hidden from season participant lists, selectors, **statistics grid**, season-scoped availability summaries, composition selectors for events in **this season** |
| **Event-level exclusions** | Unchanged rows in `event_participant_exclusions`; if person is re-included at season level, prior event exclusions may still apply (local filters compose) |
| **Membership sync** | `ensureMembershipParticipants` **must not** re-activate a participant explicitly removed from **this** season while troupe membership remains `ACTIVE`. Requires a durable marker (e.g. `removal_source = SEASON_ADMIN`, or `roster_excluded_at`, or equivalent — see §4.3) |
| **Reversal** | Explicit “Réintégrer à la saison” (reactivate same `season_participants` row) — season stats and availability history **reappear** |

**Applies to all season participant kinds linked to a troupe member row (`kind = MEMBER`) and to explicit non-member participants** (existing `DELETE /seasons/{id}/participants/{id}` behavior for non-members is already season-local).

### 2.4 Level 3 — Troupe membership removal *(existing Story 2.2)*

| Attribute | Rule |
|-----------|------|
| **Admin surface** | `/troupe/:slug/admin/membres` only |
| **Action label (FR)** | Retirer de la troupe |
| **Persistence** | `troupe_memberships.status = INACTIVE` |
| **Cascade** | All `season_participants` linked via `troupe_membership_id` for **all seasons** of that troupe → `REMOVED` |
| **UI effect** | No troupe access; invisible on all season rosters, stats, selectors, dispos for that troupe |
| **Historical data** | Retained; linked by stable IDs |
| **Reversal** | Reactivate membership (toggle Actif, CSV import, or admin PATCH) → same membership row → sync re-activates season participant rows → **stats, dispos, compositions visible again** |
| **Code reference** | `TroupeMembershipService.deactivateMember`; cascade via `SeasonParticipantMembershipSync` |

Troupe removal is the **only** action that removes someone from **every** season of the troupe at once.

### 2.5 Composition of filters (example)

| Troupe | Season roster | Event exclusion | Visible on season stats? | Visible on event roster? |
|--------|---------------|-----------------|--------------------------|--------------------------|
| ACTIVE | ACTIVE | no | Yes | Yes |
| ACTIVE | ACTIVE | yes | Yes | No (this event) |
| ACTIVE | REMOVED | — | No | No |
| INACTIVE | REMOVED (cascade) | — | No | No |

---

## 3. Impact analysis

### Epic impact

- **Epic 2 (Troupes):** Clarify Membres **Retirer** = level 3 only. Minor copy already aligned.
- **Epic 3 (Saisons / participants):** **Primary** — restore Story 3.8 remove policy; fix Participants UI/API wiring.
- **Epics 5–6 (Dispos / compositions):** Read paths must respect season `ACTIVE` + event exclusion filters (mostly already true); verify stats and summary endpoints.
- No new epic required.

### Story impact

| Story | Change |
|-------|--------|
| **3.8** | Reinstate remove policy; amend AC for troupe-member rows on season Participants |
| **2.8 / member removal SCP** | Confirm scope limited to `/troupe/.../admin/membres` |
| **17.16** (event participants admin) | Document event exclusion as level 1 reference; no behavior change |
| **New story (recommended)** | **3.19** (or next free 3.x): *Season roster removal for troupe members* — API guard, sync guard, UI, tests |
| **MIG / migration runbooks** | Optional note: season-only removal sufficient for ghost participants |

### Artifact conflicts

| Document | Conflict | Action |
|----------|----------|--------|
| **Story 3.8 Dev Notes** | Correct on paper; UI violates it | Amend + implement |
| **DOMAIN.md** | Says roster ≠ membership but not three removal levels | Add §2 pyramid + invariants (§4.1) |
| **SPEC.md** | V1-heavy; FR43 not at root | Optional FR43 addendum or PRD pointer |
| **sprint-change-proposal-2026-05-23-member-removal** | Said 3.8 unchanged | Add cross-link: season removal is **not** troupe removal |
| **Implementation (admin-participants.ts)** | Calls `deactivateMember` | **Revert**; call season participant remove |

### Technical impact

- **API:** Allow season-local remove for `troupeMembershipId != null` via season participant endpoint; reject troupe deactivation from season participants route.
- **Sync:** `ensureMembershipParticipants` must skip or not resurrect season-admin-removed rows.
- **Frontend:** Participants confirm/snackbar copy (season scope); link to Membres for troupe-wide removal (optional secondary action).
- **Tests:** Integration test — remove from season A, still on season B; troupe remove cascades both; reactivation restores history.
- **Partial fix already merged:** Troupe deactivate no longer re-activates season rows on list GET — necessary but **not sufficient** for season-local removal.

---

## 4. Detailed change proposals

### 4.1 DOMAIN.md — new business rules (proposed insert after “Soft deactivation for members”)

```markdown
- **Three-level participant removal (V2):** Roster visibility is scoped at event, season, or troupe level. None of these delete historical availability, composition, or audit data.
  - **Event exclusion:** `event_participant_exclusions` hides a season participant from one event’s roster only. Does not change troupe membership or season participant status.
  - **Season roster removal:** Sets `season_participants.status = REMOVED` for that season only (or equivalent exclusion). Does not change `troupe_memberships`. Other seasons unaffected. Membership sync must not re-activate season-admin removals while membership stays ACTIVE.
  - **Troupe membership removal:** Sets `troupe_memberships.status = INACTIVE` and cascades `REMOVED` on all linked season participants for that troupe. Revokes troupe app access. Reactivation reuses the same membership and participant rows so historical data becomes visible again.
- **Season participant roster** is distinct from **troupe membership** (see league participant roster rule above). A troupe member may be absent from one season’s roster while remaining an active troupe member.
```

### 4.2 Glossary additions (DOMAIN.md)

- **Season participant (V2):** Person on a season roster (`season_participants`). May be synced from troupe membership or added explicitly (name-only, linked user, prelinked email).
- **Event roster exclusion (V2):** Local filter (`event_participant_exclusions`) — participant hidden for one event only.
- **Season roster removal (V2):** Local soft removal from one season’s active roster — not troupe deactivation.

### 4.3 Story 3.8 — Remove policy (proposed replacement for § Dev Notes “Remove policy”)

**Replace:**

> Membership-synced row → do not DELETE on admin “Retirer”; removing troupe membership (story 2.2) drives REMOVED state. Admin UI should disable Retirer for synced member rows or explain “Retirer le membre depuis Membres”.

**With:**

> **Season admin “Retirer”** (including rows synced from troupe membership): soft-remove **this season’s** participant row (`REMOVED`). Does **not** deactivate troupe membership. Troupe admins remove someone from the **entire troupe** only from `/troupe/:slug/admin/membres` (Story 2.2).  
> **Membership sync:** upserts ACTIVE season rows for ACTIVE troupe memberships **except** rows explicitly removed at season scope (must persist exclusion across GET/list sync).  
> **Re-inclusion:** admin action or explicit “Réintégrer à la saison” reactivates the same row; historical FKs remain valid.

### 4.4 New story sketch — 3.19 Season roster removal (troupe members)

**As a** season administrator,  
**I want** to remove a troupe member from **this season’s roster** without removing them from the troupe,  
**so that** they disappear from season stats and selectors but remain a troupe member (other seasons unaffected).

**Acceptance criteria (summary):**

1. Participants admin **Retirer** on `kind=MEMBER` calls season participant remove, **not** troupe `DELETE /members`.
2. Confirm copy states season scope; optional link “Retirer de la troupe…” → Membres.
3. Snackbar: `Membre retiré de la saison.`
4. Troupe membership stays `ACTIVE`; other seasons unchanged.
5. Stats / selectors / dispos for **this season** hide the person; historical rows kept.
6. `GET /participants` sync does not restore them.
7. Réintégrer restores visibility and history.
8. Troupe Membres **Retirer** still cascades all seasons (regression test).

**Implementation note — sync guard (pick one):**

- **Option A (preferred):** `season_participants.removal_source` enum: `NULL | SEASON_ADMIN | MEMBERSHIP_INACTIVE`. Sync only re-ACTIVATE when source is `MEMBERSHIP_INACTIVE` or null on first create.
- **Option B:** Separate `season_participant_exclusions`-style table at season scope (parallel to event) — more symmetric but new migration.

Recommend **Option A** for minimal schema change; document in ADR if enum added.

### 4.5 UI copy matrix (French)

| Surface | Title | Body (summary) | Success |
|---------|-------|----------------|---------|
| Participants saison | Retirer de cette saison ? | Disparaît du roster, stats et sélecteurs **de cette saison**. Adhésion troupe conservée. | Membre retiré de la saison. |
| Membres troupe | Retirer de la troupe ? | Retiré de la troupe et de **toutes** les saisons. Compte HatCast conservé. | Membre retiré de la troupe. |
| Event roster | (existing) Exclure du spectacle | Local à ce spectacle. | (existing) |

### 4.6 PRD / FR43 addendum (optional)

> FR43b: A season administrator can remove a participant from a **season roster** without deactivating troupe membership. Removal is a soft filter at season scope; historical participation data for that season is retained and becomes visible again if the participant is re-included. Event-level exclusions remain a separate, narrower filter.

---

## 5. Recommended approach

**Path:** Direct Adjustment + one focused story (3.19).

**Effort:** Medium (API + sync guard + UI revert + tests).  
**Risk:** Medium if sync guard omitted (bug recurrence). Low once guard is tested.

**Do not:** Treat copy-only changes as sufficient.

**Revert:** Admin Participants must stop calling `TroupeApiService.deactivateMember` for member rows.

---

## 6. Checklist

- [x] Trigger identified: migration ghost participant + stakeholder season vs troupe clarification
- [x] Story 3.8 and participants split SCP support the fix
- [x] Event exclusion validates local-filter pattern in production code
- [x] DOMAIN.md gap identified
- [x] No epic replan required
- [x] Patrice approval (2026-05-31)
- [x] DOMAIN.md updated after approval
- [x] Story 3.19 created in implementation-artifacts
- [x] PLAN.md slice scheduled (Pre-prod / migration table, P1 ready-for-dev)

---

## 7. Implementation handoff

**Scope classification:** Medium (domain + API + UI).

**Route to:** Developer agent (after approval).

**Success criteria:**

1. Three admin surfaces map to three levels (§2 table) — verified by integration tests.
2. Season remove does not call troupe member DELETE.
3. Troupe remove cascades all seasons; reactivation restores stats/dispos visibility.
4. Event exclude unchanged; documented as level 1.
5. DOMAIN.md contains normative pyramid.
6. No hard delete of availability/composition history in any path.

**Suggested test commands:**

```bash
cd services/api && ./gradlew test --tests '*ParticipantController*' --tests '*SeasonParticipant*'
cd apps/web && npm run test -- --run admin-participants admin-membres
```

---

## 8. Approval request

Approve this proposal to:

1. Update **DOMAIN.md** with the three-level removal model (§4.1–4.2).
2. Create story **3.19** and amend **3.8** remove policy (§4.3).
3. Implement season-local removal and sync guard (§4.4).
4. Revert Participants admin troupe deactivation wiring.

**Approver:** Patrice  
**On approval:** set **Status** to `Approved for implementation (Patrice, YYYY-MM-DD)` and add a PLAN.md task reference.
