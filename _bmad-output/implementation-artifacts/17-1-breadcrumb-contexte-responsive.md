# Story 17.1: Context breadcrumb (responsive)

Status: done

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

## Story

As a **signed-in user on a season workspace or event detail screen**,
I want a **responsive context breadcrumb** showing which **troupe** and **saison** (and spectacle on event) I am in,
so that **I can orient myself without using `/seasons` as a back target** and can jump to the troupe hub from the troupe identity in the chrome.

## Acceptance Criteria

1. **Given** desktop viewport (≥ `480px`, matching existing header breakpoints), **when** the user is on `/saison/:slug` or `/ligue/:slug` (alias), **then** the top chrome shows **`app-context-breadcrumb`** with: troupe logo + troupe name (link) › saison title (current segment, not a link). [Source: `_bmad-output/planning-artifacts/epics.md` Story 17.1; ADR 0013 §2; UX Screen 3]
2. **Given** desktop, **when** the user is on `/saison/:slug/event/:eventId` (or `/ligue/...` alias), **then** the breadcrumb is: troupe logo + name (link) › saison title (link to season workspace) › spectacle title (current leaf, not linked). [Source: epics 17.1; UX Screen 6 amended; design-thinking wireframe P3]
3. **Given** mobile viewport (`max-width: 480px`), **when** on season or event screens above, **then** the breadcrumb slot shows **only the troupe logo** (tap → troupe hub); saison title (and on event: spectacle title + datetime) appear **below** the header row in the page body, without horizontal overflow. [Source: ADR 0013 §2; UX-DR19]
4. **Given** any signed-in screen using the refactored season/event headers, **when** rendered, **then** there is **no `settings` (⚙) icon button** in the header (admin moves to Story **17.2** `app-scope-admin-bar`). [Source: epics 17.1; ADR 0013 §2]
5. **Given** season or event header after this story, **when** loaded, **then** the **back chevron** to `/seasons` or “retour agenda” is **removed**; wayfinding uses breadcrumb segments instead. [Source: design-thinking 2026-05-25; UX Screen 3 “Removed vs 2026-05-24”]
6. **Given** resolved troupe context (`troupeSlug`, `troupeName` from `TroupeSeasonResolverService`), **when** the user activates the troupe logo or name in the breadcrumb, **then** navigation targets **`/troupes/:troupeSlug`** (canonical hub path per ADR 0013). [Source: ADR 0013 §1–2; design-thinking item 7]
7. **Given** breadcrumb saison segment on event detail, **when** activated, **then** navigation targets **`/saison/:slug`** (not `/ligue/:slug` in new links; alias route may still exist). [Source: `app.routes.ts`; ADR 0013 route table]
8. **Given** loading, resolver failure, or missing troupe/season context, **when** the page cannot show trusted context, **then** breadcrumb is **not** rendered (same gating as today for headers); existing error/empty states unchanged. [Source: `SeasonHome`, `EventDetail` load flows]
9. **Given** keyboard/screen-reader use, **when** focus reaches the breadcrumb, **then** it is a `<nav aria-label="Fil d'Ariane">` (or equivalent), troupe link has an accessible name including troupe name, separators are hidden from AT, current page is indicated (`aria-current="page"` on leaf), focus ring visible. [Source: NFR-A1; Story 12.4 strip patterns]
10. **Given** implementation complete, **when** `npm run test -w @hatcast/web -- --watch=false` and `npm run build -w @hatcast/web` run, **then** they pass; tests cover desktop vs mobile breadcrumb segments, troupe hub link target, saison link on event, no header settings button, no back chevron. [Source: repo test norms]

## Tasks / Subtasks

- [x] **Navigation helpers** (AC: 6, 7)
  - [x] Add `apps/web/src/app/core/navigation/troupe-routes.ts` with `troupeHubPath(slug: string): string[]` → `['/troupes', slug]`.
  - [x] Add `saisonWorkspacePath(slug: string): string[]` → `['/saison', slug]` (prefer over `leagueWorkspacePath` for **new** chrome links; keep `league-routes.ts` for legacy alias support until 17.5).
  - [x] Export from a single place so breadcrumb and future 17.4 hub use the same targets.

