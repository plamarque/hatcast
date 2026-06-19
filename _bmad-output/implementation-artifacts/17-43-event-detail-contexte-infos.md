---
baseline_commit: 8cb2611d06c41fbeab8c883cf7fbf1fa6f45a631
---

# Story 17.43: Event detail — Infos Saison + breadcrumb removal

Status: done

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

## Story

As a **member**,  
I want the **event title** front and centre in the header with troupe/season context in **Infos › Saison**,  
so that **mobile header space is not wasted** on a breadcrumb I rarely use and the title stays readable.

## Acceptance Criteria

1. **Given** canonical event detail (`/saison/:troupeSlug/:seasonSlug/event/:eventSlug`) loaded, **when** the header renders, **then** **`app-context-breadcrumb` is absent** (no troupe › saison chrome in header). [Source: [ux-design-ma-troupe-hub.md](../planning-artifacts/ux-design-ma-troupe-hub.md) ED1, ED-AC1 ; epics 17.43]
2. **Given** the same surface, **when** the header renders, **then** a **chevron back** control appears top-left (`mat-icon-button`, icon `arrow_back`), **`aria-label="Retour"`** (not « Mon agenda » or « Retour à l’agenda »). [Source: ED2, ED3, ED-AC2, ED-AC4 ; M3-4]
3. **Given** tap on chevron back, **when** the SPA has **prior in-app navigation** (detect via Angular `Location` / router history — e.g. `history.state.navigationId > 1`), **then** call **`Location.back()`** ; **when** no in-app history (deep link, new tab, refresh), **then** navigate to **`getLastMemberEntryPath()`** if persistable, else **`/agenda`**. [Source: ED3 ; [last-member-entry-path-storage.ts](../../apps/web/src/app/core/navigation/last-member-entry-path-storage.ts)]
4. **Given** event loaded with troupe + season context resolved, **when** the **header** renders, **then** `h1.event-detail__event-title` is **inline** on the same row as the back chevron (ellipsis on narrow viewports) ; **no** composition status badge in the header (ED2, amend. 2026-06-12). [Source: [ux-design-ma-troupe-hub.md](../planning-artifacts/ux-design-ma-troupe-hub.md) ED2 ; supersedes E7–E9 title-row badge]
5. **Given** event loaded, **when** admin permissions grant scope menu items, **then** **`app-scope-admin-menu`** in header right is **unchanged** (E1–E2) including mobile fixed gear placement via [`member-shell-mobile-chrome.scss`](../../apps/web/src/app/layout/member-shell/member-shell-mobile-chrome.scss). [Source: ED2, ED-AC4]
6. **Given** tab **Infos** active and context signals populated, **when** the tab body renders, **then** the **last block** is section **Saison** with two **clickable chips** — `{troupeName}` → `troupeHubPath(troupeSlug)` and `{seasonTitle}` → `saisonWorkspacePath(troupeSlug, seasonSlug)` (`mat-chip` + `routerLink`, centered). [Source: ED4, ED-AC3 ; amend. 2026-06-12]
7. **Given** Infos tab before Saison, **when** rendered, **then** existing fields (description, Date, Lieu, Format, Organisateur·ices, Catégorie) remain **unchanged in order and behaviour** (E10, stories **17.14–17.15**, **17.39**). [Source: ED4 ; title row spec]
7b. **Given** tab **Équipe** active and composition status resolved, **when** the tab body renders, **then** **`app-composition-equipe-status-header`** + help **`?`** appear at the **top** of the tab content ; **not** on Infos, Dispos, or header (ED5). [Source: ED5, ED-AC5]
8. **Given** loading, 403, 404, or missing context states, **when** header/title rules from today apply, **then** **do not** show back chevron or Saison chips with stale/empty names — mirror current guards (no title while loading). [Source: existing `event-detail.spec.ts` loading guards]
9. **Given** admin sub-pages under event scope (e.g. [`admin-event-participants`](../../apps/web/src/app/pages/admin-event-participants/admin-event-participants.html)), **when** rendered, **then** **`app-context-breadcrumb` with event title + leaf remains** — **do not** apply ED1 to admin routes. [Source: ux-design-event-detail-title-row § Admin sub-pages]
10. **Given** implementation complete, **when** `npm run test -w @hatcast/web -- --watch=false --include event-detail` and `npm run build -w @hatcast/web`, **then** they pass with specs covering: no breadcrumb on event detail, back chevron present + fallback navigation, Saison chips content + links, title inline in header, badge on Équipe tab only, admin sub-page breadcrumb unchanged (regression via existing admin specs). [Source: repo norms]

