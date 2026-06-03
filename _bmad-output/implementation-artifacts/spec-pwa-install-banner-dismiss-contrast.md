---
title: PWA install banner dismiss contrast (light theme)
type: fix
created: 2026-06-02
status: done
route: one-shot
---

# PWA install banner dismiss contrast (light theme)

## Intent

**Problem:** On the PWA install banner (`inverse-surface` background), the dismiss `mat-icon-button` used the default icon token (`on-surface-variant`), which is too low-contrast in light mode — the close icon was nearly invisible.

**Approach:** Scope dismiss styling under `.pwa-system-banner__dismiss` with `--mat-sys-inverse-on-surface` and Material icon-button CSS variables so the close control matches banner text in both light and dark system themes.

## Suggested Review Order

1. [Dismiss control styles](apps/web/src/app/shared/pwa/pwa-system-banner/pwa-system-banner.scss) — token usage and icon inherit
2. [Template class hook](apps/web/src/app/shared/pwa/pwa-system-banner/pwa-system-banner.html) — `pwa-system-banner__dismiss` on dismiss button
3. [Manual recette](apps/web/src/app/shared/pwa/pwa-install-banner/pwa-install-banner.html) — light system theme: banner visible, close icon readable, dismiss still works
