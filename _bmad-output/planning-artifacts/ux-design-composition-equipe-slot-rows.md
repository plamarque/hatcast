# UX — Équipe tab slot rows (composition grid)

**Status:** Validated **2026-06-05** (checkpoint Sally + Patrice)  
**Screen:** Event detail → tab **Équipe** (`app-event-equipe-tab`)  
**Related:** [Équipe tab (hatcast-v2)](ux-design-hatcast-v2.md#screen-event-detail-equipe-tab), [consecutive-show hint](ux-design-composition-consecutive-show-warning.md), spec [composition single-role](../implementation-artifacts/spec-composition-single-role-per-event.md)

---

## Goal

One **slot row per role** to fill, with a **stable grid**, **role always visible** (filled or empty), **whole-row tap** for the primary action, and **compact organizer hints** on a second line.

---

## Row layout (CSS grid)

Each `<li class="event-equipe-tab__row">` uses a **3-column grid**:

| Column | Width | Content |
|--------|-------|---------|
| 1 — Rôle | `7.25rem` fixed | Role **pill** (emoji + French label) |
| 2 — Corps | `1fr` | Avatar + name, or vacant state |
| 3 — Action | `2.5rem` | Clear (×) when organizer may unassign |

**Second row** (optional): hint pills span **columns 2–3**, **left edge aligned with the avatar** (not the name).

```
┌─────────────────────────────────────────────────────────┐
│ [🎭 Comédien·ne]  (○) Patrice                      [×] │
│                   [⚠ Deux rôles le même soir]          │
└─────────────────────────────────────────────────────────┘
┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐
│ [🎤 MC]           ( ) À pourvoir                        │
└ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘
```

**Grid tokens (component):**

- `--equipe-role-col: 7.25rem`
- `--equipe-clear-col: 2.5rem`
- Column gap: `0.65rem`; row gap: `0.3rem`

**Body sub-grid** (`event-equipe-tab__slot`): `2rem` avatar column + name; vacant rows use a **2rem spacer** so « À pourvoir » aligns with the **name** column.

---

## Role pill

Same visual language as **Activité** audit pills (`audit-pill--role`):

- Emoji + singular role label via `auditRoleDisplay(roleKey)` (e.g. `🙅 Arbitre`, `🎭 Comédien·ne`)
- Tokens: `surface-container-high` background, `outline-variant` border, `on-surface` text
- **Always shown** — role does not disappear when the slot is filled

---

## Vacant slot

- Copy: **« À pourvoir »** — muted `body-medium`, no dashed inner box (role pill already identifies the role)
- Gap-empty rows (post-decline): parent row keeps **dashed yellow** border (`event-equipe-tab__row--gap-empty`)

---

## Whole-row interaction

When the row is tappable (`event-equipe-tab__row-hit`):

| Audience / state | Tap target | Action |
|------------------|------------|--------|
| Organizer (editable) | Pill + body | Open slot picker |
| Organizer (gap empty) | Pill + body | Open slot picker |
| Member (own slot) | Pill + body | Participation modal |
| Proxy participation | Pill + body | Participation modal (proxy) |
| Member (foreign slot, locked) | Pill + body | Snackbar — own slot only |

- **Clear (×)** and **hint buttons** use `stopPropagation` — they do not trigger the row action
- `aria-label` on row-hit describes role + assignee (FR)
- Hint row hidden when empty (`:empty { display: none }`)

---

## Organizer hints (non-blocking)

Shared pattern for **6.20** (consecutive show) and **multi-role same event**:

| Element | Spec |
|---------|------|
| Trigger | `mat-flat-button`-style **pill** (`event-equipe-tab__*-warning-trigger`) |
| Icon | `mat-icon` `warning_amber`, `aria-hidden` |
| Short label | One line on the row (tap toggles tooltip on mobile) |
| Detail | `matTooltip` below the trigger |
| Placement | Row 2, columns 2–3, **padding-inline-start: 0** (align with avatar left edge) |
| Audience | Organizers / admins only |

### Multi-role same event (manual stack, FR21)

| Surface | Copy |
|---------|------|
| Short label | **Deux rôles le même soir** |
| Tooltip | `{Prénom} est également {rôle genré} dans cette compo.` |

Role label in tooltip uses assignee `participantGender` when known (`getRoleLabel`).

### Consecutive show (6.20)

See [ux-design-composition-consecutive-show-warning.md](ux-design-composition-consecutive-show-warning.md) for tooltip template; **layout** follows this document (avatar-aligned hint row, pill trigger).

---

## Participation row styling

Unchanged semantic gradients (`--hatcast-participation-*-gradient-strong`) on the **row**; hint pills use an opaque dark strip on gradient rows for contrast.

---

## Declines list

Decline rows reuse the **same 3-column grid** (role pill | avatar + name | restore when allowed).

---

## Acceptance (QA / design review)

- [ ] Role pill visible on **every** slot row (filled, empty, declined)
- [ ] Avatar and name columns **vertically aligned** across rows regardless of role label length
- [ ] « À pourvoir » aligns with **name** column (not avatar center)
- [ ] Whole row opens picker / participation modal; × and hints remain independent
- [ ] Hint left edge aligns with **avatar** left edge
- [ ] Multi-role short label + tooltip per table above
- [ ] Checklist [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md) — tokens, touch targets, `aria-label`
