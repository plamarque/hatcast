---
baseline_commit: 0b6ed4ac5791f7d69e78297a6652eee326247a73
---

# Story 17.41: Nav shell — Ma troupe tab + `lastVisitedTroupeSlug`

Status: done

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

## Story

As a **member**,  
I want a **Ma troupe** destination in the global member navigation,  
so that **I can reach my collective home in one tap** without hunting breadcrumbs or the troupes list.

## Acceptance Criteria

1. **Given** a signed-in member on a shell route with global nav visible, **when** the viewport is **< 840px**, **then** the bottom navigation bar shows **four** destinations in order: **Accueil** (`home`) → `/accueil`, **Mon agenda** (`calendar_month`) → `/agenda`, **Ma troupe** (`groups`) → `LastVisitedTroupeShortcutService.link`, **Mes stats** (`insights`) → `MemberStatsShortcutService.link`. [Source: [ux-design-ma-troupe-hub.md](../planning-artifacts/ux-design-ma-troupe-hub.md) MT1–MT3, MT-AC1]
2. **Given** the same shell routes, **when** viewport is **≥ 840px**, **then** the left rail shows the **same four** destinations (icon + label) between **Mon agenda** and **Mes stats** ; account menu footer unchanged (**17.25**). [Source: MT-AC1 ; ux-hub amended 2026-06-10]
3. **Given** tap **Ma troupe**, **when** `lastVisitedTroupeSlug` is set in `localStorage`, **then** navigate to `/troupes/{slug}` ; **when** slug absent or blank, **then** navigate to `/troupes`. [Source: MT1, MT-AC2]
4. **Given** successful load of **troupe hub** (`/troupes/:slug`) or **canonical season workspace** (`/saison/:troupeSlug/:seasonSlug`), **when** troupe context is known, **then** persist `lastVisitedTroupeSlug` (trimmed slug, same silent-failure pattern as `lastVisitedSeason`). [Source: MT2, MT-AC3]
5. **Given** current path matches `/troupes/:slug` or `/troupes/:slug/admin/*`, **when** nav renders, **then** **Ma troupe** tab shows **active** state (`aria-current="page"`). **When** path is `/troupes` (list only), **then** Ma troupe is **not** active. [Source: MT-AC2 behaviour]
6. **Given** inbox badge rules from **17.22**, **when** nav renders, **then** badge remains on **Accueil only** ; Ma troupe never badged. [Source: ux-hub § Badges]
7. **Given** nav labels, **when** displayed, **then** second tab label is **Mon agenda** (not « Agenda ») on rail and bottom bar ; fourth tab **Mes stats** (unchanged short label acceptable if already « Stats » — prefer **Mes stats** if space allows on rail). [Source: MT3]
8. **Given** post-login (`PostLoginNavigationService`), **when** sign-in succeeds, **then** behaviour **unchanged** — no forced navigation to Ma troupe. [Source: ux-design-ma-troupe-hub.md ; UX-DR13]
9. **Given** four bottom tabs on mobile, **when** rendered at ≤480px, **then** each tab target remains **≥ 48×48 dp** ; labels may truncate but icons stay visible ; French `aria-label` on Ma troupe: **Ma troupe**. [Source: M3-3]
10. **Given** implementation complete, **when** `npm run test -w @hatcast/web -- --watch=false` and `npm run build -w @hatcast/web`, **then** they pass with specs for: fourth tab presence, link target with/without stored slug, active state on hub vs list, persistence on hub/season visit, label **Mon agenda**. [Source: repo norms]

**Couverture produit :** [ux-design-ma-troupe-hub.md](../planning-artifacts/ux-design-ma-troupe-hub.md) **MT1–MT3 only**. **Hors scope :** hub dashboard refactor (**17.42**), event detail chrome (**17.43**), mini-chart (**17.44**), post-login troupe-first default, backend API.

> **Note numbering:** UX doc provisionally labeled this slice **17.38** ; Epic 17 **17.38** is already **category-glossary-api** (done). This story is **17.41**.

