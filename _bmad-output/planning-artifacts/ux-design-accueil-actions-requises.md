---
title: UX — Accueil — Actions requises & état « Tout est à jour »
author: Sally (UX) + Patrice
date: '2026-05-31'
lastUpdated: '2026-06-14'
status: approved
trigger: 'Screenshot review — subline clipped, CTAs feel flat; encourage empty success state'
relatedStories:
  - '17.19'
  - '17.21'
relatedArtifacts:
  - _bmad-output/planning-artifacts/ux-hub-a-faire.md
  - _bmad-output/planning-artifacts/ux-design-hub-section-headers.md
  - _bmad-output/planning-artifacts/ux-design-participation-semantic-colors.md
  - _bmad-output/planning-artifacts/ux-voice-and-tone.md
  - docs/v2/technical/FRONTEND_UI.md
  - apps/web/src/app/pages/member-home-todo/member-home-todo.html
stakeholderDecisions:
  - replace-mat-nav-list-with-action-cards
  - no-ellipsis-on-action-metadata
  - explicit-visual-cta-per-action-type
  - encouraging-all-caught-up-moment
  - filled-action-cards-trailing-chip-chevron
  - dispo-action-info-blue-token
  - type-icon-not-checkbox
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
| [ux-hub-a-faire.md](./ux-hub-a-faire.md) § Zone 1 | Action cards filled tint, trailing chip+chevron, blue action-info — addendum 2026-06-14 |
| [ux-design-participation-semantic-colors.md](./ux-design-participation-semantic-colors.md) | P17 + § Inbox action tokens |
| [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md) | § Inbox action-info table + spec table row |

---

## Out of scope

- Badge on section title vs nav tab
- Changing **Prochain spectacle** card
- New inbox action types
- Illustration / Lottie assets (icon + copy sufficient for MVP)

---

## Addendum — 2026-06-02 — Verb-first cards, checkbox affordance, dated urgency

**Trigger:** Post-implementation review (Patrice). The shipped cards diverged from the approved anatomy (event title became the loud line, the action verb was demoted to a small uppercase tag), and several signals read as unclear: the `Bientôt` chip felt vague and misaligned, the leading icons looked identical and purposeless, and the cards read as heavy / unengaging. Patrice also proposed a **rounded checkbox** echoing the logo, with the concern that checked items vanish so the “done” feeling is lost.

**Mockup (validated):** `~/.cursor/projects/.../assets/accueil-action-cards-mockup.png` — direction approved; rounded **square** checkbox; success block keeps the brand orange ✓.

### Refined decisions (supersede the matching rows above)

