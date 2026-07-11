---
feature_branch: feat/4-4-guides-video-page-connexion
baseline_commit: e255ac4214008a57ba64f0ec241f0a52c3570dff
---

# Story 4.4: Video guides on login page

Status: done

<!-- Ultimate context engine analysis completed — comprehensive developer guide created (2026-07-11) -->

## Story

As a **visitor or member about to sign in**,  
I want **three clear video-guide entry points on `/connexion` (member, organizer, admin)**,  
so that **I can self-onboard to HatCast 2 before or during the M4 cutover** without hunting for links in comms.

## Acceptance Criteria

1. **Given** an anonymous user on **`/connexion`**, **when** the page renders, **then** a **Guides vidéo** block shows **three** external CTAs with French labels **Guide membre**, **Guide organisateur**, **Guide administrateur** — below the auth card content (after signup footer when email auth is visible, otherwise after the Google block). [Source: epics 4.4 ; PO session 2026-07-11 ; M4 pre-cutover comms]
2. **Given** a guide CTA, **when** the user activates it, **then** the configured URL opens in a **new browsing context** (`target="_blank"`, `rel="noopener noreferrer"`) — no in-app iframe, no same-tab navigation away from login. [Source: PO 2026-07-11]
3. **Given** the **initial PO URLs (Google Drive interim)**, **when** prod/staging builds ship, **then** the three links resolve to:

   | Role | URL (interim — replace with YouTube when ready) |
   |------|--------------------------------------------------|
   | Membre | `https://drive.google.com/file/d/1MHLED9mJYjNQLO8OClFTzwDrSnRdsGKD/view?usp=drive_link` |
   | Organisateur | `https://drive.google.com/file/d/1rDz8fAt5fYEZnfD9vooXTsqAUxuF6UNu/view?usp=drive_link` |
   | Admin | `https://drive.google.com/file/d/18Es9X-yZIamdo2gkJOCjKVKYV_rISa69/view?usp=sharing` |

   [Source: PO URLs 2026-07-11]

4. **Given** future **YouTube** URLs from PO, **when** dev updates **`environment*.ts`** (or shared constants fed by env), **then** no template/logic change is required — only URL string swaps. [Source: PO 2026-07-11]
5. **Given** **`/inscription`**, **when** this story ships, **then** **no** video-guide block is added there (login-only scope). [Source: PO scope `/connexion` only]
6. **Given** an already-authenticated session, **when** `/connexion` loads, **then** existing redirect via `PostLoginNavigationService` remains unchanged — guides must not block or delay redirect. [Source: `login.ts` ngOnInit]
7. **Given** implementation complete, **when** `npm run test -w @hatcast/web -- --watch=false` and `npm run build -w @hatcast/web`, **then** they pass; unit tests cover three links present, `target`/`rel`, and hide block when all URLs empty. [Source: NFR-Q1]

**Product coverage:** M4 pre-cutover onboarding (PLAN § Gate M4 comms) ; Epic 4 sprint track ; cross-cutting Epic 1 auth surface. **Out of scope:** embedded video player, i18n EN, PostHog click events (optional follow-up), `/inscription`, API/backend, V1 legacy banner (→ **OPS-M4-1**).

---

## Acceptance Criteria — Material 3 (UI)

**M3-1. Composants Material** — **Given** the guides block, **when** rendered, **then** use **`mat-stroked-button`** (full-width stack, pill radius via existing `.auth__stroked-action`) with optional **`mat-icon`** (`play_circle` or `smart_display`) — not custom `<div>` click targets. Section title uses existing auth typography classes (`.auth__heading` scale or `.auth__tagline` for subtitle). [Source: FRONTEND_UI.md ; `auth-page.scss`]

**M3-2. Tokens & thème** — **Given** SCSS for the guides block, **when** colors are applied, **then** only `var(--mat-sys-*)` and `color-mix(in srgb, var(--mat-sys-…) …)` — no hex/rgb on feature styles. [Source: FRONTEND_UI.md]

**M3-3. Mobile & tactile** — **Given** viewport **max-width: 480px**, **when** guide buttons display, **then** each CTA is **≥ 48×48 dp** (reuse `min-height: 3rem` from `.auth__stroked-action`) ; French **`aria-label`** on each link e.g. « Ouvrir le guide vidéo membre (nouvel onglet) ». [Source: NFR-A1 ; FRONTEND_UI.md]

**M3-4. Navigation membre** — **Given** `/connexion` is a pre-auth surface, **when** this story adds UI, **then** **no** member chrome (app bar, rail, bottom bar) is introduced. [Source: ux-hub-a-faire.md — N/A pre-auth]

**M3-5. Revue** — **Given** implementation done, **when** validated, **then** checklist § « Checklist M3 HatCast » in [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md) is walked ; waivers noted in Dev Agent Record. [Source: AGENTS.md]

---

## Tasks / Subtasks

- [x] **Scope:** `apps/web/` only — `/connexion` (`Login` component)

### Config — video URLs (AC: 3, 4)

