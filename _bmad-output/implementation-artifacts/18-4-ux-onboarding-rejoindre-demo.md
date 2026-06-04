# Story 18.4: UX onboarding — join Demo troupe, context, redirect

Status: done

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

## Story

As a **new user without a troupe**,  
I want a clear **Rejoindre la troupe de démonstration** journey,  
so that **I land on the Demo agenda** and understand it is a sandbox.

## Acceptance Criteria

1. **Given** `/troupes` with no membership, **when** the user clicks **Rejoindre la troupe de démonstration**, **then** the app calls `POST /v1/troupes/{id}/memberships/me` with `environment.demoTroupeId` = `a0000001-0000-4000-8000-000000000099` (prod Démo UUID from [ADR-0015](../../docs/adr/0015-v2-demo-troupe-product-bootstrap.md)). [Source: epics 18.4 AC1; FR61]
2. **Given** a successful join, **when** the flow completes, **then** `TroupeContextService.reloadAndSelect(demoId)` runs, a success snackbar is shown, and the user is redirected to the Demo season workspace **`/saison/saison-2026-2027`** (fallback: `/troupes/demo` hub if season slug resolution fails). [Source: epics 18.4 AC2; FR64]
3. **Given** Demo troupe context (`isDemo === true`), **when** the member navigates saison surfaces, **then** sandbox affordances are: one-line helper on **`troupe-hub`** when `slug === 'demo'`: *« Bac à sable — crée ta troupe quand tu es prêt·e »*; context-switcher menu appends **« (Démo) »** to the troupe label when `isDemo`. **Amended (Story 18.4b, 2026-06-04):** no **`mat-chip`** in **`context-breadcrumb`** — troupe name « Démo » is sufficient; chip was redundant. [Source: epics 18.4 AC3; FR64; [18-4b](./18-4b-remove-breadcrumb-demo-chip.md)]
4. **Given** `demoTroupeId` is empty/falsy in environment, **when** join is attempted, **then** snackbar **« Troupe de démonstration indisponible. »** — preserve current behaviour. [Source: epics 18.4 AC4]
5. **Given** FR49 empty-agenda / no-participation states on **`/agenda`** and **`/accueil`**, **when** displayed, **then** copy mentions joining the Demo sandbox and offers a CTA to **`/troupes`** (empty membership section with join button) or an inline **`mat-stroked-button`** calling the same shared join flow. [Source: epics 18.4 AC5; FR49; cross-check Story 17.19 AC7]
6. **Given** the same join action on **`seasons-list`** (legacy route), **when** join succeeds, **then** behaviour matches AC2 (context reload + redirect to Demo season — not only reload seasons in place). [Source: epics 18.4; `seasons-list` parity]
7. **Product coverage:** FR61, FR64, FR49; surfaces `troupes-list`, `seasons-list`, `user-agenda`, `member-home-todo`, `context-breadcrumb`, `context-switcher`, `troupe-hub`. **Out of scope:** prod CI env injection (**18.5**), backend API changes (**18.2** done), Les Improbots seed (**18.0**).

---

## Acceptance Criteria — Material 3 (UI)

**M3-1. Composants Material** — **Given** join CTAs and Demo badge, **when** rendered, **then** use `mat-flat-button` / `mat-stroked-button` for join actions, `mat-chip` for **« Démo »** badge, `MatSnackBar` for feedback — no custom clickable divs. [Source: FRONTEND_UI.md ; UX-DR11]

**M3-2. Tokens & thème** — **Given** Demo chip and hub hint banner SCSS, **when** colors apply, **then** only `var(--mat-sys-*)` and `color-mix(in srgb, var(--mat-sys-…) …)` ; chip uses secondary or tertiary container tokens. [Source: FRONTEND_UI.md]