---

## Acceptance Criteria — Material 3 (UI)

**M3-1. Composants Material** — **Given** the shell nav, **when** the fourth tab renders, **then** reuse existing `mat-nav-list` / `mat-tab-link` patterns from [`member-nav`](../../apps/web/src/app/shared/member-nav/member-nav.html) ; icon **`groups`**. [Source: FRONTEND_UI.md ; MT1]

**M3-2. Tokens & thème** — **Given** nav SCSS changes for four tabs, **when** colors apply, **then** `--mat-sys-*` only — no new hex. [Source: member-nav.scss]

**M3-3. Mobile & tactile** — **Given** ≤480px with **four** bottom tabs, **when** layout adjusts, **then** verify min touch targets and readable icon+label stack ; update SCSS if needed (smaller label font or flex shrink) without clipping badge on Accueil. [Source: NFR-A1]

**M3-4. Navigation membre** — **Given** this story extends **17.22**, **when** delivered, **then** implement **4-tab** M3 bottom bar + rail per amended [ux-hub-a-faire.md](../planning-artifacts/ux-hub-a-faire.md) ; do **not** add M2 bottom app bar. [Source: MT1 ; supersedes 17.22 three-tab-only spec]

**M3-5. Revue** — **Given** implementation done, **when** validated, **then** walk FRONTEND_UI.md checklist § M3 ; note waivers in Dev Agent Record. [Source: AGENTS.md]

---

## Tasks / Subtasks

- [x] **Storage — `lastVisitedTroupeSlug`** (AC: 3, 4)
  - [x] Add [`last-visited-troupe-storage.ts`](../../apps/web/src/app/core/navigation/last-visited-troupe-storage.ts) (+ `.spec.ts`):
    - Key `lastVisitedTroupeSlug` (new V2 key).
    - `getLastVisitedTroupeSlug()`, `rememberLastVisitedTroupeSlug(slug)`, `clearLastVisitedTroupeSlug()`.
    - Mirror try/catch from [`last-visited-season-storage.ts`](../../apps/web/src/app/core/navigation/last-visited-season-storage.ts).
  - [x] Optional: `clearLastVisitedTroupeSlug()` from logout path if season slug is cleared today — match existing logout hygiene in `post-login-navigation.service` / auth flow (only if already clearing season keys). **Deferred:** season slug is not cleared on logout today; no troupe clear added.

- [x] **Shortcut service** (AC: 3, 5)
  - [x] Add [`last-visited-troupe-shortcut.service.ts`](../../apps/web/src/app/core/navigation/last-visited-troupe-shortcut.service.ts) (+ `.spec.ts`):
    - Pattern [`MemberStatsShortcutService`](../../apps/web/src/app/core/navigation/member-stats-shortcut.service.ts).
    - `link` computed: `/troupes/{slug}` or `/troupes`.
    - `refresh()` reads storage (no API required for MVP link target).
    - `isTroupeTabActive(path: string): boolean` — true for `/troupes/:slug` and admin children.

- [x] **Write hooks** (AC: 4)
  - [x] [`troupe-hub.ts`](../../apps/web/src/app/pages/troupe-hub/troupe-hub.ts): after troupe loaded, `rememberLastVisitedTroupeSlug(t.slug)`.
  - [x] [`season-home.ts`](../../apps/web/src/app/pages/season-home/season-home.ts): alongside `rememberLastVisitedSeasonSlug`, persist troupe slug from `routeTroupeSlug()` or resolved `troupeSlug()` signal.
  - [x] Do **not** write from `/troupes` list unless user opens a specific hub (list alone does not set last troupe).

