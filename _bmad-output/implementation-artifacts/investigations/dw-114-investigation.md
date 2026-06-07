# Investigation: DW-114 — `reinclude` vs concurrent membership deactivation

## Hand-off Brief

1. **What happened.** A TOCTOU race between `SeasonParticipantService.reinclude` and `TroupeMembershipService.deactivateMember` can briefly persist `season_participants.status = ACTIVE` while `troupe_memberships.status = INACTIVE`; confirmed by code trace, no production incident reported.
2. **Where the case stands.** Multiple self-healing and filter layers already limit user-visible impact; `SeasonStatisticsService` is the only notable unfiltered read path. Recommendation: **accept** the race with documentation; optional low-cost hardening via post-save re-check.
3. **What's needed next.** Close DW-114 as accepted risk in `deferred-work.md` / `ISSUES.md`, or implement minimal re-check in `reinclude` if belt-and-suspenders is preferred (~5 lines).

## Case Info

| Field            | Value                                                                                      |
| ---------------- | ------------------------------------------------------------------------------------------ |
| Ticket           | DW-114                                                                                     |
| Date opened      | 2026-06-07                                                                                 |
| Status           | Closed (Option B implemented 2026-06-07)                                                   |
| System           | HatCast V2 API — Spring Boot + JPA + PostgreSQL (Neon)                                     |
| Evidence sources | Source code, deferred-work backlog, test-design epic 3.19 (R-009), story 3.19 review notes |

## Problem Statement

Without locking, concurrent `POST …/reinclude` and troupe membership deactivation (`PATCH` → `INACTIVE`) can leave a transient "zombie" row: season participant `ACTIVE` linked to an `INACTIVE` `troupe_membership`. Deferred as T1 backlog item; triage labels cost **M–L**, risk **moderate**, urgency **low**. User hypothesis: formalize the race window, compare fix options, recommend fix vs accept.

## Evidence Inventory

| Source                                              | Status    | Notes                                                                 |
| --------------------------------------------------- | --------- | --------------------------------------------------------------------- |
| `SeasonParticipantService.reinclude`                | Available | Entry point; membership check then save                               |
| `SeasonParticipantService.ensureMembershipParticipants` | Available | Stale cleanup via `findActiveLinkedToInactiveMembershipsForSeason` |
| `TroupeMembershipService.deactivateMember`          | Available | Sets INACTIVE then `removeForMembershipAcrossTroupe`                  |
| `SeasonParticipantMembershipSync.removeForMembership` | Available | Per-season REMOVED + `MEMBERSHIP_INACTIVE`                         |
| Integration tests (`reinclude` + inactive guard)    | Available | Covers static guard, not concurrency                                  |
| Production logs / incident reports                  | Missing   | No field evidence of user impact                                      |
| Concurrency / stress test                           | Missing   | Race not reproduced in CI                                             |

## Investigation Backlog

| # | Path to Explore                              | Priority | Status | Notes                                      |
| - | -------------------------------------------- | -------- | ------ | ------------------------------------------ |
| 1 | `reinclude` transaction boundaries           | High     | Done   | TOCTOU at membership status check          |
| 2 | `deactivateMember` cascade timing            | High     | Done   | INACTIVE saved before roster removal       |
| 3 | Self-heal + filter coverage on read paths    | High     | Done   | Most paths heal or filter zombies          |
| 4 | Existing pessimistic-lock patterns           | Medium   | Done   | Troupe + composition locks; not on roster  |
| 5 | `SeasonStatisticsService` unfiltered reads   | Medium   | Done   | Potential zombie visibility gap            |
| 6 | Concurrency integration test                 | Low      | Open   | Would confirm window duration              |

## Timeline of Events

| Time        | Event                                                    | Source                          | Confidence |
| ----------- | -------------------------------------------------------- | ------------------------------- | ---------- |
| 2026-05-31  | Story 3.19 defers race; documents auto-heal              | `3-19-retrait-roster-saison…md` | Confirmed  |
| 2026-05-31  | R-009 scored 1×1×1 — Monitor, auto-healed                | `test-design-epic-3.19.md`      | Confirmed  |
| 2026-06      | DW-114 triaged T1 #2 (after DW-106, DW-105)              | `deferred-triage-2026-06.md`   | Confirmed  |

## Confirmed Findings

### Finding 1: `reinclude` checks membership status before save (TOCTOU)

**Evidence:** `services/api/src/main/kotlin/com/hatcast/api/participant/SeasonParticipantService.kt:653-687`

**Detail:** `membership` is read from `existing.troupeMembership`. If `membership.status != ACTIVE`, returns 400. Otherwise sets `existing.status = ACTIVE` and `save()`. No lock, no post-save re-validation.

### Finding 2: Deactivation sets membership INACTIVE then removes season participants

**Evidence:** `services/api/src/main/kotlin/com/hatcast/api/troupe/TroupeMembershipService.kt:715-726`, `SeasonParticipantMembershipSync.kt:107-125`