**M3-3. Mobile & tactile** — **Given** viewport **max-width: 480px**, **when** join buttons and Demo chip render, **then** tap targets **≥ 48×48 dp** ; Demo chip remains visible when troupe name is hidden in breadcrumb (mobile hides name per 17.1 — show chip beside logo or include « Démo » in troupe link `aria-label`). [Source: NFR-A1 ; context-breadcrumb.scss]

**M3-4. Navigation membre** — **Given** member surfaces, **when** this story adds UI, **then** top app bar M3 only — **no** bottom app bar M2. [Source: ux-hub-a-faire.md]

**M3-5. Revue** — **Given** implementation done, **when** validated, **then** checklist § « Checklist M3 HatCast » in [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md) is walked ; waivers noted in Dev Agent Record. [Source: AGENTS.md]

---

## Tasks / Subtasks

- [x] **Scope:** `apps/web/` only — shared join flow, env UUID, badge, empty copy, specs. **Do not** change `services/api/`.

- [x] **Constants & env** (AC: 1, 4)
  - [x] Add [`apps/web/src/app/core/troupes/demo-troupe.constants.ts`](../../apps/web/src/app/core/troupes/demo-troupe.constants.ts):
    - `DEMO_TROUPE_ID = 'a0000001-0000-4000-8000-000000000099'`
    - `DEMO_TROUPE_SLUG = 'demo'`
    - `DEMO_ACTIVE_SEASON_SLUG = 'saison-2026-2027'`
  - [x] Set `demoTroupeId` to `DEMO_TROUPE_ID` in [`environment.ts`](../../apps/web/src/environments/environment.ts), [`environment.development.ts`](../../apps/web/src/environments/environment.development.ts), and default in [`apps/web/scripts/inject-google-client-id.mjs`](../../apps/web/scripts/inject-google-client-id.mjs).
  - [x] Update KDoc comment: Improbots `…000001` is dev seed only; join button targets prod Démo bootstrap (`…000099`, migration V33+).

- [x] **Extend API types** (AC: 3)
  - [x] Add `isDemo: boolean` and `joinPolicy: 'OPEN' | 'INVITE_ONLY'` to [`TroupeListItem`](../../apps/web/src/app/core/troupes/troupe-api.service.ts) (API already returns them per [`TroupeListItemDto`](../../services/api/src/main/kotlin/com/hatcast/api/troupe/dto/TroupeDtos.kt) / OpenAPI).
  - [x] Update test mocks (`troupes-list.spec.ts`, `seasons-list.spec.ts`, context-switcher specs) with `isDemo: false` defaults.

- [x] **Shared join service** (AC: 1, 2, 4, 6)
  - [x] Create [`DemoTroupeJoinService`](../../apps/web/src/app/core/troupes/demo-troupe-join.service.ts) (+ `.spec.ts`):
    1. Read `environment.demoTroupeId` — if falsy → snack « Troupe de démonstration indisponible. » → return `{ ok: false, reason: 'unavailable' }`.
    2. `troupeApi.joinTroupe(demoId)` — on failure → snack « Impossible de rejoindre la troupe de démonstration. »
    3. On success → snack « Tu as rejoint la troupe de démonstration. » (4s)
    4. `troupeContext.reloadAndSelect(demoId)` — on failure → snack reload error (reuse seasons-list wording)
    5. `rememberLastVisitedSeasonSlug(DEMO_ACTIVE_SEASON_SLUG, demoId)` from [`last-visited-league-storage`](../../apps/web/src/app/core/navigation/last-visited-league-storage.ts)
    6. `router.navigate(saisonWorkspacePath(DEMO_ACTIVE_SEASON_SLUG))` — optional resolver verify; fallback `troupeHubPath(DEMO_TROUPE_SLUG)`
  - [x] Expose `joining` signal or return promise so callers can disable buttons / show spinner.

