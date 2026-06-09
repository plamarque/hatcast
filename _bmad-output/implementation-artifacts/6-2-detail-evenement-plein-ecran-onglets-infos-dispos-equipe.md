# Story 6.2: Full-screen event detail — Infos / Dispos / Équipe tabs

Status: done

<!-- Ultimate context engine analysis completed — comprehensive developer guide created -->

## Story

As a **troupe member or organizer**,  
I want a **full-screen event detail** with **Infos**, **Dispos**, and **Équipe** tabs and a **canonical URL** (including deep-link query params),  
so that **I can navigate the spectacle clearly** and **future composition flows have a stable shell** (**UX-DR4**, SPEC event full-screen).

## Acceptance Criteria

1. **Given** an accessible spectacle at `/saison/:slug/event/:eventId`, **when** I open the screen, **then** I see a **full-page layout** (no modal overlay) with **header + tab bar + tab content** — SPEC full-screen contract; V2 path prefix remains **`/saison/`** (not legacy `/season/`).
2. **Given** the event header (UX-DR4), **when** the page loads, **then** it shows: **back chevron** → `/saison/:slug` (agenda, not `/seasons`); **event type icon** + **title** + **formatted start date** (Europe/Paris, same helper as agenda); **right chrome**: **settings** menu (season-scoped admin links when permitted) + **user menu** (avatar, Mon compte) — reuse patterns from [`season-header`](../../apps/web/src/app/pages/season-home/season-header.ts).
3. **Given** the tab bar, **when** I view the screen, **then** three tabs are visible and navigable: **Infos** (default), **Dispos**, **Équipe** — **capsule pill tab bar** per [ux-design-pill-tab-bar.md](../planning-artifacts/ux-design-pill-tab-bar.md) (coque `surface-container-high`, pastille active `primary-container`, pas d’indicateur Material) ; selected tab visually distinct on dark theme. **Régression CI :** voir § *Post-ship regression — pill tab bar (PT-AC)*.
4. **Given** URL query `tab`, **when** the page loads or the tab changes, **then** the active tab syncs with the URL using **V2 values** `infos` | `dispos` | `equipe` (`replaceUrl: true`, merge other query params) — extend existing logic in [`event-detail-placeholder.ts`](../../apps/web/src/app/pages/event-detail-placeholder/event-detail-placeholder.ts).
5. **Given** **legacy SPEC deep links**, **when** the page loads with alias query values, **then** they map to V2 tabs without breaking bookmarks:
   - `tab=info` → **Infos**
   - `tab=team` → **Dispos** (SPEC “Disponibilités” tab)
   - `tab=compo` → **Équipe** (SPEC “Composition” tab)
6. **Given** `showAvailability=true`, **when** the page loads, **then** the **Dispos** tab is active (alias handling may also accept `tab=team` per SPEC).
7. **Given** `showConfirm=true`, **when** the page loads, **then** the **Équipe** tab is active; **no participation modal** in **6.2** — document stub behaviour (empty state only) until **6.7**; do not fail silently if param present.
8. **Given** the **Infos** tab, **when** content renders, **then** it shows:
   - **Status row:** [`composition-status-badge`](../../apps/web/src/app/shared/composition/composition-status-badge.ts) + optional [`compositionStatusHint`](../../apps/web/src/app/core/composition/composition-status-hint.ts) (from **6.1**, do not duplicate lifecycle logic)
   - **Kebab (⋮)** on the status row (organizers/admins only): at minimum **Modifier** and **Archiver** when `canManageEvents`; hide menu when user lacks rights
   - **Labeled fields** (read-only display, UX form-like): **TITRE**, **DESCRIPTION** (or empty copy), **DATE** (calendar icon + formatted datetime), **LIEU** (pin icon + text or empty copy)
   - **No** “prochaine version” placeholder copy on Infos
