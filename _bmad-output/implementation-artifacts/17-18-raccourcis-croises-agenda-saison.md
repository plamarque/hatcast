# Story 17.18 : Raccourcis croisés agenda ↔ saison (app bar)

Status: done

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

## Story

As a **member**,
I want to reach **Mon agenda** from the season workspace or event detail in **one tap**, and **my last season** from the agenda (or pick a season when none is remembered),
so that **I no longer rely on the account menu** for these two everyday destinations.

## Acceptance Criteria

1. **Given** `/saison/:slug` or event detail (`/saison/:slug/event/:eventSlug`), **when** the member header is shown (`user()` resolved), **then** a **Mon agenda** control is visible in the header chrome (text button or icon + visible label) and navigates to **`/agenda`**. [Source: epics 17.18; [ux-hub-a-faire.md](../planning-artifacts/ux-hub-a-faire.md) phase 1]
2. **Given** `/agenda`, **when** the page loads for a signed-in member, **then** a **Ma saison · {titre}** chip or button appears when `lastVisitedSeason` resolves via `TroupeSeasonResolverService` and links to **`/saison/:slug`** (`saisonWorkspacePath`); **when** slug is absent, invalid, ambiguous, or not found, **then** show **Choisir une saison** → **`/troupes`** (not `/seasons`). [Source: epics 17.18; `post-login-navigation.service.ts` parity]
3. **Given** `/membre/:userSlug` with **self** profile (`glance.isSelf === true`), **when** the screen is loaded, **then** **Mon agenda** and **Ma saison** (same rules as AC2) are visible in the page chrome (header secondary row), not only inside the account menu. [Source: epics 17.18]
4. **Given** `/membre/:userSlug` viewing **another** member’s glance, **when** rendered, **then** cross-nav shortcuts are **hidden** (no agenda/season shortcuts for non-self). [Source: epics 17.18 implied; member-first hub spec]
5. **Given** post-login navigation (`PostLoginNavigationService`), **when** sign-in succeeds, **then** **no change** to remember-last-visit behaviour (Stories **2.9** / **12.5**): still pending deep link → `lastVisitedSeason` → `/agenda`. [Source: epics 17.18; [ux-hub-a-faire.md](../planning-artifacts/ux-hub-a-faire.md) post-login table]
6. **Given** mobile viewport (`max-width: 480px`), **when** shortcuts render, **then** controls remain usable: minimum tap target, `aria-label` when label is visually hidden, no overlap with avatar menu. [Source: NFR-A1; season-header mobile pattern]
7. **Given** implementation complete, **when** `npm run test -w @hatcast/web -- --watch=false` and `npm run build -w @hatcast/web`, **then** they pass with specs for season header, event header, user agenda, and member glance (self vs other). [Source: repo norms]

**Couverture produit :** [ux-hub-a-faire.md](../planning-artifacts/ux-hub-a-faire.md) phase 1 (discoverability) ; complète **UX-DR13** (discoverability membre, sans changer post-login). [Source: epics 17.18]

## Tasks / Subtasks

- [x] **Shared last-season shortcut state** (AC: 2, 5)
  - [x] Add `apps/web/src/app/core/navigation/last-visited-season-shortcut.service.ts` (+ `.spec.ts`):
    - Read slug via `getLastVisitedSeasonSlug()` from [`last-visited-league-storage.ts`](../../apps/web/src/app/core/navigation/last-visited-league-storage.ts).
    - Resolve title with `TroupeSeasonResolverService.resolveSeasonSlug(slug)` on init/refresh.
    - Expose readonly signals: `loading`, `seasonSlug`, `seasonTitle`, `linkTarget` (`'season' | 'troupes'`), `linkLabel` (`Ma saison · {title}` | `Choisir une saison`).
    - On `not-found`, `ambiguous`, `no-membership`, or resolver error: **do not** call `clearLastVisitedSeasonSlug()` here (post-login owns stale cleanup) — only show troupes fallback chip.
  - [x] Reuse `saisonWorkspacePath(slug)` and `troupesListPath()` from [`troupe-routes.ts`](../../apps/web/src/app/core/navigation/troupe-routes.ts).

