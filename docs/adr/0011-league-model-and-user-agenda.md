# ADR 0011: League model, user agenda, and multi-active leagues (V2)

**Status:** Accepted (product direction — 2026-05-24)  
**Date:** 2026-05-24  
**Deciders:** Patrice (product), Correct Course + PM/UX review  
**Supersedes in part:** Implicit “single active season per troupe” invariant in DOMAIN.md (prior wording)

## Context

HatCast V2 was built around **Season** as the primary navigation hub (`/seasons` → `/saison/:slug`). Stakeholder feedback and Epic 2 retro show:

1. Members expect **V1-like entry**: last context or **personal agenda**, not a stub `/accueil` screen.
2. Real troupes run **multiple concurrent programmes** (e.g. leisure league vs show circuit) — not one “active season” per troupe.
3. **Inter-troupe matches** (e.g. BIM vs La Malice) are one real-world encounter but **two HatCast events** (one per troupe’s league), each with its own team composition.
4. A member in both troupes must see **two distinct events** in their agenda, clearly labelled by troupe.

Normative docs previously stated **at most one active season per troupe** (DOMAIN.md). Story 3.1 enforces this in the database/API.

## Decision

### 1. Product vocabulary

- **League** (*ligue* in French UI) is the product name for what the V2 codebase still calls **season** (`seasons` table, `/saison/:slug` routes).
- **Implementation alias:** Keep `season` in API paths and schema until a dedicated rename migration; UI and new docs use **Ligue**.
- **Troupe** unchanged — identity, membership, pseudo (FR9), admin members (FR7).

### 2. Multi-active leagues

- A troupe **may have multiple non-archived leagues active concurrently**.
- **Remove** the invariant that activating one league deactivates all others in the same troupe.
- Archiving a league remains explicit; archived leagues are hidden from member surfaces unless admin filter enables them.

### 3. User agenda (member hub)

- The **signed-in member’s default hub** is a **personal agenda** listing upcoming events from **all leagues where the user is a league participant** (across all troupes).
- Route: **`/agenda`** (primary); post-login redirects here or to last deep link (see ADR note in PLAN).
- Agenda supports **filters** by troupe and by league; default = all.
- **Cross-troupe duplicate events** appear as **separate rows**, each showing **troupe name + league name** (and optional encounter hint in UI copy — no merge in MVP).

### 4. League participant roster (creation)

- When creating a league, admin chooses:
  - **All active troupe members** → auto-enrol as league participants, **or**
  - **Manual roster** → add participants one-by-one (existing user, name-only, optional email per FR45).

### 5. Cross-troupe encounters (phased)

- **MVP:** No shared `encounter` entity. Two events created independently; UI distinguishes by troupe/league badges. Optional shared **title/date/venue** metadata only.
- **Post-MVP:** Optional `encounter_id` (or equivalent) to link paired events for admin convenience and analytics — not required for composition or availability.

### 6. Navigation graph

- **Event detail** → navigate to **League workspace** or **Troupe hub**.
- **League workspace** → league admin (spectacles, participants, historique) + link to troupe.
- **Troupe hub** → leagues list (active/archived), pseudo, members admin, public directory entry (Epic 4).

## Consequences

### Positive

- Matches real troupe behaviour (multi-circuit, inter-troupe matches, dual membership).
- Restores V1 muscle memory (land in action, not stub home).
- Clear separation: **troupe membership** vs **league participation** vs **event participation**.

### Negative / cost

- **Breaking change** to DOMAIN invariant and Story 3.1 activation logic — requires migration + test updates.
- New **agenda aggregation API** and permission rules (only events in leagues where user is participant).
- Route/IA refactor: `/seasons` list demoted from member hub to admin/troupe-hub function.
- Epic 5/6 work already shipped assumes per-league routes — must not regress; agenda is additive navigation.

### Migration

- Flyway: drop or relax unique “one active season per troupe” constraint if present.
- Data: existing troupes with one active season remain valid; no forced split.
- Frontend: `/saison/:slug` remains alias for `/ligue/:slug` during transition.

## Alternatives considered

| Alternative | Rejected because |
|-------------|------------------|
| Keep single active season; use tags for “leisure vs show” | Does not model concurrent programmes with separate rosters/stats |
| Merge BIM/Malice into one shared event | Composition and permissions are per-troupe; would break admin model |
| User agenda as client-side merge only | Poor performance, inconsistent filters, no single contract for mobile/PWA |
| Rename DB `seasons` → `leagues` immediately | High churn mid-MVP; alias approach ships value faster |

## References

- [DOMAIN.md](../../DOMAIN.md) — glossary League, removed single-active invariant
- [_bmad-output/planning-artifacts/ux-design-journey-league-agenda.md](../../_bmad-output/planning-artifacts/ux-design-journey-league-agenda.md)
- [PLAN.md](../../PLAN.md) — V2 delivery track (League journey)
- Sprint change proposal 2026-05-24 rev. 2
