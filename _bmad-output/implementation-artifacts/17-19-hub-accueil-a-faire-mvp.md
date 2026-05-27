# Story 17.19 : Hub membre `/accueil` — À faire (MVP)

Status: done

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

## Story

As a **member**,  
I want a **À faire** screen listing my **urgent actions**, my **next show**, and **quick access** links,  
so that **I know what to handle without browsing the full agenda**.

## Acceptance Criteria

1. **Given** a signed-in user, **when** they open **`/accueil`**, **then** they see a real hub screen (no redirect via `PostLoginNavigationService`): title **À faire**, account menu (avatar), sections **Actions requises** (only if ≥1 item), **Prochain spectacle**, **Accès rapides**. [Source: epics 17.19; [ux-hub-a-faire.md](../planning-artifacts/ux-hub-a-faire.md) § Écran `/accueil`]
2. **Given** `GET /v1/me/agenda` (`scope=upcoming`, `page=0`, `size=50`), **when** the hub loads, **then** **Actions requises** lists events with **`myAvailabilityStatus === 'unknown'`** whose `startsAt` falls within the next **30 calendar days** (Europe/Paris boundary, same semantics as agenda API `scope=upcoming`); each row label **« Indiquer ta dispo — *{title}* »** with sub-line date · troupe; tap navigates to event detail with **Dispos** tab active (`tab=dispos` or `showAvailability=true`). [Source: epics 17.19; FR15]
3. **Given** an action row for an event within **7 days** of now (Paris), **when** rendered, **then** a **Bientôt** badge uses semantic tokens (`--mat-sys-error` or warning via `color-mix` on error/surface — no hex). [Source: ux-hub-a-faire.md § Zone 1]
4. **Given** agenda items returned, **when** at least one upcoming event exists, **then** **Prochain spectacle** shows a **single** card for the nearest `startsAt` (all troupes, unfiltered); reuse **`agenda-card`** markup/classes from [`user-agenda.html`](../../apps/web/src/app/pages/user-agenda/user-agenda.html); tap opens event detail (default tab). [Source: epics 17.19]
5. **Given** **Accès rapides**, **when** displayed, **then** distinct destinations: **Mon agenda** → `/agenda` ; **Ma saison · {titre}** or **Choisir une saison** → `LastVisitedSeasonShortcutService` / [`member-season-shortcut`](../../apps/web/src/app/shared/member-cross-nav/member-season-shortcut.ts) ; **Saison en un clin d'œil** → `/membre/{userSlug}` with optional `troupeId`/`leagueId` query when derivable from `lastVisitedSeason` resolution or first participation row ; **Mes troupes** → `/troupes`. [Source: ux-hub-a-faire.md § Zone 3; Story 17.18]
6. **Given** **≥6** availability-unknown actions in the 30-day window, **when** the section renders, **then** show **max 5** rows + link **« Voir tout dans l'agenda »** → `/agenda` (agenda remains full list). [Source: ux-hub-a-faire.md § Zone 1]
7. **Given** `noParticipation === true` from agenda API, **when** the hub displays, **then** full-screen empty: **« Rien en attente pour l'instant »** / **« Tu n'es inscrit·e à aucune ligue. »** + CTA **Découvrir les troupes** → `/troupes#decouvrir`. [Source: ux-hub-a-faire.md empty table]
8. **Given** participation but **0** actions and **0** upcoming events, **when** displayed, **then** empty **« Tout est à jour »** + **« Aucun spectacle à venir… »** with CTAs **Mes troupes** and **Mon agenda**. [Source: ux-hub-a-faire.md]
9. **Given** participation, **0** actions, **≥1** upcoming event, **when** displayed, **then** screen empty copy **« Tout est à jour »** + prochain spectacle card + accès rapides (section Actions masquée). [Source: ux-hub-a-faire.md]
10. **Given** non-auth or network failure on agenda fetch, **when** load fails, **then** retryable error block (same tone as `/agenda`) without redirecting away. [Source: Story 12.2 pattern]
11. **Given** `/agenda`, **when** hub is delivered, **then** **no** duplicate « actions requises » block on agenda — chronological list + filters only. [Source: epics 17.19]
12. **Given** post-login (`PostLoginNavigationService`, `AuthRedirect`, root `/`), **when** sign-in succeeds, **then** behaviour **unchanged** (pending deep link → `lastVisitedSeason` → `/agenda`); **`/accueil` is not the default** destination. [Source: Stories 2.9, 12.5; ux-hub-a-faire.md]
13. **Given** `HomeSignedIn` route handler, **when** an unauthenticated user hits `/accueil`, **then** redirect to `/connexion` with session snackbar pattern (parity `/agenda`). [Source: user-agenda auth flow]
14. **Given** implementation complete, **when** `npm run test -w @hatcast/web -- --watch=false` and `npm run build -w @hatcast/web`, **then** they pass with specs for derivation (30/7-day windows), section visibility, navigation query params, empty states, and post-login non-regression. [Source: repo norms]

