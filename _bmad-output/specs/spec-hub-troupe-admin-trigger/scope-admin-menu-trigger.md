# Scope admin menu — trigger variants

Companion to **SPEC-hub-troupe-admin-trigger**. Load-bearing UI/API detail for `app-scope-admin-menu`.

## Component API

| Input | Type | Default | Role |
|-------|------|---------|------|
| `scope` | `'troupe' \| 'saison' \| 'event'` | required | Drives fallback `aria-label` when no `triggerLabel` |
| `items` | `ScopeAdminMenuItem[]` | required | Menu entries; empty array → no trigger rendered |
| `triggerVariant` | `'icon' \| 'stroked'` | `'icon'` | `icon` = `mat-icon-button` + settings; `stroked` = `mat-stroked-button` + optional label |
| `triggerLabel` | `string \| undefined` | `undefined` | Visible label span; also used as `aria-label` when set |

## Troupe hub usage

```html
<app-scope-admin-menu
  scope="troupe"
  [items]="troupeAdminItems()"
  triggerVariant="stroked"
  triggerLabel="Gérer la troupe"
/>
```

Visibility gate remains on the parent: render only when `troupeAdminItems().length > 0`.

## Responsive behavior

| Viewport | Shell | Trigger appearance |
|----------|-------|-------------------|
| > 839 px | any | Stroked button: `settings` icon + **Gérer la troupe** label |
| ≤ 839 px | `member-shell--with-nav` | Label hidden via CSS; 3 rem × 3 rem icon-only slot (fixed next to account avatar) |
| ≤ 839 px | no fixed chrome | Same CSS — compact icon-only stroked button |

**Breakpoint rationale:** `member-shell-mobile-chrome.scss` fixes `.troupe-hub__hero-admin` to `--member-shell-corner-size` (3 rem) below 839 px. A visible **Gérer la troupe** label cannot fit without overlapping the troupe title. This overrides a naive 480 px-only hide suggested in the original brief.

**Accessibility:** `aria-label="Gérer la troupe"` is always set when `triggerLabel` is provided (mirrors `member-agenda-shortcut`).

## E2E and tests

- Selector **`.scope-admin-menu__trigger`** applies to both variants — preserve in `apps/web/e2e/helpers/e1.ui.ts`.
- Stroked variant adds modifier class **`.scope-admin-menu__trigger--stroked`** for assertions.
- Unit tests: `scope-admin-menu.spec.ts`, `troupe-hub.spec.ts` (labeled text + `aria-label`).
- E2E viewport **≤ 839 px** : `E1-ORG-013` in `orga-stats-audit.desktop.spec.ts` via `expectTroupeHubLabeledAdminTrigger(page, { visibleLabel: false })` (jsdom unit tests do not apply CSS media queries).

## Menu content (unchanged)

Troupe scope items from `troupeAdminItems()` — same as pre-change:

- Modifier (dialog)
- Nouvelle saison (action / dialog)
- Membres (`routerLink`)
- Paramètres (`routerLink`)
- Journal d'audit (`routerLink`, when audit rights)

## M3 checklist (this change)

| Item | Status |
|------|--------|
| Material button (`mat-stroked-button` / `mat-icon-button`) | ✓ |
| `mat-icon` + `settings` | ✓ |
| Tokens `var(--mat-sys-*)` only | ✓ |
| French UI copy | ✓ |
| Touch target ≥ 48 dp in mobile compact mode (3 rem) | ✓ |
| `aria-label` when label hidden | ✓ |
| Reuse shared `scope-admin-menu` | ✓ |
