---
baseline_commit: 5fd1c55bb9182b0cb06fbe2c773adec1c2fefb77
---

# Story 17.42: Hub troupe — dashboard collectif

Status: ready-for-dev

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

## Story

As a **member**,  
I want the **troupe hub** centred on the **current season** (metrics, participants, upcoming shows),  
so that I see **« chez nous »** at a glance without duplicating **Mon agenda**.

## Acceptance Criteria

1. **Given** `/troupes/:slug` loaded for a member, **when** the dashboard renders, **then** the first content section uses **`h2` = `{selectedSeason.title}`** (e.g. `Saison 2025-26`) — **no** generic label « Saison en cours » above it. [Source: [ux-design-ma-troupe-hub.md](../planning-artifacts/ux-design-ma-troupe-hub.md) MT7, MT-AC4]
2. **Given** the troupe has **>1 non-archived season** the viewer can access, **when** the season header row renders, **then** a **season switcher** (`▾`, `mat-menu` desktop / bottom sheet mobile per existing patterns) appears **right of the title** ; **when** ≤1 such season, **then** switcher is **hidden**. [Source: MT8, MT-AC5]
3. **Given** a selected active season, **when** the season card block renders, **then** it shows **three metric tiles** + primary CTA **Ouvrir la saison** → `saisonWorkspacePath(troupeSlug, seasonSlug)` (default agenda tab) ; **no** active-season **`season-card` grid** on the main hub surface. [Source: MT6, MT-AC6]
4. **Given** metric tiles, **when** displayed, **then** labels are French: **Spectacles** (`selectedSeason.eventCount`), **Participations** (sum of `row.annual.totalJeu.selections` from season statistics for the selected season), **Participant·es** (`selectedSeason.participantCount`). Loading/error states must not break the hero or other sections. [Source: MT6 wireframe ; MT-AC6]
5. **Given** `archivedSeasons().length > 0`, **when** below the season card, **then** a discrete text control **Saisons archivées (N)** toggles an inline list of archived seasons (reuse `app-season-card` or compact list) — not shown when `N = 0`. [Source: MT9]
6. **Given** no non-archived season, **when** hub loads, **then** empty copy *Aucune saison en cours pour l'instant.* + archived link if `N > 0` ; orga may still use hero gear **Nouvelle saison**. [Source: ux-design-ma-troupe-hub.md § Empty]
7. **Given** the selected season, **when** section **Participant·es** renders, **then** show up to **6** avatars (`app-user-avatar`, 40–48 dp, horizontal scroll on mobile) + **+N** overflow ; tap navigates to `/membre/{userSlug}?troupeId=&seasonId=` when `userSlug` is available (prefer statistics rows — see Dev Notes) ; CTA **Voir tout le roster** → `saisonWorkspacePath(...)` (MVP — dedicated `?view=participants` not shipped). [Source: MT10, MT-AC7]
8. **Given** the selected season, **when** section **Prochains spectacles** renders, **then** show **≤3** upcoming events as compact **`agenda-card`** rows (reuse `groupEventsByMonth` + card markup or a thin wrapper around `app-season-agenda` with capped input) ; participation/dispo cell on the right when viewer is a season participant (same rules as season agenda) ; CTA **Voir tout l'agenda** → workspace ; empty: *Aucun spectacle à venir cette saison.* [Source: MT11, MT-AC8, MT-AC11]
9. **Given** `TroupeContextService.activeTroupes().length >= 2`, **when** bottom of hub, **then** link **Voir les autres troupes** → `/troupes` ; **when** mono-troupe, **then** link **absent** (no placeholder). [Source: MT12, MT-AC9]
10. **Given** hub chrome, **when** rendered, **then** **no** breadcrumb `Troupes › …` ; hero keeps logo + troupe name + `app-scope-admin-menu` gear ; **no** footer Historique · Préférences ; guest hint *Saisons où tu es invité·e.* preserved when `EXTERNE`. [Source: MT13, MT14, MT-AC10]
11. **Given** default season selection on hub load or troupe slug change, **when** seasons are available, **then** pick: (a) non-archived season matching `getLastVisitedSeasonSlugForTroupe(troupeId)` if in list, else (b) non-archived season with latest `startDate` (desc, nulls last), else (c) empty state. Persist `rememberLastVisitedSeasonSlug(slug, troupeId)` when user switches season on hub. [Source: ux-design-ma-troupe-hub.md § Sélection saison par défaut]
12. **Given** successful hub load, **when** season dashboard data fetched, **then** reuse existing `rememberLastVisitedTroupeSlug` hook (**17.41**) — unchanged. [Source: MT2 via 17.41]
13. **Given** implementation complete, **when** `npm run test -w @hatcast/web -- --watch=false --include troupe-hub` and `npm run build -w @hatcast/web`, **then** they pass with specs covering: no breadcrumb, season title as h2, switcher visibility, metrics + CTA, archived toggle, participants cap, teaser max 3, multi-troupe footer, mono-troupe no footer, default season resolution, guest hint. [Source: repo norms]