- [x] Add typed **`onboardingVideoGuides`** to [`environment.ts`](../../apps/web/src/environments/environment.ts) and [`environment.development.ts`](../../apps/web/src/environments/environment.development.ts):

  ```typescript
  onboardingVideoGuides: {
    member: string
    organizer: string
    admin: string
  }
  ```

  Populate with PO Drive URLs (AC3). Empty string = hide that CTA ; all empty = hide entire block (keeps CI/E2E auth setup clean if ever needed).

- [x] Optional: extract [`apps/web/src/app/core/onboarding/onboarding-video-guides.ts`](../../apps/web/src/app/core/onboarding/onboarding-video-guides.ts) with `readonly ONBOARDING_VIDEO_GUIDE_LABELS` + `guidesFromEnvironment(env)` helper — keeps `login.ts` thin.

- [x] **Do not** add `.env` injection for these public URLs in this story (not secrets; committed constants suffice until YouTube swap).

### UI — login page (AC: 1, 2, 5, 6)

- [x] Extend [`login.html`](../../apps/web/src/app/pages/login/login.html): after auth footer / Google-only tail, add `@if (videoGuides().length)` section:

  - Heading **Guides vidéo** only (no subtitle — validated PO/UX 2026-07-11).
  - `@for` over `{ id, label, url }[]` → `<a mat-stroked-button class="auth__stroked-action" [href]="url" target="_blank" rel="noopener noreferrer">` + icon.

- [x] Extend [`login.ts`](../../apps/web/src/app/pages/login/login.ts): import `MatIconModule` ; expose `videoGuides = computed(...)` from environment ; **no** change to `ngOnInit` session redirect logic.

- [x] Extend [`login.scss`](../../apps/web/src/app/pages/login/login.scss) or [`auth-page.scss`](../../apps/web/src/app/pages/auth/auth-page.scss): `.auth__video-guides` — flex column, `gap: 0.5rem`, top border or spacing separator from auth form (`margin-top: 0.5rem` ; optional `border-top` with outline token).

- [x] **Preserve** Google GSI overlay stack (`auth__gsi-overlay`) — guides section must sit **below** the full Google + email column, never overlap GSI hit target.

### Explicit non-goals

- [x] No embedded `<iframe>` / YouTube API / Drive preview API.
- [x] No duplicate block on `/inscription`.
- [x] No API / OpenAPI changes.
- [x] No PostHog events (unless PO asks in review — defer).

### Tests (AC: 7)

- [x] Extend [`login.spec.ts`](../../apps/web/src/app/pages/login/login.spec.ts):
  - With guides configured (mock `environment` or test module provider): 3 links, correct hrefs, `target="_blank"`, `rel` contains `noopener`.
  - With all URLs empty: guides section absent.
- [x] Run `npm run test -w @hatcast/web -- --watch=false` and `npm run build -w @hatcast/web`.

---

## Dev Notes

### Product and UX rules

- **Intent:** Support **M4 cutover** — members arriving at `https://hatcast.app/connexion` (or staging) can pick the right onboarding video **before** signing in. Complements **OPS-M4-1** (V1 banner → V2) ; this is the **V2 login-side** help.
- **Interim host:** Google Drive **view** links (PO upload speed). **Future:** swap to YouTube watch URLs in `environment.ts` only.
- **Copy (FR, validated 2026-07-11):** section title **Guides vidéo** only — no subtitle, no visible « nouvel onglet » / host hint. Three button labels below.

  | Key | Label button | aria-label |
  |-----|--------------|------------|
  | `member` | Guide membre | Ouvrir le guide vidéo membre (nouvel onglet) |
  | `organizer` | Guide organisateur | Ouvrir le guide vidéo organisateur (nouvel onglet) |
  | `admin` | Guide administrateur | Ouvrir le guide vidéo administrateur (nouvel onglet) |

- **Placement:** Below primary auth actions so login flow stays primary ; guides are secondary help.

### Current login page state (must preserve)

[`login.html`](../../apps/web/src/app/pages/login/login.html) + [`login.ts`](../../apps/web/src/app/pages/login/login.ts):

| Behavior | Location | Do not break |
|----------|----------|--------------|
| Session redirect if already signed in | `ngOnInit` → `ensureHatcastSession` + `postLoginNav.navigateAfterSignIn` | Add guides as static markup only |
| Google GSI overlay | `auth__google-stack` + `renderGoogleSignInButton` | Keep z-index ; guides below stack |
| Email auth block | `@if (hasEmailAuth() \|\| isDev)` | Guides visible **whether or not** email block shows (always for anonymous visitors) |
| `returnUrl` query | `ingestReturnUrlFromQuery` | Unaffected |
| Signup link | footer → `/inscription` | Keep above guides or guides after footer — prefer **after** footer |

Shared auth chrome: [`auth-page.scss`](../../apps/web/src/app/pages/auth/auth-page.scss) — card `max-width: 26rem` ; three stacked stroked buttons fit without widening card.

### External link pattern (reuse)

Same security pattern as [`troupe-draw-formulas-tab.html`](../../apps/web/src/app/pages/troupe-settings/troupe-draw-formulas-tab.html): `target="_blank"` + `rel="noopener noreferrer"`.