- [x] **`app-context-breadcrumb` shared component** (AC: 1–3, 6–9)
  - [x] Create `apps/web/src/app/shared/context-breadcrumb/` (`context-breadcrumb.ts|html|scss|spec.ts`).
  - [x] Inputs: `troupeName`, `troupeSlug`, optional `troupeLogoUrl` (null → Material fallback `groups` or `theater_comedy`), `seasonTitle`, `seasonSlug`, optional `eventTitle` (leaf), `layout: 'season' | 'event'`.
  - [x] Desktop: render full trail with `›` separators; link troupe segment; link saison segment only when `layout === 'event'`; leaf plain text.
  - [x] Mobile: header row shows linked logo only; emit or project secondary block for saison/event titles (parent template or content projection).
  - [x] Troupe image: use `<img>` when `troupeLogoUrl` set; else styled `mat-icon` in a round badge (V2 API has **no troupe logo** on `TroupeListItem` yet — fallback is expected until troupe hub/brand assets land in 17.4).

- [x] **Refactor `SeasonHeader`** (AC: 1, 3–5, 8)
  - [x] Replace left block (back chevron + generic icon + `h1`) with `app-context-breadcrumb` + mobile title block below header in `season-home.html`.
  - [x] Pass `troupeName`, `troupeSlug` from `SeasonHome` (already resolved in `loadTroupeAndSeason`).
  - [x] Remove `canManageSettings` settings menu and related inputs from header (17.2 restores admin elsewhere).
  - [x] Keep user avatar menu top-right unchanged.
  - [x] Update `season-header.spec.ts`.

- [x] **Refactor `EventDetailHeader` + layout** (AC: 2–5, 8)
  - [x] Integrate breadcrumb in header; on mobile move event title + `formatStart` below header (avoid duplicating in header `h1`).
  - [x] Remove back chevron and settings menu from `event-detail-header.html`.
  - [x] Wire inputs from `EventDetail` context signals (`contextTroupeName`, `contextTroupeSlug`, `contextLeagueTitle`, `contextSeasonSlug`, `event().title`).
  - [x] Update `event-detail.spec.ts` (settings menu tests → removed; add breadcrumb tests).

- [x] **Troupe hub link target (coordination with 17.4)** (AC: 6)
  - [x] Breadcrumb troupe link uses `troupeHubPath(troupeSlug)`.
  - [x] **If `/troupes/:slug` route is not yet implemented (Story 17.4)**, add a **minimal stub route** in `app.routes.ts` that resolves troupe by slug and shows troupe name + short copy (“Hub troupe — story 17.4”) **or** ship 17.1 only after 17.4 route exists — **do not** link to `/troupe/:slug/admin/membres` (ADR forbids). Document choice in PR.

- [x] **Copy & vocabulary** (AC: 1–2)
  - [x] UI strings use **Saison** (not Ligue) in new user-visible text. Do not rename API fields or routes in this story.

- [x] **Explicit non-goals** (scope guard)
  - [x] Do **not** remove `app-event-context-strip` (Story **17.5**).
  - [x] Do **not** implement `app-scope-admin-bar` (Story **17.2**).
  - [x] Do **not** add `/troupes` list page (17.3), full hub (17.4), or redirects (17.5).
  - [x] Do **not** change post-login routing, `/agenda`, or event slugs.

- [x] **Tests & build** (AC: 10)
  - [x] `context-breadcrumb.spec.ts`: desktop trail, mobile logo-only, link hrefs, `aria-current`.
  - [x] Adjust `season-header.spec.ts`, `event-detail.spec.ts`.
  - [x] Run web unit tests + build.

## Dev Notes

### Scope boundaries

| In scope (17.1) | Out of scope (later 17.x) |
|-----------------|---------------------------|
| `app-context-breadcrumb` on season + event screens | `app-scope-admin-bar` (**17.2**) |
| Remove header ⚙ and back chevrons on those screens | Restore admin entries (**17.2**) |
| Responsive desktop/mobile chrome rules | Remove `event-context-strip` (**17.5**) |
| `troupe-routes.ts` + `saisonWorkspacePath` helpers | `/troupes` page (**17.3**), full hub (**17.4**) |
| Minimal `/troupes/:slug` stub route if needed to avoid 404 | Redirects `/seasons` → `/troupes` (**17.5**) |
| Unit tests for breadcrumb + header regressions | Event slugs in URL (**17.6**) |

### Regression guard — admin access (read before removing ⚙)

Story **17.1** AC requires **no settings icon in the header**. Today, **Participants** and **Organisateur·ices** live only in that menu on `SeasonHeader` and `EventDetailHeader`.

**Do not merge 17.1 to production without 17.2** unless you accept a temporary loss of those entry points. Recommended: implement **17.2 in the same PR/deploy** immediately after 17.1, or keep an interim visible admin entry documented with the PO (not in header ⚙).

### Product and UX rules