**Couverture produit :** [ux-design-ma-troupe-hub.md](../planning-artifacts/ux-design-ma-troupe-hub.md) **MT6–MT14** (phase 1). **Hors scope :** mini-chart mois (**17.44**), event detail breadcrumb/contexte (**17.43**), nav shell (**17.41** done), new hub BFF endpoint, `?view=participants` workspace tab.

---

## Acceptance Criteria — Material 3 (UI)

**M3-1. Composants Material** — **Given** hub dashboard controls, **when** rendered, **then** use `mat-flat-button` / `mat-stroked-button` / `mat-button` for CTAs, `mat-menu` (+ optional bottom sheet) for season switcher, `mat-spinner` for loading ; reuse `app-scope-admin-menu`, `app-user-avatar`, `app-season-agenda` or shared `agenda-card` SCSS from `_hatcast-agenda-event-card.scss`. [Source: FRONTEND_UI.md ; MT-AC M3-1]

**M3-2. Tokens & thème** — **Given** new hub SCSS, **when** colors/spacing apply, **then** only `var(--mat-sys-*)` and `color-mix(in srgb, var(--mat-sys-…) …)` ; section titles follow L2 tokens from [ux-design-hub-section-headers.md](../planning-artifacts/ux-design-hub-section-headers.md) (`1rem`, weight 600, `margin-bottom: 0.65rem`). [Source: FRONTEND_UI.md]

**M3-3. Mobile & tactile** — **Given** ≤480px, **when** avatar row and CTAs render, **then** touch targets ≥ **48×48 dp** ; season switcher and CTAs have French `aria-label` when icon-only ; participant strip scrolls horizontally without clipping hero gear. [Source: NFR-A1 ; MT10]

**M3-4. Navigation membre** — **Given** hub under `MemberShell`, **when** delivered, **then** no new bottom app bar ; escape multi-troupe via **Voir les autres troupes** or nav **Ma troupe** (**17.41**) ; do not reintroduce breadcrumb. [Source: ux-hub-a-faire.md ; MT13]

**M3-5. Revue** — **Given** implementation done, **when** validated, **then** walk FRONTEND_UI.md checklist § M3 ; note waivers in Dev Agent Record. [Source: AGENTS.md]

---

## Tasks / Subtasks

- [ ] **Default season + switcher** (AC: 1, 2, 11)
  - [ ] In [`troupe-hub.ts`](../../apps/web/src/app/pages/troupe-hub/troupe-hub.ts): add `selectedSeasonId` signal ; implement `pickDefaultSeason(activeSeasons, troupeId)` using `getLastVisitedSeasonSlugForTroupe` + `startDate` sort.
  - [ ] Season header row: `h2` title + conditional `mat-menu` trigger (`expand_more`) listing **non-archived** seasons only ; on pick → update selection + `rememberLastVisitedSeasonSlug`.
  - [ ] Mobile: prefer `MatBottomSheet` for switcher if `mat-menu` is awkward at ≤480px (match patterns from dialogs elsewhere).

