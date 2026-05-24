# Story 2.9: Post-login and last visited league (V1 parity)

Status: done

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

## Story

As a **signed-in member**,
I want to **resume my last visited league workspace** after sign-in,
so that **I avoid a useless `/accueil` stub** and land directly in the season agenda I was using.

## Acceptance Criteria

1. **Given** a valid session immediately after sign-in (Google or email/password), **when** post-login routing completes, **then** the user is **never** left on the `/accueil` placeholder card. [Source: `_bmad-output/planning-artifacts/epics.md#story-29`; `_bmad-output/planning-artifacts/sprint-change-proposal-2026-05-24-ux-journey-connexion-troupe-saison.md` §5.1 AC1; FR49 partial]
2. **Given** a stored league/season slug that resolves for the user via `TroupeSeasonResolverService` (`kind: 'resolved'`), **when** the user signs in or hits `/` (`AuthRedirect`), **then** navigate to `/saison/:slug` with default **agenda** view (`seasonView = 'agenda'` — same as opening the route without `view=history`). [Source: sprint-change-proposal AC2; UX-DR2 default tab; `apps/web/src/app/pages/season-home/season-home.ts`]
3. **Given** the user opens `/saison/:slug` and the season loads successfully (`resolved.kind === 'resolved'`), **when** load completes, **then** persist the slug in **localStorage** (minimum). Use V1-compatible key **`lastVisitedSeason`** (product term = ligue; API/code = season). [Source: `legacy/src/services/seasonPreferences.js`; sprint-change-proposal AC3; [plan-v2-league-journey.md](../_bmad-output/planning-artifacts/plan-v2-league-journey.md) Wave 0]
4. **Given** the user intentionally opens `/seasons`, **when** the list page initializes, **then** clear `lastVisitedSeason` (and optional timestamp key `lastVisitedSeasonTimestamp` if used) — V1 parity with [`legacy/src/views/SeasonsPage.vue`](../../legacy/src/views/SeasonsPage.vue) `onMounted`. [Source: sprint-change-proposal AC4]
5. **Given** no stored slug, or stored slug that does **not** resolve (`not-found`, `ambiguous`, `no-membership`, `error`), **when** post-login routing runs, **then** fallback to **`/seasons`** (not `/agenda` — Epic 12.5). [Source: sprint-change-proposal AC5; plan-v2 Wave 0 DoD]
6. **Given** an authenticated user navigates to `/accueil` (bookmark or old link), **when** the route is activated, **then** apply the **same** redirect logic as AC2/AC5 (`replaceUrl: true`). [Source: sprint-change-proposal AC6; epics Story 2.9]
7. **Given** slug resolution succeeds in a troupe other than the currently selected one, **when** redirecting to last visited league, **then** `TroupeContextService` must end up on the owning troupe (resolver already calls `selectTroupe` when needed — do not bypass). [Source: Story 2.4 AC5; `troupe-season-resolver.service.ts`]
8. **Given** this story is complete, **when** tests run, **then** unit tests cover storage read/write/clear, valid slug → `/saison/:slug`, invalid slug → `/seasons`, `/accueil` shim redirect; update existing specs that expect `/accueil` after login; `npm run test -w @hatcast/web -- --watch=false` and `npm run build -w @hatcast/web` succeed. [Source: sprint-change-proposal AC7]

## Tasks / Subtasks

- [x] **Core — last visited league storage** (AC: 3, 4)
  - [x] Add `apps/web/src/app/core/navigation/last-visited-league-storage.ts` (or `season-preferences.ts`): `getLastVisitedSeasonSlug()`, `rememberLastVisitedSeasonSlug(slug)`, `clearLastVisitedSeasonSlug()`.
  - [x] Keys: `lastVisitedSeason` (+ optional `lastVisitedSeasonTimestamp`) — **match V1** for any shared browser with legacy; prefix with `hatcast.` only if you migrate keys document both reads during transition.
  - [x] Guard `typeof localStorage === 'undefined'` (SSR/test).

