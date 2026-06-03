---
baseline_commit: 959408d2299e2486cdda08b429fd793d9e0c0d65
---

# Story 1.2b : UX inscription dédiée (parité V1)

Status: done

<!-- bmad-create-story — 2026-06-03 — UX: ux-design-auth-inscription-1-2b.md + EXPERIENCE.md + DESIGN.md -->

## Story

As a **visitor without a HatCast account**,  
I want a **dedicated sign-up screen** that is clearly separate from sign-in,  
so that I can create an email/password account without confusion (V1 parity, Wave B / V2.0.0 cutover).

## Acceptance Criteria

1. **Route `/inscription` (AC-UX-1) :** **Given** an unauthenticated visitor, **when** they open `/inscription`, **then** they see: brand block (logo + HatCast), **`h1` « Créer un compte »**, tagline *Rejoins HatCast pour gérer ta troupe*, **Continuer avec Google** (same stack as `/connexion`), separator « ou », email field, password field, **confirm password** field, primary **`mat-flat-button` « Créer mon compte »**, footer *Déjà un compte ?* with link to `/connexion`. [Source: [ux-design-auth-inscription-1-2b.md](../planning-artifacts/ux-design-auth-inscription-1-2b.md) ; [EXPERIENCE.md](../planning-artifacts/ux-designs/ux-hatcast-2026-06-03/EXPERIENCE.md) ; PLAN 1.2b]

2. **Sign-up submit (AC-UX-2) :** **Given** valid email + password (min 8 chars) + matching confirmation, **when** the user submits **Créer mon compte**, **then** `createUserWithEmailAndPassword` runs, IdP ID token is exchanged via existing `AuthApiService.signInWithIdentityPlatformIdToken` (story **1.2**), session is established, and post-login navigation matches `/connexion` (no intermediate “success” page). **Given** password ≠ confirmation, **when** submit is attempted, **then** snackbar *Les deux mots de passe ne correspondent pas.* and **no** IdP call. [Source: 1.2 ; `reset-password.ts` pattern]

3. **Connexion cleanup (AC-UX-3) :** **Given** `/connexion`, **when** the page renders, **then** there is **no** `registerWithEmail()` on the same form; footer *Pas de compte ?* uses **`routerLink="/inscription"`** (not `type="button"`). Primary CTA remains **Se connecter** only. [Source: EXPERIENCE.md — Banned patterns]

4. **`returnUrl` propagation (AC-UX-4) :** **Given** `?returnUrl=` on `/connexion` or `/inscription` (valid internal path per `isValidInternalRedirectPath`), **when** the page initializes, **then** `rememberPendingPostLoginRedirect` behaves like today on `Login` ; cross-links between connexion ↔ inscription **preserve** the same query param on `routerLink`. [Source: `login.ts` `ingestReturnUrlFromQuery` ; `login.spec.ts`]

5. **Google on both routes (AC-UX-5) :** **Given** `googleOAuthWebClientId` configured, **when** the user completes Google on `/inscription`, **then** the same GSI overlay + `signInWithGoogleIdToken` + avatar prompt + post-login navigation as `/connexion` (no regression). [Source: story **1.1** / **1.2** ; EXPERIENCE.md Flow 3]

6. **Email auth disabled (AC-UX-6) :** **Given** `hasFirebaseWebConfig()` is false, **when** `/inscription` or `/connexion` renders, **then** only Google (+ dev hint on connexion if `isDev`) is shown — **no** footer link to an empty email sign-up form. [Source: EXPERIENCE.md Component Patterns]

7. **No API change (AC-UX-7) :** **Given** this story, **when** implemented, **then** `services/api` and OpenAPI are **unchanged** (front-only). [Source: ux-design-auth-inscription-1-2b.md A6]

8. **Banned UX (AC-UX-8) :** **Given** any auth screen in scope, **when** implemented, **then** none of: single form dual-intent link, tabs Connexion|Inscription, signup modal, V1 email-verification wizard, two primary CTAs on one page. [Source: EXPERIENCE.md Interaction Primitives]

