---
name: HatCast V2 — Event Infos actions (calendar & maps)
description: Visual delta for interactive date/lieu rows on event Infos tab — inherits HatCast Material 3 theme; no new brand palette.
status: final
sources:
  - _bmad-output/implementation-artifacts/investigations/event-calendar-maps-v1-v2-parity-investigation.md
  - _bmad-output/planning-artifacts/ux-design-hatcast-v2.md
  - docs/v2/technical/FRONTEND_UI.md
updated: 2026-06-05
party-mode-review: 2026-06-05
colors:
  surface-field: '{inheritance.mat-sys-surface-container-high}'
  on-surface: '{inheritance.mat-sys-on-surface}'
  on-surface-muted: '{inheritance.mat-sys-on-surface-variant}'
  primary: '{inheritance.mat-sys-primary}'
  outline-subtle: '{inheritance.mat-sys-outline-variant}'
typography:
  field-label:
    note: 'Existing .event-infos__label — 0.7rem, uppercase, letter-spacing 0.06em'
  field-value:
    note: 'Existing .event-infos__value — 0.95rem, line-height 1.45'
rounded:
  field: 0.5rem
  menu-panel: '{inheritance.mat-sys-shape-corner-medium}'
spacing:
  field-padding-y: 0.75rem
  field-padding-x: 0.9rem
  icon-gap: 0.5rem
  row-min-height: 48px
components:
  event-infos-action-row:
    background: 'color-mix(in srgb, var(--mat-sys-on-surface) 8%, transparent)'
    foreground: '{colors.on-surface}'
    radius: '{rounded.field}'
    min-height: '{spacing.row-min-height}'
    hover-background: 'color-mix(in srgb, var(--mat-sys-on-surface) 12%, transparent)'
    focus-ring: '{colors.primary}'
    trailing-icon: expand_more
    trailing-icon-open: 'expand_more rotated 180deg'
  event-infos-readonly-field:
    background: 'color-mix(in srgb, var(--mat-sys-on-surface) 6%, transparent)'
  event-infos-action-row-disabled:
    background: '{components.event-infos-action-row.background}'
    foreground: '{colors.on-surface-muted}'
    cursor: default
  mat-menu-panel-calendar:
    note: 'Standard mat-menu; min-width 12rem'
  mat-menu-item-external:
    note: 'mat-menu-item; optional leading mat-icon 20px; opens new tab for Google/Outlook/Waze'
---

## Brand & Style

HatCast V2 is a **brownfield extension** of the existing dark Material 3 app shell. This DESIGN.md does **not** introduce a new visual identity — it specifies how two existing Infos fields (Date, Lieu) become **action rows** while matching the current `event-infos-tab` field vocabulary (label above, rounded value block, muted uppercase labels).

Visual posture: **utilitaire et calme** — action rows are **slightly brighter at rest** (8% vs 6% for read-only fields) so mobile users see tappability without hover. Trailing chevron uses `{colors.on-surface}` (not muted). Chevron **rotates 180°** when menu open (PO B3). No emoji in menus; use **Material menu items** with French labels only.

## Colors

All colors inherit from the global M3 theme in `apps/web/src/styles.scss`. Action rows reuse the existing field surface (`rgba(255,255,255,0.06)` today → prefer `color-mix` with `{colors.on-surface}` for consistency with FRONTEND_UI checklist).

| Token role | Usage |
| ---------- | ----- |
| `{colors.on-surface}` | Date/time text, location text |
| `{colors.on-surface-muted}` | Empty lieu copy (*Non renseigné*) only |
| `{colors.on-surface}` | Trailing chevron on action rows (always visible) |
| `{colors.primary}` | Focus-visible ring on action row |
| Menu panel | Default `mat-menu` surface — no custom panel color |

**Not used:** embedded map iframe, map tint, brand greens/oranges for these controls.

## Typography

Unchanged from parent Infos tab:

- **Labels** (`DATE`, `LIEU`): existing `.event-infos__label`
- **Values**: existing `.event-infos__value` — date formatted `fr-FR` with weekday + hour (Europe/Paris)
- **Menu items**: Material `body-medium` via menu defaults

## Layout & Spacing

- Action row = full width of field column; **min-height 48px** touch target (FRONTEND_UI).
- Layout inside row: `[mat-icon leading] [flex text] [mat-icon expand_more trailing]`
- Location text: `truncate` with ellipsis on narrow viewports; full string in `title` tooltip attribute.
- Menu opens **below** trigger, aligned **start** (same as V1 dropdown).
- Mobile: `overlayPanelClass` with `max-height: calc(100dvh - env(safe-area-inset-bottom) - 8px)`.
- **No** map block below lieu — links-only scope.

## Elevation & Depth

- Action row: flat (same as current value blocks).
- `mat-menu`: default M3 overlay elevation — no custom shadow.

## Shapes

- Field / row corner radius: **0.5rem** (match `.event-infos__value`).

## Components

### `event-infos-action-row` (Date & Lieu when interactive)

| Part | Spec |
| ---- | ---- |
| Element | `<button type="button">` — **not** a div; wraps picto + text + chevron |
| Leading icon | Date: `event` · Lieu: `place` · `aria-hidden="true"` |
| Trailing icon | `expand_more` · `aria-hidden="true"` · `transform: rotate(180deg)` when menu open |
| Hover / focus | Slight background lift per `{components.event-infos-action-row.hover-background}` |
| `aria-expanded` | `true`/`false` when menu open |
| `aria-haspopup` | `menu` |
| Disabled | Same surface, muted text, no chevron animation, `cursor: default` |

### `mat-menu` — calendar

| Item | Label FR | Icon (optional) |
| ---- | -------- | ---------------- |
| 1 | Google | — |
| 2 | Outlook | — |
| 3 | Apple (fichier .ics) | — |

Section label inside menu (optional `mat-menu-item` disabled or caption): *Ajouter à votre agenda :*

### `mat-menu` — lieu

| Item | Label FR | Behavior |
| ---- | -------- | -------- |
| 1 | Ouvrir dans Google Maps | `target="_blank"` `rel="noopener noreferrer"` |
| 2 | Ouvrir dans Waze | same |

### Empty lieu (non-interactive)

Same visual as today: italic *Non renseigné* inside static `.event-infos__value` — **no** button, **no** chevron.

## Do's and Don'ts

**Do**

- Reuse `mat-menu` + `MatMenuTrigger` on the action row button.
- Keep labels `DATE` / `LIEU` outside the button (unchanged structure).
- Use `MatSnackBar` for post-action feedback (calendar), matching other event-detail flows.

**Don't**

- Don't add iframe / Google Maps embed (out of scope).
- Don't use raw hex colors or Tailwind as primary styling surface.
- Don't make title/description rows interactive — scope is Date and Lieu only.
- Don't show calendar menu when event is loading; disable if `startsAt` invalid.