| # | Topic | Decision |
|---|-------|----------|
| B1 | **Hierarchy (verb-first)** | **Line 1 = action verb** (accent) + **dated pill** (when ≤ 7 days). **Line 2 = event title** + chevron. **No line 3** on cards: date is carried by the pill; troupe name dropped (redundant). **Role** for confirmations only: appended on line 2 (`{title} · {role}`). Full date/troupe/role remain in `aria-label`. **Compact row:** `min-height` 48 dp, reduced padding (2026-06-02). |
| B2 | **Verb copy** | Confirm → **« Confirme ta présence »** · Availability → **« Donne ta dispo »**. (Replaces the `À confirmer` / `Dispo` uppercase tag.) |
| B3 | **Leading element = checkbox** | Replace the per-type `mat-icon` (`how_to_reg` / `edit_calendar`) with a **rounded-square checkbox** affordance (empty / unchecked, ~28–32 px, brand corner radius echoing the logo badge). One consistent “to-do” signal; **action type is carried by accent color + verb**, not by an icon. |
| B4 | **Type accent (tokens)** | **Confirm** (`composition_confirm_pending`) = **`--hatcast-sys-pending`** (ambre « en attente de confirmation », aligned with Équipe / modale). **Dispo** (`availability_unknown`) = **`--hatcast-participation-neutral-badge-fg`** + outline bar — **not** `--hatcast-sys-positive` (green = dispo *already* answered). **Done** ghost = **`--mat-sys-tertiary`** orange ✓ (success closure). Card surface stays light; urgency stays on the **dated pill** only (error / tertiary). |
| B5 | **Dated urgency pill** | Replace vague **« Bientôt »** with a **concrete relative-day** pill: « Aujourd’hui », « Demain », « Dans N j » (only within `SOON_DAYS = 7`). Placed at the **top-end** of the verb line. Tone: **`error`** (red) when ≤ 2 days, **`tertiary`** (orange) when 3–7 days. Implemented as a plain `<span>` pill (token-styled) — **not** `mat-chip`, whose MDC surface overrode the background to grey. Full date still in line 3 (pill is not the sole urgency carrier — A11y). |
| B6 | **Keep the chevron** | The trailing `chevron_right` stays (liked: “invites to go further”), now paired with a clear verb. No separate text CTA button needed for MVP. |
| B7 | **Brand “done” = orange ✓** | The **checked** state fills the checkbox with **`tertiary`** (orange palette) + white ✓ — the same motif as the logo badge and the « Tout est à jour » block. Closure is visually consistent end-to-end. |
| B8 | **“See it checked” (Option A)** | Cards animate out via Angular **`animate.leave`** (check-fill + collapse). To deliver the satisfying check **after returning** from the action screen (a fresh component instance), `openAction()` persists the acted card key (sessionStorage); on the next `loadInbox`, any persisted key now **absent** from `actions` is rendered as a **checked “ghost” card** (orange ✓), held briefly, then collapsed via `animate.leave`. The « Tout est à jour » celebration is gated until ghosts clear → sequence: **check → collapse → celebration blooms**. Honest metaphor: the box is checked only once the task is actually resolved server-side, not on tap. |
| B9 | **Reduced motion** | All check / leave / bloom transitions respect `prefers-reduced-motion: reduce` (instant state change, no movement). |

### Anatomy (revised, mobile)

```text
┌──────────────────────────────────────────────────────┐
│ ⬜  Confirme ta présence                    Dans 3 j  │  ← verb (accent) + dated chip
│     Apérock Juin                                   ›  │  ← event title (secondary) + chevron
│     mar. 2 juin · La Malice · Comédien·ne             │  ← metadata (wraps, no clip)
└──────────────────────────────────────────────────────┘
  ↑ rounded-square checkbox (logo radius); accent = primary (confirm) / secondary (dispo)
```

**Checked ghost (on return):** same card, checkbox filled `tertiary` + white ✓, faded, auto-collapses.

### Implementation deltas

| File | Change |
|------|--------|
| `member-home-todo.utils.ts` | Add `relativeDayLabel(startsAt, now, tz)` (null beyond `SOON_DAYS`); reuse `calendarDaysFromNow` for the ≤ 2-day urgent tone. |
| `member-home-todo.ts` | `actionVerbLabel`, `actionDateBadge` (`{ label, urgent }`), `actionKey`, sessionStorage persist on `openAction`, ghost detection in `loadInbox`, `completedGhosts` signal + timed clear (cleared in `ngOnDestroy`). Remove `actionLeadingIcon` / `actionKindLabel`. |
| `member-home-todo.html` | Verb-first body, checkbox span, dated chip, `animate.leave`, ghost block (renders even when it was the last action). |
| `member-home-todo.scss` | `__check` / `__check-box` (rounded square), lightened cards, accent-only color, `__date-chip` (+`--urgent`), leave/bloom transitions, reduced-motion guard. |
| `member-home-todo.spec.ts` | Update expectations: verb labels (`Donne ta dispo` / `Confirme ta présence`), dated chip (`Dans 3 j`); add ghost-on-return test. |

### Material 3 acceptance (unchanged intent)

M3-1…M3-5 still apply; the checkbox + chip are token-styled custom/`mat-chip` elements, no raw hex, full French `aria-label`, no new bottom nav.

---

## Sign-off