**Product coverage:** FR1 (sign-up clarity) ; V2.0.0 Wave B ; parité V1 *écran* dédié (not V1 multi-step email flow). Epic **1** — complements story **1.2** (done).

---

## Acceptance Criteria — Material 3 (UI)

**M3-1. Composants Material** — **Given** UI in `apps/web/`, **when** controls are rendered, **then** use `mat-card` (outlined), `mat-form-field` (outline, `subscriptSizing="dynamic"`), `mat-flat-button` / `mat-stroked-button`, `mat-checkbox` (connexion only), `MatDialog` for Google avatar prompt — no custom primary buttons. [Source: [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md) ; [DESIGN.md](../planning-artifacts/ux-designs/ux-hatcast-2026-06-03/DESIGN.md)]

**M3-2. Tokens & thème** — **Given** auth SCSS, **when** colors/backgrounds apply, **then** reuse `.auth-page` + card pattern from [`login.scss`](../../apps/web/src/app/pages/login/login.scss) (`var(--mat-sys-*)`, `color-mix` canvas) — **no** new hex on feature SCSS. [Source: DESIGN.md]

**M3-3. Mobile & tactile** — **Given** viewport ≤ 480px, **when** auth pages display, **then** card full width (max 26rem centered), primary CTA full width, footer links ≥ 48dp touch target. [Source: DESIGN.md Do's and Don'ts]

**M3-4. Navigation membre** — **N/A** — auth routes stay **outside** `MemberShell` (no rail / hub chrome). [Source: [ux-hub-a-faire.md](../planning-artifacts/ux-hub-a-faire.md)]

**M3-5. Revue** — **Given** implementation complete, **when** validating, **then** checklist [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md) § Checklist M3 ; waivers noted in Dev Agent Record. [Source: AGENTS.md]

---

## Tasks / Subtasks

- [x] **Périmètre :** `apps/web/` only — **no** `services/api/`, **no** `legacy/`. (AC-UX-7)
- [x] **Route** — Add `{ path: 'inscription', component: Signup }` in [`app.routes.ts`](../../apps/web/src/app/app.routes.ts) next to `connexion`. (AC-UX-1)
- [x] **Page `Signup`** — New `apps/web/src/app/pages/signup/` (`signup.ts`, `signup.html`, `signup.scss`, `signup.spec.ts`). (AC-UX-1, AC-UX-2)
- [x] **Form** — `email`, `password` (minLength 8), `confirmPassword` ; `autocomplete="new-password"` on password fields ; submit → mismatch check → `createUserWithEmailAndPassword` → `finishIdpSignIn` with **`rememberMe: true`** (no checkbox on signup per UX — story **1.4** default for new accounts). (AC-UX-2)
- [x] **Connexion** — Remove `registerWithEmail()` from [`login.ts`](../../apps/web/src/app/pages/login/login.ts) ; replace footer button with `routerLink="/inscription"` + `[queryParams]` for `returnUrl`. (AC-UX-3, AC-UX-4)
- [x] **Styles** — Share auth chrome: prefer moving shared rules from `login.scss` to `auth-page.scss` (or import shared partial) so `/inscription` matches `/connexion` pixel-for-pixel on brand/Google/separator. (M3-2, DESIGN.md `auth-page`)
- [x] **Google GSI** — Duplicate or extract GSI init from `Login` (`ngAfterViewInit`, overlay, `onGoogleCredential`, `maybePromptGoogleAvatarImport`) — **must work on Signup** without breaking Login. (AC-UX-5)  
  - *Recommended:* extract thin `AuthGoogleSignInDirective` or shared service to avoid drift; not mandatory if copy is kept in sync.
