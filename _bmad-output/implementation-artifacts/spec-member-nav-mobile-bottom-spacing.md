---
title: 'Add breathing space below mobile navigation'
type: 'bugfix'
created: '2026-09-17'
status: 'done'
route: 'one-shot'
---

# Add breathing space below mobile navigation

## Intent

**Problem:** On a Pixel 9a, the bottom navigation icons and labels appear too close to the physical bottom edge when Chrome does not provide a bottom safe-area inset.

**Approach:** Retain a small minimum bottom inset in the shared mobile navigation while preserving larger browser or device safe-area insets.

## Suggested Review Order

- The shared fixed navigation reserves minimum visual space without changing links or touch targets.
  [`member-nav.scss:168`](../../apps/web/src/app/shared/member-nav/member-nav.scss#L168)