**Detail:** `deactivateMember` saves `membership.status = INACTIVE`, then calls `removeForMembershipAcrossTroupe`, which sets each linked season participant to `REMOVED` / `MEMBERSHIP_INACTIVE`. No lock on participant or membership row.

### Finding 3: Stale zombie cleanup exists in bulk sync

**Evidence:** `ParticipantRepositories.kt:66-77`, `SeasonParticipantService.kt:782-793`

**Detail:** `findActiveLinkedToInactiveMembershipsForSeason` selects `p.status = ACTIVE AND tm.status = INACTIVE`. `ensureMembershipParticipants` marks them `REMOVED` with `MEMBERSHIP_INACTIVE`.

### Finding 4: Multiple read paths filter zombies even without sync

**Evidence:** `SeasonParticipantService.kt:77-79`, `CompositionParticipantPool.kt:33-36`, `AvailabilityService.kt:730-733`, `EventRosterService.kt:146-149`, `ShareRecipientsService.kt:250-253`

**Detail:** In-memory filter `troupeMembership == null || troupeMembership.status == ACTIVE` excludes zombies from selectors, composition pool, availability, event roster, share recipients.

### Finding 5: `listAdmin` always runs sync before listing

**Evidence:** `SeasonParticipantService.kt:52-55`

**Detail:** Admin participant list calls `ensureMembershipParticipants` first, then queries ACTIVE rows — zombies are healed before response.

### Finding 6: `SeasonStatisticsService` lacks sync and membership filter

**Evidence:** `services/api/src/main/kotlin/com/hatcast/api/season/SeasonStatisticsService.kt:101-104`

**Detail:** Reads `findBySeason_IdAndStatus(…, ACTIVE)` without `ensureMembershipParticipants` and without membership-status filter. A zombie could appear in statistics until another path heals it.

### Finding 7: Existing pessimistic-lock precedent is troupe-scoped, not membership-scoped

**Evidence:** `TroupeRepository.kt:15-18`, `EventCompositionRepository.kt:13-15`

**Detail:** `findByIdForMembershipJoin` uses `PESSIMISTIC_WRITE` for membership join/import flows; composition uses `findByEventIdForUpdate`. No equivalent on `TroupeMembershipRepository` or `SeasonParticipantRepository` today.

## Deduced Conclusions

### Deduction 1: Race window is narrow and bidirectional

**Based on:** Findings 1, 2

**Reasoning:** Two independent `@Transactional` methods without shared lock. Winning interleaving for zombie creation:

```
T_reinclude: load participant (REMOVED), read membership ACTIVE ✓
T_deactivate: membership → INACTIVE, participant → REMOVED (MEMBERSHIP_INACTIVE)
T_reinclude: participant → ACTIVE, save  → zombie (ACTIVE + INACTIVE membership)
```

Reverse order (deactivate first) is safe: `reinclude` throws 400. Default Postgres isolation (READ COMMITTED) does not prevent the stale membership read if the check and save are not atomic with deactivation.

**Conclusion:** Zombie state is **transient** (until next heal) and requires **concurrent** admin actions on the same member — low probability (R-009 P=1).

### Deduction 2: User-visible impact is largely mitigated by design

**Based on:** Findings 3, 4, 5

**Reasoning:** Business-critical flows (composition draw, availability, selectors, notifications via share) either sync-first or filter INACTIVE memberships. Admin list syncs first.

**Conclusion:** Zombie is primarily a **data hygiene / audit** concern, not a security or composition-integrity breach.

### Deduction 3: Residual exposure is statistics and `participant_count`

**Based on:** Findings 6, race timeline

**Reasoning:** `refreshParticipantCount` in `reinclude` may increment count after deactivate decremented it; statistics may count zombie until heal.

**Conclusion:** Impact is **cosmetic / low** — wrong count or stats cell for a deactivated member until next sync.

## Hypothesized Paths

### Hypothesis 1: Zombie can affect composition assignment

**Status:** Refuted

**Theory:** A deactivated member could be drawn into a composition via zombie ACTIVE row.

**Would confirm:** Composition path loads participant without membership filter.

**Would refute:** `CompositionParticipantPool` and `buildResponse` filter/sync (Finding 4).

**Resolution:** Refuted — pool filters `troupeMembership.status == ACTIVE`; `buildResponse` calls `ensureMembershipParticipants` when explainability enabled.

### Hypothesis 2: Zombie persists indefinitely without user action

**Status:** Refuted

**Theory:** Once created, zombie never cleaned.

**Would confirm:** No cleanup query exists.

**Would refute:** `findActiveLinkedToInactiveMembershipsForSeason` in `ensureMembershipParticipants`.

**Resolution:** Refuted — any `ensureMembershipParticipants` invocation heals; triggered on most roster/composition reads.

### Hypothesis 3: Pessimistic lock on membership serializes reinclude vs deactivate

**Status:** Open (design option)

**Theory:** `@Lock(PESSIMISTIC_WRITE)` on membership row in both `reinclude` and `deactivateMember` eliminates zombie.

**Would confirm:** Concurrency test with two threads — no ACTIVE+INACTIVE row after either completes.