- [x] **Core — post-login route resolver** (AC: 1, 2, 5, 6, 7)
  - [x] Add `PostLoginNavigationService` (or static helper) with `resolveAuthenticatedEntryUrl(): Promise<UrlTree | string[]>`:
    - Read stored slug → `TroupeSeasonResolverService.resolveSeasonSlug(slug)`.
    - If `resolved`: return `['/saison', slug]` (optional `queryParams: { view: 'agenda' }` only if needed to override history tab).
    - Else: return `['/seasons']`.
  - [x] Inject `Router` / use `Router.createUrlTree` for testability.
  - [x] **Do not** call API before session exists — run only after `ensureHatcastSession()` succeeds.

- [x] **Wire entry points** (AC: 1, 2, 5, 6)
  - [x] `AuthRedirect`: replace `navigate(['/accueil'])` with `PostLoginNavigationService`.
  - [x] `Login` (`onGoogleCredential`, `finishIdpSignIn`): same after successful sign-in.
  - [x] `ResetPassword`: same after successful reset + sign-in.
  - [x] `/accueil` route: replace `HomeSignedIn` component with thin redirect (reuse service) **or** guard on existing component — **no** “Bienvenue” stub in primary flow. Keep user menu reachable via `/compte` and season headers.
  - [x] `seasons-list`: on init, `clearLastVisitedSeasonSlug()`; remove or repoint header link `routerLink="/accueil"` (use no back link, or `routerLink="/seasons"` only if needed — **remove “Accueil”** label).
  - [x] `account-placeholder`: replace “Retour à l’accueil” → `/accueil` with “Retour aux saisons” → `/seasons` or last league via service.

- [x] **Persist on season load** (AC: 3)
  - [x] In `SeasonHome.loadTroupeAndSeason`, after `resolved.kind === 'resolved'`, call `rememberLastVisitedSeasonSlug(slug)`.
  - [x] Do **not** persist on `not-found` / `ambiguous` / error paths.

- [x] **Tests** (AC: 8)
  - [x] `last-visited-league-storage.spec.ts` — set/get/clear.
  - [x] `post-login-navigation.service.spec.ts` — mock resolver: resolved → saison route; not-found → seasons.
  - [x] Update `auth-redirect`, `login`, `reset-password` specs (no `/accueil` expectation).
  - [x] `season-home.spec.ts` — asserts `remember` called on successful load (spy).
  - [x] `seasons-list.spec.ts` — clear on init.
  - [x] Run full web test suite + build.

## Dev Notes

### Scope boundaries (Wave 0 — read first)

| In scope (2.9) | Out of scope (later stories) |
|----------------|------------------------------|
| localStorage `lastVisitedSeason` slug | Server-side user preference API |
| Post-login → `/saison/:slug` or `/seasons` | **`/agenda`** user hub (Epic **12.2**, finalize routing in **12.5**) |
| Deprecate `/accueil` as destination | Route alias `/ligue/:slug` (**12.6**) |
| Clear preference on `/seasons` visit | Deep link / notification URL priority (FR49 §1 — **12.5**) |
| Reuse `TroupeSeasonResolverService` for validity | Firebase `userPreferences` migration from V1 |
| Optional `view=agenda` query on redirect | `lastVisitedSeasonView` / tab memory (OPEN — defer) |

**Terminology:** UI/docs say **ligue**; storage key and routes remain **season** (`/saison/:slug`, `lastVisitedSeason`) until Epic 12.6 rename. [Source: ADR 0011; plan-v2-league-journey.md]

### Product routing priority (full FR49 vs this story)

Full FR49 priority (PRD): (1) deep link → (2) last league → (3) `/agenda` → (4) empty state.

**Story 2.9 implements (2) with fallback `/seasons` only.** Story **12.5** will change fallback from `/seasons` to `/agenda` and add deep-link handling. Do not implement `/agenda` or `GET /v1/me/agenda` here.

### V1 reference implementation

```14:28:legacy/src/services/seasonPreferences.js
export async function rememberLastVisitedSeason(seasonSlug) {
  if (!seasonSlug) return
  // localStorage lastVisitedSeason + optional Firestore userPreferences
}
```

