---
title: 'About page from the user menu'
type: 'feature'
created: '2026-11-08'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
feature_branch: feat/17-47-page-a-propos-menu-utilisateur
baseline_commit: 85f6f56755e9ebfb12783b974bceabc0c3825146
context: []
---

# Story 17.47: About page from the user menu

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** About is currently an account tab even though it describes the application rather than the user account.

**Approach:** Move it to a standalone authenticated page accessible from the user menu. Preserve the existing About functions and redirect the former URL.

## Boundaries & Constraints

**Always:** Retain the version, optional build metadata, changelog, conditional manual update action, its feedback and copyright. Use existing member navigation, Material 3 tokens, responsive layout and accessible controls. Keep `/compte/a-propos` working by redirecting to `/a-propos`.

**Never:** Change account profile, preferences, notifications, authentication, PWA update semantics or unrelated navigation.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected behavior | Error handling |
|---|---|---|---|
| User menu | Authenticated, mobile or desktop | About opens `/a-propos` as a standalone page | Existing authentication guard applies |
| Old URL | `/compte/a-propos` | Redirect to `/a-propos` | Existing guard applies |
| Update check | Available or unavailable | Retain conditional action and existing outcomes | Existing error feedback remains |
| Account | `/compte` and remaining tabs | About tab removed; other tabs function as before | No change |

</frozen-after-approval>

## Code Map

- `apps/web/src/app/app.routes.ts`: member shell and account child routes.
- `apps/web/src/app/shared/user-account-menu/user-account-menu-items.ts`: common user menu on desktop and mobile.
- `apps/web/src/app/pages/account-placeholder/`: existing About view, account tabs, styles and tests.
- `apps/web/src/app/layout/member-shell/member-shell-nav-visibility.ts`: member navigation route allowlist.
- `_bmad-output/planning-artifacts/ux-design-mon-compte.md`: amend obsolete account-tab contract.
- `docs/v2/technical/FRONTEND_UI.md`: mandatory Material 3 checklist.

## Tasks & Acceptance

**Execution:**
- [x] `app.routes.ts`, `user-account-menu-items.ts`, `member-shell-nav-visibility.ts`: provide the standalone route, menu entry, shell navigation and legacy redirect.
- [x] `account-placeholder` and About component: remove the old tab, provide an accessible page title and retain current actions.
- [x] Existing route, account, menu and About specs: update and cover navigation and redirect; verify mobile and desktop.
- [x] Relevant product and UX documentation: amend the navigation contract, keeping spec and planning responsibilities separate.

**Acceptance Criteria:**
- Given an authenticated member, when the user opens About from the user menu, then a dedicated About page is shown outside Mon compte.
- Given `/compte/a-propos`, when opened, then `/a-propos` is shown; remaining account tabs are unchanged.
- Given the About page, when the changelog or update check is used, then existing behavior and feedback are retained.
- Given mobile or desktop, when navigating by touch or keyboard, then controls are accessible, Material 3 compliant and do not overlap the shell.

## Acceptance Criteria — Material 3 (UI)

Use Material menu and controls where applicable, system theme tokens, existing capsule tab styling, and accessible labels and touch targets. Review the checklist in `docs/v2/technical/FRONTEND_UI.md` and document any waiver. Preserve the existing member top bar and desktop rail.

## Implementation Notes

- Delivered the standalone About page, menu ordering and separator, legacy redirect and post-login return support. The optional Advent preview entry remains authorization-gated.
- User accepted the local manual recipe on 2026-11-08. Browser checks covered mobile and desktop, the changelog, the former URL, and gift alignment with simulated Advent availability; they do not prove physical-device rendering or a live PWA update.
- Production build passed with existing Sass and style budget warnings. Targeted Angular suites passed 141 tests; tracker-controller test passed. The PWA update action remains conditional on an enabled service worker and was not exercised against a deployed service worker during local recipe.

## Spec Change Log

## Review Triage Log

## Verification

- Run targeted Angular route, account, menu and About tests and a web build.
- Inspect real rendered mobile and desktop navigation and existing About actions; record coverage gaps.
