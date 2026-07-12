# Investigation: Member ↔ Externe conversion and scoped participation model

## Hand-off Brief

1. **What happened.** Product intent (Patrice, 2026-07-12) requires bidirectional MEMBER ↔ EXTERNE conversion and season-varying guest participation; runtime blocks troupe-level conversion in both directions and models participation scope only at season/event roster level — **Confirmed** gap vs stated intent (**LIMIT-005**).
2. **Where the case stands.** **Concluded** — three-layer model (ADR-0021) is implemented for net-new externes; missing product surface is **role lifecycle** (conversion + per-season invitation policy), not the core externe feature set.
3. **What's needed next.** **`bmad-create-story`** (or SCP + DOMAIN amend) for « Member / externe role lifecycle » covering MEMBER→EXTERNE, EXTERNE→MEMBER, roster/scope backfill rules, and Laetitia-class V1 migration — before **`bmad-dev-story`**.

## Case Info

| Field            | Value                                                                 |
| ---------------- | --------------------------------------------------------------------- |
| Ticket           | LIMIT-005 (related); product thread opened 2026-07-12                 |
| Date opened      | 2026-07-12                                                            |
| Status           | Concluded                                                             |
| System           | HatCast V2 — Angular + Spring + Neon; prod recette La Malice (M4)     |
| Evidence sources | ADR-0021, DOMAIN.md, stories 2.21/3.23/3.25, ISSUES.md, Kotlin API   |

## Problem Statement

Patrice states (2026-07-12):

- Conversion **membre → externe** and **externe → membre** should be supported (not SQL one-offs).
- Participation mode may **vary by season** (e.g. former members become season-scoped guests).
- Unclear what externes can/cannot do vs members at **troupe / season / event** levels.
- Case exemplar: **Laetitia Landelle** (La Malice) — imported as MEMBER from V1; should behave as season-scoped externe (MC deal), including past season.

**Initial claim treated as hypothesis** — verified against code and normative docs.

## Evidence Inventory

| Source                                      | Status    | Notes                                                                 |
| ------------------------------------------- | --------- | --------------------------------------------------------------------- |
| ADR-0021                                    | Available | Three layers; Laetitia/Ruben examples; no conversion lifecycle        |
| DOMAIN.md                                   | Available | Carnet, invitation scope, sync rules                                  |
| Story 2.21 (done)                           | Available | EXTERNE carnet CRUD; no MEMBER conversion                             |
| Story 3.23 (done)                           | Available | invitation_scope SEASON/EVENT on add                                  |
| Story 3.25 (done)                           | Available | Guest access matrix; **EXTERNE→MEMBER out of scope**                |
| ISSUES.md LIMIT-005                         | Available | Observed prod gap; deferred post-M4                                   |
| TroupeMembershipService.kt                  | Available | Blocks PATCH to EXTERNE; EXTERNE→MEMBER blocked                     |
| GuestInvitationAccessService.kt             | Available | Member vs guest authorization split                                   |
| SeasonParticipantService.kt                 | Available | ensureMembershipParticipants skips EXTERNE                            |
| GuestEventAccessJpql.kt                     | Available | NULL scope treated as SEASON-wide in JPQL                           |
| V1 export scripts                           | Available | members.csv: MEMBER/TROUPE_ADMIN only                                 |
| PO validation of season-only dual-role      | Missing   | Need confirm: same person MEMBER troupe + guest one season?           |

## Investigation Backlog

| # | Path to Explore                         | Priority | Status | Notes                                      |
| - | --------------------------------------- | -------- | ------ | ------------------------------------------ |
| 1 | ADR-0021 three-layer model              | High     | Done   | Stronghold                                 |
| 2 | API conversion guards                   | High     | Done   | PATCH/CSV/addExterne                       |
| 3 | Guest vs member access matrix (3.25)    | High     | Done   | Table in story                             |
| 4 | invitation_scope NULL semantics         | Medium   | Done   | Inconsistency guest workspace vs JPQL      |
| 5 | Per-season “dual role” product need     | High     | Open   | PO: troupe role singular vs season invite  |
| 6 | SPEC.md FR43–FR45 explicit text         | Low      | Partial| DOMAIN/ADR richer than SPEC grep           |

## Timeline of Events

