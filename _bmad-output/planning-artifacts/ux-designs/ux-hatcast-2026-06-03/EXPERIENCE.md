---
name: HatCast Auth (connexion / inscription)
status: final
sources:
  - {planning_artifacts}/ux-design-auth-inscription-1-2b.md
  - {planning_artifacts}/ux-hub-a-faire.md
  - {planning_artifacts}/epics.md
  - {planning_artifacts}/ux-designs/ux-hatcast-2026-06-03/DESIGN.md
updated: 2026-06-03
---

# HatCast Auth — Experience Spine

> Behavioral contract for **Story 1.2b** (dedicated sign-up UX). Technical auth remains **Story 1.2** (Identity Platform + `POST /v1/auth/idp`). Visual identity: paired `DESIGN.md` in this folder.

## Foundation

- **Form factor:** Responsive **web PWA** (`apps/web/`), **mobile-first** (≤ 480px primary).
- **UI system:** **Angular Material 3** — UX-DR11; tokens via `var(--mat-sys-*)`. `DESIGN.md` owns look; this spine owns behavior.
- **Chrome:** **No** member shell (no top app bar nav, no rail) on auth routes — per [ux-hub-a-faire.md](../../ux-hub-a-faire.md).
- **Identity provider:** Google Cloud Identity Platform (Firebase client SDK). Sign-up = `createUserWithEmailAndPassword`; sign-in = `signInWithEmailAndPassword`; then HatCast session via existing bridge.

## Information Architecture

| Surface | Route | Purpose | Primary CTA |
|---------|-------|---------|-------------|
| Connexion | `/connexion` | Returning user | **Se connecter** |
| Inscription | `/inscription` | New email/password account | **Créer mon compte** |
| Mot de passe oublié | `/mot-de-passe-oublie` | Reset request (story 1.3) | Envoyer le lien |
| Réinitialiser MDP | `/reinitialiser-mot-de-passe` | OOB reset (story 1.3) | (existing) |

**Navigation between auth surfaces:**

```
/connexion  ←→  /inscription     (footer text links)
/connexion  →   /mot-de-passe-oublie   (from connexion only)
```

**Out of scope 1.2b:** `/compte`, member hub, PWA install prompts on auth pages.

→ Visual composition: reuse [`login.html`](../../../../apps/web/src/app/pages/login/login.html) structure; new `signup` page mirrors shell. Spine wins on conflict.

## Voice and Tone

Microcopy in **French**. Calm, direct, no exclamation marks.

| Do | Don't |
|----|-------|
| « Créer un compte » (page title) | « Inscription » as sole H1 if team prefers « Créer un compte » per PLAN — **use Créer un compte** as H1 |
| « Créer mon compte » (button) | « S'inscrire » / « Register » |
| « Pas de compte ? » / « Déjà un compte ? » | « New here? » |
| « Les deux mots de passe ne correspondent pas. » | Technical Firebase codes in UI |
| Generic auth errors (1.2) | « Cet email n'existe pas » vs « Mauvais mot de passe » |

**Taglines (proposed):**

| Route | Tagline |
|-------|---------|
| `/connexion` | Pour continuer vers HatCast |
| `/inscription` | Rejoins HatCast pour gérer ta troupe |

## Component Patterns

Behavioral. Visual: `DESIGN.md`.

| Pattern | Connexion | Inscription |
|---------|-----------|-------------|
| Google block | Yes, top | Yes, top (same order) |
| Separator « ou » | If email auth enabled | If email auth enabled |
| Email field | Required | Required |
| Password field | Required, `autocomplete="current-password"` | Required, `autocomplete="new-password"` |
| Confirm password | **No** | **Required** |
| Remember me | Yes | **No** |
| Forgot password link | Yes | **No** |
| Footer cross-link | → `/inscription` | → `/connexion` |
| Primary submit | `signInWithEmail()` | `registerWithEmail()` (or equivalent) |

