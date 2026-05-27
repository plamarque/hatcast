# Story 17.22 : Shell navigation bar M3 (Accueil · Agenda · Stats)

Status: done

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

## Story

As a **member**,  
I want a **persistent navigation bar** on my main member screens,  
so that **I can switch between Accueil, Agenda, and Stats without hidden menus**.

## Acceptance Criteria

1. **Given** a signed-in member on a **shell route** (`/accueil`, `/agenda`, `/membre/:userSlug` — clin d’œil / stats perso), **when** the viewport is **< 840px**, **then** a **bottom navigation bar** (M3 landmark `role="navigation"`) shows three destinations: **Accueil** (`home`) → `/accueil`, **Agenda** → `/agenda`, **Stats** (`insights`) → `MemberStatsShortcutService.link` (`/membre/{sessionUserSlug}` or `/accueil` fallback). [Source: ux-hub § Phase 4 — 2026-05-27]
2. **Given** the same shell routes, **when** viewport is **≥ 840px**, **then** a **navigation rail** on the **left** exposes the same three destinations (icons + labels); **no** bottom bar on desktop. [Source: ux-hub § Desktop ; FRONTEND_UI.md § Chrome membre]
3. **Given** `GET /v1/me/inbox` returns `actions.length ≥ 1`, **when** the shell nav renders, **then** the **Accueil** tab shows a **badge** with the count (display **« 9+ »** when count > 9); **when** `actions.length === 0`, **then** no badge. Agenda and Stats never badged. [Source: ux-hub § Badges ; Story **17.21**]
4. **Given** workspace saison, **when** the user needs `/saison/:slug`, **then** access is via **Accès rapides** / chips header (**Ma saison · {titre}**), not the global nav bar. [Source: ux-hub — workspace ≠ Stats]
5. **Given** Material styling, **when** nav chrome renders, **then** colors and surfaces use **`var(--mat-sys-*)`** / `color-mix` only — **not** M2 `mat-bottom-nav` / docked toolbar patterns. [Source: epics 17.22 AC4 ; FRONTEND_UI.md anti-patterns]
6. **Given** routes **outside** the member shell, **when** navigated, **then** the nav bar is **hidden**: `/connexion`, password flows, `/compte`, `/troupes`, `/troupes/:slug`, `/saison/:slug` (workspace), all `*/admin/*`, and **`/saison/:slug/event/:eventSlug`** (event detail). **Mon compte** : menu avatar uniquement (pas de 4ᵉ onglet). [Source: ux-hub ; M3 top app bar]
7. **Given** shell pages with bottom nav, **when** content scrolls, **then** main content has **bottom padding** (safe-area aware) so lists and CTAs are not obscured by the bar; rail layout uses horizontal offset instead. [Source: NFR-A1 ; mobile-first]
8. **Given** active destination, **when** on `/accueil`, `/agenda`, or `/membre/{ownSlug}`, **then** the corresponding nav item shows **active** state (`routerLinkActive` or equivalent + `aria-current="page"`). [Source: a11y]
9. **Given** post-login (`PostLoginNavigationService`), **when** sign-in succeeds, **then** behaviour **unchanged** — `/accueil` is **not** forced as default. [Source: ux-hub § Post-login ; Stories **2.9**, **12.5**]
10. **Given** hub **Accès rapides** still present on `/accueil`, **when** nav bar is delivered, **then** quick-access chips remain (no removal); nav bar is **additive** shell chrome. [Source: 17.19 — phase 4 does not delete zone 3]
11. **Given** implementation complete, **when** `npm run test -w @hatcast/web -- --watch=false` and `npm run build -w @hatcast/web`, **then** they pass with specs for: shell visibility per route, badge 0/3/10→« 9+ », active tab, season link fallback, desktop rail vs mobile bar breakpoint. [Source: repo norms]

**Couverture produit :** [ux-hub-a-faire.md](../planning-artifacts/ux-hub-a-faire.md) **phase 4** ; **FR48–FR49** (navigation membre). **Hors scope :** `lastMemberEntryPath` persistence (**17.20** — optional follow-up hook only), header context selector (**17.23**), backend changes, post-login default → `/accueil`, organizer tasks.