| Time        | Event                                              | Source                    | Confidence  |
| ----------- | -------------------------------------------------- | ------------------------- | ----------- |
| 2026-06-06  | ADR-0021 accepted — externes carnet + scope        | docs/adr/0021             | Confirmed   |
| 2026-06-06  | Stories 2.21, 3.23, 3.8d, 3.25 delivered           | deferred-work.md          | Confirmed   |
| 2026-07-12  | LIMIT-005: Laetitia MEMBER post-V1 import; no UI   | ISSUES.md                 | Confirmed   |
| 2026-07-12  | PO: wants bidirectional conversion + season vary   | User message              | Confirmed   |

## Confirmed Findings

### Finding 1: Three participation layers exist and are implemented

**Evidence:** `docs/adr/0021-troupe-externes-carnet-invitations.md` §2–§5; `DOMAIN.md` lines 13, 41–43, 98, 107.

**Detail:**

| Layer | Storage | Admin surface | Grants by itself |
| ----- | ------- | ------------- | ---------------- |
| **A — Carnet troupe** | `troupe_memberships.baseline_role = EXTERNE` | Membres admin | **Nothing** in member app |
| **B — Invitation roster** | `season_participants` (+ optional `event_participants`, exclusions) with `invitation_scope` | Participants saison / spectacle | Dispos, agenda, partial workspace (if linked account) |
| **C — Compte HatCast** | `users` link on membership or participant | — | Self-service dispos, notifications, `/agenda` |

`MEMBER`/`TROUPE_ADMIN` use layer A with **full member read** + auto roster sync; `EXTERNE` uses layer A as contact book only.

### Finding 2: Troupe-level role is singular per (troupe, user)

**Evidence:** `services/api/src/main/resources/db/migration/V59__troupe_externe_carnet.sql` lines 19–20 (unique index `troupe_id, user_id`); `TroupeExterneCarnetService.kt` lines 134–150.

**Detail:** One `troupe_memberships` row per linked user per troupe. Cannot hold simultaneous ACTIVE MEMBER and EXTERNE rows. Per-season variation is expressed via **roster + invitation_scope**, not duplicate troupe roles.

### Finding 3: MEMBER → EXTERNE conversion is explicitly blocked

**Evidence:** `TroupeMembershipService.kt` lines 566–572 (`updateMember`); lines 398–402 (`addMemberByEmail`); `TroupeMemberCsvImportService.kt` lines 72–78; `ISSUES.md` LIMIT-005.

**Detail:** API returns 400 *« Utilisez l'ajout Externe pour les entrées carnet. »* Workaround deactivate-then-addExterne **also fails** — inactive MEMBER row retains `(troupe_id, user_id)` unique slot; `addExterne` cannot insert second row (`TroupeExterneCarnetService.kt` lines 76–90).

### Finding 4: EXTERNE → MEMBER promotion is out of scope / blocked

**Evidence:** `TroupeMembershipService.kt` lines 558–564; story `3-25-externe-guest-scoped-access.md` line 48 (*Out of scope: EXTERNE → MEMBER promotion*).

**Detail:** PATCH promoting externe to MEMBER/ADMIN rejected. CSV import rejects promoting externe to member (`TroupeMemberCsvImportService.kt` lines 64–70).

### Finding 5: MEMBER auto-sync vs EXTERNE explicit invite

**Evidence:** `SeasonParticipantService.kt` lines 771–773 (`ensureMembershipParticipants` skips EXTERNE); `SeasonParticipantMembershipSync.kt` lines 26–28.

**Detail:** Active **MEMBER** is auto-added/reactivated on season rosters when sync runs. **EXTERNE** is never auto-synced — must be added via Participants admin (upserts carnet + `invitation_scope = SEASON` per `SeasonParticipantService.create` lines 127–177).

### Finding 6: Guest access matrix is implemented (story 3.25)

**Evidence:** `3-25-externe-guest-scoped-access.md` lines 127–142; `GuestInvitationAccessService.kt` lines 41–63, 191–235.

**Detail:** See § Deduced Conclusions — capability table.

### Finding 7: invitation_scope NULL semantics are inconsistent for converted rows

**Evidence:** `GuestInvitationAccessService.resolveGuestSeasonWorkspaceMode` lines 56–57 (requires explicit `SEASON`); `canAccessEventAsGuest` lines 203–214 (`null -> Unit`); `GuestEventAccessJpql.kt` lines 24–26 (`NULL OR SEASON` for agenda SQL).