| Stakeholder | Date | Notes |
|-------------|------|-------|
| Patrice | 2026-05-31 | Screenshot-driven; wants visual CTAs + encouraging « tout est à jour » |
| Patrice | 2026-06-02 | Verb-first + rounded checkbox + dated urgency + brand orange ✓ closure (Option A). Mockup approved. |
| Patrice | 2026-06-14 | Fond plein teinté · layout trailing chip+chevron · bleu action-info dispo · icône type (sans checkbox). Canvas preview approved. |

**Next step (2026-06-14):** Implement addendum C in `member-home-todo.*` + tokens `--hatcast-sys-action-info*` in `_hatcast-semantic-colors.scss`.

---

## Addendum — 2026-06-14 — Fond plein, trailing unifié, bleu action-info

**Trigger:** Post-ship review (Patrice). Cards feel **outlined / administrative** (border + left bar + grey dispo). Chevron misaligned when deadline chip sits on line 1. Checkbox affordance **misleading** (always empty; task disappears on complete). Grey dispo cards **not inciting** enough for a primary CTA zone.

**Preview (validated):** [todo-actions-design-preview.canvas.tsx](/Users/patrice/.cursor/projects/Users-patrice-GitHub-hatcast/canvases/todo-actions-design-preview.canvas.tsx) — layout B + chips A + palette bleu action-info.

**Supersedes** (for matching topics only): addendum B rows **B1** (layout), **B3** (checkbox), **B4** (dispo neutral grey + outline bar). Rows **B2**, **B5–B9** remain unless contradicted below.

### Product decisions

| # | Topic | Decision |
|---|--------|----------|
| C1 | **Card surface** | **Filled tint** per action type — **no** outer border, **no** left accent bar. `border-radius: 0.9rem` (12–14 px). Hover/focus: `surface-container-high` wash or accent outline ring (`outline-offset: 2px`) — **no** layout shift. |
| C2 | **Layout (verb-first, 2 lines)** | **Line 1:** action verb only (accent colour). **Line 2:** event title (1 line, ellipsis); role for confirmations appended (`{title} · {role}`). **No line 3** on cards; full date remains in `aria-label` only. |
| C3 | **Trailing column** | **Single horizontal row:** `[date chip?][chevron_right]` — chip and chevron **on the same baseline**, block **vertically centered** in the card (`align-items: center` on card flex). Chip is **not** on line 1 or embedded in line 2 text. When no chip (event beyond 7 days), trailing = chevron only. |
| C4 | **Leading element = type icon** | **Remove** persistent empty checkbox. Leading **`mat-icon`** 20–24 dp, `aria-hidden="true"`: **`edit_calendar`** (dispo) · **`how_to_reg`** (confirm). Type identity = **icon + verb colour + card tint** (not checkbox). |
| C5 | **Dispo colour — action-info blue** | **`availability_unknown`** cards use new token family **`--hatcast-sys-action-info*`** (Material `mat.$blue-palette`) — **not** `--hatcast-participation-neutral-*` (grey) and **not** `--hatcast-sys-positive` (green = already answered). Scope: **inbox action cards on `/accueil` only** — does **not** replace neutral on agenda badges, Dispos toggles, or chart. Rationale: inciting CTA without polluting participation semantics ([ux-design-participation-semantic-colors.md](./ux-design-participation-semantic-colors.md) § Inbox action tokens). |
| C6 | **Confirm colour** | Unchanged: **`--hatcast-sys-pending*`** (ambre) for `composition_confirm_pending`. |
| C7 | **Date chip** | Unchanged from B5: relative pill « Aujourd'hui » / « Demain » / « Dans N j » within 7 days; **`--urgent`** (error tokens) when ≤ 2 days; tertiary/orange mix when 3–7 days. Plain `<span>` pill — not `mat-chip`. |
| C8 | **Done ghost (no checkbox)** | On return after resolved action: brief **ghost card** (sessionStorage flow unchanged). Leading = **filled circle** `tertiary` + white `check` icon (not square checkbox). Body: verb + title + meta **« C'est noté ! »** on line 2 or 3. Card `--done` wash: `color-mix(tertiary 8%, surface)`. Then `animate.leave` → « Tout est à jour » blooms. |
| C9 | **Compact density** | `min-height` ≥ **48 dp**; padding ~`0.6rem 0.75rem`; gap between cards `0.5rem`. |
| C10 | **No persistent history** | Completed actions **do not** stay in the list as checked items; no manual dismiss. Queue model unchanged. |

