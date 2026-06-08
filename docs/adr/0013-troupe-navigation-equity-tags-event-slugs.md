# ADR 0013: Troupe-first navigation, season workspace, spectacle categories, and event slugs

**Status:** Accepted (product direction — 2026-05-25)  
**Amended:** 2026-06-03 — canonical season URLs include troupe slug; season slug uniqueness per troupe; member-shell nav patterns  
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
4. **Category / fairness partitioning** — Within one season (e.g. La Malice), **déplacements** and future axes (e.g. **Apérock**) should split chance pools and related stats **without** creating separate seasons or travel leagues for each axis.
5. **URLs** — Event routes use UUIDs; shareable paths should use **slugs** consistent with troupe and season slugs.

ADR 0012 §3 proposed **travel leagues** for away shows. The design session concluded that **optional spectacle categories on events** better match troupe practice (one roster, one season, multiple category pools).

Usability testing on wireframes was **not run** (no participants available); decisions rely on product-owner validation and code/doc review.

## Decision

### 1. Information architecture and routes

| Surface | Route | Role |
|---------|-------|------|
| Member hub | `/agenda` | Cross-season upcoming events |
| Troupe directory | `/troupes` | **Mes troupes** (default) + **Découvrir** section below |
| Troupe hub | `/troupes/:troupeSlug` | Logo, name, season list, troupe admin entry, member preferences (secondary) |
| Season workspace | `/saison/:troupeSlug/:seasonSlug` | Agenda, Historique, Statistiques (ADR 0012 views); canonical |
| Event detail | `/saison/:troupeSlug/:seasonSlug/event/:eventSlug` | Full-screen event; slug unique per season |
| Legacy alias | `/saison/:seasonSlug` → canonical | Redirect when season slug is unique among the user’s memberships; otherwise chooser (see §1.1) |
| Legacy alias | `/seasons` → `/troupes` | Hub redirect only |

#### 1.1 Season slug scope and disambiguation

- **`seasons.slug` is unique per `(troupe_id)`**, not globally. Two troupes (e.g. Démo and La Malice) may both use `saison-2026-2027`.
- **Canonical URLs always include `troupeSlug`** so bookmarks and deep links are unambiguous.
- **Legacy `/saison/:seasonSlug`** remains as a redirect entry point: resolve among the signed-in user’s memberships; if exactly one match → redirect to `/saison/:troupeSlug/:seasonSlug` (+ preserved path suffix / query); if several → chooser UI; if none → not found.
- **Member shell chrome** (rail Accueil · Agenda · Stats, menu compte mobile): `shouldShowMemberNav()` in `member-shell-nav-visibility.ts` must match **both** legacy and canonical path patterns for workspace, event, and admin routes.

**UI label:** **Saison** (not Ligue) for the `season` entity. Code/API table name `seasons` unchanged until a dedicated rename slice.

**Découvrir (non-member actions):** OPEN — read-only browse, join request, etc. deferred (Epic 4).

### 2. Chrome: breadcrumb and admin scope

**`app-context-breadcrumb`**

- **Desktop:** troupe logo + name › season title › event title (current leaf not linked).
- **Mobile:** **troupe logo only** in breadcrumb slot (tap → troupe hub); season/event titles in page body to avoid overflow.
- **No ⚙** in global header.

**`app-scope-admin-menu`** (one scope per screen, role-gated)

- **Control:** gear icon (`settings` / `admin_panel_settings`) opening a **`mat-menu`** with scope-appropriate entries (router links and dialog actions). Hidden when the user has no entries for that scope.
- **Placement:** **inline in view chrome** — not a full-width row below the header. Examples: season workspace — gear to the **right** of **Agenda | Historique** in the season toolbar; event detail — gear on the tab/actions row; troupe hub — gear in the hero/toolbar row (not a band across the canvas).
- Labels in menu items remain explicit (e.g. Participants, Organisateur·ices, Membres); optional menu header text may repeat scope (« Administration de la saison ») for screen readers.
- Troupe **member preferences** (pseudo, preferred roles) behind a **secondary preferences** control on troupe hub — not the admin gear menu.

**No ⚙ in the global header row** (breadcrumb + avatar) — administration stays out of context navigation (Story 17.1). This is distinct from the contextual gear in the workspace toolbar.

**Remove** redundant `event-context-strip` once breadcrumb ships. Event troupe link targets **`/troupes/:slug`**, not `/troupe/.../admin/membres`.

### 3. Catégorie (optional, per event)