- [ ] **Season dashboard card — metrics + CTA** (AC: 3, 4, 6)
  - [ ] Replace [`troupe-hub.html`](../../apps/web/src/app/pages/troupe-hub/troupe-hub.html) « Saisons » grid with season card block (metric tiles + **Ouvrir la saison**).
  - [ ] Load statistics via [`SeasonStatisticsApiService.loadStatistics`](../../apps/web/src/app/core/seasons/season-statistics-api.service.ts)(seasonId) when season selected ; compute participations sum ; handle loading/error without blocking hero.
  - [ ] Empty state when `activeSeasons().length === 0`.

- [ ] **Archived seasons** (AC: 5)
  - [ ] Toggle **Saisons archivées (N)** below card ; inline `app-season-card` list for archived only (reuse existing component).

- [ ] **Participant·es section** (AC: 7)
  - [ ] Section `h2` **Participant·es** ; first 6 from statistics rows (has `userSlug`) or workspace `participantSelectors` with non-clickable fallback for rows without slug.
  - [ ] Avatar tap → [`MemberProfileService.navigateToMemberGlance`](../../apps/web/src/app/core/member-profile/member-profile.service.ts) with `troupeId` + `seasonId` query params.
  - [ ] CTA **Voir tout le roster** → `saisonWorkspacePath(troupeSlug, seasonSlug)`.

- [ ] **Prochains spectacles teaser** (AC: 8)
  - [ ] On season select, call [`SeasonApiService.getSeasonWorkspace`](../../apps/web/src/app/core/seasons/season-api.service.ts)(seasonId, `{ eventPage: 0, eventSize: 3 }`) — reuse PERF-07 BFF.
  - [ ] Map events with [`groupEventsByMonth`](../../apps/web/src/app/pages/season-home/season-events.utils.ts) ; render ≤3 cards ; wire click → `saisonEventPath(...)`.
  - [ ] CTA **Voir tout l'agenda** → workspace ; wire participation cell when `participantFocus` / availability present on events.

- [ ] **Chrome cleanup + footer** (AC: 9, 10)
  - [ ] Remove [`troupe-hub__breadcrumb`](../../apps/web/src/app/pages/troupe-hub/troupe-hub.html) block entirely.
  - [ ] Add conditional footer link **Voir les autres troupes** when `troupeContext.activeTroupes().length >= 2`.
  - [ ] Desktop ≥840px: optional two-column layout for Participant·es + Prochains spectacles (UX wireframe).

- [ ] **Optional follow-ups** (non-blocking)
  - [ ] Extend [`isPersistableMemberEntryPath`](../../apps/web/src/app/core/navigation/last-member-entry-path-storage.ts) for `/troupes/:slug` (deferred from **17.41**).

- [ ] **Tests & regression** (AC: 13)
  - [ ] Rewrite [`troupe-hub.spec.ts`](../../apps/web/src/app/pages/troupe-hub/troupe-hub.spec.ts): remove breadcrumb/grid-first expectations ; add dashboard AC coverage ; mock `getSeasonWorkspace` + `loadStatistics`.
  - [ ] Preserve tests: session gate, access denied, admin gear, edit dialog, slug change, demo hint, `rememberLastVisitedTroupeSlug`.

---

## Dev Notes

### Product and UX rules

- **JTBD J2/J3:** Hub = collective pulse for **this troupe's current season** ; **Mon agenda** stays personal cross-troupe chronology (**MT4**, **MT-AC11**).
- **Do not duplicate** full agenda: teaser is **max 3** cards, no month filters, no load-more on hub.
- **Titre section = intitulé saison** — never a generic « Saison en cours » heading (**MT7**).
- **Switcher scope:** seasons returned in `listSeasons` that are **not archived** ; for guests, API already scopes to invited seasons — show hint under hero (**existing `isGuestViewer`**).
- **Metrics choice (PO-approved wireframe, figer en impl):**
  - **Spectacles** → `SeasonResponse.eventCount` (total season events, matches legacy season-card stat).
  - **Participations** → sum of confirmed composition selections across roster from statistics API (`annual.totalJeu.selections` per row).
  - **Participant·es** → `SeasonResponse.participantCount`.