**Product coverage:** [ux-design-ma-troupe-hub.md](../planning-artifacts/ux-design-ma-troupe-hub.md) **ED1–ED5** ; supersedes partial **E7–E9** in [ux-design-event-detail-title-row-2026-06-06.md](../planning-artifacts/ux-design-event-detail-title-row-2026-06-06.md). **Out of scope:** hub dashboard (**17.42** done), mini-chart (**17.44**), new BFF/API, removing **17.18** cross-nav from other surfaces.

---

## Acceptance Criteria — Material 3 (UI)

**M3-1. Composants Material** — **Given** header back control and Infos Saison chips, **when** rendered, **then** use `mat-icon-button` (chevron), `mat-chip` + `routerLink` for troupe/saison navigation ; reuse `app-scope-admin-menu` and `app-composition-equipe-status-header` on Équipe tab unchanged. [Source: FRONTEND_UI.md ; ED4, ED5]

**M3-2. Tokens & thème** — **Given** new/changed SCSS in header, Infos Saison, and Équipe status, **when** colors/spacing apply, **then** only `var(--mat-sys-*)` and `color-mix(in srgb, var(--mat-sys-…) …)` ; Saison label follows Infos field pattern (`.event-infos__label`, section spacing). [Source: FRONTEND_UI.md]

**M3-3. Mobile & tactile** — **Given** ≤480px, **when** back chevron and Saison chips render, **then** touch targets **≥ 48×48 dp** ; chevron `aria-label="Retour"` ; header left reserves space so chevron does not overlap fixed account avatar (reuse `--member-shell-account-reserve` padding pattern from member shell). [Source: NFR-A1 ; member-shell-mobile-chrome.scss]

**M3-4. Navigation membre** — **Given** event detail under `MemberShell`, **when** delivered, **then** no new bottom app bar ; back chevron is **local escape**, not global nav replacement ; do not reintroduce breadcrumb on event detail. [Source: ux-hub-a-faire.md ; ED1]

**M3-5. Revue** — **Given** implementation done, **when** validated, **then** walk FRONTEND_UI.md checklist § M3 ; note waivers in Dev Agent Record. [Source: AGENTS.md]

---

## Tasks / Subtasks

- [x] **Event header — remove breadcrumb, add back, inline title** (AC: 1, 2, 3, 4, 5, 8)
  - [x] Refactor [`event-detail-header.html`](../../apps/web/src/app/pages/event-detail/event-detail-header.html): remove `app-context-breadcrumb` ; add `mat-icon-button` with `arrow_back` ; project title via `ng-content` (`data-event-detail-title-row`).
  - [x] Move `h1.event-detail__event-title` from title row into header (same flex row as chevron) ; remove separate `event-detail__context-row` above tabs.
  - [x] Update [`event-detail-header.ts`](../../apps/web/src/app/pages/event-detail/event-detail-header.ts): drop `ContextBreadcrumb` import ; inject `Location`, `Router` ; implement `onBack()` per ED3.
  - [x] Remove composition status badge from header / title row ; relocate to [`event-equipe-tab.html`](../../apps/web/src/app/pages/event-detail/event-equipe-tab.html) (ED5).

- [x] **Infos tab — Saison section** (AC: 6, 7)
  - [x] Add inputs to [`event-infos-tab.ts`](../../apps/web/src/app/pages/event-detail/event-infos-tab.ts): `troupeName`, `seasonTitle`, link computeds.
  - [x] Insert **last** block in [`event-infos-tab.html`](../../apps/web/src/app/pages/event-detail/event-infos-tab.html): section **Saison**, `mat-chip-set` with two `routerLink` chips (troupe + season), centered.
  - [x] Style in [`event-infos-tab.scss`](../../apps/web/src/app/pages/event-detail/event-infos-tab.scss): `.event-infos__saison`, `.event-infos__scope-chips`.
  - [x] Wire parent [`event-detail.html`](../../apps/web/src/app/pages/event-detail/event-detail.html): pass context names to infos tab ; title into header slot.