**Couverture produit :** [ux-hub-a-faire.md](../planning-artifacts/ux-hub-a-faire.md) phase 2 ; **FR15** (rappel dispo) ; **FR48–FR49** (navigation membre, partiel). **Hors scope MVP :** `composition_confirm_pending` (**17.21**), navigation bar (**17.22**), `lastMemberEntryPath` (**17.20**).

---

## Acceptance Criteria — Material 3 (UI)

**M3-1. Composants Material** — **Given** the hub UI, **when** controls render, **then** use `mat-flat-button` / `mat-stroked-button` for CTAs, `mat-chip` or `mat-stroked-button` for quick-access chips, `mat-list` / `mat-list-item` (or `mat-nav-list`) for action rows, `mat-icon` for section affordances, `mat-menu` + avatar for account menu — no custom clickable divs for the same roles. [Source: FRONTEND_UI.md ; UX-DR11]

**M3-2. Tokens & thème** — **Given** hub SCSS, **when** colors apply, **then** only `var(--mat-sys-*)` and `color-mix(in srgb, var(--mat-sys-…) …)` ; **Bientôt** badge uses error or warning tokens. [Source: FRONTEND_UI.md]

**M3-3. Mobile & tactile** — **Given** viewport **max-width: 480px**, **when** action rows and quick-access chips render, **then** tap targets **≥ 48×48 dp** ; action rows have full French **`aria-label`** (e.g. « Indiquer ta disponibilité pour {title}, {date} ») ; account menu does not overlap shortcuts. [Source: NFR-A1 ; member-cross-nav pattern]

**M3-4. Navigation membre** — **Given** this story, **when** chrome is added, **then** **top app bar M3** only (title + avatar) ; **do not** add bottom navigation bar or M2 bottom app bar (**17.22**). [Source: ux-hub-a-faire.md]

**M3-5. Revue** — **Given** implementation done, **when** validated, **then** checklist § « Checklist M3 HatCast » in [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md) is walked ; waivers noted in Dev Agent Record. [Source: AGENTS.md]

---

## Tasks / Subtasks

- [x] **Route & replace redirect shell** (AC: 1, 12, 13)
  - [ ] Create `apps/web/src/app/pages/member-home-todo/` (`member-home-todo.ts`, `.html`, `.scss`, `.spec.ts`).
  - [ ] Point `{ path: 'accueil', … }` in [`app.routes.ts`](../../apps/web/src/app/app.routes.ts) to `MemberHomeTodo` (remove `HomeSignedIn` from this route).
  - [ ] Keep [`home-signed-in`](../../apps/web/src/app/pages/home-signed-in/home-signed-in.ts) only if still needed elsewhere; otherwise delete or leave unused with comment — **do not** use it for `/accueil` after this story.
  - [ ] Session gate: `AuthApiService.ensureHatcastSession()` → `/connexion` on failure (copy from `UserAgenda`).

- [x] **Pure derivation helpers** (AC: 2, 3, 4, 6)
  - [ ] Add `apps/web/src/app/core/member-home/member-home-todo.model.ts` + `member-home-todo.utils.ts` (+ `.spec.ts`):
    - `deriveAvailabilityActions(items, now, timeZone = 'Europe/Paris')` — filter `unknown`, within 30 days, sort `startsAt` asc.
    - `isSoonAction(startsAt, now, days = 7)` for **Bientôt** badge.
    - `pickNextEvent(items)` — earliest upcoming or null.
    - `enrichAgendaCardFields(item)` — delegate to `formatEventDateParts` from [`season-events.utils.ts`](../../apps/web/src/app/pages/season-home/season-events.utils.ts).
  - [ ] Unit-test edge cases: event on day 30 included, day 31 excluded; tie-breaking; empty input.

