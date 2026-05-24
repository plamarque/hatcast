# Story 12.4: Event context strip

Status: done

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

## Story

As a **signed-in member or organizer viewing an event detail**,
I want to see the event's **Ligue · Troupe** context with clear navigation from the event screen,
so that I always know which troupe's team I am planning and can move back to the league or troupe administration context without detours.

## Acceptance Criteria

1. **Given** an accessible event detail route `/saison/:slug/event/:eventId`, **when** the event loads, **then** a context strip is displayed below the event header and above the tabs with the text **`{troupeName} · {leagueTitle}`**. [Source: `_bmad-output/planning-artifacts/epics.md` Story 12.4; `_bmad-output/planning-artifacts/ux-design-journey-league-agenda.md` Screen 6]
2. **Given** the context strip is displayed, **when** the user activates **Voir la ligue**, **then** they navigate to the current league workspace at `/saison/:slug` for this story. Do **not** introduce `/ligue/:slug`; that alias belongs to Story 12.6. [Source: `_bmad-output/planning-artifacts/plan-v2-league-journey.md` Wave 1; `apps/web/src/app/app.routes.ts`]
3. **Given** the context strip is displayed and the signed-in user can access the current troupe administration route, **when** the user activates **Voir la troupe**, **then** they navigate to the existing troupe member administration route `/troupe/:troupeSlug/admin/membres`. [Source: `app.routes.ts`; PLAN V2 MVP note: Story 12.4 + existing admin routes cover MVP before full troupe hub]
4. **Given** the signed-in user cannot use the troupe administration route or the route cannot be resolved, **when** the strip is displayed, **then** the troupe context remains visible and the **Voir la troupe** action is not rendered as a broken link. It may be hidden or disabled with accessible explanatory text. Do **not** create the full `/troupe/:slug` hub in this story; that is Story 14.1. [Source: Epic 14; `_bmad-output/planning-artifacts/ux-design-journey-league-agenda.md` Screen 4]
5. **Given** the event belongs to a cross-troupe real-world encounter represented by separate HatCast events, **when** each event detail is opened, **then** the strip reflects only that event's own `troupe` and `league` context and never references the other troupe's composition. [Source: ADR 0011; UX Screen 6 acceptance hints]
6. **Given** the event is opened from `/agenda` or from a deep link, **when** the context strip renders, **then** it uses the same resolved season/troupe context already used by `EventDetail` and does not require an extra unbounded client-side lookup or N+1 list call. [Source: `EventDetail.loadEvent`; `TroupeSeasonResolverService`]
7. **Given** loading, resolver error, ambiguous slug, no-membership, not-found, or event-not-found states, **when** no event context can be trusted, **then** the strip is not shown and existing snackbar/error behaviour remains unchanged. [Source: current `EventDetail` error handling]
8. **Given** keyboard or screen-reader navigation, **when** the user reaches the strip, **then** the strip is announced as contextual navigation, both actions have explicit accessible names, focus styling is visible, and contrast meets the current dark Material theme. [Source: NFR-A1; architecture frontend accessibility guidance]
9. **Given** implementation is complete, **when** `@hatcast/web` unit tests run, **then** tests cover strip rendering, league link target, troupe admin link target or gated hidden/disabled state, no strip before successful load, and cross-troupe label isolation by using two different resolved troupe fixtures. [Source: NFR-Q1; existing `event-detail.spec.ts`]

## Tasks / Subtasks

- [x] **Expose resolved context to the event detail template** (AC: 1, 3, 4, 6, 7)
  - [x] In `apps/web/src/app/pages/event-detail/event-detail.ts`, retain the resolved `troupeName`, `troupeSlug`, `leagueTitle`, and current `seasonSlug` after `TroupeSeasonResolverService.resolveSeasonSlug(slug)` succeeds.
  - [x] Keep `seasonId` and `troupeId` behaviour unchanged for `EventDetailHeader`, `EventDisposTab`, and permissions.
  - [x] Reset the context signals when loading a new route or when resolution fails, so stale context is never shown for a later failed event.