**Detail:** Member-synced participants have `invitation_scope = NULL`. After hypothetical MEMBER→EXTERNE conversion without backfill, guest **workspace mode may be NONE** while some JPQL paths may still treat NULL as season-wide for event listing — **risk for conversion story**.

## Deduced Conclusions

### Deduction 1: “Varier par saison” is already modeled at roster layer, not troupe role layer

**Based on:** Findings 1, 2, 5.

**Reasoning:** ADR-0021 separates troupe carnet (stable identity) from season invitation (scope). An externe can be on season A roster (`SEASON`) and absent from season B. A member is on all seasons via sync unless season-admin **Retirer** (with `removal_source = SEASON_ADMIN` blocking re-sync).

**Conclusion:** PO intent “former member becomes guest on some seasons” maps to **MEMBER → EXTERNE at troupe level** + **explicit season roster rows** per invited season — not two troupe roles in parallel.

### Deduction 2: Patrice’s bidirectional conversion request contradicts current spec boundaries

**Based on:** Findings 3, 4; story 3.25 out-of-scope note.

**Reasoning:** Implementation deliberately treated externe as create-only carnet entry. Conversion was deferred as LIMIT-005, not accidental omission alone.

**Conclusion:** Product direction change is **valid** but requires **normative update** (DOMAIN + ADR amendment or new ADR) and **new stories** — not a bugfix on existing UI.

### Capability comparison (member vs externe)

**Based on:** Finding 6 + ADR-0021.

| Capability | MEMBER / TROUPE_ADMIN | EXTERNE (carnet only) | EXTERNE + invitation SEASON | EXTERNE + invitation EVENT |
| ---------- | --------------------- | --------------------- | ----------------------------- | -------------------------- |
| `/troupes` list (Mes troupes) | Yes | No | Yes (read-only hub if invited) | Yes (read-only hub if invited) |
| Browse all troupe seasons | Yes | No | Invited seasons only | Invited season partial |
| Auto-added to new season roster | Yes (sync) | No | No — org must invite | No |
| `/saison/…` Historique / Stats | Yes | No | **No** / **No** | Historique in-scope only / No Stats |
| Dispos on in-scope events | Yes | No | Yes | Yes (invited event(s) only) |
| Dispos on other season events | Yes (if on roster) | No | **No** | **No** |
| Admin Membres / Participants | Admin only | No | No | No |
| Notifications 8.3 | Yes | No | Yes if on roster + linked account | Yes if on event roster |

## Hypothesized Paths

### Hypothesis 1: PO wants true per-season troupe role (MEMBER on S1, EXTERNE on S2 concurrently)

**Status:** Open

**Theory:** Same person could be full member for one season and guest for another without troupe-level conversion.

**Would confirm:** PO explicitly rejects troupe-level single role; asks for season-scoped `baseline_role`.

**Would refute:** PO accepts “externe carnet + invite per season” as sufficient (Laetitia pattern).

**Resolution:** Unresolved — current data model cannot represent this without spec change (season-level membership role).

### Hypothesis 2: Bidirectional conversion with roster backfill satisfies Laetitia + future cases

**Status:** Confirmed (pending PO ack on H1 refute)

**Theory:** One API/UI flow MEMBER→EXTERNE: change `baseline_role`, prompt admin for seasons to keep (`invitation_scope=SEASON`) vs remove; inverse flow EXTERNE→MEMBER re-enables sync.

**Supporting indicators:** ADR examples; unique membership row; LIMIT-005 notes.

**Would confirm:** PO approves story scope.

**Resolution:** Preferred trajectory unless H1 confirmed.

### Hypothesis 3: LIMIT-005 is spec gap not defect

**Status:** Confirmed

**Theory:** ADR-0021 defined create flows; conversion was known deferred.

**Resolution:** ISSUES.md LIMIT-005 cause section aligns; user now elevates to required product capability.

## Missing Evidence

| Gap | Impact | How to Obtain |
| --- | ------ | ------------- |
| PO choice: troupe-level conversion vs per-season role | Determines data model | Workshop / reply to H1 |
| Laetitia prod IDs (membership, seasons) | Migration acceptance test | Neon read-only query on La Malice |
| Whether past-season “externe” is label-only or access change | UX copy vs guards | PO: should she lose Historique on past season? |