- [x] **Member nav UI** (AC: 1, 2, 5, 6, 7, 9)
  - [x] Update [`member-nav.ts`](../../apps/web/src/app/shared/member-nav/member-nav.ts) / [`.html`](../../apps/web/src/app/shared/member-nav/member-nav.html) / [`.scss`](../../apps/web/src/app/shared/member-nav/member-nav.scss):
    - Inject `LastVisitedTroupeShortcutService` ; `refresh()` in `ngOnInit` with stats shortcut.
    - Insert **Ma troupe** tab after Mon agenda, before Stats (rail + bottom).
    - Rename Agenda label → **Mon agenda**.
    - Active state: custom computed (like `isStatsTabActive`) using shortcut helper + `currentPath`.
  - [x] Verify rail account footer still pins bottom with **4** nav items (flex layout).

- [x] **Optional — `lastMemberEntryPath`** (AC: 8 — follow-up friendly)
  - [x] Extend [`isPersistableMemberEntryPath`](../../apps/web/src/app/core/navigation/last-member-entry-path-storage.ts) to allow `/troupes/:slug` — **Deferred to 17.42+** per story note (post-login behaviour unchanged per AC 8).

- [x] **Tests & docs** (AC: 10)
  - [x] Extend [`member-nav.spec.ts`](../../apps/web/src/app/shared/member-nav/member-nav.spec.ts): 4 tabs, Ma troupe link, Mon agenda label, active on `/troupes/malice`.
  - [x] Storage + shortcut service unit specs.
  - [x] Update [`ux-design-ma-troupe-hub.md`](../planning-artifacts/ux-design-ma-troupe-hub.md) story table IDs (17.41 nav — this file). **Already present** — no edit required.
  - [x] Add Epic 17 row in [`epics.md`](../planning-artifacts/epics.md) pointing to this file. **Already present** — no edit required.

### Review Findings

- [x] [Review][Patch] Stale « Ma troupe » link after in-session persistence [`member-nav.ts:78-81`] — Fixed: `effect()` refreshes shortcut on every `currentPath` change.

- [x] [Review][Patch] Missing persistence integration tests (AC4/AC10) [`troupe-hub.ts:237`, `season-home.ts:666`] — Added `troupe-hub.spec.ts` localStorage test + `season-home.spec.ts` spy test.

- [x] [Review][Patch] Missing member-nav test: inactive on `/troupes` list (AC5/AC10) [`member-nav.spec.ts`] — Added render at `/troupes` asserting no active Ma troupe tab.

- [x] [Review][Patch] Outdated nav comment [`member-shell-nav-visibility.ts:29`] — Updated to four-tab shell.

- [x] [Review][Defer] No logout / access-denied slug clear — deferred per story (season slug not cleared on logout either); `clearLastVisitedTroupeSlug` exported but unused in prod paths.

- [x] [Review][Defer] Full `npm run test -w @hatcast/web` suite failures — pre-existing (76+ failures unrelated to this story); targeted includes pass (22/22).

## Dev Notes

### Product and UX rules

- **JTBD:** collective entry (J3) at nav level — troupe label, season content comes in **17.42** hub dashboard.
- **Ma troupe tab target** is always a **route**, not a troupe switcher ; multi-troupe escape stays **Voir les autres troupes** on hub (**17.42**) or `/troupes` list.
- **`/troupes/:slug` is already a `MemberShell` child** ([`app.routes.ts`](../../apps/web/src/app/app.routes.ts)) and `shouldShowMemberNav` already matches hub + admin routes — this story **adds the missing nav item**, not new routing.
- **Do not remove** header cross-nav shortcuts from **17.18** (Mon agenda chip on season, Ma saison on agenda) in this story — they coexist until product trims them in **17.42**.
- **Stats tab** fallback `/accueil` when no user slug — unchanged.

### Current state (must read before edit)