- [x] **Agenda load** (AC: 2, 4, 7–10)
  - [ ] Inject [`UserAgendaApiService`](../../apps/web/src/app/core/agenda/user-agenda-api.service.ts) ; call `listAgenda({ page: 0, size: 50, scope: 'upcoming' })` — **no** troupe/league filters on hub (full cross-troupe view).
  - [ ] Wire signals: `loading`, `loadError`, `items`, `noParticipation`, computed `actions`, `nextEvent`, `visibleActions` (slice 5).

- [x] **Template sections** (AC: 1, 5–9, 11)
  - [ ] Header: `<h1>À faire</h1>` + [`UserAccountMenuItemsComponent`](../../apps/web/src/app/shared/user-account-menu/user-account-menu-items.ts) (`showAgendaLink: true`).
  - [ ] **Actions requises:** `@if (actions().length)` — list max 5 ; `mat-list-item` or card rows with date/troupe subline ; **Bientôt** `mat-chip` when soon ; footer link if `actions().length > 5`.
  - [ ] **Prochain spectacle:** single `agenda-card` or shared subcomponent ; empty sub-section when no events but participation exists.
  - [ ] **Accès rapides:** reuse [`MemberAgendaShortcut`](../../apps/web/src/app/shared/member-cross-nav/member-agenda-shortcut.ts), [`MemberSeasonShortcut`](../../apps/web/src/app/shared/member-cross-nav/member-season-shortcut.ts), add **Clin d'œil** chip (`routerLink` `/membre/:slug` + query params), **Mes troupes** `mat-stroked-button` → `/troupes`.
  - [ ] Full-page empties per AC 7–9 (reuse copy from ux-hub table).

- [x] **Navigation** (AC: 2, 4)
  - [ ] Action row → `router.navigate(saisonEventPath(leagueSlug, eventSlug), { queryParams: { tab: 'dispos' } })` (prefer `tab=dispos` over legacy `showAvailability` for new code).
  - [ ] Next event card → `saisonEventPath` without tab override.

- [x] **Styles** (AC: 4, M3-2)
  - [ ] Import or duplicate `.agenda-card` rules from [`user-agenda.scss`](../../apps/web/src/app/pages/user-agenda/user-agenda.scss) — prefer **shared** `apps/web/src/app/shared/agenda/agenda-card.scss` only if duplication exceeds ~40 lines (optional refactor, not blocking).
  - [ ] Page layout: `max-width: 56rem`, section headings, spacing consistent with `user-agenda`.

- [x] **Tests & regression** (AC: 11–14)
  - [ ] `member-home-todo.spec.ts`: loaded hub shows title **À faire** ; 2 unknown events → 2 action rows ; 6 unknown → 5 rows + « Voir tout » ; next event card ; no actions section when 0 unknown ; `noParticipation` empty ; tap action includes `tab: 'dispos'`.
  - [ ] Update [`home-signed-in.spec.ts`](../../apps/web/src/app/pages/home-signed-in/home-signed-in.spec.ts) if component removed from route — tests move to `member-home-todo` or delete redirect delegation tests.
  - [ ] Run [`post-login-navigation.service.spec.ts`](../../apps/web/src/app/core/navigation/post-login-navigation.service.spec.ts) unchanged (AC 12).
  - [ ] Grep `/accueil` usages: [`member-season-glance.ts`](../../apps/web/src/app/pages/member-season-glance/member-season-glance.ts) navigates to `/accueil` — **keep** (now lands on hub).

- [x] **Docs trace** (AC: 14)
  - [ ] Link this file from [`epics.md`](../planning-artifacts/epics.md) Story 17.19.
  - [ ] Update [`ux-hub-a-faire.md`](../planning-artifacts/ux-hub-a-faire.md) « Fichiers story » row for **17.19**.

## Dev Notes

### Product and UX rules