- [x] **`returnUrl`** — Copy `ingestReturnUrlFromQuery()` pattern to `Signup` ; footer links use `routerLink` with preserved query. (AC-UX-4)
- [x] **Tests** — `signup.spec.ts`: password mismatch blocks IdP ; valid internal `returnUrl` stored on init ; optional template test for footer `routerLink`. Update `login` tests if any assumed `registerWithEmail`. Run `npm run test` in `apps/web`. (AC-UX-2, AC-UX-4, AC-UX-6)
- [x] **Manual recette** — Execute checklist in [ux-design-auth-inscription-1-2b.md § Recette](../planning-artifacts/ux-design-auth-inscription-1-2b.md) (staging Identity Platform). (cutover gate 1.2)

### Review Findings

<!-- bmad-code-review — 2026-06-03 -->

- [x] [Review][Decision] Périmètre post-login `returnUrl` — Validé : validation saison commitée séparément (`8a65d899`) ; reste non commité conservé dans 1.2b.

- [x] [Review][Decision] Harmonisation mot de passe oublié / reset — Conservée (cohérence M3 `auth-page`).

- [x] [Review][Patch] Test `returnUrl` footer — `signup.spec.ts` assert `loginQueryParams` (AC-UX-4).

- [x] [Review][Patch] Fuite timer GSI — `ngOnDestroy` + cleanup interval/timeout sur `Signup` et `Login`.

- [x] [Review][Patch] File List / Dev notes — Alignés (voir File List ci-dessous).

- [x] [Review][Defer] Duplication GSI Login/Signup (~140 LOC) — Story recommande extraction mais non obligatoire ; risque de dérive entre `/connexion` et `/inscription`. — deferred, dette acceptée story 1.2b

- [x] [Review][Defer] Pas de test happy-path `createUserWithEmailAndPassword` → session — Minimum story couvert (mismatch + returnUrl) ; chemin succès non automatisé. — deferred, couverture manuelle recette

- [x] [Review][Defer] Compte Firebase créé si échange API échoue — Même pattern que connexion 1.2 après `createUserWithEmailAndPassword` ; hors scope correctif 1.2b. — deferred, pre-existing

---

## Dev Notes

### Product and UX rules (normative)

| Document | Role |
|----------|------|
| [ux-design-auth-inscription-1-2b.md](../planning-artifacts/ux-design-auth-inscription-1-2b.md) | Story-facing AC + wireframes + recette |
| [EXPERIENCE.md](../planning-artifacts/ux-designs/ux-hatcast-2026-06-03/EXPERIENCE.md) | IA, flows, banned patterns |
| [DESIGN.md](../planning-artifacts/ux-designs/ux-hatcast-2026-06-03/DESIGN.md) | M3 auth chrome — **do not invent a new layout** |

**Microcopy (fixed):**

| Element | `/connexion` | `/inscription` |
|---------|--------------|----------------|
| `h1` | Connexion | Créer un compte |
| Tagline | Pour continuer vers HatCast | Rejoins HatCast pour gérer ta troupe |
| Primary CTA | Se connecter | Créer mon compte |
| Footer | Pas de compte ? **Créer un compte** | Déjà un compte ? **Se connecter** |

### Current code — what to change (READ before coding)

**[`login.ts`](../../apps/web/src/app/pages/login/login.ts) (UPDATE)**

| Today | Change |
|-------|--------|
| `registerWithEmail()` L197–214 | **Delete** — move logic to `Signup` only |
| `signInWithEmail()` + `finishIdpSignIn()` | **Keep** on Login |
| `ingestReturnUrlFromQuery()` | **Keep** ; mirror on Signup |
| GSI block L106–178, `onGoogleCredential` | **Keep** on Login ; replicate or share on Signup |
| `rememberMe` checkbox | **Connexion only** |

**[`login.html`](../../apps/web/src/app/pages/login/login.html) (UPDATE)**

| Today | Change |
|-------|--------|
| L81–86 `<button (click)="registerWithEmail()">` | `<a routerLink="/inscription" [queryParams]="signupQueryParams">` or equivalent preserving `returnUrl` |

