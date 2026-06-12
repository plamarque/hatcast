---
baseline_commit: 8cb2611d06c41fbeab8c883cf7fbf1fa6f45a631
---

# Story 17.43: Event detail — Infos Contexte + breadcrumb removal

Status: ready-for-dev

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

## Story

As a **member**,  
I want the **event title** front and centre with troupe/season context in **Infos**,  
so that **mobile header space is not wasted** on a breadcrumb I rarely use.

## Acceptance Criteria

1. **Given** canonical event detail (`/saison/:troupeSlug/:seasonSlug/event/:eventSlug`) loaded, **when** the header renders, **then** **`app-context-breadcrumb` is absent** (no troupe › saison chrome in header). [Source: [ux-design-ma-troupe-hub.md](../planning-artifacts/ux-design-ma-troupe-hub.md) ED1, ED-AC1 ; epics 17.43]
2. **Given** the same surface, **when** the header renders, **then** a **chevron back** control appears top-left (`mat-icon-button`, icon `arrow_back`), **`aria-label="Retour"`** (not « Mon agenda » or « Retour à l’agenda »). [Source: ED2, ED3, ED-AC2, ED-AC4 ; M3-4]
3. **Given** tap on chevron back, **when** the SPA has **prior in-app navigation** (detect via Angular `Location` / router history — e.g. `history.state.navigationId > 1`), **then** call **`Location.back()`** ; **when** no in-app history (deep link, new tab, refresh), **then** navigate to **`getLastMemberEntryPath()`** if persistable, else **`/agenda`**. [Source: ED3 ; [last-member-entry-path-storage.ts](../../apps/web/src/app/core/navigation/last-member-entry-path-storage.ts)]
4. **Given** event loaded with troupe + season context resolved, **when** the **title row** renders, **then** `h1.event-detail__event-title` + composition status badge behaviour is **unchanged** (E7–E9, story **17.37**). [Source: [ux-design-event-detail-title-row-2026-06-06.md](../planning-artifacts/ux-design-event-detail-title-row-2026-06-06.md) ; ED-AC4]
5. **Given** event loaded, **when** admin permissions grant scope menu items, **then** **`app-scope-admin-menu`** in header right is **unchanged** (E1–E2) including mobile fixed gear placement via [`member-shell-mobile-chrome.scss`](../../apps/web/src/app/layout/member-shell/member-shell-mobile-chrome.scss). [Source: ED2, ED-AC4]
6. **Given** tab **Infos** active and context signals populated, **when** the tab body renders, **then** the **first block** is section **Contexte** with line `{troupeName} · {seasonTitle}` and actions **Ouvrir la saison** → `saisonWorkspacePath(troupeSlug, seasonSlug)` and **Voir la troupe** → `troupeHubPath(troupeSlug)` (`mat-stroked-button` or `mat-button` text links — match existing Infos action density). [Source: ED4, ED-AC3]
7. **Given** Infos tab after Contexte, **when** rendered, **then** existing fields (description, Date, Lieu, Format, Organisateur·ices, Catégorie) remain **unchanged in order and behaviour** (E10, stories **17.14–17.15**, **17.39**). [Source: ED4 ; title row spec]
8. **Given** loading, 403, 404, or missing context states, **when** header/title row rules from today apply, **then** **do not** show back chevron or Contexte with stale/empty names — mirror current guards (no context row while loading). [Source: existing `event-detail.spec.ts` loading guards]
9. **Given** admin sub-pages under event scope (e.g. [`admin-event-participants`](../../apps/web/src/app/pages/admin-event-participants/admin-event-participants.html)), **when** rendered, **then** **`app-context-breadcrumb` with event title + leaf remains** — **do not** apply ED1 to admin routes. [Source: ux-design-event-detail-title-row § Admin sub-pages]
10. **Given** implementation complete, **when** `npm run test -w @hatcast/web -- --watch=false --include event-detail` and `npm run build -w @hatcast/web`, **then** they pass with specs covering: no breadcrumb on event detail, back chevron present + fallback navigation, Contexte section content + links, title row preserved, admin sub-page breadcrumb unchanged (regression via existing admin specs). [Source: repo norms]

**Product coverage:** [ux-design-ma-troupe-hub.md](../planning-artifacts/ux-design-ma-troupe-hub.md) **ED1–ED4** ; supersedes partial **E8** in [ux-design-event-detail-title-row-2026-06-06.md](../planning-artifacts/ux-design-event-detail-title-row-2026-06-06.md). **Out of scope:** hub dashboard (**17.42** done), mini-chart (**17.44**), new BFF/API, removing **17.18** cross-nav from other surfaces, ADR file edit (note conflict below).

