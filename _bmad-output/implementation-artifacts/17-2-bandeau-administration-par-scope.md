# Story 17.2: Scope administration bar

Status: ready-for-dev

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

## Story

As an **organizer or admin**,
I want to access **administration actions for the current scope** (troupe, saison, or spectacle) in an expandable strip **below the header**,
so that **administration is not confused with context navigation** (breadcrumb) and **entries removed in Story 17.1 are restored**.

## Acceptance Criteria

1. **Given** `/troupes/:slug` (troupe hub or stub), **when** the signed-in user has `TROUPE_ADMIN` on that troupe, **then** an expandable **`app-scope-admin-bar`** is shown with label **« Administration de la troupe »** and at least one link **Membres** to troupe member administration. [Source: epics 17.2; ADR 0013 §2; UX Screen 4]
2. **Given** `/troupes/:slug`, **when** the user is not `TROUPE_ADMIN`, **then** the troupe admin bar is **not** rendered. [Source: epics 17.2]
3. **Given** `/saison/:slug` or `/ligue/:slug` (alias), **when** the user has season admin rights equivalent to former header settings (`canManageSeasonParticipants` or organizers-only), **then** the bar shows **« Administration de la saison »** with **Participants** and/or **Organisateur·ices** links matching pre-17.1 behaviour. [Source: epics 17.2; git `season-header.html` settings menu]
4. **Given** season workspace, **when** the user lacks those rights, **then** the saison admin bar is absent. [Source: epics 17.2]
5. **Given** event detail `/saison/:slug/event/:eventId` (or `/ligue/...` alias), **when** the user has **any** applicable admin right for that screen (season settings rights **or** event-scoped participant admin **or** event organizer for this event), **then** the bar shows **« Administration du spectacle »** with the applicable entries. [Source: epics 17.2; UX Screen 6]
6. **Given** event detail, **when** the user has only `eventParticipantAdminFor` / `canManageEventParticipants` for this event (no season settings rights), **then** the spectacle bar is still visible with at least one action to manage **event participants** (via existing edit flow, not a broken link). [Source: `event-detail.ts` `canManageEventParticipantsFor`; regression guard from 17.1]
7. **Given** any screen with the new bar, **when** rendered, **then** there is **still no ⚙ settings button in the header** (admin stays in scope bar only). [Source: Story 17.1 AC4; ADR 0013]
8. **Given** keyboard/screen-reader use, **when** the bar is present, **then** the control is expandable/collapsible with an accessible name including the scope label, links have explicit labels, and focus rings are visible. [Source: NFR-A1; `context-breadcrumb` patterns]
9. **Given** implementation complete, **when** `npm run test -w @hatcast/web -- --watch=false` and `npm run build -w @hatcast/web` run, **then** they pass with tests for visibility gating, link targets, and header still without settings icon. [Source: repo norms]

## Tasks / Subtasks

- [ ] **Admin route helpers** (AC: 1, 3, 5)
  - [ ] Extend `apps/web/src/app/core/navigation/troupe-routes.ts` (or add `admin-routes.ts`) with canonical **`/saison/`** paths used by new chrome:
    - `saisonAdminParticipantsPath(slug)` → `['/saison', slug, 'admin', 'participants']`
    - `saisonAdminMembresPath(slug)` → `['/saison', slug, 'admin', 'membres']`
    - `troupeAdminMembresPath(troupeSlug)` → `['/troupe', troupeSlug, 'admin', 'membres']` (existing route; ADR target `/troupes/:slug/admin/membres` is **17.4** — do not block 17.2 on new route)
  - [ ] Keep using `league-routes.ts` helpers only where `/ligue/` bookmark compatibility is explicitly required; **prefer `/saison/`** in new bar links.
  - [ ] Unit tests for new path builders.

