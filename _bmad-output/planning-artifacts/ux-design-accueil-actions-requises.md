---
title: UX — Accueil — Actions requises & état « Tout est à jour »
author: Sally (UX) + Patrice
date: '2026-05-31'
status: approved
trigger: 'Screenshot review — subline clipped, CTAs feel flat; encourage empty success state'
relatedStories:
  - '17.19'
  - '17.21'
relatedArtifacts:
  - _bmad-output/planning-artifacts/ux-hub-a-faire.md
  - _bmad-output/planning-artifacts/ux-design-hub-section-headers.md
  - _bmad-output/planning-artifacts/ux-voice-and-tone.md
  - docs/v2/technical/FRONTEND_UI.md
  - apps/web/src/app/pages/member-home-todo/member-home-todo.html
stakeholderDecisions:
  - replace-mat-nav-list-with-action-cards
  - no-ellipsis-on-action-metadata
  - explicit-visual-cta-per-action-type
  - encouraging-all-caught-up-moment
---

# UX Design — Accueil — Actions requises & « Tout est à jour »

**Purpose:** Turn **Actions requises** into high-priority, **visual call-to-action cards** (not a grey text list), fix **text clipping**, and make **Tout est à jour** a **positive, encouraging** moment — not a muted status strip.

**Scope:** `/accueil` (`MemberHomeTodo`) — Zone 1 (actions) + success banner when `actions.length === 0`. Does **not** change **Prochain spectacle** or **Accès rapides** (already aligned with `agenda-card`).

**Principle:** These rows are the **reason** the Accueil tab exists and carries the inbox badge. They must read as **“do this now”**, with the same visual energy as **Prochain spectacle**, not as secondary metadata.

---

## Problem (current state)

| Issue | Observation | Root cause |
|-------|-------------|------------|
| **Clipped subline** | Date · troupe · rôle (e.g. `mar. 2 juin · La Malice · Comédien·ne`) is **cut off** at the bottom of the row | `mat-nav-list` + `mat-list-item` impose **fixed single-line** layout for `matListItemLine`; `min-height: 3rem` on `.member-home-todo__action-item` fights multi-line content |
| **Low tap motivation** | One flat grey container, **no icon**, **no button**, long title on one line — feels like settings, not an urgent task | List pattern copied from admin/settings; no action-type color, no affordance chevron/CTA |
| **Weak success state** | « Tout est à jour » = small title + grey paragraph in a thin bordered box | Same visual weight as a neutral notice; misses **relief / pride** emotional goal ([ux-voice-and-tone.md](./ux-voice-and-tone.md) empty states) |
| **Hierarchy** | Action title repeats event name in italic on the **same line** as the verb — hard to scan on mobile | Title + event name not separated; competes with subline for vertical space |

Reference: screenshot 2026-05-31 — confirm participation row with truncated subline.

---

## Product decisions

| # | Topic | Decision |
|---|--------|----------|
| A1 | **Container pattern** | **Retire** `mat-nav-list` / `mat-list-item` for actions. Use **stacked action cards** (one card = one action). |
| A2 | **Card tap target** | **Entire card** navigates (`deepLink`); minimum height **≥ 72px** on mobile (content may grow); padding **≥ 12px** vertical. |
| A3 | **No clipping** | Subline (date · troupe · rôle) **wraps** to **2 lines max**; **no** `text-overflow: ellipsis` on action metadata. Event title may truncate **1 line** with ellipsis if needed. |
| A4 | **Visual CTA** | Each card includes a **trailing affordance**: `mat-icon` `chevron_right` in a **tonal icon button** **or** compact `mat-flat-button` label (**Confirmer** / **Dispo**). Card + trailing control share one hit area (button wraps card). |
| A5 | **Action-type identity** | Two distinct visual treatments (tokens only): **Confirm participation** = `primary` emphasis; **Availability** = `secondary` / `surface-container-high`. Leading **48×48** avatar circle with `mat-icon`. |
| A6 | **Bientôt** | Keep `mat-chip` **Bientôt**; position **top-end** of card (absolute or flex), not `matListItemMeta` (list-specific). |
| A7 | **Section title** | Keep L2 **Actions requises** per [ux-design-hub-section-headers.md](./ux-design-hub-section-headers.md). Optional: suffix count `· 1` in `on-surface-variant` when 2–5 items (not on nav badge). |
| A8 | **Tout est à jour** | Upgrade to **success moment** block (see § All caught up). Distinct from action cards — **celebration**, not another grey box. |
| A9 | **Copy** | French UI; tutoiement; verbs stay **Confirmer ta participation** / **Indiquer ta dispo** — event **title** on its own line (not italic inline). |
| A10 | **Data / API** | No API change. Still `InboxAction[]` from `GET /v1/me/inbox` (or derived agenda). |

