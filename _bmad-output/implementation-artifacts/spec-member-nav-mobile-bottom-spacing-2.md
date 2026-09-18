---
title: 'Lift mobile navigation content visibly'
type: 'bugfix'
created: '2026-09-18'
status: 'done'
route: 'one-shot'
---

# Lift mobile navigation content visibly

## Intent

**Problem:** The prior bottom padding did not visibly move Angular Material's bottom-navigation content on the Pixel 9a.

**Approach:** Offset the icon-and-label group by a single 10 px navigation token while preserving the link touch target and native safe-area behavior.

## Suggested Review Order

- A shared token makes the intended mobile chrome spacing explicit and stable.
  [`member-nav.scss:1`](../../apps/web/src/app/shared/member-nav/member-nav.scss#L1)

- The visible destination group moves independently from its full interactive tab target.
  [`member-nav.scss:221`](../../apps/web/src/app/shared/member-nav/member-nav.scss#L221)