9. **Given** I choose **Modifier** from the kebab, **when** I confirm in the dialog, **then** [`EventFormDialog`](../../apps/web/src/app/pages/season-home/event-form-dialog.ts) updates the event via existing `PUT` API and the detail view refreshes (title, date, fields, header).
10. **Given** I choose **Archiver**, **when** I confirm, **then** existing [`archiveEvent`](../../apps/web/src/app/core/events/event-api.service.ts) runs and I am navigated back to `/saison/:slug` with success feedback — same semantics as agenda archive in [`season-home.ts`](../../apps/web/src/app/pages/season-home/season-home.ts).
11. **Given** the **Dispos** tab, **when** I select it, **then** existing [`event-dispos-tab`](../../apps/web/src/app/shared/availability/event-dispos-tab.ts) renders unchanged (stories **5.1–5.3**); **6.2** must not regress Moi/Tous, subject selector, or summary API behaviour.
12. **Given** the **Équipe** tab, **when** I open it without composition UI (stories **6.3+**), **then** I see a **product empty state** aligned with SPEC/UX (e.g. *« Aucun tirage pour le moment »* + short helper that composition tools arrive later) — **not** generic “prochaine version” stub; **no** draw/validate/share buttons.
13. **Given** an **archived** event (`archived: true` on DTO), **when** I view Infos/Dispos, **then** **edit/archive** actions are hidden or disabled; Dispos self-edit follows **5.3** archived rule (read-only).
14. **Given** old URLs `/saison/:slug?event=:id&modal=event_details` (and equivalent), **when** the app handles them, **then** redirect to `/saison/:slug/event/:id` preserving applicable query params — implement in season or global redirect guard if not already present; if out of scope, document **OPEN** in Dev Agent Record with rationale.
15. **Couverture:** **UX-DR4** ; builds on **6.1** badges ; **NFR-Q1** — component tests for tab URL sync, legacy aliases, Infos fields, kebab gating; **pill tab bar PT-AC** (capsule shell, hidden indicator, E11 spacing) in `event-detail.spec.ts`; regression `ng test`, `ng build`, `./gradlew test` (no API changes required unless redirect needs new endpoint).

### Post-ship regression — pill tab bar (PT-AC)

**Amendement 2026-06-09 (Sally + Paige)** — le style barre d’onglets a évolué après la livraison initiale de **6.2** : pastilles isolées + `rgba(255,255,255,0.1)` → **barre capsule M3** partagée ([ux-design-pill-tab-bar.md](../planning-artifacts/ux-design-pill-tab-bar.md), mixin [`_hatcast-pill-tab-bar.scss`](../../apps/web/src/styles/_hatcast-pill-tab-bar.scss)). Cette story reste le **garde-fou CI** du détail spectacle : tout changement sous `event-detail.scss` / `_hatcast-pill-tab-bar.scss` doit garder les tests **PT-AC** verts dans [`event-detail.spec.ts`](../../apps/web/src/app/pages/event-detail/event-detail.spec.ts).

| PT-AC | Vérifié en CI (component test) |
|-------|--------------------------------|
| **PT-AC-01** | Coque capsule : `.mat-mdc-tab-header` avec `border-radius` pill (≥ 999px) |
| **PT-AC-02** | Pastille active : `.mdc-tab--active` avec `border-radius` pill (≥ 999px) |
| **PT-AC-03** | Onglets inactifs : `opacity: 1` (pas de régression `0.75`) |
| **PT-AC-04** | `.mdc-tab-indicator` masqué (`display: none`) |
| **PT-AC-07** | `.mat-mdc-tab-body-content` : `padding-top: 1.5rem` (E11) |
| **PT-AC-05, 06, 08, 09** | Tokens couleur / mixin `@use` / Mon compte / revue story — revue manuelle + spec doc ; jsdom ne résout pas `--mat-sys-*` |

**Ne pas** réintroduire de styles tab ad hoc dans `event-detail.scss` : `@include pill-tabs.group()` obligatoire.

### Explicit out of scope (later stories — do not implement in 6.2)

| Story | Deferred capability |
|-------|---------------------|
| **6.3** | Draft publish, slot visibility, `publishedAt` |
| **6.4–6.6** | Draw, manual assign, validate/unlock, six-state Équipe badge |
| **6.7–6.9** | Participation confirm/decline modal (`showConfirm=true` behaviour) |
| **6.10** | Share & announce, kebab **Annoncer** |
| **5.4** | Availability comment field on Dispos |
| **5.5** | Proxy availability edit from Tous |
| **API** | `DELETE` event — no backend today; do not invent |
| **Legacy** | Do not modify `legacy/` |

