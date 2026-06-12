---
baseline_commit: 5fd1c55bb9182b0cb06fbe2c773adec1c2fefb77
---

# Story 17.42: Hub troupe — dashboard collectif

Status: done

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

## Story

As a **member**,  
I want the **troupe hub** centred on the **current season** (metrics, participants, upcoming shows),  
so that I see **« chez nous »** at a glance without duplicating **Mon agenda**.

## Acceptance Criteria

1. **Given** `/troupes/:slug` loaded for a member, **when** the dashboard renders, **then** the first content section uses **`h2` = `{selectedSeason.title}`** (e.g. `Saison 2025-26`) — **no** generic label « Saison en cours » above it. [Source: [ux-design-ma-troupe-hub.md](../planning-artifacts/ux-design-ma-troupe-hub.md) MT7, MT-AC4]
2. **Given** the troupe has **>1 non-archived season** the viewer can access, **when** the season header row renders, **then** a **season switcher** (`▾`, `mat-menu` desktop / bottom sheet mobile per existing patterns) appears **right of the title** ; **when** ≤1 such season, **then** switcher is **hidden**. [Source: MT8, MT-AC5]
3. **Given** a selected active season, **when** the season card block renders, **then** it shows **three metric tiles only** (no primary CTA on the card) ; **no** active-season **`season-card` grid** on the main hub surface. [Source: MT6, MT8 amend. 2026-06-12 ; MT-AC6]
4. **Given** metric tiles, **when** displayed, **then** labels are French: **Spectacles** (`selectedSeason.eventCount`), **Compos** (`confirmedCompositionsCount` from season statistics — spectacles équipe confirmée), **Personnes** (`selectedSeason.participantCount`). Loading/error on **Compos** shows spinner or `—` without breaking hero or other sections. [Source: ux-design-ma-troupe-hub.md amend. 2026-06-12 ; MT-AC6]
5. **Given** `archivedSeasons().length > 0`, **when** below the season card, **then** a discrete text control **Saisons archivées (N)** toggles an inline list of archived seasons (reuse `app-season-card` or compact list) — not shown when `N = 0`. [Source: MT9]
6. **Given** no non-archived season, **when** hub loads, **then** empty copy *Aucune saison en cours pour l'instant.* + archived link if `N > 0` ; orga may still use hero gear **Nouvelle saison**. [Source: ux-design-ma-troupe-hub.md § Empty]
7. **Given** the selected season, **when** section **Personnes** renders, **then** show avatars **3.5rem** (`flex-wrap`, no horizontal scroll) with cap **12** mobile / **36** desktop (6×6) + **+N** overflow link → `saisonWorkspacePath(...)` ; tap navigates to `/membre/{userSlug}?troupeId=&seasonId=` when `userSlug` is available ; **no** text CTA roster. [Source: MT10 amend. 2026-06-12 ; MT-AC7]
8. **Given** the selected season, **when** section **Prochains spectacles** renders, **then** show **≤3** upcoming events as compact **`agenda-card`** rows (reuse `groupEventsByMonth` + `app-season-agenda`) ; participation/dispo cell when viewer is a season participant ; CTA **Voir tous les spectacles** centered in column → workspace ; empty: *Aucun spectacle à venir cette saison.* [Source: MT11 amend. 2026-06-12 ; MT-AC8, MT-AC11]
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

**M3-3. Mobile & tactile** — **Given** ≤480px, **when** avatar row and CTAs render, **then** touch targets ≥ **48×48 dp** ; season switcher and CTAs have French `aria-label` when icon-only ; Personnes strip uses **flex-wrap** (no mandatory horizontal scroll). [Source: NFR-A1 ; MT10 amend. 2026-06-12]

**M3-4. Navigation membre** — **Given** hub under `MemberShell`, **when** delivered, **then** no new bottom app bar ; escape multi-troupe via **Voir les autres troupes** or nav **Ma troupe** (**17.41**) ; do not reintroduce breadcrumb. [Source: ux-hub-a-faire.md ; MT13]

**M3-5. Revue** — **Given** implementation done, **when** validated, **then** walk FRONTEND_UI.md checklist § M3 ; note waivers in Dev Agent Record. [Source: AGENTS.md]

---

## Tasks / Subtasks