- [ ] **`app-scope-admin-bar` shared component** (AC: 1–8)
  - [ ] Create `apps/web/src/app/shared/scope-admin-bar/` (`scope-admin-bar.ts|html|scss|spec.ts`).
  - [ ] Inputs: `scope: 'troupe' | 'saison' | 'event'`, `items: ScopeAdminBarItem[]` (`label`, `icon`, optional `routerLink`, `queryParams`, optional `action` callback).
  - [ ] Computed panel title from scope: « Administration de la troupe | de la saison | du spectacle ».
  - [ ] Render **only when `items.length > 0`** (parent computes gating; component does not fetch permissions).
  - [ ] UI: expandable strip below header (e.g. `mat-expansion-panel` collapsed by default, or button + `aria-expanded` region) — match design-thinking wireframe « ▾ » pattern; **not** in top chrome.
  - [ ] Use `settings` or `admin_panel_settings` icon on trigger; list links as `mat-list` / anchor rows with icons.

- [ ] **Season workspace integration** (AC: 3–4, 7)
  - [ ] In `season-home.html`, place bar **after** `app-season-header` / mobile context block, **before** `app-season-view-toolbar`.
  - [ ] Build items in `season-home.ts` from existing computeds:
    - Participants if `canManageSeasonParticipants()`
    - Organisateur·ices if `canManageSeasonOrganizersOnly()` → `saisonAdminMembresPath` + `{ onglet: 'organisateurs' }`
  - [ ] Reuse `canManageSettings` only as convenience OR inline same OR condition; **do not** re-expose settings menu on header.

- [ ] **Event detail integration** (AC: 5–7)
  - [ ] In `event-detail.html`, place bar after header / mobile context, **before** `app-event-context-strip` and tabs.
  - [ ] Visibility: `showEventAdminBar()` when any of:
    - `canManageSettings()` (season participants or organizers-only — **parity with removed header menu**)
    - `canManageEventParticipantsFor(currentEventId)`
    - `eventOrganizerFor.includes(currentEventId)` (optional third entry: **Organisateur·ices du spectacle** via `openEdit()` if not already covered)
  - [ ] Items (minimum parity):
    - Season-level **Participants** / **Organisateur·ices** links (same as old `event-detail-header` menu) when respective season perms hold
    - When only event participant admin: **Participants du spectacle** → call existing `openEdit()` (or navigate to Infos + open dialog) — **no new API route**
  - [ ] Label scope **`event`** even when links target season admin URLs (one scope per screen per ADR).

- [ ] **Troupe hub stub integration** (AC: 1–2)
  - [ ] In `troupe-hub-stub.ts` / `.html`, after hero title, show troupe scope bar when `membership.baselineRole === 'TROUPE_ADMIN'`.
  - [ ] Item **Membres** → `troupeAdminMembresPath(slug)`.
  - [ ] Do **not** implement full hub (17.4), preferences drawer, or season list.

- [ ] **Explicit non-goals** (scope guard)
  - [ ] Do **not** add ⚙ back to `season-header` or `event-detail-header`.
  - [ ] Do **not** remove `app-event-context-strip` (17.5).
  - [ ] Do **not** change `/seasons` list admin block (17.3/17.5).
  - [ ] Do **not** add `/troupes/:slug/admin/membres` route unless PO requests — use existing `/troupe/:slug/admin/membres`.
  - [ ] Do **not** implement breadcrumb (17.1 done), slugs (17.6), or full troupe hub (17.4).

- [ ] **Tests & build** (AC: 9)
  - [ ] `scope-admin-bar.spec.ts`: hidden when no items; titles per scope; expansion a11y.
  - [ ] `season-home.spec.ts`: bar visible for participants admin; links to `/saison/.../admin/participants` and organisateurs query.
  - [ ] `event-detail.spec.ts`: bar restores admin access; no header `settings` icon; event-only admin sees spectacle bar.
  - [ ] `troupe-hub-stub` test or extend hub stub spec: TROUPE_ADMIN sees Membres link.
  - [ ] Run web unit tests + build.