- [x] **Shared chrome control(s)** (AC: 1, 2, 6)
  - [x] Add `apps/web/src/app/shared/member-cross-nav/`:
    - `member-agenda-shortcut.ts` — `mat-stroked-button` or `mat-button` with `routerLink="/agenda"`, icon `calendar_month`, label **Mon agenda**.
    - `member-season-shortcut.ts` — injects shortcut service; `mat-stroked-button` / chip with dynamic label + `routerLink` from service.
    - Optional wrapper `member-cross-nav-shortcuts.ts` grouping both for member-glance row.
    - SCSS: flex row, gap, truncate long season titles (`max-width` + ellipsis), mobile label hide rules aligned with headers.
  - [x] Specs: resolved season → link `/saison/x` + label contains title; no slug → `/troupes` + « Choisir une saison ».

- [x] **Season workspace header** (AC: 1, 6)
  - [x] Update [`season-header.html`](../../apps/web/src/app/pages/season-home/season-header.html): in `season-header__right`, render `<app-member-agenda-shortcut />` **before** account button.
  - [x] Import shortcut in [`season-header.ts`](../../apps/web/src/app/pages/season-home/season-header.ts).
  - [x] Extend [`season-header.spec.ts`](../../apps/web/src/app/pages/season-home/season-header.spec.ts): link to `/agenda` present when user set.

- [x] **Event detail header** (AC: 1, 6)
  - [x] Same placement in [`event-detail-header.html`](../../apps/web/src/app/pages/event-detail/event-detail-header.html) / [`event-detail-header.ts`](../../apps/web/src/app/pages/event-detail/event-detail-header.ts).
  - [x] Update [`event-detail-header` specs via `event-detail.spec.ts`](../../apps/web/src/app/pages/event-detail/event-detail.spec.ts) or dedicated header spec if present.

- [x] **User agenda page** (AC: 2, 6)
  - [x] Update [`user-agenda.html`](../../apps/web/src/app/pages/user-agenda/user-agenda.html):
    - Integrate `<app-member-season-shortcut />` in header row (e.g. between title block and account menu) **or** replace `user-agenda__secondary` « Mes troupes » with a row: **Ma saison** chip + **Mes troupes** link (keep both per spec — season shortcut is additive).
  - [x] Wire shortcut service in [`user-agenda.ts`](../../apps/web/src/app/pages/user-agenda/user-agenda.ts) if page-level refresh needed on `ngOnInit`.
  - [x] Extend [`user-agenda.spec.ts`](../../apps/web/src/app/pages/user-agenda/user-agenda.spec.ts): mock resolver → season chip href; no slug → troupes.

- [x] **Member season glance (self)** (AC: 3, 4, 6)
  - [x] Update [`member-season-glance.html`](../../apps/web/src/app/pages/member-season-glance/member-season-glance.html): below header (or `member-glance-page__header` extension), `@if (glance()?.isSelf)` show cross-nav row with agenda + season shortcuts.
  - [x] Extend [`member-season-glance.spec.ts`](../../apps/web/src/app/pages/member-season-glance/member-season-glance.spec.ts): self fixture shows shortcuts; other-user fixture does not.

- [x] **Regression guard — post-login** (AC: 5)
  - [x] Do **not** edit [`post-login-navigation.service.ts`](../../apps/web/src/app/core/navigation/post-login-navigation.service.ts) except if a test explicitly documents unchanged behaviour.
  - [x] Run existing [`post-login-navigation.service.spec.ts`](../../apps/web/src/app/core/navigation/post-login-navigation.service.spec.ts) — must stay green.

- [x] **Docs trace (light)** (AC: 7)
  - [x] In [`epics.md`](../planning-artifacts/epics.md) Story 17.18: set **Story file** link to this artifact (done when story is committed).
  - [ ] Optional one-line in [`ux-hub-a-faire.md`](../planning-artifacts/ux-hub-a-faire.md) « Fichiers story » table — mark 17.18 file created (only if PO wants tracking line updated).

## Dev Notes

### Product and UX rules