---

## Action card — anatomy

### Layout (mobile, ≤ 480px)

```text
┌────────────────────────────────────────────────────────────┐
│ [icon]  Confirmer ta participation          [Bientôt]      │
│  48dp   Apérock Juin                                       │
│         mar. 2 juin · La Malice · Comédien·ne    [Confirmer]│
│                                                    chevron  │
└────────────────────────────────────────────────────────────┘
```

| Zone | Content | Style |
|------|---------|--------|
| **Leading** | Circle `48×48`, `mat-icon` | Confirm: `how_to_reg` · Dispo: `edit_calendar` · bg `color-mix(primary 12%, surface)` vs `color-mix(secondary 12%, surface)` |
| **Body** | Line 1: **verb** (`title-small`, `font-weight: 600`) · Line 2: **event title** (`title-medium`, ellipsis 1 line) · Line 3: **metadata** (`body-small`, `on-surface-variant`, wrap 2 lines) |
| **Trailing** | `mat-flat-button` **Confirmer** (confirm) or **Dispo** (availability) **or** icon-only `chevron_right` in `mat-icon-button` if width tight | Primary button only for **confirm**; stroked/tonal for dispo |
| **Chip** | **Bientôt** when ≤ 7 days | Unchanged semantic tokens (error/warning `color-mix`) |

### Layout (desktop, ≥ 480px)

Same row; trailing may show **text button** + chevron. Max width follows page `56rem`.

### Interaction

| State | Behavior |
|-------|----------|
| Default | Card `border-radius: 12px`, `border: 1px solid outline-variant`, `background: surface-container-low` |
| Hover / focus-visible | `surface-container-high` + `outline` focus ring; **no** layout shift |
| Active | Slight `primary` 4% wash on confirm cards only |

### Accessibility

- `aria-label` on the card button: keep existing `actionAriaLabel()` (verb + title + subline).
- Decorative icons: `aria-hidden="true"`.
- **Bientôt** chip: not sole carrier of urgency (date still in subline).

---

## Action types — mapping

| `InboxAction.type` | Leading icon | Card emphasis | Trailing CTA label |
|--------------------|--------------|---------------|-------------------|
| `composition_confirm_pending` | `how_to_reg` | Primary-tinted border or left **4px** `primary` bar | **Confirmer** |
| `availability_unknown` | `edit_calendar` | Neutral / secondary tint | **Dispo** |

**Sort:** unchanged — `startsAt` asc; confirm before dispo at equal time (server order preserved).

**Cap:** still max **5** visible + **Voir tout dans l'agenda** (`mat-stroked-button` below stack).

---

## All caught up — « Tout est à jour » (encouraging)

Replace `.member-home-todo__status-banner` with **`.member-home-todo__celebration`** (name indicative).

### Structure

```text
┌────────────────────────────────────────────────────────────┐
│     ( check_circle 40–48px, primary or tertiary )          │
│              Tout est à jour                               │
│     Tu n'as rien en attente — profite de ton temps.        │
│     [ optional: Mes troupes ]  only if no upcoming event   │
└────────────────────────────────────────────────────────────┘
```

| Case | Icon | Title | Body (French) | Extra |
|------|------|-------|---------------|-------|
| **0 actions, ≥1 upcoming** | `check_circle` | Tout est à jour | **Tu es à jour pour tes spectacles.** Le prochain est juste en dessous. | No CTA row — visual **connector** optional: `margin-bottom` on block + first section title unchanged |
| **0 actions, 0 upcoming** | `check_circle` | Tout est à jour | **Rien ne te retient pour l'instant.** On te préviendra dès qu'un spectacle arrive. | CTA **Mes troupes** (`mat-stroked-button`) — keep |
| **Load error / etc.** | — | — | Unchanged (out of scope) | — |