```337:350:legacy/src/views/HomePage.vue
async function handlePostLoginNavigation() {
  const lastSeason = await getLastVisitedSeason()
  if (lastSeason) {
    router.push(`/season/${lastSeason}`)
    return
  }
  router.push('/seasons')
}
```

V2 has **no Firestore** for preferences — **localStorage only** in this story (architecture allows server preference later).

### Current V2 gaps (must fix)

| File | Current behaviour | Target |
|------|-------------------|--------|
| `auth-redirect.ts` | `navigate(['/accueil'])` | Post-login service |
| `login.ts` | same (×2) | same |
| `reset-password.ts` | same | same |
| `home-signed-in.html` | Stub + link to `/seasons` | Redirect only |
| `seasons-list.html` | Back → `/accueil` | Remove/repoint |
| `account-placeholder.html` | Back → `/accueil` | `/seasons` |

### Validation rules (do not reinvent)

- **Do not** validate slug with a hand-rolled seasons list loop in every caller — **always** use `TroupeSeasonResolverService.resolveSeasonSlug(slug)` so Story 2.4 multi-troupe rules apply (selected troupe first, auto-switch troupe, ambiguous → fallback).
- **Archived / inactive season:** If API returns 404/403 for `by-slug`, resolver returns `not-found` → fallback `/seasons` and optionally clear stale storage in resolver path (product choice: clear on failed resolve to avoid redirect loops).

### Architecture compliance

- **Stack:** Angular 19 standalone, Material, `providedIn: 'root'` services under `apps/web/src/app/core/`.
- **Auth:** Session via `AuthApiService.ensureHatcastSession()` before troupe/season resolution (needs cookies).
- **No legacy edits:** Do not modify `legacy/`.
- **Normative docs:** [ADR 0011](../../docs/adr/0011-league-model-and-user-agenda.md) describes long-term `/agenda` hub — this story is explicitly the **Wave 0** interim documented in [plan-v2-league-journey.md](../_bmad-output/planning-artifacts/plan-v2-league-journey.md).

### Project structure notes

```
apps/web/src/app/core/navigation/
  last-visited-league-storage.ts
  post-login-navigation.service.ts
  *.spec.ts
```

Optional: export `navigateAfterSignIn(router: Router): Promise<boolean>` from service to avoid duplicating `ensureHatcastSession` in every page.

### Testing standards

- Vitest + Angular TestBed; mock `TroupeSeasonResolverService` and `TroupeContextService`.
- Prefer testing the navigation service in isolation, then thin integration tests on `AuthRedirect` / `Login`.
- Pattern: existing `apps/web/src/app/core/auth/hatcast-remember-me-storage.ts` for localStorage helpers.

### Previous story intelligence

- **Story 2.4** delivered `TroupeSeasonResolverService` and `TroupeContextService` — mandatory for slug validation and troupe switch on redirect. [Source: `2-4-navigation-entre-troupes.md`]
- **Story 2.7** uses `?view=agenda` and `?participant=` on `/saison/:slug` — post-login redirect does not need participant param unless PO adds tab memory later.
- **Story 3.3** delivered agenda/history tabs on `SeasonHome` — default view is agenda when no `view` query param.

### Git intelligence (recent patterns)

Recent commits focus on Epic 6 composition (`feat(composition): …`). Navigation/auth changes should stay isolated in `core/navigation` and auth pages; follow existing Conventional Commits `feat(web): …` or `feat(auth): …`.

### Latest tech information

No new npm dependencies required. Use existing `Router.navigate` / `UrlTree` APIs (Angular 19). GIS and Identity Platform flows unchanged from Epic 1.

### References

- [Source: `_bmad-output/planning-artifacts/epics.md` — Story 2.9]
- [Source: `_bmad-output/planning-artifacts/sprint-change-proposal-2026-05-24-ux-journey-connexion-troupe-saison.md` §5.1–5.2]
- [Source: `_bmad-output/planning-artifacts/plan-v2-league-journey.md` — Wave 0]
- [Source: `_bmad-output/planning-artifacts/prd.md` — FR49]
- [Source: `_bmad-output/planning-artifacts/ux-design-journey-league-agenda.md` — UX-DR13 (full target; partial here)]
- [Source: `docs/adr/0011-league-model-and-user-agenda.md`]
- [Source: `apps/web/src/app/core/troupes/troupe-season-resolver.service.ts`]
- [Source: `legacy/src/services/seasonPreferences.js`]