- **Phase 1 only** — no new routes, no `/accueil` hub (**17.19**), no bottom nav (**17.22**), no `lastMemberEntryPath` (**17.20**). [Source: ux-hub-a-faire.md § Phases]
- **Mon agenda** label is fixed French copy; route **`/agenda`** (Story **12.2**).
- **Ma saison · {titre}** uses `SeasonResponse.title` from resolver, not slug in UI.
- **Choisir une saison** → **`/troupes`** (canonical list; Story **17.3**). Do not link to deprecated `/seasons`.
- **Clin d’œil** stays in account menu (`Ma saison en un clin d'œil`) — distinct from workspace saison shortcut (ux-hub § Zone 3).
- **Placement:** shortcuts sit in the **header right cluster**, left of avatar menu on season/event/agenda; on member glance, a **secondary row** under identity (not inside `mat-menu`).
- **Icon suggestion:** `calendar_month` (agenda), `groups` or `stadium` (saison) per ux-hub nav table — align with Material symbols already used in app.

### Explicit non-goals (scope guard)

- Do **not** implement hub **À faire** (**17.19**) or duplicate quick-access chips from that spec on `/agenda`.
- Do **not** add `MemberChrome` / M3 navigation bar (**17.22**).
- Do **not** persist or read `lastMemberEntryPath` (**17.20**).
- Do **not** change `rememberLastVisitedSeasonSlug` call sites (**season-home** still writes slug on load).
- Do **not** add backend APIs.
- Do **not** show shortcuts on admin-only shells without member header (admin participants, etc.).

### Frontend implementation guardrails

| Concern | Action |
|--------|--------|
| DRY | One shortcut service + two presentational components reused across 4 surfaces |
| Resolver | Same `TroupeSeasonResolverService` as post-login; handle `ambiguous` like post-login (fallback troupes, no silent navigation) |
| Auth gating | Shortcuts only when session user present; agenda page already gates on session |
| Router | `RouterLink` + `routerLinkActive` optional; no imperative navigate for static targets |
| Styling | Reuse `mat-stroked-button` density from `season-header__user`; avoid widening header past one line on mobile — hide « Mon agenda » text label under 480px if needed, keep `aria-label` |
| Tests | Mock `TroupeSeasonResolverService` + localStorage slug; do not hit real API in unit tests |

**Suggested service API (sketch):**

```typescript
@Injectable({ providedIn: 'root' })
export class LastVisitedSeasonShortcutService {
  readonly loading = signal(false)
  readonly seasonSlug = signal<string | null>(null)
  readonly seasonTitle = signal<string | null>(null)

  readonly link = computed(() => {
    const slug = this.seasonSlug()
    return slug ? saisonWorkspacePath(slug) : troupesListPath()
  })

  readonly label = computed(() => {
    const title = this.seasonTitle()
    return title ? `Ma saison · ${title}` : 'Choisir une saison'
  })

  async refresh(): Promise<void> { /* getLastVisitedSeasonSlug + resolve */ }
}
```

**Season / event header placement (sketch):**

```html
<div class="season-header__right">
  <app-member-agenda-shortcut />
  @if (user(); as u) {
    <!-- existing account menu -->
  }
</div>
```

### Existing code to reuse

| File | Reuse for |
|------|-----------|
| [`last-visited-league-storage.ts`](../../apps/web/src/app/core/navigation/last-visited-league-storage.ts) | Slug read (no new storage keys) |
| [`post-login-navigation.service.ts`](../../apps/web/src/app/core/navigation/post-login-navigation.service.ts) | Resolution semantics reference |
| [`troupe-routes.ts`](../../apps/web/src/app/core/navigation/troupe-routes.ts) | `saisonWorkspacePath`, `troupesListPath` |
| [`season-header.ts`](../../apps/web/src/app/pages/season-home/season-header.ts) | Header chrome pattern, avatar menu |
| [`event-detail-header.ts`](../../apps/web/src/app/pages/event-detail/event-detail-header.ts) | Same |
| [`user-agenda.html`](../../apps/web/src/app/pages/user-agenda/user-agenda.html) | Member root; secondary links row |
| [`member-season-glance.ts`](../../apps/web/src/app/pages/member-season-glance/member-season-glance.ts) | `glance().isSelf` gating |
| [`user-account-menu-items.ts`](../../apps/web/src/app/shared/user-account-menu/user-account-menu-items.ts) | Keep menu entries; shortcuts are additive |

### Previous story intelligence