- [x] **Optional — back fallback from hub** (AC: 3 — recommended)
  - [x] Extend [`isPersistableMemberEntryPath`](../../apps/web/src/app/core/navigation/last-member-entry-path-storage.ts) to allow `/troupes/:slug` (deferred from **17.41** / **17.42**) ; update [`last-member-entry-path-storage.spec.ts`](../../apps/web/src/app/core/navigation/last-member-entry-path-storage.spec.ts).
  - [x] Ensure [`member-shell.ts`](../../apps/web/src/app/layout/member-shell/member-shell.ts) persists hub paths on `NavigationEnd` (should work once allowlist extended).

- [x] **Tests & e2e touchpoints** (AC: 10)
  - [x] Rewrite breadcrumb-centric cases in [`event-detail.spec.ts`](../../apps/web/src/app/pages/event-detail/event-detail.spec.ts) (e.g. « does not render header settings or back chevron after breadcrumb refactor » → expect back chevron **present**, breadcrumb **absent**).
  - [x] Add specs: back calls `Location.back()` when navigationId > 1 ; fallback to `/agenda` ; fallback to stored `lastMemberEntryPath` when no history.
  - [x] Add [`event-equipe-tab.spec.ts`](../../apps/web/src/app/pages/event-detail/event-equipe-tab.spec.ts) cases: status badge present on Équipe ; absent on Infos/Dispos.
  - [x] Add [`event-infos-tab.spec.ts`](../../apps/web/src/app/pages/event-detail/event-infos-tab.spec.ts) cases: Saison last block, chip hrefs, hidden when names empty.
  - [x] Review [`apps/web/e2e/helpers/story-3-25.ui.ts`](../../apps/web/e2e/helpers/story-3-25.ui.ts) — navigate to season via Saison chip instead of breadcrumb.

- [x] **Docs** — ADR [0013 §2](../../docs/adr/0013-troupe-navigation-equity-tags-event-slugs.md), FRONTEND_UI.md, UX specs retro-doc (ED1–ED5).

### Review Findings

- [x] [Review][Patch] Badge statut masqué sur spectacles brouillon — `event-equipe-tab.html:37-42` enveloppe le statut dans `@if (!eventIsDraft())` ; les orgas perdent le badge composition sur l’onglet Équipe quand `availabilityOpenedAt == null` (régression vs header pré-17.43, AC 7b).
- [x] [Review][Patch] Titre mobile tronqué sans texte accessible — `event-detail.html:12` + `event-detail.scss:53-58` ellipsis sans `[title]` ni alternative a11y sur `h1.event-detail__event-title` (AC 4 / M3-3).

- [x] [Review][Defer] `Location.back()` si `navigationId > 1` peut renvoyer hors HatCast — conforme ED3 / pattern story — deferred, pre-existing.
- [x] [Review][Defer] Test gap fallback chevron vers `/troupes/:slug` — allowlist étendue mais `onBack()` non testé sur ce chemin — deferred, test gap.
- [x] [Review][Defer] Test gap AC8 Saison absente sur 404/403 au niveau `event-detail.spec.ts` — deferred, test gap.
- [x] [Review][Defer] Badge statut absent pendant spinner chargement onglet Équipe — deferred, acceptable UX.
- [x] [Review][Defer] Test équipe brouillon ne couvre pas AC 7b — `event-equipe-tab.spec.ts` n’asserte pas le badge quand `availabilityOpenedAt == null` — deferred, test gap.

---

## Dev Notes

### Product and UX rules