- [x] **Add a focused context-strip component or local section** (AC: 1, 2, 3, 4, 8)
  - [x] Preferred: create `event-context-strip.ts/html/scss` under `apps/web/src/app/pages/event-detail/` if the template would otherwise become noisy.
  - [x] Render visible copy as `{{ troupeName }} · {{ leagueTitle }}`.
  - [x] Render **Voir la ligue** as a router link to `['/saison', seasonSlug]`.
  - [x] Render **Voir la troupe** only when a safe target exists. For this story, the safe existing target is `['/troupe', troupeSlug, 'admin', 'membres']`, intended for users who can manage or access member administration. Avoid linking to `/troupe/:slug` until Story 14.1 exists.
  - [x] If the troupe action is hidden or disabled, keep the troupe name visible in the strip so the user still has orientation.

- [x] **Wire the strip into event detail layout** (AC: 1, 7, 8)
  - [x] Insert the strip in `event-detail.html` after `<app-event-detail-header>` and before `<mat-tab-group>`, only when the event and resolved context are both available.
  - [x] Do not duplicate the event title/date already shown in `EventDetailHeader`.
  - [x] Keep the `Infos / Dispos / Équipe` tab order and query-param handling unchanged.

- [x] **Style with current Angular Material/V2 patterns** (AC: 1, 8)
  - [x] Use the existing dark page surface and rounded-pill/button vocabulary from `event-detail-header.scss`, `event-detail.scss`, and `user-agenda.scss`.
  - [x] Keep the strip compact on mobile: label on the first line if needed, actions wrapping below without horizontal overflow.
  - [x] Use semantic HTML (`nav` or a section with `aria-label="Contexte du spectacle"`) and visible focus states.

- [x] **Protect existing routing and scope boundaries** (AC: 2, 3, 4, 5, 6)
  - [x] Do not add `/ligue/:slug` in 12.4.
  - [x] Do not implement the full troupe hub `/troupe/:slug` in 12.4.
  - [x] Do not change post-login routing, `/agenda`, or user-agenda filters.
  - [x] Do not change backend authorization unless the current API cannot supply context safely; prefer reusing resolver data already loaded by the page.

- [x] **Tests** (AC: 1–9)
  - [x] Extend `apps/web/src/app/pages/event-detail/event-detail.spec.ts` to assert context strip text after successful load.
  - [x] Assert **Voir la ligue** links to `/saison/season-a`.
  - [x] Assert **Voir la troupe** links to `/troupe/troupe/admin/membres` when the fixture grants the required context/permission, or assert the action is hidden/disabled when not allowed.
  - [x] Add a fixture with a different `TroupeApiService.listMyTroupes()` result and season title to prove the strip reflects the resolved event's own troupe/league.
  - [x] Assert no context strip is rendered while loading and after resolver failure.
  - [x] Run `npm run test -w @hatcast/web -- --watch=false` and `npm run build -w @hatcast/web`.

## Dev Notes

### Scope boundaries

| In scope (12.4) | Out of scope |
|-----------------|--------------|
| Context strip on existing event detail route | `/ligue/:slug` alias (**12.6**) |
| Visible `Troupe · Ligue` orientation | Full troupe hub `/troupe/:slug` (**14.1**) |
| Link back to current league workspace | User agenda filters (**12.3**) |
| Safe existing troupe/admin navigation when available | Multi-active league migration (**Epic 13**) |
| Event-detail tests | Composition behaviours (**Epic 6**) |

This is a **frontend navigation and orientation story**. It should be small and should not mutate event, availability, composition, or participant state.

### Product and UX rules

- Product term is **Ligue** in UI copy, even though code and API still use `season`.
- The strip exists because `/agenda` can aggregate multiple troupes and leagues; event detail must make the current scope unmistakable.
- Cross-troupe real-world matches are still separate HatCast events. The strip must show the current event's own troupe/league only.
- Story 14.1 owns the real troupe hub. Until that route exists, 12.4 must not create a fake hub or route users to a 404.

### Existing code to reuse

