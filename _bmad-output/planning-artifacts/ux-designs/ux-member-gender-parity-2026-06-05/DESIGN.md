---
name: HatCast V2 — Member gender & team parity
description: Visual delta for optional gender on Mon profil and composition parity info strip — inherits HatCast Material 3 theme.
status: approved-screen1-screen2-amended-guidances-2026-06-06
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
  composition-guidances:
    container: event-equipe-tab__guidances
    testid: composition-guidances
    aria-label: Indicateurs de composition
    layout: flex-wrap pills in subtle strip
  composition-parity-indicator:
    form: guidance-pill inside composition-guidances
    icon: groups
    icon-size: 18px
    score-bon-tokens: '{components.participation-available-badge}'
    score-acceptable-tokens: '{components.participation-neutral-badge}'
    score-faible-tokens: '{components.participation-declined-badge}'
  participation-available-badge:
    bg: '--hatcast-participation-available-badge-bg'
    fg: '--hatcast-participation-available-badge-fg'
  participation-neutral-badge:
    bg: '--hatcast-participation-neutral-badge-bg'
    fg: '--hatcast-participation-neutral-badge-fg'
  participation-declined-badge:
    bg: '--hatcast-participation-declined-badge-bg'
    fg: '--hatcast-participation-declined-badge-fg'
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

## Colors — parity indicator (6.21)

Semantic score colors — reuse HatCast participation badge tokens (no raw hex):

| Score | Semantic | Token pair |
|-------|----------|------------|
| **Bon** | Vert (positive) | `--hatcast-participation-available-badge-bg` / `-fg` |
| **Acceptable** | Gris (neutral) | `--hatcast-participation-neutral-badge-bg` / `-fg` |
| **Faible** | Orange (attention, not error) | `--hatcast-participation-declined-badge-bg` / `-fg` |

Apply as **text + optional soft pill background** on the compact line — not a full-width bandeau.

**Do not use** `--mat-sys-error`, warning amber per-slot triggers (**6.20**), or `--hatcast-sys-pending` (reserved pending confirmation).

**Note:** orange « faible » shares the tertiary family with declined/désistement badges — context is copy + placement, not avatar gender tone.

## Typography

| Element | Style |
|---------|--------|
| Gender question | `.account-page__gender-label` — 0.875rem, medium weight, `on-surface-variant` |
| Toggle labels | 0.8125rem, `body-medium` |
| Parity indicator | `body-small`, single line, score-colored text |

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

### Équipe — guidances composition (team-level) — **amended 2026-06-06**

Above `<ul class="event-equipe-tab__grid">`, below draw animation. **Not** in `event-detail` lifecycle status row.

```
┌─ Indicateurs de composition (guidances strip) ─────┐
│  👥 Mixité acceptable   (future pills…)           │
└───────────────────────────────────────────────────┘
[ slot grid … ]
  └─ per row: ⚠ slot-level warnings (6.20, multi-role)
```

- Container: `section.event-equipe-tab__guidances`, `data-testid="composition-guidances"`, `aria-label="Indicateurs de composition"`.
- Hidden when `showCompositionGuidances` is false (no active team-level signals).
- Each pill: `div.event-equipe-tab__guidance` + signal-specific modifiers.

**Parity pill** (`composition-gender-parity-indicator`):

- Classes: `event-equipe-tab__parity--bon|acceptable|faible`.
- Optional tap/tooltip → *2 F · 3 H* (only when all assigned genders known).

**Rejected placement:** parity chip beside lifecycle badge (« À compléter ») — mixes workflow state with qualitative composition hints.

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

### `composition-guidances`

- Container: `section.event-equipe-tab__guidances`, `data-testid="composition-guidances"`.
- Extensible: add future team-level pills inside the same strip (e.g. composition originality).

### `composition-parity-indicator`

- Container: `div.event-equipe-tab__guidance.event-equipe-tab__parity`, `role="status"`, `data-testid="composition-gender-parity-indicator"`.
- Modifier classes: `--bon`, `--acceptable`, `--faible` only.
- `mat-icon` `groups`, `aria-hidden="true"`.
- Optional: `matTooltip` or button with tooltip for numeric detail (progressive disclosure).

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
- Don't use full-width tinted bandeau (vertical budget on mobile).
- Don't show exact F/H counts in the main line (tooltip optional).
- Don't block toolbar actions when parity is imbalanced.