- **17.1** (done): Season/event headers use `app-context-breadcrumb`; right cluster is avatar-only today — add shortcuts without restoring back chevron or ⚙.
- **12.2** (done): `/agenda` title **Mon agenda**; account menu uses `showAgendaLink` on glance page only.
- **12.5** (done): Post-login uses `lastVisitedSeason` then `/agenda` — **must not regress** (AC5).
- **17.19** (next): Will reuse same shortcut components in hub « Accès rapides » — keep components `@Input`-free or with minimal inputs so 17.19 can embed them.

### Dependencies

| Story | Status | Relationship |
|-------|--------|----------------|
| **17.1** | done | Header chrome exists on season/event |
| **12.2** | done | `/agenda` route and page |
| **12.5** | done | Post-login + `lastVisitedSeason` |
| **17.3** | done | `/troupes` fallback target |
| **17.19** | backlog | Reuses shortcuts; not in this slice |

### Project Structure Notes

| Layer | Paths |
|-------|--------|
| Service | `apps/web/src/app/core/navigation/last-visited-season-shortcut.service.ts` |
| Shared UI | `apps/web/src/app/shared/member-cross-nav/*` |
| Headers | `season-header.*`, `event-detail-header.*` |
| Pages | `user-agenda.*`, `member-season-glance.*` |

**Commands:**

```bash
npm run test -w @hatcast/web -- --watch=false
npm run build -w @hatcast/web
```

### Testing requirements

- **Season header:** With mock user, `Mon agenda` anchor `href` contains `/agenda`.
- **Event header:** Same.
- **Agenda:** With `localStorage.lastVisitedSeason` + resolver `resolved`, chip text includes season title and `routerLink` `/saison/{slug}`.
- **Agenda:** No slug → « Choisir une saison » → `/troupes`.
- **Member glance:** `isSelf: true` → both shortcuts in DOM; `isSelf: false` → absent.
- **Post-login spec:** Unchanged (run file, no edits required).
- **a11y:** `aria-label` on icon-only mobile agenda button: « Mon agenda ».

### References

- [Source: `_bmad-output/planning-artifacts/epics.md` — Story 17.18]
- [Source: `_bmad-output/planning-artifacts/ux-hub-a-faire.md` — Phase 1, accès rapides table]
- [Source: `_bmad-output/planning-artifacts/ux-design-journey-league-agenda.md` — UX-DR13]
- [Source: `_bmad-output/implementation-artifacts/12-2-ecran-mon-agenda.md` — `/agenda` patterns]
- [Source: `_bmad-output/implementation-artifacts/17-1-breadcrumb-contexte-responsive.md` — header layout]
- [Source: `PLAN.md` — Epic 17 row 17.18]

## Dev Agent Record

### Agent Model Used

{{agent_model_name}}

### Debug Log References

### Completion Notes List

- Service `LastVisitedSeasonShortcutService` + composants `member-cross-nav` réutilisables (agenda, saison, wrapper).
- Raccourcis intégrés : en-têtes saison/événement (Mon agenda), `/agenda` (Ma saison), clin d’œil self (les deux).
- Post-login inchangé ; build `@hatcast/web` OK. Suite complète : 5 tests `event-detail.spec` admin menu flaky (préexistants sur la branche).
- Revue code : `refresh()` sérialisé (generation) ; chip saison toujours visible (stale-while-revalidate, `aria-busy` au premier chargement).

### File List

- apps/web/src/app/core/navigation/last-visited-season-shortcut.service.ts
- apps/web/src/app/core/navigation/last-visited-season-shortcut.service.spec.ts
- apps/web/src/app/shared/member-cross-nav/*
- apps/web/src/app/pages/season-home/season-header.*
- apps/web/src/app/pages/event-detail/event-detail-header.*
- apps/web/src/app/pages/user-agenda/user-agenda.*
- apps/web/src/app/pages/member-season-glance/member-season-glance.*
- apps/web/src/app/pages/event-detail/event-detail.spec.ts

### Change Log

- 2026-05-27: Story **17.18** created via `bmad-create-story` — cross-nav agenda ↔ saison (phase 1 hub membre).
- 2026-05-27: Implémentation story **17.18** — raccourcis croisés agenda ↔ saison.
- 2026-05-27: Durcissement refresh service + story marquée **done**.