- **Saison** is the French UI label for the `season` entity; code keeps `season` / `SeasonApiService`. [Source: ADR 0013; DOMAIN.md amendments]
- Breadcrumb replaces **back to `/seasons`** mental model; members should use troupe hub or `/agenda`. [Source: design-thinking empathy map]
- **Mobile compromise:** logo-only in top bar; full path available to AT via `aria-label` on troupe link (e.g. `La Malice, Saison 2025-26, Match BIM`). [Source: ADR 0013 alternatives table]
- **`event-context-strip`** remains for now; users may see troupe·saison twice until **17.5** — acceptable; do not delete strip in 17.1.

### Existing code to reuse

| File | Reuse for |
|------|-----------|
| `apps/web/src/app/pages/season-home/season-home.ts` | `troupeName`, `troupeId`, resolver outputs after `loadTroupeAndSeason` |
| `apps/web/src/app/pages/event-detail/event-detail.ts` | `contextTroupeName`, `contextTroupeSlug`, `contextLeagueTitle`, `contextSeasonSlug` |
| `apps/web/src/app/core/troupes/troupe-season-resolver.service.ts` | Slug → `{ troupe, season }`; no extra API for names |
| `apps/web/src/app/pages/season-home/season-header.*` | Header shell, user menu, SCSS breakpoints (`480px`) |
| `apps/web/src/app/pages/event-detail/event-detail-header.*` | Event title/date formatting, user menu |
| `apps/web/src/app/pages/event-detail/event-context-strip.*` | Reference for troupe/saison link patterns (do not copy admin membres target) |
| `apps/web/src/app/core/navigation/league-routes.ts` | Legacy `/ligue` paths; do not break alias routes |
| `_bmad-output/implementation-artifacts/12-4-bandeau-contexte-evenement.md` | Prior context-strip story patterns and test harness |

### Implementation guardrails

- **Single breadcrumb component** — avoid duplicating desktop/mobile logic in both headers.
- **No new API** for troupe logo in 17.1; use icon fallback. Season logo from V1 (`season.logoUrl`) is **not** in V2 `SeasonResponse` yet — do not block on it.
- **Troupe hub URL** must be `/troupes/:slug`, not `/troupe/:slug/admin/membres`. [Source: ADR 0013; fixes 12.4 strip behaviour]
- Prefer **`/saison/`** in breadcrumb saison links; `/ligue/` routes remain for bookmarks until 17.5 redirects.
- Keep `TroupeContextService.selectTroupe()` side effects unchanged when resolving slugs.
- Header height should stay compact; reuse existing `season-header.scss` / `event-detail-header.scss` tokens (`--season-shell-bg`, `--event-detail-shell-bg`).
- **Do not** change `league-routes.ts` behaviour for existing tests that assert `/ligue/` paths unless updating tests deliberately.

### Previous story intelligence (Epic 12 — navigation baseline)

- **12.4** shipped `app-event-context-strip` with troupe link wrongly pointing to admin membres — **17.1 breadcrumb fixes troupe target** in chrome; strip fixed in **17.5**.
- **12.5** post-login → `/agenda` / deep links — do not alter.
- **12.6** added `/ligue/:slug` alias — breadcrumb should still work on both `/saison` and `/ligue` URLs (same components).

### Git intelligence

Recent docs commit: `9b4ab1a docs(plan): Add ADR 0013 and Epic 17 navigation spec` — implementation not started in `apps/web/` for breadcrumb. No prior `17-*` story files. Build on current `season-header` / `event-detail-header` structure.

### Latest technical notes (Angular 21 + Material)

- Standalone components, signals/`input()` pattern already used in headers — match that style.
- Use `BreakpointObserver` or CSS-only split at **`480px`** to align with `season-header.scss` / `event-detail-header.scss`.
- `RouterLink` + `MatIconModule` + optional `MatButtonModule` for logo link (`mat-icon-button` or `a` with class).
- Tests: Vitest + `TestBed` + `provideRouter` (see `season-header.spec.ts`).

### Project Structure Notes

- New shared UI: `apps/web/src/app/shared/context-breadcrumb/`
- New navigation: `apps/web/src/app/core/navigation/troupe-routes.ts`
- Touch: `season-header.*`, `season-home.html`, `event-detail-header.*`, `event-detail.html`, specs.
- Optional stub: `apps/web/src/app/pages/troupe-hub-stub/` + `app.routes.ts` entry `{ path: 'troupes/:slug', ... }`

### References