- [x] **Default season + switcher** (AC: 1, 2, 11)
  - [x] In [`troupe-hub.ts`](../../apps/web/src/app/pages/troupe-hub/troupe-hub.ts): add `selectedSeasonId` signal ; implement `pickDefaultSeason(activeSeasons, troupeId)` using `getLastVisitedSeasonSlugForTroupe` + `startDate` sort.
  - [x] Season header row: `h2` title + conditional `mat-menu` trigger (`expand_more`) listing **non-archived** seasons only ; on pick → update selection + `rememberLastVisitedSeasonSlug`.
  - [x] Mobile: prefer `MatBottomSheet` for switcher if `mat-menu` is awkward at ≤480px (match patterns from dialogs elsewhere).

- [x] **Season dashboard card — metrics** (AC: 3, 4, 6)
  - [x] Replace [`troupe-hub.html`](../../apps/web/src/app/pages/troupe-hub/troupe-hub.html) « Saisons » grid with season card block (3 metric tiles ; CTA **Ouvrir la saison** retiré amend. 2026-06-12).
  - [x] Load statistics via [`SeasonStatisticsApiService.loadStatistics`](../../apps/web/src/app/core/seasons/season-statistics-api.service.ts)(seasonId) ; afficher `confirmedCompositionsCount` (tuile **Compos**) ; handle loading/error without blocking hero.
  - [x] Empty state when `activeSeasons().length === 0`.

- [x] **Archived seasons** (AC: 5)
  - [x] Toggle **Saisons archivées (N)** below card ; inline `app-season-card` list for archived only (reuse existing component).

- [x] **Personnes section** (AC: 7)
  - [x] Section `h2` **Personnes** ; cap 12 mobile / 36 desktop depuis statistics rows ; `flex-wrap` ; avatars 3.5rem cliquables.
  - [x] Avatar tap → [`MemberProfileService.navigateToMemberGlance`](../../apps/web/src/app/core/member-profile/member-profile.service.ts) with `troupeId` + `seasonId` query params.
  - [x] Overflow **+N** seul CTA → `saisonWorkspacePath(troupeSlug, seasonSlug)` (pas de CTA texte roster).

- [x] **Prochains spectacles teaser** (AC: 8)
  - [x] On season select, call [`SeasonApiService.getSeasonWorkspace`](../../apps/web/src/app/core/seasons/season-api.service.ts)(seasonId, `{ eventPage: 0, eventSize: 3 }`) — reuse PERF-07 BFF.
  - [x] Map events with [`groupEventsByMonth`](../../apps/web/src/app/pages/season-home/season-events.utils.ts) ; render ≤3 cards ; wire click → `saisonEventPath(...)`.
  - [x] CTA **Voir tous les spectacles** (centré colonne) → workspace ; wire participation cell when `participantFocus` / availability present on events.

- [x] **Chrome cleanup + footer** (AC: 9, 10)
  - [x] Remove [`troupe-hub__breadcrumb`](../../apps/web/src/app/pages/troupe-hub/troupe-hub.html) block entirely.
  - [x] Add conditional footer link **Voir les autres troupes** when `troupeContext.activeTroupes().length >= 2`.
  - [x] Desktop ≥840px: two-column layout for Personnes + Prochains spectacles (UX wireframe).

- [ ] **Optional follow-ups** (non-blocking)
  - [ ] Extend [`isPersistableMemberEntryPath`](../../apps/web/src/app/core/navigation/last-member-entry-path-storage.ts) for `/troupes/:slug` (deferred from **17.41**).

- [x] **Tests & regression** (AC: 13)
  - [x] Rewrite [`troupe-hub.spec.ts`](../../apps/web/src/app/pages/troupe-hub/troupe-hub.spec.ts): remove breadcrumb/grid-first expectations ; add dashboard AC coverage ; mock `getSeasonWorkspace` + `loadStatistics`.
  - [x] Preserve tests: session gate, access denied, admin gear, edit dialog, slug change, demo hint, `rememberLastVisitedTroupeSlug`.

### Review Findings