- **Phase 2 MVP** — client-only actions from agenda API ; **no** `GET /me/inbox` (**17.21**).
- **No composition confirmations** in Actions requises until inbox story.
- **Title** is **À faire**, not « Accueil ».
- **No** troupe/league filter bar on hub (unlike `/agenda`).
- **Tri actions :** `startsAt` ascending (confirmations will prepend in 17.21 — document in utils for future merge).
- **Copy tone:** tutoiement, French UI strings from [ux-hub-a-faire.md](../planning-artifacts/ux-hub-a-faire.md).
- **Clin d'œil query params:** mirror [`UserAccountMenuItemsComponent.seasonGlanceQueryParams`](../../apps/web/src/app/shared/user-account-menu/user-account-menu-items.ts) — optional `troupeId`/`leagueId` from last visited season resolution or first item in agenda response when hub loads.

### Explicit non-goals (scope guard)

| Item | Story |
|------|-------|
| `GET /me/inbox` | **17.21** |
| Bottom / rail navigation shell | **17.22** |
| `lastMemberEntryPath` persistence | **17.20** |
| Post-login default → `/accueil` | Never (product decision 2026-05-27) |
| Actions block on `/agenda` | Must not add |
| Backend API changes | None |
| Organizer tasks in hub | Post-MVP per ux-hub |

### Frontend implementation guardrails

| Concern | Action |
|--------|--------|
| DRY | Reuse `UserAgendaApiService`, `member-cross-nav`, `formatEventDateParts`, `saisonEventPath` |
| Time | All window math in `Europe/Paris` via `Intl` or shared `AGENDA_TIME_ZONE` from season-events.utils |
| Auth | Same 401 → login redirect as `UserAgenda` |
| Signals | Angular signals + `computed` for derived lists |
| 30-day window | Compare start-of-day Paris for `now` and event date — document choice in utils spec |
| Pagination | Agenda `size=50` sufficient for MVP (same as `/agenda`); defer load-more |

**Suggested util sketch:**

```typescript
const ACTION_HORIZON_DAYS = 30
const SOON_DAYS = 7

export function deriveAvailabilityActions(
  items: UserAgendaItem[],
  now: Date,
  timeZone = 'Europe/Paris',
): UserAgendaItem[] {
  return items
    .filter((i) => i.myAvailabilityStatus === 'unknown' && withinDays(i.startsAt, now, ACTION_HORIZON_DAYS, timeZone))
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
}
```

### Existing code to reuse

| File | Reuse for |
|------|-----------|
| [`user-agenda.ts`](../../apps/web/src/app/pages/user-agenda/user-agenda.ts) | Session load, error/empty patterns, `openEvent` |
| [`user-agenda-api.service.ts`](../../apps/web/src/app/core/agenda/user-agenda-api.service.ts) | Agenda fetch |
| [`member-cross-nav/*`](../../apps/web/src/app/shared/member-cross-nav/) | Quick access agenda + saison |
| [`last-visited-season-shortcut.service.ts`](../../apps/web/src/app/core/navigation/last-visited-season-shortcut.service.ts) | Season chip (via `MemberSeasonShortcut`) |
| [`event-detail-tabs.ts`](../../apps/web/src/app/core/events/event-detail-tabs.ts) | `tab=dispos` resolution |
| [`troupe-routes.ts`](../../apps/web/src/app/core/navigation/troupe-routes.ts) | `saisonEventPath`, `troupesListPath` |
| [`availability-status.ts`](../../apps/web/src/app/core/availability/availability-status.ts) | `unknown` type guard |

### Previous story intelligence

- **17.18** (done): Cross-nav components ready for **Accès rapides** — embed `MemberAgendaShortcut` + `MemberSeasonShortcut` ; do not rebuild season link logic.
- **12.2** (done): `agenda-card` visual and `UserAgendaApiService`.
- **12.5** (done): Post-login → season or `/agenda` — **must not regress**.

### Dependencies

| Story | Status | Relationship |
|-------|--------|----------------|
| **12.2** | done | `/agenda` + API client |
| **12.5** | done | Post-login behaviour |
| **17.18** | done | Quick-access components (recommended) |
| **17.21** | backlog | Will replace client-only action derivation |
| **17.22** | backlog | Nav bar links to this route |

### Project Structure Notes