| Existing file | Reuse for |
|---------------|-----------|
| `apps/web/src/app/pages/event-detail/event-detail.ts` | Resolved season/troupe context and page state |
| `apps/web/src/app/core/troupes/troupe-season-resolver.service.ts` | Resolves route slug to `{ troupe, season }` |
| `apps/web/src/app/core/troupes/troupe-api.service.ts` | `TroupeListItem.slug`, `name`, membership role |
| `apps/web/src/app/pages/event-detail/event-detail-header.*` | Header remains unchanged; style vocabulary |
| `apps/web/src/app/pages/event-detail/event-detail.spec.ts` | Test harness for route params, resolver fixtures, event load |
| `apps/web/src/app/app.routes.ts` | Current safe route targets |

### Implementation guardrails

- Prefer adding a tiny presentational component if it keeps `event-detail.html` readable; otherwise a local `section` is fine.
- Do not add another API call just to retrieve troupe/league names: `loadEvent()` already obtains `resolved.troupe` and `resolved.season` before loading the event.
- Do not infer access from UI alone for protected routes. If the **Voir la troupe** target could 403 for ordinary members, render it only for a known allowed case (for example `resolved.troupe.membership.baselineRole === 'TROUPE_ADMIN'`) or render it disabled/hidden with accessible copy.
- Keep `TroupeContextService.selectTroupe()` side effects as they are. Do not clear or overwrite `lastVisitedSeason` from this story.
- Leave `EventResponseDto` unchanged unless tests prove the frontend cannot get reliable labels from the resolver. If backend DTOs are extended, update `services/api/openapi/events.yaml`, Kotlin DTOs, frontend interface, and API tests together.

### Previous story intelligence

- **Story 12.1** added `GET /v1/me/agenda` for cross-league agenda rows. It exposes troupe and league labels in agenda items, but event detail currently gets context through slug resolution and `GET /v1/seasons/{seasonId}/events/{eventId}`.
- **Story 12.2** added `/agenda` rows with troupe + league badges and navigates to `/saison/:leagueSlug/event/:eventId`; do not change that navigation target in 12.4.
- **Story 12.5** finalized post-login priority and preserves deep links. Event detail already stores intended URL before redirecting to `/connexion`; do not regress this.
- **Story 12.3** is still backlog. Do not add filter controls while implementing the strip.

### Git intelligence

Recent relevant commits:

- `582cf84 fix(web): Address Mon agenda code review findings`
- `0afdb45 feat(agenda): Add user agenda API and Mon agenda screen`
- `842ff9c fix(web): Improve agenda badge contrast in light mode`
- `44ecf95 fix(web): Add user menu with logout to seasons-list and season-header`
- `a139836 docs(plan): Define V2 MVP scope and reorder sprint`

The current working tree also contains in-flight Story 12.5 changes. Treat those files as user/branch work and build on them without reverting.

### Architecture compliance

- **Stack:** Angular 21 standalone components, Angular Material, signals/computed for local page state. [Source: `_bmad-output/planning-artifacts/architecture.md` § Frontend Architecture]
- **Routes:** Current implementation uses `/saison/:slug/event/:eventId`; `/ligue/:slug` is deferred. [Source: `app.routes.ts`; Story 12.6]
- **State:** `TroupeContextService` remains the current troupe context service for league-scoped screens; user agenda remains user-scoped. [Source: architecture.md § Member navigation]
- **Security:** Member/admin data must not be exposed across troupes; no broken route or unauthorized admin shortcut for ordinary members. [Source: NFR-S2]
- **Accessibility:** Context navigation must be keyboard reachable and announced clearly. [Source: NFR-A1]

### Documentation conflict note

`SPEC.md` still contains older administration wording that mentions “at most one season active” and V1/Firebase framing. For this story, follow `DOMAIN.md`, ADR 0011, `epics.md`, and the approved league journey UX. Do not attempt to fix the normative-doc drift in this story unless explicitly asked.

### Testing standards

- Use Vitest/Angular TestBed patterns already present in `event-detail.spec.ts`.
- Mock route params, `AuthApiService`, `TroupeApiService`, `SeasonApiService`, `EventApiService`, and `OrganizerApiService`; do not hit the backend.
- Recommended commands before handoff:

```bash
npm run test -w @hatcast/web -- --watch=false
npm run build -w @hatcast/web
```