- **JTBD:** Event detail = **personal action surface** (dispo, équipe, infos) ; troupe/saison context is **secondary** — discoverable in Infos, not permanent header chrome (**ED1**, Screen 6 amended [ux-design-journey-league-agenda.md](../planning-artifacts/ux-design-journey-league-agenda.md)).
- **Title inline:** Event title in sticky header same row as chevron — **not** a separate title row above tabs (**ED2**, amend. 2026-06-12).
- **Saison not Contexte:** Section label **Saison**, last Infos block, chips not stroked buttons (**ED4**).
- **Badge on Équipe only:** Composition status moved out of header for title readability (**ED5**).
- **Back ≠ Mon agenda:** Label **Retour** ; destination depends on history/fallback (**ED3**) — same pattern as journey Screen 6 table.
- **17.18 cross-nav:** PO confirmed **2026-06-12** (via **17.42**) — do **not** remove Mon agenda / Ma saison shortcuts from **season** or **agenda** headers ; event detail currently has **no** `member-cross-nav` — no action required.
- **403 handling unchanged:** [`event-detail.ts`](../../apps/web/src/app/pages/event-detail/event-detail.ts) already redirects to `/agenda` on 403 — independent of chevron.

### Current state (must read before edit)

| File / area | Today | This story |
|-------------|-------|------------|
| [`event-detail-header.html`](../../apps/web/src/app/pages/event-detail/event-detail-header.html) | `app-context-breadcrumb` with `omitEventFromBreadcrumb` | Chevron + projected title + admin gear |
| [`event-detail.html`](../../apps/web/src/app/pages/event-detail/event-detail.html) | Title row + status above tabs | Title in header ; status on Équipe tab |
| [`event-infos-tab.html`](../../apps/web/src/app/pages/event-detail/event-infos-tab.html) | Starts with optional description, then Date… | **Saison** block last (chips) |
| Admin event participants | Full breadcrumb + mobile H1 | **Unchanged** (AC 9) |
| [`context-breadcrumb`](../../apps/web/src/app/shared/context-breadcrumb/) | Shared component | **Keep** — still used season workspace, admin, troupe settings |

### Back navigation implementation guardrails

```typescript
// Recommended pattern (Angular 21 + Location API)
private readonly location = inject(Location)
private readonly router = inject(Router)

protected onBack(): void {
  const state = this.location.getState() as { navigationId?: number } | null
  const hasAppHistory =
    typeof state?.navigationId === 'number' && state.navigationId > 1
  if (hasAppHistory) {
    this.location.back()
    return
  }
  const fallback = getLastMemberEntryPath() ?? '/agenda'
  void this.router.navigateByUrl(fallback)
}
```

- **`getLastMemberEntryPath()`** reads `localStorage` key `lastMemberEntryPath` ; allowlist in [`isPersistableMemberEntryPath`](../../apps/web/src/app/core/navigation/last-member-entry-path-storage.ts) — today: `/accueil`, `/agenda`, `/membre/:slug`, `/saison/:slug`, `/saison/:troupeSlug/:seasonSlug` ; **not** event URLs.
- **No `NavigationHistoryService`** exists in repo — do **not** invent one ; use `Location` + storage helper above.
- **Member shell** persists entry path on `NavigationEnd` ([`member-shell.ts`](../../apps/web/src/app/layout/member-shell/member-shell.ts)) — extending allowlist to `/troupes/:slug` improves back from events opened via **Ma troupe** hub teaser.

### Infos Saison content

| Element | Rule |
|---------|------|
| Section label | **Saison** — `.event-infos__label` |
| Navigation | Two **`mat-chip`** links — `{troupeName}`, `{seasonTitle}` — centered in `.event-infos__scope-chips` |
| Placement | **Last** Infos block (after Catégorie) |
| Visibility | Render when `troupeName` and `seasonTitle` trimmed non-empty |

### Target chrome (all breakpoints — as-shipped)

```text
┌─────────────────────────────────────┐
│ [←] Cabaret d'été…           [⚙]?  │  ← titre inline (ED2)
├─────────────────────────────────────┤
│     [ Infos | Dispos | Équipe ]     │
├─────────────────────────────────────┤
│ Infos: Date · Lieu · … · Catégorie  │
│   Saison  [ Les Improbots ] [ 25-26]│  ← chips (ED4)
│ Équipe: [ Confirmé ] [ ? ] · grille │
└─────────────────────────────────────┘
```

