---
id: SPEC-hub-troupe-admin-trigger
companions:
  - scope-admin-menu-trigger.md
  - ../planning-artifacts/ux-design-ma-troupe-hub.md
  - ../../docs/v2/technical/FRONTEND_UI.md
sources: []
---

> **Canonical contract** for replacing the icon-only troupe-hub admin trigger with a labeled **Gérer la troupe** control. Amends UX **MT13** (hero admin affordance) on `/troupes/:slug` only. Implementation landed via quick-dev; this spec records the as-shipped contract for review, regression tests, and future scope extensions (saison / event).

# Hub troupe — labeled admin trigger

## Why

**Opportunity + pain:** On the collective troupe hub, `TROUPE_ADMIN` users had only a settings gear in the hero — low discoverability compared to the validated PO mockup. Organizers need an explicit, member-first entry to troupe administration without leaving the hub or hunting for an icon. The change keeps the same menu and routes while making the affordance readable at a glance on desktop.

## Capabilities

- id: CAP-1
  intent: A `TROUPE_ADMIN` viewing `/troupes/:slug` can open troupe administration from a labeled hero control placed to the right of the troupe logo and name.
  success: When `troupeAdminItems().length > 0`, the hero shows a Material stroked button with icon `settings` and visible French label **Gérer la troupe** inside `.troupe-hub__hero-admin`; non-admins see no admin trigger.

- id: CAP-2
  intent: Opening the labeled trigger exposes the same troupe admin actions and navigation as before the change.
  success: The `mat-menu` lists the same items (Modifier, Nouvelle saison when applicable, Membres, Paramètres, Journal d'audit when authorized) with unchanged `routerLink` / action handlers; no new or removed admin routes.

- id: CAP-3
  intent: On narrow viewports where the member shell fixes the hero admin slot to icon size, the trigger remains usable without overlapping the troupe title.
  success: At viewport width ≤ 839 px the visible label is hidden, the control fits the 3 rem fixed corner slot, and `aria-label="Gérer la troupe"` names the button for assistive tech; menu still opens on activation.

- id: CAP-4
  intent: Other scopes using `app-scope-admin-menu` keep the icon-only trigger unless explicitly configured otherwise.
  success: Season and event headers render the default `triggerVariant="icon"` gear with scope-specific `aria-label`; existing E2E selector `.scope-admin-menu__trigger` still matches the active trigger.

## Constraints

- UI copy for the labeled trigger is exactly **Gérer la troupe** (French, tutoiement context).
- Trigger is an Angular Material button (`mat-stroked-button` for labeled variant), not a custom clickable div.
- Placement stays in the hero (`.troupe-hub__hero-admin`), right-aligned with logo + name — not footer, not season card, not dashboard section header.
- Styling uses `var(--mat-sys-*)` tokens only; follow [FRONTEND_UI.md](../../docs/v2/technical/FRONTEND_UI.md) M3 checklist.
- `ScopeAdminMenu` exposes `triggerVariant: 'icon' | 'stroked'` and optional `triggerLabel`; troupe hub passes `stroked` + **Gérer la troupe**; other call sites unchanged.
- Responsive label hiding uses **839 px** breakpoint to align with `member-shell-mobile-chrome.scss` fixed 3 rem admin slot (see companion).
- Story **17.44** (season mini-chart) is out of scope for this change.

## Non-goals

- Changing admin menu items, permissions, or backend routes.
- Replacing season- or event-scope admin triggers with labeled buttons (future optional reuse of `triggerLabel` only).
- Moving admin entry to footer, season metrics card, or a new hub section.
- Updating sprint tracking or creating a mandatory BMad story file (quick-dev path accepted).

## Success signal

A `TROUPE_ADMIN` opens **Les Improbots** on desktop: the hero shows **Gérer la troupe** next to the troupe name; tapping it opens the familiar admin menu and **Membres** still navigates correctly. On a phone in the member shell, the same corner shows the settings icon only, screen readers hear **Gérer la troupe**, and a member without admin rights never sees the control.

## Assumptions

- **A-1:** `aria-label` duplicates the visible label on desktop (same pattern as `member-agenda-shortcut`) — acceptable for consistency.