### Project Structure Notes

Expected modified files:

- `apps/web/src/app/pages/event-detail/event-detail.ts`
- `apps/web/src/app/pages/event-detail/event-detail.html`
- `apps/web/src/app/pages/event-detail/event-detail.scss`
- `apps/web/src/app/pages/event-detail/event-detail.spec.ts`

Optional new files if extracting a component:

- `apps/web/src/app/pages/event-detail/event-context-strip.ts`
- `apps/web/src/app/pages/event-detail/event-context-strip.html`
- `apps/web/src/app/pages/event-detail/event-context-strip.scss`

No expected `legacy/` changes. No backend changes expected unless context cannot be sourced reliably from existing resolver data.

### References

- [Source: `_bmad-output/planning-artifacts/epics.md` — Epic 12, Story 12.4]
- [Source: `_bmad-output/planning-artifacts/prd.md` — FR51]
- [Source: `_bmad-output/planning-artifacts/ux-design-journey-league-agenda.md` — UX-DR15, Screen 6]
- [Source: `_bmad-output/planning-artifacts/plan-v2-league-journey.md` — Wave 1]
- [Source: `_bmad-output/planning-artifacts/architecture.md` — Member navigation and frontend architecture]
- [Source: `docs/adr/0011-league-model-and-user-agenda.md`]
- [Source: `DOMAIN.md` — League, user agenda, cross-troupe events]
- [Source: `_bmad-output/implementation-artifacts/12-1-api-agenda-utilisateur.md`]
- [Source: `_bmad-output/implementation-artifacts/12-2-ecran-mon-agenda.md`]
- [Source: `_bmad-output/implementation-artifacts/12-5-routage-post-connexion-agenda.md`]
- [Source: `apps/web/src/app/pages/event-detail/event-detail.ts`]
- [Source: `apps/web/src/app/app.routes.ts`]

## Dev Agent Record

### Agent Model Used

Composer (Cursor)

### Debug Log References

- Reused `TroupeSeasonResolverService` data in `loadEvent()` — no extra API call.
- Gated **Voir la troupe** on `baselineRole === 'TROUPE_ADMIN'` to avoid broken admin links for ordinary members.
- `resetResolvedContext()` clears strip state on load start, resolver failure, and event-not-found.

### Completion Notes List

- Added `EventContextStrip` presentational component with `nav[aria-label="Contexte du spectacle"]`, troupe/league label, and Material stroked-button links.
- Extended `EventDetail` with context signals, `showContextStrip` computed, and reset logic wired into existing `loadEvent()` flow.
- Inserted strip between header and tabs; hidden during loading and all error paths.
- Added 7 unit tests in `event-detail.spec.ts` covering labels, league/troupe links, admin gating, cross-troupe isolation, loading, and resolver failure.
- All 251 web tests pass; production build succeeds.

### File List

- `apps/web/src/app/pages/event-detail/event-detail.ts` (modified)
- `apps/web/src/app/pages/event-detail/event-detail.html` (modified)
- `apps/web/src/app/pages/event-detail/event-detail.spec.ts` (modified)
- `apps/web/src/app/pages/event-detail/event-context-strip.ts` (new)
- `apps/web/src/app/pages/event-detail/event-context-strip.html` (new)
- `apps/web/src/app/pages/event-detail/event-context-strip.scss` (new)

## Change Log

- 2026-05-24: Story 12.4 created — event context strip with league/troupe orientation and safe navigation guardrails.
- 2026-05-24: Implemented event context strip on event detail — resolver-backed labels, league/troupe navigation, admin gating, and unit tests.
- 2026-05-24: Code review — added event-not-found test, light-dark focus outline; story marked done.

### Review Findings

- [x] [Review][Patch] Missing unit test for event-not-found path — AC7/AC9 require the strip to stay hidden when `getEvent` fails; only resolver failure is covered today. [`event-detail.spec.ts`]
- [x] [Review][Patch] Focus outline lacks `light-dark()` for light theme — `:focus-visible` uses fixed white rgba; `season-agenda.scss` already uses `light-dark()` for comparable controls (AC8 contrast). [`event-context-strip.scss:32-35`]