## Context and slicing

| Story | Scope |
|-------|--------|
| **3.3 (done)** | Route `/saison/:slug/event/:eventId`, minimal shell, back → agenda |
| **5.3 (done)** | Dispos tab functional; minimal `mat-tab-group` on placeholder |
| **6.1 (review)** | `teamStatusBadge`, `compositionLifecycle`, agenda + Infos status row |
| **6.2 (this)** | Complete shell: header chrome, Infos content, URL contract, Équipe empty state, kebab admin actions |
| **6.3+** | Équipe tab composition UI |

## Tasks / Subtasks

- [x] **Scope:** `apps/web/` primary; **`services/api/`** only if redirect/query contract needs server changes (unlikely). **Do not modify** `legacy/`.
- [x] **Component evolution:** refactor [`event-detail-placeholder`](../../apps/web/src/app/pages/event-detail-placeholder/) into production **`event-detail`** page (rename folder/component optional but update [`app.routes.ts`](../../apps/web/src/app/app.routes.ts) import). Keep selector stable or migrate tests in same PR.
- [x] **Header chrome:**
  - Extract **`event-detail-header`** OR extend page template with right zone mirroring `season-header`: settings `mat-menu` (Participants / Organisateur·ices links when `canManageSeasonParticipants` / `canManageSeasonOrganizersOnly` from permissions DTO) + user menu + `MemberProfileService.openProfileDialog` for self avatar.
  - Load session user + season permissions alongside event (already partially done).
- [x] **Tab bar styling:** customize `mat-tab-group` / labels with icons (info, extension puzzle → `grid_on` or custom, theatre masks → `groups` / `theater_comedy`) per UX; center tab strip; dark theme tokens in SCSS.
- [x] **Query param resolver:** centralize `resolveEventDetailTab(query: ParamMap): EventDetailTab` mapping V2 + legacy aliases + `showAvailability` / `showConfirm` precedence (document: explicit `tab` wins over convenience flags unless product says otherwise — **recommend:** `showAvailability`/`showConfirm` apply only when `tab` absent).
- [x] **Infos tab — `event-infos-tab` presentational component:**
  - Inputs: `event`, `canManageEvents`, callbacks or outputs for edit/archive.
  - Status row: badge + hint + kebab.
  - Field blocks: muted small-caps labels, rounded value surfaces (CSS only — not inline edit in 6.2).
  - Wire kebab **Modifier** → `EventFormDialog` with `{ mode: 'edit', seasonId, event }`; on success reload `getEvent`.
  - Wire **Archiver** → confirm dialog → `archiveEvent` → navigate to season.
- [x] **Équipe tab:** dedicated empty-state component/copy; optional link *« Comment ça marche ? »* disabled or routes to future help — no functional composition.
- [x] **Dispos tab:** keep `<app-event-dispos-tab>` integration; verify tab switch does not destroy/recreate unnecessarily (use lazy tab content or `*ngIf` per tab with cache if needed for unsaved state — **5.3** auto-saves so remount acceptable).
- [x] **Deep link from agenda:** optional `?tab=dispos` when opening from availability entry points in a follow-up; **6.2** must at least honour inbound links.
- [x] **Legacy redirect (if missing):** in `SeasonHome` or route guard, detect `event` + `modal=event_details` query on `/saison/:slug` → `router.navigate` to event detail path.
- [x] **Tests:**
  - Unit: `resolveEventDetailTab` alias matrix.
  - Component: header back `routerLink`; Infos fields render title/description/location; kebab hidden without `canManageEvents`; `showAvailability=true` selects Dispos; legacy `tab=compo` selects Équipe.
  - Regression: extend [`event-detail-placeholder.spec.ts`](../../apps/web/src/app/pages/event-detail-placeholder/event-detail-placeholder.spec.ts); **5.3** / **6.1** tests green.
  - Manual QA: compare with [`event-detail-infos-tab-v1.png`](../planning-artifacts/ux-references/event-detail-infos-tab-v1.png).

## Dev Notes

### Architecture & guardrails