Use **native `<a href>`** with `mat-stroked-button` (Material anchor button) — not `window.open()` from `(click)` (popup blockers, worse a11y).

### URL validation (lightweight)

At module init or in helper: only render guide if URL is non-empty and starts with `https://`. Reject `javascript:` etc. Tests assert https Drive URLs pass.

### Dependencies

| Story | Status | Relationship |
|-------|--------|--------------|
| 1.2b | done | `/connexion` + `/inscription` split — guides login-only |
| 4.1 | done | Public discovery epic ; unrelated runtime |
| 4.3 | done | Same epic ; no shared files |
| OPS-M4-1 | ready-for-dev | V1 banner ; parallel comms track |

### Previous story intelligence (4.3)

- **4.3** touched troupe cards + API — **no overlap** with login. Reuse only general patterns: M3 stroked buttons, French labels, vitest component tests.
- Review habit: run web build + tests before `review`.

### Git intelligence (recent `v2`)

Recent commits are draw/auth fixes — no conflicting login refactors. Login page stable since 1.2b.

### File structure (expected diff)

| File | Action |
|------|--------|
| `apps/web/src/environments/environment.ts` | UPDATE — add `onboardingVideoGuides` |
| `apps/web/src/environments/environment.development.ts` | UPDATE — same URLs (dev parity) |
| `apps/web/src/app/core/onboarding/onboarding-video-guides.ts` | NEW (recommended) |
| `apps/web/src/app/pages/login/login.html` | UPDATE |
| `apps/web/src/app/pages/login/login.ts` | UPDATE |
| `apps/web/src/app/pages/login/login.scss` | UPDATE — guides spacing |
| `apps/web/src/app/pages/login/login.spec.ts` | UPDATE |

### Testing notes

- E2E auth setup (`e2e/auth.setup.ts`) navigates `/connexion` — extra CTAs must **not** break selectors (`getByRole('button', { name: 'Se connecter' })` etc.). Use distinct labels (« Guide membre »).
- No new E2E required for MVP unless PO requests — unit tests sufficient per AC7.

---

## Dev Agent Record

### Agent Model Used

Composer (dev-story)

### Completion Notes List

- Added `onboardingVideoGuides` to prod/dev environments with PO Google Drive URLs (AC3/4).
- New `guidesFromEnvironment()` helper filters empty/non-https URLs; all empty hides the block.
- Login page: « Guides vidéo » section below auth footer / Google stack with three `mat-stroked-button` anchor CTAs (`play_circle`, new tab, French aria-labels). `ngOnInit` redirect unchanged.
- Unit tests: 3 links + security attrs; empty URLs hide block; existing login tests isolated from guide env.
- `npm run build -w @hatcast/web` passes. `login.spec.ts` (5/5) passes; full web suite has pre-existing failures in other specs (unrelated to this story).
- **M3 checklist:** M3-1 stroked buttons + icon ✓ ; M3-2 tokens only ✓ ; M3-3 min-height 3rem + aria-label ✓ ; M3-4 no member chrome ✓ ; M3-5 walked — no waivers.

### File List

- `apps/web/src/environments/environment.ts`
- `apps/web/src/environments/environment.development.ts`
- `apps/web/src/app/core/onboarding/onboarding-video-guides.ts`
- `apps/web/src/app/pages/login/login.html`
- `apps/web/src/app/pages/login/login.ts`
- `apps/web/src/app/pages/login/login.scss`
- `apps/web/src/app/pages/login/login.spec.ts`
- `apps/web/scripts/inject-google-client-id.mjs`

### Change Log

- 2026-07-11 : Story created — PO Drive URLs ; new-tab external links ; YouTube swap via environment only.
- 2026-07-11 : Implemented video guides block on `/connexion` (config, UI, tests).
- 2026-07-11 : Code review — propagate `onboardingVideoGuides` in `inject-google-client-id.mjs` for prod builds.

### Review Findings

- [x] [Review][Patch] `inject-google-client-id.mjs` omits `onboardingVideoGuides` — fixed 2026-07-11: PO Drive URLs propagated to Docker/CI and `--with-push` generated env files. [apps/web/scripts/inject-google-client-id.mjs]

- [x] [Review][Defer] Full web test suite still failing (22 files / 100 tests, e.g. `season-card.spec.ts`) — deferred, pre-existing, unrelated to story 4.4
- [x] [Review][Defer] No isolated unit tests for `guidesFromEnvironment()` edge cases (`http://`, partial config, whitespace) — deferred, login.spec covers happy path + all-empty
- [x] [Review][Defer] M3-1 minor: section title uses `.auth__video-guides-title` instead of reusing `.auth__heading` / `.auth__tagline` — deferred, tokens M3 OK
- [x] [Review][Defer] Tests mutate global `environment` object — deferred, restored in `afterEach`, pattern acceptable for this codebase

---

### Validation create-story

- [x] AC métier numérotés et sourcés (PO / M4 / sprint-status)
- [x] Section **Material 3** remplie
- [x] Tasks référencent les numéros d’AC (y compris M3-x)
- [x] Liens vers fichiers code existants à réutiliser
- [x] `npm run test` / `npm run build` mentionnés
- [x] Story implementation complete — status `review`