### Frontend implementation guardrails

| Concern | Action |
|--------|--------|
| Reuse | `troupeHubPath`, `saisonWorkspacePath`, `getLastMemberEntryPath`, existing Infos SCSS patterns |
| Do not | Remove breadcrumb from season workspace, admin pages, or troupe settings ; add new API |
| Header sticky | Preserve `.event-detail-header` sticky + title ellipsis on mobile |
| Regression | Admin gear mobile fixed position ; draft banner ; tab lazy-load (**perf-03**) |

### Explicit non-goals

| Item | Story |
|------|-------|
| Hub dashboard / mini-chart | **17.42** / **17.44** |
| Nav shell Ma troupe tab | **17.41** (done) |
| Change title row / pill tabs / Infos field semantics beyond ED4–ED5 | **17.37**, **17.14** |
| Breadcrumb on admin event participants | Unchanged |
| Post-login routing changes | Unchanged |

### Dependencies

| Story | Status | Relationship |
|-------|--------|--------------|
| **17.41** | done | Nav + `lastVisitedTroupeSlug` — prerequisite |
| **17.42** | done | Hub breadcrumb removed ; parallel context work |
| **17.37** | done | Title row baseline — superseded by inline header + Équipe badge (ED2, ED5) |
| **17.20** | done | `lastMemberEntryPath` storage — back fallback |
| **17.6** | done | Slug URLs — unchanged |
| **17.44** | backlog | Independent |

### Previous story intelligence (17.42)

- Hub **removed** `troupe-hub__breadcrumb` — same product direction as this story for event detail.
- **`confirmedCompositionsCount`** / teaser patterns irrelevant here — Infos **Saison** chips replace hub card « Ouvrir la saison » CTA (**MT5** / **ED4** amend. 2026-06-12).
- **Stale async guards** (`slugRequestId`, `seasonDashboardRequestId`) — not needed on event detail header ; event detail already uses `loadRequestId` in `loadEvent`.
- **`/troupes/:slug`** in `isPersistableMemberEntryPath` — implemented for back fallback from hub.

### Git intelligence

Recent commits: **`8cb2611d`** `feat(web): Add troupe hub season dashboard` (**17.42**), **`9386fc6a`** Ma troupe nav (**17.41**). Event detail files last meaningfully touched for **title row / breadcrumb omit** (**17.37**, E8). Expect **`event-detail.spec.ts`** churn — many tests explicitly assert breadcrumb presence.

### Architecture compliance

- **Front-only** under `apps/web/` ; no API/OpenAPI changes.
- **Routes:** unchanged canonical event path `/saison/:troupeSlug/:seasonSlug/event/:eventSlug`.
- **ADR 0013:** Updated §2 for event detail without breadcrumb (2026-06-12 retro-doc).
- **Stack:** Angular **21.2** + Material **21.2** ; signals/`inject` patterns per [`project-context.md`](../../project-context.md).

### Library / framework notes