**Concept:** An optional **spectacle category** splits the **chance/draw/stat assiette** for participations on that event. It is **not** a navigation object and **not** the same as **format** (`templateType`: `match`, `cabaret`, …).

| Field | Rules |
|-------|--------|
| `category` | Nullable string; **at most one** per event |
| Empty / null | **Principal** category — system default; Infos tab shows **Spectacle ordinaire** (not a stored value; not selectable in dialog) |
| Set | Participation counts only in that category’s pool within the **season** date bounds and roster |
| UI | Section **Catégorie** always on Infos tab; optional autocomplete via dialog; creatable per troupe glossary; **×** clears custom category → principal display |
| Help | Inline copy under section label (same as dialog `mat-hint`) explains impact on stats and draw |

**Troupe category glossary (Phase 2+):** troupe-configurable list (e.g. `deplacements`, `aperock`); unknown typed value may create a new troupe category.

**La Malice pattern:** one primary **season** + categories `deplacements`, `aperock` — not separate seasons for those axes.

**Multi-season troupes:** unchanged — multiple concurrent active seasons remain valid when rosters/programmes differ (ADR 0011).

### 4. Event slugs

- Add `events.slug` with unique constraint `(season_id, slug)`.
- Generate from title on create (dedupe with numeric suffix); editable in event form.
- Redirect legacy `/saison/:seasonSlug/event/:uuid` → canonical `/saison/:troupeSlug/:seasonSlug/event/:eventSlug` when slug exists (301).

### 5. Stats and draw (supersedes ADR 0012 travel league for new data)

- **Draw / chances:** partition history and eligibility by `(season_id, category)` where `category` null = principal pool.
- **Statistiques:** DEPLACEMENT (and future columns) driven by `category` (e.g. `deplacements`), not by `template_type = deplacement` or travel-league membership for **new** events.
- **Migration:** existing `template_type = deplacement` events → set `category = deplacements` (template may remain or be normalized separately).
- **Story 13.6** (travel league creation) **deferred / revised** — do not implement travel leagues as the primary déplacements model; implement after categories or cancel in favour of categories.

## Consequences

### Positive

- Aligns navigation with mental model: troupe → saison → spectacle.
- Mid-year introduction of new fairness axes (e.g. Apérock) via troupe tag glossary without schema-per-axis deploys.
- Shareable human-readable event URLs.
- Simpler ops for single-season troupes (Malice) than maintaining parallel travel leagues.

### Negative / cost

- **Breaking change** to ADR 0012 §3 and DOMAIN travel-league wording; Epic 13.6 scope must be revisited.
- New columns + API fields; draw/stats refactor; frontend route and component work (Epic 17).
- Breadcrumb responsive rules and admin menu placement need UX follow-up when usability tests are possible.

### Migration

| Item | Action |
|------|--------|
| `/seasons` | Redirect; replace entry points with `/troupes` |
| Event UUID URLs | Redirect to canonical slug URL when present |
| Legacy `/saison/:seasonSlug` | Redirect or chooser → canonical with troupe slug |
| `deplacement` template events | Backfill `category = deplacements` |
| Travel leagues (if any created) | No new ones; optional data migration tool post-MVP |

## Alternatives considered

| Alternative | Rejected because |
|-------------|------------------|
| Keep `/seasons` as admin hub | Conflates troupe admin and season list; rejected in design session |
| Travel league per compartment (ADR 0012) | Duplicate roster and navigation; poor fit for Apérock-style axes on same roster |
| Multi-select tags per event | User rule: one tag only; avoids overlapping pools |
| Show « Principal » in UI | Clutters form; principal is implicit when empty |
| Show « Principal » as dialog option | Would imply a stored value; rejected — display-only **Spectacle ordinaire** on Infos when null (amended 2026-06-08) |
| Full breadcrumb on mobile | Horizontal overflow; logo-only compromise |
| ⚙ in breadcrumb header row | Competes with breadcrumb; admin scoped per screen via toolbar gear menu |
| Full-width admin strip below header | Rejected 2026-05-25 (post-17.2 review); wastes vertical space; PO prefers inline gear + dropdown |

## References

- [_bmad-output/design-thinking-2026-05-25.md](../../_bmad-output/design-thinking-2026-05-25.md)
- [ux-design-journey-league-agenda.md](../../_bmad-output/planning-artifacts/ux-design-journey-league-agenda.md) — to be updated for Saison copy, `/troupes`, breadcrumb
- PLAN.md Epic 17
- DOMAIN.md § Catégorie, Season UI label
