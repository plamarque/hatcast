# UX — Consecutive-show assignment warning (Epic 6.20)

**Status:** Spec for story **6.20** — SCP [2026-06-05](sprint-change-proposal-2026-06-05-composition-consecutive-show-warning.md)  
**Screen:** Event detail → tab **Équipe** (`app-event-equipe-tab`)  
**Audience:** Organizers and administrators only (draft + published composition editing)

---

## Goal

Surface a **non-blocking** hint when a slot assignment repeats the **same role** on the **immediately previous validated show** in the **same category compartment**.

---

## Trigger

| Event | Show warning? |
|-------|----------------|
| Manual slot assignment (picker confirm) | Yes, after API persists |
| Auto-draw completes | Yes, on affected filled slots |
| Slot cleared | Remove warning |
| Slot replaced | Recompute |
| Member read-only Équipe view | No (orga surfaces only) |

---

## Layout (mobile-first)

Extend each filled slot row in the Équipe list:

```
[emoji role] [ avatar | Name          ] [× clear]
             [ ⚠ Déjà en MC au spectacle « Match Malice » (12 juin 2026) ]
```

**Placement:** second line **below** participant name, full width of slot column, left-aligned with name (not avatar).

**Density:** single line if possible; truncate long titles with ellipsis + `title` tooltip for full string.

---

## Visual design (Material 3)

| Element | Token / component |
|---------|-------------------|
| Container | No extra card — inline row fragment |
| Icon | `mat-icon` `warning_amber`, 16–18px, `color: var(--mat-sys-on-surface-variant)` or warning mix |
| Text | `body-small`; `color: color-mix(in srgb, var(--mat-sys-error) 75%, var(--mat-sys-on-surface))` or `--mat-sys-tertiary` if warning palette unavailable — **prefer semantic warning tone, no hex** |
| Background | Optional subtle strip: `color-mix(in srgb, var(--mat-sys-error) 8%, transparent)` on the hint line only |

**Anti-patterns:** no `MatDialog`, no snackbar (too transient), no blocking `MatDialog` confirm.

---

## Copy (FR)

**Template:**

> Déjà en **{roleLabel}** au spectacle **« {eventTitle} »** ({formattedDate}).

- `{roleLabel}` — from `ROLE_LABELS` (Joueur, MC, …)
- `{eventTitle}` — previous event title
- `{formattedDate}` — `d MMMM yyyy` in Europe/Paris (match agenda)

**Example:**

> Déjà en **Joueur** au spectacle **« Cabaret du 12 »** (5 juin 2026).

---

## Accessibility

- Warning line: `role="note"` or live region not required (static after assign)
- Icon `aria-hidden="true"`; full sentence readable by screen readers
- Contrast ≥ 4.5:1 on hint text (NFR-A1)

---

## API contract (UI expectation)

```typescript
interface ConsecutiveShowWarning {
  previousEventId: string
  previousEventTitle: string
  previousEventStartsAt: string // ISO
}
// On CompositionSlot:
consecutiveShowWarning?: ConsecutiveShowWarning | null
```

---

## Out of scope (6.20)

- Warning in Dispos tab
- Warning in slot picker list (stretch — see OQ-6-20-01)
- Draw weight / exclusion (Epic **19.9**)

---

## Checklist M3 (story handoff)

- [ ] Tokens only (`var(--mat-sys-*)`, `color-mix`)
- [ ] Mobile slot row still tappable; hint does not overlap clear button
- [ ] Busy state during assign unchanged
- [ ] Component test: warning visible/hidden per fixture