- [x] **`troupes-list` post-join flow** (AC: 1, 2)
  - [x] Replace inline [`joinDemoTroupe()`](../../apps/web/src/app/pages/troupes-list/troupes-list.ts) with `DemoTroupeJoinService` (currently only `loadTroupes()` — **gap** vs readiness report).
  - [x] Keep empty-state UI in [`troupes-list.html`](../../apps/web/src/app/pages/troupes-list/troupes-list.html) (already shipped in 17.3).

- [x] **`seasons-list` parity** (AC: 6)
  - [x] Refactor [`joinDemoTroupe()`](../../apps/web/src/app/pages/seasons-list/seasons-list.ts) to use shared service + redirect (remove stop-after-`loadSelectedTroupeSeasons`).

- [x] **Demo badge & copy** (AC: 3)
  - [x] [`context-breadcrumb`](../../apps/web/src/app/shared/context-breadcrumb/): input `troupeIsDemo` (boolean) → `mat-chip` **Démo** after troupe name; extend `troupeAriaLabel` to include « troupe Démo » when true.
  - [x] [`season-header`](../../apps/web/src/app/pages/season-home/season-header.ts): pass `troupeIsDemo` from `season-home` (`resolved.troupe.isDemo`).
  - [x] [`context-switcher.html`](../../apps/web/src/app/shared/context-switcher/context-switcher.html): append ** (Démo)** when `troupe.isDemo`.
  - [x] [`troupe-hub.html`](../../apps/web/src/app/pages/troupe-hub/troupe-hub.html): conditional hint banner when troupe slug is `demo` (use constants).

- [x] **FR49 empty states** (AC: 5)
  - [x] [`user-agenda.html`](../../apps/web/src/app/pages/user-agenda/user-agenda.html) `noParticipation` block: update copy to mention Demo sandbox + CTA (link `/troupes` or inline join via service).
  - [x] [`member-home-todo.html`](../../apps/web/src/app/pages/member-home-todo/member-home-todo.html) `noParticipation` block: align copy/CTA with agenda (17.19 AC7 currently « Découvrir les troupes » only).

- [x] **Tests** (AC: 1–6, M3)
  - [x] `demo-troupe-join.service.spec.ts`: join API call with `…000099`, context reload, navigation to `/saison/saison-2026-2027`, unavailable env, API error.
  - [x] `troupes-list.spec.ts`: join button triggers service / navigates.
  - [x] `seasons-list.spec.ts`: assert navigation after join (not only list reload).
  - [x] `context-breadcrumb` or `season-header.spec.ts`: Demo chip when `troupeIsDemo`.
  - [x] `user-agenda.spec.ts` / `member-home-todo.spec.ts`: empty copy mentions démonstration.
  - [x] Run `npm run test -w @hatcast/web -- --watch=false`.

---

## Dev Notes

### Why this story exists (Epic 18 — frontend onboarding)

| Context | Detail |
|---------|--------|
| **18.1 (done)** | `join_policy`, `is_demo` on API DTOs |
| **18.2 (done)** | Self-join OPEN + Demo season participant enrollment |
| **18.3 (review)** | Flyway bootstrap: troupe **Démo** `…000099`, season **`saison-2026-2027`**, ~20 events |
| **This story** | Wire UI join → correct UUID, post-join redirect, sandbox affordances |
| **18.5 next** | Prod build secrets, integration smoke, deprecate `HATCAST_SEED_TROUPE_ID` |

### Current runtime gaps (do not re-discover)

| Surface | Today | Target |
|---------|-------|--------|
| `environment.demoTroupeId` | `…000001` (Les Improbots) | `…000099` (Démo bootstrap) |
| `troupes-list.joinDemoTroupe` | API + reload list only | Shared service + redirect to saison |
| `seasons-list.joinDemoTroupe` | Reload context, stay on `/seasons` | Same redirect as troupes-list |
| Demo badge | None | Breadcrumb chip + switcher suffix + hub hint |
| `/agenda`, `/accueil` empty | « Découvrir les troupes » | Mention Demo + join path |