**Email auth hidden:** When `hasFirebaseWebConfig()` is false, show **only** Google (and dev hint if `isDev`). Do **not** show « Créer un compte » linking to a broken email form.

## State Patterns

| State | Surface | Treatment |
|-------|---------|-----------|
| Default | Both | Empty fields; Google ready |
| Invalid form | Both | `markAllAsTouched`; Material field errors |
| Password mismatch | Inscription | Snackbar before IdP call: *Les deux mots de passe ne correspondent pas.* |
| IdP / API error | Both | Snackbar via `userMessageForIdentityPlatformAuth` / API helpers — generic |
| Success | Both | Existing `finishIdpSignIn` → post-login navigation (no interim celebration screen) |
| Dev diagnostic | Connexion | `devLog` pre block — **not** on inscription unless dev parity requested |

## Interaction Primitives

- **Submit** — primary button triggers **one** action matching the page intent.
- **Cross-route** — `routerLink` navigation; preserve `returnUrl` / query params if already used on `/connexion` (apply same on `/inscription`).
- **Google** — real user gesture via GSI overlay (no programmatic `.click()`).
- **Banned (1.2b):**
  - Single form with link that calls register while page title says Connexion
  - Tabs or segmented control toggling connexion/inscription on one URL
  - Modal overlay signup from member app
  - V1 multi-step « email verification first » signup chain
  - Second primary button on one screen

## Accessibility Floor

- Page `h1` matches route purpose (announced on navigation).
- Separator: `role="separator"` + `aria-label="ou"`.
- Google overlay: `aria-label="Continuer avec Google"`.
- Link-styled controls: accessible name in French; focus visible (theme).
- Tap targets ≥ **48dp** on primary button and footer links.
- Password confirmation field associated with label **Confirmer le mot de passe**.
- Error snackbars: sufficient duration (existing 8s pattern on auth errors).

## Inspiration & Anti-patterns

- **Lifted — industry standard:** Separate login and register URLs (GitHub, Notion, many SaaS).
- **Lifted — HatCast V2:** Existing `/connexion` card + Google stack (keep).
- **Rejected — 1.2 interim:** « Créer un compte » button reusing connexion form without changing H1/CTA.
- **Rejected — V1 `AccountCreationModal`:** Email-first verification wizard for 1.2b scope (different technical path; confuses users who expect immediate account).
- **Rejected — dual primary CTAs:** « Se connecter » + « Créer mon compte » on same view.

## Key Flows

### Flow 1 — Sophie creates an email account (first visit, phone)

1. Sophie lands on `/connexion` (or deep link redirects there).
2. She reads **Connexion**, sees Google, scrolls to email.
3. She taps **Créer un compte** in the footer → navigates to `/inscription`.
4. Page shows **Créer un compte**, same Google block, email + password + confirm.
5. She fills fields, taps **Créer mon compte**.
6. **Climax:** Snackbar success path absent — she lands in the member app (agenda/accueil per post-login rules) with session active.

Failure: passwords differ → snackbar at step 5, no IdP call. Email already used → generic IdP message.

### Flow 2 — Marc returns (existing email account)

1. Marc opens `/connexion`.
2. Enters email + password, checks **Se souvenir de moi** if desired.
3. Taps **Se connecter**.
4. **Climax:** Same post-login landing as today — no detour through inscription.

Failure: wrong credentials → generic message (no enumeration).

### Flow 3 — Sophie prefers Google (either entry)

1. From `/connexion` or `/inscription`, taps **Continuer avec Google**.
2. Completes Google flow (unchanged 1.1).
3. **Climax:** Member app — inscription page was optional pit stop.

## Implementation traceability (1.2b)

| AC area | Spine section |
|---------|----------------|
| New route `/inscription` | IA, Flow 1 |
| Connexion cleanup | Component Patterns, Banned |
| Confirm password | Component Patterns, State Patterns |
| M3 / mobile | Foundation, DESIGN.md |
| Tests | Flow 1–3 happy + mismatch + cross-links |