---

## Acceptance Criteria — Material 3 (UI)

**M3-1. Composants Material** — **Given** header back control and Infos Contexte actions, **when** rendered, **then** use `mat-icon-button` (chevron) and `mat-stroked-button` / `mat-button` for **Ouvrir la saison** / **Voir la troupe** ; reuse `app-scope-admin-menu` unchanged. [Source: FRONTEND_UI.md ; ED4]

**M3-2. Tokens & thème** — **Given** new/changed SCSS in header and Infos Contexte, **when** colors/spacing apply, **then** only `var(--mat-sys-*)` and `color-mix(in srgb, var(--mat-sys-…) …)` ; Contexte label follows Infos field pattern (`.event-infos__label`, section spacing). [Source: FRONTEND_UI.md]

**M3-3. Mobile & tactile** — **Given** ≤480px, **when** back chevron and Contexte buttons render, **then** touch targets **≥ 48×48 dp** ; chevron `aria-label="Retour"` ; header left reserves space so chevron does not overlap fixed account avatar (reuse `--member-shell-account-reserve` padding pattern from member shell). [Source: NFR-A1 ; member-shell-mobile-chrome.scss]

**M3-4. Navigation membre** — **Given** event detail under `MemberShell`, **when** delivered, **then** no new bottom app bar ; back chevron is **local escape**, not global nav replacement ; do not reintroduce breadcrumb on event detail. [Source: ux-hub-a-faire.md ; ED1]

**M3-5. Revue** — **Given** implementation done, **when** validated, **then** walk FRONTEND_UI.md checklist § M3 ; note waivers in Dev Agent Record. [Source: AGENTS.md]

---

## Tasks / Subtasks

- [ ] **Event header — remove breadcrumb, add back** (AC: 1, 2, 3, 5, 8)
  - [ ] Refactor [`event-detail-header.html`](../../apps/web/src/app/pages/event-detail/event-detail-header.html): remove `app-context-breadcrumb` ; add `mat-icon-button` with `arrow_back`, class e.g. `.event-detail-header__back`.
  - [ ] Update [`event-detail-header.ts`](../../apps/web/src/app/pages/event-detail/event-detail-header.ts): drop `ContextBreadcrumb` import ; inject `Location`, `Router` ; implement `onBack()` per ED3 (in-app history → `back()`, else `getLastMemberEntryPath() ?? '/agenda'`).
  - [ ] Adjust [`event-detail-header.scss`](../../apps/web/src/app/layout/member-shell/member-shell-mobile-chrome.scss) companion [`event-detail-header.scss`](../../apps/web/src/app/pages/event-detail/event-detail-header.scss): flex row `[back | spacer] … [admin]` ; min 48dp back target ; verify gear fixed corner still aligns when `--with-admin`.
  - [ ] Remove now-unused breadcrumb inputs from header **only if** parent no longer needs to pass them to header (context names move to Infos tab).

- [ ] **Infos tab — Contexte section** (AC: 6, 7)
  - [ ] Add inputs to [`event-infos-tab.ts`](../../apps/web/src/app/pages/event-detail/event-infos-tab.ts): `troupeName`, `seasonTitle` (required strings when context known).
  - [ ] Insert first block in [`event-infos-tab.html`](../../apps/web/src/app/pages/event-detail/event-infos-tab.html): section **Contexte** (`aria-labelledby`), summary line, two navigation actions via `routerLink` or `(click)` + `Router.navigate` using [`troupe-routes.ts`](../../apps/web/src/app/core/navigation/troupe-routes.ts) helpers.
  - [ ] Style in [`event-infos-tab.scss`](../../apps/web/src/app/pages/event-detail/event-infos-tab.scss): match existing Infos section rhythm ; action row wrap on narrow viewports.
  - [ ] Wire parent [`event-detail.html`](../../apps/web/src/app/pages/event-detail/event-detail.html): pass `contextTroupeName()`, `contextLeagueTitle()` (already resolved in [`event-detail.ts`](../../apps/web/src/app/pages/event-detail/event-detail.ts) ~L716–719).