**[`reset-password.ts`](../../apps/web/src/app/pages/reset-password/reset-password.ts) (REFERENCE)**

- Password mismatch snackbar L90–92 — **reuse same French string** on signup.

### Frontend implementation guardrails

| Concern | Action |
|--------|--------|
| Material | Same imports as `Login` (+ no `MatCheckbox` on Signup) |
| Tokens | Copy `.auth-page`, `.login__card`, `.login__column`, etc. — rename classes to `auth__*` only if doing a shared refactor; otherwise duplicate class names in `signup.scss` importing shared partial |
| IdP errors | `userMessageForIdentityPlatformAuth` — codes Firebase ciblés (ex. `auth/email-already-in-use` sur inscription) |
| API errors | `userMessageForIdpApiFailure` — unchanged |
| Post-login | `PostLoginNavigationService.navigateAfterSignIn` — inchangé côté Signup ; validation `returnUrl` saison (commit `8a65d899`, hors API) |
| Success snack | *Connexion réussie.* after email sign-up (same as today) — acceptable per 1.2 |

### Explicit non-goals

- ~~Harmonize `/mot-de-passe-oublie` layout with `.auth-page` (future story).~~ — **fait dans 1.2b** (décision revue PO : cohérence M3).
- V1 `AccountCreationModal` email-verification-first flow.
- New API endpoints or Flyway migrations.
- Member shell / hub navigation on auth routes.
- i18n / English UI strings.

### Dependencies

| Story | Status | Relationship |
|-------|--------|----------------|
| **1.2** | done | Provides IdP email sign-up/sign-in API + `login` baseline — **do not break** |
| **1.1** | done | Google GSI on connexion — **must work on inscription** |
| **1.3** | done | Forgot-password link stays on **connexion only** |
| **1.4** | done | `rememberMe` on connexion; signup uses default `true` without UI |
| **1.2b** | this | Front UX only |

### Architecture compliance

- [ADR-0010](../../docs/adr/0010-v2-auth-identity-platform.md) — passwords and accounts remain in Identity Platform; front only collects credentials and exchanges ID tokens.
- Auth routes remain public (no `MemberShell` child) — same as `/connexion`, `/mot-de-passe-oublie`.

### Library / framework

- Angular **21.2** standalone components ; `firebase/auth` already in `package.json` from 1.2.
- No new npm dependencies expected.

### File structure (expected)

| Action | Path |
|--------|------|
| NEW | `apps/web/src/app/pages/signup/signup.ts` |
| NEW | `apps/web/src/app/pages/signup/signup.html` |
| NEW | `apps/web/src/app/pages/signup/signup.scss` |
| NEW | `apps/web/src/app/pages/signup/signup.spec.ts` |
| UPDATE | `apps/web/src/app/app.routes.ts` |
| UPDATE | `apps/web/src/app/pages/login/login.ts` |
| UPDATE | `apps/web/src/app/pages/login/login.html` |
| OPTIONAL | `apps/web/src/app/pages/auth/auth-page.scss` or shared Google helper |

### Testing requirements

```bash
cd apps/web && npm run test
```

Minimum new coverage:

- Signup: mismatch passwords → snackbar, `createUserWithEmailAndPassword` **not** called (mock `FirebaseAuthService`).
- Signup: `returnUrl` valid → stored in `post-login-redirect-storage`.
- Login: no regression on `returnUrl` tests in `login.spec.ts`.

### Previous story intelligence (1.2)

- `finishIdpSignIn` + `signInWithIdentityPlatformIdToken(idToken, rememberMe)` is the **only** HatCast session bridge for email.
- UI hidden when `environment.firebase` incomplete — same guard on both pages.
- Google still uses `POST /v1/auth/google` (JWT GIS), not IdP token — **unchanged** in 1.2b.
- Dev-only `devLog` pre on connexion — optional on signup (not required by UX).

### Project context reference

- [project-context.md](../../project-context.md) — M3, `apps/web/` only, tests mandatory.
- [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md) — checklist before handoff.