## Dev Notes

### Critical regression context (17.1 → 17.2)

Story **17.1** removed the header ⚙ menu that was the **only** UI path to:

| Screen | Removed entries | Target (restore in 17.2) |
|--------|---------------|---------------------------|
| Season workspace | Participants, Organisateur·ices | `/saison/:slug/admin/participants`, `/saison/:slug/admin/membres?onglet=organisateurs` |
| Event detail | Same season-level entries | Same URLs (under « Administration du spectacle ») |
| Troupe hub | *(not on stub yet)* | `/troupe/:slug/admin/membres` for TROUPE_ADMIN |

**Deploy 17.2 with or immediately after 17.1** before production. [Source: `17-1-breadcrumb-contexte-responsive.md` regression guard]

Pre-17.1 menu implementation (reference):

```html
<!-- season-header / event-detail-header (removed in 17.1) -->
@if (canManageSeasonParticipants()) {
  <a mat-menu-item [routerLink]="leagueAdminParticipantsPath(seasonSlug())">Participants</a>
}
@if (canManageSeasonOrganizersOnly()) {
  <a mat-menu-item [routerLink]="leagueAdminMembresPath(seasonSlug())" [queryParams]="{ onglet: 'organisateurs' }">
    Organisateur·ices
  </a>
}
```

### Scope boundaries

| In scope (17.2) | Out of scope |
|-----------------|--------------|
| `app-scope-admin-bar` on troupe stub, saison workspace, event detail | Full `/troupes/:slug` hub UI (**17.4**) |
| Restore admin links removed from headers | Breadcrumb (**17.1** done) |
| Saison canonical admin paths in new links | `/seasons` → `/troupes` redirects (**17.5**) |
| Event-only participant admin via `openEdit()` | Event slug URLs (**17.6**) |
| TROUPE_ADMIN Membres on troupe stub | Remove `event-context-strip` (**17.5**) |

### Product and UX rules

- **One scope bar per screen** — troupe hub → troupe; saison workspace → saison; event detail → spectacle (even if some links point at season admin routes). [Source: ADR 0013 §2; design-thinking `app-scope-admin-bar`]
- Bar sits on **main canvas below header**, not in global chrome. [Source: UX shared chrome]
- **Saison** label in UI; code keeps `season` / `SeasonApiService`. [Source: ADR 0013]
- **No ⚙ in header** — scope bar trigger may use settings icon **inside** the strip only. [Source: ADR 0013 alternatives]

### Permission gating (reuse — do not reinvent)

| Signal | Source | Use for |
|--------|--------|---------|
| `canManageSeasonParticipants` | `seasonPermissions()?.canManageSeasonParticipants` | Participants link |
| `canManageSeasonOrganizersOnly` | organizers && !`canManageMembers` | Organisateur·ices link |
| `canManageSettings` | participants \|\| organizers-only | Season/event bar visibility (season-level) |
| `TROUPE_ADMIN` | `troupe.membership.baselineRole === 'TROUPE_ADMIN'` | Troupe bar (`seasons-list` pattern) |
| `canManageEventParticipantsFor(eventId)` | season flag or `eventParticipantAdminFor` | Event bar + spectacle participants action |
| `eventOrganizerFor.includes(eventId)` | `MySeasonPermissions` | Optional organisateurs spectacle via edit dialog |

Load permissions via existing `OrganizerApiService` / `seasonPermissions` signals on `SeasonHome` and `EventDetail` — **no new API**.

### Existing code to reuse