- [x] [Review][Decision] **AC8 — Interactivité dispo/participation sur le teaser** — **Décision PO : parité `season-home`** — câbler `(availabilityClick)` et `(participationClick)` sur le teaser hub (→ patch ci-dessous).
- [x] [Review][Patch] **AC8 — Handlers dispo/participation manquants sur teaser** [`troupe-hub.html:274-279`, `troupe-hub.ts`] — ajouter `(availabilityClick)` / `(participationClick)` + méthodes alignées sur `season-home`.

- [x] [Review][Patch] **Données dashboard périmées au changement de saison** [`troupe-hub.ts:425-434`] — `selectSeason()` ne vide pas `statsRows` / `teaserEvents` ; le template masque le spinner si `participantPreview().length > 0`, donc roster/agenda de l’ancienne saison restent visibles sous le nouveau titre.

- [x] [Review][Patch] **Fuite subscription bottom sheet** [`troupe-hub.ts:416`] — `afterDismissed().subscribe()` non ajouté à `dialogSubscriptions` ; réouvertures multiples empilent des listeners.

- [x] [Review][Patch] **`loadingSeasons` bloqué sur requête obsolète** [`troupe-hub.ts:522-524`] — retour anticipé sans `loadingSeasons.set(false)` si `slugRequestId` périmé.

- [x] [Review][Patch] **`loadingDashboard` bloqué sur requête obsolète** [`troupe-hub.ts:564-569`] — retour anticipé sans `loadingDashboard.set(false)`.

- [x] [Review][Patch] **`loadSeasons(t.id)` après création sans garde slug** [`troupe-hub.ts:511`] — peut écraser `allSeasons` si l’utilisateur a changé de troupe pendant le dialog.

- [x] [Review][Patch] **Cible tactile toggle archivées < 48 dp** [`troupe-hub.scss:196-198`] — `.troupe-hub__archived-toggle` et bouton archivé état vide sans `min-height: 3rem` (M3-3).

- [x] [Review][Patch] **Switcher mobile : premier rendu `mat-menu`** [`troupe-hub.ts:151-154`] — `isMobileLayout` initialisé à `false` ; branche desktop jusqu’à émission du `BreakpointObserver` (AC2 / M3-3).

- [x] [Review][Patch] **Crash si `upcomingEvents` absent** [`troupe-hub.ts:588`] — accès à `.content` sans optional chaining ; devrait basculer sur `workspaceLoadError`.

- [x] [Review][Patch] **`selectedSeasonId` orphelin après reload** [`troupe-hub.ts:531-538`] — si l’id mémorisé disparaît de `allSeasons`, dashboard vide sans message ; re-pick via `pickDefaultSeason` recommandé.

- [x] [Review][Defer] **Pagination saisons limitée à 50** [`troupe-hub.ts:64`] — deferred, pre-existing (pattern `listSeasons` page 0 depuis 17.4 ; troupes >50 saisons rares).

- [x] [Review][Defer] **Tests races async / bottom sheet mobile** [`troupe-hub.spec.ts`] — deferred, pre-existing (couverture happy-path suffisante pour MVP ; scénarios switch rapide à renforcer ultérieurement).

---

## Dev Notes

### Product and UX rules

- **JTBD J2/J3:** Hub = collective pulse for **this troupe's current season** ; **Mon agenda** stays personal cross-troupe chronology (**MT4**, **MT-AC11**).
- **Do not duplicate** full agenda: teaser is **max 3** cards, no month filters, no load-more on hub.
- **Titre section = intitulé saison** — never a generic « Saison en cours » heading (**MT7**).
- **Switcher scope:** seasons returned in `listSeasons` that are **not archived** ; for guests, API already scopes to invited seasons — show hint under hero (**existing `isGuestViewer`**).
- **Metrics (amend. 2026-06-12 — voir [ux-design-ma-troupe-hub.md](../planning-artifacts/ux-design-ma-troupe-hub.md)):**
  - **Spectacles** → `SeasonResponse.eventCount`.
  - **Compos** → `SeasonStatisticsResponse.confirmedCompositionsCount` (équipes au cycle **Confirmé**).
  - **Personnes** → `SeasonResponse.participantCount`.
