---
name: HatCast V2 — Member gender & team parity
description: Visual delta for optional gender on Mon profil and composition parity info strip — inherits HatCast Material 3 theme.
status: approved-screen1
sources:
  - _bmad-output/specs/spec-member-gender-parity/SPEC.md
  - _bmad-output/planning-artifacts/ux-design-mon-compte.md
  - _bmad-output/planning-artifacts/ux-design-composition-consecutive-show-warning.md
  - docs/v2/technical/FRONTEND_UI.md
updated: 2026-06-05
colors:
  on-surface: '{inheritance.mat-sys-on-surface}'
  on-surface-muted: '{inheritance.mat-sys-on-surface-variant}'
  primary: '{inheritance.mat-sys-primary}'
  primary-container: '{inheritance.mat-sys-primary-container}'
  tertiary-container: '{inheritance.mat-sys-tertiary-container}'
  gender-neutral-bg: '{inheritance.hatcast-member-gender-neutral-bg}'
  gender-neutral-fg: '{inheritance.hatcast-member-gender-neutral-fg}'
  gender-female-bg: '{inheritance.hatcast-member-gender-female-bg}'
  gender-female-fg: '{inheritance.hatcast-member-gender-female-fg}'
  gender-male-bg: '{inheritance.hatcast-member-gender-male-bg}'
  gender-male-fg: '{inheritance.hatcast-member-gender-male-fg}'
typography:
  section-title: '{inheritance.account-page__section-title}'
  gender-question: '{inheritance.account-page__gender-label}'
  body-small: '{inheritance.mat-sys-body-small}'
rounded:
  parity-strip: 0.5rem
spacing:
  profile-block-gap: 1rem
  gender-row-gap: 0.5rem
  toggle-min-height: 2.75rem
  parity-strip-padding: 0.625rem 0.75rem
  parity-icon-gap: 0.375rem
components:
  account-profile-block:
    wrapper: account-page__profile-block
    save-button: account-page__profile-save
    save-testid: account-profile-save
  account-gender-toggle:
    control: mat-button-toggle-group horizontal, wrap on narrow screens
    question-id: account-gender-label
    order: female | non_specified | male
  composition-parity-strip:
    background: 'color-mix(in srgb, var(--mat-sys-primary) 10%, transparent)'
    foreground: '{colors.on-primary-container}'
    icon: groups
    icon-size: 18px
    radius: '{rounded.parity-strip}'
    border: '1px solid color-mix(in srgb, var(--mat-sys-primary) 22%, transparent)'
  season-parity-card:
    note: 'mat-card outlined on Statistiques ligue — same token family as other summary cards'
---

## Brand & Style

Brownfield extension — **no ad hoc hex palette**. Mon profil gender uses the same account page vocabulary as pseudo (`account-page__profile-block`, shared **Enregistrer**). Selected toggle segment and avatar letter fallback share **`--hatcast-member-gender-*`** tokens defined in [`_hatcast-semantic-colors.scss`](../../../../apps/web/src/styles/_hatcast-semantic-colors.scss).

Posture: **respectueux et optionnel** — gender tones are mnemonic (grey / orange / purple), not stereotypical blue-pink.

## Colors — gender (Screen 1, frozen)

| Semantic | Token | Hue |
|----------|--------|-----|
| `non_specified` | `--hatcast-member-gender-neutral-bg` / `-fg` | Grey (`--hatcast-participation-neutral-*`) |
| `female` | `--hatcast-member-gender-female-bg` / `-fg` | Orange (`--mat-sys-tertiary-container`) |
| `male` | `--hatcast-member-gender-male-bg` / `-fg` | Purple (`--mat-sys-primary-container`) |

Apply to:

1. `.mat-button-toggle-checked.account-page__gender-toggle-option--{neutral|female|male}`
2. `app-user-avatar` host classes `user-avatar--tone-{neutral|female|male}`