| Layer | Paths |
|-------|--------|
| Page | `apps/web/src/app/pages/member-home-todo/*` |
| Core utils | `apps/web/src/app/core/member-home/*` |
| Route | `apps/web/src/app/app.routes.ts` |
| Optional shared SCSS | `apps/web/src/app/shared/agenda/agenda-card.scss` |

**Commands:**

```bash
npm run test -w @hatcast/web -- --watch=false
npm run build -w @hatcast/web
```

### Testing requirements

- Utils: 30-day boundary, 7-day **Bientôt**, sort order, `pickNextEvent` with unsorted input.
- Component: section visibility matrices (actions hidden when empty; full empty when `noParticipation`).
- Navigation: action click → `tab: 'dispos'` in navigate call.
- Regression: post-login service spec green without edits.
- a11y: `aria-label` on icon-only controls if any label hidden on mobile.

### References

- [Source: `_bmad-output/planning-artifacts/epics.md` — Story 17.19]
- [Source: `_bmad-output/planning-artifacts/ux-hub-a-faire.md` — Phase 2, wireframe, empty table]
- [Source: `_bmad-output/implementation-artifacts/17-18-raccourcis-croises-agenda-saison.md`]
- [Source: `_bmad-output/implementation-artifacts/12-2-ecran-mon-agenda.md`]
- [Source: `PLAN.md` — Epic 17 row 17.19]
- [Source: `docs/v2/technical/FRONTEND_UI.md` — M3 checklist]

## Dev Agent Record

### Agent Model Used

{{agent_model_name}}

### Debug Log References

### Completion Notes List

- Hub `/accueil` : composant `MemberHomeTodo` (actions dispo 30 j, badge Bientôt 7 j, prochain spectacle, accès rapides 17.18).
- Post-login inchangé (`HomeSignedIn` conservé hors route `/accueil`).
- **AC5 (revue code)** : query params clin d’œil via `resolveLastVisitedSeasonGlanceIds` + `deriveSeasonGlanceQueryParams(items, lastVisited)` — priorité `lastVisitedSeason` résolu, fallback `items[0]` (pas `pickNextEvent`).
- Tests : `member-home-todo.utils.spec.ts`, `member-home-todo.spec.ts` (Bientôt, retry erreur, empty AC8, auth 401, clin d’œil lastVisited).

### Checklist M3 (revue 17.19 — M3-5)

| Point | Statut | Note |
|-------|--------|------|
| Composants Material (M3-1) | OK | `mat-nav-list`, boutons, chips, menu compte |
| Tokens `--mat-sys-*` (M3-2) | OK | Badge Bientôt, cartes, bannières |
| Mobile ≥ 48dp, `aria-label` (M3-3) | OK | Lignes action + raccourcis |
| Top app bar M3 (M3-4) | **N/A** | Header `<h1>` + avatar, aligné `/agenda` (pas `mat-toolbar` ; rail **17.22**) |
| Pas bottom bar M2 | OK | Hors scope 17.22 |
| SCSS `agenda-card` dupliqué | **Dette optionnelle** | ~100 lignes dans `member-home-todo.scss` ; extraction `shared/agenda/agenda-card.scss` reportée |

### File List

- `apps/web/src/app/pages/member-home-todo/*`
- `apps/web/src/app/core/member-home/member-home-todo.utils.ts` (+ spec)
- `apps/web/src/app/app.routes.ts`

### Change Log

- 2026-05-27 : Story **17.19** created via `/bmad-create-story` — hub `/accueil` À faire MVP (`GET /v1/me/agenda`).
- 2026-05-27 : Implémenté — `MemberHomeTodo` remplace redirect `HomeSignedIn` sur `/accueil`.
- 2026-05-27 : Revue code — AC5 clin d’œil (`lastVisitedSeason` puis `items[0]`) ; tests hub 24/24 verts ; checklist M3 documentée ; statut **done**.

---

### Validation create-story

- [x] AC métier numérotés et sourcés (epics / FR)
- [x] Section **Material 3** remplie (M3-1 … M3-5)
- [x] Tasks référencent les numéros d'AC
- [x] Liens vers fichiers code existants à réutiliser
- [x] `npm run test` / build web mentionnés