### Anatomy (mobile, canonical)

```text
┌──────────────────────────────────────────────────────────────┐
│ 📅  Donne ta dispo                                        ›  │  ← dispo: blue tint, no chip
│     rgefre                                                   │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ ✓   Confirme ta présence                   [Dans 4 j]  ›     │  ← confirm: amber tint
│     dqsdqsd · DJ                                             │     chip + chevron same row
└──────────────────────────────────────────────────────────────┘
```

| Zone | Content | Tokens / components |
|------|---------|---------------------|
| **Leading** | `mat-icon` type icon | Colour: `--todo-accent` (= action-info or pending) |
| **Body L1** | Verb (`Donne ta dispo` / `Confirme ta présence`) | `font-weight: 700`, `color: var(--todo-accent)` |
| **Body L2** | Event title (+ ` · {role}` if confirm) | `on-surface`, ellipsis 1 line |
| **Trailing** | Optional date chip + `chevron_right` | Chip: existing `__date-chip`; chevron: `on-surface-variant` |

### Token mapping — action cards

| Modifier | `--todo-accent` (verb + icon) | Card background |
|----------|-------------------------------|-----------------|
| `--confirm` | `var(--hatcast-sys-pending)` | `color-mix(in srgb, var(--hatcast-sys-pending) 12%, var(--mat-sys-surface))` |
| `--dispo` | `var(--hatcast-sys-action-info)` | `color-mix(in srgb, var(--hatcast-sys-action-info) 14%, var(--mat-sys-surface))` |
| `--done` (ghost) | inherited | `color-mix(in srgb, var(--mat-sys-tertiary) 8%, var(--mat-sys-surface))` |

**New tokens** (define in `_hatcast-semantic-colors.scss`, mirror `--hatcast-sys-pending` pattern):

| Token | Role |
|-------|------|
| `--hatcast-sys-action-info` | Foreground accent (verb, icon) — dispo inbox cards |
| `--hatcast-sys-action-info-container` | Optional container reference |
| `--hatcast-sys-on-action-info` | On-accent (if filled badge needed later) |

Source palette: **`mat.$blue-palette`** with `light-dark()` pair — same mechanical pattern as `--hatcast-sys-pending`.

### Action types — mapping (revised)

| `InboxAction.type` | Leading icon | Card modifier | Trailing |
|--------------------|--------------|---------------|----------|
| `composition_confirm_pending` | `how_to_reg` | `--confirm` | `[chip?] chevron_right` |
| `availability_unknown` | `edit_calendar` | `--dispo` | `[chip?] chevron_right` |

**Sort / cap / API:** unchanged (B5, A10, server order, max 5 + see-all).

### Interaction states

| State | Behavior |
|-------|----------|
| Default | Filled tint, no border |
| `:hover` / `:focus-visible` | `background: var(--mat-sys-surface-container-high)` **or** keep tint + `outline: 2px solid var(--todo-accent)` |
| `:active` | `color-mix(in srgb, var(--todo-accent) 5%, var(--mat-sys-surface))` |
| Leaving | Unchanged `animate.leave` collapse |

### Accessibility

- Full French **`aria-label`** on card `<button>` via `actionAriaLabel()` (verb + title + date/urgency) — unchanged.
- Type icon + chevron: `aria-hidden="true"`.
- Date chip: decorative if date is in `aria-label`; chip text may duplicate relative date (acceptable).

### Implementation notes

