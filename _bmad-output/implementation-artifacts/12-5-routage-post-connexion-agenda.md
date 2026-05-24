# Story 12.5: Finalize post-login routing to agenda

Status: done

<!-- Ultimate context engine analysis completed - comprehensive developer guide created -->

## Story

As a **signed-in member**,
I want to **land on Mon agenda or my last league after sign-in** (never a stub home),
so that **I resume action immediately** and notification or bookmark deep links still work.

## Acceptance Criteria

1. **Given** a successful sign-in (Google, email/password, or password reset → sign-in), **when** post-login routing completes, **then** the user is **never** left on `/accueil` or any stub “Bienvenue” screen. [Source: epics Story 12.5; FR49; UX-DR13]
2. **Given** a **valid pending deep link** (stored redirect or `returnUrl` query on `/connexion`), **when** post-login routing runs, **then** navigate to that **internal** path (path + query + hash) with `replaceUrl: true`, and **clear** the stored redirect after use. [Source: FR49 §1; UX-DR13 table row 1; architecture.md § Post-login routing]
3. **Given** **no** pending deep link and a stored `lastVisitedSeason` slug that resolves via `TroupeSeasonResolverService` (`kind: 'resolved'`), **when** post-login routing runs, **then** navigate to `/saison/:slug` (default agenda tab — no `view=history`). [Source: Story 2.9 AC2; FR49 §2]
4. **Given** **no** pending deep link and **no** resolvable last-league slug (missing, `not-found`, `ambiguous`, `no-membership`, resolver error), **when** post-login routing runs, **then** fallback to **`/agenda`** (not `/seasons`). [Source: epics Story 12.5; FR49 §3; plan-v2 Wave 0 DoD → Wave 1 finalize]
5. **Given** fallback to `/agenda` and the user has **no league participations**, **when** `/agenda` loads, **then** the existing empty state from Story 12.2 handles FR49 §4 (“Tu n'es inscrit·e à aucune ligue…”) — **do not** redirect again to `/seasons`. [Source: FR49 §4; Story 12.2 AC5]
6. **Given** an authenticated user opens `/accueil` or `/` (`AuthRedirect`), **when** the route activates, **then** apply the **same** priority chain as AC2–AC4. [Source: Story 2.9 AC6]
7. **Given** an **unauthenticated** user opens a **member route** (e.g. `/saison/:slug/event/:eventId`, `/agenda`, `/compte`), **when** the page redirects to `/connexion`, **then** persist the intended URL as a pending deep link **before** navigation so AC2 works after sign-in. [Source: FR49 §1; UX-DR13 “Deep links from notifications still work”]
8. **Given** a pending redirect or `returnUrl` value, **when** it is validated, **then** only **same-origin relative paths** starting with `/` are accepted; reject `//`, `http:`, `https:`, `javascript:`, and `/connexion` loops; invalid values are cleared and ignored (fall through to AC3–AC4). [Source: NFR-S1 open-redirect prevention; legacy `isValidRedirectPath` intent]
9. **Given** `/agenda` is opened directly (not via post-login), **when** the page loads, **then** **do not** clear `lastVisitedSeason` — last-league priority must remain for the next bare sign-in. [Source: Story 12.2 guardrail]
10. **Given** the user intentionally opens `/seasons`, **when** the list initializes, **then** **keep** clearing `lastVisitedSeason` (Story 2.9 AC4 unchanged). [Source: Story 2.9]
11. **Given** implementation complete, **when** tests run, **then** unit tests cover full priority chain (deep link → last league → `/agenda`), invalid redirect rejection, stale slug clear + `/agenda`, `/accueil` shim, and at least one “store redirect before login” path; `npm run test -w @hatcast/web -- --watch=false` and `npm run build -w @hatcast/web` succeed. [Source: NFR-Q1 FR49]

## Tasks / Subtasks

- [x] **Pending deep-link storage** (AC: 2, 7, 8)
  - [x] Add `apps/web/src/app/core/navigation/post-login-redirect-storage.ts` (+ spec):
    - `getPendingPostLoginRedirect(): string | null`
    - `rememberPendingPostLoginRedirect(path: string): void` — store path+search+hash only (no origin)
    - `clearPendingPostLoginRedirect(): void`
    - `isValidInternalRedirectPath(path: string): boolean` — same-origin relative paths only
  - [x] Suggested key: `hatcast.postLoginRedirect` (V2-only; do not collide with V1 `lastVisitedSeason`)
  - [x] Guard `typeof localStorage === 'undefined'`; wrap reads/writes in try/catch (match `last-visited-league-storage.ts`)

- [x] **Login returnUrl query param** (AC: 2, 8)
  - [x] In `Login`, read optional `returnUrl` from `ActivatedRoute` snapshot/queryParamMap on init
  - [x] If valid, call `rememberPendingPostLoginRedirect(returnUrl)` (query param wins over stale storage when both present at login time — document order in service)
  - [x] Do **not** expose external URLs in the login form; validation only

- [x] **Store redirect before `/connexion`** (AC: 7)
  - [x] Add helper `rememberCurrentUrlForPostLogin(router: Router): void` (or injectable `AuthRedirectService`) that captures `router.url` when non-empty and not already `/connexion`
  - [x] Call from member pages **before** `navigate(['/connexion'])`: at minimum `EventDetail`, `UserAgenda`, `SeasonHome`, `SeasonsList`, `AccountPlaceholder`, `AdminMembres`, `AdminParticipants`
  - [x] Keep changes minimal — one shared helper, no new global guard unless it reduces duplication clearly

- [x] **Extend `PostLoginNavigationService`** (AC: 1–6, 9)
  - [x] Update `resolveAuthenticatedEntryUrl()` priority:
    1. Pending deep link (storage, then optional `returnUrl` already merged at login)
    2. `getLastVisitedSeasonSlug()` → `TroupeSeasonResolverService.resolveSeasonSlug`
    3. `['/agenda']`
  - [x] Change **all** former `/seasons` fallbacks to `/agenda`
  - [x] On successful deep-link use: `clearPendingPostLoginRedirect()`
  - [x] On invalid deep link: clear storage, continue chain
  - [x] Support query strings: prefer `router.navigateByUrl(validPath, { replaceUrl: true })` when path includes `?` or `#`, or parse with `Router.parseUrl`
  - [x] Update `navigateAfterSignIn` to handle `string | string[] | UrlTree` return shape cleanly

- [x] **Comments / copy touch-ups** (AC: 1, 4)
  - [x] Update `HomeSignedIn` doc comment: “last league or `/agenda`” (not seasons list)
  - [x] Do **not** change `/seasons` list behaviour or account-placeholder back link in this story (Epic 14.4 demotes `/seasons`)

- [x] **Tests** (AC: 11)
  - [x] `post-login-redirect-storage.spec.ts` — valid/invalid paths, set/get/clear
  - [x] Extend `post-login-navigation.service.spec.ts`:
    - pending redirect → `navigateByUrl` / parsed URL
    - no redirect + resolved slug → `/saison/:slug`
    - no redirect + no slug → `/agenda`
    - stale slug → clear + `/agenda`
    - invalid pending redirect → ignored + `/agenda`
  - [x] Update `auth-redirect`, `home-signed-in`, `login` specs if they assert `/seasons`
  - [x] Add one integration-style test: e.g. `EventDetail` or `UserAgenda` stores redirect when session missing
  - [x] Run full web test suite + build

### Review Findings

- [x] [Review][Patch] Clear pending deep link only after successful `navigateByUrl`, not during target resolution [apps/web/src/app/core/navigation/post-login-navigation.service.ts:25]
- [x] [Review][Patch] Align redirect allowlist with actual Angular routes instead of accepting broad non-routable prefixes [apps/web/src/app/core/navigation/post-login-redirect-storage.ts:4]
- [x] [Review][Patch] Test invalid stored redirect by writing the bad value directly to localStorage [apps/web/src/app/core/navigation/post-login-navigation.service.spec.ts:91]
- [x] [Review][Patch] Cover `ambiguous` and `no-membership` resolver results explicitly [apps/web/src/app/core/navigation/post-login-navigation.service.spec.ts:71]
- [x] [Review][Patch] Await `compileComponents()` when reconfiguring `Login` TestBed for invalid `returnUrl` [apps/web/src/app/pages/login/login.spec.ts:74]
- [x] [Review][Patch] Use a valid stale redirect in the `returnUrl` overwrite test [apps/web/src/app/pages/login/login.spec.ts:61]

## Dev Notes

### Scope boundaries (read first)

| In scope (12.5) | Out of scope |
|-----------------|--------------|
| FR49 routing priority finalized | Troupe/league filter UI (**12.3**) |
| Fallback `/seasons` → `/agenda` | Route alias `/ligue/:slug` (**12.6**) |
| Pending deep link + `returnUrl` on login | Push notification delivery (**Epic 8**) |
| Store intended URL before `/connexion` | Demote `/seasons` list (**14.4**) |
| Update `PostLoginNavigationService` + tests | Server-side user preference API |
| Open-redirect validation | In-flight lock on concurrent `navigateAfterSignIn` (deferred — see `deferred-work.md`) |

**Prerequisite:** Story **12.2** must expose `/agenda` (route + empty states). Story **2.9** already wired all sign-in entry points to `PostLoginNavigationService`.

### FR49 routing priority (normative — implement exactly)

| Priority | Condition | Destination |
|----------|-----------|-------------|
| 1 | Valid pending deep link | Stored path (e.g. `/saison/:slug/event/:eventId?showConfirm=true`) |
| 2 | Valid `lastVisitedSeason` slug | `/saison/:slug` |
| 3 | Else | `/agenda` |
| 4 | (handled by 12.2 UI) | Empty agenda + guidance when no participations |

**Never:** `/accueil` stub, `/seasons` as post-login default.

### Current V2 code (must change)

```15:31:apps/web/src/app/core/navigation/post-login-navigation.service.ts
  async resolveAuthenticatedEntryUrl(): Promise<string[]> {
    const slug = getLastVisitedSeasonSlug()
    if (!slug) {
      return ['/seasons']
    }
    // ...
    clearLastVisitedSeasonSlug()
    return ['/seasons']
  }
```

Replace both `['/seasons']` with `['/agenda']` and insert pending-redirect branch **before** slug read.

### Entry points already wired (do not duplicate logic)

| File | Behaviour |
|------|-----------|
| `auth-redirect.ts` | `postLoginNav.navigateAfterSignIn()` after session OK |
| `login.ts` | same after Google + email sign-in |
| `reset-password.ts` | same after reset + sign-in |
| `home-signed-in.ts` | same for legacy `/accueil` |

Only extend `Login` for `returnUrl` query ingestion; other entry points rely on storage set by AC7.

### Deep-link capture pattern

When session check fails:

```typescript
// Pseudocode — use shared helper
rememberCurrentUrlForPostLogin(this.router)
await this.router.navigate(['/connexion'], { replaceUrl: true })
```

`router.url` includes leading `/` and query string (e.g. `/saison/festibask/event/abc?tab=dispos`). Validate before store.

**Whitelisted prefixes (minimum):** `/agenda`, `/saison/`, `/compte`, `/seasons`, `/troupe/`. Reject anything else unless product adds routes — prefer **prefix allowlist** over blocklist.

### Validation rules (reuse Story 2.9)

- **Always** validate last-league slug via `TroupeSeasonResolverService.resolveSeasonSlug(slug)` — never hand-roll season list loops.
- **Clear stale slug** on failed resolve (keep 2.9 behaviour).
- **Do not** call troupe/season APIs before `ensureHatcastSession()` succeeds.

### Architecture compliance

- **Stack:** Angular 21 standalone, `providedIn: 'root'` services under `apps/web/src/app/core/navigation/`.
- **Auth:** Cookie session via `AuthApiService.ensureHatcastSession()` — unchanged from Epic 1.
- **No legacy edits:** Do not modify `legacy/`.
- **No backend changes** expected.
- **Terminology:** UI “ligue”; routes remain `/saison/:slug` until **12.6**.

### Project structure notes

```
apps/web/src/app/core/navigation/
  post-login-redirect-storage.ts       # NEW
  post-login-redirect-storage.spec.ts
  post-login-navigation.service.ts   # MODIFY
  post-login-navigation.service.spec.ts
  last-visited-league-storage.ts       # unchanged API
  auth-redirect.helper.ts              # OPTIONAL shared remember-before-login helper
```

### Testing standards

- Vitest + Angular TestBed; mock `TroupeSeasonResolverService`, `Router`.
- Test `navigateByUrl` vs `navigate` when deep link includes query params.
- Pattern reference: `post-login-navigation.service.spec.ts`, `last-visited-league-storage.spec.ts`.

```bash
npm run test -w @hatcast/web -- --watch=false
npm run build -w @hatcast/web
```

### Previous story intelligence

- **Story 2.9** delivered `PostLoginNavigationService`, `lastVisitedSeason` storage, `/accueil` shim, clear-on-`/seasons`. Explicitly deferred `/agenda` fallback and deep links to **12.5**.
- **Story 12.2** (`/agenda` in progress) is the fallback target; empty states already satisfy FR49 §4. Do not reimplement empty UI here.
- **Story 12.2** guardrail: opening `/agenda` must **not** clear `lastVisitedSeason`.
- Review note from 2.9: concurrent `navigateAfterSignIn` has no in-flight lock — **defer** (see `deferred-work.md`).

### Git intelligence

Recent relevant commits:

- `0afdb45 feat(agenda): Add user agenda API and Mon agenda screen` — `/agenda` route exists
- `0c7aea3 feat(web): Post-login redirect to last visited league` — baseline for this story
- Follow Conventional Commits: `feat(web): Finalize post-login routing to agenda`

### Latest tech information

No new npm dependencies. Use existing Angular `Router.navigate`, `Router.navigateByUrl`, `Router.parseUrl` (Angular 21). No API version changes.

### References

- [Source: `_bmad-output/planning-artifacts/epics.md` — Story 12.5]
- [Source: `_bmad-output/planning-artifacts/prd.md` — FR49]
- [Source: `_bmad-output/planning-artifacts/ux-design-journey-league-agenda.md` — UX-DR13 Screen 1]
- [Source: `_bmad-output/planning-artifacts/architecture.md` — Post-login routing, `/agenda` hub]
- [Source: `_bmad-output/planning-artifacts/plan-v2-league-journey.md` — Wave 1 Story 12.5]
- [Source: `docs/adr/0011-league-model-and-user-agenda.md`]
- [Source: `_bmad-output/implementation-artifacts/2-9-post-login-et-derniere-ligue-visitee-v1-parity.md`]
- [Source: `_bmad-output/implementation-artifacts/12-2-ecran-mon-agenda.md`]
- [Source: `apps/web/src/app/core/navigation/post-login-navigation.service.ts`]

## Dev Agent Record

### Agent Model Used

Composer

### Debug Log References

- Implemented FR49 priority chain: pending deep link → last league → `/agenda`.
- Open-redirect guard via prefix allowlist on internal paths.

### Completion Notes List

- Added `post-login-redirect-storage.ts` with localStorage key `hatcast.postLoginRedirect` and validation (reject external URLs, `/connexion` loops, unknown routes).
- Added `auth-redirect.helper.ts` with `rememberCurrentUrlForPostLogin()`; wired into 7 member pages before auth redirects (not on logout).
- Extended `PostLoginNavigationService`: deep links use `navigateByUrl`; all `/seasons` fallbacks replaced with `/agenda`.
- `Login` ingests optional `returnUrl` query param on init (overwrites stale storage when valid).
- Updated `HomeSignedIn` doc comment. `/seasons` list clear-on-open behaviour unchanged (Story 2.9 AC4).
- Tests: 240 passed; `npm run build -w @hatcast/web` OK.

### File List

- apps/web/src/app/core/navigation/post-login-redirect-storage.ts (new)
- apps/web/src/app/core/navigation/post-login-redirect-storage.spec.ts (new)
- apps/web/src/app/core/navigation/auth-redirect.helper.ts (new)
- apps/web/src/app/core/navigation/post-login-navigation.service.ts (modified)
- apps/web/src/app/core/navigation/post-login-navigation.service.spec.ts (modified)
- apps/web/src/app/pages/login/login.ts (modified)
- apps/web/src/app/pages/login/login.spec.ts (new)
- apps/web/src/app/pages/home-signed-in/home-signed-in.ts (modified)
- apps/web/src/app/pages/event-detail/event-detail.ts (modified)
- apps/web/src/app/pages/user-agenda/user-agenda.ts (modified)
- apps/web/src/app/pages/user-agenda/user-agenda.spec.ts (modified)
- apps/web/src/app/pages/season-home/season-home.ts (modified)
- apps/web/src/app/pages/seasons-list/seasons-list.ts (modified)
- apps/web/src/app/pages/account-placeholder/account-placeholder.ts (modified)
- apps/web/src/app/pages/admin-membres/admin-membres.ts (modified)
- apps/web/src/app/pages/admin-participants/admin-participants.ts (modified)
- apps/web/src/app/pages/reset-password/reset-password.spec.ts (modified)

### Change Log

- 2026-05-24: Finalize post-login routing — deep link storage, `/agenda` fallback, member-route redirect capture, full test coverage.