| File | Today | This story |
|------|-------|------------|
| [`member-nav.html`](../../apps/web/src/app/shared/member-nav/member-nav.html) | 3 tabs: Accueil, Agenda, Stats | 4 tabs ; Agenda → **Mon agenda** ; + Ma troupe |
| [`last-visited-season-storage.ts`](../../apps/web/src/app/core/navigation/last-visited-season-storage.ts) | Season slug + per-troupe season map | Add parallel **troupe slug** storage |
| [`troupe-hub.ts`](../../apps/web/src/app/pages/troupe-hub/troupe-hub.ts) | Grid saisons hub ; no troupe slug memory | Call `rememberLastVisitedTroupeSlug` on load |
| [`season-home.ts`](../../apps/web/src/app/pages/season-home/season-home.ts) | `rememberLastVisitedSeasonSlug` on resolve | Also remember troupe slug |
| [`member-shell-nav-visibility.ts`](../../apps/web/src/app/layout/member-shell/member-shell-nav-visibility.ts) | Already includes `/troupes/:slug` | **No change required** unless tests need comment |

### Suggested layout (mobile, 4 tabs)

```text
┌─────────────────────────────────────────┐
│ Accueil │ Mon agenda │ Ma troupe │ Stats │
└─────────────────────────────────────────┘
```

### Frontend implementation guardrails

| Concern | Action |
|--------|--------|
| DRY | Mirror `MemberStatsShortcutService` + `last-visited-season-storage` — no ad-hoc localStorage in components |
| Active tab | `/troupes` list ≠ active Ma troupe ; `/troupes/:slug` and `/troupes/:slug/admin/*` = active |
| Link refresh | Call `troupeShortcut.refresh()` in `MemberNav.ngOnInit` alongside stats |
| 4-tab density | Adjust `.member-nav__bottom-label` font-size at ≤480px if labels wrap ; keep icons |
| i18n | UI strings French: **Mon agenda**, **Ma troupe**, **Mes stats** / **Stats** |
| Regression | Accueil inbox badge, stats self-slug active logic, rail footer account menu |

### Explicit non-goals

| Item | Story |
|------|-------|
| Hub dashboard (participants, teaser agenda, metrics card) | **17.42** |
| Event detail breadcrumb removal / Infos Contexte | **17.43** |
| Season mini-chart on hub | **17.44** |
| Rename shell route `/agenda` | URL stays ; label only |
| Troupe switcher in nav | Out of scope |
| Backend API | None |

### Dependencies

| Story | Status | Relationship |
|-------|--------|--------------|
| **17.22** | done | Base 3-tab shell — **extend**, do not rewrite |
| **17.25** | done | Rail footer account — preserve with 4 items |
| **17.4** | done | Troupe hub route exists |
| **17.23** | done | Season/troupe context switcher in headers — unchanged |
| **17.42** | backlog | Hub content refactor — follows this nav slice |

### Existing code to reuse

| File | Reuse for |
|------|-----------|
| [`MemberStatsShortcutService`](../../apps/web/src/app/core/navigation/member-stats-shortcut.service.ts) | Shortcut service pattern |
| [`last-visited-season-storage.ts`](../../apps/web/src/app/core/navigation/last-visited-season-storage.ts) | localStorage hygiene |
| [`troupeHubPath`](../../apps/web/src/app/core/navigation/troupe-routes.ts) | Route builder |
| [`pathFromUrl`](../../apps/web/src/app/layout/member-shell/member-shell-nav-visibility.ts) | Active path signal |
| [`member-nav.scss`](../../apps/web/src/app/shared/member-nav/member-nav.scss) | Rail + bottom bar tokens |

### Testing

```bash
npm run test -w @hatcast/web -- --watch=false --include member-nav
npm run test -w @hatcast/web -- --watch=false --include last-visited-troupe
npm run build -w @hatcast/web
```

## Dev Agent Record

### Agent Model Used

Composer (Cursor agent)

### Completion Notes List