**Important:** Local dev now has **both** Improbots (`db/seed`, `…000001`) and Démo (`db/migration`, `…000099`) after API startup. Join button must target **Démo only** — not Improbots.

### Badge placement decision (readiness report UX gap — resolved here)

| Location | Rationale |
|----------|-----------|
| ~~**`context-breadcrumb` `mat-chip`**~~ | **Superseded by 18.4b** — troupe name « Démo » in trail suffices |
| **`context-switcher` menu suffix** | Clarifies which troupe is sandbox when switching |
| **`troupe-hub` hint line** | Explains sandbox purpose before entering a season |

Do **not** add a second bottom bar or persistent banner on `/agenda`.

### Recommended join flow (implement in `DemoTroupeJoinService`)

```typescript
// Pseudocode — reuse existing services
const demoId = environment.demoTroupeId?.trim()
if (!demoId) { snack unavailable; return }

const jr = await troupeApi.joinTroupe(demoId)
if (!jr.ok) { snack error; return }

snack success
const refreshed = await troupeContext.reloadAndSelect(demoId)
if (!refreshed) { snack reload error; return }

rememberLastVisitedSeasonSlug(DEMO_ACTIVE_SEASON_SLUG, demoId)
await router.navigate(saisonWorkspacePath(DEMO_ACTIVE_SEASON_SLUG))
// Optional: TroupeSeasonResolverService.verify — on not-found → troupeHubPath('demo')
```

Reference implementation today (partial — **copy redirect pattern, not duplicate logic**):

```109:132:apps/web/src/app/pages/seasons-list/seasons-list.ts
  protected async joinDemoTroupe(): Promise<void> {
    const demoId = environment.demoTroupeId
    // ... join + reloadAndSelect + loadSelectedTroupeSeasons — MISSING navigate
  }
```

```87:101:apps/web/src/app/pages/troupes-list/troupes-list.ts
  protected async joinDemoTroupe(): Promise<void> {
    // ... join + loadTroupes only — MISSING context + navigate + snack success
  }
```

### API contract (no backend changes)

| Endpoint | Behaviour (18.2) |
|----------|------------------|
| `POST /v1/troupes/{id}/memberships/me` | OPEN troupes only; Demo also creates active season participant |
| `GET /v1/troupes` | Returns `isDemo`, `joinPolicy` per troupe — extend TS interface |

Demo troupe after bootstrap ([`DemoBootstrapIntegrationTest`](../../services/api/src/test/kotlin/com/hatcast/api/troupe/DemoBootstrapIntegrationTest.kt)):
- UUID `a0000001-0000-4000-8000-000000000099`
- `slug = demo`, `joinPolicy = OPEN`, `isDemo = true`
- Active season slug **`saison-2026-2027`**

### FR49 empty-state copy guidance (AC5)

Suggested French (tu, member tone):

| Screen | Title (keep) | Add / replace body + CTA |
|--------|--------------|----------------------------|
| `/agenda` no participation | « Aucune ligue pour l'instant » | « Rejoins la **troupe de démonstration** pour explorer HatCast en bac à sable. » + button or link to `/troupes` |
| `/accueil` no participation | « Rien en attente… » | Same Demo mention ; primary CTA can remain « Découvrir les troupes » **or** add stroked join button |

Avoid contradicting Story **17.19** hub structure — update copy/CTA only, do not redesign sections.

### Frontend implementation guardrails

| Concern | Action |
|--------|--------|
| Material | `mat-chip` for badge; `mat-stroked-button` for secondary join on empty states |
| Tokens | `--mat-sys-secondary-container` / `on-secondary-container` for Demo chip |
| Réutilisation | **One** `DemoTroupeJoinService` — DRY troupes-list, seasons-list, optional empty-state buttons |
| Routes | [`saisonWorkspacePath`](../../apps/web/src/app/core/navigation/troupe-routes.ts) — canonical `/saison/:slug` (not legacy `/ligue/`) |
| Tone | Informal **tu** on member surfaces (match existing empty states) |