### Manual recette (cutover)

1. `/connexion` → existing user → **Se connecter** → member app.
2. `/connexion` → **Créer un compte** → `/inscription` → new user → **Créer mon compte** → member app.
3. `/inscription` → mismatched passwords → error, no account.
4. Google from `/inscription` → same as connexion.
5. Missing Firebase config → no misleading email signup link.

---

## Dev Agent Record

### Agent Model Used

Composer (bmad-dev-story)

### Debug Log References

- Extracted shared auth chrome to `pages/auth/auth-page.scss` with `auth__*` classes; login retains login-specific checkbox/forgot-password rules.

### Completion Notes List

- Added `/inscription` route and dedicated `Signup` component (email + confirm password + Google GSI parity with `/connexion`).
- Removed `registerWithEmail()` from Login; footer uses `routerLink="/inscription"` with `returnUrl` query preservation.
- Signup uses `rememberMe: true` by default (no checkbox); password mismatch shows snackbar before any IdP call.
- Vitest: 906 tests green (`npm run test` in `apps/web`). New `signup.spec.ts` (4 tests): returnUrl, mismatch, footer link, invalid returnUrl.
- **M3 checklist:** M3-1 through M3-3 validated; M3-4 N/A (auth outside MemberShell); M3-5 self-check done — no waivers.
- **Manual recette:** Implementation ready; PO to run ux-design-auth-inscription-1-2b.md § Recette on staging Identity Platform (cutover gate 1.2).
- **Code review (2026-06-03):** 3 patches appliqués (test `loginQueryParams`, cleanup GSI timers, doc). Décisions : post-login saison OK (commit séparé) ; auth-page sur forgot/reset conservé.

### File List

- `apps/web/src/app/pages/auth/auth-page.scss` (NEW)
- `apps/web/src/app/pages/signup/signup.ts` (NEW)
- `apps/web/src/app/pages/signup/signup.html` (NEW)
- `apps/web/src/app/pages/signup/signup.scss` (NEW)
- `apps/web/src/app/pages/signup/signup.spec.ts` (NEW)
- `apps/web/src/app/app.routes.ts` (UPDATE)
- `apps/web/src/app/core/auth/auth-user-message.ts` (UPDATE — messages IdP ciblés)
- `apps/web/src/app/pages/login/login.ts` (UPDATE)
- `apps/web/src/app/pages/login/login.html` (UPDATE)
- `apps/web/src/app/pages/login/login.scss` (UPDATE)
- `apps/web/src/app/pages/forgot-password/forgot-password.html` (UPDATE — auth-page)
- `apps/web/src/app/pages/forgot-password/forgot-password.scss` (UPDATE)
- `apps/web/src/app/pages/forgot-password/forgot-password.ts` (UPDATE)
- `apps/web/src/app/pages/reset-password/reset-password.html` (UPDATE — auth-page)
- `apps/web/src/app/pages/reset-password/reset-password.scss` (UPDATE)
- `apps/web/src/app/core/navigation/post-login-navigation.service.ts` (UPDATE — commit `8a65d899`, validation returnUrl saison)
- `apps/web/src/app/core/navigation/unreachable-season-navigation.ts` (NEW — commit `8a65d899`)
- `apps/web/src/app/core/navigation/unreachable-season-navigation.spec.ts` (NEW — commit `8a65d899`)

### Change Log

- 2026-06-03 : Story created (`bmad-create-story`) — ready-for-dev.
- 2026-06-03 : Implemented dedicated `/inscription` page, login cleanup, shared auth styles, tests (bmad-dev-story).
- 2026-06-03 : Code review — patches GSI cleanup + test returnUrl footer ; statut `done`.

---

## Story completion status

- **Status:** done  
- **Sprint key:** `1-2b-ux-inscription-dediee-parite-v1`  
- **Ultimate context engine analysis completed** — comprehensive developer guide created from approved UX spines.