- Monorepo V2: [ARCH.md](../../ARCH.md) ; [architecture.md](../planning-artifacts/architecture.md) — Angular Material, design tokens, no Tailwind-primary.
- Auth: [ADR-0010](../../docs/adr/0010-v2-auth-identity-platform.md).
- **Route:** V2 uses `/saison/:slug/event/:eventId`. SPEC canonical path uses `/season/` — document in UI copy/tests only; **do not** add a second route without ADR.
- **Tab naming mismatch:** SPEC code names (`info`, `team`, `compo`) vs V2 French slugs (`infos`, `dispos`, `equipe`). **6.2** implements **both** for deep links; new in-app navigation uses **V2** slugs only.

### URL / query contract (canonical)

| Query | Behaviour (6.2) |
|-------|------------------|
| *(none)* | Tab **Infos** |
| `tab=infos` \| `tab=info` | **Infos** |
| `tab=dispos` \| `tab=team` | **Dispos** |
| `tab=equipe` \| `tab=compo` | **Équipe** |
| `showAvailability=true` | **Dispos** (if `tab` absent) |
| `showConfirm=true` | **Équipe** (if `tab` absent); modal deferred |
| `notificationSuccess=1`, … | **Out of scope** unless already handled globally — do not break |

### UX-DR4 — Infos tab (must match)