**Would refute:** Lock not held through full transaction or deadlock causes timeout without consistency.

**Resolution:** Plausible fix; not yet implemented.

## Missing Evidence

| Gap                         | Impact                                    | How to Obtain                              |
| --------------------------- | ----------------------------------------- | ------------------------------------------ |
| Production incident         | Validates accept vs fix urgency           | Support tickets, audit log review          |
| Concurrency integration test| Confirms heal latency and window duration | `@Sql` + two parallel transactions test    |
| `participant_count` drift   | Quantifies count skew duration            | Instrument or test race on count field     |

## Source Code Trace

| Element       | Detail                                                                                      |
| ------------- | ------------------------------------------------------------------------------------------- |
| Error origin  | Not an error — inconsistent state `ACTIVE` participant + `INACTIVE` membership            |
| Trigger       | Concurrent `POST /v1/seasons/{id}/participants/{id}/reinclude` + troupe member deactivation   |
| Condition     | `reinclude` passes membership ACTIVE check after deactivation committed membership INACTIVE |
| Related files | `SeasonParticipantService.kt`, `TroupeMembershipService.kt`, `SeasonParticipantMembershipSync.kt`, `ParticipantRepositories.kt`, `SeasonStatisticsService.kt` |

## Conclusion

**Confidence:** **High** on race existence and mitigation layers; **Medium** on real-world frequency (no production data).

The race is **real but low-impact**. Architecture already treats it as acceptable (R-009 Monitor, DW-114 T1 low urgency). Self-heal (`findActiveLinkedToInactiveMembershipsForSeason`) plus membership filters on critical paths make a persistent user-facing defect unlikely. Residual gap: `SeasonStatisticsService` and brief `participant_count` skew.

**Recommendation: ACCEPT** — document as known transient inconsistency; do not prioritize JPA lock unless field reports emerge. If minimal hardening is desired, **post-save re-check** in `reinclude` is the best ROI (see Fix direction).

## Recommended Next Steps

### Fix direction

| Option | Mechanism | Pros | Cons | Effort |
| ------ | --------- | ---- | ---- | ------ |
| **A — Accept + document** | Status quo; note in `ISSUES.md` / close DW-114 | Zero code risk; aligned with R-009 | Zombie possible until heal; stats gap | S |
| **B — Post-save re-check** (preferred if fixing) | After `save`, fresh `membershipRepository.findById` or `entityManager.refresh`; if INACTIVE → revert to REMOVED / throw 409 | No lock contention; matches existing guard semantics | Does not prevent audit entry if check-after-save races at commit edge | S |
| **C — JPA pessimistic lock** | `@Lock(PESSIMISTIC_WRITE)` on membership in `reinclude` + `deactivateMember` | Strong serialization | New repo methods; deadlock risk; overkill for rare race | M |
| **D — SELECT FOR UPDATE** | Native query equivalent of C | Same as C | Same as C; bypasses JPA cache nuances | M |
| **E — Extend heal to statistics** | Call `ensureMembershipParticipants` or add membership filter in `SeasonStatisticsService` | Closes Finding 6 without locking | Extra write on stats read (if sync) or filter-only partial fix | S |

**Recommended path:** **A** (accept). Optional **B** if team wants code-level closure without locks. **C/D** only if compliance or incident demands strict serializability. **E** as independent hygiene fix for statistics.

### Diagnostic

- Add optional concurrency test: thread A `reinclude`, thread B `deactivateMember`, assert no durable ACTIVE+INACTIVE after both complete + one `ensureMembershipParticipants`.
- Query prod/staging: `SELECT … WHERE p.status='ACTIVE' AND tm.status='INACTIVE'` — expect zero or rare rows.

## Reproduction Plan

1. Setup: troupe with one ACTIVE member, season participant REMOVED (`SEASON_ADMIN`), membership ACTIVE.
2. Concurrently:
   - Thread A: `POST /v1/seasons/{seasonId}/participants/{id}/reinclude`
   - Thread B: `PATCH /v1/troupes/{troupeId}/members/{membershipId}` → `INACTIVE`
3. Immediately query DB: `season_participants` status + `troupe_memberships.status`.
4. Expected without fix: possible transient `ACTIVE` + `INACTIVE`.
5. Call `GET /v1/seasons/{seasonId}/participants` (admin list): zombie should be healed (`REMOVED`, `MEMBERSHIP_INACTIVE`).
6. Verify composition selectors exclude zombie even before heal (membership filter).

## Side Findings

- `listSelectors` filters INACTIVE memberships but does not sync — relies on filter, not heal (`SeasonParticipantService.kt:73-79`). Deduced: selectors are **read-safe** even if zombie exists.
- `create` / `createOrReactivateMemberParticipant` has the same TOCTOU pattern on membership ACTIVE check — same race class, same mitigations; out of DW-114 scope unless broadened.
- Troupe-level `findByIdForMembershipJoin` lock pattern exists for join flows but is **not** applied to deactivation/reinclude (`TroupeRepository.kt:15-18`).