---

## Acceptance Criteria — Material 3 (UI)

**M3-1. Composants Material** — **Given** the shell nav, **when** controls render, **then** use **M3 navigation primitives** from Angular Material (`mat-tab-nav-bar` + `mat-tab-link` bottom ; `mat-nav-list` + `mat-list-item` rail). Icons: `home`, `calendar_month`, `insights`. [Source: FRONTEND_UI.md ; ux-hub icon table]

**M3-2. Tokens & thème** — **Given** nav SCSS, **when** colors apply, **then** bar/rail background `var(--mat-sys-surface-container)` (or `surface`), active indicator via `var(--mat-sys-primary)` ; badge uses `var(--mat-sys-error)` on error container — no hex. [Source: ux-hub § Accessibilité badges]

**M3-3. Mobile & tactile** — **Given** ≤480px, **when** nav items render, **then** each target **≥ 48×48 dp** ; French **`aria-label`** per tab (e.g. « Accueil, 3 actions en attente » when badge > 0). [Source: NFR-A1]

**M3-4. Navigation membre** — **Given** this story **is** the global member space switcher, **when** delivered, **then** implement **M3 bottom navigation bar** (not M2 bottom app bar) + **rail ≥840px** per ux-hub ; top app bars on child pages **unchanged** (title + avatar). [Source: ux-hub-a-faire.md ; resolves prior stories’ « no bottom nav until 17.22 »]

**M3-5. Revue** — **Given** implementation done, **when** validated, **then** checklist § « Checklist M3 HatCast » in [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md) is walked ; waivers in Dev Agent Record. [Source: AGENTS.md]

---

## Tasks / Subtasks

- [x] **Shell layout & routing** (AC: 1, 2, 6, 7, 8)
  - [x] Add `apps/web/src/app/layout/member-shell/` (`member-shell.ts`, `.html`, `.scss`, `.spec.ts`):
    - `<router-outlet />` for child routes + `<app-member-nav />` when `showMemberNav()` true.
    - CSS: `.member-shell__content` padding-bottom on mobile when nav visible; `.member-shell--rail` grid with nav column ≥840px.
  - [x] Refactor [`app.routes.ts`](../../apps/web/src/app/app.routes.ts): group `accueil`, `agenda`, `saison/:slug` under `MemberShell` parent ; keep `saison/:slug/event/:eventSlug` and admin routes **siblings** (no shell).
  - [x] `member-shell-nav-visibility.ts` (+ spec): pure `shouldShowMemberNav(url: string): boolean` mirroring AC6.

- [x] **Member nav component** (AC: 1–5, 8)
  - [x] `apps/web/src/app/shared/member-nav/member-nav.ts` (+ html/scss/spec):
    - Inject `LastVisitedSeasonShortcutService` — `refresh()` on init.
    - Three links with `routerLink` / `routerLinkActive`.
    - Single DOM + CSS breakpoint **840px** (rail vs `mat-tab-nav-bar` bottom).
    - Saison label: mobile short **« Saison »** + tooltip full title.
  - [x] Import Material modules per chosen pattern (tab nav bar and/or nav-list).

- [x] **Inbox badge service** (AC: 3)
  - [x] `apps/web/src/app/core/inbox/member-inbox-badge.service.ts` (+ spec):
    - Signal `pendingActionCount` from `MeInboxApiService.getInbox()` → `actions.length`.
    - Refresh on shell init and when navigation ends on `/accueil` (Router events) — **avoid** polling in MVP.
    - Expose `badgeLabel(count)` → `'' | '1'…'9' | '9+'`.
  - [x] Wire badge on À faire tab only (Agenda/Saison never badged per ux-hub).

- [x] **Page layout adjustments** (AC: 7, 10)
  - [x] Verify [`member-home-todo.scss`](../../apps/web/src/app/pages/member-home-todo/member-home-todo.scss), [`user-agenda.scss`](../../apps/web/src/app/pages/user-agenda/user-agenda.scss), [`season-home.scss`](../../apps/web/src/app/pages/season-home/season-home.scss) — no duplicate bottom safe-area (shell owns padding).
  - [x] Do **not** remove Accès rapides / cross-nav headers from 17.18–17.19.