### Visual treatment

| Property | Value |
|----------|--------|
| Background | `color-mix(in srgb, var(--mat-sys-tertiary) 10%, var(--mat-sys-surface))` **or** `primary-container` at 15% mix — **warm success**, not error |
| Border | none or very soft `outline-variant` |
| Padding | `1.25rem 1rem` |
| Icon | Centered above title; `color: var(--mat-sys-primary)` or `tertiary` |
| Title | `1.125rem`, `font-weight: 600` |
| Body | `body-medium`, `on-surface-variant`, centered text, max-width `20rem` centered |

**Emotional goal (step 4 alignment):** relief + light pride — user should **smile**, not skim past a grey notice.

**Voice:** [ux-voice-and-tone.md](./ux-voice-and-tone.md) — title neutral OK; body **2ᵉ personne**, warm.

---

## Wireframe — full Accueil slice (actions + success)

**With 1 action (confirm):**

```text
Accueil                                          [avatar]

Actions requises

┌─ Action card (primary accent) ─────────────────────────────┐
│ ○  Confirmer ta participation                    [Bientôt]   │
│    Apérock Juin                              [ Confirmer ] │
│    mar. 2 juin · La Malice · Comédien·ne                   │
└────────────────────────────────────────────────────────────┘

Prochain spectacle
┌─ agenda-card (unchanged) ──────────────────────────────────┐
...
```

**All caught up:**

```text
Accueil                                          [avatar]

        ✓  (large icon)
     Tout est à jour
  Tu es à jour pour tes spectacles.
  Le prochain est juste en dessous.

Prochain spectacle
...
```

---

## Implementation notes (for dev story)

| Task | Detail |
|------|--------|
| Template | Replace `<mat-nav-list>` block with `@for` → `<button type="button" class="member-home-todo__action-card">` containing grid/flex layout |
| SCSS | New `__action-card`, `__action-card-icon`, `__action-card-body`, `__action-card-cta`; remove list-item min-height hack |
| Material | Prefer **`mat-card`** only if it simplifies; **allowed**: semantic `<article>` + button wrapper (same as `agenda-card__clickable` pattern) — **no** raw div-only CTA without button semantics |
| Shared styles | Do **not** merge with `agenda-card` — different hierarchy (verb-first vs date-first). Reuse **tokens** and border-radius family only |
| Tests | Update `member-home-todo.spec.ts`: subline visible in DOM (not `clientHeight` clip); `data-testid` on card `todo-action-confirm` / `todo-action-dispo` |
| Regression | `aria-label`, deep link navigation, max 5 + see-all link unchanged |

### Material 3 acceptance criteria (UI story)

| ID | Criterion |
|----|-----------|
| M3-1 | Action rows use `mat-flat-button` / `mat-icon-button` / `mat-chip` + `mat-icon`; not `mat-list-item` for actions |
| M3-2 | Colors via `--mat-sys-*` and `color-mix` only |
| M3-3 | Card tap ≥ 48dp; full French `aria-label`; subline wraps, not clipped |
| M3-4 | No new bottom nav; hub chrome unchanged |
| M3-5 | Checklist in FRONTEND_UI.md walked in Dev Agent Record |

---

## Updates to sibling specs

| Document | Change |
|----------|--------|
| [ux-hub-a-faire.md](./ux-hub-a-faire.md) § Zone 1 | Replace « liste compacte mat-list » with **action cards** + link to this file |
| [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md) table | Add row for `ux-design-accueil-actions-requises.md` |

---

## Out of scope

- Badge on section title vs nav tab
- Changing **Prochain spectacle** card
- New inbox action types
- Illustration / Lottie assets (icon + copy sufficient for MVP)

---

## Sign-off

| Stakeholder | Date | Notes |
|-------------|------|-------|
| Patrice | 2026-05-31 | Screenshot-driven; wants visual CTAs + encouraging « tout est à jour » |

**Next step:** Create implementation story (e.g. `17-31-accueil-action-cards.md`) or extend open hub epic task; implement in `member-home-todo.*`.