## Source Code Trace

| Element | Detail |
| ------- | ------ |
| Error origin | `TroupeMembershipService.updateMember` — MEMBER→EXTERNE rejection |
| Trigger | Admin PATCH member or CSV import with role change |
| Condition | `targetRole == EXTERNE && membership.baselineRole != EXTERNE` |
| Related files | `TroupeExterneCarnetService.kt`, `SeasonParticipantService.kt`, `GuestInvitationAccessService.kt`, `edit-troupe-member-dialog.ts` |

## Conclusion

**Confidence:** **High** on current runtime behaviour and gaps; **Medium** on recommended product shape (depends on H1).

**Confirmed:** HatCast V2 implements ADR-0021 **create** paths for externes (carnet, season/event scope, guest app access). Troupe **`baseline_role` is singular** per user. **MEMBER↔EXTERNE conversion is blocked** in API/UI. Season-level variation is via **`season_participants` + `invitation_scope`**, not parallel troupe roles.

**Product trajectory (recommended):**

1. **Amend normative docs** — DOMAIN + ADR-0021 § lifecycle: conversions allowed both ways; season roster policy on downgrade.
2. **Story « Role lifecycle » (P1)** — Admin Membres: « Passer en externe » / « Réintégrer comme membre » with confirmation copy and roster checklist.
3. **API** — `convertToExterne(membershipId, { seasonIdsToScope?: UUID[] })` mutates same row; sets `invitation_scope` on selected ACTIVE season participants; optional REMOVED elsewhere; stops sync. Inverse `convertToMember` triggers `ensureMembershipParticipants` + clears guest-only scopes where appropriate.
4. **V1 migration follow-up** — optional export flag or post-import wizard for recurring guests (Laetitia class).
5. **Fix NULL scope consistency** — after conversion, force `SEASON` on retained rows; align `canAccessEventAsGuest` with workspace mode.

**Not recommended:** Ad-hoc SQL in prod as primary path (PO aligned).

## Recommended Next Steps

### Fix direction (product + engineering)

| Mechanism | Change |
| --------- | ------ |
| Normative | ADR-0021 amendment or ADR-0022 « membership role lifecycle » |
| API | Conversion endpoints + audit; backfill `invitation_scope` |
| UI | Membres admin actions + season picker on downgrade |
| Tests | Laetitia integration; regression member sync; guest matrix |
| ISSUES | Close LIMIT-005 when story ships |

### Diagnostic

- PO answer Hypothesis 1 (season-dual-role vs troupe conversion).
- Define Laetitia acceptance: which seasons `SEASON`, hub access expectations on past season.

## Reproduction Plan

1. Import or seed user as MEMBER on troupe with 2 seasons; verify auto roster on both.
2. Attempt PATCH `baselineRole: EXTERNE` → **400** (Confirmed).
3. Add same user as externe via POST `/externes` while ACTIVE MEMBER → **409**.
4. Deactivate member → season participants REMOVED; POST `/externes` with same email → **409/500** (unique row).
5. After future conversion story: repeat → EXTERNE + selected `SEASON` scopes only; guest cannot dispo on non-invited season.

## Side Findings

- **ARCH.md** may still state externe « non implémenté » — stale vs deferred-work closure (cosmetic doc drift).
- Story **3.25** explicitly deferred EXTERNE→MEMBER — reversing that is a deliberate scope expansion.
- Seed **Laetita** ≠ prod **Laetitia Landelle** (recette 3.8d doc).

## Follow-up: 2026-07-12

### New Evidence

User (Patrice): prefers functional clarification + product evolution over SQL; expects bidirectional conversion; season-varying participation; wants externe capability matrix understood.

### Updated Conclusion

Investigation scope expanded from LIMIT-005 workaround to **role lifecycle product line**. Case **Concluded** pending PO answer on Hypothesis 1 only.

## Follow-up: 2026-07-12 #2

### New Evidence

User (Patrice): **Externes may have a HatCast account — it is not mandatory.** Without account: organizer/admin adds them in compositions manually. When invited (email / link path): they may **create** an account or **associate** an existing one and set their own availability on in-scope spectacles.