## Dev Agent Record

### Agent Model Used

Composer (dev-story workflow)

### Debug Log References

- `npm run test -w @hatcast/web -- --watch=false` — 214 tests passed
- `npm run build -w @hatcast/web` — success

### Completion Notes List

- Added V1-compatible `lastVisitedSeason` localStorage helpers and `PostLoginNavigationService` (resolve via `TroupeSeasonResolverService`, fallback `/seasons`, clear stale slug on failed resolve).
- Wired post-login navigation in `AuthRedirect`, `Login`, `ResetPassword`, and thin `/accueil` redirect (`HomeSignedIn`).
- Persist last slug on successful `SeasonHome` load; clear on `/seasons` init; removed Accueil back links.
- Unit tests for storage, navigation service, auth redirect, season home, seasons list; updated reset-password spec.

### File List

- apps/web/src/app/core/navigation/last-visited-league-storage.ts
- apps/web/src/app/core/navigation/last-visited-league-storage.spec.ts
- apps/web/src/app/core/navigation/post-login-navigation.service.ts
- apps/web/src/app/core/navigation/post-login-navigation.service.spec.ts
- apps/web/src/app/pages/auth-redirect/auth-redirect.ts
- apps/web/src/app/pages/auth-redirect/auth-redirect.spec.ts
- apps/web/src/app/pages/login/login.ts
- apps/web/src/app/pages/reset-password/reset-password.ts
- apps/web/src/app/pages/reset-password/reset-password.spec.ts
- apps/web/src/app/pages/home-signed-in/home-signed-in.ts
- apps/web/src/app/pages/season-home/season-home.ts
- apps/web/src/app/pages/season-home/season-home.spec.ts
- apps/web/src/app/pages/seasons-list/seasons-list.ts
- apps/web/src/app/pages/seasons-list/seasons-list.html
- apps/web/src/app/pages/seasons-list/seasons-list.spec.ts
- apps/web/src/app/pages/account-placeholder/account-placeholder.html

### Review Findings

- [x] [Review][Decision → A] Timestamp `lastVisitedSeasonTimestamp` — write supprimé (dead code) ; clear conservé pour compatibilité V1. Commentaire explicatif ajouté. [last-visited-league-storage.ts]
- [x] [Review][Patch] Branche morte dans `navigateAfterSignIn` — type de retour simplifié en `Promise<string[]>`, import `UrlTree` supprimé, corps réduit à une ligne. [post-login-navigation.service.ts]
- [x] [Review][Patch] Opérations localStorage sans try/catch — `get`, `set`, `remove` enveloppés avec fallback silencieux (SecurityError, quota Safari). [last-visited-league-storage.ts]
- [x] [Review][Patch] Aucune gestion d'erreur si `resolveSeasonSlug` rejette — try/catch ajouté dans `resolveAuthenticatedEntryUrl` avec fallback `/seasons` + clear slug. [post-login-navigation.service.ts]
- [x] [Review][Patch] Aucun test unitaire pour `HomeSignedIn` — `home-signed-in.spec.ts` créé (session KO → /connexion ; session OK → navigateAfterSignIn).
- [x] [Review][Patch] Aucun test pour resolver qui rejette — cas `mockRejectedValue` ajouté dans `post-login-navigation.service.spec.ts`.
- [x] [Review][Defer] Appels concurrents à `navigateAfterSignIn` (double-clic / double flux OAuth) — Aucun verrou in-flight dans `Login`. Pattern pré-existant avant cette story (la navigation `/accueil` avait le même problème). Pas introduit par 2.9. — deferred, pre-existing

### Change Log

- 2026-05-24: Story 2.9 — post-login routing to last visited league (`/saison/:slug`) or `/seasons`; V1 localStorage parity; `/accueil` deprecated as destination.
