---
name: HatCast Auth (connexion / inscription)
description: Material 3 auth chrome for unauthenticated routes. Extends global HatCast M3 theme; no separate brand palette.
status: final
sources:
  - {planning_artifacts}/ux-design-auth-inscription-1-2b.md
  - docs/v2/technical/FRONTEND_UI.md
  - apps/web/src/app/pages/login/login.scss
updated: 2026-06-03
colors:
  auth-canvas: '{note: var(--mat-sys-surface) mixed with surface-container-low — see login .auth-page}'
  auth-card-surface: '{note: var(--mat-sys-surface) via mat-card outlined}'
  auth-primary: '{note: var(--mat-sys-primary)}'
  auth-on-surface: '{note: var(--mat-sys-on-surface)}'
  auth-outline: '{note: var(--mat-sys-outline-variant)}'
  auth-error: '{note: var(--mat-sys-error)}'
typography:
  auth-heading:
    note: 'Material title-large / login__heading — page title (Connexion | Créer un compte)'
  auth-tagline:
    note: 'Material body-medium, secondary tone via on-surface-variant — one line under title'
  auth-wordmark:
    note: 'login__wordmark-text — brand label beside logo'
  auth-link:
    note: 'login__text-link — text button for cross-route (not mat-button)'
rounded:
  card: '{note: Material outlined card — theme default}'
  field: '{note: mat-form-field outline appearance}'
spacing:
  page-padding: '1.25rem 1rem 2rem'
  column-gap: '1rem'
  card-max-width: '26rem'
components:
  auth-page:
    background: '{colors.auth-canvas}'
    layout: 'centered flex, min-height 100dvh'
  auth-card:
    maxWidth: '{spacing.card-max-width}'
    appearance: 'outlined'
  auth-brand-mark:
    logoSize: '48px'
    gap: '0.5rem'
  auth-google-stack:
    note: 'Visual mat-stroked-button + GSI overlay — do not restyle Google brand colors'
  auth-separator:
    label: 'ou'
    role: 'separator'
  auth-submit:
    variant: 'mat-flat-button primary full width'
  auth-text-link:
    variant: 'native button.login__text-link or routerLink styled as link'
---

## Brand & Style

Auth screens are **functional airlock**, not marketing. The user is blocked from their troupe until identity is established — the UI should feel **familiar, calm, and identical** whether they sign in or sign up. HatCast does not invent a second visual language here: it reuses the **same centered card** already proven on `/connexion` (logo HatCast 2 + wordmark, one headline, one tagline).

Posture: **clarity over cleverness**. Two pages, two titles, two primary buttons. No mode switches, no hidden second submit.

## Colors

All color comes from the **global M3 theme** (`--mat-sys-*`). Auth does not introduce hex overrides.

- **Canvas** — subtle mix of `surface` and `surface-container-low` (see `.auth-page` in `login.scss`) so the card reads as elevated without heavy shadow.
- **Primary actions** — `primary` flat buttons only for the **main intent** of the page (Se connecter / Créer mon compte).
- **Google** — keep official G logo SVG colors on the stroked visual button; overlay hosts real GSI control.
- **Errors** — snackbars use existing `auth-user-message` patterns; fields use Material error state, not custom red panels.

Avoid: gradient hero backgrounds, illustration-heavy signup, second primary color on the same screen.

## Typography

- **Page title (`auth-heading`)** — must change per route: **Connexion** vs **Créer un compte**. Never show « Connexion » on the signup route.
- **Tagline** — single supporting line; connexion keeps *Pour continuer vers HatCast*; inscription may use *Rejoins HatCast pour gérer ta troupe* or equivalent **one sentence** (finalize copy in story).
- **Cross-links** — body size, link color from theme; underline on hover/focus per existing `login__text-link`.

## Layout & Spacing

- **Mobile-first** — card `max-width: 26rem`, horizontal padding `{spacing.page-padding}`.
- **Vertical stack** — brand → Google → separator → email form → cross-link paragraph; gap `{spacing.column-gap}`.
- **Full-width** primary CTA and form fields (`width: 100%` on submit and fields).
- **Desktop** — same centered column; no split layout, no side illustration.

## Elevation & Depth

Single **outlined** `mat-card`. No nested cards, no dialog stack for signup. Depth = card outline + canvas tone, not box-shadow drama.

## Shapes

Material defaults for fields and buttons. Card corners follow theme. Logo mark is square 48×48 SVG.

## Components

### Auth page shell (`auth-page`)

Shared wrapper for `/connexion` and `/inscription`: full viewport centering, background per `{colors.auth-canvas}`.

### Auth card (`auth-card`)

`mat-card` `appearance="outlined"`, class `login__card` (or renamed `auth__card` if refactored). Inner column `login__column`.

### Brand block

Logo `/icons/logo-hatcast-2.svg` + wordmark **HatCast** + `h1` + tagline `p`. Center-aligned.

### Google block (`auth-google-stack`)

Unchanged from story 1.1 / 1.2: visual stroked button + transparent GSI overlay. Label: **Continuer avec Google** on **both** routes.

### Separator

Horizontal rules + **ou** — `role="separator"` `aria-label="ou"`.

### Email form

`mat-form-field` `appearance="outline"` `subscriptSizing="dynamic"`. Labels: **Email**, **Mot de passe**; inscription adds **Confirmer le mot de passe**.

### Connexion-only row

`mat-checkbox` **Se souvenir de moi** + text link **Mot de passe oublié ?** → `/mot-de-passe-oublie`.

### Primary submit

`mat-flat-button` `color="primary"` full width: **Se connecter** OR **Créer mon compte** — never both on one page.

### Cross-route link

Footer line: *Pas de compte ?* / *Déjà un compte ?* + `routerLink` to sibling route (not `type="button"` calling register on connexion form).

## Do's and Don'ts

| Do | Don't |
|----|-------|
| Match `/connexion` visual shell on `/inscription` | Different card width or missing logo on signup |
| One primary CTA per page | Two flat primary buttons |
| `autocomplete="new-password"` on signup password fields | `current-password` on signup |
| French labels throughout | English placeholders on production UI |
| 48dp touch targets on links and buttons | Tiny text-only hit areas |