| File | Reuse for |
|------|-----------|
| `season-home.ts` | `canManageSeasonParticipants`, `canManageSeasonOrganizersOnly`, `canManageSettings`, `seasonPermissions` |
| `event-detail.ts` | Same + `canManageEventParticipantsFor`, `openEdit()` + `EventFormDialog` |
| `troupe-hub-stub.ts` | `TroupeContextService.activeTroupes()`, `baselineRole` |
| `seasons-list.ts` / `.html` | `canManageMembers` pattern for TROUPE_ADMIN |
| `league-routes.ts` | Legacy `/ligue/` paths — mirror with `/saison/` helpers |
| `troupe-routes.ts` | `troupeHubPath`, `saisonWorkspacePath` — add admin paths alongside |
| `admin-membres`, `admin-participants` | Destination pages (unchanged) |
| `shared/context-breadcrumb/` | Placement reference (bar goes **below** header row) |

### Implementation guardrails

- **Parent pages own permission logic** — pass `items[]` into dumb presentational bar; keeps tests simple.
- **Prefer `/saison/` admin URLs** in new links; `/ligue/...` routes still work via alias.
- **Troupe membres:** use `['/troupe', troupeSlug, 'admin', 'membres']` until 17.4 adds `/troupes/:slug/admin/*`.
- **Do not** link breadcrumb troupe segment to admin membres (ADR forbids); admin only via scope bar.
- Match breakpoints/spacing with `season-home.scss` / `event-detail.scss` (`--season-shell-bg`, etc.).
- Collapsed-by-default avoids pushing agenda content; align with wireframe « ▾ » affordance.

### Previous story intelligence (17.1)

- `app-context-breadcrumb` integrated in `SeasonHeader` / `EventDetailHeader`; mobile titles below header.
- Header ⚙ and back chevrons **removed** — 17.2 must restore admin without touching breadcrumb.
- `troupe-routes.ts` created; stub `/troupes/:slug` → `TroupeHubStub` until 17.4.
- `canManageSettings` computeds **remain** on `season-home.ts` / `event-detail.ts` but are unused in templates — wire them to scope bar gating.
- Tests explicitly assert no header settings — keep those tests green.

### Git intelligence

- 17.1 implementation exists locally (review): new `context-breadcrumb`, `troupe-hub-stub`, header refactor.
- Last committed epic-17 docs: `9b4ab1a docs(plan): Add ADR 0013 and Epic 17 navigation spec`.
- Old settings menu recoverable from git history of `season-header.html` / `event-detail-header.html` (see Dev Notes snippet).

### Latest technical notes (Angular 21 + Material)

- Standalone component; `input()` / `computed()` consistent with 17.1 headers.
- `MatExpansionModule` or lightweight `button` + `@if (expanded())` with `aria-expanded`.
- `RouterLink` + `MatIconModule` for item rows.
- Tests: Vitest + `TestBed` + `provideRouter` (see `context-breadcrumb.spec.ts`, `season-header.spec.ts`).

### Project Structure Notes

- New: `apps/web/src/app/shared/scope-admin-bar/`
- Touch: `troupe-routes.ts` (admin paths), `season-home.html|ts`, `event-detail.html|ts`, `troupe-hub-stub.html|ts`, specs.
- Optional: `admin-routes.ts` if `troupe-routes.ts` would become crowded.

### References

- [Source: `_bmad-output/planning-artifacts/epics.md` — Epic 17, Story 17.2]
- [Source: `docs/adr/0013-troupe-navigation-equity-tags-event-slugs.md` — §2 Chrome]
- [Source: `_bmad-output/planning-artifacts/ux-design-journey-league-agenda.md` — `app-scope-admin-bar`, Screens 3–4, 6]
- [Source: `_bmad-output/design-thinking-2026-05-25.md` — wireframes P2–P3, component spec]
- [Source: `_bmad-output/implementation-artifacts/17-1-breadcrumb-contexte-responsive.md` — regression guard, non-goals]
- [Source: `apps/web/src/app/app.routes.ts` — admin routes]
- [Source: `apps/web/src/app/core/navigation/league-routes.ts` — legacy admin paths]
- [Source: `PLAN.md` — Epic 17.2 row]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

### Change Log