- **Personnes avatar taps:** Statistics rows include `userSlug` ; skip tap when null. Overflow **+N** → workspace agenda (pas de CTA texte roster).
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
     - GET /v1/seasons/:id/statistics                       → confirmedCompositionsCount + avatar rows
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
│  │ 45       11       37         │   │
│  │ Spectacles Compos Personnes   │   │
│  └─────────────────────────────┘   │
│  Saisons archivées (2)              │
├─────────────────────────────────────┤
│  PERSONNES                          │
│  [avatars wrap, max 12] [+N]        │
├─────────────────────────────────────┤
│  PROCHAINS SPECTACLES               │
│  [agenda-card × ≤3]                 │
│      [ Voir tous les spectacles ]   │
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

Composer (dev-story 17-42)

### Completion Notes List

- Replaced breadcrumb + season grid with season dashboard: title as `h2`, metric tiles (**Spectacles / Compos / Personnes**), archived toggle, Personnes strip (wrap, cap 12/36, +N), teaser agenda (≤3 via `getSeasonWorkspace` + `app-season-agenda`, CTA **Voir tous les spectacles** centré).
- Amend. 2026-06-12 (Patrice) : retiré CTA **Ouvrir la saison** ; **Compos** = `confirmedCompositionsCount` API ; libellés **Personnes** ; spec rétro-doc [`ux-design-ma-troupe-hub.md`](../planning-artifacts/ux-design-ma-troupe-hub.md).
- `pickDefaultSeason()` exported: last-visited slug per troupe, else latest `startDate` ; season switch via `mat-menu` (desktop) or `MatBottomSheet` (≤480px).
- Parallel dashboard loads with `seasonDashboardRequestId` stale guard ; errors isolated per section.
- Footer **Voir les autres troupes** when `activeTroupes().length >= 2` ; guest hint preserved for `EXTERNE`.
- Tests: 32/32 green (`--include='**/troupe-hub.spec.ts'`) ; `npm run build -w @hatcast/web` OK.
- **M3 checklist:** mat-flat/stroked/button, mat-menu, mat-spinner, tokens `var(--mat-sys-*)`, section titles L2 (1rem/600/0.65rem), touch targets ≥48dp on CTAs/avatars, French `aria-label` on switcher — no waivers.
- **Deferred (optional task):** `lastMemberEntryPath` for `/troupes/:slug` — unchanged from 17.41.

### File List

- `apps/web/src/app/pages/troupe-hub/troupe-hub.ts`
- `apps/web/src/app/pages/troupe-hub/troupe-hub.html`
- `apps/web/src/app/pages/troupe-hub/troupe-hub.scss`
- `apps/web/src/app/pages/troupe-hub/troupe-hub.spec.ts`
- `apps/web/src/app/pages/troupe-hub/troupe-hub-season-switcher-sheet.ts`
- `apps/web/src/app/core/seasons/season-statistics-api.service.ts`
- `services/api/src/main/kotlin/com/hatcast/api/season/SeasonStatisticsService.kt`
- `services/api/src/main/kotlin/com/hatcast/api/season/dto/SeasonStatisticsDtos.kt`
- `services/api/openapi/seasons.yaml`
- `_bmad-output/planning-artifacts/ux-design-ma-troupe-hub.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

### Change Log

- 2026-06-12 : Story created (bmad-create-story 17-42) — hub dashboard MT6–MT14 phase 1.
- 2026-06-12 : PO decision — do **not** trim **17.18** cross-nav shortcuts in this story.
- 2026-06-12 : Code review — 10 patchs appliqués (AC8 parité season-home, races async, M3 touch targets) ; status → done.
- 2026-06-12 : Amendements UX PO (hub recette) — Compos / Personnes, retrait Ouvrir la saison, avatars wrap 12/36, teaser CTA centré ; rétro-doc spec UX + `confirmedCompositionsCount` API.
- 2026-06-12 : E2E (Murat) — `e2e/helpers/troupe-hub.ui.ts` ; `e2e/e1/member-troupe-hub.mobile.spec.ts` — **E1-MEM-043…045 (P1)** ; matrice gate + README.

---

### Validation create-story

- [x] AC métier numérotés et sourcés (ux-design-ma-troupe-hub MT6–MT14)
- [x] Section **Material 3** remplie
- [x] Tasks référencent les AC (y compris M3-x)
- [x] Liens vers fichiers code existants à réutiliser
- [x] `npm run test` / build mentionnés