| File | Change |
|------|--------|
| `_hatcast-semantic-colors.scss` | Add `--hatcast-sys-action-info*` family (`mat.$blue-palette`) |
| `member-home-todo.html` | Restructure: icon leading; L1 verb; L2 title; trailing row chip+chevron; remove checkbox markup on pending cards; ghost uses circle+check |
| `member-home-todo.scss` | Remove border/left-bar; filled `--dispo` / `--confirm` backgrounds; trailing flex row; icon styles; drop `__check-box` on pending state (keep ghost done styles) |
| `member-home-todo.spec.ts` | Layout selectors; dispo card uses action-info class; trailing chip+chevron alignment smoke; ghost still works |
| `ux-design-participation-semantic-colors.md` | § Inbox action tokens + decision P17 |
| `FRONTEND_UI.md` | Reference action-info tokens + scope guard |

### Material 3 acceptance criteria (addendum C)

| ID | Criterion |
|----|-----------|
| M3-1 | `mat-icon` leading + `chevron_right` trailing; date chip = token-styled `<span>` |
| M3-2 | Colours via `--mat-sys-*`, `--hatcast-sys-action-info*`, `--hatcast-sys-pending*` + `color-mix` only |
| M3-3 | Card tap ≥ 48 dp; full French `aria-label`; title ellipsis OK, chip never clips chevron alignment |
| M3-4 | No new bottom nav |
| M3-5 | FRONTEND_UI checklist in Dev Agent Record |

### Out of scope (unchanged)

Persistent checked history, manual dismiss, new inbox types, agenda badge colour change for unknown dispo.

---

## Addendum — 2026-06-14 (D) — Couleur = urgence (variante A)

**Trigger:** Review Patrice — type-based card colours (bleu/ambre) do not help prioritise; deadline chips alone are too small. **Variant A approved:** background = urgency tier; type = neutral icon + verb.

**Preview:** [todo-actions-urgency-colors.canvas.tsx](/Users/patrice/.cursor/projects/Users-patrice-GitHub-hatcast/canvases/todo-actions-urgency-colors.canvas.tsx)

**Supersedes** addendum C rows **C5**, **C6**, and § Token mapping (type → colour). Layout C2–C4, C7–C10 unchanged.

### Decisions

| # | Topic | Decision |
|---|--------|----------|
| D1 | **Card background = urgency** | Three tiers from `startsAt` (Paris calendar days): **urgent** ≤ 2 j · **soon** 3–7 j · **normal** > 7 j (no chip). Same tier for dispo and confirm at equal offset. |
| D2 | **Colour ramp** | **Urgent** — `color-mix(error 12%, surface)` · **Soon** — `color-mix(tertiary 14%, surface)` · **Normal** — `color-mix(action-info 10%, surface)`. |
| D3 | **Variant A — neutral type** | Icon `on-surface-variant`; verb `on-surface` bold; shape + copy distinguish dispo vs confirm. **No** type-coloured icon (variant B rejected). |
| D4 | **Focus ring** | `--todo-accent` follows tier (error / tertiary / action-info) for `:focus-visible` outline. |
| D5 | **Date chip** | Unchanged B5/C7: error tone ≤ 2 j; default chip uses tertiary for 3–7 j. |
| D6 | **Helper** | `inboxActionUrgencyTier(startsAt, now)` in `member-home-todo.utils.ts`; modifiers `--urgent` / `--soon` / `--normal` on card. |

### Token mapping (revised)

| Modifier | Background | `--todo-accent` (focus only) |
|----------|------------|------------------------------|
| `--urgent` | error ~12 % | `--mat-sys-error` |
| `--soon` | tertiary ~14 % | `--mat-sys-tertiary` |
| `--normal` | action-info ~10 % | `--hatcast-sys-action-info` |

### Sign-off

| Stakeholder | Date | Notes |
|-------------|------|-------|
| Patrice | 2026-06-14 | Variante A — urgence pure (rouge / orange / bleu) |

**Status:** Implemented in `member-home-todo.*` + `inboxActionUrgencyTier` util.