- [ ] **Optional — back fallback from hub** (AC: 3 — recommended)
  - [ ] Extend [`isPersistableMemberEntryPath`](../../apps/web/src/app/core/navigation/last-member-entry-path-storage.ts) to allow `/troupes/:slug` (deferred from **17.41** / **17.42**) ; update [`last-member-entry-path-storage.spec.ts`](../../apps/web/src/app/core/navigation/last-member-entry-path-storage.spec.ts).
  - [ ] Ensure [`member-shell.ts`](../../apps/web/src/app/layout/member-shell/member-shell.ts) persists hub paths on `NavigationEnd` (should work once allowlist extended).

- [ ] **Tests & e2e touchpoints** (AC: 10)
  - [ ] Rewrite breadcrumb-centric cases in [`event-detail.spec.ts`](../../apps/web/src/app/pages/event-detail/event-detail.spec.ts) (e.g. « does not render header settings or back chevron after breadcrumb refactor » → expect back chevron **present**, breadcrumb **absent**).
  - [ ] Add specs: back calls `Location.back()` when navigationId > 1 ; fallback to `/agenda` ; fallback to stored `lastMemberEntryPath` when no history.
  - [ ] Add [`event-infos-tab.spec.ts`](../../apps/web/src/app/pages/event-detail/event-infos-tab.spec.ts) cases: Contexte first, links hrefs, hidden when names empty (if guarded).
  - [ ] Review [`apps/web/e2e/helpers/story-3-25.ui.ts`](../../apps/web/e2e/helpers/story-3-25.ui.ts) — breadcrumb locators used to reach season from event may need alternate navigation (Contexte **Ouvrir la saison** or direct URL) ; update only if e2e breaks.

- [ ] **Docs note (non-blocking)** — ADR [0013 §2](../../docs/adr/0013-troupe-navigation-equity-tags-event-slugs.md) still describes event breadcrumb ; flag in Dev Agent Record — **do not** block story on ADR edit unless PO requests.

---

## Dev Notes

### Product and UX rules

- **JTBD:** Event detail = **personal action surface** (dispo, équipe, infos) ; troupe/saison context is **secondary** — discoverable in Infos, not permanent header chrome (**ED1**, Screen 6 amended [ux-design-journey-league-agenda.md](../planning-artifacts/ux-design-journey-league-agenda.md)).
- **Title row is sacred:** Do not move event title back into breadcrumb or duplicate in Contexte — Contexte shows **troupe · saison** only (**ED4**).
- **Back ≠ Mon agenda:** Label **Retour** ; destination depends on history/fallback (**ED3**) — same pattern as journey Screen 6 table.
- **17.18 cross-nav:** PO confirmed **2026-06-12** (via **17.42**) — do **not** remove Mon agenda / Ma saison shortcuts from **season** or **agenda** headers ; event detail currently has **no** `member-cross-nav` — no action required.
- **403 handling unchanged:** [`event-detail.ts`](../../apps/web/src/app/pages/event-detail/event-detail.ts) already redirects to `/agenda` on 403 — independent of chevron.

### Current state (must read before edit)

| File / area | Today | This story |
|-------------|-------|------------|
| [`event-detail-header.html`](../../apps/web/src/app/pages/event-detail/event-detail-header.html) | `app-context-breadcrumb` with `omitEventFromBreadcrumb` | Chevron back only (left) + admin gear (right) |
| [`event-detail-header.ts`](../../apps/web/src/app/pages/event-detail/event-detail-header.ts) | `showBreadcrumb` computed from troupe/season/event titles | Back handler + drop breadcrumb deps |
| [`event-detail.html`](../../apps/web/src/app/pages/event-detail/event-detail.html) | Passes troupe/season context to header | Pass context **names** to `app-event-infos-tab` ; header may only need admin items |
| [`event-infos-tab.html`](../../apps/web/src/app/pages/event-detail/event-infos-tab.html) | Starts with optional description, then Date… | **Contexte** block first, then description… |
| [`event-detail.spec.ts`](../../apps/web/src/app/pages/event-detail/event-detail.spec.ts) | Asserts breadcrumb links, **no** back chevron | Invert: no breadcrumb, back + Contexte |
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

### Infos Contexte content

| Element | Rule |
|---------|------|
| Section label | **Contexte** — `.event-infos__label` |
| Summary | `{troupeName} · {seasonTitle}` — middle dot separator, wrap allowed |
| **Ouvrir la saison** | Primary navigation to workspace ; exact French label |
| **Voir la troupe** | Link to `/troupes/:slug` ; exact French label |
| Visibility | Render when `troupeName` and `seasonTitle` trimmed non-empty (same gate as old `showBreadcrumb`) |

