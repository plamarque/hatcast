# Story 3.3 : Season calendar / agenda view (filters, agenda / history toggle)

Status: done

<!-- Ultimate context engine analysis completed — comprehensive developer guide created -->

## Story

As a **member or organizer**,  
I want a **season agenda view** with header (back, troupe logo, season title, settings, avatar), **participant and event filters**, and an **Agenda vs Historique view switcher**,  
so that I can **browse spectacles by month** with composition status at a glance and navigate to event detail.

## Acceptance Criteria

1. **Given** a season with events, **when** the user opens the **Agenda** view on `/saison/:slug`, **then** events are **grouped by month** with a centered month pill (e.g. *mai 2026*), each row shows **date column** (day number + weekday), **title**, and slots for **composition status** and **user dispo/role pill** per UX-DR2 — **FR12**, **FR13**, **UX-DR2**.
2. **Given** the Agenda product rule ([Agenda content scope](../planning-artifacts/ux-design-hatcast-v2.md#agenda-content-scope-product-rule)), **when** Agenda is active, **then** only **non-archived** events with `startsAt` on or after **today’s civil day** (inclusive) are listed — enforced via existing API `scope=upcoming` (**Europe/Paris**, already in `EventService`) ; **do not** re-filter past events client-side on paginated pages.
3. **Given** the season shell, **when** the user uses the **view switcher**, **then** they can switch between **Agenda** (this story) and **Historique** (shell only — content is **story 3.6**) without leaving `/saison/:slug` ; **Participants** and **Spectacles** tabs may be **disabled or hidden** until later epics (document the choice in code).
4. **Given** the filter toolbar, **when** Agenda is active, **then** **participant** and **event** filter controls are visible (V1 parity: filters only on Agenda) ; default participant focus = **connected user** (or “Tous” when no player model yet) ; default event filter = **“Tous”** ; filtering applies to loaded events (client-side acceptable for MVP — see Dev Notes).
5. **Given** a season header per UX-DR2, **when** the page loads, **then** it shows: **back** → `/seasons`, **troupe logo** (placeholder acceptable until epic-2 assets), **season title**, **settings** entry (placeholder or link to future admin), **user avatar/menu** (reuse pattern from `/seasons` / signed-in home).
6. **Given** a click on an event card/row, **when** navigation occurs, **then** the app routes to **`/saison/:slug/event/:eventId`** (V2 French prefix; SPEC canonical behaviour uses `/season/` in legacy docs — V2 route is **`/saison/`**) ; a **minimal placeholder** event screen is acceptable until epic-6 (Infos/Dispos/Équipe) — **must** include back chevron → `/saison/:slug`.
7. **Given** admin CRUD from story 3.2, **when** an admin creates/edits/archives events, **then** existing mutations still work ; admin actions must not break the new layout (e.g. kebab menu on cards or a dedicated admin entry).
8. **Given** mobile-first layout ([FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md)), **when** viewed on phone width, **then** header + filter/switcher row stays **compact and usable without scrolling** ; month groups and cards remain readable.
9. **Couverture :** **UX-DR2** ; supports **FR12**, **FR13** ; **NFR-P1** — keep server-side pagination for event lists ; do not load unbounded events for grouping.

### Placeholders (explicit — not blockers for 3.3 done)

- **Composition status pill** (orange *Équipe en préparation* / green *Équipe confirmée*) — render **empty or neutral** until epic-6 provides cast data ; structure CSS/HTML must exist.
- **User dispo/role pill** — render **empty or “Non renseigné”** until epic-5 ; do not invent API fields.
- **Historique tab content** — **empty state** pointing to story 3.6 (“Statistiques bientôt disponibles” or equivalent) ; switcher must work.
- **Event type icon** — generic icon until story 3.4 event types.

## Contexte produit et découpage

| Story | Scope |
|-------|--------|
| **3.2 (done)** | Event CRUD, paginated list, `scope=upcoming\|all`, flat Material cards |
| **3.3 (this)** | Season **chrome**, filters, view switcher, **month-grouped Agenda**, navigation to event detail shell |
| **3.4** | Event types + role config → type icons on cards |
| **3.6 (ready-for-dev)** | Historique grid content (stats, export) — consumes shell from 3.3 |
| **Epic 5–6** | Real dispo pills + composition badges |

**Remove or hide** the dev-oriented slide-toggle *« Afficher passés et archivés »* from the product Agenda UI (story 3.2 artefact). If still needed for admin debugging, gate behind an explicit admin affordance — not the Agenda/Historique switcher.

## Tasks / Subtasks

- [x] **Scope:** `apps/web/` primary ; `services/api/` **only if** new query params or enriched list DTOs are strictly required (prefer reusing `GET /v1/seasons/{seasonId}/events?scope=upcoming`).
- [x] **Refactor `SeasonHome`** into shell + child views (recommended):
  - `season-header` — back, logo, title, settings, user menu
  - `season-view-toolbar` — participant filter, event filter, view switcher (MatButtonToggleGroup or MatTabNavBar)
  - `season-agenda` — month grouping + event cards
  - `season-history-shell` — placeholder for 3.6
- [x] **Month grouping utility:** pure function `groupEventsByMonth(events: EventResponse[], locale = 'fr-FR')` → `{ monthKey, monthLabel, events[] }` ; sort ascending by `startsAt` ; pattern from [`legacy/src/components/TimelineView.vue`](../../legacy/src/components/TimelineView.vue) (`groupedEventsByMonth`).
- [x] **Agenda data loading:** keep `EventApiService.listEvents(seasonId, page, size, 'upcoming')` ; consider loading **all upcoming pages** for grouping only if `totalElements` is small (e.g. ≤ 100) OR group **per loaded page** with month headers (document trade-off — prefer fetching enough upcoming events for coherent month UX without breaking NFR-P1).
- [x] **Filters (client state):** `selectedPlayerId | null`, `selectedEventIds | null` ; filter pipeline on in-memory event list ; wire UI triggers (MatMenu or MatSelect) — reference [`ViewHeader.vue`](../../legacy/src/components/ViewHeader.vue) behaviour (filters visible only when Agenda active).
- [x] **View switcher state:** `seasonView: 'agenda' | 'history' | 'participants' | 'events'` ; persist in component signal (optional: query param `?view=agenda` for deep links — nice-to-have).
- [x] **Route event detail:** add `{ path: 'saison/:slug/event/:eventId', component: EventDetailPlaceholder }` in [`app.routes.ts`](../../apps/web/src/app/app.routes.ts) ; placeholder shows title + date + back → `/saison/:slug`.
- [x] **Card navigation:** whole card clickable → `router.navigate(['/saison', slug, 'event', ev.id])` ; kebab admin menu uses `stopPropagation`.
- [x] **Styling:** dark season background, semantic colours for future badges (orange/green/red/purple per UX) via Material theme tokens — align mood with [`season-agenda-v2-upcoming-malice-2026.png`](../planning-artifacts/ux-references/season-agenda-v2-upcoming-malice-2026.png).
- [x] **Tests:** unit tests for `groupEventsByMonth` and filter pipeline ; component test for view switcher ; manual QA against UX acceptance hints ; `ng build`, `ng test`, `./gradlew test` (no API regression).

### Review Findings

- [x] [Review][Patch] Event detail lookup uses an invalid and incomplete paginated request [`apps/web/src/app/pages/event-detail-placeholder/event-detail-placeholder.ts:77`]
- [x] [Review][Patch] Participant filter is selectable but does not affect agenda results [`apps/web/src/app/pages/season-home/season-home.ts:85`]
- [x] [Review][Patch] Agenda truncation has no way to reach events after the cap [`apps/web/src/app/pages/season-home/season-home.ts:159`]
- [x] [Review][Patch] Month/day grouping uses browser timezone instead of the agenda timezone [`apps/web/src/app/pages/season-home/season-events.utils.ts:21`]
- [x] [Review][Patch] Selected event filter can become stale after reloads or archives [`apps/web/src/app/pages/season-home/season-home.ts:269`]
- [x] [Review][Patch] Card-to-detail navigation is not covered by a component test [`apps/web/src/app/pages/season-home/season-agenda.html:1092`]
- [x] [Review 2][Patch] Concurrent agenda reloads can overwrite newer list state [`apps/web/src/app/pages/season-home/season-home.ts`]
- [x] [Review 2][Patch] Incremental loading hides the already loaded agenda and leaves "load more" clickable [`apps/web/src/app/pages/season-home/season-agenda.html`]
- [x] [Review 2][Patch] Event detail date formatting does not pin the Paris agenda timezone [`apps/web/src/app/pages/event-detail-placeholder/event-detail-placeholder.ts`]
- [x] [Review 2][Patch] Route parameter changes do not reload season or event detail state [`apps/web/src/app/pages/season-home/season-home.ts`, `apps/web/src/app/pages/event-detail-placeholder/event-detail-placeholder.ts`]
- [x] [Review 2][Patch] Truncation copy counts filtered cards instead of loaded upcoming events [`apps/web/src/app/pages/season-home/season-agenda.html`]
- [x] [Review 2][Patch] Event load limit is not reset when the season route changes [`apps/web/src/app/pages/season-home/season-home.ts`]
- [x] [Review 2][Patch] Regression tests are missing for detail pagination, parent navigation, load-more guard, and stale filters [`apps/web/src/app/pages/season-home/season-home.spec.ts`, `apps/web/src/app/pages/event-detail-placeholder/event-detail-placeholder.spec.ts`]

## Dev Notes

### Architecture & guardrails

- Monorepo V2: [ARCH.md](../../ARCH.md) ; REST patterns: [architecture.md](../planning-artifacts/architecture.md).
- Auth session: [ADR-0010](../../docs/adr/0010-v2-auth-identity-platform.md) ; `credentials: 'include'` + CSRF on mutations.
- UI: [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md) — Material components, mobile-first, theme tokens (UX-DR11).
- **Do not modify `legacy/`** — use as behavioural reference only.

### Existing blocks (reuse — do not reinvent)

| Subject | Location |
|---------|----------|
| Event list API + `scope=upcoming` (Paris EOD rule) | [`EventService.kt`](../../services/api/src/main/kotlin/com/hatcast/api/event/EventService.kt), [`EventController.kt`](../../services/api/src/main/kotlin/com/hatcast/api/event/EventController.kt) |
| Event client | [`event-api.service.ts`](../../apps/web/src/app/core/events/event-api.service.ts) |
| Season by slug | [`season-api.service.ts`](../../apps/web/src/app/core/seasons/season-api.service.ts), `GET /v1/troupes/{id}/seasons/by-slug/{slug}` |
| Current season page (refactor base) | [`season-home/*`](../../apps/web/src/app/pages/season-home/) |
| Admin event dialog | [`event-form-dialog.ts`](../../apps/web/src/app/pages/season-home/event-form-dialog.ts) |
| Confirm dialog | [`confirm-dialog.ts`](../../apps/web/src/app/pages/seasons-list/confirm-dialog.ts) |
| OpenAPI events | [`openapi/events.yaml`](../../services/api/openapi/events.yaml) |

### V1 reference implementations (read-only)

| Component | Role for 3.3 |
|-----------|--------------|
| [`SeasonHeader.vue`](../../legacy/src/components/SeasonHeader.vue) | Sticky header layout |
| [`ViewHeader.vue`](../../legacy/src/components/ViewHeader.vue) | Filters + view tabs |
| [`TimelineView.vue`](../../legacy/src/components/TimelineView.vue) | Month grouping + agenda cards |
| [`eventPastParis.js`](../../legacy/src/utils/eventPastParis.js) | Past-day rule (already mirrored in API) |

### Month grouping algorithm (implement in TS)

```typescript
// Pseudocode — mirror TimelineView.vue
// 1. Sort events by startsAt asc
// 2. For each event, monthKey = `${year}-${month}` (0-based or 1-based — be consistent)
// 3. monthLabel = Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(date)
// 4. Per event: dayNumber, dayName (weekday long, fr-FR)
// 5. Return ordered array of { monthKey, monthLabel, events: [...] }
```

### Pagination vs grouping strategy (decide in implementation)

| Option | Pros | Cons |
|--------|------|------|
| **A — Paginator per page, group within page** | Simple, NFR-P1 safe | Month header may repeat/split across pages |
| **B — Fetch all upcoming (loop pages until done)** | Perfect month UX for typical seasons | Risk if hundreds of events |
| **C — API: `size=200` + upcoming only** | Pragmatic for troupe-sized seasons | Document max ; add paginator if `totalElements > cap` |

**Recommendation:** Option **C** with cap **100–200** upcoming events for Agenda ; show paginator only when cap exceeded. Document in component.

### Filter data sources (MVP)

- **Participants:** until epic-2, use **connected user only** from `GET /v1/auth/me` + optional static “Tous” ; no player list API yet — UI shell with disabled state or single-user dropdown is OK.
- **Events:** build options from loaded upcoming events (`title` + `id`) ; “Tous” = no filter.

### Event detail route

- SPEC canonical: `/season/:slug/event/:eventId` — V2 uses **`/saison/:slug/event/:eventId`** ([`app.routes.ts`](../../apps/web/src/app/app.routes.ts) convention).
- Placeholder component: minimal — proves navigation contract for QA AC #6 ; epic-6 replaces with full tabs (UX-DR4).

### Integration with story 3.6

- Historique tab renders `<app-season-history-shell>` (empty state).
- Story 3.6 will replace shell content without changing switcher contract.
- Shared filter state (participant/event) should live in **parent shell** so 3.6 can subscribe later.

### Security & admin

- Keep existing CRUD + archive flows from 3.2.
- Settings cog: link to future season admin or no-op with tooltip “Bientôt disponible” — do not expose insecure admin routes.

### Out of scope

- Full Historique grid, CSV export (3.6).
- Real composition/dispo data (epics 5–6).
- Event types / icons (3.4).
- Member profile popover (2.6).
- Participants / Spectacles grid views (future stories).

### Testing requirements

| Layer | What to test |
|-------|----------------|
| **Unit** | `groupEventsByMonth`, date column formatting, filter by event id(s) |
| **Component** | View switcher toggles Agenda vs Historique shell ; card click navigates with correct route |
| **API regression** | Existing `EventControllerIntegrationTest` scope upcoming/all still green |
| **Manual QA** | UX checklist in [ux-design § Season calendar](../planning-artifacts/ux-design-hatcast-v2.md#screen-season-calendar) acceptance hints |

### Previous story intelligence (3.2)

- **Delivered:** `V5__events.sql`, full event CRUD, `scope=upcoming|all`, `season-home` flat list, slide-toggle for all/upcoming.
- **Fixes applied:** PATCH events with `JsonNullable` ; season header counts from `totalElements` ; Paris timezone for upcoming filter.
- **Do not regress:** page fallback after archive on last page ; session gate before load ; slug resolution via first troupe (seed — document until epic-2).
- **Explicit 3.2/3.3 split:** 3.2 said *« Ne pas livrer toute la coque agenda »* — 3.3 delivers that chrome.

### Git intelligence (recent commits)

- `b22a865` — event PATCH + season header counts (patterns for nullable PATCH, header metrics).
- `02f53db` — story 3.2 foundation: events API + season-home list.
- `17213a8` — V1 Paris EOD past rule ported to legacy branch (API already uses `Europe/Paris`).

### Latest tech notes

- **Angular 19+** standalone components, signals — follow existing `season-home.ts` patterns (`signal`, `toSignal`, `@if/@for`).
- **Angular Material 19** — prefer `mat-button-toggle-group` for view switcher ; `mat-nav-bar` alternative ; theming via `season-home.scss` + global tokens.
- No new npm dependencies required for month grouping (native `Intl`).

### Project context reference

- [Epics — Story 3.3](../planning-artifacts/epics.md)
- [UX V2 — Season calendar](../planning-artifacts/ux-design-hatcast-v2.md#screen-season-calendar)
- [UX capture V2 Agenda](../planning-artifacts/ux-references/season-agenda-v2-upcoming-malice-2026.png)
- [Story 3.2](./3-2-spectacles-dans-la-saison-et-liste-pour-les-membres.md)
- [Story 3.6 shell dependency](./3-6-vue-historique-colonnes-roles-mois-export-masquage.md)
- [SPEC.md](../../SPEC.md) — event detail full-screen contract

## Dev Agent Record

### Agent Model Used

Cursor agent (bmad-dev-story, story 3.3).

### Debug Log References

_(aucun)_

### Completion Notes List

- **Shell saison :** `SeasonHome` refactorisé en composants `SeasonHeader`, `SeasonViewToolbar`, `SeasonAgenda`, `SeasonHistoryShell`.
- **Agenda :** groupement par mois via `groupEventsByMonth` ; chargement `scope=upcoming` paginé jusqu’à `AGENDA_UPCOMING_CAP` (200) ; notice si tronqué.
- **Filtres :** participant (Tous + utilisateur connecté) et spectacle (Tous + liste) ; visibles uniquement en vue Agenda ; filtre événement côté client.
- **Switcher :** Agenda / Historique (`SeasonView` — Participants/Spectacles masqués, documenté dans `season-view.types.ts`).
- **Navigation :** carte cliquable → `/saison/:slug/event/:eventId` ; placeholder `EventDetailPlaceholder` avec retour agenda.
- **Admin :** CRUD/archivage conservés (kebab sur cartes, bouton Nouveau spectacle).
- **Supprimé :** slide-toggle « Afficher passés et archivés » (artefact 3.2).
- **Review fixes :** détail événement paginé par lots de 100 ; groupement jour/mois en `Europe/Paris` ; bouton « Charger plus » ; filtre événement obsolète réinitialisé ; filtre participant limité à « Tous » tant que l’API membre/dispo manque.
- **Tests :** `season-events.utils.spec.ts`, `season-view-toolbar.spec.ts`, `season-agenda.spec.ts` ; `ng test` (37 tests), `ng build`, `./gradlew test` OK.

### File List

- `apps/web/src/app/app.routes.ts`
- `apps/web/src/app/pages/event-detail-placeholder/event-detail-placeholder.ts`
- `apps/web/src/app/pages/event-detail-placeholder/event-detail-placeholder.html`
- `apps/web/src/app/pages/event-detail-placeholder/event-detail-placeholder.scss`
- `apps/web/src/app/pages/season-home/season-home.ts`
- `apps/web/src/app/pages/season-home/season-home.html`
- `apps/web/src/app/pages/season-home/season-home.scss`
- `apps/web/src/app/pages/season-home/season-events.utils.ts`
- `apps/web/src/app/pages/season-home/season-events.utils.spec.ts`
- `apps/web/src/app/pages/season-home/season-header.ts`
- `apps/web/src/app/pages/season-home/season-header.html`
- `apps/web/src/app/pages/season-home/season-header.scss`
- `apps/web/src/app/pages/season-home/season-view-toolbar.ts`
- `apps/web/src/app/pages/season-home/season-view-toolbar.html`
- `apps/web/src/app/pages/season-home/season-view-toolbar.scss`
- `apps/web/src/app/pages/season-home/season-view-toolbar.spec.ts`
- `apps/web/src/app/pages/season-home/season-view.types.ts`
- `apps/web/src/app/pages/season-home/season-agenda.ts`
- `apps/web/src/app/pages/season-home/season-agenda.html`
- `apps/web/src/app/pages/season-home/season-agenda.scss`
- `apps/web/src/app/pages/season-home/season-agenda.spec.ts`
- `apps/web/src/app/pages/season-home/season-history-shell.ts`
- `apps/web/src/app/pages/season-home/season-history-shell.html`
- `apps/web/src/app/pages/season-home/season-history-shell.scss`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

### Change Log

- 2026-05-23 : Implémentation vue agenda saison (UX-DR2) — shell, filtres, groupement mois, route détail placeholder ; story en **review**.
- 2026-05-23 : Code review — 6 findings patch résolus ; story **done**.

---

### Validation create-story (`checklist.md`) — 2026-05-23

Adversarial review applied inline: clarified 3.2 slide-toggle removal, pagination/grouping trade-off, placeholder rules for epics 5–6, V2 `/saison/` route vs SPEC `/season/`, Historique shell vs 3.6 content, filter MVP without player API, and reuse of existing `scope=upcoming` backend.