- **Participant avatar taps:** Statistics rows include `userSlug` ([`SeasonStatisticsResponse.rows`](../../apps/web/src/app/core/seasons/season-statistics-api.service.ts)) ; `ParticipantSelector` does **not** — prefer stats rows for ordered preview + navigation ; skip tap handler when `userSlug` null (EXTERNES / name-only).
- **Roster CTA:** Workspace has no `view=participants` yet — link to default workspace agenda ; do **not** invent admin routes for regular members.
- **Cross-nav (**17.18**):** PO confirmed **2026-06-12** — **do not** remove Mon agenda / Ma saison shortcuts from season, event, or agenda headers ; out of scope for this story.

### Current state (must read before edit)

| File / area | Today | This story |
|-------------|-------|------------|
| [`troupe-hub.html`](../../apps/web/src/app/pages/troupe-hub/troupe-hub.html) | Breadcrumb + hero + **Saisons** grid (`app-season-card`) | Remove breadcrumb ; dashboard sections MT6–MT12 |
| [`troupe-hub.ts`](../../apps/web/src/app/pages/troupe-hub/troupe-hub.ts) | `listSeasons` only ; `visibleSeasons` grid logic | + selected season, workspace + stats loads, switcher |
| [`troupe-hub.spec.ts`](../../apps/web/src/app/pages/troupe-hub/troupe-hub.spec.ts) | Asserts breadcrumb, season grid, archived toggle on grid | Rewrite for dashboard |
| [`troupe-hub.scss`](../../apps/web/src/app/pages/troupe-hub/troupe-hub.scss) | Breadcrumb + season grid styles | Metric tiles, sections, 2-col desktop, remove breadcrumb rules |
| Nav **Ma troupe** (**17.41**) | Links to hub | Unchanged |
| Hero + gear (**17.29**) | Modifier, Nouvelle saison, Membres, Paramètres | Preserve |

### Data-loading strategy (no new BFF required)

```text
On slug resolved + seasons listed:
  1. pickDefaultSeason(activeSeasons)
  2. parallel:
     - GET /v1/seasons/:id/workspace?view=agenda&eventSize=3  → teaser events + categories labels
     - GET /v1/seasons/:id/statistics                       → participations sum + avatar rows
  On season switch: repeat (2), cancel stale via requestId pattern (mirror slugRequestId)
```

Keep **`slugRequestId`** / stale-response guards when adding async season dashboard loads.

### Suggested layout (mobile)

```text
┌─────────────────────────────────────┐
│  [logo]  Les Improbots         [⚙]  │
├─────────────────────────────────────┤
│  Saison 2025-26              [▾]?   │
│  ┌─────────────────────────────┐   │
│  │ 24      156      12         │   │
│  │ Spectacles Particip. Part.  │   │
│  │ [ Ouvrir la saison → ]      │   │
│  └─────────────────────────────┘   │
│  Saisons archivées (2)              │
├─────────────────────────────────────┤
│  PARTICIPANT·ES                     │
│  [avatars →]  [ Voir tout → ]       │
├─────────────────────────────────────┤
│  PROCHAINS SPECTACLES               │
│  [agenda-card × ≤3]                 │
│  [ Voir tout l'agenda → ]           │
├─────────────────────────────────────┤
│  Voir les autres troupes →          │  (if ≥2 troupes)
└─────────────────────────────────────┘
```

### Frontend implementation guardrails