**Do not use** `--mat-sys-secondary-*` or raw `#rrggbb` for gender.

## Colors — parity strip (6.21)

| Role | Token |
|------|--------|
| Parity strip background | `color-mix(in srgb, var(--mat-sys-primary) 10%, transparent)` |
| Parity strip text | `{colors.on-primary-container}` or `{colors.on-surface}` if contrast fails |
| Parity strip border | `color-mix(in srgb, var(--mat-sys-primary) 22%, transparent)` |

**Do not use** `--mat-sys-error` or warning amber for parity strip (reserved for 6.20 / multi-role warnings).

## Typography

| Element | Style |
|---------|--------|
| Gender question | `.account-page__gender-label` — 0.875rem, medium weight, `on-surface-variant` |
| Toggle labels | 0.8125rem, `body-medium` |
| Parity strip | `body-small`, single line preferred |

**No** `mat-hint` under pseudo or gender on Mon profil (2026-06-05).

## Layout & Spacing

### Mon profil — profile block (frozen)

Placed **after** avatar/e-mail row, **before** « Modes de connexion ».

```
[ avatar | email + edit ]
[ displayName if distinct ]

Pseudo [____________]

Quel genre utiliser pour me désigner ?
┌──────────┬────────────┬──────────┐
│ Féminin  │ Non spéc.  │ Masculin │  ← default: centre selected
└──────────┴────────────┴──────────┘

[ Enregistrer ]
```

- Wrapper: `.account-page__profile-block` — column, gap ~1rem.
- Toggle group: full width, `flex-wrap`; each segment `flex: 1 1 auto`, `{spacing.toggle-min-height}` min-height.
- Save button: `.account-page__profile-save`, `min-height: 3rem`.
- Spinner while loading preferences replaces entire block.

### Équipe — parity strip

Above `<ul class="event-equipe-tab__grid">`, below draw animation block.

```
┌─────────────────────────────────────────────┐
│ 👥  Joueurs : 2 F · 4 H  (33 % femmes)      │
└─────────────────────────────────────────────┘
[ slot grid … ]
```

- Horizontal flex: icon + text; wrap on narrow screens.
- Margin-bottom: `0.75rem` before grid.

## Shapes

- Parity strip: `{rounded.parity-strip}` (8px) — matches équipe hint rows.
- Avatar: circle, size 72px on Mon profil preview.

## Components

### `account-gender-toggle` (frozen)

- Label: `<p id="account-gender-label">` — question copy in EXPERIENCE.md.
- `mat-button-toggle-group` `name="memberGender"`, `data-testid="account-gender-group"`.
- Static three toggles (not `@for`) with `value="female" | "non_specified" | "male"`.
- Per-option classes: `account-page__gender-toggle-option--female|neutral|male`.
- Per-option `data-testid`: `account-gender-female`, `account-gender-non-specified`, `account-gender-male`.

### `account-profile-save`

- Single primary flat button; disabled when pseudo empty, unchanged, loading, or saving.
- Spinner 20px inside button while PATCH in flight.

### `composition-parity-strip`

- Container: `div.event-equipe-tab__parity-strip`, `role="status"`.
- `mat-icon` `groups`, `aria-hidden="true"`.

### `season-parity-card` (story 16.3)

- `mat-card` outlined in Statistiques ligue summary area.

## Do's and Don'ts

**Do**

- Pre-select **Non spéc.** when gender unknown (API + UI `effectiveMemberGender`).
- Match toggle selected hue to avatar letter tone.
- Use one **Enregistrer** for pseudo and gender together.

**Don't**

- Don't use vertical radio group or immediate PATCH on gender alone.
- Don't show hint paragraphs under pseudo or gender (UI clutter).
- Don't use emoji avatars on Mon profil (letter only).
- Don't use blue/pink gender coding.
- Don't show gender field on Préférences or Notifications tabs.
- Don't block toolbar actions when parity is imbalanced.