### Target chrome (all breakpoints)

```text
┌─────────────────────────────────────┐
│ [←]                        [⚙]?    │
├─────────────────────────────────────┤
│ Cabaret d'été           [ Confirmé ]│  ← title row (unchanged)
├─────────────────────────────────────┤
│     [ Infos | Dispos | Équipe ]     │
├─────────────────────────────────────┤
│ Infos                               │
│   Contexte                          │
│     Les Improbots · Saison 2025-26  │
│     [ Ouvrir la saison ] [ Troupe ] │
│   Date · Lieu · …                   │
└─────────────────────────────────────┘
```

### Frontend implementation guardrails

| Concern | Action |
|--------|--------|
| Reuse | `troupeHubPath`, `saisonWorkspacePath`, `getLastMemberEntryPath`, existing Infos SCSS patterns |
| Do not | Remove breadcrumb from season workspace, admin pages, or troupe settings ; add new API ; change title row / pill tabs |
| Header sticky | Preserve `.event-detail-header` sticky + `--event-detail-shell-bg` behaviour |
| Perf | No new network calls — context names already on event page bootstrap |
| Regression | Admin gear mobile fixed position ; draft banner above title row ; tab lazy-load (**perf-03**) |

### Explicit non-goals

| Item | Story |
|------|-------|
| Hub dashboard / mini-chart | **17.42** / **17.44** |
| Nav shell Ma troupe tab | **17.41** (done) |
| Change title row / pill tabs / Infos field semantics | **17.37**, **17.14** |
| Breadcrumb on admin event participants | Unchanged |
| ADR 0013 file update | Optional follow-up |
| Post-login routing changes | Unchanged |

### Dependencies

| Story | Status | Relationship |
|-------|--------|--------------|
| **17.41** | done | Nav + `lastVisitedTroupeSlug` — prerequisite |
| **17.42** | done | Hub breadcrumb removed ; parallel context work |
| **17.37** | done | Title row — must preserve |
| **17.20** | done | `lastMemberEntryPath` storage — back fallback |
| **17.6** | done | Slug URLs — unchanged |
| **17.44** | backlog | Independent |

### Previous story intelligence (17.42)

- Hub **removed** `troupe-hub__breadcrumb` — same product direction as this story for event detail.
- **`confirmedCompositionsCount`** / teaser patterns irrelevant here — but **Ouvrir la saison** on event Infos (**ED4**) stays even though hub card CTA was removed (**MT5** amend. 2026-06-12).
- **Stale async guards** (`slugRequestId`, `seasonDashboardRequestId`) — not needed on event detail header ; event detail already uses `loadRequestId` in `loadEvent`.
- **Optional deferred:** `/troupes/:slug` in `isPersistableMemberEntryPath` — carry forward into this story as recommended optional task.

### Git intelligence

Recent commits: **`8cb2611d`** `feat(web): Add troupe hub season dashboard` (**17.42**), **`9386fc6a`** Ma troupe nav (**17.41**). Event detail files last meaningfully touched for **title row / breadcrumb omit** (**17.37**, E8). Expect **`event-detail.spec.ts`** churn — many tests explicitly assert breadcrumb presence.

### Architecture compliance

- **Front-only** under `apps/web/` ; no API/OpenAPI changes.
- **Routes:** unchanged canonical event path `/saison/:troupeSlug/:seasonSlug/event/:eventSlug`.
- **ADR 0013:** Code supersedes ADR §2 event breadcrumb wording — implementation follows [ux-design-ma-troupe-hub.md](../planning-artifacts/ux-design-ma-troupe-hub.md) (approved 2026-06-10).
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

Manual smoke: open event from **workspace agenda** → back returns to workspace · open from **Mon agenda** → back to agenda · deep link / refresh → fallback `/agenda` or last entry path · Infos **Contexte** links · admin gear · guest/403 paths · admin participants page still shows breadcrumb.

---

## Dev Agent Record

### Agent Model Used

*(dev-story agent)*

### Completion Notes List

*(empty)*

### File List

*(empty — to be filled by dev-story)*

### Change Log

- 2026-06-12 : Story created (`bmad-create-story 17.43`).

---

### Validation create-story

- [x] AC métier numérotés et sourcés (epics / FR / UX ED1–ED4)
- [x] Section **Material 3** remplie
- [x] Tasks référencent les numéros d’AC (y compris M3-x)
- [x] Liens vers fichiers code existants à réutiliser
- [x] `npm run test` / build mentionnés