- [x] **Tests & regression** (AC: 9, 11)
  - [x] `member-shell.spec.ts` / `member-nav.spec.ts` + `member-shell-nav-visibility.spec.ts`: visibility matrix, badge, active state.
  - [x] Run [`post-login-navigation.service.spec.ts`](../../apps/web/src/app/core/navigation/post-login-navigation.service.spec.ts) unchanged.
  - [x] N/A optional `MemberHomeTodo` shell test (routes integration covered).

- [x] **Docs trace** (AC: 11)
  - [x] Link this file from [`epics.md`](../planning-artifacts/epics.md) Story 17.22 (already present).
  - [x] Update [`ux-hub-a-faire.md`](../planning-artifacts/ux-hub-a-faire.md) « Fichiers story » row **17.22**.

## Dev Notes

### Product and UX rules

- **Phase 4** — first **global** member space switcher; complements (does not replace) header shortcuts from **17.18**.
- **Accueil** tab = `/accueil` (hub **17.19** + inbox **17.21**) ; icône `home`.
- **Agenda** tab = `/agenda` — no badge (passive list).
- **Stats** tab = clin d’œil `/membre/{userSlug}` via [`MemberStatsShortcutService`](../../apps/web/src/app/core/navigation/member-stats-shortcut.service.ts) ; icône `insights`.
- **Workspace saison** = `/saison/:slug` hors shell ; chips **Ma saison** via [`LastVisitedSeasonShortcutService`](../../apps/web/src/app/core/navigation/last-visited-season-shortcut.service.ts).
- **Breakpoint rail:** **840px** min-width (ux-hub + FRONTEND_UI.md).
- **Event detail** is intentionally **full-screen without shell** — user returns via breadcrumb/back; do not show bottom bar on event routes.
- **Optional 17.20:** if `lastMemberEntryPath` lands in same sprint, update path when user selects a shell tab — **not required** for 17.22 AC.

### Suggested layout (mobile)

```text
┌─────────────────────────┐
│ (page header — existing)│
│ … content …             │
├─────────────────────────┤
│ [Accueil●3] Agenda Stats │  ← fixed bottom, M3 tokens
└─────────────────────────┘
```

### Suggested layout (desktop ≥840px)

```text
┌──┬──────────────────────┐
│▣ │ page header + content│
│▣ │                      │
│▣ │                      │
└──┴──────────────────────┘
 ↑ rail (3 items)
```

### Frontend implementation guardrails