| Concern | Action |
|--------|--------|
| Reuse | `getSeasonWorkspace`, `SeasonStatisticsApiService`, `groupEventsByMonth`, `app-user-avatar`, `app-season-card` (archived only), `saisonWorkspacePath`, `saisonEventPath` |
| Do not | Copy full `season-home` ; add troupe-hub BFF ; show active season grid on main surface |
| Section headers | L2 class e.g. `troupe-hub__section-title` aligned with [`member-home-todo`](../../apps/web/src/app/pages/member-home-todo/member-home-todo.scss) |
| i18n | French copy per UX wireframe ; exact footer label **Voir les autres troupes** |
| Perf | Cap event fetch at 3 ; single stats call per season selection ; guard stale responses |
| Regression | Access denied / not-found / demo hint / admin menu / troupe slug persistence (**17.41**) |

### Explicit non-goals

| Item | Story |
|------|-------|
| Mini-chart mois in season card | **17.44** |
| Event detail breadcrumb / Infos Contexte | **17.43** |
| Nav shell / Ma troupe tab | **17.41** (done) |
| New API `GET /troupes/:id/hub-dashboard` | Use existing season endpoints |
| Workspace `?view=participants` tab | Future ; MVP links to workspace root |
| Remove **17.18** cross-nav from season/event/agenda headers | **PO 2026-06-12 : non** — keep as-is |
| Post-login troupe-first routing | Unchanged |

### Dependencies

| Story | Status | Relationship |
|-------|--------|--------------|
| **17.41** | done | Nav entry + `lastVisitedTroupeSlug` — prerequisite |
| **17.29** | done | Hero + gear admin — preserve |
| **17.4** | done | Hub route + seasons list API |
| **PERF-07** | done | `getSeasonWorkspace` for teaser |
| **17.18** | done | Cross-nav **unchanged** (PO 2026-06-12) |
| **17.44** | backlog | Mini-chart follows this story |
| **17.43** | backlog | Event chrome — parallel OK |

### Previous story intelligence (17.41)

- **`lastVisitedTroupeSlug`** persisted on hub load — keep call in `applySlug` after troupe resolve.
- **4-tab nav** shell is live ; hub content was explicitly deferred to **this story**.
- **Deferred from 17.41:** `lastMemberEntryPath` for `/troupes/:slug` — optional task here.
- **Review pattern:** refresh shortcut links on route change (`effect` on path) — apply same stale-guard pattern for season dashboard fetches.
- **Test baseline:** full web suite may have pre-existing failures ; scope `--include troupe-hub` for story gate.

### Git intelligence

Recent commits on branch are **e2e/API guest** fixes — no conflicting hub work. Hub files last touched by **17.41** (persistence hook) and **17.29** (gear refactor).

### Architecture compliance

- **Front-only** story under `apps/web/` ; read-only API calls only.
- **Routes:** no new routes ; `/troupes/:slug` stays `MemberShell` child.
- **ADR 0013:** Canonical paths via [`troupe-routes.ts`](../../apps/web/src/app/core/navigation/troupe-routes.ts).
- **Angular 21.2 + Material 21.2** — signals, `computed`, `inject` ; no Tailwind primary surface.

### Testing

```bash
npm run test -w @hatcast/web -- --watch=false --include troupe-hub
npm run build -w @hatcast/web
```

Manual smoke: mono-troupe (no footer link) · multi-troupe (footer) · multi-season (switcher) · mono-season (no switcher) · archived-only (empty + link) · guest viewer hint · teaser empty state.

---

## Dev Agent Record

### Agent Model Used

*(filled by dev agent)*

### Completion Notes List

*(filled by dev agent)*

### File List

*(filled by dev agent)*

### Change Log

- 2026-06-12 : Story created (bmad-create-story 17-42) — hub dashboard MT6–MT14 phase 1.
- 2026-06-12 : PO decision — do **not** trim **17.18** cross-nav shortcuts in this story.

---

### Validation create-story

- [x] AC métier numérotés et sourcés (ux-design-ma-troupe-hub MT6–MT14)
- [x] Section **Material 3** remplie
- [x] Tasks référencent les AC (y compris M3-x)
- [x] Liens vers fichiers code existants à réutiliser
- [x] `npm run test` / build mentionnés