### Explicit non-goals

| Out of scope | Owner |
|--------------|-------|
| Prod CI / secrets for `demoTroupeId` | **18.5** |
| Remove `hatcast.troupe.seed-troupe-id` | **18.5** |
| Backend join policy / bootstrap SQL | **18.2**, **18.3** |
| « Découvrir » public directory | Epic 17.3 stub |
| Analytics `is_demo` filter | Epic 11 |
| Change Les Improbots seed | **18.0** |

### Architecture compliance

- **Stack:** Angular 19+ standalone components, signals, Vitest (`npm run test -w @hatcast/web`).
- **No new npm dependencies.**
- **Member shell:** changes stay within existing routed pages + shared components under `apps/web/src/app/`.
- Read [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md) before UI edits.

### Testing standards

```bash
npm run test -w @hatcast/web -- --watch=false
npm run build -w @hatcast/web
```

Manual smoke (local `./scripts/start-dev.sh`):
1. Sign in as user with **zero** troupes → `/troupes` → join Demo → lands on **`/saison/saison-2026-2027`** with pedagogical events.
2. Breadcrumb shows **Démo** chip; hub `/troupes/demo` shows sandbox hint.
3. `/agenda` with no participation shows Demo guidance.
4. Clear `demoTroupeId` in env → join shows « indisponible ».

### Previous story intelligence (18.3)

- Bootstrap creates Demo at `…000099` via **`db/migration` V33–V37** (runs on `cloud` + local).
- Self-join enrolls season participant when `isDemo && active season` (18.2) — redirect to saison is required for user to see roster/events.
- `./gradlew test` includes `DemoBootstrapIntegrationTest` — frontend E2E not required in this story.

### Previous story intelligence (18.2)

- Any OPEN troupe can self-join; Demo additionally enrolls active season participant.
- Improbots remains OPEN but **`isDemo = false`** — no auto season enroll on join.

### Dependencies

| Story | Status | Relationship |
|-------|--------|--------------|
| **18.2** | done | **Blocks** — self-join + Demo season enrollment API |
| **18.3** | review | **Blocks** — Demo troupe + season data must exist locally (migration) |
| **17.3** | done | `/troupes` empty state + join button shell |
| **17.19** | done | `/accueil` empty state to align (AC5) |
| **17.23** | done | Context switcher — extend for Demo label |
| **18.5** | backlog | Prod env validation + API integration tests |

### Git intelligence (recent)

- `d72422f` — OPEN self-join + Demo bootstrap (18.2 + 18.3 code)
- `65620fd` — `join_policy` / `is_demo` columns (18.1)
- Frontend join UI predates Epic 18 — points at wrong UUID until this story

---

## Dev Agent Record

### Agent Model Used

Composer (Cursor)

### Completion Notes List

- `DemoTroupeJoinService` centralise join → reload contexte → mémorisation saison → navigation `/saison/saison-2026-2027` (fallback hub `/troupes/demo`).
- `demoTroupeId` pointe désormais vers `…000099` (Démo bootstrap) dans les env locaux et le script CI.
- Badge **Démo** : `mat-chip` dans le breadcrumb (desktop + mobile), suffixe dans le context-switcher, hint sur le hub troupe.
- États vides `/agenda` et `/accueil` : copy bac à sable + bouton join inline + lien troupes.
- **684 tests** passent ; build web OK.
- **Checklist M3** : M3-1 à M3-4 validés (mat-button/chip/snackbar, tokens `--mat-sys-*`, cibles ≥ 48dp, pas de bottom bar). M3-5 revue faite — aucune dérogation.

### File List