| Concern | Action |
|--------|--------|
| DRY | Reuse `LastVisitedSeasonShortcutService` — do not duplicate season slug logic |
| Badge | Single `MemberInboxBadgeService` — hub page may still load inbox; accept duplicate GET on first paint or share service from hub later (document choice) |
| Router | Parent `MemberShell` + `children` keeps URLs unchanged (`/accueil`, etc.) |
| Active season tab | `routerLinkActive` on `/saison/:slug` with exact slug from service |
| M2 interdit | No `MatLegacy*` bottom nav ; verify against [Material M3 navigation patterns](https://material.angular.dev/) at implementation time |
| 17.23 | Context selector stays in season/event **header** — do not move troupe/saison picker into bottom nav |

### Explicit non-goals

| Item | Story |
|------|-------|
| `lastMemberEntryPath` storage | **17.20** |
| Troupe/saison context menu in breadcrumb | **17.23** |
| Badge on Agenda or Saison tabs | ux-hub — À faire only |
| Nav on `/troupes`, admin, clin d'œil | Out of shell |
| Backend / OpenAPI | None |
| Forcing `/accueil` after login | Never |
| Removing Accès rapides on hub | Keep |

### Existing code to reuse

| File | Reuse for |
|------|-----------|
| [`LastVisitedSeasonShortcutService`](../../apps/web/src/app/core/navigation/last-visited-season-shortcut.service.ts) | Saison tab target + tooltip label |
| [`MeInboxApiService`](../../apps/web/src/app/core/inbox/me-inbox-api.service.ts) | Badge count (`actions.length`) |
| [`member-season-shortcut.ts`](../../apps/web/src/app/shared/member-cross-nav/member-season-shortcut.ts) | Same link semantics as nav Saison tab |
| [`member-agenda-shortcut.ts`](../../apps/web/src/app/shared/member-cross-nav/member-agenda-shortcut.ts) | Parity label **Mon agenda** vs nav **Agenda** (nav uses shorter « Agenda » per ux-hub table) |
| [`member-home-todo/*`](../../apps/web/src/app/pages/member-home-todo/) | Child of shell — minimal TS change |
| [`user-agenda/*`](../../apps/web/src/app/pages/user-agenda/) | Child of shell |
| [`season-home/*`](../../apps/web/src/app/pages/season-home/) | Child of shell |

### Dependencies

| Story | Status | Relationship |
|-------|--------|----------------|
| **17.19** | done | Hub `/accueil` — first nav tab |
| **17.21** | done | Inbox `actions[]` for badge |
| **17.18** | done | Header shortcuts remain |
| **17.20** | backlog | Optional path memory on tab change |
| **17.23** | backlog | Must not conflict — selector stays in header |

### Project structure notes

| Layer | Paths |
|-------|--------|
| Layout | `apps/web/src/app/layout/member-shell/*` |
| Nav UI | `apps/web/src/app/shared/member-nav/*` |
| Badge | `apps/web/src/app/core/inbox/member-inbox-badge.service.ts` |
| Routes | `apps/web/src/app/app.routes.ts` |

**Commands:**

```bash
npm run test -w @hatcast/web -- --watch=false
npm run build -w @hatcast/web
```

### Testing requirements

- **Visibility matrix:** shell on `/accueil`, `/agenda`, `/saison/foo` ; hidden on event detail, `/troupes`, `/connexion`, admin membres.
- **Badge:** 0 hidden ; 3 shows `3` ; 12 shows `9+`.
- **Breakpoint:** stub `BreakpointObserver` — bottom vs rail templates.
- **Saison link:** mock shortcut service → `/saison/slug` vs `/troupes`.
- **Regression:** post-login specs green.

### References

- [Source: `_bmad-output/planning-artifacts/epics.md` — Story 17.22]
- [Source: `_bmad-output/planning-artifacts/ux-hub-a-faire.md` — Phase 4, badges, wireframe]
- [Source: `_bmad-output/implementation-artifacts/17-19-hub-accueil-a-faire-mvp.md`]
- [Source: `_bmad-output/implementation-artifacts/17-21-api-me-inbox-hub-membre.md`]
- [Source: `PLAN.md` — Epic 17 row 17.22]
- [Source: `docs/v2/technical/FRONTEND_UI.md`]

## Dev Agent Record

### Agent Model Used

Composer

### Completion Notes List

- Shell `MemberShell` : `/accueil`, `/agenda`, `/membre/:userSlug` (Stats / clin d’œil). Workspace `/saison/:slug`, event detail et admin **hors** shell.
- Nav **Accueil · Agenda · Stats** (`home`, `calendar_month`, `insights`) ; `MemberStatsShortcutService` pour le lien Stats.
- Badge inbox sur **Accueil** uniquement ; sync hub → badge sans second GET.
- Compte utilisateur : menu **avatar** (pas de 4ᵉ onglet nav).
- Breakpoint rail : CSS **840px** (pas de `BreakpointObserver` — un seul DOM).
- `npm run build -w @hatcast/web` OK ; tests ciblés member-nav/shell/badge + post-login OK. Suite complète : échecs préexistants dans `availability-dialog.spec.ts` (WIP dispo, hors 17.22) — voir AC11 waiver ci-dessous.

### Checklist M3 (revue 17.22 — M3-5)

| Point | Statut | Note |
|-------|--------|------|
| Composants Material (M3-1) | OK | `mat-tab-nav-bar` + `mat-tab-link` (bottom), `mat-nav-list` (rail) |
| Tokens `--mat-sys-*` (M3-2) | OK | `member-nav.scss`, pas de hex |
| Mobile ≥ 48dp, `aria-label` FR (M3-3) | OK | bottom 3rem ; badge 9+ aligné aria |
| Bottom nav + rail 840px (M3-4) | OK | scope story 17.22 / ux-hub phase 4 |
| Checklist revue (M3-5) | OK | ce tableau |
| Landmarks navigation | OK | un seul `role="navigation"` par variante (rail / bottom) |
| Tests breakpoint CSS | **N/A** | un DOM, media queries — pas de `BreakpointObserver` |

### Review Findings

- [x] [Review][Patch] AC8 — onglet Saison actif sur tout `/saison/:slug` courant (`isSeasonTabActive`), pas seulement le lien raccourci.
- [x] [Review][Patch] A11y — enveloppe `<div class="member-nav">` ; `role="navigation"` sur rail et `mat-tab-nav-bar` uniquement.
- [x] [Review][Patch] DRY — `pathFromUrl` exporté depuis `member-shell-nav-visibility.ts` ; réutilisé par shell et nav.
- [x] [Review][Patch] M3-5 — checklist documentée (ci-dessus).
- [x] [Review][Patch] Badge nav synchronisé après `MemberHomeTodo.loadInbox()` (sans GET supplémentaire).
- [x] [Review][Decision] AC11 suite complète — waiver : échecs `availability-dialog.spec.ts` hors périmètre 17.22 ; tests shell/nav/badge verts.
- [x] [Review][Defer] Fusionner les GET inbox hub + shell — partiellement adressé (sync count hub → badge) ; un GET shell à l’init reste acceptable MVP.

### File List

- `apps/web/src/app/app.routes.ts`
- `apps/web/src/app/layout/member-shell/member-shell.ts`
- `apps/web/src/app/layout/member-shell/member-shell.html`
- `apps/web/src/app/layout/member-shell/member-shell.scss`
- `apps/web/src/app/layout/member-shell/member-shell.spec.ts`
- `apps/web/src/app/layout/member-shell/member-shell-nav-visibility.ts`
- `apps/web/src/app/layout/member-shell/member-shell-nav-visibility.spec.ts`
- `apps/web/src/app/shared/member-nav/member-nav.ts`
- `apps/web/src/app/shared/member-nav/member-nav.html`
- `apps/web/src/app/shared/member-nav/member-nav.scss`
- `apps/web/src/app/shared/member-nav/member-nav.spec.ts`
- `apps/web/src/app/core/inbox/member-inbox-badge.service.ts`
- `apps/web/src/app/core/inbox/member-inbox-badge.service.spec.ts`
- `apps/web/src/app/core/navigation/member-stats-shortcut.service.ts`
- `apps/web/src/app/core/navigation/member-stats-shortcut.service.spec.ts`
- `apps/web/src/app/pages/member-home-todo/member-home-todo.ts`
- `apps/web/src/app/pages/member-home-todo/member-home-todo.html`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/planning-artifacts/ux-hub-a-faire.md`

### Change Log

- 2026-05-27 : Story **17.22** created via `/bmad-create-story` — shell navigation bar M3 (À faire · Agenda · Saison).
- 2026-05-27 : Implémentation dev-story — shell membre, nav M3, badge inbox.
- 2026-05-27 : Revue code — patchs AC8, a11y landmarks, DRY `pathFromUrl`, sync badge hub, checklist M3.
- 2026-05-27 : Nav **Accueil · Agenda · Stats** (clin d’œil) ; workspace saison hors shell ; pas d’onglet compte.

---

### Validation create-story

- [x] AC métier numérotés et sourcés (epics / FR)
- [x] Section **Material 3** remplie (M3-1 … M3-5)
- [x] Tasks référencent les numéros d'AC
- [x] Liens vers fichiers code existants à réutiliser
- [x] `npm run test` / `npm run build` mentionnés
- [x] Décision **masquer** nav sur event detail documentée (AC6)
- [x] Badge inbox branché sur **17.21** (AC3)
