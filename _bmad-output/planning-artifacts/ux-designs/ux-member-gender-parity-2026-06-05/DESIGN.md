---
name: HatCast V2 — Member gender & team parity
description: Visual delta for optional gender on Mon profil and composition parity info strip — inherits HatCast Material 3 theme.
status: final
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
  on-primary-container: '{inheritance.mat-sys-on-primary-container}'
typography:
  section-title: '{inheritance.account-page__section-title}'
  field-hint: '{inheritance.mat-form-field-subscript}'
  body-small: '{inheritance.mat-sys-body-small}'
rounded:
  parity-strip: 0.5rem
spacing:
  gender-block-margin-top: 1.5rem
  radio-stack-gap: 0.25rem
  parity-strip-padding: 0.625rem 0.75rem
  parity-icon-gap: 0.375rem
components:
  account-gender-fieldset:
    legend: 'Genre'
    control: mat-radio-group vertical stack
    hint: mat-hint below group
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

Brownfield extension — **no new palette**. Gender on Mon profil uses the same account page vocabulary as pseudo (`account-page__section`, `mat-form-field` spacing rhythm). Parity strip on Équipe is **informational** (primary-tinted), deliberately **not** the warning/error mix used for consecutive-show hints (**6.20**).

Posture: **respectueux et optionnel** — no icons implying judgment on balance; neutral `groups` icon.

## Colors

| Role | Token |
|------|--------|
| Gender labels | `{colors.on-surface}` |
| Gender hint | `{colors.on-surface-muted}` |
| Parity strip background | `color-mix(in srgb, var(--mat-sys-primary) 10%, transparent)` |
| Parity strip text | `{colors.on-primary-container}` or `{colors.on-surface}` if contrast fails |
| Parity strip border | `color-mix(in srgb, var(--mat-sys-primary) 22%, transparent)` |
| Saving spinner on gender | `{colors.primary}` |

**Do not use** `--mat-sys-error` or warning amber for parity strip (reserved for 6.20 / multi-role warnings).

## Typography

| Element | Style |
|---------|--------|
| Fieldset legend « Genre » | Same as `account-page__section-title` or `mat-label` weight |
| Radio labels | `body-medium` |
| Hint under gender | `mat-hint` — `{typography.field-hint}` |
| Parity strip | `body-small`, single line preferred |

## Layout & Spacing

### Mon profil — genre block

Placed **after** pseudo block, **before** section « Modes de connexion ».

```
[ avatar | email + edit ]
[ Pseudo field + Enregistrer ]

Genre                          ← legend
( ) Homme
( ) Femme
(•) Non précisé
Personnalise les libellés…     ← hint

── Modes de connexion ──
```

- Vertical `mat-radio-button` stack, `gap` ~4px between rows.
- Full width on mobile; max-width follows `account-page` column.
- Touch target: entire radio row ≥ 48dp height (padding on `mat-radio-button`).

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
- No card elevation on strip (flat inline banner).

## Components

### `account-gender-fieldset`

- `fieldset` + `legend` « Genre » (`id` for `aria-labelledby` if needed).
- `mat-radio-group` `aria-describedby="account-gender-hint"`.
- `data-testid="account-gender-group"`.
- Per option `data-testid`: `account-gender-male`, `account-gender-female`, `account-gender-non-specified`.

### `composition-parity-strip`

- Container: `div.event-equipe-tab__parity-strip`, `role="status"` (updates when slots change).
- `mat-icon` `groups`, `aria-hidden="true"`.
- Hidden when `!canEditSlots()` && organizer read path without manage rights (same gate as consecutive warnings for orgas).

### `season-parity-card` (story 16.3)

- `mat-card` outlined in Statistiques ligue summary area.
- Title: « Parité sur scène (Comédien·ne) ».
- Body: one line stats + optional subtitle for season scope.

## Do's and Don'ts

**Do**

- Use gender-aware role labels in slot placeholders when empty (`Comédienne` vs `Comédien·ne` for viewer context only on filled rows use participant gender).
- Show `mat-progress-spinner` inline (20px) beside radio group while PATCH in flight.
- Truncate parity strip with ellipsis on very small screens; full text in `title` attribute.

**Don't**

- Don't use warning colors for parity strip.
- Don't show gender field on Préférences or Notifications tabs.
- Don't expose raw enum in UI (`male` never shown).
- Don't block toolbar actions when parity is imbalanced.