- `apps/web/src/app/core/troupes/demo-troupe.constants.ts` (new)
- `apps/web/src/app/core/troupes/demo-troupe-join.service.ts` (new)
- `apps/web/src/app/core/troupes/demo-troupe-join.service.spec.ts` (new)
- `apps/web/src/app/core/troupes/troupe-api.service.ts`
- `apps/web/src/environments/environment.ts`
- `apps/web/src/environments/environment.development.ts`
- `apps/web/scripts/inject-google-client-id.mjs`
- `apps/web/src/app/pages/troupes-list/troupes-list.ts`
- `apps/web/src/app/pages/seasons-list/seasons-list.ts`
- `apps/web/src/app/shared/context-breadcrumb/context-breadcrumb.ts`
- `apps/web/src/app/shared/context-breadcrumb/context-breadcrumb.html`
- `apps/web/src/app/shared/context-breadcrumb/context-breadcrumb.scss`
- `apps/web/src/app/shared/context-breadcrumb/context-breadcrumb.spec.ts`
- `apps/web/src/app/pages/season-home/season-header.ts`
- `apps/web/src/app/pages/season-home/season-header.html`
- `apps/web/src/app/pages/season-home/season-home.ts`
- `apps/web/src/app/pages/season-home/season-home.html`
- `apps/web/src/app/shared/context-switcher/context-switcher.html`
- `apps/web/src/app/pages/troupe-hub/troupe-hub.ts`
- `apps/web/src/app/pages/troupe-hub/troupe-hub.html`
- `apps/web/src/app/pages/troupe-hub/troupe-hub.scss`
- `apps/web/src/app/pages/user-agenda/user-agenda.ts`
- `apps/web/src/app/pages/user-agenda/user-agenda.html`
- `apps/web/src/app/pages/user-agenda/user-agenda.scss`
- `apps/web/src/app/pages/member-home-todo/member-home-todo.ts`
- `apps/web/src/app/pages/member-home-todo/member-home-todo.html`
- `apps/web/src/app/pages/member-home-todo/member-home-todo.scss`
- Specs/mocks mis à jour : troupes-list, seasons-list, context-breadcrumb, context-switcher-data, troupe-context, troupe-season-resolver, season-home, troupe-hub-preferences-sheet, admin-membres, user-agenda, member-home-todo

### Review Findings

- [x] [Review][Patch] Badge Démo absent sur `event-detail` [`event-detail-header.html`] — corrigé : `contextTroupeIsDemo` câblé depuis le resolver.
- [x] [Review][Patch] `mat-chip` imbriqué dans un lien `<a>` [`context-breadcrumb.html`] — corrigé : chip en sibling via `context-breadcrumb__troupe-group`.
- [x] [Review][Patch] Snackbar succès avant échec reload [`demo-troupe-join.service.ts`] — corrigé : snack succès après `reloadAndSelect` réussi.
- [x] [Review][Patch] Test `seasons-list` ne valide pas la navigation post-join [`seasons-list.spec.ts`] — corrigé : test d’intégration avec `DemoTroupeJoinService` réel + assert navigation.

### Change Log

- 2026-05-28 : Story **18.4** created via `bmad-create-story` — Demo join UX, redirect, badge, FR49 empty copy (FR61, FR64, FR49).
- 2026-05-28 : Implémentation story **18.4** — service join partagé, UUID Démo, badge, empty states, tests.
- 2026-05-28 : Code review BMad — 4 patch, 0 decision-needed, 2 defer, 2 dismiss.
- 2026-05-28 : Correctifs review (batch 0) — badge event-detail, chip hors lien, snack après reload, tests navigation.

---

### Validation create-story

- [x] AC métier numérotés et sourcés (epics / FR61 / FR64 / FR49)
- [x] Section **Material 3** remplie (UI story)
- [x] Tasks référencent les numéros d'AC (y compris M3-x)
- [x] Liens vers fichiers code existants à réutiliser
- [x] `npm run test -w @hatcast/web` mentionné
- [x] Badge placement decision documented (readiness report gap)
- [x] UUID `…000099` vs Improbots `…000001` separation explicit
- [x] Scope boundary with **18.5** (prod CI) explicit