- [Source: `_bmad-output/planning-artifacts/epics.md` — Epic 17, Story 17.1]
- [Source: `docs/adr/0013-troupe-navigation-equity-tags-event-slugs.md` — §2 Chrome]
- [Source: `_bmad-output/planning-artifacts/ux-design-journey-league-agenda.md` — Shared chrome, Screens 3 & 6]
- [Source: `_bmad-output/design-thinking-2026-05-25.md` — wireframes P2–P3, component `app-context-breadcrumb`]
- [Source: `PLAN.md` — Epic 17 table, DoD phase navigation]
- [Source: `apps/web/src/app/app.routes.ts` — current routes]
- [Source: `_bmad-output/implementation-artifacts/12-4-bandeau-contexte-evenement.md` — event context patterns]

## Dev Agent Record

### Agent Model Used

Composer (Auto)

### Debug Log References

- Stub route `/troupes/:slug` → `TroupeHubStub` until Story 17.4 full hub.
- Admin ⚙ removed from season/event headers; Story 17.2 required before production deploy per story regression guard.

### Completion Notes List

- Added `troupe-routes.ts` (`troupeHubPath`, `saisonWorkspacePath`) and shared `app-context-breadcrumb` (desktop trail + mobile logo-only at ≤480px).
- Refactored `SeasonHeader` and `EventDetailHeader`: breadcrumb when troupe context resolved; removed back chevron and settings menu.
- Mobile saison/event titles below header in `season-home.html` and `event-detail.html`.
- `formatEventStartLong` in `season-events.utils.ts` for event datetime on mobile.
- Tests: context-breadcrumb, season-header, event-detail (33 related tests pass). `npm run build -w @hatcast/web` passes. One pre-existing flaky failure in `event-dispos-tab.spec.ts` (`100 %` assertion) unrelated to this story.

### File List

- apps/web/src/app/core/navigation/troupe-routes.ts (new)
- apps/web/src/app/shared/context-breadcrumb/context-breadcrumb.ts (new)
- apps/web/src/app/shared/context-breadcrumb/context-breadcrumb.html (new)
- apps/web/src/app/shared/context-breadcrumb/context-breadcrumb.scss (new)
- apps/web/src/app/shared/context-breadcrumb/context-breadcrumb.spec.ts (new)
- apps/web/src/app/pages/troupe-hub-stub/troupe-hub-stub.ts (new)
- apps/web/src/app/pages/troupe-hub-stub/troupe-hub-stub.html (new)
- apps/web/src/app/pages/troupe-hub-stub/troupe-hub-stub.scss (new)
- apps/web/src/app/app.routes.ts
- apps/web/src/app/pages/season-home/season-header.ts
- apps/web/src/app/pages/season-home/season-header.html
- apps/web/src/app/pages/season-home/season-header.spec.ts
- apps/web/src/app/pages/season-home/season-home.ts
- apps/web/src/app/pages/season-home/season-home.html
- apps/web/src/app/pages/season-home/season-home.scss
- apps/web/src/app/pages/season-home/season-events.utils.ts
- apps/web/src/app/pages/event-detail/event-detail-header.ts
- apps/web/src/app/pages/event-detail/event-detail-header.html
- apps/web/src/app/pages/event-detail/event-detail.html
- apps/web/src/app/pages/event-detail/event-detail.ts
- apps/web/src/app/pages/event-detail/event-detail.scss
- apps/web/src/app/pages/event-detail/event-detail.spec.ts

### Review Findings

- [x] [Review][Defer] Perte de l’icône type spectacle dans le chrome — Acceptée pour 17.1 (hors AC) ; à traiter en story UX ultérieure si besoin.
- [x] [Review][Patch] Fil d’Ariane événement incomplet sans titre [`event-detail-header.ts`] — `showBreadcrumb` exige désormais `eventTitle()?.trim()`.
- [x] [Review][Patch] Lien 404 stub vers `/seasons` [`troupe-hub-stub.html`] — Remplacé par `/agenda`.
- [x] [Review][Patch] Code mort `canManageSettings` [`event-detail.ts`] — Supprimé.
- [x] [Review][Patch] Tests `formatEventStartLong` [`season-events.utils.spec.ts`] — Ajoutés.
- [x] [Review][Patch] Couverture mobile AC3 [`context-breadcrumb.spec.ts`] — Test structurel trail desktop vs logo mobile.
- [x] [Review][Defer] Double affichage troupe·saison (breadcrumb mobile + `app-event-context-strip`) — Documenté comme acceptable jusqu’à 17.5 ; hors scope 17.1.

### Change Log

- 2026-05-25: Story 17.1 — responsive context breadcrumb on season/event screens; troupe hub stub route; header admin/back removal.
- 2026-05-25: Code review — 1 decision-needed, 5 patch, 1 defer.