**Evidence alignment:** ADR-0021 §1 (email and account optional; name-only valid); DOMAIN.md carnet glossary; story 2.21 AC3–4; story 3.25 (linked guest self-service dispos). Layer C is **optional**, not absent.

### Additional Findings

**Confirmed:** Prior mermaid diagram was misleading if read as « externes never have accounts ». Correct model:

| Carnet externe | Invitation (scope) | Account | Organizer experience | Guest experience |
| -------------- | ------------------ | ------- | -------------------- | ---------------- |
| Name-only | None | No | Recall in typeahead; assign in composition manually | None |
| Name ± email | None | No | Same; email enables future pre-link (FR45) | None until link |
| Any | SEASON / EVENT | **No** | Roster + composition; proxy dispos possible (orga) | Cannot self-serve dispos |
| Any | SEASON / EVENT | **Yes** (create or link) | Same roster; notifications 8.3 | Self-serve dispos + partial workspace + `/agenda` |

**Deduced:** « Invited externe » product story = layers **A + B** minimum; layer **C** unlocks self-service but is not required for carnet or roster presence.

### Updated Conclusion

No change to role-lifecycle recommendation. Clarification incorporated: account optional is **normative and implemented** — conversion story must preserve optional `user_id` on EXTERNE rows and not require account for carnet downgrade.

## Follow-up: 2026-07-12 #3

### New Evidence

User (Patrice): prefers **per-season participation mode** — member during one season, externe during another; at time T1 member, at T2 externe. « Ça va arriver dans la vraie vie. »

**Refutes (partial):** Hypothesis 2 as stated (« troupe-level conversion only ») is **insufficient** if PO requires **concurrent** seasons with different modes while troupe role is in flux, or **historical labelling** of how someone participated each season independent of current troupe role.

**Confirms:** Hypothesis 1 direction — need **season-level participation mode**, not only singular `baseline_role` + binary invite scope.

### Additional Findings

**Confirmed constraint:** Today `baseline_role` on `troupe_memberships` is **one value per user per troupe** (V59 unique index). Active **MEMBER** triggers `ensureMembershipParticipants` → auto roster on **all** seasons (`SeasonParticipantService.kt:771-773`). Therefore « externe on season B only » **cannot** coexist with active **MEMBER** troupe role without a **season-level override**.

**Deduced product model (PO-aligned):**

1. **`troupe_memberships.baseline_role`** = **current default** for *new* seasons (MEMBER → auto-sync; EXTERNE → invite-only).
2. **`season_participants.participation_mode`** (new normative field, name TBD) = how this person participates **that season**, independent of history:
   - `MEMBER_SYNC` — full member roster row (NULL `invitation_scope`, member access path)
   - `GUEST_SEASON` — externe-style season invite (`invitation_scope = SEASON`)
   - `GUEST_EVENT` — externe-style event invite (`invitation_scope = EVENT`)
3. **Temporal transitions:** MEMBER at T1 → rows on past seasons stay `MEMBER_SYNC`; at T2 troupe role → EXTERNE → **new** seasons require explicit `GUEST_*` add; no retroactive rewrite of past season mode.
4. **Access guards** use **season row mode** (or derived from mode + scope), not troupe `baseline_role` alone, for dispos/agenda on that season.

**Alternative rejected for PO intent:** Troupe-level conversion only without per-season mode — loses « membre saison 2024, externe saison 2025 » semantics in UI/stats and blocks concurrent mixed seasons if person is mid-transition.

### Updated Hypotheses

| ID | Status | Resolution |
| -- | ------ | ---------- |
| H1 Per-season mode required | **Confirmed** | PO 2026-07-12 #3 |
| H2 Conversion + roster backfill only | **Refuted** as sole solution | Insufficient for season-varying mode |
| H3 LIMIT-005 spec gap | **Confirmed** | Unchanged |

### Updated Conclusion

**Recommended trajectory:** ADR-0022 **Accepted** + story **2.26** `ready-for-dev`. Implementation scheduled; LIMIT-005 → Scheduled.

## Follow-up: 2026-07-12 #4

### New Evidence

PO approved story creation + normative updates (ADR-0022, DOMAIN, epics 2.26).

### Updated Conclusion

Case **Concluded**. Next: **`bmad-dev-story`** on `2-26-participation-mode-role-lifecycle`.
