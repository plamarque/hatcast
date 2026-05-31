# ADR 0012: League workspace views, travel leagues, and personal season glance

**Status:** Accepted (product direction — 2026-05-24) — **§3 superseded by [ADR 0013](0013-troupe-navigation-equity-tags-event-slugs.md)** (2026-05-25)  
**Date:** 2026-05-24  
**Deciders:** Patrice (product), PM Correct Course  
**Builds on:** [ADR 0011](0011-league-model-and-user-agenda.md)

## Context

Stakeholder review (2026-05-24) after ADR 0011 identified three refinements:

1. **V1 Historique** combined participation statistics with month/event drill-down in one screen. Product intent is to **separate** a chronological **Historique** (past events list) from **Statistiques** (stats grid + V1 export), each with its own CSV export.
2. **`deplacement` spectacle type** forces special cases in stats (DEPLACEMENT column) and draw logic. Déplacements are administratively a **separate programme** within a troupe — better modeled as a **travel league** sharing league mechanics.
3. **« Ma saison en un clin d'œil »** (V1 `PlayerModal`) should be reachable from the **member area** via a stable URL (`/membre/:userSlug`), with optional troupe/league filters and **transparency** (view other members' glances). Cross-scope surfaces reuse **RES-001** filter visibility (hide when single troupe or league).

Story **3.6** was ready-for-dev with the old combined « Historique » naming.

## Decision

### 1. League workspace: three views

| View | Content | Export |
|------|---------|--------|
| **Agenda** | Upcoming events only (UX-DR12) | — |
| **Historique** | Past events, month-grouped chronology (no stats grid) | — |
| **Statistiques** | V1-style participation statistics grid (on-screen for all active members) | Stats CSV via **season admin menu** (organizers/admins only; full season) |

*Amended 2026-06-01 — export placement Correct Course ([sprint-change-proposal-2026-06-01-season-stats-export-admin-menu.md](../../_bmad-output/planning-artifacts/sprint-change-proposal-2026-06-01-season-stats-export-admin-menu.md)).*

View switcher remains in league shell (Participants, Spectacles, Agenda, Historique, Statistiques).

### 2. Cross-scope filters (FR55)

**User agenda**, **personal season glance**, and **cross-league Statistiques** expose troupe + league filters. Controls **hidden** when the user has exactly one troupe or one league in scope (RES-001).

### 3. Travel leagues for déplacements *(superseded by ADR 0013 — equity tags)*

> **2026-05-25:** Prefer **optional `equity_tag` on events** within a season (e.g. `deplacements`, `aperock`). Do not implement travel leagues as the primary model for new work. Text below retained for historical context.

- Away shows live in a **dedicated travel league** per troupe (e.g. *Ligue Déplacements*), not as `templateType = deplacement` on show leagues for **new** data.
- Draw and chances run **per league**; no cross-league draw exception for déplacement type on show leagues once adopted.
- **Statistiques:** events in travel leagues count toward **DEPLACEMENT**; show-league events never do. Legacy `deplacement` events remain until migrated.

### 4. Personal season glance route

- Route pattern: **`/membre/:userSlug`** (exact path may alias during implementation).
- FR58–FR59: member area entry; avatar shortcuts navigate here; other members' glances allowed when league visibility permits (V1 transparency).

## Consequences

### Positive

- Clearer mental model (schedule vs analytics).
- Simpler draw/stats code path per league; déplacements opt-in via filters on agenda/stats.
- Shareable member URLs; aligns member hub with ADR 0011.

### Negative / cost

- Story **3.6** scope unchanged but **renamed** to Statistiques; new **3.6b** Historique chronology.
- Epic **13** adds travel-league creation guidance; migration from `deplacement` events.
- Story **2.7** / Epic **16** for route-based glance vs popover-only.

### Migration

- Existing V1/V2 `deplacement` events: read + stats via legacy rules until troupe creates travel league and migrates events (tooling post-MVP acceptable).
- No DB schema required for view split; optional `league_kind` column deferred until implementation.

## Alternatives considered

| Alternative | Rejected because |
|-------------|------------------|
| Single Historique with tabs Stats / Liste | Still couples exports and cognitive load |
| Keep `deplacement` type + league flag | Two mechanisms for same concept |
| Popover-only glance (2.7 as-is) | Poor deep-linking; member area needs route |

## References

- PRD FR53–FR60
- DOMAIN.md § League workspace views, Travel league
- [_bmad-output/planning-artifacts/sprint-change-proposal-2026-05-24-league-views-stats-deplacement.md](../../_bmad-output/planning-artifacts/sprint-change-proposal-2026-05-24-league-views-stats-deplacement.md)