- **`Location.back()`** — [@angular/common](https://angular.dev/api/common/Location) ; pair with `getState()` for SPA history depth.
- **`mat-icon-button`** — standard M3 icon button ; icon **`arrow_back`** (not `chevron_left` unless matching adjacent screens — prefer wireframe `←`).
- No new npm dependencies.

### Testing

```bash
npm run test -w @hatcast/web -- --watch=false --include event-detail
npm run test -w @hatcast/web -- --watch=false --include event-infos-tab
npm run test -w @hatcast/web -- --watch=false --include last-member-entry-path
npm run build -w @hatcast/web
```

Manual smoke: open event from **workspace agenda** → back returns to workspace · open from **Mon agenda** → back to agenda · deep link / refresh → fallback `/agenda` or last entry path · Infos **Saison** chips · badge on **Équipe** only · admin gear · guest/403 paths · admin participants page still shows breadcrumb.

---

## Dev Agent Record

### Agent Model Used

dev-story agent (Cursor)

### Completion Notes List

- Removed `app-context-breadcrumb` from event detail header; added `mat-icon-button` back chevron (`arrow_back`, `aria-label="Retour"`) gated by `showEventHeaderBack`.
- Implemented `onBack()` via `Location.getState().navigationId` → `Location.back()` or `getLastMemberEntryPath() ?? '/agenda'`.
- **Post-impl refinements (Patrice recette 2026-06-12):**
  - Title **inline** in header (same row as chevron) via `ng-content` projection — removed separate title row above tabs.
  - Infos section renamed **Saison**, moved to **last** block ; **chips** (`mat-chip` + `routerLink`) instead of Contexte + stroked buttons.
  - Composition status badge relocated to **Équipe tab** top only (ED5) — removed from header.
- Extended `isPersistableMemberEntryPath` for `/troupes/:slug`.
- Tests pass ; build OK. Specs updated for header, infos, equipe tabs.
- **M3 checklist:** M3-1 ✓ ; M3-2 ✓ ; M3-3 ✓ ; M3-4 ✓ ; M3-5 ✓ (no waivers).
- **Docs:** ADR 0013 §2, FRONTEND_UI.md, UX specs (ED1–ED5) retro-documented.

### File List

- `apps/web/src/app/pages/event-detail/event-detail-header.html`
- `apps/web/src/app/pages/event-detail/event-detail-header.ts`
- `apps/web/src/app/pages/event-detail/event-detail-header.scss`
- `apps/web/src/app/pages/event-detail/event-detail-header.spec.ts` (new)
- `apps/web/src/app/pages/event-detail/event-detail.html`
- `apps/web/src/app/pages/event-detail/event-detail.ts`
- `apps/web/src/app/pages/event-detail/event-detail.scss`
- `apps/web/src/app/pages/event-detail/event-equipe-tab.html`
- `apps/web/src/app/pages/event-detail/event-equipe-tab.ts`
- `apps/web/src/app/pages/event-detail/event-equipe-tab.scss`
- `apps/web/src/app/pages/event-detail/event-equipe-tab.spec.ts`
- `apps/web/src/app/pages/event-detail/event-infos-tab.html`
- `apps/web/src/app/pages/event-detail/event-infos-tab.ts`
- `apps/web/src/app/pages/event-detail/event-infos-tab.scss`
- `apps/web/src/app/pages/event-detail/event-detail.spec.ts`
- `apps/web/src/app/pages/event-detail/event-infos-tab.spec.ts`
- `apps/web/src/app/core/navigation/last-member-entry-path-storage.ts`
- `apps/web/src/app/core/navigation/last-member-entry-path-storage.spec.ts`
- `apps/web/e2e/helpers/story-3-25.ui.ts`
- `apps/web/src/app/shared/composition/composition-equipe-status-header.scss`
- `apps/web/src/app/layout/member-shell/member-shell-mobile-chrome.scss`
- `docs/adr/0013-troupe-navigation-equity-tags-event-slugs.md`
- `docs/v2/technical/FRONTEND_UI.md`
- `docs/v1/technical/composition-status-messages.md`
- `_bmad-output/planning-artifacts/ux-design-ma-troupe-hub.md`
- `_bmad-output/planning-artifacts/ux-design-event-detail-title-row-2026-06-06.md`
- `_bmad-output/planning-artifacts/ux-design-journey-league-agenda.md`
- `_bmad-output/planning-artifacts/epics.md`

### Change Log

- 2026-06-12 : Story created (`bmad-create-story 17.43`).
- 2026-06-12 : Implementation — breadcrumb removed, back chevron, Infos context (dev-story).
- 2026-06-12 : Post-impl refinements — title inline header, Saison chips (last block), badge Équipe only ; UX/ADR/docs retro-doc (Sally).

---

### Validation create-story

- [x] AC métier numérotés et sourcés (epics / FR / UX ED1–ED5)
- [x] Section **Material 3** remplie
- [x] Tasks référencent les numéros d’AC (y compris M3-x)
- [x] Liens vers fichiers code existants à réutiliser
- [x] `npm run test` / build mentionnés
