# Story 6.12: Barre d’actions Équipe — hiérarchie, overflow et cohérence par état

Status: done

## Story

As an **organizer or administrator** on the event **Équipe** tab (`/evenement/:slug?tab=equipe`),  
I want a **compact, predictable action bar** with **one clear forward action per composition state** and **secondary actions de-emphasized or tucked away**,  
so that **I am not overwhelmed by four equivalent CTAs** and I know what to do next (**UX-DR6** polish).

## Baseline already shipped (2026-05-27 — quick wins, not part of this story’s AC)

Partial implementation exists in `event-equipe-tab` — **do not regress**:

| Delivered | Location |
|-----------|----------|
| Single **2×2 grid** toolbar after grid + declines | `event-equipe-tab.html` → `.event-equipe-tab__actions-grid` |
| **`primaryAction()`** computed (one primary CTA) | `event-equipe-tab.ts` |
| Primary = filled gradient; secondaries = theme-aware outline | `event-equipe-tab.scss` → `--mat-sys-outline` — **to replace** with Material buttons (see [M3 compliance](#material-design-3-compliance)) |
| **Validate lead** copy above toolbar when `canValidate()` | `.event-equipe-tab__actions-lead` |

This story completes the UX intent: **Material 3 button components**, overflow menu, hint de-duplication, documented state matrix, a11y/E2E hooks, optional sticky bar.

## Acceptance Criteria

1. **Given** any organizer-visible composition state on **Équipe**, **when** the action bar renders, **then** **exactly one** action uses **primary** emphasis and all others use **secondary** (outlined) — matrix in [State → actions](#state--actions-matrix) below; no full-width primary row separate from the grid (**regression guard** on quick-win layout).
2. **Given** draft **En préparation** with `canShareDraw()` and at least two other toolbar actions visible, **when** the organizer views the bar, **then** **Partager** is **not** a grid cell — it lives in a **`⋯` overflow menu** (Material `MatMenu`) labelled *« Plus d’actions »* or icon-only `more_horiz` with accessible name *« Autres actions »*.
3. **Given** validated states with **Annoncer la compo** as primary, **when** **Déverrouiller** is also visible, **then** **Déverrouiller** stays **secondary** in the grid or overflow (never primary); **Annoncer** remains primary.
4. **Given** `canValidate()` and the status badge hint mentions **Valider**, **when** `.event-equipe-tab__actions-lead` is shown, **then** the long status hint **does not repeat** the validate instruction (short badge-only hint or trimmed copy — see [Hint de-duplication](#hint-de-duplication)).
5. **Given** the action bar, **when** a screen reader or E2E test targets controls, **then** the toolbar has `role="toolbar"` + `aria-label="Actions de composition"`, each button has a stable **`data-testid`** (see [Test IDs](#test-ids)), and overflow menu items are keyboard-reachable.
6. **Given** a long slot grid (≥ 6 rows) on a viewport ≤ 640 px height, **when** the user scrolls the tab panel, **then** the action bar becomes **sticky** at the bottom of the visible tab panel (`position: sticky; bottom: 0`) with a subtle top border/shadow so primary/secondary actions stay reachable without scrolling back — **NFR-A1** (no motion required for stickiness).
7. **Given** unit tests in `event-equipe-tab.spec.ts`, **when** `./ng test` runs, **then** coverage includes: primary vs secondary **Material** affordance per state (draft-with-slots → Valider is `mat-flat-button`; secondaries are `mat-stroked-button`; empty → Tirer au sort primary); Partager only in overflow when AC #2 applies; no regression on existing tests.
8. **Given** story completion, **when** UX doc is updated, **then** [`ux-design-hatcast-v2.md`](../planning-artifacts/ux-design-hatcast-v2.md) § [Primary controls](#screen-event-detail-equipe-tab) references this matrix, overflow for **Partager**, and **M3 filled/outlined** (not V1 rainbow gradients per button). *(Amendé **2026-06-07** : **Partager** en grille outlined en brouillon compo — voir `ux-design-hatcast-v2.md` ; overflow seulement si ≥ 4 actions visibles.)*
9. **Given** any toolbar action on **Équipe**, **when** it is the **primary** action for the current state, **then** it is rendered with Angular Material **`mat-flat-button`** (M3 **filled** / high emphasis) using the app theme **`color="primary"`** — **no** custom CSS gradient (`linear-gradient` on `.event-equipe-tab__action--primary` must be removed).
10. **Given** any non-primary toolbar action visible in the grid, **when** rendered, **then** it uses **`mat-stroked-button`** (M3 **outlined** / medium emphasis) — **no** raw `<button>` with hand-rolled border/background for grid actions.
11. **Given** the overflow trigger, **when** shown, **then** it is a **`mat-icon-button`** with `mat-icon` **`more_vert`**, `aria-label="Autres actions"`, opening **`mat-menu`** / `MatMenu` for overflow items (e.g. **Partager** as `mat-menu-item` or button inside menu per Material pattern).
12. **Given** action button layout CSS, **when** styled, **then** layout-only rules remain in SCSS (grid, min-height, `width: 100%` in cell); **shape and colors** come from Material theme tokens (`--mat-sys-primary`, `--mat-sys-outline`, etc.) — **do not** force `border-radius: 999px` unless matching global `mat.button-overrides` / theme shape (default M3 corner radius is acceptable).

### Explicit out of scope

| Item | Reason |
|------|--------|
| **Simuler**, **Effacer** | Not implemented in V2; separate stories if product requests |
| **Share & announce modal** behaviour | **6.10** — this story only changes **placement** of **Partager** / **Annoncer** triggers |
| **Backend / API** | Front-only |
| **Legacy V1** | No changes under `legacy/` |
| **Per-button rainbow gradients** | Removed by this story (AC #9–10); was interim in quick wins |
| **FAB / extended FAB** for Valider | Optional future polish; sticky + filled button sufficient for 6.12 |
| **Global `mat.theme()` / palette changes** | Use existing violet primary in [`styles.scss`](../../apps/web/src/styles.scss) |

---

## Material Design 3 compliance

HatCast V2 already uses **`mat.theme()`** and system tokens (`--mat-sys-*`) — see [`styles.scss`](../../apps/web/src/styles.scss). This story aligns the Équipe toolbar with [M3 Buttons](https://m3.material.io/components/buttons) guidelines.

### M3 principles applied

| M3 rule | How we implement it |
|---------|---------------------|
| **One high-emphasis button** per screen region | `primaryAction()` → single `mat-flat-button` |
| **Filled** for final / unblocking actions | Valider, Compléter, Annoncer (primary states) |
| **Outlined** for important but secondary actions | Tirer au sort, Publier, Déverrouiller |
| **Overflow** when too many actions on mobile | `MatMenu` + `more_vert` for **Partager** (and extras if needed) |
| **Prefer side-by-side** over stacked giants | 2-column grid; ≤ **3** visible buttons + overflow when possible |
| **Theme colors, not arbitrary gradients** | `color="primary"` on flat button; no blue→green custom gradient |

### Component mapping (normative for implementation)

| Role | Angular Material | M3 type |
|------|------------------|---------|
| Primary CTA | `mat-flat-button` + `color="primary"` | Filled |
| Grid secondary | `mat-stroked-button` | Outlined |
| Overflow trigger | `mat-icon-button` + `MatMenu` | Icon + menu |
| Overflow item **Partager** | `button mat-menu-item` or `MatMenuItem` pattern | Menu item |

Keep semantic classes for tests (`event-equipe-tab__validate`, etc.) **on the same element** as Material directives, e.g.:

```html
<button
  mat-flat-button
  color="primary"
  class="event-equipe-tab__action event-equipe-tab__validate"
  data-testid="composition-action-validate"
>
  Valider
</button>
```

### What to remove from quick wins

- `.event-equipe-tab__action--primary` gradient and custom `color: #fff` background
- `.event-equipe-tab__action--secondary` hand-rolled borders (Material stroked handles this)
- Pill-only styling that fights theme shape tokens

### Verification (manual + automated)

- **Visual:** primary button uses theme violet/surface contrast in light **and** dark (`color-scheme: light dark` on `html`).
- **Tests:** primary button has class matching `mat-mdc-unelevated-button` (flat) or project-equivalent; secondary matches `mat-mdc-outlined-button`; overflow trigger matches `mat-mdc-icon-button`.
- **Regression:** no `.event-equipe-tab__action--primary` with `background: linear-gradient` in `event-equipe-tab.scss`.

### References (M3)

- [Buttons – M3](https://m3.material.io/components/buttons)
- [Menus – M3](https://m3.material.io/components/menus)
- [Angular Material theming (system variables)](https://material.angular.dev/guide/system-variables)

---

## State → actions matrix

Evaluation: use existing `resolveCompositionEquipeStatus` **type** + `can*` flags from `event-equipe-tab.ts`. **Primary = first matching row** for visible actions.

| Status type (`equipeStatus.type`) | Visible actions (typical) | Primary | Secondary (grid) | Overflow (`⋯`) |
|-----------------------------------|---------------------------|---------|------------------|----------------|
| `none` | Tirer au sort | **Tirer au sort** | — | — |
| `draft` | Valider, Tirer au sort, Publier, Partager | **Valider** | Tirer au sort, Publier | Partager |
| `pending_confirmation` | Annoncer, Déverrouiller | **Annoncer la compo** | Déverrouiller | — |
| `slots_to_complete` | Compléter, Annoncer, Déverrouiller | **Compléter** | Annoncer, Déverrouiller | — |
| `has_declined` | Annoncer, Déverrouiller (+ manual gap fill via grid) | **Annoncer la compo** | Déverrouiller | — |
| `complete` | Annoncer, Déverrouiller | **Annoncer la compo** | Déverrouiller | — |

**Edge:** `canPublish()` without `canValidate()` (draft slots exist but none assigned) → primary **Publier** or **Tirer au sort** per existing `primaryAction()` order; document in tests.

**Overflow rule (AC #2):** move **Partager** to `⋯` when `(canShareDraw() && visibleSecondaryCount >= 2)` OR always when `canValidate()` — product choice: **always in overflow during draft** (recommended, matches “rare coordination action”).

---

## Hint de-duplication

| Element | When | Content |
|---------|------|---------|
| Status badge | Always | Short label only (*En préparation*, etc.) |
| Status hint | `canValidate()` | Admin-only visibility note **without** “cliquez sur Valider” |
| Actions lead | `canValidate()` | *« Prêt ? Validez pour rendre la composition visible à tout le monde. »* |
| Draw hint | `canDraw()` | Keep under toolbar (one line) |

Implement via `resolveCompositionEquipeStatus` optional flag or a small wrapper in `composition-equipe-status.ts` that strips validate CTA from hint when `showValidateLead: true` — **prefer single source**, avoid duplicated strings in template.

---

## Test IDs

| Control | `data-testid` |
|---------|----------------|
| Toolbar | `composition-actions-toolbar` |
| Primary button (any) | `composition-action-primary` |
| Tirer au sort | `composition-action-draw` |
| Publier | `composition-action-publish` |
| Valider | `composition-action-validate` |
| Annoncer | `composition-action-announce` |
| Compléter | `composition-action-fill` |
| Déverrouiller | `composition-action-unlock` |
| Overflow trigger | `composition-actions-overflow` |
| Partager (menu item) | `composition-action-share` |

---

## Tasks / Subtasks

- [x] **Phase 0 — Extract action policy** (AC #1, #8)
  - [x] Move `EquipePrimaryAction` + resolution logic to [`composition-equipe-actions.ts`](../../apps/web/src/app/core/composition/composition-equipe-actions.ts) (pure functions + unit tests).
  - [x] Add `resolveEquipeToolbarLayout(...)` returning `{ grid, overflow, primary }`.
  - [x] Wire `event-equipe-tab.ts` to imported helpers (thin component).

- [x] **Phase 0b — Material 3 buttons** (AC #9–12)
  - [x] Replace custom `.event-equipe-tab__action--primary` / `--secondary` with `mat-flat-button` / `mat-stroked-button`.
  - [x] `MatButtonModule` + layout-only SCSS.
  - [x] Tests assert `mat-mdc-unelevated-button` / `mat-mdc-outlined-button`.

- [x] **Phase 1 — Overflow menu** (AC #2, #5, #11)
  - [x] `MatMenuModule` + `more_vert` overflow; **Partager** in menu.
  - [x] `role="toolbar"`, `aria-label`, test IDs.

- [x] **Phase 2 — Hint de-duplication** (AC #4)
  - [x] `suppressValidateCtaInGuideline` on status resolver when actions lead shown.

- [x] **Phase 3 — Sticky toolbar** (AC #6)
  - [x] `.event-equipe-tab__actions-sticky` (`z-index: 1` < busy overlay).

- [x] **Phase 4 — Docs & QA** (AC #8, M3)
  - [x] `ux-design-hatcast-v2.md` § Primary controls updated.
  - [x] Manual recette: `[MVP] 01`, `[MVP] 03`, `[MVP] 04` — light only (2026-05-28, Patrice). Dark theme recette deferred until in-app theme preference exists.
  - [x] `event-equipe-tab.spec.ts` extended.

---

## Dev Notes

### Files likely touched

- `apps/web/src/app/core/composition/composition-equipe-actions.ts` *(new)*
- `apps/web/src/app/core/composition/composition-equipe-actions.spec.ts` *(new)*
- `apps/web/src/app/core/composition/composition-equipe-status.ts`
- `apps/web/src/app/pages/event-detail/event-equipe-tab.ts|html|scss`
- `apps/web/src/app/pages/event-detail/event-equipe-tab.spec.ts`
- `_bmad-output/planning-artifacts/ux-design-hatcast-v2.md` (Primary controls subsection only)

### Sticky container caveat

Tab panel scroll may live on `mat-tab-body` or `.event-detail__tab-panel`. Inspect [`event-detail.scss`](../../apps/web/src/app/pages/event-detail/event-detail.scss) — sticky **must** be relative to the scrolling ancestor. If no single scroll parent exists, scope sticky to `.event-equipe-tab` and accept in-tab scroll only.

### Overflow UX sketch

```
┌─────────────────────────────────────┐
│ [ Valider (mat-flat)  ] [ Tirer (stroked) ] │
│ [ Publier (stroked)   ] [ ⋯ icon-btn ]      │
└─────────────────────────────────────┘
                              └─ mat-menu → Partager
```

When only 2 actions: no overflow trigger; grid stays 2 cells.

### References

- [ux-design-hatcast-v2.md § Équipe tab](../planning-artifacts/ux-design-hatcast-v2.md#screen-event-detail-equipe-tab)
- [composition-status-messages.md](../../docs/v1/technical/composition-status-messages.md)
- [M3 Buttons](https://m3.material.io/components/buttons) · [M3 Menus](https://m3.material.io/components/menus)
- [Angular Material — system variables](https://material.angular.dev/guide/system-variables)
- Story **6.11** (busy overlay — do not break)
- Story **6.10** (share dialog — reuse)
- UX review 2026-05-27 (conversation — 4-button overload, primary hierarchy, M3 alignment)

## Dev Agent Record

### Agent Model Used

Composer (Cursor agent)

### Completion Notes

- Extracted toolbar policy to `composition-equipe-actions.ts` (`resolveEquipePrimaryAction`, `resolveEquipeToolbarLayout`, `shouldPutShareInOverflow`).
- Équipe toolbar: M3 `mat-flat-button` / `mat-stroked-button`, overflow `more_vert` + `MatMenu` for **Partager** in draft, sticky bar, a11y/test IDs.
- Draft validate hint de-duplicated via `suppressValidateCtaInGuideline` + actions lead.
- Unit tests: 40 passing in `event-equipe-tab.spec.ts`; `composition-equipe-actions` + `composition-equipe-status` specs green.
- Manual recette MVP 01 / 03 / 04 passed (light). Dark/light toggle not in app yet — re-test both themes when theme preference ships.

### File List

- `apps/web/src/app/core/composition/composition-equipe-actions.ts` (new)
- `apps/web/src/app/core/composition/composition-equipe-actions.spec.ts` (new)
- `apps/web/src/app/core/composition/composition-equipe-status.ts`
- `apps/web/src/app/core/composition/composition-equipe-status.spec.ts`
- `apps/web/src/app/pages/event-detail/event-equipe-tab.ts|html|scss`
- `apps/web/src/app/pages/event-detail/event-equipe-tab.spec.ts`
- `_bmad-output/planning-artifacts/ux-design-hatcast-v2.md`

### Change Log

- 2026-05-27: Story created — follow-up to Équipe toolbar quick wins (grid + primary/secondary baseline).
- 2026-05-27: Added M3 compliance section; AC #9–12 (mat-flat / mat-stroked / MatMenu, no custom gradients); Phase 0b.
- 2026-05-27: Implemented — M3 toolbar, overflow, sticky, hint de-dup, tests, UX doc.
- 2026-05-28: Manual recette MVP 01/03/04 (light) OK; story closed. Dark theme QA waived pending theme preference.
