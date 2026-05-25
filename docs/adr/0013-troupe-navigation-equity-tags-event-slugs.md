# ADR 0013: Troupe-first navigation, season workspace, equity tags, and event slugs

**Status:** Accepted (product direction — 2026-05-25)  
**Date:** 2026-05-25  
**Deciders:** Patrice (product), Design Thinking session 2026-05-25  
**Builds on:** [ADR 0011](0011-league-model-and-user-agenda.md)  
**Supersedes in part:** [ADR 0012](0012-league-views-travel-leagues-member-stats.md) §3 (travel leagues for déplacements)

**Design input:** [_bmad-output/design-thinking-2026-05-25.md](../../_bmad-output/design-thinking-2026-05-25.md)

## Context

After MVP navigation (Epic 12) and pilot validation (2026-05-25), stakeholder review identified:

1. **`/seasons` is the wrong hub** — it mixes troupe administration (members) with season listing; members already use `/agenda`.
2. **Product vocabulary** — French UI should use **Saison** for the programme container (`season` in code), not **Ligue** (sounds like inter-troupe championship, out of scope).
3. **Wayfinding** — Season and event screens lack visible troupe context; back links point to `/seasons`; event troupe link goes to **admin membres** instead of a troupe home.
4. **Equity / fairness partitioning** — Within one season (e.g. La Malice), **déplacements** and future axes (e.g. **Apérock**) should split chance pools and related stats **without** creating separate seasons or travel leagues for each axis.
5. **URLs** — Event routes use UUIDs; shareable paths should use **slugs** consistent with troupe and season slugs.

ADR 0012 §3 proposed **travel leagues** for away shows. The design session concluded that **optional equity tags on events** better match troupe practice (one roster, one season, multiple fairness compartments).

Usability testing on wireframes was **not run** (no participants available); decisions rely on product-owner validation and code/doc review.

## Decision

### 1. Information architecture and routes

| Surface | Route | Role |
|---------|-------|------|
| Member hub | `/agenda` | Cross-season upcoming events |
| Troupe directory | `/troupes` | **Mes troupes** (default) + **Découvrir** section below |
| Troupe hub | `/troupes/:troupeSlug` | Logo, name, season list, troupe admin entry, member preferences (secondary) |
| Season workspace | `/saison/:slug` | Agenda, Historique, Statistiques (ADR 0012 views); canonical |
| Event detail | `/saison/:slug/event/:eventSlug` | Full-screen event; slug unique per season |
| Legacy aliases | `/ligue/:slug` → `/saison/:slug`; `/seasons` → `/troupes` (with scope) | Transition only |

**UI label:** **Saison** (not Ligue) for the `season` entity. Code/API table name `seasons` unchanged until a dedicated rename slice.

**Découvrir (non-member actions):** OPEN — read-only browse, join request, etc. deferred (Epic 4).

### 2. Chrome: breadcrumb and admin scope

**`app-context-breadcrumb`**

- **Desktop:** troupe logo + name › season title › event title (current leaf not linked).
- **Mobile:** **troupe logo only** in breadcrumb slot (tap → troupe hub); season/event titles in page body to avoid overflow.
- **No ⚙** in global header.

**`app-scope-admin-bar`** (below header, one scope per screen)

- Troupe hub / season workspace / event detail each expose **one** expandable admin strip when permitted (e.g. « Administration de la troupe », « … de la saison », « … du spectacle »).
- Troupe **member preferences** (pseudo, preferred roles) behind a **secondary preferences** control on troupe hub — not primary chrome.

**Remove** redundant `event-context-strip` once breadcrumb ships. Event troupe link targets **`/troupes/:slug`**, not `/troupe/.../admin/membres`.

### 3. Equity tag (optional, per event)

**Concept:** An optional **equity tag** splits the **chance/draw/stat assiette** for participations on that event. It is **not** a navigation object and **not** the same as **event template type** (`match`, `cabaret`, …).

| Field | Rules |
|-------|--------|
| `equity_tag` | Nullable string; **at most one** per event |
| Empty / null | **Principal** compartment — system default; **not shown** in create/edit UI |
| Set | Participation counts only in that tag’s pool within the **season** date bounds and roster |
| UI | Optional autocomplete on event form; creatable per troupe vocabulary; **×** clears tag |
| Help | Inline copy explains impact on chances and auto-draw |

**Troupe tag glossary (Phase 2+):** troupe-configurable list (e.g. `deplacements`, `aperock`); unknown typed value may create a new troupe tag.

**La Malice pattern:** one primary **season** + tags `deplacements`, `aperock` — not separate seasons for those axes.

**Multi-season troupes:** unchanged — multiple concurrent active seasons remain valid when rosters/programmes differ (ADR 0011).

### 4. Event slugs

- Add `events.slug` with unique constraint `(season_id, slug)`.
- Generate from title on create (dedupe with numeric suffix); editable in event form.
- Redirect `/saison/:slug/event/:uuid` → slug URL (301) when slug exists.

### 5. Stats and draw (supersedes ADR 0012 travel league for new data)

- **Draw / chances:** partition history and eligibility by `(season_id, equity_tag)` where `equity_tag` null = principal pool.
- **Statistiques:** DEPLACEMENT (and future columns) driven by `equity_tag` (e.g. `deplacements`), not by `template_type = deplacement` or travel-league membership for **new** events.
- **Migration:** existing `template_type = deplacement` events → set `equity_tag = deplacements` (template may remain or be normalized separately).
- **Story 13.6** (travel league creation) **deferred / revised** — do not implement travel leagues as the primary déplacements model; implement after equity tags or cancel in favour of tags.

## Consequences

### Positive

- Aligns navigation with mental model: troupe → saison → spectacle.
- Mid-year introduction of new fairness axes (e.g. Apérock) via troupe tag glossary without schema-per-axis deploys.
- Shareable human-readable event URLs.
- Simpler ops for single-season troupes (Malice) than maintaining parallel travel leagues.

### Negative / cost

- **Breaking change** to ADR 0012 §3 and DOMAIN travel-league wording; Epic 13.6 scope must be revisited.
- New columns + API fields; draw/stats refactor; frontend route and component work (Epic 17).
- Breadcrumb responsive rules and admin strip discoverability need UX follow-up when usability tests are possible.

### Migration

| Item | Action |
|------|--------|
| `/seasons` | Redirect; replace entry points with `/troupes` |
| `/ligue/*` | Alias redirect to `/saison/*` |
| Event UUID URLs | Redirect to slug when present |
| `deplacement` template events | Backfill `equity_tag` |
| Travel leagues (if any created) | No new ones; optional data migration tool post-MVP |

## Alternatives considered

| Alternative | Rejected because |
|-------------|------------------|
| Keep `/seasons` as admin hub | Conflates troupe admin and season list; rejected in design session |
| Travel league per compartment (ADR 0012) | Duplicate roster and navigation; poor fit for Apérock-style axes on same roster |
| Multi-select tags per event | User rule: one tag only; avoids overlapping pools |
| Show « Principal » in UI | Clutters form; principal is implicit when empty |
| Full breadcrumb on mobile | Horizontal overflow; logo-only compromise |
| ⚙ in header | Competes with breadcrumb; admin scoped per screen below header |

## References

- [_bmad-output/design-thinking-2026-05-25.md](../../_bmad-output/design-thinking-2026-05-25.md)
- [ux-design-journey-league-agenda.md](../../_bmad-output/planning-artifacts/ux-design-journey-league-agenda.md) — to be updated for Saison copy, `/troupes`, breadcrumb
- PLAN.md Epic 17
- DOMAIN.md § Equity tag, Season UI label