- Added `lastVisitedTroupeSlug` localStorage module mirroring season storage hygiene (try/catch, trim, silent failure).
- Added `LastVisitedTroupeShortcutService` with computed link (`/troupes/{slug}` or `/troupes`) and `isTroupeTabActive` for hub + admin routes (not list).
- Persist troupe slug on successful troupe hub load and season workspace resolve.
- Extended member nav to **4 tabs**: Accueil · Mon agenda · Ma troupe · Mes stats (rail + bottom bar). Badge remains Accueil-only.
- SCSS: reduced bottom label font at ≤480px for four-tab density; touch targets remain ≥ 3rem (48dp).
- **Deferred:** logout troupe clear (season slug not cleared on logout either); `lastMemberEntryPath` `/troupes/:slug` persist (17.42+).
- **M3 checklist:** M3-1 through M3-4 validated; no waivers.
- **E2E (post-review Murat):** helper `e2e/helpers/member-nav.ui.ts` ; fixed tab labels in `sanity.mobile.spec.ts`, `member-stats.mobile.spec.ts` ; added `member-troupe-nav.mobile.spec.ts` — **E1-MEM-040 P0 blocking** ; E1-MEM-041–042 P1.
- **Code review 2026-06-12:** Fixed stale Ma troupe link (refresh on route change via `effect`); added persistence + inactive-list tests; updated nav visibility comment.
- **Story closed 2026-06-12** — all AC + M3 satisfied ; code review OK ; E1-MEM-040 P0 gate ; ready for **17.42**.

### File List

- `apps/web/src/app/core/navigation/last-visited-troupe-storage.ts` (new)
- `apps/web/src/app/core/navigation/last-visited-troupe-storage.spec.ts` (new)
- `apps/web/src/app/core/navigation/last-visited-troupe-shortcut.service.ts` (new)
- `apps/web/src/app/core/navigation/last-visited-troupe-shortcut.service.spec.ts` (new)
- `apps/web/src/app/pages/troupe-hub/troupe-hub.ts` (modified)
- `apps/web/src/app/pages/season-home/season-home.ts` (modified)
- `apps/web/src/app/shared/member-nav/member-nav.ts` (modified)
- `apps/web/src/app/shared/member-nav/member-nav.html` (modified)
- `apps/web/src/app/shared/member-nav/member-nav.scss` (modified)
- `apps/web/src/app/shared/member-nav/member-nav.spec.ts` (modified)
- `apps/web/e2e/helpers/member-nav.ui.ts` (new)
- `apps/web/e2e/e1/sanity.mobile.spec.ts` (modified)
- `apps/web/e2e/e1/member-stats.mobile.spec.ts` (modified)
- `apps/web/e2e/e1/member-troupe-nav.mobile.spec.ts` (new)
- `_bmad-output/test-artifacts/test-design-e1-cutover-preprod-gate.md` (modified)
- `apps/web/e2e/README.md` (modified)
- `docs/v2/technical/DEPLOYMENT_WORKFLOW.md` (modified)
- `.github/workflows/e1-preprod-gate.yml` (modified)
- `apps/web/src/app/layout/member-shell/member-shell-nav-visibility.ts` (modified)
- `apps/web/src/app/pages/troupe-hub/troupe-hub.spec.ts` (modified)
- `apps/web/src/app/pages/season-home/season-home.spec.ts` (modified)

### Change Log

- 2026-06-10 : Story created (bmad-create-story) — nav Ma troupe MT1–MT3 ; numbered **17.41** (17.38 taken).
- 2026-06-12 : Implemented 4-tab nav shell, lastVisitedTroupeSlug storage + shortcut, persistence hooks, unit tests (22 passing).
- 2026-06-12 : E2E gate alignment — tab label fixes ; **E1-MEM-040 promoted P0 blocking** ; E1-MEM-041–042 P1.
- 2026-06-12 : Code review patches — route-change refresh, persistence specs, inactive `/troupes` test.
- 2026-06-12 : **Story closed** (done) — PO sign-off post-review + E2E gate.

---

### Validation create-story

- [x] AC métier numérotés et sourcés (ux-design-ma-troupe-hub MT1–MT3)
- [x] Section **Material 3** remplie
- [x] Tasks référencent les AC
- [x] Liens vers fichiers code existants
- [x] `npm run test` / build mentionnés