Reference: [ux-design — Infos tab](../planning-artifacts/ux-design-hatcast-v2.md#screen-event-detail-infos-tab) and screenshot [`event-detail-infos-tab-v1.png`](../planning-artifacts/ux-references/event-detail-infos-tab-v1.png).

| Element | Implementation hint |
|---------|---------------------|
| Status badge | Reuse **6.1** `teamStatusBadge` (3 simplified labels) — not six-state Équipe badge |
| Kebab | `mat-menu` triggered by `more_vert`; items gated by `canManageEvents` |
| TITRE / DESCRIPTION / DATE / LIEU | Read-only; date uses `formatStart` + `event_calendar` icon |
| Settings cog | Season admin shortcuts (same as agenda), not event-specific draw tools |

**Kebab menu (6.2 minimum):**

| Action | Condition | Implementation |
|--------|-----------|----------------|
| Modifier | `canManageEvents` | `EventFormDialog` |
| Archiver | `canManageEvents` && !archived | `archiveEvent` + confirm |
| Annoncer | — | **Defer 6.10** — omit or disabled with tooltip |
| Supprimer | — | **No API** — omit |

### Reuse — do not reinvent

| Need | Location |
|------|----------|
| Event load | `EventApiService.getEvent` |
| Permissions | `OrganizerApiService.mySeasonPermissions`, `canManageEvents` from [`organizer-permissions.ts`](../../apps/web/src/app/core/permissions/organizer-permissions.ts) |
| Edit/archive dialogs | [`event-form-dialog.ts`](../../apps/web/src/app/pages/season-home/event-form-dialog.ts), archive confirm pattern in `season-home` |
| Composition badge | [`composition-status-badge`](../../apps/web/src/app/shared/composition/composition-status-badge.ts), [`composition-lifecycle.ts`](../../apps/web/src/app/core/composition/composition-lifecycle.ts) |
| Dispos tab | [`event-dispos-tab`](../../apps/web/src/app/shared/availability/event-dispos-tab.ts) |
| Season resolver | [`TroupeSeasonResolverService`](../../apps/web/src/app/core/troupes/troupe-season-resolver.service.ts) |
| Header / user menu | [`season-header`](../../apps/web/src/app/pages/season-home/season-header.ts) — extract shared **`app-page-user-menu`** only if duplication is large; otherwise copy minimal markup |
| Type icon / labels | [`event-types.ts`](../../apps/web/src/app/core/events/event-types.ts) |
| Timezone | [`AGENDA_TIME_ZONE`](../../apps/web/src/app/pages/season-home/season-events.utils.ts) |

### Current baseline (brownfield)

[`event-detail-placeholder`](../../apps/web/src/app/pages/event-detail-placeholder/) already has:

- Header (back, icon, title, date) — **missing** settings + user menu
- `mat-tab-group` with Infos / Dispos / Équipe
- Infos: badge + hint + plain location/description + placeholder text ← **remove placeholder, add fields + kebab**
- Dispos: fully wired
- Équipe: stub text ← **replace with SPEC empty state**
- Query `tab` for `infos` \| `dispos` \| `equipe` only — **add aliases + showAvailability/showConfirm**

### Équipe tab — six-state model (reference only)

Port order and messages from [`composition-status-messages.md`](../../docs/v1/technical/composition-status-messages.md) in **6.6+** when slots UI exists. **6.2** empty state only.

### Permissions summary

| Capability | Rule |
|------------|------|
| View event detail | Active troupe member (existing API 403) |
| Settings menu entries | Same as season: `canManageSeasonParticipants`, `canManageSeasonOrganizersOnly` |
| Kebab Modifier/Archiver | `canManageEvents` (troupe admin for MVP per **3.5**) |
| Dispos subject selector | `canManageComposition` — unchanged (**5.3**) |

### Coordination with story 6.1

- **6.1** places badge on Infos — **keep** inside new `event-infos-tab`; do not move to header.
- If **6.1** still in review, rebase on its `EventResponse` fields (`teamStatusBadge`, `compositionLifecycle`).
- Do not reimplement lifecycle computation client-side.

### Project structure notes

```
apps/web/src/app/pages/event-detail/          # rename from event-detail-placeholder (recommended)
  event-detail.ts
  event-detail.html
  event-detail.scss
  event-detail.spec.ts
  event-detail-header.ts (optional extract)
  event-infos-tab.ts (+ html/scss)
  event-equipe-empty.ts (+ html/scss)
apps/web/src/app/core/events/event-detail-tabs.ts   # resolveEventDetailTab + types (optional)
```

### Testing requirements

| Layer | What to test |
|-------|----------------|
| Unit | Tab resolver: all alias + flag combinations |
| Component | Infos fields; kebab visibility; archive navigates away; settings menu links when permitted |
| Component | Dispos tab still mounts after refactor |
| Component | **Pill tab bar PT-AC** — capsule shell, active pill, hidden indicator, E11 body spacing (`event-detail.spec.ts`) |
| Regression | 6.1 badge tests; 5.3 dispos tests; season agenda navigation |
| Manual | Side-by-side UX screenshot checklist (header, tabs, Infos layout) |

### Previous story intelligence (6.1)

1. **`GET /v1/seasons/{seasonId}/events/{eventId}`** — detail must use this (not list scan).
2. **`composition-status-badge`** + `compositionStatusHint` — reuse on Infos.
3. **Draft visibility** — members may see `preparing` while organizers see draft hints; no slot names on Infos.
4. **Migration V18** — composition tables exist; Équipe tab stays empty until **6.3+**.
5. **File touch list** from 6.1 — extend, do not fork lifecycle services.

### Previous story intelligence (5.3)

1. **`event-dispos-tab`** is production-ready — embed, do not rewrite.
2. **Query `?tab=dispos`** already used — extend resolver, keep working.
3. **Archived events** — read-only dispo; respect on Infos actions too.
4. **Shared availability form** — unaffected by shell work.

### Git intelligence (recent)

- `7056b1f` — Dispos tab + summary API landed on placeholder shell → **6.2** completes shell around it.
- `4f8f01b` — seed data useful for manual QA of Infos fields.
- Prefer **small, focused PR** on `apps/web/` only.

### References

- [epics.md — Story 6.2](../planning-artifacts/epics.md) ; **UX-DR4** definition
- [SPEC.md — Event details full screen](../../SPEC.md) (tabs, query params, layout)
- [ux-design-hatcast-v2.md — Event detail Infos / Dispos / Équipe](../planning-artifacts/ux-design-hatcast-v2.md)
- [ux-design-pill-tab-bar.md — Barre capsule M3 + PT-AC](../planning-artifacts/ux-design-pill-tab-bar.md)
- Story **3.3** — navigation contract
- Story **5.3** — Dispos tab
- Story **6.1** — composition badges
- [DOMAIN.md](../../DOMAIN.md) — event fields (title, date, location, description)

## Dev Agent Record

### Agent Model Used

Composer

### Debug Log References

### Completion Notes List

- Refactored `event-detail-placeholder` → `event-detail` with `app-event-detail-header`, `app-event-infos-tab`, `app-event-equipe-empty`.
- Centralized tab resolution in `resolveEventDetailTab` (V2 slugs + legacy `info`/`team`/`compo` + `showAvailability`/`showConfirm`).
- Infos tab: status badge/hint, kebab Modifier/Archiver (gated, hidden when archived), labeled read-only fields.
- Legacy redirect: `SeasonHome` maps `?event=&modal=event_details` → `/saison/:slug/event/:id` preserving other query params.
- `showConfirm=true`: Équipe tab + notice in empty state (modal deferred to 6.7).
- Tests: `event-detail-tabs.spec.ts`, `event-detail.spec.ts`, legacy redirect in `season-home.spec.ts`. `ng test` (39) + `ng build` OK. No API changes.
- Code review (2026-05-24): added missing component tests (archive, settings, archived kebab, showConfirm); guarded profile dialog until season/troupe IDs load; normalize unknown `tab` query via `replaceUrl`.

### File List

- apps/web/src/app/app.routes.ts
- apps/web/src/app/core/events/event-detail-tabs.ts
- apps/web/src/app/core/events/event-detail-tabs.spec.ts
- apps/web/src/app/pages/event-detail/event-detail.ts
- apps/web/src/app/pages/event-detail/event-detail.html
- apps/web/src/app/pages/event-detail/event-detail.scss
- apps/web/src/app/pages/event-detail/event-detail.spec.ts
- apps/web/src/app/pages/event-detail/event-detail-header.ts
- apps/web/src/app/pages/event-detail/event-detail-header.html
- apps/web/src/app/pages/event-detail/event-detail-header.scss
- apps/web/src/app/pages/event-detail/event-infos-tab.ts
- apps/web/src/app/pages/event-detail/event-infos-tab.html
- apps/web/src/app/pages/event-detail/event-infos-tab.scss
- apps/web/src/app/pages/event-detail/event-equipe-empty.ts
- apps/web/src/app/pages/event-detail/event-equipe-empty.html
- apps/web/src/app/pages/event-detail/event-equipe-empty.scss
- apps/web/src/app/pages/season-home/season-home.ts
- apps/web/src/app/pages/season-home/season-home.spec.ts
- apps/web/src/app/pages/event-detail-placeholder/event-detail-placeholder.ts (deleted)
- apps/web/src/app/pages/event-detail-placeholder/event-detail-placeholder.html (deleted)
- apps/web/src/app/pages/event-detail-placeholder/event-detail-placeholder.scss (deleted)
- apps/web/src/app/pages/event-detail-placeholder/event-detail-placeholder.spec.ts (deleted)

### Change Log

- 2026-05-24: Story 6.2 — full-screen event detail shell (Infos/Dispos/Équipe), URL contract, header chrome, legacy redirects.
- 2026-06-09: Amendement PT-AC — barre capsule M3 ; garde-fous CI dans `event-detail.spec.ts` ; spec [ux-design-pill-tab-bar.md](../planning-artifacts/ux-design-pill-tab-bar.md).

### Review Findings

- [x] [Review][Patch] Incomplete component test coverage vs AC15 / story tasks [`apps/web/src/app/pages/event-detail/event-detail.spec.ts`] — missing tests for: archive confirm → navigate to `/saison/:slug`; settings menu links when `canManageSeasonParticipants` / `canManageSeasonOrganizersOnly`; kebab hidden when `event.archived`; `showConfirm=true` selects Équipe and renders participation notice.
- [x] [Review][Patch] Profile dialog invokable before season/troupe IDs load [`apps/web/src/app/pages/event-detail/event-detail-header.ts:62-72`] — header renders user menu immediately after auth; `openSelfProfile()` can pass empty `seasonId`/`troupeId` while event load is in flight.
- [x] [Review][Patch] Unknown `tab` query leaves stale URL [`apps/web/src/app/core/events/event-detail-tabs.ts:15-29`, `event-detail.ts:133-136`] — e.g. `?tab=unknown` resolves UI to Infos but URL is not normalized via `replaceUrl`.
- [x] [Review][Defer] Duplicated date formatting in header and Infos tab [`event-detail-header.ts:46-56`, `event-infos-tab.ts:28-38`] — deferred, pre-existing pattern (same as agenda); extract shared helper only if a third consumer appears.
